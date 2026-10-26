// Main-only data registry. Product identities and saved selections are retained.
(() => {
  'use strict';
  const catalog=window.FENIXA_CATALOG,registry=window.FENIXA_VERIFIED_ADDITIONS;
  const blocked=new Set(['market-speedlogic-55734','market-clones-90789','market-clones-90791']);
  const added=[],enriched=[],rejected=[];
  const slug=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const summary=(row)=>{
    const v=row.values;
    const keys={ram:[['capacity','GB'],['memory',''],['rate','MT/s'],['cl','CL'],['modules','módulos']],storage:[['capacity','GB'],['format',''],['pcie','']],case:[['format',''],['gpuMax','mm GPU'],['coolerMax','mm disipador']],cpu:[['cores','núcleos'],['threads','hilos'],['socket','']],board:[['socket',''],['memory',''],['format','']],gpu:[['vram','GB VRAM'],['memory',''],['length','mm']],power:[['watts','W'],['efficiency','']],cooler:[['format',''],['height','mm']],fan:[['format',''],['connection','']]};
    return row.summary||(keys[row.category]||[]).filter(([k])=>v[k]!=null).map(([k,u])=>`${v[k]} ${u}`.trim()).join(' · ')+' · precio y stock local pendientes';
  };
  for(const row of window.FENIXA_GOAL30_DATA||[]){
    if(!catalog.categories.some(c=>c.id===row.category)||row.category==='setup'||!/^https:\/\//.test(row.source||'')||typeof row.name!=='string'||!row.name.trim()||!row.values||Array.isArray(row.values)||!row.scope||!/^\d{4}-\d{2}-\d{2}$/.test(row.checkedAt||'')||Object.values(row.values).some(v=>typeof v==='number'&&(!Number.isFinite(v)||v<=0))){rejected.push(row.name||'Invalid row');continue;}
    if((row.existingIds||[]).some(id=>blocked.has(id))){rejected.push(row.name+' · unresolved identity');continue;}
    let matches=(row.existingIds||[]).map(id=>catalog.products.find(p=>p.id===id)).filter(Boolean);
    if((row.existingIds||[]).length&&matches.length!==row.existingIds.length){rejected.push(row.name+' · missing existing ID');continue;}
    if(!matches.length)matches=catalog.products.filter(p=>p.name===row.name||(row.sku&&p.sku===row.sku));
    if(matches.some(p=>p.category!==row.category)){rejected.push(row.name+' · category mismatch');continue;}
    const id=row.idSuggested||`model-${row.category}-${slug(row.sku||row.modelKey||row.name)}`;
    if(!matches.length&&catalog.products.some(p=>p.id===id)){rejected.push(row.name+' · duplicate ID');continue;}
    if(!matches.length){
      const photo=row.imagePath||`assets/categories/${row.category}.png`;
      const p={id,category:row.category,name:row.name,sku:row.sku||row.modelKey||row.name,
        canonicalModel:row.modelKey||row.sku||row.name,summary:summary(row),source:row.source,sourceType:'manufacturer',priceKind:'spec_only',
        image:photo,imageKind:row.imagePath?(row.imageScope==='exact'?'exact':'family'):'category',
        imageNote:row.imagePath?(row.imageNote||'Imagen oficial de familia; confirmar etiqueta y revisión del SKU.'):'Ilustración de categoría, no fotografía de este modelo. Foto oficial exacta pendiente; las especificaciones se documentan en la ficha del fabricante.'};
      catalog.products.push(p);matches=[p];added.push(id);
    }else enriched.push(...matches.map(p=>p.id));
    for(const p of matches){
      if(p.category!==row.category){rejected.push(p.id+' · category mismatch');continue;}
      const prior=registry.profiles[p.name];
      const missing=prior&&!prior.identityConflict&&/^https:\/\//.test(prior.source||'')?Object.keys(prior.values).filter(key=>!(key in row.values)):[];
      const preserved=Object.fromEntries(missing.map(key=>[key,prior.values[key]]));
      const fieldSources={...Object.fromEntries(missing.map(key=>[key,prior.fieldSources?.[key]||{source:prior.source,checkedAt:prior.checkedAt,scope:prior.scope}])),...row.fieldSources};
      const additionalSources=[...(row.additionalSources||prior?.additionalSources||[])];
      if(missing.length&&prior.source!==row.source&&!additionalSources.some(s=>s.source===prior.source))additionalSources.push({source:prior.source,label:'Campos conservados de la ficha previa'});
      registry.profiles[p.name]={displayName:row.displayName||row.name,checkedAt:row.checkedAt,source:row.source,scope:row.scope,values:{...preserved,...row.values},
        modelKey:row.modelKey||row.sku||row.name,...(Object.keys(fieldSources).length?{fieldSources}:{}),...(additionalSources.length?{additionalSources}:{}),...(row.warning?{warning:row.warning}:{})};
    }
  }
  window.FENIXA_GOAL30={added,enriched,rejected};
})();
