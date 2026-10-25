import faceMetadata from '$lib/data/face-metadata.json';

/**
 * Identity learning: learn who someone is (a name for a face), then recall it
 * from a different photo. Complements the perceptual discrimination training.
 */

const NAMES = [
    'Alice',
    'Ben',
    'Clara',
    'David',
    'Elena',
    'Frank',
    'Grace',
    'Henry',
    'Isla',
    'Jack',
    'Kara',
    'Liam',
    'Maya',
    'Noah',
    'Olive',
    'Paul',
    'Quinn',
    'Rosa',
    'Sam',
    'Tara',
];

/** Morph level closest to a pure identity (88% of face A) */
const IDENTITY_LEVEL = 88;
const SET_SIZE = 4;
const CHOICES = 3;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export interface LearningIdentity {
    name: string;
    /** Photo shown while learning */
    learnFaceId: string;
    /** A different photo of the same person, shown when recalling */
    recallFaceId: string;
}

export interface RecallTrial {
    faceId: string;
    names: string[];
    correct: number;
}

function toIdentity(
    pair: { faceA: string; faceB: string; smileFiles?: string[] },
    index: number
): LearningIdentity {
    const base = `${pair.faceA}_${pair.faceB}`;
    return {
        name: NAMES[index % NAMES.length],
        learnFaceId: `${base}_${IDENTITY_LEVEL}`,
        recallFaceId: pair.smileFiles
            ? `${base}_smile_${IDENTITY_LEVEL}`
            : `${base}_${IDENTITY_LEVEL}`,
    };
}

const ALL_IDENTITIES: LearningIdentity[] = faceMetadata.facePairs.map(toIdentity);

/** Week number since epoch, so the same people repeat for a whole week */
export function weekIndexFor(date: Date): number {
    return Math.floor(date.getTime() / MS_PER_WEEK);
}

/** The people to learn this week; the set rotates weekly so faces repeat across sessions */
export function identitiesForWeek(weekIndex: number): LearningIdentity[] {
    const start = (weekIndex * SET_SIZE) % ALL_IDENTITIES.length;
    return Array.from(
        { length: SET_SIZE },
        (_, offset) => ALL_IDENTITIES[(start + offset) % ALL_IDENTITIES.length]
    );
}

function shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** One recall trial per identity, in random order, with the other names as distractors */
export function buildRecallTrials(identities: LearningIdentity[]): RecallTrial[] {
    return shuffle(identities).map(identity => {
        const others = shuffle(identities.filter(other => other.name !== identity.name)).slice(
            0,
            CHOICES - 1
        );
        const names = shuffle([identity, ...others]).map(person => person.name);
        return {
            faceId: identity.recallFaceId,
            names,
            correct: names.indexOf(identity.name),
        };
    });
}
