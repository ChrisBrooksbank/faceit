import { test, expect } from '@playwright/test';

test.describe('Progress and Settings', () => {
    test.beforeEach(async ({ page }) => {
        // Setup: Create user profile with session history
        await page.goto('/');
        await page.evaluate(() => {
            return new Promise<void>((resolve): void => {
                // Delete existing database
                const deleteRequest = indexedDB.deleteDatabase('FaceItDB');
                deleteRequest.onsuccess = (): void => {
                    // Open database and add data
                    const dbRequest = indexedDB.open('FaceItDB', 1);

                    dbRequest.onupgradeneeded = (event): void => {
                        const db = (event.target as IDBOpenDBRequest).result;
                        if (!db.objectStoreNames.contains('users')) {
                            db.createObjectStore('users', { keyPath: 'id' });
                        }
                        if (!db.objectStoreNames.contains('progress')) {
                            db.createObjectStore('progress', { keyPath: 'userId' });
                        }
                        if (!db.objectStoreNames.contains('sessions')) {
                            const sessionStore = db.createObjectStore('sessions', {
                                keyPath: 'id',
                            });
                            sessionStore.createIndex('by-date', 'date');
                        }
                    };

                    dbRequest.onsuccess = (): void => {
                        const db = dbRequest.result;
                        const tx = db.transaction(['users', 'progress', 'sessions'], 'readwrite');

                        const userProfile = {
                            id: 'test-user-id',
                            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                            pi20Score: 60,
                            pi20Responses: Array(20).fill(3),
                            baselinePerception: 4,
                            onboardingComplete: true,
                            settings: {
                                reminderEnabled: false,
                                reminderTime: '09:00',
                                trialsPerSession: 60,
                            },
                        };

                        const progressMetrics = {
                            userId: 'test-user-id',
                            currentStreak: 3,
                            longestStreak: 5,
                            totalSessions: 5,
                            totalTrainingTime: 3000, // 50 minutes
                            avgThreshold: 55,
                            bestThreshold: 50,
                            avgAccuracy: 75,
                            lastSessionDate: new Date(),
                            improvementRate: 8.5,
                        };

                        // Add some historical sessions
                        const sessions = [];
                        for (let i = 0; i < 5; i++) {
                            sessions.push({
                                id: `session-${i}`,
                                userId: 'test-user-id',
                                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                                duration: 600,
                                trialsCompleted: 50,
                                trialsTotal: 50,
                                accuracy: 70 + i,
                                thresholdLevel: 60 - i * 2,
                                thresholdHistory: [60, 58, 56, 54],
                                trials: [],
                                completed: true,
                            });
                        }

                        tx.objectStore('users').add(userProfile);
                        tx.objectStore('progress').add(progressMetrics);
                        sessions.forEach((session): void => {
                            tx.objectStore('sessions').add(session);
                        });

                        tx.oncomplete = (): void => {
                            db.close();
                            resolve();
                        };
                    };
                };
                deleteRequest.onerror = (): void => {
                    resolve();
                };
            });
        });
        await page.reload();
    });

    test('should display progress view with charts', async ({ page }) => {
        await page.goto('/');

        // Navigate to progress view
        await page.click('a:has-text("View Progress")');
        await expect(page).toHaveURL('/progress');

        // Check for key elements
        await expect(page.locator('h1:has-text("Your Progress")')).toBeVisible();

        // Statistics should be visible
        await expect(page.locator('text=Total Training Time')).toBeVisible();
        await expect(page.locator('text=Best Threshold')).toBeVisible();
        await expect(page.locator('text=Average Accuracy')).toBeVisible();
        await expect(page.locator('text=Longest Streak')).toBeVisible();

        // Charts should be present
        await expect(page.locator('text=Threshold Progress')).toBeVisible();
        await expect(page.locator('text=Accuracy Progress')).toBeVisible();

        // SVG charts should be rendered
        const svgElements = page.locator('svg');
        await expect(svgElements).toHaveCount(2);
    });

    test('should navigate back from progress to dashboard', async ({ page }) => {
        await page.goto('/progress');
        await page.click('button:has-text("Back to Dashboard")');
        await expect(page).toHaveURL('/');
    });

    test('should show empty state in progress when no sessions', async ({ page }) => {
        // Clear sessions
        await page.evaluate(() => {
            return new Promise<void>((resolve): void => {
                const dbRequest = indexedDB.open('FaceItDB', 1);
                dbRequest.onsuccess = (): void => {
                    const db = dbRequest.result;
                    const tx = db.transaction('sessions', 'readwrite');
                    tx.objectStore('sessions').clear();
                    tx.oncomplete = (): void => {
                        db.close();
                        resolve();
                    };
                };
            });
        });
        await page.reload();

        await page.goto('/progress');
        await expect(
            page.locator('text=/No training sessions yet|Start your first session/i')
        ).toBeVisible();
    });

    test('should display settings screen', async ({ page }) => {
        await page.goto('/');

        // Navigate to settings
        await page.click('a:has-text("Settings")');
        await expect(page).toHaveURL('/settings');

        // Check for key sections
        await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
        await expect(page.locator('text=Notifications')).toBeVisible();
        await expect(page.locator('text=Session Settings')).toBeVisible();
        await expect(page.locator('text=Data Management')).toBeVisible();
        await expect(page.locator('text=About')).toBeVisible();
    });

    test('should toggle reminder setting', async ({ page }) => {
        await page.goto('/settings');

        // Find reminder toggle
        const reminderToggle = page.locator('input[type="checkbox"]').first();

        // Initially should be unchecked (based on setup)
        await expect(reminderToggle).not.toBeChecked();

        // Toggle it
        await reminderToggle.check();

        // Save changes button should appear
        await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    });

    test('should change trials per session setting', async ({ page }) => {
        await page.goto('/settings');

        // Find trials per session select
        const trialsSelect = page.locator('select');
        await expect(trialsSelect).toHaveValue('60');

        // Change to 70 trials
        await trialsSelect.selectOption('70');

        // Save changes button should appear
        await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();

        // Save changes
        await page.click('button:has-text("Save Changes")');

        // Success message or button should disappear
        await expect(page.locator('button:has-text("Save Changes")')).not.toBeVisible();

        // Reload and verify persistence
        await page.reload();
        await expect(page.locator('select')).toHaveValue('70');
    });

    test('should export data as JSON', async ({ page }) => {
        await page.goto('/settings');

        // Setup download listener
        const downloadPromise = page.waitForEvent('download');

        // Click export button
        await page.click('button:has-text("Export Data")');

        // Wait for download
        const download = await downloadPromise;

        // Verify filename
        expect(download.suggestedFilename()).toMatch(/faceit-data-.*\.json/);
    });

    test('should confirm before deleting all data', async ({ page }) => {
        await page.goto('/settings');

        // Click delete button
        await page.click('button:has-text("Delete All Data")');

        // Confirmation dialog should appear
        await expect(page.locator('text=/Are you sure.*delete all data/i')).toBeVisible();

        // Cancel button should be present
        await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
        await expect(page.locator('button:has-text("Delete")')).toBeVisible();

        // Cancel the deletion
        await page.click('button:has-text("Cancel")');

        // Dialog should close
        await expect(page.locator('text=/Are you sure.*delete all data/i')).not.toBeVisible();
    });

    test('should delete all data and redirect to onboarding', async ({ page }) => {
        await page.goto('/settings');

        // Click delete button
        await page.click('button:has-text("Delete All Data")');

        // Confirm deletion
        await page.click('button:has-text("Delete"):last-of-type');

        // Should redirect to onboarding
        await expect(page).toHaveURL('/onboarding', { timeout: 5000 });
    });

    test('should navigate back from settings to dashboard', async ({ page }) => {
        await page.goto('/settings');
        await page.click('button:has-text("Back to Dashboard")');
        await expect(page).toHaveURL('/');
    });
});
