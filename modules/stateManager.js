// /modules/stateManager.js

import StorageRepository from './storageRepository.js';

const DEBOUNCE_SAVE_DELAY = 500;

export default class StateManager {
  #state = {};
  #storageUsageElement = null;
  #onStateChange = () => {};
  #saveTimeout = null;

  constructor({ storageUsageElement, onStateChange }) {
    this.#storageUsageElement = storageUsageElement;
    this.#onStateChange = onStateChange;
  }

  async init() {
    try {
      const storedState = await StorageRepository.getState();
      this.#state = storedState || this.#getDefaultState();
    } catch (error) {
      console.error('Hyperscribe: Failed to initialize state from storage.', error);
      this.#state = this.#getDefaultState();
    }
    this.updateStorageUsage();
    return this.#state;
  }

  #getDefaultState() {
    return {
      version: 1,
      note: '',
      notes: [],
      activeNoteId: null,
      theme: 'default_bright',
      font: {
        size: 16,
        family: "'Fira Code', monospace",
        isBold: false,
        isItalic: false
      },
      windowSize: { width: 480, height: 600 },
      suppressClearConfirm: false,
      suppressTabCloseConfirm: false,
      spellcheckEnabled: false,
      spellcheckLang: 'en_US',
      customThemeCss: '',
      customThemeColors: null
    };
  }

  getState() {
    return this.#state;
  }

  save(partialState) {
    this.#state = { ...this.#state, ...partialState, lastModified: Date.now() };

    if (this.#saveTimeout) {
      clearTimeout(this.#saveTimeout);
    }

    this.#saveTimeout = setTimeout(async () => {
      const success = await StorageRepository.saveState(this.#state);
      if (success) {
        this.updateStorageUsage();
        if (typeof this.#onStateChange === 'function') {
          this.#onStateChange(this.#state);
        }
      } else {
        console.error('Hyperscribe: Error saving state');
      }
    }, DEBOUNCE_SAVE_DELAY);
  }

  /**
   * Save state immediately without debouncing.
   * Used for beforeunload to prevent data loss when popup closes.
   */
  async saveImmediate() {
    // Cancel any pending debounced save
    if (this.#saveTimeout) {
      clearTimeout(this.#saveTimeout);
      this.#saveTimeout = null;
    }

    // Save immediately and wait for completion
    try {
      await StorageRepository.saveState(this.#state);
    } catch (error) {
      console.error('Hyperscribe: Immediate save failed', error);
    }
  }

  async updateStorageUsage() {
    if (!this.#storageUsageElement) return;
    try {
      const { bytes, percentage, status } = await StorageRepository.getStorageUsage();
      const usage = bytes ? StorageRepository.formatBytes(bytes) : '0 B';

      // Update display text
      this.#storageUsageElement.textContent = `Storage: ${usage}`;

      // Remove previous warning classes
      this.#storageUsageElement.classList.remove('storage-warning', 'storage-critical');

      // Add warning/critical classes based on thresholds
      if (status === 'critical') {
        this.#storageUsageElement.classList.add('storage-critical');
        this.#storageUsageElement.title = 'Storage nearly full! Consider exporting notes.';
      } else if (status === 'warning') {
        this.#storageUsageElement.classList.add('storage-warning');
        this.#storageUsageElement.title = 'Storage usage is high. Consider exporting old notes.';
      } else {
        this.#storageUsageElement.title = '';
      }
    } catch (error) {
      this.#storageUsageElement.textContent = 'Storage: N/A';
    }
  }

  exportSettings() {
    const { note, notes, ...settings } = this.#state;
    return settings;
  }

  async importSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return { success: false, message: 'Invalid settings format.' };
    }
    const currentState = this.getState();
    const newState = { ...currentState, ...settings };
    this.save(newState);
    return { success: true };
  }

  async clear() {
    this.#state = this.#getDefaultState();
    await StorageRepository.clearState();
    this.updateStorageUsage();
  }
}
