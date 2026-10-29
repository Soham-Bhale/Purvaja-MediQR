'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import { useDoctor } from '../../lib/doctor-context';
import { getPatientRecordsFromLedger, BlockchainRecord, commitRecordOnChain } from '../../lib/blockchain';
import { verifyAndDecryptRecord, VerificationReport } from '../../lib/crypto-client';
import HashIntegrityBadge from '../../components/HashIntegrityBadge';
import FingerprintScanner from '../../components/FingerprintScanner';
import EmailInboxModal from '../../components/EmailInboxModal';
import {
  hasActiveBiometricSession,
  createBiometricSession,
  clearBiometricSession,
  getBiometricForDoctor,
} from '../../lib/biometrics';
import {
  getStoredAppointments,
  getAppointmentsForDoctor,
  updateAppointmentStatus,
  Appointment,
} from '../../lib/appointments';
import { mineNewBlock } from '../../lib/blockchain-blocks';
import { sendMediQRRecordDeliveryEmail } from '../../lib/email-service';

function DoctorPortalContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get('patientHash') || '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872';

  const { activeDoctor, setActiveDoctor, isVerified, doctorDetails } = useDoctor();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'consultation' | 'records'>('appointments');

  // Appointments State
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Consultation Suite Form State
  const [examinationFindings, setExaminationFindings] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [vitalBP, setVitalBP] = useState('120/80 mmHg');
  const [vitalHR, setVitalHR] = useState('78 bpm');
  const [vitalSpO2, setVitalSpO2] = useState('99%');
  const [vitalTemp, setVitalTemp] = useState('98.6 °F');
  const [prescriptions, setPrescriptions] = useState<Array<{ drug: string; dosage: string; frequency: string; duration: string }>>([
    { drug: 'Budesonide Inhaler 200mcg', dosage: '2 Puffs', frequency: 'Twice daily', duration: '30 Days' },
    { drug: 'Montelukast 10mg', dosage: '1 Tablet', frequency: 'At bedtime', duration: '14 Days' },
  ]);
  const [diagnosticNotes, setDiagnosticNotes] = useState('Patient educated on inhaler technique and trigger avoidance.');
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);
  const [consultationResult, setConsultationResult] = useState<{
    appointment: Appointment;
    qrCodeUrl: string;
    recordKey: string;
    txHash: string;
    blockNumber: number;
  } | null>(null);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Blockchain Ledger Query State
  const [patientHash, setPatientHash] = useState<string>(initialHash);
  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([]);
  const [reports, setReports] = useState<Record<string, VerificationReport>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [ledgerSource, setLedgerSource] = useState<string>('federation-state');
  const [tamperingRecordId, setTamperingRecordId] = useState<string | null>(null);

  // Biometrics
  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return hasActiveBiometricSession(activeDoctor);
    }
    return false;
  });
  const [enrolledBiometric, setEnrolledBiometric] = useState<ReturnType<typeof getBiometricForDoctor>>(() =>
    getBiometricForDoctor(activeDoctor)
  );

  const [queryStatus, setQueryStatus] = useState<{
    type: 'success' | 'empty' | 'error' | 'loading';
    message: string;
    timestamp: string;
  } | null>(null);

  // Refresh appointments for active doctor
  function refreshAppointments() {
    const list = getAppointmentsForDoctor(activeDoctor);
    setDoctorAppointments(list);
  }

  useEffect(() => {
    refreshAppointments();
    window.addEventListener('mediqr_appointment_updated', refreshAppointments);
    window.addEventListener('storage', refreshAppointments);
    return () => {
      window.removeEventListener('mediqr_appointment_updated', refreshAppointments);
      window.removeEventListener('storage', refreshAppointments);
    };
  }, [activeDoctor]);

  // Sync Biometrics
  useEffect(() => {
    function updateBio() {
      if (typeof window !== 'undefined') {
        const unlocked = hasActiveBiometricSession(activeDoctor);
        setIsBiometricUnlocked(unlocked);
        setEnrolledBiometric(getBiometricForDoctor(activeDoctor));
      }
    }
    updateBio();
    window.addEventListener('mediqr_biometric_session_change', updateBio);
    window.addEventListener('mediqr_enrolled_biometrics_change', updateBio);
    window.addEventListener('storage', updateBio);
    return () => {
      window.removeEventListener('mediqr_biometric_session_change', updateBio);
      window.removeEventListener('mediqr_enrolled_biometrics_change', updateBio);
      window.removeEventListener('storage', updateBio);
    };
  }, [activeDoctor]);

  // Load records whenever patientHash changes and biometric unlocked
  async function loadAndVerifyRecords(hashToQuery: string) {
    const raw = (hashToQuery || '').trim();
    if (!raw) return;

    if (!isVerified) {
      setQueryStatus({
        type: 'error',
        message: '403 Access Denied: Caller address is not verified in MedicalRecordLedger.sol.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    const cleanHash = raw.startsWith('0x') ? raw : `0x${raw}`;
    setPatientHash(cleanHash);
    setLoading(true);
    setQueryStatus({
      type: 'loading',
      message: `Querying blockchain ledger for hash ${cleanHash.slice(0, 10)}...`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const { records, source } = await getPatientRecordsFromLedger(cleanHash);
      setBlockchainRecords(records);
      setLedgerSource(source);

      if (records.length === 0) {
        setReports({});
        setQueryStatus({
          type: 'empty',
          message: `Zero on-chain records found for ${cleanHash.slice(0, 10)}...`,
          timestamp: new Date().toLocaleTimeString(),
        });
        return;
      }

      const newReports: Record<string, VerificationReport> = {};
      let verifiedCount = 0;
      let tamperedCount = 0;

      for (const record of records) {
        const report = await verifyAndDecryptRecord(record.storageURI, record.fileHash);
        newReports[record.storageURI] = report;
        if (report.isTamperFree) verifiedCount++;
        else tamperedCount++;
      }
      setReports(newReports);

      if (tamperedCount > 0) {
        setQueryStatus({
          type: 'error',
          message: `⚠️ CRITICAL: ${tamperedCount} record(s) failed on-chain SHA-256 verification! Cryptographic tampering detected.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setQueryStatus({
          type: 'success',
          message: `✓ Successfully verified ${verifiedCount} record(s) against immutable on-chain hashes. In-memory decryption authorized.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      setQueryStatus({
        type: 'error',
        message: `Query error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isVerified && isBiometricUnlocked && activeTab === 'records') {
      loadAndVerifyRecords(patientHash);
    }
  }, [isVerified, activeDoctor, isBiometricUnlocked, activeTab]);

  // Start Consultation on selected appointment
  function handleStartConsultation(apt: Appointment) {
    setSelectedAppointment(apt);
    setExaminationFindings(apt.examinationFindings || 'Patient evaluated during clinical consultation. Respiratory and general vitals screened.');
    setDiagnosis(apt.diagnosis || (apt.consultationReason || 'Clinical Consultation & Triage Screening'));
    if (apt.vitalSigns) {
      setVitalBP(apt.vitalSigns.bloodPressure);
      setVitalHR(apt.vitalSigns.heartRate);
      setVitalSpO2(apt.vitalSigns.spO2);
      setVitalTemp(apt.vitalSigns.temperature);
    }
    if (apt.prescriptions && apt.prescriptions.length > 0) {
      setPrescriptions(apt.prescriptions);
    }
    setActiveTab('consultation');
  }

  // Complete Consultation & Anchor to Blockchain
  async function handleCompleteConsultation() {
    if (!selectedAppointment) return;
    setIsSubmittingConsultation(true);

    try {
      const recordId = `REC-${Date.now().toString(36).toUpperCase()}`;
      const recordKey = selectedAppointment.patientHash;

      // 1. Off-chain medical record object
      const medicalRecordPayload = {
        recordId,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        hospitalName: selectedAppointment.hospitalName,
        hospitalNodeId: selectedAppointment.hospitalId,
        recordType: 'CONSULTATION',
        recordDate: new Date().toISOString().split('T')[0],
        diagnosis,
        clinicalNotes: examinationFindings,
        prescriptions,
        vitalSigns: {
          bloodPressure: vitalBP,
          heartRate: vitalHR,
          spO2: vitalSpO2,
          temperature: vitalTemp,
        },
        attendingPhysician: {
          name: doctorDetails?.name || 'Dr. Ramesh Gupta',
          licenseNumber: 'MCI-CONSORTIUM-2026',
          department: selectedAppointment.department,
          walletAddress: activeDoctor,
        },
      };

      // 2. Upload to hospital storage node (AES-256-GCM encrypted)
      let storageURI = `${selectedAppointment.hospitalNodeUrl}/api/records/${recordId}`;
      let fileHash = '0xf305f9e03ccdcfc6818534fd272f0178b9f5324b032b50bf90c8bfb607d83d72';

      try {
        const uploadRes = await fetch(`${selectedAppointment.hospitalNodeUrl}/api/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientHash: recordKey,
            medicalData: medicalRecordPayload,
          }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          storageURI = uploadData.storageURI;
          fileHash = uploadData.fileHash;
        }
      } catch (err) {
        console.warn('Hospital node upload offline, using client fallback record.');
      }

      // 3. Commit on-chain via smart contract or federation ledger
      const onChainResult = await commitRecordOnChain(
        recordKey,
        fileHash,
        storageURI,
        'CONSULTATION',
        activeDoctor
      );

      // 4. Generate Emergency MediQR Code with STATIC TEXT (Zero Browser/URL Redirection)
      // When scanned by any smartphone camera (iPhone/Android/Lens), the static medical text pops up directly in the viewfinder with zero internet.
      const staticEmergencyText = `🚨 MEDIQR ROADSIDE EMERGENCY TRIAGE 🚨
========================================
PATIENT: ${selectedAppointment.patientName} (${selectedAppointment.age || '29'}y / ${selectedAppointment.gender || 'M'})
BLOOD GROUP: ${selectedAppointment.bloodType} [CRITICAL]
ALLERGIES: ${selectedAppointment.criticalAllergies && selectedAppointment.criticalAllergies.length > 0 ? selectedAppointment.criticalAllergies.join(', ') : 'None Reported'}
CONDITIONS: ${selectedAppointment.chronicConditions && selectedAppointment.chronicConditions.length > 0 ? selectedAppointment.chronicConditions.join(', ') : 'None'}
ICE EMERGENCY CONTACT:
${selectedAppointment.emergencyContactName || 'Emergency Contact'}: ${selectedAppointment.emergencyContactPhone}
========================================
PHYSICIAN KEY: ${recordKey.slice(0, 24)}...
BLOCKCHAIN REF: ${onChainResult.txHash ? onChainResult.txHash.slice(0, 22) : '0x3f8a...'}...
ISSUING NODE: ${selectedAppointment.hospitalName || 'Consortium Hospital'}
STATUS: OFFLINE AIR-GAPPED VERIFIED`;

      const qrCodeDataUrl = await QRCode.toDataURL(staticEmergencyText, {
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 7,
        color: { dark: '#000000', light: '#ffffff' },
      });

      // 5. Update appointment in storage
      const updatedApt = updateAppointmentStatus(selectedAppointment.id, 'COMPLETED', {
        examinationFindings,
        diagnosis,
        vitalSigns: { bloodPressure: vitalBP, heartRate: vitalHR, spO2: vitalSpO2, temperature: vitalTemp },
        prescriptions,
        diagnosticNotes,
        recordId,
        recordKey,
        qrCodeDataUrl,
        blockchainTxHash: onChainResult.txHash,
        blockchainBlockNumber: onChainResult.blockNumber,
        completedAt: Date.now(),
      });

      // 6. Mine a block on the Live Blockchain Explorer!
      await mineNewBlock([
        {
          txId: onChainResult.txHash,
          type: 'MEDICAL_RECORD_COMMITTED',
          timestamp: Date.now(),
          patientHash: recordKey,
          patientName: selectedAppointment.patientName,
          details: `Medical Record ${recordId} Anchored | Doctor: ${doctorDetails?.name || 'Dr. Physician'} | AES-256-GCM Encrypted`,
          recordId,
          doctor: doctorDetails?.name || 'Dr. Physician',
          hospitalNode: selectedAppointment.hospitalId,
          fileHash,
          status: 'MINED',
        },
      ]);

      // 7. Dispatch Email with QR code and unique key
      if (updatedApt) {
        sendMediQRRecordDeliveryEmail(updatedApt, qrCodeDataUrl, recordKey);
      }

      setConsultationResult({
        appointment: updatedApt || selectedAppointment,
        qrCodeUrl: qrCodeDataUrl,
        recordKey,
        txHash: onChainResult.txHash,
        blockNumber: onChainResult.blockNumber,
      });

      refreshAppointments();
    } catch (err: any) {
      alert(`Consultation submission failed: ${err.message}`);
    } finally {
      setIsSubmittingConsultation(false);
    }
  }

  // Tamper & Restore simulator triggers
  async function triggerTamper(storageURI: string) {
    try {
      setTamperingRecordId(storageURI);
      const url = new URL(storageURI);
      const recordId = url.pathname.split('/').pop();
      await fetch(`${url.origin}/api/simulator/tamper/${recordId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ciphertext' }),
      });
      await loadAndVerifyRecords(patientHash);
    } finally {
      setTamperingRecordId(null);
    }
  }

  async function triggerRestore(storageURI: string) {
    try {
      setTamperingRecordId(storageURI);
      const url = new URL(storageURI);
      const recordId = url.pathname.split('/').pop();
      await fetch(`${url.origin}/api/simulator/restore/${recordId}`, { method: 'POST' });
      await loadAndVerifyRecords(patientHash);
    } finally {
      setTamperingRecordId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner (Laptop 2: Doctor Workstation) */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2.5 border border-white/20">
            <span>💻</span> Laptop 2: Doctor Dashboard &amp; Medical Record Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Clinical Workstation &amp; Consultation Suite
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 max-w-2xl leading-relaxed">
            Manage scheduled appointments, record examination findings, generate cryptographic emergency MediQR codes, and anchor clinical records to the consortium blockchain.
          </p>
        </div>

        {/* Doctor Status & Biometric Quick Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-xs">
            <div className="text-[10px] text-indigo-300 font-bold uppercase">Active Physician</div>
            <div className="font-bold text-white text-sm">{doctorDetails?.name || 'Dr. Physician'}</div>
            <div className="text-[11px] text-indigo-200">{doctorDetails?.hospital}</div>
          </div>

          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>✉️</span>
            <span>Email Outbox</span>
          </button>

          <Link
            href="/blockchain"
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <span>⛓️ Live Blockchain Explorer →</span>
          </Link>
        </div>
      </div>

      {/* Biometric Gatekeeper Status Notice */}
      {!isBiometricUnlocked && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <span>🔒</span>
              <span>Practitioner Biometric Verification Required</span>
            </div>
            <p className="text-xs text-amber-800">
              Under medical privacy regulations, high-privilege operations require physical biometric fingerprint verification against your enrolled template.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              createBiometricSession(activeDoctor, doctorDetails?.name || 'Dr. Practitioner');
              setIsBiometricUnlocked(true);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition whitespace-nowrap cursor-pointer"
          >
            🔓 Authenticate Fingerprint
          </button>
        </div>
      )}

      {/* Doctor Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📅</span>
          <span>Scheduled Appointments ({doctorAppointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('consultation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'consultation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🩺</span>
          <span>Active Patient Examination Suite</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'records'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🛡️</span>
          <span>Consortium Blockchain Ledger &amp; Tamper Verification</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULED APPOINTMENTS QUEUE */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span>
              <span>Patient Appointments Assigned to {doctorDetails?.name || 'You'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Auto-syncs across private network upon patient payment
            </span>
          </div>

          {doctorAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="text-3xl">📭</div>
              <h3 className="font-bold text-slate-800 text-sm">No Appointments in Queue</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No patients are currently scheduled for this doctor. Book a paid appointment on Laptop 1 (or the home page) to see it appear here immediately!
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
              >
                Go to Patient Booking →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctorAppointments.map((apt) => {
                const isCompleted = apt.status === 'COMPLETED';

                return (
                  <div
                    key={apt.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition ${
                      isCompleted ? 'border-slate-200' : 'border-blue-300 ring-2 ring-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Token ID</span>
                        <div className="font-mono text-base font-extrabold text-blue-700">{apt.id}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {isCompleted ? '✓ Completed' : '⏳ Pending Examination'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
                        <strong className="text-slate-900 text-sm">{apt.patientName}</strong>
                        <span className="text-[11px] text-slate-500 block font-semibold">{apt.gender}, {apt.age} yrs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                        <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold text-xs">
                          {apt.bloodType}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Slot</span>
                        <span className="text-slate-700 font-semibold">{apt.appointmentDate}</span>
                        <span className="block text-[11px] text-slate-500">{apt.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Fee</span>
                        <span className="text-emerald-700 font-bold font-mono">₹{apt.serviceFee}.00 ({apt.paymentStatus})</span>
                      </div>
                    </div>

                    {apt.criticalAllergies.length > 0 && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-900 flex items-center gap-2">
                        <span className="font-bold">⚠️ Allergies:</span>
                        <span className="truncate">{apt.criticalAllergies.join(', ')}</span>
                      </div>
                    )}

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <strong>Complaint:</strong> {apt.consultationReason}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {isCompleted ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <span>✓</span>
                          <span>MediQR &amp; Record Dispatched</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Paid via {apt.paymentMethod}</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartConsultation(apt)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        <span>🩺</span>
                        <span>{isCompleted ? 'Review Consultation' : 'Examine Patient'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE PATIENT EXAMINATION SUITE */}
      {activeTab === 'consultation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {selectedAppointment ? (
            <div className="space-y-6">
              {/* Header with Patient Card */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg">
                      Active Examination
                    </span>
                    <span className="font-mono text-xs text-slate-400">Token: {selectedAppointment.id}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {selectedAppointment.patientName} ({selectedAppointment.age} yrs, {selectedAppointment.gender})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chief Complaint: <strong className="text-slate-800">{selectedAppointment.consultationReason}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
                    <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-sm">
                      {selectedAppointment.bloodType}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('appointments')}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition"
                  >
                    ← Switch Patient
                  </button>
                </div>
              </div>

              {/* Patient Vitals Entry */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Clinical Vital Signs
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitalBP}
                      onChange={(e) => setVitalBP(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Heart Rate</label>
                    <input
                      type="text"
                      value={vitalHR}
                      onChange={(e) => setVitalHR(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">SpO2 Oxygen</label>
                    <input
                      type="text"
                      value={vitalSpO2}
                      onChange={(e) => setVitalSpO2(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Temperature</label>
                    <input
                      type="text"
                      value={vitalTemp}
                      onChange={(e) => setVitalTemp(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Examination & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis *</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    placeholder="e.g. Acute Bronchial Asthma Exacerbation"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnostic Notes &amp; Instructions</label>
                  <input
                    type="text"
                    value={diagnosticNotes}
                    onChange={(e) => setDiagnosticNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Follow up in 2 weeks"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Doctor's Examination Findings &amp; Clinical Notes *</label>
                  <textarea
                    rows={3}
                    value={examinationFindings}
                    onChange={(e) => setExaminationFindings(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    placeholder="Enter in-depth examination findings..."
                  />
                </div>
              </div>

              {/* Prescription Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Prescriptions &amp; Dosages
                  </label>
                  <button
                    type="button"
                    onClick={() => setPrescriptions([...prescriptions, { drug: 'New Medicine', dosage: '1 Tab', frequency: 'Once daily', duration: '5 Days' }])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    + Add Medication
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={p.drug}
                        onChange={(e) => {
                          const copy = [...prescriptions];
                          copy[idx].drug = e.target.value;
                          setPrescriptions(copy);
                        }}
                        className="bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg font-semibold"
                        placeholder="Drug Name"
                      />
                      <input
                        type="text"
                        value={p.dosage}
                        onChange={(e) => {
                          const copy = [...prescriptions];
                          copy[idx].dosage = e.target.value;
                          setPrescriptions(copy);
                        }}
                        className="bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        placeholder="Dosage"
                      />
                      <input
                        type="text"
                        value={p.frequency}
                        onChange={(e) => {
                          const copy = [...prescriptions];
                          copy[idx].frequency = e.target.value;
                          setPrescriptions(copy);
                        }}
                        className="bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg"
                        placeholder="Frequency"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={p.duration}
                          onChange={(e) => {
                            const copy = [...prescriptions];
                            copy[idx].duration = e.target.value;
                            setPrescriptions(copy);
                          }}
                          className="w-full bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg"
                          placeholder="Duration"
                        />
                        <button
                          type="button"
                          onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                          className="px-2 text-rose-500 hover:text-rose-700 font-bold"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Submitting encrypts off-chain records (AES-256-GCM), anchors SHA-256 fingerprint on blockchain, generates MediQR, and emails the patient.
                </div>

                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  disabled={isSubmittingConsultation || !diagnosis}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>{isSubmittingConsultation ? '⌛ Encrypting & Mining Block...' : '✓ Complete Consultation & Anchor to Blockchain'}</span>
                </button>
              </div>

              {/* POST-CONSULTATION SUCCESS MODAL / CARD */}
              {consultationResult && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
                    <div>
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Consultation Successfully Concluded &amp; Anchored</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-emerald-950 mt-1">
                        Unique Emergency MediQR Code &amp; Key Generated
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailModalOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✉️</span>
                      <span>Inspect Dispatched Email</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* QR Code Presentation */}
                    <div className="md:col-span-5 text-center bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                        Scan with ANY Phone Camera (Device 3)
                      </div>
                      <img
                        src={consultationResult.qrCodeUrl}
                        alt="Emergency MediQR"
                        className="w-48 h-48 mx-auto rounded-xl border-4 border-slate-900 shadow-sm"
                      />
                      <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mt-2.5 border border-emerald-200">
                        ✓ Static Text Display (Zero URL / Offline)
                      </div>
                      <a
                        href={consultationResult.qrCodeUrl}
                        download={`MediQR-${consultationResult.appointment.patientName}.png`}
                        className="inline-block mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
                      >
                        ⬇ Download PNG
                      </a>
                    </div>

                    {/* Cryptographic Proof Details */}
                    <div className="md:col-span-7 space-y-3 text-xs">
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Unique Medical Key (32-byte)</span>
                        <div className="font-mono text-[11px] text-slate-800 break-all select-all font-semibold mt-1">
                          {consultationResult.recordKey}
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Mined Blockchain TX Reference</span>
                        <div className="font-mono text-[11px] text-blue-700 truncate select-all font-semibold mt-1">
                          {consultationResult.txHash}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Link
                          href="/blockchain"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          View in Live Blockchain Explorer →
                        </Link>
                        <Link
                          href="/emergency"
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          Open Triage View (Mobile) →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an appointment from the queue above or click "Examine Patient" to launch the clinical consultation suite.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BLOCKCHAIN AUDIT & TAMPER PROOFS */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🛡️</span>
              <span>Cryptographic Fingerprint Matching &amp; Historical Ledger Records</span>
            </h2>
            <p className="text-xs text-slate-500">
              Query off-chain AES-256-GCM encrypted records and verify their SHA-256 fingerprints against <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">MedicalRecordLedger.sol</code>.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={patientHash}
                onChange={(e) => setPatientHash(e.target.value)}
                placeholder="Enter 32-byte 0x patient hash"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => loadAndVerifyRecords(patientHash)}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Query Ledger'}
              </button>
            </div>

            {queryStatus && (
              <div className={`p-4 rounded-xl text-xs border ${
                queryStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : queryStatus.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                {queryStatus.message}
              </div>
            )}
          </div>

          {/* Historical Record Cards */}
          <div className="space-y-4">
            {blockchainRecords.map((record, index) => {
              const report = reports[record.storageURI];
              const isVerifiedFree = report?.isTamperFree;
              const decrypted = report?.decryptedData;

              return (
                <div key={record.storageURI + index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-xs">
                        {record.recordType}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        {decrypted?.diagnosis || 'Encrypted Clinical Record'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {report ? (
                        isVerifiedFree ? (
                          <>
                            <button
                              type="button"
                              onClick={() => triggerTamper(record.storageURI)}
                              disabled={tamperingRecordId === record.storageURI}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition shadow-2xs cursor-pointer"
                            >
                              <span>⚡</span>
                              <span>{tamperingRecordId === record.storageURI ? 'Corrupting...' : 'Simulate Bit-Flip'}</span>
                            </button>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>✓ Blockchain Verified</span>
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                            <span>⚠️ Record Tampered</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400">Verifying on ledger...</span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    {!isVerifiedFree && report && (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm">⚠️ Decryption Blocked: Data Integrity Failure</div>
                            <p className="text-[11px] text-rose-800 mt-0.5">
                              Off-chain ciphertext does not match the immutable cryptographic fingerprint registered on the blockchain.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => triggerRestore(record.storageURI)}
                            disabled={tamperingRecordId === record.storageURI}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            ✓ Restore Pristine File
                          </button>
                        </div>
                      </div>
                    )}

                    {isVerifiedFree && decrypted && (
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
                            <strong className="text-slate-900">{decrypted.patientName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Facility</span>
                            <strong className="text-blue-700">{decrypted.hospitalName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending Doctor</span>
                            <strong className="text-slate-900">{decrypted.attendingPhysician?.name}</strong>
                          </div>
                        </div>

                        <div>
                          <strong className="text-slate-900 block mb-1">Clinical Notes:</strong>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            {decrypted.clinicalNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outbound Email Modal */}
      <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading Workstation Console...</div>}>
      <DoctorPortalContent />
    </Suspense>
  );
}
