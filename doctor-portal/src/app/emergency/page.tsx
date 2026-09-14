'use client';

import React, { useState, useEffect } from 'react';
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

export default function EmergencyTriagePage() {
  const [qrRawInput, setQrRawInput] = useState<string>(PRESETS[0].payload);
  const [parsedTriage, setParsedTriage] = useState<TriageData | null>(null);
  const [patientHash, setPatientHash] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);

  function handleParse(input: string) {
    setQrRawInput(input);
    try {
      const data = JSON.parse(input);
      if (!data.triage || !data.triage.bloodType) {
        setParseErrors(['Missing valid emergency triage payload']);
        setParsedTriage(null);
        setPatientHash(null);
        return;
      }
      setParsedTriage(data.triage);
      setPatientHash(data.patientHash || null);
      setParseErrors([]);
    } catch (err: any) {
      setParseErrors([`Invalid QR JSON payload: ${err.message}`]);
      setParsedTriage(null);
      setPatientHash(null);
    }
  }

  useEffect(() => {
    handleParse(PRESETS[0].payload);
  }, []);

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

        <span className="bg-rose-50 border border-rose-200 text-rose-800 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          Emergency Mode Active
        </span>
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
                    handleParse(preset.payload);
                  }}
                  className={`w-full text-left p-3 text-xs rounded-lg border transition ${
                    activePresetIndex === idx
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
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Optical QR Payload (JSON)
            </h2>
            <textarea
              rows={8}
              value={qrRawInput}
              onChange={(e) => handleParse(e.target.value)}
              aria-label="Raw QR Optical Payload"
              placeholder="Paste raw QR payload JSON here..."
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
