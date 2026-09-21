import React, { useState, useMemo } from "react"
import Layout from "../../components/Layout"
import RecordCard from "../../components/RecordCard"
import records from "../../data/records.json"

const RecordsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records
    const query = searchQuery.toLowerCase().trim()
    return records.filter((record) =>
      Object.values(record).some((val) =>
        String(val).toLowerCase().includes(query)
      )
    )
  }, [searchQuery, records])

  if (records.length === 0) {
    return (
      <Layout
        title="Registros — TempLab"
        description="Listado de registros históricos del ESP32 con búsqueda local."
      >
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                Registros históricos
              </h1>
              <p className="text-slate-400 text-lg">
                Listado de capturas de datos realizadas por el ESP32.
              </p>
            </header>
            <div className="text-center py-12 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">No hay registros disponibles.</p>
              <p className="text-sm text-slate-500 mt-2">
                Los registros aparecerán aquí cuando el ESP32 envíe datos.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout
      title="Registros — TempLab"
      description="Listado de registros históricos del ESP32 con búsqueda local."
    >
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Registros históricos
            </h1>
            <p className="text-slate-400 text-lg">
              Listado de capturas de datos realizadas por el ESP32.
            </p>
          </header>

          <div className="mb-8" role="search" aria-label="Búsqueda de registros">
            <label htmlFor="records-search" className="sr-only">
              Buscar registros
            </label>
            <div className="relative max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="records-search"
                type="search"
                placeholder="Buscar registro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                aria-label="Buscar registros por fecha, temperatura, estado de internet, bluetooth o uptime"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-slate-500">
                Mostrando {filteredRecords.length} de {records.length} registros
              </p>
            )}
          </div>

          <div className="space-y-4" role="list" aria-label="Registros históricos">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">No se encontraron registros con la búsqueda actual</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default RecordsPage