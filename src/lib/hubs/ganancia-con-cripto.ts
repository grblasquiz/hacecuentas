import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto gané de verdad con mis cripto, después de comisiones?"
 * Absorbe 7 calculadoras sueltas de cripto: resultado de una operación, costo de
 * pasar de una stablecoin a otra, gas fee de Ethereum, pérdida impermanente en un
 * pool, precio implícito por market cap y el próximo halving de Bitcoin.
 */

/** Disclaimer YMYL inversión, textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

export const hub: HubData = {
  slug: 'inversiones/ganancia-con-cripto',
  title: '¿Cuánto gané de verdad con mis cripto? — Resultado neto, comisiones y gas',
  description:
    'Ganancia o pérdida neta de tu operación en cripto después de comisiones, costo de pasar de USDT a USDC, gas fee de Ethereum, pérdida impermanente del pool, precio por market cap y próximo halving.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Resultado real de tus cripto',
  h1: 'Comprás y vendés cripto: ¿cuánto ganaste después de las comisiones?',
  lede:
    'Partimos del caso más frecuente: compraste, vendiste y querés el número neto. Ya podés ver el resultado con la comisión descontada de las dos puntas, y ajustarlo con tus datos. Si tu caso es otro —stablecoins, gas, un pool o el halving—, lo cambiás abajo.',
  stamps: ['Comisión en las dos puntas', 'Dólar cripto del día', '6 calculadoras adentro'],

  resultLabel: 'Resultado neto',

  cases: {
    title: '¿Qué querés saber de tus cripto?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'compra-venta',
        label: 'Compré y vendí: cuánto gané neto',
        hint: 'Resultado de la operación',
        answer:
          'La ganancia real es lo que recibís al vender menos lo que pusiste al comprar, con la comisión descontada en las dos puntas.',
        yes: [
          'Monto invertido con la comisión de compra ya sumada',
          'Monto recibido con la comisión de venta ya descontada',
          'Ganancia o pérdida en dólares y en porcentaje sobre lo invertido',
          'Cuánto te comieron las comisiones de las dos puntas',
          'Equivalente en pesos al dólar cripto del día',
        ],
        warn: [
          DISCLAIMER,
          'El porcentaje se calcula sobre el monto invertido con comisión incluida: por eso da un poco menos que la diferencia bruta de precios',
          'No incluye el impuesto a las ganancias ni el costo de retirar a pesos: son cuentas aparte',
        ],
        plazo: 'guardá el comprobante de cada operación: sin precio y fecha de compra no podés justificar el resultado después.',
      },
      {
        id: 'stablecoin',
        label: 'Paso de una stablecoin a otra',
        hint: 'USDT vs USDC',
        answer:
          'Cambiar USDT por USDC cuesta la comisión del exchange más el spread entre puntas, aunque las dos valgan un dólar.',
        yes: [
          'Comisión del exchange sobre el monto que operás',
          'Costo del spread entre la punta compradora y la vendedora',
          'Costo total del cambio y cuánto te queda del otro lado',
          'Comparación contra la comisión de referencia más baja del mercado',
        ],
        warn: [
          DISCLAIMER,
          'Las comisiones de los exchanges cambian seguido y dependen de tu volumen y de si sos maker o taker: verificá la tuya antes de operar',
          'Una stablecoin no es un dólar: puede despegarse de la paridad y su respaldo depende del emisor',
        ],
        plazo: 'en montos chicos el spread pesa más que la comisión; mirá las dos puntas antes de confirmar.',
      },
      {
        id: 'gas',
        label: 'Cuánto me cuesta una transacción en Ethereum',
        hint: 'Gas fee',
        answer:
          'El costo de gas es el límite de gas de la operación por el precio en Gwei, dividido mil millones, valuado al precio de ETH.',
        yes: [
          'Costo de la transacción en ETH y en dólares',
          'Límite de gas típico según el tipo de operación que hagas',
          'Si la red está barata, normal o congestionada',
          'Equivalente en pesos al dólar cripto del día',
        ],
        warn: [
          DISCLAIMER,
          'El gas price se mueve minuto a minuto: el número vale para el Gwei que cargaste, no para dentro de una hora',
          'El gas se paga aunque la transacción falle: una operación revertida te cuesta igual',
        ],
        plazo: 'si no es urgente, mirá el gas fuera del horario de mayor actividad de la red.',
      },
      {
        id: 'pool',
        label: 'Puse liquidez en un pool',
        hint: 'Pérdida impermanente',
        answer:
          'La pérdida impermanente es lo que te falta contra haber holdeado, y sólo se compensa si las comisiones del pool la superan.',
        yes: [
          'Pérdida impermanente en porcentaje y en dólares',
          'Cuánto tendrías holdeando contra cuánto tenés en el pool',
          'Comisiones ganadas según el rendimiento anual y los meses que estuviste',
          'Resultado neto: si las comisiones alcanzan a tapar la pérdida',
        ],
        warn: [
          DISCLAIMER,
          'La pérdida deja de ser impermanente en el momento en que retirás la liquidez: ahí se realiza',
          'El cálculo asume un pool de dos activos en partes iguales y no contempla riesgo de contrato inteligente ni de que un token se vaya a cero',
        ],
        plazo: 'el rendimiento anunciado del pool casi nunca se sostiene todo el período: revisalo seguido.',
      },
      {
        id: 'market-cap',
        label: 'Cuánto valdría el token con otro market cap',
        hint: 'Precio implícito',
        answer:
          'El precio implícito es el market cap objetivo dividido por los tokens en circulación: no es un pronóstico, es una regla de tres.',
        yes: [
          'Precio que tendría el token con el market cap que apuntás',
          'Market cap actual con el supply efectivo, ya descontados los tokens quemados',
          'Cuántas veces tendría que multiplicarse el precio para llegar',
          'Variación porcentual implícita desde el precio de hoy',
        ],
        warn: [
          DISCLAIMER,
          'Es una equivalencia aritmética, no una proyección: un market cap más grande exige demanda nueva real por ese monto',
          'Si el supply sigue emitiéndose, el precio implícito baja aunque el market cap objetivo se cumpla',
        ],
        plazo: 'chequeá el supply circulante en la fuente del proyecto: los agregadores no siempre coinciden.',
      },
      {
        id: 'halving',
        label: 'Cuándo es el próximo halving de Bitcoin',
        hint: 'Fecha estimada',
        answer:
          'El halving ocurre cada 210.000 bloques: con el bloque actual sale cuántos faltan y en qué fecha aproximada cae.',
        yes: [
          'Bloque exacto del próximo halving y cuántos faltan',
          'Días estimados y fecha aproximada al ritmo de bloque que cargues',
          'Recompensa por bloque antes y después del corte',
          'Cuánto baja la emisión diaria nueva de bitcoins',
        ],
        warn: [
          DISCLAIMER,
          'La fecha es una estimación: depende del tiempo real entre bloques, que varía con el hashrate y se reajusta cada 2.016 bloques',
          'Que los halvings pasados hayan venido con subas no implica que el próximo las traiga: no es una proyección de precio',
        ],
        plazo: 'cargá el número de bloque del momento en un explorador: es el único dato que hace variar el resultado.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo: sólo pesan los campos de la rama que elegiste.',
  fields: [
    {
      id: 'precioEntrada',
      label: 'Precio de compra o precio inicial del token',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 0.000001,
      value: 30000,
      help: 'En la rama de compra y venta es el precio al que compraste. En la rama del pool, el precio del token cuando entraste.',
    },
    {
      id: 'precioSalida',
      label: 'Precio de venta o precio final del token',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 0.000001,
      value: 36000,
      help: 'En la rama de compra y venta es el precio al que vendiste. En la rama del pool, el precio del token hoy.',
    },
    { id: 'cantidad', label: 'Cantidad de unidades', type: 'number', min: 0, step: 0.00000001, value: 0.5 },
    {
      id: 'comision',
      label: 'Comisión del exchange por operación',
      type: 'number',
      suffix: '%',
      min: 0,
      step: 0.01,
      value: 0.1,
      help: 'Se aplica dos veces: al comprar y al vender. Miralo en la pantalla de comisiones de tu cuenta, cambia según el volumen.',
    },
    {
      id: 'montoUsd',
      label: 'Monto de la operación o capital en el pool',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 1,
      value: 1000,
      thousands: true,
      help: 'Lo que pasás de una stablecoin a otra, o lo que aportaste al pool de liquidez.',
    },
    {
      id: 'comisionStable',
      label: 'Comisión del exchange en el cambio de stablecoin',
      type: 'number',
      suffix: '%',
      min: 0,
      step: 0.01,
      value: 0.1,
      help: 'Referencias habituales: los exchanges globales grandes cobran cerca de 0,1%, los que operan con tarjeta o en pesos suelen estar entre 0,5% y 1%.',
    },
    {
      id: 'spread',
      label: 'Spread entre puntas del par',
      type: 'number',
      suffix: '%',
      min: 0,
      step: 0.01,
      value: 0.05,
      help: 'Diferencia entre el precio al que te compran y aquel al que te venden. En pares de stablecoins suele ir de 0,01% a 0,1%.',
    },
    {
      id: 'tipoTx',
      label: 'Tipo de transacción en Ethereum',
      type: 'select',
      value: 'erc20-transfer',
      options: [
        { value: 'transferencia', label: 'Transferencia de ETH (21.000 gas)' },
        { value: 'erc20-transfer', label: 'Transferencia de un token ERC-20 (65.000 gas)' },
        { value: 'uniswap-swap', label: 'Swap en un exchange descentralizado (150.000 gas)' },
        { value: 'nft-mint', label: 'Minteo de un NFT (200.000 gas)' },
        { value: 'contract-deploy', label: 'Despliegue de un contrato (3.000.000 gas)' },
        { value: 'custom', label: 'Otro: uso el gas limit que cargo abajo' },
      ],
    },
    { id: 'gasLimit', label: 'Gas limit propio (sólo si elegiste “Otro”)', type: 'number', min: 0, step: 1000, value: 21000, thousands: true },
    {
      id: 'gasPriceGwei',
      label: 'Gas price',
      type: 'number',
      suffix: 'Gwei',
      min: 0,
      step: 0.1,
      value: 12,
      help: 'Miralo en un explorador de la red en el momento de operar: por debajo de 20 Gwei la red está barata, por encima de 50 está congestionada.',
    },
    {
      id: 'precioEth',
      label: 'Precio de ETH',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 1,
      value: 3000,
      thousands: true,
      help: 'Cargá la cotización del momento: el costo del gas en dólares se mueve con el precio de ETH.',
    },
    {
      id: 'apyPool',
      label: 'Rendimiento anual del pool',
      type: 'number',
      suffix: '%',
      min: 0,
      step: 0.1,
      value: 20,
      help: 'El rendimiento anualizado que informa el protocolo por las comisiones que reparte el pool.',
    },
    { id: 'mesesPool', label: 'Meses con la liquidez puesta', type: 'number', min: 1, max: 600, step: 1, value: 12 },
    {
      id: 'supply',
      label: 'Tokens en circulación',
      type: 'number',
      min: 0,
      step: 1,
      value: 1000000000,
      thousands: true,
      help: 'El circulating supply del token, no el supply máximo.',
    },
    { id: 'quemados', label: 'Tokens quemados', type: 'number', min: 0, step: 1, value: 0, thousands: true },
    { id: 'precioToken', label: 'Precio actual del token', type: 'number', prefix: 'US$', min: 0, step: 0.000001, value: 0.5 },
    {
      id: 'marketCapObjetivo',
      label: 'Market cap objetivo',
      type: 'number',
      prefix: 'US$',
      min: 0,
      step: 1000000,
      value: 5000000000,
      thousands: true,
      help: 'El market cap de la moneda con la que querés compararlo.',
    },
    {
      id: 'bloqueActual',
      label: 'Bloque actual de Bitcoin',
      type: 'number',
      min: 1,
      step: 1,
      value: 958000,
      thousands: true,
      help: 'Buscalo en cualquier explorador de la red: es el dato que fija la fecha del próximo halving.',
    },
    {
      id: 'tiempoBloque',
      label: 'Tiempo promedio entre bloques',
      type: 'number',
      suffix: 'segundos',
      min: 60,
      max: 1800,
      step: 1,
      value: 600,
      help: 'El protocolo apunta a 600 segundos (10 minutos). Con más hashrate los bloques salen un poco más rápido.',
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
      help: 'Viene cargado con el dólar cripto del día. Cambialo si operás a otro tipo de cambio.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu caso',
    caption:
      'La escala cambia según la rama que elijas: resultado de la operación, costo del cambio, congestión de la red, severidad de la pérdida impermanente, múltiplo implícito o avance del ciclo hasta el halving.',
  },
  breakdownTitle: 'Cómo se arma el número',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cuadro.',

  answer: undefined,

  faq: [
    {
      q: '¿Por qué mi ganancia es menor que la diferencia entre el precio de compra y el de venta?',
      a: 'Porque la comisión se cobra dos veces: encarece lo que pusiste al comprar y achica lo que recibís al vender. Con una comisión de 0,1% en cada punta, ya arrancás 0,2% abajo antes de que el precio se mueva. En operaciones cortas y repetidas ese costo se acumula y explica buena parte de la diferencia entre lo que parece una ganancia y lo que efectivamente te queda.',
    },
    {
      q: '¿Sobre qué monto se calcula el porcentaje de ganancia?',
      a: 'Sobre el monto invertido con la comisión de compra incluida, que es la plata que realmente saliste de tu bolsillo. Por eso el porcentaje da un poco por debajo de la variación bruta del precio. Es la forma correcta de medirlo: lo que importa no es cuánto subió el activo sino cuánto rindió tu plata.',
    },
    {
      q: 'Si USDT y USDC valen un dólar, ¿por qué cambiar una por otra me cuesta plata?',
      a: 'Por dos motivos independientes. Primero, el exchange cobra una comisión por la operación, igual que en cualquier otro par. Segundo, el par tiene un spread: te compran un poquito más barato de lo que te venden, y esa diferencia se la queda el mercado. Las dos cosas se suman aunque el tipo de cambio nominal sea uno a uno.',
    },
    {
      q: '¿Qué es el gas y por qué cambia tanto de precio?',
      a: 'El gas es la unidad de trabajo computacional que consume una operación en Ethereum. Cada operación tiene un consumo bastante fijo —una transferencia simple usa 21.000 gas— pero el precio de ese gas, medido en Gwei, lo fija una subasta permanente entre quienes quieren entrar en el próximo bloque. Cuando hay mucha demanda el Gwei sube y la misma operación puede costar varias veces más.',
    },
    {
      q: '¿El gas se paga aunque la transacción no se ejecute?',
      a: 'Sí. Si la transacción se revierte —porque el deslizamiento fue mayor al tolerado, porque el contrato rechazó la operación o por cualquier otro error— el trabajo de la red igual se hizo y el gas consumido no vuelve. Es un costo hundido que conviene tener en cuenta antes de reintentar varias veces seguidas.',
    },
    {
      q: '¿Qué es exactamente la pérdida impermanente?',
      a: 'Es la diferencia entre lo que tendrías si simplemente hubieras conservado los dos activos y lo que tenés dentro del pool después de que sus precios se movieron distinto. El pool reequilibra automáticamente: te deja con más del activo que bajó y menos del que subió. Cuanto más se separan los precios, más grande es la brecha.',
    },
    {
      q: '¿Por qué se llama impermanente si igual pierdo?',
      a: 'Porque mientras no retirás la liquidez la brecha puede achicarse: si los precios vuelven a la relación original, desaparece. En el momento en que retirás, se realiza y deja de ser reversible. Ese es el punto de decisión: no es lo mismo estar temporalmente abajo que salir del pool.',
    },
    {
      q: '¿Las comisiones del pool alcanzan para compensar la pérdida impermanente?',
      a: 'A veces sí y a veces no, y por eso el cálculo se hace junto. En pares de activos muy correlacionados —dos stablecoins, por ejemplo— la brecha es mínima y casi cualquier comisión la cubre. En pares volátiles, un movimiento fuerte de precio puede superar meses de comisiones. El resultado neto es el único número que responde la pregunta.',
    },
    {
      q: '¿Sirve calcular el precio de un token si tuviera el market cap de otro?',
      a: 'Sirve como referencia de escala, para dimensionar qué tan grande sería el proyecto en ese escenario. No sirve como pronóstico: llegar a ese market cap implica que entre demanda nueva por la diferencia entera, y nada garantiza que exista. Además, si el proyecto sigue emitiendo tokens, el mismo market cap se reparte entre más unidades y el precio implícito baja.',
    },
    {
      q: '¿Cada cuánto es el halving de Bitcoin y cuánto dura la recompensa actual?',
      a: 'Cada 210.000 bloques, lo que a diez minutos por bloque da aproximadamente cuatro años. En cada corte la recompensa por bloque se parte al medio: arrancó en 50 bitcoins y ya pasó por 25, 12,5, 6,25 y 3,125. La calculadora toma el bloque que cargás y devuelve el bloque exacto del próximo corte, cuántos faltan y la fecha estimada.',
    },
    {
      q: '¿Por qué la fecha del halving es una estimación y no un dato fijo?',
      a: 'Porque lo que está fijo es el número de bloque, no la fecha. El tiempo real entre bloques oscila según cuánto poder de cómputo hay minando, y la red recalibra la dificultad cada 2.016 bloques para volver al promedio de diez minutos. Con más hashrate los bloques salen antes y el halving se adelanta unos días; con menos, se atrasa.',
    },
    {
      q: '¿Estos resultados incluyen impuestos?',
      a: 'No. El resultado que ves es el neto de comisiones de mercado, sin ningún tratamiento impositivo. La compraventa de cripto puede generar obligaciones según tu situación y jurisdicción, y el simple hecho de tener saldo al cierre del año también puede tener efectos. Consultá esa parte con un contador antes de asumir que la ganancia neta es la ganancia final.',
    },
  ],

  sources: [
    {
      name: 'Ethereum — gas y comisiones de la red',
      url: 'https://ethereum.org/es/developers/docs/gas/',
      publisher: 'Ethereum Foundation',
    },
    {
      name: 'Bitcoin — protocolo, recompensa por bloque y control de emisión',
      url: 'https://bitcoin.org/bitcoin.pdf',
      publisher: 'Bitcoin.org',
    },
    {
      name: 'Uniswap docs — provisión de liquidez y pérdida impermanente',
      url: 'https://docs.uniswap.org/concepts/protocol/oracles',
      publisher: 'Uniswap Labs',
    },
    {
      name: 'Guía del inversor — activos virtuales y proveedores registrados',
      url: 'https://www.argentina.gob.ar/cnv',
      publisher: 'Comisión Nacional de Valores',
    },
    {
      name: 'Cotizaciones de referencia del dólar',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
  ],

  replaces: [
    '/calculadora-ganancia-perdida-criptomonedas',
    '/calculadora-usdt-vs-usdc-comision-exchange',
    '/calculadora-costo-gas-fee-ethereum-2026',
    '/calculadora-impermanent-loss-defi-2026',
    '/calculadora-market-cap-vs-precio-token',
    '/calculadora-halving-bitcoin-2026-fecha',
    '/calculadora-bitcoin-halving-2028-proyeccion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Gas limit típico por tipo de transacción — espejo de costo-transaccion-gas-eth.ts. */
export const GAS_LIMITS: Record<string, number> = {
  transferencia: 21000,
  'erc20-transfer': 65000,
  'uniswap-swap': 150000,
  'nft-mint': 200000,
  'contract-deploy': 3000000,
  custom: 0,
};

/** Bloques entre halvings de Bitcoin. Constante del protocolo. */
export const BLOQUES_POR_HALVING = 210000;
