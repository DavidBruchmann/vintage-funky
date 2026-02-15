# Copilot Instructions for vintage-funky

## Project Overview

This repository contains a Docusaurus-based documentation website. The main content is located in the `website/` directory.

## Build, Test, and Lint Commands

All commands should be run from the `website/` directory:

```bash
cd website

# Local development server (hot-reloads on changes)
npm start

# Build for production
npm run build

# Serve the built site locally (for testing production build)
npm run serve

# Clear Docusaurus cache
npm run clear
```

**No linting or testing suite is configured** - this is a documentation site.

## Architecture

### Repository Structure

- `website/` - Main Docusaurus site
  - `docs/` - Documentation content in Markdown (auto-generated sidebar from directory structure)
  - `blog/` - Blog posts in Markdown
  - `src/` - Custom React components and styling
    - `components/AudioPlayer/` - Audio player component with context and hooks
    - `components/HomepageFeatures/` - Homepage feature component
    - `theme/Root/` - Root wrapper that provides AudioProvider
    - `css/` - Global CSS styling
    - `pages/` - Custom React pages
  - `static/` - Static assets (images, audio files)
    - `mp3/` - Audio files organized by artist/album
    - `playlist-manifest.json` - Generated file listing all MP3s (auto-generated on build)
  - `scripts/` - Build scripts (generates playlist manifest)
  - `docusaurus.config.js` - Main Docusaurus configuration
  - `sidebars.js` - Sidebar navigation configuration

### Deployment

- GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages on pushes to `main` branch
- **Important**: The workflow uses `fetch-depth: 0` to fetch full Git history, which is required for Docusaurus "Last Updated" timestamps
- Deploy artifacts are published to the `gh-pages` branch

## Key Conventions

### Audio Player
- **Location**: Header bar, persists across all pages (blog, docs)
- **State Management**: Uses React Context (`AudioContext.jsx`) for global state
- **Playlist Loading**: `useLoadPlaylist` hook fetches from `playlist-manifest.json` on app load
- **Features**:
  - Display: Album name – Song name (sanitized with underscores replaced by spaces)
  - Controls: Previous, Play/Stop toggle, Next, Shuffle (randomize), Volume/Mute
  - Volume: Vertical slider appears on hover, ranges 0-100%, default 35%
  - Persistence: Stores current song index, shuffle state, and volume in localStorage
- **File Structure**: MP3 files at `/static/mp3/[artist]/[album]/[song].mp3`
- **Build Process**: `npm run generate-playlist` creates playlist manifest (runs automatically before build/start)

- Documentation uses **auto-generated sidebars** from the `docs/` directory structure
- Markdown files support MDX (can embed React components)
- Front matter follows Docusaurus conventions:
  ```markdown
  ---
  sidebar_position: 1
  ---
  # Title
  ```

### Content Structure

- `docs/intro.md` - Landing page for the docs section
- `docs/tutorial-basics/` - Introductory tutorial content
- `docs/tutorial-extras/` - Advanced topics (versioning, i18n, etc.)
- `blog/` - Blog posts with date-based filenames (e.g., `2019-05-28-first-blog-post.md`)

### Styling

- Uses CSS modules (`styles.module.css`) for component-scoped styling
- Global CSS is imported in the Docusaurus config via presets
- Uses Prism React Renderer for syntax highlighting

### Docusaurus Version

- Running Docusaurus 3.9.2 with `v4` future flags enabled for forward compatibility
- Uses the "classic" preset which includes docs, blog, and pages plugins

### Node Version

- CI/CD uses Node.js 20 (specified in GitHub Actions workflow)
- Ensure local development uses compatible Node versions (preferably 18+)

## Common Tasks

**Adding a new documentation page:**
1. Create a `.md` or `.mdx` file in `docs/` or a subdirectory
2. The sidebar will auto-generate based on file structure
3. Optionally add `sidebar_position` in frontmatter to control order

**Adding a blog post:**
1. Create a file in `blog/` with format: `YYYY-MM-DD-slug.md`
2. Optional: Create a folder with `index.md` inside for more complex posts with assets

**Testing changes locally:**
1. Run `npm start` to start dev server
2. Dev server watches for changes and hot-reloads
3. Run `npm run build && npm run serve` to test production build locally
