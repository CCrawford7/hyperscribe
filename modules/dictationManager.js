/**
 * DictationManager - Handles speech-to-text using the Web Speech API
 *
 * Features:
 * - Continuous recognition mode for extended dictation
 * - Interim results shown in real-time in the textarea
 * - Auto-restart on unexpected stops
 * - Proper cleanup and error handling
 */
export default class DictationManager {
  constructor(options = {}) {
    this.textarea = options.textarea;
    this.onStart = options.onStart || (() => {});
    this.onEnd = options.onEnd || (() => {});
    this.onResult = options.onResult || (() => {});
    this.onError = options.onError || (() => {});

    this.recognition = null;
    this.isListening = false;
    this.shouldRestart = false;
    this.finalTranscript = '';
    /** @private Track where interim text starts in the textarea (-1 = no interim) */
    this._interimStart = -1;
    /** @private Set of committed result indices to avoid word repetition */
    this._committedResults = new Set();
    /** @private Flag set during dictation-originated textarea modifications */
    this._isDictationUpdate = false;
    /** @private Bound input event handler for detecting manual user edits */
    this._boundInputHandler = this._onUserInput.bind(this);

    this._initRecognition();
  }

  /**
   * Check if speech recognition is supported
   */
  static isSupported() {
    return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
  }

  /**
   * Initialize the speech recognition instance
   */
  _initRecognition() {
    if (!DictationManager.isSupported()) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configuration
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;

      // Auto-restart if we should still be listening (unexpected stop)
      if (this.shouldRestart) {
        // Clear committed result indices — new recognition session has fresh indices
        this._committedResults.clear();

        setTimeout(() => {
          if (this.shouldRestart) {
            this._startRecognition();
          }
        }, 100);
      } else {
        this.onEnd();
      }
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          // Only commit each result once to avoid word repetition
          if (!this._committedResults.has(i)) {
            this._committedResults.add(i);
            this.finalTranscript += transcript;
            this._commitFinalText(transcript);
          }
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results in the textarea in real-time
      this._showInterimText(interimTranscript);

      this.onResult({
        final: this.finalTranscript,
        interim: interimTranscript,
        isFinal: interimTranscript === ''
      });
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);

      // Handle specific errors
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          this.shouldRestart = false;
          this.onError('Microphone access denied. Please allow microphone access and try again.');
          break;
        case 'no-speech':
          // No speech detected, will auto-restart if continuous
          break;
        case 'network':
          this.onError('Network error. Speech recognition requires an internet connection.');
          break;
        case 'aborted':
          // User or system aborted, don't show error
          break;
        default:
          this.onError(`Speech recognition error: ${event.error}`);
      }
    };
  }

  /**
   * Handle manual user edits to the textarea while dictation is active.
   * Resets interim tracking so the next speech result inserts at the cursor.
   * @private
   */
  _onUserInput() {
    if (this._isDictationUpdate) return; // Ignore dictation-originated changes

    // User typed manually — reset interim tracking
    this._interimStart = -1;

    // Don't clear _committedResults here — the speech engine may re-fire
    // results for words that are already in the text; let the engine sort it out.
  }

  /**
   * Show interim (non-final) text in the textarea.
   * Replaces the previous interim placeholder with the latest recognition guess.
   * Uses cursor position when no interim is active so manual cursor moves are respected.
   * @private
   */
  _showInterimText(interimText) {
    if (!this.textarea) return;

    // If no interim is active, start from the current cursor position
    if (this._interimStart < 0) {
      this._interimStart = this.textarea.selectionStart;
      if (this._interimStart < 0 || this._interimStart > this.textarea.value.length) {
        this._interimStart = this.textarea.value.length;
      }
    }

    const beforeInterim = this.textarea.value.substring(0, this._interimStart);

    this._isDictationUpdate = true;
    if (interimText) {
      this.textarea.value = beforeInterim + interimText;
    } else {
      // No interim text - restore to just the committed content
      this.textarea.value = beforeInterim;
    }
    this._isDictationUpdate = false;

    // Move cursor to end of text
    const pos = this.textarea.value.length;
    this.textarea.selectionStart = pos;
    this.textarea.selectionEnd = pos;

    // Keep the cursor in view
    this.textarea.scrollTop = this.textarea.scrollHeight;
  }

  /**
   * Commit final text to the textarea.
   * This advances the interim start position past the new text.
   * @private
   */
  _commitFinalText(text) {
    if (!this.textarea) return;

    // If there's an active interim placeholder, commit from that position
    if (this._interimStart >= 0) {
      const beforeInterim = this.textarea.value.substring(0, this._interimStart);

      // Add space if needed between existing content and new text
      const needsSpace = beforeInterim.length > 0 &&
                         !beforeInterim.endsWith(' ') &&
                         !beforeInterim.endsWith('\n') &&
                         !text.startsWith(' ');

      const insertText = (needsSpace ? ' ' : '') + text;
      this._isDictationUpdate = true;
      this.textarea.value = beforeInterim + insertText;
      this._isDictationUpdate = false;

      // Advance interim start past the committed text
      this._interimStart = beforeInterim.length + insertText.length;
    } else {
      // No interim - insert at the current cursor position (respects manual edits)
      const cursorPos = this.textarea.selectionStart;
      const textBefore = this.textarea.value.substring(0, cursorPos);
      const textAfter = this.textarea.value.substring(this.textarea.selectionEnd);

      const needsSpace = textBefore.length > 0 &&
                         !textBefore.endsWith(' ') &&
                         !textBefore.endsWith('\n') &&
                         !text.startsWith(' ');

      const insertText = (needsSpace ? ' ' : '') + text;
      this._isDictationUpdate = true;
      this.textarea.value = textBefore + insertText + textAfter;
      this._isDictationUpdate = false;

      this._interimStart = cursorPos + insertText.length;
    }

    // Move cursor to end
    const pos = this.textarea.value.length;
    this.textarea.selectionStart = pos;
    this.textarea.selectionEnd = pos;

    // Trigger input event for state management (debounced by app)
    this._isDictationUpdate = true;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    this._isDictationUpdate = false;
  }

  /**
   * Internal start method
   */
  _startRecognition() {
    if (!this.recognition) return;

    try {
      this.recognition.start();
    } catch (error) {
      // Already started, ignore
      if (error.name !== 'InvalidStateError') {
        console.error('Failed to start recognition:', error);
      }
    }
  }

  /**
   * Start dictation
   */
  start() {
    if (!this.recognition) {
      this.onError('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    this.shouldRestart = true;
    this.finalTranscript = '';
    this._interimStart = -1;
    this._committedResults = new Set();

    // Listen for manual user edits to detect cursor/text changes
    if (this.textarea) {
      this.textarea.addEventListener('input', this._boundInputHandler);
    }

    this._startRecognition();
    return true;
  }

  /**
   * Stop dictation
   */
  stop() {
    this.shouldRestart = false;

    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }

    this.isListening = false;
    this._interimStart = -1;

    // Remove manual edit listener
    if (this.textarea) {
      this.textarea.removeEventListener('input', this._boundInputHandler);
    }

    this.onEnd();
  }

  /**
   * Toggle dictation on/off
   */
  toggle() {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  /**
   * Set the language for recognition
   */
  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    this.recognition = null;
  }
}
