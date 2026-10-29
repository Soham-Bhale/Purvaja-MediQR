import { useState } from 'react';
import { TrendDown, TrendUp, ArrowRight, TreeEvergreen } from '@phosphor-icons/react';
import { REGIONS, getTierBadge } from '../../data/regions';

export function MigrationEstimator({ onSelectRegion }) {
  const [sourceId, setSourceId] = useState('ap-south-1'); // Default to high-carbon Mumbai
  const [targetId, setTargetId] = useState('eu-north-1'); // Default to clean Stockholm

  const sourceRegion = REGIONS.find((r) => r.id === sourceId) || REGIONS[0];
  const targetRegion = REGIONS.find((r) => r.id === targetId) || REGIONS[1];

  const sourceIntensity = sourceRegion.intensity;
  const targetIntensity = targetRegion.intensity;

  const delta = sourceIntensity - targetIntensity;
  const savingsPct = sourceIntensity > 0 ? ((delta / sourceIntensity) * 100).toFixed(1) : '0.0';
  const isReduction = delta >= 0;

  const sourceBadge = getTierBadge(sourceRegion.tier, sourceRegion.intensity);
  const targetBadge = getTierBadge(targetRegion.tier, targetRegion.intensity);

  return (
    <div className="migration-card">
      <div className="migration-header">
        <div>
          <div className="migration-eyebrow">
            <TreeEvergreen size={14} weight="fill" />
            <span>Regional Relocation Simulator</span>
          </div>
          <h3 className="migration-title">Simulate Infrastructure Migration Carbon Impact</h3>
          <p className="migration-desc">
            Calculate projected cloud carbon reductions by shifting batch workloads or compute nodes to clean power regions.
          </p>
        </div>
      </div>

      <div className="migration-grid">
        {/* Source Selector */}
        <div className="migration-select-group">
          <label className="migration-label" htmlFor="source-region-select">
            Current Workload Region:
          </label>
          <div className="migration-select-wrapper">
            <select
              id="source-region-select"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="migration-select"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id}) — {r.intensity} gCO2e
                </option>
              ))}
            </select>
          </div>
          <div className="migration-badge-hint">
            <span className="badge-dot" style={{ backgroundColor: sourceBadge.dot }} />
            <span>
              {sourceRegion.intensity} gCO2e/kWh · PUE {sourceRegion.pue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="migration-arrow-column">
          <div className="migration-arrow-bubble">
            <ArrowRight size={18} weight="bold" />
          </div>
        </div>

        {/* Target Selector */}
        <div className="migration-select-group">
          <label className="migration-label" htmlFor="target-region-select">
            Target Green Region:
          </label>
          <div className="migration-select-wrapper">
            <select
              id="target-region-select"
              value={targetId}
              onChange={(e) => {
                const nextId = e.target.value;
                setTargetId(nextId);
                const nextRegion = REGIONS.find((r) => r.id === nextId);
                if (nextRegion && onSelectRegion) {
                  onSelectRegion(nextRegion);
                }
              }}
              className="migration-select"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id}) — {r.intensity} gCO2e
                </option>
              ))}
            </select>
          </div>
          <div className="migration-badge-hint">
            <span className="badge-dot" style={{ backgroundColor: targetBadge.dot }} />
            <span>
              {targetRegion.intensity} gCO2e/kWh · PUE {targetRegion.pue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Impact Result Card */}
        <div className="migration-result-card">
          <div>
            <span className="migration-result-label">
              {isReduction ? 'Projected Carbon Reduction' : 'Carbon Intensity Increase'}
            </span>
            <div
              className="migration-result-metric"
              style={{ color: isReduction ? 'var(--accent)' : 'var(--danger)' }}
            >
              {isReduction ? `-${savingsPct}%` : `+${Math.abs(savingsPct)}%`}
            </div>
            <span className="migration-result-subtext">
              {Math.abs(delta)} gCO2e/kWh delta per server hour
            </span>
          </div>
          <div
            className="migration-result-icon"
            style={{
              backgroundColor: isReduction ? 'var(--accent-subtle)' : 'rgba(239, 68, 68, 0.1)',
              color: isReduction ? 'var(--accent)' : 'var(--danger)',
            }}
          >
            {isReduction ? <TrendDown size={24} weight="bold" /> : <TrendUp size={24} weight="bold" />}
          </div>
        </div>
      </div>
    </div>
  );
}
