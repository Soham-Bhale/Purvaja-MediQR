'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// =========================================================================
// ISOMETRIC 3D MATHEMATICAL PROJECTION ENGINE
// =========================================================================
const COS30 = Math.cos(Math.PI / 6); // ~0.866025
const SIN30 = 0.5;
const STAGE_CX = 620;
const STAGE_CY = 480;

// Converts 3D Cartesian (x, y, z) into 2.5D Isometric Screen Coordinates (sx, sy)
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

// Cubic smoothing for camera easing: t in [0, 1]
function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// =========================================================================
// CHAPTERS: THE 8-STAGE SCROLLYTELLING ODYSSEY
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
// ISOMETRIC NODE DEFINITIONS
// =========================================================================
interface IsoNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  color: string;
  badge: string;
}

const NODES: IsoNode[] = [
  {
    id: 'ambulance',
    label: 'Roadside Trauma Scene',
    sub: 'Ambulance 04 · NH-48',
    x: -420,
    y: -140,
    w: 160,
    d: 110,
    h: 120,
    color: '#ef4444',
    badge: '0.02s TRIAGE',
  },
  {
    id: 'card',
    label: 'MediQR Titanium Card',
    sub: 'High-Density Micro-QR',
    x: -200,
    y: -70,
    w: 130,
    d: 100,
    h: 140,
    color: '#10b981',
    badge: 'DUAL-SEGMENT',
  },
  {
    id: 'esp32',
    label: 'ESP32 Hardware Router',
    sub: 'Gateway 192.168.4.1',
    x: 20,
    y: 20,
    w: 140,
    d: 110,
    h: 110,
    color: '#38bdf8',
    badge: 'SOVEREIGN MESH',
  },
  {
    id: 'doctor',
    label: 'Doctor Workstation',
    sub: 'Laptop 2 Terminal (:3000)',
    x: 230,
    y: 70,
    w: 150,
    d: 110,
    h: 130,
    color: '#818cf8',
    badge: 'CLINICAL EMR',
  },
  {
    id: 'nodeA',
    label: 'Hospital Node A',
    sub: 'Apollo Health (:5001)',
    x: 220,
    y: -150,
    w: 110,
    d: 90,
    h: 180,
    color: '#06b6d4',
    badge: 'VAULT A',
  },
  {
    id: 'nodeB',
    label: 'Hospital Node B',
    sub: 'Fortis Health (:5002)',
    x: 360,
    y: -150,
    w: 110,
    d: 90,
    h: 180,
    color: '#3b82f6',
    badge: 'VAULT B',
  },
  {
    id: 'blockchain',
    label: 'Ethereum Ledger',
    sub: 'Consortium Blocks (:3000)',
    x: 460,
    y: 50,
    w: 160,
    d: 120,
    h: 150,
    color: '#f59e0b',
    badge: 'CONSENSUS',
  },
];

// Conduits / Optical Laser Lines connecting the nodes
interface Conduit {
  id: string;
  from: string;
  to: string;
  color: string;
  pulseSpeed: string;
}

const CONDUITS: Conduit[] = [
  { id: 'amb-card', from: 'ambulance', to: 'card', color: '#10b981', pulseSpeed: '2s' },
  { id: 'card-esp', from: 'card', to: 'esp32', color: '#38bdf8', pulseSpeed: '1.8s' },
  { id: 'esp-doc', from: 'esp32', to: 'doctor', color: '#818cf8', pulseSpeed: '1.6s' },
  { id: 'doc-nodeA', from: 'doctor', to: 'nodeA', color: '#06b6d4', pulseSpeed: '2.2s' },
  { id: 'doc-nodeB', from: 'doctor', to: 'nodeB', color: '#3b82f6', pulseSpeed: '2.2s' },
  { id: 'doc-chain', from: 'doctor', to: 'blockchain', color: '#f59e0b', pulseSpeed: '1.4s' },
  { id: 'nodes-chain', from: 'nodeB', to: 'blockchain', color: '#f59e0b', pulseSpeed: '1.9s' },
];

// =========================================================================
// ISOMETRIC STAGE COMPONENT
// =========================================================================
export default function IsometricStage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Smooth Interpolated Camera State
  const [cam, setCam] = useState({ fx: -380, fy: -140, zoom: 1.35 });
  const animRef = useRef<number | null>(null);

  const activeChapter = MEDIQR_CHAPTERS[currentIdx];

  // Animated Counter Value
  const [displayedMetric, setDisplayedMetric] = useState(activeChapter.metric.countFrom);

  // Keyboard navigation: 1-8 keys, left/right arrows, space to toggle autoplay
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '1' && e.key <= '8') {
        const num = parseInt(e.key, 10) - 1;
        if (num >= 0 && num < MEDIQR_CHAPTERS.length) {
          setCurrentIdx(num);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentIdx((prev) => (prev + 1) % MEDIQR_CHAPTERS.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentIdx((prev) => (prev - 1 + MEDIQR_CHAPTERS.length) % MEDIQR_CHAPTERS.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Autoplay timer: advances chapter every 6.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % MEDIQR_CHAPTERS.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Smooth camera spring interpolation toward active chapter target
  useEffect(() => {
    const target = activeChapter.camera;
    let startTime: number | null = null;
    const startCam = { ...cam };
    const duration = 950; // ms

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
    const duration = 850;

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

  // Compute node center points for conduit lasers
  const nodeCenters = useMemo(() => {
    const map = new Map<string, [number, number]>();
    NODES.forEach((node) => {
      const topCenter = iso(node.x + node.w / 2, node.y + node.d / 2, node.h);
      map.set(node.id, topCenter);
    });
    return map;
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 border-y border-white/10 select-none py-12 lg:py-16">
      
      {/* Background Ambience & Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header: Carbo-Trace Style Kicker & Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Interactive Isometric Cyber-Physical Stage
            </span>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
              SVG 2.5D Vector Projection · Zero GPU Load
            </span>
          </div>

          {/* Autoplay & Quick Jump Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
                isAutoPlaying
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{isAutoPlaying ? '⏸ Auto Tour ON' : '▶ Auto Tour'}</span>
            </button>

            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-mono text-slate-400">
              <span>Keys</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-slate-200 border border-white/10">1</kbd>
              <span>-</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-slate-200 border border-white/10">8</kbd>
              <span>/</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-slate-200 border border-white/10">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-slate-200 border border-white/10">→</kbd>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STAGE VIEWPORT & SPLIT INTERACTION HUD
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: 3D Vector Isometric Projection Canvas (SVG) */}
          <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900/90 border border-cyan-500/20 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
            
            {/* Ambient Radial Backlights */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* SVG Camera Viewport */}
            <svg
              viewBox="0 0 1200 800"
              className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75"
            >
              <defs>
                {/* Glowing Laser Conduit Filter */}
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="laser-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Virtual Camera Transform Group */}
              <g
                transform={`
                  translate(600, 400)
                  scale(${cam.zoom})
                  translate(${-STAGE_CX - cam.fx}, ${-STAGE_CY - cam.fy})
                `}
              >
                {/* Ground Foundation Grid / Isometric Cyber Floor */}
                <g opacity="0.35">
                  {[-600, -400, -200, 0, 200, 400, 600].map((x) => (
                    <path
                      key={`grid-x-${x}`}
                      d={isoPath([iso(x, -500, 0), iso(x, 500, 0)], false)}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      fill="none"
                    />
                  ))}
                  {[-500, -300, -100, 100, 300, 500].map((y) => (
                    <path
                      key={`grid-y-${y}`}
                      d={isoPath([iso(-600, y, 0), iso(600, y, 0)], false)}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      fill="none"
                    />
                  ))}
                </g>

                {/* Laser Conduits & Flowing Packets */}
                <g>
                  {CONDUITS.map((cond) => {
                    const p1 = nodeCenters.get(cond.from);
                    const p2 = nodeCenters.get(cond.to);
                    if (!p1 || !p2) return null;

                    const isActive =
                      activeChapter.activeNodes.includes(cond.from) &&
                      activeChapter.activeNodes.includes(cond.to);

                    return (
                      <g key={cond.id}>
                        {/* Static Base Conduit */}
                        <path
                          d={`M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`}
                          stroke={isActive ? cond.color : '#334155'}
                          strokeWidth={isActive ? '2.5' : '1.2'}
                          opacity={isActive ? 0.9 : 0.3}
                          strokeDasharray={isActive ? '8 4' : 'none'}
                          filter={isActive ? 'url(#neon-glow)' : undefined}
                          fill="none"
                        />
                        {/* Animated Travelling Laser Packet */}
                        {isActive && (
                          <circle r="4.5" fill="#ffffff" filter="url(#neon-glow)">
                            <animateMotion
                              path={`M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`}
                              dur={cond.pulseSpeed}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* 3D Extruded Isometric Hardware & Software Nodes */}
                {NODES.map((node) => {
                  const isActive = activeChapter.activeNodes.includes(node.id);
                  const isHovered = hoveredNode === node.id;

                  // 8 Vertices of the 3D Isometric Box
                  const p0 = iso(node.x, node.y, 0);
                  const p1 = iso(node.x + node.w, node.y, 0);
                  const p2 = iso(node.x + node.w, node.y + node.d, 0);
                  const p3 = iso(node.x, node.y + node.d, 0);

                  const t0 = iso(node.x, node.y, node.h);
                  const t1 = iso(node.x + node.w, node.y, node.h);
                  const t2 = iso(node.x + node.w, node.y + node.d, node.h);
                  const t3 = iso(node.x, node.y + node.d, node.h);

                  // Colors
                  const topFill = isActive ? '#1e293b' : '#0f172a';
                  const leftFill = isActive ? '#0f172a' : '#020617';
                  const rightFill = isActive ? '#1e293b' : '#090d16';
                  const strokeColor = isActive ? node.color : '#334155';

                  return (
                    <g
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer transition-all duration-300"
                    >
                      {/* Left Face */}
                      <path
                        d={isoPath([p3, p2, t2, t3])}
                        fill={leftFill}
                        stroke={strokeColor}
                        strokeWidth="1.2"
                      />

                      {/* Right Face */}
                      <path
                        d={isoPath([p1, p2, t2, t1])}
                        fill={rightFill}
                        stroke={strokeColor}
                        strokeWidth="1.2"
                      />

                      {/* Top Face */}
                      <path
                        d={isoPath([t0, t1, t2, t3])}
                        fill={topFill}
                        stroke={strokeColor}
                        strokeWidth={isActive ? '2' : '1.2'}
                        filter={isActive ? 'url(#neon-glow)' : undefined}
                      />

                      {/* Internal Isometric Accents & LED Indicators */}
                      <circle
                        cx={t2[0] - 12}
                        cy={t2[1] - 8}
                        r="3"
                        fill={isActive ? node.color : '#475569'}
                        className={isActive ? 'animate-ping' : ''}
                      />
                      <circle
                        cx={t2[0] - 12}
                        cy={t2[1] - 8}
                        r="2.5"
                        fill={isActive ? node.color : '#475569'}
                      />

                      {/* Floating HUD Node Label */}
                      <g transform={`translate(${t2[0] - 40}, ${t2[1] - 32})`}>
                        <rect
                          x="0"
                          y="0"
                          width="110"
                          height="24"
                          rx="6"
                          fill="#020617"
                          fillOpacity="0.88"
                          stroke={isActive ? node.color : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          x="55"
                          y="16"
                          textAnchor="middle"
                          fill={isActive ? '#ffffff' : '#94a3b8'}
                          fontSize="9.5"
                          fontFamily="ui-monospace, monospace"
                          fontWeight="bold"
                        >
                          {node.badge}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Bottom HUD Overlay: Node Info Tooltip */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Camera Target: <strong>{activeChapter.tag}</strong></span>
                <span className="text-slate-500">|</span>
                <span>Zoom: {cam.zoom.toFixed(2)}x</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-400">
                <span>Active Nodes: {activeChapter.activeNodes.join(' ⇄ ')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Carbo-Trace Style Dynamic Telemetry & Story Panel */}
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
              {/* Formula Strip */}
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

            {/* Chapter Stepper Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() =>
                  setCurrentIdx((prev) => (prev - 1 + MEDIQR_CHAPTERS.length) % MEDIQR_CHAPTERS.length)
                }
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition"
              >
                ← Prev Chapter
              </button>
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => (prev + 1) % MEDIQR_CHAPTERS.length)}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/30"
              >
                Next Chapter →
              </button>
            </div>

          </div>

        </div>

        {/* =========================================================================
            BOTTOM: CARBO-TRACE STYLE TIMELINE SCRUBBER (CHAPTERS 01-08)
        ========================================================================= */}
        <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-3 sm:p-4 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {MEDIQR_CHAPTERS.map((ch, idx) => {
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`p-2.5 rounded-xl text-left transition flex flex-col justify-between border cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isCurrent ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {ch.num}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-[11px] font-bold truncate mt-1">
                    {ch.tag}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
