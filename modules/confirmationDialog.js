/**
 * Manages confirmation dialogs with Promise-based API
 * @class ConfirmationDialog
 */
export default class ConfirmationDialog {
  /**
   * @typedef {Object} ConfirmationOptions
   * @property {string} message - Message to display
   * @property {string} confirmLabel - Label for confirm button
   * @property {string} cancelLabel - Label for cancel button
   * @property {boolean} includeDontAsk - Show "don't ask again" checkbox
   * @property {Function} onConfirm - Callback when confirmed
   */

  /**
   * Creates a new ConfirmationDialog instance
   * @param {Object} config - Configuration object
   * @param {HTMLElement} config.overlay - Overlay element
   * @param {HTMLElement} config.message - Message element
   * @param {HTMLElement} config.acceptButton - Accept button
   * @param {HTMLElement} config.cancelButton - Cancel button
   * @param {HTMLElement} config.dontAskCheckbox - Don't ask checkbox
   */
  constructor({ overlay, message, acceptButton, cancelButton, dontAskCheckbox }) {
    this.overlay = overlay;
    this.message = message;
    this.acceptButton = acceptButton;
    this.cancelButton = cancelButton;
    this.dontAskCheckbox = dontAskCheckbox;

    this.pendingConfirmation = null;
    this.restoreTarget = null;

    this.bindEvents();
  }

  /**
   * Bind event listeners
   * @private
   */
  bindEvents() {
    this.acceptButton?.addEventListener('click', () => this.resolve(true));
    this.cancelButton?.addEventListener('click', () => this.resolve(false));
    this.overlay?.addEventListener('click', event => this.handleOverlayClick(event));
    this.overlay?.addEventListener('keydown', event => this.handleKeyDown(event));
  }

  /**
   * Show confirmation dialog
   * @param {ConfirmationOptions} options - Confirmation options
   * @returns {void}
   */
  show({
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    includeDontAsk = false
  }) {
    if (!this.overlay || !this.message || !this.acceptButton || !this.cancelButton) {
      // Fallback: auto-confirm if elements missing
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
      return;
    }

    // Close any existing confirmation
    if (this.isOpen()) {
      this.resolve(false);
    }

    this.pendingConfirmation = {
      onConfirm: typeof onConfirm === 'function' ? onConfirm : null
    };

    this.message.textContent = message;
    this.acceptButton.textContent = confirmLabel;
    this.cancelButton.textContent = cancelLabel;

    if (this.dontAskCheckbox) {
      this.dontAskCheckbox.checked = false;
      this.dontAskCheckbox.parentElement.classList.toggle('hidden', !includeDontAsk);
    }

    this.overlay.classList.remove('hidden');
    this.overlay.setAttribute('aria-hidden', 'false');

    // Store active element to restore focus later
    this.restoreTarget =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    requestAnimationFrame(() => {
      this.acceptButton.focus();
    });
  }

  /**
   * Resolve the confirmation
   * @param {boolean} accepted - Whether user accepted
   * @returns {void}
   */
  resolve(accepted) {
    if (!this.isOpen()) {
      return;
    }

    const pending = this.pendingConfirmation;
    const dontAsk = Boolean(this.dontAskCheckbox?.checked);

    this.pendingConfirmation = null;
    this.hide();

    // Handle Promise-based API (confirm method)
    if (pending?.resolve) {
      pending.resolve(accepted);
      return;
    }

    // Handle callback-based API (show method)
    const action = pending?.onConfirm ?? null;
    if (accepted && typeof action === 'function') {
      // Return dontAsk flag through action context
      const context = { suppressFutureConfirms: dontAsk };

      Promise.resolve()
        .then(() => action(context))
        .catch(error => {
          console.warn('Quick Notepad: confirmation action failed', error);
        });
    }
  }

  /**
   * Hide the confirmation dialog
   * @private
   */
  hide() {
    if (!this.overlay) {
      return;
    }

    this.overlay.classList.add('hidden');
    this.overlay.setAttribute('aria-hidden', 'true');

    if (this.restoreTarget && typeof this.restoreTarget.focus === 'function') {
      this.restoreTarget.focus();
    }
    this.restoreTarget = null;
  }

  /**
   * Check if confirmation is open
   * @returns {boolean}
   */
  isOpen() {
    return Boolean(this.overlay && !this.overlay.classList.contains('hidden'));
  }

  /**
   * Handle overlay click (close on backdrop click)
   * @private
   * @param {MouseEvent} event - Click event
   */
  handleOverlayClick(event) {
    if (event.target === this.overlay) {
      this.resolve(false);
    }
  }

  /**
   * Handle Escape key
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {boolean} True if handled
   */
  handleEscape(event) {
    if (this.isOpen() && event.key === 'Escape') {
      this.resolve(false);
      event.preventDefault();
      return true;
    }
    return false;
  }

  /**
   * Handle keyboard navigation (focus trap)
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    if (!this.isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      this.resolve(false);
      event.preventDefault();
      return;
    }

    // Implement focus trap with Tab
    if (event.key === 'Tab') {
      const focusableElements = this.getFocusableElements();
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        // Shift+Tab: backwards
        if (activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        // Tab: forwards
        if (activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }

  /**
   * Get all focusable elements within the dialog
   * @private
   * @returns {HTMLElement[]}
   */
  getFocusableElements() {
    if (!this.overlay) {
      return [];
    }

    const selector =
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.overlay.querySelectorAll(selector));
  }

  /**
   * Show confirmation dialog and return a Promise
   * @param {string} message - Confirmation message
   * @param {Object} options - Options
   * @param {boolean} options.showDontAsk - Show "don't ask again" checkbox
   * @param {string} options.confirmLabel - Label for confirm button
   * @param {string} options.cancelLabel - Label for cancel button
   * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
   */
  confirm(message, { showDontAsk = false, confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = {}) {
    return new Promise(resolve => {
      if (!this.overlay || !this.message || !this.acceptButton || !this.cancelButton) {
        // Fallback: auto-confirm if elements missing
        resolve(true);
        return;
      }

      // Close any existing confirmation
      if (this.isOpen()) {
        this.resolve(false);
      }

      this.pendingConfirmation = {
        resolve
      };

      this.message.textContent = message;
      this.acceptButton.textContent = confirmLabel;
      this.cancelButton.textContent = cancelLabel;

      if (this.dontAskCheckbox) {
        this.dontAskCheckbox.checked = false;
        this.dontAskCheckbox.parentElement.classList.toggle('hidden', !showDontAsk);
      }

      this.overlay.classList.remove('hidden');
      this.overlay.setAttribute('aria-hidden', 'false');

      // Store active element to restore focus later
      this.restoreTarget =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      requestAnimationFrame(() => {
        this.acceptButton.focus();
      });
    });
  }
}
