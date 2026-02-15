import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [volume, setVolume] = useState(35);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('audioPlayerState');
    if (saved) {
      const state = JSON.parse(saved);
      setCurrentIndex(state.currentIndex || 0);
      setIsRandomMode(state.isRandomMode || false);
      setVolume(state.volume || 35);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const state = {
      currentIndex,
      isRandomMode,
      volume,
    };
    localStorage.setItem('audioPlayerState', JSON.stringify(state));
  }, [currentIndex, isRandomMode, volume]);

  // Create audio element once on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('ended', handleSongEnd);
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleSongEnd);
      }
    };
  }, []);

  // Update audio src when currentIndex or playlist changes
  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      const song = playlist[currentIndex];
      audioRef.current.src = song.url;
      audioRef.current.volume = volume / 100; // Reapply volume after src change
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay may be prevented by browser
        });
      }
    }
  }, [currentIndex, playlist, volume]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, playlist]);

  const handleSongEnd = () => {
    if (isRandomMode && playlist.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(randomIndex);
    } else {
      handleNext();
    }
  };

  const handlePlay = () => {
    if (playlist.length === 0) return;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const toggleRandomMode = () => {
    setIsRandomMode((prev) => {
      const newRandomMode = !prev;
      // If enabling random mode, pick a random song
      if (newRandomMode && playlist.length > 0) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        setCurrentIndex(randomIndex);
      }
      return newRandomMode;
    });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const value = {
    // State
    playlist,
    currentIndex,
    isPlaying,
    isRandomMode,
    volume,
    currentTime,
    duration,

    // Setters
    setPlaylist,
    setCurrentIndex,

    // Actions
    handlePlay,
    handlePause,
    togglePlayPause,
    handleNext,
    handlePrev,
    toggleRandomMode,
    setVolume,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
