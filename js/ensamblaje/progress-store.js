// Persistencia del avance de la guía (módulo PURO: el almacenamiento se inyecta).
//
// Se guarda por build (firma = ids de las piezas ordenados), en el mismo
// navegador que Mi build:
//   done      → pasos marcados como hechos
//   active    → paso abierto
//   installed → piezas instaladas en la práctica { partId: mountId }
// La modalidad elegida (práctica o demostración) se guarda aparte, para todas las builds.
// Si el almacenamiento falla (modo privado, cuota), la guía sigue funcionando en memoria.

export const PROGRESS_KEY = 'fenixa-assembly-progress-v1';
export const MODE_KEY = 'fenixa-assembly-mode-v1';
const LIMIT = 8;          // builds recordadas como máximo
const ID = /^[\w.-]{1,80}$/;

function safeStorage() {
  try { return window.localStorage; } catch { return null; }
}

function cleanRecord(r) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return null;
  const done = Array.isArray(r.done) ? [...new Set(r.done.filter(id => typeof id === 'string' && ID.test(id)))].slice(0, 40) : [];
  const installed = {};
  if (r.installed && typeof r.installed === 'object' && !Array.isArray(r.installed)) {
    for (const [k, v] of Object.entries(r.installed)) if (ID.test(k) && typeof v === 'string' && ID.test(v)) installed[k] = v;
  }
  const active = typeof r.active === 'string' && ID.test(r.active) ? r.active : null;
  const updatedAt = Number.isFinite(r.updatedAt) ? r.updatedAt : 0;
  return { done, installed, active, updatedAt };
}

export function createProgressStore(storage = safeStorage(), now = () => Date.now()) {
  let saved = true;
  function readAll() {
    try {
      const data = JSON.parse(storage?.getItem(PROGRESS_KEY) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch { return {}; }
  }
  function writeAll(all) {
    // Conserva solo las builds más recientes.
    const entries = Object.entries(all).sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0)).slice(0, LIMIT);
    try { storage?.setItem(PROGRESS_KEY, JSON.stringify(Object.fromEntries(entries))); saved = Boolean(storage); }
    catch { saved = false; }
    return saved;
  }
  return {
    get saved() { return saved; },
    load(signature) {
      if (!signature) return null;
      return cleanRecord(readAll()[signature]);
    },
    save(signature, record) {
      if (!signature) return false;
      const clean = cleanRecord({ ...record, updatedAt: now() });
      if (!clean) return false;
      const all = readAll();
      all[signature] = clean;
      return writeAll(all);
    },
    clear(signature) {
      const all = readAll();
      delete all[signature];
      return writeAll(all);
    },
    getMode() {
      try { const m = storage?.getItem(MODE_KEY); return m === 'demo' ? 'demo' : 'practice'; } catch { return 'practice'; }
    },
    setMode(mode) {
      try { storage?.setItem(MODE_KEY, mode === 'demo' ? 'demo' : 'practice'); } catch { /* sin almacenamiento: queda en memoria */ }
    }
  };
}
