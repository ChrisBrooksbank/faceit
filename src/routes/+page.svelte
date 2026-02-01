<script lang="ts">
    import { userProfile, progressMetrics, hasSessionToday, currentStreak } from '$lib/stores';
    import { Button, Card } from '$lib/components';

    const onStartSession = (): void => {
        window.location.href = '/training';
    };
</script>

<svelte:head>
    <title>FaceIt - Face Recognition Training</title>
</svelte:head>

{#if !$userProfile}
    <!-- Not onboarded: show welcome -->
    <div class="dashboard">
        <Card>
            <h2>Welcome to FaceIt</h2>
            <p>
                Train your brain to recognize faces better through evidence-based perceptual
                discrimination training.
            </p>
            <p class="privacy">🔒 All data stays on your device</p>
        </Card>

        <Card>
            <h3>Get Started</h3>
            <p class="hint">Complete the onboarding assessment to begin training.</p>
            <div class="actions">
                <Button
                    variant="primary"
                    onclick={(): void => {
                        window.location.href = '/onboarding';
                    }}
                >
                    Start Assessment
                </Button>
            </div>
        </Card>
    </div>
{:else}
    <!-- Onboarded: show dashboard -->
    <div class="dashboard">
        <Card>
            <h2>
                {#if $currentStreak > 0}
                    🔥 {$currentStreak} day streak!
                {:else}
                    Welcome back!
                {/if}
            </h2>
            {#if $hasSessionToday}
                <p class="status-message success">✓ Session completed today!</p>
            {:else}
                <p class="status-message">Ready for today's training</p>
            {/if}
        </Card>

        <Card>
            <div class="primary-action">
                <Button
                    variant="primary"
                    onclick={onStartSession}
                    disabled={$hasSessionToday}
                    fullWidth={true}
                >
                    {$hasSessionToday ? 'Done for today' : 'Start Session'}
                </Button>
            </div>
        </Card>

        <Card>
            <h3>Quick Stats</h3>
            <div class="stats-grid">
                <div class="stat">
                    <div class="stat-value">{$currentStreak}</div>
                    <div class="stat-label">Current Streak</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{$progressMetrics?.totalSessions ?? 0}</div>
                    <div class="stat-label">Sessions Completed</div>
                </div>
                <div class="stat">
                    <div class="stat-value">
                        {$progressMetrics?.avgThreshold
                            ? `${$progressMetrics.avgThreshold.toFixed(0)}%`
                            : 'N/A'}
                    </div>
                    <div class="stat-label">Avg Threshold</div>
                </div>
            </div>
        </Card>

        <Card>
            <div class="secondary-actions">
                <a href="/progress" class="link">View Progress</a>
                <a href="/settings" class="link">Settings</a>
            </div>
        </Card>
    </div>
{/if}

<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    h2 {
        font-size: var(--font-size-2xl);
        margin-bottom: var(--spacing-sm);
        color: var(--color-text);
    }

    h3 {
        font-size: var(--font-size-xl);
        margin-bottom: var(--spacing-md);
        color: var(--color-text);
    }

    p {
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: var(--spacing-sm);
    }

    .privacy {
        margin-top: var(--spacing-md);
        font-size: var(--font-size-sm);
        color: var(--color-text);
    }

    .hint {
        font-size: var(--font-size-sm);
        margin-bottom: var(--spacing-md);
    }

    .actions {
        margin-top: var(--spacing-md);
    }

    .status-message {
        font-size: var(--font-size-lg);
        font-weight: 500;
    }

    .status-message.success {
        color: var(--color-success);
    }

    .primary-action {
        margin: var(--spacing-md) 0;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-lg);
        margin-top: var(--spacing-md);
    }

    .stat {
        text-align: center;
    }

    .stat-value {
        font-size: var(--font-size-2xl);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
    }

    .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
    }

    .secondary-actions {
        display: flex;
        justify-content: space-around;
        gap: var(--spacing-md);
        margin-top: var(--spacing-sm);
    }

    .link {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
    }

    .link:hover {
        text-decoration: underline;
    }

    @media (max-width: 600px) {
        .stats-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
        }

        .stat {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .stat-value {
            margin-bottom: 0;
        }
    }
</style>
