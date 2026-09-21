# TempLab

**Monitor de un ESP32 con sitio estático + datos en tiempo real**

Sitio web desarrollado con Gatsby que presenta información estructurada de un dispositivo ESP32 y sus registros, con búsqueda local en JavaScript e integración en tiempo real vía MQTT para visualizar datos del ESP32 durante la demostración local.

## Objetivo

- Contenido estructurado (dispositivo + registros) generado como páginas estáticas.
- Navegación entre listado y detalle de registros.
- Búsqueda local como interacción JavaScript requerida.
- Visualización en tiempo real de joystick, estado y último registro del ESP32.

## Tecnologías

- **Gatsby 5** — generador de sitios estáticos (SSG).
- **React 18 + JavaScript** — interfaz e interacciones de cliente.
- **Tailwind CSS v4** — estilos (vía PostCSS).
- **MQTT.js (`mqtt`)** — cliente MQTT sobre WebSocket en el navegador.
- **Mosquitto** — broker MQTT local (TCP + WebSocket).
- **ESP32 (Arduino Framework) + PlatformIO** — firmware del dispositivo.

## Entidades de contenido

### Dispositivo (`src/data/device.json`, 1 registro)

| Campo | Descripción |
| ----- | ----------- |
| `nombre` | ESP32 DevKit V1 |
| `modelo` | ESP32-WROOM-32D |
| `mac` | Placeholder (`XX:XX:XX:XX:XX:XX`; la MAC real llega por MQTT) |
| `descripcion` | Características del microcontrolador |

### Registro (`src/data/records.json`, 6 registros)

| Campo | Descripción |
| ----- | ----------- |
| `id` / `slug` | Identificador y ruta (`registro-1` … `registro-6`) |
| `fecha` | Timestamp ISO 8601 |
| `temperatura` | Número en °C (sensor interno del chip) |
| `internet` | Texto (`"Conectado"`) |
| `bluetooth` | Texto (`"Disponible"`) |
| `uptime` | Texto (ej. `"2h 10m"`) |

Los 6 registros son **contenido estático ficticio de demostración**. No son mensajes MQTT ni mediciones reales del dispositivo.

## Estructura del sitio

| Ruta | Contenido |
| ---- | --------- |
| `/` | Hero, características del ESP32, estado en vivo, joystick en vivo, último registro en vivo, últimos registros históricos |
| `/registros/` | Listado de los 6 registros con búsqueda local |
| `/registros/registro-N/` | Detalle de cada registro + volver al listado |
| `/404/` | Página de error |

## Generación estática

```
records.json → Gatsby (build) → /registros + 6 detalles
```

`gatsby-source-filesystem` + `gatsby-transformer-json` exponen los registros; `gatsby-node.js` crea una página por registro con `createPage`. No hay backend ni base de datos.

## Búsqueda local (interacción requerida)

`/registros/` incluye un campo "Buscar registro..." que filtra en el navegador (`useState` + `useMemo` + `filter` sobre todos los campos del registro, insensible a mayúsculas, con `trim()` y coincidencia parcial). Sin requests, sin backend, sin recarga; con contador de resultados y mensaje de "sin resultados". Esta es la interacción JavaScript de la consigna.

## Integración ESP32 + MQTT

```
ESP32 → MQTT → Mosquitto → WebSocket → MQTT.js (useEsp32Realtime) → Home
```

El hook `src/hooks/useEsp32Realtime.js` (único cliente, creado en `useEffect` para SSR, con validación JSON, reconexión automática y cleanup) expone `{ joystick, estado, registro, connection }`. La Home lo consume con una sola llamada.

## Topics MQTT

### `templab/esp32/joystick` (≈ cada 50 ms)
`{ "x": 0.75, "y": -0.40, "button": false }` — `x`/`y` en `[-1, 1]` (`-1` = izquierda/arriba), `button` booleano. Mueve el `JoystickVisualizer` (ambas instancias desktop/móvil comparten el mismo estado).

### `templab/esp32/estado` (≈ cada 5 s)
`{ "temperatura": 62.77, "internet": true, "bluetooth": true, "mac": "1C:9D:C2:63:D5:EC", "uptime": 83 }` — alimenta las 5 tarjetas (temperatura a 1 decimal, booleanos a Conectado/Desconectado, MAC exacta, uptime en segundos convertido a `1m 23s` / `1h 0m`).

### `templab/esp32/registro` (≈ cada 10 min)
`{ "fecha", "temperatura", "internet", "bluetooth", "mac", "uptime" }` — se muestra en "Último registro recibido" (solo el último en memoria).

## Datos estáticos vs. dinámicos

- **Estático** (`src/data/*.json`, procesado en build): ficha del dispositivo, 6 registros demo, páginas, estilos, SEO.
- **Dinámico** (navegador, vía WebSocket): joystick, estado, último registro. Viven solo en memoria React: **no se escriben en `records.json`, no se persisten ni sobreviven a recargas**, y requieren ESP32 + Mosquitto disponibles en la misma red local.

## Configuración del ESP32

Las credenciales no están en `main.cpp`: viven en `esp32/src/config.h` (solo local, **ignorado por Git**). Para otro entorno, copiar `esp32/src/config.example.h` como `config.h` y completar los valores. No commitear secretos.

## Ejecución local

```bash
npm install
npm run develop   # http://localhost:8000
npm run build     # genera public/
npm run serve     # sirve el build
```

Demostración en vivo requiere: ESP32 encendido y programado, Mosquitto con listener MQTT (1883) y WebSocket (9001), y navegador en la misma red local (desarrollo: `ws://192.168.1.8:9001`).

## Firmware (`esp32/`, PlatformIO)

- Joystick: `VRX → GPIO 34`, `VRY → GPIO 35`, `SW → GPIO 25` (pull-up, activo en LOW), VCC a 3V3. Pines ADC1, compatibles con WiFi.
- Calibración automática del centro al arrancar, deadzone, promedio móvil, normalización `[-1, 1]` con Y invertido (`-1` = arriba).
- Temperatura interna del chip (`temperatureRead()`), MAC real, NTP (UTC-3), reconexión WiFi/MQTT.
- Compilar/cargar: `pio run`, `pio run -t upload`, `pio device monitor` (desde `esp32/`).

## Responsive y accesibilidad

Diseño mobile-first (grillas `grid-cols-1` → `lg:grid-cols-2`, navbar hamburguesa). La búsqueda usa `role="search"`, `label` asociado y `aria-label`; el joystick expone `aria-label` con su posición.

## URL de demostración

URL de demostración: pendiente de publicación.

## Proveedor MQTT

Mosquitto **local** (no cloud): el ESP32 publica por TCP y el navegador se suscribe por WebSocket en la red local. Sin internet no hay datos en vivo; el sitio estático y la búsqueda siguen funcionando.

## Estado del proyecto

Implementado y verificado con `gatsby build`: contenido estático + búsqueda local + las tres integraciones en vivo (joystick, estado, último registro). Mejora futura posible: persistir o historiar registros MQTT (hoy solo se conserva el último en memoria).
