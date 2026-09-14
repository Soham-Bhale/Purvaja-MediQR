'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDoctor } from '../../lib/doctor-context';
import { getPatientRecordsFromLedger, BlockchainRecord } from '../../lib/blockchain';
import { verifyAndDecryptRecord, VerificationReport } from '../../lib/crypto-client';
import HashIntegrityBadge from '../../components/HashIntegrityBadge';

function DoctorPortalContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get('patientHash') || '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872';

  const { activeDoctor, setActiveDoctor, isVerified, doctorDetails } = useDoctor();
  const [patientHash, setPatientHash] = useState<string>(initialHash);
  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([]);
  const [reports, setReports] = useState<Record<string, VerificationReport>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [ledgerSource, setLedgerSource] = useState<string>('federation-state');
  const [tamperingRecordId, setTamperingRecordId] = useState<string | null>(null);
  const [lastUploadedHash, setLastUploadedHash] = useState<string | null>(null);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);
  const [queryStatus, setQueryStatus] = useState<{
    type: 'success' | 'empty' | 'error' | 'loading';
    message: string;
    timestamp: string;
  } | null>(null);

  // Read recently registered hash from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHash = localStorage.getItem('mediqr_last_registered_hash');
      const savedName = localStorage.getItem('mediqr_last_registered_name');
      if (savedHash) setLastUploadedHash(savedHash);
      if (savedName) setLastUploadedName(savedName);
    }
  }, []);

  // Sync with searchParams
  useEffect(() => {
    const urlHash = searchParams.get('patientHash');
    if (urlHash) {
      setPatientHash(urlHash);
      loadAndVerifyRecords(urlHash);
    }
  }, [searchParams]);

  // Load records whenever patientHash or activeDoctor changes
  async function loadAndVerifyRecords(hashToQuery: string) {
    const raw = (hashToQuery || '').trim();
    if (!raw) {
      setQueryStatus({
        type: 'error',
        message: 'Please enter a valid 0x patient hash to query the ledger.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    if (!isVerified) {
      setQueryStatus({
        type: 'error',
        message: '403 Access Denied: Caller address is not verified in MedicalRecordLedger.sol. Click the unlock button above to switch to verified Dr. Ramesh Gupta.',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    const cleanHash = raw.startsWith('0x') ? raw : `0x${raw}`;
    setPatientHash(cleanHash);
    setLoading(true);
    setQueryStatus({
      type: 'loading',
      message: `Querying blockchain ledger for hash ${cleanHash.slice(0, 10)}...`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const { records, source } = await getPatientRecordsFromLedger(cleanHash);
      setBlockchainRecords(records);
      setLedgerSource(source);

      if (records.length === 0) {
        setReports({});
        setQueryStatus({
          type: 'empty',
          message: `Query executed on ${source.toUpperCase()} at ${new Date().toLocaleTimeString()}. Zero on-chain records found for this patient hash.`,
          timestamp: new Date().toLocaleTimeString(),
        });
        return;
      }

      // Verify each record against its hospital node
      const newReports: Record<string, VerificationReport> = {};
      let verifiedCount = 0;
      let tamperedCount = 0;

      for (const record of records) {
        const report = await verifyAndDecryptRecord(record.storageURI, record.fileHash);
        newReports[record.storageURI] = report;
        if (report.isTamperFree) {
          verifiedCount++;
        } else {
          tamperedCount++;
        }
      }
      setReports(newReports);

      if (tamperedCount > 0) {
        setQueryStatus({
          type: 'error',
          message: `⚠️ CRITICAL: ${tamperedCount} record(s) failed on-chain SHA-256 verification! Data tampering detected.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setQueryStatus({
          type: 'success',
          message: `✓ Successfully verified ${verifiedCount} record(s) against immutable on-chain hashes. In-memory decryption authorized.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      console.error('Error querying blockchain records:', err);
      setQueryStatus({
        type: 'error',
        message: `Query error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isVerified) {
      loadAndVerifyRecords(patientHash);
    }
  }, [isVerified, activeDoctor]);

  // Tamper simulation toggle
  async function triggerTamper(storageURI: string) {
    try {
      setTamperingRecordId(storageURI);
      const url = new URL(storageURI);
      const recordId = url.pathname.split('/').pop();
      const tamperEndpoint = `${url.origin}/api/simulator/tamper/${recordId}`;

      await fetch(tamperEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ciphertext' }),
      });

      await loadAndVerifyRecords(patientHash);
    } catch (err) {
      console.error('Tamper attack trigger failed:', err);
    } finally {
      setTamperingRecordId(null);
    }
  }

  // Restore record
  async function triggerRestore(storageURI: string) {
    try {
      setTamperingRecordId(storageURI);
      const url = new URL(storageURI);
      const recordId = url.pathname.split('/').pop();
      const restoreEndpoint = `${url.origin}/api/simulator/restore/${recordId}`;

      await fetch(restoreEndpoint, {
        method: 'POST',
      });

      await loadAndVerifyRecords(patientHash);
    } catch (err) {
      console.error('Restore failed:', err);
    } finally {
      setTamperingRecordId(null);
    }
  }

  return (
    <div className="space-y-3 font-sans text-black">
      {/* Clinician Titlebar Header */}
      <div className="bg-[#0a246a] text-white p-2 border border-black flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-yellow-300 font-mono font-bold block">
            [ CLINICIAN EMR RECORD VERIFICATION MODULE - PACS INTEGRATED ]
          </span>
          <h1 className="text-sm font-bold tracking-wide">
            Doctor Verification & In-Memory Decryption Console
          </h1>
        </div>

        {/* Clinician Identity Indicator */}
        <div className="bg-white text-black px-2.5 py-1 border border-gray-400 text-xs flex items-center space-x-2">
          <span className="font-bold text-gray-700">LOGIN:</span>
          <span className="font-bold text-[#0a246a]">
            {doctorDetails ? doctorDetails.name : 'UNVERIFIED PRACTITIONER'}
          </span>
          <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white ${isVerified ? 'bg-green-700' : 'bg-red-700'}`}>
            {isVerified ? '[VERIFIED]' : '[BLOCKED]'}
          </span>
        </div>
      </div>

      {/* 403 ACCESS DENIED BANNER (Shown if unverified) */}
      {!isVerified && (
        <div className="bg-[#ffebee] border-2 border-red-700 p-3 space-y-2 text-black">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-red-700 text-white font-bold text-xs flex items-center justify-center">
              !
            </span>
            <h3 className="font-bold text-xs text-red-900 uppercase">
              403 FORBIDDEN: UNREGISTERED PRACTITIONER WALLET
            </h3>
          </div>
          <p className="text-xs text-red-950">
            Address <code>{activeDoctor}</code> is not in <strong>MedicalRecordLedger.sol</strong> whitelist.
          </p>
          <div className="pt-2 border-t border-red-300 flex items-center justify-between">
            <span className="text-xs text-red-900">Switch to verified credentials to access patient charts:</span>
            <button
              type="button"
              onClick={() => setActiveDoctor('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')}
              className="btn-swing-primary text-xs py-1"
            >
              🔓 Click to Unlock: Switch to Dr. Ramesh Gupta (Verified)
            </button>
          </div>
        </div>
      )}

      {/* Search Bar & Presets Panel */}
      <fieldset className="swing-fieldset">
        <legend>[ Query Patient Ledger by Salted Identifier Hash ]</legend>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={patientHash}
            onChange={(e) => setPatientHash(e.target.value.trim())}
            placeholder="0x-prefixed 32-byte hexadecimal patient query key..."
            className="sunken-box flex-1 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => loadAndVerifyRecords(patientHash)}
            disabled={loading}
            className="btn-swing-primary whitespace-nowrap text-xs py-1 px-4"
          >
            {loading ? '⏳ Querying...' : '🔍 Query On-Chain Ledger'}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-gray-300 text-xs">
          <span className="font-bold text-gray-700 text-[11px]">Quick Presets:</span>
          
          <button
            type="button"
            onClick={() => {
              const h = '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872';
              setPatientHash(h);
              loadAndVerifyRecords(h);
            }}
            className="btn-swing text-[10px] py-0.5"
          >
            📋 Jane Doe (2 Records Seeded)
          </button>

          {lastUploadedHash && lastUploadedHash !== '0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872' && (
            <button
              type="button"
              onClick={() => {
                setPatientHash(lastUploadedHash);
                loadAndVerifyRecords(lastUploadedHash);
              }}
              className="btn-swing text-[10px] py-0.5 font-bold text-blue-900"
            >
              ✨ Latest Upload: {lastUploadedName || 'Patient'} ({lastUploadedHash.slice(0, 10)}...)
            </button>
          )}
        </div>

        {/* Feedback Status Box */}
        {queryStatus && (
          <div className={`mt-2 p-1.5 border text-xs font-mono flex items-center justify-between ${
            queryStatus.type === 'success' ? 'bg-green-100 border-green-700 text-green-950' :
            queryStatus.type === 'empty' ? 'bg-yellow-100 border-yellow-700 text-yellow-950' :
            queryStatus.type === 'loading' ? 'bg-blue-100 border-blue-700 text-blue-950' :
            'bg-red-100 border-red-700 text-red-950'
          }`}>
            <span>{queryStatus.message}</span>
            <span className="text-[10px] text-gray-600 ml-2">{queryStatus.timestamp}</span>
          </div>
        )}

        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-600 font-mono">
          <span>LEDGER SOURCE: <strong>{ledgerSource.toUpperCase()}</strong></span>
          <span>RECORDS MATCHED: <strong>{blockchainRecords.length}</strong></span>
        </div>
      </fieldset>

      {/* Record Cards */}
      {isVerified && (
        <div className="space-y-3">
          {blockchainRecords.length === 0 && !loading && (
            <div className="sunken-panel p-6 text-center text-gray-600 font-mono text-xs">
              [ NO MEDICAL RECORDS COMMITTED ON-CHAIN FOR THIS PATIENT HASH ]
            </div>
          )}

          {blockchainRecords.map((record, index) => {
            const report = reports[record.storageURI];
            const isVerifiedFree = report?.isTamperFree;
            const decrypted = report?.decryptedData;

            return (
              <div key={record.storageURI + index} className="bg-[#ece9d8] border-2 border-t-white border-l-white border-b-black border-r-black p-3 space-y-2">
                {/* Header with Record Info & Tamper Controls */}
                <div className="bg-[#dedcd0] p-2 border border-gray-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#0a246a] text-white font-bold px-2 py-0.5 text-[10px] font-mono">
                      {record.recordType}
                    </span>
                    <span className="font-bold text-xs text-black">
                      RECORD #{index + 1}: {decrypted?.diagnosis || 'Encrypted Payload'}
                    </span>
                  </div>

                  {/* Tamper / Restore Controls */}
                  <div className="flex items-center space-x-1.5">
                    {isVerifiedFree ? (
                      <button
                        type="button"
                        onClick={() => triggerTamper(record.storageURI)}
                        disabled={tamperingRecordId === record.storageURI}
                        className="btn-swing text-red-800 text-[11px] py-0.5"
                      >
                        ⚡ Simulate Tamper Attack
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerRestore(record.storageURI)}
                        disabled={tamperingRecordId === record.storageURI}
                        className="btn-swing text-green-800 font-bold text-[11px] py-0.5"
                      >
                        ↺ Restore Pristine File
                      </button>
                    )}

                    <a
                      href={record.storageURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-swing text-[10px] py-0.5"
                      title="Inspect Raw Hospital Storage File"
                    >
                      Inspect Raw &gt;&gt;
                    </a>
                  </div>
                </div>

                {/* HASH INTEGRITY BADGE */}
                {report ? (
                  <HashIntegrityBadge
                    isTamperFree={report.isTamperFree}
                    expectedHash={report.expectedOnChainHash}
                    computedHash={report.computedLocalHash}
                    storageURI={record.storageURI}
                    hospitalNodeId={report.hospitalNodeId}
                    tamperReason={report.tamperReason}
                  />
                ) : (
                  <div className="sunken-box p-2 text-xs font-mono text-gray-500">
                    Verifying SHA-256 fingerprint against Solidity blockchain ledger...
                  </div>
                )}

                {/* DECRYPTED CLINICAL CONTENT */}
                {isVerifiedFree && decrypted && (
                  <div className="space-y-2 bg-white p-2.5 border border-gray-400">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs border-b border-gray-300 pb-2">
                      <div>
                        <span className="text-gray-500 block text-[10px]">PATIENT:</span>
                        <strong className="text-black">{decrypted.patientName}</strong> ({decrypted.patientId})
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">HOSPITAL NODE:</span>
                        <strong className="text-blue-900">{decrypted.hospitalName}</strong> [{decrypted.hospitalNodeId}]
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">ATTENDING PHYSICIAN:</span>
                        <strong>{decrypted.attendingPhysician?.name}</strong> (Lic: {decrypted.attendingPhysician?.licenseNumber})
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-gray-600 uppercase block">Clinical Notes:</span>
                      <p className="text-xs bg-[#fbfbf6] p-2 border border-gray-300 mt-0.5 font-sans leading-normal">
                        {decrypted.clinicalNotes}
                      </p>
                    </div>

                    {/* Prescriptions */}
                    {decrypted.prescriptions && decrypted.prescriptions.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-gray-600 uppercase block">Prescribed Medications:</span>
                        <table className="swing-table mt-1">
                          <thead>
                            <tr>
                              <th>Pharmaceutical Drug</th>
                              <th>Dosage</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {decrypted.prescriptions.map((p: any, pIdx: number) => (
                              <tr key={pIdx}>
                                <td className="font-bold text-blue-900">{p.drug}</td>
                                <td className="font-mono">{p.dosage}</td>
                                <td>{p.frequency}</td>
                                <td>{p.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Lab Results Table */}
                    {decrypted.labResults && decrypted.labResults.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-gray-600 uppercase block">Laboratory Diagnostic Panel:</span>
                        <table className="swing-table mt-1 font-mono">
                          <thead>
                            <tr>
                              <th>Test Name</th>
                              <th>Result</th>
                              <th>Unit</th>
                              <th>Reference Range</th>
                              <th>Flag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {decrypted.labResults.map((lab: any, lIdx: number) => (
                              <tr key={lIdx}>
                                <td className="font-bold">{lab.test}</td>
                                <td className="font-bold text-black">{lab.result}</td>
                                <td>{lab.unit}</td>
                                <td>{lab.normalRange}</td>
                                <td>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold ${
                                    lab.flag === 'CRITICAL' ? 'bg-red-700 text-white' :
                                    lab.flag === 'HIGH' ? 'bg-yellow-400 text-black' :
                                    'bg-green-700 text-white'
                                  }`}>
                                    [{lab.flag || 'NORMAL'}]
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {!isVerifiedFree && report && (
                  <div className="bg-[#ffebee] p-3 border border-red-600 text-center font-mono text-xs text-red-900 font-bold">
                    [ MEMORY DECRYPTION HALTED - CIPHERTEXT DATA PURGED DUE TO INTEGRITY FAILURE ]
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <Suspense fallback={<div className="p-4 font-mono text-xs">Loading Workstation Console...</div>}>
      <DoctorPortalContent />
    </Suspense>
  );
}
