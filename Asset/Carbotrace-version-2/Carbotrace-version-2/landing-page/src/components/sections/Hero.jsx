import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowCounterClockwise, ArrowRight, ArrowUpRight, GithubLogo, X } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────────────────────
   STORY — edit copy, counters and SCI terms here.
   One chapter = one 100vh of scroll. `countFrom` is the number the counter
   starts from as the chapter comes into view. `sci` is the live formula footer:
       SCI = ((E × I) + M) / R
   E kWh · I gCO2e/kWh · M gCO2e · R requests (or runs, or renders).
   ───────────────────────────────────────────────────────────────────────────── */
const STORY = [
  {
    id: '01',
    tag: 'THE COMMIT',
    kicker: 'PR #4821 · api/dashboard.py',
    title: ['One pull request.', 'Nothing looks wrong.'],
    body:
      'A dashboard endpoint, a nested loop and a query inside it. Fourteen lines, all green, approved. The carbon is already in the diff.',
    facts: [
      ['FILE', 'api/dashboard.py'],
      ['DIFF', '+14 / −2'],
      ['CHECKS', 'all green'],
    ],
    metric: {
      label: 'queries / render',
      value: 901,
      countFrom: 124,
      decimals: 0,
      unit: '',
      sub: 'O(N²) · 801 call sites',
    },
    sci: { E: 0.00042, I: 412, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: 'estimated · one dashboard render' },
    camera: { fx: 170, fy: 300, zoom: 1.28 },
  },
  {
    id: '02',
    tag: 'THE SYNTAX TREE',
    kicker: 'tree-sitter · python',
    title: ['Static analysis sees', 'O(N²) before it runs.'],
    body:
      'The syntax tree flattens the loop into two iterators and 801 query sites. Complexity is measured before a single row is read.',
    facts: [
      ['PATTERN', 'N+1 nested'],
      ['DEPTH', '2 iterators'],
      ['CALL SITES', '801'],
    ],
    metric: {
      label: 'complexity score',
      value: 8420,
      countFrom: 1280,
      decimals: 0,
      unit: '',
      sub: 'before execution',
    },
    sci: { E: 0.00042, I: 412, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: 'pre-execution estimate · no run yet' },
    camera: { fx: 330, fy: 330, zoom: 1.3 },
  },
  {
    id: '03',
    tag: 'THE CI RUNNER',
    kicker: 'GitHub Actions · ubuntu-latest',
    title: ['Every PR rebuilds', 'the matrix.'],
    body:
      'A cold GitHub Actions runner rebuilds 14 jobs and misses six caches. The first watt is spent before the code executes.',
    facts: [
      ['MATRIX', '14 jobs'],
      ['CACHE', '6 misses'],
      ['RUNNER', 'cold start'],
    ],
    metric: {
      label: 'energy / CI run',
      value: 214.6,
      countFrom: 48.2,
      decimals: 1,
      unit: 'Wh',
      sub: '14 jobs · 6 uncached',
    },
    sci: { E: 0.2146, I: 412, M: 0.9, R: 1, unit: 'gCO₂e / run', scope: 'one CI run · 14 jobs' },
    camera: { fx: 600, fy: 470, zoom: 1.25 },
  },
  {
    id: '04',
    tag: 'THE DATA CENTER',
    kicker: 'RDS · db.r6g.large · us-east-1',
    title: ['The query runs', '100,000 times a day.'],
    body:
      'At production traffic the endpoint runs 100,000 times a day on one RDS instance. That is 42 kWh a day before cooling.',
    facts: [
      ['REGION', 'us-east-1'],
      ['INSTANCE', 'db.r6g.large'],
      ['LOAD', '100k / day'],
    ],
    metric: {
      label: 'energy / day',
      value: 42.0,
      countFrom: 9.4,
      decimals: 1,
      unit: 'kWh / day',
      sub: '100,000 requests / day',
    },
    sci: { E: 0.00042, I: 412, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: '× 100,000 requests / day = 17.3 kg' },
    camera: { fx: 850, fy: 580, zoom: 1.25 },
  },
  {
    id: '05',
    tag: 'THE GRID',
    kicker: 'us-east-1 / eu-west-1',
    title: ['Same code.', '15× the carbon.'],
    body:
      'us-east-1 burns 412 gCO₂e per kWh. eu-west-1 runs at 28. The request is identical; the grid is not.',
    facts: [
      ['US-EAST-1', '412 g/kWh'],
      ['EU-WEST-1', '28 g/kWh'],
      ['DELTA', '14.7×'],
    ],
    metric: {
      label: 'carbon / day',
      value: 17324,
      countFrom: 3904,
      decimals: 0,
      unit: 'gCO₂e / day',
      sub: 'eu-west-1 → 1,177 g / day',
    },
    sci: { E: 0.00042, I: 412, I2: 28, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: 'same request · us-east-1 / eu-west-1' },
    camera: { fx: 1130, fy: 760, zoom: 1.0 },
  },
  {
    id: '06',
    tag: 'THE PLUME',
    kicker: 'one PR · 365 days',
    title: ['The invoice arrives', '30 days later.'],
    body:
      'One PR, one year: 6.32 tonnes of CO₂e. The cloud invoice shows the compute line 30 days later, with no carbon column.',
    facts: [
      ['WINDOW', '1 year'],
      ['PER PR', '6,320 kg'],
      ['INVOICE', 'no carbon line'],
    ],
    metric: {
      label: 'carbon / year',
      value: 6.32,
      countFrom: 1.42,
      decimals: 2,
      unit: 'tCO₂e / yr',
      sub: '6,320 kg · one PR',
    },
    sci: { E: 0.00042, I: 412, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: '× 36.5M renders / yr = 6.32 t' },
    camera: { fx: 700, fy: 650, zoom: 0.58 },
  },
  {
    id: '07',
    tag: 'THE GATE',
    kicker: 'Carbotrace PR gate · local model',
    title: ['Measure at the commit.', 'Gate at the pull request.'],
    body:
      'Carbotrace blocks the PR, rewrites the loop into one batched query with a local model, and re-scores before merge. 91.8% of the carbon disappears.',
    facts: [
      ['GATE', 'blocked'],
      ['PATCH', 'batched query'],
      ['RESULT', '−91.8%'],
    ],
    metric: {
      label: 'carbon avoided',
      value: 91.8,
      countFrom: 0,
      decimals: 1,
      unit: '%',
      sub: '6,320 → 517 kg / yr',
    },
    sci: { E: 0.0000339, I: 412, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: 'after patch · 91.8% lower' },
    camera: { fx: 330, fy: 300, zoom: 1.15 },
    compare: { before: 6320, after: 517, unit: 'kgCO₂e / yr', saved: 91.8 },
  },
  {
    id: '08',
    tag: 'THE ENGINE',
    kicker: '11 assemblies · one score',
    title: ["See your repo's", 'carbon.'],
    body:
      'Carbotrace measures code, CI and infrastructure against the live grid, then gates the pull request before the carbon ships. Local-first, open source.',
    facts: [
      ['MODE', 'local-first'],
      ['SCOPE', 'AST · CI · IaC'],
      ['LICENSE', 'MIT'],
    ],
    metric: {
      label: 'avoided / PR',
      value: 5.8,
      countFrom: 0,
      decimals: 2,
      unit: 'tCO₂e',
      sub: 'gate returns in 11 s',
    },
    sci: { E: 0.0000339, I: 412, M: 0.0002, R: 1, unit: 'gCO₂e / render', scope: 'gate on by default · one PR' },
    camera: { fx: 830, fy: 520, zoom: 1.05 },
    cta: true,
  },
];

const MACHINES = [
  { id: 'commit', cx: -640, cy: 0, w: 260, d: 110, h: 226, portY: -34, portZ: 231 },
  { id: 'ast', cx: -320, cy: 0, w: 190, d: 120, h: 320, portZ: 288 },
  { id: 'runner', cx: 0, cy: 0, w: 230, d: 140, h: 258, portZ: 253 },
  { id: 'rack', cx: 320, cy: 0, w: 170, d: 130, h: 232, portZ: 229 },
  { id: 'useast', cx: 640, cy: -140, w: 150, d: 100, h: 258, portZ: 243 },
  { id: 'euw', cx: 640, cy: 120, w: 150, d: 100, h: 258, portZ: 243 },
  { id: 'gate', cx: -320, cy: 0, w: 240, d: 120, h: 252, portZ: 240 },
];

const CONNECTORS = [
  { id: 'code-ast', from: 'commit', to: 'ast', chapters: [0], tone: 'data', order: 0 },
  { id: 'ast-runner', from: 'ast', to: 'runner', chapters: [1], tone: 'data', order: 1 },
  { id: 'power', from: 'runner', to: 'rack', chapters: [2, 3], tone: 'power', order: 2, aOffset: -11, bOffset: -11 },
  { id: 'data', from: 'runner', to: 'rack', chapters: [2, 3], tone: 'data', order: 3, aOffset: 11, bOffset: 11 },
  { id: 'us', from: 'rack', to: 'useast', chapters: [3, 4, 5], tone: 'power', order: 4, bOffset: -10 },
  { id: 'eu', from: 'rack', to: 'euw', chapters: [3, 4, 5], tone: 'data', order: 5, bOffset: 10 },
  { id: 'commit-gate', from: 'commit', to: 'gate', chapters: [6], tone: 'gate', order: 0 },
  { id: 'gate-runner', from: 'gate', to: 'runner', chapters: [6], tone: 'gate', order: 1 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ISO KIT — a tiny, dependency-free projection and solid renderer.
   World: x/y on the floor, z up, roughly one unit per screen pixel at zoom 1.
   ───────────────────────────────────────────────────────────────────────────── */
const ISO_C = Math.cos(Math.PI / 6);
const ISO_S = 0.5;
const OX = 600;
const OY = 620;
const N = STORY.length;

const iso = (x, y, z = 0) => [OX + (x - y) * ISO_C, OY + (x + y) * ISO_S - z];
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const poly = (points) => points.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
const pathOf = (points, close = true) => `M${poly(points)}${close ? 'Z' : ''}`;
const lineOf = (points) => `M${poly(points)}`;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const TONES = {
  base: ['var(--face-top)', 'var(--face-x)', 'var(--face-y)'],
  mid: ['var(--face-x)', 'var(--face-y)', 'var(--face-deep)'],
  dark: ['var(--face-y)', 'var(--face-deep)', 'var(--face-deep)'],
  screen: ['var(--screen)', 'var(--screen)', 'var(--screen)'],
};

const plan = (x, y, w, d, z = 0) => [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)];

function machineById(id) {
  return MACHINES.find((m) => m.id === id);
}

function machineRect(m) {
  const x0 = m.cx - m.w / 2;
  const x1 = m.cx + m.w / 2;
  const y0 = m.cy - m.d / 2;
  const y1 = m.cy + m.d / 2;
  const corners = [
    iso(x0, y0, 0), iso(x1, y0, 0), iso(x1, y1, 0), iso(x0, y1, 0),
    iso(x0, y0, m.h), iso(x1, y0, m.h), iso(x1, y1, m.h), iso(x0, y1, m.h),
  ];
  const xs = corners.map((p) => p[0]);
  const ys = corners.map((p) => p[1]);
  const pad = 3;
  return {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };
}

function portOf(m, offset = 0) {
  return iso(m.cx + offset, m.portY ?? m.cy, m.portZ);
}

function visibleMachineIds(chapter) {
  if (chapter === 7) return ['commit', 'runner', 'gate'];
  if (chapter === 6) return ['commit', 'runner', 'gate', 'rack', 'useast', 'euw'];
  return ['commit', 'ast', 'runner', 'rack', 'useast', 'euw'];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Camera: hold, then ease to the next chapter. Sampled by the SVG below.
   ───────────────────────────────────────────────────────────────────────────── */
function cameraAt(progress) {
  const t = clamp(progress, 0, 1) * N;
  const i = clamp(Math.floor(t), 0, N - 1);
  const f = t - i;
  const k = smooth(clamp((f - 0.42) / 0.46, 0, 1));
  const a = STORY[i].camera;
  const b = STORY[Math.min(i + 1, N - 1)].camera;
  return {
    fx: lerp(a.fx, b.fx, k),
    fy: lerp(a.fy, b.fy, k),
    zoom: lerp(a.zoom, b.zoom, k),
  };
}

function chapterAt(progress) {
  const t = clamp(progress, 0, 1) * N;
  const i = clamp(Math.floor(t), 0, N - 1);
  return { index: i, f: t - i, k: smooth(clamp(((t - i) - 0.42) / 0.46, 0, 1)) };
}

function blendTargets(progress, values) {
  const { index, k } = chapterAt(progress);
  return lerp(values[index], values[Math.min(index + 1, N - 1)], k);
}

const PLUME_US = [0.1, 0.16, 0.26, 0.52, 1, 1.32, 0.06, 0.025];
const PLUME_EU = [0.02, 0.03, 0.05, 0.08, 0.15, 0.2, 0.015, 0.01];
const HEAT = [0.15, 0.22, 0.55, 1, 0.7, 0.5, 0.08, 0.03];

function fmtNum(n, decimals = 0) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtTerm(n) {
  if (n >= 1e6) return `${+(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return Math.round(n).toLocaleString('en-US');
  if (n < 0.001) return n.toExponential(1).replace('e-', 'e−');
  return `${+n.toFixed(4)}`;
}

function fmtSci(n) {
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(3);
  return n.toFixed(5);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Angles and small 3D primitives.
   ───────────────────────────────────────────────────────────────────────────── */
function roundedPolyline(points, r = 9) {
  if (points.length < 3) return lineOf(points);
  let d = `M${f1(points[0][0])} ${f1(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const next = points[i + 1];
    const l1 = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    const l2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const inX = cur[0] + ((prev[0] - cur[0]) / (l1 || 1)) * rr;
    const inY = cur[1] + ((prev[1] - cur[1]) / (l1 || 1)) * rr;
    const outX = cur[0] + ((next[0] - cur[0]) / (l2 || 1)) * rr;
    const outY = cur[1] + ((next[1] - cur[1]) / (l2 || 1)) * rr;
    d += `L${f1(inX)} ${f1(inY)}Q${f1(cur[0])} ${f1(cur[1])} ${f1(outX)} ${f1(outY)}`;
  }
  const last = points[points.length - 1];
  d += `L${f1(last[0])} ${f1(last[1])}`;
  return d;
}

function pointAtDistance(points, distance) {
  let left = distance;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (left <= len) {
      const t = len === 0 ? 0 : left / len;
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    }
    left -= len;
  }
  return points[points.length - 1];
}

function lineHitsRect(a, b, r, pad = 0) {
  const minX = r.x - pad;
  const maxX = r.x + r.w + pad;
  const minY = r.y - pad;
  const maxY = r.y + r.h + pad;
  if (Math.abs(a[1] - b[1]) < 0.01) {
    if (a[1] <= minY || a[1] >= maxY) return false;
    return Math.min(Math.max(a[0], b[0]), maxX) > Math.max(Math.min(a[0], b[0]), minX);
  }
  if (Math.abs(a[0] - b[0]) < 0.01) {
    if (a[0] <= minX || a[0] >= maxX) return false;
    return Math.min(Math.max(a[1], b[1]), maxY) > Math.max(Math.min(a[1], b[1]), minY);
  }
  return false;
}

function routeClashes(points, obstacles, pad = 7) {
  let n = 0;
  for (let i = 0; i < points.length - 1; i++) {
    for (const r of obstacles) {
      if (lineHitsRect(points[i], points[i + 1], r, pad)) n++;
    }
  }
  return n;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SVG solids.
   ───────────────────────────────────────────────────────────────────────────── */
function Box({ x, y, z, w, d, h, tone = 'base', opacity = 1, seam = true, children }) {
  const t = TONES[tone] || TONES.base;
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const b = iso(x + w, y, z);
  const c = iso(x + w, y + d, z);
  return (
    <g opacity={opacity}>
      <path d={pathOf([iso(x, y + d, z), c, iso(x + w, y + d, z + h), iso(x, y + d, z + h)])} fill={t[2]} stroke="var(--rule)" strokeWidth=".8" strokeLinejoin="round" />
      <path d={pathOf([b, c, iso(x + w, y + d, z + h), top[1]])} fill={t[1]} stroke="var(--rule)" strokeWidth=".8" strokeLinejoin="round" />
      <path d={pathOf(top)} fill={t[0]} stroke="var(--rule)" strokeWidth=".8" strokeLinejoin="round" />
      {seam && h > 8 ? (
        <path
          d={lineOf([iso(x + w, y, z + h * 0.55), iso(x + w, y + d, z + h * 0.55)])}
          fill="none"
          stroke="var(--rule)"
          strokeWidth=".5"
          opacity=".55"
        />
      ) : null}
      {children}
    </g>
  );
}

function Screws({ x, y, z, w, d, inset = 7 }) {
  const pts = [
    iso(x + inset, y + inset, z), iso(x + w - inset, y + inset, z),
    iso(x + w - inset, y + d - inset, z), iso(x + inset, y + d - inset, z),
  ];
  return (
    <g>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="2.1" fill="var(--face-y)" stroke="var(--ink-2)" strokeWidth=".5" opacity=".65" />
          <circle cx={p[0]} cy={p[1]} r=".65" fill="var(--ink-2)" opacity=".65" />
        </g>
      ))}
    </g>
  );
}

function FaceGroup({ x, y, z, children }) {
  const [sx, sy] = iso(x, y, z);
  return (
    <g transform={`matrix(${ISO_C} ${ISO_S} 0 1 ${f1(sx)} ${f1(sy)})`}>{children}</g>
  );
}

function FaceText({
  x, y, z, size = 10, fill = 'var(--ink-2)', anchor = 'start', weight = 500,
  opacity = 1, letterSpacing = '.04em', children,
}) {
  const [sx, sy] = iso(x, y, z);
  return (
    <text
      transform={`matrix(${ISO_C} ${ISO_S} 0 1 ${f1(sx)} ${f1(sy)})`}
      fontFamily="var(--mono)"
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      textAnchor={anchor}
      letterSpacing={letterSpacing}
      opacity={opacity}
    >
      {children}
    </text>
  );
}

function Screen({ id, x, y, z, w, h, children }) {
  const tl = iso(x, y, z);
  const tr = iso(x + w, y, z);
  const br = iso(x + w, y, z - h);
  const bl = iso(x, y, z - h);
  return (
    <g>
      <path d={pathOf([tl, tr, br, bl])} fill="var(--screen)" stroke="var(--rule)" strokeWidth=".8" />
      <g clipPath={`url(#${id})`}>{children}</g>
      <clipPath id={id}>
        <path d={pathOf([tl, tr, br, bl])} />
      </clipPath>
    </g>
  );
}

function Vent({ x, y, z, w, h, count = 6, color = 'var(--ink-2)', opacity = 0.28 }) {
  return (
    <g stroke={color} strokeWidth=".7" opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const v = z - (h / count) * (i + 0.5);
        return <path key={i} d={lineOf([iso(x, y, v), iso(x + w, y, v)])} fill="none" />;
      })}
    </g>
  );
}

function SideVent({ x, y, z, d, h, count = 5, color = 'var(--ink-2)', opacity = 0.24 }) {
  return (
    <g stroke={color} strokeWidth=".7" opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const v = z - (h / count) * (i + 0.5);
        return <path key={i} d={lineOf([iso(x, y + 4, v), iso(x, y + d - 4, v)])} fill="none" />;
      })}
    </g>
  );
}

function Led({ x, y, z, r = 2.2, color = 'var(--accent)', pulse = false }) {
  const p = iso(x, y, z);
  return (
    <g>
      <circle cx={p[0]} cy={p[1]} r={r * 2.4} fill={color} opacity=".1" />
      <circle cx={p[0]} cy={p[1]} r={r} fill={color} className={pulse ? 'ctv-pulse' : ''} />
      <circle cx={p[0] - r * 0.25} cy={p[1] - r * 0.25} r={r * 0.3} fill="var(--face-top)" opacity=".65" />
    </g>
  );
}

function Disc({ cx, cy, z, r, h = 4, tone = 'base', blades = 0, opacity = 1 }) {
  const t = TONES[tone];
  const top = [];
  const bottom = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    top.push(iso(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z + h));
    bottom.push(iso(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
  }
  const left = top.reduce((best, p, i) => (p[0] < top[best][0] ? i : best), 0);
  const right = top.reduce((best, p, i) => (p[0] > top[best][0] ? i : best), 0);
  const side = [];
  for (let i = right; i !== left; i = (i + 1) % 24) side.push(bottom[i]);
  side.push(bottom[left]);
  for (let i = left; i !== right; i = (i - 1 + 24) % 24) side.push(top[i]);
  const c = iso(cx, cy, z + h);
  return (
    <g opacity={opacity}>
      <path d={pathOf(side)} fill={t[2]} stroke="var(--rule)" strokeWidth=".7" />
      <path d={pathOf(top)} fill={t[0]} stroke="var(--rule)" strokeWidth=".7" />
      {blades > 0 ? (
        <g stroke="var(--ink-2)" strokeWidth=".8" opacity=".45">
          {Array.from({ length: blades }, (_, i) => {
            const a = (i / blades) * Math.PI * 2 + 0.4;
            return (
              <path
                key={i}
                d={lineOf([c, iso(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, z + h)])}
                fill="none"
              />
            );
          })}
          <circle cx={c[0]} cy={c[1]} r={r * 0.16} fill="var(--ink-2)" opacity=".5" />
        </g>
      ) : null}
    </g>
  );
}

function Diamond({ cx, cy, z, r = 12, h = 5, hot = false, dark = false, reduce = false }) {
  const top = [iso(cx, cy - r, z + h), iso(cx + r, cy, z + h), iso(cx, cy + r, z + h), iso(cx - r, cy, z + h)];
  const front = [iso(cx - r, cy, z), iso(cx, cy + r, z), iso(cx, cy + r, z + h), iso(cx - r, cy, z + h)];
  const right = [iso(cx, cy + r, z), iso(cx + r, cy, z), iso(cx + r, cy, z + h), iso(cx, cy + r, z + h)];
  const fill = dark ? 'var(--ink)' : hot ? 'var(--accent)' : 'var(--face-top)';
  return (
    <g className={hot && !reduce ? 'ctv-pulse' : ''}>
      <path d={pathOf(front)} fill={hot ? 'var(--accent)' : 'var(--face-y)'} stroke={hot ? 'var(--accent)' : 'var(--rule)'} strokeWidth=".8" opacity={hot ? 0.6 : 1} />
      <path d={pathOf(right)} fill={hot ? 'var(--accent)' : 'var(--face-x)'} stroke={hot ? 'var(--accent)' : 'var(--rule)'} strokeWidth=".8" opacity={hot ? 0.8 : 1} />
      <path d={pathOf(top)} fill={fill} stroke={hot ? 'var(--accent)' : 'var(--rule)'} strokeWidth=".9" />
      <circle cx={iso(cx, cy, z + h)[0]} cy={iso(cx, cy, z + h)[1]} r={r * 0.18} fill={dark ? 'var(--accent)' : 'var(--ink-2)'} opacity=".55" />
    </g>
  );
}

function planCircle(cx, cy, r, z = 0, n = 44) {
  const points = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    points.push(iso(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
  }
  return points;
}

/* ─────────────────────────────────────────────────────────────────────────────
   01 · BENCH — plate, feet, ruler, hazard patch, engine turntable.
   ───────────────────────────────────────────────────────────────────────────── */
const BasePlate = memo(function BasePlate() {
  const ticks = useMemo(() => {
    const out = [];
    for (let x = -700; x <= 700; x += 20) {
      const major = x % 100 === 0;
      out.push({ x, major });
    }
    return out;
  }, []);

  return (
    <g>
      <ellipse cx="600" cy="720" rx="820" ry="210" fill="var(--ink)" opacity=".07" />
      <ellipse cx="600" cy="690" rx="700" ry="170" fill="var(--ink)" opacity=".05" />

      {[
        [-720, -180], [720, -180], [-720, 180], [720, 180],
      ].map(([x, y], i) => (
        <Box key={i} x={x - 15} y={y - 15} z={-44} w={30} d={30} h={16} tone="dark" />
      ))}

      <Box x={-780} y={-240} z={-28} w={1560} d={480} h={28} tone="mid" />
      <path d={pathOf(plan(-768, -228, 1536, 456, 0.4))} fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".8" />
      <path d={pathOf(plan(-754, -214, 1508, 428, 0.7))} fill="none" stroke="var(--rule)" strokeWidth=".5" opacity=".7" />

      <path
        d={lineOf(planCircle(320, 0, 238, 0.9).concat([planCircle(320, 0, 238, 0.9)[0]]))}
        fill="none"
        stroke="var(--rule)"
        strokeWidth=".7"
        strokeDasharray="5 5"
        opacity=".7"
      />
      <path
        d={lineOf(planCircle(320, 0, 208, 1).concat([planCircle(320, 0, 208, 1)[0]]))}
        fill="none"
        stroke="var(--accent)"
        strokeWidth=".6"
        strokeDasharray="1 7"
        opacity=".5"
      />

      <path d={pathOf(plan(-450, 148, 260, 64, 1))} fill="var(--accent)" opacity=".055" />
      <g clipPath="url(#ctv-gate-hatch)" stroke="var(--accent)" strokeWidth=".8" opacity=".32">
        {Array.from({ length: 18 }, (_, i) => (
          <path
            key={i}
            d={lineOf([iso(-470 + i * 18, 148, 1), iso(-490 + i * 18, 212, 1)])}
            fill="none"
          />
        ))}
      </g>
      <defs>
        <clipPath id="ctv-gate-hatch">
          <path d={pathOf(plan(-450, 148, 260, 64, 1))} />
        </clipPath>
      </defs>

      <path d={pathOf(plan(-720, 206, 1440, 20, 1))} fill="var(--face-x)" stroke="var(--rule)" strokeWidth=".6" />
      {ticks.map(({ x, major }) => (
        <path
          key={x}
          d={lineOf([iso(x, 206, 1), iso(x, 206 + (major ? 15 : 8), 1)])}
          fill="none"
          stroke={major ? 'var(--ink-2)' : 'var(--rule)'}
          strokeWidth={major ? 0.8 : 0.5}
          opacity={major ? 0.7 : 0.6}
        />
      ))}
      {[-600, -400, -200, 0, 200, 400, 600].map((x) => {
        const p = iso(x, 236, 1);
        return (
          <text
            key={x}
            x={p[0]}
            y={p[1] + 11}
            fontFamily="var(--mono)"
            fontSize="7"
            fill="var(--muted)"
            textAnchor="middle"
            letterSpacing=".08em"
          >
            {x === 0 ? '0' : `${x / 100}`}
          </text>
        );
      })}

      <path
        d={lineOf([iso(-730, 0, 0.8), iso(730, 0, 0.8)])}
        fill="none"
        stroke="var(--rule)"
        strokeWidth=".5"
        strokeDasharray="2 8"
        opacity=".8"
      />

      <Box x={-738} y={228} z={1} w={170} d={8} h={10} tone="dark" />
      <FaceText x={-730} y={236.4} z={9} size={7.5} fill="var(--face-top)" opacity=".86">
        CARBOTRACE · BENCH 01
      </FaceText>

      <Screws x={-752} y={-208} z={1} w={1504} d={416} inset={12} />

      <g opacity=".5">
        <FaceText x={640} y={-214} z={1} size={8} fill="var(--muted)" anchor="end">
          SHEET 01 / TRACE
        </FaceText>
        <FaceText x={-664} y={-214} z={1} size={8} fill="var(--muted)">
          SCALE 1:200
        </FaceText>
      </g>
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   02 · COMMIT — instrument console with a code screen.
   ───────────────────────────────────────────────────────────────────────────── */
const CODE_LINES = [
  { text: 'def dashboard(users):', kind: 'base' },
  { text: '  out = []', kind: 'base' },
  { text: '  for u in users:      # N', kind: 'hot' },
  { text: '    orders = db.query(  # +1', kind: 'hot' },
  { text: '      "…WHERE user_id=?", u.id)', kind: 'hot' },
  { text: '    for o in orders:   # N²', kind: 'hot' },
  { text: '      items = db.query( # +1', kind: 'hot' },
  { text: '        "…WHERE order_id=?", o.id)', kind: 'hot' },
  { text: '  return out', kind: 'base' },
];

const CommitPod = memo(function CommitPod({ reduce }) {
  const x0 = -770;
  const y0 = -55;
  const cx = -640;

  return (
    <g>
      <Box x={x0 - 8} y={y0 - 8} z={0} w={276} d={126} h={10} tone="mid" />
      <Screws x={x0 - 4} y={y0 - 4} z={10} w={270} d={118} inset={9} />

      <Box x={x0 + 8} y={y0 + 2} z={10} w={244} d={36} h={204} tone="base" />
      <Box x={x0 + 8} y={y0 + 34} z={16} w={244} d={6} h={190} tone="mid" />

      <Screen id="ctv-code-screen" x={x0 + 20} y={y0 + 40.5} z={196} w={220} h={162}>
        <FaceGroup x={x0 + 20} y={y0 + 40.5} z={196}>
          <rect x="0" y="0" width="220" height="22" fill="var(--screen-ink)" opacity=".055" />
          <text x="10" y="14.5" fontFamily="var(--mono)" fontSize="8.4" fill="var(--screen-dim)" letterSpacing=".04em">
            api/dashboard.py
          </text>
          <text x="211" y="14.5" fontFamily="var(--mono)" fontSize="8.4" fill="var(--accent)" textAnchor="end" letterSpacing=".04em">
            #4821
          </text>
          <path d="M0 22H220" stroke="var(--screen-ink)" strokeWidth=".5" opacity=".18" />

          <rect x="0" y="52" width="220" height="86" fill="var(--accent)" opacity=".13" />
          <rect x="0" y="52" width="2.6" height="86" fill="var(--accent)" opacity=".95" />

          {CODE_LINES.map((line, i) => {
            const y = 36 + i * 13.2;
            const commentAt = line.text.indexOf('#');
            if (commentAt > 0) {
              return (
                <text key={i} x="10" y={y} fontFamily="var(--mono)" fontSize="9.1" fill={line.kind === 'hot' ? 'var(--screen-ink)' : 'var(--screen-dim)'}>
                  {line.text.slice(0, commentAt)}
                  <tspan fill={line.kind === 'hot' ? 'var(--accent)' : 'var(--screen-dim)'}>
                    {line.text.slice(commentAt)}
                  </tspan>
                </text>
              );
            }
            return (
              <text key={i} x="10" y={y} fontFamily="var(--mono)" fontSize="9.1" fill={line.kind === 'hot' ? 'var(--screen-ink)' : 'var(--screen-dim)'}>
                {line.text}
              </text>
            );
          })}

          <text x="10" y="153" fontFamily="var(--mono)" fontSize="7.4" fill="var(--accent)" letterSpacing=".06em">
            N+1 · 801 CALL SITES
          </text>
          <text x="210" y="153" fontFamily="var(--mono)" fontSize="7.4" fill="var(--screen-dim)" textAnchor="end">
            O(N²)
          </text>
        </FaceGroup>
      </Screen>

      <Vent x={x0 + 20} y={y0 + 40.8} z={22} w={200} h={9} count={3} opacity={0.22} />

      <Box x={x0 + 4} y={y0 - 2} z={214} w={252} d={44} h={8} tone="mid" />
      <Box x={x0 + 8} y={y0 + 2} z={222} w={26} d={24} h={5} tone="dark" />
      <Box x={x0 + 216} y={y0 + 4} z={222} w={28} d={26} h={8} tone="dark" />
      <Led x={x0 + 230} y={y0 + 17} z={231} color="var(--accent)" pulse={!reduce} />
      <Box x={x0 + 106} y={y0 + 8} z={222} w={36} d={26} h={9} tone="dark" />
      <ellipse cx={iso(cx, -34, 231)[0]} cy={iso(cx, -34, 231)[1]} rx="9" ry="4.5" fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".7" />
      <ellipse cx={iso(cx, -34, 231)[0]} cy={iso(cx, -34, 231)[1]} rx="4.4" ry="2.2" fill="var(--face-deep)" stroke="var(--rule)" strokeWidth=".5" />

      <Box x={x0 - 2} y={y0 + 20} z={96} w={10} d={16} h={62} tone="mid" />
      <Box x={x0 + 250} y={y0 + 20} z={96} w={10} d={16} h={62} tone="mid" />

      <Box x={x0 + 16} y={y0 + 54} z={2} w={154} d={8} h={20} tone="dark" />
      <FaceText x={x0 + 24} y={y0 + 62.4} z={19} size={7.4} fill="var(--face-top)" opacity=".9">
        PR #4821 · TRACE IN
      </FaceText>

      <Led x={x0 + 202} y={y0 + 58} z={12} r={2.1} color="var(--green)" />
      <Led x={x0 + 214} y={y0 + 58} z={12} r={2.1} color="var(--ink-2)" />
      <Led x={x0 + 226} y={y0 + 58} z={12} r={2.1} color="var(--accent)" />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   03 · AST — a floating tree of syntax nodes, hot loop marked in accent.
   ───────────────────────────────────────────────────────────────────────────── */
const AST_NODES = [
  { id: 'root', lx: 0, ly: 0, z: 310, r: 14, dark: true, label: 'Module' },
  { id: 'a', lx: -58, ly: -24, z: 262, r: 12, label: 'For' },
  { id: 'b', lx: 64, ly: 26, z: 258, r: 12 },
  { id: 'c', lx: -92, ly: 8, z: 214, r: 11 },
  { id: 'd', lx: -30, ly: -42, z: 214, r: 11 },
  { id: 'e', lx: 34, ly: 18, z: 212, r: 11, label: 'Call' },
  { id: 'f', lx: 96, ly: 44, z: 208, r: 10 },
  { id: 'g', lx: -108, ly: 36, z: 166, r: 10, hot: true },
  { id: 'h', lx: -54, ly: -18, z: 168, r: 10, hot: true },
  { id: 'i', lx: 8, ly: 44, z: 162, r: 10, hot: true },
  { id: 'j', lx: 62, ly: 4, z: 168, r: 10, hot: true },
  { id: 'k', lx: 112, ly: -22, z: 172, r: 10 },
  { id: 'l', lx: -72, ly: 22, z: 118, r: 9, hot: true },
  { id: 'm', lx: -8, ly: -30, z: 112, r: 9, hot: true },
  { id: 'n', lx: 50, ly: 34, z: 120, r: 9, hot: true },
];

const AST_EDGES = [
  ['root', 'a'], ['root', 'b'], ['a', 'c'], ['a', 'd'], ['a', 'e'], ['b', 'e'], ['b', 'f'],
  ['c', 'g'], ['c', 'h'], ['d', 'h'], ['d', 'i'], ['e', 'j'], ['e', 'k'],
  ['g', 'l'], ['h', 'm'], ['i', 'm'], ['i', 'n'], ['j', 'n'],
];

const AstTree = memo(function AstTree({ reduce }) {
  const cx = -320;
  const cy = 0;
  const nodeById = useMemo(() => Object.fromEntries(AST_NODES.map((n) => [n.id, n])), []);
  const nodes = AST_NODES.map((n) => ({ ...n, wx: cx + n.lx, wy: cy + n.ly }));

  return (
    <g>
      <Box x={-415} y={-60} z={0} w={190} d={120} h={10} tone="mid" />
      <Box x={-408} y={-53} z={10} w={176} d={106} h={4} tone="base" />
      <Screws x={-408} y={-53} z={14} w={176} d={106} inset={8} />

      <Box x={-350} y={-50} z={14} w={58} d={30} h={256} tone="base" />
      <Box x={-356} y={-54} z={270} w={112} d={68} h={12} tone="mid" />
      <Box x={-306} y={-44} z={282} w={64} d={22} h={6} tone="mid" />
      <SideVent x={-292} y={-48} z={224} d={26} h={160} count={10} opacity={0.28} />
      <Screws x={-344} y={-44} z={16} w={46} d={18} inset={5} />
      <FaceText x={-340} y={-20} z={238} size={6.6} fill="var(--muted)" anchor="end">
        PY
      </FaceText>

      <path
        d={lineOf([iso(-290, -22, 282), iso(cx, cy, 318)])}
        fill="none"
        stroke="var(--rule)"
        strokeWidth=".7"
        opacity=".8"
      />

      {AST_EDGES.map(([from, to]) => {
        const a = nodeById[from];
        const b = nodeById[to];
        const hot = a.hot && b.hot;
        return (
          <path
            key={`${from}-${to}`}
            d={lineOf([iso(cx + a.lx, cy + a.ly, a.z), iso(cx + b.lx, cy + b.ly, b.z)])}
            fill="none"
            stroke={hot ? 'var(--accent)' : 'var(--rule)'}
            strokeWidth={hot ? 1 : 0.7}
            opacity={hot ? 0.48 : 0.85}
          />
        );
      })}

      {[...nodes].sort((a, b) => (a.lx + a.ly + a.z * 0.12) - (b.lx + b.ly + b.z * 0.12)).map((n) => (
        <g key={n.id}>
          <Diamond cx={n.wx} cy={n.wy} z={n.z} r={n.r} h={5} hot={n.hot} dark={n.dark} reduce={reduce} />
          {n.label ? (
            <text
              x={iso(n.wx, n.wy, n.z)[0] + 17}
              y={iso(n.wx, n.wy, n.z)[1] - 7}
              fontFamily="var(--mono)"
              fontSize="7.6"
              fill={n.dark ? 'var(--accent)' : 'var(--muted)'}
              letterSpacing=".08em"
            >
              {n.label}
            </text>
          ) : null}
        </g>
      ))}

      <g>
        <path
          d={lineOf([iso(cx + 152, cy - 8, 270), iso(cx + 186, cy - 30, 306)])}
          fill="none"
          stroke="var(--accent)"
          strokeWidth=".7"
          opacity=".55"
        />
        <text
          x={iso(cx + 190, cy - 34, 310)[0]}
          y={iso(cx + 190, cy - 34, 310)[1]}
          fontFamily="var(--mono)"
          fontSize="24"
          fontWeight="500"
          fill="var(--accent)"
          letterSpacing="-.04em"
        >
          O(N²)
        </text>
        <text
          x={iso(cx + 192, cy - 34, 292)[0]}
          y={iso(cx + 192, cy - 34, 292)[1]}
          fontFamily="var(--mono)"
          fontSize="7.6"
          fill="var(--muted)"
          letterSpacing=".09em"
        >
          801 QUERY SITES
        </text>
      </g>

      <Box x={-390} y={-12} z={14} w={96} d={8} h={15} tone="dark" />
      <FaceText x={-382} y={-3.2} z={27} size={6.6} fill="var(--face-top)" opacity=".88">
        TREE-SITTER / PY
      </FaceText>

      <Box x={-345} y={-16} z={282} w={50} d={30} h={8} tone="dark" />
      <ellipse cx={iso(cx, 0, 291)[0]} cy={iso(cx, 0, 291)[1]} rx="8" ry="4" fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".6" />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   04 · CI RUNNER — matrix machine, progress bar and watt-hour meter.
   ───────────────────────────────────────────────────────────────────────────── */
const CiRunner = memo(function CiRunner({ barRef, meterRef, reduce }) {
  const x0 = -115;
  const y0 = -70;
  const faceY = 58.5;
  const uncached = new Set([1, 3, 4, 6, 8, 10]);

  return (
    <g>
      <Box x={x0 - 10} y={y0 - 10} z={0} w={250} d={160} h={10} tone="mid" />
      <Screws x={x0 - 4} y={y0 - 4} z={10} w={238} d={148} inset={9} />

      <Box x={x0 + 6} y={y0 + 4} z={10} w={218} d={124} h={194} tone="base" />
      <SideVent x={x0 + 224} y={y0 + 8} z={118} d={108} h={58} count={9} opacity={0.26} />
      <SideVent x={x0 + 224} y={y0 + 8} z={64} d={108} h={24} count={4} opacity={0.2} />

      <Screen id="ctv-ci-screen" x={-96} y={faceY} z={196} w={192} h={58}>
        <FaceGroup x={-96} y={faceY} z={196}>
          <rect x="0" y="0" width="192" height="15" fill="var(--screen-ink)" opacity=".05" />
          <text x="7" y="10.4" fontFamily="var(--mono)" fontSize="7.6" fill="var(--screen-ink)" letterSpacing=".08em">
            GITHUB ACTIONS
          </text>
          <text x="185" y="10.4" fontFamily="var(--mono)" fontSize="7.2" fill="var(--green)" textAnchor="end">
            RUN 4821
          </text>
          <text x="7" y="26" fontFamily="var(--mono)" fontSize="7" fill="var(--screen-dim)">
            [matrix] 7 × 2 · ubuntu-latest
          </text>
          <text x="7" y="36.5" fontFamily="var(--mono)" fontSize="7" fill="var(--screen-dim)">
            [cache]  6 miss · node 20
          </text>
          <text x="7" y="47" fontFamily="var(--mono)" fontSize="7" fill="var(--accent)">
            [job]    reconstructing matrix…
          </text>
          <rect x="148" y="23" width="37" height="9" fill="var(--accent)" opacity=".16" stroke="var(--accent)" strokeWidth=".5" />
          <text x="166.5" y="30" fontFamily="var(--mono)" fontSize="6.4" fill="var(--accent)" textAnchor="middle">
            14 JOBS
          </text>
        </FaceGroup>
      </Screen>

      <FaceGroup x={-96} y={faceY + 0.3} z={128}>
        <rect x="0" y="0" width="192" height="7" fill="var(--face-deep)" opacity=".55" />
        <rect ref={barRef} x="0" y="0" width="0" height="7" fill="var(--accent)" />
        <text x="0" y="18" fontFamily="var(--mono)" fontSize="6.8" fill="var(--muted)" letterSpacing=".08em">
          MATRIX PROGRESS
        </text>
        <text x="192" y="18" fontFamily="var(--mono)" fontSize="6.8" fill="var(--ink-2)" textAnchor="end">
          14/14 JOBS
        </text>
      </FaceGroup>

      <FaceGroup x={-96} y={faceY + 0.3} z={104}>
        <text x="0" y="0" fontFamily="var(--mono)" fontSize="6.4" fill="var(--muted)" letterSpacing=".08em">
          JOB MATRIX · 6 UNCACHED
        </text>
        {Array.from({ length: 14 }, (_, i) => {
          const col = i % 7;
          const row = Math.floor(i / 7);
          return (
            <g key={i} className={uncached.has(i) && !reduce ? 'ctv-pulse' : ''}>
              <rect
                x={col * 27}
                y={8 + row * 13}
                width="23"
                height="10"
                fill={uncached.has(i) ? 'var(--accent)' : 'var(--face-x)'}
                fillOpacity={uncached.has(i) ? 0.16 : 0.85}
                stroke={uncached.has(i) ? 'var(--accent)' : 'var(--rule)'}
                strokeWidth=".6"
              />
              <circle cx={col * 27 + 4} cy={13 + row * 13} r="1.2" fill={uncached.has(i) ? 'var(--accent)' : 'var(--green)'} />
              <path d={`M${col * 27 + 8} ${13 + row * 13}H${col * 27 + 19}`} stroke="var(--ink-2)" strokeWidth=".5" opacity=".35" />
            </g>
          );
        })}
      </FaceGroup>

      <FaceGroup x={-94} y={faceY + 0.3} z={74}>
        <circle cx="25" cy="25" r="23" fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".8" />
        <circle cx="25" cy="25" r="19.5" fill="none" stroke="var(--rule)" strokeWidth=".5" opacity=".7" />
        {Array.from({ length: 13 }, (_, i) => {
          const a = (-210 + i * 20) * (Math.PI / 180);
          const inner = i % 3 === 0 ? 15 : 17.5;
          return (
            <line
              key={i}
              x1={25 + Math.cos(a) * inner}
              y1={25 + Math.sin(a) * inner}
              x2={25 + Math.cos(a) * 20}
              y2={25 + Math.sin(a) * 20}
              stroke={i > 9 ? 'var(--accent)' : 'var(--ink-2)'}
              strokeWidth={i % 3 === 0 ? 0.9 : 0.5}
              opacity={i % 3 === 0 ? 0.8 : 0.4}
            />
          );
        })}
        <g ref={meterRef}>
          <line x1="25" y1="25" x2="25" y2="9" stroke="var(--accent)" strokeWidth="1.1" />
          <circle cx="25" cy="9" r="1.4" fill="var(--accent)" />
        </g>
        <circle cx="25" cy="25" r="2" fill="var(--ink-2)" />
        <text x="25" y="46" fontFamily="var(--mono)" fontSize="6.2" fill="var(--muted)" textAnchor="middle" letterSpacing=".08em">
          WATT·HOUR
        </text>
        <text x="25" y="54" fontFamily="var(--mono)" fontSize="7.2" fill="var(--ink-2)" textAnchor="middle">
          214.6
        </text>
      </FaceGroup>

      <Vent x={-16} y={faceY + 0.3} z={66} w={70} h={8} count={3} opacity={0.25} />

      <Box x={-10} y={52} z={4} w={120} d={6} h={16} tone="dark" />
      <FaceText x={-4} y={59.6} z={16} size={6.3} fill="var(--face-top)" opacity=".9">
        CI RUNNER / UBUNTU-LATEST
      </FaceText>

      <Led x={76} y={59} z={44} r={2} color="var(--accent)" pulse={!reduce} />
      <Led x={88} y={59} z={44} r={2} color="var(--green)" />
      <Led x={100} y={59} z={44} r={2} color="var(--ink-2)" />

      <Box x={-30} y={-24} z={204} w={60} d={48} h={34} tone="base" />
      <Box x={-36} y={-30} z={238} w={72} d={60} h={5} tone="mid" />
      <Disc cx={0} cy={0} z={243} r={23} h={6} blades={4} tone="mid" />
      <Box x={-13} y={-9} z={249} w={26} d={18} h={6} tone="dark" />
      <ellipse cx={iso(0, 0, 258)[0]} cy={iso(0, 0, 258)[1]} rx="9" ry="4.4" fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".6" />
      <ellipse cx={iso(0, 0, 258)[0]} cy={iso(0, 0, 258)[1]} rx="4" ry="2" fill="var(--face-deep)" />

      <path
        d={lineOf([iso(x0 + 224, -30, 150), iso(x0 + 236, -30, 40), iso(x0 + 236, 40, 40)])}
        fill="none"
        stroke="var(--ink-2)"
        strokeWidth="1.4"
        opacity=".3"
      />
      <path
        d={lineOf([iso(x0 + 224, 6, 150), iso(x0 + 238, 6, 56), iso(x0 + 238, 54, 56)])}
        fill="none"
        stroke="var(--ink-2)"
        strokeWidth="1.4"
        opacity=".22"
      />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   05 · RDS RACK — server row, fan stack, heat.
   ───────────────────────────────────────────────────────────────────────────── */
const DataRack = memo(function DataRack({ reduce }) {
  const x0 = 235;
  const y0 = -65;
  const faceY = 55.5;

  return (
    <g>
      <Box x={x0 - 10} y={y0 - 10} z={0} w={190} d={150} h={10} tone="mid" />
      <Screws x={x0 - 4} y={y0 - 4} z={10} w={178} d={138} inset={8} />

      <Box x={x0 + 5} y={y0 + 10} z={10} w={160} d={110} h={180} tone="base" />
      <SideVent x={x0 + 165} y={y0 + 14} z={150} d={94} h={112} count={13} opacity={0.24} />

      <Box x={242} y={faceY - 1} z={176} w={148} d={5} h={25} tone="dark" />
      <FaceText x={249} y={faceY + 3.6} z={196} size={7.3} fill="var(--face-top)" opacity=".9">
        RDS · PROD-1
      </FaceText>
      <FaceText x={249} y={faceY + 3.6} z={185} size={6.6} fill="var(--accent)">
        100,000 REQUESTS / DAY
      </FaceText>

      <FaceGroup x={242} y={faceY + 1} z={168}>
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect
              x="0"
              y={i * 17}
              width="148"
              height="13"
              fill="var(--face-top)"
              stroke="var(--rule)"
              strokeWidth=".6"
            />
            <rect x="4" y={i * 17 + 4} width="80" height="1.3" fill="var(--ink-2)" opacity=".3" />
            <rect x="4" y={i * 17 + 8} width="56" height="1.3" fill="var(--ink-2)" opacity=".2" />
            <circle cx="136" cy={i * 17 + 4.4} r="1.1" fill={i === 2 ? 'var(--accent)' : 'var(--green)'} className={i === 2 && !reduce ? 'ctv-pulse' : ''} />
            <circle cx="141" cy={i * 17 + 4.4} r="1.1" fill="var(--ink-2)" opacity=".45" />
            <path d={`M125 ${i * 17 + 9}H143`} stroke="var(--ink-2)" strokeWidth=".5" opacity=".25" />
          </g>
        ))}
      </FaceGroup>

      <Box x={x0 + 14} y={52} z={4} w={132} d={6} h={16} tone="dark" />
      <FaceText x={x0 + 21} y={58.6} z={16} size={6.5} fill="var(--face-top)" opacity=".86">
        DB.R6G.LARGE / US-EAST-1
      </FaceText>

      <Box x={296} y={-20} z={190} w={48} d={40} h={26} tone="base" />
      <Box x={290} y={-26} z={216} w={60} d={52} h={5} tone="mid" />
      <Disc cx={320} cy={0} z={221} r={20} h={5} blades={3} tone="mid" />
      <Box x={307} y={-8} z={226} w={26} d={16} h={5} tone="dark" />
      <ellipse cx={iso(320, 0, 231.5)[0]} cy={iso(320, 0, 231.5)[1]} rx="8" ry="4" fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".6" />
      <ellipse cx={iso(320, 0, 231.5)[0]} cy={iso(320, 0, 231.5)[1]} rx="3.4" ry="1.7" fill="var(--face-deep)" />

      <Led x={394} y={faceY} z={20} r={2} color="var(--accent)" pulse={!reduce} />
      <Led x={382} y={faceY} z={20} r={2} color="var(--green)" />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   06 · REGION RACKS — two grids, two intensities, two plumes.
   ───────────────────────────────────────────────────────────────────────────── */
const RegionRack = memo(function RegionRack({ region, intensity, reduce }) {
  const m = machineById(region);
  const x0 = m.cx - 75;
  const y0 = m.cy - 50;
  const faceY = m.cy + 45.5;
  const isHigh = intensity >= 100;

  return (
    <g>
      <Box x={x0 - 10} y={y0 - 10} z={0} w={170} d={120} h={10} tone="mid" />
      <Screws x={x0 - 4} y={y0 - 4} z={10} w={158} d={108} inset={8} />

      <Box x={x0 + 5} y={y0 + 5} z={10} w={140} d={90} h={180} tone="base" />
      <SideVent x={x0 + 145} y={y0 + 9} z={158} d={78} h={112} count={11} opacity={0.26} />

      <Screen id={`ctv-region-${region}`} x={x0 + 12} y={faceY} z={180} w={126} h={56}>
        <FaceGroup x={x0 + 12} y={faceY} z={180}>
          <text x="0" y="10" fontFamily="var(--mono)" fontSize="8.4" fill="var(--screen-ink)" letterSpacing=".08em">
            {region === 'useast' ? 'us-east-1' : 'eu-west-1'}
          </text>
          <text x="126" y="10" fontFamily="var(--mono)" fontSize="6.4" fill={isHigh ? 'var(--accent)' : 'var(--green)'} textAnchor="end" letterSpacing=".08em">
            LIVE
          </text>
          <text x="0" y="38" fontFamily="var(--mono)" fontSize="27" fill={isHigh ? 'var(--accent)' : 'var(--green)'} letterSpacing="-.05em">
            {intensity}
          </text>
          <text x="0" y="50" fontFamily="var(--mono)" fontSize="6.2" fill="var(--screen-dim)" letterSpacing=".08em">
            gCO₂e / kWh · GRID INTENSITY
          </text>
        </FaceGroup>
      </Screen>

      <FaceGroup x={x0 + 12} y={faceY + 0.3} z={116}>
        <rect x="0" y="0" width="126" height="8" fill="var(--face-deep)" opacity=".55" />
        <rect x="0" y="0" width={(126 * Math.min(intensity, 412)) / 412} height="8" fill={isHigh ? 'var(--accent)' : 'var(--green)'} />
        <text x="0" y="20" fontFamily="var(--mono)" fontSize="6.4" fill="var(--muted)" letterSpacing=".08em">
          {region === 'useast' ? 'COAL / GAS MIX' : 'WIND / HYDRO'}
        </text>
      </FaceGroup>

      <Box x={x0 + 18} y={faceY - 2} z={22} w={104} d={5} h={15} tone="dark" />
      <FaceText x={x0 + 24} y={faceY + 3.6} z={33} size={6.4} fill="var(--face-top)" opacity=".88">
        {region === 'useast' ? 'RACK A · 412' : 'RACK B · 028'}
      </FaceText>

      <Box x={x0 + 50} y={y0 + 32} z={190} w={40} d={26} h={26} tone="base" />
      <Box x={x0 + 44} y={y0 + 26} z={216} w={52} d={38} h={4} tone="mid" />
      <Box x={x0 + 54} y={y0 + 36} z={220} w={32} d={22} h={16} tone="base" />
      <Box x={x0 + 58} y={y0 + 40} z={236} w={24} d={16} h={6} tone="mid" />
      <ellipse cx={iso(m.cx, m.cy, 242.5)[0]} cy={iso(m.cx, m.cy, 242.5)[1]} rx="8" ry="4" fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".6" />
      <ellipse cx={iso(m.cx, m.cy, 242.5)[0]} cy={iso(m.cx, m.cy, 242.5)[1]} rx="3.4" ry="1.7" fill="var(--face-deep)" />

      <Led x={x0 + 134} y={faceY} z={24} r={2} color={isHigh ? 'var(--accent)' : 'var(--green)'} pulse={!reduce && isHigh} />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   07 · GATE — a portal, a barrier, a status lamp and a patch panel.
   ───────────────────────────────────────────────────────────────────────────── */
const Gate = memo(function Gate({ armRef, statusRef, lampRef, patchRef, scanRef, reduce }) {
  const cx = -320;
  const y0 = -60;
  const pivot = iso(-414, -50, 112);
  const armEnd = iso(-414, 50, 112);

  return (
    <g>
      <Box x={cx - 130} y={y0} z={0} w={260} d={120} h={10} tone="mid" />
      <Screws x={cx - 124} y={y0 + 6} z={10} w={248} d={108} inset={8} />

      <Box x={cx - 118} y={-20} z={10} w={28} d={40} h={204} tone="base" />
      <Box x={cx + 90} y={-20} z={10} w={28} d={40} h={204} tone="base" />
      <Box x={cx - 125} y={-24} z={214} w={250} d={48} h={22} tone="mid" />
      <Box x={cx - 118} y={-18} z={236} w={236} d={36} h={6} tone="base" />
      <Box x={cx - 104} y={-4} z={18} w={208} d={12} h={4} tone="dark" />

      <FaceGroup x={cx - 96} y={24.4} z={230}>
        <text x="0" y="0" fontFamily="var(--mono)" fontSize="7.4" fill="var(--face-top)" letterSpacing=".14em">
          CARBOTRACE GATE
        </text>
        <text x="176" y="0" fontFamily="var(--mono)" fontSize="6.4" fill="var(--accent)" textAnchor="end" letterSpacing=".1em">
          PR #4821
        </text>
      </FaceGroup>

      <FaceGroup x={cx - 90} y={20.3} z={188}>
        <rect x="0" y="0" width="180" height="98" fill="var(--accent)" opacity=".035" />
        <path d="M0 0H180M0 98H180" stroke="var(--accent)" strokeWidth=".5" opacity=".3" strokeDasharray="3 5" />
        <rect ref={scanRef} x="0" y="0" width="180" height="1.2" fill="var(--accent)" opacity=".8" />
      </FaceGroup>

      <Screen id="ctv-gate-status" x={cx - 82} y={20.6} z={196} w={164} h={30}>
        <FaceGroup x={cx - 82} y={20.6} z={196}>
          <text x="82" y="12" fontFamily="var(--mono)" fontSize="7.2" fill="var(--screen-dim)" textAnchor="middle" letterSpacing=".18em">
            MERGE STATUS
          </text>
          <text ref={statusRef} x="82" y="24" fontFamily="var(--mono)" fontSize="8.8" fill="var(--accent)" textAnchor="middle" letterSpacing=".18em">
            BLOCKED
          </text>
        </FaceGroup>
      </Screen>

      <path
        d={lineOf([iso(-414, -20, 112), pivot])}
        fill="none"
        stroke="var(--face-deep)"
        strokeWidth="9"
        strokeLinecap="round"
      />

      <g ref={armRef} transform={`rotate(0 ${f1(pivot[0])} ${f1(pivot[1])})`}>
        <line x1={pivot[0]} y1={pivot[1]} x2={armEnd[0]} y2={armEnd[1]} stroke="var(--face-deep)" strokeWidth="13" strokeLinecap="round" />
        <line x1={pivot[0]} y1={pivot[1]} x2={armEnd[0]} y2={armEnd[1]} stroke="var(--accent)" strokeWidth="9" strokeLinecap="butt" strokeDasharray="13 9" opacity=".92" />
        <circle cx={pivot[0]} cy={pivot[1]} r="7" fill="var(--face-top)" stroke="var(--ink-2)" strokeWidth="1" />
        <circle cx={pivot[0]} cy={pivot[1]} r="2.4" fill="var(--ink)" />
        <circle cx={armEnd[0]} cy={armEnd[1]} r="4.4" fill="var(--panel)" stroke="var(--accent)" strokeWidth=".9" />
      </g>

      <Box x={cx - 126} y={-12} z={50} w={24} d={24} h={22} tone="dark" />
      <g>
        <circle cx={iso(cx - 114, 0, 80)[0]} cy={iso(cx - 114, 0, 80)[1]} r="7.5" fill="var(--accent)" opacity=".12" />
        <circle ref={lampRef} cx={iso(cx - 114, 0, 80)[0]} cy={iso(cx - 114, 0, 80)[1]} r="4" fill="var(--accent)" />
      </g>

      <FaceText x={cx - 104} y={42} z={13} size={7} fill="var(--muted)">
        EGRESS / PR-4821
      </FaceText>

      <g ref={patchRef} opacity="0" style={{ transition: 'opacity .2s linear' }}>
        <Box x={cx - 40} y={-96} z={236} w={166} d={10} h={92} tone="dark" />
        <Screen id="ctv-patch" x={cx - 34} y={-86.5} z={320} w={154} h={78}>
          <FaceGroup x={cx - 34} y={-86.5} z={320}>
            <text x="0" y="9" fontFamily="var(--mono)" fontSize="7" fill="var(--green)" letterSpacing=".1em">
              LOCAL LLM · PATCH 01
            </text>
            <text x="0" y="27" fontFamily="var(--mono)" fontSize="7.4" fill="var(--screen-ink)">
              rows = db.query(
            </text>
            <text x="0" y="38" fontFamily="var(--mono)" fontSize="7.4" fill="var(--screen-dim)">
              "…WHERE user_id IN (?)",
            </text>
            <text x="0" y="49" fontFamily="var(--mono)" fontSize="7.4" fill="var(--screen-dim)">
              tuple(user_ids))
            </text>
            <text x="0" y="67" fontFamily="var(--mono)" fontSize="6.6" fill="var(--green)">
              −91.8% gCO₂e · re-scored
            </text>
          </FaceGroup>
        </Screen>
        <path
          d={lineOf([iso(cx - 40, -86, 236), iso(cx - 76, -40, 226)])}
          fill="none"
          stroke="var(--green)"
          strokeWidth=".7"
          strokeDasharray="2 4"
          opacity=".7"
        />
        <text
          x={iso(cx - 34, -96, 338)[0]}
          y={iso(cx - 34, -96, 338)[1]}
          fontFamily="var(--mono)"
          fontSize="7"
          fill="var(--green)"
          letterSpacing=".1em"
        >
          PATCHED · MERGED
        </text>
      </g>

      <Box x={cx - 112} y={68} z={1} w={82} d={14} h={5} tone="dark" />
      <FaceText x={cx - 106} y={74.5} z={5} size={6} fill="var(--accent)">
        BLOCKED / 6,320 kg
      </FaceText>
      <Box x={cx + 20} y={68} z={1} w={88} d={14} h={5} tone="dark" />
      <FaceText x={cx + 26} y={74.5} z={5} size={6} fill="var(--green)">
        MERGED / 517 kg
      </FaceText>

      {!reduce ? <Led x={cx + 104} y={22} z={242} r={2} color="var(--green)" /> : null}
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   PLUMES — screen-space smoke puffs. The parent rAF moves them.
   ───────────────────────────────────────────────────────────────────────────── */
const Plume = memo(function Plume({ id, cx, cy, z, count = 9, color, puffRefs }) {
  const base = iso(cx, cy, z);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <g
          key={`${id}-${i}`}
          ref={(el) => {
            if (el) puffRefs.current[`${id}-${i}`] = el;
          }}
          opacity="0"
        >
          <ellipse cx="0" cy="0" rx={16 + (i % 4) * 5} ry={13 + (i % 3) * 4} fill={color} opacity=".16" />
          <ellipse cx="0" cy="0" rx={9 + (i % 3) * 3} ry={7 + (i % 2) * 2} fill={color} opacity=".2" />
        </g>
      ))}
      <ellipse cx={base[0]} cy={base[1]} rx="20" ry="8" fill={color} opacity=".1" />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   08 · ENGINE — 11 assemblies around an SCI core; hover separates them.
   ───────────────────────────────────────────────────────────────────────────── */
const ASSEMBLIES = [
  {
    id: 'parser', name: 'AST Parser', code: 'P-01', kind: 'parser', dx: -235, dy: -30, z: 170, label: [-18, -14, 'end'],
    desc: 'Turns the PR diff into a syntax tree and locates the functions that changed.',
    detail: '801 CALL SITES',
  },
  {
    id: 'analyzer', name: 'Static Analyzer', code: 'P-02', kind: 'analyzer', dx: -150, dy: -140, z: 240, label: [0, -30, 'middle'],
    desc: 'Flattens nested iterators and marks every N+1 query site before execution.',
    detail: '2 ITERATORS · 801 SITES',
  },
  {
    id: 'scorer', name: 'Complexity Scorer', code: 'P-03', kind: 'scorer', dx: -20, dy: -200, z: 280, label: [20, -12, 'start'],
    desc: 'Scores the hot path from the tree so CI knows where the next watt will go.',
    detail: 'O(N²) FLAGGED',
  },
  {
    id: 'ci', name: 'CI Telemetry', code: 'P-04', kind: 'ci', dx: 110, dy: -170, z: 255, label: [20, 8, 'start'],
    desc: 'Reads the runner matrix, cache state and job timing from the CI provider.',
    detail: '14 JOBS · 6 MISSES',
  },
  {
    id: 'runner', name: 'Runner Model', code: 'P-05', kind: 'runner', dx: 220, dy: -70, z: 205, label: [20, 12, 'start'],
    desc: 'Models vCPU-seconds and wall time for every job, including cold starts.',
    detail: '214.6 Wh / RUN',
  },
  {
    id: 'cache', name: 'Cache Analyzer', code: 'P-06', kind: 'cache', dx: 250, dy: 40, z: 145, label: [20, 18, 'start'],
    desc: 'Prices each cache miss against a warm runner and recovers the avoidable work.',
    detail: '6 MISSES',
  },
  {
    id: 'iac', name: 'IaC Reader', code: 'P-07', kind: 'iac', dx: 165, dy: 150, z: 95, label: [16, 26, 'start'],
    desc: 'Reads instance types, services and regions from the infrastructure files.',
    detail: 'db.r6g.large · us-east-1',
  },
  {
    id: 'grid', name: 'Grid Intensity', code: 'P-08', kind: 'grid', dx: 30, dy: 195, z: 125, label: [-20, 20, 'end'],
    desc: 'Looks up live grid carbon intensity for the region where the job will run.',
    detail: '412 gCO₂e / kWh',
  },
  {
    id: 'patcher', name: 'Local LLM Patcher', code: 'P-10', kind: 'patcher', dx: -120, dy: 155, z: 165, label: [-20, 8, 'end'],
    desc: 'Rewrites the hot loop locally and proposes the diff — no code leaves the machine.',
    detail: 'O(N²) → O(1)',
  },
  {
    id: 'gate', name: 'PR Merge Gate', code: 'P-11', kind: 'gate', dx: -235, dy: 70, z: 215, label: [-20, -14, 'end'],
    desc: 'Blocks the merge until the trace and the carbon budget both pass.',
    detail: '91.8% AVOIDED',
  },
];

const CORE_ASSEMBLY = {
  id: 'core',
  name: 'SCI Engine',
  code: 'P-09',
  desc: 'Fuses energy, grid intensity, embodied carbon and request volume into one score.',
  detail: '((E × I) + M) / R',
};

const CORE = { dx: 0, dy: 0, z: 110 };

function moduleDetails(kind, mx, my, mz) {
  const top = mz + 30.6;
  switch (kind) {
    case 'parser':
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={pathOf(plan(mx - 24 + i * 4, my - 16 + i * 6, 40, 22, top + i * 2.2))}
              fill="var(--face-x)"
              stroke="var(--rule)"
              strokeWidth=".5"
            />
          ))}
          <Diamond cx={mx} cy={my + 4} z={top + 7} r={7} h={3} />
        </g>
      );
    case 'analyzer':
      return (
        <g>
          <Disc cx={mx - 6} cy={my - 2} z={top} r={11} h={3} tone="base" />
          <path
            d={lineOf([iso(mx + 2, my + 4, top + 3), iso(mx + 15, my + 13, top + 3)])}
            stroke="var(--ink-2)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".6"
          />
          <path
            d={lineOf([iso(mx - 22, my - 14, top + 1), iso(mx + 10, my - 14, top + 1)])}
            stroke="var(--accent)"
            strokeWidth=".7"
            opacity=".6"
          />
        </g>
      );
    case 'scorer':
      return (
        <g>
          <Disc cx={mx} cy={my} z={top} r={11} h={2} tone="base" />
          <path d={lineOf([iso(mx, my, top + 4), iso(mx + 6, my - 6, top + 4)])} stroke="var(--accent)" strokeWidth="1" />
          <circle cx={iso(mx, my, top + 4)[0]} cy={iso(mx, my, top + 4)[1]} r="1.4" fill="var(--ink-2)" />
        </g>
      );
    case 'ci':
      return (
        <g>
          {Array.from({ length: 6 }, (_, i) => {
            const bx = mx - 26 + (i % 3) * 18;
            const by = my - 12 + Math.floor(i / 3) * 12;
            return (
              <path
                key={i}
                d={pathOf(plan(bx, by, 14, 9, top))}
                fill={i === 4 ? 'var(--accent)' : 'var(--face-x)'}
                fillOpacity={i === 4 ? 0.32 : 1}
                stroke={i === 4 ? 'var(--accent)' : 'var(--rule)'}
                strokeWidth=".5"
              />
            );
          })}
        </g>
      );
    case 'runner':
      return (
        <g>
          <Disc cx={mx} cy={my} z={top} r={13} h={3} blades={4} tone="base" />
          <ellipse
            cx={iso(mx, my, top + 3)[0]}
            cy={iso(mx, my, top + 3)[1]}
            rx="2.4"
            ry="1.4"
            fill="var(--accent)"
          />
        </g>
      );
    case 'cache':
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={pathOf(plan(mx - 27 + (i % 4) * 14, my - 14 + Math.floor(i / 4) * 11, 11, 8, top))}
              fill={i === 6 ? 'var(--green)' : 'var(--face-x)'}
              fillOpacity={i === 6 ? 0.45 : 1}
              stroke={i === 6 ? 'var(--green)' : 'var(--rule)'}
              strokeWidth=".5"
            />
          ))}
        </g>
      );
    case 'iac':
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path
                d={pathOf(plan(mx - 22 + i * 3, my - 14 + i * 4, 36, 24, top + i * 3))}
                fill="var(--face-top)"
                stroke="var(--rule)"
                strokeWidth=".6"
              />
              <path
                d={lineOf([
                  iso(mx - 17 + i * 3, my - 9 + i * 4, top + i * 3 + 0.3),
                  iso(mx + 9 + i * 3, my - 9 + i * 4, top + i * 3 + 0.3),
                ])}
                stroke="var(--ink-2)"
                strokeWidth=".5"
                opacity=".28"
              />
            </g>
          ))}
        </g>
      );
    case 'grid':
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              x={mx - 24 + i * 14}
              y={my + 4}
              z={top}
              w={7}
              d={9}
              h={[10, 22, 14, 28][i]}
              tone={i === 3 ? 'mid' : 'base'}
            />
          ))}
        </g>
      );
    case 'patcher':
      return (
        <g>
          <Box x={mx - 26} y={my - 16} z={top} w={52} d={32} h={22} tone="dark" />
          <FaceText x={mx - 20} y={my + 16.6} z={mz + 48} size={7.4} fill="var(--green)">
            › patch
          </FaceText>
          <FaceText x={mx - 20} y={my + 16.6} z={mz + 39} size={6} fill="var(--screen-dim)">
            O(N²) → O(1)
          </FaceText>
        </g>
      );
    case 'gate':
      return (
        <g>
          <path d={lineOf([iso(mx - 20, my - 12, top), iso(mx - 20, my - 12, top + 14)])} stroke="var(--ink-2)" strokeWidth="1.6" />
          <path d={lineOf([iso(mx + 20, my + 12, top), iso(mx + 20, my + 12, top + 14)])} stroke="var(--ink-2)" strokeWidth="1.6" />
          <path d={lineOf([iso(mx - 23, my - 12, top + 14), iso(mx + 24, my + 12, top + 14)])} stroke="var(--accent)" strokeWidth="2.2" />
          <circle cx={iso(mx + 20, my + 12, top + 9)[0]} cy={iso(mx + 20, my + 12, top + 9)[1]} r="2" fill="var(--green)" />
        </g>
      );
    default:
      return null;
  }
}

const Engine = memo(function Engine({ open, onToggle, onSelect, selected, reduce, focusable }) {
  const [hover, setHover] = useState(false);
  const [hovered, setHovered] = useState(null);
  const exploded = open || hover || Boolean(selected);
  const core = iso(320, 0, CORE.z);
  const coreSelected = selected === 'core';

  const pick = (id) => (event) => {
    event.stopPropagation();
    onSelect(id);
  };
  const keyPick = (id) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onSelect(id);
    }
  };

  return (
    <g
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setHovered(null);
      }}
      onClick={onToggle}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHover(false);
          setHovered(null);
        }
      }}
      role="group"
      aria-hidden={!focusable}
      aria-label="Carbotrace engine assemblies. Choose a block to inspect it."
      style={{ cursor: 'pointer' }}
    >
      <Disc cx={320} cy={0} z={0} r={238} h={7} tone="mid" />
      <path d={lineOf(planCircle(320, 0, 218, 8).concat([planCircle(320, 0, 218, 8)[0]]))} fill="none" stroke="var(--rule)" strokeWidth=".6" strokeDasharray="2 6" opacity=".8" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={iso(320 + Math.cos(a) * 224, Math.sin(a) * 224, 8)[0]} cy={iso(320 + Math.cos(a) * 224, Math.sin(a) * 224, 8)[1]} r="2" fill="var(--ink-2)" opacity=".4" />;
      })}

      {ASSEMBLIES.map((a) => {
        const p = iso(320 + a.dx, a.dy, a.z);
        return (
          <path key={`stem-${a.id}`} d={lineOf([core, p])} fill="none" stroke="var(--rule)" strokeWidth=".7" strokeDasharray="2 5" opacity={exploded ? 0.85 : 0.5} />
        );
      })}

      <g
        className="ctv-module"
        role="button"
        tabIndex={focusable ? 0 : -1}
        aria-pressed={coreSelected}
        aria-label={`${CORE_ASSEMBLY.code} ${CORE_ASSEMBLY.name}. ${CORE_ASSEMBLY.desc}`}
        onClick={pick('core')}
        onKeyDown={keyPick('core')}
        onPointerEnter={() => {
          setHover(true);
          setHovered('core');
        }}
        onPointerLeave={() => setHovered((cur) => (cur === 'core' ? null : cur))}
        onFocus={() => {
          setHover(true);
          setHovered('core');
        }}
        onBlur={(event) => {
          setHovered((cur) => (cur === 'core' ? null : cur));
          if (!event.currentTarget.ownerSVGElement?.contains(event.relatedTarget)) setHover(false);
        }}
      >
        <Disc cx={320} cy={0} z={40} r={54} h={7} tone="mid" />
        <Disc cx={320} cy={0} z={47} r={44} h={38} tone="base" />
        <Disc cx={320} cy={0} z={85} r={58} h={7} tone="mid" />
        <Disc cx={320} cy={0} z={92} r={36} h={58} tone="base" />
        <Disc cx={320} cy={0} z={150} r={48} h={7} tone="mid" />
        <Disc cx={320} cy={0} z={157} r={30} h={32} tone="base" />
        <Disc cx={320} cy={0} z={189} r={40} h={6} tone="mid" />
        <FaceText x={320 - 30} y={35.5} z={132} size={8} fill={coreSelected ? 'var(--accent)' : 'var(--face-top)'} opacity=".8">
          SCI
        </FaceText>
        <FaceText x={320 - 30} y={35.5} z={122} size={5.4} fill={coreSelected ? 'var(--accent)' : 'var(--face-top)'} opacity=".55">
          CORE / v2
        </FaceText>
        <circle cx={core[0]} cy={core[1]} r="4" fill="var(--accent)" className={!reduce ? 'ctv-pulse' : ''} />
        <path
          d={pathOf(planCircle(320, 0, 44, 195.6))}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.3"
          opacity={coreSelected ? 1 : 0}
          style={{ transition: 'opacity .2s ease' }}
        />
        <path
          className="ctv-module-focus"
          d={pathOf(planCircle(320, 0, 47, 195.8))}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.4"
        />
      </g>

      {ASSEMBLIES.map((a, i) => {
        const p = iso(320 + a.dx, a.dy, a.z);
        const outward = [p[0] - core[0], p[1] - core[1]];
        const len = Math.hypot(outward[0], outward[1]) || 1;
        const lx = p[0] + a.label[0];
        const ly = p[1] + a.label[1];
        const bx = 320 + a.dx - 44;
        const isSelected = selected === a.id;
        const isHovered = hovered === a.id;
        const dim = Boolean(selected) && !isSelected;
        const spread = open || isSelected ? 34 : 12;
        const lift = open || isSelected ? 10 : 4;
        const ox = (outward[0] / len) * spread;
        const oy = (outward[1] / len) * spread - lift;
        return (
          <motion.g
            key={a.id}
            className="ctv-module"
            role="button"
            tabIndex={focusable ? 0 : -1}
            aria-pressed={isSelected}
            aria-label={`${a.code} ${a.name}. ${a.desc}`}
            onClick={pick(a.id)}
            onKeyDown={keyPick(a.id)}
            onPointerEnter={() => {
              setHover(true);
              setHovered(a.id);
            }}
            onPointerLeave={() => setHovered((cur) => (cur === a.id ? null : cur))}
            onFocus={() => {
              setHover(true);
              setHovered(a.id);
            }}
            onBlur={(event) => {
              setHovered((cur) => (cur === a.id ? null : cur));
              if (!event.currentTarget.ownerSVGElement?.contains(event.relatedTarget)) setHover(false);
            }}
            animate={{ x: exploded ? ox : 0, y: (exploded ? oy : 0) - (isSelected ? 6 : 0) }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 150, damping: 20, delay: i * 0.012 }}
          >
            <path
              d={pathOf(plan(bx - 4, a.dy - 32, 96, 64, a.z + 0.4))}
              fill="var(--accent)"
              opacity={isSelected ? 0.09 : 0}
              style={{ transition: 'opacity .2s ease' }}
            />
            <g style={{ opacity: dim ? 0.42 : 1, transition: 'opacity .22s ease' }}>
              <Box x={bx} y={a.dy - 28} z={a.z} w={88} d={56} h={30} tone="base" />
              <path d={pathOf(plan(bx, a.dy - 28, 88, 56, a.z + 30.4))} fill="var(--face-top)" stroke="var(--rule)" strokeWidth=".6" />
              {moduleDetails(a.kind, 320 + a.dx, a.dy, a.z)}
              <FaceText x={320 + a.dx - 38} y={a.dy + 28.6} z={a.z + 6} size={5.4} fill={isSelected ? 'var(--accent)' : 'var(--muted)'} opacity=".9">
                {a.code}
              </FaceText>
            </g>
            <path
              d={pathOf(plan(bx, a.dy - 28, 88, 56, a.z + 30.55))}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={isSelected ? 1.3 : 1}
              strokeDasharray={isSelected ? undefined : '3 3'}
              opacity={isSelected ? 1 : isHovered ? 0.5 : 0}
              style={{ transition: 'opacity .2s ease' }}
            />
            <path
              className="ctv-module-focus"
              d={pathOf(plan(bx - 3, a.dy - 31, 94, 62, a.z + 30.8))}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.4"
            />
            <path
              d={lineOf([[p[0], p[1]], [lx + (a.label[2] === 'end' ? 4 : -4), ly + 3]])}
              fill="none"
              stroke="var(--rule)"
              strokeWidth=".7"
              opacity={dim ? 0.4 : 1}
            />
            <circle cx={p[0]} cy={p[1]} r="1.8" fill="var(--accent)" opacity={dim ? 0.35 : 0.85} />
            <text
              x={lx}
              y={ly}
              fontFamily="var(--mono)"
              fontSize="11"
              fontWeight={isSelected ? 600 : 400}
              fill={isSelected ? 'var(--accent)' : exploded ? 'var(--ink)' : 'var(--ink-2)'}
              textAnchor={a.label[2]}
              letterSpacing=".06em"
              stroke="var(--panel)"
              strokeWidth="2.5"
              paintOrder="stroke"
              opacity={dim ? 0.5 : 1}
            >
              {a.name}
            </text>
          </motion.g>
        );
      })}

      <text
        x={core[0]}
        y={core[1] + 74}
        fontFamily="var(--mono)"
        fontSize="11"
        fill={coreSelected ? 'var(--accent)' : exploded ? 'var(--accent)' : 'var(--ink-2)'}
        textAnchor="middle"
        letterSpacing=".12em"
        stroke="var(--panel)"
        strokeWidth="2.5"
        paintOrder="stroke"
      >
        SCI ENGINE
      </text>
      <path d={lineOf([[core[0], core[1] + 52], [core[0], core[1] + 62]])} stroke="var(--rule)" strokeWidth=".7" />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   GROUND EFFECTS — year-view plume field and rack heat.
   ───────────────────────────────────────────────────────────────────────────── */
const PlumeField = memo(function PlumeField({ fieldRef }) {
  const c = iso(640, -140, 0.9);
  return (
    <g ref={fieldRef} opacity="0">
      {[90, 150, 220, 300, 390, 490, 600].map((r, i) => (
        <path
          key={r}
          d={lineOf(planCircle(640, -140, r, 1).concat([planCircle(640, -140, r, 1)[0]]))}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={i < 2 ? 1 : 0.6}
          strokeDasharray={i > 2 ? '2 9' : '8 6'}
          opacity={0.52 - i * 0.055}
        />
      ))}
      <path d={pathOf(planCircle(640, -140, 90, 1))} fill="var(--accent)" opacity=".055" />
      <path d={pathOf(planCircle(640, -140, 170, 1))} fill="var(--accent)" opacity=".025" />
      <circle cx={c[0]} cy={c[1]} r="14" fill="var(--accent)" opacity=".1" />
    </g>
  );
});

const Heat = memo(function Heat({ heatRef }) {
  const waves = useMemo(() => {
    const base = iso(320, 0, 238);
    return [0, 1, 2].map((i) => {
      let d = `M${f1(base[0] - 26 + i * 18)} ${f1(base[1] - 2)}`;
      for (let k = 0; k < 5; k++) {
        const x1 = base[0] - 14 + i * 18 + (k % 2 === 0 ? 9 : -9);
        const y1 = base[1] - 16 - k * 13;
        const x2 = base[0] - 18 + i * 18 + (k % 2 === 0 ? 7 : -7);
        const y2 = base[1] - 26 - k * 13;
        d += `Q${f1(x1)} ${f1(y1)} ${f1(x2)} ${f1(y2)}`;
      }
      return d;
    });
  }, []);

  return (
    <g ref={heatRef} opacity="0" fill="none" stroke="var(--accent)" strokeLinecap="round">
      {waves.map((d, i) => (
        <path key={i} d={d} strokeWidth={i === 1 ? 1.1 : 0.7} opacity={0.6 - i * 0.12} className={i === 1 ? 'ctv-dash' : ''} />
      ))}
      <path d={lineOf([iso(300, 0, 240), iso(340, 0, 240)])} stroke="var(--accent)" strokeWidth=".6" opacity=".35" />
    </g>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   CONNECTORS — routed in screen space above the machines, redrawn every frame.
   ───────────────────────────────────────────────────────────────────────────── */
const PipeLayer = memo(function PipeLayer({ chapter }) {
  return (
    <g>
      {CONNECTORS.map((c) => {
        const on = c.chapters.includes(chapter);
        return (
          <g key={c.id} style={{ opacity: on ? 1 : 0, transition: 'opacity .35s linear' }}>
            <path
              data-pipe={c.id}
              data-role="casing"
              d="M0 0"
              fill="none"
              stroke="var(--panel)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              data-pipe={c.id}
              data-role="core"
              d="M0 0"
              fill="none"
              stroke={c.tone === 'gate' ? 'var(--green)' : 'var(--ink-2)'}
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[0, 1, 2].map((k) => (
              <circle
                key={k}
                data-pipe={c.id}
                data-role="packet"
                r="3.4"
                cx="-100"
                cy="-100"
                fill={c.tone === 'power' ? 'var(--accent)' : c.tone === 'gate' ? 'var(--green)' : 'var(--ink)'}
                opacity=".9"
              />
            ))}
          </g>
        );
      })}
    </g>
  );
});

function PortLayer({ chapter }) {
  const visible = CONNECTORS.filter((c) => c.chapters.includes(chapter));
  return (
    <g pointerEvents="none">
      {visible.map((c) =>
        [c.from, c.to].map((id, k) => {
          const p = portOf(machineById(id), k === 0 ? c.aOffset || 0 : c.bOffset || 0);
          return (
            <g key={`${c.id}-${id}`}>
              <circle cx={p[0]} cy={p[1]} r="5.4" fill="var(--panel)" stroke="var(--ink-2)" strokeWidth=".8" />
              <circle cx={p[0]} cy={p[1]} r="1.7" fill={c.tone === 'gate' ? 'var(--green)' : 'var(--accent)'} />
            </g>
          );
        }),
      )}
    </g>
  );
}

const GATE_PIVOT = iso(-414, -50, 112);

/* ─────────────────────────────────────────────────────────────────────────────
   CSS — scoped to .ctv, warm paper in light, warm black in dark.
   ───────────────────────────────────────────────────────────────────────────── */
const SCENE_CSS = `
.ctv {
  --page: #efeae0;
  --panel: #f7f3ea;
  --panel-2: #ece6da;
  --ink: #17150f;
  --ink-2: #4b463b;
  --muted: #7c7464;
  --rule: #cec4b2;
  --rule-soft: #e1d9ca;
  --grid: #b3a994;
  --grid-soft: rgba(179, 169, 148, .42);
  --face-top: #fbf8f0;
  --face-x: #e6dfd0;
  --face-y: #d2c8b6;
  --face-deep: #b5aa95;
  --screen: #181610;
  --screen-ink: #ece5d5;
  --screen-dim: #8f8776;
  --accent: #e2491c;
  --green: #2f9e5b;
  --shadow: 0 30px 70px -46px rgba(23,21,15,.55);
  --mono: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, monospace;
  background: var(--page);
  color: var(--ink);
}
.dark .ctv {
  --page: #0d0d0b;
  --panel: #141412;
  --panel-2: #1b1a16;
  --ink: #ece6d8;
  --ink-2: #b3aa99;
  --muted: #8b8272;
  --rule: #343028;
  --rule-soft: #25221d;
  --grid: #3a362d;
  --grid-soft: rgba(58, 54, 45, .6);
  --face-top: #2b2823;
  --face-x: #211f1a;
  --face-y: #191814;
  --face-deep: #12110e;
  --screen: #080806;
  --screen-ink: #ded7c7;
  --screen-dim: #7c7464;
  --shadow: 0 30px 80px -46px rgba(0,0,0,.95);
}
.ctv-mono { font-family: var(--mono); font-variant-ligatures: none; }
.ctv-field {
  background-color: var(--panel);
  background-image: radial-gradient(circle, var(--grid-soft) 0.8px, transparent 0.9px);
  background-size: 18px 18px;
  background-position: -1px -1px;
}
.ctv-caption-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.ctv-caption-scroll::-webkit-scrollbar { display: none; }
.ctv-grid { grid-template-rows: 55svh minmax(0, 1fr); }
@media (min-width: 1024px) { .ctv-grid { grid-template-rows: minmax(0, 1fr); } }
@media (max-width: 1023px) and (max-height: 760px) { .ctv-grid { grid-template-rows: 50svh minmax(0, 1fr); } }
.ctv-num { font-family: var(--mono); font-variant-numeric: tabular-nums; letter-spacing: -.055em; }
.ctv-svg { display: block; width: 100%; height: 100%; overflow: visible; }
.ctv-svg path, .ctv-svg line, .ctv-svg circle, .ctv-svg ellipse, .ctv-svg rect { vector-effect: non-scaling-stroke; }
.ctv-svg text { user-select: none; -webkit-user-select: none; }
.ctv-frame { box-shadow: var(--shadow); }
.ctv-corner { position: absolute; width: 10px; height: 10px; pointer-events: none; opacity: .75; }
.ctv-corner::before, .ctv-corner::after { content: ""; position: absolute; background: var(--rule); }
.ctv-corner::before { width: 10px; height: 1px; }
.ctv-corner::after { width: 1px; height: 10px; }
.ctv-corner.tl { top: 5px; left: 5px; }
.ctv-corner.tr { top: 5px; right: 5px; transform: rotate(90deg); }
.ctv-corner.br { bottom: 5px; right: 5px; transform: rotate(180deg); }
.ctv-corner.bl { bottom: 5px; left: 5px; transform: rotate(270deg); }
.ctv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .55rem;
  background: var(--accent); color: #fff8f3; border: 1px solid var(--accent);
  padding: .72rem 1.05rem; font-family: var(--mono); font-size: 10.5px;
  letter-spacing: .055em; text-transform: uppercase; transition: background .2s, transform .2s, border-color .2s;
}
.ctv-btn:hover { background: #c93c13; border-color: #c93c13; transform: translateY(-1px); }
.ctv-btn:active { transform: translateY(0); }
.ctv-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  background: transparent; color: var(--ink); border: 1px solid var(--rule);
  padding: .72rem 1.05rem; font-family: var(--mono); font-size: 10.5px;
  letter-spacing: .055em; text-transform: uppercase; transition: border-color .2s, background .2s;
}
.ctv-btn-ghost:hover { border-color: var(--ink); background: var(--panel-2); }
.ctv-rail {
  display: flex; align-items: center; justify-content: flex-end; gap: 7px;
  color: var(--muted); transition: color .2s; padding: 2px 0; cursor: pointer;
}
.ctv-rail:hover { color: var(--ink); }
.ctv-rail[data-active="true"] { color: var(--accent); }
.ctv-rail[data-active="true"] .rail-rule { width: 18px; background: var(--accent); }
.rail-rule { width: 8px; height: 1px; background: var(--rule); transition: width .25s, background .25s; }
.ctv-dot-btn {
  height: 18px; min-width: 30px; display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 7px; letter-spacing: .06em; color: var(--muted);
  border-top: 1px solid var(--rule); transition: color .2s, border-color .2s;
}
.ctv-dot-btn[data-active="true"] { color: var(--accent); border-color: var(--accent); }
.ctv :focus-visible { outline: 1px solid var(--accent); outline-offset: 3px; }
.ctv-module { cursor: pointer; }
.ctv-module:focus { outline: none; }
.ctv-module-focus { opacity: 0; transition: opacity .18s ease; }
.ctv-module:focus-visible .ctv-module-focus { opacity: 1; }
.ctv-pulse { animation: ctvPulse 2.6s ease-in-out infinite; }
.ctv-dash { animation: ctvDash 2.4s linear infinite; }
@keyframes ctvPulse { 0%, 100% { opacity: .34; } 48% { opacity: 1; } }
@keyframes ctvDash { to { stroke-dashoffset: -24; } }
@media (prefers-reduced-motion: reduce) {
  .ctv-pulse, .ctv-dash { animation: none !important; }
  .ctv *, .ctv *::before, .ctv *::after { scroll-behavior: auto !important; }
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   CAPTION — one chapter at a time.
   ───────────────────────────────────────────────────────────────────────────── */
function AssemblyInspector({ assembly, onClose, reduce }) {
  return (
    <motion.div
      key={assembly.id}
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="mb-3 border p-3"
      style={{ borderColor: 'var(--accent)', background: 'var(--panel)' }}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ctv-mono text-[7px] tracking-[.18em]" style={{ color: 'var(--accent)' }}>
            ASSEMBLY {assembly.code} · INSPECT
          </div>
          <div className="mt-1 truncate text-[17px] leading-tight" style={{ color: 'var(--ink)' }}>
            {assembly.name}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close assembly details"
          className="shrink-0 border p-1 transition-colors hover:border-[var(--ink)]"
          style={{ borderColor: 'var(--rule)', color: 'var(--muted)' }}
        >
          <X size={11} weight="bold" />
        </button>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-[1.45]" style={{ color: 'var(--ink-2)' }}>
        {assembly.desc}
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t pt-2" style={{ borderColor: 'var(--rule-soft)' }}>
        <span className="ctv-mono text-[7px] tracking-[.08em]" style={{ color: 'var(--muted)' }}>
          {assembly.detail}
        </span>
        <span className="ctv-mono flex items-center gap-1 text-[7px] tracking-[.1em]" style={{ color: 'var(--green)' }}>
          <span className="inline-block h-1 w-1 rounded-full" style={{ background: 'var(--green)' }} />
          LINKED
        </span>
      </div>
    </motion.div>
  );
}

function AssemblyHint() {
  return (
    <div
      className="mb-3 flex items-center gap-2 border px-2 py-1.5"
      style={{ borderColor: 'var(--rule-soft)', background: 'var(--panel)' }}
    >
      <span className="inline-block h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
      <span className="ctv-mono text-[7px] leading-tight tracking-[.13em]" style={{ color: 'var(--muted)' }}>
        CLICK ANY BLOCK TO INSPECT · P-01—P-11
      </span>
    </div>
  );
}

function ChapterCopy({ chapter, index, reduce, goToChapter, onRestart }) {
  return (
    <motion.div
      key={chapter.id}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="min-h-0"
    >
      <div className="flex min-w-0 items-center gap-2.5 ctv-mono text-[8.5px] tracking-[.18em] sm:text-[9.5px]">
        <span className="inline-block h-px w-7 shrink-0" style={{ background: 'var(--accent)' }} />
        <span className="shrink-0" style={{ color: 'var(--accent)' }}>CHAPTER {chapter.id}</span>
        <span className="shrink-0" style={{ color: 'var(--muted)' }}>/ {chapter.tag}</span>
        <span className="hidden truncate sm:inline" style={{ color: 'var(--muted)' }}>· {chapter.kicker}</span>
      </div>

      <h2 className="mt-3 max-w-[36rem] text-[clamp(1.55rem,5.2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em] sm:mt-5">
        {chapter.title.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </h2>

      <p className="mt-2.5 max-w-[34rem] text-[12.5px] leading-[1.55] sm:mt-4 sm:text-[14.5px] sm:leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
        {chapter.body}
      </p>

      <dl className="mt-4 hidden border-t pt-3 sm:grid sm:grid-cols-3 sm:gap-4" style={{ borderColor: 'var(--rule)' }}>
        {chapter.facts.map(([k, v]) => (
          <div key={k}>
            <dt className="ctv-mono text-[7.5px] tracking-[.16em]" style={{ color: 'var(--muted)' }}>{k}</dt>
            <dd className="ctv-mono mt-1 text-[9.5px] tracking-[.02em]" style={{ color: 'var(--ink)' }}>{v}</dd>
          </div>
        ))}
      </dl>

      {chapter.compare ? (
        <div className="mt-4 border p-2.5 sm:p-3" style={{ borderColor: 'var(--rule)', background: 'var(--panel)' }}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="ctv-mono text-[7px] tracking-[.16em]" style={{ color: 'var(--muted)' }}>BEFORE</div>
              <div className="ctv-num text-[19px] sm:text-[23px]" style={{ color: 'var(--accent)' }}>
                {fmtNum(chapter.compare.before)}
                <span className="ctv-mono ml-1 text-[8px]" style={{ color: 'var(--muted)' }}>kg</span>
              </div>
            </div>
            <ArrowRight size={16} weight="bold" style={{ color: 'var(--muted)', marginBottom: 4 }} />
            <div className="text-right">
              <div className="ctv-mono text-[7px] tracking-[.16em]" style={{ color: 'var(--muted)' }}>AFTER</div>
              <div className="ctv-num text-[19px] sm:text-[23px]" style={{ color: 'var(--green)' }}>
                {fmtNum(chapter.compare.after)}
                <span className="ctv-mono ml-1 text-[8px]" style={{ color: 'var(--muted)' }}>kg</span>
              </div>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full" style={{ background: 'var(--rule-soft)' }}>
            <div className="h-full" style={{ width: `${chapter.compare.saved}%`, background: 'var(--green)' }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between ctv-mono text-[7px] tracking-[.1em]" style={{ color: 'var(--muted)' }}>
            <span style={{ color: 'var(--accent)' }}>BLOCKED</span>
            <span style={{ color: 'var(--green)' }}>{chapter.compare.saved}% AVOIDED · MERGED</span>
          </div>
        </div>
      ) : null}

      {chapter.cta ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
          <a
            href="https://github.com/DChitale/Carbotrace#quickstart"
            target="_blank"
            rel="noreferrer"
            className="ctv-btn"
          >
            See your repo&apos;s carbon
            <ArrowUpRight size={14} weight="bold" />
          </a>
          <a
            href="https://github.com/DChitale/Carbotrace"
            target="_blank"
            rel="noreferrer"
            className="ctv-btn-ghost"
          >
            <GithubLogo size={14} weight="bold" />
            GitHub
          </a>
          <button type="button" onClick={onRestart} className="ctv-btn-ghost">
            <ArrowCounterClockwise size={14} weight="bold" />
            Start over
          </button>
        </div>
      ) : null}

      <div className="mt-3 hidden items-center gap-3 sm:mt-5 lg:flex">
        <button
          type="button"
          onClick={() => goToChapter(Math.min(index + 1, N - 1))}
          className="ctv-mono flex items-center gap-2 text-[8px] tracking-[.16em]"
          style={{ color: 'var(--muted)' }}
        >
          <span>SCROLL TO TRACE</span>
          <span className="inline-block h-px w-8" style={{ background: 'var(--rule)' }} />
        </button>
        <span className="ctv-mono ml-auto text-[8px] tracking-[.12em]" style={{ color: 'var(--muted)' }}>
          {chapter.id} / 08
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────────────────────────────────────── */
export function Hero() {
  const sectionRef = useRef(null);
  const cameraRef = useRef(null);
  const counterRef = useRef(null);
  const auditRef = useRef(null);
  const auditMetaRef = useRef(null);
  const auditDotRef = useRef(null);
  const barRef = useRef(null);
  const meterRef = useRef(null);
  const heatRef = useRef(null);
  const fieldRef = useRef(null);
  const gateArmRef = useRef(null);
  const gateStatusRef = useRef(null);
  const gateLampRef = useRef(null);
  const gateScanRef = useRef(null);
  const patchRef = useRef(null);
  const svgRef = useRef(null);
  const chainRef = useRef(null);
  const engineRef = useRef(null);
  const copyScrollRef = useRef(null);
  const puffRefs = useRef({});

  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [engineOpen, setEngineOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const railHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = clamp(Math.floor(v * N), 0, N - 1);
    setActive((prev) => (prev === i ? prev : i));
    if (i !== 7) setSelected((cur) => (cur === null ? cur : null));
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const i = clamp(Math.floor(scrollYProgress.get() * N), 0, N - 1);
      setActive(i);
    });
    return () => cancelAnimationFrame(id);
  }, [scrollYProgress]);

  const goToChapter = useCallback((i) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + (i / N) * travel,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [reduce]);

  const toggleAssembly = useCallback((id) => {
    setSelected((cur) => (cur === id ? null : id));
  }, []);

  const restart = useCallback(() => {
    setEngineOpen(false);
    setSelected(null);
    copyScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    goToChapter(0);
  }, [goToChapter]);

  const toggleEngine = useCallback(() => {
    if (engineOpen || selected) {
      setSelected(null);
      setEngineOpen(false);
    } else {
      setEngineOpen(true);
    }
  }, [engineOpen, selected]);

  useEffect(() => {
    if (!selected || !copyScrollRef.current) return;
    copyScrollRef.current.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [selected, reduce]);

  const selectedAssembly = selected === 'core'
    ? CORE_ASSEMBLY
    : ASSEMBLIES.find((assembly) => assembly.id === selected) || null;
  const engineExpanded = engineOpen || Boolean(selected);

  const chapter = STORY[active];
  const sci = chapter.sci;
  const sciValue = ((sci.E * sci.I) + sci.M) / sci.R;
  const totalLinks = CONNECTORS.filter((c) => c.chapters.includes(active)).length;

  useEffect(() => {
    let raf = 0;
    let onScreen = true;
    const section = sectionRef.current;
    const svg = svgRef.current;
    const pipeSlots = new Map();
    if (svg) {
      for (const el of svg.querySelectorAll('[data-pipe]')) {
        const id = el.getAttribute('data-pipe');
        const role = el.getAttribute('data-role');
        if (!pipeSlots.has(id)) pipeSlots.set(id, { packets: [] });
        const slot = pipeSlots.get(id);
        if (role === 'packet') slot.packets.push(el);
        else slot[role] = el;
      }
    }
    const io = new IntersectionObserver(
      ([entry]) => { onScreen = entry.isIntersecting; },
      { threshold: 0.001 },
    );
    if (section) io.observe(section);

    const frame = () => {
      const p = clamp(scrollYProgress.get(), 0, 1);
      const time = reduce ? 0 : performance.now() / 1000;
      const { index, f } = chapterAt(p);

      const cam = cameraAt(p);
      const z = cam.zoom * (isMobile ? 0.86 : 1);
      if (cameraRef.current) {
        cameraRef.current.setAttribute(
          'transform',
          `translate(${(600 - cam.fx * z).toFixed(3)} ${(450 - cam.fy * z).toFixed(3)}) scale(${z.toFixed(4)})`,
        );
      }

      const metric = STORY[index].metric;
      const value = lerp(metric.countFrom, metric.value, easeOut(clamp(f / 0.7)));
      const text = fmtNum(value, metric.decimals);
      if (counterRef.current && counterRef.current.textContent !== text) {
        counterRef.current.textContent = text;
      }

      const ci = index === 2 ? easeOut(clamp(f / 0.78)) : index > 2 ? 1 : 0;
      if (barRef.current) barRef.current.setAttribute('width', (192 * ci).toFixed(1));
      if (meterRef.current) meterRef.current.setAttribute('transform', `rotate(${(-120 + 240 * ci).toFixed(1)} 25 25)`);

      if (heatRef.current) heatRef.current.setAttribute('opacity', blendTargets(p, HEAT).toFixed(3));
      if (fieldRef.current) {
        const fieldOp = index === 5 ? easeOut(clamp(f / 0.55)) : 0;
        fieldRef.current.setAttribute('opacity', fieldOp.toFixed(3));
      }

      const engineOp = index === 7 ? 1 : index === 6 ? smooth(clamp((f - 0.58) / 0.3)) : 0;
      if (engineRef.current) engineRef.current.setAttribute('opacity', engineOp.toFixed(3));
      if (chainRef.current) chainRef.current.setAttribute('opacity', (1 - engineOp).toFixed(3));

      const open = index === 6 ? smooth(clamp((f - 0.4) / 0.3)) : 0;
      if (gateArmRef.current) {
        gateArmRef.current.setAttribute(
          'transform',
          `rotate(${(-74 * open).toFixed(2)} ${f1(GATE_PIVOT[0])} ${f1(GATE_PIVOT[1])})`,
        );
      }
      if (gateStatusRef.current) {
        const status = open > 0.5 ? 'MERGED' : 'BLOCKED';
        if (gateStatusRef.current.textContent !== status) gateStatusRef.current.textContent = status;
        gateStatusRef.current.setAttribute('fill', open > 0.5 ? 'var(--green)' : 'var(--accent)');
      }
      if (gateLampRef.current) {
        gateLampRef.current.setAttribute('fill', open > 0.5 ? 'var(--green)' : 'var(--accent)');
      }
      if (patchRef.current) {
        const patchOp = index === 6 ? clamp((f - 0.46) / 0.18) : 0;
        patchRef.current.setAttribute('opacity', patchOp.toFixed(3));
        patchRef.current.setAttribute('transform', `translate(0 ${((1 - patchOp) * 12).toFixed(2)})`);
      }
      if (gateScanRef.current) {
        gateScanRef.current.setAttribute('y', ((time * 34) % 88).toFixed(1));
      }

      const plumeSets = [
        { id: 'us', base: iso(640, -140, 250), n: 10, span: 300, intensity: blendTargets(p, PLUME_US) },
        { id: 'eu', base: iso(640, 120, 250), n: 8, span: 190, intensity: blendTargets(p, PLUME_EU) },
      ];
      for (const set of plumeSets) {
        for (let i = 0; i < set.n; i++) {
          const g = puffRefs.current[`${set.id}-${i}`];
          if (!g) continue;
          const seed = i / set.n;
          const cycle = reduce ? seed : (time * 0.05 + seed) % 1;
          const rise = cycle * set.span * (0.55 + set.intensity * 0.6);
          const drift = Math.sin(cycle * 4.4 + i * 1.9 + (reduce ? 0 : time * 0.22)) * (6 + cycle * 26);
          const scale = 0.35 + cycle * 1.9 * (0.5 + set.intensity);
          g.setAttribute(
            'transform',
            `translate(${(set.base[0] + drift).toFixed(1)} ${(set.base[1] - rise).toFixed(1)}) scale(${scale.toFixed(2)})`,
          );
          g.setAttribute('opacity', (Math.sin(cycle * Math.PI) * (0.16 + set.intensity * 0.42)).toFixed(3));
        }
      }

      const visibleIds = visibleMachineIds(index);
      const allRects = visibleIds.map((id) => machineRect(machineById(id)));
      const activeConns = CONNECTORS.filter((c) => c.chapters.includes(index));
      let clashes = 0;

      for (let ciIndex = 0; ciIndex < activeConns.length; ciIndex++) {
        const c = activeConns[ciIndex];
        const refs = pipeSlots.get(c.id) || { packets: [] };
        const from = machineById(c.from);
        const to = machineById(c.to);
        const A = portOf(from, c.aOffset || 0);
        const B = portOf(to, c.bOffset || 0);
        const obstacles = allRects.filter((_, i) => visibleIds[i] !== c.from && visibleIds[i] !== c.to);
        const ra = machineRect(from);
        const rb = machineRect(to);
        let best = null;

        for (let attempt = 0; attempt < 6; attempt++) {
          const lane = Math.min(ra.y, rb.y) - 18 - c.order * 7 - attempt * 12;
          const candidate = [A, [A[0], lane], [B[0], lane], B];
          if (routeClashes(candidate, obstacles, 6) === 0) {
            best = candidate;
            break;
          }
        }
        if (!best) {
          for (let attempt = 0; attempt < 4; attempt++) {
            const lane = Math.max(ra.y + ra.h, rb.y + rb.h) + 24 + c.order * 9 + attempt * 12;
            const candidate = [A, [A[0], lane], [B[0], lane], B];
            if (routeClashes(candidate, obstacles, 6) === 0) {
              best = candidate;
              break;
            }
          }
        }
        if (!best) {
          clashes += 1;
          best = [A, [A[0], Math.min(ra.y, rb.y) - 18], [B[0], Math.min(ra.y, rb.y) - 18], B];
        }

        const d = roundedPolyline(best, 10);
        if (refs.casing) refs.casing.setAttribute('d', d);
        if (refs.core) refs.core.setAttribute('d', d);

        const total = best.reduce((sum, point, i2) => (
          i2 === 0 ? 0 : sum + Math.hypot(point[0] - best[i2 - 1][0], point[1] - best[i2 - 1][1])
        ), 0);
        for (let k = 0; k < 3; k++) {
          const packet = refs.packets[k];
          if (!packet) continue;
          const phase = reduce
            ? ((k / 3) + c.order * 0.08) % 1
            : ((time * 0.19) + p * 1.2 + k / 3 + c.order * 0.07) % 1;
          const pos = pointAtDistance(best, total * phase);
          packet.setAttribute('cx', pos[0].toFixed(1));
          packet.setAttribute('cy', pos[1].toFixed(1));
        }
      }

      const auditOk = clashes === 0;
      const auditLabel = auditOk ? 'AUDIT PASS' : 'AUDIT HOLD';
      if (auditRef.current && auditRef.current.textContent !== auditLabel) {
        auditRef.current.textContent = auditLabel;
      }
      if (auditMetaRef.current) {
        const meta = index === 7
          ? '11 ASSEMBLIES · 0 CLASH'
          : `${activeConns.length} LINKS · ${clashes} CLASH`;
        if (auditMetaRef.current.textContent !== meta) auditMetaRef.current.textContent = meta;
      }
      if (auditDotRef.current) {
        auditDotRef.current.style.background = auditOk ? 'var(--green)' : 'var(--accent)';
      }
    };

    frame();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (onScreen && !document.hidden) frame();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [isMobile, reduce, scrollYProgress]);

  return (
    <section
      id="hero-scan"
      ref={sectionRef}
      className="ctv relative"
      style={{ height: `${N * 100}vh` }}
      aria-label="How one pull request becomes carbon"
    >
      <style>{SCENE_CSS}</style>
      <h1 className="sr-only">Carbotrace — see how a pull request becomes carbon</h1>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="flex h-full flex-col">
          <div
            className="relative z-30 shrink-0 border-b px-3 pb-2 pt-2.5 sm:px-6 sm:pb-2.5 sm:pt-3 lg:px-8"
            style={{ borderColor: 'var(--rule)', background: 'var(--panel)' }}
          >
            <div className="flex items-center justify-between gap-3 pb-2 sm:pb-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-block h-1.5 w-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                <span className="ctv-mono truncate text-[8px] tracking-[.2em] sm:text-[9.5px]" style={{ color: 'var(--ink)' }}>
                  CARBOTRACE / CARBON TRACE
                </span>
              </div>
              <div className="ctv-mono hidden items-center gap-2 text-[8px] tracking-[.16em] lg:flex" style={{ color: 'var(--muted)' }}>
                <span>ONE PULL REQUEST</span>
                <span style={{ color: 'var(--rule)' }}>→</span>
                <span>AST</span>
                <span style={{ color: 'var(--rule)' }}>→</span>
                <span>CI</span>
                <span style={{ color: 'var(--rule)' }}>→</span>
                <span>GRID</span>
                <span style={{ color: 'var(--rule)' }}>→</span>
                <span style={{ color: 'var(--accent)' }}>GATE</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={restart}
                  className="ctv-mono flex items-center gap-1 border px-1.5 py-1 text-[7px] tracking-[.12em] transition-colors hover:border-[var(--ink)]"
                  style={{ borderColor: 'var(--rule)', color: 'var(--muted)' }}
                  aria-label="Start over from chapter 1"
                  title="Start over from chapter 1"
                >
                  <ArrowCounterClockwise size={10} weight="bold" />
                  <span className="hidden sm:inline">START OVER</span>
                </button>
                <div className="ctv-mono flex items-center gap-1.5 text-[8px] tracking-[.16em] sm:text-[9px]">
                  <span style={{ color: 'var(--accent)' }}>{chapter.id}</span>
                  <span style={{ color: 'var(--muted)' }}>/ 08</span>
                </div>
              </div>
            </div>
            <div className="relative h-px w-full" style={{ background: 'var(--rule)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left"
                style={{ scaleX: railScale, background: 'var(--accent)' }}
              />
            </div>
          </div>

          <div className="ctv-grid relative grid min-h-0 flex-1">
            <div className="ctv-caption-scroll relative col-start-1 row-start-2 z-20 flex min-h-0 flex-col justify-start overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pt-5 lg:row-start-1 lg:justify-center lg:overflow-visible lg:px-8 lg:pb-24 lg:pt-16 lg:pointer-events-none" ref={copyScrollRef}>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] lg:block"
                style={{ background: 'linear-gradient(90deg, var(--panel) 0%, var(--panel) 38%, transparent 100%)' }}
              />
              <div className="relative lg:max-w-[350px] lg:pointer-events-auto xl:max-w-[440px]">
                {active === 7 ? (
                  selectedAssembly ? (
                    <AssemblyInspector
                      assembly={selectedAssembly}
                      onClose={() => setSelected(null)}
                      reduce={Boolean(reduce)}
                    />
                  ) : (
                    <AssemblyHint />
                  )
                ) : null}
                <ChapterCopy
                  chapter={chapter}
                  index={active}
                  reduce={Boolean(reduce)}
                  goToChapter={goToChapter}
                  onRestart={restart}
                />
              </div>
            </div>

            <div className="relative col-start-1 row-start-1 min-h-0 overflow-hidden">
              <div className="ctv-field relative h-full min-h-0 overflow-hidden">
                <div
                  className="absolute inset-x-0 top-0 z-30 flex h-8 items-center justify-between gap-2 border-b px-2.5 sm:h-9 sm:px-3 lg:px-8"
                  style={{ borderColor: 'var(--rule)', background: 'var(--panel)' }}
                >
                  <span className="ctv-mono truncate text-[7.5px] tracking-[.16em] sm:text-[9px]" style={{ color: 'var(--ink-2)' }}>
                    FIG. {chapter.id} <span style={{ color: 'var(--muted)' }}>/ {chapter.tag}</span>
                  </span>
                  <span className="ctv-mono hidden shrink-0 text-[7.5px] tracking-[.18em] sm:block" style={{ color: 'var(--muted)' }}>
                    LIVE TRACE · SCI v2
                  </span>
                  <button
                    type="button"
                    onClick={toggleEngine}
                    className="ctv-mono shrink-0 border px-1.5 py-0.5 text-[7px] tracking-[.1em] transition-colors"
                    style={{
                      borderColor: engineExpanded ? 'var(--accent)' : 'var(--rule)',
                      color: engineExpanded ? 'var(--accent)' : 'var(--muted)',
                      display: active === 7 ? 'inline-flex' : 'none',
                    }}
                    aria-pressed={engineExpanded}
                  >
                    {engineExpanded ? 'ASSEMBLE' : 'EXPLODE'}
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-[58px] top-8 sm:bottom-[64px] sm:top-9">
                  <svg
                    ref={svgRef}
                    className="ctv-svg"
                    viewBox="0 0 1200 900"
                    preserveAspectRatio={isMobile ? 'xMidYMid slice' : 'xMidYMid meet'}
                    role={active === 7 ? 'group' : 'img'}
                    aria-labelledby="ctv-scene-title ctv-scene-desc"
                  >
                    <title id="ctv-scene-title">{`Chapter ${chapter.id}: ${chapter.title.join(' ')}`}</title>
                    <desc id="ctv-scene-desc">{chapter.body}</desc>

                    <g ref={cameraRef}>
                      <BasePlate />
                      <PlumeField fieldRef={fieldRef} />

                      <g ref={chainRef}>
                        <PipeLayer chapter={active} />
                        <CommitPod reduce={Boolean(reduce)} />
                        <g style={{ opacity: active === 6 || active === 7 ? 0 : 1, transition: 'opacity .4s linear' }}>
                          <AstTree reduce={Boolean(reduce)} />
                        </g>
                        <CiRunner barRef={barRef} meterRef={meterRef} reduce={Boolean(reduce)} />
                        <DataRack reduce={Boolean(reduce)} />
                        <g style={{ opacity: active === 6 ? 0.35 : 1, transition: 'opacity .4s linear' }}>
                          <RegionRack region="useast" intensity={412} reduce={Boolean(reduce)} />
                          <RegionRack region="euw" intensity={28} reduce={Boolean(reduce)} />
                        </g>
                        <Heat heatRef={heatRef} />
                        <Plume id="us" cx={640} cy={-140} z={250} count={10} color="var(--accent)" puffRefs={puffRefs} />
                        <Plume id="eu" cx={640} cy={120} z={250} count={8} color="var(--ink-2)" puffRefs={puffRefs} />
                        <g style={{ opacity: active === 6 ? 1 : 0, pointerEvents: 'none', transition: 'opacity .4s linear' }}>
                          <Gate
                            armRef={gateArmRef}
                            statusRef={gateStatusRef}
                            lampRef={gateLampRef}
                            patchRef={patchRef}
                            scanRef={gateScanRef}
                            reduce={Boolean(reduce)}
                          />
                        </g>
                        <PortLayer chapter={active} />
                      </g>

                      <g
                        ref={engineRef}
                        opacity="0"
                        style={{
                          pointerEvents: active === 7 ? 'auto' : 'none',
                        }}
                      >
                        <Engine
                          open={engineOpen}
                          onToggle={toggleEngine}
                          onSelect={toggleAssembly}
                          selected={selected}
                          reduce={Boolean(reduce)}
                          focusable={active === 7}
                        />
                      </g>
                    </g>
                  </svg>
                </div>

                <div className="ctv-corner tl" />
                <div className="ctv-corner tr" />
                <div className="ctv-corner bl" />
                <div className="ctv-corner br" />

                <div
                  className="pointer-events-none absolute left-2 top-10 z-30 flex items-center gap-2 border px-2 py-1.5 sm:left-3 sm:top-12 lg:left-8"
                  style={{ borderColor: 'var(--rule-soft)', background: 'var(--panel)' }}
                >
                  <span ref={auditDotRef} className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--green)' }} />
                  <div>
                    <div ref={auditRef} className="ctv-mono text-[7.5px] tracking-[.14em] sm:text-[8px]" style={{ color: 'var(--ink)' }}>
                      AUDIT PASS
                    </div>
                    <div ref={auditMetaRef} className="ctv-mono mt-0.5 text-[6.5px] tracking-[.04em] sm:text-[7px]" style={{ color: 'var(--muted)' }}>
                      {totalLinks} LINKS · 0 CLASH
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute right-2 top-10 z-30 max-w-[58%] border px-2 py-1.5 text-right sm:right-3 sm:top-12 sm:max-w-[46%] sm:px-2.5 sm:py-2 lg:right-8"
                  style={{ borderColor: 'var(--rule-soft)', background: 'var(--panel)' }}
                >
                  <div className="ctv-mono truncate text-[7px] uppercase tracking-[.16em] sm:text-[8px]" style={{ color: 'var(--muted)' }}>
                    {chapter.metric.label}
                  </div>
                  <div className="mt-0.5 flex items-baseline justify-end gap-1">
                    <span ref={counterRef} className="ctv-num text-[24px] leading-none sm:text-[31px]" style={{ color: 'var(--ink)' }}>
                      0
                    </span>
                    <span className="ctv-mono text-[8px] leading-tight sm:text-[9.5px]" style={{ color: 'var(--muted)' }}>
                      {chapter.metric.unit}
                    </span>
                  </div>
                  <div className="ctv-mono mt-0.5 truncate text-[6.5px] tracking-[.05em] sm:text-[7.5px]" style={{ color: 'var(--muted)' }}>
                    {chapter.metric.sub}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-[58px] z-30 flex justify-center gap-0.5 px-2 md:hidden">
                  {STORY.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goToChapter(i)}
                      data-active={i === active}
                      className="ctv-dot-btn"
                      aria-label={`Chapter ${s.id}: ${s.tag}`}
                      aria-current={i === active ? 'step' : undefined}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>

                <div
                  className="absolute inset-x-0 bottom-0 z-30 border-t px-2 py-1.5 sm:px-3 sm:py-2 lg:px-8"
                  style={{ borderColor: 'var(--rule)', background: 'var(--panel)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <span className="ctv-mono shrink-0 text-[7px] tracking-[.18em]" style={{ color: 'var(--muted)' }}>SCI</span>
                      <span className="ctv-mono truncate text-[8.5px] tracking-[.01em] sm:text-[10px]" style={{ color: 'var(--ink-2)' }}>
                        = ((E × I) + M) / R
                      </span>
                    </div>
                    <span className="ctv-mono shrink-0 text-[8px] sm:text-[9.5px]" style={{ color: 'var(--accent)' }}>
                      {fmtSci(sciValue)} <span style={{ color: 'var(--muted)' }}>{sci.unit}</span>
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div className="ctv-mono flex flex-wrap gap-x-2 text-[6.5px] sm:text-[7.5px]" style={{ color: 'var(--muted)' }}>
                      <span>E {fmtTerm(sci.E)} kWh</span>
                      <span>I {sci.I}{sci.I2 ? ` / ${sci.I2}` : ''} g/kWh</span>
                      <span>M {fmtTerm(sci.M)} g</span>
                      <span>R {fmtTerm(sci.R)}</span>
                    </div>
                    <span className="ctv-mono hidden truncate text-[7px] lg:block" style={{ color: 'var(--muted)' }}>
                      {sci.scope}
                    </span>
                  </div>
                </div>

                <div className="pointer-events-none absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1.5 md:flex lg:right-6">
                  {STORY.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goToChapter(i)}
                      data-active={i === active}
                      className="ctv-rail pointer-events-auto"
                      aria-label={`Chapter ${s.id}: ${s.tag}`}
                      aria-current={i === active ? 'step' : undefined}
                    >
                      <span className="ctv-mono text-[8px] tracking-[.08em]">{s.id}</span>
                      <span className="rail-rule" />
                    </button>
                  ))}
                  <div className="pointer-events-none absolute -right-2 top-0 hidden h-full w-px xl:block" style={{ background: 'var(--rule-soft)' }}>
                    <motion.span className="block w-px" style={{ height: railHeight, background: 'var(--accent)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

