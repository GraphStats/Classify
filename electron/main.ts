import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// Helper to load settings
function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to load settings', e);
    }
    return { editors: {} }; // { ".md": "C:\\...", ".docx": "..." }
}

function saveSettings(settings: any) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        return true;
    } catch (e) {
        console.error('Failed to save settings', e);
        return false;
    }
}

let mainWindow: BrowserWindow | null = null;

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

ipcMain.handle('save-settings', (_, settings) => {
    return saveSettings(settings);
});

ipcMain.handle('open-file', async (_, filePath) => {
    console.log(`[IPC] Request to open file: ${filePath}`);

    if (!filePath || !fs.existsSync(filePath)) {
        console.error(`[IPC] File does not exist: ${filePath}`);
        return { success: false, error: 'Le fichier n\'existe pas ou a été déplacé.' };
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
        } catch (e: any) {
            console.error(`[IPC] Failed to open with custom editor: ${e.message}`);
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
    } catch (e: any) {
        console.error(`[IPC] Failed to open file: ${e.message}`);
        return { success: false, error: 'Impossible d\'ouvrir le fichier avec l\'application par défaut.' };
    }
});

// Native file dialog to pick file
const { dialog } = require('electron');
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

    const detected = [];
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
        const apps = JSON.parse(psOutput);
        const filtered = apps.filter((a: any) =>
            a.Name.match(/word|notepad|obsidian|code|office|writer|text|edit/i)
        );

        for (const a of filtered) {
            // Check if we already have this app by name
            if (!detected.find(d => d.name.toLowerCase() === a.Name.toLowerCase())) {
                detected.push({ name: a.Name, path: 'shell:AppsFolder\\' + a.AppID });
            }
        }
    } catch (e) {
        console.error('Error detecting apps', e);
    }

    return detected;
});
