(() => {
  'use strict';
  const $=id=>document.getElementById(id), rows=window.FENIXA_LAPTOPS;
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={estudio:'Estudio',trabajo:'Trabajo',gaming:'Gaming',creativo:'Creación'};
  const referenceKind=p=>p.referenceKind||'Configuración variable';
  const regionLabel=p=>p.configurationId==='catalog'?referenceKind(p):p.region;
  const imageNote=p=>p.imageKind==='category'||p.imageKind==='official'?p.imageNote:'Foto oficial de familia; no certifica el teclado, acabado o etiqueta de este SKU.';
  const imageAlt=p=>p.imageKind==='category'?'Ilustración de portátil; fotografía de '+p.model+' pendiente':'Foto oficial de la familia '+p.name;
  const checkedOn=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?value.split('-').reverse().join('/'):'fecha no registrada';
  const selected=new Set();
  const quotes=new Map(), visual=window.FENIXA_LAPTOP_COMPARE;
  const versions=new Map();
  const comparisonRows=()=>rows.filter(p=>selected.has(p.id)).map(p=>visual.resolve(p,versions.get(p.id)));
  let comparisonView='all';
  let comparisonOpen=false;
  const comparisonSpecs=p=>['Procesador','Gráficos','Pantalla','Memoria y almacenamiento'].map(label=>{
    const pattern={Procesador:/procesador/i,Gráficos:/gráficos/i,Pantalla:/pantalla/i,'Memoria y almacenamiento':/memoria|ram/i}[label];
    const match=p.specs.find(([name])=>pattern.test(name));
    return [label,match?match[1]:'No registrado en esta referencia; consulta el SKU.'];
  });
  const versionSelector=(p,i)=>{
    const list=visual.configurations[p.id];
    return list?`<label class="laptop-version-field" for="laptopVersion-${esc(p.id)}"><span>Versión ${String.fromCharCode(65+i)}</span><select id="laptopVersion-${esc(p.id)}" data-laptop-version="${esc(p.id)}" aria-label="Versión ${String.fromCharCode(65+i)} de ${esc(p.name)}">${list.map(c=>`<option value="${esc(c.id)}" title="${esc(c.model+' · '+c.label)}"${c.id===p.configurationId?' selected':''}>${esc(c.label.split(' · ').slice(0,2).join(' · '))}</option>`).join('')}</select></label>`:'';
  };
  const identity=(p,i)=>`<img src="${esc(p.image)}" alt="${esc(imageAlt(p))}" width="800" height="800" loading="lazy" decoding="async"><h4>${window.FENIXA_RADAR.nameControl(p.name,i)}</h4><strong>${esc(p.model)}</strong><small>${esc(regionLabel(p))}</small>${p.imageKind==='category'?'<small>Ilustración · foto pendiente</small>':''}`;
  function renderComparison(message='') {
    const chosen=comparisonRows();
    $('laptopCompareToolbar').hidden=chosen.length===0;
    $('laptopQueueCount').textContent=`${chosen.length}/4`;
    $('laptopQueueList').innerHTML=chosen.map(p=>`<div class="comparison-dock-item"><img src="${esc(p.image)}" alt="" width="56" height="56"><span>${esc(p.name)}<br><small>${esc(p.model)}</small></span><button type="button" class="dock-remove" data-laptop-queue-remove="${esc(p.id)}" aria-label="Quitar ${esc(p.name)} de comparaciones">×</button></div>`).join('');
    $('laptopCompareToggle').disabled=chosen.length<2;
    if(!chosen.length){$('laptopQueueBody').hidden=true;$('laptopQueueToggle').setAttribute('aria-expanded','false');}
    $('laptopCompareStatus').textContent=message||`${chosen.length}/4 seleccionadas: ${chosen.map(p=>p.name+' '+p.model).join(' y ')}. Selección conservada al cerrar y al filtrar.`;
    $('laptopCompareToggle').setAttribute('aria-expanded',String(comparisonOpen&&chosen.length>0));
    $('laptopCompareToggle').textContent=comparisonOpen?'Ocultar':'Comparar';
    $('laptopComparison').hidden=!comparisonOpen||chosen.length===0;
    const views={all:'Radar y resumen',speed:'Velocidad',capacity:'Capacidad',screen:'Pantalla',price:'Precio y valor'};
    $('laptopComparisonGrid').innerHTML=`<div class="laptop-compare-heads">${chosen.map((p,i)=>`<article class="laptop-compare-identity"><span class="laptop-series-key series-${i}">Laptop ${String.fromCharCode(65+i)}${p.retired?' · retirado':''}</span>${identity(p,i)}${versionSelector(p,i)}</article>`).join('')}${chosen.length===1?'<p class="laptop-compare-placeholder">Elige una segunda laptop para comparar. No se añade nada a Mi build.</p>':''}</div><div class="laptop-comparison-body" tabindex="0" role="region" aria-label="Gráficos y detalles de las laptops seleccionadas"><div class="laptop-chart-controls" aria-label="Tipo de comparación">${Object.entries(views).map(([key,label])=>`<button type="button" class="secondary-button" data-laptop-view="${key}" aria-pressed="${comparisonView===key}">${label}</button>`).join('')}</div><p class="laptop-chart-intro">${comparisonView==='price'?'Compara las cotizaciones de la misma configuración y región.':comparisonView==='speed'?'Frecuencias y tasas declaradas, no velocidad real ni FPS. Toca cada gráfico para ver sus límites.':'Se compara la versión indicada arriba. Cambia la versión para actualizar sus cifras juntas; cada eje tiene su propia unidad, no una puntuación.'}</p>${comparisonView==='price'?`<div class="laptop-quote-fields">${chosen.map((p,i)=>`<label for="laptopQuote-${esc(p.id)}">${String.fromCharCode(65+i)} · ${esc(p.model)} · Cotización en COP<input id="laptopQuote-${esc(p.id)}" data-laptop-quote="${esc(p.id)}" data-laptop-quote-key="${esc(visual.quoteKey(p))}" type="number" inputmode="numeric" min="1" max="100000000" step="1" placeholder="Precio por confirmar" value="${esc(quotes.get(visual.quoteKey(p))||'')}" aria-describedby="laptopQuoteHelp"></label>`).join('')}</div><p id="laptopQuoteHelp" class="laptop-quote-help">Opcional: ingresa importes enteros sin separadores. Cotizaciones manuales separadas por versión, conservadas mientras esta página siga abierta; no cambian el catálogo ni se envían a una tienda. Confirma CPU, RAM, SSD, región y sufijo.</p><div data-laptop-price-results aria-live="polite">${visual.renderPrices(chosen,quotes)}</div>`:visual.renderMetrics(chosen,comparisonView)}<div class="laptop-compare-descriptions">${chosen.map(p=>`<article class="laptop-compare-column"><p>${esc(p.reason)}</p><details class="laptop-reference-details"><summary>Ficha y límites · ${esc(p.model)}</summary><p>${esc(p.comparisonFacts?.scope||'Ficha numérica pendiente.')} Región: ${esc(p.region)}. ${esc(imageNote(p))}</p><dl>${comparisonSpecs(p).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><h4>Límites de esta referencia</h4><ul>${p.limits.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><p>Precio y stock local pendientes. Ficha consultada el ${esc(checkedOn(p.checkedAt))}.</p></details><a class="source-link" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Fuente: ${esc(p.model)}</a><button type="button" class="secondary-button" data-laptop-remove="${esc(p.id)}">Quitar ${esc(p.model)}</button></article>`).join('')}</div></div>`;
    if(chosen.length>=2){
      const content=$('laptopComparisonGrid').querySelector('.laptop-comparison-body');
      content?.insertAdjacentHTML('afterbegin',visual.renderRadar(chosen));
      const layout=content?.querySelector('.laptop-radar-layout');
      const legend=content?.querySelector('.laptop-radar-legend');
      if(layout&&legend&&layout.insertBefore)layout.insertBefore(legend,layout.querySelector('.laptop-radar-values'));
    }
  }
  function revealAxis(key) {
    if(!visual.metrics.some(m=>m.key===key))return;
    const card=$('laptopComparisonGrid').querySelector(`[data-radar-detail="${key}"]`);
    if(!card)return;
    card.open=true;card.scrollIntoView({block:'nearest'});
    card.querySelector('summary')?.focus({preventScroll:true});
  }
  function render() {
    const use=$('laptopUse').value, query=$('laptopSearch').value.trim().toLocaleLowerCase('es');
    const visible=rows.filter(p=>(use==='all'||p.uses.includes(use))&&`${p.name} ${p.model}`.toLocaleLowerCase('es').includes(query));
    $('laptopCount').textContent=visible.length+(visible.length===1?' modelo':' modelos')+' de referencia · revisa configuración y región';
    $('laptopEmpty').hidden=visible.length>0;
    if(!visible.length)$('laptopEmpty').innerHTML='No hay laptops que coincidan con este uso y modelo. Prueba un nombre más corto o vuelve a explorar todas las referencias. <button type="button" class="secondary-button" data-clear-laptop-filters>Limpiar filtros de laptops</button>';
    const page=window.FENIXA_PAGER.paginate('laptops',visible,{anchor:$('laptopGrid'),signature:JSON.stringify([use,query]),onChange:render,label:'Páginas de laptops',scrollTarget:$('laptops')});
    $('laptopGrid').innerHTML=page.items.map(p=>`<article class="laptop-card fx-card" data-laptop-id="${esc(p.id)}">
      <div class="catalog-product-heading"><span class="market-category">${esc(labels[p.uses[0]]||'Laptop')} · ${esc(p.model)}</span><h3>${esc(p.name)}</h3></div>
      <button type="button" class="catalog-photo fx-open" data-open-laptop="${esc(p.id)}" aria-label="Ver ficha de ${esc(p.name)}"><img class="product-image" src="${esc(window.FENIXA_THUMB?window.FENIXA_THUMB(p.image):p.image)}" alt="${esc(imageAlt(p))}" width="800" height="800" loading="lazy" decoding="async"></button>
      <p class="catalog-brief" title="${esc(p.specs.filter(([label])=>/procesador|gráficos/i.test(label)).map(([,value])=>value).join(' · '))}">${esc(p.specs.filter(([label])=>/procesador|gráficos/i.test(label)).map(([,value])=>value).join(' · '))}</p>
      <div class="catalog-price-line"><strong class="market-price">Precio por confirmar</strong><span class="estimate-label">Sin oferta verificada en COP</span></div>
      <div class="catalog-card-actions"><button type="button" class="compare-trigger" data-laptop-compare="${esc(p.id)}" aria-pressed="${selected.has(p.id)}">${selected.has(p.id)?'Quitar':'Comparar'}</button><button type="button" class="secondary-button" data-open-laptop="${esc(p.id)}">Ver ficha</button></div>
    </article>`).join('');
    renderComparison();
  }
  $('laptopGrid').addEventListener('click',event=>{
    const button=event.target.closest('[data-laptop-compare]');
    if(!button)return;
    const id=button.dataset.laptopCompare;
    if(!rows.some(p=>p.id===id))return;
    if(selected.has(id))selected.delete(id);
    else {
      if(selected.size>=4){renderComparison('Ya hay cuatro laptops. Quita una antes de elegir otra; no reemplazamos tu selección automáticamente.');return;}
      selected.add(id);
      comparisonOpen=false;
    }
    if(!selected.size)comparisonOpen=false;
    render();
  });
  $('laptopComparisonGrid').addEventListener('click',event=>{
    const axis=event.target.closest('[data-radar-axis]');
    if(axis?.dataset.radarAxis){revealAxis(axis.dataset.radarAxis);return;}
    const view=event.target.closest('[data-laptop-view]');
    if(view&&['all','speed','capacity','screen','price'].includes(view.dataset.laptopView)){
      comparisonView=view.dataset.laptopView;renderComparison();
      $('laptopComparisonGrid').querySelector(`[data-laptop-view="${comparisonView}"]`)?.focus();return;
    }
    const button=event.target.closest('[data-laptop-remove]');
    if(!button)return;
    selected.delete(button.dataset.laptopRemove);
    if(!selected.size)comparisonOpen=false;
    render();
  });
  $('laptopComparisonGrid').addEventListener('keydown',event=>{
    const axis=event.target.closest('[data-radar-axis]');
    if(axis&&(event.key==='Enter'||event.key===' ')){event.preventDefault();revealAxis(axis.dataset.radarAxis);}
  });
  $('laptopComparisonGrid').addEventListener('change',event=>{
    const select=event.target.closest('[data-laptop-version]');
    if(!select||!selected.has(select.dataset.laptopVersion))return;
    if(!visual.configurations[select.dataset.laptopVersion]?.some(c=>c.id===select.value))return;
    versions.set(select.dataset.laptopVersion,select.value);
    renderComparison();
    $('laptopComparisonGrid').querySelector(`#laptopVersion-${select.dataset.laptopVersion}`)?.focus({preventScroll:true});
  });
  $('laptopComparisonGrid').addEventListener('input',event=>{
    const input=event.target.closest('[data-laptop-quote]');
    if(!input||!selected.has(input.dataset.laptopQuote))return;
    const chosen=comparisonRows(),p=chosen.find(p=>p.id===input.dataset.laptopQuote);
    const key=visual.quoteKey(p);
    if(input.dataset.laptopQuoteKey!==key)return;
    quotes.set(key,input.value);
    input.setAttribute('aria-invalid',String(Boolean(input.value)&&visual.priceNumber(input.value)===null));
    const result=$('laptopComparisonGrid').querySelector('[data-laptop-price-results]');
    if(result)result.innerHTML=visual.renderPrices(chosen,quotes);
  });
  $('laptopQueueToggle').addEventListener('click',()=>{const expanded=$('laptopQueueBody').hidden;$('laptopQueueBody').hidden=!expanded;$('laptopQueueToggle').setAttribute('aria-expanded',String(expanded));});
  $('laptopCompareToolbar').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();$('laptopQueueBody').hidden=true;$('laptopQueueToggle').setAttribute('aria-expanded','false');$('laptopQueueToggle').focus();}});
  $('laptopQueueList').addEventListener('click',event=>{
    const button=event.target.closest('[data-laptop-queue-remove]');if(!button)return;
    selected.delete(button.dataset.laptopQueueRemove);comparisonOpen=false;render();
    if(selected.size)$('laptopQueueToggle').focus();else $('laptopSearch').focus({preventScroll:true});
  });
  $('laptopCompareToggle').addEventListener('click',()=>{if(selected.size<2)return;comparisonOpen=!comparisonOpen;renderComparison();if(comparisonOpen){$('laptopQueueBody').hidden=true;$('laptopQueueToggle').setAttribute('aria-expanded','false');$('laptopComparison').scrollIntoView({block:'start'});$('laptopCompareClose').focus({preventScroll:true});}});
  $('laptopCompareClose').addEventListener('click',()=>{comparisonOpen=false;renderComparison();$('laptopQueueToggle').focus();});
  $('laptopCompareClear').addEventListener('click',()=>{selected.clear();quotes.clear();versions.clear();comparisonView='all';comparisonOpen=false;render();$('laptopSearch').focus({preventScroll:true});});
  $('laptopUse').addEventListener('change',render);
  $('laptopSearch').addEventListener('input',render);
  $('laptopEmpty').addEventListener('click',event=>{if(!event.target.closest('[data-clear-laptop-filters]'))return;$('laptopUse').value='all';$('laptopSearch').value='';render();$('laptopSearch').focus({preventScroll:true});});
  render();
})();
