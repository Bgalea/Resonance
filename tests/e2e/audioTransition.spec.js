import { test, expect } from '@playwright/test';

test.describe('Audio Transition (Crossfading)', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the config to have 2 groups with known structure
        await page.route('**/js/generatedConfig.js', route => {
            const mockConfig = `
                window.galleryConfig = {
                    title: "Test Gallery",
                    enableSound: true,
                    transitions: { type: 'fade', duration: 200 },
                    groups: [
                        {
                            name: "Group 1",
                            audioSrc: "assets/audio/g1.mp3",
                            images: [
                                { src: "assets/g1_1.jpg", caption: "G1_1" },
                                { src: "assets/g1_2.jpg", caption: "G1_2" },
                                { src: "assets/g1_3.jpg", caption: "G1_3" }
                            ]
                        },
                        {
                            name: "Group 2",
                            audioSrc: "assets/audio/g2.mp3",
                            images: [
                                { src: "assets/g2_1.jpg", caption: "G2_1" }
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

        // Mock asset requests
        await page.route('**/assets/**/*', route => {
            const url = route.request().url();
            let contentType = 'application/octet-stream';
            let body = Buffer.from('');

            if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
                contentType = 'image/jpeg';
                body = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=', 'base64');
            } else if (url.endsWith('.mp3') || url.endsWith('.ogg')) {
                contentType = 'audio/mpeg';
                body = Buffer.from('SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMQU1FMy45OC4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
            }

            route.fulfill({
                status: 200,
                contentType: contentType,
                body: body
            });
        });

        await page.goto('/');

        // Disable animations to prevent Playwright stability timeouts
        await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });

        // Add logging
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // Clear localStorage
        await page.evaluate(() => localStorage.clear());

        const loadingOverlay = page.locator('#loading-overlay');
        // Wait for event listeners to be attached
        await loadingOverlay.waitFor({ state: 'attached' });
        await expect(loadingOverlay).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
        await loadingOverlay.click();
        await expect(loadingOverlay).toHaveClass(/hidden/, { timeout: 2000 });

        // Wait for audio to initialize
        await page.waitForTimeout(500);
    });

    test('should crossfade audio when switching groups', async ({ page }) => {
        // Wait for audioPlayer to be initialized
        await page.waitForFunction(() => window.audioPlayer !== undefined && window.audioPlayer !== null, { timeout: 10000 });

        // 1. Verify initial audio state (Group 1)
        const initialState = await page.evaluate(() => {
            return {
                hasAudioPlayer: !!window.audioPlayer,
                volume: window.audioPlayer?.volume || -1,
                src: window.audioPlayer?.audio?.src || ''
            };
        });

        expect(initialState.hasAudioPlayer).toBe(true);
        expect(initialState.volume).toBe(0.7);
        expect(initialState.src).toContain('g1.mp3');

        // 2. Navigate to Group 2
        // Group 1 has 3 images, so we need to click next 3 times to get to Group 2
        await page.click('#next-btn'); // Image 2
        await page.waitForTimeout(300);
        await page.click('#next-btn'); // Image 3
        await page.waitForTimeout(300);
        await page.click('#next-btn'); // Group 2, Image 1

        // 3. Wait for crossfade to complete (2000ms + buffer)
        await page.waitForTimeout(2500);

        // 4. Verify Final State
        const finalState = await page.evaluate(() => {
            const player = window.audioPlayer;
            return {
                hasFadingAudio: !!player.fadingAudio,
                volume: player.audio.volume,
                src: player.audio.src,
                isMuted: player.isMuted,
                audioCount: document.querySelectorAll('audio').length
            };
        });

        // After crossfade completes:
        // - No fading audio should remain
        // - Volume should be back to target (0.7)
        // - Source should be group2
        // - Only one audio element should exist
        expect(finalState.hasFadingAudio).toBe(false);
        expect(finalState.volume).toBe(0.7);
        expect(finalState.src).toContain('g2.mp3');
        expect(finalState.audioCount).toBe(1);
    });
});
