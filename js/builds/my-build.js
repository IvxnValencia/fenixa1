(() => {
  'use strict';
  const state = window.FENIXA_MY_BUILD, market = window.FENIXA_MARKET;
  const {products, categories} = window.FENIXA_CATALOG;
  const byId = Object.fromEntries(products.map(p => [p.id,p]));
  const root = document.getElementById('mi-build');
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = p => `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Consultar ficha </a>`;
  const image = p => `<img src="${esc(window.FENIXA_THUMB ? window.FENIXA_THUMB(p.image) : p.image)}" alt="${esc(p.name)}" width="100" height="80" loading="lazy">`;
  const baseCategories = ['cpu','board','ram','storage','power','case'];
  function overview(parts, conflicts) {
    const chosen = baseCategories.filter(id=>parts.some(p=>p.category===id)).length;
    const conflicting = new Set(conflicts.map(p=>p.id));
    return `<section class="build-overview" aria-labelledby="buildOverviewTitle">
      <div class="build-overview-heading"><div><h3 id="buildOverviewTitle">${chosen} de ${baseCategories.length} categorías de la base elegidas</h3></div><span class="build-overview-count" aria-hidden="true">${chosen}<small> / ${baseCategories.length}</small></span></div>
      <progress class="build-overview-progress" value="${chosen}" max="${baseCategories.length}" aria-labelledby="buildOverviewTitle">${chosen} de ${baseCategories.length}</progress>
      
      <ul class="build-overview-grid">${baseCategories.map(id=>{
        const p=parts.find(p=>p.category===id), name=categories.find(c=>c.id===id).name;
        const status=!p?'Pendiente':conflicting.has(p.id)?'Revisar conflicto':'Elegida';
        return `<li><button type="button" class="build-overview-item${p?' is-chosen':''}${p&&conflicting.has(p.id)?' has-conflict':''}" data-edit-category="${id}" aria-label="${esc(name)}: ${esc(p?shortName(p):'sin elegir')}. ${status}. ${p?'Cambiar pieza':'Elegir pieza'}"><span class="build-overview-photo" aria-hidden="true">${p?`<img src="${esc(p.image)}" alt="" width="64" height="64" loading="lazy">`:'<span>＋</span>'}</span><span class="build-overview-copy"><strong>${esc(name)}</strong><span${p?` title="${esc(p.name)}"`:''}>${p?esc(shortName(p)):'Elige tu modelo'}</span><small>${status}</small></span></button></li>`;
      }).join('')}</ul>
    </section>`;
  }
  let pendingImport = null, pendingReasons = {}, pendingClear = false;
  let totalBudget = 0, budgetSaved = true;
  totalBudget=window.FENIXA_BUDGET.get();budgetSaved=window.FENIXA_BUDGET.saved();
  // Misma referencia que Armar mi PC (rango bajo–alto) frente al objetivo; sin precios en alguna pieza no se afirma nada.
  function budgetSummary() {
    const reference=costReference(state.ids().map(id=>byId[id]));
    if(!state.ids().length)return '';
    if(!reference||reference.partial||!reference.count)return 'Faltan precios';
    if(!totalBudget)return 'Elige un objetivo para comparar';
    if(reference.high<=totalBudget)return 'Cabe en tu presupuesto';
    return reference.low>totalBudget||reference.low===reference.high?`Se pasa por ${market.money((reference.low>totalBudget?reference.low:reference.high)-totalBudget)}`:`Se pasa por hasta ${market.money(reference.high-totalBudget)}`;
  }
  // Tope del slider: el del perfil de Armar mi PC solo si la build se importó desde una propuesta (tiene razones por pieza).
  function budgetMax() {
    const level=window.FENIXA_BUDGET.profileLevel?.();
    return level&&state.ids().some(id=>state.reason?.(id))?window.FENIXA_BUDGET.limit(level):window.FENIXA_BUDGET.max;
  }
  function costReference(parts) {
    if(!parts.length||!window.FENIXA_AUTO_BUILD?.reference)return null;
    const refs=parts.map(p=>window.FENIXA_AUTO_BUILD.reference(p)).filter(ref=>Number.isFinite(ref?.low)&&ref.low>0&&Number.isFinite(ref.high)&&ref.high>=ref.low);
    const low=refs.reduce((sum,ref)=>sum+ref.low,0), high=refs.reduce((sum,ref)=>sum+ref.high,0);
    return {count:refs.length,total:parts.length,low,high,partial:refs.length<parts.length,older:refs.some(ref=>ref.kind!=='recent')};
  }
  function moreInfo(reference) {
    return `<p>${state.saved()&&budgetSaved?'Guardado solo en este navegador.':'No se pudo guardar todo; la selección actual puede perderse al cerrar.'}</p><p>Precios de referencia observados en tiendas colombianas; confirma precio y stock antes de comprar.</p><p>Con precios o piezas pendientes no podemos confirmar el coste total ni el ajuste al presupuesto.</p>${reference?.older?'<p>La referencia incluye precios publicados, históricos o de catálogo; confirma el precio actual.</p>':''}${reference?.partial?`<p>Sin referencia: ${reference.total-reference.count} ${reference.total-reference.count===1?'pieza':'piezas'}; el importe mostrado es parcial.</p>`:''}<p>Los importes no incluyen envío ni montaje; revisa precio, disponibilidad y compatibilidad.</p>`;
  }
  // Short summary of key facts, used when a piece has no stored reason.
  const num = n => new Intl.NumberFormat('es-CO').format(n);
  function keyFacts(p) {
    const v = window.FENIXA_SPECS?.facts(p).values || {};
    const has = x => x !== undefined && x !== null && x !== '';
    const size = n => n >= 1000 ? `${num(n / 1000)} TB` : `${num(n)} GB`;
    const parts = {
      cpu: [has(v.cores) && `${v.cores} núcleos`, v.socket],
      gpu: [has(v.vram) && `${v.vram} GB${v.memory ? ' ' + v.memory : ''}`],
      ram: [has(v.capacity) && `${v.capacity} GB${v.memory ? ' ' + v.memory : ''}`, has(v.rate) && `${num(v.rate)} MT/s`],
      storage: [has(v.capacity) && size(v.capacity), v.pcie],
      board: [v.socket, v.chipset],
      power: [has(v.watts) && `${v.watts} W`, v.efficiency && String(v.efficiency).replace(/^Cybenetics\s+/i, '')],
      case: [has(v.gpuMax) && `GPU hasta ${v.gpuMax} mm`],
      cooler: [v.format],
      fan: [v.format, has(v.rpm) && `${num(v.rpm)} RPM`],
      setup: [v.format]
    }[p.category] || [];
    return parts.filter(Boolean).join(' · ');
  }
  const day = o => { const t = Date.parse(o.checkedAt); return Number.isFinite(t) ? new Date(t).toLocaleDateString('es-CO', {timeZone: 'America/Bogota', dateStyle: 'short'}) : ''; };
  const refDay = o => { const t = Date.parse(o.checkedAt); return Number.isFinite(t) ? new Date(t).toLocaleDateString('es-CO', {timeZone: 'America/Bogota', day: 'numeric', month: 'numeric'}).split('/').map(x => x.padStart(2, '0')).join('/') : '—'; };
  const shortName = p => window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : p.name;
  function storeLine(p) {
    const o = market.fixed(p);
    if (!o) return 'Precio por confirmar';
    let store=String(o.store||'');
    if(store.length>28){try{store=new URL(o.url).hostname.replace(/^www\./,'');}catch{}}
    const detail = (o.status==='listed'?'Precio publicado':market.recent(o)?'Precio consultado':'Consulta vencida')+' · COP';
    return `<span title="${esc(o.store)}">${esc(store)} ·</span> `+[market.money(o.price), `<span title="${esc(detail)}">Ref. ${esc(refDay(o))}</span>`].join(' · ') + (o.url ? ` · <a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">Ver en tienda</a>` : '');
  }
  function recommendations(parts) {
    if (!parts.length) return '';
    const step=state.nextStep(), next=step?.category;
    if (!next) return '<section class="build-recommendations"><h3>Base elegida</h3><p>Revisa gráficos, refrigeración y montaje antes de comprar.</p></section>';
    const name=categories.find(c=>c.id===next)?.name || next;
    const known=parts.map(p=>market.price(p));
    const priced=known.every(price=>price!==null);
    const remaining=totalBudget&&priced?totalBudget-known.reduce((sum,price)=>sum+price,0):null;
    const options=state.candidates(next,{hideConflicts:true}).filter(candidate=>remaining===null || (candidate.price!==null&&candidate.price<=remaining)).slice(0,3);
    const budgetNote=(step.reason?`${esc(step.reason)} `:'')+(remaining===null?'':`Margen provisional: ${market.money(Math.max(0,remaining))}.`);
    return `<section class="build-recommendations" aria-labelledby="buildRecommendationsTitle"><div><h3 id="buildRecommendationsTitle">Siguiente paso: ${esc(name)}</h3>${budgetNote?`<p>${budgetNote}</p>`:''}</div><div class="build-recommendation-list">${options.length?options.map(({product,fit,price})=>`<article>${image(product)}<div><strong title="${esc(product.name)}">${esc(shortName(product))}</strong><small>${esc(fit.label)} · ${price===null?'Sin precio reciente':market.money(price)}</small></div><button class="secondary-button" type="button" data-suggest-id="${esc(product.id)}">Añadir</button></article>`).join(''):'<p>Sin opciones comprobables dentro del margen.</p>'}</div></section>`;
  }
  function partCard(c, parts) {
    const p = parts.find(p => p.category === c.id);
    if (!p) return `<article class="my-build-row is-empty"><div><span class="my-build-placeholder" aria-hidden="true">＋</span></div><div><small>${esc(c.name)}</small><div class="my-build-actions"><button type="button" class="secondary-button" data-edit-category="${c.id}">Elegir pieza</button></div></div></article>`;
    const fit = window.FENIXA_FIT.check(p, parts.filter(other => other.id !== p.id));
    const why = state.reason?.(p.id) || keyFacts(p) || 'Sin datos clave verificados';
    return `<article class="my-build-row"><div>${image(p)}</div><div><small>${esc(c.name)} ${window.FENIXA_FIT_STATUS.tag(fit,{hasParts:parts.some(other=>other.category!==p.category)})}</small><h3 title="${esc(p.name)}">${esc(shortName(p))}</h3><p class="my-build-why">${esc(why)}</p><p class="my-build-store">${storeLine(p)}</p>${fit.status==='conflict'?`<p class="my-build-conflict">${esc(fit.reason)}</p>`:''}<div class="my-build-actions"><button type="button" class="secondary-button" data-edit-category="${c.id}">Cambiar pieza</button><button type="button" class="my-build-remove" data-remove-part="${p.id}" aria-label="Quitar ${esc(shortName(p))}">Quitar</button></div></div></article>`;
  }
  function render() {
    const ids = state.ids(), parts = ids.map(id=>byId[id]);
    const conflicts = parts.filter(p=>window.FENIXA_FIT.check(p,parts.filter(other=>other.id!==p.id)).status==='conflict');
    const reference=costReference(parts), info=moreInfo(reference), cap=budgetMax();
    root.innerHTML = `<div class="section-heading"><div><h2 tabindex="-1" id="myBuildTitle">Mi build</h2></div><a class="secondary-button" href="#componentes">Explorar componentes </a></div>
      ${window.FENIXA_LIBRARY_UI?.render(info)||`<details><summary>Más info</summary>${info}</details>`}
      <p class="my-build-storage" role="status">${state.saved()&&budgetSaved?'Guardado en este navegador.':'Sin guardar · solo en esta pestaña.'}</p>
      <div class="build-studio"><aside class="build-studio-summary" aria-label="Resumen y presupuesto de Mi build" tabindex="0">
      ${overview(parts, conflicts)}
      ${pendingImport?`<div class="build-customization"><strong>¿Reemplazar Mi build con esta selección?</strong><p>Se sustituirán las piezas actuales por las ${pendingImport.length} de la build elegida.</p><button type="button" class="primary-button" data-confirm-import>Reemplazar Mi build</button> <button type="button" class="secondary-button" data-cancel-import>Conservar la actual</button></div>`:''}
      <div class="my-build-summary"><strong>${parts.length} ${parts.length===1?'pieza':'piezas'}</strong>${conflicts.length?`<span>${conflicts.length} con conflictos detectados</span>`:''}${parts.length?'<button type="button" class="my-build-clear" data-request-clear>Vaciar Mi build</button>':''}</div>
      ${pendingClear?'<div class="my-build-clear-confirm" role="group" aria-label="Confirmar vaciar Mi build"><strong>¿Vaciar la build actual?</strong><p>Tu presupuesto objetivo se conserva.</p><button type="button" class="primary-button" data-confirm-clear>Sí, vaciar piezas</button> <button type="button" class="secondary-button" data-cancel-clear>Cancelar</button></div>':''}
      <div class="my-build-budget">${reference?`<p class="my-build-reference"><strong>Referencia de coste: ${reference.count?(reference.low===reference.high?market.money(reference.low):`${market.money(reference.low)} – ${market.money(reference.high)}`):'por confirmar'}</strong></p>${reference.total>reference.count?`<p class="my-build-missing">${reference.total-reference.count} ${reference.total-reference.count===1?'pieza sin precio':'piezas sin precio'}</p>`:''}`:''}<label for="myBuildTotalBudget">Objetivo de presupuesto · <output id="myBuildBudgetLabel" for="myBuildTotalBudget">${totalBudget?market.money(totalBudget):'Sin objetivo'}</output></label><small class="my-build-range" id="myBuildBudgetRange">De $1 a ${num(cap/1000000)} millones</small><input id="myBuildTotalBudget" type="range" min="1000000" max="${cap}" step="250000" value="${Math.min(totalBudget||1000000,cap)}" aria-describedby="myBuildBudgetRange myBuildBudgetSummary"><button type="button" class="text-button" data-clear-budget>Sin objetivo</button><p id="myBuildBudgetSummary" role="status">${budgetSummary()}</p></div>
      </aside><div class="build-studio-main"><div class="my-build-layout"><div><h3>Tus piezas</h3>${!parts.length?'<div class="my-build-empty"><h3>Tu próxima PC empieza aquí</h3><div class="my-build-actions"><a class="primary-button" href="#configurador">Armar mi PC</a><a class="secondary-button" href="#componentes">Explorar componentes</a></div></div>':`<div class="my-build-parts">${categories.map(c=>partCard(c,parts)).join('')}</div>`}</div></div>
      ${recommendations(parts)}
      ${parts.length?`<details class="my-build-shopping"><summary>Opciones de compra de Mi build</summary>${market.plan(ids,byId)}${parts.map(p=>`<article><h3 title="${esc(p.name)}">${esc(shortName(p))}</h3>${market.purchase(p,parts)}</article>`).join('')}</details>`:''}</div></div>`;
  }
  window.addEventListener('fenixa-library-changed',render);
  window.addEventListener('fenixa-build-changed',()=>{pendingClear=false;render();});
  window.addEventListener('fenixa-request-build-import',event=>{
    const next=event.detail?.parts;
    if(!Array.isArray(next)||!next.length||next.some(id=>!byId[id])||new Set(next.map(id=>byId[id].category)).size!==next.length)return;
    const reasons=event.detail?.reasons&&typeof event.detail.reasons==='object'&&!Array.isArray(event.detail.reasons)?event.detail.reasons:{};
    if(state.ids().length){pendingImport=next.slice();pendingReasons=reasons;pendingClear=false;render();}else state.importParts(next,reasons);
  });
  window.addEventListener('fenixa-budget-changed',()=>{totalBudget=window.FENIXA_BUDGET.get();budgetSaved=window.FENIXA_BUDGET.saved();render();});
  window.addEventListener('hashchange',()=>{if(location.hash==='#mi-build')render();});
  window.addEventListener('load',render,{once:true});
  root.addEventListener('input',event=>{
    if(event.target.id==='myBuildTotalBudget'){
      totalBudget=Number(event.target.value);
      document.getElementById('myBuildBudgetLabel').textContent=market.money(totalBudget);
      document.getElementById('myBuildBudgetSummary').textContent=budgetSummary();
    }
  });
  root.addEventListener('change',event=>{if(event.target.id==='myBuildTotalBudget'){window.FENIXA_BUDGET.set(Number(event.target.value));document.getElementById('myBuildTotalBudget').focus({preventScroll:true});}});
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-clear-budget]')){window.FENIXA_BUDGET.set(0);return;}
    if(event.target.closest('[data-request-clear]')){pendingClear=true;render();document.querySelector('[data-confirm-clear]')?.focus();return;}
    if(event.target.closest('[data-cancel-clear]')){pendingClear=false;render();document.querySelector('[data-request-clear]')?.focus();return;}
    if(event.target.closest('[data-confirm-clear]')){pendingClear=false;pendingImport=null;state.clear();document.getElementById('myBuildTitle').focus();return;}
    const suggestion=event.target.closest('[data-suggest-id]');
    if(suggestion){window.FENIXA_REQUEST_BUILD_ADD(suggestion.dataset.suggestId,suggestion);return;}
    // «Cambiar pieza» y «Elegir pieza» abren el catálogo filtrado; el diálogo de Mi build confirma el reemplazo.
    const edit=event.target.closest('[data-edit-category]');
    if(edit){window.FENIXA_BROWSE_CATEGORY(edit.dataset.editCategory);return;}
    const remove=event.target.closest('[data-remove-part]');if(remove){state.remove(remove.dataset.removePart);document.getElementById('myBuildTitle').focus();return;}
    if(event.target.closest('[data-confirm-import]')){const next=pendingImport,reasons=pendingReasons;pendingImport=null;pendingReasons={};state.importParts(next,reasons);return;}
    if(event.target.closest('[data-cancel-import]')){pendingImport=null;pendingReasons={};render();}
  });
  document.addEventListener('click',event=>{
    const copy=event.target.closest('[data-copy-my-build]');
    if(copy){const b=window.FENIXA_BUILD_EDITOR.get(copy.dataset.copyMyBuild);if(!b)return;if(state.ids().length){pendingImport=b.parts.slice();pendingReasons={};render();}else state.importParts(b.parts);location.hash='mi-build';}
  });
  render();
})();
