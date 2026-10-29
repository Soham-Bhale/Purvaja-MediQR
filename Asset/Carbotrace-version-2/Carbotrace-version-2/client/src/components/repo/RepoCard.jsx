import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Leaf } from '@phosphor-icons/react';

export function RepoCard({ repo }) {
  const navigate = useNavigate();

  // Determine latest analysis
  const history = repo.history || [];
  const latestAnalysis = history.length > 0 ? history[0] : null;
  const latestScore = latestAnalysis ? Math.round(latestAnalysis.total_score) : null;

  const handleCardClick = () => {
    if (latestAnalysis?.id) {
      navigate(`/dashboard/${latestAnalysis.id}`);
    } else {
      navigate(`/history`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="card"
      onClick={handleCardClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--border-focus)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Header with Repo Name and Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {repo.owner || 'github'}
          </div>
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginTop: '2px',
              wordBreak: 'break-word',
            }}
          >
            {repo.name}
          </h3>
        </div>

        {latestScore !== null ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color:
                  latestScore >= 80
                    ? 'var(--accent)'
                    : latestScore >= 50
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
            >
              {latestScore}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Eco-Score
            </span>
          </div>
        ) : (
          <span className="badge badge-zinc">Pending</span>
        )}
      </div>

      {/* Meta tags and Carbon metrics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
        {repo.language && (
          <span className="badge badge-zinc">
            {repo.language}
          </span>
        )}

        {latestAnalysis && (
          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Leaf size={12} weight="fill" />
            {Number(
              (latestAnalysis.code_carbon || 0) +
              (latestAnalysis.ci_carbon || 0) +
              (latestAnalysis.infra_carbon || 0)
            ).toFixed(1)} gCO2e
          </span>
        )}

        {history.length > 1 && (
          <span className="badge badge-zinc">
            {history.length} audits
          </span>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-3)',
          marginTop: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={12} />
          {formatDate(repo.last_analyzed_at || latestAnalysis?.created_at)}
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
          View report
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}
