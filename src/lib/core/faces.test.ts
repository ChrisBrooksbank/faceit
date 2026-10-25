import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPerceptionTrial, buildTrainingTrial, gapForDifficulty } from './faces';

const FACE_ID_PATTERN = /face\d+_face\d+(?:_smile)?_(\d+)/;
const FACE_URL_PATTERN = /\/faces\/face\d+_face\d+_(\d+)\.jpg/;

function facePairKey(faceId: string): string {
    return faceId.replace(/(_smile)?_(28|40|52|64|76|88)(\.jpg)?$/, '');
}

function morphLevelFrom(value: string, pattern: RegExp): number {
    const match = value.match(pattern);

    if (!match) {
        throw new Error(`Unexpected face value: ${value}`);
    }

    return Number(match[1]);
}

describe('face trial generation', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('builds training choices from the same identity pair', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const trial = buildTrainingTrial(64);
        const targetPair = facePairKey(trial.target);
        const choicePairs = trial.choices.map(facePairKey);

        expect(choicePairs).toEqual([targetPair, targetPair, targetPair]);
        expect(trial.choices).toContain(trial.target);
        expect(new Set(trial.choices).size).toBe(3);
    });

    it('uses the smallest morph gap for the hardest training level', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);

        const trial = buildTrainingTrial(28);
        const levels = trial.choices.map(choice => morphLevelFrom(choice, FACE_ID_PATTERN));
        const targetLevel = morphLevelFrom(trial.target, FACE_ID_PATTERN);

        expect(levels.filter(l => l !== targetLevel).map(l => Math.abs(l - targetLevel))).toEqual(
            expect.arrayContaining([12])
        );
    });

    it('makes distractors further from the target as difficulty gets easier', () => {
        const minGap = (level: number): number => {
            const trial = buildTrainingTrial(level);
            const target = morphLevelFrom(trial.target, FACE_ID_PATTERN);
            return Math.min(
                ...trial.choices
                    .map(choice => Math.abs(morphLevelFrom(choice, FACE_ID_PATTERN) - target))
                    .filter(gap => gap > 0)
            );
        };

        for (let i = 0; i < 50; i++) {
            expect(minGap(28)).toBe(12);
            expect(minGap(88)).toBe(48);
        }
        expect(gapForDifficulty(60)).toBe(36);
    });

    it('asks for a match across different photos at hard levels', () => {
        const trial = buildTrainingTrial(28);

        expect(trial.differentPhoto).toBe(true);
        expect(trial.target).not.toContain('_smile');
        expect(trial.choices.every(choice => choice.includes('_smile_'))).toBe(true);
        expect(trial.choices[trial.correct]).toBe(trial.target.replace(/_(\d+)$/, '_smile_$1'));
    });

    it('keeps the same photo for the target and answer at easy levels', () => {
        const trial = buildTrainingTrial(88);

        expect(trial.differentPhoto).toBe(false);
        expect(trial.choices[trial.correct]).toBe(trial.target);
    });

    it('avoids pairs already used in the session until they run out', () => {
        const used = new Set<number>();
        const seen: number[] = [];
        for (let i = 0; i < 40; i++) {
            const trial = buildTrainingTrial(88, used);
            seen.push(trial.pairId);
            used.add(trial.pairId);
        }
        expect(new Set(seen).size).toBe(40);

        expect(buildTrainingTrial(88, used).pairId).toBeGreaterThan(0);
    });

    it('builds perception choices from the same identity pair', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const trial = buildPerceptionTrial(0, 76);
        const targetPair = facePairKey(trial.target);
        const choicePairs = trial.choices.map(facePairKey);

        expect(choicePairs).toEqual([targetPair, targetPair, targetPair]);
        expect(trial.choices).toContain(trial.target);
        expect(new Set(trial.choices).size).toBe(3);
    });

    it('uses a wider morph gap for easy perception trials', () => {
        const trial = buildPerceptionTrial(0, 88);
        const levels = trial.choices.map(choice => morphLevelFrom(choice, FACE_URL_PATTERN));
        const target = morphLevelFrom(trial.target, FACE_URL_PATTERN);

        expect(levels.filter(l => l !== target).every(l => Math.abs(l - target) >= 48)).toBe(true);
    });
});
