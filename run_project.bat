
@echo off
title AccessMed Connect - Launcher

echo ==============================================
echo Starting AccessMed Connect (Backend + UI)
echo ==============================================

REM Start Backend on port 8000
echo Launching FastAPI backend...
start cmd /k "cd backend && uvicorn main:app --reload --port 8000"

REM Give backend a few seconds to start
timeout /t 3 > nul

REM Open frontend in VS Code
echo Opening frontend in VS Code...
start code "%cd%\frontend\index.html"

echo ----------------------------------------------
echo Now in VS Code click "Go Live".
echo Live Server will open Chrome at http://127.0.0.1:5500 automatically.
echo Backend (8000) is already running.
echo ----------------------------------------------
pause
