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

export interface DoctorSession {
  isConnected: boolean;
  address: string;
  name: string;
  hospitalName: string;
  isVerified: boolean;
  network: string;
}

export const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
export const LEDGER_STORAGE_KEY = 'mediqr_federation_ledger_v4';
export const LAST_HASH_KEY = 'mediqr_last_registered_hash';

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

// In-memory cache
let inMemoryLedger: Record<string, BlockchainRecord[]> = { ...INITIAL_FEDERATION_LEDGER };

/**
 * Loads persistent ledger records from localStorage, merging with defaults.
 */
export function getStoredLedger(): Record<string, BlockchainRecord[]> {
  if (typeof window === 'undefined') {
    return inMemoryLedger;
  }

  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with initial records
      return {
        ...INITIAL_FEDERATION_LEDGER,
        ...parsed,
      };
    }
  } catch (err) {
    console.error('Error reading persistent ledger from localStorage:', err);
  }

  return inMemoryLedger;
}

/**
 * Persists ledger records to localStorage and memory.
 */
export function persistLedger(ledger: Record<string, BlockchainRecord[]>): void {
  inMemoryLedger = ledger;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
    } catch (err) {
      console.error('Error writing persistent ledger to localStorage:', err);
    }
  }
}

// Registered doctors
export const VERIFIED_DOCTORS: Record<string, { name: string; hospital: string }> = {
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': {
    name: 'Dr. Ramesh Gupta (Lead Emergency Physician)',
    hospital: 'Hospital Node A - Apollo Speciality',
  },
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': {
    name: 'Dr. Ananya Sharma (Chief Pathologist)',
    hospital: 'Hospital Node B - Fortis Healthcare',
  },
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': {
    name: 'MediQR Federation Authority (Lead Admin)',
    hospital: 'MediQR Health Consortium Root',
  },
};

/**
 * Access the blockchain ledger. Attempts to use live JSON-RPC (Hardhat node or MetaMask),
 * falling back to local persistent simulated state if no node is running.
 */
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
    // Live RPC unavailable, seamlessly proceed to persistent federation ledger
  }

  // Load persistent ledger
  const currentLedger = getStoredLedger();
  const existing = currentLedger[normalizedHash] || [];

  // For pre-seeded records on first query: lock in their initial clean file hash once
  let updated = false;
  for (const rec of existing) {
    if (!rec.isLocked) {
      try {
        const nodeRes = await fetch(rec.storageURI);
        if (nodeRes.ok) {
          const nodeData = await nodeRes.json();
          if (nodeData.currentFileHash) {
            rec.fileHash = nodeData.currentFileHash;
            rec.isLocked = true;
            updated = true;
          }
        }
      } catch {
        // Node not yet up, continue
      }
    }
  }

  if (updated) {
    persistLedger(currentLedger);
  }

  return { records: existing, source: 'federation-state' };
}

/**
 * Registers a new record on the blockchain ledger and saves to persistent storage.
 */
export async function commitRecordOnChain(
  patientHash: string,
  fileHash: string,
  storageURI: string,
  recordType: string,
  practitionerAddress: string,
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS
): Promise<{ txHash: string; blockNumber: number }> {
  const normalizedHash = patientHash.trim().toLowerCase();

  // Try live EVM with fast timeout
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    const hasLiveEvm = await Promise.race([
      provider.getBlockNumber().then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 300)),
    ]);

    if (hasLiveEvm) {
      const signer = await provider.getSigner(practitionerAddress);
      const contract = new ethers.Contract(contractAddress, MEDICAL_RECORD_LEDGER_ABI, signer);
      const tx = await contract.addRecord(patientHash, fileHash, storageURI, recordType);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    }
  } catch {
    // Live EVM not running, proceed to persistent fallback
  }

  // Fallback persistent simulation
  const currentLedger = getStoredLedger();
  if (!currentLedger[normalizedHash]) {
    currentLedger[normalizedHash] = [];
  }

  const newRecord: BlockchainRecord = {
    fileHash,
    storageURI,
    practitionerAddress,
    timestamp: Math.floor(Date.now() / 1000),
    recordType,
    isLocked: true, // Immutable registration hash
  };

  currentLedger[normalizedHash].push(newRecord);
  persistLedger(currentLedger);

  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_HASH_KEY, patientHash.trim());
  }

  return {
    txHash: `0xsimulated${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
    blockNumber: 42109,
  };
}
