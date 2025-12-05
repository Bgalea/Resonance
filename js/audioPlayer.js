/**
 * AudioPlayer Class
 * Handles audio playback, looping, and seamless transitions.
 * Now supports global volume and mute state.
 */
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.fadingAudio = null; // Track being faded out
        this.currentSrc = null;
        this.crossfadeDuration = (typeof galleryConfig !== 'undefined' && galleryConfig.crossfadeDuration) || 2000;
        this.fadeInterval = null;

        // Global audio state
        const storedVolume = localStorage.getItem('audioVolume');
        this.volume = storedVolume !== null ? parseFloat(storedVolume) : 0.7;
        this.isMuted = localStorage.getItem('audioMuted') === 'true';

        // Apply initial state
        this._applyVolume();

        // Append to DOM for accessibility and testing
        try {
            if (typeof document !== 'undefined' && document.body) {
                document.body.appendChild(this.audio);
            }
        } catch (e) {
            // Ignore DOM errors in test environment
        }
    }

    /**
     * Sets the track to play with crossfading.
     * @param {string} src - The URL of the audio track.
     */
    setTrack(src) {
        if (this.currentSrc === src) {
            return;
        }

        // 1. Handle existing track (Fade Out)
        if (this.currentSrc) {
            // If we already have a fading track, stop it immediately
            if (this.fadingAudio) {
                this.fadingAudio.pause();
                this.fadingAudio = null;
            }

            // Move current audio to fading audio
            this.fadingAudio = this.audio;

            // Create new audio element for new track
            this.audio = new Audio();
            this.audio.loop = true;
            try {
                if (typeof document !== 'undefined' && document.body) {
                    document.body.appendChild(this.audio);
                }
            } catch (e) { }
        }

        this.currentSrc = src;

        if (src) {
            this.audio.src = src;
            // Start silent
            this.audio.volume = 0;
            this.audio.muted = this.isMuted;

            this.play();

            // Start Crossfade
            this._startCrossfade();
        } else {
            // If no new track, just fade out old one
            this._startCrossfade();
        }
    }

    _startCrossfade() {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }

        const startTime = Date.now();
        const duration = this.crossfadeDuration;
        const targetVolume = this.isMuted ? 0 : this.volume;
        const startVolumeFading = this.fadingAudio ? this.fadingAudio.volume : 0;

        this.fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Fade In New Track
            if (this.audio && !this.isMuted) {
                this.audio.volume = progress * targetVolume;
            }

            // Fade Out Old Track
            if (this.fadingAudio) {
                this.fadingAudio.volume = Math.max(0, startVolumeFading * (1 - progress));
            }

            // Cleanup when done
            if (progress >= 1) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;

                if (this.fadingAudio) {
                    this.fadingAudio.pause();
                    try {
                        if (this.fadingAudio.parentNode) {
                            this.fadingAudio.parentNode.removeChild(this.fadingAudio);
                        }
                    } catch (e) { }
                    this.fadingAudio = null;
                }

                // Ensure final volume is exact
                this._applyVolume();
            }
        }, 50); // Update every 50ms
    }

    /**
     * Sets the global volume.
     * @param {number} volume - Volume between 0.0 and 1.0
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        // If volume is 0, treat as muted, otherwise unmuted
        if (this.volume === 0) {
            this.isMuted = true;
        } else if (this.isMuted && this.volume > 0) {
            this.isMuted = false;
        }

        this._applyVolume();
        localStorage.setItem('audioVolume', this.volume);
    }

    /**
     * Toggles mute state.
     * @param {boolean} isMuted 
     */
    setMuted(isMuted) {
        this.isMuted = isMuted;
        this._applyVolume();
        localStorage.setItem('audioMuted', this.isMuted);
    }

    /**
     * Internal helper to apply volume based on mute state.
     */
    _applyVolume() {
        // If fading, don't snap volume, let fade finish (or restart fade if needed logic could be added)
        // For simplicity, if user changes volume during fade, we snap to new volume to be responsive
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            if (this.fadingAudio) {
                this.fadingAudio.pause();
                this.fadingAudio = null;
            }
        }

        this.audio.muted = this.isMuted;
        if (this.isMuted) {
            this.audio.volume = 0;
        } else {
            this.audio.volume = this.volume;
        }
    }

    /**
     * Plays the current audio track.
     * Handles potential auto-play policies by catching errors.
     */
    play() {
        if (!this.currentSrc) return;
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Auto-play prevented.", error);
            });
        }
    }

    /**
     * Stops the audio and resets time to 0.
     */
    stop() {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.audio.pause();
        this.audio.currentTime = 0;
        if (this.fadingAudio) {
            this.fadingAudio.pause();
            this.fadingAudio = null;
        }
    }

    /**
     * Returns the underlying Audio element.
     * Useful for testing.
     */
    get currentAudio() {
        return this.audio;
    }
}

// Export for ES6 modules (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioPlayer };
}

// Always assign to window for browser usage
if (typeof window !== 'undefined') {
    window.AudioPlayer = AudioPlayer;
}
