@echo off
:: Purvaja MediQR - Start Script

echo =========================================
echo   Starting Purvaja MediQR Project
echo =========================================

:: Navigate to project folder
cd /d %~dp0

:: Install dependencies if missing
echo Installing dependencies...
npm install

:: Start server with nodemon for auto-reload
echo Starting server...
npx nodemon server.js

pause
