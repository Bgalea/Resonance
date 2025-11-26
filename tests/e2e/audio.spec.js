/**
 * E2E tests for audio controls
 * Tests volume slider, mute button, and audio playback
 */

import { test, expect } from '@playwright/test';

test.describe('Audio Controls', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('#loading-overlay');
        await page.waitForTimeout(500);
    });

    test('should have audio controls visible', async ({ page }) => {
        const muteBtn = page.locator('#mute-btn');
        const volumeSlider = page.locator('#volume-slider');

        await expect(muteBtn).toBeVisible();
        await expect(volumeSlider).toBeVisible();
    });

    test('should mute and unmute audio', async ({ page }) => {
        const muteBtn = page.locator('#mute-btn');

        // Click to mute
        await muteBtn.click();
        await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');

        // Click to unmute
        await muteBtn.click();
        await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should adjust volume with slider', async ({ page }) => {
        const volumeSlider = page.locator('#volume-slider');

        // Get initial value
        const initialValue = await volumeSlider.getAttribute('value');

        // Set to 0.5
        await volumeSlider.fill('0.5');

        const newValue = await volumeSlider.getAttribute('value');
        expect(newValue).toBe('0.5');
        expect(newValue).not.toBe(initialValue);
    });

    test('should persist volume across page reloads', async ({ page }) => {
        const volumeSlider = page.locator('#volume-slider');

        // Set volume to 0.7
        await volumeSlider.fill('0.7');

        // Reload page
        await page.reload();
        await page.click('#loading-overlay');
        await page.waitForTimeout(500);

        // Volume should be persisted
        const persistedValue = await page.locator('#volume-slider').getAttribute('value');
        expect(persistedValue).toBe('0.7');
    });

    test('should persist mute state across page reloads', async ({ page }) => {
        const muteBtn = page.locator('#mute-btn');

        // Mute audio
        await muteBtn.click();

        // Reload page
        await page.reload();
        await page.click('#loading-overlay');
        await page.waitForTimeout(500);

        // Mute state should be persisted
        await expect(page.locator('#mute-btn')).toHaveAttribute('aria-pressed', 'true');
    });

    test('should have accessible labels', async ({ page }) => {
        const muteBtn = page.locator('#mute-btn');
        const volumeSlider = page.locator('#volume-slider');

        await expect(muteBtn).toHaveAttribute('aria-label');
        await expect(volumeSlider).toHaveAttribute('aria-label');
    });
});
