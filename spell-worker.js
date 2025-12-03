// spell-worker.js
// Web Worker for spell checking using Typo.js

importScripts('lib/typo.js');

let spellChecker = null;
let customDictionary = new Set();

self.addEventListener('message', async (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      await initializeSpellChecker(payload);
      break;
    case 'CHECK_TEXT':
      checkText(payload);
      break;
    case 'ADD_TO_DICTIONARY':
      addToCustomDictionary(payload);
      break;
    case 'REMOVE_FROM_DICTIONARY':
      removeFromCustomDictionary(payload);
      break;
    case 'SET_CUSTOM_DICTIONARY':
      setCustomDictionary(payload);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
});

async function initializeSpellChecker({ lang, affPath, dicPath }) {
  try {
    // Load dictionary files
    const affData = await fetch(affPath).then(r => r.text());
    const dicData = await fetch(dicPath).then(r => r.text());

    // Initialize Typo instance
    spellChecker = new Typo(lang, affData, dicData, {
      platform: 'chrome-extension'
    });

    self.postMessage({
      type: 'INIT_COMPLETE',
      payload: { success: true, lang }
    });
  } catch (error) {
    self.postMessage({
      type: 'INIT_ERROR',
      payload: { error: error.message }
    });
  }
}

function checkText({ text }) {
  if (!spellChecker) {
    self.postMessage({
      type: 'CHECK_ERROR',
      payload: { error: 'Spell checker not initialized' }
    });
    return;
  }

  const words = extractWords(text);
  const misspelledWords = [];

  words.forEach(({ word, start, end }) => {
    // Skip if in custom dictionary
    if (customDictionary.has(word.toLowerCase())) {
      return;
    }

    // Check if word is spelled correctly
    if (!spellChecker.check(word)) {
      const suggestions = spellChecker.suggest(word).slice(0, 5);
      misspelledWords.push({
        word,
        start,
        end,
        suggestions
      });
    }
  });

  self.postMessage({
    type: 'CHECK_COMPLETE',
    payload: { misspelledWords }
  });
}

function extractWords(text) {
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

function addToCustomDictionary({ word }) {
  customDictionary.add(word.toLowerCase());
  self.postMessage({
    type: 'DICTIONARY_UPDATED',
    payload: { word, action: 'added' }
  });
}

function removeFromCustomDictionary({ word }) {
  customDictionary.delete(word.toLowerCase());
  self.postMessage({
    type: 'DICTIONARY_UPDATED',
    payload: { word, action: 'removed' }
  });
}

function setCustomDictionary({ words }) {
  customDictionary = new Set(words.map(w => w.toLowerCase()));
  self.postMessage({
    type: 'DICTIONARY_SET',
    payload: { count: customDictionary.size }
  });
}
