(() => {
  'use strict';
  const key='fenixa-build-library-v1', limit=6, state=window.FENIXA_MY_BUILD, budget=window.FENIXA_BUDGET;
  const byId=new Map(window.FENIXA_CATALOG.products.map(p=>[p.id,p]));
  let entries=[], raw=null, readable=true, serial=0;
  const copy=value=>JSON.parse(JSON.stringify(value));
  const validBudget=value=>value===0||budget.amounts.includes(value);
  const nameOf=value=>typeof value==='string'?value.trim().replace(/\s+/g,' '):'';
  const signature=value=>JSON.stringify(value);
  function decode(text) {
    const data=text===null?[]:JSON.parse(text);
    if(!Array.isArray(data)||data.length>limit)throw Error('Invalid library');
    const ids=new Set();
    for(const item of data) {
      if(!item||typeof item.id!=='string'||!item.id||ids.has(item.id)||typeof item.name!=='string'||!nameOf(item.name)||item.name.length>40||!validBudget(item.budget)||!Array.isArray(item.parts)||!item.parts.length||item.parts.length>10||item.parts.some(id=>typeof id!=='string'||!id)||new Set(item.parts).size!==item.parts.length)throw Error('Invalid saved build');
      ids.add(item.id);
    }
    return data.map(item=>({id:item.id,name:nameOf(item.name),parts:item.parts.slice(),budget:item.budget}));
  }
  function read() {
    try {raw=localStorage.getItem(key);entries=decode(raw);readable=true;}catch{readable=false;}
  }
  read();
  const changed=()=>window.dispatchEvent(new Event('fenixa-library-changed'));
  function refresh() {read();changed();}
  function available() {
    try {
      if(localStorage.getItem(key)!==raw){refresh();return {ok:false,code:'changed'};}
    }catch{return {ok:false,code:'storage'};}
    return readable?null:{ok:false,code:'storage'};
  }
  function commit(next) {
    try{const text=JSON.stringify(next);localStorage.setItem(key,text);raw=text;entries=copy(next);readable=true;changed();return {ok:true};}
    catch{return {ok:false,code:'storage'};}
  }
  function inspect(entry) {
    if(!entry)return {ok:false,code:'missing'};
    const parts=entry.parts.map(id=>byId.get(id));
    if(parts.some(p=>!p)||new Set(parts.map(p=>p.category)).size!==parts.length)return {ok:false,code:'unavailable'};
    const conflicts=parts.filter(p=>window.FENIXA_FIT.check(p,parts.filter(other=>other.id!==p.id)).status==='conflict').length;
    return {ok:true,conflicts};
  }
  const activeSignature=()=>signature({parts:state.ids(),budget:budget.get()});
  const get=id=>entries.find(entry=>entry.id===id);
  function save(name,expectedActive) {
    const failure=available();if(failure)return failure;
    if(expectedActive!==activeSignature())return {ok:false,code:'changed'};
    const title=nameOf(name),parts=state.ids();
    if(!title||title.length>40)return {ok:false,code:'name'};
    if(!parts.length)return {ok:false,code:'empty'};
    if(entries.length>=limit)return {ok:false,code:'limit'};
    const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${++serial}`;
    return commit([...entries,{id,name:title,parts:parts.slice(),budget:budget.get()}]);
  }
  function restore(id,expectedActive,expectedEntry) {
    const failure=available();if(failure)return failure;
    const entry=get(id),validation=inspect(entry);if(!validation.ok)return validation;
    if(activeSignature()!==expectedActive||signature(entry)!==expectedEntry)return {ok:false,code:'changed'};
    // These existing APIs preserve the catalog and re-run live compatibility/pricing.
    budget.set(entry.budget);state.importParts(entry.parts.slice());
    return {ok:true,persisted:state.saved()&&budget.saved()};
  }
  function remove(id,expectedEntry) {
    const failure=available();if(failure)return failure;
    const entry=get(id);if(!entry)return {ok:false,code:'missing'};
    if(signature(entry)!==expectedEntry)return {ok:false,code:'changed'};
    return commit(entries.filter(item=>item.id!==id));
  }
  window.FENIXA_BUILD_LIBRARY={limit,list:()=>copy(entries),readable:()=>readable,save,restore,remove,inspect,activeSignature,entrySignature:id=>signature(get(id))};
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null)refresh();});
})();