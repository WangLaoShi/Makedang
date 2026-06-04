import { MERMAID_LANGS } from './config.js';
import { escapeHtml, headingId, stripFrontMatter } from './utils.js';
import { convertSeqToMermaid } from './mermaid-helper.js';

export { stripFrontMatter };

export function initMarked() {
  const renderer = new marked.Renderer();

  renderer.code = function (code, language) {
    const lang = (language || '').toLowerCase();
    if (MERMAID_LANGS.includes(lang) || lang === 'seq' || lang === 'gantt') {
      let mermaidCode = code;
      if (lang === 'gantt') mermaidCode = `gantt\n${code}`;
      else if (lang === 'seq') mermaidCode = convertSeqToMermaid(code);
      return `<pre><code class="hljs language-mermaid">${escapeHtml(mermaidCode)}</code><button class="hljs-copy-btn">复制</button></pre>`;
    }
    const validLang = language && hljs.getLanguage(language) ? language : 'plaintext';
    const highlighted = hljs.highlight(code, { language: validLang }).value;
    return `<pre><code class="hljs language-${validLang}">${highlighted}</code><button class="hljs-copy-btn">复制</button></pre>`;
  };

  renderer.codespan = (code) => `<code>${escapeHtml(code)}</code>`;
  renderer.table = (header, body) => `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
  renderer.heading = (text, level) => {
    const id = headingId(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  renderer.blockquote = function (quote) {
    const calloutMatch = quote.match(/^\s*<p>\[!([A-Z]+)\](?:\s+([^<]*?))?(?:<br\s*\/?>\s*|\s*)/i);
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const title = calloutMatch[2] || type.toUpperCase();
      const content = quote.replace(/^\s*<p>\[!([A-Z]+)\](?:\s+[^<]*?)?(?:<br\s*\/?>\s*|\s*)/i, '<p>');
      const icons = {
        info: 'ℹ️', warning: '⚠️', danger: '🔴', success: '✅',
        note: '📝', tip: '💡', important: '❗',
      };
      const icon = icons[type] || '📌';
      return `<div class="callout callout-${type}"><div class="callout-title">${icon} ${escapeHtml(title)}</div>${content}</div>`;
    }
    return `<blockquote>${quote}</blockquote>`;
  };

  marked.use({
    extensions: [{
      name: 'highlight',
      level: 'inline',
      start(src) { return src.match(/==/)?.index; },
      tokenizer(src) {
        const match = /^==(.+?)==/.exec(src);
        if (match) return { type: 'highlight', raw: match[0], text: match[1] };
      },
      renderer(token) {
        return `<mark>${escapeHtml(token.text)}</mark>`;
      },
    }],
  });

  marked.use({
    renderer,
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
  });
}

export function processTOC(html, raw) {
  if (!/\[TOC\]|\[toc\]/i.test(raw)) return html;

  const lines = raw.split('\n');
  const headings = [];
  let inCodeBlock = false;
  let codeFence = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeFence = fence;
      } else if (fence.startsWith(codeFence) || codeFence.startsWith(fence)) {
        inCodeBlock = false;
        codeFence = null;
      }
      continue;
    }
    if (inCodeBlock) continue;

    const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\s*\{[^}]*\}\s*$/, '').trim();
      headings.push({ level, text, id: headingId(text) });
    }
  }

  if (headings.length === 0) return html;

  let tocHtml = '<div class="toc"><div class="callout-title">📑 目录</div><ul>';
  headings.forEach((h) => {
    tocHtml += `<li style="margin-left:${(h.level - 2) * 16}px"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`;
  });
  tocHtml += '</ul></div>';

  return html.replace(/<p>\[TOC\]<\/p>/gi, tocHtml).replace(/<p>\[toc\]<\/p>/gi, tocHtml);
}

export function preprocessFootnotes(raw) {
  const defs = {};
  const defRegex = /^\[\^(\w+)\]:\s*(.+)$/gm;
  let m;
  while ((m = defRegex.exec(raw)) !== null) {
    defs[m[1]] = m[2];
  }

  let processed = raw.replace(/^\[\^\w+\]:\s*.+$/gm, '');
  let index = 1;
  const indexMap = {};
  processed = processed.replace(/\[\^(\w+)\]/g, (match, key) => {
    if (defs[key]) {
      if (!indexMap[key]) indexMap[key] = index++;
      return `<!--FNREF:${key}-->`;
    }
    return match;
  });

  return { processed, defs, indexMap };
}

export function renderFootnotes(html, defs, indexMap) {
  html = html.replace(/<!--FNREF:(\w+)-->/g, (match, key) => {
    if (indexMap[key]) {
      return `<sup class="footnote-ref"><a id="fnref-${key}" href="#fn-${key}" title="查看脚注">[${indexMap[key]}]</a></sup>`;
    }
    return match;
  });

  let footnoteHtml = '';
  for (const key in indexMap) {
    footnoteHtml += `<li id="fn-${key}"><p>${marked.parseInline(defs[key])} <a href="#fnref-${key}" title="返回引用">↩</a></p></li>`;
  }
  if (footnoteHtml) {
    html += `<div class="footnotes"><ol>${footnoteHtml}</ol></div>`;
  }
  return html;
}

const PURIFY_OPTIONS = {
  ADD_TAGS: ['mjx-container', 'math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msqrt', 'mtable', 'mtr', 'mtd', 'mtext', 'mstyle', 'annotation', 'semantics'],
  ADD_ATTR: ['xmlns', 'display', 'mathvariant', 'accent', 'fence', 'stretchy', 'lspace', 'rspace', 'displaystyle', 'scriptlevel'],
};

export function parseMarkdown(raw) {
  const cleanRaw = stripFrontMatter(raw);
  const { processed, defs, indexMap } = preprocessFootnotes(cleanRaw);
  let html = marked.parse(processed);
  html = processTOC(html, cleanRaw);
  html = renderFootnotes(html, defs, indexMap);
  return DOMPurify.sanitize(html, PURIFY_OPTIONS);
}
