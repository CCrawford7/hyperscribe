
## 9. /modules/conflictOverlay.js

**Status:** Code needs to be written from scratch based on usage.

This module contains utility functions for managing the sync conflict resolution overlay. These are not part of a class but are standalone functions that manipulate the DOM.

### Code to Create

```javascript
// /modules/conflictOverlay.js

export function showConflictOverlay(elements, conflict, currentIndex, totalConflicts) {
  if (!elements.conflictOverlay) return;

  const { local, cloud } = conflict.diff;
  elements.conflictLocalPreview.textContent = local.content;
  elements.conflictCloudPreview.textContent = cloud.content;
  elements.conflictLocalTime.textContent = `Saved: ${new Date(
    local.modified
  ).toLocaleString()}`;
  elements.conflictCloudTime.textContent = `Saved: ${new Date(
    cloud.modified
  ).toLocaleString()}`;

  updateConflictNavigationControls(elements, currentIndex, totalConflicts);

  elements.conflictOverlay.classList.remove('hidden');
  elements.conflictOverlay.setAttribute('aria-hidden', 'false');
}

export function hideConflictOverlay(elements) {
  if (!elements.conflictOverlay) return;
  elements.conflictOverlay.classList.add('hidden');
  elements.conflictOverlay.setAttribute('aria-hidden', 'true');
}

export function isConflictOverlayVisible(elements) {
  return (
    elements.conflictOverlay && !elements.conflictOverlay.classList.contains('hidden')
  );
}

export function updateConflictNavigationControls(elements, currentIndex, totalConflicts) {
  if (!elements.conflictCounter) return;

  if (totalConflicts > 1) {
    elements.conflictCounter.textContent = `${currentIndex + 1} of ${totalConflicts}`;
    elements.conflictCounter.classList.remove('hidden');
  } else {
    elements.conflictCounter.classList.add('hidden');
  }

  if (elements.conflictPrev) {
    elements.conflictPrev.disabled = currentIndex <= 0;
  }
  if (elements.conflictNext) {
    elements.conflictNext.disabled = currentIndex >= totalConflicts - 1;
  }
}
```

### Usage

-   `showConflictOverlay`: Used in `popup.js` inside its own `showConflictOverlay` wrapper function, which is called from `handleSyncConflict`.
-   `hideConflictOverlay`: Used in `popup.js` inside its `hideConflictOverlay` wrapper.
-   `isConflictOverlayVisible`: Used in `popup.js` inside its `isConflictOverlayVisible` wrapper.
-   `updateConflictNavigationControls`: Used in `popup.js` within `hideConflictOverlay`.

### Export Statement

```javascript
export {
  showConflictOverlay,
  hideConflictOverlay,
  isConflictOverlayVisible,
  updateConflictNavigationControls
};
```
