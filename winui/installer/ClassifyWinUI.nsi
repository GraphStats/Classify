; NSIS installer for Classify WinUI (Self-Contained Unpackaged)
!include "MUI2.nsh"

Name "Classify"
OutFile "..\\Classify-WinUI-Setup.exe"
InstallDir "$LOCALAPPDATA\\ClassifyApp"
InstallDirRegKey HKCU "Software\\Classify" "InstallDir"
RequestExecutionLevel user ; Install in LocalAppData doesn't need admin

!define MUI_ABORTWARNING
; !define MUI_ICON "..\\public\\icon.ico" ; A decommenter si vous avez un fichier .ico

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "French"

Section "Application" SEC_APP
  SetOutPath "$INSTDIR"
  ; Les fichiers sont dans winui/bin/publish (relatif a ce script)
  File /r "..\\bin\\publish\\*.*"
  
  ; Raccourcis
  CreateDirectory "$SMPROGRAMS\\Classify"
  CreateShortcut "$DESKTOP\\Classify.lnk" "$INSTDIR\\Classify.WinUI.exe"
  CreateShortcut "$SMPROGRAMS\\Classify\\Classify.lnk" "$INSTDIR\\Classify.WinUI.exe"
  
  WriteRegStr HKCU "Software\\Classify" "InstallDir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\\Classify.lnk"
  Delete "$SMPROGRAMS\\Classify\\Classify.lnk"
  RMDir /r "$SMPROGRAMS\\Classify"
  
  Delete "$INSTDIR\\Uninstall.exe"
  RMDir /r "$INSTDIR"
  
  DeleteRegKey HKCU "Software\\Classify"
SectionEnd
