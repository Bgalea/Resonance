/**
 * E2E tests for fullscreen mode
 * Tests fullscreen toggle, auto-hiding controls, and exit
 */

import { test, expect } from '@playwright/test';

test.describe('Fullscreen Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Disable animations to prevent Playwright stability timeouts
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
        const loadingOverlay = page.locator('#loading-overlay');
        // Wait for event listeners to be attached
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 2000 });
    });

    test('should have fullscreen button visible', async ({ page }) => {
        const fullscreenBtn = page.locator('#fullscreen-btn');
        await expect(fullscreenBtn).toBeVisible();
    });

    test('should toggle fullscreen with button', async ({ page }) => {
        const fullscreenBtn = page.locator('#fullscreen-btn');
        const body = page.locator('body');

        // Enter fullscreen
        await fullscreenBtn.click();
        await page.waitForTimeout(500);

        await expect(body).toHaveClass(/fullscreen/);

        // Exit fullscreen
        await fullscreenBtn.click();
        await page.waitForTimeout(500);

        await expect(body).not.toHaveClass(/fullscreen/);
    });

    test('should have accessible fullscreen button', async ({ page }) => {
        const fullscreenBtn = page.locator('#fullscreen-btn');
        await expect(fullscreenBtn).toHaveAttribute('aria-label');
    });

    test('should maintain gallery functionality in fullscreen', async ({ page }) => {
        // Enter fullscreen
        await page.click('#fullscreen-btn');
        await page.waitForTimeout(500);

        // Navigation should still work
        const initialSrc = await page.locator('#gallery-image').getAttribute('src');
        await page.click('#next-btn');
        await page.waitForTimeout(500);

        const newSrc = await page.locator('#gallery-image').getAttribute('src');
        expect(newSrc).not.toBe(initialSrc);
    });

    test('should show controls in fullscreen', async ({ page }) => {
        await page.click('#fullscreen-btn');
        await page.waitForTimeout(500);

        const controls = page.locator('.controls-wrapper');
        await expect(controls).toBeVisible();
    });
    test('should toggle controls on tap', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'Tap simulation flaky on Webkit');

        // Tap on the image (center)
        const image = page.locator('#gallery-image');
        const box = await image.boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

        await page.waitForTimeout(500);

        const controls = page.locator('.controls-wrapper');
        // Check if controls are hidden or shown (toggled)
        // Initially visible, so should hide
        await expect(controls).toHaveClass(/hidden-controls/);

        // Tap again to show
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
        await expect(controls).not.toHaveClass(/hidden-controls/);
    });

    test('should auto-hide controls after inactivity in fullscreen', async ({ page }) => {
        // Enter fullscreen
        await page.click('#fullscreen-btn');
        await page.waitForTimeout(500);

        const controls = page.locator('.controls-wrapper');
        await expect(controls).toBeVisible();

        // Wait for auto-hide timeout (assuming default is 3000ms)
        // We'll wait 3500ms to be safe
        await page.waitForTimeout(3500);

        await expect(controls).toHaveClass(/hidden-controls/);
    });

    test('should show controls on mouse move in fullscreen', async ({ page, isMobile }) => {
        test.skip(isMobile, 'Mouse move not applicable on mobile');

        // Enter fullscreen
        await page.click('#fullscreen-btn');
        await page.waitForTimeout(500);

        // Wait for auto-hide
        await page.waitForTimeout(3500);
        const controls = page.locator('.controls-wrapper');
        await expect(controls).toHaveClass(/hidden-controls/);

        // Move mouse
        await page.mouse.move(200, 200);
        await page.mouse.move(210, 210); // Move a bit to trigger event

        await expect(controls).not.toHaveClass(/hidden-controls/);
    });
});
