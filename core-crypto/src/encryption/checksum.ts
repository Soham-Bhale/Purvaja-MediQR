import { createHash } from 'crypto';
import { EncryptedPackage } from '../types';

/**
 * Deterministically serializes an EncryptedPackage to JSON with sorted keys.
 * Ensures that hash generation is strictly invariant regardless of property ordering.
 */
export function canonicalizeEncryptedPackage(pkg: EncryptedPackage): string {
  const ordered: Record<string, any> = {};
  const keys = Object.keys(pkg).sort();
  for (const key of keys) {
    ordered[key] = (pkg as any)[key];
  }
  return JSON.stringify(ordered);
}

/**
 * Computes SHA-256 checksum of data (string, Buffer, or EncryptedPackage).
 * 
 * @param input - The payload to hash
 * @returns 0x-prefixed 64-hex-character string (32 bytes), compatible with Solidity bytes32
 */
export function calculateSHA256(input: string | Buffer | EncryptedPackage): string {
  const hasher = createHash('sha256');
  if (Buffer.isBuffer(input)) {
    hasher.update(input);
  } else if (typeof input === 'string') {
    hasher.update(Buffer.from(input, 'utf8'));
  } else {
    const canonical = canonicalizeEncryptedPackage(input);
    hasher.update(Buffer.from(canonical, 'utf8'));
  }

  return `0x${hasher.digest('hex')}`;
}

/**
 * Verifies if the computed SHA-256 of the input matches an expected on-chain hash.
 */
export function verifyChecksum(
  input: string | Buffer | EncryptedPackage,
  expectedHash: string
): boolean {
  const computed = calculateSHA256(input);
  return computed.toLowerCase() === expectedHash.toLowerCase();
}
