import { STORAGE, HLJS_THEMES } from './config.js';
import { state } from './context.js';

function applyHljsTheme(isDark) {
  const link = document.getElementById('hljs-theme');
  if (link) link.href = isDark ? HLJS_THEMES.dark : HLJS_THEMES.light;
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE.THEME);
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    state.isDark = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    applyHljsTheme(true);
  }
}

export function toggleTheme(onThemeChange) {
  state.isDark = !state.isDark;
  document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
  localStorage.setItem(STORAGE.THEME, state.isDark ? 'dark' : 'light');
  applyHljsTheme(state.isDark);
  onThemeChange?.();
}
