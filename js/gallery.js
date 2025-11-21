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
    }

    /**
     * Initializes the gallery.
     * Preloads the first group before resolving.
     */
    async init() {
        if (this.config.groups.length > 0) {
            await this.assetLoader.preloadGroup(this.config.groups[0]);
        }
    }

    /**
     * Flattens the nested group config into a linear list of slides.
     * Each slide object will contain its image data plus group info.
     * @param {Object} config - The gallery configuration object.
     * @returns {Array} - Array of slide objects.
     */
    _flattenConfig(config) {
        const slides = [];
        config.groups.forEach((group, groupIndex) => {
            group.images.forEach((image, imageIndex) => {
                slides.push({
                    ...image,
                    groupIndex: groupIndex + 1, // 1-based for display
                    groupTotal: group.images.length,
                    imageIndex: imageIndex + 1, // 1-based for display
                    audioSrc: group.audioSrc,
                    groupId: group.id,
                    groupObj: group // Store reference to full group object for preloading
                });
            });
        });
        return slides;
    }

    /**
     * Returns the current slide object.
     */
    getCurrentSlide() {
        return this.slides[this.currentIndex];
    }

    /**
     * Moves to the next slide if possible.
     * @returns {boolean} - True if moved, False if at the end.
     */
    next() {
        if (this.hasNext()) {
            this.currentIndex++;
            this._preloadNextGroup();
            return true;
        }
        return false;
    }

    /**
     * Moves to the previous slide if possible.
     * @returns {boolean} - True if moved, False if at the start.
     */
    prev() {
        if (this.hasPrevious()) {
            this.currentIndex--;
            // Optional: Preload previous group? 
            // Usually we move forward, but we could preload prev group too if needed.
            // For now, let's stick to forward preloading as per requirements.
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
