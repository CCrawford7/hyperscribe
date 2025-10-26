# Hyperscribe Enhancement Implementation Guide

## Table of Contents
1. [Tier 1: Quick Wins](#tier-1-quick-wins)
2. [Tier 2: Power Features](#tier-2-power-features)
3. [Testing Strategies](#testing-strategies)
4. [Performance Considerations](#performance-considerations)

---

## Tier 1: Quick Wins (1-2 weeks)

### 1. Markdown Preview Toggle

**Implementation Time:** 2-3 days

#### Step 1: Add Dependencies
Add the `marked.js` library for markdown parsing. In your `popup.html`, add:

```html
<!-- Add before your existing scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/DOMPurify/3.0.6/purify.min.js"></script>
```

Or download and bundle locally for offline support.

#### Step 2: Update HTML Structure
Modify your popup layout to support split view:

```html
<!-- In popup.html, update the editor section -->
<div id="editorContainer" class="editor-container">
  <textarea id="noteArea" class="note-area" 
            placeholder="Start typing..."
            aria-label="Note content"></textarea>
  
  <div id="previewPane" class="preview-pane hidden" 
       aria-label="Markdown preview"></div>
</div>
```

#### Step 3: Add CSS for Split View
Create `modules/markdownPreview.css`:

```css
.editor-container {
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
}

.editor-container.split-view .note-area {
  width: 50%;
  border-right: 1px solid var(--border-color);
}

.editor-container.split-view .preview-pane {
  width: 50%;
  display: block;
}

.preview-pane {
  padding: 16px;
  overflow-y: auto;
  background: var(--bg-secondary);
  font-family: var(--font-family);
}

.preview-pane.hidden {
  display: none;
}

/* Markdown styling */
.preview-pane h1 { font-size: 2em; margin: 0.67em 0; }
.preview-pane h2 { font-size: 1.5em; margin: 0.75em 0; }
.preview-pane h3 { font-size: 1.17em; margin: 0.83em 0; }
.preview-pane code {
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
.preview-pane pre {
  background: var(--code-bg);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}
.preview-pane a {
  color: var(--link-color);
  text-decoration: underline;
  cursor: pointer;
}
.preview-pane a:hover {
  color: var(--link-hover-color);
}
.preview-pane blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: 16px;
  margin: 16px 0;
  font-style: italic;
}
```

#### Step 4: Create Markdown Preview Module
Create `modules/markdownPreview.js`:

```javascript
/**
 * Markdown Preview Manager
 * Handles markdown rendering and live hyperlink detection
 */

export class MarkdownPreview {
  constructor(textareaEl, previewEl, containerEl) {
    this.textarea = textareaEl;
    this.preview = previewEl;
    this.container = containerEl;
    this.isPreviewMode = false;
    this.updateTimeout = null;
    
    // Configure marked options
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true, // GitHub Flavored Markdown
        headerIds: true,
        mangle: false
      });
    }
  }

  /**
   * Toggle between edit-only, preview-only, and split view
   * @param {string} mode - 'edit', 'preview', or 'split'
   */
  setMode(mode) {
    this.container.classList.remove('split-view', 'preview-only', 'edit-only');
    this.preview.classList.add('hidden');
    
    switch(mode) {
      case 'split':
        this.container.classList.add('split-view');
        this.preview.classList.remove('hidden');
        this.isPreviewMode = true;
        this.updatePreview();
        break;
      case 'preview':
        this.container.classList.add('preview-only');
        this.preview.classList.remove('hidden');
        this.textarea.style.display = 'none';
        this.isPreviewMode = true;
        this.updatePreview();
        break;
      case 'edit':
      default:
        this.container.classList.add('edit-only');
        this.textarea.style.display = 'block';
        this.isPreviewMode = false;
        break;
    }
  }

  /**
   * Update preview with debouncing
   */
  scheduleUpdate() {
    if (!this.isPreviewMode) return;
    
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.updatePreview();
    }, 300);
  }

  /**
   * Render markdown to HTML
   */
  updatePreview() {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
      this.preview.textContent = 'Markdown libraries not loaded';
      return;
    }

    const rawMarkdown = this.textarea.value;
    const rawHtml = marked.parse(rawMarkdown);
    
    // Sanitize to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 
                     'li', 'blockquote', 'code', 'pre', 'strong', 'em', 'hr', 
                     'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'title', 'target', 'class']
    });
    
    this.preview.innerHTML = cleanHtml;
    
    // Make links clickable and open in new tabs
    this.makeLinksClickable();
  }

  /**
   * Make hyperlinks functional
   */
  makeLinksClickable() {
    const links = this.preview.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('href');
        
        // Validate URL before opening
        if (this.isValidUrl(url)) {
          chrome.tabs.create({ url: url });
        }
      });
      
      // Add visual indicator
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /**
   * Validate URL format
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  /**
   * Auto-detect and linkify URLs in plain text
   */
  autoLinkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => `[${url}](${url})`);
  }
}
```

#### Step 5: Integrate into popup.js
In your `popup.js`:

```javascript
import { MarkdownPreview } from './modules/markdownPreview.js';

// Initialize after DOM loads
const mdPreview = new MarkdownPreview(
  document.getElementById('noteArea'),
  document.getElementById('previewPane'),
  document.getElementById('editorContainer')
);

// Add toolbar button
const previewBtn = document.createElement('button');
previewBtn.className = 'toolbar-btn';
previewBtn.innerHTML = '<i class="codicon codicon-preview"></i>';
previewBtn.title = 'Toggle Preview (Ctrl+P)';
previewBtn.setAttribute('aria-label', 'Toggle markdown preview');

let previewMode = 'edit'; // 'edit', 'split', 'preview'

previewBtn.addEventListener('click', () => {
  // Cycle through modes
  if (previewMode === 'edit') {
    previewMode = 'split';
  } else if (previewMode === 'split') {
    previewMode = 'preview';
  } else {
    previewMode = 'edit';
  }
  
  mdPreview.setMode(previewMode);
});

// Update preview on text change
noteArea.addEventListener('input', () => {
  mdPreview.scheduleUpdate();
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    previewBtn.click();
  }
});
```

---

### 2. Syntax Highlighting for Code Blocks

**Implementation Time:** 1-2 days

#### Step 1: Add Highlight.js
In `popup.html`:

```html
<!-- Add highlight.js -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<!-- Add popular languages -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/css.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/html.min.js"></script>
```

#### Step 2: Enhance Markdown Preview Module
Update `markdownPreview.js`:

```javascript
// Add to updatePreview() method after setting innerHTML
updatePreview() {
  // ... existing code ...
  
  this.preview.innerHTML = cleanHtml;
  
  // Apply syntax highlighting
  this.highlightCode();
  
  // Make links clickable
  this.makeLinksClickable();
}

/**
 * Apply syntax highlighting to code blocks
 */
highlightCode() {
  if (typeof hljs === 'undefined') return;
  
  const codeBlocks = this.preview.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    // Auto-detect language or use specified language
    hljs.highlightElement(block);
    
    // Add copy button
    this.addCopyButton(block);
  });
}

/**
 * Add copy button to code blocks
 */
addCopyButton(codeBlock) {
  const pre = codeBlock.parentElement;
  
  // Avoid duplicate buttons
  if (pre.querySelector('.copy-code-btn')) return;
  
  const btn = document.createElement('button');
  btn.className = 'copy-code-btn';
  btn.innerHTML = '<i class="codicon codicon-copy"></i>';
  btn.title = 'Copy code';
  btn.setAttribute('aria-label', 'Copy code to clipboard');
  
  btn.addEventListener('click', async () => {
    const code = codeBlock.textContent;
    try {
      await navigator.clipboard.writeText(code);
      btn.innerHTML = '<i class="codicon codicon-check"></i>';
      btn.classList.add('copied');
      
      setTimeout(() => {
        btn.innerHTML = '<i class="codicon codicon-copy"></i>';
        btn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  });
  
  pre.style.position = 'relative';
  pre.appendChild(btn);
}
```

#### Step 3: Style Code Copy Button
Add to `markdownPreview.css`:

```css
.preview-pane pre {
  position: relative;
}

.copy-code-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-color);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  font-size: 14px;
}

.preview-pane pre:hover .copy-code-btn {
  opacity: 1;
}

.copy-code-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.copy-code-btn.copied {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}
```

---

### 3. Search & Replace

**Implementation Time:** 2-3 days

#### Step 1: Create Search UI
Add to `popup.html`:

```html
<div id="searchBar" class="search-bar hidden">
  <div class="search-controls">
    <input type="text" id="searchInput" placeholder="Find..." 
           aria-label="Search text">
    <button id="searchPrev" class="search-btn" title="Previous (Shift+Enter)">
      <i class="codicon codicon-arrow-up"></i>
    </button>
    <button id="searchNext" class="search-btn" title="Next (Enter)">
      <i class="codicon codicon-arrow-down"></i>
    </button>
    <span id="searchCount" class="search-count">0 / 0</span>
    <button id="searchClose" class="search-btn" title="Close (Esc)">
      <i class="codicon codicon-close"></i>
    </button>
  </div>
  
  <div class="replace-controls hidden">
    <input type="text" id="replaceInput" placeholder="Replace with..." 
           aria-label="Replace text">
    <button id="replaceBtn" class="search-btn">Replace</button>
    <button id="replaceAllBtn" class="search-btn">Replace All</button>
  </div>
  
  <div class="search-options">
    <label>
      <input type="checkbox" id="caseSensitive">
      <span>Case sensitive (Alt+C)</span>
    </label>
    <label>
      <input type="checkbox" id="wholeWord">
      <span>Whole word (Alt+W)</span>
    </label>
    <label>
      <input type="checkbox" id="useRegex">
      <span>Regex (Alt+R)</span>
    </label>
    <button id="toggleReplace" class="toggle-replace-btn">
      <i class="codicon codicon-replace"></i> Show Replace
    </button>
  </div>
</div>
```

#### Step 2: Create Search Module
Create `modules/searchReplace.js`:

```javascript
/**
 * Search & Replace Manager
 * Handles find, replace, and navigation through matches
 */

export class SearchReplace {
  constructor(textareaEl, searchBarEl) {
    this.textarea = textareaEl;
    this.searchBar = searchBarEl;
    this.matches = [];
    this.currentMatchIndex = -1;
    
    // Get UI elements
    this.searchInput = searchBarEl.querySelector('#searchInput');
    this.replaceInput = searchBarEl.querySelector('#replaceInput');
    this.searchCount = searchBarEl.querySelector('#searchCount');
    this.caseSensitive = searchBarEl.querySelector('#caseSensitive');
    this.wholeWord = searchBarEl.querySelector('#wholeWord');
    this.useRegex = searchBarEl.querySelector('#useRegex');
    this.replaceControls = searchBarEl.querySelector('.replace-controls');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', () => this.performSearch());
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.shiftKey ? this.findPrevious() : this.findNext();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    // Navigation buttons
    this.searchBar.querySelector('#searchPrev')
      .addEventListener('click', () => this.findPrevious());
    this.searchBar.querySelector('#searchNext')
      .addEventListener('click', () => this.findNext());
    this.searchBar.querySelector('#searchClose')
      .addEventListener('click', () => this.close());

    // Replace buttons
    this.searchBar.querySelector('#replaceBtn')
      .addEventListener('click', () => this.replaceOne());
    this.searchBar.querySelector('#replaceAllBtn')
      .addEventListener('click', () => this.replaceAll());

    // Toggle replace
    this.searchBar.querySelector('#toggleReplace')
      .addEventListener('click', () => this.toggleReplace());

    // Options
    this.caseSensitive.addEventListener('change', () => this.performSearch());
    this.wholeWord.addEventListener('change', () => this.performSearch());
    this.useRegex.addEventListener('change', () => this.performSearch());
  }

  /**
   * Open search bar
   */
  open(withReplace = false) {
    this.searchBar.classList.remove('hidden');
    if (withReplace) {
      this.replaceControls.classList.remove('hidden');
    }
    this.searchInput.focus();
    
    // Pre-fill with selection if exists
    const selection = this.getSelectedText();
    if (selection) {
      this.searchInput.value = selection;
      this.performSearch();
    }
  }

  /**
   * Close search bar
   */
  close() {
    this.searchBar.classList.add('hidden');
    this.replaceControls.classList.add('hidden');
    this.clearHighlights();
    this.textarea.focus();
  }

  /**
   * Toggle replace controls
   */
  toggleReplace() {
    this.replaceControls.classList.toggle('hidden');
    if (!this.replaceControls.classList.contains('hidden')) {
      this.replaceInput.focus();
    }
  }

  /**
   * Perform search and update matches
   */
  performSearch() {
    const query = this.searchInput.value;
    if (!query) {
      this.clearHighlights();
      this.updateCount(0, 0);
      return;
    }

    const text = this.textarea.value;
    this.matches = [];
    
    try {
      let regex;
      if (this.useRegex.checked) {
        const flags = this.caseSensitive.checked ? 'g' : 'gi';
        regex = new RegExp(query, flags);
      } else {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let pattern = this.wholeWord.checked ? `\\b${escaped}\\b` : escaped;
        const flags = this.caseSensitive.checked ? 'g' : 'gi';
        regex = new RegExp(pattern, flags);
      }

      let match;
      while ((match = regex.exec(text)) !== null) {
        this.matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }

      if (this.matches.length > 0) {
        this.currentMatchIndex = 0;
        this.highlightMatch(this.currentMatchIndex);
      } else {
        this.currentMatchIndex = -1;
      }

      this.updateCount(this.currentMatchIndex + 1, this.matches.length);
    } catch (err) {
      // Invalid regex
      this.updateCount(0, 0);
      console.error('Search error:', err);
    }
  }

  /**
   * Navigate to next match
   */
  findNext() {
    if (this.matches.length === 0) return;
    
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
    this.highlightMatch(this.currentMatchIndex);
    this.updateCount(this.currentMatchIndex + 1, this.matches.length);
  }

  /**
   * Navigate to previous match
   */
  findPrevious() {
    if (this.matches.length === 0) return;
    
    this.currentMatchIndex = this.currentMatchIndex - 1;
    if (this.currentMatchIndex < 0) {
      this.currentMatchIndex = this.matches.length - 1;
    }
    this.highlightMatch(this.currentMatchIndex);
    this.updateCount(this.currentMatchIndex + 1, this.matches.length);
  }

  /**
   * Highlight current match
   */
  highlightMatch(index) {
    if (index < 0 || index >= this.matches.length) return;
    
    const match = this.matches[index];
    this.textarea.focus();
    this.textarea.setSelectionRange(match.start, match.end);
    
    // Scroll to selection
    const lineHeight = parseInt(window.getComputedStyle(this.textarea).lineHeight);
    const textBeforeMatch = this.textarea.value.substring(0, match.start);
    const lineNumber = (textBeforeMatch.match(/\n/g) || []).length;
    this.textarea.scrollTop = lineNumber * lineHeight - this.textarea.clientHeight / 2;
  }

  /**
   * Replace current match
   */
  replaceOne() {
    if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) {
      return;
    }

    const match = this.matches[this.currentMatchIndex];
    const replaceText = this.replaceInput.value;
    const text = this.textarea.value;

    // Replace text
    const newText = text.substring(0, match.start) + 
                    replaceText + 
                    text.substring(match.end);
    this.textarea.value = newText;

    // Trigger input event for autosave
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Re-search to update matches
    this.performSearch();
  }

  /**
   * Replace all matches
   */
  replaceAll() {
    if (this.matches.length === 0) return;

    const replaceText = this.replaceInput.value;
    let text = this.textarea.value;
    let offset = 0;

    this.matches.forEach(match => {
      const adjustedStart = match.start + offset;
      const adjustedEnd = match.end + offset;
      
      text = text.substring(0, adjustedStart) + 
             replaceText + 
             text.substring(adjustedEnd);
      
      offset += replaceText.length - (match.end - match.start);
    });

    this.textarea.value = text;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Clear and re-search
    this.performSearch();
  }

  /**
   * Update count display
   */
  updateCount(current, total) {
    this.searchCount.textContent = `${current} / ${total}`;
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    this.matches = [];
    this.currentMatchIndex = -1;
  }

  /**
   * Get currently selected text
   */
  getSelectedText() {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    return this.textarea.value.substring(start, end);
  }
}
```

#### Step 3: Style Search Bar
Create `modules/searchBar.css`:

```css
.search-bar {
  position: absolute;
  top: 48px; /* Below toolbar */
  right: 16px;
  width: 400px;
  max-width: calc(100% - 32px);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-bar.hidden {
  display: none;
}

.search-controls,
.replace-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.search-bar input[type="text"] {
  flex: 1;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  font-family: var(--font-family);
  font-size: 13px;
}

.search-bar input[type="text"]:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: -1px;
}

.search-btn {
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: var(--hover-color);
}

.search-count {
  padding: 0 8px;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.search-options {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
}

.search-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}

.search-options input[type="checkbox"] {
  cursor: pointer;
}

.toggle-replace-btn {
  margin-left: auto;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-replace-btn:hover {
  background: var(--hover-color);
}
```

#### Step 4: Integrate Search into popup.js

```javascript
import { SearchReplace } from './modules/searchReplace.js';

// Initialize search
const searchReplace = new SearchReplace(
  document.getElementById('noteArea'),
  document.getElementById('searchBar')
);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+F: Open find
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault();
    searchReplace.open(false);
  }
  
  // Ctrl+H: Open find & replace
  if (e.ctrlKey && e.key === 'h') {
    e.preventDefault();
    searchReplace.open(true);
  }
  
  // Esc: Close search
  if (e.key === 'Escape') {
    searchReplace.close();
  }
});

// Add toolbar button
const searchBtn = document.createElement('button');
searchBtn.className = 'toolbar-btn';
searchBtn.innerHTML = '<i class="codicon codicon-search"></i>';
searchBtn.title = 'Search (Ctrl+F)';
searchBtn.addEventListener('click', () => searchReplace.open(false));
```

---

### 4. Keyboard Shortcuts

**Implementation Time:** 1 day

#### Step 1: Create Shortcuts Module
Create `modules/keyboardShortcuts.js`:

```javascript
/**
 * Keyboard Shortcuts Manager
 * Centralized keyboard shortcut handling
 */

export class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.initialize();
  }

  /**
   * Register a keyboard shortcut
   * @param {string} key - Key combination (e.g., 'ctrl+s', 'ctrl+shift+f')
   * @param {Function} handler - Function to execute
   * @param {string} description - Human-readable description
   */
  register(key, handler, description) {
    this.shortcuts.set(key.toLowerCase(), {
      handler,
      description
    });
  }

  /**
   * Initialize global keyboard listener
   */
  initialize() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e);
      const shortcut = this.shortcuts.get(key);
      
      if (shortcut) {
        e.preventDefault();
        shortcut.handler(e);
      }
    });
  }

  /**
   * Convert keyboard event to key combo string
   */
  getKeyCombo(e) {
    const parts = [];
    
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    
    // Normalize key name
    let key = e.key.toLowerCase();
    if (key === ' ') key = 'space';
    
    parts.push(key);
    return parts.join('+');
  }

  /**
   * Get all registered shortcuts for help display
   */
  getAll() {
    return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
      key,
      description: data.description
    }));
  }

  /**
   * Show shortcuts help overlay
   */
  showHelp() {
    const shortcuts = this.getAll();
    const helpText = shortcuts
      .map(s => `${s.key.toUpperCase()}: ${s.description}`)
      .join('\n');
    
    alert(`Keyboard Shortcuts:\n\n${helpText}`);
  }
}
```

#### Step 2: Integrate Shortcuts in popup.js

```javascript
import { KeyboardShortcuts } from './modules/keyboardShortcuts.js';

// Initialize shortcuts
const shortcuts = new KeyboardShortcuts();

// Register all shortcuts
shortcuts.register('ctrl+s', () => {
  // Manual save trigger (force immediate save)
  scheduleSave(true);
  showNotification('Note saved!');
}, 'Save note');

shortcuts.register('ctrl+f', () => {
  searchReplace.open(false);
}, 'Find');

shortcuts.register('ctrl+h', () => {
  searchReplace.open(true);
}, 'Find and replace');

shortcuts.register('ctrl+p', () => {
  // Toggle preview mode
  previewBtn.click();
}, 'Toggle preview');

shortcuts.register('ctrl+b', () => {
  // Toggle bold formatting
  insertFormatting('**', '**', 'bold text');
}, 'Bold text');

shortcuts.register('ctrl+i', () => {
  // Toggle italic formatting
  insertFormatting('*', '*', 'italic text');
}, 'Italic text');

shortcuts.register('ctrl+k', () => {
  // Insert link
  insertFormatting('[', '](url)', 'link text');
}, 'Insert link');

shortcuts.register('ctrl+shift+c', () => {
  // Insert code block
  insertFormatting('```\n', '\n```', 'code');
}, 'Insert code block');

shortcuts.register('ctrl+/', () => {
  // Show shortcuts help
  shortcuts.showHelp();
}, 'Show keyboard shortcuts');

shortcuts.register('escape', () => {
  // Close modals/overlays
  if (!searchReplace.searchBar.classList.contains('hidden')) {
    searchReplace.close();
  }
}, 'Close overlays');

/**
 * Insert formatting around selection or at cursor
 */
function insertFormatting(prefix, suffix, placeholder) {
  const start = noteArea.selectionStart;
  const end = noteArea.selectionEnd;
  const text = noteArea.value;
  const selectedText = text.substring(start, end) || placeholder;
  
  const newText = text.substring(0, start) + 
                  prefix + selectedText + suffix + 
                  text.substring(end);
  
  noteArea.value = newText;
  
  // Set cursor position
  const cursorPos = start + prefix.length + selectedText.length;
  noteArea.setSelectionRange(cursorPos, cursorPos);
  noteArea.focus();
  
  // Trigger autosave
  noteArea.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Show temporary notification
 */
function showNotification(message, duration = 2000) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}
```

#### Step 3: Add Notification Styles
Add to your main CSS:

```css
.notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-color);
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease;
  font-size: 14px;
}

.notification.fade-out {
  opacity: 0;
  transition: opacity 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
```

---

## Tier 2: Power Features (2-4 weeks)

### 5. Multiple Notes with Tabs

**Implementation Time:** 4-5 days

#### Step 1: Update Data Structure
Create `modules/notesManager.js`:

```javascript
/**
 * Notes Manager
 * Handles multiple notes, tabs, and note operations
 */

export class NotesManager {
  constructor() {
    this.notes = new Map();
    this.activeNoteId = null;
    this.storageKey = 'hyperscribe_notes';
    this.activeNoteKey = 'hyperscribe_active_note';
  }

  /**
   * Initialize and load notes from storage
   */
  async initialize() {
    const data = await chrome.storage.local.get([
      this.storageKey,
      this.activeNoteKey
    ]);
    
    if (data[this.storageKey]) {
      // Restore notes from storage
      const notesArray = JSON.parse(data[this.storageKey]);
      notesArray.forEach(note => {
        this.notes.set(note.id, note);
      });
    } else {
      // Create default first note
      this.createNote('Untitled Note', '');
    }
    
    // Set active note
    this.activeNoteId = data[this.activeNoteKey] || 
                        Array.from(this.notes.keys())[0];
  }

  /**
   * Create a new note
   */
  createNote(title = 'Untitled Note', content = '') {
    const id = this.generateId();
    const note = {
      id,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.notes.set(id, note);
    this.activeNoteId = id;
    this.save();
    
    return note;
  }

  /**
   * Get a note by ID
   */
  getNote(id) {
    return this.notes.get(id);
  }

  /**
   * Get active note
   */
  getActiveNote() {
    return this.notes.get(this.activeNoteId);
  }

  /**
   * Update note content
   */
  updateNote(id, updates) {
    const note = this.notes.get(id);
    if (!note) return;
    
    Object.assign(note, updates, {
      updatedAt: Date.now()
    });
    
    this.save();
  }

  /**
   * Delete a note
   */
  deleteNote(id) {
    if (this.notes.size <= 1) {
      throw new Error('Cannot delete the last note');
    }
    
    this.notes.delete(id);
    
    // Switch to another note if active note was deleted
    if (this.activeNoteId === id) {
      this.activeNoteId = Array.from(this.notes.keys())[0];
    }
    
    this.save();
  }

  /**
   * Set active note
   */
  setActiveNote(id) {
    if (!this.notes.has(id)) return;
    
    this.activeNoteId = id;
    chrome.storage.local.set({
      [this.activeNoteKey]: id
    });
  }

  /**
   * Get all notes
   */
  getAllNotes() {
    return Array.from(this.notes.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Search across all notes
   */
  searchNotes(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllNotes().filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Save notes to storage
   */
  async save() {
    const notesArray = Array.from(this.notes.values());
    await chrome.storage.local.set({
      [this.storageKey]: JSON.stringify(notesArray)
    });
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export note as JSON
   */
  exportNote(id) {
    const note = this.notes.get(id);
    if (!note) return null;
    
    return {
      ...note,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }

  /**
   * Import note from JSON
   */
  importNote(noteData) {
    const id = this.generateId();
    const note = {
      id,
      title: noteData.title || 'Imported Note',
      content: noteData.content || '',
      createdAt: noteData.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    
    this.notes.set(id, note);
    this.save();
    
    return note;
  }
}
```

#### Step 2: Create Tab UI
Create `modules/tabsUI.js`:

```javascript
/**
 * Tabs UI Manager
 * Handles tab rendering and interactions
 */

export class TabsUI {
  constructor(containerEl, notesManager, onTabChange) {
    this.container = containerEl;
    this.notesManager = notesManager;
    this.onTabChange = onTabChange;
    this.draggedTab = null;
  }

  /**
   * Render all tabs
   */
  render() {
    this.container.innerHTML = '';
    
    const notes = this.notesManager.getAllNotes();
    const activeId = this.notesManager.activeNoteId;
    
    notes.forEach(note => {
      const tab = this.createTab(note, note.id === activeId);
      this.container.appendChild(tab);
    });
    
    // Add new tab button
    const newTabBtn = this.createNewTabButton();
    this.container.appendChild(newTabBtn);
  }

  /**
   * Create a single tab element
   */
  createTab(note, isActive) {
    const tab = document.createElement('div');
    tab.className = `note-tab ${isActive ? 'active' : ''}`;
    tab.dataset.noteId = note.id;
    tab.draggable = true;
    
    // Title with inline editing
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = this.truncateTitle(note.title);
    title.contentEditable = false;
    title.title = note.title;
    
    // Double-click to edit
    title.addEventListener('dblclick', () => {
      title.contentEditable = true;
      title.focus();
      document.execCommand('selectAll', false, null);
    });
    
    title.addEventListener('blur', () => {
      title.contentEditable = false;
      const newTitle = title.textContent.trim() || 'Untitled Note';
      this.notesManager.updateNote(note.id, { title: newTitle });
      title.textContent = this.truncateTitle(newTitle);
    });
    
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        title.blur();
      }
    });
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '<i class="codicon codicon-close"></i>';
    closeBtn.title = 'Close note';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(note.id);
    });
    
    tab.appendChild(title);
    tab.appendChild(closeBtn);
    
    // Click to switch
    tab.addEventListener('click', () => {
      this.switchTab(note.id);
    });
    
    // Drag and drop for reordering
    this.setupDragAndDrop(tab);
    
    return tab;
  }

  /**
   * Create new tab button
   */
  createNewTabButton() {
    const btn = document.createElement('button');
    btn.className = 'new-tab-btn';
    btn.innerHTML = '<i class="codicon codicon-add"></i>';
    btn.title = 'New note (Ctrl+T)';
    btn.addEventListener('click', () => this.createNewTab());
    
    return btn;
  }

  /**
   * Switch to a tab
   */
  switchTab(noteId) {
    this.notesManager.setActiveNote(noteId);
    this.render();
    this.onTabChange(noteId);
  }

  /**
   * Close a tab
   */
  closeTab(noteId) {
    const notes = this.notesManager.getAllNotes();
    if (notes.length <= 1) {
      alert('Cannot close the last note');
      return;
    }
    
    if (confirm('Delete this note?')) {
      this.notesManager.deleteNote(noteId);
      this.render();
      this.onTabChange(this.notesManager.activeNoteId);
    }
  }

  /**
   * Create new tab
   */
  createNewTab() {
    const note = this.notesManager.createNote();
    this.render();
    this.onTabChange(note.id);
  }

  /**
   * Truncate title for display
   */
  truncateTitle(title, maxLength = 20) {
    return title.length > maxLength 
      ? title.substring(0, maxLength) + '...'
      : title;
  }

  /**
   * Setup drag and drop for tab reordering
   */
  setupDragAndDrop(tab) {
    tab.addEventListener('dragstart', (e) => {
      this.draggedTab = tab;
      tab.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    
    tab.addEventListener('dragend', () => {
      tab.classList.remove('dragging');
      this.draggedTab = null;
    });
    
    tab.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (this.draggedTab && this.draggedTab !== tab) {
        const rect = tab.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        
        if (e.clientX < midpoint) {
          tab.parentNode.insertBefore(this.draggedTab, tab);
        } else {
          tab.parentNode.insertBefore(this.draggedTab, tab.nextSibling);
        }
      }
    });
  }
}
```

#### Step 3: Update HTML Structure
Modify `popup.html` to include tabs:

```html
<div class="app-container">
  <!-- Tabs bar -->
  <div id="tabsBar" class="tabs-bar">
    <!-- Tabs will be rendered here by TabsUI -->
  </div>
  
  <!-- Toolbar -->
  <div id="toolbar" class="toolbar">
    <!-- Existing toolbar buttons -->
  </div>
  
  <!-- Editor -->
  <div id="editorContainer" class="editor-container">
    <textarea id="noteArea" class="note-area"></textarea>
    <div id="previewPane" class="preview-pane hidden"></div>
  </div>
  
  <!-- Search bar -->
  <div id="searchBar" class="search-bar hidden">
    <!-- Search UI -->
  </div>
</div>
```

#### Step 4: Style Tabs
Create `modules/tabs.css`:

```css
.tabs-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.tabs-bar::-webkit-scrollbar {
  height: 6px;
}

.tabs-bar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.note-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 100px;
  max-width: 200px;
  position: relative;
}

.note-tab:hover {
  background: var(--hover-color);
}

.note-tab.active {
  background: var(--bg-tertiary);
  border-bottom-color: var(--bg-tertiary);
  font-weight: 600;
}

.note-tab.dragging {
  opacity: 0.5;
}

.tab-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--text-color);
}

.tab-title[contenteditable="true"] {
  background: var(--bg-secondary);
  padding: 2px 4px;
  border-radius: 2px;
  outline: 1px solid var(--accent-color);
}

.tab-close {
  padding: 2px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 2px;
}

.note-tab:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--danger-color);
  color: white;
}

.new-tab-btn {
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.new-tab-btn:hover {
  background: var(--hover-color);
}
```

#### Step 5: Integrate Tabs in popup.js

```javascript
import { NotesManager } from './modules/notesManager.js';
import { TabsUI } from './modules/tabsUI.js';

// Initialize notes manager
const notesManager = new NotesManager();
await notesManager.initialize();

// Initialize tabs UI
const tabsUI = new TabsUI(
  document.getElementById('tabsBar'),
  notesManager,
  (noteId) => {
    // Load note content when tab changes
    const note = notesManager.getNote(noteId);
    if (note) {
      noteArea.value = note.content;
      // Update preview if active
      if (mdPreview.isPreviewMode) {
        mdPreview.updatePreview();
      }
    }
  }
);

// Render initial tabs
tabsUI.render();

// Load active note
const activeNote = notesManager.getActiveNote();
if (activeNote) {
  noteArea.value = activeNote.content;
}

// Save note content on change
let saveTimeout;
noteArea.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const activeNote = notesManager.getActiveNote();
    if (activeNote) {
      notesManager.updateNote(activeNote.id, {
        content: noteArea.value,
        // Auto-extract title from first line
        title: extractTitle(noteArea.value)
      });
      tabsUI.render(); // Update tab titles
    }
  }, 500);
});

/**
 * Extract title from content (first line or heading)
 */
function extractTitle(content) {
  if (!content.trim()) return 'Untitled Note';
  
  const lines = content.split('\n');
  let title = lines[0].trim();
  
  // Remove markdown heading syntax
  title = title.replace(/^#+\s*/, '');
  
  // Truncate if too long
  if (title.length > 50) {
    title = title.substring(0, 50) + '...';
  }
  
  return title || 'Untitled Note';
}

// Add keyboard shortcut for new tab
shortcuts.register('ctrl+t', () => {
  tabsUI.createNewTab();
}, 'New note');

// Add keyboard shortcut for closing tab
shortcuts.register('ctrl+w', () => {
  const activeId = notesManager.activeNoteId;
  if (activeId) {
    tabsUI.closeTab(activeId);
  }
}, 'Close note');
```

---

### 6. Cloud Sync (Chrome Sync Storage)

**Implementation Time:** 2-3 days

#### Step 1: Update Storage Module
Modify `modules/notesManager.js` to support sync:

```javascript
/**
 * Storage Manager with Sync Support
 */
export class StorageManager {
  constructor(useSync = false) {
    this.storage = useSync ? chrome.storage.sync : chrome.storage.local;
    this.storageType = useSync ? 'sync' : 'local';
    
    // Sync storage has stricter limits
    this.limits = {
      maxNotes: useSync ? 20 : 100,
      maxNoteSize: useSync ? 8000 : 50000, // bytes
      maxTotalSize: useSync ? 100000 : 5242880 // bytes
    };
  }

  /**
   * Save data with compression for sync storage
   */
  async save(key, data) {
    let dataToSave = data;
    
    if (this.storageType === 'sync') {
      // Compress for sync storage
      dataToSave = this.compress(data);
    }
    
    await this.storage.set({ [key]: dataToSave });
  }

  /**
   * Load data with decompression
   */
  async load(key) {
    const result = await this.storage.get(key);
    let data = result[key];
    
    if (data && this.storageType === 'sync') {
      // Decompress if needed
      data = this.decompress(data);
    }
    
    return data;
  }

  /**
   * Simple compression (removes extra whitespace)
   */
  compress(data) {
    if (typeof data === 'string') {
      return data.replace(/\s+/g, ' ').trim();
    }
    if (typeof data === 'object') {
      return JSON.stringify(data);
    }
    return data;
  }

  /**
   * Decompress data
   */
  decompress(data) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  /**
   * Check if data fits within limits
   */
  checkLimits(data) {
    const size = new Blob([JSON.stringify(data)]).size;
    return {
      fits: size <= this.limits.maxNoteSize,
      size,
      limit: this.limits.maxNoteSize
    };
  }

  /**
   * Get storage usage
   */
  async getUsage() {
    if (this.storageType === 'sync') {
      return new Promise((resolve) => {
        chrome.storage.sync.getBytesInUse(null, (bytes) => {
          resolve({
            used: bytes,
            total: this.limits.maxTotalSize,
            percentage: (bytes / this.limits.maxTotalSize) * 100
          });
        });
      });
    } else {
      // Local storage quota check
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          total: estimate.quota,
          percentage: (estimate.usage / estimate.quota) * 100
        };
      }
    }
    
    return null;
  }
}
```

#### Step 2: Create Sync Manager
Create `modules/syncManager.js`:

```javascript
/**
 * Sync Manager
 * Handles synchronization between local and cloud storage
 */

export class SyncManager {
  constructor(notesManager) {
    this.notesManager = notesManager;
    this.localStorage = new StorageManager(false);
    this.syncStorage = new StorageManager(true);
    this.isSyncing = false;
    this.syncEnabled = false;
    this.lastSyncTime = null;
  }

  /**
   * Initialize sync and listen for changes
   */
  async initialize() {
    // Load sync preference
    const prefs = await chrome.storage.local.get('syncEnabled');
    this.syncEnabled = prefs.syncEnabled || false;
    
    if (this.syncEnabled) {
      // Listen for remote changes
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && !this.isSyncing) {
          this.handleRemoteChanges(changes);
        }
      });
      
      // Perform initial sync
      await this.sync();
    }
  }

  /**
   * Enable/disable sync
   */
  async setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
    await chrome.storage.local.set({ syncEnabled: enabled });
    
    if (enabled) {
      await this.sync();
    }
  }

  /**
   * Perform full sync
   */
  async sync() {
    if (this.isSyncing || !this.syncEnabled) return;
    
    this.isSyncing = true;
    
    try {
      // Load notes from both storages
      const localNotes = await this.localStorage.load('hyperscribe_notes');
      const syncNotes = await this.syncStorage.load('hyperscribe_notes');
      
      // Merge notes (last-write-wins strategy)
      const merged = this.mergeNotes(
        localNotes ? JSON.parse(localNotes) : [],
        syncNotes ? JSON.parse(syncNotes) : []
      );
      
      // Save merged notes to both storages
      const notesJson = JSON.stringify(merged);
      await this.localStorage.save('hyperscribe_notes', notesJson);
      
      // Check if it fits in sync storage
      const limitCheck = this.syncStorage.checkLimits(merged);
      if (limitCheck.fits) {
        await this.syncStorage.save('hyperscribe_notes', notesJson);
        this.lastSyncTime = Date.now();
      } else {
        console.warn('Notes exceed sync storage limit:', limitCheck);
        throw new Error(`Notes too large for sync (${limitCheck.size} bytes)`);
      }
      
      // Update notes manager
      this.notesManager.notes.clear();
      merged.forEach(note => {
        this.notesManager.notes.set(note.id, note);
      });
      
      return { success: true, noteCount: merged.length };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Merge notes from two sources
   */
  mergeNotes(localNotes, syncNotes) {
    const notesMap = new Map();
    
    // Add all local notes
    localNotes.forEach(note => {
      notesMap.set(note.id, note);
    });
    
    // Merge sync notes (keep newer version)
    syncNotes.forEach(syncNote => {
      const localNote = notesMap.get(syncNote.id);
      
      if (!localNote) {
        // New note from sync
        notesMap.set(syncNote.id, syncNote);
      } else if (syncNote.updatedAt > localNote.updatedAt) {
        // Sync version is newer
        notesMap.set(syncNote.id, syncNote);
      }
      // else: keep local version (it's newer)
    });
    
    return Array.from(notesMap.values());
  }

  /**
   * Handle remote storage changes
   */
  async handleRemoteChanges(changes) {
    if (changes.hyperscribe_notes) {
      console.log('Remote notes changed, syncing...');
      await this.sync();
      
      // Notify user
      this.notifySync('Notes synced from cloud');
    }
  }

  /**
   * Show sync notification
   */
  notifySync(message) {
    // Use your existing notification system
    if (typeof showNotification === 'function') {
      showNotification(message);
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      enabled: this.syncEnabled,
      syncing: this.isSyncing,
      lastSync: this.lastSyncTime,
      lastSyncAgo: this.lastSyncTime 
        ? this.formatTimeSince(this.lastSyncTime)
        : 'Never'
    };
  }

  /**
   * Format time since last sync
   */
  formatTimeSince(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  /**
   * Force sync now
   */
  async forceSyncNow() {
    return await this.sync();
  }
}
```

#### Step 3: Create Sync UI
Add sync controls to your settings/toolbar. Create `modules/syncUI.js`:

```javascript
/**
 * Sync UI Controller
 */

export class SyncUI {
  constructor(containerEl, syncManager) {
    this.container = containerEl;
    this.syncManager = syncManager;
    this.statusEl = null;
  }

  /**
   * Render sync controls
   */
  render() {
    this.container.innerHTML = `
      <div class="sync-section">
        <div class="sync-header">
          <h3>Cloud Sync</h3>
          <label class="sync-toggle">
            <input type="checkbox" id="syncToggle" ${this.syncManager.syncEnabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <p class="sync-description">
          Sync your notes across all devices signed into Chrome.
        </p>
        
        <div class="sync-status" id="syncStatus">
          <span class="status-indicator"></span>
          <span class="status-text">Checking...</span>
        </div>
        
        <button id="forceSyncBtn" class="sync-btn" ${!this.syncManager.syncEnabled ? 'disabled' : ''}>
          <i class="codicon codicon-sync"></i> Sync Now
        </button>
        
        <div class="sync-info">
          <div class="info-row">
            <span>Last synced:</span>
            <span id="lastSyncTime">Never</span>
          </div>
          <div class="info-row">
            <span>Storage used:</span>
            <span id="storageUsage">Calculating...</span>
          </div>
        </div>
      </div>
    `;
    
    this.statusEl = this.container.querySelector('#syncStatus');
    this.attachListeners();
    this.updateStatus();
  }

  /**
   * Attach event listeners
   */
  attachListeners() {
    // Toggle sync
    const toggle = this.container.querySelector('#syncToggle');
    toggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      await this.syncManager.setSyncEnabled(enabled);
      
      // Update UI
      const forceBtn = this.container.querySelector('#forceSyncBtn');
      forceBtn.disabled = !enabled;
      
      this.updateStatus();
    });
    
    // Force sync button
    const forceBtn = this.container.querySelector('#forceSyncBtn');
    forceBtn.addEventListener('click', async () => {
      forceBtn.disabled = true;
      forceBtn.innerHTML = '<i class="codicon codicon-sync spinning"></i> Syncing...';
      
      const result = await this.syncManager.forceSyncNow();
      
      if (result.success) {
        this.showSuccess(`Synced ${result.noteCount} notes`);
      } else {
        this.showError(result.error);
      }
      
      forceBtn.disabled = false;
      forceBtn.innerHTML = '<i class="codicon codicon-sync"></i> Sync Now';
      this.updateStatus();
    });
  }

  /**
   * Update sync status display
   */
  async updateStatus() {
    const status = this.syncManager.getStatus();
    const statusText = this.statusEl.querySelector('.status-text');
    const statusIndicator = this.statusEl.querySelector('.status-indicator');
    
    if (!status.enabled) {
      statusText.textContent = 'Sync disabled';
      statusIndicator.className = 'status-indicator disabled';
    } else if (status.syncing) {
      statusText.textContent = 'Syncing...';
      statusIndicator.className = 'status-indicator syncing';
    } else {
      statusText.textContent = 'Up to date';
      statusIndicator.className = 'status-indicator synced';
    }
    
    // Update last sync time
    const lastSyncEl = this.container.querySelector('#lastSyncTime');
    lastSyncEl.textContent = status.lastSyncAgo;
    
    // Update storage usage
    await this.updateStorageUsage();
  }

  /**
   * Update storage usage display
   */
  async updateStorageUsage() {
    const usage = await this.syncManager.syncStorage.getUsage();
    const usageEl = this.container.querySelector('#storageUsage');
    
    if (usage) {
      const usedKB = (usage.used / 1024).toFixed(1);
      const totalKB = (usage.total / 1024).toFixed(0);
      const percent = usage.percentage.toFixed(1);
      
      usageEl.innerHTML = `
        ${usedKB} KB / ${totalKB} KB (${percent}%)
        <div class="usage-bar">
          <div class="usage-fill" style="width: ${percent}%"></div>
        </div>
      `;
    } else {
      usageEl.textContent = 'Unable to determine';
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const statusText = this.statusEl.querySelector('.status-text');
    const statusIndicator = this.statusEl.querySelector('.status-indicator');
    
    statusText.textContent = message;
    statusIndicator.className = 'status-indicator synced';
    
    setTimeout(() => this.updateStatus(), 3000);
  }

  /**
   * Show error message
   */
  showError(message) {
    const statusText = this.statusEl.querySelector('.status-text');
    const statusIndicator = this.statusEl.querySelector('.status-indicator');
    
    statusText.textContent = `Error: ${message}`;
    statusIndicator.className = 'status-indicator error';
  }
}
```

#### Step 4: Style Sync UI
Create `modules/sync.css`:

```css
.sync-section {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 16px 0;
}

.sync-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sync-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.sync-toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
}

.sync-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.sync-toggle input:checked + .toggle-slider {
  background-color: var(--accent-color);
}

.sync-toggle input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.sync-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  margin-bottom: 12px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.synced {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.status-indicator.syncing {
  background: #3b82f6;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-indicator.disabled {
  background: var(--border-color);
}

.status-indicator.error {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 13px;
  color: var(--text-color);
}

.sync-btn {
  width: 100%;
  padding: 10px;
  background: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.sync-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.sync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn .codicon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sync-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.info-row span:last-child {
  color: var(--text-color);
  font-weight: 500;
}

.usage-bar {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}
```

#### Step 5: Integrate Sync in popup.js

```javascript
import { SyncManager } from './modules/syncManager.js';
import { SyncUI } from './modules/syncUI.js';

// Initialize sync manager
const syncManager = new SyncManager(notesManager);
await syncManager.initialize();

// Auto-sync every 5 minutes
setInterval(() => {
  if (syncManager.syncEnabled) {
    syncManager.sync();
  }
}, 5 * 60 * 1000);

// Add sync status indicator to toolbar
const syncIndicator = document.createElement('div');
syncIndicator.className = 'sync-indicator';
syncIndicator.title = 'Sync status';
syncIndicator.innerHTML = '<i class="codicon codicon-cloud"></i>';

// Update indicator based on sync status
setInterval(() => {
  const status = syncManager.getStatus();
  if (!status.enabled) {
    syncIndicator.classList.add('disabled');
    syncIndicator.classList.remove('syncing', 'synced');
  } else if (status.syncing) {
    syncIndicator.classList.add('syncing');
    syncIndicator.classList.remove('disabled', 'synced');
  } else {
    syncIndicator.classList.add('synced');
    syncIndicator.classList.remove('disabled', 'syncing');
  }
}, 1000);
```

---

### 7. Export Options

**Implementation Time:** 1-2 days

#### Step 1: Create Export Module
Create `modules/exportManager.js`:

```javascript
/**
 * Export Manager
 * Handles exporting notes to various formats
 */

export class ExportManager {
  constructor(notesManager) {
    this.notesManager = notesManager;
  }

  /**
   * Export note as TXT
   */
  exportAsTxt(noteId) {
    const note = this.notesManager.getNote(noteId);
    if (!note) return;

    const filename = this.generateFilename(note.title, 'txt');
    const content = note.content;
    
    this.downloadFile(content, filename, 'text/plain');
  }

  /**
   * Export note as Markdown
   */
  exportAsMarkdown(noteId) {
    const note = this.notesManager.getNote(noteId);
    if (!note) return;

    const filename = this.generateFilename(note.title, 'md');
    const content = `# ${note.title}\n\n${note.content}`;
    
    this.downloadFile(content, filename, 'text/markdown');
  }

  /**
   * Export note as HTML
   */
  exportAsHtml(noteId) {
    const note = this.notesManager.getNote(noteId);
    if (!note) return;

    const filename = this.generateFilename(note.title, 'html');
    
    // Convert markdown to HTML if marked is available
    let htmlContent = note.content;
    if (typeof marked !== 'undefined') {
      htmlContent = marked.parse(note.content);
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(note.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { margin-top: 24px; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 16px 0;
      color: #666;
    }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(note.title)}</h1>
  ${htmlContent}
  <hr>
  <p><small>Exported from Hyperscribe on ${new Date().toLocaleString()}</small></p>
</body>
</html>`;

    this.downloadFile(html, filename, 'text/html');
  }

  /**
   * Export note as PDF (using browser print)
   */
  async exportAsPdf(noteId) {
    const note = this.notesManager.getNote(noteId);
    if (!note) return;

    // Create a temporary window with the note content
    const printWindow = window.open('', '_blank');
    
    let htmlContent = note.content.replace(/\n/g, '<br>');
    if (typeof marked !== 'undefined') {
      htmlContent = marked.parse(note.content);
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${this.escapeHtml(note.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { margin-top: 24px; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
    }
    @media print {
      body { margin: 0; padding: 20px; }
    }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(note.title)}</h1>
  ${htmlContent}
</body>
</html>`);

    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      // Close after printing (user can cancel)
      setTimeout(() => printWindow.close(), 500);
    };
  }

  /**
   * Export all notes as JSON
   */
  exportAllAsJson() {
    const notes = this.notesManager.getAllNotes();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      noteCount: notes.length,
      notes: notes
    };

    const filename = `hyperscribe-backup-${this.getDateStamp()}.json`;
    const content = JSON.stringify(exportData, null, 2);
    
    this.downloadFile(content, filename, 'application/json');
  }

  /**
   * Export all notes as ZIP (requires JSZip)
   */
  async exportAllAsZip() {
    // Note: Requires JSZip library
    if (typeof JSZip === 'undefined') {
      alert('ZIP export requires JSZip library');
      return;
    }

    const zip = new JSZip();
    const notes = this.notesManager.getAllNotes();
    
    notes.forEach(note => {
      const filename = this.sanitizeFilename(note.title) + '.md';
      const content = `# ${note.title}\n\n${note.content}`;
      zip.file(filename, content);
    });

    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    
    const filename = `hyperscribe-notes-${this.getDateStamp()}.zip`;
    this.downloadBlob(blob, filename);
  }

  /**
   * Download file helper
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Download blob helper
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename with date
   */
  generateFilename(title, extension) {
    const sanitized = this.sanitizeFilename(title);
    const date = this.getDateStamp();
    return `${sanitized}-${date}.${extension}`;
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 50);
  }

  /**
   * Get date stamp
   */
  getDateStamp() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

#### Step 2: Create Export UI
Update toolbar with export options:

```javascript
// Add export dropdown to toolbar
const exportBtn = document.createElement('button');
exportBtn.className = 'toolbar-btn';
exportBtn.innerHTML = '<i class="codicon codicon-export"></i>';
exportBtn.title = 'Export note';

const exportMenu = document.createElement('div');
exportMenu.className = 'export-menu hidden';
exportMenu.innerHTML = `
  <button data-format="txt">
    <i class="codicon codicon-file-text"></i> Text (.txt)
  </button>
  <button data-format="md">
    <i class="codicon codicon-markdown"></i> Markdown (.md)
  </button>
  <button data-format="html">
    <i class="codicon codicon-file-code"></i> HTML (.html)
  </button>
  <button data-format="pdf">
    <i class="codicon codicon-file-pdf"></i> PDF
  </button>
  <hr>
  <button data-format="json">
    <i class="codicon codicon-json"></i> All notes (JSON)
  </button>
`;

exportBtn.addEventListener('click', () => {
  exportMenu.classList.toggle('hidden');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
    exportMenu.classList.add('hidden');
  }
});

// Handle export format selection
exportMenu.querySelectorAll('button[data-format]').forEach(btn => {
  btn.addEventListener('click', () => {
    const format = btn.dataset.format;
    const activeNote = notesManager.getActiveNote();
    
    switch(format) {
      case 'txt':
        exportManager.exportAsTxt(activeNote.id);
        break;
      case 'md':
        exportManager.exportAsMarkdown(activeNote.id);
        break;
      case 'html':
        exportManager.exportAsHtml(activeNote.id);
        break;
      case 'pdf':
        exportManager.exportAsPdf(activeNote.id);
        break;
      case 'json':
        exportManager.exportAllAsJson();
        break;
    }
    
    exportMenu.classList.add('hidden');
    showNotification(`Exported as ${format.toUpperCase()}`);
  });
});
```

#### Step 3: Style Export Menu

```css
.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.export-menu.hidden {
  display: none;
}

.export-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
  transition: background 0.2s;
}

.export-menu button:hover {
  background: var(--hover-color);
}

.export-menu hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 8px 0;
}
```

---

### 8. Text-to-Speech

**Implementation Time:** 1 day

#### Step 1: Create TTS Module
Create `modules/textToSpeech.js`:

```javascript
/**
 * Text-to-Speech Manager
 * Uses Web Speech API for reading notes aloud
 */

export class TextToSpeech {
  constructor(textareaEl) {
    this.textarea = textareaEl;
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentPosition = 0;
    this.voices = [];
    
    // Load voices
    this.loadVoices();
    
    // Voices might load asynchronously
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  /**
   * Load available voices
   */
  loadVoices() {
    this.voices = this.synth.getVoices();
  }

  /**
   * Start reading text
   */
  speak(text = null) {
    if (!text) {
      // Get selected text or entire content
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      
      if (start !== end) {
        text = this.textarea.value.substring(start, end);
        this.currentPosition = start;
      } else {
        text = this.textarea.value;
        this.currentPosition = 0;
      }
    }

    if (!text.trim()) {
      alert('No text to read');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Set default properties
    this.utterance.rate = this.getStoredSetting('rate', 1.0);
    this.utterance.pitch = this.getStoredSetting('pitch', 1.0);
    this.utterance.volume = this.getStoredSetting('volume', 1.0);
    
    // Set voice if available
    const voiceIndex = this.getStoredSetting('voiceIndex', 0);
    if (this.voices[voiceIndex]) {
      this.utterance.voice = this.voices[voiceIndex];
    }

    // Event handlers
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.highlightSpeaking();
    };

    this.utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.clearHighlight();
    };

    this.utterance.onerror = (event) => {
      console.error('Speech error:', event);
      this.isPlaying = false;
      this.isPaused = false;
    };

    // Highlight text as it's being read
    this.utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const start = this.currentPosition + event.charIndex;
        const end = start + event.charLength;
        this.textarea.setSelectionRange(start, end);
        this.scrollToSelection();
      }
    };

    // Start speaking
    this.synth.speak(this.utterance);
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.isPlaying && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop speech
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.clearHighlight();
  }

  /**
   * Set speech rate
   */
  setRate(rate) {
    this.storeSetting('rate', rate);
    if (this.utterance) {
      this.utterance.rate = rate;
    }
  }

  /**
   * Set speech pitch
   */
  setPitch(pitch) {
    this.storeSetting('pitch', pitch);
    if (this.utterance) {
      this.utterance.pitch = pitch;
    }
  }

  /**
   * Set voice
   */
  setVoice(index) {
    this.storeSetting('voiceIndex', index);
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices.map((voice, index) => ({
      index,
      name: voice.name,
      lang: voice.lang,
      default: voice.default
    }));
  }

  /**
   * Highlight textarea during speech
   */
  highlightSpeaking() {
    this.textarea.classList.add('speaking');
  }

  /**
   * Clear highlight
   */
  clearHighlight() {
    this.textarea.classList.remove('speaking');
  }

  /**
   * Scroll to current selection
   */
  scrollToSelection() {
    const lineHeight = parseInt(window.getComputedStyle(this.textarea).lineHeight);
    const textBeforeSelection = this.textarea.value.substring(0, this.textarea.selectionStart);
    const lineNumber = (textBeforeSelection.match(/\n/g) || []).length;
    this.textarea.scrollTop = lineNumber * lineHeight - this.textarea.clientHeight / 2;
  }

  /**
   * Store setting
   */
  storeSetting(key, value) {
    localStorage.setItem(`tts_${key}`, value);
  }

  /**
   * Get stored setting
   */
  getStoredSetting(key, defaultValue) {
    const stored = localStorage.getItem(`tts_${key}`);
    return stored !== null ? parseFloat(stored) : defaultValue;
  }
}
```

#### Step 2: Create TTS Controls UI
Add TTS controls to your toolbar:

```javascript
import { TextToSpeech } from './modules/textToSpeech.js';

// Initialize TTS
const tts = new TextToSpeech(noteArea);

// Create TTS control panel
const ttsPanel = document.createElement('div');
ttsPanel.className = 'tts-panel hidden';
ttsPanel.innerHTML = `
  <div class="tts-controls">
    <button id="ttsPlay" class="tts-btn" title="Play (Alt+P)">
      <i class="codicon codicon-play"></i>
    </button>
    <button id="ttsPause" class="tts-btn hidden" title="Pause">
      <i class="codicon codicon-debug-pause"></i>
    </button>
    <button id="ttsStop" class="tts-btn" title="Stop">
      <i class="codicon codicon-debug-stop"></i>
    </button>
  </div>
  
  <div class="tts-settings">
    <div class="tts-setting">
      <label for="ttsRate">Speed</label>
      <input type="range" id="ttsRate" min="0.5" max="2" step="0.1" value="1">
      <span id="ttsRateValue">1.0x</span>
    </div>
    
    <div class="tts-setting">
      <label for="ttsPitch">Pitch</label>
      <input type="range" id="ttsPitch" min="0.5" max="2" step="0.1" value="1">
      <span id="ttsPitchValue">1.0</span>
    </div>
    
    <div class="tts-setting">
      <label for="ttsVoice">Voice</label>
      <select id="ttsVoice" class="tts-voice-select">
        <!-- Voices populated dynamically -->
      </select>
    </div>
  </div>
`;

// Populate voices
const voiceSelect = ttsPanel.querySelector('#ttsVoice');
function populateVoices() {
  const voices = tts.getVoices();
  voiceSelect.innerHTML = voices.map(voice => 
    `<option value="${voice.index}">${voice.name} (${voice.lang})</option>`
  ).join('');
}
populateVoices();

// Toolbar button to toggle TTS panel
const ttsBtn = document.createElement('button');
ttsBtn.className = 'toolbar-btn';
ttsBtn.innerHTML = '<i class="codicon codicon-unmute"></i>';
ttsBtn.title = 'Text to Speech';
ttsBtn.addEventListener('click', () => {
  ttsPanel.classList.toggle('hidden');
});

// TTS control event listeners
const playBtn = ttsPanel.querySelector('#ttsPlay');
const pauseBtn = ttsPanel.querySelector('#ttsPause');
const stopBtn = ttsPanel.querySelector('#ttsStop');

playBtn.addEventListener('click', () => {
  if (tts.isPaused) {
    tts.resume();
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  } else {
    tts.speak();
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  }
});

pauseBtn.addEventListener('click', () => {
  tts.pause();
  pauseBtn.classList.add('hidden');
  playBtn.classList.remove('hidden');
});

stopBtn.addEventListener('click', () => {
  tts.stop();
  pauseBtn.classList.add('hidden');
  playBtn.classList.remove('hidden');
});

// Settings controls
const rateSlider = ttsPanel.querySelector('#ttsRate');
const rateValue = ttsPanel.querySelector('#ttsRateValue');
rateSlider.addEventListener('input', (e) => {
  const rate = parseFloat(e.target.value);
  tts.setRate(rate);
  rateValue.textContent = `${rate.toFixed(1)}x`;
});

const pitchSlider = ttsPanel.querySelector('#ttsPitch');
const pitchValue = ttsPanel.querySelector('#ttsPitchValue');
pitchSlider.addEventListener('input', (e) => {
  const pitch = parseFloat(e.target.value);
  tts.setPitch(pitch);
  pitchValue.textContent = pitch.toFixed(1);
});

voiceSelect.addEventListener('change', (e) => {
  tts.setVoice(parseInt(e.target.value));
});

// Keyboard shortcut
shortcuts.register('alt+p', () => {
  if (!tts.isPlaying) {
    tts.speak();
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  } else if (tts.isPaused) {
    tts.resume();
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  } else {
    tts.pause();
    pauseBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');
  }
}, 'Play/Pause Text-to-Speech');
```

#### Step 3: Style TTS Panel
Create `modules/tts.css`:

```css
.tts-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.tts-panel.hidden {
  display: none;
}

.tts-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
}

.tts-btn {
  padding: 12px;
  background: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  width: 44px;
  height: 44px;
}

.tts-btn:hover {
  background: var(--accent-hover);
}

.tts-btn.hidden {
  display: none;
}

.tts-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tts-setting {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tts-setting label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.tts-setting input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  outline: none;
  -webkit-appearance: none;
}

.tts-setting input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
}

.tts-setting input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: none;
}

.tts-setting span {
  font-size: 12px;
  color: var(--text-color);
  text-align: right;
  font-family: 'Courier New', monospace;
}

.tts-voice-select {
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
}

.note-area.speaking {
  background: var(--bg-speaking);
  animation: speakingPulse 2s ease-in-out infinite;
}

@keyframes speakingPulse {
  0%, 100% { 
    box-shadow: inset 0 0 0 2px var(--accent-color); 
  }
  50% { 
    box-shadow: inset 0 0 0 2px transparent; 
  }
}
```

---

## Testing Strategies

### Unit Testing Setup

Create `tests/` directory with basic test structure:

```javascript
// tests/notesManager.test.js
import { NotesManager } from '../modules/notesManager.js';

describe('NotesManager', () => {
  let notesManager;
  
  beforeEach(() => {
    notesManager = new NotesManager();
    // Mock chrome.storage
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
  });
  
  test('creates a new note', () => {
    const note = notesManager.createNote('Test Note', 'Test content');
    expect(note.title).toBe('Test Note');
    expect(note.content).toBe('Test content');
    expect(notesManager.notes.size).toBe(1);
  });
  
  test('deletes a note', () => {
    const note1 = notesManager.createNote('Note 1');
    const note2 = notesManager.createNote('Note 2');
    
    notesManager.deleteNote(note1.id);
    expect(notesManager.notes.size).toBe(1);
    expect(notesManager.notes.has(note1.id)).toBe(false);
  });
  
  test('prevents deleting last note', () => {
    const note = notesManager.createNote('Last Note');
    
    expect(() => {
      notesManager.deleteNote(note.id);
    }).toThrow('Cannot delete the last note');
  });
});
```

### Integration Testing Checklist

**Tier 1 Features:**
- [ ] Markdown preview renders correctly with links
- [ ] Links in preview open in new tabs
- [ ] Syntax highlighting applies to all code blocks
- [ ] Code copy buttons work correctly
- [ ] Search finds all matches (case-sensitive/insensitive)
- [ ] Replace one/all functions work correctly
- [ ] Regex search works without errors
- [ ] All keyboard shortcuts function properly
- [ ] Formatting shortcuts insert correct markdown

**Tier 2 Features:**
- [ ] Tabs render correctly with truncated titles
- [ ] Tab switching preserves note content
- [ ] New tab creates empty note
- [ ] Tab closing shows confirmation
- [ ] Drag-and-drop reordering works
- [ ] Sync toggle enables/disables sync
- [ ] Manual sync button triggers sync
- [ ] Storage usage displays correctly
- [ ] Conflict resolution works (last-write-wins)
- [ ] Export formats generate correct files
- [ ] PDF export opens print dialog
- [ ] Text-to-speech plays/pauses/stops correctly
- [ ] TTS settings persist across sessions
- [ ] Voice selection changes voice

### Manual Testing Scenarios

**Scenario 1: Multi-Note Workflow**
1. Create 5 new notes
2. Add content to each
3. Switch between tabs
4. Close 2 notes
5. Verify content persists
6. Restart extension
7. Verify all notes restored

**Scenario 2: Markdown & Code**
1. Create note with markdown syntax
2. Toggle preview mode
3. Verify headings, lists, links render
4. Add code block with syntax
5. Verify highlighting applies
6. Copy code using button
7. Verify clipboard contains code

**Scenario 3: Search & Replace**
1. Create note with repeated words
2. Open search (Ctrl+F)
3. Search for word
4. Navigate through matches
5. Replace one instance
6. Replace all remaining
7. Verify replacements correct

**Scenario 4: Cloud Sync**
1. Enable sync
2. Create/edit notes
3. Verify sync indicator shows "synced"
4. Open extension on different device
5. Verify notes appear
6. Edit on second device
7. Verify changes sync back

---

## Performance Considerations

### Optimization Tips

**1. Debounce Heavy Operations**
```javascript
// Debounce autosave
let saveTimeout;
const SAVE_DELAY = 500; // ms

function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    performSave();
  }, SAVE_DELAY);
}
```

**2. Lazy Load Large Libraries**
```javascript
// Load highlight.js only when preview is opened
async function loadHighlightJS() {
  if (!window.hljs) {
    await import('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js');
  }
}
```

**3. Virtualize Large Tab Lists**
```javascript
// Only render visible tabs when > 20 tabs
if (notes.length > 20) {
  renderVisibleTabsOnly();
} else {
  renderAllTabs();
}
```

**4. Limit Sync Frequency**
```javascript
// Sync max once every 5 minutes
const MIN_SYNC_INTERVAL = 5 * 60 * 1000;
let lastSyncTime = 0;

function shouldSync() {
  return Date.now() - lastSyncTime > MIN_SYNC_INTERVAL;
}
```

**5. Use RequestAnimationFrame for UI Updates**
```javascript
let rafId;

function updateUI() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    // Perform UI updates
    render();
  });
}
```

### Memory Management

**1. Clean Up Event Listeners**
```javascript
class Component {
  constructor() {
    this.listeners = [];
  }
  
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }
  
  destroy() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
}
```

**2. Limit Preview Updates**
```javascript
// Only update preview when visible
if (previewPane.offsetParent !== null) {
  updatePreview();
}
```

**3. Cache Parsed Markdown**
```javascript
const markdownCache = new Map();

function parseMarkdown(text) {
  if (markdownCache.has(text)) {
    return markdownCache.get(text);
  }
  
  const html = marked.parse(text);
  
  // Limit cache size
  if (markdownCache.size > 10) {
    const firstKey = markdownCache.keys().next().value;
    markdownCache.delete(firstKey);
  }
  
  markdownCache.set(text, html);
  return html;
}
```

### Storage Optimization

**1. Compress Large Notes**
```javascript
function compressText(text) {
  // Simple run-length encoding for repeated patterns
  return text.replace(/(.)\1{2,}/g, (match, char) => {
    return `${char}${match.length}`;
  });
}
```

**2. Use IndexedDB for Large Datasets**
```javascript
// If notes exceed storage limits, use IndexedDB
if (totalSize > STORAGE_LIMIT) {
  await migrateToIndexedDB();
}
```

**3. Batch Storage Operations**
```javascript
const pendingUpdates = [];

function queueUpdate(key, value) {
  pendingUpdates.push({ key, value });
  
  if (pendingUpdates.length >= 10) {
    flushUpdates();
  }
}

function flushUpdates() {
  const updates = {};
  pendingUpdates.forEach(({ key, value }) => {
    updates[key] = value;
  });
  
  chrome.storage.local.set(updates);
  pendingUpdates.length = 0;
}
```

---

## Implementation Timeline

### Week 1-2: Tier 1 Quick Wins
- **Days 1-3**: Markdown preview + live links
- **Days 4-5**: Syntax highlighting + code copy
- **Days 6-8**: Search & replace functionality
- **Days 9-10**: Keyboard shortcuts system
- **Testing**: 2-3 days of manual QA

### Week 3-4: Tier 2 Foundation  
- **Days 1-5**: Multiple notes with tabs system
- **Days 6-8**: Cloud sync implementation
- **Days 9-10**: Export options (TXT, MD, HTML, PDF)
- **Testing**: 2 days integration testing

### Week 5: Tier 2 Polish
- **Days 1-3**: Text-to-speech integration
- **Days 4-5**: Bug fixes and optimization
- **Testing**: Comprehensive end-to-end testing

### Week 6: Launch Preparation
- **Days 1-2**: Final polish and refinements
- **Days 3-4**: Documentation updates
- **Day 5**: Beta testing with users
- **Days 6-7**: Chrome Web Store submission prep

---

## Next Steps After Implementation

1. **Beta Testing**: Recruit 20-50 users for feedback
2. **Performance Monitoring**: Track load times, storage usage
3. **User Analytics**: Implement privacy-respecting usage tracking
4. **Iteration**: Prioritize features based on feedback
5. **Marketing**: Launch on ProductHunt, Reddit, HackerNews
6. **Monetization**: Implement premium tier payment flow
7. **Support**: Set up help documentation and support channel

This guide provides everything you need to implement Tier 1 and Tier 2 features. Start with Tier 1 features as they're simpler and provide immediate value, then progress to Tier 2 which adds more complex functionality like multi-note management and sync.

Would you like me to elaborate on any specific feature or create additional implementation details for a particular component?