import faceMetadata from '$lib/data/face-metadata.json';

interface FacePair {
    id: number;
    faceA: string;
    faceB: string;
    morphLevels: number[];
    files: string[];
}

export interface FaceTrial {
    target: string;
    choices: string[];
    correct: number;
}

const FACE_PAIRS: FacePair[] = faceMetadata.facePairs;
const MORPH_LEVELS: number[] = faceMetadata.morphLevels;
export const FACE_SOURCE = {
    name: faceMetadata.source,
    url: faceMetadata.sourceUrl,
    doi: faceMetadata.doi,
    license: faceMetadata.license,
};

function faceIdFor(pair: FacePair, morphLevel: number): string {
    return `${pair.faceA}_${pair.faceB}_${morphLevel}`;
}

function faceUrlFor(pair: FacePair, morphLevel: number): string {
    return `/faces/${faceIdFor(pair, morphLevel)}.jpg`;
}

export function findClosestMorphLevel(target: number): number {
    return MORPH_LEVELS.reduce((prev, curr) =>
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
}

const MORPH_STEP = 12;
const MAX_GAP_STEPS = 4;

/**
 * Difficulty is the morph distance between the target and its distractors:
 * a small gap means near-identical images (hard), a large gap means obviously
 * different ones (easy). The staircase level (28 = hard ... 88 = easy) maps onto
 * gaps of 12, 24, 36 and 48 morph units.
 */
export function gapForDifficulty(difficultyLevel: number): number {
    const steps = 1 + Math.floor((difficultyLevel - 28) / 15);
    return MORPH_STEP * Math.min(Math.max(steps, 1), MAX_GAP_STEPS);
}

function distractorLevelsFor(pair: FacePair, target: number, gap: number): number[] {
    return pair.morphLevels
        .filter(level => Math.abs(level - target) >= gap)
        .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
        .slice(0, 2);
}

function validTargetLevels(pair: FacePair, gap: number): number[] {
    return pair.morphLevels.filter(level => distractorLevelsFor(pair, level, gap).length === 2);
}

function buildTrial(
    pair: FacePair,
    difficultyLevel: number,
    pickIndex: (length: number) => number,
    toId: (pair: FacePair, level: number) => string
): FaceTrial {
    const gap = gapForDifficulty(difficultyLevel);
    const candidates = validTargetLevels(pair, gap);
    const targetLevel = candidates[pickIndex(candidates.length)];
    const distractors = distractorLevelsFor(pair, targetLevel, gap).map(level => toId(pair, level));
    const correct = randomIndex(3);
    const target = toId(pair, targetLevel);

    return {
        target,
        choices: placeCorrectAnswer(target, distractors, correct),
        correct,
    };
}

export function buildTrainingTrial(difficultyLevel: number): FaceTrial {
    return buildTrial(
        FACE_PAIRS[randomIndex(FACE_PAIRS.length)],
        difficultyLevel,
        randomIndex,
        faceIdFor
    );
}

export function buildPerceptionTrial(trialIndex: number, difficultyLevel: number): FaceTrial {
    return buildTrial(
        FACE_PAIRS[trialIndex % FACE_PAIRS.length],
        difficultyLevel,
        length => trialIndex % length,
        faceUrlFor
    );
}

function randomIndex(length: number): number {
    return Math.floor(Math.random() * length);
}

function placeCorrectAnswer(target: string, distractors: string[], correct: number): string[] {
    const remaining = [...distractors];
    return Array.from({ length: 3 }, (_, index) =>
        index === correct ? target : (remaining.shift() ?? target)
    );
}
