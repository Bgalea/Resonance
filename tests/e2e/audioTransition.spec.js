import { test, expect } from '@playwright/test';

test.describe('Audio Transition (Crossfading)', () => {
    test.beforeEach(async ({ page }) => {
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
        expect(initialState.src).toContain('group1');

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
        expect(finalState.src).toContain('group2');
        expect(finalState.audioCount).toBe(1);
    });
});
