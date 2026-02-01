<script lang="ts">
    import type { PI20Response } from '$lib/types';

    interface Props {
        value: PI20Response | null;
        onchange: (value: PI20Response) => void;
        disabled?: boolean;
    }

    const { value = null, onchange, disabled = false }: Props = $props();

    const options: { value: PI20Response; label: string }[] = [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
    ];

    const handleSelect = (selectedValue: PI20Response): void => {
        if (!disabled) {
            onchange(selectedValue);
        }
    };
</script>

<div class="likert-scale">
    {#each options as option}
        <button
            type="button"
            class="likert-option"
            class:selected={value === option.value}
            onclick={(): void => handleSelect(option.value)}
            {disabled}
            aria-pressed={value === option.value}
        >
            <span class="option-value">{option.value}</span>
            <span class="option-label">{option.label}</span>
        </button>
    {/each}
</div>

<style>
    .likert-scale {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        width: 100%;
    }

    .likert-option {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--color-surface);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition:
            border-color 0.2s,
            background-color 0.2s;
        text-align: left;
        min-height: 44px;
    }

    .likert-option:hover:not(:disabled) {
        border-color: var(--color-primary);
        background: var(--color-bg);
    }

    .likert-option:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .likert-option.selected {
        border-color: var(--color-primary);
        background: var(--color-primary);
        color: white;
    }

    .option-value {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: var(--color-border);
        font-weight: 600;
        flex-shrink: 0;
    }

    .likert-option.selected .option-value {
        background: rgba(255, 255, 255, 0.3);
        color: white;
    }

    .option-label {
        font-size: var(--font-size-base);
        flex: 1;
    }
</style>
