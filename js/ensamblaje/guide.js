// Controlador de la guía de ensamblaje (fases 4 y 6).
//
// Une Mi build con la guía: lee las piezas de FENIXA_MY_BUILD, crea el perfil
// de montaje (build-profile.js), genera la ruta (route.js), dibuja la revisión
// previa, la zona de instrucciones del paso actual (con tips por categorías) y
// el checklist, y crea el visor 3D con solo las piezas de la build.
// Guarda el avance por build (progress-store.js) y se regenera con
// `fenixa-build-changed`.
import { buildProfile } from './build-profile.js';
import { generateRoute, sceneSpec } from './route.js';
import { tipsForStep, TIP_TYPES } from './tips.js';
import { createProgressStore } from './progress-store.js';

const RULES_BY_CATEGORY = { cpu: ['cpu'], ram: ['ram'], storage: ['m2'], gpu: ['gpu'], power: ['power'], cooler: ['cooler', 'aio', 'stock'] };
const SCENE_ID = { cpu: ['cpu'], board: ['board'], case: ['case'], power: ['psu'], gpu: ['gpu'], storage: ['m2'], cooler: ['cooler', 'radiator'], ram: ['ram-1', 'ram-2'] };
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------------------------------------------------------------- datos
function readBuild() {
  const catalog = window.FENIXA_CATALOG?.products || [];
  const byId = new Map(catalog.map(p => [p.id, p]));
  const ids = window.FENIXA_MY_BUILD?.ids() || [];
  const products = ids.map(id => byId.get(id)).filter(Boolean);
  const parts = products.map(p => {
    const f = window.FENIXA_SPECS?.facts(p) || { values: {}, verified: false };
    return { id: p.id, category: p.category, name: f.displayName || p.name, summary: p.summary || '', facts: { verified: Boolean(f.verified), values: f.values || {} } };
  });
  // Conflictos de formato y espacio del verificador existente (socket y memoria los revisa el perfil).
  const fitIssues = [];
  for (const p of products) {
    const r = window.FENIXA_FIT?.check(p, products.filter(o => o.id !== p.id));
    if (r?.status === 'conflict' && /formato|espacio/i.test(r.label || '')) fitIssues.push({ partId: p.id, label: r.label, reason: r.reason });
  }
  return { parts, fitIssues };
}

// Datos de ficha que se muestran en la inspección ("Tu pieza").
function detailsFor(profile) {
  const out = {};
  const row = (label, value, unit = '') => (value === undefined || value === null || value === '' ? null : [label, `${value}${unit}`]);
  const v = cat => (profile.parts[cat]?.facts.verified ? profile.parts[cat].facts.values : {});
  const rows = {
    cpu: [row('Socket', v('cpu').socket), row('Memoria', v('cpu').memory), row('Gráficos integrados', v('cpu').requiresGpu === true ? 'No' : v('cpu').graphics), row('Refrigeración', v('cpu').thermal)],
    board: [row('Formato', v('board').format), row('Socket', v('board').socket), row('Memoria', v('board').memory), row('Ranuras DIMM', v('board').slots), row('Ranuras M.2', v('board').m2Slots)],
    ram: [row('Tipo', v('ram').memory), row('Módulos', v('ram').modules), row('Formato', v('ram').format), row('Perfil', v('ram').profiles)],
    storage: [row('Formato', v('storage').format), row('Interfaz', v('storage').pcie)],
    gpu: [row('Longitud', v('gpu').length, ' mm'), row('Alimentación', v('gpu').powerConnectors || v('gpu').connectors), row('Fuente recomendada', v('gpu').recommendedPsu, ' W')],
    power: [row('Potencia', v('power').watts, ' W'), row('Formato', v('power').format), row('Fondo', v('power').length, ' mm')],
    case: [row('Placas admitidas', v('case').format), row('GPU máx.', v('case').gpuMax, ' mm'), row('Disipador máx.', v('case').coolerMax, ' mm')],
    cooler: [row('Tipo', v('cooler').format), row('Altura', v('cooler').height, ' mm'), row('Sockets', v('cooler').sockets)]
  };
  for (const [cat, list] of Object.entries(rows)) {
    if (!profile.parts[cat]) continue;
    const clean = list.filter(Boolean);
    if (clean.length) for (const id of SCENE_ID[cat]) out[id] = clean;
  }
  return out;
}

// Incompatibilidades que bloquean instalar una pieza en la práctica.
function compatibilityFor(profile) {
  const byId = new Map(Object.values(profile.parts).map(p => [p.id, p.category]));
  const out = {};
  for (const issue of profile.issues.filter(i => i.severity === 'conflict')) {
    for (const id of issue.partIds) for (const key of RULES_BY_CATEGORY[byId.get(id)] || []) out[key] = out[key] || issue.message;
  }
  return out;
}

// ---------------------------------------------------------------- guía
export function createGuide({ section, host, canUse3D, viewerUrl, onStatus, store = createProgressStore() }) {
  const stepsEl = section.querySelector('#assemblySteps');
  stepsEl?.setAttribute('role', 'list');
  stepsEl?.setAttribute('aria-label', 'Pasos del montaje');
  const panelEl = section.querySelector('#assemblyStepPanel');
  const progressText = section.querySelector('#progressText');
  const progressBar = section.querySelector('#progressBar');
  const previewText = section.querySelector('#assemblyPreviewText');
  const issuesEl = section.querySelector('#assemblyIssues');
  const resetButton = section.querySelector('#resetAssembly');

  // done: pasos hechos · active: paso abierto en la zona de instrucciones ·
  // installed: piezas instaladas en la práctica (para guardar aunque el visor no exista) ·
  // mode: modalidad ('practice' = A, 'demo' = B), común a todas las builds.
  const state = { profile: null, route: [], done: new Set(), active: null, installed: null, viewer: null, disposed: false, generation: 0, mode: store.getMode() };

  function toast(message) { if (typeof window.showToast === 'function') window.showToast(message); }
  const stepIndex = id => state.route.findIndex(s => s.id === id);
  const activeStep = () => state.route.find(s => s.id === state.active) || null;

  function persist() {
    if (!state.profile || state.profile.empty) return;
    store.save(state.profile.signature, { done: [...state.done], active: state.active, installed: state.installed || undefined });
  }

  // --------------------------------------------------------- revisión previa
  function renderIssues() {
    const p = state.profile;
    if (!issuesEl) return;
    if (p.empty) {
      issuesEl.innerHTML = `<div class="assembly-empty"><strong>Tu build está vacía.</strong><p>Añade piezas en Mi build para generar una ruta de montaje con tus componentes. Mientras tanto, el visor muestra un PC de referencia genérico.</p><a class="primary-button av-small" href="#mi-build">Ir a Mi build</a></div>`;
      issuesEl.hidden = false;
      return;
    }
    const main = p.issues.filter(i => i.severity === 'conflict' || i.severity === 'missing');
    const rest = p.issues.filter(i => i.severity === 'warning' || i.severity === 'info');
    const item = i => `<li class="assembly-issue assembly-issue--${i.severity}"><span>${{ conflict: 'Incompatible', missing: 'Falta', warning: 'Revisa', info: 'Nota' }[i.severity]}</span>${esc(i.message)}</li>`;
    issuesEl.innerHTML = `<p class="assembly-build-line">Ruta generada para tu build: <strong>${Object.keys(p.parts).length} piezas</strong>. <a href="#mi-build">Revisar Mi build</a></p>
      ${main.length ? `<ul class="assembly-issues">${main.map(item).join('')}</ul>` : '<p class="assembly-ok">Sin incompatibilidades detectadas en los datos disponibles. La revisión es parcial: no certifica el montaje completo.</p>'}
      ${rest.length ? `<details class="assembly-more"><summary>${rest.length} ${rest.length === 1 ? 'aviso' : 'avisos'} antes de empezar</summary><ul class="assembly-issues">${rest.map(item).join('')}</ul></details>` : ''}`;
    issuesEl.hidden = false;
  }

  // --------------------------------------------------------- zona de instrucciones
  const BASIS = { ficha: 'Según la ficha de tu pieza', parcial: 'Parte según tu ficha, parte genérico', generico: 'Procedimiento genérico' };
  function renderPanel() {
    const s = activeStep();
    if (!panelEl) return;
    if (!s) { panelEl.hidden = true; panelEl.innerHTML = ''; return; }
    const i = stepIndex(s.id), total = state.route.length, done = state.done.has(s.id);
    const tips = tipsForStep(s, state.profile);
    // Las precauciones y errores comunes se muestran siempre; el resto, bajo demanda.
    const key = tips.filter(t => t.type === 'caution' || t.type === 'mistake');
    const more = tips.filter(t => t.type !== 'caution' && t.type !== 'mistake');
    const tip = t => `<li class="assembly-tip assembly-tip--${t.type}"><span>${TIP_TYPES[t.type].label}</span>${esc(t.text)}</li>`;
    const practice = s.practice.length > 0 && Boolean(state.viewer);
    panelEl.innerHTML = `
      <header class="assembly-step-head">
        <span class="assembly-step-count">Paso ${i + 1} de ${total}${done ? ' · hecho' : ''}</span>
        <h3 id="assemblyStepTitle" tabindex="-1">${esc(s.title)}</h3>
        <p>${esc(s.summary)}</p>
      </header>
      ${practice ? `<div class="assembly-modes" role="group" aria-label="Modalidad de aprendizaje">
        <button type="button" data-mode="practice" aria-pressed="${state.mode === 'practice'}">Hazlo tú</button>
        <button type="button" data-mode="demo" aria-pressed="${state.mode === 'demo'}">Ver demostración</button></div>
        <p class="assembly-hint">${state.mode === 'demo' ? 'El visor muestra la demostración en bucle. No instala nada: después hazlo tú.' : 'Practícalo en el visor 3D: la pieza ya está seleccionada.'} <button class="assembly-link" type="button" data-show-viewer>Ir al visor</button></p>` : ''}
      <ol class="assembly-instructions">${s.instructions.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
      <p class="assembly-basis assembly-basis--${s.basis}">${BASIS[s.basis] || ''}${s.note ? ` · ${esc(s.note)}` : ''}</p>
      ${key.length ? `<ul class="assembly-tips">${key.map(tip).join('')}</ul>` : ''}
      ${more.length ? `<details class="assembly-more-tips"><summary>Tips, buenas prácticas y datos (${more.length})</summary><ul class="assembly-tips">${more.map(tip).join('')}</ul></details>` : ''}
      <div class="assembly-step-nav">
        <button class="secondary-button av-small" type="button" data-nav="prev" ${i === 0 ? 'disabled' : ''}>Anterior</button>
        ${done ? `<button class="secondary-button av-small" type="button" data-toggle-done>Marcar como pendiente</button>` : `<button class="primary-button av-small" type="button" data-complete>${i === total - 1 ? 'Marcar como hecho' : 'Hecho, siguiente paso'}</button>`}
        <button class="secondary-button av-small" type="button" data-nav="next" ${i === total - 1 ? 'disabled' : ''}>Siguiente</button>
      </div>`;
    panelEl.hidden = false;
  }

  // --------------------------------------------------------- checklist
  function renderSteps() {
    const route = state.route;
    if (!route.length) {
      stepsEl.innerHTML = '<p class="assembly-steps-empty">Añade piezas a Mi build para ver tu ruta de montaje.</p>';
      updateProgress();
      renderPanel();
      return;
    }
    // Barra de pasos: un segmento por paso (hecho, actual o pendiente). Sustituye al
    // checklist, que repetía el paso a paso y no se veía junto al visor.
    stepsEl.innerHTML = route.map((s, i) => {
      const done = state.done.has(s.id), active = state.active === s.id;
      return `<div class="step-seg-item" role="listitem"><button class="step-seg${done ? ' is-done' : ''}${active ? ' is-active' : ''}" type="button" data-step="${esc(s.id)}" ${active ? 'aria-current="step"' : ''} aria-label="Paso ${i + 1}: ${esc(s.title)}${done ? ' (hecho)' : ''}" title="${i + 1}. ${esc(s.title)}"><span class="step-seg-bar"></span><span class="step-seg-num">${i + 1}</span></button></div>`;
    }).join('');
    updateProgress();
    renderPanel();
  }

  function updateProgress() {
    const total = state.route.length, done = state.route.filter(s => state.done.has(s.id)).length;
    progressText.textContent = total ? `${done} de ${total} completados` : 'Sin ruta';
    progressBar.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
    const next = state.route.find(s => !state.done.has(s.id));
    previewText.textContent = !total ? 'Añade piezas a Mi build para generar tu ruta.' : next ? `Siguiente: ${next.title}. ${next.summary}` : '¡Ruta completa! Tu equipo está listo para el primer encendido.';
  }

  function setDone(id, on) {
    if (on) state.done.add(id); else state.done.delete(id);
    persist();
    renderSteps();
  }

  // Abre un paso en la zona de instrucciones y lo enfoca en el visor.
  // Volver a un paso anterior no desmarca nada.
  function openStep(id, { focusViewer = true } = {}) {
    const step = state.route.find(s => s.id === id);
    if (!step) return;
    state.active = id;
    persist();
    renderSteps();
    if (focusViewer && state.viewer) state.viewer.focusStep(step);
  }

  function goto(delta) {
    const i = stepIndex(state.active);
    const next = state.route[Math.min(state.route.length - 1, Math.max(0, i + delta))];
    if (next) openStep(next.id);
    panelEl?.querySelector('h3')?.focus?.();
  }

  // La práctica marca el paso al instalar todas sus piezas, y lo desmarca solo
  // si el usuario desinstala una de ellas. Empezar de cero en la práctica no
  // borra los pasos marcados a mano (pueden estar hechos en el PC real).
  function onAssemblyChange(change) {
    if (!state.viewer) return;
    state.installed = state.viewer.installedMap();
    const stepOf = id => state.route.find(s => s.practice.includes(id));
    if (change.installedId) {
      const s = stepOf(change.installedId);
      if (s && s.practice.filter(id => state.viewer.isInstalled(id) !== null).every(id => state.viewer.isInstalled(id))) state.done.add(s.id);
    }
    if (change.uninstalledId) { const s = stepOf(change.uninstalledId); if (s) state.done.delete(s.id); }
    persist();
    renderSteps();
  }

  // --------------------------------------------------------- eventos
  const onStepsClick = e => {
    const done = e.target.closest('[data-done]');
    if (done) return setDone(done.dataset.done, !state.done.has(done.dataset.done));
    const open = e.target.closest('[data-step]');
    if (open) openStep(open.dataset.step);
  };
  const onPanelClick = e => {
    const modeBtn = e.target.closest('[data-mode]');
    if (modeBtn) {
      state.mode = modeBtn.dataset.mode;
      store.setMode(state.mode);
      const step = activeStep();
      if (step && state.viewer) state.viewer.focusStep(step, { mode: state.mode });
      return renderPanel();
    }
    if (e.target.closest('[data-show-viewer]')) return host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const nav = e.target.closest('[data-nav]');
    if (nav) return goto(nav.dataset.nav === 'next' ? 1 : -1);
    if (e.target.closest('[data-complete]')) {
      state.done.add(state.active);
      persist();
      const i = stepIndex(state.active);
      if (i < state.route.length - 1) goto(1); else renderSteps();
      return;
    }
    if (e.target.closest('[data-toggle-done]')) setDone(state.active, false);
  };
  stepsEl.addEventListener('click', onStepsClick);
  panelEl?.addEventListener('click', onPanelClick);

  const onReset = () => {
    state.done.clear();
    state.installed = null;
    state.active = state.route[0]?.id || null;
    if (state.profile) store.clear(state.profile.signature);
    state.viewer?.assembly()?.startFresh();
    renderSteps();
    toast('Guía reiniciada desde el primer paso.');
  };
  resetButton?.addEventListener('click', onReset);

  // --------------------------------------------------------- visor
  async function mountViewer() {
    const run = ++state.generation;
    state.viewer?.dispose();
    state.viewer = null;
    if (!canUse3D) return;
    const p = state.profile;
    const { createAssemblyViewer } = await import(viewerUrl);
    if (run !== state.generation || state.disposed) return;
    state.viewer = await createAssemblyViewer(host, {
      spec: p.empty ? undefined : sceneSpec(p),
      compatibility: compatibilityFor(p),
      details: detailsFor(p),
      onStatus,
      mode: state.mode,
      initialInstalled: state.installed,
      onModeChange: mode => { state.mode = mode; store.setMode(mode); renderPanel(); },
      onAssemblyChange
    });
    renderSteps();
  }

  // --------------------------------------------------------- ciclo
  async function refresh({ announce = false } = {}) {
    const { parts, fitIssues } = readBuild();
    const profile = buildProfile(parts, { fitIssues });
    const changed = profile.signature !== state.profile?.signature;
    state.profile = profile;
    if (!changed && state.viewer) return;
    state.route = generateRoute(profile);
    // Recupera el avance guardado de esta build (solo pasos que siguen existiendo).
    const saved = profile.empty ? null : store.load(profile.signature);
    const ids = new Set(state.route.map(s => s.id));
    state.done = new Set((saved?.done || []).filter(id => ids.has(id)));
    state.installed = saved?.installed && Object.keys(saved.installed).length ? saved.installed : null;
    state.active = saved?.active && ids.has(saved.active) ? saved.active : (state.route.find(s => !state.done.has(s.id)) || state.route[0])?.id || null;
    renderIssues();
    renderSteps();
    await mountViewer();
    if (announce) toast('La guía se actualizó con los cambios de tu build.');
    else if (saved && state.done.size) toast(`Retomas tu montaje: ${state.done.size} de ${state.route.length} pasos hechos.`);
  }

  const onBuildChanged = () => { if (!state.disposed) refresh({ announce: true }); };
  window.addEventListener('fenixa-build-changed', onBuildChanged);

  return {
    ready: refresh(),
    get viewer() { return state.viewer; },
    get profile() { return state.profile; },
    get route() { return state.route; },
    get done() { return [...state.done]; },
    get active() { return state.active; },
    openStep,
    dispose() {
      state.disposed = true;
      state.generation++;
      window.removeEventListener('fenixa-build-changed', onBuildChanged);
      resetButton?.removeEventListener('click', onReset);
      stepsEl.removeEventListener('click', onStepsClick);
      panelEl?.removeEventListener('click', onPanelClick);
      state.viewer?.dispose();
      state.viewer = null;
    }
  };
}
