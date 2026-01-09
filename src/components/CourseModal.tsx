import { useState } from 'react';
import { X, Upload, File as FileIcon } from 'lucide-react';

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string, filePath: string) => void;
}

export function CourseModal({ isOpen, onClose, onSave }: CourseModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [filePath, setFilePath] = useState('');

    if (!isOpen) return null;

    const handleFileSelect = async () => {
        if (window.electron) {
            const path = await window.electron.selectFile();
            if (path) {
                setFilePath(path);
                if (!name) {
                    const fileName = path.split('\\').pop()?.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
                    setName(fileName);
                }
            }
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e: any) => {
                if (e.target.files?.length) {
                    const file = e.target.files[0];
                    setFilePath(file.name);
                    if (!name) {
                        setName(file.name.split('.').slice(0, -1).join('.') || file.name);
                    }
                }
            };
            input.click();
        }
    };

    const handleSave = () => {
        if (name && filePath) {
            onSave(name, description, filePath);
            onClose();
            setName('');
            setDescription('');
            setFilePath('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-[550px] shadow-2xl p-8 relative animate-scale-up border border-gray-100 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-8 uppercase tracking-tight">Nouveau Cours</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.2em] ml-1">Nom du cours</label>
                        <input
                            type="text"
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-bold placeholder:text-gray-200 dark:placeholder:text-slate-700"
                            placeholder="Ex: Chapitre 1 - Algèbre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all h-28 resize-none font-medium placeholder:text-gray-200 dark:placeholder:text-slate-700"
                            placeholder="Ex: Résumé des points clés..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.2em] ml-1">Fichier lié</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 dark:text-gray-500 text-sm truncate flex items-center gap-3 font-bold">
                                <FileIcon size={20} />
                                {filePath || "Aucun fichier sélectionné"}
                            </div>
                            <button
                                onClick={handleFileSelect}
                                className="px-6 py-4 bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-2xl hover:scale-105 active:scale-95 transition-all font-black flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-xl shadow-gray-200 dark:shadow-none whitespace-nowrap"
                            >
                                <Upload size={18} />
                                Parcourir
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-gray-400 font-black hover:text-gray-600 transition-colors uppercase tracking-widest text-[10px]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name || !filePath}
                        className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-purple-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest mb-2 sm:mb-0"
                    >
                        Créer le cours
                    </button>
                </div>
            </div>
        </div>
    );
}
