/**
 * Main Application Entry Point
 * Wires up the Gallery, AudioPlayer, and DOM.
 */

// Initialize components
// Assumes galleryConfig, Gallery, and AudioPlayer are available in global scope
const gallery = new Gallery(galleryConfig);
const audioPlayer = new AudioPlayer();

// DOM Elements
const imageEl = document.getElementById('gallery-image');
const captionEl = document.getElementById('gallery-caption');
const infoEl = document.getElementById('gallery-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

/**
 * Updates the UI to reflect the current slide state.
 * Also handles audio transitions if the group has changed.
 * @param {Object} prevSlide - The previous slide object (can be null on init).
 */
function updateState(prevSlide = null) {
    const currentSlide = gallery.getCurrentSlide();

    // 1. Update DOM
    imageEl.src = currentSlide.src;
    imageEl.alt = currentSlide.caption;
    captionEl.textContent = currentSlide.caption;
    infoEl.textContent = `Group ${currentSlide.groupIndex} – Picture ${currentSlide.imageIndex} of ${currentSlide.groupTotal}`;

    // 2. Update Buttons
    prevBtn.disabled = !gallery.hasPrevious();
    nextBtn.disabled = !gallery.hasNext();

    // 3. Handle Audio
    if (!prevSlide || gallery.isNewGroup(prevSlide, currentSlide)) {
        console.log(`Switching audio to: ${currentSlide.audioSrc}`);
        audioPlayer.setTrack(currentSlide.audioSrc);
    }
}

// Event Listeners
prevBtn.addEventListener('click', () => {
    const prevSlide = gallery.getCurrentSlide();
    if (gallery.prev()) {
        updateState(prevSlide);
    }
});

nextBtn.addEventListener('click', () => {
    const prevSlide = gallery.getCurrentSlide();
    if (gallery.next()) {
        updateState(prevSlide);
    }
});

// Initial Render
updateState(null);

// Handle user interaction requirement for Audio
document.body.addEventListener('click', () => {
    audioPlayer.play();
}, { once: true });
