import { useState } from 'react';
import type { Subject } from '../types';
import { Plus, Settings as SettingsIcon, Trash2, LayoutDashboard, Sun, Moon, Calendar as CalendarIcon } from 'lucide-react';
import EmojiPicker, { Emoji, EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

interface SidebarProps {
    subjects: Subject[];
    activeSubjectId: string | null;
    isSettingsActive: boolean;
    isCalendarActive: boolean;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onSelectSubject: (id: string) => void;
    onAddSubject: (name: string, emoji: string) => void;
    onDeleteSubject: (id: string) => void;
    onOpenSettings: () => void;
    onOpenCalendar: () => void;
    onGoHome: () => void;
}

export function Sidebar({
    subjects, activeSubjectId, isSettingsActive, isCalendarActive, isDarkMode,
    onToggleTheme, onSelectSubject, onAddSubject, onDeleteSubject,
    onOpenSettings, onOpenCalendar, onGoHome
}: SidebarProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectEmoji, setNewSubjectEmoji] = useState('1f4da');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubjectName.trim()) {
            onAddSubject(newSubjectName, newSubjectEmoji);
            setNewSubjectName('');
            setNewSubjectEmoji('1f4da');
            setIsAdding(false);
        }
    };

    return (
        <div className="w-80 bg-white dark:bg-slate-900 h-full border-r border-gray-100 dark:border-slate-800 flex flex-col shadow-sm transition-colors duration-300">
            {/* Logo Section */}
            <div className="p-6 title-bar-drag flex items-center justify-between">
                <button
                    onClick={onGoHome}
                    className="text-3xl font-display font-black text-gray-800 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity no-drag"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Classify</span>
                </button>
                <button
                    onClick={onToggleTheme}
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 no-drag transition-colors bg-gray-50 dark:bg-slate-800 rounded-xl"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-6 py-2 custom-scrollbar">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <button
                        onClick={onGoHome}
                        className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${activeSubjectId === null && !isSettingsActive && !isCalendarActive
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 dark:shadow-none'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        <LayoutDashboard size={22} />
                        <span className="font-bold">Dashboard</span>
                    </button>

                    <button
                        onClick={onOpenCalendar}
                        className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${isCalendarActive
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 dark:shadow-none'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        <CalendarIcon size={22} />
                        <span className="font-bold">Calendrier</span>
                    </button>
                </div>

                {/* Subjects Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Mes Matières
                        </label>
                        <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold">
                            {subjects.length}
                        </span>
                    </div>

                    <div className="space-y-1">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="group relative">
                                <button
                                    onClick={() => onSelectSubject(subject.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-200 ${activeSubjectId === subject.id
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-100 dark:border-purple-900/50'
                                        : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 border border-transparent'
                                        }`}
                                >
                                    <div className="flex-shrink-0 flex items-center justify-center">
                                        <Emoji unified={subject.emoji} size={20} emojiStyle={EmojiStyle.APPLE} />
                                    </div>
                                    <span className="font-bold truncate flex-1 text-sm uppercase tracking-tight">{subject.name}</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject.id); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                                    title="Supprimer"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {isAdding ? (
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 animate-fade-in mt-4">
                            <div className="flex items-center gap-2 mb-3 relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-purple-300 transition-all shadow-sm"
                                >
                                    <Emoji unified={newSubjectEmoji} size={22} emojiStyle={EmojiStyle.APPLE} />
                                </button>
                                {showEmojiPicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700">
                                            <EmojiPicker
                                                onEmojiClick={(data: EmojiClickData) => {
                                                    setNewSubjectEmoji(data.unified);
                                                    setShowEmojiPicker(false);
                                                }}
                                                theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                                                emojiStyle={EmojiStyle.APPLE}
                                                width={350}
                                                height={400}
                                            />
                                        </div>
                                    </>
                                )}
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Nom..."
                                    className="flex-1 min-w-0 h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-purple-400 text-sm"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdd(e);
                                        if (e.key === 'Escape') setIsAdding(false);
                                    }}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 px-2 py-1 uppercase">Annuler</button>
                                <button onClick={handleAdd} className="text-[10px] font-bold bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 uppercase">Créer</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full mt-2 text-left px-3 py-3 rounded-xl flex items-center gap-3 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all border-2 border-dashed border-gray-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900/50"
                        >
                            <Plus size={18} />
                            <span className="font-bold text-sm">Ajouter une matière</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 space-y-1 border-t border-gray-50 dark:border-slate-800">
                <button
                    onClick={onOpenSettings}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isSettingsActive
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-100 dark:border-purple-900/50'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                >
                    <SettingsIcon size={20} className={`group-hover:rotate-45 transition-transform duration-500 ${isSettingsActive ? 'rotate-45' : ''}`} />
                    <span className="font-bold text-sm">Paramètres</span>
                </button>
            </div>
        </div>
    );
}
