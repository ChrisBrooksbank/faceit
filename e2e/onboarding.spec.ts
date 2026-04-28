import { test, expect, type Page } from '@playwright/test';

test.describe('Onboarding flow', () => {
    test('completes onboarding, persists the user, and shows the dashboard after reload', async ({
        page,
    }) => {
        await page.goto('/onboarding');
        await page.getByRole('button', { name: 'Get Started' }).click();

        for (let question = 1; question <= 20; question++) {
            await expect(page.getByText(`Question ${question} of 20`)).toBeVisible();
            await page.getByRole('button', { name: '3 Neutral' }).click();
            await page.getByRole('button', { name: question === 20 ? 'Continue' : 'Next' }).click();
        }

        await expect(page).toHaveURL('/onboarding/perception');
        for (let trial = 1; trial <= 6; trial++) {
            await expect(page.getByText(`Trial ${trial} of 6`)).toBeVisible();
            await clickFirstChoice(page);
        }

        await expect(page.getByRole('heading', { name: 'Test Complete' })).toBeVisible();
        await page.getByRole('button', { name: 'View Your Results' }).click();

        await expect(page).toHaveURL('/onboarding/results');
        await expect(page.getByRole('heading', { name: 'Your Assessment Results' })).toBeVisible();
        await expect(page.getByText('/ 100')).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page).toHaveURL('/onboarding/expectations');
        await page
            .getByLabel('I understand this requires consistent practice and realistic expectations')
            .check();
        await page.getByRole('button', { name: 'Start Training' }).click();

        await expect(page).toHaveURL('/');
        await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible();
        await expect(page.getByText('Sessions Completed')).toBeVisible();

        await page.reload();
        await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible();
        await expect(page.getByText('Sessions Completed')).toBeVisible();
    });

    test('requires acknowledgment before completing expectations', async ({ page }) => {
        await page.goto('/onboarding');
        await page.getByRole('button', { name: 'Get Started' }).click();

        for (let question = 1; question <= 20; question++) {
            await page.getByRole('button', { name: '3 Neutral' }).click();
            await page.getByRole('button', { name: question === 20 ? 'Continue' : 'Next' }).click();
        }

        for (let trial = 1; trial <= 6; trial++) {
            await clickFirstChoice(page);
        }

        await page.getByRole('button', { name: 'View Your Results' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();

        const startTraining = page.getByRole('button', { name: 'Start Training' });
        await expect(startTraining).toBeDisabled();
        await page
            .getByLabel('I understand this requires consistent practice and realistic expectations')
            .check();
        await expect(startTraining).toBeEnabled();
    });
});

async function clickFirstChoice(page: Page): Promise<void> {
    const choice = page.getByRole('button', { name: 'Choice 1' });
    await expect(choice).toBeVisible({ timeout: 8_000 });
    await expect(choice).toBeEnabled({ timeout: 8_000 });
    await choice.click();
}
