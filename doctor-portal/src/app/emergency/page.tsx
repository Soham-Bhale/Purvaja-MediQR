'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TriageCard, { TriageData } from '../../components/TriageCard';

const PRESETS = [
  {
    name: 'Jane Doe (Critical Anaphylaxis - Penicillin)',
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
    name: 'Robert Fox (Cardiac Alert - Iodine / Contrast)',
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
  const [qrRawInput, setQrRawInput] = useState<string>(PRESETS[0].payload);
  const [parsedTriage, setParsedTriage] = useState<TriageData | null>(null);
  const [patientHash, setPatientHash] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [isLensScanned, setIsLensScanned] = useState<boolean>(false);

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
        // Might be plain JSON encoded URI
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
        setParsedTriage(null);
        setPatientHash(null);
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
      setParsedTriage(null);
      setPatientHash(null);
    }
  }

  // Auto-parse on load: supports both compact URL params (?b=...&n=...) and ?data= base64
  useEffect(() => {
    // 1. Check for compact URL parameters: ?n=...&b=...&a=...&p=...&h=...
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

    // 2. Check for base64 / data parameter
    const dataParam = searchParams.get('data');
    if (dataParam) {
      handleParse(dataParam, 'url');
      return;
    }

    // 3. Fallback to default preset
    handleParse(PRESETS[0].payload, 'manual');
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>🚑</span> First-Responder Triage Terminal
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Emergency Medical QR Scanner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Offline unauthenticated optical scan parser showing critical allergies, blood group, and emergency contacts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLensScanned && (
            <span className="bg-blue-50 border border-blue-200 text-blue-800 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-sm animate-pulse">
              <span>📱</span> Google Lens / Camera Scan Link Active
            </span>
          )}
          <span className="bg-rose-50 border border-rose-200 text-rose-800 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            Emergency Mode Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Sample Optical Scans
            </h2>
            <div className="space-y-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePresetIndex(idx);
                    setIsLensScanned(false);
                    handleParse(preset.payload, 'manual');
                  }}
                  className={`w-full text-left p-3 text-xs rounded-lg border transition ${
                    activePresetIndex === idx && !isLensScanned
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Optical QR Payload
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Supports URL & JSON</span>
            </div>
            <textarea
              rows={8}
              value={qrRawInput}
              onChange={(e) => handleParse(e.target.value, 'manual')}
              aria-label="Raw QR Optical Payload"
              placeholder="Paste raw QR payload JSON or Google Lens scan URL here..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono text-xs text-slate-800 leading-tight focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {parseErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs font-mono">
                {parseErrors.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Right: Rendered Vitals Card */}
        <div className="lg:col-span-2">
          {parsedTriage ? (
            <TriageCard triage={parsedTriage} patientHash={patientHash || undefined} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 font-mono text-xs shadow-sm">
              No valid MediQR payload loaded.
            </div>
          )}
        </div>
      </div>
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
