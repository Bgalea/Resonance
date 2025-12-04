/**
 * AudioPlayer Class
 * Handles audio playback, looping, and seamless transitions.
 * Now supports global volume and mute state.
 */
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.currentSrc = null;

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
     * Sets the track to play.
     * Applies current volume/mute settings to the new track.
     * @param {string} src - The URL of the audio track.
     */
    setTrack(src) {
        if (this.currentSrc === src) {
            // Already playing this track, do nothing to ensure seamless loop
            return;
        }

        this.stop();
        this.currentSrc = src;

        if (src) {
            this.audio.src = src;
            // Ensure volume/mute state is applied to the new source
            this._applyVolume();
            this.play();
        }
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
        this.audio.pause();
        this.audio.currentTime = 0;
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
