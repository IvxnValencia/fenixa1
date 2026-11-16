// Motor de visualización 3D.
//
// Responsabilidades: renderizador, escena, cámara, controles orbitales,
// iluminación, ciclo de render bajo demanda y liberación de recursos.
//
// Rendimiento:
// · No hay bucle continuo: solo se renderiza cuando algo cambia
//   (controles, animaciones activas, redimensionado).
// · Se pausa si el visor sale de la pantalla o la pestaña se oculta.
// · La resolución se limita (maxPixelRatio) y puede reducirse si un fotograma
//   tarda demasiado de forma sostenida.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Engine {
  constructor(host, { maxPixelRatio = 1.75 } = {}) {
    this.host = host;
    this.maxPixelRatio = maxPixelRatio;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    this.tickers = new Set();
    this.afterRender = new Set();
    this.frame = 0;
    this.onScreen = true;
    this.pageVisible = !document.hidden;
    this.disposed = false;
    this.lastTime = 0;
    this.slowFrames = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(this.pixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'av-canvas';
    host.appendChild(renderer.domElement);
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 5, 20000);

    this.scene.add(new THREE.HemisphereLight(0xf1eff7, 0x1b1a22, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-600, 900, 700);
    const rim = new THREE.DirectionalLight(0xc9b6ff, 0.55);
    rim.position.set(700, 400, -800);
    this.scene.add(key, rim);

    const controls = new OrbitControls(this.camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.minDistance = 120;
    controls.maxDistance = 2600;
    controls.maxPolarAngle = Math.PI * 0.94;
    controls.screenSpacePanning = true;
    controls.addEventListener('change', () => this.requestRender());
    this.controls = controls;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.onScreen = entries.some(e => e.isIntersecting);
      this.requestRender(); // visible: dibuja; oculto: completa lo esencial
    });
    this.intersectionObserver.observe(host);
    this.onVisibility = () => { this.pageVisible = !document.hidden; this.requestRender(); };
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
  }

  get active() { return this.onScreen && this.pageVisible && !this.disposed; }

  resize() {
    if (this.disposed) return;
    const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const [sx, sy] = this.viewShift || [0, 0];
    if (sx || sy) this.camera.setViewOffset(w, h, sx, sy, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  // Desplaza el centro óptico (px) para que un panel no tape el modelo.
  setViewShift(x = 0, y = 0) {
    const next = [Math.round(x) || 0, Math.round(y) || 0];
    const prev = this.viewShift || [0, 0];
    if (next[0] === prev[0] && next[1] === prev[1]) return;
    this.viewShift = next;
    this.resize();
  }

  // Un ticker es fn(dt, now) → true mientras necesite más fotogramas.
  // `essential`: cambia estado (encaje, desinstalación, cámara). Si el visor no
  // está visible, estos se completan al instante en lugar de quedar en pausa;
  // los no esenciales (la demostración en bucle) simplemente esperan.
  addTicker(fn, { essential = false } = {}) {
    fn.essential = essential;
    this.tickers.add(fn);
    this.requestRender();
    return () => this.tickers.delete(fn);
  }

  flushEssential() {
    if (this.flushing) return;
    this.flushing = true;
    try {
      for (const fn of [...this.tickers]) if (fn.essential && !fn(1000, performance.now())) this.tickers.delete(fn);
    } finally { this.flushing = false; }
  }

  requestRender() {
    if (!this.disposed && !this.active) { this.flushEssential(); return; }
    if (this.frame || !this.active) return;
    this.frame = requestAnimationFrame(now => this.render(now));
  }

  render(now) {
    this.frame = 0;
    if (!this.active) return;
    const dt = this.lastTime ? Math.min(0.1, (now - this.lastTime) / 1000) : 1 / 60;
    this.lastTime = now;
    let keepGoing = false;
    for (const fn of [...this.tickers]) {
      if (fn(dt, now)) keepGoing = true; else this.tickers.delete(fn);
    }
    if (this.controls.update()) keepGoing = true;
    const t0 = performance.now();
    this.renderer.render(this.scene, this.camera);
    this.adaptResolution(performance.now() - t0);
    for (const fn of this.afterRender) fn();
    if (keepGoing) this.requestRender();
    else this.lastTime = 0;
  }

  // Si el envío de fotogramas es lento de forma sostenida, baja la resolución.
  adaptResolution(ms) {
    this.slowFrames = ms > 14 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 20 && this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio - 0.25);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.resize();
      this.slowFrames = 0;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.tickers.clear();
    this.afterRender.clear();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.controls.dispose();
    // Geometrías y materiales compartidos los libera el kit; aquí se liberan
    // los búferes propios de cada InstancedMesh y cualquier recurso cargado (GLB).
    this.scene.traverse(obj => {
      if (obj.isInstancedMesh) obj.dispose();
      if (obj.userData.ownsGeometry) obj.geometry?.dispose(); // mallas fusionadas (optimize.js)
      if (obj.userData.ownsResources) {
        obj.geometry?.dispose();
        [].concat(obj.material || []).forEach(m => { Object.values(m).forEach(v => v?.isTexture && v.dispose()); m.dispose(); });
      }
    });
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
