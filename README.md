# Quick Notepad Chrome Extension

Quick Notepad is a minimalist popup notepad for Chrome that keeps a single note—plus your layout and styling preferences—persistent across sessions using `chrome.storage.local`. It ships with a streamlined toolbar, emoji picker, a preset theme selector, and a quick-close control when you need to tuck it away.

## Features
- **Persistent note** stored in `chrome.storage.local`, synced with background defaults.
- **Toolbar actions** for copy/clear, the compact theme button with preset panel (Default Bright, Default Dark, Monokai, Nord, Dracula), font tuning (size, family, bold, italic), emoji picker, and download-as-txt.
- **Emoji grid** that inserts characters at the cursor position.
- **Quick close dot** so you can dismiss the popup manually after copying from the main page.
- **Resizable popup** thanks to the yellow drag handle in the bottom-right corner; Chrome respects `window.resizeTo` within MV3 bounds.

## Install & Test Locally
1. Open `chrome://extensions` in Chrome.
2. Toggle on **Developer mode** (top-right).
3. Click **Load unpacked** and select the `quick-notepad/` directory from this repository.
4. Activate the extension from the toolbar and exercise the compact toolbar buttons, theme panel, resize handle, emoji picker, and download feature to ensure everything works as expected.

> ℹ️ This project does not currently include automated test coverage. Manual verification via the popup is recommended after each change.

## Assets
- Icons (`icons/icon16.png`, `icon48.png`, `icon128.png`) are currently resized derivatives of `content-creator.png` by [Iconmas on Flaticon](https://www.flaticon.com/authors/iconmas). Replace these with branded artwork before publishing to the Chrome Web Store, and keep attribution details up to date in `DEV_GUIDE.md`.
- `assets/splash.png` is a placeholder for the Chrome Web Store listing and should be swapped for final marketing art.

## Development Notes
- Main popup logic lives in `popup.js` and is broken down via helper modules in `modules/`.
- The extension relies on Manifest V3 with a service worker (`background.js`) that seeds default storage state on install.
- All state mutations pass through `scheduleSave`, which batches writes to reduce storage overhead.

To modify or extend functionality, see the detailed guidance in `DEV_GUIDE.md`.
