// Editorial starting points, not retailer quotes or benchmark rankings.
(() => {
  'use strict';
  const catalog = window.FENIXA_CATALOG;
  const byId = Object.fromEntries([...catalog.products,...(window.FENIXA_MARKET_DATA?.products||[])].map(p=>[p.id,p]));
  const parts = {
    case:'market-clones-105157', white:'market-clones-101429', tower:'case-corsair-4000d-airflow-black',
    board:'market-speedlogic-35623', ram:'ram-kingston-fury-beast-ddr5',
    s500:'ssd-kingston-nv3-500gb', s1:'market-speedlogic-36885', s2:'market-speedlogic-31718', s4:'market-speedlogic-35694',
    p600:'market-xpg-probe-600', p750:'psu-corsair-rm750e', p850:'market-speedlogic-54281',
    air:'market-speedlogic-54811', aio:'cooler-corsair-h100i-capellix',
    r5:'cpu-amd-ryzen-5-7600', g5:'market-ryzen-8600g', g7:'market-ryzen-8700g', g0:'market-ryzen-8500g',
    x5:'market-ryzen-9600x', x7:'market-ryzen-9700x', x3:'cpu-amd-ryzen-7-9800x3d', x9:'market-ryzen-9950x3d',
    v50:'market-clones-105801', v60:'market-speedlogic-48384', vti:'market-clones-105807', v70:'market-clones-108954'
  };
  const cpuSources = {
    r5:'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html',
    g0:'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8500g.html',
    g5:'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8600g.html',
    g7:'https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700g.html',
    x5:'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html',
    x7:'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9700x.html',
    x3:'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html',
    x9:'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x3d.html'
  };
  // [target millions, use, title, CPU, GPU or null, SSD, PSU, case, cooler or null, rationale]
  const rows = [
    [3,'gaming','Gaming integrado','g5',null,'s500','p600','case',null,'Para empezar sin gráfica dedicada y explorar juegos ligeros. La Radeon integrada comparte RAM; no equivale a una RTX ni garantiza FPS.'],
    [4,'gaming','Gaming con gráfica dedicada','r5','v50','s500','p750','case',null,'Una primera propuesta con RTX 5050 de 8 GB. Confirma requisitos de tus juegos y coste de todas las piezas antes de decidir.'],
    [5,'gaming','Gaming AM5','r5','v60','s1','p750','case',null,'RTX 5060 de 8 GB y 1 TB para instalar juegos. Los ajustes y la memoria de vídeo pueden limitar títulos exigentes.'],
    [6,'gaming','Gaming y multitarea','x5','vti','s1','p750','case','air','Ryzen 5 9600X con RTX 5060 Ti de 8 GB. Compara el uso real de VRAM de tus juegos; Ti no elimina ese límite.'],
    [7,'gaming','Gaming con ocho núcleos','x7','vti','s2','p750','tower','air','Ocho núcleos y 2 TB para una biblioteca más amplia. Es una elección de capacidad, no una mejora medida de FPS.'],
    [8,'gaming','Gaming RTX 5070','x7','v70','s1','p850','tower','air','RTX 5070 de 12 GB y fuente de 850 W como punto de partida. Verifica el espacio de la gráfica y sus conectores.'],
    [9,'gaming','Gaming 3D V-Cache','x3','v70','s1','p850','tower','air','Ryzen 7 9800X3D con RTX 5070. La conveniencia de la caché adicional depende del juego; no hay un ganador universal.'],
    [10,'gaming','Gaming blanco y biblioteca','x3','v70','s2','p850','white','air','La propuesta anterior con gabinete blanco y 2 TB. No todas las piezas son blancas; comprueba alturas y longitud de la gráfica.'],
    [11,'gaming','Gaming con archivo de 4 TB','x3','v70','s4','p850','tower','air','4 TB de almacenamiento para una biblioteca grande. Más capacidad no implica más FPS; no necesitas gastar todo el presupuesto.'],
    [12,'gaming','Gaming y producción','x9','v70','s4','p850','tower','aio','Punto de partida para combinar juegos y tareas de producción de varios hilos. Revisa si tus programas aprovechan este procesador; no sustituye una prueba de rendimiento.'],
    [3,'estudio','Estudio y oficina','g0',null,'s500','p600','case',null,'Documentos, clases y una base de escritorio ampliable. Sin gráfica dedicada; monitor, periféricos y licencias no están incluidos.'],
    [4,'trabajo','Trabajo y programación','g7',null,'s1','p600','case',null,'32 GB en dos módulos y 1 TB para multitarea y proyectos. La Radeon integrada evita añadir una GPU cuando tus programas no la necesitan.'],
    [5,'trabajo','Desarrollo y multitarea','x7',null,'s1','p750','case','air','Ocho núcleos y 32 GB como base para desarrollo. Los gráficos integrados sirven para escritorio, no para tratar esta propuesta como estación 3D.'],
    [7,'trabajo','Trabajo con proyectos grandes','x7',null,'s2','p750','tower','air','2 TB y gabinete ATX para proyectos y ampliaciones. Para ofimática puede bastar una propuesta más económica.'],
    [9,'trabajo','Compilación y máquinas virtuales','x9',null,'s2','p850','tower','aio','Procesador de 16 núcleos para programas que utilicen varios hilos. 32 GB pueden quedarse cortos con muchas máquinas virtuales; revisa RAM y refrigeración para tu carga.'],
    [4,'creativo','Diseño con gráficos integrados','g7',null,'s1','p600','case',null,'Punto de partida para diseño 2D y proyectos ligeros. No es una propuesta para render pesado; verifica los requisitos de tus programas.'],
    [6,'creativo','Edición con GPU dedicada','x5','vti','s1','p750','case','air','32 GB y RTX 5060 Ti de 8 GB para explorar aceleración de tus programas. Códec, efectos y tamaño del proyecto determinan los límites.'],
    [8,'creativo','Creación y almacenamiento','x7','v70','s2','p850','tower','air','RTX 5070 de 12 GB y 2 TB para archivos de trabajo. Confirma compatibilidad de software, memoria y copias de seguridad.'],
    [10,'creativo','Producción de varios hilos','x9','vti','s2','p850','tower','aio','Prioriza un procesador de 16 núcleos cuando el software lo aprovecha. La GPU de 8 GB puede ser el límite en escenas grandes.'],
    [12,'creativo','Producción y biblioteca de medios','x9','v70','s4','p850','tower','aio','CPU de 16 núcleos, GPU de 12 GB y 4 TB. 32 GB no bastan para todos los proyectos profesionales: revisa ampliaciones antes de comprar.'],
    [4,'estudio','Programación universitaria','r5',null,'s1','p600','case',null,'32 GB y 1 TB para herramientas de desarrollo, apuntes y proyectos. Los gráficos integrados son una salida de escritorio; revisa los requisitos de tus prácticas si necesitan una GPU dedicada.'],
    [5,'estudio','Estudio y archivos de investigación','g7',null,'s2','p750','case',null,'Ryzen 7 8700G y 2 TB para combinar multitarea con archivos de investigación. Sin GPU dedicada: simulación, IA y proyectos 3D pueden exigir otra selección.'],
    [6,'estudio','Estudio con herramientas gráficas','x5','v50','s2','p750','tower','air','32 GB, 2 TB y RTX 5050 de 8 GB para explorar programas que requieren gráfica dedicada. Comprueba requisitos y certificaciones de tu aplicación CAD; no es una estación certificada ni una promesa de rendimiento.'],
    [6,'trabajo','Trabajo con aceleración gráfica','g7','v60','s1','p750','case',null,'Ryzen 7 8700G y RTX 5060 de 8 GB para programas de trabajo que utilicen una GPU. Si solo necesitas documentos y navegación, compara primero las propuestas sin gráfica dedicada.'],
    [8,'trabajo','Desarrollo con GPU y proyectos grandes','x7','vti','s2','p850','tower','air','Ocho núcleos, 32 GB y 2 TB junto a una GPU de 8 GB. Confirma el soporte de aceleración de tus herramientas; modelos de IA o muchas máquinas virtuales pueden superar la VRAM o RAM disponibles.'],
    [5,'creativo','Diseño y vídeo de inicio','r5','v50','s1','p750','case',null,'1 TB, 32 GB y RTX 5050 de 8 GB como propuesta de entrada con GPU dedicada. La resolución, el códec y los efectos del proyecto determinan si necesitas más memoria o una configuración distinta.'],
    [7,'creativo','Edición y organización de proyectos','x7','v60','s2','p750','tower','air','Ryzen 7 9700X, RTX 5060 de 8 GB y 2 TB para separar esta opción de las de gráficos integrados. El almacenamiento extra no es una copia de seguridad; revisa códecs, VRAM y soporte del software antes de elegir.'],
    [7,'estudio','Laboratorio y proyectos visuales','x7','vti','s1','p750','tower','air','Ocho núcleos, 32 GB y RTX 5060 Ti de 8 GB para prácticas que combinan programación y herramientas gráficas. No es una estación CAD certificada; comprueba software, VRAM y memoria para tus proyectos. Para apuntes y clases compara primero opciones más económicas.'],
    [10,'trabajo','Compilación con apoyo de GPU','x9','v60','s2','p850','tower','aio','16 núcleos y una RTX 5060 de 8 GB para combinar tareas paralelas con programas que necesitan GPU dedicada. La prioridad es la carga de CPU, no render pesado: 32 GB y 8 GB de VRAM pueden limitar máquinas virtuales o modelos grandes. Revisa consumo sostenido, BIOS y refrigeración antes de elegir.'],
    [9,'creativo','Medios y edición con 4 TB','x7','vti','s4','p850','tower','air','Ocho núcleos, RTX 5060 Ti de 8 GB y 4 TB para quienes guardan muchos medios de trabajo. Prioriza capacidad frente a la GPU de 12 GB de otras propuestas; proyectos 3D grandes pueden necesitar más VRAM. El SSD no sustituye una copia de seguridad ni garantiza más velocidad de edición.'],
    [8,'estudio','Estudio técnico y 3D ligero','x7','v50','s2','p750','tower','air','32 GB, 2 TB y RTX 5050 para prácticas de modelado y visualización ligera. Comprueba los requisitos exactos de cada programa; no es una estación certificada ni una promesa de rendimiento.'],
    [9,'estudio','Investigación y máquinas virtuales','x9',null,'s4','p850','white','aio','16 núcleos y 4 TB para proyectos de investigación, compilación y varias máquinas virtuales. La RAM base puede requerir ampliación; el objetivo no incluye monitor, licencias ni copias de seguridad.'],
    [10,'estudio','Laboratorio con aceleración','x9','vti','s1','p850','tower','aio','Procesador de 16 núcleos, RTX 5060 Ti y 1 TB para combinar análisis con herramientas que sí aprovechan GPU. Confirma soporte de CUDA/DirectML u otra API antes de seleccionar.'],
    [11,'estudio','Estudio avanzado y simulación','x9','v70','s2','p850','white','aio','RTX 5070 de 12 GB y 2 TB para simulación y visualización más exigentes. La memoria del sistema y el software pueden ser el límite; no se presenta como estación profesional certificada.'],
    [12,'estudio','Laboratorio de alta capacidad','x9','v70','s1','p850','white','aio','Alternativa de alta capacidad con gabinete blanco, CPU de 16 núcleos, RTX 5070 y 1 TB. Cambia la estética y el almacenamiento, no garantiza resultados de una carga concreta.'],
    [3,'trabajo','Oficina y desarrollo inicial','g7',null,'s500','p750','case',null,'Base económica para documentos, programación y multitarea con gráficos integrados. Confirma que tus herramientas no requieran GPU dedicada y considera añadir almacenamiento después.'],
    [11,'trabajo','Compilación y datos locales','x9',null,'s4','p850','tower','aio','16 núcleos y 4 TB para compilación, contenedores y datos locales. Para muchas máquinas virtuales, 32 GB pueden ser insuficientes; revisa la ampliación de memoria.'],
    [12,'trabajo','Workstation con GPU','x9','vti','s4','p850','tower','aio','CPU de 16 núcleos, RTX 5060 Ti y 4 TB para herramientas de trabajo con aceleración. La GPU no convierte la propuesta en una estación certificada: valida software, VRAM, BIOS y refrigeración.'],
    [3,'creativo','Creación 2D de entrada','g7',null,'s500','p600','case',null,'Propuesta de inicio para diseño 2D, edición sencilla y organización de archivos. No está pensada para render 3D pesado; monitor, periféricos y licencias quedan fuera.'],
    [11,'creativo','Producción con biblioteca grande','x9','v70','s4','p850','white','aio','16 núcleos, RTX 5070 de 12 GB y 4 TB para producción y archivos voluminosos. El gabinete blanco distingue la lista, pero no sustituye copias de seguridad ni pruebas con tu programa.']
    ,[4,'gaming','Gaming compacto con 1 TB','r5','v50','s1','p750','tower','air','Alternativa de $4 millones que cambia capacidad, gabinete y refrigeración frente a la propuesta de entrada. Sigue siendo una referencia editorial: confirma precios, espacio de GPU y requisitos de tus juegos.','compacto-1tb']
    ,[6,'estudio','Estudio visual compacto','x5','v50','s1','p750','case','air','Alternativa de $6 millones para clases y herramientas visuales ligeras, con 1 TB y formato más compacto. No es una estación certificada ni una promesa de rendimiento; verifica software, temperatura y ampliación.','visual-compacto']
    ,[8,'trabajo','Trabajo con GPU y 1 TB','x7','vti','s1','p850','tower','air','Alternativa de $8 millones para herramientas de trabajo que aprovechan GPU. Cambia la fuente y la capacidad frente a otras listas; confirma consumo, soporte de aceleración y memoria necesaria.','gpu-1tb']
    ,[9,'creativo','Creación RTX 5070 equilibrada','x9','v70','s2','p850','tower','aio','Alternativa de $9 millones con RTX 5070 y 2 TB para separar el presupuesto de creación de las propuestas de 8 y 10 millones. La VRAM, los códecs y la refrigeración siguen requiriendo comprobación con tu software.','rtx5070-equilibrada']
    ,[3,'gaming','Gaming integrado con 1 TB','g5',null,'s1','p600','case',null,'Alternativa sin GPU dedicada que cambia el SSD de 500 GB por uno de 1 TB para instalar más juegos. Ryzen 5 8600G con Radeon 760M y kit de 32 GB; la gráfica comparte RAM y no garantiza FPS. No presupone que una futura GPU tenga el mismo ancho de enlace PCIe que con otro procesador; revisa la plataforma antes de ampliar.','integrado-1tb']
    ,[4,'trabajo','Programación y archivos sin GPU dedicada','g5',null,'s2','p600','case',null,'Prioriza 2 TB para repositorios, documentos y archivos frente al Ryzen 7 de ocho núcleos de otras propuestas. Ryzen 5 8600G de seis núcleos y 32 GB como punto de partida sin gráfica dedicada. El SSD con disipador requiere comprobar espacio en la placa; ni los 2 TB ni el objetivo editorial garantizan que esta lista quepa en $4 millones.','archivos-integrados']
  ];
  for (const [millions,use,title,cpu,gpu,ssd,psu,box,cooler,description,suffix] of rows) {
    const targetBudget=millions*1000000, ids=[box,cpu,'board',gpu,'ram',ssd,psu,cooler].filter(Boolean).map(key=>parts[key]);
    const short=[byId[parts[cpu]].name, gpu ? byId[parts[gpu]].name.replace(/^TARJETA DE VIDEO /i,'') : 'Gráficos integrados','32 GB DDR5'].join(' · ');
    const id=suffix ? `propuesta-${use}-${millions}m-${suffix}` : `propuesta-${use}-${millions}m`;
    catalog.builds.push({id,name:title,use,targetBudget,budgetMin:targetBudget,budgetMax:targetBudget,currency:'COP',caseId:parts[box],short,description,tags:[{gaming:'Gaming',trabajo:'Trabajo',estudio:'Estudio',creativo:'Creación'}[use],'AM5','Propuesta por cotizar'],parts:ids,
      sources:[{label:'Procesador · AMD',url:cpuSources[cpu]},{label:'Placa madre · MSI',url:'https://www.msi.com/Motherboard/B650M-GAMING-WIFI/Specification'}],
      notes:[
        'El presupuesto es un objetivo editorial, no una oferta ni una garantía de que esta lista cueste ese importe. Cotiza todas las piezas y modifica la selección si supera tu máximo.',
        cooler ? 'El cooler está incluido en la lista. Confirma montaje AM5, espacio, conectores y capacidad de refrigeración bajo tu carga; no se ha probado físicamente este montaje.' : 'Confirma presentación BOX y disipador incluido con el procesador. Si el vendedor no lo incluye, añade refrigeración y su coste.',
        'La placa MSI B650M GAMING WIFI requiere verificar la BIOS para este procesador. Confirma la QVL del kit Kingston KF560C36BBE2K2-32; DDR5-6000 EXPO no garantiza estabilidad en todos los montajes.',
        'Revisa longitud de GPU, altura del cooler/radiador, formato del gabinete y conectores de la fuente. Coincidir en AM5/DDR5 es solo una revisión parcial.',
        'No incluye monitor, teclado, ratón, licencia de sistema operativo, envío ni ensamblaje. La fotografía muestra el gabinete, no un PC montado.'
      ]});
  }
  // Distinct LGA1700 alternatives: never inherit the AM5 BIOS/cooler notes above.
  const intelRows=[
    {id:'propuesta-estudio-3m-intel-gpu',millions:3,use:'estudio',name:'Estudio Intel con GPU de entrada',gpu:'market-speedlogic-30438',ssd:parts.s500,psu:'market-speedlogic-51841',
      description:'Core i3-12100F de 4 núcleos y 8 hilos, 32 GB y SSD de 500 GB para clases, documentos y prácticas que requieran GPU dedicada. La RTX 3050 de 6 GB distingue esta alternativa de las propuestas integradas; para ofimática compara primero esas opciones. Muchas máquinas virtuales, render o modelos grandes pueden superar CPU, RAM o VRAM.',
      gpuSource:'https://www.msi.com/Graphics-Card/GeForce-RTX-3050-LP-6G-OC/Specification',
      psuSource:'https://www.asus.com/uk/motherboards-components/power-supply-units/prime/prime-750b-black/techspec/',
      gpuNote:'MSI RTX 3050 LP 6G OC: longitud publicada 174 mm frente al máximo de 330 mm del gabinete. Confirma bracket de altura completa, espesor, salidas y alimentación de la unidad; LP no significa que deba usarse un bracket bajo en este gabinete.'},
    {id:'propuesta-gaming-4m-intel-rtx4060',millions:4,use:'gaming',name:'Gaming Intel con RTX 4060',gpu:'gpu-msi-rtx-4060-gaming-8g',ssd:parts.s1,psu:parts.p750,
      description:'Alternativa LGA1700 con Core i3-12100F, RTX 4060 GAMING 8G, 32 GB y SSD de 1 TB. Cambia plataforma y GPU frente a las propuestas AM5; cuatro núcleos pueden limitar juegos exigentes en CPU y 8 GB de VRAM no bastan para todos los ajustes. No se prometen FPS ni se considera superior por su área de radar.',
      gpuSource:'https://www.msi.com/Graphics-Card/GeForce-RTX-4060-GAMING-8G/Specification',
      psuSource:'https://www.corsair.com/ca/en/p/psu/cp-9020295-na/rme-series-rm750e-fully-modular',
      gpuNote:'MSI RTX 4060 GAMING 8G: longitud publicada 247 mm frente al máximo de 330 mm del gabinete y un conector de 8 pines. Confirma cable PCIe original de la RM750e CP-9020295-NA, grosor y espacio de cables; no intercambiar cables modulares.'}
  ];
  for(const proposal of intelRows){
    const targetBudget=proposal.millions*1000000,caseId='market-speedlogic-33536';
    catalog.builds.push({id:proposal.id,name:proposal.name,use:proposal.use,targetBudget,budgetMin:targetBudget,budgetMax:targetBudget,currency:'COP',caseId,
      short:[byId['market-clones-55872'].name,byId[proposal.gpu].name,'32 GB DDR5'].join(' · '),description:proposal.description,
      tags:[proposal.use==='estudio'?'Estudio':'Gaming','LGA1700','Propuesta por cotizar'],
      parts:[caseId,'market-clones-55872','market-clones-86621',proposal.gpu,parts.ram,proposal.ssd,proposal.psu],
      sources:[
        {label:'CPU · Intel',url:'https://www.intel.com/content/www/us/en/products/sku/132223/intel-core-i312100f-processor-12m-cache-up-to-4-30-ghz/specifications.html'},
        {label:'CPU F sin vídeo integrado · Intel',url:'https://www.intel.com/content/www/us/en/support/articles/000058487/processors.html'},
        {label:'Placa D5 · ASRock',url:'https://www.asrock.com/mb/Intel/H610M-HDVM.2%2b%20D5/index.asp#Specification'},
        {label:'Kit KF560C36BBE2K2-32 · Kingston',url:'https://www.kingston.com/datasheets/KF560C36BBE2K2-32.pdf'},
        {label:'GPU · MSI',url:proposal.gpuSource},{label:'Fuente · fabricante (confirmar región)',url:proposal.psuSource},
        {label:'SSD NV3 · Kingston',url:'https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd'},
        {label:'Gabinete · Antec',url:'https://www.antec.com/product/case/cx200m-rgb-elite'}
      ],
      notes:[
        'El objetivo editorial no es una cotización ni garantiza que las piezas quepan en ese importe. Faltan precios recientes completos; cotiza y ajusta antes de comprar. La fuente seleccionada no representa el coste mínimo necesario.',
        'El i3-12100F requiere GPU dedicada: conecta el monitor a la gráfica, no a las salidas de la placa. Confirma presentación BOX y disipador LGA1700 incluido; de no estarlo, añade refrigeración y su coste. Altura máxima publicada del gabinete: 164 mm; montaje y temperatura no probados.',
        'ASRock H610M-HDV/M.2+ D5 es la variante DDR5 y Micro-ATX, no la H610M-HDV DDR4. Verifica revisión, lista de CPU y BIOS para el i3-12100F. El kit Kingston de 2 × 16 GB ocupa ambas ranuras: ampliarlo exige reemplazar módulos. CPU/placa publican hasta DDR5-4800 con 12.ª generación; el SPD del kit es 4800 MT/s. No prometemos su perfil de 6000 MT/s; confirma QVL y configuración.',
        'La única ranura de almacenamiento M.2 admite NVMe 2280 y PCIe 3.0 ×4. El NV3 es PCIe 4.0 ×4: confirma detección/arranque y BIOS de esta combinación; no trasladar sus máximos anunciados en una placa Gen4 a este enlace Gen3.',
        proposal.gpuNote,
        'Gabinete CX200M RGB ELITE: placa Micro-ATX admitida y fuente hasta 185 mm incluyendo cables. Confirma espacio de fuente, ATX de 24 pines y CPU/EPS de 8 pines. La página del gabinete describe sus cinco ventiladores RGB fijos encadenados a la fuente; verifica la variante y sus conectores, no conectes los cinco directamente a la única cabecera de chasis de la placa.',
        'Revisión parcial por fichas, no montaje validado. No incluye monitor, periféricos, sistema operativo, envío ni ensamblaje. La fotografía muestra el gabinete, no un PC montado.'
      ]});
  }
  const amounts=Array.from({length:10},(_,i)=>(i+3)*1000000);
  window.FENIXA_BUILD_DISCOVERY={
    amounts,
    overview(build) {
      return [['cpu','Procesador'],['gpu','Gráfica'],['ram','Memoria'],['storage','Almacenamiento']].map(([category,label])=>{
        const product=(build.parts||[]).map(id=>byId[id]).find(p=>p?.category===category);
        return {category,label,id:product?.id||null,name:product?.name||(category==='gpu'?'Sin gráfica dedicada en la lista; comprueba los gráficos del CPU.':'Pieza no registrada')};
      });
    },
    total(build,price) {const values=build.parts.map(price);return {count:values.filter(v=>v!==null).length,sum:values.reduce((s,v)=>s+(v||0),0),complete:values.every(v=>v!==null)};},
    matches(build,{use='all',limit='',quotedOnly=false,saved=new Set()}={},total) {
      return (use==='all'||(use==='saved'?saved.has(build.id):build.use===use)) &&
        (!limit||!build.targetBudget||build.targetBudget<=Number(limit)) &&
        (!quotedOnly||(total.complete&&(!limit||total.sum<=Number(limit))));
    }
  };
})();
