/**
 * Markdown Preview Manager
 * Handles markdown rendering and live hyperlink detection.
 */

export default class MarkdownPreview {
  constructor({ textarea, preview, container, onModeChange } = {}) {
    this.textarea = textarea;
    this.preview = preview;
    this.container = container;
    this.onModeChange = typeof onModeChange === 'function' ? onModeChange : null;
    this.mode = 'edit';
    this.updateTimeout = null;

    if (typeof marked !== 'undefined' && typeof marked.setOptions === 'function') {
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
      });
    }
  }

  /**
   * Cycle the preview mode.
   * @returns {string} The next mode.
   */
  cycleMode() {
    const sequence = ['edit', 'split', 'preview'];
    const currentIndex = sequence.indexOf(this.mode);
    const nextMode = sequence[(currentIndex + 1) % sequence.length];
    this.setMode(nextMode);
    return nextMode;
  }

  /**
   * Set preview mode explicitly.
   * @param {'edit'|'split'|'preview'} mode
   */
  setMode(mode) {
    const normalized = ['edit', 'split', 'preview'].includes(mode) ? mode : 'edit';
    this.mode = normalized;

    if (this.container) {
      this.container.classList.remove('edit-only', 'split-view', 'preview-only');
      this.container.classList.add(this.classNameForMode(normalized));
    }

    if (this.preview) {
      if (normalized === 'edit') {
        this.preview.classList.add('hidden');
      } else {
        this.preview.classList.remove('hidden');
        this.updatePreview();
      }
    }

    if (this.onModeChange) {
      this.onModeChange(this.mode);
    }
  }

  classNameForMode(mode) {
    switch (mode) {
      case 'split':
        return 'split-view';
      case 'preview':
        return 'preview-only';
      case 'edit':
      default:
        return 'edit-only';
    }
  }

  /**
   * Debounced preview update.
   */
  scheduleUpdate() {
    if (this.mode === 'edit') {
      return;
    }
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.updatePreview();
    }, 200);
  }

  /**
   * Render markdown to the preview pane.
   */
  updatePreview() {
    if (!this.preview) {
      return;
    }
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
      this.preview.textContent = 'Markdown preview unavailable (libraries not loaded).';
      return;
    }

    const rawMarkdown = this.textarea?.value ?? '';
    const rawHtml = marked.parse(rawMarkdown, {
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    });

    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'ul', 'ol', 'li', 'blockquote',
        'code', 'pre', 'strong', 'em', 'hr',
        'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class']
    });

    this.preview.innerHTML = cleanHtml;
    this.highlightCode();
    this.makeLinksClickable();
  }

  /**
   * Enhance links to open in a new tab when clicked.
   */
  makeLinksClickable() {
    if (!this.preview) {
      return;
    }
    const links = this.preview.querySelectorAll('a[href]');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.addEventListener('click', async event => {
        event.preventDefault();
        const url = link.getAttribute('href');
        if (this.isValidUrl(url) && chrome?.tabs?.create) {
          try {
            await chrome.tabs.create({ url });
          } catch (error) {
            console.warn('Hyperscribe: failed to open link', error);
          }
        }
      });
    });
  }

  /**
   * Apply syntax highlighting to code blocks and attach copy controls.
   */
  highlightCode() {
    if (typeof hljs === 'undefined' || !this.preview) {
      return;
    }
    const codeBlocks = this.preview.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      try {
        hljs.highlightElement(block);
      } catch (error) {
        console.warn('Hyperscribe: unable to highlight code block', error);
      }
      this.addCopyButton(block);
    });
  }

  /**
   * Append a copy button to the supplied code block.
   * @param {HTMLElement} codeBlock
   */
  addCopyButton(codeBlock) {
    const pre = codeBlock?.parentElement;
    if (!pre) {
      return;
    }

    const existing = pre.querySelector('.copy-code-btn');
    if (existing) {
      existing.remove();
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code-btn';
    button.innerHTML = '<i class="codicon codicon-copy" aria-hidden="true"></i>';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', async () => {
      const codeText = codeBlock.textContent ?? '';
      const originalMarkup = button.innerHTML;

      const showState = (markup, className) => {
        if (className) {
          button.classList.add(className);
        }
        button.innerHTML = markup;
        setTimeout(() => {
          button.classList.remove('copied', 'error');
          button.innerHTML = originalMarkup;
        }, 1600);
      };

      const attemptClipboard = async () => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          return false;
        }
        try {
          await navigator.clipboard.writeText(codeText);
          return true;
        } catch (error) {
          console.warn('Hyperscribe: clipboard API copy failed', error);
          return false;
        }
      };

      const attemptFallback = () => {
        const temp = document.createElement('textarea');
        temp.value = codeText;
        temp.setAttribute('readonly', '');
        temp.style.position = 'absolute';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        let success = false;
        try {
          success = document.execCommand('copy');
        } catch (error) {
          console.warn('Hyperscribe: execCommand copy failed', error);
        }
        document.body.removeChild(temp);
        return success;
      };

      const ok = (await attemptClipboard()) || attemptFallback();
      if (ok) {
        showState('<i class="codicon codicon-check" aria-hidden="true"></i>', 'copied');
      } else {
        showState('<i class="codicon codicon-error" aria-hidden="true"></i>', 'error');
      }
    });

    pre.style.position = 'relative';
    pre.appendChild(button);
  }

  /**
   * Validate URLs before opening.
   * @param {string} candidate
   */
  isValidUrl(candidate) {
    if (typeof candidate !== 'string' || candidate.trim().length === 0) {
      return false;
    }
    try {
      const parsed = new URL(candidate);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
}
