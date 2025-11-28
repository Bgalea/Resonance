/**
 * Audio Utility Functions
 * Handles browser support detection and format selection.
 */

/**
 * Checks if the browser can play a specific audio MIME type.
 * @param {string} mimeType 
 * @returns {boolean}
 */
function canPlayType(mimeType) {
    const audio = new Audio();
    return audio.canPlayType(mimeType).replace(/^no$/, '') !== '';
}

/**
 * Selects the best supported audio source from a list.
 * Prioritizes OGG > MP3 > WAV.
 * @param {string[]} sources - Array of audio file URLs.
 * @returns {string|null} - The best supported source URL, or null if none supported.
 */
export function getSupportedAudioSource(sources) {
    if (!sources || sources.length === 0) return null;

    // Map extensions to MIME types
    const mimeTypes = {
        '.ogg': 'audio/ogg; codecs="vorbis"',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
    };

    // 1. Try OGG first (preferred for open web)
    const oggSource = sources.find(src => src.toLowerCase().endsWith('.ogg'));
    if (oggSource && canPlayType(mimeTypes['.ogg'])) {
        return oggSource;
    }

    // 2. Try MP3 second (widely supported, fallback for Safari)
    const mp3Source = sources.find(src => src.toLowerCase().endsWith('.mp3'));
    if (mp3Source && canPlayType(mimeTypes['.mp3'])) {
        return mp3Source;
    }

    // 3. Try WAV (uncompressed, large, last resort)
    const wavSource = sources.find(src => src.toLowerCase().endsWith('.wav'));
    if (wavSource && canPlayType(mimeTypes['.wav'])) {
        return wavSource;
    }

    // 4. Fallback: Return the first source if nothing else matched (browser might still play it)
    return sources[0];
}
