import assert from 'assert';
import {
  generateSalt,
  generatePatientHash,
  verifyPatientHash,
  encryptRecord,
  decryptRecord,
  calculateSHA256,
  verifyChecksum,
  createMediQRPayload,
  serializeMediQRPayload,
  parseQRCodePayload,
  MedicalRecord,
  TriageData,
} from '../src';

async function runTests() {
  console.log('--- Starting Core Cryptography & QR Engine Tests ---');

  // Test 1: Salt & HMAC Patient Hashing
  console.log('\n[1] Testing HMAC-SHA256 Salted Patient Identifier...');
  const nationalId = 'IN-AADHAAR-8934-2847-1902';
  const salt1 = generateSalt(16);
  const salt2 = generateSalt(16);
  assert.notStrictEqual(salt1, salt2, 'Salts must be cryptographically unique');

  const hash1 = generatePatientHash(nationalId, salt1);
  const hash2 = generatePatientHash(nationalId, salt2);
  const hash1Again = generatePatientHash(nationalId, salt1);

  assert.strictEqual(hash1.startsWith('0x'), true, 'Patient hash must be 0x-prefixed');
  assert.strictEqual(hash1.length, 66, 'Patient hash must be 32 bytes (66 hex characters)');
  assert.notStrictEqual(hash1, hash2, 'Different salts must yield different hashes (rainbow attack mitigation)');
  assert.strictEqual(hash1, hash1Again, 'Same salt and ID must yield identical hash');
  assert.strictEqual(verifyPatientHash(nationalId, salt1, hash1), true, 'verifyPatientHash should return true for matching inputs');
  console.log('✓ HMAC Patient Hashing passed:', hash1);

  // Test 2: AES-256-GCM Encryption & Tamper Detection
  console.log('\n[2] Testing AES-256-GCM Record Encryption & AuthTag Verification...');
  const testRecord: MedicalRecord = {
    recordId: 'REC-2026-09-001',
    patientId: nationalId,
    patientName: 'Jane Doe',
    hospitalName: 'Apollo Speciality Hospital',
    hospitalNodeId: 'HOSPITAL-NODE-A',
    recordType: 'CONSULTATION',
    recordDate: '2026-09-15',
    diagnosis: 'Acute severe anaphylaxis, stabilized with epinephrine',
    clinicalNotes: 'Patient arrived with severe angioedema post penicillin exposure.',
    prescriptions: [
      { drug: 'Epinephrine Auto-Injector', dosage: '0.3mg', frequency: 'PRN', duration: 'Emergency' },
      { drug: 'Prednisone', dosage: '20mg', frequency: 'OD', duration: '5 days' }
    ],
    attendingPhysician: {
      name: 'Dr. Ramesh Gupta',
      licenseNumber: 'MCI-847291',
      department: 'Emergency Medicine',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    }
  };

  const secretKey = 'SuperSecretEncryptionKeyHospitalNodeA!';
  const encrypted = encryptRecord(testRecord, secretKey, hash1, 'HOSPITAL-NODE-A');
  assert.strictEqual(encrypted.algorithm, 'aes-256-gcm');
  assert.ok(encrypted.iv && encrypted.authTag && encrypted.ciphertext);

  // Decryption success
  const decrypted = decryptRecord<MedicalRecord>(encrypted, secretKey);
  assert.strictEqual(decrypted.patientName, 'Jane Doe');
  assert.strictEqual(decrypted.diagnosis, testRecord.diagnosis);
  console.log('✓ AES-256-GCM Decryption verified successfully.');

  // Tamper detection: mutate ciphertext
  console.log('\n[3] Testing Tamper Detection on Ciphertext...');
  const tamperedPackage = { ...encrypted };
  // Flip characters in ciphertext
  tamperedPackage.ciphertext = 'X' + tamperedPackage.ciphertext.slice(1);
  let failedAsExpected = false;
  try {
    decryptRecord(tamperedPackage, secretKey);
  } catch (err: any) {
    failedAsExpected = true;
    console.log('✓ Tampered ciphertext successfully rejected by GCM AuthTag:', err.message);
  }
  assert.strictEqual(failedAsExpected, true, 'Corrupted ciphertext must throw decryption error');

  // Test 3: SHA-256 Document Checksum Verification
  console.log('\n[4] Testing SHA-256 Document Fingerprint Integrity...');
  const originalChecksum = calculateSHA256(encrypted);
  assert.strictEqual(originalChecksum.startsWith('0x'), true);
  assert.strictEqual(originalChecksum.length, 66, 'SHA-256 checksum must be 32 bytes (66 hex chars)');
  assert.strictEqual(verifyChecksum(encrypted, originalChecksum), true);

  const tamperedChecksum = calculateSHA256(tamperedPackage);
  assert.notStrictEqual(originalChecksum, tamperedChecksum, 'Tampered package must produce mismatched SHA-256 hash');
  assert.strictEqual(verifyChecksum(tamperedPackage, originalChecksum), false, 'Verification against original hash must fail');
  console.log('✓ SHA-256 integrity validation passed.');

  // Test 4: QR Code Generation & Parsing
  console.log('\n[5] Testing Dual-Segment MediQR Generation and Parser...');
  const triage: TriageData = {
    fullName: 'Jane Doe',
    bloodType: 'O-',
    criticalAllergies: ['Penicillin', 'Sulfa drugs', 'Peanuts'],
    chronicConditions: ['Asthma'],
    emergencyContacts: [
      { name: 'John Doe', relationship: 'Spouse', phone: '+1-555-0199' }
    ],
    donorStatus: true,
    resuscitationPreference: 'FULL_CODE',
  };

  const qrPayload = createMediQRPayload(triage, hash1, 'HOSPITAL-NODE-A');
  const serialized = serializeMediQRPayload(qrPayload);

  const parsed = parseQRCodePayload(serialized);
  assert.strictEqual(parsed.isValid, true);
  assert.strictEqual(parsed.triage?.bloodType, 'O-');
  assert.strictEqual(parsed.patientHash, hash1);
  assert.strictEqual(parsed.validationErrors.length, 0);

  // Test invalid payload handling
  const invalidParsed = parseQRCodePayload(JSON.stringify({ v: '2.0', triage: { bloodType: 'INVALID' }, patientHash: 'invalid-hash' }));
  assert.strictEqual(invalidParsed.isValid, false);
  assert.ok(invalidParsed.validationErrors.length > 0);
  console.log('✓ QR Schema validation passed. Errors caught correctly:', invalidParsed.validationErrors);

  console.log('\n=== ALL CRYPTO AND QR TESTS PASSED! ===');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
