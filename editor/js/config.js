/**
 * 全局配置与资源路径（兼容 GitHub Pages 子目录部署）
 */
export const STORAGE = {
  CONTENT: 'md_editor_content',
  FILES: 'md_editor_files',
  THEME: 'md_editor_theme',
  SYNC_SCROLL: 'md_editor_sync_scroll',
  LINE_NUMBERS: 'md_editor_line_numbers',
};

export const MERMAID_LANGS = [
  'mermaid', 'graph', 'flowchart', 'sequencediagram', 'classdiagram', 'state',
  'er', 'journey', 'gitgraph', 'pie', 'requirementdiagram', 'c4context',
  'mindmap', 'timeline', 'sankey', 'xychart', 'block', 'packet', 'kanban',
];

export const MERMAID_MODULE = new URL(
  '../vendor/mermaid/mermaid.esm.min.mjs',
  import.meta.url
).href;

/** 解析相对 editor 根目录的静态资源 URL */
export function asset(path) {
  return new URL(`../${path}`, import.meta.url).href;
}

export const HLJS_THEMES = {
  light: asset('vendor/highlight.js/github.min.css'),
  dark: asset('vendor/highlight.js/github-dark.min.css'),
};

export const KATEX_CSS = asset('vendor/katex/katex.min.css');
