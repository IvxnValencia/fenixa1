// Placement from the exact Samsung client SSD lineup and physical interface.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const groups=[
    [['mz-v7s250bw','mz-v7s500bw','mz-v7s1t0bw','mz-v7s2t0bw'],'https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_970_EVO_Plus_Data_Sheet_Rev.3.0_10129514071343.pdf','970 EVO Plus, M.2 2280 NVMe'],
    [['mz-v7p512bw','mz-v7p1t0bw'],'https://semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_970_PRO_Data_Sheet_Rev.1.0.pdf','970 PRO, M.2 2280 NVMe'],
    [['mz-v8v250bw','mz-v8v500bw','mz-v8v1t0bw'],'https://semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_980_Data_Sheet_Rev.1.1.pdf','980, M.2 2280 NVMe'],
    [['mz-76e250bw','mz-76e500bw','mz-76e1t0bw','mz-76e2t0bw','mz-76e4t0bw'],'https://semiconductor.samsung.com/resources/data-sheet/Samsung_SSD_860_EVO_Data_Sheet_Rev1.pdf','860 EVO MZ-76E, SATA de 2,5 pulgadas; no variante M.2 MZ-N6E ni mSATA']
  ];
  for(const [models,source,description]of groups)for(const model of models){
    const id='model-storage-'+model,old=review[id]||{},scope='Instalación interna identificada por la aplicación Client PCs, interfaz y formato de la ficha Samsung y por el código '+model.toUpperCase()+' en su tabla de producto: '+description+'. No es una unidad externa USB; una carcasa USB sería un accesorio aparte. Solo se completa instalación; capacidades, velocidades, TBW y fechas anteriores se conservan. Confirmar conexión y anclaje del equipo; no se garantiza arranque, PS5 ni montaje universal.';
    review[id]={...old,values:{...old.values,placement:'Interno'},fieldSources:{...old.fieldSources,placement:{source,checkedAt:'2026-10-22',scope}},additionalSources:[...(old.additionalSources||[]),{source,label:'Samsung — formato, interfaz y códigos de producto'}],scope:(old.scope?old.scope+' ':'')+scope};
  }
})();
