import type { HubData } from './types';

/**
 * Hub de decisión — "¿A qué temperatura pongo el horno?"
 * Arquetipo: CÁLCULO DOMINANTE (la conversión °F→°C se lleva casi todo el
 * tráfico), así que NO usa `cases`: la respuesta fija va en `answer`.
 *
 * Absorbe 3 calculadoras: conversor °F↔°C de horno, conversión
 * °C/°F/gas mark y conversión horno a gas ↔ eléctrico.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: todas las filas declaran `format: 'unit'` con su unidad.
 *    Una fila sin format cae a $ por el Object.assign del runtime.
 *  - `chart.type: 'scale'` renderiza la barra con franjas + marcador en
 *    `position`; las franjas viajan con from/to en grados Celsius (ver SCALE).
 */
export const hub: HubData = {
  slug: 'cocina/temperatura-del-horno',
  title: '¿A qué temperatura pongo el horno? °C, °F y número de gas — 2026',
  description:
    'Convertí la temperatura del horno entre grados Celsius, Fahrenheit y el número de gas 1 a 9, con la equivalencia para horno con ventilador y el nombre que usa la receta: horno suave, moderado, fuerte o muy fuerte.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía y conversor de cocina',
  h1: '¿A qué temperatura pongo el horno?',
  lede:
    'Poné el número que dice la receta —en °C, en °F o el de la perilla del horno a gas— y te devolvemos las tres escalas, el ajuste si tu horno tiene ventilador y cómo se llama ese calor en la jerga de cocina.',
  stamps: ['Actualizado 27-07-2026', 'Tabla de gas mark 1 a 9 (UK/Irlanda)', '3 conversores adentro'],

  resultLabel: 'Temperatura del horno',

  inputsTitle: 'Poné el número de la receta',
  inputsIntro: 'Elegí en qué escala está escrito y nosotros lo pasamos a las otras dos.',
  fields: [
    {
      id: 'valor',
      label: 'Temperatura de la receta',
      type: 'number',
      min: -50,
      max: 600,
      step: 1,
      value: 350,
      help: 'Si es un número de gas, poné del 1 al 9.',
    },
    {
      id: 'unidad',
      label: '¿En qué escala está ese número?',
      type: 'select',
      value: 'fahrenheit',
      options: [
        { value: 'fahrenheit', label: 'Grados Fahrenheit (°F)' },
        { value: 'celsius', label: 'Grados Celsius (°C)' },
        { value: 'gas', label: 'Número de gas (perilla 1 a 9)' },
      ],
    },
    {
      id: 'horno',
      label: '¿Cómo es tu horno?',
      type: 'select',
      value: 'convencional',
      options: [
        { value: 'convencional', label: 'Convencional (sin ventilador)' },
        { value: 'conveccion', label: 'Con ventilador o convección' },
      ],
      help: 'El horno con ventilador cocina más parejo: se le bajan 20 °C a lo que dice la receta.',
    },
  ],
  fineprint:
    'Los hornos domésticos se desvían entre 10 y 25 °C respecto de la perilla. Un termómetro de horno de $ pocos pesos vale más que cualquier conversión: usá este número como punto de partida.',

  chart: {
    type: 'scale',
    title: 'La escala del horno, de suave a fuerte',
    caption:
      'La barra va de 100 a 280 °C con las franjas como las nombra una receta: horno suave alrededor de 140-160, moderado de 170 a 190, fuerte de 200 a 230 y muy fuerte de 240 para arriba. El marcador muestra dónde cae tu temperatura convertida.',
    bands: [
      { label: 'Muy suave', from: 100, to: 140, tone: 'neutral' },
      { label: 'Suave', from: 140, to: 165, tone: 'good' },
      { label: 'Moderado', from: 165, to: 195, tone: 'good' },
      { label: 'Fuerte', from: 195, to: 235, tone: 'warn' },
      { label: 'Muy fuerte', from: 235, to: 280, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu temperatura en todas las escalas',
  breakdownIntro: 'Cada fila trae su unidad. Las barras comparan los valores entre sí, no son una medida de calor.',

  answer: {
    title: 'Cómo leer la temperatura de una receta',
    copy:
      'Las recetas de Estados Unidos vienen en °F, las del Reino Unido en número de gas y las de acá en °C. Son la misma temperatura escrita de tres maneras: lo único que cambia de verdad es si tu horno tiene ventilador.',
    yes: [
      'De °F a °C: restá 32 y multiplicá por 5/9 (350 °F = 177 °C, en la práctica 180)',
      'De °C a °F: multiplicá por 9/5 y sumá 32',
      'Número de gas: 1 = 140 °C, 2 = 150, 3 = 165, 4 = 180, 5 = 190, 6 = 200, 7 = 220, 8 = 230, 9 = 240',
      'Horno con ventilador o convección: restale 20 °C a lo que pide la receta',
      'Horno suave 140-160 °C, moderado 170-190, fuerte 200-230, muy fuerte 240 o más',
      'Precalentá siempre: entre 10 y 20 minutos según lo caliente que vaya',
    ],
    warn: [
      'La perilla miente: la mayoría de los hornos domésticos se desvía 10 a 25 °C respecto de lo marcado',
      'La escala de gas no es lineal arriba del 6: entre gas 6 y gas 7 hay 20 °C de salto, no 10',
      'Si bajás 20 °C por el ventilador, no bajes además el tiempo: en general se acorta apenas un 10%',
      'Meter la comida sin precalentar cambia la textura, sobre todo en panificados y masas con levadura',
    ],
    plazo: 'precalentá 10 minutos para horno suave, 15 para moderado o fuerte y 20 para muy fuerte.',
  },

  faq: [
    {
      q: '¿Cuánto es 350 °F en grados centígrados para el horno?',
      a: '350 °F son 176,7 °C, y en la cocina se redondea a 180 °C, que es el clásico horno moderado. Es la temperatura más usada en recetas estadounidenses: bizcochuelos, budines, tartas y pollo entero.',
    },
    {
      q: '¿Cómo paso de Fahrenheit a Celsius sin calculadora?',
      a: 'Restá 32 y multiplicá por 5/9. La cuenta rápida de cocina es restar 30 y dividir por 2: para 350 °F da 160, un poco por debajo de los 177 reales, así que si querés precisión usá la fórmula completa o este hub.',
    },
    {
      q: '¿Qué temperatura es el número 4 del horno a gas?',
      a: 'El gas mark 4 son 180 °C o 350 °F, el horno moderado de toda la vida. La tabla completa es: 1 = 140 °C, 2 = 150, 3 = 165, 4 = 180, 5 = 190, 6 = 200, 7 = 220, 8 = 230 y 9 = 240 °C.',
    },
    {
      q: 'Mi horno no tiene números, sólo mínimo, medio y máximo. ¿Qué hago?',
      a: 'En un horno doméstico argentino el mínimo ronda los 140-160 °C, el medio los 180-200 y el máximo entre 230 y 260. Con un termómetro de horno de mostrador lo medís en 15 minutos y ya sabés a qué equivale cada posición de tu perilla.',
    },
    {
      q: '¿Cuánto le bajo si mi horno tiene ventilador o convección?',
      a: 'Restale 20 °C a lo que pide la receta: si dice 200 °C convencional, poné 180 °C con ventilador. El aire en movimiento transfiere más calor, así que además conviene revisar unos minutos antes del tiempo indicado.',
    },
    {
      q: '¿Qué significa horno suave, moderado y fuerte?',
      a: 'Horno suave son 140 a 160 °C (merengues, secados y cocciones largas), moderado 170 a 190 °C (bizcochuelos, tartas, pollo), fuerte 200 a 230 °C (panes, pizzas, papas doradas) y muy fuerte de 240 °C para arriba (pizza a la piedra, gratinar, dorar rápido).',
    },
    {
      q: '¿Cuánto tarda en precalentarse un horno?',
      a: 'Entre 10 y 20 minutos según a qué temperatura vaya y qué tan viejo sea. La luz o el chicharrón que avisa "listo" suele adelantarse: dale 5 minutos más de los que marca antes de meter la comida, sobre todo si horneás pan o pizza.',
    },
    {
      q: '¿Puedo hornear a menor temperatura por más tiempo?',
      a: 'A veces sí y a veces arruina la receta. Los guisos, las carnes de cocción larga y los braseados aguantan bajar 20 o 30 °C y estirar el tiempo. Los panificados y las masas con levadura no: dependen del golpe de calor inicial para levantar antes de que se forme la costra.',
    },
    {
      q: '¿Por qué mi horno quema abajo y no dora arriba?',
      a: 'Porque casi todos los hornos a gas domésticos calientan por el piso y tienen 20 a 30 °C de diferencia entre la bandeja de abajo y la de arriba. Poné la rejilla en el medio, girá la fuente a mitad de cocción y, si quema, apoyá una placa vacía en el piso del horno para amortiguar.',
    },
    {
      q: '¿Cuál es la temperatura segura para la carne?',
      a: 'La temperatura del horno no garantiza cocción: lo que importa es la interna de la pieza. El USDA marca 74 °C para pollo y aves, 71 °C para carne picada y 63 °C con 3 minutos de reposo para cortes enteros de vaca y cerdo. Se mide con termómetro en el punto más grueso.',
    },
  ],

  sources: [
    {
      name: 'NIST — Temperature and the SI: conversión entre escalas',
      url: 'https://www.nist.gov/pml/owm/si-units-temperature',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'Gas mark — tabla oficial de equivalencias del horno a gas',
      url: 'https://en.wikipedia.org/wiki/Gas_mark',
      publisher: 'Wikipedia',
    },
    {
      name: 'Oven temperature conversion guide (°C, °F, gas mark y horno ventilado)',
      url: 'https://www.bbcgoodfood.com/howto/guide/oven-temperature-conversion',
      publisher: 'BBC Good Food',
    },
    {
      name: 'Safe Minimum Internal Temperature Chart',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart',
      publisher: 'USDA Food Safety and Inspection Service',
    },
    {
      name: 'BIPM — El Sistema Internacional de Unidades (kelvin y grado Celsius)',
      url: 'https://www.bipm.org/en/measurement-units',
      publisher: 'Bureau International des Poids et Mesures',
    },
  ],

  replaces: [
    '/calculadora-conversor-fahrenheit-a-celsius-horno',
    '/calculadora-temperatura-horno-celsius-fahrenheit-gas',
    '/calculadora-conversion-temperaturas-horno-gas-electrico',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Tabla oficial gas mark → °C (UK/Irlanda). Misma que usa el módulo del repo. */
export const GAS_A_CELSIUS: Record<string, number> = {
  '1': 140,
  '2': 150,
  '3': 165,
  '4': 180,
  '5': 190,
  '6': 200,
  '7': 220,
  '8': 230,
  '9': 240,
};

/** Franjas de la escala del horno, en °C, como las nombra una receta. */
export const SCALE = {
  min: 100,
  max: 280,
  bands: [
    { label: 'Muy suave (<140)', to: 140, tone: 'prop' },
    { label: 'Suave (140–165)', to: 165, tone: 'good' },
    { label: 'Moderado (165–195)', to: 195, tone: 'main' },
    { label: 'Fuerte (195–235)', to: 235, tone: 'warn' },
    { label: 'Muy fuerte (≥235)', to: 280, tone: 'bad' },
  ],
};

/** Cuánto se le baja a la receta cuando el horno tiene ventilador (convección). */
export const AJUSTE_CONVECCION = 20;
