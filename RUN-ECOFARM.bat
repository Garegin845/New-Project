@echo off
setlocal
cd /d "%~dp0"
title EcoFarm Connect
if not exist node_modules (
  echo Installing required packages...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
  )
)
echo.
echo EcoFarm Connect is starting at http://localhost:3000
start "" "http://localhost:3000"
npm run dev
pause
