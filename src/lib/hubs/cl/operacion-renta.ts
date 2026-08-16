import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Me devuelven o tengo que pagar en la Operación Renta?"
 *
 * Absorbe la devolución de impuestos del trabajador a honorarios, el Impuesto
 * Global Complementario de rentas altas y de múltiples fuentes, la tributación
 * de las ganancias en criptomonedas y el beneficio tributario del APV.
 *
 * Espejo de:
 *  - src/lib/formulas/devolucion-impuestos-operacion-renta-chile-2026.ts (CORREGIDO)
 *  - src/lib/formulas/impuesto-segunda-categoria-anual-chile-rentas-altas.ts
 *  - src/lib/formulas/cripto-chile-impuestos-trader-2026-sii.ts (REESCRITO)
 *  - src/lib/formulas/apv-beneficio-tributario-chile.ts
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  1. `devolucion-impuestos` acreditaba TODA la retención de honorarios contra el
 *     Global Complementario y presentaba la diferencia como devolución. En el
 *     régimen de la Ley 21.133 la retención financia PRIMERO las cotizaciones
 *     previsionales del independiente y solo el remanente se aplica al impuesto.
 *     Por eso ese cálculo sobreestimaba la devolución, a veces por completo.
 *  2. `cripto-chile-impuestos-trader` inventaba un régimen inexistente: "trader
 *     habitual con más de 10 operaciones al mes paga 35%" e "inversionista
 *     ocasional paga 15%", citando una circular del SII que no existe. En Chile
 *     el mayor valor en criptomonedas es renta ordinaria que se agrega al
 *     Global Complementario y tributa a la tasa marginal de la persona (0% a
 *     40%). Acá se calcula así.
 *  3. Esa misma fórmula descontaba una "retención de plataforma del 0,75%" de
 *     Buda y Orionx. Los exchanges chilenos no practican retención tributaria.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UTA = (clLive as any)?.uta?.valor ?? 859788;
export const UTA_FECHA = String((clLive as any)?.uta?.fecha ?? '').slice(0, 10);

/**
 * Escala del Impuesto Global Complementario — Art. 52 LIR, tramos ANUALES en UTA.
 * Es la misma estructura del Impuesto Único mensual del Art. 43 N°1 (tramos en
 * UTM), anualizada. La rebaja en UTA da continuidad entre tramos:
 * impuesto = base × factor − rebaja × UTA.
 */
export const TRAMOS_IGC: Array<{ hastaUta: number | null; factor: number; rebajaUta: number; nombre: string }> = [
  { hastaUta: CHILE_2026.segundaCategoriaExentoUtm, factor: 0, rebajaUta: 0, nombre: 'Exento (hasta 13,5 UTA)' },
  { hastaUta: 30, factor: 0.04, rebajaUta: 0.54, nombre: '13,5 a 30 UTA — 4%' },
  { hastaUta: 50, factor: 0.08, rebajaUta: 1.74, nombre: '30 a 50 UTA — 8%' },
  { hastaUta: 70, factor: 0.135, rebajaUta: 4.49, nombre: '50 a 70 UTA — 13,5%' },
  { hastaUta: 90, factor: 0.23, rebajaUta: 11.14, nombre: '70 a 90 UTA — 23%' },
  { hastaUta: 120, factor: 0.304, rebajaUta: 17.8, nombre: '90 a 120 UTA — 30,4%' },
  { hastaUta: 310, factor: 0.35, rebajaUta: 23.32, nombre: '120 a 310 UTA — 35%' },
  { hastaUta: null, factor: CHILE_2026.segundaCategoriaTasaMaxima, rebajaUta: 38.82, nombre: 'Sobre 310 UTA — 40%' },
];

/** Gradualidad de la retención de honorarios — Ley 21.133 (espejo de la tabla del SII). */
export const RETENCION_POR_ANIO: Array<{ anio: number; tasa: number }> = [
  { anio: 2025, tasa: 14.5 },
  { anio: 2026, tasa: 15.25 },
  { anio: 2027, tasa: 16 },
  { anio: 2028, tasa: 17 },
];

/** Cotizaciones del independiente sobre el 80% de las rentas brutas — Ley 21.133. */
export const COTIZACIONES_INDEPENDIENTE = {
  baseSobreBruto: 0.8,
  topeMensualUf: CHILE_2026.topeImponibleAfpUf,
  mesesDelAnio: 12,
  /** Suma aproximada: AFP 10% + comisión media + salud 7% + SIS 1,5% + Ley 16.744. */
  tasaTotalDefault: 0.2,
};

/**
 * APV — Art. 42 bis LIR, dos regímenes excluyentes.
 *  - Régimen A: bonificación estatal del 15% de lo ahorrado, tope 6 UTM al año.
 *  - Régimen B: el aporte rebaja la base tributable, tope 600 UF al año.
 */
export const APV = {
  regimenABonoPct: 0.15,
  regimenATopeUtm: 6,
  regimenBTopeUf: 600,
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/impuestos/operacion-renta',
  title: 'Operación Renta 2026 Chile: te devuelven o tienes que pagar',
  description:
    'Calculá tu Impuesto Global Complementario en la Operación Renta 2026: tabla en UTA del Art. 52, devolución o cargo, honorarios, cripto y APV en Chile.',
  silo: 'Impuestos',
  siloHref: '/cl/impuestos',
  locale: 'cl',

  eyebrow: 'Chile · SII · Formulario 22',
  h1: '¿Me devuelven o pago en la Operación Renta en Chile?',
  lede:
    'En abril el SII junta todas tus rentas del año y las mide contra una sola escala. Si te retuvieron de más, te devuelven; si te retuvieron de menos, pagas. Elige tu caso, pon lo que ganaste y mira el resultado con el tramo exacto de la tabla en UTA.',
  stamps: [
    `UTA del mes: ${fmt(UTA)}`,
    `UTM del mes: ${fmt(UTM)}`,
    `Exento hasta 13,5 UTA = ${fmt(13.5 * UTA)} al año`,
    'Art. 52 LIR · tasa máxima 40%',
    '5 casos en una sola página',
  ],

  resultLabel: 'Resultado de tu declaración',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por el caso más frecuente en abril: el trabajador a honorarios que quiere saber cuánto de su retención vuelve.',
    items: [
      {
        id: 'honorarios',
        label: 'Trabajo a honorarios y quiero saber mi devolución real',
        hint: 'Tu retención del año no se acredita entera contra el impuesto: primero paga tus cotizaciones.',
        yes: [
          'Retención acumulada del año sobre tus honorarios brutos',
          'Cotizaciones obligatorias sobre el 80% de tus rentas, que se pagan primero',
          'Impuesto Global Complementario que efectivamente te corresponde',
          'Devolución real, después de que la retención financie las cotizaciones',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Esta es la razón número uno por la que la devolución de un independiente sale mucho más chica de lo esperado: la retención financia primero las cotizaciones previsionales',
          'La calculadora anterior de este sitio acreditaba toda la retención contra el impuesto y sobreestimaba la devolución',
          'Puedes rebajar gastos efectivos acreditados o acogerte a la presunción del 30% de los ingresos brutos con tope de 15 UTA',
          'La cotización de salud del 7% solo se cobra si estás en Fonasa o si tu plan de Isapre no la cubre por otra vía',
        ],
        plazo:
          'la declaración se presenta en abril; las devoluciones se pagan entre finales de abril y mayo según la fecha en que declares y el medio de pago.',
        answer:
          'La retención del independiente paga primero sus cotizaciones previsionales: solo el remanente se acredita contra el impuesto y se convierte en devolución.',
      },
      {
        id: 'sueldos',
        label: 'Soy trabajador dependiente con un solo empleador',
        hint: 'Si tu única renta es el sueldo, el Impuesto Único ya retenido suele coincidir con el anual.',
        yes: [
          'Renta anual imponible después de descontar tus cotizaciones',
          'Impuesto Global Complementario anual según la tabla en UTA',
          'Comparación contra el Impuesto Único que ya te retuvieron mes a mes',
          'Devolución o cargo, según cuál de los dos sea mayor',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si tu única renta del año fue el sueldo de un solo empleador, el Impuesto Único ya retenido normalmente equivale al anual y no hay devolución ni cargo',
          'Si tuviste dos empleadores en paralelo, casi seguro te queda cargo: cada uno retuvo como si fueras su único trabajador',
          'Los bonos concentrados en un mes te empujan a un tramo alto ese mes: en abril se puede reliquidar y recuperar parte',
          'El APV en Régimen B rebaja tu base tributable y puede convertir un cargo en devolución',
        ],
        plazo:
          'la propuesta del SII se abre a fines de marzo y el plazo para declarar vence el 30 de abril.',
        answer:
          'Con un solo empleador y sin otras rentas el impuesto anual coincide con lo que ya te retuvieron: no hay devolución ni cargo.',
      },
      {
        id: 'varias',
        label: 'Tengo rentas de varias fuentes',
        hint: 'Sueldos, honorarios, arriendos y rentas de capital se suman en una sola base.',
        yes: [
          'Suma de todas tus rentas del año en una sola base imponible',
          'Rebaja de tus cotizaciones obligatorias y de tus gastos deducibles',
          'Tramo del Art. 52 en el que caes y tasa marginal aplicable',
          'Créditos y retenciones ya pagadas, para llegar al cargo o a la devolución',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El Global Complementario es un impuesto progresivo sobre el TOTAL: sumar una segunda fuente puede empujarte a un tramo más alto y subir la tasa sobre todo lo demás',
          'Los arriendos de bienes raíces con DFL 2 tienen un tratamiento especial: hasta dos viviendas por persona natural pueden quedar fuera',
          'Los dividendos y retiros de empresas traen crédito por el Impuesto de Primera Categoría ya pagado: no se tributa dos veces',
          'Si tienes rentas del exterior, hay que revisar el convenio para evitar la doble tributación',
        ],
        plazo:
          'el plazo general para declarar vence el 30 de abril; declarar con pago tiene fechas específicas según el medio.',
        answer:
          'Todas tus rentas se suman en una sola base y tributan con una escala progresiva única que llega al 40%.',
      },
      {
        id: 'cripto',
        label: 'Vendí criptomonedas con ganancia',
        hint: 'El mayor valor es renta ordinaria: se suma al Global Complementario a tu tasa marginal.',
        yes: [
          'Mayor valor: precio de venta menos costo de adquisición y comisiones',
          'Ese mayor valor sumado al resto de tus rentas del año',
          'Impuesto adicional que genera, a tu tasa marginal real',
          'Cuánto te queda de la ganancia después del impuesto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No existe una tasa plana para cripto en Chile: el mayor valor es renta ordinaria del Art. 20 N°5 LIR y tributa en el Global Complementario a tu tasa marginal, que va del 0% al 40%',
          'La calculadora anterior de este sitio aplicaba un 35% a quien hiciera más de 10 operaciones al mes y un 15% al resto, citando una circular del SII que no existe',
          'Los exchanges chilenos no practican retención tributaria: el impuesto lo declaras tú',
          'Si compras y vendes de forma habitual y organizada, el SII puede calificarlo como actividad comercial y aplicarte Primera Categoría además del Global Complementario',
          'Hay que llevar registro del costo de cada compra: sin respaldo, el SII puede tasar el mayor valor sobre el total de la venta',
        ],
        plazo:
          'el mayor valor se declara en el Formulario 22 del año siguiente al de la venta.',
        answer:
          'La ganancia en criptomonedas se suma a tus demás rentas y paga la tasa marginal que te corresponda, entre 0% y 40%.',
      },
      {
        id: 'apv',
        label: 'Quiero saber cuánto me conviene el APV',
        hint: 'Régimen A: el Estado te bonifica el 15%. Régimen B: rebajas la base del impuesto.',
        yes: [
          `Régimen A: bonificación estatal del ${APV.regimenABonoPct * 100}% del aporte, con tope de ${APV.regimenATopeUtm} UTM al año`,
          `Régimen B: el aporte rebaja tu base tributable, con tope de ${APV.regimenBTopeUf} UF al año`,
          'Comparación directa de los dos regímenes con tu tasa marginal real',
          'Cuál te conviene según cuánto ganas y cuánto aportas',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los dos regímenes son excluyentes: eliges uno por cada aporte y no se pueden mezclar en el mismo aporte',
          'El Régimen A conviene a rentas bajas y medias: la bonificación del 15% supera al ahorro de impuesto de un tramo bajo',
          'El Régimen B conviene a rentas altas: si tu tasa marginal es 30% o 35%, el ahorro de impuesto pesa más que el 15% del Estado',
          'Si retiras el APV antes de pensionarte pagas un impuesto único de castigo, así que el beneficio se pierde',
          'La bonificación del Régimen A se pierde si retiras los fondos antes de la pensión',
        ],
        plazo:
          'los aportes computan por año calendario: lo que aportes hasta el 31 de diciembre se refleja en la declaración de abril siguiente.',
        answer:
          'El Régimen A del APV conviene a rentas bajas y el Régimen B a rentas altas: el corte está donde tu tasa marginal supera el 15%.',
      },
    ],
  },

  inputsTitle: 'Tus rentas del año',
  inputsIntro:
    'Todos los montos son anuales y en pesos chilenos. Según el caso que elijas, algunos campos quedan sin efecto: en el caso de honorarios manda el total boleteado; en el de varias fuentes, la suma de todo.',
  fields: [
    {
      id: 'sueldos',
      label: 'Sueldos brutos del año',
      type: 'number',
      value: 18000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Total de remuneraciones imponibles del año, antes de descuentos.',
    },
    {
      id: 'honorarios',
      label: 'Honorarios brutos del año',
      type: 'number',
      value: 12000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Total boleteado en el año calendario.',
    },
    {
      id: 'anioRetencion',
      label: 'Año de las boletas (define la tasa de retención)',
      type: 'select',
      value: '2026',
      options: RETENCION_POR_ANIO.map((r) => ({
        value: String(r.anio),
        label: `${r.anio} — retención ${r.tasa.toLocaleString('es-CL')}%`,
      })),
    },
    {
      id: 'otrasRentas',
      label: 'Arriendos y rentas de capital del año',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Arriendos, intereses, dividendos y otras rentas que van al Global Complementario.',
    },
    {
      id: 'cotizaciones',
      label: 'Cotizaciones obligatorias pagadas',
      type: 'number',
      value: 3200000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'AFP y salud descontadas del sueldo. Se rebajan de la base del impuesto.',
    },
    {
      id: 'retenido',
      label: 'Impuesto ya retenido o pagado como PPM',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 50000,
      thousands: true,
      help: 'Impuesto Único retenido por tu empleador durante el año, más PPM que hayas pagado.',
    },
    {
      id: 'apvAporte',
      label: 'Aporte anual a tu APV',
      type: 'number',
      value: 1200000,
      prefix: '$',
      min: 0,
      step: 50000,
      thousands: true,
      help: `Tope del Régimen A: ${APV.regimenATopeUtm} UTM de bonificación. Tope del Régimen B: ${APV.regimenBTopeUf} UF de aporte.`,
    },
    {
      id: 'criptoVenta',
      label: 'Total vendido en criptomonedas',
      type: 'number',
      value: 5000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Monto recibido por la venta, en pesos.',
    },
    {
      id: 'criptoCosto',
      label: 'Costo de adquisición y comisiones',
      type: 'number',
      value: 3000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Lo que pagaste al comprar más las comisiones del exchange. Hay que poder acreditarlo.',
    },
  ],
  fineprint:
    'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva. La UTA y la UTM se actualizan a diario desde mindicador.cl (Banco Central y SII).',

  chart: {
    type: 'donut',
    title: 'A dónde va tu renta del año',
    caption:
      'Muestra qué parte de tus rentas queda fuera del impuesto por cotizaciones y rebajas, qué parte tributa y cuánto se lleva el Fisco.',
  },
  breakdownTitle: 'La declaración, línea por línea',
  breakdownIntro:
    'Cada fila indica el artículo de la Ley de la Renta que la respalda. La escala está en UTA, así que los tramos en pesos se recalculan con el valor del mes.',

  faq: [
    {
      q: '¿Desde cuánto hay que pagar Impuesto Global Complementario en Chile?',
      a: `El primer tramo del Art. 52 de la Ley de la Renta es exento hasta 13,5 UTA anuales, hoy ${fmt(13.5 * UTA)}. Bajo esa renta anual imponible no se paga impuesto. Desde ahí la escala sube por tramos: 4%, 8%, 13,5%, 23%, 30,4%, 35% y 40% como tasa máxima.`,
    },
    {
      q: '¿Por qué mi devolución como trabajador a honorarios es tan chica?',
      a: 'Porque la retención de tus boletas no se acredita entera contra el impuesto. Desde la Ley 21.133, esa retención se destina primero a pagar tus cotizaciones previsionales obligatorias, calculadas sobre el 80% de tus rentas brutas del año. Solo el remanente, si queda, se aplica al Global Complementario y se convierte en devolución.',
    },
    {
      q: '¿Tengo que declarar si mi único ingreso es el sueldo?',
      a: 'No estás obligado si tu única renta del año fue el sueldo de un solo empleador y ya te retuvieron el Impuesto Único mes a mes. Igual conviene revisar la propuesta del SII: si tuviste APV, gastos hipotecarios o rentas exentas, puede que te corresponda devolución.',
    },
    {
      q: '¿Por qué me sale cargo si tuve dos empleadores?',
      a: 'Porque cada empleador retuvo el Impuesto Único como si fuera tu único ingreso, es decir aplicando dos veces el tramo exento y los tramos bajos. Al sumar todo en abril, tu renta anual cae en un tramo más alto y aparece la diferencia. Es la causa más común de cargo en la Operación Renta.',
    },
    {
      q: '¿Cómo tributan las ganancias en criptomonedas en Chile?',
      a: 'El mayor valor obtenido en la venta es renta ordinaria del Art. 20 N°5 de la Ley de la Renta: se suma al resto de tus rentas del año y tributa en el Global Complementario a tu tasa marginal, que puede ir del 0% al 40%. No existe una tasa plana ni un umbral de operaciones que cambie el régimen.',
    },
    {
      q: '¿Los exchanges me retienen impuesto por vender cripto?',
      a: 'No. Los exchanges chilenos no practican retención tributaria sobre el mayor valor: el impuesto lo declaras y pagas tú en la Operación Renta. Sí informan operaciones al SII, así que la ganancia suele aparecer precargada o cruzada en la propuesta.',
    },
    {
      q: '¿Qué necesito para acreditar el costo de mis criptomonedas?',
      a: 'Los comprobantes de compra con fecha, cantidad y precio, y las cartolas del exchange o de la wallet. Sin respaldo del costo de adquisición, el SII puede tasar el mayor valor sobre el total de la venta, lo que dispara el impuesto.',
    },
    {
      q: '¿Qué régimen de APV me conviene?',
      a: `Depende de tu tasa marginal. El Régimen A te bonifica el ${APV.regimenABonoPct * 100}% de lo ahorrado con tope de ${APV.regimenATopeUtm} UTM al año, así que conviene si tu tasa marginal es baja. El Régimen B rebaja tu base tributable con tope de ${APV.regimenBTopeUf} UF, así que conviene si tu tasa marginal supera el 15%: el ahorro de impuesto es mayor que la bonificación.`,
    },
    {
      q: '¿Qué pasa si retiro el APV antes de jubilar?',
      a: 'Pierdes el beneficio. En el Régimen A se devuelve la bonificación estatal recibida; en el Régimen B el retiro paga un impuesto único con recargo, que en la práctica anula el ahorro tributario que obtuviste. El APV está diseñado para complementar la pensión, no como ahorro de corto plazo.',
    },
    {
      q: '¿Cuándo se declara y cuándo pagan las devoluciones?',
      a: 'La propuesta del SII se abre a fines de marzo y el plazo para declarar el Formulario 22 vence el 30 de abril. Las devoluciones se pagan de forma escalonada entre fines de abril y mayo, según la fecha en que declares y el medio de pago que elijas: el depósito en cuenta bancaria es el más rápido.',
    },
    {
      q: '¿Puedo rebajar gastos de mis honorarios?',
      a: 'Sí, de dos formas excluyentes: los gastos efectivos que puedas acreditar con documentación, o la presunción de gastos del 30% de tus ingresos brutos con un tope de 15 UTA anuales. La mayoría de los independientes usa la presunción porque no exige respaldo.',
    },
    {
      q: '¿La UTA cambia todos los meses?',
      a: `Sí. La UTA es doce veces la UTM y la UTM se reajusta mensualmente por el IPC. Por eso los tramos del Art. 52 en pesos se mueven cada mes: hoy la UTA está en ${fmt(UTA)} y el tramo exento equivale a ${fmt(13.5 * UTA)} de renta anual.`,
    },
  ],

  sources: [
    {
      name: 'Ley sobre Impuesto a la Renta (DL 824) — Impuesto Global Complementario, Art. 52',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6368',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'SII — Operación Renta y Formulario 22',
      url: 'https://www.sii.cl/destacados/renta/',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — tabla del Impuesto Global Complementario en UTA',
      url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2016.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — tributación de las criptomonedas y monedas digitales',
      url: 'https://www.sii.cl/preguntas_frecuentes/renta/001_002_5165.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Ley 21.133 — cotizaciones del trabajador independiente y destino de la retención',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1128420',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Superintendencia de Pensiones — ahorro previsional voluntario (Art. 42 bis LIR)',
      url: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9909.html',
      publisher: 'Superintendencia de Pensiones',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-devolucion-impuestos-operacion-renta-chile-2026',
    '/calculadora-impuesto-segunda-categoria-anual-chile-rentas-altas',
    '/calculadora-cripto-chile-impuestos-trader-2026-sii',
    '/calculadora-apv-beneficio-tributario-chile-regimen-a-b',
  ],

lastReviewed: '2026-08-16',
};
