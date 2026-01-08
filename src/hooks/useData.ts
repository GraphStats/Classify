import { useState, useEffect } from 'react';
import type { Subject, Settings, RevisionEvent } from '../types';

const STORAGE_KEY_SUBJECTS = 'classify_subjects';
const STORAGE_KEY_EVENTS = 'classify_revision_events';

export function useData() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [revisionEvents, setRevisionEvents] = useState<RevisionEvent[]>([]);
    const [settings, setSettings] = useState<Settings>({ editors: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load subjects
        const savedSubjects = localStorage.getItem(STORAGE_KEY_SUBJECTS);
        if (savedSubjects) {
            setSubjects(JSON.parse(savedSubjects));
        }

        // Load revision events
        const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
        if (savedEvents) {
            setRevisionEvents(JSON.parse(savedEvents));
        }

        // Load settings
        if (window.electron) {
            window.electron.getSettings().then((s: any) => {
                if (s) setSettings(s);
            });
        }

        setLoading(false);
    }, []);

    const saveSubjects = (newSubjects: Subject[]) => {
        setSubjects(newSubjects);
        localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(newSubjects));
    };

    const saveRevisionEvents = (newEvents: RevisionEvent[]) => {
        setRevisionEvents(newEvents);
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(newEvents));
    };

    const updateSettings = async (newSettings: Settings) => {
        setSettings(newSettings);
        if (window.electron) {
            await window.electron.saveSettings(newSettings);
        }
    };

    return {
        subjects,
        saveSubjects,
        revisionEvents,
        saveRevisionEvents,
        settings,
        updateSettings,
        loading
    };
}
