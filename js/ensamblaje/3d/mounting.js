// Sistema de encaje y validación de instalación.
//
// Módulo PURO (sin Three.js ni DOM): recibe la pose de una pieza y la lista de
// puntos de montaje, y decide si la instalación es correcta. Así se puede
// probar de forma aislada (tests/assembly-validation.html).
//
// Modelo de pose (en el plano de montaje, paralelo a la placa):
//   u, v  → posición del origen de la pieza en el plano (mm)
//   yaw   → giro alrededor de la normal del plano (grados)
//   flip  → pieza volteada (true/false)
// El arrastre ocurre a una altura fija y baja sobre el plano (lo justo para librar
// ranuras y seguros, así la pieza se ve sobre su destino real); la inserción a lo largo
// de la normal la realiza la animación de encaje SOLO después de validar.
//
// Comprobaciones, en este orden:
//   1. Dependencias (p. ej. el disipador requiere el procesador instalado).
//   2. Zona: que haya un punto de montaje del tipo correcto cerca; si la pieza
//      está sobre un punto de otro tipo, se explica la incompatibilidad.
//   3. Ocupación y ranura recomendada.
//   4. Compatibilidad pieza–ubicación (gancho para la Fase 4: socket, DDR…).
//   5. Posición dentro de la tolerancia.
//   6. Orientación: volteo y giro dentro de la tolerancia angular.

export const PROXIMITY = 45; // mm: a esta distancia se considera que "apunta" a una zona

export const RULES = {
  cpu: {
    label: 'el procesador', accepts: 'cpu', frame: 'board', hover: 14, flipLift: 4.5,
    tolerance: 6, yawTolerance: 10, correctYaws: [0], flipValid: [false], requires: [],
    footprint: [-20, 20, -20, 20], key: [-17, -17, 4.4], startYaw: 90,
    hint: 'Arrástralo sobre el socket. Gíralo hasta que su punto dorado (la marca triangular) coincida con el de la zona.',
    orientation: d => (Math.abs(d) > 135 ? 'La marca triangular está en la esquina opuesta. Gira el procesador 180°: nunca lo fuerces.' : 'La marca triangular no coincide con la del socket. Gira el procesador 90° hasta alinearlas.'),
    flip: 'Los contactos deben mirar hacia el socket. Voltea el procesador.'
  },
  cooler: {
    label: 'el disipador', accepts: 'cooler', frame: 'board', hover: 16, flipLift: 160,
    tolerance: 10, yawTolerance: 12, correctYaws: [0], flipValid: [false], requires: ['cpu'],
    footprint: [-26, 51, -62, 62], key: [40, 0, 157], startYaw: 90,
    hint: 'Colócalo sobre el procesador. El ventilador (punto dorado) debe empujar el aire hacia la salida trasera.',
    orientation: () => 'En este montaje de referencia, el ventilador debe empujar el aire hacia la salida trasera del gabinete. Gira el disipador.',
    flip: 'La base de contacto debe apoyarse sobre el procesador. Voltea el disipador.',
    dependency: 'Instala primero el procesador: el disipador se monta sobre él, con pasta térmica en medio.'
  },
  // Bloque de refrigeración líquida: la orientación de los tubos depende del
  // modelo y del gabinete, así que se aceptan los cuatro giros de 90°.
  aio: {
    label: 'el bloque de refrigeración', accepts: 'cooler', frame: 'board', hover: 14, flipLift: 36,
    tolerance: 8, yawTolerance: 12, correctYaws: [0, 90, 180, 270], flipValid: [false], requires: ['cpu'],
    footprint: [-30, 30, -30, 30], key: [26, 0, 36], startYaw: 45,
    hint: 'Colócalo sobre el procesador, alineado con los lados del socket. La orientación de los tubos la indica el manual de tu refrigeración.',
    orientation: () => 'Alinea el bloque con los lados del socket (gíralo hasta un múltiplo de 90°).',
    flip: 'La placa de contacto debe apoyarse sobre el procesador. Voltea el bloque.',
    dependency: 'Instala primero el procesador: el bloque se monta sobre él, con pasta térmica en medio.',
    note: () => 'Orienta los tubos según el manual de tu refrigeración y el espacio de tu gabinete.'
  },
  stock: {
    label: 'el disipador incluido', accepts: 'cooler', frame: 'board', hover: 14, flipLift: 45,
    tolerance: 8, yawTolerance: 12, correctYaws: [0, 90, 180, 270], flipValid: [false], requires: ['cpu'],
    footprint: [-36, 36, -36, 36], key: [39, 0, 11], startYaw: 45,
    hint: 'Colócalo sobre el procesador, alineado con los anclajes del socket. Deja el cable del ventilador cerca de la cabecera CPU_FAN.',
    orientation: () => 'Alinea la placa de anclaje con los lados del socket (gíralo hasta un múltiplo de 90°).',
    flip: 'La pasta preaplicada debe quedar hacia el procesador. Voltea el disipador.',
    dependency: 'Instala primero el procesador: el disipador se monta sobre él.'
  },
  ram: {
    label: 'el módulo de memoria', accepts: 'ram', frame: 'board', hover: 18, flipLift: 32,
    tolerance: 4, yawTolerance: 8, correctYaws: [0], flipValid: [false], requires: [],
    footprint: [-3.5, 3.5, -66.7, 66.7], key: [0, 5, 32], startYaw: 180,
    hint: 'Llévalo a una ranura DIMM recomendada. El punto dorado marca la muesca: debe coincidir con el saliente de la ranura.',
    orientation: d => (Math.abs(Math.abs(d) - 90) < 45 ? 'El módulo debe quedar alineado a lo largo de la ranura. Gíralo 90°.' : 'La muesca no coincide con el saliente de la ranura. Gira el módulo 180°.'),
    flip: 'Los contactos dorados deben entrar en la ranura. Voltea el módulo.'
  },
  m2: {
    label: 'el SSD M.2', accepts: 'm2', frame: 'board', hover: 10, flipLift: 2.5,
    tolerance: 6, yawTolerance: 10, correctYaws: [0], flipValid: [false], requires: [],
    footprint: [0, 80, -11, 11], key: [3, 0, 2.2], startYaw: 180,
    hint: 'Llévalo a la ranura M.2. Los contactos (punto dorado) apuntan al conector y el semicírculo al poste del tornillo.',
    orientation: () => 'Los contactos deben apuntar hacia el conector M.2 y el semicírculo hacia el poste del tornillo. Gira el SSD.',
    flip: 'Por la muesca Key M, el SSD solo entra con los componentes hacia arriba. Voltéalo.'
  },
  gpu: {
    label: 'la tarjeta gráfica', accepts: 'gpu', frame: 'board', hover: 24, flipLift: 116,
    tolerance: 8, yawTolerance: 10, correctYaws: [0], flipValid: [false], requires: [],
    footprint: [-12, 240, -40, 3], key: [-11, -18, 116], startYaw: 180,
    hint: 'Llévala a la ranura PCIe x16 principal. El soporte metálico (punto dorado) va hacia la parte trasera del gabinete.',
    orientation: () => 'El soporte metálico debe quedar hacia la parte trasera del gabinete, alineado con las ranuras de expansión. Gira la tarjeta.',
    flip: 'Los ventiladores de la tarjeta deben quedar hacia abajo. Voltéala.'
  },
  power: {
    label: 'la fuente', accepts: 'psu', frame: 'case', hover: 170,
    tolerance: 12, yawTolerance: 12, correctYaws: [0], flipValid: [false, true], requires: [],
    footprint: [-70, 70, -43, 43], key: [-66, 0, 76], startYaw: 180,
    hint: 'Llévala a la bahía de la fuente. El conector de red (punto dorado) debe quedar hacia la parte trasera.',
    orientation: () => 'El conector de red y el interruptor deben quedar hacia la parte trasera del gabinete. Gira la fuente 180°.',
    flip: '',
    note: flip => (flip ? 'Ventilador hacia arriba: úsalo si el gabinete no tiene entrada de aire inferior.' : 'Ventilador hacia abajo: requiere patas y filtro inferior en el gabinete.')
  }
};

// Ángulo con signo en (−180, 180].
export function angleDiff(a, b) {
  let d = ((a - b) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

const dist = (pose, m) => Math.hypot(pose.u - m.u, pose.v - m.v);

// pose: {u, v, yaw, flip}
// ctx: { mounts: [{id, accepts, u, v, name, recommended, reason}], installed: Set<partId>,
//        installedTypes: Set<ruleKey>, occupied: Map<mountId, partId>, partId, compatible?: (rule, mount) → string|null }
export function validate(ruleKey, pose, ctx) {
  const rule = RULES[ruleKey];
  if (!rule) return result('error', 'unknown', 'Esta pieza todavía no tiene reglas de montaje.');

  const missing = rule.requires.filter(r => !ctx.installedTypes?.has(r));
  if (missing.length) return result('error', 'dependency', rule.dependency || `Antes debes instalar: ${missing.join(', ')}.`);

  const same = ctx.mounts.filter(m => m.accepts === rule.accepts).map(m => ({ m, d: dist(pose, m) })).sort((a, b) => a.d - b.d);
  const target = same[0];
  if (!target || target.d > PROXIMITY) {
    const other = ctx.mounts.filter(m => m.accepts !== rule.accepts).map(m => ({ m, d: dist(pose, m) })).filter(x => x.d <= PROXIMITY).sort((a, b) => a.d - b.d)[0];
    if (other) return result('error', 'wrong-mount', `Esta zona es ${other.m.name}: no admite ${rule.label}.`, other.m);
    return result('far', 'far', `Suelta ${rule.label} sobre su zona de montaje resaltada.`);
  }
  const mount = target.m;
  const owner = ctx.occupied?.get(mount.id);
  if (owner && owner !== ctx.partId) return result('error', 'occupied', `${mount.name} ya está ocupada.`, mount);
  if (mount.recommended === false) return result('error', 'not-recommended', mount.reason || `${mount.name} no es la ubicación recomendada.`, mount);
  const incompatible = ctx.compatible?.(rule, mount);
  if (incompatible) return result('error', 'incompatible', incompatible, mount);

  if (target.d > rule.tolerance) return result('near', 'position', `Casi: centra ${rule.label} sobre ${mount.name} (a ${Math.round(target.d)} mm).`, mount, target.d);

  if (!rule.flipValid.includes(Boolean(pose.flip))) return result('near', 'flip', rule.flip, mount, target.d);
  const diffs = rule.correctYaws.map(y => angleDiff(pose.yaw, y));
  const best = diffs.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a));
  if (Math.abs(best) > rule.yawTolerance) return result('near', 'orientation', rule.orientation(best), mount, target.d);

  const snapYaw = rule.correctYaws[diffs.indexOf(best)];
  return { ...result('ok', 'ok', `${capitalize(rule.label)} encaja en ${mount.name}.`, mount, target.d), snapYaw, note: rule.note?.(Boolean(pose.flip)) || '' };
}

function result(severity, code, message, mount = null, distance = null) {
  return { ok: severity === 'ok', severity, code, message, mountId: mount?.id || null, distance };
}
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// Puntos de montaje en coordenadas del plano a partir de los de la placa.
export function boardMounts(mounts, layout) {
  const list = [
    { id: 'socket', accepts: 'cpu', u: mounts.socket.at[0], v: mounts.socket.at[1], z: mounts.socket.at[2], name: 'el socket' },
    { id: 'cooler', accepts: 'cooler', u: mounts.cooler.at[0], v: mounts.cooler.at[1], z: mounts.cooler.at[2], name: 'la zona del disipador' },
    { id: 'm2', accepts: 'm2', u: mounts.m2.at[0], v: mounts.m2.at[1], z: mounts.m2.at[2], name: 'la ranura M.2' }
  ];
  mounts.dimms.forEach((d, i) => list.push({
    id: `dimm-${i}`, accepts: 'ram', u: d.at[0], v: d.at[1], z: d.at[2], name: `la ranura ${d.name}`,
    recommended: d.recommended,
    reason: d.recommended ? undefined : layout.recommendedDimms.length === 1
      ? `Con un solo módulo, esta placa de referencia recomienda la ranura ${layout.dimmNames[layout.recommendedDimms[0]]}. En tu placa, confírmalo en el manual.`
      : `Con ${layout.recommendedDimms.length === 2 ? 'dos' : layout.recommendedDimms.length} módulos, esta placa de referencia recomienda las ranuras ${layout.recommendedDimms.map(n => layout.dimmNames[n]).join(' y ')}. En tu placa, confírmalo en el manual.`
  }));
  layout.pcie.forEach((s, i) => {
    const x16 = s.len >= 80;
    list.push({
      id: `pcie-${i}`, accepts: x16 ? 'gpu' : 'pcie-x1', u: 0, v: s.y, z: mounts.pcie.at[2], name: `la ranura ${s.name}`,
      recommended: x16 ? Boolean(s.primary) : undefined,
      reason: s.primary ? undefined : 'Usa la ranura PCIe x16 principal: suele ser la que tiene más líneas conectadas al procesador. Confírmalo en el manual.'
    });
  });
  return list;
}
