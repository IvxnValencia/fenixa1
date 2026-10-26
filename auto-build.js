// Resource priorities are editorial, never benchmark scores. Price provenance stays visible.
(() => {
  'use strict';
  const profiles={
    'gaming-casual':{use:'gaming',name:'Juegos casuales',features:['1080p · objetivo de 60 FPS','LoL, Minecraft y Fortnite ligero','Equilibrio y posibilidad de ampliar'],cores:6,ram:32,storage:1000,vram:8,gpu:false},
    'gaming-competitivo':{use:'gaming',name:'Competitivo',features:['1080p · objetivo de 144 FPS','VALORANT, CS2 y Fortnite competitivo','Prioriza CPU y estabilidad de fotogramas'],cores:8,ram:32,storage:1000,vram:8,gpu:true,competitive:true},
    'gaming-aaa':{use:'gaming',name:'Grandes títulos AAA',features:['1080p–1440p · objetivo de 60 FPS','Cyberpunk 2077, RDR2 y GTA V','Prioriza GPU, VRAM y espacio para juegos'],cores:8,ram:32,storage:2000,vram:12,gpu:true},
    'creativo-2d':{use:'creativo',name:'Diseño 2D',features:['Ilustración, fotografía y piezas gráficas','Prioriza memoria y fluidez de trabajo','Revisa pantalla y gestión de color'],cores:6,ram:32,storage:1000,vram:0,gpu:false},
    'creativo-video':{use:'creativo',name:'Edición de vídeo',features:['Montaje y efectos de vídeo','Prioriza GPU compatible y memoria','Códec, resolución y proxies cambian la carga'],cores:8,ram:32,storage:2000,vram:8,gpu:true},
    'creativo-3d':{use:'creativo',name:'3D y producción',features:['Modelado, escenas y render con GPU','Prioriza VRAM y trabajo de varios hilos','Escenas grandes pueden exigir más de 32 GB'],cores:16,ram:32,storage:2000,vram:12,gpu:true},
    'estudio-esencial':{use:'estudio',name:'Clases y oficina',features:['Documentos, clases y videollamadas','Una base sencilla y ampliable','Gráficos integrados cuando son suficientes'],cores:6,ram:32,storage:500,vram:0,gpu:false},
    'estudio-multitarea':{use:'estudio',name:'Trabajo y multitarea',features:['Pestañas, hojas de cálculo y varias apps','Prioriza RAM y archivos de proyectos','Equilibrio entre capacidad y presupuesto'],cores:8,ram:32,storage:1000,vram:0,gpu:false},
    'estudio-desarrollo':{use:'estudio',name:'Programación y proyectos',features:['IDE, compilación y entornos locales','Prioriza CPU, RAM y almacenamiento','Máquinas virtuales e IA pueden requerir más'],cores:16,ram:32,storage:2000,vram:0,gpu:false}
  };
  // Product limits for each planning profile, not measured hardware requirements.
  const profileCaps={'gaming-casual':6000000,'gaming-competitivo':12000000,'gaming-aaa':18000000,'creativo-2d':8000000,'creativo-video':14000000,'creativo-3d':18000000,'estudio-esencial':4000000,'estudio-multitarea':7000000,'estudio-desarrollo':12000000};
  for(const [id,profile] of Object.entries(profiles))profile.maxBudget=profileCaps[id];
  const catalog=window.FENIXA_CATALOG,market=window.FENIXA_MARKET,byId=new Map(catalog.products.map(p=>[p.id,p]));
  const facts=p=>window.FENIXA_SPECS.facts(p),v=p=>facts(p).values,positive=n=>Number.isFinite(n)&&n>0;
  function reference(p){
    const recent=market.best(p);if(recent)return{low:recent.price,high:recent.price,kind:'recent',date:recent.checkedAt,source:recent.url};
    const published=market.quoted?.(p);if(published)return{low:published.price,high:published.price,kind:'published',date:published.checkedAt,source:published.sourceUrl||published.url};
    const old=market.offers(p).filter(o=>o.status==='in_stock'&&positive(o.price)&&Number.isFinite(Date.parse(o.checkedAt))&&Date.parse(o.checkedAt)<=Date.now()).sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt))[0];
    if(old)return{low:old.price,high:old.price,kind:'historical',date:old.checkedAt,source:old.url};
    if(p.priceKind==='spec_only'||!positive(p.min)||!positive(p.max)||p.max<p.min)return null;
    return{low:p.min,high:p.max,kind:'catalog',date:'2026-09-24',source:p.source};
  }
  const refs=new Map(catalog.products.map(p=>[p.id,reference(p)]));let candidates=null;
  function plans(){
    if(candidates)return candidates;
    const eligible=catalog.products.filter(p=>refs.get(p.id)&&facts(p).verified&&!facts(p).identityConflict);
    const pool=(cat,accept)=>eligible.filter(p=>p.category===cat&&accept(v(p),p));
    const cpus=pool('cpu',f=>f.socket==='AM5'&&f.memory==='DDR5'&&positive(f.cores)&&positive(f.tdp));
    const boards=pool('board',f=>f.socket==='AM5'&&f.memory==='DDR5'&&f.boardForm==='micro-atx'&&f.m2Slots>0&&f.slots>=2&&f.maxRam>=32).sort((a,b)=>refs.get(a.id).high-refs.get(b.id).high).slice(0,2);
    const memory=pool('ram',f=>f.memory==='DDR5'&&f.capacity>=32&&f.modules===2&&!/SO.?DIMM/i.test(f.format||''));
    const disks=pool('storage',f=>f.placement==='Interno'&&/M\.2 2280/.test(f.format||'')&&positive(f.capacity)).sort((a,b)=>refs.get(a.id).high-refs.get(b.id).high).filter((p,i,all)=>all.findIndex(x=>v(x).capacity===v(p).capacity)===i);
    const powers=pool('power',f=>positive(f.watts)&&f.watts>=550).sort((a,b)=>refs.get(a.id).high-refs.get(b.id).high);
    const gpus=pool('gpu',f=>positive(f.vram)&&positive(f.length)&&positive(f.recommendedPsu));
    const enclosure=byId.get('case-corsair-4000d-airflow-black'),fan=byId.get('market-speedlogic-5469');candidates=[];
    for(const cpu of cpus)for(const board of boards)for(const ram of memory)for(const disk of disks)for(const gpu of [null,...gpus]){
      if(!gpu&&(v(cpu).requiresGpu||!v(cpu).graphics))continue;
      const power=powers.find(p=>v(p).watts>=Math.max(550,gpu?v(gpu).recommendedPsu:0));
      const cooler=byId.get(v(cpu).tdp>65?'cooler-corsair-h100i-capellix':'market-clones-84096');
      const parts=[cpu,board,ram,disk,power,enclosure,cooler,fan,...(gpu?[gpu]:[])];
      if(parts.some(p=>!p||!refs.get(p.id))||v(ram).capacity>v(board).maxRam||v(ram).modules>v(board).slots)continue;
      const checks=parts.map(p=>({id:p.id,...window.FENIXA_FIT.check(p,parts.filter(x=>x.id!==p.id))}));
      if(checks.some(c=>c.status==='conflict'))continue;
      const rows=parts.map(product=>({product,reference:refs.get(product.id)}));
      candidates.push({parts:parts.map(p=>p.id),rows,checks,low:rows.reduce((s,r)=>s+r.reference.low,0),high:rows.reduce((s,r)=>s+r.reference.high,0),cpu:v(cpu),ram:v(ram),disk:v(disk),gpu:gpu?v(gpu):null,allRecent:rows.every(r=>r.reference.kind==='recent')});
    }
    return candidates;
  }
  function generate(profileId,max){
    const profile=profiles[profileId];
    if(!profile||!Number.isSafeInteger(max)||max<1000000||max>profile.maxBudget||(max-1000000)%250000)return{proposal:null,reason:'Elige un presupuesto entre $1 y $'+((profile?.maxBudget||18000000)/1000000)+' millones para este perfil, en pasos de $250.000.'};
    const score=p=>Math.min(p.cpu.cores,profile.cores)*20+Math.min(p.ram.capacity,profile.ram)*2+Math.min(p.disk.capacity,profile.storage)/50+Math.min(p.gpu?.vram||0,profile.vram)*15+(profile.competitive?Math.min(p.cpu.l3||0,96)/3:0);
    const options=plans().filter(p=>!profile.gpu||p.gpu),bucket=p=>p.high<=max?0:p.low<=max?1:2;
    const sorted=options.slice().sort((a,b)=>bucket(a)-bucket(b)||(bucket(a)===2?a.high-b.high:score(b)-score(a))||a.high-b.high||a.parts.join('|').localeCompare(b.parts.join('|')));
    if(!sorted.length)return{proposal:null,reason:'Faltan fichas o referencias de coste para componer una lista. Puedes elegir piezas manualmente.'};
    const p=sorted[0],gaps=[];
    if(p.cpu.cores<profile.cores)gaps.push('Núcleos: '+p.cpu.cores+' / objetivo '+profile.cores);
    if(p.disk.capacity<profile.storage)gaps.push('SSD: '+p.disk.capacity+' / objetivo '+profile.storage+' GB');
    if(profile.gpu&&(p.gpu?.vram||0)<profile.vram)gaps.push('VRAM: '+(p.gpu?.vram||0)+' / objetivo '+profile.vram+' GB');
    return{proposal:{...p,parts:p.parts.slice(),profileId,max,gaps,relation:['within-reference','range-crosses-budget','over-reference'][bucket(p)]},profile,considered:options.length};
  }
  window.FENIXA_AUTO_BUILD={profiles,generate,reference};
})();
