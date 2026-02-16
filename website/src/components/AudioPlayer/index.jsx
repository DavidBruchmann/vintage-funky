import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from './AudioContext';
import { useLoadPlaylist } from './useLoadPlaylist';
import styles from './AudioPlayer.module.css';

export function AudioPlayer() {
  useLoadPlaylist();

  const {
    playlist,
    currentIndex,
    isPlaying,
    shuffleMode,
    volume,
    togglePlayPause,
    handleNext,
    handlePrev,
    cycleShuffleMode,
    setShuffleModeDirect,
    setVolume,
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showShuffleMenu, setShowShuffleMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedButtonIndex, setFocusedButtonIndex] = useState(0);
  const [focusedShuffleOptionIndex, setFocusedShuffleOptionIndex] = useState(0);
  const volumeButtonRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const shuffleButtonRef = useRef(null);
  const shuffleMenuRef = useRef(null);
  const textContainerRef = useRef(null);
  const helpButtonRef = useRef(null);

  // Array of button refs for roving tabindex (order: prev, play, next, shuffle, volume)
  const buttonRefs = useRef([
    useRef(null), // prev
    useRef(null), // play
    useRef(null), // next
    useRef(null), // shuffle
    useRef(null), // volume
  ]);

  // Get current song info
  const currentSong = playlist.length > 0 ? playlist[currentIndex] : null;
  let collectTexts = [], n=0;
  let displayText;
  if (currentSong) {
    displayText = [
      currentSong.artist,
      currentSong.album ? `[${currentSong.album}]` : '',
      currentSong.filename
    ].filter(Boolean).join(' ');
    if (!displayText) {
      displayText = 'No songs loaded';
    }
  }

  // Handle Escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowShuffleMenu(false);
        setShowVolumeSlider(false);
        setShowHelpModal(false);
      }

      // Alt+F7 to focus player
      if (e.altKey && e.key === 'F7') {
        e.preventDefault();
        setFocusedButtonIndex(0);
        buttonRefs.current[0].current?.focus();
      }

      // ? to open help modal
      if (e.key === '?' && !showHelpModal) {
        e.preventDefault();
        setShowHelpModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelpModal]);

  // Handle volume slider drag
  const handleVolumeMouseDown = () => {
    setIsDragging(true);
  };

  const handleVolumeMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!volumeSliderRef.current) return;
      const rect = volumeSliderRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      const newVolume = Math.max(0, Math.min(100, 100 - (y / height) * 100));
      setVolume(newVolume);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setVolume]);

  // Handle keyboard volume control (arrow keys)
  const handleVolumeKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setVolume((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setVolume((prev) => Math.max(0, prev - 5));
    }
  };

  // Roving tabindex: navigate buttons with left/right arrows
  const handlePlayerKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (focusedButtonIndex + 1) % buttonRefs.current.length;
      setFocusedButtonIndex(nextIndex);
      buttonRefs.current[nextIndex].current?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (focusedButtonIndex - 1 + buttonRefs.current.length) % buttonRefs.current.length;
      setFocusedButtonIndex(prevIndex);
      buttonRefs.current[prevIndex].current?.focus();
    }
  };

  // Navigate shuffle menu options with up/down arrows
  const handleShuffleMenuKeyDown = (e) => {
    const modes = ['off', 'all', 'album', 'artist'];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (focusedShuffleOptionIndex + 1) % modes.length;
      setFocusedShuffleOptionIndex(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (focusedShuffleOptionIndex - 1 + modes.length) % modes.length;
      setFocusedShuffleOptionIndex(prevIndex);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShuffleModeDirect(modes[focusedShuffleOptionIndex]);
      setShowShuffleMenu(false);
    }
  };

  return (
    <div className={styles.playerWrapper} aria-label="Audio player">
      {/* Marquee text in fixed left area with aria-live for updates */}
      <div className={styles.textContainer} ref={textContainerRef}>
        <div
          className={styles.displayText}
          aria-live="polite"
          aria-label={`Now playing: ${displayText}`}
        >
          {displayText}
        </div>
      </div>

      {/* Player controls on the right */}
      <div className={styles.audioPlayer}>
        {/* Previous Button */}
        <button
          ref={buttonRefs.current[0]}
          className={styles.button}
          onClick={handlePrev}
          onKeyDown={handlePlayerKeyDown}
          disabled={playlist.length === 0}
          title="Previous (arrow keys to navigate)"
          aria-label="Previous track"
          tabIndex={focusedButtonIndex === 0 ? 0 : -1}
        >
          <i className="fas fa-step-backward"></i>
        </button>

        {/* Play/Stop Toggle */}
        <button
          ref={buttonRefs.current[1]}
          className={styles.button}
          onClick={togglePlayPause}
          onKeyDown={handlePlayerKeyDown}
          disabled={playlist.length === 0}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          tabIndex={focusedButtonIndex === 1 ? 0 : -1}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>

        {/* Next Button */}
        <button
          ref={buttonRefs.current[2]}
          className={styles.button}
          onClick={handleNext}
          onKeyDown={handlePlayerKeyDown}
          disabled={playlist.length === 0}
          title="Next"
          aria-label="Next track"
          tabIndex={focusedButtonIndex === 2 ? 0 : -1}
        >
          <i className="fas fa-step-forward"></i>
        </button>

        {/* Randomize Button with Shuffle Mode Menu */}
        <div
          className={styles.shuffleControl}
          ref={shuffleButtonRef}
          onMouseLeave={() => setShowShuffleMenu(false)}
        >
          <button
            ref={buttonRefs.current[3]}
            className={`${styles.button} ${shuffleMode !== 'off' ? styles.active : ''}`}
            onClick={() => setShowShuffleMenu(!showShuffleMenu)}
            onMouseEnter={() => setShowShuffleMenu(true)}
            onKeyDown={(e) => {
              if (showShuffleMenu) {
                handleShuffleMenuKeyDown(e);
              } else {
                handlePlayerKeyDown(e);
              }
            }}
            disabled={playlist.length === 0}
            title={`Shuffle: ${shuffleMode} (arrow keys to navigate)`}
            aria-label={`Shuffle: ${shuffleMode}`}
            tabIndex={focusedButtonIndex === 3 ? 0 : -1}
          >
            <i className="fas fa-shuffle"></i>
          </button>

          {/* Shuffle Mode Menu - always in DOM */}
          <div
            className={`${styles.shuffleMenu} ${showShuffleMenu ? styles.visible : ''}`}
            onMouseEnter={() => setShowShuffleMenu(true)}
            ref={shuffleMenuRef}
          >
            {['off', 'all', 'album', 'artist'].map((mode, index) => (
              <div
                key={mode}
                className={`${styles.shuffleMenuOption} ${shuffleMode === mode ? styles.selected : ''} ${focusedShuffleOptionIndex === index ? styles.focused : ''}`}
                onClick={() => {
                  setShuffleModeDirect(mode);
                  setShowShuffleMenu(false);
                }}
                onMouseEnter={() => setFocusedShuffleOptionIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={handleShuffleMenuKeyDown}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Volume/Mute Button with Slider */}
        <div
          className={styles.volumeControl}
          ref={volumeButtonRef}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            ref={buttonRefs.current[4]}
            className={`${styles.button} ${volume === 0 ? styles.muted : ''}`}
            title={`${volume === 0 ? 'Unmute' : 'Mute'} (arrow keys to navigate, ↑↓ to adjust when focused)`}
            aria-label={`Volume ${Math.round(volume)}% ${volume === 0 ? '(Unmute)' : '(Mute)'}`}
            onClick={() => setVolume(volume === 0 ? 35 : 0)}
            onKeyDown={handlePlayerKeyDown}
            tabIndex={focusedButtonIndex === 4 ? 0 : -1}
          >
            <i className={`fas ${volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>

          {/* Volume Slider Popup - always in DOM */}
          <div
            ref={volumeSliderRef}
            className={`${styles.volumeSlider} ${showVolumeSlider ? styles.visible : ''}`}
            onMouseDown={handleVolumeMouseDown}
            onMouseUp={handleVolumeMouseUp}
            role="slider"
            aria-label="Volume control"
            aria-valuenow={Math.round(volume)}
            aria-valuemin="0"
            aria-valuemax="100"
            tabIndex={0}
            onKeyDown={handleVolumeKeyDown}
          >
            <div
              className={styles.volumeTrack}
              style={{
                background: `linear-gradient(to bottom, #666 0%, #666 ${100 - volume}%, #1e90ff ${100 - volume}%, #1e90ff 100%)`,
              }}
              onClick={(e) => {
                if (!volumeSliderRef.current) return;
                const rect = volumeSliderRef.current.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const height = rect.height;
                const newVolume = Math.max(0, Math.min(100, 100 - (y / height) * 100));
                setVolume(newVolume);
              }}
            >
              <div
                className={styles.volumeThumb}
                style={{
                  top: `${100 - volume}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Help Button */}
        <button
          ref={helpButtonRef}
          className={styles.button}
          onClick={() => setShowHelpModal(true)}
          title="Show keyboard shortcuts (? or Alt+F7)"
          aria-label="Show keyboard shortcuts"
        >
          <i className="fas fa-circle-question"></i>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className={styles.modalOverlay} onClick={() => setShowHelpModal(false)} role="presentation">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h3>Keyboard Shortcuts</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowHelpModal(false)}
                aria-label="Close help"
                type="button"
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.shortcutGroup}>
                <h4>Player Navigation</h4>
                <div className={styles.shortcutItem}>
                  <kbd>Alt+F7</kbd> <span>Focus player</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>Tab</kbd> <span>Enter player (focus first button)</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>←</kbd> <kbd>→</kbd> <span>Navigate between buttons</span>
                </div>
              </div>

              <div className={styles.shortcutGroup}>
                <h4>Playback Controls</h4>
                <div className={styles.shortcutItem}>
                  <kbd>Space</kbd> <span>Play / Pause</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>←</kbd> <span>Previous track (when focused)</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>→</kbd> <span>Next track (when focused)</span>
                </div>
              </div>

              <div className={styles.shortcutGroup}>
                <h4>Shuffle Modes</h4>
                <div className={styles.shortcutItem}>
                  <kbd>Space</kbd> <span>Open/close shuffle menu</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>↑</kbd> <kbd>↓</kbd> <span>Navigate modes</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>Enter</kbd> <span>Select mode</span>
                </div>
              </div>

              <div className={styles.shortcutGroup}>
                <h4>Volume Control</h4>
                <div className={styles.shortcutItem}>
                  <kbd>Space</kbd> <span>Mute / Unmute (when volume focused)</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>↑</kbd> <kbd>↓</kbd> <span>Adjust volume</span>
                </div>
              </div>

              <div className={styles.shortcutGroup}>
                <h4>General</h4>
                <div className={styles.shortcutItem}>
                  <kbd>?</kbd> <span>Show this help</span>
                </div>
                <div className={styles.shortcutItem}>
                  <kbd>Esc</kbd> <span>Close menus / Help</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
