/**
 * Unit tests for Gallery class
 * Tests navigation, state management, and preloading logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Gallery } from '../../js/gallery.js';

describe('Gallery', () => {
    let gallery;
    let mockConfig;
    let mockLoader;

    beforeEach(() => {
        // Mock configuration with 2 groups
        mockConfig = {
            groups: [
                {
                    id: 'group1',
                    audioSrc: 'audio1.mp3',
                    images: [
                        { src: 'img1.jpg', caption: 'Image 1' },
                        { src: 'img2.jpg', caption: 'Image 2' }
                    ]
                },
                {
                    id: 'group2',
                    audioSrc: 'audio2.mp3',
                    images: [
                        { src: 'img3.jpg', caption: 'Image 3' }
                    ]
                }
            ]
        };

        // Mock AssetLoader
        mockLoader = {
            preloadGroupCritical: vi.fn().mockResolvedValue(undefined),
            preloadGroupBackground: vi.fn().mockResolvedValue(undefined)
        };

        gallery = new Gallery(mockConfig, mockLoader);
    });

    describe('Initialization', () => {
        it('should flatten config into slides array', () => {
            expect(gallery.slides).toHaveLength(3);
            expect(gallery.slides[0].src).toBe('img1.jpg');
            expect(gallery.slides[1].src).toBe('img2.jpg');
            expect(gallery.slides[2].src).toBe('img3.jpg');
        });

        it('should set currentIndex to 0', () => {
            expect(gallery.currentIndex).toBe(0);
        });

        it('should add groupIndex and imageIndex to slides', () => {
            expect(gallery.slides[0].groupIndex).toBe(0);
            expect(gallery.slides[0].imageIndex).toBe(0);
            expect(gallery.slides[1].groupIndex).toBe(0);
            expect(gallery.slides[1].imageIndex).toBe(1);
            expect(gallery.slides[2].groupIndex).toBe(1);
            expect(gallery.slides[2].imageIndex).toBe(0);
        });

        it('should call preloadGroupCritical on init', async () => {
            await gallery.init();
            expect(mockLoader.preloadGroupCritical).toHaveBeenCalledWith(
                mockConfig.groups[0],
                'critical'
            );
        });
    });

    describe('Navigation', () => {
        describe('next()', () => {
            it('should move to next slide', () => {
                const result = gallery.next();
                expect(result).toBe(true);
                expect(gallery.currentIndex).toBe(1);
            });

            it('should not move past last slide', () => {
                gallery.currentIndex = 2; // Last slide
                const result = gallery.next();
                expect(result).toBe(false);
                expect(gallery.currentIndex).toBe(2);
            });

            it('should trigger preloading of adjacent groups', () => {
                mockLoader.preloadGroupCritical.mockClear();
                mockLoader.preloadGroupBackground.mockClear();

                gallery.next();

                expect(mockLoader.preloadGroupBackground).toHaveBeenCalled();
            });

            it('should debounce rapid navigation', () => {
                gallery.next();
                const result = gallery.next(); // Immediate second call
                expect(result).toBe(false); // Blocked by debounce
            });
        });

        describe('prev()', () => {
            it('should move to previous slide', () => {
                gallery.currentIndex = 1;
                const result = gallery.prev();
                expect(result).toBe(true);
                expect(gallery.currentIndex).toBe(0);
            });

            it('should not move before first slide', () => {
                const result = gallery.prev();
                expect(result).toBe(false);
                expect(gallery.currentIndex).toBe(0);
            });
        });

        describe('hasNext() and hasPrevious()', () => {
            it('should return true when next slide exists', () => {
                expect(gallery.hasNext()).toBe(true);
            });

            it('should return false when at last slide', () => {
                gallery.currentIndex = 2;
                expect(gallery.hasNext()).toBe(false);
            });

            it('should return false when at first slide', () => {
                expect(gallery.hasPrevious()).toBe(false);
            });

            it('should return true when previous slide exists', () => {
                gallery.currentIndex = 1;
                expect(gallery.hasPrevious()).toBe(true);
            });
        });
    });

    describe('getCurrentSlide()', () => {
        it('should return current slide object', () => {
            const slide = gallery.getCurrentSlide();
            expect(slide.src).toBe('img1.jpg');
            expect(slide.caption).toBe('Image 1');
            expect(slide.groupId).toBe('group1');
        });

        it('should return default object for empty gallery', () => {
            gallery.slides = [];
            const slide = gallery.getCurrentSlide();
            expect(slide.caption).toBe('No images found');
        });
    });

    describe('isNewGroup()', () => {
        it('should return true when group changes', () => {
            const slide1 = gallery.slides[1]; // group1
            const slide2 = gallery.slides[2]; // group2
            expect(gallery.isNewGroup(slide1, slide2)).toBe(true);
        });

        it('should return false when group stays same', () => {
            const slide1 = gallery.slides[0]; // group1
            const slide2 = gallery.slides[1]; // group1
            expect(gallery.isNewGroup(slide1, slide2)).toBe(false);
        });
    });

    describe('Preloading Strategy', () => {
        it('should determine correct priority for current group', () => {
            const priority = gallery._shouldPreloadGroup(0);
            expect(priority).toBe('critical');
        });

        it('should determine correct priority for adjacent group', () => {
            const priority = gallery._shouldPreloadGroup(1);
            expect(priority).toBe('high');
        });

        it('should return null for distant groups', () => {
            // Add more groups to test distance
            mockConfig.groups.push(
                { id: 'group3', audioSrc: 'audio3.mp3', images: [{ src: 'img4.jpg' }] },
                { id: 'group4', audioSrc: 'audio4.mp3', images: [{ src: 'img5.jpg' }] }
            );
            gallery = new Gallery(mockConfig, mockLoader);

            const priority = gallery._shouldPreloadGroup(3);
            expect(priority).toBeNull();
        });
    });
});
