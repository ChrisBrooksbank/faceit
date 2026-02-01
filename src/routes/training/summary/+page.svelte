<script lang="ts">
    /**
     * Session Summary Screen
     * Displays results and encouragement after completing a training session
     */

    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Button, Card } from '$lib/components';
    import { currentSession, currentStreak } from '$lib/stores';
    import { getSessionsByDate } from '$lib/db';
    import { logger } from '$lib/utils/logger';

    // ============================================
    // State
    // ============================================

    let previousThreshold = $state<number | null>(null);
    let trend = $state<'improving' | 'stable' | 'declining'>('stable');

    // ============================================
    // Derived values
    // ============================================

    const session = $derived($currentSession);
    const streak = $derived($currentStreak);

    // ============================================
    // Initialization
    // ============================================

    onMount(async () => {
        // Redirect if no session data
        if (!session) {
            logger.warn('No session data found, redirecting to dashboard');
            goto('/');
            return;
        }

        // Get previous sessions to calculate trend
        try {
            const sessions = await getSessionsByDate();
            const completedSessions = sessions.filter(s => s.completed && s.id !== session.id);

            if (completedSessions.length > 0) {
                // Get most recent completed session
                const previous = completedSessions[completedSessions.length - 1];
                previousThreshold = previous.thresholdLevel;

                // Calculate trend
                const thresholdDiff = session.thresholdLevel - previous.thresholdLevel;
                if (thresholdDiff < -2) {
                    trend = 'improving'; // Lower threshold = harder = better
                } else if (thresholdDiff > 2) {
                    trend = 'declining';
                } else {
                    trend = 'stable';
                }
            }
        } catch (error) {
            logger.error('Failed to fetch previous sessions', error);
        }
    });

    // ============================================
    // Encouragement Messages
    // ============================================

    function getEncouragementMessage(): string {
        if (!session) return '';

        const { accuracy } = session;

        if (accuracy >= 80) {
            return 'Excellent work! Your accuracy is outstanding.';
        } else if (accuracy >= 70) {
            return "Great session! You're making solid progress.";
        } else if (accuracy >= 60) {
            return 'Good effort! Keep practicing to improve.';
        } else {
            return 'Keep going! Consistency is key to improvement.';
        }
    }

    function getTrendMessage(): string {
        if (trend === 'improving') {
            return 'Your threshold is improving! Faces are getting harder to recognize.';
        } else if (trend === 'declining') {
            return 'Keep practicing! Everyone has ups and downs.';
        } else {
            return 'Your performance is consistent.';
        }
    }

    function getStreakMessage(): string {
        if (streak === 1) {
            return 'First session! Come back tomorrow to start a streak.';
        } else if (streak === 2) {
            return 'Two days in a row! Keep it up.';
        } else if (streak >= 7) {
            return `${streak} day streak! You're on fire!`;
        } else {
            return `${streak} day streak! Great consistency.`;
        }
    }

    // ============================================
    // Handlers
    // ============================================

    function handleDone(): void {
        goto('/');
    }
</script>

<div class="summary-screen">
    <Card>
        {#if session}
            <div class="summary-content">
                <!-- Header -->
                <div class="header">
                    <div class="checkmark">✓</div>
                    <h1>Session Complete!</h1>
                </div>

                <!-- Stats -->
                <div class="stats-grid">
                    <!-- Accuracy -->
                    <div class="stat-card">
                        <div class="stat-label">Today's Accuracy</div>
                        <div class="stat-value">{session.accuracy.toFixed(1)}%</div>
                    </div>

                    <!-- Threshold -->
                    <div class="stat-card">
                        <div class="stat-label">Threshold Level</div>
                        <div class="stat-value">
                            {session.thresholdLevel.toFixed(1)}%
                            {#if previousThreshold !== null}
                                <span class="comparison">
                                    {#if session.thresholdLevel < previousThreshold}
                                        <span class="improving">↓</span>
                                    {:else if session.thresholdLevel > previousThreshold}
                                        <span class="declining">↑</span>
                                    {:else}
                                        <span class="stable">→</span>
                                    {/if}
                                </span>
                            {/if}
                        </div>
                    </div>

                    <!-- Streak -->
                    <div class="stat-card">
                        <div class="stat-label">Current Streak</div>
                        <div class="stat-value">
                            {#if streak > 0}
                                🔥 {streak} {streak === 1 ? 'day' : 'days'}
                            {:else}
                                Start today!
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Trend Indicator -->
                {#if previousThreshold !== null}
                    <div class="trend-section">
                        <div class="trend-indicator trend-{trend}">
                            {#if trend === 'improving'}
                                📈 Improving
                            {:else if trend === 'declining'}
                                📉 Keep Practicing
                            {:else}
                                ➡️ Stable
                            {/if}
                        </div>
                        <p class="trend-message">{getTrendMessage()}</p>
                    </div>
                {/if}

                <!-- Encouragement -->
                <div class="encouragement-section">
                    <p class="encouragement">{getEncouragementMessage()}</p>
                    <p class="streak-message">{getStreakMessage()}</p>
                </div>

                <!-- Session Details -->
                <div class="session-details">
                    <div class="detail">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value"
                            >{Math.floor(session.duration / 60)}:{(session.duration % 60)
                                .toString()
                                .padStart(2, '0')}</span
                        >
                    </div>
                    <div class="detail">
                        <span class="detail-label">Trials:</span>
                        <span class="detail-value">{session.trialsCompleted}</span>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="action-section">
                    <Button onclick={handleDone} fullWidth>Done</Button>
                </div>
            </div>
        {:else}
            <p>Loading...</p>
        {/if}
    </Card>
</div>

<style>
    .summary-screen {
        min-height: 100vh;
        padding: var(--spacing-lg);
        background-color: var(--color-background);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .summary-content {
        text-align: center;
        max-width: 500px;
        margin: 0 auto;
    }

    .header {
        margin-bottom: var(--spacing-xl);
    }

    .checkmark {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: var(--color-success, #22c55e);
        color: white;
        font-size: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--spacing-md);
    }

    h1 {
        font-size: var(--font-size-xxl, 2rem);
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .stat-card {
        padding: var(--spacing-md);
        background-color: var(--color-surface, #f8fafc);
        border-radius: var(--border-radius);
        border: 1px solid var(--color-border, #e2e8f0);
    }

    .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-xs);
    }

    .stat-value {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
    }

    .comparison {
        font-size: var(--font-size-lg);
    }

    .improving {
        color: var(--color-success, #22c55e);
    }

    .declining {
        color: var(--color-error, #ef4444);
    }

    .stable {
        color: var(--color-text-secondary);
    }

    .trend-section {
        margin-bottom: var(--spacing-xl);
        padding: var(--spacing-md);
        background-color: var(--color-surface, #f8fafc);
        border-radius: var(--border-radius);
    }

    .trend-indicator {
        font-size: var(--font-size-lg);
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
    }

    .trend-indicator.trend-improving {
        color: var(--color-success, #22c55e);
    }

    .trend-indicator.trend-declining {
        color: var(--color-error, #ef4444);
    }

    .trend-indicator.trend-stable {
        color: var(--color-text-secondary);
    }

    .trend-message {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
    }

    .encouragement-section {
        margin-bottom: var(--spacing-xl);
    }

    .encouragement {
        font-size: var(--font-size-md);
        color: var(--color-text);
        font-weight: 500;
        margin-bottom: var(--spacing-sm);
    }

    .streak-message {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
    }

    .session-details {
        display: flex;
        justify-content: center;
        gap: var(--spacing-xl);
        margin-bottom: var(--spacing-xl);
        padding: var(--spacing-md);
        background-color: var(--color-surface, #f8fafc);
        border-radius: var(--border-radius);
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .detail-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
    }

    .detail-value {
        font-size: var(--font-size-md);
        font-weight: 500;
        color: var(--color-text);
    }

    .action-section {
        margin-top: var(--spacing-xl);
    }

    @media (max-width: 640px) {
        .summary-screen {
            padding: var(--spacing-md);
        }

        h1 {
            font-size: var(--font-size-xl);
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .session-details {
            flex-direction: column;
            gap: var(--spacing-md);
        }
    }
</style>
