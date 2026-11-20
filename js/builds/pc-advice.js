(() => {
  'use strict';
  const choices = {
    device: ['desktop', 'laptop'], ramGb: ['4', '8', '16', '32', '64', '128'],
    ramType: ['DDR3', 'DDR4', 'DDR5'], storageType: ['hdd', 'sata', 'nvme', 'ssd'],
    graphics: ['integrated', 'dedicated'], use: ['study', 'gaming', 'creative'],
    ramModules: ['1', '2', '4'], psuW: ['300', '400', '450', '500', '550', '600', '650', '750', '850', '1000']
  };
  // Se pueden marcar varias mejoras a la vez; «none» solo vale sola.
  const goals = ['slow', 'boot', 'memory', 'space', 'fps', 'heat', 'none'];
  function normalize(raw) {
    const result = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    for (const key of ['name', 'cpu', 'board', 'gpu', 'storageGb']) {
      if (typeof raw[key] === 'string') result[key] = raw[key].trim().slice(0, 100);
    }
    for (const [key, values] of Object.entries(choices)) result[key] = values.includes(raw[key]) ? raw[key] : '';
    const list = Array.isArray(raw.symptoms) ? raw.symptoms : typeof raw.symptom === 'string' && raw.symptom ? [raw.symptom] : [];
    let symptoms = goals.filter(g => list.includes(g));
    if (symptoms.length > 1) symptoms = symptoms.filter(g => g !== 'none');
    result.symptoms = symptoms;
    result.symptom = symptoms[0] || '';
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
    const p = normalize(raw), advice = [], has = goal => p.symptoms.includes(goal);
    const add = (id, title, reason, check, category = '', query = '') => advice.push({ id, title, reason, check, category, query });
    const ram = Number(p.ramGb);
    const laptop = p.device === 'laptop';
    const task = {study:'tus clases o aplicaciones de trabajo', gaming:'el juego que quieres mejorar', creative:'tu proyecto de edición o creación'}[p.use] || 'tu tarea habitual';
    const spaceUse = {
      gaming: 'Comprueba cuánto ocupan los juegos que quieres mantener instalados y cuánto espacio necesitan sus actualizaciones.',
      creative: 'Separa proyectos activos, archivos de origen y cachés de edición para estimar la capacidad que necesitas.',
      study: 'Revisa descargas, copias locales de la nube y aplicaciones que ya no utilizas antes de ampliar el disco.'
    };
    const diskCheck = laptop ? 'Consulta en el manual del modelo si hay una ranura accesible y qué formato y longitud admite.' : 'Revisa en la placa qué puertos SATA o ranuras M.2 quedan libres y qué protocolos admiten.';
    if (has('none') || !p.symptoms.length) {
      add('keep', 'Conserva tu equipo actual', `Si puedes completar ${task} con fluidez, puedes seguir con tu configuración.`, 'Vuelve a revisar el perfil cuando cambien tus programas o notes una limitación.');
      return advice;
    }
    if (p.storageType === 'hdd' && (has('slow') || has('boot'))) add('ssd', 'Evalúa pasar el sistema a un SSD', 'Registraste un disco mecánico. Pasar el sistema a un SSD es la mejora que más se nota al arrancar y abrir programas.', diskCheck + ' Haz una copia de seguridad antes de migrar.', 'storage');
    if (has('boot') && p.storageType !== 'hdd') add('boot', 'Revisa el arranque y el disco del sistema', p.storageType ? 'Ya usas un SSD: revisa los programas que se abren al iniciar. Si el disco está casi lleno, un SSD más rápido o más grande ayuda.' : 'Si el sistema está en un disco mecánico (HDD), un SSD es la mejora más notable al encender el equipo.', 'Desactiva programas de inicio que no necesites en el Administrador de tareas → Inicio.', 'storage');
    if (has('memory') || (ram > 0 && ram < 16 && (has('slow') || has('fps')))) add('ram', 'Comprueba si te falta memoria RAM', ram ? `Registraste ${ram} GB. Comprueba el consumo mientras usas ${task}. Si se llena, evalúa una ampliación.` : `Comprueba la memoria instalada y el consumo mientras usas ${task}. Si la memoria se llena en ese momento, revisa las opciones de ampliación.`, `${laptop ? 'Consulta si la memoria está soldada o si el modelo admite módulos reemplazables.' : 'Consulta el número de ranuras DIMM libres y la capacidad máxima de tu placa.'} ${p.ramType ? 'Tu perfil indica '+p.ramType+'.' : 'Confirma la generación de memoria antes de elegir un módulo.'}`, p.ramType ? 'ram' : '', p.ramType || '');
    if (has('space')) add('space', 'Revisa el espacio antes de reemplazar el disco', spaceUse[p.use] || 'Revisa archivos y aplicaciones para estimar cuánta capacidad necesitas.', diskCheck, 'storage');
    if (has('fps') && laptop) add('fps-laptop', 'Revisa qué limita los FPS de tu laptop',
      p.graphics === 'integrated' ? 'Con gráficos integrados, prueba una resolución o calidad menor en la misma escena y compara el resultado.' : 'Comprueba qué GPU usa el juego y compara los FPS con el cargador conectado.',
      'Revisa el modo de energía y las temperaturas durante la partida. Consulta las opciones de servicio de tu modelo antes de considerar cambios de hardware.');
    if (has('fps') && !laptop) add('gpu', 'Identifica qué limita tus juegos', p.graphics === 'integrated' ? 'Usas gráficos integrados. Una gráfica dedicada puede ser una opción, pero primero prueba bajar resolución y calidad.' : 'Registra el juego, resolución y uso de CPU/GPU durante una partida. Pocos FPS no demuestran por sí solos que debas cambiar la gráfica.', 'Antes de elegir una GPU comprueba la fuente exacta, conectores, espacio de la caja y requisitos del juego. No estimamos FPS ni garantizamos compatibilidad.', p.device === 'desktop' ? 'gpu' : '');
    if (has('heat')) add('heat', laptop ? 'Revisa temperatura y ventilación de tu laptop' : 'Mejora la refrigeración del procesador', laptop ? 'Limpia las rejillas, usa el equipo sobre una superficie dura y revisa el modo de energía. Una base refrigerante puede ayudar.' : 'Si el procesador se calienta o el ventilador hace mucho ruido, un disipador de torre o una refrigeración líquida bajan la temperatura.', laptop ? 'Si la temperatura sigue alta, consulta el servicio técnico de la marca: cambiar pasta térmica en una laptop requiere desmontarla.' : 'Mide la altura máxima de disipador que admite tu caja y confirma el socket de tu placa antes de comprar.', laptop ? '' : 'cooler');
    if (has('slow') && p.storageType !== 'hdd') add('diagnose', 'Observa la lentitud antes de comprar', `Abre el monitor de rendimiento mientras usas ${task} y observa qué recurso se mantiene ocupado.`, 'No podemos deducir el componente limitante solo por el nombre del procesador. Anota cuándo aparece el problema.');
    if (!advice.length && (!p.cpu || !p.board || !p.ramGb || !p.ramType || !p.storageType || !p.device || !p.use || !p.symptoms.length)) add('identify', 'Completa los datos que faltan', 'Conocer el modelo del equipo o placa, memoria, almacenamiento y uso evita recomendar una pieza que no puedas instalar.', 'Usa la ayuda «Cómo identificar mi PC». Puedes dejar lo desconocido vacío; no lo sustituiremos por una suposición.');
    if (laptop && !['memory','space','fps','boot','heat'].some(has) && !advice.some(item => item.id === 'ssd')) add('laptop', 'Consulta las ampliaciones de tu modelo', 'La RAM o el almacenamiento pueden estar soldados y la gráfica normalmente no se reemplaza como una tarjeta de escritorio.', 'Las piezas del catálogo son principalmente para escritorio. Verifica opciones de ampliación del fabricante antes de explorar compras.');
    if (!advice.length) add('baseline', 'Necesitamos más contexto antes de elegir una pieza', 'Indica qué tarea quieres mejorar y revisa el uso de recursos mientras la realizas.', 'Esta orientación es por reglas, no un diagnóstico automático ni una prueba de rendimiento.');
    // En laptops solo se sugieren módulos SO-DIMM y SSD M.2; la ampliación se confirma en el manual del modelo.
    if (p.device !== 'desktop') advice.forEach(item => { if (!['ram','ssd','space','boot'].includes(item.id)) item.category = ''; });
    return advice;
  }
  window.FENIXA_PC = { normalize, migrate, advise, goals };
})();
