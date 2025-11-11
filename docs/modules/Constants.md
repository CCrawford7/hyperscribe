# Shared Constants

**File:** `/shared/constants.js`

This file contains shared constants used across the application.

## Code

```javascript
// /shared/constants.js

/**
 * The primary key used for storing the application state in chrome.storage.local.
 */
export const STORAGE_KEY = 'hyperscribe-data';

/**
 * Minimum width for the popup window resizing.
 */
export const RESIZE_MIN_WIDTH = 320;

/**
 * Minimum height for the popup window resizing.
 */
export const RESIZE_MIN_HEIGHT = 360;

/**
 * Maximum width for the popup window resizing.
 */
export const RESIZE_MAX_WIDTH = 640;

/**
 * Maximum height for the popup window resizing.
 */
export const RESIZE_MAX_HEIGHT = 599;
```

## Usage

-   `STORAGE_KEY`: Used in `background.js` for initializing default state and in `stateManager.js`.
-   `RESIZE_*` constants: Used in `popup.js` within the `handleResizeMove` and `resetWindowSize` functions.
