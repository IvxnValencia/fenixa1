(() => {
  'use strict';
  const {products, builds} = window.FENIXA_CATALOG;
  const byId = new Map(products.map(p => [p.id, p]));
  const drafts = new Map();
  const originals = new Map(builds.map(b => [b.id, b]));
  function get(id) {
    const original = originals.get(id);
    if (!original) return null;
    const parts = (drafts.get(id) || original.parts).slice();
    const modified = parts.some((p, i) => p !== original.parts[i]);
    return {...original, parts, caseId: parts.find(p => byId.get(p).category === 'case') || original.caseId,
      modified,
      name: modified ? 'Variante de ' + original.name : original.name,
      description: modified ? 'Has cambiado la propuesta original. La lista de abajo contiene tu selección actual; revisa sus requisitos antes de comprar, incluidos gráficos y refrigeración.' : original.description,
      tags: modified ? ['Personalizada', 'Revisión pendiente'] : original.tags};
  }
  function replace(id, index, productId) {
    const build = get(id), product = byId.get(productId);
    if (!build || !Number.isInteger(index) || index < 0 || index >= build.parts.length || !product) return false;
    if (byId.get(build.parts[index]).category !== product.category) return false;
    const next = build.parts.slice(); next[index] = productId;
    drafts.set(id, next);
    return true;
  }
  function candidates(id, index, filters = {}) {
    const build = get(id), current = byId.get(build?.parts[index]);
    if (!current) return [];
    // Remove the old part before evaluating a replacement against the rest.
    const remaining = build.parts.filter((_, i) => i !== index).map(id => byId.get(id));
    return products.filter(p => p.category === current.category).map(product => ({product,
      fit: window.FENIXA_FIT.check(product, remaining), price: window.FENIXA_MARKET.price(product)
    })).filter(c => (!filters.hideConflicts || c.fit.status !== 'conflict') &&
      (!filters.matchesOnly || c.fit.matched) &&
      (!(filters.max !== '' && filters.max != null) || (Number.isFinite(Number(filters.max)) && Number(filters.max)>=0 && c.price!==null && c.price<=Number(filters.max))))
    .sort((a, b) => Number(a.fit.status === 'conflict') - Number(b.fit.status === 'conflict') ||
      Number(Boolean(b.fit.matched)) - Number(Boolean(a.fit.matched)) ||
      (a.price ?? Infinity) - (b.price ?? Infinity) || a.product.name.localeCompare(b.product.name, 'es'));
  }
  window.FENIXA_BUILD_EDITOR = {get, replace, candidates, reset: id => drafts.delete(id)};
})();
