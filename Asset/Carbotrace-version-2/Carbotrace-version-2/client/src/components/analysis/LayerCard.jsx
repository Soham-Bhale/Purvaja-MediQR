import { useState } from 'react';
import { Code, PlayCircle, HardDrives, CaretDown, CaretUp } from '@phosphor-icons/react';
import { LayerBreakdown } from './LayerBreakdown';

export function LayerCard({
  layerType = 'code',
  title = 'Code Efficiency',
  carbon = 0,
  totalCarbon = 0,
  breakdown = {},
}) {
  const [expanded, setExpanded] = useState(false);

  const cleanCarbon = Number(carbon) || 0;
  const cleanTotal = Number(totalCarbon) || 0;
  const percentage = cleanTotal > 0 ? ((cleanCarbon / cleanTotal) * 100).toFixed(1) : 0;

  let accentColor = 'var(--layer-code)';
  let Icon = Code;
  if (layerType === 'ci') {
    accentColor = 'var(--layer-ci)';
    Icon = PlayCircle;
  } else if (layerType === 'infra') {
    accentColor = 'var(--layer-infra)';
    Icon = HardDrives;
  }

  return (
    <div
      className="card"
      style={{
        borderTop: `3px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            <Icon size={16} weight="duotone" />
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </h4>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {percentage}% of total footprint
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {cleanCarbon.toFixed(2)}
            <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '3px' }}>
              gCO2e
            </span>
          </div>
        </div>
      </div>

      {/* Expand trigger */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="btn btn-ghost btn-sm"
        style={{
          width: '100%',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          padding: '6px 4px',
          color: 'var(--text-secondary)',
          marginTop: 'var(--space-1)',
        }}
      >
        <span style={{ fontSize: '11px' }}>{expanded ? 'Hide telemetry' : 'View telemetry'}</span>
        {expanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
      </button>

      {/* Expanded Breakdown */}
      {expanded && (
        <div style={{ marginTop: 'var(--space-1)' }}>
          <LayerBreakdown layerType={layerType} breakdown={breakdown} />
        </div>
      )}
    </div>
  );
}
