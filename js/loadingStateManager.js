/**
 * LoadingStateManager Class
 * Manages loading indicators and state for images.
 */
class LoadingStateManager {
    constructor(assetLoader, imageElement, loadingOverlay) {
        this.assetLoader = assetLoader;
        this.imageElement = imageElement;
        this.loadingOverlay = loadingOverlay;
        this.isLoading = false;
    }

    /**
     * Shows the loading indicator.
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
            this.loadingOverlay.setAttribute('aria-busy', 'true');
            this.isLoading = true;
        }
    }

    /**
     * Hides the loading indicator.
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
            this.loadingOverlay.setAttribute('aria-busy', 'false');
            this.isLoading = false;
        }
    }

    /**
     * Waits for an image to be loaded, with timeout.
     * @param {string} src - Image URL.
     * @param {number} timeout - Timeout in milliseconds.
     * @returns {Promise<boolean>} - True if loaded, false if timeout.
     */
    async waitForImage(src, timeout = 5000) {
        const state = this.assetLoader.getAssetState(src);

        // Already loaded
        if (state === 'loaded') {
            return true;
        }

        // Show loading indicator
        this.showLoading();

        try {
            // Wait for the image to load or timeout
            await Promise.race([
                this.assetLoader.preloadImage(src, 'critical'),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), timeout)
                )
            ]);

            this.hideLoading();
            return true;
        } catch (error) {
            this.hideLoading();

            if (error.message === 'Timeout') {
                console.warn(`Image loading timed out: ${src}`);
                return false;
            }

            console.error(`Failed to load image: ${src}`, error);
            return false;
        }
    }

    /**
     * Checks if an image is ready to display.
     * @param {string} src - Image URL.
     * @returns {boolean}
     */
    isImageReady(src) {
        return this.assetLoader.getAssetState(src) === 'loaded';
    }
}
