import React from "react"
import { Link } from "gatsby"

const RecordCard = ({ record }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <article className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <time dateTime={record.fecha} className="text-slate-400 text-sm font-mono whitespace-nowrap">
          {formatDate(record.fecha)}
        </time>
        <Link
          to={`/registros/${record.slug}/`}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors whitespace-nowrap"
        >
          Ver detalle
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Temperatura</dt>
          <dd className="text-white font-medium">{record.temperatura} °C</dd>
        </div>
        <div>
          <dt className="text-slate-500">Internet</dt>
          <dd className="text-white font-medium">{record.internet}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Bluetooth</dt>
          <dd className="text-white font-medium">{record.bluetooth}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Uptime</dt>
          <dd className="text-white font-medium">{record.uptime}</dd>
        </div>
      </dl>
    </article>
  )
}

export default RecordCard