const storageKey = 'quickNotepadState';

const defaultState = {
  note: '',
  theme: 'default_bright',
  font: {
    size: 16,
    family: 'Inter, sans-serif',
    weight: 'normal',
    style: 'normal'
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const stored = await chrome.storage.local.get(storageKey);
    if (!stored[storageKey]) {
      await chrome.storage.local.set({ [storageKey]: defaultState });
    }
  } catch (error) {
    console.error('Quick Notepad: unable to seed default state', error);
  }
});
