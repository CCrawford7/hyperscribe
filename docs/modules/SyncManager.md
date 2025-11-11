# SyncManager

**File:** `/modules/syncManager.js`

The `SyncManager` is responsible for all logic related to synchronizing user data with `chrome.storage.sync`. This allows users to have their notes available across different browsers where they are logged into their Google account.

**Note:** The code below is a detailed stub based on usage in `popup.js`.

## Code

```javascript
// /modules/syncManager.js

export const CONFLICT_RESOLUTION = {
  KEEP_LOCAL: 'keep_local',
  KEEP_CLOUD: 'keep_cloud',
  KEEP_BOTH: 'keep_both'
};

export default class SyncManager {
  #stateManager = null;
  #onSyncStatusChange = () => {};
  #onConflictDetected = () => {};
  #showError = () => {};

  constructor({ stateManager, onSyncStatusChange, onConflictDetected, showError }) {
    this.#stateManager = stateManager;
    this.#onSyncStatusChange = onSyncStatusChange;
    this.#onConflictDetected = onConflictDetected;
    this.#showError = showError;
  }

  async enable() {
    // Stub: In a real implementation, this would set up sync listeners.
    this.#stateManager.save({ syncEnabled: true });
    this.#onSyncStatusChange({ status: 'enabled' });
    return { success: true };
  }

  async disable() {
    // Stub: This would remove sync listeners.
    this.#stateManager.save({ syncEnabled: false });
    this.#onSyncStatusChange({ status: 'disabled' });
    return { success: true };
  }

  async sync() {
    // Stub: This would perform the core sync logic.
    this.#onSyncStatusChange({ status: 'syncing' });
    console.log('Pretending to sync...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.#stateManager.save({ lastSyncTime: Date.now() });
    this.#onSyncStatusChange({ status: 'synced' });
    return { success: true };
  }

  async clearSyncData() {
    // Stub: This would clear data from chrome.storage.sync.
    await chrome.storage.sync.clear();
    return { success: true };
  }

  async calculateSyncUsage() {
    // Stub: This would calculate usage against chrome.storage.sync.QUOTA_BYTES.
    const bytes = await chrome.storage.sync.getBytesInUse();
    const total = chrome.storage.sync.QUOTA_BYTES;
    return {
      bytes,
      total,
      formatted: this.formatBytes(bytes),
      percentage: ((bytes / total) * 100).toFixed(2)
    };
  }

  async resolveConflict(type, strategy) {
    // Stub: This would handle merging data based on user's choice.
    console.log(`Resolving conflict for ${type} with strategy: ${strategy}`);
    return { success: true };
  }

  async loadFromSync() {
    // Stub: This would load the note directly from the sync area.
    return { success: false, error: 'No synced note found.' };
  }

  async hasNewerCloudData() {
    // Stub: Compare local and cloud timestamps.
    return { hasNewer: false };
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
```

## Usage

The `SyncManager` is heavily used in `popup.js` to handle all UI and logic related to the sync feature, including enabling/disabling, forcing a sync, and resolving conflicts.
