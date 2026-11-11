// Archived ATX 12V models: per-wattage cable tables, not new ATX 3.x successors.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const rows=[
    ['focus-gx',550,2,2,10,3,10],['focus-gx',650,2,4,10,3,10],
    ['focus-gx',750,2,4,10,3,10],['focus-gx',850,2,6,10,5,10],['focus-gx',1000,2,6,10,5,10],
    ['focus-px',550,2,2,10,3,10],['focus-px',650,2,4,10,3,10],
    ['focus-px',750,2,4,10,3,10],['focus-px',850,2,6,10,5,10],
    ['prime-tx',650,2,4,14,3,12],['prime-tx',750,2,4,14,3,12],
    ['prime-tx',850,2,6,14,5,12],['prime-tx',1000,2,6,14,5,12],
    ['prime-px',650,2,4,14,3,12],['prime-px',750,2,4,14,3,12],
    ['prime-px',850,2,6,14,5,12],['prime-px',1000,2,6,14,5,12],
    ['prime-px',1300,2,8,14,5,12],
    ['core-gc',500,1,2,4,3,7],['core-gc',650,1,4,6,3,7]
  ];
  for(const [family,watts,eps,pcie,sata,molex,years]of rows){
    const id='model-power-seasonic-'+family+'-'+watts+'-atx12v',source='https://seasonic.com/'+family+'/',old=review[id]||{};
    const values={
      connectors:'1 × ATX 20+4 · '+eps+' × CPU 4+4 · '+pcie+' × PCIe 6+2 · '+sata+' × SATA · '+molex+' × Molex',
      protections:'OPP · OVP · UVP · OCP · OTP · SCP — declaradas por Seasonic',
      warranty:years+' años de garantía limitada del fabricante — sujeta a condiciones y región'
    };
    let scope='Serie archivada ATX 12V, potencia exacta '+watts+' W. Recuento de conectores de salida según la tabla de cables de esta potencia, no cantidad de cables modulares ni tomas de la fuente. Los adaptadores Molex-SATA se indican aparte y no se suman a las conexiones SATA directas.';
    if(family.startsWith('prime-'))scope+=' Seasonic advierte una transición de cajas con/sin cable 12VHPWR y distintos acabados; no se garantiza ese accesorio en la unidad ni se convierte esta serie en ATX 3.x.';
    else if(family==='focus-gx')scope+=' La tabla actual añade 12VHPWR a la sección de 1000 W; confirmar contenido y revisión local. No extender ese accesorio a las demás potencias ni atribuir ATX 3.x.';
    scope+=' Protecciones publicadas, sin ensayo de disparo. Garantía del fabricante, no garantía adicional de una tienda colombiana; comprobar factura, distribuidor y condiciones de RMA. Los demás valores conservan sus fuentes anteriores; no hay precio ni stock nuevo.';
    review[id]={...old,values:{...old.values,...values},fieldSources:{...old.fieldSources,...Object.fromEntries(Object.keys(values).map(key=>[key,{source,checkedAt:'2026-10-22',scope}]))},
      additionalSources:[...(old.additionalSources||[]),{source,label:'Seasonic — tabla por potencia, protecciones y garantía'}],scope:(old.scope?old.scope+' ':'')+scope};
  }
})();
