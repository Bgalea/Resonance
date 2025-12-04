/**
 * E2E tests for error handling
 * Tests missing assets, network failures, and graceful degradation
 */

import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
        // Disable animations
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    });

    test('should handle missing image gracefully', async ({ page }) => {
        // Mock config with a missing image
        await page.route('**/js/generatedConfig.js', route => {
            const mockConfig = `
                window.galleryConfig = {
                    title: "Error Test",
                    groups: [{
                        name: "Group 1",
                        audioSrc: "audio.mp3",
                        images: [{ src: "non-existent.jpg" }]
                    }]
                };
            `;
            route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: mockConfig
            });
        });

        // Mock 404 for the image
        await page.route('**/non-existent.jpg', route => route.fulfill({ status: 404 }));

        await page.goto('/');

        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });

        // Even with error, it should eventually become ready (maybe with a warning or just load what it can)
        // Or it might hang if we don't handle errors correctly.
        // The AssetLoader should handle this.

        // We expect the app NOT to crash.
        // The loading overlay might stay or go away depending on implementation.
        // Assuming AssetLoader resolves null for failed images and continues.

        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();

        // Gallery should be visible
        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).toBeVisible();

        // Src might be empty or the broken link
        // Just verify we are on the main screen
        await expect(page.locator('.gallery-container')).toBeVisible();
    });

    test('should handle missing audio gracefully', async ({ page }) => {
        // Mock config with missing audio
        await page.route('**/js/generatedConfig.js', route => {
            const mockConfig = `
                window.galleryConfig = {
                    title: "Error Test",
                    groups: [{
                        name: "Group 1",
                        audioSrc: "missing-audio.mp3",
                        images: [{ src: "img1.jpg" }]
                    }]
                };
            `;
            route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: mockConfig
            });
        });

        // Mock 404 for audio
        await page.route('**/missing-audio.mp3', route => route.fulfill({ status: 404 }));

        // Mock image success
        await page.route('**/img1.jpg', route => route.fulfill({
            status: 200,
            contentType: 'image/jpeg',
            body: Buffer.from('fake image data')
        }));

        await page.goto('/');

        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });

        // Should still load
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();

        // Audio controls might be disabled or just silent
        const audio = page.locator('audio');

        // In Webkit, the audio element might not be attached if source is invalid/missing
        // or it might be attached but have no src.
        // We just want to ensure the app didn't crash.
        const galleryContainer = page.locator('.gallery-container');
        await expect(galleryContainer).toBeVisible();

        // Optional check for audio
        if (await audio.count() > 0) {
            await expect(audio).toBeAttached();
        }
    });

    test('should handle network timeout for assets', async ({ page }) => {
        // Mock config
        await page.route('**/js/generatedConfig.js', route => {
            const mockConfig = `
                window.galleryConfig = {
                    title: "Timeout Test",
                    groups: [{
                        name: "Group 1",
                        audioSrc: "audio.mp3",
                        images: [{ src: "timeout.jpg" }]
                    }]
                };
            `;
            route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: mockConfig
            });
        });

        // Simulate timeout for image
        await page.route('**/timeout.jpg', async route => {
            // Never fulfill, or fulfill after long delay
            // But we want to test timeout handling in AssetLoader
            // AssetLoader doesn't have explicit timeout, it relies on browser.
            // We can abort the request.
            await route.abort('timedout');
        });

        await page.goto('/');

        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });

        // Should eventually handle the error (AssetLoader catches onerror)
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
    });
});
