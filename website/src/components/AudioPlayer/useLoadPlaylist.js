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
        // Try to load from different possible paths
        const possiblePaths = [
          '/vintage-funky/playlist-manifest.json', // Production path
          '/playlist-manifest.json', // Dev path
        ];

        for (const path of possiblePaths) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              const songs = await response.json();
              setPlaylist(songs);
              return;
            }
          } catch (e) {
            // Continue to next path
          }
        }

        console.warn('Failed to load playlist manifest from any path');
      } catch (error) {
        console.warn('Failed to load playlist manifest:', error);
      }
    };

    loadPlaylist();
  }, [setPlaylist]);
}
