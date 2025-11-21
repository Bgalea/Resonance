/**
 * AudioPlayer Class
 * Handles audio playback, looping, and seamless transitions.
 */
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = true; // Always loop by default as per requirements
        this.currentSrc = null;
    }

    /**
     * Sets the track to play.
     * If the track is already playing, it does nothing.
     * If it's a new track, it stops the old one and starts the new one.
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
            this.play();
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
                console.warn("Auto-play prevented by browser policy. Interaction needed.", error);
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
