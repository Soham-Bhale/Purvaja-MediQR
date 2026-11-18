@echo off
setlocal
echo =========================================================================
echo                    MediQR Clean The Slate Protocol
echo               Complete Dummy Data Purge & Presentation Ready Reset
echo =========================================================================
echo.

echo [1/3] Executing File System and Storage Vault Purge...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\clean_slate.ps1"
echo.

echo [2/3] Starting Storage Nodes & Web Console...
start "MediQR Hospital Nodes (5001 & 5002)" cmd /k "cd /d "%~dp0hospital-nodes" && npm start"
ping 127.0.0.1 -n 3 >nul

start "MediQR Web Portal (Port 3000)" cmd /k "cd /d "%~dp0doctor-portal" && npm run dev"
ping 127.0.0.1 -n 5 >nul

echo [3/3] Opening Presentation Ready Windows in Browser...
echo   1. Executing Client-Side Clean Slate Protocol...
start http://localhost:3000/clean-slate

ping 127.0.0.1 -n 3 >nul
echo   2. Main Sovereign Website:    http://localhost:3000
start http://localhost:3000

ping 127.0.0.1 -n 2 >nul
echo   3. Patient Booking Terminal:  http://localhost:3000/book
start http://localhost:3000/book

ping 127.0.0.1 -n 2 >nul
echo   4. Doctor EMR Workstation:    http://localhost:3000/doctor
start http://localhost:3000/doctor

ping 127.0.0.1 -n 2 >nul
echo   5. Dispatched Outbox Monitor: http://localhost:3000/emails
start http://localhost:3000/emails

echo.
echo =========================================================================
echo              ✨ Clean The Slate Protocol Complete!
echo.
echo  All dummy data has been erased. The system is 100%% ready for presentation!
echo  - Audit & Reset:      http://localhost:3000/clean-slate
echo  - Sovereign Website:  http://localhost:3000
echo  - Patient Booking:    http://localhost:3000/book
echo  - Doctor Workstation: http://localhost:3000/doctor
echo  - Live Email Outbox:  http://localhost:3000/emails
echo =========================================================================
echo.
pause
