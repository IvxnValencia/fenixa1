// Sistema de interacción de ensamblaje: arrastre, rotación, zonas de montaje,
// encaje animado y desinstalación.
//
// Cómo funciona:
// · Cada pieza por instalar ("suelta") se coloca en una zona de espera fuera
//   del gabinete, a la altura de arrastre (`rule.hover`) sobre su plano de
//   montaje.
// · Al arrastrarla, el puntero se proyecta sobre ese plano (paralelo a la
//   placa). Una huella en la placa muestra dónde caería y se colorea con la
//   validación en vivo de mounting.js.
// · Al soltar se valida de verdad (posición, orientación, zona, dependencias).
//   Solo si es correcta se anima el encaje: primero se ajusta la posición y el
//   giro dentro de la tolerancia y después baja a lo largo de la normal.
//   Si no lo es, la pieza se queda donde se soltó y se explica el error.
import * as THREE from 'three';
import { RULES, validate, boardMounts } from './mounting.js';
import { tween, ease } from './animation.js';

export const RULE_FOR_TYPE = { cpu: 'cpu', cooler: 'cooler', ram: 'ram', storage: 'm2', gpu: 'gpu', power: 'power' };
const DEG = Math.PI / 180;

// Zona de espera de cada pieza (coordenadas u, v de su plano).
const STAGING = {
  cpu: [-95, 250], cooler: [-135, 70], 'ram-1': [300, 232], 'ram-2': [322, 232], m2: [282, 40], gpu: [-300, 150], psu: [120, 58.5]
};
// Al elegir una pieza, se "toma en la mano": se acerca a su zona con este
// desplazamiento respecto al punto de montaje (sin orientarla: eso es tarea del usuario).
const READY_OFFSET = { cpu: [0, 75], cooler: [150, 0], aio: [120, 0], stock: [120, 0], ram: [60, 0], m2: [0, -42], gpu: [0, -75], power: [210, 0] };

// compatibility: { [ruleKey]: mensaje | null } — incompatibilidades reales de la
// build (socket, memoria…) que impiden instalar esa pieza aunque esté bien colocada.
export function createAssembly({ engine, kit, pc, picker, onChange, compatibility = {} }) {
  const board = pc.parts.get('board');
  const layout = board.userData.layout;
  const psuPart = pc.parts.get('psu');
  const bay = psuPart ? { x: psuPart.userData.base.x, u: psuPart.userData.base.z, v: psuPart.userData.base.y } : null;

  // Marcos de montaje: placa (u = X, v = Y, normal +Z local) y lateral del gabinete (u = Z, v = Y, normal −X).
  const FRAMES = {
    board: {
      object: pc.frame,
      position: (u, v, h, z) => new THREE.Vector3(u, v, z + h),
      euler: (yaw, flipAngle) => new THREE.Euler(flipAngle, 0, yaw * DEG, 'ZXY'),
      plane: (h, z) => new THREE.Plane(new THREE.Vector3(0, 0, 1), -(z + h)),
      uv: p => [p.x, p.y]
    },
    case: {
      object: pc.root,
      position: (u, v, h) => new THREE.Vector3(bay.x - h, v, u),
      euler: (yaw, flipAngle) => new THREE.Euler(0, yaw * DEG, flipAngle, 'YZX'),
      plane: h => new THREE.Plane(new THREE.Vector3(1, 0, 0), -(bay.x - h)),
      uv: p => [p.z, p.y]
    }
  };

  const mounts = {
    board: boardMounts(board.userData.mounts, layout),
    case: bay ? [{ id: 'psu-bay', accepts: 'psu', u: bay.u, v: bay.v, z: 0, name: 'la bahía de la fuente' }] : []
  };

  // ------------------------------------------------------------ estado
  const entries = new Map();
  const occupied = new Map();
  for (const [id, part] of pc.parts) {
    const ruleKey = part.userData.ruleKey || RULE_FOR_TYPE[part.userData.type];
    if (!ruleKey || !STAGING[id]) continue;
    const rule = RULES[ruleKey];
    const frame = FRAMES[rule.frame];
    const list = mounts[rule.frame];
    const p = part.position;
    const [u, v] = rule.frame === 'board' ? [p.x, p.y] : [p.z, p.y];
    const mount = list.filter(m => m.accepts === rule.accepts).sort((a, b) => Math.hypot(a.u - u, a.v - v) - Math.hypot(b.u - u, b.v - v))[0];
    const entry = { id, part, ruleKey, rule, frame, mounts: list, installed: true, mountId: mount?.id, mountZ: mount?.z ?? 0, pose: { u, v, yaw: 0, flip: false, h: 0, flipAngle: 0 }, busy: false };
    entries.set(id, entry);
    if (mount) occupied.set(mount.id, id);
  }

  const installedTypes = () => new Set([...entries.values()].filter(e => e.installed).map(e => e.ruleKey));
  const ctxFor = entry => ({ mounts: entry.mounts, installedTypes: installedTypes(), occupied, partId: entry.id, compatible: () => compatibility[entry.ruleKey] || null });

  // Coloca cualquier objeto (la pieza real o el fantasma de la demostración)
  // según una pose del plano de montaje. `tilt` (grados) inclina la pieza
  // alrededor de su eje Y local, con pivote en su origen (inserción del M.2).
  const _tilt = new THREE.Quaternion(), _axisY = new THREE.Vector3(0, 1, 0);
  function poseObject(entry, object, pose, mountZ = entry.mountZ) {
    const { u, v, yaw, h, flipAngle = 0, tilt = 0 } = pose;
    // Volteada, la pieza se eleva su propia altura para no atravesar la placa.
    const lift = (entry.rule.flipLift || 0) * (flipAngle / Math.PI);
    object.position.copy(entry.frame.position(u, v, h + lift, mountZ));
    object.quaternion.setFromEuler(entry.frame.euler(yaw, flipAngle));
    if (tilt) object.quaternion.multiply(_tilt.setFromAxisAngle(_axisY, -tilt * DEG));
    engine.requestRender();
  }
  function applyPose(entry) { poseObject(entry, entry.part, entry.pose); }

  // ------------------------------------------------------------ visuales
  const zoneMat = {
    idle: new THREE.MeshBasicMaterial({ color: 0xa875ff, transparent: true, opacity: 0.22, depthWrite: false }),
    muted: new THREE.MeshBasicMaterial({ color: 0x8a84a0, transparent: true, opacity: 0.08, depthWrite: false }),
    ok: new THREE.MeshBasicMaterial({ color: 0x72e1ae, transparent: true, opacity: 0.45, depthWrite: false }),
    near: new THREE.MeshBasicMaterial({ color: 0xf5c67a, transparent: true, opacity: 0.4, depthWrite: false }),
    error: new THREE.MeshBasicMaterial({ color: 0xff8e9a, transparent: true, opacity: 0.45, depthWrite: false }),
    key: new THREE.MeshBasicMaterial({ color: 0xf2c14e, depthTest: true })
  };
  const visuals = new THREE.Group();
  visuals.name = 'Ayudas de montaje';
  const boardVisuals = new THREE.Group();
  pc.frame.add(boardVisuals);
  pc.root.add(visuals);

  // La zona usa la regla de la pieza real de la build (p. ej. bloque AIO en vez de torre).
  const ruleForAccepts = accepts => [...entries.values()].find(e => e.rule.accepts === accepts)?.rule || Object.values(RULES).find(r => r.accepts === accepts);
  const zones = new Map(); // mountId → { mesh, marker, accepts }
  for (const frameKey of ['board', 'case']) {
    for (const m of mounts[frameKey]) {
      const rule = ruleForAccepts(m.accepts);
      if (!rule) continue;
      const [x0, x1, y0, y1] = rule.footprint;
      let mesh, marker;
      if (frameKey === 'board') {
        mesh = kit.box(zoneMat.idle, m.u + x0, m.u + x1, m.v + y0, m.v + y1, m.z + 0.3, m.z + 1.1, { pickable: false });
        marker = kit.cyl(zoneMat.key, 4.2, 1.4, [m.u + rule.key[0], m.v + rule.key[1], m.z + 1.6], 'z', { pickable: false, low: true });
        boardVisuals.add(mesh, marker);
      } else {
        mesh = kit.box(zoneMat.idle, bay.x - 75, bay.x + 75, m.v + y0, m.v + y1, m.u + x0, m.u + x1, { pickable: false });
        marker = kit.cyl(zoneMat.key, 4.2, 1.4, [bay.x - 76, m.v + rule.key[1], m.u + rule.key[0]], 'x', { pickable: false, low: true });
        visuals.add(mesh, marker);
      }
      mesh.visible = marker.visible = false;
      mesh.renderOrder = marker.renderOrder = 2;
      zones.set(m.id, { mesh, marker, mount: m });
    }
  }

  // Huella proyectada de la pieza arrastrada.
  const shadow = { board: kit.box(zoneMat.muted, -0.5, 0.5, -0.5, 0.5, 0, 1, { pickable: false }), case: kit.box(zoneMat.muted, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, { pickable: false }) };
  boardVisuals.add(shadow.board);
  visuals.add(shadow.case);
  shadow.board.visible = shadow.case.visible = false;

  function placeShadow(entry, severity) {
    const s = shadow[entry.rule.frame];
    const other = shadow[entry.rule.frame === 'board' ? 'case' : 'board'];
    other.visible = false;
    const [x0, x1, y0, y1] = entry.rule.footprint;
    const { u, v, yaw } = entry.pose;
    const c = new THREE.Vector2((x0 + x1) / 2, (y0 + y1) / 2).rotateAround(new THREE.Vector2(), yaw * DEG);
    if (entry.rule.frame === 'board') {
      s.scale.set(x1 - x0, y1 - y0, 0.8);
      s.position.set(u + c.x, v + c.y, entry.mountZ + 0.7);
      s.rotation.set(0, 0, yaw * DEG);
    } else {
      // Rotación alrededor de Y: el eje u (Z mundo) se invierte al girar 180°.
      s.scale.set(150, y1 - y0, x1 - x0);
      const cu = Math.cos(yaw * DEG) * (x0 + x1) / 2;
      s.position.set(bay.x, v + (y0 + y1) / 2, u + cu);
      s.rotation.set(0, 0, 0);
    }
    s.material = zoneMat[{ ok: 'ok', near: 'near', error: 'error' }[severity] || 'muted'];
    s.visible = true;
  }

  // Marcadores dorados sobre las piezas (la "referencia de orientación").
  const partMarkers = [];
  for (const entry of entries.values()) {
    const [kx, ky, kz] = entry.rule.key;
    const marker = entry.rule.frame === 'board'
      ? kit.cyl(zoneMat.key, 4.2, 1.4, [kx, ky, kz], 'z', { low: true })
      : kit.cyl(zoneMat.key, 4.2, 1.4, [kz * -1 + 0, ky, kx], 'x', { low: true });
    marker.userData.baseMaterial = zoneMat.key;
    marker.visible = false;
    entry.part.add(marker);
    partMarkers.push(marker);
  }

  let focusEntry = null, lastResult = null;
  function showZones(entry) {
    zones.forEach(z => { z.mesh.visible = z.marker.visible = false; });
    if (!entry || entry.installed) return;
    zones.forEach((z, id) => {
      if (z.mount.accepts !== entry.rule.accepts) return;
      const free = !occupied.has(id) || occupied.get(id) === entry.id;
      const good = free && z.mount.recommended !== false;
      z.mesh.material = good ? zoneMat.idle : zoneMat.muted;
      z.mesh.visible = true;
      z.marker.visible = good;
    });
    engine.requestRender();
  }

  function paintTarget(result) {
    showZones(focusEntry);
    if (!result?.mountId) return;
    const z = zones.get(result.mountId);
    if (z) { z.mesh.visible = true; z.mesh.material = zoneMat[result.severity === 'ok' ? 'ok' : result.severity === 'near' ? 'near' : 'error']; }
  }

  // ------------------------------------------------------------ acciones
  function emit(extra = {}) {
    const all = [...entries.values()];
    onChange?.({ installed: all.filter(e => e.installed).length, total: all.length, ...extra });
  }

  function stage(entry, { keepOrientation = false } = {}) {
    const [u, v] = STAGING[entry.id];
    if (entry.mountId && occupied.get(entry.mountId) === entry.id) occupied.delete(entry.mountId);
    entry.installed = false;
    entry.mountId = null;
    entry.mountZ = entry.mounts.find(m => m.accepts === entry.rule.accepts)?.z ?? 0;
    entry.part.userData.loose = true;
    entry.pose = { u, v, h: entry.rule.hover, yaw: keepOrientation ? entry.pose.yaw : entry.rule.startYaw, flip: keepOrientation ? entry.pose.flip : false, flipAngle: keepOrientation ? entry.pose.flipAngle : 0 };
    applyPose(entry);
  }

  function install(entry, mount, snapYaw) {
    entry.installed = true;
    entry.mountId = mount.id;
    entry.mountZ = mount.z;
    occupied.set(mount.id, entry.id);
    entry.part.userData.loose = false;
    entry.pose = { ...entry.pose, u: mount.u, v: mount.v, yaw: snapYaw, h: 0 };
    applyPose(entry);
    entry.part.userData.base.copy(entry.part.position);
  }

  const api = {
    entries,
    isLoose: part => Boolean(entries.get(part?.userData.id) && !entries.get(part.userData.id).installed),
    entryOf: part => entries.get(part?.userData.id) || null,
    mountName: entry => entry.mounts.find(m => m.id === entry.mountId)?.name || '',

    setVisible(on) {
      partMarkers.forEach(m => { m.visible = on; });
      if (!on) { showZones(null); shadow.board.visible = shadow.case.visible = false; }
      engine.requestRender();
    },

    // Con una pieza suelta seleccionada se muestran sus zonas y la huella de
    // dónde caería, coloreada con la validación actual.
    focus(part) {
      focusEntry = api.entryOf(part);
      showZones(focusEntry);
      if (focusEntry && !focusEntry.installed) api.preview(focusEntry);
      else shadow.board.visible = shadow.case.visible = false;
    },

    startFresh() {
      entries.forEach(e => stage(e));
      showZones(focusEntry);
      emit({ message: 'Todas las piezas están en la zona de espera. Elige una y arrástrala a su lugar.' });
    },

    // Restaura un avance guardado { partId: mountId }. Solo acepta puntos que
    // existan y admitan la pieza, sin incompatibilidades, y respeta las
    // dependencias (el disipador solo si el CPU queda instalado).
    restore(map = {}) {
      entries.forEach(e => stage(e));
      const ordered = [...entries.values()].sort((a, b) => a.rule.requires.length - b.rule.requires.length);
      for (const e of ordered) {
        const m = e.mounts.find(x => x.id === map[e.id] && x.accepts === e.rule.accepts);
        if (!m || compatibility[e.ruleKey] || occupied.has(m.id)) continue;
        if (e.rule.requires.some(r => ![...entries.values()].some(o => o.installed && o.ruleKey === r))) continue;
        install(e, m, e.rule.correctYaws[0]);
      }
      showZones(focusEntry);
      emit({ restored: true });
    },
    installedMap() {
      const out = {};
      entries.forEach(e => { if (e.installed && e.mountId) out[e.id] = e.mountId; });
      return out;
    },

    installAll() {
      entries.forEach(e => {
        const m = e.mounts.find(x => x.accepts === e.rule.accepts && x.recommended !== false && (!occupied.has(x.id) || occupied.get(x.id) === e.id));
        if (m) install(e, m, e.rule.correctYaws[0]);
      });
      showZones(focusEntry);
      emit({ message: 'Todas las piezas están instaladas.' });
    },

    // Acerca la pieza suelta a su zona (primer punto libre y recomendado) y
    // devuelve la caja que conviene encuadrar: zonas válidas + pieza.
    present(part) {
      const entry = api.entryOf(part);
      if (!entry || entry.installed || entry.busy) return null;
      const target = entry.mounts.find(m => m.accepts === entry.rule.accepts && m.recommended !== false && (!occupied.has(m.id) || occupied.get(m.id) === entry.id));
      if (!target) return null;
      const [du, dv] = READY_OFFSET[entry.ruleKey] || [0, 60];
      const from = { u: entry.pose.u, v: entry.pose.v };
      const to = { u: target.u + du, v: target.v + dv };
      // Caja final: se calcula con la pieza ya en su destino y se restaura antes de animar.
      Object.assign(entry.pose, to);
      applyPose(entry);
      const box = new THREE.Box3().setFromObject(entry.part);
      zones.forEach(z => { if (z.mesh.visible && z.mesh.material === zoneMat.idle) box.expandByObject(z.mesh); });
      Object.assign(entry.pose, from);
      applyPose(entry);
      entry.busy = true;
      tween(engine, {
        duration: 0.5,
        update: k => { entry.pose.u = from.u + (to.u - from.u) * k; entry.pose.v = from.v + (to.v - from.v) * k; applyPose(entry); },
        done: () => { entry.busy = false; if (focusEntry === entry) api.preview(entry); }
      });
      return box;
    },

    // --- arrastre
    beginDrag(part, clientX, clientY) {
      const entry = api.entryOf(part);
      if (!entry || entry.installed || entry.busy) return false;
      const hit = api.planeHit(entry, clientX, clientY);
      if (!hit) return false;
      entry.drag = { du: entry.pose.u - hit[0], dv: entry.pose.v - hit[1] };
      focusEntry = entry;
      showZones(entry);
      return true;
    },

    planeHit(entry, clientX, clientY) {
      const ray = picker.rayAt(clientX, clientY).clone();
      const obj = entry.frame.object;
      obj.updateWorldMatrix(true, false);
      ray.applyMatrix4(new THREE.Matrix4().copy(obj.matrixWorld).invert());
      const p = ray.intersectPlane(entry.frame.plane(entry.pose.h, entry.mountZ), new THREE.Vector3());
      return p ? entry.frame.uv(p) : null;
    },

    dragTo(part, clientX, clientY) {
      const entry = api.entryOf(part);
      if (!entry?.drag) return null;
      const hit = api.planeHit(entry, clientX, clientY);
      if (!hit) return lastResult;
      entry.pose.u = hit[0] + entry.drag.du;
      entry.pose.v = hit[1] + entry.drag.dv;
      applyPose(entry);
      return api.preview(entry);
    },

    preview(entry) {
      lastResult = validate(entry.ruleKey, entry.pose, ctxFor(entry));
      placeShadow(entry, lastResult.severity);
      paintTarget(lastResult);
      return lastResult;
    },

    // Suelta la pieza: valida y, si es correcta, la encaja.
    drop(part) {
      const entry = api.entryOf(part);
      if (!entry || entry.installed || entry.busy) return Promise.resolve(null);
      entry.drag = null;
      const result = validate(entry.ruleKey, entry.pose, ctxFor(entry));
      lastResult = result;
      if (!result.ok) {
        placeShadow(entry, result.severity);
        paintTarget(result);
        return Promise.resolve(result);
      }
      shadow.board.visible = shadow.case.visible = false;
      const mount = entry.mounts.find(m => m.id === result.mountId);
      return api.animateInstall(entry, mount, result.snapYaw).then(() => {
        showZones(null);
        emit({ message: [result.message, result.note].filter(Boolean).join(' '), installedId: entry.id });
        return result;
      });
    },

    animateInstall(entry, mount, snapYaw) {
      entry.busy = true;
      const from = { ...entry.pose };
      // Lleva el giro al equivalente más cercano para no dar vueltas de más.
      const targetYaw = from.yaw + (((snapYaw - from.yaw) % 360 + 540) % 360 - 180);
      return new Promise(resolve => {
        tween(engine, {
          duration: 0.75, easing: ease.linear,
          update: k => {
            const a = ease.inOut(Math.min(1, k / 0.45));
            const b = ease.inOut(Math.max(0, (k - 0.45) / 0.55));
            entry.pose.u = from.u + (mount.u - from.u) * a;
            entry.pose.v = from.v + (mount.v - from.v) * a;
            entry.pose.yaw = from.yaw + (targetYaw - from.yaw) * a;
            entry.pose.h = from.h * (1 - b);
            applyPose(entry);
          },
          done: () => { install(entry, mount, snapYaw); entry.busy = false; resolve(); }
        });
      });
    },

    uninstall(part) {
      const entry = api.entryOf(part);
      if (!entry?.installed || entry.busy) return Promise.resolve({ ok: false, message: '' });
      const dependents = [...entries.values()].filter(e => e.installed && e.rule.requires.includes(entry.ruleKey));
      if (dependents.length) return Promise.resolve({ ok: false, message: `Retira primero ${dependents.map(d => d.rule.label).join(' y ')}: va montado sobre ${entry.rule.label}.` });
      entry.busy = true;
      if (occupied.get(entry.mountId) === entry.id) occupied.delete(entry.mountId);
      entry.installed = false;
      entry.part.userData.loose = true;
      const from = { ...entry.pose };
      const [su, sv] = STAGING[entry.id];
      return new Promise(resolve => {
        tween(engine, {
          duration: 0.7, easing: ease.linear,
          update: k => {
            const a = ease.inOut(Math.min(1, k / 0.45));
            const b = ease.inOut(Math.max(0, (k - 0.45) / 0.55));
            entry.pose.h = entry.rule.hover * a;
            entry.pose.u = from.u + (su - from.u) * b;
            entry.pose.v = from.v + (sv - from.v) * b;
            applyPose(entry);
          },
          done: () => { stage(entry, { keepOrientation: true }); entry.busy = false; emit({ message: `${entry.part.userData.name}: desinstalada.`, uninstalledId: entry.id }); resolve({ ok: true }); }
        });
      });
    },

    // --- rotación
    rotate(part, deg) {
      const entry = api.entryOf(part);
      if (!entry || entry.installed || entry.busy) return null;
      const from = entry.pose.yaw, to = from + deg;
      entry.busy = true;
      tween(engine, { duration: 0.18, update: k => { entry.pose.yaw = from + (to - from) * k; applyPose(entry); }, done: () => { entry.pose.yaw = to; entry.busy = false; applyPose(entry); api.preview(entry); } });
      return entry;
    },

    flip(part) {
      const entry = api.entryOf(part);
      if (!entry || entry.installed || entry.busy) return null;
      const from = entry.pose.flipAngle, to = entry.pose.flip ? 0 : Math.PI;
      entry.busy = true;
      tween(engine, { duration: 0.3, update: k => { entry.pose.flipAngle = from + (to - from) * k; applyPose(entry); }, done: () => { entry.pose.flip = !entry.pose.flip; entry.pose.flipAngle = to; entry.busy = false; applyPose(entry); api.preview(entry); } });
      return entry;
    },

    // Movimiento por teclado (accesibilidad): desplaza la pieza en el plano.
    nudge(part, du, dv) {
      const entry = api.entryOf(part);
      if (!entry || entry.installed || entry.busy) return null;
      entry.pose.u += du;
      entry.pose.v += dv;
      applyPose(entry);
      return api.preview(entry);
    },

    // --- apoyo para la demostración (no cambia el estado de montaje)
    poseObject,
    // Destino y pose inicial de la demostración: el punto donde está instalada
    // la pieza o, si está suelta, el primer punto libre y recomendado.
    demoPlan(entry) {
      const target = (entry.installed && entry.mounts.find(m => m.id === entry.mountId))
        || entry.mounts.find(m => m.accepts === entry.rule.accepts && m.recommended !== false && (!occupied.has(m.id) || occupied.get(m.id) === entry.id))
        || entry.mounts.find(m => m.accepts === entry.rule.accepts);
      if (!target) return null;
      const [du, dv] = READY_OFFSET[entry.ruleKey] || [0, 60];
      return {
        target,
        start: { u: target.u + du, v: target.v + dv, yaw: entry.rule.startYaw, h: entry.rule.hover, flipAngle: 0 },
        end: { u: target.u, v: target.v, yaw: entry.rule.correctYaws[0], h: 0, flipAngle: 0 }
      };
    },
    // Resalta la zona de destino de la demostración (y su marca dorada).
    highlightZone(mountId) {
      zones.forEach((z, id) => { const on = id === mountId; z.mesh.visible = z.marker.visible = on; if (on) z.mesh.material = zoneMat.idle; });
      shadow.board.visible = shadow.case.visible = false;
      engine.requestRender();
    },

    progress() {
      const all = [...entries.values()];
      return { installed: all.filter(e => e.installed).length, total: all.length };
    },

    dispose() {
      Object.values(zoneMat).forEach(m => m.dispose());
      partMarkers.forEach(m => m.removeFromParent());
      boardVisuals.removeFromParent();
      visuals.removeFromParent();
    }
  };
  return api;
}
