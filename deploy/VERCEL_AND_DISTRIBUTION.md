# 🚀 MediQR: Vercel Deployment & Government Distribution Architecture

This document answers the critical architectural questions regarding **Vercel deployment, computation power, and how government officials install and commission hospital nodes**.

---

## ⚡ 1. Do We Need Vercel for "Computation Power"?

### Short Answer: **No.**
You do **not** need high server computation power to run MediQR.

### Why?
1. **Client-Side Cryptography (Web Crypto API):**
   - In MediQR, all cryptographic operations—including **AES-256-GCM encryption/decryption**, **SHA-256 document hashing**, and **HMAC-SHA256 salted patient identifier generation**—execute **directly inside the client's browser or workstation memory**.
   - Neither Vercel nor any central server decrypts patient data. The workstation's own CPU handles the cryptographic math in milliseconds.
2. **Lightweight Blockchain Queries:**
   - Querying `MedicalRecordLedger.sol` consists of lightweight JSON-RPC read calls (`eth_call`) that take $< 50\text{ ms}$.
   - The blockchain consensus runs on the validator network (EVM nodes), not on the web host.

---

## 🌐 2. Should We Deploy to Vercel Anyway?

### **YES, for the Web Portal (Frontend UI)**
Deploying the Next.js frontend (`doctor-portal`) to Vercel provides huge operational advantages:
- **Universal Device Access:** ER doctors, paramedics, and government inspectors can open the portal on iPads, smartphones, and laptops without running local commands (`npm run dev`).
- **Global CDN & Instant Loading:** Vercel's edge network serves the web application in $< 100\text{ ms}$ worldwide.
- **Mobile QR Scanning Ready:** When paramedics scan a patient's emergency QR code with Google Lens or a phone camera, it opens the live Vercel URL (e.g. `https://mediqr.vercel.app/emergency?data=...`) instantly without needing a local Wi-Fi connection!

### ⚠️ What MUST Stay On-Premise (Behind Hospital Firewalls)?
- **The Hospital Storage Node (`hospital-nodes/`):**
  - Clinical records containing actual encrypted medical files (prescriptions, blood tests, radiology scans) **must NEVER be hosted on a public cloud like Vercel**.
  - In strict compliance with **HIPAA (US)**, **GDPR (Europe)**, and the **Digital Personal Data Protection Act (DPDP India)**, hospitals must maintain data sovereignty.
  - The storage engine runs as a containerized appliance behind the hospital's private intranet on port `:5001` or `:5002`.
  - The Vercel-hosted frontend simply connects to the hospital's local endpoint or reverse proxy when authorized doctors decrypt records.

---

## 🛠️ 3. Step-by-Step: How to Deploy the Portal to Vercel

### Option A: Via GitHub (Recommended - 2 Minutes)
1. Push your latest code to your GitHub repository: `https://github.com/Soham-Bhale/Purvaja-MediQR`.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** ➔ **"Project"**.
4. Select your GitHub repository **`Soham-Bhale/Purvaja-MediQR`**.
5. In the **Project Configuration** settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and select **`doctor-portal`** (⚠️ Critical: Do NOT select the repository root).
6. Under **Environment Variables**, add:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Replace with Sepolia/Polygon/Besu address if deployed |
   | `NEXT_PUBLIC_RPC_URL` | `http://127.0.0.1:8545` | Or your public testnet RPC (e.g. Alchemy/Infura) |
7. Click **Deploy**. Vercel will build and launch your live production web URL!

---

### Option B: Via Vercel CLI (From Your Terminal)
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Navigate to the `doctor-portal` directory:
   ```bash
   cd c:\Users\soham\Desktop\Work\projects\complete\purvaja-mediqr\doctor-portal
   ```
3. Run the deployment command:
   ```bash
   vercel
   ```
4. Follow the on-screen prompts:
   - *Set up and deploy?* `Y`
   - *Which scope?* (Your account)
   - *Link to existing project?* `N`
   - *Project name?* `mediqr-portal`
   - *Directory located?* `./`
5. When ready for production:
   ```bash
   vercel --prod
   ```

---

## 🏛️ 4. The Government Official Field Installation Workflow

In this project, the **Government Health Official** (e.g., Ministry of Health field engineer) is responsible for on-boarding the hospital hardware and certifying medical staff.

```
   ┌─────────────────────────────────────────────────────────────┐
   │             GOVERNMENT OFFICIAL ON-SITE WORKFLOW             │
   └─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
    1. Server Provisioning: Deploy Docker Appliance on Server
       docker compose -f deploy/docker-compose.hospital-appliance.yml up -d
                                  │
                                  ▼
    2. Launch Official Installer: http://localhost:3000/installer
       Step 1: Set Hospital Name & MOH License ID (e.g. HOSP-DEL-APOLLO-01)
       Step 2: Connect & Pair Node with Consortium Blockchain Ledger
                                  │
                                  ▼
    3. Biometric Fingerprint Enrolment of Doctors
       - Official enters Doctor Name, MCI Medical Council License & Wallet.
       - Official places Doctor's finger on the optical reader pad.
       - Sensor captures 500 DPI minutiae ridges (Whorl/Loop/Arch).
       - Cryptographic biometric template hash is sealed on the appliance.
                                  │
                                  ▼
    4. Appliance Sealing & Handover
       - Generates Government Commissioning Certificate.
       - Locks configuration.
       - Doctor Clinical Terminal (/doctor) is locked behind biometrics!
```

---

## 🩺 5. Doctor Clinical Access: Daily Biometric Security

Once the government official completes the installation:
1. **The clinical terminal is locked by default.**
2. When the attending doctor opens `http://localhost:3000/doctor`:
   - The **Biometric Gatekeeper** blocks all queries and chart decryptions.
   - The doctor places their enrolled finger on the biometric pad (or clicks to simulate scan).
   - The system verifies the minutiae match against the template enrolled by the government official.
   - Upon a verified match, the terminal unlocks and issues a **4-hour clinical session**.
3. When the doctor leaves the workstation, they click **"🔒 Lock"** to instantly secure patient privacy.

---

## 📱 6. Mobile QR & Google Lens Compatibility

- **The Problem with Raw JSON:** Traditional medical QR codes that encode 400+ characters of raw multi-line JSON cause Google Lens and Android camera viewfinders to freeze or lag due to heavy OCR regex parsing.
- **The MediQR Solution:** MediQR formats emergency QR codes as **Smart Web URLs**:
  ```text
  https://mediqr.org/emergency?data=<base64-encoded-triage>
  ```
- **Instant Lens Recognition:** Google Lens identifies the URL in $< 50\text{ ms}$, provides a clean **"Open in browser"** pill, and opens the Emergency Triage card directly on the first responder's smartphone screen without freezing.
