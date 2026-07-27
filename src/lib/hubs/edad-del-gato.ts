import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántos años humanos tiene mi gato?"
 * Arquetipo CÁLCULO DOMINANTE (la conversión a años humanos se lleva casi todo
 * el tráfico), así que NO usa `cases`: la respuesta fija va en `answer`.
 *
 * Absorbe 3 calculadoras sueltas de edad felina (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format: 'unit'` y cada fila del
 *    desglose declara el suyo. Una fila sin `format` cae a "$" y la página
 *    miente.
 *  - `chart.type: 'timeline'` se renderiza como barra de franjas con marcador:
 *    las etapas viajan con `from`/`to` en años de gato y la posición del animal
 *    en `position` + `positionLabel`.
 */
export const hub: HubData = {
  slug: 'mascotas/edad-del-gato',
  title: '¿Cuántos años humanos tiene mi gato? Tabla AAFP por edad y raza — 2026',
  description:
    'Convertí la edad de tu gato a años humanos con la tabla real de la AAFP/AAHA: el primer año son 15, el segundo suma 9 y después van 4 por año. Etapa de vida, esperanza por raza y cuánto le suma vivir puertas adentro.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuántos años humanos tiene mi gato?',
  lede:
    'No es multiplicar por siete. Según la tabla de la AAFP, el primer año de un gato equivale a unos 15 años humanos, el segundo suma 9 más y recién a partir del tercero el ritmo se estabiliza en 4 por año. Poné la edad, la raza y si sale a la calle: salen la equivalencia, la etapa de vida y la esperanza real.',
  stamps: ['Actualizado 27-07-2026', 'AAHA/AAFP Feline Life Stage Guidelines 2021', '3 calculadoras adentro'],

  resultLabel: 'Tu gato en años humanos',

  inputsTitle: 'Contanos de tu gato',
  inputsIntro: 'Con la edad alcanza para la equivalencia. La raza y el estilo de vida definen la esperanza.',
  fields: [
    {
      id: 'edad',
      label: 'Edad del gato',
      type: 'number',
      suffix: 'años',
      min: 0,
      max: 30,
      step: 0.1,
      value: 7,
      help: 'Si todavía no cumplió el año, poné los meses divididos 12: seis meses son 0,5.',
    },
    {
      id: 'estiloVida',
      label: '¿Sale a la calle?',
      type: 'select',
      value: 'indoor',
      options: [
        { value: 'indoor', label: 'No, vive puertas adentro (indoor)' },
        { value: 'mixto', label: 'A veces, con salidas controladas (mixto)' },
        { value: 'outdoor', label: 'Sí, entra y sale libremente (outdoor)' },
      ],
      help: 'Es el dato que más mueve la aguja: un gato indoor vive mucho más que uno que anda por la calle.',
    },
    {
      id: 'raza',
      label: 'Raza',
      type: 'select',
      value: 'mestizo',
      options: [
        { value: 'mestizo', label: 'Mestizo o no la sé' },
        { value: 'siames', label: 'Siamés' },
        { value: 'persa', label: 'Persa' },
        { value: 'maine_coon', label: 'Maine Coon' },
        { value: 'ragdoll', label: 'Ragdoll' },
        { value: 'bengala', label: 'Bengalí' },
        { value: 'britanico', label: 'Británico de pelo corto' },
        { value: 'abisinio', label: 'Abisinio' },
        { value: 'birmano', label: 'Birmano (sagrado de Birmania)' },
        { value: 'burmes', label: 'Burmés' },
        { value: 'ruso_azul', label: 'Azul ruso' },
        { value: 'sphynx', label: 'Sphynx' },
        { value: 'scottish_fold', label: 'Scottish Fold' },
        { value: 'noruego_bosque', label: 'Bosque de Noruega' },
        { value: 'oriental', label: 'Oriental' },
        { value: 'manx', label: 'Manx' },
        { value: 'exotico', label: 'Exótico de pelo corto' },
        { value: 'otro', label: 'Otra raza' },
      ],
      help: 'La raza no cambia la equivalencia en años humanos, sólo la esperanza de vida.',
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
      help: 'Sin castrar se pierden unos 2 años: tumores, peleas y escapadas.',
    },
  ],
  fineprint:
    'Es una orientación estadística, no un diagnóstico. Cada gato envejece a su ritmo según genética, peso, dieta y salud dental: ante cualquier cambio de apetito, sed, peso o conducta —sobre todo si toma mucha agua— la consulta veterinaria manda.',

  chart: {
    type: 'timeline',
    title: 'La vida de tu gato, etapa por etapa',
    caption:
      'La barra recorre la vida del gato dividida en seis etapas —gatito, junior, adulto joven, adulto maduro, senior y geronte— según la clasificación AAFP. El marcador muestra dónde está hoy y hasta dónde llega la esperanza de vida de su raza con su estilo de vida.',
    bands: [
      { label: 'Gatito', from: 0, to: 0.5, tone: 'good' },
      { label: 'Junior', from: 0.5, to: 2, tone: 'good' },
      { label: 'Adulto joven', from: 2, to: 7, tone: 'neutral' },
      { label: 'Adulto maduro', from: 7, to: 11, tone: 'neutral' },
      { label: 'Senior', from: 11, to: 15, tone: 'warn' },
      { label: 'Geronte', from: 15, to: 20, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Los números de tu gato',
  breakdownIntro:
    'Todo está en años: unos son años de gato y otros años humanos equivalentes. Las barras comparan cada cifra con la mayor.',

  answer: {
    title: 'La equivalencia felina no es lineal ni ×7',
    copy:
      'El gato madura de golpe al principio y después envejece despacio y parejo. Al año ya es un adolescente hecho, a los dos es un adulto joven, y de ahí en más cada año felino suma 4 años humanos. Por eso un gato de 15 no es un humano de 105 sino de unos 76.',
    yes: [
      'Año 1: equivale a unos 15 años humanos (AAFP/AAHA)',
      'Año 2: suma 9 más, o sea unos 24 años humanos en total',
      'Del tercer año en adelante: +4 años humanos por cada año de gato',
      'Fórmula corta para gatos de 3 años o más: edad humana = 24 + (edad − 2) × 4',
      'Un gato indoor promedia entre 14 y 18 años; uno que anda por la calle, entre 5 y 7',
      'La castración suma unos 2 años de esperanza, y en las hembras además elimina el riesgo de piometra y de tumores mamarios',
    ],
    warn: [
      'La regla del 7 no aplica: un gato de 1 año ya es sexualmente maduro y ninguno de 7 años humanos lo es',
      'La calle es el factor que más recorta la vida: atropellos, peleas, envenenamientos, leucemia felina e inmunodeficiencia',
      'A partir de los 7 años los controles pasan de anuales a semestrales, con análisis de sangre, orina y presión arterial',
      'La enfermedad renal crónica afecta a un tercio de los gatos mayores de 10 años y arranca sin síntomas visibles: se detecta en el análisis, no a ojo',
      'Los braquicéfalos (persa, exótico) suman problemas respiratorios, oculares y dentales que acortan la vida',
    ],
    plazo:
      'la etapa madura empieza a los 7 años y la senior a los 11: desde los 7 el control veterinario pasa a ser cada 6 meses.',
  },

  faq: [
    {
      q: '¿Cuántos años humanos tiene mi gato?',
      a: 'El primer año equivale a unos 15 años humanos y el segundo suma 9 más, así que un gato de 2 años ya es un humano de 24. A partir de ahí cada año felino suma 4: un gato de 7 años equivale a unos 44 años humanos, uno de 10 a 56 y uno de 15 a 76. La fórmula para 3 años o más es edad humana = 24 + (edad del gato − 2) × 4.',
    },
    {
      q: '¿Es verdad que un año de gato son siete humanos?',
      a: 'No. La regla del 7 es una simplificación que no resiste ningún dato: un gato de un año ya puede tener cría, algo que ningún chico de siete años puede hacer. Y del otro lado sobreestima la vejez: la regla daría 105 años humanos para un gato de 15, cuando la tabla de la AAFP lo ubica en unos 76, que es una vejez real pero perfectamente alcanzable.',
    },
    {
      q: '¿Cuáles son las etapas de vida de un gato?',
      a: 'Según las Feline Life Stage Guidelines de la AAHA y la AAFP: gatito hasta los 6 meses, junior hasta los 2 años, adulto joven de 2 a 7, adulto maduro de 7 a 11, senior de 11 a 15 y geronte de los 15 en adelante. Cada etapa cambia lo que hay que controlar: en el gatito, vacunas y socialización; en el adulto maduro, peso y riñón; en el senior, presión, tiroides y dolor articular.',
    },
    {
      q: '¿Cuánto vive un gato indoor comparado con uno que sale a la calle?',
      a: 'La diferencia es enorme: un gato que vive puertas adentro promedia entre 14 y 18 años, mientras que uno con acceso libre a la calle promedia entre 5 y 7. Los responsables son los atropellos, las peleas —que además contagian leucemia felina e inmunodeficiencia—, los envenenamientos y los parásitos. Un esquema mixto con salidas controladas queda en el medio, alrededor de un 10 o 15% por debajo del indoor.',
    },
    {
      q: '¿Cuánto vive un gato según la raza?',
      a: 'Como referencia: burmés y azul ruso 16-20 años, siamés y oriental 15-20, mestizo y birmano 14-18, abisinio 14-17, persa, ragdoll y británico 12-17, maine coon, bengalí y exótico 12-16, bosque de Noruega 14-16, sphynx, scottish fold y manx 12-15. El mestizo está bien arriba porque su diversidad genética lo protege de las enfermedades hereditarias concentradas en cada raza.',
    },
    {
      q: '¿La castración hace que mi gato viva más?',
      a: 'En promedio sí, alrededor de dos años más. En las hembras elimina la piometra y reduce mucho el riesgo de tumores mamarios; en los machos corta la conducta de escape y las peleas territoriales, que son la vía de contagio de la leucemia felina y del virus de inmunodeficiencia. A cambio, el gasto energético baja después de la cirugía: hay que ajustar la ración o aparece el sobrepeso.',
    },
    {
      q: '¿Cómo calculo la edad de un gatito de pocos meses?',
      a: 'Dentro del primer año la equivalencia es prácticamente lineal: 15 años humanos repartidos en 12 meses, algo más de un año humano por mes. A los 3 meses un gatito anda por los 4 años humanos y ya come sólido; a los 6 meses ronda los 7 u 8 y suele estar en edad de castración; y al año ya es un adolescente hecho, con la madurez sexual completa.',
    },
    {
      q: '¿Cómo sé la edad de un gato que adopté sin saber cuándo nació?',
      a: 'El veterinario la estima por los dientes y los ojos. Los dientes de leche salen entre las 2 y las 4 semanas y se cambian entre los 3 y los 6 meses; el sarro empieza a los 2 años y se marca a los 5; a partir de los 10 suele haber desgaste y pérdida de piezas. El iris también ayuda: es liso y nítido en el joven, y con los años se vuelve irregular y aparecen zonas de despigmentación.',
    },
    {
      q: '¿Qué le cambio a mi gato cuando entra en la etapa senior?',
      a: 'Controles cada 6 meses en vez de anuales, con análisis de sangre y orina, presión arterial y perfil tiroideo, que son los tres frentes clásicos: riñón, hipertensión e hipertiroidismo. En la casa, bandeja de bordes bajos y accesible en el mismo piso, comederos elevados, rampas o escalones a sus lugares altos, y agua en varios puntos. El control dental es lo más subdiagnosticado y lo que más afecta la calidad de vida.',
    },
    {
      q: '¿Cuáles son las señales de que mi gato está envejeciendo?',
      a: 'Dormir muchas más horas, saltar menos o dudar antes de saltar, acicalarse peor —pelo opaco o apelmazado, sobre todo en la espalda—, uñas más gruesas, comer menos, tomar mucha más agua, maullar de noche o desorientarse, y bajar de peso sin cambio de dieta. La sed aumentada y la pérdida de peso son las dos que más urgen: apuntan a riñón o tiroides y se confirman con un análisis.',
    },
    {
      q: '¿Los gatos mestizos viven más que los de raza?',
      a: 'En general sí, un poco. Al tener mayor diversidad genética son menos propensos a las enfermedades hereditarias que cada raza concentra: cardiomiopatía hipertrófica en el maine coon y el ragdoll, poliquistosis renal en el persa, amiloidosis renal en el abisinio, osteocondrodisplasia en el scottish fold. Aun así, el estilo de vida pesa más que el pedigrí: un mestizo que sale a la calle vive bastante menos que un persa indoor.',
    },
  ],

  sources: [
    {
      name: '2021 AAHA/AAFP Feline Life Stage Guidelines — etapas de vida del gato',
      url: 'https://www.aaha.org/resources/2021-aaha-aafp-feline-life-stage-guidelines/',
      publisher: 'American Animal Hospital Association · American Association of Feline Practitioners',
      date: '2021',
    },
    {
      name: 'AAFP — Cat Friendly Homes: la edad del gato en años humanos',
      url: 'https://catfriendly.com/cat-care-at-home/cats-age/',
      publisher: 'American Association of Feline Practitioners',
    },
    {
      name: 'Montoya M. et al. — Life expectancy tables for dogs and cats derived from clinical data (Frontiers in Veterinary Science, 2023)',
      url: 'https://www.frontiersin.org/articles/10.3389/fvets.2023.1082102/full',
      publisher: 'Frontiers in Veterinary Science',
      date: '2023',
    },
    {
      name: 'AVMA — Senior pet care y frecuencia de controles',
      url: 'https://www.avma.org/resources-tools/pet-owners/petcare/senior-pet-care-faq',
      publisher: 'American Veterinary Medical Association',
    },
    {
      name: 'IRIS — Estadificación de la enfermedad renal crónica en el gato',
      url: 'https://www.iris-kidney.com/guidelines/staging',
      publisher: 'International Renal Interest Society',
    },
    {
      name: 'ISFM — Indoor vs outdoor: riesgos y esperanza de vida del gato',
      url: 'https://icatcare.org/articles/indoor-versus-outdoor-cats',
      publisher: 'International Cat Care · ISFM',
    },
  ],

  replaces: [
    '/calculadora-edad-gato-humano-formula-anos',
    '/calculadora-esperanza-vida-gato-raza-indoor',
    '/calculadora-edad-gato-anos-humanos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Esperanza de vida por raza (mínimo y máximo, en años), calcada del módulo
 * real `esperanza-vida-gato-raza-indoor.ts`. Los valores son de gato indoor
 * castrado: el compute() aplica desde ahí los ajustes por estilo de vida y
 * castración.
 */
export const RAZAS: Record<string, { nombre: string; min: number; max: number; notas: string }> = {
  mestizo: { nombre: 'Mestizo', min: 14, max: 18, notas: 'Mayor diversidad genética, muy longevo' },
  siames: { nombre: 'Siamés', min: 15, max: 20, notas: 'Una de las razas más longevas' },
  persa: { nombre: 'Persa', min: 12, max: 17, notas: 'Braquicéfalo, predisposición a poliquistosis renal' },
  maine_coon: { nombre: 'Maine Coon', min: 12, max: 16, notas: 'Riesgo de cardiomiopatía hipertrófica' },
  ragdoll: { nombre: 'Ragdoll', min: 12, max: 17, notas: 'Tendencia a cardiomiopatía en algunas líneas' },
  bengala: { nombre: 'Bengalí', min: 12, max: 16, notas: 'Activo y en general saludable' },
  britanico: { nombre: 'Británico de pelo corto', min: 12, max: 17, notas: 'Tendencia a obesidad: controlar peso' },
  abisinio: { nombre: 'Abisinio', min: 14, max: 17, notas: 'Amiloidosis renal en algunas líneas' },
  birmano: { nombre: 'Birmano', min: 14, max: 18, notas: 'Raza robusta y longeva' },
  burmes: { nombre: 'Burmés', min: 16, max: 20, notas: 'Muy longeva, excelente salud general' },
  ruso_azul: { nombre: 'Azul ruso', min: 15, max: 20, notas: 'Longeva y saludable' },
  sphynx: { nombre: 'Sphynx', min: 12, max: 15, notas: 'Riesgo cardíaco y piel sensible' },
  scottish_fold: { nombre: 'Scottish Fold', min: 12, max: 15, notas: 'Osteocondrodisplasia: problemas articulares' },
  noruego_bosque: { nombre: 'Bosque de Noruega', min: 14, max: 16, notas: 'Glucogenosis tipo IV en algunas líneas' },
  oriental: { nombre: 'Oriental', min: 15, max: 20, notas: 'Longevidad similar a la del siamés' },
  manx: { nombre: 'Manx', min: 12, max: 15, notas: 'Síndrome de Manx: malformaciones de columna' },
  exotico: { nombre: 'Exótico de pelo corto', min: 12, max: 16, notas: 'Braquicéfalo, similar al persa' },
  otro: { nombre: 'Otra raza', min: 13, max: 17, notas: 'Estimación genérica' },
};

/**
 * Ajustes de esperanza de vida, calcados de `esperanza-vida-gato-raza-indoor.ts`:
 *  - outdoor recorta el mínimo al 35% y el máximo al 40% (pisos de 3 y 5 años)
 *  - mixto recorta al 85% y al 90%
 *  - sin castrar resta 2 años a cada extremo (pisos de 2 y 4 años)
 */
export const AJUSTES = {
  outdoor: { minFactor: 0.35, maxFactor: 0.4, minPiso: 3, maxPiso: 5 },
  mixto: { minFactor: 0.85, maxFactor: 0.9 },
  sinCastrar: { resta: 2, minPiso: 2, maxPiso: 4 },
};

/**
 * Etapas de vida AAFP/AAHA 2021, con el corte superior en años de gato.
 * Es la misma escala que usa `esperanza-vida-gato-raza-indoor.ts`.
 */
export const ETAPAS = [
  { nombre: 'gatito', hasta: 0.5 },
  { nombre: 'junior', hasta: 2 },
  { nombre: 'adulto joven', hasta: 7 },
  { nombre: 'adulto maduro', hasta: 11 },
  { nombre: 'senior', hasta: 15 },
  { nombre: 'geronte', hasta: 30 },
];
