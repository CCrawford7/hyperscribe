// modules/spellcheckRenderer.js
// Renders spell check highlights in the overlay div

export default class SpellcheckRenderer {
  #highlightsElement = null;
  #textareaElement = null;
  #misspelledWords = [];

  constructor({ highlightsElement, textareaElement }) {
    this.#highlightsElement = highlightsElement;
    this.#textareaElement = textareaElement;
    this.#bindScrollSync();

    // Delay initial sync to ensure styles are computed
    requestAnimationFrame(() => {
      this.syncFontProperties();
    });
  }

  #bindScrollSync() {
    // Sync scroll position from textarea to highlights div
    this.#textareaElement.addEventListener('scroll', () => {
      this.#highlightsElement.scrollTop = this.#textareaElement.scrollTop;
      this.#highlightsElement.scrollLeft = this.#textareaElement.scrollLeft;
    });
  }

  syncFontProperties() {
    // Sync font properties from textarea to highlights div
    // This ensures the overlay text aligns exactly with the textarea text
    const computed = window.getComputedStyle(this.#textareaElement);
    const el = this.#highlightsElement;

    // Copy all text-affecting properties
    el.style.fontSize = computed.fontSize;
    el.style.fontFamily = computed.fontFamily;
    el.style.fontWeight = computed.fontWeight;
    el.style.fontStyle = computed.fontStyle;
    el.style.lineHeight = computed.lineHeight;
    el.style.letterSpacing = computed.letterSpacing;
    el.style.wordSpacing = computed.wordSpacing;
    el.style.textIndent = computed.textIndent;
    el.style.paddingTop = computed.paddingTop;
    el.style.paddingRight = computed.paddingRight;
    el.style.paddingBottom = computed.paddingBottom;
    el.style.paddingLeft = computed.paddingLeft;
  }

  updateHighlights(misspelledWords) {
    this.#misspelledWords = misspelledWords;
    this.syncFontProperties(); // Sync before rendering to ensure alignment
    this.#render();
  }

  clear() {
    this.#misspelledWords = [];
    this.#highlightsElement.innerHTML = '';
  }

  #render() {
    const text = this.#textareaElement.value;

    // Clear existing content
    this.#highlightsElement.textContent = '';

    if (!text || this.#misspelledWords.length === 0) {
      // Still need to render the full text for proper sizing
      this.#highlightsElement.textContent = text;
      return;
    }

    // Sort misspelled words by start position
    const sorted = [...this.#misspelledWords].sort((a, b) => a.start - b.start);

    // Create document fragment for performance
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    sorted.forEach(({ start, end }) => {
      // Add text before misspelled word
      if (start > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, start))
        );
      }

      // Add misspelled word with mark element
      const mark = document.createElement('mark');
      mark.className = 'spellcheck-error';
      mark.textContent = text.substring(start, end);
      fragment.appendChild(mark);

      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    this.#highlightsElement.appendChild(fragment);
  }

  getMisspelledWordAt(position) {
    return this.#misspelledWords.find(
      ({ start, end }) => position >= start && position < end
    );
  }
}
