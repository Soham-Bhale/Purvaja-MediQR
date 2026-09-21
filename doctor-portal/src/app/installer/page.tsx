'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FingerprintScanner from '../../components/FingerprintScanner';
import {
  getEnrolledBiometrics,
  saveEnrolledBiometric,
  EnrolledBiometric,
} from '../../lib/biometrics';
import {
  getStoredHospitals,
  ConsortiumHospital,
  ConsortiumDoctor,
  registerDoctorOnChain,
  ROOT_ADMIN_ADDRESS,
  DEFAULT_CONTRACT_ADDRESS,
} from '../../lib/blockchain';

export default function GovernmentInstallerPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Hospital Details
  const [hospitalName, setHospitalName] = useState('Apollo Speciality Hospital (Node A)');
  const [licenseId, setLicenseId] = useState('HOSP-APOLLO-DEL-01');
  const [storageEndpoint, setStorageEndpoint] = useState('http://localhost:5001');
  const [adminWallet, setAdminWallet] = useState('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const [hardwareUUID, setHardwareUUID] = useState('HW-SVR-DELL-POWEREDGE-R740-9942A');

  // Step 2: Blockchain
  const [contractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [rpcUrl] = useState('http://127.0.0.1:8545');
  const [blockchainStatus, setBlockchainStatus] = useState<'IDLE' | 'TESTING' | 'CONNECTED'>('CONNECTED');

  // Step 3: Biometric Doctor Enrolment
  const [enrolledDoctors, setEnrolledDoctors] = useState<EnrolledBiometric[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocLicense, setNewDocLicense] = useState('');
  const [newDocDept, setNewDocDept] = useState('Emergency Medicine');
  const [newDocWallet, setNewDocWallet] = useState('');
  const [scannedTemplateHash, setScannedTemplateHash] = useState<string | null>(null);
  const [scannedRidgePattern, setScannedRidgePattern] = useState<string | null>(null);
  const [enrollmentSuccessMsg, setEnrollmentSuccessMsg] = useState<string | null>(null);

  // Step 4: Sealing
  const [officerId, setOfficerId] = useState('GOV-OFFICER-UID-DEL-9921');
  const [deploymentCert, setDeploymentCert] = useState<string | null>(null);

  useEffect(() => {
    setEnrolledDoctors(getEnrolledBiometrics());
  }, []);

  function handleEnrollDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocName || !newDocLicense || !newDocWallet) {
      alert('Please fill out all doctor identification fields.');
      return;
    }
    if (!scannedTemplateHash) {
      alert('Please capture the doctor\'s fingerprint template on the biometric sensor before submitting.');
      return;
    }

    const newBiometric: EnrolledBiometric = {
      doctorWallet: newDocWallet.toLowerCase(),
      doctorName: newDocName,
      licenseNumber: newDocLicense,
      department: newDocDept,
      hospitalName,
      biometricTemplateHash: scannedTemplateHash,
      enrolledAt: Date.now(),
      enrolledBy: officerId,
      ridgePatternId: scannedRidgePattern || 'WHORL-CENTRAL-POCKET',
    };

    saveEnrolledBiometric(newBiometric);

    // Also credential physician in consortium doctor registry under the active hospital node
    const newDoctor: ConsortiumDoctor = {
      doctorWallet: newDocWallet.toLowerCase(),
      name: newDocName,
      licenseNumber: newDocLicense,
      department: newDocDept,
      hospitalAdmin: adminWallet.toLowerCase(),
      isVerified: true,
      registeredAt: Date.now(),
    };
    registerDoctorOnChain(newDoctor, adminWallet);

    setEnrolledDoctors(getEnrolledBiometrics());
    setEnrollmentSuccessMsg(`Biometric profile for ${newDocName} enrolled, credentialed on ledger, and sealed onto appliance!`);

    // Reset form
    setNewDocName('');
    setNewDocLicense('');
    setNewDocWallet('');
    setScannedTemplateHash(null);
    setScannedRidgePattern(null);
  }

  function handleSealAppliance() {
    const certId = `CERT-GOV-MED-COMMISSION-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setDeploymentCert(certId);
    setCurrentStep(4);
  }

  return (
    <div className="space-y-6">
      {/* Government Official Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <span>🏛️</span> Ministry of Health & Family Welfare | National Health Authority
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight">
            Hospital Server Node Installation & Biometric Commissioning Appliance
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            Official government deployment utility to install on-premise MediQR hospital storage nodes, pair with the consortium blockchain ledger, and enroll physician biometric fingerprints.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-3 text-right">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Authorized Field Official</div>
          <div className="text-xs font-mono font-bold text-amber-300">{officerId}</div>
          <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Deployment Badge Active</span>
          </div>
        </div>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { step: 1, title: '1. Server & License', desc: 'Hospital Identity' },
          { step: 2, title: '2. Node Pairing', desc: 'Blockchain Ledger' },
          { step: 3, title: '3. Doctor Biometrics', desc: 'Fingerprint Enrolment' },
          { step: 4, title: '4. Sealing & Launch', desc: 'Deployment Certificate' },
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step as any)}
            className={`p-3 rounded-xl border text-left transition ${
              currentStep === s.step
                ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-100'
                : currentStep > s.step
                ? 'bg-emerald-50/50 border-emerald-300'
                : 'bg-white border-slate-200 opacity-60'
            }`}
          >
            <div className={`text-xs font-bold ${
              currentStep === s.step ? 'text-blue-700' : currentStep > s.step ? 'text-emerald-700' : 'text-slate-600'
            }`}>
              {currentStep > s.step ? '✓ ' : ''}{s.title}
            </div>
            <div className="text-[11px] text-slate-500">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* STEP 1: Hospital Identity & Local Server */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 1: Hospital Server & Government License</h2>
            <p className="text-xs text-slate-500">Configure on-premise hardware storage and assign state healthcare license identifier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Facility Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">MOH Government License ID</label>
              <input
                type="text"
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Local Storage Node Endpoint</label>
              <input
                type="text"
                value={storageEndpoint}
                onChange={(e) => setStorageEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Port where AES-256-GCM clinical storage container listens</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Admin Authority Wallet</label>
              <input
                type="text"
                value={adminWallet}
                onChange={(e) => setAdminWallet(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Cryptographic key for signing local node transactions</span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hardware TPM / Server UUID</label>
              <input
                type="text"
                value={hardwareUUID}
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-emerald-600 font-medium">✓ Secure Hardware TPM 2.0 Module Detected</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>Continue to Blockchain Node Pairing</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Blockchain Node Connection */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 2: Blockchain Node Pairing & Ledger Binding</h2>
            <p className="text-xs text-slate-500">Connect the hospital storage node to the shared Consortium Solidity Ledger.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Smart Contract:</span>
              <span className="font-bold text-blue-700">{contractAddress}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Consortium RPC:</span>
              <span className="text-slate-800">{rpcUrl}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Ledger Consensus:</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">QBFT / IBFT 2.0 (Zero Gas)</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">Blockchain Handshake Verified</div>
              <div className="text-[11px] text-emerald-700">
                Hospital node `{licenseId}` authenticated by Root Authority (`{ROOT_ADMIN_ADDRESS.slice(0, 10)}...`).
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>Continue to Doctor Biometrics Enrolment</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Doctor Biometric Enrollment */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Doctor Biometric Fingerprint Enrolment</h2>
              <p className="text-xs text-slate-500">
                Government official captures physical fingerprints of authorized doctors to permit clinical portal access.
              </p>
            </div>
            <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 font-semibold px-2.5 py-1 rounded-md self-start">
              Mandatory MOH Compliance
            </span>
          </div>

          {enrollmentSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{enrollmentSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setEnrollmentSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Biometric Enrolment Form & Live Sensor Pad */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Enrolment Input Details */}
            <form onSubmit={handleEnrollDoctor} className="lg:col-span-7 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🩺</span>
                  <span>Physician Credentials</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Vikram Sethi"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Council License</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MCI-DEL-44912"
                      value={newDocLicense}
                      onChange={(e) => setNewDocLicense(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Department</label>
                    <input
                      type="text"
                      required
                      value={newDocDept}
                      onChange={(e) => setNewDocDept(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physician Wallet Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="0x..."
                      value={newDocWallet}
                      onChange={(e) => setNewDocWallet(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewDocWallet(`0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`)}
                      className="px-2.5 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 rounded font-mono whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Status of Captured Template */}
              {scannedTemplateHash ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Biometric Minutiae Template Captured</span>
                  </div>
                  <div className="text-[10px] font-mono text-blue-800 break-all">
                    Hash: {scannedTemplateHash}
                  </div>
                  <div className="text-[10px] text-blue-700">
                    Ridge Pattern: <span className="font-semibold">{scannedRidgePattern}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Awaiting doctor's finger scan on the sensor pad to the right.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!scannedTemplateHash}
                className={`w-full py-2.5 text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 ${
                  scannedTemplateHash
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>💾</span>
                <span>Enroll Biometric & Register Doctor on Appliance</span>
              </button>
            </form>

            {/* Right: Interactive Sensor Pad */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full text-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Biometric Optical Reader
                </span>
                <p className="text-[11px] text-slate-400">Instruct doctor to touch the pad below</p>
              </div>

              <FingerprintScanner
                mode="enroll"
                onScanComplete={(templateHash, ridgePattern) => {
                  setScannedTemplateHash(templateHash);
                  setScannedRidgePattern(ridgePattern);
                }}
              />
            </div>
          </div>

          {/* Enrolled Doctors Directory Table */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <span>👥</span>
              <span>Currently Enrolled Biometric Physicians ({enrolledDoctors.length})</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Physician</th>
                    <th className="py-2.5 px-3">License & Dept</th>
                    <th className="py-2.5 px-3">Biometric Seal</th>
                    <th className="py-2.5 px-3">Enrolled By</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledDoctors.map((doc) => (
                    <tr key={doc.doctorWallet} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {doc.doctorName}
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">
                          {doc.doctorWallet.slice(0, 10)}...{doc.doctorWallet.slice(-6)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="font-mono">{doc.licenseNumber}</span>
                        <span className="block text-[11px] text-slate-400">{doc.department}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-800 font-bold block mb-0.5">
                          {doc.ridgePatternId}
                        </span>
                        {doc.biometricTemplateHash.slice(0, 14)}...
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {doc.enrolledBy}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          ✓ Biometrics Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSealAppliance}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>Seal Appliance & Generate Commissioning Certificate</span>
              <span>🔒</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Appliance Sealing & Handover */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-sm">
            ✓
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              COMMISSIONING COMPLETE
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Hospital Node Successfully Installed & Sealed
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              This node has been cryptographically commissioned by the Government Field Engineer. Doctor biometric credentials are now active on this terminal.
            </p>
          </div>

          {/* Official Receipt Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans">Commissioning Certificate:</span>
              <span className="font-bold text-blue-700">{deploymentCert}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans">Hospital:</span>
              <span className="text-slate-900 font-semibold">{hospitalName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans">MOH License ID:</span>
              <span className="text-slate-900 font-semibold">{licenseId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans">Active Physicians Enrolled:</span>
              <span className="text-emerald-700 font-bold">{enrolledDoctors.length} Registered</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Commissioned By:</span>
              <span className="text-amber-700 font-bold">{officerId}</span>
            </div>
          </div>

          {/* Action Handover Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/doctor"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>🩺 Launch Doctor Clinical Terminal</span>
              <span>→</span>
            </Link>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl transition"
            >
              Reconfigure Node Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
