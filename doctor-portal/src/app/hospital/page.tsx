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

      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
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
    <div className="space-y-3 font-sans text-black">
      {/* Title */}
      <div className="bg-[#0a246a] text-white p-2 border border-black flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-yellow-300 font-mono font-bold block">
            [ HOSPITAL NODE STORAGE &amp; PATIENT REGISTRATION ENGINE ]
          </span>
          <h1 className="text-sm font-bold tracking-wide">
            Hospital Records Administration &amp; MediQR Issuer
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('issue-qr')}
            className={`btn-swing text-xs ${activeTab === 'issue-qr' ? 'bg-[#dcd8c4] font-bold text-[#000080]' : ''}`}
          >
            [1] Issue Salted MediQR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload-record')}
            className={`btn-swing text-xs ${activeTab === 'upload-record' ? 'bg-[#dcd8c4] font-bold text-[#000080]' : ''}`}
          >
            [2] Upload Encrypted Record
          </button>
        </div>
      </div>

      {/* TAB 1: ISSUE MEDIQR */}
      {activeTab === 'issue-qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <form onSubmit={handleGenerateQR} className="bg-[#ece9d8] border-2 border-t-white border-l-white border-b-black border-r-black p-3 space-y-2">
            <fieldset className="swing-fieldset">
              <legend>Patient Demographics &amp; Vitals</legend>
              <div className="space-y-1.5 pt-1">
                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Full Name:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="sunken-box w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold block text-gray-700">National ID / Citizen Key:</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      required
                      className="sunken-box w-full font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block text-gray-700">Blood Group:</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="sunken-box w-full"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Critical Allergies (comma-separated):</label>
                  <input
                    type="text"
                    value={criticalAllergies}
                    onChange={(e) => setCriticalAllergies(e.target.value)}
                    className="sunken-box w-full font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Chronic Medical Conditions:</label>
                  <input
                    type="text"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    className="sunken-box w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold block text-gray-700">Emergency Contact Name:</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      className="sunken-box w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block text-gray-700">Emergency Telephone:</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className="sunken-box w-full font-mono"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={issuing}
              className="btn-swing-primary w-full py-1.5 text-xs"
            >
              {issuing ? '⏳ Computing HMAC-SHA256 Salted Key...' : '⚙ Generate Salted MediQR &amp; Print Card'}
            </button>
          </form>

          {/* QR Display Panel */}
          <fieldset className="swing-fieldset flex flex-col items-center justify-center p-4">
            <legend>[ Generated MediQR Card Output ]</legend>
            {generatedQRUrl ? (
              <div className="text-center space-y-3 w-full">
                <div className="inline-block p-2 bg-white border-2 border-black">
                  <img src={generatedQRUrl} alt="MediQR Card" className="w-44 h-44 mx-auto" />
                </div>

                <div className="sunken-box p-2 text-left font-mono text-[10px] break-all">
                  <span className="text-gray-500 font-bold block">SALTED PATIENT HASH (ON-CHAIN TOKEN):</span>
                  <span className="text-blue-900 select-all font-bold">{generatedPatientHash}</span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={generatedQRUrl}
                    download={`mediqr-${fullName.toLowerCase().replace(/\s+/g, '-')}.png`}
                    className="btn-swing flex-1 text-center py-1"
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
                    className="btn-swing-primary flex-1 text-center py-1"
                  >
                    Upload Records for Patient &gt;&gt;
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">
                [ SUBMIT FORM ON LEFT TO COMPOSE MEDIQR ]
              </div>
            )}
          </fieldset>
        </div>
      )}

      {/* TAB 2: UPLOAD RECORD */}
      {activeTab === 'upload-record' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <form onSubmit={handleUploadRecord} className="bg-[#ece9d8] border-2 border-t-white border-l-white border-b-black border-r-black p-3 space-y-2">
            <fieldset className="swing-fieldset">
              <legend>Target Hospital Node &amp; Record Data</legend>
              <div className="space-y-1.5 pt-1">
                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Target Hospital Storage Node:</label>
                  <select
                    value={targetNode}
                    onChange={(e) => setTargetNode(e.target.value as any)}
                    className="sunken-box w-full font-mono text-xs"
                  >
                    <option value="http://localhost:5001">Hospital Node A (Apollo Speciality - Port 5001)</option>
                    <option value="http://localhost:5002">Hospital Node B (Fortis Healthcare - Port 5002)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Patient Hash Token (patientHash):</label>
                  <input
                    type="text"
                    value={uploadPatientHash}
                    onChange={(e) => setUploadPatientHash(e.target.value.trim())}
                    required
                    className="sunken-box w-full font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold block text-gray-700">Record Type:</label>
                    <select
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="sunken-box w-full"
                    >
                      <option value="CONSULTATION">CONSULTATION</option>
                      <option value="PRESCRIPTION">PRESCRIPTION</option>
                      <option value="LAB_RESULT">LAB_RESULT</option>
                      <option value="DISCHARGE_SUMMARY">DISCHARGE_SUMMARY</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block text-gray-700">Attending Clinician:</label>
                    <input
                      type="text"
                      disabled
                      value={doctorDetails?.name || 'Verified Federation Doctor'}
                      className="sunken-box w-full bg-[#e8e6dc] text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Clinical Diagnosis:</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    className="sunken-box w-full"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Clinical Notes:</label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    required
                    className="sunken-box w-full font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block text-gray-700">Medications (comma-separated):</label>
                  <input
                    type="text"
                    value={prescriptionList}
                    onChange={(e) => setPrescriptionList(e.target.value)}
                    className="sunken-box w-full font-mono text-xs"
                  />
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={uploading}
              className="btn-swing-primary w-full py-1.5 text-xs"
            >
              {uploading ? '⏳ Encrypting AES-256-GCM &amp; Anchoring On-Chain...' : '🔒 Encrypt &amp; Commit Record to Ledger'}
            </button>
          </form>

          {/* Output Confirmation Panel */}
          <fieldset className="swing-fieldset flex flex-col justify-center p-3">
            <legend>[ Ledger Commitment Receipt ]</legend>
            {uploadResult ? (
              <div className="space-y-2 bg-white p-3 border border-gray-400 font-mono text-[11px]">
                <div className="text-green-800 font-bold border-b border-gray-300 pb-1">
                  ✓ RECORD ENCRYPTED &amp; FINGERPRINT COMMITTED ON-CHAIN
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">RECORD IDENTIFIER:</span>
                  <span className="font-bold text-black">{uploadResult.recordId}</span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">SHA-256 ON-CHAIN FINGERPRINT:</span>
                  <span className="text-blue-900 font-bold break-all">{uploadResult.fileHash}</span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">OFF-CHAIN NODE STORAGE POINTER:</span>
                  <span className="text-green-900 break-all">{uploadResult.storageURI}</span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[10px]">TRANSACTION RECEIPT HASH:</span>
                  <span className="text-gray-700 break-all">{uploadResult.txHash}</span>
                </div>

                <div className="pt-2 border-t border-gray-300">
                  <Link
                    href={`/doctor?patientHash=${encodeURIComponent(uploadPatientHash)}`}
                    className="btn-swing-primary w-full text-center py-1 block text-xs"
                  >
                    🩺 Open in Doctor Verification Portal &gt;&gt;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">
                [ READY TO PROCESS CLINICAL DOCUMENT ]
              </div>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
}
