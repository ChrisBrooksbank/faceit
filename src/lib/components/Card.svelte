<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    const { children }: Props = $props();
</script>

<div class="card">
    {@render children()}
</div>

<style>
    .card {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-md);
    }
</style>
