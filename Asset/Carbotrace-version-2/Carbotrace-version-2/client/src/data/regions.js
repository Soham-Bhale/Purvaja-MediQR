/**
 * Global Cloud Datacenter & Energy Grid Registry
 * Data compiled from Cloud Carbon Footprint (CCF) coefficients,
 * Electricity Maps regional carbon intensities, and major cloud provider specs.
 */

export const REGIONS = [
  {
    id: 'eu-north-1',
    name: 'Stockholm, Sweden',
    provider: 'AWS',
    intensity: 25,
    pue: 1.10,
    tier: 'clean',
    lat: 59.3293,
    lon: 18.0686,
    mix: { hydro: 45, nuclear: 40, wind: 12, solar: 3, fossil: 0 },
    recommendation: 'Top Tier Green Region. Outstanding low-carbon choice for zero-carbon batch compute and heavy ML training.'
  },
  {
    id: 'ca-central-1',
    name: 'Montreal, Canada',
    provider: 'AWS',
    intensity: 28,
    pue: 1.11,
    tier: 'clean',
    lat: 45.5017,
    lon: -73.5673,
    mix: { hydro: 94, wind: 5, solar: 1, fossil: 0 },
    recommendation: 'Ultra-clean Canadian grid powered almost entirely by Hydro-Québec zero-carbon hydroelectric generation.'
  },
  {
    id: 'us-west-2',
    name: 'Oregon, USA',
    provider: 'AWS',
    intensity: 78,
    pue: 1.12,
    tier: 'clean',
    lat: 45.8399,
    lon: -119.7006,
    mix: { hydro: 60, wind: 20, gas: 15, solar: 5 },
    recommendation: 'Cleanest North American major hub. Excellent destination for latency-tolerant US workloads.'
  },
  {
    id: 'sa-east-1',
    name: 'São Paulo, Brazil',
    provider: 'AWS',
    intensity: 110,
    pue: 1.15,
    tier: 'clean',
    lat: -23.5505,
    lon: -46.6333,
    mix: { hydro: 70, wind: 15, biomass: 10, gas: 5 },
    recommendation: 'Cleanest South American cloud region powered overwhelmingly by renewable hydro and wind energy.'
  },
  {
    id: 'us-west-1',
    name: 'N. California, USA',
    provider: 'AWS',
    intensity: 236,
    pue: 1.14,
    tier: 'moderate',
    lat: 37.7749,
    lon: -122.4194,
    mix: { solar: 32, gas: 40, wind: 15, hydro: 13 },
    recommendation: 'Moderate grid intensity. High solar production during daylight hours; schedule heavy batch processing around noon.'
  },
  {
    id: 'eu-west-2',
    name: 'London, UK',
    provider: 'AWS',
    intensity: 242,
    pue: 1.15,
    tier: 'moderate',
    lat: 51.5074,
    lon: -0.1278,
    mix: { wind: 38, gas: 35, nuclear: 18, solar: 9 },
    recommendation: 'Moderate intensity grid undergoing rapid offshore wind adoption. Grid carbon intensity drops significantly during windy spells.'
  },
  {
    id: 'eu-west-1',
    name: 'Dublin, Ireland',
    provider: 'AWS',
    intensity: 290,
    pue: 1.16,
    tier: 'moderate',
    lat: 53.3498,
    lon: -6.2603,
    mix: { wind: 40, gas: 50, solar: 5, coal: 5 },
    recommendation: 'Moderate grid carbon intensity with high wind availability. High ambient cool air yields favorable facility cooling.'
  },
  {
    id: 'eu-central-1',
    name: 'Frankfurt, Germany',
    provider: 'AWS',
    intensity: 310,
    pue: 1.18,
    tier: 'moderate',
    lat: 50.1109,
    lon: 8.6821,
    mix: { wind: 28, solar: 22, coal: 26, gas: 24 },
    recommendation: 'Central European internet hub. High renewable share but still relies on coal/gas peakers during peak continental demand.'
  },
  {
    id: 'us-east-1',
    name: 'N. Virginia, USA',
    provider: 'AWS',
    intensity: 380,
    pue: 1.15,
    tier: 'moderate',
    lat: 38.9072,
    lon: -77.0369,
    mix: { gas: 46, nuclear: 32, coal: 14, solar: 8 },
    recommendation: 'World’s highest capacity cloud hub. Heavily dependent on natural gas. Consider migrating non-core data to us-west-2.'
  },
  {
    id: 'us-east-2',
    name: 'Ohio, USA',
    provider: 'AWS',
    intensity: 454,
    pue: 1.16,
    tier: 'high',
    lat: 40.4173,
    lon: -82.9071,
    mix: { gas: 52, coal: 34, nuclear: 10, wind: 4 },
    recommendation: 'High grid carbon intensity due to fossil thermal generation. Avoid unoptimized continuous CI pipelines.'
  },
  {
    id: 'ap-southeast-1',
    name: 'Singapore',
    provider: 'AWS',
    intensity: 410,
    pue: 1.20,
    tier: 'high',
    lat: 1.3521,
    lon: 103.8198,
    mix: { gas: 92, solar: 6, coal: 2 },
    recommendation: 'High grid intensity. Heavily dependent on imported natural gas with high tropical ambient heat increasing cooling overhead.'
  },
  {
    id: 'ap-northeast-1',
    name: 'Tokyo, Japan',
    provider: 'AWS',
    intensity: 450,
    pue: 1.22,
    tier: 'high',
    lat: 35.6762,
    lon: 139.6503,
    mix: { gas: 62, coal: 24, solar: 10, hydro: 4 },
    recommendation: 'High carbon grid. Schedule batch processing during solar-rich daylight hours or off-peak night cycles.'
  },
  {
    id: 'ap-southeast-2',
    name: 'Sydney, Australia',
    provider: 'AWS',
    intensity: 520,
    pue: 1.21,
    tier: 'high',
    lat: -33.8688,
    lon: 151.2093,
    mix: { coal: 60, solar: 18, wind: 12, gas: 10 },
    recommendation: 'High carbon intensity due to coal generation. Active solar expansion underway; highest emissions occur during evening peak.'
  },
  {
    id: 'me-south-1',
    name: 'Bahrain',
    provider: 'AWS',
    intensity: 550,
    pue: 1.28,
    tier: 'high',
    lat: 26.0667,
    lon: 50.5577,
    mix: { gas: 98, solar: 2 },
    recommendation: 'High fossil fuel dependency. Ambient desert temperatures increase chilling requirements to PUE 1.28.'
  },
  {
    id: 'ap-south-1',
    name: 'Mumbai, India',
    provider: 'AWS',
    intensity: 708,
    pue: 1.25,
    tier: 'high',
    lat: 19.0760,
    lon: 72.8777,
    mix: { coal: 72, hydro: 12, solar: 10, wind: 6 },
    recommendation: 'Highest carbon grid in the AWS global fleet due to thermal coal dominance. Priority candidate for region migration optimization.'
  }
];

export function getTierBadge(tier, intensity) {
  if (tier === 'clean' || intensity < 150) {
    return {
      tier: 'clean',
      bg: 'badge-emerald',
      dot: '#10b981',
      label: 'Clean Grid (<150g)',
      colorClass: 'text-emerald',
      borderClass: 'border-emerald'
    };
  }
  if (tier === 'moderate' || intensity <= 400) {
    return {
      tier: 'moderate',
      bg: 'badge-amber',
      dot: '#f59e0b',
      label: 'Moderate (150–400g)',
      colorClass: 'text-amber',
      borderClass: 'border-amber'
    };
  }
  return {
    tier: 'high',
    bg: 'badge-rose',
    dot: '#f43f5e',
    label: 'High Carbon (>400g)',
    colorClass: 'text-rose',
    borderClass: 'border-rose'
  };
}

export const ENERGY_SOURCE_CONFIG = {
  hydro: { label: 'Hydroelectric', color: '#06b6d4', icon: 'Drop' },
  nuclear: { label: 'Nuclear', color: '#a855f7', icon: 'Atom' },
  wind: { label: 'Wind', color: '#3b82f6', icon: 'Wind' },
  solar: { label: 'Solar', color: '#eab308', icon: 'Sun' },
  biomass: { label: 'Biomass', color: '#10b981', icon: 'Plant' },
  gas: { label: 'Natural Gas', color: '#f97316', icon: 'Fire' },
  fossil: { label: 'Fossil Fuels', color: '#fb923c', icon: 'Flame' },
  coal: { label: 'Coal', color: '#ef4444', icon: 'Factory' }
};
