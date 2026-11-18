// Quitar piezas de Mi build con opción de deshacer.
//
// Al quitar una pieza se guarda una instantánea de la build (piezas y motivos) y
// aparece una barra «Pieza retirada · Deshacer». El foco pasa al botón Deshacer
// sin desplazar la página (antes saltaba al título de Mi build). La barra se
// cierra sola a los 10 s, pero la cuenta atrás se pausa mientras el usuario la
// mira o la tiene enfocada. Si la build cambia por otra vía, el deshacer se
// descarta para no pisar ese cambio.
(() => {
  'use strict';
  const state = window.FENIXA_MY_BUILD;
  const byId = new Map(window.FENIXA_CATALOG.products.map(p => [p.id, p]));
  const name = p => (window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : p.name);
  const signature = () => state.ids().join('|');
  const DURATION = 10000;
  let bar = null, snapshot = null, expected = null, timer = 0, removing = false, returnFocus = null;

  function ensureBar() {
    if (bar) return bar;
    bar = document.createElement('div');
    bar.className = 'build-undo';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
    bar.hidden = true;
    bar.innerHTML = '<span class="build-undo-text"></span><button type="button" class="build-undo-action" data-build-undo>Deshacer</button><button type="button" class="build-undo-close" data-build-undo-close aria-label="Cerrar aviso">×</button>';
    document.body.appendChild(bar);
    bar.addEventListener('click', event => {
      if (event.target.closest('[data-build-undo]')) undo();
      else if (event.target.closest('[data-build-undo-close]')) hide(true);
    });
    bar.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); hide(true); } });
    // La cuenta atrás no corre mientras el usuario está leyendo o usando la barra.
    ['mouseenter', 'focusin'].forEach(type => bar.addEventListener(type, () => clearTimeout(timer)));
    ['mouseleave', 'focusout'].forEach(type => bar.addEventListener(type, () => { if (!bar.hidden && !bar.matches(':hover') && !bar.contains(document.activeElement)) schedule(); }));
    return bar;
  }

  // Al cerrarse sola, si tenía el foco, este vuelve a un elemento cercano.
  function schedule() { clearTimeout(timer); timer = setTimeout(() => hide(true), DURATION); }

  function show(message) {
    ensureBar();
    bar.querySelector('.build-undo-text').textContent = message;
    bar.hidden = false;
    bar.querySelector('[data-build-undo]').focus({ preventScroll: true });
    // Con el foco en la barra no corre la cuenta atrás; empieza cuando el usuario sigue con otra cosa.
    if (!bar.contains(document.activeElement)) schedule();
    else clearTimeout(timer);
  }

  function hide(restoreFocus) {
    if (!bar || bar.hidden) return;
    const hadFocus = bar.contains(document.activeElement);
    bar.hidden = true;
    clearTimeout(timer);
    snapshot = null;
    expected = null;
    if (restoreFocus && hadFocus) focusAfter();
  }

  // Tras cerrar la barra, el foco vuelve a un elemento cercano y estable.
  function focusAfter() {
    const target = typeof returnFocus === 'function' ? returnFocus() : returnFocus;
    if (target?.isConnected && !target.closest('[hidden], [inert]')) target.focus({ preventScroll: true });
  }

  // remove(id, { returnFocus }) → true si la pieza estaba en la build.
  function remove(id, options = {}) {
    const p = byId.get(id);
    if (!p || !state.ids().includes(id)) return false;
    snapshot = { ids: state.ids(), reasons: state.reasons() };
    returnFocus = options.returnFocus || null;
    removing = true;
    try { state.remove(id); } finally { removing = false; }
    expected = signature();
    show(`${name(p)} retirada de Mi build.`);
    return true;
  }

  function undo() {
    if (!snapshot) return;
    const restore = snapshot;
    hide(false);
    removing = true;
    try { state.importParts(restore.ids, restore.reasons); } finally { removing = false; }
    if (typeof window.showToast === 'function') window.showToast('Pieza recuperada en Mi build.');
    focusAfter();
  }

  window.addEventListener('fenixa-build-changed', () => {
    if (!removing && snapshot && signature() !== expected) hide(false);
  });

  window.FENIXA_BUILD_UNDO = { remove, undo, hide };
})();
