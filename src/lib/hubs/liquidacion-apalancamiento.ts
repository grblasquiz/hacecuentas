import type { HubData } from './types';

/**
 * Hub de decisión — "¿A qué precio me liquidan y cuánto puedo arriesgar?"
 * Absorbe 5 calculadoras sueltas de trading apalancado: precio de liquidación
 * en long y en short, tamaño de posición en cripto, tamaño de posición en forex
 * y costo del funding rate en perpetuos.
 */

/** Disclaimer YMYL inversión, textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

/** Advertencia de pérdida total, obligatoria en todas las ramas de apalancamiento. */
const RUINA =
  'Operar apalancado puede hacerte perder el 100% del margen de la posición en un solo movimiento en contra, y en algunos esquemas más que el margen: es el riesgo central de esta operatoria.';

export const hub: HubData = {
  slug: 'inversiones/liquidacion-apalancamiento',
  title: '¿A qué precio me liquidan? — Liquidación, apalancamiento y tamaño de posición',
  description:
    'Precio de liquidación de tu long o short apalancado, distancia porcentual hasta ahí, tamaño de posición que banca tu riesgo en cripto y en forex, y cuánto te come el funding rate en perpetuos.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Riesgo de una posición apalancada',
  h1: 'Abrís una posición apalancada: ¿a qué precio te liquidan?',
  lede:
    'Partimos del caso más frecuente: un long apalancado. Ya podés ver el precio de liquidación y cuánto tiene que caer el mercado para llegar, y ajustarlo con tus datos. Si tu caso es otro —short, tamaño de posición o perpetuos—, lo cambiás abajo.',
  stamps: ['Fórmula de margen aislado', 'Dólar cripto del día', '5 calculadoras adentro'],

  resultLabel: 'Precio de liquidación',

  cases: {
    title: '¿Qué estás por hacer?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'long',
        label: 'Long apalancado',
        hint: 'Apuesto a que sube',
        answer:
          'En un long te liquidan cuando el precio cae lo suficiente para que el margen quede por debajo del mínimo de mantenimiento.',
        yes: [
          'Precio de liquidación en dólares con el margen de mantenimiento contemplado',
          'Cuánto tiene que caer el precio, en porcentaje y en dólares, para llegar ahí',
          'Margen inicial que inmoviliza la posición',
          'Dónde está el precio de hoy entre tu entrada y la liquidación',
        ],
        warn: [
          DISCLAIMER,
          RUINA,
          'La liquidación se dispara con el precio de referencia del exchange, no con el último trade: una mecha en un libro fino puede alcanzarte antes de lo que muestra el gráfico',
          'El resultado no incluye comisiones de apertura y cierre ni el funding: en la práctica te liquidan un poco antes',
        ],
        plazo: 'poné el stop antes de abrir, no después de que la posición esté en rojo.',
      },
      {
        id: 'short',
        label: 'Short apalancado',
        hint: 'Apuesto a que baja',
        answer:
          'En un short te liquidan cuando el precio sube lo suficiente, y hacia arriba no hay techo teórico.',
        yes: [
          'Precio de liquidación por encima de tu entrada',
          'Cuánto tiene que subir el precio para alcanzarte',
          'Margen inicial y distancia porcentual hasta la liquidación',
          'Dónde está el precio de hoy entre tu entrada y la liquidación',
        ],
        warn: [
          DISCLAIMER,
          RUINA,
          'La pérdida de un short no tiene tope teórico: el precio puede subir sin límite, mientras que en un long el piso es cero',
          'Además del riesgo de precio, un short paga funding cuando la tasa está negativa: se suma al costo de sostenerlo',
        ],
        plazo: 'antes de shortear, mirá si hay eventos o vencimientos próximos que puedan gatillar un movimiento violento hacia arriba.',
      },
      {
        id: 'size-cripto',
        label: 'Cuánto puedo arriesgar en cripto',
        hint: 'Tamaño de posición',
        answer:
          'El tamaño correcto sale del riesgo que aceptás perder dividido por la distancia entre tu entrada y tu stop.',
        yes: [
          'Unidades y tamaño de la posición en dólares que banca tu riesgo',
          'Cuánta plata arriesgás en el trade y qué porcentaje del capital es',
          'Margen que inmoviliza esa posición con el apalancamiento elegido',
          'Aviso si la liquidación te queda antes que el stop',
        ],
        warn: [
          DISCLAIMER,
          RUINA,
          'Si el precio de liquidación queda antes que tu stop, el stop no te protege: el exchange te cierra la posición primero',
          'El tamaño calculado asume que el stop se ejecuta al precio que pusiste: con un hueco de precio la pérdida real puede ser mayor',
        ],
        plazo: 'la regla habitual es no arriesgar más de 1% a 2% del capital por operación.',
      },
      {
        id: 'size-forex',
        label: 'Cuánto puedo arriesgar en forex',
        hint: 'Pips y lotaje',
        answer:
          'En forex el tamaño sale del riesgo en dólares dividido por los pips del stop por el valor del pip.',
        yes: [
          'Lotes estándar, mini y micro que corresponden a tu riesgo',
          'Unidades de la divisa base que implica ese lotaje',
          'Pérdida máxima en dólares si salta el stop',
          'Cuánto te cuesta cada pip con el lotaje calculado',
        ],
        warn: [
          DISCLAIMER,
          RUINA,
          'El valor del pip depende del par y de la moneda de tu cuenta: si operás un par que no termina en dólar, confirmá el valor antes de dimensionar',
          'El cálculo no contempla el spread ni el swap por mantener la posición de un día para el otro',
        ],
        plazo: 'redondeá siempre para abajo al lotaje que permita tu bróker: pasarse arriba rompe la regla de riesgo.',
      },
      {
        id: 'funding',
        label: 'Perpetuos: cuánto me come el funding',
        hint: 'Costo de sostener',
        answer:
          'El funding se paga cada ocho horas sobre el nocional de la posición: sostenerla mucho tiempo drena el margen aunque el precio no se mueva.',
        yes: [
          'Costo o ingreso de funding por período, por día y por semana',
          'En cuántos días el funding se come tu margen inicial si el precio no se mueve',
          'Precio de liquidación y distancia porcentual de la posición',
          'Margen inicial que inmoviliza el nocional que operás',
        ],
        warn: [
          DISCLAIMER,
          RUINA,
          'La tasa de funding cambia en cada período y puede darse vuelta: proyectar la de hoy hacia adelante es apenas un escenario',
          'El funding se cobra sobre el nocional completo, no sobre tu margen: con apalancamiento alto el costo relativo se multiplica',
        ],
        plazo: 'mirá la tasa de funding vigente y la próxima liquidación antes de dejar la posición abierta durante la noche.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo: sólo pesan los campos de la rama que elegiste.',
  fields: [
    { id: 'precioEntrada', label: 'Precio de entrada', type: 'number', prefix: 'US$', min: 0, step: 0.01, value: 40000, thousands: true },
    {
      id: 'precioActual',
      label: 'Precio actual del mercado',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 0.01,
      value: 39000,
      thousands: true,
      help: 'Sirve para ver dónde está el precio hoy entre tu entrada y la liquidación.',
    },
    {
      id: 'leverage',
      label: 'Apalancamiento',
      type: 'number',
      suffix: 'x',
      min: 1,
      max: 125,
      step: 1,
      value: 10,
      help: 'Cuántas veces multiplicás tu margen. Con 10x, una caída del 10% ya se acerca a la liquidación.',
    },
    {
      id: 'mantenimiento',
      label: 'Margen de mantenimiento',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 50,
      step: 0.05,
      value: 0.5,
      help: 'Porcentaje mínimo del nocional que el exchange exige para no liquidarte. Suele ir de 0,4% a 1% y crece con el tamaño de la posición.',
    },
    {
      id: 'tamanoPosicion',
      label: 'Tamaño de la posición (nocional)',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 100,
      value: 10000,
      thousands: true,
      help: 'El valor total que estás moviendo, no lo que pusiste de margen.',
    },
    { id: 'capital', label: 'Capital total de la cuenta', type: 'number', prefix: 'US$', min: 0, step: 100, value: 5000, thousands: true },
    {
      id: 'riesgoPct',
      label: 'Riesgo por operación',
      type: 'number',
      suffix: '%',
      min: 0.01,
      max: 100,
      step: 0.1,
      value: 2,
      help: 'Porcentaje del capital que aceptás perder si salta el stop. La gestión de riesgo clásica recomienda entre 1% y 2%.',
    },
    { id: 'precioStop', label: 'Precio del stop-loss', type: 'number', prefix: 'US$', min: 0, step: 0.01, value: 38000, thousands: true },
    { id: 'stopPips', label: 'Stop-loss en forex', type: 'number', suffix: 'pips', min: 0.1, step: 0.1, value: 30 },
    {
      id: 'valorPipLote',
      label: 'Valor del pip por lote estándar',
      type: 'number',
      prefix: 'US$',
      min: 0.01,
      step: 0.01,
      value: 10,
      help: 'En los pares que cotizan contra el dólar suele ser 10 dólares por pip por lote estándar de 100.000 unidades.',
    },
    {
      id: 'fundingRate',
      label: 'Tasa de funding por período de 8 horas',
      type: 'number',
      suffix: '%',
      min: -5,
      max: 5,
      step: 0.001,
      value: 0.01,
      help: 'Positiva significa que los long le pagan a los short. El valor neutral de referencia en la mayoría de los perpetuos ronda 0,01%.',
    },
    {
      id: 'direccionFunding',
      label: 'Lado de la posición en el perpetuo',
      type: 'select',
      value: 'long',
      options: [
        { value: 'long', label: 'Long: compro el perpetuo' },
        { value: 'short', label: 'Short: vendo el perpetuo' },
      ],
    },
    {
      id: 'dolar',
      label: 'Dólar cripto para pasar a pesos',
      type: 'number',
      prefix: '$',
      min: 0,
      step: 1,
      value: 0,
      thousands: true,
      help: 'Viene cargado con el dólar cripto del día. Sirve para ver en pesos lo que arriesgás.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde está el precio entre tu entrada y la liquidación',
    caption:
      'La franja verde es el colchón que te queda, la roja es la zona en la que ya estás en terreno de liquidación. El marcador es el precio actual del mercado.',
  },
  breakdownTitle: 'Qué compone tu riesgo',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cuadro.',

  answer: undefined,

  faq: [
    {
      q: '¿Cómo se calcula el precio de liquidación?',
      a: 'Partiendo de tu precio de entrada, se le resta —en un long— la distancia que corresponde a tu apalancamiento menos el margen de mantenimiento que exige el exchange. Con 10x y 0,5% de mantenimiento, la liquidación queda alrededor de 9,5% por debajo de la entrada. En un short el cálculo es el mismo pero hacia arriba.',
    },
    {
      q: '¿Por qué me liquidaron antes del precio que había calculado?',
      a: 'Por tres motivos habituales. El exchange descuenta las comisiones de apertura y cierre del margen disponible. El funding acumulado también lo va reduciendo. Y, sobre todo, el margen de mantenimiento no es fijo: sube por tramos a medida que crece el tamaño de la posición, así que en posiciones grandes la liquidación queda más cerca que en el ejemplo genérico.',
    },
    {
      q: '¿Qué diferencia hay entre margen aislado y margen cruzado?',
      a: 'Con margen aislado, la posición sólo puede perder el margen que le asignaste: si se liquida, el resto de la cuenta queda intacto. Con margen cruzado, todo el saldo disponible sostiene la posición, así que la liquidación queda mucho más lejos pero, cuando llega, se lleva la cuenta entera. El cálculo de esta página es el de margen aislado, que es el caso conservador.',
    },
    {
      q: '¿Qué es el margen de mantenimiento?',
      a: 'Es el porcentaje mínimo del valor de la posición que tenés que conservar como garantía. Si tu margen cae por debajo de ese umbral, el exchange cierra la posición para no quedar expuesto. Cuanto más alto es ese porcentaje, más cerca de tu entrada queda la liquidación.',
    },
    {
      q: '¿Cuánto debería arriesgar por operación?',
      a: 'La gestión de riesgo clásica sugiere entre 1% y 2% del capital por operación. Con 2%, hacen falta muchas operaciones perdedoras seguidas para dañar la cuenta de forma difícil de revertir; con 10%, alcanzan unas pocas. El tamaño de la posición se deduce de ese número y de la distancia a tu stop, no al revés.',
    },
    {
      q: '¿Por qué el tamaño de la posición depende del stop?',
      a: 'Porque lo que arriesgás es el tamaño multiplicado por la distancia hasta el stop. Si el stop está lejos, tenés que operar más chico para arriesgar lo mismo; si está cerca, podés operar más grande. Es la única forma de que operaciones distintas tengan el mismo impacto en la cuenta.',
    },
    {
      q: '¿Qué pasa si la liquidación queda antes que mi stop?',
      a: 'Que el stop es decorativo: el exchange te va a cerrar la posición antes de que el precio llegue a él, y vas a perder todo el margen en lugar de la pérdida acotada que habías planeado. La solución es bajar el apalancamiento, achicar la posición o acercar el stop hasta que la liquidación quede del otro lado.',
    },
    {
      q: '¿Qué es el funding rate en un contrato perpetuo?',
      a: 'Es un pago periódico entre las dos puntas del mercado que mantiene al perpetuo pegado al precio de contado, ya que el contrato no tiene vencimiento que lo fuerce a converger. Cuando la tasa es positiva pagan los long y cobran los short; cuando es negativa, al revés. En la mayoría de los mercados se liquida cada ocho horas.',
    },
    {
      q: '¿El funding puede liquidarme aunque el precio no se mueva?',
      a: 'Sí. El funding se descuenta del margen, y si la tasa se mantiene en contra tuyo durante suficiente tiempo, ese margen se agota y la posición termina liquidada sin que el precio se haya movido. Por eso el cálculo muestra en cuántos días el funding se come el margen inicial al ritmo actual.',
    },
    {
      q: '¿Cuánto vale un pip en forex?',
      a: 'En los pares que cotizan contra el dólar, un pip por lote estándar de 100.000 unidades vale diez dólares; un lote mini vale un dólar y un micro, diez centavos. En pares donde el dólar no es la moneda cotizada el valor cambia con el tipo de cambio del momento, así que conviene tomarlo de la plataforma antes de dimensionar.',
    },
    {
      q: '¿Un apalancamiento más alto significa más riesgo por sí solo?',
      a: 'Aumenta el riesgo de liquidación, porque acerca el precio de liquidación a tu entrada. Pero el riesgo de la operación lo define el tamaño de la posición y la distancia al stop, no el multiplicador: podés tener 20x sobre una posición chiquita y arriesgar menos que con 3x sobre una posición enorme. Lo que nunca cambia es que a mayor apalancamiento, menos margen de error.',
    },
    {
      q: '¿Estos números incluyen comisiones e impuestos?',
      a: 'No. El resultado es el bruto de la mecánica de la posición: no descuenta comisiones de apertura ni de cierre, ni el spread, ni impuestos. Todos esos costos empujan la liquidación un poco más cerca y achican el resultado final, así que tomá los números como el escenario optimista.',
    },
  ],

  sources: [
    {
      name: 'Futuros perpetuos: margen, liquidación y funding rate',
      url: 'https://www.binance.com/es/support/faq/detail/360033525271',
      publisher: 'Binance',
    },
    {
      name: 'Contratos perpetuos — margen de mantenimiento y precio de liquidación',
      url: 'https://www.bybit.com/en/help-center/article/Liquidation-Price-USDT-Contract',
      publisher: 'Bybit',
    },
    {
      name: 'Advertencias sobre productos apalancados y riesgo de pérdida total',
      url: 'https://www.esma.europa.eu/investors-corner',
      publisher: 'Autoridad Europea de Valores y Mercados (ESMA)',
    },
    {
      name: 'Guía del inversor — riesgos de los instrumentos derivados',
      url: 'https://www.argentina.gob.ar/cnv',
      publisher: 'Comisión Nacional de Valores',
    },
  ],

  replaces: [
    '/calculadora-apalancamiento-liquidacion',
    '/calculadora-leverage-trading-liquidacion-precio',
    '/calculadora-perpetual-liquidation-funding-binance-bybit-bitget',
    '/calculadora-position-size-cripto-leverage',
    '/calculadora-position-size-forex-pips-riesgo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Qué lado del mercado mira cada rama. */
export const CASE_SIDE: Record<string, 'long' | 'short'> = {
  long: 'long',
  short: 'short',
  'size-cripto': 'long',
  'size-forex': 'long',
  funding: 'long',
};
