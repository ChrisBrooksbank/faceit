/**
 * Tests for app initialization logic
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initApp, isFirstLaunch } from './init';
import { clearAllData, saveUserProfile, saveProgressMetrics } from './db';
import { userProfile, progressMetrics } from './stores';
import { get } from 'svelte/store';
import type { UserProfile, ProgressMetrics } from './types';

describe('initApp', () => {
    beforeEach(async () => {
        // Clear database before each test
        await clearAllData();
    });

    afterEach(async () => {
        // Clean up after each test
        await clearAllData();
    });

    it('should initialize database successfully', async () => {
        const result = await initApp();
        expect(result).toHaveProperty('isOnboarded');
    });

    it('should return isOnboarded: false for first-time users', async () => {
        const result = await initApp();
        expect(result.isOnboarded).toBe(false);
        expect(get(userProfile)).toBeNull();
        expect(get(progressMetrics)).toBeNull();
    });

    it('should load user profile when one exists', async () => {
        // Create a test user profile
        const testProfile: UserProfile = {
            id: 'test-user-1',
            createdAt: new Date(),
            pi20Score: 75,
            pi20Responses: Array(20).fill(3),
            baselinePerception: 4,
            onboardingComplete: true,
            settings: {
                reminderEnabled: false,
                reminderTime: '09:00',
                trialsPerSession: 60,
            },
        };

        await saveUserProfile(testProfile);

        const result = await initApp();
        expect(result.isOnboarded).toBe(true);

        const loadedProfile = get(userProfile);
        expect(loadedProfile).not.toBeNull();
        expect(loadedProfile?.id).toBe('test-user-1');
        expect(loadedProfile?.pi20Score).toBe(75);
    });

    it('should load progress metrics when they exist', async () => {
        // Create test user and progress
        const testProfile: UserProfile = {
            id: 'test-user-2',
            createdAt: new Date(),
            pi20Score: 70,
            pi20Responses: Array(20).fill(3),
            baselinePerception: 5,
            onboardingComplete: true,
            settings: {
                reminderEnabled: true,
                reminderTime: '10:00',
                trialsPerSession: 50,
            },
        };

        const testMetrics: ProgressMetrics = {
            userId: 'test-user-2',
            currentStreak: 5,
            longestStreak: 10,
            totalSessions: 15,
            totalTrainingTime: 9000,
            avgThreshold: 55.5,
            bestThreshold: 48.0,
            avgAccuracy: 72.5,
            lastSessionDate: new Date(),
            improvementRate: -2.5,
        };

        await saveUserProfile(testProfile);
        await saveProgressMetrics(testMetrics);

        await initApp();

        const loadedMetrics = get(progressMetrics);
        expect(loadedMetrics).not.toBeNull();
        expect(loadedMetrics?.userId).toBe('test-user-2');
        expect(loadedMetrics?.currentStreak).toBe(5);
        expect(loadedMetrics?.totalSessions).toBe(15);
    });

    it('should handle missing progress metrics gracefully', async () => {
        const testProfile: UserProfile = {
            id: 'test-user-3',
            createdAt: new Date(),
            pi20Score: 65,
            pi20Responses: Array(20).fill(3),
            baselinePerception: 6,
            onboardingComplete: false,
            settings: {
                reminderEnabled: false,
                reminderTime: '08:00',
                trialsPerSession: 60,
            },
        };

        await saveUserProfile(testProfile);

        const result = await initApp();
        expect(result.isOnboarded).toBe(false);
        expect(get(userProfile)).not.toBeNull();
        expect(get(progressMetrics)).toBeNull();
    });

    it('should return isOnboarded: false when onboarding incomplete', async () => {
        const testProfile: UserProfile = {
            id: 'test-user-4',
            createdAt: new Date(),
            pi20Score: 80,
            pi20Responses: Array(20).fill(4),
            baselinePerception: 3,
            onboardingComplete: false,
            settings: {
                reminderEnabled: false,
                reminderTime: '09:00',
                trialsPerSession: 60,
            },
        };

        await saveUserProfile(testProfile);

        const result = await initApp();
        expect(result.isOnboarded).toBe(false);
    });
});

describe('isFirstLaunch', () => {
    beforeEach(async () => {
        await clearAllData();
    });

    afterEach(async () => {
        await clearAllData();
    });

    it('should return true when no users exist', async () => {
        const result = await isFirstLaunch();
        expect(result).toBe(true);
    });

    it('should return false when a user exists', async () => {
        const testProfile: UserProfile = {
            id: 'test-user-5',
            createdAt: new Date(),
            pi20Score: 60,
            pi20Responses: Array(20).fill(3),
            baselinePerception: 5,
            onboardingComplete: false,
            settings: {
                reminderEnabled: false,
                reminderTime: '09:00',
                trialsPerSession: 60,
            },
        };

        await saveUserProfile(testProfile);

        const result = await isFirstLaunch();
        expect(result).toBe(false);
    });
});
