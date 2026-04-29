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

export function buildTrainingTrial(morphLevel: number): FaceTrial {
    const pairIndex = randomIndex(FACE_PAIRS.length);
    const targetPair = FACE_PAIRS[pairIndex];
    const targetMorphLevel = findClosestMorphLevel(morphLevel);
    const distractors = pickNearbyMorphLevels(targetPair, targetMorphLevel, 2).map(level =>
        faceIdFor(targetPair, level)
    );
    const correct = randomIndex(3);
    const target = faceIdFor(targetPair, targetMorphLevel);

    return {
        target,
        choices: placeCorrectAnswer(target, distractors, correct),
        correct,
    };
}

export function buildPerceptionTrial(trialIndex: number, morphLevel: number): FaceTrial {
    const pairIndex = trialIndex % FACE_PAIRS.length;
    const targetPair = FACE_PAIRS[pairIndex];
    const targetMorphLevel = findClosestMorphLevel(morphLevel);
    const distractors = pickNearbyMorphLevels(targetPair, targetMorphLevel, 2).map(level =>
        faceUrlFor(targetPair, level)
    );
    const target = faceUrlFor(targetPair, targetMorphLevel);
    const correct = randomIndex(3);

    return {
        target,
        choices: placeCorrectAnswer(target, distractors, correct),
        correct,
    };
}

function randomIndex(length: number): number {
    return Math.floor(Math.random() * length);
}

function pickNearbyMorphLevels(pair: FacePair, targetMorphLevel: number, count: number): number[] {
    return pair.morphLevels
        .filter(level => level !== targetMorphLevel)
        .sort((a, b) => Math.abs(a - targetMorphLevel) - Math.abs(b - targetMorphLevel))
        .slice(0, count);
}

function placeCorrectAnswer(target: string, distractors: string[], correct: number): string[] {
    const remaining = [...distractors];
    return Array.from({ length: 3 }, (_, index) =>
        index === correct ? target : (remaining.shift() ?? target)
    );
}
