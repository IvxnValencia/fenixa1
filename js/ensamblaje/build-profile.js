// Perfil de montaje de una build (módulo PURO: sin DOM ni globales).
//
// Recibe las piezas de Mi build ya resueltas, con sus fichas, y devuelve solo lo
// que importa para ensamblar, indicando de dónde sale cada dato:
//   'ficha'   → valor publicado y verificado en FENIXA_SPECS
//   'texto'   → deducido del nombre o resumen del producto (se avisa)
//   'generico'→ no hay dato: se usa un procedimiento genérico y se remite al manual
// Nunca se inventan medidas: si falta un dato, queda como desconocido.
//
// Entrada:
//   parts: [{ id, category, name, summary, facts: { values, verified } }]
//   fitIssues: [{ partId, label, reason }]  (conflictos de FENIXA_FIT de formato y
//              espacio; socket y memoria se comprueban aquí con mensajes propios)

export const CORE = ['cpu', 'board', 'ram', 'storage', 'power', 'case'];
const LGA = /^LGA/i;

const text = p => `${p?.name || ''} ${p?.summary || ''}`;
const val = (p, key) => (p?.facts?.verified ? p.facts.values?.[key] : undefined);
function fact(p, key, fromText) {
  const v = val(p, key);
  if (v !== undefined && v !== null && v !== '') return { value: v, source: 'ficha' };
  const t = fromText?.(text(p));
  if (t !== undefined && t !== null && t !== '') return { value: t, source: 'texto' };
  return { value: null, source: 'generico' };
}

const socketFromText = s => s.toUpperCase().match(/\bAM[45]\b|\bLGA\s?\d{4}\b/)?.[0].replace(/\s/g, '');
const ddrFromText = s => s.toUpperCase().match(/\bDDR[45]\b/)?.[0];
const formFromText = s => {
  const t = s.toLowerCase();
  if (/mini[- ]?itx/.test(t)) return 'mini-itx';
  if (/micro[- ]?atx|\bm-?atx\b/.test(t)) return 'micro-atx';
  if (/e-?atx/.test(t)) return 'e-atx';
  if (/\batx\b/.test(t)) return 'atx';
  return null;
};

export function buildProfile(parts, { fitIssues = [] } = {}) {
  const byCat = {};
  for (const p of parts) byCat[p.category] = p;
  const { cpu, board, ram, storage, gpu, power, cooler } = byCat;
  const box = byCat.case;
  const issues = [];
  const add = (severity, message, partIds = []) => { if (!issues.some(i => i.message === message)) issues.push({ severity, message, partIds }); };

  // --- plataforma
  const cpuSocket = fact(cpu, 'socket', socketFromText);
  const boardSocket = fact(board, 'socket', socketFromText);
  const socket = boardSocket.value ? boardSocket : cpuSocket;
  const cpuMemory = fact(cpu, 'memory', ddrFromText);
  const boardMemory = fact(board, 'memory', ddrFromText);
  const ramMemory = fact(ram, 'memory', ddrFromText);

  // --- formatos
  let boardForm = fact(board, 'boardForm', formFromText);
  const eatx = boardForm.value === 'e-atx';
  const sceneForm = ['atx', 'micro-atx', 'mini-itx'].includes(boardForm.value) ? boardForm.value : 'atx';
  const dimmSlots = fact(board, 'slots').value;
  const m2Slots = fact(board, 'm2Slots').value;

  // --- memoria
  const modulesFact = fact(ram, 'modules', s => Number(s.match(/(\d)\s*[x×]\s*\d+\s*GB/i)?.[1]) || null);
  const ramModules = ram ? Math.max(1, Math.min(4, Number(modulesFact.value) || 2)) : 0;
  const ramFormatText = String(fact(ram, 'format').value || text(ram));
  const sodimm = ram ? /SO-?DIMM/i.test(ramFormatText) : false;

  // --- almacenamiento
  let storageKind = null, storageInterface = null;
  if (storage) {
    const fmt = String(fact(storage, 'format').value || '');
    const placement = String(fact(storage, 'placement').value || '');
    const iface = String(fact(storage, 'pcie').value || text(storage));
    if (/extern/i.test(placement) || /port[aá]til|USB/i.test(fmt)) storageKind = 'external';
    else if (/M\.2/i.test(fmt) || /M\.2/i.test(text(storage))) storageKind = 'm2';
    else if (/2[,.]5/.test(fmt) || /2[,.]5/.test(text(storage))) storageKind = 'sata25';
    else storageKind = 'unknown';
    storageInterface = /NVMe|PCIe/i.test(iface) ? 'NVMe' : /SATA/i.test(iface) ? 'SATA' : null;
  }

  // --- refrigeración
  const thermal = String(fact(cpu, 'thermal').value || '');
  const cpuCooler = !cpu ? null : /sin disipador/i.test(thermal) ? 'none' : /wraith|laminar|incluye|presentaci[oó]n box/i.test(thermal) ? 'stock' : 'unknown';
  let coolerKind = null, coolerHeight = null, radiator = null, coolerSockets = null;
  if (cooler) {
    const type = fact(cooler, 'coolerType').value;
    const fmt = String(fact(cooler, 'format').value || text(cooler));
    coolerKind = type === 'aio' || /\bAIO\b|l[ií]quida/i.test(fmt) ? 'aio' : type === 'air' || /torre|tower/i.test(fmt) ? 'air' : 'unknown';
    coolerHeight = coolerKind === 'air' ? Number(fact(cooler, 'height').value) || null : null;
    radiator = coolerKind === 'aio' ? Number(fmt.match(/(120|140|240|280|360|420)\s*mm/)?.[1]) || null : null;
    coolerSockets = fact(cooler, 'sockets').value;
  } else if (cpuCooler === 'stock') coolerKind = 'stock';

  // --- gráfica
  const requiresGpu = val(cpu, 'requiresGpu') === true;
  const gpuLength = gpu ? Number(fact(gpu, 'length').value) || null : null;
  const gpuPower = gpu ? String(val(gpu, 'powerConnectors') || val(gpu, 'connectors') || '') : '';
  const gpuNeedsPower = gpu ? !/sin conector/i.test(gpuPower) : false;

  // --- fuente
  const psuFormat = String(fact(power, 'format').value || '');
  const modular = !power ? null : /semi/i.test(psuFormat) ? 'semi' : /no modular/i.test(psuFormat) ? 'none' : /totalmente modular|full[- ]?modular/i.test(psuFormat) ? 'full' : 'unknown';
  // Cualquier mención a SFX (incluso "ATX 3.1 (SFX 4.1)") se trata como ambigua: no se marca conflicto.
  const psuSfx = /SFX/i.test(psuFormat);

  // --- revisión previa
  for (const f of fitIssues) add('conflict', f.reason || f.label, [f.partId]);
  const names = cat => byCat[cat]?.name || cat;
  if (cpuSocket.value && boardSocket.value && cpuSocket.value !== boardSocket.value) add('conflict', `El procesador usa ${cpuSocket.value} y la placa ${boardSocket.value}: no son compatibles.`, [cpu.id, board.id]);
  if (ramMemory.value && boardMemory.value && ramMemory.value !== boardMemory.value) add('conflict', `La memoria es ${ramMemory.value} y la placa admite ${boardMemory.value}.`, [ram.id, board.id]);
  if (sodimm) add('conflict', `${names('ram')} es SO-DIMM (formato de portátil): no entra en las ranuras DIMM de una placa de escritorio.`, [ram.id]);
  if (storageKind === 'm2' && m2Slots === 0) add('conflict', `${names('board')} no publica ranuras M.2 de almacenamiento y ${names('storage')} es M.2.`, [storage.id, board.id]);
  if (storageKind === 'm2' && storageInterface === 'SATA') add('warning', 'El SSD M.2 es SATA: confirma en el manual que la ranura M.2 elegida admite SATA y qué puertos desactiva.', [storage.id]);
  if (storageKind === 'external') add('info', `${names('storage')} es una unidad externa: no se instala dentro del PC.`, [storage.id]);
  if (requiresGpu && !gpu) add('conflict', `${names('cpu')} no tiene gráficos integrados: sin tarjeta gráfica el equipo no dará imagen.`, [cpu.id]);
  if (cpu && !cooler && cpuCooler === 'none') add('missing', `${names('cpu')} se vende sin disipador: añade una refrigeración a tu build.`, [cpu.id]);
  if (cpu && !cooler && cpuCooler === 'stock') add('info', `Se usará el disipador incluido con ${names('cpu')}. Confirma que tu unidad lo trae.`, [cpu.id]);
  if (cpu && !cooler && cpuCooler === 'unknown') add('warning', `No consta si ${names('cpu')} incluye disipador: compruébalo antes de montar.`, [cpu.id]);
  if (cooler && coolerSockets && socket.value && !String(coolerSockets).toUpperCase().replace(/\s/g, '').includes(String(socket.value).toUpperCase())) {
    add('warning', `El socket ${socket.value} no aparece en la lista publicada de ${names('cooler')}. Confírmalo con el fabricante.`, [cooler.id]);
  }
  // El kit solo se atribuye al socket si aparece en el mismo tramo de la lista ("LGA1700 con kit específico / …").
  if (cooler && coolerSockets && socket.value && String(coolerSockets).split(/[\/·,;]/).some(seg => seg.includes(socket.value) && /kit/i.test(seg))) add('info', `${names('cooler')} necesita un kit de montaje específico para ${socket.value}, según su ficha.`, [cooler.id]);
  if (coolerKind === 'aio') add('warning', `Confirma en el manual del gabinete dónde admite un radiador${radiator ? ` de ${radiator} mm` : ''} (frontal o superior).`, [cooler?.id]);
  if (box && power && psuSfx === false && /^SFX/i.test(String(val(box, 'psuFormat') || ''))) add('conflict', `${names('case')} admite fuentes SFX y ${names('power')} es ATX.`, [box.id, power.id]);
  if (box && power && Number.isFinite(val(box, 'psuMax')) && Number.isFinite(val(power, 'length')) && val(power, 'length') > val(box, 'psuMax')) add('conflict', `La fuente mide ${val(power, 'length')} mm de fondo y el gabinete admite ${val(box, 'psuMax')} mm.`, [box.id, power.id]);
  if (eatx) add('warning', 'Placa E-ATX: el modelo 3D usa el contorno ATX como referencia. Comprueba que el gabinete admite su ancho exacto.', [board.id]);
  if (gpu && Number.isFinite(val(gpu, 'recommendedPsu')) && Number.isFinite(val(power, 'watts')) && val(power, 'watts') < val(gpu, 'recommendedPsu')) add('warning', `La gráfica recomienda una fuente de ${val(gpu, 'recommendedPsu')} W y la tuya es de ${val(power, 'watts')} W.`, [gpu.id, power.id]);
  for (const cat of CORE) if (!byCat[cat]) add('missing', `Falta ${({ cpu: 'el procesador', board: 'la placa base', ram: 'la memoria', storage: 'el almacenamiento', power: 'la fuente', case: 'el gabinete' })[cat]} en tu build: sus pasos no se mostrarán.`);

  const order = { conflict: 0, missing: 1, warning: 2, info: 3 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    signature: parts.map(p => p.id).sort().join('|'),
    empty: parts.length === 0,
    parts: byCat,
    platform: { socket, lga: socket.value ? LGA.test(socket.value) || socket.value === 'AM5' : null, cpuMemory, boardMemory, ramMemory },
    board: { form: boardForm, sceneForm, eatx, dimmSlots, m2Slots },
    ram: { modules: ramModules, sodimm },
    storage: { kind: storageKind, interface: storageInterface },
    cooler: { kind: coolerKind, cpuIncluded: cpuCooler, height: coolerHeight, radiator },
    gpu: { present: Boolean(gpu), required: requiresGpu, length: gpuLength, power: gpuPower, needsPower: gpuNeedsPower },
    power: { modular },
    issues,
    blocking: issues.some(i => i.severity === 'conflict')
  };
}
