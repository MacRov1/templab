import React, { useEffect, useState } from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"
import useEsp32Realtime from "../hooks/useEsp32Realtime"
import { formatConectado, formatFechaHora, formatTemperatura, formatUptime } from "../utils/format"

const BackLink = ({ label }) => (
  <Link
    to="/registros/"
    className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    {label}
  </Link>
)

// Detalle resuelto en cliente desde el historial real (máx. 6 en localStorage).
// Las páginas estáticas de demo ya no se generan: pageContext solo se conserva
// como respaldo del slug.
const RecordDetailTemplate = ({ pageContext, params }) => {
  const { historial } = useEsp32Realtime()
  // Evita mismatch de hidratación: el historial solo existe en el navegador.
  const [montado, setMontado] = useState(false)
  useEffect(() => {
    setMontado(true)
  }, [])

  const slug = params?.slug ?? pageContext?.slug
  const record = montado ? historial.find(item => item.slug === slug) : undefined
  const uptimeText = record ? formatUptime(record.uptime) : null

  if (!montado || !record) {
    const titulo = !montado ? "Cargando registro…" : "Registro no disponible"
    const texto = !montado
      ? "Buscando el registro entre los últimos recibidos."
      : "Ese registro ya no está entre los últimos 6 recibidos del ESP32 (o aún no llegó)."
    return (
      <Layout title={`${titulo} — TempLab`}>
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-6 text-left">
              <BackLink label="Volver a registros" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{titulo}</h1>
            <p className="text-slate-400 mb-8">{texto}</p>
            <Link
              to="/registros/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              Volver a registros
            </Link>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout
      title={`Registro ${slug} — TempLab`}
      description={`Detalle del registro ${slug} del ESP32.`}
    >
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="mb-6">
              <BackLink label="Volver a registros" />
            </div>
            <h1 className="text-3xl font-bold text-white">Detalle del registro</h1>
            <time dateTime={record.fecha} className="text-slate-400 text-lg mt-2 block">
              {formatFechaHora(record.fecha) === "—"
                ? record.fecha
                : new Date(record.fecha).toLocaleString("es-ES", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </time>
          </header>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
            <dl className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800">
                <dt className="text-slate-400 text-sm font-medium">Temperatura interna del ESP32</dt>
                <dd className="text-2xl font-bold text-white mt-2 sm:mt-0">{formatTemperatura(record.temperatura)}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800">
                <dt className="text-slate-400 text-sm font-medium">Conexión a Internet</dt>
                <dd className="text-white font-medium mt-2 sm:mt-0">{formatConectado(record.internet)}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800">
                <dt className="text-slate-400 text-sm font-medium">Bluetooth</dt>
                <dd className="text-white font-medium mt-2 sm:mt-0">{formatConectado(record.bluetooth)}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
                <dt className="text-slate-400 text-sm font-medium">Uptime</dt>
                <dd className="text-white font-medium mt-2 sm:mt-0">{uptimeText ?? "—"}</dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-slate-800 text-sm text-slate-500">
              <p>
                Registro real recibido del ESP32 vía MQTT y guardado localmente
                entre los últimos 6.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/registros/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Volver a registros
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default RecordDetailTemplate
