'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-3 border border-white/20">
            <span>🛡️</span> Zero-PII Healthcare Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            MediQR Distributed Healthcare Archive
          </h1>
          <p className="text-sm sm:text-base text-blue-100 mt-2 leading-relaxed">
            Tamper-proof medical records secured by hybrid off-chain AES-256-GCM hospital storage, 
            instant optical triage QR codes, and immutable on-chain Ethereum integrity validation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/emergency"
            className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg text-center transition"
          >
            🚑 Paramedic Triage
          </Link>
          <Link
            href="/doctor"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg text-center shadow-md transition"
          >
            🩺 Doctor Portal →
          </Link>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
              📱
            </div>
            <h2 className="text-base font-bold text-slate-900">1. Dual-Segment MediQR</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Splits patient data into two distinct layers: public triage details readable offline by first-responders, plus a salted cryptographic query token.
            </p>
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Query Key</span>
              HMAC-SHA256(National_ID + Salt, Secret_Key)
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link href="/emergency" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Open Triage Scanner <span>→</span>
            </Link>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
              🏥
            </div>
            <h2 className="text-base font-bold text-slate-900">2. Multi-Hospital Storage Nodes</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Medical records (consultations, labs, prescriptions) are encrypted at rest with AES-256-GCM and partitioned across independent hospital nodes.
            </p>
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Cipher Protocol</span>
              AES-256-GCM • 12-byte IV • 16-byte AuthTag
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link href="/hospital" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Hospital Admin Hub <span>→</span>
            </Link>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
              ⛓️
            </div>
            <h2 className="text-base font-bold text-slate-900">3. Immutable Blockchain Ledger</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              <code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">MedicalRecordLedger.sol</code> anchors 32-byte SHA-256 document checksums and manages verified clinician authorization. No plain health data on-chain.
            </p>
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Contract Mapping</span>
              mapping(bytes32 patientHash =&gt; RecordMetadata[])
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link href="/doctor" className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
              Doctor Verification Console <span>→</span>
            </Link>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition group">
          <div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <h2 className="text-base font-bold text-slate-900">4. Forensic Tamper Detection</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Before decryption, the portal fetches the document and computes its live SHA-256 hash. If even a single bit has been altered, decryption is halted immediately.
            </p>
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Integrity Rule</span>
              computedHash === onChainHash ? Decrypt : Abort(403)
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link href="/simulator" className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1">
              Tamper Attack Lab <span>→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Regulatory & Security Compliance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>🛡️</span> Regulatory Compliance & Security Standards
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Standard</th>
                <th className="px-6 py-3">Statutory Requirement</th>
                <th className="px-6 py-3">MediQR Implementation</th>
                <th className="px-6 py-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50 transition">
                <td className="px-6 py-3.5 font-bold text-slate-900">HIPAA Security Rule</td>
                <td className="px-6 py-3.5">§164.312(a)(2)(iv) Encryption at Rest & Transit</td>
                <td className="px-6 py-3.5">AES-256-GCM authenticated cipher with 128-bit MAC tag + TLS 1.3</td>
                <td className="px-6 py-3.5">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold text-[10px]">
                    COMPLIANT
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="px-6 py-3.5 font-bold text-slate-900">DPDP Act 2023 (India)</td>
                <td className="px-6 py-3.5">Sec. 8 Data Fiduciary Protection & Zero-PII</td>
                <td className="px-6 py-3.5">Salted HMAC-SHA256 tokenization; zero identifiable PII on public ledger</td>
                <td className="px-6 py-3.5">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold text-[10px]">
                    COMPLIANT
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="px-6 py-3.5 font-bold text-slate-900">Non-Repudiation</td>
                <td className="px-6 py-3.5">Immutable Access Audit Trail</td>
                <td className="px-6 py-3.5">Solidity smart contract emits <code>RecordAccessed</code> audit event per query</td>
                <td className="px-6 py-3.5">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold text-[10px]">
                    ENFORCED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
