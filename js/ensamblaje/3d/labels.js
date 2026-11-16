// Etiquetas identificativas en HTML proyectadas sobre el modelo 3D.
// Solo se muestran en modo inspección, para no saturar la vista general.
import * as THREE from 'three';

export class LabelLayer {
  constructor(engine, container) {
    this.engine = engine;
    this.container = container;
    this.items = [];
    this.v = new THREE.Vector3();
    this.update = this.update.bind(this);
    engine.afterRender.add(this.update);
  }

  show(part) {
    this.clear();
    (part.userData.labels || []).forEach(({ text, at }) => {
      const el = document.createElement('span');
      el.className = 'av-label';
      el.textContent = text;
      this.container.appendChild(el);
      this.items.push({ el, part, at: new THREE.Vector3(at[0], at[1], at[2]) });
    });
    this.engine.requestRender();
  }

  clear() {
    this.items.forEach(i => i.el.remove());
    this.items = [];
  }

  update() {
    if (!this.items.length) return;
    const w = this.container.clientWidth, h = this.container.clientHeight;
    const placed = [];
    for (const item of this.items) {
      this.v.copy(item.at);
      item.part.localToWorld(this.v);
      this.v.project(this.engine.camera);
      const visible = this.v.z < 1 && Math.abs(this.v.x) <= 1.05 && Math.abs(this.v.y) <= 1.05;
      item.el.hidden = !visible;
      if (visible) placed.push({ el: item.el, x: ((this.v.x + 1) / 2) * w, y: ((1 - this.v.y) / 2) * h, w: item.el.offsetWidth, h: item.el.offsetHeight });
    }
    // Evita solapamientos: desplaza hacia abajo las etiquetas que chocan.
    placed.sort((a, b) => a.y - b.y);
    const done = [];
    for (const p of placed) {
      let moved = true;
      while (moved) {
        moved = false;
        for (const q of done) {
          if (p.x < q.x + q.w && p.x + p.w > q.x && p.y < q.y + q.h && p.y + p.h > q.y) { p.y = q.y + q.h + 3; moved = true; }
        }
      }
      done.push(p);
      p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
  }

  dispose() {
    this.clear();
    this.engine.afterRender.delete(this.update);
  }
}
