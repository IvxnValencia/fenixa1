// Exact MSI motherboard references. A form factor never supplies inferred dimensions.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const manual=name=>'https://download.msi.com/archive/mnu_exe/mb/'+name;
  const rows=[
    ['MAG-B550-TOMAHAWK','AMD B550','305 × 244 mm',manual('MAGB550TOMAHAWK.pdf'),'Dimensiones del extracto indexado del manual exacto; descarga completa excede el límite de lectura.'],
    ['MAG-B550M-MORTAR-WIFI','AMD B550','244 × 244 mm',manual('MAGB550MMORTARWIFI_MAGB550MMORTAR.pdf'),'Dimensiones del extracto indexado del manual que incluye MORTAR WIFI original, sin MAX.'],
    ['MPG-B550-GAMING-PLUS','AMD B550','244 × 305 mm',manual('MPGB550GAMINGPLUS_FR.pdf'),'Dimensiones del manual oficial en francés.'],
    ['MPG-B550-GAMING-EDGE-WIFI','AMD B550','305 × 244 mm',manual('MPGB550GAMINGEDGEWIFI.pdf'),'Dimensiones del extracto indexado del manual exacto, sin variante B550I.'],
    ['MPG-B550-GAMING-CARBON-WIFI','AMD B550',null,'https://download-2.msi.com/archive/mnu_exe/mb/E7C90v1.2.pdf','Discrepancia en el manual, página 18: 12 × 9,6 pulgadas frente a 30,4 × 24,4 cm. Dimensiones por confirmar; no corregir silenciosamente la cifra.'],
    ['MEG-X570-UNIFY','AMD X570','305 × 244 mm','https://es.msi.com/Motherboard/MEG-X570-UNIFY/Specification','Dimensiones de la página oficial en español, modelo X570 UNIFY, sin X570S ni UNIFY-X.'],
    ['MEG-X570-ACE','AMD X570','305 × 244 mm',manual('E7C35v1.2.pdf'),'Dimensiones del manual oficial, página 18, modelo X570 ACE original.'],
    ['MPG-X570-GAMING-EDGE-WIFI','AMD X570',null,null,'La ficha oficial presenta 12 × 9,6 pulgadas junto a 30,4 × 24,3 cm, cifras no equivalentes. Dimensiones por confirmar; no trasladar las de X570S EDGE MAX.'],
    ['MAG-X570S-TOMAHAWK-MAX-WIFI','AMD X570','305 × 244 mm',null,'La ficha exacta X570S TOMAHAWK MAX declara chipset AMD X570 y estas medidas; no inventar un chipset X570S separado.'],
    ['PRO-B760-P-WIFI','Intel B760','243,84 × 304,8 mm',null,'Medidas PCB Info del modelo DDR5, sin sufijo DDR4.'],
    ['PRO-B760M-A-WIFI','Intel B760','243,84 × 243,84 mm',null,'Medidas PCB Info del modelo DDR5, sin sufijo DDR4.'],
    ['MPG-B760I-EDGE-WIFI','Intel B760','170 × 170 mm',null,'Medidas PCB Info del modelo Mini-ITX B760I, sin trasladar las del B760M.'],
    ['MAG-B760M-MORTAR-WIFI','Intel B760','243,84 × 243,84 mm',null,'Medidas PCB Info del modelo DDR5, sin DDR4 ni MORTAR MAX.'],
    ['MPG-Z790-EDGE-WIFI','Intel Z790','243,84 × 304,8 mm',null,'Medidas PCB Info del modelo DDR5 original, sin EDGE TI MAX.'],
    ['MAG-Z790-TOMAHAWK-WIFI','Intel Z790','243,84 × 304,8 mm',null,'Medidas PCB Info del modelo DDR5 original, sin MAX ni DDR4.'],
    ['MEG-Z790-ACE','Intel Z790','277 × 305 mm',manual('MEGZ790ACE.pdf'),'Dimensiones del extracto indexado del manual Z790 ACE original, sin ACE MAX. La descarga completa excede el límite de lectura.'],
    ['MPG-Z690-EDGE-WIFI','Intel Z690','305 × 244 mm',null,'Medidas del modelo DDR5, sin sufijo DDR4.'],
    ['MAG-B660M-MORTAR-WIFI','Intel B660','244 × 244 mm',null,'Dimensiones de la ficha exacta DDR5, sin sufijo DDR4.'],
    ['MAG-B660-TOMAHAWK-WIFI','Intel B660','305 × 244 mm',manual('MAGB660TOMAHAWKWIFI.pdf'),'Dimensiones del extracto indexado del manual DDR5 original, sin EVA e-PROJECT ni DDR4.']
  ];
  for(const [model,chipset,dimensions,dimensionSource,note] of rows){
    const id='model-board-'+model.toLowerCase(),source='https://www.msi.com/Motherboard/'+model+'/Specification',old=review[id]||{};
    const values={chipset,...(dimensions?{dimensions}:{})};
    const fieldSources={...old.fieldSources,chipset:{source,checkedAt:'2026-10-22'}};
    if(model==='MAG-Z790-TOMAHAWK-WIFI'){
      values.socket='LGA1700';
      fieldSources.socket={source,checkedAt:'2026-10-22',scope:'Socket 1700 declarado por MSI para este modelo exacto.'};
    }
    if(dimensions)fieldSources.dimensions={source:dimensionSource||source,checkedAt:'2026-10-22',scope:note};
    review[id]={...old,values:{...old.values,...values},fieldSources,
      additionalSources:[...(old.additionalSources||[]),{source:dimensionSource||source,label:dimensionSource?'Manual / dimensiones de placa':'Ficha oficial MSI — PCB y chipset'}],
      ...(!dimensions?{unpublished:{...old.unpublished,dimensions:note}}:{}),
      scope:(old.scope?old.scope+' ':'')+note+' Solo se amplían campos documentados del modelo exacto; los demás conservan sus fuentes y fechas. La generación de BIOS, QVL y unidad local siguen por comprobar. Precio y stock no se deducen de la página del fabricante.'};
  }
})();
