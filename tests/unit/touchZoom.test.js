import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TouchZoom } from '../../js/touchZoom.js';

describe('TouchZoom', () => {
    let touchZoom;
    let element;

    beforeEach(() => {
        element = document.createElement('img');
        element.style.width = '800px';
        element.style.height = '600px';
        Object.defineProperty(element, 'offsetWidth', { value: 800, configurable: true });
        Object.defineProperty(element, 'offsetHeight', { value: 600, configurable: true });
        document.body.appendChild(element);

        touchZoom = new TouchZoom();
        touchZoom.attach(element);
    });

    afterEach(() => {
        touchZoom.detach();
        document.body.removeChild(element);
    });

    describe('Initialization', () => {
        it('should initialize with default options', () => {
            expect(touchZoom.scale).toBe(1);
            expect(touchZoom.translateX).toBe(0);
            expect(touchZoom.translateY).toBe(0);
            expect(touchZoom.options.minScale).toBe(1);
            expect(touchZoom.options.maxScale).toBe(3);
            expect(touchZoom.options.doubleTapScale).toBe(2);
        });

        it('should accept custom options', () => {
            const customZoom = new TouchZoom({ minScale: 0.5, maxScale: 5, doubleTapScale: 3 });
            expect(customZoom.options.minScale).toBe(0.5);
            expect(customZoom.options.maxScale).toBe(5);
            expect(customZoom.options.doubleTapScale).toBe(3);
        });

        it('should attach event listeners and set styles', () => {
            expect(element.style.transformOrigin).toBe('center center');
            expect(element.style.transition).toBe('transform 0.1s ease-out');
        });
    });

    describe('Attach and Detach', () => {
        it('should detach from previous image when attaching to new one', () => {
            const element2 = document.createElement('img');
            document.body.appendChild(element2);

            touchZoom.attach(element2);
            expect(touchZoom.activeImage).toBe(element2);

            document.body.removeChild(element2);
        });

        it('should remove event listeners on detach', () => {
            touchZoom.detach();
            expect(touchZoom.activeImage).toBeNull();
            expect(touchZoom.scale).toBe(1);
        });

        it('should handle detach when no image is attached', () => {
            touchZoom.detach();
            touchZoom.detach(); // Should not throw
            expect(touchZoom.activeImage).toBeNull();
        });
    });

    describe('State Management', () => {
        it('should reset zoom state', () => {
            touchZoom.scale = 2;
            touchZoom.translateX = 100;
            touchZoom.translateY = 50;

            touchZoom.reset();

            expect(touchZoom.scale).toBe(1);
            expect(touchZoom.translateX).toBe(0);
            expect(touchZoom.translateY).toBe(0);
        });

        it('should report isZoomed correctly', () => {
            expect(touchZoom.isZoomed()).toBe(false);

            touchZoom.scale = 1.5;
            expect(touchZoom.isZoomed()).toBe(true);

            touchZoom.scale = 1;
            expect(touchZoom.isZoomed()).toBe(false);
        });
    });

    describe('Touch Event Handling', () => {
        function createTouchEvent(type, touches) {
            const event = new Event(type, { bubbles: true, cancelable: true });
            event.touches = touches;
            event.preventDefault = vi.fn();
            return event;
        }

        function createTouch(clientX, clientY) {
            return { clientX, clientY };
        }

        it('should handle double tap to zoom in', () => {
            const touch = createTouch(400, 300);
            const event1 = createTouchEvent('touchstart', [touch]);
            const event2 = createTouchEvent('touchstart', [touch]);

            touchZoom.handleTouchStart(event1);
            setTimeout(() => {
                touchZoom.handleTouchStart(event2);
                expect(touchZoom.scale).toBe(2);
            }, 100);
        });

        it('should handle double tap to zoom out when already zoomed', () => {
            touchZoom.scale = 2;

            const touch = createTouch(400, 300);
            const event1 = createTouchEvent('touchstart', [touch]);
            const event2 = createTouchEvent('touchstart', [touch]);

            touchZoom.handleTouchStart(event1);
            setTimeout(() => {
                touchZoom.handleTouchStart(event2);
                expect(touchZoom.scale).toBe(1);
            }, 100);
        });

        it('should setup panning when zoomed and single touch', () => {
            touchZoom.scale = 2;
            const touch = createTouch(400, 300);
            const event = createTouchEvent('touchstart', [touch]);

            touchZoom.handleTouchStart(event);

            expect(touchZoom.isDragging).toBe(true);
            expect(touchZoom.startX).toBe(400);
            expect(touchZoom.startY).toBe(300);
        });

        it('should handle pinch start with two fingers', () => {
            const touch1 = createTouch(300, 300);
            const touch2 = createTouch(500, 300);
            const event = createTouchEvent('touchstart', [touch1, touch2]);

            touchZoom.handleTouchStart(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(touchZoom.initialDistance).toBeGreaterThan(0);
            expect(touchZoom.initialScale).toBe(1);
        });

        it('should handle panning while zoomed', () => {
            touchZoom.scale = 2;
            touchZoom.isDragging = true;
            touchZoom.startX = 400;
            touchZoom.startY = 300;

            const touch = createTouch(450, 350);
            const event = createTouchEvent('touchmove', [touch]);

            touchZoom.handleTouchMove(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(touchZoom.translateX).toBe(50);
            expect(touchZoom.translateY).toBe(50);
        });

        it('should handle pinch zoom', () => {
            touchZoom.initialDistance = 200;
            touchZoom.initialScale = 1;

            const touch1 = createTouch(200, 300);
            const touch2 = createTouch(600, 300); // Distance = 400
            const event = createTouchEvent('touchmove', [touch1, touch2]);

            touchZoom.handleTouchMove(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(touchZoom.scale).toBe(2); // 400/200 = 2
        });

        it('should constrain scale to maxScale', () => {
            touchZoom.initialDistance = 100;
            touchZoom.initialScale = 2;

            const touch1 = createTouch(100, 300);
            const touch2 = createTouch(700, 300); // Distance = 600
            const event = createTouchEvent('touchmove', [touch1, touch2]);

            touchZoom.handleTouchMove(event);

            expect(touchZoom.scale).toBe(3); // Capped at maxScale
        });

        it('should constrain scale to minScale', () => {
            touchZoom.initialDistance = 400;
            touchZoom.initialScale = 1.5;

            const touch1 = createTouch(350, 300);
            const touch2 = createTouch(450, 300); // Distance = 100
            const event = createTouchEvent('touchmove', [touch1, touch2]);

            touchZoom.handleTouchMove(event);

            // 1.5 * (100/400) = 0.375, should be clamped to minScale (1)
            expect(touchZoom.scale).toBeGreaterThanOrEqual(1);
        });

        it('should reset initialDistance when ending pinch', () => {
            touchZoom.initialDistance = 200;

            const event = createTouchEvent('touchend', []);
            touchZoom.handleTouchEnd(event);

            expect(touchZoom.initialDistance).toBe(0);
            expect(touchZoom.isDragging).toBe(false);
        });

        it('should snap back to scale 1 if below minimum', (done) => {
            touchZoom.scale = 0.8;

            const event = createTouchEvent('touchend', []);
            touchZoom.handleTouchEnd(event);

            expect(touchZoom.scale).toBe(1);
            expect(touchZoom.translateX).toBe(0);
            expect(touchZoom.translateY).toBe(0);

            setTimeout(() => {
                expect(element.style.transition).toBe('transform 0.1s ease-out');
                done();
            }, 350);
        });

        it('should not process events when no active image', () => {
            touchZoom.detach();

            const touch = createTouch(400, 300);
            const event = createTouchEvent('touchstart', [touch]);

            touchZoom.handleTouchStart(event);
            touchZoom.handleTouchMove(event);
            touchZoom.handleTouchEnd(event);

            // Should not throw
            expect(true).toBe(true);
        });
    });

    describe('Helper Methods', () => {
        it('should calculate distance between two touches', () => {
            const touches = [
                { clientX: 0, clientY: 0 },
                { clientX: 3, clientY: 4 }
            ];

            const distance = touchZoom.getDistance(touches);
            expect(distance).toBe(5); // 3-4-5 triangle
        });

        it('should constrain pan within bounds', () => {
            touchZoom.scale = 2;
            touchZoom.translateX = 10000; // Way out of bounds
            touchZoom.translateY = 10000;

            touchZoom.constrainPan();

            // Should be constrained to reasonable values
            expect(Math.abs(touchZoom.translateX)).toBeLessThan(10000);
            expect(Math.abs(touchZoom.translateY)).toBeLessThan(10000);
        });

        it('should reset translation when image smaller than viewport', () => {
            touchZoom.scale = 0.5; // Image smaller than viewport
            touchZoom.translateX = 100;
            touchZoom.translateY = 100;

            touchZoom.constrainPan();

            expect(touchZoom.translateX).toBe(0);
            expect(touchZoom.translateY).toBe(0);
        });

        it('should update transform style', () => {
            touchZoom.scale = 2;
            touchZoom.translateX = 50;
            touchZoom.translateY = 30;

            touchZoom.updateTransform();

            expect(element.style.transform).toBe('translate(50px, 30px) scale(2)');
        });

        it('should handle updateTransform when no active image', () => {
            touchZoom.detach();
            touchZoom.updateTransform(); // Should not throw
            expect(true).toBe(true);
        });

        it('should handle constrainPan when no active image', () => {
            touchZoom.detach();
            touchZoom.constrainPan(); // Should not throw
            expect(true).toBe(true);
        });
    });
});
