import type { HubData } from './types';

/**
 * Hub de decisión — "Mi NPS es 32: ¿está bien o mal?"
 * Arquetipo RAMIFICADO de SCORECARD: cuatro indicadores de marca y experiencia
 * que NO son plata (satisfacción, esfuerzo, calidad del tráfico y presencia),
 * y en las cuatro ramas la pregunta real es la misma: *dónde caigo yo contra
 * la banda de referencia*.
 *
 * NOTAS DE CONTRATO:
 *  - NINGUNA fila de este hub es plata. El default del runtime es 'ars' y
 *    Object.assign copia `undefined`: toda fila declara `format:'plain'` o
 *    `format:'unit'` + `unit`. El `format` del resultado también.
 *  - Las bandas y los umbrales son COPIA FIEL de las fórmulas reales del repo:
 *    `nps.ts`, `customer-effort-score-ces.ts`,
 *    `tasa-rebote-benchmark-sitio-web.ts` y `share-of-voice-marketing.ts`.
 *    No hay benchmarks inventados.
 *  - El gráfico es `scale`: las franjas salen de las constantes de abajo y
 *    compute() devuelve `position` (0-100) + `positionLabel`.
 */

/** Franjas del NPS — copia fiel de los cortes de `nps.ts` (escala -100 a 100). */
export const NPS_BANDS = [
  { label: 'Crítico', from: -100, to: 0, tone: 'bad' },
  { label: 'Mejorable', from: 0, to: 30, tone: 'warn' },
  { label: 'Bueno', from: 30, to: 50, tone: 'neutral' },
  { label: 'Excelente', from: 50, to: 70, tone: 'good' },
  { label: 'Extraordinario', from: 70, to: 100, tone: 'good' },
] as const;

/** Franjas del CES — copia fiel de los cortes de `customer-effort-score-ces.ts` (escala 1 a 7). */
export const CES_BANDS = [
  { label: 'Crítico', from: 1, to: 3, tone: 'bad' },
  { label: 'Malo', from: 3, to: 4, tone: 'bad' },
  { label: 'Aceptable', from: 4, to: 5, tone: 'warn' },
  { label: 'Bueno', from: 5, to: 6, tone: 'neutral' },
  { label: 'Excelente', from: 6, to: 7, tone: 'good' },
] as const;

/**
 * Benchmarks de tasa de rebote por tipo de sitio — copia fiel del objeto
 * `benchmarks` de `src/lib/formulas/tasa-rebote-benchmark-sitio-web.ts`.
 */
export const REBOTE_BENCH: Record<string, { min: number; max: number; label: string }> = {
  ecommerce: { min: 20, max: 45, label: 'E-commerce' },
  saas: { min: 30, max: 55, label: 'SaaS / Software' },
  blog: { min: 65, max: 90, label: 'Blog / Contenido' },
  landing: { min: 60, max: 90, label: 'Landing page' },
  portal: { min: 40, max: 60, label: 'Portal / Noticias' },
  servicios: { min: 25, max: 55, label: 'Servicios / Brochure' },
  otro: { min: 40, max: 60, label: 'General' },
};

/** Franjas del share of voice — copia fiel de los cortes de `share-of-voice-marketing.ts`. */
export const SOV_BANDS = [
  { label: 'Marginal', from: 0, to: 3, tone: 'bad' },
  { label: 'Challenger', from: 3, to: 10, tone: 'warn' },
  { label: 'Relevante', from: 10, to: 25, tone: 'neutral' },
  { label: 'Líder', from: 25, to: 50, tone: 'good' },
  { label: 'Dominante', from: 50, to: 100, tone: 'good' },
] as const;

/**
 * Umbrales de la brecha SOV vs SOM (en puntos porcentuales) — copia fiel de
 * `share-of-voice-marketing.ts`. Por encima de +5 pp se espera ganar
 * participación; por debajo de -2 pp hay riesgo de erosión.
 */
export const ESOV_UMBRALES = { gana: 5, erosiona: -2 };

export const hub: HubData = {
  slug: 'negocios/indicadores-de-marca',
  title: 'Mi NPS es 32: ¿está bien o mal? Benchmarks de NPS, CES, rebote y share of voice',
  description:
    'Los cuatro indicadores de marca y experiencia que no son plata, cada uno con su banda de referencia: NPS, Customer Effort Score, tasa de rebote por tipo de sitio y share of voice. Cargá tus números y mirá exactamente dónde caés.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Marca y experiencia',
  h1: 'Mi NPS es 32: ¿está bien o mal?',
  lede:
    'Un indicador de marca sin su banda de referencia no dice nada: 32 de NPS es flojo para una app de consumo y muy bueno para una telco. Acá están los cuatro que no se miden en pesos —satisfacción, esfuerzo, calidad del tráfico y presencia— cada uno con la escala completa y el punto exacto donde caés vos.',
  stamps: ['Actualizado 27-07-2026', 'Cuatro escalas con sus bandas', '4 calculadoras adentro'],

  resultLabel: 'Tu puntaje en la escala del indicador',

  cases: {
    title: '¿Qué indicador querés ubicar?',
    intro:
      'Las cuatro ramas hacen lo mismo: convierten tus respuestas o tus sesiones en un número y lo ubican contra la banda de referencia del indicador. Si buscás otro, cambialo.',
    items: [
      {
        id: 'nps',
        label: 'Satisfacción del cliente (NPS)',
        hint: 'El caso más común',
        answer:
          'El NPS es el porcentaje de promotores menos el de detractores: va de -100 a 100, y arriba de 50 ya se considera excelente.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Promotores son los que puntúan 9 o 10; pasivos, 7 u 8; detractores, de 0 a 6',
          'NPS = porcentaje de promotores menos porcentaje de detractores, redondeado a entero',
          'Los pasivos no suman ni restan al puntaje, pero sí diluyen el porcentaje de promotores',
          'Bandas de lectura: negativo es crítico, hasta 30 es mejorable, hasta 50 es bueno, hasta 70 es excelente y arriba de 70 es extraordinario',
        ],
        warn: [
          'El NPS es una diferencia de porcentajes, no un promedio: dos empresas con el mismo NPS pueden tener distribuciones opuestas, y por eso siempre hay que mirar los tres porcentajes juntos',
          'Con menos de 100 respuestas el número se mueve muchísimo por azar: no festejes ni te asustes por una variación de 5 puntos',
          'Comparar tu NPS con el de otra industria no sirve: las escalas culturales y las expectativas cambian por rubro y por país',
          'Un NPS alto obtenido pidiendo la nota justo después de una interacción exitosa está sesgado: el momento de la encuesta define el resultado',
        ],
        plazo: 'para que la serie sea comparable, medí siempre en el mismo momento del ciclo de vida del cliente.',
      },
      {
        id: 'ces',
        label: 'Esfuerzo del cliente (CES)',
        hint: 'Qué tan fácil se lo hacés',
        answer:
          'El CES es el promedio ponderado de las respuestas en una escala de 1 a 7: por debajo de 4 la fricción ya predice churn.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'La pregunta estándar es cuánto de acuerdo está el cliente con que la empresa le facilitó resolver su problema',
          'CES = suma de cada puntaje por su cantidad de respuestas, dividido el total de respuestas',
          'Se agrupa en bajo esfuerzo (respuestas 5 a 7) y alto esfuerzo (1 a 3)',
          'Bandas de lectura: menos de 3 es crítico, hasta 4 es malo, hasta 5 es aceptable, hasta 6 es bueno y de 6 para arriba es excelente',
        ],
        warn: [
          'Ojo con la dirección de la escala: en esta versión 7 es el mejor resultado (mínimo esfuerzo). Hay encuestas donde 7 significa muchísimo esfuerzo y el número se lee al revés',
          'El CES mide una interacción concreta, no la relación entera: preguntalo apenas resuelto el caso, no en una encuesta anual',
          'Un CES bueno con un NPS malo suele significar que el producto no entusiasma aunque el soporte funcione',
          'Los porcentajes de bajo y alto esfuerzo pueden esconder una distribución bimodal que el promedio disimula',
        ],
        plazo: 'la medición sirve si se dispara dentro de las 24 horas de cerrada la interacción.',
      },
      {
        id: 'rebote',
        label: 'Calidad del tráfico (tasa de rebote)',
        hint: 'Depende del tipo de sitio',
        answer:
          'No existe una tasa de rebote buena universal: un blog rebota entre 65% y 90% y eso es normal; un e-commerce arriba de 45% ya tiene un problema.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Tasa de rebote = sesiones que rebotan sobre sesiones totales, por cien',
          'El rango normal cambia por tipo de sitio: e-commerce 20-45%, SaaS 30-55%, servicios 25-55%, portal de noticias 40-60%, landing 60-90% y blog 65-90%',
          'Sesiones con engagement = las que no rebotaron, es decir el complemento a cien',
          'Quedar por debajo del piso del rango es buena señal, pero también puede delatar un error de medición',
        ],
        warn: [
          'Una tasa de rebote por debajo del 20% casi siempre es un problema de tracking: etiqueta duplicada, evento automático o una interacción que se dispara sola',
          'Google Analytics 4 cambió la definición: el rebote es lo contrario de la sesión con engagement, y esa sesión requiere 10 segundos, un evento de conversión o dos vistas de página. Los números de GA4 no son comparables con los de Universal Analytics',
          'Una landing de una sola página tiene rebote alto por diseño: ahí el indicador que importa es la conversión, no el rebote',
          'El rebote empeora con la velocidad de carga y en mobile: segmentá por dispositivo antes de sacar conclusiones',
        ],
        plazo: 'compará siempre contra el mismo período del año anterior: el rebote es muy estacional por mezcla de canales.',
      },
      {
        id: 'sov',
        label: 'Presencia de marca (share of voice)',
        hint: 'Y la brecha contra tu market share',
        answer:
          'El share of voice es tu porción de la conversación del mercado; lo que predice crecimiento es que sea mayor que tu share of market.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'SOV = métrica de tu marca sobre el total del mercado, por cien. La métrica puede ser inversión, impresiones o menciones, pero tiene que ser la misma arriba y abajo',
          'Bandas de lectura: menos de 3% es participación marginal, hasta 10% es challenger, hasta 25% es jugador relevante, hasta 50% es líder de segmento y arriba de 50% es dominio',
          'Brecha o exceso de share of voice: SOV menos SOM, medido en puntos porcentuales',
          'Con la brecha 5 puntos o más arriba se espera ganar participación; entre -2 y +5 estás defendiendo posición; por debajo de -2 hay riesgo de perderla',
        ],
        warn: [
          'El SOV depende por completo de cómo definís el mercado: si el denominador incluye o excluye a un competidor grande, el número cambia de banda',
          'Menciones y inversión no son intercambiables: una crisis de reputación dispara las menciones y hace ver un SOV altísimo que no es presencia sino incendio',
          'La relación entre exceso de share of voice y crecimiento es una tendencia estadística de largo plazo, no una promesa para tu trimestre',
          'Si no tenés una medición confiable del total del mercado, el SOV es una estimación con error grande: usalo para ver la tendencia, no el valor absoluto',
        ],
        plazo: 'el efecto del exceso de share of voice sobre la participación se ve en horizontes anuales, no mensuales.',
      },
    ],
  },

  inputsTitle: 'Cargá tus números',
  inputsIntro:
    'Cada rama usa sólo los campos que le sirven. Los demás podés dejarlos como están; no afectan el resultado.',
  fields: [
    {
      id: 'nps_prom',
      label: 'NPS · respuestas 9 y 10 (promotores)',
      type: 'number',
      min: 0,
      max: 10000000,
      step: 1,
      value: 120,
      thousands: true,
    },
    {
      id: 'nps_pas',
      label: 'NPS · respuestas 7 y 8 (pasivos)',
      type: 'number',
      min: 0,
      max: 10000000,
      step: 1,
      value: 90,
      thousands: true,
    },
    {
      id: 'nps_det',
      label: 'NPS · respuestas 0 a 6 (detractores)',
      type: 'number',
      min: 0,
      max: 10000000,
      step: 1,
      value: 40,
      thousands: true,
    },
    { id: 'ces_1', label: 'CES · respuestas con 1 (muchísimo esfuerzo)', type: 'number', min: 0, max: 10000000, step: 1, value: 3 },
    { id: 'ces_2', label: 'CES · respuestas con 2', type: 'number', min: 0, max: 10000000, step: 1, value: 5 },
    { id: 'ces_3', label: 'CES · respuestas con 3', type: 'number', min: 0, max: 10000000, step: 1, value: 8 },
    { id: 'ces_4', label: 'CES · respuestas con 4 (neutro)', type: 'number', min: 0, max: 10000000, step: 1, value: 14 },
    { id: 'ces_5', label: 'CES · respuestas con 5', type: 'number', min: 0, max: 10000000, step: 1, value: 25 },
    { id: 'ces_6', label: 'CES · respuestas con 6', type: 'number', min: 0, max: 10000000, step: 1, value: 30 },
    { id: 'ces_7', label: 'CES · respuestas con 7 (ningún esfuerzo)', type: 'number', min: 0, max: 10000000, step: 1, value: 15 },
    {
      id: 'web_tipo',
      label: 'Rebote · tipo de sitio',
      type: 'select',
      value: 'ecommerce',
      options: [
        { value: 'ecommerce', label: 'E-commerce (20-45%)' },
        { value: 'saas', label: 'SaaS / Software (30-55%)' },
        { value: 'servicios', label: 'Servicios / Brochure (25-55%)' },
        { value: 'portal', label: 'Portal / Noticias (40-60%)' },
        { value: 'landing', label: 'Landing page (60-90%)' },
        { value: 'blog', label: 'Blog / Contenido (65-90%)' },
        { value: 'otro', label: 'Otro / General (40-60%)' },
      ],
      help: 'El rango de referencia cambia por completo según el tipo de sitio. Elegí el que más se parezca al tuyo.',
    },
    {
      id: 'web_sesiones',
      label: 'Rebote · sesiones totales del período',
      type: 'number',
      min: 1,
      max: 1000000000,
      step: 100,
      value: 25000,
      thousands: true,
    },
    {
      id: 'web_rebotes',
      label: 'Rebote · sesiones que rebotaron',
      type: 'number',
      min: 0,
      max: 1000000000,
      step: 100,
      value: 9500,
      thousands: true,
      help: 'En GA4 es el complemento de las sesiones con engagement: sesiones totales menos sesiones con interacción.',
    },
    {
      id: 'sov_marca',
      label: 'Share of voice · métrica de tu marca',
      type: 'number',
      min: 0,
      max: 1000000000000,
      step: 1000,
      value: 1200000,
      thousands: true,
      help: 'Inversión, impresiones o menciones. Tiene que ser la misma unidad que el total del mercado.',
    },
    {
      id: 'sov_total',
      label: 'Share of voice · total del mercado',
      type: 'number',
      min: 1,
      max: 1000000000000,
      step: 1000,
      value: 15000000,
      thousands: true,
    },
    {
      id: 'sov_som',
      label: 'Share of voice · tu market share actual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.1,
      value: 6,
      help: 'Opcional. Poné 0 si no lo tenés: el hub calcula igual el share of voice, sin la brecha.',
    },
  ],
  fineprint:
    'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad. Las bandas de referencia son promedios de industria y no reemplazan tu propia serie histórica: el mejor benchmark de un indicador de marca sos vos mismo tres meses atrás.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala',
    caption:
      'La barra es la escala completa del indicador elegido, partida en sus bandas de referencia, y el marcador es tu puntaje. En NPS la escala va de -100 a 100; en CES, de 1 a 7; en rebote y share of voice, de 0% a 100%.',
    bands: [
      { label: 'Crítico', from: 0, to: 20, tone: 'bad' },
      { label: 'Mejorable', from: 20, to: 50, tone: 'warn' },
      { label: 'Bueno', from: 50, to: 80, tone: 'neutral' },
      { label: 'Excelente', from: 80, to: 100, tone: 'good' },
    ],
  },
  breakdownTitle: 'Cómo se arma tu puntaje',
  breakdownIntro:
    'Ninguna fila de este hub está en pesos: son porcentajes, puntos de escala, sesiones y respuestas. Cada una trae su unidad.',

  faq: [
    {
      q: 'Mi NPS es 32: ¿está bien o mal?',
      a: 'Un NPS de 32 cae en la banda "bueno": está por encima del promedio general y muy lejos de una situación crítica, pero también lejos de la zona excelente, que arranca en 50. La lectura práctica es que tenés más promotores que detractores con un margen cómodo, y que la palanca más rápida son los pasivos: la gente que puntúa 7 u 8 no suma al puntaje, así que convertir una parte de ese grupo en promotores mueve el número mucho más rápido que rescatar detractores. Ahora, el mismo 32 puede ser flojísimo o excelente según el rubro: en categorías de bajo amor de marca, como telcos, bancos o servicios públicos, un 32 es un resultado muy bueno.',
    },
    {
      q: '¿Cómo se calcula exactamente el NPS?',
      a: 'Se pregunta del 0 al 10 qué tan probable es que la persona recomiende la empresa. Los que responden 9 o 10 son promotores, los que responden 7 u 8 son pasivos y los que responden de 0 a 6 son detractores. El NPS es el porcentaje de promotores menos el porcentaje de detractores, y se expresa como un entero entre -100 y 100, sin el signo de porcentaje. Los pasivos no entran en la resta, pero sí en el total que se usa para calcular los porcentajes: por eso agregar pasivos baja el NPS aunque nadie se haya quejado.',
    },
    {
      q: '¿Cuántas respuestas necesito para que el NPS signifique algo?',
      a: 'Como regla práctica, por debajo de 100 respuestas el margen de error es tan grande que los movimientos mes a mes son ruido. Con 100 respuestas, una diferencia de menos de 10 puntos entre dos mediciones no es concluyente; recién con varios cientos empezás a poder leer variaciones de 5 puntos. Si tu base es chica, conviene mirar el promedio móvil de tres meses en lugar del dato del mes, y prestarle más atención a los comentarios abiertos que al número.',
    },
    {
      q: '¿Qué es el Customer Effort Score y en qué se diferencia del NPS?',
      a: 'El CES mide cuánto esfuerzo le costó al cliente resolver algo concreto: un reclamo, una devolución, un alta. Se pregunta con una escala de 1 a 7 sobre cuánto de acuerdo está con que la empresa le facilitó el trámite, y el puntaje es el promedio ponderado de todas las respuestas. El NPS mide la relación entera y es un indicador de lealtad; el CES mide una interacción puntual y es un indicador de fricción. Sirven para cosas distintas: el CES es el que mejor anticipa que alguien se va a ir, porque la gente abandona por fastidio acumulado mucho más que por falta de entusiasmo.',
    },
    {
      q: '¿Qué CES es aceptable?',
      a: 'En la escala de 1 a 7 donde 7 es el mínimo esfuerzo, de 6 para arriba la experiencia es excelente, entre 5 y 6 es buena, entre 4 y 5 es aceptable con fricciones visibles, entre 3 y 4 es mala y por debajo de 3 es crítica. Además del promedio conviene mirar la partición: el porcentaje de respuestas de 5 a 7 es tu base de bajo esfuerzo, y el de 1 a 3 es la que se te está por ir. Un promedio de 5 con muchas respuestas en los extremos no es lo mismo que un 5 con todo el mundo en el medio.',
    },
    {
      q: '¿Cuál es una tasa de rebote normal?',
      a: 'Depende del tipo de sitio, y por eso una tasa de rebote sin contexto no dice nada. Los rangos habituales son 20% a 45% en e-commerce, 30% a 55% en SaaS, 25% a 55% en sitios de servicios, 40% a 60% en portales de noticias, y 60% a 90% tanto en landings como en blogs. Un blog que rebota 75% está perfectamente sano: la gente llegó desde una búsqueda, leyó lo que buscaba y se fue satisfecha. Ese mismo 75% en un e-commerce es una alarma.',
    },
    {
      q: '¿Por qué mi tasa de rebote cambió cuando pasé a GA4?',
      a: 'Porque la definición cambió. En Universal Analytics el rebote era una sesión con una sola solicitud al servidor. En Google Analytics 4 se invirtió la lógica: primero se define la sesión con engagement, que es la que dura más de 10 segundos, o dispara un evento de conversión, o tiene al menos dos vistas de página o pantalla; y la tasa de rebote es simplemente el porcentaje de sesiones que no cumplen ninguna de esas condiciones. El resultado práctico es que en GA4 el rebote suele dar bastante más bajo, y que las series de antes y después de la migración no son comparables.',
    },
    {
      q: 'Mi tasa de rebote es del 8%: ¿está buenísima?',
      a: 'Casi seguro que no: está rota la medición. Un rebote por debajo del 20% en un sitio normal suele indicar que el código de seguimiento está duplicado, que hay un evento que se dispara automáticamente al cargar la página y marca la sesión como con engagement, o que un script de terceros genera interacciones falsas. Antes de festejar, revisá que la etiqueta no esté puesta dos veces y mirá qué eventos se disparan sin que el usuario haga nada.',
    },
    {
      q: '¿Qué es el share of voice y cómo se calcula?',
      a: 'Es tu porción de la conversación o de la inversión publicitaria de tu categoría: la métrica de tu marca dividida por el total del mercado, por cien. La métrica puede ser inversión en medios, impresiones o menciones, pero el numerador y el denominador tienen que estar medidos igual. Las bandas de lectura habituales son: por debajo de 3% es participación marginal, hasta 10% sos un challenger, hasta 25% sos un jugador relevante, hasta 50% sos líder del segmento y por encima de 50% dominás la categoría en comunicación.',
    },
    {
      q: '¿Qué es el exceso de share of voice y por qué importa?',
      a: 'Es la diferencia en puntos porcentuales entre tu share of voice y tu share of market, es decir, entre cuánto se te escucha y cuánto vendés. La observación de largo plazo es que las marcas que sostienen un share of voice por encima de su share de mercado tienden a ganar participación, y las que comunican menos de lo que venden tienden a erosionarse. Como referencia práctica, una brecha de 5 puntos o más a favor es base para crecer, una brecha entre -2 y +5 puntos es defensa de posición, y por debajo de -2 puntos hay riesgo. Es una tendencia estadística de horizonte anual, no una garantía trimestral.',
    },
    {
      q: '¿Se pueden combinar estos cuatro indicadores en un solo número?',
      a: 'Se puede, pero rara vez conviene. Cada uno mide una capa distinta —lealtad, fricción, calidad del tráfico y presencia— y promediarlos esconde justamente la información útil, que es cuál de las cuatro está mal. Lo que sí funciona es mirarlos juntos en un tablero: un NPS alto con un CES bajo señala un producto querido con operación pesada; un share of voice alto con rebote alto señala que estás comprando tráfico que no te corresponde; y un CES bueno con NPS malo suele significar que atendés bien pero el producto no entusiasma.',
    },
    {
      q: '¿Con qué frecuencia conviene medir cada uno?',
      a: 'El CES es transaccional: se dispara apenas cerrada la interacción, idealmente dentro de las 24 horas, y se mira acumulado por semana o por mes. El NPS es relacional y se mide en olas trimestrales o semestrales, siempre en el mismo momento del ciclo de vida para que la serie sea comparable. La tasa de rebote se mira continuo pero se compara contra el mismo período del año anterior, porque la mezcla de canales es estacional. Y el share of voice tiene sentido trimestral: por debajo de eso, el ruido de las campañas puntuales tapa la tendencia.',
    },
  ],

  sources: [
    {
      name: 'Bain & Company — Net Promoter System: origen y metodología del NPS',
      url: 'https://www.bain.com/insights/introducing-the-net-promoter-system-loyalty-insights/',
      publisher: 'Bain & Company',
    },
    {
      name: 'Qualtrics — Qué es el Net Promoter Score y cómo se interpreta',
      url: 'https://www.qualtrics.com/experience-management/customer/net-promoter-score/',
      publisher: 'Qualtrics',
    },
    {
      name: 'Stop Trying to Delight Your Customers — el paper del CEB (hoy Gartner) que introdujo el Customer Effort Score',
      url: 'https://hbr.org/2010/07/stop-trying-to-delight-your-customers',
      publisher: 'Harvard Business Review',
    },
    {
      name: 'Gartner — Customer service and support: reducción del esfuerzo del cliente',
      url: 'https://www.gartner.com/en/sales-service/topics/customer-service-and-support',
      publisher: 'Gartner',
    },
    {
      name: 'Ayuda de Google Analytics — Tasa de interacción y tasa de rebote en GA4',
      url: 'https://support.google.com/analytics/answer/12195621',
      publisher: 'Google',
    },
    {
      name: 'Ayuda de Google Analytics — Sesiones con interacción y definición de sesión',
      url: 'https://support.google.com/analytics/answer/9191807',
      publisher: 'Google',
    },
    {
      name: 'IPA — Media in Focus: exceso de share of voice y crecimiento de participación (Binet & Field)',
      url: 'https://ipa.co.uk/knowledge/publications-reports/media-in-focus-marketing-effectiveness-in-the-digital-era',
      publisher: 'Institute of Practitioners in Advertising',
    },
  ],

  replaces: [
    '/calculadora-nps-net-promoter-score',
    '/calculadora-customer-effort-score-ces',
    '/calculadora-tasa-rebote-benchmark-sitio-web',
    '/calculadora-share-of-voice-marketing',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
