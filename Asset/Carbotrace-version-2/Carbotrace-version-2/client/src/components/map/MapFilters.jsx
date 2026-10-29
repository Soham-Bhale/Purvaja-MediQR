import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { getTierBadge } from '../../data/regions';

export function MapFilters({
  tierFilter,
  onTierFilterChange,
  searchQuery,
  onSearchQueryChange,
  regions,
  selectedRegion,
  onSelectRegion,
}) {
  return (
    <div className="map-filters-bar">
      {/* Search Input */}
      <div className="map-search-wrapper">
        <MagnifyingGlass size={15} className="map-search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search by city, country, or region code (e.g. us-east-1)..."
          className="map-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange('')}
            className="map-search-clear"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Tier Filter Buttons */}
      <div className="tier-filter-group">
        <button
          type="button"
          onClick={() => onTierFilterChange('all')}
          className={`filter-pill ${tierFilter === 'all' ? 'active' : ''}`}
        >
          All ({regions.length})
        </button>

        <button
          type="button"
          onClick={() => onTierFilterChange('clean')}
          className={`filter-pill ${tierFilter === 'clean' ? 'active' : ''}`}
        >
          <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
          Clean (&lt;150g)
        </button>

        <button
          type="button"
          onClick={() => onTierFilterChange('moderate')}
          className={`filter-pill ${tierFilter === 'moderate' ? 'active' : ''}`}
        >
          <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />
          Moderate (150–400g)
        </button>

        <button
          type="button"
          onClick={() => onTierFilterChange('high')}
          className={`filter-pill ${tierFilter === 'high' ? 'active' : ''}`}
        >
          <span className="legend-dot" style={{ backgroundColor: '#f43f5e' }} />
          High (&gt;400g)
        </button>
      </div>

      {/* Quick Region Selector Chips */}
      <div className="quick-regions-scroll">
        <span className="quick-regions-label">Quick Jump:</span>
        {regions.map((region) => {
          const isSelected = selectedRegion && selectedRegion.id === region.id;
          const badge = getTierBadge(region.tier, region.intensity);
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region)}
              className={`region-chip ${isSelected ? 'is-active' : ''}`}
              title={`${region.name} (${region.intensity} gCO2e)`}
            >
              <span className="badge-dot" style={{ backgroundColor: badge.dot }} />
              <span>{region.name.split(',')[0]}</span>
              <code>{region.id}</code>
            </button>
          );
        })}
      </div>
    </div>
  );
}
