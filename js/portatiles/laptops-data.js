// Exact regional configurations and model families from manufacturer specs. No SKU-specific COP offers verified.
window.FENIXA_LAPTOPS = [
  {
    id:'lenovo-legion-83m00002us', name:'Lenovo Legion 5 Gen 10 AMD', model:'83M00002US · 15AHP10', uses:['gaming','creativo'],
    referenceKind:'Configuración US documentada',
    image:'assets/laptops/lenovo-legion-83m00002us.png',
    source:'https://www.lenovo.com/us/en/p/laptops/legion-laptops/legion-series/lenovo-legion-5-gen-10-15-inch-amd/83m00002us', checkedAt:'2026-10-01', region:'Estados Unidos · 83M00002US',
    reason:'Referencia con RAM ampliable y GPU dedicada para juegos y creación. Su configuración US permite comparar piezas concretas, sin asumir una oferta colombiana.',
    specs:[['Procesador','AMD Ryzen 7 260 · 8 núcleos / 16 hilos'],['Gráficos','GeForce RTX 5060 Laptop · 8 GB GDDR7; 115 W publicados, incluidos 15 W de boost'],['Pantalla','15,1 pulgadas OLED · 2560 × 1600 · 165 Hz, no táctil'],['Memoria y almacenamiento','16 GB DDR5-5600; dos ranuras SO-DIMM. SSD de 1 TB M.2 2242 PCIe 4.0']],
    limits:['83M00002US identifica la configuración estadounidense; no sustituirla por otro sufijo sin revisar todas sus piezas.','La imagen oficial de la familia no garantiza teclado o unidad regional. Precio, stock y garantía en Colombia están pendientes.','La potencia publicada no es una medición de rendimiento: no atribuimos FPS ni resultados de una GPU de escritorio.','Confirma módulos instalados, ranuras ocupadas y requisitos de ampliación en la ficha PSREF vigente y en la configuración exacta.']
  },
  {
    id:'asus-zenbook-ux3405ma', name:'ASUS Zenbook 14 OLED', model:'UX3405MA', uses:['estudio','trabajo'],
    image:'assets/laptops/asus-zenbook-ux3405ma.png',
    source:'https://www.asus.com/us/laptops/for-home/zenbook/asus-zenbook-14-ux3405/techspec/', checkedAt:'2026-09-30', region:'Estados Unidos',
    reason:'Una opción de referencia para clases, documentos y trabajo móvil. Elige la RAM de fábrica pensando en tus programas.',
    specs:[['Procesador','Intel Core Ultra 5 125H, 7 155H o 9 185H, según SKU'],['Pantalla','14 pulgadas OLED; resolución y refresco varían'],['Memoria','16 o 32 GB LPDDR5X integrada, según SKU'],['Gráficos','Intel Arc; requiere la configuración de memoria indicada por ASUS']],
    limits:['La RAM va integrada: no asumir que podrás ampliarla después.','Confirma CPU, memoria, pantalla, teclado y garantía de la unidad vendida en Colombia.','No atribuimos autonomía ni rendimiento medidos; una GPU integrada no equivale a una dedicada.']
  },
  {
    id:'asus-tuf-fa507nv', name:'ASUS TUF Gaming A15', model:'FA507NV', uses:['gaming','creativo'],
    image:'assets/laptops/asus-tuf-fa507nv.png',
    source:'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2023/techspec/', checkedAt:'2026-09-30', region:'Ficha global',
    reason:'Modelo de referencia con gráfica dedicada para explorar gaming y programas con aceleración por GPU.',
    specs:[['Procesador','AMD Ryzen 7 7735HS o Ryzen 5 7535HS, según SKU'],['Gráficos','GeForce RTX 4060 Laptop GPU · 8 GB'],['Pantalla','15,6 pulgadas; panel FHD/WQHD según configuración'],['Memoria','DDR5-4800 SO-DIMM; capacidad de fábrica según SKU']],
    limits:['RTX 4060 Laptop no es una RTX 4060 de escritorio; no asumir el mismo rendimiento.','Confirma potencia configurada, cantidad de módulos, pantalla y SSD de la unidad exacta.','Los FPS dependen del juego, ajustes, potencia y refrigeración; no se han medido aquí.']
  },
  {
    id:'asus-proart-h7606wv', name:'ASUS ProArt P16', model:'H7606WV', uses:['creativo','trabajo'],
    image:'assets/laptops/asus-proart-h7606wv.png',
    source:'https://www.asus.com/ca-en/laptops/for-creators/proart/proart-p16-h7606/techspec/', checkedAt:'2026-09-30', region:'Canadá',
    reason:'Referencia para creación con pantalla OLED y GPU dedicada. Revisa los requisitos de tus programas y el tamaño de tus proyectos.',
    specs:[['Procesador','AMD Ryzen AI 9 HX 370'],['Gráficos','GeForce RTX 4060 Laptop GPU · 8 GB'],['Pantalla','16 pulgadas OLED táctil; confirma panel del SKU'],['Memoria y SSD','LPDDR5X integrada y SSD NVMe; capacidad según SKU']],
    limits:['La memoria integrada limita la ampliación futura; confirma su capacidad antes de elegir.','8 GB de VRAM pueden limitar escenas o proyectos grandes.','La ficha consultada es de Canadá: disponibilidad, teclado, configuración y garantía en Colombia están pendientes.']
  },
  {
    id:'msi-modern-15-h-ai-c2hmg', name:'MSI Modern 15 H AI', model:'C2HMG', uses:['estudio','trabajo'],
    image:'assets/laptops/msi-modern-15-h-ai-c2hmg.webp',
    source:'https://www.msi.com/Business-Productivity/Modern-15-H-AI-C2HMX/Specification', checkedAt:'2026-10-01', region:'Ficha global',
    reason:'Referencia para clases y trabajo con RAM en dos ranuras, a diferencia de los modelos con memoria integrada. Confirma la capacidad que incluye la unidad.',
    specs:[['Procesador','Intel Core Ultra serie 200H; CPU exacta según SKU'],['Gráficos','Integrados; hasta Intel Arc según configuración'],['Pantalla','15,6 pulgadas FHD (1920 × 1080), IPS-Level'],['RAM y SSD','DDR5-5600, dos ranuras; un M.2 NVMe PCIe 4.0. Capacidad de fábrica según SKU']],
    limits:['La ficha global describe una familia, no una oferta colombiana ni un SKU exacto.','Confirma CPU, módulos de RAM, SSD, teclado, batería y garantía del equipo vendido.','Los gráficos integrados no equivalen a una GPU dedicada. No se han medido autonomía ni rendimiento.']
  },
  {
    id:'msi-thin-15-b13ve', name:'MSI Thin 15', model:'B13VE', uses:['gaming','creativo'],
    image:'assets/laptops/msi-thin-15-b13ve.webp',
    source:'https://latam.msi.com/Laptop/Thin-15-B13VX/Specification', checkedAt:'2026-10-01', region:'Latinoamérica; incluye variantes CO',
    reason:'Alternativa con RTX 4050 Laptop para juegos y programas con aceleración por GPU. Compara sus límites de potencia y memoria, no solo el nombre RTX.',
    specs:[['Procesador','Core i5-13420H o i7-13620H, según variante B13VE'],['Gráficos','RTX 4050 Laptop GPU, 6 GB; máximo publicado 45 W con Dynamic Boost, según escenario'],['Pantalla','15,6 pulgadas FHD (1920 × 1080), 144 Hz, IPS-Level'],['RAM y SSD','Variantes LATAM consultadas: 16 GB (2 × 8 GB) DDR4-3200 y SSD NVMe de 512 GB; confirma SKU']],
    limits:['B13VE es una familia: el sufijo completo determina CPU, sistema operativo y variante regional.','No asumir el rendimiento de otra RTX 4050 Laptop con distinta potencia o refrigeración; no publicamos FPS.','6 GB de VRAM pueden limitar proyectos o texturas. La ficha regional no confirma precio, stock ni garantía local.']
  },
  {
    id:'acer-aspire-go-ag15-31p-372g', name:'Acer Aspire Go 15', model:'AG15-31P-372G · NX.KRPAL.005', uses:['estudio','trabajo'],
    referenceKind:'Configuración México documentada',
    image:'assets/laptops/acer-aspire-go-ag15-31p-372g.png',
    source:'https://www.acer.com/mx-es/laptops/aspire/aspire-go-intel/pdp/NX.KRPAL.005', checkedAt:'2026-10-01', region:'México · NX.KRPAL.005',
    reason:'Referencia para documentos, clases y ofimática básica sin GPU dedicada. Permite contrastar una configuración sencilla con las alternativas de gaming y creación, sin afirmar precio o rendimiento medido.',
    specs:[['Procesador','Intel Core i3-N305 · 8 núcleos'],['Gráficos','Intel UHD integrados · memoria compartida'],['Pantalla','15,6 pulgadas LCD TN mate · 1920 × 1080 · 60 Hz'],['Memoria y almacenamiento','8 GB LPDDR5 de referencia; SSD M.2 PCIe NVMe de 512 GB']],
    limits:['AG15-31P-372G / NX.KRPAL.005 identifica la configuración mexicana, no una oferta colombiana: precio, stock, teclado y garantía local pendientes.','La ficha exacta dice TN, no IPS; no confundir este panel con otros Aspire Go ni asumir calidad de color para creación profesional.','Los 8 GB son la memoria de esta referencia. El máximo de 16 GB que anuncia la ficha no demuestra que esta unidad admita ampliación: confirma el diseño y la RAM de fábrica.','Gráficos integrados con memoria compartida: no se representan como 0 GB de VRAM ni se promete gaming exigente, autonomía medida o velocidad real.','La fotografía oficial ilustra el chasis AG15-31P; no certifica el teclado o la unidad regional.']
  }
];
