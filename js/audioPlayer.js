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
        this.volume = 0.7; // Default volume
        this.isMuted = false;

        // Apply initial state
        this.audio.volume = this.volume;
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
    }

    /**
     * Toggles mute state.
     * @param {boolean} isMuted 
     */
    setMuted(isMuted) {
        this.isMuted = isMuted;
        this._applyVolume();
    }

    /**
     * Internal helper to apply volume based on mute state.
     */
    _applyVolume() {
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
}
