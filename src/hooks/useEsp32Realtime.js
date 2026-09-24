import { useEffect, useRef, useState } from "react"
import mqtt from "mqtt"
import { agregarAlHistorial, cargarHistorial, guardarHistorial } from "../utils/historial"

// FASE 1: conexión MQTT sobre WebSocket (solo desarrollo en LAN).
// Broker Mosquitto local: ws://192.168.1.8:9001
const MQTT_WS_URL = "ws://192.168.1.8:9001"
const TOPICS = [
  "templab/esp32/joystick",
  "templab/esp32/estado",
  "templab/esp32/registro",
]

const initialJoystick = { x: 0, y: 0, button: false }
const initialEstado = {
  temperatura: null,
  internet: null,
  bluetooth: null,
  mac: null,
  uptime: null,
}

function isValidJoystick(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    typeof data.x === "number" &&
    typeof data.y === "number" &&
    typeof data.button === "boolean" &&
    Number.isFinite(data.x) &&
    Number.isFinite(data.y)
  )
}

function isValidEstado(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    typeof data.temperatura === "number" &&
    Number.isFinite(data.temperatura) &&
    typeof data.internet === "boolean" &&
    typeof data.bluetooth === "boolean" &&
    typeof data.mac === "string" &&
    typeof data.uptime === "number" &&
    Number.isFinite(data.uptime)
  )
}

function isValidRegistro(data) {
  return data !== null && typeof data === "object" && !Array.isArray(data)
}

/**
 * Hook único responsable de la conexión MQTT con el ESP32.
 * - Solo se conecta en el navegador (dentro de useEffect, seguro para Gatsby/SSR).
 * - Un único cliente por montaje, con cleanup que cierra la conexión.
 * - Reintenta automáticamente (reconnectPeriod).
 * - Ignora payloads inválidos sin romper la app.
 */
export default function useEsp32Realtime() {
  const [joystick, setJoystick] = useState(initialJoystick)
  const [estado, setEstado] = useState(initialEstado)
  const [registro, setRegistro] = useState(null)
  // Historial de últimos registros reales (máx. 6, persistido en localStorage).
  // Inicia vacío para coincidir con el HTML de build (SSR) y se carga en efecto.
  const [historial, setHistorial] = useState([])
  const [connection, setConnection] = useState({
    connected: false,
    lastMessageAt: null,
  })
  const clientRef = useRef(null)

  // Restaura lo guardado al montar (solo navegador).
  useEffect(() => {
    setHistorial(cargarHistorial())
  }, [])

  useEffect(() => {
    // Gatsby/SSR: no existe window durante el build, salir sin conectar.
    if (typeof window === "undefined") return undefined

    // Evita crear un segundo cliente si el efecto se re-ejecuta sin cleanup previo.
    if (clientRef.current) return undefined

    // HTTPS + ws:// es mixed content: el navegador lanzaría SecurityError
    // síncrono y desmontaría React. En ese caso no se intenta conectar y
    // la app sigue funcionando sin datos en vivo.
    if (
      window.location.protocol === "https:" &&
      MQTT_WS_URL.startsWith("ws://")
    ) {
      console.warn(
        "[MQTT] Página HTTPS con broker ws://: conexión omitida (mixed content). " +
          "El sitio sigue funcionando sin datos en vivo."
      )
      return undefined
    }

    let client
    try {
      console.log("[MQTT] Conectando a", MQTT_WS_URL)
      client = mqtt.connect(MQTT_WS_URL, {
        reconnectPeriod: 3000,
        connectTimeout: 5000,
        clean: true,
        clientId: `templab-web-${Math.random().toString(16).slice(2, 10)}`,
      })
    } catch (err) {
      console.error("[MQTT] No se pudo crear el cliente:", err?.message || err)
      setConnection(prev => ({ ...prev, connected: false }))
      return undefined
    }
    clientRef.current = client

    const handleConnect = () => {
      console.log("[MQTT] Conectado. Suscribiendo a:", TOPICS.join(", "))
      try {
        client.subscribe(TOPICS, err => {
          if (err) {
            console.error("[MQTT] Error al suscribirse:", err)
            return
          }
          console.log("[MQTT] Suscripción OK:", TOPICS.join(", "))
        })
      } catch (err) {
        console.error("[MQTT] Error al suscribirse:", err?.message || err)
      }
      setConnection(prev => ({ ...prev, connected: true }))
    }

    const handleMessage = (topic, payloadBuffer) => {
      const raw = payloadBuffer.toString()
      console.log("[MQTT] Mensaje recibido | topic:", topic, "| payload:", raw)

      let data
      try {
        data = JSON.parse(raw)
      } catch (err) {
        console.warn("[MQTT] Payload JSON inválido, ignorado | topic:", topic)
        return
      }

      if (topic === "templab/esp32/joystick") {
        if (!isValidJoystick(data)) {
          console.warn("[MQTT] Joystick inválido, ignorado:", data)
          return
        }
        setJoystick({ x: data.x, y: data.y, button: data.button })
      } else if (topic === "templab/esp32/estado") {
        if (!isValidEstado(data)) {
          console.warn("[MQTT] Estado inválido, ignorado:", data)
          return
        }
        setEstado({
          temperatura: data.temperatura,
          internet: data.internet,
          bluetooth: data.bluetooth,
          mac: data.mac,
          uptime: data.uptime,
        })
      } else if (topic === "templab/esp32/registro") {
        if (!isValidRegistro(data)) {
          console.warn("[MQTT] Registro inválido, ignorado:", data)
          return
        }
        setRegistro(data)
        setHistorial(prev => {
          const { historial: next, agregado } = agregarAlHistorial(prev, data)
          if (agregado) guardarHistorial(next)
          return agregado ? next : prev
        })
      } else {
        return
      }

      setConnection({ connected: true, lastMessageAt: Date.now() })
    }

    const handleClose = () => {
      console.warn("[MQTT] Conexión cerrada, reintentando…")
      setConnection(prev => ({ ...prev, connected: false }))
    }

    const handleOffline = () => {
      console.warn("[MQTT] Cliente offline, reintentando…")
      setConnection(prev => ({ ...prev, connected: false }))
    }

    const handleError = err => {
      console.error("[MQTT] Error:", err?.message || err)
      setConnection(prev => ({ ...prev, connected: false }))
    }

    client.on("connect", handleConnect)
    client.on("message", handleMessage)
    client.on("close", handleClose)
    client.on("offline", handleOffline)
    client.on("error", handleError)

    // Cleanup: cierra la única conexión al desmontar (evita duplicadas/recargas).
    return () => {
      console.log("[MQTT] Cerrando conexión (cleanup)")
      client.removeListener("connect", handleConnect)
      client.removeListener("message", handleMessage)
      client.removeListener("close", handleClose)
      client.removeListener("offline", handleOffline)
      client.removeListener("error", handleError)
      client.end(true)
      clientRef.current = null
    }
  }, [])

  return { joystick, estado, registro, historial, connection }
}
