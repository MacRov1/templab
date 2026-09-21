import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Inicio", to: "/" },
    { label: "Registros", to: "/registros/" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 shadow-lg"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-white font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
            aria-label="TempLab - Inicio"
          >
            <svg
              className="w-8 h-8 text-cyan-400"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="6" fill="#1a1a2e" stroke="#00d9ff" strokeWidth="1.5"/>
              <path d="M16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24C11.6 24 8 20.4 8 16C8 11.6 11.6 8 16 8Z" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V16L19 18" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>TempLab</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-slate-300 hover:text-cyan-400 font-medium text-sm transition-colors relative py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 origin-bottom-left scale-x-0 hover:scale-x-100 transition-transform duration-300" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"}`}
          role="navigation"
          aria-label="Menú móvil"
        >
          <div className="pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg font-medium text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar