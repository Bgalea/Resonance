# Release Notes

## Version 1.4.0 - Feature Release
**Release Date:** December 5, 2025

### 🎯 Overview

Modern Audio Gallery v1.4.0 brings **professional audio transitions** and **advanced touch interactions**. The new Crossfading feature ensures gapless audio playback between groups, while Touch Zoom & Pan allows users to explore image details on mobile devices.

---

## ✨ **New Features**

### 🎵 **Sound Transition (Crossfading)**
- **Seamless Audio Switching**: No more abrupt cuts when navigating between groups
- **Configurable Control**: Adjust default fade duration (default: 2000ms) in settings
- **Professional Experience**: Creates a polished, immersive atmosphere

### 📱 **Touch Zoom & Pan**
- **Mobile-First Immersion**: Double-tap or pinch to zoom into high-resolution images
- **Smart Navigation**: Swipe gestures are intelligently disabled while zoomed
- **Smooth Panning**: Drag to explore details at up to 3x magnification

---

## 🔧 **Technical Details**
- **Dual Audio Engine**: new architecture manages two audio players to handle overlaps
- **Touch State Management**: complex handling of gesture conflicts (swipe vs pan)

---

## 📦 **What's Included**
- `js/transitionManager.js` - Updated for audio sync
- `js/touchZoom.js` - New module for zoom handling
- `js/audioPlayer.js` - Enhanced for crossfading

---

## Version 1.3.0 - Quality & Stability Release
**Release Date:** December 2, 2025
