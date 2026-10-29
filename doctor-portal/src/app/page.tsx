'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import AssetPromptModal from '../components/AssetPromptModal';
import EmailInboxModal from '../components/EmailInboxModal';

/* ─────────────────────────────────────────────────────────────────────────────
   MEDIQR CARBOTRACE-GRADE SCROLLYTELLING ENGINE v2.5
   Zero-Trust Emergency Healthcare Consortium Architecture
   8 Interactive Chapters driven by native scroll progress & camera panning.
   ───────────────────────────────────────────────────────────────────────────── */

interface StoryChapter {
  id: string;
  tag: string;
  kicker: string;
  title: string[];
  body: string;
  facts: [string, string][];
  metric: {
    label: string;
    value: number;
    countFrom: number;
    decimals: number;
    unit: string;
    sub: string;
  };
  formula: {
    equation: string;
    value: string;
    scope: string;
    terms: string[];
  };
  camera: { fx: number; fy: number; zoom: number };
  cta?: boolean;
}

const STORY: StoryChapter[] = [
  {
    id: '01',
    tag: 'THE COLLISION',
    kicker: 'TRAUMA TRIAGE · UNCONSCIOUS VICTIM',
    title: ['When seconds mean survival.', 'Traditional care fails.'],
    body: 'An unconscious victim is found at a roadside accident with no identification. Paramedics face the fatal paradox: administering penicillin or transfusing conflicting blood type triggers fatal anaphylaxis. The 45-minute centralized cloud hospital query delay is deadly.',
    facts: [
      ['VICTIM STATE', 'Unconscious / No ID'],
      ['ER CLOUD DELAY', '25–45 minutes'],
      ['GLOBAL FATALITIES', '250,000+ / yr'],
    ],
    metric: {
      label: 'triage delay',
      value: 43.5,
      countFrom: 12.0,
      decimals: 1,
      unit: 'min',
      sub: 'Standard cloud database lookup',
    },
    formula: {
      equation: 'FATAL_RISK = (ER_Delay × Drug_Conflict) / Identity_Proof',
      value: '43.5 min',
      scope: 'unconscious patient · missing wallet · central server blackout',
      terms: ['Delay 43.5m', 'Conflict 100%', 'Identity 0%'],
    },
    camera: { fx: -540, fy: -80, zoom: 1.35 },
  },
  {
    id: '02',
    tag: 'THE OPTICAL GLYPH',
    kicker: 'DUAL-SEGMENT MATRIX · 1200 DPI',
    title: ['0.02-second retrieval.', 'Zero internet required.'],
    body: 'The patient wears an indestructible titanium MediQR wristband or keycard. Critical roadside triage vitals (Blood Type B+, Penicillin Anaphylaxis, ICE Emergency Contacts) are encoded directly into the plain optical matrix, readable in 0.02s by any phone camera.',
    facts: [
      ['OPTICAL LATENCY', '< 0.02s'],
      ['CELLULAR NET', '0% needed'],
      ['ENCODING', 'Dual-Segment Matrix'],
    ],
    metric: {
      label: 'scan latency',
      value: 0.018,
      countFrom: 0.85,
      decimals: 3,
      unit: 's',
      sub: 'Native phone camera decode',
    },
    formula: {
      equation: 'TRIAGE_PAYLOAD = PlainText(Blood + Allergies + ICE_Contact)',
      value: '0.018 s',
      scope: 'air-gapped optical matrix · 1200 DPI ceramic laser etch',
      terms: ['Blood B+', 'Allergy Penicillin', 'ICE Active'],
    },
    camera: { fx: -260, fy: -80, zoom: 1.35 },
  },
  {
    id: '03',
    tag: 'THE AIR-GAP CIPHER',
    kicker: 'OFFLINE DECRYPTION · NATIVE CAMERA',
    title: ['Instant roadside preview.', 'Zero browser redirect.'],
    body: 'Paramedics point any standard iPhone or Android camera at the glyph. The viewfinder immediately displays critical emergency vitals as native on-screen text without opening websites, loading heavy web apps, or making remote cloud API calls.',
    facts: [
      ['VIEWFINDER HUD', 'Native Text Preview'],
      ['URL REDIRECT', 'Zero (0)'],
      ['OFFLINE AIR-GAP', '100% verified'],
    ],
    metric: {
      label: 'cloud api calls',
      value: 0,
      countFrom: 18,
      decimals: 0,
      unit: 'req',
      sub: 'Completely air-gapped',
    },
    formula: {
      equation: 'OFFLINE_RATIO = (LocalViewfinderDecode / RemoteAPICalls)',
      value: '0 API Calls',
      scope: 'tunnels · remote highways · air ambulance blackout zones',
      terms: ['HTTP 0', 'DNS 0', 'Cache Local'],
    },
    camera: { fx: -260, fy: 120, zoom: 1.35 },
  },
  {
    id: '04',
    tag: 'THE HARDWARE MESH',
    kicker: 'ESP32 ACCESS POINT · 192.168.4.1',
    title: ['Sovereign private network.', 'Zero cloud dependencies.'],
    body: 'When hospital ambulances and mobile stations exchange clinical data, an air-gapped ESP32 hardware router creates a dedicated WPA2-PSK mesh. Blue hardware status LEDs confirm secure peer discovery with zero packet leaks.',
    facts: [
      ['CHIPSET', 'ESP32 Dual-Core Xtensa'],
      ['AP SUBNET', '192.168.4.1/24'],
      ['ENCRYPTION', 'WPA2-PSK (Air-Gapped)'],
    ],
    metric: {
      label: 'mesh throughput',
      value: 54.0,
      countFrom: 12.0,
      decimals: 1,
      unit: 'Mbps',
      sub: 'Isolated local routing',
    },
    formula: {
      equation: 'SOVEREIGN_MESH = ESP32_AP(192.168.4.1, WPA2_PSK, Channel_6)',
      value: '54.0 Mbps',
      scope: 'hardware access point · blue link LED indicator · zero cloud',
      terms: ['Freq 2.4GHz', 'Clients 3/4', 'Loss 0.0%'],
    },
    camera: { fx: 0, fy: 0, zoom: 1.3 },
  },
  {
    id: '05',
    tag: 'THE HOSPITAL VAULTS',
    kicker: 'MULTI-HOSPITAL PARTITIONING · PORTS 5001 & 5002',
    title: ['Multi-hospital storage.', 'Zero single point of failure.'],
    body: 'Clinical case notes, lab diagnostics, and radiology scans are partitioned across independent hospital nodes (Apollo Node A on :5001, Fortis Node B on :5002). Every payload is encrypted at rest using individual hospital AES-256 keys.',
    facts: [
      ['HOSPITAL A', 'Apollo Health (:5001)'],
      ['HOSPITAL B', 'Fortis Node (:5002)'],
      ['CIPHER', 'AES-256-GCM'],
    ],
    metric: {
      label: 'consortium nodes',
      value: 2,
      countFrom: 1,
      decimals: 0,
      unit: 'nodes',
      sub: 'Decoupled microservice partitions',
    },
    formula: {
      equation: 'CIPHERTEXT = AES-256-GCM(Record_Payload, K_hospital)',
      value: 'AES-256',
      scope: 'multi-hospital partition boundary · zero single point of failure',
      terms: ['Node A :5001', 'Node B :5002', 'IV 96-bit'],
    },
    camera: { fx: 260, fy: 0, zoom: 1.25 },
  },
  {
    id: '06',
    tag: 'THE BLOCKCHAIN LEDGER',
    kicker: 'ETHEREUM CONSORTIUM · MEDICALRECORDLEDGER.SOL',
    title: ['Zero PII on-chain.', '32-byte cryptographic anchors.'],
    body: 'Our Solidity smart contract anchors 32-byte SHA-256 hashes of the encrypted off-chain files. No patient personal information ever touches the blockchain, ensuring 100% HIPAA and DPDP India regulatory compliance.',
    facts: [
      ['SMART CONTRACT', 'MedicalRecordLedger'],
      ['ON-CHAIN PII', '0% (Zero PII)'],
      ['BLOCK TIME', '1.2 seconds'],
    ],
    metric: {
      label: 'zero-pii compliance',
      value: 100,
      countFrom: 45,
      decimals: 0,
      unit: '%',
      sub: 'HIPAA & DPDP Act compliant',
    },
    formula: {
      equation: 'LEDGER_ANCHOR = SHA-256(EncryptedRecordPayload)',
      value: '32 Bytes',
      scope: 'zero personal health information on-chain · immutable EVM state',
      terms: ['SHA-256', 'Gas 48,201', 'Proof Immutable'],
    },
    camera: { fx: 540, fy: 0, zoom: 1.25 },
  },
  {
    id: '07',
    tag: 'TAMPER IMMUNITY',
    kicker: 'SHA-256 INTEGRITY AUDIT · BIT-FLIP REJECTION',
    title: ['1-bit modification.', 'Mathematical rejection.'],
    body: 'If an unauthorized actor alters an encrypted prescription or lab result, the recomputed SHA-256 hash immediately clashes with the Ethereum smart contract anchor. Decryption is blocked with an instant AUDIT HOLD alarm.',
    facts: [
      ['COLLISION PROB', '2⁻²⁵⁶ (Impossible)'],
      ['AUDIT STATUS', 'AUDIT PASS'],
      ['TAMPER DETECT', '< 1 millisecond'],
    ],
    metric: {
      label: 'tamper immunity',
      value: 100,
      countFrom: 80,
      decimals: 0,
      unit: '%',
      sub: 'Cryptographically sealed',
    },
    formula: {
      equation: 'INTEGRITY = (Hash(DiskPayload) == Hash(BlockchainAnchor))',
      value: 'AUDIT PASS',
      scope: 'instant bit-flip rejection · mathematical proof of authenticity',
      terms: ['Clash 0', 'Audit Pass', 'Tamper Blocked'],
    },
    camera: { fx: 400, fy: -50, zoom: 1.2 },
  },
  {
    id: '08',
    tag: 'THE 3-DEVICE ECOSYSTEM',
    kicker: '3-DEVICE DEMO · LAPTOP 1 + LAPTOP 2 + MOBILE',
    title: ['The complete live system.', 'Ready for evaluation.'],
    body: 'Laptop 1 runs Patient Booking & Token Generation. Laptop 2 runs Doctor EMR Consultations & Live Blockchain Monitoring. Device 3 simulates Mobile Paramedic Triage over the private ESP32 Access Point.',
    facts: [
      ['LAPTOP 1', 'Patient Booking (/book)'],
      ['LAPTOP 2', 'Doctor EMR & Blockchain'],
      ['DEVICE 3', 'Offline Triage (/emergency)'],
    ],
    metric: {
      label: 'system uptime',
      value: 100,
      countFrom: 0,
      decimals: 0,
      unit: '%',
      sub: 'Full consortium online',
    },
    formula: {
      equation: 'SYSTEM_STATUS = (HospitalA + HospitalB + Blockchain + ESP32)',
      value: 'ONLINE',
      scope: 'zero-cloud sovereignty · live academic presentation setup',
      terms: ['Demo Port 3000', 'Ports 5001/5002', 'ESP32 192.168.4.1'],
    },
    camera: { fx: 0, fy: 0, zoom: 0.95 },
    cta: true,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MATHEMATICAL ISOMETRIC PROJECTION CONSTANTS
   Standard axonometric coordinates: 30° projection angle.
   ───────────────────────────────────────────────────────────────────────────── */
const ISO_C = Math.cos(Math.PI / 6); // 0.8660254
const ISO_S = 0.5;
const OX = 600;
const OY = 480;
const N = STORY.length;

function iso(x: number, y: number, z = 0): [number, number] {
  return [OX + (x - y) * ISO_C, OY + (x + y) * ISO_S - z];
}

function f1(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

function poly(points: [number, number][]): string {
  return points.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
}

function pathOf(points: [number, number][], close = true): string {
  return `M${poly(points)}${close ? 'Z' : ''}`;
}

function lineOf(points: [number, number][]): string {
  return `M${poly(points)}`;
}

function clamp(v: number, a = 0, b = 1): number {
  return Math.min(b, Math.max(a, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function cameraAt(progress: number) {
  const t = clamp(progress, 0, 1) * (N - 1);
  const i = clamp(Math.floor(t), 0, N - 2);
  const f = t - i;
  const k = smooth(f);
  const a = STORY[i].camera;
  const b = STORY[Math.min(i + 1, N - 1)].camera;
  return {
    fx: lerp(a.fx, b.fx, k),
    fy: lerp(a.fy, b.fy, k),
    zoom: lerp(a.zoom, b.zoom, k),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   ISOMETRIC 3D PRIMITIVES (SHADED CUBOIDS, FIXTURES, SCREENS & TEXT)
   ───────────────────────────────────────────────────────────────────────────── */
const TONES: Record<string, [string, string, string]> = {
  base: ['#1e293b', '#0f172a', '#020617'],
  amber: ['#3b2506', '#261704', '#150d02'],
  cyan: ['#083344', '#062430', '#03141a'],
  emerald: ['#064e3b', '#043528', '#021e17'],
  rose: ['#4c0519', '#330311', '#1a0108'],
  titanium: ['#334155', '#1e293b', '#0f172a'],
  white: ['#f8fafc', '#e2e8f0', '#cbd5e1'],
};

function Box({
  x, y, z, w, d, h, tone = 'base', opacity = 1, seam = true, stroke = 'rgba(255,255,255,0.12)', children,
}: {
  x: number; y: number; z: number; w: number; d: number; h: number;
  tone?: string; opacity?: number; seam?: boolean; stroke?: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone] || TONES.base;
  const top: [number, number][] = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const b = iso(x + w, y, z);
  const c = iso(x + w, y + d, z);

  return (
    <g opacity={opacity}>
      {/* Front Y face */}
      <path
        d={pathOf([iso(x, y + d, z), c, iso(x + w, y + d, z + h), iso(x, y + d, z + h)])}
        fill={t[2]}
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Front X face */}
      <path
        d={pathOf([b, c, iso(x + w, y + d, z + h), top[1]])}
        fill={t[1]}
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Top face */}
      <path
        d={pathOf(top)}
        fill={t[0]}
        stroke={stroke}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {seam && h > 10 && (
        <path
          d={lineOf([iso(x + w, y, z + h * 0.5), iso(x + w, y + d, z + h * 0.5)])}
          fill="none"
          stroke={stroke}
          strokeWidth="0.5"
          opacity="0.5"
        />
      )}
      {children}
    </g>
  );
}

function Screws({ x, y, z, w, d, inset = 6 }: { x: number; y: number; z: number; w: number; d: number; inset?: number }) {
  const pts = [
    iso(x + inset, y + inset, z),
    iso(x + w - inset, y + inset, z),
    iso(x + w - inset, y + d - inset, z),
    iso(x + inset, y + d - inset, z),
  ];
  return (
    <g>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="1.8" fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <circle cx={p[0]} cy={p[1]} r="0.6" fill="rgba(255,255,255,0.5)" />
        </g>
      ))}
    </g>
  );
}

function FaceText({
  x, y, z, size = 9, fill = '#94a3b8', anchor = 'start', weight = 600, letterSpacing = '.06em', children,
}: {
  x: number; y: number; z: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end';
  weight?: number; letterSpacing?: string; children: React.ReactNode;
}) {
  const [sx, sy] = iso(x, y, z);
  return (
    <text
      transform={`matrix(${ISO_C} ${ISO_S} 0 1 ${f1(sx)} ${f1(sy)})`}
      fontFamily="ui-monospace, Geist Mono, monospace"
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      textAnchor={anchor}
      letterSpacing={letterSpacing}
    >
      {children}
    </text>
  );
}

function Led({ x, y, z, r = 2.5, color = '#38bdf8', pulse = false }: { x: number; y: number; z: number; r?: number; color?: string; pulse?: boolean }) {
  const [cx, cy] = iso(x, y, z);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 2.5} fill={color} opacity="0.15" />
      <circle cx={cx} cy={cy} r={r} fill={color} className={pulse ? 'animate-pulse' : ''} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="#ffffff" opacity="0.75" />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE EXPORT WITH HIGH-SPEED CARBOTRACE ENGINE
   ───────────────────────────────────────────────────────────────────────────── */
export default function CarbotraceMediQRPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<SVGGElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const [active, setActive] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Modals
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<'crisis' | 'solution' | 'card' | 'blockchain' | 'hero'>('crisis');
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Scroll listener for 60fps camera interpolation
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / (total || 1), 0, 1);
      setScrollProgress(progress);

      const chapterIndex = clamp(Math.round(progress * (N - 1)), 0, N - 1);
      setActive(chapterIndex);

      const cam = cameraAt(progress);
      if (cameraRef.current) {
        cameraRef.current.setAttribute(
          'transform',
          `translate(${(-cam.fx * cam.zoom + 600).toFixed(1)} ${(-cam.fy * cam.zoom + 450).toFixed(1)}) scale(${cam.zoom.toFixed(3)})`
        );
      }

      // Smooth metric counter display
      if (counterRef.current) {
        const curChap = STORY[chapterIndex];
        const val = curChap.metric.value;
        counterRef.current.textContent = curChap.metric.decimals > 0
          ? val.toFixed(curChap.metric.decimals)
          : val.toString();
      }
    };

    const loop = () => {
      handleScroll();
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const goToChapter = useCallback((index: number) => {
    if (!containerRef.current) return;
    const total = containerRef.current.offsetHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + (index / (N - 1)) * total;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, []);

  const curChapter = STORY[active];

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white antialiased">
      
      {/* =========================================================================
          THE FULL-VIEWPORT SCROLLYTELLING TRACK (800vh TOTAL, PINNED AT 100svh)
      ========================================================================= */}
      <section
        ref={containerRef}
        className="relative w-full"
        style={{ height: `${N * 100}vh` }}
        aria-label="MediQR Zero-Trust Healthcare Consortium Scrollytelling"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between bg-[#07090e]">

          {/* -----------------------------------------------------------------------
              TOP CONSOLE NAVIGATION STRIP (CARBOTRACE-STYLE FLIGHT DECK)
          ----------------------------------------------------------------------- */}
          <header className="relative z-30 shrink-0 border-b border-white/10 bg-[#0a0d14]/90 backdrop-blur-md px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              
              {/* Brand Logo with Optical Shield */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-mono text-[10px] font-bold">
                  ✛
                </div>
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-[.18em] text-white">
                    MEDIQR
                  </span>
                  <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest hidden sm:inline">
                    / ZERO-TRUST CONSORTIUM
                  </span>
                </div>
              </div>

              {/* Central Architecture Pipeline Sequence */}
              <div className="hidden xl:flex items-center gap-2 text-[9px] font-mono text-slate-400 tracking-[.14em]">
                <span className={active === 0 ? 'text-rose-400 font-bold' : ''}>01 COLLISION</span>
                <span className="text-white/20">→</span>
                <span className={active === 1 ? 'text-cyan-400 font-bold' : ''}>02 GLYPH</span>
                <span className="text-white/20">→</span>
                <span className={active === 2 ? 'text-emerald-400 font-bold' : ''}>03 AIR-GAP</span>
                <span className="text-white/20">→</span>
                <span className={active === 3 ? 'text-blue-400 font-bold' : ''}>04 ESP32 MESH</span>
                <span className="text-white/20">→</span>
                <span className={active === 4 ? 'text-indigo-400 font-bold' : ''}>05 VAULTS</span>
                <span className="text-white/20">→</span>
                <span className={active === 5 ? 'text-amber-400 font-bold' : ''}>06 CONSENSUS</span>
                <span className="text-white/20">→</span>
                <span className={active === 6 ? 'text-teal-400 font-bold' : ''}>07 AUDIT</span>
                <span className="text-white/20">→</span>
                <span className={active === 7 ? 'text-cyan-300 font-bold' : ''}>08 3-DEVICE</span>
              </div>

              {/* Flight Deck Utility Controls */}
              <div className="flex items-center gap-3 shrink-0">
                
                {/* Watch Incident Reconstruction Videos */}
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-300 hover:text-white font-mono flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span className="text-rose-400">🎬</span>
                  <span className="hidden sm:inline">Incident Videos</span>
                </button>

                {/* Direct Patient Booking Link */}
                <Link
                  href="/book"
                  className="px-3.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition shadow-sm"
                >
                  Book Care (₹500)
                </Link>

                {/* Restart Chapter Button */}
                <button
                  type="button"
                  onClick={() => goToChapter(0)}
                  className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-mono transition cursor-pointer"
                  title="Restart to Chapter 01"
                >
                  ↺ 01
                </button>

                {/* Active Chapter Indicator */}
                <div className="font-mono text-xs tracking-wider">
                  <span className="text-cyan-400 font-bold">{curChapter.id}</span>
                  <span className="text-slate-500"> / 08</span>
                </div>

              </div>

            </div>

            {/* Cyan Progress Rail Line */}
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-150"
                style={{ width: `${((active + 1) / N) * 100}%` }}
              />
            </div>
          </header>

          {/* -----------------------------------------------------------------------
              MIDDLE STAGE: FULL-BLEED 3D ISOMETRIC ENGINE WITH CAMERA ZOOM & PAN
          ----------------------------------------------------------------------- */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden">
            
            {/* Grid Pattern Floor */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #38bdf8 0.8px, transparent 0.9px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* The Fullscreen Isometric SVG Canvas */}
            <svg
              className="w-full h-full block select-none overflow-visible"
              viewBox="0 0 1200 900"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="amberGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="1%" stopColor="#d97706" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="1%" stopColor="#0284c7" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* The Dynamically Panned & Zoomed Group */}
              <g ref={cameraRef}>
                
                {/* Floor Axis Crosshairs */}
                <path
                  d={lineOf([iso(-800, 0, 0), iso(800, 0, 0)])}
                  stroke="rgba(56, 189, 248, 0.15)"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                />
                <path
                  d={lineOf([iso(0, -500, 0), iso(0, 500, 0)])}
                  stroke="rgba(56, 189, 248, 0.15)"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                />

                {/* -------------------------------------------------------------
                    NODE 1: AMBULANCE TRIAGE VEHICLE (CH 01)
                ------------------------------------------------------------- */}
                <g id="node-ambulance">
                  {/* Road Base Plate */}
                  <Box x={-660} y={-140} z={0} w={240} d={120} h={12} tone="base" />
                  <Screws x={-656} y={-136} z={12} w={232} d={112} inset={8} />

                  {/* Ambulance Body */}
                  <Box x={-640} y={-120} z={12} w={200} d={80} h={110} tone="titanium" />
                  {/* Ambulance Cab */}
                  <Box x={-640} y={-120} z={122} w={120} d={80} h={40} tone="white" />

                  {/* Red Cross Emblem */}
                  <FaceText x={-580} y={-38} z={75} size={18} fill="#ef4444" weight={800} anchor="middle">
                    ✚
                  </FaceText>
                  <FaceText x={-580} y={-38} z={48} size={7} fill="#ffffff" weight={700} anchor="middle">
                    AMBULANCE 04
                  </FaceText>

                  {/* Side Telemetry HUD */}
                  <Box x={-510} y={-39} z={35} w={60} d={2} h={45} tone="cyan" />
                  <FaceText x={-480} y={-37} z={65} size={6.5} fill="#38bdf8" weight={700} anchor="middle">
                    UNCONSCIOUS
                  </FaceText>
                  <FaceText x={-480} y={-37} z={52} size={6} fill="#f87171" weight={700} anchor="middle">
                    ALLERGY: UNKNOWN
                  </FaceText>
                  <FaceText x={-480} y={-37} z={40} size={5.5} fill="#94a3b8" weight={500} anchor="middle">
                    ER DELAY: 43.5m
                  </FaceText>

                  {/* Emergency Flashing Siren Beacons */}
                  <Led x={-620} y={-80} z={166} color="#ef4444" pulse />
                  <Led x={-540} y={-80} z={166} color="#06b6d4" pulse />
                </g>

                {/* -------------------------------------------------------------
                    NODE 2: MEDIQR TITANIUM KEYCARD & WRISTBAND (CH 02)
                ------------------------------------------------------------- */}
                <g id="node-keycard">
                  {/* Base Pedestal */}
                  <Box x={-360} y={-140} z={0} w={200} d={120} h={12} tone="base" />
                  <Screws x={-356} y={-136} z={12} w={192} d={112} inset={8} />

                  {/* Titanium Card Core */}
                  <Box x={-340} y={-120} z={12} w={160} d={80} h={100} tone="titanium" />
                  
                  {/* Laser-Etched QR Optical Matrix on Front Face */}
                  <Box x={-325} y={-39} z={25} w={70} d={2} h={70} tone="base" />
                  {/* High-Density QR Pattern Simulation */}
                  {[-315, -300, -285, -270].map((qx, i) => (
                    <path
                      key={i}
                      d={lineOf([iso(qx, -37, 35), iso(qx, -37, 85)])}
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeDasharray="4 3 6 2"
                    />
                  ))}
                  {/* QR Alignment Corner Finders */}
                  <rect
                    x={iso(-320, -37, 85)[0] - 5}
                    y={iso(-320, -37, 85)[1] - 5}
                    width="10"
                    height="10"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={iso(-270, -37, 85)[0] - 5}
                    y={iso(-270, -37, 85)[1] - 5}
                    width="10"
                    height="10"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />

                  {/* Laser Silkscreen Typography */}
                  <FaceText x={-245} y={-38} z={82} size={7} fill="#ffffff" weight={700}>
                    MEDIQR TITANIUM
                  </FaceText>
                  <FaceText x={-245} y={-38} z={68} size={6} fill="#38bdf8">
                    1200 DPI OPTICAL
                  </FaceText>
                  <FaceText x={-245} y={-38} z={54} size={5.5} fill="#94a3b8">
                    0.02s TRIAGE
                  </FaceText>
                  <FaceText x={-245} y={-38} z={40} size={5} fill="#10b981">
                    ● PASSIVE ZERO-NET
                  </FaceText>

                  {/* Microchip Die with Gold Traces */}
                  <Box x={-240} y={-80} z={114} w={35} d={35} h={6} tone="amber" />
                  <Led x={-222} y={-62} z={124} color="#10b981" />
                </g>

                {/* -------------------------------------------------------------
                    NODE 3: PARAMEDIC EMERGENCY PHONE VIEWFINDER (CH 03)
                ------------------------------------------------------------- */}
                <g id="node-phone">
                  <Box x={-340} y={60} z={0} w={160} d={120} h={12} tone="base" />
                  <Screws x={-336} y={64} z={12} w={152} d={112} inset={8} />

                  {/* Phone Bevel Frame */}
                  <Box x={-320} y={80} z={12} w={120} d={80} h={140} tone="titanium" />
                  
                  {/* Phone Camera HUD Screen */}
                  <Box x={-310} y={161} z={25} w={100} d={2} h={115} tone="cyan" stroke="#38bdf8" />
                  <FaceText x={-260} y={163} z={125} size={6.5} fill="#f43f5e" weight={800} anchor="middle">
                    🚨 EMERGENCY TRIAGE 🚨
                  </FaceText>
                  <FaceText x={-260} y={163} z={110} size={6} fill="#ffffff" weight={700} anchor="middle">
                    RAHUL SHARMA (29M)
                  </FaceText>
                  <FaceText x={-260} y={163} z={95} size={6.5} fill="#f87171" weight={800} anchor="middle">
                    BLOOD GROUP: B+
                  </FaceText>
                  <FaceText x={-260} y={163} z={80} size={5.5} fill="#f59e0b" weight={600} anchor="middle">
                    ALLERGY: PENICILLIN G
                  </FaceText>
                  <FaceText x={-260} y={163} z={65} size={5.5} fill="#94a3b8" weight={500} anchor="middle">
                    ICE: +91-98765-43211
                  </FaceText>
                  <FaceText x={-260} y={163} z={48} size={5} fill="#10b981" weight={700} anchor="middle">
                    ✓ 0.018s OFFLINE NATIVE TEXT
                  </FaceText>

                  <Led x={-260} y={163} z={135} color="#10b981" />
                </g>

                {/* -------------------------------------------------------------
                    NODE 4: ESP32 AIR-GAPPED HARDWARE ROUTER (CH 04)
                ------------------------------------------------------------- */}
                <g id="node-esp32">
                  <Box x={-100} y={-60} z={0} w={200} d={120} h={12} tone="base" />
                  <Screws x={-96} y={-56} z={12} w={192} d={112} inset={8} />

                  {/* Green PCB Substrate */}
                  <Box x={-80} y={-40} z={12} w={160} d={80} h={20} tone="emerald" />

                  {/* Gold Serpentine Antenna Trace */}
                  <path
                    d={lineOf([
                      iso(-70, -30, 33),
                      iso(-50, -30, 33),
                      iso(-50, -10, 33),
                      iso(-30, -10, 33),
                      iso(-30, -30, 33),
                      iso(-10, -30, 33),
                    ])}
                    stroke="#eab308"
                    strokeWidth="2.5"
                    fill="none"
                  />

                  {/* ESP32 Dual-Core Shielded Microchip */}
                  <Box x={0} y={-25} z={32} w={65} d={50} h={15} tone="base" />
                  <FaceText x={32} y={-27} z={42} size={6} fill="#ffffff" weight={700} anchor="middle">
                    ESP-WROOM-32
                  </FaceText>
                  <FaceText x={32} y={26} z={42} size={5} fill="#38bdf8" weight={600} anchor="middle">
                    192.168.4.1 MESH
                  </FaceText>

                  {/* Router Status LEDs */}
                  <Led x={-60} y={25} z={35} color="#38bdf8" pulse />
                  <Led x={-45} y={25} z={35} color="#10b981" />
                  <Led x={-30} y={25} z={35} color="#f59e0b" />
                </g>

                {/* -------------------------------------------------------------
                    NODE 5: HOSPITAL SERVER VAULTS (APOLLO & FORTIS) (CH 05)
                ------------------------------------------------------------- */}
                <g id="node-vaults">
                  {/* Shared Infrastructure Pedestal */}
                  <Box x={180} y={-160} z={0} w={180} d={320} h={12} tone="base" />
                  <Screws x={184} y={-156} z={12} w={172} d={312} inset={8} />

                  {/* Vault A: Apollo (:5001) */}
                  <Box x={200} y={-140} z={12} w={140} d={110} h={190} tone="cyan" />
                  <FaceText x={270} y={-29} z={185} size={7} fill="#38bdf8" weight={700} anchor="middle">
                    APOLLO NODE A (:5001)
                  </FaceText>
                  <FaceText x={270} y={-29} z={170} size={5.5} fill="#94a3b8" weight={600} anchor="middle">
                    AES-256-GCM ENCRYPTED
                  </FaceText>
                  {/* Apollo Blade Drive Slots */}
                  {[140, 115, 90, 65, 40].map((bz, i) => (
                    <g key={i}>
                      <path
                        d={lineOf([iso(215, -29, bz), iso(325, -29, bz)])}
                        stroke="rgba(56, 189, 248, 0.4)"
                        strokeWidth="1"
                      />
                      <Led x={315} y={-27} z={bz + 5} color="#10b981" r={1.5} />
                    </g>
                  ))}

                  {/* Vault B: Fortis (:5002) */}
                  <Box x={200} y={20} z={12} w={140} d={110} h={190} tone="titanium" />
                  <FaceText x={270} y={131} z={185} size={7} fill="#818cf8" weight={700} anchor="middle">
                    FORTIS NODE B (:5002)
                  </FaceText>
                  <FaceText x={270} y={131} z={170} size={5.5} fill="#94a3b8" weight={600} anchor="middle">
                    REDUNDANT SHARD PARTITION
                  </FaceText>
                  {/* Fortis Blade Drive Slots */}
                  {[140, 115, 90, 65, 40].map((bz, i) => (
                    <g key={i}>
                      <path
                        d={lineOf([iso(215, 131, bz), iso(325, 131, bz)])}
                        stroke="rgba(129, 140, 248, 0.4)"
                        strokeWidth="1"
                      />
                      <Led x={315} y={133} z={bz + 5} color="#06b6d4" r={1.5} />
                    </g>
                  ))}
                </g>

                {/* -------------------------------------------------------------
                    NODE 6: ETHEREUM CONSORTIUM BLOCKCHAIN (CH 06)
                ------------------------------------------------------------- */}
                <g id="node-blockchain">
                  <Box x={440} y={-80} z={0} w={200} d={160} h={12} tone="base" />
                  <Screws x={444} y={-76} z={12} w={192} d={152} inset={8} />

                  {/* Cryptographic Block 104 (Payment Confirmation) */}
                  <Box x={460} y={-60} z={20} w={70} d={60} h={60} tone="amber" stroke="#f59e0b" />
                  <FaceText x={495} y={2} z={65} size={6.5} fill="#f59e0b" weight={800} anchor="middle">
                    BLOCK #104
                  </FaceText>
                  <FaceText x={495} y={2} z={50} size={5} fill="#ffffff" weight={600} anchor="middle">
                    ₹500 FEE MINED
                  </FaceText>
                  <FaceText x={495} y={2} z={35} size={4.5} fill="#fbbf24" weight={500} anchor="middle">
                    APT-APO-2026
                  </FaceText>

                  {/* Golden Consensus Chain Link */}
                  <path
                    d={lineOf([iso(530, -30, 50), iso(560, -30, 80)])}
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeDasharray="3 2"
                  />

                  {/* Cryptographic Block 105 (Medical Record Committed) */}
                  <Box x={550} y={0} z={50} w={80} d={70} h={70} tone="cyan" stroke="#38bdf8" />
                  <FaceText x={590} y={72} z={105} size={7} fill="#38bdf8" weight={800} anchor="middle">
                    BLOCK #105
                  </FaceText>
                  <FaceText x={590} y={72} z={88} size={5} fill="#ffffff" weight={700} anchor="middle">
                    REC-APOLLO-001
                  </FaceText>
                  <FaceText x={590} y={72} z={72} size={4.5} fill="#94a3b8" weight={500} anchor="middle">
                    0xf305f9e0... SHA-256
                  </FaceText>

                  <Led x={590} y={72} z={115} color="#10b981" pulse />
                </g>

                {/* -------------------------------------------------------------
                    INTER-NODE GLOWING DATA PACKET PIPES (ROUTED CHANNELS)
                ------------------------------------------------------------- */}
                <g id="pipes">
                  {/* Ambulance -> Keycard */}
                  <path
                    d={lineOf([iso(-440, -80, 20), iso(-340, -80, 20)])}
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* Keycard -> ESP32 Router */}
                  <path
                    d={lineOf([iso(-180, -80, 20), iso(-80, 0, 20)])}
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* Phone -> ESP32 Router */}
                  <path
                    d={lineOf([iso(-180, 120, 20), iso(-80, 0, 20)])}
                    stroke="rgba(16, 185, 129, 0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* ESP32 -> Vaults */}
                  <path
                    d={lineOf([iso(80, 0, 20), iso(200, -80, 20)])}
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <path
                    d={lineOf([iso(80, 0, 20), iso(200, 80, 20)])}
                    stroke="rgba(129, 140, 248, 0.4)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* Vaults -> Blockchain */}
                  <path
                    d={lineOf([iso(340, -30, 50), iso(460, -30, 50)])}
                    stroke="rgba(245, 158, 11, 0.6)"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                  />
                </g>

              </g>
            </svg>

            {/* -------------------------------------------------------------------
                LEFT FLOATING NARRATIVE PANEL (CARBOTRACE-GRADE HERO COPY)
            ------------------------------------------------------------------- */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-4 sm:px-8 lg:px-12 max-w-lg lg:max-w-xl">
              
              {/* Soft Gradient Mask for readability */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[140%] -z-10"
                style={{
                  background: 'linear-gradient(90deg, rgba(7,9,14,0.95) 0%, rgba(7,9,14,0.8) 55%, transparent 100%)',
                }}
              />

              <div className="pointer-events-auto space-y-4 sm:space-y-6">
                
                {/* Category Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-mono tracking-[.18em]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-bold">CHAPTER {curChapter.id}</span>
                  <span className="text-slate-500">/ {curChapter.tag}</span>
                </div>

                {/* Big Punchy Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
                  {curChapter.title.map((line, idx) => (
                    <span key={idx} className="block">
                      {idx === 1 ? (
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                          {line}
                        </span>
                      ) : (
                        line
                      )}
                    </span>
                  ))}
                </h1>

                {/* Narrative Paragraph */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-md">
                  {curChapter.body}
                </p>

                {/* 3 Technical Fact Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-left font-mono">
                  {curChapter.facts.map(([k, v], i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">{k}</div>
                      <div className="text-xs text-white font-bold truncate">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Direct Action CTAs on Final Chapter */}
                {curChapter.cta && (
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href="/book"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
                    >
                      <span>Book Consultation (₹500)</span>
                      <span>→</span>
                    </Link>

                    <Link
                      href="/doctor"
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition"
                    >
                      Doctor EMR Workstation →
                    </Link>

                    <Link
                      href="/blockchain"
                      className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-semibold text-xs transition"
                    >
                      Live Blockchain Activity →
                    </Link>
                  </div>
                )}

              </div>
            </div>

            {/* -------------------------------------------------------------------
                TOP RIGHT REAL-TIME TELEMETRY CARD (NUMERIC COUNT-UP STATS)
            ------------------------------------------------------------------- */}
            <div className="pointer-events-none absolute right-4 top-4 z-20 sm:right-8 sm:top-6">
              <div className="rounded-2xl bg-[#0a0d14]/90 border border-white/15 p-4 sm:p-5 shadow-2xl backdrop-blur-md text-right min-w-[160px] sm:min-w-[200px]">
                <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[.18em] text-slate-400">
                  {curChapter.metric.label}
                </div>
                
                <div className="mt-1 flex items-baseline justify-end gap-1.5 font-mono">
                  <span
                    ref={counterRef}
                    className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                  >
                    {curChapter.metric.decimals > 0
                      ? curChapter.metric.value.toFixed(curChapter.metric.decimals)
                      : curChapter.metric.value}
                  </span>
                  <span className="text-xs sm:text-sm text-cyan-400 font-bold">
                    {curChapter.metric.unit}
                  </span>
                </div>

                <div className="mt-1 text-[10px] font-mono text-slate-400 truncate">
                  {curChapter.metric.sub}
                </div>

                {/* Live Node Redundancy Status */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CONSORTIUM TELEMETRY
                  </span>
                  <span className="text-slate-400">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                RIGHT VERTICAL CHAPTER SCRUBBER RAIL (01 TO 08)
            ------------------------------------------------------------------- */}
            <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-end gap-2.5 sm:right-6">
              {STORY.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToChapter(i)}
                  className={`group flex items-center gap-2 transition cursor-pointer ${
                    active === i ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`Chapter ${s.id}: ${s.tag}`}
                >
                  <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {s.tag}
                  </span>
                  <span className="text-[11px] font-mono tracking-wider">{s.id}</span>
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      active === i
                        ? 'bg-cyan-400 ring-4 ring-cyan-400/20 scale-125'
                        : 'bg-white/20 group-hover:bg-white/40'
                    }`}
                  />
                </button>
              ))}
            </div>

          </div>

          {/* -----------------------------------------------------------------------
              BOTTOM LIVE CRYPTOGRAPHIC FORMULA TELEMETRY BAR
          ----------------------------------------------------------------------- */}
          <footer className="relative z-30 shrink-0 border-t border-white/10 bg-[#0a0d14]/90 backdrop-blur-md px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
              
              {/* Scientific Formula Definition */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 tracking-wider">EQUATION:</span>
                <span className="text-white font-semibold truncate">
                  {curChapter.formula.equation}
                </span>
              </div>

              {/* Live Evaluated Term */}
              <div className="flex items-center gap-3">
                <div className="text-cyan-400 font-bold">
                  = {curChapter.formula.value}
                </div>
                <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 border-l border-white/10 pl-3">
                  {curChapter.formula.terms.join(' · ')}
                </div>
              </div>

            </div>
          </footer>

        </div>
      </section>

      {/* =========================================================================
          VIDEO SHOWCASE MODAL (INSPECT ALL 5 INCIDENT RECONSTRUCTION VIDEOS)
      ========================================================================= */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <div className="relative w-full max-w-4xl bg-[#0a0d14] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                <span className="text-rose-400">🎬</span>
                <span>MediQR Incident Reconstructions &amp; Architecture Showcases</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Selector Tabs */}
            <div className="flex overflow-x-auto p-3 gap-2 border-b border-white/10 bg-slate-950/60 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSelectedVideo('crisis')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedVideo === 'crisis' ? 'bg-rose-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                1. The Crisis (Trauma Accident)
              </button>
              <button
                type="button"
                onClick={() => setSelectedVideo('solution')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedVideo === 'solution' ? 'bg-emerald-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                2. The Solution (Optical Triage)
              </button>
              <button
                type="button"
                onClick={() => setSelectedVideo('card')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedVideo === 'card' ? 'bg-cyan-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                3. Titanium Keycard &amp; Wristband
              </button>
              <button
                type="button"
                onClick={() => setSelectedVideo('blockchain')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedVideo === 'blockchain' ? 'bg-amber-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                4. Blockchain Consortium Seal
              </button>
              <button
                type="button"
                onClick={() => setSelectedVideo('hero')}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedVideo === 'hero' ? 'bg-indigo-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                5. Ambient Hospital Corridors
              </button>
            </div>

            {/* Active Video Player Screen */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                <video
                  key={selectedVideo}
                  src={
                    selectedVideo === 'crisis'
                      ? '/videos/the-crisis.mp4'
                      : selectedVideo === 'solution'
                      ? '/videos/the-solution.mp4'
                      : selectedVideo === 'card'
                      ? '/videos/smart-card-mockup.mp4'
                      : selectedVideo === 'blockchain'
                      ? '/videos/blockchain-seal.mp4'
                      : '/videos/hero.mp4'
                  }
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Video Technical Annotation */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 space-y-1 font-mono">
                {selectedVideo === 'crisis' && (
                  <>
                    <div className="font-bold text-rose-400">SCENE: Roadside Collision Incident Reconstruction</div>
                    <div>Demonstrates why unconscious patients with conflicting anaphylactic allergies suffer fatal ER delays when central cloud servers fail.</div>
                  </>
                )}
                {selectedVideo === 'solution' && (
                  <>
                    <div className="font-bold text-emerald-400">SCENE: 0.018s Dual-Segment Optical Matrix Acquisition</div>
                    <div>Shows emergency medical personnel pointing standard phone camera at MediQR glyph for instant roadside vitals decoding.</div>
                  </>
                )}
                {selectedVideo === 'card' && (
                  <>
                    <div className="font-bold text-cyan-400">SCENE: Aerospace Titanium Keycard &amp; Passive Wristband</div>
                    <div>Physical hardware prototype engineered to survive 850°C trauma without battery or cellular network connectivity.</div>
                  </>
                )}
                {selectedVideo === 'blockchain' && (
                  <>
                    <div className="font-bold text-amber-400">SCENE: Solidity Smart Contract Hash Verification</div>
                    <div>32-byte cryptographic SHA-256 seal guarantees 100% Zero-PII compliance and instantaneous bit-flip tamper rejection.</div>
                  </>
                )}
                {selectedVideo === 'hero' && (
                  <>
                    <div className="font-bold text-indigo-400">SCENE: MediQR Healthcare Consortium Infrastructure</div>
                    <div>Next-generation hospital data centers operating with air-gapped sovereign mesh routing.</div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">MediQR Video Telemetry Suite v2.5</span>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer"
              >
                Close Showcase
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Prompts Modal */}
      <AssetPromptModal isOpen={promptModalOpen} onClose={() => setPromptModalOpen(false)} />

      {/* Outbound Email Modal */}
      <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
}