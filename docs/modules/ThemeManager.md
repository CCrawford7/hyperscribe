# ThemeManager

**File:** `/modules/themeManager.js`

The `ThemeManager` class handles switching the application's theme (Light, Dark, System) and updating the UI accordingly.

## Code

```javascript
// /modules/themeManager.js

export default class ThemeManager {
  static THEMES = {
    light: { label: 'Light', icon: '☀️' },
    dark: { label: 'Dark', icon: '🌙' },
    system: { label: 'System', icon: '💻' }
  };

  #appElement = null;
  #themePanel = null;
  #themeChips = [];
  #onThemeChange = () => {};
  #currentTheme = 'system';

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
      themeId = 'system';
    }

    this.#currentTheme = themeId;
    this.#updateUI(themeId);

    if (!skipSave && typeof this.#onThemeChange === 'function') {
      this.#onThemeChange(themeId);
    }
  }

  #updateUI(themeId) {
    // Update app data attribute for CSS styling
    this.#appElement.dataset.theme = themeId;

    // Update theme chips for accessibility and styling
    this.#themeChips.forEach(chip => {
      const isSelected = chip.dataset.theme === themeId;
      chip.setAttribute('aria-pressed', isSelected);
      chip.classList.toggle('active', isSelected);
    });

    // Apply system theme if selected
    if (themeId === 'system') {
      this.#applySystemTheme();
    } else {
      this.#appElement.classList.toggle('dark-theme', themeId === 'dark');
      this.#appElement.classList.toggle('light-theme', themeId === 'light');
    }
  }

  #applySystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.#appElement.classList.toggle('dark-theme', prefersDark);
    this.#appElement.classList.toggle('light-theme', !prefersDark);
  }

  resolveThemeId(state) {
    return state?.theme || 'system';
  }

  focusActiveChip() {
    const activeChip = this.#themePanel.querySelector('.theme-chip.active');
    if (activeChip) {
      activeChip.focus();
    }
  }
}
```

## Usage

The `ThemeManager` is instantiated in `popup.js` and is used to control the visual theme of the application based on user selection and system preferences.
