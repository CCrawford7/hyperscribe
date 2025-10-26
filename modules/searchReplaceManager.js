/**
 * Search & Replace manager for the Hyperscribe editor.
 */
export default class SearchReplaceManager {
  constructor(options = {}) {
    this.textarea = options.textarea;
    this.searchBar = options.searchBar;
    this.searchInput = options.searchInput;
    this.replaceInput = options.replaceInput;
    this.prevButton = options.prevButton;
    this.nextButton = options.nextButton;
    this.closeButton = options.closeButton;
    this.replaceButton = options.replaceButton;
    this.replaceAllButton = options.replaceAllButton;
    this.toggleReplaceButton = options.toggleReplaceButton;
    this.replaceControls = options.replaceControls;
    this.countLabel = options.countLabel;
    this.caseSensitiveToggle = options.caseSensitiveToggle;
    this.wholeWordToggle = options.wholeWordToggle;
    this.regexToggle = options.regexToggle;
    this.onVisibilityChange = typeof options.onVisibilityChange === 'function' ? options.onVisibilityChange : null;

    this.matches = [];
    this.currentMatchIndex = -1;

    this.bindEvents();
  }

  bindEvents() {
    this.searchInput?.addEventListener('input', () => this.performSearch());
    this.replaceInput?.addEventListener('input', () => this.updateReplaceButtons());

    this.searchInput?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          this.findPrevious();
        } else {
          this.findNext();
        }
      } else if (event.key === 'Escape') {
        this.close();
      }
    });

    this.prevButton?.addEventListener('click', () => this.findPrevious());
    this.nextButton?.addEventListener('click', () => this.findNext());
    this.closeButton?.addEventListener('click', () => this.close());
    this.replaceButton?.addEventListener('click', () => this.replaceOne());
    this.replaceAllButton?.addEventListener('click', () => this.replaceAll());

    this.toggleReplaceButton?.addEventListener('click', () => this.toggleReplace());

    this.caseSensitiveToggle?.addEventListener('change', () => this.performSearch());
    this.wholeWordToggle?.addEventListener('change', () => this.performSearch());
    this.regexToggle?.addEventListener('change', () => this.performSearch());
  }

  open(withReplace = false) {
    if (!this.searchBar) {
      return;
    }
    this.searchBar.classList.remove('hidden');
    if (this.onVisibilityChange) {
      this.onVisibilityChange(true);
    }
    if (withReplace) {
      this.replaceControls?.classList.remove('hidden');
      this.toggleReplaceButton?.setAttribute('aria-expanded', 'true');
    }
    this.prefillSelection();
    this.searchInput?.focus();
    this.performSearch();
  }

  close() {
    if (!this.searchBar) {
      return;
    }
    this.searchBar.classList.add('hidden');
    this.replaceControls?.classList.add('hidden');
    this.toggleReplaceButton?.setAttribute('aria-expanded', 'false');
    this.clearHighlights();
    this.updateCount(0, 0);
    this.matches = [];
    this.currentMatchIndex = -1;
    if (this.onVisibilityChange) {
      this.onVisibilityChange(false);
    }
    this.textarea?.focus();
  }

  toggleReplace() {
    if (!this.replaceControls) {
      return;
    }
    const nextHidden = this.replaceControls.classList.toggle('hidden');
    this.toggleReplaceButton?.setAttribute('aria-expanded', String(!nextHidden));
    if (!nextHidden) {
      this.replaceInput?.focus();
    }
  }

  prefillSelection() {
    if (!this.textarea || !this.searchInput) {
      return;
    }
    const selection = this.getSelectedText();
    if (selection) {
      this.searchInput.value = selection;
    }
  }

  getSelectedText() {
    if (!this.textarea) {
      return '';
    }
    const { selectionStart, selectionEnd, value } = this.textarea;
    if (selectionStart === null || selectionEnd === null || selectionEnd <= selectionStart) {
      return '';
    }
    return value.slice(selectionStart, selectionEnd);
  }

  performSearch() {
    if (!this.textarea || !this.searchInput) {
      return;
    }
    const query = this.searchInput.value;
    if (!query) {
      this.matches = [];
      this.currentMatchIndex = -1;
      this.updateCount(0, 0);
      return;
    }

    const regex = this.buildRegex(query);
    if (!regex) {
      this.matches = [];
      this.currentMatchIndex = -1;
      this.updateCount(0, 0);
      return;
    }

    this.matches = [];
    const text = this.textarea.value;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[0]?.length === 0) {
        regex.lastIndex += 1;
        continue;
      }
      this.matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
      if (!regex.global) {
        break;
      }
    }

    if (this.matches.length > 0) {
      this.currentMatchIndex = 0;
      this.highlightMatch(0);
    } else {
      this.currentMatchIndex = -1;
    }
    this.updateCount(this.currentMatchIndex >= 0 ? this.currentMatchIndex + 1 : 0, this.matches.length);
  }

  buildRegex(query) {
    try {
      let pattern = query;
      let flags = 'g';
      if (!this.caseSensitiveToggle?.checked) {
        flags += 'i';
      }
      if (!this.regexToggle?.checked) {
        pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (this.wholeWordToggle?.checked) {
        pattern = `\\b${pattern}\\b`;
      }
      return new RegExp(pattern, flags);
    } catch (error) {
      console.warn('Hyperscribe: invalid search pattern', error);
      return null;
    }
  }

  findNext() {
    if (this.matches.length === 0) {
      return;
    }
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
    this.highlightMatch(this.currentMatchIndex);
    this.updateCount(this.currentMatchIndex + 1, this.matches.length);
  }

  findPrevious() {
    if (this.matches.length === 0) {
      return;
    }
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length;
    this.highlightMatch(this.currentMatchIndex);
    this.updateCount(this.currentMatchIndex + 1, this.matches.length);
  }

  highlightMatch(index) {
    if (!this.textarea || index < 0 || index >= this.matches.length) {
      return;
    }
    const match = this.matches[index];
    this.textarea.focus();
    this.textarea.setSelectionRange(match.start, match.end);
    this.scrollSelectionIntoView(match.start);
  }

  clearHighlights() {
    if (!this.textarea) {
      return;
    }
    const position = this.textarea.selectionEnd ?? this.textarea.value.length;
    this.textarea.setSelectionRange(position, position);
  }

  updateCount(current, total) {
    if (this.countLabel) {
      this.countLabel.textContent = `${current} / ${total}`;
    }
    this.updateReplaceButtons();
  }

  updateReplaceButtons() {
    const hasMatches = this.matches.length > 0 && this.currentMatchIndex >= 0;
    if (this.replaceButton) {
      this.replaceButton.disabled = !hasMatches;
    }
    if (this.replaceAllButton) {
      this.replaceAllButton.disabled = this.matches.length === 0;
    }
  }

  replaceOne() {
    if (!this.textarea || this.matches.length === 0 || this.currentMatchIndex < 0) {
      return;
    }
    const current = this.matches[this.currentMatchIndex];
    const replacement = this.replaceInput?.value ?? '';
    const before = this.textarea.value.slice(0, current.start);
    const after = this.textarea.value.slice(current.end);
    const nextCursor = before.length + replacement.length;
    this.textarea.value = `${before}${replacement}${after}`;
    this.textarea.setSelectionRange(nextCursor, nextCursor);
    this.dispatchInput();
    this.performSearch();
  }

  replaceAll() {
    if (!this.textarea || this.matches.length === 0) {
      return;
    }
    const query = this.searchInput?.value ?? '';
    const regex = this.buildRegex(query);
    if (!regex) {
      return;
    }
    const replacement = this.replaceInput?.value ?? '';
    this.textarea.value = this.textarea.value.replace(regex, replacement);
    this.dispatchInput();
    this.performSearch();
  }

  dispatchInput() {
    if (!this.textarea) {
      return;
    }
    const event = new Event('input', { bubbles: true, cancelable: true });
    this.textarea.dispatchEvent(event);
  }

  scrollSelectionIntoView(position) {
    if (!this.textarea) {
      return;
    }
    const { scrollTop, clientHeight, value } = this.textarea;
    const lines = value.slice(0, position).split('\n');
    const lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight) || 20;
    const targetTop = lines.length * lineHeight;
    if (targetTop < scrollTop) {
      this.textarea.scrollTop = targetTop - lineHeight;
    } else if (targetTop > scrollTop + clientHeight - lineHeight) {
      this.textarea.scrollTop = targetTop - clientHeight + lineHeight * 2;
    }
  }

  onTextChanged() {
    if (this.searchBar && !this.searchBar.classList.contains('hidden')) {
      this.performSearch();
    }
  }
}
