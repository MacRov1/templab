import React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"
import RecordCard from "../components/RecordCard"
import JoystickVisualizer from "../components/JoystickVisualizer"
import CurrentDataCard from "../components/CurrentDataCard"
import useEsp32Realtime from "../hooks/useEsp32Realtime"
import device from "../data/device.json"
import { formatUptime } from "../utils/format"

const HomePage = () => {
  // Una única suscripción MQTT: joystick.*, estado.*, registro e historial
  // de últimos registros reales (máx. 6, persistido en localStorage).
  const { joystick, estado, registro, historial, connection } = useEsp32Realtime()
  const features = [
    { label: "Wi-Fi integrado", icon: "wifi" },
    { label: "Bluetooth integrado", icon: "bluetooth" },
    { label: "Procesador de doble núcleo", icon: "cpu" },
    { label: "Sensor de temperatura interno", icon: "thermometer" },
  ]

  const FeatureIcon = ({ name }) => {
    const icons = {
      wifi: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bluetooth: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      cpu: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      thermometer: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
    }
    return icons[name] || icons.wifi
  }

  const lastRecords = historial.slice(0, 3)

  // FASE 3: tarjetas vivas desde templab/esp32/estado.
  // Sin datos todavía → "—" (nunca 0 ni "Desconectado" inventados).
  const uptimeText = formatUptime(estado.uptime)
  const estadoCards = [
    {
      id: "temperatura",
      label: "Temperatura",
      value: estado.temperatura != null ? estado.temperatura.toFixed(1) : "—",
      unit: estado.temperatura != null ? "°C" : "",
      icon: <FeatureIcon name="thermometer" />,
    },
    {
      id: "internet",
      label: "Internet",
      value:
        estado.internet === true
          ? "Conectado"
          : estado.internet === false
            ? "Desconectado"
            : "—",
      unit: "",
      icon: <FeatureIcon name="wifi" />,
    },
    {
      id: "bluetooth",
      label: "Bluetooth",
      value:
        estado.bluetooth === true
          ? "Conectado"
          : estado.bluetooth === false
            ? "Desconectado"
            : "—",
      unit: "",
      icon: <FeatureIcon name="bluetooth" />,
    },
    {
      id: "mac",
      label: "MAC",
      value: estado.mac ?? "—",
      unit: "",
      icon: <FeatureIcon name="cpu" />,
      wide: true,
    },
    {
      id: "uptime",
      label: "Uptime",
      value: uptimeText ?? "—",
      unit: "",
      icon: <FeatureIcon name="cpu" />,
    },
  ]

  return (
    <Layout
      title="TempLab — Monitor simple de un ESP32"
      description="Visualiza datos actuales de un ESP32 y consulta registros históricos."
    >
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              TempLab
            </h1>
            <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto">
              Monitor simple de un ESP32
            </p>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
              Este sitio permite visualizar información básica del dispositivo, consultar datos actuales
              y revisar registros históricos enviados por el ESP32.
            </p>
          </header>

          <section aria-labelledby="features-heading" className="mb-12 sm:mb-16">
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
              Características del ESP32
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-center hover:border-slate-700 transition-colors"
                >
                  <div className="text-cyan-400 mb-3" aria-hidden="true">
                    <FeatureIcon name={feature.icon} />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">{feature.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="current-state-heading" className="mb-12 sm:mb-16">
            <h2 id="current-state-heading" className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
              Estado actual
            </h2>
            {/* FASE 1: indicador mínimo de conexión MQTT en vivo (temporal, para verificación). */}
            <div className="flex justify-center mb-6" role="status" aria-live="polite">
              {connection.connected ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
                  ESP32 conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                  Esperando conexión…
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
              {/* Estado actual del ESP32 (en vivo desde templab/esp32/estado) */}
              <div className="flex flex-col h-full">
                <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-4">Estado del ESP32</h3>
                {/* 2×2: las cards son items directos del grid y comparten filas
                    de igual alto (auto-rows-fr), rellenando la altura disponible */}
                <div className="grid grid-cols-2 auto-rows-fr gap-2 sm:gap-3 flex-1">
                  {estadoCards.filter(card => !card.wide).map(card => (
                    <CurrentDataCard
                      key={card.id}
                      id={card.id}
                      label={card.label}
                      value={card.value}
                      unit={card.unit}
                      icon={card.icon}
                    />
                  ))}
                </div>
                {/* MAC: ancho completo, altura natural */}
                <div className="mt-2 sm:mt-3">
                  {estadoCards.filter(card => card.wide).map(card => (
                    <CurrentDataCard
                      key={card.id}
                      id={card.id}
                      label={card.label}
                      value={card.value}
                      unit={card.unit}
                      icon={card.icon}
                    />
                  ))}
                </div>
                {!connection.connected && (
                  <p className="text-slate-500 text-sm mt-4 text-center">
                    Esperando datos del dispositivo…
                  </p>
                )}
              </div>

              {/* Visualizador de Joystick (mismos datos vivos en desktop y móvil).
                  La columna ocupa toda la altura de la fila y centra el panel,
                  equilibrándola con el bloque izquierdo sin alturas fijas. */}
              <div className="hidden lg:flex lg:flex-col lg:justify-center h-full">
                <JoystickVisualizer
                  x={joystick.x}
                  y={joystick.y}
                  button={joystick.button}
                  connected={connection.connected}
                />
              </div>
            </div>
            
            {/* Versión mobile: joystick debajo del estado (mismos datos vivos) */}
            <div className="lg:hidden mt-6">
              <JoystickVisualizer
                x={joystick.x}
                y={joystick.y}
                button={joystick.button}
                connected={connection.connected}
              />
            </div>
          </section>

          {/* FASE 4.1 (temporal): último registro en vivo desde templab/esp32/registro.
              No persiste nada ni modifica los registros históricos demo. */}
          <section aria-labelledby="live-registro-heading" className="mb-12">
            <div className="max-w-3xl mx-auto">
              <h2 id="live-registro-heading" className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Último registro recibido
              </h2>
              {!registro ? (
                <p className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
                  Esperando registro…
                </p>
              ) : (
                <dl className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Fecha y hora</dt>
                    <dd className="text-white font-medium">
                      {typeof registro.fecha === "string" && registro.fecha
                        ? new Date(registro.fecha).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Temperatura interna del ESP32</dt>
                    <dd className="text-white font-medium">
                      {typeof registro.temperatura === "number" && Number.isFinite(registro.temperatura)
                        ? `${registro.temperatura.toFixed(1)} °C`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Conexión a Internet</dt>
                    <dd className="text-white font-medium">
                      {registro.internet === true
                        ? "Conectado"
                        : registro.internet === false
                          ? "Desconectado"
                          : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Bluetooth</dt>
                    <dd className="text-white font-medium">
                      {registro.bluetooth === true
                        ? "Conectado"
                        : registro.bluetooth === false
                          ? "Desconectado"
                          : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">MAC</dt>
                    <dd className="text-white font-medium font-mono">
                      {typeof registro.mac === "string" && registro.mac ? registro.mac : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Uptime</dt>
                    <dd className="text-white font-medium">
                      {formatUptime(registro.uptime) ?? "—"}
                    </dd>
                  </div>
                </dl>
              )}
              <p className="text-slate-500 text-xs mt-3 text-center">
                Datos en vivo desde templab/esp32/registro. No se guardan ni modifican los registros históricos.
              </p>
            </div>
          </section>

          {historial.length > 0 && (
            <section aria-labelledby="last-records-heading" className="mb-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 id="last-records-heading" className="text-2xl sm:text-3xl font-bold text-white">
                  Últimos registros
                </h2>
                <Link
                  to="/registros/"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Ver todos los registros
                </Link>
              </div>
              {!connection.connected && (
                <p className="text-slate-500 text-sm mb-4 text-center">
                  Mostrando registros guardados localmente (sin conexión en vivo).
                </p>
              )}
              <div className="space-y-3 max-w-3xl mx-auto">
                {lastRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </Layout>
  )
}

export default HomePage