import pytest
import os
from backend.app.services.ci_analyzer import parse_workflows, analyze_ci_pipeline


def test_parse_workflows(temp_repo_dir):
    workflows_dir = os.path.join(temp_repo_dir, ".github", "workflows")
    os.makedirs(workflows_dir, exist_ok=True)
    wf_file = os.path.join(workflows_dir, "ci.yml")

    with open(wf_file, "w", encoding="utf-8") as f:
        f.write("""name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          cache: 'npm'
""")

    workflows = parse_workflows(temp_repo_dir)
    assert len(workflows) == 1
    assert workflows[0]["name"] == "CI"


@pytest.mark.asyncio
async def test_analyze_ci_pipeline_with_caching(temp_repo_dir):
    workflows_dir = os.path.join(temp_repo_dir, ".github", "workflows")
    os.makedirs(workflows_dir, exist_ok=True)
    wf_file = os.path.join(workflows_dir, "build.yml")

    with open(wf_file, "w", encoding="utf-8") as f:
        f.write("""name: Build
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/cache@v3
""")

    res = await analyze_ci_pipeline(temp_repo_dir)
    assert res["num_workflows"] == 1
    assert res["missing_caching"] == 0
    assert res["carbon"] > 0


@pytest.mark.asyncio
async def test_analyze_ci_pipeline_no_workflows(temp_repo_dir):
    res = await analyze_ci_pipeline(temp_repo_dir)
    assert res["num_workflows"] == 0
    assert res["carbon"] == 0.0
