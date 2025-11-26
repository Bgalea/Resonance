/**
 * Test setup file
 * Runs before all tests to set up global mocks and utilities
 */

// Mock Image constructor
global.Image = class {
    constructor() {
        this.src = '';
        this.onload = null;
        this.onerror = null;

        // Simulate async image loading
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 0);
    }
};

// Mock Audio constructor
global.Audio = class {
    constructor(src) {
        this.src = src || '';
        this.volume = 1;
        this.muted = false;
        this.paused = true;
        this.currentTime = 0;
        this.duration = 100;
        this.loop = false;
        this.preload = 'auto';

        this._listeners = {};
    }

    addEventListener(event, handler) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(handler);

        // Auto-trigger canplaythrough for testing
        if (event === 'canplaythrough') {
            setTimeout(() => handler(), 0);
        }
    }

    removeEventListener(event, handler) {
        if (this._listeners[event]) {
            this._listeners[event] = this._listeners[event].filter(h => h !== handler);
        }
    }

    play() {
        this.paused = false;
        return Promise.resolve();
    }

    pause() {
        this.paused = true;
    }

    load() {
        // Trigger canplaythrough
        if (this._listeners['canplaythrough']) {
            this._listeners['canplaythrough'].forEach(handler => handler());
        }
    }
};

// Mock localStorage
global.localStorage = {
    _data: {},
    getItem(key) {
        return this._data[key] || null;
    },
    setItem(key, value) {
        this._data[key] = String(value);
    },
    removeItem(key) {
        delete this._data[key];
    },
    clear() {
        this._data = {};
    }
};
