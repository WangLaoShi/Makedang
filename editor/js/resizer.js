import { dom } from './context.js';

export function initResizer() {
  const editorPane = document.querySelector('.editor-pane');
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  dom.resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = editorPane.offsetWidth;
    dom.resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const containerWidth = document.querySelector('.editor-container').offsetWidth;
    const newWidth = Math.max(150, Math.min(startWidth + dx, containerWidth - 150));
    editorPane.style.flex = `0 0 ${(newWidth / containerWidth) * 100}%`;
  });

  document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    dom.resizer.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}
