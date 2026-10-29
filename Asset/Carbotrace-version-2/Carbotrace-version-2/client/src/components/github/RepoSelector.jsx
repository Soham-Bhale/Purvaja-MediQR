import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Lock, Globe, MagnifyingGlass, ArrowRight } from '@phosphor-icons/react';

export function RepoSelector({ token, onSelectRepo }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!token) return;

    let ignore = false;
    api.listUserGithubRepos(token)
      .then((data) => {
        if (!ignore) setRepos(data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Failed to list user repositories');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const filtered = repos.filter((r) =>
    r.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
    r.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="card"
      style={{
        marginTop: 'var(--space-4)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Your GitHub Repositories</h4>
        <div style={{ position: 'relative', width: '220px' }}>
          <MagnifyingGlass
            size={14}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            className="input-text"
            placeholder="Search your repos..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ paddingLeft: '32px', height: '32px', fontSize: 'var(--text-xs)' }}
          />
        </div>
      </div>

      {loading && (
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
          <span className="spinner" style={{ display: 'inline-block', marginRight: '8px' }} />
          Loading repositories...
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', padding: 'var(--space-2)' }}>
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', padding: 'var(--space-3)', textAlign: 'center' }}>
          No repositories found
        </div>
      )}

      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filtered.slice(0, 20).map((r) => (
          <button
            key={r.id || r.full_name}
            type="button"
            onClick={() => onSelectRepo(r.html_url || `https://github.com/${r.full_name}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              textAlign: 'left',
              transition: 'background-color var(--transition-fast)',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-focus)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {r.private ? <Lock size={12} color="var(--warning)" /> : <Globe size={12} color="var(--text-tertiary)" />}
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.full_name}
              </span>
              {r.language && (
                <span className="badge badge-zinc" style={{ fontSize: '9px', padding: '0 4px' }}>
                  {r.language}
                </span>
              )}
            </div>
            <ArrowRight size={12} color="var(--text-tertiary)" />
          </button>
        ))}
      </div>
    </div>
  );
}
