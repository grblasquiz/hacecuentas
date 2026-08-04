import type { HubData } from './types';

export const hub: HubData = {
  slug: 'trabajo/indemnizacion-por-despido',
  title: 'Calculadora de indemnización por despido Argentina 2026',
  description:
    'Calculá tu indemnización por despido y liquidación final en Argentina. Antigüedad, preaviso, integración, aguinaldo y vacaciones, con ley vigente.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral',
  h1: 'Calculadora de indemnización por despido 2026',
  lede:
    'Partimos del caso más habitual: despido sin causa. Ya podés ver una estimación y ajustarla con tus datos. Si tu situación es distinta, la cambiás abajo.',
  stamps: ['Revisado 04-08-2026', 'Ley 27.802 aplicada', 'Fórmula explicada'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'sin-causa',
        label: 'Me despidieron sin causa',
        hint: 'El caso más común',
        answer: 'Si fue sin causa, corresponde indemnización completa.',
        yes: [
          'Indemnización por antigüedad (Art. 245): 1 sueldo por año trabajado',
          'Preaviso: 1 mes o 2 meses según antigüedad',
          'Integración del mes de despido',
          'SAC proporcional y vacaciones no gozadas',
        ],
        warn: ['Si estabas en período de prueba: desde marzo 2026 no cobrás antigüedad, preaviso ni integración'],
        plazo: 'el pago vence a los 4 días hábiles de la extinción del contrato.',
      },
      {
        id: 'fuerza-mayor',
        label: 'Por falta o disminución de trabajo',
        hint: 'Art. 247 LCT',
        answer: 'Por Art. 247 la antigüedad se paga a la mitad.',
        yes: [
          'La mitad de la indemnización por antigüedad del Art. 245',
          'Preaviso e integración completos: esos no se reducen',
          'SAC proporcional y vacaciones no gozadas',
        ],
        warn: [
          'La empresa tiene que probar la causa y respetar el orden de antigüedad. Si no lo hace, el despido pasa a ser sin causa y cobrás el 100%',
        ],
        plazo: 'si dudás de la causa invocada, intimá por telegrama antes de aceptar el pago.',
      },
      {
        id: 'embarazo',
        label: 'Estaba embarazada o me acababa de casar',
        hint: 'Estabilidad especial',
        answer: 'Con estabilidad especial se suman 13 sueldos a la indemnización.',
        yes: [
          'Todo lo del despido sin causa',
          'Más una indemnización agravada de 13 sueldos (Art. 178 y 182 LCT)',
        ],
        warn: [
          'La protección corre 7 meses y medio antes y después del parto, y exige haber notificado el embarazo de forma fehaciente',
        ],
        plazo: 'guardá la constancia de notificación del embarazo: sin eso la agravada se discute.',
      },
      {
        id: 'enfermedad',
        label: 'Estaba de licencia por enfermedad',
        hint: 'Art. 211 y 212 LCT',
        answer: 'Estar de licencia no anula la indemnización.',
        yes: [
          'Depende de si el despido cae en la licencia paga, en reserva de puesto o con incapacidad',
          'Con incapacidad absoluta: Art. 245 completo aunque no haya despido formal',
        ],
        warn: [
          'Durante la reserva de puesto (12 meses sin goce de sueldo) el despido sigue siendo indemnizable: no es renuncia automática',
        ],
        plazo: 'la reserva de puesto dura 12 meses después de agotada la licencia paga.',
      },
      {
        id: 'art-permanente',
        label: 'Tuve un accidente y me quedó una incapacidad',
        hint: 'ART · permanente',
        answer: 'La ART paga por la incapacidad; el despido se cobra aparte.',
        yes: [
          'Prestación dineraria de la ART según el porcentaje de la tabla de incapacidades',
          'Es independiente del despido: si además te echan, cobrás las dos',
        ],
        warn: ['La ART no cubre el despido. Si te echan después del alta, la indemnización laboral va aparte'],
        plazo: 'el porcentaje lo fija la Comisión Médica y podés impugnarlo.',
      },
      {
        id: 'art-temporaria',
        label: 'Estoy de licencia por un accidente laboral',
        hint: 'ART · ILT',
        answer: 'Durante la ILT cobrás el ingreso base, no el sueldo de bolsillo.',
        yes: [
          'Los primeros 10 días los paga el empleador; del día 11 en adelante la ART',
          'Se cobra sobre el ingreso base mensual, no sobre el sueldo de bolsillo',
        ],
        warn: ['La ILT tiene un tope de 12 meses. Después pasa a incapacidad permanente'],
        plazo: 'durante la ILT el empleador no puede despedirte sin que el despido quede agravado.',
      },
      {
        id: 'preaviso',
        label: 'Solo quiero saber cuánto es el preaviso',
        hint: 'Art. 231 y 232 LCT',
        answer: 'Sin preaviso corresponde la indemnización sustitutiva.',
        yes: [
          'Si no te preavisaron: indemnización sustitutiva equivalente al plazo omitido',
          'Más el SAC sobre ese preaviso',
        ],
        warn: ['Si te preavisaron por escrito y cumpliste el plazo trabajando, no hay indemnización sustitutiva'],
        plazo: 'No corresponde en período de prueba; luego es 1 mes hasta 5 años y 2 meses después.',
      },
      {
        id: 'accidente',
        label: 'Quiero estimar un resarcimiento civil',
        hint: 'Daño y perjuicio',
        answer: 'La vía civil va por fuera de la ART y necesita abogado.',
        yes: [
          'Estimación orientativa de un reclamo civil por daños',
          'Va por fuera de la ART y requiere abogado',
        ],
        warn: ['No reemplaza al cálculo de la ART: son vías distintas y optar por una puede cerrar la otra'],
        plazo: 'consultá antes de firmar cualquier acuerdo con la ART.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'sueldo', label: 'Mejor sueldo bruto del último año', prefix: '$', value: '1.500.000', thousands: true },
    {
      id: 'tope',
      label: 'Tope de convenio del Art. 245 (dejalo en 0 si no lo sabés)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Es 3 veces el promedio de remuneraciones de tu CCT. Si el tope recorta tu sueldo más del 33%, se aplica el piso del 67% del fallo Vizzoti.',
    },
    { id: 'anios', label: 'Años de antigüedad', type: 'number', min: 0, value: 7 },
    { id: 'meses', label: 'Meses sueltos además de los años', type: 'number', min: 0, max: 11, value: 5 },
    { id: 'dia', label: 'Día del mes del despido', type: 'number', min: 1, max: 31, value: 15 },
  ],
  fineprint: 'Es una orientación bruta. Un convenio, tope o situación particular puede cambiar el resultado.',

  chart: {
    type: 'donut',
    title: 'Composición del resultado',
    caption:
      'El concepto principal aparece destacado; los importes chicos quedan en segundo plano. Las barras comparan cada rubro con el más grande.',
  },
  breakdownTitle: 'Qué pesa en tu liquidación',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Qué rubros incluye la liquidación final por despido sin causa?',
      a: 'Antigüedad (Art. 245), preaviso o su indemnización sustitutiva, SAC sobre el preaviso, integración del mes de despido con su SAC, aguinaldo proporcional del semestre y vacaciones no gozadas con su SAC. Todo se paga en un mismo recibo dentro de los 4 días hábiles.',
    },
    {
      q: '¿Qué pasa si tengo 7 años y 5 meses de antigüedad?',
      a: 'Las fracciones mayores a 3 meses cuentan como un año entero. Con 7 años y 5 meses cobrás 8 sueldos de antigüedad, no 7.',
    },
    {
      q: '¿La indemnización paga Impuesto a las Ganancias?',
      a: 'La indemnización por antigüedad está exenta hasta el tope del Art. 245. Las vacaciones no gozadas y el SAC proporcional sí tributan como remuneración común.',
    },
    {
      q: '¿Cuánto es el tope de convenio de mi CCT?',
      a: 'El tope es 3 veces el promedio de las remuneraciones del convenio aplicable, con un piso del 67% del mejor sueldo — piso que la ley 27.802 codificó en 2026 recogiendo el fallo Vizzoti.',
    },
    {
      q: '¿Qué pasa si no me pagan lo que corresponde?',
      a: 'No firmes “en conformidad” sin revisar. Conservá telegramas y recibos y consultá rápido: el reclamo laboral prescribe, en general, a los 2 años. El telegrama laboral es gratuito.',
    },
    {
      q: '¿La antigüedad se cuenta desde el ingreso real o desde la registración?',
      a: 'Desde el ingreso real, aunque la registración sea posterior. La calculadora usa esa fecha para la antigüedad; las consecuencias de una registración deficiente requieren revisar el caso concreto.',
    },
    {
      q: '¿Cómo se calculan las vacaciones no gozadas?',
      a: 'Se toma el sueldo dividido 25 y se multiplica por los días de vacaciones proporcionales al tiempo trabajado en el año. A eso se le suma el SAC correspondiente.',
    },
    {
      q: '¿Me pueden despedir estando de licencia por enfermedad?',
      a: 'Pueden, pero sigue siendo un despido indemnizable. Si estás dentro de la licencia paga, además corresponde el pago de los salarios que faltaban hasta agotarla (Art. 213 LCT).',
    },
  ],

  sources: [
    {
      name: 'Ley 27.802 de Modernización Laboral (2026) — nueva redacción del Art. 245 LCT',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/339128/20260306',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '06-03-2026',
    },
    {
      name: 'Ley de Contrato de Trabajo 20.744, arts. 231, 232, 233 y 245',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 24.557 de Riesgos del Trabajo — tabla de incapacidades',
      url: 'https://www.argentina.gob.ar/srt',
      publisher: 'Superintendencia de Riesgos del Trabajo',
    },
  ],

  replaces: [
    '/calculadora-indemnizacion-despido',
    '/calculadora-indemnizacion-despido-fuerza-mayor-art-247-lct',
    '/calculadora-indemnizacion-despido-embarazo-estabilidad-13-salarios',
    '/calculadora-despido-enfermedad-inculpable-art-211-art-212-lct',
    '/calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente',
    '/calculadora-art-prestacion-dineraria-ilt-dias-pago-incapacidad-temporaria',
    '/calculadora-preaviso-indemnizacion-sustitutiva-lct',
    '/calculadora-resarcimiento-accidente',
  ],

  lastReviewed: '2026-08-04',
  audience: 'AR',
};

/** Factor sobre la antigüedad y sueldos agravados, por caso. */
export const CASE_MATH: Record<string, { factor: number; extra: number }> = {
  'sin-causa': { factor: 1, extra: 0 },
  'fuerza-mayor': { factor: 0.5, extra: 0 },
  embarazo: { factor: 1, extra: 13 },
  enfermedad: { factor: 1, extra: 0 },
  'art-permanente': { factor: 1, extra: 0 },
  'art-temporaria': { factor: 1, extra: 0 },
  preaviso: { factor: 0, extra: 0 },
  accidente: { factor: 1, extra: 0 },
};
