import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// Helper to load settings
type AppSettings = {
    editors: Record<string, string>;
    theme?: 'light' | 'dark' | 'auto';
    userName?: string;
    autoUpdatesEnabled?: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
    editors: {},
    autoUpdatesEnabled: true
};

function loadSettings(): AppSettings {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            const parsed = JSON.parse(data) as Partial<AppSettings>;
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                editors: parsed?.editors || {}
            };
        }
    } catch (e) {
        console.error('Failed to load settings', e);
    }
    return { ...DEFAULT_SETTINGS }; // { ".md": "C:\\...", ".docx": "..." }
}

function saveSettings(settings: AppSettings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        return true;
    } catch (e) {
        console.error('Failed to save settings', e);
        return false;
    }
}

let mainWindow: BrowserWindow | null = null;

type UpdateStatus = {
    status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
    currentVersion?: string;
    latestVersion?: string;
    percent?: number;
    bytesPerSecond?: number;
    transferred?: number;
    total?: number;
    message?: string;
};

const getCurrentVersion = () => app.getVersion();

const sendUpdateStatus = (status: UpdateStatus) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-status', status);
    }
};

const initAutoUpdater = () => {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        sendUpdateStatus({ status: 'checking', currentVersion: getCurrentVersion() });
    });
    autoUpdater.on('update-available', (info) => {
        sendUpdateStatus({
            status: 'available',
            currentVersion: getCurrentVersion(),
            latestVersion: info?.version
        });
    });
    autoUpdater.on('update-not-available', (info) => {
        sendUpdateStatus({
            status: 'not-available',
            currentVersion: getCurrentVersion(),
            latestVersion: info?.version
        });
    });
    autoUpdater.on('download-progress', (progress) => {
        sendUpdateStatus({
            status: 'downloading',
            currentVersion: getCurrentVersion(),
            percent: Math.round(progress.percent),
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total
        });
    });
    autoUpdater.on('update-downloaded', (info) => {
        sendUpdateStatus({
            status: 'downloaded',
            currentVersion: getCurrentVersion(),
            latestVersion: info?.version
        });
    });
    autoUpdater.on('error', (error) => {
        sendUpdateStatus({
            status: 'error',
            currentVersion: getCurrentVersion(),
            message: error?.message || 'Erreur inconnue.'
        });
    });
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        // Adding a friendly icon + style
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#ffffff',
            symbolColor: '#000000',
            height: 30
        }
    });

    // Use app.isPackaged to detect production vs development
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();
    initAutoUpdater();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('get-settings', () => {
    return loadSettings();
});

ipcMain.handle('save-settings', (_, settings: AppSettings) => {
    return saveSettings(settings);
});

ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
        const status = {
            status: 'error',
            currentVersion: getCurrentVersion(),
            message: 'Les mises a jour auto sont disponibles uniquement sur la version installee.'
        } as UpdateStatus;
        sendUpdateStatus(status);
        return status;
    }

    try {
        await autoUpdater.checkForUpdates();
        const status = {
            status: 'checking',
            currentVersion: getCurrentVersion()
        } as UpdateStatus;
        return status;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const status = {
            status: 'error',
            currentVersion: getCurrentVersion(),
            message: message || 'Impossible de verifier les mises a jour.'
        } as UpdateStatus;
        sendUpdateStatus(status);
        return status;
    }
});

ipcMain.handle('install-update', async () => {
    if (!app.isPackaged) return false;
    try {
        autoUpdater.quitAndInstall();
        return true;
    } catch (error: unknown) {
        console.error('Failed to install update', error);
        return false;
    }
});

ipcMain.handle('open-external', async (_, url: string) => {
    if (!url || typeof url !== 'string') return false;
    if (!/^https?:\/\//i.test(url)) return false;
    try {
        await shell.openExternal(url);
        return true;
    } catch (error: unknown) {
        console.error('Failed to open external url', error);
        return false;
    }
});

ipcMain.handle('open-file', async (_, filePath) => {
    console.log(`[IPC] Request to open file: ${filePath}`);

    if (!filePath || !fs.existsSync(filePath)) {
        console.error(`[IPC] File does not exist: "${filePath}"`);
        return {
            success: false,
            error: `Le fichier n'est pas accessible (${filePath || 'chemin vide'}). S'il vient d'un dossier protégé ou d'un ZIP, essayez de le copier sur votre bureau avant.`
        };
    }

    const settings = loadSettings();
    const ext = path.extname(filePath).toLowerCase();
    const editorPath = settings.editors && settings.editors[ext];

    if (editorPath) {
        try {
            if (editorPath.startsWith('shell:')) {
                // Windows Store/Shell app
                console.log(`[IPC] Opening with shell app: ${editorPath}`);
                spawn('cmd.exe', ['/c', 'start', '""', editorPath, filePath], {
                    detached: true,
                    stdio: 'ignore',
                    shell: true
                }).unref();
                return { success: true };
            } else if (fs.existsSync(editorPath)) {
                // Specific executable
                console.log(`[IPC] Opening with custom editor: ${editorPath}`);

                // Normal spawn handles spaces in paths if shell: true is NOT used, 
                // OR if it IS used but we don't manually quote.
                const child = spawn(editorPath, [filePath], {
                    detached: true,
                    stdio: 'ignore',
                    shell: false
                });

                child.on('error', (err) => {
                    console.error(`[IPC] Spawn error: ${err.message}`);
                });

                child.unref();
                return { success: true };
            } else {
                console.warn(`[IPC] Custom editor path not found: ${editorPath}. Falling back to system default.`);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[IPC] Failed to open with custom editor: ${message}`);
        }
    }

    // Open with system default
    console.log(`[IPC] Opening with system default: ${filePath}`);
    try {
        const error = await shell.openPath(filePath);
        if (error) {
            console.error(`[IPC] shell.openPath error: ${error}`);
            // Fallback: try openExternal with file protocol
            const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
            await shell.openExternal(fileUrl);
        }
        return { success: true };
    } catch (error: unknown) {
        console.error(`[IPC] Failed to open file: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error: 'Impossible d\'ouvrir le fichier avec l\'application par défaut.' };
    }
});

// Native file dialog to pick file
ipcMain.handle('select-file', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    });
    return result.filePaths[0] || null;
});

// Native file dialog to pick executable (for settings)
ipcMain.handle('select-editor-path', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Executables', extensions: ['exe', 'app', 'sh', 'bat', 'cmd'] }]
    });
    return result.filePaths[0] || null;
});

ipcMain.handle('detect-apps', async () => {
    const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
    const commonPaths = [
        'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
        'C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
        'C:\\Program Files\\Notepad++\\notepad++.exe',
        'C:\\Program Files (x86)\\Notepad++\\notepad++.exe',
        'C:\\Program Files\\LibreOffice\\program\\swriter.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\swriter.exe',
        path.join(localAppData, 'Obsidian\\Obsidian.exe'),
        path.join(localAppData, 'Programs\\Obsidian\\Obsidian.exe'),
        path.join(localAppData, 'Programs\\obsidian\\Obsidian.exe'),
        'C:\\Program Files\\Microsoft VS Code\\Code.exe',
        path.join(localAppData, 'Programs\\Microsoft VS Code\\Code.exe'),
        'C:\\Windows\\notepad.exe'
    ];

    const detected: { name: string; path: string }[] = [];
    for (const p of commonPaths) {
        if (fs.existsSync(p)) {
            detected.push({
                name: path.basename(p, '.exe').replace('WINWORD', 'Word').replace('swriter', 'LibreOffice Writer'),
                path: p
            });
        }
    }

    // Also try to get apps from Start Menu and try to resolve their paths
    try {
        const psOutput = await new Promise<string>((resolve) => {
            const ps = spawn('powershell.exe', ['-Command', 'Get-StartApps | ConvertTo-Json']);
            let data = '';
            ps.stdout.on('data', (d) => data += d);
            ps.on('close', () => resolve(data));
        });
        type StartApp = { Name?: string; AppID?: string };
        const parsed = JSON.parse(psOutput) as StartApp | StartApp[];
        const apps = Array.isArray(parsed) ? parsed : [parsed];
        const filtered = apps.filter((a) =>
            typeof a?.Name === 'string' && a.Name.match(/word|notepad|obsidian|code|office|writer|text|edit/i)
        );

        for (const a of filtered) {
            // Check if we already have this app by name
            if (a.Name && !detected.find(d => d.name.toLowerCase() === a.Name!.toLowerCase())) {
                detected.push({ name: a.Name, path: 'shell:AppsFolder\\' + (a.AppID || '') });
            }
        }
    } catch (e) {
        console.error('Error detecting apps', e);
    }

    return detected;
});

