# Hyperscribe Chrome Extension

Hyperscribe is a minimalist popup notepad for Chrome that keeps multiple notes, layout preferences, and theme selections persistent across sessions. It ships with a streamlined toolbar, spellcheck, speech-to-text dictation, image attachments with gallery, customizable templates, export with embedded images, and a side panel for a persistent workspace.

## Features
- **Multi-tab notes** — Create, switch, close, and duplicate note tabs with confirmation dialogs
- **19 themes** — Default Bright/Dark, Monokai, Nord, Dracula, Solarized Light/Dark, Gruvbox Light/Dark, Tomorrow Night, One Dark, Zenburn, Catppuccin Latte/Mocha, GitHub Light/Dark, Tokyo Night, Everforest Dark + system auto-detect + custom color picker (6 controls) + custom CSS
- **Font controls** — 20+ fonts (monospace, sans-serif, serif) with lazy loading, size slider, bold/italic toggles, Ctrl+scroll zoom
- **Spellcheck** — US/GB English with custom dictionary, right-click suggestions, misspelled word highlights
- **Speech-to-text dictation** — Web Speech API with continuous mode, cursor-aware insertion, available in side panel + popup
- **Image attachments** — Paste (Ctrl+V), drag/drop, or file picker; stored in IndexedDB with thumbnail gallery; exported inline in all formats
- **Note search** — Ctrl+F find-in-note with match navigation
- **Export formats** — TXT (with base64 image blocks), Markdown (data URI images), HTML (inline images), PDF (print dialog with images)
- **Templates** — 7 built-in + custom templates with [DATE], [TIME], [DATETIME], [PROJECT_NAME] variables, import/export
- **Import notes** — Open .txt/.md/.html/.json files as new notes
- **Resizable popup** — Drag handle or double-click to reset (320×480 to 640×599)
- **Settings import/export** — Save and restore all preferences as JSON
- **Side panel** — Persistent workspace in Chrome's sidebar, survives tab switches

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
- See `CHANGELOG.md` for release history
- See `docs/` for detailed module documentation
