@echo off
REM Setup script for Bazaar Stock Market Dashboard (Windows)

echo ==========================================
echo    Bazaar - Indian Stock Market Dashboard
echo    Setup Script for Windows
echo ==========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

echo Found Python:
python --version
echo.

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo Error: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Setup complete!
echo.
echo To run the application, execute:
echo     python main.py
echo ==========================================
pause

