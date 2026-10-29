import { Warning, Info } from '@phosphor-icons/react';
import { StatusBadge } from '../shared/StatusBadge';

export function RiskList({ risks = [] }) {
  if (!risks || risks.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          color: 'var(--accent)',
          fontSize: 'var(--text-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
        <span>No severe sustainability or performance risks detected in this repository.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {risks.map((risk, index) => {
        const sev = (risk.severity || 'MEDIUM').toUpperCase();
        const isHigh = sev === 'HIGH' || sev === 'CRITICAL';

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: '10px 14px',
              backgroundColor: isHigh ? 'var(--danger-subtle)' : 'var(--bg-secondary)',
              border: `1px solid ${isHigh ? 'var(--danger-border)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {isHigh ? (
                <Warning size={16} color="var(--danger)" weight="fill" />
              ) : (
                <Info size={16} color="var(--warning)" weight="fill" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                <StatusBadge type="severity" value={risk.severity || 'MEDIUM'} />
                {risk.layer && (
                  <StatusBadge type="layer" value={risk.layer} size="xs" />
                )}
              </div>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: isHigh ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                }}
              >
                {risk.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
