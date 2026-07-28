import type { HubData } from '../types';
import { VENEZUELA_2026, RECONVERSIONES_VES } from '../../data/venezuela-2026';

/**
 * Hub de decisión VE — "¿Cuánto es esto en bolívares (o en dólares) hoy?"
 *
 * Absorbe todo el cluster cambiario: dólar BCV vs paralelo y su brecha, conversión
 * en las dos direcciones, euros, USDT de Binance P2P, remesas Zelle, vuelto en Bs.
 * pagando en dólares, bolívares a pesos colombianos, cuánto vale el sueldo en
 * divisas, la reconversión de bolívares viejos y la actualización por INPC.
 *
 * ⚠️ Las tasas del módulo son un SNAPSHOT con fecha (se refrescan por cron desde
 * src/data/live/venezuela.json). Se muestran como referencia y se precargan en los
 * campos, pero TODOS los campos de tasa son editables: en Venezuela una tasa de
 * hace una semana ya es un número falso.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Snapshot de referencia de las tasas. NO son verdad: son el default editable. */
export const FX = {
  bcv: VENEZUELA_2026.fx.bcv,
  paralelo: VENEZUELA_2026.fx.paralelo,
  fechaBcv: VENEZUELA_2026.fx.fechaBcv,
  fechaParalelo: VENEZUELA_2026.fx.fechaParalelo,
};

/** Factores fijos de las reconversiones. Son históricos: no caducan. */
export const RECONVERSIONES = RECONVERSIONES_VES.map((r) => ({
  id: r.id,
  nombre: r.nombre,
  anio: r.anio,
  ceros: r.ceros,
  factorAActual: r.factorAActual,
}));

export const hub: HubData = {
  slug: 've/finanzas/dolar-y-bolivares',
  title: 'Dólar BCV y paralelo hoy: cuánto es en bolívares (y al revés) | Venezuela',
  description:
    'Convertí entre bolívares, dólares, euros, USDT y pesos colombianos con la tasa BCV o la paralela, calculá la brecha, lo que recibe una remesa Zelle, el vuelto pagando en divisas y cuánto valen tus bolívares viejos tras las reconversiones.',
  silo: 'Finanzas',
  siloHref: '/ve/finanzas',
  locale: 've',

  eyebrow: 'Venezuela · BCV · mercado paralelo · P2P',
  h1: 'Cuánto es esto en bolívares hoy (y al revés).',
  lede:
    'En Venezuela no hay una tasa: hay dos, y la diferencia entre ellas decide cuánto plata ganás o perdés en cada operación. Esta calculadora convierte en las dos direcciones, con las dos tasas, y te muestra explícitamente la brecha para que veas cuánto te cuesta cobrar del lado equivocado.',
  stamps: [
    'Tasa BCV y paralela, ambas editables',
    'Bs. · USD · EUR · USDT · COP · reconversiones · INPC',
    '12 calculadoras adentro',
  ],

  resultLabel: 'Resultado de la conversión',

  cases: {
    title: '¿Qué operación estás haciendo?',
    intro:
      'La aritmética es la misma —multiplicar o dividir por una tasa— pero cuál tasa aplica cambia todo. Partimos de la conversión más buscada.',
    items: [
      {
        id: 'convertir',
        label: 'Solo quiero convertir un monto',
        hint: 'Bs. ↔ USD · EUR · USDT · COP',
        answer: 'Convertir es multiplicar o dividir por la tasa; lo difícil es elegir cuál de las dos.',
        yes: [
          'Conversión en las dos direcciones con la tasa que elijas',
          'La brecha entre BCV y paralelo aplicada a tu monto, en bolívares concretos',
          'Equivalencia en euros, en USDT y en pesos colombianos usando el dólar como puente',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La tasa que traemos precargada es un snapshot con fecha: verificá la del día antes de operar',
          'El euro no tiene una tasa paralela propia: se estima con la paridad EUR/USD del día',
        ],
        plazo: 'el BCV publica su tasa en días hábiles; el paralelo se mueve durante todo el día, incluso fines de semana.',
      },
      {
        id: 'remesa',
        label: 'Voy a recibir o mandar una remesa',
        hint: 'Zelle, USDT, P2P · con comisión',
        answer: 'Lo que importa en una remesa no es la tasa nominal sino la efectiva después de comisión.',
        yes: [
          'Bolívares netos que recibe el destinatario, ya descontada la comisión del cambista',
          'La tasa efectiva por cada dólar enviado, que es el número con el que hay que comparar ofertas',
          'Cuánto se queda la comisión, en dólares y en bolívares',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Algunos cambistas no cobran comisión explícita: la esconden en una tasa más baja. Compará siempre tasa EFECTIVA, no la anunciada',
          'Las operaciones P2P tienen riesgo de contraparte y de bloqueo de cuenta: no es lo mismo que un canal bancario',
        ],
        plazo: 'la tasa de una remesa se fija al momento de la operación: si el cambista tarda horas en ejecutar, el número cambió.',
      },
      {
        id: 'comercio',
        label: 'Pago en dólares y me dan vuelto en bolívares',
        hint: 'La tasa la pone el comercio',
        answer: 'El comercio aplica su propia tasa al vuelto, y suele ser peor que la del mercado.',
        yes: [
          'Precio del producto convertido a bolívares a la tasa del local',
          'Vuelto exacto en bolívares y su equivalente en dólares',
          'Aviso cuando lo que entregás no alcanza a cubrir el precio',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Preguntá la tasa ANTES de pagar: una diferencia de pocos puntos en el vuelto es plata que se pierde en cada compra',
          'Si el pago es en divisas en efectivo, además puede aplicarte el IGTF del 3%',
        ],
        plazo: 'cada local fija su tasa del día y no está obligado a usar la del BCV para el vuelto.',
      },
      {
        id: 'historico',
        label: 'Tengo bolívares viejos o quiero actualizar un monto',
        hint: 'Reconversiones · INPC',
        answer: 'Tres reconversiones borraron 14 ceros: un monto viejo hay que dividirlo, no compararlo.',
        yes: [
          'Conversión de bolívares de cualquiera de las cuatro épocas al bolívar actual',
          'El factor acumulado que se aplica y cuántos ceros representa',
          'Actualización de un monto por inflación cuando cargás la variación del INPC del período',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Los factores de reconversión son fijos e históricos: ese cálculo no caduca',
          'La variación del INPC sí hay que cargarla: el BCV la publica con retraso y no la damos por defecto',
        ],
        plazo: 'las reconversiones fueron en 2008, 2018 y 2021; para saber qué moneda tenés, mirá la fecha del billete o del documento.',
      },
    ],
  },

  inputsTitle: 'Tu operación',
  inputsIntro:
    'Las tasas vienen precargadas con el último snapshot que tenemos, pero son editables a propósito: poné la del día antes de decidir nada.',
  fields: [
    {
      id: 'monto',
      label: 'Monto a convertir',
      type: 'number',
      value: 100,
      min: 0,
      step: 0.01,
      help: 'En la moneda que elijas abajo.',
    },
    {
      id: 'direccion',
      label: 'Qué tenés',
      type: 'select',
      value: 'usd',
      options: [
        { value: 'usd', label: 'Dólares (USD) → bolívares' },
        { value: 'bs', label: 'Bolívares (Bs.) → dólares' },
        { value: 'eur', label: 'Euros (EUR) → bolívares' },
        { value: 'usdt', label: 'USDT → bolívares' },
        { value: 'cop', label: 'Pesos colombianos (COP) → bolívares' },
      ],
    },
    {
      id: 'tasaBcv',
      label: 'Tasa BCV (Bs. por dólar)',
      type: 'number',
      value: FX.bcv,
      min: 0,
      step: 0.01,
      help: `Tasa oficial. Snapshot cargado del ${FX.fechaBcv}: verificá la del día en bcv.org.ve.`,
    },
    {
      id: 'tasaParalelo',
      label: 'Tasa paralela (Bs. por dólar)',
      type: 'number',
      value: FX.paralelo,
      min: 0,
      step: 0.01,
      help: `Promedio del mercado libre / Monitor Dólar. Snapshot del ${FX.fechaParalelo}.`,
    },
    {
      id: 'comision',
      label: 'Comisión del cambista o exchange (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 50,
      step: 0.1,
      help: 'Para remesas Zelle o P2P. Dejala en 0 si no aplica.',
    },
    {
      id: 'eurUsd',
      label: 'Paridad EUR/USD',
      type: 'number',
      value: 1.08,
      min: 0,
      step: 0.001,
      help: 'Cuántos dólares vale un euro. Solo se usa si convertís desde euros.',
    },
    {
      id: 'usdCop',
      label: 'Dólar en pesos colombianos (COP)',
      type: 'number',
      value: 4000,
      min: 0,
      step: 1,
      help: 'Solo se usa para convertir bolívares y pesos colombianos entre sí, con el dólar de puente.',
    },
    {
      id: 'monedaVieja',
      label: '¿El monto está en bolívares de otra época?',
      type: 'select',
      value: 'digital',
      options: [
        { value: 'digital', label: 'No, son bolívares actuales (Bs.D / VED, 2021)' },
        { value: 'soberano', label: 'Sí, Bolívar Soberano (Bs.S, 2018)' },
        { value: 'fuerte', label: 'Sí, Bolívar Fuerte (Bs.F, 2008)' },
        { value: 'original', label: 'Sí, bolívares anteriores a 2008' },
      ],
    },
    {
      id: 'inpc',
      label: 'Variación del INPC del período (%)',
      type: 'number',
      value: 0,
      min: 0,
      step: 0.1,
      help: 'Para actualizar un monto viejo por inflación. La publica el BCV. Dejala en 0 si no la necesitás.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'bars',
    title: 'El mismo monto según la tasa que te apliquen',
    caption:
      'Compara los bolívares que salen del mismo monto en dólares con la tasa oficial, con la paralela, y con la tasa efectiva después de la comisión. La distancia entre las barras es exactamente lo que te cuesta la brecha.',
  },
  breakdownTitle: 'La conversión, paso a paso',
  breakdownIntro:
    'Primero tu monto en dólares, que es el puente entre todas las monedas. Después el resultado con cada tasa, la brecha, y lo que quedaría neto de comisión.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre el dólar BCV y el paralelo?',
      a: 'El BCV es la tasa oficial que publica el Banco Central en días hábiles y es la que se usa para todo lo formal: facturación, tributos, cestaticket, contabilidad. El paralelo es el promedio del mercado libre —Monitor Dólar, casas de cambio, operaciones P2P— y es la que en la práctica rige el comercio minorista y las remesas. La distancia entre las dos es la brecha, y es el número que decide si una operación te conviene o no.',
    },
    {
      q: '¿Cómo se calcula la brecha y por qué me importa?',
      a: 'La brecha es el paralelo dividido el oficial, menos uno, expresado en porcentaje. Importa porque define un arbitraje cotidiano: si cobrás al oficial y comprás al paralelo, perdés esa diferencia en cada vuelta. El caso más común es el sueldo: si tu remuneración está pactada en dólares y te la pagan en bolívares al BCV, tu poder de compra real es menor al nominal en exactamente el porcentaje de la brecha.',
    },
    {
      q: '¿A qué tasa se paga el cestaticket y a cuál me cobran en la tienda?',
      a: 'El cestaticket se paga a la tasa BCV del día del depósito, porque está fijado en dólares y la ley usa la tasa oficial. En la tienda, en cambio, te cobran a la tasa que el comercio decida, que suele estar cerca del paralelo. Ese desfase es una pérdida silenciosa: cobrás con la tasa baja y gastás con la alta. Por eso vale la pena calcular las dos y no una sola.',
    },
    {
      q: '¿Cuánto recibe realmente el destinatario de una remesa Zelle?',
      a: 'Los bolívares recibidos son el monto enviado, menos la comisión, por la tasa aplicada. Pero el número con el que hay que comparar ofertas no es la tasa anunciada sino la efectiva: bolívares recibidos dividido dólares enviados. Muchos cambistas dicen "sin comisión" y compensan con una tasa varios puntos por debajo del mercado. Calculá siempre la efectiva antes de elegir.',
    },
    {
      q: '¿El USDT tiene la misma tasa que el dólar?',
      a: 'En teoría sí, porque es una stablecoin anclada al dólar. En la práctica, en el mercado P2P de Venezuela el USDT cotiza con su propia oferta y demanda, y puede estar por encima o por debajo del billete físico según el momento. Por eso conviene tratar el USDT como una moneda con tasa propia y cargar la que veas en el libro P2P, no asumir paridad exacta con el efectivo.',
    },
    {
      q: 'Pagué en dólares en efectivo, ¿me pueden dar el vuelto en bolívares?',
      a: 'Sí, y es lo habitual: la mayoría de los comercios no tiene billetes chicos en divisas. El punto es que el vuelto se calcula a la tasa que el local aplique, y esa tasa no está obligada a ser la del BCV. Conviene preguntarla antes de pagar. Además, si el pago es en divisas en efectivo puede corresponder el IGTF del 3%, que se suma al precio.',
    },
    {
      q: '¿Cuánto valen hoy mis bolívares viejos?',
      a: `Venezuela hizo tres reconversiones y en total eliminó 14 ceros: tres en 2008 con el Bolívar Fuerte, cinco en 2018 con el Bolívar Soberano y seis en 2021 con el Bolívar Digital. Para llevar un monto viejo al bolívar actual se aplican en cadena todos los factores posteriores a esa moneda. Un monto en bolívares de antes de 2008 se divide por ${new Intl.NumberFormat('es-VE').format(1e14)}. Son factores fijos e históricos: ese cálculo no caduca nunca.`,
    },
    {
      q: '¿Cómo actualizo un monto viejo por inflación?',
      a: 'Multiplicando el monto original por uno más la variación acumulada del Índice Nacional de Precios al Consumidor del período. Es la cuenta que se usa para indexar deudas, contratos y sentencias. El dato lo publica el BCV, con retraso y de forma irregular, por eso acá va como campo editable y no precargado: preferimos pedirte el número antes que mostrarte uno viejo como si fuera verdad.',
    },
    {
      q: '¿Cómo paso bolívares a pesos colombianos?',
      a: 'No hay una cotización directa Bs./COP con volumen real: la conversión se hace con el dólar de puente. Se pasan los bolívares a dólares con la tasa que corresponda —para operaciones reales, la paralela— y esos dólares a pesos con la tasa COP del día. Es la cuenta que hace cualquiera en la frontera, y por eso las dos tasas van editables: la del bolívar y la del peso se mueven por su cuenta.',
    },
    {
      q: '¿Por qué las tasas de esta página no son un dato fijo?',
      a: 'Porque cualquier tasa fija en Venezuela es un número falso a los pocos días. Lo que traemos precargado es un snapshot con su fecha visible, que se refresca automáticamente, y todos los campos de tasa son editables. Es una decisión deliberada: preferimos que veas de dónde sale el número y lo puedas corregir, antes que presentarte una cifra vieja con aire de autoridad.',
    },
  ],

  sources: [
    {
      name: 'Banco Central de Venezuela — tipo de cambio oficial',
      url: 'https://www.bcv.org.ve/',
      publisher: 'BCV',
    },
    {
      name: 'BCV — Índice Nacional de Precios al Consumidor (INPC)',
      url: 'https://www.bcv.org.ve/estadisticas/consumidor',
      publisher: 'BCV',
    },
    {
      name: 'Decreto de nueva expresión monetaria (Bolívar Digital, 01/10/2021)',
      url: 'https://accesoalajusticia.org/',
      publisher: 'Acceso a la Justicia / Gaceta Oficial',
    },
    {
      name: 'DolarAPI Venezuela — tasas oficial y paralela',
      url: 'https://ve.dolarapi.com/',
      publisher: 'DolarAPI',
    },
    {
      name: 'Binance P2P — libro de órdenes USDT/VES',
      url: 'https://p2p.binance.com/es/trade/all-payments/USDT?fiat=VES',
      publisher: 'Binance',
    },
  ],

  replaces: [
    '/ve/dolar-bcv-paralelo-bolivares-hoy',
    '/ve/calculadora-brecha-dolar-bcv-paralelo',
    '/ve/cuanto-es-bolivares-en-dolares',
    '/ve/cuanto-es-dolares-en-bolivares',
    '/ve/calculadora-euros-a-bolivares-bcv-venezuela',
    '/ve/calculadora-usdt-a-bolivares-binance-p2p-venezuela',
    '/ve/calculadora-remesa-zelle-bolivares-venezuela',
    '/ve/calculadora-vuelto-en-bolivares-pago-en-dolares-venezuela',
    '/ve/calculadora-bolivares-a-pesos-colombianos',
    '/ve/calculadora-cuanto-vale-mi-sueldo-en-dolares-venezuela',
    '/ve/calculadora-reconversion-bolivares-viejos-actuales-venezuela',
    '/ve/calculadora-actualizacion-inflacion-inpc-venezuela',
  ],

  lastReviewed: '2026-07-28',
};
