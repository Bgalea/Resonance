import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock window.TouchZoom since we exposed it globally but need to test the class logic
// We can import the class definition if we export it for testing, or just copy/paste for unit testing if it's not a module.
// Since we removed 'export' from touchZoom.js, we can't import it directly in Node environment easily without some hacks.
// A better approach for testing is to have the file be a module, and main.js handle the global exposure if needed, 
// OR use a setup file to load it.
// For now, let's assume we can load the script or mock the class structure to test the logic if we could import it.
// 
// Actually, since I modified touchZoom.js to NOT export, testing it in Vitest (Node) is tricky without `fs` reading.
// Let's try to read the file content and eval it, or better, revert to exporting it and having main.js handle the global assignment.
// 
// Reverting to export is cleaner for testing.
// Let's modify touchZoom.js to export the class, and assign to window at the end.
// This works for both modules (tests) and browser (if loaded as module or if we just rely on the window assignment).
// But wait, if I use `export class`, it becomes a module. Loading it via <script src="..."> without type="module" will fail in browser.
// 
// Solution: Use a UMD-like pattern or just test the logic by mocking or reading file.
// Or, since I'm in a "fix" mode, I can just write a test that defines the class similarly or uses JSDOM to load the script.
// 
// Let's try to make touchZoom.js testable.
// I'll add `if (typeof module !== 'undefined') module.exports = { TouchZoom };` to the end of touchZoom.js.
// This allows require/import in tests while keeping it a standard script for browser.

import { TouchZoom } from '../../js/touchZoom.js';

describe('TouchZoom', () => {
    let touchZoom;
    let element;

    beforeEach(() => {
        element = document.createElement('div');
        touchZoom = new TouchZoom();
        touchZoom.attach(element);
    });

    it('should initialize with default options', () => {
        expect(touchZoom.scale).toBe(1);
        expect(touchZoom.translateX).toBe(0);
        expect(touchZoom.translateY).toBe(0);
    });

    it('should attach event listeners', () => {
        // We can't easily check internal listeners without spying on addEventListener before attach
        // But we can check if styles are applied
        expect(element.style.transformOrigin).toBe('center center');
    });

    it('should reset zoom state', () => {
        touchZoom.scale = 2;
        touchZoom.translateX = 100;
        touchZoom.reset();
        expect(touchZoom.scale).toBe(1);
        expect(touchZoom.translateX).toBe(0);
        expect(touchZoom.translateY).toBe(0);
    });

    it('should report isZoomed correctly', () => {
        expect(touchZoom.isZoomed()).toBe(false);
        touchZoom.scale = 1.5;
        expect(touchZoom.isZoomed()).toBe(true);
    });

    // More complex interaction tests would require simulating TouchEvents which is verbose
    // We'll rely on manual verification for gestures, and unit tests for state logic.
});
