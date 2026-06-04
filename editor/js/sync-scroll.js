import { STORAGE } from './config.js';
import { dom, state } from './context.js';

export function initSyncScroll() {
  if (localStorage.getItem(STORAGE.SYNC_SCROLL) === 'off') {
    state.syncScroll = false;
  }
  const checkbox = document.getElementById('sync-scroll-check');
  if (checkbox) checkbox.checked = state.syncScroll;

  let activePane = 'editor';

  dom.editor.addEventListener('mouseenter', () => { activePane = 'editor'; });
  dom.editor.addEventListener('mousedown', () => { activePane = 'editor'; });
  dom.editor.addEventListener('touchstart', () => { activePane = 'editor'; }, { passive: true });
  dom.editor.addEventListener('wheel', () => { activePane = 'editor'; }, { passive: true });

  dom.preview.addEventListener('mouseenter', () => { activePane = 'preview'; });
  dom.preview.addEventListener('mousedown', () => { activePane = 'preview'; });
  dom.preview.addEventListener('touchstart', () => { activePane = 'preview'; }, { passive: true });
  dom.preview.addEventListener('wheel', () => { activePane = 'preview'; }, { passive: true });

  let isSyncing = false;

  function syncScrollFrom(source, target) {
    if (isSyncing) return;
    const srcMax = source.scrollHeight - source.clientHeight;
    const tgtMax = target.scrollHeight - target.clientHeight;
    if (srcMax <= 0 || tgtMax <= 0) return;

    if (source === dom.editor) {
      const headings = target.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        const targetScroll = (source.scrollTop / srcMax) * tgtMax;
        if (Math.abs(target.scrollTop - targetScroll) > 0.5) {
          isSyncing = true;
          target.scrollTop = targetScroll;
          requestAnimationFrame(() => { isSyncing = false; });
        }
        return;
      }

      const ratio = source.scrollTop / srcMax;
      const virtualHeadings = [
        { offsetTop: 0 },
        ...Array.from(headings, (h) => ({ offsetTop: h.offsetTop })),
        { offsetTop: tgtMax },
      ];
      const segments = virtualHeadings.length - 1;
      const floatIndex = ratio * segments;
      const index = Math.floor(floatIndex);
      const frac = floatIndex - index;
      const curr = virtualHeadings[index];
      const next = virtualHeadings[Math.min(index + 1, virtualHeadings.length - 1)];
      const targetScroll = curr.offsetTop + frac * (next.offsetTop - curr.offsetTop);

      if (Math.abs(target.scrollTop - targetScroll) > 0.5) {
        isSyncing = true;
        target.scrollTop = Math.max(0, Math.min(targetScroll, tgtMax));
        requestAnimationFrame(() => { isSyncing = false; });
      }
    } else {
      const targetScroll = (source.scrollTop / srcMax) * tgtMax;
      if (Math.abs(target.scrollTop - targetScroll) > 0.5) {
        isSyncing = true;
        target.scrollTop = targetScroll;
        requestAnimationFrame(() => { isSyncing = false; });
      }
    }
  }

  dom.editor.addEventListener('scroll', () => {
    if (!state.syncScroll || activePane !== 'editor') return;
    syncScrollFrom(dom.editor, dom.preview);
  }, { passive: true });

  dom.preview.addEventListener('scroll', () => {
    if (!state.syncScroll || activePane !== 'preview') return;
    syncScrollFrom(dom.preview, dom.editor);
  }, { passive: true });
}
