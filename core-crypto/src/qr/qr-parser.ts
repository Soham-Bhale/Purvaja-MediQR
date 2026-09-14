import { MediQRPayload, TriageData } from '../types';

export interface ParsedMediQR {
  isValid: boolean;
  version?: string;
  triage?: TriageData;
  patientHash?: string;
  issuedAt?: number;
  issuerNodeId?: string;
  validationErrors: string[];
  rawPayload?: string;
}

const VALID_BLOOD_TYPES = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

/**
 * Validates the schema of TriageData.
 */
export function validateTriageData(triage: any): string[] {
  const errors: string[] = [];
  if (!triage || typeof triage !== 'object') {
    return ['Triage data must be a valid object'];
  }

  if (!triage.fullName || typeof triage.fullName !== 'string') {
    errors.push('Triage missing or invalid "fullName"');
  }

  if (!VALID_BLOOD_TYPES.has(triage.bloodType)) {
    errors.push(`Invalid blood type "${triage.bloodType}". Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-`);
  }

  if (!Array.isArray(triage.criticalAllergies)) {
    errors.push('Triage "criticalAllergies" must be an array of strings');
  }

  if (!Array.isArray(triage.chronicConditions)) {
    errors.push('Triage "chronicConditions" must be an array of strings');
  }

  if (!Array.isArray(triage.emergencyContacts) || triage.emergencyContacts.length === 0) {
    errors.push('At least one emergency contact is required');
  } else {
    for (let i = 0; i < triage.emergencyContacts.length; i++) {
      const contact = triage.emergencyContacts[i];
      if (!contact.name || !contact.phone) {
        errors.push(`Emergency contact #${i + 1} must include name and phone number`);
      }
    }
  }

  return errors;
}

/**
 * Parses and validates an incoming MediQR payload string.
 * Supports direct JSON strings as well as deep-link / URL query parameters.
 */
export function parseQRCodePayload(input: string): ParsedMediQR {
  const errors: string[] = [];
  let rawJson = input.trim();

  // If input is a URL containing ?data= or hash, extract it
  if (rawJson.startsWith('http://') || rawJson.startsWith('https://')) {
    try {
      const url = new URL(rawJson);
      const paramData = url.searchParams.get('data');
      if (paramData) {
        rawJson = decodeURIComponent(paramData);
      }
    } catch {
      // Continue with rawJson if URL parsing fails
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err: any) {
    return {
      isValid: false,
      validationErrors: [`Malformed QR JSON payload: ${err.message}`],
      rawPayload: input,
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      validationErrors: ['QR content is not a valid JSON object'],
      rawPayload: input,
    };
  }

  // Version check
  if (!parsed.v) {
    errors.push('Missing schema version "v"');
  }

  // Triage validation
  const triageErrors = validateTriageData(parsed.triage);
  errors.push(...triageErrors);

  // Patient Hash validation
  if (!parsed.patientHash || typeof parsed.patientHash !== 'string') {
    errors.push('Missing "patientHash"');
  } else {
    const isHex = /^0x[0-9a-fA-F]{64}$/.test(parsed.patientHash);
    if (!isHex) {
      errors.push('Invalid "patientHash": must be 0x-prefixed 64-character hexadecimal (32-byte bytes32)');
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      version: parsed.v,
      triage: parsed.triage,
      patientHash: parsed.patientHash,
      validationErrors: errors,
      rawPayload: input,
    };
  }

  return {
    isValid: true,
    version: parsed.v,
    triage: parsed.triage as TriageData,
    patientHash: parsed.patientHash,
    issuedAt: parsed.issuedAt,
    issuerNodeId: parsed.issuerNodeId,
    validationErrors: [],
    rawPayload: input,
  };
}
