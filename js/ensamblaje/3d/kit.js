// Kit de geometrías y materiales compartidos para los modelos procedurales.
//
// Rendimiento: todas las cajas usan UNA BoxGeometry unitaria escalada por malla,
// y todos los cilindros una CylinderGeometry unitaria. Los materiales se crean
// una vez por visor y se reutilizan. Las variantes de resaltado se cachean por
// material base. Todo lo creado aquí se libera con kit.dispose().
//
// Unidades de escena: milímetros.
import * as THREE from 'three';

export function createKit() {
  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 28),
    cylLow: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
    tube: new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 1, true),
    triangle: (() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0); shape.lineTo(1, 0); shape.lineTo(0, 1); shape.closePath();
      return new THREE.ShapeGeometry(shape);
    })()
  };

  const std = (color, roughness = 0.6, metalness = 0, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

  // Paleta de maqueta: los modelos son genéricos y deben verse como tales.
  const mat = {
    pcb: std(0x1c2030, 0.82),
    pcbGreen: std(0x1f3a2c, 0.8),
    slot: std(0x14141a, 0.7),
    plastic: std(0x24232c, 0.72),
    plasticLight: std(0x3b3947, 0.66),
    caseBody: std(0x2a2933, 0.58, 0.15),
    caseInner: std(0x1d1c24, 0.75, 0.1),
    metal: std(0x9aa3b2, 0.36, 0.62),
    darkMetal: std(0x454a57, 0.45, 0.55),
    aluminium: std(0xb8bec9, 0.32, 0.55),
    copper: std(0xc07a4a, 0.32, 0.75),
    gold: std(0xd4a94a, 0.3, 0.8),
    brass: std(0xb99a52, 0.38, 0.7),
    accent: std(0xa875ff, 0.48, 0.05),
    accentDark: std(0x5d3fa0, 0.55, 0.05),
    fanBlade: std(0x4a4757, 0.6),
    sticker: std(0xe8e4f0, 0.8),
    rubber: std(0x0f0f12, 0.9),
    glass: new THREE.MeshStandardMaterial({ color: 0xa9b8d6, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }),
    shell: std(0x4a4757, 0.6, 0.05, { side: THREE.DoubleSide }),
    marker: std(0xf2c14e, 0.35, 0.4, { side: THREE.DoubleSide })
  };

  // Material "fantasma" para atenuar piezas durante la inspección.
  const ghost = new THREE.MeshBasicMaterial({ color: 0x8a84a0, transparent: true, opacity: 0.07, depthWrite: false });

  // Variantes de resaltado cacheadas por material base.
  const looks = new Map();
  function look(base, kind) {
    if (kind === 'base' || !base) return base;
    if (kind === 'ghost') return ghost;
    let entry = looks.get(base);
    if (!entry) { entry = {}; looks.set(base, entry); }
    if (!entry[kind]) {
      const m = base.clone();
      if ('emissive' in m) {
        m.emissive = new THREE.Color(kind === 'error' ? 0xff4d6a : 0xa875ff);
        m.emissiveIntensity = kind === 'error' ? 0.6 : kind === 'selected' ? 0.42 : 0.2;
      } else if (kind === 'error' && m.color) {
        m.color = new THREE.Color(0xff4d6a);
      }
      if (m.transparent && kind === 'selected') m.opacity = Math.min(1, m.opacity + 0.1);
      entry[kind] = m;
    }
    return entry[kind];
  }

  function tag(mesh, opts) {
    mesh.userData.baseMaterial = mesh.material;
    if (opts.pickable === false) mesh.userData.pickable = false;
    if (opts.name) mesh.name = opts.name;
    if (opts.panel) mesh.userData.panel = opts.panel;
    return mesh;
  }

  // Caja definida por sus límites (mín./máx. en cada eje), en mm.
  function box(material, x0, x1, y0, y1, z0, z1, opts = {}) {
    const mesh = new THREE.Mesh(geometries.box, material);
    mesh.scale.set(Math.max(Math.abs(x1 - x0), 0.01), Math.max(Math.abs(y1 - y0), 0.01), Math.max(Math.abs(z1 - z0), 0.01));
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return tag(mesh, opts);
  }

  // Cilindro de radio r y longitud len, centrado en c, con eje 'x' | 'y' | 'z'.
  function cyl(material, r, len, c, axis = 'y', opts = {}) {
    const geometry = opts.open ? geometries.tube : opts.low ? geometries.cylLow : geometries.cyl;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(r * 2, len, r * 2);
    mesh.position.set(c[0], c[1], c[2]);
    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    return tag(mesh, opts);
  }

  // Triángulo rectángulo plano (marca de orientación), tamaño s, en el plano XY.
  function triangle(material, s, position, rotationZ = 0, opts = {}) {
    const mesh = new THREE.Mesh(geometries.triangle, material);
    mesh.scale.set(s, s, 1);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.z = rotationZ;
    return tag(mesh, opts);
  }

  // Muchas cajas iguales en una sola llamada de dibujo (aletas, chips, tornillos).
  function instancedBoxes(material, size, transforms, opts = {}) {
    const mesh = new THREE.InstancedMesh(geometries.box, material, transforms.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(size[0], size[1], size[2]), p = new THREE.Vector3(), e = new THREE.Euler();
    transforms.forEach((t, i) => {
      p.set(t[0], t[1], t[2]);
      e.set(t[3] || 0, t[4] || 0, t[5] || 0);
      q.setFromEuler(e);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.computeBoundingBox();
    return tag(mesh, opts);
  }

  function instancedCyl(material, r, len, centers, axis = 'y', opts = {}) {
    const mesh = new THREE.InstancedMesh(opts.low ? geometries.cylLow : geometries.cyl, material, centers.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(r * 2, len, r * 2), p = new THREE.Vector3();
    if (axis === 'x') q.setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
    if (axis === 'z') q.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    centers.forEach((c, i) => { p.set(c[0], c[1], c[2]); m.compose(p, q, s); mesh.setMatrixAt(i, m); });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.computeBoundingBox();
    return tag(mesh, opts);
  }

  function dispose() {
    Object.values(geometries).forEach(g => g.dispose());
    Object.values(mat).forEach(m => m.dispose());
    ghost.dispose();
    looks.forEach(entry => Object.values(entry).forEach(m => m.dispose()));
    looks.clear();
  }

  return { THREE, mat, ghost, look, box, cyl, triangle, instancedBoxes, instancedCyl, dispose };
}
