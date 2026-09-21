import fs from 'fs';
import path from 'path';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

export interface EncryptedPackage {
  recordId: string;
  patientHash: string;
  hospitalNodeId: string;
  algorithm: 'aes-256-gcm';
  iv: string;
  authTag: string;
  ciphertext: string;
  encryptedAt: number;
}

const PACKAGE_CANONICAL_KEYS: (keyof EncryptedPackage)[] = [
  'algorithm',
  'authTag',
  'ciphertext',
  'encryptedAt',
  'hospitalNodeId',
  'iv',
  'patientHash',
  'recordId',
];

export function canonicalize(pkg: EncryptedPackage): string {
  const ordered: Record<string, any> = {};
  for (const key of PACKAGE_CANONICAL_KEYS) {
    if (key in pkg) {
      ordered[key] = (pkg as any)[key];
    }
  }
  return JSON.stringify(ordered);
}

export function calculateSHA256(pkg: EncryptedPackage): string {
  const canonical = canonicalize(pkg);
  const hash = createHash('sha256').update(Buffer.from(canonical, 'utf8')).digest('hex');
  return `0x${hash}`;
}

export class NodeStorageEngine {
  private baseDir: string;
  private encryptionKey: Buffer;

  constructor(baseDir: string, encryptionKeySecret: string) {
    this.baseDir = path.resolve(baseDir);
    this.encryptionKey = createHash('sha256').update(encryptionKeySecret).digest();
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private getRecordPath(recordId: string): string {
    return path.join(this.baseDir, `${recordId}.enc.json`);
  }

  private getBackupPath(recordId: string): string {
    return path.join(this.baseDir, `${recordId}.backup.json`);
  }

  /**
   * Encrypts and persists a new medical record document to off-chain disk.
   */
  public storeRecord(
    recordId: string,
    patientHash: string,
    hospitalNodeId: string,
    data: any
  ): { encryptedPackage: EncryptedPackage; fileHash: string } {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv, { authTagLength: 16 });

    // Bind AAD
    const aad = Buffer.from(`${patientHash}:${recordId}`);
    cipher.setAAD(aad);

    const plainText = typeof data === 'string' ? data : JSON.stringify(data);
    let ciphertext = cipher.update(plainText, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    const encryptedPackage: EncryptedPackage = {
      recordId,
      patientHash,
      hospitalNodeId,
      algorithm: 'aes-256-gcm',
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertext,
      encryptedAt: Date.now(),
    };

    const fileHash = calculateSHA256(encryptedPackage);

    // Persist to disk
    const filePath = this.getRecordPath(recordId);
    const backupPath = this.getBackupPath(recordId);

    const payloadJson = JSON.stringify(encryptedPackage, null, 2);
    fs.writeFileSync(filePath, payloadJson, 'utf8');
    fs.writeFileSync(backupPath, payloadJson, 'utf8'); // Keep untampered backup

    return { encryptedPackage, fileHash };
  }

  /**
   * Seeds a record only if it does not already exist on disk.
   * Preserves existing cryptographic fingerprints across restarts.
   */
  public seedRecordIfMissing(
    recordId: string,
    patientHash: string,
    hospitalNodeId: string,
    data: any
  ): { encryptedPackage: EncryptedPackage; fileHash: string } {
    const filePath = this.getRecordPath(recordId);
    const backupPath = this.getBackupPath(recordId);

    if (fs.existsSync(filePath) && fs.existsSync(backupPath)) {
      const pkg = JSON.parse(fs.readFileSync(backupPath, 'utf8')) as EncryptedPackage;
      // Ensure the active file also matches the clean backup
      fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2), 'utf8');
      return {
        encryptedPackage: pkg,
        fileHash: calculateSHA256(pkg),
      };
    }

    return this.storeRecord(recordId, patientHash, hospitalNodeId, data);
  }

  /**
   * Reads an encrypted package from disk.
   */
  public getRecord(recordId: string): EncryptedPackage | null {
    const filePath = this.getRecordPath(recordId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as EncryptedPackage;
  }

  /**
   * Lists all record IDs in this storage node.
   */
  public listRecords(): string[] {
    const files = fs.readdirSync(this.baseDir);
    return files
      .filter((f) => f.endsWith('.enc.json'))
      .map((f) => f.replace('.enc.json', ''));
  }

  /**
   * Deliberately mutates the stored file on disk to simulate a tampering attack.
   */
  public tamperRecord(recordId: string, mode: 'ciphertext' | 'authTag' = 'ciphertext'): boolean {
    const filePath = this.getRecordPath(recordId);
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const pkg: EncryptedPackage = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (mode === 'ciphertext') {
      // Flip characters in base64 ciphertext
      const original = pkg.ciphertext;
      pkg.ciphertext = original.startsWith('A') ? 'B' + original.slice(1) : 'A' + original.slice(1);
    } else {
      // Corrupt auth tag
      pkg.authTag = 'ZmFrZUF1dGhUYWcxMjM0NQ==';
    }

    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2), 'utf8');
    return true;
  }

  /**
   * Restores the pristine record from the backup copy.
   */
  public restoreRecord(recordId: string): boolean {
    const filePath = this.getRecordPath(recordId);
    const backupPath = this.getBackupPath(recordId);

    if (!fs.existsSync(backupPath)) {
      return false;
    }

    const pristine = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(filePath, pristine, 'utf8');
    return true;
  }
}
