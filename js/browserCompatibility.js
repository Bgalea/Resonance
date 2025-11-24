/**
 * Browser Compatibility Layer
 * Detects browser capabilities and sets the application mode.
 * Written in ES5 to ensure execution on older browsers.
 */
(function (window) {
    'use strict';

    var features = {
        promises: typeof Promise !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        audio: typeof window.Audio !== 'undefined',
        flexbox: typeof document.documentElement.style.flex !== 'undefined' || typeof document.documentElement.style.webkitFlex !== 'undefined',
        localStorage: typeof window.localStorage !== 'undefined',
        es6Modules: false // Will be checked via script tag behavior if possible, or inferred
    };

    // Simple inference for ES6 support
    // We avoid eval() or new Function() to respect strict CSP.
    // If Promise and Fetch are present, it's a strong indicator of a modern browser.
    features.arrowFunctions = features.promises && features.fetch;

    var mode = 'modern';
    var missingFeatures = [];

    if (!features.promises) missingFeatures.push('Promises');
    if (!features.fetch) missingFeatures.push('Fetch API');
    if (!features.audio) missingFeatures.push('Audio API');
    if (!features.flexbox) missingFeatures.push('Flexbox');
    if (!features.arrowFunctions) missingFeatures.push('ES6 Syntax');

    if (missingFeatures.length > 0) {
        // If we are missing critical features, downgrade
        if (!features.promises || !features.fetch || !features.arrowFunctions) {
            mode = 'degraded';
        } else {
            mode = 'fallback';
        }
    }

    var compatibilityData = {
        mode: mode,
        features: features,
        missing: missingFeatures,
        userAgent: navigator.userAgent
    };

    // Expose globally
    window.AppCompatibility = compatibilityData;



    // UI Feedback for non-modern modes
    if (mode !== 'modern') {
        window.addEventListener('load', function () {
            var banner = document.createElement('div');
            banner.className = 'compatibility-banner ' + mode;
            var msg = '<strong>Warning:</strong> Your browser is outdated. ';
            if (mode === 'degraded') {
                msg += 'Some features will not work. Please upgrade to a modern browser (Chrome, Edge, Firefox).';
            } else {
                msg += 'You may experience reduced functionality.';
            }
            banner.innerHTML = msg; // Safe here as we control the content
            if (document.body) {
                document.body.insertBefore(banner, document.body.firstChild);
            }
        });
    }

})(window);
