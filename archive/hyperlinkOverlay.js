/**
 * Archived hyperlink overlay utilities (November 2024).
 * These helpers rendered a read-only overlay above the textarea
 * so detected URLs could be clicked. The feature has been shelved
 * for now, but the implementation is kept here for future reference.
 */

export const urlRegex = /\b((?:https?:\/\/)|(?:www\.))[^\s<]+/gi;

export function escapeHTML(value) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return value.replace(/[&<>"']/g, char => map[char]);
}

export function buildOverlayHTML(text) {
  if (!text.trim()) {
    return '';
  }
  const escaped = escapeHTML(text);
  return escaped.replace(urlRegex, match => {
    const href = match.startsWith('http') ? match : `https://${match}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });
}

export function syncOverlayStyles(overlay, noteArea) {
  if (!overlay || !noteArea) {
    return;
  }
  const computed = getComputedStyle(noteArea);
  overlay.style.fontSize = computed.fontSize;
  overlay.style.fontFamily = computed.fontFamily;
  overlay.style.fontWeight = computed.fontWeight;
  overlay.style.fontStyle = computed.fontStyle;
}
