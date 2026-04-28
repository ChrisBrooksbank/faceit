<script lang="ts">
    import { Button, Card } from '$lib/components';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { onboardingData, resetOnboardingData } from '$lib/stores/onboarding';
    import { setUserProfile, setProgressMetrics } from '$lib/stores';
    import { saveAssessment, saveUserProfile, saveProgressMetrics } from '$lib/db';
    import { getPI20Result } from '$lib/core/pi20';
    import { logger } from '$lib/utils/logger';
    import type { UserProfile, ProgressMetrics, PI20Response } from '$lib/types';

    let acknowledged = $state(false);
    let isLoading = $state(false);
    let dataValid = $state(false);

    onMount(() => {
        const data = $onboardingData;

        // Validate we have the required data
        if (!data.pi20Responses.every(r => r !== null)) {
            // If PI20 responses are incomplete, redirect back to PI20
            goto('/onboarding/pi20');
            return;
        }

        if (data.perceptionScore === null) {
            // If perception score is missing, redirect to perception test
            goto('/onboarding/perception');
            return;
        }

        dataValid = true;
    });

    function createUserProfile(
        userId: string,
        now: Date,
        pi20Score: number,
        pi20Responses: PI20Response[],
        perceptionScore: number
    ): UserProfile {
        return {
            id: userId,
            createdAt: now,
            pi20Score,
            pi20Responses,
            baselinePerception: perceptionScore,
            onboardingComplete: true,
            settings: {
                reminderEnabled: false,
                reminderTime: '09:00',
                trialsPerSession: 60,
            },
        };
    }

    function createProgressMetrics(userId: string): ProgressMetrics {
        return {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            totalSessions: 0,
            totalTrainingTime: 0,
            avgThreshold: 0,
            bestThreshold: 0,
            avgAccuracy: 0,
            lastSessionDate: null,
            improvementRate: 0,
        };
    }

    async function handleComplete(): Promise<void> {
        if (!acknowledged || !dataValid) {
            return;
        }

        isLoading = true;

        try {
            const data = $onboardingData;
            const pi20Responses: PI20Response[] = data.pi20Responses.map(response => response ?? 3);
            const perceptionScore = data.perceptionScore ?? 0;
            const pi20Result = getPI20Result(pi20Responses as PI20Response[]);

            // Create user profile
            const userId = crypto.randomUUID();
            const now = new Date();
            const profile = createUserProfile(
                userId,
                now,
                pi20Result.score,
                pi20Responses,
                perceptionScore
            );
            const metrics = createProgressMetrics(userId);

            // Save to IndexedDB
            await saveUserProfile(profile);
            await saveAssessment({
                id: crypto.randomUUID(),
                date: now,
                type: 'initial',
                pi20Score: pi20Result.score,
                pi20Responses,
                perceptionScore,
            });
            await saveProgressMetrics(metrics);

            // Update stores
            setUserProfile(profile);
            setProgressMetrics(metrics);

            // Clear onboarding data
            resetOnboardingData();

            // Navigate to dashboard
            goto('/');
        } catch (error) {
            logger.error('Failed to complete onboarding', error);
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>What to Expect - FaceIt</title>
</svelte:head>

<div class="expectations-page">
    <Card>
        <div class="expectations-content">
            <div class="header">
                <h1 class="title">What to Expect from Training</h1>
                <p class="subtitle">
                    Before you begin, here's what you should know about face recognition training.
                </p>
            </div>

            <div class="expectations-section">
                <div class="expectation-card">
                    <div class="icon">⚙️</div>
                    <h2 class="expectation-title">This is training, not a cure</h2>
                    <p class="expectation-text">
                        Face recognition training can improve your ability to distinguish between
                        similar faces, but it won't "cure" prosopagnosia. Think of it like physical
                        therapy – it strengthens specific skills through practice.
                    </p>
                </div>

                <div class="expectation-card">
                    <div class="icon">📊</div>
                    <h2 class="expectation-title">Results vary between individuals</h2>
                    <p class="expectation-text">
                        Research shows 50-60% of people see measurable improvement with perceptual
                        discrimination training. Your results will depend on factors like the type
                        and severity of your difficulties, as well as how consistently you practice.
                    </p>
                </div>

                <div class="expectation-card">
                    <div class="icon">⏱️</div>
                    <h2 class="expectation-title">Progress takes time</h2>
                    <p class="expectation-text">
                        Benefits typically appear after 2-4 weeks of consistent practice. Don't
                        expect overnight changes. Your brain needs time to build new perceptual
                        skills and neural pathways.
                    </p>
                </div>

                <div class="expectation-card">
                    <div class="icon">📅</div>
                    <h2 class="expectation-title">Daily practice is key</h2>
                    <p class="expectation-text">
                        Daily practice (10 minutes) works better than occasional longer sessions.
                        Consistency is more important than duration. Regular practice helps
                        reinforce learning and build lasting improvements.
                    </p>
                </div>
            </div>

            <div class="acknowledgment">
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        bind:checked={acknowledged}
                        disabled={isLoading}
                        class="checkbox"
                    />
                    <span class="checkbox-text">
                        I understand this requires consistent practice and realistic expectations
                    </span>
                </label>
            </div>

            <div class="navigation">
                <Button
                    variant="primary"
                    onclick={handleComplete}
                    disabled={!acknowledged || isLoading}
                >
                    {isLoading ? 'Setting up...' : 'Start Training'}
                </Button>
            </div>
        </div>
    </Card>
</div>

<style>
    .expectations-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-lg);
        min-height: 100vh;
    }

    .expectations-content {
        max-width: 700px;
        width: 100%;
    }

    .header {
        margin-bottom: var(--spacing-xl);
        text-align: center;
    }

    .title {
        font-size: var(--font-size-2xl);
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
    }

    .subtitle {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        line-height: 1.5;
    }

    .expectations-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .expectation-card {
        padding: var(--spacing-lg);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
    }

    .icon {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--spacing-sm);
    }

    .expectation-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
    }

    .expectation-text {
        font-size: var(--font-size-base);
        color: var(--color-text);
        line-height: 1.6;
    }

    .acknowledgment {
        padding: var(--spacing-lg);
        background: var(--color-background);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-xl);
    }

    .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        cursor: pointer;
        user-select: none;
    }

    .checkbox {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        cursor: pointer;
        flex-shrink: 0;
    }

    .checkbox:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .checkbox-text {
        font-size: var(--font-size-base);
        color: var(--color-text);
        line-height: 1.6;
    }

    .navigation {
        display: flex;
        justify-content: center;
    }

    @media (max-width: 640px) {
        .expectations-page {
            padding: var(--spacing-md);
        }

        .title {
            font-size: var(--font-size-xl);
        }

        .icon {
            font-size: var(--font-size-xl);
        }
    }
</style>
