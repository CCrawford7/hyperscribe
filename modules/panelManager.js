// /modules/panelManager.js

export default class PanelManager {
  #panels = {};
  #openPanel = null;

  constructor(panelConfig) {
    Object.keys(panelConfig).forEach(key => {
      this.#panels[key] = panelConfig[key];
    });
    this.#bindGlobalListeners();
  }

  #bindGlobalListeners() {
    document.addEventListener('click', event => {
      if (this.#openPanel) {
        const config = this.#panels[this.#openPanel];
        const isClickInsidePanel = config.panel.contains(event.target);
        const isClickInsideButton = config.button.contains(event.target);
        if (!isClickInsidePanel && !isClickInsideButton) {
          this.close(this.#openPanel);
        }
      }
    });
  }

  toggle(panelName) {
    if (this.#openPanel === panelName) {
      this.close(panelName);
    } else {
      if (this.#openPanel) {
        this.close(this.#openPanel);
      }
      this.open(panelName);
    }
  }

  open(panelName) {
    const config = this.#panels[panelName];
    if (!config) return;

    config.panel.classList.remove('hidden');
    config.panel.setAttribute('aria-hidden', 'false');
    config.button.setAttribute('aria-expanded', 'true');
    this.#openPanel = panelName;

    if (typeof config.onOpen === 'function') {
      config.onOpen();
    }
  }

  close(panelName) {
    const config = this.#panels[panelName];
    if (!config || this.#openPanel !== panelName) return;

    config.panel.classList.add('hidden');
    config.panel.setAttribute('aria-hidden', 'true');
    config.button.setAttribute('aria-expanded', 'false');
    this.#openPanel = null;
  }

  handleKeyDown(event) {
    if (event.key === 'Escape' && this.#openPanel) {
      const config = this.#panels[this.#openPanel];
      this.close(this.#openPanel);
      config.button.focus();
      event.preventDefault();
    }
  }
}
