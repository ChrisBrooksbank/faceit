import { test, expect } from '@playwright/test';

test.describe('Training Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Setup: Create a user profile in IndexedDB
        await page.goto('/');
        await page.evaluate(() => {
            return new Promise<void>((resolve): void => {
                // Delete existing database
                const deleteRequest = indexedDB.deleteDatabase('FaceItDB');
                deleteRequest.onsuccess = (): void => {
                    // Open database and add user profile
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
                        const tx = db.transaction(['users', 'progress'], 'readwrite');

                        const userProfile = {
                            id: 'test-user-id',
                            createdAt: new Date(),
                            pi20Score: 60,
                            pi20Responses: Array(20).fill(3),
                            baselinePerception: 4,
                            onboardingComplete: true,
                            settings: {
                                reminderEnabled: false,
                                reminderTime: '09:00',
                                trialsPerSession: 50,
                            },
                        };

                        const progressMetrics = {
                            userId: 'test-user-id',
                            currentStreak: 0,
                            longestStreak: 0,
                            totalSessions: 0,
                            totalTrainingTime: 0,
                            avgThreshold: 60,
                            bestThreshold: 60,
                            avgAccuracy: 0,
                            lastSessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                            improvementRate: 0,
                        };

                        tx.objectStore('users').add(userProfile);
                        tx.objectStore('progress').add(progressMetrics);

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

    test('should show dashboard for onboarded user', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('text=Welcome back')).toBeVisible();
        await expect(page.locator('button:has-text("Start Session")')).toBeVisible();
    });

    test('should start and pause training session', async ({ page }) => {
        await page.goto('/');
        await page.click('button:has-text("Start Session")');
        await expect(page).toHaveURL('/training');

        // Wait for trial to start
        await page.waitForTimeout(3000); // Wait for target + mask phases

        // Progress should be visible
        await expect(page.locator('text=/Trial \\d+ of \\d+/')).toBeVisible();

        // Click pause button
        await page.click('button:has-text("Pause")');

        // Pause menu should appear
        await expect(page.locator('text=Session Paused')).toBeVisible();
        await expect(page.locator('button:has-text("Resume")')).toBeVisible();
        await expect(page.locator('button:has-text("Exit")')).toBeVisible();

        // Resume session
        await page.click('button:has-text("Resume")');

        // Should return to training
        await expect(page.locator('text=Session Paused')).not.toBeVisible();
    });

    test('should complete short training session', async ({ page }) => {
        // Set very short session length for testing
        await page.goto('/');
        await page.evaluate(() => {
            return new Promise<void>((resolve): void => {
                const dbRequest = indexedDB.open('FaceItDB', 1);
                dbRequest.onsuccess = (): void => {
                    const db = dbRequest.result;
                    const tx = db.transaction('users', 'readwrite');
                    tx.objectStore('users').get('test-user-id').onsuccess = (event): void => {
                        const user = (event.target as IDBRequest).result;
                        user.settings.trialsPerSession = 3; // Very short for testing
                        tx.objectStore('users').put(user);
                    };
                    tx.oncomplete = (): void => {
                        db.close();
                        resolve();
                    };
                };
            });
        });
        await page.reload();

        // Start session
        await page.click('button:has-text("Start Session")');
        await expect(page).toHaveURL('/training');

        // Complete 3 trials
        for (let i = 0; i < 3; i++) {
            await page.waitForTimeout(2500); // target + mask
            const choices = page.locator('button[aria-label*="choice"]');
            await choices.first().click();
            await page.waitForTimeout(1000); // feedback delay
        }

        // Should redirect to summary
        await expect(page).toHaveURL('/training/summary', { timeout: 10000 });
        await expect(page.locator('text=Session Complete')).toBeVisible();
        await expect(page.locator("text=Today's Accuracy")).toBeVisible();
        await expect(page.locator('text=Threshold Level')).toBeVisible();
    });

    test('should exit training with confirmation', async ({ page }) => {
        await page.goto('/');
        await page.click('button:has-text("Start Session")');
        await expect(page).toHaveURL('/training');

        // Wait for trial to start
        await page.waitForTimeout(3000);

        // Pause and exit
        await page.click('button:has-text("Pause")');
        await page.click('button:has-text("Exit")');

        // Confirmation dialog should appear
        await expect(page.locator('text=/exit.*will break your streak/i')).toBeVisible();

        // Confirm exit
        await page.click('button:has-text("Yes, Exit")');

        // Should return to dashboard
        await expect(page).toHaveURL('/');
    });

    test('should show session already completed today', async ({ page }) => {
        // Add a session from today
        await page.evaluate(() => {
            return new Promise<void>((resolve): void => {
                const dbRequest = indexedDB.open('FaceItDB', 1);
                dbRequest.onsuccess = (): void => {
                    const db = dbRequest.result;
                    const tx = db.transaction('sessions', 'readwrite');

                    const session = {
                        id: 'test-session-id',
                        userId: 'test-user-id',
                        date: new Date(),
                        duration: 600,
                        trialsCompleted: 50,
                        trialsTotal: 50,
                        accuracy: 75,
                        thresholdLevel: 55,
                        thresholdHistory: [60, 58, 56, 55],
                        trials: [],
                        completed: true,
                    };

                    tx.objectStore('sessions').add(session);
                    tx.oncomplete = (): void => {
                        db.close();
                        resolve();
                    };
                };
            });
        });
        await page.reload();

        await page.goto('/');

        // Start Session button should be disabled
        const startButton = page.locator('button:has-text("Start Session")');
        await expect(startButton).toBeDisabled();
        await expect(page.locator('text=/Done for today|Session completed/i')).toBeVisible();
    });

    test('should navigate from summary back to dashboard', async ({ page }) => {
        // Add session data
        await page.evaluate(() => {
            localStorage.setItem(
                'currentSession',
                JSON.stringify({
                    id: 'test-session-id',
                    userId: 'test-user-id',
                    date: new Date().toISOString(),
                    duration: 600,
                    trialsCompleted: 50,
                    trialsTotal: 50,
                    accuracy: 75,
                    thresholdLevel: 55,
                    thresholdHistory: [60, 58, 56, 55],
                    trials: [],
                    completed: true,
                })
            );
            localStorage.setItem('currentStreak', '1');
        });

        await page.goto('/training/summary');
        await expect(page.locator('text=Session Complete')).toBeVisible();

        // Click back to dashboard
        await page.click('button:has-text("Back to Dashboard")');
        await expect(page).toHaveURL('/');
    });
});
