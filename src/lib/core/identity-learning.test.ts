import { describe, it, expect } from 'vitest';
import {
    buildRecallTrials,
    identitiesForWeek,
    weekIndexFor,
    type LearningIdentity,
} from './identity-learning';

describe('identity learning', () => {
    it('returns the same people within a week and rotates the next week', () => {
        const week = weekIndexFor(new Date('2026-03-02T10:00:00Z'));
        const sameWeek = weekIndexFor(new Date('2026-03-04T10:00:00Z'));
        expect(week).toBe(sameWeek);
        const names = identitiesForWeek(week).map(person => person.name);
        expect(new Set(names).size).toBe(4);
        expect(identitiesForWeek(sameWeek).map(person => person.name)).toEqual(names);
        expect(identitiesForWeek(week + 1).map(person => person.name)).not.toEqual(names);
    });

    it('uses a different photo for recall than for learning', () => {
        const [person] = identitiesForWeek(0);
        expect(person.recallFaceId).not.toBe(person.learnFaceId);
        expect(person.recallFaceId).toContain('_smile_');
    });

    it('builds one recall trial per identity with the right name at the correct index', () => {
        const identities = identitiesForWeek(3);
        const trials = buildRecallTrials(identities);
        expect(trials).toHaveLength(identities.length);
        for (const trial of trials) {
            const owner = identities.find(
                (person: LearningIdentity) => person.recallFaceId === trial.faceId
            );
            expect(trial.names).toHaveLength(3);
            expect(new Set(trial.names).size).toBe(3);
            expect(trial.names[trial.correct]).toBe(owner?.name);
        }
    });
});
