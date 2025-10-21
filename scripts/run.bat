@echo off
REM Quick launch script for Bazaar (Windows)

cd /d "%~dp0"

python -c "import yfinance" 2>nul
if errorlevel 1 (
    echo Dependencies not installed. Running setup...
    call setup.bat
    echo.
)

echo Launching Bazaar...
python main.py

