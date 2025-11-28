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
     * Queues a request to be processed with priority.
     * @param {Function} requestFn - Function returning a promise.
     * @param {string} priority - Priority level: 'critical', 'high', or 'normal'
     * @returns {Promise}
     */
    _enqueue(requestFn, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const item = { requestFn, resolve, reject, priority };

            // Insert based on priority (critical > high > normal)
            const priorityOrder = { critical: 0, high: 1, normal: 2 };
            const itemPriority = priorityOrder[priority] !== undefined ? priorityOrder[priority] : 2;

            // Find insertion point to maintain priority order
            let insertIndex = this.queue.length;
            for (let i = 0; i < this.queue.length; i++) {
                const queuePriority = priorityOrder[this.queue[i].priority] !== undefined ? priorityOrder[this.queue[i].priority] : 2;
                if (itemPriority < queuePriority) {
                    insertIndex = i;
                    break;
                }
            }

            this.queue.splice(insertIndex, 0, item);
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
     * Cancels pending requests matching the filter function.
     * @param {Function} filterFn - Function that returns true for requests to cancel.
     */
    cancelPendingRequests(filterFn) {
        if (!filterFn) return;

        // Remove matching items from queue
        this.queue = this.queue.filter(item => {
            const shouldCancel = filterFn(item);
            if (shouldCancel) {
                // Reject the promise to clean up
                item.reject(new Error('Request cancelled'));
            }
            return !shouldCancel;
        });
    }

    /**
     * Gets the loading state of an asset.
     * @param {string} src - Asset URL.
     * @returns {string} - 'loaded', 'loading', or 'unloaded'
     */
    getAssetState(src) {
        if (!src) return 'unloaded';
        if (this.cache.has(src)) return 'loaded';
        if (this.pendingRequests.has(src)) return 'loading';
        return 'unloaded';
    }

    /**
     * Preloads an image with optional priority.
     * @param {string} src - Image URL.
     * @param {string} priority - Priority level: 'critical', 'high', or 'normal'
     * @returns {Promise}
     */
    preloadImage(src, priority = 'normal') {
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

        const promise = this._enqueue(requestFn, priority).finally(() => {
            this.pendingRequests.delete(src);
        });

        this.pendingRequests.set(src, promise);
        return promise;
    }

    /**
     * Preloads an audio file with optional priority.
     * @param {string} src - Audio URL.
     * @param {string} priority - Priority level: 'critical', 'high', or 'normal'
     * @returns {Promise}
     */
    preloadAudio(src, priority = 'normal') {
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

        const promise = this._enqueue(requestFn, priority).finally(() => {
            this.pendingRequests.delete(src);
        });

        this.pendingRequests.set(src, promise);
        return promise;
    }

    /**
     * Preloads all assets for a specific group.
     * @param {Object} group - The group object from config.
     * @param {string} priority - Priority level for loading.
     * @returns {Promise}
     */
    preloadGroup(group, priority = 'normal') {
        // Fallback to critical + background if called directly
        return this.preloadGroupCritical(group, priority).then(() => {
            this.preloadGroupBackground(group, priority);
        });
    }

    /**
     * Preloads only critical assets (Audio + First Image).
     * @param {Object} group 
     * @param {string} priority - Priority level for loading.
     * @returns {Promise}
     */
    preloadGroupCritical(group, priority = 'critical') {
        if (!group) return Promise.resolve();

        const promises = [];

        // 1. Audio is critical for the experience
        if (group.audioSources && group.audioSources.length > 0) {
            // Use helper to find best supported format
            // Note: In tests/node environment, this might return null if Audio is not fully mocked with canPlayType
            // We'll handle that by falling back to the first source if needed
            let audioSrc = null;

            // Dynamic import for browser environment, or use global if available
            if (typeof window !== 'undefined' && window.getSupportedAudioSource) {
                audioSrc = window.getSupportedAudioSource(group.audioSources);
            } else {
                // Fallback for tests or if helper not loaded yet
                audioSrc = group.audioSources[0];
            }

            if (audioSrc) {
                promises.push(this.preloadAudio(audioSrc, priority));
            }
        } else if (group.audioSrc) {
            // Backward compatibility
            promises.push(this.preloadAudio(group.audioSrc, priority));
        }

        // 2. First image is critical for UI
        if (group.images && group.images.length > 0) {
            const firstImg = group.images[0];
            if (firstImg.src) {
                promises.push(this.preloadImage(firstImg.src, priority));
            }
        }

        return Promise.all(promises);
    }

    /**
     * Preloads the remaining assets in the background.
     * @param {Object} group 
     * @param {string} priority - Priority level for loading.
     * @returns {Promise}
     */
    preloadGroupBackground(group, priority = 'normal') {
        if (!group || !group.images || group.images.length <= 1) {
            return Promise.resolve();
        }

        const promises = [];
        // Start from index 1 (skip first image)
        for (let i = 1; i < group.images.length; i++) {
            const img = group.images[i];
            if (img.src) {
                promises.push(this.preloadImage(img.src, priority));
            }
        }

        return Promise.all(promises);
    }
}

// Export for ES6 modules (tests) while maintaining global scope for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AssetLoader };
}
