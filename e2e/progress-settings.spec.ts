import { test, expect, type Page } from '@playwright/test';

test.describe('Progress and settings', () => {
    test.beforeEach(async ({ page }) => {
        await seedUserWithHistory(page);
    });

    test('shows progress charts and statistics', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'View Progress' }).click();

        await expect(page).toHaveURL('/progress');
        await expect(page.getByRole('heading', { name: 'Your Progress' })).toBeVisible();
        await expect(page.getByText('Total Training Time')).toBeVisible();
        await expect(page.getByText('Best Threshold')).toBeVisible();
        await expect(page.getByText('Average Accuracy')).toBeVisible();
        await expect(page.getByText('Longest Streak (days)')).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Threshold Level Over Time' })
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Accuracy Over Time' })).toBeVisible();
        await expect(page.locator('svg')).toHaveCount(2);
    });

    test('saves settings changes and keeps data controls available', async ({ page }) => {
        await page.goto('/settings');

        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Training Sessions' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Data' })).toBeVisible();

        await page.locator('#trials-per-session').selectOption('70');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByRole('button', { name: 'Save Changes' })).not.toBeVisible();

        await page.reload();
        await expect(page.locator('#trials-per-session')).toHaveValue('70');
        await expect(page.getByRole('button', { name: 'Export Data (JSON)' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Clear All Data' })).toBeVisible();
    });

    test('opens and cancels the clear-data confirmation', async ({ page }) => {
        await page.goto('/settings');
        await page.getByRole('button', { name: 'Clear All Data' }).click();

        await expect(page.getByRole('heading', { name: 'Clear All Data?' })).toBeVisible();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByRole('heading', { name: 'Clear All Data?' })).not.toBeVisible();
    });
});

async function seedUserWithHistory(page: Page): Promise<void> {
    await page.goto('/');
    await page.evaluate(async () => {
        await new Promise<void>(resolve => {
            const deleteRequest = indexedDB.deleteDatabase('FaceItDB');
            deleteRequest.onsuccess = (): void => resolve();
            deleteRequest.onerror = (): void => resolve();
            deleteRequest.onblocked = (): void => resolve();
        });

        await new Promise<void>((resolve, reject) => {
            const dbRequest = indexedDB.open('FaceItDB', 1);

            dbRequest.onupgradeneeded = (): void => {
                const db = dbRequest.result;
                db.createObjectStore('users', { keyPath: 'id' });
                const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
                sessionStore.createIndex('by-date', 'date');
                const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id' });
                assessmentStore.createIndex('by-date', 'date');
                db.createObjectStore('progress', { keyPath: 'userId' });
            };

            dbRequest.onerror = (): void => reject(dbRequest.error);
            dbRequest.onsuccess = (): void => {
                const db = dbRequest.result;
                const tx = db.transaction(['users', 'progress', 'sessions'], 'readwrite');
                tx.objectStore('users').put({
                    id: 'test-user-id',
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    pi20Score: 60,
                    pi20Responses: Array(20).fill(3),
                    baselinePerception: 4,
                    onboardingComplete: true,
                    settings: {
                        reminderEnabled: false,
                        reminderTime: '09:00',
                        trialsPerSession: 60,
                    },
                });
                tx.objectStore('progress').put({
                    userId: 'test-user-id',
                    currentStreak: 3,
                    longestStreak: 5,
                    totalSessions: 5,
                    totalTrainingTime: 3000,
                    avgThreshold: 55,
                    bestThreshold: 50,
                    avgAccuracy: 75,
                    lastSessionDate: new Date(),
                    improvementRate: 8.5,
                });

                for (let index = 0; index < 5; index++) {
                    tx.objectStore('sessions').put({
                        id: `session-${index}`,
                        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
                        duration: 600,
                        trialsCompleted: 50,
                        trialsTotal: 50,
                        accuracy: 70 + index,
                        thresholdLevel: 60 - index * 2,
                        thresholdHistory: [60, 58, 56, 54],
                        trials: [],
                        completed: true,
                    });
                }

                tx.oncomplete = (): void => {
                    db.close();
                    resolve();
                };
                tx.onerror = (): void => reject(tx.error);
            };
        });
    });
    await page.reload();
}
