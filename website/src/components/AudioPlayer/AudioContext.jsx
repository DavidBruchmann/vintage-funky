import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState('off'); // 'off', 'all', 'album', 'artist'
  const [volume, setVolume] = useState(35);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('audioPlayerState');
    if (saved) {
      const state = JSON.parse(saved);
      setCurrentIndex(state.currentIndex || 0);
      setShuffleMode(state.shuffleMode || 'off');
      setVolume(state.volume || 35);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const state = {
      currentIndex,
      shuffleMode,
      volume,
    };
    localStorage.setItem('audioPlayerState', JSON.stringify(state));
  }, [currentIndex, shuffleMode, volume]);

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
      // Handle both dev (/mp3) and production (/vintage-funky/mp3) paths
      let src = song.url;
      if (!src.includes('/vintage-funky/') && src.startsWith('/mp3')) {
        src = '/vintage-funky' + src;
      }
      audioRef.current.src = src;
      audioRef.current.volume = volume / 100; // Reapply volume after src change
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay may be prevented by browser
        });
      }
    }
  }, [currentIndex, playlist]);

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

  const getRandomTrack = (currentIdx, filterByAlbum, filterByArtist) => {
    if (playlist.length === 0) return 0;
    
    let candidates = playlist.map((song, idx) => ({ song, idx }));
    
    if (filterByAlbum && playlist[currentIdx]) {
      const currentAlbum = playlist[currentIdx].album;
      candidates = candidates.filter(c => c.song.album === currentAlbum);
    }
    
    if (filterByArtist && playlist[currentIdx]) {
      const currentArtist = playlist[currentIdx].artist;
      candidates = candidates.filter(c => c.song.artist === currentArtist);
    }
    
    if (candidates.length === 0) return 0;
    return candidates[Math.floor(Math.random() * candidates.length)].idx;
  };

  const handleSongEnd = () => {
    if (shuffleMode === 'off') {
      handleNext();
    } else if (shuffleMode === 'all') {
      const randomIdx = getRandomTrack(currentIndex, false, false);
      setCurrentIndex(randomIdx);
    } else if (shuffleMode === 'album') {
      const randomIdx = getRandomTrack(currentIndex, true, false);
      setCurrentIndex(randomIdx);
    } else if (shuffleMode === 'artist') {
      const randomIdx = getRandomTrack(currentIndex, false, true);
      setCurrentIndex(randomIdx);
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

  const cycleShuffleMode = () => {
    const modes = ['off', 'all', 'album', 'artist'];
    setShuffleMode((prev) => {
      const currentIdx = modes.indexOf(prev);
      const nextIdx = (currentIdx + 1) % modes.length;
      const newMode = modes[nextIdx];
      
      // If enabling shuffle, pick random song
      if (newMode !== 'off' && playlist.length > 0) {
        const randomIdx = getRandomTrack(currentIndex, newMode === 'album', newMode === 'artist');
        setCurrentIndex(randomIdx);
      }
      return newMode;
    });
  };

  const setShuffleModeDirect = (mode) => {
    setShuffleMode(mode);
    // If enabling shuffle, pick random song
    if (mode !== 'off' && playlist.length > 0) {
      const randomIdx = getRandomTrack(currentIndex, mode === 'album', mode === 'artist');
      setCurrentIndex(randomIdx);
    }
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
    shuffleMode,
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
    cycleShuffleMode,
    setShuffleModeDirect,
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
