import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPerceptionTrial, buildTrainingTrial } from './faces';

const FACE_ID_PATTERN = /face\d+_face\d+_(\d+)/;
const FACE_URL_PATTERN = /\/faces\/face\d+_face\d+_(\d+)\.jpg/;

function facePairKey(faceId: string): string {
    return faceId.replace(/_(28|40|52|64|76|88)(\.jpg)?$/, '');
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

    it('uses nearby morph levels as training distractors', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const trial = buildTrainingTrial(64);
        const choiceLevels = trial.choices.map(choice => morphLevelFrom(choice, FACE_ID_PATTERN));

        expect(choiceLevels.sort((a, b) => a - b)).toEqual([52, 64, 76]);
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

    it('uses nearby morph levels as perception distractors', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const trial = buildPerceptionTrial(0, 76);
        const choiceLevels = trial.choices.map(choice => morphLevelFrom(choice, FACE_URL_PATTERN));

        expect(choiceLevels.sort((a, b) => a - b)).toEqual([64, 76, 88]);
    });
});
