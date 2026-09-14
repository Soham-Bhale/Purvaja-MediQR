import { createHmac, randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure random hex salt.
 * Default length is 16 bytes (32 hex characters).
 */
export function generateSalt(byteLength: number = 16): string {
  return randomBytes(byteLength).toString('hex');
}

/**
 * Computes salted patient hash: HMAC-SHA256(National_ID + Salt, Secret_Key)
 * Mitigates rainbow table, precomputation, and patient identity enumeration attacks.
 * 
 * @param nationalId - Patient national/citizen ID or Aadhaar/SSN identifier
 * @param salt - Cryptographic unique salt per patient
 * @param secretKey - Master pepper/key known to the authorized healthcare federation
 * @returns 0x-prefixed 64-character hex string (32 bytes, directly compatible with Solidity bytes32)
 */
export function generatePatientHash(
  nationalId: string,
  salt: string,
  secretKey: string = process.env.MEDIQR_MASTER_PEPPER || 'MEDIQR_DEFAULT_SECURE_FEDERATION_PEPPER_2026'
): string {
  if (!nationalId || nationalId.trim().length === 0) {
    throw new Error('National ID is required to generate patient hash');
  }
  if (!salt || salt.trim().length === 0) {
    throw new Error('Salt is required to protect against precomputation attacks');
  }

  const normalizedInput = `${nationalId.trim().toUpperCase()}:${salt.trim()}`;
  const hmac = createHmac('sha256', secretKey);
  hmac.update(normalizedInput);
  const hash = hmac.digest('hex');
  return `0x${hash}`;
}

/**
 * Verifies if a given national ID + salt corresponds to a patient hash.
 */
export function verifyPatientHash(
  nationalId: string,
  salt: string,
  expectedHash: string,
  secretKey?: string
): boolean {
  const calculated = generatePatientHash(nationalId, salt, secretKey);
  return calculated.toLowerCase() === expectedHash.toLowerCase();
}
