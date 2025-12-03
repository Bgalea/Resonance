import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('HTML Structure Validation', () => {
    let htmlContent;

    // Read index.html once for all tests
    beforeAll(() => {
        const htmlPath = join(__dirname, '../../index.html');
        htmlContent = readFileSync(htmlPath, 'utf-8');
    });

    it('should have valid HTML structure with no duplicate DOCTYPE', () => {
        const doctypeMatches = htmlContent.match(/<!DOCTYPE/gi);
        expect(doctypeMatches).toHaveLength(1);
    });

    it('should have no duplicate <html> tags', () => {
        const htmlTagMatches = htmlContent.match(/<html/gi);
        expect(htmlTagMatches).toHaveLength(1);
    });

    it('should have no duplicate <head> tags', () => {
        const headTagMatches = htmlContent.match(/<head>/gi);
        expect(headTagMatches).toHaveLength(1);
    });

    it('should have no duplicate <body> tags', () => {
        const bodyTagMatches = htmlContent.match(/<body>/gi);
        expect(bodyTagMatches).toHaveLength(1);
    });

    it('should have all required script tags in correct order', () => {
        const requiredScripts = [
            'js/browserCompatibility.js',
            'js/generatedConfig.js',
            'js/assetLoader.js',
            'js/gallery.js',
            'js/loadingStateManager.js',
            'js/transitionManager.js',
            'js/touchZoom.js',
            'js/touchControls.js',
            'js/fullscreen.js',
            'js/audioLoader.js'
        ];

        requiredScripts.forEach(script => {
            expect(htmlContent).toContain(`src="${script}"`);
        });

        // Verify order (generatedConfig should come before gallery)
        const generatedConfigIndex = htmlContent.indexOf('js/generatedConfig.js');
        const galleryIndex = htmlContent.indexOf('js/gallery.js');
        expect(generatedConfigIndex).toBeLessThan(galleryIndex);

        // touchZoom should come before touchControls
        const touchZoomIndex = htmlContent.indexOf('js/touchZoom.js');
        const touchControlsIndex = htmlContent.indexOf('js/touchControls.js');
        expect(touchZoomIndex).toBeLessThan(touchControlsIndex);
    });

    it('should have all required UI elements', () => {
        const requiredElements = [
            'id="loading-overlay"',
            'id="gallery-image"',
            'id="gallery-caption"',
            'id="gallery-group"',
            'id="mute-btn"',
            'id="volume-slider"',
            'id="fullscreen-btn"',
            'id="prev-btn"',
            'id="next-btn"',
            'class="gallery-container"',
            'class="image-wrapper"',
            'class="controls-wrapper"',
            'class="audio-controls"'
        ];

        requiredElements.forEach(element => {
            expect(htmlContent).toContain(element);
        });
    });

    it('should not have duplicate IDs', () => {
        const idMatches = htmlContent.match(/id="([^"]+)"/g);
        if (idMatches) {
            const ids = idMatches.map(match => match.match(/id="([^"]+)"/)[1]);
            const uniqueIds = new Set(ids);

            expect(ids.length).toBe(uniqueIds.size);
        }
    });

    it('should have proper closing tags', () => {
        // Count opening and closing tags for critical elements
        const htmlOpenCount = (htmlContent.match(/<html/gi) || []).length;
        const htmlCloseCount = (htmlContent.match(/<\/html>/gi) || []).length;
        expect(htmlOpenCount).toBe(htmlCloseCount);

        const headOpenCount = (htmlContent.match(/<head>/gi) || []).length;
        const headCloseCount = (htmlContent.match(/<\/head>/gi) || []).length;
        expect(headOpenCount).toBe(headCloseCount);

        const bodyOpenCount = (htmlContent.match(/<body>/gi) || []).length;
        const bodyCloseCount = (htmlContent.match(/<\/body>/gi) || []).length;
        expect(bodyOpenCount).toBe(bodyCloseCount);
    });

    it('should have touchZoom.js script tag', () => {
        expect(htmlContent).toContain('src="js/touchZoom.js"');
    });

    it('should have valid meta tags', () => {
        expect(htmlContent).toContain('<meta charset="UTF-8">');
        expect(htmlContent).toContain('name="viewport"');
        expect(htmlContent).toContain('Content-Security-Policy');
    });

    it('should have proper document structure (DOCTYPE, html, head, body)', () => {
        // Verify basic structure order
        const doctypeIndex = htmlContent.indexOf('<!DOCTYPE');
        const htmlIndex = htmlContent.indexOf('<html');
        const headIndex = htmlContent.indexOf('<head>');
        const bodyIndex = htmlContent.indexOf('<body>');

        expect(doctypeIndex).toBeLessThan(htmlIndex);
        expect(htmlIndex).toBeLessThan(headIndex);
        expect(headIndex).toBeLessThan(bodyIndex);
    });

    it('should not have corrupted or malformed structure', () => {
        // Check for common corruption patterns
        expect(htmlContent).not.toMatch(/<html[^>]*>\s*<html/i); // Duplicate html after html
        expect(htmlContent).not.toMatch(/<\/body>\s*<body/i); // Body after closing body
        expect(htmlContent).not.toMatch(/<\/html>\s*<!DOCTYPE/i); // DOCTYPE after closing html
    });
});
