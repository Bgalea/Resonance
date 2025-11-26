/**
 * E2E tests for basic gallery navigation
 * Tests loading, navigation buttons, and counter updates
 */

import { test, expect } from '@playwright/test';

test.describe('Gallery Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
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

        // Get initial image src
        const initialSrc = await page.locator('#gallery-image').getAttribute('src');

        // Click next button
        await page.click('#next-btn');

        // Image should change
        const newSrc = await page.locator('#gallery-image').getAttribute('src');
        expect(newSrc).not.toBe(initialSrc);
    });

    test('should navigate to previous image', async ({ page }) => {
        await page.click('#loading-overlay');

        // Navigate to second image first
        await page.click('#next-btn');
        await page.waitForTimeout(500);

        const secondImageSrc = await page.locator('#gallery-image').getAttribute('src');

        // Navigate back
        await page.click('#prev-btn');
        await page.waitForTimeout(500);

        const firstImageSrc = await page.locator('#gallery-image').getAttribute('src');
        expect(firstImageSrc).not.toBe(secondImageSrc);
    });

    test('should update counter when navigating', async ({ page }) => {
        await page.click('#loading-overlay');

        // Check initial counter
        const caption = page.locator('#gallery-caption');
        const initialText = await caption.textContent();

        // Navigate
        await page.click('#next-btn');
        await page.waitForTimeout(500);

        // Counter should update
        const newText = await caption.textContent();
        expect(newText).not.toBe(initialText);
    });

    test('should disable previous button at start', async ({ page }) => {
        await page.click('#loading-overlay');

        const prevBtn = page.locator('#prev-btn');
        await expect(prevBtn).toBeDisabled();
    });

    test('should disable next button at end', async ({ page }) => {
        await page.click('#loading-overlay');

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
