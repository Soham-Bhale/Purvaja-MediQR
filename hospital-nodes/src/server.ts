import express from 'express';
import cors from 'cors';
import path from 'path';
import { NodeStorageEngine } from './services/storage-engine';
import { createHospitalNodeRouter } from './routes/node-routes';

const PORT_HOSPITAL_A = process.env.PORT_HOSPITAL_A ? parseInt(process.env.PORT_HOSPITAL_A) : 5001;
const PORT_HOSPITAL_B = process.env.PORT_HOSPITAL_B ? parseInt(process.env.PORT_HOSPITAL_B) : 5002;

const STORAGE_A = path.join(__dirname, '..', 'storage', 'hospital-a');
const STORAGE_B = path.join(__dirname, '..', 'storage', 'hospital-b');

const KEY_A = process.env.KEY_HOSPITAL_A || 'MEDIQR_SECURE_HOSPITAL_KEY_APOLLO_2026';
const KEY_B = process.env.KEY_HOSPITAL_B || 'MEDIQR_SECURE_HOSPITAL_KEY_FORTIS_2026';

// Storage Engines
export const storageA = new NodeStorageEngine(STORAGE_A, KEY_A);
export const storageB = new NodeStorageEngine(STORAGE_B, KEY_B);

// --- SEED SAMPLE TEST RECORDS ---
export function seedSampleRecords() {
  const samplePatientHash = '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872';

  // Record 1 for Hospital A
  const rec1 = {
    recordId: 'REC-APOLLO-001',
    patientId: 'IN-AADHAAR-8934-2847-1902',
    patientName: 'Jane Doe',
    hospitalName: 'Apollo Speciality Hospital',
    hospitalNodeId: 'HOSPITAL-NODE-A',
    recordType: 'CONSULTATION',
    recordDate: '2026-09-10',
    diagnosis: 'Acute severe anaphylaxis, stabilized with epinephrine',
    clinicalNotes: 'Patient arrived with severe facial angioedema and wheezing post penicillin exposure. Administered IM Epinephrine 0.3mg immediately. Oxygen saturation normalized.',
    prescriptions: [
      { drug: 'Epinephrine Auto-Injector', dosage: '0.3mg', frequency: 'PRN (Emergency)', duration: '1 Year' },
      { drug: 'Cetirizine', dosage: '10mg', frequency: 'OD at night', duration: '7 days' },
      { drug: 'Prednisolone', dosage: '20mg', frequency: 'OD (Tapering)', duration: '5 days' }
    ],
    attendingPhysician: {
      name: 'Dr. Ramesh Gupta',
      licenseNumber: 'MCI-847291',
      department: 'Emergency Medicine',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    }
  };

  // Record 2 for Hospital B
  const rec2 = {
    recordId: 'REC-FORTIS-002',
    patientId: 'IN-AADHAAR-8934-2847-1902',
    patientName: 'Jane Doe',
    hospitalName: 'Fortis Healthcare',
    hospitalNodeId: 'HOSPITAL-NODE-B',
    recordType: 'LAB_RESULT',
    recordDate: '2026-09-12',
    diagnosis: 'Comprehensive Immunology & IgE Allergy Profile',
    clinicalNotes: 'Serum IgE levels substantially elevated. Specific IgE tests positive for Beta-lactam antibiotics and Peanut allergens.',
    prescriptions: [],
    labResults: [
      { test: 'Total Serum IgE', result: '480', unit: 'kU/L', normalRange: '< 100', flag: 'HIGH' },
      { test: 'Specific IgE (Penicillin G)', result: '14.2', unit: 'kUA/L', normalRange: '< 0.35', flag: 'CRITICAL' },
      { test: 'Absolute Eosinophil Count', result: '750', unit: 'cells/mcL', normalRange: '50 - 500', flag: 'HIGH' },
      { test: 'Complete Blood Count (WBC)', result: '8.2', unit: '10^3/mcL', normalRange: '4.5 - 11.0', flag: 'NORMAL' }
    ],
    attendingPhysician: {
      name: 'Dr. Ananya Sharma',
      licenseNumber: 'MCI-912044',
      department: 'Immunology & Pathology',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    }
  };

  const res1 = storageA.seedRecordIfMissing(rec1.recordId, samplePatientHash, 'HOSPITAL-NODE-A', rec1);
  const res2 = storageB.seedRecordIfMissing(rec2.recordId, samplePatientHash, 'HOSPITAL-NODE-B', rec2);

  console.log('[Hospital Node A] Seeded REC-APOLLO-001 with SHA-256:', res1.fileHash);
  console.log('[Hospital Node B] Seeded REC-FORTIS-002 with SHA-256:', res2.fileHash);

  return {
    patientHash: samplePatientHash,
    record1: { ...res1, recordType: rec1.recordType, storageURI: `http://localhost:${PORT_HOSPITAL_A}/api/records/${rec1.recordId}` },
    record2: { ...res2, recordType: rec2.recordType, storageURI: `http://localhost:${PORT_HOSPITAL_B}/api/records/${rec2.recordId}` }
  };
}

export function startHospitalServers() {
  // Hospital Node A Server
  const appA = express();
  appA.use(cors());
  appA.use(express.json({ limit: '10mb' }));
  appA.use(createHospitalNodeRouter('HOSPITAL-NODE-A', 'Hospital Node A - Apollo Speciality', storageA, PORT_HOSPITAL_A));

  const serverA = appA.listen(PORT_HOSPITAL_A, () => {
    console.log(`🏥 [Hospital Node A - Apollo] running on http://localhost:${PORT_HOSPITAL_A}`);
  });

  // Hospital Node B Server
  const appB = express();
  appB.use(cors());
  appB.use(express.json({ limit: '10mb' }));
  appB.use(createHospitalNodeRouter('HOSPITAL-NODE-B', 'Hospital Node B - Fortis Healthcare', storageB, PORT_HOSPITAL_B));

  const serverB = appB.listen(PORT_HOSPITAL_B, () => {
    console.log(`🏥 [Hospital Node B - Fortis] running on http://localhost:${PORT_HOSPITAL_B}`);
  });

  const seeded = seedSampleRecords();

  return { serverA, serverB, seeded };
}

if (require.main === module) {
  startHospitalServers();
}
