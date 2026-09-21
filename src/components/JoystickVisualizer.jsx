import React from "react"

const JoystickVisualizer = ({ x = 0, y = 0, button = false, connected = false }) => {
  // Limitar valores al rango [-1, 1]
  const clampedX = Math.max(-1, Math.min(1, x))
  const clampedY = Math.max(-1, Math.min(1, y))

  // Calcular distancia del centro para limitar al círculo
  const distance = Math.sqrt(clampedX ** 2 + clampedY ** 2)
  const maxDistance = 1
  
  let finalX = clampedX
  let finalY = clampedY
  
  if (distance > maxDistance) {
    const factor = maxDistance / distance
    finalX = clampedX * factor
    finalY = clampedY * factor
  }

  // Tamaño de la base y el stick (en pixels relativos)
  const baseSize = 200 // px
  const stickSize = 60 // px
  const maxOffset = (baseSize - stickSize) / 2 // 70px
  
  const translateX = finalX * maxOffset
  const translateY = finalY * maxOffset // y=-1 arriba, y=1 abajo; translateY positivo ya mueve hacia abajo en CSS

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6" role="region" aria-label="Visualizador de joystick">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Joystick / Gamepad</h3>
        {connected ? (
          <span className="text-green-400 text-xs font-medium">Conectado</span>
        ) : (
          <span className="text-slate-500 text-xs">Sin datos del dispositivo</span>
        )}
      </div>

      <div className="relative flex flex-col items-center gap-4">
        {/* Base circular + stick */}
        <div
          className="relative"
          style={{ width: baseSize, height: baseSize }}
          role="img"
          aria-label={`Joystick en posición X: ${finalX.toFixed(2)}, Y: ${finalY.toFixed(2)}, botón ${button ? "presionado" : "libre"}`}
        >
          {/* Base circular */}
          <div
            className="rounded-full border-2 border-slate-700 bg-slate-900/50"
            style={{ width: baseSize, height: baseSize }}
            aria-hidden="true"
          >
            {/* Marcas cardinales sutiles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-700 rounded-full" aria-hidden="true" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-slate-700 rounded-full" aria-hidden="true" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-1 bg-slate-700 rounded-full" aria-hidden="true" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1 h-1 bg-slate-700 rounded-full" aria-hidden="true" />
            
            {/* Centro */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full" aria-hidden="true" />
          </div>

          {/* Stick analógico */}
          <div
            className="absolute rounded-full bg-cyan-400/90 border-2 border-cyan-300 shadow-lg transition-transform duration-75 ease-out"
            style={{
              width: stickSize,
              height: stickSize,
              transform: `translate(${translateX}px, ${translateY}px)`,
              left: '50%',
              top: '50%',
              marginLeft: -stickSize / 2,
              marginTop: -stickSize / 2,
            }}
            aria-hidden="true"
          >
            {/* Indicador de dirección en el stick */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" aria-hidden="true" />
          </div>
        </div>

        {/* Valores X/Y */}
        <div className="flex gap-6 text-sm font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">X:</span>
            <span className="font-mono text-white tabular-nums" style={{ minWidth: '60px' }}>
              {finalX.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Y:</span>
            <span className="font-mono text-white tabular-nums" style={{ minWidth: '60px' }}>
              {finalY.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Estado del botón */}
        <div aria-live="polite">
          {button ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-300" aria-hidden="true" />
              Botón: presionado
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-500" aria-hidden="true" />
              Botón: libre
            </span>
          )}
        </div>

        {/* Leyenda de ejes */}
        <div className="text-xs text-slate-500 flex gap-8">
          <span>X: -1 (izq) → 1 (der)</span>
          <span>Y: -1 (arriba) → 1 (abajo)</span>
        </div>
      </div>
    </div>
  )
}

export default JoystickVisualizer