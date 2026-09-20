@echo off
echo =========================================================================
echo              MediQR Enterprise Healthcare Archive and Ledger
echo =========================================================================
echo.
echo [1/3] Starting Multi-Hospital Storage Nodes (Hospital A :5001, Hospital B :5002)...
start "MediQR Hospital Nodes (Ports 5001 and 5002)" cmd /k "cd /d "%~dp0\hospital-nodes" && npm start"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Doctor Verification Portal (Next.js :3000)...
start "MediQR Doctor Portal (Port 3000)" cmd /k "cd /d "%~dp0\doctor-portal" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo =========================================================================
echo  MediQR Services Launched Successfully!
echo  - Doctor and Triage Portal: http://localhost:3000
echo  - Government Installer:     http://localhost:3000/installer
echo  - Doctor Portal:            http://localhost:3000/doctor
echo  - Hospital Admin Hub:       http://localhost:3000/hospital
echo  - Tamper Lab:               http://localhost:3000/simulator
echo  - Emergency Triage View:    http://localhost:3000/emergency
echo  - Hospital Node A API:      http://localhost:5001/health
echo  - Hospital Node B API:      http://localhost:5002/health
echo =========================================================================
echo.
pause
