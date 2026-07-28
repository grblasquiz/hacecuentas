import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me cuesta realmente contratar a alguien?"
 *
 * La vista del empleador: sobre el sueldo bruto se apilan el seguro de cesantía,
 * el SIS, la cotización de la Ley de Accidentes del Trabajo (mutual), la
 * cotización adicional de la reforma previsional y la gratificación legal.
 *
 * Absorbe:
 *  - src/lib/formulas/aporte-empleador-empleado-chile-total-costo-laboral.ts (CORREGIDO)
 *  - src/lib/formulas/aporte-mutual-empresa-chile-trabajador-tasa-base.ts (CORREGIDO)
 *  - src/lib/formulas/aporte-mutual-empresa-comparar-ist-asociacion-chilena.ts (CORREGIDO)
 *  - src/lib/formulas/reforma-previsional-chile-cotizacion-adicional-fapp.ts
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  1. `aporte-empleador...` prorrateaba la gratificación como sueldo × 25% ÷ 12,
 *     es decir un 2,08% mensual. El Art. 50 CT es el 25% de la remuneración del
 *     período con tope de 4,75 IMM al año: el prorrateo mensual correcto es
 *     min(sueldo × 25%, 4,75 × IMM ÷ 12). La fórmula vieja subestimaba el costo
 *     laboral en más de $190.000 al mes para un sueldo de un millón.
 *  2. Ninguna aplicaba los topes imponibles: acá el SIS y la mutual se calculan
 *     sobre la base topada en 90 UF y el seguro de cesantía sobre 135,2 UF.
 *  3. `aporte-mutual...tasa-base` topaba la cotización adicional en 2,45%. El
 *     máximo legal del Art. 15 letra b) de la Ley 16.744 y del DS 110 es 3,4%.
 *  4. `aporte-mutual...comparar-ist` prometía "ahorro" cambiando de mutualidad
 *     con ajustes de tasa de ±0,02 puntos inventados. La tasa la fija la ley y
 *     la Superintendencia de Seguridad Social por siniestralidad de la empresa,
 *     no la mutualidad: cambiarse no cambia la tasa. Ese "ahorro" no existe.
 *  5. `aporte-empleador...` citaba el Art. 162 CT para el seguro de cesantía
 *     (es la Ley 19.728) y el Art. 163 CT para la gratificación (es el Art. 50).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
export const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

export const COSTOS = {
  /** Ley 19.728 Art. 5: 2,4% del empleador en contrato indefinido. */
  afcEmpleadorIndefinido: CHILE_2026.afcEmpleadorIndefinido,
  /** Ley 19.728 Art. 5: 3% del empleador en contrato a plazo fijo o por obra. */
  afcEmpleadorPlazoFijo: CHILE_2026.afcEmpleadorPlazoFijo,
  /** Seguro de invalidez y sobrevivencia — DL 3.500 Art. 59, de cargo del empleador. */
  sis: 0.015,
  /** Tope imponible de AFP, salud, SIS y Ley 16.744, en UF. */
  topeAfpUf: CHILE_2026.topeImponibleAfpUf,
  /** Tope imponible del seguro de cesantía, en UF. */
  topeCesantiaUf: CHILE_2026.topeImponibleCesantiaUf,
  /** Máximo legal de la cotización adicional diferenciada — Ley 16.744 Art. 15 b) y DS 110. */
  mutualAdicionalMaxPct: 3.4,
  /** Tope de la cotización adicional de la reforma previsional (Ley 21.735), en régimen. */
  reformaTasaFinalPct: 7,
  imm: CHILE_2026.imm,
  gratificacionPct: CHILE_2026.gratificacionArt50.porcentaje,
  gratificacionTopeImm: CHILE_2026.gratificacionArt50.topeImmAnual,
};

/** Tope mensual de la gratificación legal prorrateada — 4,75 IMM al año ÷ 12. */
export const TOPE_GRATIFICACION_MENSUAL =
  (COSTOS.gratificacionTopeImm * COSTOS.imm) / 12;

/**
 * DATO NO VERIFICADO CONTRA FUENTE OFICIAL EN ESTE REPO.
 * La cotización básica de la Ley 16.744 es del 0,90% (Art. 15 letra a). A eso se
 * suma la cotización extraordinaria del seguro SANNA (Ley 21.063), que la
 * Superintendencia de Seguridad Social fija por circular. Las dos fórmulas
 * originales usaban 0,95% como total base y ese es el valor por defecto acá,
 * pero el campo es EDITABLE: confirmá el porcentaje vigente en la circular de la
 * SUSESO antes de usarlo para presupuestar.
 */
export const MUTUAL_BASE_PCT_DEFAULT = 0.95;
export const MUTUAL_BASE_FUENTE = 'Ley 16.744 Art. 15 a) + Ley 21.063 (SANNA) — verificar circular vigente de la SUSESO';

/**
 * DATO NO VERIFICADO CONTRA FUENTE OFICIAL EN ESTE REPO.
 * La Ley 21.735 sube la cotización adicional de cargo del empleador de forma
 * gradual hasta el 7%. El valor por defecto (1%) es el que traía la fórmula
 * original. El calendario de gradualidad no está en src/lib/data/chile-2026.ts:
 * el campo es EDITABLE y hay que confirmar el porcentaje vigente del mes con la
 * Superintendencia de Pensiones.
 */
export const REFORMA_TASA_PCT_DEFAULT = 1;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/trabajo/costo-de-contratar',
  title: 'Costo laboral en Chile: cuánto le cuesta a la empresa un sueldo bruto',
  description:
    'Calcula el costo real de contratar en Chile: seguro de cesantía del empleador, SIS, cotización de la Ley de Accidentes del Trabajo, cotización adicional de la reforma previsional y gratificación legal, todo con los topes imponibles en UF vigentes.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · costo laboral del empleador',
  h1: '¿Cuánto me cuesta realmente contratar a alguien?',
  lede:
    'El sueldo bruto no es lo que sale de la caja. Encima hay que sumar el seguro de cesantía, el SIS, la cotización de la mutual, la cotización adicional de la reforma previsional y la gratificación legal. Pon el bruto y el rubro de la empresa y mira el costo mensual y anual completo.',
  stamps: [
    `Tope imponible: ${COSTOS.topeAfpUf} UF (hoy ${fmt(COSTOS.topeAfpUf * UF)})`,
    `Tope de cesantía: ${COSTOS.topeCesantiaUf} UF`,
    `Gratificación tope: ${fmt(TOPE_GRATIFICACION_MENSUAL)} al mes`,
    'Ley 19.728 · Ley 16.744 · DL 3.500 · Ley 21.735',
    '4 casos en una sola página',
  ],

  resultLabel: 'Costo laboral mensual',

  cases: {
    title: '¿Qué situación estás presupuestando?',
    intro:
      'Partimos por el caso más común: un trabajador con contrato indefinido y gratificación legal del Art. 50.',
    items: [
      {
        id: 'indefinido',
        label: 'Contrato indefinido',
        hint: 'El caso estándar: el empleador aporta 2,4% de cesantía y el trabajador 0,6%.',
        yes: [
          'Seguro de cesantía del empleador: 2,4% sobre la base topada en 135,2 UF (Ley 19.728)',
          'SIS: 1,5% sobre la base topada en 90 UF, de cargo exclusivo del empleador (DL 3.500 Art. 59)',
          'Cotización de la Ley 16.744: la básica más la adicional diferenciada de tu empresa',
          'Cotización adicional de la reforma previsional (Ley 21.735)',
          'Gratificación legal del Art. 50 prorrateada con su tope real de 4,75 IMM al año',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El 10% de AFP y el 7% de salud NO son costo del empleador: salen del bruto del trabajador',
          `Las cotizaciones se calculan sobre la base topada: ${COSTOS.topeAfpUf} UF para SIS y mutual, ${COSTOS.topeCesantiaUf} UF para cesantía`,
          'La cotización adicional de la Ley 16.744 la fija la Superintendencia de Seguridad Social por la siniestralidad de tu empresa, no la eliges',
          'Este cálculo no incluye colación, movilización, seguro complementario ni otros beneficios pactados',
        ],
        plazo:
          'las cotizaciones del mes se declaran y pagan dentro de los 10 primeros días del mes siguiente (hasta el 13 por vía electrónica).',
        answer:
          'Sobre el bruto de un contrato indefinido el empleador suma cesantía, SIS, mutual, la cotización de la reforma y la gratificación legal.',
      },
      {
        id: 'plazo-fijo',
        label: 'Contrato a plazo fijo o por obra',
        hint: 'El empleador aporta 3% de cesantía y el trabajador no cotiza nada.',
        yes: [
          'Seguro de cesantía del empleador: 3% en lugar del 2,4% (Ley 19.728 Art. 5)',
          'El trabajador no aporta el 0,6%: todo el seguro es de cargo del empleador',
          'El resto de las cotizaciones patronales es idéntico al contrato indefinido',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La totalidad del 3% va a la cuenta individual del trabajador: no hay aporte al Fondo de Cesantía Solidario',
          'Un contrato a plazo fijo que se renueva por segunda vez se transforma en indefinido (Art. 159 N°4 CT)',
          'El trabajador con contrato a plazo fijo no tiene derecho a indemnización por años de servicio si el contrato vence',
          'La cotización adicional de la mutual es la misma: no depende del tipo de contrato',
        ],
        plazo:
          'el contrato a plazo fijo no puede pasar de un año, o dos si el trabajador tiene título profesional o técnico.',
        answer:
          'A plazo fijo el empleador paga 3% de cesantía en lugar de 2,4%, y el trabajador no aporta nada al seguro.',
      },
      {
        id: 'mutual',
        label: 'Solo quiero saber lo que pago a la mutual',
        hint: 'Cotización básica más la adicional diferenciada por riesgo de la actividad.',
        yes: [
          'Cotización básica de la Ley 16.744 sobre la base imponible topada',
          'Cotización adicional diferenciada, con el máximo legal del 3,4%',
          'Costo por trabajador y costo total de la nómina, mensual y anual',
          'Cuánto representa sobre la masa salarial total',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Cambiarse de mutualidad NO baja la tasa: la fija la ley y la Superintendencia de Seguridad Social según la siniestralidad de la empresa, y es la misma en ACHS, IST o Mutual de Seguridad',
          `El máximo legal de la cotización adicional es ${COSTOS.mutualAdicionalMaxPct}% (Art. 15 letra b Ley 16.744 y DS 110)`,
          'Lo que sí baja la tasa es reducir la siniestralidad: la adicional se recalcula cada dos años según los accidentes y enfermedades del período',
          `La cotización básica por defecto de este hub (${MUTUAL_BASE_PCT_DEFAULT}%) es editable: confirmá el porcentaje vigente en la circular de la SUSESO`,
        ],
        plazo:
          'la cotización adicional diferenciada se revisa cada dos años, con efecto desde el 1 de enero del año siguiente a la evaluación.',
        answer:
          'La cotización de la Ley de Accidentes es la básica más la adicional por siniestralidad, con tope legal de 3,4%.',
      },
      {
        id: 'reforma',
        label: 'Cuánto me suma la cotización de la reforma previsional',
        hint: 'La Ley 21.735 agrega una cotización de cargo del empleador que sube por etapas hasta el 7%.',
        yes: [
          'La cotización adicional del mes sobre la base imponible topada en 90 UF',
          'Cuánto será cuando la gradualidad llegue al 7%',
          'El costo anual de la cotización y la diferencia entre hoy y el régimen final',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Esta cotización la paga el empleador: no sale del bolsillo del trabajador ni reemplaza su 10% de AFP',
          'El porcentaje sube por etapas: el valor por defecto de este hub es editable y hay que confirmarlo con la Superintendencia de Pensiones',
          `La base está topada en ${COSTOS.topeAfpUf} UF, igual que la cotización obligatoria`,
          'Parte de esta cotización financia el Seguro Social previsional y parte va a la cuenta individual del trabajador',
        ],
        plazo:
          'se declara y paga junto con el resto de las cotizaciones previsionales del mes.',
        answer:
          `La cotización adicional de la reforma es de cargo del empleador y sube gradualmente hasta el ${COSTOS.reformaTasaFinalPct}% de la remuneración imponible.`,
      },
    ],
  },

  inputsTitle: 'Datos de la contratación',
  inputsIntro:
    'El sueldo bruto es el que va en el contrato. Las tasas de mutual y de la reforma previsional son editables porque dependen de tu empresa y del mes: revisa la nota de cada campo.',
  fields: [
    {
      id: 'bruto',
      label: 'Sueldo bruto mensual',
      type: 'number',
      value: 1000000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'La remuneración imponible pactada, antes de descuentos del trabajador.',
    },
    {
      id: 'trabajadores',
      label: 'Cantidad de trabajadores con ese sueldo',
      type: 'number',
      value: 1,
      min: 1,
      max: 5000,
      step: 1,
      help: 'Para proyectar el costo de toda la nómina.',
    },
    {
      id: 'mutualBase',
      label: 'Cotización básica de la Ley 16.744',
      type: 'number',
      value: MUTUAL_BASE_PCT_DEFAULT,
      suffix: '%',
      min: 0,
      max: 2,
      step: 0.01,
      help: `${MUTUAL_BASE_FUENTE}. Valor por defecto tomado de las calculadoras originales.`,
    },
    {
      id: 'mutualAdicional',
      label: 'Cotización adicional diferenciada de tu empresa',
      type: 'number',
      value: 1.7,
      suffix: '%',
      min: 0,
      max: COSTOS.mutualAdicionalMaxPct,
      step: 0.05,
      help: `Sale de la resolución de la SUSESO para tu empresa. Máximo legal ${COSTOS.mutualAdicionalMaxPct}%.`,
    },
    {
      id: 'reformaTasa',
      label: 'Cotización adicional de la reforma previsional',
      type: 'number',
      value: REFORMA_TASA_PCT_DEFAULT,
      suffix: '%',
      min: 0,
      max: COSTOS.reformaTasaFinalPct,
      step: 0.5,
      help: `Sube por etapas hasta ${COSTOS.reformaTasaFinalPct}% (Ley 21.735). Confirma el porcentaje vigente del mes.`,
    },
    {
      id: 'gratificacion',
      label: '¿Pagas gratificación legal?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, por el Art. 50 (25% con tope de 4,75 IMM)' },
        { value: 'no', label: 'No, la empresa no tuvo utilidades líquidas' },
      ],
      help: 'La gratificación es obligatoria para las empresas con fines de lucro que obtengan utilidades líquidas.',
    },
  ],
  fineprint:
    'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional. La UF se actualiza a diario desde mindicador.cl y los topes imponibles se expresan en UF, así que el costo en pesos cambia todos los días.',

  chart: {
    type: 'donut',
    title: 'De qué está hecho el costo laboral',
    caption:
      'Muestra cuánto del costo mensual es sueldo bruto y cuánto son cotizaciones patronales y gratificación legal.',
  },
  breakdownTitle: 'El costo, línea por línea',
  breakdownIntro:
    'Cada fila indica la ley que la obliga y la base sobre la que se calcula. Los topes imponibles están en UF, así que se recalculan con el valor del día.',

  faq: [
    {
      q: '¿Cuánto más que el sueldo bruto cuesta un trabajador en Chile?',
      a: 'Depende del contrato y del rubro, pero el orden de magnitud es entre un 25% y un 35% sobre el bruto cuando hay gratificación legal: alrededor de 2,4% a 3% de seguro de cesantía, 1,5% de SIS, entre 0,95% y 4,35% de Ley de Accidentes, la cotización adicional de la reforma previsional y hasta un 25% de gratificación con su tope.',
    },
    {
      q: '¿El 10% de AFP lo paga la empresa?',
      a: 'No. El 10% de cotización obligatoria y el 7% de salud salen del sueldo bruto del trabajador, no son costo adicional del empleador. Lo que sí paga la empresa por encima del bruto es el SIS (1,5%), el seguro de cesantía, la cotización de la Ley 16.744 y la cotización adicional de la reforma previsional.',
    },
    {
      q: '¿Cuánto paga el empleador de seguro de cesantía?',
      a: 'El 2,4% de la remuneración imponible en contrato indefinido y el 3% en contrato a plazo fijo o por obra (Ley 19.728 Art. 5). En el indefinido el trabajador aporta además un 0,6%; en el plazo fijo el trabajador no aporta nada. La base está topada en 135,2 UF.',
    },
    {
      q: '¿Cuánto se paga a la mutual y quién fija la tasa?',
      a: 'La cotización de la Ley 16.744 tiene una parte básica y una adicional diferenciada que va de 0% a 3,4% según la siniestralidad de la empresa. La fija la Superintendencia de Seguridad Social por resolución, no la mutualidad: por eso cambiarse de ACHS a IST o a Mutual de Seguridad no baja la tasa.',
    },
    {
      q: '¿Me conviene cambiarme de mutualidad para pagar menos?',
      a: 'No para pagar menos: la tasa es la misma en las tres mutualidades porque la determina la ley y la resolución de la SUSESO. Lo que sí cambia entre mutualidades es la red de prestadores, la cobertura territorial y los programas de prevención. Para bajar la tasa hay que bajar la siniestralidad, que se reevalúa cada dos años.',
    },
    {
      q: '¿Cuánto suma la gratificación legal al costo mensual?',
      a: `Hasta ${fmt(TOPE_GRATIFICACION_MENSUAL)} por trabajador y por mes. La gratificación del Art. 50 es el 25% de lo devengado con tope de 4,75 ingresos mínimos al año, así que para sueldos altos el costo se congela en ese tope, mientras que para sueldos bajos es el 25% completo.`,
    },
    {
      q: '¿Qué es la cotización adicional de la reforma previsional?',
      a: 'Es una cotización de cargo del empleador introducida por la Ley 21.735, que sube gradualmente hasta el 7% de la remuneración imponible. Parte financia el nuevo Seguro Social previsional y parte se abona a la cuenta individual del trabajador. No sustituye al 10% que ya cotiza el trabajador.',
    },
    {
      q: '¿Los topes imponibles se aplican al costo del empleador?',
      a: 'Sí. El SIS, la cotización de la Ley 16.744 y la cotización adicional de la reforma se calculan sobre la remuneración imponible topada en 90 UF; el seguro de cesantía, sobre la topada en 135,2 UF. Sobre la parte del sueldo que excede esos topes no hay cotización.',
    },
    {
      q: '¿Contratar a honorarios sale más barato?',
      a: 'En apariencia sí, porque no hay cotizaciones patronales, pero el riesgo es alto: si la relación es de subordinación y dependencia, la Dirección del Trabajo o los tribunales pueden declarar que existía contrato de trabajo, con pago retroactivo de todas las cotizaciones, multas e indemnizaciones.',
    },
    {
      q: '¿La colación y la movilización son costo laboral?',
      a: 'Sí son costo para la empresa, pero no son remuneración imponible mientras sean de un monto razonable y prudente para el fin que persiguen, así que no generan cotizaciones. Este hub no las incluye: súmalas aparte a tu presupuesto.',
    },
    {
      q: '¿Cuándo se pagan las cotizaciones?',
      a: 'Dentro de los 10 primeros días del mes siguiente a aquel en que se devengaron las remuneraciones, o hasta el día 13 si se pagan por vía electrónica. El atraso genera reajustes, intereses y multas, y bloquea el despido por la llamada Ley Bustos (Art. 162 CT).',
    },
    {
      q: '¿La gratificación es obligatoria?',
      a: 'Sí, para las empresas con fines de lucro que lleven contabilidad y obtengan utilidades líquidas en el ejercicio. El empleador elige entre repartir el 30% de esas utilidades a prorrata (Art. 47) o pagar el 25% de lo devengado con tope de 4,75 ingresos mínimos al año (Art. 50).',
    },
  ],

  sources: [
    {
      name: 'Ley 19.728 — Seguro de Cesantía (tasas del empleador y del trabajador)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=182597',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Ley 16.744 — Seguro contra Accidentes del Trabajo y Enfermedades Profesionales (Art. 15)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=28650',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Superintendencia de Seguridad Social — cotización adicional diferenciada (DS 110)',
      url: 'https://www.suseso.cl/606/w3-propertyvalue-10364.html',
      publisher: 'SUSESO',
    },
    {
      name: 'Superintendencia de Pensiones — topes imponibles y SIS',
      url: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9891.html',
      publisher: 'Superintendencia de Pensiones',
    },
    {
      name: 'Ley 21.735 — reforma previsional y cotización adicional del empleador',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1211584',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Código del Trabajo — gratificaciones (Arts. 47 a 52)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=207436',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-aporte-empleador-empleado-chile-total-costo-laboral',
    '/calculadora-aporte-mutual-empresa-chile-trabajador-tasa-base',
    '/calculadora-aporte-mutual-empresa-comparar-ist-asociacion-chilena',
    '/calculadora-reforma-previsional-chile-cotizacion-adicional-fapp',
  ],

lastReviewed: '2026-07-28',
};
