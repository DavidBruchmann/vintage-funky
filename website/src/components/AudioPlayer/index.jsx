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
    isRandomMode,
    volume,
    togglePlayPause,
    handleNext,
    handlePrev,
    toggleRandomMode,
    setVolume,
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const volumeButtonRef = useRef(null);
  const volumeSliderRef = useRef(null);

  // Get current song info
  const currentSong = playlist.length > 0 ? playlist[currentIndex] : null;
  const displayText = currentSong
    ? `${currentSong.album} – ${currentSong.filename}`
    : 'No songs loaded';

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

  return (
    <div className={styles.playerWrapper}>
      {/* Marquee text in fixed left area */}
      <div className={styles.textContainer}>
        <div className={styles.displayText}>{displayText}</div>
      </div>

      {/* Player controls on the right */}
      <div className={styles.audioPlayer}>
        {/* Previous Button */}
        <button
          className={styles.button}
          onClick={handlePrev}
          disabled={playlist.length === 0}
          title="Previous"
          aria-label="Previous track"
        >
          <i className="fas fa-step-backward"></i>
        </button>

        {/* Play/Stop Toggle */}
        <button
          className={styles.button}
          onClick={togglePlayPause}
          disabled={playlist.length === 0}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>

        {/* Next Button */}
        <button
          className={styles.button}
          onClick={handleNext}
          disabled={playlist.length === 0}
          title="Next"
          aria-label="Next track"
        >
          <i className="fas fa-step-forward"></i>
        </button>

        {/* Randomize Button */}
        <button
          className={`${styles.button} ${isRandomMode ? styles.active : ''}`}
          onClick={toggleRandomMode}
          disabled={playlist.length === 0}
          title={isRandomMode ? 'Disable shuffle' : 'Enable shuffle'}
          aria-label={isRandomMode ? 'Disable shuffle' : 'Enable shuffle'}
        >
          <i className="fas fa-shuffle"></i>
        </button>

        {/* Volume/Mute Button with Slider */}
        <div
          className={styles.volumeControl}
          ref={volumeButtonRef}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            className={`${styles.button} ${volume === 0 ? styles.muted : ''}`}
            title={volume === 0 ? 'Unmute' : 'Mute'}
            aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            onClick={() => setVolume(volume === 0 ? 35 : 0)}
          >
            <i className={`fas ${volume === 0 ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>

          {/* Volume Slider Popup - always in DOM */}
          <div
            ref={volumeSliderRef}
            className={`${styles.volumeSlider} ${showVolumeSlider ? styles.visible : ''}`}
            onMouseDown={handleVolumeMouseDown}
            onMouseUp={handleVolumeMouseUp}
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
