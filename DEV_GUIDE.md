## Quick Notepad – Developer Guide

### Project Overview
Quick Notepad is a minimalist Chrome extension popup that keeps quick notes, formatting preferences, and color selections synced with `chrome.storage.local`. The popup is bundled as a single HTML page (`popup.html`) with modular JavaScript to keep concerns isolated for maintenance and future expansion.

### File Structure
```
quick-notepad/
├── manifest.json         # Chrome extension manifest (MV3)
├── background.js         # Service worker used to seed default state
├── popup.html            # Popup markup, toolbar, panels, and containers
├── popup.css             # Styling for themes, toolbar, panels, and radial menu
├── popup.js              # Main controller: state lifecycle, storage sync, UI wiring
├── modules/
│   ├── colorPicker.js    # HSL color controls and popup positioning logic
│   ├── downloadHelper.js # Wrapper around chrome.downloads plus fallback
│   ├── fontManager.js    # Font controls (size/family/style) synced to the textarea
│   └── radialMenu.js     # Legacy radial menu interactions (not wired into the current UI)
├── icons/                # Icon bundle (16/48/128)
└── assets/splash.png     # Placeholder product art for the Chrome Web Store
```

### State Model
The popup maintains a single `quickNotepadState` payload persisted through `chrome.storage.local`. It includes:

```json
{
  "note": "",
  "darkMode": false,
  "compactMode": false,
  "hyperlinks": false,
  "font": {
    "size": 16,
    "family": "Inter, sans-serif",
    "weight": "normal",
    "style": "normal"
  },
  "backgroundColor": {
    "h": 225,
    "s": 70,
    "l": 96,
    "hex": "#eff3ff"
  }
}
```

All UI changes funnel through `scheduleSave` in `popup.js`, which batches writes to reduce storage churn. The background service worker seeds this structure on installation so the popup can assume defaults exist.

### Modules in Detail
- **Font Manager (`modules/fontManager.js`)**  
  Keeps the textarea and hyperlink overlay in sync with chosen typography. Emits changes upstream so the popup can persist them.

- **Color Picker (`modules/colorPicker.js`)**  
  Manages the floating HSL picker triggered from the toolbar color button. Handles slider input, hex preview, anchor positioning, and emits live updates.

- **Download Helper (`modules/downloadHelper.js`)**  
  Wraps `chrome.downloads.download` with a fallback anchor-based download for environments where the API call fails (e.g., during development without permissions).

### Working with the Popup
- Toolbar buttons manage note copying, theme toggling, background color adjustments, font panel visibility, hyperlink linkification, emoji insertion, note downloads, and compact toolbar layout.
- Compact mode collapses button labels to emoji icons and is persisted separately from the dark-mode choice.
- The emoji grid is rendered at runtime. Update the `emojiList` array in `popup.js` to tweak options.
- Linkification is handled via an overlay element that mirrors the textarea. The overlay only activates when the Hyperlinks toggle is enabled to keep typing unimpeded.

### Extending the Extension
1. **Add New Toolbar Actions**  
   Create a button in `popup.html`, wire it in `popup.js`, and persist any new state in the shared storage payload. Reuse the `scheduleSave` helper.

2. **Additional Modules**  
   Store supporting logic under `modules/` to keep `popup.js` focused on orchestration. Export a default class or named functions for clarity.

3. **Sync or Cloud Support**  
   Replace the `chrome.storage.local` calls with `chrome.storage.sync` (or add a migration setting) if cross-device syncing becomes important.

4. **Keyboard Shortcuts and Commands**  
   Expand `manifest.json` with the `"commands"` section to add keyboard accelerators for copy/download/dark mode. The background service worker can relay commands to an open popup via `chrome.runtime.sendMessage`.

5. **Tests and Tooling**  
   For unit-level validation, consider adding Jest or Vitest with jsdom to exercise the modules in isolation. Keep test files outside the packed extension (e.g., under a sibling `tests/` directory).

### Packaging Tips
- Run `chrome://extensions`, enable *Developer mode*, use *Load unpacked*, and select the `quick-notepad/` directory to test locally.
- Before zipping, ensure no stray log or build artifacts remain. Chrome Web Store uploads typically expect the root folder content zipped (e.g., `zip -r quick-notepad.zip quick-notepad`).
- Update `assets/splash.png` with final marketing artwork before submitting to the store.
- Increment the `version` in `manifest.json` for each publish, following semantic versioning.

### Asset Attribution
- **Extension Icons (`icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`)**  
  Derived from `content-creator.png` by [Iconmas on Flaticon](https://www.flaticon.com/authors/iconmas). Licensed under Flaticon's Free License with attribution required.

### Future Ideas
- Optional word count panel, minimal Markdown support, or quick templates.
- Syncable presets for color schemes and font bundles.
- Cloud backup/export using Google Drive or other APIs (requires additional permissions and auth flows).

Feel free to iterate on the popup experience—its modular design is meant to keep future growth manageable.
