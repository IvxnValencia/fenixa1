// Mejorar mi PC: piezas concretas del catálogo para cada mejora recomendada.
// Filtra por lo que el usuario registró (generación de RAM, tipo de equipo,
// disco actual) y devuelve hasta tres opciones escalonadas por precio, con su
// referencia de coste y la tienda donde se consultó.
(() => {
  'use strict';
  const catalog = window.FENIXA_CATALOG, market = window.FENIXA_MARKET;
  const facts = p => window.FENIXA_SPECS?.facts?.(p)?.values || {};
  const ref = p => window.FENIXA_AUTO_BUILD?.reference?.(p) || null;
  // Se calcula al primer uso: auto-build.js (que da la referencia de coste) se carga después.
  let priced = null;
  const byCategory = c => {
    priced ||= catalog.products.filter(p => ref(p) && !window.FENIXA_SPECS?.facts?.(p)?.identityConflict);
    return priced.filter(p => p.category === c).sort((a, b) => ref(a).low - ref(b).low);
  };
  // Datos de la ficha y, si faltan, los del nombre comercial («Ddr4 16gb 3200»).
  const ramInfo = p => {
    const f = facts(p), name = String(p.name);
    return {
      kind: (String(f.memory || '').match(/DDR[345]/i) || name.match(/DDR[345]/i) || [''])[0].toUpperCase(),
      capacity: f.capacity || Number((name.match(/(\d+)\s*G(?:B)?\b/i) || [])[1]) || 0,
      laptop: /SO.?DIMM/i.test(f.format || '') || /port[aá]til/i.test(name)
    };
  };
  const gb = n => n >= 1000 ? Math.round(n / (n % 1000 && n % 1024 === 0 ? 1024 : 1000) * 10) / 10 + ' TB' : n + ' GB';
  const parseStorage = text => {
    const m = String(text || '').match(/(\d+(?:[.,]\d+)?)\s*(TB|GB)/i);
    return m ? Math.round(parseFloat(m[1].replace(',', '.')) * (/TB/i.test(m[2]) ? 1000 : 1)) : 0;
  };
  // Una opción por escalón: la más económica, una intermedia y la de mayor alcance.
  function spread(list, count = 3) {
    if (list.length <= count) return list;
    const picks = count < 3 ? [list[0], list[list.length - 1]] : [list[0], list[Math.floor((list.length - 1) / 2)], list[list.length - 1]];
    return picks.filter((p, i) => picks.indexOf(p) === i);
  }
  const distinct = (list, key) => list.filter((p, i, all) => all.findIndex(x => key(x) === key(p)) === i);
  function storage(profile, mode) {
    const laptop = profile.device === 'laptop', current = parseStorage(profile.storageGb);
    const internal = byCategory('storage').filter(p => facts(p).placement === 'Interno' && facts(p).capacity);
    const fits = p => laptop ? /M\.2/.test(facts(p).format || '') : true;
    if (mode === 'speed') {
      // Pasar el sistema a un SSD: NVMe si hay ranura M.2; SATA de 2,5" vale para casi cualquier torre.
      const nvme = internal.filter(p => /M\.2/.test(facts(p).format || '') && /NVMe/i.test(facts(p).pcie || '') && facts(p).capacity >= 480);
      const sata = laptop ? [] : internal.filter(p => /2,5/.test(facts(p).format || '') && facts(p).capacity >= 480);
      return [...sata.slice(0, 1), ...distinct(nvme, p => facts(p).capacity).slice(0, laptop ? 3 : 2)].map(p => ({ p, note: /2,5/.test(facts(p).format || '') ? 'SATA 2,5": usa un puerto SATA y cable de datos.' : 'M.2 NVMe: necesita una ranura M.2 libre que admita NVMe.' }));
    }
    const target = Math.max(1000, current * 2 || 0);
    const bigger = distinct(internal.filter(p => fits(p) && facts(p).capacity >= Math.min(target, 2000)), p => facts(p).capacity);
    const external = byCategory('storage').filter(p => facts(p).placement === 'Externo').slice(0, 1);
    return [...spread(bigger, 2), ...external].map(p => ({ p, note: facts(p).placement === 'Externo' ? 'Externo por USB: no requiere abrir el equipo.' : `${gb(facts(p).capacity)}${current ? ' frente a los ' + gb(current) + ' que registraste' : ''}.` }));
  }
  function memory(profile) {
    const laptop = profile.device === 'laptop', current = Number(profile.ramGb) || 0;
    const kits = byCategory('ram').filter(p => {
      const r = ramInfo(p);
      return (!profile.ramType || r.kind === profile.ramType) && r.capacity >= 8 && r.laptop === laptop;
    });
    // Un módulo igual al que ya tienes (si hay ranura libre) y kits de más capacidad.
    const useful = kits.filter(p => ramInfo(p).capacity >= Math.min(16, current || 16) || (current && ramInfo(p).capacity === current));
    const note = p => {
      const c = ramInfo(p).capacity, base = `${c} GB ${ramInfo(p).kind}${laptop ? ' SO-DIMM' : ''}`;
      if (current && c === current) return `${base}: con una ranura libre sumas ${current * 2} GB en doble canal.`;
      if (current && c > current) return `${base}: sustituye tus ${current} GB o súmalos si tu placa lo admite.`;
      return base + '.';
    };
    return spread(distinct(useful.length ? useful : kits, p => ramInfo(p).capacity + ramInfo(p).kind)).map(p => ({ p, note: note(p) }));
  }
  function graphics() {
    const gpus = byCategory('gpu').filter(p => facts(p).vram && facts(p).recommendedPsu);
    return spread(gpus).map(p => ({ p, note: `${facts(p).vram} GB VRAM · fuente recomendada ${facts(p).recommendedPsu} W · ${facts(p).length} mm de largo.` }));
  }
  function cooling(profile) {
    const socket = String(profile.board || profile.cpu || '').toUpperCase().match(/AM[45]|LGA\s?\d{4}/)?.[0]?.replace(/\s/g, '');
    const key = socket?.startsWith('LGA') ? socket.replace(/\D/g, '') : socket;
    const coolers = byCategory('cooler').filter(p => !key || String(facts(p).sockets || '').toUpperCase().includes(key));
    const air = coolers.filter(p => facts(p).coolerType === 'air'), aio = coolers.filter(p => facts(p).coolerType === 'aio');
    return [air[0], air.find(p => /dos|doble/i.test(facts(p).format || '')), aio[0]].filter(Boolean).map(p => ({ p, note: `${facts(p).coolerType === 'aio' ? 'Refrigeración líquida' : 'Torre de aire'}${facts(p).height ? ' · ' + facts(p).height + ' mm de alto' : ''}${key ? ' · declara ' + socket : ' · confirma tu socket'}.` }));
  }
  function suggest(profile, id) {
    if (['ssd', 'boot'].includes(id)) return storage(profile, 'speed');
    if (id === 'space') return storage(profile, 'space');
    if (id === 'ram') return memory(profile);
    if (id === 'gpu') return profile.device === 'desktop' ? graphics() : [];
    if (id === 'heat') return profile.device === 'desktop' ? cooling(profile) : [];
    return [];
  }
  function offer(p) {
    const o = market.fixed?.(p) || market.lastObserved?.(p);
    return o && /^https:\/\//.test(o.url || '') ? o : null;
  }
  window.FENIXA_PC_UPGRADES = { suggest, offer, reference: ref };
})();
