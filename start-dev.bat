@echo off
cd /d "%~dp0"
echo ===================================================================
echo   Retail Inventory Management System (Agile Capstone P_022)
echo ===================================================================
echo Starting Backend API Server (Port 5000)...
start "Retail Backend API" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server (Port 3000)...
start "Retail Frontend UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ===================================================================
echo   Both servers initiated successfully!
echo   Backend API:  http://localhost:5000/api/health
echo   Frontend App: http://localhost:3000
echo ===================================================================
