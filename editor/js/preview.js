import { dom, state } from './context.js';
import { parseMarkdown } from './markdown.js';
import { getMermaid } from './mermaid-helper.js';

function bindCopyButtons() {
  dom.preview.querySelectorAll('.hljs-copy-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const code = this.parentElement.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const old = this.textContent;
        this.textContent = '已复制';
        setTimeout(() => { this.textContent = old; }, 1500);
      });
    });
  });
}

function renderKatex() {
  if (typeof renderMathInElement === 'undefined') return;
  dom.preview.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    if (text.startsWith('$$') && text.endsWith('$$')) {
      p.textContent = p.textContent;
    }
  });
  renderMathInElement(dom.preview, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  });
}

function prepareMermaidBlocks() {
  dom.preview.querySelectorAll('.language-mermaid').forEach((el) => {
    const container = document.createElement('div');
    container.className = 'mermaid';
    container.textContent = el.textContent;
    el.closest('pre').replaceWith(container);
  });
}

function bindImageZoom(handler) {
  dom.preview.querySelectorAll('img').forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', handler);
  });
}

async function renderMermaidCharts(onImageClick) {
  if (dom.preview.querySelectorAll('.mermaid').length === 0) return;
  try {
    const mermaid = await getMermaid();
    mermaid.initialize({ startOnLoad: false, theme: state.isDark ? 'dark' : 'default' });
    await mermaid.run({ querySelector: '.mermaid' });
    dom.preview.querySelectorAll('.mermaid svg').forEach((svg) => {
      svg.style.cursor = 'zoom-in';
      svg.addEventListener('click', onImageClick);
    });
  } catch (err) {
    console.error('[Mermaid] 渲染失败:', err);
  }
}

export function renderPreview(onImageClick) {
  const raw = dom.editor.value;
  dom.preview.innerHTML = parseMarkdown(raw);

  dom.preview.querySelectorAll('li').forEach((li) => {
    if (li.querySelector(':scope > input[type="checkbox"]')) {
      li.classList.add('task-list-item');
    }
  });

  bindCopyButtons();
  renderKatex();
  prepareMermaidBlocks();
  bindImageZoom(onImageClick);
  renderMermaidCharts(onImageClick);
}

export async function ensureMermaidRendered() {
  if (
    dom.preview.querySelectorAll('.mermaid').length > 0 &&
    !dom.preview.querySelector('.mermaid svg')
  ) {
    const mermaid = await getMermaid();
    mermaid.initialize({ startOnLoad: false, theme: state.isDark ? 'dark' : 'default' });
    await mermaid.run({ querySelector: '.mermaid' });
  }
}
