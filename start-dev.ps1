# Retail Inventory Management System Launcher (PowerShell)
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  Retail Inventory Management System (Agile Capstone P_022)" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "Starting Backend API Server on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm start"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Dev Server on Port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

Write-Host "Services started!" -ForegroundColor Green
Write-Host "Backend API:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan
