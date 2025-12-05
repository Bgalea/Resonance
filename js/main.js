/**
 * Main Application Entry Point
 * Wires up the Gallery, AudioPlayer, and DOM.
 */

// Initialize components with settings from galleryConfig
// AssetLoader with performance settings
let assetLoader, gallery, audioPlayer;

try {
    console.log('Main.js: Initializing dependencies...');
    if (typeof AssetLoader === 'undefined') throw new Error('AssetLoader is not defined');
    if (typeof Gallery === 'undefined') throw new Error('Gallery is not defined');
    if (typeof galleryConfig === 'undefined') throw new Error('galleryConfig is not defined');

    assetLoader = new AssetLoader({
        maxCacheSize: galleryConfig.performance?.maxCacheSize,
        concurrencyLimit: galleryConfig.performance?.concurrencyLimit
    });

    gallery = new Gallery(galleryConfig, assetLoader);

    // Conditional audio player initialization
    // --- Audio Control Logic ---
    const soundEnabled = galleryConfig.enableSound !== false; // Default to true
    console.log(`Main.js: soundEnabled=${soundEnabled}, AudioPlayer defined=${!!window.AudioPlayer}`);

    audioPlayer = (soundEnabled && window.AudioPlayer) ? new AudioPlayer() : null;

    if (soundEnabled && !audioPlayer) {
        console.warn('Audio enabled in config but AudioPlayer class not found');
    }

    // Expose for testing
    if (audioPlayer) {
        console.log('Main.js: Exposing audioPlayer to window');
        window.audioPlayer = audioPlayer;
    } else {
        console.log('Main.js: audioPlayer is null, not exposing');
    }
} catch (e) {
    console.error('Main.js: Critical initialization error:', e);
}

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

// Initialize Transition Manager with settings
const transitionManager = new TransitionManager({
    transitionType: galleryConfig.transitions?.type,
    transitionDuration: galleryConfig.transitions?.duration || galleryConfig.timing?.transitionDuration
});

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

// === DYNAMIC UI TEXT INJECTION ===
// Set page title from config
if (galleryConfig.ui?.pageTitle) {
    document.title = galleryConfig.ui.pageTitle;
}

// Set button labels from config
if (galleryConfig.ui?.buttonLabels) {
    if (prevBtn) prevBtn.textContent = galleryConfig.ui.buttonLabels.previous || 'Previous';
    if (nextBtn) nextBtn.textContent = galleryConfig.ui.buttonLabels.next || 'Next';
}

// NOTE: Loading messages are set dynamically after gallery.init() completes
// See initialization code below (line ~234)

// --- Audio Control Logic ---

function updateAudioUI() {
    if (!audioPlayer) return; // Skip if audio disabled
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

// Only set up audio controls if audio is enabled
if (audioPlayer && muteBtn && volumeSlider) {
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
}

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

    // Reset zoom state when changing images
    if (window.touchZoom) {
        window.touchZoom.reset();
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

    // 4. Handle Audio (only if enabled)
    if (audioPlayer && (!prevSlide || gallery.isNewGroup(prevSlide, currentSlide))) {
        // Update Audio - get group from config using current slide's groupIndex
        const currentGroup = gallery.config.groups[currentSlide.groupIndex];
        if (currentGroup && window.getSupportedAudioSource) {
            let audioSrc = null;
            if (currentGroup.audioSources) {
                audioSrc = getSupportedAudioSource(currentGroup.audioSources);
            } else {
                audioSrc = currentGroup.audioSrc; // Backward compatibility
            }
            audioPlayer.setTrack(audioSrc);
        }
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
            if (audioPlayer && audioPlayer.audio) {
                if (audioPlayer.audio.paused) {
                    audioPlayer.play();
                } else {
                    audioPlayer.audio.pause();
                }
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
            if (muteBtn) muteBtn.click();
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
        // Start preloading (don't await - let it happen in background)
        const initPromise = gallery.init();

        // Change loading screen to "Click to Enter" immediately
        const spinner = loadingOverlay.querySelector('.spinner');
        const text = loadingOverlay.querySelector('p');

        if (spinner) spinner.style.display = 'none';
        if (text) {
            // Use configured message or default
            text.textContent = galleryConfig.ui?.messages?.startPrompt || "Press Enter or Click to Start";
        }

        loadingOverlay.classList.add('ready'); // Add class for cursor pointer

        // Function to start the gallery
        const startGallery = async () => {
            // Wait for init to complete before starting
            await initPromise;

            // Hide loading overlay FIRST (synchronously)
            loadingOverlay.classList.add('hidden');

            // Initial Render & Audio Start
            await updateState(null);

            // Remove from DOM after transition
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

        // Signal that event listeners are ready (for E2E tests)
        // Set this IMMEDIATELY, not after init completes
        if (loadingOverlay) {
            loadingOverlay.setAttribute('data-ready', 'true');
        }

    } catch (error) {
        console.error("Failed to initialize gallery:", error);
        // SECURITY: Use textContent to prevent XSS
        loadingOverlay.textContent = "Error loading gallery. Please refresh.";
    }
})();

// Initialize TouchZoom
if (window.TouchZoom && imageEl) {
    window.touchZoom = new TouchZoom();
    window.touchZoom.attach(imageEl);
}

// Initialize Touch Controls with settings
if (window.initTouchControls) {
    initTouchControls({
        containerEl: document.querySelector('.gallery-container'),
        swipeThreshold: galleryConfig.touch?.swipeThreshold,
        tapThreshold: galleryConfig.touch?.tapThreshold,
        longPressDuration: galleryConfig.timing?.longPressDuration,
        onSwipeLeft: navigateNext,  // Use extracted function
        onSwipeRight: navigatePrev, // Use extracted function
        shouldIgnoreSwipe: () => {
            // Ignore swipe if zoomed in
            return window.touchZoom && window.touchZoom.isZoomed();
        },
        onTap: () => {
            // Toggle UI visibility
            const controls = document.querySelector('.controls-wrapper');
            if (controls) {
                controls.classList.toggle('ui-hidden');
            }
        },
        onLongPress: () => {
            // Toggle Audio Play/Pause (only if audio enabled)
            if (audioPlayer && audioPlayer.audio) {
                if (audioPlayer.audio.paused) {
                    audioPlayer.play();
                } else {
                    audioPlayer.audio.pause();
                }
            }
        }
    });
}

// Initialize Fullscreen Mode with settings
if (window.initFullscreen) {
    initFullscreen({
        rootEl: document.documentElement,
        controlsEl: document.querySelector('.controls-wrapper'),
        fullscreenButtonEl: document.getElementById('fullscreen-btn'),
        hideDelay: galleryConfig.timing?.fullscreenControlsHideDelay,
        onEnter: () => {
            document.body.classList.add('fullscreen');
        },
        onExit: () => {
            document.body.classList.remove('fullscreen');
        }
    });
}
