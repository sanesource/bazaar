@echo off
echo 🏛️ Starting Bazaar...

:: Check if node_modules exists
if not exist "node_modules\" (
    echo ❌ Dependencies not installed. Please run setup.bat first.
    pause
    exit /b 1
)

call npm start
pause
