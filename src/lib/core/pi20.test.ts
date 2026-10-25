import { describe, it, expect } from 'vitest';
import {
    PI20_QUESTIONS,
    scorePI20Item,
    calculatePI20Score,
    getPI20Severity,
    estimatePI20Percentile,
    getPI20Result,
    getPI20Interpretation,
} from './pi20';
import type { PI20Response } from '../types';

describe('PI20 Assessment', () => {
    describe('PI20_QUESTIONS', () => {
        it('should have exactly 20 questions', () => {
            expect(PI20_QUESTIONS).toHaveLength(20);
        });

        it('should have items 8, 9, 13, 17 and 19 marked as reverse-scored', () => {
            const reversed = PI20_QUESTIONS.filter(q => q.reverseScored).map(q => q.id);
            expect(reversed).toEqual([8, 9, 13, 17, 19]);
        });

        it('should have all other items not reverse-scored', () => {
            const nonReversed = PI20_QUESTIONS.filter(q => ![8, 9, 13, 17, 19].includes(q.id));
            expect(nonReversed.every(q => !q.reverseScored)).toBe(true);
        });
    });

    describe('scorePI20Item', () => {
        it('should return raw score for non-reversed items', () => {
            expect(scorePI20Item(1, false)).toBe(1);
            expect(scorePI20Item(3, false)).toBe(3);
            expect(scorePI20Item(5, false)).toBe(5);
        });

        it('should reverse score for reversed items', () => {
            expect(scorePI20Item(1, true)).toBe(5);
            expect(scorePI20Item(2, true)).toBe(4);
            expect(scorePI20Item(3, true)).toBe(3);
            expect(scorePI20Item(4, true)).toBe(2);
            expect(scorePI20Item(5, true)).toBe(1);
        });
    });

    describe('calculatePI20Score', () => {
        it('should calculate minimum score (all 1s)', () => {
            const responses: PI20Response[] = Array(20).fill(1);
            // 5 reverse-scored items: 1 → 5, so min = 15*1 + 5*5 = 40
            expect(calculatePI20Score(responses)).toBe(40);
        });

        it('should calculate maximum score (all 5s)', () => {
            const responses: PI20Response[] = Array(20).fill(5);
            // 5 reverse-scored items: 5 → 1, so max = 15*5 + 5*1 = 80
            expect(calculatePI20Score(responses)).toBe(80);
        });

        it('should calculate middle score (all 3s)', () => {
            const responses: PI20Response[] = Array(20).fill(3);
            // Reverse-scored items: 3 → 3, so = 20*3 = 60
            expect(calculatePI20Score(responses)).toBe(60);
        });

        it('should throw error for wrong number of responses', () => {
            expect(() => calculatePI20Score([1, 2, 3] as PI20Response[])).toThrow(
                'Expected 20 responses'
            );
        });

        it('should handle mixed responses correctly', () => {
            // Create specific pattern
            // Reverse-scored items (8, 9, 13, 17, 19) answered 1, the rest 5
            const reversed = [8, 9, 13, 17, 19];
            const responses = Array.from({ length: 20 }, (_, i) =>
                reversed.includes(i + 1) ? 1 : 5
            ) as PI20Response[];
            expect(calculatePI20Score(responses)).toBe(100);
        });
    });

    describe('getPI20Severity', () => {
        it('should return typical for scores below 65', () => {
            expect(getPI20Severity(20)).toBe('typical');
            expect(getPI20Severity(50)).toBe('typical');
            expect(getPI20Severity(64)).toBe('typical');
        });

        it('should return mild for scores 65-74', () => {
            expect(getPI20Severity(65)).toBe('mild');
            expect(getPI20Severity(70)).toBe('mild');
            expect(getPI20Severity(74)).toBe('mild');
        });

        it('should return moderate for scores 75-84', () => {
            expect(getPI20Severity(75)).toBe('moderate');
            expect(getPI20Severity(80)).toBe('moderate');
            expect(getPI20Severity(84)).toBe('moderate');
        });

        it('should return severe for scores 85+', () => {
            expect(getPI20Severity(85)).toBe('severe');
            expect(getPI20Severity(100)).toBe('severe');
        });
    });

    describe('estimatePI20Percentile', () => {
        it('should return low percentile for low scores', () => {
            expect(estimatePI20Percentile(20)).toBe(5);
        });

        it('should return 50th percentile around mean', () => {
            expect(estimatePI20Percentile(39)).toBe(50);
        });

        it('should return high percentile for high scores', () => {
            expect(estimatePI20Percentile(70)).toBe(99);
        });
    });

    describe('getPI20Result', () => {
        it('should return complete result object', () => {
            const responses: PI20Response[] = Array(20).fill(3);
            const result = getPI20Result(responses);

            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('severity');
            expect(result).toHaveProperty('percentile');
            expect(result.score).toBe(60);
            expect(result.severity).toBe('typical');
        });
    });

    describe('getPI20Interpretation', () => {
        it('should return appropriate text for each severity', () => {
            expect(getPI20Interpretation('typical')).toContain('typical range');
            expect(getPI20Interpretation('mild')).toContain('mild difficulties');
            expect(getPI20Interpretation('moderate')).toContain('moderate');
            expect(getPI20Interpretation('severe')).toContain('significant');
        });
    });
});
