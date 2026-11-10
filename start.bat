@echo off
title CareerPilot AI Server
cd /d "%~dp0backend"
echo ===================================================
echo   Starting CareerPilot AI at http://localhost:8000/
echo ===================================================
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
)
pause
