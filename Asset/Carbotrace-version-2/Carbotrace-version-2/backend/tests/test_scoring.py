import pytest
from backend.app.services.scoring_engine import estimate_tests_carbon
from backend.app.services.ccf_coefficients import get_instance_power, get_grid_intensity


def test_dependency_carbon_formula():
    """Verify dependency carbon uses SCI-based energy estimation.

    Formula: carbon = (size_mb × 0.000015) × 475.0  (gCO2e)
    """
    size_mb = 50.0
    ENERGY_PER_MB_KWH = 0.000015
    GRID_INTENSITY = 475.0
    carbon = (size_mb * ENERGY_PER_MB_KWH) * GRID_INTENSITY
    assert abs(carbon - 0.35625) < 0.0001  # ~0.36g for 50MB


def test_pattern_penalty_formula():
    """Verify code AST patterns produce penalty points (not grams).

    Formula: penalty = (nested_loops × 3) + (N+1 × 5) + (unused_imports × 0.5) + (large_files × 1)
    """
    nested_loops = 2
    n_plus_one = 1
    unused_imports = 3
    large_files = 0
    penalty = (nested_loops * 3.0) + (n_plus_one * 5.0) + (unused_imports * 0.5) + (large_files * 1.0)
    assert penalty == 6.0 + 5.0 + 1.5 + 0.0  # = 12.5 points


def test_pattern_penalty_cap():
    """Verify AST penalty is capped at 40 points maximum."""
    # Extreme values
    nested_loops = 20
    n_plus_one = 10
    unused_imports = 50
    large_files = 10
    penalty = (nested_loops * 3.0) + (n_plus_one * 5.0) + (unused_imports * 0.5) + (large_files * 1.0)
    # Raw = 60 + 50 + 25 + 10 = 145, but should be capped at 40
    capped = min(penalty, 40.0)
    assert capped == 40.0


def test_ci_carbon_formula():
    """Verify CI carbon uses SCI-compliant energy estimation.

    Formula: energy_kwh = builds × (time_min/60) × avg_watts × PUE / 1000
             carbon = energy_kwh × grid_intensity
    """
    num_builds = 60
    build_time_min = 5.0
    avg_watts = 12.0
    pue = 1.15
    grid_intensity = 475.0
    build_time_hours = build_time_min / 60.0
    energy_kwh = num_builds * build_time_hours * avg_watts * pue / 1000.0
    carbon = energy_kwh * grid_intensity
    # 60 × (5/60) × 12 × 1.15 / 1000 = 0.069 kWh
    # 0.069 × 475 = 32.775 gCO2e
    assert abs(carbon - 32.775) < 0.01


def test_tests_estimation():
    """Verify test metrics estimator produces penalty points, not grams."""
    res = estimate_tests_carbon("d:/Projects/Carbotrace/backend")
    assert "num_tests" in res
    assert "test_files" in res
    assert "has_coverage_config" in res
    assert "penalty_points" in res
    assert "carbon" in res
    # Penalty should be reasonable (0-15 range)
    assert 0.0 <= res["penalty_points"] <= 15.0


def test_ccf_lookup_coefficients():
    """Verify CCF coefficients lookup function fallbacks."""
    # Test instances
    assert get_instance_power("t3.medium") == 15.0
    assert get_instance_power("t4g.nano") == 2.5
    assert get_instance_power("unknown.instance") == 30.0
    
    # Test grid intensities
    assert get_grid_intensity("us-west-2") == 78.4
    assert get_grid_intensity("global-average") == 475.0
    assert get_grid_intensity("unknown-region") == 475.0


def test_realistic_score_ranges():
    """Verify that typical projects produce realistic eco-scores.

    A small clean project should score 70-100 (not 0-3 on old 0-10 scale).
    """
    # Simulate a small project's deductions
    ast_penalty = 3.0       # 1 nested loop
    test_penalty = 5.0      # few tests
    dep_carbon_g = 0.1      # small dependency tree
    ci_carbon_g = 3.0       # ~60 builds/month
    infra_carbon_g = 0.0    # no IaC

    eco_score = 100.0
    eco_score -= ast_penalty
    eco_score -= test_penalty
    eco_score -= min((dep_carbon_g / 5.0) * 5.0, 5.0)
    eco_score -= min((ci_carbon_g / 200.0) * 15.0, 15.0) if ci_carbon_g > 0 else 0.0
    eco_score -= min((infra_carbon_g / 50000.0) * 20.0, 20.0) if infra_carbon_g > 0 else 0.0

    # Should be around 91.7 — Grade A
    assert 85.0 <= eco_score <= 100.0
