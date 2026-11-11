(() => {
  'use strict';
  let failed=false,shown=false;
  const ownAsset=value=>{
    try {const url=new URL(value,document.baseURI),base=new URL('.',document.baseURI);return url.origin===base.origin&&url.protocol===base.protocol&&url.pathname.startsWith(base.pathname);}
    catch{return false;}
  };
  function show() {
    failed=true;if(shown||!document.body)return;shown=true;
    const region=document.createElement('aside');region.id='startupRecovery';region.className='startup-recovery';region.setAttribute('role','alert');
    const copy=document.createElement('div'),title=document.createElement('strong'),help=document.createElement('p'),retry=document.createElement('button');
    title.textContent='No se pudo cargar parte de FENIXA';
    help.textContent='Recarga la página para volver a intentarlo. Tu selección guardada se conserva.'+(location.protocol==='file:'?' Si moviste el archivo, conserva la carpeta completa del sitio junto a index.html.':' Si continúa, vuelve a abrir el sitio cuando tengas conexión.');
    retry.type='button';retry.className='secondary-button';retry.textContent='Recargar página';retry.addEventListener('click',()=>location.reload());
    copy.append(title,help);region.append(copy,retry);document.body.append(region);
  }
  window.addEventListener('error',event=>{
    const target=event.target;
    if(target&&((target.tagName==='SCRIPT'&&ownAsset(target.src))||(target.tagName==='LINK'&&target.rel==='stylesheet'&&ownAsset(target.href))))show();
    else if(event.filename&&ownAsset(event.filename))show();
  },true);
  window.addEventListener('unhandledrejection',event=>{
    const stack=event.reason?.stack;
    if(typeof stack==='string'&&[...document.scripts].some(script=>script.src&&ownAsset(script.src)&&stack.includes(script.src)))show();
  });
  document.addEventListener('DOMContentLoaded',()=>{if(failed)show();});
  window.addEventListener('load',()=>{
    if(!window.FENIXA_CATALOG||!window.FENIXA_MY_BUILD||!window.FENIXA_BUDGET||!window.FENIXA_LIBRARY_UI)show();
  });
})();
