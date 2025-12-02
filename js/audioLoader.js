/**
 * Conditionally load audio modules based on configuration.
 * This is extracted from index.html to comply with Content Security Policy (no inline scripts).
 */
(function () {
    // List of scripts to load
    const scriptsToLoad = [];

    // Check if sound is enabled in the configuration
    if (typeof galleryConfig !== 'undefined' && galleryConfig.enableSound === false) {
        // Add class to body for CSS styling
        document.body.classList.add('sound-disabled');
        console.log('Sound disabled - audio modules will not be loaded');
    } else {
        // Load audio modules when sound is enabled
        scriptsToLoad.push('js/audioPlayer.js');
        scriptsToLoad.push('js/audioUtils.js');
    }

    // Always load main.js last
    scriptsToLoad.push('js/main.js');

    // Load scripts sequentially
    scriptsToLoad.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Ensure execution order
        document.body.appendChild(script); // Append to body like original
    });
})();
