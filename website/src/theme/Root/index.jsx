import React from 'react';
import OriginalRoot from '@theme-original/Root';
import { AudioProvider } from '../../components/AudioPlayer/AudioContext';
import { AudioPlayer } from '../../components/AudioPlayer';

export default function Root({ children }) {
  return (
    <OriginalRoot>
      <AudioProvider>
        <AudioPlayer />
        {children}
      </AudioProvider>
    </OriginalRoot>
  );
}
