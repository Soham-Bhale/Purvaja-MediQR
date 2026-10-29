# How to Run Carbotrace — Step-by-Step Guide

This document provides complete instructions on how to set up, run, test, and troubleshoot **Carbotrace** on your local machine.

---

## Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Method 1: One-Click Docker Compose (Easiest)](#method-1-one-click-docker-compose-easiest)
3. [Method 2: Manual Local Development Setup](#method-2-manual-local-development-setup)
   - [Step 1: Start PostgreSQL / TimescaleDB](#step-1-start-postgresql--timescaledb)
   - [Step 2: Start Backend (FastAPI)](#step-2-start-backend-fastapi)
   - [Step 3: Start Frontend (React + Vite)](#step-3-start-frontend-react--vite)
   - [Step 4: Start Local LLM (Optional)](#step-4-start-local-llm-optional)
4. [Verifying Everything Works](#-verifying-everything-works)
5. [Environment Variables Reference](#-environment-variables-reference)
6. [Troubleshooting & Common Issues](#-troubleshooting--common-issues)

---

## Prerequisites

Before getting started, make sure you have the following installed on your system:

- **Docker Desktop** (for containerized setup or PostgreSQL database container)
- **Python 3.11+** (for FastAPI backend)
- **Node.js 18+ & npm** (for React frontend)
- **Git** (for repository cloning and AST analysis)
- *(Optional)* **Ollama** (for privacy-first local AI recommendations)

---

## Method 1: One-Click Docker Compose (Easiest)

If you have Docker Desktop installed, you can spin up the entire database and backend with a single command:

```bash
# Clone or open project folder
cd d:\Projects\Carbotrace

# Start database and backend containers
docker-compose up --build
```

### What this does:
1. Starts **TimescaleDB (PostgreSQL 16)** container on port `5432`.
2. Builds and starts **FastAPI Backend** container on port `8000`.
3. Runs database health checks automatically.

---

## Method 2: Manual Local Development Setup

Follow these steps if you want to run the services individually for development and hot-reloading.

---

### Step 1: Start PostgreSQL / TimescaleDB

Carbotrace requires PostgreSQL (with TimescaleDB extension for time-series metrics). Run a container using Docker:

```bash
docker run -d `
  --name carbotrace-db `
  -p 5432:5432 `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=carbotrace `
  timescale/timescaledb:latest-pg16
```

> **Tip:** If port 5432 is already used by a local PostgreSQL installation, stop your local PostgreSQL service or change the port mapping (e.g. `-p 5433:5432`).

---

### Step 2: Start Backend (FastAPI)

> **Windows One-Click Shortcut:**
> Double-click **`run_backend.bat`** (or in PowerShell type `.\run_backend.bat` / `.\run_backend.ps1`) for backend only. It automatically detects your virtual environment, frees port `8001`, verifies Docker database status, and launches Uvicorn.
> Or double-click **`run_all.bat`** (or in PowerShell type `.\run_all.bat` / `.\run_all.ps1`) to automatically free ports 8001 & 5173, start TimescaleDB container, and boot both FastAPI and Vite services together!

Alternatively, start manually step-by-step:

1. Open a PowerShell terminal and navigate to the project root:
   ```bash
   cd d:\Projects\Carbotrace
   ```

2. Activate the Python virtual environment:
   ```powershell
   # If using backend\.venv:
   .\backend\.venv\Scripts\activate

   # Or if created at project root .venv:
   .\.venv\Scripts\activate
   ```
   *(If creating fresh: `python -m venv backend\.venv` followed by `pip install -r requirements.txt`)*

3. Set the `PYTHONPATH` environment variable:
   > **Important:** Required so Python can resolve the `backend.app` module namespace cleanly.
   ```powershell
   $env:PYTHONPATH="d:\Projects\Carbotrace"
   ```

4. Verify Port 8001 is free (Port 8000 is often reserved by Windows `svchost`):
   ```powershell
   Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue
   ```

5. Run the FastAPI development server:
   > **Important:** Always include `--reload-dir backend/app` when using `--reload`. This prevents Uvicorn's file watcher from triggering unwanted server reloads when git repositories are cloned to `backend/temp_repos/` during analysis.
   ```powershell
   backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --reload-dir backend/app --host 0.0.0.0 --port 8001
   ```

   - **Backend API URL:** `http://localhost:8001/api`
   - **Interactive API Docs (Swagger):** `http://localhost:8001/docs`
   - **Health Check:** `http://localhost:8001/api/health`

---

### Step 3: Start Frontend (React + Vite)

1. Open a **new terminal** and navigate to the `frontend` directory:
   ```bash
   cd d:\Projects\Carbotrace\frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### Step 4: Start Local LLM (Optional)

Carbotrace uses a local LLM via **Ollama** for privacy-first GreenOps recommendations. If Ollama is not running, Carbotrace will automatically fall back to its intelligent rule-based scoring engine!

To enable AI recommendations locally:

1. Download and install [Ollama](https://ollama.com/).
2. Pull the lightweight coding model:
   ```bash
   ollama pull qwen2.5-coder:1.5b
   ```
3. Start the Ollama service:
   ```bash
   ollama serve
   ```

---

## Verifying Everything Works

### 1. Check Backend Health
Open `http://localhost:8001/api/health` in your browser. You should see:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test an Analysis via UI
1. Open `http://localhost:5173`.
2. Paste any public GitHub repository URL, for example:
   `https://github.com/facebook/react`
3. Click **Scan Repo**.
4. Watch the real-time scanning progress and view your **Carbon Severity Score (0-10)**, 3-layer carbon breakdown (Code, CI/CD, Infrastructure), risk indicators, and AI recommendations.

### 3. Run Automated Tests
You can run the full test suite anytime:
```powershell
cd d:\Projects\Carbotrace\backend
$env:PYTHONPATH="d:\Projects\Carbotrace"
.\.venv\Scripts\python.exe -m pytest tests/ -v
```

---

## How to Check PR Carbon Results

Carbotrace provides three ways to check Pull Request (PR) carbon audit results:

### Method 1: Automated GitHub PR Comment (Recommended)

When you add the Carbotrace GitHub Action to your repository (`.github/workflows/carbotrace.yml`), it automatically analyzes both the **base branch (e.g. `main`)** and **head branch (your PR)** on every push, posting a comparison comment directly on your PR:

```markdown
## Carbotrace Carbon Audit Diff

> **WARNING:** This PR increases carbon severity score by **+0.26 points**, exceeding threshold of **0.1**!

| Layer | Base (main) | Head (feature-branch) | Delta |
|-------|-------------|-----------------------|-------|
| **Total Carbon Score** | **3.42 / 10.0** | **3.68 / 10.0** | **▲ +0.26** |
| **Code Layer** | 125.3 g | 130.1 g | ▲ +4.8 g |
| **CI/CD Layer** | 67.2 g | 67.2 g | ≈ 0 g |
| **Infra Layer** | 0.0 g | 0.0 g | ≈ 0 g |

### Recommendations
1. **Detected 2 nested loops** (Est. Savings: **-15%**, Priority: **HIGH**)
   - Refactor nested loops in `services/search.py` to reduce CPU operations.
```

#### How to enable this in any repo:
Add `.github/workflows/carbotrace.yml` to your repository:
```yaml
name: Carbotrace Carbon Audit
on:
  pull_request:
    branches: [ main ]

jobs:
  carbon-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Audit PR Carbon Delta
        uses: dchitale/carbotrace/action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          carbotrace-url: 'http://your-carbotrace-server:8000/api'
          threshold: '0.1'
```

---

### Method 2: Check Branch Results via API (`curl`)

You can test PR branch scoring directly against the FastAPI server by sending the `branch` parameter in the payload:

```bash
# 1. Analyze Base Branch (main)
curl -X POST "http://localhost:8001/api/analyze-repo" \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react", "branch": "main"}'

# 2. Analyze PR Branch (feature-branch)
curl -X POST "http://localhost:8001/api/analyze-repo" \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react", "branch": "v18.0.0"}'
```

---

### Method 3: Check History in Dashboard UI

1. Open **`http://localhost:5173`**.
2. Click **History** in the top navigation bar.
3. Select any previously scanned repository to view past analysis runs, master severity scores, risk indicators, and GreenOps AI recommendations.

---

## Environment Variables Reference

A default `.env` file is provided in the project root. Key options:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/carbotrace` | Database connection string |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama AI server URL |
| `OLLAMA_MODEL` | `qwen2.5-coder:1.5b` | Model used for recommendations |
| `ELECTRICITY_MAPS_API_KEY` | *(Optional)* | Real-time carbon grid intensity API key |
| `AWS_ACCESS_KEY_ID` | *(Optional)* | AWS credentials for Cost Explorer live scan |
| `AWS_SECRET_ACCESS_KEY` | *(Optional)* | AWS credentials for Cost Explorer live scan |

---

## Troubleshooting & Common Issues

### Issue 1: `ModuleNotFoundError: No module named 'backend'`
- **Fix:** Make sure to set `PYTHONPATH` before running `uvicorn` or `pytest`:
  ```powershell
  $env:PYTHONPATH="d:\Projects\Carbotrace"
  ```

### Issue 2: Backend cannot connect to Database (`OperationalError`)
- **Fix:** Verify PostgreSQL Docker container is running:
  ```bash
  docker ps
  ```
  If not running, start it using `docker start carbotrace-db`.

### Issue 3: GitHub Clone Fails / Permission Denied
- **Fix:** Ensure the repository URL is **public**. Private repositories require setting `GITHUB_TOKEN` in `.env`.

### Issue 4: Frontend shows "Failed to connect to backend server"
- **Fix:** Verify FastAPI backend is running on `http://localhost:8001`.
  The frontend dev server uses Vite's proxy configured in `frontend/vite.config.js`:
  ```javascript
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  }
  ```
  If you run the backend on a custom port, update the `target` URL in `frontend/vite.config.js`.

### Issue 5: Port 8000 Conflict (`[Errno 10048] error while attempting to bind on address`)
On Windows, port `8000` is frequently reserved or occupied by Windows system services (such as `svchost.exe` hosting BranchCache, WinRM, or IIS). This is why Carbotrace defaults to **port 8001**.
- **Diagnose which process is using a port in PowerShell:**
  ```powershell
  # Check if port 8000 or 8001 is listening:
  Get-NetTCPConnection -LocalPort 8000, 8001 -State Listen -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess, State

  # Identify the process name by PID:
  Get-Process -Id <PID>
  ```
- **Fix:**
  - Run on port `8001` using `run_backend.bat 8001` (recommended, matches frontend proxy).
  - Or terminate a conflicting process: `Stop-Process -Id <PID> -Force`.

### Issue 6: Backend Unexpectedly Reloads Mid-Scan During Repo Cloning
When repository scanning starts, `git clone` writes temporary files into `backend/temp_repos/`. If Uvicorn watches the entire repository directory, it detects these file additions and restarts the server mid-scan, terminating the analysis!
- **Fix:** Restrict the reload watcher exclusively to the application code directory:
  ```powershell
  uvicorn backend.app.main:app --reload --reload-dir backend/app --port 8001
  ```
  *(This is preconfigured inside `run_backend.bat`)*