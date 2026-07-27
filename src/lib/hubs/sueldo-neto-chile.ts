import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me queda en mano del sueldo bruto?" (Chile)
 *
 * Los números son espejo exacto de src/lib/formulas/sueldo-neto-chile.ts:
 * cotización AFP (10% obligatorio + comisión de cada administradora), salud
 * (7% Fonasa o el plan Isapre), seguro de cesantía 0,6% del trabajador y el
 * Impuesto Único de Segunda Categoría en UTM.
 *
 * OJO: el SIS (1,49%) NO se descuenta del trabajador — lo paga el empleador.
 * Está en la fórmula original y acá se respeta igual.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UTM usada para el Impuesto Único de Segunda Categoría. Espejo de la fórmula. */
export const UTM_CL = 66_500;

/** Tope imponible mensual para AFP, salud y cesantía. Espejo de la fórmula. */
export const TOPE_IMPONIBLE_CL = 2_900_000;

/** Cotización de salud legal en Fonasa. */
export const TASA_FONASA = 7;

/** Seguro de cesantía a cargo del trabajador, contrato indefinido (Ley 19.728). */
export const TASA_CESANTIA = 0.6;

/** AFP: 10% de cotización obligatoria + comisión de cada administradora. */
export const AFP_CL: Array<{ id: string; nombre: string; obligatoria: number; comision: number }> = [
  { id: 'capital', nombre: 'Capital', obligatoria: 10, comision: 1.44 },
  { id: 'cuprum', nombre: 'Cuprum', obligatoria: 10, comision: 1.44 },
  { id: 'habitat', nombre: 'Habitat', obligatoria: 10, comision: 1.27 },
  { id: 'modelo', nombre: 'Modelo', obligatoria: 10, comision: 0.58 },
  { id: 'planvital', nombre: 'PlanVital', obligatoria: 10, comision: 1.16 },
  { id: 'provida', nombre: 'ProVida', obligatoria: 10, comision: 1.45 },
  { id: 'uno', nombre: 'Uno', obligatoria: 10, comision: 0.49 },
];

/** Impuesto Único de Segunda Categoría, en UTM mensuales. Espejo de la fórmula. */
export const IMPUESTO_UNICO_CL: Array<{ desdeUtm: number; hastaUtm: number | null; factor: number; rebajaUtm: number }> = [
  { desdeUtm: 0, hastaUtm: 13.5, factor: 0, rebajaUtm: 0 },
  { desdeUtm: 13.5, hastaUtm: 30, factor: 0.04, rebajaUtm: 0.54 },
  { desdeUtm: 30, hastaUtm: 50, factor: 0.08, rebajaUtm: 1.74 },
  { desdeUtm: 50, hastaUtm: 70, factor: 0.135, rebajaUtm: 3.49 },
  { desdeUtm: 70, hastaUtm: 90, factor: 0.23, rebajaUtm: 10.14 },
  { desdeUtm: 90, hastaUtm: 120, factor: 0.304, rebajaUtm: 16.78 },
  { desdeUtm: 120, hastaUtm: 310, factor: 0.35, rebajaUtm: 22.3 },
  { desdeUtm: 310, hastaUtm: null, factor: 0.4, rebajaUtm: 37.8 },
];

export const hub: HubData = {
  slug: 'trabajo/sueldo-neto-chile',
  title: 'Sueldo líquido en Chile: cuánto te queda en mano del bruto',
  description:
    'Calculá tu sueldo líquido en Chile con los descuentos reales: AFP (10% + comisión), salud 7% Fonasa o tu plan Isapre, seguro de cesantía 0,6% e Impuesto Único de Segunda Categoría. También al revés: cuánto bruto necesitás para un líquido.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Chile · sueldo y descuentos',
  h1: '¿Cuánto me queda en mano del sueldo bruto? (Chile)',
  lede:
    'De tu bruto salen cuatro descuentos: AFP, salud, seguro de cesantía y el Impuesto Único. Poné tu sueldo y elegí tu AFP y tu sistema de salud; si lo que tenés es el líquido y querés saber qué bruto pedir, cambiá el caso abajo.',
  stamps: [
    `UTM aplicada: $${UTM_CL.toLocaleString('es-CL')}`,
    'Tope imponible AFP, salud y cesantía',
    'Impuesto Único de Segunda Categoría',
    '3 casos en una sola página',
  ],

  resultLabel: 'Sueldo líquido estimado',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Arrancamos por el caso más común: tenés el bruto del contrato y querés saber cuánto cobrás.',
    items: [
      {
        id: 'fonasa',
        label: 'Estoy en Fonasa',
        hint: 'Cotización de salud del 7% legal, sin plan complementario.',
        yes: [
          'AFP: 10% de cotización obligatoria más la comisión de tu administradora',
          'Salud: 7% legal a Fonasa sobre la renta imponible',
          'Seguro de cesantía: 0,6% del trabajador en contrato indefinido',
          'Impuesto Único de Segunda Categoría sobre bruto menos AFP y salud',
        ],
        warn: [
          DISCLAIMER_TAX,
          'AFP, salud y cesantía se calculan sobre la renta imponible topada; lo que excede el tope no cotiza',
          'El SIS (seguro de invalidez y sobrevivencia) lo paga el empleador, no sale de tu liquidación',
        ],
        plazo: 'las cotizaciones se pagan dentro de los 10 primeros días del mes siguiente (13 si es electrónico).',
        answer:
          'En Fonasa te descuentan la AFP, un 7% de salud, un 0,6% de cesantía y, si tu renta lo alcanza, el Impuesto Único.',
      },
      {
        id: 'isapre',
        label: 'Estoy en una Isapre',
        hint: 'Tu plan puede costar más que el 7% legal: la diferencia también sale de tu líquido.',
        yes: [
          'AFP: igual que en Fonasa, 10% más comisión',
          'Salud: el precio de tu plan Isapre en vez del 7% legal',
          'Seguro de cesantía: 0,6% del trabajador',
          'Impuesto Único calculado después de descontar AFP y salud',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si tu plan cuesta más del 7%, el excedente lo pagás vos y baja tu líquido',
          'Los planes en UF se reajustan: el descuento en pesos cambia mes a mes',
        ],
        plazo: 'el precio del plan se reajusta una vez al año, en el mes de aniversario de tu contrato con la Isapre.',
        answer:
          'Con Isapre el descuento de salud es el precio del plan, no el 7%: cada punto por encima sale de tu bolsillo.',
      },
      {
        id: 'liquido-a-bruto',
        label: 'Sé el líquido que quiero y busco el bruto',
        hint: 'Para negociar sueldo o evaluar una oferta que te dieron en líquido.',
        yes: [
          'La calculadora busca el bruto que, después de todos los descuentos, deja el líquido que pediste',
          'Usa exactamente los mismos descuentos que el caso directo',
          'Sirve para comparar ofertas: una en bruto y otra en líquido',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Poné el líquido objetivo en el campo de sueldo: es el valor que la calculadora persigue',
          'Bonos, colación y movilización no imponibles cambian el resultado y no entran acá',
        ],
        plazo: 'conviene fijar el sueldo en bruto en el contrato: el líquido se mueve con la UTM y con tu plan de salud.',
        answer:
          'Para un líquido dado, el bruto necesario es bastante más alto: entre AFP, salud y cesantía ya se van cerca del 18% antes de impuestos.',
      },
    ],
  },

  inputsTitle: 'Tus datos de la liquidación',
  inputsIntro: 'Todo mensual y en pesos chilenos. En el caso "líquido a bruto", el primer campo es el líquido que querés cobrar.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo mensual (CLP)',
      prefix: '$',
      value: '1.500.000',
      thousands: true,
      help: 'Bruto imponible en los dos primeros casos; líquido objetivo en el tercero.',
    },
    {
      id: 'afp',
      label: 'Tu AFP',
      type: 'select',
      value: 'habitat',
      options: AFP_CL.map((a) => ({ value: a.id, label: `${a.nombre} — ${(a.obligatoria + a.comision).toFixed(2)}%` })),
    },
    {
      id: 'planIsapre',
      label: 'Costo de tu plan Isapre (% de la renta)',
      suffix: '%',
      type: 'number',
      value: 8.5,
      min: 7,
      max: 25,
      step: 0.1,
      help: 'Solo se usa en el caso Isapre. Si estás en Fonasa, ignoralo: se aplica el 7% legal.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va tu sueldo bruto',
    caption: 'Compara lo que te queda en mano contra cada descuento obligatorio: AFP, salud, cesantía e Impuesto Único.',
  },
  breakdownTitle: 'Descuento por descuento',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del mes.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo bruto en Chile?',
      a: 'En el caso típico, entre un 17% y un 20% antes de impuestos: 10% de cotización obligatoria de AFP, la comisión de tu administradora (entre 0,49% y 1,45% según cuál sea), un 7% de salud si estás en Fonasa y un 0,6% de seguro de cesantía. Encima de eso, si tu renta imponible supera 13,5 UTM después de AFP y salud, se suma el Impuesto Único de Segunda Categoría.',
    },
    {
      q: '¿Qué AFP me descuenta menos?',
      a: 'La cotización obligatoria del 10% es igual en todas: lo único que cambia es la comisión. Hoy las más baratas son Uno (0,49%) y Modelo (0,58%), y las más caras ProVida (1,45%), Capital y Cuprum (1,44%). Entre la más barata y la más cara hay casi un punto porcentual de tu sueldo todos los meses; en un sueldo de un millón y medio son varias decenas de miles de pesos al año.',
    },
    {
      q: '¿El SIS me lo descuentan a mí?',
      a: 'No. El Seguro de Invalidez y Sobrevivencia lo paga íntegramente el empleador, aunque se calcule sobre tu renta imponible. Por eso no aparece en el desglose de tu liquidación como descuento tuyo, y esta calculadora tampoco lo resta de tu líquido.',
    },
    {
      q: '¿Desde qué sueldo empiezo a pagar Impuesto Único?',
      a: 'El primer tramo del Impuesto Único de Segunda Categoría llega hasta 13,5 UTM y tiene tasa 0%. Como la base del impuesto es tu bruto menos AFP y menos salud, recién a partir de una renta imponible bastante mayor a esas 13,5 UTM empezás a pagar. Por debajo de ese punto tu liquidación no muestra impuesto.',
    },
    {
      q: '¿Qué es el tope imponible y a quién le pega?',
      a: 'Es un máximo de renta sobre el que se calculan AFP, salud y cesantía. Lo que ganás por encima de ese tope no cotiza, así que los descuentos previsionales dejan de crecer aunque el sueldo siga subiendo. Ojo: el Impuesto Único no tiene tope, se sigue calculando sobre toda tu renta menos AFP y salud.',
    },
    {
      q: 'Estoy en Isapre y me descuentan más del 7%. ¿Está bien?',
      a: 'Sí. El 7% es el mínimo legal de cotización de salud. Si tu plan Isapre cuesta más, esa diferencia —el "excedente"— también se descuenta de tu sueldo. Si el plan cuesta menos del 7%, el saldo queda a tu favor como excedente de cotización. Por eso dos personas con el mismo bruto pueden tener líquidos distintos.',
    },
    {
      q: '¿El seguro de cesantía es obligatorio?',
      a: 'En contrato indefinido, sí: el trabajador aporta 0,6% de su renta imponible y el empleador un 2,4% adicional. En contrato a plazo fijo o por obra el aporte lo hace solo el empleador (3%), así que ese 0,6% no aparece en tu liquidación.',
    },
    {
      q: '¿Cuánto bruto tengo que pedir para llevarme un líquido determinado?',
      a: 'Como regla gruesa, dividí el líquido que querés por 0,80 para tener una primera aproximación en sueldos bajos y medios; en sueldos altos el Impuesto Único empuja esa cifra bastante más arriba. El caso "sé el líquido que quiero" de esta página lo resuelve exacto: busca el bruto que deja justo ese líquido con tus descuentos.',
    },
    {
      q: '¿Colación y movilización se descuentan?',
      a: 'No. Las asignaciones de colación y movilización son haberes no imponibles: no pagan AFP, ni salud, ni cesantía, ni Impuesto Único, siempre que sean de un monto razonable respecto del cargo. Por eso suman al líquido sin sumar descuentos, y esta calculadora no las incluye en la base imponible.',
    },
    {
      q: '¿Por qué mi liquidación real da distinto a esta estimación?',
      a: 'Las diferencias más habituales vienen de haberes no imponibles (colación, movilización, asignación familiar), de bonos y horas extra que sí son imponibles, de descuentos voluntarios como el APV o créditos de caja de compensación, y del reajuste de la UTM, que cambia mes a mes. La calculadora estima el caso base de un sueldo fijo mensual.',
    },
    {
      q: '¿El APV me conviene para pagar menos impuesto?',
      a: 'El Ahorro Previsional Voluntario en régimen A o B tiene beneficios tributarios distintos: en el régimen B el aporte rebaja la base del Impuesto Único, así que baja el impuesto del mes pero también tu líquido, porque la plata se va a tu cuenta de ahorro. No es un descuento perdido, es ahorro tuyo; esta calculadora no lo incluye.',
    },
    {
      q: '¿Los honorarios a boleta se calculan igual?',
      a: 'No. Quien emite boleta de honorarios no tiene AFP, salud ni cesantía descontados en la liquidación: se le practica una retención sobre el bruto y luego debe cotizar de forma obligatoria en la Operación Renta. El cálculo de esta página aplica a trabajadores con contrato de trabajo dependiente.',
    },
  ],

  sources: [
    {
      name: 'Superintendencia de Pensiones — comisiones y cotizaciones del sistema de AFP',
      url: 'https://www.spensiones.cl/',
      publisher: 'Superintendencia de Pensiones de Chile',
    },
    {
      name: 'SII — Impuesto Único de Segunda Categoría, tabla mensual en UTM',
      url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2016.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — valor de la UTM',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'AFC Chile — seguro de cesantía, aportes del trabajador y del empleador',
      url: 'https://www.afc.cl/',
      publisher: 'Administradora de Fondos de Cesantía',
    },
    {
      name: 'Superintendencia de Salud — cotización legal del 7% y planes Isapre',
      url: 'https://www.supersalud.gob.cl/',
      publisher: 'Superintendencia de Salud',
    },
  ],

  replaces: ['/calculadora-sueldo-neto-chile-2026'],

  lastReviewed: '2026-07-27',
};
