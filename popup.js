import RadialMenu from './modules/radialMenu.js';
import ColorPicker from './modules/colorPicker.js';
import { downloadAsText } from './modules/downloadHelper.js';
import FontManager from './modules/fontManager.js';

const storageKey = 'quickNotepadState';

const elements = {
  app: document.getElementById('app'),
  toolbar: document.getElementById('toolbar'),
  copyButton: document.getElementById('copyButton'),
  clearNoteButton: document.getElementById('clearNoteButton'),
  darkModeButton: document.getElementById('darkModeButton'),
  fontButton: document.getElementById('fontButton'),
  hyperlinkButton: document.getElementById('hyperlinkButton'),
  emojiButton: document.getElementById('emojiButton'),
  downloadButton: document.getElementById('downloadButton'),
  compactButton: document.getElementById('compactButton'),
  fontPanel: document.getElementById('fontPanel'),
  fontSizeControl: document.getElementById('fontSizeControl'),
  fontSizeValue: document.getElementById('fontSizeValue'),
  fontFamilySelect: document.getElementById('fontFamilySelect'),
  boldToggle: document.getElementById('boldToggle'),
  italicToggle: document.getElementById('italicToggle'),
  emojiPanel: document.getElementById('emojiPanel'),
  emojiGrid: document.getElementById('emojiGrid'),
  noteContainer: document.querySelector('.note-container'),
  noteArea: document.getElementById('noteArea'),
  linkOverlay: document.getElementById('linkOverlay'),
  radialMenu: document.getElementById('radialMenu'),
  colorPickerPanel: document.getElementById('colorPickerPanel'),
  hueControl: document.getElementById('hueControl'),
  saturationControl: document.getElementById('saturationControl'),
  lightnessControl: document.getElementById('lightnessControl'),
  currentHex: document.getElementById('currentHex'),
  closeColorPicker: document.getElementById('closeColorPicker'),
  storageUsage: document.getElementById('storageUsage'),
  clearStorageButton: document.getElementById('clearStorageButton'),
  confirmOverlay: document.getElementById('confirmOverlay'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmAcceptButton: document.getElementById('confirmAcceptButton'),
  confirmCancelButton: document.getElementById('confirmCancelButton')
};

const emojiList = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '🤓', '😎', '🤩', '🥳',
  '😌', '🤔', '😴', '😇', '🙌', '👏', '👍', '🔥', '✨', '🌈',
  '📌', '📝', '✅', '⚡', '💡', '📎', '🔖', '📚', '⏰', '🎯',
  '🧠', '💭', '🛠️', '🎶', '🍀', '🌟', '🚀', '🧭', '📍', '💬'
];

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

let state = structuredClone(defaultState);
let saveTimer = null;
let pendingConfirmation = null;
let confirmationRestoreTarget = null;

const NOTE_TEXT_LIGHT = '#09121d';
const NOTE_TEXT_DARK = '#33ff80';
const NOTE_SELECTION_LIGHT = 'rgba(12, 30, 54, 0.3)';
const NOTE_SELECTION_DARK = 'rgba(51, 255, 128, 0.45)';
const NOTE_SELECTION_TEXT_LIGHT = '#09121d';
const NOTE_SELECTION_TEXT_DARK = '#041407';

const fontManager = new FontManager({
  noteArea: elements.noteArea,
  overlay: elements.linkOverlay,
  controls: {
    size: elements.fontSizeControl,
    sizeIndicator: elements.fontSizeValue,
    family: elements.fontFamilySelect,
    bold: elements.boldToggle,
    italic: elements.italicToggle
  },
  onChange: handleFontChange
});

const colorPicker = new ColorPicker({
  panel: elements.colorPickerPanel,
  controls: {
    hue: elements.hueControl,
    saturation: elements.saturationControl,
    lightness: elements.lightnessControl,
    hexLabel: elements.currentHex,
    closeButton: elements.closeColorPicker
  },
  onChange: handleColorChange,
  onClose: () => {
    elements.noteArea.focus();
  }
});

const radialMenu = new RadialMenu({
  trigger: elements.noteArea,
  menu: elements.radialMenu,
  onAction: handleRadialAction
});

init();

async function init() {
  renderEmojiButtons();
  bindEvents();
  await hydrateState();
  await updateStorageUsage();
  elements.noteArea.addEventListener('scroll', syncOverlayScroll);
  syncOverlayScroll();
}

function renderEmojiButtons() {
  const fragment = document.createDocumentFragment();
  emojiList.forEach((emoji, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'emoji-btn';
    button.textContent = emoji;
    button.setAttribute('aria-label', `Insert emoji ${emoji}`);
    button.setAttribute('role', 'gridcell');
    button.dataset.index = String(index);
    button.addEventListener('click', () => insertEmoji(emoji));
    fragment.appendChild(button);
  });
  elements.emojiGrid.textContent = '';
  elements.emojiGrid.appendChild(fragment);
}

async function hydrateState() {
  try {
    const stored = await chrome.storage.local.get(storageKey);
    state = {
      ...structuredClone(defaultState),
      ...(stored?.[storageKey] ?? {})
    };
  } catch (error) {
    console.warn('Quick Notepad: unable to load previous state', error);
    state = structuredClone(defaultState);
  }

  applyStateToUI();
}

function applyStateToUI() {
  elements.noteArea.value = state.note;
  toggleHyperlinks(state.hyperlinks, { skipSave: true });

  elements.compactButton.setAttribute('aria-pressed', String(state.compactMode));
  setCompactMode(state.compactMode, { skipSave: true });

  setDarkMode(state.darkMode, { skipSave: true });

  fontManager.apply(state.font);

  colorPicker.apply(state.backgroundColor);
  applyBackgroundColor(state.backgroundColor);
}

function bindEvents() {
  elements.copyButton.addEventListener('click', copyAll);
  elements.clearNoteButton.addEventListener('click', clearNote);
  elements.darkModeButton.addEventListener('click', () => toggleDarkMode());
  elements.fontButton.addEventListener('click', toggleFontPanel);
  elements.hyperlinkButton.addEventListener('click', () => toggleHyperlinks());
  elements.emojiButton.addEventListener('click', toggleEmojiPanel);
  elements.downloadButton.addEventListener('click', downloadNote);
  elements.compactButton.addEventListener('click', () => setCompactMode(!state.compactMode));
  elements.clearStorageButton.addEventListener('click', clearStoredData);
  elements.noteArea.addEventListener('input', handleNoteChange);
  elements.confirmAcceptButton?.addEventListener('click', () => resolveConfirmation(true));
  elements.confirmCancelButton?.addEventListener('click', () => resolveConfirmation(false));
  elements.confirmOverlay?.addEventListener('click', handleConfirmOverlayClick);
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeyDown);
}

function handleFontChange(fontState) {
  state.font = fontState;
  scheduleSave({ font: state.font });
}

function handleColorChange(colorState) {
  state.backgroundColor = colorState;
  applyBackgroundColor(colorState);
  scheduleSave({ backgroundColor: state.backgroundColor });
}

function handleRadialAction(action) {
  switch (action) {
    case 'copy-all':
      copyAll();
      break;
    case 'cut-all':
      cutAll();
      break;
    case 'download':
      downloadNote();
      break;
    case 'color':
      colorPicker.toggle({ anchor: radialMenu.getPosition() });
      break;
    default:
      break;
  }
}

function handleNoteChange(event) {
  state.note = event.target.value;
  scheduleSave({ note: state.note });
  if (state.hyperlinks) {
    updateLinkOverlay(state.note);
  }
}

function scheduleSave(partial) {
  state = { ...state, ...partial };
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(async () => {
    try {
      await chrome.storage.local.set({ [storageKey]: state });
      await updateStorageUsage();
    } catch (error) {
      console.warn('Quick Notepad: failed to save state', error);
    } finally {
      saveTimer = null;
    }
  }, 200);
}

async function copyAll() {
  const text = elements.noteArea.value;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      elements.noteArea.select();
      document.execCommand('copy');
    }
  } catch (error) {
    console.warn('Quick Notepad: copy failed', error);
  }
}

async function cutAll() {
  await copyAll();
  performClearNote();
}

function clearNote() {
  const hasContent = elements.noteArea.value.trim().length > 0;
  if (hasContent) {
    showConfirmation({
      message: 'Clear the current note? This action cannot be undone.',
      confirmLabel: 'Clear Note',
      onConfirm: performClearNote
    });
    return;
  }
  performClearNote();
}

function downloadNote() {
  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
  const filename = `quick-note-${timestamp}.txt`;
  downloadAsText(filename, elements.noteArea.value).catch(error => {
    console.warn('Quick Notepad: download failed', error);
  });
}

function toggleDarkMode(forceState) {
  const next = typeof forceState === 'boolean' ? forceState : !state.darkMode;
  setDarkMode(next);
}

function setDarkMode(isDark, options = {}) {
  state.darkMode = isDark;
  elements.app.classList.toggle('theme-dark', isDark);
  elements.app.classList.toggle('theme-light', !isDark);
  document.body.classList.toggle('body-dark', isDark);
  if (elements.darkModeButton) {
    elements.darkModeButton.setAttribute('aria-pressed', String(isDark));
  }
  applyBackgroundColor(state.backgroundColor);
  if (!options.skipSave) {
    scheduleSave({ darkMode: state.darkMode });
  }
}

function toggleFontPanel() {
  const isExpanded = elements.fontButton.getAttribute('aria-expanded') === 'true';
  const next = !isExpanded;
  elements.fontButton.setAttribute('aria-expanded', String(next));
  elements.fontPanel.classList.toggle('hidden', !next);
  if (next) {
    elements.emojiPanel.classList.add('hidden');
    elements.emojiButton.setAttribute('aria-expanded', 'false');
  }
}

function toggleEmojiPanel() {
  const isExpanded = elements.emojiButton.getAttribute('aria-expanded') === 'true';
  const next = !isExpanded;
  elements.emojiButton.setAttribute('aria-expanded', String(next));
  elements.emojiPanel.classList.toggle('hidden', !next);
  if (next) {
    elements.fontPanel.classList.add('hidden');
    elements.fontButton.setAttribute('aria-expanded', 'false');
  }
}

function toggleHyperlinks(forceState, options = {}) {
  const next = typeof forceState === 'boolean' ? forceState : !state.hyperlinks;
  state.hyperlinks = next;
  elements.hyperlinkButton.setAttribute('aria-pressed', String(next));
  if (next) {
    updateLinkOverlay(state.note);
  } else {
    elements.linkOverlay.classList.remove('active');
    elements.linkOverlay.innerHTML = '';
  }
  if (!options.skipSave) {
    scheduleSave({ hyperlinks: state.hyperlinks });
  }
}

function setCompactMode(forceState, options = {}) {
  const next = typeof forceState === 'boolean' ? forceState : !state.compactMode;
  state.compactMode = next;
  elements.toolbar.classList.toggle('toolbar-compact', next);
  elements.compactButton.setAttribute('aria-pressed', String(next));
  if (!options.skipSave) {
    scheduleSave({ compactMode: state.compactMode });
  }
}

function insertEmoji(emoji) {
  const { selectionStart, selectionEnd, value } = elements.noteArea;
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const nextValue = `${before}${emoji}${after}`;
  elements.noteArea.value = nextValue;
  const nextCursor = before.length + emoji.length;
  elements.noteArea.focus();
  elements.noteArea.setSelectionRange(nextCursor, nextCursor);
  handleNoteChange({ target: elements.noteArea });
}

function updateLinkOverlay(text) {
  if (!state.hyperlinks) {
    return;
  }
  if (!text.trim()) {
    elements.linkOverlay.innerHTML = '';
    elements.linkOverlay.classList.remove('active');
    return;
  }
  const escaped = escapeHTML(text);
  const linked = escaped.replace(urlRegex, match => {
    const href = match.startsWith('http') ? match : `https://${match}`;
    return `<a href=\"${href}\" target=\"_blank\" rel=\"noopener noreferrer\">${match}</a>`;
  });
  elements.linkOverlay.innerHTML = linked;
  elements.linkOverlay.classList.add('active');
  syncOverlayScroll();
}

const urlRegex = /\b((?:https?:\/\/)|(?:www\.))[^\s<]+/gi;

function escapeHTML(value) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return value.replace(/[&<>"']/g, char => map[char]);
}

function syncOverlayScroll() {
  elements.linkOverlay.scrollTop = elements.noteArea.scrollTop;
  elements.linkOverlay.scrollLeft = elements.noteArea.scrollLeft;
}

function handleDocumentClick(event) {
  if (isConfirmationOpen()) {
    return;
  }
  if (!elements.fontPanel.classList.contains('hidden') && !elements.fontPanel.contains(event.target) && event.target !== elements.fontButton) {
    elements.fontPanel.classList.add('hidden');
    elements.fontButton.setAttribute('aria-expanded', 'false');
  }
  if (!elements.emojiPanel.classList.contains('hidden') && !elements.emojiPanel.contains(event.target) && event.target !== elements.emojiButton) {
    elements.emojiPanel.classList.add('hidden');
    elements.emojiButton.setAttribute('aria-expanded', 'false');
  }
  if (
    !elements.colorPickerPanel.classList.contains('hidden') &&
    !elements.colorPickerPanel.contains(event.target) &&
    !elements.radialMenu.contains(event.target)
  ) {
    colorPicker.hide();
  }
}

function handleKeyDown(event) {
  if (isConfirmationOpen()) {
    if (event.key === 'Escape') {
      resolveConfirmation(false);
      event.preventDefault();
    }
    return;
  }
  if (event.key === 'Escape') {
    if (!elements.fontPanel.classList.contains('hidden')) {
      elements.fontPanel.classList.add('hidden');
      elements.fontButton.setAttribute('aria-expanded', 'false');
    }
    if (!elements.emojiPanel.classList.contains('hidden')) {
      elements.emojiPanel.classList.add('hidden');
      elements.emojiButton.setAttribute('aria-expanded', 'false');
    }
    colorPicker.hide();
  }
}

function applyBackgroundColor(color) {
  const hsl = `hsl(${color.h} ${color.s}% ${color.l}%)`;
  const isDark = Boolean(state.darkMode);
  const background = isDark ? '#000000' : hsl;
  elements.noteArea.style.backgroundColor = background;
  elements.linkOverlay.style.backgroundColor = background;
  if (elements.noteContainer) {
    elements.noteContainer.style.backgroundColor = isDark ? '#000000' : '';
  }
  elements.currentHex.textContent = isDark ? '#000000' : color.hex;
  updateNoteContrast();
}

function clearStoredData() {
  showConfirmation({
    message: 'Reset all saved Quick Notepad data including note contents and preferences?',
    confirmLabel: 'Clear Data',
    onConfirm: async () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      try {
        await chrome.storage.local.remove(storageKey);
        state = structuredClone(defaultState);
        applyStateToUI();
        await chrome.storage.local.set({ [storageKey]: state });
      } catch (error) {
        console.warn('Quick Notepad: failed to reset state', error);
      } finally {
        updateStorageUsage();
      }
    }
  });
}

function updateNoteContrast() {
  if (!elements.noteArea || !elements.linkOverlay) {
    return;
  }
  const lightness = Number(state.backgroundColor?.l);
  const isDarkBackground = state.darkMode || (Number.isFinite(lightness) ? lightness < 55 : false);
  const textColor = isDarkBackground ? NOTE_TEXT_DARK : NOTE_TEXT_LIGHT;
  const selectionBg = isDarkBackground ? NOTE_SELECTION_DARK : NOTE_SELECTION_LIGHT;
  const selectionText = isDarkBackground ? NOTE_SELECTION_TEXT_DARK : NOTE_SELECTION_TEXT_LIGHT;

  elements.noteArea.style.setProperty('--note-text-color', textColor);
  elements.noteArea.style.setProperty('--note-text-highlight', textColor);
  elements.noteArea.style.setProperty('--note-selection-bg', selectionBg);
  elements.noteArea.style.setProperty('--note-selection-text', selectionText);
  elements.noteArea.style.color = textColor;
  elements.noteArea.style.caretColor = textColor;

  elements.linkOverlay.style.setProperty('--note-text-color', textColor);
  elements.linkOverlay.style.color = textColor;
}

async function updateStorageUsage() {
  if (!elements.storageUsage) {
    return;
  }
  try {
    const bytes = await getBytesInUse();
    elements.storageUsage.textContent = `Storage: ${formatBytes(bytes)}`;
  } catch (error) {
    console.warn('Quick Notepad: unable to read storage usage', error);
    elements.storageUsage.textContent = 'Storage: n/a';
  }
}

function getBytesInUse() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.getBytesInUse(storageKey, bytes => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(typeof bytes === 'number' ? bytes : 0);
    });
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  if (unitIndex === 0) {
    return `${Math.round(value)} ${units[unitIndex]}`;
  }
  const precision = value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function performClearNote() {
  elements.noteArea.value = '';
  state.note = '';
  scheduleSave({ note: state.note });
  updateLinkOverlay('');
  elements.noteArea.focus();
}

function showConfirmation({ message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm }) {
  if (!elements.confirmOverlay || !elements.confirmMessage || !elements.confirmAcceptButton || !elements.confirmCancelButton) {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    return;
  }

  if (isConfirmationOpen()) {
    resolveConfirmation(false);
  }

  pendingConfirmation = {
    onConfirm: typeof onConfirm === 'function' ? onConfirm : null
  };
  elements.confirmMessage.textContent = message;
  elements.confirmAcceptButton.textContent = confirmLabel;
  elements.confirmCancelButton.textContent = cancelLabel;
  elements.confirmOverlay.classList.remove('hidden');
  elements.confirmOverlay.setAttribute('aria-hidden', 'false');

  confirmationRestoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  requestAnimationFrame(() => {
    elements.confirmAcceptButton.focus();
  });
}

function resolveConfirmation(accepted) {
  if (!isConfirmationOpen()) {
    return;
  }
  const action = pendingConfirmation?.onConfirm ?? null;
  pendingConfirmation = null;
  hideConfirmation();
  if (accepted && typeof action === 'function') {
    Promise.resolve()
      .then(action)
      .catch(error => {
        console.warn('Quick Notepad: confirmation action failed', error);
      });
  }
}

function hideConfirmation() {
  if (!elements.confirmOverlay) {
    return;
  }
  elements.confirmOverlay.classList.add('hidden');
  elements.confirmOverlay.setAttribute('aria-hidden', 'true');
  if (confirmationRestoreTarget && typeof confirmationRestoreTarget.focus === 'function') {
    confirmationRestoreTarget.focus();
  }
  confirmationRestoreTarget = null;
}

function isConfirmationOpen() {
  return Boolean(elements.confirmOverlay && !elements.confirmOverlay.classList.contains('hidden'));
}

function handleConfirmOverlayClick(event) {
  if (event.target === elements.confirmOverlay) {
    resolveConfirmation(false);
  }
}
