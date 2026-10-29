import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { RepoSearchBar } from '../components/repo/RepoSearchBar';
import { RepoCard } from '../components/repo/RepoCard';
import { RepoSelector } from '../components/github/RepoSelector';
import { EmptyState } from '../components/shared/EmptyState';
import { ErrorState } from '../components/shared/ErrorState';
import { CardGridSkeleton } from '../components/shared/LoadingState';
import { ClockCounterClockwise, Leaf, ArrowRight, Sparkle, GitBranch } from '@phosphor-icons/react';

export function HomePage({ onOpenGithubModal, githubAuth }) {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [recentRepos, setRecentRepos] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [error, setError] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Fetch recent repositories from database
  useEffect(() => {
    let isMounted = true;
    api.listRepos(0, 6)
      .then((data) => {
        if (isMounted) setRecentRepos(data || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load recent repositories');
      })
      .finally(() => {
        if (isMounted) setLoadingRecent(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnalyze = async ({ repoUrl, branch, includeLlm = true }) => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await api.analyzeRepo({
        repoUrl,
        branch,
        includeLlm,
        githubToken: githubAuth?.token || null,
      });

      if (res?.id) {
        navigate(`/dashboard/${res.id}`);
      } else {
        throw new Error('Analysis completed but did not return a valid audit ID.');
      }
    } catch (err) {
      setAnalysisError(err);
      setAnalyzing(false);
    }
  };

  const sampleRepos = [
    'https://github.com/expressjs/express',
    'https://github.com/pallets/flask',
    'https://github.com/tiangolo/fastapi',
  ];

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Search Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
          <Sparkle size={13} weight="fill" />
          <span>Software Carbon Intelligence Platform</span>
        </div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Audit GitHub Repositories
        </h1>

        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Scan AST source code, CI/CD runner pipelines, and regional cloud infrastructure for software carbon debt.
        </p>

        {/* Repository Search Bar */}
        <div style={{ width: '100%', marginTop: 'var(--space-4)' }}>
          <RepoSearchBar
            onAnalyze={handleAnalyze}
            loading={analyzing}
            onOpenGithubModal={onOpenGithubModal}
            isAuthenticated={githubAuth?.isAuthenticated}
          />
        </div>

        {/* Quick Sample Picks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Examples:</span>
          {sampleRepos.map((repo) => {
            const shortName = repo.replace('https://github.com/', '');
            return (
              <button
                key={repo}
                type="button"
                onClick={() => handleAnalyze({ repoUrl: repo, includeLlm: true })}
                disabled={analyzing}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '2px 10px',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Error Toast/Banner if analysis fails */}
      {analysisError && (
        <div style={{ width: '100%' }}>
          <ErrorState
            title="Analysis Failed"
            message={analysisError.message}
            error={analysisError}
            onRetry={() => setAnalysisError(null)}
          />
        </div>
      )}

      {/* GitHub user repo quick picker if authenticated */}
      {githubAuth?.isAuthenticated && githubAuth?.token && (
        <div style={{ width: '100%' }}>
          <RepoSelector
            token={githubAuth.token}
            onSelectRepo={(url) => handleAnalyze({ repoUrl: url, includeLlm: true })}
          />
        </div>
      )}

      {/* Live Community Analyses (Database Feed) */}
      <section className="landing-recent-section" aria-label="Recent audits">
        <div className="recent-header-row">
          <div className="recent-header-title">
            <ClockCounterClockwise size={18} className="text-secondary" />
            <h2 className="recent-title">Recent Community Audits</h2>
          </div>

          {recentRepos.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="btn btn-ghost btn-sm recent-view-all"
            >
              <span>View full history</span>
              <ArrowRight size={13} weight="bold" />
            </button>
          )}
        </div>

        {loadingRecent ? (
          <CardGridSkeleton count={3} />
        ) : error ? (
          <div className="recent-error-msg">
            Unable to load recent analyses. Backend may still be initializing.
          </div>
        ) : recentRepos.length === 0 ? (
          <EmptyState
            icon={Leaf}
            title="No repositories audited yet"
            description="Enter a GitHub repository URL above to generate your first carbon emission report."
          />
        ) : (
          <div className="recent-repos-grid">
            {recentRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
