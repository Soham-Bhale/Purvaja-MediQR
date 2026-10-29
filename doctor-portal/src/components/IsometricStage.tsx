'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// =========================================================================
// ISOMETRIC 3D MATHEMATICAL PROJECTION ENGINE
// =========================================================================
const COS30 = Math.cos(Math.PI / 6); // ~0.866025
const SIN30 = 0.5;
const STAGE_CX = 600;
const STAGE_CY = 420;

function iso(x: number, y: number, z: number = 0): [number, number] {
  return [
    STAGE_CX + (x - y) * COS30,
    STAGE_CY + (x + y) * SIN30 - z,
  ];
}

function r1(v: number): string {
  return (Math.round(v * 10) / 10).toString();
}

function isoPath(points: Array<[number, number]>, close: boolean = true): string {
  const coords = points.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ');
  return `M${coords}${close ? 'Z' : ''}`;
}

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// =========================================================================
// CHAPTERS (8-STAGE NARRATIVE)
// =========================================================================
export interface Chapter {
  id: string;
  num: string;
  tag: string;
  kicker: string;
  title: [string, string];
  body: string;
  facts: Array<[string, string]>;
  metric: {
    label: string;
    value: number;
    countFrom: number;
    decimals: number;
    unit: string;
    sub: string;
  };
  formula: {
    symbol: string;
    expression: string;
    explanation: string;
  };
  camera: {
    fx: number;
    fy: number;
    zoom: number;
  };
  activeNodes: string[];
}

export const MEDIQR_CHAPTERS: Chapter[] = [
  {
    id: 'collision',
    num: '01',
    tag: 'THE COLLISION',
    kicker: 'TRAUMA INCIDENT · HIGHWAY NH-48',
    title: ['One road collision.', 'The patient cannot speak.'],
    body: 'A victim is found unconscious at a remote highway accident. Their phone is locked, wallet missing. Over 250,000 fatal clinical errors occur globally each year because emergency doctors cannot access critical allergy or blood data during the golden hour.',
    facts: [
      ['VICTIM', 'Unresponsive / Trauma Code 1'],
      ['TRIAGE DELAY', '25 – 45 min average'],
      ['FATAL RISK', 'Anaphylactic allergy shock'],
    ],
    metric: {
      label: 'fatal ER delay',
      value: 45,
      countFrom: 12,
      decimals: 0,
      unit: 'min',
      sub: 'Standard hospital query latency',
    },
    formula: {
      symbol: 'T_delay',
      expression: 'T_triage = 45 min ≫ 0.018 s',
      explanation: 'Unconscious status causes severe diagnostic deadlock',
    },
    camera: { fx: -380, fy: -140, zoom: 1.35 },
    activeNodes: ['ambulance'],
  },
  {
    id: 'glyph',
    num: '02',
    tag: 'THE OPTICAL GLYPH',
    kicker: 'DUAL-SEGMENT OPTICAL QR MATRIX',
    title: ['A camera lens scans.', 'Critical vitals in 0.018s.'],
    body: 'The paramedic scans the laser-etched MediQR titanium keycard or silicone wristband. Reed-Solomon error correction decodes the high-density optical glyph in 18 milliseconds, operating with zero cellular connection, zero Wi-Fi, and zero installed apps.',
    facts: [
      ['SCAN TIME', '0.018 seconds'],
      ['HARDWARE', '100% Passive (Zero battery)'],
      ['RESILIENCE', '850°C fireproof titanium'],
    ],
    metric: {
      label: 'optical acquisition',
      value: 0.018,
      countFrom: 0.45,
      decimals: 3,
      unit: 's',
      sub: 'Decoded directly from optical glyph',
    },
    formula: {
      symbol: 'T_optical',
      expression: 'Latency = 18 ms (Offline Native)',
      explanation: 'Decoded by any standard phone camera sensor',
    },
    camera: { fx: -160, fy: -80, zoom: 1.4 },
    activeNodes: ['ambulance', 'card'],
  },
  {
    id: 'airgap',
    num: '03',
    tag: 'THE AIR-GAP CIPHER',
    kicker: 'AES-256-GCM · HMAC-SHA256 DUAL SEGMENTS',
    title: ['Roadside triage unmasked.', 'Clinical vault locked.'],
    body: 'MediQR splits data into two isolated segments. Segment 1 provides instant Blood Group (B+) and Anaphylaxis Allergies (Penicillin G) for urgent resuscitation. Segment 2 is a salted 32-byte cryptographic query token accessible strictly to verified hospital doctors.',
    facts: [
      ['SEGMENT 1', 'Blood Type + Anaphylaxis ICE'],
      ['SEGMENT 2', '32-Byte HMAC Physician Salt'],
      ['ON-CARD PII', '0 Plain Text Records'],
    ],
    metric: {
      label: 'confidentiality',
      value: 100,
      countFrom: 20,
      decimals: 0,
      unit: '%',
      sub: 'Zero unprotected PII in public glyph',
    },
    formula: {
      symbol: 'K_doc',
      expression: 'Segment_2 = HMAC-SHA256(Record_ID, Salt)',
      explanation: 'Dual-segment cryptographic separation barrier',
    },
    camera: { fx: -80, fy: 20, zoom: 1.35 },
    activeNodes: ['card', 'esp32'],
  },
  {
    id: 'mesh',
    num: '04',
    tag: 'THE HARDWARE MESH',
    kicker: 'ESP32-D0WD-V3 · 2.4GHz SOVEREIGN MESH',
    title: ['Air-gapped private mesh.', 'Zero cloud dependencies.'],
    body: 'The onboard ESP32 hardware router broadcasts a secure private WPA2 subnet (192.168.4.1). Ambulance, physician workstation, and phone connect directly. Its intelligent blue LED turns solid ON the instant all 3 demonstration devices join the mesh.',
    facts: [
      ['SSID', 'MediQR-Secure-Net'],
      ['GATEWAY', '192.168.4.1 (Local AP)'],
      ['SMART LED', 'Solid ON at 3 Clients'],
    ],
    metric: {
      label: 'network jitter',
      value: 1.4,
      countFrom: 18.2,
      decimals: 1,
      unit: 'ms',
      sub: '100% sovereign air-gapped subnet',
    },
    formula: {
      symbol: 'Mesh_AP',
      expression: 'StationCount ≥ 3 ⟹ LED_Solid',
      explanation: 'Autonomous hardware routing without internet gateways',
    },
    camera: { fx: 80, fy: 30, zoom: 1.3 },
    activeNodes: ['card', 'esp32', 'doctor'],
  },
  {
    id: 'vault',
    num: '05',
    tag: 'THE HOSPITAL VAULT',
    kicker: 'APOLLO (:5001) · FORTIS (:5002) STORAGE NODES',
    title: ['Multi-hospital storage.', 'Zero single point of failure.'],
    body: 'Clinical case notes, lab diagnostics, and radiology scans are partitioned across independent hospital nodes (Apollo Node A on port 5001, Fortis Node B on port 5002). Every payload is encrypted at rest using individual hospital AES-256 keys.',
    facts: [
      ['HOSPITAL A', 'Apollo Health (:5001)'],
      ['HOSPITAL B', 'Fortis Node (:5002)'],
      ['STORAGE ARCH', 'Decoupled Microservices'],
    ],
    metric: {
      label: 'node redundancy',
      value: 2,
      countFrom: 1,
      decimals: 0,
      unit: 'nodes',
      sub: 'Independent consortium databases',
    },
    formula: {
      symbol: 'Enc_vault',
      expression: 'Ciphertext = AES-256-GCM(Record, K_hosp)',
      explanation: 'Decentralized multi-hospital partition boundary',
    },
    camera: { fx: 260, fy: -80, zoom: 1.25 },
    activeNodes: ['doctor', 'nodeA', 'nodeB'],
  },
  {
    id: 'ledger',
    num: '06',
    tag: 'THE BLOCKCHAIN LEDGER',
    kicker: 'SOLIDITY CONSORTIUM · MedicalRecordLedger.sol',
    title: ['Cryptographic hash anchors.', 'Zero PII on-chain.'],
    body: 'When a consultation completes, a 32-byte SHA-256 hash of the off-chain record is immutably anchored into the Ethereum consortium blockchain. Each block cryptographically seals previous block hashes, forming an unforgeable chronological ledger.',
    facts: [
      ['CONSENSUS', 'Ethereum Consortium Proof'],
      ['ON-CHAIN PII', '0 Bytes (SHA-256 only)'],
      ['GAS AUDIT', 'Optimized Struct Packing'],
    ],
    metric: {
      label: 'ledger integrity',
      value: 100,
      countFrom: 85,
      decimals: 0,
      unit: '%',
      sub: 'Mathematical hash proof immutability',
    },
    formula: {
      symbol: 'H_block',
      expression: 'H_n = SHA256(H_{n-1} ∥ TxRoot ∥ Timestamp)',
      explanation: 'Solidity smart contract cryptographic consensus',
    },
    camera: { fx: 440, fy: 60, zoom: 1.25 },
    activeNodes: ['nodeA', 'nodeB', 'blockchain'],
  },
  {
    id: 'tamper',
    num: '07',
    tag: 'TAMPER IMMUNITY GATE',
    kicker: 'CRYPTOGRAPHIC AUDIT & FRAUD DETECTION',
    title: ['Alter one bit on server.', 'The blockchain blocks it.'],
    body: 'If a rogue administrator or database attacker modifies a patient prescription or blood type in the hospital SQL table, the recomputed SHA-256 digest fails to match the blockchain anchor. The clinical workstation instantly triggers a red alert and aborts decryption.',
    facts: [
      ['TAMPER TEST', '1-Click Simulation in Laptop 2'],
      ['DETECTION RATE', '100% Mathematical Proof'],
      ['FALSE POSITIVES', '0.00% Zero-Trust'],
    ],
    metric: {
      label: 'attack detection',
      value: 100,
      countFrom: 0,
      decimals: 0,
      unit: '%',
      sub: 'Instant hash mismatch fraud rejection',
    },
    formula: {
      symbol: 'Verify',
      expression: 'Hash(Record_DB) == Hash_Chain ⟹ OK',
      explanation: 'Mathematical fraud barrier protects patient history',
    },
    camera: { fx: 360, fy: 120, zoom: 1.3 },
    activeNodes: ['doctor', 'blockchain', 'nodeA'],
  },
  {
    id: 'ecosystem',
    num: '08',
    tag: 'THE 3-DEVICE ECOSYSTEM',
    kicker: 'LIVE ACADEMIC DEMONSTRATION SUITE',
    title: ['Three devices. One mesh.', 'Zero cloud sovereignty.'],
    body: 'The complete architecture demonstrated live: Laptop 1 registers patients and processes ₹500 appointments; Laptop 2 provides the doctor clinical EMR and monitors the live blockchain; Device 3 simulates the roadside paramedic emergency scan.',
    facts: [
      ['LAPTOP 1', 'Patient Booking & Token Issuance'],
      ['LAPTOP 2', 'Doctor Station & Blockchain Monitor'],
      ['DEVICE 3', 'Roadside Mobile Optical Triage'],
    ],
    metric: {
      label: 'demonstration nodes',
      value: 3,
      countFrom: 1,
      decimals: 0,
      unit: 'devices',
      sub: 'Simultaneous private network pipeline',
    },
    formula: {
      symbol: 'Mesh_All',
      expression: '{ Laptop_1, Laptop_2, Mobile_3 } ∈ ESP32',
      explanation: 'Fully integrated end-to-end academic demo',
    },
    camera: { fx: 60, fy: 0, zoom: 0.95 },
    activeNodes: ['ambulance', 'card', 'esp32', 'doctor', 'nodeA', 'nodeB', 'blockchain'],
  },
];

// =========================================================================
// ISOMETRIC STAGE COMPONENT (PURE SCROLL-DRIVEN SCROLLYTELLING)
// =========================================================================
export default function IsometricStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrollFraction, setScrollFraction] = useState(0);

  // Smooth Camera State
  const [cam, setCam] = useState(MEDIQR_CHAPTERS[0].camera);
  const animRef = useRef<number | null>(null);

  const activeChapter = MEDIQR_CHAPTERS[currentIdx];

  // Animated Counter Value
  const [displayedMetric, setDisplayedMetric] = useState(activeChapter.metric.countFrom);

  // Pure scroll listener mapping vertical scroll position through 480vh container
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalDist = el.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      // Progress 0 to 1 as user scrolls through container
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalDist));
      setScrollFraction(progress);

      const totalChapters = MEDIQR_CHAPTERS.length;
      const chIndex = Math.min(Math.floor(progress * totalChapters), totalChapters - 1);
      setCurrentIdx(chIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth camera spring interpolation toward active chapter target
  useEffect(() => {
    const target = activeChapter.camera;
    let startTime: number | null = null;
    const startCam = { ...cam };
    const duration = 650; // ms

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = easeInOut(progress);

      setCam({
        fx: lerp(startCam.fx, target.fx, ease),
        fy: lerp(startCam.fy, target.fy, ease),
        zoom: lerp(startCam.zoom, target.zoom, ease),
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currentIdx]);

  // Metric count-up animation
  useEffect(() => {
    const fromVal = activeChapter.metric.countFrom;
    const toVal = activeChapter.metric.value;
    const startTime = performance.now();
    const duration = 600;

    let frameId: number;
    function countStep(now: number) {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = easeInOut(elapsed);
      const cur = lerp(fromVal, toVal, eased);
      setDisplayedMetric(cur);

      if (elapsed < 1) {
        frameId = requestAnimationFrame(countStep);
      }
    }

    frameId = requestAnimationFrame(countStep);
    return () => cancelAnimationFrame(frameId);
  }, [currentIdx]);

  return (
    // Outer scroll container: 480vh tall so scrolling drives the camera & story
    <div
      ref={containerRef}
      className="relative w-full bg-slate-950 border-y border-white/10"
      style={{ height: '480vh' }}
    >
      {/* Sticky Fullscreen Presentation Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
        
        {/* Top Minimalist Header & Progress Indicator */}
        <div className="flex items-center justify-between z-20 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
              CHAPTER {activeChapter.num} OF 08 · {activeChapter.tag}
            </span>
          </div>

          {/* Slim Scroll Progress Line */}
          <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
            <span className="hidden sm:inline">Scroll to Navigate Architecture</span>
            <div className="w-32 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${Math.round(scrollFraction * 100)}%` }}
              />
            </div>
            <span className="text-cyan-300 font-bold">{Math.round(scrollFraction * 100)}%</span>
          </div>
        </div>

        {/* Center Grid: Left 3D Isometric Canvas, Right Telemetry Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 my-auto py-2">
          
          {/* =========================================================================
              LEFT: 3D ISOMETRIC VECTOR STAGE (WITH TEXTURES & SILKSCREEN LABELS)
          ========================================================================= */}
          <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900/90 border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
            
            {/* Ambient Lighting Gradients */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <svg viewBox="0 0 1200 800" className="w-full h-full">
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Dynamic Camera Group */}
              <g
                transform={`
                  translate(600, 400)
                  scale(${cam.zoom})
                  translate(${-STAGE_CX - cam.fx}, ${-STAGE_CY - cam.fy})
                `}
              >
                {/* Floor Grid Lines */}
                <g opacity="0.25">
                  {[-600, -400, -200, 0, 200, 400, 600].map((x) => (
                    <path
                      key={`gx-${x}`}
                      d={isoPath([iso(x, -500, 0), iso(x, 500, 0)], false)}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      fill="none"
                    />
                  ))}
                  {[-500, -300, -100, 100, 300, 500].map((y) => (
                    <path
                      key={`gy-${y}`}
                      d={isoPath([iso(-600, y, 0), iso(600, y, 0)], false)}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      fill="none"
                    />
                  ))}
                </g>

                {/* Laser Conduits */}
                <g>
                  {/* Ambulance to Card */}
                  <path
                    d={`M ${iso(-340, -85, 80)[0]} ${iso(-340, -85, 80)[1]} L ${iso(-135, -20, 90)[0]} ${iso(-135, -20, 90)[1]}`}
                    stroke={activeChapter.activeNodes.includes('ambulance') ? '#10b981' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                  />
                  {/* Card to ESP32 */}
                  <path
                    d={`M ${iso(-135, -20, 90)[0]} ${iso(-135, -20, 90)[1]} L ${iso(90, 75, 70)[0]} ${iso(90, 75, 70)[1]}`}
                    stroke={activeChapter.activeNodes.includes('card') ? '#38bdf8' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                  />
                  {/* ESP32 to Doctor */}
                  <path
                    d={`M ${iso(90, 75, 70)[0]} ${iso(90, 75, 70)[1]} L ${iso(305, 125, 80)[0]} ${iso(305, 125, 80)[1]}`}
                    stroke={activeChapter.activeNodes.includes('esp32') ? '#818cf8' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                  />
                  {/* Doctor to Nodes */}
                  <path
                    d={`M ${iso(305, 125, 80)[0]} ${iso(305, 125, 80)[1]} L ${iso(275, -105, 120)[0]} ${iso(275, -105, 120)[1]}`}
                    stroke={activeChapter.activeNodes.includes('nodeA') ? '#06b6d4' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                  />
                  {/* Nodes to Blockchain */}
                  <path
                    d={`M ${iso(415, -105, 120)[0]} ${iso(415, -105, 120)[1]} L ${iso(540, 110, 100)[0]} ${iso(540, 110, 100)[1]}`}
                    stroke={activeChapter.activeNodes.includes('blockchain') ? '#f59e0b' : '#334155'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    fill="none"
                  />
                </g>

                {/* ===================================================================
                    NODE 1: AMBULANCE 04 (ROADSIDE COLLISION SCENE)
                =================================================================== */}
                <g opacity={activeChapter.activeNodes.includes('ambulance') ? 1 : 0.45}>
                  {/* Road Base Surface */}
                  <path
                    d={isoPath([iso(-460, -180, 0), iso(-260, -180, 0), iso(-260, -80, 0), iso(-460, -80, 0)])}
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  {/* Road Stripe */}
                  <path
                    d={isoPath([iso(-450, -130, 1), iso(-270, -130, 1)], false)}
                    stroke="#eab308"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    fill="none"
                  />

                  {/* Vehicle Body Box */}
                  <path
                    d={isoPath([iso(-420, -140, 0), iso(-260, -140, 0), iso(-260, -140, 90), iso(-420, -140, 90)])}
                    fill="#1e293b"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(-260, -140, 0), iso(-260, -40, 0), iso(-260, -40, 90), iso(-260, -140, 90)])}
                    fill="#0f172a"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(-420, -140, 90), iso(-260, -140, 90), iso(-260, -40, 90), iso(-420, -40, 90)])}
                    fill="#334155"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />

                  {/* Red Cross Medical Insignia */}
                  <path
                    d={`M ${iso(-340, -140, 55)[0]} ${iso(-340, -140, 55)[1]} L ${iso(-340, -140, 75)[0]} ${iso(-340, -140, 75)[1]}`}
                    stroke="#ef4444"
                    strokeWidth="5"
                    strokeLinecap="square"
                  />
                  <path
                    d={`M ${iso(-350, -140, 65)[0]} ${iso(-350, -140, 65)[1]} L ${iso(-330, -140, 65)[0]} ${iso(-330, -140, 65)[1]}`}
                    stroke="#ef4444"
                    strokeWidth="5"
                    strokeLinecap="square"
                  />

                  {/* Flashing Emergency Siren Beacon */}
                  <circle
                    cx={iso(-340, -90, 95)[0]}
                    cy={iso(-340, -90, 95)[1]}
                    r="4"
                    fill="#ef4444"
                    className="animate-ping"
                  />
                  <circle
                    cx={iso(-340, -90, 95)[0]}
                    cy={iso(-340, -90, 95)[1]}
                    r="3"
                    fill="#ef4444"
                  />

                  {/* Silkscreen Text */}
                  <text
                    x={iso(-390, -140, 30)[0]}
                    y={iso(-390, -140, 30)[1]}
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    AMBULANCE 04 · NH-48
                  </text>
                  <text
                    x={iso(-390, -140, 18)[0]}
                    y={iso(-390, -140, 18)[1]}
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="var(--font-mono)"
                  >
                    STATUS: UNCONSCIOUS VICTIM
                  </text>
                </g>

                {/* ===================================================================
                    NODE 2: MEDIQR TITANIUM KEYCARD & WRISTBAND
                =================================================================== */}
                <g opacity={activeChapter.activeNodes.includes('card') ? 1 : 0.45}>
                  {/* Card Main Block */}
                  <path
                    d={isoPath([iso(-200, -70, 0), iso(-70, -70, 0), iso(-70, -70, 120), iso(-200, -70, 120)])}
                    fill="#0f172a"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(-70, -70, 0), iso(-70, 30, 0), iso(-70, 30, 120), iso(-70, -70, 120)])}
                    fill="#020617"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(-200, -70, 120), iso(-70, -70, 120), iso(-70, 30, 120), iso(-200, 30, 120)])}
                    fill="#1e293b"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />

                  {/* Laser-Etched Micro-QR Matrix Texture */}
                  {/* Top-left finder */}
                  <rect
                    x={iso(-170, -40, 120)[0]}
                    y={iso(-170, -40, 120)[1] - 8}
                    width="10"
                    height="10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={iso(-170, -40, 120)[0] + 3}
                    y={iso(-170, -40, 120)[1] - 5}
                    width="4"
                    height="4"
                    fill="#10b981"
                  />
                  {/* Top-right finder */}
                  <rect
                    x={iso(-110, -40, 120)[0]}
                    y={iso(-110, -40, 120)[1] - 8}
                    width="10"
                    height="10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={iso(-110, -40, 120)[0] + 3}
                    y={iso(-110, -40, 120)[1] - 5}
                    width="4"
                    height="4"
                    fill="#10b981"
                  />

                  {/* Silkscreen Text on Front Face */}
                  <text
                    x={iso(-190, -70, 95)[0]}
                    y={iso(-190, -70, 95)[1]}
                    fill="#10b981"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    MEDIQR TITANIUM KEY
                  </text>
                  <text
                    x={iso(-190, -70, 80)[0]}
                    y={iso(-190, -70, 80)[1]}
                    fill="#ffffff"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                  >
                    BLOOD: B+ · ALLERGY: PENICILLIN
                  </text>
                  <text
                    x={iso(-190, -70, 65)[0]}
                    y={iso(-190, -70, 65)[1]}
                    fill="#64748b"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    SEC: HMAC-SHA256 (32B SALT)
                  </text>
                  <text
                    x={iso(-190, -70, 50)[0]}
                    y={iso(-190, -70, 50)[1]}
                    fill="#38bdf8"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    LATENCY: 0.018s · ZERO CLOUD
                  </text>
                </g>

                {/* ===================================================================
                    NODE 3: ESP32 SOVEREIGN HARDWARE ROUTER
                =================================================================== */}
                <g opacity={activeChapter.activeNodes.includes('esp32') ? 1 : 0.45}>
                  {/* PCB Body */}
                  <path
                    d={isoPath([iso(20, 20, 0), iso(160, 20, 0), iso(160, 20, 70), iso(20, 20, 70)])}
                    fill="#042f2e"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(160, 20, 0), iso(160, 130, 0), iso(160, 130, 70), iso(160, 20, 70)])}
                    fill="#022c22"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(20, 20, 70), iso(160, 20, 70), iso(160, 130, 70), iso(20, 130, 70)])}
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />

                  {/* Serpentine PCB Wi-Fi Antenna Trace */}
                  <path
                    d={`M ${iso(30, 30, 70)[0]} ${iso(30, 30, 70)[1]} l 6 -4 l 6 4 l 6 -4 l 6 4 l 6 -4`}
                    stroke="#eab308"
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Microchip Die Box */}
                  <rect
                    x={iso(70, 60, 70)[0] - 12}
                    y={iso(70, 60, 70)[1] - 8}
                    width="28"
                    height="20"
                    fill="#020617"
                    stroke="#64748b"
                    strokeWidth="1"
                    rx="2"
                  />

                  {/* Smart Blue Status LED (Solid when 3 devices connected) */}
                  <circle
                    cx={iso(135, 35, 70)[0]}
                    cy={iso(135, 35, 70)[1]}
                    r="4"
                    fill="#38bdf8"
                    className="animate-pulse"
                  />
                  <circle
                    cx={iso(135, 35, 70)[0]}
                    cy={iso(135, 35, 70)[1]}
                    r="2.5"
                    fill="#ffffff"
                  />

                  {/* Silkscreen Text */}
                  <text
                    x={iso(35, 20, 48)[0]}
                    y={iso(35, 20, 48)[1]}
                    fill="#38bdf8"
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    ESP32-D0WD-V3 GATEWAY
                  </text>
                  <text
                    x={iso(35, 20, 34)[0]}
                    y={iso(35, 20, 34)[1]}
                    fill="#ffffff"
                    fontSize="7.5"
                    fontFamily="var(--font-mono)"
                  >
                    SSID: MediQR-Secure-Net
                  </text>
                  <text
                    x={iso(35, 20, 20)[0]}
                    y={iso(35, 20, 20)[1]}
                    fill="#94a3b8"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    IP: 192.168.4.1 (AIR-GAPPED)
                  </text>
                </g>

                {/* ===================================================================
                    NODE 4: DOCTOR CLINICAL WORKSTATION (LAPTOP 2)
                =================================================================== */}
                <g opacity={activeChapter.activeNodes.includes('doctor') ? 1 : 0.45}>
                  {/* Desk / Station Block */}
                  <path
                    d={isoPath([iso(230, 70, 0), iso(380, 70, 0), iso(380, 70, 75), iso(230, 70, 75)])}
                    fill="#1e1e2f"
                    stroke="#818cf8"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(380, 70, 0), iso(380, 180, 0), iso(380, 180, 75), iso(380, 70, 75)])}
                    fill="#0f0f1c"
                    stroke="#818cf8"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(230, 70, 75), iso(380, 70, 75), iso(380, 180, 75), iso(230, 180, 75)])}
                    fill="#2a2a44"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                  />

                  {/* Dual Monitor Displays on Desk */}
                  <path
                    d={isoPath([iso(250, 90, 75), iso(320, 90, 75), iso(320, 90, 130), iso(250, 90, 130)])}
                    fill="#020617"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  {/* ECG Rhythm Waveform on Screen */}
                  <path
                    d={`M ${iso(255, 90, 100)[0]} ${iso(255, 90, 100)[1]} l 8 0 l 3 -8 l 4 14 l 3 -10 l 4 4 l 8 0`}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Stethoscope Accent */}
                  <circle
                    cx={iso(350, 130, 75)[0]}
                    cy={iso(350, 130, 75)[1]}
                    r="4"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="1.2"
                  />

                  {/* Silkscreen Text */}
                  <text
                    x={iso(245, 70, 50)[0]}
                    y={iso(245, 70, 50)[1]}
                    fill="#818cf8"
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    DOCTOR EMR WORKSTATION
                  </text>
                  <text
                    x={iso(245, 70, 36)[0]}
                    y={iso(245, 70, 36)[1]}
                    fill="#ffffff"
                    fontSize="7.5"
                    fontFamily="var(--font-mono)"
                  >
                    LAPTOP 2 :3000/doctor
                  </text>
                  <text
                    x={iso(245, 70, 22)[0]}
                    y={iso(245, 70, 22)[1]}
                    fill="#34d399"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    AES-256 CLINICAL VAULT: UNLOCKED
                  </text>
                </g>

                {/* ===================================================================
                    NODE 5 & 6: HOSPITAL STORAGE VAULTS (APOLLO & FORTIS SERVER RACKS)
                =================================================================== */}
                {/* Node A (Apollo) */}
                <g opacity={activeChapter.activeNodes.includes('nodeA') ? 1 : 0.45}>
                  <path
                    d={isoPath([iso(220, -150, 0), iso(330, -150, 0), iso(330, -150, 160), iso(220, -150, 160)])}
                    fill="#082f49"
                    stroke="#06b6d4"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(330, -150, 0), iso(330, -60, 0), iso(330, -60, 160), iso(330, -150, 160)])}
                    fill="#031f33"
                    stroke="#06b6d4"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(220, -150, 160), iso(330, -150, 160), iso(330, -60, 160), iso(220, -60, 160)])}
                    fill="#0e3f61"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                  />

                  {/* Drive Bay Slots & LED Activity */}
                  {[30, 60, 90, 120].map((h) => (
                    <g key={`bay-a-${h}`}>
                      <path
                        d={isoPath([iso(230, -150, h), iso(320, -150, h)], false)}
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx={iso(235, -150, h)[0]} cy={iso(235, -150, h)[1]} r="1.8" fill="#38bdf8" />
                    </g>
                  ))}

                  <text
                    x={iso(230, -150, 145)[0]}
                    y={iso(230, -150, 145)[1]}
                    fill="#38bdf8"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    APOLLO VAULT (:5001)
                  </text>
                  <text
                    x={iso(230, -150, 15)[0]}
                    y={iso(230, -150, 15)[1]}
                    fill="#94a3b8"
                    fontSize="6.5"
                    fontFamily="var(--font-mono)"
                  >
                    ENC AT REST: AES-256
                  </text>
                </g>

                {/* Node B (Fortis) */}
                <g opacity={activeChapter.activeNodes.includes('nodeB') ? 1 : 0.45}>
                  <path
                    d={isoPath([iso(360, -150, 0), iso(470, -150, 0), iso(470, -150, 160), iso(360, -150, 160)])}
                    fill="#172554"
                    stroke="#3b82f6"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(470, -150, 0), iso(470, -60, 0), iso(470, -60, 160), iso(470, -150, 160)])}
                    fill="#0f172a"
                    stroke="#3b82f6"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(360, -150, 160), iso(470, -150, 160), iso(470, -60, 160), iso(360, -60, 160)])}
                    fill="#1e3a8a"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                  />

                  {/* Drive Bays */}
                  {[30, 60, 90, 120].map((h) => (
                    <g key={`bay-b-${h}`}>
                      <path
                        d={isoPath([iso(370, -150, h), iso(460, -150, h)], false)}
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx={iso(375, -150, h)[0]} cy={iso(375, -150, h)[1]} r="1.8" fill="#60a5fa" />
                    </g>
                  ))}

                  <text
                    x={iso(370, -150, 145)[0]}
                    y={iso(370, -150, 145)[1]}
                    fill="#60a5fa"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    FORTIS VAULT (:5002)
                  </text>
                  <text
                    x={iso(370, -150, 15)[0]}
                    y={iso(370, -150, 15)[1]}
                    fill="#94a3b8"
                    fontSize="6.5"
                    fontFamily="var(--font-mono)"
                  >
                    DECOUPLED CONSORTIUM
                  </text>
                </g>

                {/* ===================================================================
                    NODE 7: ETHEREUM CONSORTIUM BLOCKCHAIN LEDGER
                =================================================================== */}
                <g opacity={activeChapter.activeNodes.includes('blockchain') ? 1 : 0.45}>
                  {/* Block 1 */}
                  <path
                    d={isoPath([iso(460, 50, 0), iso(530, 50, 0), iso(530, 50, 65), iso(460, 50, 65)])}
                    fill="#451a03"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(530, 50, 0), iso(530, 110, 0), iso(530, 110, 65), iso(530, 50, 65)])}
                    fill="#291002"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(460, 50, 65), iso(530, 50, 65), iso(530, 110, 65), iso(460, 110, 65)])}
                    fill="#78350f"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />

                  {/* Block 2 (Chained above) */}
                  <path
                    d={isoPath([iso(500, 70, 75), iso(580, 70, 75), iso(580, 70, 145), iso(500, 70, 145)])}
                    fill="#78350f"
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(580, 70, 75), iso(580, 140, 75), iso(580, 140, 145), iso(580, 70, 145)])}
                    fill="#451a03"
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                  />
                  <path
                    d={isoPath([iso(500, 70, 145), iso(580, 70, 145), iso(580, 140, 145), iso(500, 140, 145)])}
                    fill="#b45309"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  />

                  {/* Cryptographic Laser Chain linking Block 1 & 2 */}
                  <path
                    d={`M ${iso(495, 80, 65)[0]} ${iso(495, 80, 65)[1]} L ${iso(500, 70, 75)[0]} ${iso(500, 70, 75)[1]}`}
                    stroke="#fbbf24"
                    strokeWidth="3"
                  />

                  {/* Silkscreen Blockchain Text */}
                  <text
                    x={iso(505, 70, 125)[0]}
                    y={iso(505, 70, 125)[1]}
                    fill="#ffffff"
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    CONSORTIUM BLOCK #04
                  </text>
                  <text
                    x={iso(505, 70, 110)[0]}
                    y={iso(505, 70, 110)[1]}
                    fill="#fef08a"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    PREV: 0x9f4a...3d72
                  </text>
                  <text
                    x={iso(505, 70, 95)[0]}
                    y={iso(505, 70, 95)[1]}
                    fill="#94a3b8"
                    fontSize="6.5"
                    fontFamily="var(--font-mono)"
                  >
                    SHA-256 HASH CHAIN: VALID
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* =========================================================================
              RIGHT: CARBO-TRACE STYLE TELEMETRY & NARRATIVE HUD
          ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Chapter Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/30">
                  CHAPTER {activeChapter.num} / 08
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {activeChapter.kicker}
                </span>
              </div>

              {/* Kinetic Two-Line Headline */}
              <div className="space-y-1 pt-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeChapter.title[0]}
                </h3>
                <h4 className="text-xl sm:text-2xl font-extrabold text-cyan-400 tracking-tight">
                  {activeChapter.title[1]}
                </h4>
              </div>

              {/* Narrative Story Body */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {activeChapter.body}
              </p>
            </div>

            {/* Live Animated Metric Counter Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {activeChapter.metric.label}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  ● Real-Time Telemetry
                </span>
              </div>

              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {displayedMetric.toFixed(activeChapter.metric.decimals)}
                </span>
                <span className="text-lg font-bold text-cyan-400">
                  {activeChapter.metric.unit}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/10">
                {activeChapter.metric.sub}
              </div>
            </div>

            {/* Scientific Formula & Facts Matrix */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs text-slate-300 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Scientific Verification Formula
                </div>
                <div className="text-cyan-300 font-bold select-all">
                  {activeChapter.formula.expression}
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeChapter.formula.explanation}
                </div>
              </div>

              {/* 3 Facts Badges */}
              <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                {activeChapter.facts.map(([k, v], idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/40 border border-white/5"
                  >
                    <span className="text-slate-400">{k}</span>
                    <span className="text-white font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Status Ticker */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">● 3D Physics &amp; Projection Engine Active</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">Scroll Down to Advance</span>
          </div>
          <div>
            Camera Target: <strong className="text-white">{activeChapter.tag}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
