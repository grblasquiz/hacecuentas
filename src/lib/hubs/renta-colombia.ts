import type { HubData } from './types';

/**
 * Hub de decisión — "Impuesto de renta en Colombia: ¿cuánto pago?"
 *
 * Números tomados de src/lib/formulas/renta-colombia-persona-natural.ts:
 * tabla del Art. 241 del Estatuto Tributario en UVT y límite del 40% del
 * Art. 336 ET. La UVT se declara acá una sola vez y viaja al compute().
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UVT vigente: $52.374 (Resolución DIAN 000238 del 15-12-2025, aplicable al año gravable 2026). */
export const UVT = 52_374;
export const UVT_ANIO = 2026;

/** Tabla del Art. 241 ET, en UVT. Espejo exacto de la fórmula. */
export const TABLA_RENTA_CO: Array<{ desde: number; hasta: number | null; tasa: number; base: number }> = [
  { desde: 0, hasta: 1090, tasa: 0, base: 0 },
  { desde: 1090, hasta: 1700, tasa: 19, base: 0 },
  { desde: 1700, hasta: 4100, tasa: 28, base: 115.9 },
  { desde: 4100, hasta: 8670, tasa: 33, base: 787.9 },
  { desde: 8670, hasta: 18970, tasa: 35, base: 2296 },
  { desde: 18970, hasta: 31000, tasa: 37, base: 5901 },
  { desde: 31000, hasta: null, tasa: 39, base: 10352 },
];

/** Tope del Art. 336 ET: deducciones + rentas exentas no pueden superar el 40% de la renta líquida. */
export const LIMITE_336 = 0.4;

export const hub: HubData = {
  slug: 'impuestos/renta-colombia',
  title: 'Impuesto de renta en Colombia: ¿cuánto pago? — Calculadora persona natural',
  description:
    'Calculá tu impuesto de renta como persona natural en Colombia con la tabla del Art. 241 del Estatuto Tributario: renta gravable en UVT, tarifa marginal, retenciones acreditadas y saldo a pagar.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Colombia · declaración de renta',
  h1: 'Impuesto de renta en Colombia: cuánto te toca pagar.',
  lede:
    'Con tu ingreso anual, tus deducciones y lo que ya te retuvieron, la calculadora arma la renta gravable en UVT, la pasa por la tabla del Art. 241 y te dice cuánto queda por pagar.',
  stamps: [`UVT ${UVT_ANIO}: $${UVT.toLocaleString('es-CO')}`, 'Art. 241 y 336 del Estatuto Tributario', 'Persona natural residente'],

  resultLabel: 'Saldo de renta a pagar',

  inputsTitle: 'Tus cifras del año gravable',
  inputsIntro: 'Todo en pesos colombianos y en valores anuales. Podés dejar el ejemplo y volver después.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso anual bruto (COP)',
      prefix: '$',
      value: '80.000.000',
      thousands: true,
      help: 'Sumá salarios, honorarios, arriendos y demás ingresos del año gravable.',
    },
    {
      id: 'deducciones',
      label: 'Deducciones anuales (COP)',
      prefix: '$',
      value: '5.000.000',
      thousands: true,
      help: 'Intereses de vivienda, medicina prepagada, dependientes, aportes obligatorios a salud y pensión.',
    },
    {
      id: 'exentas',
      label: 'Rentas exentas anuales (COP)',
      prefix: '$',
      value: '10.000.000',
      thousands: true,
      help: 'Incluye el 25% exento de rentas de trabajo y los aportes voluntarios a pensión y AFC.',
    },
    {
      id: 'retenciones',
      label: 'Retenciones en la fuente ya practicadas (COP)',
      prefix: '$',
      value: '3.000.000',
      thousands: true,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De dónde sale el impuesto',
    caption:
      'Compara la parte del ingreso que la ley deja fuera del impuesto (deducciones y rentas exentas), la renta gravable y el impuesto que sale de la tabla.',
  },
  breakdownTitle: 'Cómo se arma tu declaración',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande.',

  answer: {
    title: 'La tabla del Art. 241 grava por tramos, no todo tu ingreso.',
    copy:
      'Se aplica sobre la renta gravable expresada en UVT y solo el excedente de cada tramo tributa a la tarifa marginal más alta.',
    yes: [
      'Las primeras 1.090 UVT de renta gravable no pagan impuesto',
      'Deducciones y rentas exentas se restan, pero sin superar el 40% de la renta líquida (Art. 336 ET)',
      'Las retenciones en la fuente del año se descuentan del impuesto liquidado',
      'Si las retenciones superan el impuesto, queda un saldo a favor que se pide en devolución',
    ],
    warn: [
      DISCLAIMER_TAX,
      'Estás obligado a declarar si superás los topes anuales de ingresos, patrimonio, consumos con tarjeta o consignaciones que fija el decreto de plazos de cada año',
    ],
    plazo:
      'el vencimiento de la declaración de personas naturales depende de los dos últimos dígitos de la cédula y se escalona entre agosto y octubre.',
  },

  faq: [
    {
      q: '¿Cuál es la UVT vigente y para qué sirve?',
      a: `La UVT es la unidad con la que el Estatuto Tributario expresa topes y tramos para que se actualicen solos cada año. La vigente para el año gravable ${UVT_ANIO} es de $${UVT.toLocaleString('es-CO')}, fijada por la Resolución DIAN 000238 del 15 de diciembre de 2025. Toda la tabla del Art. 241 está escrita en UVT: primero convertís tu renta gravable a UVT, aplicás la fórmula del tramo y el resultado lo volvés a multiplicar por la UVT.`,
    },
    {
      q: '¿Desde qué monto empiezo a pagar impuesto de renta?',
      a: `El primer tramo del Art. 241 va de 0 a 1.090 UVT y tiene tarifa 0%. Con la UVT de ${UVT_ANIO} eso equivale a una renta gravable de unos $${(1090 * UVT).toLocaleString('es-CO')} al año. Por debajo de esa cifra el impuesto liquidado es cero, aunque igual puedas estar obligado a declarar.`,
    },
    {
      q: '¿Cuáles son los tramos y las tarifas?',
      a: 'Siete tramos: 0% hasta 1.090 UVT; 19% de 1.090 a 1.700; 28% de 1.700 a 4.100; 33% de 4.100 a 8.670; 35% de 8.670 a 18.970; 37% de 18.970 a 31.000; y 39% de 31.000 UVT en adelante. Cada tramo suma una base fija en UVT más el porcentaje sobre el excedente.',
    },
    {
      q: '¿Por qué mis deducciones no se restan completas?',
      a: 'Por el límite del Art. 336 del Estatuto Tributario: la suma de deducciones y rentas exentas de la cédula general no puede superar el 40% de la renta líquida. Si tus beneficios superan ese tope, la calculadora recorta el excedente igual que lo hace el formulario 210.',
    },
    {
      q: '¿La retención en la fuente es un impuesto aparte?',
      a: 'No, es un anticipo del mismo impuesto. Todo lo que te retuvieron durante el año se acredita contra el impuesto liquidado en la declaración. Por eso mucha gente que declara termina sin saldo a pagar: ya lo pagó mes a mes.',
    },
    {
      q: '¿Qué pasa si me retuvieron más de lo que debía pagar?',
      a: 'Queda un saldo a favor. Podés imputarlo a la declaración del año siguiente o pedir la devolución o compensación ante la DIAN, con el trámite y los plazos que la entidad fija para cada año gravable.',
    },
    {
      q: '¿Qué diferencia hay entre tarifa marginal y tasa efectiva?',
      a: 'La marginal es la del tramo donde caés y aplica solo al excedente de ese tramo: es el porcentaje que paga tu último peso. La efectiva es el impuesto total dividido por tu ingreso, y siempre es bastante menor. La tabla del Art. 241 es progresiva justamente para que así sea.',
    },
    {
      q: '¿Estoy obligado a declarar renta?',
      a: 'Depende de topes anuales en UVT sobre ingresos brutos, patrimonio bruto al 31 de diciembre, consumos con tarjeta de crédito, compras y consignaciones bancarias. Basta con superar uno solo para quedar obligado, incluso si el impuesto termina en cero. Los topes se publican cada año en el decreto de plazos.',
    },
    {
      q: '¿Cuándo vence mi declaración?',
      a: 'El calendario se escalona por los dos últimos dígitos de la cédula, entre agosto y octubre. La fecha exacta la fija el decreto de plazos que el Ministerio de Hacienda publica al cierre del año anterior.',
    },
    {
      q: '¿Los independientes calculan igual que los asalariados?',
      a: 'La tabla es la misma, pero cambian los ingresos y los beneficios que se pueden imputar en la cédula general. Un independiente puede restar costos y gastos asociados a su actividad; un asalariado usa el 25% exento de rentas de trabajo. En ambos casos rige el tope del 40% del Art. 336.',
    },
    {
      q: '¿Qué pasa si no declaro estando obligado?',
      a: 'Corre la sanción por extemporaneidad, que crece por cada mes de retraso, más los intereses de mora sobre el saldo a pagar. Si la DIAN emplaza antes de que declares, la sanción se duplica. Conviene declarar aunque no tengas plata para pagar el saldo.',
    },
  ],

  sources: [
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'DIAN — Impuestos para personas naturales',
      url: 'https://www.dian.gov.co/impuestos/personas/Paginas/default.aspx',
      publisher: 'DIAN',
    },
    {
      name: 'Estatuto Tributario Nacional — Art. 241, tarifa para personas naturales residentes',
      url: 'https://estatuto.co/241',
      publisher: 'Estatuto Tributario Nacional',
    },
  ],

  replaces: ['/calculadora-impuesto-renta-colombia-persona-natural-2026'],

  lastReviewed: '2026-07-27',
};
