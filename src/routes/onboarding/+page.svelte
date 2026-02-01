<script lang="ts">
    import { Button, Card } from '$lib/components';
    import { goto } from '$app/navigation';

    function handleGetStarted(): void {
        goto('/onboarding/pi20');
    }
</script>

<svelte:head>
    <title>Welcome - FaceIt</title>
</svelte:head>

<div class="welcome-page">
    <Card>
        <div class="welcome-content">
            <div class="logo">
                <h1 class="logo-text">FaceIt</h1>
            </div>

            <h2 class="tagline">Train your brain to recognize faces better</h2>

            <p class="description">
                FaceIt uses evidence-based perceptual discrimination training to help improve face
                recognition abilities. Through consistent practice, many people see measurable
                improvements in their ability to recognize faces.
            </p>

            <div class="privacy-notice">
                <svg
                    class="privacy-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>All data stays on your device</span>
            </div>

            <div class="actions">
                <Button variant="primary" onclick={handleGetStarted}>Get Started</Button>
            </div>
        </div>
    </Card>
</div>

<style>
    .welcome-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
    }

    .welcome-content {
        text-align: center;
        max-width: 500px;
        margin: 0 auto;
    }

    .logo {
        margin-bottom: var(--spacing-lg);
    }

    .logo-text {
        font-size: 3rem;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
    }

    .tagline {
        font-size: var(--font-size-2xl);
        font-weight: 600;
        color: var(--color-text);
        margin-bottom: var(--spacing-md);
        line-height: 1.3;
    }

    .description {
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: var(--spacing-xl);
        font-size: var(--font-size-base);
    }

    .privacy-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        background: var(--color-success-bg);
        color: var(--color-success);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-xl);
        font-weight: 500;
    }

    .privacy-icon {
        width: 1.25rem;
        height: 1.25rem;
    }

    .actions {
        display: flex;
        justify-content: center;
    }
</style>
