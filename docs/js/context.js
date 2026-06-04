/** DOM 引用与应用状态 */
export const dom = {
  editor: document.getElementById('editor'),
  preview: document.getElementById('preview'),
  resizer: document.getElementById('resizer'),
  saveStatus: document.getElementById('save-status'),
  cursorPos: document.getElementById('cursor-pos'),
  wordCountEl: document.getElementById('word-count'),
  previewToggle: document.getElementById('preview-toggle'),
  helpModal: document.getElementById('help-modal'),
  fileSidebar: document.getElementById('file-sidebar'),
  fileListEl: document.getElementById('file-list'),
  sidebarClose: document.getElementById('sidebar-close'),
  sidebarNewBtn: document.getElementById('sidebar-new-btn'),
  tooltipEl: document.getElementById('tooltip'),
  lineNumbersEl: document.getElementById('line-numbers'),
  lineNumbersToggle: document.getElementById('line-numbers-toggle'),
};

export const state = {
  saveTimer: null,
  isDark: false,
  previewOnly: false,
  syncScroll: true,
  sidebarOpen: false,
  files: [],
  activeFileId: null,
  mermaidPromise: null,
};
