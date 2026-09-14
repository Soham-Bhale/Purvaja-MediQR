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
    <div className="bg-[#ece9d8] border-2 border-t-white border-l-white border-b-black border-r-black p-3 space-y-3 font-sans text-black">
      {/* Patient Vital Header */}
      <div className="bg-[#0a246a] text-white p-2.5 flex flex-wrap items-center justify-between gap-3 border border-black">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-yellow-300 font-bold block">
            [ EMERGENCY MEDICAL TRIAGE DATA - UNENCRYPTED PUBLIC ACCESS ]
          </span>
          <h2 className="text-base font-bold text-white tracking-wide">
            PATIENT: {triage.fullName.toUpperCase()}
          </h2>
        </div>

        {/* Blood Group Display */}
        <div className="bg-red-700 border-2 border-white px-3 py-1 text-center">
          <span className="text-[9px] font-bold block uppercase text-white font-mono">Blood Type</span>
          <span className="text-xl font-black text-yellow-300 font-mono tracking-wider">
            {triage.bloodType}
          </span>
        </div>
      </div>

      {/* Critical Allergies & Chronic Conditions Fieldsets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <fieldset className="swing-fieldset">
          <legend>⚠️ Critical Medical Allergies</legend>
          {triage.criticalAllergies && triage.criticalAllergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {triage.criticalAllergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="bg-red-100 border border-red-800 text-red-950 font-bold px-1.5 py-0.5 text-xs font-mono"
                >
                  [!] {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600">None reported.</p>
          )}
        </fieldset>

        <fieldset className="swing-fieldset">
          <legend>📋 Chronic Conditions</legend>
          {triage.chronicConditions && triage.chronicConditions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {triage.chronicConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-100 border border-yellow-800 text-yellow-950 font-semibold px-1.5 py-0.5 text-xs font-mono"
                >
                  • {cond}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600">None reported.</p>
          )}
        </fieldset>
      </div>

      {/* Emergency Contacts Table */}
      <fieldset className="swing-fieldset">
        <legend>☎ Emergency Contacts Directory</legend>
        <table className="swing-table mt-1">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Relationship</th>
              <th>Telephone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {triage.emergencyContacts && triage.emergencyContacts.map((contact, idx) => (
              <tr key={idx}>
                <td className="font-bold">{contact.name}</td>
                <td className="text-gray-700">{contact.relationship}</td>
                <td className="font-mono font-bold text-blue-900">{contact.phone}</td>
                <td>
                  <a
                    href={`tel:${contact.phone}`}
                    className="btn-swing text-[10px] py-0.5 px-2"
                  >
                    📞 Dial
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      {/* Directives */}
      <div className="flex flex-wrap items-center justify-between text-[11px] bg-white p-2 border border-gray-400">
        <div>
          ORGAN DONOR STATUS:{' '}
          <strong className={triage.donorStatus ? 'text-green-800' : 'text-gray-600'}>
            {triage.donorStatus ? 'REGISTERED DONOR' : 'NOT SPECIFIED'}
          </strong>
        </div>
        {triage.resuscitationPreference && (
          <div>
            RESUSCITATION CODE:{' '}
            <strong className="text-red-700 font-mono">[{triage.resuscitationPreference}]</strong>
          </div>
        )}
      </div>

      {/* Escalate to Doctor Portal */}
      {patientHash && (
        <div className="bg-[#dedcd0] p-2.5 border border-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono truncate">
            <span className="font-bold text-gray-700">PATIENT TOKEN KEY: </span>
            <span className="text-blue-900 select-all">{patientHash}</span>
          </div>

          <Link
            href={`/doctor?patientHash=${encodeURIComponent(patientHash)}`}
            className="btn-swing-primary whitespace-nowrap text-xs py-1"
          >
            🩺 Open in Doctor Verification Portal &gt;&gt;
          </Link>
        </div>
      )}
    </div>
  );
}
