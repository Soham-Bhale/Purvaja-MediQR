import os
import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.services.dependency_analyzer import analyze_dependencies
from backend.app.services.ast_analyzer import analyze_ast_patterns
from backend.app.services.ci_analyzer import analyze_ci_pipeline
from backend.app.services.iac_analyzer import analyze_iac_infrastructure
from backend.app.services.codecarbon_parser import parse_codecarbon_emissions
from backend.app.services.carbon_intensity import get_realtime_carbon_intensity
from backend.app.services.aws_cost_explorer import analyze_aws_cost_explorer

logger = logging.getLogger(__name__)


def estimate_tests_carbon(repo_dir: str) -> Dict[str, float]:
    """Scan repo directory to estimate test suite metrics and eco-score deductions.

    Instead of assigning arbitrary grams CO2, this produces a penalty deduction
    (0-15 points) based on test coverage health signals:
    - No tests found:     10 point penalty (missing quality gate)
    - Few tests (<16):    5 point penalty
    - No coverage config: 2 point penalty
    """
    test_files_count = 0
    has_coverage_config = False

    for root, _, files in os.walk(repo_dir):
        if any(part in root.split(os.sep) for part in (".git", ".venv", "venv", "node_modules")):
            continue
        for file in files:
            file_lower = file.lower()
            if (
                file_lower.startswith("test_") 
                or file_lower.endswith("_test.py") 
                or ".test." in file_lower 
                or ".spec." in file_lower
            ):
                test_files_count += 1
            # Check for coverage config files
            if file_lower in (".coveragerc", "coverage.xml", "jest.config.js",
                              "jest.config.ts", "vitest.config.js", "vitest.config.ts",
                              ".nycrc", "codecov.yml", ".codecov.yml"):
                has_coverage_config = True

    num_tests = test_files_count * 8  # Estimate 8 tests per file

    # Penalty deductions (not grams)
    penalty = 0.0
    if num_tests == 0:
        penalty = 10.0   # No tests at all — significant gap
    elif num_tests < 16:
        penalty = 5.0    # Very few tests

    if not has_coverage_config:
        penalty += 2.0   # No coverage tracking configured

    return {
        "num_tests": num_tests,
        "test_files": test_files_count,
        "has_coverage_config": has_coverage_config,
        "penalty_points": round(penalty, 1),
        "carbon": round(penalty, 1)  # backward compat key
    }


async def calculate_master_score(
    db: AsyncSession, 
    repo_dir: str
) -> Dict[str, Any]:
    """Orchestrates analysis across Code, CI/CD, and Infrastructure layers
    and computes the Eco-Score (0-100, higher = better).

    Scoring Philosophy (grounded in SCI spec, ISO/IEC 21031:2024):
    - Start at 100 (perfect eco-score)
    - Deduct penalty points from AST pattern analysis (efficiency signals)
    - Deduct penalty points from test coverage gaps
    - Deduct proportional points from CI carbon (real gCO2e, SCI formula)
    - Deduct proportional points from infrastructure carbon (real gCO2e, CCF formula)
    - Dependency carbon is informational (real gCO2e) but contributes minor deductions
    - CodeCarbon overlay adds measured physical emissions
    """
    logger.info(f"Starting eco-score calculation for {repo_dir}...")
    
    # 1. Layer 1: Code-level Analysis
    dep_results = await analyze_dependencies(db, repo_dir)
    ast_results = await analyze_ast_patterns(repo_dir)
    test_results = estimate_tests_carbon(repo_dir)
    
    # Dependency carbon is now in real gCO2e (very small, typically 0.01-1g)
    dep_carbon_g = dep_results["carbon"]
    
    # AST penalty is now dimensionless points (0-40)
    ast_penalty = ast_results["penalty_points"]
    
    # Test penalty is dimensionless points (0-15)
    test_penalty = test_results["penalty_points"]
    
    # Check for CodeCarbon CSV overlay (actual measured physical emissions)
    codecarbon_overlay = parse_codecarbon_emissions(repo_dir)
    codecarbon_g = codecarbon_overlay["emissions_g"] if codecarbon_overlay else 0.0

    # Total code-level carbon (informational gCO2e)
    code_carbon_g = dep_carbon_g + codecarbon_g

    # 2. Layer 2: CI/CD Pipeline Carbon (real gCO2e from SCI formula)
    ci_results = await analyze_ci_pipeline(repo_dir)
    ci_carbon_g = ci_results["carbon"]

    # 3. Layer 3: Infrastructure Carbon (real gCO2e from CCF methodology)
    infra_results = await analyze_iac_infrastructure(repo_dir)
    infra_carbon_iac = infra_results["carbon"]
    
    aws_live = await analyze_aws_cost_explorer()
    if aws_live:
        infra_results["aws_live"] = aws_live
        infra_carbon_g = infra_carbon_iac + aws_live["carbon"]
    else:
        infra_results["aws_live"] = None
        infra_carbon_g = infra_carbon_iac

    # ═══════════════════════════════════════════════════════════════
    # ECO-SCORE CALCULATION (0-100, higher = better)
    # ═══════════════════════════════════════════════════════════════
    # Start at 100 and deduct:
    #
    # 1. AST efficiency penalties (max 40 points)         — code quality signals
    # 2. Test coverage penalties (max 15 points)          — quality gate signals
    # 3. Dependency carbon deduction (max 5 points)       — proportional to real gCO2e
    # 4. CI carbon deduction (max 15 points)              — proportional to real gCO2e
    # 5. Infra carbon deduction (max 20 points)           — proportional to real gCO2e
    # 6. CodeCarbon overlay deduction (max 5 points)      — measured emissions bonus penalty
    #
    # Total max deduction = 100 points (score can reach 0)

    eco_score = 100.0

    # 1. AST penalty (already capped at 40)
    eco_score -= ast_penalty

    # 2. Test penalty (already capped at ~12)
    eco_score -= test_penalty

    # 3. Dependency carbon → proportional deduction (max 5 points)
    # Typical range: 0.01g (tiny project) to ~5g (huge monorepo with 500+ deps)
    dep_deduction = min((dep_carbon_g / 5.0) * 5.0, 5.0)
    eco_score -= dep_deduction

    # 4. CI carbon → proportional deduction (max 15 points)
    # Typical range: 0g (no CI) to ~200g (heavy CI with many workflows)
    ci_deduction = min((ci_carbon_g / 200.0) * 15.0, 15.0) if ci_carbon_g > 0 else 0.0
    eco_score -= ci_deduction

    # 5. Infra carbon → proportional deduction (max 20 points)
    # Typical range: 0g (no IaC) to ~50,000g (large multi-region infra)
    infra_deduction = min((infra_carbon_g / 50000.0) * 20.0, 20.0) if infra_carbon_g > 0 else 0.0
    eco_score -= infra_deduction

    # 6. CodeCarbon overlay bonus deduction (max 5 points)
    # If measured physical emissions exist, scale proportionally
    codecarbon_deduction = 0.0
    if codecarbon_g > 0:
        codecarbon_deduction = min((codecarbon_g / 100.0) * 5.0, 5.0)
        eco_score -= codecarbon_deduction

    # Bound the score between 0 and 100
    eco_score = max(min(eco_score, 100.0), 0.0)

    # Generate risk items/warnings
    risks = []
    if ast_results["nested_loops"] >= 3:
        risks.append({
            "layer": "code",
            "severity": "HIGH",
            "message": f"Detected {ast_results['nested_loops']} nested loops, indicating potential performance/carbon inefficiencies."
        })
    if ast_results["n_plus_one_queries"] >= 1:
        risks.append({
            "layer": "code",
            "severity": "HIGH",
            "message": f"Detected {ast_results['n_plus_one_queries']} potential database N+1 query patterns."
        })
    if ci_results["missing_caching"] == 1:
        risks.append({
            "layer": "ci",
            "severity": "MEDIUM",
            "message": "CI workflows do not utilize package dependency caching, increasing build times and energy use."
        })
    if infra_results["num_instances"] > 0:
        for inst in infra_results["instances"]:
            # Warn if not using Graviton (ARM)
            inst_type = inst["instance_type"]
            if not any(arm_marker in inst_type for arm_marker in ("g", "a")):
                risks.append({
                    "layer": "infra",
                    "severity": "MEDIUM",
                    "message": f"Instance '{inst['name']}' ({inst_type}) can be migrated to AWS Graviton ARM for up to 40% carbon savings."
                })
            # Warn if in a dirty grid region (Mumbai, Singapore, etc.)
            grid_intensity = await get_realtime_carbon_intensity(inst["region"])
            if grid_intensity > 350.0:
                risks.append({
                    "layer": "infra",
                    "severity": "MEDIUM",
                    "message": f"Instance '{inst['name']}' is running in region '{inst['region']}' with high carbon grid intensity ({grid_intensity} gCO2/kWh). Recommend migrating to us-west-2 or ca-central-1."
                })

    # Total carbon footprint in gCO2e (informational, for display)
    total_carbon_g = code_carbon_g + ci_carbon_g + infra_carbon_g

    return {
        "total_score": round(eco_score, 1),
        "total_carbon_g": round(total_carbon_g, 2),
        "code_carbon": round(code_carbon_g, 4),
        "ci_carbon": round(ci_carbon_g, 4),
        "infra_carbon": round(infra_carbon_g, 2),
        "deductions": {
            "ast_penalty": round(ast_penalty, 1),
            "test_penalty": round(test_penalty, 1),
            "dep_deduction": round(dep_deduction, 2),
            "ci_deduction": round(ci_deduction, 2),
            "infra_deduction": round(infra_deduction, 2),
            "codecarbon_deduction": round(codecarbon_deduction, 2),
        },
        "layers": {
            "code": {
                "carbon": round(code_carbon_g, 4),
                "breakdown": {
                    "dependencies": dep_results,
                    "ast_patterns": ast_results,
                    "tests": test_results,
                    "codecarbon_physical": codecarbon_overlay
                }
            },
            "ci": {
                "carbon": round(ci_carbon_g, 4),
                "breakdown": ci_results
            },
            "infra": {
                "carbon": round(infra_carbon_g, 2),
                "breakdown": infra_results
            }
        },
        "risks": risks
    }
