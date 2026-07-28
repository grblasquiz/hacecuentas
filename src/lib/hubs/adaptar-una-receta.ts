import type { HubData } from './types';

/**
 * Hub de decisión — "La receta no me sirve como está: ¿cómo la adapto?"
 *
 * Une las cinco calculadoras de adaptación de recetas que estaban sueltas.
 * Todas responden la misma pregunta con distinta cara: cuál es el FACTOR por el
 * que hay que multiplicar lo que dice la receta. Por eso el gráfico es siempre
 * el mismo eje: el factor de conversión.
 */
export const hub: HubData = {
  slug: 'cocina/adaptar-una-receta',
  title: 'Adaptar una receta: porciones, molde y reemplazos | Hacé Cuentas',
  description:
    'Cómo escalar una receta a más o menos porciones, cómo convertir las cantidades cuando el molde no es el de la receta y con qué reemplazar el ingrediente que te falta, con la proporción exacta.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía de conversión',
  h1: 'La receta no me da: ¿cómo la adapto?',
  lede:
    'Partimos de lo más común: la receta rinde para X y sos Y. Ajustá los números y, si tu problema es el molde o un ingrediente que no tenés, cambiá el caso abajo.',
  stamps: ['Escalado por factor', 'Molde por área, no por diámetro', '5 calculadoras adentro'],

  resultLabel: 'Factor de conversión',

  cases: {
    title: '¿Qué no te cierra de la receta?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'porciones',
        label: 'Rinde para otra cantidad de gente',
        hint: 'Escalar la receta',
        answer: 'El factor es porciones que querés ÷ porciones de la receta.',
        yes: [
          'Factor único que se aplica a cada ingrediente por igual',
          'La cantidad convertida del ingrediente que cargues',
          'Aviso cuando el factor es tan grande o tan chico que hay que revisar molde y cocción',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'La sal, las especias y la levadura no escalan lineales: al duplicar, empezá con un 75% de lo que da el factor y corregí probando',
          'El tiempo de cocción NO se multiplica por el factor: depende del grosor de la masa, no del volumen total',
        ],
        plazo: 'los huevos se redondean a unidades enteras: ajustá el líquido para compensar.',
      },
      {
        id: 'molde',
        label: 'Tengo otro molde que el de la receta',
        hint: 'Torta redonda, cuadrada o rectangular',
        answer: 'El factor sale del área de los moldes, no del diámetro.',
        yes: [
          'Factor por cociente de áreas: un molde de 24 cm no es "un poco más" que uno de 20, es un 44% más',
          'Diámetro redondo equivalente de tu molde',
          'Ajuste sugerido de horno y tiempo según cuánto cambia la altura de la masa',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Si no escalás los ingredientes, la masa queda más finita o más alta y el tiempo cambia en consecuencia',
          'En moldes muy grandes conviene bajar el horno 10-15 °C para que el borde no se seque antes de que cocine el centro',
        ],
        plazo: 'revisá con palillo desde 10 minutos antes del tiempo original.',
      },
      {
        id: 'reemplazo',
        label: 'Me falta un ingrediente',
        hint: 'Con qué lo cambio y en qué proporción',
        answer: 'Cada reemplazo tiene su factor: no es siempre uno por uno.',
        yes: [
          'Cantidad exacta del reemplazo principal para lo que pide la receta',
          'Alternativas con su propia proporción y para qué sirve cada una',
          'Aviso sobre qué cambia en la textura o en los líquidos de la receta',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Ningún reemplazo es idéntico: el aceite hace una miga más húmeda y menos estructurada que la manteca, y las harinas sin gluten no levan igual',
          'Si el reemplazo es por alergia o celiaquía, revisá también la contaminación cruzada del resto de los ingredientes',
        ],
        plazo: 'probá el reemplazo en una tanda chica antes de usarlo en la receta que te importa.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu receta',
  inputsIntro: 'Cada caso usa los campos que le corresponden; los demás podés dejarlos como están.',
  fields: [
    { id: 'porcOriginal', label: 'Porciones que dice la receta', type: 'number', min: 1, max: 200, value: 4 },
    { id: 'porcDeseadas', label: 'Porciones que querés', type: 'number', min: 1, max: 500, value: 6 },
    {
      id: 'cantidad',
      label: 'Cantidad del ingrediente que querés convertir',
      type: 'number',
      min: 0.1,
      max: 100000,
      step: 0.1,
      value: 200,
      help: 'En gramos, mililitros o unidades según el ingrediente: el factor es el mismo para todos.',
    },
    { id: 'diamReceta', label: 'Molde de la receta: diámetro (cm)', type: 'number', min: 5, max: 60, value: 20 },
    {
      id: 'forma',
      label: 'Forma de TU molde',
      type: 'select',
      value: 'redondo',
      options: [
        { value: 'redondo', label: 'Redondo' },
        { value: 'cuadrado', label: 'Cuadrado' },
        { value: 'rectangular', label: 'Rectangular' },
      ],
    },
    { id: 'medida1', label: 'Tu molde: diámetro o lado largo (cm)', type: 'number', min: 5, max: 80, value: 24 },
    { id: 'medida2', label: 'Tu molde: lado corto (cm), sólo si es rectangular', type: 'number', min: 0, max: 80, value: 20 },
    {
      id: 'ingrediente',
      label: 'Ingrediente que te falta',
      type: 'select',
      value: 'huevo',
      options: [
        { value: 'huevo', label: 'Huevo' },
        { value: 'manteca', label: 'Manteca' },
        { value: 'aceite', label: 'Aceite' },
        { value: 'leche', label: 'Leche' },
        { value: 'harina_trigo', label: 'Harina de trigo' },
        { value: 'azucar', label: 'Azúcar' },
        { value: 'crema', label: 'Crema de leche' },
        { value: 'levadura_fresca', label: 'Levadura fresca' },
        { value: 'polvo_hornear', label: 'Polvo de hornear' },
      ],
    },
    {
      id: 'sustitutoHuevo',
      label: 'Si te falta huevo: con qué lo reemplazás',
      type: 'select',
      value: 'linaza',
      options: [
        { value: 'linaza', label: 'Linaza molida + agua (ligante)' },
        { value: 'chia', label: 'Chía molida + agua (ligante)' },
        { value: 'banana', label: 'Banana madura pisada (humedad)' },
        { value: 'tofu', label: 'Tofu sedoso (textura cremosa)' },
        { value: 'yogur', label: 'Yogur de soja (humedad)' },
        { value: 'aquafaba', label: 'Aquafaba (claras, merengues)' },
        { value: 'manzana', label: 'Puré de manzana (humedad)' },
      ],
    },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',

  chart: {
    type: 'scale',
    title: 'Cuánto se mueve tu receta',
    caption:
      'Todas las ramas terminan en lo mismo: por cuánto hay que multiplicar lo que dice la receta. A la izquierda achicás, a la derecha agrandás, y el centro es "queda casi igual".',
    bands: [
      { label: 'Menos de la mitad', from: 0, to: 0.5, tone: 'warn' },
      { label: 'Reducís', from: 0.5, to: 0.9, tone: 'neutral' },
      { label: 'Casi igual', from: 0.9, to: 1.1, tone: 'good' },
      { label: 'Agrandás', from: 1.1, to: 2, tone: 'neutral' },
      { label: 'Más del doble', from: 2, to: 4, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Los números de la conversión',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿Cómo se calcula el factor para escalar una receta?',
      a: 'Se divide las porciones que querés por las porciones que dice la receta. Si la receta rinde 4 y necesitás 6, el factor es 1,5: cada ingrediente se multiplica por 1,5. Es lineal para harinas, líquidos, azúcares y grasas, pero no para condimentos, levaduras ni tiempos de cocción.',
    },
    {
      q: '¿Se duplica la sal y las especias al duplicar una receta?',
      a: 'No conviene. La percepción del salado y del picante no es lineal con la cantidad: al duplicar, empezá con un 75% de lo que da el factor, probá y corregí. Con el picante y las especias muy aromáticas (clavo, comino, nuez moscada) el margen es todavía más chico.',
    },
    {
      q: '¿Se multiplica también el tiempo de cocción?',
      a: 'No. El tiempo depende del grosor de la pieza o de la capa de masa, no del volumen total. Si duplicás una torta y la hacés en dos moldes iguales, el tiempo es casi el mismo. Si la hacés en un molde más grande con la misma altura de masa, también. El tiempo sólo cambia cuando cambia el espesor.',
    },
    {
      q: '¿Cómo convierto una receta de molde de 20 cm a uno de 24 cm?',
      a: 'Por área, no por diámetro. El área de un molde de 20 cm es 314 cm² y la de uno de 24 cm es 452 cm²: el factor es 1,44, o sea un 44% más de cada ingrediente. Si sólo mirás el diámetro parece un 20% más y la torta sale finita.',
    },
    {
      q: '¿Cómo paso de un molde redondo a uno cuadrado?',
      a: 'Comparando áreas igual. Un molde cuadrado de 20×20 cm tiene 400 cm², equivalente a un redondo de 22,6 cm. Regla práctica: un cuadrado del mismo número que un redondo tiene alrededor de un 27% más de capacidad.',
    },
    {
      q: '¿Con qué reemplazo un huevo en repostería?',
      a: 'Depende de qué función cumple. Para ligar: 7 g de linaza molida o 12 g de chía con 45 ml de agua, reposando 5 a 10 minutos hasta que gelifique. Para humedad y dulzor: media banana pisada (unos 60 g) o 60 g de puré de manzana. Para textura cremosa: 60 g de tofu sedoso. Para montar claras: 45 ml de aquafaba, el líquido de la lata de garbanzos, batido de 5 a 7 minutos.',
    },
    {
      q: '¿Cuánto aceite pongo en lugar de manteca?',
      a: 'El 80% del peso de la manteca. Si la receta pide 100 g de manteca, van 80 g de aceite, que son unos 87 ml. La razón es que la manteca tiene alrededor de un 82% de grasa y un 16% de agua, mientras que el aceite es grasa pura. Como perdés esa agua, sumá unos 16 ml de leche por cada 100 g de manteca reemplazada.',
    },
    {
      q: '¿Y al revés, cuánta manteca en lugar de aceite?',
      a: 'Un 25% más de peso: 100 g de aceite se reemplazan con 125 g de manteca. Y como la manteca trae agua propia, conviene restar unos 20 ml de líquido de la receta para que la masa no quede aguada.',
    },
    {
      q: '¿Cuánta levadura seca equivale a la fresca?',
      a: 'Un tercio del peso: 30 g de levadura fresca equivalen a 10 g de levadura seca o instantánea. La fresca se disuelve en líquido tibio, la instantánea se mezcla directamente con la harina. Los tiempos de leudado son prácticamente iguales.',
    },
    {
      q: '¿Puedo reemplazar el polvo de hornear por bicarbonato?',
      a: 'Sí, pero necesita un ácido: media cucharadita de bicarbonato más una cucharadita de vinagre o jugo de limón reemplazan una cucharadita de polvo de hornear. El bicarbonato solo, sin ácido, deja gusto jabonoso y no leva. Y al llevar ácido, la masa hay que hornearla enseguida.',
    },
    {
      q: '¿Se puede reducir a la mitad cualquier receta?',
      a: 'Casi cualquiera, con dos cuidados. Los huevos: medio huevo se resuelve batiendo uno y pesando la mitad (unos 25 g). Y los moldes: la mitad de la masa en el molde original queda muy fina y se seca, así que hay que bajar de tamaño de molde con el mismo criterio de área.',
    },
    {
      q: '¿Con qué reemplazo la harina de trigo si no consigo?',
      a: 'Para masas, harina de arroz uno a uno como base, aunque conviene mezclarla con almidón y una goma (xántica o psyllium) para compensar el gluten ausente. La harina de avena va uno a uno pero da una miga más densa. La almendra aporta grasa y no leva sola. La maicena sólo sirve para espesar, y ahí alcanza con la mitad del peso.',
    },
  ],

  sources: [
    {
      name: 'Pan Size Conversions — equivalencias de moldes por área',
      url: 'https://www.kingarthurbaking.com/learn/resources/pan-size-conversions',
      publisher: 'King Arthur Baking Company',
    },
    {
      name: 'Ingredient Weight Chart — pesos de referencia de ingredientes de repostería',
      url: 'https://www.kingarthurbaking.com/learn/ingredient-weight-chart',
      publisher: 'King Arthur Baking Company',
    },
    {
      name: 'FoodData Central — composición de manteca, aceites y huevo',
      url: 'https://fdc.nal.usda.gov/',
      publisher: 'USDA Agricultural Research Service',
    },
  ],

  replaces: [
    '/calculadora-multiplicar-dividir-receta-porciones',
    '/conversor-molde-torta-tamano',
    '/calculadora-sustitucion-ingredientes-cocina',
    '/calculadora-sustituto-huevo-vegano-receta',
    '/sustituir-manteca-por-aceite-reposteria',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Densidad del aceite, g/ml. */
export const DENSIDAD_ACEITE = 0.92;
/** Proporción de agua en la manteca: lo que hay que compensar al pasar a aceite. */
export const AGUA_MANTECA = 0.16;

/**
 * Reemplazos por ingrediente. `factor` es cuánto del sustituto va por cada
 * unidad del ingrediente original, en la misma unidad salvo que `unidad` diga
 * otra cosa.
 */
export const REEMPLAZOS: Record<
  string,
  {
    nombre: string;
    unidad: string;
    nota: string;
    opciones: Array<{ nombre: string; factor: number; unidad: string; nota: string }>;
  }
> = {
  manteca: {
    nombre: 'Manteca', unidad: 'g',
    nota: 'La manteca es ~82% grasa y ~16% agua: al pasar a aceite perdés esa agua y hay que reponerla.',
    opciones: [
      { nombre: 'Aceite neutro', factor: 0.8, unidad: 'g', nota: 'La opción estándar: 80% del peso.' },
      { nombre: 'Aceite neutro, en volumen', factor: 0.8 / 0.92, unidad: 'ml', nota: 'El mismo aceite, medido con jarra.' },
      { nombre: 'Aceite de coco sólido', factor: 1, unidad: 'g', nota: 'Textura parecida a la manteca, deja sabor a coco.' },
      { nombre: 'Yogur griego', factor: 1, unidad: 'g', nota: 'Baja la grasa, sube la humedad. Sólo en bizcochos.' },
      { nombre: 'Palta pisada', factor: 1, unidad: 'g', nota: 'Funciona en brownies y masas de color oscuro.' },
      { nombre: 'Líquido a agregar para compensar', factor: 0.16, unidad: 'ml', nota: 'Leche o el líquido de la receta.' },
    ],
  },
  aceite: {
    nombre: 'Aceite', unidad: 'g',
    nota: 'Al volver a manteca sumás agua: conviene descontarla del líquido de la receta.',
    opciones: [
      { nombre: 'Manteca', factor: 1.25, unidad: 'g', nota: 'Un 25% más de peso, porque no es grasa pura.' },
      { nombre: 'Volumen equivalente del aceite', factor: 1 / 0.92, unidad: 'ml', nota: 'Por si la receta lo pide en ml.' },
      { nombre: 'Líquido a restar de la receta', factor: 1.25 * 0.16, unidad: 'ml', nota: 'El agua que aporta la manteca.' },
    ],
  },
  leche: {
    nombre: 'Leche', unidad: 'ml',
    nota: 'Casi todos los reemplazos van uno a uno; lo que cambia es el cuerpo y el sabor.',
    opciones: [
      { nombre: 'Leche de soja', factor: 1, unidad: 'ml', nota: 'La más parecida en proteína y comportamiento.' },
      { nombre: 'Leche de avena', factor: 1, unidad: 'ml', nota: 'Cremosa, va muy bien en masas y salsas.' },
      { nombre: 'Leche de almendras', factor: 1, unidad: 'ml', nota: 'Más liviana, buena en repostería.' },
      { nombre: 'Agua', factor: 1, unidad: 'ml', nota: 'De apuro: sumale 10 g de manteca por cada 100 ml.' },
    ],
  },
  harina_trigo: {
    nombre: 'Harina de trigo', unidad: 'g',
    nota: 'Sin gluten ninguna reemplaza sola a la de trigo en masas que tienen que levar.',
    opciones: [
      { nombre: 'Harina de arroz', factor: 1, unidad: 'g', nota: 'Base sin gluten; mezclala con almidón y goma.' },
      { nombre: 'Harina de avena', factor: 1, unidad: 'g', nota: 'Miga más densa, aporta fibra.' },
      { nombre: 'Harina de almendras', factor: 1, unidad: 'g', nota: 'Sin gluten y con grasa propia: no leva.' },
      { nombre: 'Maicena (sólo para espesar)', factor: 0.5, unidad: 'g', nota: 'La mitad del peso; no sirve para masas.' },
    ],
  },
  azucar: {
    nombre: 'Azúcar', unidad: 'g',
    nota: 'El azúcar no sólo endulza: aporta estructura, humedad y dorado.',
    opciones: [
      { nombre: 'Azúcar mascabo', factor: 1, unidad: 'g', nota: 'Uno a uno, con más sabor y humedad.' },
      { nombre: 'Miel', factor: 0.75, unidad: 'g', nota: 'Endulza más: bajá 10-15% los líquidos de la receta.' },
      { nombre: 'Pasta de dátiles', factor: 1, unidad: 'g', nota: 'Aporta fibra y color oscuro.' },
    ],
  },
  crema: {
    nombre: 'Crema de leche', unidad: 'ml',
    nota: 'Para cocinar hay varios reemplazos; para batir a punto chantilly, casi ninguno.',
    opciones: [
      { nombre: 'Leche', factor: 1, unidad: 'ml', nota: 'Sumale 15 g de manteca cada 100 ml. No se bate.' },
      { nombre: 'Crema de coco (parte sólida)', factor: 1, unidad: 'ml', nota: 'Sí se bate, bien fría.' },
      { nombre: 'Yogur griego', factor: 1, unidad: 'ml', nota: 'Para salsas frías y aderezos.' },
    ],
  },
  levadura_fresca: {
    nombre: 'Levadura fresca', unidad: 'g',
    nota: '30 g de fresca equivalen a 10 g de seca: un tercio del peso.',
    opciones: [
      { nombre: 'Levadura seca', factor: 1 / 3, unidad: 'g', nota: 'Se activa en líquido tibio antes de usar.' },
      { nombre: 'Levadura instantánea', factor: 1 / 3, unidad: 'g', nota: 'Va directo mezclada con la harina.' },
    ],
  },
  polvo_hornear: {
    nombre: 'Polvo de hornear', unidad: 'cditas',
    nota: 'El bicarbonato solo no leva: necesita un ácido en la receta.',
    opciones: [
      { nombre: 'Bicarbonato de sodio', factor: 0.5, unidad: 'cditas', nota: 'La mitad, y con ácido.' },
      { nombre: 'Vinagre o jugo de limón', factor: 1, unidad: 'cditas', nota: 'El ácido que activa el bicarbonato.' },
      { nombre: 'Claras batidas a nieve', factor: 2, unidad: 'claras', nota: 'Aportan aire en vez de gas.' },
    ],
  },
};

/**
 * Sustitutos del huevo, por huevo reemplazado.
 * `seco` en gramos, `agua` en ml cuando el sustituto necesita hidratarse.
 */
export const SUSTITUTOS_HUEVO: Record<
  string,
  { nombre: string; seco: number; unidadSeco: string; agua: number; reposoMin: number; mejorPara: string }
> = {
  linaza: { nombre: 'Linaza molida', seco: 7, unidadSeco: 'g', agua: 45, reposoMin: 5, mejorPara: 'ligar: galletitas, panes, brownies, hamburguesas vegetales' },
  chia: { nombre: 'Chía molida', seco: 12, unidadSeco: 'g', agua: 45, reposoMin: 10, mejorPara: 'ligar: panes, muffins, panqueques' },
  banana: { nombre: 'Banana madura pisada', seco: 60, unidadSeco: 'g', agua: 0, reposoMin: 0, mejorPara: 'humedad y dulzor: tortas, muffins, panqueques' },
  tofu: { nombre: 'Tofu sedoso', seco: 60, unidadSeco: 'g', agua: 0, reposoMin: 0, mejorPara: 'textura cremosa: quiches, tartas saladas, flanes' },
  yogur: { nombre: 'Yogur de soja natural', seco: 60, unidadSeco: 'g', agua: 0, reposoMin: 0, mejorPara: 'humedad: bizcochos y tortas' },
  aquafaba: { nombre: 'Aquafaba (líquido de garbanzos)', seco: 45, unidadSeco: 'ml', agua: 0, reposoMin: 0, mejorPara: 'reemplazar claras: merengues, mousses, macarons' },
  manzana: { nombre: 'Puré de manzana sin azúcar', seco: 60, unidadSeco: 'g', agua: 0, reposoMin: 0, mejorPara: 'humedad: bizcochos dulces y muffins' },
};

/** Tope del eje del gráfico (factor de conversión). */
export const EJE_MAX = 4;
