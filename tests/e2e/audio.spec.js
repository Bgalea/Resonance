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
    test('should change audio source when navigating to new group', async ({ page }) => {
        // Mock the config to have 2 groups with different audio
        await page.route('**/js/generatedConfig.js', route => {
            const mockConfig = `
                window.galleryConfig = {
                    title: "Test Gallery",
                    enableSound: true,
                    groups: [
                        {
                            name: "Group 1",
                            audioSrc: "assets/audio/audio1.mp3",
                            images: [
                                { src: "assets/img1.jpg", caption: "Image 1" },
                                { src: "assets/img2.jpg", caption: "Image 2" }
                            ]
                        },
                        {
                            name: "Group 2",
                            audioSrc: "assets/audio/audio2.mp3",
                            images: [
                                { src: "assets/img3.jpg", caption: "Image 3" }
                            ]
                        }
                    ]
                };
            `;
            route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: mockConfig
            });
        });

        // Mock asset requests to prevent 404 errors
        await page.route('**/assets/**/*', route => {
            const url = route.request().url();
            let contentType = 'application/octet-stream';
            let body = Buffer.from('');

            if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
                contentType = 'image/jpeg';
                // Minimal valid 1x1 JPEG image
                body = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=', 'base64');
            } else if (url.endsWith('.mp3') || url.endsWith('.ogg')) {
                contentType = 'audio/mpeg';
                // Minimal valid silent MP3
                body = Buffer.from('SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMQU1FMy45OC4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
            }

            route.fulfill({
                status: 200,
                contentType: contentType,
                body: body
            });
        });

        await page.goto('/');
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();

        // Wait for audio element to be created
        const audio = page.locator('audio').first(); // Get active audio (crossfading may have 2)

        // Check initial audio
        await expect(audio).toHaveAttribute('src', /audio1\.mp3/);

        // Navigate to next image (still in group 1)
        await page.click('#next-btn');
        await page.waitForTimeout(1000);

        // Audio should still be audio1
        await expect(audio).toHaveAttribute('src', /audio1\.mp3/);

        // Navigate to next image (now in group 2)
        await page.click('#next-btn');
        await page.waitForTimeout(2000);

        // Check new audio - wait for source to change
        await expect(audio).toHaveAttribute('src', /audio2\.mp3/, { timeout: 10000 });
    });

    test('should persist volume when changing groups', async ({ page }) => {
        // Mock the config
        await page.route('**/js/generatedConfig.js', route => {
            const mockConfig = `
                window.galleryConfig = {
                    title: "Test Gallery",
                    enableSound: true,
                    groups: [
                        { 
                            name: "G1", 
                            audioSrc: "assets/audio/a1.mp3", 
                            images: [
                                { src: "assets/i1.jpg", caption: "I1" },
                                { src: "assets/i2.jpg", caption: "I2" }
                            ] 
                        },
                        { 
                            name: "G2", 
                            audioSrc: "assets/audio/a2.mp3", 
                            images: [{ src: "assets/i3.jpg", caption: "I3" }] 
                        }
                    ]
                };
            `;
            route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: mockConfig
            });
        });

        await page.route('**/assets/**/*', route => {
            // When test tries to load "assets/i1.jpg"
            // Playwright intercepts it and provides fake image data
            // instead of looking for a real file
        });

        await page.goto('/', { waitUntil: 'domcontentloaded' }); // Don't wait for all assets
        const loadingOverlay = page.locator('#loading-overlay');
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();

        // Set volume
        const volumeSlider = page.locator('#volume-slider');
        await volumeSlider.evaluate(el => {
            el.value = '0.3';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Wait for state to persist
        await page.waitForTimeout(500);

        // Navigate to next image (still in group 1)
        await page.click('#next-btn');
        await page.waitForTimeout(1000);

        // Navigate to group 2
        await page.click('#next-btn');
        await page.waitForTimeout(2000);

        // Volume should still be 0.3
        await expect(volumeSlider).toHaveValue('0.3');

        // Audio element volume should also be 0.3
        const audioVolume = await page.$eval('audio', el => el.volume);
        expect(audioVolume).toBe(0.3);
    });
});
