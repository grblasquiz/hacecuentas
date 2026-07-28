import type { HubData } from '../types';
import { PERU_2026, SUBSIDIO_LACTANCIA_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "Tengo un hijo: ¿qué plata me corresponde?"
 *
 * Absorbe cinco calculadoras sueltas de /pe/ (maternidad, paternidad, lactancia,
 * asignación familiar y pensión de alimentos) en una sola pregunta.
 *
 * Cálculo espejado de las fórmulas vivas:
 *   src/lib/formulas/licencia-maternidad-subsidio-essalud-peru.ts
 *   src/lib/formulas/licencia-paternidad-peru.ts
 *   src/lib/formulas/subsidio-lactancia-essalud-peru.ts
 *   src/lib/formulas/asignacion-familiar-peru.ts
 *   src/lib/formulas/pension-alimentos-peru.ts
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const RMV = PERU_2026.rmv;
export const UIT = PERU_2026.uit;

/** Asignación familiar: monto fijo = 10% de la RMV, Ley 25129 y su reglamento DS 035-90-TR. */
export const ASIGNACION_FAMILIAR = PERU_2026.asignacionFamiliar;

/** Subsidio por lactancia EsSalud: S/ 820 por cada hijo nacido. */
export const LACTANCIA = SUBSIDIO_LACTANCIA_2026;

/** Descanso por maternidad: 98 días (49 pre + 49 post), Ley 26644 art. 1 mod. Ley 30367. */
export const MATERNIDAD = { diasBase: 98, diasPrenatal: 49, diasExtra: 30, divisor: 360 };

/** Licencia de paternidad en días calendario consecutivos — Ley 29409 mod. Ley 30807, art. 2. */
export const PATERNIDAD: Record<string, { dias: number; etiqueta: string; norma: string; maternidadExtra: boolean }> = {
  normal: { dias: 10, etiqueta: 'Parto natural o cesárea', norma: 'Ley 30807, art. 2.1', maternidadExtra: false },
  prematuro: { dias: 20, etiqueta: 'Nacimiento prematuro', norma: 'Ley 30807, art. 2.2.a', maternidadExtra: false },
  multiple: { dias: 20, etiqueta: 'Parto múltiple', norma: 'Ley 30807, art. 2.2.a', maternidadExtra: true },
  enfermedad: { dias: 30, etiqueta: 'Hijo con enfermedad congénita terminal o discapacidad severa', norma: 'Ley 30807, art. 2.2.b', maternidadExtra: true },
  complicaciones: { dias: 30, etiqueta: 'Complicaciones graves en la salud de la madre', norma: 'Ley 30807, art. 2.2.c', maternidadExtra: false },
};

/**
 * Pensión de alimentos. La ley NO fija porcentajes: el juez determina el monto según
 * las necesidades del alimentista y las posibilidades del obligado (art. 481 CC). Lo
 * único con número duro es el tope de descuento por planilla: 60% de los ingresos
 * libres (art. 648 inc. 6 del Código Procesal Civil). Los rangos de abajo son de la
 * práctica judicial, no de la norma, y así se declaran en el copy.
 */
export const ALIMENTOS = {
  topeLegal: 0.6,
  rangos: {
    1: { min: 0.2, max: 0.3 },
    2: { min: 0.35, max: 0.45 },
    3: { min: 0.45, max: 0.55 },
    4: { min: 0.5, max: 0.6 },
  } as Record<number, { min: number; max: number }>,
};

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/trabajo/dinero-por-hijos',
  title: 'Tengo un hijo en Perú: qué plata me corresponde (licencias, subsidios y asignación)',
  description:
    'Licencia de maternidad y subsidio de EsSalud, licencia de paternidad, subsidio por lactancia, asignación familiar mensual y pensión de alimentos. Los cinco cálculos que aparecen cuando nace un hijo en el Perú, con los montos y días vigentes.',
  silo: 'Trabajo',
  siloHref: '/pe/trabajo',
  locale: 'pe',

  eyebrow: 'Perú · EsSalud · MTPE · Poder Judicial',
  h1: 'Tengo un hijo: ¿qué plata me corresponde?',
  lede:
    'Cuando nace un hijo se abren varias ventanillas a la vez y ninguna avisa de la otra: EsSalud paga el descanso por maternidad y el subsidio por lactancia, el empleador paga la licencia de paternidad y suma la asignación familiar todos los meses, y si los padres no viven juntos aparece la pensión de alimentos. Elige tu caso y mira qué te toca cobrar y cuándo.',
  stamps: [
    `Asignación familiar: ${sol(ASIGNACION_FAMILIAR)} al mes`,
    `Subsidio por lactancia: ${sol(LACTANCIA)} por hijo`,
    'Ley 26644 · Ley 30807 · Ley 25129 · art. 648 CPC',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que te corresponde',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Cada rama tiene un pagador distinto y un plazo distinto. La licencia de maternidad la reembolsa EsSalud, la de paternidad la paga la empresa, la asignación familiar viene en la boleta todos los meses y la pensión de alimentos la fija un juez.',
    items: [
      {
        id: 'madre',
        label: 'Soy la madre: acabo de dar a luz o estoy por hacerlo',
        hint: 'Descanso por maternidad + subsidio de lactancia · EsSalud',
        answer: `Te corresponden ${MATERNIDAD.diasBase} días de descanso (${MATERNIDAD.diasPrenatal} prenatal y ${MATERNIDAD.diasBase - MATERNIDAD.diasPrenatal} postnatal) pagados por EsSalud, más ${sol(LACTANCIA)} de subsidio por lactancia por cada hijo nacido.`,
        yes: [
          `${MATERNIDAD.diasBase} días de descanso por maternidad: ${MATERNIDAD.diasPrenatal} prenatal + ${MATERNIDAD.diasBase - MATERNIDAD.diasPrenatal} postnatal (Ley 26644, art. 1, mod. Ley 30367)`,
          `+${MATERNIDAD.diasExtra} días si el parto es múltiple o el hijo nace con discapacidad`,
          'El subsidio se calcula como el promedio de las 12 últimas remuneraciones dividido entre 360, por cada día de descanso',
          `Subsidio por lactancia de ${sol(LACTANCIA)} por cada hijo nacido: en parto múltiple se paga por cada bebé`,
          'Puedes diferir parte del descanso prenatal al postnatal avisando con anticipación al empleador',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Las gratificaciones y los conceptos extraordinarios NO entran en la base del subsidio: se calcula solo sobre remuneraciones regulares',
          'Para cobrar el subsidio por lactancia hacen falta 3 aportes mensuales consecutivos o 4 no consecutivos a EsSalud dentro de los 6 meses previos al parto, y que el titular esté acreditado y con vínculo al momento del nacimiento',
          'Si la empresa tiene menos de un año de actividad o está en deuda con EsSalud, el reembolso puede demorar: quien adelanta el pago suele ser el empleador',
        ],
        plazo: `el subsidio por lactancia se reclama dentro de los ${MATERNIDAD.diasBase} días de descanso más 6 meses desde el nacimiento; con el Certificado de Nacido Vivo en línea se activa sin formularios.`,
      },
      {
        id: 'padre',
        label: 'Soy el padre: quiero saber cuántos días de licencia tengo',
        hint: 'Licencia de paternidad · la paga el empleador',
        answer: `Son ${PATERNIDAD.normal.dias} días calendario consecutivos con goce de haber en el caso general, y hasta ${PATERNIDAD.enfermedad.dias} en los supuestos especiales.`,
        yes: [
          `${PATERNIDAD.normal.dias} días calendario consecutivos por parto natural o cesárea`,
          `${PATERNIDAD.prematuro.dias} días por nacimiento prematuro o parto múltiple`,
          `${PATERNIDAD.enfermedad.dias} días si el hijo nace con enfermedad congénita terminal o discapacidad severa, o si hay complicaciones graves en la salud de la madre`,
          'Es con goce de haber: el sueldo del mes no se reduce y no es un subsidio de EsSalud, lo paga directamente la empresa',
          'Si el hijo o la madre siguen hospitalizados, la licencia puede iniciarse desde la fecha de alta',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Son días calendario, no hábiles: los fines de semana y feriados que caen dentro se consumen igual',
          'Hay que avisar al empleador con al menos 15 días naturales de anticipación a la fecha probable de parto (DS 014-2010-TR)',
          'La licencia por adopción es otra norma: Ley 27409, 30 días naturales por menor de hasta 12 años, y ahí la falta de aviso sí hace perder el derecho',
        ],
        plazo: 'la licencia se goza desde la fecha que el trabajador indique entre el nacimiento y la fecha de alta de la madre o el hijo.',
      },
      {
        id: 'asignacion',
        label: 'Tengo hijos menores y quiero saber qué se suma a mi sueldo',
        hint: 'Asignación familiar mensual · Ley 25129',
        answer: `Un monto fijo de ${sol(ASIGNACION_FAMILIAR)} al mes, equivalente al 10% de la remuneración mínima vital, sin importar cuántos hijos tengas.`,
        yes: [
          `Monto fijo de ${sol(ASIGNACION_FAMILIAR)} mensuales: el 10% de la RMV de ${sol(RMV)}`,
          'Es un monto único: da lo mismo tener un hijo o cuatro, no se multiplica',
          'Corresponde por hijos menores de 18 años, o hasta los 24 si cursan estudios superiores o universitarios',
          `Se paga todos los meses mientras dure el vínculo laboral: ${sol(ASIGNACION_FAMILIAR * 12)} al año`,
          'Es remuneración computable: entra en la base de gratificaciones, CTS y vacaciones',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Solo aplica a trabajadores del régimen laboral de la actividad privada sujetos a un convenio colectivo o a la Ley 25129: los trabajadores del hogar y algunos regímenes especiales quedan fuera',
          'Si ambos padres trabajan en la misma empresa, cada uno tiene derecho a su propia asignación',
          'Cuando el hijo cumple 18 y no sigue estudios superiores, la asignación se corta el mes siguiente: hay que acreditar los estudios para mantenerla',
        ],
        plazo: 'se paga en la misma boleta del mes; si el empleador nunca la abonó, el reclamo por remuneraciones impagas prescribe a los 4 años del cese.',
      },
      {
        id: 'alimentos',
        label: 'Los padres no vivimos juntos: necesito estimar la pensión de alimentos',
        hint: 'Pensión de alimentos · art. 481 CC y art. 648 CPC',
        answer:
          'La ley no fija un porcentaje: el juez lo determina caso por caso. Lo único con número duro es el tope, que es el 60% de los ingresos libres del obligado.',
        yes: [
          'El juez fija el monto evaluando las necesidades del hijo y las posibilidades económicas del obligado (art. 481 del Código Civil)',
          'El descuento por planilla no puede pasar del 60% de los ingresos libres del obligado (art. 648 inc. 6 del Código Procesal Civil)',
          'La base es el ingreso disponible: el sueldo después de los descuentos obligatorios de ley (AFP u ONP y renta de quinta)',
          'La pensión no se extingue automáticamente a los 18 años si el hijo sigue estudios superiores con éxito',
          'Se puede pedir aumento o reducción cuando cambian los ingresos del obligado o las necesidades del hijo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Ningún porcentaje que veas en internet es legal: no existe una tabla oficial de porcentajes por número de hijos. Lo que se estima acá es un rango de la práctica judicial, y sirve para conversar con un abogado, no para reemplazar la sentencia',
          'El incumplimiento reiterado puede llevar a la inscripción en el REDAM y a la denuncia por omisión a la asistencia familiar, que es un delito',
          'Las remuneraciones por debajo de 5 URP son inembargables salvo justamente por deuda alimentaria: ahí sí se descuenta',
        ],
        plazo: 'la demanda de alimentos no requiere abogado en el proceso ante el juzgado de paz letrado y la pensión se devenga desde la notificación de la demanda.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Solo se usan los campos de la rama que elegiste. Puedes dejar el resto con el ejemplo cargado.',
  fields: [
    {
      id: 'sueldo',
      label: 'Tu remuneración mensual (S/)',
      type: 'number',
      prefix: 'S/',
      value: 2500,
      min: 0,
      step: 50,
      help: 'Remuneración regular promedio, sin gratificaciones. Es la base del subsidio de maternidad y del valor de la licencia de paternidad.',
    },
    {
      id: 'supuesto',
      label: '¿Cómo fue el nacimiento?',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Parto natural o cesárea, sin complicaciones' },
        { value: 'prematuro', label: 'Nacimiento prematuro' },
        { value: 'multiple', label: 'Parto múltiple (mellizos, trillizos…)' },
        { value: 'enfermedad', label: 'Hijo con enfermedad congénita terminal o discapacidad severa' },
        { value: 'complicaciones', label: 'Complicaciones graves en la salud de la madre' },
      ],
      help: 'Cambia los días de licencia de paternidad y, en parto múltiple o hijo con discapacidad, suma 30 días al descanso por maternidad.',
    },
    {
      id: 'bebes',
      label: 'Bebés nacidos en este parto',
      type: 'number',
      value: 1,
      min: 1,
      max: 5,
      step: 1,
      help: `El subsidio por lactancia se paga por cada hijo nacido: ${sol(LACTANCIA)} por bebé.`,
    },
    {
      id: 'hijosMenores',
      label: 'Hijos menores a cargo (para la asignación familiar)',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 1,
      help: 'Es informativo: la asignación familiar es un monto único, no se multiplica por hijo.',
    },
    {
      id: 'ingresoAlimentos',
      label: 'Ingreso mensual disponible del obligado (S/)',
      type: 'number',
      prefix: 'S/',
      value: 2000,
      min: 0,
      step: 50,
      help: 'El sueldo después de los descuentos obligatorios de ley (AFP u ONP y renta de quinta). Es la base sobre la que se calcula el descuento por alimentos.',
    },
    {
      id: 'hijosAlimentos',
      label: 'Hijos alimentistas',
      type: 'number',
      value: 1,
      min: 1,
      max: 8,
      step: 1,
      help: 'Cantidad de hijos comprendidos en la demanda o el acuerdo de alimentos.',
    },
    {
      id: 'pctAcuerdo',
      label: 'Porcentaje pactado o dispuesto por el juez (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      suffix: '%',
      help: 'Si ya hay sentencia o acuerdo, escribe el porcentaje y la cuenta lo respeta (con el tope del 60%). Déjalo en 0 para ver el rango orientativo.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte la plata de tu caso',
    caption:
      'Muestra de dónde sale cada sol: lo que paga EsSalud, lo que paga el empleador y lo que queda del ingreso una vez descontado lo que corresponde al hijo.',
  },
  breakdownTitle: 'El detalle, concepto por concepto',
  breakdownIntro:
    'Cada línea indica quién paga y con qué norma. Los días son días calendario salvo que se diga lo contrario.',

  faq: [
    {
      q: '¿Cuántos días de descanso por maternidad me corresponden en el Perú?',
      a: `${MATERNIDAD.diasBase} días: ${MATERNIDAD.diasPrenatal} de descanso prenatal y ${MATERNIDAD.diasBase - MATERNIDAD.diasPrenatal} de postnatal, según la Ley 26644 modificada por la Ley 30367. Si el parto es múltiple o el hijo nace con discapacidad, se suman ${MATERNIDAD.diasExtra} días más, con lo que el descanso llega a ${MATERNIDAD.diasBase + MATERNIDAD.diasExtra} días. Puedes diferir parte del prenatal al postnatal, siempre que avises al empleador con anticipación y no haya contraindicación médica.`,
    },
    {
      q: '¿Cómo calcula EsSalud el subsidio por maternidad?',
      a: `Toma la suma de las 12 últimas remuneraciones anteriores al inicio del descanso, la divide entre ${MATERNIDAD.divisor} y multiplica el resultado por cada día de descanso. En la práctica equivale a tu remuneración mensual dividida entre 30 por cada día. No entran las gratificaciones ni los conceptos extraordinarios. Si tienes menos de 12 meses de aportes, se toma el promedio de los meses efectivamente aportados.`,
    },
    {
      q: '¿La licencia de paternidad la paga EsSalud o la empresa?',
      a: `La paga la empresa. A diferencia del descanso por maternidad, que EsSalud reembolsa, la licencia de paternidad es con goce de haber a cargo del empleador: tu sueldo del mes no se toca. Son ${PATERNIDAD.normal.dias} días calendario consecutivos en el caso general, ${PATERNIDAD.prematuro.dias} por nacimiento prematuro o parto múltiple, y ${PATERNIDAD.enfermedad.dias} si el hijo tiene enfermedad congénita terminal o discapacidad severa, o si hay complicaciones graves en la salud de la madre.`,
    },
    {
      q: '¿Cuánto es el subsidio por lactancia y quién lo cobra?',
      a: `Son ${sol(LACTANCIA)} por cada hijo nacido, en un pago único, y lo cobra la madre del recién nacido aunque el asegurado titular sea el padre. En un parto de mellizos se pagan dos subsidios. El requisito es que el titular tenga 3 aportes mensuales consecutivos o 4 no consecutivos a EsSalud dentro de los 6 meses anteriores al mes del parto, y que esté acreditado y con vínculo laboral al momento del nacimiento.`,
    },
    {
      q: '¿La asignación familiar aumenta si tengo más hijos?',
      a: `No. Es un monto fijo de ${sol(ASIGNACION_FAMILIAR)} al mes, el 10% de la remuneración mínima vital, y es el mismo con un hijo que con cinco. Solo cambia si cambia la RMV. Corresponde por hijos menores de 18 años, o hasta los 24 si están cursando estudios superiores o universitarios, y hay que acreditarlo ante el empleador.`,
    },
    {
      q: '¿Qué pasa si mi empleador nunca me pagó la asignación familiar?',
      a: `Es un adeudo remunerativo y puedes reclamarlo. Se paga con carácter retroactivo desde el momento en que acreditaste la existencia del hijo, más intereses, y la acción prescribe a los cuatro años del cese. Además cuenta como remuneración computable, así que el reclamo arrastra el recálculo de gratificaciones, CTS y vacaciones de ese período. Se puede denunciar ante SUNAFIL.`,
    },
    {
      q: '¿Existe una tabla oficial de porcentajes de pensión de alimentos en el Perú?',
      a: 'No existe. Es uno de los mitos más repetidos. El Código Civil dice que el juez fija el monto en proporción a las necesidades del alimentista y a las posibilidades del obligado (art. 481), y no manda ningún porcentaje. Lo único que la ley establece con número es el tope: el descuento por planilla por alimentos no puede exceder el 60% de los ingresos libres del obligado (art. 648 inc. 6 del Código Procesal Civil). Los porcentajes que circulan son promedios de sentencias, útiles como referencia y nada más.',
    },
    {
      q: '¿Sobre qué ingreso se calcula la pensión: el bruto o el neto?',
      a: 'Sobre el ingreso disponible, es decir el sueldo una vez descontados los aportes obligatorios de ley: AFP u ONP y la retención de renta de quinta categoría. El aporte a EsSalud no se descuenta porque lo paga el empleador y no sale de tu boleta. Los jueces suelen mirar además los ingresos adicionales acreditables: gratificaciones, bonos, utilidades y hasta ingresos de actividades independientes.',
    },
    {
      q: '¿Puedo cobrar el subsidio por lactancia y el de maternidad al mismo tiempo?',
      a: 'Sí, son prestaciones independientes y acumulables. El subsidio por maternidad reemplaza tu remuneración durante el descanso; el de lactancia es un pago único por el nacimiento. Se piden por separado y tienen plazos distintos: el de lactancia se reclama hasta 6 meses después de terminado el descanso.',
    },
    {
      q: '¿La licencia de paternidad se cuenta en días hábiles?',
      a: 'No, en días calendario consecutivos. Sábados, domingos y feriados que caigan dentro del período se consumen igual. Por eso una licencia de 10 días calendario equivale, en promedio, a unos 7 días hábiles de ausencia efectiva. La licencia empieza en la fecha que el trabajador indique entre el nacimiento y el alta de la madre o del hijo.',
    },
    {
      q: '¿Qué pasa si el obligado a los alimentos no paga?',
      a: 'El juez puede ordenar el descuento directo por planilla al empleador, inscribir al deudor en el Registro de Deudores Alimentarios Morosos (REDAM) —lo que traba trámites como sacar licencias o postular a cargos públicos— y, si el incumplimiento persiste, se abre la vía penal por omisión a la asistencia familiar, que contempla pena privativa de libertad. El empleador que no cumple la orden de descuento responde solidariamente.',
    },
    {
      q: '¿La pensión de alimentos termina cuando el hijo cumple 18?',
      a: 'No automáticamente. Subsiste si el hijo mayor de edad sigue una profesión u oficio de manera exitosa, y también si tiene una discapacidad que le impide atender su subsistencia. En el resto de los casos el obligado tiene que pedir la exoneración al juzgado: el descuento no se corta solo por el cumpleaños.',
    },
  ],

  sources: [
    { name: 'EsSalud — Prestaciones económicas: subsidio por maternidad y lactancia', url: 'https://www.essalud.gob.pe/prestaciones-economicas/', publisher: 'EsSalud' },
    { name: 'gob.pe — Solicitar licencia por paternidad', url: 'https://www.gob.pe/14406-solicitar-licencia-por-paternidad', publisher: 'MTPE' },
    { name: 'Ley 30807, que modifica la Ley 29409 (licencia por paternidad)', url: 'https://busquedas.elperuano.pe/dispositivo/NL/1666491-2', publisher: 'Diario Oficial El Peruano', date: '2018-07-05' },
    { name: 'gob.pe — Asignación familiar del trabajador (Ley 25129)', url: 'https://www.gob.pe/12813-asignacion-familiar', publisher: 'MTPE' },
    { name: 'MTPE — Remuneración mínima vital vigente', url: 'https://www.gob.pe/institucion/mtpe/tema/remuneracion-minima-vital', publisher: 'Ministerio de Trabajo y Promoción del Empleo' },
    { name: 'Poder Judicial — Demanda de alimentos y REDAM', url: 'https://www.pj.gob.pe/wps/wcm/connect/cortesuperiorlimapj/s_cortes_superiores_lima/as_servicios_ciudadano/', publisher: 'Poder Judicial del Perú' },
  ],

  replaces: [
    '/pe/calculadora-licencia-maternidad-subsidio-essalud-peru',
    '/pe/calculadora-licencia-paternidad-peru',
    '/pe/calculadora-subsidio-lactancia-essalud-peru-monto-requisitos',
    '/pe/calculadora-asignacion-familiar-peru',
    '/pe/calculadora-pension-alimentos-peru',
  ],

  lastReviewed: '2026-07-28',
};
