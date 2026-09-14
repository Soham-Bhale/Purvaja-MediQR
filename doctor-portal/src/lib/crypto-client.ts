// Web Crypto API implementations for browser-side verification and memory decryption

export interface EncryptedPackage {
  recordId: string;
  patientHash: string;
  hospitalNodeId: string;
  algorithm: 'aes-256-gcm';
  iv: string; // Base64
  authTag: string; // Base64
  ciphertext: string; // Base64
  encryptedAt: number;
}

export interface VerificationReport {
  isTamperFree: boolean;
  expectedOnChainHash: string;
  computedLocalHash: string;
  storageURI: string;
  hospitalNodeId: string;
  decryptedData?: any;
  error?: string;
  tamperReason?: string;
}

/**
 * Base64 helpers compatible with browser and Node environments.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return `0x${hex}`;
}

/**
 * Canonicalizes an EncryptedPackage deterministically with sorted keys.
 */
export function canonicalizePackage(pkg: EncryptedPackage): string {
  const ordered: Record<string, any> = {};
  const keys = ['algorithm', 'authTag', 'ciphertext', 'encryptedAt', 'hospitalNodeId', 'iv', 'patientHash', 'recordId'];
  for (const k of keys) {
    if (k in pkg) {
      ordered[k] = (pkg as any)[k];
    }
  }
  return JSON.stringify(ordered);
}

/**
 * Computes SHA-256 checksum of an incoming EncryptedPackage using Web Crypto API.
 */
export async function computeSHA256Checksum(pkg: EncryptedPackage): Promise<string> {
  const canonical = canonicalizePackage(pkg);
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data as any);
  return bufferToHex(hashBuffer);
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a passphrase or raw key string.
 */
async function deriveAESKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.digest('SHA-256', encoder.encode(secret) as any);
  return window.crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * In-memory client decryption of AES-256-GCM medical payload.
 * Verifies GCM auth tag and AAD bound to patientHash + recordId.
 */
export async function decryptPackageInMemory(
  pkg: EncryptedPackage,
  secretKey: string
): Promise<any> {
  const cryptoKey = await deriveAESKey(secretKey);
  const iv = base64ToUint8Array(pkg.iv);
  const ciphertextBytes = base64ToUint8Array(pkg.ciphertext);
  const authTagBytes = base64ToUint8Array(pkg.authTag);

  // Web Crypto API expects ciphertext and auth tag concatenated
  const combined = new Uint8Array(ciphertextBytes.length + authTagBytes.length);
  combined.set(ciphertextBytes);
  combined.set(authTagBytes, ciphertextBytes.length);

  const encoder = new TextEncoder();
  const aad = encoder.encode(`${pkg.patientHash}:${pkg.recordId}`);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
      additionalData: aad as any,
      tagLength: 128,
    },
    cryptoKey,
    combined as any
  );

  const decoder = new TextDecoder();
  const plainText = decoder.decode(decryptedBuffer);

  try {
    return JSON.parse(plainText);
  } catch {
    return plainText;
  }
}

/**
 * Default federation hospital keys for decryption demo.
 */
export const HOSPITAL_KEYS: Record<string, string> = {
  'HOSPITAL-NODE-A': 'MEDIQR_SECURE_HOSPITAL_KEY_APOLLO_2026',
  'HOSPITAL-NODE-B': 'MEDIQR_SECURE_HOSPITAL_KEY_FORTIS_2026',
};

/**
 * Real-Time Verification Flow:
 * 1. Pulls encrypted document from hospital node.
 * 2. Computes SHA-256 checksum of document.
 * 3. Compares with on-chain ledger hash.
 * 4. IF MATCH: Decrypts in memory -> "Tamper-Free: Hash Verified On-Chain".
 * 5. IF MISMATCH: Aborts immediately -> "Tamper Detected: Record Compromised".
 */
export async function verifyAndDecryptRecord(
  storageURI: string,
  expectedOnChainHash: string
): Promise<VerificationReport> {
  try {
    // 1. Fetch encrypted document
    const response = await fetch(storageURI);
    if (!response.ok) {
      return {
        isTamperFree: false,
        expectedOnChainHash,
        computedLocalHash: 'UNAVAILABLE',
        storageURI,
        hospitalNodeId: 'UNKNOWN',
        error: `Failed to fetch record from hospital node: HTTP ${response.status}`,
      };
    }

    const pkg: EncryptedPackage = await response.json();

    // 2. Compute local SHA-256 checksum
    const computedLocalHash = await computeSHA256Checksum(pkg);

    // 3. Compare with on-chain record
    const isTamperFree = computedLocalHash.toLowerCase() === expectedOnChainHash.toLowerCase();

    if (!isTamperFree) {
      return {
        isTamperFree: false,
        expectedOnChainHash,
        computedLocalHash,
        storageURI,
        hospitalNodeId: pkg.hospitalNodeId,
        error: 'CRITICAL INTEGRITY FAILURE: Local computed document SHA-256 does not match immutable on-chain ledger hash.',
        tamperReason: 'The off-chain storage node data has been altered, intercepted, or corrupted since block commitment.',
      };
    }

    // 4. Integrity verified -> Decrypt in memory
    const hospitalKey = HOSPITAL_KEYS[pkg.hospitalNodeId] || HOSPITAL_KEYS['HOSPITAL-NODE-A'];
    const decryptedData = await decryptPackageInMemory(pkg, hospitalKey);

    return {
      isTamperFree: true,
      expectedOnChainHash,
      computedLocalHash,
      storageURI,
      hospitalNodeId: pkg.hospitalNodeId,
      decryptedData,
    };
  } catch (err: any) {
    return {
      isTamperFree: false,
      expectedOnChainHash,
      computedLocalHash: 'ERROR',
      storageURI,
      hospitalNodeId: 'UNKNOWN',
      error: `Decryption or integrity pipeline failed: ${err.message}`,
    };
  }
}

/**
 * Computes patientHash: HMAC-SHA256(National_ID + Salt, Secret_Key) in browser.
 */
export async function computeClientPatientHash(
  nationalId: string,
  salt: string,
  secretKey: string = 'MEDIQR_DEFAULT_SECURE_FEDERATION_PEPPER_2026'
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData as any,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const inputData = encoder.encode(`${nationalId.trim().toUpperCase()}:${salt.trim()}`);
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, inputData as any);
  return bufferToHex(signature);
}
