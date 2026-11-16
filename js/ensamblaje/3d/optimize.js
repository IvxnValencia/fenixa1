// Optimización de geometrías: fusiona las mallas estáticas de cada pieza que
// comparten material en una sola malla (menos llamadas de dibujo).
//
// No se fusionan: mallas instanciadas (ya son una sola llamada), transparentes
// (necesitan orden de dibujo propio), no seleccionables (vidrio) ni paneles que
// se ocultan con "Ver interior". Selección, resaltado, etiquetas y fantasma de
// la demostración siguen funcionando porque trabajan por pieza y por material.
import * as THREE from 'three';

const ATTRS = ['position', 'normal', 'uv'];

// Fusiona geometrías indexadas con los mismos atributos (las de kit.js lo son).
function mergeIndexed(geometries) {
  if (!geometries.every(g => g.index && ATTRS.every(a => g.getAttribute(a)) && Object.keys(g.attributes).length === ATTRS.length)) return null;
  let vertices = 0, indices = 0;
  for (const g of geometries) { vertices += g.getAttribute('position').count; indices += g.index.count; }
  const out = new THREE.BufferGeometry();
  const arrays = Object.fromEntries(ATTRS.map(a => [a, new Float32Array(vertices * geometries[0].getAttribute(a).itemSize)]));
  const index = new (vertices > 65535 ? Uint32Array : Uint16Array)(indices);
  let vOff = 0, iOff = 0;
  for (const g of geometries) {
    for (const a of ATTRS) {
      const attr = g.getAttribute(a);
      arrays[a].set(attr.array.subarray(0, attr.count * attr.itemSize), vOff * attr.itemSize);
    }
    const src = g.index.array;
    for (let i = 0; i < g.index.count; i++) index[iOff + i] = src[i] + vOff;
    vOff += g.getAttribute('position').count;
    iOff += g.index.count;
  }
  for (const a of ATTRS) out.setAttribute(a, new THREE.BufferAttribute(arrays[a], geometries[0].getAttribute(a).itemSize));
  out.setIndex(new THREE.BufferAttribute(index, 1));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

export function mergeStaticMeshes(part) {
  part.updateMatrixWorld(true);
  const toPart = new THREE.Matrix4().copy(part.matrixWorld).invert();
  const groups = new Map();
  part.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || !o.visible) return;
    if (o.userData.pickable === false || o.userData.panel) return;
    const material = o.userData.baseMaterial || o.material;
    if (material.transparent) return;
    if (!groups.has(material)) groups.set(material, []);
    groups.get(material).push(o);
  });
  let saved = 0;
  const m = new THREE.Matrix4();
  for (const [material, meshes] of groups) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(mesh => mesh.geometry.clone().applyMatrix4(m.multiplyMatrices(toPart, mesh.matrixWorld)));
    const merged = mergeIndexed(geometries);
    geometries.forEach(g => g.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, material);
    mesh.name = `${meshes.length} mallas fusionadas`;
    mesh.userData.baseMaterial = material;
    mesh.userData.ownsGeometry = true; // la libera el motor al cerrar
    part.add(mesh);
    meshes.forEach(x => x.removeFromParent());
    saved += meshes.length - 1;
  }
  return saved;
}
