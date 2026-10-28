/*
 * ======================================================================================
 *  MediQR Private Medical IoT Router & Access Point Firmware
 *  Designed for: ESP32 DevKit V1 / ESP32-WROOM-32 (4MB Flash)
 *  Project: Purvaja MediQR - 3-Device Isolated Healthcare Network
 * ======================================================================================
 *  LED Behavior:
 *   - >= 3 Devices Connected (Laptop 1, Laptop 2, Mobile Phone):
 *     Blue LED stays SOLID ON (flashing stops, network fully locked & ready).
 *   - 1-2 Devices Connected:
 *     Slow gentle pulse (waiting for remaining demonstration stations).
 *   - 0 Devices Connected:
 *     Blinking (standby / ready for connection).
 * ======================================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

// --- NETWORK CREDENTIALS ---
const char* AP_SSID = "MediQR-Secure-Net";
const char* AP_PASS = "mediqr-pass-2026";

// Static IP configuration for the medical gateway
IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);

const int STATUS_LED = 2; // Built-in blue LED on DevKit V1
const int TARGET_DEVICES = 3; // Laptop 1, Laptop 2, Mobile Phone

unsigned long lastBlink = 0;
bool ledState = false;

// Web Dashboard on http://192.168.4.1/
void handleRoot() {
  int clientCount = WiFi.softAPgetStationNum();
  unsigned long uptimeSeconds = millis() / 1000;
  
  String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<title>MediQR Secure IoT Router</title>";
  html += "<style>";
  html += "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }";
  html += ".card { max-width: 550px; margin: auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }";
  html += ".badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: #065f46; color: #34d399; }";
  html += ".grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }";
  html += ".stat { background: #0f172a; padding: 12px; border-radius: 10px; border: 1px solid #334155; }";
  html += ".stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; }";
  html += ".stat-val { font-size: 18px; font-weight: bold; color: #38bdf8; font-family: monospace; margin-top: 4px; }";
  html += "ul { font-size: 13px; color: #cbd5e1; padding-left: 20px; line-height: 1.6; }";
  html += "</style></head><body>";
  
  html += "<div class='card'>";
  html += "<span class='badge'>✓ Isolated Healthcare AP Active</span>";
  html += "<h2 style='margin: 12px 0 4px; color: #ffffff;'>MediQR Hardware Security Gateway</h2>";
  html += "<p style='font-size: 12px; color: #94a3b8; margin: 0;'>Private Local Network for Academic 3-Device Demonstration</p>";
  
  html += "<div class='grid'>";
  html += "<div class='stat'><div class='stat-label'>SSID</div><div class='stat-val'>" + String(AP_SSID) + "</div></div>";
  html += "<div class='stat'><div class='stat-label'>Gateway IP</div><div class='stat-val'>192.168.4.1</div></div>";
  html += "<div class='stat'><div class='stat-label'>Connected Devices</div><div class='stat-val' style='color:#34d399;'>" + String(clientCount) + " / " + String(TARGET_DEVICES) + " Stations</div></div>";
  html += "<div class='stat'><div class='stat-label'>Router Uptime</div><div class='stat-val'>" + String(uptimeSeconds) + "s</div></div>";
  html += "</div>";

  html += "<h3 style='font-size: 14px; margin-top: 20px; color: #f1f5f9;'>Assigned Demonstration Network Roles:</h3>";
  html += "<ul>";
  html += "<li><strong>Laptop 1 (Patient Portal)</strong>: Registration & Paid Appointment Booking</li>";
  html += "<li><strong>Laptop 2 (Doctor Terminal & Blockchain)</strong>: Examination & Live Block Explorer (Port :3000)</li>";
  html += "<li><strong>Mobile Phone (Emergency Triage)</strong>: Zero-latency QR Scanning without WAN</li>";
  html += "</ul>";

  if (clientCount >= TARGET_DEVICES) {
    html += "<div style='background:#065f46; color:#a7f3d0; padding:12px; border-radius:10px; font-size:12px; font-weight:bold; margin-top:16px;'>";
    html += "✓ ALL 3 DEMO DEVICES CONNECTED. Hardware LED locked Solid ON.";
    html += "</div>";
  } else {
    html += "<div style='background:#78350f; color:#fde68a; padding:12px; border-radius:10px; font-size:12px; font-weight:bold; margin-top:16px;'>";
    html += "Waiting for remaining devices (" + String(clientCount) + " of " + String(TARGET_DEVICES) + " connected). LED pulsing.";
    html += "</div>";
  }
  
  html += "<div style='margin-top: 24px; padding-top: 14px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center;'>";
  html += "MediQR Consortium Hardware Gateway • ESP32 Security Layer";
  html += "</div></div></body></html>";

  server.send(200, "text/html", html);
}

// JSON API Endpoint for diagnostic telemetry
void handleStatusApi() {
  int count = WiFi.softAPgetStationNum();
  String json = "{";
  json += "\"network\":\"" + String(AP_SSID) + "\",";
  json += "\"status\":\"ACTIVE_SECURE\",";
  json += "\"gatewayIP\":\"192.168.4.1\",";
  json += "\"connectedDevices\":" + String(count) + ",";
  json += "\"targetDevices\":" + String(TARGET_DEVICES) + ",";
  json += "\"allConnected\":" + String(count >= TARGET_DEVICES ? "true" : "false") + ",";
  json += "\"uptimeSeconds\":" + String(millis() / 1000);
  json += "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);

  Serial.println();
  Serial.println("========================================================");
  Serial.println("   Starting MediQR Private Medical IoT Router (ESP32)   ");
  Serial.println("========================================================");

  // Disconnect previous WiFi state and configure softAP
  WiFi.disconnect(true);
  delay(100);
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(local_IP, gateway, subnet);
  
  // Start SoftAP with 4 max connections and WPA2-PSK
  bool apStarted = WiFi.softAP(AP_SSID, AP_PASS, 1, 0, 4);

  if (apStarted) {
    Serial.println("✓ Wi-Fi Access Point Started Successfully!");
    Serial.print("  SSID: "); Serial.println(AP_SSID);
    Serial.print("  Password: "); Serial.println(AP_PASS);
    Serial.print("  Gateway IP: "); Serial.println(WiFi.softAPIP());
    Serial.println("  Broadcast Channel: 1");
  } else {
    Serial.println("❌ Failed to initialize SoftAP");
  }

  // Register Web Routes
  server.on("/", handleRoot);
  server.on("/status", handleStatusApi);
  server.on("/api/status", handleStatusApi);
  server.begin();

  Serial.println("✓ Router HTTP Dashboard listening on http://192.168.4.1/");
  Serial.println("========================================================\n");
}

void loop() {
  server.handleClient();

  int clientCount = WiFi.softAPgetStationNum();

  if (clientCount >= TARGET_DEVICES) {
    // ALL 3 DEVICES CONNECTED (Laptop 1, Laptop 2, Mobile Phone):
    // Stop flashing! Keep LED solidly ON.
    digitalWrite(STATUS_LED, HIGH);
  } else if (clientCount > 0) {
    // 1-2 devices connected: Slow gentle pulse (waiting for remaining)
    if (millis() - lastBlink > 1200) {
      lastBlink = millis();
      ledState = !ledState;
      digitalWrite(STATUS_LED, ledState ? HIGH : LOW);
    }
  } else {
    // 0 devices connected: Standby flash
    if (millis() - lastBlink > 500) {
      lastBlink = millis();
      ledState = !ledState;
      digitalWrite(STATUS_LED, ledState ? HIGH : LOW);
    }
  }
}
