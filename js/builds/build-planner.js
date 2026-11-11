(() => {
  'use strict';
  const $=id=>document.getElementById(id),root=$('startBuild'),budget=window.FENIXA_BUDGET,auto=window.FENIXA_AUTO_BUILD;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const useNames={estudio:'Estudio y trabajo',gaming:'Gaming',creativo:'Diseño y creación'};
  const defaults={estudio:'estudio-esencial',gaming:'gaming-casual',creativo:'creativo-2d'};
  let use='estudio',level=defaults.estudio,selectedBudget=budget.get()||4500000,contextSaved=true,current=null,timer,budgetAdjustment='',lastPlanKey='';
  try{const old=JSON.parse(localStorage.getItem('fenixa-builder')||'{}');if(useNames[old.use])use=old.use;level=auto.profiles[old.level]?.use===use?old.level:defaults[use];}catch{contextSaved=false;}
  const maxForProfile=()=>Math.min(budget.max,auto.profiles[level].maxBudget);
  const clamp=value=>Math.max(budget.min,Math.min(maxForProfile(),Math.round(value/budget.step)*budget.step));
  function constrain(value,notify=false){selectedBudget=clamp(value);budgetAdjustment=notify&&selectedBudget<value?'Tu objetivo se ajustó al máximo de este perfil. ':'';}
  constrain(selectedBudget);
  const budgetField=$('startBudgets').closest('fieldset');budgetField.className='start-field planner-budget-field';
  root.querySelector('.start-controls').classList.add('planner-controls');
  const levelField=document.createElement('fieldset');levelField.className='start-field planner-level-field';
  levelField.innerHTML='<legend><span>2</span> Elige tu perfil</legend><p class="builder-step-help">Elige la opción más cercana a tus actividades. Puedes volver y cambiarla en cualquier momento.</p><div id="startLevels" class="planner-levels"></div><button type="button" class="secondary-button builder-continue" data-builder-step="plannerBudget">Ajustar presupuesto</button>';
  budgetField.before(levelField);
  $('startBudgets').className='planner-budget';
  $('startBudgets').innerHTML=`<div class="planner-budget-heading"><label for="startBudgetRange">Tu presupuesto</label><output id="startBudgetOutput" for="startBudgetRange" aria-live="off"></output></div><input type="range" id="startBudgetRange" min="${budget.min}" max="${maxForProfile()}" step="${budget.step}" value="${selectedBudget}" aria-describedby="startBudgetLimit startBudgetHelp"><div class="planner-range-labels"><span>$1 millón</span><span id="startBudgetMax"></span></div><div class="planner-stepper"><button type="button" data-budget-delta="-1" aria-label="Reducir presupuesto en 250.000 pesos">−</button><span>Pasos de $250.000 COP</span><button type="button" data-budget-delta="1" aria-label="Aumentar presupuesto en 250.000 pesos">+</button></div><div id="plannerBudgetFeedback" class="planner-budget-feedback"></div><p id="startBudgetLimit" role="status"></p><p id="startBudgetHelp">El presupuesto guía la selección. El coste usa referencias fechadas; confirma precios actuales antes de comprar.</p><p id="plannerLiveStatus" class="planner-live-status" role="status" aria-live="polite" aria-atomic="true"></p>`;
  budgetField.querySelector('legend').innerHTML='<span>3</span> Ajusta tu presupuesto';
  const oldHint=budgetField.querySelector('.start-hint');if(oldHint)oldHint.hidden=true;
  const path=$('startParts').closest('fieldset');path.className='start-field planner-paths';path.querySelector('legend').textContent='También puedes explorar a tu ritmo';
  const result=document.createElement('section');result.id='autoBuildResult';result.className='planner-result';result.setAttribute('aria-labelledby','autoBuildTitle');budgetField.after(result);
  const workspace=document.createElement('div');workspace.id='plannerWorkspace';workspace.className='planner-workspace';workspace.setAttribute('role','group');workspace.setAttribute('aria-label','Presupuesto y propuesta');
  const details=document.createElement('section');details.id='plannerDetails';details.className='planner-details';details.setAttribute('aria-label','Piezas, fuentes y comprobaciones');
  budgetField.before(workspace);workspace.append(budgetField);workspace.append(result);workspace.append(details);
  function remember(){try{const old=JSON.parse(localStorage.getItem('fenixa-builder')||'{}');localStorage.setItem('fenixa-builder',JSON.stringify({...old,use,level}));contextSaved=true;}catch{contextSaved=false;}budget.set(selectedBudget);}
  function levels(){
    $('startLevels').innerHTML=Object.entries(auto.profiles).filter(([,p])=>p.use===use).map(([id,p])=>`<button type="button" class="planner-level" data-level="${id}" aria-pressed="${id===level}"><span class="planner-level-title">${esc(p.name)}<span class="planner-selection-dot" aria-hidden="true"></span></span><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></button>`).join('');
  }
  function labels(){
    const text=budget.money(selectedBudget),slider=$('startBudgetRange'),profileMax=maxForProfile();slider.max=profileMax;slider.value=selectedBudget;slider.setAttribute('aria-valuetext',text+' pesos colombianos');slider.style.setProperty('--range-progress',((selectedBudget-budget.min)/(profileMax-budget.min)*100)+'%');
    $('startBudgetMax').textContent='$'+(profileMax/1000000)+' millones';
    const limitText=budgetAdjustment+'Hasta '+budget.money(profileMax)+' para '+auto.profiles[level].name+'. Puedes elegir un presupuesto menor.';
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
    return `<details id="plannerFps" class="planner-fps"${keepOpen('plannerFps')}><summary>Juegos y objetivos de FPS</summary><p>Estos son objetivos de uso, no FPS medidos ni estimaciones para esta lista. Deben validarse en una prueba de la combinación exacta.</p><table><thead><tr><th>Juego</th><th>Objetivo</th><th>Condiciones de planificación</th></tr></thead><tbody>${games.map(game=>`<tr><th scope="row">${game}</th><td>${level==='gaming-competitivo'?144:60} FPS</td><td>${level==='gaming-competitivo'?'1080p, ajustes competitivos':level==='gaming-casual'?'1080p, ajustes bajos/medios':'1080p–1440p, ajustar calidad'} · sin RT ni generación de fotogramas</td></tr>`).join('')}</tbody></table><p>Riot publica categorías de 30, 60 y 144 FPS para su propio hardware de VALORANT; no son resultados de esta build. <a href="https://support.riotgames.com/es-es/valorant/support-tools/minimum-recommended-pc-specs" target="_blank" rel="noopener noreferrer">Requisitos oficiales de Riot</a>.</p></details>`;
  }
  let interactionStart=null,lastAnnouncement='';
  function announce(){const live=$('plannerLiveStatus');live.setAttribute('aria-live','polite');if(live.textContent!==lastAnnouncement)live.textContent=lastAnnouncement;}
  function changeDetails(previous,next,profile,changed){
    if(!previous||!changed.length)return '';
    const metrics={cpu:[previous.cpu?.cores,next.cpu?.cores,'núcleos declarados'],ram:[previous.ram?.capacity,next.ram?.capacity,'GB de RAM'],storage:[previous.disk?.capacity,next.disk?.capacity,'GB de almacenamiento'],gpu:[previous.gpu?.vram||0,next.gpu?.vram||0,'GB de VRAM dedicada']};
    return `<details id="plannerChanges"${keepOpen('plannerChanges')}><summary>Qué cambió y por qué · ${changed.length} ${changed.length===1?'pieza':'piezas'}</summary><p>La selección se recalcula para tu objetivo de ${budget.money(selectedBudget)} y el perfil ${esc(profile.name)}. Primero busca combinaciones dentro del presupuesto de referencia y después prioriza núcleos, RAM, almacenamiento y VRAM según este perfil; en igualdad de prioridades, compara el coste de referencia. Son datos declarados y costes fechados, no mediciones de rendimiento.</p><ul>${changed.map(category=>{const old=previous.rows.find(r=>r.product.category===category),row=next.rows.find(r=>r.product.category===category),metric=metrics[category];return `<li><strong>${esc(categoryName(category))}</strong><p>${esc(old?.product.name||'Sin pieza dedicada')} → ${esc(row?.product.name||'Sin pieza dedicada')}</p>${metric?`<p>${esc(metric[2])}: ${esc(metric[0])} → ${esc(metric[1])}.</p>`:''}<p>Coste de referencia de la pieza: ${old?price(old.reference):'Sin pieza dedicada'} → ${row?price(row.reference):'Sin pieza dedicada'}. Confirma el precio actual en sus fuentes.</p></li>`;}).join('')}</ul></details>`;
  }
  function generate(shouldAnnounce=true){
    result.setAttribute('aria-busy','false');
    const planKey=level+'|'+selectedBudget;if(planKey===lastPlanKey){if(shouldAnnounce)announce();return;}lastPlanKey=planKey;
    const previous=interactionStart||current,response=auto.generate(level,selectedBudget);current=response.proposal;
    if(!current){details.innerHTML='';details.hidden=true;result.innerHTML='<h2 id="autoBuildTitle">Tu propuesta</h2><p>'+esc(response.reason)+'</p>';$('plannerBudgetFeedback').textContent=response.reason;lastAnnouncement=response.reason+' Objetivo '+budget.money(selectedBudget)+'.';if(shouldAnnounce)announce();return;}
    const p=current,profile=auto.profiles[level],before=new Map((previous?.rows||[]).map(r=>[r.product.category,r.product.id]));
    const changed=previous?[...new Set([...before.keys(),...p.rows.map(r=>r.product.category)])].filter(id=>before.get(id)!==p.rows.find(r=>r.product.category===id)?.product.id):[];
    const changeText=!previous?'Tu propuesta está lista.':changed.length?`${changed.length===1?'1 pieza actualizada':changed.length+' piezas actualizadas'}: ${changed.map(categoryName).join(', ')}.`:'La selección de piezas se mantiene con este presupuesto.';
    const status=p.relation==='within-reference'?'Las referencias caben en tu objetivo.':p.relation==='range-crosses-budget'?'El rango cruza tu presupuesto: hay que ajustar o cotizar.':'La alternativa más económica disponible supera tu objetivo en '+budget.money(p.high-selectedBudget)+'.';
    const summary=[['cpu','Procesador'],['gpu','Gráficos'],['ram','Memoria'],['storage','SSD']].map(([category,label])=>{
      const row=p.rows.find(r=>r.product.category===category),name=row?.product.name||(category==='gpu'?'Integrados en el procesador':'Por elegir');
      return `<div class="${changed.includes(category)?'is-updated':''}" data-preview-category="${category}"><dt>${label}${changed.includes(category)?'<span class="planner-change-badge">Cambio</span>':''}</dt><dd>${esc(name)}</dd></div>`;
    }).join('');
    result.innerHTML=`<header class="planner-result-heading"><div><h2 id="autoBuildTitle">Tu propuesta</h2><p>${esc(profile.name)} · ${p.parts.length} piezas · objetivo ${budget.money(selectedBudget)}</p></div><div class="planner-total"><small>${p.allRecent?'Subtotal consultado':'Referencia de coste'}</small><strong>${price(p)}</strong></div></header>
      <p class="planner-update">${esc(changeText)}</p><dl class="planner-overview">${summary}</dl>
      <p class="planner-budget-status">${status}${!p.allRecent?' El coste actual está por confirmar.':''}</p>
      <div class="planner-result-actions"><button type="button" class="primary-button" id="useAutomaticBuild">Usar esta propuesta en Mi build</button><span>Podrás cambiar sus piezas después.</span></div><p id="automaticImportStatus" role="status"></p>`;
    details.hidden=false;details.innerHTML=`${p.gaps.length?`<details id="plannerGaps" class="planner-gaps"${keepOpen('plannerGaps')}><summary>${p.gaps.length} prioridades que aún no cubre</summary><ul>${p.gaps.map(g=>'<li>'+esc(g)+'</li>').join('')}</ul></details>`:''}
      <details id="plannerAllParts" class="planner-all-parts"${keepOpen('plannerAllParts')}><summary>Ver las ${p.parts.length} piezas y sus fuentes</summary><div class="planner-parts">${p.rows.map(({product,reference:r})=>`<article class="${changed.includes(product.category)?'is-updated':''}"><span>${esc(categoryName(product.category))}${changed.includes(product.category)?' · Cambio':''}</span><h3>${esc(product.name)}</h3><strong>${price(r)}</strong><small>${r.kind==='recent'?'Consulta reciente':r.kind==='published'?'Precio publicado · stock por confirmar':r.kind==='historical'?'Consulta histórica':'Rango de catálogo'} · ${esc(r.date.slice(0,10))}</small><a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Fuente del importe</a></article>`).join('')}</div></details>
      ${fps()}<details id="plannerChecks" class="planner-checks"${keepOpen('plannerChecks')}><summary>Compatibilidad, refrigeración y alcance</summary><p>Comprobación parcial por fichas: no hay conflictos detectados en los datos revisados. Confirma BIOS, QVL, conectores, cables, soporte de SSD y montaje. No se ha probado físicamente esta combinación.</p><p>El 4000D incluye dos ventiladores de gabinete. La lista añade un VENTO 120; el disipador incluye su ventilador y el AIO sus dos ventiladores/controlador. No se cobran dos veces. El AIO de 240 mm requiere comprobar espacio superior, RAM, kit AM5, SATA y USB interno.</p><p>Las prioridades de CPU, RAM, SSD y VRAM ordenan la selección; no son una nota de rendimiento. Los modelos sin precio documentado no se incluyen en una suma. Monitor, periféricos, sistema operativo, envío y montaje van aparte.</p></details>`;
    $('plannerBudgetFeedback').innerHTML=`<div><span>Tu propuesta · ${p.parts.length} piezas</span><strong>${price(p)}</strong><small>${p.allRecent?'Subtotal consultado':'Referencia de coste · confirma el total actual'}</small></div><dl class="planner-mini-overview">${summary}</dl><p>${esc(changeText)}</p><button type="button" class="secondary-button" data-view-proposal>Revisar propuesta completa</button>`;
    if(previous&&changed.length)details.insertAdjacentHTML('afterbegin',changeDetails(previous,p,profile,changed));
    lastAnnouncement=changeText+' Objetivo '+budget.money(selectedBudget)+'. '+status;if(shouldAnnounce)announce();
  }
  function update(){labels();generate();interactionStart=null;}
  root.addEventListener('input',e=>{if(e.target.id!=='startBudgetRange')return;if(!interactionStart)interactionStart=current;$('plannerLiveStatus').setAttribute('aria-live','off');constrain(Number(e.target.value));labels();result.setAttribute('aria-busy','true');if(timer===undefined)timer=setTimeout(()=>{timer=undefined;generate(false);},80);});
  root.addEventListener('change',e=>{if(e.target.name==='startUse'){use=e.target.value;level=defaults[use];constrain(selectedBudget,true);levels();}else if(e.target.id==='startBudgetRange')constrain(Number(e.target.value));else return;clearTimeout(timer);timer=undefined;remember();update();});
  root.addEventListener('click',e=>{
    if(e.target.closest('[data-view-proposal]')){const heading=$('autoBuildTitle');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});result.scrollIntoView({block:'start',behavior:e.detail===0||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'instant':'smooth'});return;}
    const choice=e.target.closest('[data-level]');if(choice){level=choice.dataset.level;constrain(selectedBudget,true);remember();levels();update();$('startLevels').querySelector(`[data-level="${level}"]`).focus({preventScroll:true});return;}
    const step=e.target.closest('[data-budget-delta]');if(step){constrain(selectedBudget+Number(step.dataset.budgetDelta)*budget.step);remember();update();return;}
    if(e.target.closest('#useAutomaticBuild')&&current){remember();window.dispatchEvent(new CustomEvent('fenixa-request-build-import',{detail:{parts:current.parts.slice()}}));location.hash='mi-build';}
  });
  $('startParts').addEventListener('click',()=>{remember();location.hash='componentes';});
  $('startProposals').addEventListener('click',()=>{remember();window.dispatchEvent(new CustomEvent('fenixa-find-builds',{detail:{use,max:selectedBudget}}));location.hash='builds';});
  window.addEventListener('fenixa-budget-changed',()=>{selectedBudget=clamp(budget.get()||selectedBudget);update();});
  window.addEventListener('fenixa-build-changed',labels);
  levels();update();
})();
