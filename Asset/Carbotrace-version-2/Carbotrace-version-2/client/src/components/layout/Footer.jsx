import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function Footer() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    api.checkHealth()
      .then((res) => {
        setBackendStatus(res.status === 'healthy' || res.status === 'online' ? 'online' : 'degraded');
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  }, []);

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg-primary)',
        padding: 'var(--space-6) 0',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span>Carbotrace v2.0.0</span>
          <span>•</span>
          <span>Carbon-Aware Software Intelligence</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor:
                  backendStatus === 'online'
                    ? 'var(--accent)'
                    : backendStatus === 'checking'
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
            />
            <span style={{ textTransform: 'capitalize' }}>
              API: {backendStatus}
            </span>
          </div>

          <a
            href="http://localhost:8001/docs"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-secondary)' }}
            className="btn-ghost"
          >
            FastAPI Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
