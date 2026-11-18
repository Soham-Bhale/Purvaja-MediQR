'use client';

export interface PatientUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'password';
  membershipTier: 'Sovereign Free Tier' | 'MediQR Consortium Shield (Paid)';
  isEmailVerified: boolean;
  createdAt: number;
}

export const PATIENT_AUTH_STORAGE_KEY = 'mediqr_patient_auth_user_v1';
export const PATIENT_USERS_DB_KEY = 'mediqr_patient_users_registry_v1';

// Default demo users for instant presentation testing
const DEFAULT_DEMO_USERS: Record<string, { passwordHash: string; user: PatientUser }> = {
  'jane.doe@healthmail.com': {
    passwordHash: 'password123',
    user: {
      uid: 'USR-GOOGLE-JANE-DOE-001',
      email: 'jane.doe@healthmail.com',
      displayName: 'Jane Doe',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      provider: 'google',
      membershipTier: 'MediQR Consortium Shield (Paid)',
      isEmailVerified: true,
      createdAt: 1726358400000,
    },
  },
};

export function getCurrentPatientUser(): PatientUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PATIENT_AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PatientUser;
    }
  } catch (err) {
    console.error('Failed reading patient auth session:', err);
  }
  return null;
}

export function persistCurrentPatientUser(user: PatientUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(PATIENT_AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(PATIENT_AUTH_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('mediqr_patient_auth_change', { detail: user }));
  } catch (err) {
    console.error('Failed saving patient auth session:', err);
  }
}

function getStoredUsersDb(): Record<string, { passwordHash: string; user: PatientUser }> {
  if (typeof window === 'undefined') return DEFAULT_DEMO_USERS;
  try {
    const raw = localStorage.getItem(PATIENT_USERS_DB_KEY);
    if (raw) {
      return { ...DEFAULT_DEMO_USERS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed reading patient users DB:', err);
  }
  return DEFAULT_DEMO_USERS;
}

function persistUsersDb(db: Record<string, { passwordHash: string; user: PatientUser }>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PATIENT_USERS_DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed saving users DB:', err);
  }
}

/**
 * 1-Click Google Sign-In with Firebase Auth compatibility
 */
export function signInWithGoogleMock(customEmail?: string, customName?: string): PatientUser {
  const email = (customEmail || 'patient.demo@gmail.com').toLowerCase().trim();
  const name = customName || 'Alex Mercer';
  const uid = `USR-GGL-${Math.floor(100000 + Math.random() * 900000)}`;

  const user: PatientUser = {
    uid,
    email,
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    provider: 'google',
    membershipTier: 'MediQR Consortium Shield (Paid)',
    isEmailVerified: true,
    createdAt: Date.now(),
  };

  const db = getStoredUsersDb();
  db[email] = { passwordHash: 'google-oauth-session', user };
  persistUsersDb(db);
  persistCurrentPatientUser(user);

  return user;
}

/**
 * Email/Password Sign-Up with instant verification token simulation
 */
export function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): { user?: PatientUser; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (!displayName.trim()) {
    return { error: 'Please provide your full legal name.' };
  }

  const db = getStoredUsersDb();
  if (db[cleanEmail]) {
    return { error: 'An account with this email already exists. Please sign in.' };
  }

  const newUser: PatientUser = {
    uid: `USR-EML-${Date.now().toString(36).toUpperCase()}`,
    email: cleanEmail,
    displayName: displayName.trim(),
    provider: 'password',
    membershipTier: 'Sovereign Free Tier',
    isEmailVerified: true, // Auto-verified for presentation demo
    createdAt: Date.now(),
  };

  db[cleanEmail] = { passwordHash: password, user: newUser };
  persistUsersDb(db);
  persistCurrentPatientUser(newUser);

  return { user: newUser };
}

/**
 * Email/Password Sign-In
 */
export function signInWithEmail(
  email: string,
  password: string
): { user?: PatientUser; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const db = getStoredUsersDb();

  const record = db[cleanEmail];
  if (!record) {
    // If not found during presentation, auto-create a seamless verified account
    return signUpWithEmail(cleanEmail, password, cleanEmail.split('@')[0]);
  }

  if (record.passwordHash !== password && record.passwordHash !== 'google-oauth-session') {
    return { error: 'Invalid password. Please check your credentials.' };
  }

  persistCurrentPatientUser(record.user);
  return { user: record.user };
}

/**
 * Sign Out
 */
export function signOutPatient(): void {
  persistCurrentPatientUser(null);
}

/**
 * Send Email Verification Simulation
 */
export function sendEmailVerificationMock(email: string): boolean {
  if (typeof window !== 'undefined') {
    const user = getCurrentPatientUser();
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      user.isEmailVerified = true;
      persistCurrentPatientUser(user);
    }
  }
  return true;
}
