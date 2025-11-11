# Hyperscribe Developer Guide

This guide is for developers who want to contribute to the Hyperscribe project.

## Project Overview
Hyperscribe is a minimalist Chrome extension popup that keeps quick notes, formatting preferences, and theme selections synced with `chrome.storage.local`. The popup is bundled as a single HTML page (`popup.html`) with modular JavaScript to keep concerns isolated for maintenance and future expansion.

## State Model
The popup maintains a single state payload persisted through `chrome.storage.local`. It includes notes, theme settings, font preferences, and more. All UI changes funnel through the `StateManager`, which batches writes to reduce storage churn. The background service worker seeds this structure on installation so the popup can assume defaults exist.

## Modules in Detail
- **Font Manager (`modules/fontManager.js`)**  
  Keeps the textarea typography in sync with the chosen controls and emits changes upstream so the popup can persist them.

- **Download Helper (`modules/downloadHelper.js`)**  
  Wraps `chrome.downloads.download` with a fallback anchor-based download for environments where the API call fails.

- **ThemeManager (`modules/themeManager.js`)**
  Controls the application's visual theme.

- **StateManager (`modules/stateManager.js`)**
  Manages the application's state.

## Extending the Extension
1. **Add New Toolbar Actions**  
   Create a button in `popup.html`, wire it in `popup.js`, and persist any new state using the `StateManager`.

2. **Additional Modules**  
   Store supporting logic under `modules/` to keep `popup.js` focused on orchestration.

3. **Sync or Cloud Support**  
   The `SyncManager` module is the entry point for `chrome.storage.sync` functionality.

4. **Keyboard Shortcuts and Commands**  
   Expand `manifest.json` with the `"commands"` section to add keyboard accelerators. The background service worker can relay commands to an open popup via `chrome.runtime.sendMessage`.

## Packaging Tips
- Run `chrome://extensions`, enable *Developer mode*, use *Load unpacked*, and select the project directory to test locally.
- Before zipping, ensure no stray log or build artifacts remain.
- Increment the `version` in `manifest.json` for each publish.

## Asset Attribution
- **Extension Icons (`icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`)**  
  Derived from `content-creator.png` by [Iconmas on Flaticon](https://www.flaticon.com/authors/iconmas). Licensed under Flaticon's Free License with attribution required.
