# Resonance

A modern, minimalist audio picture gallery web application.

## Features

-   **Immersive Experience**: Full-screen gallery with a dark, minimalist aesthetic.
-   **Synchronized Audio**: Each group of pictures has a specific audio track that loops seamlessly.
-   **Smart Transitions**:
    -   Audio continues playing when navigating within the same group.
    -   Audio switches smoothly when moving to a new group.
-   **Client-Side Navigation**: Instant transitions with no page reloads.
-   **Zero Dependencies**: Built with vanilla HTML, CSS, and JavaScript. No build step required.

## Setup & Usage

1.  Clone the repository:
    ```bash
    git clone https://github.com/Bgalea/Resonance.git
    ```
2.  Open `index.html` in your web browser.
3.  **Note**: Click anywhere on the page or use the navigation buttons to enable audio playback (browsers block auto-play by default).

## Project Structure

-   `index.html`: Main entry point.
-   `styles.css`: All styles for the application.
-   `js/`:
    -   `config.js`: Configuration for image groups and audio sources.
    -   `audioPlayer.js`: Logic for audio playback and looping.
    -   `gallery.js`: Logic for gallery state and navigation.
    -   `main.js`: Application initialization and UI wiring.
-   `assets/`:
    -   `images/`: Local image files.
    -   `audio/`: Local audio files.

## Customization

You can easily add your own content by modifying `js/config.js`. Just add new groups with your own image and audio paths.