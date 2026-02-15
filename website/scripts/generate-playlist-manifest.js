#!/usr/bin/env node

/**
 * Script to generate a playlist manifest from the mp3 folder structure
 * Runs before Docusaurus build to create a JSON file listing all songs
 */

const fs = require('fs');
const path = require('path');

const MP3_DIR = path.join(__dirname, '../static/mp3');
const OUTPUT_FILE = path.join(__dirname, '../static/playlist-manifest.json');

function sanitizeText(text) {
  return text
    .replace(/_/g, ' ')
    .replace(/\.mp3$/i, '')
    .split('--')
    .map(part => part.trim())
    .join(' – ');
}

function getAllMp3Files() {
  const songs = [];

  try {
    // Read artists directory
    const artists = fs.readdirSync(MP3_DIR);

    for (const artist of artists) {
      const artistPath = path.join(MP3_DIR, artist);
      const stat = fs.statSync(artistPath);

      if (!stat.isDirectory()) continue;

      // Read albums directory
      const albums = fs.readdirSync(artistPath);

      for (const album of albums) {
        const albumPath = path.join(artistPath, album);
        const albumStat = fs.statSync(albumPath);

        if (!albumStat.isDirectory()) continue;

        // Read mp3 files
        const files = fs.readdirSync(albumPath);

        for (const file of files) {
          if (file.toLowerCase().endsWith('.mp3')) {
            const filePath = path.join(albumPath, file);
            const relativePath = path.relative(
              path.join(__dirname, '../static'),
              filePath
            );

            songs.push({
              url: '/' + relativePath.replace(/\\/g, '/'),
              artist: sanitizeText(artist),
              album: sanitizeText(album),
              filename: sanitizeText(file),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading mp3 directory:', error.message);
    return [];
  }

  return songs;
}

function main() {
  try {
    const songs = getAllMp3Files();

    if (songs.length === 0) {
      console.warn('No MP3 files found in', MP3_DIR);
    }

    // Sort songs for consistent ordering
    songs.sort((a, b) => a.url.localeCompare(b.url));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2));

    console.log(`Generated playlist manifest with ${songs.length} songs`);
    console.log(`Output: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Failed to generate playlist manifest:', error);
    process.exit(1);
  }
}

main();
