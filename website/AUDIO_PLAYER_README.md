# Audio Player Implementation

## Overview

The audio player is a persistent React component that plays MP3 files from the `/static/mp3` directory. It maintains playback state across page navigation and persists user settings (volume, shuffle mode, current track) to localStorage.

## Architecture

### Components

- **AudioPlayer** (`src/components/AudioPlayer/index.jsx`) - Main UI component
  - Displays current track info (album – song name)
  - Provides play/pause, next, previous, shuffle, and volume controls
  - Renders a vertical volume slider on hover

- **AudioContext** (`src/components/AudioPlayer/AudioContext.jsx`) - React Context
  - Manages global audio state (playlist, current index, volume, shuffle mode)
  - Handles audio element lifecycle
  - Persists state to localStorage

- **useLoadPlaylist** (`src/components/AudioPlayer/useLoadPlaylist.js`) - Custom Hook
  - Loads playlist from `playlist-manifest.json` on app initialization
  - Called automatically by AudioPlayer component

### Integration

- **Root Theme Wrapper** (`src/theme/Root/index.jsx`)
  - Wraps the Docusaurus app with `AudioProvider`
  - Mounts AudioPlayer at the top level to ensure persistence across page navigation

### Build Process

- **Generate Playlist** (`scripts/generate-playlist-manifest.js`)
  - Scans `/website/static/mp3/` directory structure
  - Creates `/website/static/playlist-manifest.json` listing all songs
  - Runs automatically as a pre-step before `npm start` and `npm run build`

## File Structure

```
website/
├── src/
│   ├── components/AudioPlayer/
│   │   ├── index.jsx                 # Main UI component
│   │   ├── AudioPlayer.module.css    # Styling
│   │   ├── AudioContext.jsx          # Global state management
│   │   └── useLoadPlaylist.js        # Playlist loader hook
│   └── theme/
│       └── Root/
│           └── index.jsx              # Theme wrapper
├── scripts/
│   └── generate-playlist-manifest.js  # Manifest generator
├── static/
│   └── mp3/
│       └── [artist]/[album]/[song].mp3
└── package.json                       # Scripts: generate-playlist, prebuild, prestart
```

## Features

### Display
- Shows current album and song name (sanitized: underscores → spaces)
- Updates when track changes

### Controls
- **Previous/Next** - Navigate through all songs across all artists/albums
- **Play/Stop** - Toggle playback
- **Shuffle** - Randomize track selection (when enabled, next song is random)
- **Volume/Mute** - Click to toggle mute (0% ↔ 35%), drag slider to adjust

### Persistence
- Stores in localStorage:
  - Current song index
  - Shuffle mode state
  - Volume level (default 35%)
- Loads on app initialization
- Updates whenever any setting changes

### Behavior
- Does NOT autoplay on first load
- Pauses when audio ends (unless shuffle is on, then picks random next track)
- Cycles through playlist (prev at start goes to last, next at end goes to first)

## Styling

CSS modules (`AudioPlayer.module.css`) include:
- Horizontal layout with flex container
- Responsive design for mobile/tablet
- Volume slider positioning:
  - Absolute positioning, 120px height
  - Appears above volume button on hover
  - Gradient background showing fill level
  - Circular thumb draggable element

## Adding New Songs

1. Add MP3 file to `/website/static/mp3/[artist]/[album]/[song].mp3`
2. Run `npm run generate-playlist` (or automatic on next `npm start`/`npm run build`)
3. New songs will appear in the player automatically

## Troubleshooting

**No songs appear in player:**
- Check `playlist-manifest.json` exists in `/static/` directory
- Run `npm run generate-playlist` manually
- Verify MP3 files are in `/static/mp3/` with correct structure

**Volume slider not appearing:**
- Ensure CSS module is loaded correctly
- Check for z-index conflicts in parent elements
- Verify `overflow: hidden` on navbar isn't clipping the slider

**Player doesn't persist across page navigation:**
- Check that `AudioProvider` wraps the app in `src/theme/Root/index.jsx`
- Verify AudioPlayer is mounted at top level (not inside page-specific components)

## Performance Considerations

- Audio element is a singleton (created once, reused)
- Playlist loaded once on app initialization
- localStorage updates are debounced (only on state changes)
- CSS modules prevent style conflicts

## Browser Compatibility

- Requires modern browser with HTML5 Audio API support
- localStorage support required for persistence
- CSS Grid/Flexbox for layout

## Future Improvements

Potential enhancements:
- Playlist browser UI to select artist/album
- Seek bar to jump within current track
- Track duration display
- Keyboard shortcuts (spacebar for play, arrow keys for next/prev)
- Equalizer controls
- Playlist history
