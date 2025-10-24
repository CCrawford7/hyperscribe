const storageKey = 'quickNotepadState';

const defaultState = {
  note: '',
  darkMode: false,
  compactMode: false,
  hyperlinks: false,
  font: {
    size: 16,
    family: 'Inter, sans-serif',
    weight: 'normal',
    style: 'normal'
  },
  backgroundColor: {
    h: 225,
    s: 70,
    l: 96,
    hex: '#eff3ff'
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
