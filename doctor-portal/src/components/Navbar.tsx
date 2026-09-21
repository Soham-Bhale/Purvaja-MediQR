'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VERIFIED_DOCTORS, ROOT_ADMIN_ADDRESS, getStoredDoctors } from '../lib/blockchain';
import { hasActiveBiometricSession, createBiometricSession, clearBiometricSession } from '../lib/biometrics';

interface NavbarProps {
  activeDoctor: string;
  onDoctorChange: (address: string) => void;
}

const INITIAL_DOCTOR_OPTIONS = [
  {
    address: ROOT_ADMIN_ADDRESS,
    name: 'Consortium Root Admin (MOH)',
    hospital: 'Consortium Root Authority',
    verified: true,
  },
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

  const navLinks = [
    { href: '/', label: 'Overview', icon: '📊' },
    { href: '/admin', label: 'Consortium Admin', icon: '🛡️' },
    { href: '/installer', label: 'Gov Installer', icon: '🏛️' },
    { href: '/doctor', label: 'Doctor Verification', icon: '🩺' },
    { href: '/hospital', label: 'Hospital Hub', icon: '🏥' },
    { href: '/simulator', label: 'Tamper Lab', icon: '⚡' },
    { href: '/emergency', label: 'Triage Scanner', icon: '🚑' },
  ];

  const currentDoc = doctorOptions.find(
    (d) => d.address.toLowerCase() === activeDoctor.toLowerCase()
  ) || {
    address: activeDoctor,
    name: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.name || 'Practitioner',
    hospital: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.hospital || 'Consortium Node',
    verified: !!VERIFIED_DOCTORS[activeDoctor.toLowerCase()],
  };

  // -------------------------------------------------------------
  // WINDOW 1: DEDICATED DOCTOR CLINICAL WORKSTATION HEADER
  // -------------------------------------------------------------
  if (pathname === '/doctor') {
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Hospital & EMR Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                🩺
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm tracking-tight">Clinical EMR Workstation</span>
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Doctor Terminal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{currentDoc.hospital}</p>
              </div>
            </div>

            {/* Doctor Identity & Responsive Interactive Biometric Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-900">{currentDoc.name}</div>
                <div className="text-[10px] text-slate-400">Attending Physician</div>
              </div>
              {isBioUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    clearBiometricSession();
                    setIsBioUnlocked(false);
                  }}
                  title="Biometrics verified. Click to lock terminal."
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-emerald-300 px-2.5 py-1 rounded-full transition cursor-pointer shadow-xs active:scale-95 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-rose-500"></span>
                  <span className="group-hover:hidden">🔓 Biometric Verified</span>
                  <span className="hidden group-hover:inline">🔒 Click to Lock</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    createBiometricSession(activeDoctor, currentDoc.name);
                    setIsBioUnlocked(true);
                  }}
                  title="Biometrics locked. Click to authenticate & unlock terminal."
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-amber-300 px-2.5 py-1 rounded-full transition cursor-pointer shadow-xs active:scale-95 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse group-hover:bg-emerald-500"></span>
                  <span className="group-hover:hidden">🔒 Biometric Locked</span>
                  <span className="hidden group-hover:inline">🔓 Click to Unlock</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded ml-0.5 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                    Unlock 👆
                  </span>
                </button>
              )}
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2.5">
              {/* Doctor switcher dropdown */}
              <select
                value={activeDoctor.toLowerCase()}
                onChange={(e) => onDoctorChange(e.target.value)}
                aria-label="Active Practitioner"
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs"
              >
                {doctorOptions.map((doc) => (
                  <option key={doc.address} value={doc.address.toLowerCase()}>
                    {doc.verified ? '✓ ' : '✗ '}{doc.name}
                  </option>
                ))}
              </select>

              {/* Distinct button to open Government Installer in separate window */}
              <Link
                href="/installer"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
                title="Open Government Appliance Installer in new window"
              >
                <span>🏛️ Gov Installer Window ↗</span>
              </Link>

              <Link
                href="/emergency"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
              >
                <span>🚑</span>
                <span>Triage</span>
              </Link>

              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-medium transition"
              >
                Exit
              </Link>
            </div>

          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // WINDOW 2: DEDICATED GOVERNMENT APPLIANCE INSTALLER HEADER
  // -------------------------------------------------------------
  if (pathname === '/installer') {
    return (
      <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Government Emblem & Identity */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-xs">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm tracking-tight">National Health Authority (MOH)</span>
                  <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                    Field Deployment
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Hospital Storage Appliance Installation Utility</p>
              </div>
            </div>

            {/* Field Official Badge & Distinct button to launch Doctor Workstation (No Overview link) */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-amber-300">UID-GOV-DEL-9921</div>
                <div className="text-[10px] text-emerald-400">● Field Commissioning Mode</div>
              </div>

              <Link
                href="/doctor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                title="Launch Doctor Clinical Workstation in separate window"
              >
                <span>🩺 Doctor Terminal Window ↗</span>
              </Link>
            </div>

          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // WINDOW 3: DEDICATED EMERGENCY FIRST-RESPONDER TRIAGE HEADER
  // -------------------------------------------------------------
  if (pathname === '/emergency') {
    return (
      <header className="bg-slate-950 border-b border-rose-900/60 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Paramedic / Triage Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                🚑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm tracking-tight">Emergency Triage Terminal</span>
                  <span className="text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                    Paramedic Field Scanner
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Rapid Roadside Optical Scan & Critical Vitals</p>
              </div>
            </div>

            {/* Emergency Status & Workstation Link */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 bg-rose-950 border border-rose-800 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Offline Optical Decryptor Ready</span>
              </span>

              <Link
                href="/doctor"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                title="Open Doctor Clinical Workstation"
              >
                <span>🩺 Doctor Terminal ↗</span>
              </Link>

              <Link
                href="/installer"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
                title="Open Government Appliance Installer"
              >
                <span>🏛️ Gov Installer ↗</span>
              </Link>
            </div>

          </div>
        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // DEFAULT CONSORTIUM / GENERAL OVERVIEW HEADER
  // -------------------------------------------------------------
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg group-hover:bg-blue-700 transition">
                +
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base tracking-tight">MediQR</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">v2.1</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Consortium Healthcare Ledger</p>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Hospital Node LEDs & Doctor Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Storage Node Status Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <div
                title="Hospital A (Apollo) Storage Node :5001"
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono ${
                  nodeAStatus === 'UP'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${nodeAStatus === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Node-A:5001</span>
              </div>

              <div
                title="Hospital B (Fortis) Storage Node :5002"
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono ${
                  nodeBStatus === 'UP'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${nodeBStatus === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Node-B:5002</span>
              </div>
            </div>

            {/* Practitioner Identity Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <div className="text-left pl-2 hidden sm:block">
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <span>Identity Role</span>
                  <span title={isBioUnlocked ? "Biometrics Active" : "Biometrics Locked"} className="text-[11px]">
                    {isBioUnlocked ? "🔓" : "🔒"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentDoc.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{currentDoc.name}</span>
                </div>
              </div>
              <select
                value={activeDoctor.toLowerCase()}
                onChange={(e) => onDoctorChange(e.target.value)}
                aria-label="Active Practitioner"
                className="bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {doctorOptions.map((doc) => (
                  <option key={doc.address} value={doc.address.toLowerCase()}>
                    {doc.verified ? '✓ ' : '✗ '}{doc.name} ({doc.hospital})
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-2.5 py-1 rounded text-xs font-medium ${
                  isActive
                    ? 'bg-blue-100 text-blue-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
