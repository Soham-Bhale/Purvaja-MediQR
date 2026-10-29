import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTierBadge } from '../../data/regions';
import {
  ArrowsOutSimple,
  Plus,
  Minus,
  Moon,
  MapTrifold,
  GlobeHemisphereWest,
} from '@phosphor-icons/react';

// Free, No-API-Key Tile Providers
const TILE_PROVIDERS = {
  esriDark: {
    id: 'esriDark',
    name: 'Dark Canvas',
    icon: Moon,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      className: 'esri-dark-tiles',
    },
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    icon: MapTrifold,
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
      className: 'dark-osm-tiles',
    },
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    icon: GlobeHemisphereWest,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar',
      className: 'satellite-tiles',
    },
  },
};

// Custom HTML DivIcon for animated glowing pins
const createPinIcon = (region, isSelected) => {
  const badge = getTierBadge(region.tier, region.intensity);
  const size = isSelected ? 38 : 28;
  const height = isSelected ? 48 : 36;
  const anchorX = size / 2;
  const anchorY = height;

  const html = `
    <div class="custom-pin-container ${isSelected ? 'pin-selected' : ''}" style="--pin-color: ${badge.dot}">
      ${isSelected ? '<div class="pin-pulse-ring"></div>' : ''}
      <div class="pin-body" style="background-color: ${badge.dot};">
        <span class="pin-inner-dot"></span>
      </div>
      <div class="pin-stem" style="border-top-color: ${badge.dot};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-pin',
    iconSize: [size, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY],
  });
};

export function WorldMap({ regions, selectedRegion, onSelectRegion }) {
  const [activeTileId, setActiveTileId] = useState('esriDark');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }
    container.innerHTML = '';

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(container, {
      center: [25.0, 10.0],
      zoom: 2.2,
      minZoom: 1.8,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    // Layer group for pins
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size shortly after mounting to ensure accurate bounds
    const initTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    // ResizeObserver ensures map redraws cleanly
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (container) {
        container._leaflet_id = null;
      }
    };
  }, []);

  // Switch or mount Tile Layer when activeTileId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[activeTileId];
    if (provider) {
      const newTile = L.tileLayer(provider.url, provider.options).addTo(map);
      tileLayerRef.current = newTile;
    }
  }, [activeTileId]);

  // Update Markers whenever filtered regions or selectedRegion changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    regions.forEach((region) => {
      const isSelected = selectedRegion && selectedRegion.id === region.id;
      const icon = createPinIcon(region, isSelected);

      const marker = L.marker([region.lat, region.lon], {
        icon,
        zIndexOffset: isSelected ? 1000 : 100,
        title: `${region.name} (${region.id})`,
      });

      // Tooltip preview
      const badge = getTierBadge(region.tier, region.intensity);
      const tooltipContent = `
        <div style="font-family: var(--font-sans); padding: 4px 6px;">
          <div style="font-weight: 600; font-size: 13px; color: #fafafa;">${region.name}</div>
          <div style="font-size: 11px; font-family: var(--font-mono); color: ${badge.dot}; margin-top: 2px;">
            ${region.intensity} gCO2e · ${region.id}
          </div>
        </div>
      `;
      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -38],
        opacity: 0.95,
        className: 'custom-map-tooltip',
      });

      marker.on('click', () => {
        onSelectRegion(region);
        map.flyTo([region.lat, region.lon], Math.max(map.getZoom(), 4), {
          duration: 0.8,
          easeLinearity: 0.25,
        });
      });

      marker.addTo(markersGroup);
    });
  }, [regions, selectedRegion, onSelectRegion]);

  // Center on selected region when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRegion) return;
    mapInstanceRef.current.flyTo(
      [selectedRegion.lat, selectedRegion.lon],
      Math.max(mapInstanceRef.current.getZoom(), 4),
      { duration: 0.8 }
    );
  }, [selectedRegion]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([25.0, 10.0], 2.2, { duration: 0.8 });
  };

  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="map-view-wrapper">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="map-canvas-container" />

      {/* Free Tile Layer Switcher */}
      <div className="map-layer-switcher">
        {Object.values(TILE_PROVIDERS).map((prov) => {
          const Icon = prov.icon;
          const isActive = activeTileId === prov.id;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => setActiveTileId(prov.id)}
              className={`layer-switch-btn ${isActive ? 'active' : ''}`}
              title={`Switch to ${prov.name} (Free, No API Key)`}
            >
              <Icon size={13} weight={isActive ? 'fill' : 'regular'} />
              <span>{prov.name}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Map Zoom / Reset Controls */}
      <div className="map-floating-controls">
        <button
          type="button"
          onClick={handleZoomIn}
          className="map-control-btn"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus size={16} weight="bold" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="map-control-btn"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus size={16} weight="bold" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="map-control-btn"
          title="Reset Global View"
          aria-label="Reset Global View"
        >
          <ArrowsOutSimple size={16} />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="map-legend-overlay">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
          <span>Clean (&lt;150g)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />
          <span>Moderate (150–400g)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#f43f5e' }} />
          <span>High (&gt;400g)</span>
        </div>
      </div>
    </div>
  );
}
