(() => {
  'use strict';
  const state=window.FENIXA_MY_BUILD, library=window.FENIXA_BUILD_LIBRARY, root=document.getElementById('homeContinue');
  if(!state||!library||!root)return;
  const byId=new Map(window.FENIXA_CATALOG.products.map(p=>[p.id,p]));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const count=n=>`${n} ${n===1?'pieza':'piezas'}`;
  const main=ids=>{const parts=ids.map(id=>byId.get(id)).filter(Boolean);return parts.find(p=>p.category==='gpu')||parts.find(p=>p.category==='cpu')||parts[0];};
  const thumb=ids=>{const p=main(ids);return p&&p.image?`<img src="${esc(p.image)}" alt="" width="48" height="48" loading="lazy">`:'<span class="home-continue-icon" aria-hidden="true">▣</span>';};
  let status='';
  function render() {
    const ids=state.ids(), saved=library.list().slice(0,library.limit);
    if(!ids.length&&!saved.length){root.hidden=true;root.innerHTML='';return;}
    const active=ids.length?`<section aria-labelledby="homeActiveTitle"><h2 id="homeActiveTitle">Tu build actual</h2><ul class="home-continue-row"><li class="home-continue-card home-continue-main">${thumb(ids)}<div><strong>Mi build</strong><small>${count(ids.length)}</small></div><a class="primary-button" href="#mi-build">Continuar</a></li></ul></section>`:'';
    const row=saved.length?`<section aria-labelledby="homeSavedTitle"><h2 id="homeSavedTitle">Tus builds guardadas</h2><ul class="home-continue-row">${saved.map(e=>`<li class="home-continue-card">${thumb(e.parts)}<div><strong>${esc(e.name)}</strong><small>${count(e.parts.length)}</small></div><button type="button" class="secondary-button" data-home-load="${esc(e.id)}" aria-label="Continuar ${esc(e.name)}">Continuar</button></li>`).join('')}</ul></section>`:'';
    root.innerHTML=active+row+`<p class="home-continue-status" role="status">${esc(status)}</p>`;
    root.hidden=false;
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-home-load]');if(!button)return;
    const id=button.dataset.homeLoad,active=library.activeSignature();
    // Solo se pregunta si hay piezas activas que no coinciden con ninguna versión guardada (se perderían).
    const unsaved=state.ids().length>0&&!library.list().some(e=>library.entrySignature(e.id)===active);
    if(unsaved&&typeof window.confirm==='function'&&!window.confirm('Tu build actual no está guardada y se reemplazará. ¿Continuar?'))return;
    const result=library.restore(id,active,library.entrySignature(id));
    if(result.ok){status='';location.hash='#mi-build';}
    else{status='No se pudo cargar esta build.';render();}
  });
  ['fenixa-build-changed','fenixa-library-changed','hashchange'].forEach(name=>window.addEventListener(name,()=>{if(name==='hashchange')status='';render();}));
  render();
})();
