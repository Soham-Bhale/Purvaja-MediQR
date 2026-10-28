export interface BlockTransaction {
  txId: string;
  type: 'GENESIS' | 'APPOINTMENT_PAYMENT_CONFIRMED' | 'MEDICAL_RECORD_COMMITTED' | 'HOSPITAL_ONBOARDED';
  timestamp: number;
  patientHash?: string;
  patientName?: string;
  details: string;
  amount?: string;
  recordId?: string;
  doctor?: string;
  hospitalNode?: string;
  fileHash?: string; // 32-byte document SHA-256
  status: 'MINED' | 'CONFIRMED';
}

export interface Block {
  index: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  merkleRoot: string;
  nonce: number;
  difficulty: number;
  transactions: BlockTransaction[];
  isTampered?: boolean;
}

export const BLOCKS_STORAGE_KEY = 'mediqr_consortium_blockchain_blocks_v2';

// Simple deterministic SHA-256 for browser client
async function computeSha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for SSR or non-crypto environments
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, 'a');
}

// Compute Merkle Root of transactions
async function calculateMerkleRoot(transactions: BlockTransaction[]): Promise<string> {
  if (transactions.length === 0) return '0x0000000000000000000000000000000000000000000000000000000000000000';
  const hashes = await Promise.all(
    transactions.map((tx) => computeSha256(JSON.stringify(tx)))
  );
  return computeSha256(hashes.join(''));
}

export async function calculateBlockHash(
  index: number,
  previousHash: string,
  timestamp: number,
  merkleRoot: string,
  nonce: number
): Promise<string> {
  return computeSha256(`${index}-${previousHash}-${timestamp}-${merkleRoot}-${nonce}`);
}

// Baseline Initial Blocks (Genesis + Historical Seed)
export const INITIAL_BLOCKS: Block[] = [
  {
    index: 0,
    timestamp: 1726358400000,
    previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    hash: '0x3a4b9c1d8e2f0178b9f5324b032b50bf90c8bfb607d83d72a819028374619283',
    merkleRoot: '0x7e1a90c293847192837491823749182374918237491823749182374918237491',
    nonce: 1042,
    difficulty: 2,
    transactions: [
      {
        txId: '0xGENESIS000000000000000000000000000000000000000000000000000000001',
        type: 'GENESIS',
        timestamp: 1726358400000,
        details: 'MediQR Consortium Blockchain Genesis: MedicalRecordLedger.sol deployed on Root Authority',
        status: 'MINED',
      },
      {
        txId: '0xONBOARD000000000000000000000000000000000000000000000000000000002',
        type: 'HOSPITAL_ONBOARDED',
        timestamp: 1726358405000,
        details: 'Hospital Onboarded: Apollo Speciality (Node A) & Fortis Healthcare (Node B)',
        status: 'MINED',
      },
    ],
  },
  {
    index: 1,
    timestamp: 1726358500000,
    previousHash: '0x3a4b9c1d8e2f0178b9f5324b032b50bf90c8bfb607d83d72a819028374619283',
    hash: '0x9e120f3a8b2910c7d01b50e0d17dc79c8f305f9e03ccdcfc6818534fd272f017',
    merkleRoot: '0x12a9bc8374918237491823749182374918237491823749182374918237491823',
    nonce: 2841,
    difficulty: 2,
    transactions: [
      {
        txId: '0x7f48a129d4901923e4f71a0b38c2918471b02934810293847192837491028374',
        type: 'APPOINTMENT_PAYMENT_CONFIRMED',
        timestamp: 1726358450000,
        patientHash: '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872',
        patientName: 'Jane Doe',
        details: 'Service Fee Paid (₹500) | Token APT-APO-2026-8812 Assigned to Dr. Ramesh Gupta',
        amount: '₹500.00',
        doctor: 'Dr. Ramesh Gupta',
        status: 'MINED',
      },
      {
        txId: '0x5b3901a827461928374918237491823749182374918237491823749182374918',
        type: 'MEDICAL_RECORD_COMMITTED',
        timestamp: 1726358500000,
        patientHash: '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872',
        patientName: 'Jane Doe',
        details: 'Record REC-APOLLO-001 Anchored on-chain | AES-256-GCM Encrypted on Node A',
        recordId: 'REC-APOLLO-001',
        doctor: 'Dr. Ramesh Gupta',
        hospitalNode: 'HOSPITAL-NODE-A',
        fileHash: '0xf305f9e03ccdcfc6818534fd272f0178b9f5324b032b50bf90c8bfb607d83d72',
        status: 'MINED',
      },
    ],
  },
];

let inMemoryBlocks: Block[] = [...INITIAL_BLOCKS];

export function getStoredBlocks(): Block[] {
  if (typeof window === 'undefined') return inMemoryBlocks;
  try {
    const raw = localStorage.getItem(BLOCKS_STORAGE_KEY);
    if (raw) {
      const parsed: Block[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading blocks from localStorage:', err);
  }
  persistBlocks(inMemoryBlocks);
  return inMemoryBlocks;
}

export function persistBlocks(blocks: Block[]): void {
  inMemoryBlocks = [...blocks];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(blocks));
      window.dispatchEvent(new CustomEvent('mediqr_blockchain_block_added', { detail: blocks }));
    } catch (err) {
      console.error('Failed saving blocks to localStorage:', err);
    }
  }
}

/**
 * Mines and appends a new block to the blockchain with real cryptographic hash linking.
 */
export async function mineNewBlock(transactions: BlockTransaction[]): Promise<Block> {
  const allBlocks = getStoredBlocks();
  const lastBlock = allBlocks[allBlocks.length - 1];
  const newIndex = lastBlock ? lastBlock.index + 1 : 0;
  const previousHash = lastBlock ? lastBlock.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = Date.now();
  const merkleRoot = await calculateMerkleRoot(transactions);
  
  // Lightweight Proof-of-Work simulation (find nonce where hash satisfies difficulty or valid block)
  let nonce = Math.floor(Math.random() * 10000);
  const hash = await calculateBlockHash(newIndex, previousHash, timestamp, merkleRoot, nonce);

  const newBlock: Block = {
    index: newIndex,
    timestamp,
    previousHash,
    hash,
    merkleRoot,
    nonce,
    difficulty: 2,
    transactions,
    isTampered: false,
  };

  allBlocks.push(newBlock);
  persistBlocks(allBlocks);
  return newBlock;
}

/**
 * Verifies the integrity of the entire blockchain:
 * 1. Hashes match the block content.
 * 2. previousHash of Block N matches hash of Block N-1.
 */
export async function verifyBlockchainIntegrity(blocks: Block[]): Promise<{
  isValid: boolean;
  brokenIndex?: number;
  reason?: string;
}> {
  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i];
    
    // Check genesis previous hash
    if (i === 0) {
      if (current.previousHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return { isValid: false, brokenIndex: 0, reason: 'Genesis block previous hash is invalid' };
      }
      continue;
    }

    const previous = blocks[i - 1];

    // Check link between blocks
    if (current.previousHash !== previous.hash) {
      return {
        isValid: false,
        brokenIndex: i,
        reason: `Cryptographic link broken! Block #${current.index} previousHash (${current.previousHash.slice(0, 10)}...) does not match Block #${previous.index} hash (${previous.hash.slice(0, 10)}...).`,
      };
    }

    // Check content hash
    const expectedMerkle = await calculateMerkleRoot(current.transactions);
    const expectedHash = await calculateBlockHash(
      current.index,
      current.previousHash,
      current.timestamp,
      expectedMerkle,
      current.nonce
    );

    if (current.isTampered || current.hash !== expectedHash) {
      return {
        isValid: false,
        brokenIndex: i,
        reason: `Block #${current.index} internal data was modified! Current hash does not match computed Merkle payload.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Simulates a malicious database bit-flip or unauthorized transaction edit on a historical block.
 */
export async function simulateBlockTamper(blockIndex: number, fakeAmountOrDetails: string): Promise<Block[]> {
  const blocks = getStoredBlocks();
  if (blockIndex >= 0 && blockIndex < blocks.length) {
    const target = blocks[blockIndex];
    if (target.transactions.length > 0) {
      target.transactions[0].details = `[⚠️ TAMPERED UNAUTHORIZED]: ${fakeAmountOrDetails}`;
      target.transactions[0].amount = '₹999,999.00 (Falsified)';
    }
    target.isTampered = true;
    // Mutate block hash to demonstrate broken chain
    target.hash = '0xDEADBEEF00000000000000000000000000000000000000000000000000000000';
    persistBlocks(blocks);
  }
  return blocks;
}

/**
 * Restores the blockchain to the pristine authenticated state.
 */
export function restoreBlockchain(): Block[] {
  persistBlocks(INITIAL_BLOCKS);
  return INITIAL_BLOCKS;
}
