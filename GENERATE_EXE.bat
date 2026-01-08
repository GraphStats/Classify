@echo off
cd /d "%~dp0"
echo ==========================================
echo      CLASSIFY - GENERATEUR D'INSTALLATEUR
echo ==========================================
echo.
echo Installation des dependances...
call npm install
echo.
echo Construction de l'application et de l'installateur...
call npm run build
echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] La construction a echoue. Verifiez les messages ci-dessus.
    echo ==========================================
    pause
    exit /b %ERRORLEVEL%
)
echo ==========================================
echo SUCCES !
echo Votre installateur .exe se trouve dans le dossier "dist-exe".
echo Vous pouvez maintenant installer Classify !
echo ==========================================
pause
