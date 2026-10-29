# Cloud Carbon Footprint (CCF) Lookup Coefficients

# PUE (Power Usage Effectiveness) by Cloud Provider
# AWS average PUE is ~1.15
AWS_PUE = 1.15

# Grid intensity by AWS region (in gCO2eq/kWh)
# Based on CCF regional factors
REGIONAL_GRID_INTENSITY = {
    "us-east-1": 379.3,   # N. Virginia
    "us-east-2": 454.4,   # Ohio
    "us-west-1": 236.4,   # N. California
    "us-west-2": 78.4,    # Oregon (clean hydro!)
    "ca-central-1": 28.0, # Central Canada (very clean!)
    "eu-west-1": 313.4,   # Ireland
    "eu-west-2": 242.0,   # London
    "eu-central-1": 353.0,# Frankfurt
    "ap-southeast-1": 408.0,# Singapore
    "ap-northeast-1": 466.0,# Tokyo
    "ap-south-1": 708.2,  # Mumbai (high coal dependency)
    "sa-east-1": 113.0,   # Sao Paulo
    "global-average": 475.0 # Global baseline
}

# TDP (Thermal Design Power) / active wattage estimate per instance type family
# Typical active power consumption in Watts (including CPU, memory overhead, baseline system)
INSTANCE_POWER_MAP = {
    # General Purpose
    "t2.nano": 5.0, "t2.micro": 8.0, "t2.small": 12.0, "t2.medium": 18.0, "t2.large": 25.0,
    "t3.nano": 4.5, "t3.micro": 7.0, "t3.small": 10.0, "t3.medium": 15.0, "t3.large": 22.0,
    "t3a.nano": 4.5, "t3a.micro": 7.0, "t3a.small": 10.0, "t3a.medium": 15.0, "t3a.large": 22.0,
    "t4g.nano": 2.5, "t4g.micro": 4.0, "t4g.small": 6.0, "t4g.medium": 9.0, "t4g.large": 14.0, # Graviton (ARM) is much more efficient!
    
    "m5.large": 35.0, "m5.xlarge": 70.0, "m5.2xlarge": 140.0, "m5.4xlarge": 280.0,
    "m6g.large": 20.0, "m6g.xlarge": 40.0, "m6g.2xlarge": 80.0, "m6g.4xlarge": 160.0, # Graviton
    
    # Compute Optimized
    "c5.large": 45.0, "c5.xlarge": 90.0, "c5.2xlarge": 180.0, "c5.4xlarge": 360.0,
    "c6g.large": 25.0, "c6g.xlarge": 50.0, "c6g.2xlarge": 100.0, "c6g.4xlarge": 200.0, # Graviton
    
    # Memory Optimized
    "r5.large": 40.0, "r5.xlarge": 80.0, "r5.2xlarge": 160.0, "r5.4xlarge": 320.0,
    "r6g.large": 22.0, "r6g.xlarge": 44.0, "r6g.2xlarge": 88.0, "r6g.4xlarge": 176.0, # Graviton
}

DEFAULT_INSTANCE_POWER = 30.0  # Default 30W active power


def get_instance_power(instance_type: str) -> float:
    """Get estimated active power (Watts) for an EC2 instance type."""
    instance_type = instance_type.lower().strip()
    # Check exact match
    if instance_type in INSTANCE_POWER_MAP:
        return INSTANCE_POWER_MAP[instance_type]
    
    # Check family-based fallback (e.g. t3.xlarge -> fall back to t3.large values or estimate proportionally)
    family_match = re.match(r"^([a-z0-9]+)\.", instance_type)
    if family_match:
        family = family_match.group(1)
        # Try to find default for that family
        family_defaults = {k: v for k, v in INSTANCE_POWER_MAP.items() if k.startswith(f"{family}.")}
        if family_defaults:
            # Return the average or max
            return list(family_defaults.values())[-1]
            
    return DEFAULT_INSTANCE_POWER


def get_grid_intensity(region: str) -> float:
    """Get grid intensity in gCO2eq/kWh for a given AWS region."""
    region = region.lower().strip()
    return REGIONAL_GRID_INTENSITY.get(region, REGIONAL_GRID_INTENSITY["global-average"])


import re
