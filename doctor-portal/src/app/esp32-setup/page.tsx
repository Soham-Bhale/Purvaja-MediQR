'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Esp32SetupPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  const esp32CodeSnippet = `#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "MediQR-Secure-Net";
const char* password = "mediqr-pass-2026";

IPAddress local_IP(192, 168, 4, 1);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);

void handleRoot() {
  String html = "<html><body style='font-family:sans-serif; text-align:center; padding:40px;'>";
  html += "<h2 style='color:#1e3a8a;'>MediQR Private Medical IoT Router</h2>";
  html += "<p style='color:#059669; font-weight:bold;'>Status: Secure Network Active (WPA2-PSK)</p>";
  html += "<p>Connected Devices: 3 (Laptop 1: Patient, Laptop 2: Doctor, Mobile: Triage)</p>";
  html += "<p>Subnet: 192.168.4.0/24 | Gateway: 192.168.4.1</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  WiFi.softAPConfig(local_IP, gateway, subnet);
  WiFi.softAP(ssid, password);
  
  Serial.println("\\n=== MediQR Secure Router Started ===");
  Serial.print("Access Point: "); Serial.println(ssid);
  Serial.print("Gateway IP: "); Serial.println(WiFi.softAPIP());

  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Private Network &amp; Hardware Integration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ESP32 Secure Medical Router &amp; 3-Device Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Architectural configuration for connecting Laptop 1 (Patient), Laptop 2 (Doctor &amp; Blockchain), and Mobile Phone (Emergency Triage) through an isolated, private ESP32 Access Point.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/doctor"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Open Doctor Portal →
          </Link>
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📡</span>
          <span>Private Network Topology (Zero Public Internet Required)</span>
        </h2>

        {/* 3-Device Visual Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Laptop 1 */}
          <div className="bg-blue-50/60 border-2 border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Laptop 1
              </span>
              <span className="text-xs font-mono text-slate-500">192.168.4.2</span>
            </div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>💻</span>
              <span>Patient Booking Station</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>• Patient registration &amp; emergency vitals</li>
              <li>• Service fee payment processing (₹500)</li>
              <li>• Token ID generation (e.g. <code className="font-mono text-[10px]">APT-APO-8812</code>)</li>
              <li>• Email dispatch confirmation</li>
            </ul>
            <div className="pt-2 border-t border-blue-200 text-[11px] font-mono text-blue-700">
              URL: http://192.168.4.3:3000/
            </div>
          </div>

          {/* Central Router: ESP32 */}
          <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl p-5 space-y-3 ring-2 ring-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                ESP32 IoT Gateway
              </span>
              <span className="text-xs font-mono text-slate-500">192.168.4.1</span>
            </div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>📶</span>
              <span>Secure Private Wi-Fi AP</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>• <strong>SSID:</strong> MediQR-Secure-Net</li>
              <li>• <strong>Password:</strong> mediqr-pass-2026</li>
              <li>• DHCP Range: 192.168.4.2 - 192.168.4.10</li>
              <li>• Isolates healthcare traffic from WAN</li>
            </ul>
            <div className="pt-2 border-t border-emerald-200 text-[11px] font-mono text-emerald-800">
              Admin: http://192.168.4.1/
            </div>
          </div>

          {/* Laptop 2 */}
          <div className="bg-indigo-50/60 border-2 border-indigo-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                Laptop 2 (Host)
              </span>
              <span className="text-xs font-mono text-slate-500">192.168.4.3</span>
            </div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>🩺</span>
              <span>Doctor Workstation &amp; Blockchain</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>• Doctor login &amp; appointment queue</li>
              <li>• Clinical examination &amp; AES-256-GCM encryption</li>
              <li>• Live Blockchain Block Generator (<code className="font-mono text-[10px]">/blockchain</code>)</li>
              <li>• MediQR &amp; unique record key issuance</li>
            </ul>
            <div className="pt-2 border-t border-indigo-200 text-[11px] font-mono text-indigo-700">
              Host: http://0.0.0.0:3000/
            </div>
          </div>
        </div>

        {/* Mobile Phone Card */}
        <div className="bg-rose-50/60 border-2 border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                Device 3 • Mobile Phone
              </span>
              <span className="text-xs font-mono text-slate-500">Connected to MediQR-Secure-Net</span>
            </div>
            <div className="font-bold text-sm text-slate-900">
              First-Responder Emergency Optical Scan Terminal
            </div>
            <p className="text-xs text-slate-600">
              Scans generated MediQR on doctor's screen using built-in camera or Google Lens. Instantly loads <code className="font-mono bg-white px-1 py-0.5 rounded text-rose-800">http://192.168.4.3:3000/emergency?...</code> over private Wi-Fi in &lt; 0.05 seconds.
            </p>
          </div>
          <Link
            href="/emergency"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition whitespace-nowrap"
          >
            Preview Mobile Triage View →
          </Link>
        </div>
      </div>

      {/* Step-by-Step Execution Guide for Presentation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📋</span>
          <span>Live Academic Presentation Operating Procedure</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 font-bold block text-sm">Step 1: Power On ESP32 Router</strong>
            <p>Connect the ESP32 module to a USB port or 5V power bank. It starts the access point <code className="font-mono font-bold text-emerald-800">MediQR-Secure-Net</code> in ~2 seconds.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 font-bold block text-sm">Step 2: Connect Devices to Wi-Fi</strong>
            <p>Connect Laptop 1, Laptop 2, and the Mobile Phone to Wi-Fi <code className="font-mono font-bold">MediQR-Secure-Net</code> (Password: <code className="font-mono">mediqr-pass-2026</code>).</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 font-bold block text-sm">Step 3: Run MediQR Services on Laptop 2 (Host)</strong>
            <p>Double-click <code className="font-mono font-bold">start_mediqr.bat</code> on Laptop 2. It boots both hospital nodes (:5001, :5002) and the web portal (:3000 bound to 0.0.0.0).</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 font-bold block text-sm">Step 4: Execute Live Demo Flow</strong>
            <p>1. <strong>Laptop 1 (Patient)</strong>: Open <code className="font-mono">http://&lt;LAPTOP_2_IP&gt;:3000/</code>, enter vitals, pay ₹500 fee, and generate Token ID.</p>
            <p>2. <strong>Laptop 2 (Doctor &amp; Blockchain)</strong>: Open <code className="font-mono">http://localhost:3000/doctor</code>, examine patient, complete consultation, and watch new block mine on <code className="font-mono">/blockchain</code>.</p>
            <p>3. <strong>Mobile Phone (Paramedic)</strong>: Scan generated MediQR from Doctor screen to display immediate blood group and allergy alerts!</p>
          </div>
        </div>
      </div>

      {/* Embedded Arduino Sketch Code */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">⚡ ESP32 Firmware Source Code:</span>
            <span className="font-mono text-xs text-slate-400">MediQR_Secure_Router.ino</span>
          </div>
          <button
            type="button"
            onClick={() => copyCode(esp32CodeSnippet, 'esp32')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition"
          >
            {copiedSection === 'esp32' ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          {esp32CodeSnippet}
        </pre>
      </div>
    </div>
  );
}
