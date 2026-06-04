import { STORAGE } from './config.js';
import { dom, state } from './context.js';
import { DEFAULT_CONTENT } from './default-content.js';
import { generateId, escapeHtml, getDocumentTitle } from './utils.js';
import { initTooltip } from './tooltip.js';

let onFilesChange = () => {};

export function setFilesCallbacks({ onChange }) {
  if (onChange) onFilesChange = onChange;
}

export function getFileTitle(content) {
  return getDocumentTitle(content, '未命名');
}

function persistFiles() {
  localStorage.setItem(STORAGE.FILES, JSON.stringify({
    files: state.files,
    activeFileId: state.activeFileId,
  }));
}

export function loadFiles() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE.FILES));
    if (data?.files?.length > 0) {
      state.files = data.files;
      state.activeFileId = data.activeFileId || data.files[0].id;
      return;
    }
  } catch (_) { /* 忽略损坏数据 */ }

  const oldContent = localStorage.getItem(STORAGE.CONTENT) || DEFAULT_CONTENT;
  const id = generateId();
  state.files = [{ id, content: oldContent, updatedAt: Date.now() }];
  state.activeFileId = id;
  persistFiles();
}

export function saveToStorage() {
  if (state.activeFileId) {
    const file = state.files.find((f) => f.id === state.activeFileId);
    if (file) {
      file.content = dom.editor.value;
      file.updatedAt = Date.now();
      persistFiles();
    }
  }
  localStorage.setItem(STORAGE.CONTENT, dom.editor.value);
  dom.saveStatus.textContent = '已保存';
  dom.saveStatus.classList.remove('saving');
  renderFileList();
}

export function scheduleSave() {
  dom.saveStatus.textContent = '保存中...';
  dom.saveStatus.classList.add('saving');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(saveToStorage, 800);
}

export function switchFile(id) {
  if (id === state.activeFileId) return;
  const current = state.files.find((f) => f.id === state.activeFileId);
  if (current) {
    current.content = dom.editor.value;
    current.updatedAt = Date.now();
  }
  state.activeFileId = id;
  persistFiles();
  const file = state.files.find((f) => f.id === id);
  dom.editor.value = file?.content ?? '';
  onFilesChange();
  renderFileList();
}

export function createFile() {
  const id = generateId();
  const content = '# 未命名\n\n在此输入内容...';
  state.files.push({ id, content, updatedAt: Date.now() });
  state.activeFileId = id;
  persistFiles();
  dom.editor.value = content;
  onFilesChange();
  renderFileList();
}

function renameFile(id) {
  const file = state.files.find((f) => f.id === id);
  if (!file) return;
  const newTitle = prompt('重命名文件：', getFileTitle(file.content));
  if (newTitle === null) return;
  file.content = file.content.replace(/^#\s+.*$/m, `# ${newTitle}`) || `# ${newTitle}\n\n${file.content}`;
  file.updatedAt = Date.now();
  persistFiles();
  renderFileList();
  if (id === state.activeFileId) onFilesChange();
}

function deleteFile(id) {
  if (state.files.length <= 1) {
    alert('至少需要保留一个文件');
    return;
  }
  if (!confirm('确定要删除这个文件吗？')) return;
  state.files = state.files.filter((f) => f.id !== id);
  if (state.activeFileId === id) {
    state.activeFileId = state.files[0].id;
    dom.editor.value = state.files[0].content;
    onFilesChange();
  }
  persistFiles();
  renderFileList();
}

export function renderFileList() {
  if (!dom.fileListEl) return;
  dom.fileListEl.innerHTML = '';
  state.files.forEach((file) => {
    const item = document.createElement('div');
    item.className = 'file-item' + (file.id === state.activeFileId ? ' active' : '');
    item.innerHTML = `
      <span class="file-name">${escapeHtml(getFileTitle(file.content))}</span>
      <div class="file-actions">
        <button title="重命名" data-rename="${file.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button title="删除" data-delete="${file.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>`;
    item.addEventListener('click', (e) => {
      if (e.target.closest('[data-rename], [data-delete]')) return;
      switchFile(file.id);
    });
    item.querySelector('[data-rename]')?.addEventListener('click', () => renameFile(file.id));
    item.querySelector('[data-delete]')?.addEventListener('click', () => deleteFile(file.id));
    dom.fileListEl.appendChild(item);
  });
  initTooltip(dom.fileListEl);
}

export function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  dom.fileSidebar.classList.toggle('open', state.sidebarOpen);
  document.body.classList.toggle('sidebar-open', state.sidebarOpen);
}
