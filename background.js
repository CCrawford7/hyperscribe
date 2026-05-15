import StorageRepository from './modules/storageRepository.js';
import MigrationManager, { CURRENT_VERSION } from './modules/migrationManager.js';

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const storedState = await StorageRepository.getState();
    const migrationManager = new MigrationManager();

    if (!storedState) {
      // Fresh install: seed defaults from scratch
      const defaultState = migrationManager.runMigrations({}, 0, CURRENT_VERSION);
      await StorageRepository.saveState(defaultState);
    } else {
      // Upgrade: run migrations if stored version is behind
      const storedVersion = storedState.version || 0;
      if (storedVersion < CURRENT_VERSION) {
        const migratedState = migrationManager.runMigrations(
          storedState,
          storedVersion,
          CURRENT_VERSION
        );
        await StorageRepository.saveState(migratedState);
        console.log(
          `Hyperscribe: migrated state from v${storedVersion} to v${CURRENT_VERSION}`
        );
      }
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

// Handle messages from popup/sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'openSidePanel') {
    // Open side panel in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      if (tabs[0]) {
        try {
          await chrome.sidePanel.open({ windowId: tabs[0].windowId });
          sendResponse({ success: true });
        } catch (error) {
          console.error('Failed to open side panel:', error);
          sendResponse({ success: false, error: error.message });
        }
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'openFloatingWindow') {
    (async () => {
      try {
        const popupUrl = chrome.runtime.getURL('popup.html') + '?floating=true';
        const width = message.width || 480;
        const height = message.height || 600;
        const window = await chrome.windows.create({
          url: popupUrl,
          type: 'popup',
          width: Math.min(width, 800),
          height: Math.min(height, 600),
          focused: true
        });
        sendResponse({ success: true, windowId: window?.id });
      } catch (error) {
        console.error('Failed to open floating window:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
