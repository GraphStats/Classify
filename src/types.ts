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

export interface UpdateCheckResult {
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
    releaseName?: string;
    publishedAt?: string;
    releaseUrl?: string;
    downloadUrl?: string;
    error?: string;
}
