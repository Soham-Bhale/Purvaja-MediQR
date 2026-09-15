# MediQR Enterprise: Distributed Tamper-Proof Healthcare Archive & Ledger

Enterprise-grade, distributed, tamper-proof healthcare archive upgraded from the MediQR prototype. Designed for strict HIPAA and DPDP compliance with zero PII stored on-chain.

---

## 🏛️ Hybrid Cryptographic Architecture

```
                                  +---------------------------------------+
                                  |     PHYSICAL / DIGITAL MEDIQR CARD    |
                                  +---------------------------------------+
                                    |                                   |
                     [Public Unencrypted Data]               [Cryptographic Query Key]
                                    |                                   |
                                    v                                   v
                      +---------------------------+       +---------------------------+
                      |   Life-Saving Triage      |       |        patientHash        |
                      | - Blood Type: O-          |       | HMAC-SHA256(ID + Salt, K) |
                      | - Allergies: Penicillin   |       +---------------------------+
                      | - Emergency Contact       |                     |
                      +---------------------------+                     v
                                    |                     +---------------------------+
                             (Paramedic view)             | Doctor Verification Portal|
                                                          +---------------------------+
                                                                |              |
                                            (Query Blockchain)  |              | (Pull Encrypted Record)
                                                                v              v
+------------------------------------------------+    +------------------+    +------------------------+
|             ON-CHAIN SOLIDITY LEDGER           |    | Match SHA-256?   |    | OFF-CHAIN STORAGE      |
|           MedicalRecordLedger.sol              |    +------------------+    | Distributed Hospital   |
| - Verified Practitioner Registry               |              |             | Node A (:5001)         |
| - mapping(bytes32 => RecordMetadata[])         |      +-------+-------+     | Node B (:5002)         |
| - ONLY SHA-256 fileHash (NO plain health data) |      |               |     |                        |
| - Immutable RecordAccessed audit logs          |      v (MATCH)       v     | Content-Addressable    |
+------------------------------------------------+  Tamper-Free!   TAMPER     | AES-256-GCM Files      |
                                                    Decrypt in     DETECTED!  +------------------------+
                                                    Memory Only    Abort & Alert
```

1. **Dual-Segment MediQR**:
   - `triage`: Open emergency payload (Blood Type, Critical Allergies, Emergency Contact) accessible offline to paramedics without authentication.
   - `patientHash`: Salted `HMAC-SHA256(National_ID + Salt, Secret_Key)` preventing rainbow table and enumeration attacks.
2. **Off-Chain Multi-Hospital Sharding**:
   - Medical records (prescriptions, lab tests, consultation notes) are encrypted at rest with **AES-256-GCM** (12-byte IV, 16-byte authentication tag, AAD bound to `patientHash:recordId`).
   - Stored across simulated distributed hospital nodes (`Hospital Node A` on port 5001, `Hospital Node B` on port 5002).
3. **On-Chain Blockchain Ledger (`MedicalRecordLedger.sol`)**:
   - Stores **zero plain health data or PII**.
   - Anchors the exact **SHA-256 file checksum** (`bytes32 fileHash`), storage pointer URI, practitioner address, and timestamp.
   - Emits non-repudiable on-chain `RecordAccessed` audit trail logs upon clinician retrieval.
4. **Zero-Trust Doctor Verification Portal**:
   - Clinician authenticates with verified practitioner role.
   - Fetches target encrypted payload from the hospital node.
   - Computes live SHA-256 checksum of document in real-time.
   - **Integrity Check**:
     - `computedHash === contractHash` -> Decrypts in memory, shows verified **"Tamper-Free: Hash Verified On-Chain"** badge.
     - `computedHash !== contractHash` -> Immediately halts decryption, wipes memory, and raises **"Tamper Detected: Record Compromised"** critical alert.

---

## 📁 Repository Structure

```
purvaja-mediqr/
├── contracts/                                # Solidity & Hardhat Smart Contracts
│   ├── contracts/MedicalRecordLedger.sol    # SHA-256 ledger, practitioner registry & audit events
│   ├── scripts/deploy.js                    # Local EVM deployment script
│   ├── test/MedicalRecordLedger.test.js     # Unit test suite (9/9 passing)
│   └── hardhat.config.js
│
├── core-crypto/                              # Shared Cryptographic & QR Engine (TypeScript)
│   ├── src/qr/
│   │   ├── qr-generator.ts                  # Generates dual-segment MediQR (triage + salted patientHash)
│   │   └── qr-parser.ts                     # Schema validator separating triage from token
│   ├── src/encryption/
│   │   ├── aes-gcm.ts                       # Authenticated AES-256-GCM encryption & decryption
│   │   ├── hmac-hasher.ts                   # HMAC-SHA256 salted patient hashing
│   │   └── checksum.ts                      # SHA-256 document fingerprinting
│   ├── src/types/index.ts                   # TypeScript domain interfaces
│   └── test/crypto.test.ts                  # Comprehensive cryptography test suite
│
├── hospital-nodes/                           # Distributed Off-Chain Storage Simulator
│   ├── src/server.ts                        # Multi-hospital runner (Hospital A :5001, Hospital B :5002)
│   ├── src/services/storage-engine.ts       # Content-addressable storage & bit-flipping attack simulator
│   └── src/routes/node-routes.ts            # Upload, retrieve, tamper, and restore endpoints
│
├── doctor-portal/                            # Next.js 14 Web Application (App Router + Tailwind)
│   ├── src/app/emergency/                   # First-responder emergency triage scanner view
│   ├── src/app/doctor/                      # Doctor verification portal with on-chain hash validation
│   ├── src/app/hospital/                    # QR generation & clinical record upload hub
│   ├── src/app/simulator/                   # Live bit-flipping tamper attack workbench
│   └── src/components/                      # UI components (HashIntegrityBadge, TriageCard, Navbar)
│
├── start_mediqr.bat                          # One-click Windows launcher
└── package.json                              # Root workspace runner
```

---

## 🚀 Quickstart Guide

### 1. Run Automated Unit Tests

Test the Cryptography & QR Engine:
```bash
cd core-crypto
npm test
```

Test the Solidity Smart Contract Ledger:
```bash
cd ../contracts
npx hardhat test
```

### 2. Launch Services

#### Option A: One-Click Windows Launcher
Double-click `start_mediqr.bat` in the root directory.

#### Option B: Manual Launch
In terminal 1 (Hospital Storage Nodes):
```bash
cd hospital-nodes
npm start
```
*Hospital A will run on http://localhost:5001*  
*Hospital B will run on http://localhost:5002*

In terminal 2 (Doctor & Patient Portal):
```bash
cd doctor-portal
npm run dev
```
*Open http://localhost:3000 in your browser.*

---

## 🧪 Testing the Live Tamper Detection Flow

1. Open **http://localhost:3000/doctor**.
2. Notice the pre-loaded patient hash for Jane Doe (`0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872`).
3. Observe both records verified with green **"Tamper-Free: Hash Verified On-Chain"** badges, and in-memory decrypted medical records displayed.
4. Click **"Simulate Tamper Attack"** on Record #1 (or open **http://localhost:3000/simulator**).
5. Watch the Doctor Portal immediately detect the bit flip:
   - Decryption is halted immediately.
   - The red **"Tamper Detected: Record Compromised"** alert activates.
   - The expected on-chain target hash vs corrupted document hash diff is shown.
6. Click **"Restore Pristine File"** to observe instantaneous recovery and green re-verification.
