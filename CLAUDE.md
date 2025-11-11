# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hyperscribe** (formerly Quick Notepad) is a minimalist Chrome extension (Manifest V3) that provides a persistent popup notepad with theming, font controls, emoji insertion, templates, and tabbed notes. It targets rapid note-taking with terminal-inspired aesthetics and accessible UI patterns.

## Development Commands

### Testing the Extension Locally
```bash
# No build step required - load unpacked extension directly in Chrome
# 1. Navigate to chrome://extensions
# 2. Enable "Developer mode" (top-right toggle)
# 3. Click "Load unpacked" and select the hyperscribe/ directory
# 4. Click the extension icon in Chrome toolbar to test the popup
```

### File Operations
```bash
# View extension logs (requires Chrome DevTools)
# Right-click extension popup → Inspect → Console tab

# Check for errors in background service worker
# chrome://extensions → Hyperscribe → "service worker" link → Console

# Verify manifest syntax
cat manifest.json | jq .
```

## Architecture

### State Management
All extension state flows through `chrome.storage.local` with the key `quickNotepadState`. The state object includes:
- `note`: Current note text content
- `theme`: Active theme preset (e.g., "default_bright", "monokai", "nord", "dracula")
- `font`: Typography settings (size, family, weight, style)
- `windowSize`: Popup dimensions (width, height)
- `templates`: User-defined note templates
- `notes`: Array of tabbed notes with metadata
- `suppressClearConfirm`: User preference for confirmation dialogs

State mutations batch through `scheduleSave()` in popup.js to reduce storage churn. The background service worker (`background.js`) seeds default state on extension install and handles keyboard command routing.

### File Structure
```
hyperscribe/
├── manifest.json           # Chrome extension manifest (MV3)
├── background.js           # Service worker: state seeding, command routing
├── popup.html              # Main popup markup with toolbar and panels
├── popup.css               # Theme variables, toolbar, panels, terminal styling
├── popup.js                # Controller: state lifecycle, UI wiring, manager orchestration
├── modules/
│   ├── confirmationDialog.js   # Modal confirmation with "don't ask again"
│   ├── downloadHelper.js       # File export (chrome.downloads API + fallback)
│   ├── fontManager.js          # Font size/family/weight/style controls
│   ├── radialMenu.js           # Legacy radial menu (not currently wired)
│   └── templateManager.js      # Custom template creation and insertion
├── icons/                  # Extension icons (16/48/128)
└── assets/                 # Splash images and marketing art
```

**Note**: Many manager classes referenced in popup.js imports (StateManager, ThemeManager, PanelManager, ExportFormatter, NotesManager, SyncManager, etc.) are currently inlined in popup.js rather than existing as separate module files. When refactoring, extract these to `modules/` following the existing pattern.

### Key Components

**popup.js** (~2000+ lines)
- Central orchestrator for all UI interactions
- Defines inline manager classes: StateManager, ThemeManager, PanelManager, ExportFormatter, NotesManager, SyncManager, conflictOverlay utilities
- Manages toolbar events, panel toggling, emoji grid, resize handle, keyboard shortcuts
- Entry point: `init()` function hydrates state and binds events

**background.js**
- Service worker runs migration logic on install via `MigrationManager` (imported but may be inline)
- Listens for `chrome.commands` keyboard shortcuts and relays them to popup via `chrome.runtime.sendMessage`

**Modules** (modules/)
- `fontManager.js`: Syncs textarea typography with control panel state
- `downloadHelper.js`: Exports notes as `.txt` files (format: `hyprscr-DD-MM-YYYY.txt`)
- `confirmationDialog.js`: Reusable confirmation overlay with checkbox for "don't ask again"
- `templateManager.js`: CRUD operations for user templates
- `radialMenu.js`: Legacy component not currently active in UI

### Theme System
Themes are CSS-variable based presets defined in popup.css. Available themes:
- `default_bright`: Light terminal theme
- `default_dark`: Dark terminal theme
- `monokai`: Monokai-inspired palette
- `nord`: Nord color scheme
- `dracula`: Dracula color scheme

Theme switching updates `data-theme` attribute on the `#app` element and persists to storage. All theme variables follow the naming convention `--theme-{property}` (e.g., `--theme-bg`, `--theme-fg`, `--theme-accent`).

### Keyboard Shortcuts
Defined in manifest.json under `commands`:
- `Ctrl+Shift+C` (Mac: `Command+Shift+C`): Copy all note text
- `Ctrl+Shift+S` (Mac: `Command+Shift+S`): Download note as text file
- `Ctrl+Shift+X` (Mac: `Command+Shift+X`): Clear note text
- `Ctrl+Shift+T` (Mac: `Command+Shift+T`): Toggle theme panel

Commands are processed in background.js and forwarded to popup.js via `handleCommandMessage()`.

### Storage Patterns
- All writes go through `stateManager.save(partialState)` which merges with existing state
- Read operations use `stateManager.getState()` for cached access
- Storage usage displayed via `elements.storageUsage` in bytes/percentage
- Clear all data via `stateManager.clear()` which resets to defaults

### Accessibility
- ARIA live regions for screen reader announcements (polite and assertive)
- Keyboard navigation for emoji grid (arrow keys, Home, End, Enter, Escape)
- Focus management when panels open/close
- All toolbar buttons have `aria-label` attributes

## Common Development Tasks

### Adding a New Toolbar Action
1. Add button markup to `popup.html` in the `#toolbar` section
2. Wire event listener in `bindEvents()` within popup.js
3. Implement handler function following existing patterns (copyAll, clearNote, etc.)
4. If state needs persisting, update the default state structure and call `stateManager.save()`

### Creating a New Theme Preset
1. Add CSS variables block in `popup.css` under the appropriate `[data-theme="new-theme"]` selector
2. Add theme chip button in `popup.html` within `#themePanel`
3. Update ThemeManager in popup.js to recognize the new theme key
4. Test theme switching via the UI and verify persistence

### Extracting a Manager to modules/
When moving inline manager classes from popup.js to separate modules:
1. Create new file in `modules/` (e.g., `modules/stateManager.js`)
2. Extract class definition and export as default: `export default class StateManager { ... }`
3. Update import in popup.js: `import StateManager from './modules/stateManager.js';`
4. Ensure any shared constants are moved to a shared location (consider creating `shared/constants.js`)
5. Test that import resolution works in Chrome's module system (MV3 supports ES modules)

### Adding Keyboard Shortcuts
1. Add command definition to `manifest.json` under `commands` section
2. Update `handleCommandMessage()` switch statement in popup.js
3. Implement the command handler function
4. Test via background service worker relay mechanism

### Testing Without Browser Access
The repository is designed for manual verification in Chrome. When working in CLI-only environments:
- Validate manifest.json syntax with `jq` or online validators
- Check for JS syntax errors via linting (no linter currently configured)
- Review console logs in code comments for debugging guidance
- Defer interactive testing (theme switching, panel interactions, emoji insertion) until Chrome access is available

## Extension Permissions
- `storage`: For persisting note content and preferences via chrome.storage.local
- `downloads`: For exporting notes as `.txt` files via chrome.downloads.download

## Content Security Policy
Defined in manifest.json to allow:
- Scripts: `'self'` only (no inline scripts)
- Styles: `'self'`, `https://fonts.googleapis.com`, `https://microsoft.github.io` (VS Code Codicons)
- Fonts: `'self'`, `https://fonts.gstatic.com`, `https://microsoft.github.io`, `data:` URIs

## Naming Conventions
- File exports default to `hyprscr-DD-MM-YYYY.txt` format (chronological sorting)
- Module files use camelCase (e.g., `fontManager.js`, `downloadHelper.js`)
- Manager classes use PascalCase (e.g., `StateManager`, `ThemeManager`)
- CSS custom properties use kebab-case with `--theme-` prefix for theme variables

## Known Issues and Quirks
- Many manager classes are currently inlined in popup.js despite being imported at the top - these need extraction
- `radialMenu.js` exists in modules/ but is not wired into the current UI (legacy component)
- No automated test coverage - all verification is manual via Chrome popup
- Resize handle constraints enforce min/max bounds via constants in popup.js (320x360 to 640x599)
- Background service worker runs migration logic but MigrationManager may be inline or missing from modules/

## Future Considerations
- Extract inline manager classes to modules/ for better maintainability
- Add automated testing (Jest/Vitest with jsdom for module isolation)
- Consider `chrome.storage.sync` for cross-device note syncing
- Implement optional Markdown rendering or word count panel
- Add cloud backup integration (requires additional permissions and OAuth flows)

## Asset Attribution
Extension icons (`icons/icon16.png`, `icon48.png`, `icon128.png`) derived from `content-creator.png` by [Iconmas on Flaticon](https://www.flaticon.com/authors/iconmas) under Flaticon's Free License (attribution required).
