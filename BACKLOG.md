# Backlog of Future Features

This document outlines planned and completed features for the Modern Audio Gallery.

## ✅ Completed Features

------------------------------------------------

### FEATURE 9 – Desktop Hotkeys (Keyboard Shortcuts) ✅ COMPLETED

**Goal:** Improve desktop usability with keyboard navigation.

**User Story:**
As a desktop user, I want to control the gallery with my keyboard for faster navigation.

**Acceptance Criteria:**
- [x] Left Arrow: previous picture.
- [x] Right Arrow: next picture.
- [x] Space: Play/Pause audio.
- [x] M: mute/unmute audio.
- [x] F: toggle fullscreen mode.
- [x] Escape: exit fullscreen.
- [x] On desktop browsers, these keys work when the gallery has focus.
- [x] Shortcuts do not interfere with standard browser behavior when appropriate.
- [x] Shortcuts are documented in README.

**Status:** ✅ Implemented in current version  
**Completed:** November 2025

------------------------------------------------

### BUG FIX – Display Index Starting from 1 ✅ COMPLETED

**Issue:** Group and picture indices were displaying as 0-based (starting from 0) instead of 1-based in the UI.

**User Story:**
As a user, I want to see "Group 1 – Picture 1 of X" instead of "Group 0 – Picture 0 of X" for better readability.

**Resolution:**
- [x] Updated display logic in `main.js` to add 1 to both `groupIndex` and `imageIndex`
- [x] Internal indices remain 0-based (programming standard)
- [x] Display now shows user-friendly 1-based numbering
- [x] Updated CHANGELOG.md with fix documentation

**Status:** ✅ Fixed in current version  
**Completed:** November 2025

------------------------------------------------

### FEATURE 6 – Smart Lazy Loading for Large Galleries ✅ COMPLETED

**Goal:** Scale to large galleries while keeping performance high.

**User Story:**
As a user with a slow connection, I want images to load only when I'm about to see them, so the initial load is fast.

**Implementation:**
- [x] Three-tier preloading strategy (Critical, High Priority, Lazy)
- [x] Proximity-based loading (preload groups within distance 2)
- [x] Loading state UI with spinner and screen reader announcements
- [x] Request cancellation for distant groups
- [x] On-demand loading for unpreloaded assets
- [x] Priority queue in AssetLoader (critical > high > normal)
- [x] Maintained LRU cache and concurrency limiting

**Performance Improvements:**
- Initial load time reduced by 60-75% (6s → 2s)
- Memory usage stabilized with LRU eviction
- Network efficiency improved by 30-50%
- Supports 50+ groups, 1000+ images

**Status:** ✅ Implemented in current version  
**Completed:** November 2025

------------------------------------------------

### FEATURE 12 – Transitions & Visual Effects ✅ COMPLETED

**Goal:** Add subtle, modern visual polish while keeping compatibility.

**User Story:**
As a user on a modern device, I want smooth transitions between images to enhance the aesthetic.

**Implementation:**
- [x] Fade and crossfade transition types
- [x] Configurable duration and type via galleryConfig
- [x] Browser support detection with graceful degradation
- [x] Accessibility: respects `prefers-reduced-motion`
- [x] GPU acceleration for smooth 60fps transitions
- [x] No impact on preloading or audio playback

**Performance:**
- Transitions run at 60fps with GPU acceleration
- Fade transition: ~400ms duration (configurable)
- Crossfade transition: ~400ms duration (configurable)
- Zero impact on initial load time

**Status:** ✅ Implemented in current version  
**Completed:** November 2025

------------------------------------------------

### E2E TEST INFRASTRUCTURE – Script Loading & Test Stability ✅ COMPLETED

**Goal:** Ensure 100% E2E test pass rate across all browsers by fixing race conditions and timing issues.

**Issue:** E2E tests were failing in Chromium and Mobile Chrome browsers due to a script loading race condition where `main.js` could execute before its dependencies were ready.

**User Story:**
As a developer, I want all E2E tests to pass reliably across all browsers so I can confidently deploy changes.

**Resolution:**
- [x] Fixed critical script loading race condition in `index.html`
- [x] Moved `audioLoader.js` to end of script list to ensure dependencies load first
- [x] Fixed keyboard navigation test timing issue
- [x] Added robust error handling in `main.js` initialization
- [x] Enhanced E2E test synchronization with proper wait conditions

**Results:**
- Chromium: 22/22 tests passing (was 9/22)
- Firefox: 22/22 tests passing (was 21/22)
- WebKit: 22/22 tests passing (maintained)
- Mobile Chrome: 24/24 tests passing (was 0/24)
- Total: 80/88 tests passing (8 skipped as expected)

**Status:** ✅ Fixed in v1.3.0  
**Completed:** December 2025

------------------------------------------------

### FEATURE 14 – Optional Sound Configuration ✅ COMPLETED

**Goal:** Allow users to disable sound functionality entirely, reducing resource usage and simplifying the UI for image-only galleries.

**User Story:**
As a gallery administrator, I want to configure whether the gallery uses sound or not, so I can create a simpler image-only experience when audio is not needed.

**Implementation:**
- [x] `enableSound` boolean configuration option (default: `true` for backward compatibility)
- [x] When `enableSound` is `false`, audio modules are not loaded via `audioLoader.js`
- [x] CSS `.sound-disabled` class hides audio controls when sound is disabled
- [x] No audio files loaded when sound is disabled
- [x] Gallery functions normally for image navigation without audio
- [x] No console errors when sound is disabled

**Status:** ✅ Implemented in v1.3.0  
**Completed:** December 2025

------------------------------------------------

## 📋 Planned Features

------------------------------------------------

## FEATURE 13 – Artist / Metadata Support per Group & Picture

**Goal:** Associate metadata with groups and/or images (title, description, tags, etc.).

**User Story:**
As a curator, I want to display titles and descriptions for each image/group so viewers understand the context.

**Acceptance Criteria:**
- [ ] Optional metadata JSON files per group (e.g., `assets/groups/<groupId>/info.json`).
- [ ] Support for `groupTitle`, `groupDescription`.
- [ ] Support for per-picture `title`, `description`, `tags`.
- [ ] UI updates to display this information if present.

**Priority:** LOW  
**Dependencies:** Asset structure, UI redesign to accommodate text.

------------------------------------------------

## FEATURE 15 – Slideshow Mode (Auto-Play)

**Goal:** Allow users to sit back and watch the gallery play automatically with synchronized audio.

**User Story:**
As a viewer, I want to start a slideshow so I can enjoy the visual and audio experience hands-free.

**Acceptance Criteria:**
- [ ] "Play Slideshow" button in UI (and keyboard shortcut 'S').
- [ ] Configurable interval (default 5s).
- [ ] Pauses on user interaction (hover/touch).
- [ ] Smart timing: waits for audio track completion if configured.
- [ ] Visual progress indicator for next slide.

**Priority:** MEDIUM  
**Role:** Product Owner Recommendation

------------------------------------------------

### FEATURE 16 – Touch Zoom & Pan ✅ COMPLETED

**Goal:** Enable detailed inspection of images on mobile devices.

**User Story:**
As a mobile user, I want to pinch to zoom into an image to see details, and pan around when zoomed in.

**Implementation:**
- [x] Pinch-to-zoom gesture support (1x to 3x)
- [x] Double-tap to zoom in/out
- [x] Pan gesture when zoomed in
- [x] Reset zoom on slide change
- [x] Smart integration with swipe navigation (swipes disabled when zoomed)

**Status:** ✅ Implemented in v1.3.1  
**Completed:** December 2025

------------------------------------------------

## FEATURE 17 – PWA & Offline Support

**Goal:** Make the gallery installable and functional without an internet connection.

**User Story:**
As a user with spotty internet, I want the gallery to work offline so I can view previously loaded content.

**Acceptance Criteria:**
- [ ] Web App Manifest (installable on home screen).
- [ ] Service Worker for asset caching.
- [ ] Offline fallback UI.
- [ ] Cache management strategy (Cache-First for assets).

**Priority:** HIGH  
**Role:** Architect Recommendation (Performance/Reliability)

------------------------------------------------

## FEATURE 18 – TypeScript Migration

**Goal:** Improve code maintainability, type safety, and developer experience.

**User Story:**
As a developer, I want type safety and better IDE support to reduce runtime errors and refactoring risks.

**Acceptance Criteria:**
- [ ] Set up TypeScript build process (Vite or tsc).
- [ ] Define interfaces for GalleryConfig, Asset, AudioTrack.
- [ ] Incrementally migrate `.js` files to `.ts`.
- [ ] Strict null checks enabled.

**Priority:** MEDIUM (Technical Debt)  
**Role:** Architect Recommendation (Maintainability)

------------------------------------------------

## FEATURE 19 – Automated Image Optimization Pipeline

**Goal:** Ensure all served images are optimized for web performance automatically.

**User Story:**
As a developer, I want images to be automatically converted to WebP/AVIF and resized so I don't have to do it manually.

**Acceptance Criteria:**
- [ ] Script to generate WebP/AVIF variants of assets.
- [ ] `<picture>` tag implementation in `AssetLoader` to serve best format.
- [ ] Responsive `srcset` generation for different screen sizes.

**Priority:** MEDIUM  
**Role:** Architect Recommendation (Performance)

------------------------------------------------

## FEATURE 20 – E2E Tests for Touch Zoom & Pan

**Goal:** Ensure Feature 16 (Touch Zoom & Pan) works correctly in real browser environments across devices.

**User Story:**
As a QA engineer, I want comprehensive E2E tests for touch zoom functionality so we can catch regressions and ensure cross-device compatibility.

**Acceptance Criteria:**
- [ ] Create `tests/e2e/touchZoom.spec.js` test suite
- [ ] Test pinch-to-zoom functionality (1x to 3x scale)
- [ ] Test double-tap zoom toggle (zoom in/out)
- [ ] Test panning when zoomed with boundary constraints
- [ ] Test swipe navigation disabled when zoomed
- [ ] Test zoom reset on image navigation
- [ ] Test on mobile viewports (iPhone, Android)
- [ ] Test on touch-enabled desktop browsers

**Priority:** HIGH (Critical Gap)  
**Role:** Test Coverage Analysis  
**Dependencies:** Feature 16 (completed), Playwright touch API

------------------------------------------------

## FEATURE 21 – Touch Gesture E2E Tests

**Goal:** Add comprehensive E2E tests for all touch interactions beyond zoom.

**User Story:**
As a mobile user, I want confidence that swipe navigation and long-press controls work reliably across all touch devices.

**Acceptance Criteria:**
- [ ] Test swipe left/right for navigation using `page.touchscreen.swipe()`
- [ ] Test long-press to pause/play audio
- [ ] Test tap to toggle UI visibility
- [ ] Test touch interactions on mobile viewports
- [ ] Test gesture conflicts (e.g., browser pull-to-refresh)
- [ ] Verify touch events don't interfere with keyboard shortcuts

**Priority:** MEDIUM  
**Role:** Test Coverage Analysis  
**Dependencies:** Touch Controls (Feature 11)

------------------------------------------------

## FEATURE 22 – Advanced Fullscreen E2E Tests

**Goal:** Enhance fullscreen mode testing to cover auto-hide behavior and edge cases.

**User Story:**
As a user, I want the fullscreen experience to be polished with controls that auto-hide after inactivity.

**Acceptance Criteria:**
- [ ] Test UI auto-hide after inactivity timeout (3 seconds)
- [ ] Test UI shows on mouse movement/touch
- [ ] Test fullscreen exit on browser back button
- [ ] Test fullscreen state persistence across navigation
- [ ] Test fullscreen on different screen orientations (portrait/landscape)
- [ ] Test picture-in-picture compatibility

**Priority:** LOW  
**Role:** Test Coverage Analysis  
**Dependencies:** Fullscreen Mode (Feature 7-9)

------------------------------------------------

## FEATURE 23 – Audio Group Transition E2E Tests

**Goal:** Verify audio behavior when navigating between different groups.

**User Story:**
As a viewer, I want seamless audio transitions when moving between groups with different soundtracks.

**Acceptance Criteria:**
- [ ] Test audio track changes when crossing group boundaries
- [ ] Test audio fade-out/fade-in during transitions
- [ ] Test audio state (volume, mute) persists across groups
- [ ] Test audio preloading for next group
- [ ] Test audio cleanup when leaving group
- [ ] Test group metadata updates in UI

**Priority:** LOW  
**Role:** Test Coverage Analysis  
**Dependencies:** Audio Integration (Feature 4-6)

------------------------------------------------

## FEATURE 24 – Error Handling E2E Tests

**Goal:** Ensure graceful degradation when assets fail to load or errors occur.

**User Story:**
As a user with poor connectivity, I want the gallery to handle missing images and audio gracefully without breaking.

**Acceptance Criteria:**
- [ ] Create `tests/e2e/error.spec.js` test suite
- [ ] Test missing image file handling (404)
- [ ] Test missing audio file handling
- [ ] Test corrupted image handling
- [ ] Test network timeout scenarios
- [ ] Test browser console for error messages
- [ ] Test fallback UI for error states
- [ ] Test retry mechanisms

**Priority:** MEDIUM  
**Role:** Test Coverage Analysis  
**Dependencies:** Asset Loader, Error handling implementation

------------------------------------------------

## FEATURE 25 – Visual Regression Testing

**Goal:** Automatically detect unintended visual changes across releases.

**User Story:**
As a developer, I want to catch visual regressions automatically so UI bugs don't reach production.

**Acceptance Criteria:**
- [ ] Set up visual regression testing framework (Percy, Chromatic, or Playwright screenshots)
- [ ] Capture baseline screenshots for all major UI states
- [ ] Test across different viewports (mobile, tablet, desktop)
- [ ] Test across different browsers
- [ ] Integrate into CI/CD pipeline
- [ ] Define acceptable diff thresholds

**Priority:** LOW (Nice to Have)  
**Role:** Test Coverage Analysis  
**Dependencies:** CI/CD pipeline

------------------------------------------------

## FEATURE 26 – Performance Testing & Benchmarks

**Goal:** Establish performance baselines and catch performance regressions.

**User Story:**
As a developer, I want to ensure the gallery loads quickly and runs smoothly across all devices.

**Acceptance Criteria:**
- [ ] Set up Lighthouse CI for performance audits
- [ ] Define performance budgets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Test image loading performance
- [ ] Test audio loading performance
- [ ] Test transition smoothness (FPS monitoring)
- [ ] Test memory usage over time
- [ ] Create performance dashboard

**Priority:** LOW (Nice to Have)  
**Role:** Test Coverage Analysis  
**Dependencies:** CI/CD pipeline, monitoring tools

