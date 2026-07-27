import type { HubData } from './types';

/**
 * Hub de decisión — "¿Me conviene pagar con millas o con plata?"
 * Absorbe 8 calculadoras sueltas (ver `replaces`).
 *
 * EL NÚMERO QUE UNIFICA TODO es el valor del punto en centavos de dólar:
 *
 *     cpm = (precio en plata − tasas que pagás igual) / millas × 100
 *
 * Por encima de la referencia del programa conviene canjear; por debajo,
 * conviene pagar en plata y guardar las millas. Todas las ramas del hub
 * terminan en ese mismo número y el gráfico lo ubica contra la referencia.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Acá casi NADA es pesos: hay millas, dólares y centavos de dólar por milla.
 *    El runtime hace Object.assign(base, over), así que una fila sin `format`
 *    propio NO hereda el del resultado y saldría con "$". Cada fila declara el
 *    suyo (ver el <script> de la página).
 *  - `chart.type: 'scale'`: hay que devolver `position` (0-100) y
 *    `positionLabel`. La escala va de 0 a 4,5 ¢/milla, que cubre desde el canje
 *    malo hasta el premium sin achatar el marcador.
 *
 * COLISIÓN DE RUTA (reportada): el silo ya tiene `/viajes/millas`, que es otro
 * hub (catálogo "¿cuántas millas necesito para este destino?"). Éste es la
 * pregunta de decisión — canjear o pagar — y vive en su propia URL.
 */

/** Referencia de valor por milla, en centavos de dólar. */
export interface ProgramaRef {
  label: string;
  /** Valor de referencia del punto, en ¢USD. Es editorial, no oficial. */
  cpmRef: number;
  /**
   * Millas acreditadas por km volado en tarifa económica estándar.
   * 0 = el programa no acredita por distancia (puntos de tarjeta).
   */
  millasPorKm: number;
}

/**
 * Referencias por programa.
 *
 * Los cinco programas que también vivían en `src/lib/hubs/millas.ts`
 * (LifeMiles, LATAM, AAdvantage, MileagePlus, SkyMiles) usan EXACTAMENTE el
 * mismo `centavosPorMilla` que ese hub, para que las dos páginas no se
 * contradigan. Smiles, Aerolíneas Plus y Miles & More vienen de
 * `src/lib/formulas/valor-millas-viajero-frecuente.ts`.
 *
 * OJO: son referencias editoriales de mercado, no valores oficiales. Ningún
 * programa publica cuánto vale su milla.
 */
export const PROGRAMAS: Record<string, ProgramaRef> = {
  'lifemiles': { label: 'LifeMiles (Avianca)', cpmRef: 1.6, millasPorKm: 0.5 },
  'latam-pass': { label: 'LATAM Pass', cpmRef: 1.2, millasPorKm: 0.6 },
  'aadvantage': { label: 'AAdvantage (American)', cpmRef: 1.4, millasPorKm: 0.7 },
  'mileageplus': { label: 'MileagePlus (United)', cpmRef: 1.3, millasPorKm: 0.5 },
  'skymiles': { label: 'SkyMiles (Delta)', cpmRef: 1.1, millasPorKm: 0.5 },
  'smiles': { label: 'Smiles (Gol)', cpmRef: 1.5, millasPorKm: 0.5 },
  'aerolineas-plus': { label: 'Aerolíneas Plus', cpmRef: 1.2, millasPorKm: 0.5 },
  'miles-and-more': { label: 'Miles & More (Lufthansa)', cpmRef: 1.4, millasPorKm: 0.5 },
  'amex-mr': { label: 'Amex Membership Rewards', cpmRef: 2.0, millasPorKm: 0 },
  'generico': { label: 'Otro programa', cpmRef: 1.3, millasPorKm: 0.5 },
};

/**
 * Valor por punto según el canal de canje de un programa de tarjeta
 * (Amex Membership Rewards y equivalentes), en ¢USD.
 * Viene de `src/lib/formulas/puntos-amex-membership-rewards.ts`.
 */
export const CANALES: Record<string, { label: string; cpp: number }> = {
  'transferencia-aerolinea': { label: 'Transferir a una aerolínea', cpp: 2.0 },
  'amex-travel': { label: 'Reservar en el portal de viajes', cpp: 1.0 },
  'cashback': { label: 'Cashback / crédito en el resumen', cpp: 0.6 },
  'productos': { label: 'Catálogo de productos o gift cards', cpp: 0.5 },
};

/** Multiplicador de acreditación por cabina (económica = 1). */
export const MULT_CLASE: Record<string, number> = {
  economica: 1,
  premiumeconomy: 1,
  business: 2.5,
  first: 2.5,
};

/** Benchmark de mercado del upgrade, en USD por hora de vuelo. */
export const BENCH_UPGRADE: Record<string, { barato: number; promedio: number; caro: number }> = {
  premiumeconomy: { barato: 15, promedio: 30, caro: 60 },
  business: { barato: 70, promedio: 120, caro: 250 },
  first: { barato: 150, promedio: 250, caro: 500 },
  economica: { barato: 15, promedio: 30, caro: 60 },
};

const DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'viajes/valen-millas',
  title: '¿Millas o plata? Cuánto vale cada milla y cuándo conviene canjear',
  description:
    'Calculá el valor de tus millas o puntos en centavos de dólar y decidí si canjeás o pagás en efectivo: canje de vuelo, upgrade, puntos de tarjeta, millas que vas a acumular y valor de todo tu saldo.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Decisión de viaje',
  h1: 'Tenés millas juntadas. ¿Las quemás o pagás en plata?',
  lede:
    'Hay un solo número que responde la pregunta: cuántos centavos de dólar te rinde cada milla en este canje concreto. Si supera la referencia de tu programa, canjeá. Si no, pagá en efectivo y guardá las millas.',
  stamps: ['Referencias de valor por programa', '8 calculadoras adentro', 'Sirve para millas y para puntos de tarjeta'],

  resultLabel: 'Valor de cada milla',

  cases: {
    title: '¿Qué estás por decidir?',
    intro: 'Arrancamos por el caso más común: un pasaje que podés pagar con millas o con plata.',
    items: [
      {
        id: 'canje',
        label: 'Canjear un pasaje con millas',
        hint: 'El caso más común',
        answer: 'Canjeá sólo si cada milla rinde más que la referencia de tu programa.',
        yes: [
          'Se calcula (precio en plata − tasas que pagás igual) ÷ millas × 100 = centavos por milla',
          'Las tasas e impuestos del canje se restan del ahorro: se pagan con plata aunque uses millas',
          'El resultado se compara contra el valor de referencia del programa que elegiste',
        ],
        warn: [
          DISCLAIMER,
          'Compará contra el precio real que pagarías vos, no contra la tarifa flexible más cara que muestra la aerolínea',
          'Si las tasas igualan o superan el precio en efectivo, el canje destruye valor: no hay ahorro que repartir',
        ],
        plazo: 'los cuadros de millas cambian sin aviso: si la cuenta cierra, la disponibilidad dura lo que dura.',
      },
      {
        id: 'pesos',
        label: 'El pasaje lo veo en pesos',
        hint: 'Millas contra pesos argentinos',
        answer: 'Mismo cálculo, expresado en pesos por milla.',
        yes: [
          'Se usa la cotización que cargues para pasar el valor por milla de centavos de dólar a pesos',
          'Sirve para comparar contra una promo bancaria o una cuota sin interés en pesos',
        ],
        warn: [
          DISCLAIMER,
          'Con inflación y saltos de tipo de cambio, el valor en pesos envejece rápido: mirá siempre también el número en centavos de dólar',
          'Las tasas del canje suelen cobrarse en dólares aunque el pasaje esté cotizado en pesos',
        ],
        plazo: 'actualizá la cotización el mismo día que comparás: es el dato que más se mueve.',
      },
      {
        id: 'puntos-tarjeta',
        label: 'Son puntos de tarjeta, no millas',
        hint: 'Amex Membership Rewards y afines',
        answer: 'El canal de canje decide casi todo el valor del punto.',
        yes: [
          'Cada canal rinde distinto: transferir a una aerolínea vale mucho más que el catálogo o el cashback',
          'Se muestra cuánto vale tu saldo en cada canal y cuánto perdés eligiendo el peor',
        ],
        warn: [
          DISCLAIMER,
          'Transferir puntos a una aerolínea es irreversible: no se puede volver atrás si después no hay disponibilidad',
          'El valor de la transferencia recién se realiza cuando encontrás un canje bueno; si terminás usando esas millas mal, el punto valió menos',
        ],
        plazo: 'antes de transferir, buscá el vuelo y confirmá que hay lugar en tarifa premio.',
      },
      {
        id: 'upgrade',
        label: 'Pagar un upgrade de clase',
        hint: 'Business o premium economy',
        answer: 'Un upgrade se juzga por lo que cuesta cada hora arriba del avión.',
        yes: [
          'Se calcula el valor por milla del upgrade y, además, cuánto te sale la hora de vuelo en la clase que elegiste',
          'Se compara contra el rango de mercado de esa cabina: barato, promedio y caro por hora',
        ],
        warn: [
          DISCLAIMER,
          'En vuelos de menos de 3 horas casi nunca cierra: pagás lo mismo por hora y aprovechás la mitad',
          'Un upgrade sin cama plana en vuelo nocturno rinde bastante menos de lo que parece',
        ],
        plazo: 'los upgrades con millas suelen abrirse recién al check-in: no cuentes con el asiento hasta tenerlo.',
      },
      {
        id: 'acumular',
        label: 'Cuánto valen las millas que voy a ganar',
        hint: 'Vuelo que estoy por comprar',
        answer: 'Las millas del vuelo valen mucho menos de lo que parece.',
        yes: [
          'Se estiman las millas que acredita el vuelo según la distancia, el programa y la cabina',
          'Se traducen a dólares con el valor de referencia del programa, para que las compares contra el precio del pasaje',
        ],
        warn: [
          DISCLAIMER,
          'Las millas acreditadas nunca son motivo suficiente para pagar un pasaje más caro: rara vez compensan la diferencia',
          'Con estatus elite podés acreditar dos o tres veces más; sin estatus, tomá el número de acá como piso',
        ],
        plazo: 'las millas suelen acreditarse entre 7 y 30 días después de volar.',
      },
      {
        id: 'stock',
        label: 'Cuánto vale todo mi saldo',
        hint: 'Las millas que ya tengo',
        answer: 'Tu saldo vale lo que rinda el canje, no lo que dice el programa.',
        yes: [
          'Se valúa el saldo entero al valor de referencia del programa, en dólares y en pesos',
          'Sirve para dimensionar si conviene comprar millas, esperar una promo o quemarlas ya',
        ],
        warn: [
          DISCLAIMER,
          'Las millas no son plata: no rinden interés, se devalúan cuando el programa sube los cuadros y muchas vencen',
          'El valor de referencia es un promedio: el canje concreto puede rendir el doble o la mitad',
        ],
        plazo: 'revisá el vencimiento de tu saldo: en varios programas se cae a los 12 o 24 meses sin actividad.',
      },
    ],
  },

  inputsTitle: 'Los datos del canje',
  inputsIntro:
    'Cada caso usa los campos que necesita; los demás quedan de referencia. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'programa',
      label: 'Programa de millas o puntos',
      type: 'select',
      value: 'lifemiles',
      options: Object.entries(PROGRAMAS).map(([value, p]) => ({ value, label: p.label })),
      help: 'Define el valor de referencia contra el que se compara tu canje.',
    },
    {
      id: 'millas',
      label: 'Millas o puntos que te piden (o que tenés)',
      value: '60.000',
      thousands: true,
    },
    {
      id: 'precioCash',
      label: 'Precio en plata del mismo vuelo (USD)',
      type: 'number',
      min: 0,
      value: 900,
      help: 'En el caso "upgrade" cargá acá lo que sale el upgrade en efectivo. Si lo tenés en pesos, dividilo por la cotización.',
    },
    {
      id: 'tasas',
      label: 'Tasas e impuestos del canje (USD)',
      type: 'number',
      min: 0,
      value: 120,
      help: 'Se pagan con plata aunque uses millas, así que se restan del ahorro.',
    },
    {
      id: 'cotizacion',
      label: 'Cotización del dólar (pesos por USD)',
      value: '1.400',
      thousands: true,
    },
    {
      id: 'clase',
      label: 'Cabina',
      type: 'select',
      value: 'economica',
      options: [
        { value: 'economica', label: 'Económica' },
        { value: 'premiumeconomy', label: 'Premium economy' },
        { value: 'business', label: 'Business' },
        { value: 'first', label: 'First' },
      ],
    },
    {
      id: 'horas',
      label: 'Duración del vuelo (horas)',
      type: 'number',
      min: 0.5,
      step: 0.5,
      value: 10,
      help: 'Sólo se usa para juzgar el upgrade.',
    },
    {
      id: 'km',
      label: 'Distancia del vuelo (km)',
      value: '8.500',
      thousands: true,
      help: 'Sólo se usa para estimar las millas que vas a acumular.',
    },
    {
      id: 'canal',
      label: 'Canal de canje de los puntos de tarjeta',
      type: 'select',
      value: 'transferencia-aerolinea',
      options: Object.entries(CANALES).map(([value, c]) => ({ value, label: c.label })),
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu canje',
    caption:
      'La barra va de 0 a 4,5 centavos de dólar por milla. El marcador es tu canje; las franjas son las zonas donde conviene pagar en plata, donde la cosa está pareja y donde conviene canjear.',
    bands: [
      { label: 'No canjear', from: 0, to: 1, tone: 'bad' },
      { label: 'Flojo', from: 1, to: 1.5, tone: 'warn' },
      { label: 'Buen canje', from: 1.5, to: 2, tone: 'good' },
      { label: 'Excelente', from: 2, to: 3, tone: 'good' },
      { label: 'Premium', from: 3, to: 4.5, tone: 'good' },
    ],
  },
  breakdownTitle: 'De dónde sale ese número',
  breakdownIntro: 'Cada fila trae su unidad: hay millas, dólares, pesos y centavos de dólar por milla.',

  faq: [
    {
      q: '¿Cómo se calcula el valor de una milla?',
      a: 'Restá al precio en efectivo del pasaje las tasas e impuestos que pagás igual al canjear, dividí por las millas que te piden y multiplicá por 100. El resultado son centavos de dólar por milla. Ejemplo: un pasaje de US$ 900 con US$ 120 de tasas por 60.000 millas rinde (900 − 120) ÷ 60.000 × 100 = 1,30 ¢ por milla.',
    },
    {
      q: '¿A partir de qué valor conviene canjear?',
      a: 'La referencia de mercado ronda 1,3 a 1,6 ¢ por milla según el programa. Por encima de la referencia de tu programa, canjear te deja mejor parado que pagar. Por debajo, conviene pagar en efectivo y guardar las millas para un canje más caro, típicamente business en tramos largos.',
    },
    {
      q: '¿Por qué hay que restar las tasas e impuestos?',
      a: 'Porque salen de tu bolsillo igual: canjeando no ahorrás el precio completo del pasaje, ahorrás el precio menos las tasas. Ignorarlas infla el valor de la milla y es el error más común. En rutas con tasas altas puede pasar que el canje directamente no ahorre nada.',
    },
    {
      q: '¿Vale lo mismo una milla que un punto de tarjeta?',
      a: 'No. Un punto de tarjeta vale lo que rinda el canal por el que lo uses: transferir a una aerolínea suele valer cerca de 2 ¢, el portal de viajes alrededor de 1 ¢, el cashback 0,6 ¢ y el catálogo de productos 0,5 ¢. Elegir mal el canal te puede costar tres cuartas partes del valor.',
    },
    {
      q: '¿Conviene comprar millas para completar un canje?',
      a: 'Sólo si el precio al que las comprás es menor que lo que van a rendir en el canje concreto. Calculá primero el valor por milla del canje y después mirá el precio de compra: si comprás a 2 ¢ para un canje que rinde 1,3 ¢, estás perdiendo plata.',
    },
    {
      q: '¿Sirve pagar un pasaje más caro para sumar millas?',
      a: 'Casi nunca. En económica se acredita del orden de media milla por kilómetro volado, así que un tramo de 8.500 km deja unas 4.250 millas: cerca de US$ 60 de valor a la referencia de mercado. Rara vez cubre la diferencia entre dos tarifas.',
    },
    {
      q: '¿Cuándo conviene pagar el upgrade y cuándo no?',
      a: 'Mirá el costo por hora de vuelo. En business el rango de mercado va de unos US$ 70 la hora (barato) a US$ 250 (caro). En vuelos de menos de tres horas el upgrade rinde poco, y en nocturnos sin cama plana también: la ventaja principal es dormir.',
    },
    {
      q: '¿Las millas se devalúan?',
      a: 'Sí, y de dos maneras: los programas suben los cuadros de millas necesarias sin aviso, y muchos saldos vencen por inactividad. Por eso tener millas quietas tiene un costo, y por eso un canje apenas por encima de la referencia suele ser mejor que esperar el canje perfecto.',
    },
    {
      q: '¿Qué canje rinde más valor por milla?',
      a: 'Los tramos largos en business y first, donde el precio en efectivo se dispara pero las millas necesarias suben mucho menos. Ahí es donde una milla puede pasar de 1,3 ¢ a 3 o 4 ¢. Los tramos cortos en económica, con tarifas promocionales baratas, son el peor uso posible.',
    },
    {
      q: '¿El valor de referencia de cada programa es oficial?',
      a: 'No. Ningún programa publica cuánto vale su milla, justamente porque no quiere que hagas esta cuenta. Las referencias que usamos son promedios de mercado y sirven como umbral de decisión, no como precio garantizado.',
    },
    {
      q: '¿Y si el pasaje está en pesos?',
      a: 'Pasá el precio a dólares con la cotización del día y hacé la misma cuenta. El caso "el pasaje lo veo en pesos" te devuelve además cuántos pesos rinde cada milla, para comparar contra una promo bancaria o cuotas sin interés.',
    },
    {
      q: '¿Conviene canjear millas por productos o gift cards?',
      a: 'Es el peor canje disponible en casi todos los programas: alrededor de 0,5 ¢ por punto, cuatro veces menos que transferir a una aerolínea. Se justifica sólo si tus puntos están por vencer y no tenés ningún viaje a la vista.',
    },
  ],

  sources: [
    {
      name: 'LifeMiles — términos y condiciones del programa',
      url: 'https://www.lifemiles.com/how/terms',
      publisher: 'Avianca LifeMiles',
    },
    {
      name: 'LATAM Pass — canje de pasajes y tabla de millas',
      url: 'https://www.latamairlines.com/ar/es/latam-pass',
      publisher: 'LATAM Airlines',
    },
    {
      name: 'AAdvantage — award travel y cargos asociados',
      url: 'https://www.aa.com/i18n/aadvantage-program/aadvantage-program.jsp',
      publisher: 'American Airlines',
    },
    {
      name: 'MileagePlus — award chart y tasas',
      url: 'https://www.united.com/en/us/fly/mileageplus.html',
      publisher: 'United Airlines',
    },
    {
      name: 'Membership Rewards — canales de canje y valores',
      url: 'https://www.americanexpress.com/en-us/rewards/membership-rewards',
      publisher: 'American Express',
    },
    {
      name: 'Aerolíneas Plus — reglamento del programa',
      url: 'https://www.aerolineas.com.ar/aerolineasplus',
      publisher: 'Aerolíneas Argentinas',
    },
  ],

  replaces: [
    '/calculadora-millaje-frecuente-aerolineas-argentinas-programas',
    '/calculadora-puntos-amex-membership-rewards',
    '/calculadora-pasaje-aereo-millas-vs-pesos-canjear',
    '/calculadora-valor-millas-punto-centavos',
    '/calculadora-descuento-vuelo-millas-vs-cash',
    '/calculadora-upgrade-clase-avion-costo',
    '/calculadora-valor-millas-viajero-frecuente',
    '/calculadora-puntos-vs-cash-vuelo-cuando-conviene',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
