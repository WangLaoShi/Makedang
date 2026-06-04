import { STORAGE } from './config.js';
import { dom, state } from './context.js';
import { scheduleSave, saveToStorage, toggleSidebar, createFile } from './files.js';
import { insertMarkdown, toggleComment } from './toolbar.js';
import { toggleTheme } from './theme.js';
import { toggleLineNumbers } from './line-numbers.js';
import { importMarkdown, exportMarkdown, exportHTML } from './export-io.js';
import { initTooltip } from './tooltip.js';

export function bindEvents(handlers) {
  const { refresh, showImagePreview } = handlers;

  dom.editor.addEventListener('input', refresh);
  dom.editor.addEventListener('keydown', (e) => handleKeyDown(e, refresh));
  dom.editor.addEventListener('keyup', handlers.updateCursorPos);
  dom.editor.addEventListener('click', handlers.updateCursorPos);

  dom.editor.addEventListener('paste', (e) => handlePaste(e, refresh));
  dom.editor.addEventListener('drop', (e) => handleDrop(e, refresh));
  dom.editor.addEventListener('dragover', (e) => e.preventDefault());

  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!action) return;
      switch (action) {
        case 'theme':
          toggleTheme(refresh);
          break;
        case 'toggle-sidebar':
          toggleSidebar();
          break;
        case 'line-numbers':
          toggleLineNumbers();
          break;
        case 'preview-only':
          togglePreviewOnly();
          break;
        case 'import-md':
          document.getElementById('import-file').click();
          break;
        case 'download-md':
          exportMarkdown();
          break;
        case 'download-html':
          exportHTML();
          break;
        case 'clear':
          clearEditor(refresh);
          break;
        case 'help':
          dom.helpModal.classList.add('active');
          break;
        default:
          insertMarkdown(action, refresh);
      }
    });
  });

  document.querySelectorAll('.tool-dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action) insertMarkdown(action, refresh);
    });
  });

  const importFile = document.getElementById('import-file');
  importFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importMarkdown(file, refresh);
    e.target.value = '';
  });

  const syncScrollCheck = document.getElementById('sync-scroll-check');
  syncScrollCheck?.addEventListener('change', (e) => {
    state.syncScroll = e.target.checked;
    localStorage.setItem(STORAGE.SYNC_SCROLL, state.syncScroll ? 'on' : 'off');
  });

  dom.sidebarClose?.addEventListener('click', toggleSidebar);
  dom.sidebarNewBtn?.addEventListener('click', createFile);

  initTooltip();

  document.querySelectorAll('.modal-close, .modal-overlay').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target === el) dom.helpModal.classList.remove('active');
    });
  });

  const imgPreview = document.getElementById('img-preview');
  imgPreview?.addEventListener('click', () => imgPreview.classList.remove('active'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dom.helpModal.classList.remove('active');
      imgPreview?.classList.remove('active');
    }
  });
}

function handleKeyDown(e, refresh) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = dom.editor.selectionStart;
    const end = dom.editor.selectionEnd;
    if (e.shiftKey) {
      const before = dom.editor.value.substring(0, start);
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineText = before.substring(lineStart);
      if (lineText.startsWith('  ')) {
        dom.editor.setRangeText('', lineStart, lineStart + 2, 'end');
      } else if (lineText.startsWith('\t')) {
        dom.editor.setRangeText('', lineStart, lineStart + 1, 'end');
      }
    } else {
      dom.editor.setRangeText('  ', start, end, 'end');
    }
    refresh();
    return;
  }

  if (e.ctrlKey && e.key === 'b') { e.preventDefault(); insertMarkdown('bold', refresh); return; }
  if (e.ctrlKey && e.key === 'i') { e.preventDefault(); insertMarkdown('italic', refresh); return; }
  if (e.ctrlKey && e.key === 'u') { e.preventDefault(); insertMarkdown('underline', refresh); return; }
  if (e.ctrlKey && e.key === 'k') { e.preventDefault(); insertMarkdown('link', refresh); return; }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveToStorage(); return; }
  if (e.ctrlKey && e.key === '/') { e.preventDefault(); toggleComment(refresh); return; }
}

function togglePreviewOnly() {
  state.previewOnly = !state.previewOnly;
  document.body.classList.toggle('preview-only', state.previewOnly);
  dom.previewToggle.style.color = state.previewOnly ? 'var(--accent)' : '';
}

function clearEditor(refresh) {
  if (confirm('确定要清空编辑器内容吗？')) {
    dom.editor.value = '';
    refresh();
  }
}

function handlePaste(e, refresh) {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (!item.type.startsWith('image/')) continue;
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const start = dom.editor.selectionStart;
      const end = dom.editor.selectionEnd;
      dom.editor.setRangeText(`![image](${ev.target.result})`, start, end, 'end');
      refresh();
    };
    reader.readAsDataURL(item.getAsFile());
    break;
  }
}

function handleDrop(e, refresh) {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (!files) return;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const start = dom.editor.selectionStart;
      const end = dom.editor.selectionEnd;
      dom.editor.setRangeText(`![${file.name}](${ev.target.result})`, start, end, 'end');
      refresh();
    };
    reader.readAsDataURL(file);
  }
}

export function showImagePreview(e) {
  const el = e.currentTarget;
  const overlay = document.getElementById('img-preview');
  const previewImg = document.getElementById('img-preview-img');
  if (!overlay || !previewImg) return;

  if (el.tagName.toLowerCase() === 'svg') {
    const svgStr = new XMLSerializer().serializeToString(el);
    previewImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    previewImg.alt = 'Mermaid 图表';
  } else {
    previewImg.src = el.src;
    previewImg.alt = el.alt || '预览';
  }
  overlay.classList.add('active');
}
