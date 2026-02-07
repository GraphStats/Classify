@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
echo ==========================================
echo      CLASSIFY - GENERATEUR WINUI 3
echo ==========================================
echo.

set PUBLISH_DIR=winui\bin\publish
set INSTALLER_SCRIPT=winui\installer\ClassifyWinUI.nsi

echo [1/3] Nettoyage...
if exist "winui\bin" rd /s /q "winui\bin"
if exist "winui\obj" rd /s /q "winui\obj"
echo.

echo [2/3] Publication du projet WinUI (.NET 8)...
dotnet publish winui/Classify.WinUI.csproj -c Release -r win-x64 --self-contained true -p:PublishReadyToRun=true -p:PublishSingleFile=false -o %PUBLISH_DIR%
echo.

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] La publication .NET a echoue. Verifiez les erreurs ci-dessus.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Creation de l'installateur (NSIS)...

:: Recherche de makensis
set NSIS_EXE=""
if exist "C:\Program Files (x86)\NSIS\makensis.exe" set NSIS_EXE="C:\Program Files (x86)\NSIS\makensis.exe"
if exist "C:\Program Files\NSIS\makensis.exe" set NSIS_EXE="C:\Program Files\NSIS\makensis.exe"

if %NSIS_EXE% == "" (
    where makensis >nul 2>nul
    if !ERRORLEVEL! == 0 (
        set NSIS_EXE=makensis
    ) else (
        echo [INFO] NSIS n'est pas installe ou n'est pas dans le PATH.
        echo [INFO] L'application executable se trouve dans : %PUBLISH_DIR%
        echo [INFO] Pour generer l'installateur, installez NSIS (https://nsis.sourceforge.io/)
        echo ==========================================
        pause
        exit /b 0
    )
)

echo Utilisation de : %NSIS_EXE%
%NSIS_EXE% %INSTALLER_SCRIPT%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] La creation de l'installateur a echoue.
    pause
    exit /b %ERRORLEVEL%
)

echo ==========================================
echo SUCCES !
if exist "winui\Classify-WinUI-Setup.exe" (
    echo Votre installeur se trouve ici : winui\Classify-WinUI-Setup.exe
) else (
    echo Verifiez le dossier winui pour l'installeur.
)
echo ==========================================
pause
