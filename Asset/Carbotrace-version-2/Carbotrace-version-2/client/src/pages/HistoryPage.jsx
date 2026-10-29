import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { HistoryTimeline } from '../components/repo/HistoryTimeline';
import { EmptyState } from '../components/shared/EmptyState';
import { CardGridSkeleton } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import {
  ClockCounterClockwise,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  ArrowSquareOut,
} from '@phosphor-icons/react';

export function HistoryPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRepoId, setExpandedRepoId] = useState(null);

  const fetchRepos = () => {
    setLoading(true);
    setError(null);
    api.listRepos(0, 50)
      .then((data) => {
        setRepos(data || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load repository history');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;
    api.listRepos(0, 50)
      .then((data) => {
        if (!ignore) setRepos(data || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || 'Failed to load repository history');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredRepos = repos.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.owner?.toLowerCase().includes(q) ||
      r.url?.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => {
    setExpandedRepoId(expandedRepoId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ClockCounterClockwise size={22} color="var(--accent)" weight="fill" />
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
              Analysis History
            </h1>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Historical audit logs, emissions trends, and performance tracking across all inspected repositories.
          </p>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <MagnifyingGlass
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            className="input-text"
            placeholder="Search by repository or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '36px', fontSize: 'var(--text-xs)' }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <CardGridSkeleton count={4} />
      ) : error ? (
        <ErrorState
          title="Failed to Load History"
          message={error}
          onRetry={fetchRepos}
        />
      ) : repos.length === 0 ? (
        <EmptyState
          icon={ClockCounterClockwise}
          title="No repository audits recorded"
          description="Analyze your first GitHub repository to see historical emissions and score tracking here."
          action={
            <Link to="/" className="btn btn-primary btn-sm">
              Start first audit
            </Link>
          }
        />
      ) : filteredRepos.length === 0 ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
          No repositories matching &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredRepos.map((repo) => {
            const isExpanded = expandedRepoId === repo.id;
            const history = repo.history || [];
            const latest = history.length > 0 ? history[0] : null;
            const score = latest ? Math.round(latest.total_score) : null;

            return (
              <div
                key={repo.id}
                className="card"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                {/* Main Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {repo.owner}
                        </span>
                        <span style={{ color: 'var(--border)' }}>/</span>
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {repo.name}
                        </span>

                        {repo.language && (
                          <span className="badge badge-zinc" style={{ fontSize: '10px' }}>
                            {repo.language}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        <span>{history.length} {history.length === 1 ? 'audit' : 'audits'}</span>
                        <span>•</span>
                        <span>
                          Last analyzed: {repo.last_analyzed_at ? new Date(repo.last_analyzed_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Score & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    {score !== null && (
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 700,
                            color:
                              score >= 80
                                ? 'var(--accent)'
                                : score >= 50
                                ? 'var(--warning)'
                                : 'var(--danger)',
                          }}
                        >
                          {score}
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '2px' }}>/100</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                          Latest Score
                        </div>
                      </div>
                    )}

                    {latest && (
                      <Link
                        to={`/dashboard/${latest.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>Latest Report</span>
                        <ArrowSquareOut size={12} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(repo.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px' }}
                      title={isExpanded ? 'Hide audit timeline' : 'Show audit timeline'}
                    >
                      {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Timeline */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 'var(--space-3)',
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                      Audit Timeline & Emission Trends
                    </h4>
                    <HistoryTimeline history={history} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
