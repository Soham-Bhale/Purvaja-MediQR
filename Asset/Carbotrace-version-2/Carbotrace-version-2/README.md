# Carbotrace

Software Carbon Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-PostgreSQL_16-336791.svg?style=flat&logo=postgresql)](https://www.timescale.com/)
[![tree-sitter](https://img.shields.io/badge/AST-tree--sitter-green.svg)](https://tree-sitter.github.io/)
[![Ollama](https://img.shields.io/badge/LLM-Ollama_Qwen_2.5_Coder-black.svg)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Carbotrace is an open-source software carbon intelligence platform that measures, audits, and optimizes carbon intensity across application source code, CI/CD pipelines, and cloud infrastructure.

---

## Overview

Existing developer tooling isolates code linting from cloud infrastructure billing. Carbotrace unifies these domains into a standardized carbon auditing pipeline:

- **Layer 1: Code-Level Carbon** — AST static analysis via `tree-sitter` for Python, JavaScript, and TypeScript to flag algorithmic antipatterns, dependency package footprint, and test suite execution overhead.
- **Layer 2: CI/CD Pipeline Carbon** — GitHub Actions workflow parsing to compute runner wattage, execution duration, cache utilization, and redundant pull request builds.
- **Layer 3: Infrastructure Carbon** — Infrastructure-as-Code (Terraform, CloudFormation) scanning correlated with regional grid emission factors (Electricity Maps / regional coefficients) and data center Power Usage Effectiveness (PUE).

---

## Architecture

```mermaid
flowchart LR
    Client[Web UI / GitHub Action] --> API[FastAPI Backend]
    API --> AST[AST Engine · tree-sitter]
    API --> CI[CI/CD Workflow Parser]
    API --> Infra[IaC & Grid Telemetry]
    API --> DB[(TimescaleDB / PostgreSQL)]
    API --> Ollama[Local Ollama · qwen2.5-coder]
```

---

## Features

- **Automated Repository Audit** — Analyze any public GitHub repository via URL to produce a comprehensive sustainability scorecard.
- **Local AI Remediation** — Generates actionable optimization patches using local Ollama models (`qwen2.5-coder:1.3b`) with zero proprietary code transmission.
- **Pull Request Merge Gate** — GitHub Action integration posts carbon delta diffs on pull requests and blocks merges exceeding defined emission thresholds.
- **Global Grid Telemetry** — Interactive map tracking regional data center carbon intensity and renewable energy distribution.
- **Package Metadata Cache** — Persistent cache for PyPI, npm, Maven, and RubyGems dependency weight metrics.

---

## Quick Start

### Option 1: Docker Compose (Recommended)

Run the backend and database services together:

```bash
docker-compose up --build
```

- API Server: `http://localhost:8001`
- API Documentation: `http://localhost:8001/docs`

---

### Option 2: Local Development Setup

#### 1. Database

Start a TimescaleDB / PostgreSQL container:

```bash
docker run -d --name carbotrace-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=carbotrace \
  timescale/timescaledb:latest-pg16
```

#### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The web dashboard runs at `http://localhost:5173`.

#### 4. Local LLM (Optional)

For local AI recommendations, install [Ollama](https://ollama.com/) and load the coding model:

```bash
ollama pull qwen2.5-coder:3b
ollama serve
```

---

## Configuration

Copy `.env.example` to `.env` in the project root:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/carbotrace` | Async database connection string |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama service endpoint |
| `OLLAMA_MODEL` | `qwen2.5-coder:1.5b` | LLM model identifier |
| `GITHUB_TOKEN` | *(Optional)* | Personal access token for higher GitHub API rate limits |
| `ELECTRICITY_MAPS_API_KEY` | *(Optional)* | API key for live grid carbon intensity |
| `AWS_ACCESS_KEY_ID` | *(Optional)* | AWS credentials for Cost Explorer integration |
| `AWS_SECRET_ACCESS_KEY` | *(Optional)* | AWS secret access key |
| `AWS_DEFAULT_REGION` | `us-east-1` | Default AWS region |

---

## REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-repo` | Clones and executes a three-layer carbon audit on a repository |
| `GET` | `/api/repos` | Returns paginated list of scanned repositories |
| `GET` | `/api/analyses/{id}` | Retrieves detailed layer metrics and LLM recommendations |
| `GET` | `/api/health` | Health check verifying database connectivity |

---

## CI/CD Integration

Add the Carbotrace audit step to `.github/workflows/carbotrace.yml`:

```yaml
name: Carbotrace Carbon Audit
on:
  pull_request:
    branches: [ main, master ]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Carbon Audit
        uses: dchitale/carbotrace/action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          carbotrace-url: 'https://your-carbotrace-instance/api'
          threshold: '0.1'
```

---

## Testing

Execute the backend test suite:

```bash
cd backend
python -m pytest tests/ -v --cov=app
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
