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
            await this.assetLoader.preloadGroup(this.config.groups[0]);
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
            this._preloadNextGroup();

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
        return prevSlide.groupId !== nextSlide.groupId;
    }

    /**
     * Preloads the next group's assets in the background.
     */
    _preloadNextGroup() {
        const currentSlide = this.getCurrentSlide();
        const nextGroupIndex = this.config.groups.findIndex(g => g.id === currentSlide.groupId) + 1;

        if (nextGroupIndex < this.config.groups.length) {
            const nextGroup = this.config.groups[nextGroupIndex];
            this.assetLoader.preloadGroup(nextGroup);
        }
    }
}
