(() => {
  'use strict';
  const data = window.FENIXA_MARKET_DATA || {products:[],offers:{}};
  const evidence = window.FENIXA_EVIDENCE || {priceHistory:{},ratings:{}};
  const refreshWindowHours = 72;
  window.FENIXA_CATALOG.products.push(...data.products);
  window.FENIXA_CATALOG.builds.push(...(data.builds || []));
  const money = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nm = p => window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : p.name;
  const checkedTime = o => Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(o.checkedAt) ? o.checkedAt+'T00:00:00-05:00' : o.checkedAt);
  const age = o => (Date.now()-checkedTime(o))/3600000;
  const valid = o => o.currency === 'COP' && Number.isFinite(o.price) && o.price > 0 && /^https:\/\//.test(o.url);
  const recent = o => age(o) >= -1 && age(o) <= refreshWindowHours;
  const stores = () => window.FENIXA_STORES || [];
  const storeById = id => stores().find(store => store.id === id);
  const normalizeMPN = value => typeof value === 'string' ? value.normalize('NFKC').trim().replace(/\s+/g,' ').toUpperCase() : '';
  const priceOrder = (a,b) => a.price-b.price || Number(a.incomplete ?? true)-Number(b.incomplete ?? true);
  const landedOrder = (a,b) => a.landed-b.landed || Number(a.incomplete)-Number(b.incomplete) || checkedTime(b)-checkedTime(a);
  const listed = o => o.status==='listed' && o.priceVerified===true;
  const canShip = o => o.status!=='no_ship' && (o.storeInfo || storeById(o.storeId))?.shipsToCO!==false;
  const knownCost = value => value === null || (Number.isFinite(value) && value >= 0);
  const cop = (value, rate) => value === null ? null : Math.round(value * rate * 100) / 100;
  function partNumber(p) {
    const facts = window.FENIXA_SPECS?.facts(p);
    if (facts?.identityConflict) return '';
    const explicit = p.mpn || p.partNumber || facts?.mpn || facts?.partNumber;
    if (explicit) return normalizeMPN(explicit);
    const sku = normalizeMPN(p.sku);
    if (p.sourceType !== 'retailer' && sku && !/^(REF\.|MODELO:)/.test(sku) && !sku.includes('·')) return sku;
    // A verified manufacturer code can identify a retailer card whose SKU is internal to the shop.
    const code = normalizeMPN(facts?.modelKey);
    return facts?.verified && /^(?=.*\d)[A-Z\d]+(?:[-_/][A-Z\d]+)+$/.test(code) ? code : '';
  }
  function storeOffer(o, mpn) {
    if (!o || !mpn || normalizeMPN(o.mpn) !== mpn) return null;
    const storeInfo = storeById(o.storeId);
    if (!storeInfo || !['in_stock','listed','no_ship'].includes(o.status) || !/^https:\/\/[^/\s]+/.test(o.url) ||
        !Number.isFinite(checkedTime(o)) || !Number.isFinite(o.price) || o.price <= 0 ||
        !knownCost(o.shippingToCO) || !knownCost(o.importFees)) return null;
    const fx = window.FENIXA_FX;
    const rate = o.currency === 'COP' ? 1 : o.currency === 'USD' ? fx?.USD_COP : null;
    if (!Number.isFinite(rate) || rate <= 0 ||
        (o.currency === 'USD' && (!/^https:\/\//.test(fx.source) || !Number.isFinite(Date.parse(fx.checkedAt))))) return null;
    const price = cop(o.price, rate);
    const shippingCOP = cop(o.shippingToCO, rate);
    const importFeesCOP = cop(o.importFees, rate);
    const landed = cop(o.price + (o.shippingToCO ?? 0) + (o.importFees ?? 0), rate);
    if (!Number.isFinite(landed)) return null;
    const status = storeInfo.shipsToCO === false ? 'no_ship' : o.status;
    return {...o, store:storeInfo.name, storeInfo, status, price, currency:'COP', originalPrice:o.price,
      originalCurrency:o.currency, shippingCOP, importFeesCOP, landed, priceVerified:true,
      incomplete:shippingCOP === null || importFeesCOP === null};
  }
  function offers(p) {
    const legacy = [...(data.offers[p.id] || []), ...(window.FENIXA_PRICE_REVIEW?.offers?.[p.id] || [])].filter(valid);
    const raw = window.FENIXA_STORE_OFFERS?.[p.id];
    const mpn = Array.isArray(raw) && raw.length ? partNumber(p) : '';
    const verified = mpn ? raw.map(o=>storeOffer(o,mpn)).filter(Boolean) : [];
    return [...legacy,...verified].sort(priceOrder);
  }
  function listings(p) {
    const byListing = new Map();
    for (const o of offers(p)) {
      const checkedAt = checkedTime(o);
      if (!Number.isFinite(checkedAt) || age(o)<-1) continue;
      const storeInfo = o.storeInfo || storeById(o.storeId) ||
        {id:o.storeId, name:o.store, shipsToCO:null, shippingModel:'per-item'};
      const row = {shippingCOP:null, importFeesCOP:null, landed:o.price, incomplete:true, ...o, storeInfo};
      const key = JSON.stringify([o.storeId,o.url]);
      const prev = byListing.get(key);
      if (!prev || checkedAt>checkedTime(prev) ||
          (checkedAt===checkedTime(prev) && o.storeInfo && !prev.originalCurrency)) byListing.set(key,row);
    }
    return [...byListing.values()].sort(landedOrder);
  }
  const isPriced = o => o.status==='in_stock' || listed(o);
  function storeOptions(p) {
    const ranked = listings(p).sort((a,b) =>
      Number(canShip(b)&&isPriced(b))-Number(canShip(a)&&isPriced(a)) ||
      Number(canShip(b))-Number(canShip(a)) || landedOrder(a,b));
    const seen = new Set();
    return ranked.filter(o=>{
      if (seen.has(o.storeId || o.store)) return false;
      seen.add(o.storeId || o.store);
      return true;
    });
  }
  const referenceOffers = (p, store='all', recentOnly=false) => listings(p).filter(o=>
    canShip(o) && isPriced(o) && (!recentOnly || recent(o)) && (store==='all' || o.storeId===store));
  const shoppingOffers = p => referenceOffers(p,'all',true).filter(o=>o.storeId && o.store);
  const isCurrentListing = (o, rows) => rows.some(row=>row.storeId===o.storeId && row.url===o.url &&
    row.checkedAt===o.checkedAt && row.status===o.status && row.price===o.price);
  function activeOffers(p) {
    const all = offers(p).filter(canShip);
    if (!window.FENIXA_STORE_OFFERS?.[p.id]?.length) return all;
    const rows = listings(p);
    return all.filter(o=>isCurrentListing(o,rows));
  }
  const available = p => activeOffers(p).filter(o=>recent(o) && o.status==='in_stock');
  const best = p => available(p)[0] || null;
  const snapshot = p => Number.isFinite(p?.min) && p.min > 0 && Number.isFinite(p?.max) && p.max > 0 ? {price:p.min,maxPrice:p.max,store:'Referencia de catálogo',storeId:'catalog',url:p.source,checkedAt:data.checkedAt,isSnapshot:true} : null;
  const lastObserved = p => offers(p).filter(o=>Number.isFinite(checkedTime(o))).sort((a,b)=>checkedTime(b)-checkedTime(a))[0] || snapshot(p);
  const date = o => new Date(checkedTime(o)).toLocaleString('es-CO',{timeZone:'America/Bogota',dateStyle:'short',timeStyle:'short'});
  const refDate = o => new Date(checkedTime(o)).toLocaleDateString('es-CO',{timeZone:'America/Bogota',day:'2-digit',month:'2-digit'});
  const price = p => best(p)?.price ?? null;
  const quoted = p => activeOffers(p).find(o=>listed(o) && recent(o)) || null;
  const fixed = p => best(p) || quoted(p) || activeOffers(p).filter(o=>o.status==='in_stock' && age(o)>=-1).sort((a,b)=>checkedTime(b)-checkedTime(a) || priceOrder(a,b))[0] || null;
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
    const observations = [...recorded, ...offers(p)].filter(o => valid(o) && (!o.originalCurrency || o.originalCurrency==='COP') && !['confirm','listed','no_ship'].includes(o.status) && o.storeId && o.store && Number.isFinite(Date.parse(o.checkedAt)));
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
  const usd = new Intl.NumberFormat('es-CO',{style:'currency',currency:'USD',currencyDisplay:'code'});
  function storeList(p) {
    const rows = storeOptions(p);
    const fx = window.FENIXA_FX;
    return `<section class="store-comparison" aria-label="Tiendas consultadas"><h4>Tiendas consultadas</h4>${rows.length?`<ul class="store-quote-list">${rows.map(o=>{
      const ships = canShip(o), confirmed = ships && (o.shippingCOP!==null || o.storeInfo.shipsToCO===true);
      const shipping = !ships?'No envía':confirmed?'Envía a CO':'Envío por confirmar';
      const missing = [ships && confirmed && o.shippingCOP===null?' + Envío por confirmar':'',ships && o.importFeesCOP===null?' + Impuestos por confirmar':''].filter(Boolean);
      const status = !recent(o)?'Consulta vencida':o.status==='out_of_stock'?'Agotado al consultar':o.status==='in_stock'?'Disponible al consultar':'Stock por confirmar';
      return `<li class="store-quote"><strong title="${esc(o.store)}">${esc(o.store)}</strong><span class="store-quote-price"><b>${money(o.landed)}</b>${o.originalCurrency==='USD'? `<small>${esc(usd.format(o.originalPrice))}</small>`:''}</span><span class="store-quote-chips"><span class="store-quote-chip${confirmed?' is-confirmed':''}">${shipping}</span>${missing.map(text=>`<span>${text}</span>`).join('')}</span><time datetime="${esc(o.checkedAt)}" title="${status} · ${esc(date(o))}">Ref. ${esc(refDate(o))}${recent(o)?'':' · Vencida'}</time><a class="store-quote-link" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer" aria-label="Ver oferta en ${esc(o.store)}">↗</a></li>`;
    }).join('')}</ul>${rows.some(o=>o.originalCurrency==='USD')?`<small>TRM: ${esc(fx.checkedAt)} · <a href="${esc(fx.source)}" target="_blank" rel="noopener noreferrer">Banco de la República ↗</a></small>`:''}`:'<p>Sin ofertas consultadas para esta referencia.</p>'}</section>`;
  }
  function purchase(p, parts, {includeStores=true}={}) {
    const fit = window.FENIXA_FIT.check(p,parts);
    return `<details class="store-options"><summary>Tiendas, historial y valoraciones</summary><div class="store-offers">${window.FENIXA_FIT_STATUS.render(fit,{context:fit.context,hasParts:parts?parts.length>0:!!window.FENIXA_FIT.context()})}${includeStores?storeList(p):''}${priceHistory(p)}${ratings(p)}${searches(p)}</div></details>`;
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
      <section class="shopping-compatibility ${conflicts.length?'is-conflict':''}"><div><h4>Compatibilidad</h4>${conflicts.length?`<ul>${conflicts.map(({p,fit})=>`<li><strong>${esc(nm(p))}</strong><p>${esc(fit.reason)}</p></li>`).join('')}</ul>`:''}<p>Esta selección no certifica el montaje completo. Confirma BIOS, memoria, espacio, conectores, fuente y refrigeración.</p></div></section>
      ${covered.length?`<h4>Ofertas por pieza</h4><ul>${covered.map(({p,offer:o})=>`<li><span title="${esc(p.name)}">${esc(nm(p))}</span> · <a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${esc(o.store)} · ${money(o.price)} ↗</a></li>`).join('')}</ul>`:''}
      ${!covered.length?'<p>Todavía no hay un subtotal verificable.</p>':''}
      ${!all?`<h4>Precios pendientes · ${rows.length-covered.length}</h4><ul class="missing-prices">${rows.filter(r=>!r.offer).map(r=>`<li>${esc(nm(r.p))}</li>`).join('')}</ul><p>El subtotal no representa el precio de la build completa.</p>`:''}
      <p>Sumamos el menor precio reciente disponible por pieza. Confirma modelo, presentación, stock y envío en cada tienda antes de pagar.</p>
      </div></details>
    </section>`;
  }
  const latestCheckedAt = Object.values(data.offers || {}).flat().map(o=>Date.parse(o.checkedAt)).filter(Number.isFinite).sort((a,b)=>b-a)[0] || Date.parse(data.checkedAt) || null;
  window.FENIXA_MARKET = {offers,listings,stores,referenceOffers,shoppingOffers,storeList,available,best,quoted,lastObserved,fixed,price,priceText,priceLabel,purchase,plan,recent,money,refreshWindowHours,latestCheckedAt,refreshDue:latestCheckedAt ? (Date.now()-latestCheckedAt)/3600000 > refreshWindowHours : true};
})();
