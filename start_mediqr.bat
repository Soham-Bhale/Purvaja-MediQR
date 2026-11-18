@echo off
echo =========================================================================
echo              MediQR Paid Healthcare System with Blockchain Integration
echo                  Multi-Window Demonstration Suite
echo =========================================================================
echo.

echo [0/4] Checking and freeing ports 3000, 5001, and 5002...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000, 5001, 5002 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul

ping 127.0.0.1 -n 2 >nul

echo [1/4] Starting Multi-Hospital Storage Nodes (Hospital A :5001, Hospital B :5002)...
start "MediQR Hospital Nodes (Ports 5001 and 5002)" cmd /k "cd /d "%~dp0\hospital-nodes" && npm start"

ping 127.0.0.1 -n 4 >nul

echo [2/4] Starting Healthcare Web Portal (Next.js :3000 bound to 0.0.0.0)...
start "MediQR Web Portal (Port 3000)" cmd /k "cd /d "%~dp0\doctor-portal" && npm run dev"

ping 127.0.0.1 -n 5 >nul

echo [3/4] Opening 4 Dedicated Demonstration Windows / Tabs in Browser...
echo   1. Main Patient Portal:       http://localhost:3000
start http://localhost:3000

ping 127.0.0.1 -n 2 >nul
echo   2. Applicant Booking Portal:  http://localhost:3000/book
start http://localhost:3000/book

ping 127.0.0.1 -n 2 >nul
echo   3. Doctor EMR Workstation:    http://localhost:3000/doctor
start http://localhost:3000/doctor

ping 127.0.0.1 -n 2 >nul
echo   4. Live Dispatched Outbox:    http://localhost:3000/emails
start http://localhost:3000/emails

echo.
echo =========================================================================
echo  [4/4] MediQR Demonstration Suite Launched Successfully!
echo.
echo  - Window 1 (Main Landing Page):     http://localhost:3000
echo  - Window 2 (Applicant Booking):     http://localhost:3000/book
echo  - Window 3 (Doctor EMR Terminal):   http://localhost:3000/doctor
echo  - Window 4 (Live Email Outbox):     http://localhost:3000/emails
echo.
echo  Additional Diagnostic Terminals:
echo  - Blockchain Consortium Explorer:   http://localhost:3000/blockchain
echo  - Roadside Emergency Mobile Triage: http://localhost:3000/emergency
echo  - Hospital Node A Storage API:      http://localhost:5001/health
echo  - Hospital Node B Storage API:      http://localhost:5002/health
echo =========================================================================
echo.
pause
