@echo off
cd /d "%~dp0"
echo ==========================================
echo      CLASSIFY - GENERATEUR WINUI 3
echo ==========================================
echo.
echo Installation des dependances npm...
call npm install
echo.
echo Construction du projet web...
call npm run build:winui
echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] La construction a echoue.
    pause
    exit /b %ERRORLEVEL%
)
echo ==========================================
echo SUCCES !
echo Votre application WinUI se trouve dans "winui/bin/publish".
echo ==========================================
pause
