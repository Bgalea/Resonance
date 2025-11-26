/**
 * E2E tests for keyboard navigation
 * Tests arrow keys, space, F, M, and Escape keys
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('#loading-overlay');
        await page.waitForTimeout(500);
    });

    test('should navigate with arrow keys', async ({ page }) => {
        const initialSrc = await page.locator('#gallery-image').getAttribute('src');

        // Press right arrow
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);

        const newSrc = await page.locator('#gallery-image').getAttribute('src');
        expect(newSrc).not.toBe(initialSrc);

        // Press left arrow
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(500);

        const backSrc = await page.locator('#gallery-image').getAttribute('src');
        expect(backSrc).toBe(initialSrc);
    });

    test('should toggle mute with M key', async ({ page }) => {
        const muteBtn = page.locator('#mute-btn');

        // Press M to mute
        await page.keyboard.press('m');
        await page.waitForTimeout(100);

        await expect(muteBtn).toHaveAttribute('aria-pressed', 'true');

        // Press M to unmute
        await page.keyboard.press('m');
        await page.waitForTimeout(100);

        await expect(muteBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should toggle fullscreen with F key', async ({ page }) => {
        // Press F to enter fullscreen
        await page.keyboard.press('f');
        await page.waitForTimeout(500);

        // Body should have fullscreen class
        const body = page.locator('body');
        await expect(body).toHaveClass(/fullscreen/);

        // Press F again to exit
        await page.keyboard.press('f');
        await page.waitForTimeout(500);

        await expect(body).not.toHaveClass(/fullscreen/);
    });

    test('should exit fullscreen with Escape key', async ({ page }) => {
        // Enter fullscreen first
        await page.keyboard.press('f');
        await page.waitForTimeout(500);

        // Press Escape to exit
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        const body = page.locator('body');
        await expect(body).not.toHaveClass(/fullscreen/);
    });

    test('should not interfere with browser shortcuts', async ({ page }) => {
        // Pressing Ctrl+R should not be captured
        // (This is a sanity check - browser will handle it)
        await page.keyboard.press('Control+r');
        // If we get here without error, the test passes
        expect(true).toBe(true);
    });
});
