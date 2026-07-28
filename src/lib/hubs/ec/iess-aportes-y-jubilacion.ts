import type { HubData } from '../types';
import { ECUADOR_2026, IESS_MORA_EC_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "IESS: cuánto aporto, cuándo me jubilo y cuánto voy a cobrar".
 *
 * Constantes: src/lib/data/ecuador-2026.ts (SBU, aportes, IESS_MORA_EC_2026).
 * Cálculo espejado de aporte-voluntario-iess-ecuador.ts,
 * sueldo-iess-empleada-domestica-ecuador.ts, mora-patronal-iess-ecuador.ts,
 * jubilacion-iess-ecuador.ts, jubilacion-patronal-ecuador.ts y
 * pension-montepio-viudez-iess-ecuador.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const SBU = ECUADOR_2026.sbu;
export const IESS_PERSONAL = ECUADOR_2026.iessPersonal;
export const IESS_PATRONAL = ECUADOR_2026.iessPatronal;
export const FONDOS_RESERVA = ECUADOR_2026.fondosReserva;
/** Afiliado voluntario: asume el 17,60% completo sobre la materia gravada, con base mínima de 1 SBU. */
export const TASA_VOLUNTARIO = 0.176;
/** Mora patronal: tasa anual de referencia del BCE + recargo IESS; la actualiza cada mes. */
export const MORA_TASA_ANUAL = IESS_MORA_EC_2026.tasaAnualReferencia;
export const MORA_DIA_PAGO = IESS_MORA_EC_2026.diaPago;
/** Jubilación patronal (art. 216): 5% de la remuneración anual promedio por año de servicio. */
export const JUBILACION_PATRONAL_TASA = 0.05;
export const JUBILACION_PATRONAL_ANIOS = 25;
/** Montepío: viudez 60% de la pensión del causante, orfandad 20% por hijo, tope 100% del grupo. */
export const MONTEPIO_VIUDEZ = 0.6;
export const MONTEPIO_ORFANDAD = 0.2;

/**
 * Coeficientes referenciales de la pensión de vejez sobre el promedio de los 5 mejores años,
 * según años imponibles. Espejo exacto de src/lib/formulas/jubilacion-iess-ecuador.ts.
 */
export const COEFICIENTES_VEJEZ = [
  { desdeAnios: 0, coef: 0 },
  { desdeAnios: 10, coef: 0.435 },
  { desdeAnios: 15, coef: 0.5 },
  { desdeAnios: 20, coef: 0.6 },
  { desdeAnios: 25, coef: 0.7 },
  { desdeAnios: 30, coef: 0.8 },
  { desdeAnios: 35, coef: 0.9 },
  { desdeAnios: 40, coef: 1.0 },
];

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/trabajo/iess-aportes-y-jubilacion',
  title: 'IESS en Ecuador: cuánto aportas, cuándo te jubilas y cuánto vas a cobrar',
  description:
    'Aportes al IESS en relación de dependencia, como afiliado voluntario y en el trabajo del hogar, más la estimación de la pensión de vejez, la jubilación patronal del art. 216 y el montepío de viudez y orfandad.',
  silo: 'Trabajo',
  siloHref: '/ec/trabajo',
  locale: 'ec',

  eyebrow: 'Ecuador · seguridad social · IESS',
  h1: 'IESS: cuánto aportas, cuándo te jubilas y cuánto vas a cobrar.',
  lede:
    'El aporte al IESS cambia según cómo estés afiliado: en relación de dependencia se reparte entre vos y la empresa, como voluntario lo pagas entero, y en el trabajo del hogar hay reglas propias. Del otro lado de esa cuenta está lo que vas a cobrar: la pensión de vejez, la jubilación patronal que paga la empresa a los 25 años, y el montepío que queda para la familia.',
  stamps: [
    'Aportes 9,45% personal + 11,15% patronal',
    `Voluntario 17,60% · base mínima 1 SBU (${usd(SBU)})`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Tu aporte o tu pensión',

  cases: {
    title: '¿De qué lado del IESS estás mirando?',
    intro:
      'Las tres primeras ramas calculan lo que aportas; las tres últimas, lo que vas a cobrar. Las estimaciones de pensión son orientativas: el cálculo oficial lo hace el IESS con tu historia laboral real.',
    items: [
      {
        id: 'dependencia',
        label: 'Trabajo en relación de dependencia',
        hint: '9,45% vos · 11,15% la empresa',
        answer:
          'En relación de dependencia aportas el 9,45% de la materia gravada y el empleador el 11,15%: el IESS recibe el 20,60% de tu remuneración cada mes.',
        yes: [
          'Aporte personal del 9,45%, que se descuenta de tu rol',
          'Aporte patronal del 11,15%, que paga la empresa además del sueldo',
          'Base de cálculo: la materia gravada, o sea sueldo, horas extra y comisiones, sin los décimos',
          'El aporte cubre salud, pensiones, riesgos del trabajo y cesantía',
        ],
        warn: [
          DISCLAIMER_FIN,
          `La planilla se paga hasta el día ${MORA_DIA_PAGO} del mes siguiente: desde el 16 el empleador entra en mora patronal y el IESS le cobra interés`,
          'La afiliación es obligatoria desde el primer día de trabajo: no depende del período de prueba ni de la duración del contrato',
        ],
        plazo: `la planilla vence el día ${MORA_DIA_PAGO} del mes siguiente al período trabajado.`,
      },
      {
        id: 'voluntario',
        label: 'Soy afiliado voluntario',
        hint: '17,60% sobre lo que declares',
        answer: `El afiliado voluntario aporta el 17,60% del ingreso que declara, con una base mínima de un SBU (${usd(SBU)}).`,
        yes: [
          'Tasa única del 17,60%: no hay empleador que ponga la parte patronal',
          `Base mínima de un SBU: si declaras menos, igual aportas sobre ${usd(SBU)}`,
          'Da cobertura de salud, pensiones y riesgos, igual que la afiliación en dependencia',
          'Sirve para independientes, profesionales y para quien quiere seguir sumando aportaciones sin relación laboral',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El ingreso declarado define tanto lo que aportas hoy como el promedio con el que se va a calcular tu pensión mañana: declarar el mínimo abarata la cuota y abarata la jubilación',
          'La afiliación voluntaria no genera fondos de reserva ni cesantía en las mismas condiciones que la relación de dependencia',
        ],
        plazo: 'la planilla del afiliado voluntario se genera y se paga mes a mes en el portal del IESS.',
      },
      {
        id: 'domestica',
        label: 'Empleo a una persona en el hogar',
        hint: 'Mínimo 1 SBU · afiliación desde el día 1',
        answer:
          'El trabajo del hogar se afilia obligatoriamente desde el primer día, con remuneración mínima de un SBU y los mismos aportes del régimen general.',
        yes: [
          `Remuneración mínima: un SBU (${usd(SBU)}) a jornada completa`,
          'Aporte personal del 9,45% que se descuenta y patronal del 11,15% que asume el empleador',
          'Décimo tercero, décimo cuarto y vacaciones: los mismos derechos que cualquier trabajador',
          'Fondos de reserva del 8,33% a partir del mes 13 con el mismo empleador',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La afiliación es obligatoria desde el primer día, aunque el trabajo sea por horas o por pocos días a la semana: no existe el mínimo de meses para afiliar',
          'Si no afilias, además del interés de mora corre la responsabilidad patronal ante cualquier contingencia de salud o accidente',
        ],
        plazo: `el aviso de entrada se registra al inicio de la relación y la planilla se paga hasta el día ${MORA_DIA_PAGO} de cada mes.`,
      },
      {
        id: 'jubilacion',
        label: 'Quiero saber mi pensión del IESS',
        hint: 'Vejez · promedio de los 5 mejores años',
        answer:
          'La pensión de vejez se estima aplicando un coeficiente por años de aportación sobre el promedio de tus cinco mejores años.',
        yes: [
          'Mínimo de 10 años (120 aportaciones) para tener derecho a pensión de vejez',
          'Coeficiente creciente según los años imponibles, desde el 43,5% hasta el 100% del promedio',
          'Requisitos de edad referenciales: 60 años con 30 de aporte, 65 con 15, 70 con 10',
          'La pensión tiene pisos mínimos ligados al SBU según los años aportados',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los coeficientes y los pisos de esta estimación son referenciales: el cálculo vinculante lo hace el IESS con tu historia laboral y la normativa vigente al momento de la solicitud',
          'Con menos de 10 años de aportación no hay pensión de vejez: lo que corresponde es la devolución de aportes',
        ],
        plazo:
          'la solicitud de jubilación se hace en línea en el portal del IESS y la pensión corre desde el mes siguiente a la cesantía.',
      },
      {
        id: 'patronal',
        label: 'Llevo 25 años en la misma empresa',
        hint: 'Jubilación patronal · art. 216',
        answer:
          'Con 25 años o más en la misma empresa te corresponde una jubilación a cargo del empleador, independiente de la del IESS.',
        yes: [
          'Fondo global: el 5% de la remuneración anual promedio por cada año de servicio',
          'La pensión mensual sale de dividir el fondo global entre el coeficiente de edad de la tabla del Ministerio del Trabajo',
          'Se descuenta lo que el empleador ya haya depositado en un fondo de jubilación',
          'Es adicional a la pensión del IESS: no se excluyen entre sí',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Entre los 20 y los 25 años de servicio no hay jubilación patronal plena, pero sí una parte proporcional si es el empleador quien termina la relación',
          'El coeficiente de edad sale de la tabla oficial del Ministerio del Trabajo y la pensión mínima la fija la norma vigente: cárgalos con el valor que te corresponda, esta cuenta no los inventa',
        ],
        plazo:
          'el derecho se consolida al cumplir los 25 años de servicio con el mismo empleador y se reclama al momento del retiro.',
      },
      {
        id: 'montepio',
        label: 'Falleció el afiliado o el pensionista',
        hint: 'Montepío · viudez y orfandad',
        answer:
          'El montepío reparte la pensión del causante: 60% para el cónyuge y 20% por cada hijo con derecho, con tope del 100%.',
        yes: [
          'Viudez: el 60% de la pensión que recibía o le habría correspondido al causante',
          'Orfandad: el 20% de esa pensión por cada hijo con derecho',
          'Si la suma supera el 100% de la pensión del causante, cada cuota se reduce proporcionalmente',
          'La pensión del grupo familiar no puede quedar por debajo de la pensión mínima que fija el IESS',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El derecho a la pensión de viudez exige requisitos de convivencia o matrimonio y, según el caso, un mínimo de aportaciones del causante: verifícalo con el IESS',
          'La orfandad se extingue al cumplir la edad límite, salvo en casos de discapacidad o estudios acreditados',
        ],
        plazo:
          'el montepío se solicita en el IESS presentando el acta de defunción y la documentación de parentesco; se paga desde el mes siguiente al fallecimiento.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en dólares. Ecuador está dolarizado: los aportes y las pensiones se calculan y se pagan en dólares, sin indexación por inflación.',
  fields: [
    {
      id: 'ingreso',
      label: 'Remuneración o ingreso declarado mensual (USD)',
      prefix: '$',
      value: '800',
      thousands: true,
      help: `La materia gravada de cada mes. Como afiliado voluntario, el ingreso que declaras; la base mínima siempre es 1 SBU (${usd(SBU)}).`,
    },
    {
      id: 'anios',
      label: 'Años de aportación (o de servicio en la empresa)',
      type: 'number',
      value: 25,
      min: 0,
      max: 50,
      step: 1,
      help: 'Para la pensión de vejez son los años imponibles; para la jubilación patronal, los años con el mismo empleador.',
    },
    {
      id: 'edad',
      label: 'Tu edad',
      type: 'number',
      value: 60,
      min: 16,
      max: 100,
      step: 1,
      help: 'Define el requisito de edad de la pensión de vejez: 60 años con 30 de aporte, 65 con 15, 70 con 10.',
    },
    {
      id: 'promedio',
      label: 'Promedio de tus 5 mejores años (USD/mes)',
      prefix: '$',
      value: '900',
      thousands: true,
      help: 'La base de la pensión de vejez y de la jubilación patronal. Si no lo sabes, usa tu remuneración actual como aproximación.',
    },
    {
      id: 'coefEdad',
      label: 'Coeficiente de edad del Ministerio del Trabajo',
      type: 'number',
      value: 100,
      min: 1,
      max: 200,
      step: 1,
      help: 'Solo para la jubilación patronal. Sale de la tabla oficial del Ministerio del Trabajo según la edad del jubilado: cárgalo con el que te corresponde.',
    },
    {
      id: 'hijos',
      label: 'Hijos con derecho a orfandad',
      type: 'number',
      value: 2,
      min: 0,
      max: 10,
      step: 1,
      help: 'Solo para el montepío. Cada hijo con derecho recibe el 20% de la pensión del causante.',
    },
    {
      id: 'mesesMora',
      label: 'Meses de atraso de la planilla',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: `Si el empleador pagó tarde, el IESS cobra interés de mora sobre los aportes. Tasa de referencia: ${String(MORA_TASA_ANUAL).replace('.', ',')}% anual.`,
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte',
    caption:
      'En las ramas de aportes, quién pone cada parte del 20,60% que recibe el IESS. En las de pensión, cómo se reparte lo que se cobra entre el titular y su familia.',
  },
  breakdownTitle: 'Aportes y pensiones, línea por línea',
  breakdownIntro:
    'Lo que se aporta cada mes, lo que cuesta pagar tarde y lo que se cobra al final. Las pensiones son estimaciones: el número oficial sale de tu historia laboral en el IESS.',

  faq: [
    {
      q: '¿Cuánto se aporta al IESS en Ecuador?',
      a: 'En relación de dependencia el aporte total es del 20,60% de la materia gravada: 9,45% que se descuenta al trabajador y 11,15% que paga el empleador. Los décimos no aportan. El afiliado voluntario paga el 17,60% completo sobre el ingreso que declara, con base mínima de un SBU, porque no tiene empleador que ponga la parte patronal.',
    },
    {
      q: '¿Qué pasa si el empleador paga la planilla tarde?',
      a: `La planilla vence el día ${MORA_DIA_PAGO} del mes siguiente al período trabajado; desde el 16 corre la mora patronal. El IESS cobra un interés sobre el capital adeudado a una tasa que publica el Banco Central cada mes más el recargo del instituto —en torno al ${String(MORA_TASA_ANUAL).replace('.', ',')}% anual—, acumulado día a día. Aparte del interés existe la responsabilidad patronal: si ocurre una contingencia mientras hay mora, el empleador responde por la prestación.`,
    },
    {
      q: '¿Cuántos años hay que aportar para jubilarse por el IESS?',
      a: 'El mínimo para la pensión de vejez son 10 años, es decir 120 aportaciones, y con ese mínimo la edad exigida es de 70 años. Con 15 años de aporte la edad baja a 65, y con 30 años o más se puede acceder a los 60. Por debajo de 10 años no hay pensión: lo que corresponde es la devolución de los aportes.',
    },
    {
      q: '¿Cómo se calcula la pensión de vejez?',
      a: 'Se toma el promedio de los cinco mejores años de aportación y se le aplica un coeficiente que crece con los años imponibles: alrededor del 43,5% con 10 a 14 años, el 60% con 20 a 24, el 80% con 30 a 34, y el 100% con 40 años o más. Además hay pisos mínimos ligados al SBU. Es una estimación: el cálculo definitivo lo hace el IESS con tu historia laboral.',
    },
    {
      q: '¿La jubilación patronal reemplaza a la del IESS?',
      a: 'No, son independientes y se cobran las dos. La jubilación patronal del art. 216 la paga el empleador a quien cumplió 25 años o más en la misma empresa, con un fondo global equivalente al 5% de la remuneración anual promedio por cada año de servicio. La pensión del IESS la paga el instituto con los aportes de toda tu vida laboral, en cualquier empresa.',
    },
    {
      q: '¿Qué pasa si tengo 20 años en la empresa y me despiden?',
      a: 'Entre los 20 y los 25 años de servicio con el mismo empleador no hay jubilación patronal plena, pero si es el empleador quien termina la relación corresponde una parte proporcional de ese beneficio, además de la indemnización por despido. A partir de los 25 años el derecho a la jubilación patronal ya está consolidado.',
    },
    {
      q: '¿Cuánto cobra la viuda o el viudo de un afiliado?',
      a: 'El 60% de la pensión que recibía el causante o de la que le habría correspondido. Cada hijo con derecho a orfandad suma un 20% de esa misma pensión. Si entre todos superan el 100% de la pensión del causante, cada cuota se reduce proporcionalmente para no pasar ese techo, y el conjunto nunca puede quedar por debajo de la pensión mínima que fija el IESS.',
    },
    {
      q: '¿Conviene afiliarse voluntariamente al IESS?',
      a: 'Depende de qué busques. La afiliación voluntaria cuesta el 17,60% del ingreso declarado, con base mínima de un SBU, y da cobertura de salud, pensiones y riesgos sin relación laboral. Para quien trabaja por su cuenta suele ser la única forma de seguir sumando aportaciones hacia la jubilación. Lo que conviene mirar es sobre qué ingreso declaras: la base baja abarata la cuota hoy y achica la pensión mañana.',
    },
    {
      q: '¿Hay que afiliar a la empleada doméstica desde el primer día?',
      a: `Sí, sin excepciones y aunque el trabajo sea por horas o por pocos días a la semana. La remuneración mínima del trabajo del hogar a jornada completa es de un SBU (${usd(SBU)}), con aporte personal del 9,45% y patronal del 11,15%, más décimos, vacaciones y fondos de reserva desde el mes 13. No afiliar expone al empleador al interés de mora y a la responsabilidad patronal por cualquier contingencia.`,
    },
    {
      q: '¿Los décimos y los fondos de reserva aportan al IESS?',
      a: 'Los décimos tercero y cuarto no: están fuera de la materia gravada y por eso no se les descuenta el 9,45% ni generan aporte patronal. Los fondos de reserva tampoco son materia gravada: son un beneficio del 8,33% que se paga mensualizado o se acumula en tu cuenta individual del IESS.',
    },
    {
      q: '¿Puedo seguir aportando después de jubilarme?',
      a: 'Sí. Un pensionista que vuelve a trabajar en relación de dependencia sigue aportando, y esos aportes pueden dar lugar a una mejora de la pensión según la normativa vigente. Consulta el caso concreto en el IESS antes de tomar la decisión, porque las condiciones cambian según el tipo de pensión que ya recibes.',
    },
    {
      q: '¿Dónde veo mis aportaciones reales?',
      a: 'En la Historia Laboral del portal del IESS, con tu número de cédula y clave. Ahí figuran las aportaciones mes a mes, los períodos de mora patronal, tu fondo de reserva y tu fondo de cesantía. Es el dato que manda: cualquier estimación, esta incluida, se compara contra esa historia.',
    },
  ],

  sources: [
    { name: 'IESS — Aportes, historia laboral y prestaciones', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'IESS — Mora patronal', url: 'https://www.iess.gob.ec/en/web/empleador/mora-patronal', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'Ministerio del Trabajo — Código del Trabajo (art. 216, jubilación patronal)', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'Banco Central del Ecuador — Tasas de interés referenciales', url: 'https://contenido.bce.fin.ec/documentos/informacioneconomica/indicadores/monetario/indTasaPasiva.html', publisher: 'Banco Central del Ecuador' },
    { name: 'Ministerio del Trabajo — Salario Básico Unificado vigente', url: 'https://www.trabajo.gob.ec/salario-basico-unificado/', publisher: 'Ministerio del Trabajo del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-aporte-voluntario-iess-ecuador',
    '/ec/calculadora-sueldo-iess-empleada-domestica-ecuador',
    '/ec/calculadora-mora-patronal-iess-ecuador',
    '/ec/calculadora-jubilacion-iess-ecuador',
    '/ec/calculadora-jubilacion-patronal-ecuador',
    '/ec/calculadora-pension-montepio-viudez-iess-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
