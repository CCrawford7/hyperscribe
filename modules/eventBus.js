// /modules/eventBus.js

/**
 * EventBus provides a simple pub/sub pattern for decoupled component communication.
 * Components can emit events and subscribe to events without direct references to each other.
 *
 * Usage:
 *   // Subscribe to an event
 *   EventBus.on('note:changed', (data) => console.log('Note changed:', data));
 *
 *   // Emit an event
 *   EventBus.emit('note:changed', { content: 'Hello' });
 *
 *   // Subscribe once (auto-unsubscribe after first event)
 *   EventBus.once('init:complete', () => console.log('Initialized!'));
 *
 *   // Unsubscribe
 *   const unsubscribe = EventBus.on('some:event', handler);
 *   unsubscribe();
 */
export default class EventBus {
  // Map of event names to arrays of subscriber functions
  static #subscribers = new Map();

  /**
   * Subscribe to an event
   * @param {string} event - Event name (e.g., 'note:changed', 'theme:updated')
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  static on(event, callback) {
    if (typeof callback !== 'function') {
      console.warn(`EventBus: Invalid callback for event "${event}"`);
      return () => {};
    }

    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, []);
    }

    this.#subscribers.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event for a single emission
   * @param {string} event - Event name
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  static once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - The callback function to remove
   */
  static off(event, callback) {
    if (!this.#subscribers.has(event)) return;

    const subscribers = this.#subscribers.get(event);
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }

    // Clean up empty event arrays
    if (subscribers.length === 0) {
      this.#subscribers.delete(event);
    }
  }

  /**
   * Emit an event to all subscribers
   * @param {string} event - Event name
   * @param {*} data - Data to pass to subscribers
   */
  static emit(event, data) {
    if (!this.#subscribers.has(event)) return;

    // Create a copy to handle unsubscribes during emit
    const subscribers = [...this.#subscribers.get(event)];

    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`EventBus: Error in subscriber for "${event}":`, error);
      }
    });
  }

  /**
   * Remove all subscribers for a specific event
   * @param {string} event - Event name
   */
  static clear(event) {
    this.#subscribers.delete(event);
  }

  /**
   * Remove all subscribers for all events
   */
  static clearAll() {
    this.#subscribers.clear();
  }

  /**
   * Get the count of subscribers for an event
   * @param {string} event - Event name
   * @returns {number} Number of subscribers
   */
  static subscriberCount(event) {
    return this.#subscribers.get(event)?.length || 0;
  }

  /**
   * Check if an event has any subscribers
   * @param {string} event - Event name
   * @returns {boolean}
   */
  static hasSubscribers(event) {
    return this.subscriberCount(event) > 0;
  }

  // Standard event names for documentation
  static EVENTS = {
    // Note events
    NOTE_CHANGED: 'note:changed',
    NOTE_SAVED: 'note:saved',
    NOTE_CLEARED: 'note:cleared',

    // Tab events
    TAB_SWITCHED: 'tab:switched',
    TAB_ADDED: 'tab:added',
    TAB_CLOSED: 'tab:closed',

    // Theme events
    THEME_CHANGED: 'theme:changed',

    // Font events
    FONT_CHANGED: 'font:changed',

    // Panel events
    PANEL_OPENED: 'panel:opened',
    PANEL_CLOSED: 'panel:closed',

    // Storage events
    STORAGE_SAVED: 'storage:saved',
    STORAGE_LOADED: 'storage:loaded',
    STORAGE_WARNING: 'storage:warning',

    // Image events
    IMAGE_ADDED: 'image:added',
    IMAGE_REMOVED: 'image:removed',

    // General events
    INIT_COMPLETE: 'init:complete',
    ERROR: 'error'
  };
}
