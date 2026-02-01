/**
 * Tests for IndexedDB module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    initDB,
    saveUserProfile,
    getUserProfile,
    getAllUserProfiles,
    deleteUserProfile,
    saveSession,
    getSession,
    getAllSessions,
    getSessionsByDate,
    deleteSession,
    saveAssessment,
    getAssessment,
    getAllAssessments,
    getAssessmentsByDate,
    deleteAssessment,
    saveProgressMetrics,
    getProgressMetrics,
    deleteProgressMetrics,
    clearAllData,
    closeDB,
} from './index';
import type { UserProfile, TrainingSession, Assessment, ProgressMetrics } from '$lib/types';

describe('IndexedDB Module', () => {
    beforeEach(async () => {
        // Initialize database and clear all data before each test
        await initDB();
        await clearAllData();
    });

    afterEach(() => {
        // Close database connection after each test
        closeDB();
    });

    describe('initDB', () => {
        it('should initialize the database successfully', async () => {
            const db = await initDB();
            expect(db).toBeDefined();
            expect(db.name).toBe('FaceItDB');
        });

        it('should return the same instance on multiple calls', async () => {
            const db1 = await initDB();
            const db2 = await initDB();
            expect(db1).toBe(db2);
        });
    });

    describe('User Profile Operations', () => {
        const mockProfile: UserProfile = {
            id: 'user-123',
            createdAt: new Date('2026-01-01'),
            pi20Score: 75,
            pi20Responses: Array(20).fill(3),
            baselinePerception: 4,
            onboardingComplete: true,
            settings: {
                reminderEnabled: true,
                reminderTime: '09:00',
                trialsPerSession: 60,
            },
        };

        it('should save and retrieve a user profile', async () => {
            await saveUserProfile(mockProfile);
            const retrieved = await getUserProfile('user-123');
            expect(retrieved).toEqual(mockProfile);
        });

        it('should return undefined for non-existent user', async () => {
            const retrieved = await getUserProfile('non-existent');
            expect(retrieved).toBeUndefined();
        });

        it('should get all user profiles', async () => {
            const profile1 = { ...mockProfile, id: 'user-1' };
            const profile2 = { ...mockProfile, id: 'user-2' };

            await saveUserProfile(profile1);
            await saveUserProfile(profile2);

            const allProfiles = await getAllUserProfiles();
            expect(allProfiles).toHaveLength(2);
            expect(allProfiles).toContainEqual(profile1);
            expect(allProfiles).toContainEqual(profile2);
        });

        it('should update existing user profile', async () => {
            await saveUserProfile(mockProfile);

            const updated = {
                ...mockProfile,
                pi20Score: 80,
            };
            await saveUserProfile(updated);

            const retrieved = await getUserProfile('user-123');
            expect(retrieved?.pi20Score).toBe(80);
        });

        it('should delete a user profile', async () => {
            await saveUserProfile(mockProfile);
            await deleteUserProfile('user-123');

            const retrieved = await getUserProfile('user-123');
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Training Session Operations', () => {
        const mockSession: TrainingSession = {
            id: 'session-123',
            date: new Date('2026-01-15'),
            duration: 600,
            trialsCompleted: 60,
            trialsTotal: 60,
            accuracy: 75,
            thresholdLevel: 52,
            thresholdHistory: [60, 56, 52],
            trials: [],
            completed: true,
        };

        it('should save and retrieve a session', async () => {
            await saveSession(mockSession);
            const retrieved = await getSession('session-123');
            expect(retrieved).toEqual(mockSession);
        });

        it('should return undefined for non-existent session', async () => {
            const retrieved = await getSession('non-existent');
            expect(retrieved).toBeUndefined();
        });

        it('should get all sessions', async () => {
            const session1 = { ...mockSession, id: 'session-1' };
            const session2 = { ...mockSession, id: 'session-2' };

            await saveSession(session1);
            await saveSession(session2);

            const allSessions = await getAllSessions();
            expect(allSessions).toHaveLength(2);
        });

        it('should get sessions sorted by date', async () => {
            const session1 = {
                ...mockSession,
                id: 'session-1',
                date: new Date('2026-01-10'),
            };
            const session2 = {
                ...mockSession,
                id: 'session-2',
                date: new Date('2026-01-20'),
            };

            await saveSession(session2);
            await saveSession(session1);

            const sortedSessions = await getSessionsByDate();
            expect(sortedSessions).toHaveLength(2);
            expect(sortedSessions[0].id).toBe('session-1');
            expect(sortedSessions[1].id).toBe('session-2');
        });

        it('should delete a session', async () => {
            await saveSession(mockSession);
            await deleteSession('session-123');

            const retrieved = await getSession('session-123');
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Assessment Operations', () => {
        const mockAssessment: Assessment = {
            id: 'assessment-123',
            date: new Date('2026-01-01'),
            type: 'initial',
            pi20Score: 75,
            pi20Responses: Array(20).fill(3),
            perceptionScore: 4,
        };

        it('should save and retrieve an assessment', async () => {
            await saveAssessment(mockAssessment);
            const retrieved = await getAssessment('assessment-123');
            expect(retrieved).toEqual(mockAssessment);
        });

        it('should return undefined for non-existent assessment', async () => {
            const retrieved = await getAssessment('non-existent');
            expect(retrieved).toBeUndefined();
        });

        it('should get all assessments', async () => {
            const assessment1 = { ...mockAssessment, id: 'assessment-1' };
            const assessment2 = { ...mockAssessment, id: 'assessment-2' };

            await saveAssessment(assessment1);
            await saveAssessment(assessment2);

            const allAssessments = await getAllAssessments();
            expect(allAssessments).toHaveLength(2);
        });

        it('should get assessments sorted by date', async () => {
            const assessment1 = {
                ...mockAssessment,
                id: 'assessment-1',
                date: new Date('2026-01-01'),
            };
            const assessment2 = {
                ...mockAssessment,
                id: 'assessment-2',
                date: new Date('2026-02-01'),
                type: 'periodic' as const,
            };

            await saveAssessment(assessment2);
            await saveAssessment(assessment1);

            const sortedAssessments = await getAssessmentsByDate();
            expect(sortedAssessments).toHaveLength(2);
            expect(sortedAssessments[0].id).toBe('assessment-1');
            expect(sortedAssessments[1].id).toBe('assessment-2');
        });

        it('should delete an assessment', async () => {
            await saveAssessment(mockAssessment);
            await deleteAssessment('assessment-123');

            const retrieved = await getAssessment('assessment-123');
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Progress Metrics Operations', () => {
        const mockMetrics: ProgressMetrics = {
            userId: 'user-123',
            currentStreak: 7,
            longestStreak: 14,
            totalSessions: 30,
            totalTrainingTime: 18000,
            avgThreshold: 50,
            bestThreshold: 40,
            avgAccuracy: 78,
            lastSessionDate: new Date('2026-01-20'),
            improvementRate: 0.5,
        };

        it('should save and retrieve progress metrics', async () => {
            await saveProgressMetrics(mockMetrics);
            const retrieved = await getProgressMetrics('user-123');

            expect(retrieved).toBeDefined();
            expect(retrieved?.currentStreak).toBe(7);
            expect(retrieved?.longestStreak).toBe(14);
        });

        it('should return undefined for non-existent metrics', async () => {
            const retrieved = await getProgressMetrics('non-existent');
            expect(retrieved).toBeUndefined();
        });

        it('should update existing progress metrics', async () => {
            await saveProgressMetrics(mockMetrics);

            const updated = {
                ...mockMetrics,
                currentStreak: 8,
            };
            await saveProgressMetrics(updated);

            const retrieved = await getProgressMetrics('user-123');
            expect(retrieved?.currentStreak).toBe(8);
        });

        it('should delete progress metrics', async () => {
            await saveProgressMetrics(mockMetrics);
            await deleteProgressMetrics('user-123');

            const retrieved = await getProgressMetrics('user-123');
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Utility Operations', () => {
        it('should clear all data from database', async () => {
            // Add data to all stores
            const profile: UserProfile = {
                id: 'user-1',
                createdAt: new Date(),
                pi20Score: 75,
                pi20Responses: Array(20).fill(3),
                baselinePerception: 4,
                onboardingComplete: true,
                settings: {
                    reminderEnabled: true,
                    reminderTime: '09:00',
                    trialsPerSession: 60,
                },
            };
            const session: TrainingSession = {
                id: 'session-1',
                date: new Date(),
                duration: 600,
                trialsCompleted: 60,
                trialsTotal: 60,
                accuracy: 75,
                thresholdLevel: 52,
                thresholdHistory: [],
                trials: [],
                completed: true,
            };
            const assessment: Assessment = {
                id: 'assessment-1',
                date: new Date(),
                type: 'initial',
                pi20Score: 75,
                pi20Responses: Array(20).fill(3),
                perceptionScore: 4,
            };
            const metrics: ProgressMetrics = {
                userId: 'user-1',
                currentStreak: 7,
                longestStreak: 14,
                totalSessions: 30,
                totalTrainingTime: 18000,
                avgThreshold: 50,
                bestThreshold: 40,
                avgAccuracy: 78,
                lastSessionDate: new Date(),
                improvementRate: 0.5,
            };

            await saveUserProfile(profile);
            await saveSession(session);
            await saveAssessment(assessment);
            await saveProgressMetrics(metrics);

            // Clear all data
            await clearAllData();

            // Verify all stores are empty
            expect(await getUserProfile('user-1')).toBeUndefined();
            expect(await getSession('session-1')).toBeUndefined();
            expect(await getAssessment('assessment-1')).toBeUndefined();
            expect(await getProgressMetrics('user-1')).toBeUndefined();
        });
    });
});
