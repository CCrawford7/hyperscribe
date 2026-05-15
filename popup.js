import { download } from './modules/downloadHelper.js';
import ExportFormatter from './modules/exportFormatter.js';
import FontManager from './modules/fontManager.js';
import StateManager from './modules/stateManager.js';
import ThemeManager from './modules/themeManager.js';
import ConfirmationDialog from './modules/confirmationDialog.js';
import PanelManager from './modules/panelManager.js';
import TemplateManager from './modules/templateManager.js';
import NotesManager from './modules/notesManager.js';
import SpellcheckManager from './modules/spellcheckManager.js';
import SpellcheckRenderer from './modules/spellcheckRenderer.js';
import ImageManager from './modules/imageManager.js';
import NoteTabManager from './modules/noteTabManager.js';
import StorageRepository from './modules/storageRepository.js';
import ImageStorage from './modules/imageStorage.js';
import DictationManager from './modules/dictationManager.js';
import {
  RESIZE_MIN_WIDTH,
  RESIZE_MIN_HEIGHT,
  RESIZE_MAX_WIDTH,
  RESIZE_MAX_HEIGHT
} from './shared/constants.js';

// Detect if running in side panel context
const isSidePanel = document.body.dataset.context === 'sidepanel';

const elements = {
  app: document.getElementById('app'),
  toolbar: document.getElementById('toolbar'),
  copyButton: document.getElementById('copyButton'),
  clearNoteButton: document.getElementById('clearNoteButton'),
  themeButton: document.getElementById('themeButton'),
  themePanel: document.getElementById('themePanel'),
  fontButton: document.getElementById('fontButton'),
  emojiButton: document.getElementById('emojiButton'),
  downloadButton: document.getElementById('downloadButton'),
  exportMenu: document.getElementById('exportMenu'),
  exportTemplateSelect: document.getElementById('exportTemplateSelect'),
  moreButton: document.getElementById('moreButton'),
  moreMenu: document.getElementById('moreMenu'),
  copyFormattedButton: document.getElementById('copyFormattedButton'),
  fontPanel: document.getElementById('fontPanel'),
  fontSizeControl: document.getElementById('fontSizeControl'),
  fontSizeValue: document.getElementById('fontSizeValue'),
  fontFamilySelect: document.getElementById('fontFamilySelect'),
  boldToggle: document.getElementById('boldToggle'),
  italicToggle: document.getElementById('italicToggle'),
  spellcheckToggle: document.getElementById('spellcheckToggle'),
  spellcheckLangSelect: document.getElementById('spellcheckLangSelect'),
  spellcheckHighlights: document.getElementById('spellcheckHighlights'),
  spellcheckContextMenu: document.getElementById('spellcheckContextMenu'),
  addToDictionaryBtn: document.getElementById('addToDictionaryBtn'),
  spellcheckSuggestions: document.getElementById('spellcheckSuggestions'),
  manageDictionaryBtn: document.getElementById('manageDictionaryBtn'),
  dictionaryPanel: document.getElementById('dictionaryPanel'),
  dictionaryWordList: document.getElementById('dictionaryWordList'),
  dictionaryCount: document.getElementById('dictionaryCount'),
  dictionaryEmpty: document.getElementById('dictionaryEmpty'),
  emojiPanel: document.getElementById('emojiPanel'),
  emojiGrid: document.getElementById('emojiGrid'),
  noteArea: document.getElementById('noteArea'),
  storageUsage: document.getElementById('storageUsage'),
  clearStorageButton: document.getElementById('clearStorageButton'),
  floatWindowButton: document.getElementById('floatWindowButton'),
  openSidePanelButton: document.getElementById('openSidePanelButton'),
  dictateButton: document.getElementById('dictateButton'),
  feedbackButton: document.getElementById('feedbackButton'),
  confirmOverlay: document.getElementById('confirmOverlay'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmAcceptButton: document.getElementById('confirmAcceptButton'),
  confirmCancelButton: document.getElementById('confirmCancelButton'),
  confirmDontAskCheckbox: document.getElementById('confirmDontAskCheckbox'),
  resizeHandle: document.getElementById('resizeHandle'),
  ariaLivePolite: document.getElementById('ariaLivePolite'),
  ariaLiveAssertive: document.getElementById('ariaLiveAssertive'),
  templateButton: document.getElementById('templateButton'),
  templatePanel: document.getElementById('templatePanel'),
  templateGrid: document.getElementById('templateGrid'),
  exportTemplatesButton: document.getElementById('exportTemplatesButton'),
  importTemplatesButton: document.getElementById('importTemplatesButton'),
  importTemplatesInput: document.getElementById('importTemplatesInput'),
  wordCount: document.getElementById('wordCount'),
  saveIndicator: document.getElementById('saveIndicator'),
  saveIndicatorText: document.querySelector('#saveIndicator .save-indicator-text'),
  exportSettingsButton: document.getElementById('exportSettingsButton'),
  importSettingsButton: document.getElementById('importSettingsButton'),
  importSettingsInput: document.getElementById('importSettingsInput'),
  templateDialog: document.getElementById('templateDialog'),
  createTemplateButton: document.getElementById('createTemplateButton'),
  templateDialogClose: document.getElementById('templateDialogClose'),
  templateDialogCancel: document.getElementById('templateDialogCancel'),
  templateDialogSave: document.getElementById('templateDialogSave'),
  templateNameInput: document.getElementById('templateNameInput'),
  templateIconInput: document.getElementById('templateIconInput'),
  templateDescriptionInput: document.getElementById('templateDescriptionInput'),
  templateContentInput: document.getElementById('templateContentInput'),
  noteTabs: document.getElementById('noteTabs'),
  noteTabList: document.getElementById('noteTabList'),
  addNoteTab: document.getElementById('addNoteTab'),
  exportTemplateDialog: document.getElementById('exportTemplateDialog'),
  exportTemplateDialogClose: document.getElementById('exportTemplateDialogClose'),
  exportTemplateDialogCancel: document.getElementById('exportTemplateDialogCancel'),
  exportTemplateDialogConfirm: document.getElementById('exportTemplateDialogConfirm'),
  exportTemplateList: document.getElementById('exportTemplateList'),
  exportTemplateSelectAll: document.getElementById('exportTemplateSelectAll'),
  // Image gallery elements
  imageGallery: document.getElementById('imageGallery'),
  imageGalleryGrid: document.getElementById('imageGalleryGrid'),
  addImageButton: document.getElementById('addImageButton'),
  // Error toast elements
  errorToast: document.getElementById('errorToast'),
  errorToastMessage: document.getElementById('errorToastMessage'),
  errorToastClose: document.getElementById('errorToastClose'),
  // Version display
  versionDisplay: document.getElementById('versionDisplay'),
  // Emoji search
  emojiSearch: document.getElementById('emojiSearch'),
  // Note search
  noteSearchBar: document.getElementById('noteSearchBar'),
  noteSearchInput: document.getElementById('noteSearchInput'),
  noteSearchResults: document.getElementById('noteSearchResults'),
  noteSearchPrev: document.getElementById('noteSearchPrev'),
  noteSearchNext: document.getElementById('noteSearchNext'),
  noteSearchClose: document.getElementById('noteSearchClose'),
  // Import note input
  importNoteInput: document.getElementById('importNoteInput'),
  // Template project name
  templateProjectName: document.getElementById('templateProjectName'),
  // Custom theme elements
  customThemeToggle: document.getElementById('customThemeToggle'),
  customThemeEditor: document.getElementById('customThemeEditor'),
  customThemeCss: document.getElementById('customThemeCss'),
  applyCustomThemeBtn: document.getElementById('applyCustomThemeBtn'),
  clearCustomThemeBtn: document.getElementById('clearCustomThemeBtn'),
  // Theme color picker elements
  colorBg: document.getElementById('colorBg'),
  colorPanel: document.getElementById('colorPanel'),
  colorText: document.getElementById('colorText'),
  colorAccent: document.getElementById('colorAccent'),
  colorBorder: document.getElementById('colorBorder'),
  colorNoteBg: document.getElementById('colorNoteBg'),
  applyThemeColorsBtn: document.getElementById('applyThemeColorsBtn'),
  resetThemeColorsBtn: document.getElementById('resetThemeColorsBtn'),
};

const themeChipButtons = Array.from(document.querySelectorAll('.theme-chip'));

const emojiList = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😌',
  '🤔',
  '😴',
  '😇',
  '🙌',
  '👏',
  '👍',
  '🔥',
  '✨',
  '🌈',
  '📌',
  '📝',
  '✅',
  '⚡',
  '💡',
  '📎',
  '🔖',
  '📚',
  '⏰',
  '🎯',
  '🧠',
  '💭',
  '🛠️',
  '🎶',
  '🍀',
  '🌟',
  '🚀',
  '🧭',
  '📍',
  '💬'
];

let resizeSession = null;
let stateManager;
let themeManager;
let confirmationDialog;
let panelManager;
let fontManager;
// let _emojiNavigationIndex = -1;
let templateManager;
let exportFormatter;
let spellcheckManager;
let spellcheckRenderer;
let noteTabManager;
let currentSpellcheckWord = null; // Currently right-clicked misspelled word
let isExportMenuOpen = false;
let isMoreMenuOpen = false;
const notesManager = new NotesManager();
let saveIndicatorTimeout = null;
let imageManager = null; // ImageManager instance for image support
let dictationManager = null; // DictationManager instance for speech-to-text

/**
 * Announce message to screen readers via ARIA live regions
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' (default) or 'assertive' for errors
 */
function announce(message, priority = 'polite') {
  const liveRegion =
    priority === 'assertive' ? elements.ariaLiveAssertive : elements.ariaLivePolite;
  if (!liveRegion) {
    return;
  }

  // Clear and set to trigger announcement
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
}

let errorToastTimeout = null;

/**
 * Show error toast notification
 * @param {string} message - Error message to display
 * @param {number} duration - Auto-hide duration in ms (default 5000, 0 for no auto-hide)
 */
function showErrorToast(message, duration = 5000) {
  if (!elements.errorToast || !elements.errorToastMessage) return;

  // Clear any existing timeout
  if (errorToastTimeout) {
    clearTimeout(errorToastTimeout);
    errorToastTimeout = null;
  }

  elements.errorToastMessage.textContent = message;
  elements.errorToast.classList.remove('hidden');
  elements.errorToast.setAttribute('aria-hidden', 'false');

  // Auto-hide after duration
  if (duration > 0) {
    errorToastTimeout = setTimeout(hideErrorToast, duration);
  }
}

/**
 * Hide error toast notification
 */
function hideErrorToast() {
  if (!elements.errorToast) return;

  elements.errorToast.classList.add('hidden');
  elements.errorToast.setAttribute('aria-hidden', 'true');

  if (errorToastTimeout) {
    clearTimeout(errorToastTimeout);
    errorToastTimeout = null;
  }
}

async function init() {
  stateManager = new StateManager({
    storageUsageElement: elements.storageUsage,
    onStateChange: handleStateChange
  });

  themeManager = new ThemeManager({
    appElement: elements.app,
    themeButton: elements.themeButton,
    themePanel: elements.themePanel,
    themeChips: themeChipButtons,
    onThemeChange: handleThemeChange
  });

  confirmationDialog = new ConfirmationDialog({
    overlay: elements.confirmOverlay,
    message: elements.confirmMessage,
    acceptButton: elements.confirmAcceptButton,
    cancelButton: elements.confirmCancelButton,
    dontAskCheckbox: elements.confirmDontAskCheckbox
  });

  panelManager = new PanelManager({
    font: { panel: elements.fontPanel, button: elements.fontButton },
    emoji: { panel: elements.emojiPanel, button: elements.emojiButton },
    theme: {
      panel: elements.themePanel,
      button: elements.themeButton,
      onOpen: () => themeManager.focusActiveChip()
    },
    template: {
      panel: elements.templatePanel,
      button: elements.templateButton
    }
  });

  fontManager = new FontManager({
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

  templateManager = new TemplateManager();
  exportFormatter = new ExportFormatter();

  // Initialize spellcheck
  spellcheckRenderer = new SpellcheckRenderer({
    highlightsElement: elements.spellcheckHighlights,
    textareaElement: elements.noteArea
  });

  spellcheckManager = new SpellcheckManager({
    editorElement: elements.noteArea,
    lang: 'en_US',
    onMisspelledWords: (words) => {
      spellcheckRenderer.updateHighlights(words);
    }
  });

  // Initialize spellcheck manager asynchronously (non-blocking for faster startup)
  spellcheckManager.initialize().catch(error => {
    console.error('Failed to initialize spellcheck:', error);
    // Disable spellcheck toggle if initialization failed
    if (elements.spellcheckToggle) {
      elements.spellcheckToggle.disabled = true;
      elements.spellcheckToggle.title = 'Spellcheck unavailable - dictionary failed to load';
    }
  });

  // Initialize dictation manager (only in side panel or if button exists)
  if (elements.dictateButton) {
    initDictation();
  }

  // Initialize note tab manager
  noteTabManager = new NoteTabManager({
    stateManager,
    notesManager,
    confirmationDialog,
    elements: {
      noteTabList: elements.noteTabList,
      noteTabs: elements.noteTabs,
      noteArea: elements.noteArea,
      addNoteTab: elements.addNoteTab
    },
    callbacks: {
      announce,
      updateWordCount,
      updateActiveNoteContent,
      renderImageGallery,
      clearSpellcheck: () => spellcheckRenderer?.clear(),
      recheckSpelling: () => {
        if (spellcheckManager?.isEnabled()) {
          spellcheckManager.checkText(true);
        } else if (spellcheckRenderer) {
          spellcheckRenderer.clear();
        }
      },
      onTabContextMenu: showTabContextMenu
    }
  });
  noteTabManager.init();

  renderEmojiButtons();
  await loadCustomTemplates();
  renderTemplates();
  bindEvents();
  initImageManager(); // Initialize image paste/drop support
  await hydrateState();
  // Load and apply previously saved custom theme CSS
  loadCustomThemeCss();
  // Load and apply previously saved theme colors
  loadThemeColors();
  // Populate more menu for responsive layout
  populateMoreMenu();
  // Initialize IndexedDB for images and render gallery
  await ImageStorage.init();
  await renderImageGallery();
  // Show combined storage usage
  await updateCombinedStorageUsage();

  // Listen for window resize in floating windows
  window.addEventListener('resize', handleWindowResize);

  // Save state immediately when popup closes to prevent data loss
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handleBeforeUnload);

  // Set version display from manifest
  if (elements.versionDisplay) {
    elements.versionDisplay.textContent = 'v' + (chrome.runtime.getManifest().version || '1.2.0');
  }

  // Listen for system color scheme changes
  setupSystemThemeListener();
}

/**
 * Handle popup close - force immediate save of pending state
 */
function handleBeforeUnload() {
  // Force immediate save without debounce
  if (stateManager) {
    stateManager.saveImmediate();
  }
}

let resizeDebounceTimer = null;
function handleWindowResize() {
  // Debounce resize events
  if (resizeDebounceTimer) {
    clearTimeout(resizeDebounceTimer);
  }
  resizeDebounceTimer = setTimeout(() => {
    chrome.windows.getCurrent((win) => {
      if (win && win.type === 'popup') {
        // Re-apply viewport sizing for floating window
        document.documentElement.style.setProperty('--popup-width', '100vw');
        document.documentElement.style.setProperty('--popup-height', '100vh');
      }
    });
  }, 100);
}

function populateMoreMenu() {
  const moreMenu = elements.moreMenu;
  if (!moreMenu) {
    return;
  }

  const collapsibleButtons = document.querySelectorAll('.toolbar-btn-collapsible');

  // Clear existing content
  moreMenu.innerHTML = '';

  // Clone each collapsible button into the menu
  collapsibleButtons.forEach(btn => {
    const clone = btn.cloneNode(true);
    clone.classList.remove('toolbar-btn-collapsible');
    clone.classList.add('more-menu-item');

    // Bind click handlers based on button ID
    const buttonId = btn.id;
    clone.addEventListener('click', e => {
      e.stopPropagation();

      // Call the appropriate handler based on button ID
      switch (buttonId) {
        case 'themeButton':
          panelManager.toggle('theme');
          break;
        case 'fontButton':
          panelManager.toggle('font');
          break;
        case 'emojiButton':
          panelManager.toggle('emoji');
          break;
        case 'templateButton':
          panelManager.toggle('template');
          break;
        case 'importNoteButton':
          importNoteFromFile();
          break;
      }

      closeMoreMenu();
    });

    moreMenu.appendChild(clone);
  });

  // Add import note as a dedicated item (not a collapsible button)
  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.className = 'more-menu-item toolbar-btn';
  importBtn.innerHTML = '<i class="codicon codicon-file-add" aria-hidden="true"></i><span class="label">Import Note</span>';
  importBtn.addEventListener('click', e => {
    e.stopPropagation();
    importNoteFromFile();
    closeMoreMenu();
  });
  moreMenu.appendChild(importBtn);
}

function toggleMoreMenu() {
  if (!elements.moreMenu || !elements.moreButton) {
    return;
  }

  isMoreMenuOpen = !isMoreMenuOpen;
  elements.moreButton.setAttribute('aria-expanded', String(isMoreMenuOpen));
  elements.moreMenu.classList.toggle('hidden', !isMoreMenuOpen);
  elements.moreMenu.setAttribute('aria-hidden', String(!isMoreMenuOpen));

  // Focus first item when opening
  if (isMoreMenuOpen) {
    const firstItem = elements.moreMenu.querySelector('.more-menu-item');
    if (firstItem) {
      firstItem.focus();
    }
  }
}

function closeMoreMenu() {
  if (!elements.moreMenu || !elements.moreButton || !isMoreMenuOpen) {
    return;
  }

  isMoreMenuOpen = false;
  elements.moreButton.setAttribute('aria-expanded', 'false');
  elements.moreMenu.classList.add('hidden');
  elements.moreMenu.setAttribute('aria-hidden', 'true');
}

/**
 * Handle keyboard navigation in more menu
 */
function handleMoreMenuKeyDown(event) {
  if (!isMoreMenuOpen) return;

  const menuItems = Array.from(elements.moreMenu.querySelectorAll('.more-menu-item'));
  const currentIndex = menuItems.indexOf(document.activeElement);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex < menuItems.length - 1) {
        menuItems[currentIndex + 1].focus();
      } else {
        menuItems[0].focus(); // Wrap to first
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex > 0) {
        menuItems[currentIndex - 1].focus();
      } else {
        menuItems[menuItems.length - 1].focus(); // Wrap to last
      }
      break;
    case 'Home':
      event.preventDefault();
      menuItems[0]?.focus();
      break;
    case 'End':
      event.preventDefault();
      menuItems[menuItems.length - 1]?.focus();
      break;
    case 'Escape':
      event.preventDefault();
      closeMoreMenu();
      elements.moreButton.focus();
      break;
    case 'Tab':
      // Close menu when tabbing out
      closeMoreMenu();
      break;
  }
}

function renderEmojiButtons() {
  const fragment = document.createDocumentFragment();
  emojiList.forEach((emoji, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'emoji-btn';
    button.textContent = emoji;
    button.setAttribute('aria-label', 'Insert emoji ' + emoji);
    button.setAttribute('role', 'gridcell');
    button.dataset.index = String(index);
    button.setAttribute('tabindex', '-1');
    button.addEventListener('click', () => insertEmoji(emoji));
    button.addEventListener('keydown', handleEmojiKeyDown);
    fragment.appendChild(button);
  });
  elements.emojiGrid.textContent = '';
  elements.emojiGrid.appendChild(fragment);

  // Set first emoji as focusable
  const firstEmoji = elements.emojiGrid.querySelector('.emoji-btn');
  if (firstEmoji) {
    firstEmoji.setAttribute('tabindex', '0');
  }
}

function renderTemplates() {
  const templates = templateManager.getTemplates();
  const fragment = document.createDocumentFragment();

  templates.forEach(template => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'template-item';

    // Add custom-template class for custom templates
    if (template.isCustom) {
      button.classList.add('custom-template');
    }

    button.dataset.templateId = template.id;
    button.setAttribute('aria-label', `Insert ${template.name} template`);

    const header = document.createElement('div');
    header.className = 'template-item-header';

    const icon = document.createElement('span');
    icon.className = 'template-icon';
    icon.textContent = template.icon;
    icon.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'template-name';
    name.textContent = template.name;

    header.appendChild(icon);
    header.appendChild(name);

    // Add delete button for custom templates
    if (template.isCustom) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'template-delete-btn';
      deleteBtn.setAttribute('aria-label', `Delete ${template.name} template`);
      deleteBtn.innerHTML = '<i class="codicon codicon-trash" aria-hidden="true"></i>';
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        handleDeleteTemplate(template.id);
      });
      header.appendChild(deleteBtn);
    }

    const description = document.createElement('span');
    description.className = 'template-description';
    description.textContent = template.description;

    button.appendChild(header);
    button.appendChild(description);
    button.addEventListener('click', () => handleTemplateSelect(template.id));

    fragment.appendChild(button);
  });

  elements.templateGrid.textContent = '';
  elements.templateGrid.appendChild(fragment);

  // Also update the export template selector
  populateExportTemplateSelector();
}

function populateExportTemplateSelector() {
  if (!elements.exportTemplateSelect) return;

  const templates = templateManager.getTemplates();

  // Clear existing options except the first "None" option
  while (elements.exportTemplateSelect.options.length > 1) {
    elements.exportTemplateSelect.remove(1);
  }

  // Add each template as an option
  templates.forEach(template => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = `${template.icon} ${template.name}`;
    elements.exportTemplateSelect.appendChild(option);
  });
}

function handleTemplateSelect(templateId) {
  try {
    const projectName = elements.templateProjectName?.value?.trim() || '';
    const variables = projectName ? { PROJECT_NAME: projectName } : {};
    const content = templateManager.applyTemplate(templateId, variables);
    elements.noteArea.value = content;
    handleNoteChange({ target: elements.noteArea });
    panelManager.close('template');
    elements.noteArea.focus();
    announce('Template applied');
  } catch (error) {
    console.warn('Hyperscribe: failed to apply template', error);
    announce('Unable to insert template', 'assertive');
  }
}

async function loadCustomTemplates() {
  try {
    const customTemplates = await StorageRepository.getCustomTemplates();
    templateManager.loadCustomTemplates(customTemplates);
  } catch (error) {
    console.warn('Hyperscribe: failed to load custom templates', error);
  }
}

async function saveCustomTemplates() {
  try {
    const customTemplates = templateManager.getCustomTemplates();
    await StorageRepository.saveCustomTemplates(customTemplates);
  } catch (error) {
    console.warn('Hyperscribe: failed to save custom templates', error);
  }
}

function openTemplateDialog() {
  if (!elements.templateDialog) {
    console.warn('Hyperscribe: templateDialog element not found');
    return;
  }

  // Clear form
  if (elements.templateNameInput) {
    elements.templateNameInput.value = '';
  }
  if (elements.templateIconInput) {
    elements.templateIconInput.value = '';
  }
  if (elements.templateDescriptionInput) {
    elements.templateDescriptionInput.value = '';
  }
  if (elements.templateContentInput) {
    elements.templateContentInput.value = '';
  }

  // Show dialog
  elements.templateDialog.classList.remove('hidden');
  elements.templateDialog.classList.remove('template-dialog-overlay');
  elements.templateDialog.setAttribute('aria-hidden', 'false');

  // Focus name input
  if (elements.templateNameInput) {
    elements.templateNameInput.focus();
  }
}

function closeTemplateDialog() {
  if (!elements.templateDialog) {
    return;
  }

  elements.templateDialog.classList.add('hidden');
  elements.templateDialog.classList.add('template-dialog-overlay');
  elements.templateDialog.setAttribute('aria-hidden', 'true');
}

async function handleSaveTemplate() {
  if (!elements.templateNameInput || !elements.templateContentInput) {
    console.warn('Hyperscribe: template form elements not found');
    return;
  }

  const name = elements.templateNameInput.value.trim();
  const content = elements.templateContentInput.value.trim();
  const icon = elements.templateIconInput?.value.trim() || '📄';
  const description = elements.templateDescriptionInput?.value.trim() || '';

  // Validate required fields
  if (!name || !content) {
    announce('Template name and content are required', 'assertive');
    return;
  }

  try {
    // Generate ID from name
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const template = {
      id,
      name,
      icon,
      description,
      content
    };

    templateManager.addTemplate(template);
    await saveCustomTemplates();
    renderTemplates();
    closeTemplateDialog();
    announce(`Template "${name}" created`);
  } catch (error) {
    console.warn('Hyperscribe: failed to create template', error);
    announce(error.message || 'Failed to create template', 'assertive');
  }
}

async function handleDeleteTemplate(templateId) {
  try {
    const template = templateManager.getTemplate(templateId);
    if (!template) {
      return;
    }

    const confirmed = await confirmationDialog.confirm(
      `Delete template "${template.name}"? This cannot be undone.`,
      { showDontAsk: false }
    );

    if (confirmed) {
      templateManager.removeTemplate(templateId);
      await saveCustomTemplates();
      renderTemplates();
      announce(`Template "${template.name}" deleted`);
    }
  } catch (error) {
    console.warn('Hyperscribe: failed to delete template', error);
    announce(error.message || 'Failed to delete template', 'assertive');
  }
}

function handleExportTemplates() {
  openExportTemplateDialog();
}

function openExportTemplateDialog() {
  // Only export custom templates, not built-in ones
  const customTemplates = templateManager.getCustomTemplates();

  if (customTemplates.length === 0) {
    announce('No custom templates to export', 'assertive');
    return;
  }

  if (!elements.exportTemplateDialog) {
    console.error('Export template dialog element not found');
    return;
  }

  // Populate the template list with custom templates only
  renderExportTemplateList(customTemplates);

  // Reset select all checkbox
  if (elements.exportTemplateSelectAll) {
    elements.exportTemplateSelectAll.checked = false;
  }

  // Show dialog
  elements.exportTemplateDialog.classList.remove('hidden');
  elements.exportTemplateDialog.setAttribute('aria-hidden', 'false');
}

function closeExportTemplateDialog() {
  if (!elements.exportTemplateDialog) return;

  elements.exportTemplateDialog.classList.add('hidden');
  elements.exportTemplateDialog.setAttribute('aria-hidden', 'true');
}

function renderExportTemplateList(templates) {
  if (!elements.exportTemplateList) return;

  elements.exportTemplateList.innerHTML = '';

  if (templates.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'export-template-empty';
    empty.textContent = 'No custom templates available';
    elements.exportTemplateList.appendChild(empty);
    return;
  }

  templates.forEach(template => {
    const item = document.createElement('label');
    item.className = 'export-template-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = template.id;
    checkbox.dataset.templateId = template.id;

    const info = document.createElement('div');
    info.className = 'export-template-item-info';

    const name = document.createElement('span');
    name.className = 'export-template-item-name';
    // Use DOM methods to prevent XSS
    const iconSpan = document.createElement('span');
    iconSpan.textContent = template.icon;
    name.appendChild(iconSpan);
    name.appendChild(document.createTextNode(' ' + template.name));

    const desc = document.createElement('span');
    desc.className = 'export-template-item-desc';
    desc.textContent = template.description || 'No description';

    info.appendChild(name);
    info.appendChild(desc);

    item.appendChild(checkbox);
    item.appendChild(info);

    elements.exportTemplateList.appendChild(item);
  });
}

function handleExportTemplateSelectAll(event) {
  const checked = event.target.checked;
  const checkboxes = elements.exportTemplateList?.querySelectorAll('input[type="checkbox"]');
  checkboxes?.forEach(cb => {
    cb.checked = checked;
  });
}

function performExportSelectedTemplates() {
  const checkboxes = elements.exportTemplateList?.querySelectorAll('input[type="checkbox"]:checked');
  if (!checkboxes || checkboxes.length === 0) {
    announce('Please select at least one template to export', 'assertive');
    return;
  }

  const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.templateId);
  const customTemplates = templateManager.getCustomTemplates();
  const selectedTemplates = customTemplates.filter(t => selectedIds.includes(t.id));

  if (selectedTemplates.length === 0) {
    announce('No templates selected', 'assertive');
    return;
  }

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    templates: selectedTemplates.map(t => ({
      name: t.name,
      icon: t.icon,
      description: t.description,
      content: t.content
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];

  const a = document.createElement('a');
  a.href = url;
  a.download = `hyperscribe-templates-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  closeExportTemplateDialog();
  announce(`Exported ${selectedTemplates.length} template${selectedTemplates.length === 1 ? '' : 's'}`);
}

// Validation constants for imports
const IMPORT_LIMITS = {
  MAX_TEMPLATE_NAME_LENGTH: 100,
  MAX_TEMPLATE_CONTENT_LENGTH: 50000,
  MAX_TEMPLATE_DESCRIPTION_LENGTH: 500,
  MAX_TEMPLATE_ICON_LENGTH: 10,
  MAX_TEMPLATES_COUNT: 100,
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

async function handleImportTemplates(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file size
  if (file.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
    announce('File too large. Maximum size is 5MB.', 'assertive');
    event.target.value = '';
    return;
  }

  showSaveIndicator('Importing...');

  try {
    const text = await file.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error('Invalid JSON format. Please check the file contents.');
    }

    // Validate data is an object
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid file format. Expected JSON object.');
    }

    // Validate structure
    if (!data.templates || !Array.isArray(data.templates)) {
      throw new Error('Invalid template file format. Missing templates array.');
    }

    // Limit number of templates
    if (data.templates.length > IMPORT_LIMITS.MAX_TEMPLATES_COUNT) {
      throw new Error(`Too many templates. Maximum is ${IMPORT_LIMITS.MAX_TEMPLATES_COUNT}.`);
    }

    // Validate each template with length limits
    const validTemplates = data.templates.filter(t => {
      // Basic type checks
      if (!t || typeof t !== 'object') return false;
      if (!t.name || typeof t.name !== 'string') return false;
      if (!t.content || typeof t.content !== 'string') return false;

      // Length validation
      if (t.name.length === 0 || t.name.length > IMPORT_LIMITS.MAX_TEMPLATE_NAME_LENGTH) return false;
      if (t.content.length > IMPORT_LIMITS.MAX_TEMPLATE_CONTENT_LENGTH) return false;

      // Optional field validation
      if (t.description && (typeof t.description !== 'string' || t.description.length > IMPORT_LIMITS.MAX_TEMPLATE_DESCRIPTION_LENGTH)) return false;
      if (t.icon && (typeof t.icon !== 'string' || t.icon.length > IMPORT_LIMITS.MAX_TEMPLATE_ICON_LENGTH)) return false;

      return true;
    });

    if (validTemplates.length === 0) {
      throw new Error('No valid templates found in file');
    }

    // Import templates
    let importedCount = 0;
    const skipped = [];
    for (const t of validTemplates) {
      try {
        // Generate ID from name (same logic as handleSaveTemplate)
        const id = t.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        templateManager.addTemplate({
          id,
          name: t.name,
          icon: t.icon || '📄',
          description: t.description || '',
          content: t.content
        });
        importedCount++;
      } catch (err) {
        // Template with same name may already exist, skip it
        skipped.push(t.name);
      }
    }

    if (importedCount > 0) {
      await saveCustomTemplates();
      renderTemplates();
      hideSaveIndicator({ delay: 800, message: 'Imported!' });
      announce(`Imported ${importedCount} template${importedCount === 1 ? '' : 's'}`);
    } else if (skipped.length > 0) {
      hideSaveIndicator({ delay: 800, message: 'Skipped' });
      announce(`Templates already exist: ${skipped.join(', ')}`, 'assertive');
    } else {
      hideSaveIndicator({ delay: 500, message: '' });
      announce('No new templates imported', 'assertive');
    }
  } catch (error) {
    console.error('Failed to import templates:', error);
    hideSaveIndicator({ delay: 800, message: 'Failed' });
    announce(error.message || 'Failed to import templates', 'assertive');
  } finally {
    // Reset file input so same file can be selected again
    event.target.value = '';
  }
}

async function hydrateState() {
  const state = await stateManager.init();
  applyStateToUI(state);
}

function toggleExportMenu(event) {
  event?.preventDefault();
  event?.stopPropagation();

  if (isExportMenuOpen) {
    closeExportMenu();
    return;
  }

  elements.exportMenu.classList.remove('hidden');
  elements.exportMenu.setAttribute('aria-hidden', 'false');
  elements.downloadButton.setAttribute('aria-expanded', 'true');
  isExportMenuOpen = true;

  // Focus first menu item for keyboard navigation
  const firstOption = elements.exportMenu.querySelector('.export-option');
  if (firstOption) {
    firstOption.focus();
  }
}

function closeExportMenu() {
  if (!isExportMenuOpen) {
    return;
  }
  elements.exportMenu.classList.add('hidden');
  elements.exportMenu.setAttribute('aria-hidden', 'true');
  elements.downloadButton.setAttribute('aria-expanded', 'false');
  isExportMenuOpen = false;
}

/**
 * Handle keyboard navigation in export menu
 */
function handleExportMenuKeyDown(event) {
  if (!isExportMenuOpen) return;

  const menuItems = Array.from(elements.exportMenu.querySelectorAll('.export-option'));
  const currentIndex = menuItems.indexOf(document.activeElement);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex < menuItems.length - 1) {
        menuItems[currentIndex + 1].focus();
      } else {
        menuItems[0].focus(); // Wrap to first
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex > 0) {
        menuItems[currentIndex - 1].focus();
      } else {
        menuItems[menuItems.length - 1].focus(); // Wrap to last
      }
      break;
    case 'Home':
      event.preventDefault();
      menuItems[0]?.focus();
      break;
    case 'End':
      event.preventDefault();
      menuItems[menuItems.length - 1]?.focus();
      break;
    case 'Escape':
      event.preventDefault();
      closeExportMenu();
      elements.downloadButton.focus();
      break;
    case 'Enter':
    case ' ':
      // Let the click handler handle it
      break;
    case 'Tab':
      // Close menu when tabbing out
      closeExportMenu();
      break;
  }
}

function handleExportMenuClick(event) {
  const option = event.target.closest('.export-option');
  if (!option) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (option.id === 'copyFormattedButton') {
    copyFormattedContent();
    closeExportMenu();
    return;
  }

  const format = option.dataset.format;
  if (format) {
    exportNote(format);
  }

  closeExportMenu();
}

function handleDocumentClickForMenus(event) {
  if (isExportMenuOpen) {
    const clickInsideMenu = elements.exportMenu.contains(event.target);
    const clickOnButton = elements.downloadButton.contains(event.target);
    if (!clickInsideMenu && !clickOnButton) {
      closeExportMenu();
    }
  }
}

async function exportNote(format, { silent = false } = {}) {
  let content = elements.noteArea.value;

  // Check if a template is selected for export
  const selectedTemplateId = elements.exportTemplateSelect?.value;
  if (selectedTemplateId) {
    content = applyExportTemplate(content, selectedTemplateId);
  }

  const metadata = collectExportMetadata(content);
  const filename = buildExportFilename(format, metadata.title);

  let formattedContent = content;

  switch (format) {
    case 'md': {
      // Include images as Markdown image references
      const imageMd = await getImageMarkdownForExport();
      const contentWithImages = content + (imageMd ? '\n\n' + imageMd : '');
      formattedContent = exportFormatter.formatAsMarkdown(contentWithImages, metadata, true);
      break;
    }
    case 'html': {
      // Include inline images in HTML export
      const imageHtml = await getImageTagsForExport();
      const contentWithImages = content + (imageHtml ? '\n' + imageHtml : '');
      formattedContent = exportFormatter.formatAsHTML(contentWithImages, metadata, true);
      break;
    }
    case 'pdf':
      exportAsPdf(content, metadata, filename);
      return; // PDF export is async via print dialog, returns immediately
    default: {
      // TXT export: embed images as base64 blocks at the end of the file
      const imageBlocks = await getImageTextBlocks();
      const contentWithImages = content + (imageBlocks ? '\n\n---\n\n' + imageBlocks : '');
      formattedContent = exportFormatter.formatAsText(contentWithImages, metadata, true);
      format = 'txt';
      break;
    }
  }

  download(filename, formattedContent, format).then(
    () => {
      if (!silent) {
        announce(`Note downloaded as ${filename}`);
      }
    },
    error => {
      console.warn('Hyperscribe: export failed', error);
      announce('Failed to download note', 'assertive');
    }
  );
}

/**
 * Export note content as PDF via browser print-to-PDF.
 * Opens the print dialog with the note rendered in a styled document,
 * including any embedded images. The user selects "Save as PDF" in the dialog.
 * @param {string} content - The note text content
 * @param {Object} metadata - Note metadata (title, date, etc.)
 * @param {string} filename - Suggested filename for the PDF
 */
async function exportAsPdf(content, metadata, filename) {
  try {
    // Build the print HTML with all styles inline
    const title = metadata.title || 'Note';
    const lines = content.split('\n');
    const bodyHtml = lines.map(line => {
      if (line.trim() === '') return '<p><br></p>';
      return '<p>' + escapeHtml(line) + '</p>';
    }).join('\n');

    // Fetch images for this note and include them
    const imageTags = await getImageTagsForExport();

    const css = `@page { margin: 20mm; size: A4; }
* { box-sizing: border-box; }
body { font-family: 'Fira Code', 'Courier New', monospace; font-size: 12px; line-height: 1.6; color: #1a1a1a; background: #fff; padding: 20mm; margin: 0; }
.pdf-header { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 16px; }
.pdf-header h1 { font-size: 18px; margin: 0 0 4px 0; color: #000; }
.pdf-meta { font-size: 10px; color: #666; }
.pdf-content p { margin: 0 0 4px 0; white-space: pre-wrap; word-wrap: break-word; }
.pdf-content img { max-width: 100%; height: auto; margin: 8px 0; }
@media print { body { padding: 0; } }`;

    const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8"/>\n<title>' + escapeHtml(title) + '</title>\n<style>' + css + '</style>\n</head>\n<body>\n<div class="pdf-header">\n<h1>' + escapeHtml(title) + '</h1>\n<div class="pdf-meta">' + escapeHtml(metadata.date || new Date().toLocaleDateString()) + '</div>\n</div>\n<div class="pdf-content">' + bodyHtml + imageTags + '</div>\n<script>window.onload=function(){setTimeout(function(){window.print()},500)};window.onafterprint=function(){window.close()};<\/script>\n</body>\n</html>';

    // Create a Blob and open in a new window (reliable across CSP contexts)
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank', 'width=800,height=600,scrollbars=yes');

    if (!printWindow) {
      // Popup blocked - fallback: trigger download of the HTML file
      announce('Popup blocked. Please allow popups for PDF export.', 'assertive');
      // Try download as fallback
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename.replace(/\.pdf$/, '.html') + '.html';
      a.click();
    }

    // Clean up the blob URL after the window loads
    setTimeout(() => {
      try { URL.revokeObjectURL(blobUrl); } catch(e) {}
    }, 10000);

    announce('Opening print dialog for PDF export...');
  } catch (error) {
    console.warn('Hyperscribe: PDF export failed', error);
    announce('Failed to open PDF export', 'assertive');
  }
}

/**
 * Get HTML img tags for all images attached to the current note
 * @returns {Promise<string>} HTML string of img tags
 */
async function getImageTagsForExport() {
  try {
    const state = stateManager.getState();
    const activeNote = getActiveNoteState(state)?.note;
    if (!activeNote?.imageIds || activeNote.imageIds.length === 0) return '';
    const images = await ImageStorage.getImagesForNote(activeNote.id);
    if (!images || images.length === 0) return '';
    return images.map(img => '<img src="' + img.dataUri + '" alt="Attached image" style="max-width:100%;height:auto;margin:8px 0;" />').join('\n');
  } catch (e) {
    console.warn('Hyperscribe: could not load images for export', e);
    return '';
  }
}

/**
 * Get Markdown image references for all images attached to the current note
 * @returns {Promise<string>} Markdown string of image references
 */
async function getImageMarkdownForExport() {
  try {
    const state = stateManager.getState();
    const activeNote = getActiveNoteState(state)?.note;
    if (!activeNote?.imageIds || activeNote.imageIds.length === 0) return '';
    const images = await ImageStorage.getImagesForNote(activeNote.id);
    if (!images || images.length === 0) return '';
    return images.map((img, i) => '![Image ' + (i + 1) + '](' + img.dataUri + ')').join('\n\n');
  } catch (e) {
    console.warn('Hyperscribe: could not load images for markdown export', e);
    return '';
  }
}

/**
 * Get images embedded as base64 text blocks for TXT export
 * Each image is appended as a labeled base64 block at the end of the text file
 * @returns {Promise<string>} Formatted image blocks or empty string
 */
async function getImageTextBlocks() {
  try {
    const state = stateManager.getState();
    const activeNote = getActiveNoteState(state)?.note;
    if (!activeNote?.imageIds || activeNote.imageIds.length === 0) return '';
    const images = await ImageStorage.getImagesForNote(activeNote.id);
    if (!images || images.length === 0) return '';
    return images.map((img, i) => {
      const ext = img.dataUri?.startsWith('data:image/png') ? 'png'
        : img.dataUri?.startsWith('data:image/jpeg') || img.dataUri?.startsWith('data:image/jpg') ? 'jpg'
        : img.dataUri?.startsWith('data:image/gif') ? 'gif'
        : img.dataUri?.startsWith('data:image/webp') ? 'webp'
        : 'png';
      const label = '[Image ' + (i + 1) + ' (' + ext + ')]';
      const dataUri = img.dataUri || '';
      return label + '\n' + dataUri;
    }).join('\n\n');
  } catch (e) {
    console.warn('Hyperscribe: could not load images for text export', e);
    return '';
  }
}

/**
 * Escape HTML special characters for safe insertion into HTML
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function applyExportTemplate(noteContent, templateId) {
  try {
    const template = templateManager.getTemplate(templateId);
    if (!template) return noteContent;

    // Get the template content with variables replaced
    let templateContent = templateManager.applyTemplate(templateId);

    // If template has a [CONTENT] or [NOTE] placeholder, insert the note there
    // Otherwise, prepend the template to the note content
    if (templateContent.includes('[CONTENT]')) {
      return templateContent.replace('[CONTENT]', noteContent);
    } else if (templateContent.includes('[NOTE]')) {
      return templateContent.replace('[NOTE]', noteContent);
    } else {
      // Append note content after template
      return templateContent + '\n\n' + noteContent;
    }
  } catch (error) {
    console.warn('Hyperscribe: failed to apply export template', error);
    return noteContent;
  }
}

function copyFormattedContent() {
  const content = elements.noteArea.value;
  const metadata = collectExportMetadata(content);
  const formatted = exportFormatter.formatAsMarkdown(content, metadata, true);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(formatted)
      .then(() => announce('Formatted note copied to clipboard'))
      .catch(() => fallbackCopy(formatted));
    return;
  }

  fallbackCopy(formatted);
}

function fallbackCopy(text) {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', 'true');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    announce('Formatted note copied to clipboard');
  } catch (error) {
    console.warn('Hyperscribe: clipboard copy failed', error);
    announce('Unable to copy formatted note', 'assertive');
  }
  document.body.removeChild(temp);
}

function showSaveIndicator(message = 'Saving...') {
  if (!elements.saveIndicator) {
    return;
  }

  if (saveIndicatorTimeout) {
    clearTimeout(saveIndicatorTimeout);
    saveIndicatorTimeout = null;
  }

  if (elements.saveIndicatorText && message) {
    elements.saveIndicatorText.textContent = message;
  }

  elements.saveIndicator.classList.remove('hidden');
}

function hideSaveIndicator({ delay = 300, message = 'Saved' } = {}) {
  if (!elements.saveIndicator) {
    return;
  }

  if (saveIndicatorTimeout) {
    clearTimeout(saveIndicatorTimeout);
    saveIndicatorTimeout = null;
  }

  if (elements.saveIndicatorText && typeof message === 'string' && message.length > 0) {
    elements.saveIndicatorText.textContent = message;
  }

  saveIndicatorTimeout = setTimeout(() => {
    elements.saveIndicator.classList.add('hidden');
    saveIndicatorTimeout = null;
  }, delay);
}

function collectExportMetadata(content) {
  const stats = getNoteStatistics(content);
  const state = stateManager.getState();
  const manifest = chrome.runtime.getManifest();

  return {
    title: deriveNoteTitle(content, state),
    date: new Date(),
    wordCount: stats.words,
    charCount: stats.characters,
    theme: state.theme,
    version: manifest.version
  };
}

function buildExportFilename(format, title = '') {
  const now = new Date();
  const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const sanitizedTitle =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30) || 'note';
  return `${sanitizedTitle}-${dateStamp}.${format}`;
}

function getNoteStatistics(content) {
  const text = content || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    words,
    characters: text.length
  };
}

function updateWordCount(content = elements.noteArea?.value ?? '') {
  if (!elements.wordCount) {
    return;
  }

  const stats = getNoteStatistics(content);
  elements.wordCount.textContent = `Words: ${stats.words} | Characters: ${stats.characters}`;
}

/**
 * Update storage display to include both chrome.storage and IndexedDB
 */
async function updateCombinedStorageUsage() {
  if (!elements.storageUsage) return;
  try {
    const chromeStats = await StorageRepository.getStorageUsage();
    let imageStats = { estimatedBytes: 0, count: 0 };
    try {
      imageStats = await ImageStorage.getStorageStats();
    } catch (e) {
      // IndexedDB might not be initialized yet
    }

    const totalBytes = chromeStats.bytes + imageStats.estimatedBytes;
    const totalUsage = StorageRepository.formatBytes(totalBytes);
    const imgSuffix = imageStats.count > 0 ? ` (${imageStats.count} imgs)` : '';
    elements.storageUsage.textContent = `Storage: ${totalUsage}${imgSuffix}`;

    // Remove previous warning classes
    elements.storageUsage.classList.remove('storage-warning', 'storage-critical');

    const totalPct = totalBytes / StorageRepository.STORAGE_QUOTA;
    if (totalPct >= StorageRepository.QUOTA_CRITICAL_THRESHOLD) {
      elements.storageUsage.classList.add('storage-critical');
    } else if (totalPct >= StorageRepository.QUOTA_WARNING_THRESHOLD) {
      elements.storageUsage.classList.add('storage-warning');
    }
  } catch (error) {
    // Fallback to chrome storage only display
  }
}

function handleExportSettings() {
  try {
    const data = stateManager.exportSettings();
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const filename = `hyperscribe-settings-${stamp}.json`;

    download(filename, JSON.stringify(data, null, 2), 'json')
      .then(() => announce('Settings exported'))
      .catch(error => {
        console.warn('Hyperscribe: settings export failed', error);
        announce('Failed to export settings', 'assertive');
      });
  } catch (error) {
    console.warn('Hyperscribe: settings export threw', error);
    announce('Failed to export settings', 'assertive');
  }
}

function handleImportSettings(event) {
  const input = event?.target;
  const file = input?.files?.[0];

  if (!file) {
    return;
  }

  // Validate file size
  if (file.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
    announce('File too large. Maximum size is 5MB.', 'assertive');
    if (input) input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const text = String(reader.result ?? '');
      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }

      // Basic structure validation
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid settings format');
      }

      const result = await stateManager.importSettings(parsed);

      if (result.success) {
        applyStateToUI(stateManager.getState());
        showSaveIndicator('Imported');
        announce('Settings imported successfully');
      } else {
        announce(result.message || 'Unable to import settings', 'assertive');
      }
    } catch (error) {
      console.warn('Hyperscribe: settings import failed', error);
      announce(error.message || 'Invalid or corrupted settings file', 'assertive');
    } finally {
      if (input) {
        input.value = '';
      }
    }
  };

  reader.onerror = () => {
    console.warn('Hyperscribe: failed to read settings file');
    announce('Unable to read settings file', 'assertive');
    if (input) {
      input.value = '';
    }
  };

  reader.readAsText(file);
}

function deriveNoteTitle(content, state) {
  if (Array.isArray(state.notes) && state.activeNoteId) {
    const active = state.notes.find(note => note.id === state.activeNoteId);
    if (active?.title) {
      return active.title;
    }
  }

  const text = content || state.note || '';
  const firstLine = text.split('\n')[0].trim();
  return firstLine || 'Hyperscribe';
}

function getActiveNoteState(state) {
  if (Array.isArray(state.notes) && state.notes.length > 0) {
    const activeId = state.activeNoteId || state.notes[0].id;
    const activeNote = state.notes.find(note => note.id === activeId) || state.notes[0];
    return { note: activeNote, activeId: activeNote.id };
  }

  return {
    note: {
      id: null,
      title: deriveNoteTitle(state.note || '', state),
      content: state.note || '',
      created: Date.now(),
      modified: Date.now(),
      category: null,
      tags: [],
      pinned: false,
      archived: false
    },
    activeId: null
  };
}

/**
 * Update the active note content in state
 * @param {string} content - The new note content
 * @returns {boolean} - Whether the title changed (for tab re-rendering)
 */
function updateActiveNoteContent(content) {
  const state = stateManager.getState();

  if (Array.isArray(state.notes) && state.notes.length > 0) {
    const { note: activeNote, activeId } = getActiveNoteState(state);
    const nextId = activeId || activeNote.id;
    const newTitle = NotesManager.extractTitle(content);
    const oldTitle = activeNote?.title || '';
    const titleChanged = newTitle !== oldTitle;

    const updatedNotes = state.notes.map(note => {
      if (note.id === nextId) {
        return {
          ...note,
          content,
          title: newTitle,
          modified: Date.now()
        };
      }
      return note;
    });

    stateManager.save({
      notes: updatedNotes,
      activeNoteId: nextId,
      note: content,
      lastModified: Date.now()
    });
    return titleChanged;
  }

  const fallbackNote = notesManager.createNote('', content);
  stateManager.save({
    notes: [fallbackNote],
    activeNoteId: fallbackNote.id,
    note: content,
    lastModified: Date.now()
  });
  return true; // New note, always render tabs
}

function applyStateToUI(state) {
  const { note: activeNote } = getActiveNoteState(state);
  elements.noteArea.value = activeNote.content ?? state.note ?? '';
  const themeId = themeManager.resolveThemeId(state);
  themeManager.setTheme(themeId, { skipSave: true });
  fontManager.apply(state.font);

  // Check if this is a floating window (via URL param or window type)
  const urlParams = new URLSearchParams(window.location.search);
  const isFloatingWindow = urlParams.get('floating') === 'true';

  if (isFloatingWindow) {
    // In floating window, fill the entire window
    document.documentElement.style.setProperty('--popup-width', '100vw');
    document.documentElement.style.setProperty('--popup-height', '100vh');
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    // Hide the float button and resize handle since we're already floating
    if (elements.floatWindowButton) {
      elements.floatWindowButton.style.display = 'none';
    }
    if (elements.resizeHandle) {
      elements.resizeHandle.style.display = 'none';
    }
  } else if (isSidePanel) {
    // Side panel: fill available space — override the popup defaults
    document.documentElement.style.setProperty('--popup-width', '100vw');
    document.documentElement.style.setProperty('--popup-height', '100vh');
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  } else if (state.windowSize) {
    // Extension popup - apply saved dimensions
    document.documentElement.style.setProperty('--popup-width', state.windowSize.width + 'px');
    document.documentElement.style.setProperty('--popup-height', state.windowSize.height + 'px');
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }

  // Apply spellcheck state
  if (state.spellcheckLang) {
    elements.spellcheckLangSelect.value = state.spellcheckLang;
  }
  if (state.spellcheckEnabled) {
    elements.spellcheckToggle.checked = true;
    spellcheckManager.enable();
    spellcheckManager.checkText(true);
  }

  updateWordCount(elements.noteArea.value);
  noteTabManager.render();
  hideSaveIndicator({ delay: 0, message: '' });
}

function bindEvents() {
  elements.copyButton.addEventListener('click', copyAll);
  elements.clearNoteButton.addEventListener('click', clearNote);
  elements.themeButton && elements.themeButton.addEventListener('click', () => panelManager.toggle('theme'));
  elements.fontButton.addEventListener('click', () => panelManager.toggle('font'));
  elements.emojiButton.addEventListener('click', () => panelManager.toggle('emoji'));
  elements.templateButton &&
    elements.templateButton.addEventListener('click', () => panelManager.toggle('template'));
  // Template dialog events
  elements.createTemplateButton &&
    elements.createTemplateButton.addEventListener('click', openTemplateDialog);
  elements.exportTemplatesButton &&
    elements.exportTemplatesButton.addEventListener('click', handleExportTemplates);
  elements.importTemplatesButton &&
    elements.importTemplatesButton.addEventListener('click', () => elements.importTemplatesInput?.click());
  elements.importTemplatesInput &&
    elements.importTemplatesInput.addEventListener('change', handleImportTemplates);
  elements.templateDialogClose &&
    elements.templateDialogClose.addEventListener('click', closeTemplateDialog);
  elements.templateDialogCancel &&
    elements.templateDialogCancel.addEventListener('click', closeTemplateDialog);
  elements.templateDialogSave &&
    elements.templateDialogSave.addEventListener('click', handleSaveTemplate);
  // Export template dialog events
  elements.exportTemplateDialogClose &&
    elements.exportTemplateDialogClose.addEventListener('click', closeExportTemplateDialog);
  elements.exportTemplateDialogCancel &&
    elements.exportTemplateDialogCancel.addEventListener('click', closeExportTemplateDialog);
  elements.exportTemplateDialogConfirm &&
    elements.exportTemplateDialogConfirm.addEventListener('click', performExportSelectedTemplates);
  elements.exportTemplateSelectAll &&
    elements.exportTemplateSelectAll.addEventListener('change', handleExportTemplateSelectAll);
  // Note tab events are now handled by NoteTabManager.init()
  elements.downloadButton.addEventListener('click', toggleExportMenu);
  elements.exportMenu.addEventListener('click', handleExportMenuClick);
  elements.exportMenu.addEventListener('keydown', handleExportMenuKeyDown);
  elements.clearStorageButton.addEventListener('click', clearStoredData);
  // Float window button archived — event binding removed
  elements.openSidePanelButton &&
    elements.openSidePanelButton.addEventListener('click', openSidePanel);
  elements.feedbackButton &&
    elements.feedbackButton.addEventListener('click', openFeedbackEmail);
  elements.errorToastClose &&
    elements.errorToastClose.addEventListener('click', hideErrorToast);

  // Custom theme events
  elements.customThemeToggle &&
    elements.customThemeToggle.addEventListener('click', toggleCustomThemeEditor);
  elements.applyCustomThemeBtn &&
    elements.applyCustomThemeBtn.addEventListener('click', applyCustomThemeCss);
  elements.clearCustomThemeBtn &&
    elements.clearCustomThemeBtn.addEventListener('click', clearCustomThemeCss);
  // Theme color picker events
  elements.applyThemeColorsBtn &&
    elements.applyThemeColorsBtn.addEventListener('click', applyThemeColors);
  elements.resetThemeColorsBtn &&
    elements.resetThemeColorsBtn.addEventListener('click', resetThemeColors);

  elements.noteArea.addEventListener('input', handleNoteChange);
  elements.noteArea.addEventListener('wheel', handleCtrlScroll, { passive: false });

  // Spellcheck events
  elements.spellcheckToggle && elements.spellcheckToggle.addEventListener('change', handleSpellcheckToggle);
  elements.spellcheckLangSelect && elements.spellcheckLangSelect.addEventListener('change', handleSpellcheckLangChange);
  elements.noteArea.addEventListener('contextmenu', handleSpellcheckContextMenu);
  elements.addToDictionaryBtn && elements.addToDictionaryBtn.addEventListener('click', handleAddToDictionary);
  elements.manageDictionaryBtn && elements.manageDictionaryBtn.addEventListener('click', toggleDictionaryPanel);
  document.addEventListener('click', hideSpellcheckContextMenu);

  // More menu toggle
  if (elements.moreButton) {
    elements.moreButton.addEventListener('click', e => {
      e.stopPropagation();
      toggleMoreMenu();
    });
  }

  // More menu keyboard navigation
  if (elements.moreMenu) {
    elements.moreMenu.addEventListener('keydown', handleMoreMenuKeyDown);
  }

  // Close more menu when clicking outside
  document.addEventListener('click', e => {
    if (
      isMoreMenuOpen &&
      !elements.moreMenu.contains(e.target) &&
      !elements.moreButton.contains(e.target)
    ) {
      closeMoreMenu();
    }
  });
  document.addEventListener('click', handleDocumentClickForMenus);
  elements.resizeHandle && elements.resizeHandle.addEventListener('pointerdown', startResize);
  elements.resizeHandle && elements.resizeHandle.addEventListener('dblclick', resetWindowSize);
  elements.exportSettingsButton &&
    elements.exportSettingsButton.addEventListener('click', handleExportSettings);
  elements.importSettingsButton &&
    elements.importSettingsButton.addEventListener('click', () =>
      elements.importSettingsInput?.click()
    );
  elements.importSettingsInput &&
    elements.importSettingsInput.addEventListener('change', handleImportSettings);
  document.addEventListener('keydown', handleGlobalKeyDown);

  // Emoji search
  elements.emojiSearch && elements.emojiSearch.addEventListener('input', handleEmojiSearch);

  // Note search events
  elements.noteSearchInput && elements.noteSearchInput.addEventListener('input', handleNoteSearchInput);
  elements.noteSearchPrev && elements.noteSearchPrev.addEventListener('click', goToPrevMatch);
  elements.noteSearchNext && elements.noteSearchNext.addEventListener('click', goToNextMatch);
  elements.noteSearchClose && elements.noteSearchClose.addEventListener('click', closeNoteSearch);
  // Close search on Escape when focused
  elements.noteSearchInput && elements.noteSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNoteSearch();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevMatch();
      } else {
        goToNextMatch();
      }
    }
  });

  // Import note from file
  elements.importNoteInput && elements.importNoteInput.addEventListener('change', handleImportNote);

  // Listen for keyboard shortcut commands from background
  chrome.runtime.onMessage.addListener(handleCommandMessage);
}

function handleStateChange(state) {
  updateWordCount(state?.note ?? elements.noteArea.value);
  hideSaveIndicator({ delay: 400, message: 'Saved' });
  // Update storage usage after saves
  updateCombinedStorageUsage();
}

function handleThemeChange(themeId) {
  stateManager.save({ theme: themeId });
  const theme = ThemeManager.THEMES[themeId];
  if (theme) {
    announce(`Theme changed to ${theme.label}`);
  }
}

/**
 * Toggle the custom theme CSS editor visibility
 */
/**
 * Apply theme colors from the color pickers to the app element
 * Sets CSS custom properties and saves to state
 */
function applyThemeColors() {
  const colors = {
    bg: elements.colorBg?.value || '',
    panel: elements.colorPanel?.value || '',
    text: elements.colorText?.value || '',
    accent: elements.colorAccent?.value || '',
    border: elements.colorBorder?.value || '',
    noteBg: elements.colorNoteBg?.value || ''
  };

  // Determine if current theme is dark or light based on app classes
  const isDark = document.body.classList.contains('theme-dark');

  // Remove any existing theme color style element
  const existing = document.getElementById('custom-theme-colors');
  if (existing) existing.remove();

  // Build CSS custom properties string
  const props = [];
  if (colors.bg) props.push(isDark ? '--dark-bg: ' + colors.bg : '--light-bg: ' + colors.bg);
  if (colors.panel) props.push(isDark ? '--dark-panel: ' + colors.panel : '--light-panel: ' + colors.panel);
  if (colors.text) props.push(isDark ? '--dark-text: ' + colors.text : '--light-text: ' + colors.text);
  if (colors.accent) props.push('--accent-primary: ' + colors.accent);
  if (colors.border) props.push(isDark ? '--dark-border: ' + colors.border : '--light-border: ' + colors.border);
  // Note background — applied to the note container that the textarea lives in
  if (colors.noteBg) props.push('--note-container-bg: ' + colors.noteBg);
  if (colors.accent) {
    // Generate muted variants from accent color
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    };
    const rgb = hexToRgb(colors.accent);
    if (rgb) {
      props.push('--accent-muted: rgba(' + rgb + ', 0.25)');
      props.push('--accent-muted-strong: rgba(' + rgb + ', 0.4)');
    }
  }

  if (props.length > 0) {
    const style = document.createElement('style');
    style.id = 'custom-theme-colors';
    style.textContent = '#app, body {\n' + props.join(';\n') + ';\n}';
    document.head.appendChild(style);
  }

  // Save to state
  stateManager.save({ customThemeColors: colors });
  announce('Theme colors applied');
}

/**
 * Reset theme colors back to defaults
 */
function resetThemeColors() {
  const existing = document.getElementById('custom-theme-colors');
  if (existing) existing.remove();

  // Reset inputs to default values
  if (elements.colorBg) elements.colorBg.value = '#1e1e2e';
  if (elements.colorPanel) elements.colorPanel.value = '#2a2a3c';
  if (elements.colorText) elements.colorText.value = '#cdd6f4';
  if (elements.colorAccent) elements.colorAccent.value = '#cba6f7';
  if (elements.colorBorder) elements.colorBorder.value = '#cba6f7';
  if (elements.colorNoteBg) elements.colorNoteBg.value = '#181825';

  stateManager.save({ customThemeColors: null });
  announce('Theme colors reset');
}

/**
 * Load and apply saved theme colors from state
 */
function loadThemeColors() {
  const state = stateManager.getState();
  const colors = state.customThemeColors;
  if (!colors) return;

  // Set the color picker values
  if (elements.colorBg && colors.bg) elements.colorBg.value = colors.bg;
  if (elements.colorPanel && colors.panel) elements.colorPanel.value = colors.panel;
  if (elements.colorText && colors.text) elements.colorText.value = colors.text;
  if (elements.colorAccent && colors.accent) elements.colorAccent.value = colors.accent;
  if (elements.colorBorder && colors.border) elements.colorBorder.value = colors.border;
  if (elements.colorNoteBg && colors.noteBg) elements.colorNoteBg.value = colors.noteBg;

  // Apply the colors
  applyThemeColors();
}

function toggleCustomThemeEditor() {
  const isHidden = elements.customThemeEditor.classList.toggle('hidden');
  elements.customThemeToggle.setAttribute('aria-expanded', !isHidden);
  elements.customThemeEditor.setAttribute('aria-hidden', isHidden);
  if (!isHidden) {
    elements.customThemeCss.focus();
  }
}

/**
 * Apply custom theme CSS from the textarea
 * Injects a <style> element with the user's custom CSS properties
 */
function applyCustomThemeCss() {
  const css = elements.customThemeCss?.value?.trim();
  if (!css) {
    announce('No custom CSS entered', 'assertive');
    return;
  }

  try {
    // Remove existing custom theme style if any
    const existing = document.getElementById('custom-theme-style');
    if (existing) existing.remove();

    // Create and inject the custom style
    const style = document.createElement('style');
    style.id = 'custom-theme-style';
    style.textContent = `#app, body {\n${css}\n}`;
    document.head.appendChild(style);

    // Save to state
    stateManager.save({ customThemeCss: css });
    announce('Custom theme applied');
  } catch (error) {
    console.warn('Hyperscribe: failed to apply custom CSS', error);
    announce('Invalid CSS', 'assertive');
  }
}

/**
 * Clear custom theme CSS
 */
function clearCustomThemeCss() {
  // Remove the custom style element
  const existing = document.getElementById('custom-theme-style');
  if (existing) existing.remove();

  // Clear the textarea
  if (elements.customThemeCss) {
    elements.customThemeCss.value = '';
  }

  // Remove from state
  stateManager.save({ customThemeCss: '' });
  announce('Custom theme cleared');
}

/**
 * Load and apply previously saved custom theme CSS
 */
function loadCustomThemeCss() {
  const state = stateManager.getState();
  const css = state.customThemeCss;
  if (css && elements.customThemeCss) {
    elements.customThemeCss.value = css;
    const style = document.createElement('style');
    style.id = 'custom-theme-style';
    style.textContent = `#app, body {\n${css}\n}`;
    document.head.appendChild(style);
  }
}

function handleFontChange(fontState) {
  stateManager.save({ font: fontState });
  // Sync spellcheck highlights to match new font properties
  if (spellcheckRenderer) {
    spellcheckRenderer.syncFontProperties();
  }
  // Font changes are frequent, so we don't announce every keystroke
}

function handleNoteChange(event) {
  const value = event.target.value;

  // Immediate visual feedback
  showSaveIndicator();
  updateWordCount(value);

  // State update (debounced internally by StateManager)
  const titleChanged = updateActiveNoteContent(value);

  // Debounce tab rendering separately - only re-render if title changed
  if (titleChanged) {
    noteTabManager.debouncedRender();
  }

  // Trigger spellcheck if enabled (already debounced internally)
  if (spellcheckManager && spellcheckManager.isEnabled()) {
    spellcheckManager.checkText();
  }
}

let fontSizeAnnounceTimeout = null;
function handleCtrlScroll(event) {
  // Check for Ctrl+scroll (or Cmd+scroll on Mac)
  if (!event.ctrlKey && !event.metaKey) return;

  event.preventDefault();

  const state = stateManager.getState();
  const currentSize = state.font?.size || 16;
  const delta = event.deltaY > 0 ? -1 : 1; // Scroll down = decrease, scroll up = increase
  const newSize = Math.min(32, Math.max(12, currentSize + delta));

  if (newSize !== currentSize) {
    const newFont = { ...state.font, size: newSize };
    fontManager.apply(newFont);
    stateManager.save({ font: newFont });

    // Update the font size slider if visible
    if (elements.fontSizeControl) {
      elements.fontSizeControl.value = newSize;
    }
    if (elements.fontSizeValue) {
      elements.fontSizeValue.textContent = `${newSize}px`;
    }

    // Sync spellcheck highlights
    if (spellcheckRenderer) {
      spellcheckRenderer.syncFontProperties();
    }

    // Debounced screen reader announcement
    if (fontSizeAnnounceTimeout) {
      clearTimeout(fontSizeAnnounceTimeout);
    }
    fontSizeAnnounceTimeout = setTimeout(() => {
      announce(`Font size: ${newSize}px`);
      fontSizeAnnounceTimeout = null;
    }, 500);
  }
}

function handleSpellcheckToggle(event) {
  const enabled = event.target.checked;

  if (enabled) {
    spellcheckManager.enable();
    spellcheckManager.checkText(true); // Immediate check
    announce('Spellcheck enabled');
  } else {
    spellcheckManager.disable();
    spellcheckRenderer.clear();
    announce('Spellcheck disabled');
  }

  // Save preference
  stateManager.save({ spellcheckEnabled: enabled });
}

async function handleSpellcheckLangChange(event) {
  const lang = event.target.value;
  await spellcheckManager.setLanguage(lang);
  stateManager.save({ spellcheckLang: lang });
  announce(`Spellcheck language changed to ${lang === 'en_US' ? 'English US' : 'English GB'}`);
}

function handleSpellcheckContextMenu(event) {
  // Only show context menu if spellcheck is enabled
  if (!spellcheckManager || !spellcheckManager.isEnabled()) {
    return; // Allow default context menu
  }

  // Get cursor position in textarea
  const cursorPos = elements.noteArea.selectionStart;

  // Check if cursor is on a misspelled word
  const misspelledWord = spellcheckRenderer.getMisspelledWordAt(cursorPos);

  if (!misspelledWord) {
    return; // Allow default context menu
  }

  // Prevent default context menu
  event.preventDefault();

  // Store current word for later use
  currentSpellcheckWord = misspelledWord;

  // Position the context menu
  const menu = elements.spellcheckContextMenu;
  const appRect = document.getElementById('app').getBoundingClientRect();

  // Calculate position relative to the app container
  let x = event.clientX - appRect.left;
  let y = event.clientY - appRect.top;

  // Ensure menu doesn't go off-screen
  menu.classList.remove('hidden');
  const menuRect = menu.getBoundingClientRect();

  if (x + menuRect.width > appRect.width) {
    x = appRect.width - menuRect.width - 8;
  }
  if (y + menuRect.height > appRect.height) {
    y = appRect.height - menuRect.height - 8;
  }

  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;
  menu.setAttribute('aria-hidden', 'false');

  // Populate suggestions
  populateSpellcheckSuggestions(misspelledWord);
}

function populateSpellcheckSuggestions(wordInfo) {
  const container = elements.spellcheckSuggestions;
  container.innerHTML = '';

  if (!wordInfo.suggestions || wordInfo.suggestions.length === 0) {
    const noSuggestions = document.createElement('div');
    noSuggestions.className = 'context-menu-no-suggestions';
    noSuggestions.textContent = 'No suggestions';
    container.appendChild(noSuggestions);
    return;
  }

  wordInfo.suggestions.forEach(suggestion => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'context-menu-suggestion';
    btn.textContent = suggestion;
    btn.addEventListener('click', () => {
      replaceMisspelledWord(wordInfo, suggestion);
      hideSpellcheckContextMenu();
    });
    container.appendChild(btn);
  });
}

function replaceMisspelledWord(wordInfo, replacement) {
  const text = elements.noteArea.value;
  const newText = text.substring(0, wordInfo.start) + replacement + text.substring(wordInfo.end);
  elements.noteArea.value = newText;

  // Trigger input event to update state and re-check spelling
  elements.noteArea.dispatchEvent(new Event('input', { bubbles: true }));

  // Set cursor position after replacement
  const newCursorPos = wordInfo.start + replacement.length;
  elements.noteArea.setSelectionRange(newCursorPos, newCursorPos);
  elements.noteArea.focus();

  announce(`Replaced with ${replacement}`);
}

function handleAddToDictionary() {
  if (!currentSpellcheckWord || !spellcheckManager) {
    hideSpellcheckContextMenu();
    return;
  }

  spellcheckManager.addToCustomDictionary(currentSpellcheckWord.word);
  announce(`Added "${currentSpellcheckWord.word}" to dictionary`);
  hideSpellcheckContextMenu();
}

function hideSpellcheckContextMenu(event) {
  const menu = elements.spellcheckContextMenu;
  if (!menu) return;

  // If event is provided, check if click was inside the menu
  if (event && menu.contains(event.target)) {
    return;
  }

  menu.classList.add('hidden');
  menu.setAttribute('aria-hidden', 'true');
  currentSpellcheckWord = null;
}

function toggleDictionaryPanel() {
  const panel = elements.dictionaryPanel;
  if (!panel) return;

  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    renderDictionaryWords();
  } else {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  }
}

function renderDictionaryWords() {
  if (!spellcheckManager || !elements.dictionaryWordList) return;

  const words = spellcheckManager.getCustomDictionaryWords();
  const container = elements.dictionaryWordList;
  container.innerHTML = '';

  // Update count
  if (elements.dictionaryCount) {
    elements.dictionaryCount.textContent = `${words.length} word${words.length !== 1 ? 's' : ''}`;
  }

  // Show/hide empty state
  if (elements.dictionaryEmpty) {
    elements.dictionaryEmpty.classList.toggle('hidden', words.length > 0);
  }

  // Render words using DOM methods to prevent XSS
  words.sort().forEach(word => {
    const wordEl = document.createElement('span');
    wordEl.className = 'dictionary-word';

    // Use textContent for the word to prevent XSS
    const wordText = document.createTextNode(word + ' ');
    wordEl.appendChild(wordText);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'dictionary-word-remove';
    removeBtn.dataset.word = word;
    removeBtn.setAttribute('aria-label', `Remove ${word}`);

    const icon = document.createElement('i');
    icon.className = 'codicon codicon-close';
    icon.setAttribute('aria-hidden', 'true');
    removeBtn.appendChild(icon);

    wordEl.appendChild(removeBtn);
    container.appendChild(wordEl);
  });

  // Bind remove buttons
  container.querySelectorAll('.dictionary-word-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const word = e.currentTarget.dataset.word;
      spellcheckManager.removeFromCustomDictionary(word);
      renderDictionaryWords();
      announce(`Removed "${word}" from dictionary`);
    });
  });
}

function handleGlobalKeyDown(event) {
  if (confirmationDialog.handleEscape(event)) {
    return;
  }

  // Close spellcheck context menu on Escape
  if (event.key === 'Escape' && elements.spellcheckContextMenu && !elements.spellcheckContextMenu.classList.contains('hidden')) {
    hideSpellcheckContextMenu();
    event.preventDefault();
    return;
  }

  // Close template dialog on Escape
  if (
    event.key === 'Escape' &&
    elements.templateDialog &&
    !elements.templateDialog.classList.contains('hidden')
  ) {
    closeTemplateDialog();
    event.preventDefault();
    return;
  }

  // Close export template dialog on Escape
  if (
    event.key === 'Escape' &&
    elements.exportTemplateDialog &&
    !elements.exportTemplateDialog.classList.contains('hidden')
  ) {
    closeExportTemplateDialog();
    event.preventDefault();
    return;
  }

  if (isExportMenuOpen && event.key === 'Escape') {
    closeExportMenu();
    return;
  }

  if (event.key === 'Escape' && isMoreMenuOpen) {
    closeMoreMenu();
    event.preventDefault();
    return;
  }

  // Close note search bar on Escape
  if (event.key === 'Escape' && elements.noteSearchBar && !elements.noteSearchBar.classList.contains('hidden')) {
    closeNoteSearch();
    event.preventDefault();
    return;
  }

  // Close tab context menu on Escape
  if (event.key === 'Escape' && tabContextMenu) {
    hideTabContextMenu();
    event.preventDefault();
    return;
  }

  // Handle Ctrl+F for search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    openNoteSearch();
    return;
  }

  // Handle Ctrl+/ for keyboard shortcuts help
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    // TODO: Open keyboard shortcuts dialog
    event.preventDefault();
    return;
  }

  panelManager.handleKeyDown(event);
}

/**
 * Handle keyboard navigation in emoji grid
 */
function handleEmojiKeyDown(event) {
  const currentButton = event.target;
  const allButtons = Array.from(elements.emojiGrid.querySelectorAll('.emoji-btn'));
  const currentIndex = allButtons.indexOf(currentButton);

  if (currentIndex === -1) {
    return;
  }

  const gridComputedStyle = getComputedStyle(elements.emojiGrid);
  const gridWidth = elements.emojiGrid.offsetWidth;
  const buttonWidth = currentButton.offsetWidth;
  const gap = parseFloat(gridComputedStyle.gap) || 6;
  const cols = Math.floor(gridWidth / (buttonWidth + gap)) || 1;

  let targetIndex = -1;

  switch (event.key) {
    case 'ArrowRight':
      targetIndex = currentIndex + 1;
      if (targetIndex >= allButtons.length) {
        targetIndex = 0;
      } // Wrap to start
      event.preventDefault();
      break;
    case 'ArrowLeft':
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) {
        targetIndex = allButtons.length - 1;
      } // Wrap to end
      event.preventDefault();
      break;
    case 'ArrowDown':
      targetIndex = currentIndex + cols;
      if (targetIndex >= allButtons.length) {
        targetIndex = currentIndex % cols; // Wrap to same column at top
      }
      event.preventDefault();
      break;
    case 'ArrowUp':
      targetIndex = currentIndex - cols;
      if (targetIndex < 0) {
        // Wrap to same column at bottom
        const col = currentIndex % cols;
        const rows = Math.ceil(allButtons.length / cols);
        targetIndex = (rows - 1) * cols + col;
        if (targetIndex >= allButtons.length) {
          targetIndex -= cols;
        }
      }
      event.preventDefault();
      break;
    case 'Enter':
    case ' ': {
      const emoji = currentButton.textContent;
      insertEmoji(emoji);
      panelManager.close('emoji');
      event.preventDefault();
      break;
    }
    case 'Escape':
      panelManager.close('emoji');
      elements.emojiButton.focus();
      event.preventDefault();
      break;
    case 'Home':
      targetIndex = 0;
      event.preventDefault();
      break;
    case 'End':
      targetIndex = allButtons.length - 1;
      event.preventDefault();
      break;
    default:
      return;
  }

  if (targetIndex >= 0 && targetIndex < allButtons.length) {
    // Update tabindex
    allButtons.forEach(btn => btn.setAttribute('tabindex', '-1'));
    allButtons[targetIndex].setAttribute('tabindex', '0');
    allButtons[targetIndex].focus();
    // _emojiNavigationIndex = targetIndex;
  }
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
    announce('Note copied to clipboard');
  } catch (error) {
    console.warn('Hyperscribe: copy failed', error);
    announce('Failed to copy note', 'assertive');
  }
}

function clearNote() {
  const state = stateManager.getState();
  const hasContent = elements.noteArea.value.trim().length > 0;
  if (hasContent && !state.suppressClearConfirm) {
    confirmationDialog.show({
      message: 'Clear the current note? This action cannot be undone.',
      confirmLabel: 'Clear Note',
      onConfirm: context => {
        if (context.suppressFutureConfirms) {
          stateManager.save({ suppressClearConfirm: true });
        }
        performClearNote();
      },
      includeDontAsk: true
    });
    return;
  }
  performClearNote();
}

function performClearNote() {
  elements.noteArea.value = '';
  updateActiveNoteContent('');
  showSaveIndicator();
  updateWordCount('');
  // Clear spellcheck highlights
  if (spellcheckRenderer) {
    spellcheckRenderer.clear();
  }
  elements.noteArea.focus();
  announce('Note cleared');
}

function downloadNote() {
  exportNote('txt');
}

function insertEmoji(emoji) {
  const pos = elements.noteArea.selectionStart;
  const end = elements.noteArea.selectionEnd;
  const val = elements.noteArea.value;
  const before = val.slice(0, pos);
  const after = val.slice(end);
  elements.noteArea.value = before + emoji + after;
  const nextCursor = before.length + emoji.length;
  elements.noteArea.focus();
  elements.noteArea.setSelectionRange(nextCursor, nextCursor);
  handleNoteChange({ target: elements.noteArea });
  announce(`Inserted emoji ${emoji}`);
}

function clearStoredData() {
  confirmationDialog.show({
    message: 'Reset all saved Hyperscribe data including notes, images, and preferences?',
    confirmLabel: 'Clear Data',
    onConfirm: async () => {
      await stateManager.clear();
      await ImageStorage.clearAll();
      const state = stateManager.getState();
      applyStateToUI(state);
      announce('All data cleared');
    }
  });
}

function openFeedbackEmail() {
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version || 'unknown';
  const userAgent = navigator.userAgent;

  const subject = encodeURIComponent(`Hyperscribe Feedback (v${version})`);
  const body = encodeURIComponent(
`--- Please describe your feedback, suggestion, or bug report below ---


--- System Information (auto-filled) ---
Version: ${version}
Browser: ${userAgent}
`
  );

  const email = 'xtfr.dev@outlook.com';
  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  window.open(mailtoUrl, '_blank');
}

async function openFloatingWindow() {
  // Don't open another floating window if we're already in one
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('floating') === 'true') {
    announce('Already in a floating window');
    return;
  }

  // Save state immediately in case the current context closes during/open after PiP setup
  await stateManager.saveImmediate();

  // Try Document Picture-in-Picture first (true always-on-top)
  if ('documentPictureInPicture' in window) {
    try {
      const pipWindow = await openPictureInPicture();
      if (pipWindow) {
        return;
      }
    } catch (error) {
      console.warn('Hyperscribe: Document PiP failed:', error.message);
    }
  } else {
    console.log('Hyperscribe: documentPictureInPicture API not available in this context');
  }

  // Fallback 1: send message to background service worker for reliable window creation
  try {
    const state = stateManager.getState();
    const width = state.windowSize?.width || 480;
    const height = state.windowSize?.height || 600;

    const response = await chrome.runtime.sendMessage({
      type: 'openFloatingWindow',
      width,
      height
    });

    if (response?.success) {
      announce('Opened floating window');
      return;
    }
    console.warn('Hyperscribe: background window creation failed:', response?.error);
  } catch (error) {
    console.warn('Hyperscribe: background message failed:', error.message);
  }

  // Fallback 2: try chrome.windows.create directly
  try {
    await openFloatingWindowViaChromeApi();
    return;
  } catch (error) {
    console.warn('Hyperscribe: chrome.windows.create fallback failed:', error.message);
  }

  // Fallback 3: window.open (may be blocked by popup blocker)
  try {
    openFloatingWindowViaWindowOpen();
    return;
  } catch (error) {
    console.warn('Hyperscribe: window.open fallback failed:', error.message);
  }

  // Nothing worked — show help message
  showErrorToast(
    'Cannot open floating window. Try enabling popups for this extension, or use the Side Panel instead.'
  );
}

async function openPictureInPicture() {
  const state = stateManager.getState();
  const width = state.windowSize?.width || 400;
  const height = state.windowSize?.height || 500;

  // Request PiP window
  const pipWindow = await documentPictureInPicture.requestWindow({
    width: Math.min(width, 800),
    height: Math.min(height, 600),
    disallowReturnToOpener: false
  });

  if (!pipWindow || pipWindow.closed) {
    throw new Error('PiP window was not created');
  }

  // Copy all stylesheets to PiP window
  const styleSheets = [...document.styleSheets];
  for (const sheet of styleSheets) {
    try {
      if (sheet.href) {
        const link = pipWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        pipWindow.document.head.appendChild(link);
      } else if (sheet.cssRules) {
        const style = pipWindow.document.createElement('style');
        const cssText = [...sheet.cssRules].map(rule => rule.cssText).join('\n');
        style.textContent = cssText;
        pipWindow.document.head.appendChild(style);
      }
    } catch (e) {
      // CORS may block access to some stylesheets
      console.warn('Could not copy stylesheet:', e);
    }
  }

  // Add base styles for PiP window
  const pipStyles = pipWindow.document.createElement('style');
  pipStyles.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #pip-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    #pip-container .note-container {
      flex: 1;
      min-height: 0;
    }
    #pip-container #noteArea {
      height: 100%;
    }
    /* Hide elements not needed in PiP */
    #pip-container #floatWindowButton,
    #pip-container .resize-handle {
      display: none !important;
    }
    /* Add PiP indicator */
    #pip-container::before {
      content: 'PINNED';
      position: absolute;
      top: 4px;
      right: 8px;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.5px;
      opacity: 0.5;
      pointer-events: none;
      z-index: 1000;
    }
  `;
  pipWindow.document.head.appendChild(pipStyles);

  // Create container in PiP window
  const container = pipWindow.document.createElement('div');
  container.id = 'pip-container';

  // Clone the app content
  const appClone = elements.app.cloneNode(true);

  // Apply current theme classes to body
  const themeClasses = [...document.body.classList].filter(c => c.startsWith('theme-'));
  pipWindow.document.body.classList.add(...themeClasses);

  container.appendChild(appClone);
  pipWindow.document.body.appendChild(container);

  // Get references to cloned elements
  const pipNoteArea = pipWindow.document.getElementById('noteArea');
  const pipSpellcheckHighlights = pipWindow.document.getElementById('spellcheckHighlights');

  // Sync note content bidirectionally
  pipNoteArea.value = elements.noteArea.value;

  // Listen for changes in PiP window
  pipNoteArea.addEventListener('input', (e) => {
    elements.noteArea.value = e.target.value;
    elements.noteArea.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Listen for changes in main window and sync to PiP
  const syncToPip = () => {
    if (pipNoteArea && pipWindow.document.body.contains(pipNoteArea)) {
      pipNoteArea.value = elements.noteArea.value;
    }
  };
  elements.noteArea.addEventListener('input', syncToPip);

  // Handle PiP window close
  pipWindow.addEventListener('pagehide', () => {
    elements.noteArea.removeEventListener('input', syncToPip);
    announce('Picture-in-Picture closed');
  });

  // Focus the textarea in PiP
  pipNoteArea.focus();

  announce('Opened in always-on-top window');
  return pipWindow;
}

/**
 * Open a floating popup window using the chrome.windows API.
 * More reliable than window.open from extension popups.
 */
async function openFloatingWindowViaChromeApi() {
  const state = stateManager.getState();
  const width = state.windowSize?.width || 480;
  const height = state.windowSize?.height || 600;

  const popupUrl = chrome.runtime.getURL('popup.html') + '?floating=true';

  const window = await chrome.windows.create({
    url: popupUrl,
    type: 'popup',
    width: Math.min(width, 800),
    height: Math.min(height, 600),
    focused: true
  });

  if (!window) {
    throw new Error('chrome.windows.create returned no window');
  }

  announce('Opened floating window');
}

/**
 * Last-resort fallback using window.open.
 */
function openFloatingWindowViaWindowOpen() {
  const state = stateManager.getState();
  const width = state.windowSize?.width || 480;
  const height = state.windowSize?.height || 600;

  const popupUrl = chrome.runtime.getURL('popup.html') + '?floating=true';
  const features = `width=${width},height=${height},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`;

  const win = window.open(popupUrl, 'hyperscribe-floating', features);
  if (!win) {
    throw new Error('window.open returned null (likely blocked)');
  }

  announce('Opened floating window');
}

function startResize(event) {
  if (!elements.resizeHandle || (event.button !== 0 && event.pointerType === 'mouse')) {
    return;
  }
  const style = getComputedStyle(document.documentElement);
  const startWidth =
    parseFloat(style.getPropertyValue('--popup-width')) || document.documentElement.clientWidth;
  const startHeight =
    parseFloat(style.getPropertyValue('--popup-height')) || document.documentElement.clientHeight;
  resizeSession = {
    pointerId: event.pointerId,
    startX: event.screenX,
    startY: event.screenY,
    startWidth,
    startHeight
  };

  // Add resizing class to hide caret and prevent flickering
  document.body.classList.add('is-resizing');

  elements.resizeHandle.setPointerCapture &&
    elements.resizeHandle.setPointerCapture(event.pointerId);
  document.addEventListener('pointermove', handleResizeMove);
  document.addEventListener('pointerup', endResize, { once: true });
  document.addEventListener('pointercancel', endResize, { once: true });
  event.preventDefault();
}

function handleResizeMove(event) {
  if (
    !resizeSession ||
    (resizeSession.pointerId !== undefined && event.pointerId !== resizeSession.pointerId)
  ) {
    return;
  }
  const deltaX = event.screenX - resizeSession.startX;
  const deltaY = event.screenY - resizeSession.startY;
  // Negate deltaX so dragging left (negative) increases width, dragging right (positive) decreases width
  const targetWidth = Math.min(
    RESIZE_MAX_WIDTH,
    Math.max(RESIZE_MIN_WIDTH, resizeSession.startWidth - deltaX)
  );
  const targetHeight = Math.min(
    RESIZE_MAX_HEIGHT,
    Math.max(RESIZE_MIN_HEIGHT, resizeSession.startHeight + deltaY)
  );

  // Use window.resizeTo to properly resize the popup with left edge fixed
  window.resizeTo(Math.round(targetWidth), Math.round(targetHeight));

  // Also update CSS custom properties for consistency
  document.documentElement.style.setProperty('--popup-width', Math.round(targetWidth) + 'px');
  document.documentElement.style.setProperty('--popup-height', Math.round(targetHeight) + 'px');

  event.preventDefault();
}

function endResize(event) {
  if (!resizeSession) {
    return;
  }
  if (elements.resizeHandle && elements.resizeHandle.releasePointerCapture) {
    elements.resizeHandle.releasePointerCapture(resizeSession.pointerId);
  }
  document.removeEventListener('pointermove', handleResizeMove);
  document.removeEventListener('pointercancel', endResize);
  document.removeEventListener('pointerup', endResize);

  // Remove resizing class to restore caret
  document.body.classList.remove('is-resizing');

  // Save window size when resize ends
  const width = window.outerWidth || document.documentElement.clientWidth;
  const height = window.outerHeight || document.documentElement.clientHeight;
  stateManager.save({ windowSize: { width: Math.round(width), height: Math.round(height) } });

  resizeSession = null;
  event.preventDefault();
}

function resetWindowSize() {
  const defaultWidth = 480;
  const defaultHeight = 600;

  document.documentElement.style.setProperty('--popup-width', defaultWidth + 'px');
  document.documentElement.style.setProperty('--popup-height', defaultHeight + 'px');
  document.body.style.width = '100%';
  document.body.style.height = '100%';

  stateManager.save({ windowSize: { width: defaultWidth, height: defaultHeight } });
}

// ============================================
// Dictation (Speech-to-Text) Functions
// ============================================

/**
 * Initialize dictation manager for speech-to-text
 */
function initDictation() {
  if (!DictationManager.isSupported()) {
    // Hide dictate button if not supported
    if (elements.dictateButton) {
      elements.dictateButton.style.display = 'none';
    }
    return;
  }

  dictationManager = new DictationManager({
    textarea: elements.noteArea,
    onStart: () => {
      elements.dictateButton.setAttribute('aria-pressed', 'true');
      elements.dictateButton.querySelector('.label').textContent = 'Stop';
      announce('Dictation started. Speak now.', 'polite');
    },
    onEnd: () => {
      elements.dictateButton.setAttribute('aria-pressed', 'false');
      elements.dictateButton.querySelector('.label').textContent = 'Dictate';
      announce('Dictation stopped.', 'polite');
    },
    onResult: (result) => {
      // Update word count as text is added
      // (Content is saved via the input event dispatched by DictationManager)
      updateWordCount();
    },
    onError: (message) => {
      showErrorToast(message);
      announce(message, 'assertive');
    }
  });

  // Bind dictate button click
  elements.dictateButton.addEventListener('click', toggleDictation);
}

/**
 * Toggle dictation on/off
 */
function toggleDictation() {
  if (!dictationManager) {
    showErrorToast('Speech recognition is not supported in this browser.');
    return;
  }

  const isListening = dictationManager.toggle();
  if (isListening) {
    // Focus the textarea so speech results insert at cursor
    elements.noteArea.focus();
  } else {
    // Stopped - check spelling on the new content
    if (spellcheckManager?.isEnabled()) {
      spellcheckManager.checkText(true);
    }
  }
}

/**
 * Open side panel from popup
 */
async function openSidePanel() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'openSidePanel' });
    if (response?.success) {
      // Close popup after opening side panel
      window.close();
    } else {
      showErrorToast('Failed to open side panel');
    }
  } catch (error) {
    console.error('Failed to open side panel:', error);
    showErrorToast('Failed to open side panel');
  }
}

// ============================================
// Image Support Functions
// ============================================

/**
 * Initialize image manager for paste/drop support
 */
function initImageManager() {
  // Handle paste events on the note area
  elements.noteArea.addEventListener('paste', handleImagePaste);

  // Handle drag and drop
  elements.noteArea.addEventListener('dragover', (e) => {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      elements.noteArea.classList.add('drag-over');
    }
  });

  elements.noteArea.addEventListener('dragleave', () => {
    elements.noteArea.classList.remove('drag-over');
  });

  elements.noteArea.addEventListener('drop', handleImageDrop);

  // Add image button click handler
  if (elements.addImageButton) {
    elements.addImageButton.addEventListener('click', handleAddImageFromPicker);
  }
}

/**
 * Handle paste event for images
 */
async function handleImagePaste(event) {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault();
      const blob = item.getAsFile();
      if (blob) {
        const imageId = await addImageToGallery(blob);
        // Insert a visible placeholder in the textarea at cursor position
        if (imageId && elements.noteArea) {
          const cursorPos = elements.noteArea.selectionStart;
          const textBefore = elements.noteArea.value.substring(0, cursorPos);
          const textAfter = elements.noteArea.value.substring(elements.noteArea.selectionEnd);
          const placeholder = '[Image]';
          const insertText = (textBefore.length > 0 && !textBefore.endsWith(' ') && !textBefore.endsWith('\n') ? ' ' : '') + placeholder;
          elements.noteArea.value = textBefore + insertText + textAfter;
          // Position cursor after the placeholder
          const newPos = cursorPos + insertText.length;
          elements.noteArea.selectionStart = newPos;
          elements.noteArea.selectionEnd = newPos;
          elements.noteArea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        announce('Image pasted — see gallery below');
      }
      return;
    }
  }
}

/**
 * Handle drop event for images
 */
async function handleImageDrop(event) {
  event.preventDefault();
  elements.noteArea.classList.remove('drag-over');

  const files = event.dataTransfer?.files;
  if (!files) return;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await addImageToGallery(file);
    }
  }
}

/**
 * Handle adding image from file picker
 */
async function handleAddImageFromPicker() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';

  input.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await addImageToGallery(file);
    }
    input.remove();
  });

  document.body.appendChild(input);
  input.click();
}

/**
 * Add image to the gallery and IndexedDB
 */
async function addImageToGallery(blob) {
  try {
    showSaveIndicator('Adding image...');

    // Compress and convert to data URI
    const dataUri = await compressImage(blob);

    // Generate unique ID
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get current state and active note
    const state = stateManager.getState();
    const { activeId } = getActiveNoteState(state);

    // Save image to IndexedDB
    await ImageStorage.saveImage({
      id: imageId,
      noteId: activeId,
      dataUri,
      createdAt: Date.now()
    });

    // Update notes array with only the image reference (not the full dataUri)
    const updatedNotes = (state.notes || []).map(note => {
      if (note.id === activeId) {
        return {
          ...note,
          imageIds: [...(note.imageIds || []), imageId],
          modified: Date.now()
        };
      }
      return note;
    });

    // Save state
    stateManager.save({ notes: updatedNotes });

    // Re-render gallery
    await renderImageGallery();

    announce('Image added');
    showSaveIndicator('Saved');
    return imageId;
  } catch (error) {
    console.error('Failed to add image:', error);
    announce('Failed to add image', 'assertive');
    return null;
  }
}

/**
 * Compress image to reduce storage size
 */
async function compressImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions (max 800px width)
      const maxWidth = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * scale);
      }

      // Create canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG for smaller size
      const dataUri = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUri);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Render the image gallery for the active note
 * Loads images from IndexedDB
 */
async function renderImageGallery() {
  const state = stateManager.getState();
  const { activeId, note: activeNote } = getActiveNoteState(state);

  // Support both old format (images array) and new format (imageIds array)
  const imageIds = activeNote?.imageIds || [];
  const legacyImages = activeNote?.images || [];

  // Migrate legacy images if present
  if (legacyImages.length > 0 && imageIds.length === 0) {
    await migrateNoteLegacyImages(activeId, activeNote);
    return; // migrateNoteLegacyImages will call renderImageGallery again
  }

  // Hide gallery if no images
  if (imageIds.length === 0) {
    elements.imageGallery?.classList.add('hidden');
    return;
  }

  // Load images from IndexedDB
  const images = await ImageStorage.getImagesForNote(activeId);

  if (images.length === 0) {
    elements.imageGallery?.classList.add('hidden');
    return;
  }

  elements.imageGallery?.classList.remove('hidden');

  // Clear existing thumbnails
  if (elements.imageGalleryGrid) {
    elements.imageGalleryGrid.innerHTML = '';

    // Create thumbnail for each image
    images.forEach(imageData => {
      const item = document.createElement('div');
      item.className = 'image-gallery-item';
      item.dataset.imageId = imageData.id;

      const img = document.createElement('img');
      img.src = imageData.dataUri;
      img.alt = 'Attached image';
      img.loading = 'lazy';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.type = 'button';
      deleteBtn.innerHTML = '<i class="codicon codicon-close" aria-hidden="true"></i>';
      deleteBtn.setAttribute('aria-label', 'Delete image');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteImage(imageData.id);
      });

      // Click to view full size
      img.addEventListener('click', () => viewImage(imageData.dataUri));

      item.appendChild(img);
      item.appendChild(deleteBtn);
      elements.imageGalleryGrid.appendChild(item);
    });
  }
}

/**
 * Migrate legacy embedded images to IndexedDB
 */
async function migrateNoteLegacyImages(noteId, note) {
  if (!note.images || note.images.length === 0) return;

  const imageIds = [];

  for (const image of note.images) {
    try {
      await ImageStorage.saveImage({
        id: image.id,
        noteId: noteId,
        dataUri: image.dataUri,
        createdAt: image.createdAt || Date.now()
      });
      imageIds.push(image.id);
    } catch (error) {
      console.error('Failed to migrate image:', image.id, error);
    }
  }

  // Update note to use imageIds instead of embedded images
  const state = stateManager.getState();
  const updatedNotes = (state.notes || []).map(n => {
    if (n.id === noteId) {
      const { images, ...restNote } = n; // Remove legacy images
      return {
        ...restNote,
        imageIds,
        modified: Date.now()
      };
    }
    return n;
  });

  stateManager.save({ notes: updatedNotes });
  await renderImageGallery();
}

/**
 * Delete an image from the active note and IndexedDB
 */
async function deleteImage(imageId) {
  const state = stateManager.getState();
  const { activeId } = getActiveNoteState(state);

  // Delete from IndexedDB
  try {
    await ImageStorage.deleteImage(imageId);
  } catch (error) {
    console.error('Failed to delete image from IndexedDB:', error);
  }

  // Update note state to remove image reference
  const updatedNotes = (state.notes || []).map(note => {
    if (note.id === activeId) {
      return {
        ...note,
        imageIds: (note.imageIds || []).filter(id => id !== imageId),
        // Also clean up legacy images array if present
        images: (note.images || []).filter(img => img.id !== imageId),
        modified: Date.now()
      };
    }
    return note;
  });

  stateManager.save({ notes: updatedNotes });
  await renderImageGallery();
  announce('Image removed');
}

/**
 * View image in a larger overlay
 */
function viewImage(dataUri) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'image-view-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    cursor: pointer;
  `;

  const img = document.createElement('img');
  img.src = dataUri;
  img.style.cssText = 'max-width: 95%; max-height: 95%; object-fit: contain;';

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  // Click to close
  overlay.addEventListener('click', () => overlay.remove());

  // Escape to close
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function handleCommandMessage(message) {
  if (message.type !== 'command') {
    return;
  }

  switch (message.command) {
    case 'copy-all':
      copyAll();
      break;
    case 'download-note':
      downloadNote();
      break;
    case 'clear-note':
      clearNote();
      break;
    case 'toggle-theme-panel':
      panelManager.toggle('theme');
      break;
  }
}

// ============================================
// System Theme Auto-Detection
// ============================================

let systemThemeMediaQuery = null;

function setupSystemThemeListener() {
  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
}

function handleSystemThemeChange(event) {
  const state = stateManager.getState();
  if (state.theme === 'system') {
    // Re-apply system theme to pick up the new preference
    const effectiveTheme = ThemeManager.getSystemTheme();
    themeManager.setTheme(effectiveTheme, { skipSave: true });
    // Update theme chips to show system as selected
    const allThemeClasses = ThemeManager.getAllThemeClasses();
    allThemeClasses.push('theme-system');
    document.querySelectorAll('.theme-chip').forEach(chip => {
      const isSelected = chip.dataset.theme === 'system';
      chip.classList.toggle('active', isSelected);
    });
  }
}

// ============================================
// Emoji Search
// ============================================

/**
 * Filter emoji grid by search text
 */
function handleEmojiSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  const buttons = elements.emojiGrid.querySelectorAll('.emoji-btn');

  buttons.forEach(btn => {
    const emoji = btn.textContent;
    // Simple search: match emoji itself or its unicode name hint
    // For better results, check if the emoji is in our list with known descriptions
    if (!query || emoji.includes(query) || matchEmojiDescription(emoji, query)) {
      btn.style.display = '';
    } else {
      btn.style.display = 'none';
    }
  });
}

/**
 * Match emoji by common description keywords
 */
function matchEmojiDescription(emoji, query) {
  const descriptions = {
    '😀': 'smile grin happy face',
    '😁': 'smile grin happy',
    '😂': 'laugh joy tears funny crying face',
    '🤣': 'rofl laugh roll floor funny',
    '😊': 'smile blush happy',
    '😍': 'love heart eyes smile',
    '🤓': 'nerd geek glasses smart',
    '😎': 'cool sunglasses smile',
    '🤩': 'star eyes wow amazed',
    '🥳': 'party celebrate birthday hat',
    '😌': 'relief relaxed sigh',
    '🤔': 'think thinking hmm face',
    '😴': 'sleep sleeping tired zzz',
    '😇': 'angel halo innocent',
    '🙌': 'praise celebrate hands raised',
    '👏': 'clap applause hands',
    '👍': 'thumbs up ok yes like',
    '🔥': 'fire hot flame cool',
    '✨': 'sparkles magic shiny stars',
    '🌈': 'rainbow pride color',
    '📌': 'pin pushpin marker',
    '📝': 'memo note write pencil',
    '✅': 'check mark todo done complete',
    '⚡': 'lightning bolt fast energy power zap',
    '💡': 'lightbulb idea light inspiration',
    '📎': 'paperclip clip attach',
    '🔖': 'bookmark tag save',
    '📚': 'books read library study',
    '⏰': 'alarm clock time',
    '🎯': 'target goal bullseye aim',
    '🧠': 'brain mind smart intelligence',
    '💭': 'thought bubble think dream',
    '🛠️': 'tools wrench fix build',
    '🎶': 'music note melody song',
    '🍀': 'clover luck lucky shamrock',
    '🌟': 'star glowing important highlight',
    '🚀': 'rocket launch spaceship fast deploy',
    '🧭': 'compass navigate direction',
    '📍': 'location pin place marker',
    '💬': 'speech bubble chat talk comment'
  };
  return descriptions[emoji]?.includes(query) || false;
}

// ============================================
// Note Search / Find
// ============================================

let noteSearchMatches = [];
let noteSearchCurrentIndex = -1;

function openNoteSearch() {
  if (!elements.noteSearchBar || !elements.noteSearchInput) return;

  elements.noteSearchBar.classList.remove('hidden');
  elements.noteSearchInput.value = '';
  elements.noteSearchInput.focus();
  noteSearchMatches = [];
  noteSearchCurrentIndex = -1;
  updateSearchResults();
}

function closeNoteSearch() {
  if (!elements.noteSearchBar) return;
  elements.noteSearchBar.classList.add('hidden');
  noteSearchMatches = [];
  noteSearchCurrentIndex = -1;
  // Clear any search highlights from the textarea (we use the browser's native selection)
  elements.noteArea.focus();
}

function handleNoteSearchInput(event) {
  const query = event.target.value;
  if (!query) {
    noteSearchMatches = [];
    noteSearchCurrentIndex = -1;
    updateSearchResults();
    return;
  }

  // Find all matches
  const text = elements.noteArea.value;
  noteSearchMatches = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let startIndex = 0;

  while (startIndex < lowerText.length) {
    const index = lowerText.indexOf(lowerQuery, startIndex);
    if (index === -1) break;
    noteSearchMatches.push({ start: index, end: index + query.length });
    startIndex = index + 1;
  }

  noteSearchCurrentIndex = noteSearchMatches.length > 0 ? 0 : -1;
  updateSearchResults();

  // Highlight first match
  if (noteSearchMatches.length > 0) {
    highlightSearchMatch(0);
  }
}

function goToPrevMatch() {
  if (noteSearchMatches.length === 0) return;
  noteSearchCurrentIndex =
    (noteSearchCurrentIndex - 1 + noteSearchMatches.length) % noteSearchMatches.length;
  highlightSearchMatch(noteSearchCurrentIndex);
}

function goToNextMatch() {
  if (noteSearchMatches.length === 0) return;
  noteSearchCurrentIndex = (noteSearchCurrentIndex + 1) % noteSearchMatches.length;
  highlightSearchMatch(noteSearchCurrentIndex);
}

function highlightSearchMatch(index) {
  const match = noteSearchMatches[index];
  if (!match) return;
  elements.noteArea.focus();
  elements.noteArea.setSelectionRange(match.start, match.end);
  // Scroll the match into view (approximate by using line count)
  const linesBefore = elements.noteArea.value.substring(0, match.start).split('\n').length;
  const lineHeight = parseFloat(getComputedStyle(elements.noteArea).lineHeight) || 20;
  elements.noteArea.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
  updateSearchResults();
}

function updateSearchResults() {
  if (!elements.noteSearchResults) return;
  if (noteSearchMatches.length === 0) {
    elements.noteSearchResults.textContent =
      elements.noteSearchInput.value ? 'No matches' : '';
  } else {
    elements.noteSearchResults.textContent =
      `${noteSearchCurrentIndex + 1}/${noteSearchMatches.length}`;
  }
}

// ============================================
// Note Tab Context Menu (Duplicate)
// ============================================

let tabContextMenu = null;
let tabContextMenuNoteId = null;

function showTabContextMenu(event, noteId) {
  event.preventDefault();
  event.stopPropagation();

  // Remove existing menu
  hideTabContextMenu();

  tabContextMenuNoteId = noteId;
  tabContextMenu = document.createElement('div');
  tabContextMenu.className = 'note-tab-context-menu';

  const state = stateManager.getState();
  const note = state.notes?.find(n => n.id === noteId);

  // Pin / Unpin toggle
  if (note) {
    const pinBtn = document.createElement('button');
    pinBtn.type = 'button';
    pinBtn.innerHTML = `<i class="codicon codicon-${note.pinned ? 'unpin' : 'pin'}" aria-hidden="true"></i> ${note.pinned ? 'Unpin Note' : 'Pin Note'}`;
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotePin(noteId);
      hideTabContextMenu();
    });
    tabContextMenu.appendChild(pinBtn);
  }

  const duplicateBtn = document.createElement('button');
  duplicateBtn.type = 'button';
  duplicateBtn.innerHTML = '<i class="codicon codicon-copy" aria-hidden="true"></i> Duplicate Note';
  duplicateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    duplicateNote(noteId);
    hideTabContextMenu();
  });

  tabContextMenu.appendChild(duplicateBtn);
  document.body.appendChild(tabContextMenu);

  // Position near click
  const rect = elements.noteTabs.getBoundingClientRect();
  tabContextMenu.style.top = `${rect.bottom + 4}px`;
  tabContextMenu.style.left = `${Math.min(event.clientX, rect.right - 150)}px`;

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', hideTabContextMenu, { once: true });
  }, 0);
}

function hideTabContextMenu() {
  if (tabContextMenu) {
    tabContextMenu.remove();
    tabContextMenu = null;
    tabContextMenuNoteId = null;
  }
}

/**
 * Toggle pin/unpin on a note
 */
function toggleNotePin(noteId) {
  const state = stateManager.getState();
  const updatedNotes = (state.notes || []).map(note => {
    if (note.id === noteId) {
      return { ...note, pinned: !note.pinned, modified: Date.now() };
    }
    return note;
  });

  const note = (state.notes || []).find(n => n.id === noteId);
  const newPinned = !note?.pinned;
  stateManager.save({ notes: updatedNotes });
  noteTabManager.render();
  announce(newPinned ? 'Note pinned' : 'Note unpinned');
}

/**
 * Duplicate a note tab
 */
function duplicateNote(noteId) {
  const state = stateManager.getState();
  const note = state.notes?.find(n => n.id === noteId);
  if (!note) return;

  const now = Date.now();
  const dupNote = {
    ...note,
    id: `note_${now}_${Math.random().toString(36).substr(2, 9)}`,
    title: `${note.title} (copy)`,
    created: now,
    modified: now,
    imageIds: [...(note.imageIds || [])],
    pinned: false
  };

  const updatedNotes = [...(state.notes || []), dupNote];
  stateManager.save({
    notes: updatedNotes,
    activeNoteId: dupNote.id
  });

  // Switch to duplicated note
  elements.noteArea.value = dupNote.content;
  updateWordCount(dupNote.content);
  noteTabManager.render();
  elements.noteArea.focus();
  announce(`Duplicated "${note.title}"`);
}

// ============================================
// Import Note from File
// ============================================

/**
 * Trigger file picker to import a note
 */
function importNoteFromFile() {
  if (!elements.importNoteInput) return;
  elements.importNoteInput.value = '';
  elements.importNoteInput.click();
}

async function handleImportNote(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file size
  if (file.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
    announce('File too large. Maximum size is 5MB.', 'assertive');
    event.target.value = '';
    return;
  }

  try {
    showSaveIndicator('Importing...');
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    let content = text;
    if (ext === 'json') {
      // Try to parse as Hyperscribe settings export
      try {
        const parsed = JSON.parse(text);
        if (parsed.note) {
          content = parsed.note;
        } else if (parsed.notes && Array.isArray(parsed.notes)) {
          // Import just the first note's content
          content = parsed.notes[0]?.content || text;
        }
      } catch (e) {
        // Not valid JSON, just use as text
        content = text;
      }
    }

    // Create new note tab with imported content
    const now = Date.now();
    const title = NotesManager.extractTitle(content) || file.name.replace(/\.[^.]+$/, '');
    const newNote = {
      id: `note_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      created: now,
      modified: now,
      tags: [],
      pinned: false,
      archived: false,
      imageIds: []
    };

    const state = stateManager.getState();
    const updatedNotes = [...(state.notes || []), newNote];
    stateManager.save({
      notes: updatedNotes,
      activeNoteId: newNote.id
    });

    elements.noteArea.value = content;
    updateWordCount(content);
    noteTabManager.render();
    elements.noteArea.focus();

    hideSaveIndicator({ delay: 800, message: 'Imported!' });
    announce(`Imported "${file.name}"`);
  } catch (error) {
    console.error('Failed to import note:', error);
    hideSaveIndicator({ delay: 800, message: 'Failed' });
    announce('Failed to import file', 'assertive');
  } finally {
    event.target.value = '';
  }
}

init();
