/**
 * Unit tests for AssetLoader class
 * Tests priority queue, caching, deduplication, and concurrency limiting
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AssetLoader } from '../../js/assetLoader.js';

describe('AssetLoader', () => {
    let loader;

    // Helper to advance timers while loading
    const loadAsset = async (src, priority) => {
        const p = loader.preloadImage(src, priority);
        await vi.advanceTimersByTimeAsync(100);
        return p;
    };

    let originalImage;
    let originalAudio;

    beforeEach(() => {
        loader = new AssetLoader({
            maxCacheSize: 5,
            concurrencyLimit: 2
        });
        vi.useFakeTimers();

        // Mock Image
        originalImage = global.Image;
        global.Image = class {
            constructor() {
                this.onload = null;
                this.onerror = null;
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 10);
            }
            set src(val) { this._src = val; }
            get src() { return this._src; }
        };

        // Mock Audio
        originalAudio = global.Audio;
        global.Audio = class {
            constructor() {
                this.addEventListener = vi.fn((event, handler) => {
                    if (event === 'canplaythrough') {
                        setTimeout(() => handler(), 10);
                    }
                });
                this.removeEventListener = vi.fn();
                this.load = vi.fn();
            }
            set src(val) { this._src = val; }
            get src() { return this._src; }
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        global.Image = originalImage;
        global.Audio = originalAudio;
    });

    describe('Initialization', () => {
        it('should initialize with default options', () => {
            const defaultLoader = new AssetLoader();
            expect(defaultLoader.maxCacheSize).toBe(50);
            expect(defaultLoader.concurrencyLimit).toBe(6);
        });

        it('should initialize with custom options', () => {
            expect(loader.maxCacheSize).toBe(5);
            expect(loader.concurrencyLimit).toBe(2);
        });
    });

    describe('LRU Cache', () => {
        it('should cache loaded images', async () => {
            await loadAsset('img1.jpg');
            expect(loader.cache.has('img1.jpg')).toBe(true);
        });

        it('should evict oldest item when cache is full', async () => {
            // Fill cache to max
            for (let i = 1; i <= 5; i++) {
                await loadAsset(`img${i}.jpg`);
            }

            // Add one more to trigger eviction
            await loadAsset('img6.jpg');

            expect(loader.cache.has('img1.jpg')).toBe(false); // Oldest evicted
            expect(loader.cache.has('img6.jpg')).toBe(true);
        });

        it('should refresh LRU position on cache hit', async () => {
            await loadAsset('img1.jpg');
            await loadAsset('img2.jpg');
            await loadAsset('img3.jpg');

            // Access img1 again to refresh its position
            await loadAsset('img1.jpg');

            // Fill cache
            await loadAsset('img4.jpg');
            await loadAsset('img5.jpg');
            await loadAsset('img6.jpg');

            // img2 should be evicted (oldest), not img1
            expect(loader.cache.has('img1.jpg')).toBe(true);
            expect(loader.cache.has('img2.jpg')).toBe(false);
        });
    });

    describe('Request Deduplication', () => {
        it('should not make duplicate requests for same resource', async () => {
            const promise1 = loader.preloadImage('img1.jpg');
            const promise2 = loader.preloadImage('img1.jpg');

            expect(promise1).toBe(promise2);
        });

        it('should return cached result immediately', async () => {
            await loadAsset('img1.jpg');

            const start = Date.now();
            // Cached result returns immediately, so we don't need to advance timers
            await loader.preloadImage('img1.jpg');
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(10); // Should be instant
        });
    });

    describe('Priority Queue', () => {
        it('should process critical priority first', async () => {
            const loadOrder = [];

            // Create loader with concurrency 1 to force queuing
            loader = new AssetLoader({ concurrencyLimit: 1 });

            // Mock Image to track load order
            global.Image = class {
                constructor() {
                    this.onload = null;
                    setTimeout(() => {
                        loadOrder.push(this.src);
                        if (this.onload) this.onload();
                    }, 10);
                }
                set src(value) {
                    this._src = value;
                }
                get src() {
                    return this._src;
                }
            };

            // Queue requests in reverse priority order
            loader.preloadImage('normal.jpg', 'normal');
            loader.preloadImage('high.jpg', 'high');
            loader.preloadImage('critical.jpg', 'critical');

            await vi.advanceTimersByTimeAsync(100);

            // Normal starts immediately (non-preemptive)
            expect(loadOrder[0]).toContain('normal.jpg');
            // Critical should jump ahead of High
            expect(loadOrder[1]).toContain('critical.jpg');
            expect(loadOrder[2]).toContain('high.jpg');
        });
    });

    describe('Concurrency Limiting', () => {
        it('should respect concurrency limit', async () => {
            let activeRequests = 0;
            let maxConcurrent = 0;

            global.Image = class {
                constructor() {
                    this.onload = null;
                    activeRequests++;
                    maxConcurrent = Math.max(maxConcurrent, activeRequests);

                    setTimeout(() => {
                        activeRequests--;
                        if (this.onload) this.onload();
                    }, 50);
                }
                set src(value) { this._src = value; }
                get src() { return this._src; }
            };

            // Queue more requests than concurrency limit
            const promises = [];
            for (let i = 1; i <= 10; i++) {
                promises.push(loader.preloadImage(`img${i}.jpg`));
            }

            // 10 requests, concurrency 2, 50ms each = 250ms total
            await vi.advanceTimersByTimeAsync(300);
            await Promise.all(promises);

            expect(maxConcurrent).toBeLessThanOrEqual(2);
        });
    });

    describe('preloadGroupCritical()', () => {
        it('should preload audio and first image', async () => {
            const group = {
                audioSrc: 'audio.mp3',
                images: [
                    { src: 'img1.jpg' },
                    { src: 'img2.jpg' }
                ]
            };

            const p = loader.preloadGroupCritical(group, 'critical');
            await vi.advanceTimersByTimeAsync(100);
            await p;

            expect(loader.cache.has('audio.mp3')).toBe(true);
            expect(loader.cache.has('img1.jpg')).toBe(true);
            expect(loader.cache.has('img2.jpg')).toBe(false);
        });
    });

    describe('preloadGroupBackground()', () => {
        it('should preload remaining images', async () => {
            const group = {
                audioSrc: 'audio.mp3',
                images: [
                    { src: 'img1.jpg' },
                    { src: 'img2.jpg' },
                    { src: 'img3.jpg' }
                ]
            };

            const p = loader.preloadGroupBackground(group, 'normal');
            await vi.advanceTimersByTimeAsync(100);
            await p;

            expect(loader.cache.has('img1.jpg')).toBe(false); // Skipped
            expect(loader.cache.has('img2.jpg')).toBe(true);
            expect(loader.cache.has('img3.jpg')).toBe(true);
        });
    });

    describe('getAssetState()', () => {
        it('should return "loaded" for cached assets', async () => {
            await loadAsset('img1.jpg');
            expect(loader.getAssetState('img1.jpg')).toBe('loaded');
        });

        it('should return "loading" for pending requests', () => {
            loader.preloadImage('img1.jpg');
            expect(loader.getAssetState('img1.jpg')).toBe('loading');
        });

        it('should return "unloaded" for new assets', () => {
            expect(loader.getAssetState('img1.jpg')).toBe('unloaded');
        });
    });

    describe('cancelPendingRequests()', () => {
        it('should cancel matching requests', async () => {
            // Don't await these, just queue them
            loader.preloadImage('img1.jpg', 'normal');
            loader.preloadImage('img2.jpg', 'normal');
            loader.preloadImage('img3.jpg', 'critical');

            loader.cancelPendingRequests(item => item.priority === 'normal');

            expect(loader.queue.length).toBe(1); // Only critical remains
        });
    });
});
