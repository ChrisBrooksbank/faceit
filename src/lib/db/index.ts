/**
 * IndexedDB module for FaceIt
 * Provides type-safe database operations using idb library
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { UserProfile, TrainingSession, Assessment, ProgressMetrics } from '$lib/types';

const DB_NAME = 'FaceItDB';
const DB_VERSION = 1;

// Database schema type
interface FaceItDB {
    users: {
        key: string;
        value: UserProfile;
    };
    sessions: {
        key: string;
        value: TrainingSession;
        indexes: { 'by-date': Date };
    };
    assessments: {
        key: string;
        value: Assessment;
        indexes: { 'by-date': Date };
    };
    progress: {
        key: string;
        value: ProgressMetrics;
    };
}

let dbInstance: IDBPDatabase<FaceItDB> | null = null;

/**
 * Initialize and open the IndexedDB database
 * Creates object stores and indexes if they don't exist
 */
export async function initDB(): Promise<IDBPDatabase<FaceItDB>> {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await openDB<FaceItDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Users store
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'id' });
            }

            // Sessions store with date index
            if (!db.objectStoreNames.contains('sessions')) {
                const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
                sessionStore.createIndex('by-date', 'date');
            }

            // Assessments store with date index
            if (!db.objectStoreNames.contains('assessments')) {
                const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id' });
                assessmentStore.createIndex('by-date', 'date');
            }

            // Progress store
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress', { keyPath: 'userId' });
            }
        },
    });

    return dbInstance;
}

/**
 * Get the database instance, initializing if necessary
 */
async function getDB(): Promise<IDBPDatabase<FaceItDB>> {
    if (!dbInstance) {
        return await initDB();
    }
    return dbInstance;
}

// ============================================
// User Profile Operations
// ============================================

export async function saveUserProfile(profile: UserProfile): Promise<void> {
    const db = await getDB();
    await db.put('users', profile);
}

export async function getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const db = await getDB();
    return await db.get('users', userId);
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
    const db = await getDB();
    return await db.getAll('users');
}

export async function deleteUserProfile(userId: string): Promise<void> {
    const db = await getDB();
    await db.delete('users', userId);
}

// ============================================
// Training Session Operations
// ============================================

export async function saveSession(session: TrainingSession): Promise<void> {
    const db = await getDB();
    await db.put('sessions', session);
}

export async function getSession(sessionId: string): Promise<TrainingSession | undefined> {
    const db = await getDB();
    return await db.get('sessions', sessionId);
}

export async function getAllSessions(): Promise<TrainingSession[]> {
    const db = await getDB();
    return await db.getAll('sessions');
}

export async function getSessionsByDate(): Promise<TrainingSession[]> {
    const db = await getDB();
    return await db.getAllFromIndex('sessions', 'by-date');
}

export async function deleteSession(sessionId: string): Promise<void> {
    const db = await getDB();
    await db.delete('sessions', sessionId);
}

// ============================================
// Assessment Operations
// ============================================

export async function saveAssessment(assessment: Assessment): Promise<void> {
    const db = await getDB();
    await db.put('assessments', assessment);
}

export async function getAssessment(assessmentId: string): Promise<Assessment | undefined> {
    const db = await getDB();
    return await db.get('assessments', assessmentId);
}

export async function getAllAssessments(): Promise<Assessment[]> {
    const db = await getDB();
    return await db.getAll('assessments');
}

export async function getAssessmentsByDate(): Promise<Assessment[]> {
    const db = await getDB();
    return await db.getAllFromIndex('assessments', 'by-date');
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
    const db = await getDB();
    await db.delete('assessments', assessmentId);
}

// ============================================
// Progress Metrics Operations
// ============================================

export async function saveProgressMetrics(metrics: ProgressMetrics): Promise<void> {
    const db = await getDB();
    await db.put('progress', metrics);
}

export async function getProgressMetrics(userId: string): Promise<ProgressMetrics | undefined> {
    const db = await getDB();
    return await db.get('progress', userId);
}

export async function deleteProgressMetrics(userId: string): Promise<void> {
    const db = await getDB();
    await db.delete('progress', userId);
}

// ============================================
// Utility Operations
// ============================================

/**
 * Clear all data from the database
 * Useful for testing or data reset
 */
export async function clearAllData(): Promise<void> {
    const db = await getDB();
    await db.clear('users');
    await db.clear('sessions');
    await db.clear('assessments');
    await db.clear('progress');
}

/**
 * Delete all data from the database (alias for clearAllData)
 */
export async function deleteAllData(): Promise<void> {
    await clearAllData();
}

/**
 * Close the database connection
 */
export function closeDB(): void {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
