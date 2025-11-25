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

## 📋 Planned Features

------------------------------------------------

## FEATURE 6 – Smart Lazy Loading for Large Galleries

**Goal:** Scale to large galleries while keeping performance high.

**User Story:**
As a user with a slow connection, I want images to load only when I'm about to see them, so the initial load is fast.

**Acceptance Criteria:**
- [ ] Keep preloading for current + next group as today.
- [ ] For additional groups beyond next, use lazy loading (load "just in time" when approaching those groups).
- [ ] Optionally show a small loading placeholder or progress when an image is not yet ready.
- [ ] App remains responsive even with many groups.
- [ ] No long initial load when there are many assets.
- [ ] For distant groups, assets are fetched later, without blocking UI.

**Priority:** MEDIUM/HIGH  
**Dependencies:** Existing AssetLoader, galleryConfig, preloading logic.

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
