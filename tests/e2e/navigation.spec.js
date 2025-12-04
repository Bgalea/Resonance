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

        // Wait for event listeners to be attached
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });

        // Click to start
        await loadingOverlay.click();

        // Wait for loading overlay to disappear
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        // First image should be visible
        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).toBeVisible();
        await expect(galleryImage).toHaveAttribute('src', /.+/);
    });

    test('should navigate to next image', async ({ page }) => {
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        // Get initial image src
        const initialSrc = await page.locator('#gallery-image').getAttribute('src');

        // Click next button
        await page.click('#next-btn');

        // Image should change
        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).not.toHaveAttribute('src', initialSrc);
    });

    test('should navigate to previous image', async ({ page }) => {
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

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
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

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
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        const prevBtn = page.locator('#prev-btn');
        await expect(prevBtn).toBeDisabled();
    });

    test.skip('should disable next button at end', async ({ page }) => {
        // Skipped because navigating to the end of a large gallery takes too long
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        // Navigate to last image (assuming small test gallery)
        const nextBtn = page.locator('#next-btn');

        // Keep clicking until disabled
        while (await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForTimeout(500);
        }

        await expect(nextBtn).toBeDisabled();
    });

    // Helper for swipe simulation
    // Helper for swipe simulation
    const simulateSwipe = async (page, direction) => {
        const container = page.locator('.gallery-container');
        const box = await container.boundingBox();
        if (!box) throw new Error('Gallery container not found');

        const centerY = box.y + box.height / 2;
        const centerX = box.x + box.width / 2;

        let startX, endX;
        if (direction === 'left') {
            // Swipe Left: Drag from Right to Left
            startX = centerX + 100;
            endX = centerX - 100;
        } else {
            // Swipe Right: Drag from Left to Right
            startX = centerX - 100;
            endX = centerX + 100;
        }

        // Simulate drag gesture
        await page.mouse.move(startX, centerY);
        await page.mouse.down();
        // Move in steps to simulate real drag
        await page.mouse.move(endX, centerY, { steps: 10 });
        await page.mouse.up();
    };

    test('should navigate to next image on swipe left', async ({ page }) => {
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        const initialSrc = await page.locator('#gallery-image').getAttribute('src');

        // Simulate swipe left
        await simulateSwipe(page, 'left');

        await page.waitForTimeout(500); // Wait for transition

        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).not.toHaveAttribute('src', initialSrc);
    });

    test('should navigate to previous image on swipe right', async ({ page }) => {
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        // Go to next image first so we can go back
        await page.click('#next-btn');
        await page.waitForTimeout(500);

        const secondImageSrc = await page.locator('#gallery-image').getAttribute('src');

        // Simulate swipe right
        await simulateSwipe(page, 'right');

        await page.waitForTimeout(500);

        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).not.toHaveAttribute('src', secondImageSrc);
    });
});
