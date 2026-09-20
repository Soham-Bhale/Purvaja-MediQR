'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TriageCard, { TriageData } from '../../components/TriageCard';

const PRESETS = [
  {
    id: 'jane-doe',
    label: 'Jane Doe (O- | Penicillin Anaphylaxis Alert)',
    shortName: 'Jane Doe',
    bloodType: 'O-',
    alertBadge: 'Critical Allergy: Penicillin G',
    payload: JSON.stringify({
      v: '2.0',
      triage: {
        fullName: 'Jane Doe',
        bloodType: 'O-',
        criticalAllergies: ['Penicillin G', 'Beta-Lactams', 'Peanuts', 'Aspirin'],
        chronicConditions: ['Severe Asthma', 'Hypertension'],
        emergencyContacts: [
          { name: 'John Doe', relationship: 'Spouse', phone: '+1-555-0199' },
          { name: 'Dr. Ramesh Gupta', relationship: 'Primary Physician', phone: '+91-98765-43210' }
        ],
        donorStatus: true,
        resuscitationPreference: 'FULL_CODE'
      },
      patientHash: '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872',
      issuedAt: 1726358400000,
      issuerNodeId: 'HOSPITAL-NODE-A'
    }, null, 2)
  },
  {
    id: 'robert-fox',
    label: 'Robert Fox (AB+ | Contrast Dye & Cardiac Alert)',
    shortName: 'Robert Fox',
    bloodType: 'AB+',
    alertBadge: 'Cardiac Alert & Contrast Allergy',
    payload: JSON.stringify({
      v: '2.0',
      triage: {
        fullName: 'Robert Fox',
        bloodType: 'AB+',
        criticalAllergies: ['Contrast Dye (Iodine)', 'Sulfa'],
        chronicConditions: ['Coronary Artery Disease', 'Type 2 Diabetes'],
        emergencyContacts: [
          { name: 'Sarah Fox', relationship: 'Daughter', phone: '+1-555-4821' }
        ],
        donorStatus: false,
        resuscitationPreference: 'LIMITED'
      },
      patientHash: '0x88f4b23d91ca042781bcf704e6c927481237a912bb0e55597178eae3bc56872',
      issuedAt: 1726358400000,
      issuerNodeId: 'HOSPITAL-NODE-B'
    }, null, 2)
  }
];

function EmergencyTriageContent() {
  const searchParams = useSearchParams();
  
  // Safe initial state from first preset so UI is never blank
  const initialData = JSON.parse(PRESETS[0].payload);
  const [qrRawInput, setQrRawInput] = useState<string>(PRESETS[0].payload);
  const [parsedTriage, setParsedTriage] = useState<TriageData>(initialData.triage);
  const [patientHash, setPatientHash] = useState<string | null>(initialData.patientHash);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [isLensScanned, setIsLensScanned] = useState<boolean>(false);
  const [scanInputVal, setScanInputVal] = useState<string>('');

  function decodePayload(rawString: string): string {
    const trimmed = rawString.trim();
    // If input is a URL like http://.../emergency?data=... or http://.../emergency?b=O-&n=...
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const b = url.searchParams.get('b') || url.searchParams.get('blood');
        if (b) {
          const n = url.searchParams.get('n') || url.searchParams.get('name') || 'Emergency Patient';
          const a = url.searchParams.get('a') || url.searchParams.get('allergy') || '';
          const c = url.searchParams.get('c') || url.searchParams.get('condition') || '';
          const p = url.searchParams.get('p') || url.searchParams.get('phone') || '';
          const h = url.searchParams.get('h') || url.searchParams.get('hash') || '';

          return JSON.stringify({
            v: '2.0',
            triage: {
              fullName: n,
              bloodType: b,
              criticalAllergies: a ? a.split(',').map((s: string) => s.trim()).filter(Boolean) : ['None Reported'],
              chronicConditions: c ? c.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
              emergencyContacts: p ? [{ name: 'Emergency Contact', relationship: 'Primary Contact', phone: p }] : [],
              donorStatus: true,
              resuscitationPreference: 'FULL_CODE',
            },
            patientHash: h,
          }, null, 2);
        }

        const dataParam = url.searchParams.get('data');
        if (dataParam) {
          return decodePayload(dataParam);
        }
      } catch {
        // Fallback to raw parsing
      }
    }

    // Try decoding base64 if it's not starting with {
    if (!trimmed.startsWith('{')) {
      try {
        const decodedUri = decodeURIComponent(trimmed);
        const decodedBase64 = atob(decodedUri);
        if (decodedBase64.startsWith('{')) {
          return decodedBase64;
        }
      } catch {
        try {
          const decodedUri = decodeURIComponent(trimmed);
          if (decodedUri.startsWith('{')) return decodedUri;
        } catch {
          // Keep raw
        }
      }
    }

    return trimmed;
  }

  function handleParse(input: string, source: 'manual' | 'url' = 'manual') {
    const decoded = decodePayload(input);
    setQrRawInput(decoded);

    try {
      const data = JSON.parse(decoded);
      if (!data.triage || !data.triage.bloodType) {
        setParseErrors(['Missing valid emergency triage payload. Ensure JSON contains triage.bloodType']);
        return;
      }
      setParsedTriage(data.triage);
      setPatientHash(data.patientHash || null);
      setParseErrors([]);
      if (source === 'url') {
        setIsLensScanned(true);
      }
    } catch (err: any) {
      setParseErrors([`Invalid QR payload format: ${err.message}`]);
    }
  }

  // Auto-parse on load: supports both compact URL params (?b=...&n=...) and ?data= base64
  useEffect(() => {
    const n = searchParams.get('n') || searchParams.get('name');
    const b = searchParams.get('b') || searchParams.get('blood');
    const a = searchParams.get('a') || searchParams.get('allergy') || '';
    const c = searchParams.get('c') || searchParams.get('condition') || '';
    const p = searchParams.get('p') || searchParams.get('phone') || '';
    const h = searchParams.get('h') || searchParams.get('hash') || '';

    if (b) {
      const triageObj: TriageData = {
        fullName: n || 'Emergency Patient',
        bloodType: b,
        criticalAllergies: a ? a.split(',').map((s) => s.trim()).filter(Boolean) : ['None Reported'],
        chronicConditions: c ? c.split(',').map((s) => s.trim()).filter(Boolean) : [],
        emergencyContacts: p ? [{ name: 'Emergency Contact', relationship: 'Primary Contact', phone: p }] : [],
        donorStatus: true,
        resuscitationPreference: 'FULL_CODE',
      };
      setParsedTriage(triageObj);
      setPatientHash(h || null);
      setQrRawInput(JSON.stringify({ v: '2.0', triage: triageObj, patientHash: h }, null, 2));
      setIsLensScanned(true);
      setParseErrors([]);
      return;
    }

    const dataParam = searchParams.get('data');
    if (dataParam) {
      handleParse(dataParam, 'url');
      return;
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top First-Responder Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 text-white rounded-2xl p-6 shadow-md border border-rose-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <span>🚨</span> Rapid Paramedic Optical Triage
          </div>
          <h1 className="text-xl font-extrabold mt-1 tracking-tight">
            First-Responder Emergency MediQR Terminal
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Zero-latency offline optical scan parser. Displays critical blood group, life-threatening allergies, and immediate emergency contacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isLensScanned ? (
            <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-sm animate-pulse">
              <span>📱</span> Mobile Lens Scan Active
            </span>
          ) : (
            <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Emergency Mode Active
            </span>
          )}

          <Link
            href="/doctor"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5"
          >
            <span>🩺 Doctor Workstation ↗</span>
          </Link>
        </div>
      </div>

      {/* Quick Patient Switcher & Optical Scanner Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>👤</span> Sample Patient Scans:
          </span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setActivePresetIndex(idx);
                  setIsLensScanned(false);
                  handleParse(preset.payload, 'manual');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                  activePresetIndex === idx && !isLensScanned
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optical / Google Lens URL Paste Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
              📷
            </span>
            <input
              type="text"
              value={scanInputVal}
              onChange={(e) => setScanInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && scanInputVal.trim()) {
                  handleParse(scanInputVal.trim(), 'manual');
                  setScanInputVal('');
                }
              }}
              placeholder="Paste Google Lens URL, compact barcode string, or raw JSON scan payload..."
              className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (scanInputVal.trim()) {
                handleParse(scanInputVal.trim(), 'manual');
                setScanInputVal('');
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition shadow-xs whitespace-nowrap"
          >
            ⚡ Parse Scan
          </button>
        </div>

        {parseErrors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-xs font-mono">
            {parseErrors.join(', ')}
          </div>
        )}
      </div>

      {/* Primary Emergency Triage Card */}
      <div>
        <TriageCard triage={parsedTriage} patientHash={patientHash || undefined} />
      </div>

      {/* Collapsible Technical Optical Data */}
      <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-xs transition">
        <summary className="px-4 py-3 text-xs font-semibold text-slate-600 flex items-center justify-between cursor-pointer hover:bg-slate-100 select-none">
          <span className="flex items-center gap-2">
            <span>🔬</span> Technical Optical Payload & Blockchain Hash Proof
          </span>
          <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          <p className="text-xs text-slate-500">
            Below is the raw decrypted JSON string encoded into the physical MediQR physical card front segment.
          </p>
          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
            {qrRawInput}
          </pre>
          {patientHash && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <span className="font-mono text-blue-900 break-all">Patient Hash: {patientHash}</span>
              <Link
                href={`/doctor?patientHash=${encodeURIComponent(patientHash)}`}
                className="text-blue-700 font-bold hover:underline whitespace-nowrap"
              >
                Open Full Doctor Record →
              </Link>
            </div>
          )}
        </div>
      </details>

    </div>
  );
}

export default function EmergencyTriagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading Emergency Scanner...</div>}>
      <EmergencyTriageContent />
    </Suspense>
  );
}
