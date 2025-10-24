const HOLD_THRESHOLD_MS = 220;
const HIDE_DELAY_MS = 120;

export default class RadialMenu {
  constructor({ trigger, menu, onAction }) {
    this.trigger = trigger;
    this.menu = menu;
    this.onAction = onAction;
    this.holdTimer = null;
    this.hideTimer = null;
    this.isVisible = false;
    this.position = { x: 0, y: 0 };
    this._boundMouseDown = this.handleMouseDown.bind(this);
    this._boundMouseUp = this.handleMouseUp.bind(this);
    this._boundMouseLeave = this.handleMouseLeave.bind(this);
    this._boundAuxClick = this.blockAuxClick.bind(this);
    this._boundMenuClick = this.handleMenuClick.bind(this);
    this._boundDocumentClick = this.handleDocumentClick.bind(this);

    this.init();
  }

  init() {
    this.trigger.addEventListener('mousedown', this._boundMouseDown);
    this.trigger.addEventListener('mouseup', this._boundMouseUp);
    this.trigger.addEventListener('mouseleave', this._boundMouseLeave);
    this.trigger.addEventListener('auxclick', this._boundAuxClick);
    this.menu.addEventListener('click', this._boundMenuClick);
  }

  destroy() {
    clearTimeout(this.holdTimer);
    clearTimeout(this.hideTimer);
    this.trigger.removeEventListener('mousedown', this._boundMouseDown);
    this.trigger.removeEventListener('mouseup', this._boundMouseUp);
    this.trigger.removeEventListener('mouseleave', this._boundMouseLeave);
    this.trigger.removeEventListener('auxclick', this._boundAuxClick);
    this.menu.removeEventListener('click', this._boundMenuClick);
    document.removeEventListener('click', this._boundDocumentClick);
  }

  handleMouseDown(event) {
    if (event.button !== 1) {
      return;
    }
    event.preventDefault();
    this.position = { x: event.clientX, y: event.clientY };
    clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => {
      this.show();
    }, HOLD_THRESHOLD_MS);
  }

  handleMouseUp(event) {
    if (event.button !== 1) {
      return;
    }
    clearTimeout(this.holdTimer);
    if (this.isVisible) {
      event.preventDefault();
    }
  }

  handleMouseLeave() {
    clearTimeout(this.holdTimer);
  }

  blockAuxClick(event) {
    if (event.button === 1) {
      event.preventDefault();
    }
  }

  handleMenuClick(event) {
    const target = event.target.closest('.radial-item');
    if (!target) {
      return;
    }
    const action = target.dataset.action;
    if (typeof this.onAction === 'function') {
      this.onAction(action);
    }
    this.hide();
  }

  handleDocumentClick(event) {
    if (!this.menu.contains(event.target)) {
      this.hide();
    }
  }

  show() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.menu.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.isVisible = true;
      this.menu.classList.add('active');
      this.positionMenu();
      document.addEventListener('click', this._boundDocumentClick);
    });
  }

  hide() {
    if (!this.isVisible) {
      return;
    }
    this.isVisible = false;
    this.menu.classList.remove('active');
    document.removeEventListener('click', this._boundDocumentClick);
    this.hideTimer = setTimeout(() => {
      this.menu.classList.add('hidden');
      this.hideTimer = null;
    }, HIDE_DELAY_MS);
  }

  positionMenu() {
    const rect = this.menu.getBoundingClientRect();
    const viewport = document.body.getBoundingClientRect();
    const offset = 10;
    let left = this.position.x - rect.width / 2;
    let top = this.position.y - rect.height / 2;

    left = clamp(left, viewport.left + offset, viewport.right - rect.width - offset);
    top = clamp(top, viewport.top + offset, viewport.bottom - rect.height - offset);

    this.menu.style.left = `${left}px`;
    this.menu.style.top = `${top}px`;
  }

  getPosition() {
    return { ...this.position };
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
