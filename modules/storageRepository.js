// /modules/storageRepository.js

import { STORAGE_KEY } from '../shared/constants.js';

/**
 * StorageRepository provides centralized access to chrome.storage.local.
 * All storage operations should go through this class for consistency.
 */
export default class StorageRepository {
  // Storage quota constants (chrome.storage.local default is ~10MB)
  static STORAGE_QUOTA = 10 * 1024 * 1024;
  static QUOTA_WARNING_THRESHOLD = 0.8; // 80%
  static QUOTA_CRITICAL_THRESHOLD = 0.9; // 90%

  // Storage keys
  static KEYS = {
    STATE: STORAGE_KEY,
    CUSTOM_TEMPLATES: 'customTemplates',
    CUSTOM_DICTIONARY: 'customSpellcheckDictionary'
  };

  /**
   * Get data from storage by key
   * @param {string|string[]} keys - Single key or array of keys
   * @returns {Promise<Object>} The stored data
   */
  static async get(keys) {
    try {
      return await chrome.storage.local.get(keys);
    } catch (error) {
      console.error('StorageRepository: Failed to get data', error);
      return {};
    }
  }

  /**
   * Set data in storage
   * @param {Object} data - Key-value pairs to store
   * @returns {Promise<boolean>} Success status
   */
  static async set(data) {
    try {
      await chrome.storage.local.set(data);
      return true;
    } catch (error) {
      console.error('StorageRepository: Failed to set data', error);
      return false;
    }
  }

  /**
   * Remove data from storage by key
   * @param {string|string[]} keys - Single key or array of keys
   * @returns {Promise<boolean>} Success status
   */
  static async remove(keys) {
    try {
      await chrome.storage.local.remove(keys);
      return true;
    } catch (error) {
      console.error('StorageRepository: Failed to remove data', error);
      return false;
    }
  }

  /**
   * Get bytes in use for specific keys
   * @param {string|string[]|null} keys - Keys to check, or null for all storage
   * @returns {Promise<number>} Bytes in use
   */
  static async getBytesInUse(keys = null) {
    try {
      return await chrome.storage.local.getBytesInUse(keys);
    } catch (error) {
      console.error('StorageRepository: Failed to get bytes in use', error);
      return 0;
    }
  }

  /**
   * Get storage usage information
   * @returns {Promise<Object>} Usage info with bytes, percentage, and status
   */
  static async getStorageUsage() {
    const bytes = await this.getBytesInUse(null);
    const percentage = bytes / this.STORAGE_QUOTA;

    let status = 'normal';
    if (percentage >= this.QUOTA_CRITICAL_THRESHOLD) {
      status = 'critical';
    } else if (percentage >= this.QUOTA_WARNING_THRESHOLD) {
      status = 'warning';
    }

    return {
      bytes,
      percentage,
      status,
      quota: this.STORAGE_QUOTA,
      available: this.STORAGE_QUOTA - bytes
    };
  }

  // ============================================
  // Application State Methods
  // ============================================

  /**
   * Get the main application state
   * @returns {Promise<Object>} The application state
   */
  static async getState() {
    const result = await this.get(this.KEYS.STATE);
    return result[this.KEYS.STATE] || null;
  }

  /**
   * Save the main application state
   * @param {Object} state - The state to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveState(state) {
    return this.set({ [this.KEYS.STATE]: state });
  }

  /**
   * Clear the main application state
   * @returns {Promise<boolean>} Success status
   */
  static async clearState() {
    return this.remove(this.KEYS.STATE);
  }

  // ============================================
  // Custom Templates Methods
  // ============================================

  /**
   * Get custom templates
   * @returns {Promise<Array>} Array of custom templates
   */
  static async getCustomTemplates() {
    const result = await this.get(this.KEYS.CUSTOM_TEMPLATES);
    return result[this.KEYS.CUSTOM_TEMPLATES] || [];
  }

  /**
   * Save custom templates
   * @param {Array} templates - Array of templates to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveCustomTemplates(templates) {
    return this.set({ [this.KEYS.CUSTOM_TEMPLATES]: templates });
  }

  // ============================================
  // Custom Dictionary Methods
  // ============================================

  /**
   * Get custom spellcheck dictionary
   * @returns {Promise<string[]>} Array of custom dictionary words
   */
  static async getCustomDictionary() {
    const result = await this.get(this.KEYS.CUSTOM_DICTIONARY);
    return result[this.KEYS.CUSTOM_DICTIONARY] || [];
  }

  /**
   * Save custom spellcheck dictionary
   * @param {string[]} words - Array of words to save
   * @returns {Promise<boolean>} Success status
   */
  static async saveCustomDictionary(words) {
    return this.set({ [this.KEYS.CUSTOM_DICTIONARY]: words });
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string (e.g., "1.5 KB")
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if storage is approaching quota
   * @returns {Promise<boolean>} True if storage is at or above warning threshold
   */
  static async isStorageWarning() {
    const { status } = await this.getStorageUsage();
    return status === 'warning' || status === 'critical';
  }

  /**
   * Check if storage is critically full
   * @returns {Promise<boolean>} True if storage is at or above critical threshold
   */
  static async isStorageCritical() {
    const { status } = await this.getStorageUsage();
    return status === 'critical';
  }

  /**
   * Clear all extension storage (use with caution)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAll() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('StorageRepository: Failed to clear all storage', error);
      return false;
    }
  }
}
