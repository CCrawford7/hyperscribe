import FontLoader from './fontLoader.js';

const defaultFontState = {
  size: 16,
  family: "'Fira Code', monospace",
  weight: 'normal',
  style: 'normal'
};

export default class FontManager {
  constructor({ noteArea, controls, onChange }) {
    this.noteArea = noteArea;
    this.controls = controls;
    this.onChange = onChange;
    this.state = { ...defaultFontState };

    this.handleSizeInput = this.handleSizeInput.bind(this);
    this.handleFamilyChange = this.handleFamilyChange.bind(this);
    this.handleBoldToggle = this.handleBoldToggle.bind(this);
    this.handleItalicToggle = this.handleItalicToggle.bind(this);

    // Debounced emit for font size slider changes
    this.#sizeDebounceTimer = null;

    this.bindEvents();
    this.applyStyles();
  }

  #sizeDebounceTimer = null;

  bindEvents() {
    this.controls.size.addEventListener('input', this.handleSizeInput);
    this.controls.family.addEventListener('change', this.handleFamilyChange);
    this.controls.bold.addEventListener('click', this.handleBoldToggle);
    this.controls.italic.addEventListener('click', this.handleItalicToggle);
  }

  async apply(fontState = {}) {
    this.state = {
      ...this.state,
      ...fontState,
      size: Number(fontState.size ?? this.state.size)
    };
    this.controls.size.value = String(this.state.size);
    this.controls.sizeIndicator.textContent = `${this.state.size}px`;

    if ([...this.controls.family.options].some(opt => opt.value === this.state.family)) {
      this.controls.family.value = this.state.family;
    } else {
      this.controls.family.value = defaultFontState.family;
      this.state.family = defaultFontState.family;
    }

    const isBold = this.state.weight === 'bold' || this.state.weight === '700';
    this.controls.bold.setAttribute('aria-pressed', String(isBold));

    const isItalic = this.state.style === 'italic';
    this.controls.italic.setAttribute('aria-pressed', String(isItalic));

    // Lazy load the font if not already loaded
    if (!FontLoader.isLoaded(this.state.family)) {
      await FontLoader.loadFont(this.state.family);
    }

    this.applyStyles();
  }

  handleSizeInput(event) {
    this.state.size = Number(event.target.value);
    this.controls.sizeIndicator.textContent = `${this.state.size}px`;
    this.applyStyles();
    // Debounce saves during slider drag
    if (this.#sizeDebounceTimer) {
      clearTimeout(this.#sizeDebounceTimer);
    }
    this.#sizeDebounceTimer = setTimeout(() => {
      this.#sizeDebounceTimer = null;
      this.emit();
    }, 200);
  }

  async handleFamilyChange(event) {
    const newFamily = event.target.value;

    // Show loading indicator while font loads
    this.noteArea.style.opacity = '0.7';

    // Lazy load the font
    await FontLoader.loadFont(newFamily);

    this.state.family = newFamily;
    this.noteArea.style.opacity = '1';
    this.applyStyles();
    this.emit();
  }

  handleBoldToggle() {
    const pressed = this.controls.bold.getAttribute('aria-pressed') === 'true';
    const next = !pressed;
    this.controls.bold.setAttribute('aria-pressed', String(next));
    this.state.weight = next ? 'bold' : 'normal';
    this.applyStyles();
    this.emit();
  }

  handleItalicToggle() {
    const pressed = this.controls.italic.getAttribute('aria-pressed') === 'true';
    const next = !pressed;
    this.controls.italic.setAttribute('aria-pressed', String(next));
    this.state.style = next ? 'italic' : 'normal';
    this.applyStyles();
    this.emit();
  }

  applyStyles() {
    this.noteArea.style.fontSize = `${this.state.size}px`;
    this.noteArea.style.fontFamily = this.state.family;
    this.noteArea.style.fontWeight = this.state.weight;
    this.noteArea.style.fontStyle = this.state.style;
  }

  emit() {
    if (typeof this.onChange === 'function') {
      this.onChange({ ...this.state });
    }
  }
}
