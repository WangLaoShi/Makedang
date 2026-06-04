import { STORAGE } from './config.js';
import { dom } from './context.js';

export function updateLineNumbers() {
  if (!dom.lineNumbersEl?.classList.contains('show')) return;
  const lines = dom.editor.value.split('\n').length;
  dom.lineNumbersEl.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

export function syncLineNumbersScroll() {
  if (dom.lineNumbersEl) dom.lineNumbersEl.scrollTop = dom.editor.scrollTop;
}

export function toggleLineNumbers() {
  const show = !dom.lineNumbersEl.classList.contains('show');
  dom.lineNumbersEl.classList.toggle('show', show);
  dom.lineNumbersToggle.classList.toggle('active', show);
  localStorage.setItem(STORAGE.LINE_NUMBERS, show ? 'on' : 'off');
  if (show) {
    updateLineNumbers();
    syncLineNumbersScroll();
  }
}

export function initLineNumbers() {
  if (localStorage.getItem(STORAGE.LINE_NUMBERS) !== 'off') {
    dom.lineNumbersEl.classList.add('show');
    dom.lineNumbersToggle.classList.add('active');
  }
  dom.editor.addEventListener('input', updateLineNumbers);
  dom.editor.addEventListener('scroll', syncLineNumbersScroll);
}
