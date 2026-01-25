export { };

declare global {
    interface Window {
        electron: {
            getSettings: () => Promise<any>;
            saveSettings: (settings: any) => Promise<boolean>;
            openFile: (path: string) => Promise<any>;
            selectFile: () => Promise<string | null>;
            selectEditorPath: () => Promise<string | null>;
            detectApps: () => Promise<{ name: string; path: string }[]>;
            checkForUpdates: () => Promise<import('./types').UpdateStatus>;
            installUpdate: () => Promise<boolean>;
            onUpdateStatus: (callback: (status: import('./types').UpdateStatus) => void) => () => void;
            openExternal: (url: string) => Promise<boolean>;
            getFilePath: (file: File) => string;
        };
    }
}
