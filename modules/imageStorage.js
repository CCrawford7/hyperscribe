// /modules/imageStorage.js

/**
 * ImageStorage provides IndexedDB-based storage for images.
 * This allows storing larger images without hitting chrome.storage.local limits.
 *
 * Images are stored as blobs in IndexedDB and referenced by ID in note state.
 */
export default class ImageStorage {
  static DB_NAME = 'hyperscribe-images';
  static DB_VERSION = 1;
  static STORE_NAME = 'images';

  static #db = null;
  static #initPromise = null;

  /**
   * Initialize the IndexedDB database
   * @returns {Promise<IDBDatabase>}
   */
  static async init() {
    // Return existing promise if already initializing
    if (this.#initPromise) {
      return this.#initPromise;
    }

    // Return existing db if already initialized
    if (this.#db) {
      return this.#db;
    }

    this.#initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('ImageStorage: Failed to open database', request.error);
        this.#initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.#db = request.result;
        resolve(this.#db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for images
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('noteId', 'noteId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });

    return this.#initPromise;
  }

  /**
   * Ensure database is initialized
   * @returns {Promise<IDBDatabase>}
   * @private
   */
  static async #ensureDb() {
    if (!this.#db) {
      await this.init();
    }
    return this.#db;
  }

  /**
   * Save an image to IndexedDB
   * @param {Object} imageData - Image data object
   * @param {string} imageData.id - Unique image ID
   * @param {string} imageData.noteId - ID of the note this image belongs to
   * @param {string} imageData.dataUri - Base64 data URI of the image
   * @param {number} [imageData.createdAt] - Creation timestamp
   * @returns {Promise<string>} The image ID
   */
  static async saveImage(imageData) {
    const db = await this.#ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const record = {
        id: imageData.id,
        noteId: imageData.noteId,
        dataUri: imageData.dataUri,
        createdAt: imageData.createdAt || Date.now()
      };

      const request = store.put(record);

      request.onsuccess = () => resolve(imageData.id);
      request.onerror = () => {
        console.error('ImageStorage: Failed to save image', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get an image by ID
   * @param {string} imageId - Image ID
   * @returns {Promise<Object|null>} The image data or null if not found
   */
  static async getImage(imageId) {
    const db = await this.#ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(imageId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        console.error('ImageStorage: Failed to get image', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all images for a note
   * @param {string} noteId - Note ID
   * @returns {Promise<Object[]>} Array of image data objects
   */
  static async getImagesForNote(noteId) {
    const db = await this.#ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('noteId');
      const request = index.getAll(noteId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('ImageStorage: Failed to get images for note', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete an image by ID
   * @param {string} imageId - Image ID
   * @returns {Promise<void>}
   */
  static async deleteImage(imageId) {
    const db = await this.#ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(imageId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('ImageStorage: Failed to delete image', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete all images for a note
   * @param {string} noteId - Note ID
   * @returns {Promise<void>}
   */
  static async deleteImagesForNote(noteId) {
    const images = await this.getImagesForNote(noteId);
    await Promise.all(images.map(img => this.deleteImage(img.id)));
  }

  /**
   * Get all images
   * @returns {Promise<Object[]>} Array of all image data objects
   */
  static async getAllImages() {
    const db = await this.#ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('ImageStorage: Failed to get all images', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all images from the database
   * @returns {Promise<void>}
   */
  static async clearAll() {
    const db = await this.#ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('ImageStorage: Failed to clear images', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} Object with count and estimated size
   */
  static async getStorageStats() {
    const images = await this.getAllImages();
    let totalSize = 0;

    images.forEach(img => {
      // Estimate size from data URI (roughly 75% of base64 string length)
      if (img.dataUri) {
        totalSize += Math.ceil((img.dataUri.length - 22) * 0.75);
      }
    });

    return {
      count: images.length,
      estimatedBytes: totalSize,
      estimatedMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  }

  /**
   * Migrate images from note state to IndexedDB
   * @param {Object[]} notes - Array of notes with embedded images
   * @returns {Promise<Object>} Migration result with counts
   */
  static async migrateFromNoteState(notes) {
    let migrated = 0;
    let errors = 0;

    for (const note of notes) {
      if (!note.images || note.images.length === 0) continue;

      for (const image of note.images) {
        try {
          // Check if already migrated
          const existing = await this.getImage(image.id);
          if (!existing) {
            await this.saveImage({
              id: image.id,
              noteId: note.id,
              dataUri: image.dataUri,
              createdAt: image.createdAt || Date.now()
            });
            migrated++;
          }
        } catch (error) {
          console.error('ImageStorage: Migration error for image', image.id, error);
          errors++;
        }
      }
    }

    return { migrated, errors };
  }

  /**
   * Close the database connection
   */
  static close() {
    if (this.#db) {
      this.#db.close();
      this.#db = null;
      this.#initPromise = null;
    }
  }
}
