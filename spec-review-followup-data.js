// Later enrichments are separate from the frozen historical target80 batch.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const source = 'https://www.logitech.com/en-us/shop/p/k400-plus-touchpad-keyboard.920-007119';
  const retailer = 'https://speedlogic.com.co/tienda/teclados/teclado-touch-inalambrico-logitech-k400-smart-tv/';
  const id = 'market-speedlogic-3952', old = review[id] || {};
  const values = {
    format: 'Teclado con touchpad integrado',
    connection: 'Inalámbrica de 2,4 GHz mediante receptor USB Logitech Unifying',
    width: 354.3,
    weight: 390
  };
  const scope = 'Referencia publicada K400 Plus 920-007119, English International QWERTY; la descripción de la tienda identifica K400 Plus, pero su PN y distribución local siguen por confirmar. Ancho de producto 354,3 mm y peso publicado 390 g; no son embalaje ni peso de envío. La fuente no desglosa el peso de las pilas: dos AA preinstaladas se enumeran por separado como contenido del paquete. Logitech denomina Height a 139,9 mm y Depth a 23,5 mm; no se asigna ninguna cifra al eje de altura vertical sin una identificación inequívoca de la orientación. No se atribuyen Bluetooth, garantía local, precio o stock.';
  review[id] = {
    ...old,
    displayName: 'Logitech K400 Plus · referencia publicada',
    source,
    checkedAt: '2026-11-04',
    values: { ...old.values, ...values },
    fieldSources: { ...old.fieldSources, ...Object.fromEntries(Object.keys(values).map(key => [key, { source, checkedAt: '2026-11-04', scope }])) },
    unpublished: { ...old.unpublished, height: 'La fuente llama Height a 139,9 mm y Depth a 23,5 mm; no identifica inequívocamente el eje vertical de este esquema.' },
    additionalSources: [ ...(old.additionalSources || []), { source: retailer, label: 'Identificación K400 Plus en la descripción de tienda; PN local pendiente' } ],
    scope: [old.scope, scope].filter(Boolean).join(' ')
  };

  const conflictId = 'market-speedlogic-49182', prior = review[conflictId] || {};
  review[conflictId] = {
    ...prior,
    source: 'https://speedlogic.com.co/tienda/memorias-ram/memoria-ram-para-portatil-portatil-ddr5-16gb-5600-crucial/',
    checkedAt: '2026-11-04',
    identityConflict: true,
    values: {},
    warning: 'Referencia por confirmar: el título anuncia RAM para portátil, pero la descripción publica CT16G56C46U5 y UDIMM para PC de escritorio. Confirma el número de parte y el formato antes de elegir.',
    scope: 'Contradicción dentro de la ficha individual de tienda: título para portátil frente a PN CT16G56C46U5 y UDIMM de escritorio en la descripción. No se sustituye por CT16G56C46S5 ni se usan las cifras anunciadas como especificaciones verificadas. Los nueve campos técnicos permanecen desconocidos; no se certifican el modelo de la fotografía, la compatibilidad, el precio ni el stock.'
  };
})();

// Kingston KCP556US8-16: exact retailer PN matched to the manufacturer part page.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const id = 'market-speedlogic-49212', old = review[id] || {};
  const source = 'https://www.kingston.com/en/memory/search?partid=KCP556US8-16';
  const values = { capacity: 16, memory: 'DDR5', rate: 5600, cl: 46, format: 'UDIMM · 288 pines', voltage: 1.1 };
  const scope = 'PN KCP556US8-16 publicado en la descripción de la tienda y cotejado con la página oficial Kingston por número de parte; no se sustituye por KVR56U46BS8-16. Capacidad16GB, tasa nominal5600MT/s, CL46 y voltaje1,1V de esa referencia; no equivalen a SPD predeterminado, perfilXMP/EXPO ni rendimiento medido. Kingston describe Non-ECC, unbuffered y1Rx8; el rango1Rx8 no establece cantidad de módulos del paquete. Cantidad de módulos, tasaSPD y perfiles permanecen pendientes. Confirmar PN, revisión y presentación de la unidad local; la foto no certifica SKU. Sin precio, stock, BIOS/QVL ni compatibilidad total atribuidos.';
  review[id] = {
    ...old, displayName: 'Kingston KCP556US8-16 · referencia publicada', modelKey: 'KCP556US8-16', source, checkedAt: '2026-11-04',
    values: { ...old.values, ...values },
    fieldSources: { ...old.fieldSources, ...Object.fromEntries(Object.keys(values).map(key => [key, { source, checkedAt: '2026-11-04', scope }])) },
    additionalSources: [ ...(old.additionalSources || []), { source: 'https://speedlogic.com.co/tienda/memorias-ram/memoria-ram-para-pc-ddr5-16g-5600-kingston-no-disipada/', label: 'PN KCP556US8-16 anunciado en la ficha de tienda' } ],
    scope: [old.scope, scope].filter(Boolean).join(' ')
  };
})();

// Model explicitly named by AMD's cooling table; local accessories remain unconfirmed.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const id = 'market-ryzen-8700g', old = review[id] || {};
  const source = 'https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html';
  const scope = 'La tabla oficial AMD comprobada el03/11/2026 nombra expresamente Ryzen7 8700G con Wraith Stealth. Es una referencia publicada del modelo, no una garantía de accesorios de la oferta local. Confirmar PN, presentación, revisión y contenido de la unidad. La nota de cambios SR1/SR2a de la página individual no permite asignar esos códigos a cada SBX/CSX; no se deduce esa asociación.';
  review[id] = {
    ...old, values: { ...old.values, thermal: 'AMD Wraith Stealth en la tabla oficial · confirmar PN, presentación y contenido local' },
    fieldSources: { ...old.fieldSources, thermal: { source, checkedAt: '2026-11-03', scope } },
    additionalSources: [ ...(old.additionalSources || []), { source, label: 'AMD: referencia de refrigeración por modelo, comprobada03/11/2026' } ],
    scope: [old.scope, scope].filter(Boolean).join(' ')
  };
})();


// Redragon Fizz Pro: source-model reference; local PN/layout remain unconfirmed.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const id = 'market-clones-104185', old = review[id] || {};
  const source = "https://redragon.es/products/best-seller/teclado-mecanico-60-fizz-pro/";
  const values = {
  "format": "Teclado mecánico compacto 60% · 61 teclas",
  "connection": "Cable USB-C extraíble, receptor USB de 2,4 GHz y Bluetooth 5.0",
  "weight": 474
};
  const scope = "Referencia publicada Redragon Fizz Pro K616-RGB; el selector oficial White Pink identifica K616-RGB WP y contiene la tabla técnica citada. Esa tabla conserva el rótulo Fizz Pro K616-RGB B, por lo que se trata como referencia publicada del modelo y no como certificación inequívoca del PN de la unidad local. La tienda anuncia blanco/rosado, switches Red y EAN 6950376714404, pero otro texto dice Grey White; confirmar PN, color, revisión y distribución local. La tabla oficial indica distribución Inglés: no se atribuye layout español. Peso publicado de producto 0,474 kg, no peso de envío; la fuente no lo desglosa por batería o accesorios. Se conservan las dimensiones literales 29,7 × 10,6 × 3,5 cm sin asignarlas a ancho o altura porque no se identifica el orden de ejes. No se trasladan cifras de variantes Magnetic, ABNT2 o de otras páginas regionales.";
  review[id] = {
    ...old, displayName: 'Redragon Fizz Pro K616-RGB · referencia publicada', source, checkedAt: '2026-11-04',
    values: { ...old.values, ...values },
    fieldSources: { ...old.fieldSources, ...Object.fromEntries(Object.keys(values).map(key => [key, { source, checkedAt: '2026-11-04', scope }])) },
    unpublished: { ...old.unpublished, ...{"width":"La tabla oficial publica 29,7 × 10,6 × 3,5 cm sin identificar el orden de ejes; ancho pendiente.","height":"La tabla oficial publica 29,7 × 10,6 × 3,5 cm sin identificar el orden de ejes; altura vertical pendiente."} },
    additionalSources: [ ...(old.additionalSources || []), { source: "https://clonesyperifericos.com/comprar/teclado-mecanico-redragon-k616-rgb-fizz-pro-white-gray-usb-c-bt-inalambrico-usb-2/", label: 'Tienda: Fizz Pro, switches Red y EAN 6950376714404; PN/layout local pendientes' } ],
    scope: [old.scope, scope].filter(Boolean).join(' ')
  };
})();

// Exact mounting lists from the same primary model/PN sources; acoustic unknowns retained.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const rows = [
  {
    "id": "market-speedlogic-29053",
    "source": "https://antec.com/product/cooling/a30-neo-argb",
    "sockets": "Intel Core i3/i5: LGA775 / LGA115X / LGA1200 / LGA1700 · AMD AM3 / AM4 / AM5",
    "scope": "Montajes declarados para A30 NEO ARGB, UPC oficial 0-761345-75297-8. La tabla Antec nombra Intel Core i3/i5:775/115X/1200/1700 y AMD AM3/AM4/AM5; se conserva ese alcance sin ampliarlo a otras familias Intel ni a LGA1851. No es A30 NEO sin ARGB. Comprobar revisión, kit y contenido de la unidad local; la lista no certifica montaje físico ni holgura."
  },
  {
    "id": "market-speedlogic-54243",
    "source": "https://webapi3.adata.com/storage/downloadfile/xpg_maestro_plus_42sa_datasheet-2.pdf",
    "sockets": "Intel LGA1851 / LGA1700 / LGA1200 / LGA115x · AMD AM5 / AM4 / AM3",
    "scope": "Montajes publicados en Applications, página3 de la ficha oficial MAESTRO PLUS42SA negro; Ordering Information, página4, identifica PN75261750 / MAESTROPLUS42SA-BKCWW. Intel LGA1851/1700/1200/115x y AMD AM5/AM4/AM3. No se trasladan de MAESTRO42SA sin PLUS ni de62DA. Comprobar revisión, kit y contenido de la unidad local; la lista no certifica montaje físico ni holgura."
  },
  {
    "id": "market-speedlogic-54811",
    "source": "https://webapi3.adata.com/storage/downloadfile/xpg_maestro_plus_62da_datasheet-2.pdf",
    "sockets": "Intel LGA1851 / LGA1700 / LGA1200 / LGA115x · AMD AM5 / AM4 / AM3",
    "scope": "Montajes publicados en Applications, página3 de la ficha oficial MAESTRO PLUS62DA negro; Ordering Information, página4, identifica PN75261752 / MAESTROPLUS62DA-BKCWW. Intel LGA1851/1700/1200/115x y AMD AM5/AM4/AM3. No se trasladan de MAESTRO62DA sin PLUS ni de42SA. Comprobar revisión, kit y contenido de la unidad local; la lista no certifica montaje físico ni holgura."
  },
  {
    "id": "market-clones-99531",
    "source": "https://thermaltake.com/products/astria-200-argb-lighting-cpu-cooler-white",
    "sockets": "Intel LGA2066 / LGA2011 / LGA1851 / LGA1700 / LGA1200 / LGA1156 / LGA1155 / LGA1151 / LGA1150 · AMD AM5 / AM4",
    "scope": "Montajes de Product Specifications para ASTRIA200 ARGB White, PN CL-P137-AL12SW-A, corroborados por Universal Socket Compatibility de la misma ficha exacta. Intel LGA2066/2011/1851/1700/1200/1156/1155/1151/1150 y AMD AM5/AM4. No se heredan de la referencia negra CL-P119. Comprobar revisión, kit y contenido de la unidad local; la lista no certifica montaje físico ni holgura."
  }
];
  for (const { id, source, sockets, scope } of rows) {
    const old = review[id] || {};
    review[id] = {
      ...old,
      values: { ...old.values, sockets },
      fieldSources: { ...old.fieldSources, sockets: { source, checkedAt: '2026-11-04', scope } },
      additionalSources: [ ...(old.additionalSources || []), { source, label: 'Fabricante: montajes publicados para modelo/PN exacto' } ],
      scope: [old.scope, scope].filter(Boolean).join(' ')
    };
  }
})();

// MSI's metric dimensions agree with the rounded inch values printed alongside them.
(() => {
  const review = window.FENIXA_SPEC_REVIEW;
  const boards = [
    ['model-board-mpg-b550-gaming-carbon-wifi', '304 × 244 mm', 'https://download-2.msi.com/archive/mnu_exe/mb/E7C90v1.2.pdf#page=18'],
    ['model-board-mpg-x570-gaming-edge-wifi', '304 × 243 mm', 'https://download.msi.com/archive/mnu_exe/mb/M7C37v1.0-FSC.pdf']
  ];
  for (const [id, dimensions, manual] of boards) {
    const old = review[id];
    const unpublished = { ...old.unpublished };
    delete unpublished.dimensions;
    const scope = 'Dimensiones nominales del PCB según la tabla métrica y el manual de MSI. Redondeadas a décimas de pulgada, equivalen a 12,0 × 9,6 pulgadas. Comprueba la revisión, la BIOS y la lista de memoria compatible de la unidad.';
    review[id] = {
      ...old,
      values: { ...old.values, dimensions },
      fieldSources: { ...old.fieldSources, dimensions: { source: manual, checkedAt: '2026-11-06', scope } },
      unpublished,
      scope
    };
  }
})();

// Antec prints these ranges in dB. The comparison axis requires dBA.
(() => {
  const review = window.FENIXA_SPEC_REVIEW;
  const range120 = 'Antec indica 10,8–32 dB para el ventilador de 120 mm. La ponderación A queda por confirmar.';
  const range360 = 'Antec indica 19,7–32,8 dB para el conjunto de 360 mm. La ponderación A queda por confirmar.';
  review['market-speedlogic-54245'] = {
    scope: range120,
    unpublished: { noise: range120 }
  };
  review['market-speedlogic-54247'] = {
    values: { connection: 'Ventilador: PWM de 4 pines a 12 V · iluminación: ARGB de 3 pines a 5 V · conjunto completo' },
    fieldSources: {
      connection: {
        source: 'https://www.antec.com/product/cooling/infinity-matrix-360-argb',
        checkedAt: '2026-11-06',
        scope: 'Tabla de conectores y tensión nominal del conjunto estándar de flujo normal.'
      }
    },
    scope: range360,
    unpublished: { noise: range360 }
  };
})();

// Speed Logic SKU 14244 pairs a 115 V listing with a 200–240 V model label.
window.FENIXA_SPEC_REVIEW['market-speedlogic-37899'] = {
  source: 'https://speedlogic.com.co/tienda/fuentes/fuente-antec-g850w-80p-gold-115v-semi-modular/',
  checkedAt: '2026-11-06',
  identityConflict: true,
  values: {},
  warning: 'La tienda anuncia 115 V. La etiqueta de la foto indica 200–240 V. Antes de comprar, pide una foto de la etiqueta de la unidad que recibirás y comprueba que admita el voltaje de tu red.',
  scope: 'Antec G850, SKU de tienda 14244. La foto identifica la revisión V7000A309A-23. Falta identificar la revisión de la unidad a la venta.',
  additionalSources: [{
    source: 'https://speedlogic.com.co/wp-content/uploads/2025/02/14244_5.png',
    label: 'Etiqueta de entrada eléctrica en la galería de la tienda'
  }]
};

// The retailer's other CX650 listing has no confirmed part number.
(() => {
  const sheet = 'https://static.compupuebla.com/product_images/FuentedePoderCORSAIRCP9020278NA_CP9020278NA/FuentedePoderCORSAIRCP9020278NA_CP9020278NA.pdf#page=3';
  const diagram = 'https://assets.corsair.com/image/upload/v1698783477/akamai/pdp/psu/cx-2023/cx650/Panel4_image.png';
  const scope = 'La tabla de dimensiones del producto incluye la referencia CP-9020278-NA. El diagrama de Corsair identifica el fondo y el alto. Reserva espacio adicional para los cables.';
  window.FENIXA_SPEC_REVIEW['power-corsair-cx650-cp-9020278-na'] = {
    values: { dimensions: '125 × 150 × 86 mm (fondo × ancho × alto)' },
    fieldSources: { dimensions: { source: sheet, checkedAt: '2026-11-06', scope } },
    additionalSources: [{ source: diagram, label: 'Diagrama de medidas de Corsair' }],
    scope
  };
})();

(()=>{const review=window.FENIXA_SPEC_REVIEW ||= {}; const rows=[
  {
    "id": "market-speedlogic-43224",
    "source": "https://www.xpg.com/nz/xpg/pc-component-hurricane-mag?tab=spec",
    "checkedAt": "2026-11-05",
    "displayName": "XPG HURRICANE MAG · negro · modo estándar",
    "values": {
      "format": "120 × 120 × 25 mm por ventilador · kit de 4 · modo estándar",
      "connection": "4 pines PWM y ARGB 3 pines / 5 V · enlace magnético y controladora",
      "rpm": 2000,
      "airflow": 54.82,
      "pressure": 2.74
    },
    "scope": "HURRICANE MAG 120, kit de cuatro según tienda y anuncio oficial XPG que incluye negro y blanco. No HURRICANE 120 sin MAG. Cifras de UN ventilador en modo estándar: 2000 RPM máximas, 54,82 CFM (±10 %) y 2,74 mm H₂O. El modo inverso tiene 49,27 CFM (±10 %) y 3,29 mm H₂O: no se mezclan los mejores extremos de ambos modos ni se suma el caudal de cuatro ventiladores. La dirección se cambia con la controladora; confirmar PN, revisión, conectores y accesorios locales. El ruido publicado es promedio, no máximo; ese campo queda desconocido. Caudal libre y presión máxima no se alcanzan necesariamente al mismo tiempo ni prueban temperaturas dentro del gabinete.",
    "replacesScope": true,
    "unpublished": {
      "noise": "XPG declara ruido promedio por modo; no publica un máximo comparable."
    },
    "additionalSources": [
      {
        "source": "https://www.xpg.com/lk/news/1181",
        "label": "XPG: HURRICANE MAG en kits de cuatro, negro y blanco"
      }
    ]
  },
  {
    "id": "market-speedlogic-43225",
    "source": "https://www.xpg.com/nz/xpg/pc-component-hurricane-mag?tab=spec",
    "checkedAt": "2026-11-05",
    "displayName": "XPG HURRICANE MAG · blanco · modo estándar",
    "values": {
      "format": "120 × 120 × 25 mm por ventilador · kit de 4 · modo estándar",
      "connection": "4 pines PWM y ARGB 3 pines / 5 V · enlace magnético y controladora",
      "rpm": 2000,
      "airflow": 54.82,
      "pressure": 2.74
    },
    "scope": "HURRICANE MAG 120, kit de cuatro según tienda y anuncio oficial XPG que incluye negro y blanco. No HURRICANE 120 sin MAG. Cifras de UN ventilador en modo estándar: 2000 RPM máximas, 54,82 CFM (±10 %) y 2,74 mm H₂O. El modo inverso tiene 49,27 CFM (±10 %) y 3,29 mm H₂O: no se mezclan los mejores extremos de ambos modos ni se suma el caudal de cuatro ventiladores. La dirección se cambia con la controladora; confirmar PN, revisión, conectores y accesorios locales. El ruido publicado es promedio, no máximo; ese campo queda desconocido. Caudal libre y presión máxima no se alcanzan necesariamente al mismo tiempo ni prueban temperaturas dentro del gabinete.",
    "replacesScope": true,
    "unpublished": {
      "noise": "XPG declara ruido promedio por modo; no publica un máximo comparable."
    },
    "additionalSources": [
      {
        "source": "https://www.xpg.com/lk/news/1181",
        "label": "XPG: HURRICANE MAG en kits de cuatro, negro y blanco"
      }
    ]
  },
  {
    "id": "market-clones-108454",
    "source": "https://webapi3.adata.com/storage/downloadfile/datasheet_xpg_spectrix_s65g_pcie_gen4_x4_m2_ssd_20250818.pdf",
    "checkedAt": "2026-11-05",
    "values": {
      "read": 6000,
      "write": 5000
    },
    "replacesScope": true,
    "scope": "SPECTRIX S65G de 2000 GB. Tabla Performance de la ficha oficial, página 2: hasta 6000 MB/s de lectura secuencial y 5000 MB/s de escritura para 2000 GB, con 640 TBW ya documentados. No son máximos extrapolados de la familia ni rendimiento sostenido medido. Prueba del fabricante con CrystalDiskMark 8.0.4, plataforma PCIe 4.0 publicada; hardware, software y capacidad afectan el resultado. Confirmar PN y revisión local; no se atribuye stock, precio, compatibilidad PS5 completa ni rendimiento de 1 TB/500 GB.",
    "additionalSources": [
      {
        "source": "https://webapi3.adata.com/storage/downloadfile/datasheet_xpg_spectrix_s65g_pcie_gen4_x4_m2_ssd_20250818.pdf",
        "label": "XPG: tabla de rendimiento por capacidad, página 2"
      }
    ]
  }
]; for(const row of rows){const {id,...entry}=row,old=review[id]||{}; const unpublished={...old.unpublished,...entry.unpublished}; for(const key of Object.keys(entry.values))delete unpublished[key]; review[id]={...old,...entry,values:{...old.values,...entry.values},unpublished,fieldSources:{...old.fieldSources,...Object.fromEntries(Object.keys(entry.values).map(key=>[key,{source:entry.source,checkedAt:entry.checkedAt,scope:entry.scope}]))},additionalSources:[...(old.additionalSources||[]),...(entry.additionalSources||[])]};}})();
