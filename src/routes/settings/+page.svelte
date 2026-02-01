<script lang="ts">
    import { userProfile, setUserProfile } from '$lib/stores';
    import { saveUserProfile, getAllSessions, getAllAssessments, deleteAllData } from '$lib/db';
    import { Button, Card } from '$lib/components';
    import { logger } from '$lib/utils/logger';

    // Local state for settings
    let reminderEnabled = $state($userProfile?.settings.reminderEnabled ?? false);
    let reminderTime = $state($userProfile?.settings.reminderTime ?? '09:00');
    let trialsPerSession = $state($userProfile?.settings.trialsPerSession ?? 60);

    // Confirmation dialog state
    let showClearDataDialog = $state(false);

    // Track if settings have changed
    const hasChanges = $derived(
        $userProfile &&
            (reminderEnabled !== $userProfile.settings.reminderEnabled ||
                reminderTime !== $userProfile.settings.reminderTime ||
                trialsPerSession !== $userProfile.settings.trialsPerSession)
    );

    /**
     * Save updated settings to database
     */
    async function saveSettings(): Promise<void> {
        if (!$userProfile) {
            logger.error('Cannot save settings: no user profile');
            return;
        }

        try {
            const updatedProfile = {
                ...$userProfile,
                settings: {
                    reminderEnabled,
                    reminderTime,
                    trialsPerSession,
                },
            };

            await saveUserProfile(updatedProfile);
            setUserProfile(updatedProfile);

            logger.info('Settings saved successfully');
        } catch (error) {
            logger.error('Failed to save settings', { error });
        }
    }

    /**
     * Export all user data as JSON
     */
    async function exportData(): Promise<void> {
        try {
            const sessions = await getAllSessions();
            const assessments = await getAllAssessments();

            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                userProfile: $userProfile,
                sessions,
                assessments,
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `faceit-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);

            logger.info('Data exported successfully');
        } catch (error) {
            logger.error('Failed to export data', { error });
        }
    }

    /**
     * Clear all user data (with confirmation)
     */
    async function clearAllData(): Promise<void> {
        try {
            await deleteAllData();
            logger.info('All data cleared');

            // Redirect to welcome screen
            window.location.href = '/';
        } catch (error) {
            logger.error('Failed to clear data', { error });
        }
    }
</script>

<svelte:head>
    <title>Settings - FaceIt</title>
</svelte:head>

<div class="settings">
    <header class="header">
        <h1>Settings</h1>
        <a href="/" class="back-link">← Back to Dashboard</a>
    </header>

    {#if !$userProfile}
        <Card>
            <p class="error">No user profile found. Please complete onboarding first.</p>
        </Card>
    {:else}
        <!-- Notification Settings -->
        <Card>
            <h2>Notifications</h2>

            <div class="setting-group">
                <label class="toggle-label">
                    <input type="checkbox" bind:checked={reminderEnabled} />
                    <span class="toggle-text">Daily reminder</span>
                </label>
                <p class="setting-description">
                    Get a daily notification to help maintain your training streak
                </p>
            </div>

            {#if reminderEnabled}
                <div class="setting-group">
                    <label for="reminder-time" class="input-label">Reminder time</label>
                    <input
                        id="reminder-time"
                        type="time"
                        bind:value={reminderTime}
                        class="time-input"
                    />
                    <p class="setting-description">What time should we remind you?</p>
                </div>
            {/if}
        </Card>

        <!-- Session Settings -->
        <Card>
            <h2>Training Sessions</h2>

            <div class="setting-group">
                <label for="trials-per-session" class="input-label">Trials per session</label>
                <select id="trials-per-session" bind:value={trialsPerSession} class="select-input">
                    <option value={50}>50 trials (~8 minutes)</option>
                    <option value={60}>60 trials (~10 minutes)</option>
                    <option value={70}>70 trials (~12 minutes)</option>
                </select>
                <p class="setting-description">
                    More trials = longer sessions and more training per day
                </p>
            </div>
        </Card>

        <!-- Save Changes -->
        {#if hasChanges}
            <Card>
                <div class="actions">
                    <Button variant="primary" onclick={saveSettings}>Save Changes</Button>
                </div>
            </Card>
        {/if}

        <!-- Data Management -->
        <Card>
            <h2>Data</h2>

            <div class="setting-group">
                <Button variant="secondary" onclick={exportData} fullWidth={true}>
                    Export Data (JSON)
                </Button>
                <p class="setting-description">Download all your training data and progress</p>
            </div>

            <div class="setting-group">
                <Button
                    variant="secondary"
                    onclick={(): void => {
                        showClearDataDialog = true;
                    }}
                    fullWidth={true}
                >
                    Clear All Data
                </Button>
                <p class="setting-description warning">
                    ⚠️ This will delete all your progress and cannot be undone
                </p>
            </div>
        </Card>

        <!-- About -->
        <Card>
            <h2>About</h2>

            <div class="about-section">
                <p class="about-item">
                    <strong>Version:</strong> 1.0.0
                </p>
                <p class="about-item">
                    <strong>Privacy:</strong> All data stays on your device. No information is sent to
                    servers.
                </p>
                <p class="about-item">
                    <strong>Research:</strong> Based on evidence-based perceptual discrimination training
                    protocols.
                </p>
            </div>
        </Card>
    {/if}
</div>

<!-- Clear Data Confirmation Dialog -->
{#if showClearDataDialog}
    <div class="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div class="dialog">
            <h3 id="dialog-title">Clear All Data?</h3>
            <p>
                This will permanently delete all your training data, progress, and settings. This
                action cannot be undone.
            </p>
            <p class="warning-text">Are you sure you want to continue?</p>
            <div class="dialog-actions">
                <Button
                    variant="secondary"
                    onclick={(): void => {
                        showClearDataDialog = false;
                    }}
                >
                    Cancel
                </Button>
                <Button variant="primary" onclick={clearAllData}>Yes, Clear All Data</Button>
            </div>
        </div>
    </div>
{/if}

<style>
    .settings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        max-width: 600px;
        margin: 0 auto;
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
        margin: 0;
    }

    h2 {
        font-size: var(--font-size-xl);
        color: var(--color-text);
        margin-bottom: var(--spacing-md);
    }

    h3 {
        font-size: var(--font-size-lg);
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
    }

    .back-link {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
    }

    .back-link:hover {
        text-decoration: underline;
    }

    .error {
        color: var(--color-error);
        font-weight: 500;
    }

    .setting-group {
        margin-bottom: var(--spacing-lg);
    }

    .setting-group:last-child {
        margin-bottom: 0;
    }

    .toggle-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;
        user-select: none;
    }

    .toggle-label input[type='checkbox'] {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .toggle-text {
        font-size: var(--font-size-md);
        font-weight: 500;
        color: var(--color-text);
    }

    .input-label {
        display: block;
        font-size: var(--font-size-md);
        font-weight: 500;
        color: var(--color-text);
        margin-bottom: var(--spacing-xs);
    }

    .time-input {
        width: 100%;
        padding: var(--spacing-sm);
        font-size: var(--font-size-md);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        background: var(--color-background);
        color: var(--color-text);
    }

    .select-input {
        width: 100%;
        padding: var(--spacing-sm);
        font-size: var(--font-size-md);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        background: var(--color-background);
        color: var(--color-text);
        cursor: pointer;
    }

    .setting-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-top: var(--spacing-xs);
    }

    .setting-description.warning {
        color: var(--color-error);
    }

    .actions {
        display: flex;
        justify-content: center;
    }

    .about-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .about-item {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        line-height: 1.6;
    }

    .about-item strong {
        color: var(--color-text);
    }

    /* Dialog Styles */
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog {
        background: var(--color-background);
        border-radius: var(--border-radius);
        padding: var(--spacing-xl);
        max-width: 400px;
        margin: var(--spacing-md);
    }

    .dialog p {
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: var(--spacing-sm);
    }

    .warning-text {
        color: var(--color-error);
        font-weight: 500;
        margin-bottom: var(--spacing-md);
    }

    .dialog-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        margin-top: var(--spacing-lg);
    }

    @media (max-width: 600px) {
        .header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
        }

        .dialog {
            margin: var(--spacing-sm);
        }

        .dialog-actions {
            flex-direction: column;
            gap: var(--spacing-sm);
        }
    }
</style>
