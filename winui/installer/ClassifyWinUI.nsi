; NSIS installer for Classify WinUI (unpackaged deployment)
; Requires: place WindowsAppRuntime installer next to this script as windowsappruntimeinstall-x64.exe
; Build with: makensis ClassifyWinUI.nsi

!include "MUI2.nsh"

Name "Classify"
OutFile "ClassifyWinUI-Setup.exe"
InstallDir "$PROGRAMFILES\\Classify"
InstallDirRegKey HKLM "Software\\Classify" "InstallDir"
RequestExecutionLevel admin

!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Application" SEC_APP
  SetOutPath "$INSTDIR"
  File /r "..\\..\\out\\winui\\*.*"
  CreateShortcut "$DESKTOP\\Classify.lnk" "$INSTDIR\\Classify.WinUI.exe"
  CreateShortcut "$SMPROGRAMS\\Classify\\Classify.lnk" "$INSTDIR\\Classify.WinUI.exe"
  WriteRegStr HKLM "Software\\Classify" "InstallDir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
SectionEnd

Section "Windows App SDK runtime" SEC_RUNTIME
  SetOutPath "$INSTDIR"
  File "windowsappruntimeinstall-x64.exe"
  ExecWait '"$INSTDIR\\windowsappruntimeinstall-x64.exe" /quiet /norestart'
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\\Classify.lnk"
  Delete "$SMPROGRAMS\\Classify\\Classify.lnk"
  Delete "$INSTDIR\\Uninstall.exe"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKLM "Software\\Classify"
SectionEnd
