import { HLJS_THEMES, KATEX_CSS } from './config.js';
import { dom, state } from './context.js';
import { escapeHtml, getDocumentTitle } from './utils.js';
import { ensureMermaidRendered } from './preview.js';

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importMarkdown(file, onImported) {
  const reader = new FileReader();
  reader.onload = (e) => {
    dom.editor.value = e.target.result;
    onImported();
  };
  reader.readAsText(file);
}

export function exportMarkdown() {
  const title = getDocumentTitle(dom.editor.value);
  downloadFile(dom.editor.value, `${title}.md`, 'text/markdown');
}

export async function exportHTML() {
  const title = getDocumentTitle(dom.editor.value, 'Document');
  await ensureMermaidRendered();

  let hljsCss = '';
  try {
    const hljsTheme = document.getElementById('hljs-theme');
    const cssUrl = hljsTheme?.href || HLJS_THEMES.light;
    hljsCss = await (await fetch(cssUrl)).text();
  } catch {
    hljsCss = '/* 代码高亮样式加载失败 */';
  }

  let katexCss = '';
  try {
    const katexLink = document.querySelector('link[href*="katex"]');
    katexCss = await (await fetch(katexLink?.href || KATEX_CSS)).text();
  } catch {
    katexCss = '/* KaTeX 样式加载失败 */';
  }

  const clone = dom.preview.cloneNode(true);
  clone.querySelectorAll('.hljs-copy-btn').forEach((btn) => btn.remove());
  clone.querySelectorAll('[id]').forEach((el) => {
    if (!el.closest('svg')) el.removeAttribute('id');
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #333; }
h1,h2,h3,h4,h5,h6 { margin-top: 24px; margin-bottom: 12px; }
h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 8px; }
h2 { font-size: 1.6em; border-bottom: 1px solid #eee; padding-bottom: 6px; }
code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: SF Mono, Fira Code, Monaco, Consolas, monospace; font-size: 0.9em; }
pre { background: #f6f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #e0e0e0; }
pre code { background: transparent; color: #24292f; padding: 0; font-size: 13px; line-height: 1.6; }
blockquote { border-left: 4px solid #2563eb; background: #f8f9fa; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th,td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; }
th { background: #f8f9fa; }
img { max-width: 100%; border-radius: 6px; }
svg { max-width: 100%; height: auto; }
.mermaid svg { display: block; margin: 16px auto; }
mark { background: #fef08a; color: #854d0e; padding: 1px 4px; border-radius: 3px; }
.footnote-ref a { color: #2563eb; text-decoration: none; }
.footnotes { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
${hljsCss}
${katexCss}
</style>
</head>
<body>
${clone.innerHTML}
</body>
</html>`;

  downloadFile(htmlContent, `${title}.html`, 'text/html');
}
