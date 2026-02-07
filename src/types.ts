export interface Course {
    id: string;
    name: string;
    description: string;
    filePath: string;
    isStarred?: boolean;
    createdAt: number;
    notes?: string;
}

export interface Folder {
    id: string;
    name: string;
    courses: Course[];
    isStarred?: boolean;
    createdAt: number;
}

export interface Subject {
    id: string;
    name: string;
    emoji: string;
    courses: Course[];
    folders: Folder[];
    isStarred?: boolean;
    color?: string;
    createdAt: number;
    notes?: string;
}

export interface RevisionEvent {
    id: string;
    courseId?: string;
    subjectId: string;
    title: string;
    date: number; // timestamp for the day
    status: 'pending' | 'done';
}

export interface Settings {
    editors: Record<string, string>;
    theme?: 'light' | 'dark' | 'auto';
    userName?: string;
    autoUpdatesEnabled?: boolean;
}

export interface UpdateStatus {
    status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
    currentVersion?: string;
    latestVersion?: string;
    percent?: number;
    bytesPerSecond?: number;
    transferred?: number;
    total?: number;
    message?: string;
}
