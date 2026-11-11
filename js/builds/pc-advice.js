(() => {
  'use strict';
  const choices = {
    device: ['desktop', 'laptop'], ramGb: ['4', '8', '16', '32', '64', '128'],
    ramType: ['DDR3', 'DDR4', 'DDR5'], storageType: ['hdd', 'sata', 'nvme', 'ssd'],
    graphics: ['integrated', 'dedicated'], use: ['study', 'gaming', 'creative'],
    symptom: ['none', 'slow', 'memory', 'space', 'fps']
  };
  function normalize(raw) {
    const result = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    for (const key of ['name', 'cpu', 'board', 'gpu', 'storageGb']) {
      if (typeof raw[key] === 'string') result[key] = raw[key].trim().slice(0, 100);
    }
    for (const [key, values] of Object.entries(choices)) result[key] = values.includes(raw[key]) ? raw[key] : '';
    return result;
  }
  function migrate(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const ram = typeof raw.ram === 'string' ? raw.ram : '';
    const storage = typeof raw.storage === 'string' ? raw.storage : '';
    return normalize({ cpu: raw.cpu, gpu: raw.gpu, ramGb: ram.match(/\b(4|8|16|32|64|128)\s*GB/i)?.[1],
      ramType: ram.match(/DDR[345]/i)?.[0].toUpperCase(),
      storageType: /NVMe/i.test(storage) ? 'nvme' : /SSD/i.test(storage) ? 'ssd' : /HDD/i.test(storage) ? 'hdd' : '',
      storageGb: storage, graphics: /integrad/i.test(String(raw.gpu || '')) ? 'integrated' : '' });
  }
  function advise(raw) {
    const p = normalize(raw), advice = [];
    const add = (id, title, reason, check, category = '', query = '') => advice.push({ id, title, reason, check, category, query });
    const ram = Number(p.ramGb);
    if (p.storageType === 'hdd' && p.symptom === 'slow') add('ssd', 'Evalúa pasar el sistema a un SSD', 'Registraste un disco mecánico y lentitud. El almacenamiento es una posibilidad que conviene revisar primero.', 'Confirma el uso del disco durante la lentitud y el conector admitido. M.2 no garantiza compatibilidad NVMe. Haz una copia de seguridad antes de migrar.', 'storage');
    if (p.symptom === 'memory' || (ram > 0 && ram < 16 && p.symptom !== 'none')) add('ram', 'Comprueba si te falta memoria RAM', ram ? `Registraste ${ram} GB. Si la memoria se llena durante tu trabajo, evalúa ampliar${ram < 16 ? ' a 16 GB' : p.use === 'creative' && ram < 32 ? ' a 32 GB' : ''}.` : 'Mira cuánta memoria tienes y cuánto se ocupa al usar tus programas antes de elegir una ampliación.', `Verifica el máximo, las ranuras y el formato de tu equipo. ${p.ramType ? `Tu perfil indica ${p.ramType}: no compres otra generación de memoria.` : 'Identifica si utiliza DDR3, DDR4 o DDR5; no son intercambiables.'}`, p.ramType ? 'ram' : '', p.ramType || '');
    if (p.symptom === 'space') add('space', 'Revisa el espacio antes de reemplazar el disco', 'La falta de espacio no implica que necesites cambiar CPU o gráfica. Revisa archivos, copias y la capacidad que realmente necesitas.', 'Si necesitas otro disco, confirma puertos, ranuras y formato disponibles. El catálogo aún es pequeño y puede no incluir la capacidad que buscas.', 'storage');
    if (p.symptom === 'fps' && p.use === 'gaming') add('gpu', 'Identifica qué limita tus juegos', p.graphics === 'integrated' ? 'Usas gráficos integrados. Una gráfica dedicada puede ser una opción, pero primero prueba bajar resolución y calidad.' : 'Registra el juego, resolución y uso de CPU/GPU durante una partida. Pocos FPS no demuestran por sí solos que debas cambiar la gráfica.', 'Antes de elegir una GPU comprueba la fuente exacta, conectores, espacio de la caja y requisitos del juego. No estimamos FPS ni garantizamos compatibilidad.', p.device === 'desktop' ? 'gpu' : '');
    if (p.symptom === 'slow' && p.storageType !== 'hdd') add('diagnose', 'Observa la lentitud antes de comprar', 'Revisa CPU, memoria y disco mientras ocurre el problema; también el espacio libre y los programas que arrancan con el sistema.', 'No podemos deducir el componente limitante solo por el nombre del procesador. Anota cuándo aparece el problema.');
    if (!p.cpu || !p.board || !p.ramGb || !p.ramType || !p.storageType || !p.device || !p.use || !p.symptom) add('identify', 'Completa los datos que faltan', 'Conocer el modelo del equipo o placa, memoria, almacenamiento y uso evita recomendar una pieza que no puedas instalar.', 'Usa la ayuda «Cómo identificar mi PC». Puedes dejar lo desconocido vacío; no lo sustituiremos por una suposición.');
    if (p.device === 'laptop') add('laptop', 'En portátil, consulta el manual del modelo exacto', 'La RAM o el almacenamiento pueden estar soldados y la gráfica normalmente no se reemplaza como una tarjeta de escritorio.', 'Las piezas del catálogo son principalmente para escritorio. Verifica opciones de ampliación del fabricante antes de explorar compras.');
    if (p.symptom === 'none') add('keep', 'Si tu PC cumple, puedes conservarla', 'No indicaste un problema actual. No hace falta comprar solo por tener componentes más recientes.', 'Vuelve a revisar cuando cambie tu uso o detectes una limitación concreta.');
    if (!advice.length) add('baseline', 'Necesitamos más contexto antes de elegir una pieza', 'Indica qué tarea quieres mejorar y revisa el uso de recursos mientras la realizas.', 'Esta orientación es por reglas, no un diagnóstico automático ni una prueba de rendimiento.');
    // Laptop expansion needs exact manufacturer confirmation; never imply desktop products fit.
    if (p.device !== 'desktop') advice.forEach(item => { item.category = ''; });
    return advice;
  }
  window.FENIXA_PC = { normalize, migrate, advise };
})();
