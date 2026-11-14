@echo off
title Quick2B - AI GST Reconciliation Suite
echo ========================================================
echo   Quick2B - AI & Automated GSTR-2B Reconciliation Portal
echo   Auditor / Owner: CA Kanhaiya Soni (omizala9471@gmail.com)
echo ========================================================
echo.
echo Starting Quick2B Web Application on http://localhost:8000 ...
echo.

cd /d "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

pause
