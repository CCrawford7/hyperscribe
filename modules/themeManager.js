// /modules/themeManager.js

export default class ThemeManager {
  static THEMES = {
    default_bright: { label: 'Default Bright', classes: ['theme-light'] },
    default_dark: { label: 'Default Dark', classes: ['theme-dark'] },
    monokai: { label: 'Monokai', classes: ['theme-dark', 'theme-monokai'] },
    nord: { label: 'Nord', classes: ['theme-dark', 'theme-nord'] },
    dracula: { label: 'Dracula', classes: ['theme-dark', 'theme-dracula'] },
    'solarized-light': { label: 'Solarized Light', classes: ['theme-light', 'theme-solarized-light'] },
    'solarized-dark': { label: 'Solarized Dark', classes: ['theme-dark', 'theme-solarized-dark'] },
    'gruvbox-light': { label: 'Gruvbox Light', classes: ['theme-light', 'theme-gruvbox-light'] },
    'gruvbox-dark': { label: 'Gruvbox Dark', classes: ['theme-dark', 'theme-gruvbox-dark'] },
    'tomorrow-night': { label: 'Tomorrow Night', classes: ['theme-dark', 'theme-tomorrow-night'] },
    'one-dark': { label: 'One Dark', classes: ['theme-dark', 'theme-one-dark'] },
    zenburn: { label: 'Zenburn', classes: ['theme-dark', 'theme-zenburn'] },
    'catppuccin-latte': { label: 'Catppuccin Latte', classes: ['theme-light', 'theme-catppuccin-latte'] },
    'catppuccin-mocha': { label: 'Catppuccin Mocha', classes: ['theme-dark', 'theme-catppuccin-mocha'] },
    'github-light': { label: 'GitHub Light', classes: ['theme-light', 'theme-github-light'] },
    'github-dark': { label: 'GitHub Dark', classes: ['theme-dark', 'theme-github-dark'] },
    'tokyo-night': { label: 'Tokyo Night', classes: ['theme-dark', 'theme-tokyo-night'] },
    'everforest-dark': { label: 'Everforest Dark', classes: ['theme-dark', 'theme-everforest-dark'] },
    system: { label: 'System', classes: ['theme-system'] }
  };

  /**
   * Resolve the effective theme for the "system" setting.
   * Returns 'default_bright' or 'default_dark' based on prefers-color-scheme.
   */
  static getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'default_dark';
    }
    return 'default_bright';
  }

  #appElement = null;
  #themePanel = null;
  #themeChips = [];
  #onThemeChange = () => {};
  #currentTheme = 'default_bright';

  constructor({ appElement, themePanel, themeChips, onThemeChange }) {
    this.#appElement = appElement;
    this.#themePanel = themePanel;
    this.#themeChips = themeChips;
    this.#onThemeChange = onThemeChange;

    this.#bindEvents();
  }

  #bindEvents() {
    this.#themeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const themeId = chip.dataset.theme;
        this.setTheme(themeId);
      });
    });
  }

  setTheme(themeId, { skipSave = false } = {}) {
    if (!ThemeManager.THEMES[themeId]) {
      themeId = 'default_bright';
    }

    this.#currentTheme = themeId;
    this.#updateUI(themeId);

    if (!skipSave && typeof this.#onThemeChange === 'function') {
      this.#onThemeChange(themeId);
    }
  }

  /**
   * Get all unique theme classes from THEMES configuration.
   * This follows the Open/Closed principle - adding a new theme
   * doesn't require modifying this method.
   */
  static getAllThemeClasses() {
    const classSet = new Set();
    Object.values(ThemeManager.THEMES).forEach(theme => {
      if (theme.classes) {
        theme.classes.forEach(cls => classSet.add(cls));
      }
    });
    return [...classSet];
  }

  #updateUI(themeId) {
    // Resolve system theme to actual theme
    const effectiveTheme = themeId === 'system'
      ? ThemeManager.getSystemTheme()
      : themeId;

    // Derive all theme classes from configuration (OCP compliant)
    const allThemeClasses = ThemeManager.getAllThemeClasses();
    // Include system class for cleanup
    allThemeClasses.push('theme-system');

    // Remove all theme classes first
    this.#appElement.classList.remove(...allThemeClasses);

    // Apply new theme classes
    const themeConfig = ThemeManager.THEMES[effectiveTheme];
    if (themeConfig && themeConfig.classes) {
      this.#appElement.classList.add(...themeConfig.classes);
    }
    if (themeId === 'system') {
      this.#appElement.classList.add('theme-system');
    }

    // Also apply to body for full coverage
    document.body.classList.remove(...allThemeClasses);
    if (themeConfig && themeConfig.classes) {
      document.body.classList.add(...themeConfig.classes);
    }
    if (themeId === 'system') {
      document.body.classList.add('theme-system');
    }

    // Update theme chips for accessibility and styling
    this.#themeChips.forEach(chip => {
      const isSelected = chip.dataset.theme === themeId;
      chip.setAttribute('aria-pressed', isSelected);
      chip.classList.toggle('active', isSelected);
    });
  }

  resolveThemeId(state) {
    const rawTheme = state?.theme || 'default_bright';
    if (rawTheme === 'system') {
      return ThemeManager.getSystemTheme();
    }
    return rawTheme;
  }

  /**
   * Get the raw theme ID as stored (may be 'system')
   */
  getRawThemeId() {
    return this.#currentTheme;
  }

  focusActiveChip() {
    const activeChip = this.#themePanel.querySelector('.theme-chip.active');
    if (activeChip) {
      activeChip.focus();
    }
  }
}
