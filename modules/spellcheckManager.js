// modules/spellcheckManager.js
// Manages spell checking with custom dictionary support

import StorageRepository from './storageRepository.js';

export default class SpellcheckManager {
  #spellChecker = null;
  #enabled = false;
  #lang = 'en_US';
  #customDictionary = new Set();
  #debounceTimer = null;
  #editorElement = null;
  #onMisspelledWords = null;
  #initialized = false;

  constructor({ editorElement, lang = 'en_US', onMisspelledWords }) {
    this.#editorElement = editorElement;
    this.#lang = lang;
    this.#onMisspelledWords = onMisspelledWords;
  }

  async initialize() {
    if (this.#initialized) return;

    try {
      // Load Typo.js
      await this.#loadTypoScript();

      // Load dictionary files
      const affPath = chrome.runtime.getURL(`dictionaries/${this.#lang}.aff`);
      const dicPath = chrome.runtime.getURL(`dictionaries/${this.#lang}.dic`);

      const [affData, dicData] = await Promise.all([
        fetch(affPath).then(r => r.text()),
        fetch(dicPath).then(r => r.text())
      ]);

      // Initialize Typo instance with proper settings
      this.#spellChecker = new window.Typo(this.#lang, affData, dicData, {
        platform: 'chrome'
      });

      // Wait for Typo to finish loading/parsing the dictionary
      await this.#spellChecker.ready;

      // Verify dictionary is loaded
      if (!this.#spellChecker.loaded) {
        throw new Error('Dictionary failed to load in Typo instance');
      }

      // Load custom dictionary from storage
      await this.loadCustomDictionary();

      this.#initialized = true;
    } catch (error) {
      console.error('Failed to initialize spellcheck:', error);
      this.#initialized = false;
      throw error;
    }
  }

  async #loadTypoScript() {
    // Check if Typo is already loaded
    if (window.Typo) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('lib/typo.js');
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Typo.js'));
      document.head.appendChild(script);
    });
  }

  enable() {
    this.#enabled = true;
    if (this.#initialized) {
      this.checkText();
    }
  }

  disable() {
    this.#enabled = false;
    // Clear debounce timer
    if (this.#debounceTimer) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = null;
    }
    // Clear misspelled words
    if (typeof this.#onMisspelledWords === 'function') {
      this.#onMisspelledWords([]);
    }
  }

  isEnabled() {
    return this.#enabled;
  }

  checkText(immediate = false) {
    if (!this.#enabled || !this.#initialized || !this.#spellChecker) return;

    // Clear existing debounce timer
    if (this.#debounceTimer) {
      clearTimeout(this.#debounceTimer);
    }

    const performCheck = () => {
      try {
        // Double-check spell checker is ready
        if (!this.#spellChecker || !this.#spellChecker.dictionary) {
          console.warn('Spellcheck attempted but dictionary not ready');
          return;
        }

        const text = this.#editorElement.value || '';
        const words = this.#extractWords(text);
        const misspelledWords = [];

        words.forEach(({ word, start, end }) => {
          // Skip if in custom dictionary
          if (this.#customDictionary.has(word.toLowerCase())) {
            return;
          }

          // Check if word is spelled correctly
          try {
            if (!this.#spellChecker.check(word)) {
              const suggestions = this.#spellChecker.suggest(word).slice(0, 5);
              misspelledWords.push({
                word,
                start,
                end,
                suggestions
              });
            }
          } catch (err) {
            console.warn('Error checking word:', word, err);
          }
        });

        if (typeof this.#onMisspelledWords === 'function') {
          this.#onMisspelledWords(misspelledWords);
        }
      } catch (error) {
        console.error('Error during spell check:', error);
      }
    };

    if (immediate) {
      performCheck();
    } else {
      // Debounce: wait 300ms after user stops typing
      this.#debounceTimer = setTimeout(performCheck, 300);
    }
  }

  #extractWords(text) {
    const words = [];
    // Match words (letters, numbers, apostrophes, hyphens)
    const wordRegex = /[\w'-]+/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const word = match[0];
      // Skip pure numbers and single characters
      if (/^\d+$/.test(word) || word.length === 1) {
        continue;
      }
      words.push({
        word,
        start: match.index,
        end: match.index + word.length
      });
    }

    return words;
  }

  addToCustomDictionary(word) {
    this.#customDictionary.add(word.toLowerCase());
    // Save to chrome.storage
    this.#saveCustomDictionary();
    // Recheck text
    if (this.#enabled) {
      this.checkText(true);
    }
  }

  removeFromCustomDictionary(word) {
    this.#customDictionary.delete(word.toLowerCase());
    // Save to chrome.storage
    this.#saveCustomDictionary();
    // Recheck text
    if (this.#enabled) {
      this.checkText(true);
    }
  }

  getCustomDictionaryWords() {
    return Array.from(this.#customDictionary);
  }

  async loadCustomDictionary() {
    try {
      const words = await StorageRepository.getCustomDictionary();
      if (words && words.length > 0) {
        this.#customDictionary = new Set(words);
      }
    } catch (error) {
      console.error('Failed to load custom dictionary:', error);
    }
  }

  async #saveCustomDictionary() {
    try {
      await StorageRepository.saveCustomDictionary(Array.from(this.#customDictionary));
    } catch (error) {
      console.error('Failed to save custom dictionary:', error);
    }
  }

  async setLanguage(lang) {
    this.#lang = lang;
    this.#initialized = false;
    // Reinitialize with new language
    await this.initialize();
    // Recheck if enabled
    if (this.#enabled) {
      this.checkText(true);
    }
  }

  destroy() {
    this.disable();
    this.#spellChecker = null;
  }
}
