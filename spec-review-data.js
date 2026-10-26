// Field-level manufacturer review. Missing noise is retained, never converted to zero.
(() => {
  const reviewed={};
  const definitions=[
    ['market-speedlogic-55867','ARCTIC Freezer 36-S','https://www.arctic.de/media/65/ea/24/1777885824/Spec_Sheet_Freezer_36-S_EN.pdf','ACFRE00194A'],
    ['market-speedlogic-55873','ARCTIC Freezer 36-S Black','https://www.arctic.de/en/Freezer-36-S-Black/ACFRE00196A','ACFRE00196A'],
    ['market-speedlogic-55878','ARCTIC Freezer 36-S A-RGB Black','https://www.arctic.de/en/Freezer-36-S-A-RGB-Black/ACFRE00198A','ACFRE00198A'],
    ['market-speedlogic-55890','ARCTIC Freezer 36-S A-RGB White','https://www.arctic.de/en/Freezer-36-S-A-RGB-White/ACFRE00199A','ACFRE00199A']
  ];
  for(const [id,displayName,source,pn]of definitions)reviewed[id]={displayName,source,checkedAt:'2026-10-22',scope:`Referencia ${pn}. Dimensiones publicadas 126 × 88 × 156 mm y velocidad 600–3000 rpm, ventilador P12 Pro, PWM 4 pines y cuatro heatpipes. Confirmar PN y accesorios en la unidad vendida. Intel LGA1851/1700 y AMD AM5/AM4. El fabricante no publica aquí un máximo de ruido en dBA comparable: permanece pendiente; 0 rpm bajo 5 % PWM no es un nivel de ruido máximo.`,values:{coolerType:'Torre de aire',height:156,rpm:3000,heatpipes:4,weight:685,sockets:'Intel LGA1851 / LGA1700 · AMD AM5 / AM4',connection:'PWM de 4 pines',warrantyYears:6},fieldSources:{height:source,rpm:source,heatpipes:source,weight:source},unpublished:{noise:'No se publica un máximo de ruido comparable en la ficha consultada.'}};
  // Preserve machine-readable cooling type used by fit checks.
  for(const profile of Object.values(reviewed)){profile.values.coolerType='air';profile.values.format='Torre de aire · ventilador de 120 mm';}
  function add(id,displayName,source,values,scope,extra={}){
    reviewed[id]={displayName,source,checkedAt:'2026-10-22',values,scope,...extra};
  }
  const keyboardScope='Medidas nominales publicadas por el fabricante para el modelo indicado; cm convertidos a mm y kg a g. No son medidas de envío. Confirmar distribución, revisión y referencia de la unidad local; las cifras no miden ergonomía ni latencia.';
  const keyboards=[
    ['market-speedlogic-7887','Redragon Shiva K512','https://redragon.es/products/best-seller/shiva-k512/',440,32,1090,'Membrana · tamaño completo','USB por cable'],
    ['market-speedlogic-12736','Redragon Shiva K512W White','https://redragon.es/en/products/best-seller/shiva-k512w-white/',440,32,1090,'Membrana · tamaño completo','USB por cable'],
    ['market-speedlogic-15358','Redragon Dragonborn K630','https://redragon.es/products/best-seller/teclado-mecanico-60-dragonborn-k630/',291.7,36,570,'Mecánico · 60 %','USB-C por cable extraíble'],
    ['market-speedlogic-22903','Redragon Dragonborn K630 White','https://redragon.es/products/best-seller/dragonborn-k630-white/',291.7,36,570,'Mecánico · 60 %','USB-C por cable extraíble'],
    ['market-speedlogic-22904','Redragon Kumara K552 · Rainbow','https://redragon.es/products/best-seller/teclado-mecanico-tkl-kumara-k552/',375,43,1060,'Mecánico · TKL · Rainbow','USB por cable'],
    ['market-speedlogic-7885','Redragon Kumara K552W · blanco','https://redragon.es/products/kumara-white-k552w/',375,43,1060,'Mecánico · TKL','USB por cable'],
    ['market-clones-108233','Redragon Kumara K552 RGB','https://redragon.es/products/best-seller/teclado-mecanico-tkl-kumara-k552/',375,43,1060,'Mecánico · TKL · RGB','USB por cable'],
    ['market-speedlogic-54286','Lenovo Legion K310 RGB','https://support.lenovo.com/us/en/accessories/acc500332',456,34.68,846,'Membrana · tamaño completo','USB 2.0 por cable'],
    ['market-clones-104001','Trust GXT 834 Callaz · referencia 24404','https://dezlwerqy1h00.cloudfront.net/Media/Datasheets/24404-Trust%20Gaming-GXT%20834%20Callaz-Datasheet_es.pdf',367,35,652,'Mecánico · TKL','USB-A por cable'],
    ['market-clones-45743','Trust GXT 833 Thado · referencia 23698','https://dezlwerqy1h00.cloudfront.net/documents/leaflets/23698_leaflet_extended_es_1-0.pdf',359,40,688,'Membrana · TKL','USB-A por cable']
  ];
  for(const [id,name,source,width,height,weight,format,connection]of keyboards){
    let scope=keyboardScope;
    if(name.includes('Shiva'))scope+=' El fabricante publica 440 × 153 × 32 mm y 1,09 kg; no desglosa el peso del reposamuñecas extraíble.';
    if(name.includes('Kumara'))scope+=' K552 mecánico de la familia RGB/Rainbow, no K552 magnético. La fuente de K552W describe switch Blue: solo se usan dimensiones y peso; no se traslada ese switch a la unidad Red anunciada por la tienda.';
    if(name.includes('K310'))scope+=' Lenovo diferencia 846 g del producto de 1271 g embalado; 104/105 teclas según región. No se atribuye el PN US a la unidad local.';
    if(name.includes('Callaz'))scope+=' Peso de unidad principal 652 g; peso total publicado 659 g. Fuente 24404 US, revisar referencia regional.';
    if(name.includes('Thado'))scope+=' Fuente 23698 original: unidad principal 688 g, total 709 g; no se mezclan fichas de las referencias 25886/25888 nuevas.';
    add(id,name,source,{width,height,weight,format,connection},scope);
  }
  add('market-clones-105705','Trust GXT 867 Acira · referencia 24882','https://dezlwerqy1h00.cloudfront.net/Media/Datasheets/24882-Trust%20Gaming-GXT%20867%20Acira-Datasheet_ru.pdf',{format:'Mecánico · 60 %',connection:'USB-C a USB-A por cable extraíble',width:290,height:40,weight:460},'Ficha oficial 24882 US: cuerpo 290 × 100 × 40 mm; unidad principal 460 g, total publicado 490 g. No es Acira inalámbrico GXT 873. Confirmar referencia regional del ejemplar. El documento difiere entre 1,8 m y 1,5 m de cable; no se certifica longitud de cable.');
  add('cooler-corsair-h100i-capellix','CORSAIR iCUE H100i ELITE CAPELLIX · CW-9060046-WW','https://www.corsair.com/us/en/p/cpu-coolers/cw-9060046-ww/icue-h100i-elite-capellix-liquid-cpu-cooler-cw-9060046-ww',{format:'AIO 240 mm · dos ML120 RGB PWM · radiador de 277 × 120 × 27 mm',coolerType:'aio',rpm:2400,noise:37,sockets:'Intel LGA1700 con kit específico / 1200 / 115x / 1366 / 2011 / 2066 · AMD AM5 / AM4 / sTRX4 / sTR4'},'SKU CW-9060046-WW, no CAPELLIX XT. Rango acústico publicado del ventilador 10–37 dBA; se representa su límite superior, no ruido de bomba ni suma de ventiladores. La cifra Product Height 119,6 no se usa como altura de torre. LGA1700 requiere kit CW-8960091 o CW-8960093 según CORSAIR; verificar contenido y montaje antes de comprar.',{notApplicable:{height:'AIO: revisar radiador, ventiladores y holguras; altura de torre no aplicable.'}});
  const argbSource='https://www.arctic.de/media/a5/fe/97/1709195124/Spec_Sheet_Freezer_36_A-RGB_EN.pdf';
  for(const [id,pn,color]of [['market-speedlogic-40913','ACFRE00124A','Black'],['market-speedlogic-40936','ACFRE00125A','White']]){
    add(id,'ARCTIC Freezer 36 A-RGB '+color,argbSource,{format:'Torre de aire · dos P12 PWM PST A-RGB de 120 mm',coolerType:'air',height:159,rpm:2000,weight:917,sockets:'AMD AM5 / AM4 · Intel LGA1851 / LGA1700',heatpipes:4},`Referencia ${pn}: 104 × 126 × 159 mm, dos ventiladores 200–2000 rpm y 917 g netos. No es Freezer 36-S de 156 mm. Confirmar revisión y kit de montaje. No se publica ruido máximo comparable en dBA; parada a 0 rpm no equivale a ruido máximo cero.`,{unpublished:{noise:'El fabricante no publica un máximo en dBA en esta ficha.'}});
  }
  add('market-speedlogic-28636','COUGAR Poseidon Elite ARGB 240 White','https://cougargaming.com/us/products/cooling/poseidon-elite-argb/',{format:'AIO 240 mm · radiador 272 × 121 × 27 mm · dos ventiladores de 120 × 25 mm',coolerType:'aio',rpm:2200,sockets:'Intel LGA1851 / 1700 / 1200 / 115X / 1366 · AMD AM5 / AM4 / AM3 / AM2 / FM2 / FM1'},'Modelo CGR-PSDELRGB-W-240 / PN 3MPSD240.0002. Ventiladores 500–2200 rpm; bomba 2700 rpm no usada como RPM de ventilador. La altura de torre no aplica a este AIO: comprobar radiador, ventiladores, tubos y holguras. COUGAR declara ruido acústico 33,5 dBA sin identificarlo aquí como máximo; no se grafica como ruido máximo.',{notApplicable:{height:'AIO: revisar dimensiones del radiador y ventiladores, no altura de torre.'},unpublished:{noise:'Ruido acústico declarado 33,5 dBA; máximo comparable no especificado.'}});
  add('model-board-pro-z790-p-wifi','MSI PRO Z790-P WIFI','https://www.msi.com/Motherboard/PRO-Z790-P-WIFI/Specification',{dimensions:'243,84 × 304,8 mm',chipset:'Intel Z790'},'Se amplían dimensiones de PCB y chipset desde MSI para PRO Z790-P WIFI DDR5; no variante DDR4 ni Z790-A. Los otros datos conservan su fuente anterior y dependen de CPU, BIOS y QVL.');
  add('market-clones-86614','ASRock H610M-HDV','https://www.asrock.com/mb/Intel/H610M-HDV/',{m2Slots:0},'H610M-HDV DDR4 sin sufijo M.2. La lista completa de almacenamiento, conectores y el plano de placa del manual confirman que no hay ranura M.2 de almacenamiento integrada. El cero es un recuento del plano, no un dato desconocido convertido a cero. La nota de arranque NVMe por PCIe no añade una ranura M.2; no equivale a H610M-HDV/M.2+ o D5. Confirmar modelo y revisión vendidos.',{fieldSources:{m2Slots:{source:'https://download.asrock.com/Manual/H610M-HDV.pdf',checkedAt:'2026-10-22',scope:'Plano H610M-HDV y lista de conectores del manual; cero ranuras M.2 integradas.'}},additionalSources:[{source:'https://download.asrock.com/Manual/H610M-HDV.pdf',label:'Manual · plano de placa y conectores'}]});
  reviewed['market-clones-86614'].replacesScope=true;
  window.FENIXA_SPEC_REVIEW=reviewed;
})();
