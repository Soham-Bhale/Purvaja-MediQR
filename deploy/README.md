# 🏥 MediQR Hospital Appliance Deployment & Distribution Guide

This directory contains the deployment specification for onboarding healthcare organizations (hospitals, diagnostic clinics, medical research centers) to the **MediQR Organizational Consortium Blockchain**.

---

## 1. Overview of the Distribution Model

Each healthcare provider operates a **MediQR Hospital Node Appliance**, consisting of:
1. **Off-Chain Encrypted Storage Engine (`mediqr-storage-node`)**:
   - Runs on hospital intranet or private VPC (HIPAA / DPDP compliant).
   - Encrypts clinical documents at rest using **AES-256-GCM** (128-bit MAC tag, random 12-byte IV).
   - Interacts with local PACS / EMR / EHR systems.
2. **Consortium Validator / RPC Client (`consortium-validator`)**:
   - Permissioned EVM peer (Hyperledger Besu / QBFT).
   - Synchronizes ledger state, validates SHA-256 fingerprints, and emits access audit logs without gas fees.

---

## 2. Hospital Onboarding Lifecycle

```
[ Step 1: Request ]       Hospital submits registration details & admin wallet address to Consortium Root.
        │
[ Step 2: Onboard ]       Root Admin calls `onboardHospital(adminWallet, name, endpoint, licenseId)` on-chain.
        │
[ Step 3: Deploy ]        Hospital IT launches `docker compose up -d` with their assigned credentials.
        │
[ Step 4: Credential ]    Hospital Admin accesses `/admin` or `/hospital` and registers attending physicians.
        │
[ Step 5: Live ]          Physicians can now issue dual-segment MediQRs and upload encrypted records.
```

---

## 3. Quickstart Deployment Instructions

### Prerequisites
- Docker Engine 24.0+ & Docker Compose v2+
- Port 5001 (Storage Node API) and Port 8545 (Consortium RPC) accessible internally.
- Valid TLS / SSL certificates for the node domain.

### Deployment Steps

1. **Clone or Download the Appliance Package**:
   ```bash
   git clone https://github.com/Soham-Bhale/Purvaja-MediQR.git
   cd Purvaja-MediQR/deploy
   ```

2. **Configure Environment Variables**:
   ```bash
   cp hospital-appliance.env.example .env
   # Edit .env with your assigned HOSPITAL_NODE_ID and HOSPITAL_ADMIN_WALLET
   ```

3. **Start the Appliance**:
   ```bash
   docker compose -f docker-compose.hospital-appliance.yml up -d
   ```

4. **Verify Health Status**:
   ```bash
   curl http://localhost:5001/health
   # Response: {"status":"healthy","hospital":"Apollo Speciality Hospital","port":5001}
   ```

---

## 4. Cascading Revocation & Regulatory Compliance
- If a hospital is audited and suspended by the Consortium Root Admin, the smart contract immediately deactivates the hospital (`hospitals[adminWallet].isActive = false`).
- **Automatic Cascading**: All physicians affiliated with that hospital are immediately blocked from committing new records or viewing patient archives until formal reinstatement.
