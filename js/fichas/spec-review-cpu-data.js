// Official cooling documentation, scoped to boxed references rather than local stock.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const add=(id,values,source,note)=>{
    const old=review[id]||{};
    review[id]={...old,values:{...old.values,...values},fieldSources:{...old.fieldSources,...Object.fromEntries(Object.keys(values).map(k=>[k,{source,checkedAt:'2026-10-22',scope:note}]))},additionalSources:[...(old.additionalSources||[]),{source,label:'Ampliación oficial · refrigeración / interfaz'}],scope:(old.scope?old.scope+' ':'')+note};
  };
  const boxed='Dato publicado para presentación BOX. La cotización de tienda no confirma BOX/OEM, accesorios, revisión ni montaje; comprobar contenido antes de comprar. No se deduce temperatura, ruido ni rendimiento.';
  const amdBundled='https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html';
  for(const id of ['market-ryzen-8500g','market-ryzen-8600g'])add(id,{thermal:'AMD Wraith Stealth en presentación BOX · confirmar contenido local'},amdBundled,boxed+' AMD incluye expresamente este modelo en su tabla de refrigeración incluida.');
  const fSeries='https://www.amd.com/content/dam/amd/en/documents/partner-hub/ryzen/amd-ryzen-8000f-quick-reference-guide-competitive.pdf';
  for(const id of ['market-clones-95498','market-clones-94762'])add(id,{thermal:'AMD Wraith Stealth en presentación BOX · confirmar contenido local'},fSeries,boxed+' La guía oficial de Ryzen 8000 F especifica Wraith Stealth para 8400F y 8700F.');
  const amd=[
    ['market-ryzen-9600x','9000','5-9600x','aire de gama alta'],
    ['market-ryzen-9700x','9000','7-9700x','aire de gama alta'],
    ['market-speedlogic-31655','7000','7-7800x3d','líquida'],
    ['cpu-amd-ryzen-5-7600x','7000','5-7600x','aire de gama alta'],
    ['cpu-amd-ryzen-9-9950x','9000','9-9950x','líquida']
  ];
  for(const [id,series,model,cooler]of amd){
    const source=`https://www.amd.com/en/products/processors/desktops/ryzen/${series}-series/amd-ryzen-${model}.html`;
    add(id,{thermal:`Sin disipador incluido · AMD recomienda ${cooler} para rendimiento óptimo`,pcie:'PCIe 5.0'},source,boxed+' Recomendación publicada por AMD; no es prueba de que cualquier disipador de ese tipo sea adecuado.');
  }
  add('cpu-amd-ryzen-9-7900x',{thermal:'Sin disipador incluido · AMD recomienda líquida para rendimiento óptimo',pcie:'PCIe 5.0'},'https://shop-us-en.amd.com/amd-ryzen-9-7900x-processor/',boxed+' SKU de referencia 100-100000589WOF; solo datos técnicos del modelo, sin importar su precio extranjero.');
  const intelK='https://www.intel.com/content/www/us/en/support/articles/000005940.html';
  for(const id of ['market-speedlogic-29387','market-speedlogic-28765','market-speedlogic-39187','market-speedlogic-36356'])add(id,{thermal:'Sin disipador incluido · Intel Core / Core Ultra K o KF'},intelK,boxed+' Intel excluye expresamente disipador en procesadores de escritorio K/KF; seleccionar refrigeración aparte según CPU, placa y gabinete.');
  const intelBox='https://www.intel.com/content/www/us/en/support/articles/000089627/processors.html';
  for(const id of ['market-speedlogic-28866','market-clones-55872'])add(id,{thermal:'Intel Laminar RM1 en presentación BOX · confirmar contenido local'},intelBox,boxed+' Intel enumera de forma explícita i7-14700 e i3-12100F entre los modelos BOX con RM1. No extrapolar a K/KF ni a unidades tray.');
})();

// Follow-up 03/11/2026: published CPU PCIe interface, independent of local packaging.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const scope='Versión PCIe publicada para el procesador exacto por AMD; la placa, su BIOS y el dispositivo conectado determinan los enlaces efectivos. No confirma accesorios, presentación BOX/OEM ni stock de la oferta local.';
  for(const [id,model] of [['cpu-amd-ryzen-7-7700','7-7700'],['cpu-amd-ryzen-9-7900','9-7900']]) {
    const source=`https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-${model}.html`;
    const old=review[id]||{};
    review[id]={...old,values:{...old.values,pcie:'PCIe 5.0'},fieldSources:{...old.fieldSources,pcie:{source,checkedAt:'2026-11-03',scope}},additionalSources:[...(old.additionalSources||[]),{source,label:'Interfaz PCIe del procesador · 03/11/2026'}],scope:[old.scope,scope].filter(Boolean).join(' ')};
  }
})();


// Iteration 05: ten existing AMD cards; do not infer missing usable lanes.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const rows=[
  {
    "id": "cpu-amd-ryzen-5-7600",
    "values": {
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html"
  },
  {
    "id": "cpu-amd-ryzen-7-7700x",
    "values": {
      "pcie": "PCIe 5.0",
      "thermal": "Sin disipador incluido — AMD recomienda aire de gama alta para rendimiento óptimo"
    },
    "source": "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html"
  },
  {
    "id": "cpu-amd-ryzen-9-7950x",
    "values": {
      "pcie": "PCIe 5.0",
      "thermal": "Sin disipador incluido — AMD recomienda refrigeración líquida para rendimiento óptimo"
    },
    "source": "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7950x.html"
  },
  {
    "id": "cpu-amd-ryzen-9-9900x",
    "values": {
      "pcie": "PCIe 5.0",
      "thermal": "Sin disipador incluido — AMD recomienda refrigeración líquida para rendimiento óptimo"
    },
    "source": "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9900x.html"
  },
  {
    "id": "model-cpu-amd-ryzen-5-4500",
    "values": {
      "architecture": "Zen 2",
      "pcie": "PCIe 3.0",
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-4000-series/amd-ryzen-5-4500.html"
  },
  {
    "id": "model-cpu-amd-ryzen-5-5500",
    "values": {
      "architecture": "Zen 3",
      "pcie": "PCIe 3.0",
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5500.html"
  },
  {
    "id": "model-cpu-amd-ryzen-5-5600",
    "values": {
      "architecture": "Zen 3",
      "pcie": "PCIe 4.0",
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html"
  },
  {
    "id": "model-cpu-amd-ryzen-5-5600x",
    "values": {
      "architecture": "Zen 3",
      "pcie": "PCIe 4.0",
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600x.html"
  },
  {
    "id": "model-cpu-amd-ryzen-5-5600g",
    "values": {
      "architecture": "Zen 3",
      "pcie": "PCIe 3.0",
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600g.html"
  },
  {
    "id": "model-cpu-amd-ryzen-7-5700g",
    "values": {
      "architecture": "Zen 3",
      "pcie": "PCIe 3.0",
      "thermal": "AMD Wraith Stealth en presentación BOX — confirmar contenido de la unidad local"
    },
    "source": "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-7-5700g.html"
  }
];
  const scope="Revisión oficial 25/10/2026. Refrigeración PIB/BOX publicada para el modelo; no certifica BOX/OEM, accesorios ni revisión de la oferta local. La recomendación de disipador no demuestra montaje ni rendimiento. PCIe es la versión publicada del procesador; placa y CPU determinan conexiones efectivas.";
  for(const {id,values,source} of rows) {
    const old=review[id]||{};
    review[id]={...old,values:{...old.values,...values},fieldSources:{...old.fieldSources,...Object.fromEntries(Object.keys(values).map(key=>[key,{source,checkedAt:"2026-10-25",scope}]))},additionalSources:[...(old.additionalSources||[]),{source,label:"Ampliación oficial CPU · 25/10/2026"}],scope:(old.scope?old.scope+" ":"")+scope};
  }
})();

// CPU follow-up 5700X, 03/11/2026: exact processor facts, no local packaging claim.
(() => {
  const review=window.FENIXA_SPEC_REVIEW||={};
  const id='model-cpu-amd-ryzen-7-5700x',old=review[id]||{};
  const source='https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-7-5700x.html';
  const values={architecture:'Zen 3',pcie:'PCIe 4.0'};
  const scope='Arquitectura e interfaz publicadas para Ryzen 7 5700X en la ficha individual AMD. No se trasladan de 5700, 5700G ni 5700X3D. Placa, BIOS y dispositivo determinan enlaces efectivos. La presentación y los accesorios de la unidad local siguen por confirmar; esta revisión no completa refrigeración, precios ni stock.';
  review[id]={...old,values:{...old.values,...values},fieldSources:{...old.fieldSources,...Object.fromEntries(Object.keys(values).map(key=>[key,{source,checkedAt:'2026-11-03',scope}]))},additionalSources:[...(old.additionalSources||[]),{source,label:'Arquitectura e interfaz del 5700X · 03/11/2026'}],scope:[old.scope,scope].filter(Boolean).join(' ')};
})();
