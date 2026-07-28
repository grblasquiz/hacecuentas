import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tiempo y a qué temperatura va esta carne?"
 *
 * Une las cinco calculadoras de cocción de carne que estaban sueltas. Dos de
 * ellas se contradecían entre sí en la temperatura interna (una decía 74 °C
 * para vaca bien cocida y la otra 71 °C; una daba 72 °C para pechuga de pollo,
 * por debajo del mínimo seguro de 74 °C del USDA-FSIS). Acá hay UNA sola tabla
 * de temperatura interna y todos los cálculos leen de ella.
 *
 * YMYL — seguridad alimentaria: el fineprint y el primer `warn` de cada rama
 * llevan el disclaimer textual de `getCalculatorDisclaimer` para categoría
 * 'cooking'.
 */
export const hub: HubData = {
  slug: 'cocina/coccion-de-carne',
  title: 'Cocción de carne: tiempo, temperatura interna y punto | Hacé Cuentas',
  description:
    'Cuánto tiempo de horno por kilo, a qué temperatura interna está lista, cuánto tarda en descongelarse, cuánto marinarla y qué aceite aguanta la fritura. Con los mínimos seguros del USDA-FSIS.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía de cocción',
  h1: '¿Cuánto tiempo va esta carne?',
  lede:
    'Partimos de lo más frecuente: una pieza al horno y cuántos minutos por kilo necesita. Si lo que querés saber es la temperatura interna, el descongelado, el marinado o el aceite de la fritura, cambialo abajo.',
  stamps: [
    'Mínimos seguros USDA-FSIS',
    'Una sola tabla de temperatura interna',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Tiempo estimado',

  cases: {
    title: '¿Qué necesitás saber?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'horno',
        label: 'Cuánto tiempo de horno lleva',
        hint: 'Minutos por kilo',
        answer: 'El tiempo sale de minutos por kilo, pero el que manda es el termómetro.',
        yes: [
          'Minutos por kilo según el corte y el punto que busques',
          'Temperatura de horno recomendada para ese corte',
          'Temperatura interna a la que hay que sacarla del fuego',
          'Tiempo de reposo antes de cortar',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Los minutos por kilo son una referencia de planificación. El grosor de la pieza pesa más que el peso total: dos piezas de 1 kg, una chata y una compacta, no tardan lo mismo',
          'Todo horno miente: el termostato puede estar 20 °C arriba o abajo del número del dial',
        ],
        plazo: 'empezá a controlar con termómetro cuando falte un 20% del tiempo estimado.',
      },
      {
        id: 'termometro',
        label: 'A qué temperatura interna está lista',
        hint: 'Seguridad alimentaria',
        answer: 'Aves 74 °C, carne picada 71 °C, cortes enteros 63 °C con 3 minutos de reposo.',
        yes: [
          'Temperatura objetivo para el punto que elegiste',
          'Temperatura a la que hay que retirarla: sube 3 a 5 °C durante el reposo',
          'Mínimo seguro del USDA-FSIS para ese tipo de carne',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Pollo y otras aves nunca por debajo de 74 °C: es el umbral contra salmonella y campylobacter, y no se negocia por gusto',
          'La carne picada va a 71 °C aunque sea de vaca: al picarla, las bacterias de la superficie quedan repartidas en todo el interior',
          'El color no sirve como indicador: hay carne rosada segura y carne gris que no llegó a temperatura',
        ],
        plazo: 'medí en el centro de la parte más gruesa, sin tocar hueso ni la bandeja.',
      },
      {
        id: 'descongelado',
        label: 'Cuánto tarda en descongelarse',
        hint: 'Y cuál método es seguro',
        answer: 'En heladera son unas 10 horas por kilo; es el único método que permite volver a guardarla.',
        yes: [
          'Heladera: unas 10 horas por kilo, el método más seguro',
          'Agua fría en bolsa hermética: unas 2 horas por kilo, cambiando el agua cada 30 minutos',
          'Microondas en función descongelar: unos 12 minutos por kilo',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Nunca descongeles sobre la mesada: la superficie pasa horas entre 5 y 60 °C, que es donde las bacterias se multiplican',
          'Descongelado en agua o microondas: se cocina inmediatamente y no se vuelve a congelar',
        ],
        plazo: 'una vez descongelada en heladera, aguanta 1 o 2 días antes de cocinarla.',
      },
      {
        id: 'marinado',
        label: 'Cuánto tiempo la dejo marinando',
        hint: 'Sin que se arruine la textura',
        answer: 'La ventana depende de la proteína y de si la marinada es ácida.',
        yes: [
          'Ventana mínima, óptima y máxima según proteína, grosor y tipo de marinada',
          'Las marinadas ácidas (limón, vinagre, vino) actúan un 40% más rápido',
          'Las secas o en pasta actúan más lento y aguantan más tiempo',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Marinar siempre en heladera, nunca a temperatura ambiente',
          'La marinada que estuvo en contacto con carne cruda no se usa como salsa salvo que la hiervas 2 minutos',
          'Pasarse de tiempo con marinada ácida arruina la textura: el ácido "cocina" la superficie como en un ceviche',
        ],
        plazo: 'sacala de la heladera 30 minutos antes de cocinar para que atempere.',
      },
      {
        id: 'fritura',
        label: 'Qué aceite aguanta la fritura',
        hint: 'Punto de humo',
        answer: 'El aceite tiene que tener el punto de humo al menos 10 °C por encima de la fritura.',
        yes: [
          'Punto de humo del aceite elegido',
          'Temperatura de fritura que pide ese alimento',
          'Margen entre los dos: si es menor a 10 °C, el aceite no sirve para eso',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Pasado el punto de humo el aceite se degrada y libera acroleína: además de sabor quemado, es irritante',
          'Aceite que ya humeó no se recupera bajándole el fuego: se descarta',
        ],
        plazo: 'freír por tandas: meter todo junto baja la temperatura del aceite y la milanesa se empapa.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu pieza',
  inputsIntro:
    'Cada rama usa los campos que le corresponden; los demás podés dejarlos como están.',
  fields: [
    {
      id: 'corte',
      label: 'Corte',
      type: 'select',
      value: 'pollo_entero',
      options: [
        { value: 'pollo_entero', label: 'Pollo entero' },
        { value: 'pollo_pechuga', label: 'Pechuga de pollo' },
        { value: 'pavita', label: 'Pavita (pechuga o muslo)' },
        { value: 'peceto', label: 'Peceto' },
        { value: 'bife_ancho', label: 'Bife ancho / asado de tira' },
        { value: 'colita_cuadril', label: 'Colita de cuadril' },
        { value: 'matambre', label: 'Matambre de novillo' },
        { value: 'carne_picada', label: 'Carne picada (vaca o cerdo)' },
        { value: 'cerdo_lomo', label: 'Lomo o bondiola de cerdo' },
        { value: 'cordero_pierna', label: 'Pierna de cordero' },
        { value: 'pescado_filete', label: 'Filete de pescado (salmón, merluza)' },
      ],
    },
    { id: 'peso', label: 'Peso de la pieza (kg)', type: 'number', min: 0.1, max: 20, step: 0.1, value: 1.5 },
    {
      id: 'punto',
      label: 'Punto de cocción',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'jugoso', label: 'Jugoso (rare / medium-rare)' },
        { value: 'medio', label: 'A punto (medium)' },
        { value: 'bien', label: 'Bien cocido (well done)' },
      ],
    },
    {
      id: 'metodoDescongelado',
      label: 'Método de descongelado',
      type: 'select',
      value: 'heladera',
      options: [
        { value: 'heladera', label: 'Heladera (el más seguro)' },
        { value: 'agua-fria', label: 'Agua fría en bolsa hermética' },
        { value: 'microondas', label: 'Microondas, función descongelar' },
      ],
    },
    {
      id: 'grosor',
      label: 'Grosor de la pieza para marinar',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'fino', label: 'Fino (menos de 2 cm)' },
        { value: 'medio', label: 'Medio (2 a 4 cm)' },
        { value: 'grueso', label: 'Grueso (más de 4 cm)' },
      ],
    },
    {
      id: 'marinada',
      label: 'Tipo de marinada',
      type: 'select',
      value: 'aceite',
      options: [
        { value: 'acida', label: 'Ácida (limón, vinagre, vino)' },
        { value: 'aceite', label: 'A base de aceite y hierbas' },
        { value: 'yogur', label: 'Láctea (yogur, suero de leche)' },
        { value: 'seca', label: 'Seca o en pasta (rub)' },
      ],
    },
    {
      id: 'aceite',
      label: 'Aceite de la fritura',
      type: 'select',
      value: 'girasol',
      options: [
        { value: 'girasol', label: 'Girasol' },
        { value: 'girasol_ao', label: 'Girasol alto oleico' },
        { value: 'oliva_ev', label: 'Oliva extra virgen' },
        { value: 'oliva_comun', label: 'Oliva común / refinado' },
        { value: 'maiz', label: 'Maíz' },
        { value: 'soja', label: 'Soja' },
        { value: 'canola', label: 'Canola' },
        { value: 'coco', label: 'Coco' },
        { value: 'manteca', label: 'Manteca' },
        { value: 'ghee', label: 'Ghee (manteca clarificada)' },
      ],
    },
    {
      id: 'fritura',
      label: 'Qué vas a freír',
      type: 'select',
      value: 'milanesa',
      options: [
        { value: 'milanesa', label: 'Milanesas' },
        { value: 'papas', label: 'Papas fritas' },
        { value: 'pescado', label: 'Pescado rebozado' },
        { value: 'bunuelos', label: 'Buñuelos y masas' },
        { value: 'salteado', label: 'Salteado en sartén' },
        { value: 'huevo', label: 'Huevo frito' },
      ],
    },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu cocción',
    caption:
      'La barra cambia con la rama: en horno y termómetro es la temperatura interna en °C, en descongelado y marinado son horas, y en fritura son los °C del aceite. El marcador es tu resultado.',
  },
  breakdownTitle: 'Los números de tu pieza',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿A qué temperatura interna está segura la carne?',
      a: 'Según el USDA-FSIS: aves (pollo, pavo, pavita), enteras o trozadas, 74 °C. Carne picada de vaca, cerdo o cordero, 71 °C. Cortes enteros de vaca, cerdo, ternera y cordero, 63 °C seguidos de 3 minutos de reposo. Pescado, 63 °C. Los puntos de cocción por gusto (jugoso, a punto) se mueven por encima de esos pisos, nunca por debajo salvo en cortes enteros de vaca, donde el jugoso a 55 °C es una decisión de riesgo asumido.',
    },
    {
      q: '¿Cuántos minutos por kilo va la carne al horno?',
      a: 'Depende del corte y del punto. Pollo entero, unos 60 minutos por kilo a 180 °C. Peceto, entre 20 minutos por kilo si lo querés jugoso y 45 si lo querés bien cocido, a 200 °C. Matambre, unos 180 minutos por kilo a 150 °C porque necesita romper el colágeno. Pescado, entre 10 y 15 minutos por kilo a 200 °C. Son referencias de planificación: el termómetro decide.',
    },
    {
      q: '¿Por qué hay que sacar la carne antes de llegar a la temperatura objetivo?',
      a: 'Por la cocción residual: el calor acumulado en la superficie sigue viajando al centro después de retirarla, y la temperatura interna sube entre 3 y 5 °C durante el reposo. En piezas grandes puede subir hasta 7 °C. Si la sacás justo en el número objetivo, terminás un punto más cocida de lo que querías. La excepción es el pollo, donde conviene llegar a los 74 °C dentro del horno.',
    },
    {
      q: '¿Para qué sirve el reposo antes de cortar?',
      a: 'Durante la cocción las fibras se contraen y empujan los jugos hacia el centro. El reposo deja que se redistribuyan: si cortás enseguida, esos jugos terminan en la tabla en vez de en la carne. Entre 5 y 10 minutos para cortes chicos y de 10 a 15 para piezas grandes, tapada con papel de aluminio sin ajustar.',
    },
    {
      q: '¿Se puede descongelar carne a temperatura ambiente?',
      a: 'No. La superficie de la pieza pasa horas en la franja de 5 a 60 °C, que es donde las bacterias se multiplican más rápido, mientras el centro sigue congelado. Los tres métodos seguros son heladera, agua fría en bolsa hermética con recambio cada 30 minutos, y microondas en función descongelar cocinando inmediatamente después.',
    },
    {
      q: '¿Se puede volver a congelar carne descongelada?',
      a: 'Sólo si se descongeló en heladera y nunca superó los 5 °C. Va a perder textura y jugo, pero es seguro. Lo descongelado en agua o en microondas no vuelve al freezer: hay que cocinarlo. Una vez cocido, sí se puede congelar de nuevo aunque haya salido de una descongelación rápida.',
    },
    {
      q: '¿Cuánto tiempo hay que marinar la carne?',
      a: 'Carne vacuna, entre 2 y 24 horas, con el óptimo cerca de las 8. Cerdo, de 2 a 12 horas. Pollo, de 1 a 12 horas. Pescado, de 30 a 60 minutos. Mariscos, de 15 a 25 minutos. Con marinadas ácidas todos esos tiempos se acortan casi a la mitad; con marinadas secas o en pasta se estiran un 30%.',
    },
    {
      q: '¿Marinar ablanda la carne?',
      a: 'Muy poco, y sólo en la superficie: la marinada penetra apenas unos milímetros. Lo que sí hace es aportar sabor y, si tiene sal, retener humedad por acción de la salmuera. La terneza real depende del corte, de cómo lo cortás respecto de la fibra y de la temperatura final de cocción, no del tiempo de marinado.',
    },
    {
      q: '¿Qué es el punto de humo de un aceite?',
      a: 'La temperatura a la que el aceite empieza a descomponerse y a emitir humo azulado. En ese punto se degrada, genera acroleína (irritante para ojos y vías respiratorias) y transfiere sabor quemado. Para freír hace falta un aceite cuyo punto de humo esté al menos 10 °C por encima de la temperatura de fritura: girasol alto oleico (232 °C), canola (238 °C) u oliva refinado (240 °C) van bien; la manteca (150 °C) no sirve para fritura profunda.',
    },
    {
      q: '¿A qué temperatura se fríen las milanesas y las papas?',
      a: 'Milanesas a 175 °C, papas fritas a 180 °C (o el método de dos etapas: 160 °C para cocinar y 190 °C para dorar), pescado rebozado a 170 °C, buñuelos a 170 °C, huevo frito a 140 °C y salteado en sartén a 150 °C. Sin termómetro, el pan que se dora en unos 40 segundos indica cerca de 175 °C.',
    },
    {
      q: '¿Por qué la carne picada necesita más temperatura que un bife?',
      a: 'Porque en un corte entero las bacterias están sólo en la superficie, que es lo primero que alcanza temperatura letal al sellarlo. Al picar la carne, esa superficie contaminada queda repartida por todo el interior del producto, así que la masa entera tiene que llegar a 71 °C. Es el mismo motivo por el que una hamburguesa jugosa es un riesgo que un bife jugoso no tiene.',
    },
    {
      q: '¿El color de la carne indica si está cocida?',
      a: 'No. La mioglobina puede mantener el color rosado por encima de la temperatura segura, sobre todo en carne joven o en piezas curadas, y también puede volverse gris antes de llegar a temperatura. El único indicador confiable es un termómetro de lectura instantánea clavado en el centro de la parte más gruesa, sin tocar hueso.',
    },
  ],

  sources: [
    {
      name: 'Safe Minimum Internal Temperature Chart',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart',
      publisher: 'USDA Food Safety and Inspection Service',
    },
    {
      name: 'The Big Thaw — Safe Defrosting Methods',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/big-thaw-safe-defrosting-methods',
      publisher: 'USDA Food Safety and Inspection Service',
    },
    {
      name: 'Marinating Safely',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/marinating-food-safely',
      publisher: 'USDA Food Safety and Inspection Service',
    },
    {
      name: 'Código Alimentario Argentino — Capítulo VII, aceites y grasas comestibles',
      url: 'https://www.argentina.gob.ar/anmat/codigoalimentario',
      publisher: 'ANMAT',
    },
  ],

  replaces: [
    '/calculadora-tiempo-temperatura-coccion-carne',
    '/calculadora-temperatura-interna-carne-punto-coccion',
    '/calculadora-tiempo-descongelado-alimentos-peso',
    '/calculadora-tiempo-marinado-carne-pescado',
    '/calculadora-temperatura-aceite-fritura-punto-humo',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-tiempos-coccion-verduras-al-vapor-hervido',
    '/calculadora-tiempo-coccion-legumbres-remojo',
    '/calculadora-olla-presion-conversion-tiempos-coccion',
    '/olla-presion-conversion-tiempos-coccion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Cortes: minutos por kilo de horno y temperatura de horno.
 * `tipo` conecta el corte con la tabla de temperatura interna y con la de
 * marinado, para que el hub no tenga dos verdades sobre la misma carne.
 * `tempFija` sólo existe donde el corte manda por encima del tipo: el matambre
 * necesita 85 °C para romper colágeno, y las aves nunca bajan de 74 °C.
 */
export const CORTES: Record<
  string,
  {
    nombre: string;
    tipo: string;
    minPorKg: Record<string, number>;
    tempHorno: number;
    tempFija?: number;
    reposoMin: number;
    nota: string;
  }
> = {
  pollo_entero: {
    nombre: 'Pollo entero', tipo: 'pollo', minPorKg: { jugoso: 60, medio: 60, bien: 60 },
    tempHorno: 180, tempFija: 74, reposoMin: 10,
    nota: 'Espalda hacia arriba los últimos 15 minutos para dorar la piel.',
  },
  pollo_pechuga: {
    nombre: 'Pechuga de pollo', tipo: 'pollo', minPorKg: { jugoso: 25, medio: 25, bien: 25 },
    tempHorno: 200, tempFija: 74, reposoMin: 5,
    nota: 'Sellá en sartén antes de llevar al horno; pasada de 78 °C queda seca.',
  },
  pavita: {
    nombre: 'Pavita', tipo: 'pollo', minPorKg: { jugoso: 40, medio: 40, bien: 40 },
    tempHorno: 180, tempFija: 74, reposoMin: 15,
    nota: 'Manteca bajo la piel y caldo en la bandeja para que no se seque.',
  },
  peceto: {
    nombre: 'Peceto', tipo: 'vaca', minPorKg: { jugoso: 20, medio: 30, bien: 45 },
    tempHorno: 200, reposoMin: 10,
    nota: 'Corte magro: sellalo por todas las caras y cortalo contra la fibra.',
  },
  bife_ancho: {
    nombre: 'Bife ancho / asado de tira', tipo: 'vaca', minPorKg: { jugoso: 25, medio: 35, bien: 50 },
    tempHorno: 180, reposoMin: 10,
    nota: 'A la parrilla, entre 30 y 40 minutos por kilo según el grosor.',
  },
  colita_cuadril: {
    nombre: 'Colita de cuadril', tipo: 'vaca', minPorKg: { jugoso: 30, medio: 40, bien: 55 },
    tempHorno: 200, reposoMin: 10,
    nota: 'Dorala primero por el lado graso y cortala en bastones finos.',
  },
  matambre: {
    nombre: 'Matambre de novillo', tipo: 'vaca', minPorKg: { jugoso: 180, medio: 180, bien: 180 },
    tempHorno: 150, tempFija: 85, reposoMin: 10,
    nota: 'Cocción lenta: necesita 85 °C internos para gelatinizar el colágeno.',
  },
  carne_picada: {
    nombre: 'Carne picada', tipo: 'picada', minPorKg: { jugoso: 40, medio: 45, bien: 55 },
    tempHorno: 180, tempFija: 71, reposoMin: 5,
    nota: 'Pan de carne o albóndigas: 71 °C en el centro, sin excepción.',
  },
  cerdo_lomo: {
    nombre: 'Lomo o bondiola de cerdo', tipo: 'cerdo', minPorKg: { jugoso: 30, medio: 35, bien: 50 },
    tempHorno: 180, reposoMin: 10,
    nota: 'El punto medio moderno del cerdo es 63-68 °C: rosado y seguro.',
  },
  cordero_pierna: {
    nombre: 'Pierna de cordero', tipo: 'cordero', minPorKg: { jugoso: 35, medio: 45, bien: 55 },
    tempHorno: 180, reposoMin: 15,
    nota: 'Romero, ajo y limón; fuego alto al final para dorar.',
  },
  pescado_filete: {
    nombre: 'Filete de pescado', tipo: 'pescado', minPorKg: { jugoso: 10, medio: 12, bien: 15 },
    tempHorno: 200, reposoMin: 3,
    nota: 'Regla práctica en sartén: 1 minuto por centímetro de espesor y por cara.',
  },
};

/**
 * Temperatura interna objetivo por tipo y punto, y mínimo seguro del USDA-FSIS.
 * Fuente única del hub: acá se resolvió la contradicción entre las dos
 * calculadoras viejas.
 */
export const TEMPERATURAS: Record<
  string,
  { nombre: string; jugoso: number; medio: number; bien: number; minSeguro: number; notaSeguridad: string }
> = {
  vaca: {
    nombre: 'Vaca (corte entero)', jugoso: 55, medio: 63, bien: 74, minSeguro: 63,
    notaSeguridad: '63 °C con 3 minutos de reposo es el mínimo seguro del USDA para cortes enteros. Por debajo es riesgo asumido.',
  },
  cerdo: {
    nombre: 'Cerdo (corte entero)', jugoso: 63, medio: 68, bien: 74, minSeguro: 63,
    notaSeguridad: 'Desde 2011 el USDA bajó el mínimo del cerdo entero a 63 °C con reposo: puede quedar rosado.',
  },
  pollo: {
    nombre: 'Pollo y aves', jugoso: 74, medio: 74, bien: 82, minSeguro: 74,
    notaSeguridad: '74 °C es el piso contra salmonella y campylobacter. No hay "pollo jugoso" por debajo.',
  },
  cordero: {
    nombre: 'Cordero (corte entero)', jugoso: 55, medio: 63, bien: 74, minSeguro: 63,
    notaSeguridad: 'Mismo criterio que la vaca: 63 °C con 3 minutos de reposo.',
  },
  picada: {
    nombre: 'Carne picada', jugoso: 71, medio: 71, bien: 74, minSeguro: 71,
    notaSeguridad: 'Al picarla, la contaminación de superficie queda repartida en toda la masa: 71 °C en el centro.',
  },
  pescado: {
    nombre: 'Pescado', jugoso: 52, medio: 58, bien: 63, minSeguro: 63,
    notaSeguridad: '63 °C es el mínimo seguro. Por debajo sólo con pescado de calidad sashimi y congelado previo.',
  },
};

/** Cuánto sube la temperatura durante el reposo, por cocción residual. */
export const CARRYOVER = 4;

/** Descongelado: horas por kilo según método. */
export const DESCONGELADO: Record<string, { horasPorKg: number; nombre: string; instruccion: string }> = {
  heladera: {
    horasPorKg: 10, nombre: 'Heladera',
    instruccion: 'Parte baja de la heladera (4-5 °C), sobre un plato para recoger líquidos.',
  },
  'agua-fria': {
    horasPorKg: 2, nombre: 'Agua fría',
    instruccion: 'Bolsa hermética sumergida, cambiando el agua cada 30 minutos. Cocinar enseguida.',
  },
  microondas: {
    horasPorKg: 0.2, nombre: 'Microondas',
    instruccion: 'Función descongelar o potencia 30%, rotando cada 2-3 minutos. Cocinar enseguida.',
  },
};

/** Marinado: minutos base por proteína, para grosor medio y marinada de aceite. */
export const MARINADO: Record<string, { min: number; opt: number; max: number }> = {
  vaca: { min: 120, opt: 480, max: 1440 },
  picada: { min: 30, opt: 60, max: 240 },
  cerdo: { min: 120, opt: 360, max: 720 },
  pollo: { min: 60, opt: 240, max: 720 },
  cordero: { min: 120, opt: 480, max: 1440 },
  pescado: { min: 30, opt: 60, max: 240 },
};

export const FACTOR_GROSOR: Record<string, number> = { fino: 0.7, medio: 1, grueso: 1.4 };
export const FACTOR_MARINADA: Record<string, number> = { acida: 0.6, aceite: 1, yogur: 1.1, seca: 1.3 };

/** Punto de humo de cada aceite, en °C. */
export const PUNTO_HUMO: Record<string, { temp: number; nombre: string }> = {
  girasol: { temp: 227, nombre: 'Girasol' },
  girasol_ao: { temp: 232, nombre: 'Girasol alto oleico' },
  oliva_ev: { temp: 190, nombre: 'Oliva extra virgen' },
  oliva_comun: { temp: 240, nombre: 'Oliva común / refinado' },
  maiz: { temp: 232, nombre: 'Maíz' },
  soja: { temp: 232, nombre: 'Soja' },
  canola: { temp: 238, nombre: 'Canola' },
  coco: { temp: 177, nombre: 'Coco' },
  manteca: { temp: 150, nombre: 'Manteca' },
  ghee: { temp: 250, nombre: 'Ghee' },
};

/** Temperatura de fritura que pide cada alimento, en °C. */
export const TEMP_FRITURA: Record<string, { temp: number; nombre: string }> = {
  milanesa: { temp: 175, nombre: 'Milanesas' },
  papas: { temp: 180, nombre: 'Papas fritas' },
  pescado: { temp: 170, nombre: 'Pescado rebozado' },
  bunuelos: { temp: 170, nombre: 'Buñuelos y masas' },
  salteado: { temp: 150, nombre: 'Salteado en sartén' },
  huevo: { temp: 140, nombre: 'Huevo frito' },
};

/** Margen mínimo entre punto de humo y temperatura de fritura, en °C. */
export const MARGEN_MINIMO = 10;
