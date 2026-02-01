/**
 * App initialization logic
 * Handles database initialization and loading user data into stores
 */

import { initDB, getProgressMetrics, getAllUserProfiles } from '$lib/db';
import { setUserProfile, setProgressMetrics } from '$lib/stores';
import { logger } from '$lib/utils/logger';

/**
 * Initialize the FaceIt app
 * - Opens IndexedDB connection
 * - Loads existing user data into stores
 * - Returns whether user has completed onboarding
 */
export async function initApp(): Promise<{ isOnboarded: boolean }> {
    try {
        // Initialize database
        await initDB();
        logger.info('Database initialized');

        // Load user data
        const profiles = await getAllUserProfiles();

        if (profiles.length === 0) {
            // First-time user
            logger.info('No user profile found - first-time user');
            setUserProfile(null);
            setProgressMetrics(null);
            return { isOnboarded: false };
        }

        // For MVP, we only support a single user
        // In future phases, could support multiple users
        const profile = profiles[0];
        logger.info('User profile loaded', { userId: profile.id });

        // Load user profile into store
        setUserProfile(profile);

        // Load progress metrics
        const metrics = await getProgressMetrics(profile.id);
        if (metrics) {
            logger.info('Progress metrics loaded');
            setProgressMetrics(metrics);
        } else {
            logger.info('No progress metrics found');
            setProgressMetrics(null);
        }

        return { isOnboarded: profile.onboardingComplete };
    } catch (error) {
        logger.error('App initialization failed', error);
        throw error;
    }
}

/**
 * Check if this is the first time the app is being launched
 */
export async function isFirstLaunch(): Promise<boolean> {
    try {
        await initDB();
        const profiles = await getAllUserProfiles();
        return profiles.length === 0;
    } catch (error) {
        logger.error('Failed to check first launch', error);
        return true; // Assume first launch if error occurs
    }
}
