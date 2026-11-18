@echo off
echo =========================================================================
echo                    MediQR Clean The Slate Protocol
echo               Complete Dummy Data Purge & Presentation Ready Reset
echo =========================================================================
echo.

echo [1/5] Freeing ports 3000, 5001, and 5002 (Stopping active background tasks)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000, 5001, 5002 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul
ping 127.0.0.1 -n 2 >nul

echo [2/5] Resetting Hospital Storage Vaults to pristine state...
powershell -NoProfile -ExecutionPolicy Bypass -Command "
  $hospA = Join-Path '%~dp0' 'hospital-nodes\storage\hospital-a';
  $hospB = Join-Path '%~dp0' 'hospital-nodes\storage\hospital-b';
  
  if (Test-Path (Join-Path $hospA 'REC-APOLLO-001.backup.json')) {
    Copy-Item -Path (Join-Path $hospA 'REC-APOLLO-001.backup.json') -Destination (Join-Path $hospA 'REC-APOLLO-001.enc.json') -Force;
    Write-Output '  [+] Apollo Node A (:5001) storage restored to pristine backup';
  }
  
  if (Test-Path (Join-Path $hospB 'REC-FORTIS-002.backup.json')) {
    Copy-Item -Path (Join-Path $hospB 'REC-FORTIS-002.backup.json') -Destination (Join-Path $hospB 'REC-FORTIS-002.enc.json') -Force;
    Write-Output '  [+] Fortis Node B (:5002) storage restored to pristine backup';
  }

  Get-ChildItem -Path $hospA -File | Where-Object { $_.Name -notlike 'REC-APOLLO-001.*' } | Remove-Item -Force;
  Get-ChildItem -Path $hospB -File | Where-Object { $_.Name -notlike 'REC-FORTIS-002.*' } | Remove-Item -Force;
  Write-Output '  [+] Purged all dummy test records and corrupted dumps.';
"

echo [3/5] Cleaning Next.js temporary build cache...
if exist "%~dp0\doctor-portal\.next\cache" (
  rmdir /s /q "%~dp0\doctor-portal\.next\cache" 2>nul
  echo   [+] Cleared Next.js build cache.
)

echo [4/5] Starting Multi-Hospital Storage Nodes & Next.js Healthcare Portal...
start "MediQR Hospital Nodes (Ports 5001 and 5002)" cmd /k "cd /d "%~dp0\hospital-nodes" && npm start"
ping 127.0.0.1 -n 4 >nul

start "MediQR Web Portal (Port 3000)" cmd /k "cd /d "%~dp0\doctor-portal" && npm run dev"
ping 127.0.0.1 -n 5 >nul

echo [5/5] Executing Clean Slate Client-Side Reset in Browser...
echo   Applying complete localStorage wipe and re-seeding single Genesis Block...
start http://localhost:3000/clean-slate

ping 127.0.0.1 -n 3 >nul

echo.
echo Launching 4 Presentation Demonstration Windows...
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
echo              ✨ Clean The Slate Protocol Complete!
echo.
echo  All dummy data has been erased. The system is 100%% ready for presentation!
echo  - Presentation Audit:   http://localhost:3000/clean-slate
echo  - Window 1 (Home):      http://localhost:3000
echo  - Window 2 (Booking):   http://localhost:3000/book
echo  - Window 3 (Doctor):    http://localhost:3000/doctor
echo  - Window 4 (Outbox):    http://localhost:3000/emails
echo =========================================================================
echo.
pause
