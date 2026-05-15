# Changelog

All notable changes to Hyperscribe are documented here.

---

## [1.3.0] — 2026-05-15

### Added
- **Modular architecture** — Codebase refactored into dedicated ES modules:
  `StorageRepository`, `ImageStorage`, `ImageManager`, `DictationManager`,
  `FontLoader`, `NoteTabManager`, `EventBus`
- **Custom theme builder** — Graphical color picker (6 color controls:
  Background, Panels, Text, Accent, Border, Note Background) plus an
  advanced CSS editor for power users
- **6 new themes** — Catppuccin Latte, Catppuccin Mocha, GitHub Light,
  GitHub Dark, Tokyo Night, Everforest Dark
- **13 new fonts** — Cascadia Code, Victor Mono, Iosevka, DM Mono,
  Work Sans, DM Sans, Plus Jakarta Sans, Manrope, Figtree,
  Libre Baskerville, Crimson Pro, EB Garamond
- **Image support in exports** — All four formats (TXT, Markdown, HTML,
  PDF) now embed attached images automatically
- **PDF export** — Print-to-PDF via Blob URL with embedded images
- **Template export dialog** — Bulk export/import templates as JSON

### Fixed
- **Dictation overriding typed text** — Speech no longer overwrites text
  typed between dictation segments. Tracks cursor position and detects
  manual edits to insert new results at the right location.
- **Pasted images now visible** — Inserting an image via Ctrl+V places
  a `[Image]` placeholder in the textarea at the cursor position (images
  were previously stored silently with no visible feedback).
- **Panel overflow / window clipping** — Theme, Font, and Template panels
  are capped at 50vh with internal scrolling; the app container scrolls
  when content overflows the popup boundary.
- **Side panel textarea sizing** — Short textarea fixed: removed fixed
  `windowSize` constraint, set proper flex shrink, dropped size
  containment so the editor fills available vertical space.
- **Side panel horizontal scaling** — Content now adapts to sidebar
  width changes instead of showing negative space or requiring
  horizontal scroll.
- **Word repetition in dictation** — Added `_committedResults` Set to
  filter duplicate final results from the speech API.
- **Auto-restart result skipping** — `_committedResults` is now cleared
  on recognition restart so fresh results aren't filtered out.

### Changed
- **Save-on-close** — `StateManager.saveImmediate()` is now `async`,
  guaranteeing state is persisted before window creation or close.
- **Always-on-top button** — Archived (hidden via CSS, code preserved).
  Use the Side Panel as the recommended detached workspace.

### Removed
- `modules/radialMenu.js` — Unimplemented feature, removed.
- Emoji picker — Archived (hidden, code preserved for future use).

---

## [1.2.0] — 2025-12-05

### Added
- Real-time spellcheck with red underline indicators
- US and GB English dictionary support
- Right-click suggestions for misspelled words
- Web Worker-based processing for smooth performance
- Export custom templates to share or backup
- Import templates from exported files
- Template management improvements
- Pop out notepad into a separate resizable window
- Additional font families and weight controls
- Feedback button for easy bug reporting
- Visual polish and consistency fixes

### Fixed
- Better panel transitions
- Improved font size range

---

## [1.1.0] — 2025-11-20

### Added
- Multi-tab notes with create, switch, close, duplicate
- Speech-to-text dictation via Web Speech API
- Image attachments with IndexedDB storage
- Note search (Ctrl+F)
- Import notes from .txt/.md/.html/.json
- Resizable popup with drag handle
- Settings import/export as JSON
- 12 terminal-inspired themes
- Font controls with lazy loading
- 7 built-in templates with date/time/project variables
- Export formats: TXT, Markdown, HTML
