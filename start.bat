@echo off
echo ==========================================
echo   Green Products - E-Commerce Platform
echo ==========================================
echo.
echo Starting Backend API server...
start cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak > nul

echo Starting Frontend dev server...
start cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ==========================================
echo   SERVERS STARTED:
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ==========================================
echo.
echo NOTE: Using MongoDB Atlas (cloud) - no local DB needed.
echo Run seed: cd backend ^&^& node seed.js
echo.
pause
