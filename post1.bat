@echo off
cd /d "%~dp0.."
if exist "git-push.bat" (
    call "git-push.bat"
) else if exist "push.bat" (
    call "push.bat"
) else (
    echo ========================================
    echo   ERROR: Script not found
    echo ========================================
    echo.
    echo Please create git-push.bat or push.bat
    echo in the parent directory first.
    echo.
    pause
)
