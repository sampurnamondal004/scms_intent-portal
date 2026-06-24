@echo off
title SCMS + Notification System Launcher
color 0A

echo =================================================
echo   SCMS Intent Portal + Notification System
echo =================================================
echo.

REM ─── CONFIG: Set your actual paths here ───────────────────────────────────
set SCMS_ROOT=C:\Users\PANKAJ KUMAR MONDAL\OneDrive\Desktop\scms_intent_portal\scms_intent-portal
set NOTIF_ROOT=C:\Users\PANKAJ KUMAR MONDAL\Documents\fastapi-postgresql-notification-system
REM ──────────────────────────────────────────────────────────────────────────

REM ── 1. SCMS Frontend (React + Vite → http://localhost:5173) ───────────────
echo [1/3] Starting SCMS Frontend on http://localhost:5173 ...
start "SCMS Frontend" cmd /k "cd /d "%SCMS_ROOT%\frontend" && npm run dev"
timeout /t 3 /nobreak >nul

REM ── 2. SCMS Backend (FastAPI → http://localhost:8000) ─────────────────────
echo [2/3] Starting SCMS Backend on http://localhost:8000 ...
start "SCMS Backend" cmd /k "cd /d "%SCMS_ROOT%" && call backend\venv\Scripts\activate && set PYTHONPATH=. && uvicorn backend.main:app --reload --port 8000"
timeout /t 5 /nobreak >nul

REM ── 3. Notification Server (FastAPI → http://localhost:8001) ──────────────
echo [3/3] Starting Notification Server on http://localhost:8001 ...
start "Notification Server" cmd /k "cd /d "%NOTIF_ROOT%\backend" && call venv\Scripts\activate && uvicorn main:app --reload --port 8001"

echo.
echo =================================================
echo   All services launched in separate windows!
echo.
echo   SCMS Frontend   →  http://localhost:5173
echo   SCMS Backend    →  http://localhost:8000/docs
echo   Notifications   →  http://localhost:8001
echo =================================================
echo.
pause