import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me queda líquido del sueldo bruto?"
 *
 * Espejo numérico de src/lib/formulas/sueldo-liquido-chile-2026-impuesto-segunda-categoria.ts:
 * AFP (10% obligatorio + comisión de la administradora), salud (7% Fonasa o el precio del
 * plan Isapre), seguro de cesantía 0,6% del trabajador (contrato indefinido) e Impuesto Único
 * de Segunda Categoría del Art. 43 N°1 LIR sobre la renta líquida imponible.
 *
 * UF y UTM son datos VIVOS (src/data/live/chile.json, mindicador.cl). Los topes imponibles
 * están en UF (90 UF AFP/salud, 135,2 UF cesantía) y por eso se mueven todos los días:
 * acá NUNCA se hardcodean en pesos.
 *
 * OJO: el SIS (seguro de invalidez y sobrevivencia) lo paga el empleador, no el trabajador.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos, con el mismo fallback que usa la fórmula original. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);
export const UTM_FECHA = String((clLive as any)?.utm?.fecha ?? '').slice(0, 10);

export const TASAS = {
  afpObligatorio: CHILE_2026.afpObligatorio,
  saludFonasa: CHILE_2026.saludFonasa,
  cesantia: CHILE_2026.afcTrabajadorIndefinido,
  exentoUtm: CHILE_2026.segundaCategoriaExentoUtm,
  topeAfpUf: CHILE_2026.topeImponibleAfpUf,
  topeCesantiaUf: CHILE_2026.topeImponibleCesantiaUf,
  imm: CHILE_2026.imm,
};

/** Crédito por descendiente (Art. 55 bis LIR) — espejo de la fórmula original. */
export const CREDITO_POR_HIJO = 12_996;

/** Comisiones de AFP vigentes — Superintendencia de Pensiones. */
export const AFP: Array<{ id: string; nombre: string; comision: number }> = [
  { id: 'uno', nombre: 'AFP Uno', comision: 0.49 },
  { id: 'modelo', nombre: 'Modelo', comision: 0.58 },
  { id: 'planvital', nombre: 'PlanVital', comision: 1.16 },
  { id: 'habitat', nombre: 'Habitat', comision: 1.27 },
  { id: 'capital', nombre: 'Capital', comision: 1.44 },
  { id: 'cuprum', nombre: 'Cuprum', comision: 1.44 },
  { id: 'provida', nombre: 'ProVida', comision: 1.45 },
];

/**
 * Impuesto Único de Segunda Categoría — Art. 43 N°1 LIR, tramos mensuales en UTM.
 * Espejo EXACTO de la tabla de la fórmula (factor marginal + rebaja en UTM).
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

/**
 * Asignación de zona extrema (DL 249 / Ley 20.198 y siguientes) — porcentaje sobre el sueldo
 * base para el sector público. En el sector privado es un pacto voluntario del contrato.
 * Espejo de src/lib/formulas/asignacion-zona-extrema-chile-aysen-magallanes-arica.ts.
 */
export const ZONAS_EXTREMAS: Array<{ id: string; nombre: string; pct: number }> = [
  { id: 'ninguna', nombre: 'No trabajo en zona extrema', pct: 0 },
  { id: 'arica', nombre: 'Arica y Parinacota', pct: 40 },
  { id: 'aysen', nombre: 'Aysén', pct: 70 },
  { id: 'magallanes', nombre: 'Magallanes y Antártica', pct: 90 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/trabajo/sueldo-liquido',
  title: 'Calcular sueldo líquido Chile 2026: AFP, salud y descuentos',
  description:
    'Calculá tu sueldo líquido en Chile 2026: AFP 10% más comisión, salud 7% Fonasa o Isapre, seguro de cesantía 0,6% e Impuesto Único de Segunda Categoría.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · liquidación de sueldo',
  h1: '¿Cuánto me queda líquido del sueldo bruto en Chile?',
  lede:
    'De tu bruto salen cuatro descuentos: AFP, salud, seguro de cesantía e Impuesto Único de Segunda Categoría. Pon tu sueldo, elige tu AFP y tu sistema de salud y mira el desglose peso por peso. Si lo que tienes es el líquido y quieres saber qué bruto negociar, cambia el caso más abajo.',
  stamps: [
    `UTM del mes: ${fmt(UTM)}`,
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Topes imponibles: ${TASAS.topeAfpUf} UF y ${TASAS.topeCesantiaUf} UF`,
    'Art. 43 N°1 LIR · DL 3.500 · Ley 19.728',
    '4 casos en una sola página',
  ],

  resultLabel: 'Sueldo líquido estimado',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por el caso más común: tienes el bruto del contrato y quieres saber cuánto llega a tu cuenta.',
    items: [
      {
        id: 'fonasa',
        label: 'Tengo el bruto y estoy en Fonasa',
        hint: 'Cotización de salud del 7% legal, sin plan complementario.',
        yes: [
          'AFP: 10% de cotización obligatoria más la comisión de tu administradora',
          'Salud: 7% legal a Fonasa sobre la renta imponible topada',
          'Seguro de cesantía: 0,6% del trabajador en contrato indefinido',
          'Impuesto Único de Segunda Categoría sobre el bruto menos AFP, salud y cesantía',
          'Crédito por hijo del Art. 55 bis LIR si corresponde',
        ],
        warn: [
          DISCLAIMER_TAX,
          `AFP y salud se calculan sobre la renta imponible topada en ${TASAS.topeAfpUf} UF y la cesantía en ${TASAS.topeCesantiaUf} UF: lo que excede el tope no cotiza`,
          'El SIS (seguro de invalidez y sobrevivencia) lo paga el empleador y no sale de tu liquidación',
          'Colación y movilización son haberes no imponibles: suman al líquido sin sumar descuentos y no entran en este cálculo',
        ],
        plazo:
          'las cotizaciones del mes se pagan dentro de los 10 primeros días del mes siguiente (hasta el 13 si es por vía electrónica).',
        answer:
          'En Fonasa te descuentan la AFP, un 7% de salud, un 0,6% de cesantía y, si tu renta imponible lo alcanza, el Impuesto Único.',
      },
      {
        id: 'isapre',
        label: 'Tengo el bruto y estoy en una Isapre',
        hint: 'Tu plan puede costar más que el 7% legal: la diferencia también sale de tu líquido.',
        yes: [
          'AFP: igual que en Fonasa, 10% más la comisión de la administradora',
          'Salud: el precio de tu plan Isapre en vez del 7% legal',
          'Seguro de cesantía: 0,6% del trabajador',
          'Impuesto Único calculado después de descontar AFP, salud y cesantía',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si tu plan cuesta más del 7%, el excedente lo pagas tú y baja tu líquido',
          'Los planes Isapre están pactados en UF: el descuento en pesos cambia todos los meses aunque el plan sea el mismo',
          'El precio del plan también topa en la renta imponible máxima, igual que la cotización legal',
        ],
        plazo:
          'el precio del plan se reajusta una vez al año, en el mes de aniversario de tu contrato con la Isapre.',
        answer:
          'Con Isapre el descuento de salud es el precio del plan, no el 7%: cada punto por encima del mínimo legal sale de tu bolsillo.',
      },
      {
        id: 'liquido-a-bruto',
        label: 'Sé el líquido que quiero y busco el bruto',
        hint: 'Para negociar sueldo o comparar una oferta que te dieron en líquido contra una en bruto.',
        yes: [
          'La calculadora busca el bruto que, después de todos los descuentos, deja exactamente el líquido que pediste',
          'Usa los mismos descuentos que el caso directo, con tu AFP y tu sistema de salud',
          'Sirve para comparar dos ofertas expresadas en unidades distintas',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Pon el líquido objetivo en el campo de sueldo: es el valor que la calculadora persigue',
          'Bonos, colación y movilización no imponibles cambian el resultado y no entran acá',
          'Conviene fijar el sueldo en bruto en el contrato: el líquido se mueve con la UTM y con el precio de tu plan de salud',
        ],
        plazo:
          'si estás negociando, pide el número en bruto imponible: es el único que no cambia mes a mes.',
        answer:
          'Para un líquido dado el bruto necesario es bastante mayor: entre AFP, salud y cesantía ya se va cerca del 18% antes de impuestos.',
      },
      {
        id: 'parcial',
        label: 'Trabajé un mes incompleto o quiero saber cuánto vale mi hora',
        hint: 'Ingreso a mitad de mes, finiquito, días sin goce de sueldo o valor hora para horas extra.',
        yes: [
          'Sueldo proporcional: el bruto mensual dividido en 30 días y multiplicado por los días efectivamente trabajados',
          'Valor de la hora ordinaria: bruto mensual ÷ 30 × 28 ÷ (4 × jornada semanal pactada) (Art. 32 CT)',
          'Sobre el bruto proporcional se aplican los mismos descuentos previsionales',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El mes comercial de la legislación laboral chilena tiene 30 días, aunque el calendario tenga 28 o 31',
          'Si el sueldo proporcional queda bajo el ingreso mínimo, revisa si corresponde el mínimo proporcional a los días trabajados',
          'El cálculo de la hora ordinaria es la base para las horas extra, pero el recargo del 50% se calcula aparte',
        ],
        plazo:
          'el sueldo proporcional se paga con la remuneración del mes; si es finiquito, dentro de los 10 días hábiles de la separación.',
        answer:
          'Un mes incompleto se paga sobre un mes comercial de 30 días: bruto ÷ 30 × días trabajados, y sobre eso corren los descuentos.',
      },
    ],
  },

  inputsTitle: 'Tus datos de la liquidación',
  inputsIntro:
    'Todo mensual y en pesos chilenos. En el caso "sé el líquido que quiero", el primer campo es el líquido objetivo; en el caso de mes incompleto, es el bruto del mes completo.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo mensual (CLP)',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Bruto imponible, salvo en el caso "sé el líquido que quiero", donde es el líquido objetivo.',
    },
    {
      id: 'afp',
      label: 'Tu AFP',
      type: 'select',
      value: 'habitat',
      options: AFP.map((a) => ({ value: a.id, label: `${a.nombre} — ${(10 + a.comision).toFixed(2)}%` })),
    },
    {
      id: 'planIsapre',
      label: 'Precio de tu plan Isapre (% de la renta imponible)',
      suffix: '%',
      type: 'number',
      value: 8.5,
      min: 6,
      max: 12,
      step: 0.1,
      help: 'Sólo se usa en el caso Isapre. En Fonasa se aplica el 7% legal.',
    },
    {
      id: 'hijos',
      label: 'Hijos que dan derecho a crédito (Art. 55 bis)',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Cada hijo con derecho descuenta ${fmt(CREDITO_POR_HIJO)} del impuesto del mes.`,
    },
    {
      id: 'zona',
      label: 'Asignación de zona extrema',
      type: 'select',
      value: 'ninguna',
      options: ZONAS_EXTREMAS.map((z) => ({
        value: z.id,
        label: z.pct === 0 ? z.nombre : `${z.nombre} — +${z.pct}%`,
      })),
      help: 'Porcentaje sobre el sueldo base del sector público. En el sector privado depende de lo pactado en tu contrato.',
    },
    {
      id: 'dias',
      label: 'Días trabajados del mes (mes comercial de 30)',
      type: 'number',
      value: 30,
      min: 1,
      max: 30,
      step: 1,
      help: 'Sólo se usa en el caso de mes incompleto. Déjalo en 30 para un mes completo.',
    },
    {
      id: 'jornada',
      label: 'Jornada semanal pactada (horas)',
      type: 'number',
      value: 44,
      min: 20,
      max: 45,
      step: 1,
      help: 'Base del valor hora. La jornada máxima legal viene bajando por la Ley 21.561 (44 → 42 → 40 horas).',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va tu sueldo bruto',
    caption:
      'Compara lo que llega a tu cuenta contra cada descuento obligatorio: AFP, comisión de la administradora, salud, seguro de cesantía e Impuesto Único.',
  },
  breakdownTitle: 'Descuento por descuento',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor de la liquidación.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo bruto en Chile?',
      a: 'En el caso típico, entre un 17% y un 20% antes de impuestos: 10% de cotización obligatoria de AFP, la comisión de tu administradora (hoy entre 0,49% y 1,45% según cuál sea), un 7% de salud si estás en Fonasa y un 0,6% de seguro de cesantía si tienes contrato indefinido. Sobre eso, si tu renta líquida imponible supera 13,5 UTM, se suma el Impuesto Único de Segunda Categoría, que es progresivo y llega hasta el 40%.',
    },
    {
      q: '¿Qué AFP me descuenta menos?',
      a: 'La cotización obligatoria del 10% es idéntica en todas: lo único que cambia es la comisión. Hoy las más baratas son AFP Uno (0,49%) y Modelo (0,58%), y las más caras ProVida (1,45%), Capital y Cuprum (1,44%). Entre la más barata y la más cara hay casi un punto porcentual de tu renta imponible todos los meses, lo que en un sueldo de un millón y medio son varias decenas de miles de pesos al año que no van a tu fondo sino a la administradora.',
    },
    {
      q: '¿Qué es el tope imponible y a quién le pega?',
      a: `Es la renta máxima sobre la que se calculan las cotizaciones. Está fijado en UF, así que cambia todos los días con el valor de la UF: hoy son ${TASAS.topeAfpUf} UF para AFP y salud y ${TASAS.topeCesantiaUf} UF para el seguro de cesantía. Lo que ganas por encima de ese tope no cotiza, así que los descuentos previsionales dejan de crecer aunque el sueldo siga subiendo. El Impuesto Único, en cambio, no tiene tope: se calcula sobre toda tu renta líquida imponible.`,
    },
    {
      q: '¿Desde qué sueldo empiezo a pagar Impuesto Único?',
      a: 'El primer tramo del Art. 43 N°1 de la Ley de la Renta llega hasta 13,5 UTM mensuales y tiene tasa 0%. Como la base del impuesto es tu bruto menos AFP, menos salud y menos cesantía, el sueldo bruto en el que empiezas a pagar es bastante más alto que 13,5 UTM en pesos. Y como la UTM se reajusta todos los meses, ese umbral se mueve: por eso esta página usa el valor vigente y no un número fijo.',
    },
    {
      q: '¿El SIS me lo descuentan a mí?',
      a: 'No. El Seguro de Invalidez y Sobrevivencia lo paga íntegramente el empleador, aunque se calcule sobre tu renta imponible. Por eso no aparece como descuento tuyo en la liquidación y esta calculadora tampoco lo resta de tu líquido. Sí encarece lo que le cuestas a la empresa, que es un cálculo distinto.',
    },
    {
      q: 'Estoy en Isapre y me descuentan más del 7%. ¿Está bien?',
      a: 'Sí. El 7% es el mínimo legal de cotización de salud. Si tu plan Isapre cuesta más, esa diferencia —el excedente— también se descuenta de tu sueldo. Si el plan cuesta menos del 7%, el saldo queda a tu favor como excedente de cotización. Por eso dos personas con el mismo bruto pueden llevarse líquidos distintos.',
    },
    {
      q: '¿El seguro de cesantía es obligatorio?',
      a: 'En contrato indefinido sí: el trabajador aporta 0,6% de su renta imponible y el empleador un 2,4% adicional. En contrato a plazo fijo o por obra el aporte lo hace sólo el empleador (3%), así que ese 0,6% no aparece en tu liquidación y tu líquido es algo mayor a igual bruto.',
    },
    {
      q: '¿Cuánto bruto tengo que pedir para llevarme un líquido determinado?',
      a: 'Como regla gruesa, divide el líquido que quieres por 0,80 para una primera aproximación en sueldos bajos y medios; en sueldos altos el Impuesto Único empuja esa cifra bastante más arriba, y por encima del tope imponible vuelve a aplanarse porque las cotizaciones dejan de crecer. El caso "sé el líquido que quiero" de esta página lo resuelve exacto con tus propios parámetros.',
    },
    {
      q: '¿Cómo se calcula un mes incompleto?',
      a: 'La legislación laboral chilena usa el mes comercial de 30 días. El sueldo proporcional es el bruto mensual dividido en 30 y multiplicado por los días efectivamente trabajados, sin importar si el mes calendario tuvo 28 o 31. Sobre ese bruto proporcional se aplican los mismos descuentos previsionales y tributarios que sobre un mes completo.',
    },
    {
      q: '¿Cuánto vale mi hora de trabajo?',
      a: 'El valor de la hora ordinaria sale del Art. 32 del Código del Trabajo: sueldo mensual ÷ 30 × 28 ÷ (4 × horas de la jornada semanal pactada), que equivale a dividir el sueldo por las horas ordinarias del mes. Con la Ley 21.561 la jornada máxima legal viene bajando de 45 a 40 horas de forma gradual, así que a igual sueldo el valor hora sube cada vez que baja la jornada. Ese valor hora es la base sobre la que se calcula el recargo del 50% de las horas extraordinarias.',
    },
    {
      q: '¿La asignación de zona extrema paga cotizaciones e impuesto?',
      a: 'La asignación de zona del DL 249 es un porcentaje sobre el sueldo base para el sector público, y es remuneración imponible y tributable: entra en la base de AFP, salud, cesantía e Impuesto Único. En el sector privado no existe una asignación de zona obligatoria: si la recibes, es porque está pactada en tu contrato o en un instrumento colectivo, y su tratamiento depende de cómo esté pactada.',
    },
    {
      q: '¿Por qué mi liquidación real da distinto a esta estimación?',
      a: 'Las diferencias más habituales vienen de haberes no imponibles (colación, movilización, asignación familiar), de bonos y horas extra que sí son imponibles, de descuentos voluntarios como APV o créditos de caja de compensación, y del reajuste mensual de la UTM y diario de la UF, que mueven tanto el impuesto como los topes. Esta página estima el caso base de un sueldo fijo mensual.',
    },
    {
      q: '¿Los honorarios a boleta se calculan igual?',
      a: 'No. Quien emite boleta de honorarios no tiene AFP, salud ni cesantía descontados en una liquidación: se le practica una retención sobre el bruto y luego cotiza de forma obligatoria en la Operación Renta del año siguiente. El cálculo de esta página aplica a trabajadores con contrato de trabajo dependiente.',
    },
  ],

  sources: [
    {
      name: 'SII — Impuesto Único de Segunda Categoría, tabla mensual en UTM (Art. 43 N°1 LIR)',
      url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — valores de la UTM y la UTA',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Superintendencia de Pensiones — comisiones de las AFP y topes imponibles en UF',
      url: 'https://www.spensiones.cl/',
      publisher: 'Superintendencia de Pensiones de Chile',
    },
    {
      name: 'Superintendencia de Salud — cotización legal del 7% y planes Isapre',
      url: 'https://www.supersalud.gob.cl/',
      publisher: 'Superintendencia de Salud',
    },
    {
      name: 'AFC Chile — seguro de cesantía, aportes del trabajador y del empleador (Ley 19.728)',
      url: 'https://www.afc.cl/',
      publisher: 'Administradora de Fondos de Cesantía',
    },
    {
      name: 'Dirección del Trabajo — jornada de trabajo y cálculo del valor hora (Ley 21.561)',
      url: 'https://www.dt.gob.cl/portal/1626/w3-propertyvalue-22337.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-sueldo-liquido-chile-2026-impuesto-segunda-categoria',
    '/calculadora-impuesto-renta-segunda-categoria-chile-2026-tabla',
    '/calculadora-tope-imponible-cotizaciones-chile-2026',
    '/calculadora-sueldo-proporcional-dias-trabajados-chile',
    '/calculadora-salario-por-hora-chile',
    '/calculadora-asignacion-zona-extrema-chile-aysen-magallanes-arica',
    '/trabajo/sueldo-neto-chile',
  ],

  lastReviewed: '2026-08-16',
};
