# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hyperscribe** is a minimalist Chrome extension (Manifest V3) that provides a persistent popup notepad with theming, font controls, emoji insertion, templates, tabbed notes, spellcheck, dictation, image attachments, and a floating Picture-in-Picture window. It targets rapid note-taking with terminal-inspired aesthetics and accessible UI patterns.

## Development Commands

### Testing the Extension Locally
```bash
# No build step required - load unpacked extension directly in Chrome
# 1. Navigate to chrome://extensions
# 2. Enable "Developer mode" (top-right toggle)
# 3. Click "Load unpacked" and select the hyperscribe/ directory
# 4. Click the extension icon in Chrome toolbar to test the popup
```

## Architecture

### State Management
All extension state flows through `chrome.storage.local` with the key `hyperscribe-data`. The state object includes:
- `version`: Schema version for migration support
- `note`: Current note text content (legacy, for backward compat)
- `notes`: Array of tabbed notes with metadata (id, title, content, created, modified, tags, pinned, archived, imageIds)
- `activeNoteId`: Currently active note tab ID
- `theme`: Active theme preset (e.g., "default_bright", "monokai", "system")
- `font`: Typography settings (size, family, isBold, isItalic)
- `windowSize`: Popup dimensions (width, height)
- `spellcheckEnabled` / `spellcheckLang`: Spellcheck preferences
- `suppressClearConfirm` / `suppressTabCloseConfirm`: "don't ask again" preferences

### File Structure
```
hyperscribe/
├── manifest.json              # MV3 manifest with commands, permissions, CSP
├── background.js              # Service worker: migrations + command routing
├── popup.html / sidepanel.html # Two variants of the UI
├── popup.css                  # ~3000 lines: themes, toolbar, panels, scrollbars
├── popup.js                   # ~3000 lines: main controller
├── spell-worker.js            # Web Worker spellcheck (available, not wired)
├── shared/constants.js        # Storage key, resize bounds
├── modules/                   # 20 ES modules (see below)
├── lib/typo.js                # Typo.js spellcheck library
├── dictionaries/              # en_US + en_GB aff/dic files
├── icons/                     # 16/48/128 PNGs + SVG moon/sun
└── archive/                   # Legacy code
```

### Themes (12 presets + system auto-detect)
default_bright, default_dark, monokai, nord, dracula, solarized-light, solarized-dark, gruvbox-light, gruvbox-dark, tomorrow-night, one-dark, zenburn, system

### Keyboard Shortcuts
- Ctrl+Shift+C: Copy all note text
- Ctrl+Shift+S: Download note as text file
- Ctrl+Shift+X: Clear note text
- Ctrl+Shift+T: Toggle theme panel
- Ctrl+F: Open find/search bar
- Ctrl+/: Reserved for shortcuts dialog (planned)

All commands relayed through background.js → popup.js

### Storage
- State: chrome.storage.local with debounced writes (500ms), immediate save on unload
- Images: IndexedDB via ImageStorage with note-based queries
- Quota monitoring with warning (80%) and critical (90%) thresholds
- Clear storage resets both chrome.storage and IndexedDB

### Accessibility
- ARIA live regions (polite + assertive)
- Keyboard-nav emoji grid with search filter
- Focus management for panels/dialogs/menus
- Confirmation dialog with focus trap

## Known Issues
- ImageManager module exists but popup.js uses inline implementation
- spell-worker.js Web Worker available but not wired
- EventBus available but not yet wired
- popup.html and sidepanel.html ~95% duplicated
- No automated test coverage
