import os
import csv
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


def parse_codecarbon_emissions(repo_dir: str) -> Optional[Dict[str, Any]]:
    """Scan the repository root for CodeCarbon `emissions.csv` and parse it.

    Returns:
        A dictionary containing parsed CodeCarbon metrics, or None if the file doesn't exist.
    """
    emissions_file = os.path.join(repo_dir, "emissions.csv")
    if not os.path.exists(emissions_file):
        return None

    logger.info(f"Detected CodeCarbon emissions.csv at {emissions_file}")
    
    total_emissions_kg = 0.0
    total_duration_sec = 0.0
    total_energy_kwh = 0.0
    cpu_energy_kwh = 0.0
    gpu_energy_kwh = 0.0
    ram_energy_kwh = 0.0

    try:
        with open(emissions_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            # Verify columns we expect
            fieldnames = reader.fieldnames or []
            
            for row in reader:
                try:
                    total_emissions_kg += float(row.get("emissions", 0.0))
                    total_duration_sec += float(row.get("duration", 0.0))
                    total_energy_kwh += float(row.get("energy_consumed", 0.0))
                    cpu_energy_kwh += float(row.get("cpu_energy", 0.0))
                    gpu_energy_kwh += float(row.get("gpu_energy", 0.0))
                    ram_energy_kwh += float(row.get("ram_energy", 0.0))
                except ValueError as ve:
                    logger.warning(f"Error parsing row in emissions.csv: {ve}")
                    continue

        # Convert emissions from kg to grams (g CO2e)
        emissions_g = total_emissions_kg * 1000.0

        return {
            "emissions_g": emissions_g,
            "duration_sec": total_duration_sec,
            "energy_kwh": total_energy_kwh,
            "cpu_energy_kwh": cpu_energy_kwh,
            "gpu_energy_kwh": gpu_energy_kwh,
            "ram_energy_kwh": ram_energy_kwh
        }
    except Exception as e:
        logger.error(f"Error reading emissions.csv: {e}")
        return None
