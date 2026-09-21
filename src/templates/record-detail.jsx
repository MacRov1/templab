import React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"

const RecordDetailTemplate = ({ pageContext }) => {
  const { slug } = pageContext
  const record = pageContext.record

  if (!record) {
    return (
      <Layout title="Registro no encontrado — TempLab">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Registro no encontrado</h1>
            <Link
              to="/registros/"
              className="text-cyan-400 hover:text-cyan-300 inline-block"
            >
              Volver a registros
            </Link>
          </div>
        </section>
      </Layout>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Layout
      title={`Registro ${slug} — TempLab`}
      description={`Detalle del registro ${slug} del ESP32.`}
    >
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <Link
              to="/registros/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a registros
            </Link>
            <h1 className="text-3xl font-bold text-white">Detalle del registro</h1>
            <time dateTime={record.fecha} className="text-slate-400 text-lg mt-2 block">
              {formatDate(record.fecha)}
            </time>
          </header>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
            <dl className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800">
                <dt className="text-slate-400 text-sm font-medium">Temperatura interna del ESP32</dt>
                <dd className="text-2xl font-bold text-white mt-2 sm:mt-0">{record.temperatura} °C</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800">
                <dt className="text-slate-400 text-sm font-medium">Conexión a Internet</dt>
                <dd className="text-white font-medium mt-2 sm:mt-0">{record.internet}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-slate-800">
                <dt className="text-slate-400 text-sm font-medium">Bluetooth</dt>
                <dd className="text-white font-medium mt-2 sm:mt-0">{record.bluetooth}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
                <dt className="text-slate-400 text-sm font-medium">Uptime</dt>
                <dd className="text-white font-medium mt-2 sm:mt-0">{record.uptime}</dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-slate-800 text-sm text-slate-500">
              <p>
                <strong>Nota:</strong> Estos son datos de demostración. No fueron obtenidos
                de un ESP32 físico conectado en tiempo real.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/registros/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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