// Verified case configurations. No retailer or color aliases count as additional models.
window.FENIXA_GOAL30_CASE_ROWS = [
  {
    "name": "Antec VCX100M RGB ELITE",
    "sku": "Antec VCX100M RGB ELITE",
    "modelKey": "antec-vcx100m-rgb-elite",
    "existingIds": [
      "market-speedlogic-49455"
    ],
    "source": "https://antec.com/documents/product/case-VCX100M_RGB_Elite_Flyer_EN%20_250212.pdf",
    "checkedAt": "2026-10-19",
    "scope": "VCX100M RGB ELITE, UPC 0-761345-10190-5. Tabla del PDF oficial comprobada visualmente en memoria: dimensiones DWH 300 × 195 × 390 mm; GPU ≤275 mm, torre ≤160 mm, PSU ≤160 mm incluidos cables. Cinco RGB fijos: dos superiores, dos reverse sobre PSU y uno trasero; no confundir con modelo ARGB. No se guardaron imágenes ni se heredaron datos de otra revisión.",
    "values": {
      "gpuMax": 275,
      "coolerMax": 160,
      "width": 195,
      "height": 390,
      "depth": 300,
      "boardForms": [
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 160,
      "format": "micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec VCX100M ARGB",
    "sku": "Antec VCX100M ARGB",
    "modelKey": "antec-vcx100m-argb",
    "existingIds": [
      "market-speedlogic-54279"
    ],
    "source": "https://antec.com/documents/product/case-VCX100M%20ARGB_Flyer_EN%20_250620.pdf",
    "checkedAt": "2026-10-19",
    "scope": "VCX100M ARGB, UPC 0-761345-10223-0. Tabla del PDF oficial cotejada visualmente en memoria de forma independiente del RGB ELITE. Dimensiones DWH 300 × 195 × 390 mm; GPU ≤275 mm, torre ≤160 mm y PSU ≤160 mm incluidos cables. Cinco ARGB: dos superiores, dos reverse sobre PSU y uno trasero. Modelo oficial distinto del RGB ELITE, no una variante de color inventada.",
    "values": {
      "gpuMax": 275,
      "coolerMax": 160,
      "width": 195,
      "height": 390,
      "depth": 300,
      "boardForms": [
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 160,
      "format": "micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "XPG INVADER",
    "sku": "XPG INVADER",
    "modelKey": "xpg-invader",
    "existingIds": [
      "market-speedlogic-971"
    ],
    "source": "https://webapi3.adata.com/storage/downloadfile/%E3%83%87%E3%83%BC%E3%82%BF%E3%82%B7%E3%83%BC%E3%83%88xpg_invader_pc%E3%82%B1%E3%83%BC%E3%82%B9.pdf",
    "checkedAt": "2026-10-19",
    "scope": "INVADER original; hoja japonesa oficial de dos páginas, tabla de especificaciones en página 2. H × W × D 470 × 206 × 482 mm. GPU nominal de esa ficha 400 mm, torre 170 mm y PSU 225 mm. No INVADER X, X BTF ni MINI; no importar sus límites de 270/430 mm. Ventiladores VENTO 120 frontal/trasero y controlador de iluminación ARGB: no convertirlos en ventiladores ARGB por el título local. Color local no identificado, por eso se conserva identidad de fabricante sin PN de color. El máximo nominal no certifica espacio con radiador lateral/frontal; la ficha no cuantifica esa reducción.",
    "values": {
      "gpuMax": 400,
      "coolerMax": 170,
      "width": 206,
      "height": 470,
      "depth": 482,
      "boardForms": [
        "mini-itx",
        "micro-atx",
        "atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 225,
      "format": "mini-itx / micro-atx / atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec FLUX",
    "sku": "Antec FLUX",
    "modelKey": "antec-flux",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/flux",
    "checkedAt": "2026-10-19",
    "scope": "FLUX negro original, cinco ventiladores PWM; no FLUX PRO, SE ni REAR. Dimensiones DWH. E-ATX hasta 330 mm. PSU máximo incluye cables y conserva HDD. GPU nominal 408 mm; no constituye límite para cualquier conjunto de radiador y ventiladores.",
    "values": {
      "gpuMax": 408,
      "coolerMax": 180,
      "width": 239,
      "height": 502,
      "depth": 484,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 235,
      "format": "e-atx / atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec FLUX PRO",
    "sku": "Antec FLUX PRO",
    "modelKey": "antec-flux-pro",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/flux-pro",
    "checkedAt": "2026-10-19",
    "scope": "FLUX PRO negro estándar; no Noctua Edition, DIGITAL ni FLUX base. Dimensiones DWH. E-ATX hasta 285 mm. PSU: 180/300 mm con HDD, 470 mm sin HDD (incluyen cables); lateral 180 mm sin cables. psuMax toma 180 mm con HDD, sin afirmar que las otras posiciones equivalgan. GPU nominal 455 mm.",
    "values": {
      "gpuMax": 455,
      "coolerMax": 190,
      "width": 245,
      "height": 545,
      "depth": 530,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 180,
      "format": "e-atx / atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec C8",
    "sku": "Antec C8",
    "modelKey": "antec-c8",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/c8",
    "checkedAt": "2026-10-19",
    "scope": "C8 negro estándar, no C8 ARGB, CURVE ni WOOD. Dimensiones DWH. E-ATX hasta 280 mm. PSU 210 mm expresamente sin cables; reservar su espacio por separado. GPU nominal 440 mm y altura de torre 175 mm; no se trasladan accesorios de otras versiones.",
    "values": {
      "gpuMax": 440,
      "coolerMax": 175,
      "width": 303,
      "height": 476,
      "depth": 464,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 210,
      "format": "e-atx / atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec P20C",
    "sku": "Antec P20C",
    "modelKey": "antec-p20c",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/p20c",
    "checkedAt": "2026-10-19",
    "scope": "P20C negro estándar con panel lateral de vidrio; no P20CE ni P20C ARGB. Dimensiones DWH. E-ATX figura en lista completa del fabricante sin inventar límite de anchura. PSU incluye cables: 205 mm con HDD, 410 mm sin HDD; se registra 205. GPU nominal 375 mm.",
    "values": {
      "gpuMax": 375,
      "coolerMax": 170,
      "width": 220,
      "height": 490,
      "depth": 469,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 205,
      "format": "e-atx / atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Thermaltake Ceres 500 TG ARGB",
    "sku": "CA-1X5-00M1WN-00",
    "modelKey": "thermaltake-ceres-500-tg-argb",
    "existingIds": [],
    "source": "https://thermaltake.com/products/ceres-500-tg-argb-mid-tower-chassis",
    "checkedAt": "2026-10-19",
    "scope": "Ceres 500 TG ARGB negro, SKU exacto. Dimensiones H × W × D. GPU: referencia conservadora 395 mm con radiador; 425 mm sin radiador, ambos límites publicados expresamente. El fabricante no da aquí un grosor universal de radiador: confirmar conjunto. E-ATX de 12 × 13 pulgadas. PSU nominal 220 mm.",
    "values": {
      "gpuMax": 395,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 425,
      "coolerMax": 185,
      "width": 245,
      "height": 525,
      "depth": 507.7,
      "boardForms": [
        "mini-itx",
        "micro-atx",
        "atx",
        "e-atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 220,
      "format": "mini-itx / micro-atx / atx / e-atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Thermaltake The Tower 300",
    "sku": "CA-1Y4-00S1WN-00",
    "modelKey": "thermaltake-the-tower-300",
    "existingIds": [],
    "source": "https://thermaltake.com/products/the-tower-300-micro-tower-chassis",
    "checkedAt": "2026-10-19",
    "scope": "The Tower 300 negro estándar, no Tower 200/250/500. Dimensiones H × W × D para orientación vertical, no con soporte horizontal opcional. GPU conservadora 280 mm con cubierta de fuente y hasta 400 mm solo al retirarla. Torre de CPU 210 mm y PSU 220 mm. Micro-ATX/Mini-ITX; sin ATX.",
    "values": {
      "gpuMax": 280,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 400,
      "coolerMax": 210,
      "width": 342,
      "height": 551,
      "depth": 281,
      "boardForms": [
        "mini-itx",
        "micro-atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 220,
      "format": "mini-itx / micro-atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Thermaltake Core V21",
    "sku": "CA-1D5-00S1WN-00",
    "modelKey": "thermaltake-core-v21",
    "existingIds": [],
    "source": "https://thermaltake.com/products/core-v21",
    "checkedAt": "2026-10-19",
    "scope": "Core V21 exacto, una unidad de chasis sin apilar. Dimensiones H × W × D en orientación de ficha, no volumen de varias unidades. GPU de hasta 350 mm; el texto de compatibilidad describe tarjeta de doble ranura, no garantiza cualquier espesor. PSU 200 mm con ventilador inferior instalado. No se infiere límite superior sin ese ventilador.",
    "values": {
      "gpuMax": 350,
      "coolerMax": 185,
      "width": 320,
      "height": 336,
      "depth": 424,
      "boardForms": [
        "mini-itx",
        "micro-atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 200,
      "format": "mini-itx / micro-atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "CORSAIR 4000D AIRFLOW",
    "sku": "CC-9011200-WW",
    "modelKey": "corsair-4000d-airflow",
    "existingIds": [
      "case-corsair-4000d-airflow-black",
      "case-corsair-4000d-airflow-white"
    ],
    "source": "https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-black-cc-9011200-ww",
    "checkedAt": "2026-10-19",
    "scope": "4000D AIRFLOW original, negro/blanco agrupados como un modelo; SKU corresponde al negro. No iCUE RGB, QL ni FRAME. E-ATX limitado a 305 × 277 mm. Longitud GPU nominal de ficha, no una garantía de espacio con cualquier radiador frontal.",
    "values": {
      "gpuMax": 360,
      "coolerMax": 170,
      "width": 230,
      "height": 466,
      "depth": 453,
      "boardForms": [
        "mini-itx",
        "micro-atx",
        "atx",
        "e-atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 220,
      "format": "mini-itx / micro-atx / atx / e-atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "XPG VALOR AIR PLUS",
    "sku": "XPG VALOR AIR PLUS",
    "modelKey": "xpg-valor-air-plus",
    "existingIds": [
      "market-speedlogic-43321",
      "market-clones-105157",
      "market-clones-101429"
    ],
    "source": "https://www.xpg.com/zw/xpg/pc-components-valor-air-plus?tab=spec",
    "checkedAt": "2026-10-19",
    "scope": "VALOR AIR PLUS exacto; negro/blanco y distintas tiendas agrupados. Dimensiones H × W × D. GPU 340 mm con ventiladores preinstalados; no extender a radiador frontal. Las variantes MTA/MTN difieren en ventiladores: no se afirma contenido local ni PN sin verificar.",
    "values": {
      "gpuMax": 340,
      "coolerMax": 160,
      "width": 200,
      "height": 482,
      "depth": 400,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 170,
      "format": "atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec AX20 Extreme",
    "sku": "Antec AX20 Extreme",
    "modelKey": "antec-ax20-extreme",
    "existingIds": [
      "market-speedlogic-46077"
    ],
    "source": "https://www.antec.com/product/case/ax20",
    "checkedAt": "2026-10-19",
    "scope": "AX20 Extreme identificado en ficha común por cinco ventiladores RGB fijos y UPC 0-761345-10198-1. No AX20 base/Elite. Dimensiones DWH. PSU 170 mm con HDD, 295 mm retirándolo; psuMax conserva 170 mm. GPU nominal 270 mm, sin inferir otras holguras.",
    "values": {
      "gpuMax": 270,
      "coolerMax": 155,
      "width": 207,
      "height": 451,
      "depth": 358,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 170,
      "format": "atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec AX27 RGB ELITE",
    "sku": "Antec AX27 RGB ELITE",
    "modelKey": "antec-ax27-rgb-elite",
    "existingIds": [
      "market-speedlogic-50846"
    ],
    "source": "https://www.antec.com/product/case/ax27-rgb-elite",
    "checkedAt": "2026-10-19",
    "scope": "AX27 RGB ELITE, cuatro FRGB; no AX20. Dimensiones DWH. GPU conservadora 270 mm con ventilador detrás del soporte frontal; 295 mm con ventilador delante, según las posiciones que distingue Antec. No son límites universales con radiadores. PSU incluye cables: 170 mm con HDD, 295 mm sin HDD; se registra 170.",
    "values": {
      "gpuMax": 270,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 295,
      "coolerMax": 155,
      "width": 207,
      "height": 451,
      "depth": 345,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 170,
      "format": "atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec AX61 ELITE",
    "sku": "Antec AX61 ELITE",
    "modelKey": "antec-ax61-elite",
    "existingIds": [
      "market-speedlogic-28962"
    ],
    "source": "https://www.antec.com/product/case/ax61",
    "checkedAt": "2026-10-19",
    "scope": "AX61 ELITE exacto, cuatro ARGB. Dimensiones DWH. GPU nominal 320 mm; comprobar reducción por refrigeración frontal. PSU incluye cables: 165 mm con bahía HDD y 345 mm sin ella; referencia conservadora 165 mm.",
    "values": {
      "gpuMax": 320,
      "coolerMax": 160,
      "width": 200,
      "height": 449,
      "depth": 405,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 165,
      "format": "atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec CX200M RGB ELITE",
    "sku": "Antec CX200M RGB ELITE",
    "modelKey": "antec-cx200m-rgb-elite",
    "existingIds": [
      "market-speedlogic-33536",
      "market-speedlogic-33550"
    ],
    "source": "https://www.antec.com/product/case/cx200m-rgb-elite",
    "checkedAt": "2026-10-19",
    "scope": "CX200M RGB ELITE, cinco RGB fijos; blanco/negro cuentan una sola vez. No CX200M ARGB de tres ventiladores ni BASIC. Dimensiones DWH. PSU 185 mm incluye cables. Los valores son límites publicados del chasis, no una validación de montaje completo.",
    "values": {
      "gpuMax": 330,
      "coolerMax": 164,
      "width": 210,
      "height": 392,
      "depth": 350,
      "boardForms": [
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 185,
      "format": "micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec AX65 ARGB",
    "sku": "Antec AX65 ARGB",
    "modelKey": "antec-ax65-argb",
    "existingIds": [
      "market-speedlogic-46067"
    ],
    "source": "https://www.antec.com/product/case/ax65-argb",
    "checkedAt": "2026-10-19",
    "scope": "AX65 ARGB exacto; cuatro ARGB. Dimensiones DWH. GPU conservadora 290 mm con radiador frontal de 360 mm; 320 mm con ventilador detrás y 345 mm con ventilador delante del soporte, según términos de Antec. gpuMaxUpper no aplica con cualquier radiador. PSU incluye cables: 165 mm con HDD, 205 mm moviéndolo a la izquierda, 345 mm sin HDD; se registra 165.",
    "values": {
      "gpuMax": 290,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 345,
      "coolerMax": 160,
      "width": 200,
      "height": 449,
      "depth": 400,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 165,
      "format": "atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Antec AX67 ARGB",
    "sku": "Antec AX67 ARGB",
    "modelKey": "antec-ax67-argb",
    "existingIds": [
      "market-speedlogic-48822"
    ],
    "source": "https://www.antec.com/product/case/ax67-argb",
    "checkedAt": "2026-10-19",
    "scope": "AX67 ARGB exacto, frontal geométrico propio; no confundir con AX65. Dimensiones DWH. GPU conservadora 290 mm con radiador frontal de 360 mm; 320 mm con ventilador detrás y 345 mm con ventilador delante del soporte según Antec. PSU incluye cables: 165 mm con HDD, 205 mm HDD a la izquierda y 345 mm sin HDD; se registra 165.",
    "values": {
      "gpuMax": 290,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 345,
      "coolerMax": 160,
      "width": 200,
      "height": 449,
      "depth": 405,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 165,
      "format": "atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "CORSAIR 480T RGB AIRFLOW",
    "sku": "CC-9011272-WW",
    "modelKey": "corsair-480t-rgb-airflow",
    "existingIds": [
      "market-speedlogic-52717"
    ],
    "source": "https://www.corsair.com/ca/en/p/pc-cases/cc-9011272-ww/480t-rgb-airflow-tempered-glass-mid-tower-case-cc-9011272-ww",
    "checkedAt": "2026-10-19",
    "scope": "480T RGB AIRFLOW negro, tres AR120 RGB, SKU exacto CC-9011272-WW; no 480T sin RGB ni 470T mostrado en una ilustración. Ejes oficiales Case Width/Height/Length. E-ATX hasta 305 × 277 mm. GPU nominal 400 mm; el espacio de radiadores y cables exige comprobar montaje.",
    "values": {
      "gpuMax": 400,
      "coolerMax": 165,
      "width": 214,
      "height": 446,
      "depth": 476,
      "boardForms": [
        "mini-itx",
        "micro-atx",
        "atx",
        "e-atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 220,
      "format": "mini-itx / micro-atx / atx / e-atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "COUGAR Airface Pure RGB",
    "sku": "COUGAR Airface Pure RGB",
    "modelKey": "cougar-airface-pure-rgb",
    "existingIds": [
      "market-clones-105653"
    ],
    "source": "https://cougargaming.com/de/products/cases/airface-pure-rgb/",
    "checkedAt": "2026-10-19",
    "scope": "Airface Pure RGB exacto, no Airface RGB ni ECO. Página oficial agrupa negro/blanco; el registro local no identifica color y se usa nombre de fabricante sin asignarle PN de color. Dimensiones W × H × D. Refrigeración: elegir radiador frontal O superior; límite de RAM 43 mm con radiador superior. GPU nominal 320 mm; PSU máximo publicado 160 mm.",
    "values": {
      "gpuMax": 320,
      "coolerMax": 175,
      "width": 220,
      "height": 460,
      "depth": 375,
      "boardForms": [
        "mini-itx",
        "micro-atx",
        "atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 160,
      "format": "mini-itx / micro-atx / atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "Thermaltake View 170 TG ARGB",
    "sku": "CA-1Z4-00M1WN-00",
    "modelKey": "thermaltake-view-170-tg-argb",
    "existingIds": [
      "market-clones-106748",
      "market-clones-106764"
    ],
    "source": "https://thermaltake.com/products/view-170-tg-argb-micro-chassis",
    "checkedAt": "2026-10-19",
    "scope": "View 170 TG ARGB micro, tres ARGB Lite; negro/Snow agrupados. SKU de la ficha corresponde al negro. Dimensiones H × W × D. No admite ATX. GPU nominal 340 mm y PSU 180 mm; no extrapolar a View 270 u otras revisiones.",
    "values": {
      "gpuMax": 340,
      "coolerMax": 160,
      "width": 212,
      "height": 438,
      "depth": 377.5,
      "boardForms": [
        "mini-itx",
        "micro-atx"
      ],
      "boardFormsComplete": true,
      "psuMax": 180,
      "format": "mini-itx / micro-atx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "name": "XPG VALOR AIR PRO",
    "sku": "XPG VALOR AIR PRO",
    "modelKey": "xpg-valor-air-pro",
    "existingIds": [
      "market-clones-102486"
    ],
    "source": "https://www.xpg.com/in/xpg/pc-components-valor-air-pro?tab=spec",
    "checkedAt": "2026-10-19",
    "scope": "VALOR AIR PRO blanco del registro existente; ficha común negro/blanco, cuatro ARGB. No PLUS ni AIR original. Dimensiones H × W × D; GPU 400 mm y torre 167 mm publicados para este chasis. E-ATX figura expresamente; no se inventa ancho máximo. PSU 200 mm. El conjunto frontal de refrigeración requiere verificar holgura.",
    "values": {
      "gpuMax": 400,
      "coolerMax": 167,
      "width": 215,
      "height": 490,
      "depth": 467,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 200,
      "format": "e-atx / atx / micro-atx / mini-itx"
    },
    "imageScope": "none",
    "imageUrl": null,
    "category": "case"
  },
  {
    "category": "case",
    "name": "Antec NX410",
    "sku": "Antec NX410",
    "modelKey": "Antec NX410",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/nx410",
    "checkedAt": "2026-10-19",
    "scope": "NX410 negro, no otra NX. Tabla DWH normal; la web también muestra dimensiones distintas denominadas With handle: no se mezclan. Límite nominal GPU; radiador frontal requiere revisar reducción. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "ATX / micro-ATX / mini-ITX",
      "gpuMax": 335,
      "coolerMax": 168,
      "width": 210,
      "height": 485,
      "depth": 390,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 165
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Antec NX500M",
    "sku": "Antec NX500M",
    "modelKey": "Antec NX500M",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/nx500m",
    "checkedAt": "2026-10-19",
    "scope": "NX500M base con un ventilador trasero, no ARGB ni Elite. GPU 300 con ventilador frontal / 320 sin él; PSU 165 con HDD / 325 sin HDD. DWH de tabla; PSU conservadora. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "Micro-ATX / mini-ITX",
      "gpuMax": 300,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 320,
      "coolerMax": 155,
      "width": 200,
      "height": 451,
      "depth": 384,
      "boardForms": [
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 165
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Antec P101 SILENT",
    "sku": "Antec P101 SILENT",
    "modelKey": "Antec P101 SILENT",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/p101-silent",
    "checkedAt": "2026-10-19",
    "scope": "P101 SILENT exacto. GPU 270 con bandeja HDD / 450 retirándola, no 450 incondicional. Referencia DWH y límite PSU nominal; E-ATX exige revisar ancho de la placa. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "E-ATX / ATX / micro-ATX / mini-ITX",
      "gpuMax": 270,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 450,
      "coolerMax": 180,
      "width": 232,
      "height": 506,
      "depth": 527,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 290
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Antec P7 NEO",
    "sku": "Antec P7 NEO",
    "modelKey": "Antec P7 NEO",
    "existingIds": [],
    "source": "https://www.antec.com/product/case/p7-neo",
    "checkedAt": "2026-10-19",
    "scope": "P7 NEO, no P7 Silent. DWH de tabla, límites nominales; revisión del frontal/radiador pendiente. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "E-ATX / ATX / micro-ATX / mini-ITX",
      "gpuMax": 350,
      "coolerMax": 165,
      "width": 219,
      "height": 480,
      "depth": 440,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 170
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Fractal Design North TG Dark · Charcoal Black",
    "sku": "FD-C-NOR1C-02",
    "modelKey": "Fractal Design North TG Dark · Charcoal Black",
    "existingIds": [],
    "source": "https://assets.fractal-design.com/files/uxzbxy2o/production/23a01a08f4b1cecd7b3efda20f85d8dcee09d891.pdf",
    "checkedAt": "2026-10-19",
    "scope": "Columna North TG, no Mesh con soporte lateral. GPU 300 con radiador frontal 360 / 355 con ventilador frontal. Fuente 155 con dos bandejas HDD / 255 con una; se toma 155. Dimensiones LWH con pies/protuberancias, no cuerpo reducido. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "ATX / micro-ATX / mini-ITX",
      "gpuMax": 300,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 355,
      "coolerMax": 170,
      "width": 215,
      "height": 469,
      "depth": 447,
      "boardForms": [
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 155
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Fractal Design Terra Jade",
    "sku": "FD-C-TER1N-03",
    "modelKey": "Fractal Design Terra Jade",
    "existingIds": [],
    "source": "https://assets.fractal-design.com/files/uxzbxy2o/production/391efea65d814bee3d8774ce5cab5d10d8719c7c.pdf",
    "checkedAt": "2026-10-19",
    "scope": "Terra Jade, una identidad sin duplicar colores. Disipador 48 mm con posición de máximo grosor GPU; 77 mm solo desplazando la espina y reduciendo el grosor/altura admisible de GPU. Los máximos de las dos posiciones NO son simultáneos. Longitud GPU 322; grosor y altura siguen pendientes de contraste. Dimensiones con pies. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "Mini-ITX · PSU SFX / SFX-L",
      "gpuMax": 322,
      "coolerMax": 48,
      "coolerMaxConditional": true,
      "coolerMaxUpper": 77,
      "width": 153,
      "height": 218,
      "depth": 343,
      "boardForms": [
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 130
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Fractal Design Torrent RGB Black TG Light Tint",
    "sku": "FD-C-TOR1A-04",
    "modelKey": "Fractal Design Torrent RGB Black TG Light Tint",
    "existingIds": [],
    "source": "https://www.fractal-design.com/products/cases/torrent-series/torrent/torrent-rgb-black-tg-light-tint/",
    "checkedAt": "2026-10-19",
    "scope": "Torrent RGB de la página actual, no Compact o Nano. 461 es el máximo nominal de la tabla, no holgura certificada con cualquier conjunto frontal; comprobar ventiladores/radiador y manual de la unidad. Lista completa de formatos en el texto; SSI no se normaliza como ATX. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "E-ATX / ATX / micro-ATX / ITX / SSI-EEB / SSI-CEB",
      "gpuMax": 461,
      "coolerMax": 188,
      "width": 242,
      "height": 530,
      "depth": 544,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": false,
      "psuMax": 230
    },
    "imageScope": "none",
    "imageUrl": null
  },
  {
    "category": "case",
    "name": "Fractal Design Meshify 2 Black Light TG",
    "sku": "FD-C-MES2A-03",
    "modelKey": "Fractal Design Meshify 2 Black Light TG",
    "existingIds": [],
    "source": "https://assets.fractal-design.com/files/uxzbxy2o/production/1b5e72d86317371ecfa754c2f99957b7ae3ce173.pdf",
    "checkedAt": "2026-10-19",
    "scope": "Ficha PDF: GPU 315 en disposición almacenamiento; 467 con ventilador frontal en disposición abierta / 491 sin él. La página web actual muestra 470 sin detallar la disposición: discrepancia explícita, no promediar. Esta referencia usa la configuración de la hoja PDF; comprobar manual/revisión antes de comprar. E-ATX hasta 285 mm. Dimensiones externas en mm. Verificar montaje, cables y revisión; no certifica temperatura, compatibilidad completa, precio ni stock local.",
    "values": {
      "format": "E-ATX hasta 285 mm / ATX / micro-ATX / mini-ITX",
      "gpuMax": 315,
      "gpuMaxConditional": true,
      "gpuMaxUpper": 491,
      "coolerMax": 185,
      "width": 240,
      "height": 474,
      "depth": 542,
      "boardForms": [
        "e-atx",
        "atx",
        "micro-atx",
        "mini-itx"
      ],
      "boardFormsComplete": true,
      "psuMax": 250
    },
    "imageScope": "none",
    "imageUrl": null,
    "additionalSources": [
      {
        "source": "https://www.fractal-design.com/products/cases/meshify-series/meshify-2/meshify-2-black-light-tg/",
        "label": "Web actual · cifra 470 mm sin condiciones desglosadas"
      }
    ]
  }
];
window.FENIXA_GOAL30_DATA.push(...window.FENIXA_GOAL30_CASE_ROWS);
