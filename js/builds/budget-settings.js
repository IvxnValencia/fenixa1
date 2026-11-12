(() => {
  'use strict';
  const min=1000000,max=18000000,step=250000;
  const amounts = Array.from({length:(max-min)/step+1},(_,i)=>min+i*step);
  const key = 'fenixa-build-budget-v1';
  let value = 0, saved = true;
  try {
    const old = Number(localStorage.getItem(key));
    if (Number.isSafeInteger(old) && old >= 0 && old <= 30000000) {
      value = old===0?0:Math.max(min,Math.min(max,Math.round(old/step)*step));
      if(value!==old)localStorage.setItem(key,String(value));
    }
  } catch { saved = false; }
  const money = n => new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP', maximumFractionDigits:0}).format(n);
  function set(next) {
    if (next !== 0 && !amounts.includes(next)) return false;
    value = next;
    try { localStorage.setItem(key, String(value)); saved = true; } catch { saved = false; }
    window.dispatchEvent(new CustomEvent('fenixa-budget-changed', {detail:{value, saved}}));
    return true;
  }
  function options(current = value) {
    return `<option value="0" ${current === 0 ? 'selected' : ''}>Sin objetivo</option>` +
      (current && !amounts.includes(current) ? `<option value="${current}" selected>${money(current)} · guardado anteriormente</option>` : '') +
      amounts.map(n => `<option value="${n}" ${n === current ? 'selected' : ''}>${money(n)}</option>`).join('');
  }
  // Tope del slider: con perfil de Armar mi PC (clave level de 'fenixa-builder') es FENIXA_AUTO_BUILD.ceiling(level); si no, el general.
  function profileLevel() {
    try { const level = JSON.parse(localStorage.getItem('fenixa-builder') || '{}').level; return window.FENIXA_AUTO_BUILD?.profiles?.[level] ? level : null; } catch { return null; }
  }
  function limit(level = profileLevel()) {
    const top = level && window.FENIXA_AUTO_BUILD?.ceiling?.(level);
    return Number.isFinite(top) && top >= min ? Math.min(max, top) : max;
  }
  window.FENIXA_BUDGET = {min,max,step,amounts, get:() => value, saved:() => saved, set, options, money, profileLevel, limit};
})();
