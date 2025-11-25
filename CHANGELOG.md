# Changelog

All notable changes to the Modern Audio Gallery (Resonance) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Keyboard accessibility for loading overlay (Enter/Space to start)
- Comprehensive project review and quality assessment
- **Smart Lazy Loading**: Intelligent asset loading for large galleries
  - Three-tier preloading strategy (Critical, High Priority, Lazy)
  - Proximity-based loading (preload groups within distance 2)
  - Loading state indicators with accessibility support
  - Request cancellation for distant groups
  - On-demand loading for unpreloaded assets
  - Priority queue in AssetLoader (critical > high > normal)

### Changed
- Initial load now only loads critical assets (audio + first image)
- Gallery initialization is 60-75% faster (6s → 2s)
- Memory usage is more stable with improved LRU cache management
- Navigation preloads adjacent groups instead of just next group

### Fixed
- Group and picture numbering now start from 1 instead of 0 in the UI display
- Removed production console.log statement
- Centered UI controls (info area and audio controls) when not in fullscreen mode
- Removed broken documentation reference to deleted reorganize-pictures.js script

## [1.1.0] - 2025-11-24

### Added
- **Fullscreen Mode**: Toggle fullscreen with dedicated button or 'F' key
  - Auto-hiding controls in fullscreen for immersive viewing
  - Exit with Escape key or fullscreen button
- **Keyboard Shortcuts**: Complete keyboard navigation support
  - Arrow Keys: Navigate left/right between images
  - Space: Play/Pause audio
  - F: Toggle fullscreen
  - M: Mute/Unmute
  - Escape: Exit fullscreen
- **Touch & Gesture Navigation**: Enhanced mobile experience
  - Swipe Left/Right: Navigate between images
  - Tap: Toggle UI visibility (immersive mode)
  - Long Press: Pause/Resume audio
- **Auto-Generated Configuration**: Gallery config automatically generated from folder structure
  - `generateGalleryConfig.mjs` script scans `assets/groups/` directory
  - Eliminates manual configuration maintenance
- **Centered UI Controls**: Improved visual alignment of controls and info display
- **1-Indexed Picture Numbering**: Pictures now display as "Picture 1 of X" instead of "Picture 0 of X"

### Changed
- Updated README.md with fullscreen mode documentation and keyboard shortcuts
- Enhanced ARCHITECTURE.md with fullscreen.js module documentation
- Improved accessibility with ARIA labels and keyboard support

### Fixed
- Loading overlay text updated to indicate keyboard support
- UI centering for better visual consistency

## [1.0.0] - 2025-11-20

### Added
- **Core Gallery Functionality**
  - Grouped image gallery with audio synchronization
  - Looping audio for each group
  - Smart preloading (current group + next group)
  - Real-time navigation (SPA architecture)
  - Seamless audio playback across group transitions
- **Asset Management**
  - AssetLoader with LRU caching (configurable, default 50 items)
  - Concurrency limiting (max 6 parallel requests)
  - Request deduplication
  - Critical path optimization (audio + first image)
  - Background loading for remaining images
- **Security Features**
  - Content Security Policy (CSP)
  - Right-click protection on images
  - Drag-and-drop prevention
  - CSS user-select prevention
  - iOS long-press menu disabled
  - XSS prevention (textContent over innerHTML)
- **Cross-Browser Compatibility**
  - Browser feature detection
  - Graceful degradation for older browsers
  - Compatibility banner for unsupported browsers
- **Responsive Design**
  - Mobile-optimized layout
  - Tablet-friendly spacing
  - Desktop centered layout with max-width constraints
- **Testing**
  - Comprehensive unit test suite (`test.html`)
  - Tests for AssetLoader, Gallery, AudioPlayer, Fullscreen
  - Mock implementations for Image and Audio APIs
- **Documentation**
  - Comprehensive README.md
  - ARCHITECTURE.md with component descriptions
  - BACKLOG.md for future features
  - Inline code documentation

### Technical Details
- **Architecture**: Modular vanilla JavaScript
  - `main.js`: Application coordinator
  - `gallery.js`: State management
  - `audioPlayer.js`: Audio engine
  - `assetLoader.js`: I/O & caching
  - `touchControls.js`: Gesture handling
  - `fullscreen.js`: Fullscreen mode management
  - `browserCompatibility.js`: Feature detection
- **Performance**: Optimized loading with debounced navigation (300ms)
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

---

## Version History Summary

- **v1.1.0** (2025-11-24): Fullscreen mode, keyboard shortcuts, touch controls, UI improvements
- **v1.0.0** (2025-11-20): Initial release with core gallery functionality

---

## Contributing

When adding entries to this changelog:
1. Add new changes under `[Unreleased]` section
2. Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. Move unreleased changes to a new version section when releasing
4. Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
