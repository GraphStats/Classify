import { useState, useMemo } from 'react';
import type { Subject, RevisionEvent } from '../types';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Plus, CheckCircle2, Circle, Clock, Trash2, LayoutGrid, List, X
} from 'lucide-react';
import { Emoji, EmojiStyle } from 'emoji-picker-react';

interface CalendarViewProps {
    subjects: Subject[];
    events: RevisionEvent[];
    onSaveEvents: (events: RevisionEvent[]) => void;
}

export function CalendarView({ subjects, events, onSaveEvents }: CalendarViewProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form states
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        // Fill leading empty days
        const firstDay = date.getDay() || 7; // 1 (Mon) to 7 (Sun)
        for (let i = 1; i < firstDay; i++) {
            days.push(null);
        }

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [viewDate]);

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleAddEvent = () => {
        if (!selectedSubjectId || !eventTitle) return;

        const newEvent: RevisionEvent = {
            id: Date.now().toString(),
            subjectId: selectedSubjectId,
            title: eventTitle,
            date: new Date(eventDate).getTime(),
            status: 'pending'
        };

        onSaveEvents([...events, newEvent]);
        setIsAddingEvent(false);
        setEventTitle('');
    };

    const handleToggleStatus = (id: string) => {
        onSaveEvents(events.map(e => e.id === id ? { ...e, status: e.status === 'done' ? 'pending' : 'done' } : e));
    };

    const handleDeleteEvent = (id: string) => {
        onSaveEvents(events.filter(e => e.id !== id));
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear();
        });
    };

    const monthName = viewDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div className="flex-1 h-full overflow-y-auto bg-transparent p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-black text-gray-800 dark:text-white uppercase tracking-tight">Planning de Révision</h1>
                        <p className="text-gray-500 dark:text-gray-500 font-medium mt-1">Organise tes sessions d'étude pour réussir.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1 border border-gray-100 dark:border-slate-800 shadow-sm mr-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAddingEvent(true)}
                            className="px-8 py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 dark:shadow-none flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                        >
                            <Plus size={18} />
                            Programmer
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Content Section */}
                    <div className="lg:col-span-3 space-y-6">
                        {viewMode === 'grid' ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight capitalize">
                                        {monthName}
                                    </h2>
                                    <div className="flex gap-2">
                                        <button onClick={handlePrevMonth} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl text-gray-400 transition-all">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button onClick={handleNextMonth} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl text-gray-400 transition-all">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-4">
                                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                        <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                            {day}
                                        </div>
                                    ))}
                                    {daysInMonth.map((day, idx) => (
                                        <div
                                            key={idx}
                                            className={`min-h-[120px] rounded-3xl border transition-all p-3 flex flex-col gap-2 ${day
                                                ? 'bg-gray-50/30 dark:bg-slate-800/20 border-gray-50 dark:border-slate-800/50'
                                                : 'bg-transparent border-transparent'
                                                } ${day?.toDateString() === new Date().toDateString() ? 'ring-2 ring-purple-600 border-transparent shadow-xl shadow-purple-200/20' : ''}`}
                                        >
                                            {day && (
                                                <>
                                                    <span className={`text-sm font-black ${day.toDateString() === new Date().toDateString() ? 'text-purple-600' : 'text-gray-400 dark:text-gray-600'}`}>
                                                        {day.getDate()}
                                                    </span>
                                                    <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar-mini">
                                                        {getEventsForDate(day).map(event => {
                                                            const subject = subjects.find(s => s.id === event.subjectId);
                                                            return (
                                                                <div
                                                                    key={event.id}
                                                                    className={`p-1.5 rounded-xl text-[9px] font-black uppercase truncate flex items-center gap-1.5 border ${event.status === 'done'
                                                                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 border-transparent line-through'
                                                                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-slate-700 shadow-sm'
                                                                        }`}
                                                                    title={event.title}
                                                                >
                                                                    {subject && <Emoji unified={subject.emoji} size={12} emojiStyle={EmojiStyle.APPLE} />}
                                                                    {event.title}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {events.length === 0 ? (
                                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800">
                                        <CalendarIcon className="mx-auto text-gray-200 dark:text-slate-800 mb-6" size={64} />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucune session programmée</p>
                                    </div>
                                ) : (
                                    events
                                        .sort((a, b) => b.date - a.date)
                                        .map(event => {
                                            const subject = subjects.find(s => s.id === event.subjectId);
                                            const date = new Date(event.date);
                                            return (
                                                <div key={event.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between group hover:border-purple-200 dark:hover:border-purple-900/50 transition-all animate-fade-in">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                                                            {subject && <Emoji unified={subject.emoji} size={32} emojiStyle={EmojiStyle.APPLE} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h3 className={`text-xl font-black uppercase tracking-tight ${event.status === 'done' ? 'text-gray-300 dark:text-gray-700 line-through' : 'text-gray-800 dark:text-white'}`}>
                                                                    {event.title}
                                                                </h3>
                                                                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-black rounded-full uppercase tracking-widest">{subject?.name}</span>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleToggleStatus(event.id)}
                                                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${event.status === 'done'
                                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none'
                                                                    : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-green-500'
                                                                }`}
                                                        >
                                                            {event.status === 'done' ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 border-2 border-current rounded-full" />}
                                                            {event.status === 'done' ? 'Terminé' : 'Marquer comme fait'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                            className="p-3 text-gray-200 dark:text-gray-800 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={24} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upcoming / List Section */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-slate-800 h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">À Venir</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Tes prochains défis</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                                {events
                                    .filter(e => e.status === 'pending')
                                    .sort((a, b) => a.date - b.date)
                                    .map(event => {
                                        const subject = subjects.find(s => s.id === event.subjectId);
                                        const date = new Date(event.date);
                                        return (
                                            <div key={event.id} className="group p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50 transition-all">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {subject && <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm"><Emoji unified={subject.emoji} size={16} emojiStyle={EmojiStyle.APPLE} /></div>}
                                                        <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight truncate max-w-[120px]">{event.title}</h4>
                                                    </div>
                                                    <button onClick={() => handleDeleteEvent(event.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <button
                                                        onClick={() => handleToggleStatus(event.id)}
                                                        className="p-1.5 text-gray-300 hover:text-green-500 transition-colors"
                                                    >
                                                        <Circle size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                {events.filter(e => e.status === 'pending').length === 0 && (
                                    <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800 text-gray-400 text-xs font-bold italic">
                                        Libre comme l'air !
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Add Event Modal Overlay */}
            {isAddingEvent && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-[500px] shadow-2xl p-8 relative animate-scale-up border border-gray-100 dark:border-slate-800">
                        <button
                            onClick={() => setIsAddingEvent(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all font-black"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-8 uppercase tracking-tight">Nouvelle Révision</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.2em] ml-1">Matière</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {subjects.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedSubjectId(s.id)}
                                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedSubjectId === s.id ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-50 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50'}`}
                                        >
                                            <Emoji unified={s.emoji} size={24} emojiStyle={EmojiStyle.APPLE} />
                                            <span className="text-[8px] font-black uppercase truncate w-full text-center">{s.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.2em] ml-1">Titre de la session</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-bold placeholder:text-gray-200 dark:placeholder:text-slate-700"
                                    placeholder="Ex: Réviser Chapitre 1"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.2em] ml-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-bold"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => setIsAddingEvent(false)}
                                className="px-8 py-4 text-gray-400 font-black hover:text-gray-600 transition-colors uppercase tracking-widest text-[10px]"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddEvent}
                                disabled={!selectedSubjectId || !eventTitle}
                                className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-purple-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest"
                            >
                                Programmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
