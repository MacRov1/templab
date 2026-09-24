import React from "react"
import { Link } from "gatsby"
import { formatConectado, formatFechaHora, formatTemperatura, formatUptime } from "../utils/format"

const RecordCard = ({ record }) => {
  const uptimeText = formatUptime(record.uptime)

  return (
    <article className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <time dateTime={record.fecha} className="text-slate-400 text-sm font-mono whitespace-nowrap">
          {formatFechaHora(record.fecha)}
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
          <dd className="text-white font-medium">{formatTemperatura(record.temperatura)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Internet</dt>
          <dd className="text-white font-medium">{formatConectado(record.internet)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Bluetooth</dt>
          <dd className="text-white font-medium">{formatConectado(record.bluetooth)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Uptime</dt>
          <dd className="text-white font-medium">{uptimeText ?? "—"}</dd>
        </div>
      </dl>
    </article>
  )
}

export default RecordCard