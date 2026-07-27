import type { HubData } from './types';

/**
 * Hub de decisión — "Convertir Celsius, Fahrenheit y Kelvin"
 * Arquetipo: CONVERSOR. NO usa `cases`: la respuesta fija va en `answer` y la
 * ramificación real la hacen los dos `select` (escala de origen y destino) más
 * los campos de viento y humedad, que activan la lectura de clima.
 *
 * Absorbe 5 calculadoras sueltas de temperatura (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Todas las filas del desglose salen con `format: 'unit'` + el símbolo real
 *    de la escala. El default del contrato es 'ars' y `Object.assign` copia
 *    `undefined`, así que una fila sin format propio se imprimiría en pesos.
 *  - `chart.type: 'scale'`: el runtime dibuja la barra de franjas y usa
 *    `position` (0-100) + `positionLabel`. Las franjas se declaran acá en
 *    `bands` con sus límites REALES en °C, porque el runtime imprime
 *    `from–to` en la leyenda y tienen que leerse como grados.
 *  - Sin `cases`, el runtime no llena las listas de "Qué te corresponde":
 *    las puebla la página desde `hub.answer` (mismo patrón que conversor-longitud).
 */
export const hub: HubData = {
  slug: 'conversores/temperatura',
  title: 'Convertir Celsius, Fahrenheit y Kelvin — conversor de temperatura',
  description:
    'Convertí °C, °F, K y grados Rankine al instante y en los dos sentidos. Con la escala de referencias reales (congelación, ambiente, fiebre, horno), sensación térmica por viento, índice de calor por humedad y control del cero absoluto.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Conversor de unidades',
  h1: 'Convertir Celsius, Fahrenheit y Kelvin',
  lede:
    'Elegí la escala que tenés y la que querés, escribí el número y listo: el resultado sale en las cuatro escalas a la vez. Abajo ves dónde cae esa temperatura en la vida real —si hiela, si es ambiente, si es fiebre, si es horno— y qué ropa corresponde si lo que estás mirando es el clima.',
  stamps: [
    'Actualizado 27-07-2026',
    'Kelvin y Rankine con el cero absoluto validado',
    '5 conversores adentro',
  ],

  resultLabel: 'Resultado de la conversión',

  inputsTitle: 'Qué temperatura querés convertir',
  inputsIntro:
    'La conversión se actualiza sola mientras escribís: no hace falta apretar nada para ver el número. El viento y la humedad son opcionales y sólo cambian la lectura de clima (sensación térmica y índice de calor), nunca la conversión.',
  fields: [
    // OJO: va como `text` a propósito. El parser del runtime lee miles al
    // estilo es-AR y un `number` con "-1.5" se leería mal; como `text` llega el
    // string crudo y lo parseamos acá, aceptando coma o punto decimal y el
    // signo menos (que en temperatura es la mitad de los casos).
    { id: 'valor', label: 'Temperatura', value: '25' },
    {
      id: 'desde',
      label: 'Escala que tenés',
      type: 'select',
      value: 'c',
      options: [
        { value: 'c', label: 'Grados Celsius (°C)' },
        { value: 'f', label: 'Grados Fahrenheit (°F)' },
        { value: 'k', label: 'Kelvin (K)' },
        { value: 'r', label: 'Grados Rankine (°R)' },
      ],
    },
    {
      id: 'hasta',
      label: 'Escala que querés',
      type: 'select',
      value: 'f',
      options: [
        { value: 'c', label: 'Grados Celsius (°C)' },
        { value: 'f', label: 'Grados Fahrenheit (°F)' },
        { value: 'k', label: 'Kelvin (K)' },
        { value: 'r', label: 'Grados Rankine (°R)' },
      ],
    },
    {
      id: 'viento',
      label: 'Viento (opcional, para la sensación térmica)',
      suffix: 'km/h',
      value: '0',
      help: 'La sensación térmica por viento sólo existe con 10 °C o menos y más de 4,8 km/h. Con calor no se aplica: ahí manda la humedad.',
    },
    {
      id: 'humedad',
      label: 'Humedad relativa (opcional, para el índice de calor)',
      suffix: '%',
      value: '50',
      help: 'El índice de calor se calcula desde 27 °C para arriba. Por debajo de esa temperatura la humedad casi no cambia lo que sentís.',
    },
  ],
  fineprint:
    'Las cuatro escalas se relacionan por fórmulas exactas: no hay redondeo de origen ni valor que se actualice con el tiempo. La sensación térmica y el índice de calor sí son modelos estadísticos y describen a una persona adulta sana a la sombra, sin sol directo.',

  chart: {
    type: 'scale',
    title: 'Dónde cae esa temperatura en la vida real',
    caption:
      'La regla va de −20 °C a 100 °C con referencias que se reconocen sin pensar: el agua congela en 0 °C, una habitación cómoda ronda los 21 °C, el cuerpo humano está en 37 °C, la fiebre arranca en 38 °C, una ducha caliente ronda los 40 °C, un café servido anda por los 70 °C y el agua hierve a 100 °C al nivel del mar. Tu temperatura convertida queda marcada sobre esa regla.',
    bands: [
      { label: '−20 a 0 °C — bajo cero: hiela, hay riesgo de helada', from: -20, to: 0, tone: 'bad' },
      { label: '0 a 10 °C — frío: campera y capas', from: 0, to: 10, tone: 'warn' },
      { label: '10 a 24 °C — ambiente: la zona de confort (21 °C)', from: 10, to: 24, tone: 'good' },
      { label: '24 a 40 °C — calor: cuerpo humano 37 °C, fiebre desde 38 °C', from: 24, to: 40, tone: 'warn' },
      { label: '40 a 70 °C — muy caliente: ducha 40 °C, café servido 70 °C', from: 40, to: 70, tone: 'warn' },
      { label: '70 a 100 °C — el agua hierve a 100 °C al nivel del mar', from: 70, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu temperatura en las cuatro escalas',
  breakdownIntro:
    'La escala que pediste queda destacada. Las barras comparan los números entre sí, y como Kelvin y Rankine arrancan en el cero absoluto siempre dan barras mucho más largas: mirá el valor, no la barra.',

  answer: {
    title: 'Las fórmulas, sin vueltas',
    copy:
      'Las cuatro escalas miden lo mismo con cero y paso distintos. Celsius y Kelvin comparten el tamaño del grado y se llevan 273,15 de diferencia; Fahrenheit y Rankine comparten el suyo, que es 5/9 del grado Celsius. Por eso todas las conversiones son una multiplicación y una suma, y ninguna cambia con el tiempo.',
    yes: [
      '°F = °C × 9/5 + 32 — y al revés: °C = (°F − 32) × 5/9',
      'K = °C + 273,15 — el kelvin no lleva el símbolo de grado ni se dice "grados kelvin"',
      '°R = °C × 9/5 + 491,67 = °F + 459,67 — Rankine es el Kelvin de las unidades imperiales',
      'Celsius y Fahrenheit se cruzan en un solo punto: −40 °C = −40 °F',
      'Referencias fijas: el agua congela a 0 °C = 32 °F = 273,15 K y hierve a 100 °C = 212 °F = 373,15 K al nivel del mar',
      'El cuerpo humano está en 37 °C = 98,6 °F; hay fiebre desde 38 °C = 100,4 °F',
      'Un salto de 1 °C es un salto de 1 K, pero de 1,8 °F y de 1,8 °R',
    ],
    warn: [
      'No existe temperatura por debajo del cero absoluto: −273,15 °C = −459,67 °F = 0 K = 0 °R. Si el resultado te da un Kelvin o un Rankine negativo, el dato de entrada está mal',
      'Para convertir una DIFERENCIA de temperatura no se suman los 32 ni los 273,15: una diferencia de 10 °C es una diferencia de 18 °F y de 10 K',
      'La sensación térmica por viento y el índice de calor por humedad no son conversiones: son modelos meteorológicos y no reemplazan al termómetro',
      'El agua hierve a 100 °C sólo al nivel del mar; a 2.000 metros hierve cerca de los 93 °C, y eso cambia tiempos de cocción',
      'Un horno doméstico está calibrado con tolerancia de ±10 a ±20 °C: convertí la receta, pero fiate del termómetro del horno',
    ],
    plazo: 'las escalas de temperatura son definiciones internacionales permanentes; no hay actualización que esperar.',
  },

  faq: [
    {
      q: '¿Cómo paso de Celsius a Fahrenheit de memoria?',
      a: 'La fórmula exacta es °F = °C × 9/5 + 32. El atajo mental que funciona bien en temperaturas de clima es duplicar y sumar 30: 20 °C × 2 + 30 = 70 °F, cuando el valor exacto es 68 °F. Sirve para saber si hay que llevar campera, no para una receta ni para un dato técnico.',
    },
    {
      q: '¿Cómo paso de Fahrenheit a Celsius?',
      a: 'Restás 32 y multiplicás por 5/9: °C = (°F − 32) × 5/9. Por ejemplo, 100 °F son (100 − 32) × 5/9 = 37,8 °C, prácticamente temperatura corporal. El atajo inverso es restar 30 y dividir por 2, que da 35 °C: cerca, pero un grado y medio abajo.',
    },
    {
      q: '¿Cuánto es 0 K y por qué no existe nada más frío?',
      a: '0 K son −273,15 °C, el cero absoluto: el punto donde el movimiento térmico de las partículas llega a su mínimo posible. Es un límite físico, no una convención, así que ningún valor en Kelvin o en Rankine puede ser negativo. Este conversor rechaza cualquier entrada que caiga por debajo de ese piso.',
    },
    {
      q: '¿Por qué el kelvin se escribe sin el símbolo de grado?',
      a: 'Porque desde 1967 el kelvin es una unidad de base del Sistema Internacional, no una escala de grados: se escribe "300 K" y se dice "300 kelvin", nunca "300 grados kelvin" ni "300 °K". Celsius, Fahrenheit y Rankine sí llevan el símbolo de grado.',
    },
    {
      q: '¿Qué son los grados Rankine y quién los usa?',
      a: 'Rankine es a Fahrenheit lo que Kelvin es a Celsius: una escala absoluta que arranca en el cero absoluto pero con el grado Fahrenheit. Se convierte con °R = °F + 459,67 y aparece sobre todo en termodinámica e ingeniería en Estados Unidos, donde las tablas de vapor y de gases vienen en esa unidad.',
    },
    {
      q: '¿Existe alguna temperatura que valga lo mismo en Celsius y en Fahrenheit?',
      a: 'Sí, una sola: −40. A −40 °C el termómetro Fahrenheit también marca −40 °F. Es el punto donde se cruzan las dos rectas, y sale de resolver x = x × 9/5 + 32.',
    },
    {
      q: '¿Qué es la sensación térmica y cuándo se aplica?',
      a: 'Es cuánto frío siente la piel expuesta cuando el viento se lleva la capa de aire tibio que la rodea. La fórmula que usamos es la oficial de Environment Canada, que sólo vale con temperaturas de 10 °C o menos y viento por encima de 4,8 km/h. Con 0 °C y 30 km/h de viento la sensación cae a unos −8 °C: la misma helada, el doble de riesgo.',
    },
    {
      q: '¿Y el índice de calor con humedad?',
      a: 'Es el reverso: con calor, la humedad alta impide que el sudor se evapore y el cuerpo no logra enfriarse. Se calcula desde los 27 °C con la fórmula del National Weather Service. Con 32 °C y 80% de humedad la sensación trepa por encima de los 40 °C, que es zona de golpe de calor.',
    },
    {
      q: '¿A cuántos grados Celsius equivale la fiebre de 100 °F?',
      a: '100 °F son 37,8 °C. La referencia clínica habitual toma 37 °C (98,6 °F) como temperatura corporal normal y considera fiebre desde 38 °C (100,4 °F). Entre 37 y 38 °C se habla de febrícula. Un termómetro que marca 102 °F está midiendo 38,9 °C.',
    },
    {
      q: '¿Cómo convierto la temperatura del horno de una receta en Fahrenheit?',
      a: 'Con la misma fórmula: 350 °F son 176,7 °C (se redondea a 180 °C), 400 °F son 204,4 °C (se usa 200 °C) y 450 °F son 232,2 °C (se usa 230 °C). Los hornos domésticos se calibran de a 10 °C y tienen una tolerancia de ±10 a ±20 °C, así que el redondeo no cambia el resultado de la receta.',
    },
    {
      q: '¿Cómo convierto una diferencia de temperatura y no un valor?',
      a: 'Una diferencia sólo se multiplica por la relación entre los grados, sin sumar el desplazamiento del cero. Un aumento de 10 °C es un aumento de 10 K y de 18 °F, no de 50 °F. El error de sumarle 32 a una variación es el más común en cálculos de calefacción y de rendimiento.',
    },
    {
      q: '¿A qué temperatura hay riesgo de helada para las plantas?',
      a: 'El agua congela a 0 °C, pero la helada meteorológica se declara cuando el aire baja de 0 °C a nivel de abrigo, y a ras del suelo puede hacer 2 o 3 grados menos. Por eso con un pronóstico de 3 °C ya conviene proteger las plantas sensibles: en el suelo la temperatura puede estar en cero.',
    },
  ],

  sources: [
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — definición del kelvin y de la escala Celsius',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
      date: '9.ª edición vigente',
    },
    {
      name: 'NIST — SI Units: Temperature (uso correcto del kelvin y del grado Celsius)',
      url: 'https://www.nist.gov/pml/owm/si-units-temperature',
      publisher: 'National Institute of Standards and Technology (NIST)',
    },
    {
      name: 'Wind Chill Index — fórmula oficial de sensación térmica por viento',
      url: 'https://www.canada.ca/en/environment-climate-change/services/weather-health/wind-chill-cold-weather/wind-chill-index.html',
      publisher: 'Environment and Climate Change Canada',
    },
    {
      name: 'Heat Index — ecuación de Rothfusz y tabla de riesgo por humedad',
      url: 'https://www.weather.gov/safety/heat-index',
      publisher: 'National Weather Service (NOAA)',
    },
    {
      name: 'Servicio Meteorológico Nacional — pronóstico y alertas por temperaturas extremas',
      url: 'https://www.smn.gob.ar/',
      publisher: 'Servicio Meteorológico Nacional (Argentina)',
    },
  ],

  replaces: [
    '/conversor-celsius-fahrenheit-temperatura',
    '/calculadora-conversion-celsius-fahrenheit-kelvin-rankine-temperatura',
    '/calculadora-conversion-fahrenheit-celsius-clima',
    '/calculadora-conversor-celsius-a-kelvin',
    '/calculadora-conversion-temperatura-clima',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Escalas, en forma LINEAL y serializable (nada de funciones: este objeto viaja
 * por `define:vars`, que lo pasa por JSON y se comería cualquier closure).
 *
 *   °C = (valor − off) × k        valor = °C / k + off
 *
 * Los coeficientes son exactos por definición (BIPM / NIST).
 * `min` es el valor de esa escala en el cero absoluto: nada puede estar debajo.
 */
export const SCALES: Record<
  string,
  { sym: string; name: string; off: number; k: number; min: number }
> = {
  c: { sym: '°C', name: 'Grados Celsius', off: 0, k: 1, min: -273.15 },
  f: { sym: '°F', name: 'Grados Fahrenheit', off: 32, k: 5 / 9, min: -459.67 },
  k: { sym: 'K', name: 'Kelvin', off: 273.15, k: 1, min: 0 },
  r: { sym: '°R', name: 'Grados Rankine', off: 491.67, k: 5 / 9, min: 0 },
};

/** Cero absoluto en grados Celsius. Piso físico de todo el hub. */
export const CERO_ABSOLUTO_C = -273.15;

/** Extremos de la regla comparativa, en °C. Coinciden con `chart.bands`. */
export const SCALE_RANGE = { min: -20, max: 100 };

/** Referencias reconocibles para ubicar la temperatura, en °C. */
export const REFS: Array<{ c: number; label: string }> = [
  { c: -18, label: 'un freezer doméstico' },
  { c: 0, label: 'el agua congelándose' },
  { c: 8, label: 'la heladera' },
  { c: 21, label: 'una habitación cómoda' },
  { c: 37, label: 'la temperatura del cuerpo' },
  { c: 38, label: 'el umbral de la fiebre' },
  { c: 40, label: 'una ducha caliente' },
  { c: 70, label: 'un café recién servido' },
  { c: 100, label: 'el agua hirviendo' },
  { c: 180, label: 'un horno de tarta' },
];

/**
 * Qué ponerse según la temperatura del aire, en °C.
 * Mismo escalonado que la fórmula vieja `conversion-temperatura-clima.ts`.
 */
export const ROPA: Array<{ max: number; texto: string }> = [
  { max: -10, texto: 'Frío extremo — abrigo térmico, gorro, guantes y cubrir la piel expuesta.' },
  { max: 0, texto: 'Muy frío — campera de pluma, bufanda y guantes.' },
  { max: 10, texto: 'Frío — campera con polar y pantalón largo.' },
  { max: 20, texto: 'Fresco — pulóver liviano o campera fina.' },
  { max: 28, texto: 'Agradable — ropa liviana.' },
  { max: 35, texto: 'Calor — algodón, hidratación y protector solar.' },
  // OJO: 9999 y no Infinity — este array viaja por `define:vars`, que serializa
  // a JSON, y ahí Infinity se convierte en null y rompe la comparación.
  { max: 9999, texto: 'Calor extremo — evitá la exposición al sol entre las 11 y las 16, y tomá mucha agua.' },
];
