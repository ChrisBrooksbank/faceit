<script lang="ts">
    /**
     * FaceDisplay component - Displays face stimuli during training
     *
     * Used for both target display (single face) and choice phase (multiple faces)
     */

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
    }

    const {
        faceId,
        selectable = false,
        selected = false,
        onclick,
        size = 'medium',
        ariaLabel = 'Face stimulus',
    }: Props = $props();

    const imageSrc = $derived(`/faces/${faceId}.svg`);
</script>

{#if selectable}
    <button
        class="face-container face-{size} selectable"
        class:selected
        {onclick}
        aria-label={ariaLabel}
        aria-pressed={selected}
    >
        <img src={imageSrc} alt={ariaLabel} class="face-image" />
    </button>
{:else}
    <div class="face-container face-{size}">
        <img src={imageSrc} alt={ariaLabel} class="face-image" />
    </div>
{/if}

<style>
    .face-container {
        display: inline-block;
        position: relative;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: var(--color-surface);
        box-shadow: var(--shadow-md);
    }

    .face-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Size variants */
    .face-small {
        width: 120px;
        height: 120px;
    }

    .face-medium {
        width: 200px;
        height: 200px;
    }

    .face-large {
        width: 280px;
        height: 280px;
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
        background: var(--color-surface);
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
