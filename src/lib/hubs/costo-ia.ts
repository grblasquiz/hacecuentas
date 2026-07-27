import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me cuesta la API de IA?"
 *
 * Foco deliberadamente AFILADO: precio de inferencia. Tokens y precio por
 * modelo, prompt caching, alquiler de GPU, servidor cloud y costo por millón
 * de tokens autohospedado. Quedan afuera color hex, generador de QR, big-O,
 * bcrypt, huella digital y estimación de líneas de código: son tecnología,
 * pero no son costo de IA. Ver el reporte del hub.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - TODO este hub es plata en DÓLARES, no en pesos. El `format` por defecto
 *    del runtime es 'ars' y pondría "$" de peso adelante, así que el resultado
 *    y TODAS las filas declaran `format:'unit'` con `unit:'USD'`.
 *  - `chart.type: 'donut'`: composición del gasto. En la rama de API el insight
 *    es que la salida se cobra 5× la entrada; en la de GPU, cuánto pagás por
 *    tarjetas encendidas sin usar.
 *
 * PRECIOS: la tabla de abajo son los precios de lista de la API de Anthropic,
 * en USD por millón de tokens, verificados al 27-07-2026. Para cualquier otro
 * proveedor el hub NO inventa números: se elige "Otro modelo" y se cargan los
 * dos precios a mano. Los campos de precio pisan siempre a la tabla.
 */

export const PRECIOS_FECHA = '27-07-2026';

/** USD por millón de tokens: [entrada, salida]. Precios de lista de Anthropic. */
export const PRECIOS: Record<string, { nombre: string; in: number; out: number }> = {
  'opus-5': { nombre: 'Claude Opus 5', in: 5, out: 25 },
  'sonnet-5': { nombre: 'Claude Sonnet 5', in: 3, out: 15 },
  'fable-5': { nombre: 'Claude Fable 5', in: 10, out: 50 },
  'haiku-4-5': { nombre: 'Claude Haiku 4.5', in: 1, out: 5 },
  otro: { nombre: 'Otro modelo (cargá los precios)', in: 0, out: 0 },
};

/**
 * Multiplicadores del prompt caching de Anthropic sobre el precio de entrada:
 * escribir la caché cuesta 1,25×, leerla 0,10×.
 */
export const CACHE_WRITE = 1.25;
export const CACHE_READ = 0.1;

/**
 * Precios de referencia on-demand de un servidor cloud, en USD.
 * Espejo de src/lib/formulas/costo-cloud-servidor-mensual.ts
 */
export const SERVIDOR = {
  cpuMes: 10, // por vCPU
  ramMes: 5, // por GB de RAM
  storageMes: 0.1, // por GB de SSD
  traficoGb: 0.09, // por GB de egress
};

export const hub: HubData = {
  slug: 'tecnologia/costo-de-ia',
  title: '¿Cuánto me cuesta la API de IA? — Tokens, caché, GPU y servidor',
  description:
    'Calculá el gasto mensual real de tu aplicación de IA: precio por millón de tokens de entrada y salida, ahorro del prompt caching, alquiler de GPU por hora, servidor cloud y costo por millón de tokens si te autohospedás.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Costos de infraestructura de IA',
  h1: '¿Cuánto te va a costar la IA este mes?',
  lede:
    'Partimos del caso más común: pagás una API por tokens. Si en cambio alquilás GPU, levantás un servidor o querés saber cuánto te sale el millón de tokens propio, cambialo abajo.',
  stamps: [`Precios de lista al ${PRECIOS_FECHA}`, 'Todo en dólares', '8 calculadoras adentro'],

  resultLabel: 'Gasto mensual estimado',

  cases: {
    title: '¿Cómo pagás la IA?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'api',
        label: 'Pago una API por tokens',
        hint: 'El caso más común',
        answer: 'El gasto son los millones de tokens de entrada y de salida, cada uno a su precio.',
        yes: [
          'Tokens de entrada por su precio, y tokens de salida por el suyo, que es varias veces mayor',
          'El descuento del prompt caching sobre la parte fija del prompt que se repite en cada llamada',
          'El costo por llamada y el equivalente anual',
        ],
        warn: [
          'La salida se cobra cinco veces la entrada en la mayoría de los modelos: acortar respuestas largas baja la factura mucho más rápido que acortar el prompt',
          'Los precios de los modelos cambian seguido. Verificá siempre la página oficial de precios del proveedor antes de comprometer un presupuesto',
        ],
        plazo: 'la caché se cobra 1,25× al escribirla y 0,10× al leerla, así que recién conviene a partir de la segunda llamada.',
      },
      {
        id: 'gpu',
        label: 'Alquilo GPU por hora',
        hint: 'H100, A100 y similares',
        answer: 'El costo son las horas de GPU encendida, con o sin descuento spot.',
        yes: [
          'Precio por hora multiplicado por la cantidad de GPU y por las horas de uso',
          'El descuento spot aplicado sobre el precio on-demand',
          'Cuánto estás pagando por tarjetas encendidas sin trabajo',
        ],
        warn: [
          'El tiempo ocioso es la fuga silenciosa: una GPU encendida y sin carga cuesta exactamente lo mismo que una a full',
          'Una instancia spot se puede cortar sin aviso. Si el trabajo no tolera reinicios, el descuento no es gratis',
        ],
        plazo: 'apagar o liberar la instancia en los huecos suele ser la palanca de ahorro más grande.',
      },
      {
        id: 'servidor',
        label: 'Levanto un servidor cloud',
        hint: 'vCPU, RAM, disco y tráfico',
        answer: 'El cómputo se lleva casi todo; el disco y el tráfico suelen ser el resto.',
        yes: [
          'vCPU y RAM, que son el grueso de la factura',
          'Almacenamiento SSD por GB',
          'Tráfico de salida, que muchos presupuestos olvidan hasta que llega la factura',
        ],
        warn: [
          'Los precios son promedios on-demand de referencia. Reservar la instancia por uno a tres años suele recortar entre un 30% y un 60%',
        ],
        plazo: 'el egress es el rubro que más sorprende: revisá cuántos GB salen por mes antes de elegir proveedor.',
      },
      {
        id: 'throughput',
        label: 'Quiero saber si me conviene autohospedar',
        hint: 'Costo por millón de tokens',
        answer: 'El costo por millón propio es el costo de GPU por hora dividido por los tokens que servís en esa hora.',
        yes: [
          'Los tokens por segundo totales según el batch que puedas sostener',
          'El costo por millón de tokens que te sale a vos',
          'La comparación directa contra el precio por millón que te cobra la API',
        ],
        warn: [
          'El batch es lo que define la ecuación: servir de a un pedido por vez casi nunca compite contra una API comercial',
          'Esta cuenta no incluye ingeniería, monitoreo, guardias ni el costo de la GPU parada entre picos de tráfico',
        ],
        plazo: 'si tu costo por millón no baja del precio de la API con un batch realista, autohospedar no cierra.',
      },
    ],
  },

  inputsTitle: 'Cargá tus números',
  inputsIntro: 'Cada caso usa los campos que le sirven; el resto los podés ignorar.',
  fields: [
    {
      id: 'modelo',
      label: 'Modelo',
      type: 'select',
      value: 'sonnet-5',
      options: [
        { value: 'opus-5', label: 'Claude Opus 5 — 5 / 25 USD por millón' },
        { value: 'sonnet-5', label: 'Claude Sonnet 5 — 3 / 15 USD por millón' },
        { value: 'fable-5', label: 'Claude Fable 5 — 10 / 50 USD por millón' },
        { value: 'haiku-4-5', label: 'Claude Haiku 4.5 — 1 / 5 USD por millón' },
        { value: 'otro', label: 'Otro modelo (cargá los precios a mano)' },
      ],
      help: `Precios de lista de la API de Anthropic al ${PRECIOS_FECHA}. Para cualquier otro proveedor elegí "Otro modelo" y cargá los dos precios de abajo.`,
    },
    {
      id: 'precioIn',
      label: 'Precio de entrada (USD por millón de tokens)',
      type: 'number',
      min: 0,
      step: 0.01,
      value: 0,
      help: 'Dejalo en 0 para usar el precio del modelo elegido. Cualquier valor mayor a 0 lo pisa.',
    },
    {
      id: 'precioOut',
      label: 'Precio de salida (USD por millón de tokens)',
      type: 'number',
      min: 0,
      step: 0.01,
      value: 0,
      help: 'Dejalo en 0 para usar el precio del modelo elegido.',
    },
    {
      id: 'tokensIn',
      label: 'Tokens de entrada por mes (en millones)',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 50,
    },
    {
      id: 'tokensOut',
      label: 'Tokens de salida por mes (en millones)',
      type: 'number',
      min: 0,
      step: 0.1,
      value: 10,
    },
    {
      id: 'promptFijo',
      label: 'Parte del prompt que se repite en cada llamada (%)',
      type: 'number',
      min: 0,
      max: 100,
      value: 0,
      help: 'System prompt, instrucciones y documentos que van iguales en todas las llamadas. Es la porción que se puede cachear.',
    },
    {
      id: 'cacheHit',
      label: 'Aciertos de caché sobre esa parte fija (%)',
      type: 'number',
      min: 0,
      max: 100,
      value: 0,
      help: 'Qué porcentaje de las llamadas encuentra la caché caliente. Con 0 no hay ahorro.',
    },
    {
      id: 'llamadasDia',
      label: 'Llamadas por día',
      type: 'number',
      min: 0,
      value: 1000,
      help: 'Sólo se usa para mostrarte el costo por llamada.',
    },
    {
      id: 'precioGpu',
      label: 'Precio de la GPU (USD por hora)',
      type: 'number',
      min: 0,
      step: 0.01,
      value: 2.5,
    },
    {
      id: 'cantidadGpus',
      label: 'Cantidad de GPU',
      type: 'number',
      min: 1,
      value: 1,
    },
    {
      id: 'horasMes',
      label: 'Horas de GPU encendida al mes',
      type: 'number',
      min: 0,
      value: 200,
    },
    {
      id: 'spot',
      label: 'Descuento spot (%)',
      type: 'number',
      min: 0,
      max: 90,
      value: 0,
    },
    {
      id: 'horasIdle',
      label: 'De esas horas, cuántas están ociosas',
      type: 'number',
      min: 0,
      value: 40,
      help: 'GPU encendida y sin carga. Es la fuga más común de un presupuesto de inferencia.',
    },
    {
      id: 'tokensSegundo',
      label: 'Tokens por segundo de un pedido',
      type: 'number',
      min: 0,
      value: 40,
      help: 'Sólo para autohospedaje. Es la velocidad de generación de una sola conversación.',
    },
    {
      id: 'batch',
      label: 'Pedidos en paralelo (batch)',
      type: 'number',
      min: 1,
      value: 16,
    },
    { id: 'vcpus', label: 'vCPU del servidor', type: 'number', min: 0, value: 4 },
    { id: 'ramGb', label: 'RAM del servidor (GB)', type: 'number', min: 0, value: 16 },
    { id: 'storageGb', label: 'Disco SSD (GB)', type: 'number', min: 0, value: 200 },
    { id: 'traficoGb', label: 'Tráfico de salida por mes (GB)', type: 'number', min: 0, value: 500 },
  ],
  fineprint: `Todos los importes están en dólares. Los precios de modelo cargados son los de lista de la API de Anthropic al ${PRECIOS_FECHA} y caducan rápido: para cualquier otro proveedor, o si el tuyo cambió, cargá los precios a mano en los dos campos de precio. Esto es una estimación de costos, no una cotización.`,

  chart: {
    type: 'donut',
    title: 'A dónde se va la plata',
    caption:
      'La composición muestra qué rubro manda en tu factura. En la rama de API casi siempre es la salida, que se cobra varias veces la entrada; en la de GPU, mirá cuánto pesa el tiempo ocioso.',
  },
  breakdownTitle: 'El desglose de tu factura',
  breakdownIntro: 'Todas las filas están en dólares. Las barras comparan cada rubro con el más grande.',

  faq: [
    {
      q: '¿Cómo se calcula el costo de una API de IA por tokens?',
      a: 'Se cuentan por separado los tokens que entran y los que salen, y cada grupo se multiplica por su propio precio por millón. La fórmula es: millones de entrada × precio de entrada, más millones de salida × precio de salida. No es un precio único por llamada, y por eso dos aplicaciones con el mismo número de llamadas pueden tener facturas muy distintas.',
    },
    {
      q: '¿Por qué la salida cuesta más que la entrada?',
      a: 'Porque generar es más caro que leer. La entrada se procesa de una sola vez en paralelo, mientras que la salida se produce token por token, y cada uno exige una pasada completa por el modelo. En la práctica la salida se cobra alrededor de cinco veces la entrada, así que recortar respuestas largas baja la factura mucho más rápido que recortar el prompt.',
    },
    {
      q: '¿Cuánto es un token?',
      a: 'Como referencia gruesa, un token equivale a unos cuatro caracteres en inglés y a algo menos en español, donde una palabra suele costar más de un token. Cada modelo usa su propio tokenizador, así que el número exacto varía y no conviene apoyar un presupuesto ajustado en una estimación por caracteres: la mayoría de los proveedores ofrece un endpoint para contar tokens de verdad.',
    },
    {
      q: '¿Cuándo conviene usar prompt caching?',
      a: 'A partir de la segunda llamada que comparta el mismo prefijo. Escribir la caché cuesta 1,25 veces el precio normal de entrada y leerla cuesta 0,10, así que la primera llamada sale más cara y la segunda ya empieza a devolver. Con un prompt fijo grande y muchas llamadas repetidas, el ahorro sobre esa porción se acerca al 90%.',
    },
    {
      q: '¿Qué parte del prompt puedo cachear?',
      a: 'La que no cambia entre llamadas y está al principio: instrucciones del sistema, definiciones de herramientas y documentos de referencia. La caché es una coincidencia de prefijo, así que cualquier byte que cambie temprano invalida todo lo que viene después. Una fecha o un identificador metido en el encabezado del prompt basta para tirar abajo el ahorro completo.',
    },
    {
      q: '¿Me conviene alquilar GPU en vez de pagar la API?',
      a: 'Sólo si sostenés volumen alto y constante. La cuenta es dividir el costo de la GPU por hora entre los tokens que realmente servís en esa hora, y eso depende del batch: cuántos pedidos podés atender en paralelo. Con un batch chico, el costo por millón de tokens propio suele quedar por encima del precio de la API, y a eso todavía hay que sumarle ingeniería, monitoreo y guardias.',
    },
    {
      q: '¿Cuánto pierdo por tener GPU encendidas sin usar?',
      a: 'Exactamente lo mismo que si estuvieran a full: se cobra por hora encendida, no por trabajo hecho. Es la fuga más común de un presupuesto de inferencia, y en cargas con picos irregulares el tiempo ocioso puede pasar la mitad del gasto. Apagar o liberar la instancia en los huecos suele ahorrar más que cualquier optimización del modelo.',
    },
    {
      q: '¿Qué es el descuento spot y cuánto ahorra?',
      a: 'Es capacidad sobrante que el proveedor vende más barata a cambio de poder cortártela sin aviso. Los descuentos suelen ir del 50% al 80% sobre el precio on-demand. Sirve para entrenamiento y trabajos por lotes que toleran reiniciarse desde un checkpoint; para inferencia de cara al usuario, la interrupción cuesta más que el ahorro.',
    },
    {
      q: '¿Cómo estimo lo que sale un servidor cloud?',
      a: 'Se suman cuatro rubros: vCPU y RAM, que son el cómputo y se llevan el grueso; almacenamiento SSD por GB, que suele ser marginal; y tráfico de salida, que es el que más sorprende. Los precios de referencia de este hub son promedios on-demand: reservar la instancia por uno a tres años recorta habitualmente entre un 30% y un 60%.',
    },
    {
      q: '¿Por qué el precio del modelo es un campo editable?',
      a: 'Porque los precios de los modelos de IA cambian y los modelos se discontinúan más rápido que cualquier página. La lista precargada son los precios de la API de Anthropic con su fecha de verificación; para cualquier otro proveedor, o si el tuyo cambió, elegí "Otro modelo" y cargá los dos números a mano. El hub prefiere pedirte el dato antes que inventarlo.',
    },
    {
      q: '¿Un modelo más barato siempre sale más barato?',
      a: 'No necesariamente. Un modelo chico suele necesitar prompts más largos, más reintentos y más pasos para llegar al mismo resultado, y cada uno de esos pasos vuelve a pagar entrada y salida. Antes de bajar de gama, medí el costo de la tarea completa y no el precio por millón de tokens.',
    },
    {
      q: '¿Los precios de este hub incluyen impuestos?',
      a: 'No. Son precios de lista en dólares, sin impuestos ni percepciones. Si pagás desde Argentina con tarjeta, sumale los recargos que correspondan a tu situación fiscal; si la empresa factura al exterior, el tratamiento es otro. Consultá con tu contador antes de armar el presupuesto final.',
    },
  ],

  sources: [
    {
      name: 'Precios de la API de Claude — USD por millón de tokens de entrada y salida',
      url: 'https://platform.claude.com/docs/en/pricing',
      publisher: 'Anthropic',
      date: PRECIOS_FECHA,
    },
    {
      name: 'Prompt caching — multiplicadores de escritura (1,25×) y lectura (0,10×)',
      url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      publisher: 'Anthropic',
    },
    {
      name: 'Amazon EC2 — precios on-demand de cómputo, almacenamiento y transferencia de datos',
      url: 'https://aws.amazon.com/ec2/pricing/on-demand/',
      publisher: 'Amazon Web Services',
    },
    {
      name: 'Google Cloud — precios de GPU y de instancias spot',
      url: 'https://cloud.google.com/compute/gpus-pricing',
      publisher: 'Google Cloud',
    },
  ],

  replaces: [
    '/calculadora-tokens-por-modelo-de-ia-costo',
    '/calculadora-tokens-openai-gpt-costo-uso-mensual',
    '/calculadora-costo-tokens-api-openai-claude-mensual',
    '/calculadora-claude-gemini-tokens-comparativa-precio-uso',
    '/calculadora-claude-37-tokens-costo-cache-prompt-mensual',
    '/calculadora-costo-cloud-servidor-mensual',
    '/calculadora-gpu-h100-renta-hora-cloud-comparativa',
    '/calculadora-inferencia-llm-tokens-segundo-throughput',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
