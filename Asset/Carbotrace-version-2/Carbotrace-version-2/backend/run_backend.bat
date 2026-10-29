@echo off
:: Delegate to project root run_backend.bat
cd /d "%~dp0\.."
call run_backend.bat %*
