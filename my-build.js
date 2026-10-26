(() => {
  'use strict';
  const state = window.FENIXA_MY_BUILD, market = window.FENIXA_MARKET;
  const {products, categories} = window.FENIXA_CATALOG;
  const byId = Object.fromEntries(products.map(p => [p.id,p]));
  const root = document.getElementById('mi-build');
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = p => `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Consultar ficha ↗</a>`;
  const image = p => `<img src="${esc(p.image)}" alt="${esc(p.name)}" width="100" height="80" loading="lazy">`;
  const baseCategories = ['cpu','board','ram','storage','power','case'];
  function overview(parts, conflicts) {
    const chosen = baseCategories.filter(id=>parts.some(p=>p.category===id)).length;
    const conflicting = new Set(conflicts.map(p=>p.id));
    return `<section class="build-overview" aria-labelledby="buildOverviewTitle">
      <div class="build-overview-heading"><div><span class="eyebrow">TU BUILD DE UN VISTAZO</span><h3 id="buildOverviewTitle">${chosen} de ${baseCategories.length} categorías de la base elegidas</h3></div><span class="build-overview-count" aria-hidden="true">${chosen}<small> / ${baseCategories.length}</small></span></div>
      <progress class="build-overview-progress" value="${chosen}" max="${baseCategories.length}" aria-labelledby="buildOverviewTitle" aria-describedby="buildOverviewHelp">${chosen} de ${baseCategories.length}</progress>
      <p id="buildOverviewHelp">Este avance cuenta elecciones, no compatibilidad ni presupuesto. Revisa también gráficos y refrigeración. Pulsa una categoría para elegir o cambiar su pieza.</p>
      <ul class="build-overview-grid">${baseCategories.map(id=>{
        const p=parts.find(p=>p.category===id), name=categories.find(c=>c.id===id).name;
        const status=!p?'Pendiente':conflicting.has(p.id)?'Revisar conflicto':'Elegida';
        return `<li><button type="button" class="build-overview-item${p?' is-chosen':''}${p&&conflicting.has(p.id)?' has-conflict':''}" data-edit-category="${id}" aria-label="${esc(name)}: ${esc(p?p.name:'sin elegir')}. ${status}. ${p?'Cambiar pieza':'Elegir pieza'}"><span class="build-overview-photo" aria-hidden="true">${p?`<img src="${esc(p.image)}" alt="" width="64" height="64" loading="lazy">`:'<span>＋</span>'}</span><span class="build-overview-copy"><strong>${esc(name)}</strong><span>${p?esc(p.name):'Elige tu modelo'}</span><small>${status}</small></span><span class="build-overview-arrow" aria-hidden="true">→</span></button></li>`;
      }).join('')}</ul>
    </section>`;
  }
  let category = 'cpu', query = '', max = '', hideConflicts = true, alternative = '', pendingImport = null, pendingClear = false;
  let draft = {category, query, max, hideConflicts};
  const filtersPending = () => draft.category !== category || draft.query !== query || draft.max !== max || draft.hideConflicts !== hideConflicts;
  function readFilters(form) {
    return {category: form.elements.category.value, query: form.elements.query.value, max: form.elements.max.value === '0' ? '' : form.elements.max.value, hideConflicts: form.elements.hideConflicts.checked};
  }
  function retainFilters(event) {
    if (event.target.form?.id !== 'myBuildFilters') return;
    draft = readFilters(event.target.form);
    document.getElementById('myBuildMaxLabel').textContent = draft.max ? market.money(Number(draft.max)) : 'Sin límite';
    document.getElementById('myBuildFiltersPending').hidden = !filtersPending();
  }
  let totalBudget = 0, budgetSaved = true;
  totalBudget=window.FENIXA_BUDGET.get();budgetSaved=window.FENIXA_BUDGET.saved();
  function budgetSummary() {
    const prices=state.ids().map(id=>market.price(byId[id])), known=prices.filter(p=>p!==null);
    const sum=known.reduce((s,p)=>s+p,0);
    let message=known.length ? `Subtotal de precios recientes: ${market.money(sum)} · ${known.length}/${prices.length} piezas con precio.` : 'Aún no hay un subtotal con precios recientes.';
    if(totalBudget&&sum>totalBudget)message+=` Ya supera tu objetivo en ${market.money(sum-totalBudget)}.`;
    else if(totalBudget&&prices.length&&known.length===prices.length)message+=` Margen frente a las piezas elegidas: ${market.money(totalBudget-sum)}. No incluye piezas pendientes, envío ni montaje.`;
    else if(totalBudget)message+=' Con precios o piezas pendientes no podemos confirmar si tu build cabe en el presupuesto.';
    return message+(budgetSaved?'':' No se pudo guardar el presupuesto; solo se conserva en esta pestaña.');
  }
  function recommendations(parts) {
    if (!parts.length) return '<section class="build-recommendations"><h3>Tu siguiente pieza</h3><p>Añade una pieza para sugerirte opciones según lo que ya elegiste. Nunca se añaden automáticamente.</p></section>';
    const step=state.nextStep(), next=step?.category;
    if (!next) return '<section class="build-recommendations"><h3>Base elegida</h3><p>Ya tienes las seis categorías esenciales. Revisa refrigeración, gráficos, conectores, potencia y montaje antes de comprar; no hay una compatibilidad completa certificada.</p></section>';
    const name=categories.find(c=>c.id===next)?.name || next;
    const known=parts.map(p=>market.price(p));
    const priced=known.every(price=>price!==null);
    const remaining=totalBudget&&priced?totalBudget-known.reduce((sum,price)=>sum+price,0):null;
    const options=state.candidates(next,{hideConflicts:true}).filter(candidate=>remaining===null || (candidate.price!==null&&candidate.price<=remaining)).slice(0,3);
    const budgetNote=(step.reason?`${esc(step.reason)} `:'')+(remaining===null?'No podemos calcular aún un margen completo con los precios disponibles.':`Margen provisional: ${market.money(Math.max(0,remaining))}. Faltan otras piezas, envío y montaje.`);
    return `<section class="build-recommendations" aria-labelledby="buildRecommendationsTitle"><div><span class="eyebrow">SEGÚN TUS PIEZAS Y PRESUPUESTO</span><h3 id="buildRecommendationsTitle">Siguiente paso: ${esc(name)}</h3><p>Opciones sin conflictos detectados, ordenadas por coincidencias conocidas y precio reciente; no significa mayor rendimiento ni montaje garantizado. ${budgetNote}</p></div><div class="build-recommendation-list">${options.length?options.map(({product,fit,price})=>`<article>${image(product)}<div><strong>${esc(product.name)}</strong><small>${esc(fit.label)} · ${price===null?'Sin precio reciente':market.money(price)}</small></div><button class="secondary-button" type="button" data-suggest-id="${esc(product.id)}">Añadir a Mi build</button></article>`).join(''):'<p>No hay una opción comprobable dentro del margen provisional. Ajusta tu objetivo o revisa más modelos sin filtro de presupuesto.</p>'}</div></section>`;
  }
  function render() {
    const ids = state.ids(), parts = ids.map(id=>byId[id]);
    const current = parts.find(p=>p.category===category);
    const choices = state.candidates(category,{query,max,hideConflicts});
    if (!choices.some(c=>c.product.id===alternative)) alternative='';
    const missing = baseCategories.filter(c=>!parts.some(p=>p.category===c));
    const conflicts = parts.filter(p=>window.FENIXA_FIT.check(p,parts.filter(other=>other.id!==p.id)).status==='conflict');
    const selected = byId[alternative];
    root.innerHTML = `<div class="section-heading"><div><div class="eyebrow">TU CONFIGURACIÓN, PIEZA A PIEZA</div><h2 tabindex="-1" id="myBuildTitle">Mi build</h2><p>Reúne tus piezas y ajusta tu configuración, a tu ritmo.</p></div><a class="secondary-button" href="#catalogo">Explorar componentes →</a></div>
      ${window.FENIXA_LIBRARY_UI?.render()||''}
      <p class="my-build-storage" role="status">${state.saved()?'Guardado en este navegador · se conserva al recargar. No se sincroniza con otros dispositivos.':'No se pudo guardar en este navegador. La selección solo se conservará mientras esta pestaña siga abierta.'}</p>
      <div class="build-studio"><aside class="build-studio-summary" aria-label="Resumen y presupuesto de Mi build" tabindex="0">
      ${overview(parts, conflicts)}
      ${pendingImport?`<div class="build-customization"><strong>¿Reemplazar Mi build con esta selección?</strong><p>Se sustituirán las piezas actuales por las ${pendingImport.length} piezas de la build elegida.</p><button type="button" class="primary-button" data-confirm-import>Reemplazar Mi build</button> <button type="button" class="secondary-button" data-cancel-import>Conservar la actual</button></div>`:''}
      <div class="my-build-summary"><strong>${parts.length} categorías elegidas</strong><span>${conflicts.length?`${conflicts.length} piezas con conflictos detectados`:'Revisión parcial · no garantiza compatibilidad'}</span><p>${missing.length?`Por elegir en la base: ${missing.map(c=>esc(categories.find(x=>x.id===c).name)).join(', ')}.`:'Categorías de la base elegidas. Todavía debes comprobar el montaje.'} Verifica también gráficos integrados o dedicados y refrigeración incluida o adicional.</p><small>Una referencia por categoría; un kit de RAM cuenta como un producto. Varias unidades y múltiples discos se añadirán en una próxima etapa.</small>${parts.length?'<button type="button" class="my-build-clear" data-request-clear>Vaciar Mi build</button>':''}</div>
      ${pendingClear?'<div class="my-build-clear-confirm" role="group" aria-label="Confirmar vaciar Mi build"><strong>¿Vaciar la build actual?</strong><p>Se quitarán todas las piezas guardadas en este navegador. Tu presupuesto objetivo se conserva.</p><button type="button" class="primary-button" data-confirm-clear>Sí, vaciar piezas</button> <button type="button" class="secondary-button" data-cancel-clear>Cancelar</button></div>':''}
      <div class="my-build-budget"><label for="myBuildTotalBudget">Tu presupuesto para la build · <output id="myBuildBudgetLabel" for="myBuildTotalBudget">${totalBudget?market.money(totalBudget):'Sin objetivo'}</output></label><input id="myBuildTotalBudget" type="range" min="1000000" max="18000000" step="250000" value="${totalBudget||1000000}" aria-describedby="myBuildBudgetSummary"><small>De $1 a $18 millones COP · pasos de $250.000. Objetivo de planificación, no precio de venta.</small><button type="button" class="text-button" data-clear-budget>Sin objetivo</button><p id="myBuildBudgetSummary" role="status">${budgetSummary()}</p></div>
      </aside><div class="build-studio-main"><div class="my-build-layout"><div><h3>Tus piezas</h3>${!parts.length?'<div class="my-build-empty"><h3>Tu próxima PC empieza aquí</h3><p>Añade una pieza desde el catálogo, elige abajo o usa una build completa como punto de partida.</p><a href="#builds">Ver builds de referencia →</a></div>':''}
      <div class="my-build-parts">${categories.map(c=>{const p=parts.find(p=>p.category===c.id);const fit=p&&window.FENIXA_FIT.check(p,parts.filter(other=>other.id!==p.id));return `<article class="my-build-row"><div>${p?image(p):'<span class="my-build-placeholder" aria-hidden="true">＋</span>'}</div><div><small>${esc(c.name)}</small><h3>${p?esc(p.name):'Sin elegir'}</h3>${p?`<p>${market.priceText(p)}</p>${window.FENIXA_FIT_STATUS.render(fit,{hasParts:parts.some(other=>other.category!==p.category)})}`:'<p>Puedes elegir una pieza cuando la necesites.</p>'}<div class="my-build-actions"><button type="button" class="secondary-button" data-edit-category="${c.id}">${p?'Cambiar pieza':'Elegir pieza'}</button>${p?`<button type="button" class="my-build-remove" data-remove-part="${p.id}" aria-label="Quitar ${esc(p.name)}">Quitar</button>`:''}</div></div></article>`;}).join('')}</div></div>
      <div class="my-build-workbench" id="myBuildWorkbench"><h3 tabindex="-1" id="myBuildCompareTitle">Elige tu pieza</h3><p>Busca un modelo y añádelo directamente. Si ya tienes uno de esa categoría, podrás cambiarlo aquí.</p><form id="myBuildFilters"><label>Categoría<select name="category">${categories.map(c=>`<option value="${c.id}" ${draft.category===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Buscar modelo<input name="query" type="search" value="${esc(draft.query)}" placeholder="Nombre o referencia"></label><label for="myBuildMax">Máximo por pieza · <output id="myBuildMaxLabel" for="myBuildMax">${draft.max?market.money(Number(draft.max)):'Sin límite'}</output><input id="myBuildMax" name="max" type="number" min="0" max="15000000" step="10000" inputmode="numeric" value="${esc(draft.max||'')}" placeholder="Sin límite"></label><small>Escribe un máximo por pieza o deja el campo vacío. Solo filtra piezas con precio reciente; no es el presupuesto total.</small><label class="my-build-check"><input name="hideConflicts" type="checkbox" ${draft.hideConflicts?'checked':''}> Ocultar conflictos detectados</label><button class="secondary-button" type="submit">Aplicar filtros</button></form><p id="myBuildFiltersPending" role="status" ${filtersPending()?'':'hidden'}>Tienes filtros sin aplicar. Las alternativas todavía corresponden a la búsqueda anterior.</p>
      <label class="my-build-choice">Modelo · ${esc(categories.find(c=>c.id===category).name)} (${choices.length})<select id="myBuildAlternative"><option value="">Selecciona un modelo</option>${choices.map(c=>`<option value="${c.product.id}" ${alternative===c.product.id?'selected':''}>${esc(c.product.name)} · ${c.price===null?'Sin precio reciente':market.money(c.price)}${c.fit.status==='conflict'?' · Conflicto':c.fit.matched?' · Coincidencia parcial':''}</option>`).join('')}</select></label>${!choices.length?'<p role="status">No hay opciones con estos filtros. Amplía el máximo o elimina la búsqueda; el límite de precio excluye piezas sin una oferta reciente.</p>':''}
      ${selected?comparison(current,selected,parts):'<p>Selecciona un modelo para añadirlo o cambiar tu pieza actual.</p>'}</div></div>
      ${recommendations(parts)}
      ${parts.length?`<details class="my-build-shopping"><summary>Opciones de compra de Mi build</summary>${market.plan(ids,byId)}${parts.map(p=>`<article><h3>${esc(p.name)}</h3>${market.purchase(p,parts)}</article>`).join('')}</details>`:''}</div></div>`;
  }
  function comparison(current, selected, parts) {
    const fit=state.check(selected), included=state.ids().includes(selected.id);
    return '<article class="build-piece-preview">'+image(selected)+'<h4>'+esc(selected.name)+'</h4><p>'+market.priceText(selected)+'</p>'+window.FENIXA_FIT_STATUS.render(fit,{hasParts:parts.some(p=>p.category!==selected.category)})+'<button type="button" class="primary-button" data-add-my-build="'+esc(selected.id)+'" '+(included?'disabled':'')+'>'+(included?'Ya está en Mi build':fit.status==='conflict'?'Revisar conflicto':current?'Cambiar por esta pieza':'Añadir a Mi build')+'</button></article>';
  }
  window.addEventListener('fenixa-library-changed',render);
  window.addEventListener('fenixa-build-changed',()=>{pendingClear=false;render();});
  window.addEventListener('fenixa-request-build-import',event=>{
    const next=event.detail?.parts;
    if(!Array.isArray(next)||!next.length||next.some(id=>!byId[id])||new Set(next.map(id=>byId[id].category)).size!==next.length)return;
    if(state.ids().length){pendingImport=next.slice();pendingClear=false;render();}else state.importParts(next);
  });
  window.addEventListener('fenixa-budget-changed',()=>{totalBudget=window.FENIXA_BUDGET.get();budgetSaved=window.FENIXA_BUDGET.saved();render();});
  window.addEventListener('hashchange',()=>{if(location.hash==='#mi-build')render();});
  root.addEventListener('submit',event=>{if(event.target.id!=='myBuildFilters')return;event.preventDefault();draft=readFilters(event.target);({category,query,max,hideConflicts}=draft);render();document.getElementById('myBuildAlternative').focus();});
  root.addEventListener('input',event=>{
    if(event.target.id==='myBuildTotalBudget'){
      totalBudget=Number(event.target.value);
      document.getElementById('myBuildBudgetLabel').textContent=market.money(totalBudget);
      document.getElementById('myBuildBudgetSummary').textContent=budgetSummary();
      return;
    }
    retainFilters(event);
  });
  root.addEventListener('change',event=>{if(event.target.id==='myBuildTotalBudget'){window.FENIXA_BUDGET.set(Number(event.target.value));document.getElementById('myBuildTotalBudget').focus({preventScroll:true});return;}retainFilters(event);if(event.target.id==='myBuildAlternative'){alternative=event.target.value;render();document.getElementById('myBuildAlternative').focus();}});
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-clear-budget]')){window.FENIXA_BUDGET.set(0);return;}
    if(event.target.closest('[data-request-clear]')){pendingClear=true;render();document.querySelector('[data-confirm-clear]')?.focus();return;}
    if(event.target.closest('[data-cancel-clear]')){pendingClear=false;render();document.querySelector('[data-request-clear]')?.focus();return;}
    if(event.target.closest('[data-confirm-clear]')){pendingClear=false;pendingImport=null;alternative='';state.clear();document.getElementById('myBuildTitle').focus();return;}
    const suggestion=event.target.closest('[data-suggest-id]');
    if(suggestion){window.FENIXA_REQUEST_BUILD_ADD(suggestion.dataset.suggestId,suggestion);return;}
    const edit=event.target.closest('[data-edit-category]');
    if(edit){
      const nextCategory=edit.dataset.editCategory;
      if(!state.ids().some(id=>byId[id].category===nextCategory)){window.FENIXA_BROWSE_CATEGORY(nextCategory);return;}
      category=nextCategory;query='';max='';alternative='';draft={category,query,max,hideConflicts};render();document.getElementById('myBuildCompareTitle').focus();return;
    }
    const remove=event.target.closest('[data-remove-part]');if(remove){state.remove(remove.dataset.removePart);document.getElementById('myBuildTitle').focus();return;}
    if(event.target.closest('[data-confirm-import]')){const next=pendingImport;pendingImport=null;state.importParts(next);return;}
    if(event.target.closest('[data-cancel-import]')){pendingImport=null;render();}
  });
  document.addEventListener('click',event=>{
    const copy=event.target.closest('[data-copy-my-build]');
    if(copy){const b=window.FENIXA_BUILD_EDITOR.get(copy.dataset.copyMyBuild);if(!b)return;if(state.ids().length){pendingImport=b.parts.slice();render();}else state.importParts(b.parts);location.hash='mi-build';}
  });
  render();
})();
