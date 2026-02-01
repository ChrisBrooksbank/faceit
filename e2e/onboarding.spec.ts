import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear IndexedDB before each test
        await page.goto('/');
        await page.evaluate(() => {
            return new Promise<void>((resolve): void => {
                const deleteRequest = indexedDB.deleteDatabase('FaceItDB');
                deleteRequest.onsuccess = (): void => resolve();
                deleteRequest.onerror = (): void => resolve();
            });
        });
        await page.reload();
    });

    test('should complete full onboarding flow', async ({ page }) => {
        // Welcome screen
        await page.goto('/onboarding');
        await expect(page.locator('h1')).toContainText('Welcome to FaceIt');
        await expect(page.locator('text=All data stays on your device')).toBeVisible();

        // Click Get Started
        await page.click('text=Get Started');
        await expect(page).toHaveURL('/onboarding/pi20');

        // PI20 Survey - answer all 20 questions
        for (let i = 1; i <= 20; i++) {
            await expect(page.locator(`text=Question ${i} of 20`)).toBeVisible();

            // Select response (using middle option - Neutral/3)
            const buttons = page.locator('button[aria-pressed]');
            await buttons.nth(2).click(); // Click "Neutral" option

            if (i < 20) {
                await page.click('text=Next');
            } else {
                await page.click('text=Continue');
            }
        }

        await expect(page).toHaveURL('/onboarding/perception');

        // Perception Test - complete 6 trials
        await expect(page.locator('text=6 trials')).toBeVisible();

        // Wait for first trial to start (target phase)
        await page.waitForTimeout(2500); // target (2000ms) + mask (500ms)

        // Complete all 6 trials by clicking first choice
        for (let trial = 1; trial <= 6; trial++) {
            const choices = page.locator('button[aria-label*="choice"]');
            await choices.first().click();
            await page.waitForTimeout(1500); // Wait for next trial
        }

        // Should show completion screen
        await expect(page.locator('text=Perception Test Complete')).toBeVisible();
        await page.click('text=Continue');
        await expect(page).toHaveURL('/onboarding/results');

        // Results screen
        await expect(page.locator('text=Your Assessment Results')).toBeVisible();
        await expect(page.locator('text=PI20 Score')).toBeVisible();
        await expect(page.locator('text=Perception Score')).toBeVisible();
        await page.click('text=Continue');
        await expect(page).toHaveURL('/onboarding/expectations');

        // Expectations screen
        await expect(page.locator('text=What to Expect')).toBeVisible();
        await expect(page.locator('text=This is training, not a cure')).toBeVisible();

        // Check acknowledgment checkbox
        await page.check('input[type="checkbox"]');
        await page.click('text=Start Training');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/');
        await expect(page.locator('text=Start Session')).toBeVisible();
    });

    test('should navigate back through PI20 survey', async ({ page }) => {
        await page.goto('/onboarding/pi20');

        // Answer first question
        const buttons = page.locator('button[aria-pressed]');
        await buttons.nth(2).click();
        await page.click('text=Next');

        // Check we're on question 2
        await expect(page.locator('text=Question 2 of 20')).toBeVisible();

        // Go back to question 1
        await page.click('text=Back');
        await expect(page.locator('text=Question 1 of 20')).toBeVisible();

        // Back from question 1 should go to welcome
        await page.click('text=Back');
        await expect(page).toHaveURL('/onboarding');
    });

    test('should require checkbox before starting training', async ({ page }) => {
        // Setup: complete onboarding up to expectations
        await page.goto('/onboarding/expectations');

        // Mock onboarding data
        await page.evaluate(() => {
            localStorage.setItem(
                'onboarding',
                JSON.stringify({
                    pi20Responses: Array(20).fill(3),
                    perceptionScore: 4,
                })
            );
        });
        await page.reload();

        // Start Training button should be disabled initially
        const startButton = page.locator('button:has-text("Start Training")');
        await expect(startButton).toBeDisabled();

        // Check the checkbox
        await page.check('input[type="checkbox"]');
        await expect(startButton).toBeEnabled();
    });

    test('should redirect if perception test incomplete', async ({ page }) => {
        // Try to access results without completing perception test
        await page.goto('/onboarding/results');

        // Should redirect to missing screen
        await expect(page).not.toHaveURL('/onboarding/results');
    });
});
