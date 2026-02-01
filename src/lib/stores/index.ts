/**
 * Svelte stores for FaceIt app state
 * Provides reactive state management for user profile, training sessions, and progress
 */

import { writable, derived, type Readable } from 'svelte/store';
import type { UserProfile, TrainingSession, ProgressMetrics } from '$lib/types';

// ============================================
// Core Stores
// ============================================

/**
 * Current user profile
 * Null when no user is logged in or onboarding not complete
 */
export const userProfile = writable<UserProfile | null>(null);

/**
 * Current active training session
 * Null when no session is in progress
 */
export const currentSession = writable<TrainingSession | null>(null);

/**
 * Progress metrics for the current user
 * Null when no progress data exists
 */
export const progressMetrics = writable<ProgressMetrics | null>(null);

// ============================================
// Derived Stores
// ============================================

/**
 * Whether the user has completed onboarding
 */
export const isOnboarded: Readable<boolean> = derived(
    userProfile,
    $userProfile => $userProfile?.onboardingComplete ?? false
);

/**
 * Whether the user has completed a session today
 */
export const hasSessionToday: Readable<boolean> = derived(progressMetrics, $progressMetrics => {
    if (!$progressMetrics?.lastSessionDate) {
        return false;
    }

    const today = new Date();
    const lastSession = new Date($progressMetrics.lastSessionDate);

    return (
        today.getFullYear() === lastSession.getFullYear() &&
        today.getMonth() === lastSession.getMonth() &&
        today.getDate() === lastSession.getDate()
    );
});

/**
 * Current training streak (days)
 */
export const currentStreak: Readable<number> = derived(
    progressMetrics,
    $progressMetrics => $progressMetrics?.currentStreak ?? 0
);

// ============================================
// Store Actions
// ============================================

/**
 * Update user profile store
 */
export function setUserProfile(profile: UserProfile | null): void {
    userProfile.set(profile);
}

/**
 * Update current session store
 */
export function setCurrentSession(session: TrainingSession | null): void {
    currentSession.set(session);
}

/**
 * Update progress metrics store
 */
export function setProgressMetrics(metrics: ProgressMetrics | null): void {
    progressMetrics.set(metrics);
}

/**
 * Reset all stores to initial state
 */
export function resetStores(): void {
    userProfile.set(null);
    currentSession.set(null);
    progressMetrics.set(null);
}
