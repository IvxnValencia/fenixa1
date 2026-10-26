// Documented mounting positions and constraints, not full assembly certification.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const rows=[
    ['fd-c-mes2c-01','meshify-series/meshify-2-compact/meshify-2-compact-black','Fuente ATX hasta 200 mm. Radiadores: frontal 120/140/240/280/360 mm; superior 120/240 mm; inferior y trasero 120 mm.'],
    ['fd-c-def7c-01','define-series/define-7-compact/define-7-compact-black-solid','Fuente ATX hasta 200 mm. Radiadores: frontal 120/140/240/280/360 mm; superior 120/140/240 mm; inferior y trasero 120 mm.'],
    ['fd-c-poa1a-01','pop-series/pop-air/pop-air-black-solid','Fuente ATX hasta 170 mm. Radiadores: frontal 120/240/280 mm; superior 120/240 mm; trasero 120 mm.'],
    ['fd-ca-node-304-bl','node-series/node-304/node-304-black','Los soportes de discos sin usar se retiran para alojar GPU largas, según Fractal. Grosor máximo de GPU publicado: 45 mm; longitud máxima publicada: 310 mm. Revisar soportes, cableado y fuente de la configuración concreta.'],
    ['fd-c-por1m-06','pop-series/pop-mini-air/pop-mini-air-rgb-black-tg-clear-tint','Fuente ATX hasta 150 mm. Radiadores: frontal y superior 120/240 mm; trasero 120 mm. No extender el frontal de 280 mm de Pop Air al modelo Mini.'],
    ['fd-c-por1x-06','pop-series/pop-xl-air/pop-xl-air-rgb-black-tg-clear-tint','Fuente ATX hasta 205 mm. Radiadores: frontal 120/240/280/360 mm; superior 120/140/240/280 mm; trasero 120/140 mm.'],
    ['fd-c-foc2a-07','focus-series/focus-2/focus-2-black-solid','Fuente ATX hasta 250 mm. Radiadores: frontal 120/140/240/280/360 mm; superior 120/240 mm; trasero 120 mm.'],
    ['fd-ca-focus-bk-w','focus-series/focus-g/focus-g-black-window','Fuente ATX hasta 230 mm. Radiadores: frontal 120/140/240/280 mm; superior 120/240 mm; trasero 120 mm. Es Focus G original, no Focus 2.'],
    ['fd-ca-node-804-bl-w','node-series/node-804/node-804','Fuente ATX hasta 260 mm. La tabla del fabricante enumera radiadores frontales y superiores de 120/240 mm; comprobar la cámara de montaje y sus interferencias en el manual antes de combinar posiciones.'],
    ['fd-c-def7m-01','define-series/define-7-mini/define-7-mini-black-solid','Fuente ATX hasta 165 mm. Radiadores: frontal 120/140/240/280 mm; superior 120/240 mm; inferior y trasero 120 mm.'],
    ['fd-c-def7n-01','define-series/define-7-nano/define-7-nano-black-solid','Fuente ATX hasta 165 mm. Radiadores publicados: frontal 120/140/240/280 mm y trasero 120 mm. No trasladar las posiciones superiores del Define 7 Mini.'],
    ['fd-c-mes2n-01','meshify-series/meshify-2-nano/meshify-2-nano-black-tg-dark-tint','Fuente ATX hasta 165 mm. Grosor máximo publicado de GPU: 57 mm. Radiadores publicados: frontal 120/140/240/280 mm y trasero 120 mm.'],
    ['fd-c-rid1n-11','ridge-series/ridge/ridge-pcie-4-0-black','Fuente SFX/SFX-L hasta 130 mm; no ATX. GPU: hasta 335 mm de longitud, 125 mm de ancho y 57 mm de grosor en la tabla publicada. Radiador lateral de 120 mm. Hay que verificar la combinación de GPU, ventiladores/radiador y cableado; estos límites no certifican que todo quepa a la vez.']
  ];
  for(const [slug,page,description]of rows){
    const id='model-case-'+slug,source='https://www.fractal-design.com/products/cases/'+page+'/',old=review[id]||{};
    const clearanceNotes=description+' Son posiciones/tamaños nominales publicados, no una combinación simultánea comprobada. El espesor del conjunto radiador-ventiladores, RAM, bahías y conectores puede reducir la holgura; cotejar el manual y la unidad elegida.';
    review[id]={...old,values:{...old.values,clearanceNotes},fieldSources:{...old.fieldSources,clearanceNotes:{source,checkedAt:'2026-10-22'}},additionalSources:[...(old.additionalSources||[]),{source,label:'Fractal — posiciones de montaje y límites'}],scope:(old.scope?old.scope+' ':'')+'Se amplían las condiciones de espacio desde la página del SKU exacto. Las otras cifras y sus fechas se conservan; no se garantiza montaje completo ni se deduce rendimiento térmico.'};
  }
})();
