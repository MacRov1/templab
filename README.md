# TempLab

Sitio estático desarrollado con Gatsby que muestra información de un ESP32 y registros reales recibidos mediante MQTT.

## Tecnologías principales

- **Gatsby 5** — generador de sitios estáticos.
- **React 18 + JavaScript** — interfaz e interacciones.
- **Tailwind CSS** — estilos.
- **MQTT.js** — cliente MQTT en el navegador.
- **ESP32** (Arduino Framework, PlatformIO) — dispositivo que publica los datos.
- **Mosquitto** — broker MQTT local; el navegador se conecta por **WebSocket**.

## Entidades de contenido

### Dispositivo (`src/data/device.json`)
- Campos: `nombre`, `modelo`, `mac`, `descripcion`.
- 1 registro: ficha estática del ESP32.

### Registro (dinámico, sin archivo JSON)
- Llega desde el ESP32 por MQTT (`templab/esp32/registro`).
- Campos: `fecha`, `temperatura`, `internet`, `bluetooth`, `mac`, `uptime`.
- Se conserva en `localStorage` del navegador (`templab:registros`), **máximo 6**; al llegar el séptimo se elimina el más antiguo.

## Arquitectura de datos

```
ESP32 → MQTT → Mosquitto → WebSocket → navegador → React → localStorage
```

- MQTT (ESP32 → Mosquitto): puerto **1883**.
- WebSocket (navegador → Mosquitto): puerto **9001**.
- El broker funciona en la red local. No hay base de datos ni backend.

## Topics MQTT

- `templab/esp32/joystick` (~50 ms): `{ x, y, button }` — posición y botón; mueve el visualizador.
- `templab/esp32/estado` (~5 s): `{ temperatura, internet, bluetooth, mac, uptime }` — alimenta las tarjetas.
- `templab/esp32/registro` (~10 min): `{ fecha, temperatura, internet, bluetooth, mac, uptime }` — entra al historial (dedupe por `fecha`).

## Sitio

| Ruta | Contenido |
| ---- | --------- |
| `/` | Hero, características, estado y joystick en vivo, último registro, últimos registros |
| `/registros` | Listado del historial con búsqueda local |
| `/registros/[slug]` | Detalle resuelto en cliente desde el historial (avisa si ya no está entre los 6) |

Navegación Inicio/Registros + volver, responsive mobile-first.

## Interacción JavaScript

`/registros` incluye **búsqueda local**: `useState` guarda el texto, `useMemo` filtra con `filter`/`includes` insensible a mayúsculas sobre todos los campos, sin requests ni recarga, con contador y mensaje de sin-resultados. Aporta al contenido porque permite localizar registros.

## Qué queda estático y qué hace JavaScript

**Estático** (build de Gatsby): estructura, páginas, navegación, estilos, ficha del dispositivo, cascarones de listado/detalle.
**JavaScript** (navegador): conexión MQTT, recepción/validación de mensajes, datos en tiempo real, historial en `localStorage`, búsqueda, joystick y tarjetas.

## Instalación y ejecución local

```bash
npm install
npm run develop   # http://localhost:8000
npm run build     # genera public/
npm run serve     # sirve el build
```

La demo en vivo requiere ESP32 + Mosquitto (1883 TCP, 9001 WS) en la misma red (`ws://192.168.1.8:9001` en desarrollo).

## Firmware (`esp32/`, PlatformIO)

Joystick: `VRX → GPIO 34`, `VRY → GPIO 35`, `SW → GPIO 25` (pull-up). Calibración al arranque, deadzone, promedio móvil, normalización `[-1, 1]`. Credenciales en `esp32/src/config.h` (local, ignorado por Git; ver `config.example.h`). Comandos desde `esp32/`: `pio run`, `pio run -t upload`, `pio device monitor`.

## Entrega

- Repositorio: `https://github.com/MacRov1/templab`
- Versión publicada en Netlify (URL de demostración). La conexión MQTT depende del broker Mosquitto local, por lo que la versión pública no accede a datos en vivo: muestra estructura, búsqueda y registros guardados localmente.
