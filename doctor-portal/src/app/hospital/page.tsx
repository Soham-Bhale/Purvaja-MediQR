'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useDoctor } from '../../lib/doctor-context';
import { computeClientPatientHash } from '../../lib/crypto-client';
import { commitRecordOnChain } from '../../lib/blockchain';

export default function HospitalPortalPage() {
  const { activeDoctor, isVerified, doctorDetails } = useDoctor();

  // Tab State
  const [activeTab, setActiveTab] = useState<'issue-qr' | 'upload-record'>('issue-qr');

  // --- QR ISSUANCE FORM STATE ---
  const [fullName, setFullName] = useState('Jane Doe');
  const [nationalId, setNationalId] = useState('IN-AADHAAR-8934-2847-1902');
  const [bloodType, setBloodType] = useState('O-');
  const [criticalAllergies, setCriticalAllergies] = useState('Penicillin G, Beta-Lactams, Peanuts');
  const [chronicConditions, setChronicConditions] = useState('Severe Asthma');
  const [contactName, setContactName] = useState('John Doe');
  const [contactPhone, setContactPhone] = useState('+1-555-0199');
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null);
  const [generatedPatientHash, setGeneratedPatientHash] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [qrFormat, setQrFormat] = useState<'url' | 'json'>('url');

  // --- RECORD UPLOAD FORM STATE ---
  const [targetNode, setTargetNode] = useState<'http://localhost:5001' | 'http://localhost:5002'>('http://localhost:5001');
  const [uploadPatientHash, setUploadPatientHash] = useState('0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872');
  const [recordType, setRecordType] = useState('CONSULTATION');
  const [diagnosis, setDiagnosis] = useState('Acute Exacerbation of Bronchial Asthma post Allergen Exposure');
  const [clinicalNotes, setClinicalNotes] = useState('Patient presented with acute dyspnea and wheezing. Nebulized with Salbutamol and Ipratropium.');
  const [prescriptionList, setPrescriptionList] = useState('Budesonide 200mcg (2 puffs BID), Montelukast 10mg (OD at bedtime)');
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleGenerateQR(e: React.FormEvent) {
    e.preventDefault();
    setIssuing(true);

    try {
      const salt = Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const hash = await computeClientPatientHash(nationalId, salt);
      setGeneratedPatientHash(hash);

      const payload = {
        v: '2.0',
        triage: {
          fullName,
          bloodType,
          criticalAllergies: criticalAllergies.split(',').map((s) => s.trim()).filter(Boolean),
          chronicConditions: chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
          emergencyContacts: [{ name: contactName, relationship: 'Emergency Contact', phone: contactPhone }],
          donorStatus: true,
          resuscitationPreference: 'FULL_CODE',
        },
        patientHash: hash,
        issuedAt: Date.now(),
        issuerNodeId: 'HOSPITAL-NODE-A',
      };

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const jsonString = JSON.stringify(payload);
      const encodedPayload = typeof window !== 'undefined'
        ? btoa(unescape(encodeURIComponent(jsonString)))
        : Buffer.from(jsonString).toString('base64');

      const qrString = qrFormat === 'url'
        ? `${origin}/emergency?data=${encodeURIComponent(encodedPayload)}`
        : jsonString;

      const qrDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 6,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setGeneratedQRUrl(qrDataUrl);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mediqr_last_registered_hash', hash);
        localStorage.setItem('mediqr_last_registered_name', fullName);
      }
    } catch (err: any) {
      alert(`Failed to generate MediQR: ${err.message}`);
    } finally {
      setIssuing(false);
    }
  }

  async function handleUploadRecord(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setUploadResult(null);

    try {
      const recordId = `REC-${Date.now().toString(36).toUpperCase()}`;
      const prescriptions = prescriptionList.split(',').map((p) => {
        const parts = p.trim().split('(');
        return {
          drug: parts[0]?.trim() || p.trim(),
          dosage: parts[1]?.replace(')', '')?.trim() || 'Standard Dose',
          frequency: 'As directed',
          duration: '10 Days',
        };
      });

      const medicalData = {
        recordId,
        patientId: 'PATIENT-FEDERATED',
        patientName: 'Jane Doe',
        hospitalName: targetNode.includes('5001') ? 'Apollo Speciality Hospital' : 'Fortis Healthcare',
        hospitalNodeId: targetNode.includes('5001') ? 'HOSPITAL-NODE-A' : 'HOSPITAL-NODE-B',
        recordType,
        recordDate: new Date().toISOString().split('T')[0],
        diagnosis,
        clinicalNotes,
        prescriptions,
        attendingPhysician: {
          name: doctorDetails?.name || 'Dr. Practitioner',
          licenseNumber: 'MCI-FED-9921',
          department: 'Emergency Medicine',
          walletAddress: activeDoctor,
        },
      };

      const uploadRes = await fetch(`${targetNode}/api/records/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          patientHash: uploadPatientHash,
          medicalData,
        }),
      });

      if (!uploadRes.ok) {
        throw new Error(`Hospital node upload failed: ${uploadRes.statusText}`);
      }

      const uploadData = await uploadRes.json();

      const onChainTx = await commitRecordOnChain(
        uploadPatientHash,
        uploadData.fileHash,
        uploadData.storageURI,
        recordType,
        activeDoctor
      );

      setUploadResult({
        ...uploadData,
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('mediqr_last_registered_hash', uploadPatientHash);
        localStorage.setItem('mediqr_last_registered_name', medicalData.patientName || 'Registered Patient');
      }
    } catch (err: any) {
      alert(`Record encryption or blockchain commit failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span>🏥</span> Hospital Operations
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Hospital Administration &amp; MediQR Issuer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue dual-segment optical MediQRs and upload AES-256-GCM encrypted records directly to distributed hospital storage nodes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('issue-qr')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'issue-qr'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Issue MediQR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload-record')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'upload-record'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Upload Clinical Record
          </button>
        </div>
      </div>

      {/* TAB 1: ISSUE MEDIQR */}
      {activeTab === 'issue-qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleGenerateQR} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Patient Vitals &amp; Emergency Demographics
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">National ID / Citizen Key</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Critical Drug Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={criticalAllergies}
                  onChange={(e) => setCriticalAllergies(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Chronic Medical Conditions</label>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Emergency Telephone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={issuing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-xs py-3 rounded-lg shadow-sm transition"
            >
              {issuing ? 'Computing HMAC-SHA256 Token...' : 'Generate Salted MediQR Card →'}
            </button>
          </form>

          {/* QR Display Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            {/* QR Format Selector */}
            <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 rounded-lg text-xs mb-4 w-full">
              <button
                type="button"
                onClick={() => setQrFormat('url')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-semibold transition ${
                  qrFormat === 'url'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📱 Smart Mobile URL (Google Lens Safe)
              </button>
              <button
                type="button"
                onClick={() => setQrFormat('json')}
                className={`flex-1 py-1 px-2 rounded-md text-[11px] font-semibold transition ${
                  qrFormat === 'json'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📟 Raw JSON (Scanner Gun)
              </button>
            </div>

            {generatedQRUrl ? (
              <div className="space-y-4 w-full">
                <div className="inline-block p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <img src={generatedQRUrl} alt="MediQR Card" className="w-48 h-48 mx-auto" />
                </div>

                {qrFormat === 'url' ? (
                  <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-2">
                    ✓ Google Lens & Camera Safe: Tap "Open in browser" to view emergency card without freezing.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                    📟 Hardware Barcode Scanner Mode: Raw JSON data stream.
                  </p>
                )}

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs font-mono break-all">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Salted Patient Query Hash</span>
                  <span className="text-blue-800 select-all font-semibold block mt-0.5">{generatedPatientHash}</span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={generatedQRUrl}
                    download={`mediqr-${fullName.toLowerCase().replace(/\s+/g, '-')}.png`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-xs transition text-center"
                  >
                    💾 Save PNG
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (generatedPatientHash) {
                        setUploadPatientHash(generatedPatientHash);
                        setActiveTab('upload-record');
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-xs transition text-center shadow-sm"
                  >
                    Upload Records for Patient →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xl text-slate-400">
                  📱
                </div>
                <p>Fill in patient vitals on the left to generate the optical MediQR.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD RECORD */}
      {activeTab === 'upload-record' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleUploadRecord} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Target Hospital Node &amp; Encrypted Payload
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Target Hospital Storage Node</label>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="http://localhost:5001">Hospital Node A (Apollo Speciality - Port 5001)</option>
                  <option value="http://localhost:5002">Hospital Node B (Fortis Healthcare - Port 5002)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Patient Hash Token (patientHash)</label>
                <input
                  type="text"
                  value={uploadPatientHash}
                  onChange={(e) => setUploadPatientHash(e.target.value.trim())}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Record Type</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="CONSULTATION">CONSULTATION</option>
                    <option value="PRESCRIPTION">PRESCRIPTION</option>
                    <option value="LAB_RESULT">LAB_RESULT</option>
                    <option value="DISCHARGE_SUMMARY">DISCHARGE_SUMMARY</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-slate-700 mb-1">Attending Clinician</label>
                  <input
                    type="text"
                    disabled
                    value={doctorDetails?.name || 'Verified Federation Doctor'}
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Prescribed Medications (comma-separated)</label>
                <input
                  type="text"
                  value={prescriptionList}
                  onChange={(e) => setPrescriptionList(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-xs py-3 rounded-lg shadow-sm transition"
            >
              {uploading ? 'Encrypting & Committing On-Chain...' : '🔒 Encrypt & Commit Record to Ledger →'}
            </button>
          </form>

          {/* Output Confirmation Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
            {uploadResult ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b border-slate-100 pb-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">✓</span>
                  Record Encrypted &amp; Fingerprint Anchored On-Chain
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-semibold uppercase">Record ID</span>
                    <span className="font-bold text-slate-900">{uploadResult.recordId}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-semibold uppercase">SHA-256 Checksum (On-Chain)</span>
                    <span className="text-blue-800 font-semibold break-all">{uploadResult.fileHash}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-semibold uppercase">Storage Pointer URI</span>
                    <span className="text-emerald-800 break-all">{uploadResult.storageURI}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-semibold uppercase">Transaction Hash</span>
                    <span className="text-slate-600 break-all">{uploadResult.txHash}</span>
                  </div>
                </div>

                <Link
                  href={`/doctor?patientHash=${encodeURIComponent(uploadPatientHash)}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-center block text-xs shadow-sm transition"
                >
                  Open in Doctor Verification Portal →
                </Link>
              </div>
            ) : (
              <div className="text-slate-400 text-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xl text-slate-400">
                  📄
                </div>
                <p>Fill in clinical data on the left to encrypt and commit to ledger.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
