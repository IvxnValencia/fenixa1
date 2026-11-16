// Modalidad B: asistencia visual en bucle.
//
// La demostración anima un FANTASMA (copia visual) de la pieza, nunca la pieza
// real: no cambia el estado de montaje, no marca pasos y no completa nada en el
// simulador. Mientras se reproduce, la pieza real se oculta y al detenerse
// vuelve exactamente como estaba.
//
// Cada demostración es una secuencia de etapas (sujetar, orientar, acercar,
// insertar, fijar, listo) con un texto que describe el movimiento físico
// correcto. Las secuencias evitan enseñar movimientos incorrectos: el CPU se
// baja en vertical y se suelta, la RAM se presiona por ambos extremos, el M.2
// entra inclinado y luego se baja, la gráfica entra en vertical.
import * as THREE from 'three';

// Puntos de sujeción y de fijación en coordenadas locales de cada pieza.
export const DEMOS = {
  cpu: {
    grip: [[-20, 0, 2.6], [20, 0, 2.6]], fix: [[-29, 0, 4]],
    text: {
      grip: 'Sujeta el procesador por los bordes. No toques los contactos.',
      orient: 'Gíralo hasta que la marca triangular coincida con la del socket.',
      move: 'Llévalo justo encima del socket, en horizontal.',
      insert: 'Bájalo en vertical y suéltalo: encaja por su propio peso. Sin presionar ni deslizar.',
      fix: 'Baja la palanca de retención para fijarlo.'
    }
  },
  ram: {
    grip: [[0, -60, 31.5], [0, 60, 31.5]],
    text: {
      grip: 'Sujeta el módulo por los extremos superiores. No toques los contactos dorados.',
      orient: 'Gíralo hasta que la muesca coincida con el saliente de la ranura.',
      move: 'Colócalo alineado sobre la ranura recomendada, con los seguros abiertos.',
      insert: 'Presiona ambos extremos a la vez, en vertical, hasta que los seguros cierren con un clic.'
    }
  },
  m2: {
    grip: [[62, -11, 1], [62, 11, 1]], fix: [[80, 0, 1.5]], tilt: 25,
    text: {
      grip: 'Sujeta el SSD por los bordes, lejos de los contactos.',
      orient: 'Contactos hacia el conector y semicírculo hacia el poste del tornillo.',
      move: 'Acércalo al conector M.2.',
      insert: 'Insértalo inclinado (unos 20–30°) hasta el fondo del conector.',
      press: 'Bájalo con suavidad hasta apoyarlo en el poste.',
      fix: 'Fíjalo con su tornillo o seguro, sin apretar en exceso.'
    }
  },
  gpu: {
    grip: [[40, 0, 108], [200, 0, 108]], fix: [[-11, -10, 112]],
    text: {
      grip: 'Sujeta la tarjeta por el borde superior y el soporte metálico.',
      orient: 'El soporte metálico va hacia la parte trasera del gabinete.',
      move: 'Alinea el conector sobre la ranura PCIe x16 principal, con el seguro abierto.',
      insert: 'Insértala en vertical, con presión uniforme, hasta que el seguro de la ranura cierre.',
      fix: 'Atornilla el soporte trasero al gabinete.'
    }
  },
  cooler: {
    grip: [[0, -62, 90], [0, 62, 90]], fix: [[-42, 0, 2.5], [42, 0, 2.5]],
    text: {
      grip: 'Sujeta el disipador por el cuerpo de aletas, con la película de la base ya retirada.',
      orient: 'Oriéntalo para que el ventilador empuje el aire hacia la salida trasera.',
      move: 'Colócalo sobre el procesador (con pasta térmica en el centro).',
      insert: 'Bájalo en vertical sobre el procesador, sin deslizarlo para no correr la pasta.',
      fix: 'Aprieta los tornillos poco a poco y de forma alterna.'
    }
  },
  aio: {
    grip: [[-30, 0, 18], [30, 0, 18]], fix: [[-38, 0, 2.5], [38, 0, 2.5]],
    text: {
      grip: 'Sujeta el bloque por los lados, sin tirar de los tubos.',
      orient: 'Alinéalo con los lados del socket; la dirección de los tubos la indica su manual.',
      move: 'Colócalo sobre el procesador (con pasta térmica si no viene preaplicada).',
      insert: 'Bájalo en vertical sobre el procesador, sin deslizarlo.',
      fix: 'Aprieta los tornillos poco a poco y de forma alterna.'
    }
  },
  stock: {
    grip: [[-40, 0, 36], [40, 0, 36]], fix: [[-33, -33, 3.5], [33, 33, 3.5], [-33, 33, 3.5], [33, -33, 3.5]],
    text: {
      grip: 'Sujeta el disipador por la carcasa. No toques la pasta preaplicada.',
      orient: 'Alinea la placa de anclaje con los lados del socket.',
      move: 'Colócalo sobre el procesador.',
      insert: 'Bájalo en vertical, sin deslizarlo para no correr la pasta.',
      fix: 'Fíjalo apretando en cruz, poco a poco.'
    }
  },
  power: {
    grip: [[-75, 30, 40], [-75, 30, -40]], fix: [[-60, 30, -71], [60, 30, -71], [-60, -30, -71], [60, -30, -71]],
    text: {
      grip: 'Sujeta la fuente por la carcasa. Nunca la abras.',
      orient: 'Conector de red hacia atrás; ventilador hacia una entrada de aire.',
      move: 'Acércala a la bahía de la fuente.',
      insert: 'Deslízala en la bahía hasta apoyarla en la pared trasera.',
      fix: 'Fíjala con sus tornillos desde la parte trasera.'
    }
  }
};

// Etapas en orden; algunas solo existen para ciertas piezas.
function phasesFor(ruleKey) {
  const d = DEMOS[ruleKey];
  const list = [
    { key: 'grip', duration: 1.4 },
    { key: 'orient', duration: 1.3 },
    { key: 'move', duration: 1.3 },
    { key: 'insert', duration: 1.4 }
  ];
  if (d.tilt) list.push({ key: 'press', duration: 1.0 });
  if (d.fix?.length) list.push({ key: 'fix', duration: 1.2 });
  list.push({ key: 'done', duration: 1.6 });
  return list.map(p => ({ ...p, text: p.key === 'done' ? 'Así queda instalada. Ahora hazlo tú con la pieza real.' : d.text[p.key] }));
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;

// Copia visual de una pieza: comparte geometrías y usa materiales tintados
// (cacheados por el kit). Los InstancedMesh copian su matriz de instancias.
function ghostOf(kit, object) {
  let copy;
  if (object.isInstancedMesh) {
    copy = new THREE.InstancedMesh(object.geometry, kit.look(object.userData.baseMaterial || object.material, 'hover'), object.count);
    copy.instanceMatrix.copy(object.instanceMatrix);
    copy.boundingSphere = object.boundingSphere?.clone() || null;
    copy.boundingBox = object.boundingBox?.clone() || null;
  } else if (object.isMesh) {
    copy = new THREE.Mesh(object.geometry, kit.look(object.userData.baseMaterial || object.material, 'hover'));
  } else copy = new THREE.Group();
  copy.position.copy(object.position);
  copy.quaternion.copy(object.quaternion);
  copy.scale.copy(object.scale);
  copy.visible = object.visible;
  copy.userData.pickable = false;
  object.children.forEach(child => copy.add(ghostOf(kit, child)));
  return copy;
}

export function createDemo({ engine, kit, assembly, onPhase, onState }) {
  const markerGeo = new THREE.SphereGeometry(1, 16, 12);
  const gripMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.9, depthTest: false });
  const fixMat = new THREE.MeshBasicMaterial({ color: 0xf2c14e, transparent: true, opacity: 0.95, depthTest: false });
  let current = null; // { entry, ghost, plan, phases, index, t, grips[], fixes[] }
  let paused = false, speed = 1, removeTicker = null;
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function marker(material, at, radius) {
    const m = new THREE.Mesh(markerGeo, material);
    m.position.set(at[0], at[1], at[2]);
    m.scale.setScalar(radius);
    m.renderOrder = 5;
    m.userData.pickable = false;
    return m;
  }

  function apply() {
    const c = current;
    const { start, end } = c.plan;
    const d = DEMOS[c.entry.ruleKey];
    const phase = c.phases[c.index].key;
    const k = ease(Math.min(1, c.t / c.phases[c.index].duration));
    const idx = key => c.phases.findIndex(p => p.key === key);
    const after = key => c.index > idx(key);
    // Pose acumulada según las etapas ya completadas.
    const pose = { ...start };
    if (after('orient') || phase === 'orient') pose.yaw = phase === 'orient' ? lerp(start.yaw, end.yaw, k) : end.yaw;
    if (after('move') || phase === 'move') {
      const m = phase === 'move' ? k : 1;
      // El M.2 se acerca ya inclinado y algo retrasado respecto al conector.
      const back = d.tilt ? 10 : 0;
      pose.u = lerp(start.u, end.u - back, m);
      pose.v = lerp(start.v, end.v, m);
      if (d.tilt) { pose.tilt = d.tilt * m; pose.h = lerp(start.h, 4, m); }
    }
    if (after('insert') || phase === 'insert') {
      const m = phase === 'insert' ? k : 1;
      if (d.tilt) { pose.u = lerp(end.u - 10, end.u, m); pose.h = lerp(4, 2, m); pose.tilt = d.tilt; }
      else pose.h = lerp(start.h, 0, m);
    }
    if (d.tilt && (after('press') || phase === 'press')) {
      const m = phase === 'press' ? k : 1;
      pose.u = end.u; pose.tilt = lerp(d.tilt, 0, m); pose.h = lerp(2, 0, m);
    }
    assembly.poseObject(c.entry, c.ghost, pose, c.plan.target.z ?? c.entry.mountZ);

    // Marcadores: sujeción (latido) hasta insertar; fijación (destello por turnos).
    const pulse = 1 + 0.25 * Math.sin(performance.now() / 160);
    const showGrip = ['grip', 'orient', 'move', 'insert', 'press'].includes(phase);
    c.grips.forEach(g => { g.visible = showGrip; g.scale.setScalar(3.2 * (phase === 'grip' ? pulse : 1)); });
    c.fixes.forEach((f, i) => {
      const active = phase === 'fix' && Math.floor(k * c.fixes.length * 0.999) === i;
      f.visible = phase === 'fix' || phase === 'done';
      f.scale.setScalar(active ? 4 * pulse : 2.6);
    });
  }

  function tick(dt) {
    if (!current || paused) return false;
    const c = current;
    c.t += dt * speed;
    const ph = c.phases[c.index];
    if (c.t >= ph.duration) {
      c.t = 0;
      c.index = (c.index + 1) % c.phases.length; // bucle: vuelve a empezar
      onPhase?.(c.index, c.phases[c.index]);
    }
    apply();
    return true;
  }

  function start() {
    removeTicker?.();
    removeTicker = paused ? null : engine.addTicker(tick);
    onState?.({ playing: !paused, speed });
  }

  return {
    get active() { return Boolean(current); },
    get playing() { return Boolean(current) && !paused; },
    get speed() { return speed; },
    phases: () => current?.phases || [],
    phaseIndex: () => current?.index ?? -1,
    partId: () => current?.entry.id || null,

    // Devuelve la caja a encuadrar, o null si la pieza no tiene demostración.
    play(entry) {
      this.stop();
      if (!entry || !DEMOS[entry.ruleKey]) return null;
      const plan = assembly.demoPlan(entry);
      if (!plan) return null;
      const ghost = ghostOf(kit, entry.part);
      ghost.name = `Demostración · ${entry.part.userData.name}`;
      entry.part.parent.add(ghost);
      entry.part.userData.hiddenByDemo = true;
      entry.part.visible = false;
      const d = DEMOS[entry.ruleKey];
      const grips = (d.grip || []).map(at => marker(gripMat, at, 3.2));
      const fixes = (d.fix || []).map(at => marker(fixMat, at, 2.6));
      [...grips, ...fixes].forEach(m => ghost.add(m));
      current = { entry, ghost, plan, phases: phasesFor(entry.ruleKey), index: 0, t: 0, grips, fixes };
      assembly.highlightZone(plan.target.id);
      // Caja de encuadre: posición inicial y final del fantasma.
      apply();
      const box = new THREE.Box3().setFromObject(ghost);
      assembly.poseObject(entry, ghost, plan.end, plan.target.z ?? entry.mountZ);
      box.expandByObject(ghost);
      apply();
      paused = reducedMotion(); // con movimiento reducido, empieza en pausa
      onPhase?.(0, current.phases[0]);
      start();
      return box;
    },

    pause() { if (!current) return; paused = true; start(); },
    resume() { if (!current) return; paused = false; start(); },
    toggle() { paused ? this.resume() : this.pause(); },
    restart() {
      if (!current) return;
      current.index = 0; current.t = 0;
      onPhase?.(0, current.phases[0]);
      apply();
      start();
      engine.requestRender();
    },
    setSpeed(value) { speed = value; onState?.({ playing: !paused, speed }); },

    stop() {
      removeTicker?.();
      removeTicker = null;
      if (!current) return;
      const { entry, ghost } = current;
      ghost.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
      ghost.removeFromParent();
      entry.part.userData.hiddenByDemo = false;
      entry.part.visible = !entry.part.userData.hiddenByUser;
      assembly.highlightZone(null);
      current = null;
      engine.requestRender();
      onState?.({ playing: false, speed });
    },

    dispose() {
      this.stop();
      markerGeo.dispose();
      gripMat.dispose();
      fixMat.dispose();
    }
  };
}
