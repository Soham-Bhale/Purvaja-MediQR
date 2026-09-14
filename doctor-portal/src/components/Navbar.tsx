'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VERIFIED_DOCTORS } from '../lib/blockchain';

interface NavbarProps {
  activeDoctor: string;
  onDoctorChange: (address: string) => void;
}

export default function Navbar({ activeDoctor, onDoctorChange }: NavbarProps) {
  const pathname = usePathname();
  const [nodeAStatus, setNodeAStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [nodeBStatus, setNodeBStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const clock = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(clock);
  }, []);

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

  return (
    <div className="bg-[#ece9d8] border-b-2 border-[#404040] select-none text-black">
      {/* 1. Classic Windows/Java Application Titlebar */}
      <div className="swing-titlebar">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border border-white">
            +
          </span>
          <span className="font-bold tracking-tight text-white text-[11px] font-sans">
            MediQR Clinical Archive Console v2.0 [Java SE Runtime Enterprise Edition]
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button type="button" aria-label="Minimize" className="w-4 h-4 bg-[#ece9d8] text-black border-t border-l border-white border-b-black border-r-black text-[9px] font-bold leading-none flex items-center justify-center">
            _
          </button>
          <button type="button" aria-label="Maximize" className="w-4 h-4 bg-[#ece9d8] text-black border-t border-l border-white border-b-black border-r-black text-[9px] font-bold leading-none flex items-center justify-center">
            □
          </button>
          <button type="button" aria-label="Close" className="w-4 h-4 bg-[#ece9d8] text-black border-t border-l border-white border-b-black border-r-black text-[9px] font-bold leading-none flex items-center justify-center">
            ×
          </button>
        </div>
      </div>

      {/* 2. Classic Java JMenuBar */}
      <div className="flex items-center space-x-4 px-2 py-1 bg-[#ece9d8] border-b border-[#a0a0a0] text-xs font-normal">
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>F</u>ile</span>
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>E</u>dit</span>
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>V</u>iew</span>
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>P</u>ractitioner</span>
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>T</u>ools</span>
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>S</u>ecurity</span>
        <span className="hover:bg-[#0a246a] hover:text-white px-1.5 py-0.5 cursor-pointer"><u>H</u>elp</span>
      </div>

      {/* 3. Classic Java JToolBar Navigation */}
      <div className="flex flex-wrap items-center justify-between px-2 py-1.5 bg-[#ece9d8] gap-2 border-b border-[#ffffff]">
        <div className="flex items-center space-x-1.5">
          <Link
            href="/"
            className={`btn-swing ${pathname === '/' ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold' : ''}`}
          >
            🏠 System Overview
          </Link>

          <Link
            href="/emergency"
            className={`btn-swing ${pathname === '/emergency' ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold' : ''}`}
          >
            🚑 Triage Terminal
          </Link>

          <Link
            href="/doctor"
            className={`btn-swing ${pathname === '/doctor' ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold text-[#000080]' : ''}`}
          >
            🩺 Doctor Verification
          </Link>

          <Link
            href="/hospital"
            className={`btn-swing ${pathname === '/hospital' ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold' : ''}`}
          >
            🏥 Hospital Admin
          </Link>

          <Link
            href="/simulator"
            className={`btn-swing ${pathname === '/simulator' ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold text-red-700' : ''}`}
          >
            ⚡ Tamper Lab
          </Link>
        </div>

        {/* Right side: Practitioner Selector & Node LEDs */}
        <div className="flex items-center space-x-3 text-[11px]">
          {/* Node Indicators */}
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 border border-[#808080] px-1.5 py-0.5 bg-white">
              <span className={`w-2 h-2 rounded-full inline-block ${nodeAStatus === 'UP' ? 'bg-green-600' : 'bg-red-600'}`} />
              <span className="font-mono text-[10px]">NODE-A:5001</span>
            </span>
            <span className="flex items-center space-x-1 border border-[#808080] px-1.5 py-0.5 bg-white">
              <span className={`w-2 h-2 rounded-full inline-block ${nodeBStatus === 'UP' ? 'bg-green-600' : 'bg-red-600'}`} />
              <span className="font-mono text-[10px]">NODE-B:5002</span>
            </span>
          </div>

          {/* Clinician Selector */}
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-700">Practitioner:</span>
            <select
              value={activeDoctor.toLowerCase()}
              onChange={(e) => onDoctorChange(e.target.value)}
              aria-label="Practitioner Identity"
              className="sunken-box text-xs py-0.5 font-sans cursor-pointer bg-white"
            >
              {Object.entries(VERIFIED_DOCTORS).map(([addr, doc]) => (
                <option key={addr} value={addr.toLowerCase()}>
                  [VERIFIED] {doc.name.split('(')[0]}
                </option>
              ))}
              <option value="0x9999999999999999999999999999999999999999">
                [UNVERIFIED] 0x9999... (Simulate 403 Forbidden)
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
