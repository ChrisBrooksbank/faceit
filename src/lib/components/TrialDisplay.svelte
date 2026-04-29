<script lang="ts">
    /**
     * TrialDisplay component - Manages trial phases with automatic timing
     *
     * Handles three phases:
     * 1. Target: Shows single face for 2000ms
     * 2. Mask: Shows pattern mask for 500ms
     * 3. Choice: Shows 3 faces, waits for selection
     */

    import FaceDisplay from './FaceDisplay.svelte';
    import { getDifferenceCue } from '$lib/core/face-differences';

    type TrialPhase = 'loading' | 'target' | 'mask' | 'choice' | 'feedback';

    interface TrialFaces {
        targetFaceId: string;
        choiceFaceIds: string[];
        correctPosition: number;
    }

    interface Props {
        /**
         * Face data for current trial
         */
        faces: TrialFaces;
        /**
         * Callback when user selects a face (choice phase)
         * @param position - Index of selected face (0-2)
         * @param correct - Whether selection was correct
         */
        onSelect: (position: number, correct: boolean) => void;
        /**
         * Size variant for face displays
         */
        size?: 'small' | 'medium' | 'large';
    }

    const { faces, onSelect, size = 'medium' }: Props = $props();

    const DISPLAY_TIME = 2000; // 2 seconds for target display
    const MASK_TIME = 500; // 500ms for mask

    let phase = $state<TrialPhase>('loading');
    let selectedPosition = $state<number>(-1);
    const feedbackCue = $derived(
        getDifferenceCue(
            faces.choiceFaceIds[selectedPosition] ?? '',
            faces.choiceFaceIds[faces.correctPosition] ?? ''
        )
    );

    // Start trial progression through phases
    function startPhases(): () => void {
        phase = 'loading';
        selectedPosition = -1;

        let maskTimer: ReturnType<typeof setTimeout> | null = null;
        let targetTimer: ReturnType<typeof setTimeout> | null = null;
        let cancelled = false;

        void preloadFaceImages([faces.targetFaceId, ...faces.choiceFaceIds]).then(() => {
            if (cancelled) return;

            phase = 'target';

            targetTimer = setTimeout(() => {
                phase = 'mask';

                maskTimer = setTimeout(() => {
                    phase = 'choice';
                }, MASK_TIME);
            }, DISPLAY_TIME);
        });

        return () => {
            cancelled = true;
            if (targetTimer) {
                clearTimeout(targetTimer);
            }
            if (maskTimer) {
                clearTimeout(maskTimer);
            }
        };
    }

    async function preloadFaceImages(faceIds: string[]): Promise<void> {
        await Promise.all(
            faceIds.map(
                faceId =>
                    new Promise<void>(resolve => {
                        const image = new Image();
                        image.onload = (): void => resolve();
                        image.onerror = (): void => resolve();
                        image.src = faceSrc(faceId);
                    })
            )
        );
    }

    function faceSrc(faceId: string): string {
        return `/faces/${faceId}.jpg`;
    }

    // Handle choice selection
    function handleChoice(position: number): void {
        if (phase !== 'choice' || selectedPosition !== -1) return;

        selectedPosition = position;
        const correct = position === faces.correctPosition;
        if (!correct) {
            phase = 'feedback';
        }
        onSelect(position, correct);
    }

    // Restart phases when faces change (new trial)
    $effect(() => {
        const { targetFaceId, choiceFaceIds, correctPosition } = faces;
        void targetFaceId;
        void choiceFaceIds;
        void correctPosition;

        return startPhases();
    });
</script>

<div class="trial-display">
    {#if phase === 'loading'}
        <div class="phase-instruction">Loading faces...</div>
        <div class="mask-display">
            <div
                class="mask"
                class:mask-small={size === 'small'}
                class:mask-medium={size === 'medium'}
                class:mask-large={size === 'large'}
            ></div>
        </div>
    {:else if phase === 'target'}
        <div class="phase-instruction">Remember this face</div>
        <div class="target-display">
            <FaceDisplay faceId={faces.targetFaceId} {size} ariaLabel="Target face to remember" />
        </div>
    {:else if phase === 'mask'}
        <div class="phase-instruction">Processing...</div>
        <div class="mask-display">
            <div
                class="mask"
                class:mask-small={size === 'small'}
                class:mask-medium={size === 'medium'}
                class:mask-large={size === 'large'}
            ></div>
        </div>
    {:else if phase === 'choice'}
        <div class="phase-instruction">Which image exactly matches the one you saw?</div>
        <div class="choices-display">
            {#each faces.choiceFaceIds as faceId, index}
                <FaceDisplay
                    {faceId}
                    {size}
                    selectable={true}
                    selected={selectedPosition === index}
                    onclick={(): void => handleChoice(index)}
                    ariaLabel="Choice {index + 1}"
                />
            {/each}
        </div>
    {:else if phase === 'feedback'}
        <div class="phase-instruction">Look again at the differences</div>
        <div class="feedback-display" aria-live="polite">
            <div class="feedback-face">
                <div class="feedback-label">Your choice</div>
                <FaceDisplay
                    faceId={faces.choiceFaceIds[selectedPosition]}
                    {size}
                    ariaLabel="Your selected image"
                />
            </div>
            <div class="feedback-face">
                <div class="feedback-label">Exact match</div>
                <div class="correct-frame">
                    <FaceDisplay
                        faceId={faces.choiceFaceIds[faces.correctPosition]}
                        {size}
                        ariaLabel="Correct matching image"
                    />
                </div>
            </div>
        </div>
        <p class="feedback-hint">{feedbackCue}</p>
    {/if}
</div>

<style>
    .trial-display {
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

    .mask {
        background: repeating-linear-gradient(
            45deg,
            var(--color-border),
            var(--color-border) 10px,
            var(--color-surface) 10px,
            var(--color-surface) 20px
        );
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
    }

    .mask-small {
        width: 120px;
        height: 120px;
    }

    .mask-medium {
        width: 200px;
        height: 200px;
    }

    .mask-large {
        width: 280px;
        height: 280px;
    }

    .choices-display {
        display: flex;
        gap: var(--spacing-lg);
        justify-content: center;
        flex-wrap: wrap;
    }

    .feedback-display {
        display: flex;
        gap: var(--spacing-lg);
        justify-content: center;
        align-items: flex-start;
        flex-wrap: wrap;
    }

    .feedback-face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .feedback-label {
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-muted);
    }

    .correct-frame {
        border-radius: var(--radius-md);
        outline: 3px solid var(--color-success);
        outline-offset: 4px;
    }

    .feedback-hint {
        max-width: 560px;
        margin: var(--spacing-lg) auto 0;
        color: var(--color-text-muted);
        line-height: 1.5;
        text-align: center;
    }
</style>
