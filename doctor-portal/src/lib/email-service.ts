import { Appointment } from './appointments';

export interface SentEmail {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  sentAt: number;
  type: 'APPOINTMENT_CONFIRMATION' | 'MEDIQR_RECORD_DELIVERY';
  appointmentToken?: string;
  hospitalName: string;
  doctorName: string;
  qrCodeDataUrl?: string;
  recordKey?: string;
  bodyPreview: string;
  bodyHtml: string;
}

export const EMAILS_STORAGE_KEY = 'mediqr_consortium_sent_emails_v1';

let inMemoryEmails: SentEmail[] = [
  {
    id: 'EML-2026-001',
    to: 'jane.doe@healthmail.com',
    recipientName: 'Jane Doe',
    subject: 'Confirmed: Your MediQR Appointment Token at Apollo Speciality Hospital',
    sentAt: Date.now() - 86400000,
    type: 'APPOINTMENT_CONFIRMATION',
    appointmentToken: 'APT-APO-2026-8812',
    hospitalName: 'Apollo Speciality Hospital',
    doctorName: 'Dr. Ramesh Gupta',
    bodyPreview: 'Your appointment has been confirmed. Service fee ₹500 paid. Token ID: APT-APO-2026-8812.',
    bodyHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e3a8a;">MediQR Healthcare Consortium</h2>
        <p>Dear <strong>Jane Doe</strong>,</p>
        <p>Your paid healthcare appointment has been registered and anchored on the MediQR blockchain ledger.</p>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p><strong>Appointment Token ID:</strong> <span style="font-family: monospace; color: #2563eb; font-size: 16px;">APT-APO-2026-8812</span></p>
          <p><strong>Attending Physician:</strong> Dr. Ramesh Gupta (Apollo Speciality)</p>
          <p><strong>Consultation Fee:</strong> ₹500.00 (PAID via UPI)</p>
          <p><strong>Status:</strong> Ready for Doctor Consultation</p>
        </div>
        <p>Please present this Token ID upon arriving at the clinic or during telemedicine check-in.</p>
      </div>
    `,
  },
];

export function getStoredEmails(): SentEmail[] {
  if (typeof window === 'undefined') return inMemoryEmails;
  try {
    const raw = localStorage.getItem(EMAILS_STORAGE_KEY);
    if (raw) {
      const parsed: SentEmail[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading sent emails:', err);
  }
  persistEmails(inMemoryEmails);
  return inMemoryEmails;
}

export function persistEmails(emails: SentEmail[]): void {
  inMemoryEmails = [...emails];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
      window.dispatchEvent(new CustomEvent('mediqr_email_dispatched', { detail: emails }));
    } catch (err) {
      console.error('Failed persisting emails:', err);
    }
  }
}

export function sendAppointmentConfirmationEmail(appointment: Appointment): SentEmail {
  const emailId = `EML-${Date.now().toString(36).toUpperCase()}`;
  const subject = `Confirmed: MediQR Consultation Token [${appointment.id}] at ${appointment.hospitalName}`;
  const bodyPreview = `Your appointment with ${appointment.doctorName} on ${appointment.appointmentDate} (${appointment.timeSlot}) is confirmed. Fee ₹${appointment.serviceFee} paid.`;

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <div style="background-color: #2563eb; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">+</div>
        <div>
          <h2 style="margin: 0; color: #0f172a; font-size: 18px;">MediQR Healthcare Consortium</h2>
          <span style="font-size: 12px; color: #64748b;">Automated Appointment & Blockchain Notification</span>
        </div>
      </div>

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <span style="color: #065f46; font-weight: bold; font-size: 14px;">✓ Payment Verified & Appointment Confirmed</span>
        <p style="margin: 6px 0 0; color: #047857; font-size: 12px;">Service fee of ₹${appointment.serviceFee}.00 received via ${appointment.paymentMethod}. Transaction anchored to Consortium Blockchain.</p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em;">Your Official Token ID</div>
        <div style="font-family: monospace; font-size: 22px; font-weight: bold; color: #2563eb; margin: 6px 0;">${appointment.id}</div>
        <div style="border-top: 1px solid #e2e8f0; margin: 12px 0;"></div>
        <table style="width: 100%; font-size: 13px; color: #334155;">
          <tr><td style="padding: 4px 0; color: #64748b;">Patient Name:</td><td><strong>${appointment.patientName}</strong></td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Attending Doctor:</td><td><strong>${appointment.doctorName}</strong></td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Hospital:</td><td>${appointment.hospitalName}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Scheduled Date:</td><td><strong>${appointment.appointmentDate}</strong> (${appointment.timeSlot})</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Reason:</td><td>${appointment.consultationReason}</td></tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This token has been notified to ${appointment.doctorName}'s terminal. After consultation, your emergency MediQR code and unique key will be delivered to this address.</p>
    </div>
  `;

  const newEmail: SentEmail = {
    id: emailId,
    to: appointment.email,
    recipientName: appointment.patientName,
    subject,
    sentAt: Date.now(),
    type: 'APPOINTMENT_CONFIRMATION',
    appointmentToken: appointment.id,
    hospitalName: appointment.hospitalName,
    doctorName: appointment.doctorName,
    bodyPreview,
    bodyHtml,
  };

  const all = getStoredEmails();
  all.unshift(newEmail);
  persistEmails(all);
  return newEmail;
}

export function sendMediQRRecordDeliveryEmail(
  appointment: Appointment,
  qrCodeUrl: string,
  recordKey: string
): SentEmail {
  const emailId = `EML-${Date.now().toString(36).toUpperCase()}`;
  const subject = `Your MediQR Emergency Medical Card & Encrypted Access Key [${appointment.patientName}]`;
  const bodyPreview = `Your consultation with ${appointment.doctorName} is complete. Your MediQR emergency card and encrypted record key are attached.`;

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <div style="background-color: #10b981; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">✓</div>
        <div>
          <h2 style="margin: 0; color: #0f172a; font-size: 18px;">MediQR Consultation Completed</h2>
          <span style="font-size: 12px; color: #64748b;">Medical Record Anchored to Blockchain</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #334155;">Dear <strong>${appointment.patientName}</strong>,</p>
      <p style="font-size: 13px; color: #334155;">Your consultation with <strong>${appointment.doctorName}</strong> at ${appointment.hospitalName} has concluded. Your medical record has been encrypted at rest with AES-256-GCM and its cryptographic SHA-256 fingerprint committed to the blockchain.</p>

      <div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px;">
        <div style="font-size: 12px; font-weight: bold; color: #1e293b; margin-bottom: 12px; text-transform: uppercase;">Your Personal Emergency MediQR Code</div>
        <img src="${qrCodeUrl}" alt="MediQR Code" style="width: 220px; height: 220px; border-radius: 12px; border: 4px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
        <p style="font-size: 11px; color: #64748b; margin-top: 10px;">Save this QR code on your mobile lock-screen or print it. In an emergency, paramedics can scan it in 0.02s without requiring internet access or keys.</p>
      </div>

      <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Your Unique Cryptographic Medical Key</div>
        <div style="font-family: monospace; font-size: 13px; color: #0f172a; word-break: break-all; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 6px;">
          ${recordKey}
        </div>
        <p style="font-size: 11px; color: #64748b; margin: 8px 0 0;">Keep this key safe. Only physicians possessing this key can decrypt your in-depth clinical notes and prescription history.</p>
      </div>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; font-size: 12px; color: #1e40af;">
        <strong>Clinical Diagnosis:</strong> ${appointment.diagnosis || 'Standard Health Check & Consultation'}<br>
        <strong>Prescription:</strong> ${appointment.prescriptions?.map((p) => `${p.drug} (${p.dosage})`).join(', ') || 'No active prescription'}<br>
        <strong>Blockchain TX:</strong> <span style="font-family: monospace;">${appointment.blockchainTxHash?.slice(0, 20)}...</span>
      </div>
    </div>
  `;

  const newEmail: SentEmail = {
    id: emailId,
    to: appointment.email,
    recipientName: appointment.patientName,
    subject,
    sentAt: Date.now(),
    type: 'MEDIQR_RECORD_DELIVERY',
    appointmentToken: appointment.id,
    hospitalName: appointment.hospitalName,
    doctorName: appointment.doctorName,
    qrCodeDataUrl: qrCodeUrl,
    recordKey,
    bodyPreview,
    bodyHtml,
  };

  const all = getStoredEmails();
  all.unshift(newEmail);
  persistEmails(all);
  return newEmail;
}
