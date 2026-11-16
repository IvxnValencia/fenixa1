// Generador de la ruta de ensamblaje (módulo PURO).
//
// A partir del perfil de build-profile.js decide qué pasos existen, en qué
// orden y con qué instrucciones. Reglas:
// · Un paso solo aparece si la build tiene las piezas que lo justifican.
// · Las instrucciones se adaptan a datos reales (socket, tipo de memoria,
//   refrigeración, almacenamiento, fuente). Si un dato falta, el paso usa un
//   procedimiento genérico y lo indica (`basis: 'generico'`).
// · Los detalles que dependen del fabricante remiten al manual.
//
// Cada paso: { id, title, summary, instructions[], practice[], focus, basis, note }
//   practice → ids de piezas 3D que se pueden instalar en el modo práctica.
//   focus    → pieza 3D relacionada para inspeccionar.

const FORM = { atx: 'ATX', 'micro-atx': 'micro-ATX', 'mini-itx': 'Mini-ITX', 'e-atx': 'E-ATX' };
const basisOf = (...facts) => (facts.every(f => f?.source === 'ficha') ? 'ficha' : facts.some(f => f?.source === 'ficha' || f?.source === 'texto') ? 'parcial' : 'generico');

export function generateRoute(profile) {
  const P = profile.parts;
  const has = cat => Boolean(P[cat]);
  const steps = [];
  const add = step => steps.push({ practice: [], instructions: [], basis: 'generico', note: '', ...step, instructions: (step.instructions || []).filter(Boolean) });
  const socket = profile.platform.socket.value;
  const name = cat => P[cat]?.name || '';

  if (profile.empty) return [];

  add({
    id: 'prep', title: 'Prepara tu espacio', summary: 'Mesa despejada, buena luz y piezas a mano.', basis: 'generico',
    instructions: [
      'Trabaja sobre una superficie despejada y no metálica, con buena luz.',
      'Descárgate de electricidad estática antes de tocar los componentes: toca una parte metálica sin pintura del gabinete o usa una pulsera antiestática.',
      'Ten a mano un destornillador Phillips, los manuales y un recipiente para los tornillos.',
      'Deja la fuente desenchufada durante todo el montaje.'
    ]
  });

  if (has('board')) add({
    id: 'board-prep', title: 'Prepara la placa base', focus: 'board', basis: basisOf(profile.board.form),
    summary: `${name('board')}${profile.board.form.value ? ` · ${FORM[profile.board.form.value] || profile.board.form.value}` : ''}`,
    instructions: [
      'Sácala de la bolsa sujetándola por los bordes.',
      'Apóyala sobre su caja de cartón, no sobre la bolsa antiestática: así es más cómodo instalar procesador, memoria y SSD antes de meterla en el gabinete.'
    ]
  });

  if (has('cpu') && has('board')) add({
    id: 'cpu', title: 'Instala el procesador', practice: ['cpu'], focus: 'cpu', basis: basisOf(profile.platform.socket),
    summary: `${name('cpu')}${socket ? ` en el socket ${socket}` : ''}`,
    instructions: [
      'Levanta la palanca de retención del socket (y la placa de carga, si la tiene).',
      profile.platform.lga === true ? `En ${socket} los contactos están en el socket de la placa: no los toques ni dejes caer nada sobre ellos.`
        : socket === 'AM4' ? 'En AM4 los pines están en el procesador: sujétalo por los bordes y no los dobles.'
        : 'Según la plataforma, los pines están en el socket o en el procesador: consulta el manual y no los toques.',
      'Alinea la marca triangular del procesador con la del socket y colócalo en vertical, sin deslizarlo ni hacer fuerza.',
      'Baja la palanca. Si el socket tiene tapa protectora, sigue el manual sobre cuándo retirarla y guárdala.'
    ]
  });

  if (has('ram') && has('board') && !profile.ram.sodimm) {
    const n = profile.ram.modules, slots = profile.board.dimmSlots;
    const ids = Array.from({ length: Math.min(n, 2) }, (_, i) => `ram-${i + 1}`);
    add({
      id: 'ram', title: 'Instala la memoria', practice: ids, focus: 'ram-1', basis: basisOf(profile.platform.ramMemory),
      summary: `${n} ${n === 1 ? 'módulo' : 'módulos'}${profile.platform.ramMemory.value ? ` ${profile.platform.ramMemory.value}` : ''} · ${name('ram')}`,
      instructions: [
        'Abre los seguros de las ranuras.',
        slots === 2 ? `Tu placa tiene dos ranuras${n >= 2 ? ': usa ambas.' : '. Con un solo módulo, el manual indica cuál usar.'}`
          : n === 1 ? 'Con un solo módulo, la mayoría de placas recomienda la segunda ranura (A2). Confírmalo en el manual.'
          : n === 2 ? 'Con dos módulos, la mayoría de placas recomienda la segunda y la cuarta ranura (A2 y B2). Confírmalo en el manual de tu placa.'
          : 'Ocupa las ranuras en el orden que indica el manual.',
        'Alinea la muesca del módulo con el saliente de la ranura y presiona ambos extremos a la vez hasta que los seguros cierren.',
        n > 2 ? 'El modo práctica muestra dos módulos; instala el resto del mismo modo.' : ''
      ]
    });
  }

  if (profile.storage.kind === 'm2' && has('board')) {
    const fmt = String(P.storage?.facts?.values?.format || '');
    add({
      id: 'm2', title: 'Instala el SSD M.2', practice: ['m2'], focus: 'm2', basis: 'ficha',
      summary: `${name('storage')}${profile.storage.interface ? ` · ${profile.storage.interface}` : ''}`,
      instructions: [
        `Busca en el manual qué ranura M.2 conviene usar${Number.isFinite(profile.board.m2Slots) ? ` (tu placa publica ${profile.board.m2Slots})` : ''}: suele ser la más cercana al procesador.`,
        'Si la ranura tiene disipador, retíralo y quita la película de su almohadilla térmica.',
        /con disipador/i.test(fmt) ? 'Tu SSD trae disipador propio: comprueba en el manual si se puede usar junto con el de la placa o si debes elegir uno.' : '',
        'Inserta el SSD inclinado en el conector y bájalo hasta fijarlo con su tornillo o seguro.'
      ]
    });
  }

  const coolerStep = kind => {
    if (kind === 'air') return {
      id: 'cooler', title: 'Instala el disipador', practice: ['cooler'], focus: 'cooler', basis: 'ficha',
      summary: `${name('cooler')}${profile.cooler.height ? ` · ${profile.cooler.height} mm de alto` : ''}`,
      instructions: [
        `Monta el soporte o backplate${socket ? ` para ${socket}` : ''} siguiendo el manual del disipador.`,
        'Retira la película protectora de la base y aplica pasta térmica si no viene preaplicada.',
        'Coloca el disipador con el ventilador empujando el aire hacia la salida trasera y aprieta los tornillos poco a poco y en cruz.',
        'Comprueba que no choca con la memoria y conecta el ventilador a la cabecera CPU_FAN.'
      ]
    };
    if (kind === 'stock') return {
      id: 'cooler', title: 'Instala el disipador incluido', practice: ['cooler'], focus: 'cooler', basis: 'parcial',
      summary: `Disipador de serie de ${name('cpu')} (confirma que tu unidad lo trae)`,
      instructions: [
        'El disipador incluido suele traer pasta térmica preaplicada: no la retires ni añadas más.',
        'Fíjalo con el sistema de anclaje que indica el manual del procesador, apretando de forma gradual y en cruz.',
        'Conecta su ventilador a la cabecera CPU_FAN.'
      ]
    };
    return {
      id: 'cooler', title: 'Instala la refrigeración del procesador', focus: 'cooler', basis: 'generico',
      summary: name('cooler') || 'Refrigeración del procesador', note: 'No consta el tipo de refrigeración: sigue el manual del fabricante.',
      instructions: ['Sigue el manual del fabricante para el soporte de tu socket, la pasta térmica y la conexión del ventilador o la bomba.']
    };
  };

  // Torres de aire y disipadores de serie: con la placa fuera del gabinete.
  if (has('board') && has('cpu') && ['air', 'stock', 'unknown'].includes(profile.cooler.kind)) add(coolerStep(profile.cooler.kind));

  if (has('case')) add({
    id: 'case-prep', title: 'Prepara el gabinete', focus: 'case', basis: basisOf(profile.board.form),
    summary: name('case'),
    instructions: [
      'Retira los paneles laterales y guarda los tornillos.',
      has('board') ? `Comprueba que los separadores coinciden con los orificios de tu placa${profile.board.form.value ? ` ${FORM[profile.board.form.value] || ''}` : ''}. Retira cualquier separador sobrante: puede causar un cortocircuito.` : '',
      'Si tu placa no trae el escudo de E/S integrado, instálalo ahora desde dentro del gabinete.'
    ]
  });

  if (has('power') && has('case')) {
    const m = profile.power.modular;
    add({
      id: 'psu', title: 'Instala la fuente', practice: ['psu'], focus: 'psu', basis: m === 'unknown' ? 'generico' : 'ficha',
      summary: name('power'),
      instructions: [
        'Colócala en su bahía con el ventilador hacia una entrada de aire. Si toma aire por abajo, el gabinete necesita patas y filtro inferior.',
        'Fíjala con sus tornillos desde la parte trasera.',
        m === 'full' ? 'Es totalmente modular: conecta solo los cables que vas a usar.'
          : m === 'semi' ? 'Es semimodular: algunos cables son fijos; conecta solo los modulares que necesites.'
          : m === 'none' ? 'No es modular: recoge los cables que no uses en la zona de la bahía.'
          : 'Si es modular, conecta solo los cables que vas a usar.',
        'Usa solo los cables de esta fuente: los de otras fuentes pueden tener otro cableado aunque el conector encaje. Nunca abras la fuente.'
      ]
    });
  }

  if (has('case') && has('board')) add({
    id: 'board-install', title: 'Instala la placa en el gabinete', focus: 'board', basis: 'generico',
    summary: 'Escudo de E/S, separadores y tornillos.', note: 'Este paso todavía no tiene práctica 3D.',
    instructions: [
      'Baja la placa en ángulo, encaja los puertos traseros en el escudo de E/S y apóyala sobre los separadores.',
      'Atornilla sin apretar en exceso, empezando por los tornillos centrales.'
    ]
  });

  if (profile.cooler.kind === 'aio' && has('cpu')) add({
    id: 'cooler', title: 'Instala la refrigeración líquida', practice: ['cooler'], focus: 'cooler', basis: 'ficha',
    summary: `${name('cooler')}${profile.cooler.radiator ? ` · radiador de ${profile.cooler.radiator} mm` : ''}`,
    instructions: [
      `Monta el radiador${profile.cooler.radiator ? ` de ${profile.cooler.radiator} mm` : ''} donde lo admita tu gabinete (frontal o superior, según su manual).`,
      `Instala el soporte del bloque${socket ? ` para ${socket}` : ''} según el manual de la refrigeración.`,
      'Coloca el bloque sobre el procesador (con pasta térmica si no viene preaplicada) y apriétalo de forma gradual y en cruz.',
      'Conecta la bomba y los ventiladores a las cabeceras que indica el manual.'
    ]
  });

  if (profile.storage.kind === 'sata25' && has('case')) add({
    id: 'sata', title: 'Instala la unidad de 2,5"', focus: 'case', basis: 'ficha', note: 'Este paso todavía no tiene práctica 3D.',
    summary: name('storage'),
    instructions: [
      'Fíjala en una bahía o soporte de 2,5" del gabinete.',
      'Conecta un cable SATA de datos a la placa y un cable de alimentación SATA desde la fuente.'
    ]
  });

  if (has('gpu') && has('board')) {
    const box = P.case?.facts?.values || {};
    add({
      id: 'gpu', title: 'Instala la tarjeta gráfica', practice: ['gpu'], focus: 'gpu', basis: profile.gpu.length ? 'ficha' : 'generico',
      summary: `${name('gpu')}${profile.gpu.length ? ` · ${profile.gpu.length} mm` : ''}`,
      instructions: [
        'Retira las tapas de las ranuras de expansión que ocupará el soporte trasero.',
        'Abre el seguro de la ranura PCIe x16 principal e inserta la tarjeta en vertical hasta que el seguro cierre.',
        'Atornilla el soporte trasero al gabinete.',
        profile.gpu.length && Number.isFinite(box.gpuMax) ? `Longitud publicada: ${profile.gpu.length} mm. El gabinete admite ${box.gpuMax} mm${box.gpuMaxConditional ? ' en la disposición más restrictiva' : ''}.` : ''
      ]
    });
  }

  if (has('power') && has('board')) add({
    id: 'power-cables', title: 'Conecta la alimentación', focus: 'psu', basis: profile.gpu.present ? basisOf({ source: profile.gpu.power ? 'ficha' : 'generico' }) : 'generico',
    summary: 'Placa, procesador' + (profile.gpu.needsPower ? ', gráfica' : '') + (profile.storage.kind === 'sata25' ? ' y unidad SATA' : '') + '.',
    instructions: [
      'Conecta el cable ATX de 24 pines a la placa.',
      'Conecta el cable EPS de 8 pines (4+4) del procesador cerca del socket. Si la placa tiene un segundo conector, el manual indica si es necesario.',
      profile.gpu.needsPower ? `Conecta la alimentación de la gráfica (${profile.gpu.power || 'según su manual'}).` : profile.gpu.present ? 'Tu gráfica no publica conector auxiliar: se alimenta por la ranura PCIe.' : '',
      profile.storage.kind === 'sata25' ? 'Conecta la alimentación SATA de la unidad de 2,5".' : '',
      'Empuja cada conector hasta que su seguro encaje.'
    ]
  });

  if (has('case') && has('board')) add({
    id: 'front-panel', title: 'Conecta el panel frontal', focus: 'board', basis: 'generico',
    summary: 'Encendido, LED, USB y audio.',
    instructions: [
      'Conecta los cables de encendido, reinicio y LED a la cabecera del panel frontal siguiendo el esquema del manual de la placa.',
      'Conecta el USB frontal y el audio a sus cabeceras.'
    ]
  });

  if (has('case') || has('fan')) add({
    id: 'fans', title: 'Conecta los ventiladores', focus: 'fans', basis: 'generico',
    summary: has('fan') ? name('fan') : 'Ventiladores del gabinete.',
    instructions: [
      'Comprueba con las flechas del marco que el aire entra por el frente y sale por detrás o por arriba.',
      'Conéctalos a las cabeceras SYS_FAN o al concentrador del gabinete, sin superar lo que admite cada cabecera.'
    ]
  });

  if (has('case')) add({
    id: 'cables', title: 'Organiza el cableado', focus: 'case', basis: 'generico',
    summary: 'Cables detrás de la bandeja y lejos de los ventiladores.',
    instructions: [
      'Pasa los cables por detrás de la bandeja y sujétalos con bridas.',
      'Deja libres las aspas de los ventiladores y el paso del aire.'
    ]
  });

  const profiles = String(P.ram?.facts?.values?.profiles || '');
  add({
    id: 'final', title: 'Verificación y primer encendido', focus: has('board') ? 'board' : null, basis: 'parcial',
    summary: 'Revisión, encendido y BIOS.',
    instructions: [
      'Revisa que todos los conectores estén firmes y que no queden tornillos sueltos dentro.',
      profile.gpu.present ? 'Conecta el monitor a la tarjeta gráfica, no a la placa.' : 'Conecta el monitor a la salida de vídeo de la placa: usarás los gráficos integrados del procesador.',
      'Conecta el cable de red, enciende el interruptor de la fuente y pulsa el botón de encendido.',
      'Si no hay imagen, apaga y revisa la memoria, los cables EPS y PCIe y el panel frontal. Si la placa tiene LED de diagnóstico, consulta su significado en el manual.',
      'Entra en la BIOS/UEFI y comprueba que reconoce el procesador, la memoria y el almacenamiento.',
      /EXPO|XMP/i.test(profiles) ? 'Si quieres la velocidad anunciada de la memoria, activa su perfil EXPO/XMP en la BIOS.' : ''
    ]
  });

  return steps;
}

// Escena 3D que corresponde al perfil: solo las piezas de la build.
// La placa y el gabinete, si faltan, se muestran como referencia marcada.
export function sceneSpec(profile) {
  const P = profile.parts;
  const parts = ['case', 'board'];
  const placeholders = [];
  if (!P.case) placeholders.push('case');
  if (!P.board) placeholders.push('board');
  if (P.power) parts.push('psu');
  if (P.case) parts.push('fans');
  if (P.cpu && P.board) parts.push('cpu');
  if (P.ram && P.board && !profile.ram.sodimm) parts.push('ram');
  if (profile.storage.kind === 'm2' && P.board) parts.push('m2');
  if (P.gpu && P.board) parts.push('gpu');
  if (P.cpu && ['air', 'aio', 'stock'].includes(profile.cooler.kind)) parts.push('cooler');
  const ds = profile.board.dimmSlots;
  return {
    boardForm: profile.board.sceneForm,
    dimmCount: ds === 2 ? 2 : 4,
    ramModules: Math.min(2, profile.ram.modules || 2),
    coolerKind: profile.cooler.kind,
    coolerHeight: profile.cooler.height,
    radiator: profile.cooler.radiator,
    gpuLength: profile.gpu.length,
    parts, placeholders,
    names: Object.fromEntries(Object.entries({ cpu: P.cpu, board: P.board, case: P.case, psu: P.power, gpu: P.gpu, m2: P.storage, cooler: P.cooler, ram: P.ram }).filter(([, p]) => p).map(([k, p]) => [k, p.name]))
  };
}
