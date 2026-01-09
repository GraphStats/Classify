import type { Course } from '../types';
import { FileText, FileCode, File, ExternalLink, Trash2, Star, Edit3 } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    onOpen: () => void;
    onDelete: () => void;
    onToggleStar: () => void;
    onRename?: () => void;
    variant?: 'card' | 'list';
    folderId?: string;
}

export function CourseCard({ course, onOpen, onDelete, onToggleStar, onRename, variant = 'card', folderId }: CourseCardProps) {
    const getIcon = (path?: string, size = 32) => {
        if (!path) return <File className="text-gray-400" size={size} />;
        const lowPath = path.toLowerCase();
        if (lowPath.endsWith('.md')) return <FileCode className="text-gray-700 dark:text-gray-300" size={size} />;
        if (lowPath.endsWith('.docx') || lowPath.endsWith('.doc')) return <FileText className="text-blue-600 dark:text-blue-400" size={size} />;
        if (lowPath.endsWith('.pdf')) return <FileText className="text-red-500 dark:text-red-400" size={size} />;
        return <File className="text-purple-500 dark:text-purple-400" size={size} />;
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('courseId', course.id);
        e.dataTransfer.setData('sourceFolderId', folderId || '');
        e.dataTransfer.effectAllowed = 'move';

        // Petit effet visuel
        const ghost = e.currentTarget as HTMLElement;
        ghost.style.opacity = '0.5';
        setTimeout(() => ghost.style.opacity = '1', 0);
    };

    if (variant === 'list') {
        return (
            <div
                draggable
                onDragStart={handleDragStart}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-800 hover:border-purple-100 dark:hover:border-purple-900/50 flex items-center gap-4 relative overflow-hidden cursor-grab active:cursor-grabbing"
            >
                <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors flex-shrink-0">
                    {getIcon(course.filePath, 24)}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors line-clamp-2 uppercase text-sm tracking-tight" title={course.name}>{course.name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate font-black uppercase tracking-widest">{course.description || "Aucune description"}</p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
                        className={`p-2 rounded-xl transition-all ${course.isStarred ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 opacity-0 group-hover:opacity-100'}`}
                        title={course.isStarred ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <Star size={16} fill={course.isStarred ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={onOpen}
                        className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white dark:hover:text-white transition-all shadow-sm"
                        title="Ouvrir"
                    >
                        <ExternalLink size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRename?.(); }}
                        className="p-2 text-gray-300 dark:text-gray-700 hover:text-purple-500 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Renommer"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-gray-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="group bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:shadow-purple-200/20 transition-all duration-300 border border-gray-100 dark:border-slate-800 hover:border-purple-100 dark:hover:border-purple-900/50 relative overflow-hidden h-full flex flex-col cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 rounded-2xl transition-colors">
                    {getIcon(course.filePath, 32)}
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
                        className={`p-2.5 rounded-xl transition-all ${course.isStarred ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'text-gray-200 dark:text-gray-700 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 opacity-0 group-hover:opacity-100'}`}
                        title={course.isStarred ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <Star size={20} fill={course.isStarred ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRename?.(); }}
                        className="p-2.5 text-gray-200 dark:text-gray-700 hover:text-purple-500 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Renommer"
                    >
                        <Edit3 size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2.5 text-gray-200 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <h3 className="font-black text-lg text-gray-800 dark:text-gray-100 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors line-clamp-2 uppercase tracking-tight min-h-[3.5rem]" title={course.name}>{course.name}</h3>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-6 line-clamp-2 min-h-[32px] flex-1 leading-relaxed">
                {course.description || "Aucune description disponible pour ce cours."}
            </p>

            <button
                onClick={onOpen}
                className="w-full py-3.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-all mt-auto shadow-sm"
            >
                <span>Ouvrir</span>
                <ExternalLink size={14} />
            </button>

            {/* Decorative background blob */}
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-all blur-3xl pointer-events-none" />
        </div>
    );
}
