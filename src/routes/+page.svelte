<script lang="ts">
    // Home/Dashboard page
    // This will become the main dashboard after onboarding
</script>

<svelte:head>
    <title>FaceIt - Face Recognition Training</title>
</svelte:head>

<div class="dashboard">
    <section class="card welcome">
        <h2>Welcome to FaceIt</h2>
        <p>
            Train your brain to recognize faces better through evidence-based perceptual
            discrimination training.
        </p>
    </section>

    <section class="card status">
        <h2>Status</h2>
        <p>
            <span class="badge">Ready to start</span>
        </p>
        <p class="hint">Complete the onboarding assessment to begin training.</p>
    </section>

    <section class="card actions">
        <h2>Get Started</h2>
        <a href="/onboarding" class="btn btn-primary">Start Assessment</a>
    </section>
</div>

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .card {
        background: var(--color-surface);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-md);
    }

    .card h2 {
        font-size: var(--font-size-xl);
        margin-bottom: var(--spacing-sm);
        color: var(--color-text);
    }

    .card p {
        color: var(--color-text-muted);
        line-height: 1.6;
    }

    .badge {
        display: inline-block;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: 500;
        background: var(--color-success-bg);
        color: var(--color-success);
    }

    .hint {
        margin-top: var(--spacing-sm);
        font-size: var(--font-size-sm);
    }

    .actions {
        text-align: center;
    }

    .btn {
        display: inline-block;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: 500;
        text-decoration: none;
        transition:
            background-color 0.2s,
            transform 0.1s;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .btn-primary {
        background: var(--color-primary);
        color: white;
    }

    .btn-primary:hover {
        background: var(--color-primary-dark);
    }
</style>
