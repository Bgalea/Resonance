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



        const SWIPE_THRESHOLD = options.swipeThreshold || 50;
        const TAP_THRESHOLD = options.tapThreshold || 10;
        const LONG_PRESS_DURATION = options.longPressDuration || 800;

        // --- Touch Events ---
        containerEl.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        containerEl.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1) return;
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        containerEl.addEventListener('touchend', (e) => {
            if (e.changedTouches.length !== 1) return;
            handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target);
        });

        // --- Mouse Events (for desktop support) ---
        containerEl.addEventListener('mousedown', (e) => {
            // Only left click
            if (e.button !== 0) return;
            handleStart(e.clientX, e.clientY);
        });

        containerEl.addEventListener('mousemove', (e) => {
            // Only if button is held down (though mousedown sets isDragging state, we need to check)
            // But for swipe we need drag. For tap we don't need drag but we need to track movement.
            // We'll rely on our internal state.
            if (startTime > 0) { // If gesture started
                handleMove(e.clientX, e.clientY);
            }
        });

        containerEl.addEventListener('mouseup', (e) => {
            if (e.button !== 0) return;
            handleEnd(e.clientX, e.clientY, e.target);
            // Reset
            startTime = 0;
        });

        containerEl.addEventListener('mouseleave', () => {
            // Cancel gesture if mouse leaves container
            if (longPressTimer) clearTimeout(longPressTimer);
            startTime = 0;
        });

        // --- Unified Handlers ---
        function handleStart(x, y) {
            startX = x;
            startY = y;
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
        }

        function handleMove(x, y) {
            const diffX = Math.abs(x - startX);
            const diffY = Math.abs(y - startY);

            // Check if user moved enough to consider it a drag/swipe
            if (diffX > TAP_THRESHOLD || diffY > TAP_THRESHOLD) {
                isDragging = true;

                // Cancel long press if moving
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        }

        function handleEnd(x, y, target) {
            // Always clear the timer on end
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }

            // If long press already fired, don't trigger other gestures
            if (longPressTriggered) return;

            // Ensure we had a start event
            if (startTime === 0) return;

            const diffX = x - startX;
            const diffY = y - startY;
            const timeDiff = Date.now() - startTime;

            // 1. Check for Swipe (Horizontal)
            if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffY) < 100) {
                if (diffX > 0) {
                    if (onSwipeRight) onSwipeRight();
                } else {
                    if (onSwipeLeft) onSwipeLeft();
                }
            }
            // 2. Check for Tap
            else if (!isDragging && Math.abs(diffX) < TAP_THRESHOLD && Math.abs(diffY) < TAP_THRESHOLD && timeDiff < LONG_PRESS_DURATION) {
                const isInteractive = target.closest('button, input, select, textarea, a, [role="button"]');
                if (!isInteractive && onTap) {
                    onTap();
                }
            }
        }
    }

    // Expose globally
    window.initTouchControls = initTouchControls;

})(window);
