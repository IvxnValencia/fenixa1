// Sistema de animaciones: interpolaciones (tweens) que corren sobre el ciclo
// de render bajo demanda del motor. Respeta prefers-reduced-motion.
import * as THREE from 'three';

export const ease = {
  linear: t => t,
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 3)
};

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// tween(engine, { duration (s), easing, update(k), done() }) → { cancel() }
export function tween(engine, { duration = 0.6, easing = ease.inOut, update, done }) {
  const total = reducedMotion() ? 0 : duration;
  let elapsed = 0, cancelled = false;
  // Esencial: si el visor no se ve, la interpolación se completa al instante.
  const remove = engine.addTicker(dt => {
    if (cancelled) return false;
    elapsed += dt;
    const k = total <= 0 ? 1 : Math.min(1, elapsed / total);
    update(easing(k));
    if (k >= 1) { done?.(); return false; }
    return true;
  }, { essential: true });
  return { cancel() { cancelled = true; remove(); } };
}

// Mueve cámara y objetivo de los controles a la vez.
export function flyTo(engine, position, target, duration = 0.7) {
  const cam = engine.camera, controls = engine.controls;
  const p0 = cam.position.clone(), t0 = controls.target.clone();
  const p1 = position.clone(), t1 = target.clone();
  return tween(engine, {
    duration,
    update: k => {
      cam.position.lerpVectors(p0, p1, k);
      controls.target.lerpVectors(t0, t1, k);
      cam.lookAt(controls.target);
    }
  });
}

// Calcula una posición de cámara que encuadra una caja, conservando la dirección actual.
export function framing(engine, box, { padding = 1.25, direction } = {}) {
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const cam = engine.camera;
  const fov = THREE.MathUtils.degToRad(cam.fov);
  const fit = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * cam.aspect));
  const distance = Math.max(engine.controls.minDistance, (sphere.radius * padding) / Math.sin(fit / 2));
  const dir = (direction || cam.position.clone().sub(engine.controls.target)).normalize();
  return { position: sphere.center.clone().add(dir.multiplyScalar(distance)), target: sphere.center.clone() };
}
