# StateManager

**File:** `/modules/stateManager.js`

The `StateManager` class is responsible for managing the entire application state, including loading from and saving to `chrome.storage.local`.

## Code

```javascript
// /modules/stateManager.js

import { STORAGE_KEY } from '../shared/constants.js';

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
      const result = await chrome.storage.local.get(STORAGE_KEY);
      this.#state = result[STORAGE_KEY] || this.#getDefaultState();
    } catch (error) {
      console.error('Hyperscribe: Failed to initialize state from storage.', error);
      this.#state = this.#getDefaultState();
    }
    this.updateStorageUsage();
    return this.#state;
  }

  #getDefaultState() {
    return {
      note: '',
      notes: [],
      activeNoteId: null,
      theme: 'system',
      font: {
        size: 14,
        family: 'default',
        isBold: false,
        isItalic: false
      },
      windowSize: { width: 480, height: 600 },
      suppressClearConfirm: false,
      syncEnabled: false,
      lastSyncTime: null
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

    this.#saveTimeout = setTimeout(() => {
      chrome.storage.local.set({ [STORAGE_KEY]: this.#state }, () => {
        if (chrome.runtime.lastError) {
          console.error('Hyperscribe: Error saving state:', chrome.runtime.lastError);
        } else {
          this.updateStorageUsage();
          if (typeof this.#onStateChange === 'function') {
            this.#onStateChange(this.#state);
          }
        }
      });
    }, DEBOUNCE_SAVE_DELAY);
  }

  async updateStorageUsage() {
    if (!this.#storageUsageElement) return;
    try {
      const bytes = await chrome.storage.local.getBytesInUse(STORAGE_KEY);
      const usage = bytes ? (bytes / 1024).toFixed(2) + ' KB' : '0 KB';
      this.#storageUsageElement.textContent = `Storage: ${usage}`;
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
    await chrome.storage.local.remove(STORAGE_KEY);
    this.updateStorageUsage();
  }
}
```

## Usage

The `StateManager` is instantiated in `popup.js` and its methods are used throughout the application to interact with the central state.
