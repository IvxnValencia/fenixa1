// Cargador de la guía de ensamblaje.
//
// Script clásico (como el resto de FENIXA). Al abrir #ensamblaje importa
// guide.js, que genera la ruta a partir de Mi build; el visor 3D (y Three.js)
// solo se descarga si el navegador admite WebGL e import maps. Al salir de la
// ruta se libera todo.
(() => {
  'use strict';
  const section = document.getElementById('ensamblaje');
  const host = document.getElementById('assemblyViewer');
  const preview = host?.closest('.assembly-preview');
  const statusEl = document.getElementById('assemblyViewerStatus');
  if (!section || !host || !preview) return;

  const base = document.currentScript.src;
  const guideUrl = new URL('guide.js?v=8', base).href;
  const viewerUrl = new URL('3d/viewer.js?v=7', base).href;
  let guide = null, loading = false, generation = 0;

  function supportsWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      return Boolean(gl);
    } catch { return false; }
  }
  const supportsImportMaps = () => typeof HTMLScriptElement.supports === 'function' && HTMLScriptElement.supports('importmap');

  function setStatus(text, state) {
    if (statusEl) statusEl.textContent = text;
    if (state) host.dataset.state = state;
  }

  async function open() {
    if (guide || loading) return;
    loading = true;
    const run = ++generation;
    const canUse3D = supportsWebGL() && supportsImportMaps();
    setStatus(canUse3D ? 'Cargando el visor 3D…' : 'Tu navegador no puede mostrar el visor 3D. La guía y el checklist siguen disponibles.', canUse3D ? 'loading' : 'unsupported');
    try {
      const { createGuide } = await import(guideUrl);
      if (run !== generation || section.hidden) return; // el usuario ya salió
      guide = createGuide({ section, host, canUse3D, viewerUrl, onStatus: text => setStatus(text) });
      await guide.ready;
      if (run !== generation) return;
      if (guide.viewer) { preview.classList.add('is-3d'); setStatus('Modelo listo. Gira la vista o selecciona una pieza.', 'ready'); }
    } catch (error) {
      console.error('[FENIXA] No se pudo cargar la guía de ensamblaje:', error);
      setStatus('No se pudo cargar el visor 3D. Revisa tu conexión y vuelve a abrir la guía; el checklist sigue disponible.', 'error');
    } finally {
      loading = false;
    }
  }

  function close() {
    generation++;
    if (!guide) return;
    guide.dispose();
    guide = null;
    preview.classList.remove('is-3d');
    host.dataset.state = 'idle';
  }

  function sync() { section.hidden ? close() : open(); }
  // navigation.js se registra antes, así que la sección ya está mostrada u oculta.
  window.addEventListener('hashchange', sync);
  sync();
  window.FENIXA_ASSEMBLY_GUIDE = { get: () => guide };
  window.FENIXA_ASSEMBLY_VIEWER = { get: () => guide?.viewer || null };
})();
