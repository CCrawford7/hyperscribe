# NotesManager

**File:** `/modules/notesManager.js`

The `NotesManager` is a utility class for creating and managing note objects.

## Code

```javascript
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
```

## Usage

The `NotesManager` is used in `popup.js` to create new note objects when a new tab is added or when content is updated in a way that generates a new note.

```
