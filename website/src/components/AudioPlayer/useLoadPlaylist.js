import { useEffect } from 'react';
import { useAudio } from './AudioContext';

/**
 * Hook to load MP3 files from the static/mp3 folder using the manifest
 */
export function useLoadPlaylist() {
  const { setPlaylist } = useAudio();

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const response = await fetch('/playlist-manifest.json');
        
        if (response.ok) {
          const songs = await response.json();
          setPlaylist(songs);
        }
      } catch (error) {
        console.warn('Failed to load playlist manifest:', error);
      }
    };

    loadPlaylist();
  }, [setPlaylist]);
}
