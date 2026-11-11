// Reemplazos puntuales con imagen del modelo exacto y procedencia documentada.
// No se usan las ilustraciones genéricas de categorías como foto de un producto.
(function () {
  const market = window.FENIXA_MARKET_DATA;
  const images = {
    'market-speedlogic-54286': 'lenovo-legion-k310-family-official.png',
    'market-ryzen-9600x': 'market-ryzen-9600x-reviewed-outline.png',
    'market-speedlogic-31655': 'market-speedlogic-31655-reviewed-outline.png',
    'market-ryzen-5800xt': 'market-ryzen-5800xt-reviewed-outline.png',
    'market-ryzen-9950x3d': 'market-ryzen-9950x3d-reviewed-outline.png',
    'market-speedlogic-33536': 'market-speedlogic-33536-reviewed-outline.png',
    'market-speedlogic-33550': 'market-speedlogic-33550-reviewed-outline.png',
    'market-speedlogic-37899': 'market-speedlogic-37899-reviewed-outline.png',
    'market-clones-90789': 'market-clones-90789-reviewed-outline.png',
    'market-clones-90791': 'market-clones-90791-reviewed-outline.png',
    'market-speedlogic-12736': 'market-speedlogic-12736-reviewed-outline.png',
    'market-speedlogic-45349': 'market-speedlogic-45349-reviewed-outline.png',
    'market-speedlogic-46077': 'market-speedlogic-46077-reviewed-outline.png',
    'market-speedlogic-54279': 'market-speedlogic-54279-reviewed-outline.png',
    'market-clones-84096': 'market-clones-84096-reviewed-outline.png',
    'market-speedlogic-28636': 'market-speedlogic-28636-reviewed-outline.png',
    'market-clones-104185': 'market-clones-104185-reviewed-outline.png',
    'market-clones-99476': 'market-clones-99476-reviewed-outline.png',
    'market-clones-105860': 'market-clones-105860-reviewed-outline.png',
    'market-speedlogic-51124': 'market-speedlogic-51124-reviewed-outline.png',
    'market-speedlogic-54245': 'market-speedlogic-54245-reviewed-outline.png',
    'market-speedlogic-54246': 'market-speedlogic-54246-reviewed-outline.png',
    'market-speedlogic-54247': 'market-speedlogic-54247-reviewed-outline.png',
    'market-speedlogic-51122': 'market-speedlogic-51122-reviewed-outline.png',
    'market-speedlogic-48953': 'market-speedlogic-48953-reviewed-outline.png',
    'market-clones-95498': 'market-clones-95498-reviewed-outline.png',
    'market-speedlogic-51795': 'market-speedlogic-51795-reviewed-outline.png',
    'market-speedlogic-49182': 'market-speedlogic-49182-reviewed-outline.png',
    'market-speedlogic-49212': 'market-speedlogic-49212-reviewed-outline.png',
    'market-clones-107000': 'market-clones-107000-reviewed-outline.png',
    'market-clones-100471': 'market-clones-100471-reviewed-outline.png',
    'market-clones-94762': 'market-clones-94762-reviewed-outline.png',
    'market-ryzen-9850x3d': 'market-ryzen-9850x3d-reviewed-outline.png',
    'market-clones-105846': 'market-clones-105846-reviewed-cutout.png',
    'market-clones-55872': 'market-clones-55872-reviewed-cutout.png',
    'market-clones-45743': 'market-clones-45743-reviewed-cutout.png',
    'market-clones-108233': 'market-clones-108233-reviewed-cutout.png',
    'market-speedlogic-49455': 'market-speedlogic-49455-reviewed-cutout.png',
    'market-speedlogic-48894': 'antec-vision-120-argb-3pack-official.png',
    'market-clones-108404': 'gigabyte-rtx5060ti-aero-oc-8g-official.webp',
    'market-clones-107075': 'adata-su650-512gb-official.png',
    'market-speedlogic-53751': 'kingston-dual-portable-1tb-official.png',
    'market-speedlogic-30438': 'msi-rtx3050-lp-6g-oc-official.webp',
    'market-clones-105945': 'lian-li-sx1000p-white-official.webp',
    'market-speedlogic-51841': 'asus-prime750b-black-official.png',
    'market-clones-105409': 'trust-evocx-24722-official.png',
    'market-clones-105705': 'trust-acira-24882-official.png',
    'market-clones-104001': 'trust-callaz-24404-official.png',
    'market-xpg-probe-700': 'xpg-probe-700-family-official.png',
    'market-speedlogic-45467': 'gigabyte-rtx5060-windforce-oc-official.webp',
    'market-speedlogic-44497': 'msi-rtx5050-8g-shadow-2x-oc-official.webp',
    'market-clones-105807': 'msi-rtx5060ti-8g-shadow-2x-oc-plus-official.webp',
    'market-clones-102936': 'msi-rtx5060-8g-shadow-2x-oc-official.webp',
    'market-speedlogic-45453': 'msi-rtx5050-ventus-2x-oc-official.png',
    'market-clones-105801': 'msi-rtx5050-ventus-2x-oc-official.png',
    'market-clones-106748': 'thermaltake-view170-empty-black-official.png',
    'market-clones-106764': 'thermaltake-view170-empty-snow-official.png',
    'market-clones-105620': 'cougar-forza50-argb-official.png',
    'market-clones-105653': 'cougar-airface-pure-rgb-official.webp',
    'market-speedlogic-54281': 'market-speedlogic-54281-reviewed-outline.png',
    'market-speedlogic-54280': 'market-speedlogic-54280-reviewed-outline.png',
    'market-speedlogic-2809': 'asus-prime-a520m-k-official.png',
    'market-speedlogic-24251': 'asus-prime-b550m-a-ac-official.png',
    'market-speedlogic-21944': 'asus-tuf-b550m-plus-wifi-ii-official.png',
    'market-speedlogic-26903': 'asus-tuf-a620m-plus-wifi-official.png',
    'market-speedlogic-37410': 'asus-prime-b840m-a-wifi-official.png',
    'market-speedlogic-5469': 'xpg-vento-120-black-official.png',
    'market-clones-91851': 'thermaltake-astria-200-black-official.png',
    'market-clones-99531': 'thermaltake-astria-200-white-official.png',
    'market-clones-108954': 'palit-rtx5070-white-oc-official.png',
    'market-clones-86614': 'asrock-h610m-hdv-board-official.png',
    'market-clones-108032': 'asrock-x870-challenger-wifi-white-board-official.png',
    'market-clones-103341': 'asrock-b850i-lightning-wifi-board-official.png',
    'market-clones-99621': 'asrock-b860m-pro-a-wifi-board-official.png',
    'market-clones-108049': 'asrock-b550-phantom-gaming-4-ac-board-official.png',
    'market-clones-86621': 'asrock-h610m-hdv-m2plus-d5-board-official.png',
    'market-speedlogic-52717': 'corsair-480t-rgb-airflow-black-official.webp',
    'market-speedlogic-48619': 'asus-prime-b850m-k-official.png',
    'market-speedlogic-46922': 'asus-dual-rtx5050-oc-official.png',
    'market-xpg-probe-600': 'xpg-probe-600-official.png',
    'market-speedlogic-43321': 'xpg-valor-air-plus-4fan-black-angle-official.png',
    'market-clones-105157': 'xpg-valor-air-plus-4fan-black-angle-official.png',
    'market-clones-101429': 'xpg-valor-air-plus-4fan-white-angle-official.png',
    'market-speedlogic-39904': 'xpg-vento-r-120-argb-black-official.png',
    'market-speedlogic-54809': 'xpg-vento-r-120-argb-white-official.png',
    'market-speedlogic-42527': 'xpg-spectrix-d35g-black-official.png',
    'market-clones-108365': 'xpg-spectrix-d35g-black-official.png',
    'market-speedlogic-55507': 'xpg-lancer-blade-rgb-black-official.png',
    'market-speedlogic-55867': 'arctic-36-s-standard.png',
    'market-speedlogic-55873': 'arctic-36-s-black.png',
    'market-speedlogic-55878': 'arctic-36-s-rgb-black.png',
    'market-speedlogic-55890': 'arctic-36-s-rgb-white.png',
    'market-speedlogic-40913': 'arctic-36-rgb-black.png',
    'market-speedlogic-40936': 'arctic-36-rgb-white.png',
    'market-clones-102486': 'xpg-valor-air-pro-white-official.avif',
    'market-clones-108454': 'xpg-spectrix-s65g-official.png',
    'market-clones-108700': 'xpg-mars-970-plus-official.avif',
    'market-clones-108719': 'xpg-mars-970-plus-official.avif',
    'market-clones-108723': 'xpg-gammix-s70-blade-official.png',
    'market-speedlogic-54243': 'xpg-maestro-plus-42sa-official.avif',
    'market-speedlogic-54811': 'xpg-maestro-plus-62da-official.avif',
    'market-speedlogic-50846': 'antec-ax27-rgb-elite-front-official.png',
    'market-speedlogic-46067': 'antec-ax65-argb-front-official.png',
    'market-speedlogic-48822': 'antec-ax67-argb-front-official.png',
    'market-speedlogic-45792': 'antec-csk-650-bronze-official.png',
    'market-speedlogic-56045': 'gigabyte-rtx-5050-windforce-oc-v2-official.png',
    'market-clones-108975': 'gigabyte-rtx-5060-aero-oc-official.png',
    'market-speedlogic-48384': 'gigabyte-rtx-5060-eagle-max-oc-official.png',
    'market-speedlogic-50001': 'gigabyte-b550m-ds3h-ac-r2-official.png'
  };
  for (const product of market?.products || []) {
    if (images[product.id]) product.image = `assets/market/${images[product.id]}`;
    if(['market-speedlogic-54281','market-speedlogic-54280'].includes(product.id))product.imageNote='Fotografía oficial Antec del modelo y potencia mostrados en su etiqueta. Sombra exterior extraída mediante contorno local, sin IA, cambios RGB ni aumento del alfa original; resolución, carcasa, rejilla y textos preservados. Archivo oficial y foto anterior conservados para reversión. No certifica stock, revisión ni garantía local.';
    if(product.id==='market-speedlogic-54286')product.imageNote='Fotografía oficial transparente de Lenovo Legion K310, publicada en soporte ACC500332; archivo intacto 600×240. Vista de familia con teclado US English: confirma layout, part number y revisión del ejemplar local; la fila regional no acredita el SKU de la tienda. Original anterior con marca de agua preservada sin alteraciones; sin extracción, IA ni retoques.';
    if(product.id==="market-ryzen-9600x")product.imageNote="Foto original de tienda con fondo exterior extraído mediante contorno local, sin IA ni cambios RGB, original preservada. Texto, logos, conexiones y blancos físicos conservados; las esquinas transparentes previas no eliminaban el lienzo blanco interior. Imagen ilustrativa: confirma referencia/presentación local.";
    if(product.id==="market-speedlogic-31655")product.imageNote="Foto original de tienda con fondo exterior extraído mediante contorno local, sin IA ni cambios RGB, original preservada. Texto, logos, conexiones y blancos físicos conservados; las esquinas transparentes previas no eliminaban el lienzo blanco interior. Imagen ilustrativa: confirma referencia/presentación local.";
    if(product.id==="market-ryzen-5800xt")product.imageNote="Foto original de tienda con fondo exterior extraído mediante contorno local, sin IA ni cambios RGB, original preservada. Texto, logos, conexiones y blancos físicos conservados; las esquinas transparentes previas no eliminaban el lienzo blanco interior. Imagen ilustrativa: confirma referencia/presentación local.";
    if(product.id==="market-ryzen-9950x3d")product.imageNote="Foto original de tienda con fondo exterior extraído mediante contorno local, sin IA ni cambios RGB, original preservada. Texto, logos, conexiones y blancos físicos conservados; las esquinas transparentes previas no eliminaban el lienzo blanco interior. Imagen ilustrativa: confirma referencia/presentación local.";
    if(product.id==="market-speedlogic-33536")product.imageNote="Foto original de tienda con fondo externo extraído mediante contorno local, sin IA ni cambios RGB. Panel, patas, logos y piezas blancas físicas preservados, original guardada. La imagen puede mostrar piezas ilustrativas: no prueba un PC montado de esta propuesta ni contenido/variante exacta de la caja vendida.";
    if(product.id==="market-speedlogic-33550")product.imageNote="Foto original de tienda con fondo externo extraído mediante contorno local, sin IA ni cambios RGB. Panel, patas, logos y piezas blancas físicas preservados, original guardada. La imagen puede mostrar piezas ilustrativas: no prueba un PC montado de esta propuesta ni contenido/variante exacta de la caja vendida.";
    if(product.id==="market-speedlogic-37899")product.imageNote="Foto original de tienda con fondo exterior extraído mediante contorno local, sin IA ni cambios RGB, original preservada. Texto, logos, conexiones y blancos físicos conservados; las esquinas transparentes previas no eliminaban el lienzo blanco interior. Imagen ilustrativa: confirma referencia/presentación local.";
    if(product.id==="market-clones-90789")product.imageNote="Foto original de tienda con fondo exterior y hueco vacío del colgador extraídos localmente, sin IA ni cambios RGB; original guardada. Carátula, etiqueta, contactos y logos preservados. La discrepancia entre empaque/título y módulo suelto sigue SIN resolver: no certifica capacidad/tasa/SKU ni habilita cifras o compatibilidad confirmada.";
    if(product.id==="market-clones-90791")product.imageNote="Foto original de tienda con fondo exterior y hueco vacío del colgador extraídos localmente, sin IA ni cambios RGB; original guardada. Carátula, etiqueta, contactos y logos preservados. La discrepancia entre empaque/título y módulo suelto sigue SIN resolver: no certifica capacidad/tasa/SKU ni habilita cifras o compatibilidad confirmada.";
    if(product.id==="market-speedlogic-12736")product.imageNote="Foto original de tienda K512W con lienzo exterior extraído localmente, sin IA ni cambios RGB. Teclas/carcasa blancas físicas, cable, texto, logos y marcas superpuestas preservados; original guardada. Confirma layout local, no se certifica desde la fotografía.";
    if(product.id==="market-speedlogic-45349")product.imageNote="Foto original de tienda con fondo exterior extraído mediante contorno local, sin IA ni cambios RGB, original preservada. Texto, logos, conexiones y blancos físicos conservados. Imagen ilustrativa: confirma referencia/presentación local.";
    if(product.id==="market-speedlogic-46077")product.imageNote="Foto original de tienda con fondo externo extraído mediante contorno local, sin IA ni cambios RGB. Panel, patas, logos y piezas blancas físicas preservados, original guardada. La imagen puede mostrar piezas ilustrativas: no prueba un PC montado de esta propuesta ni contenido/variante exacta de la caja vendida.";
    if(product.id==="market-speedlogic-54279")product.imageNote="Foto original de tienda con fondo externo extraído mediante contorno local, sin IA ni cambios RGB. Panel, patas, logos y piezas blancas físicas preservados, original guardada. La imagen puede mostrar piezas ilustrativas: no prueba un PC montado de esta propuesta ni contenido/variante exacta de la caja vendida.";
    if(product.id==="market-clones-84096")product.imageNote="Foto original de tienda NH-U12S redux con lienzo y reflejo exterior extraídos mediante contornos locales, sin IA ni cambios RGB. Fan gris, aletas claras reales, tubos, resorte, base, cajas, letras y logos conservados; original guardada. No confundir reflejo del estudio con pieza física ni usar el empaque para certificar la revisión local.";
    if(product.id==="market-speedlogic-28636")product.imageNote="Foto original de tienda Poseidon Elite ARGB 240 blanca con fondo externo extraído localmente, sin IA ni cambios RGB. Radiador, ventiladores blancos, bomba completa, conexiones, RGB y logo conservados; candidato con bomba recortada rechazado. Original guardada; no reconstruir mangueras ausentes en esta vista.";
    if(product.id==="market-clones-104185")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Teclado blanco/rosado, carcasa, todas las teclas, texto y logo Redragon preservados. Candidato con franja blanca rechazado; versión corregida protege blancos físicos. Confirma layout/switches/SKU local.";
    if(product.id==="market-clones-99476")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Caja PYLON 750 y fuente conservadas, sin convertir su texto en PYLON II. Primer contorno con franja inferior rechazado. Confirma revisión II del título con la tienda.";
    if(product.id==="market-clones-105860")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Caja RB0750B/750W, fuente, cables, correas, rejilla y logos conservados. No sustituir por foto RB0650B. Primer contorno con franja inferior rechazado.";
    if(product.id==="market-speedlogic-51124")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Empaque BF700, texto, sellos y marca Antec flotante conservados. No cambiar el color del logo para hacerlo contrastar en oscuro.";
    if(product.id==="market-speedlogic-54245")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Infinity Matrix 120, caja, etiquetas, iluminación y Antec flotante preservados. Ilustración blanca impresa no se borra.";
    if(product.id==="market-speedlogic-54246")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Infinity Matrix 360 blanco, carcasa y aspas blancas físicas, caja y Antec flotante preservados. No transformarlo en tres unidades independientes.";
    if(product.id==="market-speedlogic-54247")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Infinity Matrix 360 negro, caja, iluminación, texto y Antec flotante conservados; no mezclar con variante blanca ni Infinity 120.";
    if(product.id==="market-speedlogic-51122")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. SSD, etiqueta, Patriot flotante y badge 500 GB conservados. Candidato que borraba letras del badge rechazado; badge entero protegido. Etiqueta dice P400, no V4: confirmar revisión anunciada por la tienda, no inferir cifras de la imagen.";
    if(product.id==="market-speedlogic-48953")product.imageNote="Imagen original de tienda con fondo exterior extraído localmente, sin IA ni cambios RGB; original guardada. Tres Orbit y caja originales preservados. Candidatos que cortaban aristas de ventiladores traseros rechazados; contorno corregido conserva tornillos, marcos y RGB.";
    if(product.id==='market-clones-95498')product.imageNote='Foto original de tienda con fondo exterior/sombra extraídos por contorno local y alfa, sin IA ni cambios RGB. Empaque, letras, logos y CPU metálica conservados; original guardada. Imagen ilustrativa: confirma el sufijo 8400F y presentación local, no identificados solo por esta caja.';
    if(['market-speedlogic-51795','market-speedlogic-49182','market-speedlogic-49212'].includes(product.id))product.imageNote='Fotografía original de tienda con lienzo exterior extraído localmente, sin IA ni cambios RGB. Etiquetas blancas físicas, logos, chips y contactos conservados, original guardada. Referencia/capacidad/tasa local requieren confirmar part number: la foto no certifica el SKU y no se usan cifras inferidas de ella.';
    if(product.id==='market-clones-107000')product.imageNote='Foto oficial Thermaltake GT Snow 850W, referencia USA PS-TPT-0850FNFAGU-W. Solo se extrajo el lienzo externo mediante contorno local, sin IA ni cambios RGB. Carcasa blanca, rejilla, conectores, logos y texto conservados; confirma part number y revisión local. Original oficial y foto anterior de tienda guardadas.';
    if(['market-clones-100471','market-clones-94762'].includes(product.id))product.imageNote='Fotografía original de tienda con lienzo/sombra exterior extraídos por contorno local, sin IA ni retoques RGB. Letras, logos y empaque conservados; original guardada para reversión. Foto ilustrativa: confirma el sufijo y la presentación del ejemplar, no identificados únicamente por esta caja.';
    if(product.id==='market-ryzen-9850x3d')product.imageNote='Foto original de tienda con fondo exterior y sombra extraídos por contorno local, sin IA ni cambios RGB. Se conservan los textos y el diseño blanco real del empaque. Caja ilustrativa Ryzen 7 X3D: confirma sufijo y presentación de la unidad, que no se identifican solo por la foto.';
    if(['market-clones-90789','market-clones-90791'].includes(product.id))product.imageNote='Foto original conservada por discrepancia: el módulo suelto muestra 16 GB DDR5 5200(42), aunque título/empaque anuncian otra tasa o capacidad. Confirma referencia y configuración con la tienda; no se certifica esta imagen como el SKU vendido.';
    if(['market-clones-105846','market-clones-55872','market-clones-45743','market-clones-108233','market-speedlogic-49455'].includes(product.id))product.imageNote='Foto original de tienda con fondo exterior extraído localmente, sin IA generativa, cambios de color ni reconstrucción. Etiquetas, logos y piezas conservados; original guardada para reversión. Confirma referencia, presentación y distribución de teclado con la tienda. No certifica stock ni una PC montada.';
    if(product.id==='market-speedlogic-48894')product.imageNote='Vista oficial transparente del kit Vision 120 ARGB de tres ventiladores estándar, no Vision 120R reverse. PNG intacto sin empaque; la etiqueta amarilla pertenece al archivo oficial. Confirma referencia, accesorios y presentación de la tienda.';
    if(product.id==='market-speedlogic-55734')product.imageNote='Identidad pendiente: el título anuncia DDR5, pero la caja de esta foto de tienda dice DDR4 GEN5. Original conservada; confirma modelo y memoria con la tienda antes de comprar. No se sustituye por una foto de otra variante.';
    if(product.id==='market-clones-108404')product.imageNote='Vista oficial transparente de GIGABYTE RTX 5060 Ti AERO OC 8G, referencia GV-N506TAERO OC-8GD; sin empaque ni retoques locales. La carcasa blanca es parte del producto, no el fondo. Confirma referencia, capacidad y revisión de la unidad vendida; no certifica stock ni garantía local.';
    if(product.id==='market-xpg-probe-700')product.imageNote='Vista oficial de la familia XPG PROBE Bronze; la carcasa no identifica por sí sola la potencia 700W. Confirma la etiqueta de la unidad.';
    if(product.id==='market-clones-105945')product.imageNote='Imagen oficial SX1000P blanca, sin empaque. Confirma referencia y revisión de la unidad vendida; no certifica stock ni garantía local.';
    if(product.id==='market-speedlogic-53751')product.imageNote='Foto oficial Kingston SPSD/1TB transparente, sin empaque; resolución nativa 150×50 conservada. Confirma referencia y capacidad de la unidad vendida. No certifica stock ni garantía local.';
    if(product.id==='market-clones-107075')product.imageNote='Imagen oficial ADATA SU650 de 512 GB con empaque, transparente y sin retoques. La parte blanca de la etiqueta pertenece al producto. Confirma revisión y capacidad de la unidad vendida; no certifica stock ni garantía local.';
    if(['market-clones-104001','market-clones-105409','market-clones-105705'].includes(product.id))product.imageNote='Foto oficial del teclado con distribución US. Confirma layout y código regional de la unidad de tienda.';
  }
})();
