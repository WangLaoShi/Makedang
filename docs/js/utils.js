export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function headingId(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

export function stripFrontMatter(text) {
  return text.replace(/^\s*---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, '');
}

export function getDocumentTitle(content, fallback = 'document') {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
