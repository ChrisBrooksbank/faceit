/**
 * Staircase Algorithm for Adaptive Difficulty
 *
 * Implements a 2-down/1-up staircase procedure that converges on ~71% accuracy
 * (a 3-choice task has 33% chance, so this is well above guessing).
 * This is the standard approach in psychophysics for threshold estimation.
 *
 * How it works:
 * - 2 correct in a row → decrease morph level (harder)
 * - 1 incorrect → increase morph level (easier)
 * - Track reversals to estimate threshold
 */

import type { StaircaseState, StaircaseConfig } from '../types';

// Default configuration based on research
export const DEFAULT_STAIRCASE_CONFIG: StaircaseConfig = {
    minMorphLevel: 28, // Hardest (faces very similar)
    maxMorphLevel: 88, // Easiest (faces very different)
    stepSize: 4, // Morph level change per step
    startingLevel: 88, // Easiest: wide morph gaps so struggling users start with visible differences
    targetAccuracy: 0.71, // 2-down/1-up converges on ~70.7% accuracy
};

/**
 * Create initial staircase state
 */
export function createStaircaseState(
    config: StaircaseConfig = DEFAULT_STAIRCASE_CONFIG
): StaircaseState {
    return {
        currentMorphLevel: config.startingLevel,
        consecutiveCorrect: 0,
        reversals: [],
        trialCount: 0,
        direction: null,
    };
}

/**
 * Pick where a session's staircase should begin.
 *
 * Returning users resume from where their last session ended. New users start from
 * the baseline perception test (0-6 correct): people who missed most baseline trials
 * start at the easiest level, people who did well start closer to the middle.
 */
export function chooseStartingLevel(
    savedLevel: number | undefined,
    baselinePerception: number,
    config: StaircaseConfig = DEFAULT_STAIRCASE_CONFIG
): number {
    if (savedLevel !== undefined && Number.isFinite(savedLevel)) {
        return Math.min(Math.max(savedLevel, config.minMorphLevel), config.maxMorphLevel);
    }
    if (baselinePerception >= 5) return 64;
    if (baselinePerception >= 3) return 76;
    return config.startingLevel;
}

/**
 * Update staircase state based on trial response
 *
 * @param state - Current staircase state
 * @param isCorrect - Whether the response was correct
 * @param config - Staircase configuration
 * @returns Updated staircase state
 */
export function updateStaircase(
    state: StaircaseState,
    isCorrect: boolean,
    config: StaircaseConfig = DEFAULT_STAIRCASE_CONFIG
): StaircaseState {
    const newState = { ...state };
    newState.trialCount++;

    if (isCorrect) {
        newState.consecutiveCorrect++;

        // 2-down rule: need 2 correct in a row to make it harder
        if (newState.consecutiveCorrect >= 2) {
            const newLevel = Math.max(
                state.currentMorphLevel - config.stepSize,
                config.minMorphLevel
            );

            // Check for reversal (was going up, now going down)
            if (state.direction === 'up' && newLevel < state.currentMorphLevel) {
                newState.reversals = [...state.reversals, state.currentMorphLevel];
            }

            newState.currentMorphLevel = newLevel;
            newState.consecutiveCorrect = 0;
            newState.direction = 'down';
        }
    } else {
        // 1-up rule: any incorrect makes it easier
        const newLevel = Math.min(state.currentMorphLevel + config.stepSize, config.maxMorphLevel);

        // Check for reversal (was going down, now going up)
        if (state.direction === 'down' && newLevel > state.currentMorphLevel) {
            newState.reversals = [...state.reversals, state.currentMorphLevel];
        }

        newState.currentMorphLevel = newLevel;
        newState.consecutiveCorrect = 0;
        newState.direction = 'up';
    }

    return newState;
}

/**
 * Calculate the perceptual threshold from reversal points
 *
 * The threshold is estimated as the average of the last N reversals.
 * More reversals = more stable estimate.
 *
 * @param state - Current staircase state
 * @param numReversals - Number of reversals to average (default: 6)
 * @returns Estimated threshold, or null if not enough reversals
 */
export function calculateThreshold(state: StaircaseState, numReversals: number = 6): number | null {
    if (state.reversals.length < numReversals) {
        return null;
    }

    const lastReversals = state.reversals.slice(-numReversals);
    const sum = lastReversals.reduce((acc, val) => acc + val, 0);

    return sum / numReversals;
}

/**
 * Check if the staircase has converged (stable threshold estimate)
 *
 * @param state - Current staircase state
 * @param minReversals - Minimum reversals needed (default: 8)
 * @returns Whether the staircase has converged
 */
export function hasConverged(state: StaircaseState, minReversals: number = 8): boolean {
    return state.reversals.length >= minReversals;
}

/**
 * Get current difficulty as a percentage (0-100)
 * Higher = easier
 */
export function getDifficultyPercent(
    morphLevel: number,
    config: StaircaseConfig = DEFAULT_STAIRCASE_CONFIG
): number {
    const range = config.maxMorphLevel - config.minMorphLevel;
    const normalized = (morphLevel - config.minMorphLevel) / range;
    return Math.round(normalized * 100);
}
