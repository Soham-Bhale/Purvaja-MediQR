# 🎨 MediQR Project Report: Diagram Generation Prompts (Remaining Figures)

This guide provides direct, copy-paste prompts for generating all the remaining diagrams for your project report. You can use these in **ChatGPT (GPT-4o / DALL-E 3)**, **Eraser.io**, **Draw.io**, or **Midjourney**.

> **💡 How It Works:**
> Whenever you generate an image, save it into your `images/` folder with the filename indicated below. Then simply run `python generate_mediqr_report.py`, and the script will automatically embed the high-resolution image directly into your Word report!

---

### ✅ ALREADY GENERATED & EMBEDDED IN YOUR REPORT:
1. `Figure 1.1 High-Level System Architecture.png` *(Embedded on Page 1)*
2. `Figure 4.1 System Architecture (3-Tier Decoupled Pipeline).png` *(Embedded on Page 12)*
3. `Figure 4.6 UML Use Case Diagram.png` *(Embedded on Page 16)*
4. `Figure 4.7 UML Sequence Diagram (Cross-Hospital Verification).png` *(Embedded on Page 17)*
5. `Figure 8.1 Benchmarking Visual Charts.png` *(Embedded on Page 29)*

---

### 📥 REMAINING FIGURES TO GENERATE:

---

#### 1. Figure 3.1: Incremental process model applied to this project
* **Filename to save in `images/`:** `Figure 3.1 Incremental process model.png`
* **Prompt for ChatGPT / DALL-E / Eraser.io:**
```text
A clean horizontal software engineering process flow diagram illustrating the "Incremental SDLC Process Model" for an enterprise blockchain system.
Show 6 sequential rectangular phases arranged horizontally from left to right, linked with crisp rightward arrows:
- Box 1: "Increment 1: Core Cryptography & NIST Vectors (HMAC-SHA256, AES-256-GCM, SHA-256)"
- Box 2: "Increment 2: Smart Contract Ledger (MedicalRecordLedger.sol, Hierarchical RBAC, Hardhat 14/14)"
- Box 3: "Increment 3: Off-Chain Storage Appliances (Docker Containers, Express REST, Tamper Sim API)"
- Box 4: "Increment 4: Compact QR Engine (Anti-Moiré URL Compression, Google Lens Safe)"
- Box 5: "Increment 5: Workstations & Biometrics (Doctor Terminal, Biometric Gatekeeper, Gov Installer)"
- Box 6: "Increment 6: Auditing & Benchmarking (Legacy Ingestion, Tamper Testing, 100% Assertion Suite)"
Design style: Modern corporate technology schematic, clean white background, dark border outlines, subtle blue and teal accents, sharp academic presentation.
```

---

#### 2. Figure 4.2: Context-level data flow diagram (Level 0)
* **Filename to save in `images/`:** `Figure 4.2 Context-level DFD Level 0.png`
* **Prompt for ChatGPT / DALL-E / Draw.io:**
```text
A formal Context-Level Data Flow Diagram (Level 0 DFD) for a blockchain healthcare record system called "MediQR".
In the center, a large circle labeled: "0.0 MediQR Healthcare Ledger System".
Around the circle, four external entity rectangles with clear labeled data flow arrows:
1. Top Entity: "First Responder / Paramedic"
   - Arrow to circle: "Scans Emergency Optical QR"
   - Arrow from circle: "Immediate Blood Group & Critical Allergy Vitals"
2. Left Entity: "Attending Physician"
   - Arrow to circle: "Biometric Fingerprint Auth & EMR Consultation Diagnosis"
   - Arrow from circle: "Verified Patient Clinical Dossier"
3. Bottom Entity: "Consortium Blockchain Network (EVM Smart Contract)"
   - Double-ended arrow: "Anchors 32-Byte SHA-256 Record Hashes & Reads Immutable Provenance"
4. Right Entity: "Hospital Admin & Government Official"
   - Arrow to circle: "Node Commissioning, Hardware UUID Binding & Doctor Biometric Enrollment"
Clean formal DFD style, standard software engineering symbols, white background, black outlines, legible professional typography.
```

---

#### 3. Figure 4.3: Data flow diagram, Level 1
* **Filename to save in `images/`:** `Figure 4.3 DFD Level 1.png`
* **Prompt for ChatGPT / DALL-E / Eraser.io:**
```text
A formal Level 1 Data Flow Diagram (Level 1 DFD) showing 5 interconnected processes (numbered circles) and 3 data stores (open horizontal parallel lines):
Processes:
- (1.0) "Emergency Triage Optical Scan & Parse"
- (2.0) "Doctor Biometric Authentication Gatekeeper"
- (3.0) "Client-Side In-Memory AES-256-GCM Encryption"
- (4.0) "On-Chain SHA-256 Fingerprint Anchoring"
- (5.0) "Integrity Verification & Ledger Hash Matching"
Data Stores:
- [D1: Optical Cache (Front QR Parameters)]
- [D2: Hospital Appliance Encrypted Vault (.enc.json)]
- [D3: EVM Consortium Smart Contract (MedicalRecordLedger)]
Show directed arrows connecting Actors (Paramedic, Attending Doctor) through these processes and data stores.
Clean academic engineering schematic, white background, high contrast, crisp lines.
```

---

#### 4. Figure 4.4: Data flow diagram, Level 2 (expansion of the Push process)
* **Filename to save in `images/`:** `Figure 4.4 DFD Level 2.png`
* **Prompt for ChatGPT / DALL-E / Draw.io:**
```text
A detailed Level 2 Data Flow Diagram (Level 2 DFD) expanding the "Record Push & Encryption Process":
Show the sequential internal sub-processes (circles) connected in a clear pipeline:
1. (3.1) "Generate 96-bit Cryptographic Random IV"
2. (3.2) "Execute Client-Side AES-256-GCM Encryption over Clinical Payload"
3. (3.3) "Generate 128-bit Authentication Tag & Package Ciphertext"
4. (3.4) "Compute 32-byte SHA-256 Hash of Complete Stored Package"
5. (3.5) "Store Encrypted Payload to Local Hospital Storage Appliance (Node A)"
6. (3.6) "Dispatch Signed JSON-RPC eth_sendTransaction to Anchor File Hash on Smart Contract"
Data store outputs: [D2: Appliance Filesystem Vault] and [D3: On-Chain Ledger State].
Clear, elegant software engineering DFD diagram, white background, black lines.
```

---

#### 5. Figure 4.5: On-chain data model (Entity-Relationship Diagram)
* **Filename to save in `images/`:** `Figure 4.5 On-chain data model.png`
* **Prompt for ChatGPT / DALL-E / Eraser.io:**
```text
A professional Entity-Relationship (ER) Diagram representing the on-chain and off-chain data model of an EVM healthcare ledger.
Show 5 entity tables with primary keys (PK), foreign keys (FK), and attributes:
1. "ConsortiumHospital"
   - adminWallet (PK, address)
   - name (string), endpoint (string), licenseId (string), isActive (bool), registeredAt (uint256)
2. "ConsortiumDoctor"
   - doctorWallet (PK, address)
   - name (string), licenseNumber (string), department (string), hospitalAdmin (FK, address), isVerified (bool)
   - Relationship: Hospital 1 to Many Doctor (credentials)
3. "PatientQueryToken"
   - patientHash (PK, bytes32 HMAC-SHA256 token)
4. "MedicalRecordEntry"
   - recordId (PK, uint256), fileHash (bytes32 SHA-256 digest), storageURI (string), practitionerAddress (FK, address), timestamp (uint256), recordType (string), isLocked (bool)
   - Relationship: PatientQueryToken 1 to Many MedicalRecordEntry
   - Relationship: Doctor 1 to Many MedicalRecordEntry (commits)
5. "AccessAuditLog"
   - logId (PK, uint256), patientHash (FK, bytes32), accessorDoctor (FK, address), accessedAt (uint256)
Modern crows-foot ER diagram notation, crisp borders, blue headers, white background.
```

---

#### 6. Figure 4.8: Class / module diagram
* **Filename to save in `images/`:** `Figure 4.8 Class module diagram.png`
* **Prompt for ChatGPT / DALL-E / Draw.io:**
```text
A formal UML Class / Module Diagram for an enterprise healthcare cryptography and blockchain engine:
Show 5 class boxes with private attributes (-) and public methods (+):
1. "CryptoEngineService"
   - masterSalt: string
   + hashPatientId(id: string, salt: string): bytes32
   + encryptRecord(payload: RecordPayload, key: CryptoKey): EncryptedPackage
   + decryptRecord(cipher: string, iv: string, tag: string): RecordPayload
   + computeFileHash(buffer: ArrayBuffer): bytes32
2. "BlockchainLedgerService"
   - contractAddress: address, rpcProvider: JsonRpcProvider
   + getPatientRecords(patientHash: bytes32): RecordPointer[]
   + addRecord(fileHash: bytes32, uri: string, recordType: string): TxReceipt
   + onboardHospital(admin: address, name: string): TxReceipt
   + registerDoctor(doctor: address, name: string): TxReceipt
3. "DoctorWorkstationController"
   - activeDoctor: address, isBiometricUnlocked: boolean
   + handleBiometricAuthentication(): void
   + verifyAndDecryptRecord(uri: string, expectedHash: bytes32): VerificationReport
4. "EmergencyTriageParser"
   + parseCompactUrl(queryString: string): TriageVitals
   + decodeOfflinePayload(raw: string): TriageData
Show dependency and association arrows between modules. Clean UML notation, white background.
```

---

#### 7. Figure 4.9: Component diagram
* **Filename to save in `images/`:** `Figure 4.9 Component diagram.png`
* **Prompt for ChatGPT / DALL-E / Eraser.io:**
```text
A formal UML Component Diagram for "MediQR":
Enclosing subsystem: "Next.js Web Runtime" containing:
- Component 1: "<<component>> Emergency Triage Module (/emergency)"
- Component 2: "<<component>> Doctor Clinical Workstation (/doctor)"
- Component 3: "<<component>> Government Commissioning Utility (/installer)"
- Component 4: "<<component>> Core Cryptography Engine (Web Crypto API, AES-256-GCM, HMAC)"
External components connected via interfaces (lollipop / socket connectors):
- Component 5: "<<component>> Hospital Storage Appliance (Docker REST Port 5001)" connected via REST HTTPS
- Component 6: "<<component>> Consortium Blockchain Validator (Hardhat / QBFT EVM Node)" connected via JSON-RPC 2.0
Clean structural component diagram, standard UML 2.0 component box icons, white background.
```

---

#### 8. Figure 4.10: Deployment diagram
* **Filename to save in `images/`:** `Figure 4.10 Deployment diagram.png`
* **Prompt for ChatGPT / DALL-E / Eraser.io:**
```text
A formal UML 3D-box Deployment Diagram showing distributed nodes and physical hardware execution:
1. Node: "<<device>> Paramedic Mobile Smartphone (Android / iOS)"
   - Artifact: "Mobile Web Browser (Google Lens / Chrome OCR)"
2. Node: "<<device>> Hospital A On-Premise Server (Dell PowerEdge R740)"
   - Environment: "<<executionEnvironment>> Docker Engine"
   - Artifact: "hospital-node-a:5001 Express Container"
   - Storage Volume: "<<storage>> /storage/hospital-a/*.enc.json"
3. Node: "<<device>> Hospital B On-Premise Server"
   - Environment: "<<executionEnvironment>> Docker Engine"
   - Artifact: "hospital-node-b:5002 Express Container"
4. Node: "<<device>> Consortium Blockchain EVM Peer Network"
   - Node 1: "Apollo Validator Peer (Port 8545)"
   - Node 2: "Fortis Validator Peer (Port 8545)"
   - Node 3: "Ministry of Health (MOH) Root Validator"
   - Connected via P2P QBFT Consensus.
Show network protocols: HTTPS (Port 443), Local REST (Port 5001), JSON-RPC (Port 8545).
```

---

#### 9. Figure 4.11: State diagram: pull-request / record lifecycle
* **Filename to save in `images/`:** `Figure 4.11 State diagram pull-request lifecycle.png`
* **Prompt for ChatGPT / DALL-E / Draw.io:**
```text
A formal UML State Machine Diagram showing the lifecycle of a medical record:
States (rounded rectangles):
- [Initial State: (*)]
- [1. Draft Consultation] -> Trigger: Doctor writes diagnosis & prescription
- [2. Client-Side AES-256-GCM Encrypted] -> Trigger: Browser Web Crypto API generates IV & AuthTag
- [3. Stored On Appliance] -> Trigger: POST ciphertext to Hospital Storage Node
- [4. Anchored On Ledger] -> Trigger: eth_sendTransaction records 32-byte SHA-256 hash on smart contract
- [5. Integrity Verification] -> Trigger: Attending Doctor queries record
Decision branch:
- State [6A: Verified & In-Memory Decrypted] (Green) if Local SHA-256 == Ledger Hash -> Render Patient Chart
- State [6B: Critical Tamper Alert Blocked] (Red) if Local SHA-256 != Ledger Hash -> Sound Red UI Alarm
- [Final State: (*)]
Clean UML state transitions with arrows, guard conditions in brackets [ ], white background.
```

---

#### 10. Figure 5.1: Project timeline (Gantt chart)
* **Filename to save in `images/`:** `Figure 5.1 Project timeline Gantt chart.png`
* **Prompt for ChatGPT / DALL-E / Canva:**
```text
A professional horizontal Gantt Chart for a 12-week software engineering project (Week 1 to Week 12).
Horizontal bars across 8 project tasks:
1. "T1: Domain Analysis & Statutory SRS" (Weeks 1 - 2) [Blue bar]
2. "T2: Core Cryptography & NIST Vectors" (Weeks 2 - 4) [Blue bar]
3. "T3: Smart Contract & Hardhat Tests" (Weeks 4 - 6) [Teal bar]
4. "T4: Docker Storage Node Appliance" (Weeks 6 - 7) [Teal bar]
5. "T5: Dual-Segment QR Engine & Paramedic Scanner" (Weeks 7 - 8) [Green bar]
6. "T6: Clinical Workstation & Biometrics" (Weeks 8 - 10) [Green bar]
7. "T7: Gov Installer & Legacy Migration" (Weeks 10 - 11) [Orange bar]
8. "T8: Auditing, Benchmarks & Final Documentation" (Weeks 11 - 12) [Purple bar]
Clear weekly grid lines from W1 to W12, clean professional corporate layout, white background.
```

---

#### 11. Figures 8.2, 8.3, 8.4: Terminal Output & User Workflow Screenshots
* **Option A (Instant Screenshots from your running app):**
  - Run `npm run dev:portal` in `doctor-portal/`.
  - Capture a screenshot of `http://localhost:3000/emergency` -> Save as `Figure 8.2 Terminal output repository creation commit push.png`.
  - Capture a screenshot of `http://localhost:3000/doctor` (with the green "✓ Blockchain Verified" badge) -> Save as `Figure 8.3 Terminal output blocked self-approval PR merge.png`.
  - Capture a screenshot of `http://localhost:3000/installer` (with the Government Official Commissioning Console) -> Save as `Figure 8.4 Terminal output rebase conflict detection resolution.png`.
* **Option B (AI Mockup Prompt):**
```text
High-fidelity UI mockups for an enterprise medical web application:
- Screenshot 1: "Roadside Emergency Triage Terminal" showing red alert banner, high-visibility "Blood Group: O-", "Penicillin G Anaphylaxis Warning", and green "Dial Emergency Contact" button.
- Screenshot 2: "Doctor Clinical Workstation" showing physician profile, green pill badge "✓ Blockchain Verified (SHA-256 Matched)", prescription list, and diagnostic lab panel.
- Screenshot 3: "Government Health Authority Commissioning Utility" in dark mode with Ministry of Health emblem, Hardware UUID binding card, and optical fingerprint scanner pad showing glowing blue laser sweep.
Modern web UI style, clean typography, crisp borders.
```

---

## ⚡ What to do once you generate an image:
1. Save the image into the `c:\Users\soham\Desktop\Work\projects\complete\purvaja-mediqr\images\` folder.
2. In your terminal, run:
   ```powershell
   python generate_mediqr_report.py
   ```
3. That's it! The script will automatically replace the placeholder box with your generated high-resolution diagram, properly centered and scaled!
