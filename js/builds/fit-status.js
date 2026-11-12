// A compact disclosure shared by build, catalogue and comparison views.
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    pending: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    matched: '<path d="m8 12 3 3 5-6"/><circle cx="12" cy="12" r="9"/>',
    conflict: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/>'
  };
  function render(fit, {hasParts = true, context = 'Mi build', open = false} = {}) {
    const conflict = fit.status === 'conflict';
    const tone = conflict ? 'conflict' : fit.matched ? 'matched' : 'pending';
    const label = conflict ? fit.label || 'Conflicto detectado' : fit.matched ? 'Coincidencias encontradas' : 'Faltan datos';
    const hint = conflict ? 'Revisa el conflicto antes de añadir.' : !hasParts ? 'Añade otras piezas para revisar el conjunto.' : fit.matched ? 'Hay coincidencias. Quedan detalles por revisar.' : 'Aún faltan datos del conjunto.';
    return `<details class="fit-status fit-status--${tone}" ${conflict || open ? 'open' : ''}><summary><span class="fit-status-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${icons[tone]}</svg></span><span class="fit-status-copy"><strong>${esc(label)}</strong></span><svg class="fit-status-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></summary><div class="fit-status-details"><small>${esc(context)}</small><p>${esc(!hasParts && !conflict ? hint : fit.reason || hint)}</p><p class="fit-status-limit">La revisión es parcial: no certifica el montaje completo.</p></div></details>`;
  }
  // One- or two-word tag for dense lists; the detail stays in the title attribute.
  function tag(fit, {hasParts = true} = {}) {
    const conflict = fit.status === 'conflict';
    const tone = conflict ? 'conflict' : fit.matched ? 'matched' : 'pending';
    const label = conflict ? 'Conflicto' : fit.matched ? 'Compatible' : 'Revisar';
    const detail = !hasParts && !conflict ? 'Todavía no hay otras piezas de referencia.' : fit.reason;
    const title = `${detail || ''} La revisión es parcial: no certifica el montaje completo.`.trim();
    return `<span class="fit-tag fit-tag--${tone}" title="${esc(title)}" aria-label="${esc(label + '. ' + title)}">${label}</span>`;
  }
  window.FENIXA_FIT_STATUS = {render, tag};
})();
