// Asistencia contextual por paso (módulo PURO).
//
// Cinco categorías:
//   tip       → TIP: recomendaciones que facilitan el montaje
//   caution   → PRECAUCIÓN: acciones que pueden dañar componentes o a la persona
//   mistake   → ERROR COMÚN: equivocaciones frecuentes
//   fact      → DATO TÉCNICO: información del componente (con datos de la ficha si los hay)
//   practice  → BUENA PRÁCTICA: cómo hacerlo bien
//
// El contenido es genérico y prudente. Los datos concretos (socket, alturas,
// longitudes, vatios) salen del perfil de la build; si no hay dato, el consejo
// no se muestra en lugar de inventarlo.

export const TIP_TYPES = {
  caution: { label: 'Precaución', order: 0 },
  mistake: { label: 'Error común', order: 1 },
  tip: { label: 'Tip', order: 2 },
  practice: { label: 'Buena práctica', order: 3 },
  fact: { label: 'Dato técnico', order: 4 }
};

export function tipsForStep(step, profile) {
  const P = profile?.parts || {};
  const val = (cat, key) => (P[cat]?.facts?.verified ? P[cat].facts.values?.[key] : undefined);
  const socket = profile?.platform?.socket?.value;
  const ram = profile?.platform?.ramMemory?.value;
  const out = [];
  const add = (type, text) => { if (text) out.push({ type, text }); };
  const name = cat => P[cat]?.name || '';

  switch (step.id) {
    case 'prep':
      add('caution', 'Toca una parte metálica sin pintura antes de manipular cada componente, o usa una pulsera antiestática conectada a tierra.');
      add('practice', 'Trabaja sobre una mesa y no sobre alfombra: así se acumula menos electricidad estática.');
      add('tip', 'Abre las cajas de una en una y guarda los tornillos separados por tipo.');
      add('fact', 'Una descarga electrostática puede dañar un componente aunque no la notes.');
      break;
    case 'board-prep':
      add('tip', 'Apóyala sobre su caja de cartón: la bolsa antiestática protege la placa por dentro, no es una superficie de trabajo.');
      add('practice', 'Ten a mano el manual de la placa: indica el orden de las ranuras de memoria y M.2.');
      if (val('board', 'format')) add('fact', `${name('board')}: formato ${val('board', 'format')}${Number.isFinite(val('board', 'slots')) ? `, ${val('board', 'slots')} ranuras DIMM` : ''}${Number.isFinite(val('board', 'm2Slots')) ? ` y ${val('board', 'm2Slots')} M.2` : ''}, según su ficha.`);
      break;
    case 'cpu':
      if (profile?.platform?.lga === true) {
        add('caution', `En ${socket} los contactos del socket se doblan con muy poca fuerza: un contacto doblado puede inutilizar la placa.`);
        add('practice', 'Guarda la tapa protectora del socket: algunos fabricantes la piden para tramitar la garantía de la placa.');
      } else if (socket === 'AM4') add('caution', 'Los pines de un procesador AM4 se doblan con facilidad: no lo apoyes nunca boca abajo.');
      else add('caution', 'No toques los contactos ni los pines del procesador ni del socket.');
      add('mistake', 'Empujar el procesador: si no cae solo en el socket, la orientación es incorrecta.');
      add('tip', 'Localiza la marca triangular antes de sacar el procesador de su bandeja.');
      if (socket) add('fact', `${name('cpu') || 'Tu procesador'} usa el socket ${socket}${profile.platform.cpuMemory?.value ? ` y memoria ${profile.platform.cpuMemory.value}` : ''}.`);
      break;
    case 'ram':
      add('caution', 'No toques los contactos dorados de los módulos.');
      add('mistake', 'Dejar un extremo sin encajar: comprueba que los dos seguros queden cerrados.');
      if (profile?.ram?.modules === 2 && profile?.board?.dimmSlots === 4) add('tip', 'Con dos módulos, usa las ranuras que indica el manual (normalmente A2 y B2) para que trabajen en doble canal.');
      if (ram === 'DDR5') add('fact', 'Con DDR5, el primer arranque puede tardar más de lo habitual mientras la placa ajusta la memoria. No lo apagues por eso.');
      if (/EXPO|XMP/i.test(String(val('ram', 'profiles') || ''))) add('practice', 'Activa el perfil EXPO/XMP en la BIOS cuando hayas comprobado que el equipo arranca de forma estable.');
      break;
    case 'm2':
      add('mistake', 'Olvidar quitar la película protectora de la almohadilla térmica del disipador M.2.');
      add('tip', 'Insértalo inclinado y bájalo después: no lo fuerces en horizontal.');
      add('caution', 'El tornillo M.2 es muy pequeño: no aprietes en exceso y guárdalo para no perderlo.');
      if (Number(profile?.board?.m2Slots) > 1) add('practice', 'Si la placa tiene varias ranuras M.2, la más cercana al procesador suele conectarse directamente a él. Confírmalo en el manual.');
      if (profile?.storage?.interface === 'NVMe') add('fact', 'Es un SSD NVMe: usa la interfaz PCIe de la ranura M.2.');
      break;
    case 'cooler': {
      const kind = profile?.cooler?.kind;
      if (kind === 'aio') {
        add('practice', 'Evita que la bomba quede como el punto más alto del circuito: el aire acumulado puede causar ruido y reducir su rendimiento. Consulta el manual.');
        add('tip', 'Monta primero el radiador y después el bloque: así los tubos no tiran del procesador.');
        add('mistake', 'Conectar la bomba a una cabecera distinta de la que indica el manual.');
        if (profile.cooler.radiator) add('fact', `Radiador de ${profile.cooler.radiator} mm según la ficha de ${name('cooler')}.`);
      } else if (kind === 'stock') {
        add('tip', 'La pasta preaplicada es suficiente: no añadas más.');
        add('practice', 'Si alguna vez lo retiras, limpia la pasta vieja y aplica una nueva antes de volver a montarlo.');
      } else {
        add('mistake', 'Dejar la película protectora en la base del disipador.');
        add('tip', 'Una cantidad de pasta del tamaño de un guisante en el centro suele bastar: la presión del disipador la reparte.');
        add('practice', 'Comprueba que el disipador no tape la primera ranura de memoria ni choque con módulos altos.');
        const max = val('case', 'coolerMax');
        if (profile?.cooler?.height) add('fact', `Altura del disipador: ${profile.cooler.height} mm${Number.isFinite(max) ? `; tu gabinete admite ${max} mm` : ''}.`);
      }
      add('caution', 'Aprieta los tornillos de forma alterna y poco a poco para repartir la presión sobre el procesador.');
      break;
    }
    case 'case-prep':
      add('mistake', 'Dejar separadores donde la placa no tiene orificio: pueden causar un cortocircuito.');
      add('tip', 'Si el escudo de E/S no viene integrado en la placa, instálalo ahora: después ya no se puede.');
      add('practice', 'Planifica por dónde pasarán los cables antes de atornillar la placa.');
      if (val('case', 'format')) add('fact', `${name('case')} admite placas ${val('case', 'format')}, según su ficha.`);
      break;
    case 'psu':
      add('caution', 'Nunca abras la fuente: sus condensadores pueden conservar carga peligrosa aunque esté desenchufada.');
      add('mistake', 'Usar cables modulares de otra fuente: aunque encajen, su cableado puede ser distinto y dañar componentes.');
      add('tip', 'Deja el interruptor de la fuente apagado hasta terminar el montaje.');
      if (Number.isFinite(val('power', 'watts'))) add('fact', `${name('power')}: ${val('power', 'watts')} W${Number.isFinite(val('gpu', 'recommendedPsu')) ? `; tu gráfica recomienda ${val('gpu', 'recommendedPsu')} W` : ''}.`);
      break;
    case 'board-install':
      add('tip', 'Encaja primero los puertos traseros en el escudo de E/S y luego apoya la placa sobre los separadores.');
      add('caution', 'No arrastres la placa sobre los separadores: puedes rayar sus pistas traseras.');
      add('practice', 'Coloca todos los tornillos sin apretar en exceso.');
      break;
    case 'sata':
      add('tip', 'Algunas ranuras M.2 desactivan puertos SATA: el manual indica qué puerto usar.');
      add('practice', 'Pasa los cables SATA por detrás de la bandeja.');
      break;
    case 'gpu': {
      const power = String(profile?.gpu?.power || '');
      add('mistake', 'Conectar el monitor a la placa en lugar de a la tarjeta gráfica.');
      add('tip', 'Retira solo las tapas de ranura que vas a necesitar.');
      if (/16[- ]?pin|12V-2x6|12VHPWR/i.test(power)) add('caution', 'Inserta el conector de 16 pines hasta el fondo y no dobles el cable justo a la salida del conector.');
      else if (profile?.gpu?.needsPower) add('caution', 'Usa los cables y conectores que indican los fabricantes de la gráfica y de la fuente.');
      add('practice', 'Si la tarjeta es pesada, valora un soporte para que no se combe la ranura.');
      const max = val('case', 'gpuMax');
      if (profile?.gpu?.length) add('fact', `Longitud de la gráfica: ${profile.gpu.length} mm${Number.isFinite(max) ? `; tu gabinete admite ${max} mm` : ''}.`);
      break;
    }
    case 'power-cables':
      add('mistake', 'Olvidar el cable EPS del procesador: el equipo no arrancará.');
      add('caution', 'Los conectores EPS (procesador) y PCIe (gráfica) se parecen pero no son intercambiables: guíate por su etiqueta.');
      add('tip', 'Empuja cada conector hasta notar que el seguro encaja.');
      if (profile?.power?.modular === 'full') add('fact', 'Tu fuente es totalmente modular: cada cable se conecta también por el lado de la fuente.');
      break;
    case 'front-panel':
      add('tip', 'Los cables de encendido (PWR) y reinicio (RESET) no tienen polaridad; los de LED sí.');
      add('mistake', 'Conectar el USB o el audio frontal en la fila equivocada: sigue el esquema del manual.');
      add('practice', 'Usa una linterna: los rótulos de la cabecera son pequeños.');
      break;
    case 'fans':
      add('tip', 'Las flechas del marco indican el sentido del aire y el de giro.');
      add('fact', 'Una configuración habitual es entrada de aire por el frente y salida por detrás y arriba.');
      add('mistake', 'Conectar más ventiladores a una cabecera de los que admite.');
      break;
    case 'cables':
      add('practice', 'Pasa los cables por detrás de la bandeja: mejora el flujo de aire y el acceso.');
      add('mistake', 'Dejar cables que puedan tocar las aspas de los ventiladores.');
      break;
    case 'final':
      add('caution', 'Antes de encender, comprueba que no queden tornillos sueltos dentro del gabinete.');
      add('tip', 'Si no hay imagen, revisa primero la memoria y los cables de alimentación.');
      if (ram === 'DDR5') add('fact', 'El primer arranque con DDR5 puede tardar más de lo habitual: espera antes de reiniciar.');
      add('practice', 'Actualiza la BIOS solo si lo necesitas y siguiendo las instrucciones del fabricante.');
      break;
    default:
      break;
  }
  return out.sort((a, b) => TIP_TYPES[a.type].order - TIP_TYPES[b.type].order);
}
