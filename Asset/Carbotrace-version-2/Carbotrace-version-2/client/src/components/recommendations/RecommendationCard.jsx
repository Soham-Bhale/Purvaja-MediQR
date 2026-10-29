import { useState } from 'react';
import { TrendDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import { StatusBadge } from '../shared/StatusBadge';

export function RecommendationCard({ recommendation }) {
  const [expanded, setExpanded] = useState(false);

  const {
    issue,
    description,
    savings_percent = 0,
    effort = 'MEDIUM',
    priority = 'MEDIUM',
    source = 'static_rules',
  } = recommendation;

  const prio = (priority || 'MEDIUM').toUpperCase();
  let borderLeftColor = 'var(--accent)';
  if (prio === 'HIGH') borderLeftColor = 'var(--danger)';
  else if (prio === 'MEDIUM') borderLeftColor = 'var(--warning)';

  const hasLongDescription = description && description.length > 120;

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${borderLeftColor}`,
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {issue}
        </h4>

        {savings_percent > 0 && (
          <span
            className="badge badge-emerald"
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <TrendDown size={12} weight="bold" />
            -{Number(savings_percent).toFixed(0)}% CO2
          </span>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginTop: '2px',
        }}
      >
        {expanded || !hasLongDescription ? description : `${description.slice(0, 120)}...`}
      </p>

      {hasLongDescription && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="btn btn-ghost btn-sm"
          style={{
            alignSelf: 'flex-start',
            padding: 0,
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span>{expanded ? 'Show less' : 'Read full recommendation'}</span>
          {expanded ? <CaretUp size={10} /> : <CaretDown size={10} />}
        </button>
      )}

      {/* Footer Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-2)',
          marginTop: 'var(--space-1)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Source:</span>
        <StatusBadge type="source" value={source} size="xs" />

        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>Priority:</span>
        <StatusBadge type="priority" value={priority} size="xs" />

        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>Effort:</span>
        <StatusBadge type="effort" value={effort} size="xs" />
      </div>
    </div>
  );
}
