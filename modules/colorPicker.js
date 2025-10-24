const defaultColor = {
  h: 225,
  s: 70,
  l: 96,
  hex: '#eff3ff'
};

export default class ColorPicker {
  constructor({ panel, controls, onChange, onClose }) {
    this.panel = panel;
    this.controls = controls;
    this.onChange = onChange;
    this.onClose = onClose;
    this.state = { ...defaultColor };
    this.visible = false;
    this.hideTimeout = null;
    this.anchor = { x: 0, y: 0 };
    this.frameId = null;

    this.handleInput = this.handleInput.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.bindEvents();
    this.apply(defaultColor);
  }

  bindEvents() {
    const { hue, saturation, lightness, closeButton } = this.controls;
    hue.addEventListener('input', this.handleInput);
    saturation.addEventListener('input', this.handleInput);
    lightness.addEventListener('input', this.handleInput);
    closeButton.addEventListener('click', this.handleClose);
  }

  apply(color = defaultColor) {
    this.state = { ...this.state, ...color };
    const { hue, saturation, lightness, hexLabel } = this.controls;
    hue.value = String(this.state.h);
    saturation.value = String(this.state.s);
    lightness.value = String(this.state.l);
    hexLabel.textContent = this.state.hex;
    this.updatePreview();
  }

  toggle({ anchor } = {}) {
    if (this.visible) {
      this.hide();
    } else {
      this.show({ anchor });
    }
  }

  show({ anchor } = {}) {
    if (anchor) {
      this.anchor = anchor;
    }
    clearTimeout(this.hideTimeout);
    this.panel.classList.remove('hidden');
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.panel.classList.add('active');
      this.visible = true;
      this.positionPanel();
    });
  }

  hide() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    if (!this.visible && this.panel.classList.contains('hidden')) {
      return;
    }
    this.panel.classList.remove('active');
    this.visible = false;
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.panel.classList.add('hidden');
      this.hideTimeout = null;
      if (typeof this.onClose === 'function') {
        this.onClose();
      }
    }, 120);
  }

  handleInput() {
    const { hue, saturation, lightness, hexLabel } = this.controls;
    this.state.h = Number(hue.value);
    this.state.s = Number(saturation.value);
    this.state.l = Number(lightness.value);
    this.state.hex = hslToHex(this.state.h, this.state.s, this.state.l);
    hexLabel.textContent = this.state.hex;
    this.updatePreview();
    if (typeof this.onChange === 'function') {
      this.onChange({ ...this.state });
    }
  }

  handleClose() {
    this.hide();
  }

  positionPanel() {
    const rect = this.panel.getBoundingClientRect();
    const viewport = document.body.getBoundingClientRect();
    const x = this.anchor.x || viewport.width / 2;
    const y = this.anchor.y || viewport.height / 2;
    const offset = 16;
    let left = x - rect.width / 2;
    let top = y - rect.height / 2;

    left = clamp(left, viewport.left + offset, viewport.right - rect.width - offset);
    top = clamp(top, viewport.top + offset, viewport.bottom - rect.height - offset);

    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${top}px`;
  }

  updatePreview() {
    const hsl = `hsl(${this.state.h} ${this.state.s}% ${this.state.l}%)`;
    const hsla = `hsla(${this.state.h}, ${this.state.s}%, ${this.state.l}%, 0.45)`;
    this.panel.style.borderColor = hsl;
    this.panel.style.boxShadow = `0 10px 25px rgba(17, 34, 68, 0.22), 0 0 0 2px ${hsla}`;
  }
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h / 360, s / 100, l / 100);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 0.5) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function toHex(value) {
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
