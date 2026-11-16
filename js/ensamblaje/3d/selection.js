// Sistema de selección 3D.
//
// · pick() devuelve TODAS las piezas bajo el cursor, ordenadas de delante hacia
//   atrás, sin repetir. Así la interfaz puede recorrer piezas superpuestas
//   (clic repetido en el mismo punto = pieza siguiente hacia atrás).
// · Ignora mallas marcadas como no seleccionables (p. ej. el vidrio lateral),
//   objetos ocultos y piezas que el filtro excluya (p. ej. atenuadas).
import * as THREE from 'three';

export function partOf(object) {
  let o = object;
  while (o && !o.userData.isPart) o = o.parent;
  return o || null;
}

function visibleChain(object, root) {
  for (let o = object; o; o = o.parent) {
    if (!o.visible) return false;
    if (o === root) return true;
  }
  return true;
}

export class Picker {
  constructor(engine, root, { filter = () => true } = {}) {
    this.engine = engine;
    this.root = root;
    this.filter = filter;
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
  }

  // Rayo desde la cámara a través del punto de pantalla (lo usa también el arrastre).
  rayAt(clientX, clientY) {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.engine.camera);
    return this.raycaster.ray;
  }

  pick(clientX, clientY) {
    this.rayAt(clientX, clientY);
    const hits = this.raycaster.intersectObject(this.root, true);
    const result = [];
    for (const hit of hits) {
      const obj = hit.object;
      if (obj.userData.pickable === false || !visibleChain(obj, this.root)) continue;
      const part = partOf(obj);
      if (!part || result.includes(part) || !this.filter(part)) continue;
      result.push(part);
    }
    return result;
  }
}

// Aplica el aspecto visual de una pieza según su estado.
// Prioridad: atenuada > inspeccionada (colores reales) > seleccionada > resaltada (hover) > normal.
export function applyLook(kit, part) {
  const s = part.userData.state || {};
  const kind = s.dimmed ? 'ghost' : s.error ? 'error' : s.inspected ? 'base' : s.selected ? 'selected' : s.hover ? 'hover' : 'base';
  part.traverse(o => {
    if (o.userData.baseMaterial) o.material = kit.look(o.userData.baseMaterial, kind);
  });
}
