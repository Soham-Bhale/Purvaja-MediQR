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
    <div className="space-y-3 font-sans text-black">
      {/* Title */}
      <div className="bg-[#0a246a] text-white p-2 border border-black flex items-center justify-between">
        <div>
          <span className="text-[10px] text-yellow-300 font-mono font-bold block">
            [ PARAMEDIC & TRIAGE TERMINAL - OFFLINE DEPLOYED ]
          </span>
          <h1 className="text-sm font-bold tracking-wide">
            Emergency Medical QR Scanner & Parser
          </h1>
        </div>
        <span className="text-xs bg-red-700 text-white font-bold px-2 py-0.5 border border-white">
          EMERGENCY MODE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Input Console */}
        <div className="space-y-3 lg:col-span-1">
          <fieldset className="swing-fieldset">
            <legend>Select Sample Optical Scan</legend>
            <div className="space-y-1.5 pt-1">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePresetIndex(idx);
                    handleParse(preset.payload);
                  }}
                  className={`w-full text-left p-1.5 text-xs font-sans border flex items-center justify-between cursor-pointer ${
                    activePresetIndex === idx
                      ? 'bg-[#0a246a] text-white border-black font-bold'
                      : 'bg-white text-black border-gray-400 hover:bg-[#f0ede0]'
                  }`}
                >
                  <span>{preset.name}</span>
                  {activePresetIndex === idx && <span>[ACTIVE]</span>}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="swing-fieldset">
            <legend>Raw QR Optical Payload (JSON)</legend>
            <textarea
              rows={8}
              value={qrRawInput}
              onChange={(e) => handleParse(e.target.value)}
              aria-label="Raw QR Optical Payload"
              placeholder="Paste raw QR optical payload JSON..."
              className="sunken-box w-full font-mono text-[11px] leading-tight"
            />
            {parseErrors.length > 0 && (
              <div className="bg-red-100 border border-red-800 text-red-900 p-1.5 text-xs font-mono mt-1">
                ERROR: {parseErrors.join(', ')}
              </div>
            )}
          </fieldset>
        </div>

        {/* Right: Rendered Vitals Card */}
        <div className="lg:col-span-2">
          {parsedTriage ? (
            <TriageCard triage={parsedTriage} patientHash={patientHash || undefined} />
          ) : (
            <div className="sunken-panel p-8 text-center text-gray-500 font-mono text-xs">
              [ NO VALID MEDIQR DATA LOADED ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
