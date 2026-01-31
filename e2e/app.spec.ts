import { test, expect } from '@playwright/test';

test.describe('FaceIt Application', () => {
    test('should load the home page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/FaceIt/);
    });

    test('should display the header', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('header h1')).toHaveText('FaceIt');
    });

    test('should show running status', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.status')).toHaveText('Running');
    });
});
