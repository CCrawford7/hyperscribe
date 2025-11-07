/**
 * Download content with specified format
 * @param {string} filename - The filename to save as
 * @param {string} content - The content to download
 * @param {string} [format='txt'] - Format type: 'txt', 'md', or 'html'
 * @param {ErrorHandler} [errorHandler] - Optional error handler for user feedback
 * @returns {Promise<void>}
 */
export async function download(filename, content, format = 'txt', errorHandler = null) {
  // Validate inputs
  if (!filename || typeof filename !== 'string') {
    const error = new Error('Invalid filename provided');
    if (errorHandler) {
      errorHandler.handleDownloadError(error, 'file');
    }
    throw error;
  }

  if (content === null || content === undefined) {
    const error = new Error('No content provided for download');
    if (errorHandler) {
      errorHandler.handleDownloadError(error, filename);
    }
    throw error;
  }

  // Determine content type based on format
  const contentTypes = {
    txt: 'text/plain;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    html: 'text/html;charset=utf-8',
    json: 'application/json;charset=utf-8'
  };

  const contentType = contentTypes[format] || contentTypes.txt;
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  try {
    // Check if downloads API is available
    if (!chrome.downloads || !chrome.downloads.download) {
      throw new Error('Downloads API not available');
    }

    await chrome.downloads.download({
      url,
      filename,
      saveAs: false
    });

    // Check for chrome runtime errors
    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message);
    }

    // Show success feedback if error handler provided
    if (errorHandler && errorHandler.showSuccess) {
      errorHandler.showSuccess(`Downloaded ${filename}`);
    }
  } catch (error) {
    // Log the error
    console.warn('Hyperscribe: chrome.downloads failed, using fallback', error);

    // Try fallback download method
    try {
      fallbackDownload(url, filename);
      if (errorHandler && errorHandler.showSuccess) {
        errorHandler.showSuccess(`Downloaded ${filename}`);
      }
    } catch (fallbackError) {
      // Fallback also failed
      if (errorHandler) {
        errorHandler.handleDownloadError(fallbackError, filename);
      }
      throw fallbackError;
    }
  } finally {
    // Clean up blob URL after a delay
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore revoke errors
      }
    }, 1000);
  }
}

function fallbackDownload(url, filename) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  requestAnimationFrame(() => anchor.remove());
}

/**
 * Download content as a text file (backward compatibility wrapper)
 * @param {string} filename - The filename to save as
 * @param {string} content - The text content to download
 * @param {ErrorHandler} [errorHandler] - Optional error handler for user feedback
 * @returns {Promise<void>}
 */
export async function downloadAsText(filename, content, errorHandler = null) {
  return download(filename, content, 'txt', errorHandler);
}
