<script lang="ts">
    import { Button, Card, LikertScale, ProgressBar } from '$lib/components';
    import { PI20_QUESTIONS } from '$lib/core/pi20';
    import type { PI20Response } from '$lib/types';
    import { goto } from '$app/navigation';
    import { setPI20Responses } from '$lib/stores/onboarding';

    let currentQuestionIndex = $state(0);
    // eslint-disable-next-line prefer-const
    let responses = $state<(PI20Response | null)[]>(Array(20).fill(null));

    const currentQuestion = $derived(PI20_QUESTIONS[currentQuestionIndex]);
    const progress = $derived(currentQuestionIndex + 1);
    const canGoNext = $derived(responses[currentQuestionIndex] !== null);
    const isLastQuestion = $derived(currentQuestionIndex === 19);

    function handleResponseChange(value: PI20Response): void {
        responses[currentQuestionIndex] = value;
    }

    function handleBack(): void {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
        } else {
            goto('/onboarding');
        }
    }

    function handleNext(): void {
        if (!canGoNext) return;

        if (isLastQuestion) {
            // Save responses to store and navigate to perception test
            setPI20Responses(responses);
            goto('/onboarding/perception');
        } else {
            currentQuestionIndex++;
        }
    }
</script>

<svelte:head>
    <title>PI20 Survey - FaceIt</title>
</svelte:head>

<div class="pi20-page">
    <Card>
        <div class="pi20-content">
            <div class="header">
                <h1 class="title">Face Recognition Self-Assessment</h1>
                <p class="subtitle">
                    Please rate how much you agree with each statement about your face recognition
                    abilities.
                </p>
            </div>

            <div class="progress-section">
                <ProgressBar value={progress} max={20} label="Question {progress} of 20" />
            </div>

            <div class="question-section">
                <p class="question-text">{currentQuestion.text}</p>

                <div class="response-area">
                    <LikertScale
                        value={responses[currentQuestionIndex]}
                        onchange={handleResponseChange}
                    />
                </div>
            </div>

            <div class="navigation">
                <Button variant="secondary" onclick={handleBack}>
                    {currentQuestionIndex === 0 ? 'Cancel' : 'Back'}
                </Button>
                <Button variant="primary" onclick={handleNext} disabled={!canGoNext}>
                    {isLastQuestion ? 'Continue' : 'Next'}
                </Button>
            </div>
        </div>
    </Card>
</div>

<style>
    .pi20-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-lg);
        min-height: 100vh;
    }

    .pi20-content {
        max-width: 600px;
        width: 100%;
    }

    .header {
        margin-bottom: var(--spacing-xl);
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

    .progress-section {
        margin-bottom: var(--spacing-xl);
    }

    .question-section {
        margin-bottom: var(--spacing-xl);
    }

    .question-text {
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--color-text);
        line-height: 1.6;
        margin-bottom: var(--spacing-lg);
    }

    .response-area {
        margin-top: var(--spacing-md);
    }

    .navigation {
        display: flex;
        justify-content: space-between;
        gap: var(--spacing-md);
    }
</style>
