import logging
import aiohttp
from typing import Dict, Optional
from datetime import datetime, timedelta

from backend.app.config import settings
from backend.app.services.ccf_coefficients import get_grid_intensity

logger = logging.getLogger(__name__)

# Simple in-memory cache for API responses (region -> (intensity, timestamp))
_api_cache: Dict[str, tuple] = {}
CACHE_TTL = timedelta(hours=1)


async def get_realtime_carbon_intensity(region: str) -> float:
    """Get the grid carbon intensity for a region, using Electricity Maps if key is present.

    Otherwise falls back to the static CCF regional averages.
    """
    region = region.lower().strip()
    
    # Check cache first
    now = datetime.utcnow()
    if region in _api_cache:
        intensity, cached_time = _api_cache[region]
        if now - cached_time < CACHE_TTL:
            return intensity

    # If no API key, use static CCF fallback immediately
    if not settings.ELECTRICITY_MAPS_API_KEY:
        return get_grid_intensity(region)

    # Convert AWS region to Electricity Maps zone/country code
    # e.g., us-east-1 -> US-VA, eu-west-1 -> IE, ap-southeast-1 -> SG, etc.
    region_to_zone = {
        "us-east-1": "US-CAR-DVP", # PJM region
        "us-west-2": "US-NW-PACW", # Pacific NW
        "eu-west-1": "IE",          # Ireland
        "eu-central-1": "DE",       # Germany
        "eu-west-2": "GB",          # Great Britain
        "ap-southeast-1": "SG",     # Singapore
        "ap-south-1": "IN-WE",      # Western India
    }
    
    zone = region_to_zone.get(region)
    if not zone:
        # Fall back to static regional averages if zone mapping is unknown
        return get_grid_intensity(region)

    url = f"https://api.electricitymap.org/v3/carbon-intensity/latest?zone={zone}"
    headers = {"auth-token": settings.ELECTRICITY_MAPS_API_KEY}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=5) as response:
                if response.status == 200:
                    data = await response.json()
                    intensity = float(data.get("carbonIntensity", get_grid_intensity(region)))
                    _api_cache[region] = (intensity, now)
                    logger.info(f"Fetched real-time carbon intensity for {region} ({zone}): {intensity} gCO2eq/kWh")
                    return intensity
                else:
                    logger.warning(f"Electricity Maps API returned status {response.status} for zone {zone}. Using static fallback.")
    except Exception as e:
        logger.error(f"Error calling Electricity Maps API for region {region}: {e}")

    # Fallback to static
    return get_grid_intensity(region)
