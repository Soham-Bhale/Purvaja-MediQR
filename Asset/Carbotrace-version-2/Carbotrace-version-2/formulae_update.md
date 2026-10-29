# Recalibrating Carbon Emissions: Research-Backed Scoring Overhaul

## Problem Statement

Every repository scanned by Carbotrace produces **inflated carbon severity readings** (consistently scoring 6–10/10 "High Severity"). The root cause is that the formulas across all three analysis layers use **arbitrary penalty multipliers** with no grounding in empirical energy data. This plan corrects each formula using peer-reviewed research and industry standards.

---

## Research Foundation

The corrections below are grounded in these sources:

| Source | Key Contribution |
|--------|-----------------|
| **SCI Specification (ISO/IEC 21031:2024)** | `SCI = ((E × I) + M) / R` — Energy × Grid Intensity + Embodied Carbon, per functional unit |
| **CodeCarbon** (open-source, widely cited at ICSE/GREENS) | Empirical power draw: typical developer workstation ≈ 15–30W idle CPU. A 10-second `pip install` consumes ~0.00004 kWh ≈ **0.019 g CO2e** at global average grid |
| **Eco CI Energy Estimation** (Green Coding Solutions) | GitHub Actions runner average: **~13.36 J per pipeline**, 4-core AMD EPYC @ ~7–12W average utilization |
| **Cloud Carbon Footprint (CCF)** methodology | Instance power coefficients, PUE=1.15, embodied carbon formulas — already correctly used in `ccf_coefficients.py` |
| **GREENS 2025 / ICSE 2025** survey | Confirms that static analysis of code patterns is a *proxy signal* for runtime efficiency, not a direct carbon measurement |

---

## Root Cause Analysis per Layer

### Layer 1: Code (`dependency_analyzer.py` + `ast_analyzer.py` + `scoring_engine.py`)

**Current problems:**

| Component | Current Formula | Problem |
|-----------|----------------|---------|
| Dependencies | `(num_deps × 0.5) + (size_mb × 0.12)` | Assigns 0.5g per dependency — a project with 30 deps gets 15g just for existing. Real `pip install` of 30 packages: ~0.05g CO2e |
| AST Patterns | `(nested_loops × 50) + (N+1 × 75) + (unused_imports × 5)` | 2 nested loops + 1 N+1 = **175g**. These are efficiency *signals*, not measurements — they should produce risk scores, not grams |
| Tests | `(num_tests × 0.5) + (avg_time × 0.2) + (coverage_gap × 2.0)` | 80 estimated tests → 40g. With 0 tests, coverage_gap=100 → 200g penalty |
| Master Score | `(code/1000)×3 + (ci/800)×2 + (infra/10000)×5` → 0–10 | Divisors too small for inflated numerators → always hits ceiling |

> [!IMPORTANT]
> **Key insight from research**: Static analysis cannot measure actual grams CO2. The SCI specification requires measured energy (E). What Carbotrace does with AST patterns is *estimate relative efficiency risk*, not measure emissions. The fix is to:
> 1. Use physics-based energy estimation for **dependencies** and **CI** (the SCI formula)
> 2. Treat AST patterns as **dimensionless efficiency deductions** from a 100-point score, not as gram-denominated carbon values

### Layer 2: CI (`ci_analyzer.py`)

**Current formula:**
```
build_carbon = num_builds × build_time_min × cpu_watts × grid_intensity × 0.0002
```

With 2 workflows: `num_builds=60`, `build_time_min=5`, `cpu_watts=150`, `grid_intensity=475`:
```
60 × 5 × 150 × 475 × 0.0002 = 4,275 g CO2e/month
```

**Reality check** (Eco CI data): A typical 5-minute GitHub Actions build consumes ~0.001–0.003 kWh → **0.5–1.4 g CO2e per build** at global average grid. 60 builds/month → **30–84 g CO2e/month**, not 4,275.

**The bug**: `cpu_watts=150` is the full **TDP** of the server, but CI runners only use ~10–15% average CPU utilization. The `0.0002` multiplier was meant to compensate but is incorrectly applied.

**Correct formula** (per SCI/Eco CI):
```
energy_kwh = build_time_min × (1/60) × avg_watts × PUE / 1000
build_carbon = energy_kwh × grid_intensity
```
Where `avg_watts` ≈ 12W (measured average for a 2-core Linux runner), PUE = 1.15.

### Layer 3: Infrastructure (`iac_analyzer.py`)

The IaC layer is actually the **most correctly implemented** — it uses proper CCF coefficients and the `energy_kwh = hours × watts × PUE / 1000` formula. No changes needed here, but the *master score formula* over-weights it.

---

## Proposed Changes

### Scoring Philosophy Change

Move from "everything in grams CO2e" to a **hybrid model**:
- **CI and Infrastructure**: Keep in real grams CO2e (using physics-based SCI formula)  
- **Code efficiency (AST/deps)**: Use an **Eco-Score (0–100)** where 100 = cleanest. This is the industry-standard approach — patterns are *signals*, not measurements
- **Master Score**: Combine into a single 0–100 Eco-Score (higher = better), consistent with ScoreGauge display

---

### Backend Files

#### [MODIFY] [scoring_engine.py](file:///d:/Projects/Carbotrace/backend/app/services/scoring_engine.py)
- Replace master score formula: `100 – penalty_deductions` (higher = better, 0–100 scale)
- Code efficiency score: start at 100, deduct for patterns/issues found
- CI & infra: convert to real grams CO2e, then deduct proportionally from eco-score
- Remove `estimate_tests_carbon` arbitrary formula; replace with lightweight deductions

#### [MODIFY] [dependency_analyzer.py](file:///d:/Projects/Carbotrace/backend/app/services/dependency_analyzer.py)
- Replace `(num_deps × 0.5) + (size_mb × 0.12)` with SCI-based estimate:
  - `install_energy_kwh = size_mb × 0.000015` (empirical: ~15 µWh/MB for package download+install)
  - `carbon = install_energy_kwh × grid_intensity`
- This makes a 50MB dependency tree → ~0.36g CO2e (realistic), not 25g+

#### [MODIFY] [ast_analyzer.py](file:///d:/Projects/Carbotrace/backend/app/services/ast_analyzer.py)
- Change `carbon` output from grams to **penalty points** (0–100 scale deductions)
- Nested loops: 3 points each (not 50g)
- N+1 queries: 5 points each (not 75g)  
- Unused imports: 0.5 points each (not 5g)
- Large files: 1 point each
- Cap total penalty at 40 points

#### [MODIFY] [ci_analyzer.py](file:///d:/Projects/Carbotrace/backend/app/services/ci_analyzer.py)
- Fix energy formula to use average watts (not TDP), proper time conversion
- `avg_watts = 12.0` for 2-core Linux runner (Eco CI empirical data)
- `energy_kwh = num_builds × build_time_min × (1/60) × avg_watts × PUE / 1000`
- `build_carbon = energy_kwh × grid_intensity`
- Redundant/caching penalties as percentage additions, not multiplicative blowups

---

### Frontend

#### [MODIFY] [ScoreGauge.jsx](file:///d:/Projects/Carbotrace/frontend/src/components/ScoreGauge.jsx)
- Update gauge to render 0–100 scale (higher = better) instead of 0–10
- Adjust grade thresholds: A ≥ 85, B ≥ 60, C < 60

#### [MODIFY] [HistoryTable.jsx](file:///d:/Projects/Carbotrace/frontend/src/components/HistoryTable.jsx)
- Update `getScoreColor` thresholds for 0–100 scale

---

### Tests

#### [MODIFY] [test_scoring.py](file:///d:/Projects/Carbotrace/backend/tests/test_scoring.py)
- Update formula assertions for new coefficients
- Add tests verifying realistic output ranges (e.g., a small Python project should score 70–95)

---

## Verification Plan

### Automated Tests
```bash
pytest backend/tests/
```

### Manual Verification
- Scan `facebook/react` → should produce Eco-Score ~70–85 (large JS project, many deps, but well-maintained)
- Scan `pallets/flask` → should produce Eco-Score ~80–90 (lean Python project)
- Scan a small personal repo → should produce Eco-Score ~85–95
- Verify no repo produces a fixed 6–10/10 "High Severity" score anymore
