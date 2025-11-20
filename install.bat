@echo off
echo Installing Kannada Learning App...
echo.

cd backend
echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Installation complete!
    echo ========================================
    echo.
    echo To start the backend server:
    echo   cd backend
    echo   npm start
    echo.
    echo Then open frontend/index.html in your browser
    echo ========================================
    pause
) else (
    echo.
    echo Installation failed. Please check the errors above.
    pause
)
