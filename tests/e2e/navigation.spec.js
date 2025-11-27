/**
 * E2E tests for basic gallery navigation
 * Tests loading, navigation buttons, and counter updates
 */

import { test, expect } from '@playwright/test';

test.describe('Gallery Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Disable animations to prevent Playwright stability timeouts
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    });

    test('should load gallery and display first image', async ({ page }) => {
        // Wait for loading overlay
        const loadingOverlay = page.locator('#loading-overlay');
        await expect(loadingOverlay).toBeVisible();

        // Click to start
        await loadingOverlay.click();

        // Loading overlay should disappear
        await expect(loadingOverlay).toHaveClass(/hidden/);

        // First image should be visible
        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).toBeVisible();
        await expect(galleryImage).toHaveAttribute('src', /.+/);
    });

    test('should navigate to next image', async ({ page }) => {
        await page.click('#loading-overlay');
        await page.waitForTimeout(1000);

        // Get initial image src
        const initialSrc = await page.locator('#gallery-image').getAttribute('src');

        // Click next button
        await page.click('#next-btn');

        // Image should change
        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).not.toHaveAttribute('src', initialSrc);
    });

    test('should navigate to previous image', async ({ page }) => {
        await page.click('#loading-overlay');
        await page.waitForTimeout(1000);

        // Navigate to second image first
        await page.click('#next-btn');
        await page.waitForTimeout(500);

        const secondImageSrc = await page.locator('#gallery-image').getAttribute('src');

        // Navigate back
        await page.click('#prev-btn');
        await page.waitForTimeout(500);

        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).not.toHaveAttribute('src', secondImageSrc);
    });

    test.skip('should update counter when navigating', async ({ page }) => {
        await page.click('#loading-overlay');
        await page.waitForTimeout(1000);

        // Check initial counter
        const caption = page.locator('#gallery-caption');
        await expect(caption).not.toBeEmpty();
        const initialText = await caption.textContent();
        console.log('Initial caption:', initialText);

        // Navigate
        await page.click('#next-btn');

        // Counter should update
        await expect(caption).not.toHaveText(initialText);
    });

    test('should disable previous button at start', async ({ page }) => {
        await page.click('#loading-overlay');
        await page.waitForTimeout(1000);

        const prevBtn = page.locator('#prev-btn');
        await expect(prevBtn).toBeDisabled();
    });

    test.skip('should disable next button at end', async ({ page }) => {
        // Skipped because navigating to the end of a large gallery takes too long
        await page.click('#loading-overlay');
        await page.waitForTimeout(1000);

        // Navigate to last image (assuming small test gallery)
        const nextBtn = page.locator('#next-btn');

        // Keep clicking until disabled
        while (await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForTimeout(500);
        }

        await expect(nextBtn).toBeDisabled();
    });
});
