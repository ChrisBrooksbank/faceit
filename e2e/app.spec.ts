import { test, expect } from '@playwright/test';

test.describe('FaceIt shell', () => {
    test('loads the first-run dashboard', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/FaceIt/);
        await expect(
            page.getByRole('banner').getByRole('heading', { name: 'FaceIt' })
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Welcome to FaceIt' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Start Assessment' })).toBeVisible();
    });

    test('navigates from dashboard to onboarding welcome', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Start Assessment' }).click();

        await expect(page).toHaveURL('/onboarding');
        await expect(
            page.getByRole('heading', { name: 'Train your brain to recognize faces better' })
        ).toBeVisible();
    });
});
