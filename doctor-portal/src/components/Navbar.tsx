'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VERIFIED_DOCTORS } from '../lib/blockchain';

interface NavbarProps {
  activeDoctor: string;
  onDoctorChange: (address: string) => void;
}

const DOCTOR_OPTIONS = [
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    name: 'Dr. Ramesh Gupta',
    hospital: 'Apollo Speciality',
    verified: true,
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    name: 'Dr. Ananya Sharma',
    hospital: 'Fortis Healthcare',
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
    { href: '/emergency', label: 'Triage Scanner', icon: '🚑' },
    { href: '/doctor', label: 'Doctor Verification', icon: '🩺' },
    { href: '/hospital', label: 'Hospital Hub', icon: '🏥' },
    { href: '/simulator', label: 'Tamper Lab', icon: '⚡' },
  ];

  const currentDoc = DOCTOR_OPTIONS.find(
    (d) => d.address.toLowerCase() === activeDoctor.toLowerCase()
  ) || {
    address: activeDoctor,
    name: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.name || 'Practitioner',
    hospital: VERIFIED_DOCTORS[activeDoctor.toLowerCase()]?.hospital || 'Consortium Node',
    verified: !!VERIFIED_DOCTORS[activeDoctor.toLowerCase()],
  };

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
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">v2.0</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Tamper-Proof Healthcare Ledger</p>
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
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Practitioner</div>
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
                {DOCTOR_OPTIONS.map((doc) => (
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
