# MediQR: 3-Device Demonstration & ESP32 Private Network Setup Guide

This comprehensive guide details the hardware, network configuration, and presentation operating procedure for demonstrating the **Paid MediQR Healthcare Management System with Blockchain Integration** across **three physical devices**:
1. **Laptop 1**: Patient Registration, Fee Payment & Token Generation
2. **Laptop 2**: Doctor Consultation, Medical Record Management & Live Blockchain Dashboard
3. **Mobile Phone**: Emergency Paramedic QR Scanning over Local Network
4. **ESP32 Hardware Router**: Private Isolated Wi-Fi Access Point & Security Gateway

---

## 1. Network Architecture Blueprint

```
                            +------------------------------------+
                            |     ESP32 Hardware Router (AP)     |
                            |      SSID: MediQR-Secure-Net       |
                            |        Gateway: 192.168.4.1        |
                            +------------------------------------+
                                      /        |        \
                                     /         |         \
                                    /          |          \
            +----------------------+           |           +----------------------+
            |       LAPTOP 1       |           |           |     MOBILE PHONE     |
            |   Patient Station    |           |           |   Emergency Triage   |
            |   IP: 192.168.4.2    |           |           |   IP: 192.168.4.4    |
            |                      |           |           |                      |
            | • Register Patient   |           |           | • Scan MediQR Camera |
            | • Pay Fee (₹500)     |           |           | • 0.02s Offline Vitals|
            | • Receive Token ID   |           |           | • Blood Group & ICE  |
            +----------------------+           |           +----------------------+
                                               |
                                    +----------------------+
                                    |       LAPTOP 2       |
                                    | Doctor & Blockchain  |
                                    |   IP: 192.168.4.3    |
                                    |                      |
                                    | • Doctor EMR Portal  |
                                    | • AES-256 Encryption |
                                    | • Live Block Mining  |
                                    | • Issues MediQR Code |
                                    +----------------------+
```

---

## 2. Flashing the ESP32 Hardware Router

### Hardware Requirements
- **ESP32 Development Board** (ESP32-WROOM-32, NodeMCU ESP32, or ESP32 DevKit V1).
- **Micro-USB to USB-A Cable** (data-capable).
- Any 5V power source (laptop USB port or 5V power bank).

### Flashing via Arduino IDE
1. Open the Arduino IDE.
2. If not already installed, add the ESP32 board package:
   - Navigate to **File > Preferences**.
   - In *Additional Board Manager URLs*, paste:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Open **Tools > Board > Boards Manager**, search for `esp32`, and install.
3. Open the sketch:
   `esp32/MediQR_Secure_Router/MediQR_Secure_Router.ino`
4. Select your board under **Tools > Board > ESP32 Arduino > ESP32 Dev Module**.
5. Select the COM port under **Tools > Port**.
6. Click **Upload** (Hold down the `BOOT` button on the ESP32 if upload stays on `Connecting...`).
7. Once uploaded, open the **Serial Monitor** at `115200` baud. You will see:
   ```
   ========================================================
      Starting MediQR Private Medical IoT Router (ESP32)   
   ========================================================
   ✓ Wi-Fi Access Point Started Successfully!
     SSID: MediQR-Secure-Net
     Password: mediqr-pass-2026
     Gateway IP: 192.168.4.1
   ✓ Router HTTP Dashboard listening on http://192.168.4.1/
   ```

---

## 3. Step-by-Step 3-Device Demonstration Setup

### Step 1: Power the ESP32 & Connect Devices
1. Plug the ESP32 into a USB port.
2. On **Laptop 1**, **Laptop 2**, and the **Mobile Phone**, connect to the Wi-Fi network:
   - **SSID**: `MediQR-Secure-Net`
   - **Password**: `mediqr-pass-2026`
3. Optional verification: Open `http://192.168.4.1/` in any browser to view the ESP32 router telemetry dashboard!

---

### Step 2: Start MediQR Services on Laptop 2 (Host)
Laptop 2 will host the Next.js portal and hospital storage nodes:
1. Open a terminal on **Laptop 2** and find its assigned IP address:
   ```powershell
   ipconfig
   ```
   *Look for Wireless LAN adapter Wi-Fi IPv4 Address (typically `192.168.4.3` or `192.168.4.2`).*
2. Double-click `start_mediqr.bat` on Laptop 2.
   - Hospital Node A launches on `:5001`.
   - Hospital Node B launches on `:5002`.
   - Next.js Web Portal launches on `:3000` (bound to `0.0.0.0`).
3. On Laptop 2, open:
   `http://localhost:3000/doctor` (Doctor Workstation)
   and in another tab:
   `http://localhost:3000/blockchain` (Live Blockchain Dashboard).

---

### Step 3: Run the Patient Booking Flow on Laptop 1
1. On **Laptop 1**, open the browser and navigate to Laptop 2's IP:
   `http://192.168.4.3:3000/` *(replace with actual Laptop 2 IP)*
2. Fill out **Patient Registration & Emergency Vitals**:
   - Full Name: *Rahul Sharma*
   - Blood Group: *B+* (Critical for triage)
   - Allergies: *Penicillin G, Aspirin*
   - Emergency Contact: *Pooja Sharma (+91-98765-43211)*
3. Select Hospital & Doctor:
   - Facility: *Apollo Speciality Hospital*
   - Doctor: *Dr. Ramesh Gupta*
   - Time Slot: *11:00 AM - 11:30 AM*
4. Click **Proceed to Service Fee Payment**:
   - Select **1-Click Academic Pay** (or UPI / Card simulation).
   - Click **Pay ₹500 & Generate Token**.
5. **Demonstrate Result on Laptop 1**:
   - A unique Token ID is generated on screen: `APT-APO-2026-XXXX`.
   - Click **Inspect Dispatched Email** to show the evaluators the confirmation email with the token ID!

---

### Step 4: Examine Patient & Mine Block on Laptop 2
1. Switch to **Laptop 2** (`/doctor` tab):
   - Notice that the newly booked patient automatically appears in the **Scheduled Appointments Queue**!
2. Click **Examine Patient**:
   - The clinical examination suite opens with the patient's vitals pre-populated.
   - Enter clinical diagnosis (e.g. *Acute Bronchial Asthma Exacerbation*).
   - Enter prescription medications and examination notes.
3. Click **Complete Consultation & Anchor to Blockchain**:
   - The record is encrypted with AES-256-GCM.
   - Its SHA-256 fingerprint is committed to the blockchain.
   - The unique **MediQR Code** and **Unique Medical Key** appear on screen!
   - An email is automatically dispatched to the patient.
4. Switch to the **Live Blockchain Dashboard** (`/blockchain` tab):
   - Show the evaluators that **Block #2** has just been mined in real time!
   - Show the cryptographic linking: `Hash(Block #1) == PrevHash(Block #2)`.
   - Click **Simulate Block Tamper Attack**: demonstrate how modifying data immediately breaks the chain and turns blocks **RED** with integrity alerts!
   - Click **Restore Valid Ledger** to return to green.

---

### Step 5: Scan Emergency MediQR on Mobile Phone (Device 3)
1. On the **Mobile Phone** (connected to `MediQR-Secure-Net`), open the Camera app or Google Lens.
2. Aim the camera at the MediQR code displayed on Laptop 2's screen.
3. Tap the link detected:
   `http://192.168.4.3:3000/emergency?...`
4. **Demonstrate Result on Mobile Phone**:
   - The page opens in `< 0.05 seconds` completely over the private ESP32 Wi-Fi (no cellular data needed).
   - Large high-visibility **Blood Group (B+)** alert badge.
   - Pulsing **Critical Allergies Warning: Penicillin G, Aspirin**.
   - Direct 1-tap **Call Emergency Contact** button.
   - Emergency Resuscitation Preference: **FULL CODE**.
   - Cryptographic blockchain verification seal: **✓ Verified on Ledger**.

---

## 4. Alternative: Demonstration via Standard Local Hotspot (Fallback)
If the physical ESP32 hardware is not with you during a dry run:
1. Turn on the **Mobile Hotspot** on Laptop 2 or the Mobile Phone (e.g. `SSID: MediQR-Demo`).
2. Connect Laptop 1 and the other device to this hotspot.
3. Run `start_mediqr.bat` on Laptop 2.
4. All features, QR codes, and routing work identically!
