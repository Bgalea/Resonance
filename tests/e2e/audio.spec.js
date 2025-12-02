/**
 * E2E tests for audio controls
 * Tests volume slider, mute button, and audio playback
 */

import { test, expect } from '@playwright/test';

test.describe('Audio Controls', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Disable animations to prevent Playwright stability timeouts
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });

        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
        await page.evaluate(() => localStorage.clear());
        const loadingOverlay = page.locator('#loading-overlay');
        // Wait for event listeners to be attached
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 2000 });
    });


    test('should have audio controls visible', async ({ page, browserName }) => {
        const controls = page.locator('.audio-controls');
        await expect(controls).toBeVisible();
    });

    test('should mute and unmute audio', async ({ page, browserName }) => {
        const muteBtn = page.locator('#mute-btn');

        // Initial state: unmuted (aria-pressed="false")
        await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');

        // Click mute
        await muteBtn.click();
        await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');

        // Click unmute
        await muteBtn.click();
        await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should adjust volume with slider', async ({ page, browserName }) => {
        const volumeSlider = page.locator('#volume-slider');

        // Set volume
        await volumeSlider.evaluate(el => {
            el.value = '0.5';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Check value property
        await expect(volumeSlider).toHaveValue('0.5');
    });

    test('should persist volume across page reloads', async ({ page, browserName }) => {
        test.setTimeout(60000); // Increase timeout for Firefox reload

        const volumeSlider = page.locator('#volume-slider');

        // Set volume
        await volumeSlider.evaluate(el => {
            el.value = '0.8';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Wait for event to process and localStorage to save
        await page.waitForTimeout(500);

        // Reload page
        await page.reload();
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 2000 });

        // Check persistence
        await expect(volumeSlider).toHaveValue('0.8');
    });

    test('should persist mute state across page reloads', async ({ page, browserName }) => {
        test.setTimeout(60000); // Increase timeout for Firefox reload

        const muteBtn = page.locator('#mute-btn');

        // Mute
        await muteBtn.click();

        // Reload page
        await page.reload();
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 2000 });

        // Check persistence
        await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should have accessible labels', async ({ page, browserName }) => {
        const muteBtn = page.locator('#mute-btn');
        const volumeSlider = page.locator('#volume-slider');

        await expect(muteBtn).toHaveAttribute('aria-label');
        await expect(volumeSlider).toHaveAttribute('aria-label');
    });
});
