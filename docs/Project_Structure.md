# Project Structure

This document provides an overview of the files and directories in the Hyperscribe project.

```
/
├─── AGENTS.md
├─── background.js
├─── manifest.json
├─── popup.css
├─── popup.html
├─── popup.js
├─── README.md
├─── DEV_GUIDE.md
├─── MODULE_EXTRACTION_GUIDE.md
├─── docs/
│    ├─── _index.md
│    └─── modules/
├─── archive/
├─── assets/
├─── icons/
└─── modules/
     ├─── confirmationDialog.js
     ├─── downloadHelper.js
     ├─── fontManager.js
     ├─── radialMenu.js
     └─── templateManager.js
     └─── ... (and the newly created modules)
```

## Root Directory

-   `manifest.json`: The extension's manifest file, defining its properties, permissions, and entry points.
-   `background.js`: The background service worker for the extension. Handles events like installation and keyboard shortcuts.
-   `popup.html`: The main HTML file for the extension's popup interface.
-   `popup.js`: The main JavaScript file for the popup, handling UI logic and user interactions.
-   `popup.css`: The stylesheet for the popup interface.
-   `README.md`: The main README file for the project.
-   `DEV_GUIDE.md`: Contains guidance for developers.

## Directories

-   `/docs`: Contains this wiki, for project documentation. It is designed to be used with Obsidian.
-   `/icons`: Contains all the icons for the extension, including the browser action icons and in-app icons.
-   `/assets`: Contains other static assets, like splash screens.
-   `/modules`: Contains modular JavaScript files, each responsible for a specific piece of functionality (e.g., `fontManager.js`, `themeManager.js`).
-   `/shared`: Contains code shared between different parts of the extension (e.g. `constants.js`).
-   `/archive`: Contains old or deprecated code that is kept for reference.
