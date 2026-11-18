// Búsqueda tolerante para el catálogo de FENIXA.
//
// · Normaliza mayúsculas, tildes y signos: "Gráfica" = "grafica".
// · Ignora espacios y guiones al comparar modelos: "rtx4060" = "RTX 4060" = "RTX-4060".
// · Busca también en la categoría y sus sinónimos: "tarjeta de video", "procesador", "fuente de poder"…
// · Todas las palabras deben aparecer (en cualquier orden): "ryzen 7600".
// · Corrige errores pequeños cuando una palabra no aparece en ningún producto
//   ("Rizen" → "ryzen", "kingstn" → "kingston") y lo informa para que el usuario lo vea.
(() => {
  'use strict';
  const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'para', 'con', 'en', 'un', 'una']);
  const ALIASES = {
    cpu: 'procesador procesadores cpu micro microprocesador',
    gpu: 'tarjeta grafica tarjetas graficas tarjeta de video gpu',
    board: 'placa madre placa base tarjeta madre motherboard board',
    ram: 'memoria ram',
    storage: 'almacenamiento disco ssd unidad',
    power: 'fuente fuentes fuente de poder psu',
    case: 'gabinete gabinetes caja chasis torre case',
    cooler: 'refrigeracion disipador cooler',
    fan: 'ventilador ventiladores fan',
    setup: 'periferico perifericos setup'
  };

  const normalize = value => String(value || '').toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]+/g, ' ').trim();
  const compact = value => value.replace(/\s+/g, '');

  // Distancia de edición con transposiciones (Damerau–Levenshtein restringida), con corte.
  function distance(a, b, limit) {
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let prev2 = null, prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      let best = i;
      for (let j = 1; j <= b.length; j++) {
        let v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        row.push(v);
        if (v < best) best = v;
      }
      if (best > limit) return limit + 1;
      prev2 = prev; prev = row;
    }
    return prev[b.length];
  }

  // index(products, extraText?) → compile(query) → { test(product), corrections: [[escrito, usado]] }
  function index(products, extraText = () => '', categoryName = () => '') {
    const docs = new Map(), vocabulary = new Set();
    for (const p of products) {
      const text = normalize([p.name, p.sku, p.summary, extraText(p), categoryName(p.category), ALIASES[p.category] || ''].join(' '));
      docs.set(p, { text: ` ${text} `, compact: compact(text) });
      for (const word of text.split(' ')) if (word.length >= 3) vocabulary.add(word);
    }
    const words = [...vocabulary];
    const appears = token => { for (const d of docs.values()) if (d.text.includes(token) || d.compact.includes(token)) return true; return false; };
    const cache = new Map();

    function correct(token) {
      // Tolerancia: 1 error hasta 5 letras, 2 a partir de 6. No se corrigen números ni palabras cortas.
      if (token.length < 4 || /\d/.test(token)) return null;
      const limit = token.length <= 5 ? 1 : 2;
      let best = null, bestD = limit + 1;
      for (const w of words) {
        if (Math.abs(w.length - token.length) > limit) continue;
        const d = distance(token, w, limit);
        if (d < bestD || (d === bestD && best && w.length < best.length)) { best = w; bestD = d; }
        if (bestD === 0) break;
      }
      return bestD <= limit ? best : null;
    }

    return function compile(query) {
      const key = normalize(query);
      if (cache.has(key)) return cache.get(key);
      const corrections = [];
      const tokens = key.split(' ').filter(t => t && !STOP.has(t)).map(t => {
        if (appears(t)) return t;
        const fixed = correct(t);
        if (fixed) { corrections.push([t, fixed]); return fixed; }
        return t;
      });
      const result = {
        empty: !tokens.length,
        corrections,
        test: p => {
          if (!tokens.length) return true;
          const d = docs.get(p);
          return Boolean(d) && tokens.every(t => d.text.includes(t) || d.compact.includes(t));
        }
      };
      if (cache.size > 200) cache.clear();
      cache.set(key, result);
      return result;
    };
  }

  window.FENIXA_SEARCH = { normalize, distance, index };
})();
