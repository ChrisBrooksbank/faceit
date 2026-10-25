/**
 * Core type definitions for FaceIt
 */

// ============================================
// User & Profile Types
// ============================================

export interface UserProfile {
    id: string;
    createdAt: Date;
    pi20Score: number;
    pi20Responses: number[];
    baselinePerception: number;
    onboardingComplete: boolean;
    settings: UserSettings;
    /** Staircase level (28 hard - 88 easy) the next session resumes from */
    staircaseLevel?: number;
}

export interface UserSettings {
    reminderEnabled: boolean;
    reminderTime: string; // HH:MM format
    trialsPerSession: number;
}

// ============================================
// Training Session Types
// ============================================

export interface Trial {
    trialNumber: number;
    targetFaceId: string;
    distractorFaceIds: string[];
    morphLevel: number;
    /** Exact staircase level the trial was built at (morphLevel is snapped to the image grid) */
    difficultyLevel?: number;
    /** Morph gap between the target and its distractors */
    gap?: number;
    /** Whether the answer was a different photo of the target's identity */
    differentPhoto?: boolean;
    responseTime: number;
    correct: boolean;
    selectedPosition: number;
    correctPosition: number;
}

export interface TrainingSession {
    id: string;
    date: Date;
    duration: number;
    trialsCompleted: number;
    trialsTotal: number;
    accuracy: number;
    thresholdLevel: number;
    thresholdHistory: number[];
    trials: Trial[];
    completed: boolean;
    /** Difficulty definition used (see CURRENT_DIFFICULTY_VERSION). Missing means legacy. */
    difficultyVersion?: number;
}

// ============================================
// Progress & Metrics Types
// ============================================

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

// ============================================
// Assessment Types
// ============================================

export interface Assessment {
    id: string;
    date: Date;
    type: 'initial' | 'periodic';
    pi20Score: number;
    pi20Responses: number[];
    perceptionScore: number;
}

export type PI20Response = 1 | 2 | 3 | 4 | 5;

export interface PI20Question {
    id: number;
    text: string;
    reverseScored: boolean;
}

// ============================================
// Staircase Algorithm Types
// ============================================

export interface StaircaseState {
    currentMorphLevel: number;
    consecutiveCorrect: number;
    reversals: number[];
    trialCount: number;
    direction: 'up' | 'down' | null;
}

export interface StaircaseConfig {
    minMorphLevel: number;
    maxMorphLevel: number;
    stepSize: number;
    startingLevel: number;
    targetAccuracy: number;
}

// ============================================
// PI20 Scoring Types
// ============================================

export type PI20Severity = 'typical' | 'mild' | 'moderate' | 'severe';

export interface PI20Result {
    score: number;
    severity: PI20Severity;
    percentile: number;
}
