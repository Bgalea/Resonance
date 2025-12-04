/**
 * Gallery Class
 * Manages the list of slides and navigation logic.
 */
class Gallery {
    constructor(config, assetLoader) {
        this.config = config;
        this.slides = this._flattenConfig(config);
        this.currentIndex = 0;
        this.assetLoader = assetLoader;
        this.isTransitioning = false; // Debounce flag
    }

    /**
     * Initializes the gallery.
     * Preloads the first group before resolving.
     */
    async init() {
        if (this.config.groups && this.config.groups.length > 0) {
            const firstGroup = this.config.groups[0];

            // Critical Path: Wait only for Audio + 1st Image (with critical priority)
            await this.assetLoader.preloadGroupCritical(firstGroup, 'critical');

            // Background Path: Load the rest of the first group and adjacent groups
            this._preloadAdjacentGroups();
        }
    }

    /**
     * Flattens the nested config into a single array of slides.
     * @param {Object} config 
     * @returns {Array}
     */
    _flattenConfig(config) {
        const slides = [];
        if (!config.groups) return slides;

        config.groups.forEach((group, groupIndex) => {
            if (group.images) {
                group.images.forEach((image, imageIndex) => {
                    slides.push({
                        ...image,
                        groupId: group.id,
                        audioSrc: group.audioSrc,
                        groupIndex: groupIndex,
                        imageIndex: imageIndex,
                        groupTotal: group.images.length
                    });
                });
            }
        });
        return slides;
    }

    /**
     * Returns the current slide object.
     */
    getCurrentSlide() {
        if (!this.slides || this.slides.length === 0) {
            return {
                src: '',
                caption: 'No images found',
                groupIndex: 0,
                imageIndex: 0,
                groupTotal: 0,
                audioSrc: null
            };
        }
        return this.slides[this.currentIndex];
    }

    /**
     * Moves to the next slide if possible.
     * @returns {boolean} - True if moved, False if at the end.
     */
    next() {
        if (this.isTransitioning) return false;

        if (this.hasNext()) {
            this.isTransitioning = true;
            this.currentIndex++;
            this._preloadAdjacentGroups();

            // Simple debounce reset
            setTimeout(() => {
                this.isTransitioning = false;
            }, 300);

            return true;
        }
        return false;
    }

    /**
     * Moves to the previous slide if possible.
     * @returns {boolean} - True if moved, False if at the start.
     */
    prev() {
        if (this.isTransitioning) return false;

        if (this.hasPrevious()) {
            this.isTransitioning = true;
            this.currentIndex--;
            this._preloadAdjacentGroups();

            // Simple debounce reset
            setTimeout(() => {
                this.isTransitioning = false;
            }, 300);

            return true;
        }
        return false;
    }

    /**
     * Checks if there is a next slide.
     */
    hasNext() {
        return this.currentIndex < this.slides.length - 1;
    }

    /**
     * Checks if there is a previous slide.
     */
    hasPrevious() {
        return this.currentIndex > 0;
    }

    /**
     * Helper to check if the group has changed between two slides.
     * @param {Object} prevSlide 
     * @param {Object} nextSlide 
     */
    isNewGroup(prevSlide, nextSlide) {
        return prevSlide.groupIndex !== nextSlide.groupIndex;
    }

    /**
     * Determines if a group should be preloaded based on proximity.
     * @param {number} targetGroupIndex - Index of the group to check.
     * @returns {string|null} - Priority level or null if too far.
     */
    _shouldPreloadGroup(targetGroupIndex) {
        const currentSlide = this.getCurrentSlide();
        const currentGroupIndex = currentSlide.groupIndex;
        const distance = Math.abs(targetGroupIndex - currentGroupIndex);

        if (distance === 0) return 'critical';  // Current group
        if (distance === 1) return 'high';      // Adjacent groups
        if (distance <= 2) return 'normal';     // Near groups (lazy load)
        return null;                             // Too far, don't preload
    }

    /**
     * Preloads adjacent groups based on proximity to current position.
     */
    _preloadAdjacentGroups() {
        const currentSlide = this.getCurrentSlide();
        const currentGroupIndex = currentSlide.groupIndex;

        // Preload current group's remaining images (high priority)
        const currentGroup = this.config.groups[currentGroupIndex];
        if (currentGroup) {
            this.assetLoader.preloadGroupBackground(currentGroup, 'high');
        }

        // Preload adjacent groups (within distance 2)
        for (let i = 0; i < this.config.groups.length; i++) {
            const priority = this._shouldPreloadGroup(i);

            if (priority && priority !== 'critical') {
                const group = this.config.groups[i];

                if (priority === 'high') {
                    // Adjacent groups: load critical assets (audio + first image)
                    this.assetLoader.preloadGroupCritical(group, 'high');
                } else if (priority === 'normal') {
                    // Near groups: lazy load critical assets only
                    this.assetLoader.preloadGroupCritical(group, 'normal');
                }
            }
        }
    }
}

// Export for ES6 modules (tests) while maintaining global scope for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Gallery };
}
