'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VERIFIED_DOCTORS, ROOT_ADMIN_ADDRESS, getStoredDoctors } from '../lib/blockchain';
import { hasActiveBiometricSession, createBiometricSession, clearBiometricSession } from '../lib/biometrics';
import EmailInboxModal from './EmailInboxModal';

interface NavbarProps {
  activeDoctor: string;
  onDoctorChange: (address: string) => void;
}

const INITIAL_DOCTOR_OPTIONS = [
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    name: 'Dr. Ramesh Gupta',
    hospital: 'Apollo Speciality (Node A)',
    verified: true,
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    name: 'Dr. Ananya Sharma',
    hospital: 'Fortis Healthcare (Node B)',
    verified: true,
  },
  {
    address: ROOT_ADMIN_ADDRESS,
    name: 'Consortium Root Admin (MOH)',
    hospital: 'Consortium Root Authority',
    verified: true,
  },
  {
    address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
    name: 'Dr. John Unverified',
    hospital: 'External Clinic (Unverified)',
    verified: false,
  },
];

export default function Navbar({ activeDoctor, onDoctorChange }: NavbarProps) {
  const pathname = usePathname();
  const [nodeAStatus, setNodeAStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [nodeBStatus, setNodeBStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [isBioUnlocked, setIsBioUnlocked] = useState<boolean>(false);
  const [doctorOptions, setDoctorOptions] = useState(INITIAL_DOCTOR_OPTIONS);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    function refreshDoctorOptions() {
      const stored = getStoredDoctors();
      const optionsMap = new Map<string, { address: string; name: string; hospital: string; verified: boolean }>();

      INITIAL_DOCTOR_OPTIONS.forEach((doc) => optionsMap.set(doc.address.toLowerCase(), doc));

      stored.forEach((doc) => {
        optionsMap.set(doc.doctorWallet.toLowerCase(), {
          address: doc.doctorWallet,
          name: doc.name,
          hospital: doc.department || 'Hospital Network',
          verified: doc.isVerified,
        });
      });

      setDoctorOptions(Array.from(optionsMap.values()));
    }

    refreshDoctorOptions();
    window.addEventListener('mediqr_consortium_doctors_change', refreshDoctorOptions);
    window.addEventListener('mediqr_enrolled_biometrics_change', refreshDoctorOptions);
    window.addEventListener('storage', refreshDoctorOptions);
    return () => {
      window.removeEventListener('mediqr_consortium_doctors_change', refreshDoctorOptions);
      window.removeEventListener('mediqr_enrolled_biometrics_change', refreshDoctorOptions);
      window.removeEventListener('storage', refreshDoctorOptions);
    };
  }, []);

  useEffect(() => {
    function checkBio() {
      if (typeof window !== 'undefined') {
        setIsBioUnlocked(hasActiveBiometricSession(activeDoctor));
      }
    }
    checkBio();
    window.addEventListener('mediqr_biometric_session_change', checkBio);
    window.addEventListener('storage', checkBio);
    return () => {
      window.removeEventListener('mediqr_biometric_session_change', checkBio);
      window.removeEventListener('storage', checkBio);
    };
  }, [activeDoctor, pathname]);

  useEffect(() => {
    async function checkHealth() {
      try {
        const resA = await fetch('http://localhost:5001/health', { cache: 'no-store' });
        setNodeAStatus(resA.ok ? 'UP' : 'DOWN');
      } catch {
        setNodeAStatus('DOWN');
      }
      try {
        const resB = await fetch('http://localhost:5002/health', { cache: 'no-store' });
        setNodeBStatus(resB.ok ? 'UP' : 'DOWN');
      } catch {
        setNodeBStatus('DOWN');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentDoc = doctorOptions.find(
    (d) => d.address.toLowerCase() === activeDoctor.toLowerCase()
  ) || {
    address: activeDoctor,
    name: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.name || 'Practitioner',
    hospital: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.hospital || 'Consortium Node',
    verified: !!VERIFIED_DOCTORS[activeDoctor.toLowerCase()],
  };

  // =========================================================================
  // VIEW 1: PATIENT-FACING WEBSITE HEADER (LAPTOP 1)
  // Clean, professional, Apple-style. Zero cross-device toggles!
  // =========================================================================
  if (pathname === '/') {
    return (
      <>
        <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 gap-4">
              
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 font-bold text-xl group-hover:scale-105 transition-transform">
                  +
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-lg tracking-tight">MediQR</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                      Enterprise Health
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">Zero-Trust Emergency Healthcare</p>
                </div>
              </Link>

              {/* Apple-style Smooth Scroll Navigation */}
              <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
                <a href="#interactive-stage" className="text-cyan-300 hover:text-white font-bold transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  3D Architecture
                </a>
                <a href="#the-crisis" className="hover:text-white transition">The Crisis</a>
                <a href="#the-breakthrough" className="hover:text-white transition">The Breakthrough</a>
                <a href="#hardware-showcase" className="hover:text-white transition">Hardware &amp; Card</a>
                <a href="#booking-portal" className="hover:text-white transition">Book Consultation</a>
                <a href="#faq" className="hover:text-white transition">FAQ</a>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  title="Check dispatched appointment confirmation emails"
                >
                  <span>✉️</span>
                  <span className="hidden sm:inline">Emails</span>
                </button>

                <a
                  href="#booking-portal"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
                >
                  Book Care (₹500) →
                </a>
              </div>

            </div>
          </div>
        </header>

        <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      </>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED DOCTOR CLINICAL WORKSTATION (LAPTOP 2)
  // =========================================================================
  if (pathname === '/doctor') {
    return (
      <>
        <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              
              {/* Doctor Station Branding */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
                  🩺
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Clinical EMR Workstation</span>
                    <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                      Laptop 2 Terminal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{currentDoc.hospital}</p>
                </div>
              </div>

              {/* Right Doctor Controls: LEDs, Biometrics, Doctor Switcher */}
              <div className="flex items-center gap-3">
                {/* Node Status */}
                <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded border text-[10px] ${nodeAStatus === 'UP' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
                    Node-A :5001
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] ${nodeBStatus === 'UP' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
                    Node-B :5002
                  </span>
                </div>

                <Link
                  href="/blockchain"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
                >
                  <span>⛓️ Live Blockchain</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  ✉️ Emails
                </button>

                {/* Biometric Status */}
                {isBioUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearBiometricSession();
                      setIsBioUnlocked(false);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 px-2.5 py-1 rounded-xl"
                  >
                    <span>🔓 Bio Verified</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      createBiometricSession(activeDoctor, currentDoc.name);
                      setIsBioUnlocked(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950 border border-amber-700 px-2.5 py-1 rounded-xl animate-pulse"
                  >
                    <span>🔒 Unlock</span>
                  </button>
                )}

                {/* Doctor Switcher */}
                <select
                  value={activeDoctor.toLowerCase()}
                  onChange={(e) => onDoctorChange(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white py-1.5 px-2 cursor-pointer max-w-[140px] sm:max-w-none truncate"
                >
                  {doctorOptions.map((doc) => (
                    <option key={doc.address} value={doc.address.toLowerCase()}>
                      {doc.verified ? '✓ ' : '✗ '}{doc.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </header>

        <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      </>
    );
  }

  // =========================================================================
  // VIEW 3: DEDICATED LIVE BLOCKCHAIN EXPLORER HEADER
  // =========================================================================
  if (pathname === '/blockchain') {
    return (
      <>
        <header className="bg-slate-950 border-b border-indigo-900/60 text-white sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                  ⛓️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Consortium Blockchain Explorer</span>
                    <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40">
                      Live Block Visualizer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Proof-of-Authority Healthcare Ledger</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/doctor"
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
                >
                  🩺 Doctor Terminal →
                </Link>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
                >
                  ✉️ Outbox
                </button>
              </div>
            </div>
          </div>
        </header>
        <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      </>
    );
  }

  // =========================================================================
  // VIEW 4: DEDICATED EMERGENCY PARAMEDIC HEADER (MOBILE PHONE)
  // =========================================================================
  if (pathname === '/emergency') {
    return (
      <header className="bg-slate-950 border-b border-rose-900/60 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-lg shadow-sm">
                🚑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Emergency Paramedic Terminal</span>
                  <span className="text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                    Device 3 Mobile Scan
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Rapid Roadside Optical Scan &amp; Vitals</p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              ✓ Offline Ready
            </span>
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // VIEW 5: ESP32 SETUP / GENERAL FALLBACK HEADER
  // =========================================================================
  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
              📡
            </div>
            <div>
              <span className="font-bold text-sm text-white">ESP32 Hardware Gateway</span>
              <p className="text-[11px] text-slate-400">MediQR Private Mesh Setup</p>
            </div>
          </Link>
          <Link
            href="/doctor"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
          >
            Doctor Terminal →
          </Link>
        </div>
      </div>
    </header>
  );
}
