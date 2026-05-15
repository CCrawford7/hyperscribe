// /modules/noteTabManager.js

import NotesManager from './notesManager.js';

/**
 * NoteTabManager handles note tab UI and operations.
 * Manages rendering, switching, adding, and closing tabs.
 */
export default class NoteTabManager {
  #stateManager = null;
  #notesManager = null;
  #confirmationDialog = null;
  #elements = {};
  #callbacks = {};
  #tabRenderTimeout = null;

  /**
   * @param {Object} options
   * @param {Object} options.stateManager - StateManager instance for state access
   * @param {Object} options.notesManager - NotesManager instance for note creation
   * @param {Object} options.confirmationDialog - ConfirmationDialog for close confirmations
   * @param {Object} options.elements - DOM element references
   * @param {HTMLElement} options.elements.noteTabList - Tab list container
   * @param {HTMLElement} options.elements.noteTabs - Tab bar container
   * @param {HTMLElement} options.elements.noteArea - Note textarea
   * @param {HTMLElement} options.elements.addNoteTab - Add tab button
   * @param {Object} options.callbacks - Callback functions
   * @param {Function} options.callbacks.onSwitch - Called when switching tabs
   * @param {Function} options.callbacks.onAdd - Called when adding a tab
   * @param {Function} options.callbacks.onClose - Called when closing a tab
   * @param {Function} options.callbacks.announce - Screen reader announcement function
   * @param {Function} options.callbacks.updateWordCount - Update word count display
   * @param {Function} options.callbacks.renderImageGallery - Render image gallery for new tab
   * @param {Function} options.callbacks.clearSpellcheck - Clear spellcheck highlights
   * @param {Function} options.callbacks.recheckSpelling - Re-check spelling for new tab
   */
  constructor({ stateManager, notesManager, confirmationDialog, elements, callbacks }) {
    this.#stateManager = stateManager;
    this.#notesManager = notesManager || new NotesManager();
    this.#confirmationDialog = confirmationDialog;
    this.#elements = elements || {};
    this.#callbacks = callbacks || {};
  }

  /**
   * Initialize tab manager - bind event listeners
   */
  init() {
    if (this.#elements.addNoteTab) {
      this.#elements.addNoteTab.addEventListener('click', () => this.addTab());
    }
  }

  /**
   * Render the note tabs based on current state
   */
  render() {
    const state = this.#stateManager.getState();
    const notes = state.notes || [];
    // Sort: pinned notes first, then by modified date descending
    const sortedNotes = [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.modified || 0) - (a.modified || 0);
    });
    const activeId = state.activeNoteId || (notes.length > 0 ? notes[0].id : null);

    if (!this.#elements.noteTabList) {
      return;
    }

    this.#elements.noteTabList.innerHTML = '';

    if (notes.length === 0) {
      // Hide tab bar if no notes
      if (this.#elements.noteTabs) {
        this.#elements.noteTabs.style.display = 'none';
      }
      return;
    }

    // Show tab bar
    if (this.#elements.noteTabs) {
      this.#elements.noteTabs.style.display = 'flex';
    }

    const fragment = document.createDocumentFragment();

    sortedNotes.forEach(note => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'note-tab';
      tab.dataset.noteId = note.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', note.id === activeId ? 'true' : 'false');

      if (note.id === activeId) {
        tab.classList.add('active');
      }
      if (note.pinned) {
        tab.classList.add('pinned');
      }

      const title = document.createElement('span');
      title.className = 'note-tab-title';
      if (note.pinned) {
        const pinIcon = document.createElement('i');
        pinIcon.className = 'codicon codicon-pin';
        pinIcon.setAttribute('aria-hidden', 'true');
        pinIcon.style.fontSize = '10px';
        pinIcon.style.marginRight = '2px';
        title.appendChild(pinIcon);
      }
      title.appendChild(document.createTextNode(note.title || 'Untitled Note'));

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'note-tab-close';
      closeBtn.setAttribute('aria-label', `Close ${note.title || 'note'}`);
      closeBtn.innerHTML = '<i class="codicon codicon-close" aria-hidden="true"></i>';
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.closeTab(note.id);
      });

      tab.appendChild(title);
      tab.appendChild(closeBtn);
      tab.addEventListener('click', () => this.switchTab(note.id));
      tab.addEventListener('contextmenu', (e) => {
        this.#callbacks.onTabContextMenu?.(e, note.id);
      });

      fragment.appendChild(tab);
    });

    this.#elements.noteTabList.appendChild(fragment);
  }

  /**
   * Debounced render - only re-renders after a short delay
   * Useful when title changes frequently
   * @param {number} delay - Debounce delay in ms (default 150)
   */
  debouncedRender(delay = 150) {
    if (this.#tabRenderTimeout) {
      clearTimeout(this.#tabRenderTimeout);
    }
    this.#tabRenderTimeout = setTimeout(() => {
      this.render();
      this.#tabRenderTimeout = null;
    }, delay);
  }

  /**
   * Switch to a different note tab
   * @param {string} noteId - ID of the note to switch to
   */
  switchTab(noteId) {
    const state = this.#stateManager.getState();
    const note = state.notes?.find(n => n.id === noteId);

    if (!note) {
      return;
    }

    // Save current note content before switching
    const currentContent = this.#elements.noteArea?.value || '';
    this.#callbacks.updateActiveNoteContent?.(currentContent);

    // Switch to new note
    this.#stateManager.save({ activeNoteId: noteId });

    if (this.#elements.noteArea) {
      this.#elements.noteArea.value = note.content || '';
    }

    this.#callbacks.updateWordCount?.(note.content || '');
    this.render();
    this.#callbacks.renderImageGallery?.();

    // Re-check spelling for the new tab content
    this.#callbacks.recheckSpelling?.();

    this.#elements.noteArea?.focus();
    this.#callbacks.announce?.(`Switched to ${note.title}`);
    this.#callbacks.onSwitch?.(noteId, note);
  }

  /**
   * Add a new note tab
   * @returns {Object} The newly created note
   */
  addTab() {
    const newNote = this.#notesManager.createNote('', '');
    const state = this.#stateManager.getState();
    const notes = state.notes || [];

    const updatedNotes = [...notes, newNote];
    this.#stateManager.save({
      notes: updatedNotes,
      activeNoteId: newNote.id
    });

    if (this.#elements.noteArea) {
      this.#elements.noteArea.value = '';
    }

    this.#callbacks.updateWordCount?.('');
    this.#callbacks.clearSpellcheck?.();
    this.render();
    this.#elements.noteArea?.focus();
    this.#callbacks.announce?.('New note created');
    this.#callbacks.onAdd?.(newNote);

    return newNote;
  }

  /**
   * Close a note tab (with optional confirmation)
   * @param {string} noteId - ID of the note to close
   */
  closeTab(noteId) {
    const state = this.#stateManager.getState();
    const notes = state.notes || [];
    const note = notes.find(n => n.id === noteId);

    if (!note) {
      return;
    }

    // Prevent closing if it's the last note
    if (notes.length === 1) {
      this.#callbacks.announce?.('Cannot close the last note', 'assertive');
      return;
    }

    // Check if user wants confirmation
    if (!state.suppressTabCloseConfirm && this.#confirmationDialog) {
      this.#confirmationDialog.show({
        message: `Close note "${note.title}"? This action cannot be undone.`,
        confirmLabel: 'Close Note',
        onConfirm: context => {
          if (context.suppressFutureConfirms) {
            this.#stateManager.save({ suppressTabCloseConfirm: true });
          }
          this.#performCloseTab(noteId);
        },
        includeDontAsk: true
      });
      return;
    }

    this.#performCloseTab(noteId);
  }

  /**
   * Actually perform the tab close operation
   * @param {string} noteId - ID of the note to close
   * @private
   */
  #performCloseTab(noteId) {
    const state = this.#stateManager.getState();
    const notes = state.notes || [];
    const updatedNotes = notes.filter(n => n.id !== noteId);
    let newActiveId = state.activeNoteId;

    // If we're closing the active note, switch to another
    if (noteId === state.activeNoteId) {
      const currentIndex = notes.findIndex(n => n.id === noteId);
      const nextNote =
        updatedNotes[currentIndex] || updatedNotes[currentIndex - 1] || updatedNotes[0];
      newActiveId = nextNote.id;

      if (this.#elements.noteArea) {
        this.#elements.noteArea.value = nextNote.content || '';
      }
      this.#callbacks.updateWordCount?.(nextNote.content || '');
    }

    const note = notes.find(n => n.id === noteId);
    this.#stateManager.save({
      notes: updatedNotes,
      activeNoteId: newActiveId
    });

    this.render();
    this.#callbacks.announce?.(`Note "${note.title}" closed`);
    this.#callbacks.onClose?.(noteId, note);
  }

  /**
   * Get the currently active note
   * @returns {Object|null} The active note or null
   */
  getActiveNote() {
    const state = this.#stateManager.getState();
    if (!Array.isArray(state.notes) || state.notes.length === 0) {
      return null;
    }
    const activeId = state.activeNoteId || state.notes[0].id;
    return state.notes.find(note => note.id === activeId) || state.notes[0];
  }

  /**
   * Get all notes
   * @returns {Array} Array of all notes
   */
  getAllNotes() {
    const state = this.#stateManager.getState();
    return state.notes || [];
  }

  /**
   * Get the count of open tabs
   * @returns {number} Number of tabs
   */
  getTabCount() {
    const state = this.#stateManager.getState();
    return (state.notes || []).length;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.#tabRenderTimeout) {
      clearTimeout(this.#tabRenderTimeout);
      this.#tabRenderTimeout = null;
    }
  }
}
