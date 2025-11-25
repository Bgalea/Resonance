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
const imageLoadingOverlay = document.getElementById('image-loading');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Initialize Loading State Manager
const loadingStateManager = new LoadingStateManager(assetLoader, imageEl, imageLoadingOverlay);

// Initialize Transition Manager
const transitionManager = new TransitionManager(galleryConfig);

// SECURITY: Basic Content Protection
// Prevent right-click context menu on the image
imageEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

// Prevent dragging the image
imageEl.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
});

// --- Navigation Logic (Extracted) ---

function navigateNext() {
    const prevSlide = gallery.getCurrentSlide();
    if (gallery.next()) {
        updateState(prevSlide);
        return true;
    }
    return false;
}

function navigatePrev() {
    const prevSlide = gallery.getCurrentSlide();
    if (gallery.prev()) {
        updateState(prevSlide);
        return true;
    }
    return false;
}

// --- Audio Control Logic ---

function updateAudioUI() {
    // Update Mute Button
    muteBtn.textContent = audioPlayer.isMuted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', audioPlayer.isMuted ? 'Unmute Audio' : 'Mute Audio');
    muteBtn.setAttribute('aria-pressed', audioPlayer.isMuted);

    // Update Slider
    // We keep the slider at the volume level even if muted
    // Slider is 0-1, audioPlayer.volume is 0-1
    volumeSlider.value = audioPlayer.volume;
    volumeSlider.setAttribute('aria-valuenow', audioPlayer.volume);
}

muteBtn.addEventListener('click', () => {
    audioPlayer.setMuted(!audioPlayer.isMuted);
    updateAudioUI();
});

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    // Clamp just in case
    const newVolume = Math.max(0, Math.min(1, val));
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
async function updateState(prevSlide = null) {
    const currentSlide = gallery.getCurrentSlide();

    // 1. Check if image is ready, load on-demand if needed
    const imageReady = loadingStateManager.isImageReady(currentSlide.src);

    if (!imageReady) {
        // Show loading indicator and wait for image
        await loadingStateManager.waitForImage(currentSlide.src);
    }

    // 2. Perform transition to new image
    await transitionManager.transition(imageEl, currentSlide.src);

    // 3. Update DOM
    imageEl.alt = currentSlide.caption; // Accessibility: Add alt text
    captionEl.textContent = currentSlide.caption;
    infoEl.textContent = `Group ${currentSlide.groupIndex + 1} – Picture ${currentSlide.imageIndex + 1} of ${currentSlide.groupTotal}`;

    // 3. Update Buttons
    prevBtn.disabled = !gallery.hasPrevious();
    nextBtn.disabled = !gallery.hasNext();

    // 4. Handle Audio
    if (!prevSlide || gallery.isNewGroup(prevSlide, currentSlide)) {
        audioPlayer.setTrack(currentSlide.audioSrc);
    }
}

// --- Event Listeners ---

// Button Clicks
prevBtn.addEventListener('click', navigatePrev);
nextBtn.addEventListener('click', navigateNext);

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Prevent if user is typing in an input (though we don't have text inputs, good practice)
    if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return;

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            navigatePrev();
            break;
        case 'ArrowRight':
            e.preventDefault();
            navigateNext();
            break;
        case ' ':
        case 'Spacebar': // Older browsers
            e.preventDefault();
            if (audioPlayer.audio.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.audio.pause();
            }
            break;
        case 'f':
        case 'F':
            if (fullscreenBtn) {
                fullscreenBtn.click();
            }
            break;
        case 'm':
        case 'M':
            muteBtn.click();
            break;
        case 'Escape':
            // Exit fullscreen if active
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
            break;
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
        if (text) text.textContent = "Press Enter or Click to Start";

        loadingOverlay.classList.add('ready'); // Add class for cursor pointer

        // Function to start the gallery
        const startGallery = () => {
            // Initial Render & Audio Start
            updateState(null);

            // Hide loading overlay
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        };

        // Wait for user interaction (click or keyboard)
        loadingOverlay.addEventListener('click', startGallery, { once: true });

        // Keyboard accessibility: Enter or Space to start
        loadingOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                startGallery();
                // Remove click listener to prevent double-trigger
                loadingOverlay.removeEventListener('click', startGallery);
            }
        }, { once: true });

    } catch (error) {
        console.error("Failed to initialize gallery:", error);
        // SECURITY: Use textContent to prevent XSS
        loadingOverlay.textContent = "Error loading gallery. Please refresh.";
    }
})();

// Initialize Touch Controls
if (window.initTouchControls) {
    initTouchControls({
        containerEl: document.querySelector('.gallery-container'),
        onSwipeLeft: navigateNext,  // Use extracted function
        onSwipeRight: navigatePrev, // Use extracted function
        onTap: () => {
            // Toggle UI visibility
            const controls = document.querySelector('.controls-wrapper');
            if (controls) {
                controls.classList.toggle('ui-hidden');
            }
        },
        onLongPress: () => {
            // Toggle Audio Play/Pause
            if (audioPlayer.audio.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.audio.pause();
            }
        }
    });
}

// Initialize Fullscreen Mode
if (window.initFullscreen) {
    initFullscreen({
        rootEl: document.documentElement,
        controlsEl: document.querySelector('.controls-wrapper'),
        fullscreenButtonEl: document.getElementById('fullscreen-btn'),
        onEnter: () => {
            document.body.classList.add('fullscreen');
        },
        onExit: () => {
            document.body.classList.remove('fullscreen');
        }
    });
}
