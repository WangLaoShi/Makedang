/**
 * Markdown 编辑器入口
 * @see ref.md
 */
import { dom, state } from './context.js';
import { DEFAULT_CONTENT } from './default-content.js';
import { initMarked } from './markdown.js';
import { renderPreview } from './preview.js';
import {
  loadFiles,
  renderFileList,
  scheduleSave,
  setFilesCallbacks,
} from './files.js';
import { initTheme } from './theme.js';
import { initSyncScroll } from './sync-scroll.js';
import { initLineNumbers, updateLineNumbers, syncLineNumbersScroll } from './line-numbers.js';
import { initResizer } from './resizer.js';
import { bindEvents, showImagePreview } from './events.js';

function updateWordCount() {
  const count = dom.editor.value.replace(/\s/g, '').length;
  dom.wordCountEl.textContent = `${count} 字`;
}

function updateCursorPos() {
  const pos = dom.editor.selectionStart;
  const text = dom.editor.value.substring(0, pos);
  const lines = text.split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  dom.cursorPos.textContent = `行 ${line}, 列 ${col}`;
}

function refresh() {
  renderPreview(showImagePreview);
  updateWordCount();
  scheduleSave();
}

function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 300);
}

function init() {
  initMarked();
  initTheme();
  initSyncScroll();
  initLineNumbers();

  setFilesCallbacks({ onChange: refresh });

  loadFiles();
  const file = state.files.find((f) => f.id === state.activeFileId);
  dom.editor.value = file?.content ?? DEFAULT_CONTENT;

  updateLineNumbers();
  syncLineNumbersScroll();
  bindEvents({ refresh, showImagePreview, updateCursorPos });
  initResizer();
  updateCursorPos();
  renderPreview(showImagePreview);
  renderFileList();
  hidePageLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
