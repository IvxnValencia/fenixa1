(() => {
  'use strict';
  const { products, builds: completeBuilds, categories } = window.FENIXA_CATALOG;
  const market = window.FENIXA_MARKET;
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const money = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  const range = item => `${money(item.min)} – ${money(item.max)}`;
  const categoryName = id => categories.find(c => c.id === id)?.name || id;

  const external = (url, label, cls = 'source-link') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} </a>`;
  const thumb = src => window.FENIXA_THUMB ? window.FENIXA_THUMB(src) : src;
  const photo = (p, cls = '', lazy = true) => `<img class="${cls}" src="${esc(thumb(p.image))}" alt="${esc(p.name)}" width="480" height="360" ${lazy ? 'loading="lazy"' : ''} decoding="async">${p.imageNote?`<small class="catalog-image-note">${esc(p.imageNote)}</small>`:''}`;
  const selected = new Set();
  let saved;
  try { const value = JSON.parse(localStorage.getItem('fenixa-saved-builds') || '[]'); saved = new Set(Array.isArray(value) ? value.filter(id => completeBuilds.some(b => b.id === id)) : []); } catch { saved = new Set(); }
  let activeUse = 'all';
  let activeBuild = null;
  const partFilters = new Map();
  let opener = null;
  function catalogOffer(p, store=$('storeFilter').value, recentOnly=$('pricedOnly').checked) {
    const offers = market.referenceOffers(p,store,recentOnly);
    return offers.length ? {...offers[0], storeCount:new Set(offers.map(o=>o.storeId)).size} : null;
  }
  function brief(p) {
    const facts=window.FENIXA_SPECS.facts(p);
    if(!facts.verified)return p.summary;
    const v=facts.values, fields={cpu:[['cores','núcleos'],['threads','hilos'],['socket','']],gpu:[['vram','GB VRAM'],['memory',''],['length','mm']],ram:[['capacity','GB'],['memory',''],['rate','MT/s']],storage:[['capacity','GB'],['format',''],['pcie','']],board:[['socket',''],['memory',''],['format','']],case:[['format',''],['gpuMax','mm para GPU']],power:[['watts','W'],['efficiency','']],cooler:[['format',''],['height','mm']],fan:[['format',''],['connection','']]};
    const bits=(fields[p.category]||[]).filter(([key])=>v[key]!=null).map(([key,unit])=>String(v[key])+(unit?' '+unit:''));
    return bits.length?bits.join(' · '):p.summary;
  }
  const shortName = p => window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : window.FENIXA_SPECS.facts(p).displayName || p.name;
  const refDate = o => { const t = Date.parse(o?.checkedAt); return Number.isFinite(t) ? new Date(t).toLocaleDateString('es-CO',{timeZone:'America/Bogota',day:'numeric',month:'numeric'}).split('/').map(x=>x.padStart(2,'0')).join('/') : ''; };
  const refLabel = o => o ? 'Ref. ' + (refDate(o) || '—') : 'Sin precio';
  const refTitle = o => o ? `${o.status==='listed'?'Precio publicado':market.recent(o)?'Precio consultado':'Consulta vencida'} · COP · ${o.store}` : 'Sin oferta exacta verificada en COP';
  function card(p, offer) {
    const fit=window.FENIXA_MY_BUILD.check(p), inBuild=window.FENIXA_MY_BUILD.ids().includes(p.id);
    return `<article class="market-card fx-card" data-product-id="${p.id}" data-market-category="${p.category}">
      <div class="catalog-product-heading"><span class="market-category">${esc(categoryName(p.category))}${p.imageKind==='category'?' · ilustración de categoría':''}</span><h3 title="${esc(p.name)}">${esc(shortName(p))}</h3></div>
      <button class="catalog-photo fx-open" type="button" data-open-product="${p.id}" aria-label="Ver detalles de ${esc(p.name)}"><img class="product-image" src="${esc(thumb(p.image))}" alt="${esc(p.name)}" width="480" height="360" loading="eager" decoding="async"></button>
      <p class="catalog-brief" title="${esc(brief(p))}">${esc(brief(p))}</p>
      <div class="catalog-price-line"><span class="store-price-summary" title="${esc(refTitle(offer))}"><strong class="market-price">${offer?'Desde '+money(offer.landed):'Precio por confirmar'}</strong>${offer?`<span class="estimate-label"> · ${offer.storeCount} ${offer.storeCount===1?'tienda':'tiendas'}</span>`:''}</span></div>
      <div class="catalog-card-actions"><button class="compare-trigger" type="button" data-compare="${p.id}" aria-pressed="${selected.has(p.id)}">${selected.has(p.id)?'Quitar':'Comparar'}</button><button class="primary-button" type="button" data-add-my-build="${p.id}"><span>${inBuild?'En Mi build ':fit.status==='conflict'?'Revisar conflicto':'Añadir'}</span></button></div>
      <details class="catalog-card-details" hidden><summary>Detalles y fuentes${fit.status==='conflict'?' · conflicto':''}</summary><div class="product-sku">${esc(p.sku)}</div><p>${esc(p.summary)}</p>${p.imageNote?`<small class="catalog-image-note">${esc(p.imageNote)}</small>`:''}<p class="catalog-price-evidence">${esc(offer?`${offer.store} · ${new Date(offer.checkedAt).toLocaleString('es-CO',{timeZone:'America/Bogota'})} · ${offer.status==='listed'?'precio publicado; stock, presentación y condiciones por confirmar':market.recent(offer)?'consultado hace menos de 72 horas':'consulta vencida; precio y stock pueden cambiar'}`:'Precio pendiente: el rango del catálogo no es una oferta.')}</p>${window.FENIXA_FIT_STATUS.render(fit,{hasParts:window.FENIXA_MY_BUILD.ids().some(id=>byId[id].category!==p.category)})}${market.purchase(p,window.FENIXA_MY_BUILD.ids().map(id=>byId[id]).filter(other=>other.category!==p.category))}<div class="product-links">${external(p.source,p.sourceType==='retailer'?'Ficha de la tienda':'Ficha del fabricante')}</div></details>
    </article>`;

  }

  $('partsGrid').innerHTML = categories.map(c => {
    const p = {name:`Ilustración de ${c.name}`,image:`assets/categories/${c.id}.png`};
    const n = products.filter(p => p.category === c.id).length;
    return `<button class="cmp-tile" type="button" data-category="${c.id}">${photo(p,'',true)}<strong>${esc(c.name)}</strong><span>${n} modelo${n === 1 ? '' : 's'}</span></button>`;
  }).join('');
  $('categoryFilter').innerHTML = '<option value="all">Todas las categorías</option>' + categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  $('storeFilter').innerHTML = '<option value="all">Todas las tiendas</option>' + market.stores().map(store => `<option value="${esc(store.id)}">${esc(store.name)}</option>`).join('');
  // Una sola vista en dos niveles; la categoría vive en el hash (#componentes/<id> o #componentes/todo).
  const level = { cat: null };
  const goLevel = cat => { location.hash = cat ? 'componentes/' + cat : 'componentes'; };
  $('partsGrid').addEventListener('click', event => {
    const tile = event.target.closest('[data-category]'); if (!tile) return;
    goLevel(tile.dataset.category);
  });
  $('catalogBack').addEventListener('click', () => goLevel(null));
  const slider = $('catalogPriceSlider');
  const priceCeiling = Math.max(1000000, Math.ceil(Math.max(0,...products.map(p=>catalogOffer(p)?.landed||0))/10000)*10000+10000);
  slider.max = String(priceCeiling);
  function syncPriceControl() {
    const raw = $('catalogMax').value;
    const value = raw === '' ? null : Math.max(0,Number(raw)||0);
    slider.max = String(Math.max(priceCeiling,value===null?0:Math.ceil(value/10000)*10000+10000));
    slider.value = value === null ? slider.max : String(value);
    slider.setAttribute('aria-valuetext',value===null?'Sin límite':money(value));
  }
  syncPriceControl();
  slider.addEventListener('input',()=>{
    $('catalogMax').value = Number(slider.value)>=Number(slider.max)?'':slider.value;
    syncPriceControl(); window.renderProductCatalog();
  });

  const compareTable = document.createElement('div');
  compareTable.className = 'comparison-wrap'; compareTable.id = 'productComparison';
  $('compareTray').after(compareTable);
  function resetCatalogFilters() {
    $('categoryFilter').value = 'all'; $('catalogSearch').value = ''; $('catalogMax').value = ''; $('catalogSort').value = 'featured'; $('storeFilter').value = 'all'; $('pricedOnly').checked = false; syncPriceControl();
  }
  // Búsqueda tolerante (search.js): tildes, espacios en modelos, categoría y errores pequeños.
  const searchIndex = window.FENIXA_SEARCH.index(products, p => window.FENIXA_SPECS.facts(p).displayName || '', categoryName);
  const passesPrice = (p, f) => {
    const offer = catalogOffer(p);
    return (!f.pricedOnly || Boolean(offer && market.recent(offer))) && (offer ? (offer.landed ?? offer.price) <= f.high : !f.needPrice);
  };
  // Explica por qué no hay resultados y ofrece la acción que lo resuelve.
  function explainEmpty(f, matcher) {
    const q = $('catalogSearch').value.trim();
    const inCategory = p => f.category === 'all' || p.category === f.category;
    const label = f.category === 'all' ? '' : categoryName(f.category);
    const parts = [], actions = [];
    if (q && !products.some(p => matcher.test(p))) {
      parts.push(`Ningún modelo coincide con «${esc(q)}». Revisa la ortografía o busca por marca, modelo o categoría (por ejemplo: Ryzen, RTX 4060, Kingston, gabinete).`);
      actions.push(['clear-search', 'Borrar la búsqueda']);
    } else {
      const elsewhere = f.category === 'all' ? 0 : products.filter(p => !inCategory(p) && matcher.test(p) && passesPrice(p, f)).length;
      const withoutPrice = f.needPrice ? products.filter(p => inCategory(p) && matcher.test(p)).length : 0;
      if (elsewhere) { parts.push(`No hay resultados${q ? ` para «${esc(q)}»` : ''} en ${esc(label)}, pero sí ${elsewhere} en otras categorías.`); actions.push(['all-categories', 'Buscar en todas las categorías']); }
      if (withoutPrice) { parts.push(`El filtro de precio o de tienda deja fuera ${withoutPrice} ${withoutPrice === 1 ? 'modelo' : 'modelos'}: con ese filtro solo se muestran piezas con un precio consultado que lo cumple.`); actions.push(['clear-price', 'Quitar filtros de precio y tienda']); }
      if (!parts.length) { parts.push(`No hay modelos${label ? ` de ${esc(label)}` : ''} con estos filtros.`); actions.push(['clear-all', 'Limpiar filtros']); }
    }
    return `<p>${parts.join(' ')}</p><div class="catalog-empty-actions">${actions.map(([a, t]) => `<button type="button" class="secondary-button" data-empty-action="${a}">${t}</button>`).join('')}</div>`;
  }
  window.renderProductCatalog = () => {
    const high = $('catalogMax').value === '' ? Infinity : Math.max(0,Number($('catalogMax').value)||0);
    const query = $('catalogSearch').value.trim().toLocaleLowerCase('es');
    const category = $('categoryFilter').value;
    const needPrice = $('pricedOnly').checked || $('catalogMax').value !== '' || $('storeFilter').value !== 'all';
    const prices = new Map(products.map(p => [p.id, catalogOffer(p)]));
    const filters = { high, category, needPrice, pricedOnly: $('pricedOnly').checked };
    const matcher = searchIndex($('catalogSearch').value);
    const visible = products.filter(p => passesPrice(p, filters) && (category === 'all' || p.category === category) && matcher.test(p));
    const order = $('catalogSort').value;
    if (order === 'featured') visible.sort((a,b) => (prices.get(b.id)?.storeCount || 0) - (prices.get(a.id)?.storeCount || 0));
    if (order === 'price-asc' || order === 'price-desc') visible.sort((a,b) => {
      const ap=prices.get(a.id)?.landed,bp=prices.get(b.id)?.landed;
      if(ap==null)return bp==null?0:1; if(bp==null)return -1;
      return order==='price-asc'?ap-bp:bp-ap;
    });
    if (order === 'name') visible.sort((a,b)=>a.name.localeCompare(b.name,'es'));
    // Filas completas según las columnas reales (auto-fill de 240 px; 2 en móvil). Si la lista aún está oculta se usa 8 y se recalcula al mostrarse.
    const gridWidth = $('marketGrid').clientWidth, cols = window.innerWidth <= 560 ? 2 : gridWidth ? Math.max(1, Math.floor((gridWidth + 16) / 256)) : 0;
    const size = !cols ? 8 : cols >= 4 ? cols * 2 : cols === 3 ? 9 : cols * 4;
    if (!cols) requestAnimationFrame(() => { if ($('marketGrid').clientWidth) window.renderProductCatalog(); });
    const signature = JSON.stringify([size, $('catalogMax').value, query, category, $('pricedOnly').checked, $('storeFilter').value, order]);
    const page = window.FENIXA_PAGER.paginate('catalog', visible, { anchor: $('marketGrid'), signature, onChange: () => { window.renderProductCatalog(); revealResults(); }, label: 'Páginas de componentes', scrollTarget: $('catalogo'), size });
    $('marketGrid').innerHTML = page.items.map(p=>card(p,prices.get(p.id))).join('');
    $('catalogCount').textContent = `${visible.length} ${visible.length===1?'modelo':'modelos'}`;
    $('catalogEmpty').classList.toggle('show', !visible.length);
    $('catalogEmpty').innerHTML = visible.length ? '' : explainEmpty(filters, matcher);
    // Corrección de la búsqueda visible: el usuario sabe qué se buscó realmente.
    const note = $('catalogSearchNote');
    if (note) {
      note.hidden = !matcher.corrections.length || !visible.length;
      note.textContent = matcher.corrections.length ? `Resultados para «${matcher.corrections.map(([, to]) => to).join(' ')}» (escribiste «${matcher.corrections.map(([from]) => from).join(' ')}»)` : '';
    }
    renderComparison();
  };
  $('catalogEmpty').addEventListener('click', event => {
    const action = event.target.closest('[data-empty-action]')?.dataset.emptyAction;
    if (!action) return;
    if (action === 'all-categories') { goLevel('todo'); return; }
    if (action === 'clear-search') { $('catalogSearch').value = ''; $('catalogSearch').dispatchEvent(new Event('input')); $('catalogSearch').focus(); return; }
    if (action === 'clear-price') { $('catalogMax').value = ''; $('storeFilter').value = 'all'; $('pricedOnly').checked = false; syncPriceControl(); window.renderProductCatalog(); confirmFilter(); return; }
    if (action === 'clear-all') $('clearFilters').click();
  });
  function revealResults() {
    const results = $('marketGrid').children.length ? $('marketGrid') : $('catalogEmpty');
    window.FENIXA_MOTION?.reveal(results);
  }
  function applyLevel() {
    const deep = level.cat !== null;
    $('partsGrid').hidden = deep; $('parts-title').hidden = deep; $('catalogResults').hidden = !deep;
    document.querySelectorAll('#catalogo .cmp-deep').forEach(node => { node.hidden = !deep; });
    $('catalogo').dataset.view = deep ? 'list' : 'grid';
    $('catalogo').dataset.level = level.cat === 'todo' ? 'todo' : 'cat';
    if (deep) $('catalog-title').textContent = level.cat === 'todo' ? 'Resultados' : categoryName(level.cat);
  }
  function syncFromHash(event) {
    if (location.hash === '#catalogo') { const c = $('categoryFilter').value; history.replaceState(null, '', '#componentes/' + (c === 'all' ? 'todo' : c)); }
    const m = /^#componentes\/([\w-]+)$/.exec(location.hash);
    if (!m && location.hash !== '#componentes') return;
    let cat = m ? m[1] : null;
    if (cat !== null && cat !== 'todo' && !categories.some(c => c.id === cat)) { cat = null; history.replaceState(null, '', '#componentes'); }
    const prev = level.cat, typing = document.activeElement === $('catalogSearch');
    if (event?.type === 'hashchange' && typing && prev === cat) return;
    level.cat = cat;
    if (cat === null) { if (prev !== null) resetCatalogFilters(); }
    else $('categoryFilter').value = cat === 'todo' ? 'all' : cat;
    applyLevel(); window.renderProductCatalog();
    if (prev === cat || typing) return;
    if (cat === null) window.FENIXA_MOTION?.reveal($('partsGrid'));
    else revealResults();
    requestAnimationFrame(() => {
      if (!/^#componentes(\/|$)/.test(location.hash) || level.cat !== cat || document.activeElement === $('catalogSearch')) return;
      if (cat === null) ($('partsGrid').querySelector(`[data-category="${prev}"]`) || $('catalogSearch')).focus({ preventScroll: true });
      else $('catalog-title').focus({ preventScroll: true });
      $('componentes').scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  window.FENIXA_BROWSE_CATEGORY = (category, query = '') => {
    if (!categories.some(c => c.id === category)) return;
    resetCatalogFilters();
    if (query) $('catalogSearch').value = query;
    $('categoryFilter').value = category;
    window.renderProductCatalog();
    const target = '#componentes/' + category;
    const reveal = () => {
      if (location.hash !== target) return;
      $('catalog-title').tabIndex = -1;
      $('catalog-title').focus({preventScroll:true});
      $('catalogo').scrollIntoView({block:'start',behavior:'instant'});
    };
    if (location.hash === target) reveal();
    else {
      window.addEventListener('hashchange', () => requestAnimationFrame(reveal), {once:true});
      location.hash = 'componentes/' + category;
    }
  };
  function confirmFilter() {
    window.FENIXA_MOTION?.pulse($('catalogCount'));
    revealResults();
  }
  ['storeFilter','pricedOnly','catalogSort'].forEach(id => $(id).addEventListener('change', () => {
    window.renderProductCatalog();
    confirmFilter();
  }));
  [slider, $('catalogMax')].forEach(input => input.addEventListener('change', confirmFilter));
  window.addEventListener('hashchange', syncFromHash);
  window.addEventListener('fenixa-build-changed', () => {
    const id = document.activeElement?.dataset?.addMyBuild;
    window.renderProductCatalog(true);
    if (id && !productSheet.open) {
      const button = $('marketGrid').querySelector(`[data-add-my-build="${id}"]`);
      button?.focus({ preventScroll: true });
      if (button) button.firstElementChild?.classList.add('fx-added-label');
    }
  });
  window.addEventListener('fenixa-profile-changed', () => window.renderProductCatalog());
  $('catalogMax').addEventListener('input', () => { syncPriceControl(); window.renderProductCatalog(); });
  $('catalogSearch').addEventListener('input', () => {
    for (const result of [$('marketGrid'), $('partsGrid'), $('catalogEmpty')]) result.classList.remove('fx-reveal');
    const query = $('catalogSearch').value.trim();
    if (level.cat === null && query) {
      goLevel('todo');
      syncFromHash();
    }
    else if (level.cat === 'todo' && !query) { history.replaceState(null, '', '#componentes'); syncFromHash(); }
    else window.renderProductCatalog();
  });
  $('categoryFilter').addEventListener('change', () => goLevel($('categoryFilter').value === 'all' ? 'todo' : $('categoryFilter').value));
  // «Más filtros» se cierra con Escape (devolviendo el foco) o al pulsar fuera.
  const moreFilters = ['catalogMore','buildMore','laptopMore'].map($).filter(Boolean);
  moreFilters.forEach(more => more.addEventListener('keydown', event => { if (event.key === 'Escape' && more.open) { event.preventDefault(); more.open = false; more.querySelector('summary').focus(); } }));
  document.addEventListener('click', event => moreFilters.forEach(more => { if (more.open && !more.contains(event.target)) more.open = false; }));
  $('clearFilters').addEventListener('click', () => { resetCatalogFilters(); if (level.cat && level.cat !== 'todo') $('categoryFilter').value = level.cat; window.renderProductCatalog(); confirmFilter(); });
  function renderComparison() {
    $('compareTray').hidden = !selected.size;
    const count = `${selected.size}/4`;
    if ($('compareTrayCount').textContent !== count && selected.size) window.FENIXA_MOTION?.pulse($('compareTrayCount'));
    $('compareTrayCount').textContent = count;
    $('compareList').innerHTML = [...selected].map(id => `<div class="comparison-dock-item"><img src="${esc(thumb(byId[id].image))}" alt="" width="56" height="56"><span title="${esc(byId[id].name)}">${esc(shortName(byId[id]))}</span><button type="button" class="dock-remove" data-remove-compare="${esc(id)}" aria-label="Quitar ${esc(shortName(byId[id]))} de comparaciones">×</button></div>`).join('');
    $('compareTrayMessage').textContent = selected.size < 2 ? 'Elige otra pieza de la misma categoría. No se añade nada a Mi build.' : 'Tu build no cambia hasta que confirmes añadir o reemplazar una pieza.';
    $('openRealComparison').disabled = selected.size < 2;
    if (!selected.size) { $('compareTrayBody').hidden=true; $('compareTrayToggle').setAttribute('aria-expanded','false'); }
    document.querySelectorAll('[data-compare]').forEach(button => { const on = selected.has(button.dataset.compare); button.setAttribute('aria-pressed', String(on)); button.textContent = on ? 'Quitar' : 'Comparar'; button.closest('article').classList.toggle('selected', on); });
  }
  $('compareTrayToggle').addEventListener('click',()=>{
    const expanded=$('compareTrayBody').hidden;
    $('compareTrayBody').hidden=!expanded;
    $('compareTrayToggle').setAttribute('aria-expanded',String(expanded));
  });
  $('compareTray').addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();$('compareTrayBody').hidden=true;$('compareTrayToggle').setAttribute('aria-expanded','false');$('compareTrayToggle').focus();}
  });
  $('compareList').addEventListener('click',event=>{
    const button=event.target.closest('[data-remove-compare]');if(!button)return;
    selected.delete(button.dataset.removeCompare);renderComparison();
    if(selected.size)$('compareTrayToggle').focus();else document.querySelector('[data-compare]')?.focus({preventScroll:true});
  });
  $('openRealComparison').addEventListener('click',()=>{if(selected.size>=2){$('compareTrayBody').hidden=true;$('compareTrayToggle').setAttribute('aria-expanded','false');$('compareTrayToggle').focus();window.FENIXA_COMPARE.openMany([...selected]);}});
  $('marketGrid').addEventListener('click', event => {
    const b = event.target.closest('[data-compare]'); if (!b) return;
    const id = b.dataset.compare;
    if (selected.has(id)) selected.delete(id);
    else if (selected.size >= 4) return showToast('Puedes comparar hasta 4 piezas. Quita una para elegir otra.');
    else if (selected.size && byId[[...selected][0]].category !== byId[id].category) return showToast('Elige piezas de la misma categoría para compararlas.');
    else selected.add(id);
    renderComparison();
    b.classList.toggle('fx-mark', selected.has(id));
  });
  // Ficha emergente de componente: toda la tarjeta abre los detalles.
  const productSheet = document.createElement('dialog');
  productSheet.className = 'fx-sheet product-sheet'; productSheet.id = 'productSheet';
  productSheet.setAttribute('aria-labelledby', 'productSheetTitle');
  document.body.append(productSheet);
  let sheetOpener = null, sheetId = null;
  function renderProductSheet(id) {
    const p = byId[id]; if (!p) return;
    const inBuild = window.FENIXA_MY_BUILD.ids().includes(p.id), fit = window.FENIXA_MY_BUILD.check(p);
    const reference = window.FENIXA_SPECS.facts(p);
    // Reuse the public comparison schema for its labels and units; show only known facts or an explicit "No aplica".
    const priority = {cpu:['socket','cores','threads','memory','graphics','boost','tdp','basePower'],gpu:['chip','vram','memory','length','connectors','recommendedPsu','power','outputs'],ram:['capacity','memory','rate','modules','format','cl','voltage','profiles'],storage:['capacity','placement','format','pcie','read','write','tbw'],board:['socket','memory','format','slots','maxRam','m2Slots','chipset','dimensions'],power:['watts','format','connectors','efficiency','length','dimensions','protections','warrantyYears'],case:['format','gpuMax','coolerMax','width','height','depth','clearanceNotes'],cooler:['format','sockets','height','rpm','noise'],fan:['format','connection','rpm','airflow','pressure','noise'],setup:['format','connection','width','height','weight']}[p.category] || [];
    const known = value => value != null && value !== '' && (typeof value !== 'number' || Number.isFinite(value));
    const fields = reference.verified ? (window.FENIXA_SPECS.compareMany([p,p])?.rows || []).filter(field => known(reference.values[field.key]) || reference.notApplicable?.[field.key]).sort((a,b) => (priority.includes(a.key)?priority.indexOf(a.key):priority.length) - (priority.includes(b.key)?priority.indexOf(b.key):priority.length)) : [];
    const number = new Intl.NumberFormat('es-CO', { useGrouping: 'always', maximumFractionDigits: 2 });
    const valueText = value => Array.isArray(value) ? value.join(' · ') : typeof value === 'number' ? number.format(value) : String(value);
    const cell = field => known(reference.values[field.key])
      ? `${esc(valueText(reference.values[field.key]))}${field.unit?' '+esc(field.unit):''}`
      : `<span title="${esc(reference.notApplicable[field.key])}">No aplica</span>`;
    const specs = fields.length
      ? `<section class="product-sheet-key" aria-labelledby="productSheetKey"><h3 id="productSheetKey">Datos clave</h3><table class="product-sheet-table"><tbody>${fields.map(field => `<tr><th scope="row">${esc(field.label)}</th><td>${cell(field)}</td></tr>`).join('')}</tbody></table></section>`
      : '<p class="catalog-brief">Sin especificaciones verificadas para esta referencia.</p>';
    const sources = new Map();
    const addSource = (url, label) => { if (url && !sources.has(url)) sources.set(url,label); };
    addSource(reference.source, reference.verified?'Fuente de especificaciones':'Fuente de la referencia');
    fields.forEach(field => addSource(reference.fieldSources?.[field.key]?.source, 'Fuente · '+field.label));
    (reference.additionalSources || []).forEach(source => addSource(source.source, source.label || 'Fuente adicional'));
    addSource(p.source, p.sourceType==='retailer'?'Ficha de la tienda':'Ficha del fabricante');
    const purchase = document.createElement('div');
    purchase.innerHTML = market.purchase(p,window.FENIXA_MY_BUILD.ids().map(id=>byId[id]).filter(other=>other.category!==p.category),{includeStores:false});
    purchase.querySelectorAll('.fit-status').forEach(node => node.remove());
    // The sheet owns one disclosure; the purchase view already supplies its content.
    purchase.querySelectorAll('details').forEach(node => { node.querySelector(':scope > summary')?.remove(); node.replaceWith(...node.childNodes); });
    const purchaseContent = purchase.querySelector('.store-offers')?.innerHTML || purchase.innerHTML;
    const status = [reference.identityConflict?'Identidad por confirmar':'',fit.status==='conflict'?fit.label:fit.matched?'Coincidencias encontradas':'Faltan datos de compatibilidad'].filter(Boolean).join(' · ');
    const offer = catalogOffer(p,'all',false);
    const warning = reference.warning || (reference.identityConflict ? 'Confirma el modelo y la referencia exacta antes de comprar.' : '');
    const notes = [...new Set([/^Consulta las especificaciones y variantes/.test(p.summary||'')?'':p.summary,warning,reference.scope].filter(Boolean))];
    productSheet.innerHTML = `<div class="fx-sheet-top"><span>${esc(categoryName(p.category))}</span><button type="button" class="fx-sheet-close" data-close-product aria-label="Cerrar detalles">Cerrar</button></div>
      <div class="product-sheet-main"><figure class="product-sheet-photo"><img src="${esc(p.image)}" alt="${esc(p.name)}" width="480" height="360" decoding="async"></figure>
      <div class="product-sheet-info"><h2 id="productSheetTitle" title="${esc(p.name)}">${esc(shortName(p))}</h2><p class="catalog-brief">${esc(status)}</p><p class="product-sheet-price"><span class="store-price-summary"><strong class="market-price">${offer?'Desde '+money(offer.landed):'Precio por confirmar'}</strong>${offer?`<span class="estimate-label"> · ${offer.storeCount} ${offer.storeCount===1?'tienda':'tiendas'}</span>`:''}</span></p>
      <div class="catalog-card-actions"><button class="compare-trigger" type="button" data-sheet-compare="${p.id}" aria-pressed="${selected.has(p.id)}">${selected.has(p.id)?'Quitar de comparación':'Comparar'}</button><button class="primary-button" type="button" data-add-my-build="${p.id}">${inBuild?'Ya está en Mi build':fit.status==='conflict'?'Revisar conflicto':'Añadir a Mi build'}</button></div></div></div>
      <div class="product-sheet-details">${warning?`<p class="product-sheet-warning" role="note" title="${esc(warning)}">${esc(warning)}</p>`:''}${market.storeList?.(p)||''}${specs}<details class="store-options"><summary>Fuentes y notas</summary><div class="store-offers"><div class="product-sku">${esc(p.sku)}</div>${notes.map(note=>`<p>${esc(note)}</p>`).join('')}${p.imageNote?`<small class="catalog-image-note">${esc(p.imageNote)}</small>`:''}<p>${esc(fit.reason || 'Añade otras piezas para revisar los datos disponibles.')}</p><p class="fit-status-limit">La revisión es parcial: no certifica el montaje completo.</p><div class="product-links">${[...sources].map(([url,label])=>external(url,esc(label))).join('')}</div>${purchaseContent}</div></details></div>`;
  }
  function openProductSheet(id, from) {
    sheetId = id; sheetOpener = from || document.activeElement;
    renderProductSheet(id);
    if (!productSheet.open) productSheet.showModal();
    productSheet.querySelector('[data-close-product]').focus({ preventScroll: true });
  }
  productSheet.addEventListener('click', event => {
    if (event.target === productSheet || event.target.closest('[data-close-product]')) { productSheet.close(); return; }
    const cmp = event.target.closest('[data-sheet-compare]');
    if (cmp) {
      $('marketGrid').querySelector(`[data-compare="${cmp.dataset.sheetCompare}"]`)?.click();
      const on = selected.has(sheetId);
      cmp.setAttribute('aria-pressed', String(on));
      cmp.textContent = on ? 'Quitar de comparación' : 'Comparar';
    }
  });
  productSheet.addEventListener('close', () => {
    if (productSheet.open) return;
    const card = sheetOpener?.isConnected ? sheetOpener : $('marketGrid').querySelector(`[data-open-product="${sheetId}"]`);
    if (location.hash.startsWith('#componentes')) card?.focus?.({ preventScroll: true }); sheetOpener = null; sheetId = null;
  });
  window.addEventListener('fenixa-build-changed', () => {
    if (!productSheet.open || !sheetId) return;
    const adding = document.activeElement?.matches('[data-add-my-build]');
    renderProductSheet(sheetId);
    if (adding) productSheet.querySelector('[data-add-my-build]')?.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => { if (productSheet.open) productSheet.close(); });
  $('marketGrid').addEventListener('click', event => {
    const opener = event.target.closest('[data-open-product]');
    if (opener) { openProductSheet(opener.dataset.openProduct, opener); return; }
    if (event.target.closest('button, a, input, select, label, details')) return;
    const cardEl = event.target.closest('.market-card[data-product-id]');
    if (cardEl) openProductSheet(cardEl.dataset.productId, cardEl.querySelector('[data-open-product]'));
  });
  $('clearCompare').addEventListener('click', () => { selected.clear(); renderComparison(); document.querySelector('[data-compare]')?.focus({preventScroll:true}); });
  const budgetBar=document.createElement('div');
  budgetBar.className='build-budget-bar';
  budgetBar.innerHTML='<label class="cmp-field">Presupuesto objetivo hasta (COP)<select id="buildMaxPrice"><option value="">Todos los presupuestos</option>'+window.FENIXA_BUILD_DISCOVERY.amounts.map(value=>'<option value="'+esc(value)+'">'+esc(money(value))+'</option>').join('')+'</select></label><label class="market-check build-quoted-check"><input type="checkbox" id="buildQuotedOnly"> Solo cotizadas</label><span id="buildResults" role="status"></span>';
  $('buildMore').querySelector('.cmp-more-body').append(budgetBar);
  $('buildMaxPrice').addEventListener('change',renderGallery);
  $('buildQuotedOnly').addEventListener('change',renderGallery);
  window.addEventListener('fenixa-find-builds', event => {
    const {use,max}=event.detail;
    activeUse=['estudio','gaming','creativo','trabajo'].includes(use)?use:'all';
    if(Number.isSafeInteger(max)&&max>0&&!Array.from($('buildMaxPrice').options).some(o=>o.value===String(max))){
      const option=document.createElement('option');option.value=String(max);option.textContent=money(max)+' · objetivo anterior';$('buildMaxPrice').append(option);
    }
    $('buildMaxPrice').value=String(max);$('buildSearch').value='';renderGallery();
  });
  const buildTotal = b => {
    return window.FENIXA_BUILD_DISCOVERY.total(b,id=>market.price(byId[id]));
  };
  const buildPrice = b => { const t=buildTotal(b); return t.count ? `${t.complete?'Subtotal':'Subtotal parcial'}: ${money(t.sum)}` : 'Precio por confirmar'; };
  function coverLabel(part) {
    const name = shortName(part);
    if (part.category === 'ram') {
      const { capacity, memory } = window.FENIXA_SPECS.facts(part).values || {};
      if (capacity && memory) return `${capacity} GB ${memory}`;
    }
    if (part.category === 'gpu') {
      return name.match(/\b(?:RTX|GTX|RX)\s*\d{3,4}(?:\s*(?:Ti|SUPER|XTX|XT|LP))*/i)?.[0] || name;
    }
    return name.replace(/^(AMD|Intel)\s+/i, '');
  }

  function coverImage(part, className) {
    if (!part?.image || part.imageKind === 'category') return '';
    const file = window.FENIXA_BUILD_COVERS?.[part.image];
    const src = file ? 'assets/thumbs/build-covers/' + file : thumb(part.image);
    return `<img class="${className}" src="${esc(src)}" alt="${esc(part.name)}" decoding="async">`;
  }

  function buildPhoto(build, overview) {
    const cabinet = byId[build.caseId];
    const cpu = byId[overview.find(p => p.category === 'cpu')?.id];
    const gpu = byId[overview.find(p => p.category === 'gpu')?.id];
    const ram = byId[overview.find(p => p.category === 'ram')?.id];
    const featured = [cpu, gpu || ram].filter(Boolean);
    const captions = featured.map(part => `<span class="build-cover-part" title="${esc(shortName(part))}">
      ${coverImage(part, 'build-part-thumb')}<span class="build-cover-label">${esc(coverLabel(part))}</span>
    </span>`).join('');
    const description = [cabinet, ...featured].filter(Boolean).map(p => categoryName(p.category) + ' ' + shortName(p)).join(', ');
    return `<button class="catalog-photo build-photo-button fx-open" type="button" data-open-build="${esc(build.id)}"
      aria-label="Ver detalles de ${esc(build.name)}" aria-description="${esc(description)}">
      ${coverImage(cabinet, 'build-cover-case')}<span class="build-cover-parts">${captions}</span>
    </button>`;
  }
  // Referencia total: misma suma que Armar mi PC y Mi build (FENIXA_AUTO_BUILD.reference); «Sin precio» si falta alguna.
  const buildRef = b => {
    const ref = window.FENIXA_AUTO_BUILD?.reference, refs = ref ? b.parts.map(id => byId[id] && ref(byId[id])) : [];
    if (!ref || !refs.length || refs.some(r => !r)) return '<span class="estimate-label">Sin precio</span>';
    const low = refs.reduce((s, r) => s + r.low, 0), high = refs.reduce((s, r) => s + r.high, 0);
    return `<strong class="market-price build-estimate">Ref. ${esc(low === high ? money(low) : money(low) + ' – ' + money(high))}</strong>`;
  };
  function toggleSaved(id) {
    const next = new Set(saved); next.has(id) ? next.delete(id) : next.add(id);
    try { localStorage.setItem('fenixa-saved-builds', JSON.stringify([...next])); saved = next; window.dispatchEvent(new Event('fenixa-favorites-changed')); } catch { showToast('No se pudo guardar en este navegador.'); return false; }
    return true;
  }
  function renderGallery() {
    const limit=$('buildMaxPrice').value;
    const quotedOnly=$('buildQuotedOnly').checked;
    const query=$('buildSearch').value.trim().toLocaleLowerCase('es');
    const visible = completeBuilds.filter(b => window.FENIXA_BUILD_DISCOVERY.matches(b,{use:activeUse,limit,quotedOnly,saved},buildTotal(b))&&`${b.name} ${b.parts.map(id=>byId[id]?.name||'').join(' ')}`.toLocaleLowerCase('es').includes(query));
    const sort = $('buildSort').value;
    if (sort === 'featured') visible.sort((a,b)=>Number(Boolean(b.targetBudget))-Number(Boolean(a.targetBudget))||(a.targetBudget||Infinity)-(b.targetBudget||Infinity));
    if (sort === 'price-asc') visible.sort((a,b)=>(a.targetBudget??Infinity)-(b.targetBudget??Infinity));
    if (sort === 'price-desc') visible.sort((a,b)=>(b.targetBudget??-Infinity)-(a.targetBudget??-Infinity));
    const signature = JSON.stringify([activeUse, limit, quotedOnly, sort, query]);
    const page = window.FENIXA_PAGER.paginate('builds', visible, { anchor: $('buildGallery'), signature, onChange: renderGallery, label: 'Páginas de builds', scrollTarget: $('builds') });
    const shortPart = p => p.label === 'Gráfica' && /sin gráfica dedicada/i.test(p.name) ? 'Gráficos integrados' : byId[p.id] ? shortName(byId[p.id]) : p.name;
    $('buildGallery').innerHTML = page.items.map(b => {
      const parts = window.FENIXA_BUILD_DISCOVERY.overview(b);
      const facts = parts.filter(p => p.category === 'cpu' || p.category === 'gpu').map(shortPart).join(' · ');
      return `<article class="build-card fx-card" data-open-build="${esc(b.id)}"><div class="catalog-product-heading"><h3 title="${esc(b.name)}">${esc(shortName(b))}</h3></div>${buildPhoto(b, parts)}<p class="catalog-brief" title="${esc(facts)}">${esc(facts)}</p><div class="catalog-price-line build-ref-line">${buildRef(b)}<span class="estimate-label">${b.targetBudget?'Objetivo '+esc(money(b.targetBudget)):'Sin objetivo asignado'}</span></div><div class="catalog-card-actions"><button class="secondary-button" type="button" data-save-build="${esc(b.id)}" aria-pressed="${saved.has(b.id)}">${saved.has(b.id)?'Guardada':'Guardar'}</button><button class="primary-button" type="button" data-open-build="${esc(b.id)}">Ver detalles</button></div></article>`;
    }).join('');
    $('buildResults').textContent=visible.length+(visible.length===1?' propuesta':' propuestas')+' · presupuesto objetivo, no precio de venta'+(limit&&visible.some(b=>!b.targetBudget)?' · las originales sin objetivo se conservan visibles':'');
    $('buildCount').textContent=visible.length+(visible.length===1?' modelo':' modelos');
    $('buildsEmpty').hidden = visible.length > 0;
    $('buildsEmpty').textContent = activeUse==='saved' ? 'Todavía no tienes builds guardadas. Abre una propuesta y pulsa Guardar build original.' : quotedOnly ? 'No hay cotizaciones completas y recientes con estos filtros. Desmarca Solo cotizadas para explorar propuestas con precios pendientes.' : 'No hay propuestas para estos filtros. Amplía el presupuesto objetivo o cambia de uso.';
    document.querySelectorAll('[data-build-use]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.buildUse === activeUse)));
    if(!visible.length) {
      const clear=document.createElement('button');clear.type='button';clear.className='secondary-button';clear.textContent='Ver todas las propuestas';
      clear.addEventListener('click',()=>{activeUse='all';$('buildMaxPrice').value='';$('buildQuotedOnly').checked=false;$('buildSearch').value='';renderGallery();document.querySelector('[data-build-use="all"]').focus();});
      $('buildsEmpty').append(document.createTextNode(' '),clear);
    }
  }
  document.querySelectorAll('[data-build-use]').forEach(b => b.addEventListener('click', () => { activeUse = b.dataset.buildUse; renderGallery(); }));
  $('buildSort').addEventListener('change', renderGallery);
  $('buildSearch').addEventListener('input', renderGallery);
  const dialog = document.createElement('dialog'); dialog.className = 'build-dialog'; dialog.id = 'buildDialog'; dialog.setAttribute('aria-labelledby', 'detailTitle'); document.body.append(dialog);
  function renderDetail(original) {
    const build = window.FENIXA_BUILD_EDITOR.get(original.id);
    const caseProduct = byId[build.caseId];
    dialog.innerHTML = `<div class="build-dialog-top"><span>FENIXA / Builds completas</span><button type="button" data-close-build aria-label="Cerrar detalle de build">Cerrar</button></div><div class="build-detail-hero"><figure class="detail-photo">${photo(caseProduct, '', false)}<figcaption>Imagen publicada del gabinete ${esc(caseProduct.name)}. La configuración propuesta corresponde a la lista de piezas.</figcaption></figure><div class="detail-intro"><div class="eyebrow">CONFIGURACIÓN DE REFERENCIA</div><h2 id="detailTitle">${esc(build.name)}</h2><p>${esc(build.description)}</p><div class="build-tags">${build.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div><div class="build-estimate">${buildPrice(build)}</div><div class="estimate-label">${buildTotal(build).count}/${build.parts.length} piezas con precio · COP · sin envío ni ensamblaje</div><div class="detail-actions"><button type="button" class="primary-button" data-copy-my-build="${build.id}">Usar selección en Mi build</button><button type="button" class="primary-button" id="saveBuild" aria-pressed="${saved.has(build.id)}">${saved.has(build.id) ? 'Build guardada ' : 'Guardar build original'}</button><button type="button" class="secondary-button" id="shareBuild">Copiar enlace original</button></div><input id="buildShareUrl" class="share-field" aria-label="Enlace para compartir esta build" readonly hidden></div></div><div class="detail-body"><section class="build-customization" aria-label="Personalizar build"><strong>${build.modified ? 'Tu variante · piezas modificadas' : 'Personaliza esta build'}</strong><p>Abre «Personalizar pieza» para filtrar y cambiar cada componente. El subtotal y las advertencias se recalculan; no todos los cambios son compatibles.</p><p class="build-editor-status" role="status">${build.modified ? 'Hay cambios en esta pestaña.' : 'Estás viendo las piezas originales.'} Los cambios se conservan al navegar, pero se pierden al recargar. Guardar y copiar enlace se refieren a la build original.</p><button type="button" class="secondary-button" data-reset-build ${build.modified ? '' : 'disabled'}>Restaurar piezas originales</button></section><div class="detail-tabs" role="tablist" aria-label="Detalle de build"><button type="button" role="tab" id="partsTab" data-detail-tab="parts" aria-controls="detailParts" aria-selected="true">Piezas y compra</button><button type="button" role="tab" id="checksTab" data-detail-tab="checks" aria-controls="detailChecks" aria-selected="false" tabindex="-1">Qué revisar</button></div><div role="tabpanel" id="detailParts" aria-labelledby="partsTab">${market.plan(build.parts,byId)}<div class="detail-subheading"><span>${build.parts.length} componentes · modelos exactos</span><span>Precio y stock: consultar en la tienda</span></div>${build.parts.map((id, index) => { const p = byId[id]; return `<article class="build-part"><div class="build-part-identity"><figure class="build-part-photo">${photo(p)}</figure><div class="build-part-copy"><span class="build-part-category">${esc(categoryName(p.category))}</span><h3 title="${esc(p.name)}">${esc(shortName(p))}</h3><p>${esc(p.summary)}</p><div class="product-sku">${esc(p.sku)}</div>${external(p.source,p.sourceType==='retailer'?'Ficha de tienda':'Ficha del fabricante')}</div><div class="build-part-price"><strong>${market.price(p)===null?'Precio por confirmar':money(market.price(p))}</strong><small class="estimate-label" title="${market.price(p)===null?'Sin oferta reciente disponible en COP':'Oferta reciente · COP · '+esc(market.fixed(p).store)}">${market.price(p)===null?'Sin precio':esc(refLabel(market.fixed(p)))}</small></div></div><div class="build-part-purchase">${replacementControl(build.id,index)}${market.purchase(p,build.parts.map(id=>byId[id]))}</div></article>`; }).join('')}<p class="catalog-footnote">Cada tienda conserva sus condiciones. La disponibilidad corresponde al momento de consulta; confirma modelo exacto, presentación, envío e impuestos antes de pagar.</p></div><div role="tabpanel" id="detailChecks" aria-labelledby="checksTab" hidden><div class="build-notes"><h3>Revisa la configuración actual</h3><p>Revisa las piezas de esta lista y confirma BIOS, memoria, dimensiones, conectores y refrigeración antes de comprar. Coincidir en plataforma no garantiza compatibilidad completa.</p><p>Las siguientes notas pertenecen a la propuesta original; si cambias piezas, consulta las fichas de los nuevos modelos.</p><ul>${build.notes.map(n => `<li>${esc(n)}</li>`).join('')}<li>Revisa los conectores y el espacio de la gráfica, la fuente y la refrigeración en los manuales de los modelos exactos.</li><li>El subtotal usa las ofertas consultadas y puede estar incompleto. Esta configuración no representa un montaje físico probado ni incluye mediciones de FPS.</li></ul><button class="secondary-button" type="button" data-detail-tab="parts">Volver a elegir piezas </button></div></div></div>`;
    if(build.targetBudget){const info=document.createElement('p');info.className='build-target';info.textContent='Objetivo '+money(build.targetBudget)+' · no es una cotización'+(build.modified?' · corresponde a la propuesta original':'');dialog.querySelector('.detail-intro').prepend(info);}
    if(build.sources?.length){const links=document.createElement('div');links.className='product-links';links.innerHTML=build.sources.map(s=>external(s.url,esc(s.label))).join('');dialog.querySelector('.build-notes').append(links);}
    $('saveBuild').addEventListener('click', () => {
      if (!toggleSaved(build.id)) return;
      $('saveBuild').textContent = saved.has(build.id) ? 'Build guardada ' : 'Guardar build original'; $('saveBuild').setAttribute('aria-pressed', String(saved.has(build.id))); renderGallery(); window.FENIXA_MOTION?.pulse($('saveBuild'));
    });
    $('shareBuild').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); $('shareBuild').textContent = 'Enlace copiado '; } catch { $('buildShareUrl').hidden = false; $('buildShareUrl').value = location.href; $('buildShareUrl').select(); }
    });

  }
  function replacementControl(buildId, index) {
    const editor = window.FENIXA_BUILD_EDITOR, build = editor.get(buildId);
    const filter = partFilters.get(buildId+':'+index) || {max:'',hideConflicts:true,matchesOnly:false};
    const choices = editor.candidates(buildId,index,filter);
    const current = byId[build.parts[index]];
    const fit = window.FENIXA_FIT.check(current,build.parts.map(id=>byId[id]));
    const options = choices.some(c=>c.product.id===current.id) ? choices : [{product:current,fit,price:market.price(current)},...choices];
    const suggested = choices.filter(c=>c.fit.matched && c.product.id!==current.id && c.price!==null).slice(0,3);
    return `${window.FENIXA_FIT_STATUS.render(fit,{context:'Esta configuración',hasParts:build.parts.length>1})}${current.platform?`<div class="build-part-platform-source">${external(current.platform.source,'Fuente de plataforma')}</div>`:''}
    <details class="replace-part" data-part-editor="${index}"><summary>Personalizar pieza <span>${choices.length} opciones</span></summary><div class="replace-part-content">
      <div class="part-budget-field"><label for="partBudget${index}">Máximo para esta pieza (COP)</label><div class="part-budget-controls">
        <input id="partBudget${index}" type="number" min="0" step="1000" inputmode="numeric" placeholder="Sin límite" value="${esc(filter.max)}" data-part-filter="max" data-slot="${index}">
        <button type="button" class="secondary-button" data-apply-budget="${index}">Aplicar presupuesto</button>
      </div></div>
      <fieldset class="part-filter-options"><legend class="sr-only">Filtros de alternativas</legend>
        <label class="part-check"><input type="checkbox" data-part-filter="hideConflicts" data-slot="${index}" ${filter.hideConflicts?'checked':''}> Ocultar conflictos detectados</label>
        <label class="part-check"><input type="checkbox" data-part-filter="matchesOnly" data-slot="${index}" ${filter.matchesOnly?'checked':''}> Solo coincidencias de plataforma</label>
      </fieldset>
      <small id="partOptionsHelp${index}">${choices.length} opciones en el filtro. Con presupuesto se excluyen precios no confirmados. La selección actual se conserva aunque quede fuera.</small>
      <div class="part-replacement-field"><label for="replacePart${index}">Cambiar esta pieza</label><select id="replacePart${index}" data-replace-part="${index}" aria-describedby="partOptionsHelp${index} partCurrentChoice${index}" title="${esc(current.name)}">${options.map(({product:p,fit,price}) => `<option value="${esc(p.id)}" title="${esc(p.name)}" ${p.id===current.id?'selected':''}>${esc(shortName(p))} · ${price===null?'Sin precio reciente':money(price)} · ${fit.status==='conflict'?'CONFLICTO':fit.matched?'Coincide plataforma · revisar BIOS':'Faltan datos'}${p.id===current.id?' · Actual':''}</option>`).join('')}</select><small id="partCurrentChoice${index}">Selección actual: ${esc(shortName(current))} · ${market.price(current)===null?'Sin precio reciente':money(market.price(current))} · ${esc(fit.label)}</small></div>
      <details class="part-suggestions" data-part-suggestions="${index}"><summary>Ver alternativas con coincidencias</summary><div class="part-suggestions-content"><p>Menor precio primero</p>${suggested.length?suggested.map(({product:p,fit,price})=>`<div><button type="button" class="secondary-button" data-suggest-part="${esc(p.id)}" data-slot="${index}">Elegir ${esc(shortName(p))} · ${money(price)}</button><small>${esc(fit.reason)}</small></div>`).join(''):'<p>No hay alternativas con coincidencias comprobadas y precio reciente en este rango. Puedes ampliar el presupuesto o revisar los modelos con datos pendientes.</p>'}<small>Coincidir en socket o memoria no confirma todo el montaje. No es una clasificación de rendimiento.</small></div></details>
    </div></details>`;
  }
  function refreshDraft(index) {
    const scroll = dialog.scrollTop;
    const openEditors = [...dialog.querySelectorAll('[data-part-editor][open]')].map(node=>node.dataset.partEditor);
    const openSuggestions = [...dialog.querySelectorAll('[data-part-suggestions][open]')].map(node=>node.dataset.partSuggestions);
    const openDisclosures = ['.fit-status','.store-options','.shopping-plan-details','.shopping-compatibility'].flatMap(selector=>[...dialog.querySelectorAll(`${selector}[open]`)].map(node=>({selector,position:[...dialog.querySelectorAll(selector)].indexOf(node)})));
    renderDetail(completeBuilds.find(b => b.id === activeBuild));
    openEditors.forEach(slot=>{ const editor=dialog.querySelector(`[data-part-editor="${slot}"]`); if(editor) editor.open=true; });
    openSuggestions.forEach(slot=>{ const suggestions=dialog.querySelector(`[data-part-suggestions="${slot}"]`); if(suggestions) suggestions.open=true; });
    openDisclosures.forEach(({selector,position})=>{ const disclosure=dialog.querySelectorAll(selector)[position]; if(disclosure) disclosure.open=true; });
    dialog.scrollTop = scroll;
    if (Number.isInteger(index)) $(`replacePart${index}`)?.focus({preventScroll:true});
    else dialog.querySelector('[data-reset-build]')?.focus({preventScroll:true});
  }
  dialog.addEventListener('change', event => {
    const filterInput = event.target.closest('[data-part-filter]');
    if (filterInput) {
      const index = Number(filterInput.dataset.slot), key = activeBuild+':'+index;
      const filter = {...(partFilters.get(key)||{max:'',hideConflicts:true,matchesOnly:false})};
      filter[filterInput.dataset.partFilter] = filterInput.type==='checkbox' ? filterInput.checked : filterInput.value;
      partFilters.set(key,filter);
      const identity = filterInput.dataset.partFilter;
      refreshDraft(index);
      dialog.querySelector(`[data-part-filter="${identity}"][data-slot="${index}"]`)?.focus({preventScroll:true});
      return;
    }
    const select = event.target.closest('[data-replace-part]');
    if (!select) return;
    const index = Number(select.dataset.replacePart);
    if (window.FENIXA_BUILD_EDITOR.replace(activeBuild,index,select.value)) refreshDraft(index);
  });
  function activateDetailTab(name) {
    dialog.querySelectorAll('[data-detail-tab]').forEach(t => { const active = t.dataset.detailTab === name; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; });
    $('detailParts').hidden = name !== 'parts'; $('detailChecks').hidden = name !== 'checks';
  }
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-close-build]')) { location.hash = 'builds'; return; }
    const budgetButton = event.target.closest('[data-apply-budget]');
    if (budgetButton) {
      const index=Number(budgetButton.dataset.applyBudget), key=activeBuild+':'+index;
      partFilters.set(key,{...(partFilters.get(key)||{hideConflicts:true,matchesOnly:false}),max:$(`partBudget${index}`).value});
      refreshDraft(index); return;
    }
    if (event.target.closest('[data-reset-build]')) { window.FENIXA_BUILD_EDITOR.reset(activeBuild); refreshDraft(); return; }
    const suggestion = event.target.closest('[data-suggest-part]');
    if (suggestion) { const index=Number(suggestion.dataset.slot); if(window.FENIXA_BUILD_EDITOR.replace(activeBuild,index,suggestion.dataset.suggestPart)) refreshDraft(index); return; }
    const tab = event.target.closest('[data-detail-tab]'); if (tab) activateDetailTab(tab.dataset.detailTab);
  });
  dialog.addEventListener('keydown', event => {
    if (!event.target.matches('[data-detail-tab]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const name = event.key === 'Home' ? 'parts' : event.key === 'End' ? 'checks' : event.target.dataset.detailTab === 'parts' ? 'checks' : 'parts'; activateDetailTab(name); dialog.querySelector(`[data-detail-tab="${name}"]`).focus();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); location.hash = 'builds'; });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (location.hash.startsWith('#build/')) history.replaceState(null, '', '#builds');
    if (location.hash === '#builds') {
      const target = opener?.isConnected && opener !== document.body ? opener :
        $('buildGallery').querySelector(`button[data-open-build="${activeBuild}"]`);
      target?.focus({ preventScroll: true });
    }
    activeBuild = null;
    opener = null;
  });
  function routeBuild() {
    const id = location.hash.startsWith('#build/') ? location.hash.slice(7) : null;
    const build = completeBuilds.find(b => b.id === id);
    if (build) { if (activeBuild !== build.id) { activeBuild = build.id; renderDetail(build); } if (!dialog.open) { opener ||= document.activeElement; dialog.showModal(); } }
    else if (dialog.open) dialog.close();
  }
  $('buildGallery').addEventListener('click', event => {
    const save=event.target.closest('[data-save-build]');
    if (save) {
      const id = save.dataset.saveBuild;
      if (completeBuilds.some(b => b.id === id) && toggleSaved(id)) {
        renderGallery();
        const button = $('buildGallery').querySelector(`[data-save-build="${id}"]`);
        button?.focus({preventScroll:true});
        window.FENIXA_MOTION?.pulse(button);
      }
      return;
    }
    const button = event.target.closest('[data-open-build]'); if (button) { opener = button.matches('article') ? button.querySelector('button[data-open-build]') : button; location.hash = `build/${button.dataset.openBuild}`; }
  });
  window.addEventListener('hashchange', routeBuild);
  const menu = document.querySelector('.mobile-menu');
  const sidebar = document.querySelector('.sidebar'), scrim = document.querySelector('.menu-scrim');
  let menuOrigin;
  function setMenu(open, restoreFocus = false) {
    if (open) {
      window.FENIXA_MOTION?.prepareScrollLock();
      menuOrigin = { hash: location.hash, top: window.scrollY };
    }
    sidebar.classList.toggle('menu-open', open);
    sidebar.inert = !open && !(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (scrim) scrim.hidden = !open;
    if (restoreFocus) {
      menu.focus({ preventScroll: true });
      if (menuOrigin?.hash === location.hash) window.scrollTo({top:menuOrigin.top,behavior:'instant'});
    }
    if (!open) menuOrigin = null;
  }
  menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => {
    const open = !sidebar.classList.contains('menu-open');
    setMenu(open);
    if (open) sidebar.querySelector('.nav-link')?.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => { if (sidebar.classList.contains('menu-open')) setMenu(false); });
  scrim?.addEventListener('click', () => setMenu(false, true));
  document.querySelectorAll('.nav-link, .brand').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('menu-open')) setMenu(false, true);
  });
  document.addEventListener('focusin', event => {
    if (sidebar.classList.contains('menu-open') && !sidebar.contains(event.target) && event.target !== menu && event.target !== scrim) setMenu(false);
  });
  window.renderProductCatalog(); renderGallery(); routeBuild(); syncFromHash();
  // auto-build.js carga después: al terminar la carga se repinta con las referencias.
  window.addEventListener('load', () => { if (window.FENIXA_AUTO_BUILD?.reference) renderGallery(); }, { once: true });
})();
