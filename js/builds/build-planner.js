(() => {
  'use strict';
  const $=id=>document.getElementById(id),root=$('startBuild'),budget=window.FENIXA_BUDGET,auto=window.FENIXA_AUTO_BUILD;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const useNames={estudio:'Estudio y trabajo',gaming:'Gaming',creativo:'Diseño y creación'};
  const defaults={estudio:'estudio-esencial',gaming:'gaming-casual',creativo:'creativo-2d'};
  let use='estudio',level=defaults.estudio,selectedBudget=budget.get()||4500000,contextSaved=true,current=null,timer,budgetAdjustment='',lastPlanKey='',built=false;
  try{const old=JSON.parse(localStorage.getItem('fenixa-builder')||'{}');if(useNames[old.use])use=old.use;level=auto.profiles[old.level]?.use===use?old.level:defaults[use];}catch{contextSaved=false;}
  const maxForProfile=()=>Math.min(budget.max,auto.ceiling?auto.ceiling(level):auto.profiles[level].maxBudget);
  const clamp=value=>Math.max(budget.min,Math.min(maxForProfile(),Math.round(value/budget.step)*budget.step));
  function constrain(value,notify=false){selectedBudget=clamp(value);budgetAdjustment=notify&&selectedBudget<value?'Tu objetivo se ajustó al máximo. ':'';}
  constrain(selectedBudget);
  const budgetField=$('startBudgets').closest('fieldset');budgetField.className='start-field planner-budget-field';
  root.querySelector('.start-controls').classList.add('planner-controls');
  const levelField=document.createElement('fieldset');levelField.className='start-field planner-level-field';
  levelField.innerHTML='<legend><span>2</span> Elige tu perfil</legend><p class="builder-step-help">Elige la opción más cercana a tus actividades. Puedes volver y cambiarla en cualquier momento.</p><div id="startLevels" class="planner-levels"></div><div class="builder-nav"><button type="button" class="secondary-button" data-builder-back>Atrás</button><button type="button" class="primary-button" data-builder-next>Siguiente</button></div>';
  budgetField.before(levelField);
  $('startBudgets').className='planner-budget';
  $('startBudgets').innerHTML=`<div class="planner-budget-heading"><label for="startBudgetRange">Tu presupuesto</label><output id="startBudgetOutput" for="startBudgetRange" aria-live="off"></output></div><input type="range" id="startBudgetRange" min="${budget.min}" max="${maxForProfile()}" step="${budget.step}" value="${selectedBudget}" aria-describedby="startBudgetLimit startBudgetHelp"><div class="planner-range-labels"><span>$1 millón</span><span id="startBudgetMax"></span></div><div class="planner-stepper"><button type="button" data-budget-delta="-1" aria-label="Reducir presupuesto en 250.000 pesos">−</button><span>Pasos de $250.000 COP</span><button type="button" data-budget-delta="1" aria-label="Aumentar presupuesto en 250.000 pesos">+</button></div><div id="plannerBudgetFeedback" class="planner-budget-feedback"></div><p id="startBudgetLimit" role="status"></p><details id="plannerBudgetInfo" class="planner-notes"><summary>Más info</summary><p id="startBudgetHelp">El tope corresponde a la build más completa del perfil; puedes elegir menos. Los precios son referencias: confírmalos antes de comprar.</p></details><p id="plannerLiveStatus" class="planner-live-status" role="status" aria-live="polite" aria-atomic="true"></p><div class="builder-nav"><button type="button" class="secondary-button" data-builder-back>Atrás</button><button type="button" class="primary-button" id="buildProposal" data-build-proposal>Construir build</button></div>`;
  budgetField.querySelector('legend').innerHTML='<span>3</span> Ajusta tu presupuesto';
  const oldHint=budgetField.querySelector('.start-hint');if(oldHint)oldHint.hidden=true;
  const path=$('startParts').closest('fieldset');path.className='start-field planner-paths';path.querySelector('legend').textContent='También puedes explorar a tu ritmo';
  const result=document.createElement('section');result.id='autoBuildResult';result.className='planner-result is-empty';result.setAttribute('aria-labelledby','autoBuildTitle');budgetField.after(result);
  result.innerHTML='<h2 id="autoBuildTitle">Tu build aparecerá aquí</h2><p class="planner-empty-text">Completa los pasos y pulsa «Construir build» para ver tu propuesta con sus piezas.</p>';
  function remember(){try{const old=JSON.parse(localStorage.getItem('fenixa-builder')||'{}');localStorage.setItem('fenixa-builder',JSON.stringify({...old,use,level}));contextSaved=true;}catch{contextSaved=false;}budget.set(selectedBudget);}
  function levels(){
    $('startLevels').innerHTML=Object.entries(auto.profiles).filter(([,p])=>p.use===use).map(([id,p])=>`<button type="button" class="planner-level" data-level="${id}" aria-pressed="${id===level}"><span class="planner-level-title">${esc(p.name)}<span class="planner-selection-dot" aria-hidden="true"></span></span><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></button>`).join('');
  }
  function labels(){
    const text=budget.money(selectedBudget),slider=$('startBudgetRange'),profileMax=maxForProfile();slider.max=profileMax;slider.value=selectedBudget;slider.setAttribute('aria-valuetext',text+' pesos colombianos');slider.style.setProperty('--range-progress',((selectedBudget-budget.min)/(profileMax-budget.min)*100)+'%');
    $('startBudgetMax').textContent='$'+(profileMax/1000000).toLocaleString('es-CO')+' millones';
    const limitText=budgetAdjustment+'Máximo para este perfil: '+budget.money(profileMax)+'.';
    if($('startBudgetLimit').textContent!==limitText)$('startBudgetLimit').textContent=limitText;
    $('startBudgetOutput').textContent=text;$('startAmount').textContent=text;$('startUseLabel').textContent=auto.profiles[level].name;
    $('startAdvice').textContent=useNames[use]+' · propuesta según tus prioridades y referencias disponibles.';
    $('startResume').textContent=window.FENIXA_MY_BUILD.ids().length?'Continuar Mi build':'Ver Mi build';
    $('startSaveStatus').textContent=contextSaved&&budget.saved()?'Tu plan se guarda en este navegador.':'No se pudo guardar: tu plan solo se conserva en esta pestaña.';
    root.querySelectorAll('[name="startUse"]').forEach(r=>r.checked=r.value===use);
    root.querySelector('[data-budget-delta="-1"]').disabled=selectedBudget===budget.min;root.querySelector('[data-budget-delta="1"]').disabled=selectedBudget===profileMax;
  }
  const price=r=>r.low===r.high?budget.money(r.low):budget.money(r.low)+'–'+budget.money(r.high);
  const categoryName=id=>window.FENIXA_CATALOG.categories.find(c=>c.id===id)?.name||id;
  const keepOpen=id=>$(id)?.open?' open':'';
  function fps(){
    if(use!=='gaming')return '';
    const games=level==='gaming-casual'?['League of Legends','Minecraft sin shaders','Fortnite']:level==='gaming-competitivo'?['VALORANT','Counter-Strike 2','Fortnite']:['Cyberpunk 2077','Red Dead Redemption 2','GTA V'];
    return `<section id="plannerFps" class="planner-note"><h3>Juegos y objetivos de FPS</h3><p>Estos son objetivos de uso, no FPS medidos ni estimaciones para esta lista. Deben validarse en una prueba de la combinación exacta.</p><table><thead><tr><th>Juego</th><th>Objetivo</th><th>Condiciones de planificación</th></tr></thead><tbody>${games.map(game=>`<tr><th scope="row">${game}</th><td>${level==='gaming-competitivo'?144:60} FPS</td><td>${level==='gaming-competitivo'?'1080p, ajustes competitivos':level==='gaming-casual'?'1080p, ajustes bajos/medios':'1080p–1440p, ajustar calidad'} · sin RT ni generación de fotogramas</td></tr>`).join('')}</tbody></table><p>Riot publica categorías de 30, 60 y 144 FPS para su propio hardware de VALORANT; no son resultados de esta build. <a href="https://support.riotgames.com/es-es/valorant/support-tools/minimum-recommended-pc-specs" target="_blank" rel="noopener noreferrer">Requisitos oficiales de Riot</a>.</p></section>`;
  }
  let interactionStart=null,lastAnnouncement='';
  function announce(){const live=$('plannerLiveStatus');live.setAttribute('aria-live','polite');if(live.textContent!==lastAnnouncement)live.textContent=lastAnnouncement;}
  const order=['cpu','gpu','board','ram','storage','power','case','cooler','fan'];
  function why(row,p,profile,old){
    const c=row.product.category;let t;
    if(c==='cpu')t=`${p.cpu.cores} núcleos declarados; el perfil apunta a ${profile.cores}.`;
    else if(c==='gpu')t=`${p.gpu?.vram||0} GB de VRAM dedicada${profile.vram?'; el perfil apunta a '+profile.vram+' GB':''}.`;
    else if(c==='ram')t=`${p.ram.capacity} GB en doble canal; el perfil apunta a ${profile.ram} GB.`;
    else if(c==='storage')t=`${p.disk.capacity} GB en SSD M.2; el perfil apunta a ${profile.storage} GB.`;
    else if(c==='board')t='Socket AM5 con DDR5 y ranura M.2, compatible con el procesador elegido.';
    else if(c==='power')t='Potencia suficiente para las piezas de esta lista.';
    else if(c==='case')t='Gabinete con flujo de aire para estas piezas.';
    else if(c==='cooler')t='Refrigeración acorde con el consumo del procesador.';
    else if(c==='fan')t='Ventilador adicional para completar el flujo de aire.';
    else t='Complementa la lista y su compatibilidad.';
    return t+(old&&old.product.id!==row.product.id?' Antes: '+old.product.name+'.':'');
  }
  function shortName(product){
    const d=window.FENIXA_SPECS?.facts?.(product)?.displayName;if(d)return d;
    const n=String(product.name||'').trim().replace(/\s+/g,' ');
    const letters=n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g,''),upper=letters.replace(/[^A-ZÁÉÍÓÚÑ]/g,'').length;
    if(upper/Math.max(letters.length,1)<.6)return n;
    return n.split(' ').map((w,i)=>/\d/.test(w)||(w.length<=4&&i>0&&/^[A-Z]+$/.test(w))?w:(i===0?w.charAt(0)+w.slice(1).toLowerCase():w.toLowerCase())).join(' ');
  }
  const thumb=src=>window.FENIXA_THUMB?window.FENIXA_THUMB(src):src;
  function keyFact(product,p){
    const v=window.FENIXA_SPECS?.facts?.(product)?.values||{},c=product.category,gb=n=>n>=1000&&n%1000===0?n/1000+' TB':n+' GB';
    if(c==='cpu'){const n=v.cores||p.cpu?.cores;return n?n+' núcleos':'';}
    if(c==='gpu'){if(product.name==='Gráficos integrados')return 'En el procesador';const n=v.vram||p.gpu?.vram;return n?n+' GB VRAM':'';}
    if(c==='ram'){const cap=v.capacity||p.ram?.capacity;return cap?cap+' GB'+(v.memory?' '+v.memory:''):'';}
    if(c==='storage'){const cap=v.capacity||p.disk?.capacity;return cap?gb(cap)+(/nvme/i.test(v.pcie||'')?' NVMe':''):'';}
    if(c==='power'){const eff=/80 PLUS (\w+)/i.exec(v.efficiency||'');return v.watts?v.watts+' W'+(eff?' '+eff[1]:''):'';}
    if(c==='board')return [v.socket,v.memory].filter(Boolean).join(' · ');
    if(c==='case')return caseReach(v.format);
    return v.format||'';
  }
  function caseReach(format){
    const order=['mini-itx','micro-atx','atx','e-atx'],names={'mini-itx':'Mini-ITX','micro-atx':'Micro-ATX','atx':'ATX','e-atx':'E-ATX'};
    const best=String(format||'').toLowerCase().split(/[\/,]/).map(t=>t.trim()).filter(t=>order.includes(t)).sort((a,b)=>order.indexOf(b)-order.indexOf(a))[0];
    return best?'Hasta '+names[best]:format||'';
  }
  function generate(shouldAnnounce=true){
    result.setAttribute('aria-busy','false');
    const planKey=level+'|'+selectedBudget;if(planKey===lastPlanKey){if(shouldAnnounce)announce();return;}lastPlanKey=planKey;
    const previous=interactionStart||current,response=auto.generate(level,selectedBudget);current=response.proposal;
    if(!current){result.classList.remove('is-empty');const sf=response.shortfall;let actions='';if(sf){const lighter=Object.entries(auto.profiles).filter(([id,pr])=>id!==level&&pr.use===auto.profiles[level].use).find(([id])=>auto.generate(id,selectedBudget).proposal?.relation==='within-reference');actions='<div class="planner-shortfall-actions">'+(sf.canRaise&&sf.needed<=maxForProfile()?'<button type="button" class="primary-button" data-budget-set="'+sf.needed+'">Subir a '+esc(budget.money(sf.needed))+'</button>':'')+(lighter?'<button type="button" class="secondary-button" data-level="'+esc(lighter[0])+'">Probar «'+esc(lighter[1].name)+'»</button>':'')+'</div>';}result.innerHTML='<h2 id="autoBuildTitle">'+(sf?'No alcanza el presupuesto':'Tu propuesta')+'</h2><p'+(sf?' class="planner-shortfall" role="status"':'')+'>'+esc(response.reason)+'</p>'+actions;$('plannerBudgetFeedback').textContent=response.reason;lastAnnouncement=response.reason+' Objetivo '+budget.money(selectedBudget)+'.';if(shouldAnnounce)announce();return;}
    const p=current,profile=auto.profiles[level],before=new Map((previous?.rows||[]).map(r=>[r.product.category,r.product.id]));
    const changed=previous?[...new Set([...before.keys(),...p.rows.map(r=>r.product.category)])].filter(id=>before.get(id)!==p.rows.find(r=>r.product.category===id)?.product.id):[];
    const changeText=!previous?'Tu propuesta está lista.':changed.length?`${changed.length===1?'1 pieza actualizada':changed.length+' piezas actualizadas'}: ${changed.map(categoryName).join(', ')}.`:'La selección de piezas se mantiene con este presupuesto.';
    const status=p.relation==='within-reference'?'Las referencias caben en tu objetivo.':p.relation==='range-crosses-budget'?'El rango cruza tu presupuesto: hay que ajustar o cotizar.':'La alternativa más económica disponible supera tu objetivo en '+budget.money(p.high-selectedBudget)+'.';
    const summary=[['cpu','Procesador'],['gpu','Gráficos'],['ram','Memoria'],['storage','SSD']].map(([category,label])=>{
      const row=p.rows.find(r=>r.product.category===category),name=row?.product.name||(category==='gpu'?'Integrados en el procesador':'Por elegir');
      return `<div class="${changed.includes(category)?'is-updated':''}" data-preview-category="${category}"><dt>${label}${changed.includes(category)?'<span class="planner-change-badge">Cambio</span>':''}</dt><dd>${esc(name)}</dd></div>`;
    }).join('');
    result.classList.remove('is-empty');
    const prevRows=new Map((previous?.rows||[]).map(r=>[r.product.category,r]));
    const gpuRow={product:{category:'gpu',name:'Gráficos integrados',image:'assets/categories/gpu.png'},reference:null};
    const shown=order.map(category=>p.rows.find(r=>r.product.category===category)||(category==='gpu'?gpuRow:null)).filter(Boolean);
    const rowsHtml=shown.map(row=>{
      const category=row.product.category,upd=changed.includes(category),label=categoryName(category),short=shortName(row.product),ref=row.reference;
      const priceHtml=!ref?'<b>Incluido</b>':ref.low===ref.high?'<b>'+esc(budget.money(ref.low))+'</b>':'<b>'+esc(budget.money(ref.low))+'</b><small>– '+esc(budget.money(ref.high))+'</small>';
      return `<li class="${upd?'is-updated':''}" data-preview-category="${category}" aria-label="${esc(label+': '+short)}"><span class="planner-row-frame" style="--category-photo:url('${esc(thumb('assets/categories/'+category+'.png'))}')"><img class="planner-row-photo" src="${esc(thumb(row.product.image||''))}" alt="${esc(label+': '+short)}" width="56" height="56" loading="eager" decoding="async"></span><span class="planner-row-text"><strong class="planner-row-name">${esc(short)}</strong><small class="planner-row-key">${esc(keyFact(row.product,p))}${upd?'<span class="planner-change-badge">Cambio</span>':''}</small></span><span class="planner-row-price">${priceHtml}</span></li>`;
    }).join('');
    const whyHtml=shown.map(row=>{const category=row.product.category;return '<li class="planner-why-item"><strong>'+esc(shortName(row.product))+'</strong> '+esc(row.reference?why(row,p,profile,changed.includes(category)?prevRows.get(category):null):'Suficiente para este perfil, sin tarjeta dedicada.')+'</li>';}).join('');
    const sources=p.rows.map(({product,reference:r})=>`<li>${esc(product.name)} · ${r.kind==='recent'?'consulta reciente':r.kind==='published'?'precio publicado, stock por confirmar':r.kind==='historical'?'consulta histórica':'rango de catálogo'} · ${esc(r.date.slice(0,10))} · <a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Fuente del importe</a></li>`).join('');
    result.innerHTML=`<header class="planner-result-heading"><h2 id="autoBuildTitle">Tu propuesta</h2><p class="planner-total"><strong title="${p.allRecent?'Subtotal consultado':'Referencia de coste'}">${price(p)}</strong></p><ul class="planner-chips"><li>${esc(profile.name)}</li><li>${p.parts.length} piezas</li><li>objetivo ${budget.money(selectedBudget)}</li></ul></header>
      <ul class="planner-rows">${rowsHtml}</ul>
      ${p.relation==='within-reference'?'':'<p class="planner-budget-status">'+status+'</p>'}
      <div class="planner-result-actions"><button type="button" class="primary-button" id="useAutomaticBuild">Usar esta propuesta en Mi build</button></div><p id="automaticImportStatus" role="status"></p>
      <details id="plannerWhy" class="planner-notes planner-why"${keepOpen('plannerWhy')}><summary>¿Por qué estas piezas?</summary><ul>${whyHtml}</ul></details>
      <details id="plannerNotes" class="planner-notes"${keepOpen('plannerNotes')}><summary>Más info</summary>
      ${previous?"<p>"+esc(changeText)+"</p>":""}
      ${!p.allRecent?'<p>Confirma el precio actual antes de comprar.</p>':''}
      <section class="planner-note"><h3>Fuentes de los importes</h3><ul>${sources}</ul></section>
      ${p.gaps.length?`<section class="planner-note"><h3>Prioridades que aún no cubre</h3><ul>${p.gaps.map(g=>'<li>'+esc(g)+'</li>').join('')}</ul></section>`:''}
      ${fps()}<section class="planner-note"><h3>Compatibilidad, refrigeración y alcance</h3><p>Comprobación parcial por fichas: no hay conflictos detectados en los datos revisados. Confirma BIOS, QVL, conectores, cables, soporte de SSD y montaje. No se ha probado físicamente esta combinación.</p><p>El 4000D incluye dos ventiladores de gabinete. La lista añade un VENTO 120; el disipador incluye su ventilador y el AIO sus dos ventiladores/controlador. No se cobran dos veces. El AIO de 240 mm requiere comprobar espacio superior, RAM, kit AM5, SATA y USB interno.</p><p>Las prioridades de CPU, RAM, SSD y VRAM ordenan la selección; no son una nota de rendimiento. Los modelos sin precio documentado no se incluyen en una suma. Monitor, periféricos, sistema operativo, envío y montaje van aparte.</p></section></details>`;
    $('plannerBudgetFeedback').innerHTML=`<div><span>Tu propuesta · ${p.parts.length} piezas</span><strong>${price(p)}</strong><small>${p.allRecent?'Subtotal consultado':'Precio de referencia'}</small></div><dl class="planner-mini-overview">${summary}</dl><p>${esc(changeText)}</p><button type="button" class="secondary-button" data-view-proposal>Revisar propuesta completa</button>`;
    lastAnnouncement=changeText+' Objetivo '+budget.money(selectedBudget)+'. '+status;if(shouldAnnounce)announce();
  }
  function update(){labels();if(built)generate();interactionStart=null;}
  root.addEventListener('input',e=>{if(e.target.id!=='startBudgetRange')return;if(!interactionStart)interactionStart=current;$('plannerLiveStatus').setAttribute('aria-live','off');constrain(Number(e.target.value));labels();if(built)result.setAttribute('aria-busy','true');if(timer===undefined)timer=setTimeout(()=>{timer=undefined;if(built)generate(false);},80);});
  root.addEventListener('change',e=>{if(e.target.name==='startUse'){use=e.target.value;level=defaults[use];constrain(selectedBudget,true);levels();}else if(e.target.id==='startBudgetRange')constrain(Number(e.target.value));else return;clearTimeout(timer);timer=undefined;remember();update();});
  root.addEventListener('click',e=>{
    if(e.target.closest('[data-build-proposal]')){built=true;lastPlanKey='';interactionStart=null;labels();generate(true);const heading=$('autoBuildTitle');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});const mobile=!!window.matchMedia?.('(max-width:1023px)')?.matches;result.scrollIntoView({block:mobile?'start':'nearest',behavior:e.detail===0||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'instant':'smooth'});return;}
    if(e.target.closest('[data-view-proposal]')){const heading=$('autoBuildTitle');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});result.scrollIntoView({block:'start',behavior:e.detail===0||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'instant':'smooth'});return;}
    const choice=e.target.closest('[data-level]');if(choice){level=choice.dataset.level;constrain(selectedBudget,true);remember();levels();update();$('startLevels').querySelector(`[data-level="${level}"]`).focus({preventScroll:true});return;}
    const setTo=e.target.closest('[data-budget-set]');if(setTo){constrain(Number(setTo.dataset.budgetSet));remember();update();return;}
    const step=e.target.closest('[data-budget-delta]');if(step){constrain(selectedBudget+Number(step.dataset.budgetDelta)*budget.step);remember();update();return;}
    if(e.target.closest('#useAutomaticBuild')&&current){remember();const reasons=Object.fromEntries(current.rows.map(r=>[r.product.id,why(r,current,auto.profiles[level],null)]));window.dispatchEvent(new CustomEvent('fenixa-request-build-import',{detail:{parts:current.parts.slice(),reasons}}));location.hash='mi-build';}
  });
  $('startParts').addEventListener('click',()=>{remember();location.hash='componentes';});
  $('startProposals').addEventListener('click',()=>{remember();window.dispatchEvent(new CustomEvent('fenixa-find-builds',{detail:{use,max:selectedBudget}}));location.hash='builds';});
  window.addEventListener('fenixa-budget-changed',()=>{selectedBudget=clamp(budget.get()||selectedBudget);update();});
  window.addEventListener('fenixa-build-changed',labels);
  levels();update();
})();
