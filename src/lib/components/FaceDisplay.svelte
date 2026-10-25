<script lang="ts">
    /**
     * FaceDisplay component - Displays face stimuli during training
     *
     * Used for both target display (single face) and choice phase (multiple faces)
     */

    import { REGION_BOXES, type Region } from '$lib/core/face-differences';
    import {
        NO_VARIATION,
        variationFilter,
        variationTransform,
        type ImageVariation,
    } from '$lib/core/image-variation';

    interface Props {
        /**
         * Face ID to display (e.g., "face1_face2_64")
         */
        faceId: string;
        /**
         * Whether this face is selectable (choice phase)
         */
        selectable?: boolean;
        /**
         * Whether this face is currently selected
         */
        selected?: boolean;
        /**
         * Callback when face is clicked (choice phase)
         */
        onclick?: () => void;
        /**
         * Size variant
         */
        size?: 'small' | 'medium' | 'large';
        /**
         * ARIA label for accessibility
         */
        ariaLabel?: string;
        /**
         * Simulated photo change (rotation, scale, lighting) applied to the image
         */
        variation?: ImageVariation;
        /**
         * Facial regions to outline (used in mistake feedback)
         */
        highlight?: Region[];
    }

    const {
        faceId,
        selectable = false,
        selected = false,
        onclick,
        size = 'medium',
        ariaLabel = 'Face stimulus',
        variation = NO_VARIATION,
        highlight = [],
    }: Props = $props();

    const imageSrc = $derived(`/faces/${faceId}.jpg`);
    const imageStyle = $derived(variationTransform(variation));
    const frameStyle = $derived(variationFilter(variation));
</script>

{#if selectable}
    <button
        class="face-container face-{size} selectable"
        class:selected
        style={frameStyle}
        {onclick}
        aria-label={ariaLabel}
        aria-pressed={selected}
    >
        <img src={imageSrc} alt={ariaLabel} class="face-image" style={imageStyle} />
    </button>
{:else}
    <div class="face-container face-{size}" style={frameStyle}>
        <img src={imageSrc} alt={ariaLabel} class="face-image" style={imageStyle} />
        {#each highlight as region (region)}
            {@const [left, top, right, bottom] = REGION_BOXES[region]}
            <span
                class="region-highlight"
                style="left:{left * 100}%;top:{top * 100}%;width:{(right - left) *
                    100}%;height:{(bottom - top) * 100}%"
                aria-hidden="true"
            ></span>
        {/each}
    </div>
{/if}

<style>
    .face-container {
        display: inline-block;
        position: relative;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: #d6d9d9; /* matches the stimulus background so shifted images blend in */
        box-shadow: var(--shadow-md);
    }

    .region-highlight {
        position: absolute;
        border: 2px solid #f59e0b;
        border-radius: var(--radius-sm, 4px);
        background: rgba(245, 158, 11, 0.12);
        pointer-events: none;
    }

    .face-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Size variants */
    .face-small,
    .face-medium,
    .face-large {
        max-width: 100%;
        aspect-ratio: 1 / 1;
    }

    .face-small {
        width: min(120px, 100%);
    }

    .face-medium {
        width: min(200px, 100%);
    }

    .face-large {
        width: min(280px, 100%);
    }

    /* Selectable faces (choice phase) */
    .selectable {
        cursor: pointer;
        border: 3px solid transparent;
        transition:
            border-color 0.2s,
            transform 0.1s,
            box-shadow 0.2s;
        padding: 0;
    }

    .selectable:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-lg);
    }

    .selectable:active {
        transform: scale(0.98);
    }

    .selectable.selected {
        border-color: var(--color-primary);
        box-shadow:
            0 0 0 4px rgba(37, 99, 235, 0.1),
            var(--shadow-lg);
    }

    /* Ensure minimum tap target size for accessibility */
    @media (pointer: coarse) {
        .selectable {
            min-width: 44px;
            min-height: 44px;
        }
    }
</style>
