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
