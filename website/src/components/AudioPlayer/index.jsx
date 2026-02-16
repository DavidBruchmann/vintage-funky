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
  const [isDragging, setIsDragging] = useState(false);
  const [focusedButtonIndex, setFocusedButtonIndex] = useState(0);
  const [focusedShuffleOptionIndex, setFocusedShuffleOptionIndex] = useState(0);
  const volumeButtonRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const shuffleButtonRef = useRef(null);
  const shuffleMenuRef = useRef(null);
  const textContainerRef = useRef(null);
  
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
  const displayText = currentSong
    ? `${currentSong.album} – ${currentSong.filename}`
    : 'No songs loaded';

  // Handle Escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowShuffleMenu(false);
        setShowVolumeSlider(false);
      }
    };

    if (showShuffleMenu || showVolumeSlider) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showShuffleMenu, showVolumeSlider]);

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
      </div>
    </div>
  );
}
