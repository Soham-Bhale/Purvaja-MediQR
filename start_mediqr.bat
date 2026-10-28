@echo off
echo =========================================================================
echo              MediQR Paid Healthcare System with Blockchain Integration
echo                  3-Device Academic Demonstration Suite
echo =========================================================================
echo.

echo [0/3] Checking and freeing ports 3000, 5001, and 5002...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000, 5001, 5002 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul

timeout /t 1 /nobreak >nul

echo [1/3] Starting Multi-Hospital Storage Nodes (Hospital A :5001, Hospital B :5002)...
start "MediQR Hospital Nodes (Ports 5001 and 5002)" cmd /k "cd /d "%~dp0\hospital-nodes" && npm start"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Healthcare Web Portal (Next.js :3000 bound to 0.0.0.0)...
start "MediQR Web Portal (Port 3000)" cmd /k "cd /d "%~dp0\doctor-portal" && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening MediQR Portal in default browser...
start http://localhost:3000

echo.
echo =========================================================================
echo  MediQR Services Launched Successfully!
echo  - Laptop 1 (Patient Portal):   http://localhost:3000
echo  - Laptop 2 (Doctor EMR):       http://localhost:3000/doctor
echo  - Laptop 2 (Blockchain Live):  http://localhost:3000/blockchain
echo  - Device 3 (Mobile Triage):    http://localhost:3000/emergency
echo  - ESP32 Network Setup:         http://localhost:3000/esp32-setup
echo  - Hospital Node A Storage:     http://localhost:5001/health
echo  - Hospital Node B Storage:     http://localhost:5002/health
echo =========================================================================
echo.
pause
