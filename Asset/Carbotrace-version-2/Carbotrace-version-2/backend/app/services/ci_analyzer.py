import os
import logging
from typing import Dict, Any, List
import yaml

logger = logging.getLogger(__name__)


def parse_workflows(repo_dir: str) -> List[Dict[str, Any]]:
    """Scan and parse GitHub Action workflows in the repository."""
    workflows = []
    workflows_dir = os.path.join(repo_dir, ".github", "workflows")
    
    if not os.path.exists(workflows_dir):
        return workflows
        
    for file in os.listdir(workflows_dir):
        if file.endswith((".yml", ".yaml")):
            file_path = os.path.join(workflows_dir, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    data = yaml.safe_load(f)
                    if isinstance(data, dict):
                        workflows.append(data)
            except Exception as e:
                logger.error(f"Error parsing workflow file {file_path}: {e}")
                
    return workflows


async def analyze_ci_pipeline(repo_dir: str) -> Dict[str, Any]:
    """Parse CI/CD workflows and calculate CI layer carbon emissions.

    Uses SCI-compliant energy estimation (ISO/IEC 21031:2024):
    - energy_kwh = num_builds × build_time_hours × avg_watts × PUE / 1000
    - carbon = energy_kwh × grid_intensity

    Empirical basis (Eco CI / Green Coding Solutions):
    - Avg CPU utilization on GitHub Actions 2-core runner: ~10-15% of TDP
    - Measured average power draw: ~12W for a standard 2-core Linux runner
    - PUE for cloud data centers: 1.15 (AWS/Azure average)
    """
    workflows = parse_workflows(repo_dir)
    num_workflows = len(workflows)
    
    # Defaults based on Eco CI empirical measurements
    num_builds = 30 * max(num_workflows, 1)  # 30 builds per month per workflow
    pr_builds = 15 * max(num_workflows, 1)   # 15 PR builds per month per workflow
    build_time_min = 5.0                     # 5 minutes average build time
    avg_watts = 12.0                         # 12W measured avg for 2-core Linux runner (Eco CI)
    pue = 1.15                               # Power Usage Effectiveness (AWS/Azure avg)
    grid_intensity = 475.0                   # 475 gCO2/kWh global average grid intensity
    missing_caching = 1                      # Default to penalty
    
    if num_workflows > 0:
        caching_found = False
        
        for wf in workflows:
            # Check runs-on runner type
            jobs = wf.get("jobs", {})
            if isinstance(jobs, dict):
                for job_id, job_val in jobs.items():
                    if isinstance(job_val, dict):
                        runner = str(job_val.get("runs-on", "")).lower()
                        if "macos" in runner:
                            avg_watts = 8.0   # macOS runner (Apple Silicon, more efficient)
                        elif "ubuntu" in runner or "windows" in runner:
                            avg_watts = 12.0  # Standard 2-core Linux/Windows runner
                            
                        # Scan steps for caching
                        steps = job_val.get("steps", [])
                        if isinstance(steps, list):
                            for step in steps:
                                if isinstance(step, dict):
                                    uses = str(step.get("uses", "")).lower()
                                    # Common cache methods
                                    if "cache" in uses or "setup-node" in uses or "setup-python" in uses:
                                        caching_found = True
            
            # Check custom build times or triggers in name/metadata
            triggers = wf.get("on", {})
            if isinstance(triggers, list):
                if "pull_request" not in triggers:
                    pr_builds = 0
            elif isinstance(triggers, dict):
                if "pull_request" not in triggers:
                    pr_builds = 0
                    
        if caching_found:
            missing_caching = 0

    # If there are no workflows, set builds and PR builds to 0
    if num_workflows == 0:
        num_builds = 0
        pr_builds = 0
        missing_caching = 0

    # SCI-compliant energy formulas
    # Energy (kWh) = builds × time_hours × avg_watts × PUE / 1000
    build_time_hours = build_time_min / 60.0

    # Build carbon: energy from all scheduled/push builds
    build_energy_kwh = num_builds * build_time_hours * avg_watts * pue / 1000.0
    build_carbon = build_energy_kwh * grid_intensity

    # Redundant PR build carbon (builds that could be deduplicated/skipped)
    # Assume ~30% of PR builds are redundant (e.g., re-runs on same commit)
    redundant_energy_kwh = (pr_builds * 0.3) * build_time_hours * avg_watts * pue / 1000.0
    redundant_carbon = redundant_energy_kwh * grid_intensity

    # Caching penalty: missing cache adds ~1 extra minute per build for dependency install
    caching_extra_min = 1.0 if missing_caching else 0.0
    caching_energy_kwh = num_builds * (caching_extra_min / 60.0) * avg_watts * pue / 1000.0
    caching_penalty = caching_energy_kwh * grid_intensity
    
    ci_total = build_carbon + redundant_carbon + caching_penalty

    return {
        "num_workflows": num_workflows,
        "num_builds": num_builds,
        "pr_builds": pr_builds,
        "build_time_min": build_time_min,
        "avg_watts": avg_watts,
        "missing_caching": missing_caching,
        "build_carbon": round(build_carbon, 4),
        "redundant_carbon": round(redundant_carbon, 4),
        "caching_penalty": round(caching_penalty, 4),
        "carbon": round(ci_total, 4)
    }

