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
import {
  RESIZE_MIN_WIDTH,
  RESIZE_MIN_HEIGHT,
  RESIZE_MAX_WIDTH,
  RESIZE_MAX_HEIGHT
} from './shared/constants.js';

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
  emojiPanel: document.getElementById('emojiPanel'),
  emojiGrid: document.getElementById('emojiGrid'),
  noteArea: document.getElementById('noteArea'),
  storageUsage: document.getElementById('storageUsage'),
  clearStorageButton: document.getElementById('clearStorageButton'),
  floatWindowButton: document.getElementById('floatWindowButton'),
  confirmOverlay: document.getElementById('confirmOverlay'),
  confirmMessage: document.getElementById('confirmMessage'),
  confirmAcceptButton: document.getElementById('confirmAcceptButton'),
  confirmCancelButton: document.getElementById('confirmCancelButton'),
  confirmDontAskCheckbox: document.getElementById('confirmDontAskCheckbox'),
  closePopupButton: document.getElementById('closePopupButton'),
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
  addNoteTab: document.getElementById('addNoteTab')
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
let currentSpellcheckWord = null; // Currently right-clicked misspelled word
let isExportMenuOpen = false;
let isMoreMenuOpen = false;
const notesManager = new NotesManager();
let saveIndicatorTimeout = null;

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

  // Initialize spellcheck manager
  try {
    await spellcheckManager.initialize();
  } catch (error) {
    console.error('Failed to initialize spellcheck:', error);
  }

  renderEmojiButtons();
  await loadCustomTemplates();
  renderTemplates();
  bindEvents();
  await hydrateState();
  // Populate more menu for responsive layout
  populateMoreMenu();

  // Listen for window resize in floating windows
  window.addEventListener('resize', handleWindowResize);
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
        case 'syncButton':
          panelManager.toggle('sync');
          break;
      }

      closeMoreMenu();
    });

    moreMenu.appendChild(clone);
  });
}

function toggleMoreMenu() {
  if (!elements.moreMenu || !elements.moreButton) {
    return;
  }

  isMoreMenuOpen = !isMoreMenuOpen;
  elements.moreButton.setAttribute('aria-expanded', String(isMoreMenuOpen));
  elements.moreMenu.classList.toggle('hidden', !isMoreMenuOpen);
  elements.moreMenu.setAttribute('aria-hidden', String(!isMoreMenuOpen));
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
}

function handleTemplateSelect(templateId) {
  try {
    const content = templateManager.applyTemplate(templateId);
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
    const result = await chrome.storage.local.get('customTemplates');
    const customTemplates = result.customTemplates || [];
    templateManager.loadCustomTemplates(customTemplates);
  } catch (error) {
    console.warn('Hyperscribe: failed to load custom templates', error);
  }
}

async function saveCustomTemplates() {
  try {
    const customTemplates = templateManager.getCustomTemplates();
    await chrome.storage.local.set({ customTemplates });
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
  const customTemplates = templateManager.getCustomTemplates();

  if (customTemplates.length === 0) {
    announce('No custom templates to export', 'assertive');
    return;
  }

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    templates: customTemplates.map(t => ({
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

  announce(`Exported ${customTemplates.length} template${customTemplates.length === 1 ? '' : 's'}`);
}

async function handleImportTemplates(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate structure
    if (!data.templates || !Array.isArray(data.templates)) {
      throw new Error('Invalid template file format');
    }

    // Validate each template
    const validTemplates = data.templates.filter(t => {
      return t.name && typeof t.name === 'string' &&
             t.content && typeof t.content === 'string';
    });

    if (validTemplates.length === 0) {
      throw new Error('No valid templates found in file');
    }

    // Import templates
    let importedCount = 0;
    for (const t of validTemplates) {
      try {
        templateManager.addTemplate({
          name: t.name,
          icon: t.icon || '📄',
          description: t.description || '',
          content: t.content
        });
        importedCount++;
      } catch (err) {
        // Template with same name may already exist, skip it
        console.warn('Skipped template:', t.name, err.message);
      }
    }

    if (importedCount > 0) {
      await saveCustomTemplates();
      renderTemplates();
      announce(`Imported ${importedCount} template${importedCount === 1 ? '' : 's'}`);
    } else {
      announce('No new templates imported (may already exist)', 'assertive');
    }
  } catch (error) {
    console.error('Failed to import templates:', error);
    announce(error.message || 'Failed to import templates', 'assertive');
  } finally {
    // Reset file input so same file can be selected again
    event.target.value = '';
  }
}

function renderNoteTabs() {
  const state = stateManager.getState();
  const notes = state.notes || [];
  const activeId = state.activeNoteId || (notes.length > 0 ? notes[0].id : null);

  if (!elements.noteTabList) {
    return;
  }

  elements.noteTabList.innerHTML = '';

  if (notes.length === 0) {
    // Hide tab bar if no notes
    if (elements.noteTabs) {
      elements.noteTabs.style.display = 'none';
    }
    return;
  }

  // Show tab bar
  if (elements.noteTabs) {
    elements.noteTabs.style.display = 'flex';
  }

  const fragment = document.createDocumentFragment();

  notes.forEach(note => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'note-tab';
    tab.dataset.noteId = note.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', note.id === activeId ? 'true' : 'false');

    if (note.id === activeId) {
      tab.classList.add('active');
    }

    const title = document.createElement('span');
    title.className = 'note-tab-title';
    title.textContent = note.title || 'Untitled Note';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'note-tab-close';
    closeBtn.setAttribute('aria-label', `Close ${note.title || 'note'}`);
    closeBtn.innerHTML = '<i class="codicon codicon-close" aria-hidden="true"></i>';
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      handleCloseNoteTab(note.id);
    });

    tab.appendChild(title);
    tab.appendChild(closeBtn);
    tab.addEventListener('click', () => handleSwitchNoteTab(note.id));

    fragment.appendChild(tab);
  });

  elements.noteTabList.appendChild(fragment);
}

function handleSwitchNoteTab(noteId) {
  const state = stateManager.getState();
  const note = state.notes?.find(n => n.id === noteId);

  if (!note) {
    return;
  }

  // Save current note content before switching
  const currentContent = elements.noteArea.value;
  updateActiveNoteContent(currentContent);

  // Switch to new note
  stateManager.save({ activeNoteId: noteId });
  elements.noteArea.value = note.content || '';
  updateWordCount(note.content || '');
  renderNoteTabs();
  // Re-check spelling for the new tab content
  if (spellcheckManager && spellcheckManager.isEnabled()) {
    spellcheckManager.checkText(true);
  } else if (spellcheckRenderer) {
    spellcheckRenderer.clear();
  }
  elements.noteArea.focus();
  announce(`Switched to ${note.title}`);
}

function handleAddNoteTab() {
  const newNote = notesManager.createNote('', '');
  const state = stateManager.getState();
  const notes = state.notes || [];

  const updatedNotes = [...notes, newNote];
  stateManager.save({
    notes: updatedNotes,
    activeNoteId: newNote.id
  });

  elements.noteArea.value = '';
  updateWordCount('');
  // Clear spellcheck highlights for new tab
  if (spellcheckRenderer) {
    spellcheckRenderer.clear();
  }
  renderNoteTabs();
  elements.noteArea.focus();
  announce('New note created');
}

function handleCloseNoteTab(noteId) {
  const state = stateManager.getState();
  const notes = state.notes || [];
  const note = notes.find(n => n.id === noteId);

  if (!note) {
    return;
  }

  // Prevent closing if it's the last note
  if (notes.length === 1) {
    announce('Cannot close the last note', 'assertive');
    return;
  }

  // Check if user wants confirmation
  if (!state.suppressTabCloseConfirm) {
    confirmationDialog.show({
      message: `Close note "${note.title}"? This action cannot be undone.`,
      confirmLabel: 'Close Note',
      onConfirm: context => {
        if (context.suppressFutureConfirms) {
          stateManager.save({ suppressTabCloseConfirm: true });
        }
        performCloseNoteTab(noteId);
      },
      includeDontAsk: true
    });
    return;
  }

  performCloseNoteTab(noteId);
}

function performCloseNoteTab(noteId) {
  const state = stateManager.getState();
  const notes = state.notes || [];
  const updatedNotes = notes.filter(n => n.id !== noteId);
  let newActiveId = state.activeNoteId;

  // If we're closing the active note, switch to another
  if (noteId === state.activeNoteId) {
    const currentIndex = notes.findIndex(n => n.id === noteId);
    const nextNote =
      updatedNotes[currentIndex] || updatedNotes[currentIndex - 1] || updatedNotes[0];
    newActiveId = nextNote.id;
    elements.noteArea.value = nextNote.content || '';
    updateWordCount(nextNote.content || '');
  }

  const note = notes.find(n => n.id === noteId);
  stateManager.save({
    notes: updatedNotes,
    activeNoteId: newActiveId
  });

  renderNoteTabs();
  announce(`Note "${note.title}" closed`);
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

function exportNote(format, { silent = false } = {}) {
  const content = elements.noteArea.value;
  const metadata = collectExportMetadata(content);
  const filename = buildExportFilename(format, metadata.title);

  let formattedContent = content;

  switch (format) {
    case 'md':
      formattedContent = exportFormatter.formatAsMarkdown(content, metadata, true);
      break;
    case 'html':
      formattedContent = exportFormatter.formatAsHTML(content, metadata, true);
      break;
    default:
      formattedContent = exportFormatter.formatAsText(content, metadata, true);
      format = 'txt';
      break;
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

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const text = String(reader.result ?? '');
      const parsed = JSON.parse(text);
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
      announce('Invalid or corrupted settings file', 'assertive');
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

function updateActiveNoteContent(content) {
  const state = stateManager.getState();

  if (Array.isArray(state.notes) && state.notes.length > 0) {
    const { note: activeNote, activeId } = getActiveNoteState(state);
    const nextId = activeId || activeNote.id;
    const updatedNotes = state.notes.map(note => {
      if (note.id === nextId) {
        return {
          ...note,
          content,
          title: NotesManager.extractTitle(content),
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
    return;
  }

  const fallbackNote = notesManager.createNote('', content);
  stateManager.save({
    notes: [fallbackNote],
    activeNoteId: fallbackNote.id,
    note: content,
    lastModified: Date.now()
  });
}

function applyStateToUI(state) {
  const { note: activeNote } = getActiveNoteState(state);
  elements.noteArea.value = activeNote.content ?? state.note ?? '';
  const themeId = themeManager.resolveThemeId(state);
  themeManager.setTheme(themeId, { skipSave: true });
  fontManager.apply(state.font);

  // Check window type and apply appropriate sizing
  chrome.windows.getCurrent((win) => {
    const isFloatingWindow = win && win.type === 'popup';

    if (isFloatingWindow) {
      // In floating window, fill the entire window
      document.documentElement.style.setProperty('--popup-width', '100vw');
      document.documentElement.style.setProperty('--popup-height', '100vh');
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      // Hide the float button since we're already floating
      if (elements.floatWindowButton) {
        elements.floatWindowButton.style.display = 'none';
      }
    } else if (state.windowSize) {
      // Extension popup - apply saved dimensions
      document.documentElement.style.setProperty('--popup-width', state.windowSize.width + 'px');
      document.documentElement.style.setProperty('--popup-height', state.windowSize.height + 'px');
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  });

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
  renderNoteTabs();
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
  // Note tab events
  elements.addNoteTab && elements.addNoteTab.addEventListener('click', handleAddNoteTab);
  elements.downloadButton.addEventListener('click', toggleExportMenu);
  elements.exportMenu.addEventListener('click', handleExportMenuClick);
  elements.clearStorageButton.addEventListener('click', clearStoredData);
  elements.floatWindowButton &&
    elements.floatWindowButton.addEventListener('click', openFloatingWindow);
  elements.noteArea.addEventListener('input', handleNoteChange);

  // Spellcheck events
  elements.spellcheckToggle && elements.spellcheckToggle.addEventListener('change', handleSpellcheckToggle);
  elements.spellcheckLangSelect && elements.spellcheckLangSelect.addEventListener('change', handleSpellcheckLangChange);
  elements.noteArea.addEventListener('contextmenu', handleSpellcheckContextMenu);
  elements.addToDictionaryBtn && elements.addToDictionaryBtn.addEventListener('click', handleAddToDictionary);
  document.addEventListener('click', hideSpellcheckContextMenu);

  // More menu toggle
  if (elements.moreButton) {
    elements.moreButton.addEventListener('click', e => {
      e.stopPropagation();
      toggleMoreMenu();
    });
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
  elements.closePopupButton &&
    elements.closePopupButton.addEventListener('click', () => window.close());
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

  // Listen for keyboard shortcut commands from background
  chrome.runtime.onMessage.addListener(handleCommandMessage);
}

function handleStateChange(state) {
  updateWordCount(state?.note ?? elements.noteArea.value);
  hideSaveIndicator({ delay: 400, message: 'Saved' });
}

function handleThemeChange(themeId) {
  stateManager.save({ theme: themeId });
  const theme = ThemeManager.THEMES[themeId];
  if (theme) {
    announce(`Theme changed to ${theme.label}`);
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
  showSaveIndicator();
  updateWordCount(value);
  updateActiveNoteContent(value);
  renderNoteTabs();

  // Trigger spellcheck if enabled
  if (spellcheckManager && spellcheckManager.isEnabled()) {
    spellcheckManager.checkText();
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

  if (isExportMenuOpen && event.key === 'Escape') {
    closeExportMenu();
    return;
  }

  if (event.key === 'Escape' && isMoreMenuOpen) {
    closeMoreMenu();
    event.preventDefault();
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
    message: 'Reset all saved Hyperscribe data including note contents and preferences?',
    confirmLabel: 'Clear Data',
    onConfirm: async () => {
      await stateManager.clear();
      const state = stateManager.getState();
      applyStateToUI(state);
    }
  });
}

function openFloatingWindow() {
  const state = stateManager.getState();
  const width = state.windowSize?.width || 480;
  const height = state.windowSize?.height || 600;

  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: width + 16, // Account for window chrome
    height: height + 39, // Account for title bar
    focused: true
  }, () => {
    // Close the current popup after opening the floating window
    window.close();
  });
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

init();
