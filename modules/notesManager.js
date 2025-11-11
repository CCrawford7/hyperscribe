// /modules/notesManager.js

export default class NotesManager {
  /**
   * Creates a new note object.
   * @param {string} title - The title of the note.
   * @param {string} content - The content of the note.
   * @returns {object} A new note object.
   */
  createNote(title = '', content = '') {
    const now = Date.now();
    return {
      id: `note_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || NotesManager.extractTitle(content) || 'Untitled Note',
      content: content,
      created: now,
      modified: now,
      tags: [],
      pinned: false,
      archived: false
    };
  }

  /**
   * Extracts a title from the first non-empty line of content.
   * @param {string} content - The note content.
   * @returns {string} The extracted title or an empty string.
   */
  static extractTitle(content = '') {
    const firstLine = content.split('\n')[0].trim();
    // Remove markdown heading characters like #
    return firstLine.replace(/^[#\s]+/, '');
  }
}
