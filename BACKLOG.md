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

## 📋 Planned Features

------------------------------------------------

## FEATURE 12 – Transitions & Visual Effects (Modern Mode Only)

**Goal:** Add subtle, modern visual polish while keeping compatibility.

**User Story:**
As a user on a modern device, I want smooth transitions between images to enhance the aesthetic.

**Acceptance Criteria:**
- [ ] Simple transition types: Fade, Crossfade, Slide (optional).
- [ ] Configure transitions ONLY in modern mode; fallback/degraded modes should gracefully use instant switches.
- [ ] Possibly a config option for transition type and duration.
- [ ] In modern mode, navigating between pictures shows a smooth transition (e.g. fade).
- [ ] In fallback / degraded modes, navigation still works with no transition and no errors.
- [ ] Transitions do not cause flicker or break preloading.

**Priority:** MEDIUM  
**Dependencies:** browserCompatibility / mode detection; existing render logic.

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
