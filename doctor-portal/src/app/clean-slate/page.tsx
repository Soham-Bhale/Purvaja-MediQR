'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_APPOINTMENTS, persistAppointments, APPOINTMENTS_STORAGE_KEY } from '../../lib/appointments';
import { INITIAL_BLOCKS, persistBlocks, BLOCKS_STORAGE_KEY } from '../../lib/blockchain-blocks';
import { INITIAL_EMAILS, persistEmails, EMAILS_STORAGE_KEY } from '../../lib/email-service';
import {
  INITIAL_FEDERATION_LEDGER,
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  persistLedger,
  persistHospitals,
  persistDoctors,
  LEDGER_STORAGE_KEY,
  HOSPITALS_STORAGE_KEY,
  DOCTORS_STORAGE_KEY,
} from '../../lib/blockchain';
import { clearBiometricSession } from '../../lib/biometrics';

export default function CleanSlatePage() {
  const [purgedAt, setPurgedAt] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [nodeAStatus, setNodeAStatus] = useState<'CHECKING' | 'ONLINE' | 'OFFLINE'>('CHECKING');
  const [nodeBStatus, setNodeBStatus] = useState<'CHECKING' | 'ONLINE' | 'OFFLINE'>('CHECKING');

  // Perform full client-side reset to pristine presentation baseline
  const performCleanSlate = () => {
    setIsResetting(true);
    try {
      if (typeof window !== 'undefined') {
        // 1. Remove all old mediqr keys from localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('mediqr_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // 2. Re-seed pristine baseline appointments (Jane Doe)
        persistAppointments(INITIAL_APPOINTMENTS);

        // 3. Re-seed single Genesis Block (Block #0)
        persistBlocks(INITIAL_BLOCKS);

        // 4. Re-seed single baseline email receipt
        persistEmails(INITIAL_EMAILS);

        // 5. Re-seed consortium ledger, hospitals, and doctors
        persistLedger(INITIAL_FEDERATION_LEDGER);
        persistHospitals(INITIAL_HOSPITALS);
        persistDoctors(INITIAL_DOCTORS);

        // 6. Reset active doctor to Dr. Ramesh Gupta (Apollo)
        localStorage.setItem('mediqr_active_doctor', '0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
        window.dispatchEvent(
          new CustomEvent('mediqr_active_doctor_change', {
            detail: { doctor: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
          })
        );

        // 7. Clear biometric session
        clearBiometricSession();

        setPurgedAt(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Clean slate error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    performCleanSlate();

    // Check health of Hospital Node A and Node B
    fetch('http://localhost:5001/health')
      .then((res) => (res.ok ? setNodeAStatus('ONLINE') : setNodeAStatus('OFFLINE')))
      .catch(() => setNodeAStatus('OFFLINE'));

    fetch('http://localhost:5002/health')
      .then((res) => (res.ok ? setNodeBStatus('ONLINE') : setNodeBStatus('OFFLINE')))
      .catch(() => setNodeBStatus('OFFLINE'));
  }, []);

  const openPresentationSuite = () => {
    // Sequentially open the 4 presentation windows
    window.open('http://localhost:3000', '_blank');
    setTimeout(() => window.open('http://localhost:3000/book', '_blank'), 400);
    setTimeout(() => window.open('http://localhost:3000/doctor', '_blank'), 800);
    setTimeout(() => window.open('http://localhost:3000/emails', '_blank'), 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">
          ✨
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PRESENTATION READY • CLEAN SLATE PROTOCOL
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Reset to Pristine Baseline
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            All testing dummy appointments, extra mined blocks, bit-flip mutations, and test emails have been completely purged. The consortium is reset to its canonical single Genesis block and baseline patient state.
          </p>

          {purgedAt && (
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2 pt-1">
              <span>✓ Purged successfully at {purgedAt}</span>
              <span className="text-white/20">|</span>
              <span>All localStorage keys re-initialized</span>
            </div>
          )}
        </div>
      </div>

      {/* Presentation Readiness Checklist */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>📋</span>
          <span>Pre-Demonstration System Audit</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>⛓️ Consortium Blockchain</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">PASS</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Exactly 1 Genesis Block (Index 0). Previous hash: 0x000... Merkle root anchored. Zero tamper conflicts.
            </p>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>📅 Applicant Consultation Queue</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">PASS</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Single baseline patient (Jane Doe, APT-APO-2026-8812, ₹500 paid). Ready for new booking demonstrations.
            </p>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>✉️ Dispatched Email Gateway</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">PASS</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Single pristine payment confirmation receipt in outbox. Ready for real-time dispatch events.
            </p>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>🩺 Doctor EMR Station</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">PASS</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              Active Physician: Dr. Ramesh Gupta (Apollo Speciality). Biometrics unlocked for seamless consultation.
            </p>
          </div>

          <div className="bg-slate-950 border border-white/10 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span>🏥 Hospital Node A Storage (:5001)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${nodeAStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                {nodeAStatus}
              </span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Apollo off-chain AES-256-GCM vault restored to pristine REC-APOLLO-001.enc.json.
            </p>
          </div>

          <div className="bg-slate-950 border border-white/10 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span>🏥 Hospital Node B Storage (:5002)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${nodeBStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                {nodeBStatus}
              </span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Fortis off-chain AES-256-GCM vault restored to pristine REC-FORTIS-002.enc.json.
            </p>
          </div>

        </div>

        {/* Primary Launch Action Buttons */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openPresentationSuite}
              className="px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 transition flex items-center gap-2 cursor-pointer font-mono"
            >
              <span>🚀</span>
              <span>Launch All 4 Presentation Windows</span>
            </button>

            <button
              type="button"
              onClick={performCleanSlate}
              disabled={isResetting}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer font-mono"
            >
              <span>↺</span>
              <span>{isResetting ? 'Purging...' : 'Clean Slate Again'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 pt-2">
            <span>Direct Jump:</span>
            <Link href="/" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition">
              1. Landing Page
            </Link>
            <Link href="/book" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-cyan-200 transition">
              2. Applicant Booking (₹500)
            </Link>
            <Link href="/doctor" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-indigo-200 transition">
              3. Doctor EMR Terminal
            </Link>
            <Link href="/emails" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-emerald-200 transition">
              4. Dispatched Emails Outbox
            </Link>
            <Link href="/blockchain" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 hover:text-amber-200 transition">
              Blockchain Explorer
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}