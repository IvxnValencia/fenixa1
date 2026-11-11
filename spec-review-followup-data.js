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

// The shop's title and description disagree about what is included.
window.FENIXA_SPEC_REVIEW['market-speedlogic-54246'] = {
  source: 'https://speedlogic.com.co/tienda/refrigeraciones/ventiladores/ventiladores-3en1-antec-infinity-matrix-blanco-360-argb/',
  checkedAt: '2026-11-11',
  identityConflict: true,
  values: {},
  warning: 'La tienda anuncia ventiladores, pero su descripción también menciona refrigeración líquida y radiador. Confirma con la tienda qué incluye y el número de parte antes de comprar.',
  scope: 'SKU de tienda 26139. El título y la tabla describen un conjunto de ventiladores blancos; la descripción también afirma que incluye refrigeración líquida y radiador. Se requiere confirmar el producto y su presentación.'
};

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

// Lote Claude 11/11/2026: RAM con PN exacto cotejado en ficha oficial y refrigeración CPU condicional ya documentada por AMD.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const put = (id, extra, values, source, scope, checkedAt = '2026-11-11', label) => {
    const old = review[id] || {};
    review[id] = {
      ...old, ...extra, source: extra.source || old.source || source, checkedAt,
      values: { ...old.values, ...values },
      fieldSources: { ...old.fieldSources, ...Object.fromEntries(Object.keys(values).map(key => [key, { source, checkedAt, scope }])) },
      additionalSources: [ ...(old.additionalSources || []), { source, label } ],
      scope: [old.scope, scope].filter(Boolean).join(' ')
    };
  };

  const crucial = 'https://www.crucial.com/memory/ddr5/ct16g48c40s5';
  put('market-speedlogic-51795', { displayName: 'Crucial CT16G48C40S5 · referencia publicada', modelKey: 'CT16G48C40S5', source: crucial },
    { capacity: 16, memory: 'DDR5', rate: 4800, defaultRate: 4800, cl: 40, modules: 1, format: 'SO-DIMM · sin búfer', voltage: 1.1, profiles: 'Solo JEDEC predeterminado · 40-39-39' },
    crucial,
    'PN CT16G48C40S5 anunciado por la tienda y cotejado con la ficha oficial Crucial (Technology DDR5, Module Type SODIMM, Density 16GB, Kit Quantity 1, Voltage 1.1V, Unbuffered, Speed DDR5-4800, CAS 40, perfil Default (JEDEC) 40-39-39, garantía limitada de por vida). La ficha no publica perfil XMP/EXPO: la tasa predeterminada coincide con la nominal. Confirmar PN y revisión de la unidad local; la foto no certifica SKU. Sin precio, stock ni compatibilidad con un portátil concreto atribuidos.',
    '2026-11-11', 'Ficha oficial Crucial CT16G48C40S5 · leída en navegador 11/11/2026');

  const lexar = 'https://www.lexar.com/global/products/Lexar-DDR5-SODIMM-Laptop-Memory/';
  put('market-speedlogic-51796', { displayName: 'Lexar LD5S16G56C46ST-BGS · referencia publicada', modelKey: 'LD5S16G56C46ST-BGS', source: lexar },
    { capacity: 16, memory: 'DDR5', rate: 5600, defaultRate: 5600, cl: 46, modules: 1, format: 'SO-DIMM · 262 pines', voltage: 1.1, profiles: 'JEDEC JESD79-5A · sin perfil XMP/EXPO publicado' },
    lexar,
    'PN LD5S16G56C46ST-BGS legible en el empaque fotografiado por la tienda (UPC 843367132454) y listado por Lexar Global como 5600/16GB; el kit LD5S16G56C46ST-BGD (16GBx2) es otra referencia. Lexar publica interfaz 262 PIN, DDR5, estándar JESD79-5A, CL46-45-45-90 a 5600MT/s, 1,1V, módulo 69,6 × 30 × 1,2 mm y garantía limitada de por vida (10 años donde no se reconoce). No publica perfil de overclock: 5600MT/s se registra como tasa JEDEC del módulo; la plataforma puede limitarla. Velocidad según pruebas internas del fabricante. Sin precio, stock ni compatibilidad con un portátil concreto atribuidos.',
    '2026-11-11', 'Ficha oficial Lexar Global y tabla Product Numbers · 11/11/2026');

  const evidence = 'Evidencia AMD registrada el 03/11/2026 en Datos/cpu-thermal-presentations-20261103.json; implementada como referencia condicional, no como contenido garantizado de la caja local.';
  const cpu = (id, model, text, note) => {
    const source = `https://www.amd.com/en/products/processors/desktops/ryzen/${model}.html`;
    put(id, {}, { thermal: text }, source, note + ' ' + evidence, '2026-11-11', 'Refrigeración publicada por AMD · condicional');
  };
  cpu('cpu-amd-ryzen-9-7900', '7000-series/amd-ryzen-9-7900', 'Caja actualizada sin disipador desde 01/08/2025 (antes Wraith Prism) · confirmar PN y contenido local',
    'AMD anota en Product ID Boxed (100-100000590WOF/WOZ) que las cajas seleccionadas dejan de incluir el disipador SR4 desde el 1 de agosto de 2025. Unidades anteriores pueden traer Wraith Prism; la oferta local no identifica su revisión.');
  cpu('market-ryzen-5800xt', '5000-series/amd-ryzen-7-5800xt', 'Caja actualizada sin disipador desde 01/08/2025 (antes Wraith Prism) · confirmar PN y contenido local',
    'AMD anota en Product ID Boxed (100-100001582WOF/WOZ) el retiro del disipador SR4 de cajas seleccionadas desde el 1 de agosto de 2025. Unidades anteriores pueden traer Wraith Prism; la oferta local no identifica su revisión.');
  cpu('cpu-amd-ryzen-7-7700', '7000-series/amd-ryzen-7-7700', 'Variable según caja: AMD cita Wraith Prism, Wraith Stealth y cajas sin disipador desde 01/08/2025 · confirmar contenido local',
    'Las fuentes AMD no coinciden: la introducción nombra Wraith Prism, la tabla general de refrigeración cita Wraith Stealth y la nota de Product ID (100-100000592SBX/WOZ) describe cajas actualizadas sin disipador. Se muestra el conflicto en lugar de elegir un disipador.');
  put('model-cpu-amd-ryzen-7-5700x', {}, { thermal: 'Sin disipador incluido según la ficha individual AMD · la tabla general cita Wraith Stealth; confirmar contenido local' },
    'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-7-5700x.html',
    'La sección Specifications del 5700X publica Thermal Solution (PIB) «Not Included» y la nota de Product ID describe cajas sin disipador; la tabla general de AMD lo lista con Wraith Stealth. Se conserva la discrepancia en el texto. ' + evidence,
    '2026-11-11', 'Refrigeración publicada por AMD · condicional');
})();

// Lote Claude 2 · 11/11/2026: fuentes Corsair por revisión identificada, SSD Crucial E100 por capacidad, Kingston KCP556US8-16 y Trust GXT 836 ES por EAN.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const day = '2026-11-11';
  const put = (id, extra, values, source, scope, label, extraSources = []) => {
    const old = review[id] || {};
    review[id] = {
      ...old, ...extra, source: extra.source || old.source || source, checkedAt: day,
      values: { ...old.values, ...values },
      fieldSources: { ...old.fieldSources, ...Object.fromEntries(Object.keys(values).map(key => [key, { source, checkedAt: day, scope }])) },
      additionalSources: [ ...(old.additionalSources || []), { source, label }, ...extraSources ],
      scope: [old.scope, scope].filter(Boolean).join(' ')
    };
  };
  const rme = (id, pn, watts, pcie) => {
    const source = 'https://www.corsair.com/us/en/p/psu/' + pn.toLowerCase() + '/rme-series-rm' + watts + 'e-fully-modular-low-noise-atx-power-supply-' + pn.toLowerCase();
    put(id, { displayName: 'Corsair RM' + watts + 'e ATX 3.1 (2025) · revisión por título', modelKey: pn }, {
      watts, format: 'ATX 3.1 · totalmente modular · cables Type 4', length: 140, dimensions: '140 × 150 × 86 mm',
      efficiency: 'Cybenetics Gold',
      connectors: '1 × ATX 24 · 2 × EPS 4+4 · 1 × 12V-2x6 12+4 · adaptador 12V-2x6 a 2 × PCIe 6+2 · ' + pcie + ' × PCIe 6+2 independientes · 6 × SATA · 2 × PATA',
      protections: 'OVP / UVP / OCP / OTP / SCP / OPP', warrantyYears: 7,
      warranty: '7 años según la ficha Corsair del SKU -NA; garantía colombiana, canal y comprobante por confirmar.'
    }, source,
      'El título de la tienda (RM' + watts + 'e «PCI 5.1», modular, Gold) identifica la revisión RMe 2025 ATX 3.1 con 12V-2x6; la RMe 2023 (ATX 3.0, 12VHPWR) queda descartada. La tienda no publica el sufijo regional: los valores son los de la ficha Corsair ' + pn + ', cuyas variantes regionales difieren en el cable de CA. No se intercambian cables modulares. Fondo del cuerpo sin margen de cables. Sin precio, stock ni ensayo eléctrico.',
      'Ficha Corsair ' + pn + ' · revisión 2025 por título de tienda');
  };
  rme('market-speedlogic-38732', 'CP-9020296-NA', 850, 1);
  rme('market-speedlogic-25304', 'CP-9020297-NA', 1000, 2);

  const cx = 'https://www.corsair.com/us/en/p/psu/cp-9020278-na/cx-series-cx650-650-watt-80-plus-bronze-atx-power-supply-cp-9020278-na';
  put('market-speedlogic-38728', { displayName: 'Corsair CX650 (diseño 2023) · referencia por imagen oficial', modelKey: 'CP-9020278-NA' }, {
    watts: 650, format: 'ATX12V 2.31 · no modular', length: 125, dimensions: '125 × 150 × 86 mm (fondo × ancho × alto)',
    efficiency: '80 PLUS Bronze', connectors: '1 × ATX 24 · 1 × EPS 4+4 · 2 × PCIe 6+2 · 3 × SATA · 2 × PATA',
    warrantyYears: 5, warranty: '5 años según la ficha Corsair del SKU -NA; garantía colombiana, canal y comprobante por confirmar.'
  }, cx,
    'Las imágenes de la tienda (14245, 14245_1 y 14245_2) coinciden con las renders oficiales de Corsair «base-cx-series-2023-config/CX650» publicadas en la ficha CP-9020278-NA; se descarta el CX650 2017. El sufijo regional no se publica. Las protecciones siguen pendientes porque la ficha Corsair del PN no las enumera y el manual CX-M 2025 es otro modelo. Fondo del cuerpo sin margen de cables. Sin precio, stock ni ensayo eléctrico.',
    'Ficha e imágenes Corsair CP-9020278-NA · 11/11/2026');

  const e100 = (id, pn, capacity, read, write, tbw, storeNote) => {
    const source = 'https://www.crucial.com/ssd/e100/' + pn.toLowerCase();
    put(id, { displayName: 'Crucial E100 ' + (capacity >= 1000 ? '1 TB' : capacity + ' GB') + ' · ' + pn, modelKey: pn }, {
      capacity, placement: 'Interno', format: 'M.2 2280', pcie: 'PCIe 4.0 ×4 · NVMe', read, write, tbw
    }, source,
      'Serie E100 y capacidad identificadas por la tienda; Crucial publica un único SKU E100 para esa capacidad (' + pn + '). Valores de la sección Specifications oficial: interfaz NVMe PCIe Gen 4 x4, M.2 2280, lectura secuencial ' + read + ' MB/s, escritura ' + write + ' MB/s, ' + tbw + ' TBW y garantía limitada de 3 años. ' + storeNote + ' Lectura y escritura son máximos secuenciales, no velocidad sostenida. Sin precio ni stock nuevos.',
      'Ficha oficial Crucial ' + pn + ' · leída en navegador 11/11/2026');
  };
  e100('market-speedlogic-54711', 'CT480E100SSD8', 480, 4700, 2500, 60, 'El título de la tienda anuncia 5000 × 4500, que corresponde a la versión de 1 TB; prevalece la ficha oficial de 480 GB. El empaque fotografiado (13258_5) muestra 480GB.');
  e100('market-speedlogic-39322', 'CT1000E100SSD8', 1000, 5000, 4500, 80, 'El título de la tienda anuncia 5000 × 3000; prevalece la ficha oficial (4500 MB/s de escritura). La foto 13232 es una render genérica de la serie.');

  const kingston = 'https://www.kingston.com/en/memory/search?partid=KCP556US8-16';
  put('market-speedlogic-49212', {}, { modules: 1, defaultRate: 5600, profiles: 'JEDEC estándar · sin perfil XMP/EXPO publicado' }, kingston,
    'La búsqueda oficial Kingston del 11/11 describe KCP556US8-16 como un único «16GB DDR5 5600MT/s Non-ECC Unbuffered DIMM CL46 1RX8 1.1V 288-pin»; el PN no lleva sufijo de kit (K2). Es memoria de especificación de sistema sin perfil de overclock publicado, por lo que 5600 MT/s se registra como tasa estándar del módulo. La plataforma puede limitarla.',
    'Búsqueda de parte Kingston KCP556US8-16 · 11/11/2026');

  const trust = 'https://www.trust.com/en/product/24722-gxt-836-evocx-illuminated-gaming-keyboard-us';
  put('market-clones-105409', { displayName: 'Trust GXT 836 Evocx ES · 24998', modelKey: '24998' }, {
    format: 'Membrana · tamaño completo con teclado numérico y reposamuñecas', connection: 'Cableada · USB-A', width: 454, height: 35, weight: 798
  }, trust,
    'La tienda publica EAN 8713439249989, que Trust asigna a GXT 836 Evocx Illuminated Gaming Keyboard ES (artículo 24998) en la lista de versiones de la ficha oficial; la URL ES redirige a la ficha US 24722, de la que se toman los valores comunes. Trust rotula «Depth» 454 mm y «Width» 193 mm: en un teclado completo el lado largo es el ancho, por eso width = 454 mm y 193 mm es el fondo; 35 mm es la altura. Peso total 798 g. No se usa el conteo de 114 teclas, que corresponde a la distribución US. Garantía publicada de 2 años, no garantía local confirmada. Sin precio ni stock nuevos.',
    'Ficha oficial Trust GXT 836 · EAN ES 8713439249989',
    [{ source: 'https://clonesyperifericos.com/comprar/teclado-trust-evocx/', label: 'EAN 8713439249989 publicado por la tienda' }]);
})();

// Lote Claude 3 · 11/11/2026: ejes de teclado resueltos por plausibilidad física de la misma tabla oficial.
(() => {
  'use strict';
  const review = window.FENIXA_SPEC_REVIEW ||= {};
  const day = '2026-11-11';
  const axes = (id, values, scope) => {
    const old = review[id] || {}, unpublished = { ...(old.unpublished || {}) };
    for (const key of Object.keys(values)) delete unpublished[key];
    const source = old.fieldSources?.format?.source || old.source;
    review[id] = {
      ...old, unpublished,
      values: { ...old.values, ...values },
      fieldSources: { ...old.fieldSources, ...Object.fromEntries(Object.keys(values).map(key => [key, { source, checkedAt: day, scope }])) },
      scope: [old.scope, scope].filter(Boolean).join(' ')
    };
  };
  axes('market-speedlogic-3952', { height: 23.5 },
    'Altura asignada el 11/11/2026 desde la misma ficha Logitech 920-007119: Width 354,3 mm, Height 139,9 mm y Depth 23,5 mm. Un teclado con touchpad de 354 mm no puede medir 139,9 mm de alto apoyado en la mesa, así que 23,5 mm es el grosor vertical y 139,9 mm el fondo. Es la altura del cuerpo publicada, no la altura con patas ni la ergonomía.');
  axes('market-clones-104185', { width: 297, height: 35 },
    'Ejes asignados el 11/11/2026 desde la misma tabla oficial Redragon (29,7 × 10,6 × 3,5 cm) para el K616 de 61 teclas: el lado de 297 mm es el ancho, 106 mm el fondo y 35 mm la altura. Un teclado 60% no puede tener 106 mm de ancho ni 297 mm de alto. Altura publicada con teclas según la tabla; las patas pueden modificarla.');
})();
