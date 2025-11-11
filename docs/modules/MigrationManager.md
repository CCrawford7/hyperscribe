# MigrationManager

**File:** `/modules/migrationManager.js`

The `MigrationManager` is used in the background script (`background.js`) to handle data migrations. When the extension is updated and the storage schema changes, this manager runs migrations to ensure user data is compatible with the new version.

## Code

```javascript
// /modules/migrationManager.js

import { STORAGE_KEY } from '../shared/constants.js';

export const CURRENT_VERSION = 1;

export default class MigrationManager {
  // Each function corresponds to the version it migrates *to*.
  // e.g., migrations[1] migrates from version 0 to version 1.
  #migrations = {
    1: state => {
      // Migration from initial state (version 0) to version 1.
      // In v1, we introduce the multi-note structure.
      const oldNote = state.note || '';
      const now = Date.now();
      const firstNote = {
        id: `note_${now}`,
        title: oldNote.split('\n')[0].trim().slice(0, 50) || 'My First Note',
        content: oldNote,
        created: now,
        modified: now,
        tags: [],
        pinned: false,
        archived: false
      };

      return {
        ...state,
        notes: [firstNote],
        activeNoteId: firstNote.id,
        version: 1
      };
    }
    // Future migrations would be added here, e.g.:
    // 2: state => { ... return migratedState; }
  };

  runMigrations(state, startVersion, endVersion) {
    let migratedState = { ...state };
    for (let v = startVersion + 1; v <= endVersion; v++) {
      if (this.#migrations[v]) {
        migratedState = this.#migrations[v](migratedState);
      }
    }
    migratedState.version = endVersion;
    return migratedState;
  }
}
```

## Usage

The `MigrationManager` is used in `background.js` within the `chrome.runtime.onInstalled` listener to update the user's data structure to the latest version.

```
