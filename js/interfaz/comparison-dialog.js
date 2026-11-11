(() => {
  'use strict';
  const {products}=window.FENIXA_CATALOG;
  const byId=new Map(products.map(p=>[p.id,p]));
  const state=window.FENIXA_MY_BUILD, market=window.FENIXA_MARKET;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const identity=p=>window.FENIXA_SPECS.facts(p).displayName||p.name;
  const dialog=document.createElement('dialog');dialog.className='component-dialog';dialog.id='componentCompareDialog';dialog.setAttribute('aria-labelledby','componentCompareTitle');
  const restore=document.createElement('button');restore.type='button';restore.className='secondary-button compare-restore';restore.hidden=true;restore.textContent='Reabrir comparación';restore.setAttribute('aria-label','Reabrir comparación de componentes');
  document.body.append(dialog);
  // Keep the last comparison beside its catalog, within that route's flow.
  // It must neither overlay Mi build nor become a global header action.
  const catalog=document.querySelector('#catalogo');
  if(catalog)catalog.querySelector('.section-heading').after(restore);
  let left=null,right=null,opener=null,group=null,differencesOnly=false;
  const sameCategory=p=>products.filter(other=>other.category===p.category);
  function polishComparison(ps,result){
    const body=dialog.querySelector('.compare-scroll-body');
    const sections=[['summary','Resumen',body.querySelector('.comparison-radar')],['prices','Precios',body.querySelector('.radar-price-chart')],['specs','Ficha',body.querySelector('.comparison-wrap')],['build','Mi build',body.querySelector('.compare-detail-identities')]];
    const nav=document.createElement('nav');nav.className='compare-section-nav';nav.setAttribute('aria-label','Apartados de la comparación');
    nav.innerHTML=sections.filter(([, ,el])=>el).map(([key,label,el])=>{el.id='compareSection-'+key;el.tabIndex=-1;return `<button type="button" data-compare-section="${key}" aria-controls="compareSection-${key}">${label}</button>`;}).join('');
    body.before(nav);
    const table=body.querySelector('.comparison-table');
    if(table&&result){
      table.querySelectorAll('tbody > tr:last-child > td').forEach((cell,i)=>{
        const source=result.sources[i];if(!source)return;
        const seen=new Set([source.source]);
        const extra=(source.additionalSources||[]).filter(item=>/^https:\/\//.test(item.source||'')&&!seen.has(item.source)&&(seen.add(item.source),true));
        if(extra.length)cell.insertAdjacentHTML('beforeend',`<details><summary>Fuentes adicionales y alcance</summary>${extra.map(item=>`<p><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(item.label||'Fuente adicional')}</a></p>`).join('')}${ps.length===2&&source.scope?`<p>${esc(source.scope)}</p>`:''}</details>`);
      });
      const rows=[...table.querySelectorAll('tbody > tr')].slice(0,result.rows.length);
      rows.forEach((tr,i)=>{const row=result.rows[i];tr.dataset.comparisonEqual=String(!window.FENIXA_RADAR.rowHasDifference(row.values||[row.a,row.b]));});
      const tools=document.createElement('div');tools.className='compare-table-tools';
      tools.innerHTML=`<label><input type="checkbox" data-comparison-differences ${differencesOnly?'checked':''}> Solo diferencias</label><p data-comparison-filter-status role="status"></p>`;
      table.before(tools);applyDifferences();
    }
    const selector=dialog.querySelector('#compareOther');
    if(selector){
      const label=document.createElement('label');label.className='compare-search-field';label.innerHTML='Buscar alternativa<input id="compareSearch" type="search" placeholder="Nombre o modelo" autocomplete="off" aria-controls="compareOther">';
      selector.closest('label').before(label);
      const count=document.createElement('p');count.className='compare-alternative-count';count.id='compareAlternativeCount';count.setAttribute('role','status');count.textContent=`${sameCategory(ps[0]).length-1} alternativas de esta categoría. Todas disponibles, también con datos pendientes.`;
      selector.closest('label').after(count);
      selector.setAttribute('aria-describedby',count.id);
    }
    if(ps.length>2){
      const choices=document.createElement('details');choices.className='compare-group-choices';
      choices.innerHTML=`<summary>Cambiar los modelos comparados</summary><div>${ps.map((p,index)=>`<label>${String.fromCharCode(65+index)} · Selecciona un modelo<select data-compare-model="${index}" aria-label="Modelo ${String.fromCharCode(65+index)}">${sameCategory(p).map(other=>`<option value="${esc(other.id)}" ${other.id===p.id?'selected':''} ${ps.some((chosen,i)=>i!==index&&chosen.id===other.id)?'disabled':''}>${esc(identity(other))}</option>`).join('')}</select></label>`).join('')}</div><p>Todos los modelos de la categoría; cambiar la comparación conserva Mi build.</p>`;
      body.querySelector('.comparison-radar')?.after(choices);
    }
    const details=dialog.querySelectorAll('.compare-detail-identities article');
    dialog.querySelectorAll('.compare-product-heads article').forEach((article,i)=>{
      for(const price of article.querySelectorAll(':scope > strong,:scope > .price-source-note'))details[i]?.append(price);
    });
  }
  function applyDifferences(){
    const rows=[...dialog.querySelectorAll('[data-comparison-equal]')];let hidden=0;
    rows.forEach(row=>{row.hidden=differencesOnly&&row.dataset.comparisonEqual==='true';if(row.hidden)hidden++;});
    const status=dialog.querySelector('[data-comparison-filter-status]');
    if(status)status.textContent=differencesOnly?`${rows.length-hidden} características visibles · ${hidden} iguales ocultas. Los datos pendientes siguen visibles.`:`${rows.length} características · incluye coincidencias y datos pendientes.`;
  }
  function annotateFamilyImages(ps,selector){
    dialog.querySelectorAll(selector).forEach((article,index)=>{
      if(!['family','category'].includes(ps[index]?.imageKind))return;
      const note=document.createElement('small');note.className='comparison-image-note';
      note.textContent=ps[index].imageKind==='category'?'Ilustración · foto pendiente':'Imagen de familia';note.title=ps[index].imageNote;
      article.querySelector('img')?.after(note);
    });
  }
  function render(){
    if(group){renderGroup();return;}
    const a=byId.get(left),b=byId.get(right);if(!a)return;
    const result=b&&window.FENIXA_SPECS.compare(a,b);
    const ps=[a,b];
    // Put documented comparisons first without choosing or replacing a product for the user.
    const alternatives=products.filter(p=>p.category===a.category&&p.id!==a.id).sort((x,y)=>window.FENIXA_RADAR.coverage(a,y).common-window.FENIXA_RADAR.coverage(a,x).common);
    const value=(v,u)=>v===null?'Sin dato verificado':`${esc(v)}${typeof v==='number'&&u?' '+esc(u):''}`;
    const fit=p=>state.check(p);
    dialog.innerHTML=`<header><div><span>FENIXA / COMPARACIÓN</span><h2 id="componentCompareTitle">${b?'Comparación de componentes':`Compara ${esc(identity(a))}`}</h2></div><button type="button" class="secondary-button" data-close-comparison aria-label="Cerrar comparación">Cerrar ✕</button></header><div class="compare-panel-intro"><p>Puedes cerrar este panel y reabrirlo sin perder la comparación. Elegir una alternativa no cambia Mi build hasta que confirmes añadirla.</p><label>Comparar con<select id="compareOther"><option value="">Elige otra pieza de la misma categoría</option>${alternatives.map(p=>`<option value="${p.id}" ${p.id===right?'selected':''}>${esc(p.name)} · ${window.FENIXA_RADAR.coverage(a,p).common}/${window.FENIXA_RADAR.coverage(a,p).total} cifras comunes</option>`).join('')}</select></label></div>
      <div class="compare-product-heads">${ps.map((p,index)=>p?`<article><span class="compare-side-label">${index?'ALTERNATIVA':'PIEZA PRINCIPAL'}</span><img src="${esc(p.image)}" width="160" height="120" alt="${esc(p.name)}"><h3 title="${esc(p.name)}">${window.FENIXA_RADAR.nameControl(identity(p),index)}</h3><p class="compare-summary">${esc(p.summary)}</p><strong>${market.priceText(p)}</strong><small class="price-source-note">${esc(market.priceLabel(p))}</small><button class="primary-button" type="button" data-confirm-part="${p.id}" ${fit(p).status==='conflict'||state.ids().includes(p.id)?'disabled':''}>${state.ids().includes(p.id)?'Ya está en Mi build':fit(p).status==='conflict'?'No se puede añadir: conflicto':state.ids().some(id=>byId.get(id).category===p.category)?'Reemplazar mi pieza por esta':'Añadir esta pieza a Mi build'}</button></article>`:'<article class="compare-awaiting"><p>Elige una segunda pieza para comparar.</p></article>').join('')}</div>
      ${result?`<section class="compare-explanation"><h3>Diferencias que sí podemos explicar</h3><ul>${result.insights.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p>No hay un ganador universal. No tenemos benchmarks comparables de estas dos piezas: no afirmamos diferencias de FPS ni porcentajes de velocidad real.</p></section><div class="comparison-wrap"><table class="comparison-table"><caption>${result.known} características con datos en ambas piezas</caption><thead><tr><th scope="col">Característica</th><th scope="col">${esc(a.name)}</th><th scope="col">${esc(b.name)}</th></tr></thead><tbody>${result.rows.map(r=>`<tr><th scope="row">${esc(r.label)}${r.help?`<small>${esc(r.help)}</small>`:''}</th><td>${value(r.a,r.unit)}</td><td>${value(r.b,r.unit)}</td></tr>`).join('')}<tr><th scope="row">Procedencia</th>${result.sources.map(s=>`<td><a href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">${s.verified?'Especificación del fabricante':'Ficha pendiente de estructurar'} ↗</a></td>`).join('')}</tr></tbody></table></div>`:'<p>Solo comparamos piezas de la misma categoría. Los datos ausentes se indican, no se estiman.</p>'}<p>Compatibilidad parcial: socket, generación de memoria, capacidad y módulos del kit frente a los límites de la placa, formato de placa frente al gabinete y límites de longitud de GPU o altura de disipador cuando existen medidas verificadas. BIOS, QVL, alimentación, conectores y el resto del encaje físico siguen pendientes. Al comparar una sustitución se excluye tu pieza anterior de esa categoría.</p><p role="status" id="comparisonStatus"></p><a href="#mi-build" data-go-build>Ver Mi build →</a>`;
    annotateFamilyImages(ps,'.compare-product-heads article');
    const body=document.createElement('div');body.className='compare-scroll-body';body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label','Radar, precios y detalles de los componentes');
    dialog.querySelector('.compare-product-heads').after(body);
    while(body.nextSibling)body.append(body.nextSibling);
    if(b){
      body.insertAdjacentHTML('afterbegin',window.FENIXA_RADAR.component(a,b)+window.FENIXA_RADAR.prices(a,b));
      const referenceWarnings=(result?.sources||[]).map((s,i)=>s.warning?`<p class="laptop-radar-method" role="note"><strong>${i?'B':'A'} · Referencia por confirmar:</strong> ${esc(s.warning)}</p>`:'').join('');
      if(referenceWarnings)body.querySelector('.laptop-radar-layout')?.insertAdjacentHTML('afterend',referenceWarnings);
      body.querySelector('.comparison-radar')?.after(dialog.querySelector('.compare-panel-intro'));
    }
    const explanation=body.querySelector('.compare-explanation');
    if(explanation)explanation.innerHTML='<details><summary>Ventajas, límites y diferencias explicadas</summary>'+explanation.innerHTML+'</details>';
    const table=body.querySelector('.comparison-wrap');
    if(table)table.innerHTML='<details><summary>Ficha técnica completa y fuentes</summary>'+table.innerHTML+'</details>';
    body.insertAdjacentHTML('beforeend',`<div class="compare-detail-identities">${ps.filter(Boolean).map(p=>`<article><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p>${window.FENIXA_FIT_STATUS.render(fit(p),{hasParts:state.ids().some(id=>byId.get(id).category!==p.category)})}</article>`).join('')}</div>`);
    const detailIdentities=body.querySelectorAll('.compare-detail-identities article');
    dialog.querySelectorAll('.compare-product-heads article').forEach((identity,i)=>{
      const reference=window.FENIXA_SPECS.facts(ps[i]);
      if(reference.identityConflict){
        const notice=document.createElement('small');notice.className='compare-identity-warning';notice.textContent='Modelo por confirmar';notice.title=reference.warning;
        identity.querySelector('h3')?.after(notice);
      }
      const choose=identity.querySelector('[data-confirm-part]');
      if(choose&&detailIdentities[i])detailIdentities[i].append(choose);
    });
    dialog.querySelectorAll('.compare-side-label').forEach((label,i)=>label.textContent=`${i?'B · ALTERNATIVA':'A · PIEZA PRINCIPAL'}`);
    polishComparison(ps.filter(Boolean),result);
  }
  function renderGroup(){
    const ps=group.map(id=>byId.get(id)), result=window.FENIXA_SPECS.compareMany(ps);
    const fit=p=>state.check(p);
    const value=(v,u)=>v===null?'Sin dato verificado':esc(Array.isArray(v)?v.join(' / '):v)+(typeof v==='number'&&u?' '+esc(u):'');
    dialog.classList.add('multi-comparison');
    dialog.innerHTML=`<header><div><span>FENIXA / COMPARACIÓN</span><h2 id="componentCompareTitle">${ps.length} componentes, lado a lado</h2></div><button type="button" class="secondary-button" data-close-comparison aria-label="Cerrar comparación">Cerrar ✕</button></header><div class="compare-scroll-body" tabindex="0" role="region" aria-label="Especificaciones, precios y fuentes de todos los componentes"><div class="multi-product-heads">${ps.map((p,i)=>`<article><span class="laptop-series-key series-${i}">${String.fromCharCode(65+i)}</span><img src="${esc(p.image)}" alt="${esc(p.name)}" width="160" height="140"><h3>${window.FENIXA_RADAR.nameControl(identity(p),i)}</h3><strong>${market.priceText(p)}</strong><small>${esc(market.priceLabel(p))}</small></article>`).join('')}</div>${window.FENIXA_RADAR.pricesMany(ps)}${window.FENIXA_RADAR.componentMany(ps)}<details class="multi-spec-details"><summary>Ficha técnica completa · ${result.known} datos comunes</summary><div class="comparison-wrap"><table class="comparison-table"><caption>Datos publicados por modelo; pendientes sin estimar</caption><thead><tr><th scope="col">Característica</th>${ps.map((p,i)=>`<th scope="col">${String.fromCharCode(65+i)} · ${esc(identity(p))}</th>`).join('')}</tr></thead><tbody>${result.rows.map(row=>`<tr><th scope="row">${esc(row.label)}${row.help?`<small>${esc(row.help)}</small>`:''}</th>${row.values.map(v=>`<td>${value(v,row.unit)}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Fuente y alcance</th>${result.sources.map(s=>`<td><a href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">Ficha de referencia ↗</a><small>${esc(s.checkedAt||'Fecha pendiente')}${s.warning?' · '+esc(s.warning):''}${s.scope?' · '+esc(s.scope):''}</small></td>`).join('')}</tr></tbody></table></div></details><details><summary>Compatibilidad y selección en Mi build</summary><p>Comparar no modifica tu build. BIOS, QVL, conectores, fuente y montaje requieren revisión; especificaciones no son benchmarks.</p><div class="compare-detail-identities">${ps.map(p=>`<article><h3>${esc(identity(p))}</h3><p>${esc(p.summary)}</p>${window.FENIXA_FIT_STATUS.render(fit(p),{hasParts:state.ids().some(id=>byId.get(id).category!==p.category)})}<button type="button" class="primary-button" data-confirm-part="${p.id}" ${fit(p).status==='conflict'||state.ids().includes(p.id)?'disabled':''}>${state.ids().includes(p.id)?'Ya está en Mi build':state.ids().some(id=>byId.get(id).category===p.category)?'Reemplazar por esta pieza':'Añadir a Mi build'}</button></article>`).join('')}</div></details><p role="status" id="comparisonStatus"></p><a href="#mi-build" data-go-build>Ver Mi build →</a></div>`;
    // Keep identities compact; full prices/dates remain in the comparison's
    // detail cards and the price chart, not duplicated above the first radar.
    const details=dialog.querySelectorAll('.compare-detail-identities article');
    dialog.querySelectorAll('.multi-product-heads article').forEach((article,index)=>{
      if(!details[index])return;
      for(const item of article.querySelectorAll(':scope > strong,:scope > small'))details[index].append(item);
    });
    annotateFamilyImages(ps,'.multi-product-heads article');
    const radar=dialog.querySelector('.comparison-radar');
    if(radar){
      dialog.querySelector('.multi-product-heads').after(radar);
      // Full identities already precede the chart. Preserve the duplicate
      // interactive legend below the figure so four long SKUs cannot bury it.
      radar.querySelector('.laptop-radar').after(radar.querySelector('.laptop-radar-legend'));
    }
    polishComparison(ps,result);
  }
  function openMany(ids){
    const unique=[...new Set(ids)];
    if(unique.length<2||unique.length>4||unique.some(id=>!byId.has(id))||unique.some(id=>byId.get(id).category!==byId.get(unique[0]).category))return;
    if(unique.length===2){open(...unique);return;}
    group=unique;left=unique[0];right=unique[1];opener=document.activeElement;render();restore.hidden=true;
    if(!dialog.open)dialog.show();dialog.querySelector('[data-close-comparison]').focus();
  }
  function open(a,b){if(!byId.has(a))return;group=null;dialog.classList.remove('multi-comparison');left=a;right=byId.has(b)&&byId.get(b).category===byId.get(a).category&&a!==b?b:null;opener=document.activeElement;render();restore.hidden=true;if(!dialog.open)dialog.show();dialog.querySelector('[data-close-comparison]').focus();}
  dialog.addEventListener('input',e=>{
    if(e.target.id!=='compareSearch')return;
    const search=e.target.value.trim().toLocaleLowerCase('es');
    const select=dialog.querySelector('#compareOther');let count=0;
    for(const option of select.options){if(!option.value)continue;option.hidden=option.value!==right&&!option.textContent.toLocaleLowerCase('es').includes(search);if(!option.hidden)count++;}
    dialog.querySelector('#compareAlternativeCount').textContent=`${count} alternativas visibles. La selección actual se conserva.`;
  });
  dialog.addEventListener('change',e=>{
    if(e.target.matches('[data-comparison-differences]')){differencesOnly=e.target.checked;applyDifferences();return;}
    if(e.target.matches('[data-compare-model]')){const ids=[...group];ids[Number(e.target.dataset.compareModel)]=e.target.value;group=ids;left=ids[0];right=ids[1];const index=e.target.dataset.compareModel;render();dialog.querySelector('.compare-group-choices').open=true;dialog.querySelector(`[data-compare-model="${index}"]`)?.focus({preventScroll:true});return;}
    if(e.target.id==='compareOther'){right=e.target.value;render();dialog.querySelector('#compareOther').focus({preventScroll:true});}
  });
  dialog.addEventListener('click',e=>{
    const jump=e.target.closest('[data-compare-section]');
    if(jump){
      const section=dialog.querySelector('#compareSection-'+jump.dataset.compareSection);
      if(section){const own=section.querySelector(':scope > details');if(own)own.open=true;let parent=section.parentElement;while(parent&&parent!==dialog){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}section.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:'instant'});}
      return;
    }
    if(e.target.closest('[data-close-comparison],[data-go-build]')){dialog.close();return;}
    const button=e.target.closest('[data-confirm-part]');if(!button)return;
    const ok=state.add(button.dataset.confirmPart);render();
    dialog.querySelector('#comparisonStatus').textContent=ok?(state.saved()?'Selección actualizada y guardada en este navegador.':'Selección actualizada, pero no se pudo guardar en este navegador.'):'No se añadió: hay un conflicto con Mi build.';
    dialog.querySelector('[data-close-comparison]').focus();
  });
  dialog.addEventListener('close',()=>{restore.hidden=!left;if(left){const names=group?group.map(id=>identity(byId.get(id))).join(' vs '):`${identity(byId.get(left))}${right?' vs '+identity(byId.get(right)):''}`;restore.textContent='Reabrir última comparación';restore.title=names;restore.setAttribute('aria-label',`Reabrir comparación: ${names}`);}if(opener?.isConnected)opener.focus();});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.open){e.preventDefault();dialog.close();}});
  restore.addEventListener('click',()=>group?openMany(group):open(left,right));
  window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
  window.FENIXA_COMPARE={open,openMany};
  // Explicit comparison links open the view only; they never select parts for Mi build.
  if(typeof location!=='undefined'&&location.hash==='#componentes'){
    const ids=(new URLSearchParams(location.search).get('comparar')||'').split(',');
    if(ids.length>=2&&ids.length<=4)openMany(ids);
  }
})();
