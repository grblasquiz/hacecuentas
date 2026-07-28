import type { HubData } from './types';

/**
 * Hub de decisión — "Convertir kilos, libras y onzas"
 * Arquetipo: CONVERSOR (mismo patrón que `conversor-longitud` y
 * `convertir-temperatura`). NO usa `cases`: la respuesta fija va en `answer` y
 * la ramificación real la hacen los dos `select` de unidad.
 *
 * Absorbe 5 calculadoras sueltas de peso (ver `replaces`).
 *
 * FACTORES: todos exactos por definición internacional (acuerdo de la yarda y
 * la libra, 1959; NIST SP 811). La libra son 0,45359237 kg EXACTOS y de ahí
 * salen la onza (1/16 lb), el stone (14 lb), la tonelada corta (2000 lb) y la
 * tonelada larga (2240 lb). Las calcs viejas usaban recíprocos redondeados
 * (2,20462 · 0,035274 · 0,907185) — acá se usa el factor exacto, igual que el
 * precedente psi→bar y BTU→J de otros hubs.
 */
export const hub: HubData = {
  slug: 'conversores/peso',
  title: 'Convertir kilos, libras y onzas — conversor de peso exacto',
  description:
    'Convertí kilogramos, gramos, libras, onzas, stone, quintales y toneladas (métrica, corta y larga) con los factores exactos: 1 libra = 0,45359237 kg. Incluye la diferencia entre onza avoirdupois y onza troy, la de los metales preciosos.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Conversor de unidades',
  h1: 'Convertir kilos, libras y onzas',
  lede:
    'Elegí la unidad que tenés y la que querés, escribí el número y listo. Sirve para kilos, gramos, libras, onzas, stone (el peso corporal británico), quintales y las tres toneladas que circulan: la métrica, la corta de Estados Unidos y la larga británica. Los factores son los exactos por definición, no versiones redondeadas.',
  stamps: ['Factores exactos (NIST / acuerdo de 1959)', '1 lb = 0,45359237 kg exactos', '5 conversores adentro'],

  resultLabel: 'Resultado de la conversión',

  inputsTitle: 'Qué querés convertir',
  inputsIntro:
    'Todas las unidades de la lista son de masa, así que cualquier combinación de origen y destino da un resultado válido. La única trampa está en las dos onzas: la avoirdupois es la de la cocina y la balanza, la troy es la del oro y la plata, y pesan distinto.',
  fields: [
    // OJO: `text` a propósito. El parser del runtime (`num()`) borra los puntos
    // para leer miles al estilo es-AR, así que un `number` con "1.5" se leería
    // 15. Como `text` llega el string crudo y lo parseamos acá, aceptando tanto
    // coma como punto decimal.
    { id: 'valor', label: 'Cantidad a convertir', value: '1' },
    {
      id: 'desde',
      label: 'Unidad de origen',
      type: 'select',
      value: 'kg',
      options: [
        { value: 'kg', label: 'Kilogramo (kg)' },
        { value: 'g', label: 'Gramo (g)' },
        { value: 'mg', label: 'Miligramo (mg)' },
        { value: 't', label: 'Tonelada métrica (t)' },
        { value: 'q', label: 'Quintal métrico (100 kg)' },
        { value: 'lb', label: 'Libra / pound (lb)' },
        { value: 'oz', label: 'Onza avoirdupois (oz) — cocina y balanza' },
        { value: 'ozt', label: 'Onza troy (oz t) — oro y plata' },
        { value: 'st', label: 'Stone (st) — peso corporal UK' },
        { value: 'ton_corta', label: 'Tonelada corta (short ton, 2000 lb)' },
        { value: 'ton_larga', label: 'Tonelada larga (long ton, 2240 lb)' },
        { value: 'gr', label: 'Grano (grain, gr)' },
      ],
    },
    {
      id: 'hasta',
      label: 'Unidad de destino',
      type: 'select',
      value: 'lb',
      options: [
        { value: 'kg', label: 'Kilogramo (kg)' },
        { value: 'g', label: 'Gramo (g)' },
        { value: 'mg', label: 'Miligramo (mg)' },
        { value: 't', label: 'Tonelada métrica (t)' },
        { value: 'q', label: 'Quintal métrico (100 kg)' },
        { value: 'lb', label: 'Libra / pound (lb)' },
        { value: 'oz', label: 'Onza avoirdupois (oz) — cocina y balanza' },
        { value: 'ozt', label: 'Onza troy (oz t) — oro y plata' },
        { value: 'st', label: 'Stone (st) — peso corporal UK' },
        { value: 'ton_corta', label: 'Tonelada corta (short ton, 2000 lb)' },
        { value: 'ton_larga', label: 'Tonelada larga (long ton, 2240 lb)' },
        { value: 'gr', label: 'Grano (grain, gr)' },
      ],
    },
  ],
  fineprint:
    'La libra internacional mide 0,45359237 kg exactos desde el acuerdo de la yarda y la libra de 1959; la onza, el stone y las toneladas corta y larga se derivan de ella, así que también son exactas. La onza troy (31,1034768 g) es otra unidad y no se mezcla con la de cocina.',

  chart: {
    type: 'scale',
    title: 'Cuánto pesa eso, en la vida real',
    caption:
      'La regla va de 1 gramo a 1 tonelada en escala logarítmica, con referencias reconocibles: un clip de 1 g, una taza de harina de 120 g, un kilo de yerba, una valija despachada de 23 kg, una persona de 70 kg y un auto chico de 1 tonelada. Tu peso convertido queda marcado sobre esa regla, así ves la magnitud y no sólo el número.',
    bands: [
      { label: '1 g a 10 g — un clip, una cucharadita', from: 1, to: 10, tone: 'neutral' },
      { label: '10 g a 100 g — una pila, un huevo', from: 10, to: 100, tone: 'neutral' },
      { label: '100 g a 1 kg — una taza de harina, un paquete de yerba', from: 100, to: 1000, tone: 'good' },
      { label: '1 kg a 10 kg — una garrafa chica, un perro toy', from: 1000, to: 10000, tone: 'good' },
      { label: '10 kg a 100 kg — una valija de 23 kg, una persona', from: 10000, to: 100000, tone: 'warn' },
      { label: '100 kg a 1 t — una moto, un auto chico', from: 100000, to: 1000000, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu peso en todas las unidades',
  breakdownIntro:
    'La conversión que pediste queda destacada. Las barras comparan el número de cada unidad entre sí, así que las unidades chicas (mg, granos) siempre dan barras largas: mirá el valor, no la barra.',

  answer: {
    title: 'Los factores que importan, sin vueltas',
    copy:
      'Todas estas equivalencias son factores fijos definidos por acuerdo internacional: no cambian con el tiempo ni con el país. La libra internacional mide 0,45359237 kg exactos desde 1959, y de ahí se derivan la onza, el stone y las toneladas corta y larga.',
    yes: [
      '1 libra = 0,45359237 kg exactos — al revés, 1 kg = 2,204622622 lb',
      '1 onza avoirdupois = 1/16 de libra = 28,349523125 g exactos — 1 kg = 35,27396 oz',
      '1 onza troy = 31,1034768 g exactos: es la del oro, la plata y el platino, no la de la cocina',
      '1 stone = 14 libras = 6,35029318 kg — el peso corporal en el Reino Unido',
      '1 tonelada corta (EE. UU.) = 2000 lb = 907,18474 kg · 1 tonelada larga (UK) = 2240 lb = 1016,0469088 kg',
      '1 tonelada métrica = 1000 kg · 1 quintal métrico = 100 kg (la unidad del agro argentino)',
      '1 grano = 64,79891 mg exactos: se usa en balística y en farmacia',
    ],
    warn: [
      'La onza troy pesa un 10% más que la de cocina: usar la equivocada en una compra de oro es un error caro',
      'Hay tres toneladas distintas y todas se escriben "ton" en inglés: la corta pesa un 9% menos que la métrica y la larga, un 1,6% más',
      'Los recíprocos redondeados arrastran error: convertir con 2,2046 y volver con 0,4536 no devuelve el número original',
      'Masa y peso no son lo mismo: el kilogramo mide masa, el kilogramo-fuerza y la libra-fuerza miden fuerza. En la balanza de casa da igual, en física no',
      'El quintal no es único: el métrico son 100 kg, pero el quintal castellano histórico son 46 kg',
    ],
    plazo: 'los factores son permanentes por definición internacional; no hay actualización anual que esperar.',
  },

  faq: [
    {
      q: '¿Cuánto es 1 kilo en libras?',
      a: '1 kilogramo = 2,204622622 libras. El camino de ida es el exacto: 1 libra = 0,45359237 kg por definición, y el 2,2046 sale de dividir 1 por ese número. Para la cuenta mental, multiplicar por 2,2 te deja a menos de un 0,3% del valor real: 70 kg son 154 lb.',
    },
    {
      q: '¿Cuántos gramos tiene una onza?',
      a: 'Una onza avoirdupois —la de la cocina, la balanza y los productos de consumo— pesa 28,349523125 gramos exactos, porque es la dieciseisava parte de la libra. Redondeado, 28,35 g. Al revés: 1 gramo = 0,03527396 onzas y 100 g son 3,53 oz.',
    },
    {
      q: '¿Qué diferencia hay entre la onza troy y la onza común?',
      a: 'Son unidades distintas. La onza avoirdupois pesa 28,349523125 g y se usa para alimentos, cosmética y casi todo lo demás. La onza troy pesa 31,1034768 g —un 9,7% más— y es la que cotiza el oro, la plata, el platino y el paladio. Cuando leés "el oro cerró a 2.400 dólares la onza", esa onza es troy. Confundirlas en una compra de metal significa pagar por un 10% de material que no existe.',
    },
    {
      q: '¿Cuánto es un stone en kilos?',
      a: '1 stone = 14 libras = 6,35029318 kg. Se usa casi exclusivamente en el Reino Unido e Irlanda para el peso corporal: alguien de "11 stone 4" pesa 11 × 6,3503 + 4 × 0,4536 = 71,7 kg. En este conversor, cuando el resultado cae en el rango del peso de una persona, la línea de abajo te muestra directamente el formato stone + libras.',
    },
    {
      q: '¿Cuánto pesa una tonelada corta y en qué se diferencia de la métrica?',
      a: 'La tonelada corta estadounidense son 2000 libras = 907,18474 kg, es decir un 9,3% menos que la tonelada métrica de 1000 kg. La tonelada larga británica son 2240 libras = 1016,0469088 kg, un 1,6% más que la métrica. En contratos de granos o mineral la diferencia mueve mucha plata: siempre conviene aclarar qué tonelada se está cotizando.',
    },
    {
      q: '¿Cuántas libras son 100 kilos?',
      a: '100 kg = 220,4622622 libras. Y al revés, 100 libras son 45,359237 kg exactos. Es el par de referencia más cómodo para chequear cualquier conversión de peso: si tu cuenta no da alrededor de 220 lb para 100 kg, algo está mal.',
    },
    {
      q: '¿Cuánto es un quintal y se sigue usando?',
      a: 'El quintal métrico son 100 kg y sigue siendo la unidad de referencia del agro argentino: los rindes de soja, maíz y trigo se expresan en quintales por hectárea. No confundirlo con el quintal castellano histórico, que eran 4 arrobas ≈ 46 kg, ni con el hundredweight anglosajón (45,36 kg el corto, 50,80 kg el largo).',
    },
    {
      q: '¿Por qué los conversores dan resultados apenas distintos?',
      a: 'Porque muchos usan recíprocos redondeados en vez del factor exacto. La definición internacional fija la libra en 0,45359237 kg; el 2,20462 que suele verse es ese número invertido y recortado, y arrastra un error de unas 10 partes por millón. En una receta no se nota, en 10 toneladas de carga son unos 100 gramos, y al convertir de ida y vuelta el número original no vuelve. Este conversor siempre divide por el factor exacto en lugar de multiplicar por el recíproco redondeado.',
    },
    {
      q: '¿Masa y peso son lo mismo?',
      a: 'En la vida cotidiana sí, en física no. El kilogramo, la libra y la onza miden masa: cuánta materia hay. El peso es la fuerza con la que la gravedad tira de esa masa, y se mide en newtons o en kilogramos-fuerza. Un objeto de 70 kg tiene 70 kg de masa en la Tierra y en la Luna, pero pesa seis veces menos en la Luna. Las balanzas domésticas miden fuerza y te muestran masa asumiendo la gravedad terrestre.',
    },
    {
      q: '¿Cuánto es una libra de carne o de harina en gramos?',
      a: 'Una libra son 453,59237 gramos, o sea prácticamente medio kilo: por eso las recetas estadounidenses que piden "1 pound" se resuelven bien con 450 g. Media libra son 226,8 g y un cuarto de libra, 113,4 g — de ahí el nombre de la hamburguesa. Ojo con las recetas en onzas: 8 oz son 226,8 g, no 250 g.',
    },
    {
      q: '¿Cuánto es un grano (grain) y para qué se usa?',
      a: 'El grano son 64,79891 miligramos exactos y es la unidad más chica del sistema anglosajón: 7000 granos hacen una libra. Se usa para el peso de proyectiles y pólvora en balística, para las cuerdas de instrumentos y en algunas formulaciones farmacéuticas antiguas. Una bala de 115 granos pesa 7,45 gramos.',
    },
    {
      q: '¿Cuántos kilos puedo despachar y cuántas libras son?',
      a: 'La franquicia habitual de equipaje despachado en vuelos internacionales es de 23 kg por valija, que son 50,71 libras — por eso las aerolíneas de Estados Unidos la anuncian como "50 lb". El equipaje de mano suele ser de 8 a 10 kg, entre 17,6 y 22 libras. Si la balanza del aeropuerto está en libras, el límite de 23 kg se te pasa apenas cruzás las 50,7.',
    },
  ],

  sources: [
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units (factores de conversión exactos)',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology (NIST)',
    },
    {
      name: 'NIST Handbook 44, Apéndice C — tablas de unidades y equivalencias (libra, onza, stone, tonelada corta y larga, grano)',
      url: 'https://www.nist.gov/pml/owm/publications/nist-handbooks/nist-handbook-44',
      publisher: 'NIST Office of Weights and Measures',
    },
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — definición del kilogramo',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
      date: '9.ª edición vigente',
    },
    {
      name: 'Good Delivery Rules — la onza troy como unidad de referencia del oro y la plata',
      url: 'https://www.lbma.org.uk/good-delivery',
      publisher: 'London Bullion Market Association (LBMA)',
    },
  ],

  replaces: [
    '/conversor-kilogramos-libras-onzas',
    '/calculadora-conversor-gramos-a-onzas',
    '/calculadora-conversion-kilo-libra-lb-kg-exacto',
    '/calculadora-conversion-libras-kilos-onzas-stone',
    '/calculadora-conversor-toneladas-cortas-a-toneladas-metricas',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-conversion-quintal-tonelada-kg-agro',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factores a la unidad base: el GRAMO.
 * Todos exactos por definición (acuerdo de la yarda y la libra de 1959, NIST
 * SP 811). Se guarda el factor de ida (unidad → gramo) y nunca su recíproco
 * redondeado: para ir al revés se divide.
 */
export const UNITS: Record<string, { f: number; sym: string; name: string }> = {
  mg: { f: 0.001, sym: 'mg', name: 'Miligramos' },
  g: { f: 1, sym: 'g', name: 'Gramos' },
  kg: { f: 1000, sym: 'kg', name: 'Kilogramos' },
  q: { f: 100_000, sym: 'q', name: 'Quintales métricos' },
  t: { f: 1_000_000, sym: 't', name: 'Toneladas métricas' },
  lb: { f: 453.59237, sym: 'lb', name: 'Libras' },
  oz: { f: 28.349523125, sym: 'oz', name: 'Onzas (avoirdupois)' },
  ozt: { f: 31.1034768, sym: 'oz t', name: 'Onzas troy' },
  st: { f: 6350.29318, sym: 'st', name: 'Stone' },
  ton_corta: { f: 907_184.74, sym: 'sh tn', name: 'Toneladas cortas (EE. UU.)' },
  ton_larga: { f: 1_016_046.9088, sym: 'lg tn', name: 'Toneladas largas (UK)' },
  gr: { f: 0.06479891, sym: 'gr', name: 'Granos' },
};

/** Regla comparativa: logarítmica, de 1 g a 1 tonelada, en gramos. */
export const SCALE = {
  min: 1,
  max: 1_000_000,
  refs: [
    { g: 1, label: 'un clip' },
    { g: 28.349523125, label: 'una onza' },
    { g: 120, label: 'una taza de harina' },
    { g: 1000, label: 'un kilo de yerba' },
    { g: 23_000, label: 'una valija despachada de 23 kg' },
    { g: 70_000, label: 'una persona de 70 kg' },
    { g: 1_000_000, label: 'un auto chico de 1 tonelada' },
  ],
};
