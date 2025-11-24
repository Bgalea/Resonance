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
const fullscreenBtn = document.getElementById('fullscreen-btn');

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
    volumeSlider.value = audioPlayer.volume * 100;
    volumeSlider.setAttribute('aria-valuenow', audioPlayer.volume * 100);
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
    imageEl.alt = currentSlide.caption; // Accessibility: Add alt text
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
