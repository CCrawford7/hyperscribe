// /modules/imageManager.js

/**
 * ImageManager handles image operations in the notepad.
 * Supports paste, drag/drop, and file picker for image insertion.
 */
export default class ImageManager {
  // Image compression settings
  static MAX_IMAGE_WIDTH = 800;
  static JPEG_QUALITY = 0.8;
  static MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB max per image

  #editorElement = null;
  #onImageInsert = () => {};
  #onImageRemove = () => {};

  constructor({ editorElement, onImageInsert, onImageRemove }) {
    this.#editorElement = editorElement;
    this.#onImageInsert = onImageInsert || (() => {});
    this.#onImageRemove = onImageRemove || (() => {});
  }

  /**
   * Initialize image handling event listeners
   */
  init() {
    // Paste event handler
    this.#editorElement.addEventListener('paste', this.#handlePaste.bind(this));

    // Drag and drop handlers
    this.#editorElement.addEventListener('dragover', this.#handleDragOver.bind(this));
    this.#editorElement.addEventListener('drop', this.#handleDrop.bind(this));
  }

  /**
   * Handle paste event for images
   */
  async #handlePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          await this.insertImageFromBlob(blob);
        }
        return;
      }
    }
  }

  /**
   * Handle dragover for drop zone styling
   */
  #handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.#editorElement.classList.add('drag-over');
  }

  /**
   * Handle drop event for images
   */
  async #handleDrop(event) {
    event.preventDefault();
    this.#editorElement.classList.remove('drag-over');

    const files = event.dataTransfer?.files;
    if (!files) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await this.insertImageFromBlob(file);
      }
    }
  }

  /**
   * Insert image from a File/Blob
   */
  async insertImageFromBlob(blob) {
    try {
      // Compress image if needed
      const compressedDataUri = await this.#compressImage(blob);

      // Generate unique ID for the image
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create image element
      const img = document.createElement('img');
      img.src = compressedDataUri;
      img.className = 'note-image';
      img.dataset.imageId = imageId;
      img.alt = 'Inserted image';
      img.draggable = false;

      // Add click handler for selection/deletion
      img.addEventListener('click', () => this.#selectImage(img));

      // Insert at cursor position or append
      this.#insertAtCursor(img);

      // Notify callback
      this.#onImageInsert({
        id: imageId,
        dataUri: compressedDataUri,
        width: img.naturalWidth,
        height: img.naturalHeight,
        insertedAt: Date.now()
      });

      return imageId;
    } catch (error) {
      console.error('Failed to insert image:', error);
      throw error;
    }
  }

  /**
   * Insert image from file picker
   */
  async insertImageFromPicker() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      input.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (file) {
          try {
            const imageId = await this.insertImageFromBlob(file);
            resolve(imageId);
          } catch (error) {
            reject(error);
          }
        }
        input.remove();
      });

      input.addEventListener('cancel', () => {
        input.remove();
        resolve(null);
      });

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Compress image to reduce storage size
   */
  async #compressImage(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > ImageManager.MAX_IMAGE_WIDTH) {
          const scale = ImageManager.MAX_IMAGE_WIDTH / width;
          width = ImageManager.MAX_IMAGE_WIDTH;
          height = Math.round(height * scale);
        }

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for smaller size (unless PNG with transparency)
        const isPng = blob.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : ImageManager.JPEG_QUALITY;

        const dataUri = canvas.toDataURL(mimeType, quality);

        // Check if still too large
        const sizeBytes = Math.ceil((dataUri.length - 22) * 0.75); // Approximate base64 size
        if (sizeBytes > ImageManager.MAX_IMAGE_SIZE_BYTES) {
          // Re-compress with lower quality
          const lowerQualityDataUri = canvas.toDataURL('image/jpeg', 0.5);
          resolve(lowerQualityDataUri);
        } else {
          resolve(dataUri);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Insert element at current cursor position
   */
  #insertAtCursor(element) {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Check if cursor is within our editor
      if (this.#editorElement.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(element);

        // Move cursor after the image
        range.setStartAfter(element);
        range.setEndAfter(element);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
    }

    // Fallback: append to editor
    this.#editorElement.appendChild(element);
  }

  /**
   * Select an image for potential deletion
   */
  #selectImage(img) {
    // Remove selection from other images
    this.#editorElement.querySelectorAll('.note-image.selected').forEach(el => {
      el.classList.remove('selected');
    });

    // Select this image
    img.classList.toggle('selected');
  }

  /**
   * Delete selected image
   */
  deleteSelectedImage() {
    const selected = this.#editorElement.querySelector('.note-image.selected');
    if (selected) {
      const imageId = selected.dataset.imageId;
      selected.remove();
      this.#onImageRemove(imageId);
      return imageId;
    }
    return null;
  }

  /**
   * Get all images in the editor
   */
  getImages() {
    const images = [];
    this.#editorElement.querySelectorAll('.note-image').forEach(img => {
      images.push({
        id: img.dataset.imageId,
        dataUri: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    });
    return images;
  }

  /**
   * Clear all images from the editor
   */
  clearImages() {
    this.#editorElement.querySelectorAll('.note-image').forEach(img => {
      const imageId = img.dataset.imageId;
      img.remove();
      this.#onImageRemove(imageId);
    });
  }

  /**
   * Convert blob to data URI
   */
  static blobToDataUri(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
