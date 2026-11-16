// Modelos 3D genéricos y procedurales de componentes de PC.
//
// IMPORTANTE — fidelidad:
// · Son modelos GENÉRICOS. No reproducen ningún producto comercial.
// · Las medidas exteriores provienen de estándares públicos cuando existen
//   (formatos de placa ATX/micro-ATX/Mini-ITX, módulos DIMM, M.2 2280,
//   fuente ATX, ventilador de 120 mm). Cada definición cita su fuente en
//   `dimensionSource`.
// · La DISTRIBUCIÓN interna (dónde está el socket, las ranuras, los conectores)
//   es ilustrativa: cada fabricante la decide. La guía debe remitir al manual
//   de la placa concreta para posiciones exactas.
//
// Convenciones de ejes locales (mm):
// · Placa base: X = ancho, desde el borde trasero (E/S) hacia el frontal;
//   Y = alto, desde el borde inferior; Z = hacia fuera de la cara de componentes.
//   La superficie del PCB está en Z = 0.
// · Las piezas montadas en la placa usan ese mismo marco cuando se colocan.
//
// Cada builder devuelve un THREE.Group con:
//   userData.labels  → [{ text, at: [x,y,z] }] anclas locales para etiquetas.
//   userData.mounts  → puntos de montaje (solo piezas que reciben otras).
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Definiciones de modelo (metadatos). Esta es la "ficha" de cada modelo y el
// mismo esquema que usa assets/models/manifest.json para modelos GLB reales.
// ---------------------------------------------------------------------------
export const MODEL_DEFINITIONS = {
  case: {
    id: 'generic-case-mid-tower', type: 'case', generic: true,
    name: 'Gabinete genérico (torre media)',
    dimensions: { width: 210, height: 470, depth: 450 },
    dimensionSource: 'Proporciones ilustrativas de una torre media; no corresponden a un modelo comercial.',
    origin: 'Centro de la base, al nivel del suelo.',
    orientation: 'Frente hacia +Z; ventana lateral hacia −X; bandeja de placa hacia +X.'
  },
  board: {
    id: 'generic-board', type: 'board', generic: true,
    name: 'Placa base genérica',
    dimensions: { atx: [244, 305], 'micro-atx': [244, 244], 'mini-itx': [170, 170] },
    dimensionSource: 'Contorno según los formatos ATX (305 × 244 mm), micro-ATX (244 × 244 mm máx.) y Mini-ITX (170 × 170 mm). Distribución de componentes ilustrativa.',
    origin: 'Esquina inferior trasera del PCB, en la cara de componentes.',
    orientation: 'X hacia el frente, Y hacia arriba, Z hacia fuera de la cara de componentes.'
  },
  cpu: {
    id: 'generic-cpu', type: 'cpu', generic: true,
    name: 'Procesador genérico',
    dimensions: { width: 40, depth: 40, height: 4.2 },
    dimensionSource: 'Encapsulado cuadrado de 40 × 40 mm (orden de magnitud de AM5); los encapsulados reales varían por plataforma (p. ej., LGA1700 mide 45 × 37,5 mm).',
    origin: 'Centro de la cara de contactos.',
    orientation: 'Marca triangular en la esquina −X −Y.'
  },
  ram: {
    id: 'generic-dimm', type: 'ram', generic: true,
    name: 'Módulo DIMM genérico',
    dimensions: { length: 133.35, height: 31.25, thickness: 7 },
    dimensionSource: 'Longitud y altura nominales de un DIMM de escritorio según JEDEC; el grosor depende del disipador. La posición de la muesca es ilustrativa y difiere entre DDR4 y DDR5.',
    origin: 'Centro del borde de contactos.',
    orientation: 'Longitud en Y, altura en Z.'
  },
  m2: {
    id: 'generic-m2-2280', type: 'storage', generic: true,
    name: 'SSD M.2 2280 genérico',
    dimensions: { width: 22, length: 80 },
    dimensionSource: 'Formato M.2 2280: 22 mm de ancho × 80 mm de largo.',
    origin: 'Centro del borde de contactos.',
    orientation: 'Largo en X, ancho en Y.'
  },
  gpu: {
    id: 'generic-gpu-dual-slot', type: 'gpu', generic: true,
    name: 'Tarjeta gráfica genérica (doble ranura)',
    dimensions: { length: 240, height: 110, thickness: 40 },
    dimensionSource: 'Medidas ilustrativas de una tarjeta de doble ranura; la longitud real depende del modelo. Conector PCIe x16 de 89 mm según la especificación PCIe CEM.',
    origin: 'Inicio del conector, sobre el eje de la ranura.',
    orientation: 'Largo en X, altura hacia fuera de la placa (Z), ventiladores hacia −Y.'
  },
  psu: {
    id: 'generic-psu-atx', type: 'power', generic: true,
    name: 'Fuente ATX genérica',
    dimensions: { width: 150, height: 86, depth: 140 },
    dimensionSource: 'Fuente ATX: 150 × 86 mm de sección; el fondo de 140 mm es un valor habitual, no universal.',
    origin: 'Centro geométrico.',
    orientation: 'Ventilador hacia −Y; conector de red hacia −Z.'
  },
  cooler: {
    id: 'generic-air-tower', type: 'cooler', generic: true,
    name: 'Disipador de torre genérico',
    dimensions: { width: 125, depth: 75, height: 155 },
    dimensionSource: 'Medidas ilustrativas de una torre con ventilador de 120 mm; la altura real debe compararse con el máximo del gabinete.',
    origin: 'Centro de la base de contacto.',
    orientation: 'Torre hacia +Z, flujo de aire hacia −X (hacia la salida trasera).'
  },
  stockCooler: {
    id: 'generic-stock-cooler', type: 'cooler', generic: true,
    name: 'Disipador de serie genérico',
    dimensions: { diameter: 86, height: 44 },
    dimensionSource: 'Medidas ilustrativas de un disipador de perfil bajo; no reproduce el modelo incluido con tu procesador.',
    origin: 'Centro de la base.', orientation: 'Ventilador hacia +Z.'
  },
  aioPump: {
    id: 'generic-aio-pump', type: 'cooler', generic: true,
    name: 'Bloque de refrigeración líquida genérico',
    dimensions: { width: 60, depth: 60, height: 35 },
    dimensionSource: 'Medidas ilustrativas; el bloque real depende del modelo.',
    origin: 'Centro de la placa de contacto.', orientation: 'Tubos hacia +X.'
  },
  radiator: {
    id: 'generic-radiator', type: 'cooler', generic: true,
    name: 'Radiador genérico',
    dimensions: { length: 'tamaño + 32', thickness: 27 },
    dimensionSource: 'El tamaño nominal (240, 360…) sale de la ficha; el largo total y el grosor son ilustrativos.',
    origin: 'Centro de la cara trasera.', orientation: 'Largo en Y.'
  },
  fan: {
    id: 'generic-fan-120', type: 'fan', generic: true,
    name: 'Ventilador de 120 mm genérico',
    dimensions: { width: 120, height: 120, depth: 25 },
    dimensionSource: 'Formato estándar de ventilador de 120 × 120 × 25 mm.',
    origin: 'Centro.',
    orientation: 'El aire sale hacia +Z.'
  }
};

// ---------------------------------------------------------------------------
// Distribuciones ilustrativas de placa base por formato (mm, marco de placa).
// ---------------------------------------------------------------------------
export const BOARD_LAYOUTS = {
  atx: {
    w: 244, h: 305, socket: [100, 215], dimmX: [160, 170, 180, 190], dimmY: [132, 277],
    dimmNames: ['DIMM_A1', 'DIMM_A2', 'DIMM_B1', 'DIMM_B2'], recommendedDimms: [1, 3],
    eps: [20, 40, 291, 301], atx24: [227, 240, 150, 206], m2: [45, 160],
    pcie: [{ y: 120, x0: 14, len: 89, primary: true, name: 'PCIe x16 principal' }, { y: 99.7, x0: 14, len: 25, name: 'PCIe x1' }, { y: 59, x0: 14, len: 89, name: 'PCIe x16 (ranura secundaria)' }],
    chipset: [150, 195, 35, 78], io: [0, 24, 170, 300], vrm: [[26, 56, 180, 282], [62, 140, 262, 290]],
    fpanel: [200, 232, 5, 13], sata: [235, 244, 55, 105], battery: [212, 98],
    holes: [[6, 10], [6, 160], [6, 295], [115, 295], [238, 295], [115, 160], [238, 160], [115, 10], [238, 10]]
  },
  'micro-atx': {
    w: 244, h: 244, socket: [100, 160], dimmX: [160, 170, 180, 190], dimmY: [80, 225],
    dimmNames: ['DIMM_A1', 'DIMM_A2', 'DIMM_B1', 'DIMM_B2'], recommendedDimms: [1, 3],
    eps: [20, 40, 231, 241], atx24: [227, 240, 100, 156], m2: [45, 107],
    pcie: [{ y: 66, x0: 14, len: 89, primary: true, name: 'PCIe x16 principal' }, { y: 25, x0: 14, len: 89, name: 'PCIe x16 (ranura secundaria)' }],
    chipset: [150, 195, 6, 28], io: [0, 24, 115, 240], vrm: [[26, 56, 126, 226], [62, 140, 206, 233]],
    fpanel: [200, 232, 4, 12], sata: [235, 244, 32, 72], battery: [212, 48],
    holes: [[6, 10], [6, 160], [6, 234], [115, 234], [115, 160], [238, 160], [238, 10]]
  },
  'mini-itx': {
    w: 170, h: 170, socket: [92, 108], dimmX: [140, 150], dimmY: [22, 167],
    dimmNames: ['DIMM_A', 'DIMM_B'], recommendedDimms: [0, 1],
    eps: [18, 36, 158, 168], atx24: [159, 170, 52, 108], m2: [35, 58],
    pcie: [{ y: 24, x0: 10, len: 89, primary: true, name: 'PCIe x16' }],
    chipset: null, io: [0, 22, 45, 168], vrm: [[24, 52, 80, 150], [58, 128, 145, 166]],
    fpanel: [120, 150, 3, 10], sata: [161, 170, 8, 40], battery: [112, 40],
    holes: [[10, 6], [10, 163], [164, 163], [164, 6]]
  }
};

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export function buildFan(kit, size = 120, depth = 25) {
  const { mat } = kit;
  const g = new THREE.Group();
  const h = size / 2, bar = size * 0.06;
  // Marco: cuatro largueros y la carcasa circular.
  g.add(kit.box(mat.plastic, -h, h, h - bar, h, 0, depth));
  g.add(kit.box(mat.plastic, -h, h, -h, -h + bar, 0, depth));
  g.add(kit.box(mat.plastic, -h, -h + bar, -h, h, 0, depth));
  g.add(kit.box(mat.plastic, h - bar, h, -h, h, 0, depth));
  g.add(kit.cyl(mat.shell, h * 0.95, depth * 0.96, [0, 0, depth / 2], 'z', { open: true }));
  // Buje y aspas (instanciadas).
  g.add(kit.cyl(mat.plasticLight, size * 0.17, depth * 0.8, [0, 0, depth / 2], 'z'));
  const blades = [], n = 7, r = size * 0.3;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    blades.push([Math.cos(a) * r, Math.sin(a) * r, depth / 2, 0.45, 0, a]);
  }
  g.add(kit.instancedBoxes(mat.fanBlade, [size * 0.32, size * 0.2, 1.4], blades));
  g.userData.labels = [{ text: 'Flechas de flujo y giro en el marco', at: [h - bar, h - bar, depth] }];
  return g;
}

export function buildCase(kit, { boardFrameToLocal, standoffs = [], usedSlots = [] } = {}) {
  const { mat } = kit;
  const g = new THREE.Group();
  const X0 = -105, X1 = 105, Z0 = -225, Z1 = 225, Y0 = 12, Y1 = 470, t = 3;
  // Patas.
  g.add(kit.instancedCyl(mat.rubber, 9, Y0, [[X0 + 22, Y0 / 2, Z0 + 30], [X1 - 22, Y0 / 2, Z0 + 30], [X0 + 22, Y0 / 2, Z1 - 30], [X1 - 22, Y0 / 2, Z1 - 30]], 'y', { low: true }));
  // Paneles.
  g.add(kit.box(mat.caseBody, X0, X1, Y0, Y0 + t, Z0, Z1, { name: 'Base' }));
  g.add(kit.box(mat.caseBody, X0, X1, Y1 - t, Y1, Z0, Z1, { name: 'Panel superior', panel: 'top' }));
  g.add(kit.box(mat.caseBody, X1 - t, X1, Y0, Y1, Z0, Z1, { name: 'Panel lateral derecho' }));
  g.add(kit.box(mat.caseInner, 86, 89, Y0 + 30, Y1 - 20, Z0 + 4, Z1 - 60, { name: 'Bandeja de la placa' }));
  g.add(kit.box(mat.caseBody, X0, X1, Y0, Y1, Z1 - t, Z1, { name: 'Panel frontal', panel: 'front' }));
  g.add(kit.box(mat.accent, X0 + 20, X1 - 20, Y1 - 40, Y1 - 37, Z1, Z1 + 1, { name: 'Detalle frontal' }));
  // Vidrio lateral: no se puede seleccionar, para hacer clic a través de él.
  g.add(kit.box(mat.glass, X0, X0 + t, Y0 + t, Y1 - t, Z0 + t, Z1 - t, { name: 'Panel lateral de vidrio', panel: 'side', pickable: false }));
  // Panel trasero con hueco para el escudo de E/S y las ranuras de expansión.
  g.add(kit.box(mat.caseBody, X0, X1, Y0, 112, Z0, Z0 + t));                // zona de la fuente
  g.add(kit.box(mat.caseBody, X0, X1, 440, Y1, Z0, Z0 + t));                // franja superior
  g.add(kit.box(mat.caseBody, X0, 40, 112, 440, Z0, Z0 + t));               // zona del ventilador trasero / ranuras
  g.add(kit.box(mat.caseBody, 84, X1, 112, 440, Z0, Z0 + t));               // detrás de la bandeja
  g.add(kit.box(mat.darkMetal, 40, 84, 300, 440, Z0 - 0.5, Z0 + 0.5, { name: 'Escudo de E/S' }));
  // Tapas de ranuras de expansión que no ocupa la build (7 posiciones ATX).
  if (boardFrameToLocal) {
    for (let i = 0; i < 7; i++) {
      if (usedSlots.includes(i)) continue;
      const y = boardFrameToLocal([0, 120 - i * 20.32 - 9, 0])[1];
      g.add(kit.box(mat.metal, -30, 80, y - 9, y + 9, Z0 + t, Z0 + t + 1, { name: `Tapa de ranura ${i + 1}` }));
    }
  }
  // Separadores (standoffs) en la bandeja, en las posiciones de los orificios.
  if (standoffs.length) g.add(kit.instancedCyl(mat.brass, 3, 6, standoffs, 'x', { low: true, name: 'Separadores' }));
  g.userData.labels = [
    { text: 'Bandeja de la placa base', at: [86, 300, 120] },
    { text: 'Bahía de la fuente', at: [X0 + 10, 60, Z0 + 140] },
    { text: 'Ranuras de expansión traseras', at: [-10, 210, Z0] },
    { text: 'Separadores (standoffs)', at: [83, 150, -100] }
  ];
  g.userData.panelsGroup = g;
  return g;
}

// options.dimmCount (2 | 4): ranuras publicadas en la ficha de la placa.
// options.modules: módulos de la build; decide qué ranuras se recomiendan.
export function buildBoard(kit, form = 'atx', { dimmCount, modules = 2 } = {}) {
  const { mat } = kit;
  const L = { ...(BOARD_LAYOUTS[form] || BOARD_LAYOUTS.atx) };
  if (dimmCount === 2 && L.dimmX.length === 4) {
    L.dimmX = L.dimmX.slice(0, 2);
    L.dimmNames = ['DIMM_1', 'DIMM_2'];
  }
  // Recomendación habitual (a confirmar en el manual): un módulo → A2; dos → A2 y B2.
  L.recommendedDimms = L.dimmX.length === 4 ? (modules === 1 ? [1] : modules >= 4 ? [0, 1, 2, 3] : [1, 3]) : modules === 1 ? [0] : [0, 1];
  const g = new THREE.Group();
  const [sx, sy] = L.socket;
  // PCB.
  g.add(kit.box(mat.pcb, 0, L.w, 0, L.h, -1.6, 0, { name: 'PCB' }));
  // Orificios de montaje (anillos dorados).
  g.add(kit.instancedCyl(mat.gold, 4, 0.4, L.holes.map(([x, y]) => [x, y, 0.2]), 'z', { low: true, name: 'Orificios de montaje' }));
  // Socket: marco, placa de carga, palanca y marca triangular.
  g.add(kit.box(mat.slot, sx - 29, sx + 29, sy - 29, sy + 29, 0, 4, { name: 'Socket' }));
  g.add(kit.box(mat.metal, sx - 26, sx - 22, sy - 26, sy + 26, 4, 5));
  g.add(kit.box(mat.metal, sx + 22, sx + 26, sy - 26, sy + 26, 4, 5));
  g.add(kit.box(mat.metal, sx - 30, sx - 28, sy - 24, sy + 20, 2, 5, { name: 'Palanca de retención' }));
  g.add(kit.box(mat.gold, sx - 20, sx + 20, sy - 20, sy + 20, 4, 4.3, { name: 'Contactos del socket' }));
  g.add(kit.triangle(mat.marker, 7, [sx - 28, sy - 28, 4.4], 0, { name: 'Marca de orientación del socket' }));
  // Disipadores de VRM y E/S.
  L.vrm.forEach(([x0, x1, y0, y1]) => g.add(kit.box(mat.darkMetal, x0, x1, y0, y1, 0, 16, { name: 'Disipador de VRM' })));
  g.add(kit.box(mat.plasticLight, L.io[0], L.io[1], L.io[2], L.io[3], 0, 34, { name: 'Cubierta de E/S' }));
  g.add(kit.box(mat.accent, L.io[1] - 1, L.io[1], L.io[2] + 10, L.io[3] - 10, 34, 35));
  // Ranuras DIMM con seguros y saliente de posición.
  const [dy0, dy1] = L.dimmY, dyc = (dy0 + dy1) / 2;
  L.dimmX.forEach(x => {
    g.add(kit.box(mat.slot, x - 3, x + 3, dy0, dy1, 0, 8, { name: 'Ranura DIMM' }));
    g.add(kit.box(mat.plasticLight, x - 3.2, x + 3.2, dy1, dy1 + 6, 0, 11, { name: 'Seguro de la ranura' }));
    g.add(kit.box(mat.plasticLight, x - 3.2, x + 3.2, dy0 - 6, dy0, 0, 11, { name: 'Seguro de la ranura' }));
    g.add(kit.box(mat.plasticLight, x - 1, x + 1, dyc + 5 - 1, dyc + 5 + 1, 0, 8.3, { name: 'Saliente de posición' }));
  });
  // Ranuras PCIe.
  L.pcie.forEach(slot => {
    g.add(kit.box(slot.primary ? mat.darkMetal : mat.slot, slot.x0, slot.x0 + slot.len, slot.y - 3.5, slot.y + 3.5, 0, 11, { name: slot.name }));
    if (slot.primary) g.add(kit.box(mat.plasticLight, slot.x0 + slot.len, slot.x0 + slot.len + 9, slot.y - 3.5, slot.y + 3.5, 0, 12, { name: 'Seguro PCIe' }));
  });
  // M.2: conector y poste de fijación a 80 mm.
  const [mx, my] = L.m2;
  g.add(kit.box(mat.slot, mx - 6, mx, my - 11, my + 11, 0, 5, { name: 'Conector M.2' }));
  g.add(kit.cyl(mat.brass, 2.5, 4, [mx + 80, my, 2], 'z', { low: true, name: 'Poste M.2 (2280)' }));
  // Conectores de alimentación y cabeceras.
  g.add(kit.box(mat.plastic, L.eps[0], L.eps[1], L.eps[2], L.eps[3], 0, 12, { name: 'EPS 8 pines' }));
  g.add(kit.box(mat.plastic, L.atx24[0], L.atx24[1], L.atx24[2], L.atx24[3], 0, 13, { name: 'ATX 24 pines' }));
  g.add(kit.box(mat.plastic, L.fpanel[0], L.fpanel[1], L.fpanel[2], L.fpanel[3], 0, 7, { name: 'Panel frontal (F_PANEL)' }));
  g.add(kit.box(mat.plastic, L.sata[0], L.sata[1], L.sata[2], L.sata[3], 0, 9, { name: 'Puertos SATA' }));
  if (L.chipset) g.add(kit.box(mat.darkMetal, L.chipset[0], L.chipset[1], L.chipset[2], L.chipset[3], 0, 9, { name: 'Disipador del chipset' }));
  g.add(kit.cyl(mat.metal, 10, 3.2, [L.battery[0], L.battery[1], 1.6], 'z', { name: 'Pila CMOS' }));

  const primary = L.pcie.find(s => s.primary);
  g.userData.layout = L;
  g.userData.mounts = {
    socket: { accepts: 'cpu', at: [sx, sy, 4.3], name: 'Socket del procesador' },
    cooler: { accepts: 'cooler', at: [sx, sy, 4.3 + 4.2], name: 'Zona de montaje del disipador' },
    dimms: L.dimmX.map((x, i) => ({ accepts: 'ram', at: [x, dyc, 2], name: L.dimmNames[i], recommended: L.recommendedDimms.includes(i) })),
    m2: { accepts: 'm2', at: [mx - 3, my, 3], name: 'Ranura M.2' },
    pcie: { accepts: 'gpu', at: [0, primary.y, 2.5], name: primary.name },
    atx24: { accepts: 'cable-atx24', at: [(L.atx24[0] + L.atx24[1]) / 2, (L.atx24[2] + L.atx24[3]) / 2, 13] },
    eps: { accepts: 'cable-eps', at: [(L.eps[0] + L.eps[1]) / 2, (L.eps[2] + L.eps[3]) / 2, 12] },
    fpanel: { accepts: 'cable-fpanel', at: [(L.fpanel[0] + L.fpanel[1]) / 2, (L.fpanel[2] + L.fpanel[3]) / 2, 7] },
    holes: L.holes.map(([x, y]) => [x, y, 0])
  };
  g.userData.labels = [
    { text: 'Socket del procesador', at: [sx + 29, sy + 29, 5] },
    { text: 'Marca triangular del socket', at: [sx - 28, sy - 28, 5] },
    { text: 'Ranuras DIMM (consulta el orden en el manual)', at: [L.dimmX[L.dimmX.length - 1], dy1 + 6, 11] },
    { text: 'Ranura M.2', at: [mx, my + 11, 5] },
    { text: primary.name, at: [primary.x0 + primary.len / 2, primary.y + 3.5, 11] },
    { text: 'ATX 24 pines', at: [L.atx24[1], L.atx24[3], 13] },
    { text: 'EPS 8 pines (CPU)', at: [L.eps[1], L.eps[3], 12] },
    { text: 'Panel frontal (F_PANEL)', at: [L.fpanel[1], L.fpanel[3], 7] }
  ];
  return g;
}

export function buildCpu(kit) {
  const { mat } = kit;
  const g = new THREE.Group();
  g.add(kit.box(mat.gold, -19, 19, -19, 19, 0, 0.3, { name: 'Contactos' }));
  g.add(kit.box(mat.pcbGreen, -20, 20, -20, 20, 0.3, 1.4, { name: 'Sustrato' }));
  g.add(kit.box(mat.aluminium, -16, 16, -17, 17, 1.4, 4.2, { name: 'Disipador integrado (IHS)' }));
  g.add(kit.triangle(mat.marker, 6, [-19.5, -19.5, 1.45], 0, { name: 'Marca de orientación' }));
  g.userData.labels = [
    { text: 'Marca triangular: alinéala con la del socket', at: [-19, -19, 1.5] },
    { text: 'IHS: aquí va la pasta térmica', at: [10, 12, 4.2] },
    { text: 'Contactos: no tocar', at: [19, -19, 0.2] }
  ];
  return g;
}

export function buildDimm(kit, { notchOffset = 5 } = {}) {
  const { mat } = kit;
  const g = new THREE.Group();
  const L = 133.35, H = 31.25, half = L / 2, n = notchOffset, gap = 1.1;
  // Banda inferior partida por la muesca, con contactos dorados en ambas caras.
  g.add(kit.box(mat.pcbGreen, -0.65, 0.65, -half, n - gap, 0, 4));
  g.add(kit.box(mat.pcbGreen, -0.65, 0.65, n + gap, half, 0, 4));
  g.add(kit.box(mat.gold, -0.7, 0.7, -half + 1, n - gap - 0.3, 0.2, 3.6, { name: 'Contactos' }));
  g.add(kit.box(mat.gold, -0.7, 0.7, n + gap + 0.3, half - 1, 0.2, 3.6, { name: 'Contactos' }));
  g.add(kit.box(mat.pcbGreen, -0.65, 0.65, -half, half, 4, H, { name: 'PCB del módulo' }));
  // Disipador del módulo.
  g.add(kit.box(mat.darkMetal, -3.4, -0.65, -half + 2, half - 2, 6, H - 1));
  g.add(kit.box(mat.darkMetal, 0.65, 3.4, -half + 2, half - 2, 6, H - 1));
  g.add(kit.box(mat.accent, -3.5, 3.5, -half + 2, half - 2, H - 1, H));
  g.userData.labels = [
    { text: 'Muesca: debe coincidir con el saliente de la ranura', at: [0, n, 0] },
    { text: 'Contactos dorados: no tocar', at: [0.7, -40, 2] }
  ];
  return g;
}

export function buildM2(kit) {
  const { mat } = kit;
  const g = new THREE.Group();
  // Contactos con la muesca Key M (posición ilustrativa).
  g.add(kit.box(mat.gold, 0, 4, -10, 4, 0, 0.8, { name: 'Contactos' }));
  g.add(kit.box(mat.gold, 0, 4, 5.2, 10, 0, 0.8, { name: 'Contactos' }));
  g.add(kit.box(mat.pcb, 4, 78, -11, 11, 0, 0.8, { name: 'PCB' }));
  g.add(kit.box(mat.pcb, 78, 80, -11, -3, 0, 0.8));
  g.add(kit.box(mat.pcb, 78, 80, 3, 11, 0, 0.8));
  g.add(kit.box(mat.plastic, 9, 21, -6, 6, 0.8, 2.0, { name: 'Controlador' }));
  g.add(kit.instancedBoxes(mat.plastic, [16, 13, 1.2], [[34, 0, 1.4], [54, 0, 1.4]], { name: 'Memoria NAND' }));
  g.add(kit.box(mat.sticker, 30, 70, -9, 9, 2.0, 2.1, { name: 'Etiqueta' }));
  g.userData.labels = [
    { text: 'Muesca Key M', at: [0, 4.6, 0.8] },
    { text: 'Semicírculo para el tornillo o seguro', at: [80, 0, 0.8] }
  ];
  return g;
}

export function buildGpu(kit, { length = 240 } = {}) {
  const { mat } = kit;
  const g = new THREE.Group();
  const Lg = length;
  // Conector de borde (dentro de la ranura) y PCB.
  g.add(kit.box(mat.gold, 14.5, 102.5, -0.8, 0.8, -6, 0, { name: 'Conector PCIe x16' }));
  g.add(kit.box(mat.pcb, 0, Lg, -0.8, 0.8, 0, 105, { name: 'PCB' }));
  g.add(kit.box(mat.darkMetal, 2, Lg, 0.8, 2.6, 4, 105, { name: 'Placa trasera' }));
  // Carcasa y ventiladores.
  g.add(kit.box(mat.plastic, 2, Lg - 2, -40, -2, 8, 108, { name: 'Carcasa' }));
  g.add(kit.box(mat.accent, 2, Lg - 2, -40.5, -39.5, 104, 106));
  [Lg * 0.3, Lg * 0.72].forEach(x => {
    const fan = buildFan(kit, 88, 10);
    fan.position.set(x, -29.5, 58);
    fan.rotation.x = Math.PI / 2;
    g.add(fan);
  });
  // Soporte (bracket) metálico de doble ranura.
  g.add(kit.box(mat.metal, -12, -10.5, -40, 3, -14, 116, { name: 'Soporte trasero (bracket)' }));
  g.add(kit.instancedBoxes(mat.slot, [3, 10, 14], [[-12.2, -12, 30], [-12.2, -12, 58], [-12.2, -12, 86]], { name: 'Salidas de vídeo' }));
  // Conector de alimentación (cantidad y tipo dependen del modelo).
  g.add(kit.box(mat.plastic, Lg - 70, Lg - 50, -10, 0, 105, 113, { name: 'Conector de alimentación' }));
  g.userData.labels = [
    { text: 'Conector PCIe x16', at: [60, 0, -6] },
    { text: 'Soporte trasero: se atornilla al gabinete', at: [-11, 3, 116] },
    { text: 'Alimentación PCIe (según el modelo)', at: [Lg - 60, 0, 113] }
  ];
  return g;
}

export function buildPsu(kit) {
  const { mat } = kit;
  const g = new THREE.Group();
  const w = 75, h = 43, d = 70;
  g.add(kit.box(mat.plastic, -w, w, -h, h, -d, d, { name: 'Carcasa de la fuente' }));
  g.add(kit.cyl(mat.darkMetal, 60, 1, [0, -h - 0.5, 0], 'y', { name: 'Rejilla del ventilador' }));
  g.add(kit.cyl(mat.fanBlade, 18, 1.2, [0, -h - 0.6, 0], 'y'));
  g.add(kit.box(mat.slot, -60, -30, -18, 2, -d - 1, -d, { name: 'Conector de red (IEC C14)' }));
  g.add(kit.box(mat.slot, -22, -12, -14, -2, -d - 1.5, -d, { name: 'Interruptor' }));
  g.add(kit.box(mat.slot, -60, 60, -30, 30, d, d + 1, { name: 'Panel de conectores' }));
  g.add(kit.box(mat.sticker, -w - 0.4, -w, -30, 30, -50, 50, { name: 'Etiqueta (no abrir)' }));
  g.add(kit.box(mat.accent, -w, w, h, h + 0.6, d - 8, d - 4));
  g.userData.labels = [
    { text: 'Ventilador', at: [0, -h, 40] },
    { text: 'Conector de red e interruptor', at: [-45, 0, -d] },
    { text: 'Conectores (modulares solo si el modelo lo es)', at: [40, 20, d] },
    { text: 'No abrir: contiene condensadores con carga', at: [-w, 30, 0] }
  ];
  return g;
}

// Disipador de torre: base sobre el CPU, heatpipes, aletas y ventilador.
// Marco local = marco de la placa, origen en el centro del CPU.
// height: altura publicada en la ficha (mm); sin dato se usa 156 como referencia.
export function buildAirCooler(kit, { height } = {}) {
  const { mat } = kit;
  const H = Math.min(175, Math.max(100, Number(height) || 156));
  const g = new THREE.Group();
  g.add(kit.box(mat.metal, -45, 45, -6, 6, 0, 2, { name: 'Soporte de montaje' }));
  g.add(kit.box(mat.copper, -20, 20, -20, 20, 0, 9, { name: 'Base de contacto' }));
  g.add(kit.instancedCyl(mat.copper, 3, H - 36, [[-12, -9, (H + 12) / 2], [-4, 9, (H + 12) / 2], [4, -9, (H + 12) / 2], [12, 9, (H + 12) / 2]], 'z', { low: true, name: 'Heatpipes' }));
  const fins = [];
  for (let z = 42; z <= H - 4; z += 2.6) fins.push([0, 0, z]);
  g.add(kit.instancedBoxes(mat.aluminium, [52, 124, 0.45], fins, { name: 'Aletas' }));
  g.add(kit.box(mat.accent, -26, 26, -62, 62, H - 3, H, { name: 'Tapa superior' }));
  const fan = buildFan(kit, 120, 25);
  fan.position.set(51, 0, Math.max(70, H - 60));
  fan.rotation.y = -Math.PI / 2; // aire hacia −X (salida trasera)
  g.add(fan);
  g.userData.labels = [
    { text: 'Base: retira la película protectora si la trae', at: [20, -20, 4] },
    { text: 'Cable del ventilador → CPU_FAN', at: [51, 60, H - 6] },
    { text: 'Soporte específico del socket', at: [45, 6, 2] }
  ];
  return g;
}

// Disipador de serie genérico (perfil bajo, circular). No reproduce ningún modelo.
export function buildStockCooler(kit) {
  const { mat } = kit;
  const g = new THREE.Group();
  g.add(kit.box(mat.metal, -36, 36, -36, 36, 0, 3, { name: 'Placa de anclaje' }));
  g.add(kit.cyl(mat.aluminium, 40, 26, [0, 0, 16], 'z', { name: 'Disipador' }));
  g.add(kit.cyl(mat.plastic, 43, 13, [0, 0, 35.5], 'z', { name: 'Carcasa del ventilador' }));
  g.add(kit.cyl(mat.plasticLight, 13, 2, [0, 0, 43], 'z'));
  g.add(kit.box(mat.slot, 34, 44, -4, 4, 2, 10, { name: 'Cable del ventilador' }));
  g.userData.labels = [
    { text: 'Pasta térmica preaplicada: no la retires', at: [0, -40, 2] },
    { text: 'Cable del ventilador → CPU_FAN', at: [44, 0, 10] }
  ];
  return g;
}

// Bloque de bomba de refrigeración líquida (AIO) genérico.
export function buildAioPump(kit) {
  const { mat } = kit;
  const g = new THREE.Group();
  g.add(kit.box(mat.metal, -40, 40, -6, 6, 0, 2, { name: 'Soporte del bloque' }));
  g.add(kit.box(mat.copper, -22, 22, -22, 22, 0, 4, { name: 'Placa de contacto' }));
  g.add(kit.box(mat.plastic, -30, 30, -30, 30, 4, 34, { name: 'Bomba' }));
  g.add(kit.cyl(mat.accent, 22, 2, [0, 0, 35], 'z'));
  g.add(kit.instancedCyl(mat.rubber, 5.5, 50, [[30, -12, 22], [30, 12, 22]], 'x', { low: true, name: 'Tubos' }));
  g.userData.labels = [
    { text: 'Placa de contacto: revisa si trae pasta preaplicada', at: [22, -22, 2] },
    { text: 'Tubos: orientación según el manual', at: [55, 12, 22] }
  ];
  return g;
}

// Radiador genérico de `size` mm (120/240/280/360…). Largo en Y, grosor en Z.
export function buildRadiator(kit, size = 240) {
  const { mat } = kit;
  const g = new THREE.Group();
  const L = size + 32, half = L / 2, w = size % 140 === 0 ? 70 : 60;
  g.add(kit.box(mat.darkMetal, -w, w, -half + 16, half - 16, 0, 27, { name: 'Panal del radiador' }));
  g.add(kit.box(mat.plastic, -w, w, half - 16, half, 0, 27, { name: 'Depósito' }));
  g.add(kit.box(mat.plastic, -w, w, -half, -half + 16, 0, 27, { name: 'Depósito' }));
  const lines = [];
  for (let y = -half + 22; y < half - 20; y += 9) lines.push([0, y, 27.2]);
  g.add(kit.instancedBoxes(mat.aluminium, [w * 2 - 6, 1.2, 0.4], lines));
  g.add(kit.instancedCyl(mat.rubber, 5.5, 40, [[-20, half + 18, 14], [20, half + 18, 14]], 'y', { low: true, name: 'Tubos' }));
  g.userData.labels = [{ text: `Radiador de ${size} mm: posición según el gabinete`, at: [w, half - 16, 27] }];
  return g;
}
