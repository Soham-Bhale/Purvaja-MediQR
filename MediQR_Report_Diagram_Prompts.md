# 🎨 MediQR Project Report: Comprehensive Diagram Generation Prompts

This document provides ready-to-use prompts for generating all figures in the **MediQR Engineering Project Report**. You can use these in **ChatGPT (GPT-4o / DALL-E 3)**, **Eraser.io**, **Draw.io**, **PlantUML**, or directly render the provided **Mermaid.js** code blocks in Markdown viewers.

---

## 📌 Figure 1.1: High-Level View of the MediQR Ecosystem

### 🤖 AI Image / Diagram Generation Prompt (ChatGPT / Eraser.io / Midjourney):
```text
Create a clean, professional, high-resolution software architecture diagram for an enterprise healthcare blockchain project called "MediQR".
Layout is split horizontally:
At the top, a physical "MediQR Smart Card" divided into two sections:
1. Left: "Public Front: Emergency Triage" with an optical QR code icon, pointing downwards to an ambulance paramedic holding a smartphone displaying: "Blood Group: O-", "Allergy: Penicillin G", "Emergency Call Mom". Label: "Offline Instant Access (<1.5s, No Login)".
2. Right: "Protected Back: Medical Vault" with an encrypted QR icon, pointing downwards to an "Attending Physician" at a hospital terminal with a biometric fingerprint icon and blue key: "AES-256-GCM Decryption", "Full Clinical Dossier".
At the bottom, an immutable "Consortium Blockchain Ledger" (Ethereum EVM smart contract MedicalRecordLedger.sol) showing digital wax seals with 32-byte SHA-256 fingerprints: "0xf305...3d72" and "Hierarchical Doctor RBAC". An arrow connects the physician's verified hash to the blockchain with a green checkmark: "✓ Hash Matched (Tamper-Proof Provenance)".
Color palette: Professional medical navy blue, emerald green, crisp white background, modern flat vector design, clean tech diagram style.
```

### 💻 Mermaid Code:
```mermaid
flowchart TD
    subgraph Card["🪪 PATIENT MEDIQR DUAL-SEGMENT CARD"]
        subgraph Front["PUBLIC FRONT: Emergency Triage"]
            QR1["📷 Compact Optical QR (<95 chars)"]
        end
        subgraph Back["PROTECTED BACK: Medical Vault"]
            QR2["🔐 Encrypted Vault QR (HMAC + URI)"]
        end
    end

    QR1 -->|"Camera Scan (Zero-Auth, Offline)"| Paramedic["🚑 First Responder / EMT\n• Blood: O-\n• Critical Allergy: Penicillin G\n• Tap-to-Dial Contact\n[<1.5s Latency]"]
    
    QR2 -->|"Hospital Node REST Query"| Doctor["🩺 Attending Physician\n• Biometric Fingerprint Auth\n• Client AES-256-GCM Decrypt\n• Full Consultation & Lab Dossier"]
    
    Doctor <-->|"Compare 32-Byte SHA-256 Digest"| Ledger[("⛓️ Consortium Blockchain\nMedicalRecordLedger.sol\n• Immutable Document Fingerprints\n• Hierarchical Doctor RBAC\n• Zero On-Chain PHI")]

    classDef card fill:#f0f4f8,stroke:#1a365d,stroke-width:2px;
    classDef emergency fill:#fff5f5,stroke:#e53e3e,stroke-width:2px;
    classDef clinical fill:#ebf8ff,stroke:#3182ce,stroke-width:2px;
    classDef chain fill:#f0fff4,stroke:#38a169,stroke-width:2px;
    class Card card;
    class Front,Paramedic emergency;
    class Back,Doctor clinical;
    class Ledger chain;
```

---

## 📌 Figure 3.1: Incremental Process Model Applied to This Project

### 🤖 AI Prompt:
```text
A professional horizontal sequential pipeline diagram representing the Incremental Software Development Life Cycle (SDLC) for a blockchain healthcare project.
Six sequential rectangular boxes linked with thick forward arrows:
1. "Increment 1: Core Cryptography & NIST Vectors (HMAC-SHA256, AES-256-GCM, SHA-256)"
2. "Increment 2: Smart Contract Ledger (MedicalRecordLedger.sol, Hierarchical RBAC, Hardhat 14/14)"
3. "Increment 3: Off-Chain Storage Appliances (Docker Containers, Express REST, Tamper Simulation API)"
4. "Increment 4: Compact Optical QR Engine (Anti-Moiré Compression, Google Lens <20ms Parsing)"
5. "Increment 5: Clinical Workstations & Decoupling (Doctor Terminal, Biometric Gatekeeper, Gov Installer)"
6. "Increment 6: Integration & Auditing (Bulk Legacy Ingestion, Automated Security & Tamper Proofing)"
Clean corporate tech style, white background, subtle gradients of blue and teal.
```

### 💻 Mermaid Code:
```mermaid
flowchart LR
    Inc1["Increment 1<br/><b>Core Cryptography</b><br/>• HMAC-SHA256<br/>• AES-256-GCM<br/>• NIST Vectors"] -->
    Inc2["Increment 2<br/><b>Smart Contract</b><br/>• Solidity Ledger<br/>• Hierarchical RBAC<br/>• Hardhat 14/14"] -->
    Inc3["Increment 3<br/><b>Storage Appliance</b><br/>• Docker Nodes<br/>• Express REST<br/>• Tamper Sim API"] -->
    Inc4["Increment 4<br/><b>Compact QR Engine</b><br/>• Anti-Moiré Compression<br/>• Google Lens Safe<br/>• <95 Char URL"] -->
    Inc5["Increment 5<br/><b>EMR Workstations</b><br/>• Doctor Portal<br/>• Biometric Sensor<br/>• Gov Installer"] -->
    Inc6["Increment 6<br/><b>Auditing & Release</b><br/>• Legacy Ingestion<br/>• Tamper Detection<br/>• Benchmarking"]
```

---

## 📌 Figure 4.1: System Architecture (Client, Storage Appliance, On-Chain Contract)

### 🤖 AI Prompt:
```text
A detailed three-tier enterprise software architecture diagram for "MediQR":
1. Top Tier (Client Workstation Layer in Browser):
   - "Emergency Paramedic Triage UI (/emergency)"
   - "Doctor Clinical EMR Workstation (/doctor) with Biometric Sensor"
   - "Government Appliance Installer (/installer)"
   - "W3C Web Cryptography API Engine (AES-256-GCM + HMAC-SHA256)"
2. Middle Tier (Decentralized Hospital Storage Appliances):
   - Two Docker containers: "Hospital Node A (Apollo - Port 5001)" and "Hospital Node B (Fortis - Port 5002)"
   - Inside each container: "Express REST Engine", "Encrypted JSON File Vault", "Tamper Injection Simulator"
3. Bottom Tier (Consortium Blockchain Network):
   - "EVM Smart Contract: MedicalRecordLedger.sol"
   - Features: "32-byte SHA-256 Document Hashes", "Hierarchical RBAC", "Non-repudiable Access Logs", "Zero-Gas QBFT Consensus"
Connect layers with labeled directional arrows: HTTPS Encrypted REST between Client and Hospital Nodes; Signed JSON-RPC between Client and Blockchain.
Clean flat architectural vector illustration, blue and cyan accents, white background.
```

### 💻 Mermaid Code:
```mermaid
flowchart TB
    subgraph Client["CLIENT WORKSTATION LAYER (Web Browser)"]
        UI_Paramedic["🚑 Paramedic Triage UI\n(/emergency)"]
        UI_Doctor["🩺 Clinical EMR Workstation\n(/doctor)"]
        UI_Gov["🏛️ Gov Commissioning Console\n(/installer)"]
        CryptoCore["🔐 Web Crypto API Engine\n• AES-256-GCM Client Decrypt\n• HMAC-SHA256 Patient Token\n• SHA-256 Hash Matching"]
        UI_Doctor --> CryptoCore
        UI_Gov --> CryptoCore
    end

    subgraph Storage["DECENTRALIZED STORAGE APPLIANCES (On-Premise Docker)"]
        subgraph NodeA["Hospital A Appliance (Port 5001)"]
            API_A["Express REST Server"]
            Vault_A["Encrypted JSON Vault\nREC-APOLLO-001.enc.json"]
            Sim_A["Tamper Simulator API"]
            API_A --- Vault_A
            API_A --- Sim_A
        end
        subgraph NodeB["Hospital B Appliance (Port 5002)"]
            API_B["Express REST Server"]
            Vault_B["Encrypted JSON Vault\nREC-FORTIS-002.enc.json"]
            API_B --- Vault_B
        end
    end

    subgraph Blockchain["CONSORTIUM BLOCKCHAIN NETWORK (EVM / Hardhat / QBFT)"]
        Contract["📜 MedicalRecordLedger.sol\n• records[patientHash] -> BlockchainRecord[]\n• fileHash: bytes32 (SHA-256 Fingerprint)\n• hospitals & doctors RBAC mapping\n• RecordAdded & RecordAccessed Events"]
    end

    UI_Paramedic -.->|"Offline Optical Scan (<1.5s)"| UI_Paramedic
    CryptoCore <==>|"HTTPS REST (Encrypted Ciphertext)"| Storage
    CryptoCore <==>|"Signed JSON-RPC 2.0 (eth_call / eth_sendTransaction)"| Blockchain
```

---

## 📌 Figure 4.2, 4.3, 4.4: Data Flow Diagrams (Level 0, Level 1, Level 2)

### 💻 Mermaid Code for Level 0 DFD (Context Diagram):
```mermaid
flowchart TD
    Paramedic["Paramedic / EMT"] -->|"1. Scans Emergency Optical QR"| MediQR(("0.0\nMediQR Healthcare\nLedger System"))
    MediQR -->|"2. Returns Immediate Blood & Allergy Vitals"| Paramedic
    
    Doctor["Attending Doctor"] -->|"3. Enters Biometrics & Queries Patient Hash"| MediQR
    MediQR -->|"4. Returns Verified Clinical History"| Doctor
    Doctor -->|"5. Commits AES-GCM Encrypted Record"| MediQR
    
    HospitalAdmin["Hospital Admin & Gov Official"] -->|"6. Commissions Node & Enrolls Doctor Biometric"| MediQR
    
    MediQR <-->|"7. Anchors SHA-256 Hashes & Reads Proofs"| Blockchain[("Consortium Blockchain\n(EVM Ledger)")]
```

### 💻 Mermaid Code for Level 1 DFD:
```mermaid
flowchart TD
    P[Paramedic] -->|"Optical QR Scan"| P1(("1.0 Emergency\nTriage Parser"))
    P1 -->|"Decode URL Query"| D1[("D1: Optical Cache")]
    P1 -->|"Display Vitals"| P

    Doc[Attending Doctor] -->|"Touch Fingerprint Pad"| P2(("2.0 Biometric\nGatekeeper"))
    P2 -->|"Session Token"| Doc
    Doc -->|"Input Medical Diagnosis"| P3(("3.0 Encrypt &\nAnchor Record"))
    P3 -->|"Store Ciphertext JSON"| D2[("D2: Hospital Appliance Vault")]
    P3 -->|"Anchor 32-byte SHA-256"| D3[("D3: EVM Ledger Contract")]

    Doc -->|"Query Patient Hash"| P4(("4.0 Query & Cryptographic\nVerify Record"))
    D3 -->|"Fetch Recorded File Hash"| P4
    D2 -->|"Fetch Stored Ciphertext"| P4
    P4 -->|"Compare Hashes & Decrypt"| Doc
```

---

## 📌 Figure 4.5: On-Chain Data Model (Entity-Relationship)

### 💻 Mermaid Code:
```mermaid
erDiagram
    ConsortiumHospital ||--o{ ConsortiumDoctor : credentials
    ConsortiumDoctor ||--o{ MedicalRecordEntry : commits
    PatientQueryToken ||--o{ MedicalRecordEntry : indexes
    ConsortiumHospital ||--o{ AccessAuditLog : operates
    ConsortiumDoctor ||--o{ AccessAuditLog : emits

    ConsortiumHospital {
        address adminWallet PK
        string name
        string endpoint
        string licenseId
        bool isActive
        uint256 registeredAt
    }

    ConsortiumDoctor {
        address doctorWallet PK
        string name
        string licenseNumber
        string department
        address hospitalAdmin FK
        bool isVerified
        uint256 registeredAt
    }

    PatientQueryToken {
        bytes32 patientHash PK "HMAC-SHA256 Token"
    }

    MedicalRecordEntry {
        uint256 recordId PK
        bytes32 fileHash "SHA-256 Document Fingerprint"
        string storageURI "Off-chain Appliance REST Endpoint"
        address practitionerAddress FK
        uint256 timestamp
        string recordType "CONSULTATION / LAB / SURGERY"
        bool isLocked
    }

    AccessAuditLog {
        uint256 logId PK
        bytes32 patientHash FK
        address accessorDoctor FK
        uint256 accessedAt
        string action "QUERY / VERIFY"
    }
```

---

## 📌 Figure 4.6: UML Use Case Diagram

### 💻 Mermaid Code:
```mermaid
flowchart LR
    subgraph ParamedicActor["🚑 Paramedic"]
        P_User((Paramedic))
    end

    subgraph DoctorActor["🩺 Doctor"]
        D_User((Attending Physician))
    end

    subgraph AdminActor["🏛️ Admin"]
        A_User((Hospital & Gov Admin))
    end

    subgraph System["MediQR Enterprise Healthcare Ledger"]
        UC1(["UC-01: Scan Roadside Emergency QR"])
        UC2(["UC-02: Instant One-Touch Emergency Dial"])
        UC3(["UC-03: Authenticate via Biometric Fingerprint"])
        UC4(["UC-04: Encrypt & Commit Clinical Dossier"])
        UC5(["UC-05: Query Patient History & Verify SHA-256"])
        UC6(["UC-06: Simulate Tamper Attack & Verify Alert"])
        UC7(["UC-07: Credential & Revoke Hospital Doctors"])
        UC8(["UC-08: Commission Node & Hardware UUID Seal"])
        UC9(["UC-09: Batch Ingest Historical Legacy EHRs"])
        UC10(["UC-10: Onboard & Suspend Hospital Nodes"])
    end

    P_User --> UC1
    P_User --> UC2

    D_User --> UC3
    D_User --> UC4
    D_User --> UC5
    D_User --> UC6

    A_User --> UC7
    A_User --> UC8
    A_User --> UC9
    A_User --> UC10
```

---

## 📌 Figure 4.7: UML Sequence Diagram (Cross-Hospital Verification Flow)

### 💻 Mermaid Code:
```mermaid
sequenceDiagram
    autonumber
    actor Doctor as 🩺 Attending Physician
    participant Workstation as 💻 Clinical Workstation
    participant HospitalA as 🏥 Local Node A (Apollo)
    participant Ledger as ⛓️ MedicalRecordLedger.sol
    participant HospitalB as 🏥 Remote Node B (Fortis)

    Doctor->>Workstation: Touch Biometric Sensor (500 DPI Minutiae)
    Workstation-->>Doctor: 🔓 Session Unlocked (Token Active)

    Doctor->>Workstation: Enter Patient Query Token (HMAC-SHA256)
    Workstation->>Ledger: eth_call getRecords(patientHash)
    Ledger-->>Workstation: Return Record Pointers [fileHash: 0xf305..., storageURI: "http://node-b:5002/..."]

    Workstation->>HospitalB: GET /api/records/REC-FORTIS-002
    HospitalB-->>Workstation: Return Encrypted Package { ciphertext, iv, authTag }

    Workstation->>Workstation: Compute SHA-256(Retrieved File Bytes)
    
    alt Hashes Match Exactly
        Workstation->>Workstation: Verify fileHash == 0xf305... (MATCH!)
        Workstation->>Workstation: In-Memory AES-256-GCM Decrypt
        Workstation-->>Doctor: ✓ Display Verified Clinical Record (Green Badge)
        Workstation->>Ledger: Emit RecordAccessed(patientHash, doctorWallet)
    else Hash Mismatch (Tampering Detected)
        Workstation->>Workstation: Hash Mismatch (0xbad1 != 0xf305...)
        Workstation-->>Doctor: ⚠️ CRITICAL ALERT: Tampered Record Blocked (Red Alert)
    end
```

---

## 📌 Figure 4.10: UML Deployment Diagram

### 💻 Mermaid Code:
```mermaid
flowchart TB
    subgraph MobileDevice["📱 Mobile Paramedic Terminal"]
        Browser["HTML5 Camera & Web Browser\n(Google Lens / Chromium Engine)"]
    end

    subgraph HospitalNodeA["🏥 Apollo Speciality Hospital (Node A)"]
        subgraph DockerHostA["Docker Container Engine"]
            NodeAppA["Node.js Express Server (Port 5001)\n• REST Storage Engine\n• Tamper Injection Simulator"]
            StorageVolA[("Local Volume Mount\n/storage/hospital-a/*.enc.json")]
            NodeAppA --- StorageVolA
        end
        DoctorPC_A["💻 Doctor Clinical PC\n(Web Crypto API + Optical Scanner)"]
        DoctorPC_A <-->|"LAN HTTP Port 5001"| NodeAppA
    end

    subgraph HospitalNodeB["🏥 Fortis Healthcare Network (Node B)"]
        subgraph DockerHostB["Docker Container Engine"]
            NodeAppB["Node.js Express Server (Port 5002)\n• REST Storage Engine"]
            StorageVolB[("Local Volume Mount\n/storage/hospital-b/*.enc.json")]
            NodeAppB --- StorageVolB
        end
    end

    subgraph ConsortiumEVM["⛓️ Quorum / EVM Consortium Blockchain"]
        ValA["Validator Peer A\n(Apollo Node)"]
        ValB["Validator Peer B\n(Fortis Node)"]
        ValGov["Validator Peer C\n(NHA / MOH Root)"]
        ValA <-->|"QBFT P2P Consensus Port 8545"| ValB
        ValB <-->|"QBFT P2P Consensus Port 8545"| ValGov
    end

    MobileDevice -->|"Public Internet HTTPS"| DoctorPC_A
    DoctorPC_A <-->|"JSON-RPC (eth_call / sendTx)"| ValA
    NodeAppA <-->|"Inter-Hospital Firewall mTLS"| NodeAppB
```

---

## 📌 Figure 4.11: State Machine Diagram (Record Lifecycle & Tamper Rejection)

### 💻 Mermaid Code:
```mermaid
stateDiagram-v2
    [*] --> DraftClinicalRecord : Doctor writes notes & Rx
    
    DraftClinicalRecord --> ClientEncrypted : Web Crypto AES-256-GCM
    note right of ClientEncrypted : 96-bit random IV & 128-bit AuthTag generated
    
    ClientEncrypted --> OffChainStored : POST to Hospital Storage Appliance
    note right of OffChainStored : Stored behind hospital firewall as .enc.json
    
    OffChainStored --> OnChainAnchored : eth_sendTransaction addRecord()
    note right of OnChainAnchored : SHA-256 Document Hash anchored on Solidity ledger
    
    OnChainAnchored --> QueryInitiated : Doctor / ER requests patient history
    
    QueryInitiated --> IntegrityCheck : Fetch file & compute local SHA-256
    
    state IntegrityCheck <<choice>>
    IntegrityCheck --> DecryptedVerified : Local SHA-256 == Ledger Hash
    IntegrityCheck --> TamperBlocked : Local SHA-256 != Ledger Hash
    
    DecryptedVerified --> [*] : Render Clean Clinical Dossier
    TamperBlocked --> [*] : Sound Red UI Alarm & Block Memory Decrypt
```

---

## 📌 Figure 8.1: Benchmarking Charts

### 🤖 AI Prompt (For DALL-E / Midjourney / Canva):
```text
A clean corporate benchmark chart comparing three healthcare architectures:
Chart 1 (Bar Chart): "Emergency Triage Retrieval Latency (Seconds)"
- Centralized EHR (Epic/FHIR): 900 seconds (15 minutes) [Grey bar]
- Academic On-Chain Blockchain: 45 seconds [Orange bar]
- MediQR Enterprise: 1.5 seconds [Emerald Green bar]
Chart 2 (Bar Chart): "Tamper Detection Rate (%)"
- Centralized EHR: 0% (Silent database rewrite) [Red bar]
- MediQR Enterprise: 100% (Guaranteed cryptographic block) [Emerald Green bar]
Chart 3 (Bar Chart): "Transaction Gas Cost per Medical Record ($ USD)"
- Public Ethereum L1: $24.50 [Red bar]
- MediQR QBFT Consortium: $0.00 (Zero-Gas Medical Infrastructure) [Emerald Green bar]
Modern scientific presentation, clean typography, white background.
```

---

## 💡 How to Insert These Into Word (`MediQR_Final_Project_Report.docx`):
1. **Option A (Mermaid Live Editor)**: Copy any of the Mermaid code blocks above, paste into [mermaid.live](https://mermaid.live), click **Download PNG / SVG**, and insert directly into the Word document at the corresponding figure placeholder.
2. **Option B (Eraser.io / Draw.io)**: Paste the AI prompts or Mermaid code into Eraser.io or Draw.io to generate presentation-grade diagrams with custom hospital and blockchain icons.
3. **Option C (Direct Screenshot Capture)**: Run `npm run dev:portal` and capture live screenshots of `http://localhost:3000/emergency`, `http://localhost:3000/doctor`, and `http://localhost:3000/installer` to place into Figures 8.2, 8.3, and 8.4!
