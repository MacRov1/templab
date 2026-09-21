import React from "react"
import { Link } from "gatsby"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-slate-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-white font-bold text-xl tracking-tight">
            <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="#1a1a2e" stroke="#00d9ff" strokeWidth="1.5"/>
              <path d="M16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16C8 11.6 11.6 8 16 8Z" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V16L19 18" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>TempLab</span>
          </div>

          <nav aria-label="Navegación del pie de página" className="flex space-x-6">
            <Link to="/" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Inicio</Link>
            <Link to="/registros/" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Registros</Link>
          </nav>

          <p className="text-slate-500 text-sm">
            © {currentYear} TempLab — Proyecto académico con Gatsby
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer