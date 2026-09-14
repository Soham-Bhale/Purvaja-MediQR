import React from 'react';
import Link from 'next/link';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface TriageData {
  fullName: string;
  bloodType: string;
  criticalAllergies: string[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  donorStatus: boolean;
  resuscitationPreference?: string;
}

interface TriageCardProps {
  triage: TriageData;
  patientHash?: string;
  issuerNodeId?: string;
  issuedAt?: number;
}

export default function TriageCard({ triage, patientHash, issuerNodeId, issuedAt }: TriageCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Patient Vital Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold block">
            Emergency Medical Triage • Offline Available
          </span>
          <h2 className="text-xl font-bold tracking-tight mt-0.5">
            {triage.fullName}
          </h2>
          {issuedAt && (
            <span className="text-xs text-blue-200 block mt-1">
              Issued: {new Date(issuedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Blood Group Display */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center min-w-[100px]">
          <span className="text-[10px] uppercase font-semibold text-blue-200 tracking-wider block">Blood Group</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono tracking-wider block">
            {triage.bloodType}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Critical Allergies & Chronic Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span>⚠️</span> Critical Allergies
            </h3>
            {triage.criticalAllergies && triage.criticalAllergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {triage.criticalAllergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="bg-rose-50 border border-rose-200 text-rose-800 font-semibold px-2.5 py-1 rounded-md text-xs"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">None reported.</p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span>📋</span> Chronic Conditions
            </h3>
            {triage.chronicConditions && triage.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {triage.chronicConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-50 border border-amber-200 text-amber-800 font-medium px-2.5 py-1 rounded-md text-xs"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">None reported.</p>
            )}
          </div>
        </div>

        {/* Emergency Contacts Directory */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>☎</span> Emergency Contacts
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {triage.emergencyContacts && triage.emergencyContacts.map((contact, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 transition text-sm">
                <div>
                  <span className="font-semibold text-slate-900">{contact.name}</span>
                  <span className="text-xs text-slate-500 ml-2">({contact.relationship})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-medium text-slate-700">{contact.phone}</span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1 rounded-md text-xs border border-emerald-200 transition"
                  >
                    Dial
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Directives */}
        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 gap-2">
          <div>
            <span className="text-slate-500">Organ Donor: </span>
            <strong className={triage.donorStatus ? 'text-emerald-700' : 'text-slate-600'}>
              {triage.donorStatus ? 'Registered Donor' : 'Not Specified'}
            </strong>
          </div>
          {triage.resuscitationPreference && (
            <div>
              <span className="text-slate-500">Resuscitation Code: </span>
              <strong className="text-rose-700 font-mono font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {triage.resuscitationPreference}
              </strong>
            </div>
          )}
        </div>

        {/* Doctor Portal Transfer */}
        {patientHash && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs overflow-hidden max-w-full">
              <span className="font-semibold text-blue-900 block">Cryptographic Query Hash:</span>
              <span className="font-mono text-[11px] text-blue-700 break-all select-all block mt-0.5">{patientHash}</span>
            </div>

            <Link
              href={`/doctor?patientHash=${encodeURIComponent(patientHash)}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition whitespace-nowrap shadow-sm"
            >
              Open in Doctor Verification Portal →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
