(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(value);
  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
  const psref='https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_5_15AHP10/Legion_5_15AHP10_Spec.PDF';
  // Deliberate manufacturer facts, never numbers extracted from model names or prose.
  // Family facts contain only common values. Factory configurations are selected as a whole below.
  const facts={
    'lenovo-legion-83m00002us':{scope:'Configuración 83M00002US; CPU y ranuras corroborados en PSREF.',source:psref,checkedAt:'2026-10-01',values:{cores:[8],threads:[16],boost:[5.1],ram:[16],storage:[1000],vram:[8],ramRate:[5600],refresh:[165],screen:[15.1],slots:[2]}},
    'asus-zenbook-ux3405ma':{scope:'Familia UX3405MA: elige una versión documentada para comparar CPU, RAM y SSD juntos.',checkedAt:'2026-10-02',values:{screen:[14]}},
    'asus-tuf-fa507nv':{scope:'Familia FA507NV: elige LP023W o LP119W; CPU, RAM, SSD y panel se cargan juntos.',checkedAt:'2026-10-03',values:{vram:[8],screen:[15.6]}},
    'asus-proart-h7606wv':{scope:'H7606WV: versión ME088X documentada; no asumir la capacidad de otro sufijo.',checkedAt:'2026-10-03',values:{vram:[8],screen:[16]}},
    'msi-modern-15-h-ai-c2hmg':{scope:'C2HMG: características de familia, no RAM instalada ni CPU de una tienda.',checkedAt:'2026-10-01',values:{ramRate:[5600],screen:[15.6],slots:[2]}},
    'msi-thin-15-b13ve':{scope:'Familia B13VE de la ficha LATAM: elige un sufijo documentado; no se combinan opciones de CPU.',checkedAt:'2026-10-02',values:{ram:[16],storage:[512],vram:[6],ramRate:[3200],refresh:[144],screen:[15.6],slots:[2]}},
    'acer-aspire-go-ag15-31p-372g':{scope:'Configuración México AG15-31P-372G / NX.KRPAL.005: 8 GB instalados de referencia, no el máximo de 16 GB. Panel TN; gráficos integrados de memoria compartida. Sin turbo, tasa de RAM ni ranuras verificados.',checkedAt:'2026-10-01',values:{cores:[8],ram:[8],storage:[512],refresh:[60],screen:[15.6]}}
  };
  const asusGuide='https://dlcdnwebimgs.asus.com/files/media/0de32796-13f7-4be1-aabf-8ef3c5bc7830/product-guide/NB_ProductGuide_Q1_Q2_2024.pdf#page=11';
  const asusCpu='https://www.asus.com/us/laptops/for-home/zenbook/asus-zenbook-14-ux3405/techspec/';
  const msiLatam='https://latam.msi.com/Laptop/Thin-15-B13VX/Specification';
  const msiModernTw='https://tw.msi.com/Business-Productivity/Modern-15-H-AI-C2HMX/Specification';
  const tufGuide='https://www.asus.com/me-en/event/productguide/2024/Q1-24-ROG-Product-guide.pdf#page=34';
  const tufKh='https://www.asus.com/kh/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/';
  const tufCpu='https://www.asus.com/co/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/techspec/';
  const ryzen5='https://www.amd.com/en/products/processors/laptop/ryzen/7000-series/amd-ryzen-5-7535hs.html';
  const proartGuide='https://www.asus.com/me-en/event/productguide/2024/asus-product-guide.pdf#page=41';
  const proartCpu='https://www.asus.com/bd/laptops/for-creators/proart/proart-p16-h7606/techspec/';
  // Each record is a complete published row, NEVER a Cartesian product of family options.
  // ASUS guide JAN-AUG 2024, p.11; Nepal distributor on p.54. Panel Hz is omitted:
  // the historical guide says 90 Hz whereas the current family page lists 60/120 Hz.
  const configurations={
    'asus-tuf-fa507nv':[
      {id:'fa507nv-lp023w',model:'FA507NV-LP023W',label:'Ryzen 7 · 16 GB · 512 GB',region:'Emiratos Árabes Unidos · guía ASUS Q1 2024',source:tufGuide,checkedAt:'2026-10-03',scope:'Columna LP023W de la guía ASUS Q1 2024, página PDF 34 (impresa 66): Ryzen 7 7735HS, 16 GB DDR5, SSD 512 GB, RTX 4060 de 8 GB, FHD 144 Hz y Windows 11 Home. Núcleos, hilos y turbo corroborados por CPU en la ficha ASUS. No declara cantidad de módulos ni tasa efectiva de RAM; precio, teclado y stock colombianos pendientes.',fieldSources:{cores:tufCpu,threads:tufCpu,boost:tufCpu},values:{cores:[8],threads:[16],boost:[4.7],ram:[16],storage:[512],vram:[8],refresh:[144],screen:[15.6]},specs:[['Procesador','AMD Ryzen 7 7735HS · 8 núcleos / 16 hilos · turbo máximo 4,7 GHz'],['Gráficos','GeForce RTX 4060 Laptop · 8 GB; potencia y rendimiento de esta unidad por confirmar'],['Pantalla','15,6 pulgadas · 1920 × 1080 · 144 Hz'],['Memoria y almacenamiento','16 GB DDR5 · SSD NVMe PCIe 4.0 de 512 GB; módulos y tasa efectiva por confirmar']]},
      {id:'fa507nv-lp119w',model:'FA507NV-LP119W',label:'Ryzen 5 · 16 GB · 512 GB',region:'Camboya · ficha ASUS',source:tufKh,checkedAt:'2026-10-03',scope:'Tarjeta LP119W de ASUS Camboya: Ryzen 5 7535HS, 16 GB DDR5, SSD 512 GB, RTX 4060 de 8 GB, FHD 144 Hz y Windows 11 Home. Núcleos, hilos y turbo corroborados en AMD. No declara cantidad de módulos ni tasa efectiva de RAM. No usar la tarjeta LP082W: su GPU publicada es discrepante. Referencia regional, no oferta colombiana.',fieldSources:{cores:ryzen5,threads:ryzen5,boost:ryzen5},values:{cores:[6],threads:[12],boost:[4.55],ram:[16],storage:[512],vram:[8],refresh:[144],screen:[15.6]},specs:[['Procesador','AMD Ryzen 5 7535HS · 6 núcleos / 12 hilos · turbo máximo 4,55 GHz'],['Gráficos','GeForce RTX 4060 Laptop · 8 GB; potencia y rendimiento de esta unidad por confirmar'],['Pantalla','15,6 pulgadas · 1920 × 1080 · 144 Hz'],['Memoria y almacenamiento','16 GB DDR5 · SSD NVMe PCIe 4.0 de 512 GB; módulos y tasa efectiva por confirmar']]}
    ],
    'asus-proart-h7606wv':[
      {id:'h7606wv-me088x',model:'H7606WV-ME088X',label:'HX 370 · 32 GB · 2 TB',region:'Oriente Medio · guía ASUS 2024',source:proartGuide,checkedAt:'2026-10-03',scope:'Columna ME088X de la guía ASUS 2024, página PDF 41 (impresa 81): Ryzen AI 9 HX 370, 32 GB LPDDR5X, SSD 2 TB, RTX 4060 de 8 GB, OLED 4K táctil y Windows 11 Pro. Núcleos, hilos y turbo corroborados por CPU en ASUS. No trasladar el SSD de 1 TB de otra región ni los 64 GB de H7606WI. Hz y tasa RAM no confirmados por este sufijo; no se dibujan.',fieldSources:{cores:proartCpu,threads:proartCpu,boost:proartCpu},values:{cores:[12],threads:[24],boost:[5.1],ram:[32],storage:[2000],vram:[8],screen:[16]},specs:[['Procesador','AMD Ryzen AI 9 HX 370 · 12 núcleos / 24 hilos · turbo máximo 5,1 GHz'],['Gráficos','GeForce RTX 4060 Laptop · 8 GB GDDR6'],['Pantalla','16 pulgadas OLED táctil · 3840 × 2400; Hz pendientes por SKU'],['Memoria y almacenamiento','32 GB LPDDR5X integrada · SSD NVMe PCIe 4.0 de 2 TB']],limits:['La RAM integrada no se trata como ampliable: confirma capacidad antes de elegir.','8 GB de VRAM pueden limitar proyectos grandes; no se han medido rendimiento ni autonomía.','ME088X es una referencia de Oriente Medio; precio, stock, teclado y garantía en Colombia pendientes.','Solo se ha verificado este sufijo completo de H7606WV; no se ofrecen combinaciones de CPU/RAM/SSD inventadas.']}
    ],
    'asus-zenbook-ux3405ma':[
      {id:'ux3405ma-pp069w',model:'UX3405MA-PP069W',label:'Ultra 7 · 16 GB · 1 TB',region:'Nepal · guía ASUS 2024',source:asusGuide,checkedAt:'2026-10-02',scope:'Versión PP069W documentada en una fila de la guía ASUS 2024, página 11. Configuración regional, no oferta colombiana. Frecuencia del panel pendiente de corroboración por SKU.',fieldSources:{cores:asusCpu,threads:asusCpu,boost:asusCpu},values:{ram:[16],storage:[1000],screen:[14],cores:[16],threads:[22],boost:[4.8]},specs:[['Procesador','Intel Core Ultra 7 155H · 16 núcleos / 22 hilos · turbo máximo 4,8 GHz'],['Gráficos','Intel Arc integrada · memoria compartida, no VRAM dedicada'],['Pantalla','14 pulgadas OLED · 2880 × 1800; Hz pendientes de corroboración del SKU'],['Memoria y almacenamiento','16 GB LPDDR5X · SSD NVMe PCIe 4.0 de 1 TB']]},
      {id:'ux3405ma-pp287w',model:'UX3405MA-PP287W',label:'Ultra 9 · 32 GB · 1 TB',region:'Nepal · guía ASUS 2024',source:asusGuide,checkedAt:'2026-10-02',scope:'Versión PP287W documentada en una fila de la guía ASUS 2024, página 11. Configuración regional, no oferta colombiana. Frecuencia del panel pendiente de corroboración por SKU.',fieldSources:{cores:asusCpu,threads:asusCpu,boost:asusCpu},values:{ram:[32],storage:[1000],screen:[14],cores:[16],threads:[22],boost:[5.1]},specs:[['Procesador','Intel Core Ultra 9 185H · 16 núcleos / 22 hilos · turbo máximo 5,1 GHz'],['Gráficos','Intel Arc integrada · memoria compartida, no VRAM dedicada'],['Pantalla','14 pulgadas OLED · 2880 × 1800; Hz pendientes de corroboración del SKU'],['Memoria y almacenamiento','32 GB LPDDR5X · SSD NVMe PCIe 4.0 de 1 TB']]}
    ],
    'msi-modern-15-h-ai-c2hmg':[
      {id:'c2hmg-206tw',model:'C2HMG-206TW',label:'Ultra 7 · 16 GB · 512 GB',region:'Taiwán · ficha MSI',source:msiModernTw,checkedAt:'2026-10-02',scope:'Fila C2HMG-206TW: Ultra 7 255H, dos módulos de 8 GB y SSD de 512 GB; Windows 11 Home. Región Taiwán, no oferta colombiana. Dos ranuras RAM en total, ambas ocupadas. La tasa DDR5-5600 depende de CPU y módulos; no es velocidad medida.',values:{cores:[16],threads:[16],boost:[5.1],ram:[16],storage:[512],ramRate:[5600],screen:[15.6],slots:[2]},specs:[['Procesador','Intel Core Ultra 7 255H · 16 núcleos / 16 hilos · turbo máximo 5,1 GHz'],['Gráficos','Integrados; MSI condiciona Intel Arc a 16 GB en doble canal o más, no VRAM dedicada'],['Pantalla','15,6 pulgadas IPS-Level · 1920 × 1080; refresco no verificado por SKU'],['Memoria y almacenamiento','16 GB (2 × 8) DDR5-5600 · SSD NVMe PCIe 4.0 de 512 GB · un M.2']]},
      {id:'c2hmg-254tw',model:'C2HMG-254TW',label:'Ultra 9 · 16 GB · 1 TB',region:'Taiwán · ficha MSI',source:msiModernTw,checkedAt:'2026-10-02',scope:'Fila C2HMG-254TW: Ultra 9 285H, un módulo de 16 GB y SSD de 1 TB; Windows 11 Pro. Región Taiwán, no oferta colombiana. No atribuir doble canal ni Arc a partir del nombre del CPU: la ficha exige comprobar la configuración de memoria. Dos ranuras RAM en total; un módulo instalado.',values:{cores:[16],threads:[16],boost:[5.4],ram:[16],storage:[1000],ramRate:[5600],screen:[15.6],slots:[2]},specs:[['Procesador','Intel Core Ultra 9 285H · 16 núcleos / 16 hilos · turbo máximo 5,4 GHz'],['Gráficos','Integrados; el requisito MSI para Intel Arc es 16 GB en doble canal o más. Esta fila declara 1 × 16 GB: confirmar con fabricante'],['Pantalla','15,6 pulgadas IPS-Level · 1920 × 1080; refresco no verificado por SKU'],['Memoria y almacenamiento','16 GB (1 × 16) DDR5-5600 · SSD NVMe PCIe 4.0 de 1 TB · un M.2']]}
    ],
    'msi-thin-15-b13ve':[
      {id:'b13ve-3010co',model:'B13VE-3010CO',label:'Core i5 · 16 GB · 512 GB',region:'Colombia · ficha MSI LATAM',source:msiLatam,checkedAt:'2026-10-02',scope:'Fila B13VE-3010CO de MSI LATAM: i5-13420H, 16 GB (2 × 8) y SSD de 512 GB; Windows 11 Home. No confirma precio, stock ni garantía de una tienda.',values:{cores:[8],threads:[12],boost:[4.6],ram:[16],storage:[512],vram:[6],ramRate:[3200],refresh:[144],screen:[15.6],slots:[2]},specs:[['Procesador','Intel Core i5-13420H · 8 núcleos / 12 hilos · turbo máximo 4,6 GHz'],['Gráficos','RTX 4050 Laptop · 6 GB GDDR6 · hasta 45 W con Dynamic Boost según escenario'],['Pantalla','15,6 pulgadas IPS-Level · 1920 × 1080 · 144 Hz'],['Memoria y almacenamiento','16 GB (2 × 8) DDR4-3200 · SSD NVMe PCIe 4.0 de 512 GB']]},
      {id:'b13ve-2839ar',model:'B13VE-2839AR',label:'Core i7 · 16 GB · 512 GB',region:'Argentina · ficha MSI LATAM',source:msiLatam,checkedAt:'2026-10-02',scope:'Fila B13VE-2839AR de MSI LATAM: i7-13620H, 16 GB (2 × 8) y SSD de 512 GB; Windows 11 Home. Referencia argentina, no oferta colombiana.',values:{cores:[10],threads:[16],boost:[4.9],ram:[16],storage:[512],vram:[6],ramRate:[3200],refresh:[144],screen:[15.6],slots:[2]},specs:[['Procesador','Intel Core i7-13620H · 10 núcleos / 16 hilos · turbo máximo 4,9 GHz'],['Gráficos','RTX 4050 Laptop · 6 GB GDDR6 · hasta 45 W con Dynamic Boost según escenario'],['Pantalla','15,6 pulgadas IPS-Level · 1920 × 1080 · 144 Hz'],['Memoria y almacenamiento','16 GB (2 × 8) DDR4-3200 · SSD NVMe PCIe 4.0 de 512 GB']]}
    ]
  };
  Object.assign(configurations,window.FENIXA_LAPTOP_GOAL30_CONFIGS||{});
  const acerCpuSource='https://www.intel.com/content/www/us/en/products/sku/231805/intel-core-i3n305-processor-6m-cache-up-to-3-80-ghz/specifications.html';
  const acerFacts=facts['acer-aspire-go-ag15-31p-372g'];
  acerFacts.values.threads=[8];acerFacts.values.boost=[3.8];
  acerFacts.checkedAt='2026-10-18';
  acerFacts.fieldSources={threads:acerCpuSource,boost:acerCpuSource};
  acerFacts.scope='Configuración México AG15-31P-372G / NX.KRPAL.005: 8 GB instalados, SSD 512 GB y panel TN. Intel corrobora ocho hilos y turbo máximo de 3,8 GHz del i3-N305, no velocidad sostenida del portátil. RAM efectiva, ranuras y ampliación pendientes; gráficos integrados sin VRAM dedicada.';
  function resolve(p,configurationId) {
    if(!p)return p;
    const list=configurations[p.id];
    const c=list?.find(c=>c.id===configurationId)||list?.[0];
    if(!c)return {...p,configurationId:'catalog',comparisonFacts:facts[p.id]};
    return {...p,configurationId:c.id,model:c.model,source:c.source,region:c.region,checkedAt:c.checkedAt,specs:c.specs,limits:c.limits||p.limits,referenceKind:p.retired?'SKU regional retirado · archivo':'Versión regional documentada',comparisonFacts:c};
  }
  const fact=p=>p?.comparisonFacts||resolve(p)?.comparisonFacts;
  const quoteKey=p=>`${p.id}::${p.configurationId||resolve(p).configurationId}`;
  const metrics=[
    {key:'cores',label:'Núcleos del procesador',unit:'núcleos',group:'capacity',help:'Capacidad para tareas paralelas. Núcleos de arquitecturas distintas no rinden igual; esta cifra no mide velocidad ni FPS.'},
    {key:'threads',label:'Hilos del procesador',unit:'hilos',group:'capacity',help:'Hilos publicados por el fabricante. Más hilos pueden ayudar en ciertas tareas, pero no establecen un ganador.'},
    {key:'boost',label:'Turbo máximo del CPU',unit:'GHz',group:'speed',help:'Frecuencia máxima declarada, no sostenida ni medida aquí. No permite comparar velocidad real entre arquitecturas ni calcular mejoras porcentuales.'},
    {key:'ramRate',label:'Transferencia de memoria',unit:'MT/s',group:'speed',help:'Tasa publicada de RAM, no velocidad global del equipo. Configuración, CPU y módulos pueden reducir la tasa efectiva.'},
    {key:'ram',label:'Memoria RAM',unit:'GB',group:'capacity',help:'Capacidad de referencia. Las opciones de una familia no identifican la RAM que incluye una oferta concreta.'},
    {key:'vram',label:'Memoria gráfica dedicada',unit:'GB',group:'capacity',help:'VRAM publicada. Más memoria no demuestra más FPS. Los gráficos integrados comparten RAM: no se representan como cero GB de VRAM.'},
    {key:'storage',label:'Almacenamiento de referencia',unit:'GB',group:'capacity',help:'Capacidad anunciada del SSD, no velocidad de lectura ni espacio utilizable tras formatear. 1 TB anunciado se muestra como 1.000 GB.'},
    {key:'refresh',label:'Refresco de pantalla',unit:'Hz',group:'screen',help:'Cuántas actualizaciones admite el panel por segundo; no son los FPS que produce el juego. Paneles alternativos deben comprobarse por SKU.'},
    {key:'screen',label:'Diagonal de pantalla',unit:'pulgadas',group:'screen',help:'Tamaño físico, no calidad ni resolución. Mayor diagonal no siempre es mejor para movilidad.'},
    {key:'slots',label:'Ranuras de RAM',unit:'ranuras',group:'capacity',help:'Total de ranuras, incluidas las ocupadas. No es el número de ranuras libres ni la cantidad de módulos instalados.'}
  ];
  function values(p,key) {
    const raw=fact(p)?.values[key];
    return Array.isArray(raw)?raw.filter(v=>typeof v==='number'&&Number.isFinite(v)&&v>0):[];
  }
  function bars(label,unit,sets,format=number) {
    const max=Math.max(0,...sets.flat());
    return sets.map((set,i)=>`<div class="laptop-bar-row"><span class="laptop-series-key series-${i}" aria-label="Laptop ${String.fromCharCode(65+i)}">${String.fromCharCode(65+i)}</span><div class="laptop-bar-track" aria-hidden="true">${set.length?`<span class="laptop-bar-fill series-${i}${set.length>1?' is-options':''}" style="width:${(Math.max(...set)/max*100).toFixed(3)}%"></span>${set.length>1?set.map(v=>`<i class="laptop-bar-marker" style="left:${(v/max*100).toFixed(3)}%"></i>`).join(''):''}`:''}</div><strong>${set.length?`${set.map(format).join(' / ')}${unit?' '+esc(unit):''}`:'Sin dato'}</strong></div>`).join('');
  }
  function renderMetrics(chosen,group='all') {
    if(chosen.length<2||chosen.length>4)return '<p class="laptop-chart-empty">Selecciona dos laptops para ver sus gráficos lado a lado.</p>';
    return `<div class="laptop-metric-grid">${metrics.filter(m=>group==='all'||m.group===group).map(m=>{
      const sets=chosen.map(p=>values(p,m.key)),both=sets.every(s=>s.length>0);
      const options=sets.some(s=>s.length>1);
      const equal=both&&sets.every(s=>s.length===1)&&sets.every(s=>s[0]===sets[0][0]);
      const badge=options?'Opciones según SKU':!both?'Dato incompleto':equal?'Mismo valor':'Valores distintos';
      return `<details class="laptop-metric-card" data-laptop-metric="${m.key}"><summary><span>${esc(m.label)}</span><small>${badge}</small>${bars(m.label,m.unit,sets)}<span class="laptop-metric-hint">Qué significa y fuentes</span></summary><div class="laptop-metric-help"><p>${esc(m.help)}</p><p>Escala desde cero hasta el mayor valor de esta selección, solo para esta métrica. Las barras no son una nota de rendimiento.${options?' Las marcas representan opciones documentadas, no valores intermedios.':''}</p>${chosen.map((p,i)=>{p=resolve(p,p.configurationId);const f=fact(p);return `<p><b>${String.fromCharCode(65+i)} · ${esc(p.model)}</b>: ${esc(f?.scope||'Ficha numérica pendiente.')} <a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Ficha de esta versión</a>${f?.source&&f.source!==p.source?` · <a href="${esc(f.source)}" target="_blank" rel="noopener noreferrer">Corroboración del fabricante</a>`:''}${f?.fieldSources?.[m.key]?` · <a href="${esc(f.fieldSources[m.key])}" target="_blank" rel="noopener noreferrer">Cifra de CPU</a>`:''}${f?` · consulta ${esc(f.checkedAt)}`:''}</p>`;}).join('')}</div></details>`;
    }).join('')}</div>`;
  }
  const radarLabels={ram:'RAM',vram:'VRAM',storage:'SSD',refresh:'Refresco',ramRate:'Tasa RAM',slots:'Ranuras RAM',cores:'Núcleos',threads:'Hilos',boost:'Turbo CPU',screen:'Diagonal'};
  function radarModel(chosen) {
    if(chosen.length<2||chosen.length>4)return [];
    return window.FENIXA_RADAR.model(['ram','vram','storage','refresh','ramRate','slots','cores','threads','boost','screen'].map(key=>({
      ...metrics.find(m=>m.key===key),short:radarLabels[key],sets:chosen.map(p=>values(p,key))
    })));
  }
  function renderRadar(chosen) {
    if(chosen.length<2||chosen.length>4)return '<p>Selecciona dos laptops para abrir el radar.</p>';
    chosen=chosen.map(p=>resolve(p,p.configurationId));
    return window.FENIXA_RADAR.render({title:'Radar de laptops',names:chosen.map(p=>p.model),axes:radarModel(chosen),sources:chosen.map(p=>({...fact(p),source:fact(p)?.source||p.source}))});
  }
  function priceNumber(raw) {
    // Quotes in whole COP only: reject negatives, zero, exponent notation and fractions.
    if(!/^\d{1,9}$/.test(String(raw??'')))return null;
    const value=Number(raw);return value>0&&value<=100000000?value:null;
  }
  function renderPrices(chosen,quotes) {
    if(chosen.length<2||chosen.length>4)return '<p>Selecciona dos laptops para comparar cotizaciones.</p>';
    const prices=chosen.map(p=>priceNumber(quotes.get(quoteKey(p))));
    const both=prices.every(p=>p!==null);
    const difference=both?Math.max(...prices)-Math.min(...prices):null;
    return `<article class="laptop-price-chart"><h4>Precio que tienes para cada equipo</h4>${bars('Precio','',prices.map(p=>p===null?[]:[p]),money)}<p class="laptop-price-result">${!both?(chosen.length===2?'Ingresa dos precios válidos en COP para ver la diferencia.':'Ingresa todos los precios válidos en COP para ver la diferencia.'):difference===0?'Tus cotizaciones tienen el mismo importe.':`${chosen.length===2?`${prices[0]<prices[1]?'A':'B'} cuesta ${money(difference)} menos en las cifras ingresadas.`:`${String.fromCharCode(65+prices.indexOf(Math.min(...prices)))} tiene el menor importe; diferencia con el mayor: ${money(difference)} en las cifras ingresadas.`}`}</p><small>Datos introducidos por ti, no ofertas verificadas por FENIXA. Usa el mismo criterio de envío, impuestos, garantía y configuración para ambos.</small></article><article class="laptop-value-note"><h4>Relación precio / rendimiento</h4><div class="laptop-evidence-steps"><span>Precio: ${both?'ingresado por ti':'pendiente'}</span><span>Configuración: revisar SKU</span><span>Pruebas comparables: pendientes</span></div><p>No calculamos rentabilidad ni coronamos un ganador sin pruebas de la misma tarea, ajustes y configuración. Los gráficos de especificaciones ayudan a ver qué cambia por la diferencia de precio; no sustituyen esas pruebas.</p></article>`;
  }
  window.FENIXA_LAPTOP_COMPARE={facts,configurations,resolve,quoteKey,metrics,values,renderMetrics,renderRadar,radarModel,renderPrices,priceNumber};
})();
