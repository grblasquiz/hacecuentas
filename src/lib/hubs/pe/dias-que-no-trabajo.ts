import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';
import { FERIADOS_PE_2026 } from '../../data/feriados-latam-2026';

/**
 * Hub de decisión PE — "Vacaciones, feriado, falta o descanso médico: ¿cómo se paga
 * el día que no trabajo?"
 *
 * Absorbe vacaciones, calendario de feriados, feriado trabajado (triple),
 * descuento por tardanzas y faltas, y subsidio por incapacidad temporal de EsSalud.
 * Cálculo espejado de las fórmulas vivas vacaciones-peru.ts,
 * pago-feriado-trabajado-triple-peru.ts, descuento-tardanzas-faltas-peru.ts,
 * subsidio-incapacidad-temporal-essalud-peru.ts y feriados-peru-2026-calendario.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABORAL =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const RMV = PERU_2026.rmv;
/** D. Leg. 713 art. 10: 30 días calendario de descanso por año completo de servicios. */
export const DIAS_VACACIONES = 30;
/** Ley 26790 / D.S. 009-97-SA: los primeros 20 días de incapacidad del año los paga el empleador. */
export const DIAS_A_CARGO_EMPLEADOR = 20;
/** Tope de días de subsidio continuo a cargo de EsSalud. */
export const TOPE_DIAS_SUBSIDIO = 340;

/** Calendario de feriados nacionales del año en curso (fuente única: feriados-latam-2026.ts). */
export const FERIADOS = FERIADOS_PE_2026.map((f) => ({ fecha: f.fecha, dia: f.dia, nombre: f.nombre }));
export const TOTAL_FERIADOS = FERIADOS.length;

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/trabajo/dias-que-no-trabajo',
  title: 'El día que no trabajas en Perú: vacaciones, feriado, falta y descanso médico',
  description:
    'Cuánto se paga —o cuánto te descuentan— el día que no trabajas en el Perú: remuneración vacacional y pago triple, feriado trabajado sin descanso sustitutorio, tardanzas y faltas injustificadas, y subsidio por incapacidad temporal de EsSalud.',
  silo: 'Trabajo',
  siloHref: '/pe/trabajo',
  locale: 'pe',

  eyebrow: 'Perú · descansos remunerados · D. Leg. 713',
  h1: 'Vacaciones, feriado, falta o descanso médico: ¿cómo se paga el día que no trabajo?',
  lede:
    'Todos los días que no trabajas se pagan distinto, y todos parten del mismo número: tu remuneración diaria, que es el sueldo dividido entre 30. A partir de ahí un feriado trabajado puede valer el triple, un día de vacaciones vale exactamente uno, una falta injustificada te resta uno, y un descanso médico se paga con dos bolsillos distintos según cuántos días lleves.',
  stamps: [
    `${DIAS_VACACIONES} días de vacaciones al año · ${TOTAL_FERIADOS} feriados nacionales`,
    `Feriado trabajado sin descanso: triple · EsSalud desde el día ${DIAS_A_CARGO_EMPLEADOR + 1}`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que se paga (o se descuenta)',

  cases: {
    title: '¿Qué día es el que no trabajaste?',
    intro:
      'La regla cambia por completo según el motivo. Elige el tuyo: el cálculo, las advertencias y los plazos se ajustan solos. Partimos por el caso más frecuente.',
    items: [
      {
        id: 'vacaciones',
        label: 'Estoy de vacaciones',
        hint: '30 días · una remuneración',
        answer:
          'Los 30 días de descanso se pagan con una remuneración mensual completa, y se abona antes de que empiece el descanso.',
        yes: [
          'Descanso de 30 días calendario por cada año completo de servicios (D. Leg. 713, art. 10)',
          'La remuneración vacacional equivale a una remuneración mensual y se paga antes de salir de vacaciones',
          'Se puede fraccionar en períodos de 7 días, pero al menos 15 días deben gozarse de corrido',
          'Se pueden vender hasta 15 días al empleador, con acuerdo escrito',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Si dejas vencer el año siguiente al que ganaste el descanso sin gozarlo, se activa la indemnización vacacional: una remuneración adicional (art. 23 D. Leg. 713)',
          'La indemnización vacacional no le corresponde al personal de dirección ni a quienes deciden libremente la oportunidad de su descanso',
        ],
        plazo:
          'la remuneración vacacional se paga antes del inicio del descanso, no al volver.',
      },
      {
        id: 'feriado',
        label: 'Trabajé un feriado',
        hint: 'Sin descanso sustitutorio: triple',
        answer:
          'Si trabajas un feriado y no te dan descanso sustitutorio, ese día vale el triple: el del sueldo, el trabajado y una sobretasa del 100%.',
        yes: [
          'Ese día ya está pagado dentro de tu sueldo mensual: eso es una remuneración diaria',
          'Se agrega la remuneración por el día efectivamente trabajado: segunda diaria',
          'Se agrega una sobretasa del 100%: tercera diaria',
          `El calendario del año trae ${TOTAL_FERIADOS} feriados nacionales, además de los feriados regionales o locales que declare la autoridad`,
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Si el empleador te otorga descanso sustitutorio en otro día, no corresponde el pago adicional: se compensa con el día libre',
          'La sobretasa se calcula sobre la remuneración diaria ordinaria, no sobre el valor con horas extras',
        ],
        plazo:
          'el pago adicional debe aparecer en la boleta del mes en que trabajaste el feriado.',
      },
      {
        id: 'falta',
        label: 'Falté o llegué tarde',
        hint: 'Descuento proporcional',
        answer:
          'La falta injustificada descuenta una remuneración diaria completa; la tardanza descuenta solo los minutos, nunca más.',
        yes: [
          'Falta injustificada: se descuenta la remuneración diaria (sueldo entre 30) por cada día',
          'Tardanza: se descuenta el valor del minuto, que es la diaria dividida entre los minutos de tu jornada',
          'El descuento es proporcional: nunca puede superar el tiempo efectivamente no trabajado',
          'Faltar un día laborable también puede hacerte perder el descanso semanal remunerado proporcional de esa semana',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Una multa económica por tardanza es ilegal: el empleador solo puede descontar el tiempo no trabajado. Descontar "una hora por cada 10 minutos" es una sanción encubierta y se denuncia ante SUNAFIL',
          'Las faltas injustificadas reiteradas sí pueden ser causa justa de despido: más de 3 días consecutivos, o más de 5 en 30 días, o más de 15 en 180 días (art. 25 D.S. 003-97-TR)',
        ],
        plazo:
          'el descuento se aplica en la boleta del mismo mes y debe estar detallado línea por línea.',
      },
      {
        id: 'medico',
        label: 'Estoy con descanso médico',
        hint: 'Empleador hasta el día 20 · después EsSalud',
        answer:
          'Los primeros 20 días de incapacidad del año los paga tu empleador; desde el día 21 el subsidio lo asume EsSalud.',
        yes: [
          `Días 1 al ${DIAS_A_CARGO_EMPLEADOR}: los paga el empleador como si hubieras trabajado`,
          `Día ${DIAS_A_CARGO_EMPLEADOR + 1} en adelante: subsidio por incapacidad temporal a cargo de EsSalud`,
          'Requisito: tener al menos 3 meses de aportación consecutivos, o 4 no consecutivos, dentro de los 6 meses anteriores al mes de la contingencia',
          `El subsidio se paga hasta un máximo de ${TOPE_DIAS_SUBSIDIO} días de incapacidad continua`,
        ],
        warn: [
          DISCLAIMER_LABORAL,
          `Los ${DIAS_A_CARGO_EMPLEADOR} días a cargo del empleador se cuentan ACUMULADOS en el año calendario, no por cada descanso: si ya tuviste 15 días este año, del siguiente descanso el empleador solo cubre 5`,
          'El subsidio de EsSalud se calcula sobre el promedio diario de las últimas 12 remuneraciones (o las que tengas si son menos), no sobre el sueldo del mes en curso: si tu sueldo subió hace poco, vas a cobrar menos de lo que sale acá',
          'Los descansos médicos de más de 20 días deben canjearse por el CITT en EsSalud; sin ese canje el subsidio no se paga',
        ],
        plazo:
          'el empleador tiene 30 días hábiles desde el fin del descanso para pedir el reembolso a EsSalud; sin ese trámite el trabajador puede quedar sin cobrar.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Carga tu remuneración mensual y completa solo los campos de tu caso. Los demás quedan en cero y no afectan el resultado.',
  fields: [
    {
      id: 'sueldo',
      label: 'Remuneración mensual (S/)',
      prefix: 'S/',
      value: 2500,
      thousands: true,
      help: 'Tu sueldo bruto mensual. La remuneración diaria siempre es este monto dividido entre 30, tenga el mes 28 o 31 días.',
    },
    {
      id: 'horasDia',
      label: 'Horas de tu jornada diaria',
      type: 'number',
      value: 8,
      min: 1,
      max: 12,
      step: 1,
      help: 'Se usa para el valor del minuto en las tardanzas. La jornada legal máxima es de 8 horas diarias o 48 semanales.',
    },
    {
      id: 'diasFeriado',
      label: 'Feriados que trabajaste',
      type: 'number',
      value: 2,
      min: 0,
      max: 16,
      step: 1,
      help: 'Por ejemplo 2 si trabajaste el 28 y el 29 de julio.',
    },
    {
      id: 'sustitutorio',
      label: '¿Te dieron descanso sustitutorio por ese feriado?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, trabajé y no me dieron otro día libre' },
        { value: 'si', label: 'Sí, me dieron otro día libre pagado' },
      ],
      help: 'Con descanso sustitutorio no corresponde pago adicional: el feriado se compensa con el día libre.',
    },
    {
      id: 'diasFalta',
      label: 'Días de falta injustificada del mes',
      type: 'number',
      value: 1,
      min: 0,
      max: 30,
      step: 1,
      help: 'Días completos no trabajados y no justificados. Las licencias con goce y los descansos médicos no cuentan acá.',
    },
    {
      id: 'minutosTardanza',
      label: 'Minutos de tardanza acumulados en el mes',
      type: 'number',
      value: 60,
      min: 0,
      max: 5000,
      step: 5,
      help: 'Suma de todos los minutos que llegaste tarde en el mes.',
    },
    {
      id: 'diasMedico',
      label: 'Días de descanso médico',
      type: 'number',
      value: 30,
      min: 0,
      max: 400,
      step: 1,
      help: 'Días del certificado. Recuerda que los primeros 20 del año calendario los cubre el empleador.',
    },
    {
      id: 'diasYaUsados',
      label: 'Días de incapacidad que ya usaste este año',
      type: 'number',
      value: 0,
      min: 0,
      max: 20,
      step: 1,
      help: 'Días de descanso médico anteriores en el mismo año calendario. Consumen el cupo de 20 días a cargo del empleador.',
    },
    {
      id: 'vacVencidas',
      label: 'Situación de tus vacaciones',
      type: 'select',
      value: 'por_gozar',
      options: [
        { value: 'por_gozar', label: 'Las voy a gozar dentro del plazo' },
        { value: 'no_gozadas', label: 'Dejé vencer el plazo y no las gocé' },
        { value: 'direccion', label: 'No las gocé, pero soy personal de dirección' },
      ],
      help: 'Solo cambia la rama de vacaciones: define si se activa la indemnización vacacional del art. 23 del D. Leg. 713.',
    },
  ],
  fineprint: DISCLAIMER_LABORAL,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el monto',
    caption:
      'Cada porción es una remuneración diaria o un múltiplo de ella. Sirve para ver de un vistazo qué parte ya estaba dentro de tu sueldo y qué parte es dinero adicional que debe aparecer aparte en la boleta.',
  },
  breakdownTitle: 'Cómo sale el número',
  breakdownIntro:
    'Todo arranca en la remuneración diaria. Abajo, cada concepto con la norma que lo respalda.',

  faq: [
    {
      q: '¿Cuánto vale un día de mi sueldo en el Perú?',
      a: 'Tu remuneración mensual dividida entre 30, siempre 30, tenga el mes 28, 30 o 31 días. Ese valor diario es el que se usa para todo: pagar vacaciones, calcular el feriado trabajado, descontar una falta y liquidar el subsidio por incapacidad. El valor por hora sale de dividir la diaria entre las horas de tu jornada.',
    },
    {
      q: '¿Cuántos días de vacaciones me corresponden al año?',
      a: '30 días calendario por cada año completo de servicios, siempre que cumplas el récord vacacional (un mínimo de días efectivos de labor según tu jornada semanal). Se pueden fraccionar en períodos de al menos 7 días, pero un bloque de 15 días debe gozarse de corrido. Y puedes vender hasta 15 días al empleador, con acuerdo escrito.',
    },
    {
      q: '¿Qué es el pago triple de vacaciones y cuándo aplica?',
      a: 'Aplica cuando dejaste vencer el año siguiente a aquel en que ganaste el descanso sin gozarlo. En ese caso cobras tres remuneraciones: la del mes que trabajaste sin descansar (que ya cobraste como sueldo), la remuneración vacacional, y una indemnización equivalente a otra remuneración. Esa indemnización no está afecta a aportes previsionales y no le corresponde al personal de dirección ni a quien decide libremente cuándo descansar.',
    },
    {
      q: '¿Cuánto me deben pagar por trabajar un feriado?',
      a: 'El triple de tu remuneración diaria, si no te dieron descanso sustitutorio. Una diaria ya viene incluida en tu sueldo mensual, así que lo que debe aparecer adicional en la boleta son dos remuneraciones diarias por cada feriado trabajado: la del día efectivamente trabajado más la sobretasa del 100%. Con descanso sustitutorio acordado no hay monto extra.',
    },
    {
      q: '¿Cuántos feriados nacionales hay en el calendario?',
      a: `El calendario vigente trae ${TOTAL_FERIADOS} feriados nacionales, entre ellos Año Nuevo, Jueves y Viernes Santo, Día del Trabajo, San Pedro y San Pablo, el Día de la Fuerza Aérea (incorporado por la Ley 31822), los dos días de Fiestas Patrias, Santa Rosa de Lima, Combate de Angamos, Todos los Santos, Inmaculada Concepción, la Batalla de Ayacucho y Navidad. A eso pueden sumarse feriados regionales o días no laborables declarados por el Ejecutivo, que se compensan con horas y no se pagan como feriado.`,
    },
    {
      q: '¿Me pueden descontar más de lo que llegué tarde?',
      a: 'No. El descuento por tardanza solo puede ser proporcional al tiempo efectivamente no trabajado: si llegaste 15 minutos tarde, te descuentan 15 minutos. Cualquier fórmula del tipo "por cada 10 minutos de tardanza se descuenta una hora" es una multa disfrazada, y las multas económicas al trabajador están prohibidas. Se denuncia ante SUNAFIL.',
    },
    {
      q: '¿Faltar un día me hace perder también el domingo?',
      a: 'Puede pasar. El descanso semanal remunerado se paga en función de los días efectivamente trabajados en la semana, así que las inasistencias injustificadas reducen proporcionalmente ese pago. Es un efecto adicional al descuento del día en sí, y por eso una falta suele "costar" un poco más de una remuneración diaria.',
    },
    {
      q: '¿Quién me paga el descanso médico?',
      a: `Los primeros ${DIAS_A_CARGO_EMPLEADOR} días de incapacidad del año calendario los paga el empleador, y desde el día ${DIAS_A_CARGO_EMPLEADOR + 1} el subsidio corre por cuenta de EsSalud. El detalle que casi nadie tiene en cuenta: esos 20 días son acumulados en el año, no por cada certificado. Si ya usaste 12 días en enero, del descanso de agosto el empleador solo cubre 8.`,
    },
    {
      q: '¿Sobre qué remuneración se calcula el subsidio de EsSalud?',
      a: 'Sobre el promedio diario de las últimas 12 remuneraciones anteriores al mes en que empezó la incapacidad, o de las que tengas si trabajaste menos tiempo. No se calcula sobre el sueldo del mes en curso: si acabas de recibir un aumento, el subsidio va a salir menor que tu sueldo actual. También hay que estar afiliado, con vínculo laboral vigente y con el mínimo de aportes exigido.',
    },
    {
      q: '¿Qué requisitos hay que cumplir para cobrar el subsidio?',
      a: 'Tres: contar con al menos 3 meses de aportación consecutivos —o 4 no consecutivos— dentro de los 6 meses calendario anteriores al mes de la contingencia, tener vínculo laboral vigente al momento de la incapacidad, y canjear el certificado médico por el CITT cuando el descanso supera los 20 días. Sin el CITT, EsSalud no reembolsa.',
    },
    {
      q: '¿Hasta cuántos días paga EsSalud?',
      a: `Hasta ${TOPE_DIAS_SUBSIDIO} días de incapacidad continua. Superado ese plazo, si la incapacidad persiste, el caso se evalúa para invalidez y el trámite pasa a la comisión médica correspondiente, con un régimen distinto al del subsidio temporal.`,
    },
    {
      q: '¿El descanso médico me quita días de vacaciones?',
      a: 'No los descuenta, pero puede afectar el récord vacacional: los días de incapacidad no son días efectivos de labor. La ley considera igualmente computables las inasistencias por accidente de trabajo o enfermedad profesional hasta 60 días al año, y el descanso médico por enfermedad común dentro de ciertos límites. En descansos largos conviene revisar el récord con RR. HH. antes de programar las vacaciones.',
    },
  ],

  sources: [
    {
      name: 'D. Leg. 713 — Descansos remunerados de los trabajadores de la actividad privada',
      url: 'https://www.gob.pe/institucion/mtpe/normas-legales',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    },
    {
      name: 'D.S. 003-97-TR — TUO de la Ley de Productividad y Competitividad Laboral',
      url: 'https://www.gob.pe/institucion/mtpe/normas-legales',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    },
    {
      name: 'Ley 26790 — Modernización de la Seguridad Social en Salud (subsidios)',
      url: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales',
      publisher: 'Congreso de la República',
    },
    {
      name: 'EsSalud — Subsidio por incapacidad temporal',
      url: 'https://www.essalud.gob.pe/prestaciones-economicas/',
      publisher: 'EsSalud',
    },
    {
      name: 'SUNAFIL — Jornada, descansos y feriados',
      url: 'https://www.gob.pe/sunafil',
      publisher: 'Superintendencia Nacional de Fiscalización Laboral',
    },
    {
      name: 'El Peruano — Calendario de feriados nacionales',
      url: 'https://elperuano.pe/',
      publisher: 'Diario Oficial El Peruano',
    },
  ],

  replaces: [
    '/pe/calculadora-vacaciones-peru',
    '/pe/calculadora-feriados-peru-2026-calendario',
    '/pe/calculadora-pago-feriado-trabajado-triple-peru',
    '/pe/calculadora-descuento-tardanzas-faltas-peru',
    '/pe/calculadora-subsidio-incapacidad-temporal-essalud-peru',
  ],

  lastReviewed: '2026-07-28',
};
