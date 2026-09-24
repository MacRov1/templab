// Historial de últimos registros reales del ESP32 (máx. 6) con persistencia local.
// Sin backend ni base de datos: solo memoria React + localStorage del navegador.

export const HISTORIAL_MAX = 6
export const HISTORIAL_STORAGE_KEY = "templab:registros"

// "2026-09-23T19:38:00" -> "2026-09-23t19-38-00" (apto para URL)
export function slugifyFecha(fecha) {
  const slug = String(fecha || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
  return slug || "registro"
}

// Validación mínima: objeto con fecha utilizable como identificador
export function esRegistroValido(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof data.fecha === "string" &&
    data.fecha.length > 0
  )
}

// Conserva todos los campos originales y agrega id/slug derivados de fecha
export function normalizarRegistro(data) {
  const slug = slugifyFecha(data.fecha)
  return { ...data, id: slug, slug }
}

// Agrega al inicio, dedupe por fecha, tope HISTORIAL_MAX.
// Retorna { historial, agregado } sin mutar el array recibido.
export function agregarAlHistorial(historial, data) {
  const actual = Array.isArray(historial) ? historial : []
  if (!esRegistroValido(data)) {
    return { historial: actual.slice(0, HISTORIAL_MAX), agregado: false }
  }
  const nuevo = normalizarRegistro(data)
  if (actual.some(item => item && item.fecha === nuevo.fecha)) {
    return { historial: actual.slice(0, HISTORIAL_MAX), agregado: false }
  }
  return { historial: [nuevo, ...actual].slice(0, HISTORIAL_MAX), agregado: true }
}

// Lectura segura (SSR: window no existe durante el build de Gatsby)
export function cargarHistorial() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return []
    const raw = window.localStorage.getItem(HISTORIAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(esRegistroValido).map(normalizarRegistro).slice(0, HISTORIAL_MAX)
  } catch {
    return []
  }
}

export function guardarHistorial(historial) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false
    const lista = Array.isArray(historial) ? historial.slice(0, HISTORIAL_MAX) : []
    window.localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(lista))
    return true
  } catch {
    return false
  }
}
