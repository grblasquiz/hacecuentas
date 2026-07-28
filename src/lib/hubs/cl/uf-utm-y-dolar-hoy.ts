import type { HubData } from '../types';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto vale hoy la UF, la UTM, la UTA y el dólar?"
 *
 * Conversor bidireccional con los valores VIVOS de src/data/live/chile.json
 * (mindicador.cl → Banco Central / SII, refresco por cron diario). Ningún valor
 * se hardcodea: los fallbacks son los mismos que usan las fórmulas originales.
 *
 * Corrige un bug de la fórmula vieja de tipo de cambio: convertía pesos a dólares
 * MULTIPLICANDO por la tasa en vez de dividir. Acá la dirección importa.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Indicadores vivos. Los fallbacks son los últimos valores verificados. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;
export const UTA = (clLive as any)?.uta?.valor ?? 858072;
export const USD = (clLive as any)?.dolar?.valor ?? 941.93;
export const EUR = (clLive as any)?.euro?.valor ?? 1070.98;

const soloFecha = (iso: unknown) => String(iso ?? '').slice(0, 10);
export const FECHAS = {
  uf: soloFecha((clLive as any)?.uf?.fecha),
  utm: soloFecha((clLive as any)?.utm?.fecha),
  uta: soloFecha((clLive as any)?.uta?.fecha),
  dolar: soloFecha((clLive as any)?.dolar?.fecha),
  euro: soloFecha((clLive as any)?.euro?.fecha),
};

/** Todo lo que este hub sabe convertir, con su valor y su fecha de dato. */
export const UNIDADES: Array<{ id: string; nombre: string; abrev: string; valor: number; fecha: string; decimales: number }> = [
  { id: 'uf', nombre: 'Unidad de Fomento', abrev: 'UF', valor: UF, fecha: FECHAS.uf, decimales: 2 },
  { id: 'utm', nombre: 'Unidad Tributaria Mensual', abrev: 'UTM', valor: UTM, fecha: FECHAS.utm, decimales: 2 },
  { id: 'uta', nombre: 'Unidad Tributaria Anual', abrev: 'UTA', valor: UTA, fecha: FECHAS.uta, decimales: 3 },
  { id: 'dolar', nombre: 'Dólar observado', abrev: 'USD', valor: USD, fecha: FECHAS.dolar, decimales: 2 },
  { id: 'euro', nombre: 'Euro', abrev: 'EUR', valor: EUR, fecha: FECHAS.euro, decimales: 2 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
const fmt2 = (n: number) =>
  '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'cl/dinero/uf-utm-y-dolar-hoy',
  title: `UF, UTM, UTA y dólar hoy en Chile: valores y conversor a pesos`,
  description:
    'Valor de la UF, la UTM, la UTA, el dólar observado y el euro de hoy, con la fecha de cada dato, y un conversor en las dos direcciones: de la unidad a pesos y de pesos a la unidad. Además, qué se paga en cada una y por qué se reajustan distinto.',
  silo: 'Dinero',
  siloHref: '/cl/dinero',
  locale: 'cl',

  eyebrow: 'Chile · indicadores del día',
  h1: '¿Cuánto vale hoy la UF, la UTM y el dólar?',
  lede:
    'La UF cambia todos los días, la UTM una vez al mes y el dólar observado se publica cada día hábil. Acá están los tres con la fecha del dato a la vista y un conversor que funciona en las dos direcciones: pon el monto, elige la unidad y mira el equivalente en pesos, o al revés.',
  stamps: [
    `UF ${FECHAS.uf}: ${fmt2(UF)}`,
    `UTM ${FECHAS.utm}: ${fmt(UTM)}`,
    `UTA ${FECHAS.uta}: ${fmt(UTA)}`,
    `Dólar observado ${FECHAS.dolar}: ${fmt2(USD)}`,
    'Fuente: Banco Central de Chile y SII',
  ],

  resultLabel: 'Equivalencia',

  cases: {
    title: '¿Qué unidad necesitas convertir?',
    intro:
      'Elige la unidad. El valor y la fecha del dato se muestran siempre para que sepas a qué día corresponde la conversión.',
    items: [
      {
        id: 'uf',
        label: 'UF — Unidad de Fomento',
        hint: 'Arriendos, dividendos hipotecarios, planes de Isapre, seguros y topes previsionales.',
        yes: [
          'Conversión de UF a pesos y de pesos a UF con el valor del día',
          'El valor exacto de la UF de hoy y la fecha a la que corresponde',
          'Equivalencias de referencia para montos habituales',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La UF cambia TODOS los días: el valor de mañana no es el de hoy, así que una cotización en UF vale distinto según cuándo la pagues',
          'Su reajuste sigue el IPC del mes anterior, con variación diaria entre el día 10 de un mes y el 9 del siguiente',
          'Un contrato pactado en UF se paga al valor del día del pago efectivo, no al de la fecha de la factura',
        ],
        plazo:
          'el Banco Central publica el valor de la UF con anticipación para todo el período que va del día 10 de un mes al 9 del siguiente.',
        answer: `Hoy la UF vale ${fmt2(UF)}, según el dato del ${FECHAS.uf}.`,
      },
      {
        id: 'utm',
        label: 'UTM — Unidad Tributaria Mensual',
        hint: 'Multas, tramos del impuesto de segunda categoría, exenciones y topes tributarios.',
        yes: [
          'Conversión de UTM a pesos y de pesos a UTM con el valor del mes',
          'El valor de la UTM vigente y el mes al que corresponde',
          'Cuántas UTM representa un monto en pesos, que es como se expresan las multas y los tramos',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La UTM cambia una vez al mes, no todos los días: se reajusta con el IPC del mes anterior',
          'Las multas y los tramos de impuesto se fijan en UTM justamente para que no se desvaloricen: el monto en pesos sube cada mes',
          'Para obligaciones anuales el SII usa la UTA, que no es exactamente doce veces la UTM del mes',
        ],
        plazo:
          'el SII publica la UTM de cada mes en su tabla de valores y fechas; rige para todo el mes calendario.',
        answer: `Hoy la UTM vale ${fmt(UTM)}, valor vigente para el mes del dato ${FECHAS.utm}.`,
      },
      {
        id: 'uta',
        label: 'UTA — Unidad Tributaria Anual',
        hint: 'Tramos del Global Complementario, topes anuales y sanciones expresadas por año.',
        yes: [
          'Conversión de UTA a pesos y de pesos a UTA',
          'El valor de la UTA vigente y su fecha',
          'Referencia para leer los tramos anuales de la Operación Renta',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La UTA no es simplemente doce veces la UTM de este mes: se construye con los valores del año tributario correspondiente',
          'Los tramos del Global Complementario están en UTA: al cambiar la UTA cambian los umbrales en pesos',
          'Para una declaración de renta usa la UTA del año tributario que estás declarando, no la del día de hoy',
        ],
        plazo:
          'la UTA se aplica en la Operación Renta de cada año, que se presenta en abril por las rentas del año anterior.',
        answer: `Hoy la UTA vale ${fmt(UTA)}, según el dato del ${FECHAS.uta}.`,
      },
      {
        id: 'dolar',
        label: 'Dólar y euro',
        hint: 'Dólar observado del Banco Central: la referencia oficial, no lo que te cobra la casa de cambio.',
        yes: [
          'Conversión de dólares a pesos y de pesos a dólares con el observado del día',
          'Lo mismo para el euro',
          'La fecha exacta del tipo de cambio usado',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El dólar observado es un promedio de las operaciones del día hábil anterior: es una referencia contable, no el precio al que compras',
          'Una casa de cambio o un banco te aplican un spread entre compra y venta más una comisión: siempre recibes menos que el observado',
          'Para convertir pesos a dólares hay que DIVIDIR por el tipo de cambio, no multiplicar: si un simulador te da un número absurdamente grande, está multiplicando',
          'Las compras con tarjeta en el exterior se convierten al tipo de cambio del emisor en la fecha de procesamiento, no en la de la compra',
        ],
        plazo:
          'el Banco Central publica el dólar observado cada día hábil bancario, con el promedio de las operaciones del día hábil anterior.',
        answer: `Hoy el dólar observado está en ${fmt2(USD)} y el euro en ${fmt2(EUR)}, según el dato del ${FECHAS.dolar}.`,
      },
    ],
  },

  inputsTitle: 'Qué quieres convertir',
  inputsIntro:
    'Escribe el monto y elige la dirección. La unidad la define el caso que hayas seleccionado más arriba.',
  fields: [
    {
      id: 'monto',
      label: 'Monto a convertir',
      value: '1',
      thousands: true,
      help: 'En la unidad elegida si conviertes hacia pesos, o en pesos si conviertes hacia la unidad.',
    },
    {
      id: 'direccion',
      label: 'Dirección de la conversión',
      type: 'select',
      value: 'a_pesos',
      options: [
        { value: 'a_pesos', label: 'De la unidad a pesos chilenos' },
        { value: 'desde_pesos', label: 'De pesos chilenos a la unidad' },
      ],
    },
    {
      id: 'moneda',
      label: 'Moneda extranjera',
      type: 'select',
      value: 'dolar',
      options: [
        { value: 'dolar', label: 'Dólar observado (USD)' },
        { value: 'euro', label: 'Euro (EUR)' },
      ],
      help: 'Sólo se usa en el caso de dólar y euro.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'bars',
    title: 'Cuánto vale una unidad de cada indicador',
    caption:
      'Compara en pesos el valor de una UF, una UTM, una UTA, un dólar y un euro con los datos de hoy, para dimensionar de un vistazo en qué unidad está expresado lo que estás mirando.',
  },
  breakdownTitle: 'Los indicadores de hoy',
  breakdownIntro: 'Cada fila trae el valor vigente y la fecha del dato.',

  faq: [
    {
      q: '¿Cuánto vale la UF hoy?',
      a: `Según el último dato disponible, correspondiente al ${FECHAS.uf}, la UF vale ${fmt2(UF)}. El valor cambia todos los días: el Banco Central lo publica por adelantado para el período que va del día 10 de un mes al 9 del siguiente, aplicando de forma diaria la variación del IPC del mes anterior.`,
    },
    {
      q: '¿Cuánto vale la UTM este mes?',
      a: `La UTM vigente es de ${fmt(UTM)}, según el dato del ${FECHAS.utm}. A diferencia de la UF, la UTM cambia una sola vez al mes y rige para todo el mes calendario. La publica el SII en su tabla de valores y fechas, y se reajusta con el IPC del mes anterior.`,
    },
    {
      q: '¿Para qué sirve cada unidad?',
      a: 'La UF se usa en todo lo que se quiere proteger de la inflación en el día a día: arriendos, dividendos hipotecarios, planes de Isapre, seguros, topes imponibles previsionales y precios de vivienda. La UTM se usa en lo tributario y sancionatorio mensual: tramos del impuesto de segunda categoría, multas y exenciones. La UTA se usa en lo tributario anual, sobre todo en los tramos del Global Complementario.',
    },
    {
      q: '¿La UTA es doce veces la UTM?',
      a: 'No exactamente. La UTA corresponde al año tributario y se construye a partir de los valores del período, así que no coincide con multiplicar por doce la UTM de un mes cualquiera. Si estás leyendo tramos anuales de la Operación Renta, usa el valor de la UTA del año tributario que corresponde y no una multiplicación hecha a mano.',
    },
    {
      q: '¿Por qué la UF sube todos los días?',
      a: 'Porque su diseño reparte la variación mensual del IPC en incrementos diarios. La idea es que un contrato pactado en UF mantenga su valor real sin saltos bruscos a fin de mes. La consecuencia práctica es que un arriendo o un dividendo en UF cuesta un poco más de pesos cada día, y que pagar el mismo compromiso el día 5 o el día 25 no cuesta lo mismo.',
    },
    {
      q: '¿Qué es el dólar observado y por qué no me lo dan en la casa de cambio?',
      a: 'El dólar observado que publica el Banco Central es el promedio ponderado de las transacciones del mercado cambiario formal del día hábil anterior. Es una referencia oficial para contabilidad, contratos e informes, no un precio de venta al público. Una casa de cambio te compra por debajo y te vende por encima de esa referencia, y encima puede cobrar comisión: siempre vas a recibir menos que el observado.',
    },
    {
      q: '¿Cómo convierto pesos a dólares?',
      a: 'Dividiendo el monto en pesos por el tipo de cambio. Con el observado de hoy, un millón de pesos equivale a algo más de mil dólares, no a cientos de millones: si un conversor te muestra un número gigante es porque está multiplicando en vez de dividir, que es un error clásico en simuladores mal escritos. Este hub aplica la operación correcta según la dirección que elijas.',
    },
    {
      q: '¿A qué valor se paga un contrato pactado en UF?',
      a: 'Al valor de la UF del día en que efectivamente se paga, salvo que el contrato diga otra cosa expresamente. Por eso conviene revisar qué fecha de conversión fija el contrato: no es lo mismo el día de emisión de la boleta, el día de vencimiento o el día del pago real, sobre todo en meses con inflación alta.',
    },
    {
      q: '¿De dónde salen los valores de esta página?',
      a: 'De mindicador.cl, que replica los indicadores oficiales del Banco Central de Chile y del SII, y se actualiza acá por un proceso automático diario. Cada valor viene con su fecha de dato a la vista para que sepas exactamente a qué día corresponde la conversión que estás haciendo. Ante cualquier uso formal, contrasta contra la publicación oficial del organismo.',
    },
    {
      q: '¿Con qué frecuencia se actualiza cada indicador?',
      a: 'La UF cambia todos los días del año. El dólar observado y el euro se publican cada día hábil bancario, así que en fines de semana y feriados el valor mostrado es el del último día hábil. La UTM cambia una vez al mes y rige el mes calendario completo. La UTA cambia una vez al año tributario.',
    },
    {
      q: '¿Sirve la UF para saber cuánto vale una casa?',
      a: 'Es la unidad en la que se expresan casi todas las propiedades en Chile, justamente porque el precio no se desactualiza con la inflación. Para pasar a pesos multiplica el precio en UF por el valor del día. Ten presente que el crédito hipotecario también está en UF, así que el dividendo mensual sube en pesos aunque el número de UF sea siempre el mismo.',
    },
  ],

  sources: [
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Serie.aspx?gcode=UF&param=RABmAFYAWQB3AGYAaQBuAEkALQAzADUAbgBNAGgAaAAkA',
      publisher: 'Banco Central de Chile',
      date: FECHAS.uf,
    },
    {
      name: 'Banco Central de Chile — dólar observado y tipos de cambio',
      url: 'https://si3.bcentral.cl/siete',
      publisher: 'Banco Central de Chile',
      date: FECHAS.dolar,
    },
    {
      name: 'SII — valores de la UTM, la UTA y el IPC',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
      date: FECHAS.utm,
    },
    {
      name: 'INE — Índice de Precios al Consumidor, base del reajuste de la UF y la UTM',
      url: 'https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/indice-de-precios-al-consumidor',
      publisher: 'Instituto Nacional de Estadísticas',
    },
    {
      name: 'mindicador.cl — API de indicadores económicos de Chile',
      url: 'https://mindicador.cl/api',
      publisher: 'mindicador.cl',
    },
  ],

  replaces: [
    '/calculadora-emol-uf-pesos-chile',
    '/calculadora-uf-uta-utm-chile-conversion-pesos-2026',
    '/calculadora-tipo-cambio-dolar-peso-chile-clp-banco-central',
  ],

  lastReviewed: '2026-07-28',
};
