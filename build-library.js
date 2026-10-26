(() => {
  'use strict';
  const library=window.FENIXA_BUILD_LIBRARY, state=window.FENIXA_MY_BUILD, market=window.FENIXA_MARKET;
  const byId=new Map(window.FENIXA_CATALOG.products.map(p=>[p.id,p]));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const amount=value=>value?market.money(value):'Sin objetivo';
  let expanded=false,message='',pending=null,opener=null;
  const dialog=document.createElement('dialog');
  dialog.id='savedBuildDialog';dialog.className='build-add-dialog saved-build-dialog';
  dialog.setAttribute('aria-labelledby','savedBuildDialogTitle');document.body.append(dialog);
  const errors={storage:'No se pudo acceder al guardado del navegador. Tus versiones anteriores no se han sobrescrito. Revisa el espacio o los permisos e inténtalo de nuevo.',changed:'La selección o las versiones cambiaron mientras decidías. Cierra esta ventana y vuelve a elegir para revisar el estado actual.',missing:'Esta versión ya no está disponible.',unavailable:'Alguna referencia guardada ya no está disponible o su categoría cambió. Conservamos la versión; no sustituimos piezas automáticamente.',name:'Escribe un nombre de entre 1 y 40 caracteres.',empty:'Añade al menos una pieza antes de guardar una versión.',limit:'Ya tienes seis versiones. Elimina una que no necesites antes de guardar otra.'};
  function renderHtml() {
    const entries=library.list();
    return `<section class="saved-builds" aria-labelledby="savedBuildsTitle"><div class="saved-builds-heading"><div><span class="eyebrow">TUS ALTERNATIVAS</span><h3 id="savedBuildsTitle">Builds guardadas <span>${entries.length}/${library.limit}</span></h3></div><button class="secondary-button" type="button" data-save-build ${!state.ids().length||entries.length>=library.limit||!library.readable()?'disabled':''}>Guardar versión</button></div><p>Conserva tus piezas y tu presupuesto antes de probar otra configuración. Solo en este navegador.</p>${!library.readable()?`<p class="saved-builds-warning" role="status">${errors.storage}</p>`:''}<details id="savedBuildsList" ${expanded?'open':''}><summary id="savedBuildsSummary">${entries.length?'Ver mis versiones':'Cómo guardar una versión'}<span aria-hidden="true">⌄</span></summary><div class="saved-builds-list">${entries.length?entries.map(entry=>{const usable=library.inspect(entry).ok&&library.readable();return `<article class="saved-build-card"><div><strong>${esc(entry.name)}</strong><small>${entry.parts.length} ${entry.parts.length===1?'pieza':'piezas'} · ${esc(amount(entry.budget))}</small>${!usable?'<small class="saved-builds-warning">Referencias o guardado por revisar</small>':''}</div><div class="saved-build-card-actions"><button class="secondary-button" type="button" data-restore-build="${esc(entry.id)}" ${usable?'':'disabled'} aria-label="Usar ${esc(entry.name)}">Usar</button><button class="text-button" type="button" data-delete-saved-build="${esc(entry.id)}" ${library.readable()?'':'disabled'} aria-label="Eliminar ${esc(entry.name)}">Eliminar</button></div></article>`;}).join(''):'<p>Añade piezas a Mi build y pulsa Guardar versión. Podrás conservar hasta seis alternativas con nombres diferentes. Los precios se consultan de nuevo al usarlas.</p>'}</div></details><p class="saved-builds-status" role="status">${esc(message)}</p></section>`;
  }
  function open(action,id,trigger) {
    if(dialog.open)return;
    opener=trigger;
    const entry=library.list().find(item=>item.id===id);
    if(action!=='save'&&!entry)return;
    pending={action,id,active:library.activeSignature(),entry:library.entrySignature(id)};
    const title=action==='save'?'Guarda esta versión':action==='restore'?'¿Usar esta build?':'¿Eliminar esta versión?';
    let content;
    if(action==='save')content=`<p>Se guarda una copia de tus ${state.ids().length} piezas y del presupuesto ${esc(amount(window.FENIXA_BUDGET.get()))}. Los cambios posteriores en Mi build no alteran esta versión.</p><label for="savedBuildName">Nombre de la versión</label><input id="savedBuildName" name="buildName" type="text" maxlength="40" required autocomplete="off" placeholder="Ej. Gaming para ahorrar" value="Mi build ${library.list().length+1}">`;
    else if(action==='restore') {
      const validation=library.inspect(entry);
      content=`<p>Se reemplazarán las ${state.ids().length} piezas de tu selección activa y su presupuesto. Puedes guardar la actual antes de continuar.</p><div class="saved-build-preview"><strong>${esc(entry.name)}</strong><span>${entry.parts.length} piezas · objetivo ${esc(amount(entry.budget))}</span><ul>${entry.parts.map(id=>`<li>${esc(byId.get(id)?.name||'Referencia no disponible')}</li>`).join('')}</ul></div>${validation.conflicts?`<p class="saved-builds-warning">${validation.conflicts} piezas tienen conflictos detectados con el catálogo actual. Revísalos antes de comprar.</p>`:''}<p>Los precios y la compatibilidad se revisan con los datos disponibles al cargarla. No se recupera una cotización antigua.</p>`;
    } else content=`<p>Se eliminará <strong>${esc(entry.name)}</strong> de tus versiones guardadas. Tu build activa y sus piezas se conservan. Esta eliminación no se puede deshacer.</p>`;
    dialog.innerHTML=`<form id="savedBuildForm"><header class="build-sheet-header"><div><span class="eyebrow">MI BUILD</span><h2 id="savedBuildDialogTitle">${title}</h2></div><button class="build-sheet-close" type="button" data-cancel-saved-build aria-label="Cerrar">×</button></header><div class="saved-build-content">${content}<p id="savedBuildError" role="alert"></p></div><footer class="build-sheet-footer"><button class="secondary-button" type="button" data-cancel-saved-build>Cancelar</button><button class="primary-button" type="submit">${action==='save'?'Guardar versión':action==='restore'?'Usar y reemplazar':'Eliminar versión'}</button></footer></form>`;
    dialog.showModal();
    if(action==='save'){const input=document.getElementById('savedBuildName');input.focus();input.select();}
    else dialog.querySelector('[data-cancel-saved-build]').focus();
  }
  document.addEventListener('toggle',event=>{if(event.target.id==='savedBuildsList')expanded=event.target.open;},true);
  document.addEventListener('click',event=>{
    const save=event.target.closest('[data-save-build]');
    const restore=event.target.closest('[data-restore-build]');
    const remove=event.target.closest('[data-delete-saved-build]');
    if(save&&!save.disabled)open('save',null,save);
    if(restore&&!restore.disabled)open('restore',restore.dataset.restoreBuild,restore);
    if(remove&&!remove.disabled)open('delete',remove.dataset.deleteSavedBuild,remove);
  });
  dialog.addEventListener('click',event=>{if(event.target.closest('[data-cancel-saved-build]'))dialog.close();});
  dialog.addEventListener('submit',event=>{
    if(event.target.id!=='savedBuildForm'||!pending)return;event.preventDefault();
    let result;
    if(pending.action==='save')result=library.save(document.getElementById('savedBuildName').value,pending.active);
    else if(pending.action==='restore')result=library.restore(pending.id,pending.active,pending.entry);
    else result=library.remove(pending.id,pending.entry);
    if(!result.ok){document.getElementById('savedBuildError').textContent=errors[result.code]||'No se pudo completar la acción.';return;}
    message=pending.action==='save'?'Versión guardada. Puedes seguir cambiando tu build actual.':pending.action==='delete'?'Versión eliminada. Tu build activa se conserva.':result.persisted?'Build recuperada con sus piezas y presupuesto.':'Build recuperada en esta pestaña, pero no se pudo guardar la selección activa. Tus versiones anteriores se conservan.';
    expanded=true;window.dispatchEvent(new Event('fenixa-library-changed'));dialog.close();
  });
  dialog.addEventListener('close',()=>{pending=null;const focus=opener?.isConnected?opener:document.getElementById('savedBuildsSummary');focus?.focus({preventScroll:true});opener=null;});
  window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
  window.FENIXA_LIBRARY_UI={render:renderHtml};
})();