'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-3 font-sans text-black">
      {/* System Banner */}
      <div className="bg-[#0a246a] text-white p-3 border-2 border-black flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] text-yellow-300 font-mono font-bold uppercase tracking-wider">
            [ HOSPITAL FEDERATION CONSORTIUM SYSTEM - ENTERPRISE EDITION ]
          </div>
          <h1 className="text-lg font-bold tracking-wide">
            MediQR Healthcare Archive & Ledger Console v2.0
          </h1>
          <p className="text-[11px] text-gray-200 mt-0.5 max-w-2xl leading-tight">
            Hybrid Distributed Healthcare Storage: Offline-ready triage optical QR codes, 
            AES-256-GCM off-chain encrypted medical records, and zero-PII Ethereum/EVM Solidity ledger integrity.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <Link href="/emergency" className="btn-swing text-center text-xs py-1">
            🚑 Emergency Triage
          </Link>
          <Link href="/doctor" className="btn-swing-primary text-center text-xs py-1">
            🩺 Doctor Verification Portal
          </Link>
        </div>
      </div>

      {/* Main Workstation Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Module 1 */}
        <fieldset className="swing-fieldset">
          <legend>[ 1. Dual-Segment MediQR Module ]</legend>
          <div className="p-2 bg-white border border-gray-400 space-y-2 text-[11px]">
            <p>
              Stores unencrypted life-saving emergency triage data (blood type, critical drug allergies, emergency contacts) accessible instantly to paramedics without authorization.
            </p>
            <div className="bg-[#f0ede0] p-1.5 border border-gray-400 font-mono text-[10px]">
              Query Key: <strong>HMAC-SHA256(National_ID + Salt, Master_Pepper)</strong>
            </div>
            <div className="pt-1">
              <Link href="/emergency" className="btn-swing text-[11px]">
                Open Triage Scanner &gt;&gt;
              </Link>
            </div>
          </div>
        </fieldset>

        {/* Module 2 */}
        <fieldset className="swing-fieldset">
          <legend>[ 2. Multi-Hospital Storage Nodes ]</legend>
          <div className="p-2 bg-white border border-gray-400 space-y-2 text-[11px]">
            <p>
              Full clinical documents (consultations, lab results, prescriptions) are encrypted at rest with <strong>AES-256-GCM</strong> across simulated hospital endpoints (Apollo :5001 & Fortis :5002).
            </p>
            <div className="bg-[#f0ede0] p-1.5 border border-gray-400 font-mono text-[10px]">
              Cipher: <strong>AES-256-GCM • 12-byte IV • 16-byte Auth Tag • AAD Binding</strong>
            </div>
            <div className="pt-1">
              <Link href="/hospital" className="btn-swing text-[11px]">
                Hospital Administration Hub &gt;&gt;
              </Link>
            </div>
          </div>
        </fieldset>

        {/* Module 3 */}
        <fieldset className="swing-fieldset">
          <legend>[ 3. Immutable Blockchain Ledger ]</legend>
          <div className="p-2 bg-white border border-gray-400 space-y-2 text-[11px]">
            <p>
              <strong>MedicalRecordLedger.sol</strong> maintains verified practitioner whitelists and anchors 32-byte SHA-256 file fingerprints. No plain medical data or PII is ever committed on-chain.
            </p>
            <div className="bg-[#f0ede0] p-1.5 border border-gray-400 font-mono text-[10px]">
              Smart Contract: <strong>mapping(bytes32 patientHash =&gt; RecordMetadata[])</strong>
            </div>
            <div className="pt-1">
              <Link href="/doctor" className="btn-swing text-[11px]">
                Doctor Verification Console &gt;&gt;
              </Link>
            </div>
          </div>
        </fieldset>

        {/* Module 4 */}
        <fieldset className="swing-fieldset">
          <legend>[ 4. Cryptographic Tamper Defense ]</legend>
          <div className="p-2 bg-white border border-gray-400 space-y-2 text-[11px]">
            <p>
              Clinician portal downloads off-chain documents, computes live SHA-256 checksums, and halts memory decryption immediately if a single byte or bit has been altered.
            </p>
            <div className="bg-[#f0ede0] p-1.5 border border-gray-400 font-mono text-[10px]">
              Detection: <strong>computedHash === contractHash ? Decrypt : Abort(403)</strong>
            </div>
            <div className="pt-1">
              <Link href="/simulator" className="btn-swing text-[11px] text-red-800">
                ⚡ Tamper Attack Demonstration &gt;&gt;
              </Link>
            </div>
          </div>
        </fieldset>

      </div>

      {/* Compliance Table */}
      <fieldset className="swing-fieldset">
        <legend>[ Regulatory Compliance & Audit Configuration ]</legend>
        <table className="swing-table">
          <thead>
            <tr>
              <th>Standard</th>
              <th>Requirement</th>
              <th>MediQR Implementation Mechanism</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold">HIPAA Security Rule</td>
              <td>§164.312(a)(2)(iv) Encryption at Rest & Transit</td>
              <td>AES-256-GCM authenticated cipher with 128-bit MAC tag + TLS 1.3 endpoints</td>
              <td className="font-bold text-green-800">[COMPLIANT]</td>
            </tr>
            <tr>
              <td className="font-bold">DPDP Act (India)</td>
              <td>Sec. 8 Data Fiduciary Protection & Zero-PII</td>
              <td>Salted HMAC-SHA256 tokenization; zero identifiable PII written to public ledger</td>
              <td className="font-bold text-green-800">[COMPLIANT]</td>
            </tr>
            <tr>
              <td className="font-bold">Non-Repudiation</td>
              <td>Immutable Access Audit Trail</td>
              <td>Solidity smart contract emits <code>RecordAccessed</code> audit event per query</td>
              <td className="font-bold text-green-800">[ENFORCED]</td>
            </tr>
          </tbody>
        </table>
      </fieldset>
    </div>
  );
}
