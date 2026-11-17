(() => {
  'use strict';
  const root=document.getElementById('carrito'), state=window.FENIXA_MY_BUILD, library=window.FENIXA_BUILD_LIBRARY;
  if(!root||!state||!library)return;
  const catalog=window.FENIXA_CATALOG, byId=new Map(catalog.products.map(p=>[p.id,p]));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const count=n=>`${n} ${n===1?'pieza':'piezas'}`;
  const name=p=>window.FENIXA_SHORT_NAME?window.FENIXA_SHORT_NAME(p):p.name;
  const money=value=>window.FENIXA_MARKET.money(value);
  function photos(ids){
    return `<div class="cart-photos" aria-hidden="true">${ids.map(id=>byId.get(id)).filter(Boolean).slice(0,4).map(p=>`<img src="${esc(window.FENIXA_THUMB?window.FENIXA_THUMB(p.image):p.image)}" alt="" width="80" height="80" loading="lazy">`).join('')}</div>`;
  }
  function reference(ids){
    const parts=ids.map(id=>byId.get(id)).filter(Boolean), refs=parts.map(p=>window.FENIXA_AUTO_BUILD?.reference(p));
    if(parts.length!==ids.length||!parts.length||refs.some(r=>!r))return 'Precio pendiente';
    const low=refs.reduce((sum,r)=>sum+r.low,0), high=refs.reduce((sum,r)=>sum+r.high,0);
    return 'Ref. '+money(low)+(low===high?'':' – '+money(high));
  }
  function summary(ids){
    const parts=ids.map(id=>byId.get(id)).filter(Boolean);
    return parts.filter(p=>p.category==='cpu'||p.category==='gpu').map(name).join(' · ')||count(parts.length);
  }
  function favorites(){
    try{const ids=JSON.parse(localStorage.getItem('fenixa-saved-builds')||'[]');return Array.isArray(ids)?catalog.builds.filter(b=>ids.includes(b.id)):[];}catch{return [];}
  }
  function versionCard(entry){
    const valid=library.readable()&&library.inspect(entry).ok;
    return `<article class="cart-card"><span class="cart-kind">Versión guardada</span><h3>${esc(entry.name)}</h3>${photos(entry.parts)}<p class="cart-summary">${esc(summary(entry.parts))}</p><small>${count(entry.parts.length)}</small><strong class="cart-price">${esc(reference(entry.parts))}</strong><div class="cart-actions"><button class="primary-button" type="button" data-restore-build="${esc(entry.id)}"${valid?'':' disabled'}>Usar build</button><button class="secondary-button" type="button" data-delete-saved-build="${esc(entry.id)}"${library.readable()?'':' disabled'}>Eliminar</button></div></article>`;
  }
  function render(){
    const ids=state.ids(), entries=library.list(), pinned=favorites();
    const active=ids.length?`<article class="cart-card cart-current"><span class="cart-kind">En curso</span><h3>Mi build</h3>${photos(ids)}<p class="cart-summary">${esc(summary(ids))}</p><small>${count(ids.length)}</small><strong class="cart-price">${esc(reference(ids))}</strong><div class="cart-actions"><a class="primary-button" href="#mi-build">Seguir editando</a><button class="secondary-button" type="button" data-save-build${library.readable()&&entries.length<library.limit?'':' disabled'}>Guardar versión</button></div></article>`:`<div class="cart-empty"><p>Aún no has añadido piezas.</p><div class="cart-actions"><a class="primary-button" href="#configurador">Armar mi PC</a><a class="secondary-button" href="#componentes">Explorar componentes</a></div></div>`;
    root.innerHTML=`<div class="section-heading"><div><h2 id="cartTitle" tabindex="-1">Carrito</h2><p>Tu selección y las builds que quieres conservar.</p></div></div><section aria-labelledby="cartActiveTitle"><div class="cart-section-heading"><h3 id="cartActiveTitle">Tu build actual</h3><span>${count(ids.length)}</span></div><div class="cart-grid">${active}</div></section><section aria-labelledby="cartSavedTitle"><div class="cart-section-heading"><h3 id="cartSavedTitle">Builds guardadas</h3><span>${entries.length+pinned.length}</span></div><div class="cart-grid">${entries.map(versionCard).join('')}${pinned.map(b=>`<article class="cart-card"><span class="cart-kind">Build completa guardada</span><h3>${esc(b.name)}</h3>${photos(b.parts)}<p class="cart-summary">${esc(summary(b.parts))}</p><small>${count(b.parts.length)}</small><strong class="cart-price">${esc(reference(b.parts))}</strong><a class="primary-button" href="#build/${encodeURIComponent(b.id)}">Ver detalles</a></article>`).join('')}${!entries.length&&!pinned.length?'<div class="cart-empty"><p>Guarda tu build o una propuesta y aparecerá aquí.</p><a class="secondary-button" href="#builds">Explorar builds</a></div>':''}</div></section><details class="cart-info"><summary>Más info</summary><p>Precios de referencia; confirma las ofertas en cada tienda. Las versiones se guardan en este navegador. Usar una versión pide confirmación antes de reemplazar tu selección.</p><a href="#mi-build">Importar o exportar builds</a></details>`;
  }
  ['fenixa-build-changed','fenixa-library-changed','fenixa-favorites-changed','storage'].forEach(event=>window.addEventListener(event,render));
  render();
})();
