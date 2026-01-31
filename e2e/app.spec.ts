import { test, expect } from '@playwright/test';

test.describe('FaceIt Application', () => {
    test('should load the home page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/FaceIt/);
    });

    test('should display the header with app name', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('header h1')).toHaveText('FaceIt');
    });

    test('should show welcome card', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.welcome h2')).toHaveText('Welcome to FaceIt');
    });

    test('should have start assessment link', async ({ page }) => {
        await page.goto('/');
        const startButton = page.locator('a.btn-primary');
        await expect(startButton).toHaveText('Start Assessment');
        await expect(startButton).toHaveAttribute('href', '/onboarding');
    });
});
