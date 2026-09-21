import React from "react"

const CurrentDataCard = ({ label, value, unit, icon, id }) => {
  return (
    <article
      id={id}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center hover:border-slate-700 transition-colors"
      role="region"
      aria-label={label}
    >
      <div className="text-cyan-400 mb-3" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-slate-300 text-sm font-medium uppercase tracking-wider mb-2">{label}</h3>
      <div className="text-3xl sm:text-4xl font-bold text-white">
        <span id={`${id}-value`}>{value}</span>
        {unit && <span className="text-lg font-normal text-slate-400 ml-1">{unit}</span>}
      </div>
    </article>
  )
}

export default CurrentDataCard