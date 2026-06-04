import { dom } from './context.js';

export const TOOLBAR_ACTIONS = {
  bold: { before: '**', after: '**', placeholder: '粗体文本' },
  italic: { before: '*', after: '*', placeholder: '斜体文本' },
  underline: { before: '<u>', after: '</u>', placeholder: '下划线文本' },
  strikethrough: { before: '~~', after: '~~', placeholder: '删除线文本' },
  code: { before: '```\n', after: '\n```', placeholder: '代码' },
  quote: { before: '> ', after: '', placeholder: '引用内容' },
  link: { before: '[', after: '](https://example.com)', placeholder: '链接文本' },
  image: { before: '![', after: '](https://example.com/image.png)', placeholder: '图片描述' },
  hr: { before: '\n---\n', after: '', placeholder: '' },
  toc: { before: '\n[TOC]\n', after: '', placeholder: '' },
  table: {
    before: '\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容 | 内容 | 内容 |\n',
    after: '',
    placeholder: '',
  },
  list: { before: '- ', after: '', placeholder: '列表项' },
  'ordered-list': { before: '1. ', after: '', placeholder: '列表项' },
  'task-list': { before: '- [ ] ', after: '', placeholder: '任务' },
  'heading-1': { before: '# ', after: '', placeholder: '标题' },
  'heading-2': { before: '## ', after: '', placeholder: '标题' },
  'heading-3': { before: '### ', after: '', placeholder: '标题' },
  'heading-4': { before: '#### ', after: '', placeholder: '标题' },
  'heading-5': { before: '##### ', after: '', placeholder: '标题' },
  'heading-6': { before: '###### ', after: '', placeholder: '标题' },
  sup: { before: '<sup>', after: '</sup>', placeholder: '上标' },
  sub: { before: '<sub>', after: '</sub>', placeholder: '下标' },
};

export function insertMarkdown(action, onChange) {
  const cfg = TOOLBAR_ACTIONS[action];
  if (!cfg) return;

  const start = dom.editor.selectionStart;
  const end = dom.editor.selectionEnd;
  const selected = dom.editor.value.substring(start, end);
  const insertText = selected || cfg.placeholder;
  const replacement = cfg.before + insertText + cfg.after;

  dom.editor.setRangeText(replacement, start, end, 'end');
  dom.editor.focus();

  if (!selected && cfg.placeholder) {
    const newPos = start + cfg.before.length;
    dom.editor.setSelectionRange(newPos, newPos + cfg.placeholder.length);
  }

  onChange();
}

export function toggleComment(onChange) {
  const start = dom.editor.selectionStart;
  const end = dom.editor.selectionEnd;
  const selected = dom.editor.value.substring(start, end);

  if (selected) {
    if (selected.startsWith('<!-- ') && selected.endsWith(' -->')) {
      dom.editor.setRangeText(selected.slice(5, -4), start, end, 'end');
    } else {
      dom.editor.setRangeText(`<!-- ${selected} -->`, start, end, 'end');
    }
  } else {
    dom.editor.setRangeText('<!--  -->', start, end, 'end');
    dom.editor.setSelectionRange(start + 5, start + 5);
  }
  onChange();
}
