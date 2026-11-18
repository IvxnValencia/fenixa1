// Armar mi PC: compone builds a partir de TODO el catálogo con ficha verificada y
// referencia de coste, no de listas fijas. Para cada combinación de procesador,
// placa, memoria, disco y gráfica elige la fuente, el gabinete y el disipador
// compatibles más económicos, y después busca la mejor combinación que cabe en
// el presupuesto según las prioridades del perfil.
// Las prioridades son editoriales, nunca puntuaciones de rendimiento. La procedencia del precio sigue visible.
(() => {
  'use strict';
  const profiles={
    'gaming-casual':{use:'gaming',name:'Juegos casuales',features:['1080p · objetivo de 60 FPS','LoL, Minecraft y Fortnite ligero','Equilibrio y posibilidad de ampliar'],cores:6,ram:16,storage:1000,vram:8,gpu:false},
    'gaming-competitivo':{use:'gaming',name:'Competitivo',features:['1080p · objetivo de 144 FPS','VALORANT, CS2 y Fortnite competitivo','Prioriza CPU y estabilidad de fotogramas'],cores:8,ram:32,storage:1000,vram:8,gpu:true,competitive:true},
    'gaming-aaa':{use:'gaming',name:'Grandes títulos AAA',features:['1080p–1440p · objetivo de 60 FPS','Cyberpunk 2077, RDR2 y GTA V','Prioriza GPU, VRAM y espacio para juegos'],cores:8,ram:32,storage:2000,vram:12,gpu:true},
    'creativo-2d':{use:'creativo',name:'Diseño 2D',features:['Ilustración, fotografía y piezas gráficas','Prioriza memoria y fluidez de trabajo','Revisa pantalla y gestión de color'],cores:6,ram:32,storage:1000,vram:0,gpu:false},
    'creativo-video':{use:'creativo',name:'Edición de vídeo',features:['Montaje y efectos de vídeo','Prioriza GPU compatible y memoria','Códec, resolución y proxies cambian la carga'],cores:8,ram:32,storage:2000,vram:8,gpu:true},
    'creativo-3d':{use:'creativo',name:'3D y producción',features:['Modelado, escenas y render con GPU','Prioriza VRAM y trabajo de varios hilos','Escenas grandes pueden exigir más de 32 GB'],cores:16,ram:32,storage:2000,vram:12,gpu:true},
    'estudio-esencial':{use:'estudio',name:'Clases y oficina',features:['Documentos, clases y videollamadas','Una base sencilla y ampliable','Gráficos integrados cuando son suficientes'],cores:6,ram:16,storage:500,vram:0,gpu:false},
    'estudio-multitarea':{use:'estudio',name:'Trabajo y multitarea',features:['Pestañas, hojas de cálculo y varias apps','Prioriza RAM y archivos de proyectos','Equilibrio entre capacidad y presupuesto'],cores:8,ram:32,storage:1000,vram:0,gpu:false},
    'estudio-desarrollo':{use:'estudio',name:'Programación y proyectos',features:['IDE, compilación y entornos locales','Prioriza CPU, RAM y almacenamiento','Máquinas virtuales e IA pueden requerir más'],cores:16,ram:32,storage:2000,vram:0,gpu:false}
  };
  // Límites de producto para cada perfil, no requisitos de hardware medidos.
  const profileCaps={'gaming-casual':8000000,'gaming-competitivo':12000000,'gaming-aaa':18000000,'creativo-2d':8000000,'creativo-video':14000000,'creativo-3d':18000000,'estudio-esencial':6000000,'estudio-multitarea':8000000,'estudio-desarrollo':12000000};
  for(const [id,profile] of Object.entries(profiles))profile.maxBudget=profileCaps[id];
  const catalog=window.FENIXA_CATALOG,market=window.FENIXA_MARKET;
  const facts=p=>window.FENIXA_SPECS.facts(p),v=p=>facts(p).values||{},positive=n=>Number.isFinite(n)&&n>0;
  function reference(p){
    const recent=market.best(p);if(recent)return{low:recent.price,high:recent.price,kind:'recent',date:recent.checkedAt,source:recent.url};
    const published=market.quoted?.(p);if(published)return{low:published.price,high:published.price,kind:'published',date:published.checkedAt,source:published.sourceUrl||published.url};
    const old=market.offers(p).filter(o=>o.status==='in_stock'&&positive(o.price)&&Number.isFinite(Date.parse(o.checkedAt))&&Date.parse(o.checkedAt)<=Date.now()).sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt))[0];
    if(old)return{low:old.price,high:old.price,kind:'historical',date:old.checkedAt,source:old.url};
    if(p.priceKind==='spec_only'||!positive(p.min)||!positive(p.max)||p.max<p.min)return null;
    return{low:p.min,high:p.max,kind:'catalog',date:'2026-09-24',source:p.source};
  }
  const refs=new Map(catalog.products.map(p=>[p.id,reference(p)]));
  const cost=p=>refs.get(p.id).high,cheapest=(a,b)=>cost(a)-cost(b)||a.id.localeCompare(b.id);
  const memoryKinds=t=>String(t||'').toUpperCase().match(/DDR[345]/g)||[];
  const forms=t=>String(t||'').toLowerCase().split(/[\/,·]/).map(s=>s.trim()).filter(Boolean);
  // «AM5» o el número del socket Intel («1700»), tal como aparece en las listas de soporte de los disipadores.
  const socketKey=s=>/^LGA/i.test(s||'')?String(s).replace(/\D/g,''):String(s||'').toUpperCase();
  // Consumo de diseño: las fichas Intel sin TDP se tratan como chips de gama alta (125 W) para no quedarse cortos.
  const cpuPower=f=>positive(f.tdp)?f.tdp:f.cores>=20?200:f.cores>=14?125:65;
  // Placas de entrada (H610, A620…): no se combinan con procesadores de alto consumo.
  const entryBoard=p=>/\b(H610|H510|A620|A520)/i.test(p.name);
  // Orden editorial de la gama de la gráfica según su nombre comercial (50 < 60 < 70 < 80 < 90; Ti/Super suben medio paso; generación más nueva suma poco).
  function gpuTier(p){
    const m=/(?:RTX|RX|GTX)\s*-?\s*(\d)(\d)(\d)0\s*(TI|SUPER|XT)?/i.exec(String(p.name).replace(/-/g,' '));
    if(!m)return 0;
    const gen=Number(m[1]),cls=Number(m[2]+m[3]);
    return Math.max(0,(cls-40)/10)+(m[4]?0.5:0)+Math.max(0,gen-3)*0.35;
  }
  let pools=null,candidates=null;
  function buildPools(){
    if(pools)return pools;
    const eligible=catalog.products.filter(p=>refs.get(p.id)&&facts(p).verified&&!facts(p).identityConflict);
    const pool=(cat,accept)=>eligible.filter(p=>p.category===cat&&accept(v(p),p)).sort(cheapest);
    pools={
      cpus:pool('cpu',f=>f.socket&&positive(f.cores)&&memoryKinds(f.memory).length),
      boards:pool('board',f=>f.socket&&memoryKinds(f.memory).length===1&&f.boardForm&&positive(f.slots)&&positive(f.maxRam)),
      memory:pool('ram',(f,p)=>memoryKinds(f.memory).length===1&&f.capacity>=16&&positive(f.modules)&&!/SO.?DIMM/i.test(f.format||'')&&!/port[aá]til/i.test(p.name)),
      disks:pool('storage',f=>f.placement==='Interno'&&positive(f.capacity)&&(/M\.2 2280/.test(f.format||'')||/2,5/.test(f.format||''))),
      powers:pool('power',f=>positive(f.watts)),
      cases:pool('case',f=>Array.isArray(f.boardForms)&&f.boardForms.length),
      coolers:pool('cooler',f=>f.sockets&&(f.coolerType==='air'||f.coolerType==='aio')),
      gpus:pool('gpu',f=>positive(f.vram)&&positive(f.length)&&positive(f.recommendedPsu))
    };
    return pools;
  }
  // Disipador: el más económico que declara el socket y aguanta el consumo del procesador.
  function coolerFor(cpu,box){
    const f=v(cpu),need=cpuPower(f),key=socketKey(f.socket),limit=v(box).coolerMax;
    return buildPools().coolers.find(c=>{
      const k=v(c);if(!String(k.sockets).toUpperCase().includes(key))return false;
      if(k.coolerType==='air'&&positive(limit)&&positive(k.height)&&k.height>limit)return false;
      if(need<=65)return k.coolerType==='air';
      if(need<=125)return k.coolerType==='aio'||/dos|doble|2 ventiladores/i.test(k.format||'');
      return k.coolerType==='aio'||/doble torre/i.test(k.format||'');
    })||null;
  }
  function plans(){
    if(candidates)return candidates;
    const {cpus,boards,memory,disks,powers,cases,gpus}=buildPools();candidates=[];
    // Un disco por capacidad y formato: el más económico.
    const diskSet=disks.filter((p,i,all)=>all.findIndex(x=>v(x).capacity===v(p).capacity&&/M\.2/.test(v(x).format)===/M\.2/.test(v(p).format))===i);
    for(const cpu of cpus){
      const c=v(cpu);
      // Las dos placas más económicas de su socket y memoria.
      const cpuBoards=boards.filter(b=>v(b).socket===c.socket&&memoryKinds(c.memory).includes(memoryKinds(v(b).memory)[0])&&!(cpuPower(c)>=125&&entryBoard(b))).slice(0,2);
      for(const board of cpuBoards){
        const b=v(board),kind=memoryKinds(b.memory)[0];
        const kits=memory.filter(r=>memoryKinds(v(r).memory)[0]===kind&&v(r).capacity<=b.maxRam&&v(r).modules<=b.slots).filter((p,i,all)=>all.findIndex(x=>v(x).capacity===v(p).capacity)===i);
        const boardDisks=diskSet.filter(d=>/M\.2/.test(v(d).format)?b.m2Slots>0:true);
        const boxes=cases.filter(x=>v(x).boardForms.includes(b.boardForm));
        for(const ram of kits)for(const disk of boardDisks)for(const gpu of [null,...gpus]){
          if(!gpu&&(c.requiresGpu||!c.graphics))continue;
          const g=gpu?{...v(gpu),tier:gpuTier(gpu)}:null,watts=Math.max(450,g?g.recommendedPsu:0,cpuPower(c)>=200?750:cpuPower(c)>=125?650:0)+(g&&cpuPower(c)>=125?100:0);
          const box=boxes.find(x=>!g||!positive(v(x).gpuMax)||g.length<=(v(x).gpuMaxUpper||v(x).gpuMax));
          if(!box)continue;
          const power=powers.find(p=>v(p).watts>=watts&&(!positive(v(box).psuMax)||!positive(v(p).length)||v(p).length<=v(box).psuMax));
          const cooler=coolerFor(cpu,box);
          if(!power||!cooler)continue;
          const parts=[cpu,board,ram,disk,power,box,cooler,...(gpu?[gpu]:[])];
          const rows=parts.map(product=>({product,reference:refs.get(product.id)}));
          candidates.push({parts:parts.map(p=>p.id),products:parts,rows,low:rows.reduce((s,r)=>s+r.reference.low,0),high:rows.reduce((s,r)=>s+r.reference.high,0),cpu:c,ram:v(ram),disk:v(disk),gpu:g,allRecent:rows.every(r=>r.reference.kind==='recent')});
        }
      }
    }
    return candidates;
  }
  // La comprobación de compatibilidad completa solo se ejecuta sobre las candidatas que se van a proponer.
  const verdicts=new Map();
  function compatible(plan){
    const key=plan.parts.join('|');
    if(!verdicts.has(key)){
      const checks=plan.products.map(p=>({id:p.id,...window.FENIXA_FIT.check(p,plan.products.filter(x=>x.id!==p.id))}));
      verdicts.set(key,checks.some(c=>c.status==='conflict')?null:checks);
    }
    return verdicts.get(key);
  }
  // Prioridades del perfil con rendimiento decreciente: lo que pasa del objetivo suma poco.
  function scorer(profile){
    const soft=(value,target,weight)=>target?Math.min(value,target)/target*weight+Math.max(0,Math.min(value,target*2)-target)/target*weight*0.15:0;
    const w=profile.use==='gaming'?{cpu:24,ram:12,disk:10,gpu:14,tier:40}:profile.use==='creativo'?{cpu:32,ram:26,disk:14,gpu:profile.vram?16:4,tier:profile.vram?14:0}:{cpu:40,ram:34,disk:22,gpu:0,tier:0};
    // La gama de la gráfica pesa hasta un nivel acorde al perfil (≈ 60 en AAA/3D, 50 en el resto).
    const tierCap=profile.vram>=12?3.2:2.2;
    return p=>soft(p.cpu.cores,profile.cores,w.cpu)+soft(p.ram.capacity,profile.ram,w.ram)+soft(p.disk.capacity,profile.storage,w.disk)+(profile.vram?soft(p.gpu?.vram||0,profile.vram,w.gpu):p.gpu?w.gpu*0.5:0)+(w.tier&&p.gpu?Math.min(p.gpu.tier,tierCap)/tierCap*w.tier:0)+(profile.competitive?Math.min(p.cpu.l3||0,96)/96*8:0)+(/NVMe/i.test(p.disk.pcie||'')?3:0);
  }
  const money=n=>window.FENIXA_BUDGET?.money?.(n)||'$'+Math.round(n).toLocaleString('es-CO');
  // Laptops del catálogo que caben en el presupuesto: la alternativa cuando no alcanza para una torre.
  function laptopsWithin(profile,max){
    const list=window.FENIXA_LAPTOPS||[],prices=window.FENIXA_LAPTOP_PRICES,useKey={estudio:'estudio',gaming:'gaming',creativo:'creativo'}[profile.use];
    return list.map(l=>{let o=null;try{o=prices?.offer?.(l);}catch{}return{l,o};}).filter(({l,o})=>o&&o.currency==='COP'&&positive(o.price)&&o.price<=max&&(l.uses||[]).includes(useKey)).sort((a,b)=>b.o.price-a.o.price).slice(0,3).map(({l,o})=>({id:l.id,name:l.name,price:o.price,store:o.store||'',url:o.url||l.source,checkedAt:o.checkedAt||l.checkedAt}));
  }
  function generate(profileId,max){
    const profile=profiles[profileId];
    if(!profile||!Number.isSafeInteger(max)||max<1000000||max>profile.maxBudget||(max-1000000)%250000)return{proposal:null,reason:'Elige un presupuesto entre $1 y $'+((profile?.maxBudget||18000000)/1000000)+' millones para este perfil, en pasos de $250.000.'};
    const score=scorer(profile),options=plans().filter(p=>!profile.gpu||p.gpu),bucket=p=>p.high<=max?0:p.low<=max?1:2;
    if(!options.length)return{proposal:null,reason:'Faltan fichas o referencias de coste para componer una lista. Puedes elegir piezas manualmente.'};
    // Mejor puntuación dentro del presupuesto; a igualdad, la más económica.
    const ranked=options.filter(p=>bucket(p)<2).map(p=>({p,s:score(p)})).sort((a,b)=>bucket(a.p)-bucket(b.p)||b.s-a.s||a.p.high-b.p.high||a.p.parts.join('|').localeCompare(b.p.parts.join('|')));
    let chosen=null,checks=null;
    for(const {p} of ranked){const result=compatible(p);if(result){chosen=p;checks=result;break;}}
    if(!chosen){
      // Ninguna combinación cabe ni por su referencia más baja: no se propone una build fuera del presupuesto.
      const byLow=options.slice().sort((a,b)=>a.low-b.low),cheapestPlan=byLow.find(compatible)||byLow[0],gpuRow=cheapestPlan.rows.find(r=>r.product.category==='gpu');
      const needed=Math.min(profile.maxBudget,1000000+Math.ceil((cheapestPlan.low-1000000)/250000)*250000),canRaise=cheapestPlan.low<=profile.maxBudget;
      const top=cheapestPlan.rows.slice().sort((a,b)=>b.reference.low-a.reference.low).slice(0,3).map(r=>r.product);
      const laptops=laptopsWithin(profile,max);
      return{proposal:null,laptops,shortfall:{max,cheapest:cheapestPlan.low,gpu:gpuRow?gpuRow.reference.low:0,needed,canRaise,heaviest:top.map(p=>({id:p.id,category:p.category,name:p.name,price:refs.get(p.id).low}))},
        reason:'Con '+money(max)+' no alcanza para una torre de «'+profile.name+'» con las piezas verificadas del catálogo. La más económica que podemos armar cuesta desde '+money(cheapestPlan.low)+(gpuRow?' (solo la tarjeta gráfica ya cuesta desde '+money(gpuRow.reference.low)+')':'')+'. '+(canRaise?'Sube el presupuesto a '+money(needed)+(laptops.length?', mira las laptops que sí caben':'')+' o elige un perfil menos exigente.':'Elige un perfil menos exigente.')};
    }
    const p=chosen,gaps=[];
    if(p.cpu.cores<profile.cores)gaps.push('Núcleos: '+p.cpu.cores+' / objetivo '+profile.cores);
    if(p.ram.capacity<profile.ram)gaps.push('RAM: '+p.ram.capacity+' / objetivo '+profile.ram+' GB');
    if(p.disk.capacity<profile.storage)gaps.push('SSD: '+p.disk.capacity+' / objetivo '+profile.storage+' GB');
    if(profile.gpu&&(p.gpu?.vram||0)<profile.vram)gaps.push('VRAM: '+(p.gpu?.vram||0)+' / objetivo '+profile.vram+' GB');
    const {products,...plain}=p;
    return{proposal:{...plain,checks,parts:p.parts.slice(),profileId,max,gaps,relation:['within-reference','range-crosses-budget','over-reference'][bucket(p)]},profile,considered:options.length};
  }
  // Tope útil del presupuesto: lo que cuesta (referencia alta) la mejor build del perfil. Más dinero ya no cambia la propuesta.
  const ceilings=new Map();
  function ceiling(profileId){
    const profile=profiles[profileId];if(!profile)return null;
    if(!ceilings.has(profileId)){
      const top=generate(profileId,profile.maxBudget).proposal;
      ceilings.set(profileId,top&&top.relation==='within-reference'?Math.min(profile.maxBudget,1000000+Math.ceil((top.high-1000000)/250000)*250000):profile.maxBudget);
    }
    return ceilings.get(profileId);
  }
  // Precio desde el que hay build para un perfil (para mostrarlo en las tarjetas de perfil).
  const floors=new Map();
  function floor(profileId){
    const profile=profiles[profileId];if(!profile)return null;
    if(!floors.has(profileId)){
      const options=plans().filter(p=>!profile.gpu||p.gpu).sort((a,b)=>a.low-b.low),first=options.find(compatible);
      floors.set(profileId,first?first.low:null);
    }
    return floors.get(profileId);
  }
  window.FENIXA_AUTO_BUILD={profiles,generate,reference,ceiling,floor};
})();
