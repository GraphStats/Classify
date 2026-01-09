import { useState, useMemo } from 'react';
import type { Subject, Course } from '../types';
import { Search, Clock, Folder, BookOpen, Star, ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react';
import { Emoji, EmojiStyle } from 'emoji-picker-react';

interface HomeViewProps {
    subjects: Subject[];
    onSelectSubject: (id: string) => void;
    onOpenCourse: (path: string) => void;
}

export function HomeView({ subjects, onSelectSubject, onOpenCourse }: HomeViewProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => {
        let totalCourses = 0;
        let totalFolders = 0;
        subjects.forEach(s => {
            totalCourses += (s.courses?.length || 0);
            totalFolders += (s.folders?.length || 0);
            s.folders?.forEach(f => {
                totalCourses += (f.courses?.length || 0);
            });
        });
        return { totalCourses, totalFolders, totalSubjects: subjects.length };
    }, [subjects]);

    const subjectStats = useMemo(() => {
        return subjects.map(s => {
            let count = (s.courses?.length || 0);
            s.folders?.forEach(f => count += (f.courses?.length || 0));
            return { name: s.name, count, color: s.color || '#9333ea', emoji: s.emoji };
        }).sort((a, b) => b.count - a.count);
    }, [subjects]);

    const allCoursesWithSubject = useMemo(() => {
        const courses: (Course & { subjectEmoji: string, subjectName: string, subjectId: string })[] = [];
        subjects.forEach(s => {
            s.courses?.forEach(c => courses.push({ ...c, subjectEmoji: s.emoji, subjectName: s.name, subjectId: s.id }));
            s.folders?.forEach(f => {
                f.courses?.forEach(c => courses.push({ ...c, subjectEmoji: s.emoji, subjectName: s.name, subjectId: s.id }));
            });
        });
        return courses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [subjects]);

    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return allCoursesWithSubject.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.subjectName.toLowerCase().includes(query)
        ).slice(0, 10);
    }, [searchQuery, allCoursesWithSubject]);

    const recentCourses = allCoursesWithSubject.slice(0, 4);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-transparent p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-black text-gray-800 dark:text-white flex items-center gap-3">
                            Hello ! <Sparkles className="text-yellow-500" />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium">Prêt pour une session de travail productive ?</p>
                    </div>
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un cours..."
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none focus:outline-none focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 focus:border-purple-300 transition-all text-gray-700 dark:text-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* Search Results Dropdown */}
                        {searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-2 z-50 animate-fade-in">
                                {filteredResults.length > 0 ? (
                                    filteredResults.map(result => (
                                        <button
                                            key={result.id}
                                            onClick={() => onOpenCourse(result.filePath)}
                                            className="w-full flex items-center gap-4 p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xl">
                                                <Emoji unified={result.subjectEmoji} size={24} emojiStyle={EmojiStyle.APPLE} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2" title={result.name}>{result.name}</h4>
                                                <p className="text-xs text-gray-400 truncate">{result.subjectName}</p>
                                            </div>
                                            <ArrowRight size={16} className="text-gray-300" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400">
                                        <p>Aucun résultat pour "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Matières</p>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stats.totalSubjects}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                            <Folder size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Dossiers</p>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stats.totalFolders}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                        <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl flex items-center justify-center">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Cours</p>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{stats.totalCourses}</h3>
                        </div>
                    </div>
                </div>

                {/* Repartition Section */}
                <section className="bg-white dark:bg-slate-900/50 p-8 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm animate-fade-in">
                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-8">Répartition par matière</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjectStats.map(s => (
                            <div key={s.name} className="space-y-3 group uppercase tracking-tight min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Emoji unified={s.emoji} size={16} emojiStyle={EmojiStyle.APPLE} />
                                        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm truncate">{s.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-400 flex-shrink-0 ml-2">{s.count} cours</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110"
                                        style={{
                                            width: `${stats.totalCourses > 0 ? (s.count / stats.totalCourses) * 100 : 0}%`,
                                            backgroundColor: s.color
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {subjects.length === 0 && (
                            <p className="text-sm text-gray-400 italic">Aucune matière pour le moment.</p>
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Starred Courses */}
                    {allCoursesWithSubject.filter(c => c.isStarred).length > 0 && (
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                <Star size={24} className="text-yellow-500 fill-yellow-500" />
                                ÉPINGLÉS
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {allCoursesWithSubject.filter(c => c.isStarred).map(course => (
                                    <div key={course.id} className="group bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-yellow-100 dark:border-yellow-900/20 bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900/50 dark:to-yellow-900/5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                                <Emoji unified={course.subjectEmoji} size={24} emojiStyle={EmojiStyle.APPLE} />
                                            </div>
                                            <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[2.5rem]" title={course.name}>{course.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{course.subjectName}</p>
                                        </div>
                                        <button
                                            onClick={() => onOpenCourse(course.filePath)}
                                            className="w-full py-2 bg-yellow-500 text-white rounded-xl text-xs font-black hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-200 dark:shadow-none"
                                        >
                                            OUVRIR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activities */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                <Clock size={24} className="text-purple-600" />
                                Récents
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {recentCourses.map(course => (
                                <div key={course.id} className="group bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900/50 shadow-sm transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 rounded-xl flex items-center justify-center transition-colors">
                                        <Emoji unified={course.subjectEmoji} size={28} emojiStyle={EmojiStyle.APPLE} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2" title={course.name}>{course.name}</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-black tracking-tight">{course.subjectName}</p>
                                    </div>
                                    <button
                                        onClick={() => onOpenCourse(course.filePath)}
                                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            ))}
                            {recentCourses.length === 0 && (
                                <div className="py-12 text-center bg-white dark:bg-slate-900/30 rounded-3xl border border-dashed border-gray-100 dark:border-slate-800 text-gray-400">
                                    Vos futurs cours apparaîtront ici !
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Navigation to Subjects */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                            <LayoutDashboard size={24} className="text-blue-600" />
                            Matières
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {subjects.map(subject => (
                                <button
                                    key={subject.id}
                                    onClick={() => onSelectSubject(subject.id)}
                                    className="p-4 bg-white dark:bg-slate-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-3xl border border-gray-100 dark:border-slate-800 hover:border-purple-200 shadow-sm transition-all text-left flex flex-col gap-3 group"
                                >
                                    <Emoji unified={subject.emoji} size={32} emojiStyle={EmojiStyle.APPLE} />
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors uppercase text-sm tracking-tight">{subject.name}</h4>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mt-1">
                                            {(subject.courses?.length || 0) + (subject.folders?.length || 0)} Éléments
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Decoration */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        </div>
    );
}
