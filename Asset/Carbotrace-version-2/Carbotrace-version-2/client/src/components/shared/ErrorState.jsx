import { useState } from 'react';
import { WarningCircle, ArrowClockwise, CaretDown, CaretUp } from '@phosphor-icons/react';

export function ErrorState({ title = 'Something went wrong', message, error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);

  const displayMessage = message || error?.message || 'An unexpected error occurred while communicating with the server.';
  const details = error?.detail || (error?.stack ? String(error.stack) : null);

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        backgroundColor: 'var(--danger-subtle)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-primary)',
        margin: 'var(--space-4) 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <WarningCircle size={22} color="var(--danger)" weight="fill" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--danger)', marginBottom: 'var(--space-1)' }}>
            {title}
          </h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {displayMessage}
          </p>

          {details && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 0, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span>{showDetails ? 'Hide technical details' : 'Show technical details'}</span>
                {showDetails ? <CaretUp size={12} /> : <CaretDown size={12} />}
              </button>

              {showDetails && (
                <pre
                  style={{
                    marginTop: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto',
                    maxHeight: '180px',
                  }}
                >
                  {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
                </pre>
              )}
            </div>
          )}

          {onRetry && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <ArrowClockwise size={14} />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
