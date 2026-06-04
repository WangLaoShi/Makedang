import { dom } from './context.js';

export function initTooltip(container) {
  if (!dom.tooltipEl) return;
  const scope = container || document;
  scope.querySelectorAll('[title]').forEach((el) => {
    if (el.dataset.tooltipBound) return;
    const title = el.getAttribute('title');
    if (!title) return;
    el.dataset.tooltip = title;
    el.removeAttribute('title');
    el.dataset.tooltipBound = '1';

    el.addEventListener('mouseenter', () => {
      dom.tooltipEl.textContent = el.dataset.tooltip;
      dom.tooltipEl.classList.add('show');
      const rect = el.getBoundingClientRect();
      const tipRect = dom.tooltipEl.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - tipRect.width / 2;
      let top = rect.bottom + 6;
      if (left < 4) left = 4;
      if (left + tipRect.width > window.innerWidth - 4) {
        left = window.innerWidth - tipRect.width - 4;
      }
      dom.tooltipEl.style.left = `${left}px`;
      dom.tooltipEl.style.top = `${top}px`;
    });

    el.addEventListener('mouseleave', () => {
      dom.tooltipEl.classList.remove('show');
    });
  });
}
