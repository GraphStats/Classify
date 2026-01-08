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

ipcMain.handle('open-file', (_, filePath) => {
    const settings = loadSettings();
    const ext = path.extname(filePath).toLowerCase();
    const editorPath = settings.editors && settings.editors[ext];

    if (editorPath) {
        if (editorPath.startsWith('shell:')) {
            // It's a Windows Store/Start Menu app shortcut
            console.log(`Opening ${filePath} with shell app ${editorPath}`);
            spawn('cmd.exe', ['/c', 'start', '""', editorPath, filePath], { detached: true, stdio: 'ignore' }).unref();
            return { success: true, message: 'Opened with shell app' };
        } else if (fs.existsSync(editorPath)) {
            // Open with specific executable path
            console.log(`Opening ${filePath} with ${editorPath}`);
            spawn(editorPath, [filePath], { detached: true, stdio: 'ignore' }).unref();
            return { success: true, message: 'Opened with configured editor' };
        }
    }

    // Open with system default
    console.log(`Opening ${filePath} with system default`);
    shell.openPath(filePath).then(err => {
        if (err) console.error(err);
    });
    return { success: true, message: 'Opened with system default' };
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
