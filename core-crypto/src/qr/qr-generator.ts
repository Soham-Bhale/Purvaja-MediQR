import QRCode from 'qrcode';
import { MediQRPayload, TriageData } from '../types';

/**
 * Creates a valid MediQRPayload containing:
 * 1. Public emergency triage data (accessible offline to first responders without keys)
 * 2. Cryptographic salted patientHash (used as query key on blockchain by verified doctors)
 */
export function createMediQRPayload(
  triage: TriageData,
  patientHash: string,
  issuerNodeId: string = 'HOSPITAL-A'
): MediQRPayload {
  if (!patientHash || !patientHash.startsWith('0x') || patientHash.length !== 66) {
    throw new Error('Invalid patientHash: must be 0x-prefixed 32-byte hex string (66 characters)');
  }

  return {
    v: '2.0',
    triage,
    patientHash,
    issuedAt: Date.now(),
    issuerNodeId,
  };
}

/**
 * Serializes payload into JSON string.
 */
export function serializeMediQRPayload(payload: MediQRPayload): string {
  return JSON.stringify(payload);
}

/**
 * Generates a high-resolution PNG Data URL for display or printing.
 */
export async function generateQRCodeDataURL(
  payload: MediQRPayload,
  options: QRCode.QRCodeToDataURLOptions = {}
): Promise<string> {
  const serialized = serializeMediQRPayload(payload);
  return QRCode.toDataURL(serialized, {
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 8,
    color: {
      dark: '#0f172a', // Tailwind slate-900
      light: '#ffffff',
    },
    ...options,
  });
}

/**
 * Generates an SVG string of the QR code.
 */
export async function generateQRCodeSVG(
  payload: MediQRPayload,
  options: QRCode.QRCodeToStringOptions = {}
): Promise<string> {
  const serialized = serializeMediQRPayload(payload);
  return QRCode.toString(serialized, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    ...options,
  });
}
