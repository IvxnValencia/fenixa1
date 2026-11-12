(() => {
  'use strict';
  const key = 'fenixa-my-build-v1';
  const products = window.FENIXA_CATALOG.products;
  const byId = new Map(products.map(p => [p.id, p]));
  function clean(value) {
    const result = [];
    if (!Array.isArray(value)) return result;
    for (const id of value) {
      const p = byId.get(id);
      if (p && !result.some(other => byId.get(other).category === p.category)) result.push(id);
    }
    return result;
  }
  // Optional per-piece reasons live under their own key so the id list format never changes.
  const reasonKey = 'fenixa-my-build-reasons-v1';
  function cleanReasons(value, list) {
    const result = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    for (const id of list) if (typeof value[id] === 'string' && value[id].trim()) result[id] = value[id].trim().slice(0, 240);
    return result;
  }
  let ids = [], reasons = {}, saved = true;
  try { ids = clean(JSON.parse(localStorage.getItem(key) || '[]')); } catch { saved = false; }
  try { reasons = cleanReasons(JSON.parse(localStorage.getItem(reasonKey) || '{}'), ids); } catch { reasons = {}; }
  function write(next, nextReasons = reasons) {
    ids = clean(next);
    reasons = cleanReasons(nextReasons, ids);
    try {
      localStorage.setItem(key, JSON.stringify(ids));
      localStorage.setItem(reasonKey, JSON.stringify(reasons));
      saved = true;
    } catch { saved = false; }
    window.dispatchEvent(new Event('fenixa-build-changed'));
    return saved;
  }
  function add(id) {
    const p = byId.get(id);
    if (!p) return false;
    if (check(p).status === 'conflict') return false;
    write([...ids.filter(other => byId.get(other).category !== p.category), id]);
    return true;
  }
  function check(p) {
    return window.FENIXA_FIT.check(p, ids.map(id=>byId.get(id)).filter(other=>other.category!==p.category));
  }
  function nextStep() {
    const chosen=ids.map(id=>byId.get(id)), has=category=>chosen.some(p=>p.category===category);
    const missing=['cpu','board','ram','storage','power','case'].find(category=>!has(category));
    if(missing)return {category:missing,reason:''};
    const cpu=chosen.find(p=>p.category==='cpu'), facts=window.FENIXA_SPECS?.facts(cpu);
    if(facts?.verified && facts.values.requiresGpu===true && !has('gpu')) {
      return {category:'gpu',reason:`${cpu.name} requiere una gráfica dedicada según su ficha. Las salidas de vídeo de la placa no sustituyen esa gráfica.`};
    }
    if(facts?.verified && /sin disipador incluido/i.test(facts.values.thermal||'') && !has('cooler')) {
      return {category:'cooler',reason:`Refrigeración publicada para ${cpu.name}: «${facts.values.thermal}». Confirma el PN y el contenido local antes de elegir refrigeración; comprueba montaje, espacio y capacidad para tu carga.`};
    }
    return null;
  }
  function candidates(category, {query = '', max = '', hideConflicts = true} = {}) {
    const rest = ids.map(id => byId.get(id)).filter(p => p.category !== category);
    return products.filter(p => p.category === category && `${p.name} ${p.sku}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')))
      .map(product => ({product, fit: window.FENIXA_FIT.check(product, rest), price: window.FENIXA_MARKET.price(product)}))
      .filter(c => (!hideConflicts || c.fit.status !== 'conflict') && (max === '' || (Number.isFinite(Number(max)) && Number(max) >= 0 && c.price !== null && c.price <= Number(max))))
      .sort((a,b) => Number(a.fit.status === 'conflict') - Number(b.fit.status === 'conflict') || Number(Boolean(b.fit.matched)) - Number(Boolean(a.fit.matched)) || (a.price ?? Infinity) - (b.price ?? Infinity) || a.product.name.localeCompare(b.product.name,'es'));
  }
  window.FENIXA_MY_BUILD = {ids: () => ids.slice(), saved: () => saved, add, check, candidates, nextStep,
    remove: id => write(ids.filter(other => other !== id)),
    reasons: () => ({...reasons}), reason: id => reasons[id] || '',
    importParts: (parts, partReasons = {}) => write(parts, partReasons), clear: () => write([], {})};
})();
