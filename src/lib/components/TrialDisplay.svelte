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

    type TrialPhase = 'target' | 'mask' | 'choice';

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

    let phase = $state<TrialPhase>('target');
    let selectedPosition = $state<number>(-1);

    // Start trial progression through phases
    function startPhases(): () => void {
        phase = 'target';
        selectedPosition = -1;

        let maskTimer: ReturnType<typeof setTimeout> | null = null;
        const targetTimer = setTimeout(() => {
            phase = 'mask';

            maskTimer = setTimeout(() => {
                phase = 'choice';
            }, MASK_TIME);
        }, DISPLAY_TIME);

        return () => {
            clearTimeout(targetTimer);
            if (maskTimer) {
                clearTimeout(maskTimer);
            }
        };
    }

    // Handle choice selection
    function handleChoice(position: number): void {
        if (phase !== 'choice' || selectedPosition !== -1) return;

        selectedPosition = position;
        const correct = position === faces.correctPosition;
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
    {#if phase === 'target'}
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
        <div class="phase-instruction">Which face did you see?</div>
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
</style>
