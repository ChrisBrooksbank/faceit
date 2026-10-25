<script lang="ts">
    import { Button, Card, FaceComparison, ProgressBar } from '$lib/components';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { getDifferenceCue } from '$lib/core/face-differences';
    import { buildPerceptionTrial } from '$lib/core/faces';
    import { setPerceptionScore } from '$lib/stores/onboarding';

    // Trial configuration: 6 trials at fixed difficulty levels
    const MORPH_LEVELS = [88, 76, 64, 52, 40, 28];
    const DISPLAY_TIME = 2000; // 2 seconds
    const MASK_TIME = 500; // 500ms

    // Trial state
    type TrialPhase = 'loading' | 'target' | 'mask' | 'choice' | 'feedback' | 'complete';
    const CORRECT_DELAY = 500;
    let currentTrialIndex = $state(0);
    let phase = $state<TrialPhase>('target');
    let correctCount = $state(0);
    let targetFaceUrl = $state('');
    let choiceFaceUrls = $state<string[]>([]);
    let correctPosition = $state(-1);
    let selectedPosition = $state(-1);

    const progress = $derived(currentTrialIndex + 1);
    const isTestComplete = $derived(currentTrialIndex >= MORPH_LEVELS.length);
    const feedbackCue = $derived(
        getDifferenceCue(
            choiceFaceUrls[selectedPosition] ?? '',
            choiceFaceUrls[correctPosition] ?? ''
        )
    );

    // Load face stimuli for current trial
    function loadTrial(): boolean {
        if (isTestComplete) {
            phase = 'complete';
            return false;
        }

        const morphLevel = MORPH_LEVELS[currentTrialIndex];
        const trial = buildPerceptionTrial(currentTrialIndex, morphLevel);
        targetFaceUrl = trial.target;
        choiceFaceUrls = trial.choices;
        correctPosition = trial.correct;

        selectedPosition = -1;
        return true;
    }

    // Handle trial progression through phases
    async function startTrial(): Promise<void> {
        phase = 'loading';
        if (!loadTrial()) return;

        await preloadFaceImages([targetFaceUrl, ...choiceFaceUrls]);

        phase = 'target';

        // Show target for 2 seconds
        setTimeout(() => {
            phase = 'mask';

            // Show mask for 500ms
            setTimeout(() => {
                phase = 'choice';
            }, MASK_TIME);
        }, DISPLAY_TIME);
    }

    // Handle choice selection
    function handleChoice(position: number): void {
        if (phase !== 'choice' || selectedPosition !== -1) return;

        selectedPosition = position;
        const isCorrect = position === correctPosition;

        if (isCorrect) {
            correctCount++;
        } else {
            phase = 'feedback';
        }

        // Correct answers move on quickly; mistakes wait for the user to press Continue
        if (isCorrect) {
            setTimeout(advance, CORRECT_DELAY);
        }
    }

    function advance(): void {
        currentTrialIndex++;
        void startTrial();
    }

    // Handle completion
    function handleComplete(): void {
        // Store the baseline perception score
        setPerceptionScore(correctCount);
        goto('/onboarding/results');
    }

    async function preloadFaceImages(urls: string[]): Promise<void> {
        await Promise.all(
            urls.map(
                url =>
                    new Promise<void>(resolve => {
                        const image = new Image();
                        image.onload = (): void => resolve();
                        image.onerror = (): void => resolve();
                        image.src = url;
                    })
            )
        );
    }

    // Initialize first trial on mount
    onMount(() => {
        void startTrial();
    });
</script>

<svelte:head>
    <title>Perception Test - FaceIt</title>
</svelte:head>

<div class="perception-page">
    <Card>
        <div class="perception-content">
            {#if !isTestComplete}
                <div class="header">
                    <h1 class="title">Face Perception Test</h1>
                    <p class="subtitle">Study the image carefully, then choose the exact match.</p>
                </div>

                <div class="progress-section">
                    <ProgressBar
                        value={progress}
                        max={MORPH_LEVELS.length}
                        label="Trial {progress} of {MORPH_LEVELS.length}"
                    />
                </div>

                <div class="trial-area">
                    {#if phase === 'loading'}
                        <div class="phase-instruction">Loading faces...</div>
                        <div class="mask-display">
                            <div class="mask"></div>
                        </div>
                    {:else if phase === 'target'}
                        <div class="phase-instruction">Remember this face</div>
                        <div class="target-display">
                            <img src={targetFaceUrl} alt="Target face" class="face-image" />
                        </div>
                    {:else if phase === 'mask'}
                        <div class="phase-instruction">Hold the image in mind...</div>
                        <div class="mask-display">
                            <div class="mask"></div>
                        </div>
                    {:else if phase === 'choice'}
                        <div class="phase-instruction">
                            Which image exactly matches the one you saw?
                        </div>
                        <div class="choices-display">
                            {#each choiceFaceUrls as faceUrl, index}
                                <button
                                    class="choice-button"
                                    onclick={(): void => handleChoice(index)}
                                    disabled={selectedPosition !== -1}
                                >
                                    <img
                                        src={faceUrl}
                                        alt="Choice {index + 1}"
                                        class="face-image"
                                    />
                                </button>
                            {/each}
                        </div>
                    {:else if phase === 'feedback'}
                        <div class="phase-instruction">Look again at the differences</div>
                        <div class="feedback-display" aria-live="polite">
                            <FaceComparison
                                selectedFaceId={choiceFaceUrls[selectedPosition]}
                                correctFaceId={choiceFaceUrls[correctPosition]}
                            />
                        </div>
                        <p class="feedback-hint">{feedbackCue}</p>
                        <Button variant="primary" onclick={advance}>Continue</Button>
                    {/if}
                </div>
            {:else}
                <div class="complete-screen">
                    <h1 class="title">Test Complete</h1>
                    <p class="result-text">
                        You correctly identified {correctCount} out of {MORPH_LEVELS.length} faces.
                    </p>
                    <div class="navigation">
                        <Button variant="primary" onclick={handleComplete}>
                            View Your Results
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    </Card>
</div>

<style>
    .perception-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-lg);
        min-height: 100vh;
    }

    .perception-content {
        max-width: 800px;
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

    .trial-area {
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .phase-instruction {
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: var(--spacing-lg);
        text-align: center;
    }

    .target-display,
    .mask-display {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .face-image {
        display: block;
        width: 200px;
        max-width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
    }

    .mask {
        width: 200px;
        height: 200px;
        background: repeating-linear-gradient(
            45deg,
            var(--color-border),
            var(--color-border) 10px,
            var(--color-surface) 10px,
            var(--color-surface) 20px
        );
        border-radius: var(--radius-md);
    }

    .choices-display {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 200px));
        gap: var(--spacing-sm);
        justify-content: center;
        width: 100%;
    }

    .choice-button {
        min-width: 0;
        background: none;
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition:
            border-color 0.2s,
            transform 0.1s;
    }

    .choice-button:hover:not(:disabled) {
        border-color: var(--color-primary);
        transform: scale(1.05);
    }

    .choice-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    .choice-button:active:not(:disabled) {
        transform: scale(0.98);
    }

    .feedback-display {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    .feedback-hint {
        max-width: 520px;
        margin: var(--spacing-lg) auto 0;
        color: var(--color-text-muted);
        line-height: 1.5;
        text-align: center;
    }

    .complete-screen {
        text-align: center;
        padding: var(--spacing-xl);
    }

    .result-text {
        font-size: var(--font-size-lg);
        color: var(--color-text);
        margin: var(--spacing-xl) 0;
        line-height: 1.6;
    }

    .navigation {
        display: flex;
        justify-content: center;
        margin-top: var(--spacing-xl);
    }
</style>
