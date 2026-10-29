import { useState } from 'react';
import {
  HardDrives,
  Sparkle,
  Copy,
  Check,
  Lightning,
  Gauge,
  Drop,
  Atom,
  Wind,
  Sun,
  Flame,
  Factory,
  Plant,
} from '@phosphor-icons/react';
import { getTierBadge, ENERGY_SOURCE_CONFIG } from '../../data/regions';

// Map energy source key to icon component
const getSourceIcon = (sourceKey) => {
  switch (sourceKey) {
    case 'hydro':
      return <Drop size={14} weight="fill" />;
    case 'nuclear':
      return <Atom size={14} weight="fill" />;
    case 'wind':
      return <Wind size={14} weight="fill" />;
    case 'solar':
      return <Sun size={14} weight="fill" />;
    case 'gas':
    case 'fossil':
      return <Flame size={14} weight="fill" />;
    case 'coal':
      return <Factory size={14} weight="fill" />;
    case 'biomass':
      return <Plant size={14} weight="fill" />;
    default:
      return <Lightning size={14} weight="fill" />;
  }
};

export function RegionInspector({ region }) {
  const [copied, setCopied] = useState(false);

  if (!region) return null;

  const badge = getTierBadge(region.tier, region.intensity);

  const handleCopyId = () => {
    navigator.clipboard.writeText(region.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate clean energy percentage (hydro + nuclear + wind + solar + biomass)
  const cleanSources = ['hydro', 'nuclear', 'wind', 'solar', 'biomass'];
  const cleanPct = Object.entries(region.mix || {}).reduce(
    (acc, [source, pct]) => (cleanSources.includes(source) ? acc + pct : acc),
    0
  );

  return (
    <div className="region-inspector-card">
      {/* Inspector Header */}
      <div className="inspector-header">
        <div className="inspector-title-group">
          <div className="inspector-meta-row">
            <span className="badge badge-zinc" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
              {region.provider} Cloud
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="badge-copy-button"
              title="Copy region identifier"
            >
              <code>{region.id}</code>
              {copied ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
            </button>
          </div>
          <h2 className="inspector-region-name">{region.name}</h2>
        </div>

        <div className={`badge ${badge.bg}`} style={{ alignSelf: 'flex-start', marginTop: 'var(--space-1)' }}>
          <span className="badge-dot" style={{ backgroundColor: badge.dot }} />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Primary Telemetry Metrics */}
      <div className="inspector-metrics-grid">
        <div className="inspector-metric-card">
          <div className="inspector-metric-label">
            <Lightning size={13} style={{ color: badge.dot }} />
            <span>Grid Carbon Intensity</span>
          </div>
          <div className="inspector-metric-value" style={{ color: badge.dot }}>
            {region.intensity}
            <span className="inspector-metric-unit">gCO2e/kWh</span>
          </div>
          <div className="inspector-metric-subtext">
            {cleanPct}% clean / zero-carbon generation
          </div>
        </div>

        <div className="inspector-metric-card">
          <div className="inspector-metric-label">
            <Gauge size={13} style={{ color: 'var(--text-secondary)' }} />
            <span>Power Usage (PUE)</span>
          </div>
          <div className="inspector-metric-value">
            {region.pue.toFixed(2)}
            <span className="inspector-metric-unit">overhead</span>
          </div>
          <div className="inspector-metric-subtext">
            {region.pue <= 1.12 ? 'Ultra-efficient cooling' : region.pue <= 1.20 ? 'Standard enterprise' : 'High ambient cooling load'}
          </div>
        </div>
      </div>

      {/* Energy Generation Mix */}
      <div className="inspector-section">
        <div className="inspector-section-header">
          <HardDrives size={14} style={{ color: 'var(--accent)' }} />
          <span className="inspector-section-title">Generation Energy Mix</span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="generation-mix-stacked-bar">
          {Object.entries(region.mix || {}).map(([source, pct]) => {
            const conf = ENERGY_SOURCE_CONFIG[source] || { color: '#71717a' };
            if (pct <= 0) return null;
            return (
              <div
                key={source}
                className="mix-segment"
                style={{
                  width: `${pct}%`,
                  backgroundColor: conf.color,
                }}
                title={`${conf.label || source}: ${pct}%`}
              />
            );
          })}
        </div>

        {/* Individual Source Rows */}
        <div className="generation-mix-list">
          {Object.entries(region.mix || {}).map(([source, pct]) => {
            const conf = ENERGY_SOURCE_CONFIG[source] || {
              label: source.toUpperCase(),
              color: '#71717a',
            };
            return (
              <div key={source} className="mix-row">
                <div className="mix-row-left">
                  <span className="mix-row-icon" style={{ color: conf.color }}>
                    {getSourceIcon(source)}
                  </span>
                  <span className="mix-row-name">{conf.label || source}</span>
                </div>
                <div className="mix-row-right">
                  <div className="mix-row-bar-track">
                    <div
                      className="mix-row-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: conf.color,
                      }}
                    />
                  </div>
                  <span className="mix-row-pct">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GreenOps Recommendation */}
      <div className="inspector-recommendation-box">
        <div className="inspector-recommendation-header">
          <Sparkle size={15} weight="fill" style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
            GreenOps Advisory
          </span>
        </div>
        <p className="inspector-recommendation-text">{region.recommendation}</p>
      </div>
    </div>
  );
}
