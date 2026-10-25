import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { calculateStreak, calculateImprovement, updateProgressMetrics } from './progress';
import type { TrainingSession, ProgressMetrics } from '$lib/types';
import * as db from '$lib/db';

// Mock the db module
vi.mock('$lib/db', () => ({
    getSessionsByDate: vi.fn(),
    getProgressMetrics: vi.fn(),
    saveProgressMetrics: vi.fn(),
}));

describe('calculateStreak', () => {
    it('returns 0 for empty sessions array', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('returns 0 when no completed sessions', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', false),
            createSession('2026-01-16', false),
        ];
        expect(calculateStreak(sessions)).toBe(0);
    });

    it('calculates 1-day streak for single session today', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [createSession('2026-01-20', true)];
        expect(calculateStreak(sessions, today)).toBe(1);
    });

    it('calculates multi-day streak for consecutive days', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [
            createSession('2026-01-18', true),
            createSession('2026-01-19', true),
            createSession('2026-01-20', true),
        ];
        expect(calculateStreak(sessions, today)).toBe(3);
    });

    it('calculates streak correctly when multiple sessions on same day', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [
            createSession('2026-01-18', true),
            createSession('2026-01-19', true),
            createSession('2026-01-19', true), // Second session same day
            createSession('2026-01-20', true),
        ];
        expect(calculateStreak(sessions, today)).toBe(3);
    });

    it('breaks streak when there is a gap', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', true),
            createSession('2026-01-16', true),
            // Gap on 01-17
            createSession('2026-01-18', true),
            createSession('2026-01-19', true),
            createSession('2026-01-20', true),
        ];
        expect(calculateStreak(sessions, today)).toBe(3);
    });

    it('returns 0 when last session was not today or yesterday', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', true),
            createSession('2026-01-16', true),
            createSession('2026-01-17', true),
        ];
        expect(calculateStreak(sessions, today)).toBe(0);
    });

    it('handles sessions in different order', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [
            createSession('2026-01-20', true),
            createSession('2026-01-18', true),
            createSession('2026-01-19', true),
        ];
        expect(calculateStreak(sessions, today)).toBe(3);
    });

    it('ignores incomplete sessions in streak calculation', () => {
        const today = new Date('2026-01-20');
        const sessions: TrainingSession[] = [
            createSession('2026-01-18', true),
            createSession('2026-01-19', false), // Incomplete
            createSession('2026-01-20', true),
        ];
        expect(calculateStreak(sessions, today)).toBe(1);
    });
});

describe('calculateImprovement', () => {
    it('returns 0 for empty sessions array', () => {
        expect(calculateImprovement([], 60)).toBe(0);
    });

    it('returns 0 when no completed sessions', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', false, 50),
            createSession('2026-01-16', false, 45),
        ];
        expect(calculateImprovement(sessions, 60)).toBe(0);
    });

    it('calculates positive improvement when threshold decreases', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', true, 55),
            createSession('2026-01-17', true, 50),
        ];
        const improvement = calculateImprovement(sessions, 60);
        expect(improvement).toBeGreaterThan(0);
        // Average recent threshold = (60 + 55 + 50) / 3 = 55
        // Improvement = (60 - 55) / 60 * 100 = 8.3%
        expect(improvement).toBeCloseTo(8.3, 0);
    });

    it('calculates negative improvement when threshold increases', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', true, 50),
            createSession('2026-01-16', true, 55),
            createSession('2026-01-17', true, 60),
        ];
        const improvement = calculateImprovement(sessions, 50);
        expect(improvement).toBeLessThan(0);
        // Average recent threshold = (50 + 55 + 60) / 3 = 55
        // Improvement = (50 - 55) / 50 * 100 = -10%
        expect(improvement).toBeCloseTo(-10, 0);
    });

    it('uses last 7 sessions for calculation when more available', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-10', true, 70),
            createSession('2026-01-11', true, 68),
            createSession('2026-01-12', true, 66),
            createSession('2026-01-13', true, 64),
            createSession('2026-01-14', true, 62),
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', true, 58),
            createSession('2026-01-17', true, 56),
            createSession('2026-01-18', true, 54),
        ];
        const improvement = calculateImprovement(sessions, 70);
        // Should use last 7 sessions: 66, 64, 62, 60, 58, 56, 54
        // Average = (66 + 64 + 62 + 60 + 58 + 56 + 54) / 7 = 60
        // Improvement = (70 - 60) / 70 * 100 = 14.3%
        expect(improvement).toBeCloseTo(14.3, 0);
    });

    it('uses all sessions when fewer than 7', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', true, 55),
        ];
        const improvement = calculateImprovement(sessions, 60);
        // Average = (60 + 55) / 2 = 57.5
        // Improvement = (60 - 57.5) / 60 * 100 = 4.2%
        expect(improvement).toBeCloseTo(4.2, 0);
    });

    it('rounds result to 1 decimal place', () => {
        const sessions: TrainingSession[] = [createSession('2026-01-15', true, 55.555)];
        const improvement = calculateImprovement(sessions, 60);
        const decimalPlaces = improvement.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
    });

    it('ignores incomplete sessions', () => {
        const sessions: TrainingSession[] = [
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', false, 40), // Should be ignored
            createSession('2026-01-17', true, 55),
        ];
        const improvement = calculateImprovement(sessions, 60);
        // Average = (60 + 55) / 2 = 57.5
        // Improvement = (60 - 57.5) / 60 * 100 = 4.2%
        expect(improvement).toBeCloseTo(4.2, 0);
    });
});

describe('updateProgressMetrics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set system time to 2026-01-20 for consistent testing
        vi.setSystemTime(new Date('2026-01-20T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('throws error when progress metrics not found', async () => {
        vi.mocked(db.getProgressMetrics).mockResolvedValue(undefined);
        vi.mocked(db.getSessionsByDate).mockResolvedValue([]);

        await expect(updateProgressMetrics('user-1')).rejects.toThrow('Progress metrics not found');
    });

    it('updates all metrics correctly after first completed session', async () => {
        const session = createSession('2026-01-20', true, 55, 85.5);
        const currentMetrics = createProgressMetrics('user-1');

        vi.mocked(db.getSessionsByDate).mockResolvedValue([session]);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.currentStreak).toBe(1);
        expect(updated.longestStreak).toBe(1);
        expect(updated.totalSessions).toBe(1);
        expect(updated.totalTrainingTime).toBe(session.duration);
        expect(updated.avgThreshold).toBe(55);
        expect(updated.bestThreshold).toBe(55);
        expect(updated.avgAccuracy).toBe(85.5);
        expect(updated.lastSessionDate).toEqual(session.date);
        expect(db.saveProgressMetrics).toHaveBeenCalledWith(updated);
    });

    it('updates streak correctly for consecutive days', async () => {
        const sessions = [
            createSession('2026-01-18', true, 60),
            createSession('2026-01-19', true, 58),
            createSession('2026-01-20', true, 56),
        ];
        const currentMetrics = createProgressMetrics('user-1', 2, 2);

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.currentStreak).toBe(3);
        expect(updated.longestStreak).toBe(3);
    });

    it('preserves longest streak when current streak is lower', async () => {
        const sessions = [
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', true, 58),
            // Gap
            createSession('2026-01-20', true, 56),
        ];
        const currentMetrics = createProgressMetrics('user-1', 2, 5); // Longest was 5

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.currentStreak).toBe(1);
        expect(updated.longestStreak).toBe(5); // Preserved
    });

    it('calculates averages correctly across multiple sessions', async () => {
        const sessions = [
            createSession('2026-01-15', true, 60, 80),
            createSession('2026-01-16', true, 55, 85),
            createSession('2026-01-17', true, 50, 90),
        ];
        const currentMetrics = createProgressMetrics('user-1');

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.totalSessions).toBe(3);
        expect(updated.avgThreshold).toBe(55); // (60 + 55 + 50) / 3 = 55
        expect(updated.avgAccuracy).toBe(85); // (80 + 85 + 90) / 3 = 85
        expect(updated.bestThreshold).toBe(50); // Min threshold
    });

    it('ignores incomplete sessions in calculations', async () => {
        const sessions = [
            createSession('2026-01-15', true, 60, 80),
            createSession('2026-01-16', false, 40, 60), // Incomplete
            createSession('2026-01-17', true, 55, 85),
        ];
        const currentMetrics = createProgressMetrics('user-1');

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.totalSessions).toBe(2); // Only completed sessions
        expect(updated.avgThreshold).toBe(57.5); // (60 + 55) / 2
        expect(updated.avgAccuracy).toBe(82.5); // (80 + 85) / 2
    });

    it('calculates total training time correctly', async () => {
        const sessions = [
            { ...createSession('2026-01-15', true), duration: 600 }, // 10 min
            { ...createSession('2026-01-16', true), duration: 720 }, // 12 min
            { ...createSession('2026-01-17', true), duration: 540 }, // 9 min
        ];
        const currentMetrics = createProgressMetrics('user-1');

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.totalTrainingTime).toBe(1860); // 600 + 720 + 540
    });

    it('reports no improvement until sessions exist beyond the baseline sessions', async () => {
        const sessions = [
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', true, 50),
            createSession('2026-01-17', true, 40),
        ];

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(createProgressMetrics('user-1'));
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.improvementRate).toBe(0);
    });

    it('uses the average of the first three sessions as the baseline', async () => {
        const sessions = [
            createSession('2026-01-15', true, 70),
            createSession('2026-01-16', true, 60),
            createSession('2026-01-17', true, 50),
            createSession('2026-01-18', true, 48),
        ];

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(createProgressMetrics('user-1'));
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.improvementRate).toBe(20); // baseline 60, recent 48
    });

    it('calculates improvement rate based on early session thresholds', async () => {
        const sessions = [
            createSession('2026-01-15', true, 60),
            createSession('2026-01-16', true, 58),
            createSession('2026-01-17', true, 56),
            createSession('2026-01-18', true, 54),
        ];
        const currentMetrics = createProgressMetrics('user-1');

        vi.mocked(db.getSessionsByDate).mockResolvedValue(sessions);
        vi.mocked(db.getProgressMetrics).mockResolvedValue(currentMetrics);
        vi.mocked(db.saveProgressMetrics).mockResolvedValue();

        const updated = await updateProgressMetrics('user-1');

        expect(updated.improvementRate).toBeGreaterThan(0); // Threshold decreased
    });
});

// Helper functions
function createSession(
    dateStr: string,
    completed: boolean,
    thresholdLevel = 60,
    accuracy = 75
): TrainingSession {
    return {
        id: `session-${dateStr}`,
        date: new Date(dateStr),
        duration: 600,
        trialsCompleted: 50,
        trialsTotal: 50,
        accuracy,
        thresholdLevel,
        thresholdHistory: [60, 58, 56],
        trials: [],
        completed,
    };
}

function createProgressMetrics(
    userId: string,
    currentStreak = 0,
    longestStreak = 0
): ProgressMetrics {
    return {
        userId,
        currentStreak,
        longestStreak,
        totalSessions: 0,
        totalTrainingTime: 0,
        avgThreshold: 0,
        bestThreshold: 100,
        avgAccuracy: 0,
        lastSessionDate: null,
        improvementRate: 0,
    };
}
