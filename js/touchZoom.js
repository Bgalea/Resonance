/**
 * Handles touch zoom and pan interactions for gallery images.
 * Supports pinch-to-zoom and double-tap to zoom.
 */
class TouchZoom {
    constructor(options = {}) {
        this.options = {
            minScale: 1,
            maxScale: 3,
            doubleTapScale: 2,
            ...options
        };

        this.activeImage = null;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;

        // Touch state
        this.initialDistance = 0;
        this.initialScale = 1;
        this.lastTapTime = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;

        // Bind methods
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Attach zoom handlers to an image element
     * @param {HTMLElement} imageElement 
     */
    attach(imageElement) {
        if (this.activeImage) {
            this.detach();
        }

        this.activeImage = imageElement;
        this.reset();

        this.activeImage.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.activeImage.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.activeImage.addEventListener('touchend', this.handleTouchEnd);

        // Add specific style for touch handling
        this.activeImage.style.transformOrigin = 'center center';
        this.activeImage.style.transition = 'transform 0.1s ease-out';
    }

    /**
     * Remove handlers from the current image
     */
    detach() {
        if (!this.activeImage) return;

        this.activeImage.removeEventListener('touchstart', this.handleTouchStart);
        this.activeImage.removeEventListener('touchmove', this.handleTouchMove);
        this.activeImage.removeEventListener('touchend', this.handleTouchEnd);

        this.reset();
        this.activeImage = null;
    }

    /**
     * Reset zoom state
     */
    reset() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    /**
     * Check if currently zoomed in
     * @returns {boolean}
     */
    isZoomed() {
        return this.scale > 1;
    }

    handleTouchStart(e) {
        if (!this.activeImage) return;

        // Handle double tap
        if (e.touches.length === 1) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - this.lastTapTime;

            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                this.handleDoubleTap(e);
            }
            this.lastTapTime = currentTime;

            // Setup for panning
            if (this.scale > 1) {
                this.isDragging = true;
                this.startX = e.touches[0].clientX - this.translateX;
                this.startY = e.touches[0].clientY - this.translateY;
                this.lastX = e.touches[0].clientX;
                this.lastY = e.touches[0].clientY;
            }
        }

        // Handle pinch start
        if (e.touches.length === 2) {
            e.preventDefault();
            this.initialDistance = this.getDistance(e.touches);
            this.initialScale = this.scale;
        }
    }

    handleTouchMove(e) {
        if (!this.activeImage) return;

        // Handle panning
        if (e.touches.length === 1 && this.scale > 1 && this.isDragging) {
            e.preventDefault();
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            // Calculate new position
            this.translateX = x - this.startX;
            this.translateY = y - this.startY;

            this.constrainPan();
            this.updateTransform();
        }

        // Handle pinch zoom
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = this.getDistance(e.touches);
            if (this.initialDistance > 0) {
                const delta = currentDistance / this.initialDistance;
                this.scale = Math.min(Math.max(this.initialScale * delta, this.options.minScale), this.options.maxScale);
                this.updateTransform();
            }
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length < 2) {
            this.initialDistance = 0;
        }
        if (e.touches.length === 0) {
            this.isDragging = false;

            // Snap back if scaled below 1
            if (this.scale < 1) {
                this.scale = 1;
                this.translateX = 0;
                this.translateY = 0;
                this.activeImage.style.transition = 'transform 0.3s ease-out';
                this.updateTransform();
                setTimeout(() => {
                    if (this.activeImage) {
                        this.activeImage.style.transition = 'transform 0.1s ease-out';
                    }
                }, 300);
            }
        }
    }

    handleDoubleTap(e) {
        if (this.scale > 1) {
            this.reset();
        } else {
            this.scale = this.options.doubleTapScale;
            this.translateX = 0;
            this.translateY = 0;
            this.updateTransform();
        }
    }

    getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    constrainPan() {
        if (!this.activeImage) return;

        const rect = this.activeImage.getBoundingClientRect();
        // We need the dimensions of the container (viewport) and the scaled image
        // Assuming the image fills the screen/container initially

        const scaledWidth = this.activeImage.offsetWidth * this.scale;
        const scaledHeight = this.activeImage.offsetHeight * this.scale;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate limits
        // If image is wider than viewport, allow panning
        if (scaledWidth > viewportWidth) {
            const maxTranslateX = (scaledWidth - viewportWidth) / 2;
            this.translateX = Math.min(Math.max(this.translateX, -maxTranslateX), maxTranslateX);
        } else {
            this.translateX = 0;
        }

        // If image is taller than viewport, allow panning
        if (scaledHeight > viewportHeight) {
            const maxTranslateY = (scaledHeight - viewportHeight) / 2;
            this.translateY = Math.min(Math.max(this.translateY, -maxTranslateY), maxTranslateY);
        } else {
            this.translateY = 0;
        }
    }

    updateTransform() {
        if (!this.activeImage) return;
        this.activeImage.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
}

// Expose to window
if (typeof window !== 'undefined') {
    window.TouchZoom = TouchZoom;
}

// Export for Node/Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TouchZoom };
}
