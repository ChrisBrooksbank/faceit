/**
 * Progress calculation logic for FaceIt
 * Provides functions to calculate streaks, improvement rates, and update metrics
 */

import type { TrainingSession, ProgressMetrics } from '$lib/types';
import { getSessionsByDate, getProgressMetrics, saveProgressMetrics } from '$lib/db';

/**
 * Calculate consecutive day streak from sessions
 * @param sessions - All training sessions sorted by date (oldest first)
 * @param referenceDate - Date to calculate streak from (defaults to today)
 * @returns Number of consecutive days with completed sessions
 */
export function calculateStreak(sessions: TrainingSession[], referenceDate = new Date()): number {
    if (sessions.length === 0) return 0;

    // Filter only completed sessions
    const completedSessions = sessions.filter(s => s.completed);
    if (completedSessions.length === 0) return 0;

    // Get unique training dates (normalize to start of day)
    const uniqueDates = Array.from(
        new Set(
            completedSessions.map(s => {
                const date = new Date(s.date);
                return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            })
        )
    ).sort((a, b) => b - a); // Sort descending (most recent first)

    // Normalize reference date to start of day
    const today = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        referenceDate.getDate()
    ).getTime();

    let streak = 0;
    let expectedDate = today;

    for (const dateTime of uniqueDates) {
        if (dateTime === expectedDate) {
            streak++;
            expectedDate -= 24 * 60 * 60 * 1000; // Move back one day
        } else if (dateTime < expectedDate) {
            // Gap found, streak broken
            break;
        }
    }

    return streak;
}

/**
 * Calculate improvement rate from sessions
 * Compares average threshold of recent sessions vs baseline
 * @param sessions - All training sessions sorted by date (oldest first)
 * @param baselineThreshold - Initial threshold from onboarding perception test
 * @returns Improvement rate as percentage (positive = improvement, negative = decline)
 */
export function calculateImprovement(
    sessions: TrainingSession[],
    baselineThreshold: number
): number {
    // Filter only completed sessions
    const completedSessions = sessions.filter(s => s.completed);
    if (completedSessions.length === 0) return 0;

    // Calculate average threshold of recent sessions (last 7 sessions or all if fewer)
    const recentSessions = completedSessions.slice(-7);
    const avgRecentThreshold =
        recentSessions.reduce((sum, s) => sum + s.thresholdLevel, 0) / recentSessions.length;

    // Lower threshold = better performance (faces more similar = harder)
    // Improvement = (baseline - recent) / baseline * 100
    const improvement = ((baselineThreshold - avgRecentThreshold) / baselineThreshold) * 100;

    return Math.round(improvement * 10) / 10; // Round to 1 decimal place
}

/** Number of first training sessions averaged to form the improvement baseline */
const BASELINE_SESSION_COUNT = 3;

/**
 * Improvement relative to the user's own early training, not the onboarding perception
 * test (6 trials, chance is about 2/6, so too noisy to anchor on).
 * Averages the first few sessions as the baseline and compares later sessions against it.
 * Returns 0 until at least one session exists beyond the baseline sessions.
 * @param completedSessions - Completed sessions sorted by date (oldest first)
 */
function improvementFromTrainingBaseline(completedSessions: TrainingSession[]): number {
    if (completedSessions.length <= BASELINE_SESSION_COUNT) return 0;

    const baselineSessions = completedSessions.slice(0, BASELINE_SESSION_COUNT);
    const baselineThreshold =
        baselineSessions.reduce((sum, s) => sum + s.thresholdLevel, 0) / baselineSessions.length;

    return calculateImprovement(completedSessions.slice(BASELINE_SESSION_COUNT), baselineThreshold);
}

/**
 * Update progress metrics for a user after completing a session
 * Recalculates all metrics based on session history
 * @param userId - User ID to update metrics for
 * @returns Updated progress metrics
 */
export async function updateProgressMetrics(userId: string): Promise<ProgressMetrics> {
    // Get all sessions for this user
    const allSessions = await getSessionsByDate();

    // Get current progress metrics
    const currentMetrics = await getProgressMetrics(userId);
    if (!currentMetrics) {
        throw new Error(`Progress metrics not found for user ${userId}`);
    }

    // Filter only completed sessions
    const completedSessions = allSessions.filter(s => s.completed);

    // Calculate streak
    const currentStreak = calculateStreak(allSessions);

    // Calculate total sessions and training time
    const totalSessions = completedSessions.length;
    const totalTrainingTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);

    // Calculate best (lowest) threshold
    const bestThreshold =
        completedSessions.length > 0
            ? Math.min(...completedSessions.map(s => s.thresholdLevel))
            : currentMetrics.bestThreshold;

    // Calculate average threshold
    const avgThreshold =
        completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.thresholdLevel, 0) /
              completedSessions.length
            : 0;

    // Calculate average accuracy
    const avgAccuracy =
        completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.accuracy, 0) / completedSessions.length
            : 0;

    const improvementRate = improvementFromTrainingBaseline(completedSessions);

    // Get last session date
    const lastSessionDate =
        completedSessions.length > 0
            ? completedSessions[completedSessions.length - 1].date
            : currentMetrics.lastSessionDate;

    // Update metrics
    const updatedMetrics: ProgressMetrics = {
        ...currentMetrics,
        currentStreak,
        longestStreak: Math.max(currentStreak, currentMetrics.longestStreak),
        totalSessions,
        totalTrainingTime,
        avgThreshold: Math.round(avgThreshold * 10) / 10,
        bestThreshold,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10,
        lastSessionDate,
        improvementRate,
    };

    // Save updated metrics
    await saveProgressMetrics(updatedMetrics);

    return updatedMetrics;
}
