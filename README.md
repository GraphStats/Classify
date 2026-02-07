# Classify – WinUI 3

Classify est désormais une application **WinUI 3** (Windows App SDK). Cette page explique uniquement comment la construire et produire les installateurs MSIX et NSIS.

## Prérequis
- Windows 10 20H1 (build 19041) ou plus récent.
- .NET SDK 8.0 (ou 9.0 si vous l’avez, le workflow l’installe aussi).
- Windows App SDK runtime (sera installé automatiquement par le setup NSIS ; optionnel si vous exécutez le MSIX).
- Outils :
  - `dotnet` (dans le SDK)
  - `nsis` (si vous voulez générer l’installeur .exe). Sous Windows : `choco install nsis -y`.

## Build MSIX (local)
```powershell
dotnet restore winui/Classify.WinUI.sln
dotnet publish winui/Classify.WinUI.csproj -c Release -p:Platform=x64 -p:GenerateAppxPackageOnBuild=true -p:AppxBundle=Never -o out/winui
```
Résultats : `out/winui/Classify.WinUI.exe` et le package MSIX dans `out/winui`.

## Générer l’installeur NSIS (exe)
1) Télécharger le runtime Windows App SDK x64 et le placer dans `winui/installer/` :
```powershell
Invoke-WebRequest "https://aka.ms/windowsappsdk/1.6/1.6.250602001/windowsappruntimeinstall-x64.exe" -OutFile winui/installer/windowsappruntimeinstall-x64.exe
```
2) Construire l’installeur :
```powershell
"C:\Program Files (x86)\NSIS\makensis.exe" winui/installer/ClassifyWinUI.nsi
```
Résultat : `winui/installer/ClassifyWinUI-Setup.exe` (installe le runtime puis l’app).

## Utilisation rapide
- Avec runtime déjà présent : lancez `out/winui/Classify.WinUI.exe`.
- Sinon : lancez `ClassifyWinUI-Setup.exe` (installe runtime + application, crée les raccourcis).

## CI/CD (GitHub Actions)
- Workflow : `.github/workflows/release.yml`
  - `build-winui` (Windows) : build MSIX, génère l’installateur NSIS, uploade les artefacts.
  - `release` (Ubuntu) : assemble le zip, attache le zip + l’exe NSIS à la release taggée `vX.Y.Z` (version issue de `package.json`).

## Nettoyer / régénérer
```powershell
rimraf out
dotnet publish winui/Classify.WinUI.csproj -c Release -p:Platform=x64 -p:GenerateAppxPackageOnBuild=true -p:AppxBundle=Never -o out/winui
```

## Licence
© 2026 Drayko. Usage interne.
