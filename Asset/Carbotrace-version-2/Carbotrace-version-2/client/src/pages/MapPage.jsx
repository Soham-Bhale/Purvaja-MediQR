import { useState, useMemo } from 'react';
import { Globe } from '@phosphor-icons/react';
import { REGIONS } from '../data/regions';
import { WorldMap } from '../components/map/WorldMap';
import { RegionInspector } from '../components/map/RegionInspector';
import { MigrationEstimator } from '../components/map/MigrationEstimator';
import { MapFilters } from '../components/map/MapFilters';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';

export function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [tierFilter, setTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered regions list
  const filteredRegions = useMemo(() => {
    return REGIONS.filter((region) => {
      // Tier match
      if (tierFilter !== 'all' && region.tier !== tierFilter) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = region.name.toLowerCase().includes(query);
        const matchesId = region.id.toLowerCase().includes(query);
        const matchesProvider = region.provider.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesProvider) {
          return false;
        }
      }
      return true;
    });
  }, [tierFilter, searchQuery]);

  // Handle region selection and ensure state is synced
  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
  };

  // Find lowest and highest carbon regions for quick summary telemetry
  const lowestIntensity = useMemo(() => {
    return [...REGIONS].sort((a, b) => a.intensity - b.intensity)[0];
  }, []);

  const highestIntensity = useMemo(() => {
    return [...REGIONS].sort((a, b) => b.intensity - a.intensity)[0];
  }, []);

  return (
    <div className="map-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">
            <Globe size={14} weight="fill" />
            <span>Interactive Telemetry</span>
          </div>
          <h1 className="page-title">Global Cloud Energy Grid</h1>
          <p className="page-subtitle">
            Explore live regional carbon intensities, facility Power Usage Effectiveness (PUE),
            and primary generation fuel sources across worldwide cloud data centers.
          </p>
        </div>

        {/* Global Summary Metric Pill Strip */}
        <div className="map-summary-strip">
          <div className="summary-pill">
            <span className="summary-pill-label">Monitored Hubs</span>
            <span className="summary-pill-val">{REGIONS.length} Regions</span>
          </div>

          <div className="summary-pill">
            <span className="summary-pill-label">Cleanest Grid</span>
            <span className="summary-pill-val" style={{ color: 'var(--accent)' }}>
              {lowestIntensity.name.split(',')[0]} ({lowestIntensity.intensity}g)
            </span>
          </div>

          <div className="summary-pill">
            <span className="summary-pill-label">Highest Carbon</span>
            <span className="summary-pill-val" style={{ color: 'var(--danger)' }}>
              {highestIntensity.name.split(',')[0]} ({highestIntensity.intensity}g)
            </span>
          </div>

          <div className="summary-pill">
            <span className="summary-pill-label">Global Baseline</span>
            <span className="summary-pill-val">475 gCO2e</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <MapFilters
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        regions={filteredRegions}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
      />

      {/* Map + Inspector Layout Grid */}
      <div className="map-layout-grid">
        {/* World Map Interactive Viewport */}
        <div className="map-viewport-panel">
          <ErrorBoundary>
            <WorldMap
              regions={filteredRegions}
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
            />
          </ErrorBoundary>
        </div>

        {/* Datacenter Telemetry Inspector */}
        <div className="map-inspector-panel">
          <RegionInspector region={selectedRegion} />
        </div>
      </div>

      {/* Cloud Workload Migration Impact Simulator */}
      <div className="map-estimator-section">
        <MigrationEstimator onSelectRegion={handleSelectRegion} />
      </div>
    </div>
  );
}
