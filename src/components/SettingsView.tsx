import { useState, useEffect } from 'react';
import type { Settings, UpdateStatus } from '../types';
import { Save, Sparkles, Layout, Monitor, RefreshCcw, Download } from 'lucide-react';
import { CustomDialog } from './CustomDialog';

interface SettingsViewProps {
    settings: Settings;
    onSave: (settings: Settings) => void;
    updateStatus?: UpdateStatus | null;
    onCheckUpdates?: () => Promise<any> | void;
    onInstallUpdate?: () => Promise<any> | void;
}

const SUPPORTED_EXTS = ['.docx', '.doc', '.md', '.txt', '.odt', '.pdf'];

export function SettingsView({ settings, onSave, updateStatus, onCheckUpdates, onInstallUpdate }: SettingsViewProps) {
    const [editors, setEditors] = useState<Record<string, string>>(settings.editors || {});
    const [detectedApps, setDetectedApps] = useState<{ name: string; path: string }[]>([]);
    const [scanning, setScanning] = useState(false);
    const [autoUpdatesEnabled, setAutoUpdatesEnabled] = useState(settings.autoUpdatesEnabled ?? true);
    const [checkingUpdates, setCheckingUpdates] = useState(false);
    const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'success' | 'danger';
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        handleDetectApps();
    }, []);

    useEffect(() => {
        setAutoUpdatesEnabled(settings.autoUpdatesEnabled ?? true);
    }, [settings.autoUpdatesEnabled]);

    const handleDetectApps = async () => {
        if (window.electron) {
            setScanning(true);
            try {
                const apps = await window.electron.detectApps();
                setDetectedApps(apps);
            } finally {
                setScanning(false);
            }
        }
    };

    const handleSelectPath = async (ext: string) => {
        if (window.electron) {
            const path = await window.electron.selectEditorPath();
            if (path) {
                setEditors(prev => ({ ...prev, [ext]: path }));
            }
        }
    };

    const setEditor = (ext: string, path: string) => {
        setEditors(prev => ({ ...prev, [ext]: path }));
    };

    const getUpdateSummary = () => {
        if (!updateStatus) return 'Aucune verification recente.';
        switch (updateStatus.status) {
            case 'checking':
                return 'Verification en cours...';
            case 'available':
                return `Nouvelle version: ${updateStatus.latestVersion || ''}`.trim();
            case 'not-available':
                return `Version actuelle: ${updateStatus.currentVersion || ''}`.trim();
            case 'downloading':
                return `Telechargement: ${updateStatus.percent ?? 0}%`;
            case 'downloaded':
                return `Mise a jour prete: ${updateStatus.latestVersion || ''}`.trim();
            case 'error':
                return updateStatus.message || 'Erreur de mise a jour.';
            default:
                return `Version actuelle: ${updateStatus.currentVersion || ''}`.trim();
        }
    };

    const handleSave = () => {
        onSave({ ...settings, editors, autoUpdatesEnabled });
        setDialog({
            isOpen: true,
            type: 'success',
            title: 'Sauvegardé !',
            message: 'Vos préférences ont été enregistrées avec succès.',
            onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
        });
    };

    useEffect(() => {
        if (!updateStatus) return;
        if (updateStatus.status === 'not-available' || updateStatus.status === 'available' || updateStatus.status === 'downloaded' || updateStatus.status === 'error') {
            setLastCheckedAt(new Date().toISOString());
        }
        if (updateStatus.status === 'error' && updateStatus.message) {
            setDialog({
                isOpen: true,
                type: 'alert',
                title: 'Verification impossible',
                message: updateStatus.message,
                onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
            });
        }
    }, [updateStatus]);

    useEffect(() => {
        setCheckingUpdates(updateStatus?.status === 'checking' || updateStatus?.status === 'downloading');
    }, [updateStatus?.status]);

    const handleCheckUpdates = async () => {
        if (!onCheckUpdates) return;
        setCheckingUpdates(true);
        try {
            await onCheckUpdates();
        } finally {
            setCheckingUpdates(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto bg-transparent p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-black text-gray-800 dark:text-white uppercase tracking-tight">Paramètres</h1>
                        <p className="text-gray-500 dark:text-gray-500 font-medium mt-1">Personnalisez votre expérience de travail.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-10 py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 dark:shadow-none flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                        <Save size={18} />
                        Enregistrer
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Main Editors Config */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                                    <Download size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Mises a jour</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Suivi des versions</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">Mises a jour auto</h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1">Telecharge automatiquement les updates au demarrage.</p>
                                    </div>
                                    <button
                                        onClick={() => setAutoUpdatesEnabled(prev => !prev)}
                                        className={`relative w-16 h-9 rounded-full transition-all border ${autoUpdatesEnabled ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-200 dark:bg-slate-700 border-gray-200 dark:border-slate-600'}`}
                                        aria-pressed={autoUpdatesEnabled}
                                    >
                                        <span
                                            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform ${autoUpdatesEnabled ? 'translate-x-8' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-400 font-medium">
                                            {getUpdateSummary()}
                                        </p>
                                        {lastCheckedAt && (
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                Derniere verification: {new Date(lastCheckedAt).toLocaleString('fr-FR')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {updateStatus?.status === 'downloaded' && onInstallUpdate && (
                                            <button
                                                onClick={() => onInstallUpdate()}
                                                className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                            >
                                                Installer maintenant
                                            </button>
                                        )}
                                        <button
                                            onClick={handleCheckUpdates}
                                            disabled={checkingUpdates}
                                            className="px-6 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <RefreshCcw size={16} className={checkingUpdates ? 'animate-spin' : ''} />
                                            Verifier maintenant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                                    <Monitor size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Vos Éditeurs</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Liaison de fichiers</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {SUPPORTED_EXTS.map(ext => (
                                    <div key={ext} className="space-y-3">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="font-black text-purple-600 dark:text-purple-400 font-mono text-sm tracking-widest">{ext}</span>
                                            <button
                                                onClick={() => handleSelectPath(ext)}
                                                className="text-[10px] text-gray-400 hover:text-purple-500 font-black uppercase tracking-widest transition-colors"
                                            >
                                                Modifier
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-all focus-within:border-purple-300 dark:focus-within:border-purple-900/50">
                                            <input
                                                type="text"
                                                value={editors[ext] || ''}
                                                readOnly
                                                placeholder="OS Default"
                                                className="flex-1 bg-transparent text-gray-600 dark:text-gray-400 text-xs focus:outline-none font-bold italic truncate"
                                            />
                                            {editors[ext] && (
                                                <button onClick={() => setEditor(ext, '')} className="text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                                                    <Layout size={14} className="opacity-0 w-0" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">RESET</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Detected Apps Sidebar */}
                    <div className="lg:col-span-1 h-full">
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-full sticky top-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-2xl flex items-center justify-center">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Détectées</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Apps sur PC</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-8 leading-relaxed">Associez rapidement vos logiciels installés à Classify.</p>

                            {scanning ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-20 bg-gray-50 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                    {detectedApps.map((app, idx) => (
                                        <div key={idx} className="group p-4 bg-gray-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-2xl border border-transparent hover:border-purple-100 dark:hover:border-purple-900/50 transition-all">
                                            <h4 className="text-sm font-black text-gray-700 dark:text-gray-300 truncate mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors uppercase tracking-tight">{app.name}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {['.md', '.docx', '.odt', '.pdf'].map(ext => (
                                                    <button
                                                        key={ext}
                                                        onClick={() => setEditor(ext, app.path)}
                                                        className="text-[9px] px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all text-gray-400 dark:text-gray-500 font-bold tracking-widest"
                                                    >
                                                        {ext}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {detectedApps.length === 0 && (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 italic text-gray-400 text-sm">
                                            Aucune application détectée.
                                            <button onClick={handleDetectApps} className="block w-full text-purple-600 dark:text-purple-400 font-black uppercase text-[10px] tracking-widest mt-4 hover:underline">RESCANNER</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <CustomDialog
                {...dialog}
                onCancel={() => setDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
