import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me tienen que pagar de más este mes?"
 *
 * Absorbe horas extra (Art. 32 CT), jornada de 42 horas (Ley 21.561), feriado
 * irrenunciable trabajado (Ley 19.973) y semana corrida (Art. 45 CT), más el
 * bono de cumplimiento, que es el caso "me pagan algo extra y quiero saber
 * cuánto llega líquido".
 *
 * Espejo numérico de:
 *  - src/lib/formulas/horas-extras-chile-recargo-50.ts
 *  - src/lib/formulas/jornada-42-horas-chile-2026-sueldo-hora.ts
 *  - src/lib/formulas/pago-feriado-irrenunciable-18-19-septiembre-chile.ts
 *  - src/lib/formulas/semana-corrida-chile.ts
 *  - src/lib/formulas/bono-cumplimiento-laboral-chile-pago-empresa.ts (REESCRITO, ver abajo)
 *
 * Las dos fórmulas de valor hora usan expresiones distintas pero equivalentes:
 * `sueldo / ((jornada/7)*30)` y el método DT `(sueldo/30*28)/(4*jornada)`.
 * Ambas dan sueldo/180 con jornada de 42 h. Acá se usa el método DT, que es el
 * que publica la Dirección del Trabajo.
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  - `bono-cumplimiento` calculaba el impuesto con `UTA_2026 = 62.868` (la UTA
 *    real es ~$859.788) y con una escala de tramos que no es la del Art. 43 N°1
 *    LIR. Acá el Impuesto Único se calcula con la UTM viva y la escala real.
 *  - `bono-cumplimiento` topaba el imponible en nada: acá se aplica el tope de
 *    90 UF del Art. 16 DL 3.500.
 *  - `pago-feriado-irrenunciable` tenía la UTM hardcodeada en $71.649. Acá sale
 *    de src/data/live/chile.json.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
export const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);
export const UTM_FECHA = String((clLive as any)?.utm?.fecha ?? '').slice(0, 10);

export const TASAS = {
  afp: CHILE_2026.afpObligatorio,
  salud: CHILE_2026.saludFonasa,
  cesantia: CHILE_2026.afcTrabajadorIndefinido,
  topeAfpUf: CHILE_2026.topeImponibleAfpUf,
  exentoUtm: CHILE_2026.segundaCategoriaExentoUtm,
  imm: CHILE_2026.imm,
};

/** Recargo mínimo legal de la hora extraordinaria — Art. 32 inc. 3 CT. */
export const RECARGO_LEGAL_PCT = 50;

/** Jornada ordinaria máxima vigente — Ley 21.561, 2ª etapa desde el 26-abr-2026. */
export const JORNADA_VIGENTE = 42;
/** Jornada anterior, para mostrar el efecto del cambio en el valor hora. */
export const JORNADA_ANTERIOR = 44;
/** Próxima etapa de la Ley 21.561. */
export const JORNADA_2028 = 40;

/**
 * Multa al empleador por infringir el feriado irrenunciable (Ley 19.973 en
 * relación con el Art. 506 CT). El escalonado por tamaño de empresa está en la
 * fórmula original; el Art. 506 lo expresa como rangos, no como valores fijos,
 * así que estos montos van como referencia y no como liquidación.
 */
export const MULTAS_FERIADO_UTM: Array<{ id: string; label: string; utm: number }> = [
  { id: 'hasta49', label: 'Hasta 49 trabajadores', utm: 5 },
  { id: '50a199', label: 'Entre 50 y 199 trabajadores', utm: 10 },
  { id: '200mas', label: '200 trabajadores o más', utm: 20 },
];

/**
 * Impuesto Único de Segunda Categoría — Art. 43 N°1 LIR, tramos mensuales en UTM.
 * Misma tabla que usa el hub de sueldo líquido (factor marginal + rebaja en UTM).
 */
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
slug: 'cl/trabajo/horas-extra-y-recargos',
  title: 'Horas extra, festivos y semana corrida en Chile: cuánto te tienen que pagar de más',
  description:
    'Calcula el valor de tu hora ordinaria con la jornada de 42 horas, las horas extra con el recargo del 50%, el feriado irrenunciable trabajado, la semana corrida por remuneración variable y cuánto te llega líquido de un bono de cumplimiento.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · Código del Trabajo',
  h1: '¿Cuánto me tienen que pagar de más este mes?',
  lede:
    'Horas extra, un festivo que te hicieron trabajar, los domingos de la semana corrida o un bono de cumplimiento: todo lo que se suma al sueldo base se calcula distinto. Elige tu caso, pon tu sueldo y mira el número exacto con el artículo que lo respalda.',
  stamps: [
    `Jornada ordinaria máxima: ${JORNADA_VIGENTE} horas semanales (Ley 21.561)`,
    `Recargo legal de la hora extra: ${RECARGO_LEGAL_PCT}%`,
    `UTM del mes: ${fmt(UTM)}`,
    'Art. 32, 45 y 106 CT · Ley 19.973',
    '5 casos en una sola página',
  ],

  resultLabel: 'Lo que te deben pagar de más',

  cases: {
    title: '¿Qué te tienen que pagar?',
    intro:
      'Partimos por el caso más común: trabajaste horas por sobre tu jornada y quieres saber cuánto valen.',
    items: [
      {
        id: 'extras',
        label: 'Hice horas extra',
        hint: 'Horas trabajadas por sobre tu jornada ordinaria pactada, con recargo mínimo del 50%.',
        yes: [
          'Valor de la hora ordinaria por el método de la Dirección del Trabajo: sueldo ÷ 30 × 28 ÷ (4 × jornada semanal)',
          `Recargo mínimo legal del ${RECARGO_LEGAL_PCT}% sobre la hora ordinaria (Art. 32 inc. 3 CT)`,
          'Comparación con lo que valía tu hora bajo la jornada de 44 horas',
          'Total del mes por la cantidad de horas extra que pongas',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Las horas extra se pactan por escrito y no pueden pasar de 2 al día (Art. 31 CT)',
          'La base del cálculo es el sueldo base más las remuneraciones fijas: bonos variables y no imponibles no entran',
          'Si tu contrato o el convenio colectivo pactan un recargo mayor al 50%, ese manda: cámbialo en el campo de recargo',
          'Trabajadores excluidos de la limitación de jornada (Art. 22 inc. 2 CT) no generan horas extra',
        ],
        plazo:
          'las horas extra se pagan junto con las remuneraciones del mes en que se prestaron (Art. 32 inc. final CT).',
        answer:
          'Con jornada de 42 horas tu hora ordinaria es el sueldo dividido en 180, y la hora extra vale un 50% más.',
      },
      {
        id: 'jornada42',
        label: 'Quiero saber cuánto subió mi hora con la jornada de 42',
        hint: 'La Ley 21.561 bajó la jornada de 44 a 42 horas: el mismo sueldo se divide en menos horas.',
        yes: [
          'Valor de la hora con la jornada de 42 horas y con la anterior de 44',
          'Cuánto subió tu hora en porcentaje por el solo cambio de jornada',
          'Efecto sobre el valor de la hora extraordinaria',
          `Proyección de la etapa siguiente: ${JORNADA_2028} horas semanales`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La reducción de jornada no puede rebajar tu sueldo mensual: trabajas menos horas por lo mismo (Ley 21.561)',
          'Si tu contrato ya pactaba menos de 42 horas, tu jornada no cambia y tu hora ya valía más',
          'Los sistemas excepcionales de distribución de jornada autorizados por la Dirección del Trabajo tienen reglas propias',
        ],
        plazo:
          'la jornada de 42 horas rige desde el 26 de abril de 2026; la de 40 horas llega en abril de 2028.',
        answer:
          'Pasar de 44 a 42 horas sube el valor de tu hora un 4,76% sin que cambie tu sueldo mensual.',
      },
      {
        id: 'feriado',
        label: 'Me hicieron trabajar un feriado irrenunciable',
        hint: 'El 18 y 19 de septiembre y el 1 de mayo son irrenunciables para el comercio (Ley 19.973).',
        yes: [
          'Esas horas exceden la jornada ordinaria y se pagan como extraordinarias con recargo del 50%',
          'Total por las horas que trabajaste ese día',
          'Referencia de la multa que arriesga el empleador por cada trabajador afectado',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La multa del Art. 506 CT se expresa en rangos según el tamaño de la empresa: el monto que ves es referencial, la Inspección del Trabajo fija el definitivo',
          'Hay actividades exceptuadas del feriado irrenunciable (clubes, restaurantes, farmacias de turno, expendio de combustible, entre otras)',
          'Si eres trabajador del comercio no exceptuado, el empleador no puede hacerte trabajar aunque te pague el recargo',
          'Denunciar es gratis y se hace en la Inspección del Trabajo que corresponde al domicilio de la empresa',
        ],
        plazo:
          'la denuncia por infracción al feriado irrenunciable puede presentarse mientras la infracción no prescriba: el plazo general es de 6 meses.',
        answer:
          'Las horas trabajadas en feriado irrenunciable se pagan como extraordinarias, es decir con recargo mínimo del 50%.',
      },
      {
        id: 'semana-corrida',
        label: 'Gano por comisión y quiero mi semana corrida',
        hint: 'Remuneración exclusiva o parcialmente variable: los domingos y festivos también se pagan.',
        yes: [
          'Promedio diario de lo que ganaste variable: total del período ÷ días efectivamente trabajados',
          'Ese promedio multiplicado por los domingos y festivos del período',
          'El resultado se suma a tu liquidación como semana corrida (Art. 45 CT)',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Solo entran al promedio los días efectivamente trabajados, no los domingos ni festivos del período',
          'Si además tienes sueldo base, la semana corrida se calcula solo sobre la parte variable',
          'Las comisiones tienen que ser devengadas día a día para entrar al promedio: un bono trimestral no entra',
          'La semana corrida es imponible y tributable, así que sobre ella también corren AFP, salud y el Impuesto Único',
        ],
        plazo:
          'se paga con la remuneración del mes; si te la deben, el plazo para reclamar en la Inspección del Trabajo es de 2 años desde que se hizo exigible.',
        answer:
          'La semana corrida es el promedio diario de tu remuneración variable multiplicado por los domingos y festivos del período.',
      },
      {
        id: 'bono',
        label: 'Me van a pagar un bono y quiero saber cuánto llega',
        hint: 'Bono de cumplimiento, de metas o de desempeño: es imponible y tributable como el sueldo.',
        yes: [
          'Bono bruto ajustado por el porcentaje de cumplimiento que lograste',
          'Descuentos previsionales sobre sueldo más bono: AFP, salud y seguro de cesantía',
          `Impuesto Único de Segunda Categoría sobre la renta imponible del mes (Art. 43 N°1 LIR), con la UTM de ${fmt(UTM)}`,
          'Cuánto del bono llega efectivamente a tu cuenta',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Un bono puede empujarte a un tramo más alto del Impuesto Único ese mes: el porcentaje que te retienen sube solo en ese mes',
          `La base imponible de AFP y salud está topada en ${TASAS.topeAfpUf} UF (hoy ${fmt(TASAS.topeAfpUf * UF)}): lo que excede no cotiza`,
          'Los bonos pactados en el contrato son exigibles; los discrecionales no',
          'Si el bono corresponde a varios meses, puedes pedir la reliquidación del impuesto en la Operación Renta',
        ],
        plazo:
          'el bono se paga en la fecha que fije el contrato o el convenio; si nada dice, con la remuneración del mes en que se devengó.',
        answer:
          'Un bono es remuneración imponible y tributable: se le descuenta AFP, salud, cesantía e Impuesto Único como al sueldo.',
      },
    ],
  },

  inputsTitle: 'Tus datos del mes',
  inputsIntro:
    'Todo en pesos chilenos. Según el caso que elijas arriba, algunos campos quedan sin efecto: en semana corrida manda el total variable y los días; en horas extra manda el sueldo base y la cantidad de horas.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo base mensual (bruto)',
      type: 'number',
      value: 900000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'El sueldo base del contrato, sin bonos ni asignaciones no imponibles.',
    },
    {
      id: 'jornada',
      label: 'Jornada semanal pactada',
      type: 'number',
      value: JORNADA_VIGENTE,
      suffix: 'h',
      min: 1,
      max: 45,
      step: 1,
      help: `El máximo legal es de ${JORNADA_VIGENTE} horas desde el 26-abr-2026. Si tu contrato pacta menos, pon las tuyas.`,
    },
    {
      id: 'horas',
      label: 'Horas extra u horas trabajadas en el feriado',
      type: 'number',
      value: 10,
      suffix: 'h',
      min: 0,
      max: 200,
      step: 1,
      help: 'En el caso de horas extra son las del mes; en feriado irrenunciable, las de ese día.',
    },
    {
      id: 'recargo',
      label: 'Recargo pactado sobre la hora ordinaria',
      type: 'number',
      value: RECARGO_LEGAL_PCT,
      suffix: '%',
      min: 0,
      max: 200,
      step: 5,
      help: `El mínimo legal es ${RECARGO_LEGAL_PCT}%. Súbelo si tu contrato o convenio pacta más.`,
    },
    {
      id: 'empresa',
      label: 'Tamaño de la empresa (para la multa del feriado)',
      type: 'select',
      value: 'hasta49',
      options: MULTAS_FERIADO_UTM.map((m) => ({ value: m.id, label: m.label })),
      help: 'Solo se usa en el caso del feriado irrenunciable.',
    },
    {
      id: 'variable',
      label: 'Total ganado por comisión o remuneración variable',
      type: 'number',
      value: 600000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'Solo para semana corrida: lo devengado variable en el período que estás calculando.',
    },
    {
      id: 'diasTrabajados',
      label: 'Días efectivamente trabajados en el período',
      type: 'number',
      value: 24,
      min: 0,
      max: 31,
      step: 1,
      help: 'Sin contar domingos ni festivos.',
    },
    {
      id: 'domingos',
      label: 'Domingos y festivos del período',
      type: 'number',
      value: 5,
      min: 0,
      max: 12,
      step: 1,
      help: 'Los días de descanso que hay que pagarte con la semana corrida.',
    },
    {
      id: 'bono',
      label: 'Bono bruto comprometido al 100% de cumplimiento',
      type: 'number',
      value: 500000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'El monto que te prometieron si cumples todas las metas.',
    },
    {
      id: 'cumplimiento',
      label: 'Porcentaje de cumplimiento logrado',
      type: 'number',
      value: 100,
      suffix: '%',
      min: 0,
      max: 150,
      step: 5,
      help: 'Puede pasar de 100% si el plan contempla sobrecumplimiento.',
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
      help: 'Se suma al 10% obligatorio. Va entre 0,49% y 1,45% según la administradora.',
    },
  ],
  fineprint:
    'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional. La UTM y la UF se actualizan a diario desde mindicador.cl (Banco Central y SII).',

  chart: {
    type: 'bars',
    title: 'De qué está hecho lo que te pagan de más',
    caption:
      'Compara el valor de tu hora ordinaria con el de la hora recargada, o el bruto del bono con lo que efectivamente llega a tu cuenta.',
  },
  breakdownTitle: 'El cálculo, línea por línea',
  breakdownIntro:
    'Cada fila indica el artículo del Código del Trabajo o de la Ley de la Renta del que sale. Los montos en UF y UTM se convierten con el valor vigente del día.',

  faq: [
    {
      q: '¿Cómo se calcula el valor de mi hora ordinaria en Chile?',
      a: 'La Dirección del Trabajo usa la fórmula sueldo mensual ÷ 30 × 28 ÷ (4 × jornada semanal). Con la jornada de 42 horas el divisor queda en 180, así que tu hora ordinaria es tu sueldo dividido en 180. Con un sueldo de $900.000 la hora ordinaria vale $5.000.',
    },
    {
      q: '¿Cuánto vale una hora extra?',
      a: 'La hora ordinaria más un recargo mínimo del 50% (Art. 32 inc. 3 del Código del Trabajo). Con un sueldo de $900.000 y jornada de 42 horas, la hora ordinaria vale $5.000 y la extra $7.500. Si el contrato o el convenio colectivo pactan un recargo mayor, se aplica ese.',
    },
    {
      q: '¿Cuántas horas extra puedo hacer al mes?',
      a: 'El Art. 31 del Código del Trabajo permite un máximo de 2 horas extraordinarias por día, y solo en faenas que no perjudiquen la salud del trabajador. Además tienen que pactarse por escrito, por períodos de hasta 3 meses renovables. No existe un tope mensual explícito, pero el tope diario limita el total.',
    },
    {
      q: '¿Mi sueldo bajó con la jornada de 42 horas?',
      a: 'No. La Ley 21.561 prohíbe expresamente que la reducción de jornada rebaje las remuneraciones. Trabajas menos horas por el mismo sueldo mensual, lo que hace que cada hora valga más: la hora ordinaria sube un 4,76% al pasar de 44 a 42 horas, y con ella sube la hora extra.',
    },
    {
      q: '¿Qué pasa si me hacen trabajar el 18 de septiembre?',
      a: 'Si eres trabajador del comercio no exceptuado, el 18 y 19 de septiembre son feriados irrenunciables (Ley 19.973) y el empleador no puede hacerte trabajar, aunque te ofrezca pagarte más. Si igual te hicieron trabajar, esas horas se pagan como extraordinarias con recargo del 50% y además puedes denunciar en la Inspección del Trabajo.',
    },
    {
      q: '¿Quién tiene derecho a semana corrida?',
      a: 'Los trabajadores con remuneración exclusivamente variable (comisiones, trato, primas) tienen derecho a que se les paguen los domingos y festivos con el promedio diario de lo devengado (Art. 45 CT). Los trabajadores con sueldo base más una parte variable también, pero solo sobre la parte variable.',
    },
    {
      q: '¿Cómo se calcula la semana corrida?',
      a: 'Se divide el total de la remuneración variable del período entre los días efectivamente trabajados y se multiplica el promedio por la cantidad de domingos y festivos del período. Los domingos y festivos no se cuentan en el divisor: si los contaras, el promedio bajaría artificialmente.',
    },
    {
      q: '¿A un bono le descuentan lo mismo que al sueldo?',
      a: 'Sí. Un bono de cumplimiento es remuneración imponible y tributable: paga AFP (10% más comisión), salud (7% o el precio del plan Isapre), seguro de cesantía (0,6% en contrato indefinido) e Impuesto Único de Segunda Categoría. Lo que cambia es que puede empujarte a un tramo más alto del impuesto solo en ese mes.',
    },
    {
      q: '¿Puedo recuperar el impuesto que me retuvieron de más por un bono grande?',
      a: 'Sí, en la Operación Renta de abril. Si el bono corresponde a un período mayor a un mes, la ley permite reliquidar el impuesto distribuyendo la renta en los meses a los que corresponde, lo que suele devolver parte de lo retenido. Se declara en el Formulario 22.',
    },
    {
      q: '¿Las horas extra pagan AFP y salud?',
      a: 'Sí. Las horas extraordinarias son remuneración imponible: entran a la base de AFP, salud y seguro de cesantía, y a la renta líquida imponible del Impuesto Único, siempre respetando el tope imponible de 90 UF.',
    },
    {
      q: '¿Qué pasa si mi empleador no me paga las horas extra?',
      a: 'Puedes denunciar en la Inspección del Trabajo, que puede cursar multa, o demandar el cobro ante el Juzgado de Letras del Trabajo. El plazo de prescripción para cobrar remuneraciones adeudadas es de 2 años desde que la obligación se hizo exigible (Art. 510 CT).',
    },
    {
      q: '¿El feriado irrenunciable aplica a todos los trabajadores?',
      a: 'No. La Ley 19.973 lo estableció para los dependientes del comercio, con excepciones expresas: clubes, restaurantes, establecimientos de entretenimiento, expendio de combustibles, farmacias de urgencia y las que atienden directamente al público en ferias y mercados, entre otras.',
    },
  ],

  sources: [
    {
      name: 'Código del Trabajo — jornada, horas extraordinarias y semana corrida (Arts. 22, 31, 32 y 45)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=207436',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Ley 21.561 — reducción de la jornada laboral a 40 horas (etapas 44 → 42 → 40)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1192750',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Dirección del Trabajo — cálculo del valor de la hora ordinaria y de la hora extraordinaria',
      url: 'https://www.dt.gob.cl/portal/1628/w3-article-95182.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'Ley 19.973 — feriados obligatorios e irrenunciables para el comercio',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=230686',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Impuesto Único de Segunda Categoría — tabla mensual vigente',
      url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2016.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Topes imponibles y valores previsionales vigentes',
      url: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9891.html',
      publisher: 'Superintendencia de Pensiones',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-horas-extras-chile-recargo-50-ley-40-horas',
    '/calculadora-jornada-42-horas-chile-2026-sueldo-hora',
    '/calculadora-pago-feriado-irrenunciable-18-19-septiembre-chile',
    '/calculadora-semana-corrida-chile-remuneracion-variable',
    // Absorbida sólo por URL en su parte de "costo para la empresa": el hub usa el
    // bono como caso del trabajador (cuánto llega líquido). La vista de nómina del
    // empleador vive en /cl/trabajo/costo-de-contratar.
    '/calculadora-bono-cumplimiento-laboral-chile-pago-empresa',
  ],

lastReviewed: '2026-07-28',
};
