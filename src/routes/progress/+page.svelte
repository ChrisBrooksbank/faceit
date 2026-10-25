<script lang="ts">
    import { onMount } from 'svelte';
    import { progressMetrics } from '$lib/stores';
    import { getSessionsByDate, getAllAssessments } from '$lib/db';
    import { Button, Card } from '$lib/components';
    import { isLegacySession } from '$lib/core/progress';
    import { logger } from '$lib/utils/logger';
    import type { TrainingSession, Assessment } from '$lib/types';

    let sessions = $state<TrainingSession[]>([]);
    let assessments = $state<Assessment[]>([]);
    let isLoading = $state(true);

    onMount(async () => {
        try {
            const [fetchedSessions, fetchedAssessments] = await Promise.all([
                getSessionsByDate(),
                getAllAssessments(),
            ]);
            sessions = fetchedSessions.filter(s => s.completed && !isLegacySession(s));
            assessments = fetchedAssessments;
        } catch (error) {
            logger.error('Failed to load progress data', { error });
        } finally {
            isLoading = false;
        }
    });

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const createLineChart = (
        data: number[],
        width: number,
        height: number,
        yMin: number,
        yMax: number
    ): string => {
        if (data.length === 0) return '';

        const padding = 10;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        const xStep = chartWidth / Math.max(data.length - 1, 1);
        const yRange = yMax - yMin || 1;

        const points = data
            .map((value, index) => {
                const x = padding + index * xStep;
                const y = padding + chartHeight - ((value - yMin) / yRange) * chartHeight;
                return `${x},${y}`;
            })
            .join(' ');

        return points;
    };
</script>

<svelte:head>
    <title>Progress - FaceIt</title>
</svelte:head>

<div class="progress-page">
    <div class="header">
        <h1>Your Progress</h1>
        <Button
            variant="secondary"
            onclick={(): void => {
                window.location.href = '/';
            }}
        >
            Back to Dashboard
        </Button>
    </div>

    {#if isLoading}
        <Card>
            <p>Loading progress data...</p>
        </Card>
    {:else if sessions.length === 0}
        <Card>
            <h2>No Training Data Yet</h2>
            <p>Complete your first training session to see your progress!</p>
            <div class="actions">
                <Button
                    variant="primary"
                    onclick={(): void => {
                        window.location.href = '/training';
                    }}
                >
                    Start First Session
                </Button>
            </div>
        </Card>
    {:else}
        <!-- Statistics Summary -->
        <Card>
            <h2>Statistics Summary</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {formatTime($progressMetrics?.totalTrainingTime ?? 0)}
                        </div>
                        <div class="stat-label">Total Training Time</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {$progressMetrics?.bestThreshold
                                ? `${$progressMetrics.bestThreshold.toFixed(0)}%`
                                : 'N/A'}
                        </div>
                        <div class="stat-label">Best Threshold</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {$progressMetrics?.avgAccuracy
                                ? `${$progressMetrics.avgAccuracy.toFixed(1)}%`
                                : 'N/A'}
                        </div>
                        <div class="stat-label">Average Accuracy</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <div class="stat-value">
                            {$progressMetrics?.longestStreak ?? 0}
                        </div>
                        <div class="stat-label">Longest Streak (days)</div>
                    </div>
                </div>
            </div>
        </Card>

        <!-- Threshold Chart -->
        <Card>
            <h2>Threshold Level Over Time</h2>
            <p class="chart-description">Lower is better (harder difficulty)</p>
            <div class="chart-container">
                <svg viewBox="0 0 400 200" class="chart">
                    {#if sessions.length > 0}
                        {@const thresholds = sessions.map(s => s.thresholdLevel)}
                        {@const minThreshold = Math.min(...thresholds)}
                        {@const maxThreshold = Math.max(...thresholds)}
                        {@const yMin = Math.max(0, minThreshold - 10)}
                        {@const yMax = Math.min(100, maxThreshold + 10)}
                        {@const points = createLineChart(thresholds, 400, 200, yMin, yMax)}

                        <!-- Grid lines -->
                        <line x1="10" y1="10" x2="10" y2="190" stroke="#e5e7eb" stroke-width="1" />
                        <line
                            x1="10"
                            y1="190"
                            x2="390"
                            y2="190"
                            stroke="#e5e7eb"
                            stroke-width="1"
                        />

                        <!-- Data line -->
                        <polyline
                            {points}
                            fill="none"
                            stroke="var(--color-primary)"
                            stroke-width="2"
                        />

                        <!-- Data points -->
                        {#each thresholds as threshold, i}
                            {@const x = 10 + (i * (400 - 20)) / Math.max(thresholds.length - 1, 1)}
                            {@const y = 10 + 180 - ((threshold - yMin) / (yMax - yMin || 1)) * 180}
                            <circle cx={x} cy={y} r="3" fill="var(--color-primary)" />
                        {/each}

                        <!-- Y-axis labels -->
                        <text x="5" y="15" font-size="10" fill="#6b7280" text-anchor="end">
                            {yMax.toFixed(0)}%
                        </text>
                        <text x="5" y="195" font-size="10" fill="#6b7280" text-anchor="end">
                            {yMin.toFixed(0)}%
                        </text>
                    {/if}
                </svg>
                <div class="chart-x-label">Sessions (1 to {sessions.length})</div>
            </div>
        </Card>

        <!-- Accuracy Chart -->
        <Card>
            <h2>Accuracy Over Time</h2>
            <p class="chart-description">Percentage of correct responses</p>
            <div class="chart-container">
                <svg viewBox="0 0 400 200" class="chart">
                    {#if sessions.length > 0}
                        {@const accuracies = sessions.map(s => s.accuracy)}
                        {@const minAccuracy = Math.min(...accuracies)}
                        {@const maxAccuracy = Math.max(...accuracies)}
                        {@const yMin = Math.max(0, minAccuracy - 10)}
                        {@const yMax = Math.min(100, maxAccuracy + 10)}
                        {@const points = createLineChart(accuracies, 400, 200, yMin, yMax)}

                        <!-- Grid lines -->
                        <line x1="10" y1="10" x2="10" y2="190" stroke="#e5e7eb" stroke-width="1" />
                        <line
                            x1="10"
                            y1="190"
                            x2="390"
                            y2="190"
                            stroke="#e5e7eb"
                            stroke-width="1"
                        />

                        <!-- Data line -->
                        <polyline
                            {points}
                            fill="none"
                            stroke="var(--color-success)"
                            stroke-width="2"
                        />

                        <!-- Data points -->
                        {#each accuracies as accuracy, i}
                            {@const x = 10 + (i * (400 - 20)) / Math.max(accuracies.length - 1, 1)}
                            {@const y = 10 + 180 - ((accuracy - yMin) / (yMax - yMin || 1)) * 180}
                            <circle cx={x} cy={y} r="3" fill="var(--color-success)" />
                        {/each}

                        <!-- Y-axis labels -->
                        <text x="5" y="15" font-size="10" fill="#6b7280" text-anchor="end">
                            {yMax.toFixed(0)}%
                        </text>
                        <text x="5" y="195" font-size="10" fill="#6b7280" text-anchor="end">
                            {yMin.toFixed(0)}%
                        </text>
                    {/if}
                </svg>
                <div class="chart-x-label">Sessions (1 to {sessions.length})</div>
            </div>
        </Card>

        <!-- PI20 Comparison (if available) -->
        {#if assessments.length > 0}
            <Card>
                <h2>PI20 Assessment History</h2>
                <div class="assessment-list">
                    {#each assessments as assessment}
                        {@const date = new Date(assessment.date).toLocaleDateString()}
                        <div class="assessment-item">
                            <div class="assessment-date">{date}</div>
                            <div class="assessment-type">
                                {assessment.type === 'initial'
                                    ? 'Initial Assessment'
                                    : 'Follow-up Assessment'}
                            </div>
                            <div class="assessment-score">Score: {assessment.pi20Score}</div>
                        </div>
                    {/each}
                </div>
                {#if assessments.length > 1}
                    {@const initial = assessments[0]}
                    {@const latest = assessments[assessments.length - 1]}
                    {@const change = initial.pi20Score - latest.pi20Score}
                    <div class="assessment-summary">
                        {#if change > 0}
                            <p class="improvement">
                                📈 Your PI20 score has improved by {change} points since your initial
                                assessment!
                            </p>
                        {:else if change < 0}
                            <p class="no-change">
                                Your PI20 score is {Math.abs(change)} points higher than your initial
                                assessment. Keep training!
                            </p>
                        {:else}
                            <p class="no-change">
                                Your PI20 score is unchanged. Continue training to see improvement.
                            </p>
                        {/if}
                    </div>
                {/if}
            </Card>
        {/if}
    {/if}
</div>

<style>
    .progress-page {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
    }

    h1 {
        font-size: var(--font-size-2xl);
        color: var(--color-text);
    }

    h2 {
        font-size: var(--font-size-xl);
        margin-bottom: var(--spacing-md);
        color: var(--color-text);
    }

    p {
        color: var(--color-text-muted);
        line-height: 1.6;
    }

    .actions {
        margin-top: var(--spacing-md);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
        margin-top: var(--spacing-md);
    }

    .stat-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--color-bg);
        border-radius: var(--radius-md);
    }

    .stat-icon {
        font-size: 2rem;
    }

    .stat-content {
        flex: 1;
    }

    .stat-value {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: var(--spacing-xs);
    }

    .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
    }

    .chart-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--spacing-md);
    }

    .chart-container {
        margin-top: var(--spacing-md);
    }

    .chart {
        width: 100%;
        height: auto;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background-color: var(--color-surface);
    }

    .chart-x-label {
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-top: var(--spacing-sm);
    }

    .assessment-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }

    .assessment-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--color-bg);
        border-radius: var(--radius-md);
        align-items: center;
    }

    .assessment-date {
        font-weight: 500;
        color: var(--color-text);
    }

    .assessment-type {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
    }

    .assessment-score {
        font-weight: 600;
        color: var(--color-primary);
    }

    .assessment-summary {
        margin-top: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--color-success-bg);
        border-radius: var(--radius-md);
    }

    .improvement {
        color: var(--color-success);
        font-weight: 500;
    }

    .no-change {
        color: var(--color-text);
    }

    @media (max-width: 600px) {
        .header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .assessment-item {
            grid-template-columns: 1fr;
            gap: var(--spacing-xs);
        }
    }
</style>
