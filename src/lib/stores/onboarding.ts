/**
 * Temporary store for onboarding flow data
 * Data is cleared after onboarding completes
 */

import { writable } from 'svelte/store';
import type { PI20Response } from '$lib/types';

interface OnboardingData {
    pi20Responses: (PI20Response | null)[];
    perceptionScore: number | null;
}

const initialData: OnboardingData = {
    pi20Responses: Array(20).fill(null),
    perceptionScore: null,
};

/**
 * Temporary storage for onboarding assessment data
 */
export const onboardingData = writable<OnboardingData>(initialData);

/**
 * Update PI20 responses
 */
export function setPI20Responses(responses: (PI20Response | null)[]): void {
    onboardingData.update(data => ({
        ...data,
        pi20Responses: responses,
    }));
}

/**
 * Update perception test score
 */
export function setPerceptionScore(score: number): void {
    onboardingData.update(data => ({
        ...data,
        perceptionScore: score,
    }));
}

/**
 * Reset onboarding data (after completion or cancellation)
 */
export function resetOnboardingData(): void {
    onboardingData.set(initialData);
}
