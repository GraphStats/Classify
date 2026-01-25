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
            checkForUpdates: () => Promise<import('./types').UpdateCheckResult>;
            openExternal: (url: string) => Promise<boolean>;
            getFilePath: (file: File) => string;
        };
    }
}
