export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface TriageData {
  fullName: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  criticalAllergies: string[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  donorStatus: boolean;
  resuscitationPreference?: 'DNR' | 'FULL_CODE' | 'LIMITED';
}

export interface MediQRPayload {
  v: string; // schema version e.g. "2.0"
  triage: TriageData;
  patientHash: string; // 0x-prefixed 32-byte hex string (HMAC-SHA256)
  issuedAt: number; // Unix timestamp
  issuerNodeId: string;
  signature?: string; // Optional digital signature of hospital authority
}

export interface EncryptedPackage {
  recordId: string;
  patientHash: string;
  hospitalNodeId: string;
  algorithm: 'aes-256-gcm';
  iv: string; // Base64 encoded 12-byte initialization vector
  authTag: string; // Base64 encoded 16-byte GCM authentication tag
  ciphertext: string; // Base64 encoded ciphertext
  encryptedAt: number;
}

export interface PrescriptionItem {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface LabResultItem {
  test: string;
  result: string;
  unit: string;
  normalRange: string;
  flag?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface MedicalRecord {
  recordId: string;
  patientId: string;
  patientName: string;
  hospitalName: string;
  hospitalNodeId: string;
  recordType: 'CONSULTATION' | 'PRESCRIPTION' | 'LAB_RESULT' | 'DISCHARGE_SUMMARY' | 'RADIOLOGY';
  recordDate: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: PrescriptionItem[];
  labResults?: LabResultItem[];
  attendingPhysician: {
    name: string;
    licenseNumber: string;
    department: string;
    walletAddress?: string;
  };
}

export interface OnChainRecordMetadata {
  fileHash: string; // 0x-prefixed bytes32 SHA-256
  storageURI: string; // e.g. http://localhost:5001/api/records/rec-123
  practitionerAddress: string;
  timestamp: number;
  recordType: string;
}

export interface IntegrityVerificationResult {
  verified: boolean;
  expectedHash: string;
  computedHash: string;
  storageURI: string;
  decryptedRecord?: MedicalRecord;
  error?: string;
  tamperedLocation?: string;
}
