// Visor 3D de la guía de ensamblaje (Fases 2 y 3).
//
// Une motor, modelos, selección, inspección, etiquetas, vista separada y el
// modo práctica (arrastre, rotación y encaje validado), y construye los
// controles del visor dentro del contenedor recibido.
//
// API pública (la usarán las fases 4–6):
//   const viewer = await createAssemblyViewer(host, options)
//   viewer.select(id) · viewer.inspect(id) · viewer.setExploded(bool)
//   viewer.setPractice(bool) · viewer.resetView() · viewer.dispose()
//   options.onAssemblyChange({ installed, total, message, installedId })
import * as THREE from 'three';
import { Engine } from './engine.js';
import { createKit } from './kit.js';
import { buildPc, applyExplode, DEFAULT_SPEC } from './pc-scene.js';
import { Picker, applyLook } from './selection.js';
import { LabelLayer } from './labels.js';
import { tween, flyTo, framing } from './animation.js';
import { PART_INFO } from './part-info.js';
import { createAssembly } from './assembly.js';
import { createDemo } from './demo.js';

const ICONS = {
  left: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  right: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6"/>',
  center: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
  explode: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m9 6 3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  interior: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v18"/>',
  parts: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  inspect: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/><path d="M11 8a3 3 0 0 1 3 3"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6C3.9 8.3 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.3-1"/>',
  practice: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  ccw: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  cw: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  flip: '<path d="M12 3v18"/><path d="m7 7-4 5 4 5zM17 7l4 5-4 5z"/>',
  check: '<path d="m5 12 4 4L19 6"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHEET_WIDTH = 560; // igual que el @container de css/assembly-3d.css
const DEFAULT_DIRECTION = new THREE.Vector3(-0.72, 0.42, 0.66).normalize();
// En práctica se mira la placa casi de frente: el arrastre ocurre en un plano paralelo a ella.
const PRACTICE_DIRECTION = new THREE.Vector3(-0.95, 0.22, 0.22).normalize();

function template() {
  const btn = (action, icon, label, extra = '') => `<button class="av-tool" type="button" data-action="${action}" aria-label="${label}" title="${label}" ${extra}>${svg(icon)}</button>`;
  return `
    <div class="av-stage" tabindex="0" role="application" aria-roledescription="visor 3D" aria-label="Modelo 3D del computador. Arrastra para girar, rueda para acercar, clic para seleccionar una pieza. Flechas para girar, más y menos para acercar, Escape para volver."></div>
    <div class="av-labels" aria-hidden="true"></div>
    <span class="av-badge" title="Las formas y posiciones son de referencia: consulta el manual de cada pieza.">Modelo genérico · referencia</span>
    <div class="av-hover" role="presentation" hidden></div>
    <div class="av-toolbar" role="toolbar" aria-label="Controles del visor 3D">
      ${btn('rotate-left', 'left', 'Girar a la izquierda')}
      ${btn('rotate-right', 'right', 'Girar a la derecha')}
      ${btn('zoom-in', 'zoomIn', 'Acercar')}
      ${btn('zoom-out', 'zoomOut', 'Alejar')}
      ${btn('center', 'center', 'Centrar cámara')}
      ${btn('reset', 'home', 'Vista general')}
      <span class="av-sep" aria-hidden="true"></span>
      ${btn('explode', 'explode', 'Vista de componentes separados', 'aria-pressed="false"')}
      ${btn('interior', 'interior', 'Ver interior (quitar panel lateral)', 'aria-pressed="false"')}
      ${btn('parts', 'parts', 'Lista de piezas', 'aria-pressed="false" aria-controls="avPartsPanel"')}
      ${btn('inspect', 'inspect', 'Inspeccionar la pieza seleccionada', 'disabled')}
      <span class="av-sep" aria-hidden="true"></span>
      ${btn('practice', 'practice', 'Practicar el montaje', 'aria-pressed="false"')}
    </div>
    <p class="av-feedback" role="status" aria-live="polite" hidden></p>
    <section class="av-panel av-parts" id="avPartsPanel" aria-label="Piezas del modelo" hidden>
      <header><strong>Piezas</strong><button class="av-link" type="button" data-action="show-all">Mostrar todas</button></header>
      <ul></ul>
    </section>
    <section class="av-panel av-info" aria-live="polite" hidden></section>
    <p class="av-hint">Arrastra para girar · rueda o pellizco para acercar · clic derecho o dos dedos para desplazar · clic en una pieza para seleccionarla</p>`;
}

// options.compatibility: { [ruleKey]: mensaje } — incompatibilidades de la build.
// options.details: { [partId]: [[etiqueta, valor], …] } — datos de ficha de la pieza real.
export async function createAssemblyViewer(host, { spec = DEFAULT_SPEC, onStatus, onAssemblyChange, onModeChange, mode: initialMode = 'practice', initialInstalled = null, compatibility = {}, details = {} } = {}) {
  host.insertAdjacentHTML('beforeend', `<div class="av-root">${template()}</div>`);
  const ui = host.querySelector('.av-root');
  const $ = sel => ui.querySelector(sel);
  const stage = $('.av-stage');

  const engine = new Engine(stage);
  const kit = createKit();
  const pc = buildPc(kit, spec);
  engine.scene.add(pc.root);
  const parts = [...pc.parts.values()];
  const labels = new LabelLayer(engine, $('.av-labels'));

  // hideOthers: en inspección, el resto de piezas se oculta (true) o se atenúa (false).
  // practice: modo práctica activo; assembly: controlador (se crea la primera vez); drag: arrastre en curso.
  const state = { hover: null, selected: null, inspecting: null, exploded: false, explodeK: 0, interior: false, hideOthers: true, savedView: null, lastClick: null, practice: false, assembly: null, drag: null, feedback: null, interiorBefore: false, mode: initialMode, demo: null };
  const picker = new Picker(engine, pc.root, { filter: part => !state.inspecting || part === state.inspecting });
  const setState = (part, patch) => { part.userData.state = { ...part.userData.state, ...patch }; applyLook(kit, part); };

  // Encuadre inicial adaptado al tamaño del visor.
  const box = () => new THREE.Box3().setFromObject(pc.root);
  const home = () => framing(engine, box(), { padding: 1.08, direction: DEFAULT_DIRECTION.clone() });
  {
    const v = home();
    engine.camera.position.copy(v.position);
    engine.controls.target.copy(v.target);
    engine.controls.update();
  }

  // ---------------------------------------------------------------- UI
  function status(text) { onStatus?.(text); }

  function renderPartsList() {
    $('.av-parts ul').innerHTML = parts.map(p => {
      const hidden = !p.visible;
      return `<li><button class="av-part${state.selected === p ? ' is-selected' : ''}" type="button" data-select="${esc(p.userData.id)}">${esc(p.userData.name)}</button>
        <button class="av-eye" type="button" data-toggle="${esc(p.userData.id)}" aria-pressed="${hidden}" aria-label="${hidden ? 'Mostrar' : 'Ocultar'} ${esc(p.userData.name)}" title="${hidden ? 'Mostrar' : 'Ocultar'}">${svg(hidden ? 'eyeOff' : 'eye')}</button></li>`;
    }).join('');
  }

  // Panel del modo práctica: resumen, pieza suelta (girar, voltear, instalar) o pieza instalada.
  function renderPractice(panel) {
    const a = state.assembly, prog = a.progress(), part = state.selected, entry = a.entryOf(part);
    const pct = prog.total ? Math.round((prog.installed / prog.total) * 100) : 0;
    const progress = `<div class="av-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${prog.total}" aria-valuenow="${prog.installed}" aria-label="Piezas instaladas"><span style="width:${pct}%"></span></div><p class="av-progress-text">${prog.installed} de ${prog.total} piezas instaladas</p>`;
    const fb = state.feedback ? `<p class="av-msg av-msg--${esc(state.feedback.severity)}">${esc(state.feedback.message)}</p>` : '';
    const chip = chipFor(part);
    // Selector de modalidad: A (hazlo tú) o B (demostración en bucle). Cambiar no toca el progreso.
    const modeSwitch = `<div class="av-mode" role="group" aria-label="Modalidad de aprendizaje">
      <button type="button" data-action="mode-practice" aria-pressed="${state.mode === 'practice'}">Hazlo tú</button>
      <button type="button" data-action="mode-demo" aria-pressed="${state.mode === 'demo'}">Ver demostración</button></div>`;
    if (state.mode === 'demo') return renderDemo(panel, entry, modeSwitch, progress, chip);
    if (!entry) {
      const loose = [...a.entries.values()].filter(e => !e.installed);
      panel.innerHTML = `<header><div><span class="av-eyebrow">Práctica de montaje</span><strong>${loose.length ? 'Elige una pieza' : '¡Montaje completo!'}</strong></div>${closeButton('practice', 'Salir de la práctica')}</header>
        ${modeSwitch}
        ${progress}
        <p>${loose.length ? 'Selecciona una pieza de la zona de espera y arrástrala hasta su zona iluminada. Gírala hasta que su punto dorado coincida con el de la zona.' : 'Todas las piezas están en su sitio. Puedes desinstalar alguna para repetir el paso.'}</p>
        ${fb}
        ${loose.length ? `<ul class="av-loose">${loose.map(e => `<li><button class="av-part" type="button" data-select="${esc(e.id)}">${esc(e.part.userData.name)}</button></li>`).join('')}</ul>` : ''}
        <div class="av-actions"><button class="secondary-button av-small" type="button" data-action="start-fresh">Empezar de cero</button><button class="secondary-button av-small" type="button" data-action="install-all">Montar todo</button></div>`;
    } else if (!entry.installed) {
      panel.innerHTML = `<header><div><span class="av-eyebrow">Por instalar</span><strong>${esc(part.userData.name)}</strong>${chip}</div>${closeButton('deselect', 'Quitar selección')}</header>
        ${modeSwitch}
        <p>${esc(entry.rule.hint)}</p>
        <div class="av-rot" role="group" aria-label="Orientación de la pieza">
          <button class="av-tool" type="button" data-action="rot-ccw" title="Girar 15° a la izquierda (Q)" aria-label="Girar 15 grados a la izquierda" aria-keyshortcuts="Q">${svg('ccw')}</button>
          <button class="av-tool" type="button" data-action="rot-cw" title="Girar 15° a la derecha (E)" aria-label="Girar 15 grados a la derecha" aria-keyshortcuts="E">${svg('cw')}</button>
          <button class="secondary-button av-small" type="button" data-action="rot-90" aria-keyshortcuts="R">Girar 90°</button>
          <button class="secondary-button av-small" type="button" data-action="flip" aria-keyshortcuts="F">${svg('flip')}Voltear</button>
        </div>
        ${fb}
        <div class="av-actions"><button class="primary-button av-small" type="button" data-action="try-install">${svg('check')}Instalar aquí</button><button class="secondary-button av-small" type="button" data-action="inspect">${svg('inspect')}Examinar</button></div>
        <p class="av-keys">Arrastra la pieza con el ratón o el dedo. Teclado: Mayús + flechas la mueven, Q/E giran 15°, R gira 90°, F voltea, Intro intenta instalar.</p>
        ${progress}`;
    } else {
      panel.innerHTML = `<header><div><span class="av-eyebrow">Instalada</span><strong>${esc(part.userData.name)}</strong>${chip}</div>${closeButton('deselect', 'Quitar selección')}</header>
        ${modeSwitch}
        <p>En ${esc(a.mountName(entry))}.</p>
        ${fb}
        <div class="av-actions"><button class="secondary-button av-small" type="button" data-action="uninstall">Desinstalar</button><button class="secondary-button av-small" type="button" data-action="inspect">${svg('inspect')}Examinar</button></div>
        ${progress}`;
    }
    panel.hidden = false;
    updateViewShift();
  }

  // Panel de la modalidad B (asistencia visual en bucle).
  function renderDemo(panel, entry, modeSwitch, progress, chip) {
    const a = state.assembly, demo = state.demo;
    if (!entry) {
      panel.innerHTML = `<header><div><span class="av-eyebrow">Asistencia visual</span><strong>Elige una pieza</strong></div>${closeButton('practice', 'Salir de la práctica')}</header>
        ${modeSwitch}
        <p>Verás en bucle cómo se sujeta, se orienta y se instala. La demostración no instala nada: después hazlo tú, en el simulador o en tu PC.</p>
        <ul class="av-loose">${[...a.entries.values()].map(e => `<li><button class="av-part" type="button" data-select="${esc(e.id)}">${esc(e.part.userData.name)}${e.installed ? ' · instalada' : ''}</button></li>`).join('')}</ul>
        ${progress}`;
    } else {
      const phases = demo.phases(), i = demo.phaseIndex();
      panel.innerHTML = `<header><div><span class="av-eyebrow">Demostración</span><strong>${esc(entry.part.userData.name)}</strong>${chip}</div>${closeButton('deselect', 'Quitar selección')}</header>
        ${modeSwitch}
        <p class="av-demo-caption" aria-live="polite">${esc(phases[i]?.text || '')}</p>
        <ol class="av-demo-steps">${phases.map((p, n) => `<li class="${n === i ? 'is-current' : ''}">${esc(p.text)}</li>`).join('')}</ol>
        <div class="av-actions av-demo-controls">
          <button class="primary-button av-small" type="button" data-action="demo-toggle">${demo.playing ? 'Pausar' : 'Reproducir'}</button>
          <button class="secondary-button av-small" type="button" data-action="demo-restart">Reiniciar</button>
          <button class="secondary-button av-small" type="button" data-action="demo-speed" aria-pressed="${demo.speed < 1}">Velocidad ${demo.speed < 1 ? '0,5×' : '1×'}</button>
        </div>
        <div class="av-actions"><button class="secondary-button av-small" type="button" data-action="mode-practice">${svg('practice')}Ahora hazlo tú</button></div>
        <p class="av-note">La demostración usa una copia de la pieza: no cambia tu progreso. Tecla Espacio: pausar o reanudar.</p>
        ${progress}`;
    }
    panel.hidden = false;
    updateViewShift();
  }

  // Actualiza solo la etapa actual (sin redibujar el panel, para no perder el foco).
  function onDemoPhase(i, phase) {
    const list = ui.querySelectorAll('.av-demo-steps li');
    list.forEach((li, n) => li.classList.toggle('is-current', n === i));
    const cap = ui.querySelector('.av-demo-caption');
    if (cap) cap.textContent = phase.text;
  }
  function onDemoState({ playing, speed }) {
    const t = ui.querySelector('[data-action="demo-toggle"]');
    if (t) t.textContent = playing ? 'Pausar' : 'Reproducir';
    const s = ui.querySelector('[data-action="demo-speed"]');
    if (s) { s.textContent = `Velocidad ${speed < 1 ? '0,5×' : '1×'}`; s.setAttribute('aria-pressed', String(speed < 1)); }
  }

  function playDemoFor(part) {
    const entry = state.assembly?.entryOf(part);
    if (!entry) { state.demo?.stop(); return; }
    const region = state.demo.play(entry);
    if (region) { const v = framing(engine, region, { padding: 1.3, direction: PRACTICE_DIRECTION.clone() }); flyTo(engine, v.position, v.target, 0.6); }
  }

  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    if (state.practice) {
      if (mode === 'demo') { state.assembly.focus(null); if (state.selected) playDemoFor(state.selected); }
      else { state.demo?.stop(); state.assembly.focus(state.selected); }
    }
    renderInfo();
    status(mode === 'demo' ? 'Asistencia visual: demostración en bucle.' : 'Práctica libre: hazlo tú.');
    onModeChange?.(mode);
  }

  function setFeedback(result) {
    state.feedback = result && result.message ? { severity: result.severity || (result.ok ? 'ok' : 'error'), message: result.message } : null;
  }

  function renderInfo() {
    const panel = $('.av-info');
    const part = state.inspecting || state.selected;
    $('[data-action="inspect"]').disabled = !state.selected || Boolean(state.inspecting);
    if (state.practice && !state.inspecting) return renderPractice(panel);
    if (!part) { panel.hidden = true; panel.innerHTML = ''; updateViewShift(); return; }
    const info = PART_INFO[part.userData.type] || {};
    const chip = chipFor(part);
    if (!state.inspecting) {
      panel.innerHTML = `<header><div><strong>${esc(part.userData.name)}</strong>${chip}</div>${closeButton('deselect', 'Quitar selección')}</header>
        <p>${esc(info.role || '')}</p>
        <div class="av-actions"><button class="primary-button av-small" type="button" data-action="inspect">${svg('inspect')}Inspeccionar</button>
        <button class="secondary-button av-small" type="button" data-action="hide-selected">${svg('eyeOff')}Ocultar</button></div>`;
    } else {
      const list = items => `<ul>${(items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
      panel.innerHTML = `<header><div><span class="av-eyebrow">Inspección</span><strong>${esc(part.userData.name)}</strong>${chip}</div>${closeButton('exit-inspect', 'Volver a la vista general')}</header>
        ${factsBlock(part)}
        <details ${factsBlock(part) ? '' : 'open'}><summary>Función</summary><p>${esc(info.role || '')}</p></details>
        <details><summary>Dónde se instala</summary><p>${esc(info.location || '')}</p></details>
        <details><summary>Cómo se instala</summary>${list(info.install)}</details>
        <details><summary>Precauciones</summary>${list(info.precautions)}</details>
        <details><summary>Errores frecuentes</summary>${list(info.mistakes)}</details>
        <p class="av-note">Forma y posiciones de referencia. Para tu modelo exacto, sigue su manual.</p>
        <div class="av-actions"><button class="secondary-button av-small" type="button" data-action="toggle-others" aria-pressed="${state.hideOthers}">${state.hideOthers ? 'Ver el resto atenuado' : 'Ocultar el resto'}</button>
        <button class="primary-button av-small" type="button" data-action="exit-inspect">Volver a la vista general</button></div>`;
    }
    panel.hidden = false;
    updateViewShift();
  }

  // En inspección, con la ficha a la derecha, desplaza el centro óptico a la izquierda.
  function updateViewShift() {
    const panel = $('.av-info');
    // En visores estrechos la ficha es una hoja inferior (ver CSS): se sube el modelo.
    if (panel.hidden) return engine.setViewShift(0, 0);
    if (stage.clientWidth <= SHEET_WIDTH) return engine.setViewShift(0, (panel.offsetHeight + 8) / 2);
    const roomy = stage.clientWidth - panel.offsetWidth > 320;
    engine.setViewShift((state.inspecting || state.practice) && roomy ? (panel.offsetWidth + 12) / 2 : 0, 0);
  }
  // Distintivo: referencia fuera de la build, o modelo genérico de una pieza real.
  function chipFor(part) {
    if (!part) return '';
    if (part.userData.placeholder) return '<span class="av-chip av-chip--ref">No está en tu build</span>';
    return part.userData.generic ? '<span class="av-chip">Modelo genérico</span>' : '';
  }
  // Datos de ficha de la pieza real de la build (si los hay).
  function factsBlock(part) {
    const rows = details[part.userData.id];
    if (!rows?.length) return '';
    return `<details open><summary>Tu pieza</summary><dl class="av-facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p class="av-note">Datos de su ficha en FENIXA. La forma 3D sigue siendo genérica.</p></details>`;
  }

  const closeButton = (action, label) => `<button class="av-close" type="button" data-action="${action}" aria-label="${label}" title="${label}">${svg('close')}</button>`;

  // ---------------------------------------------------------- selección
  function setHover(part) {
    if (state.hover === part) return;
    if (state.hover) setState(state.hover, { hover: false });
    state.hover = part;
    if (part) setState(part, { hover: true });
    stage.style.cursor = part ? 'pointer' : '';
    engine.requestRender();
  }

  function select(part, { present = true } = {}) {
    if (state.inspecting && part !== state.inspecting) return;
    if (state.selected) setState(state.selected, { selected: false });
    const changed = state.selected !== part;
    state.selected = part || null;
    if (part) setState(part, { selected: true });
    if (state.practice && state.mode === 'demo') {
      // Modalidad B: la selección elige qué demostración se reproduce.
      if (changed || !state.demo.active) { if (part) playDemoFor(part); else state.demo.stop(); }
    } else if (state.practice) {
      state.assembly.focus(part);
      if (part) state.feedback = null;
      // Tomar la pieza: se acerca a su zona y la cámara encuadra la zona de montaje.
      if (part && changed && present && state.assembly.isLoose(part)) {
        const region = state.assembly.present(part);
        if (region) { const v = framing(engine, region, { padding: 1.35, direction: PRACTICE_DIRECTION.clone() }); flyTo(engine, v.position, v.target, 0.6); }
      }
    }
    renderInfo();
    renderPartsList();
    status(part ? `Seleccionado: ${part.userData.name}.` : 'Selecciona una pieza para conocerla.');
    engine.requestRender();
  }

  function setVisible(part, visible) {
    part.visible = visible;
    if (!visible && state.selected === part && !state.inspecting) select(null);
    if (!visible && state.hover === part) setHover(null);
    renderPartsList();
    engine.requestRender();
  }

  // ---------------------------------------------------------- inspección
  function inspect(part) {
    if (!part) return;
    state.demo?.stop(); // se examina la pieza real, no el fantasma
    if (!part.visible) setVisible(part, true);
    if (state.selected !== part) select(part, { present: false });
    state.demo?.stop();
    state.savedView = state.savedView || { position: engine.camera.position.clone(), target: engine.controls.target.clone() };
    state.inspecting = part;
    setState(part, { inspected: true });
    if (state.practice) state.assembly.focus(null);
    $('.av-parts').hidden = true;
    $('[data-action="parts"]').setAttribute('aria-pressed', 'false');
    applyOthers();
    engine.controls.minDistance = 30;
    // Piezas montadas en la placa: mirar desde su cara de componentes (mundo −X), en ángulo.
    // La RAM queda perpendicular a la placa y su cara mira al frente del gabinete (+Z).
    const onBoard = part.parent === pc.frame;
    const dir = part.userData.type === 'ram' ? [-0.4, 0.35, 0.85] : onBoard ? [-0.78, 0.42, 0.46] : null;
    const direction = dir ? new THREE.Vector3(...dir) : undefined;
    const v = framing(engine, new THREE.Box3().setFromObject(part), { padding: 1.5, direction });
    flyTo(engine, v.position, v.target);
    labels.show(part);
    renderInfo();
    status(`Inspeccionando: ${part.userData.name}. Gira la vista para examinarla; Escape para volver.`);
  }

  function applyOthers() {
    parts.forEach(p => {
      if (p === state.inspecting) return;
      const dim = Boolean(state.inspecting);
      setState(p, { dimmed: dim && !state.hideOthers });
      p.userData.hiddenByInspect = dim && state.hideOthers;
      p.visible = !p.userData.hiddenByInspect && !p.userData.hiddenByUser;
    });
    engine.requestRender();
  }

  function exitInspect() {
    if (!state.inspecting) return;
    setState(state.inspecting, { inspected: false });
    state.inspecting = null;
    state.hideOthers = true;
    parts.forEach(p => { setState(p, { dimmed: false }); p.userData.hiddenByInspect = false; p.visible = !p.userData.hiddenByUser; });
    labels.clear();
    engine.controls.minDistance = 120;
    if (state.savedView) flyTo(engine, state.savedView.position, state.savedView.target);
    state.savedView = null;
    if (state.practice && state.mode === 'demo') { if (state.selected) playDemoFor(state.selected); }
    else if (state.practice) state.assembly.focus(state.selected);
    renderInfo();
    renderPartsList();
    status('Vista general.');
  }

  // ---------------------------------------------------------- cámara
  function orbit(deg, axis = 'y') {
    const target = engine.controls.target;
    const offset = engine.camera.position.clone().sub(target);
    const end = offset.clone();
    if (axis === 'y') end.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(deg));
    else {
      const right = new THREE.Vector3().crossVectors(offset, engine.camera.up).normalize();
      end.applyAxisAngle(right, THREE.MathUtils.degToRad(deg));
      const polar = end.angleTo(new THREE.Vector3(0, 1, 0));
      if (polar < 0.08 || polar > Math.PI * 0.94) return;
    }
    const start = offset.clone();
    const q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion().setFromUnitVectors(start.clone().normalize(), end.clone().normalize());
    const len = start.length();
    tween(engine, { duration: 0.35, update: k => {
      const q = q0.clone().slerp(q1, k);
      engine.camera.position.copy(target).add(start.clone().applyQuaternion(q).setLength(len));
      engine.camera.lookAt(target);
    } });
  }

  function zoom(factor) {
    const c = engine.controls, target = c.target;
    const offset = engine.camera.position.clone().sub(target);
    const len = THREE.MathUtils.clamp(offset.length() * factor, c.minDistance, c.maxDistance);
    flyTo(engine, target.clone().add(offset.setLength(len)), target, 0.3);
  }

  function center() {
    const focus = state.inspecting || state.selected;
    const target = focus ? new THREE.Box3().setFromObject(focus).getCenter(new THREE.Vector3()) : box().getCenter(new THREE.Vector3());
    const offset = engine.camera.position.clone().sub(engine.controls.target);
    flyTo(engine, target.clone().add(offset), target, 0.45);
  }

  function resetView() {
    exitInspect();
    const v = home();
    flyTo(engine, v.position, v.target);
  }

  // ---------------------------------------------------------- vistas
  let explodeTween = null;
  function setExploded(on) {
    if (state.exploded === on) return;
    state.exploded = on;
    $('[data-action="explode"]').setAttribute('aria-pressed', String(on));
    explodeTween?.cancel();
    const from = state.explodeK, to = on ? 1 : 0;
    explodeTween = tween(engine, { duration: 0.9, update: k => { state.explodeK = from + (to - from) * k; applyExplode(parts, state.explodeK); }, done: () => {
      // Separadas, las piezas se alejan hacia −X: un ángulo más frontal evita que se tapen entre sí.
      if (!state.inspecting) { const v = framing(engine, box(), { padding: 1.05, direction: on ? new THREE.Vector3(-0.5, 0.38, 0.78) : DEFAULT_DIRECTION.clone() }); flyTo(engine, v.position, v.target, 0.5); }
    } });
    status(on ? 'Vista de componentes separados.' : 'Componentes en su posición de montaje.');
  }

  function setInterior(on) {
    state.interior = on;
    $('[data-action="interior"]').setAttribute('aria-pressed', String(on));
    const casePart = pc.parts.get('case');
    casePart?.traverse(o => { if (o.userData.panel === 'side' || o.userData.panel === 'top') o.visible = !on; });
    engine.requestRender();
    status(on ? 'Panel lateral y superior retirados.' : 'Gabinete cerrado.');
  }

  // ---------------------------------------------------------- práctica
  function setPractice(on) {
    if (state.practice === on) return;
    exitInspect();
    let first = false;
    if (on) {
      if (state.exploded) setExploded(false);
      if (!state.assembly) {
        state.assembly = createAssembly({ engine, kit, pc, picker, onChange: onAssembly, compatibility });
        state.demo = createDemo({ engine, kit, assembly: state.assembly, onPhase: onDemoPhase, onState: onDemoState });
        first = true;
      }
      parts.forEach(p => { p.userData.hiddenByUser = false; p.visible = true; });
      state.interiorBefore = state.interior;
      setInterior(true);
    }
    state.practice = on;
    $('[data-action="practice"]').setAttribute('aria-pressed', String(on));
    $('[data-action="explode"]').disabled = on;
    state.assembly.setVisible(on);
    state.feedback = null;
    // Primera vez: restaura el avance guardado de esta build o empieza de cero.
    if (first) { if (initialInstalled) state.assembly.restore(initialInstalled); else state.assembly.startFresh(); }
    if (!on) { state.demo.stop(); state.assembly.focus(null); setInterior(state.interiorBefore); }
    select(null);
    renderPartsList();
    if (on) {
      const v = framing(engine, box(), { padding: 1.02, direction: PRACTICE_DIRECTION.clone() });
      flyTo(engine, v.position, v.target, 0.8);
    }
    status(on ? 'Modo práctica: arrastra cada pieza a su zona de montaje.' : 'Saliste del modo práctica. Tu avance se conserva mientras la guía esté abierta.');
  }

  function onAssembly(change) {
    if (change.message) setFeedback({ severity: 'ok', message: change.message });
    renderInfo();
    if (change.message) status(change.message);
    onAssemblyChange?.(change);
  }

  function flash(part) {
    setState(part, { error: true });
    engine.requestRender();
    setTimeout(() => { setState(part, { error: false }); engine.requestRender(); }, 650);
  }

  async function attemptInstall(part) {
    const result = await state.assembly.drop(part);
    if (!result) return;
    if (result.ok) {
      // onAssembly ya mostró el mensaje; se vuelve al resumen para elegir la siguiente pieza.
      if (state.selected === part) select(null);
      setFeedback({ severity: 'ok', message: [result.message, result.note].filter(Boolean).join(' ') });
      renderInfo();
    } else {
      flash(part);
      setFeedback(result);
      renderInfo();
      status(result.message);
    }
    $('.av-feedback').hidden = true;
  }

  function showLive(result) {
    const el = $('.av-feedback');
    if (!result) { el.hidden = true; return; }
    el.textContent = result.ok ? 'Correcto: suelta para instalar.' : result.message;
    el.className = `av-feedback av-feedback--${result.severity}`;
    el.hidden = false;
  }

  function practiceKey(e) {
    const part = state.selected;
    // Modalidad B: Espacio pausa o reanuda la demostración.
    if (state.practice && state.mode === 'demo' && state.demo?.active && e.key === ' ') { e.preventDefault(); state.demo.toggle(); return true; }
    if (!state.practice || state.mode === 'demo' || state.inspecting || !state.assembly.isLoose(part)) return false;
    const a = state.assembly;
    const step = e.altKey ? 1 : 5;
    const map = {
      q: () => a.rotate(part, 15), e: () => a.rotate(part, -15), r: () => a.rotate(part, -90), f: () => a.flip(part),
      Enter: () => attemptInstall(part)
    };
    if (e.shiftKey) Object.assign(map, {
      ArrowLeft: () => showLive(a.nudge(part, -step, 0)), ArrowRight: () => showLive(a.nudge(part, step, 0)),
      ArrowUp: () => showLive(a.nudge(part, 0, step)), ArrowDown: () => showLive(a.nudge(part, 0, -step))
    });
    const fn = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (!fn) return false;
    e.preventDefault();
    fn();
    return true;
  }

  // ---------------------------------------------------------- eventos
  const pointer = { x: 0, y: 0, down: null, pending: false };
  function hoverCheck() {
    pointer.pending = false;
    const hits = picker.pick(pointer.x, pointer.y);
    setHover(hits[0] || null);
    const tip = $('.av-hover');
    if (hits[0]) {
      const rect = ui.getBoundingClientRect();
      tip.textContent = hits[0].userData.name + (hits.length > 1 ? ' · clic de nuevo para la pieza de detrás' : '');
      tip.style.transform = `translate(${pointer.x - rect.left + 14}px, ${pointer.y - rect.top + 14}px)`;
      tip.hidden = false;
    } else tip.hidden = true;
  }
  const onMove = e => {
    if (e.pointerType === 'touch' || e.buttons) return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (!pointer.pending) { pointer.pending = true; requestAnimationFrame(hoverCheck); }
  };
  const onLeave = () => { setHover(null); $('.av-hover').hidden = true; };
  const onDown = e => { pointer.down = { x: e.clientX, y: e.clientY, button: e.button }; };
  const onUp = e => {
    const d = pointer.down; pointer.down = null;
    if (!d || d.button !== 0 || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
    const hits = picker.pick(e.clientX, e.clientY);
    if (!hits.length) { if (!state.inspecting) select(null); state.lastClick = null; return; }
    // Clic repetido en el mismo punto: recorre las piezas superpuestas.
    let next = hits[0];
    const last = state.lastClick;
    if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 6 && hits.includes(state.selected)) {
      next = hits[(hits.indexOf(state.selected) + 1) % hits.length];
    }
    state.lastClick = { x: e.clientX, y: e.clientY };
    select(next);
  };
  // Arrastre de piezas sueltas (fase de captura: se decide antes que OrbitControls).
  const onDragDown = e => {
    // En la modalidad B no se arrastra: la demostración solo muestra el movimiento.
    if (!state.practice || state.mode === 'demo' || state.inspecting || e.button !== 0) return;
    const hit = picker.pick(e.clientX, e.clientY)[0];
    if (!hit || !state.assembly.isLoose(hit)) return;
    engine.controls.enabled = false;
    state.drag = { part: hit, x: e.clientX, y: e.clientY, started: false };
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onDragMove = e => {
    const d = state.drag;
    if (!d) return;
    if (!d.started) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
      d.started = state.assembly.beginDrag(d.part, d.x, d.y);
      if (!d.started) return;
      if (state.selected !== d.part) select(d.part, { present: false });
      setHover(null);
      $('.av-hover').hidden = true;
    }
    showLive(state.assembly.dragTo(d.part, e.clientX, e.clientY));
  };
  const onDragUp = e => {
    const d = state.drag;
    if (!d) return;
    state.drag = null;
    engine.controls.enabled = true;
    if (!d.started) return; // fue un clic: lo gestiona onUp (selección)
    e.stopPropagation();
    pointer.down = null;
    attemptInstall(d.part);
  };

  const onKey = e => {
    if (practiceKey(e)) return;
    const keys = { ArrowLeft: () => orbit(-15), ArrowRight: () => orbit(15), ArrowUp: () => orbit(-10, 'x'), ArrowDown: () => orbit(10, 'x'), '+': () => zoom(0.8), '=': () => zoom(0.8), '-': () => zoom(1.25), Enter: () => state.selected && inspect(state.selected), Escape: () => (state.inspecting ? exitInspect() : select(null)) };
    if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
  };
  const onClick = e => {
    const el = e.target.closest('button');
    if (!el || !ui.contains(el)) return;
    if (el.dataset.select) { const p = pc.parts.get(el.dataset.select); if (state.inspecting && p !== state.inspecting) exitInspect(); if (p && !p.visible) setVisible(p, true); select(p); return; }
    if (el.dataset.toggle) { const p = pc.parts.get(el.dataset.toggle); if (p) { p.userData.hiddenByUser = p.visible; setVisible(p, !p.visible); } return; }
    const actions = {
      'rotate-left': () => orbit(-30), 'rotate-right': () => orbit(30),
      'zoom-in': () => zoom(0.75), 'zoom-out': () => zoom(1.33),
      center, reset: resetView,
      explode: () => setExploded(!state.exploded),
      interior: () => setInterior(!state.interior),
      parts: () => { const panel = $('.av-parts'); panel.hidden = !panel.hidden; el.setAttribute('aria-pressed', String(!panel.hidden)); if (!panel.hidden) renderPartsList(); },
      inspect: () => inspect(state.selected),
      'exit-inspect': exitInspect,
      deselect: () => select(null),
      'hide-selected': () => { const p = state.selected; if (p) { p.userData.hiddenByUser = true; setVisible(p, false); status(`${p.userData.name} oculta. Puedes mostrarla desde la lista de piezas.`); } },
      'show-all': () => { parts.forEach(p => { p.userData.hiddenByUser = false; p.visible = !p.userData.hiddenByInspect; }); renderPartsList(); engine.requestRender(); },
      'toggle-others': () => { state.hideOthers = !state.hideOthers; applyOthers(); renderInfo(); },
      practice: () => setPractice(!state.practice),
      'mode-practice': () => setMode('practice'),
      'mode-demo': () => setMode('demo'),
      'demo-toggle': () => state.demo?.toggle(),
      'demo-restart': () => state.demo?.restart(),
      'demo-speed': () => state.demo?.setSpeed(state.demo.speed < 1 ? 1 : 0.5),
      'start-fresh': () => { state.assembly.startFresh(); select(null); },
      'install-all': () => { state.assembly.installAll(); select(null); },
      'rot-ccw': () => state.assembly.rotate(state.selected, 15),
      'rot-cw': () => state.assembly.rotate(state.selected, -15),
      'rot-90': () => state.assembly.rotate(state.selected, -90),
      flip: () => state.assembly.flip(state.selected),
      'try-install': () => attemptInstall(state.selected),
      uninstall: async () => {
        const part = state.selected;
        const r = await state.assembly.uninstall(part);
        if (!r.ok && r.message) { flash(part); setFeedback({ severity: 'error', message: r.message }); renderInfo(); status(r.message); }
        else if (r.ok) { select(part); setFeedback({ severity: 'ok', message: 'Desinstalada: volvió a la zona de espera. Selecciónala para instalarla de nuevo.' }); renderInfo(); }
      }
    };
    actions[el.dataset.action]?.();
  };

  const canvas = engine.renderer.domElement;
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  stage.addEventListener('pointerdown', onDragDown, true);
  stage.addEventListener('pointermove', onDragMove, true);
  stage.addEventListener('pointerup', onDragUp, true);
  stage.addEventListener('pointercancel', onDragUp, true);
  stage.addEventListener('keydown', onKey);
  ui.addEventListener('click', onClick);

  renderPartsList();
  engine.requestRender();
  status('Modelo listo. Gira la vista o selecciona una pieza.');

  return {
    engine, parts: pc.parts,
    select: id => select(pc.parts.get(id) || null),
    inspect: id => inspect(pc.parts.get(id)),
    setExploded, setInterior, resetView, setPractice,
    // Enfoca un paso de la ruta: si tiene práctica 3D, abre la práctica con su
    // primera pieza pendiente; si no, selecciona la pieza relacionada.
    // `mode` ('practice' | 'demo') elige la modalidad; si se omite, se conserva la actual.
    focusStep(step, { mode } = {}) {
      const practiceIds = (step.practice || []).filter(id => pc.parts.has(id));
      if (practiceIds.length) {
        setPractice(true);
        if (mode) setMode(mode);
        const a = state.assembly;
        const target = practiceIds.map(id => pc.parts.get(id)).find(p => a.isLoose(p)) || pc.parts.get(practiceIds[0]);
        select(target);
        return;
      }
      if (state.practice) setPractice(false);
      exitInspect();
      const part = step.focus && pc.parts.get(step.focus);
      select(part || null);
      if (part) center();
    },
    setMode,
    get mode() { return state.mode; },
    demo: () => state.demo,
    installedMap: () => state.assembly?.installedMap() || null,
    isInstalled: id => { const e = state.assembly?.entries.get(id); return e ? e.installed : null; },
    assembly: () => state.assembly,
    dispose() {
      explodeTween?.cancel();
      labels.dispose();
      state.demo?.dispose();
      state.assembly?.dispose();
      stage.removeEventListener('pointerdown', onDragDown, true);
      stage.removeEventListener('pointermove', onDragMove, true);
      stage.removeEventListener('pointerup', onDragUp, true);
      stage.removeEventListener('pointercancel', onDragUp, true);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      stage.removeEventListener('keydown', onKey);
      ui.removeEventListener('click', onClick);
      engine.dispose();
      kit.dispose();
      ui.remove();
    }
  };
}
