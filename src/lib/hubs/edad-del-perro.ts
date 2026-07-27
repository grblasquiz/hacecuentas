import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántos años humanos tiene mi perro?"
 * Arquetipo CÁLCULO DOMINANTE (calculadora-edad-perro-anos-humanos se lleva
 * casi todo el tráfico), así que NO usa `cases`: la respuesta va en `answer`.
 *
 * Absorbe 7 calculadoras sueltas de edad canina (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format: 'unit'` y cada fila del
 *    desglose declara el suyo. Una fila sin `format` cae a "$" y la página
 *    miente.
 *  - `chart.type: 'timeline'` se renderiza como barra de franjas con marcador:
 *    las etapas viajan con `from`/`to` en años de perro y la posición del
 *    animal en `position` + `positionLabel`.
 */
export const hub: HubData = {
  slug: 'mascotas/edad-del-perro',
  title: '¿Cuántos años humanos tiene mi perro? Tabla por tamaño y raza — 2026',
  description:
    'Convertí la edad de tu perro a años humanos con la tabla real por tamaño (AAHA/AKC) y la curva epigenética de la UCSD 2019. Etapa de vida, expectativa por raza y cuánto le queda por delante. No es multiplicar por 7.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuántos años humanos tiene mi perro?',
  lede:
    'No es multiplicar por siete. El primer año de un perro equivale a unos 15 años humanos, el segundo suma 9 más y recién después el ritmo se estabiliza, y encima cambia según el tamaño: un gran danés envejece bastante más rápido que un chihuahua. Poné la edad y el tamaño y salen la equivalencia, la etapa de vida y la expectativa de su raza.',
  stamps: ['Actualizado 27-07-2026', 'Tabla AAHA/AKC + curva epigenética UCSD 2019', '7 calculadoras adentro'],

  resultLabel: 'Tu perro en años humanos',

  inputsTitle: 'Contanos de tu perro',
  inputsIntro: 'Con la edad y el tamaño alcanza. La raza afina la expectativa de vida.',
  fields: [
    {
      id: 'edad',
      label: 'Edad del perro',
      type: 'number',
      suffix: 'años',
      min: 0,
      max: 25,
      step: 0.1,
      value: 7,
      help: 'Si todavía no cumplió el año, poné los meses divididos 12: seis meses son 0,5.',
    },
    {
      id: 'tamano',
      label: 'Tamaño adulto',
      type: 'select',
      value: 'mediano',
      options: [
        { value: 'toy', label: 'Toy (menos de 5 kg)' },
        { value: 'pequeno', label: 'Pequeño (5 a 10 kg)' },
        { value: 'mediano', label: 'Mediano (10 a 25 kg)' },
        { value: 'grande', label: 'Grande (25 a 45 kg)' },
        { value: 'gigante', label: 'Gigante (más de 45 kg)' },
      ],
      help: 'Es el dato que más pesa: cuanto más grande el perro, más rápido envejece.',
    },
    {
      id: 'raza',
      label: 'Raza',
      type: 'select',
      value: 'mestizo',
      options: [
        { value: 'mestizo', label: 'Mestizo o no la sé' },
        { value: 'labrador-retriever', label: 'Labrador Retriever' },
        { value: 'golden-retriever', label: 'Golden Retriever' },
        { value: 'bulldog-frances', label: 'Bulldog Francés' },
        { value: 'bulldog-ingles', label: 'Bulldog Inglés' },
        { value: 'pastor-aleman', label: 'Pastor Alemán' },
        { value: 'beagle', label: 'Beagle' },
        { value: 'caniche-poodle', label: 'Caniche / Poodle' },
        { value: 'chihuahua', label: 'Chihuahua' },
        { value: 'rottweiler', label: 'Rottweiler' },
        { value: 'yorkshire-terrier', label: 'Yorkshire Terrier' },
        { value: 'boxer', label: 'Boxer' },
        { value: 'dachshund-salchicha', label: 'Dachshund (salchicha)' },
        { value: 'husky-siberiano', label: 'Husky Siberiano' },
        { value: 'shih-tzu', label: 'Shih Tzu' },
        { value: 'pitbull', label: 'Pitbull' },
      ],
      help: 'Si elegís una raza, el tamaño y la expectativa se toman de ella.',
    },
    {
      id: 'castrado',
      label: '¿Está castrado o esterilizado?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
      help: 'La castración suma alrededor de un año y medio de expectativa.',
    },
    {
      id: 'cuidados',
      label: 'Nivel de cuidados',
      type: 'select',
      value: 'medios',
      options: [
        { value: 'altos', label: 'Altos (control veterinario, peso ideal, dieta de calidad)' },
        { value: 'medios', label: 'Medios (lo habitual)' },
        { value: 'bajos', label: 'Bajos (sin controles, sobrepeso, dieta pobre)' },
      ],
    },
  ],
  fineprint:
    'Es una orientación estadística, no un diagnóstico. Cada perro envejece a su ritmo según genética, peso y salud: ante cualquier cambio de conducta, apetito o movilidad, la consulta veterinaria manda.',

  chart: {
    type: 'timeline',
    title: 'La vida de tu perro, etapa por etapa',
    caption:
      'La barra recorre la vida del perro dividida en cinco etapas —cachorro, adulto joven, adulto, senior y geronte— con los cortes ajustados a su tamaño. El marcador muestra dónde está hoy y hasta dónde llega la expectativa media de su raza.',
    bands: [
      { label: 'Cachorro', from: 0, to: 1, tone: 'good' },
      { label: 'Adulto joven', from: 1, to: 3, tone: 'good' },
      { label: 'Adulto', from: 3, to: 9, tone: 'neutral' },
      { label: 'Senior', from: 9, to: 13, tone: 'warn' },
      { label: 'Geronte', from: 13, to: 16, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Los números de tu perro',
  breakdownIntro:
    'Todo está en años: unos son años de perro y otros años humanos equivalentes. Las barras comparan cada cifra con la mayor.',

  answer: {
    title: 'La equivalencia real no es multiplicar por 7',
    copy:
      'El envejecimiento canino es acelerado al principio y después se aplana. Al año un perro ya es un adolescente tardío, a los dos es un adulto joven, y a partir de ahí cada año de perro suma entre 4 y 7 años humanos según cuánto pesa.',
    yes: [
      'Año 1: equivale a unos 15 años humanos (AAHA/AKC)',
      'Año 2: suma 9 más, o sea unos 24 años humanos en total',
      'Del tercer año en adelante: +4 por año en razas toy y pequeñas, +5 en medianas, +6 en grandes y +7 en gigantes',
      'La curva epigenética de la UCSD 2019 (16 × ln(edad) + 31) da la lectura biológica, medida sobre metilación del ADN',
      'La expectativa media va de unos 15 años en razas toy a unos 8 en razas gigantes',
      'La castración y los buenos cuidados suman alrededor de tres años entre las dos',
    ],
    warn: [
      'La regla del 7 sobreestima la juventud del cachorro y subestima la vejez del perro grande: no la uses',
      'Las razas braquicéfalas (bulldog, pug) viven menos por problemas respiratorios y de columna, aunque sean chicas',
      'El sobrepeso es el factor evitable que más recorta la expectativa: puede costar hasta dos años de vida',
      'A partir de la etapa senior los controles pasan de anuales a semestrales, con análisis de sangre y presión',
    ],
    plazo:
      'la etapa senior empieza a los 6 años en razas gigantes, a los 8 en grandes, a los 9 en medianas y a los 11 en pequeñas y toy.',
  },

  faq: [
    {
      q: '¿Cuántos años humanos tiene mi perro?',
      a: 'El primer año equivale a unos 15 años humanos y el segundo suma 9 más, así que un perro de 2 años ya es un humano de 24. A partir de ahí cada año de perro suma 4 años humanos si es toy o pequeño, 5 si es mediano, 6 si es grande y 7 si es gigante. Un perro mediano de 7 años equivale entonces a unos 49 años humanos.',
    },
    {
      q: '¿Es verdad que un año de perro son siete humanos?',
      a: 'No. La regla del 7 es una simplificación comercial de los años cincuenta que no resiste ningún dato: un perro de un año ya puede reproducirse, algo que ningún chico de siete años puede hacer. Y del otro lado, un gran danés de 8 años está biológicamente más cerca de los 70 humanos que de los 56 que daría la regla.',
    },
    {
      q: '¿Por qué la equivalencia depende del tamaño del perro?',
      a: 'Porque las razas grandes crecen mucho más rápido en poco tiempo y ese crecimiento acelerado desgasta antes el organismo: más divisiones celulares, más riesgo tumoral y más carga sobre articulaciones y corazón. Por eso un chihuahua puede llegar a los 15 años y un gran danés rara vez pasa los 9.',
    },
    {
      q: '¿Qué dice la fórmula científica de la UCSD 2019?',
      a: 'Un equipo de la Universidad de California en San Diego comparó la metilación del ADN de perros y humanos y llegó a la fórmula edad humana = 16 × ln(edad del perro) + 31. Da una curva empinada al principio y muy plana después: un perro de 1 año equivale a 31 humanos, uno de 4 a 53 y uno de 12 a 71. Es la lectura biológica del envejecimiento y la mostramos como referencia junto a la tabla AAHA por tamaño.',
    },
    {
      q: '¿Cuáles son las etapas de vida de un perro?',
      a: 'Cachorro hasta el año, adulto joven de 1 a 3, adulto de 3 hasta el umbral senior, senior desde ese umbral hasta la expectativa de la raza y geronte de ahí en más. El umbral senior no es igual para todos: llega a los 6 años en razas gigantes, a los 8 en grandes, a los 9 en medianas y a los 11 en pequeñas y toy.',
    },
    {
      q: '¿Cuánto vive un perro según su raza?',
      a: 'Como referencia: chihuahua 15 años, caniche y yorkshire 14, beagle, dachshund, husky y shih tzu 13, labrador, golden y pitbull 12, pastor alemán, bulldog francés y boxer 11, rottweiler 10 y bulldog inglés 9. Son medianas: la mitad de los perros de esa raza las supera.',
    },
    {
      q: '¿Cómo calculo la edad de un cachorro de pocos meses?',
      a: 'Dentro del primer año la equivalencia es prácticamente lineal: 15 años humanos repartidos en 12 meses, o sea algo más de un año humano por mes. A los 6 meses un cachorro anda por los 8 o 10 años humanos y ya cambió los dientes; a los 8 meses está en plena adolescencia y empieza a testear límites. Las razas grandes maduran más lento que las chicas, así que van algo más atrás.',
    },
    {
      q: '¿La castración hace que mi perro viva más?',
      a: 'En promedio sí, alrededor de un año y medio más. Elimina el riesgo de tumores de ovario, útero y testículo, reduce las infecciones uterinas y baja mucho las conductas de escape y las peleas, que son causa frecuente de accidentes. A cambio hay que vigilar el peso, porque el gasto energético baja después de la cirugía.',
    },
    {
      q: '¿Qué le cambio a mi perro cuando entra en la etapa senior?',
      a: 'Controles veterinarios cada 6 meses en vez de una vez al año, con análisis de sangre, orina y presión; alimento senior con menos calorías y más proteína de calidad; suplementos articulares si hay artrosis; ejercicio más suave pero constante; y control dental, que es el problema más subdiagnosticado. También conviene revisar la casa: alfombras antideslizantes y rampas evitan lesiones.',
    },
    {
      q: '¿Cómo sé si mi perro está envejeciendo antes de tiempo?',
      a: 'Las señales típicas son canas tempranas en el hocico, menos aguante en el paseo, dificultad para subir al sillón o al auto, dormir muchas más horas, desorientación o cambios de conducta a la noche, mal aliento marcado y aumento o pérdida de peso sin cambio de dieta. Cualquiera de esas señales antes del umbral senior de su tamaño amerita una consulta.',
    },
    {
      q: '¿Los mestizos viven más que los perros de raza?',
      a: 'En general sí, un poco: al tener mayor diversidad genética son menos propensos a las enfermedades hereditarias concentradas en cada raza. La diferencia igual es menor que la que provoca el tamaño: un mestizo grande vive menos que un perro de raza chico. Si no sabés la raza, elegí el tamaño y listo.',
    },
  ],

  sources: [
    {
      name: 'AAHA Canine Life Stage Guidelines 2019 — etapas de vida del perro',
      url: 'https://www.aaha.org/resources/life-stage-canine-2019/',
      publisher: 'American Animal Hospital Association',
      date: '2019',
    },
    {
      name: 'AKC — How to calculate dog years to human years',
      url: 'https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/',
      publisher: 'American Kennel Club',
    },
    {
      name: 'Wang T. et al. — Quantitative translation of dog-to-human aging by conserved remodeling of the DNA methylome (Cell Systems, 2020)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/32619550/',
      publisher: 'PubMed · UC San Diego',
      date: '2020',
    },
    {
      name: 'AVMA — Senior pet care y frecuencia de controles',
      url: 'https://www.avma.org/resources-tools/pet-owners/petcare/senior-pet-care-faq',
      publisher: 'American Veterinary Medical Association',
    },
    {
      name: 'Montoya M. et al. — Life expectancy tables for dogs and cats derived from clinical data (Frontiers in Veterinary Science, 2023)',
      url: 'https://www.frontiersin.org/articles/10.3389/fvets.2023.1082102/full',
      publisher: 'Frontiers in Veterinary Science',
      date: '2023',
    },
    {
      name: 'Kealy R. et al. — Effects of diet restriction on life span and age-related changes in dogs (JAVMA, 2002)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/11991408/',
      publisher: 'PubMed',
      date: '2002',
    },
  ],

  replaces: [
    '/calculadora-edad-perro-anos-humanos',
    '/calculadora-edad-humana-por-raza-perro',
    '/calculadora-envejecer-mascota-humano-tabla-raza-tamano',
    '/calculadora-edad-perro-humano',
    '/calculadora-edad-cachorro-humano',
    '/calculadora-expectativa-vida-raza-perro',
    '/calculadora-edad-perro-humano-raza-tamano',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Tabla AAHA/AKC ajustada por tamaño (la misma que usan las fórmulas del repo,
 * `edad-perro-humano-raza-tamano.ts` y `edad-perro.ts`):
 *   rate     años humanos que suma cada año de perro a partir del tercero
 *   senior   edad en años de perro en que empieza la etapa senior
 *   vida     expectativa media de vida por tamaño, cuando no se elige raza
 *   factor   ajuste de la curva epigenética por tamaño (edad-humana-por-raza-perro.ts)
 */
export const TAMANOS: Record<
  string,
  { label: string; rate: number; senior: number; vida: number; factor: number }
> = {
  toy: { label: 'toy', rate: 4, senior: 11, vida: 15, factor: 0.9 },
  pequeno: { label: 'pequeño', rate: 4, senior: 11, vida: 14, factor: 0.95 },
  mediano: { label: 'mediano', rate: 5, senior: 9, vida: 12, factor: 1.0 },
  grande: { label: 'grande', rate: 6, senior: 8, vida: 10, factor: 1.1 },
  gigante: { label: 'gigante', rate: 7, senior: 6, vida: 8, factor: 1.15 },
};

/**
 * Razas: tamaño y expectativa media, calcados de los módulos reales
 * `edad-humana-por-raza-perro.ts` (tamaño) y `expectativa-vida-raza-perro.ts`
 * (esperanza de vida).
 */
export const RAZAS: Record<string, { nombre: string; tamano: string; vida: number }> = {
  'labrador-retriever': { nombre: 'Labrador Retriever', tamano: 'grande', vida: 12 },
  'golden-retriever': { nombre: 'Golden Retriever', tamano: 'grande', vida: 12 },
  'bulldog-frances': { nombre: 'Bulldog Francés', tamano: 'pequeno', vida: 11 },
  'bulldog-ingles': { nombre: 'Bulldog Inglés', tamano: 'mediano', vida: 9 },
  'pastor-aleman': { nombre: 'Pastor Alemán', tamano: 'grande', vida: 11 },
  beagle: { nombre: 'Beagle', tamano: 'mediano', vida: 13 },
  'caniche-poodle': { nombre: 'Caniche / Poodle', tamano: 'mediano', vida: 14 },
  chihuahua: { nombre: 'Chihuahua', tamano: 'toy', vida: 15 },
  rottweiler: { nombre: 'Rottweiler', tamano: 'grande', vida: 10 },
  'yorkshire-terrier': { nombre: 'Yorkshire Terrier', tamano: 'toy', vida: 14 },
  boxer: { nombre: 'Boxer', tamano: 'grande', vida: 11 },
  'dachshund-salchicha': { nombre: 'Dachshund (salchicha)', tamano: 'pequeno', vida: 13 },
  'husky-siberiano': { nombre: 'Husky Siberiano', tamano: 'grande', vida: 13 },
  'shih-tzu': { nombre: 'Shih Tzu', tamano: 'pequeno', vida: 13 },
  pitbull: { nombre: 'Pitbull', tamano: 'mediano', vida: 12 },
};

/** Ajustes de expectativa (expectativa-vida-raza-perro.ts). */
export const AJUSTES = {
  castrado: 1.5,
  cuidadosAltos: 1.5,
  cuidadosBajos: -2,
  minimo: 5,
};

/** Nombres de las etapas, en orden. */
export const ETAPAS = ['cachorro', 'adulto joven', 'adulto', 'senior', 'geronte'];
