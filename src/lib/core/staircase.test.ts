import { describe, it, expect } from 'vitest';
import {
    chooseStartingLevel,
    createStaircaseState,
    updateStaircase,
    calculateThreshold,
    hasConverged,
    getDifficultyPercent,
    DEFAULT_STAIRCASE_CONFIG,
} from './staircase';

// Mid-range start so tests can move both up and down
const MID_CONFIG = { ...DEFAULT_STAIRCASE_CONFIG, startingLevel: 60 };

describe('Staircase Algorithm', () => {
    describe('createStaircaseState', () => {
        it('starts at the easiest level by default', () => {
            expect(createStaircaseState().currentMorphLevel).toBe(88);
        });

        it('should create initial state with default config', () => {
            const state = createStaircaseState(MID_CONFIG);

            expect(state.currentMorphLevel).toBe(60);
            expect(state.consecutiveCorrect).toBe(0);
            expect(state.reversals).toEqual([]);
            expect(state.trialCount).toBe(0);
            expect(state.direction).toBeNull();
        });

        it('should create initial state with custom config', () => {
            const config = { ...DEFAULT_STAIRCASE_CONFIG, startingLevel: 70 };
            const state = createStaircaseState(config);

            expect(state.currentMorphLevel).toBe(70);
        });
    });

    describe('updateStaircase', () => {
        it('should not change difficulty after single correct answer', () => {
            const state = createStaircaseState(MID_CONFIG);
            const updated = updateStaircase(state, true);

            expect(updated.currentMorphLevel).toBe(60);
            expect(updated.consecutiveCorrect).toBe(1);
            expect(updated.trialCount).toBe(1);
        });

        it('should decrease morph level (harder) after 2 correct answers', () => {
            let state = createStaircaseState(MID_CONFIG);
            state = updateStaircase(state, true);
            state = updateStaircase(state, true);

            expect(state.currentMorphLevel).toBe(56); // 60 - 4
            expect(state.consecutiveCorrect).toBe(0);
            expect(state.direction).toBe('down');
        });

        it('should increase morph level (easier) after incorrect answer', () => {
            const state = createStaircaseState(MID_CONFIG);
            const updated = updateStaircase(state, false);

            expect(updated.currentMorphLevel).toBe(64); // 60 + 4
            expect(updated.consecutiveCorrect).toBe(0);
            expect(updated.direction).toBe('up');
        });

        it('should not go below minimum morph level', () => {
            const config = { ...DEFAULT_STAIRCASE_CONFIG, startingLevel: 30 };
            let state = createStaircaseState(config);

            // Make it harder repeatedly
            for (let i = 0; i < 10; i++) {
                state = updateStaircase(state, true);
                state = updateStaircase(state, true);
            }

            expect(state.currentMorphLevel).toBe(28); // Minimum
        });

        it('should not go above maximum morph level', () => {
            const config = { ...DEFAULT_STAIRCASE_CONFIG, startingLevel: 86 };
            let state = createStaircaseState(config);

            // Make it easier repeatedly
            for (let i = 0; i < 10; i++) {
                state = updateStaircase(state, false);
            }

            expect(state.currentMorphLevel).toBe(88); // Maximum
        });

        it('should record reversal when direction changes from up to down', () => {
            let state = createStaircaseState(MID_CONFIG);

            // First go up (incorrect)
            state = updateStaircase(state, false); // 60 → 64, direction = up

            // Then go down (2 correct)
            state = updateStaircase(state, true);
            state = updateStaircase(state, true); // 64 → 60, direction = down

            expect(state.reversals).toHaveLength(1);
            expect(state.reversals[0]).toBe(64);
        });

        it('should record reversal when direction changes from down to up', () => {
            let state = createStaircaseState(MID_CONFIG);

            // First go down (2 correct)
            state = updateStaircase(state, true);
            state = updateStaircase(state, true); // 60 → 56, direction = down

            // Then go up (incorrect)
            state = updateStaircase(state, false); // 56 → 60, direction = up

            expect(state.reversals).toHaveLength(1);
            expect(state.reversals[0]).toBe(56);
        });
    });

    describe('calculateThreshold', () => {
        it('should return null if not enough reversals', () => {
            const state = createStaircaseState(MID_CONFIG);
            const threshold = calculateThreshold(state);

            expect(threshold).toBeNull();
        });

        it('should calculate average of last N reversals', () => {
            const state = createStaircaseState(MID_CONFIG);
            state.reversals = [50, 54, 48, 52, 50, 52, 48, 50];

            const threshold = calculateThreshold(state, 6);

            // Average of last 6: (52 + 50 + 52 + 48 + 50 + 48) / 6 = 50
            expect(threshold).toBe(50);
        });
    });

    describe('hasConverged', () => {
        it('should return false with insufficient reversals', () => {
            const state = createStaircaseState(MID_CONFIG);
            state.reversals = [50, 54, 48];

            expect(hasConverged(state)).toBe(false);
        });

        it('should return true with sufficient reversals', () => {
            const state = createStaircaseState(MID_CONFIG);
            state.reversals = [50, 54, 48, 52, 50, 52, 48, 50];

            expect(hasConverged(state)).toBe(true);
        });
    });

    describe('getDifficultyPercent', () => {
        it('should return 0% for minimum morph level', () => {
            expect(getDifficultyPercent(28)).toBe(0);
        });

        it('should return 100% for maximum morph level', () => {
            expect(getDifficultyPercent(88)).toBe(100);
        });

        it('should return 50% for middle morph level', () => {
            expect(getDifficultyPercent(58)).toBe(50);
        });
    });
});

describe('chooseStartingLevel', () => {
    it('resumes from a saved level, clamped to the valid range', () => {
        expect(chooseStartingLevel(52, 0)).toBe(52);
        expect(chooseStartingLevel(10, 6)).toBe(28);
        expect(chooseStartingLevel(120, 6)).toBe(88);
    });

    it('starts struggling users at the easiest level', () => {
        expect(chooseStartingLevel(undefined, 1)).toBe(88);
    });

    it('starts stronger baselines closer to the middle', () => {
        expect(chooseStartingLevel(undefined, 3)).toBe(76);
        expect(chooseStartingLevel(undefined, 6)).toBe(64);
    });
});
