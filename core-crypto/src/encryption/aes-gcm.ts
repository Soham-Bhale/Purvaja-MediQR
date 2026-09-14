import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { EncryptedPackage, MedicalRecord } from '../types';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derives a 32-byte (256-bit) buffer key from a string or returns the buffer directly.
 */
export function normalizeKey(key: string | Buffer): Buffer {
  if (Buffer.isBuffer(key) && key.length === 32) {
    return key;
  }
  return createHash('sha256').update(key).digest();
}

/**
 * Encrypts a medical record or arbitrary data with AES-256-GCM.
 * Includes authenticated additional data (AAD) bound to patientHash and recordId to prevent transplant attacks.
 * 
 * @param record - The medical record or serializable data
 * @param encryptionKey - 256-bit key or passphrase
 * @param patientHash - Salted patient hash used as AAD binding
 * @param hospitalNodeId - ID of the originating hospital node
 */
export function encryptRecord(
  record: MedicalRecord | Record<string, any>,
  encryptionKey: string | Buffer,
  patientHash: string,
  hospitalNodeId: string = 'HOSPITAL-NODE-A'
): EncryptedPackage {
  const key = normalizeKey(encryptionKey);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Bind AAD (Authenticated Additional Data)
  const aad = Buffer.from(`${patientHash}:${record.recordId || 'default'}`);
  cipher.setAAD(aad);

  const plainText = typeof record === 'string' ? record : JSON.stringify(record);
  let ciphertext = cipher.update(plainText, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    recordId: record.recordId || `REC-${Date.now()}`,
    patientHash,
    hospitalNodeId,
    algorithm: ALGORITHM,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext,
    encryptedAt: Date.now(),
  };
}

/**
 * Decrypts an EncryptedPackage using AES-256-GCM and verifies authenticity.
 * If the ciphertext or tag has been tampered with, an error is thrown.
 */
export function decryptRecord<T = MedicalRecord>(
  pkg: EncryptedPackage,
  encryptionKey: string | Buffer
): T {
  const key = normalizeKey(encryptionKey);
  const iv = Buffer.from(pkg.iv, 'base64');
  const authTag = Buffer.from(pkg.authTag, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  // Set the matching AAD
  const aad = Buffer.from(`${pkg.patientHash}:${pkg.recordId}`);
  decipher.setAAD(aad);

  let decrypted = decipher.update(pkg.ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted) as T;
  } catch {
    return decrypted as unknown as T;
  }
}
