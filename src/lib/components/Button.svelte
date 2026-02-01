<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        variant?: 'primary' | 'secondary';
        disabled?: boolean;
        type?: 'button' | 'submit' | 'reset';
        onclick?: () => void;
        children: Snippet;
    }

    const {
        variant = 'primary',
        disabled = false,
        type = 'button',
        onclick,
        children,
    }: Props = $props();
</script>

<button class="btn btn-{variant}" {type} {disabled} {onclick}>
    {@render children()}
</button>

<style>
    .btn {
        display: inline-block;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: 500;
        text-decoration: none;
        transition:
            background-color 0.2s,
            transform 0.1s;
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-size: var(--font-size-base);
    }

    .btn:active:not(:disabled) {
        transform: scale(0.98);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        background: var(--color-primary);
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--color-primary-dark);
    }

    .btn-secondary {
        background: var(--color-surface);
        color: var(--color-text);
        border: 1px solid var(--color-border);
    }

    .btn-secondary:hover:not(:disabled) {
        background: var(--color-bg);
    }
</style>
