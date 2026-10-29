import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { api } from '../services/api';
import { ScoreGauge } from '../components/analysis/ScoreGauge';
import { CarbonSplit } from '../components/analysis/CarbonSplit';
import { LayerCard } from '../components/analysis/LayerCard';
import { EmissionsChart } from '../components/analysis/EmissionsChart';
import { RiskList } from '../components/risks/RiskList';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { DashboardSkeleton } from '../components/shared/LoadingState';
import { ErrorState } from '../components/shared/ErrorState';
import {
  ArrowLeft,
  ArrowClockwise,
  ArrowSquareOut,
  Calendar,
  Sparkle,
  Leaf,
  WarningCircle,
} from '@phosphor-icons/react';

export function DashboardPage({ githubAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analysis, repo, loading, error, refetch } = useAnalysis(id);
  const [reAnalyzing, setReAnalyzing] = useState(false);

  const handleReAnalyze = async () => {
    if (!repo?.url) return;
    setReAnalyzing(true);
    try {
      const res = await api.analyzeRepo({
        repoUrl: repo.url,
        githubToken: githubAuth?.token || null,
      });
      if (res?.id) {
        navigate(`/dashboard/${res.id}`);
      }
    } catch (err) {
      alert(`Re-analysis failed: ${err.message}`);
    } finally {
      setReAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, color: 'var(--text-tertiary)' }}>
            <ArrowLeft size={14} />
            <span>Back to search</span>
          </Link>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%', paddingTop: 'var(--space-8)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, color: 'var(--text-tertiary)' }}>
            <ArrowLeft size={14} />
            <span>Back to search</span>
          </Link>
        </div>
        <ErrorState
          title="Audit Report Not Found"
          message={error || 'Could not load analysis details for this ID.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const {
    total_score = 100,
    code_carbon = 0,
    ci_carbon = 0,
    infra_carbon = 0,
    layers = {},
    risks = [],
    recommendations = [],
    created_at,
  } = analysis;

  const totalCarbon = (
    Number(code_carbon || 0) +
    Number(ci_carbon || 0) +
    Number(infra_carbon || 0)
  ).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Top Navigation & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, color: 'var(--text-tertiary)' }}>
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {repo?.owner || 'audit'} / {repo?.name || 'report'}
          </span>
        </div>

        {repo?.url && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>GitHub</span>
              <ArrowSquareOut size={12} />
            </a>

            <button
              type="button"
              onClick={handleReAnalyze}
              disabled={reAnalyzing}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowClockwise size={12} className={reAnalyzing ? 'spinner' : ''} />
              <span>{reAnalyzing ? 'Auditing...' : 'Re-run Audit'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Repo Title Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {repo?.name || 'Repository Analysis'}
            </h1>
            {repo?.language && (
              <span className="badge badge-zinc" style={{ fontSize: '11px' }}>
                {repo.language}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              marginTop: 'var(--space-2)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              Analyzed {created_at ? new Date(created_at).toLocaleString() : 'Recently'}
            </span>

            {repo?.url && (
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {repo.url}
              </span>
            )}
          </div>
        </div>

        {/* Total Carbon Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-2)',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Leaf size={16} color="var(--accent)" weight="fill" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Total Emissions:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)' }}>
            {totalCarbon}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>gCO2e</span>
        </div>
      </div>

      {/* Main 2-Column Layout (60% / 40%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 'var(--space-8)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Gauge, Carbon Split, Layer Cards, Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Eco-Score & Split Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Overall Performance</h2>
              <span className="badge badge-zinc">Timescale Engine</span>
            </div>

            <ScoreGauge score={total_score} />

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <CarbonSplit
                code={code_carbon}
                ci={ci_carbon}
                infra={infra_carbon}
              />
            </div>
          </div>

          {/* Layer Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Layer Breakdown
            </h3>

            <LayerCard
              layerType="code"
              title="Code & AST Efficiency"
              carbon={code_carbon}
              totalCarbon={totalCarbon}
              breakdown={layers?.code?.breakdown || {}}
            />

            <LayerCard
              layerType="ci"
              title="CI/CD Pipeline Emissions"
              carbon={ci_carbon}
              totalCarbon={totalCarbon}
              breakdown={layers?.ci?.breakdown || {}}
            />

            <LayerCard
              layerType="infra"
              title="Infrastructure & Cloud Compute"
              carbon={infra_carbon}
              totalCarbon={totalCarbon}
              breakdown={layers?.infra?.breakdown || {}}
            />
          </div>

          {/* Emissions Bar Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Comparative Carbon (gCO2e)
            </h3>
            <EmissionsChart
              code={code_carbon}
              ci={ci_carbon}
              infra={infra_carbon}
            />
          </div>
        </div>

        {/* Right Column: Risks & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Risks section */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <WarningCircle size={18} color="var(--warning)" weight="fill" />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
                  Detected Risks
                </h3>
              </div>
              <span className="badge badge-zinc">
                {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
              </span>
            </div>

            <RiskList risks={risks} />
          </div>

          {/* Recommendations section */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Sparkle size={18} color="var(--accent)" weight="fill" />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
                  AI Insights
                </h3>
              </div>
              <span className="badge badge-emerald">
                {recommendations.length} recommendations
              </span>
            </div>

            {recommendations.length > 0 && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', marginLeft: 'var(--space-2)' }}>
                {recommendations.some((r) => r.source === 'ollama_local' || r.source === 'ollama_cloud')
                  ? 'Powered by local AI (Ollama)'
                  : 'Rule-based static insights (Ollama unavailable)'}
              </div>
            )}

            {recommendations.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', padding: 'var(--space-3) 0' }}>
                No active recommendations. Your project adheres to high eco-efficiency standards.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
