const defaultFontState = {
  size: 16,
  family: 'Inter, sans-serif',
  weight: 'normal',
  style: 'normal'
};

export default class FontManager {
  constructor({ noteArea, overlay, controls, onChange }) {
    this.noteArea = noteArea;
    this.overlay = overlay ?? null;
    this.controls = controls;
    this.onChange = onChange;
    this.state = { ...defaultFontState };

    this.handleSizeInput = this.handleSizeInput.bind(this);
    this.handleFamilyChange = this.handleFamilyChange.bind(this);
    this.handleBoldToggle = this.handleBoldToggle.bind(this);
    this.handleItalicToggle = this.handleItalicToggle.bind(this);

    this.bindEvents();
    this.applyStyles();
  }

  bindEvents() {
    this.controls.size.addEventListener('input', this.handleSizeInput);
    this.controls.family.addEventListener('change', this.handleFamilyChange);
    this.controls.bold.addEventListener('click', this.handleBoldToggle);
    this.controls.italic.addEventListener('click', this.handleItalicToggle);
  }

  apply(fontState = {}) {
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

    this.applyStyles();
  }

  handleSizeInput(event) {
    this.state.size = Number(event.target.value);
    this.controls.sizeIndicator.textContent = `${this.state.size}px`;
    this.applyStyles();
    this.emit();
  }

  handleFamilyChange(event) {
    this.state.family = event.target.value;
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
    if (this.overlay) {
      this.overlay.style.fontSize = `${this.state.size}px`;
      this.overlay.style.fontFamily = this.state.family;
      this.overlay.style.fontWeight = this.state.weight;
      this.overlay.style.fontStyle = this.state.style;
    }
  }

  emit() {
    if (typeof this.onChange === 'function') {
      this.onChange({ ...this.state });
    }
  }
}
