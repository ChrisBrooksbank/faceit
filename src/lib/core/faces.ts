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
    const distractorPairs = pickDistinctPairs([pairIndex], 2);
    const distractors = distractorPairs.map(pair =>
        faceIdFor(pair, randomItem(pair.morphLevels) ?? morphLevel)
    );
    const correct = randomIndex(3);

    return {
        target: faceIdFor(targetPair, morphLevel),
        choices: placeCorrectAnswer(faceIdFor(targetPair, morphLevel), distractors, correct),
        correct,
    };
}

export function buildPerceptionTrial(trialIndex: number, morphLevel: number): FaceTrial {
    const pairIndex = trialIndex % FACE_PAIRS.length;
    const targetPair = FACE_PAIRS[pairIndex];
    const distractors = pickDistinctPairs([pairIndex], 2).map(pair => faceUrlFor(pair, morphLevel));
    const target = faceUrlFor(targetPair, morphLevel);
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

function randomItem<T>(items: T[]): T | undefined {
    return items[randomIndex(items.length)];
}

function pickDistinctPairs(excludedIndexes: number[], count: number): FacePair[] {
    const excluded = new Set(excludedIndexes);
    const available = FACE_PAIRS.filter((_, index) => !excluded.has(index));
    const selected: FacePair[] = [];

    while (selected.length < count && available.length > 0) {
        const nextIndex = randomIndex(available.length);
        const [nextPair] = available.splice(nextIndex, 1);
        selected.push(nextPair);
    }

    return selected;
}

function placeCorrectAnswer(target: string, distractors: string[], correct: number): string[] {
    const remaining = [...distractors];
    return Array.from({ length: 3 }, (_, index) =>
        index === correct ? target : (remaining.shift() ?? target)
    );
}
