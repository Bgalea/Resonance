# Architecture Documentation

## System Overview

The Modern Audio Gallery is a single-page application (SPA) built with vanilla JavaScript. It follows a modular architecture where distinct components handle specific responsibilities (State, Audio, I/O, UI).

### Core Components

1.  **`main.js` (Coordinator)**
    -   Entry point of the application.
    -   Initializes all other components.
    -   Wires up DOM event listeners (buttons, keyboard).
    -   Updates the UI based on state changes.

2.  **`gallery.js` (State Management)**
    -   Manages the list of slides (images).
    -   Tracks the current index.
    -   Handles navigation logic (`next()`, `prev()`).
    -   Triggers preloading of the next group.

3.  **`audioPlayer.js` (Audio Engine)**
    -   Wraps the HTML5 `Audio` API.
    -   Handles playback, looping, and volume control.
    -   Maintains global volume/mute state across track changes.

4.  **`assetLoader.js` (I/O & Caching)**
    -   Handles all network requests for images and audio.
    -   Implements an LRU Cache to manage memory.
    -   Implements a Concurrency Limiter to prevent network congestion.
    -   Deduplicates in-flight requests.
    -   **Priority Queue**: Processes requests based on priority (critical, high, normal).
    -   **Request Cancellation**: Can cancel pending requests that are no longer needed.

5.  **`loadingStateManager.js` (Loading State UI)**
    -   Manages loading indicators for images.
    -   Shows placeholders when assets aren't ready.
    -   Announces loading states to screen readers.
    -   Handles timeout and error states.

6.  **`touchControls.js` & `fullscreen.js` (Input/Mode)**
    -   Standalone modules that enhance the UI.
    -   `touchControls` handles swipe/tap gestures.
    -   `fullscreen` handles the Fullscreen API and auto-hiding controls.

## Data Flow

1.  **Initialization**:
    -   `main.js` creates `AssetLoader`, `Gallery`, `AudioPlayer`.
    -   `Gallery` loads config and preloads the first group via `AssetLoader`.
    -   UI shows "Click to Enter".

2.  **Navigation (Next/Prev)**:
    -   User triggers action (Click, Key, Swipe).
    -   `main.js` calls `gallery.next()`.
    -   `gallery.js` updates index and calls `_preloadAdjacentGroups()`.
    -   `main.js` calls `updateState()`.
    -   `updateState()` checks if image is loaded:
        -   If loaded: Updates DOM immediately
        -   If not loaded: Shows loading indicator, loads on-demand, then updates DOM
    -   `updateState()` updates DOM (Image src, Caption) and calls `audioPlayer.setTrack()`.

3.  **Audio State**:
    -   `audioPlayer` stores `volume` and `isMuted`.
    -   When `setTrack()` is called, these settings are applied to the new `Audio` object immediately.

## Directory Structure

```
/
├── index.html          # Main DOM structure
├── styles.css          # Global styles
├── js/
│   ├── main.js         # Entry point
│   ├── gallery.js      # State logic
│   ├── audioPlayer.js  # Audio logic
│   ├── assetLoader.js  # Loading logic
│   ├── config.js       # Configuration (or generatedConfig.js)
│   └── ...
├── assets/             # Images and Audio
└── scripts/            # Build scripts (Node.js)
```
