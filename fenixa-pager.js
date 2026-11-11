// Paginación numerada compartida: 12 elementos por página.
// La página vuelve a 1 cuando cambia la firma de filtros; si solo se repinta
// (por ejemplo, al añadir una pieza), se conserva la página actual.
(() => {
  'use strict';
  const SIZE = 12;
  const state = new Map();
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function pagesFor(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4].forEach(n => set.add(n));
    if (current >= total - 2) [total - 1, total - 2, total - 3].forEach(n => set.add(n));
    const list = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    list.forEach((n, i) => { if (i && n - list[i - 1] > 1) out.push('…'); out.push(n); });
    return out;
  }

  function paginate(key, items, { anchor, signature = '', onChange, label = 'Páginas', scrollTarget }) {
    let s = state.get(key);
    if (!s) { s = { page: 1, signature, onChange }; state.set(key, s); }
    s.onChange = onChange;
    s.scrollTarget = scrollTarget || anchor;
    if (s.signature !== signature) { s.page = 1; s.signature = signature; }
    const total = Math.max(1, Math.ceil(items.length / SIZE));
    s.page = Math.min(Math.max(1, s.page), total);

    let nav = document.getElementById(`${key}Pager`);
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = `${key}Pager`;
      nav.className = 'fx-pager';
      nav.setAttribute('aria-label', label);
      anchor.after(nav);
      nav.addEventListener('click', event => {
        const button = event.target.closest('[data-page]');
        if (!button || button.disabled || button.getAttribute('aria-current') === 'page') return;
        const st = state.get(key);
        st.page = Number(button.dataset.page);
        st.onChange?.();
        const target = st.scrollTarget;
        if (target) {
          const header = document.querySelector('.topbar')?.getBoundingClientRect().height || 0;
          const top = target.getBoundingClientRect().top + window.scrollY - header - 16;
          if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion() ? 'instant' : 'smooth' });
        }
        nav.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
      });
    }
    nav.hidden = total <= 1;
    const p = s.page;
    const from = items.length ? (p - 1) * SIZE + 1 : 0;
    const to = Math.min(items.length, p * SIZE);
    nav.innerHTML = total <= 1 ? '' :
      `<button type="button" class="fx-page fx-page-step" data-page="${p - 1}" ${p === 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>` +
      pagesFor(p, total).map(n => n === '…'
        ? '<span class="fx-page-gap" aria-hidden="true">…</span>'
        : `<button type="button" class="fx-page" data-page="${n}" ${n === p ? 'aria-current="page"' : ''} aria-label="Página ${n} de ${total}">${n}</button>`).join('') +
      `<button type="button" class="fx-page fx-page-step" data-page="${p + 1}" ${p === total ? 'disabled' : ''} aria-label="Página siguiente">›</button>` +
      `<span class="fx-page-range">${from}–${to} de ${items.length}</span>`;
    return { items: items.slice((p - 1) * SIZE, p * SIZE), page: p, total, from, to };
  }

  window.FENIXA_PAGER = { paginate, SIZE };
})();
