/**
 * Touch & Gesture Controls
 * Handles swipe, tap, and long-press gestures.
 * Exposed as a global function to match project architecture.
 */
(function (window) {
    'use strict';

    /**
     * Initializes touch controls for the gallery.
     * @param {Object} options - Configuration options.
     * @param {HTMLElement} options.containerEl - The element to listen for touch events on.
     * @param {Function} [options.onSwipeLeft] - Callback for swipe left (next).
     * @param {Function} [options.onSwipeRight] - Callback for swipe right (previous).
     * @param {Function} [options.onTap] - Callback for tap (toggle UI).
     * @param {Function} [options.onLongPress] - Callback for long press (pause/resume).
     */
    function initTouchControls(options) {
        const {
            containerEl,
            onSwipeLeft,
            onSwipeRight,
            onTap,
            onLongPress
        } = options;

        if (!containerEl) {
            console.error('TouchControls: containerEl is required');
            return;
        }

        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let longPressTimer = null;
        let longPressTriggered = false;
        let isDragging = false;

        const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
        const TAP_THRESHOLD = 10;   // Maximum movement for a tap
        const LONG_PRESS_DURATION = 800; // ms

        // Touch Start
        containerEl.addEventListener('touchstart', (e) => {
            // We only care about single touch
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
            isDragging = false;
            longPressTriggered = false;

            // Start long press timer
            if (onLongPress) {
                longPressTimer = setTimeout(() => {
                    onLongPress();
                    longPressTriggered = true;
                }, LONG_PRESS_DURATION);
            }
        }, { passive: true });

        // Touch Move
        containerEl.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const diffX = Math.abs(touch.clientX - startX);
            const diffY = Math.abs(touch.clientY - startY);

            // Check if user moved enough to consider it a drag/swipe
            if (diffX > TAP_THRESHOLD || diffY > TAP_THRESHOLD) {
                isDragging = true;

                // Cancel long press if moving
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        }, { passive: true });

        // Touch End
        containerEl.addEventListener('touchend', (e) => {
            // Always clear the timer on end
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }

            // If long press already fired, don't trigger other gestures
            if (longPressTriggered) return;

            // If we were tracking a multi-touch or something else, ignore
            if (e.changedTouches.length !== 1) return;

            const touch = e.changedTouches[0];
            const diffX = touch.clientX - startX;
            const diffY = touch.clientY - startY;
            const timeDiff = Date.now() - startTime;

            // 1. Check for Swipe (Horizontal)
            // Must be a significant horizontal move and not too much vertical move
            if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffY) < 100) {
                if (diffX > 0) {
                    // Swipe Right -> Previous
                    if (onSwipeRight) onSwipeRight();
                } else {
                    // Swipe Left -> Next
                    if (onSwipeLeft) onSwipeLeft();
                }
            }
            // 2. Check for Tap
            // Must be little movement and short duration
            else if (!isDragging && Math.abs(diffX) < TAP_THRESHOLD && Math.abs(diffY) < TAP_THRESHOLD && timeDiff < LONG_PRESS_DURATION) {
                if (onTap) onTap();
            }
        });
    }

    // Expose globally
    window.initTouchControls = initTouchControls;

})(window);
