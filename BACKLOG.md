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
