'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDoctor } from '../../lib/doctor-context';
import { getPatientRecordsFromLedger, BlockchainRecord } from '../../lib/blockchain';
import { verifyAndDecryptRecord, VerificationReport } from '../../lib/crypto-client';
import HashIntegrityBadge from '../../components/HashIntegrityBadge';
import FingerprintScanner from '../../components/FingerprintScanner';
import {
  hasActiveBiometricSession,
  createBiometricSession,
  clearBiometricSession,
  getBiometricForDoctor,
} from '../../lib/biometrics';

function DoctorPortalContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get('patientHash') || '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872';

  const { activeDoctor, setActiveDoctor, isVerified, doctorDetails } = useDoctor();
  const [patientHash, setPatientHash] = useState<string>(initialHash);
  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([]);
  const [reports, setReports] = useState<Record<string, VerificationReport>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [ledgerSource, setLedgerSource] = useState<string>('federation-state');
  const [tamperingRecordId, setTamperingRecordId] = useState<string | null>(null);
  const [lastUploadedHash, setLastUploadedHash] = useState<string | null>(null);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);
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

  // Read recently registered hash from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHash = localStorage.getItem('mediqr_last_registered_hash');
      const savedName = localStorage.getItem('mediqr_last_registered_name');
      if (savedHash) setLastUploadedHash(savedHash);
      if (savedName) setLastUploadedName(savedName);
    }
  }, []);

  // Check biometric session and enrolled template on activeDoctor change and custom events
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

  // Sync with searchParams
  useEffect(() => {
    const urlHash = searchParams.get('patientHash');
    if (urlHash) {
      setPatientHash(urlHash);
      if (isBiometricUnlocked) {
        loadAndVerifyRecords(urlHash);
      }
    }
  }, [searchParams, isBiometricUnlocked]);

  // Load records whenever patientHash or activeDoctor changes
  async function loadAndVerifyRecords(hashToQuery: string) {
    const raw = (hashToQuery || '').trim();
    if (!raw) {
      setQueryStatus({
        type: 'error',
        message: 'Please enter a valid 0x patient hash to query the ledger.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    if (!isVerified) {
      setQueryStatus({
        type: 'error',
        message: '403 Access Denied: Caller address is not verified in MedicalRecordLedger.sol. Click the unlock button to switch to verified credentials.',
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
          message: `Query executed on ${source.toUpperCase()} at ${new Date().toLocaleTimeString()}. Zero on-chain records found for this patient hash.`,
          timestamp: new Date().toLocaleTimeString(),
        });
        return;
      }

      // Verify each record against its hospital node
      const newReports: Record<string, VerificationReport> = {};
      let verifiedCount = 0;
      let tamperedCount = 0;

      for (const record of records) {
        const report = await verifyAndDecryptRecord(record.storageURI, record.fileHash);
        newReports[record.storageURI] = report;
        if (report.isTamperFree) {
          verifiedCount++;
        } else {
          tamperedCount++;
        }
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
      console.error('Error querying blockchain records:', err);
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
    if (isVerified && isBiometricUnlocked) {
      loadAndVerifyRecords(patientHash);
    }
  }, [isVerified, activeDoctor, isBiometricUnlocked]);

  // Tamper simulation toggle
  async function triggerTamper(storageURI: string) {
    try {
      setTamperingRecordId(storageURI);
      const url = new URL(storageURI);
      const recordId = url.pathname.split('/').pop();
      const tamperEndpoint = `${url.origin}/api/simulator/tamper/${recordId}`;

      await fetch(tamperEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ciphertext' }),
      });

      await loadAndVerifyRecords(patientHash);
    } catch (err) {
      console.error('Tamper attack trigger failed:', err);
    } finally {
      setTamperingRecordId(null);
    }
  }

  // Restore record
  async function triggerRestore(storageURI: string) {
    try {
      setTamperingRecordId(storageURI);
      const url = new URL(storageURI);
      const recordId = url.pathname.split('/').pop();
      const restoreEndpoint = `${url.origin}/api/simulator/restore/${recordId}`;

      await fetch(restoreEndpoint, {
        method: 'POST',
      });

      await loadAndVerifyRecords(patientHash);
    } catch (err) {
      console.error('Restore failed:', err);
    } finally {
      setTamperingRecordId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>🩺</span> Clinical Verification Station
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Doctor Verification & In-Memory Decryption
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic SHA-256 fingerprint matching against <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">MedicalRecordLedger.sol</code> before in-memory decryption.
          </p>
        </div>

        {/* Practitioner Status */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Active Practitioner</div>
            <div className="font-semibold text-xs text-slate-900">
              {doctorDetails ? doctorDetails.name : 'Unknown'}
            </div>
            <div className="text-[10px] text-slate-500">{doctorDetails?.hospital}</div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {isVerified ? '✓ Verified' : '✗ Unregistered'}
          </span>
          {isBiometricUnlocked ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🔓</span> Biometrics Active
              </span>
              <button
                type="button"
                onClick={() => {
                  clearBiometricSession();
                  setIsBiometricUnlocked(false);
                }}
                className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition"
                title="Lock clinical terminal"
              >
                🔒 Lock
              </button>
            </div>
          ) : (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>🔒</span> Biometrics Locked
            </span>
          )}
        </div>
      </div>

      {/* 403 Access Denied Alert */}
      {!isVerified && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 shadow-sm">
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>⛔</span> 403 Forbidden: Unregistered Practitioner Address
            </div>
            <p className="text-xs text-rose-800 mt-1">
              Address <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">{activeDoctor}</code> is not in the verified whitelist. Queries and decryption are blocked by smart contract modifiers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveDoctor('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition whitespace-nowrap shadow-sm"
          >
            🔓 Unlock: Switch to Dr. Ramesh Gupta
          </button>
        </div>
      )}

      {/* Biometric Fingerprint Gatekeeper */}
      {!isBiometricUnlocked && (
        <div id="doctor-fingerprint-scanner" className="bg-white rounded-2xl border-2 border-amber-300 p-6 md:p-8 shadow-sm space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <span>🔒</span> Security Protocol Active
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Doctor Biometric Fingerprint Verification Required
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Under Ministry of Health guidelines, all clinical terminals require physical biometric fingerprint verification against the template enrolled during hospital node installation.
              </p>
            </div>
            <span className="text-xs bg-amber-100 border border-amber-300 text-amber-900 font-bold px-3 py-1 rounded-full self-start">
              Terminal Locked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Physician Credentials & Enrolment Status */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span>🩺</span>
                  <span>Practitioner Attempting Access:</span>
                </div>
                <div className="text-slate-900 font-bold text-sm pl-6">
                  {doctorDetails?.name || 'Dr. Practitioner'}
                </div>
                <div className="text-slate-500 text-xs pl-6">
                  {doctorDetails?.hospital || 'Consortium Hospital Node'}
                </div>
                <div className="text-slate-400 font-mono text-[11px] pl-6 break-all">
                  Wallet: {activeDoctor}
                </div>
              </div>

              {enrolledBiometric ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>✓</span>
                    <span>Enrolled Biometric Template Verified on Hospital Node</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800">
                    Ridge Signature: <span className="font-bold">{enrolledBiometric.ridgePatternId}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Enrolled By Official: {enrolledBiometric.enrolledBy}
                  </div>
                  <p className="text-[11px] text-emerald-700 pt-1 font-medium">
                    👉 Place your finger on the optical sensor to the right (or click the button below) to unlock the patient records workstation.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        createBiometricSession(activeDoctor, doctorDetails?.name || 'Physician');
                        setIsBiometricUnlocked(true);
                        loadAndVerifyRecords(patientHash);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>⚡</span>
                      <span>One-Touch Biometric Unlock (Authenticated)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>No Biometric Enrolled For This Doctor</span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    This practitioner wallet does not have an enrolled fingerprint template on this hospital server. Government health officials must enroll physical biometrics during appliance installation.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        createBiometricSession(activeDoctor, doctorDetails?.name || 'Physician');
                        setIsBiometricUnlocked(true);
                        loadAndVerifyRecords(patientHash);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                    >
                      ⚡ Quick Bypass For Demo (Unlock)
                    </button>
                    <Link
                      href="/installer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition inline-flex items-center gap-1 shadow-sm"
                    >
                      <span>🏛️ Launch Government Installer to Enroll</span>
                      <span>→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveDoctor('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-xs transition"
                    >
                      Switch to Dr. Ramesh Gupta (Enrolled)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Interactive Fingerprint Scanner Pad */}
            <div className="md:col-span-5 flex justify-center">
              <FingerprintScanner
                mode="verify"
                doctorName={doctorDetails?.name || 'Physician'}
                doctorWallet={activeDoctor}
                expectedBiometricHash={enrolledBiometric?.biometricTemplateHash}
                onVerifySuccess={() => {
                  createBiometricSession(activeDoctor, doctorDetails?.name || 'Physician');
                  setIsBiometricUnlocked(true);
                  loadAndVerifyRecords(patientHash);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Clinical Workspace (Unlocked via Biometrics) */}
      {isBiometricUnlocked && (
        <>
          {/* Search Bar & Presets */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label htmlFor="patientHashInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Patient Query Token (HMAC-SHA256 Salted Hash)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="patientHashInput"
              type="text"
              value={patientHash}
              onChange={(e) => setPatientHash(e.target.value.trim())}
              placeholder="0x-prefixed 32-byte hexadecimal patient query key..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <button
              type="button"
              onClick={() => loadAndVerifyRecords(patientHash)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-xs px-5 py-2 rounded-lg transition shadow-sm whitespace-nowrap"
            >
              {loading ? 'Querying...' : 'Query Blockchain Ledger →'}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Quick Presets:</span>
          
          <button
            type="button"
            onClick={() => {
              const h = '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872';
              setPatientHash(h);
              loadAndVerifyRecords(h);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1 rounded-md transition"
          >
            📋 Jane Doe (2 Seeded Records)
          </button>

          {lastUploadedHash && lastUploadedHash !== '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872' && (
            <button
              type="button"
              onClick={() => {
                setPatientHash(lastUploadedHash);
                loadAndVerifyRecords(lastUploadedHash);
              }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md border border-blue-200 transition"
            >
              ✨ Latest Upload: {lastUploadedName || 'Patient'} ({lastUploadedHash.slice(0, 10)}...)
            </button>
          )}
        </div>

        {/* Status Feedback */}
        {queryStatus && (
          <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
            queryStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            queryStatus.type === 'empty' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            queryStatus.type === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-900' :
            'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <span>{queryStatus.message}</span>
            <span className="text-[10px] text-slate-400 ml-2 shrink-0">{queryStatus.timestamp}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>Ledger Source: <strong className="text-slate-700">{ledgerSource.toUpperCase()}</strong></span>
          <span>Records Found: <strong className="text-slate-700">{blockchainRecords.length}</strong></span>
        </div>
      </div>

      {/* Record Cards */}
      {isVerified && (
        <div className="space-y-4">
          {blockchainRecords.length === 0 && !loading && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 font-mono text-xs shadow-sm">
              No medical records committed on-chain for this patient hash.
            </div>
          )}

          {blockchainRecords.map((record, index) => {
            const report = reports[record.storageURI];
            const isVerifiedFree = report?.isTamperFree;
            const decrypted = report?.decryptedData;

            return (
              <div key={record.storageURI + index} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Clean Record Header */}
                <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded text-xs">
                      {record.recordType}
                    </span>
                    <h2 className="font-bold text-sm text-slate-900">
                      {decrypted?.diagnosis || 'Encrypted Clinical Record'}
                    </h2>
                  </div>

                  {/* SMALL, CLEAN VERIFICATION PILL & SIMULATE BUTTON */}
                  <div className="flex items-center gap-2">
                    {report ? (
                      isVerifiedFree ? (
                        <>
                          <button
                            type="button"
                            onClick={() => triggerTamper(record.storageURI)}
                            disabled={tamperingRecordId === record.storageURI}
                            title="Simulate bit-flip attack on hospital storage node to demonstrate instant tampering detection"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            <span>⚡</span>
                            <span>{tamperingRecordId === record.storageURI ? 'Corrupting...' : 'Simulate Bit-Flip'}</span>
                          </button>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>✓ Blockchain Verified</span>
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                          <span>⚠️ Record Tampered</span>
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 animate-pulse">
                        Verifying on ledger...
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {/* Tampered Warning (If integrity check fails) */}
                  {!isVerifiedFree && report && (
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold flex items-center gap-1.5 text-sm">
                            <span>⚠️</span>
                            <span>Clinical Decryption Blocked: Data Integrity Failure</span>
                          </div>
                          <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
                            The off-chain medical file stored on the hospital server does not match the immutable cryptographic fingerprint registered on the blockchain ledger. In-memory decryption was blocked to prevent clinical misdiagnosis.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerRestore(record.storageURI)}
                          disabled={tamperingRecordId === record.storageURI}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-xs rounded-lg shadow-sm transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
                        >
                          {tamperingRecordId === record.storageURI ? 'Restoring...' : '✓ Restore Pristine File'}
                        </button>
                      </div>
                      <div className="bg-white/90 p-2.5 rounded-lg font-mono text-[10px] space-y-1 text-slate-700 border border-rose-200">
                        <div className="truncate"><span className="font-semibold text-slate-500">Immutable Target Hash:</span> {record.fileHash}</div>
                        <div className="truncate"><span className="font-semibold text-rose-600">Corrupted File Hash:</span> {report.computedLocalHash}</div>
                      </div>
                    </div>
                  )}

                  {/* DECRYPTED CLINICAL CONTENT */}
                  {isVerifiedFree && decrypted && (
                    <div className="space-y-4">
                      {/* Patient & Facility Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
                          <strong className="text-slate-900 text-sm">{decrypted.patientName}</strong>
                          <span className="block text-[10px] text-slate-500 font-mono">ID: {decrypted.patientId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital Facility</span>
                          <strong className="text-blue-700">{decrypted.hospitalName}</strong>
                          <span className="block text-[10px] text-slate-500 font-mono">Node: {decrypted.hospitalNodeId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attending Physician</span>
                          <strong className="text-slate-900">{decrypted.attendingPhysician?.name || 'Dr. Physician'}</strong>
                          <span className="block text-[10px] text-slate-500 font-mono">Lic: {decrypted.attendingPhysician?.licenseNumber || 'Verified'}</span>
                        </div>
                      </div>

                      {/* Clinical Consultation Notes */}
                      <div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Doctor Consultation Notes</span>
                        <p className="text-xs bg-white p-3.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans shadow-2xs">
                          {decrypted.clinicalNotes}
                        </p>
                      </div>

                      {/* Prescriptions */}
                      {decrypted.prescriptions && decrypted.prescriptions.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Prescribed Medications</span>
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-2">Medication</th>
                                  <th className="px-4 py-2">Dosage</th>
                                  <th className="px-4 py-2">Frequency</th>
                                  <th className="px-4 py-2">Duration</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {decrypted.prescriptions.map((p: any, pIdx: number) => (
                                  <tr key={pIdx} className="hover:bg-slate-50/80">
                                    <td className="px-4 py-2 font-bold text-blue-900">{p.drug}</td>
                                    <td className="px-4 py-2 font-mono text-slate-700">{p.dosage}</td>
                                    <td className="px-4 py-2 text-slate-600">{p.frequency}</td>
                                    <td className="px-4 py-2 text-slate-500">{p.duration || 'As directed'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Lab Results Table */}
                      {decrypted.labResults && decrypted.labResults.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Laboratory Diagnostic Panel</span>
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-2">Diagnostic Test</th>
                                  <th className="px-4 py-2">Result</th>
                                  <th className="px-4 py-2">Unit</th>
                                  <th className="px-4 py-2">Normal Reference</th>
                                  <th className="px-4 py-2">Flag</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {decrypted.labResults.map((lab: any, lIdx: number) => (
                                  <tr key={lIdx} className="hover:bg-slate-50/80">
                                    <td className="px-4 py-2 font-semibold text-slate-900">{lab.test}</td>
                                    <td className="px-4 py-2 font-bold text-slate-900">{lab.result}</td>
                                    <td className="px-4 py-2 text-slate-500">{lab.unit}</td>
                                    <td className="px-4 py-2 text-slate-500">{lab.normalRange}</td>
                                    <td className="px-4 py-2">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        lab.flag === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                                        lab.flag === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                                        'bg-emerald-100 text-emerald-800'
                                      }`}>
                                        {lab.flag || 'NORMAL'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Collapsible Cryptographic Audit Trail (discreet, for technical inspectors only) */}
                      <details className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 cursor-pointer select-none">
                        <summary className="hover:text-slate-600 font-mono text-[10px]">
                          🛡️ Technical Blockchain Seal (Audit Proof)
                        </summary>
                        <div className="bg-slate-50 p-2.5 rounded-lg mt-1 font-mono text-[10px] space-y-0.5 text-slate-600">
                          <div className="truncate">Solidity Fingerprint: {record.fileHash}</div>
                          <div className="truncate">Storage Appliance: {record.storageURI}</div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
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
