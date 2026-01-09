import { useState, useEffect } from 'react';
import type { Subject, Course, Folder } from '../types';
import { CourseCard } from './CourseCard';
import { CourseModal } from './CourseModal';
import EmojiPicker, { Emoji, EmojiStyle } from 'emoji-picker-react';
import {
    Plus, FolderPlus, Folder as FolderIcon, Trash2, Edit3,
    ChevronDown, StickyNote, X, Palette
} from 'lucide-react';
import { CustomDialog } from './CustomDialog';

interface SubjectViewProps {
    subject: Subject;
    onUpdateSubject: (updatedSubject: Subject) => void;
    onDeleteCourse: (subjectId: string, courseId: string, folderId?: string) => void;
}

const COLORS = [
    { name: 'Purple', value: '#9333ea' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Cyan', value: '#0891b2' }
];

export function SubjectView({ subject, onUpdateSubject, onDeleteCourse }: SubjectViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [localNotes, setLocalNotes] = useState(subject.notes || '');

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
        setLocalNotes(subject.notes || '');
    }, [subject.id]);

    const handleSaveNotes = () => {
        onUpdateSubject({ ...subject, notes: localNotes });
    };

    const handleAddCourse = (name: string, description: string, filePath: string) => {
        const newCourse: Course = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name,
            description,
            filePath,
            createdAt: Date.now()
        };

        const updatedSubject = { ...subject };
        if (activeFolderId) {
            updatedSubject.folders = (subject.folders || []).map(f =>
                f.id === activeFolderId ? { ...f, courses: [...(f.courses || []), newCourse] } : f
            );
        } else {
            updatedSubject.courses = [...(subject.courses || []), newCourse];
        }

        onUpdateSubject(updatedSubject);
        setIsModalOpen(false);
        setActiveFolderId(null);
    };

    const handleToggleStar = (courseId: string, folderId: string | null) => {
        const updatedSubject = { ...subject };
        if (folderId) {
            updatedSubject.folders = (subject.folders || []).map(f =>
                f.id === folderId ? {
                    ...f,
                    courses: (f.courses || []).map(c =>
                        c.id === courseId ? { ...c, isStarred: !c.isStarred } : c
                    )
                } : f
            );
        } else {
            updatedSubject.courses = (subject.courses || []).map(c =>
                c.id === courseId ? { ...c, isStarred: !c.isStarred } : c
            );
        }
        onUpdateSubject(updatedSubject);
    };

    const handleConfirmAddFolder = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (newFolderName.trim()) {
            const newFolder: Folder = {
                id: Date.now().toString(),
                name: newFolderName,
                courses: [],
                createdAt: Date.now()
            };
            onUpdateSubject({
                ...subject,
                folders: [...(subject.folders || []), newFolder]
            });
            setNewFolderName('');
            setIsCreatingFolder(false);
            setExpandedFolders(prev => ({ ...prev, [newFolder.id]: true }));
        }
    };

    const handleDeleteFolder = (folderId: string) => {
        setDialog({
            isOpen: true,
            type: 'danger',
            title: 'Supprimer le dossier ?',
            message: 'Tous les cours à l\'intérieur resteront dans la matière mais ne seront plus classés.',
            onConfirm: () => {
                onUpdateSubject({
                    ...subject,
                    folders: (subject.folders || []).filter(f => f.id !== folderId)
                });
                setDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const toggleFolder = (id: string) => {
        setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenCourse = async (path: string) => {
        if (window.electron) {
            const result = await window.electron.openFile(path);
            if (result && !result.success) {
                setDialog({
                    isOpen: true,
                    type: 'alert',
                    title: 'Erreur d\'ouverture',
                    message: result.error || 'Impossible d\'ouvrir le fichier.',
                    onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
                });
            }
        }
    };

    const handleUpdateEmoji = (emojiUnified: string) => {
        onUpdateSubject({ ...subject, emoji: emojiUnified });
        setShowEmojiPicker(false);
    };

    const handleUpdateColor = (color: string) => {
        onUpdateSubject({ ...subject, color });
        setShowColorPicker(false);
    };

    const handleRenameSubject = () => {
        const newName = prompt('Nouveau nom pour la matière :', subject.name);
        if (newName) {
            onUpdateSubject({ ...subject, name: newName });
        }
    };

    const handleMoveCourse = (courseId: string, sourceFolderId: string, targetFolderId: string | null) => {
        const updatedSubject = { ...subject };
        let courseToMove: Course | null = null;

        // 1. Extraire le cours de sa source
        if (sourceFolderId) {
            const sourceFolder = (subject.folders || []).find(f => f.id === sourceFolderId);
            if (sourceFolder) {
                courseToMove = sourceFolder.courses.find(c => c.id === courseId) || null;
                updatedSubject.folders = (updatedSubject.folders || []).map(f =>
                    f.id === sourceFolderId ? { ...f, courses: f.courses.filter(c => c.id !== courseId) } : f
                );
            }
        } else {
            courseToMove = (subject.courses || []).find(c => c.id === courseId) || null;
            updatedSubject.courses = (updatedSubject.courses || []).filter(c => c.id !== courseId);
        }

        if (!courseToMove) return;

        // 2. Insérer le cours dans sa cible
        if (targetFolderId) {
            updatedSubject.folders = (updatedSubject.folders || []).map(f =>
                f.id === targetFolderId ? { ...f, courses: [...f.courses, courseToMove!] } : f
            );
            setExpandedFolders(prev => ({ ...prev, [targetFolderId]: true }));
        } else {
            updatedSubject.courses = [...(updatedSubject.courses || []), courseToMove];
        }

        onUpdateSubject(updatedSubject);
    };

    const handleDropOnFolder = (e: React.DragEvent, folderId: string | null) => {
        e.preventDefault();
        const courseId = e.dataTransfer.getData('courseId');
        const sourceFolderId = e.dataTransfer.getData('sourceFolderId');

        if (courseId && sourceFolderId !== (folderId || '')) {
            handleMoveCourse(courseId, sourceFolderId, folderId);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const totalCourses = (subject.courses?.length || 0) + (subject.folders || []).reduce((acc, f) => acc + f.courses.length, 0);
    const currentColor = subject.color || '#9333ea';

    return (
        <div className={`flex h-full bg-transparent transition-all duration-300`}>
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="group">
                            <div className="mb-4 relative w-fit">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="hover:scale-110 transition-transform bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-xl dark:shadow-none border border-gray-100 dark:border-slate-700"
                                >
                                    <Emoji unified={subject.emoji} size={64} emojiStyle={EmojiStyle.APPLE} />
                                </button>
                                {showEmojiPicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-2xl rounded-3xl overflow-hidden">
                                            <EmojiPicker onEmojiClick={(data) => handleUpdateEmoji(data.unified)} emojiStyle={EmojiStyle.APPLE} />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-display font-black text-gray-800 dark:text-white tracking-tight leading-none uppercase">{subject.name}</h1>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={handleRenameSubject} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all">
                                        <Edit3 size={18} />
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all"
                                        >
                                            <Palette size={18} />
                                        </button>
                                        {showColorPicker && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
                                                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 grid grid-cols-4 gap-2 w-48 animate-scale-up">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c.value}
                                                            onClick={() => handleUpdateColor(c.value)}
                                                            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-600 shadow-sm hover:scale-110 transition-transform"
                                                            style={{ backgroundColor: c.value }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 dark:text-gray-500 mt-3 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: currentColor }}></span>
                                {totalCourses} cours au total
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className={`px-5 py-3 rounded-2xl font-black transition-all border flex items-center gap-2 uppercase text-xs tracking-widest ${showNotes ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <StickyNote size={18} />
                                {showNotes ? 'Fermer Notes' : 'Notes'}
                            </button>
                            <button
                                onClick={() => setIsCreatingFolder(true)}
                                className="px-5 py-3 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all border border-gray-100 dark:border-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest"
                            >
                                <FolderPlus size={18} />
                                Dossier
                            </button>
                            <button
                                onClick={() => { setActiveFolderId(null); setIsModalOpen(true); }}
                                className="px-6 py-3 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 uppercase text-xs tracking-widest"
                                style={{ backgroundColor: currentColor, boxShadow: `0 10px 25px -5px ${currentColor}33` }}
                            >
                                <Plus size={20} />
                                Nouveau cours
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="space-y-12 pb-20">
                        {isCreatingFolder && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-slate-800 animate-scale-up">
                                <form onSubmit={handleConfirmAddFolder} className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-2xl flex items-center justify-center">
                                        <FolderIcon size={32} />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Nom du dossier..."
                                        className="flex-1 bg-transparent text-2xl font-black text-gray-800 dark:text-white outline-none placeholder:text-gray-200 dark:placeholder:text-slate-700"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onBlur={() => { if (!newFolderName) setIsCreatingFolder(false); }}
                                        onKeyDown={(e) => { if (e.key === 'Escape') setIsCreatingFolder(false); }}
                                    />
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-5 py-2 text-gray-400 font-black hover:text-gray-600 transition-colors uppercase tracking-widest text-[10px]">Annuler</button>
                                        <button type="submit" className="px-8 py-3 bg-gray-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-2xl font-black hover:scale-105 transition-all shadow-lg uppercase text-xs">Créer</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {(subject.folders || []).map(folder => (
                            <div
                                key={folder.id}
                                className="space-y-5"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                            >
                                <div className="flex items-center justify-between group">
                                    <button
                                        onClick={() => toggleFolder(folder.id)}
                                        className="flex items-center gap-4 text-2xl font-black text-gray-800 dark:text-gray-200 hover:opacity-70 transition-opacity"
                                    >
                                        <div className={`p-1 transition-transform duration-300 ${expandedFolders[folder.id] ? 'rotate-0' : '-rotate-90'}`}>
                                            <ChevronDown size={24} className="text-gray-300 dark:text-slate-700" />
                                        </div>
                                        <FolderIcon style={{ color: currentColor }} size={28} />
                                        <span className="uppercase tracking-tight">{folder.name}</span>
                                        <span className="text-[10px] font-black bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 px-3 py-1 rounded-full">{folder.courses.length}</span>
                                    </button>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                                        <button
                                            onClick={() => { setActiveFolderId(folder.id); setIsModalOpen(true); }}
                                            className="p-2 text-gray-400 hover:text-purple-600"
                                            title="Ajouter"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFolder(folder.id)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {expandedFolders[folder.id] && (
                                    <div className="grid grid-cols-1 gap-2 animate-fade-in">
                                        {folder.courses.map(course => (
                                            <CourseCard
                                                key={course.id}
                                                course={course}
                                                variant="list"
                                                folderId={folder.id}
                                                onOpen={() => handleOpenCourse(course.filePath)}
                                                onDelete={() => onDeleteCourse(subject.id, course.id, folder.id)}
                                                onToggleStar={() => handleToggleStar(course.id, folder.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div
                            className="space-y-8 min-h-[100px]"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnFolder(e, null)}
                        >
                            {(subject.courses?.length > 0) && (
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Autres cours</h2>
                                    <div className="h-[2px] bg-gray-100 dark:bg-slate-800 flex-1"></div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {(subject.courses || []).map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        onOpen={() => handleOpenCourse(course.filePath)}
                                        onDelete={() => onDeleteCourse(subject.id, course.id)}
                                        onToggleStar={() => handleToggleStar(course.id, null)}
                                    />
                                ))}
                            </div>
                        </div>

                        {totalCourses === 0 && (subject.folders || []).length === 0 && (
                            <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl dark:shadow-none border border-gray-100 dark:border-slate-800">
                                <div className="text-8xl mb-10 animate-blob">✨</div>
                                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Votre futur s'écrit ici</h3>
                                <p className="text-gray-400 dark:text-gray-500 mt-4 font-bold max-w-sm mx-auto">Organisez vos cours, gérez vos notes et atteignez vos objectifs avec Classify !</p>
                                <button
                                    onClick={() => { setActiveFolderId(null); setIsModalOpen(true); }}
                                    className="mt-12 px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-200 dark:shadow-none uppercase tracking-widest text-xs"
                                >
                                    Commencer l'import
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes Sidebar */}
            {showNotes && (
                <div className="w-[450px] bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 flex flex-col shadow-2xl animate-slide-in-right z-40 transition-colors">
                    <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600 dark:bg-purple-900/30 text-white dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 dark:shadow-none">
                                <StickyNote size={24} />
                            </div>
                            <h2 className="font-black text-gray-800 dark:text-white uppercase tracking-tight text-xl">Notes Rapides</h2>
                        </div>
                        <button onClick={() => setShowNotes(false)} className="p-2.5 text-gray-400 hover:text-gray-800 dark:hover:white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 p-8">
                        <textarea
                            className="w-full h-full bg-transparent text-gray-700 dark:text-gray-200 outline-none resize-none font-medium leading-relaxed placeholder:text-gray-200 dark:placeholder:text-slate-800 text-lg"
                            placeholder="Écrivez vos idées, tâches ou notes ici..."
                            value={localNotes}
                            onChange={(e) => setLocalNotes(e.target.value)}
                            onBlur={handleSaveNotes}
                        />
                    </div>
                </div>
            )}

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setActiveFolderId(null); }}
                onSave={handleAddCourse}
            />

            <CustomDialog
                {...dialog}
                onCancel={() => setDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
