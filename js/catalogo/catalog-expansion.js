// Reversible, manufacturer-sourced additions to the MAIN catalog only.
// No retailer prices, existing identities or saved selections are rewritten.
(() => {
  'use strict';
  const checkedAt='2026-10-18';
  const profiles={};
  const put=(names,source,scope,values,extra={})=>{
    for(const name of names)profiles[name]={checkedAt,source,scope,values:{...values},...extra};
  };
  const kits=[
    ['KF560C30BBEK2-32',32,6000,30,1.4,'1.1'],
    ['KF560C36BBEK2-64',64,6000,36,1.35,'1.0'],
    ['KF556C36BBEK2-64',64,5600,36,1.25,'1.0'],
    ['KF560C30BBEK2-64',64,6000,30,1.4,'1.1'],
    ['KF564C32BBEK2-32',32,6400,32,1.4,'1.1'],
    ['KF552C36BBEK2-32',32,5200,36,1.25,'1.0']
  ];
  const additions=kits.map(([sku,capacity,rate,cl,voltage,expo])=>{
    const source=`https://www.kingston.com/datasheets/${sku}.pdf`;
    const name=`Kingston FURY Beast ${capacity} GB · ${sku}`;
    put([name],source,`SKU ${sku}, kit completo de dos módulos negros sin RGB. Perfil principal EXPO ${expo}/XMP 3.0: ${rate} MT/s, CL${cl}, ${voltage} V; no combina valores de perfiles secundarios. Predeterminado JEDEC 4800 MT/s, CL40, 1,1 V. El perfil requiere CPU/placa/BIOS y QVL compatibles; no garantiza rendimiento real. Región de venta, precio y stock en Colombia pendientes.`,{
      capacity,memory:'DDR5',rate,cl,defaultRate:4800,modules:2,voltage,
      format:'UDIMM sin búfer · 288 pines',profiles:`AMD EXPO ${expo} / Intel XMP 3.0 · perfil principal ${rate} MT/s`
    });
    return {id:`ram-kingston-${sku.toLowerCase()}`,category:'ram',name,sku,
      summary:`${capacity} GB (2 × ${capacity/2} GB) · DDR5-${rate} CL${cl} · perfil ${voltage} V · JEDEC 4800 MT/s · precio y stock local pendientes`,
      source,sourceType:'manufacturer',priceKind:'spec_only',imageKind:'family',
      image:'assets/market/kingston-fury-beast-ddr5-family-20261018.png',
      imageNote:'Imagen oficial de la familia FURY Beast negra DDR5, ilustrativa: muestra un módulo, no el kit completo ni la etiqueta del SKU. Referencia exacta y dos módulos documentados en su ficha.'};
  });
  put(['Caja Xpg Valor Air Plus Vid. Temp + 4 Argb Negro','CHASIS XPG VALOR AIR PLUS BLACK','CHASIS XPG VALOR AIR PLUS (BLANCO)'],
    'https://www.xpg.com/zw/xpg/pc-components-valor-air-plus?tab=spec',
    'VALOR AIR PLUS, negro/blanco; no VALOR AIR original ni PRO. Dimensiones publicadas alto × ancho × fondo. Cuatro ARGB incluidos solo en la variante MTA; MTN anuncia uno. Confirma el sufijo y el contenido local, sin multiplicar ventiladores por las tarjetas de distintas tiendas.',
    {format:'ATX / Micro-ATX / Mini-ITX',boardForms:['atx','micro-atx','mini-itx'],boardFormsComplete:true,gpuMax:340,coolerMax:160,width:200,height:482,depth:400,
      clearanceNotes:'GPU hasta 340 mm con ventiladores preinstalados; un radiador frontal reduce el espacio. Fuente hasta 170 mm; confirma cables. Hasta seis posiciones de 120 mm, no seis ventiladores incluidos.'});
  put(['CAJA ANTEC AX61 ELITE VIDRIO TEMPLADO + 4 FAN ARGB'],
    'https://www.antec.com/product/case/ax61',
    'AX61 ELITE. Medidas oficiales fondo × ancho × alto convertidas a ejes; cuatro ventiladores ARGB de 120 mm incluidos (tres frontales y uno trasero), no equivalen a ocho incluidos.',
    {format:'ATX / Micro-ATX / Mini-ITX',boardForms:['atx','micro-atx','mini-itx'],boardFormsComplete:true,gpuMax:320,coolerMax:160,width:200,height:449,depth:405,
      clearanceNotes:'Fuente con cables hasta 165 mm con bahía HDD y 345 mm sin ella. Radiador/ventiladores y cableado pueden reducir espacio; confirmar el montaje.'});
  put(['Caja Antec Ax27 Elite Vidrio Templado + 4 Rgb Fijo'],
    'https://antec.com/product/case/ax27-rgb-elite',
    'AX27 RGB ELITE, no AX20. Se representa el límite conservador de GPU de 270 mm: la fuente publica 295 mm con el ventilador delante y 270 mm detrás. No es un máximo universal de 295 mm. Cuatro FRGB fijos, no ARGB direccionables.',
    {format:'ATX / Micro-ATX / Mini-ITX',boardForms:['atx','micro-atx','mini-itx'],boardFormsComplete:true,gpuMax:270,gpuMaxConditional:true,gpuMaxUpper:295,coolerMax:155,width:207,height:451,depth:345,
      clearanceNotes:'GPU: 270 mm en la disposición más restrictiva documentada; hasta 295 mm solo con el montaje de ventilador indicado por Antec. Fuente con cables: 170 mm con HDD / 295 mm sin HDD.'});
  for(const [name,path,sku] of [
    ['CHASIS THERMALTAKE VIEW 170 TG ARGB (NEGRO)','view-170-tg-argb-micro-chassis','CA-1Z4-00M1WN-00'],
    ['CHASIS THERMALTAKE VIEW 170 TG ARGB (SNOW)','view-170-tg-argb-snow-micro-chassis','CA-1Z4-00M6WN-00']
  ])put([name],`https://thermaltake.com/products/${path}`,
    `${sku}. View 170 TG ARGB de la variante indicada; tres ventiladores ARGB Lite de 120 mm incluidos. Admite hasta siete, no incluye siete. No admite placas ATX. Medidas alto × ancho × fondo.`,
    {format:'Micro-ATX / Mini-ITX',boardForms:['micro-atx','mini-itx'],boardFormsComplete:true,gpuMax:340,coolerMax:160,width:212,height:438,depth:377.5,
      clearanceNotes:'Fuente hasta 180 mm. Radiador superior hasta 280/240 mm según montaje. Confirma RAM, radiador, cables y grosor de GPU; las cifras no certifican compatibilidad total.'});
  put(['Board Gigabyte B550m-K Pciexp Usb 3,2 A.V.R 4 Ddr4 Ryz'],
    'https://www.gigabyte.com/Motherboard/B550M-K-rev-10/sp',
    'Referencia B550M K revisión 1.0. La tienda no identifica revisión física: confirmar antes de comprar. Dos M.2 de almacenamiento totales, no libres; el M.2 de chipset es PCIe 3.0 ×2 y el de CPU depende del procesador. Máximo de memoria de esta revisión, no RAM incluida ni certificación QVL/BIOS.',
    {socket:'AM4',memory:'DDR4',format:'Micro-ATX',boardForm:'micro-atx',slots:4,maxRam:128,m2Slots:2,chipset:'AMD B550'});
  put(['Board Gigabyte B550m Ds3h Ac R2 Wifi 2gpu 4 Ddr4 Ryz'],
    'https://www.gigabyte.com/Motherboard/B550M-DS3H-AC-R2-rev-12/sp',
    'B550M DS3H AC R2 revisión 1.2, no DS3H AC sin R2. Confirma revisión física y BIOS del ejemplar local. Dos M.2 de almacenamiento totales; líneas y protocolos dependen de CPU/conector. El número de ranuras no permite inferir rendimiento.',
    {socket:'AM4',memory:'DDR4',format:'Micro-ATX',boardForm:'micro-atx',dimensions:'244 × 244 mm',slots:4,maxRam:128,m2Slots:2,chipset:'AMD B550'});
  put(['CORSAIR RMe Series RM750e'],
    'https://www.corsair.com/ca/en/p/psu/cp-9020295-na/rme-series-rm750e-fully-modular',
    'SKU CP-9020295-NA, revisión ATX 3.1; no trasladar medidas/cables de RM750e de otro año. Garantía de fabricante publicada para esta ficha NA/Canadá: referencia de siete años, no garantía local colombiana confirmada ni vida útil. No es una evaluación eléctrica.',
    {watts:750,format:'ATX 3.1 · totalmente modular',length:140,dimensions:'140 × 150 × 86 mm',efficiency:'Cybenetics Gold',warrantyYears:7,
      warranty:'Referencia fabricante: 7 años; confirmar región, distribuidor y comprobante. No certifica cobertura en Colombia.',connectors:'ATX 24 pines, EPS CPU, PCIe 6+2 y 12V-2x6 según tabla del SKU. Verifica cables y conexiones de la unidad; no intercambiar cables modulares.'});
  put(['Ventilador Xpg Vento R 120 Argb Pwm','Ventilador Xpg Vento R 120 Argb Pwm Blanco'],
    'https://www.xpg.com/index.php/za/xpg/pc-component-vento-r-120-argb-pwm?tab=spec',
    'VENTO R 120 ARGB PWM de aspas invertidas, negro/blanco, cifras POR ventilador. La tabla web publica 300–1600 RPM ±10%, 65 CFM y 1,65 mm H₂O. El PDF de variantes publica 1650 RPM/65,33 CFM: discrepancia de documentación, no media ni revisión local confirmada. Se usa coherentemente la tabla web; confirmar etiqueta antes de comprar. No se carga ruido porque otras fichas difieren entre promedio y máximo.',
    {format:'120 × 120 × 25 mm · aspas invertidas',connection:'4 pines PWM · iluminación ARGB independiente',rpm:1600,airflow:65,pressure:1.65},
    {additionalSources:[{label:'Variantes negro/blanco y discrepancia de RPM/caudal',source:'https://webapi3.adata.com/storage/downloadfile/xpg_vento_r_120_argb_pwm_datasheet.pdf'}]});
  put(['DISIPADOR THERMALTAKE ASTRIA 200 ARGB (NEGRO)'],
    'https://latam.thermaltake.com/astria-200-argb-lighting-cpu-cooler.html',
    'ASTRIA 200 ARGB negro CL-P119-AL12SW-A. Altura de la torre con un ventilador de 120 mm, no grosor de radiador. RPM/ruido declarados del ventilador, no medición térmica/acústica comparativa del sistema. Confirmar kit de socket y altura efectiva al salvar la RAM; no extrapolar a la edición Snow sin ficha.',
    {format:'Torre de aire · un ventilador de 120 mm',coolerType:'air',height:160,rpm:1800,noise:26.8,sockets:'AMD AM5 / AM4; Intel según kit de montaje y ficha del fabricante'});
  for(const [name,watts] of [
    ['Fuente Antec Mega 850w Pcie 5.1 80p Gold Full Modular',850],
    ['Fuente Antec Mega 1000w Pcie 5.1 80p Gold Full Modular',1000]
  ])put([name],`https://www.antec.com/product/power/mega-${watts}-atx3-1`,
    `MEGA${watts} Gold ATX 3.1, no otra serie Antec. Longitud del cuerpo sin espacio adicional para cables. Garantía publicada de siete años como referencia del fabricante; confirmar región, distribuidor y compra. Certificación de eficiencia y lista de protecciones no son un ensayo eléctrico ni un ganador de calidad.`,
    {watts,format:'ATX 12V 3.1 · totalmente modular',length:140,dimensions:'140 × 150 × 86 mm',efficiency:'80 PLUS Gold',warrantyYears:7,
      warranty:'7 años publicados por fabricante; cobertura local y condiciones pendientes.',protections:'OCP, OVP, UVP, SCP, OPP, OTP, SIP, NLO (declaradas)',
      connectors:'1 × ATX 20+4, 1 × 12V-2x6, 2 × CPU 4+4, 3 × PCIe 6+2, 7 × SATA, 2 × Molex; no intercambiar cables modulares.'});
  put(['Unidad de estado sólido (M2) NVMe 1T Samsung 990 Pro PS5 7450 x 6900'],
    'https://www.samsung.com/ca/memory-storage/nvme-ssd/990-pro-1tb-nvme-pcie-gen-4-mz-v9p1t0b-am/',
    '990 PRO de 1 TB, referencia de fabricante MZ-V9P1T0B/AM sin disipador. La ficha de tienda dice PS5, pero no confirma sufijo ni disipador: no se certifica montaje en consola. Se comparan capacidad y máximos declarados de esta referencia, no rendimiento sostenido ni revisión física del ejemplar. Garantía limitada por tiempo/TBW según condiciones; stock y precio no consultados.',
    {capacity:1000,placement:'Interno',format:'M.2 2280 · disipador de la unidad local por confirmar',pcie:'PCIe 4.0 ×4 · NVMe 2.0',read:7450,write:6900,tbw:600});
  put(['Unidad De Estado Solido (M2) Nvme 2t Samsung 990 Pro 7450 X 6900 Disipador'],
    'https://www.samsung.com/us/memory-storage/memory-buying-guide/',
    '990 PRO con disipador de 2 TB: máximos declarados de la familia con disipador, no SSD de otra capacidad ni benchmark. La tabla oficial de garantía identifica 2 TB con 1200 TBW; confirmar el sufijo y la revisión de la unidad local. Capacidad decimal; el espacio utilizable es menor. No se trasladan dimensiones de la edición sin disipador ni se confirma montaje PS5.',
    {capacity:2000,placement:'Interno',format:'M.2 2280 · con disipador',pcie:'PCIe 4.0 ×4 · NVMe',read:7450,write:6900,tbw:1200},
    {fieldSources:{tbw:'https://images.samsung.com/is/content/samsung/assets/vn/support/Phu_luc_1_Thoi_han_bao_hanh_o_cung_SSD.pdf'}});
  put(['Teclado Gaming Razer Ornata V3 X Lp Rgb'],
    'https://mysupport.razer.com/app/answers/detail/a_id/6071',
    'Ornata V3 X (RZ03-0447x), no Ornata V3 mecamecánico. Dimensiones aproximadas del cuerpo: longitud lateral publicada de 443 mm se representa como ancho; 31 mm es altura, no fondo de 144 mm. Peso publicado de 760 g, no envío. Distribución regional y revisión pendientes; estas magnitudes no miden comodidad, latencia ni rendimiento.',
    {format:'Completo de membrana · perfil bajo',connection:'USB con cable',width:443,height:31,weight:760});
  put(['Teclado Gamer Logitech G213 Rgb'],
    'https://www.logitechg.com/en-gb/products/gaming-keyboards/g213-rgb-gaming-keyboard.920-010739.html',
    'G213 Prodigy, dimensiones del cuerpo publicadas en la ficha UK. Referencia regional de la página 920-010739; no se afirma que sea la distribución vendida en Colombia. Ancho lateral 452 mm, altura 33 mm y fondo 218 mm; no intercambiar fondo/altura. Peso de producto de 1000 g, no envío ni ergonomía. Idioma/teclas y SKU local por confirmar.',
    {format:'Teclado completo · Mech-Dome',connection:'USB 2.0 con cable',width:452,height:33,weight:1000});
  window.FENIXA_VERIFIED_ADDITIONS={checkedAt,profiles,productIds:additions.map(p=>p.id)};
  const catalog=window.FENIXA_CATALOG;
  for(const product of additions)if(!catalog.products.some(p=>p.id===product.id||p.sku===product.sku))catalog.products.push(product);
})();
