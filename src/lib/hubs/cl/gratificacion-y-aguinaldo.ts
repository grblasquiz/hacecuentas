import type { HubData } from '../types';
import { CHILE_2026, IMM_MAYO_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánta gratificación y aguinaldo me corresponden?"
 *
 * Absorbe la gratificación legal (Arts. 47 y 50 CT), el aguinaldo de Fiestas
 * Patrias y Navidad, y el reajuste del ingreso mínimo mensual, que es el número
 * del que cuelga el tope de la gratificación.
 *
 * Espejo de:
 *  - src/lib/formulas/gratificacion-legal-chile-25-porcentaje-4-75-utm.ts (CORREGIDO)
 *  - src/lib/formulas/aguinaldo-fiestas-patrias-navidad-chile-2026.ts
 *  - src/lib/formulas/reajuste-sueldo-minimo-chile-2026-imm.ts
 *
 * CORRECCIONES respecto de la fórmula vieja de gratificación (ver reporte):
 *  1. Aplicaba un "IUSC por región" de 0,95% o 1,44% citando al SII. El Impuesto
 *     Único no varía por región y esas cifras son tasas previsionales, no
 *     tributarias. Acá la gratificación se trata como lo que es —remuneración
 *     imponible y tributable— y se le aplican las cotizaciones reales más el
 *     Impuesto Único del Art. 43 N°1 LIR con la UTM viva.
 *  2. La modalidad del Art. 47 (30% de las utilidades) le entregaba a UN
 *     trabajador el 30% completo de las utilidades de la empresa. El Art. 47
 *     reparte ese 30% entre TODOS los trabajadores a prorrata de lo devengado:
 *     acá se pide la masa salarial anual de la empresa para prorratear.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
export const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UTM_FECHA = String((clLive as any)?.utm?.fecha ?? '').slice(0, 10);

export const IMM = {
  general: IMM_MAYO_2026.general,
  anterior: IMM_MAYO_2026.anteriorGeneral,
  menores18Mayores65: IMM_MAYO_2026.menores18Mayores65,
  noRemuneracional: IMM_MAYO_2026.noRemuneracional,
  vigenciaDesde: IMM_MAYO_2026.vigenciaDesde,
  ley: IMM_MAYO_2026.ley,
};

export const TASAS = {
  afp: CHILE_2026.afpObligatorio,
  salud: CHILE_2026.saludFonasa,
  cesantia: CHILE_2026.afcTrabajadorIndefinido,
  topeAfpUf: CHILE_2026.topeImponibleAfpUf,
};

/** Gratificación legal — Art. 50 CT: 25% de lo devengado con tope de 4,75 IMM al año. */
export const GRATIFICACION = {
  porcentajeArt50: CHILE_2026.gratificacionArt50.porcentaje,
  topeImmAnual: CHILE_2026.gratificacionArt50.topeImmAnual,
  /** Art. 47 CT: 30% de las utilidades líquidas, a prorrata entre todos los trabajadores. */
  porcentajeArt47: 0.3,
};

/** Tope anual de la gratificación del Art. 50, en pesos, con el IMM vigente. */
export const TOPE_GRATIFICACION_ANUAL = GRATIFICACION.topeImmAnual * IMM.general;

/**
 * Aguinaldos del sector público y de pensionados IPS — montos fijados por la ley
 * de reajuste del sector público de cada año. Los de Navidad son referenciales
 * hasta que se publique la ley de reajuste de fin de año: por eso van como campo
 * consultable y con advertencia explícita, no como dato cerrado.
 */
export const AGUINALDOS = {
  umbralRentaPublico: 1_060_493,
  fiestasPatriasPublico: { bajo: 91_682, alto: 63_645 },
  fiestasPatriasPensionado: { base: 25_280, porCarga: 12_969 },
  navidadPublico: { bajo: 71_206, alto: 37_666, referencial: true },
};

/** Impuesto Único de Segunda Categoría — Art. 43 N°1 LIR, tramos mensuales en UTM. */
export const TRAMOS_IUSC: Array<{ hastaUtm: number | null; factor: number; rebajaUtm: number }> = [
  { hastaUtm: 13.5, factor: 0, rebajaUtm: 0 },
  { hastaUtm: 30, factor: 0.04, rebajaUtm: 0.54 },
  { hastaUtm: 50, factor: 0.08, rebajaUtm: 1.74 },
  { hastaUtm: 70, factor: 0.135, rebajaUtm: 4.49 },
  { hastaUtm: 90, factor: 0.23, rebajaUtm: 11.14 },
  { hastaUtm: 120, factor: 0.304, rebajaUtm: 17.8 },
  { hastaUtm: 310, factor: 0.35, rebajaUtm: 23.32 },
  { hastaUtm: null, factor: 0.4, rebajaUtm: 38.82 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/trabajo/gratificacion-y-aguinaldo',
  title: 'Gratificación legal y aguinaldo en Chile: cuánto te corresponde y cuál es el tope',
  description:
    'Calcula tu gratificación legal por el 25% con tope de 4,75 ingresos mínimos al año o por el 30% de las utilidades a prorrata, el aguinaldo de Fiestas Patrias y Navidad, y cómo te afecta el reajuste del sueldo mínimo.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · Arts. 47 y 50 del Código del Trabajo',
  h1: '¿Cuánta gratificación y aguinaldo me corresponden?',
  lede:
    'La gratificación legal tiene dos modalidades y las dos tienen trampa: la del 25% choca con un tope de 4,75 ingresos mínimos al año, y la del 30% de las utilidades se reparte entre todos los trabajadores, no te la llevas entera. Acá calculas las dos, ves cuál te conviene y sumas el aguinaldo si te corresponde.',
  stamps: [
    `Ingreso mínimo vigente: ${fmt(IMM.general)} (${IMM.ley})`,
    `Tope de la gratificación: 4,75 IMM al año = ${fmt(TOPE_GRATIFICACION_ANUAL)}`,
    `Tope mensual equivalente: ${fmt(TOPE_GRATIFICACION_ANUAL / 12)}`,
    `UTM del mes: ${fmt(UTM)}`,
    '4 casos en una sola página',
  ],

  resultLabel: 'Lo que te corresponde',

  cases: {
    title: '¿Qué estás calculando?',
    intro:
      'Partimos por la modalidad más común: el empleador paga el 25% de tus remuneraciones con el tope legal.',
    items: [
      {
        id: 'art50',
        label: 'Gratificación del 25% con tope (Art. 50)',
        hint: 'La modalidad que usan casi todas las empresas: 25% de lo devengado, tope 4,75 ingresos mínimos al año.',
        yes: [
          'El 25% de todo lo que devengaste en el ejercicio por remuneraciones mensuales',
          `El tope legal de 4,75 ingresos mínimos al año: ${fmt(TOPE_GRATIFICACION_ANUAL)}`,
          'El monto mensual equivalente, que es como suele aparecer en la liquidación',
          'Las cotizaciones y el Impuesto Único que se le descuentan, porque la gratificación es remuneración imponible',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `Si tu sueldo supera ${fmt(TOPE_GRATIFICACION_ANUAL / 12 / GRATIFICACION.porcentajeArt50)} mensuales, el tope te recorta: el 25% de tu remuneración ya no cabe en 4,75 IMM`,
          'El empleador elige la modalidad, no tú: puede pagar por el Art. 47 o por el Art. 50, lo que le resulte menor',
          'La gratificación es imponible y tributable: paga AFP, salud, cesantía e Impuesto Único',
          'Si trabajaste menos de un año, la gratificación es proporcional a los meses efectivamente trabajados',
        ],
        plazo:
          'la gratificación anual se paga a más tardar dentro de los 30 días siguientes a la presentación del balance al SII; el anticipo mensual, con cada remuneración.',
        answer:
          `La gratificación del Art. 50 es el 25% de lo devengado, con un tope de 4,75 ingresos mínimos al año (${fmt(TOPE_GRATIFICACION_ANUAL)}).`,
      },
      {
        id: 'art47',
        label: 'Gratificación del 30% de las utilidades (Art. 47)',
        hint: 'La empresa reparte el 30% de sus utilidades líquidas entre todos los trabajadores, a prorrata.',
        yes: [
          'El 30% de la utilidad líquida de la empresa como bolsa total a repartir',
          'Tu parte de esa bolsa, prorrateada según lo que devengaste frente a la masa salarial total',
          'Comparación directa contra lo que te tocaría por el Art. 50',
          'Sin tope de 4,75 IMM: esta modalidad no lo tiene',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El 30% no es tuyo entero: se reparte entre TODOS los trabajadores en proporción a lo devengado por cada uno en el año',
          'La utilidad líquida la determina el SII sobre el balance, deducido el 10% del capital propio del empleador',
          'Si la empresa no tuvo utilidades líquidas en el ejercicio, esta modalidad no genera pago',
          'El empleador puede elegir cualquiera de las dos modalidades: en la práctica elige la que le sale más barata',
        ],
        plazo:
          'la utilidad líquida la determina el SII y el pago se hace dentro de los 30 días siguientes a la presentación del balance.',
        answer:
          'El 30% del Art. 47 es la bolsa total de la empresa: tu parte sale de prorratear esa bolsa entre todos los trabajadores.',
      },
      {
        id: 'aguinaldo',
        label: 'Aguinaldo de Fiestas Patrias o Navidad',
        hint: 'Beneficio del sector público y de pensionados del IPS. En el sector privado es voluntario o de convenio.',
        yes: [
          'Monto según tu remuneración líquida y el umbral que fija la ley de reajuste',
          'Para pensionados del IPS, el monto base más el adicional por cada carga familiar acreditada',
          'La distinción entre el aguinaldo de Fiestas Patrias y el de Navidad',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'En el sector privado el aguinaldo NO es un derecho legal: depende del contrato, del convenio colectivo o de la costumbre de la empresa',
          'Los montos de Navidad son referenciales hasta que se publica la ley de reajuste del sector público de fin de año',
          'Para pensionados los requisitos se miden a una fecha de corte (habitualmente el 31 de agosto para Fiestas Patrias)',
          'El aguinaldo del sector público no es imponible ni tributable',
        ],
        plazo:
          'el aguinaldo de Fiestas Patrias se paga con la remuneración o pensión de septiembre; el de Navidad, con la de diciembre.',
        answer:
          'El aguinaldo del sector público tiene dos tramos según la remuneración líquida; en el sector privado depende de lo que diga tu contrato.',
      },
      {
        id: 'minimo',
        label: 'Cómo me afecta el reajuste del sueldo mínimo',
        hint: 'El ingreso mínimo mueve el tope de la gratificación y el piso de tu sueldo base.',
        yes: [
          `Cuánto tiene que subir tu sueldo si quedó bajo el ingreso mínimo de ${fmt(IMM.general)}`,
          'El retroactivo que te deben si te pagaron el valor anterior después de la entrada en vigencia',
          'El nuevo tope de la gratificación legal que resulta del reajuste',
          'Los valores diferenciados para menores de 18, mayores de 65 y fines no remuneracionales',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `El ingreso mínimo de ${fmt(IMM.general)} rige desde el ${IMM.vigenciaDesde} (${IMM.ley})`,
          'El ingreso mínimo se compara contra el sueldo base, no contra el total de la liquidación con bonos',
          'Si trabajas jornada parcial, el mínimo se aplica proporcional a las horas pactadas',
          'El valor "no remuneracional" se usa para calcular otros beneficios, no para pagar sueldos',
        ],
        plazo:
          'el reajuste tiene efecto retroactivo desde su fecha de vigencia: si te pagaron el valor anterior, la diferencia es exigible.',
        answer:
          `El ingreso mínimo es de ${fmt(IMM.general)} desde el ${IMM.vigenciaDesde}, y con él el tope de la gratificación sube a ${fmt(TOPE_GRATIFICACION_ANUAL)} al año.`,
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Según el caso que elijas arriba, algunos campos quedan sin efecto. Para el Art. 47 necesitas dos números de la empresa: la utilidad líquida y la masa salarial anual, porque el 30% se reparte a prorrata.',
  fields: [
    {
      id: 'sueldo',
      label: 'Tu remuneración mensual imponible',
      type: 'number',
      value: 900000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'Sueldo base más lo que devengues de forma habitual e imponible.',
    },
    {
      id: 'meses',
      label: 'Meses trabajados en el ejercicio',
      type: 'number',
      value: 12,
      min: 1,
      max: 12,
      step: 1,
      help: 'Si entraste a mitad de año, la gratificación es proporcional.',
    },
    {
      id: 'utilidades',
      label: 'Utilidad líquida anual de la empresa',
      type: 'number',
      value: 200000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Solo para el Art. 47. La determina el SII sobre el balance, deducido el 10% del capital propio.',
    },
    {
      id: 'planilla',
      label: 'Masa salarial anual de la empresa',
      type: 'number',
      value: 480000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Total devengado por todos los trabajadores en el año. Es el divisor del prorrateo del Art. 47.',
    },
    {
      id: 'tipoAguinaldo',
      label: 'Tipo de aguinaldo',
      type: 'select',
      value: 'fp_publico',
      options: [
        { value: 'fp_publico', label: 'Fiestas Patrias — sector público' },
        { value: 'fp_pensionado', label: 'Fiestas Patrias — pensionado IPS' },
        { value: 'navidad', label: 'Navidad — sector público (referencial)' },
      ],
    },
    {
      id: 'rentaLiquida',
      label: 'Remuneración líquida mensual',
      type: 'number',
      value: 800000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: `Define el tramo del aguinaldo. El umbral vigente es ${fmt(AGUINALDOS.umbralRentaPublico)}.`,
    },
    {
      id: 'cargas',
      label: 'Cargas familiares acreditadas',
      type: 'number',
      value: 0,
      min: 0,
      max: 12,
      step: 1,
      help: 'Solo suman en el aguinaldo de pensionados del IPS.',
    },
    {
      id: 'mesesRetro',
      label: 'Meses pagados al ingreso mínimo anterior',
      type: 'number',
      value: 0,
      min: 0,
      max: 6,
      step: 1,
      help: 'Meses posteriores a la vigencia del reajuste en que te pagaron el valor viejo.',
    },
    {
      id: 'comisionAfp',
      label: 'Comisión de tu AFP',
      type: 'number',
      value: 1.27,
      suffix: '%',
      min: 0,
      max: 3,
      step: 0.01,
      help: 'Se suma al 10% obligatorio para calcular lo que te descuentan de la gratificación.',
    },
  ],
  fineprint:
    'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional. Los montos de aguinaldo de Navidad son referenciales hasta que se publique la ley de reajuste del sector público del año.',

  chart: {
    type: 'donut',
    title: 'De la gratificación bruta a lo que llega',
    caption:
      'Muestra cuánto de la gratificación anual bruta se va en cotizaciones e Impuesto Único y cuánto queda efectivamente en tu bolsillo.',
  },
  breakdownTitle: 'El cálculo, línea por línea',
  breakdownIntro:
    'Cada fila indica el artículo del Código del Trabajo que la respalda. El tope se expresa en ingresos mínimos mensuales, así que se mueve cada vez que sube el IMM.',

  faq: [
    {
      q: '¿Cuánto es la gratificación legal en Chile?',
      a: `Depende de la modalidad. Por el Art. 50 del Código del Trabajo es el 25% de lo devengado en el ejercicio por remuneraciones mensuales, con tope de 4,75 ingresos mínimos al año, hoy ${fmt(TOPE_GRATIFICACION_ANUAL)}. Por el Art. 47 es el 30% de la utilidad líquida de la empresa, repartido entre todos los trabajadores a prorrata.`,
    },
    {
      q: '¿Desde qué sueldo me pega el tope de 4,75 ingresos mínimos?',
      a: `El tope anual es ${fmt(TOPE_GRATIFICACION_ANUAL)}, equivalente a ${fmt(TOPE_GRATIFICACION_ANUAL / 12)} mensuales. Como la gratificación es el 25% de tu remuneración, el tope empieza a recortarte cuando tu sueldo mensual imponible supera ${fmt(TOPE_GRATIFICACION_ANUAL / 12 / GRATIFICACION.porcentajeArt50)}. Desde ahí cobras siempre el mismo monto, aunque tu sueldo siga subiendo.`,
    },
    {
      q: '¿Quién elige entre el 25% y el 30%?',
      a: 'El empleador. La ley le da la opción de gratificar por el Art. 47 (30% de las utilidades a prorrata) o por el Art. 50 (25% con tope). En la práctica casi todas las empresas eligen el Art. 50, porque el tope de 4,75 ingresos mínimos suele ser mucho más barato que repartir el 30% de las utilidades.',
    },
    {
      q: '¿El 30% de las utilidades me lo llevo entero?',
      a: 'No. El Art. 47 obliga a la empresa a repartir el 30% de su utilidad líquida entre TODOS los trabajadores, en proporción a lo que cada uno devengó en el año. Si tu remuneración anual representa el 3% de la masa salarial, te toca el 3% de esa bolsa. Por eso este hub te pide también la masa salarial anual de la empresa.',
    },
    {
      q: '¿La gratificación paga AFP e impuestos?',
      a: 'Sí. La gratificación es remuneración imponible y tributable: se le descuenta el 10% de AFP más la comisión, el 7% de salud (o el precio del plan Isapre), el 0,6% de seguro de cesantía y entra a la base del Impuesto Único de Segunda Categoría del Art. 43 N°1 de la Ley de la Renta.',
    },
    {
      q: '¿Me corresponde gratificación si trabajé solo unos meses?',
      a: 'Sí, proporcional a los meses efectivamente trabajados en el ejercicio comercial. Si trabajaste 7 de los 12 meses, te corresponden 7/12 de la gratificación anual que hubieras devengado, con el tope aplicado también en proporción.',
    },
    {
      q: '¿El aguinaldo es obligatorio en el sector privado?',
      a: 'No. El aguinaldo de Fiestas Patrias y de Navidad es un beneficio legal para los trabajadores del sector público y para los pensionados del IPS, fijado cada año por la ley de reajuste. En el sector privado solo es exigible si lo pacta el contrato individual, un convenio colectivo, o si se ha pagado de forma reiterada en el tiempo (cláusula tácita).',
    },
    {
      q: '¿Cuánto es el aguinaldo de Fiestas Patrias?',
      a: `Para el sector público tiene dos tramos según la remuneración líquida, con umbral en ${fmt(AGUINALDOS.umbralRentaPublico)}: ${fmt(AGUINALDOS.fiestasPatriasPublico.bajo)} si estás bajo el umbral y ${fmt(AGUINALDOS.fiestasPatriasPublico.alto)} si lo superas. Para pensionados del IPS es un monto base de ${fmt(AGUINALDOS.fiestasPatriasPensionado.base)} más ${fmt(AGUINALDOS.fiestasPatriasPensionado.porCarga)} por cada carga familiar acreditada.`,
    },
    {
      q: '¿El aguinaldo paga impuestos?',
      a: 'El aguinaldo del sector público y el de pensionados del IPS no son imponibles ni tributables: llegan íntegros. Un aguinaldo pagado voluntariamente por una empresa privada, en cambio, sí es remuneración y paga cotizaciones e Impuesto Único.',
    },
    {
      q: '¿Cuánto subió el ingreso mínimo y desde cuándo?',
      a: `El ingreso mínimo mensual pasó de ${fmt(IMM.anterior)} a ${fmt(IMM.general)} desde el ${IMM.vigenciaDesde}, por la ${IMM.ley}. El reajuste tiene efecto retroactivo: si te pagaron el valor anterior en meses posteriores a la vigencia, la diferencia es exigible.`,
    },
    {
      q: '¿Qué pasa si mi sueldo base quedó bajo el ingreso mínimo?',
      a: 'El empleador está obligado a ajustarlo. El ingreso mínimo se compara contra el sueldo base pactado, no contra el total de la liquidación con bonos y asignaciones. Si trabajas jornada parcial, el mínimo se aplica en proporción a las horas pactadas.',
    },
    {
      q: '¿La gratificación cuenta para el finiquito?',
      a: 'Sí. La gratificación forma parte de la última remuneración mensual para efectos del cálculo de la indemnización por años de servicio, en la parte que corresponda a su proporción mensual. También entra en la base de la indemnización sustitutiva del aviso previo.',
    },
  ],

  sources: [
    {
      name: 'Código del Trabajo — gratificaciones (Arts. 47 a 52)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=207436',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Dirección del Trabajo — ingreso mínimo mensual vigente',
      url: 'https://www.dt.gob.cl/portal/1628/w3-article-60141.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'Dirección del Trabajo — dictámenes sobre gratificación legal y su tope',
      url: 'https://www.dt.gob.cl/portal/1626/w3-propertyvalue-22770.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'ChileAtiende — aguinaldo de Fiestas Patrias y de Navidad',
      url: 'https://www.chileatiende.gob.cl/fichas/3222-aguinaldo-de-fiestas-patrias',
      publisher: 'ChileAtiende / IPS',
    },
    {
      name: 'Impuesto Único de Segunda Categoría — tabla mensual vigente',
      url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2016.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-gratificacion-legal-chile-25-porcentaje-4-75-utm',
    '/calculadora-aguinaldo-fiestas-patrias-Navidad-chile-2026',
    '/calculadora-reajuste-sueldo-minimo-chile-2026-imm',
  ],

lastReviewed: '2026-07-28',
};
