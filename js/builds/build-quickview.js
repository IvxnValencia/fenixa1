(() => {
  'use strict';
  const state=window.FENIXA_MY_BUILD, market=window.FENIXA_MARKET;
  const byId=new Map(window.FENIXA_CATALOG.products.map(p=>[p.id,p]));
  const shortName=p=>window.FENIXA_SHORT_NAME?window.FENIXA_SHORT_NAME(p):p.name;
  const refLabel=p=>{const o=market.fixed(p),t=Date.parse(o?.checkedAt);return o?'Ref. '+(Number.isFinite(t)?new Date(t).toLocaleDateString('es-CO',{timeZone:'America/Bogota',day:'numeric',month:'numeric'}).split('/').map(x=>x.padStart(2,'0')).join('/'):'—'):'Sin precio';};
  const categories=new Map(window.FENIXA_CATALOG.categories.map(c=>[c.id,c.name]));
  const $=id=>document.getElementById(id);
  const dock=$('buildQuickDock'), toggle=$('buildQuickToggle'), body=$('buildQuickBody'), dialog=$('buildAddDialog');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let pending=null, opener=null;
  function setExpanded(open, focus=false) {
    body.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    if(open)for(const [button,content] of [['compareTrayToggle','compareTrayBody'],['laptopQueueToggle','laptopQueueBody']]) {
      $(button)?.setAttribute('aria-expanded','false');
      if($(content))$(content).hidden=true;
    }
    if(focus)toggle.focus({preventScroll:true});
  }
  function notice(message, shortMessage=message) {
    $('buildAddStatus').textContent=message;
    if(typeof showToast==='function')showToast(shortMessage);
  }
  function render() {
    const parts=state.ids().map(id=>byId.get(id)), known=parts.map(p=>market.price(p)).filter(v=>v!==null);
    $('buildQuickCount').textContent=`${parts.length} ${parts.length===1?'pieza':'piezas'}`;
    $('buildQuickList').innerHTML=parts.length?parts.map(p=>`<article class="build-quick-item"><img src="${esc(p.image)}" alt="" width="48" height="48" loading="lazy"><div><small>${esc(categories.get(p.category))}</small><strong title="${esc(p.name)}">${esc(shortName(p))}</strong><span>${esc(market.priceText(p))}</span><small title="${esc(market.priceLabel(p))}">${esc(refLabel(p))}</small></div><button type="button" class="dock-remove" data-quick-remove="${esc(p.id)}" aria-label="Quitar ${esc(p.name)} de Mi build">×</button></article>`).join(''):'<p>Tu build está vacía. Añade piezas desde el catálogo; comparar no las añade.</p>';
    $('buildQuickSubtotal').textContent=known.length?`Subtotal ${known.length<parts.length?'parcial ':''}de precios recientes: ${market.money(known.reduce((s,v)=>s+v,0))} · ${known.length}/${parts.length} piezas. No incluye envío ni montaje.`:'Sin subtotal de precios recientes. Los importes históricos no se suman como actuales.';
    $('buildQuickSave').textContent=state.saved()?'Guardado en este navegador · compatibilidad parcial, no montaje garantizado.':'No se pudo guardar. Las piezas solo se conservan en esta pestaña.';
  }
  function ask(product, previous, fit, trigger) {
    pending={id:product.id,previousId:previous?.id||null};opener=trigger;
    const blocked=fit.status==='conflict';
    const category={cpu:'procesador',board:'placa madre',ram:'memoria RAM',gpu:'tarjeta gráfica',storage:'almacenamiento',power:'fuente',case:'gabinete',cooler:'refrigeración',fan:'ventilador',setup:'periférico'}[product.category]||'pieza';
    const picture=(p,label,isNew)=>'<article class="build-sheet-product'+(isNew?' is-new':'')+'"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" width="64" height="64"><div><small>'+label+'</small><h3 title="'+esc(p.name)+'">'+esc(shortName(p))+'</h3>'+(['category','family'].includes(p.imageKind)?'<span class="build-sheet-photo-note">'+(p.imageKind==='category'?'Ilustración de categoría':'Imagen de familia')+'</span>':'')+'</div></article>';
    dialog.innerHTML='<header class="build-sheet-header"><div><span class="eyebrow">MI BUILD</span><h2 id="buildAddTitle">'+(blocked?'Revisa esta pieza':previous?'Cambiar '+category:'Añadir '+category)+'</h2></div><button class="build-sheet-close" type="button" data-cancel-build-add aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><p class="build-sheet-intro">'+(blocked?'Hay un conflicto con tu selección actual.':previous?'Tu selección se actualizará al tocar Cambiar pieza.':'Incorpora esta pieza a tu configuración.')+'</p><div class="build-sheet-selection">'+(previous?picture(previous,'ACTUAL',false):'')+picture(product,previous?'NUEVA ELECCIÓN':'TU ELECCIÓN',true)+'</div>'+window.FENIXA_FIT_STATUS.render(fit,{hasParts:state.ids().some(id=>byId.get(id).category!==product.category)})+'<footer class="build-sheet-footer'+(blocked?' is-blocked':'')+'"><button class="secondary-button" type="button" data-cancel-build-add>Cancelar</button>'+(blocked?'':'<button class="primary-button" type="button" data-confirm-build-add>Cambiar pieza</button>')+'</footer>';
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('[data-cancel-build-add]').focus();
  }
  function requestAdd(id, trigger) {
    const product=byId.get(id);if(!product)return;
    if(state.ids().includes(id)){notice(`${shortName(product)} ya está en Mi build.`);return;}
    const previous=state.ids().map(id=>byId.get(id)).find(p=>p.category===product.category), fit=state.check(product);
    if(previous||fit.status==='conflict'){ask(product,previous,fit,trigger);return;}
    if(state.add(id)) {
      render();notice(`${shortName(product)} añadida a Mi build. ${state.saved()?'Guardada en este navegador.':'No se pudo guardar.'} ${fit.label}: ${fit.reason}`,state.saved()?'Pieza añadida a Mi build. Revisión de compatibilidad parcial.':'Pieza añadida, pero no se pudo guardar en este navegador.');
    }else notice('No se añadió: revisa los conflictos con tus piezas.');
  }
  window.FENIXA_REQUEST_BUILD_ADD = requestAdd;
  toggle.addEventListener('click',()=>setExpanded(body.hidden));
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();setExpanded(false,true);}});
  dock.addEventListener('click',e=>{
    const remove=e.target.closest('[data-quick-remove]');
    if(remove){const p=byId.get(remove.dataset.quickRemove);state.remove(p.id);render();notice(`${shortName(p)} retirada de Mi build.`,'Pieza retirada de Mi build.');toggle.focus({preventScroll:true});}
    if(e.target.closest('a'))setExpanded(false);
  });
  dialog.addEventListener('click',e=>{
    if(e.target.closest('[data-cancel-build-add]')){dialog.close();return;}
    if(!e.target.closest('[data-confirm-build-add]')||!pending)return;
    const product=byId.get(pending.id), previous=state.ids().map(id=>byId.get(id)).find(p=>p.category===product.category);
    if((previous?.id||null)!==pending.previousId){requestAdd(product.id,opener);return;}
    if(!state.add(product.id)){ask(product,previous,state.check(product),opener);return;}
    render();notice(`${shortName(product)} reemplazó la pieza anterior. ${state.saved()?'Guardada en este navegador.':'No se pudo guardar.'}`,state.saved()?'Reemplazo confirmado en Mi build.':'Reemplazo confirmado, pero no se pudo guardar.');dialog.close();
  });
  dialog.addEventListener('close',()=>{pending=null;const target=opener?.isConnected?opener:document.getElementById('myBuildTitle')||toggle;target.focus({preventScroll:true});opener=null;});
  document.addEventListener('click',e=>{
    const add=e.target.closest('[data-add-my-build]');
    if(add){requestAdd(add.dataset.addMyBuild,add);return;}
    if(e.target.closest('.comparison-dock-toggle'))setExpanded(false);
  });
  window.addEventListener('fenixa-build-changed',render);
  window.addEventListener('hashchange',()=>{setExpanded(false);if(dialog.open)dialog.close();});
  // Both floating controls share a vertical stack, including on low/mobile windows.
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{
    document.body.style.setProperty('--build-quick-height',`${dock.getBoundingClientRect().height}px`);
  }).observe(dock);
  render();
})();
