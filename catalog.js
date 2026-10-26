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

  const external = (url, label, cls = 'source-link') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
  const photo = (p, cls = '', lazy = true) => `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.name)}" width="480" height="360" ${lazy ? 'loading="lazy"' : ''} decoding="async">${p.imageNote?`<small class="catalog-image-note">${esc(p.imageNote)}</small>`:''}`;
  const selected = new Set();
  let saved;
  try { const value = JSON.parse(localStorage.getItem('fenixa-saved-builds') || '[]'); saved = new Set(Array.isArray(value) ? value.filter(id => completeBuilds.some(b => b.id === id)) : []); } catch { saved = new Set(); }
  let activeUse = 'all';
  let activeBuild = null;
  const partFilters = new Map();
  let opener = null;
  let pageLimit = 24;
  function currentOffer(p) {
    const store = $('storeFilter')?.value || 'all';
    return market.available(p).find(o => store === 'all' || o.storeId === store) || null;
  }
  function catalogOffer(p) {
    const store=$('storeFilter')?.value||'all';
    return store==='all'?market.fixed(p):market.offers(p).filter(o=>o.storeId===store&&(o.status==='in_stock'||(o.status==='listed'&&o.priceVerified===true&&market.recent(o)))&&Number.isFinite(Date.parse(o.checkedAt))&&Date.parse(o.checkedAt)<=Date.now()+3600000).sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt))[0]||null;
  }
  function brief(p) {
    const facts=window.FENIXA_SPECS.facts(p);
    if(!facts.verified)return p.summary;
    const v=facts.values, fields={cpu:[['cores','núcleos'],['threads','hilos'],['socket','']],gpu:[['vram','GB VRAM'],['memory',''],['length','mm']],ram:[['capacity','GB'],['memory',''],['rate','MT/s']],storage:[['capacity','GB'],['format',''],['pcie','']],board:[['socket',''],['memory',''],['format','']],case:[['format',''],['gpuMax','mm para GPU']],power:[['watts','W'],['efficiency','']],cooler:[['format',''],['height','mm']],fan:[['format',''],['connection','']]};
    const bits=(fields[p.category]||[]).filter(([key])=>v[key]!=null).map(([key,unit])=>String(v[key])+(unit?' '+unit:''));
    return bits.length?bits.join(' · '):p.summary;
  }
  function card(p) {
    const offer = catalogOffer(p);
    const fit=window.FENIXA_MY_BUILD.check(p), inBuild=window.FENIXA_MY_BUILD.ids().includes(p.id);
    return `<article class="market-card" data-product-id="${p.id}" data-market-category="${p.category}">
      <div class="catalog-product-heading"><span class="market-category">${esc(categoryName(p.category))}${p.imageKind==='category'?' · ilustración de categoría':''}</span><h3>${esc(p.name)}</h3></div>
      <div class="catalog-photo"><img class="product-image" src="${esc(p.image)}" alt="${esc(p.name)}" width="480" height="360" loading="lazy" decoding="async"></div>
      <p class="catalog-brief" title="${esc(brief(p))}">${esc(brief(p))}</p>
      <div class="catalog-price-line"><strong class="market-price">${offer?money(offer.price):'Precio por confirmar'}</strong><span class="estimate-label">${offer?(offer.status==='listed'?'Precio publicado · COP':market.recent(offer)?'Precio consultado · COP':'Última consulta · COP'):'Sin oferta exacta'}</span></div>
      <div class="catalog-card-actions"><button class="compare-trigger" type="button" data-compare="${p.id}" aria-pressed="${selected.has(p.id)}">${selected.has(p.id)?'Quitar de comparación':'Comparar pieza'}</button><button class="primary-button" type="button" data-add-my-build="${p.id}">${inBuild?'Ya está en Mi build':fit.status==='conflict'?'Revisar conflicto':'Añadir a Mi build'}</button></div>
      <details class="catalog-card-details"><summary>Detalles y fuentes${fit.status==='conflict'?' · conflicto':''}</summary><div class="product-sku">${esc(p.sku)}</div><p>${esc(p.summary)}</p>${p.imageNote?`<small class="catalog-image-note">${esc(p.imageNote)}</small>`:''}<p class="catalog-price-evidence">${esc(offer?`${offer.store} · ${new Date(offer.checkedAt).toLocaleString('es-CO',{timeZone:'America/Bogota'})} · ${offer.status==='listed'?'precio publicado; stock, presentación y condiciones por confirmar':market.recent(offer)?'consultado hace menos de 72 horas':'consulta vencida; precio y stock pueden cambiar'}`:'Precio pendiente: el rango del catálogo no es una oferta.')}</p>${window.FENIXA_FIT_STATUS.render(fit,{hasParts:window.FENIXA_MY_BUILD.ids().some(id=>byId[id].category!==p.category)})}${market.purchase(p,window.FENIXA_MY_BUILD.ids().map(id=>byId[id]).filter(other=>other.category!==p.category))}<div class="product-links">${external(p.source,p.sourceType==='retailer'?'Ficha de la tienda':'Ficha del fabricante')}</div></details>
    </article>`;

  }

  $('partsGrid').innerHTML = categories.map(c => {
    const p = {name:`Ilustración de ${c.name}`,image:`assets/categories/${c.id}.png`};
    return `<button class="part-tile" type="button" data-category="${c.id}" aria-pressed="false">${photo(p,'',false)}<strong>${esc(c.name)}</strong><span>${products.filter(p => p.category === c.id).length} modelo${products.filter(p => p.category === c.id).length === 1 ? '' : 's'}</span></button>`;
  }).join('');
  $('categoryFilter').innerHTML = '<option value="all">Todas las categorías</option>' + categories.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  $('partsGrid').addEventListener('click', event => {
    const tile = event.target.closest('[data-category]'); if (!tile) return;
    $('categoryFilter').value = tile.dataset.category;
    window.renderProductCatalog();
    location.hash = 'componentes';
    $('catalogSearch').focus();
  });
  const searchbar = document.createElement('div');
  searchbar.className = 'catalog-searchbar';
  searchbar.innerHTML = '<label>Buscar modelo o referencia<input id="catalogSearch" type="search" placeholder="Ryzen, RTX 4060, Kingston…"></label><label>Desde (COP)<input id="catalogMin" type="number" min="0" step="10000" inputmode="numeric" placeholder="0"></label><label>Hasta (COP)<input id="catalogMax" type="number" min="0" step="10000" inputmode="numeric" placeholder="Sin límite"></label><label>Ordenar<select id="catalogSort"><option value="featured">Destacados</option><option value="price-asc">Menor precio consultado</option><option value="price-desc">Mayor precio consultado</option><option value="name">Nombre A–Z</option></select></label>';
  $('marketGrid').before(searchbar);
  const storebar = document.createElement('div');
  storebar.className = 'market-filterbar';
  storebar.innerHTML = '<label for="storeFilter">Tiendas consultadas<select id="storeFilter"><option value="all">Todas las tiendas</option><option value="speedlogic">Speed Logic</option><option value="clones">Clones y Periféricos</option></select></label><label class="market-check"><input type="checkbox" id="pricedOnly"> Solo con precio reciente disponible</label><details class="catalog-price-help"><summary>Sobre los precios</summary><p>Importes exactos de ofertas consultadas, no aproximados. Una consulta vencida puede haber cambiado. Tienda y fecha en Detalles y fuentes; no incluye envío.</p></details>';
  searchbar.after(storebar);
  const more = document.createElement('button');
  more.id = 'catalogMore'; more.type = 'button'; more.className = 'secondary-button catalog-more'; more.textContent = 'Mostrar 24 más';
  $('marketGrid').after(more);
  more.addEventListener('click', () => { pageLimit += 24; window.renderProductCatalog(true); });
  $('catalog-title').textContent = 'Modelos para tu build';
  document.querySelector('.catalog-footnote').textContent = 'Sin precios en vivo. Las consultas de más de 72 horas se marcan como vencidas. Búsquedas no equivalen a ofertas. Fotografías de fabricantes y tiendas: derechos de sus titulares; confirma modelo, presentación, impuestos, envío y garantía.';

  const compareTable = document.createElement('div');
  compareTable.className = 'comparison-wrap'; compareTable.id = 'productComparison';
  $('compareTray').after(compareTable);
  function resetCatalogFilters() {
    document.querySelectorAll('[data-price-filter]').forEach(b => b.classList.toggle('active', b.dataset.priceFilter === 'all'));
    $('categoryFilter').value = 'all'; $('catalogSearch').value = ''; $('catalogMin').value = ''; $('catalogMax').value = ''; $('catalogSort').value = 'featured'; $('storeFilter').value = 'all'; $('pricedOnly').checked = false;
  }
  window.renderProductCatalog = (keepPage = false) => {
    if (keepPage !== true) pageLimit = 24;
    const preset = document.querySelector('[data-price-filter].active')?.dataset.priceFilter || 'all';
    const bounds = { all: [0, Infinity], bajo: [0, 500000], medio: [500001, 1200000], alto: [1200001, Infinity] }[preset];
    const low = Math.max(bounds[0], Math.max(0, Number($('catalogMin').value) || 0));
    const high = Math.min(bounds[1], $('catalogMax').value === '' ? Infinity : Number($('catalogMax').value));
    const query = $('catalogSearch').value.trim().toLocaleLowerCase('es');
    const category = $('categoryFilter').value;
    const needPrice = $('pricedOnly').checked || preset !== 'all' || $('catalogMin').value !== '' || $('catalogMax').value !== '' || $('storeFilter').value !== 'all';
    const visible = products.filter(p => {
      const offer = catalogOffer(p);
      return (!$('pricedOnly').checked || Boolean(currentOffer(p))) && low <= high && (offer ? offer.price >= low && offer.price <= high : !needPrice) && (category === 'all' || p.category === category) && `${p.name} ${p.sku} ${p.summary}`.toLocaleLowerCase('es').includes(query);
    });
    const order = $('catalogSort').value;
    if (order === 'featured') visible.sort((a,b) => Number(Boolean(catalogOffer(b))) - Number(Boolean(catalogOffer(a))) || market.available(b).length - market.available(a).length);
    if (order === 'price-asc' || order === 'price-desc') visible.sort((a,b) => {
      const ap=catalogOffer(a)?.price,bp=catalogOffer(b)?.price;
      if(ap==null)return bp==null?0:1; if(bp==null)return -1;
      return order==='price-asc'?ap-bp:bp-ap;
    });
    if (order === 'name') visible.sort((a,b)=>a.name.localeCompare(b.name,'es'));
    $('marketGrid').innerHTML = visible.slice(0,pageLimit).map(card).join('');
    $('catalogMore').hidden = visible.length <= pageLimit;
    $('catalogCount').textContent = `${visible.length} ${visible.length===1?'pieza':'piezas'} · mostrando ${Math.min(visible.length,pageLimit)}`;
    $('catalogEmpty').classList.toggle('show', !visible.length);
    $('catalogEmpty').textContent = low > high ? 'El mínimo supera el máximo o no coincide con el rango seleccionado.' : 'No hay resultados con estos filtros. Un filtro de precio excluye las piezas sin una oferta exacta consultada.';
    $('partsGrid').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
    renderComparison();
  };
  window.FENIXA_BROWSE_CATEGORY = category => {
    if (!categories.some(c => c.id === category)) return;
    resetCatalogFilters();
    $('categoryFilter').value = category;
    window.renderProductCatalog();
    const reveal = () => {
      if (location.hash !== '#componentes') return;
      $('catalog-title').tabIndex = -1;
      $('catalog-title').focus({preventScroll:true});
      $('catalogo').scrollIntoView({block:'start',behavior:'instant'});
    };
    if (location.hash === '#componentes') reveal();
    else {
      window.addEventListener('hashchange', () => requestAnimationFrame(reveal), {once:true});
      location.hash = 'componentes';
    }
  };
  ['storeFilter','pricedOnly'].forEach(id=>$(id).addEventListener('change',window.renderProductCatalog));
  window.addEventListener('hashchange', () => { if(location.hash === '#catalogo') window.renderProductCatalog(); });
  window.addEventListener('fenixa-build-changed', () => window.renderProductCatalog(true));
  window.addEventListener('fenixa-profile-changed', () => window.renderProductCatalog());
  ['catalogSearch', 'catalogMin', 'catalogMax'].forEach(id => $(id).addEventListener('input', window.renderProductCatalog));
  $('catalogSort').addEventListener('change', window.renderProductCatalog);
  $('clearFilters').addEventListener('click', () => { resetCatalogFilters(); window.renderProductCatalog(); });
  function renderComparison() {
    $('compareTray').hidden = !selected.size;
    $('compareTrayCount').textContent = `${selected.size}/4`;
    $('compareList').innerHTML = [...selected].map(id => `<div class="comparison-dock-item"><img src="${esc(byId[id].image)}" alt="" width="56" height="56"><span>${esc(byId[id].name)}</span><button type="button" class="dock-remove" data-remove-compare="${esc(id)}" aria-label="Quitar ${esc(byId[id].name)} de comparaciones">×</button></div>`).join('');
    $('compareTrayMessage').textContent = selected.size < 2 ? 'Elige otra pieza de la misma categoría. No se añade nada a Mi build.' : 'Tu build no cambia hasta que confirmes añadir o reemplazar una pieza.';
    $('openRealComparison').disabled = selected.size < 2;
    if (!selected.size) { $('compareTrayBody').hidden=true; $('compareTrayToggle').setAttribute('aria-expanded','false'); }
    document.querySelectorAll('[data-compare]').forEach(button => { const on = selected.has(button.dataset.compare); button.setAttribute('aria-pressed', String(on)); button.textContent = on ? 'Quitar de comparación' : 'Comparar pieza'; button.closest('article').classList.toggle('selected', on); });
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
  $('openRealComparison').addEventListener('click',()=>{if(selected.size>=2){$('compareTrayBody').hidden=true;$('compareTrayToggle').setAttribute('aria-expanded','false');window.FENIXA_COMPARE.openMany([...selected]);}});
  $('marketGrid').addEventListener('click', event => {
    const b = event.target.closest('[data-compare]'); if (!b) return;
    const id = b.dataset.compare;
    if (selected.has(id)) selected.delete(id);
    else if (selected.size >= 4) return showToast('Puedes comparar hasta 4 piezas. Quita una para elegir otra.');
    else if (selected.size && byId[[...selected][0]].category !== byId[id].category) return showToast('Elige piezas de la misma categoría para compararlas.');
    else selected.add(id);
    renderComparison();
  });
  $('clearCompare').addEventListener('click', () => { selected.clear(); renderComparison(); document.querySelector('[data-compare]')?.focus({preventScroll:true}); });
  const budgetBar=document.createElement('div');
  budgetBar.className='build-budget-bar';
  budgetBar.innerHTML='<label>Presupuesto objetivo hasta (COP)<select id="buildMaxPrice"><option value="">Todos los presupuestos</option>'+window.FENIXA_BUILD_DISCOVERY.amounts.map(value=>'<option value="'+value+'">'+money(value)+'</option>').join('')+'</select></label><label class="build-quoted-check"><input type="checkbox" id="buildQuotedOnly"> Solo builds totalmente cotizadas</label><p>Las propuestas se muestran aunque falten precios. El objetivo no es una cotización; el coste final puede superarlo. La opción de cotizadas exige precios recientes de todas las piezas dentro de tu máximo, sin envío ni ensamblaje.</p><span id="buildResults" role="status"></span>';
  $('buildGallery').before(budgetBar);
  $('buildMaxPrice').addEventListener('change',renderGallery);
  $('buildQuotedOnly').addEventListener('change',renderGallery);
  window.addEventListener('fenixa-find-builds', event => {
    const {use,max}=event.detail;
    activeUse=['estudio','gaming','creativo','trabajo'].includes(use)?use:'all';
    if(Number.isSafeInteger(max)&&max>0&&!Array.from($('buildMaxPrice').options).some(o=>o.value===String(max))){
      const option=document.createElement('option');option.value=String(max);option.textContent=money(max)+' · objetivo anterior';$('buildMaxPrice').append(option);
    }
    $('buildMaxPrice').value=String(max);renderGallery();
  });
  const buildTotal = b => {
    return window.FENIXA_BUILD_DISCOVERY.total(b,id=>market.price(byId[id]));
  };
  const buildPrice = b => { const t=buildTotal(b); return t.count ? `${t.complete?'Subtotal':'Subtotal parcial'}: ${money(t.sum)}` : 'Precio por confirmar'; };
  function renderGallery() {
    const limit=$('buildMaxPrice').value;
    const quotedOnly=$('buildQuotedOnly').checked;
    const visible = completeBuilds.filter(b => window.FENIXA_BUILD_DISCOVERY.matches(b,{use:activeUse,limit,quotedOnly,saved},buildTotal(b)));
    const sort = $('buildSort').value;
    if (sort === 'featured') visible.sort((a,b)=>Number(Boolean(b.targetBudget))-Number(Boolean(a.targetBudget))||(a.targetBudget||Infinity)-(b.targetBudget||Infinity));
    if (sort === 'price-asc') visible.sort((a,b)=>(a.targetBudget??Infinity)-(b.targetBudget??Infinity));
    if (sort === 'price-desc') visible.sort((a,b)=>(b.targetBudget??-Infinity)-(a.targetBudget??-Infinity));
    $('buildGallery').innerHTML = visible.map(b => `<article class="build-card"><button class="build-photo-button" type="button" data-open-build="${b.id}" aria-label="Ver piezas de ${esc(b.name)}">${photo(byId[b.caseId])}<span class="build-photo-label">Foto del gabinete</span></button><div class="build-card-body"><div class="build-target">${b.targetBudget?'Objetivo '+money(b.targetBudget):'Propuesta original · sin objetivo asignado'}</div><h3>${esc(b.name)}</h3><dl class="build-overview" aria-label="Piezas principales de ${esc(b.name)}">${window.FENIXA_BUILD_DISCOVERY.overview(b).map(p=>`<div><dt>${esc(p.label)}</dt><dd>${esc(p.name)}</dd></div>`).join('')}</dl><p class="build-rationale">${esc(b.description)}</p><div class="build-tags">${b.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div><div class="build-estimate">${buildPrice(b)}</div><span class="estimate-label">${buildTotal(b).count}/${b.parts.length} piezas con precio reciente · cotización ${buildTotal(b).complete?'completa':'pendiente'}</span><button class="primary-button" type="button" data-open-build="${b.id}">Ver piezas y personalizar</button></div></article>`).join('');
    $('buildResults').textContent=visible.length+(visible.length===1?' propuesta':' propuestas')+' · presupuesto objetivo, no precio de venta'+(limit&&visible.some(b=>!b.targetBudget)?' · las originales sin objetivo se conservan visibles':'');
    $('buildsEmpty').hidden = visible.length > 0;
    $('buildsEmpty').textContent = activeUse==='saved' ? 'Todavía no tienes builds guardadas. Abre una propuesta y pulsa Guardar build original.' : quotedOnly ? 'No hay cotizaciones completas y recientes con estos filtros. Desmarca Solo builds totalmente cotizadas para explorar propuestas con precios pendientes.' : 'No hay propuestas para estos filtros. Amplía el presupuesto objetivo o cambia de uso.';
    document.querySelectorAll('[data-build-use]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.buildUse === activeUse)));
  }
  document.querySelectorAll('[data-build-use]').forEach(b => b.addEventListener('click', () => { activeUse = b.dataset.buildUse; renderGallery(); }));
  $('buildSort').addEventListener('change', renderGallery);
  const dialog = document.createElement('dialog'); dialog.className = 'build-dialog'; dialog.id = 'buildDialog'; dialog.setAttribute('aria-labelledby', 'detailTitle'); document.body.append(dialog);
  function renderDetail(original) {
    const build = window.FENIXA_BUILD_EDITOR.get(original.id);
    const caseProduct = byId[build.caseId];
    dialog.innerHTML = `<div class="build-dialog-top"><span>FENIXA / Builds completas</span><button type="button" data-close-build aria-label="Cerrar detalle de build">Cerrar ✕</button></div><div class="build-detail-hero"><figure class="detail-photo">${photo(caseProduct, '', false)}<figcaption>Imagen publicada del gabinete ${esc(caseProduct.name)}. La configuración propuesta corresponde a la lista de piezas.</figcaption></figure><div class="detail-intro"><div class="eyebrow">CONFIGURACIÓN DE REFERENCIA</div><h2 id="detailTitle">${esc(build.name)}</h2><p>${esc(build.description)}</p><div class="build-tags">${build.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div><div class="build-estimate">${buildPrice(build)}</div><div class="estimate-label">${buildTotal(build).count}/${build.parts.length} piezas con precio · COP · sin envío ni ensamblaje</div><div class="detail-actions"><button type="button" class="primary-button" data-copy-my-build="${build.id}">Usar selección en Mi build</button><button type="button" class="primary-button" id="saveBuild" aria-pressed="${saved.has(build.id)}">${saved.has(build.id) ? 'Build guardada ✓' : 'Guardar build original'}</button><button type="button" class="secondary-button" id="shareBuild">Copiar enlace original</button></div><input id="buildShareUrl" class="share-field" aria-label="Enlace para compartir esta build" readonly hidden></div></div><div class="detail-body"><section class="build-customization" aria-label="Personalizar build"><strong>${build.modified ? 'Tu variante · piezas modificadas' : 'Personaliza esta build'}</strong><p>Cambia una pieza desde su selector. El subtotal y las advertencias se recalculan con el resto de la lista. No todos los cambios son compatibles.</p><p class="build-editor-status" role="status">${build.modified ? 'Hay cambios en esta pestaña.' : 'Estás viendo las piezas originales.'} Los cambios se conservan al navegar, pero se pierden al recargar. Guardar y copiar enlace se refieren a la build original.</p><button type="button" class="secondary-button" data-reset-build ${build.modified ? '' : 'disabled'}>Restaurar piezas originales</button></section><div class="detail-tabs" role="tablist" aria-label="Detalle de build"><button type="button" role="tab" id="partsTab" data-detail-tab="parts" aria-controls="detailParts" aria-selected="true">Piezas y compra</button><button type="button" role="tab" id="checksTab" data-detail-tab="checks" aria-controls="detailChecks" aria-selected="false" tabindex="-1">Qué revisar</button></div><div role="tabpanel" id="detailParts" aria-labelledby="partsTab">${market.plan(build.parts,byId)}<div class="detail-subheading"><span>${build.parts.length} componentes · modelos exactos</span><span>Precio y stock: consultar en la tienda</span></div>${build.parts.map((id, index) => { const p = byId[id]; return `<article class="build-part"><span class="build-part-category">${esc(categoryName(p.category))}</span>${photo(p)}<div><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><div class="product-sku">${esc(p.sku)}</div>${external(p.source,p.sourceType==='retailer'?'Ficha de tienda':'Ficha del fabricante')}</div><div class="build-part-purchase">${replacementControl(build.id,index)}${market.purchase(p,build.parts.map(id=>byId[id]))}</div></article>`; }).join('')}<p class="catalog-footnote">Cada tienda conserva sus condiciones. La disponibilidad corresponde al momento de consulta; confirma modelo exacto, presentación, envío e impuestos antes de pagar.</p></div><div role="tabpanel" id="detailChecks" aria-labelledby="checksTab" hidden><div class="build-notes"><h3>Revisa la configuración actual</h3><p>Revisa las piezas de esta lista y confirma BIOS, memoria, dimensiones, conectores y refrigeración antes de comprar. Coincidir en plataforma no garantiza compatibilidad completa.</p><p>Las siguientes notas pertenecen a la propuesta original; si cambias piezas, consulta las fichas de los nuevos modelos.</p><ul>${build.notes.map(n => `<li>${esc(n)}</li>`).join('')}<li>Revisa los conectores y el espacio de la gráfica, la fuente y la refrigeración en los manuales de los modelos exactos.</li><li>El subtotal usa las ofertas consultadas y puede estar incompleto. Esta configuración no representa un montaje físico probado ni incluye mediciones de FPS.</li></ul><button class="secondary-button" type="button" data-detail-tab="parts">Volver a elegir piezas →</button></div></div></div>`;
    if(build.targetBudget){const info=document.createElement('p');info.className='build-target';info.textContent='Objetivo '+money(build.targetBudget)+' · no es una cotización'+(build.modified?' · corresponde a la propuesta original':'');dialog.querySelector('.detail-intro').prepend(info);}
    if(build.sources?.length){const links=document.createElement('div');links.className='product-links';links.innerHTML=build.sources.map(s=>external(s.url,esc(s.label))).join('');dialog.querySelector('.build-notes').append(links);}
    $('saveBuild').addEventListener('click', () => {
      const next = new Set(saved); next.has(build.id) ? next.delete(build.id) : next.add(build.id);
      try { localStorage.setItem('fenixa-saved-builds', JSON.stringify([...next])); saved = next; } catch { return showToast('No se pudo guardar en este navegador.'); }
      $('saveBuild').textContent = saved.has(build.id) ? 'Build guardada ✓' : 'Guardar build original'; $('saveBuild').setAttribute('aria-pressed', String(saved.has(build.id))); renderGallery();
    });
    $('shareBuild').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); $('shareBuild').textContent = 'Enlace copiado ✓'; } catch { $('buildShareUrl').hidden = false; $('buildShareUrl').value = location.href; $('buildShareUrl').select(); }
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
    return `<div class="replace-part">
      <div class="purchase-fit ${fit.status}"><strong>${esc(fit.label)}</strong><p>${esc(fit.reason)}</p>${current.platform?external(current.platform.source,'Fuente de plataforma'):''}</div>
      <label for="partBudget${index}">Máximo para esta pieza (COP)</label>
      <input id="partBudget${index}" type="number" min="0" step="1000" inputmode="numeric" placeholder="Sin límite" value="${esc(filter.max)}" data-part-filter="max" data-slot="${index}">
      <button type="button" class="secondary-button" data-apply-budget="${index}">Aplicar presupuesto</button>
      <label class="part-check"><input type="checkbox" data-part-filter="hideConflicts" data-slot="${index}" ${filter.hideConflicts?'checked':''}> Ocultar conflictos detectados</label>
      <label class="part-check"><input type="checkbox" data-part-filter="matchesOnly" data-slot="${index}" ${filter.matchesOnly?'checked':''}> Solo coincidencias de plataforma</label>
      <small>${choices.length} opciones en el filtro. Con presupuesto se excluyen precios no confirmados. La selección actual se conserva aunque quede fuera.</small>
      <label for="replacePart${index}">Cambiar esta pieza</label><select id="replacePart${index}" data-replace-part="${index}">${options.map(({product:p,fit,price}) => `<option value="${esc(p.id)}" ${p.id===current.id?'selected':''}>${esc(p.name)} · ${price===null?'Sin precio reciente':money(price)} · ${fit.status==='conflict'?'CONFLICTO':fit.matched?'Coincide plataforma · revisar BIOS':'Faltan datos'}${p.id===current.id?' · Actual':''}</option>`).join('')}</select>
      <div class="part-suggestions"><strong>Alternativas con coincidencias · menor precio primero</strong>${suggested.length?suggested.map(({product:p,fit,price})=>`<div><button type="button" class="secondary-button" data-suggest-part="${esc(p.id)}" data-slot="${index}">Elegir ${esc(p.name)} · ${money(price)}</button><small>${esc(fit.reason)}</small></div>`).join(''):'<p>No hay alternativas con coincidencias comprobadas y precio reciente en este rango. Puedes ampliar el presupuesto o revisar los modelos con datos pendientes.</p>'}<small>Coincidir en socket o memoria no confirma todo el montaje. No es una clasificación de rendimiento.</small></div>
    </div>`;
  }
  function refreshDraft(index) {
    const scroll = dialog.scrollTop;
    renderDetail(completeBuilds.find(b => b.id === activeBuild));
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
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; activeBuild = null; if (location.hash.startsWith('#build/')) history.replaceState(null, '', '#builds'); opener?.focus({ preventScroll: true }); });
  function routeBuild() {
    const id = location.hash.startsWith('#build/') ? location.hash.slice(7) : null;
    const build = completeBuilds.find(b => b.id === id);
    if (build) { if (activeBuild !== build.id) { activeBuild = build.id; renderDetail(build); } if (!dialog.open) { opener = document.activeElement; dialog.showModal(); document.body.style.overflow = 'hidden'; } }
    else if (dialog.open) dialog.close();
  }
  $('buildGallery').addEventListener('click', event => { const button = event.target.closest('[data-open-build]'); if (button) { opener = button; location.hash = `build/${button.dataset.openBuild}`; } });
  window.addEventListener('hashchange', routeBuild);
  const menu = document.querySelector('.mobile-menu');
  const sidebar = document.querySelector('.sidebar'), scrim = document.querySelector('.menu-scrim');
  function setMenu(open, restoreFocus = false) {
    sidebar.classList.toggle('menu-open', open);
    sidebar.inert = !open;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (scrim) scrim.hidden = !open;
    if (restoreFocus) menu.focus();
  }
  menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => {
    const open = !sidebar.classList.contains('menu-open');
    setMenu(open);
    if (open) sidebar.querySelector('.nav-link')?.focus();
  });
  scrim?.addEventListener('click', () => setMenu(false, true));
  document.querySelectorAll('.nav-link, .brand').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('menu-open')) setMenu(false, true);
  });
  document.addEventListener('focusin', event => {
    if (sidebar.classList.contains('menu-open') && !sidebar.contains(event.target) && event.target !== menu) setMenu(false);
  });
  window.renderProductCatalog(); renderGallery(); routeBuild();
})();
