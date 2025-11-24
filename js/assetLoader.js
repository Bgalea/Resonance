/**
 * AssetLoader Class
 * Handles preloading of images and audio with caching, concurrency limits, and deduplication.
 */
class AssetLoader {
    constructor(options = {}) {
        this.cache = new Map(); // Use Map for LRU
        this.maxCacheSize = options.maxCacheSize || 50;
        this.concurrencyLimit = options.concurrencyLimit || 6;
        this.activeRequests = 0;
        this.queue = [];
        this.pendingRequests = new Map(); // Deduplication
    }

    /**
     * Adds an item to the cache, enforcing LRU policy.
     * @param {string} key 
     * @param {any} value 
     */
    _addToCache(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key); // Refresh position
        } else if (this.cache.size >= this.maxCacheSize) {
            // Remove oldest (first item in Map)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    /**
     * Queues a request to be processed.
     * @param {Function} requestFn - Function returning a promise.
     * @returns {Promise}
     */
    _enqueue(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this._processQueue();
        });
    }

    /**
     * Processes the request queue respecting concurrency limits.
     */
    _processQueue() {
        if (this.activeRequests >= this.concurrencyLimit || this.queue.length === 0) {
            return;
        }

        const { requestFn, resolve, reject } = this.queue.shift();
        this.activeRequests++;

        requestFn()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                this.activeRequests--;
                this._processQueue();
            });
    }

    /**
     * Preloads an image.
     * @param {string} src - Image URL.
     * @returns {Promise}
     */
    preloadImage(src) {
        if (!src) return Promise.resolve();
        if (this.cache.has(src)) {
            // Refresh LRU
            const val = this.cache.get(src);
            this.cache.delete(src);
            this.cache.set(src, val);
            return Promise.resolve(src);
        }
        if (this.pendingRequests.has(src)) return this.pendingRequests.get(src);

        const requestFn = () => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this._addToCache(src, true);
                resolve(src);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                resolve(null); // Resolve null on failure
            };
            img.src = src;
        });

        const promise = this._enqueue(requestFn).finally(() => {
            this.pendingRequests.delete(src);
        });

        this.pendingRequests.set(src, promise);
        return promise;
    }

    /**
     * Preloads an audio file.
     * @param {string} src - Audio URL.
     * @returns {Promise}
     */
    preloadAudio(src) {
        if (!src) return Promise.resolve();
        if (this.cache.has(src)) return Promise.resolve(src);
        if (this.pendingRequests.has(src)) return this.pendingRequests.get(src);

        const requestFn = () => new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'auto';

            const onCanPlay = () => {
                this._addToCache(src, true);
                cleanup();
                resolve(src);
            };

            const onError = () => {
                console.warn(`Failed to load audio: ${src}`);
                cleanup();
                resolve(null);
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

        const promise = this._enqueue(requestFn).finally(() => {
            this.pendingRequests.delete(src);
        });

        this.pendingRequests.set(src, promise);
        return promise;
    }

    /**
     * Preloads all assets for a specific group.
     * @param {Object} group - The group object from config.
     * @returns {Promise}
     */
    preloadGroup(group) {
        // Fallback to critical + background if called directly
        return this.preloadGroupCritical(group).then(() => {
            this.preloadGroupBackground(group);
        });
    }

    /**
     * Preloads only critical assets (Audio + First Image).
     * @param {Object} group 
     * @returns {Promise}
     */
    preloadGroupCritical(group) {
        if (!group) return Promise.resolve();

        const promises = [];

        // 1. Audio is critical for the experience
        if (group.audioSrc) {
            promises.push(this.preloadAudio(group.audioSrc));
        }

        // 2. First image is critical for UI
        if (group.images && group.images.length > 0) {
            const firstImg = group.images[0];
            if (firstImg.src) {
                promises.push(this.preloadImage(firstImg.src));
            }
        }

        return Promise.all(promises);
    }

    /**
     * Preloads the remaining assets in the background.
     * @param {Object} group 
     * @returns {Promise}
     */
    preloadGroupBackground(group) {
        if (!group || !group.images || group.images.length <= 1) {
            return Promise.resolve();
        }

        const promises = [];
        // Start from index 1 (skip first image)
        for (let i = 1; i < group.images.length; i++) {
            const img = group.images[i];
            if (img.src) {
                promises.push(this.preloadImage(img.src));
            }
        }

        return Promise.all(promises);
    }
}
