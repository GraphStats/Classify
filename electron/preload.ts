import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
    openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectEditorPath: () => ipcRenderer.invoke('select-editor-path'),
    detectApps: () => ipcRenderer.invoke('detect-apps'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    getFilePath: (file: File) => {
        // @ts-ignore - webUtils exists in Electron 20+
        const { webUtils } = require('electron');
        return webUtils.getPathForFile(file);
    },
});
