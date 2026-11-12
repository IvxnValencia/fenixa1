(() => {
  'use strict';
  const data = window.FENIXA_MARKET_DATA || {products:[],offers:{}};
  const evidence = window.FENIXA_EVIDENCE || {priceHistory:{},ratings:{}};
  const refreshWindowHours = 72;
  window.FENIXA_CATALOG.products.push(...data.products);
  window.FENIXA_CATALOG.builds.push(...(data.builds || []));
  const money = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const age = o => (Date.now()-Date.parse(o.checkedAt))/3600000;
  const valid = o => o.currency === 'COP' && Number.isFinite(o.price) && o.price > 0 && /^https:\/\//.test(o.url);
  const recent = o => age(o) >= -1 && age(o) <= refreshWindowHours;
  const offers = p => [...(data.offers[p.id] || []),...(window.FENIXA_PRICE_REVIEW?.offers?.[p.id]||[])].filter(valid).slice().sort((a,b)=>a.price-b.price);
  const available = p => offers(p).filter(o=>recent(o)&&o.status==='in_stock');
  const best = p => available(p)[0] || null;
  const snapshot = p => Number.isFinite(p?.min) && p.min > 0 && Number.isFinite(p?.max) && p.max > 0 ? {price:p.min,maxPrice:p.max,store:'Referencia de catálogo',storeId:'catalog',url:p.source,checkedAt:data.checkedAt,isSnapshot:true} : null;
  const lastObserved = p => offers(p).filter(o=>Number.isFinite(Date.parse(o.checkedAt))).sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt))[0] || snapshot(p);
  const date = o => new Date(o.checkedAt).toLocaleString('es-CO',{timeZone:'America/Bogota',dateStyle:'short',timeStyle:'short'});
  const price = p => best(p)?.price ?? null;
  const quoted = p => offers(p).filter(o=>o.status==='listed'&&o.priceVerified===true&&recent(o)).sort((a,b)=>a.price-b.price)[0]||null;
  const fixed = p => best(p) || quoted(p) || offers(p).filter(o=>o.status==='in_stock' && Number.isFinite(Date.parse(o.checkedAt)) && age(o)>=-1).sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt) || a.price-b.price)[0] || null;
  const priceText = p => {
    const offer = fixed(p);
    return offer ? money(offer.price) : 'Precio por confirmar';
  };
  const priceLabel = p => {
    const offer = fixed(p);
    if (!offer) return 'Sin oferta exacta verificada';
    return `${offer.store} · ${offer.status==='listed'?'precio publicado; stock por confirmar':recent(offer)?'consultado':'consulta vencida'} · ${date(offer)}`;
  };
  function searches(p) {
    const query = p.searchName || p.name;
    return `<div class="market-searches"><span>Buscar más opciones · sin precio verificado</span><a href="https://listado.mercadolibre.com.co/${encodeURIComponent(query.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g,'-'))}" target="_blank" rel="noopener noreferrer">Mercado Libre ↗</a><a href="https://www.amazon.com/s?k=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer">Amazon ↗</a><small>Amazon: confirma envío a Colombia, importación y garantía. Estas búsquedas no entran en el cálculo.</small></div>`;
  }
  function history(p) {
    const recorded = evidence.priceHistory?.[p.id] || [];
    const observations = [...recorded, ...offers(p)].filter(o => valid(o) && o.status !== 'confirm' && o.status !== 'listed' && o.storeId && o.store && Number.isFinite(Date.parse(o.checkedAt)));
    const unique = new Map(observations.map(o => [`${o.storeId}|${o.checkedAt}|${o.price}`, o]));
    const groups = new Map();
    for (const o of unique.values()) {
      if (!groups.has(o.storeId)) groups.set(o.storeId, []);
      groups.get(o.storeId).push(o);
    }
    return [...groups.values()].map(rows => rows.sort((a,b) => Date.parse(a.checkedAt)-Date.parse(b.checkedAt)));
  }
  function priceHistory(p) {
    const groups = history(p), chartable = groups.filter(rows => new Set(rows.map(o => o.checkedAt)).size >= 2);
    if (!chartable.length) return `<section class="evidence-panel" aria-label="Historial de precios"><h4>Historial de precios</h4><p>Aún no hay dos consultas verificadas en fechas distintas para la misma tienda y referencia. El precio actual no demuestra una tendencia.</p></section>`;
    return `<section class="evidence-panel" aria-label="Historial de precios"><h4>Historial de precios · COP</h4>${chartable.map(rows => {
      const min=Math.min(...rows.map(o=>o.price)), max=Math.max(...rows.map(o=>o.price)), start=Date.parse(rows[0].checkedAt), end=Date.parse(rows.at(-1).checkedAt), spread=Math.max(1,max-min);
      const points=rows.map(o=>`${36+Math.round(492*(Date.parse(o.checkedAt)-start)/(end-start))},${150-Math.round(115*(o.price-min)/spread)}`).join(' ');
      return `<div class="price-history-chart"><strong>${esc(rows[0].store)}</strong><svg viewBox="0 0 560 170" role="img" aria-label="Precios observados para ${esc(p.name)} en ${esc(rows[0].store)}"><path d="M36 35V150H528" fill="none" stroke="currentColor" opacity=".35"/><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><text x="36" y="20" fill="currentColor">${money(max)}</text><text x="36" y="165" fill="currentColor">${money(min)}</text></svg><small>${esc(date(rows[0]))} → ${esc(date(rows.at(-1)))} · ${rows.length} consultas; no incluye envío.</small><details><summary>Ver registros y fuentes</summary><ul>${rows.map(o=>`<li>${esc(date(o))} · ${money(o.price)} · <a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${esc(o.store)} ↗</a></li>`).join('')}</ul></details></div>`;
    }).join('')}</section>`;
  }
  function ratings(p) {
    const item=evidence.ratings?.[p.id];
    if (!item || !Number.isFinite(item.average) || item.average < 1 || item.average > 5 || !Number.isSafeInteger(item.count) || item.count < 1 || !/^https:\/\//.test(item.sourceUrl) || !Number.isFinite(Date.parse(item.checkedAt))) return `<section class="evidence-panel" aria-label="Valoraciones"><h4>Valoraciones</h4><p>Aún no tenemos valoraciones verificadas del modelo exacto. No mostramos estrellas ni reputación de tiendas sin una fuente atribuible.</p></section>`;
    return `<section class="evidence-panel" aria-label="Valoraciones"><h4>Valoraciones del modelo</h4><p><strong>${esc(item.average.toFixed(1))} / 5</strong> · ${item.count} ${item.count===1?'valoración':'valoraciones'} · consulta ${esc(new Date(item.checkedAt).toLocaleDateString('es-CO'))}</p><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Ver fuente y metodología ↗</a></section>`;
  }
  function purchase(p, parts) {
    const all = offers(p), top = best(p), count = available(p).length;
    const fit = window.FENIXA_FIT.check(p,parts);
    return `<details class="store-options"><summary>Tiendas, historial y valoraciones</summary><div class="store-offers">${window.FENIXA_FIT_STATUS.render(fit,{context:fit.context,hasParts:parts?parts.length>0:!!window.FENIXA_FIT.context()})}<section class="store-comparison" aria-label="Precios de tiendas consultadas"><h4>Precios consultados · ${esc(p.name)}</h4>${all.length ? all.map(o=>`<article class="store-offer"><div class="store-offer-main"><strong>${esc(o.store)}</strong><span><small>Precio del producto</small><b>${money(o.price)}</b></span><span><small>Disponibilidad indicada</small>${!recent(o)?'Consulta vencida':o.status==='in_stock'?'Disponible al consultar':o.status==='out_of_stock'?'Agotado al consultar':'Sin confirmar'}</span><a class="buy-link" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">Ver oferta ↗</a></div><small>Consultado: ${esc(date(o))} · ${esc(o.currency)} · envío e impuestos adicionales sin comprobar.</small>${o===top?`<span class="offer-best">${count>1?'Menor precio reciente consultado':'Única oferta reciente consultada'}</span>`:''}${o.sourceUrl?`<small><a href="${esc(o.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fuente del precio publicado</a></small>`:''}<small>${esc(o.note || 'Confirma presentación, garantía y forma de pago en la tienda.')}</small></article>`).join(''):'<p>No hay oferta directa comprobada para esta referencia.</p>'}</section>${priceHistory(p)}${ratings(p)}${searches(p)}<small>Los importes no forman un total de compra ni representan todo el mercado. Una consulta anterior puede haber cambiado o vencido.</small></div></details>`;
  }
  function plan(ids, byId) {
    const parts = ids.map(id=>byId[id]);
    const rows = ids.map(id=>({p:byId[id],offer:best(byId[id]),fit:window.FENIXA_FIT.check(byId[id],parts)}));
    const covered = rows.filter(r=>r.offer), total = covered.reduce((s,r)=>s+r.offer.price,0);
    const all = covered.length===rows.length;
    const conflicts = rows.filter(r=>r.fit.status==='conflict');
    return `<section class="build-shopping-plan" aria-label="Plan de compra de esta build">
      <div class="shopping-plan-heading"><div><h3>Compra por piezas</h3><p>${covered.length} de ${rows.length} piezas con una oferta reciente disponible.</p></div><div class="shopping-plan-total"><span>${covered.length ? all?'Subtotal de piezas':'Subtotal parcial' : 'Sin ofertas recientes'}</span><strong>${covered.length ? money(total) : 'Precio por confirmar'}</strong></div></div>
      ${conflicts.length?'<p class="shopping-plan-warning" role="status">Hay conflictos · corrígelos antes de comprar.</p>':''}
      <details class="shopping-plan-details"><summary>Más info</summary><div>
      <p class="shopping-plan-caveat">${covered.length&&!all?'Subtotal incompleto. ':''}Envío y ensamblaje no incluidos.</p>
      <section class="shopping-compatibility ${conflicts.length?'is-conflict':''}"><div><h4>Compatibilidad</h4>${conflicts.length?`<ul>${conflicts.map(({p,fit})=>`<li><strong>${esc(p.name)}</strong><p>${esc(fit.reason)}</p></li>`).join('')}</ul>`:''}<p>Esta selección no certifica el montaje completo. Confirma BIOS, memoria, espacio, conectores, fuente y refrigeración.</p></div></section>
      ${covered.length?`<h4>Ofertas por pieza</h4><ul>${covered.map(({p,offer:o})=>`<li><span>${esc(p.name)}</span> · <a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${esc(o.store)} · ${money(o.price)} ↗</a></li>`).join('')}</ul>`:''}
      ${!covered.length?'<p>Todavía no hay un subtotal verificable.</p>':''}
      ${!all?`<h4>Precios pendientes · ${rows.length-covered.length}</h4><ul class="missing-prices">${rows.filter(r=>!r.offer).map(r=>`<li>${esc(r.p.name)}</li>`).join('')}</ul><p>El subtotal no representa el precio de la build completa.</p>`:''}
      <p>Sumamos el menor precio reciente disponible por pieza. Confirma modelo, presentación, stock y envío en cada tienda antes de pagar.</p>
      </div></details>
    </section>`;
  }
  const latestCheckedAt = Object.values(data.offers || {}).flat().map(o=>Date.parse(o.checkedAt)).filter(Number.isFinite).sort((a,b)=>b-a)[0] || Date.parse(data.checkedAt) || null;
  window.FENIXA_MARKET = {offers,available,best,quoted,lastObserved,fixed,price,priceText,priceLabel,purchase,plan,recent,money,refreshWindowHours,latestCheckedAt,refreshDue:latestCheckedAt ? (Date.now()-latestCheckedAt)/3600000 > refreshWindowHours : true};
})();
