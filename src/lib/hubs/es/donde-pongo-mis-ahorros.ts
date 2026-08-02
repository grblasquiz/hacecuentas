import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Dónde pongo mis ahorros?"
 *
 * Absorbe 7 calculadoras: Letras del Tesoro, bonos del Estado, cuenta
 * remunerada, fondo de emergencia, plan de pensiones, PIAS y renta vitalicia
 * para mayores de 65.
 *
 * La fiscalidad de las plusvalías se resuelve en /es/impuestos/ahorro-e-inversiones;
 * aquí sólo se aplica la escala del ahorro para dar el rendimiento neto.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER_INVERSION =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verifica costos y riesgos con una entidad o asesor habilitado.';

export const hub: HubData = {
  slug: 'es/finanzas/donde-pongo-mis-ahorros',
  title: 'Dónde poner los ahorros en España: Letras, cuentas, planes y rentas',
  description:
    'Compara dónde poner tus ahorros en España: fondo de emergencia, cuenta remunerada, Letras del Tesoro, bonos del Estado, plan de pensiones, PIAS y renta vitalicia.',
  silo: 'Finanzas',
  siloHref: '/es/finanzas',

  eyebrow: 'Guía de ahorro e inversión',
  h1: '¿Dónde pongo mis ahorros?',
  lede:
    'No todo el ahorro va al mismo sitio. Una parte tiene que estar disponible mañana por si pasa algo, otra puede ir a un plazo corto y previsible, y sólo lo que no vas a tocar en años tiene sentido inmovilizarlo a cambio de una ventaja fiscal. Antes de elegir producto conviene decidir el plazo.',
  stamps: ['Escala del ahorro del IRPF', 'Fiscalidad de cada producto', '7 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Para cuándo necesitas ese dinero?',
    intro: 'El plazo decide el producto, no al revés.',
    items: [
      {
        id: 'emergencia',
        label: 'Para mañana: fondo de emergencia',
        hint: 'Disponible al instante',
        answer:
          'El fondo de emergencia son de tres a seis meses de gastos, siempre líquidos y sin riesgo.',
        yes: [
          'Entre tres y seis meses de tus gastos fijos',
          'Disponibilidad inmediata, sin penalización por sacarlo',
          'Cuenta remunerada o depósito a la vista',
          'Más meses si tus ingresos son irregulares o eres autónomo',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'El fondo de emergencia no es una inversión: su función es no tener que vender nada con prisas ni tirar de crédito caro',
          'Meterlo en productos con penalización por rescate anula su razón de ser',
        ],
        plazo: 'debe estar disponible en menos de 48 horas.',
      },
      {
        id: 'corto',
        label: 'Para dentro de meses: Letras y cuentas',
        hint: 'Plazo corto y previsible',
        answer:
          'Para el corto plazo, las Letras del Tesoro y las cuentas remuneradas dan un rendimiento conocido sin sobresaltos.',
        yes: [
          'Letras del Tesoro a 3, 6, 9 o 12 meses, compradas en subasta',
          'Cuentas remuneradas y depósitos a plazo fijo',
          'Rendimiento conocido de antemano',
          'Los rendimientos tributan en la base del ahorro',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'Las Letras se pueden vender antes del vencimiento, pero al precio de mercado: puede haber pérdida',
          'Las cuentas remuneradas suelen tener una promoción de pocos meses y luego bajan el tipo',
          'La rentabilidad de las Letras se mueve con los tipos: la de la última subasta no garantiza la de la siguiente',
        ],
        plazo: 'las subastas del Tesoro tienen calendario publicado con meses de antelación.',
      },
      {
        id: 'medio',
        label: 'Para dentro de años: bonos del Estado',
        hint: 'Plazo medio con cupón',
        answer:
          'Los bonos y obligaciones del Estado pagan un cupón anual y devuelven el nominal al vencimiento.',
        yes: [
          'Bonos a 3 y 5 años y obligaciones a 10 o más',
          'Cupón anual conocido desde la compra',
          'Devolución del nominal al vencimiento si se mantiene hasta el final',
          'Se pueden comprar directamente en el Tesoro sin comisiones de custodia',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'Si vendes antes del vencimiento, el precio depende de los tipos: si los tipos han subido, tu bono vale menos',
          'La inflación se come parte del rendimiento real de un cupón fijo a largo plazo',
        ],
        plazo: 'el cupón se paga anualmente hasta el vencimiento.',
      },
      {
        id: 'jubilacion',
        label: 'Para la jubilación: plan, PIAS o renta vitalicia',
        hint: 'Ventaja fiscal a cambio de plazo',
        answer:
          'El plan de pensiones desgrava ahora pero tributa al rescatarlo; el PIAS y la renta vitalicia funcionan al revés.',
        yes: [
          'Plan de pensiones: reduce la base imponible del IRPF con un límite anual',
          'PIAS: sin desgravación al aportar, pero exento si se rescata como renta vitalicia tras el plazo mínimo',
          'Renta vitalicia para mayores de 65: sólo tributa una parte pequeña según la edad',
          'Exención de la ganancia por venta de bienes si se reinvierte en renta vitalicia, con límite',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'El plan de pensiones no exime de tributar: difiere el impuesto, y al rescatarlo tributa como rendimiento del trabajo, no como ahorro',
          'Rescatar todo el plan de golpe puede dispararte de tramo: casi siempre conviene rescatar en forma de renta',
          'El límite de aportación al plan individual es bajo desde las últimas reformas; el margen grande está en las aportaciones de empresa',
          'Las comisiones de estos productos se comen buena parte del rendimiento a largo plazo: míralas antes que la rentabilidad pasada',
        ],
        plazo: 'los planes de pensiones son ilíquidos salvo supuestos tasados y la ventana de los diez años.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro: 'Pon el capital que quieres colocar y el plazo real durante el que no lo vas a tocar.',
  fields: [
    { id: 'capital', label: 'Capital que quieres colocar', prefix: '€', value: '20.000', thousands: true },
    { id: 'gastosMensuales', label: 'Tus gastos fijos mensuales', prefix: '€', value: '1.500', thousands: true },
    {
      id: 'mesesFondo',
      label: 'Meses de gastos que quieres tener guardados',
      type: 'number',
      value: '6',
      min: 1,
      max: 24,
      step: 1,
    },
    {
      id: 'rentabilidad',
      label: 'Rentabilidad anual esperada del producto',
      type: 'number',
      value: 2.5,
      min: 0,
      max: 15,
      step: 0.05,
      suffix: '%',
      help: 'La de la última subasta del Tesoro o la que ofrezca tu entidad.',
    },
    { id: 'plazoMeses', label: 'Plazo en meses', type: 'number', value: '12', min: 1, max: 360, step: 1 },
    { id: 'aportacionAnual', label: 'Aportación anual al plan de pensiones', prefix: '€', value: '1.500', thousands: true },
    {
      id: 'marginal',
      label: 'Tu tipo marginal del IRPF',
      type: 'number',
      value: '30',
      min: 0,
      max: 50,
      step: 1,
      suffix: '%',
    },
    { id: 'edad', label: 'Tu edad (para la renta vitalicia)', type: 'number', value: '68', min: 18, max: 99, step: 1 },
  ],
  fineprint: DISCLAIMER_INVERSION,

  chart: {
    type: 'bars',
    title: 'Lo que rinde cada opción',
    caption:
      'Compara el rendimiento neto de impuestos de cada alternativa para el capital y el plazo que has indicado.',
  },
  breakdownTitle: 'Los números de cada opción',
  breakdownIntro:
    'Los importes son del plazo indicado salvo donde se diga. Las filas de porcentaje y meses llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto debería tener en el fondo de emergencia?',
      a: 'Entre tres y seis meses de gastos fijos, y más si tus ingresos son irregulares, eres autónomo o hay una sola fuente de ingresos en casa. No es dinero para rentabilizar: es dinero para no tener que vender nada con prisas ni recurrir a un crédito caro.',
    },
    {
      q: '¿Qué son las Letras del Tesoro y cómo se compran?',
      a: 'Deuda pública a corto plazo, de tres a doce meses, que se emite al descuento: pagas menos del nominal y cobras el nominal al vencimiento. Se pueden comprar en las subastas directamente en el Tesoro, sin comisiones de custodia, o a través de tu banco, que sí suele cobrarlas.',
    },
    {
      q: '¿Puedo perder dinero con una Letra del Tesoro?',
      a: 'Si la mantienes hasta el vencimiento, cobras el nominal y el rendimiento es el pactado. Si necesitas venderla antes, el precio depende del mercado: si los tipos han subido desde que la compraste, valdrá menos y puedes perder dinero.',
    },
    {
      q: '¿Qué diferencia hay entre una Letra y un bono?',
      a: 'El plazo y la forma de pagar. Las Letras son a menos de un año y se emiten al descuento, sin cupón. Los bonos y obligaciones son a plazos de tres años en adelante y pagan un cupón anual, devolviendo el nominal al final.',
    },
    {
      q: '¿Las cuentas remuneradas son seguras?',
      a: 'El dinero en cuenta está cubierto por el Fondo de Garantía de Depósitos hasta cien mil euros por titular y entidad. El riesgo no es de pérdida sino de tipo: la remuneración suele ser promocional durante unos meses y después cae, así que hay que revisarlas.',
    },
    {
      q: '¿Cómo tributan los intereses y las plusvalías?',
      a: 'En la base del ahorro del IRPF, con su propia escala del 19% al 28% por tramos. Los intereses llevan además una retención del 19% en el momento del cobro, que luego se regulariza en la declaración.',
    },
    {
      q: '¿Merece la pena un plan de pensiones?',
      a: 'Depende de la diferencia entre tu tipo marginal de hoy y el que tendrás al rescatarlo. Aportar desgrava a tu marginal actual, pero el rescate tributa como rendimiento del trabajo, no como ahorro. Si te jubilas con un tipo parecido o mayor, la ventaja se diluye o desaparece.',
    },
    {
      q: '¿Cómo conviene rescatar un plan de pensiones?',
      a: 'Casi nunca de golpe. Rescatar todo el capital en un año lo suma entero a tus rentas del trabajo y puede empujarte a los tramos altos. Repartirlo en forma de renta durante varios años suele ahorrar una parte muy relevante del impuesto.',
    },
    {
      q: '¿Qué es un PIAS?',
      a: 'Un Plan Individual de Ahorro Sistemático: un seguro de ahorro con aportaciones periódicas que no desgrava al aportar, pero cuyos rendimientos quedan exentos si se rescata en forma de renta vitalicia una vez cumplido el plazo mínimo. Es el reverso fiscal del plan de pensiones.',
    },
    {
      q: '¿Cómo tributa una renta vitalicia a partir de los 65?',
      a: 'Muy poco: sólo se considera rendimiento un porcentaje de cada cobro, y ese porcentaje baja cuanto mayor eres al contratarla. Además, quien vende un bien con ganancia y reinvierte el importe en una renta vitalicia puede dejar esa ganancia exenta, con un límite máximo reinvertible.',
    },
    {
      q: '¿Qué miro antes: la rentabilidad o las comisiones?',
      a: 'Las comisiones, porque son lo único seguro. En productos a largo plazo, un punto de comisión anual se lleva una parte enorme del resultado final, mientras que la rentabilidad pasada no garantiza absolutamente nada sobre la futura.',
    },
  ],

  sources: [
    {
      name: 'Tesoro Público — Letras, bonos y obligaciones del Estado',
      url: 'https://www.tesoro.es/deuda-publica',
      publisher: 'Secretaría General del Tesoro',
    },
    {
      name: 'Ley 35/2006 del IRPF — base del ahorro, planes de pensiones y rentas vitalicias',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'CNMV — guías del inversor',
      url: 'https://www.cnmv.es/portal/inversor/Guias.aspx',
      publisher: 'Comisión Nacional del Mercado de Valores',
    },
    {
      name: 'Fondo de Garantía de Depósitos de Entidades de Crédito',
      url: 'https://www.fgd.es/',
      publisher: 'Fondo de Garantía de Depósitos',
    },
    {
      name: 'Portal del Cliente Bancario — productos de ahorro',
      url: 'https://clientebancario.bde.es/pcb/es/menu-horizontal/productosservici/',
      publisher: 'Banco de España',
    },
  ],

  replaces: [
    '/calculadora-letras-tesoro-espana-3-6-12-meses-rentabilidad',
    '/calculadora-bonos-estado-espana-rentabilidad-vencimiento',
    '/calculadora-cuenta-remunerada-espana-rentabilidad-comparativa',
    '/calculadora-fondo-emergencia-espana-meses-gastos',
    '/calculadora-plan-pensiones-aportacion-deduccion-espana-2026',
    '/calculadora-pias-plan-individual-ahorro-sistematico-espana',
    '/calculadora-renta-vitalicia-mayores-65-espana-fiscalidad',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Escala de la base del ahorro. Art. 66 Ley 35/2006. */
export const ESCALA_AHORRO: Array<[number, number]> = [
  [6000, 0.19],
  [50000, 0.21],
  [200000, 0.23],
  [300000, 0.27],
  [Infinity, 0.28],
];

/** Límite de aportación anual con derecho a reducción en planes individuales. */
export const PLAN_PENSIONES = {
  limiteIndividual: 1500,
  limiteConEmpresa: 10000,
  limitePctRendimientos: 0.3,
};

/**
 * Porcentaje de la renta vitalicia que se considera rendimiento del capital,
 * según la edad al constituirla (art. 25.3 Ley 35/2006).
 */
export const RENTA_VITALICIA_PCT: Array<[number, number]> = [
  [39, 0.4],
  [49, 0.35],
  [59, 0.28],
  [65, 0.24],
  [69, 0.2],
  [Infinity, 0.08],
];

/** Límite reinvertible en renta vitalicia para dejar exenta la ganancia. */
export const LIMITE_RENTA_VITALICIA = 240000;

/** Cobertura del Fondo de Garantía de Depósitos por titular y entidad. */
export const FGD_COBERTURA = 100000;
