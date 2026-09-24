// Formateo de presentación para datos del ESP32 (no alteran los valores).

// 83 -> "1m 23s", 3600 -> "1h 0m", 7265 -> "2h 1m 5s". null si inválido.
export function formatUptime(totalSeconds) {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return null
  }
  const s = Math.floor(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0 || h > 0) parts.push(`${m}m`)
  if (sec > 0 || parts.length === 0) parts.push(`${sec}s`)
  return parts.join(" ")
}

// ISO -> "18/09/2026 19:38". "—" si inválido.
export function formatFechaHora(fecha) {
  if (typeof fecha !== "string" || !fecha) return "—"
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// true -> "Conectado", false -> "Desconectado", otro -> "—" (sin datos ≠ false)
export function formatConectado(valor) {
  if (valor === true) return "Conectado"
  if (valor === false) return "Desconectado"
  return "—"
}

// 62.77778 -> "62.8 °C". "—" si inválido (nunca 0 inventado).
export function formatTemperatura(valor) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return "—"
  return `${valor.toFixed(1)} °C`
}
