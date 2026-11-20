// Mejorar mi PC: motor de recomendaciones con piezas concretas y compatibles.
//
// 1. detect(): deduce la plataforma del equipo registrado (socket por el chipset
//    de la placa o por el modelo del procesador, generación de RAM, gama de la
//    gráfica, núcleos aproximados, disco y fuente).
// 2. plan(): para cada mejora pedida busca en el catálogo piezas que REALMENTE
//    mejoran lo que ya tiene (más VRAM/gama, más núcleos, más capacidad…) y que
//    son compatibles (mismo socket, misma RAM, formato de laptop, fuente
//    suficiente). Cada opción explica qué gana y qué se comprobó.
// Las gamas son un orden editorial aproximado por nombre comercial, no benchmarks.
(() => {
  'use strict';
  const catalog = window.FENIXA_CATALOG, market = window.FENIXA_MARKET;
  const specs = p => window.FENIXA_SPECS?.facts?.(p) || {};
  const facts = p => specs(p).values || {};
  const ref = p => window.FENIXA_AUTO_BUILD?.reference?.(p) || null;
  const money = n => market.money(n);
  const short = p => window.FENIXA_SHORT_NAME ? window.FENIXA_SHORT_NAME(p) : p.name;
  const up = v => String(v || '').toUpperCase();

  // ---------- Plataforma ----------
  const CHIPSETS = [
    [/\b(A320|B350|X370|B450|X470|A520|B550|X570)/, 'AM4', 'DDR4'],
    [/\b(A620|B650E?|X670E?|B850|X870E?)/, 'AM5', 'DDR5'],
    [/\b(H610|B660|H670|Z690|B760|H770|Z790)/, 'LGA1700', ''],
    [/\b(H810|B860|Z890)/, 'LGA1851', 'DDR5'],
    [/\b(H410|B460|H470|Z490|H510|B560|H570|Z590)/, 'LGA1200', 'DDR4'],
    [/\b(H310|B360|B365|H370|Z370|Z390)/, 'LGA1151', 'DDR4']
  ];
  function cpuInfo(text) {
    const t = up(text);
    let m = /RYZEN\s*([3579])\s*(?:PRO\s*)?(\d)(\d)(\d{2})\s*([A-Z0-9]*)/.exec(t);
    if (m) {
      const series = Number(m[2]), tier = Number(m[1]), suffix = m[5] || '';
      const mobile = /^(H|HS|HX|U)$/.test(suffix) || /^(H|HS|HX|U)\b/.test(suffix);
      const socket = mobile ? '' : series <= 5 ? 'AM4' : series >= 7 ? 'AM5' : '';
      const cores = { 3: 4, 5: 6, 7: 8, 9: /5[0-9]$/.test(m[3] + m[4]) ? 16 : 12 }[tier];
      return { brand: 'AMD', socket, ram: socket === 'AM4' ? 'DDR4' : socket === 'AM5' ? 'DDR5' : '', cores, gen: series, x3d: /X3D/.test(suffix), mobile, igpu: /G$/.test(suffix) && !/F/.test(suffix) };
    }
    m = /(?:CORE\s*)?I([3579])[\s-]*(\d{4,5})([A-Z]*)/.exec(t);
    if (m) {
      const tier = Number(m[1]), num = m[2], gen = num.length === 5 ? Number(num.slice(0, 2)) : Number(num[0]), suffix = m[3] || '';
      const mobile = /^(H|HX|HK|U|P)$/.test(suffix);
      const socket = mobile ? '' : gen >= 12 && gen <= 14 ? 'LGA1700' : gen >= 10 ? 'LGA1200' : gen >= 6 ? 'LGA1151' : '';
      const cores = gen >= 12 ? { 3: 4, 5: /600|500/.test(num.slice(-3)) || gen >= 13 ? 10 : 6, 7: gen >= 13 ? 16 : 12, 9: gen >= 13 ? 24 : 16 }[tier] : { 3: 4, 5: 6, 7: 8, 9: 10 }[tier];
      return { brand: 'Intel', socket, ram: socket === 'LGA1200' || socket === 'LGA1151' ? 'DDR4' : '', cores, gen, mobile, igpu: !/F/.test(suffix) };
    }
    m = /CORE\s*ULTRA\s*([579])\s*(\d{3})([A-Z]*)/.exec(t);
    if (m) {
      const mobile = /^(H|HX|U|V)$/.test(m[3]) || Number(m[2]) < 200 || /^2[0-9][0-9]V$/.test(m[2] + m[3]);
      return { brand: 'Intel', socket: mobile ? '' : 'LGA1851', ram: 'DDR5', cores: { 5: 14, 7: 20, 9: 24 }[m[1]], gen: 15, mobile, igpu: !/F/.test(m[3]) };
    }
    return null;
  }
  // Orden aproximado de gama para gráficas por nombre comercial.
  function gpuScore(text) {
    const t = up(text).replace(/-/g, ' ');
    if (!t.trim()) return null;
    let m = /(RTX|GTX)\s*(\d{1,2})(\d)0\s*(TI|SUPER)?/.exec(t);
    if (m) {
      const gen = Number(m[2]), cls = Number(m[3]);
      const genIdx = { 9: -0.5, 10: 0, 16: 0.5, 2: 1, 20: 1, 3: 2, 30: 2, 4: 3, 40: 3, 5: 4, 50: 4 }[gen] ?? (gen >= 5 ? 4 : 0);
      const laptop = /LAPTOP|MOBILE|MAX Q/.test(t) ? -0.6 : 0;
      return Math.max(0.5, (cls - 4) + 0.7 * genIdx + (m[4] ? 0.5 : 0) + laptop);
    }
    m = /RX\s*(\d)(\d)(\d)0\s*(XT|GRE)?/.exec(t);
    if (m) {
      const gen = Number(m[1]), cls = Number(m[2]);
      const genIdx = { 5: 1, 6: 2, 7: 3, 9: 4 }[gen] ?? 1;
      return Math.max(0.5, (cls - 4) + 0.7 * genIdx + (m[4] ? 0.5 : 0));
    }
    if (/RX\s*(4|5)\d0/.test(t)) return 1.5;
    if (/ARC\s*B580|ARC\s*A7/.test(t)) return 4;
    if (/ARC\s*A5|ARC\s*B5/.test(t)) return 3;
    if (/780M|890M|880M/.test(t)) return 1.2;
    if (/UHD|IRIS|VEGA|RADEON\s*(GRAPHICS|\d{3}M)|INTEGRAD|ARC GRAPHICS|INTEL GRAPHICS/.test(t)) return 0.5;
    return null;
  }
  function detect(profile) {
    const laptop = profile.device === 'laptop';
    const board = up(profile.board), cpu = cpuInfo(profile.cpu);
    const chip = CHIPSETS.find(([re]) => re.test(board));
    const socket = laptop ? '' : chip?.[1] || cpu?.socket || (/AM4|AM5|LGA\s?\d{4}/.exec(board)?.[0].replace(/\s/g, '') || '');
    const boardDdr = /\bD4\b|DDR4/.test(board) ? 'DDR4' : /\bD5\b|DDR5/.test(board) ? 'DDR5' : '';
    const ram = profile.ramType || boardDdr || chip?.[2] || cpu?.ram || '';
    const integrated = profile.graphics === 'integrated';
    const gpuText = integrated ? 'integrada' : profile.gpu;
    let gpu = gpuScore(gpuText);
    if (gpu === null && profile.graphics === 'dedicated') gpu = 1.5;
    if (gpu === null && integrated) gpu = 0.5;
    // Núcleos: primero el modelo exacto del catálogo, si coincide; si no, una estimación por gama.
    const match = profile.cpu && catalog.products.find(p => p.category === 'cpu' && up(p.name).includes(up(profile.cpu).replace(/^(AMD|INTEL)\s*/, '').trim()) && profile.cpu.trim().length > 6);
    const cores = (match && facts(match).cores) || cpu?.cores || 0;
    const psu = Number(profile.psuW) || 0;
    return {
      laptop, socket, ram, integrated, gpu, cpu, cores, psu,
      ramGb: Number(profile.ramGb) || 0, modules: Number(profile.ramModules) || 0,
      storageType: profile.storageType || '', storageGb: parseStorage(profile.storageGb),
      sources: {
        socket: chip ? `por el chipset ${chip[0].exec(board)?.[1] || ''} de tu placa` : cpu?.socket ? `por tu procesador ${profile.cpu}` : '',
        ram: profile.ramType ? 'indicada por ti' : boardDdr ? 'por el nombre de tu placa' : chip?.[2] ? 'por la plataforma de tu placa' : cpu?.ram ? 'por la plataforma de tu procesador' : ''
      }
    };
  }

  // ---------- Catálogo ----------
  let pool = null;
  const usable = () => pool ||= catalog.products.filter(p => !specs(p).identityConflict);
  const priceOf = p => ref(p)?.low ?? Infinity;
  const byCategory = c => usable().filter(p => p.category === c).sort((a, b) => priceOf(a) - priceOf(b));
  const ramInfo = p => {
    const f = facts(p), name = String(p.name);
    return {
      kind: (String(f.memory || '').match(/DDR[345]/i) || name.match(/DDR[345]/i) || [''])[0].toUpperCase(),
      capacity: f.capacity || Number((name.match(/(\d+)\s*G(?:B)?\b/i) || [])[1]) || 0,
      modules: f.modules || 1,
      laptop: /SO.?DIMM/i.test(f.format || '') || /port[aá]til/i.test(name)
    };
  };
  function parseStorage(text) {
    const m = String(text || '').match(/(\d+(?:[.,]\d+)?)\s*(TB|GB)/i);
    return m ? Math.round(parseFloat(m[1].replace(',', '.')) * (/TB/i.test(m[2]) ? 1000 : 1)) : 0;
  }
  const gb = n => n >= 1000 ? Math.round(n / (n % 1000 && n % 1024 === 0 ? 1024 : 1000) * 10) / 10 + ' TB' : n + ' GB';
  const cpuScore = (cores, info) => (cores || 0) + ({ AMD: { 1: -1, 2: -0.5, 3: 0, 4: 0.5, 5: 2, 7: 3.5, 8: 3, 9: 4.5 }, Intel: { 8: 0, 9: 0.3, 10: 0.8, 11: 1.2, 12: 2.5, 13: 3.5, 14: 3.7, 15: 4 } }[info?.brand]?.[info?.gen] ?? 0) + (info?.x3d ? 3 : 0);

  // Elige hasta tres opciones: la más económica que mejora, una equilibrada y la de mayor alcance.
  function tiers(list, value) {
    const priced = list.filter(x => Number.isFinite(priceOf(x.p)));
    const base = (priced.length ? priced : list).slice().sort((a, b) => priceOf(a.p) - priceOf(b.p));
    const names = ['Más económica', 'Equilibrada', 'Mayor mejora'];
    if (base.length <= 3) return base.map((x, i) => ({ ...x, tier: base.length === 1 ? names[0] : i === base.length - 1 ? names[2] : names[i] }));
    const cheap = base[0];
    const best = base.reduce((a, b) => value(b) > value(a) ? b : a);
    const goal = (value(cheap) + value(best)) / 2;
    const middle = base.filter(x => x !== cheap && x !== best && priceOf(x.p) <= priceOf(best.p)).sort((a, b) => Math.abs(value(a) - goal) - Math.abs(value(b) - goal) || priceOf(a.p) - priceOf(b.p))[0];
    return [[cheap, names[0]], [middle, names[1]], [best, names[2]]].filter(([x]) => x).map(([x, tier]) => ({ ...x, tier }));
  }

  // ---------- Recomendaciones por tipo de pieza ----------
  function graphics(d) {
    const current = d.gpu ?? 1;
    const cards = byCategory('gpu').map(p => ({ p, f: facts(p), score: gpuScore(p.name) })).filter(x => x.score !== null && x.f.recommendedPsu && x.score >= current + 1);
    if (!cards.length) return { picks: [], empty: 'Tu gráfica ya está en la gama alta del catálogo: cambiarla no daría un salto claro.' };
    const picks = tiers(cards.map(x => ({ ...x })), x => x.score).map(x => {
      const ok = [`PCIe x16: el estándar de cualquier placa de escritorio`];
      const warn = [];
      if (d.psu) (d.psu >= x.f.recommendedPsu ? ok : warn).push(`Fuente: tu fuente de ${d.psu} W ${d.psu >= x.f.recommendedPsu ? 'cumple' : 'no llega a'} los ${x.f.recommendedPsu} W recomendados`);
      else warn.push(`Fuente: necesitas al menos ${x.f.recommendedPsu} W (indica tu fuente para comprobarlo)`);
      if (x.f.length) warn.push(`Largo ${x.f.length} mm: mide el espacio libre de tu caja`);
      const jump = x.score - current;
      return { p: x.p, tier: x.tier, gain: `${x.f.vram} GB de VRAM · ${jump >= 3 ? 'salto de gama muy grande' : jump >= 2 ? 'salto de gama grande' : 'salto de gama moderado'} frente a tu gráfica actual`, ok, warn };
    });
    // Si la fuente registrada no alcanza para ninguna, se recomienda también la fuente.
    const need = Math.max(...picks.map(x => facts(x.p).recommendedPsu));
    const extra = d.psu && d.psu < need ? power(need) : null;
    return { picks, extra };
  }
  function power(need) {
    const psus = byCategory('power').filter(p => facts(p).watts >= need && Number.isFinite(priceOf(p)));
    return psus.length ? { title: `Fuente de ${need} W o más`, picks: psus.slice(0, 2).map((p, i) => ({ p, tier: i ? 'Con más margen' : 'Más económica', gain: `${facts(p).watts} W${/gold/i.test(p.name + facts(p).efficiency) ? ' · 80 PLUS Gold' : ''}`, ok: [`Cubre los ${need} W que pide la gráfica`], warn: ['Confirma los conectores PCIe de la gráfica'] })) } : null;
  }
  function processor(d, profile) {
    if (d.laptop) return { picks: [], empty: 'En una laptop el procesador va soldado a la placa: no se puede cambiar.' };
    if (!d.socket) return { picks: [], empty: 'Indica el modelo de tu procesador o de tu placa base para saber qué procesadores son compatibles con tu socket.' };
    const current = cpuScore(d.cores, d.cpu);
    const list = byCategory('cpu').filter(p => {
      const f = facts(p);
      if (f.socket !== d.socket) return false;
      if (d.ram && !up(f.memory).includes(d.ram)) return false;
      if (d.integrated && f.requiresGpu) return false;
      return cpuScore(f.cores, cpuInfo(p.name)) >= current + 2;
    }).map(p => ({ p, score: cpuScore(facts(p).cores, cpuInfo(p.name)) }));
    if (!list.length) return { picks: [], empty: `No hay en el catálogo un procesador ${d.socket} que mejore claramente el tuyo. El siguiente paso sería cambiar placa y procesador juntos (Armar mi PC).` };
    const picks = tiers(list, x => x.score).map(x => {
      const f = facts(x.p), ok = [`Socket ${d.socket} como tu placa${d.sources.socket ? ' (' + d.sources.socket + ')' : ''}`];
      if (d.ram) ok.push(`Usa ${d.ram} como tu memoria`);
      const warn = ['Actualiza la BIOS de tu placa antes de cambiarlo'];
      if (f.requiresGpu) warn.push('No tiene gráficos integrados: necesitas tu tarjeta gráfica');
      if (f.tdp > 105 || f.cores >= 14) warn.push('Consume más: revisa que tu disipador aguante');
      return { p: x.p, tier: x.tier, gain: `${f.cores} núcleos${d.cores ? ' (tienes ~' + d.cores + ')' : ''}${/X3D/i.test(x.p.name) ? ' · caché 3D, muy buena para juegos' : ''}`, ok, warn };
    });
    return { picks };
  }
  function memory(d) {
    if (!d.ram) return { picks: [], empty: 'Indica la generación de tu RAM (DDR4 o DDR5) o el modelo de tu placa para mostrar módulos compatibles.' };
    const target = d.ramGb ? Math.min(d.ramGb * 2, 64) : 16;
    const kits = byCategory('ram').filter(p => { const r = ramInfo(p); return r.kind === d.ram && r.laptop === d.laptop && r.capacity >= 8; });
    // Dos caminos: sumar un módulo igual (si hay ranura libre) o un kit de la capacidad objetivo.
    const same = d.ramGb && d.modules === 1 ? kits.find(p => ramInfo(p).capacity === d.ramGb && ramInfo(p).modules === 1) : null;
    const bigger = kits.filter(p => ramInfo(p).capacity >= target).filter((p, i, all) => all.findIndex(x => ramInfo(x).capacity === ramInfo(p).capacity) === i);
    const options = [...(same ? [{ p: same, mode: 'add', total: d.ramGb * 2 }] : []), ...bigger.map(p => ({ p, mode: 'kit', total: ramInfo(p).capacity }))]
      .filter((x, i, all) => all.findIndex(y => y.total === x.total) === i).sort((a, b) => a.total - b.total || priceOf(a.p) - priceOf(b.p)).slice(0, 3);
    const names = options.length === 1 ? ['Recomendada'] : options.length === 2 ? ['Más económica', 'Mayor mejora'] : ['Más económica', 'Equilibrada', 'Mayor mejora'];
    const list = options.map((x, i) => ({ ...x, tier: names[i] }));
    if (!list.length) return { picks: [], empty: `No encontramos en el catálogo memoria ${d.ram}${d.laptop ? ' SO-DIMM' : ''} con más capacidad que la tuya.` };
    return { picks: list.map(x => {
      const r = ramInfo(x.p), total = x.mode === 'add' ? d.ramGb * 2 : r.capacity;
      const ok = [`${r.kind}${d.laptop ? ' SO-DIMM (formato de laptop)' : ' DIMM (formato de escritorio)'} como tu equipo${d.sources.ram && !d.ramGb ? '' : ''}`];
      const warn = d.laptop ? ['Confirma en el manual de tu modelo que la RAM no está soldada y cuántas ranuras tiene'] : ['Confirma la capacidad máxima y las ranuras libres de tu placa'];
      if (x.mode === 'add') ok.push('Mismo tamaño que tu módulo: trabajan en doble canal');
      return { p: x.p, tier: x.tier, gain: x.mode === 'add' ? `Sumas ${r.capacity} GB: pasas de ${d.ramGb} a ${total} GB en doble canal` : `Quedas con ${total} GB${d.ramGb ? ' (hoy ' + d.ramGb + ' GB)' : ''}${r.modules === 2 ? ' en doble canal' : ''}`, ok, warn };
    }) };
  }
  function storage(d, mode) {
    const internal = byCategory('storage').filter(p => facts(p).placement === 'Interno' && facts(p).capacity && (!d.laptop || /M\.2/.test(facts(p).format || '')));
    const nvme = internal.filter(p => /M\.2/.test(facts(p).format || '') && /NVMe/i.test(facts(p).pcie || ''));
    let list;
    if (mode === 'speed') {
      if (d.storageType === 'nvme') return { picks: [], empty: 'Tu disco del sistema ya es un SSD NVMe: el arranque lento suele venir de programas de inicio o de un disco casi lleno, no del disco en sí.' };
      list = nvme.filter(p => facts(p).capacity >= Math.max(480, d.storageGb) && facts(p).capacity <= Math.max(1000, d.storageGb * 2));
      if (!d.laptop && d.storageType === 'hdd') list = [...internal.filter(p => /2,5/.test(facts(p).format || '') && facts(p).capacity >= 480).slice(0, 1), ...list];
    } else {
      const target = Math.max(900, d.storageGb * 1.8);
      list = (d.laptop ? nvme : internal).filter(p => facts(p).capacity >= target);
    }
    const tb = p => Math.round(facts(p).capacity / 500);
    const distinct = list.filter((p, i, all) => all.findIndex(x => tb(x) === tb(p) && /M\.2/.test(facts(x).format) === /M\.2/.test(facts(p).format)) === i);
    const picks = tiers(distinct.map(p => ({ p, score: facts(p).capacity + (/NVMe/i.test(facts(p).pcie || '') ? 100 : 0) })), x => x.score).map(x => {
      const f = facts(x.p), m2 = /M\.2/.test(f.format || '');
      const ok = [m2 ? `M.2 2280 NVMe${d.laptop ? ': el formato habitual en laptops' : ''}` : 'SATA de 2,5": funciona en casi cualquier PC de escritorio'];
      const warn = [m2 ? (d.laptop ? 'Confirma si tu laptop tiene una segunda ranura M.2 libre (si no, se reemplaza y se clona el disco)' : 'Necesitas una ranura M.2 libre en tu placa') : 'Necesitas un puerto SATA libre y un cable de datos'];
      const gain = mode === 'speed' ? `${d.storageType === 'hdd' ? 'Arranque y apertura de programas varias veces más rápidos que un HDD' : d.storageType === 'sata' ? 'Hasta varias veces la velocidad de un SSD SATA' : 'Sistema en SSD'} · ${gb(f.capacity)}` : `${gb(f.capacity)}${d.storageGb ? ' (hoy ' + gb(d.storageGb) + ')' : ''}`;
      return { p: x.p, tier: x.tier, gain, ok, warn };
    });
    return picks.length ? { picks } : { picks: [], empty: 'No encontramos un disco compatible con más capacidad en el catálogo.' };
  }
  function cooling(d) {
    if (d.laptop) return { picks: [], empty: '' };
    const key = d.socket.startsWith('LGA') ? d.socket.replace(/\D/g, '') : d.socket;
    const coolers = byCategory('cooler').filter(p => Number.isFinite(priceOf(p)) && (!key || up(facts(p).sockets).includes(key)));
    const air = coolers.filter(p => facts(p).coolerType === 'air'), aio = coolers.filter(p => facts(p).coolerType === 'aio');
    const list = [[air[0], 'Más económica'], [air.find(p => /dos|doble/i.test(facts(p).format || '')), 'Equilibrada'], [aio[0], 'Mayor mejora']].filter(([p]) => p);
    return { picks: list.map(([p, tier]) => {
      const f = facts(p), ok = key ? [`Declara soporte para ${d.socket}`] : [], warn = [];
      if (!key) warn.push('Indica tu procesador o placa para confirmar el socket');
      if (f.coolerType === 'air' && f.height) warn.push(`Mide ${f.height} mm de alto: comprueba la altura máxima de tu caja`);
      if (f.coolerType === 'aio') warn.push('Necesitas espacio para un radiador de 240 mm en tu caja');
      return { p, tier, gain: f.coolerType === 'aio' ? 'Refrigeración líquida: la mayor bajada de temperatura y ruido' : /dos|doble/i.test(f.format || '') ? 'Torre con dos ventiladores: más margen y menos ruido' : 'Torre de aire: mucho más silenciosa que el disipador de serie', ok, warn };
    }) };
  }
  // En una laptop la gráfica no se cambia: si piden FPS se muestran laptops del catálogo con gráfica superior.
  function laptopAlternatives(d) {
    const prices = window.FENIXA_LAPTOP_PRICES;
    return (window.FENIXA_LAPTOPS || []).map(l => {
      const g = (l.specs || []).find(([k]) => /gr[aá]fic/i.test(k))?.[1] || '';
      let o = null; try { o = prices?.offer?.(l); } catch {}
      return { l, g, score: gpuScore(g), o };
    }).filter(x => x.score !== null && x.score >= (d.gpu ?? 1) + 1 && x.o?.currency === 'COP' && x.o.price > 0).sort((a, b) => a.o.price - b.o.price).slice(0, 3)
      .map(x => ({ id: x.l.id, name: x.l.name, gpu: x.g.split('·')[0].trim(), price: x.o.price, store: x.o.store }));
  }

  // ---------- Plan ----------
  function plan(profile) {
    const d = detect(profile), goals = new Set(profile.symptoms || []), sections = [];
    const add = (id, impact, title, why, result) => { if (result && (result.picks?.length || result.empty || result.alternatives?.length)) sections.push({ id, impact, title, why, ...result }); };
    const lowRam = d.ramGb && d.ramGb < 16;
    if (goals.has('fps')) {
      if (d.laptop) {
        add('gpu-laptop', 7, 'Más FPS: la gráfica de una laptop no se cambia', 'La GPU va soldada. Lo que sí puedes hacer: RAM en doble canal, modo de máximo rendimiento y buena ventilación. Si necesitas un salto real, estas laptops del catálogo tienen una gráfica superior a la tuya.', { picks: [], alternatives: laptopAlternatives(d) });
      } else {
        add('gpu', 10, 'Tarjeta gráfica: la mejora que más FPS da', d.integrated ? 'Usas gráficos integrados: una tarjeta dedicada multiplica los FPS.' : 'En juegos, la gráfica es la pieza que más limita los FPS.', graphics(d));
        if (d.cores && cpuScore(d.cores, d.cpu) < 8.5) add('cpu', 6, 'Procesador: evita tirones con una gráfica nueva', `Tu procesador (~${d.cores} núcleos${d.cpu?.gen ? ', serie ' + (d.cpu.brand === 'AMD' ? d.cpu.gen + '000' : d.cpu.gen + '.ª gen.') : ''}) puede frenar a una gráfica moderna. En tu misma placa hay opciones mejores.`, processor(d, profile));
      }
      if (lowRam || (d.modules === 1 && d.ramGb <= 16) || (d.laptop && d.ramGb && d.ramGb <= 16)) add('ram', d.laptop ? 6 : 8, 'Memoria: doble canal y más capacidad', d.modules === 1 ? 'Con un solo módulo la memoria trabaja en canal simple, y eso resta FPS (sobre todo con gráficos integrados).' : `Con ${d.ramGb} GB muchos juegos actuales se quedan cortos.`, memory(d));
    }
    if (goals.has('slow') || goals.has('boot')) {
      if (d.storageType === 'hdd' || d.storageType === '') add('ssd', d.storageType === 'hdd' ? 11 : 5, 'Disco del sistema en SSD', d.storageType === 'hdd' ? 'Tu sistema está en un disco mecánico: es la mejora que más se nota al encender y abrir programas.' : 'Si tu sistema está en un disco mecánico, pasarlo a SSD es lo que más se nota.', storage(d, 'speed'));
      else if (d.storageType === 'sata' && goals.has('boot')) add('ssd', 4, 'Disco NVMe: más rápido que tu SSD SATA', 'La diferencia se nota en cargas grandes; en el arranque la mejora es menor.', storage(d, 'speed'));
      else if (goals.has('boot')) add('ssd', 1, 'Tu disco ya es rápido', '', storage(d, 'speed'));
      if (goals.has('slow') && (lowRam || !d.ramGb)) add('ram', lowRam && d.ramGb <= 8 ? 10 : 7, 'Más memoria RAM', d.ramGb ? `Con ${d.ramGb} GB el sistema recurre al disco cuando abres varias apps.` : 'Si la memoria se llena al trabajar, ampliarla es lo que más ayuda.', memory(d));
      if (goals.has('slow') && !d.laptop && d.cores && d.cores <= 4) add('cpu', 6, 'Procesador con más núcleos', `Con ~${d.cores} núcleos el procesador se satura con varias tareas.`, processor(d, profile));
      if (goals.has('slow') && d.laptop && d.ramGb === 16 && !goals.has('fps')) add('ram', 5, 'Pasar a 32 GB de RAM', 'Con 16 GB vas bien para la mayoría de usos; 32 GB ayudan si trabajas con muchas apps, juegos recientes o edición.', memory(d));
      if (goals.has('slow') && d.laptop && !lowRam && d.storageType === 'nvme') add('slow-laptop', 2, 'Tu laptop ya tiene buena base', 'Con SSD NVMe y 16 GB o más, la lentitud suele venir de temperatura (el procesador baja su velocidad), del modo de energía o de programas en segundo plano. Revisa el apartado de temperatura.', { picks: [], empty: 'No hay una pieza que solucione esto por sí sola.' });
    }
    if (goals.has('memory')) add('ram', 9, 'Más memoria RAM', d.ramGb ? `Hoy tienes ${d.ramGb} GB: te mostramos módulos para llegar a ${Math.min(d.ramGb * 2, 64)} GB.` : 'Módulos compatibles con tu equipo.', memory(d));
    if (goals.has('space')) add('space', 5, 'Más espacio de almacenamiento', d.storageGb ? `Hoy tienes ${gb(d.storageGb)}: un segundo disco (o uno más grande) te da espacio sin borrar nada.` : 'Discos compatibles con más capacidad.', storage(d, 'space'));
    if (goals.has('heat')) {
      if (d.laptop) add('heat-laptop', 4, 'Temperatura y ruido de la laptop', 'Limpia rejillas y ventiladores, usa la laptop sobre una superficie dura y elevada, y en programas de la marca (p. ej. Armoury Crate) usa un modo equilibrado. Cambiar la pasta térmica lo debe hacer un servicio técnico.', { picks: [], empty: 'No hay piezas internas de refrigeración que se puedan cambiar en una laptop.' });
      else add('cooler', 6, 'Mejor refrigeración del procesador', 'Un disipador de torre o una refrigeración líquida bajan la temperatura y el ruido frente al disipador de serie.', cooling(d));
    }
    // Una sección por pieza: si dos objetivos piden RAM, se queda la de mayor impacto.
    const unique = sections.sort((a, b) => b.impact - a.impact).filter((s, i, all) => all.findIndex(x => x.id === s.id) === i);
    return { detected: d, sections: unique };
  }
  function offer(p) {
    const o = market.fixed?.(p) || market.lastObserved?.(p);
    return o && /^https:\/\//.test(o.url || '') ? o : null;
  }
  window.FENIXA_PC_UPGRADES = { plan, detect, cpuInfo, gpuScore, offer, reference: ref };
})();
