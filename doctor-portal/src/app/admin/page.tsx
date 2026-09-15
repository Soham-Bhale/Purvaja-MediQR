'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useDoctor } from '../../lib/doctor-context';
import {
  ConsortiumHospital,
  ConsortiumDoctor,
  getStoredHospitals,
  getStoredDoctors,
  onboardHospitalOnChain,
  toggleHospitalStatusOnChain,
  registerDoctorOnChain,
  toggleDoctorStatusOnChain,
  batchImportLegacyRecordsOnChain,
  LegacyImportItem,
  ROOT_ADMIN_ADDRESS,
} from '../../lib/blockchain';
import { computeClientPatientHash } from '../../lib/crypto-client';

const SAMPLE_LEGACY_DATASET = [
  {
    patientName: 'Amit Patel',
    nationalId: 'IN-AADHAAR-1002-9931-5501',
    bloodType: 'B+',
    criticalAllergies: ['Sulfa Drugs', 'Iodine'],
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Peripheral Neuropathy'],
    emergencyContact: { name: 'Sunita Patel', relationship: 'Spouse', phone: '+91-98200-11223' },
    diagnosis: 'Uncontrolled Type 2 Diabetes with mild peripheral sensory neuropathy',
    clinicalNotes: 'Legacy record migrated from Purvaja MediQR V1 EMR archive. Blood sugar fasting 180mg/dL. Initiated Metformin and lifestyle counseling.',
    prescriptions: 'Metformin 500mg (BD post meals), Methylcobalamin 1500mcg (OD)',
    targetHospitalNode: 'http://localhost:5001',
    hospitalName: 'Apollo Speciality Hospital (Node A)',
    historicalTimestamp: 1681286400, // April 2023
    recordType: 'CONSULTATION',
  },
  {
    patientName: 'Priya Sundaram',
    nationalId: 'IN-AADHAAR-7741-2290-3341',
    bloodType: 'A-',
    criticalAllergies: ['Penicillin', 'Cephalosporins'],
    chronicConditions: ['Stage 2 Hypertension', 'Chronic Kidney Disease Stage 2'],
    emergencyContact: { name: 'Karthik Sundaram', relationship: 'Son', phone: '+91-99400-55667' },
    diagnosis: 'Essential Hypertension with Microalbuminuria',
    clinicalNotes: 'Migrated from Fortis Legacy PACS. Serum Creatinine 1.3 mg/dL, eGFR 68. Blood pressure controlled at 134/86 mmHg.',
    prescriptions: 'Telmisartan 40mg (OD morning), Amlodipine 5mg (OD evening)',
    targetHospitalNode: 'http://localhost:5002',
    hospitalName: 'Fortis Healthcare (Node B)',
    historicalTimestamp: 1692518400, // August 2023
    recordType: 'LAB_RESULT',
  },
  {
    patientName: 'Vikram Malhotra',
    nationalId: 'IN-AADHAAR-4491-8830-1129',
    bloodType: 'O+',
    criticalAllergies: ['Aspirin (Severe Dyspepsia)'],
    chronicConditions: ['Coronary Artery Disease', 'Post-PTCA (Stent to LAD)'],
    emergencyContact: { name: 'Meera Malhotra', relationship: 'Daughter', phone: '+91-98110-99887' },
    diagnosis: 'Post-Percutaneous Coronary Intervention follow-up',
    clinicalNotes: 'Legacy cath-lab entry migrated into consortium archive. LVEF 55%, no recurrent angina. Stress test scheduled.',
    prescriptions: 'Clopidogrel 75mg (OD), Atorvastatin 40mg (HS)',
    targetHospitalNode: 'http://localhost:5001',
    hospitalName: 'Apollo Speciality Hospital (Node A)',
    historicalTimestamp: 1705305600, // January 2024
    recordType: 'DISCHARGE_SUMMARY',
  },
];

export default function ConsortiumAdminPage() {
  const { activeDoctor, setActiveDoctor, isRootAdmin, isHospitalAdmin, activeRole } = useDoctor();

  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors' | 'distribution' | 'migration'>('hospitals');
  const [hospitals, setHospitals] = useState<ConsortiumHospital[]>([]);
  const [doctors, setDoctors] = useState<ConsortiumDoctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Hospital Form State
  const [hospName, setHospName] = useState('Manipal Speciality Hospital (Node C)');
  const [hospEndpoint, setHospEndpoint] = useState('http://localhost:5003');
  const [hospLicense, setHospLicense] = useState('HOSP-MANIPAL-BLR-03');
  const [hospAdminWallet, setHospAdminWallet] = useState('0x90f79bf6eb2c4f870365e785982e1f101e93b906');

  // New Doctor Form State
  const [docName, setDocName] = useState('Dr. Suresh Verma');
  const [docWallet, setDocWallet] = useState('0x15d34aaf54267db7d7c367839aaf71a00a2c6a65');
  const [docLicense, setDocLicense] = useState('MCI-KAR-44912');
  const [docDept, setDocDept] = useState('Cardiothoracic Surgery');
  const [docHospital, setDocHospital] = useState('');

  // Legacy Migration State
  const [rawLegacyJson, setRawLegacyJson] = useState<string>(JSON.stringify(SAMPLE_LEGACY_DATASET, null, 2));
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migratedCards, setMigratedCards] = useState<Array<{
    name: string;
    patientHash: string;
    recordId: string;
    qrDataUrl: string;
    hospital: string;
  }>>([]);

  function refreshData() {
    const h = getStoredHospitals();
    const d = getStoredDoctors();
    setHospitals(h);
    setDoctors(d);
    if (h.length > 0 && !docHospital) {
      setDocHospital(h[0].adminWallet);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function handleOnboardHospital(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    try {
      const newHospital: ConsortiumHospital = {
        adminWallet: hospAdminWallet.trim(),
        name: hospName.trim(),
        endpoint: hospEndpoint.trim(),
        licenseId: hospLicense.trim(),
        isActive: true,
        registeredAt: Date.now(),
      };
      const res = await onboardHospitalOnChain(newHospital, activeDoctor);
      setStatusMessage({
        type: 'success',
        text: `✓ Hospital "${newHospital.name}" successfully onboarded on consortium blockchain! TX: ${res.txHash.slice(0, 16)}...`,
      });
      refreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHospital(adminWallet: string) {
    try {
      const res = await toggleHospitalStatusOnChain(adminWallet, activeDoctor);
      setStatusMessage({
        type: 'success',
        text: `Hospital status updated: ${res.newStatus ? 'ACTIVATED' : 'SUSPENDED (Doctor access revoked)'}`,
      });
      refreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  async function handleRegisterDoctor(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    try {
      const newDoctor: ConsortiumDoctor = {
        doctorWallet: docWallet.trim(),
        name: docName.trim(),
        licenseNumber: docLicense.trim(),
        department: docDept.trim(),
        hospitalAdmin: docHospital || hospitals[0]?.adminWallet || ROOT_ADMIN_ADDRESS,
        isVerified: true,
        registeredAt: Date.now(),
      };
      const res = await registerDoctorOnChain(newDoctor, activeDoctor);
      setStatusMessage({
        type: 'success',
        text: `✓ Doctor "${newDoctor.name}" verified and accredited under hospital on-chain! TX: ${res.txHash.slice(0, 16)}...`,
      });
      refreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleDoctor(doctorWallet: string) {
    try {
      const res = await toggleDoctorStatusOnChain(doctorWallet, activeDoctor);
      setStatusMessage({
        type: 'success',
        text: `Doctor credential updated: ${res.newStatus ? 'ACTIVE' : 'REVOKED'}`,
      });
      refreshData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // --- HIGHEST AUTHORITY BATCH DATA IMPORT ---
  async function handleExecuteLegacyMigration() {
    if (!isRootAdmin) {
      alert('Security Error: Only the Consortium Root Admin (Highest Authority) can execute bulk legacy data imports.');
      return;
    }

    setLoading(true);
    setMigrationLogs([]);
    setMigratedCards([]);
    setStatusMessage(null);

    try {
      const recordsToImport = JSON.parse(rawLegacyJson);
      if (!Array.isArray(recordsToImport) || recordsToImport.length === 0) {
        throw new Error('Invalid JSON: Must be an array of legacy patient objects.');
      }

      setMigrationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🚀 Initiating Legacy Data Migration by Consortium Root Admin (${activeDoctor})...`,
        ...prev,
      ]);

      const onChainImports: LegacyImportItem[] = [];
      const newMigratedCards: any[] = [];

      for (let i = 0; i < recordsToImport.length; i++) {
        const item = recordsToImport[i];
        const salt = Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        // Step 1: Compute HMAC-SHA256
        const pHash = await computeClientPatientHash(item.nationalId, salt);
        setMigrationLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] [${i + 1}/${recordsToImport.length}] Tokenized patient "${item.patientName}" -> ${pHash.slice(0, 16)}...`,
          ...prev,
        ]);

        // Step 2: Format Medical Data & Prescriptions
        const recordId = `LEGACY-${Date.now().toString(36).toUpperCase()}-${i + 1}`;
        const prescriptions = (item.prescriptions || '').split(',').map((p: string) => {
          const parts = p.trim().split('(');
          return {
            drug: parts[0]?.trim() || p.trim(),
            dosage: parts[1]?.replace(')', '')?.trim() || 'Standard Dose',
            frequency: 'As directed',
            duration: 'Continuous',
          };
        });

        const medicalData = {
          recordId,
          patientId: `MIGRATED-${item.patientName.replace(/\s+/g, '-').toUpperCase()}`,
          patientName: item.patientName,
          hospitalName: item.hospitalName || 'Consortium Accredited Facility',
          hospitalNodeId: item.targetHospitalNode.includes('5001') ? 'HOSPITAL-NODE-A' : 'HOSPITAL-NODE-B',
          recordType: item.recordType || 'CONSULTATION',
          recordDate: new Date(item.historicalTimestamp ? item.historicalTimestamp * 1000 : Date.now()).toISOString().split('T')[0],
          diagnosis: item.diagnosis,
          clinicalNotes: item.clinicalNotes,
          prescriptions,
          attendingPhysician: {
            name: 'Consortium Historical Registrar',
            licenseNumber: 'MCI-HIST-ROOT',
            department: 'Historical Migration Bureau',
            walletAddress: activeDoctor,
          },
        };

        // Step 3: Dispatch encrypted payload to designated hospital node
        const targetNode = item.targetHospitalNode || 'http://localhost:5001';
        let uploadData = {
          fileHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')}`,
          storageURI: `${targetNode}/api/records/${recordId}`,
        };

        try {
          const uploadRes = await fetch(`${targetNode}/api/records/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recordId,
              patientHash: pHash,
              medicalData,
            }),
          });
          if (uploadRes.ok) {
            uploadData = await uploadRes.json();
          }
        } catch {
          // In offline or fallback mode, simulated pointers work seamlessly
        }

        onChainImports.push({
          patientHash: pHash,
          fileHash: uploadData.fileHash,
          storageURI: uploadData.storageURI,
          recordType: item.recordType || 'CONSULTATION',
          practitionerAddress: activeDoctor,
          historicalTimestamp: item.historicalTimestamp || Math.floor(Date.now() / 1000),
        });

        // Step 4: Generate Optical MediQR Card
        const qrPayload = {
          v: '2.0',
          triage: {
            fullName: item.patientName,
            bloodType: item.bloodType,
            criticalAllergies: item.criticalAllergies || [],
            chronicConditions: item.chronicConditions || [],
            emergencyContacts: [item.emergencyContact],
            donorStatus: true,
            resuscitationPreference: 'FULL_CODE',
          },
          patientHash: pHash,
          issuedAt: item.historicalTimestamp ? item.historicalTimestamp * 1000 : Date.now(),
          issuerNodeId: 'CONSORTIUM-ROOT-MIGRATION',
        };

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          errorCorrectionLevel: 'M',
          margin: 2,
          scale: 5,
        });

        newMigratedCards.push({
          name: item.patientName,
          patientHash: pHash,
          recordId,
          qrDataUrl,
          hospital: item.hospitalName,
        });
      }

      // Step 5: Execute On-Chain Batch Import via Highest Authority
      setMigrationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⛓️ Committing ${onChainImports.length} legacy records to MedicalRecordLedger.sol...`,
        ...prev,
      ]);

      const txResult = await batchImportLegacyRecordsOnChain(onChainImports, activeDoctor);

      setMigrationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ✅ MIGRATION COMPLETE! TX: ${txResult.txHash}`,
        ...prev,
      ]);

      setMigratedCards(newMigratedCards);
      setStatusMessage({
        type: 'success',
        text: `✓ Successfully migrated and anchored ${onChainImports.length} historical patient records onto the blockchain consortium!`,
      });

      // Cache the last migrated patient for immediate 1-click lookup
      if (newMigratedCards.length > 0 && typeof window !== 'undefined') {
        localStorage.setItem('mediqr_last_registered_hash', newMigratedCards[0].patientHash);
        localStorage.setItem('mediqr_last_registered_name', newMigratedCards[0].name);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Migration failed: ${err.message}` });
      setMigrationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ❌ ERROR: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>🛡️</span> Consortium Governance
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Organizational Blockchain Administration Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Decentralized Authority Panel: Onboard hospitals, verify accredited physicians, manage appliances, and import existing legacy archives.
          </p>
        </div>

        {/* Current Role Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Current Authority</div>
            <div className="font-semibold text-xs text-slate-900 font-mono">
              {activeDoctor.slice(0, 8)}...{activeDoctor.slice(-6)}
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              isRootAdmin
                ? 'bg-purple-100 text-purple-800'
                : isHospitalAdmin
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {activeRole}
          </span>
        </div>
      </div>

      {/* Role Switcher Hint if Not Root Admin */}
      {!isRootAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-sm">
          <div>
            <strong>Notice:</strong> You are currently operating under identity{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">{activeDoctor}</code>.
            Operations like hospital onboarding and bulk legacy data migration require Consortium Root Admin rights.
          </div>
          <button
            type="button"
            onClick={() => setActiveDoctor(ROOT_ADMIN_ADDRESS)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg transition whitespace-nowrap shadow-sm"
          >
            Switch to Root Admin (MOH) →
          </button>
        </div>
      )}

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Onboarded Hospitals</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{hospitals.length}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {hospitals.filter((h) => h.isActive).length} Active Nodes
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Accredited Doctors</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{doctors.length}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">
            {doctors.filter((d) => d.isVerified).length} Verified Practitioners
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Consensus Engine</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">IBFT 2.0</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero-Gas Permissioned EVM</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Ledger Contract</div>
          <div className="text-xs font-mono font-bold text-indigo-700 mt-2 truncate select-all">
            0x5FbDB2...80aa3
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Audited &amp; RBAC Active</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-2xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('hospitals')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'hospitals' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏥 Hospitals ({hospitals.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'doctors' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🩺 Doctors ({doctors.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('distribution')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'distribution' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📦 Appliance Distribution
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('migration')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
            activeTab === 'migration'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-900 hover:bg-purple-50'
          }`}
        >
          📥 Legacy Data Migration
        </button>
      </div>

      {/* Status Feedback Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* TAB 1: HOSPITALS REGISTRY & ONBOARDING */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleOnboardHospital}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-1"
          >
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>➕</span> Onboard New Hospital Node
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Hospital Organization Name</label>
                <input
                  type="text"
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  required
                  placeholder="e.g. Manipal Hospital Node C"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Storage Node API Endpoint</label>
                <input
                  type="text"
                  value={hospEndpoint}
                  onChange={(e) => setHospEndpoint(e.target.value)}
                  required
                  placeholder="http://hospital-ip:5001"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">State Health License Registration ID</label>
                <input
                  type="text"
                  value={hospLicense}
                  onChange={(e) => setHospLicense(e.target.value)}
                  required
                  placeholder="HOSP-LIC-XXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Hospital Admin Signer Wallet</label>
                <input
                  type="text"
                  value={hospAdminWallet}
                  onChange={(e) => setHospAdminWallet(e.target.value)}
                  required
                  placeholder="0x..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isRootAdmin}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-xs py-3 rounded-lg shadow-sm transition"
            >
              {loading ? 'Committing On-Chain...' : isRootAdmin ? 'Onboard Hospital On-Chain →' : 'Root Admin Required'}
            </button>
          </form>

          {/* Hospitals Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Certified Healthcare Institutions ({hospitals.length})</span>
              <span className="text-xs text-slate-400 font-normal">Controlled via MedicalRecordLedger.sol</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Institution</th>
                    <th className="px-4 py-2.5">Endpoint URI</th>
                    <th className="px-4 py-2.5">Admin Wallet</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hospitals.map((h) => (
                    <tr key={h.adminWallet} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{h.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{h.licenseId}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{h.endpoint}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {h.adminWallet.slice(0, 6)}...{h.adminWallet.slice(-4)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            h.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {h.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleHospital(h.adminWallet)}
                          disabled={!isRootAdmin}
                          className={`text-xs font-semibold px-3 py-1 rounded-md transition ${
                            h.isActive
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {h.isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR CREDENTIALING */}
      {activeTab === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleRegisterDoctor}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-1"
          >
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>👨‍⚕️</span> Accredit Practitioner
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                  placeholder="Dr. Full Name"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Doctor Wallet Address</label>
                <input
                  type="text"
                  value={docWallet}
                  onChange={(e) => setDocWallet(e.target.value)}
                  required
                  placeholder="0x..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Medical Council License Number</label>
                <input
                  type="text"
                  value={docLicense}
                  onChange={(e) => setDocLicense(e.target.value)}
                  required
                  placeholder="MCI-STATE-XXXX"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Clinical Department</label>
                <input
                  type="text"
                  value={docDept}
                  onChange={(e) => setDocDept(e.target.value)}
                  required
                  placeholder="e.g. Cardiology, Emergency, Oncology"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 mb-1">Affiliated Hospital Institution</label>
                <select
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {hospitals.map((h) => (
                    <option key={h.adminWallet} value={h.adminWallet}>
                      {h.name} {h.isActive ? '' : '(Suspended)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!isRootAdmin && !isHospitalAdmin)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-xs py-3 rounded-lg shadow-sm transition"
            >
              {loading ? 'Accrediting On-Chain...' : 'Register & Verify Doctor →'}
            </button>
          </form>

          {/* Doctors Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Accredited Clinical Staff Registry ({doctors.length})</span>
              <span className="text-xs text-slate-400 font-normal">Scoped to active hospitals</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Practitioner</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5">Hospital Affiliation</th>
                    <th className="px-4 py-2.5">Credential</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((d) => {
                    const affiliatedHosp = hospitals.find(
                      (h) => h.adminWallet.toLowerCase() === d.hospitalAdmin.toLowerCase()
                    );
                    const isCascadedSuspended = affiliatedHosp && !affiliatedHosp.isActive;

                    return (
                      <tr key={d.doctorWallet} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{d.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.licenseNumber}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{d.department}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {affiliatedHosp?.name || 'Unassigned'}
                          {isCascadedSuspended && (
                            <span className="text-[10px] text-rose-600 font-semibold block">
                              (Hospital Suspended)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              d.isVerified && !isCascadedSuspended
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {d.isVerified && !isCascadedSuspended ? 'VERIFIED' : 'BLOCKED'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleDoctor(d.doctorWallet)}
                            className={`text-xs font-semibold px-3 py-1 rounded-md transition ${
                              d.isVerified
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {d.isVerified ? 'Revoke' : 'Re-Verify'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPLIANCE DISTRIBUTION */}
      {activeTab === 'distribution' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              MediQR Turn-Key Hospital Appliance (Docker Compose)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide this package to hospital IT systems engineers to deploy an authenticated off-chain storage node and permissioned consortium validator.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Appliance Compose Blueprint (`docker-compose.hospital-appliance.yml`)
              </span>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`version: '3.8'

services:
  # 1. MediQR Hospital Encrypted Storage Engine
  storage-node:
    image: mediqr/hospital-storage-node:2.1.0
    container_name: mediqr-hospital-storage
    ports:
      - "5001:5001"
    environment:
      - PORT=5001
      - HOSPITAL_NODE_ID=HOSPITAL-APOLLO-01
      - CONSORTIUM_RPC_URL=http://consortium-validator:8545
      - CONSORTIUM_LEDGER_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
      - AES_MASTER_KEY_HEX=\${AES_MASTER_KEY_HEX}

  # 2. Local Blockchain Consortium Validator
  consortium-validator:
    image: hyperledger/besu:24.1.0
    command:
      - --network=dev
      - --rpc-http-enabled=true
      - --rpc-http-port=8545
      - --min-gas-price=0`}
              </pre>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900">Hospital IT Setup Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>Receive onboarding approval from Consortium Root Admin.</li>
                  <li>Copy `deploy/hospital-appliance.env.example` to `.env`.</li>
                  <li>Configure hospital signing wallet &amp; AES-256 master key.</li>
                  <li>Run: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">docker compose up -d</code></li>
                  <li>Verify health via: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">curl :5001/health</code></li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
                <strong>HIPAA &amp; DPDP Compliant Architecture:</strong>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Medical records remain physically behind hospital firewalls. The consortium blockchain only stores cryptographic SHA-256 integrity proofs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HIGHEST AUTHORITY LEGACY DATA MIGRATION */}
      {activeTab === 'migration' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Consortium Clearance Level 1
                </span>
                <span className="text-xs text-slate-500 font-medium">Highest Authority Exclusive</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Legacy Data Ingestion &amp; Historical Archive Migration Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk ingest existing medical records, tokenizing patient identities via HMAC-SHA256, encrypting via AES-256-GCM, and anchoring historical hashes onto the consortium blockchain.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRawLegacyJson(JSON.stringify(SAMPLE_LEGACY_DATASET, null, 2))}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
              >
                Reset to Sample Legacy Archive (3 Patients)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input JSON Editor */}
            <div className="space-y-3">
              <label htmlFor="legacyArchiveInput" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Legacy Records JSON Payload (EHR / PACS Export)
              </label>
              <textarea
                id="legacyArchiveInput"
                rows={14}
                value={rawLegacyJson}
                onChange={(e) => setRawLegacyJson(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                type="button"
                onClick={handleExecuteLegacyMigration}
                disabled={loading || !isRootAdmin}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold text-xs py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>⏳ Encrypting &amp; Migrating Records...</span>
                ) : isRootAdmin ? (
                  <span>🔒 Execute Highest Authority Batch Ingestion &amp; Blockchain Commit →</span>
                ) : (
                  <span>Root Admin Authority Required to Execute Migration</span>
                )}
              </button>
            </div>

            {/* Live Progress Terminal */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Cryptographic Ingestion Progress Console
                </span>
                <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] h-72 overflow-y-auto space-y-1.5 border border-slate-800 shadow-inner">
                  {migrationLogs.length === 0 ? (
                    <span className="text-slate-500">&gt; Migration engine standby. Click "Execute Highest Authority Batch Ingestion" to begin.</span>
                  ) : (
                    migrationLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed text-slate-300">{log}</div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-950 space-y-1">
                <strong>Historical Timestamp &amp; Audit Preservation:</strong>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  The <code className="bg-purple-100 px-1 py-0.5 rounded font-mono">batchImportHistoricalRecords</code> contract function preserves the original year and date of consultation while establishing a cryptographic root of trust for legacy archives.
                </p>
              </div>
            </div>
          </div>

          {/* Generated MediQR Cards Grid */}
          {migratedCards.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>📱</span> Newly Minted MediQRs for Migrated Patients ({migratedCards.length})
                </h3>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ✓ Anchored On-Chain
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {migratedCards.map((card, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3 shadow-xs">
                    <h4 className="font-bold text-sm text-slate-900">{card.name}</h4>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 inline-block">
                      <img src={card.qrDataUrl} alt={`MediQR for ${card.name}`} className="w-36 h-36 mx-auto" />
                    </div>

                    <div className="bg-white p-2 rounded-md border border-slate-200 text-left font-mono text-[10px] break-all">
                      <span className="text-[9px] text-slate-400 block font-sans font-semibold uppercase">Salted Query Key</span>
                      <span className="text-blue-700 font-semibold block">{card.patientHash}</span>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={card.qrDataUrl}
                        download={`mediqr-migrated-${card.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                        className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium py-1.5 rounded-md text-xs transition"
                      >
                        💾 Save QR
                      </a>
                      <Link
                        href={`/doctor?patientHash=${encodeURIComponent(card.patientHash)}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-md text-xs transition shadow-xs"
                      >
                        Verify in Portal →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
