<script lang="ts">
    import '../app.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        data: {
            isOnboarded: boolean;
        };
    }

    const { children }: Props = $props();
    // data is available but not used in layout currently
</script>

<div class="app">
    <header>
        <h1>FaceIt</h1>
    </header>

    <main>
        {@render children()}
    </main>

    <footer>
        <p>Train your brain to recognize faces better</p>
    </footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    header {
        background: var(--color-primary);
        color: white;
        padding: var(--spacing-md) var(--spacing-xl);
        box-shadow: var(--shadow-md);
    }

    header h1 {
        font-size: var(--font-size-2xl);
        font-weight: 600;
    }

    main {
        flex: 1;
        padding: var(--spacing-xl);
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
    }

    footer {
        text-align: center;
        padding: var(--spacing-md);
        color: var(--color-text-muted);
        font-size: var(--font-size-sm);
    }
</style>
