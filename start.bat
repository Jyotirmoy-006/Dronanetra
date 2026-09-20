@echo off
cd /d "%~dp0"
echo Starting MALE UAV Digital Twin Platform...

if exist backend\.venv\Scripts\python.exe (
    backend\.venv\Scripts\python.exe run.py
) else if exist .venv\Scripts\python.exe (
    .venv\Scripts\python.exe run.py
) else (
    python run.py
)
pause
