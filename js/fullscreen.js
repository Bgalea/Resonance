/**
 * Fullscreen Mode Module
 * Handles entering/exiting fullscreen and auto-hiding controls.
 */
(function (window) {
    'use strict';

    /**
     * Initializes fullscreen functionality.
     * @param {Object} options
     * @param {HTMLElement} options.rootEl - The element to make fullscreen (usually document.documentElement).
     * @param {HTMLElement} options.controlsEl - The container of controls to auto-hide.
     * @param {HTMLElement} options.fullscreenButtonEl - The button to toggle fullscreen.
     * @param {Function} [options.onEnter] - Callback when entering fullscreen.
     * @param {Function} [options.onExit] - Callback when exiting fullscreen.
     */
    function initFullscreen(options) {
        var rootEl = options.rootEl;
        var controlsEl = options.controlsEl;
        var fullscreenButtonEl = options.fullscreenButtonEl;
        var onEnter = options.onEnter;
        var onExit = options.onExit;

        var hideTimer = null;
        var HIDE_DELAY = 3000; // 3 seconds

        // Check for Fullscreen API support
        var isSupported = document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled;

        if (!isSupported) {
            if (fullscreenButtonEl) {
                fullscreenButtonEl.style.display = 'none';
            }
            return;
        }

        // --- Helper Functions ---

        function isFullscreen() {
            return document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement;
        }

        function enterFullscreen() {
            if (rootEl.requestFullscreen) {
                rootEl.requestFullscreen();
            } else if (rootEl.webkitRequestFullscreen) { /* Safari */
                rootEl.webkitRequestFullscreen();
            } else if (rootEl.msRequestFullscreen) { /* IE11 */
                rootEl.msRequestFullscreen();
            }
        }

        function exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }

        function showControls() {
            if (controlsEl) {
                controlsEl.classList.remove('controls-hidden');
                controlsEl.classList.add('controls-visible');
            }
            resetHideTimer();
        }

        function hideControls() {
            if (isFullscreen() && controlsEl) {
                controlsEl.classList.remove('controls-visible');
                controlsEl.classList.add('controls-hidden');
            }
        }

        function resetHideTimer() {
            if (hideTimer) clearTimeout(hideTimer);
            if (isFullscreen()) {
                hideTimer = setTimeout(hideControls, HIDE_DELAY);
            }
        }

        // --- Event Listeners ---

        // Toggle Button
        if (fullscreenButtonEl) {
            fullscreenButtonEl.addEventListener('click', function () {
                if (isFullscreen()) {
                    exitFullscreen();
                } else {
                    enterFullscreen();
                }
            });
        }

        // Fullscreen Change Events
        function handleFullscreenChange() {
            if (isFullscreen()) {
                // Entered Fullscreen
                if (onEnter) onEnter();
                showControls(); // Start timer

                // Add interaction listeners to show controls
                document.addEventListener('mousemove', showControls);
                document.addEventListener('click', showControls);
                document.addEventListener('touchstart', showControls, { passive: true });
            } else {
                // Exited Fullscreen
                if (onExit) onExit();
                if (hideTimer) clearTimeout(hideTimer);

                // Ensure controls are visible
                if (controlsEl) {
                    controlsEl.classList.remove('controls-hidden');
                    controlsEl.classList.add('controls-visible');
                }

                // Remove interaction listeners
                document.removeEventListener('mousemove', showControls);
                document.removeEventListener('click', showControls);
                document.removeEventListener('touchstart', showControls, { passive: true }); // Match options for safety
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    // Expose globally
    window.initFullscreen = initFullscreen;

})(window);
