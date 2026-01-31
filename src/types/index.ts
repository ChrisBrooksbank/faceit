/**
 * Centralized Type Definitions
 */

// Re-export config types for convenience
export type { AppConfig } from '@config/schema';

// Log levels
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogLevels {
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
}

// Training types (to be expanded)
export interface Trial {
    trialNumber: number;
    targetFaceId: string;
    distractorFaceIds: string[];
    morphLevel: number;
    responseTime: number;
    correct: boolean;
    selectedPosition: number;
    correctPosition: number;
}

export interface TrainingSession {
    id: string;
    userId: string;
    date: Date;
    duration: number;
    trialsCompleted: number;
    trialsTotal: number;
    accuracy: number;
    thresholdLevel: number;
    thresholdHistory: number[];
    trials: Trial[];
    completed: boolean;
}

export interface UserProfile {
    id: string;
    createdAt: Date;
    pi20Score: number;
    pi20Responses: number[];
    baselinePerception: number;
    onboardingComplete: boolean;
    settings: UserSettings;
}

export interface UserSettings {
    reminderEnabled: boolean;
    reminderTime: string;
    trialsPerSession: number;
}

export interface ProgressMetrics {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    totalTrainingTime: number;
    avgThreshold: number;
    bestThreshold: number;
    avgAccuracy: number;
    lastSessionDate: Date | null;
    improvementRate: number;
}
