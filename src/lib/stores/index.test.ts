import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
    userProfile,
    currentSession,
    progressMetrics,
    isOnboarded,
    hasSessionToday,
    currentStreak,
    setUserProfile,
    setCurrentSession,
    setProgressMetrics,
    resetStores,
} from './index';
import type { UserProfile, TrainingSession, ProgressMetrics } from '$lib/types';

describe('Stores', () => {
    beforeEach(() => {
        resetStores();
    });

    describe('Core Stores', () => {
        describe('userProfile', () => {
            it('should initialize as null', () => {
                expect(get(userProfile)).toBeNull();
            });

            it('should update when setUserProfile is called', () => {
                const profile: UserProfile = {
                    id: 'user-1',
                    createdAt: new Date(),
                    pi20Score: 75,
                    pi20Responses: Array(20).fill(3),
                    baselinePerception: 60,
                    onboardingComplete: true,
                    settings: {
                        reminderEnabled: false,
                        reminderTime: '09:00',
                        trialsPerSession: 50,
                    },
                };

                setUserProfile(profile);
                expect(get(userProfile)).toEqual(profile);
            });

            it('should set to null when called with null', () => {
                const profile: UserProfile = {
                    id: 'user-1',
                    createdAt: new Date(),
                    pi20Score: 75,
                    pi20Responses: Array(20).fill(3),
                    baselinePerception: 60,
                    onboardingComplete: true,
                    settings: {
                        reminderEnabled: false,
                        reminderTime: '09:00',
                        trialsPerSession: 50,
                    },
                };

                setUserProfile(profile);
                setUserProfile(null);
                expect(get(userProfile)).toBeNull();
            });
        });

        describe('currentSession', () => {
            it('should initialize as null', () => {
                expect(get(currentSession)).toBeNull();
            });

            it('should update when setCurrentSession is called', () => {
                const session: TrainingSession = {
                    id: 'session-1',
                    date: new Date(),
                    duration: 600,
                    trialsCompleted: 10,
                    trialsTotal: 50,
                    accuracy: 0.75,
                    thresholdLevel: 55,
                    thresholdHistory: [60, 58, 56, 55],
                    trials: [],
                    completed: false,
                };

                setCurrentSession(session);
                expect(get(currentSession)).toEqual(session);
            });

            it('should set to null when called with null', () => {
                const session: TrainingSession = {
                    id: 'session-1',
                    date: new Date(),
                    duration: 600,
                    trialsCompleted: 10,
                    trialsTotal: 50,
                    accuracy: 0.75,
                    thresholdLevel: 55,
                    thresholdHistory: [60, 58, 56, 55],
                    trials: [],
                    completed: false,
                };

                setCurrentSession(session);
                setCurrentSession(null);
                expect(get(currentSession)).toBeNull();
            });
        });

        describe('progressMetrics', () => {
            it('should initialize as null', () => {
                expect(get(progressMetrics)).toBeNull();
            });

            it('should update when setProgressMetrics is called', () => {
                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 5,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: new Date(),
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                expect(get(progressMetrics)).toEqual(metrics);
            });

            it('should set to null when called with null', () => {
                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 5,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: new Date(),
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                setProgressMetrics(null);
                expect(get(progressMetrics)).toBeNull();
            });
        });
    });

    describe('Derived Stores', () => {
        describe('isOnboarded', () => {
            it('should return false when userProfile is null', () => {
                expect(get(isOnboarded)).toBe(false);
            });

            it('should return false when onboardingComplete is false', () => {
                const profile: UserProfile = {
                    id: 'user-1',
                    createdAt: new Date(),
                    pi20Score: 75,
                    pi20Responses: Array(20).fill(3),
                    baselinePerception: 60,
                    onboardingComplete: false,
                    settings: {
                        reminderEnabled: false,
                        reminderTime: '09:00',
                        trialsPerSession: 50,
                    },
                };

                setUserProfile(profile);
                expect(get(isOnboarded)).toBe(false);
            });

            it('should return true when onboardingComplete is true', () => {
                const profile: UserProfile = {
                    id: 'user-1',
                    createdAt: new Date(),
                    pi20Score: 75,
                    pi20Responses: Array(20).fill(3),
                    baselinePerception: 60,
                    onboardingComplete: true,
                    settings: {
                        reminderEnabled: false,
                        reminderTime: '09:00',
                        trialsPerSession: 50,
                    },
                };

                setUserProfile(profile);
                expect(get(isOnboarded)).toBe(true);
            });
        });

        describe('hasSessionToday', () => {
            it('should return false when progressMetrics is null', () => {
                expect(get(hasSessionToday)).toBe(false);
            });

            it('should return false when lastSessionDate is null', () => {
                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 0,
                    longestStreak: 0,
                    totalSessions: 0,
                    totalTrainingTime: 0,
                    avgThreshold: 0,
                    bestThreshold: 0,
                    avgAccuracy: 0,
                    lastSessionDate: null,
                    improvementRate: 0,
                };

                setProgressMetrics(metrics);
                expect(get(hasSessionToday)).toBe(false);
            });

            it('should return true when lastSessionDate is today', () => {
                const today = new Date();
                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 5,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: today,
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                expect(get(hasSessionToday)).toBe(true);
            });

            it('should return false when lastSessionDate is yesterday', () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 5,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: yesterday,
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                expect(get(hasSessionToday)).toBe(false);
            });

            it('should return false when lastSessionDate is tomorrow', () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 5,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: tomorrow,
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                expect(get(hasSessionToday)).toBe(false);
            });
        });

        describe('currentStreak', () => {
            it('should return 0 when progressMetrics is null', () => {
                expect(get(currentStreak)).toBe(0);
            });

            it('should return the current streak from progressMetrics', () => {
                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 7,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: new Date(),
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                expect(get(currentStreak)).toBe(7);
            });

            it('should return 0 when currentStreak is 0', () => {
                const metrics: ProgressMetrics = {
                    userId: 'user-1',
                    currentStreak: 0,
                    longestStreak: 10,
                    totalSessions: 20,
                    totalTrainingTime: 12000,
                    avgThreshold: 52,
                    bestThreshold: 45,
                    avgAccuracy: 0.78,
                    lastSessionDate: new Date(),
                    improvementRate: 1.2,
                };

                setProgressMetrics(metrics);
                expect(get(currentStreak)).toBe(0);
            });
        });
    });

    describe('resetStores', () => {
        it('should reset all stores to null', () => {
            const profile: UserProfile = {
                id: 'user-1',
                createdAt: new Date(),
                pi20Score: 75,
                pi20Responses: Array(20).fill(3),
                baselinePerception: 60,
                onboardingComplete: true,
                settings: {
                    reminderEnabled: false,
                    reminderTime: '09:00',
                    trialsPerSession: 50,
                },
            };

            const session: TrainingSession = {
                id: 'session-1',
                date: new Date(),
                duration: 600,
                trialsCompleted: 10,
                trialsTotal: 50,
                accuracy: 0.75,
                thresholdLevel: 55,
                thresholdHistory: [60, 58, 56, 55],
                trials: [],
                completed: false,
            };

            const metrics: ProgressMetrics = {
                userId: 'user-1',
                currentStreak: 5,
                longestStreak: 10,
                totalSessions: 20,
                totalTrainingTime: 12000,
                avgThreshold: 52,
                bestThreshold: 45,
                avgAccuracy: 0.78,
                lastSessionDate: new Date(),
                improvementRate: 1.2,
            };

            setUserProfile(profile);
            setCurrentSession(session);
            setProgressMetrics(metrics);

            resetStores();

            expect(get(userProfile)).toBeNull();
            expect(get(currentSession)).toBeNull();
            expect(get(progressMetrics)).toBeNull();
        });
    });
});
