(() => {
  'use strict';
  const key='fenixa-build-library-v1', limit=6, state=window.FENIXA_MY_BUILD, budget=window.FENIXA_BUDGET;
  const byId=new Map(window.FENIXA_CATALOG.products.map(p=>[p.id,p]));
  let entries=[], raw=null, readable=true, serial=0;
  const copy=value=>JSON.parse(JSON.stringify(value));
  const validBudget=value=>value===0||budget.amounts.includes(value);
  const nameOf=value=>typeof value==='string'?value.trim().replace(/\s+/g,' '):'';
  const signature=value=>JSON.stringify(value);
  const transferFormat='fenixa-builds', transferVersion=1, maxFileBytes=128*1024;
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
  const librarySignature=()=>signature(entries);
  function decodeTransfer(text) {
    if(typeof text!=='string'||text.length>maxFileBytes||new TextEncoder().encode(text).length>maxFileBytes)throw Error('size');
    let data;try{data=JSON.parse(text);}catch{throw Error('json');}
    const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
    const keys=(value,allowed)=>Object.keys(value).every(key=>allowed.includes(key));
    if(!object(data)||!keys(data,['format','version','builds'])||data.format!==transferFormat||data.version!==transferVersion||!Array.isArray(data.builds)||!data.builds.length||data.builds.length>limit)throw Error('schema');
    return data.builds.map(item=>{
      if(!object(item)||!keys(item,['name','budget','parts'])||typeof item.name!=='string'||!nameOf(item.name)||item.name.length>40||!validBudget(item.budget)||!Array.isArray(item.parts)||!item.parts.length||item.parts.length>10||item.parts.some(id=>typeof id!=='string'||!id||id.length>200)||new Set(item.parts).size!==item.parts.length)throw Error('schema');
      return {name:nameOf(item.name),budget:item.budget,parts:item.parts.slice()};
    });
  }
  function previewImport(text) {
    try {
      const builds=decodeTransfer(text);
      return {ok:true,builds:builds.map(entry=>({...entry,unknown:entry.parts.filter(id=>!byId.has(id)),...inspect(entry)})),count:builds.length,fits:entries.length+builds.length<=limit};
    }catch(error){return {ok:false,code:['size','json','schema'].includes(error.message)?error.message:'schema'};}
  }
  function importBuilds(text,expectedLibrary) {
    const failure=available();if(failure)return failure;
    if(librarySignature()!==expectedLibrary)return {ok:false,code:'changed'};
    let builds;try{builds=decodeTransfer(text);}catch(error){return {ok:false,code:['size','json','schema'].includes(error.message)?error.message:'schema'};}
    if(entries.length+builds.length>limit)return {ok:false,code:'limit'};
    // File IDs are preserved as data. Local version IDs are generated here, never trusted from a file.
    const added=builds.map(entry=>({id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${++serial}`,...entry}));
    return commit([...entries,...added]);
  }
  function exportBuilds(kind='saved') {
    if(kind!=='saved'&&kind!=='active')return {ok:false,code:'schema'};
    if(kind==='saved'&&!readable)return {ok:false,code:'storage'};
    const builds=kind==='active'?(state.ids().length?[{name:'Mi build actual',budget:budget.get(),parts:state.ids()}]:[]):entries.map(({name,budget,parts})=>({name,budget,parts:parts.slice()}));
    if(!builds.length)return {ok:false,code:'empty'};
    const text=JSON.stringify({format:transferFormat,version:transferVersion,builds},null,2)+'\n';
    return {ok:true,text,count:builds.length};
  }
  window.FENIXA_BUILD_LIBRARY={limit,maxFileBytes,list:()=>copy(entries),readable:()=>readable,save,restore,remove,inspect,activeSignature,entrySignature:id=>signature(get(id)),librarySignature,previewImport,importBuilds,exportBuilds};
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null)refresh();});
})();
