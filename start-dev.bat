@echo off
echo ===================================================================
echo   Retail Inventory Management System (Agile Capstone P_022)
echo ===================================================================
echo Starting Backend API Server (Port 5000)...
start "Retail Backend API" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server (Port 3000)...
start "Retail Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers initiated!
echo Backend:  http://localhost:5000/api/health
echo Frontend: http://localhost:3000
echo ===================================================================
