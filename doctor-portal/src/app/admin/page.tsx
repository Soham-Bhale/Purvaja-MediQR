'use client';

import React, { useState, useEffect } from 'react';
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
  ROOT_ADMIN_ADDRESS,
} from '../../lib/blockchain';

export default function ConsortiumAdminPage() {
  const { activeDoctor, setActiveDoctor, isRootAdmin, isHospitalAdmin, activeRole } = useDoctor();

  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors' | 'distribution'>('hospitals');
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
            Decentralized Authority Panel: Onboard hospitals, verify accredited physicians, and manage appliance distribution.
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
            Certain high-level operations like hospital onboarding require Consortium Root Admin rights.
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
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('hospitals')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'hospitals' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏥 Hospitals Registry ({hospitals.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'doctors' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🩺 Doctor Credentialing ({doctors.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('distribution')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'distribution' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📦 Appliance Distribution
        </button>
      </div>

      {/* Status Feedback Alert */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${
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
          {/* Onboarding Form */}
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
          {/* Register Doctor Form */}
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
    </div>
  );
}
