import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto vale esta opción y a partir de qué precio gano?"
 * Absorbe la calculadora de Black-Scholes y la de break-even: son la misma
 * pregunta partida al medio (cuánto vale la prima / desde dónde gano).
 */

/** Disclaimer YMYL inversión, textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

export const hub: HubData = {
  slug: 'inversiones/opciones-call-put',
  title: '¿Cuánto vale una opción y desde qué precio gano? — Call y put con Black-Scholes',
  description:
    'Prima teórica por Black-Scholes, punto de equilibrio, valor intrínseco y temporal, pérdida máxima y P&L de tu call o put. Con la tasa de referencia del BCRA cargada.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Guía y valuación de opciones',
  h1: 'Comprás una opción: ¿cuánto vale y desde qué precio ganás?',
  lede:
    'Partimos del caso más habitual: comprás un call. Ya podés ver la prima teórica y el punto de equilibrio, y ajustarlo con tus datos. Si tu operación es otra, la cambiás abajo.',
  stamps: ['Modelo Black-Scholes', 'Tasa de referencia del BCRA', '2 calculadoras adentro'],

  resultLabel: 'Prima teórica',

  cases: {
    title: '¿Qué estás por hacer?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'call',
        label: 'Compro un call',
        hint: 'Apuesto a que sube',
        answer: 'Con un call comprado ganás recién arriba del strike más la prima.',
        yes: [
          'Prima teórica del call por Black-Scholes',
          'Punto de equilibrio = strike + prima pagada',
          'Cuánto de la prima es valor intrínseco y cuánto valor temporal',
          'Pérdida máxima acotada a la prima; ganancia teóricamente ilimitada',
        ],
        warn: [
          DISCLAIMER,
          'El valor temporal se evapora solo: si el subyacente se queda quieto, la prima cae igual día a día',
        ],
        plazo: 'cada contrato estándar equivale a 100 unidades del subyacente.',
      },
      {
        id: 'put',
        label: 'Compro un put',
        hint: 'Apuesto a que baja o me cubro',
        answer: 'Con un put comprado ganás por debajo del strike menos la prima.',
        yes: [
          'Prima teórica del put por Black-Scholes',
          'Punto de equilibrio = strike − prima pagada',
          'Pérdida máxima acotada a la prima',
          'Ganancia máxima si el subyacente se va a cero',
        ],
        warn: [
          DISCLAIMER,
          'Si lo usás como cobertura de una tenencia, la prima es el costo del seguro: se pierde aunque nunca lo ejerzas',
        ],
        plazo: 'la cobertura sólo vale hasta el vencimiento que elegiste.',
      },
      {
        id: 'lanzar',
        label: 'Lanzo (vendo) una opción',
        hint: 'Cobro la prima',
        answer: 'Lanzando cobrás la prima por adelantado, pero el riesgo se da vuelta.',
        yes: [
          'La prima teórica es lo que cobrás por adelantado',
          'Tu ganancia máxima es esa prima y nada más',
          'El punto de equilibrio es el mismo, pero leído al revés',
        ],
        warn: [
          DISCLAIMER,
          'Lanzar un call descubierto tiene pérdida teóricamente ilimitada y exige garantías: no es la operación espejo de comprar',
          'El resultado de acá no contempla las garantías que te exige el mercado ni los llamados a integrar margen',
        ],
        plazo: 'revisá el margen exigido antes de lanzar, no después.',
      },
      {
        id: 'break-even',
        label: 'Ya sé la prima, quiero el punto de equilibrio',
        hint: 'Sin modelo',
        answer: 'Con la prima real de mercado el break-even sale de una resta.',
        yes: [
          'Punto de equilibrio con la prima que pagaste de verdad',
          'Cuánto tiene que moverse el subyacente, en porcentaje, para llegar',
          'Costo total de la posición y resultado si la cerrases hoy',
        ],
        warn: [
          DISCLAIMER,
          'El break-even ignora comisiones, derechos de mercado e impuestos: en la práctica el precio de equilibrio te queda un poco más lejos',
        ],
        plazo: 'el punto de equilibrio sólo aplica al vencimiento; antes manda el valor temporal.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'subyacente', label: 'Precio actual del subyacente', type: 'number', prefix: '$', min: 0, step: 0.01, value: 105 },
    { id: 'strike', label: 'Strike (precio de ejercicio)', type: 'number', prefix: '$', min: 0, step: 0.01, value: 100 },
    { id: 'dias', label: 'Días hasta el vencimiento', type: 'number', min: 1, value: 60 },
    {
      id: 'volatilidad',
      label: 'Volatilidad anual estimada',
      type: 'number',
      suffix: '%',
      min: 1,
      step: 1,
      value: 35,
      help: 'Es la volatilidad implícita del mercado, no la histórica de tu planilla. Cuanto más alta, más cara la prima.',
    },
    {
      id: 'tasa',
      label: 'Tasa libre de riesgo anual',
      type: 'number',
      suffix: '%',
      min: 0,
      step: 0.01,
      value: 0,
      help: 'Viene cargada con la tasa de plazo fijo a 30 días que publica el BCRA. Si operás opciones en dólares, poné la tasa del Tesoro de EE. UU.',
    },
    {
      id: 'prima',
      label: 'Prima real de mercado (0 = usar la teórica)',
      type: 'number',
      prefix: '$',
      min: 0,
      step: 0.01,
      value: 0,
      help: 'Si dejás 0, el punto de equilibrio se calcula con la prima que devuelve el modelo.',
    },
    { id: 'contratos', label: 'Cantidad de contratos', type: 'number', min: 1, max: 1000, value: 1 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde está el precio respecto de tu punto de equilibrio',
    caption:
      'La franja roja es la zona donde la opción no cubre la prima; la verde, desde el punto de equilibrio en adelante. El marcador es el precio de hoy.',
  },
  breakdownTitle: 'Qué compone la prima y tu resultado',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cuadro.',

  answer: undefined,

  faq: [
    {
      q: '¿Qué es exactamente el punto de equilibrio de una opción?',
      a: 'Es el precio que tiene que alcanzar el subyacente al vencimiento para que la operación no te deje ni ganancia ni pérdida. En un call comprado es strike + prima; en un put comprado, strike − prima. Por debajo (o por encima) de ese número seguís perdiendo la prima.',
    },
    {
      q: '¿Por qué la prima teórica no coincide con el precio que veo en pantalla?',
      a: 'Black-Scholes devuelve un valor de referencia con los supuestos que le cargaste. El precio real lo fija la oferta y la demanda, y suele diferir sobre todo por la volatilidad implícita que el mercado está descontando y por la liquidez de esa serie. Si la prima de mercado es más cara, el mercado está pagando más volatilidad que la que vos pusiste.',
    },
    {
      q: '¿Qué es el valor intrínseco y qué es el valor temporal?',
      a: 'El valor intrínseco es lo que valdría la opción si venciera hoy: en un call, el subyacente menos el strike, con piso en cero. El valor temporal es todo el resto de la prima, o sea lo que se paga por la chance de que el precio se mueva a favor antes del vencimiento. Ese pedazo se consume solo con el paso de los días.',
    },
    {
      q: '¿Cuánto puedo perder comprando una opción?',
      a: 'Como comprador, la pérdida máxima es la prima que pagaste, sin importar cuánto se mueva el subyacente en contra. Es la característica que distingue comprar opciones de operar apalancado: no hay llamado a integrar margen ni liquidación forzada.',
    },
    {
      q: '¿Y lanzando una opción?',
      a: 'Se da vuelta. Lo máximo que ganás es la prima que cobraste, y la pérdida puede ser muy grande: en un call lanzado sin tener el subyacente, teóricamente ilimitada. Por eso el mercado exige garantías y las va ajustando mientras la posición está abierta.',
    },
    {
      q: '¿Qué significa que una opción esté in the money o out of the money?',
      a: 'Un call está in the money cuando el subyacente cotiza por encima del strike, y out of the money cuando está por debajo; en el put es al revés. At the money es cuando están prácticamente iguales. Una opción out of the money es toda valor temporal: si vence así, no vale nada.',
    },
    {
      q: '¿Cuántas acciones representa un contrato?',
      a: 'El estándar es 100 unidades del subyacente por contrato, así que una prima de $5 significa un desembolso de $500 por contrato. En el mercado local hay series con otros lotes: confirmá el lote de la especie antes de multiplicar.',
    },
    {
      q: '¿Qué son d1 y d2?',
      a: 'Son los dos términos intermedios de Black-Scholes. d2, pasado por la normal acumulada, se lee como la probabilidad aproximada de que la opción termine in the money bajo los supuestos del modelo; d1 se usa para la sensibilidad de la prima al precio del subyacente. Sirven de referencia, no de pronóstico.',
    },
    {
      q: '¿Qué tasa libre de riesgo tengo que poner?',
      a: 'La de la moneda en la que está denominada la opción. Para opciones en pesos, el campo viene cargado con la tasa de plazo fijo a 30 días que publica el BCRA. Para opciones en dólares corresponde el rendimiento de los bonos del Tesoro de EE. UU. al plazo del vencimiento.',
    },
    {
      q: '¿Cuánto pesa la tasa en el resultado?',
      a: 'Mucho menos que la volatilidad y que el tiempo al vencimiento. En plazos cortos, mover la tasa unos puntos cambia la prima apenas; duplicar la volatilidad la cambia muchísimo. Si tenés que estimar un solo dato con cuidado, que sea la volatilidad.',
    },
    {
      q: '¿El modelo sirve para opciones que se pueden ejercer antes del vencimiento?',
      a: 'Black-Scholes está pensado para ejercicio europeo, es decir sólo al vencimiento. Para opciones americanas —las más habituales sobre acciones— el valor teórico es un piso razonable, pero puede quedar corto cuando hay dividendos de por medio.',
    },
    {
      q: '¿Por qué el resultado no incluye comisiones ni impuestos?',
      a: 'Porque dependen de tu broker y de tu situación fiscal. Sumale el derecho de mercado, la comisión de compra y la de cierre: en operaciones de pocos contratos ese costo puede ser una parte relevante de la prima y corre el punto de equilibrio en tu contra.',
    },
  ],

  sources: [
    {
      name: 'Black, F. y Scholes, M. — “The Pricing of Options and Corporate Liabilities” (1973)',
      url: 'https://www.journals.uchicago.edu/doi/10.1086/260062',
      publisher: 'Journal of Political Economy',
      date: '1973',
    },
    {
      name: 'Estadísticas monetarias — tasa de plazo fijo a 30 días',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Opciones: especies, lotes y garantías',
      url: 'https://www.matbarofex.com.ar/',
      publisher: 'Matba Rofex',
    },
    {
      name: 'Guía del inversor — instrumentos derivados',
      url: 'https://www.argentina.gob.ar/cnv',
      publisher: 'Comisión Nacional de Valores',
    },
  ],

  replaces: ['/calculadora-black-scholes-opcion-call-put', '/calculadora-break-even-opciones-call-put'],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Qué opción mira cada rama y de qué lado está el usuario. */
export const CASE_MATH: Record<string, { tipo: 'call' | 'put'; lado: 1 | -1 }> = {
  call: { tipo: 'call', lado: 1 },
  put: { tipo: 'put', lado: 1 },
  lanzar: { tipo: 'call', lado: -1 },
  'break-even': { tipo: 'call', lado: 1 },
};
