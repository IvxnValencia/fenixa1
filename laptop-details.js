(() => {
  'use strict';
  const grid = document.getElementById('laptopGrid');
  const dialog = document.getElementById('laptopDetailDialog');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let currentId = null;
  function markup(p) {
    return `<div class="fx-sheet-top"><span>Ficha de laptop</span><button type="button" class="fx-sheet-close" data-close-laptop>Cerrar</button></div>
      <div class="product-sheet-main"><figure class="product-sheet-photo"><img src="${esc(p.image)}" alt="${esc(p.name)}" width="800" height="800"></figure><div class="product-sheet-info"><span class="market-category">${esc(p.model)} · ${esc(p.referenceKind || 'Configuración variable')}</span><h2 id="laptopDetailTitle">${esc(p.name)}</h2><p>${esc(p.reason)}</p><div class="catalog-price-line"><strong class="market-price">Precio por confirmar</strong><span class="estimate-label">Sin oferta verificada en COP ni disponibilidad local confirmada.</span></div><button type="button" class="secondary-button" data-detail-compare>Comparar</button><p id="laptopDetailStatus" role="status"></p></div></div>
      <div class="product-sheet-details"><dl class="laptop-detail-specs">${p.specs.map(([name, value]) => `<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><h3>Qué revisar antes de elegir</h3><ul>${p.limits.map(limit => `<li>${esc(limit)}</li>`).join('')}</ul><p>Región de la ficha: ${esc(p.region || 'por confirmar')}. Consultada el ${esc(/^\d{4}-\d{2}-\d{2}$/.test(p.checkedAt || '') ? p.checkedAt.split('-').reverse().join('/') : 'fecha no registrada')}.</p><p>${esc(p.imageKind === 'category' ? p.imageNote : 'Foto oficial de familia; no certifica el teclado, acabado o etiqueta de este SKU.')}</p><div class="product-links"><a class="source-link" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Ficha del fabricante</a><a class="source-link" href="https://listado.mercadolibre.com.co/${encodeURIComponent(p.model.toLowerCase())}" target="_blank" rel="noopener noreferrer">Buscar en Mercado Libre</a></div><small>Búsqueda, no oferta verificada.</small></div>`;
  }
  function compareButton() { return grid.querySelector(`[data-laptop-compare="${currentId}"]`); }
  function sync() {
    const selected = compareButton()?.getAttribute('aria-pressed') === 'true';
    const button = dialog.querySelector('[data-detail-compare]');
    button.textContent = selected ? 'Quitar de comparación' : 'Comparar';
    button.setAttribute('aria-pressed', String(selected));
  }
  function open(id) {
    const laptop = window.FENIXA_LAPTOPS.find(p => p.id === id);
    if (!laptop) return;
    currentId = id; dialog.innerHTML = markup(laptop); sync();
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[data-close-laptop]').focus();
  }
  grid.addEventListener('click', event => {
    const opener = event.target.closest('[data-open-laptop]');
    if (opener) { open(opener.dataset.openLaptop); return; }
    if (event.target.closest('button, a, input, select, details')) return;
    const card = event.target.closest('[data-laptop-id]');
    if (card) open(card.dataset.laptopId);
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { dialog.close(); return; }
    }
    if (event.target.closest('[data-close-laptop]')) { dialog.close(); return; }
    if (event.target.closest('[data-detail-compare]')) {
      compareButton()?.click(); sync();
      dialog.querySelector('#laptopDetailStatus').textContent = document.getElementById('laptopCompareStatus').textContent;
    }
  });
  dialog.addEventListener('close', () => {
    const opener = grid.querySelector(`[data-open-laptop="${currentId}"]`) || document.getElementById('laptopSearch');
    opener.focus({ preventScroll: true });
  });
  window.FENIXA_LAPTOP_DETAILS = { markup };
})();
