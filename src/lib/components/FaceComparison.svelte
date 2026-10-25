<script lang="ts">
    /**
     * FaceComparison - side-by-side comparison of the chosen and correct images after
     * a mistake, with the regions that differ most outlined and a flicker mode that
     * alternates the two images in the same spot (differences show up as movement).
     */

    import FaceDisplay from './FaceDisplay.svelte';
    import { getDifferenceRegions, normalizeFaceId } from '$lib/core/face-differences';
    import type { ImageVariation } from '$lib/core/image-variation';

    interface Props {
        selectedFaceId: string;
        correctFaceId: string;
        size?: 'small' | 'medium' | 'large';
        selectedVariation?: ImageVariation;
        correctVariation?: ImageVariation;
    }

    const {
        selectedFaceId,
        correctFaceId,
        size = 'medium',
        selectedVariation,
        correctVariation,
    }: Props = $props();

    const FLICKER_INTERVAL = 600;

    let flicker = $state(false);
    let showCorrect = $state(false);

    const regions = $derived(getDifferenceRegions(selectedFaceId, correctFaceId));

    function toggleFlicker(): void {
        flicker = !flicker;
    }

    $effect(() => {
        if (!flicker) return;
        const timer = setInterval((): void => {
            showCorrect = !showCorrect;
        }, FLICKER_INTERVAL);
        return (): void => clearInterval(timer);
    });
</script>

<div class="comparison">
    {#if flicker}
        <div class="feedback-face">
            <div class="feedback-label">{showCorrect ? 'Exact match' : 'Your choice'}</div>
            {#if showCorrect}
                <FaceDisplay
                    faceId={normalizeFaceId(correctFaceId)}
                    {size}
                    variation={correctVariation}
                    ariaLabel="Correct matching image"
                />
            {:else}
                <FaceDisplay
                    faceId={normalizeFaceId(selectedFaceId)}
                    {size}
                    variation={selectedVariation}
                    ariaLabel="Your selected image"
                />
            {/if}
        </div>
    {:else}
        <div class="feedback-pair">
            <div class="feedback-face">
                <div class="feedback-label">Your choice</div>
                <FaceDisplay
                    faceId={normalizeFaceId(selectedFaceId)}
                    {size}
                    variation={selectedVariation}
                    highlight={regions}
                    ariaLabel="Your selected image"
                />
            </div>
            <div class="feedback-face">
                <div class="feedback-label">Exact match</div>
                <div class="correct-frame">
                    <FaceDisplay
                        faceId={normalizeFaceId(correctFaceId)}
                        {size}
                        variation={correctVariation}
                        highlight={regions}
                        ariaLabel="Correct matching image"
                    />
                </div>
            </div>
        </div>
    {/if}
    <button type="button" class="flicker-toggle" onclick={toggleFlicker}>
        {flicker ? 'Show side by side' : 'Flicker between the two'}
    </button>
</div>

<style>
    .comparison {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
    }

    .comparison {
        width: 100%;
    }

    .feedback-pair {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 300px));
        gap: var(--spacing-md);
        justify-content: center;
        width: 100%;
    }

    .feedback-face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        min-width: 0;
        width: 100%;
    }

    .feedback-label {
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-muted);
    }

    .correct-frame {
        width: calc(100% - 8px);
        display: flex;
        justify-content: center;
        border-radius: var(--radius-md);
        outline: 3px solid var(--color-success);
        outline-offset: 4px;
    }

    .flicker-toggle {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-primary);
        cursor: pointer;
        font-size: var(--font-size-sm);
        min-height: 44px;
        padding: var(--spacing-sm) var(--spacing-md);
    }
</style>
