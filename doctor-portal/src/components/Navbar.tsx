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

  // Simplified and Streamlined Nav Links for Academic Presentation
  const navLinks = [
    { href: '/', label: 'Patient Booking', icon: '🎟️' },
    { href: '/doctor', label: 'Doctor Workstation', icon: '🩺' },
    { href: '/blockchain', label: 'Blockchain Explorer', icon: '⛓️' },
    { href: '/emergency', label: 'Emergency Triage', icon: '🚑' },
    { href: '/esp32-setup', label: 'ESP32 Network', icon: '📡' },
  ];

  const currentDoc = doctorOptions.find(
    (d) => d.address.toLowerCase() === activeDoctor.toLowerCase()
  ) || {
    address: activeDoctor,
    name: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.name || 'Practitioner',
    hospital: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.hospital || 'Consortium Node',
    verified: !!VERIFIED_DOCTORS[activeDoctor.toLowerCase()],
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg group-hover:bg-blue-700 transition">
                  +
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-base tracking-tight">MediQR</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                      Paid Healthcare
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Blockchain Healthcare System</p>
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
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
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

            {/* Right Controls: Nodes, Emails, Biometrics, Doctor Switcher */}
            <div className="flex items-center gap-2.5">
              
              {/* Storage Node Status */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono">
                <div
                  title="Hospital Node A :5001"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] ${
                    nodeAStatus === 'UP' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${nodeAStatus === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>Node-A</span>
                </div>
                <div
                  title="Hospital Node B :5002"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] ${
                    nodeBStatus === 'UP' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${nodeBStatus === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>Node-B</span>
                </div>
              </div>

              {/* Email Outbox Preview Trigger */}
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                title="View outbound emails dispatched for appointment tokens & emergency MediQR codes"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <span>✉️</span>
                <span className="hidden sm:inline">Emails</span>
              </button>

              {/* Biometric Status Pill */}
              {isBioUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    clearBiometricSession();
                    setIsBioUnlocked(false);
                  }}
                  title="Biometrics verified. Click to lock terminal."
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-1 rounded-xl transition cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>🔓 Biometric Active</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    createBiometricSession(activeDoctor, currentDoc.name);
                    setIsBioUnlocked(true);
                  }}
                  title="Click to unlock with biometric authentication"
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-1 rounded-xl transition cursor-pointer animate-pulse"
                >
                  <span>🔒 Unlock</span>
                </button>
              )}

              {/* Doctor switcher dropdown */}
              <select
                value={activeDoctor.toLowerCase()}
                onChange={(e) => onDoctorChange(e.target.value)}
                aria-label="Active Practitioner"
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-[140px] sm:max-w-none truncate"
              >
                {doctorOptions.map((doc) => (
                  <option key={doc.address} value={doc.address.toLowerCase()}>
                    {doc.verified ? '✓ ' : '✗ '}{doc.name}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* Mobile Navigation Bar */}
          <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
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

      {/* Outbound Email Modal Accessible Across All Pages */}
      <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </>
  );
}
