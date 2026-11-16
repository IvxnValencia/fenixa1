// Fichas informativas por tipo de componente (modo inspección).
//
// Contenido GENÉRICO y válido para cualquier modelo del tipo. Cuando un detalle
// depende del fabricante (orden de ranuras, soporte del disipador, cables), la
// ficha remite al manual en lugar de afirmar una posición concreta.
// En la Fase 4 este contenido se complementará con datos de la build real.
export const PART_INFO = {
  case: {
    role: 'Aloja y protege los componentes, guía el flujo de aire y ofrece los puntos de montaje de la placa, la fuente y las unidades.',
    install: ['Retira los paneles laterales y guarda los tornillos por separado.', 'Comprueba qué formatos de placa admite y dónde van los separadores.', 'Localiza el recorrido de cables por detrás de la bandeja antes de empezar.'],
    location: 'Es la base de todo el montaje: se prepara antes de instalar la placa y la fuente.',
    precautions: ['Trabaja con el gabinete desenchufado y sobre una superficie estable.', 'Los bordes de chapa pueden cortar: manipúlalo con cuidado.'],
    mistakes: ['Dejar separadores donde la placa no tiene orificio: pueden provocar un cortocircuito.', 'Olvidar instalar el escudo de E/S antes de la placa, si no viene integrado en ella.']
  },
  board: {
    role: 'Conecta todos los componentes entre sí: procesador, memoria, almacenamiento, tarjetas de expansión y alimentación.',
    install: ['Instala CPU, RAM y SSD M.2 sobre la caja de la placa, fuera del gabinete; suele ser más cómodo.', 'Alinea la placa con el escudo de E/S y los separadores.', 'Atornilla sin apretar en exceso, empezando por el centro.'],
    location: 'En la bandeja del gabinete, sobre los separadores, con los puertos traseros hacia el escudo de E/S.',
    precautions: ['Sujétala por los bordes y descárgate de electricidad estática antes de tocarla.', 'No la apoyes sobre la bolsa antiestática encendida ni sobre superficies metálicas.'],
    mistakes: ['Usar el formato equivocado para el gabinete.', 'Apretar demasiado los tornillos.', 'Olvidar conectar el EPS de 8 pines del procesador.']
  },
  cpu: {
    role: 'Ejecuta las instrucciones de los programas. Es el componente que más necesita una refrigeración adecuada.',
    install: ['Levanta la palanca de retención del socket.', 'Alinea la marca triangular del procesador con la del socket.', 'Colócalo en vertical, sin deslizarlo ni hacer fuerza, y cierra la palanca.'],
    location: 'En el socket de la placa base. Debe coincidir con el socket de la placa (por ejemplo AM5 con AM5).',
    precautions: ['No toques los contactos ni los pines.', 'Según la plataforma, los pines están en el socket (LGA, como AM5 o LGA1700) o en el procesador (PGA, como AM4): ambos se doblan con facilidad.', 'Consulta el manual sobre la tapa protectora del socket y consérvala.'],
    mistakes: ['Forzar el procesador o girarlo sobre el socket.', 'Ignorar la marca de orientación.', 'Instalar un procesador cuyo socket o BIOS no admite la placa.']
  },
  cooler: {
    role: 'Transfiere el calor del procesador al aire (torre) o a un radiador (refrigeración líquida).',
    install: ['Monta el soporte o backplate que corresponde a tu socket, según el manual del disipador.', 'Aplica pasta térmica si la base no la trae ya aplicada.', 'Aprieta los tornillos de forma gradual y en cruz, y conecta el ventilador a CPU_FAN.'],
    location: 'Sobre el procesador. Debe caber bajo la altura máxima del gabinete y no chocar con la RAM.',
    precautions: ['Comprueba en el manual que el soporte es compatible con tu socket.', 'No apliques pasta en exceso ni la extiendas sobre el socket.'],
    mistakes: ['Dejar la película protectora en la base.', 'Conectar el ventilador a una cabecera distinta de CPU_FAN.', 'Apretar un lado completo antes que el otro.']
  },
  ram: {
    role: 'Almacena temporalmente los datos que el procesador usa en ese momento. Más capacidad ayuda cuando te quedas sin memoria.',
    install: ['Abre los seguros de la ranura.', 'Alinea la muesca del módulo con el saliente de la ranura.', 'Presiona con ambos pulgares de forma uniforme hasta que los seguros cierren.'],
    location: 'En las ranuras DIMM. Con dos módulos, la mayoría de placas recomienda la segunda y la cuarta ranura (A2 y B2): confírmalo en el manual.',
    precautions: ['La muesca impide colocarla al revés: si no entra, no la fuerces.', 'Algunas placas tienen seguro en un solo extremo.'],
    mistakes: ['Usar ranuras contiguas cuando el manual recomienda otras.', 'Dejar el módulo sin insertar del todo: el equipo puede no arrancar.', 'Mezclar DDR4 y DDR5: no son intercambiables.']
  },
  storage: {
    role: 'Guarda el sistema operativo, los programas y tus archivos de forma permanente.',
    install: ['Retira el disipador M.2 de la placa si lo tiene, y la película de su almohadilla térmica.', 'Inserta el SSD inclinado, unos 20–30°, en el conector.', 'Bájalo y fíjalo con el tornillo o el seguro de la placa.'],
    location: 'En la ranura M.2 compatible. El manual indica qué ranura admite cada interfaz y si alguna comparte líneas con puertos SATA.',
    precautions: ['Un SSD M.2 SATA y uno NVMe tienen el mismo aspecto, pero no todas las ranuras admiten ambos.', 'No aprietes en exceso el tornillo: es muy pequeño.'],
    mistakes: ['Dejar la película de la almohadilla térmica.', 'Usar una ranura que desactiva puertos SATA ocupados.', 'Perder el tornillo M.2: guárdalo con el manual.']
  },
  gpu: {
    role: 'Genera la imagen. Una tarjeta dedicada es necesaria si el procesador no tiene gráficos integrados.',
    install: ['Retira las tapas de ranura que ocupará el soporte trasero.', 'Abre el seguro de la ranura PCIe x16 principal.', 'Inserta la tarjeta en vertical hasta que el seguro cierre, atornilla el soporte y conecta la alimentación PCIe que pida el modelo.'],
    location: 'Normalmente en la ranura PCIe x16 superior. El manual de la placa indica cuál tiene más líneas.',
    precautions: ['Comprueba que la longitud de la tarjeta cabe en el gabinete.', 'Sigue las indicaciones del fabricante de la tarjeta y de la fuente sobre cables y adaptadores.'],
    mistakes: ['Dejar el seguro de la ranura sin cerrar.', 'No conectar la alimentación PCIe.', 'Conectar el monitor a la placa base en lugar de a la tarjeta gráfica.']
  },
  power: {
    role: 'Convierte la corriente de la red en las tensiones que usan los componentes.',
    install: ['Colócala en su bahía con el ventilador hacia una entrada de aire; si toma aire por abajo, el gabinete necesita patas y filtro.', 'Fíjala con sus tornillos desde la parte trasera.', 'Si es modular, conecta solo los cables que vas a usar.'],
    location: 'En la bahía inferior o superior del gabinete, según el diseño.',
    precautions: ['Nunca abras la fuente: retiene carga peligrosa incluso desenchufada.', 'Trabaja con el interruptor apagado y el cable de red desconectado.', 'No mezcles cables modulares de otra fuente, aunque los conectores encajen.'],
    mistakes: ['Usar cables modulares de otra fuente.', 'Dejar el interruptor apagado en la primera prueba.', 'Elegir una potencia sin tener en cuenta la tarjeta gráfica.']
  },
  fan: {
    role: 'Mueven el aire a través del gabinete para retirar el calor de los componentes.',
    install: ['Mira las flechas del marco: una indica el sentido del aire y otra el de giro.', 'Fíjalos con sus tornillos o soportes.', 'Conéctalos a las cabeceras SYS_FAN o a un concentrador compatible.'],
    location: 'Habitualmente: entrada de aire al frente y salida en la parte trasera o superior.',
    precautions: ['Mantén los cables lejos de las aspas.'],
    mistakes: ['Montar todos los ventiladores como extracción o todos como entrada sin un motivo.', 'Conectar más ventiladores a una cabecera de los que admite.']
  }
};
