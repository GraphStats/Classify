import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
    openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectEditorPath: () => ipcRenderer.invoke('select-editor-path'),
    detectApps: () => ipcRenderer.invoke('detect-apps'),
});
