import { downloadAsText } from './modules/downloadHelper.js';
import FontManager from './modules/fontManager.js';
import MarkdownPreview from './modules/markdownPreview.js';
import SearchReplaceManager from './modules/searchReplaceManager.js';

const THEMES = {
  default_bright: { label: 'Default Bright', mode: 'light', className: 'theme-default-bright' },
  default_dark: { label: 'Default Dark', mode: 'dark', className: 'theme-default-dark' },
  monokai: { label: 'Monokai', mode: 'dark', className: 'theme-monokai' },
  nord: { label: 'Nord', mode: 'dark', className: 'theme-nord' },
  dracula: { label: 'Dracula', mode: 'dark', className: 'theme-dracula' }
};

const storageKey = 'quickNotepadState';

const elements = {
  app: document.getElementById('app'),
  toolbar: document.getElementById('toolbar'),
  copyButton: document.getElementById('copyButton'),
  searchButton: document.getElementById('searchButton'),
  clearNoteButton: document.getElementById('clearNoteButton'),
  themeButton: document.getElementById('themeButton'),
  themePanel: document.getElementById('themePanel'),
  fontButton: document.getElementById('fontButton'),
  previewButton: document.getElementById('previewButton'),
  emojiButton: document.getElementById('emojiButton'),
  downloadButton: document.getElementById('downloadButton'),
  fontPanel: document.getElementById('fontPanel'),
  fontSizeControl: document.getElementById('fontSizeControl'),
  fontSizeValue: document.getElementById('fontSizeValue'),
  fontFamilySelect: document.getElementById('fontFamilySelect'),
  boldToggle: document.getElementById('boldToggle'),
  italicToggle: document.getElementById('italicToggle'),
  editorContainer: document.getElementById('editorContainer'),
  previewPane: document.getElementById('previewPane'),
  searchBar: document.getElementById('searchBar'),
  searchInput: document.getElementById('searchInput'),
  searchPrevButton: document.getElementById('searchPrev'),
  searchNextButton: document.getElementById('searchNext'),
  searchCount: document.getElementById('searchCount'),
  searchCloseButton: document.getElementById('searchClose'),
  toggleReplaceButton: document.getElementById('toggleReplace'),
  replaceControls: document.getElementById('replaceControls'),
  replaceInput: document.getElementById('replaceInput'),
  replaceButton: document.getElementById('replaceBtn'),
  replaceAllButton: document.getElementById('replaceAllBtn'),
  searchCaseSensitive: document.getElementById('searchCaseSensitive'),
  searchWholeWord: document.getElementById('searchWholeWord'),
  searchRegex: document.getElementById('searchRegex'),
  emojiPanel: document.getElementById('emojiPanel'),
  emojiGrid: document.getElementById('emojiGrid'),
  noteArea: document.getElementById('noteArea'),
  storageUsage: document.getElementById('storageUsage'),
  clearStorageButton: document.getElementById('clearStorageButton'),
  confirmOverlay: document.getElementById('confirmOverlay'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmAcceptButton: document.getElementById('confirmAcceptButton'),
  confirmCancelButton: document.getElementById('confirmCancelButton'),
  confirmDontAskCheckbox: document.getElementById('confirmDontAskCheckbox'),
  closePopupButton: document.getElementById('closePopupButton'),
  resizeHandle: document.getElementById('resizeHandle')
};

const themeChipButtons = Array.from(document.querySelectorAll('.theme-chip'));

const emojiList = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '🤓', '😎', '🤩', '🥳',
  '😌', '🤔', '😴', '😇', '🙌', '👏', '👍', '🔥', '✨', '🌈',
  '📌', '📝', '✅', '⚡', '💡', '📎', '🔖', '📚', '⏰', '🎯',
  '🧠', '💭', '🛠️', '🎶', '🍀', '🌟', '🚀', '🧭', '📍', '💬'
];

const defaultState = {
  note: '',
  theme: 'default_bright',
  suppressClearConfirm: false,
  font: {
    size: 16,
    family: 'Inter, sans-serif',
    weight: 'normal',
    style: 'normal'
  }
};

let state = structuredClone(defaultState);
let saveTimer = null;
let pendingConfirmation = null;
let confirmationRestoreTarget = null;
const RESIZE_MIN_WIDTH = 320;
const RESIZE_MIN_HEIGHT = 360;
const RESIZE_MAX_WIDTH = 640;
const RESIZE_MAX_HEIGHT = 720;
let resizeSession = null;

function resolveThemeId(storedState) {
  if (storedState && typeof storedState.theme === 'string' && storedState.theme in THEMES) {
    return storedState.theme;
  }
  if (storedState && typeof storedState.darkMode === 'boolean') {
    return storedState.darkMode ? 'default_dark' : 'default_bright';
  }
  return defaultState.theme;
}

const fontManager = new FontManager({
  noteArea: elements.noteArea,
  controls: {
    size: elements.fontSizeControl,
    sizeIndicator: elements.fontSizeValue,
    family: elements.fontFamilySelect,
    bold: elements.boldToggle,
    italic: elements.italicToggle
  },
  onChange: handleFontChange
});

const markdownPreview = new MarkdownPreview({
  textarea: elements.noteArea,
  preview: elements.previewPane,
  container: elements.editorContainer,
  onModeChange: updatePreviewButtonState
});

let previewMode = 'edit';

const searchManager = new SearchReplaceManager({
  textarea: elements.noteArea,
  searchBar: elements.searchBar,
  searchInput: elements.searchInput,
  replaceInput: elements.replaceInput,
  prevButton: elements.searchPrevButton,
  nextButton: elements.searchNextButton,
  closeButton: elements.searchCloseButton,
  replaceButton: elements.replaceButton,
  replaceAllButton: elements.replaceAllButton,
  toggleReplaceButton: elements.toggleReplaceButton,
  replaceControls: elements.replaceControls,
  countLabel: elements.searchCount,
  caseSensitiveToggle: elements.searchCaseSensitive,
  wholeWordToggle: elements.searchWholeWord,
  regexToggle: elements.searchRegex,
  onVisibilityChange: visible => {
    elements.searchButton?.classList.toggle('is-active', visible);
    elements.searchButton?.setAttribute('aria-pressed', String(visible));
    if (visible && previewMode === 'preview') {
      // ensure editing context visible for replacements
      previewMode = 'split';
      markdownPreview.setMode(previewMode);
    }
  }
});

init();

async function init() {
  renderEmojiButtons();
  updatePreviewButtonState(previewMode);
  bindEvents();
  await hydrateState();
  await updateStorageUsage();
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
    const storedState = stored?.[storageKey] ?? {};
    const theme = resolveThemeId(storedState);
    const { darkMode: _darkMode, compactMode: _compactMode, backgroundColor: _backgroundColor, ...legacyRest } = storedState ?? {};
    state = {
      ...structuredClone(defaultState),
      ...legacyRest,
      theme
    };
  } catch (error) {
    console.warn('Quick Notepad: unable to load previous state', error);
    state = structuredClone(defaultState);
  }

  applyStateToUI();
}

function applyStateToUI() {
  elements.noteArea.value = state.note;

  setTheme(state.theme, { skipSave: true });

  fontManager.apply(state.font);
  markdownPreview.updatePreview();
}

function bindEvents() {
  elements.copyButton.addEventListener('click', copyAll);
  elements.searchButton?.addEventListener('click', () => toggleSearchBar(false));
  elements.clearNoteButton.addEventListener('click', clearNote);
  elements.themeButton?.addEventListener('click', toggleThemePanel);
  themeChipButtons.forEach(button => {
    button.addEventListener('click', () => handleThemeSelection(button.dataset.theme));
  });
  elements.fontButton.addEventListener('click', toggleFontPanel);
  elements.previewButton?.addEventListener('click', togglePreviewMode);
  elements.emojiButton.addEventListener('click', toggleEmojiPanel);
  elements.downloadButton.addEventListener('click', downloadNote);
  elements.clearStorageButton.addEventListener('click', clearStoredData);
  elements.noteArea.addEventListener('input', handleNoteChange);
  elements.closePopupButton?.addEventListener('click', () => window.close());
  elements.resizeHandle?.addEventListener('pointerdown', startResize);
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

function togglePreviewMode() {
  previewMode = markdownPreview.cycleMode();
  updatePreviewButtonState(previewMode);
}

function updatePreviewButtonState(mode) {
  if (!elements.previewButton) {
    return;
  }
  const labels = {
    edit: 'Markdown preview disabled',
    split: 'Markdown preview (split view)',
    preview: 'Markdown preview only'
  };
  const descriptor = labels[mode] ?? 'Markdown preview';
  elements.previewButton.setAttribute('data-tooltip', descriptor);
  elements.previewButton.setAttribute('aria-label', descriptor);
  elements.previewButton.dataset.mode = mode;
  elements.previewButton.classList.toggle('is-active', mode !== 'edit');
}

function toggleSearchBar(withReplace = false) {
  const isOpen = elements.searchBar && !elements.searchBar.classList.contains('hidden');
  if (isOpen) {
    searchManager.close();
  } else {
    searchManager.open(withReplace);
  }
}

function toggleThemePanel() {
  if (!elements.themePanel || !elements.themeButton) {
    return;
  }
  const isExpanded = elements.themeButton.getAttribute('aria-expanded') === 'true';
  const next = !isExpanded;
  elements.themeButton.setAttribute('aria-expanded', String(next));
  elements.themePanel.classList.toggle('hidden', !next);
  elements.themePanel.setAttribute('aria-hidden', String(!next));
  if (next) {
    elements.fontPanel.classList.add('hidden');
    elements.fontButton.setAttribute('aria-expanded', 'false');
    elements.emojiPanel.classList.add('hidden');
    elements.emojiButton.setAttribute('aria-expanded', 'false');
    focusActiveThemeChip();
  } else {
    elements.themeButton.focus();
  }
}

function closeThemePanel() {
  if (!elements.themePanel) {
    return;
  }
  elements.themePanel.classList.add('hidden');
  elements.themePanel.setAttribute('aria-hidden', 'true');
  elements.themeButton?.setAttribute('aria-expanded', 'false');
}

function handleThemeSelection(themeId) {
  setTheme(themeId);
  closeThemePanel();
  elements.themeButton?.focus();
}

function updateThemeSelectionUI(themeId) {
  themeChipButtons.forEach(button => {
    const isActive = button.dataset.theme === themeId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function focusActiveThemeChip() {
  const active = themeChipButtons.find(button => button.classList.contains('is-active'));
  if (active) {
    active.focus();
    return;
  }
  if (themeChipButtons.length > 0) {
    themeChipButtons[0].focus();
  }
}

function handleNoteChange(event) {
  state.note = event.target.value;
  scheduleSave({ note: state.note });
  markdownPreview.scheduleUpdate();
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
  if (hasContent && !state.suppressClearConfirm) {
    showConfirmation({
      message: 'Clear the current note? This action cannot be undone.',
      confirmLabel: 'Clear Note',
      onConfirm: performClearNote,
      includeDontAsk: true
    });
    return;
  }
  performClearNote();
}

function downloadNote() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const filename = `hyprscr-${day}-${month}-${year}.txt`;
  downloadAsText(filename, elements.noteArea.value).catch(error => {
    console.warn('Quick Notepad: download failed', error);
  });
}

function setTheme(themeId, options = {}) {
  const fallbackId = themeId in THEMES ? themeId : defaultState.theme;
  const theme = THEMES[fallbackId];
  const baseClass = theme.mode === 'dark' ? 'theme-dark' : 'theme-light';
  const allThemeClasses = new Set(Object.values(THEMES).map(entry => entry.className));
  allThemeClasses.add('theme-dark');
  allThemeClasses.add('theme-light');

  if (elements.app) {
    allThemeClasses.forEach(cls => elements.app.classList.remove(cls));
    elements.app.classList.add(baseClass, theme.className);
  }

  allThemeClasses.forEach(cls => document.body.classList.remove(cls));
  document.body.classList.add(baseClass, theme.className);

  state.theme = fallbackId;
  updateThemeSelectionUI(state.theme);

  if (elements.themeButton) {
    const label = theme?.label ?? 'Theme';
    const tooltip = `Theme: ${label}`;
    elements.themeButton.setAttribute('data-tooltip', tooltip);
    elements.themeButton.setAttribute('aria-label', `Change theme (current: ${label})`);
    elements.themeButton.dataset.theme = fallbackId;
  }

  if (!options.skipSave) {
    scheduleSave({ theme: state.theme });
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
    closeThemePanel();
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
    closeThemePanel();
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
    elements.themePanel &&
    !elements.themePanel.classList.contains('hidden') &&
    !elements.themePanel.contains(event.target) &&
    event.target !== elements.themeButton
  ) {
    closeThemePanel();
  }
}

function startResize(event) {
  if (!elements.resizeHandle) {
    return;
  }
  if (event.button !== 0 && event.pointerType === 'mouse') {
    return;
  }
  const style = getComputedStyle(document.documentElement);
  const startWidth = parseFloat(style.getPropertyValue('--popup-width')) || document.documentElement.clientWidth;
  const startHeight = parseFloat(style.getPropertyValue('--popup-height')) || document.documentElement.clientHeight;
  resizeSession = {
    pointerId: event.pointerId,
    startX: event.screenX,
    startY: event.screenY,
    startWidth,
    startHeight
  };
  elements.resizeHandle.setPointerCapture?.(event.pointerId);
  document.addEventListener('pointermove', handleResizeMove);
  document.addEventListener('pointerup', endResize, { once: true });
  document.addEventListener('pointercancel', endResize, { once: true });
  event.preventDefault();
}

function handleResizeMove(event) {
  if (!resizeSession || (resizeSession.pointerId !== undefined && event.pointerId !== resizeSession.pointerId)) {
    return;
  }
  const deltaX = event.screenX - resizeSession.startX;
  const deltaY = event.screenY - resizeSession.startY;
  const targetWidth = Math.min(
    RESIZE_MAX_WIDTH,
    Math.max(RESIZE_MIN_WIDTH, resizeSession.startWidth + deltaX)
  );
  const targetHeight = Math.min(
    RESIZE_MAX_HEIGHT,
    Math.max(RESIZE_MIN_HEIGHT, resizeSession.startHeight + deltaY)
  );
  document.documentElement.style.setProperty('--popup-width', `${Math.round(targetWidth)}px`);
  document.documentElement.style.setProperty('--popup-height', `${Math.round(targetHeight)}px`);
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  event.preventDefault();
}

function endResize(event) {
  if (!resizeSession) {
    return;
  }
  if (elements.resizeHandle) {
    elements.resizeHandle.releasePointerCapture?.(resizeSession.pointerId);
  }
  document.removeEventListener('pointermove', handleResizeMove);
  document.removeEventListener('pointercancel', endResize);
  document.removeEventListener('pointerup', endResize);
  resizeSession = null;
  event.preventDefault();
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
    if (elements.themePanel && !elements.themePanel.classList.contains('hidden')) {
      closeThemePanel();
    }
  }
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
  elements.noteArea.focus();
}

function showConfirmation({ message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, includeDontAsk = false }) {
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
  if (elements.confirmDontAskCheckbox) {
    elements.confirmDontAskCheckbox.checked = false;
    elements.confirmDontAskCheckbox.parentElement.classList.toggle('hidden', !includeDontAsk);
  }
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
  const dontAsk = Boolean(elements.confirmDontAskCheckbox?.checked);
  pendingConfirmation = null;
  hideConfirmation();
  if (accepted && typeof action === 'function') {
    if (dontAsk) {
      state.suppressClearConfirm = true;
      scheduleSave({ suppressClearConfirm: true });
    }
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
