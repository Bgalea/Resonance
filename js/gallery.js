/**
 * Gallery Class
 * Manages the list of slides and navigation logic.
 */
class Gallery {
    constructor(config) {
        this.slides = this._flattenConfig(config);
        this.currentIndex = 0;
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
                    groupId: group.id
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
}
