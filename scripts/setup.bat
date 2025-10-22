@echo off
echo 🏛️ Bazaar - Setup Script
echo ========================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node -v

:: Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo ✅ npm detected
npm -v
echo.

echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Setup complete!
    echo.
    echo To start the application:
    echo   npm start
    echo.
    echo To build executables:
    echo   npm run build
) else (
    echo.
    echo ❌ Installation failed. Please check the errors above.
    pause
    exit /b 1
)

pause
