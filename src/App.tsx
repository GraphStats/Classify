import { useState, useEffect, useRef } from 'react';
import { useData } from './hooks/useData';
import { Sidebar } from './components/Sidebar';
import { SubjectView } from './components/SubjectView';
import { SettingsView } from './components/SettingsView';
import { CalendarView } from './components/CalendarView';
import { HomeView } from './components/HomeView';
import { UploadCloud } from 'lucide-react';
import { CustomDialog } from './components/CustomDialog';
import type { Subject, Course, UpdateCheckResult } from './types';

function App() {
  const {
    subjects, saveSubjects,
    revisionEvents, saveRevisionEvents,
    settings, updateSettings,
    loading
  } = useData();
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const didCheckUpdates = useRef(false);

  // Dialog state
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

  // Sync theme from settings
  useEffect(() => {
    if (settings.theme) {
      setIsDarkMode(settings.theme === 'dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    if (loading) return;
    if (didCheckUpdates.current) return;
    if (settings.autoUpdatesEnabled === undefined) return;
    if (settings.autoUpdatesEnabled === false) return;
    if (!window.electron?.checkForUpdates) return;

    didCheckUpdates.current = true;
    window.electron.checkForUpdates().then((result: UpdateCheckResult) => {
      if (!result?.updateAvailable) return;
      setDialog({
        isOpen: true,
        type: 'confirm',
        title: 'Mise a jour disponible',
        message: `Une nouvelle version (${result.latestVersion}) est disponible. Vous utilisez ${result.currentVersion}.`,
        onConfirm: async () => {
          const url = result.downloadUrl || result.releaseUrl;
          if (url && window.electron?.openExternal) {
            await window.electron.openExternal(url);
          }
          setDialog(prev => ({ ...prev, isOpen: false }));
        }
      });
    }).catch(() => {
      // Silent: avoid blocking the user on startup.
    });
  }, [loading, settings.autoUpdatesEnabled]);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    updateSettings({ ...settings, theme: nextMode ? 'dark' : 'light' });
  };

  const handleAddSubject = (name: string, emoji: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      emoji,
      courses: [],
      folders: [],
      createdAt: Date.now(),
      color: '#9333ea'
    };
    const newSubjects = [...subjects, newSubject];
    saveSubjects(newSubjects);
    setActiveSubjectId(newSubject.id);
    setShowSettings(false);
    setShowCalendar(false);
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    const newSubjects = subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
    saveSubjects(newSubjects);
  };

  const handleDeleteSubject = (id: string) => {
    setDialog({
      isOpen: true,
      type: 'danger',
      title: 'Supprimer la matière ?',
      message: 'Attention, tous les dossiers et cours associés seront définitivement perdus.',
      onConfirm: () => {
        const newSubjects = subjects.filter(s => s.id !== id);
        saveSubjects(newSubjects);
        if (activeSubjectId === id) {
          setActiveSubjectId(null);
        }
        setDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteCourse = (subjectId: string, courseId: string, folderId?: string) => {
    const newSubjects = subjects.map(s => {
      if (s.id !== subjectId) return s;
      if (folderId) {
        return {
          ...s,
          folders: s.folders.map(f => f.id === folderId ? {
            ...f,
            courses: f.courses.filter(c => c.id !== courseId)
          } : f)
        };
      }
      return {
        ...s,
        courses: s.courses.filter(c => c.id !== courseId)
      };
    });
    saveSubjects(newSubjects);
  };

  // --- Drag & Drop Magic ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    let targetSubjectId = activeSubjectId;
    if (!targetSubjectId && subjects.length > 0) {
      targetSubjectId = subjects[0].id;
    }

    if (!targetSubjectId) {
      setDialog({
        isOpen: true,
        type: 'alert',
        title: 'Aucune matière',
        message: 'Veuillez d\'abord créer une matière pour y déposer vos fichiers !',
        onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const newCourses: Course[] = files.map(file => {
      const path = window.electron?.getFilePath ? window.electron.getFilePath(file) : (file as any).path;
      console.log('Dropped file:', file.name, 'Path:', path);
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.split('.').slice(0, -1).join('.'),
        description: `Importé par glisser-déposer (${file.name})`,
        filePath: path || '',
        createdAt: Date.now()
      };
    });

    // Check if any path is missing
    const missingPaths = newCourses.filter(c => !c.filePath);
    if (missingPaths.length > 0) {
      setDialog({
        isOpen: true,
        type: 'alert',
        title: 'Erreur d\'import',
        message: 'Impossible de récupérer le chemin du fichier. Vérifiez que vous lancez bien l\'application via Electron et non un navigateur.',
        onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const newSubjects = subjects.map(s => {
      if (s.id === targetSubjectId) {
        return {
          ...s,
          courses: [...s.courses, ...newCourses]
        };
      }
      return s;
    });

    saveSubjects(newSubjects);
    setActiveSubjectId(targetSubjectId);
    setShowSettings(false);
    setShowCalendar(false);
  };

  const renderContent = () => {
    if (showSettings) {
      return <SettingsView settings={settings} onSave={updateSettings} />;
    }

    if (showCalendar) {
      return (
        <CalendarView
          subjects={subjects}
          events={revisionEvents}
          onSaveEvents={saveRevisionEvents}
        />
      );
    }

    if (activeSubjectId) {
      const activeSubject = subjects.find(s => s.id === activeSubjectId);
      if (activeSubject) {
        return (
          <SubjectView
            subject={activeSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      }
    }

    return (
      <HomeView
        subjects={subjects}
        onSelectSubject={(id) => {
          setActiveSubjectId(id);
          setShowSettings(false);
          setShowCalendar(false);
        }}
        onOpenCourse={async (path) => {
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
        }}
      />
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-600 font-bold">Chargement de votre univers...</div>;

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        isSettingsActive={showSettings}
        isCalendarActive={showCalendar}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onSelectSubject={(id) => {
          setActiveSubjectId(id);
          setShowSettings(false);
          setShowCalendar(false);
        }}
        onAddSubject={handleAddSubject}
        onDeleteSubject={handleDeleteSubject}
        onOpenSettings={() => {
          setShowSettings(true);
          setShowCalendar(false);
          setActiveSubjectId(null);
        }}
        onOpenCalendar={() => {
          setShowCalendar(true);
          setShowSettings(false);
          setActiveSubjectId(null);
        }}
        onGoHome={() => {
          setActiveSubjectId(null);
          setShowSettings(false);
          setShowCalendar(false);
        }}
      />

      <div
        className="flex-1 bg-white dark:bg-slate-950 overflow-hidden relative transition-colors duration-300"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {renderContent()}

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-purple-600/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white border-8 border-dashed border-white/50 m-4 rounded-[40px] animate-fade-in pointer-events-none">
            <div className="bg-white text-purple-600 p-8 rounded-full shadow-2xl mb-6">
              <UploadCloud size={80} className="animate-bounce" />
            </div>
            <h2 className="text-4xl font-black mb-2">Lâchez pour importer !</h2>
            <p className="text-xl opacity-80 font-medium">Vos cours seront ajoutés instantanément.</p>
          </div>
        )}

        <CustomDialog
          {...dialog}
          onCancel={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}

export default App;
