import React from "react"

/**
 * Límite de errores: evita que una excepción inesperada en el render
 * deje toda la página en blanco. Muestra un aviso coherente con el
 * sitio y permite recargar. No oculta errores: siguen visibles en consola.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("[TempLab] Error capturado por ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-12"
          role="alert"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Ocurrió un error inesperado
          </h2>
          <p className="text-slate-400 mb-6 max-w-md">
            Algo falló al mostrar esta página. El resto del sitio sigue
            disponible; probá recargar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700 hover:border-cyan-500/50 transition-colors"
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
