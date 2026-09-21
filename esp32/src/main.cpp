/**
 * TempLab ESP32 Firmware
 *
 * Funcionalidad:
 * - Conecta a Wi-Fi
 * - Conecta a broker MQTT (Mosquitto)
 * - Publica estado actual cada 5 segundos en: templab/esp32/estado
 * - Publica registro histórico cada 10 minutos en: templab/esp32/registro
 * - Publica joystick analógico cada 50 ms en: templab/esp32/joystick
 *
 * Hardware: ESP32 DevKit V1
 * - VRX -> GPIO 34 (ADC1, entrada analógica)
 * - VRY -> GPIO 35 (ADC1, entrada analógica)
 * - SW  -> GPIO 25 (digital con pull-up, activo en LOW)
 * - VCC joystick -> 3V3, GND -> GND
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// Credenciales y broker local (archivo ignorado por Git).
// Ver config.example.h para crear config.h en un entorno nuevo.
#include "config.h"

// ============================================================================
// CONFIGURACIÓN - VALORES NO SENSIBLES
// ============================================================================

// Tópicos MQTT
const char* TOPIC_ESTADO = "templab/esp32/estado";
const char* TOPIC_REGISTRO = "templab/esp32/registro";
const char* TOPIC_JOYSTICK = "templab/esp32/joystick";

// Intervalos
const unsigned long ESTADO_INTERVALO = 5000;          // 5 segundos
const unsigned long REGISTRO_INTERVALO = 600000;      // 10 minutos
const unsigned long JOYSTICK_INTERVALO = 50;          // 50 ms ~ 20 Hz
const unsigned long JOYSTICK_LOG_INTERVALO = 500;     // 500 ms log Serial normal
const unsigned long WIFI_RECONECTAR_INTERVALO = 10000;
const unsigned long MQTT_RECONECTAR_INTERVALO = 5000;

// Joystick - Pines (ADC1, compatible con WiFi activo)
#define JOYSTICK_VRX_PIN 34
#define JOYSTICK_VRY_PIN 35
#define JOYSTICK_SW_PIN 25

// Joystick - Calibración
#define CALIBRATION_SAMPLES 100
int joystickCentroX = 2000;
int joystickCentroY = 2000;
// Deadzone razonable: ~3-4% del rango total, evita ruido en reposo
const int JOYSTICK_DEADZONE = 150;
// Rango ADC observado en diagnóstico: ~0 a 4095
const int JOYSTICK_MIN_ADC = 0;
const int JOYSTICK_MAX_ADC = 4095;

// Suavizado por promedio móvil
#define ADC_SMOOTHING_SAMPLES 8
int adcBufferX[ADC_SMOOTHING_SAMPLES];
int adcBufferY[ADC_SMOOTHING_SAMPLES];
int adcBufferIndex = 0;
bool adcBufferFull = false;

// Zona horaria Uruguay (UTC-3)
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = -3 * 3600;
const int DAYLIGHT_OFFSET_SEC = 0;

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

unsigned long ultimoEstado = 0;
unsigned long ultimoRegistro = 0;
unsigned long ultimoJoystick = 0;
unsigned long ultimoLogJoystick = 0;
unsigned long ultimoIntentoWiFi = 0;
unsigned long ultimoIntentoMQTT = 0;

bool wifiConectado = false;
bool mqttConectado = false;
bool ntpSincronizado = false;

String macAddress = "";

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

String obtenerMAC() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(macStr);
}

float obtenerTemperaturaInterna() {
  return temperatureRead();
}

bool verificarInternet() {
  IPAddress dnsIP;
  if (WiFi.hostByName("8.8.8.8", dnsIP)) {
    return true;
  }
  WiFiClient testClient;
  if (testClient.connect("8.8.8.8", 53)) {
    testClient.stop();
    return true;
  }
  return false;
}

void sincronizarNTP() {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);

  struct tm timeinfo;
  int intentos = 0;
  while (!getLocalTime(&timeinfo) && intentos < 20) {
    delay(500);
    intentos++;
  }

  if (getLocalTime(&timeinfo)) {
    ntpSincronizado = true;
    Serial.printf("NTP sincronizado: %04d-%02d-%02d %02d:%02d:%02d\n",
                  timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                  timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  } else {
    Serial.println("Error: No se pudo sincronizar NTP");
  }
}

String obtenerTimestampISO() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    unsigned long uptimeSec = millis() / 1000;
    unsigned long h = uptimeSec / 3600;
    unsigned long m = (uptimeSec % 3600) / 60;
    unsigned long s = uptimeSec % 60;
    char buffer[32];
    snprintf(buffer, sizeof(buffer), "uptime-%02lu:%02lu:%02lu", h, m, s);
    return String(buffer);
  }

  char buffer[32];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buffer);
}

unsigned long obtenerUptimeSegundos() {
  return millis() / 1000;
}

struct JoystickData {
  float x;
  float y;
  bool button;
};

JoystickData leerJoystick() {
  // Lectura ADC cruda
  int rawX = analogRead(JOYSTICK_VRX_PIN);
  int rawY = analogRead(JOYSTICK_VRY_PIN);

  // Promedio móvil para suavizar ruido de alta frecuencia
  adcBufferX[adcBufferIndex] = rawX;
  adcBufferY[adcBufferIndex] = rawY;
  adcBufferIndex = (adcBufferIndex + 1) % ADC_SMOOTHING_SAMPLES;
  if (adcBufferIndex == 0) adcBufferFull = true;

  long sumX = 0, sumY = 0;
  int samples = adcBufferFull ? ADC_SMOOTHING_SAMPLES : adcBufferIndex;
  if (samples == 0) samples = 1;

  for (int i = 0; i < samples; i++) {
    sumX += adcBufferX[i];
    sumY += adcBufferY[i];
  }

  int avgX = sumX / samples;
  int avgY = sumY / samples;

  bool buttonPressed = (digitalRead(JOYSTICK_SW_PIN) == LOW);  // Activo en LOW

  // Desplazamiento respecto al centro calibrado
  int deltaX = avgX - joystickCentroX;
  int deltaY = avgY - joystickCentroY;

  // Deadzone: reposo -> 0
  if (abs(deltaX) < JOYSTICK_DEADZONE) deltaX = 0;
  if (abs(deltaY) < JOYSTICK_DEADZONE) deltaY = 0;

  // Normalización asimétrica con rangos reales
  float maxPosX = (float)(JOYSTICK_MAX_ADC - joystickCentroX);
  float maxNegX = (float)(joystickCentroX - JOYSTICK_MIN_ADC);
  float maxPosY = (float)(JOYSTICK_MAX_ADC - joystickCentroY);
  float maxNegY = (float)(joystickCentroY - JOYSTICK_MIN_ADC);

  float x = 0.0f;
  float y = 0.0f;

  if (deltaX > 0 && maxPosX > 0) {
    x = constrain(deltaX / maxPosX, 0.0f, 1.0f);
  } else if (deltaX < 0 && maxNegX > 0) {
    x = constrain(deltaX / maxNegX, -1.0f, 0.0f);
  }

  if (deltaY > 0 && maxPosY > 0) {
    // Y invertido: ADC sube hacia abajo, web espera -1 = arriba
    y = constrain(-deltaY / maxPosY, -1.0f, 1.0f);
  } else if (deltaY < 0 && maxNegY > 0) {
    y = constrain(-deltaY / maxNegY, -1.0f, 1.0f);
  }

  // Seguridad final
  x = constrain(x, -1.0f, 1.0f);
  y = constrain(y, -1.0f, 1.0f);

  return {x, y, buttonPressed};
}

/**
 * Muestra el estado procesado del joystick por Serial (funcionamiento normal).
 * Imprime periódicamente para verificar reposo = 0.00 y movimientos.
 */
void leerEImprimirJoystick() {
  unsigned long ahora = millis();
  if (ahora - ultimoLogJoystick < JOYSTICK_LOG_INTERVALO) return;
  ultimoLogJoystick = ahora;

  JoystickData joy = leerJoystick();
  Serial.printf("X: %.2f | Y: %.2f | Button: %s\n",
                joy.x, joy.y, joy.button ? "true" : "false");
}

/**
 * Publica joystick por MQTT cada 50 ms (solo si conectado)
 */
void publicarJoystick() {
  if (!mqttConectado) return;

  JoystickData joy = leerJoystick();

  JsonDocument doc;
  doc["x"] = joy.x;
  doc["y"] = joy.y;
  doc["button"] = joy.button;

  char buffer[128];
  size_t n = serializeJson(doc, buffer);

  if (!mqttClient.publish(TOPIC_JOYSTICK, buffer, n)) {
    Serial.println("Error publicando joystick");
  }
}

bool conectarWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.printf("Conectando a WiFi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    wifiConectado = true;
    Serial.println("WiFi conectado");
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("MAC: %s\n", macAddress.c_str());
    Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
    return true;
  } else {
    wifiConectado = false;
    Serial.println("Error: No se pudo conectar a WiFi");
    return false;
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("Mensaje MQTT recibido en %s: ", topic);
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

bool conectarMQTT() {
  if (mqttClient.connected()) {
    return true;
  }

  if (!wifiConectado) {
    return false;
  }

  Serial.printf("Conectando a MQTT: %s:%d\n", MQTT_BROKER, MQTT_PORT);

  String clientId = "ESP32-" + macAddress;
  clientId.replace(":", "");

  bool conectado = false;
  if (strlen(MQTT_USER) > 0) {
    conectado = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
  } else {
    conectado = mqttClient.connect(clientId.c_str());
  }

  if (conectado) {
    mqttConectado = true;
    Serial.println("MQTT conectado");
  } else {
    mqttConectado = false;
    Serial.printf("Error MQTT: %d\n", mqttClient.state());
  }
  return conectado;
}

void publicarEstado() {
  if (!mqttConectado) return;

  float temp = obtenerTemperaturaInterna();
  bool internet = verificarInternet();
  bool bluetooth = true;
  unsigned long uptime = obtenerUptimeSegundos();

  JsonDocument doc;
  doc["temperatura"] = temp;
  doc["internet"] = internet;
  doc["bluetooth"] = bluetooth;
  doc["mac"] = macAddress;
  doc["uptime"] = uptime;

  char buffer[256];
  size_t n = serializeJson(doc, buffer);

  if (mqttClient.publish(TOPIC_ESTADO, buffer, n)) {
    static int contador = 0;
    if (++contador % 10 == 0) {
      Serial.printf("Estado publicado: temp=%.1f°C internet=%s uptime=%lus\n",
                    temp, internet ? "true" : "false", uptime);
    }
  } else {
    Serial.println("Error publicando estado");
  }
}

void publicarRegistro() {
  if (!mqttConectado) return;

  float temp = obtenerTemperaturaInterna();
  bool internet = verificarInternet();
  bool bluetooth = true;
  unsigned long uptime = obtenerUptimeSegundos();
  String timestamp = obtenerTimestampISO();

  JsonDocument doc;
  doc["fecha"] = timestamp;
  doc["temperatura"] = temp;
  doc["internet"] = internet;
  doc["bluetooth"] = bluetooth;
  doc["mac"] = macAddress;
  doc["uptime"] = uptime;

  char buffer[256];
  size_t n = serializeJson(doc, buffer);

  if (mqttClient.publish(TOPIC_REGISTRO, buffer, n)) {
    Serial.printf("Registro publicado: %s temp=%.1f°C\n", timestamp.c_str(), temp);
  } else {
    Serial.println("Error publicando registro");
  }
}

void manejarWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConectado) {
      wifiConectado = true;
      Serial.println("WiFi reconectado");
    }
    return;
  }

  if (wifiConectado) {
    wifiConectado = false;
    mqttConectado = false;
    Serial.println("WiFi desconectado. Intentando reconectar...");
  }

  if (millis() - ultimoIntentoWiFi >= WIFI_RECONECTAR_INTERVALO) {
    ultimoIntentoWiFi = millis();
    conectarWiFi();
  }
}

void manejarMQTT() {
  if (!wifiConectado) {
    mqttConectado = false;
    return;
  }

  if (!mqttClient.connected()) {
    if (mqttConectado) {
      mqttConectado = false;
      Serial.println("MQTT desconectado. Intentando reconectar...");
    }

    if (millis() - ultimoIntentoMQTT >= MQTT_RECONECTAR_INTERVALO) {
      ultimoIntentoMQTT = millis();
      conectarMQTT();
    }
  } else {
    if (!mqttConectado) {
      mqttConectado = true;
      Serial.println("MQTT reconectado");
    }
    mqttClient.loop();
  }
}

// ============================================================================
// SETUP Y LOOP
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== TempLab ESP32 Firmware ===");
  Serial.println("Iniciando...");

  macAddress = obtenerMAC();
  Serial.printf("MAC: %s\n", macAddress.c_str());

  // Joystick
  pinMode(JOYSTICK_VRX_PIN, INPUT);
  pinMode(JOYSTICK_VRY_PIN, INPUT);
  pinMode(JOYSTICK_SW_PIN, INPUT_PULLUP);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Calibración automática: joystick quieto y centrado durante el arranque
  Serial.println("Calibrando joystick (no tocar)...");
  long sumCalX = 0, sumCalY = 0;
  for (int i = 0; i < CALIBRATION_SAMPLES; i++) {
    sumCalX += analogRead(JOYSTICK_VRX_PIN);
    sumCalY += analogRead(JOYSTICK_VRY_PIN);
    delay(5);
  }
  joystickCentroX = sumCalX / CALIBRATION_SAMPLES;
  joystickCentroY = sumCalY / CALIBRATION_SAMPLES;
  Serial.printf("Centro calibrado -> X: %d, Y: %d\n", joystickCentroX, joystickCentroY);

  // Inicializar buffer de promedio con el centro para evitar basura inicial
  for (int i = 0; i < ADC_SMOOTHING_SAMPLES; i++) {
    adcBufferX[i] = joystickCentroX;
    adcBufferY[i] = joystickCentroY;
  }
  adcBufferIndex = 0;
  adcBufferFull = true;

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);

  conectarWiFi();

  // MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setKeepAlive(60);

  if (wifiConectado) {
    sincronizarNTP();
  }

  if (wifiConectado) {
    conectarMQTT();
  }

  ultimoEstado = millis();
  ultimoRegistro = millis();
  ultimoJoystick = millis();
  ultimoLogJoystick = millis();

  Serial.println("Setup completado");
  Serial.println("Esperando intervalos de publicación...");
  Serial.println("================================");
}

void loop() {
  manejarWiFi();
  manejarMQTT();

  unsigned long ahora = millis();

  // Log Serial normal del joystick (independiente de MQTT)
  leerEImprimirJoystick();

  if (ahora - ultimoEstado >= ESTADO_INTERVALO) {
    ultimoEstado = ahora;
    publicarEstado();
  }

  if (ahora - ultimoRegistro >= REGISTRO_INTERVALO) {
    ultimoRegistro = ahora;
    publicarRegistro();
  }

  if (ahora - ultimoJoystick >= JOYSTICK_INTERVALO) {
    ultimoJoystick = ahora;
    publicarJoystick();
  }

  if (mqttConectado) {
    mqttClient.loop();
  }

  delay(10);
}
