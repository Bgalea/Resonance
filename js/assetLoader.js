/**
 * AssetLoader Class
 * Handles preloading of images and audio to ensure smooth playback.
 */
class AssetLoader {
    constructor() {
        this.cache = new Set();
    }

    /**
     * Preloads an image.
     * @param {string} src - Image URL.
     * @returns {Promise}
     */
    preloadImage(src) {
        if (!src || this.cache.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.add(src);
                resolve(src);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                // Resolve anyway to not block the group load
                resolve(src);
            };
            img.src = src;
        });
    }

    /**
     * Preloads an audio file.
     * @param {string} src - Audio URL.
     * @returns {Promise}
     */
    preloadAudio(src) {
        if (!src || this.cache.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';

            const onCanPlay = () => {
                this.cache.add(src);
                cleanup();
                resolve(src);
            };

            const onError = () => {
                console.warn(`Failed to load audio: ${src}`);
                cleanup();
                // Resolve anyway to not block
                resolve(src);
            };

            const cleanup = () => {
                audio.removeEventListener('canplaythrough', onCanPlay);
                audio.removeEventListener('error', onError);
            };

            audio.addEventListener('canplaythrough', onCanPlay);
            audio.addEventListener('error', onError);

            audio.src = src;
            audio.load();
        });
    }

    /**
     * Preloads all assets for a specific group.
     * @param {Object} group - The group object from config.
     * @returns {Promise}
     */
    preloadGroup(group) {
        if (!group) return Promise.resolve();

        const promises = [];

        // Preload audio
        if (group.audioSrc) {
            promises.push(this.preloadAudio(group.audioSrc));
        }

        // Preload all images in the group
        if (group.images) {
            group.images.forEach(img => {
                if (img.src) {
                    promises.push(this.preloadImage(img.src));
                }
            });
        }

        return Promise.all(promises);
    }
}
