// Carrito = lista de compra de Mi build.
// Agrupa las piezas por la tienda con la mejor oferta consultada, permite marcar
// lo que ya se compró (se guarda en este navegador) y muestra el total pendiente.
// Las versiones guardadas de builds viven en Mi build, no aquí: un carrito es
// para comprar, no para archivar configuraciones.
(() => {
  'use strict';
  const root = document.getElementById('carrito'), state = window.FENIXA_MY_BUILD, market = window.FENIXA_MARKET;
  if (!root || !state || !market) return;
  const catalog = window.FENIXA_CATALOG, byId = new Map(catalog.products.map(p => [p.id, p]));
  const categories = new Map(catalog.categories.map(c => [c.id, c.name]));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const name = p => window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : p.name;
  const thumb = src => window.FENIXA_THUMB ? window.FENIXA_THUMB(src) : src;
  const money = n => market.money(n);
  const count = n => `${n} ${n === 1 ? 'pieza' : 'piezas'}`;
  const KEY = 'fenixa-cart-bought';
  const day = o => { const t = Date.parse(o?.checkedAt); return Number.isFinite(t) ? new Date(t).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'short' }) : ''; };
  function bought() { try { const ids = JSON.parse(localStorage.getItem(KEY) || '[]'); return new Set(Array.isArray(ids) ? ids : []); } catch { return new Set(); } }
  function setBought(set) { try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* Solo en esta pestaña. */ } }
  function storeName(o) {
    let store = String(o?.store || '');
    if (store.length > 28) { try { store = new URL(o.url).hostname.replace(/^www\./, ''); } catch {} }
    return store;
  }
  function lines() {
    return state.ids().map(id => byId.get(id)).filter(Boolean).map(p => {
      const o = market.fixed(p), ref = window.FENIXA_AUTO_BUILD?.reference?.(p);
      return { p, o, price: o?.price ?? ref?.low ?? null, store: o ? storeName(o) : '' };
    });
  }
  function row(line, done) {
    const { p, o, price } = line;
    const status = o ? (o.status === 'listed' ? 'Precio publicado' : market.recent(o) ? 'Consultado' : 'Consulta vencida') + (day(o) ? ' · ' + day(o) : '') : 'Sin oferta verificada';
    return `<li class="cart-line${done ? ' is-bought' : ''}">
      <img src="${esc(thumb(p.image))}" alt="" width="56" height="56" loading="lazy">
      <div class="cart-line-text"><small>${esc(categories.get(p.category) || '')}</small><strong title="${esc(p.name)}">${esc(name(p))}</strong><span>${esc(status)}</span></div>
      <div class="cart-line-price"><strong>${price === null ? 'Por confirmar' : money(price)}</strong></div>
      <div class="cart-line-actions">
        <label class="cart-bought"><input type="checkbox" data-cart-bought="${esc(p.id)}"${done ? ' checked' : ''}><span>Ya la compré</span></label>
        ${o?.url ? `<a class="primary-button" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer" aria-label="Comprar ${esc(name(p))} en ${esc(line.store)} (se abre en otra pestaña)">Comprar ↗</a>` : `<button type="button" class="secondary-button" data-cart-find="${esc(p.id)}">Buscar</button>`}
        <button type="button" class="cart-line-remove" data-cart-remove="${esc(p.id)}" aria-label="Quitar ${esc(name(p))} de Mi build">Quitar</button>
      </div>
    </li>`;
  }
  function render() {
    const all = lines(), done = bought();
    // Contador del icono del carrito en la barra superior.
    const badge = document.getElementById('topbarCartCount');
    if (badge) { badge.textContent = String(all.length); badge.hidden = !all.length; badge.closest('a')?.setAttribute('aria-label', all.length ? `Carrito, ${all.length} ${all.length === 1 ? 'pieza' : 'piezas'}` : 'Carrito'); }
    // Limpia marcas de piezas que ya no están en la build.
    const ids = new Set(all.map(l => l.p.id)), kept = new Set([...done].filter(id => ids.has(id)));
    if (kept.size !== done.size) setBought(kept);
    const groups = new Map();
    for (const line of all) {
      const key = line.store || 'Sin oferta verificada';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(line);
    }
    const priced = all.filter(l => l.price !== null), pending = priced.filter(l => !kept.has(l.p.id));
    const total = priced.reduce((s, l) => s + l.price, 0), left = pending.reduce((s, l) => s + l.price, 0);
    const missing = all.length - priced.length, stale = all.some(l => l.o && !market.recent(l.o));
    const savedCount = window.FENIXA_BUILD_LIBRARY?.list?.().length || 0;
    root.innerHTML = `<div class="section-heading"><div><h2 id="cartTitle" tabindex="-1">Carrito</h2><p>Las piezas de Mi build listas para comprar, agrupadas por tienda.</p></div>${all.length ? '<a class="secondary-button" href="#mi-build">Editar Mi build</a>' : ''}</div>
      ${!all.length ? `<div class="cart-empty"><p>Tu carrito está vacío. Añade piezas a Mi build o genera una propuesta en Armar mi PC.</p><div class="cart-actions"><a class="primary-button" href="#configurador">Armar mi PC</a><a class="secondary-button" href="#componentes">Explorar componentes</a></div></div>` : `
      <div class="cart-layout">
        <div class="cart-stores">${[...groups].map(([store, list]) => {
          const sub = list.filter(l => l.price !== null).reduce((s, l) => s + l.price, 0);
          return `<section class="cart-store" aria-label="${esc(store)}"><header><h3>${esc(store)}</h3><span>${count(list.length)}${sub ? ' · ' + money(sub) : ''}</span></header><ul>${list.map(l => row(l, kept.has(l.p.id))).join('')}</ul></section>`;
        }).join('')}</div>
        <aside class="cart-total" aria-label="Resumen de la compra">
          <h3>Resumen</h3>
          <dl>
            <div><dt>Piezas</dt><dd>${all.length}${kept.size ? ` · ${kept.size} compradas` : ''}</dd></div>
            <div><dt>Total de referencia</dt><dd>${priced.length ? money(total) : 'Por confirmar'}</dd></div>
            <div class="cart-total-left"><dt>Te falta por comprar</dt><dd>${priced.length ? money(left) : 'Por confirmar'}</dd></div>
          </dl>
          ${missing ? `<p class="cart-warning">${count(missing)} sin precio: el total no las incluye.</p>` : ''}
          ${stale ? '<p class="cart-note">Algunos precios son de consultas de hace más de 72 horas: confírmalos en la tienda antes de pagar.</p>' : ''}
          <p class="cart-note">No incluye envío, montaje ni sistema operativo.</p>
          <button type="button" class="secondary-button" data-cart-copy>Copiar lista</button>
          <p class="cart-copy-status" role="status"></p>
        </aside>
      </div>`}
      <p class="cart-saved-link">${savedCount ? `Tienes ${savedCount} ${savedCount === 1 ? 'versión guardada' : 'versiones guardadas'} de builds en <a href="#mi-build">Mi build → Builds guardadas</a>.` : 'Para conservar varias configuraciones usa «Guardar versión» en <a href="#mi-build">Mi build</a>.'}</p>`;
  }
  function listText() {
    const all = lines();
    return ['Lista de compra · FENIXA', ...all.map(l => `- ${categories.get(l.p.category) || ''}: ${l.p.name} — ${l.price === null ? 'precio por confirmar' : money(l.price)}${l.store ? ' en ' + l.store : ''}${l.o?.url ? ' · ' + l.o.url : ''}`)].join('\n');
  }
  root.addEventListener('change', event => {
    const box = event.target.closest('[data-cart-bought]');
    if (!box) return;
    const set = bought();
    box.checked ? set.add(box.dataset.cartBought) : set.delete(box.dataset.cartBought);
    setBought(set);
    render();
    root.querySelector(`[data-cart-bought="${CSS.escape(box.dataset.cartBought)}"]`)?.focus({ preventScroll: true });
  });
  root.addEventListener('click', event => {
    const remove = event.target.closest('[data-cart-remove]');
    if (remove) { window.FENIXA_BUILD_UNDO?.remove(remove.dataset.cartRemove, { returnFocus: () => root.querySelector('[data-cart-remove], #cartTitle') }); return; }
    const find = event.target.closest('[data-cart-find]');
    if (find) { const p = byId.get(find.dataset.cartFind); window.FENIXA_CART_DRAWER?.close({ restoreFocus: false }); window.FENIXA_BROWSE_CATEGORY?.(p.category, p.name); return; }
    if (event.target.closest('[data-cart-copy]')) {
      const status = root.querySelector('.cart-copy-status');
      navigator.clipboard?.writeText(listText()).then(() => { status.textContent = 'Lista copiada.'; }, () => { status.textContent = 'No se pudo copiar.'; });
    }
  });
  ['fenixa-build-changed', 'fenixa-library-changed', 'storage'].forEach(event => window.addEventListener(event, render));
  render();
})();
