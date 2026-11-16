// Gestión de componentes en escena: compone el PC a partir de los modelos y
// los puntos de montaje de la placa.
//
// Cada pieza seleccionable es un THREE.Group con userData:
//   isPart, id, type, name, generic, placeholder, ruleKey, base (posición
//   montada), explode (desplazamiento en vista separada, en el marco del padre), labels.
//
// `spec` sale de route.js → sceneSpec(perfil de la build): solo se añaden las
// piezas que están en la build. La placa y el gabinete, si faltan, se muestran
// como referencia marcada (`placeholder`), porque sin ellos no hay dónde montar.
import * as THREE from 'three';
import {
  MODEL_DEFINITIONS, buildCase, buildBoard, buildCpu, buildDimm, buildM2,
  buildGpu, buildPsu, buildAirCooler, buildStockCooler, buildAioPump, buildRadiator, buildFan
} from './generic-models.js';
import { mergeStaticMeshes } from './optimize.js';

// Marco de la placa dentro del gabinete (mm).
// Local X → mundo +Z (hacia el frente), local Z → mundo −X (hacia la ventana).
const BOARD_FRAME = { x: 80.4, y: 137, z: -215 };
const boardToWorld = ([x, y, z]) => [BOARD_FRAME.x - z, BOARD_FRAME.y + y, BOARD_FRAME.z + x];

// PC de referencia (sin build): ATX, torre de aire, GPU y dos módulos.
export const DEFAULT_SPEC = {
  boardForm: 'atx', dimmCount: 4, ramModules: 2, coolerKind: 'air',
  parts: ['case', 'psu', 'board', 'cpu', 'cooler', 'ram', 'm2', 'gpu', 'fans'],
  placeholders: [], names: {}
};

export function buildPc(kit, input = DEFAULT_SPEC) {
  const spec = { ...DEFAULT_SPEC, ...input };
  const root = new THREE.Group();
  root.name = 'PC';
  const parts = new Map();
  const has = id => spec.parts.includes(id);
  const placeholder = id => spec.placeholders.includes(id);
  // Nombre visible: el producto real de la build si existe; si no, el genérico.
  const label = (id, generic) => (placeholder(id) ? `${generic} · referencia (no está en tu build)` : spec.names[id] || generic);

  const frame = new THREE.Group();
  frame.name = 'Marco de la placa';
  frame.position.set(BOARD_FRAME.x, BOARD_FRAME.y, BOARD_FRAME.z);
  frame.rotation.y = -Math.PI / 2;
  root.add(frame);

  function register(group, meta, parent) {
    Object.assign(group.userData, {
      isPart: true, generic: true, placeholder: placeholder(meta.id), ...meta,
      base: group.position.clone(),
      explode: new THREE.Vector3(...(meta.explode || [0, 0, 0]))
    });
    group.name = meta.name;
    parent.add(group);
    parts.set(meta.id, group);
    return group;
  }

  // Placa (se construye primero porque define los puntos de montaje).
  const board = buildBoard(kit, spec.boardForm, { dimmCount: spec.dimmCount, modules: spec.ramModules });
  const mounts = board.userData.mounts;

  if (has('case')) {
    const standoffs = mounts.holes.map(([x, y]) => { const w = boardToWorld([x, y, 0]); return [w[0] + 4.6, w[1], w[2]]; });
    const usedSlots = has('gpu') ? [0, 1] : [];
    register(buildCase(kit, { boardFrameToLocal: boardToWorld, standoffs, usedSlots }),
      { id: 'case', type: 'case', name: label('case', MODEL_DEFINITIONS.case.name), explode: [0, 0, 0] }, root);
  }
  if (has('psu')) {
    const psu = buildPsu(kit);
    psu.position.set(-6, 12 + 3 + 43.5, -225 + 3 + 70.5);
    register(psu, { id: 'psu', type: 'power', name: label('psu', MODEL_DEFINITIONS.psu.name), explode: [-280, -10, 0] }, root);
  }
  if (has('fans')) {
    const fans = new THREE.Group();
    [190, 320].forEach(y => { const f = buildFan(kit); f.position.set(-8, y, 220); f.rotation.y = Math.PI; fans.add(f); });
    const rear = buildFan(kit); rear.position.set(-20, 345, -197); rear.rotation.y = Math.PI; fans.add(rear);
    fans.userData.labels = [{ text: 'Entrada frontal / salida trasera', at: [-8, 380, 220] }];
    register(fans, { id: 'fans', type: 'fan', name: 'Ventiladores del gabinete (genéricos)', explode: [0, 0, 130] }, root);
  }

  register(board, { id: 'board', type: 'board', name: label('board', `Placa base ${formLabel(spec.boardForm)} (genérica)`), explode: [0, 0, 240], mountsRef: mounts }, frame);

  const place = (group, at, explodeZ, extra = [0, 0, 0]) => {
    group.position.set(at[0], at[1], at[2]);
    return [extra[0], extra[1], explodeZ + extra[2]];
  };

  if (has('cpu')) {
    const cpu = buildCpu(kit);
    const ex = place(cpu, mounts.socket.at, 300);
    register(cpu, { id: 'cpu', type: 'cpu', name: label('cpu', MODEL_DEFINITIONS.cpu.name), explode: ex, mount: 'socket' }, frame);
  }
  if (has('cooler')) {
    const kind = spec.coolerKind;
    const model = kind === 'aio' ? buildAioPump(kit) : kind === 'stock' ? buildStockCooler(kit) : buildAirCooler(kit, { height: spec.coolerHeight });
    const ex = place(model, mounts.cooler.at, 420);
    const generic = kind === 'aio' ? MODEL_DEFINITIONS.aioPump.name : kind === 'stock' ? MODEL_DEFINITIONS.stockCooler.name : MODEL_DEFINITIONS.cooler.name;
    const name = kind === 'stock' ? 'Disipador incluido con el procesador (genérico)'
      : kind === 'aio' && spec.names.cooler ? `${spec.names.cooler} · bloque` : label('cooler', generic);
    register(model, { id: 'cooler', type: 'cooler', ruleKey: kind === 'aio' ? 'aio' : kind === 'stock' ? 'stock' : 'cooler', name, explode: ex, mount: 'cooler' }, frame);
    if (kind === 'aio') {
      // Radiador en el frente, detrás de los ventiladores frontales (posición de referencia).
      const size = Number(spec.radiator) || 240;
      const radiator = buildRadiator(kit, size);
      radiator.position.set(-8, Math.min(255, 470 - (size + 32) / 2 - 15), 166);
      const rname = spec.names.cooler ? `${spec.names.cooler} · radiador` : `Radiador de ${size} mm (genérico)`;
      register(radiator, { id: 'radiator', type: 'cooler', name: rname, explode: [0, 0, 110] }, root);
    }
  }
  if (has('ram')) {
    const slots = mounts.dimms.filter(d => d.recommended).slice(0, spec.ramModules || 2);
    slots.forEach((slot, i) => {
      const dimm = buildDimm(kit);
      const ex = place(dimm, slot.at, 330 + i * 18);
      const name = spec.names.ram ? `${spec.names.ram} · módulo ${i + 1}` : `Módulo de RAM ${i + 1} (genérico)`;
      register(dimm, { id: `ram-${i + 1}`, type: 'ram', name, explode: ex, mount: slot.name }, frame);
    });
  }
  if (has('m2')) {
    const m2 = buildM2(kit);
    const ex = place(m2, mounts.m2.at, 290);
    register(m2, { id: 'm2', type: 'storage', name: label('m2', MODEL_DEFINITIONS.m2.name), explode: ex, mount: 'm2' }, frame);
  }
  if (has('gpu')) {
    // Longitud publicada en la ficha, acotada a lo que cabe en el gabinete de referencia.
    const length = Math.min(330, Math.max(150, Number(spec.gpuLength) || 240));
    const gpu = buildGpu(kit, { length });
    const ex = place(gpu, mounts.pcie.at, 380, [0, -70, 0]);
    register(gpu, { id: 'gpu', type: 'gpu', name: label('gpu', MODEL_DEFINITIONS.gpu.name), explode: ex, mount: 'pcie', modelLength: length }, frame);
  }

  // Optimización: menos llamadas de dibujo fusionando mallas estáticas por material.
  root.updateMatrixWorld(true);
  let merged = 0;
  for (const part of parts.values()) merged += mergeStaticMeshes(part);
  root.userData.mergedMeshes = merged;

  return { root, parts, frame, mounts };
}

export function formLabel(form) {
  return { atx: 'ATX', 'micro-atx': 'micro-ATX', 'mini-itx': 'Mini-ITX' }[form] || 'ATX';
}

// Aplica la vista separada con un factor 0 (montado) … 1 (separado).
// Las piezas sin instalar (modo práctica) conservan su posición.
export function applyExplode(parts, k) {
  parts.forEach(part => {
    if (part.userData.loose) return;
    part.position.copy(part.userData.base).addScaledVector(part.userData.explode, k);
  });
}
