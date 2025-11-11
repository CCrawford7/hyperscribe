// /modules/exportFormatter.js

export default class ExportFormatter {
  #createHeader(metadata, includeDate = true) {
    const date = includeDate ? `Date: ${metadata.date.toLocaleString()}\n` : '';
    return `Title: ${metadata.title}\n${date}Theme: ${metadata.theme}\nWord Count: ${metadata.wordCount}\n\n---\n\n`;
  }

  formatAsText(content, metadata, includeHeader = false) {
    const header = includeHeader ? this.#createHeader(metadata) : '';
    return `${header}${content}`;
  }

  formatAsMarkdown(content, metadata, includeHeader = false) {
    const header = includeHeader
      ? `> *Title: ${metadata.title}*\n> *Date: ${metadata.date.toLocaleString()}*\n\n`
      : '';
    return `${header}# ${metadata.title}\n\n${content}`;
  }

  formatAsHTML(content, metadata, includeHeader = false) {
    const title = metadata.title || 'Hyperscribe Note';
    const htmlContent =
      content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');

    const header = includeHeader
      ? `
    <header>
      <p><strong>Date:</strong> ${metadata.date.toLocaleString()}</p>
      <p><strong>Theme:</strong> ${metadata.theme}</p>
      <p><strong>Words:</strong> ${metadata.wordCount}</p>
    </header>
    <hr>`
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; padding: 2em; }
    header { color: #555; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${header}
  <main>
    <p>${htmlContent}</p>
  </main>
</body>
</html>`;
  }
}
