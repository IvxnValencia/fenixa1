// Shared specification radar. Missing values never become zero; family options stay discrete.
(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(v);
  const money=v=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v);
  const clean=v=>(Array.isArray(v)?v:[v]).filter(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0);
  function model(input) {
    return input.map((a,index)=>{
      const sets=(a.sets||[null,null]).map(clean);
      const max=Math.max(0,...sets.flat());
      const rank=sets.every(s=>s.length===1)?0:sets.every(s=>s.length)?1:sets.some(s=>s.length)?2:3;
      return {...a,sets,max,rank,index,normalized:sets.map(s=>s.map(n=>max>0?n/max:0))};
    }).sort((a,b)=>a.rank-b.rank||a.index-b.index).slice(0,6);
  }
  const sourceLink=s=>/^https:\/\//.test(s?.source||'')?`<a href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">Ficha de referencia</a>${s.checkedAt?` · consulta ${esc(s.checkedAt)}`:''}${(s.additionalSources||[]).filter(f=>/^https:\/\//.test(f.source||'')).map(f=>` · <a href="${esc(f.source)}" target="_blank" rel="noopener noreferrer">${esc(f.label||'Fuente adicional')}</a>`).join('')}`:'Fuente numérica pendiente';
  const axisSource=(s,key)=>{
    const field=s?.fieldSources?.[key];
    return field?{...s,...(typeof field==='string'?{source:field}:field)}:s;
  };
  const nameControl=(name,index)=>`<button type="button" class="radar-name-control" data-radar-highlight="${index}" aria-pressed="false" aria-label="Resaltar gráfico de ${esc(name)}">${esc(name)}</button>`;
  function render({names,axes:input,sources=[],title='Radar de especificaciones'}) {
    const axes=model(input);
    if(axes.length<3)throw new Error('Radar schemas require at least three documented metric definitions');
    const common=axes.filter(a=>a.sets.every(s=>s.length)).length;
    const any=axes.some(a=>a.sets.some(s=>s.length));
    const options=axes.some(a=>a.sets.some(s=>s.length>1));
    const point=(i,r)=>{const angle=-Math.PI/2+2*Math.PI*i/axes.length;return [220+Math.cos(angle)*r,180+Math.sin(angle)*r];};
    const coords=p=>p.map(n=>n.toFixed(2)).join(',');
    const grid=r=>axes.map((_,i)=>coords(point(i,r))).join(' ');
    const series=s=>{
      const full=axes.every(a=>a.sets[s].length===1);
      const shape=full?`<polygon class="radar-shape radar-series-${s}" points="${axes.map((a,i)=>coords(point(i,110*a.normalized[s][0]))).join(' ')}"/>`:axes.map((a,i)=>{
        const next=(i+1)%axes.length;
        if(a.sets[s].length!==1||axes[next].sets[s].length!==1)return '';
        const [x1,y1]=point(i,110*a.normalized[s][0]),[x2,y2]=point(next,110*axes[next].normalized[s][0]);
        return `<line class="radar-segment radar-series-${s}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      }).join('');
      return `<g class="radar-series-group" data-radar-plot="${s}">`+shape+axes.map((a,i)=>a.normalized[s].map((v,j)=>{const [x,y]=point(i,110*v);return `<circle class="radar-point radar-series-${s}${a.sets[s].length>1?' radar-option':''}" cx="${x}" cy="${y}" r="${a.sets[s].length>1?4:3}"><title>${esc(names[s])}: ${esc(a.label)} ${number(a.sets[s][j])} ${esc(a.unit)}${a.sets[s].length>1?' · opción de familia, no configuración elegida':''}</title></circle>`;}).join('')).join('')+'</g>';
    };
    return `<section class="laptop-radar-section comparison-radar" data-radar-section aria-label="${esc(title)}"><h4>${esc(title)}</h4><p class="radar-coverage">${common}/${axes.length} ejes con cifras en todos los modelos${options?' · incluye opciones de familia':''}${!any?' · no hay cifras estructuradas para esta selección':''}</p><div class="laptop-radar-legend">${names.map((name,i)=>`<span class="series-${i}">${String.fromCharCode(65+i)} · ${nameControl(name,i)}</span>`).join('')}</div><div class="laptop-radar-layout"><svg class="laptop-radar" viewBox="0 0 440 360" role="group" aria-label="Radar: magnitudes publicadas; datos pendientes sin dibujar">${[.25,.5,.75,1].map(r=>`<polygon class="radar-grid" points="${grid(110*r)}"/>`).join('')}${axes.map((_,i)=>{const [x,y]=point(i,110);return `<line class="radar-grid" x1="220" y1="180" x2="${x}" y2="${y}"/>`;}).join('')}${names.map((_,i)=>series(i)).join('')}${axes.map((a,i)=>{const [x,y]=point(i,150);return `<g role="button" tabindex="0" data-radar-axis="${esc(a.key)}" aria-label="Ver datos y límites de ${esc(a.label)}"><rect x="${x-59}" y="${y-21}" width="118" height="42" rx="12"/><text x="${x}" y="${y-3}" text-anchor="middle">${esc(a.short||a.label)}</text><text class="radar-unit" x="${x}" y="${y+13}" text-anchor="middle">${esc(a.unit||'cantidad')}</text></g>`;}).join('')}</svg><div class="laptop-radar-values"><h5>Cifras del gráfico</h5><table><thead><tr><th scope="col">Métrica</th>${names.map((_,i)=>`<th scope="col">${String.fromCharCode(65+i)}</th>`).join('')}</tr></thead><tbody>${axes.map(a=>`<tr><th scope="row"><button type="button" data-radar-axis="${esc(a.key)}">${esc(a.short||a.label)}<small>${esc(a.unit||'cantidad')}</small></button></th>${a.sets.map(s=>`<td>${s.length?s.map(number).join(' / '):'<span class="radar-pending">Pendiente</span>'}${s.length>1?'<small>Opciones</small>':''}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div><p class="radar-highlight-help">Pasa por un nombre o enfócalo con el teclado para resaltar su figura. Toca el nombre para fijarla o liberarla.</p><p class="laptop-radar-method">Toca un eje para ver datos y fuentes. Centro = cero; borde = mayor cifra documentada de la selección para ese eje. Cada eje tiene su propia escala. Un dato pendiente no se dibuja: no significa cero. Los círculos huecos son opciones independientes de una familia, no una configuración combinada. Solo se rellena una figura cuando todos sus ejes tienen un único dato. Más área no significa mejor equipo ni mayor velocidad o rentabilidad. No se compara contra una media de categoría.</p><div class="radar-explanations">${axes.map(a=>`<details data-radar-detail="${esc(a.key)}"><summary>${esc(a.label)} · explicación y fuentes</summary><p>${esc(a.help||'Magnitud publicada, no nota de calidad ni rendimiento. Un valor mayor no es necesariamente mejor.')}</p>${names.map((_,s)=>`<p><b>${String.fromCharCode(65+s)} · ${esc(names[s])}</b>: ${a.sets[s].length?`${a.sets[s].map(number).join(' / ')} ${esc(a.unit)}${a.sets[s].length>1?' · alternativas documentadas; confirma el SKU':''}`:'dato numérico pendiente'}. ${sourceLink(axisSource(sources[s],a.key))}${sources[s]?.scope?`<br>${esc(sources[s].scope)}`:''}</p>`).join('')}</details>`).join('')}</div></section>`;
  }
  function componentAxes(a,b) {
    const result=window.FENIXA_SPECS.compare(a,b);
    if(!result)return [];
    const definitions={
      cpu:[['cores','Núcleos'],['threads','Hilos'],['boost','Turbo'],['l3','Caché L3'],['lanes','Líneas PCIe'],['base','Base']],
      gpu:[['vram','VRAM'],['gpuBoost','Boost'],['bus','Bus'],['memorySpeed','Memoria'],['length','Longitud'],['recommendedPsu','Fuente']],
      ram:[['capacity','Capacidad'],['rate','Perfil RAM'],['defaultRate','Base RAM'],['cl','CAS'],['modules','Módulos'],['voltage','Voltaje']],
      storage:[['capacity','Capacidad'],['read','Lectura'],['write','Escritura'],['tbw','Resistencia']],
      board:[['slots','Ranuras RAM'],['maxRam','RAM máxima'],['m2Slots','M.2 SSD']],
      case:[['gpuMax','Espacio GPU'],['coolerMax','Espacio CPU'],['width','Ancho'],['height','Altura'],['depth','Fondo']],
      power:[['watts','Potencia'],['length','Longitud'],['warrantyYears','Garantía']],
      cooler:[['height','Altura'],['rpm','RPM'],['noise','Ruido']],
      fan:[['rpm','RPM'],['airflow','Flujo de aire'],['pressure','Presión']],
      setup:[['width','Ancho'],['height','Altura'],['weight','Peso']]
    };
    const units={cores:'núcleos',threads:'hilos',lanes:'líneas',slots:'ranuras',modules:'módulos',width:'mm',length:'mm',height:'mm',depth:'mm',weight:'g',warrantyYears:'años',rpm:'RPM',noise:'dBA',airflow:'CFM'};
    const axes=(definitions[a.category]||definitions.setup).map(([key,short])=>{
      const r=result.rows.find(r=>r.key===key);
      return {key,short,label:r?.label||short,unit:r?.unit||units[key]||'cantidad',help:r?.help||'Característica nominal publicada por el fabricante, no una prueba de rendimiento. Un valor mayor no establece calidad, velocidad real ni un ganador; confirma la referencia y sus condiciones de uso.',sets:[r?.a,r?.b]};
    });
    return model(axes);
  }
  function coverage(a,b) {
    const axes=componentAxes(a,b);
    return {common:axes.filter(axis=>axis.sets.every(set=>set.length>0)).length,total:axes.length};
  }
  function component(a,b) {
    const result=window.FENIXA_SPECS.compare(a,b);
    if(!result)return '';
    return render({names:[result.sources[0].displayName||a.name,result.sources[1].displayName||b.name],axes:componentAxes(a,b),sources:result.sources});
  }
  function pricesMany(ps) {
    const market=window.FENIXA_MARKET, offers=ps.map(p=>market.fixed(p)), prices=offers.map(o=>o?.price??null);
    const max=Math.max(0,...prices.filter(Number.isFinite)), complete=prices.every(p=>p!==null);
    const min=complete?Math.min(...prices):null;
    return `<section class="radar-price-chart"><h3>Precios publicados y consultados · COP</h3>${prices.map((price,i)=>`<div class="laptop-bar-row"><span class="laptop-series-key series-${i}">${String.fromCharCode(65+i)}</span><div class="laptop-bar-track" aria-hidden="true">${price!==null?`<span class="laptop-bar-fill series-${i}" style="width:${price/max*100}%"></span>`:''}</div><strong>${price!==null?money(price):'Por confirmar'}</strong></div><p class="price-source-note">${offers[i]?`<a href="${esc(offers[i].url)}" target="_blank" rel="noopener noreferrer">${esc(offers[i].store)} ↗</a> · ${esc(new Date(offers[i].checkedAt).toLocaleDateString('es-CO',{timeZone:'America/Bogota'}))} · ${market.recent(offers[i])?'consulta reciente':'consulta vencida'}${offers[i].status==='listed'?' · precio publicado; stock y presentación por confirmar':''}${complete?` · ${price===min?'Menor importe consultado':money(price-min)+' más que el menor importe'}`:''}`:'Sin oferta exacta; no se usa un rango aproximado.'}</p>`).join('')}<p>${complete?'Diferencias calculadas sobre estos importes documentados, que pueden corresponder a fechas distintas.':'Faltan precios: no calculamos una diferencia completa.'} No son precios en vivo ni un ganador de rendimiento. Confirma stock, impuestos y envío en la tienda.</p></section>`;
  }
  const prices=(a,b)=>pricesMany([a,b]);
  function componentMany(ps) {
    const axes=componentAxes(ps[0],ps[1]).map(axis=>({...axis,sets:ps.map(p=>window.FENIXA_SPECS.facts(p).values[axis.key])}));
    return render({names:ps.map(p=>window.FENIXA_SPECS.facts(p).displayName||p.name),axes,sources:ps.map(window.FENIXA_SPECS.facts)});
  }
  function reveal(event) {
    const trigger=event.target.closest?.('[data-radar-axis]');
    if(!trigger)return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    if(event.type==='keydown')event.preventDefault();
    const section=trigger.closest('[data-radar-section]');
    const detail=Array.from(section?.querySelectorAll('[data-radar-detail]')||[]).find(d=>d.dataset.radarDetail===trigger.dataset.radarAxis);
    if(detail){detail.open=true;detail.scrollIntoView({block:'nearest'});detail.querySelector('summary')?.focus({preventScroll:true});}
  }
  if(typeof document!=='undefined'){document.addEventListener('click',reveal);document.addEventListener('keydown',reveal);}
  // Missing values stay visible when showing differences: absence is not equality.
  const rowHasDifference=values=>values.some(v=>v===null||v===undefined)||new Set(values.map(v=>JSON.stringify(v))).size>1;
  window.FENIXA_RADAR={model,render,component,componentAxes,coverage,prices,pricesMany,componentMany,nameControl,rowHasDifference};
})();
