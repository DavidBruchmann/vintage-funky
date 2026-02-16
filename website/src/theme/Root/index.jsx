import React from 'react';
import OriginalRoot from '@theme-original/Root';
import { AudioProvider } from '../../components/AudioPlayer/AudioContext';

export default function Root({ children }) {
  return (
    <OriginalRoot>
      <AudioProvider>
        {children}
      </AudioProvider>
    </OriginalRoot>
  );
}
