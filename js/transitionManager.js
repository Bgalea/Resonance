/**
 * TransitionManager Class
 * Handles image transitions with configurable effects.
 */
class TransitionManager {
    constructor(config = {}) {
        this.type = config.transitionType || 'fade';
        this.duration = config.transitionDuration || 400;
        this.supported = this._detectSupport();

        // Check user preference for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // If not supported or user prefers reduced motion, force to 'none'
        if (!this.supported || prefersReducedMotion) {
            this.type = 'none';
        }
    }

    /**
     * Detects CSS transition support.
     */
    _detectSupport() {
        const el = document.createElement('div');
        return 'transition' in el.style ||
            'webkitTransition' in el.style ||
            'MozTransition' in el.style;
    }

    /**
     * Performs transition from current image to new image.
     * @param {HTMLImageElement} imageEl - The image element.
     * @param {string} newSrc - New image source.
     * @returns {Promise} - Resolves when transition complete.
     */
    async transition(imageEl, newSrc) {
        if (this.type === 'none' || !this.supported) {
            // Instant switch
            imageEl.src = newSrc;
            return Promise.resolve();
        }

        if (this.type === 'fade') {
            return this._fadeTransition(imageEl, newSrc);
        }

        if (this.type === 'crossfade') {
            return this._crossfadeTransition(imageEl, newSrc);
        }

        // Default: instant
        imageEl.src = newSrc;
        return Promise.resolve();
    }

    /**
     * Fade transition: fade out, switch, fade in.
     */
    async _fadeTransition(imageEl, newSrc) {
        // Fade out
        imageEl.style.opacity = '0';
        await this._wait(this.duration / 2);

        // Switch image
        imageEl.src = newSrc;

        // Wait for image to load
        await this._waitForImageLoad(imageEl);

        // Fade in
        imageEl.style.opacity = '1';
        await this._wait(this.duration / 2);
    }

    /**
     * Crossfade transition: overlay new image and fade.
     */
    async _crossfadeTransition(imageEl, newSrc) {
        // Create overlay image
        const overlay = document.createElement('img');
        overlay.src = newSrc;
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.objectFit = 'contain';
        overlay.style.opacity = '0';
        overlay.style.transition = `opacity ${this.duration}ms ease`;
        overlay.style.pointerEvents = 'none';

        // Ensure parent has position context
        const parent = imageEl.parentElement;
        const originalPosition = parent.style.position;
        if (!originalPosition || originalPosition === 'static') {
            parent.style.position = 'relative';
        }

        parent.appendChild(overlay);

        // Wait for overlay to load
        await this._waitForImageLoad(overlay);

        // Fade in overlay
        overlay.style.opacity = '1';
        await this._wait(this.duration);

        // Replace original
        imageEl.src = newSrc;
        imageEl.style.opacity = '1';

        // Remove overlay
        parent.removeChild(overlay);

        // Restore original position if we changed it
        if (!originalPosition || originalPosition === 'static') {
            parent.style.position = originalPosition || '';
        }
    }

    /**
     * Waits for image to load.
     */
    _waitForImageLoad(img) {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Resolve anyway to prevent hanging
            }
        });
    }

    /**
     * Waits for specified duration.
     */
    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
