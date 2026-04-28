import { test, expect, type Page } from '@playwright/test';

test.describe('Training flow', () => {
    test.beforeEach(async ({ page }) => {
        await seedOnboardedUser(page, 3);
    });

    test('shows the dashboard for an onboarded user', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByText('Welcome back!')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible();
    });

    test('pauses, resumes, and exits a session with a partial save', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Start Session' }).click();

        await expect(page).toHaveURL('/training');
        await expect(page.getByText('Trial 1 of 3')).toBeVisible();

        await page.getByRole('button', { name: 'Pause' }).click();
        await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();

        await page.getByRole('button', { name: 'Resume' }).click();
        await expect(page.getByRole('heading', { name: 'Paused' })).not.toBeVisible();

        await page.getByRole('button', { name: 'Pause' }).click();
        await page.getByRole('button', { name: 'Exit Session' }).click();
        await expect(page.getByRole('heading', { name: 'Exit Session?' })).toBeVisible();
        await page.getByRole('button', { name: 'Exit' }).click();
        await expect(page).toHaveURL('/');
    });

    test('completes a short session and updates progress', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Start Session' }).click();

        for (let trial = 1; trial <= 3; trial++) {
            await expect(page.getByText(`Trial ${trial} of 3`)).toBeVisible();
            await clickFirstChoice(page);
        }

        await expect(page).toHaveURL('/training/summary', { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Session Complete!' })).toBeVisible();
        await expect(page.getByText("Today's Accuracy")).toBeVisible();
        await page.getByRole('button', { name: 'Done' }).click();

        await expect(page).toHaveURL('/');
        await expect(page.getByText('Session completed today!')).toBeVisible();
        await expect(page.getByText('1 day streak!')).toBeVisible();
    });
});

async function seedOnboardedUser(page: Page, trialsPerSession: number): Promise<void> {
    await page.goto('/');
    await page.evaluate(async sessionLength => {
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
                const tx = db.transaction(['users', 'progress'], 'readwrite');
                tx.objectStore('users').put({
                    id: 'test-user-id',
                    createdAt: new Date(),
                    pi20Score: 60,
                    pi20Responses: Array(20).fill(3),
                    baselinePerception: 4,
                    onboardingComplete: true,
                    settings: {
                        reminderEnabled: false,
                        reminderTime: '09:00',
                        trialsPerSession: sessionLength,
                    },
                });
                tx.objectStore('progress').put({
                    userId: 'test-user-id',
                    currentStreak: 0,
                    longestStreak: 0,
                    totalSessions: 0,
                    totalTrainingTime: 0,
                    avgThreshold: 0,
                    bestThreshold: 0,
                    avgAccuracy: 0,
                    lastSessionDate: null,
                    improvementRate: 0,
                });
                tx.oncomplete = (): void => {
                    db.close();
                    resolve();
                };
                tx.onerror = (): void => reject(tx.error);
            };
        });
    }, trialsPerSession);
    await page.reload();
}

async function clickFirstChoice(page: Page): Promise<void> {
    const choice = page.getByRole('button', { name: 'Choice 1' });
    await expect(choice).toBeVisible({ timeout: 8_000 });
    await expect(choice).toBeEnabled({ timeout: 8_000 });
    await choice.click();
}
