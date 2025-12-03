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
    zenburn: { label: 'Zenburn', classes: ['theme-dark', 'theme-zenburn'] }
  };

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

  #updateUI(themeId) {
    // Remove all theme classes first
    const allThemeClasses = [
      'theme-light',
      'theme-dark',
      'theme-monokai',
      'theme-nord',
      'theme-dracula',
      'theme-solarized-light',
      'theme-solarized-dark',
      'theme-gruvbox-light',
      'theme-gruvbox-dark',
      'theme-tomorrow-night',
      'theme-one-dark',
      'theme-zenburn'
    ];
    this.#appElement.classList.remove(...allThemeClasses);

    // Apply new theme classes
    const themeConfig = ThemeManager.THEMES[themeId];
    if (themeConfig && themeConfig.classes) {
      this.#appElement.classList.add(...themeConfig.classes);
    }

    // Also apply to body for full coverage
    document.body.classList.remove(...allThemeClasses);
    if (themeConfig && themeConfig.classes) {
      document.body.classList.add(...themeConfig.classes);
    }

    // Update theme chips for accessibility and styling
    this.#themeChips.forEach(chip => {
      const isSelected = chip.dataset.theme === themeId;
      chip.setAttribute('aria-pressed', isSelected);
      chip.classList.toggle('active', isSelected);
    });
  }

  resolveThemeId(state) {
    return state?.theme || 'default_bright';
  }

  focusActiveChip() {
    const activeChip = this.#themePanel.querySelector('.theme-chip.active');
    if (activeChip) {
      activeChip.focus();
    }
  }
}
