import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto me tienen que pagar por esa hora?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts.
 *
 * El año 2026 tiene DOS transiciones que cambian el número y que casi ninguna
 * calculadora del mercado maneja bien:
 *  - 15-jul-2026: la jornada baja de 44 a 42 h/semana (Ley 2101/2021) y el
 *    divisor del valor hora pasa de 220 a 210, así que la hora ordinaria sube
 *    ~4,76% sin que suba el salario.
 *  - 01-jul-2026: el recargo dominical y festivo pasa de 80% a 90%
 *    (Ley 2466/2025), camino al 100% del 01-jul-2027.
 * Las dos fechas son distintas: entre el 1 y el 14 de julio de 2026 conviven el
 * recargo nuevo del 90% y el divisor viejo de 220.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;

/** Jornada (Ley 2101/2021): 44 h y divisor 220 hasta el 14-jul-2026; 42 h y 210 desde el 15. */
export const JORNADA = COLOMBIA_2026.jornada;

/** Recargos del CST y de la Ley 2466/2025. */
export const RECARGOS = COLOMBIA_2026.recargos;

/** Fechas de corte de las dos transiciones de 2026. */
export const CORTES = {
  jornada42: '2026-07-15',
  dominical90: '2026-07-01',
  dominical100: '2027-07-01',
};

/** Topes del art. 22 de la Ley 50/1990: 2 horas extras por día y 12 por semana. */
export const TOPE_EXTRAS = { porDia: 2, porSemana: 12, porMesAprox: 52 };

/** Festivos nacionales de 2026 ya con el traslado de la Ley Emiliani aplicado. */
export const FESTIVOS_2026 = { total: 19, lunes: 12 };

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
const pct = (n: number) => Math.round(n * 100) + '%';

export const hub: HubData = {
  slug: 'co/trabajo/horas-extras-y-recargos',
  title: 'Horas extras y recargo dominical y festivo Colombia 2026',
  description:
    'Calculadora de horas extras Colombia 2026: hora extra diurna, nocturna, recargo nocturno desde las 19:00 y recargo dominical y festivo, con las dos transiciones de 2026: jornada de 42 horas desde el 15 de julio y recargo dominical del 90% desde el 1 de julio.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · CST y Ley 2466 de 2025',
  h1: 'Horas extras y recargo dominical y festivo en Colombia 2026: ¿cuánto te tienen que pagar por esa hora?',
  lede:
    'Todo arranca en el valor de tu hora ordinaria, y ese valor cambió el 15 de julio de 2026: el divisor pasó de 220 a 210 horas, así que la misma hora vale casi 5% más sin que te hayan subido el sueldo. Encima va el recargo que corresponda. Poné tu salario, la fecha y las horas, y mirá qué te deben.',
  stamps: [
    `Jornada: ${JORNADA.horasSemanaDesde15Jul2026} h/semana desde el 15-jul-2026`,
    `Noche laboral desde las ${RECARGOS.horaInicioNocturna}:00`,
    `Dominical: ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)} desde el 01-jul-2026`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que te deben por esas horas',

  cases: {
    title: '¿Qué tipo de hora trabajaste?',
    intro:
      'El Código Sustantivo del Trabajo distingue cuatro situaciones y cada una tiene su porcentaje. Ojo con la diferencia más confundida de todas: trabajar de noche dentro de tu jornada normal no es lo mismo que hacer una hora extra de noche.',
    items: [
      {
        id: 'extra-diurna',
        label: 'Hora extra diurna',
        hint: `Después de tu jornada, entre las 06:00 y las ${RECARGOS.horaInicioNocturna}:00`,
        answer: `La hora extra diurna se paga con un recargo del ${pct(RECARGOS.extraDiurna)} sobre tu hora ordinaria.`,
        yes: [
          `Recargo del ${pct(RECARGOS.extraDiurna)} sobre el valor de la hora ordinaria (art. 168 CST)`,
          'Aplica a las horas que trabajás por encima de tu jornada pactada, en horario diurno',
          `Desde el 15 de julio de 2026 la hora base sube porque el divisor pasó de ${JORNADA.divisorMensualHasta14Jul2026} a ${JORNADA.divisorMensualDesde15Jul2026}`,
          'Se liquida y se paga con el salario del período en que se causó, no "cuando se pueda"',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La ley pone un tope: ${TOPE_EXTRAS.porDia} horas extras por día y ${TOPE_EXTRAS.porSemana} por semana (art. 22 de la Ley 50/1990). Trabajar más de eso no es legal, aunque igual haya que pagarlo`,
          'Las horas extras necesitan autorización previa del empleador para reconocerse: guardá los registros de entrada y salida',
          'Quien tiene salario integral no cobra horas extras aparte: ya están dentro del factor prestacional del 30%',
        ],
        plazo: 'las horas extras prescriben a los 3 años de causadas (art. 488 CST): no dejes pasar el reclamo.',
      },
      {
        id: 'extra-nocturna',
        label: 'Hora extra nocturna',
        hint: `Después de tu jornada, entre las ${RECARGOS.horaInicioNocturna}:00 y las 06:00`,
        answer: `La hora extra nocturna lleva un recargo del ${pct(RECARGOS.extraNocturna)}: es el más alto de las horas extras.`,
        yes: [
          `Recargo del ${pct(RECARGOS.extraNocturna)} sobre la hora ordinaria (art. 168 CST)`,
          `Ese ${pct(RECARGOS.extraNocturna)} ya comprende la nocturnidad: no se le suma además el ${pct(RECARGOS.nocturno)} del recargo nocturno`,
          `La franja nocturna arranca a las ${RECARGOS.horaInicioNocturna}:00 desde la Ley 2466 de 2025, antes empezaba a las 21:00`,
          'Vale para las horas por encima de tu jornada que caigan en esa franja',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Error clásico de nómina: sumar ${pct(RECARGOS.extraNocturna)} y ${pct(RECARGOS.nocturno)} y pagar 110%. El ${pct(RECARGOS.extraNocturna)} es el factor completo de la hora extra nocturna`,
          'Si esa hora extra nocturna además cae en domingo o festivo, ahí sí se acumulan los dos recargos',
          `El tope de ${TOPE_EXTRAS.porDia} horas extras diarias también corre acá`,
        ],
        plazo: 'el pago va en la nómina del período en que trabajaste esas horas.',
      },
      {
        id: 'recargo-nocturno',
        label: 'Recargo nocturno (jornada normal de noche)',
        hint: `Tu turno habitual, pero entre las ${RECARGOS.horaInicioNocturna}:00 y las 06:00`,
        answer: `Trabajar tu jornada normal de noche suma un ${pct(RECARGOS.nocturno)} sobre cada hora, aunque no sea hora extra.`,
        yes: [
          `Recargo del ${pct(RECARGOS.nocturno)} sobre la hora ordinaria por trabajo nocturno (art. 168 CST)`,
          `Corre desde las ${RECARGOS.horaInicioNocturna}:00 y hasta las 06:00 desde la Ley 2466 de 2025`,
          'No hace falta que sea hora extra: basta con que tu turno ordinario caiga en esa franja',
          `Las horas entre las ${RECARGOS.horaInicioNocturna}:00 y las 21:00 son plata nueva: antes de la reforma no tenían recargo`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si tu empresa todavía te liquida la noche desde las 21:00, te está pagando de menos dos horas por turno',
          'El recargo nocturno sí es factor salarial: entra en la base de prima, cesantías y aportes',
          'Si además superás la jornada, esas horas dejan de ser recargo nocturno y pasan a ser hora extra nocturna, con el 75%',
        ],
        plazo: `la Ley 2466 de 2025 movió el inicio de la noche laboral a las ${RECARGOS.horaInicioNocturna}:00 desde el 25 de diciembre de 2025.`,
      },
      {
        id: 'dominical',
        label: 'Domingo o festivo',
        hint: `${pct(RECARGOS.dominicalFestivoDesde01Jul2026)} desde el 01-jul-2026, camino al ${pct(RECARGOS.dominicalFestivoDesde01Jul2027)}`,
        answer: `El domingo y el festivo llevan ahora un recargo del ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)}, y desde julio de 2027 será del ${pct(RECARGOS.dominicalFestivoDesde01Jul2027)}.`,
        yes: [
          `Recargo del ${pct(RECARGOS.dominicalFestivoHasta30Jun2026)} hasta el 30 de junio de 2026, ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)} desde el 1 de julio de 2026 y ${pct(RECARGOS.dominicalFestivoDesde01Jul2027)} desde el 1 de julio de 2027 (Ley 2466/2025)`,
          `Se acumula con el recargo nocturno del ${pct(RECARGOS.nocturno)} si trabajaste de noche ese domingo`,
          `Colombia tiene ${FESTIVOS_2026.total} festivos nacionales en 2026, de los cuales ${FESTIVOS_2026.lunes} caen en lunes y arman puente`,
          'Si el trabajo dominical es ocasional podés elegir entre el recargo o un día compensatorio de descanso',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si trabajás domingo de forma habitual (3 o más al mes) te corresponden el recargo y el día compensatorio, no uno u otro',
          'El recargo dominical se calcula sobre la hora ordinaria, no sobre la hora ya recargada por otro concepto',
          `Cuidado con las dos fechas de 2026: el recargo cambió el 1 de julio y el divisor de la hora el 15. Entre esos dos días convive el recargo nuevo con la hora vieja`,
        ],
        plazo:
          'el traslado de festivos al lunes lo fija la Ley Emiliana (Ley 51/1983): la fecha que se paga es la observada, no la conmemorada.',
      },
    ],
  },

  inputsTitle: 'Tu salario y esas horas',
  inputsIntro:
    'La fecha importa de verdad: define el divisor de tu hora ordinaria y el porcentaje del recargo dominical que estaba vigente ese día.',
  fields: [
    {
      id: 'salario',
      label: 'Salario mensual (COP)',
      prefix: '$',
      value: '1.750.905',
      thousands: true,
      help: 'El salario ordinario pactado. Es la base de la que sale el valor de tu hora.',
    },
    {
      id: 'horas',
      label: 'Horas trabajadas en esa modalidad',
      type: 'number',
      value: 8,
      min: 0,
      max: 300,
      step: 1,
      help: 'Cuántas horas de ese tipo hiciste en el período que estás liquidando.',
    },
    {
      id: 'fecha',
      label: 'Fecha en que las trabajaste',
      type: 'date',
      value: '2026-07-28',
      help: 'Define el divisor de la hora (220 o 210) y el recargo dominical vigente (80%, 90% o 100%).',
    },
    {
      id: 'nocturno',
      label: '¿Ese domingo o festivo fue de noche?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, de día' },
        { value: 'si', label: `Sí, entre las ${RECARGOS.horaInicioNocturna}:00 y las 06:00` },
      ],
      help: 'Sólo se usa en la rama de domingo o festivo: ahí los dos recargos se acumulan.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'steps',
    title: 'La escalera de recargos del CST',
    caption:
      'Cada escalón es un porcentaje distinto sobre la misma hora ordinaria. El marcador muestra en qué escalón cae la hora que estás liquidando, desde la hora sin recargo hasta el domingo trabajado de noche.',
  },
  breakdownTitle: 'De tu salario mensual a esa hora',
  breakdownIntro:
    'Primero el valor de la hora ordinaria con el divisor que corresponde a la fecha, después el factor del recargo, y al final lo que te deben.',

  faq: [
    {
      q: '¿Cómo se calcula el valor de mi hora ordinaria?',
      a: `Se divide el salario mensual por el divisor de la jornada. Hasta el 14 de julio de 2026 fue ${JORNADA.divisorMensualHasta14Jul2026} horas al mes, correspondiente a la jornada de ${JORNADA.horasSemanaHasta14Jul2026} horas semanales. Desde el 15 de julio de 2026 el divisor es ${JORNADA.divisorMensualDesde15Jul2026}, por la jornada de ${JORNADA.horasSemanaDesde15Jul2026} horas que fijó la Ley 2101 de 2021. Como el salario mensual no baja, tu hora ordinaria subió aproximadamente un 4,76%, y con ella suben todas las extras y todos los recargos.`,
    },
    {
      q: '¿Cuáles son todos los porcentajes de recargo vigentes?',
      a: `Hora extra diurna: ${pct(RECARGOS.extraDiurna)}. Hora extra nocturna: ${pct(RECARGOS.extraNocturna)}. Recargo por trabajo nocturno dentro de la jornada ordinaria: ${pct(RECARGOS.nocturno)}. Domingo o festivo: ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)} desde el 1 de julio de 2026. Todos se calculan sobre el valor de la hora ordinaria. El dominical y el nocturno se acumulan entre sí; el ${pct(RECARGOS.extraNocturna)} de la extra nocturna, en cambio, ya lleva la nocturnidad adentro y no se le suma el ${pct(RECARGOS.nocturno)}.`,
    },
    {
      q: '¿Desde qué hora empieza a correr el recargo nocturno?',
      a: `Desde las ${RECARGOS.horaInicioNocturna}:00 y hasta las 06:00. La Ley 2466 de 2025 adelantó el inicio de la noche laboral, que hasta el 25 de diciembre de 2025 empezaba a las 21:00. Eso significa que las horas entre las ${RECARGOS.horaInicioNocturna}:00 y las 21:00 ganaron un recargo del ${pct(RECARGOS.nocturno)} que antes no tenían: para un turno de tarde que termina a las 22:00, son dos horas más de recargo por día. Si tu empresa sigue liquidando desde las 21:00, te está pagando de menos.`,
    },
    {
      q: '¿Qué diferencia hay entre recargo nocturno y hora extra nocturna?',
      a: `Es la confusión más común de toda la nómina colombiana. El recargo nocturno del ${pct(RECARGOS.nocturno)} se paga por trabajar tu jornada normal en horario de noche: no trabajaste de más, trabajaste en un horario peor. La hora extra nocturna del ${pct(RECARGOS.extraNocturna)} se paga por trabajar de noche por encima de tu jornada. Si tu turno pactado es de 14:00 a 22:00, las horas después de las ${RECARGOS.horaInicioNocturna}:00 son recargo nocturno; si te quedás hasta las 23:00, esa última hora es extra nocturna.`,
    },
    {
      q: '¿Cuánto es el recargo dominical y festivo en Colombia 2026?',
      a: `Depende de la fecha exacta. Hasta el 30 de junio de 2026 el recargo era del ${pct(RECARGOS.dominicalFestivoHasta30Jun2026)}; desde el 1 de julio de 2026 es del ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)}, y desde el 1 de julio de 2027 llegará al ${pct(RECARGOS.dominicalFestivoDesde01Jul2027)}, según el calendario que fijó la Ley 2466 de 2025. Es un recargo sobre la hora ordinaria: con el ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)}, cada hora dominical vale 1,9 veces la hora normal. Si además fue de noche, se le suma el ${pct(RECARGOS.nocturno)} y llega a 2,25 veces.`,
    },
    {
      q: '¿Puedo elegir un día de descanso en vez del recargo dominical?',
      a: 'Sólo si el trabajo dominical es ocasional, es decir hasta dos domingos al mes. En ese caso podés elegir entre el recargo en dinero o un día compensatorio de descanso remunerado. Si trabajás tres o más domingos en el mes, el trabajo es habitual y te corresponden las dos cosas: el recargo y el día compensatorio. Muchas empresas dan sólo el compensatorio aunque el trabajo sea habitual, y eso no se ajusta a la ley.',
    },
    {
      q: '¿Cuántas horas extras puedo trabajar legalmente?',
      a: `Un máximo de ${TOPE_EXTRAS.porDia} horas extras por día y ${TOPE_EXTRAS.porSemana} por semana, unas ${TOPE_EXTRAS.porMesAprox} al mes, según el art. 22 de la Ley 50 de 1990. Ese tope aplica a la suma de extras diurnas y nocturnas. Superarlo es una infracción que el Ministerio del Trabajo puede sancionar, y no exime al empleador de pagarlas: las horas trabajadas por encima del tope se deben igual, con su recargo completo.`,
    },
    {
      q: '¿Cuántos festivos tiene Colombia en 2026 y cuáles arman puente?',
      a: `Son ${FESTIVOS_2026.total} festivos nacionales, uno más que en años anteriores porque la Ley 2578 de 2026 sumó el día de la Virgen de Chiquinquirá. De esos, ${FESTIVOS_2026.lunes} caen en lunes y arman fin de semana largo, gracias al traslado que ordena la Ley Emiliani (Ley 51 de 1983) para los festivos trasladables. Los fijos —Año Nuevo, 1 de mayo, 20 de julio, 7 de agosto, 8 de diciembre y Navidad— se conmemoran el día que caigan, y los religiosos de Semana Santa siguen el calendario litúrgico.`,
    },
    {
      q: '¿Las horas extras entran en la base de prestaciones?',
      a: 'Sí. Las horas extras y los recargos son factor salarial, así que entran en la base de liquidación de prima de servicios, cesantías, intereses de cesantías y aportes a seguridad social. Para las prestaciones se toma el promedio de lo devengado en el período que se liquida, no el salario básico pelado. Es un punto donde muchas liquidaciones se quedan cortas: si tuviste extras todo el año y te liquidan sólo sobre el básico, te están pagando de menos.',
    },
    {
      q: '¿Quién no tiene derecho a cobrar horas extras?',
      a: `Quien tiene salario integral, porque su factor prestacional del 30% ya remunera las extras y los recargos. Tampoco los cargos de dirección, confianza y manejo, que están excluidos de la jornada máxima legal por el art. 162 del CST. Ese último punto se abusa mucho: no basta con que el contrato diga "cargo de confianza", tiene que haber realmente poder de decisión y representación del empleador. Un cajero o un supervisor de turno no entran en esa categoría por más que se lo pongan en el papel.`,
    },
    {
      q: '¿Qué pasó exactamente el 15 de julio de 2026?',
      a: `Entró el último escalón de la Ley 2101 de 2021: la jornada máxima legal bajó de ${JORNADA.horasSemanaHasta14Jul2026} a ${JORNADA.horasSemanaDesde15Jul2026} horas semanales, sin reducción de salario. El divisor mensual para calcular el valor hora pasó de ${JORNADA.divisorMensualHasta14Jul2026} a ${JORNADA.divisorMensualDesde15Jul2026}. En la práctica trabajás dos horas menos por semana y cada hora tuya vale más, así que el mismo número de horas extras te tiene que rendir más plata que antes de esa fecha.`,
    },
    {
      q: '¿Cómo funciona esta calculadora de horas extras Colombia 2026?',
      a: `Ponés tu salario mensual, la fecha y las horas, y la calculadora arma el valor de tu hora ordinaria con el divisor vigente ese día (${JORNADA.divisorMensualHasta14Jul2026} hasta el 14 de julio de 2026, ${JORNADA.divisorMensualDesde15Jul2026} desde el 15) y le aplica el recargo que corresponda: ${pct(RECARGOS.extraDiurna)} extra diurna, ${pct(RECARGOS.extraNocturna)} extra nocturna, ${pct(RECARGOS.nocturno)} nocturno y ${pct(RECARGOS.dominicalFestivoDesde01Jul2026)} dominical o festivo desde el 1 de julio de 2026. Con el mínimo de ${cop(SMLMV)}, la hora ordinaria con divisor ${JORNADA.divisorMensualDesde15Jul2026} vale ${cop(SMLMV / JORNADA.divisorMensualDesde15Jul2026)} y la extra diurna ${cop((SMLMV / JORNADA.divisorMensualDesde15Jul2026) * (1 + RECARGOS.extraDiurna))}.`,
    },
    {
      q: '¿Cómo pruebo las horas extras si mi empresa no las registra?',
      a: 'Sirve cualquier cosa que muestre tu horario real: registros de entrada y salida, correos enviados fuera de hora, mensajes de trabajo, planillas de turnos, testimonios de compañeros o registros de acceso al edificio. La ley obliga al empleador a llevar un registro de horas extras y a exhibirlo cuando el Ministerio del Trabajo lo pida; si no lo lleva, esa omisión juega en su contra. El reclamo se puede hacer ante el Ministerio o directamente en la jurisdicción laboral, y prescribe a los 3 años.',
    },
  ],

  sources: [
    {
      name: 'Código Sustantivo del Trabajo, art. 168 — recargos por trabajo nocturno y horas extras',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Código Sustantivo del Trabajo, arts. 179 y 180 — trabajo dominical y festivo',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 2101 de 2021 — reducción de la jornada laboral a 42 horas semanales',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=167953',
      publisher: 'Función Pública',
      date: '15-07-2021',
    },
    {
      name: 'Ley 2466 de 2025 — reforma laboral: jornada nocturna desde las 19:00 y recargo dominical',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '2025',
    },
    {
      name: 'Ley 50 de 1990, art. 22 — límite de horas extras diarias y semanales',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=281',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 51 de 1983 (Ley Emiliani) — traslado de festivos al lunes',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4954',
      publisher: 'Función Pública',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
  ],

  replaces: [
    '/co/calculadora-horas-extras-colombia-2026',
    '/co/calculadora-recargo-nocturno-colombia-2026',
    '/co/calculadora-recargo-dominical-festivo-colombia-2026',
    '/co/calculadora-reduccion-jornada-42-horas-colombia-2026',
    '/co/calculadora-festivos-colombia-2026-calendario-puentes',
  ],

  lastReviewed: '2026-08-07',
};
