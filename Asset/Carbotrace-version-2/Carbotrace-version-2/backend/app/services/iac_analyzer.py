import os
import re
import json
import logging
from typing import Dict, List, Any
import yaml

from backend.app.services.ccf_coefficients import get_instance_power, AWS_PUE
from backend.app.services.carbon_intensity import get_realtime_carbon_intensity

logger = logging.getLogger(__name__)

# Standard constants
HOURS_PER_MONTH = 730  # Standard active hours for monthly calculation
DEFAULT_STORAGE_GB = 50.0  # Assumed storage per instance (EBS)


def parse_terraform_files(repo_dir: str) -> List[Dict[str, Any]]:
    """Scan Terraform files (.tf) to identify AWS instances and regions."""
    instances = []
    global_region = "us-east-1"
    
    # Try to find provider region first
    region_pattern = re.compile(r"region\s*=\s*\"([a-z0-9\-]+)\"")
    instance_block_start = re.compile(r"resource\s+\"aws_instance\"\s+\"([^\"]+)\"")
    instance_type_pattern = re.compile(r"instance_type\s*=\s*\"([a-z0-9\.]+)\"")
    
    for root, _, files in os.walk(repo_dir):
        if any(part in root.split(os.sep) for part in (".git", ".venv", "venv", "node_modules")):
            continue
            
        for file in files:
            if file.endswith(".tf"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        
                    # Extract region from provider block
                    region_matches = region_pattern.findall(content)
                    if region_matches:
                        global_region = region_matches[0]
                        
                    # Extract instances
                    # We look for aws_instance blocks. We can use a simple line-by-line / block scanner
                    lines = content.splitlines()
                    in_instance = False
                    current_instance = {}
                    
                    for line in lines:
                        line_stripped = line.strip()
                        block_match = instance_block_start.search(line_stripped)
                        if block_match:
                            in_instance = True
                            current_instance = {
                                "name": block_match.group(1),
                                "instance_type": "t3.micro",  # default fallback
                                "region": global_region
                            }
                            continue
                            
                        if in_instance:
                            if line_stripped == "}":
                                in_instance = False
                                if current_instance:
                                    instances.append(current_instance)
                                    current_instance = {}
                                continue
                                
                            type_match = instance_type_pattern.search(line_stripped)
                            if type_match:
                                current_instance["instance_type"] = type_match.group(1)
                                
                except Exception as e:
                    logger.error(f"Error parsing Terraform file {file_path}: {e}")
                    
    # Fill in region if not specified per instance
    for inst in instances:
        if "region" not in inst or not inst["region"]:
            inst["region"] = global_region
            
    return instances


def parse_cloudformation_files(repo_dir: str) -> List[Dict[str, Any]]:
    """Scan CloudFormation templates (.json, .yaml, .yml) to identify EC2 resources."""
    instances = []
    
    for root, _, files in os.walk(repo_dir):
        if any(part in root.split(os.sep) for part in (".git", ".venv", "venv", "node_modules")):
            continue
            
        for file in files:
            file_path = os.path.join(root, file)
            # Skip common non-template YAML/JSON files
            if file in ("package.json", "tsconfig.json", "docker-compose.yml", "docker-compose.dev.yml"):
                continue
                
            if file.endswith((".json", ".yaml", ".yml")):
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        
                    # Quick pre-filter to see if it looks like a CloudFormation template
                    if "AWS::EC2::Instance" not in content:
                        continue
                        
                    # Parse based on file extension
                    template_data = {}
                    if file.endswith(".json"):
                        try:
                            template_data = json.loads(content)
                        except json.JSONDecodeError:
                            continue
                    else:
                        try:
                            template_data = yaml.safe_load(content)
                        except yaml.YAMLError:
                            continue
                            
                    if not isinstance(template_data, dict):
                        continue
                        
                    resources = template_data.get("Resources", {})
                    for res_name, res_val in resources.items():
                        if not isinstance(res_val, dict):
                            continue
                        if res_val.get("Type") == "AWS::EC2::Instance":
                            properties = res_val.get("Properties", {})
                            instance_type = properties.get("InstanceType", "t3.micro")
                            # If it's a parameter reference, use a sensible default
                            if isinstance(instance_type, dict) and "Ref" in instance_type:
                                instance_type = "t3.micro"
                                
                            instances.append({
                                "name": res_name,
                                "instance_type": str(instance_type),
                                "region": "us-east-1"  # CFN templates usually parameterize region; default to us-east-1
                            })
                except Exception as e:
                    logger.error(f"Error parsing CloudFormation template {file_path}: {e}")
                    
    return instances


async def analyze_iac_infrastructure(repo_dir: str) -> Dict[str, Any]:
    """Scans the repository for Infrastructure-as-Code files (Terraform & CloudFormation).

    Maps instance types to CCF coefficients and calculates baseline infrastructure carbon.
    """
    tf_instances = parse_terraform_files(repo_dir)
    cfn_instances = parse_cloudformation_files(repo_dir)
    
    all_instances = tf_instances + cfn_instances
    num_instances = len(all_instances)
    
    total_service_carbon = 0.0
    total_embodied_carbon = 0.0
    total_kwh = 0.0
    
    details_list = []
    
    for inst in all_instances:
        name = inst["name"]
        instance_type = inst["instance_type"]
        region = inst["region"]
        
        # CCF Lookup / Real-time intensity
        power_watts = get_instance_power(instance_type)
        grid_intensity = await get_realtime_carbon_intensity(region)
        
        # Monthly Energy Consumption (kWh) = Hours * Watts * PUE / 1000
        energy_kwh = HOURS_PER_MONTH * power_watts * AWS_PUE / 1000.0
        total_kwh += energy_kwh
        
        # Service Carbon (g CO2e) = kWh * Grid Intensity
        service_carbon = energy_kwh * grid_intensity
        total_service_carbon += service_carbon
        
        # Embodied Carbon (g CO2e/month) = (kWh * 0.1) + (Storage_GB * 0.01)
        # Note: Embodied carbon of hardware manufacturing allocated monthly.
        # CCF Embodied Carbon Formula: (Total_kWh * 0.1) + (Storage_GB * 0.01)
        embodied_carbon = (energy_kwh * 0.1) + (DEFAULT_STORAGE_GB * 0.01)
        total_embodied_carbon += embodied_carbon
        
        details_list.append({
            "name": name,
            "instance_type": instance_type,
            "region": region,
            "power_watts": power_watts,
            "energy_kwh": energy_kwh,
            "service_carbon": service_carbon,
            "embodied_carbon": embodied_carbon
        })
        
    infra_total_carbon = total_service_carbon + total_embodied_carbon
    
    return {
        "num_instances": num_instances,
        "instances": details_list,
        "total_kwh": total_kwh,
        "service_carbon": total_service_carbon,
        "embodied_carbon": total_embodied_carbon,
        "carbon": infra_total_carbon
    }
