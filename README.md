# Hyperscribe Chrome Extension

Hyperscribe is a minimalist popup notepad for Chrome that keeps multiple notes, layout preferences, and theme selections persistent across sessions. It ships with a streamlined toolbar, emoji picker with search, spellcheck, speech-to-text dictation, image attachments, customizable templates, and a floating always-on-top window.

## Features
- **Multi-tab notes** — Create, switch, close, and duplicate note tabs with confirmation dialogs
- **12 terminal-inspired themes** — Default Bright/Dark, Monokai, Nord, Dracula, Solarized, Gruvbox, Tomorrow Night, One Dark, Zenburn + system auto-detect
- **Font controls** — 20+ fonts (monospace, sans-serif, serif) with lazy loading, size slider, bold/italic toggles, Ctrl+scroll zoom
- **Spellcheck** — US/GB English with custom dictionary, right-click suggestions, misspelled word highlights
- **Speech-to-text dictation** — Web Speech API with continuous mode, available in side panel + popup
- **Picture-in-Picture floating window** — Always-on-top notepad with bidirectional text sync
- **Emoji picker** — Searchable grid with keyboard navigation (arrow keys, Home, End, Enter, Escape)
- **Templates** — 7 built-in + custom templates with [DATE], [TIME], [DATETIME], [PROJECT_NAME] variables, import/export
- **Image attachments** — Paste (Ctrl+V), drag/drop, or file picker; stored in IndexedDB for space efficiency
- **Note search** — Ctrl+F find-in-note with match navigation
- **Export formats** — TXT, Markdown, HTML with template wrapping and metadata headers
- **Import notes** — Open .txt/.md/.html/.json files as new notes
- **Resizable popup** — Drag handle or double-click to reset (320×480 to 640×599)
- **Settings import/export** — Save and restore all preferences as JSON

## Install & Test Locally
1. Open `chrome://extensions` in Chrome
2. Toggle on **Developer mode** (top-right)
3. Click **Load unpacked** and select the `hyperscribe/` directory
4. Activate the extension from the toolbar

## Assets
- Icons (`icons/icon16.png`, `icon48.png`, `icon128.png`) derived from `content-creator.png` by [Iconmas on Flaticon](https://www.flaticon.com/authors/iconmas)

## Development
- Main popup logic in `popup.js` with helper modules in `modules/`
- Manifest V3 with ES module service worker (`background.js`)
- State persisted in `chrome.storage.local`, images in IndexedDB
- See `CLAUDE.md` for detailed architecture guide
