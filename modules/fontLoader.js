// /modules/fontLoader.js

/**
 * FontLoader handles lazy loading of Google Fonts.
 * Only loads fonts when they're selected, reducing initial page load.
 */
export default class FontLoader {
  // Font configuration - maps font family name to Google Fonts API name
  static FONTS = {
    // Monospace fonts (loaded initially - Fira Code as default)
    "'Fira Code', monospace": { name: 'Fira Code', weights: '400;600', preloaded: true },
    "'JetBrains Mono', monospace": { name: 'JetBrains Mono', weights: '400;700' },
    "'Source Code Pro', monospace": { name: 'Source Code Pro', weights: '400;700' },
    "'IBM Plex Mono', monospace": { name: 'IBM Plex Mono', weights: '400;700' },
    "'Inconsolata', monospace": { name: 'Inconsolata', weights: '400;700' },
    "'Ubuntu Mono', monospace": { name: 'Ubuntu Mono', weights: '400;700' },
    "'Roboto Mono', monospace": { name: 'Roboto Mono', weights: '400;700' },
    "'Anonymous Pro', monospace": { name: 'Anonymous Pro', weights: '400;700' },
    "'Space Mono', monospace": { name: 'Space Mono', weights: '400;700' },
    "'Cascadia Code', monospace": { name: 'Cascadia Code', weights: '400;700' },
    "'Victor Mono', monospace": { name: 'Victor Mono', weights: '400;700' },
    "'Iosevka', monospace": { name: 'Iosevka', weights: '400;700' },
    "'DM Mono', monospace": { name: 'DM Mono', weights: '400;500' },
    // Sans-serif fonts
    "'Inter', sans-serif": { name: 'Inter', weights: '400;600' },
    "'Roboto', sans-serif": { name: 'Roboto', weights: '400;700' },
    "'Lato', sans-serif": { name: 'Lato', weights: '400;700' },
    "'Open Sans', sans-serif": { name: 'Open Sans', weights: '400;700' },
    "'Nunito', sans-serif": { name: 'Nunito', weights: '400;700' },
    "'Poppins', sans-serif": { name: 'Poppins', weights: '400;700' },
    "'Work Sans', sans-serif": { name: 'Work Sans', weights: '400;600' },
    "'DM Sans', sans-serif": { name: 'DM Sans', weights: '400;700' },
    "'Plus Jakarta Sans', sans-serif": { name: 'Plus Jakarta Sans', weights: '400;600' },
    "'Manrope', sans-serif": { name: 'Manrope', weights: '400;700' },
    "'Figtree', sans-serif": { name: 'Figtree', weights: '400;600' },
    // Serif fonts
    "'Merriweather', serif": { name: 'Merriweather', weights: '400;700' },
    "'Playfair Display', serif": { name: 'Playfair Display', weights: '400;700' },
    "'Lora', serif": { name: 'Lora', weights: '400;700' },
    "'Source Serif 4', serif": { name: 'Source Serif 4', weights: '400;700' },
    "'Libre Baskerville', serif": { name: 'Libre Baskerville', weights: '400;700' },
    "'Crimson Pro', serif": { name: 'Crimson Pro', weights: '400;700' },
    "'EB Garamond', serif": { name: 'EB Garamond', weights: '400;700' }
  };

  // Track which fonts have been loaded
  static #loadedFonts = new Set(['Fira Code']); // Default font always loaded
  static #loadingFonts = new Map(); // Fonts currently being loaded

  /**
   * Load a font by its family value
   * @param {string} fontFamily - The CSS font-family value (e.g., "'Fira Code', monospace")
   * @returns {Promise<boolean>} - True if font loaded successfully
   */
  static async loadFont(fontFamily) {
    const fontConfig = this.FONTS[fontFamily];
    if (!fontConfig) {
      console.warn(`FontLoader: Unknown font family: ${fontFamily}`);
      return false;
    }

    // Already loaded
    if (this.#loadedFonts.has(fontConfig.name)) {
      return true;
    }

    // Currently loading - return existing promise
    if (this.#loadingFonts.has(fontConfig.name)) {
      return this.#loadingFonts.get(fontConfig.name);
    }

    // Start loading
    const loadPromise = this.#loadFontAsync(fontConfig);
    this.#loadingFonts.set(fontConfig.name, loadPromise);

    try {
      await loadPromise;
      this.#loadedFonts.add(fontConfig.name);
      return true;
    } catch (error) {
      console.error(`FontLoader: Failed to load font ${fontConfig.name}:`, error);
      return false;
    } finally {
      this.#loadingFonts.delete(fontConfig.name);
    }
  }

  /**
   * Actually load the font from Google Fonts
   * @param {Object} fontConfig - Font configuration object
   * @returns {Promise<void>}
   * @private
   */
  static async #loadFontAsync(fontConfig) {
    const { name, weights } = fontConfig;

    // Create the Google Fonts URL
    const encodedName = name.replace(/ /g, '+');
    const url = `https://fonts.googleapis.com/css2?family=${encodedName}:wght@${weights}&display=swap`;

    // Create and append link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    return new Promise((resolve, reject) => {
      link.onload = () => {
        // Wait for the font to actually be available
        this.#waitForFont(name).then(resolve).catch(reject);
      };
      link.onerror = () => reject(new Error(`Failed to load stylesheet for ${name}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Wait for a font to be ready using the Font Loading API
   * @param {string} fontName - The font name
   * @returns {Promise<void>}
   * @private
   */
  static async #waitForFont(fontName) {
    if (!document.fonts || !document.fonts.check) {
      // Fallback for browsers without Font Loading API
      return new Promise(resolve => setTimeout(resolve, 100));
    }

    // Try checking if font is loaded, with timeout
    const timeout = 5000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (document.fonts.check(`16px "${fontName}"`)) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Timeout - font may still work, just not confirmed
    console.warn(`FontLoader: Timeout waiting for font ${fontName}`);
  }

  /**
   * Check if a font is loaded
   * @param {string} fontFamily - The CSS font-family value
   * @returns {boolean}
   */
  static isLoaded(fontFamily) {
    const fontConfig = this.FONTS[fontFamily];
    if (!fontConfig) return false;
    return this.#loadedFonts.has(fontConfig.name);
  }

  /**
   * Preload fonts that the user has previously selected
   * @param {string[]} fontFamilies - Array of font-family values to preload
   */
  static async preloadFonts(fontFamilies) {
    const loadPromises = fontFamilies.map(family => this.loadFont(family));
    await Promise.allSettled(loadPromises);
  }

  /**
   * Get list of all available fonts
   * @returns {string[]} Array of font-family values
   */
  static getAvailableFonts() {
    return Object.keys(this.FONTS);
  }
}
