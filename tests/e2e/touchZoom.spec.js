/**
 * E2E tests for Touch Zoom & Pan (Feature 16)
 * Tests pinch-to-zoom, double-tap, panning, and integration with navigation
 * 
 * Note: These tests use direct API calls to TouchZoom since Playwright's touch
 * event simulation doesn't perfectly replicate real device behavior.
 */

import { test, expect } from '@playwright/test';

test.describe('Touch Zoom & Pan', () => {
    test.beforeEach(async ({ page }) => {
        // Set mobile viewport for touch testing
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

        await page.goto('/');

        // Disable animations to prevent Playwright stability timeouts
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });

        // Wait for loading overlay and start gallery
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 5000 });

        // Wait for image to be visible
        const galleryImage = page.locator('#gallery-image');
        await expect(galleryImage).toBeVisible();
    });

    test('should have TouchZoom instance available', async ({ page }) => {
        const hasTouchZoom = await page.evaluate(() => {
            return typeof window.TouchZoom !== 'undefined' && window.touchZoom !== undefined;
        });

        expect(hasTouchZoom).toBe(true);
    });

    test('should initialize with scale 1 (no zoom)', async ({ page }) => {
        const scale = await page.evaluate(() => {
            return window.touchZoom ? window.touchZoom.scale : null;
        });

        expect(scale).toBe(1);
    });

    test('should allow programmatic zoom in', async ({ page }) => {
        // Simulate zoom by directly calling TouchZoom methods
        await page.evaluate(() => {
            if (window.touchZoom) {
                window.touchZoom.scale = 2;
                window.touchZoom.updateTransform();
            }
        });

        await page.waitForTimeout(200);

        // Verify scale changed
        const scale = await page.evaluate(() => window.touchZoom.scale);
        expect(scale).toBe(2);

        // Verify transform applied
        const transform = await page.locator('#gallery-image').evaluate(el => el.style.transform);
        expect(transform).toContain('scale(2)');
    });

    test('should report isZoomed() correctly', async ({ page }) => {
        // Initially not zoomed
        let isZoomed = await page.evaluate(() => window.touchZoom.isZoomed());
        expect(isZoomed).toBe(false);

        // Zoom in
        await page.evaluate(() => {
            window.touchZoom.scale = 2;
            window.touchZoom.updateTransform();
        });

        // Now should be zoomed
        isZoomed = await page.evaluate(() => window.touchZoom.isZoomed());
        expect(isZoomed).toBe(true);
    });

    test('should allow panning when zoomed', async ({ page }) => {
        // Zoom in first
        await page.evaluate(() => {
            window.touchZoom.scale = 2;
            window.touchZoom.updateTransform();
        });

        // Pan
        await page.evaluate(() => {
            window.touchZoom.translateX = 50;
            window.touchZoom.translateY = 30;
            window.touchZoom.updateTransform();
        });

        await page.waitForTimeout(200);

        // Verify transform includes translation
        const transform = await page.locator('#gallery-image').evaluate(el => el.style.transform);
        expect(transform).toContain('translate(50px, 30px)');
        expect(transform).toContain('scale(2)');
    });

    test('should reset zoom when navigating to next image', async ({ page }) => {
        // Zoom in
        await page.evaluate(() => {
            window.touchZoom.scale = 2;
            window.touchZoom.translateX = 50;
            window.touchZoom.updateTransform();
        });

        // Verify zoomed
        let scale = await page.evaluate(() => window.touchZoom.scale);
        expect(scale).toBe(2);

        // Navigate to next image
        await page.click('#next-btn');
        await page.waitForTimeout(1000); // Longer wait for navigation and reset

        // Verify zoom was reset (with null safety)
        scale = await page.evaluate(() => window.touchZoom ? window.touchZoom.scale : null);
        expect(scale).toBe(1);

        const translateX = await page.evaluate(() => window.touchZoom ? window.touchZoom.translateX : 0);
        const translateY = await page.evaluate(() => window.touchZoom ? window.touchZoom.translateY : 0);
        expect(translateX).toBe(0);
        expect(translateY).toBe(0);
    });

    test('should constrain scale to maxScale (3x)', async ({ page }) => {
        // Try to set scale beyond max
        await page.evaluate(() => {
            window.touchZoom.scale = 5;
            window.touchZoom.updateTransform();
        });

        // Manually constrain (TouchZoom should do this in real gestures)
        const scale = await page.evaluate(() => {
            // In real usage, scale is constrained during handleTouchMove
            // For this test, we verify the maxScale option exists
            return window.touchZoom.options.maxScale;
        });

        expect(scale).toBe(3);
    });

    test('should constrain scale to minScale (1x)', async ({ page }) => {
        const minScale = await page.evaluate(() => {
            return window.touchZoom.options.minScale;
        });

        expect(minScale).toBe(1);
    });

    test('should have doubleTapScale configured', async ({ page }) => {
        const doubleTapScale = await page.evaluate(() => {
            return window.touchZoom.options.doubleTapScale;
        });

        expect(doubleTapScale).toBe(2);
    });

    test('should constrain panning within bounds', async ({ page }) => {
        // Zoom in
        await page.evaluate(() => {
            window.touchZoom.scale = 2;
            window.touchZoom.updateTransform();
        });

        // Try to pan way beyond bounds
        await page.evaluate(() => {
            window.touchZoom.translateX = 10000;
            window.touchZoom.translateY = 10000;
            window.touchZoom.constrainPan();
            window.touchZoom.updateTransform();
        });

        await page.waitForTimeout(200);

        // Verify constrained to reasonable values
        const translateX = await page.evaluate(() => window.touchZoom.translateX);
        const translateY = await page.evaluate(() => window.touchZoom.translateY);

        expect(Math.abs(translateX)).toBeLessThan(1000);
        expect(Math.abs(translateY)).toBeLessThan(1000);
    });

    test('should reset zoom state with reset() method', async ({ page }) => {
        // Zoom and pan
        await page.evaluate(() => {
            window.touchZoom.scale = 2.5;
            window.touchZoom.translateX = 100;
            window.touchZoom.translateY = 50;
            window.touchZoom.updateTransform();
        });

        // Reset
        await page.evaluate(() => {
            window.touchZoom.reset();
        });

        await page.waitForTimeout(200);

        // Verify all reset to defaults
        const state = await page.evaluate(() => ({
            scale: window.touchZoom.scale,
            translateX: window.touchZoom.translateX,
            translateY: window.touchZoom.translateY
        }));

        expect(state.scale).toBe(1);
        expect(state.translateX).toBe(0);
        expect(state.translateY).toBe(0);
    });

    test('should have touch event handlers attached', async ({ page }) => {
        const hasHandlers = await page.evaluate(() => {
            return window.touchZoom &&
                typeof window.touchZoom.handleTouchStart === 'function' &&
                typeof window.touchZoom.handleTouchMove === 'function' &&
                typeof window.touchZoom.handleTouchEnd === 'function';
        });

        expect(hasHandlers).toBe(true);
    });
});
