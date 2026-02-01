<script lang="ts">
    interface Props {
        value: number; // 0-100
        max?: number;
        label?: string;
    }

    const { value, max = 100, label }: Props = $props();

    const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
    class="progress-container"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-label={label}
>
    {#if label}
        <div class="progress-label">{label}</div>
    {/if}
    <div class="progress-bar">
        <div class="progress-fill" style="width: {percentage}%"></div>
    </div>
</div>

<style>
    .progress-container {
        width: 100%;
    }

    .progress-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--spacing-xs);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--color-bg);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: var(--color-primary);
        border-radius: var(--radius-full);
        transition: width 0.3s ease;
    }
</style>
