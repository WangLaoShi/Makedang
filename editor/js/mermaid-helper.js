import { MERMAID_MODULE } from './config.js';
import { state } from './context.js';

export function convertSeqToMermaid(code) {
  if (/^\s*sequenceDiagram\b/mi.test(code)) return code;
  const result = ['sequenceDiagram'];
  for (const line of code.trim().split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;
    const mermaidLine = trimmed
      .replace(/^(\w+)=>(\w+):/, '$1->>$2:')
      .replace(/^(\w+)-->(\w+):/, '$1-->>$2:')
      .replace(/^(\w+)->(\w+)(?![->]):/, '$1->>$2:');
    result.push('    ' + mermaidLine);
  }
  return result.join('\n');
}

export function getMermaid() {
  if (state.mermaidPromise) return state.mermaidPromise;
  state.mermaidPromise = import(MERMAID_MODULE)
    .then((mod) => mod.default || mod)
    .catch((err) => {
      console.error('[Mermaid] 加载失败:', err);
      throw err;
    });
  return state.mermaidPromise;
}
