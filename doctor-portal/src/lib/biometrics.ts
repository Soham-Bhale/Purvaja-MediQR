'use client';

export interface EnrolledBiometric {
  doctorWallet: string;
  doctorName: string;
  licenseNumber: string;
  department: string;
  hospitalName: string;
  biometricTemplateHash: string;
  enrolledAt: number;
  enrolledBy: string; // Government Official ID / Certificate
  ridgePatternId: string;
}

export interface BiometricSession {
  doctorWallet: string;
  doctorName: string;
  sessionToken: string;
  authenticatedAt: number;
  expiresAt: number;
}

export const BIOMETRICS_STORAGE_KEY = 'mediqr_enrolled_biometrics_v1';
export const BIOMETRIC_SESSION_KEY = 'mediqr_active_biometric_session_v1';

// Default pre-seeded enrolled biometric fingerprints for accredited doctors
export const INITIAL_ENROLLED_BIOMETRICS: EnrolledBiometric[] = [
  {
    doctorWallet: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    doctorName: 'Dr. Ramesh Gupta',
    licenseNumber: 'MCI-DEL-10294',
    department: 'Lead Emergency Medicine',
    hospitalName: 'Apollo Speciality Hospital (Node A)',
    biometricTemplateHash: '0xbf94a812e45217de90184b29c0a1e481029384bbce81a02938472910482910ae',
    enrolledAt: 1726358400000,
    enrolledBy: 'GOV-OFFICER-UID-DEL-9921',
    ridgePatternId: 'WHORL-CENTRAL-POCKET-TYPE-A',
  },
  {
    doctorWallet: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    doctorName: 'Dr. Ananya Sharma',
    licenseNumber: 'MCI-BOM-88392',
    department: 'Chief Pathology & Diagnostics',
    hospitalName: 'Fortis Healthcare Network (Node B)',
    biometricTemplateHash: '0xca7710928374619a827364510293847a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    enrolledAt: 1726358400000,
    enrolledBy: 'GOV-OFFICER-UID-BLR-4019',
    ridgePatternId: 'LOOP-ULNAR-TYPE-B',
  },
  {
    doctorWallet: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    doctorName: 'Consortium Root Admin (MOH)',
    licenseNumber: 'GOV-MOH-AUTHORITY-ROOT',
    department: 'Ministry of Health Supervision',
    hospitalName: 'Consortium Root Authority',
    biometricTemplateHash: '0x991823a019283746501928374650192837465019283746501928374650192837',
    enrolledAt: 1726358400000,
    enrolledBy: 'GOV-MOH-CENTRAL-COMMISSION',
    ridgePatternId: 'ARCH-PLAIN-SUPERVISORY-01',
  },
];

let inMemoryBiometrics: EnrolledBiometric[] = [...INITIAL_ENROLLED_BIOMETRICS];

export function getEnrolledBiometrics(): EnrolledBiometric[] {
  if (typeof window === 'undefined') return inMemoryBiometrics;
  try {
    const raw = localStorage.getItem(BIOMETRICS_STORAGE_KEY);
    if (raw) {
      const parsed: EnrolledBiometric[] = JSON.parse(raw);
      // Merge initial with stored
      const mergedMap = new Map<string, EnrolledBiometric>();
      INITIAL_ENROLLED_BIOMETRICS.forEach((b) => mergedMap.set(b.doctorWallet.toLowerCase(), b));
      parsed.forEach((b) => mergedMap.set(b.doctorWallet.toLowerCase(), b));
      return Array.from(mergedMap.values());
    }
  } catch (err) {
    console.error('Error reading enrolled biometrics:', err);
  }
  return inMemoryBiometrics;
}

export function saveEnrolledBiometric(biometric: EnrolledBiometric): void {
  const current = getEnrolledBiometrics();
  const filtered = current.filter((b) => b.doctorWallet.toLowerCase() !== biometric.doctorWallet.toLowerCase());
  const updated = [biometric, ...filtered];
  inMemoryBiometrics = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BIOMETRICS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error persisting biometric record:', err);
    }
  }
}

export function getBiometricForDoctor(doctorWallet: string): EnrolledBiometric | undefined {
  const all = getEnrolledBiometrics();
  return all.find((b) => b.doctorWallet.toLowerCase() === doctorWallet.toLowerCase());
}

export function hasActiveBiometricSession(doctorWallet: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(BIOMETRIC_SESSION_KEY);
    if (!raw) return false;
    const session: BiometricSession = JSON.parse(raw);
    const isValid = session.doctorWallet.toLowerCase() === doctorWallet.toLowerCase() && session.expiresAt > Date.now();
    return isValid;
  } catch {
    return false;
  }
}

export function createBiometricSession(doctorWallet: string, doctorName: string): BiometricSession {
  const session: BiometricSession = {
    doctorWallet: doctorWallet.toLowerCase(),
    doctorName,
    sessionToken: `BIO-SES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    authenticatedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 4, // 4 hours clinical shift session
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BIOMETRIC_SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('mediqr_biometric_session_change', { detail: { active: true, session } }));
    } catch (err) {
      console.error('Error persisting biometric session:', err);
    }
  }
  return session;
}

export function clearBiometricSession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(BIOMETRIC_SESSION_KEY);
      window.dispatchEvent(new CustomEvent('mediqr_biometric_session_change', { detail: { active: false } }));
    } catch (err) {
      console.error('Error clearing biometric session:', err);
    }
  }
}
