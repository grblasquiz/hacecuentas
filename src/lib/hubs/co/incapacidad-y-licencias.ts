import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Estoy incapacitado o de licencia: ¿quién me paga y cuánto?"
 *
 * Constantes de plata y porcentajes de incapacidad: src/lib/data/colombia-2026.ts.
 *
 * OJO — los rangos de copago del Acuerdo 260 de 2004 (CNSSS) NO están en la tabla
 * maestra y no se pudieron verificar contra ella. Viajan acá, aislados en
 * COPAGO_ACUERDO_260, y el valor en pesos de la cuota moderadora es un campo
 * EDITABLE por el usuario: cada EPS lo publica y se actualiza todos los años.
 * Tratarlos como referencia, no como liquidación.
 */

const DISCLAIMER =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;
/** Salario mínimo diario: el piso de cualquier prestación económica. */
export const SMDLV = COLOMBIA_2026.smdlv;

/** Incapacidad de origen común (CST art. 227, Ley 100 art. 206, Decreto 2943/2013). */
export const INCAPACIDAD = {
  pct1a90: COLOMBIA_2026.incapacidad.porcentajeDias1a90,
  pct91a180: COLOMBIA_2026.incapacidad.porcentajeDias91a180,
  diasEmpleador: COLOMBIA_2026.incapacidad.diasACargoEmpleador,
  pisoSmlmv: COLOMBIA_2026.incapacidad.pisoIbcSmlmv,
  topeDiasEps: 180,
};

/** Licencia de maternidad: 18 semanas (Ley 1822/2017), al 100% del IBC. */
export const MATERNIDAD = { semanas: 18, dias: 126, pctIbc: 1, semanasPreparto: 1, semanasPrepartoMax: 2 };

/** Licencia de paternidad: 2 semanas (Ley 1822/2017), al 100% del IBC, a cargo de la EPS. */
export const PATERNIDAD = { semanas: 2, dias: 14, pctIbc: 1 };

/** Mecanismo de Protección al Cesante (Ley 1636/2013): aportes sobre 1 SMLMV, hasta 6 meses. */
export const CESANTE = {
  mesesMax: 6,
  tasaAportes: COLOMBIA_2026.independientes.salud + COLOMBIA_2026.independientes.pension,
  aniosCotizacionDependiente: 1,
  ventanaAnios: 3,
};

/**
 * Copagos del régimen contributivo — Acuerdo 260 de 2004 (CNSSS), por rango de IBC.
 * NO verificado contra src/lib/data/colombia-2026.ts (la tabla maestra no cubre
 * salud). El porcentaje se aplica al valor del servicio y el tope anual se mide
 * en SMLMV. Cuotas moderadoras y copagos son cosas distintas: la moderadora es un
 * valor fijo por consulta o fórmula; el copago es un porcentaje de la atención.
 */
export const COPAGO_ACUERDO_260 = [
  { id: 'A', label: 'Menos de 2 SMLMV', hastaSmlmv: 2, pctServicio: 0.115, topeAnualSmlmv: 0.575 },
  { id: 'B', label: 'Entre 2 y 5 SMLMV', hastaSmlmv: 5, pctServicio: 0.173, topeAnualSmlmv: 2.3 },
  { id: 'C', label: 'Más de 5 SMLMV', hastaSmlmv: null, pctServicio: 0.23, topeAnualSmlmv: 4.6 },
];

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/trabajo/incapacidad-y-licencias',
  title: 'Incapacidad y licencias en Colombia: quién te paga y cuánto',
  description:
    'Cuánto cobrás por incapacidad médica, licencia de maternidad, licencia de paternidad o desempleo en Colombia, y quién pone la plata: empleador, EPS o Caja de Compensación. Con el piso del salario mínimo proporcional y las cuotas moderadoras y copagos que te siguen cobrando.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · EPS · prestaciones económicas',
  h1: 'Estoy incapacitado o de licencia: ¿quién me paga y cuánto?',
  lede:
    'El sueldo se corta pero la plata no desaparece: cambia de pagador y, casi siempre, de monto. Esta cuenta te dice cuánto te toca por día, quién lo pone en cada tramo y cuánto dejás de percibir frente a tu salario normal.',
  stamps: [
    `Días 1-${INCAPACIDAD.diasEmpleador}: empleador · 3-90: EPS al ${(INCAPACIDAD.pct1a90 * 100).toFixed(2).replace('.', ',')}%`,
    `Días 91-180: EPS al ${INCAPACIDAD.pct91a180 * 100}%`,
    `Maternidad ${MATERNIDAD.semanas} semanas · paternidad ${PATERNIDAD.semanas} semanas`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que vas a cobrar',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Cada prestación tiene su propio pagador, su propio porcentaje y su propio requisito de cotización. Arrancamos por la más frecuente.',
    items: [
      {
        id: 'incapacidad',
        label: 'Estoy incapacitado por enfermedad común',
        hint: 'Días 1-2 empleador · 3-90 EPS · 91-180 EPS al 50%',
        answer: `Los dos primeros días los paga el empleador, del 3 al 90 la EPS al ${(INCAPACIDAD.pct1a90 * 100).toFixed(2).replace('.', ',')}% y del 91 al 180 al ${INCAPACIDAD.pct91a180 * 100}%.`,
        yes: [
          `Días 1 y 2: los paga el empleador, al ${(INCAPACIDAD.pct1a90 * 100).toFixed(2).replace('.', ',')}% del salario`,
          `Días 3 a 90: los paga la EPS, al ${(INCAPACIDAD.pct1a90 * 100).toFixed(2).replace('.', ',')}% del IBC`,
          `Días 91 a 180: los paga la EPS, al ${INCAPACIDAD.pct91a180 * 100}% del IBC`,
          'El auxilio nunca puede quedar por debajo del salario mínimo diario proporcional',
          'La incapacidad no interrumpe la relación laboral ni suspende tus aportes',
        ],
        warn: [
          DISCLAIMER,
          'Desde el día 181 la prestación ya no la paga la EPS: pasa al fondo de pensiones (AFP o Colpensiones); esta cuenta llega hasta el 180',
          'La EPS liquida sobre el IBC que reportó tu empleador, no sobre lo que creés que ganás: si te cotizan por menos, cobrás menos',
          'Si el origen es accidente de trabajo o enfermedad laboral no aplica nada de esto: paga la ARL, al 100% y desde el primer día',
          'La incapacidad se transcribe ante la EPS: sin transcripción no hay pago, aunque el médico la haya expedido',
        ],
        plazo: 'la reclamación de incapacidades prescribe a los 3 años; no dejes acumular meses sin cobrar.',
      },
      {
        id: 'maternidad',
        label: 'Estoy en licencia de maternidad',
        hint: `${MATERNIDAD.semanas} semanas al 100% del IBC`,
        answer: `Son ${MATERNIDAD.semanas} semanas (${MATERNIDAD.dias} días) pagadas al 100% del IBC por la EPS, no por el empleador.`,
        yes: [
          `${MATERNIDAD.semanas} semanas de licencia, ${MATERNIDAD.dias} días calendario, al 100% del ingreso base de cotización`,
          'La paga la EPS, aunque en la práctica muchas empresas adelantan el pago y después lo recobran',
          `Al menos ${MATERNIDAD.semanasPreparto} semana debe tomarse antes de la fecha probable de parto; podés adelantar hasta ${MATERNIDAD.semanasPrepartoMax}`,
          'En parto múltiple la licencia se extiende, y si el bebé es prematuro se suman los días de anticipación',
          'Durante la licencia seguís afiliada y se siguen pagando aportes sobre el IBC',
        ],
        warn: [
          DISCLAIMER,
          'La EPS liquida sobre el IBC reportado durante la gestación: si el empleador te cotizó por menos del salario real, la licencia sale más baja y el ajuste lo debe el empleador',
          'Esto es información general y no reemplaza el criterio de tu médico ni de tu EPS: cualquier decisión sobre el embarazo o el parto se toma con ellos',
          'Si no cotizaste durante todo el período de gestación, la EPS puede reconocer un pago proporcional en vez de negarlo: no des por perdido el subsidio',
          'La licencia de paternidad es un pago aparte, del otro progenitor: no se suma a lo que cobrás vos',
        ],
        plazo: 'radicá la solicitud apenas tengas el registro civil y la epicrisis; el giro suele tardar semanas.',
      },
      {
        id: 'paternidad',
        label: 'Estoy en licencia de paternidad',
        hint: `${PATERNIDAD.semanas} semanas al 100% del IBC`,
        answer: `Son ${PATERNIDAD.dias} días hábiles de ley pagados al 100% del IBC por la EPS, contados desde el nacimiento.`,
        yes: [
          `${PATERNIDAD.semanas} semanas (${PATERNIDAD.dias} días) al 100% del IBC, a cargo de la EPS`,
          'Se cuenta desde la fecha de nacimiento y se acredita con el registro civil',
          'Aplica a padres con contrato laboral vigente y afiliación activa como cotizantes',
          'Existe la licencia parental compartida: parte de las semanas de la madre pueden transferirse al padre, de común acuerdo',
        ],
        warn: [
          DISCLAIMER,
          'Los días que negociés por encima de los de ley los paga el empleador, no la EPS: la EPS sólo reconoce los de ley',
          'Si estás como beneficiario y no como cotizante, no hay licencia remunerada',
          'La licencia parental compartida y la flexible tienen requisitos propios y se pactan por escrito antes de tomarlas',
        ],
        plazo: 'pedila apenas nazca: algunas EPS exigen radicarla dentro de los primeros 30 días.',
      },
      {
        id: 'desempleo',
        label: 'Quedé sin trabajo',
        hint: 'Mecanismo de Protección al Cesante',
        answer:
          'El Mecanismo de Protección al Cesante no te paga un sueldo: te paga la salud y la pensión sobre un salario mínimo, hasta 6 meses.',
        yes: [
          `Aportes a salud y pensión sobre 1 SMLMV (${(CESANTE.tasaAportes * 100).toString().replace('.', ',')}% de ${cop(SMLMV)}), por cuenta de la Caja de Compensación`,
          `Hasta ${CESANTE.mesesMax} meses de beneficio`,
          'Cuota monetaria del subsidio familiar por cada persona a cargo, mientras dure el beneficio',
          'Acceso a orientación laboral y a formación a través del SENA y de la Agencia de Empleo',
        ],
        warn: [
          DISCLAIMER,
          'No es un pago en efectivo por el valor de tu sueldo: la mayor parte del beneficio nunca pasa por tu cuenta, va directo al sistema',
          `Como dependiente se exige haber aportado a una Caja al menos ${CESANTE.aniosCotizacionDependiente} año, continuo o discontinuo, en los últimos ${CESANTE.ventanaAnios}`,
          'La cuota monetaria por persona a cargo la fija cada Caja de Compensación y cambia todos los años: verificá la tuya',
          'El beneficio se pierde si rechazás ofertas de empleo compatibles con tu perfil o si no cumplís la ruta de empleabilidad',
        ],
        plazo: 'postulate apenas quedes cesante: el beneficio no es retroactivo a los meses que dejaste pasar.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'El IBC es lo que tu empleador reporta como base de cotización, que normalmente es tu salario. Los demás campos sólo pesan en la rama que los usa.',
  fields: [
    {
      id: 'ibc',
      label: 'Tu IBC o salario mensual (COP)',
      prefix: '$',
      value: '2.600.000',
      thousands: true,
      help: 'La base sobre la que te cotizan. Todas las prestaciones se liquidan sobre esto, no sobre lo que recibís en mano.',
    },
    {
      id: 'dias',
      label: 'Días de incapacidad',
      type: 'number',
      value: 30,
      min: 1,
      max: 180,
      step: 1,
      help: 'Días calendario. Del 181 en adelante la prestación pasa al fondo de pensiones y sale de esta cuenta.',
    },
    {
      id: 'diasExtra',
      label: 'Días de licencia negociados por encima de la ley',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: 'Sólo para las ramas de licencia. Los paga el empleador, no la EPS.',
    },
    {
      id: 'personas',
      label: 'Personas a cargo',
      type: 'number',
      value: 2,
      min: 0,
      max: 10,
      step: 1,
      help: 'Hijos y demás beneficiarios del subsidio familiar. Se usa en la rama de desempleo.',
    },
    {
      id: 'cuotaFamiliar',
      label: 'Cuota monetaria por persona a cargo (COP)',
      prefix: '$',
      value: '55.000',
      thousands: true,
      help: 'La fija cada Caja de Compensación y cambia todos los años: poné la de la tuya. El valor cargado es referencial.',
    },
    {
      id: 'cuotaModeradora',
      label: 'Cuota moderadora que te cobra tu EPS (COP)',
      prefix: '$',
      value: '6.000',
      thousands: true,
      help: 'Lo que pagás por consulta o fórmula. Cada EPS publica su tabla y se actualiza cada año: verificá el valor real.',
    },
    {
      id: 'servicios',
      label: 'Consultas y fórmulas que usás al año',
      type: 'number',
      value: 12,
      min: 0,
      max: 100,
      step: 1,
      help: 'Para estimar cuánto te sigue costando la salud mientras estás incapacitado o de licencia.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'stacked',
    title: 'Quién pone la plata mientras no trabajás',
    caption:
      'Una barra partida entre lo que pone el empleador, lo que pone la EPS o la Caja de Compensación y lo que dejás de percibir frente a tu salario normal. La franja que perdés es la que nadie cubre.',
  },
  breakdownTitle: 'Cuánto y de quién, día por día',
  breakdownIntro:
    'Primero el valor de tu día, después cada tramo con su pagador y su porcentaje, y al final lo que la salud te sigue costando.',

  faq: [
    {
      q: '¿Quién me paga los primeros días de incapacidad?',
      a: `Los dos primeros días los asume el empleador, al ${(INCAPACIDAD.pct1a90 * 100).toFixed(2).replace('.', ',')}% del salario. Del día 3 al 90 paga la EPS con el mismo porcentaje, y del 91 al 180 la EPS baja al ${INCAPACIDAD.pct91a180 * 100}%. Del día 181 en adelante la prestación pasa al fondo de pensiones, que la reconoce mientras se define si hay lugar a pensión de invalidez.`,
    },
    {
      q: '¿Puedo cobrar menos del salario mínimo estando incapacitado?',
      a: `No. El auxilio por incapacidad nunca puede quedar por debajo del salario mínimo diario proporcional, hoy ${cop(SMDLV)} por día. Por eso quien gana el mínimo cobra durante la incapacidad prácticamente lo mismo que trabajando: el ${(INCAPACIDAD.pct1a90 * 100).toFixed(2).replace('.', ',')}% del mínimo quedaría por debajo del piso, y la ley lo eleva.`,
    },
    {
      q: '¿La incapacidad se liquida sobre mi salario o sobre lo que me cotizan?',
      a: 'Sobre el IBC, es decir sobre lo que el empleador reporta en la planilla. Si te cotizan por menos de lo que realmente ganás, la EPS liquida sobre esa base menor y la diferencia se la debe reclamar al empleador, no a la EPS. Es la razón más común por la que la gente cobra menos de lo que esperaba: conviene revisar el IBC reportado antes de necesitarlo.',
    },
    {
      q: '¿Cuánto dura y cuánto paga la licencia de maternidad?',
      a: `${MATERNIDAD.semanas} semanas, es decir ${MATERNIDAD.dias} días calendario, al 100% del IBC, a cargo de la EPS. Al menos una semana debe tomarse antes de la fecha probable de parto y se pueden adelantar hasta dos. En parto múltiple la licencia se extiende, y si el bebé nace prematuro se suman los días que se adelantó el nacimiento. Nada de esto sustituye la indicación de tu médico.`,
    },
    {
      q: '¿Qué pasa si no cotizé todo el embarazo?',
      a: 'No pierde automáticamente el derecho. La regla general es que se cotice durante todo el período de gestación, pero cuando faltan semanas la EPS puede reconocer un pago proporcional al tiempo efectivamente cotizado, criterio respaldado por la jurisprudencia constitucional. Si te niegan el subsidio de plano, vale la pena insistir por escrito antes de darlo por perdido.',
    },
    {
      q: '¿La licencia de paternidad son días hábiles o calendario?',
      a: `Son ${PATERNIDAD.dias} días hábiles de ley, al 100% del IBC y a cargo de la EPS, contados desde el nacimiento. Se acredita con el registro civil. Si tu empresa te concede días adicionales por convención o por política interna, esos los paga el empleador: la EPS sólo reconoce los de ley.`,
    },
    {
      q: '¿Qué es la licencia parental compartida?',
      a: 'Es la posibilidad de que la madre transfiera al otro progenitor parte de las últimas semanas de su licencia de maternidad, de común acuerdo y avisando con anticipación a los empleadores y a la EPS. Existe además una modalidad flexible, que permite tomar parte de la licencia en jornadas de medio tiempo, extendiendo el período. Las dos se pactan por escrito antes de empezar a usarlas.',
    },
    {
      q: '¿Cuánto paga realmente el subsidio de desempleo en Colombia?',
      a: `El Mecanismo de Protección al Cesante no gira un sueldo. Paga tus aportes a salud y pensión sobre un salario mínimo —el ${(CESANTE.tasaAportes * 100).toString().replace('.', ',')}% de ${cop(SMLMV)}, unos ${cop(SMLMV * CESANTE.tasaAportes)} al mes— durante hasta ${CESANTE.mesesMax} meses, más la cuota monetaria del subsidio familiar por cada persona a cargo. Es una red que evita que pierdas cobertura, no un reemplazo del ingreso.`,
    },
    {
      q: '¿Qué requisitos piden para acceder al Mecanismo de Protección al Cesante?',
      a: `Como trabajador dependiente, haber aportado a una Caja de Compensación al menos ${CESANTE.aniosCotizacionDependiente} año, continuo o discontinuo, dentro de los últimos ${CESANTE.ventanaAnios} antes de quedar cesante. Como independiente, el tiempo mínimo exigido es mayor. Además hay que inscribirse en la ruta de empleabilidad y no rechazar ofertas compatibles con tu perfil: el beneficio se suspende si no cumplís esa parte.`,
    },
    {
      q: '¿Sigo pagando cuota moderadora si estoy incapacitado?',
      a: 'Sí. Estar incapacitado o de licencia no te exime de las cuotas moderadoras ni de los copagos: seguís siendo cotizante y el sistema te sigue cobrando por consultas, fórmulas y atenciones. Como el ingreso baja y el gasto en salud normalmente sube en esos meses, conviene tenerlo en la cuenta desde el principio.',
    },
    {
      q: '¿Cuál es la diferencia entre cuota moderadora y copago?',
      a: 'La cuota moderadora es un valor fijo que se paga por consulta externa, fórmula o examen, y busca desincentivar el uso innecesario. El copago es un porcentaje del valor de la atención, se cobra sobre hospitalizaciones y procedimientos, y tiene topes anuales según tu rango de ingresos. Al cotizante y a sus beneficiarios les aplican los dos, pero nunca sobre el mismo servicio.',
    },
    {
      q: '¿Hay un tope de lo que la EPS me puede cobrar en el año?',
      a: `Sí, para los copagos. El Acuerdo 260 de 2004 fija topes anuales medidos en salarios mínimos y escalonados por el ingreso del cotizante: cuanto más bajo el ingreso, más bajo el tope. Alcanzado el tope, la EPS asume el resto de las atenciones del año, así que vale la pena guardar todos los recibos. Los valores exactos los publica cada EPS y se actualizan cada año.`,
    },
    {
      q: '¿Y si la incapacidad fue por un accidente de trabajo?',
      a: 'Ahí no aplica nada de esta cuenta. Las incapacidades de origen laboral las paga la ARL, al 100% del IBC y desde el día siguiente al accidente, sin los dos días a cargo del empleador ni la baja al 50%. La calificación del origen la hace primero la EPS o la ARL y se puede controvertir ante las juntas de calificación de invalidez.',
    },
  ],

  sources: [
    {
      name: 'Código Sustantivo del Trabajo, art. 227 — auxilio monetario por enfermedad no profesional',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo_pr007.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 100 de 1993, art. 206 — incapacidades por enfermedad general',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993_pr004.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 1822 de 2017 — licencia de maternidad de 18 semanas y licencia de paternidad',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30030310',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'Ley 1636 de 2013 — Mecanismo de Protección al Cesante',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_1636_2013.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Acuerdo 260 de 2004 (CNSSS) — cuotas moderadoras y copagos del régimen contributivo',
      url: 'https://www.minsalud.gov.co/Normatividad_Nuevo/ACUERDO%20260%20DE%202004.pdf',
      publisher: 'Ministerio de Salud y Protección Social',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'MinTrabajo',
      date: '29-12-2025',
    },
    {
      name: 'Ministerio de Salud — prestaciones económicas del régimen contributivo',
      url: 'https://www.minsalud.gov.co/',
      publisher: 'MinSalud',
    },
  ],

  replaces: [
    '/co/calculadora-incapacidad-medica-eps-colombia',
    '/co/calculadora-licencia-maternidad-colombia-18-semanas',
    '/co/calculadora-licencia-paternidad-colombia-2-semanas',
    '/co/calculadora-subsidio-desempleo-proteccion-cesante-colombia',
    '/co/calculadora-cuota-moderadora-copago-eps-colombia-2026',
  ],

  lastReviewed: '2026-07-28',
};

export const SMLMV_FMT = cop(SMLMV);
