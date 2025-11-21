/**
 * Main Application Entry Point
 * Wires up the Gallery, AudioPlayer, and DOM.
 */

// Initialize components
// Assumes galleryConfig, Gallery, and AudioPlayer are available in global scope
const assetLoader = new AssetLoader();
const gallery = new Gallery(galleryConfig, assetLoader);
const audioPlayer = new AudioPlayer();

// DOM Elements
const imageEl = document.getElementById('gallery-image');
const captionEl = document.getElementById('gallery-caption');
const infoEl = document.getElementById('gallery-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const loadingOverlay = document.getElementById('loading-overlay');

// Audio Control Logic
function updateAudioUI() {
    // Update Mute Button
    muteBtn.textContent = audioPlayer.isMuted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', audioPlayer.isMuted ? 'Unmute Audio' : 'Mute Audio');

    // Update Slider
    // We keep the slider at the volume level even if muted
    volumeSlider.value = audioPlayer.volume * 100;
}

muteBtn.addEventListener('click', () => {
    audioPlayer.setMuted(!audioPlayer.isMuted);
    updateAudioUI();
});

volumeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    const newVolume = val / 100;
    audioPlayer.setVolume(newVolume);
    updateAudioUI();
});

// Initialize Audio UI
updateAudioUI();

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

// Initialize Application
(async () => {
    try {
        // Start preloading
        await gallery.init();

        // Change loading screen to "Click to Enter"
        const spinner = loadingOverlay.querySelector('.spinner');
        const text = loadingOverlay.querySelector('p');

        if (spinner) spinner.style.display = 'none';
        if (text) text.textContent = "Click to Enter";

        loadingOverlay.classList.add('ready'); // Add class for cursor pointer

        // Wait for user interaction
        loadingOverlay.addEventListener('click', () => {
            // Initial Render & Audio Start
            updateState(null);

            // Hide loading overlay
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, { once: true });

    } catch (error) {
        console.error("Failed to initialize gallery:", error);
        loadingOverlay.innerHTML = `<p>Error loading gallery. Please refresh.</p>`;
    }
})();

// Remove the old body click listener as we now handle it in the overlay
// document.body.addEventListener('click', ...);
