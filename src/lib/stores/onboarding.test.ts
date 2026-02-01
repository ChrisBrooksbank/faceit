import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
    onboardingData,
    setPI20Responses,
    setPerceptionScore,
    resetOnboardingData,
} from './onboarding';
import type { PI20Response } from '$lib/types';

describe('onboarding store', () => {
    beforeEach(() => {
        resetOnboardingData();
    });

    describe('initial state', () => {
        it('should initialize with empty PI20 responses', () => {
            const data = get(onboardingData);
            expect(data.pi20Responses).toHaveLength(20);
            expect(data.pi20Responses.every(r => r === null)).toBe(true);
        });

        it('should initialize with null perception score', () => {
            const data = get(onboardingData);
            expect(data.perceptionScore).toBeNull();
        });
    });

    describe('setPI20Responses', () => {
        it('should update PI20 responses', () => {
            const responses: PI20Response[] = Array(20).fill(3 as PI20Response);
            setPI20Responses(responses);

            const data = get(onboardingData);
            expect(data.pi20Responses).toEqual(responses);
        });

        it('should preserve perception score when updating PI20 responses', () => {
            setPerceptionScore(5);
            const responses: PI20Response[] = Array(20).fill(2 as PI20Response);
            setPI20Responses(responses);

            const data = get(onboardingData);
            expect(data.pi20Responses).toEqual(responses);
            expect(data.perceptionScore).toBe(5);
        });
    });

    describe('setPerceptionScore', () => {
        it('should update perception score', () => {
            setPerceptionScore(4);

            const data = get(onboardingData);
            expect(data.perceptionScore).toBe(4);
        });

        it('should preserve PI20 responses when updating perception score', () => {
            const responses: PI20Response[] = Array(20).fill(1 as PI20Response);
            setPI20Responses(responses);
            setPerceptionScore(6);

            const data = get(onboardingData);
            expect(data.pi20Responses).toEqual(responses);
            expect(data.perceptionScore).toBe(6);
        });
    });

    describe('resetOnboardingData', () => {
        it('should reset all data to initial state', () => {
            const responses: PI20Response[] = Array(20).fill(4 as PI20Response);
            setPI20Responses(responses);
            setPerceptionScore(3);

            resetOnboardingData();

            const data = get(onboardingData);
            expect(data.pi20Responses).toHaveLength(20);
            expect(data.pi20Responses.every(r => r === null)).toBe(true);
            expect(data.perceptionScore).toBeNull();
        });
    });
});
