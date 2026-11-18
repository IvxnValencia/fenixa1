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
  // «Cambiar pieza» / «Elegir pieza» desde Mi build: al confirmar la pieza de esa categoría se vuelve a Mi build.
  const RETURN_KEY='fenixa-build-return';
  const returning={
    get(){try{return JSON.parse(sessionStorage.getItem(RETURN_KEY)||'null');}catch{return null;}},
    start(category){try{sessionStorage.setItem(RETURN_KEY,JSON.stringify({category,at:Date.now()}));}catch{}banner();},
    clear(){try{sessionStorage.removeItem(RETURN_KEY);}catch{}banner();}
  };
  function banner(){
    const target=returning.get(),catalog=$('componentes');if(!catalog)return;
    let bar=$('buildReturnBar');
    if(!target||!/^#componentes/.test(location.hash)){if(bar)bar.hidden=true;return;}
    if(!bar){bar=document.createElement('div');bar.id='buildReturnBar';bar.className='build-return-bar';bar.setAttribute('role','status');catalog.prepend(bar);}
    const name={cpu:'procesador',board:'placa madre',ram:'memoria RAM',gpu:'tarjeta gráfica',storage:'almacenamiento',power:'fuente',case:'gabinete',cooler:'refrigeración',fan:'ventilador',setup:'periférico'}[target.category]||'pieza';
    bar.innerHTML=`<span>Eligiendo <strong>${esc(name)}</strong> para Mi build. Al confirmar la pieza volverás a tu build.</span><a class="secondary-button" href="#mi-build" data-build-return-cancel>Volver sin cambiar</a>`;
    bar.hidden=false;
  }
  function returnIfPending(product){
    const target=returning.get();
    if(!target||target.category!==product.category)return false;
    returning.clear();
    location.hash='mi-build';
    // Mi build se vuelve a pintar al cambiar de ruta: el foco va a la pieza recién elegida.
    setTimeout(()=>{const card=document.querySelector(`#mi-build [data-remove-part="${CSS.escape(product.id)}"]`)?.closest('.my-build-row');if(card){card.classList.add('is-just-changed');card.scrollIntoView({block:'center',behavior:'instant'});card.querySelector('[data-edit-category]')?.focus({preventScroll:true});setTimeout(()=>card.classList.remove('is-just-changed'),2400);}},60);
    return true;
  }
  window.FENIXA_BUILD_RETURN=returning;
  function setExpanded(open, focus=false) {
    body.hidden=!open;
    body.inert=!open;
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
    const count = `${parts.length} ${parts.length===1?'pieza':'piezas'}`;
    if ($('buildQuickCount').textContent !== count) window.FENIXA_MOTION?.pulse($('buildQuickCount'));
    $('buildQuickCount').textContent = count;
    $('buildQuickList').innerHTML=parts.length?parts.map(p=>`<article class="build-quick-item"><img src="${esc(p.image)}" alt="" width="48" height="48" loading="lazy"><div><small>${esc(categories.get(p.category))}</small><strong title="${esc(p.name)}">${esc(shortName(p))}</strong><span>${esc(market.priceText(p))}</span><small title="${esc(market.priceLabel(p))}">${esc(refLabel(p))}</small></div><button type="button" class="dock-remove" data-quick-remove="${esc(p.id)}" aria-label="Quitar ${esc(p.name)} de Mi build">×</button></article>`).join(''):'<p>Tu build está vacía. Añade piezas desde el catálogo; comparar no las añade.</p>';
    // Sin precios recientes se explica el motivo (consultas de más de 72 h) y la fecha de la última.
    const last=Number(market.latestCheckedAt), lastText=Number.isFinite(last)&&last>0?new Date(last).toLocaleDateString('es-CO',{timeZone:'America/Bogota',day:'numeric',month:'long'}):'';
    $('buildQuickSubtotal').textContent=known.length?`Subtotal ${known.length<parts.length?'parcial ':''}de precios recientes: ${market.money(known.reduce((s,v)=>s+v,0))} · ${known.length}/${parts.length} piezas. No incluye envío ni montaje.`:parts.length?`Sin subtotal: los precios se consideran recientes durante 72 horas y ${lastText?`la última consulta es del ${lastText}`:'no hay consultas recientes'}. Revisa la referencia de coste en Mi build.`:'';
    // Aviso de presupuesto visible también en el panel rápido.
    const budget=window.FENIXA_BUDGET_STATUS?.();
    const alert=$('buildQuickBudget');
    if(alert){alert.hidden=!budget||!['over','maybe'].includes(budget.kind);alert.textContent=budget&&!alert.hidden?`Presupuesto: ${budget.text.charAt(0).toLowerCase()+budget.text.slice(1)}.`:'';}
    dock.classList.toggle('is-over-budget',budget?.kind==='over');
    $('buildQuickSave').textContent=state.saved()?'Guardado en este navegador · compatibilidad parcial, no montaje garantizado.':'No se pudo guardar. Las piezas solo se conservan en esta pestaña.';
  }
  function ask(product, previous, fit, trigger) {
    pending={id:product.id,previousId:previous?.id||null};opener=trigger;
    const blocked=fit.status==='conflict';
    const category={cpu:'procesador',board:'placa madre',ram:'memoria RAM',gpu:'tarjeta gráfica',storage:'almacenamiento',power:'fuente',case:'gabinete',cooler:'refrigeración',fan:'ventilador',setup:'periférico'}[product.category]||'pieza';
    const picture=(p,label,isNew)=>'<article class="build-sheet-product'+(isNew?' is-new':'')+'"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" width="64" height="64"><div><small>'+label+'</small><h3 title="'+esc(p.name)+'">'+esc(shortName(p))+'</h3>'+(['category','family'].includes(p.imageKind)?'<span class="build-sheet-photo-note">'+(p.imageKind==='category'?'Ilustración de categoría':'Imagen de familia')+'</span>':'')+'</div></article>';
    const stores = market.listings(product).length ? market.storeList(product) : '';
    dialog.innerHTML='<header class="build-sheet-header"><div><span class="eyebrow">MI BUILD</span><h2 id="buildAddTitle">'+(blocked?'Revisa esta pieza':previous?'Cambiar '+category:'Añadir '+category)+'</h2></div><button class="build-sheet-close" type="button" data-cancel-build-add aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><p class="build-sheet-intro">'+(blocked?'Hay un conflicto con tu selección actual.':previous?'Tu selección se actualizará al tocar Cambiar pieza.':'Incorpora esta pieza a tu configuración.')+'</p><div class="build-sheet-selection">'+(previous?picture(previous,'ACTUAL',false):'')+picture(product,previous?'NUEVA ELECCIÓN':'TU ELECCIÓN',true)+'</div>'+window.FENIXA_FIT_STATUS.render(fit,{hasParts:state.ids().some(id=>byId.get(id).category!==product.category)})+stores+'<footer class="build-sheet-footer'+(blocked?' is-blocked':'')+'"><button class="secondary-button" type="button" data-cancel-build-add>Cancelar</button>'+(blocked?'':'<button class="primary-button" type="button" data-confirm-build-add>Cambiar pieza</button>')+'</footer>';
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('[data-cancel-build-add]').focus();
  }
  function requestAdd(id, trigger) {
    const product=byId.get(id);if(!product)return;
    if(state.ids().includes(id)){notice(`${shortName(product)} ya está en Mi build.`);return;}
    const previous=state.ids().map(id=>byId.get(id)).find(p=>p.category===product.category), fit=state.check(product);
    if(previous||fit.status==='conflict'){ask(product,previous,fit,trigger);return;}
    if(state.add(id)) {
      render();
      // Si la pieza hace que la build se pase del objetivo, se dice en el mismo aviso.
      const budget=window.FENIXA_BUDGET_STATUS?.(), over=budget?.kind==='over'?` Atención: tu build ${budget.text.charAt(0).toLowerCase()+budget.text.slice(1)} de tu objetivo.`:'';
      notice(`${shortName(product)} añadida a Mi build. ${state.saved()?'Guardada en este navegador.':'No se pudo guardar.'} ${fit.label}: ${fit.reason}${over}`,over?`Pieza añadida.${over}`:state.saved()?'Pieza añadida a Mi build. Revisión de compatibilidad parcial.':'Pieza añadida, pero no se pudo guardar en este navegador.');
      returnIfPending(product);
    }else notice('No se añadió: revisa los conflictos con tus piezas.');
  }
  window.FENIXA_REQUEST_BUILD_ADD = requestAdd;
  toggle.addEventListener('click',()=>setExpanded(body.hidden));
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();setExpanded(false,true);}});
  dock.addEventListener('click',e=>{
    const remove=e.target.closest('[data-quick-remove]');
    // Con deshacer, igual que en Mi build (build-undo.js).
    if(remove){const p=byId.get(remove.dataset.quickRemove);window.FENIXA_BUILD_UNDO.remove(p.id,{returnFocus:toggle});render();$('buildAddStatus').textContent=`${shortName(p)} retirada de Mi build.`;}
    if(e.target.closest('a'))setExpanded(false);
  });
  dialog.addEventListener('click',e=>{
    if(e.target.closest('[data-cancel-build-add]')){dialog.close();return;}
    if(!e.target.closest('[data-confirm-build-add]')||!pending)return;
    const product=byId.get(pending.id), previous=state.ids().map(id=>byId.get(id)).find(p=>p.category===product.category);
    if((previous?.id||null)!==pending.previousId){requestAdd(product.id,opener);return;}
    if(!state.add(product.id)){ask(product,previous,state.check(product),opener);return;}
    render();notice(`${shortName(product)} reemplazó la pieza anterior. ${state.saved()?'Guardada en este navegador.':'No se pudo guardar.'}`,state.saved()?'Reemplazo confirmado en Mi build.':'Reemplazo confirmado, pero no se pudo guardar.');
    const back=returning.get()?.category===product.category;dialog.close();if(back){opener=null;returnIfPending(product);}
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    const parent = document.querySelector?.('#productSheet[open]') || $('marketGrid');
    const replacement = pending && parent?.querySelector(`[data-add-my-build="${pending.id}"]`);
    const target = opener?.isConnected ? opener : replacement || toggle;
    if (!target.closest?.('[hidden], [inert]')) target.focus({preventScroll:true});
    pending = null;
    opener = null;
  });
  document.addEventListener('click',e=>{
    const add=e.target.closest('[data-add-my-build]');
    if(add){requestAdd(add.dataset.addMyBuild,add);return;}
    if(e.target.closest('.comparison-dock-toggle'))setExpanded(false);
  });
  window.addEventListener('fenixa-build-changed',render);
  window.addEventListener('fenixa-budget-changed',()=>setTimeout(render));
  window.addEventListener('hashchange',()=>{setExpanded(false);if(dialog.open)dialog.close();
    // Salir del catálogo hacia otra sección (que no sea Mi build) cancela la vuelta automática.
    if(returning.get()&&!/^#componentes/.test(location.hash)&&location.hash!=='#mi-build')returning.clear();
    if(location.hash==='#mi-build'&&returning.get())returning.clear();
    banner();});
  document.addEventListener('click',e=>{if(e.target.closest('[data-build-return-cancel]'))returning.clear();});
  banner();
  // Both floating controls share a vertical stack, including on low/mobile windows.
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{
    document.body.style.setProperty('--build-quick-height',`${dock.offsetHeight}px`);
  }).observe(dock);
  render();
})();
