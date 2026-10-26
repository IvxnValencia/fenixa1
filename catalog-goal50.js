// Separate, reversible additions. Never rewrite saved IDs, offers or old profiles.
(() => {
  'use strict';
  const catalog = window.FENIXA_CATALOG;
  const profiles = window.FENIXA_VERIFIED_ADDITIONS.profiles;
  const added = [], rejected = [], skipped = [];
  const allowed = new Set(['www.amd.com', 'semiconductor.samsung.com', 'download.semiconductor.samsung.com', 'www.msi.com', 'www.noctua.at', 'seasonic.com', 'www.kingston.com', 'www.fractal-design.com', 'www.intel.com', 'www.keychron.com', 'www.logitech.com', 'www.logitechg.com', 'hub.sync.logitech.com', 'futureisnow.logitech.com']);
  for (const row of window.FENIXA_GOAL50_DATA || []) {
    let source;
    try { source = new URL(row.source); } catch { rejected.push(row.name || 'Invalid source'); continue; }
    if (source.protocol !== 'https:' || !allowed.has(source.hostname) || !catalog.categories.some(c => c.id === row.category) ||
        !/^model-[a-z0-9-]+$/.test(row.idSuggested || '') || typeof row.name !== 'string' || !row.name.trim() ||
        typeof row.sku !== 'string' || !row.sku.trim() || !row.scope || !/^\d{4}-\d{2}-\d{2}$/.test(row.checkedAt || '') ||
        !row.values || Array.isArray(row.values) || Object.values(row.values).some(v => typeof v === 'number' && (!Number.isFinite(v) || v <= 0))) {
      rejected.push(row.name || 'Invalid row'); continue;
    }
    if (catalog.products.some(p => p.id === row.idSuggested || p.name === row.name || (p.category === row.category && p.sku === row.sku))) {
      skipped.push(row.idSuggested); continue;
    }
    // A same-name profile without a product must also be reviewed rather than overwritten.
    if (profiles[row.name]) { rejected.push(row.name + ': existing profile'); continue; }
    const v = row.values;
    const keys={cpu:[['cores','núcleos'],['threads','hilos'],['socket',''],['memory','']],storage:[['capacity','GB'],['format',''],['pcie','']],board:[['socket',''],['memory',''],['format','']],fan:[['format',''],['connection','']],power:[['watts','W'],['efficiency','']],ram:[['capacity','GB'],['memory',''],['rate','MT/s'],['format','']],case:[['format',''],['gpuMax','mm GPU']],cooler:[['coolerType',''],['height','mm']],gpu:[['vram','GB'],['memoryType','']],setup:[['type',''],['connection','']]};
    const summary=row.summary||(keys[row.category]||[]).filter(([k])=>v[k]!=null).map(([k,u])=>String(v[k])+(u?' '+u:'')).join(' · ');
    catalog.products.push({id: row.idSuggested, category: row.category, name: row.name, sku: row.sku, canonicalModel: row.modelKey,
      summary, source: row.source, sourceType: 'manufacturer', priceKind: 'spec_only',
      image: `assets/categories/${row.category}.png`, imageKind: 'category',
      imageNote: 'Ilustración de categoría, no fotografía de este modelo. Foto oficial exacta pendiente.'});
    profiles[row.name] = {displayName: row.name, source: row.source, checkedAt: row.checkedAt, scope: row.scope,
      modelKey: row.modelKey, values: {...row.values}};
    added.push(row.idSuggested);
  }
  window.FENIXA_GOAL50 = {target: 50, added, skipped, rejected};
})();
