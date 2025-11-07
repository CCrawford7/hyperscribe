import { STORAGE_KEY } from './shared/constants.js';
import MigrationManager, { CURRENT_VERSION } from './modules/migrationManager.js';

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    if (!stored[STORAGE_KEY]) {
      const migrationManager = new MigrationManager();
      const defaultState = migrationManager.runMigrations({}, 0, CURRENT_VERSION);
      await chrome.storage.local.set({ [STORAGE_KEY]: defaultState });
    }
  } catch (error) {
    console.error('Hyperscribe: unable to seed default state', error);
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(command => {
  // Send message to active popup
  chrome.runtime.sendMessage({ type: 'command', command }).catch(() => {
    // Popup might not be open, silently ignore
  });
});
