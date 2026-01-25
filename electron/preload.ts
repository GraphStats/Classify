import { contextBridge, ipcRenderer, webUtils, type IpcRendererEvent } from 'electron';

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

type AppSettings = {
    editors: Record<string, string>;
    theme?: 'light' | 'dark' | 'auto';
    userName?: string;
    autoUpdatesEnabled?: boolean;
};

contextBridge.exposeInMainWorld('electron', {
    getSettings: () => ipcRenderer.invoke('get-settings') as Promise<AppSettings>,
    saveSettings: (settings: AppSettings) => ipcRenderer.invoke('save-settings', settings) as Promise<boolean>,
    openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectEditorPath: () => ipcRenderer.invoke('select-editor-path'),
    detectApps: () => ipcRenderer.invoke('detect-apps'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates') as Promise<UpdateStatus>,
    installUpdate: () => ipcRenderer.invoke('install-update') as Promise<boolean>,
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
        const listener = (_event: IpcRendererEvent, status: UpdateStatus) => callback(status);
        ipcRenderer.on('update-status', listener);
        return () => ipcRenderer.removeListener('update-status', listener);
    },
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    getFilePath: (file: File) => {
        return webUtils.getPathForFile(file);
    },
});
