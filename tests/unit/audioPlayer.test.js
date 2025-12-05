/**
 * Unit tests for AudioPlayer class
 * Tests volume control, mute functionality, and track switching
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioPlayer } from '../../js/audioPlayer.js';

describe('AudioPlayer', () => {
    let audioPlayer;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Mock timers for crossfade testing
        vi.useFakeTimers();
        // Mock global config if needed, or rely on default
        global.galleryConfig = { crossfadeDuration: 2000 };

        audioPlayer = new AudioPlayer();
        // Mock play to avoid errors
        audioPlayer.audio.play = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        delete global.galleryConfig;
    });

    describe('Initialization', () => {
        it('should initialize with default volume of 0.7', () => {
            expect(audioPlayer.volume).toBe(0.7);
        });

        it('should initialize as not muted', () => {
            expect(audioPlayer.isMuted).toBe(false);
        });

        it('should load saved volume from localStorage', () => {
            localStorage.setItem('audioVolume', '0.5');
            const player = new AudioPlayer();
            expect(player.volume).toBe(0.5);
        });

        it('should load saved mute state from localStorage', () => {
            localStorage.setItem('audioMuted', 'true');
            const player = new AudioPlayer();
            expect(player.isMuted).toBe(true);
        });
    });

    describe('setVolume()', () => {
        it('should set volume to specified value', () => {
            audioPlayer.setVolume(0.5);
            expect(audioPlayer.volume).toBe(0.5);
        });

        it('should clamp volume to 0-1 range', () => {
            audioPlayer.setVolume(1.5);
            expect(audioPlayer.volume).toBe(1);

            audioPlayer.setVolume(-0.5);
            expect(audioPlayer.volume).toBe(0);
        });

        it('should save volume to localStorage', () => {
            audioPlayer.setVolume(0.6);
            expect(localStorage.getItem('audioVolume')).toBe('0.6');
        });

        it('should apply volume to current audio', () => {
            // Without setTrack, it applies immediately
            audioPlayer.setVolume(0.5);
            expect(audioPlayer.currentAudio.volume).toBe(0.5);
        });

        it('should unmute if volume is set above 0', () => {
            audioPlayer.setMuted(true);
            audioPlayer.setVolume(0.5);
            expect(audioPlayer.isMuted).toBe(false);
        });
    });

    describe('setMuted()', () => {
        it('should mute audio', () => {
            audioPlayer.setMuted(true);
            expect(audioPlayer.isMuted).toBe(true);
        });

        it('should unmute audio', () => {
            audioPlayer.setMuted(true);
            audioPlayer.setMuted(false);
            expect(audioPlayer.isMuted).toBe(false);
        });

        it('should save mute state to localStorage', () => {
            audioPlayer.setMuted(true);
            expect(localStorage.getItem('audioMuted')).toBe('true');
        });

        it('should apply mute to current audio', () => {
            audioPlayer.setMuted(true);
            expect(audioPlayer.currentAudio.muted).toBe(true);
        });
    });

    describe('setTrack()', () => {
        it('should create new Audio object with correct src', () => {
            audioPlayer.setTrack('test.mp3');
            expect(audioPlayer.currentAudio.src).toContain('test.mp3');
        });

        it('should start with volume 0 and fade in to target volume', () => {
            audioPlayer.setVolume(0.5);
            audioPlayer.setTrack('test.mp3');

            // Initially 0 for crossfade
            expect(audioPlayer.currentAudio.volume).toBe(0);

            // Advance halfway (1000ms)
            vi.advanceTimersByTime(1000);
            expect(audioPlayer.currentAudio.volume).toBeCloseTo(0.25, 1);

            // Advance to end (2000ms)
            vi.advanceTimersByTime(1000);
            expect(audioPlayer.currentAudio.volume).toBe(0.5);
        });

        it('should preserve mute state when switching tracks', () => {
            audioPlayer.setMuted(true);
            audioPlayer.setTrack('test.mp3');
            expect(audioPlayer.currentAudio.muted).toBe(true);
        });

        it('should set loop to true', () => {
            audioPlayer.setTrack('test.mp3');
            expect(audioPlayer.currentAudio.loop).toBe(true);
        });

        it('should fade out old audio before removing', () => {
            // Setup first track
            audioPlayer.setVolume(1.0);
            audioPlayer.setTrack('test1.mp3');
            vi.advanceTimersByTime(2000); // Finish fade in

            const oldAudio = audioPlayer.currentAudio;
            oldAudio.play = vi.fn(); // Mock play
            oldAudio.pause = vi.fn(); // Mock pause

            // Switch track
            audioPlayer.setTrack('test2.mp3');

            // Old audio should be fadingAudio now
            expect(audioPlayer.fadingAudio).toBe(oldAudio);

            // Advance halfway
            vi.advanceTimersByTime(1000);
            expect(oldAudio.volume).toBeCloseTo(0.5, 1);

            // Advance to end
            vi.advanceTimersByTime(1000);
            expect(oldAudio.volume).toBe(0);
            expect(oldAudio.pause).toHaveBeenCalled();
            expect(audioPlayer.fadingAudio).toBeNull();
        });

        it('should not change track if src is the same', () => {
            audioPlayer.setTrack('test.mp3');
            const firstAudio = audioPlayer.currentAudio;

            audioPlayer.setTrack('test.mp3');
            expect(audioPlayer.currentAudio).toBe(firstAudio);
        });
    });

    describe('play() and stop()', () => {
        beforeEach(() => {
            audioPlayer.setTrack('test.mp3');
            // Fast forward fade for these tests
            vi.advanceTimersByTime(2000);
        });

        it('should play audio', async () => {
            await audioPlayer.play();
            expect(audioPlayer.currentAudio.play).toHaveBeenCalled();
        });

        it('should stop audio', () => {
            const pauseSpy = vi.spyOn(audioPlayer.currentAudio, 'pause');
            audioPlayer.stop();
            expect(pauseSpy).toHaveBeenCalled();
        });
    });

    describe('State Persistence', () => {
        it('should persist volume across instances', () => {
            audioPlayer.setVolume(0.8);

            const newPlayer = new AudioPlayer();
            expect(newPlayer.volume).toBe(0.8);
        });

        it('should persist mute state across instances', () => {
            audioPlayer.setMuted(true);

            const newPlayer = new AudioPlayer();
            expect(newPlayer.isMuted).toBe(true);
        });
    });
});
