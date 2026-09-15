import { ethers } from 'ethers';
import { MEDICAL_RECORD_LEDGER_ABI } from './contract-abi';

export interface BlockchainRecord {
  fileHash: string;
  storageURI: string;
  practitionerAddress: string;
  timestamp: number;
  recordType: string;
  isLocked?: boolean;
}

export interface ConsortiumHospital {
  adminWallet: string;
  name: string;
  endpoint: string;
  licenseId: string;
  isActive: boolean;
  registeredAt: number;
}

export interface ConsortiumDoctor {
  doctorWallet: string;
  name: string;
  licenseNumber: string;
  department: string;
  hospitalAdmin: string;
  isVerified: boolean;
  registeredAt: number;
}

export const ROOT_ADMIN_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
export const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
export const LEDGER_STORAGE_KEY = 'mediqr_federation_ledger_v4';
export const HOSPITALS_STORAGE_KEY = 'mediqr_consortium_hospitals_v1';
export const DOCTORS_STORAGE_KEY = 'mediqr_consortium_doctors_v1';

// Default pre-seeded records (matching exact clean off-chain files)
const INITIAL_FEDERATION_LEDGER: Record<string, BlockchainRecord[]> = {
  '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872': [
    {
      fileHash: '0xf305f9e03ccdcfc6818534fd272f0178b9f5324b032b50bf90c8bfb607d83d72',
      storageURI: 'http://localhost:5001/api/records/REC-APOLLO-001',
      practitionerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
      recordType: 'CONSULTATION',
      isLocked: true,
    },
    {
      fileHash: '0x5e72612cee1e7204306c8bf2d6bc88f16b2ea822453260022812895f0b856ec6',
      storageURI: 'http://localhost:5002/api/records/REC-FORTIS-002',
      practitionerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
      recordType: 'LAB_RESULT',
      isLocked: true,
    },
  ],
};

export const INITIAL_HOSPITALS: ConsortiumHospital[] = [
  {
    adminWallet: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    name: 'MediQR Consortium Root Authority',
    endpoint: 'https://root.mediqr.org',
    licenseId: 'GOV-MOH-CONSORTIUM-001',
    isActive: true,
    registeredAt: 1726358400000,
  },
  {
    adminWallet: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    name: 'Apollo Speciality Hospital (Node A)',
    endpoint: 'http://localhost:5001',
    licenseId: 'HOSP-APOLLO-DEL-01',
    isActive: true,
    registeredAt: 1726358400000,
  },
  {
    adminWallet: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    name: 'Fortis Healthcare Network (Node B)',
    endpoint: 'http://localhost:5002',
    licenseId: 'HOSP-FORTIS-BLR-02',
    isActive: true,
    registeredAt: 1726358400000,
  },
];

export const INITIAL_DOCTORS: ConsortiumDoctor[] = [
  {
    doctorWallet: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    name: 'Dr. Ramesh Gupta',
    licenseNumber: 'MCI-DEL-10294',
    department: 'Lead Emergency Medicine',
    hospitalAdmin: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    isVerified: true,
    registeredAt: 1726358400000,
  },
  {
    doctorWallet: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    name: 'Dr. Ananya Sharma',
    licenseNumber: 'MCI-BOM-88392',
    department: 'Chief Pathology & Diagnostics',
    hospitalAdmin: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    isVerified: true,
    registeredAt: 1726358400000,
  },
  {
    doctorWallet: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
    name: 'Dr. John Unverified',
    licenseNumber: 'UNVERIFIED-NONE',
    department: 'Unregistered Clinic',
    hospitalAdmin: '0x0000000000000000000000000000000000000000',
    isVerified: false,
    registeredAt: 1726358400000,
  },
];

// In-memory caches
let inMemoryLedger: Record<string, BlockchainRecord[]> = { ...INITIAL_FEDERATION_LEDGER };
let inMemoryHospitals: ConsortiumHospital[] = [...INITIAL_HOSPITALS];
let inMemoryDoctors: ConsortiumDoctor[] = [...INITIAL_DOCTORS];

// --- STORAGE ACCESSORS ---

export function getStoredLedger(): Record<string, BlockchainRecord[]> {
  if (typeof window === 'undefined') return inMemoryLedger;
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (raw) return { ...INITIAL_FEDERATION_LEDGER, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading persistent ledger:', err);
  }
  return inMemoryLedger;
}

export function persistLedger(ledger: Record<string, BlockchainRecord[]>): void {
  inMemoryLedger = ledger;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
    } catch (err) {
      console.error('Error persisting ledger:', err);
    }
  }
}

export function getStoredHospitals(): ConsortiumHospital[] {
  if (typeof window === 'undefined') return inMemoryHospitals;
  try {
    const raw = localStorage.getItem(HOSPITALS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored hospitals:', err);
  }
  return inMemoryHospitals;
}

export function persistHospitals(hospitals: ConsortiumHospital[]): void {
  inMemoryHospitals = hospitals;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(hospitals));
    } catch (err) {
      console.error('Error persisting hospitals:', err);
    }
  }
}

export function getStoredDoctors(): ConsortiumDoctor[] {
  if (typeof window === 'undefined') return inMemoryDoctors;
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored doctors:', err);
  }
  return inMemoryDoctors;
}

export function persistDoctors(doctors: ConsortiumDoctor[]): void {
  inMemoryDoctors = doctors;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
    } catch (err) {
      console.error('Error persisting doctors:', err);
    }
  }
}

// Map for quick doctor lookup
export const VERIFIED_DOCTORS: Record<string, { name: string; hospital: string }> = {
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': {
    name: 'Consortium Root Admin (Ministry of Health)',
    hospital: 'MediQR Consortium Root Authority',
  },
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': {
    name: 'Dr. Ramesh Gupta (Lead Emergency Physician)',
    hospital: 'Apollo Speciality Hospital (Node A)',
  },
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': {
    name: 'Dr. Ananya Sharma (Chief Pathologist)',
    hospital: 'Fortis Healthcare (Node B)',
  },
};

// --- CONSORTIUM GOVERNANCE METHODS ---

/**
 * Onboards a new hospital to the organizational consortium.
 */
export async function onboardHospitalOnChain(
  hospital: ConsortiumHospital,
  callerWallet: string
): Promise<{ success: boolean; txHash: string }> {
  // Check authorization
  const isRoot = callerWallet.toLowerCase() === ROOT_ADMIN_ADDRESS.toLowerCase();
  if (!isRoot) {
    throw new Error('403 Forbidden: Only Consortium Root Admin can onboard hospitals.');
  }

  // Try live EVM
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 300)),
    ]);
    const signer = await provider.getSigner(callerWallet);
    const contract = new ethers.Contract(DEFAULT_CONTRACT_ADDRESS, MEDICAL_RECORD_LEDGER_ABI, signer);
    const tx = await contract.onboardHospital(
      hospital.adminWallet,
      hospital.name,
      hospital.endpoint,
      hospital.licenseId
    );
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch {
    // Fallback: update persistent client state
    const current = getStoredHospitals();
    const existingIdx = current.findIndex(
      (h) => h.adminWallet.toLowerCase() === hospital.adminWallet.toLowerCase()
    );
    if (existingIdx >= 0) {
      throw new Error(`Hospital with admin wallet ${hospital.adminWallet} is already registered.`);
    }
    const updated = [hospital, ...current];
    persistHospitals(updated);
    const mockTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}`;
    return { success: true, txHash: mockTxHash };
  }
}

/**
 * Toggles active/suspended status of a hospital.
 */
export async function toggleHospitalStatusOnChain(
  adminWallet: string,
  callerWallet: string
): Promise<{ success: boolean; newStatus: boolean }> {
  const isRoot = callerWallet.toLowerCase() === ROOT_ADMIN_ADDRESS.toLowerCase();
  if (!isRoot) {
    throw new Error('403 Forbidden: Only Consortium Root Admin can change hospital status.');
  }

  const current = getStoredHospitals();
  const idx = current.findIndex((h) => h.adminWallet.toLowerCase() === adminWallet.toLowerCase());
  if (idx === -1) throw new Error('Hospital not found in consortium registry.');

  const newStatus = !current[idx].isActive;
  current[idx].isActive = newStatus;
  persistHospitals(current);

  return { success: true, newStatus };
}

/**
 * Registers a doctor under a certified hospital.
 */
export async function registerDoctorOnChain(
  doctor: ConsortiumDoctor,
  callerWallet: string
): Promise<{ success: boolean; txHash: string }> {
  const isRoot = callerWallet.toLowerCase() === ROOT_ADMIN_ADDRESS.toLowerCase();
  const isHospitalAdmin = callerWallet.toLowerCase() === doctor.hospitalAdmin.toLowerCase();

  if (!isRoot && !isHospitalAdmin) {
    throw new Error('403 Forbidden: Only affiliated Hospital Admin or Root Admin can register doctors.');
  }

  const current = getStoredDoctors();
  const existingIdx = current.findIndex(
    (d) => d.doctorWallet.toLowerCase() === doctor.doctorWallet.toLowerCase()
  );

  if (existingIdx >= 0) {
    current[existingIdx] = doctor;
  } else {
    current.push(doctor);
  }
  persistDoctors(current);

  const mockTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  return { success: true, txHash: mockTxHash };
}

/**
 * Toggles doctor verified status.
 */
export async function toggleDoctorStatusOnChain(
  doctorWallet: string,
  callerWallet: string
): Promise<{ success: boolean; newStatus: boolean }> {
  const current = getStoredDoctors();
  const idx = current.findIndex((d) => d.doctorWallet.toLowerCase() === doctorWallet.toLowerCase());
  if (idx === -1) throw new Error('Doctor not found in registry.');

  const doctor = current[idx];
  const isRoot = callerWallet.toLowerCase() === ROOT_ADMIN_ADDRESS.toLowerCase();
  const isHospitalAdmin = callerWallet.toLowerCase() === doctor.hospitalAdmin.toLowerCase();

  if (!isRoot && !isHospitalAdmin) {
    throw new Error('403 Forbidden: Unauthorized to modify this doctor.');
  }

  const newStatus = !doctor.isVerified;
  current[idx].isVerified = newStatus;
  persistDoctors(current);

  return { success: true, newStatus };
}

// --- RECORD QUERY & COMMIT ---

export async function getPatientRecordsFromLedger(
  patientHash: string,
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS
): Promise<{ records: BlockchainRecord[]; source: 'live-evm' | 'federation-state' }> {
  const normalizedHash = patientHash.trim().toLowerCase();

  // Try live EVM with a fast 300ms probe
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Probe Timeout')), 300)),
    ]);

    const code = await provider.getCode(contractAddress);
    if (code && code !== '0x') {
      const contract = new ethers.Contract(contractAddress, MEDICAL_RECORD_LEDGER_ABI, provider);
      const rawRecords = await contract.viewPatientRecords(patientHash);
      const formatted: BlockchainRecord[] = rawRecords.map((r: any) => ({
        fileHash: r.fileHash,
        storageURI: r.storageURI,
        practitionerAddress: r.practitionerAddress,
        timestamp: Number(r.timestamp),
        recordType: r.recordType,
      }));
      return { records: formatted, source: 'live-evm' };
    }
  } catch {
    // Fall back to persistent storage
  }

  const stored = getStoredLedger();
  const match = Object.entries(stored).find(
    ([k]) => k.toLowerCase() === normalizedHash
  );

  return {
    records: match ? match[1] : [],
    source: 'federation-state',
  };
}

export async function commitRecordOnChain(
  patientHash: string,
  fileHash: string,
  storageURI: string,
  recordType: string,
  practitionerAddress: string,
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockNumber: number }> {
  const newRecord: BlockchainRecord = {
    fileHash,
    storageURI,
    practitionerAddress,
    timestamp: Math.floor(Date.now() / 1000),
    recordType,
  };

  // Try live EVM
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Probe Timeout')), 300)),
    ]);
    const signer = await provider.getSigner(practitionerAddress);
    const contract = new ethers.Contract(contractAddress, MEDICAL_RECORD_LEDGER_ABI, signer);
    const tx = await contract.addRecord(patientHash, fileHash, storageURI, recordType);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch {
    // Fall back to persistent client-side state
    const currentLedger = getStoredLedger();
    const cleanKey = patientHash.toLowerCase();

    if (!currentLedger[cleanKey]) {
      currentLedger[cleanKey] = [];
    }
    currentLedger[cleanKey].unshift(newRecord);
    persistLedger(currentLedger);

    const mockTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}`;

    return {
      txHash: mockTxHash,
      blockNumber: Math.floor(Date.now() / 1000) - 1700000000,
    };
  }
}

export interface LegacyImportItem {
  patientHash: string;
  fileHash: string;
  storageURI: string;
  recordType: string;
  practitionerAddress: string;
  historicalTimestamp: number;
}

/**
 * Bulk imports legacy medical records by the Consortium Root Admin (Highest Authority).
 */
export async function batchImportLegacyRecordsOnChain(
  imports: LegacyImportItem[],
  callerWallet: string,
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS
): Promise<{ success: boolean; txHash: string; count: number }> {
  const isRoot = callerWallet.toLowerCase() === ROOT_ADMIN_ADDRESS.toLowerCase();
  if (!isRoot) {
    throw new Error('403 Forbidden: Only the Consortium Root Admin (Highest Authority) can execute bulk legacy data imports.');
  }

  // Update persistent local ledger for instant offline/demo reflection
  const currentLedger = getStoredLedger();
  for (const item of imports) {
    const key = item.patientHash.toLowerCase();
    if (!currentLedger[key]) {
      currentLedger[key] = [];
    }
    currentLedger[key].unshift({
      fileHash: item.fileHash,
      storageURI: item.storageURI,
      practitionerAddress: item.practitionerAddress || ROOT_ADMIN_ADDRESS,
      timestamp: item.historicalTimestamp || Math.floor(Date.now() / 1000),
      recordType: item.recordType || 'CONSULTATION',
      isLocked: true,
    });
  }
  persistLedger(currentLedger);

  // Try live EVM transaction
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 300)),
    ]);
    const signer = await provider.getSigner(callerWallet);
    const contract = new ethers.Contract(contractAddress, MEDICAL_RECORD_LEDGER_ABI, signer);
    const tx = await contract.batchImportHistoricalRecords(imports);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash, count: imports.length };
  } catch {
    const mockTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}`;
    return { success: true, txHash: mockTxHash, count: imports.length };
  }
}

