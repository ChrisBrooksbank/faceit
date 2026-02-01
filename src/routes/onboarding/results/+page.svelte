<script lang="ts">
    import { Button, Card } from '$lib/components';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { onboardingData } from '$lib/stores/onboarding';
    import { getPI20Result, getPI20Interpretation } from '$lib/core/pi20';
    import type { PI20Response } from '$lib/types';

    let pi20Score = $state(0);
    let pi20Severity = $state<'typical' | 'mild' | 'moderate' | 'severe'>('typical');
    let pi20Interpretation = $state('');
    let perceptionScore = $state(0);
    let perceptionInterpretation = $state('');
    let profileSummary = $state('');

    // Get perception interpretation based on score
    function getPerceptionInterpretation(score: number): string {
        if (score === 6) return 'Excellent baseline perception';
        if (score >= 4) return 'Good baseline perception';
        if (score >= 2) return 'Moderate perceptual difficulty';
        return 'Significant perceptual difficulty';
    }

    // Get combined profile summary
    function getProfileSummary(
        pi20Sev: 'typical' | 'mild' | 'moderate' | 'severe',
        perceptionScoreVal: number
    ): string {
        const hasPerceptualDifficulty = perceptionScoreVal < 4;
        const hasFaceRecognitionDifficulty =
            pi20Sev === 'mild' || pi20Sev === 'moderate' || pi20Sev === 'severe';

        if (hasPerceptualDifficulty && hasFaceRecognitionDifficulty) {
            return 'Your results indicate difficulties with both face perception and recognition. Perceptual discrimination training (our approach) can help improve your ability to distinguish between similar faces. This training works best when practiced consistently.';
        } else if (hasPerceptualDifficulty) {
            return 'Your results suggest perceptual difficulties with face discrimination. The good news is that perceptual discrimination training is specifically designed to address this. With consistent practice, many people see measurable improvements.';
        } else if (hasFaceRecognitionDifficulty) {
            return 'Your results indicate face recognition difficulties, though your perceptual discrimination is relatively good. Training may still help by fine-tuning your ability to notice subtle differences between faces, which can improve memory encoding.';
        } else {
            return 'Your results suggest typical face recognition abilities. You can still benefit from training if you want to enhance your skills, though you may progress more quickly than those with greater difficulties.';
        }
    }

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

        // Calculate PI20 results
        const pi20Result = getPI20Result(data.pi20Responses as PI20Response[]);
        pi20Score = pi20Result.score;
        pi20Severity = pi20Result.severity;
        pi20Interpretation = getPI20Interpretation(pi20Result.severity);

        // Get perception results
        perceptionScore = data.perceptionScore;
        perceptionInterpretation = getPerceptionInterpretation(perceptionScore);

        // Get combined profile
        profileSummary = getProfileSummary(pi20Severity, perceptionScore);
    });

    function handleContinue(): void {
        goto('/onboarding/expectations');
    }
</script>

<svelte:head>
    <title>Your Results - FaceIt</title>
</svelte:head>

<div class="results-page">
    <Card>
        <div class="results-content">
            <div class="header">
                <h1 class="title">Your Assessment Results</h1>
                <p class="subtitle">
                    Here's what we learned about your face recognition abilities.
                </p>
            </div>

            <div class="results-section">
                <div class="result-card pi20-result">
                    <h2 class="result-title">Face Recognition Self-Assessment (PI20)</h2>
                    <div class="score-display">
                        <span class="score-value">{pi20Score}</span>
                        <span class="score-label">/ 100</span>
                    </div>
                    <div class="severity-badge severity-{pi20Severity}">
                        {pi20Severity === 'typical'
                            ? 'Typical Range'
                            : pi20Severity === 'mild'
                              ? 'Mild Difficulty'
                              : pi20Severity === 'moderate'
                                ? 'Moderate Difficulty'
                                : 'Significant Difficulty'}
                    </div>
                    <p class="interpretation">{pi20Interpretation}</p>
                </div>

                <div class="result-card perception-result">
                    <h2 class="result-title">Face Perception Test</h2>
                    <div class="score-display">
                        <span class="score-value">{perceptionScore}</span>
                        <span class="score-label">/ 6 correct</span>
                    </div>
                    <p class="interpretation">{perceptionInterpretation}</p>
                </div>
            </div>

            <div class="profile-section">
                <h2 class="section-title">What This Means for Training</h2>
                <p class="profile-text">{profileSummary}</p>
            </div>

            <div class="navigation">
                <Button variant="primary" onclick={handleContinue}>Continue</Button>
            </div>
        </div>
    </Card>
</div>

<style>
    .results-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-lg);
        min-height: 100vh;
    }

    .results-content {
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

    .results-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .result-card {
        padding: var(--spacing-lg);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
    }

    .result-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: var(--spacing-md);
    }

    .score-display {
        display: flex;
        align-items: baseline;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-md);
    }

    .score-value {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-primary);
    }

    .score-label {
        font-size: var(--font-size-lg);
        color: var(--color-text-muted);
    }

    .severity-badge {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-md);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }

    .severity-typical {
        background: #dcfce7;
        color: #166534;
    }

    .severity-mild {
        background: #fef3c7;
        color: #92400e;
    }

    .severity-moderate {
        background: #fed7aa;
        color: #9a3412;
    }

    .severity-severe {
        background: #fecaca;
        color: #991b1b;
    }

    .interpretation {
        font-size: var(--font-size-base);
        color: var(--color-text);
        line-height: 1.6;
    }

    .profile-section {
        padding: var(--spacing-lg);
        background: var(--color-background);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-xl);
    }

    .section-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: var(--spacing-md);
    }

    .profile-text {
        font-size: var(--font-size-base);
        color: var(--color-text);
        line-height: 1.6;
    }

    .navigation {
        display: flex;
        justify-content: center;
    }

    @media (max-width: 640px) {
        .results-page {
            padding: var(--spacing-md);
        }

        .title {
            font-size: var(--font-size-xl);
        }

        .score-value {
            font-size: var(--font-size-2xl);
        }
    }
</style>
