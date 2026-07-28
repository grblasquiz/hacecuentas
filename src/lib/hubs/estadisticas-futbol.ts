import type { HubData } from './types';

/**
 * Hub de decisión — "Récords y estadísticas de jugadores"
 *
 * Arquetipo CÁLCULO DOMINANTE: sin `cases`. La respuesta fija va en `answer` y
 * la ramificación real la hacen dos `select` encadenados —deporte y métrica—,
 * como en el hub de conversores. La página los sincroniza y esconde los campos
 * que la métrica elegida no usa.
 *
 * CRITERIO DE ABSORCIÓN (importante, son 17 calculadoras muy dispares).
 * Se reimplementan SÓLO las que comparten la misma pregunta: "¿cómo me
 * comparo con un profesional?". Son 11 calcs que se agrupan en 10 métricas
 * (las dos de distancia recorrida por posición eran la misma cuenta con
 * distinta tabla, así que se fusionaron usando el rango de FIFA y el promedio
 * ajustado por nivel).
 *
 * Las otras 6 se absorben POR URL, sin reimplementar, porque no comparan a
 * nadie con nadie: son datos de referencia, comparadores entre dos figuras o
 * geometría de reglamento. Meterlas a la fuerza en un medidor de nivel
 * personal habría roto la promesa del hub. Quedan en `replaces` para conservar
 * el link equity y se explican en la FAQ:
 *   · top 10 goleadores históricos del Mundial (ranking histórico)
 *   · comparador Messi vs Cristiano (dos jugadores entre sí, no vos)
 *   · récord de Messi por competencia (dato de archivo)
 *   · fuera de juego con cámara del VAR (geometría de reglamento)
 *   · distancia de la barrera en el tiro libre, 9,15 m (regla fija)
 *   · peso de guantes de boxeo en kg y oz (conversión de unidades)
 *
 * OJO REDACCIÓN: el Mundial 2026 terminó el 19 de julio de 2026 con España
 * campeona. Todo lo que lo mencione va en pasado.
 *
 * Nada de este hub es dinero: cada fila declara `format: 'unit'` o `'plain'`.
 */
export const hub: HubData = {
  slug: 'futbol/estadisticas',
  title: 'Récords y estadísticas de jugadores — cómo te comparás con un profesional',
  description:
    'Medí tu nivel real contra el de un profesional: km recorridos por partido, sprint de 30 metros, velocidad del disparo, porcentaje de pases y de conversión, peso de competición, handicap de golf, ELO de ajedrez y watts por kilo en ciclismo.',
  silo: 'Fútbol',
  siloHref: '/futbol',

  eyebrow: 'Estadísticas y récords deportivos',
  h1: 'Récords y estadísticas de jugadores',
  lede:
    'Elegí el deporte y la métrica, cargá tu número y te decimos dónde caés contra los rangos profesionales. Están adentro las diez cuentas que responden lo mismo: cuánto te falta —o cuánto te sobra— para el nivel de un profesional.',
  stamps: [
    'Actualizado 27-07-2026',
    'Rangos FIFA, FBref, WHS, FIDE y Coggan',
    '17 calculadoras adentro',
    'Comparación con rangos profesionales',
  ],

  resultLabel: 'Tu nivel comparado',

  inputsTitle: 'Elegí el deporte y cargá tu número',
  inputsIntro:
    'Primero el deporte, después la métrica. Sólo quedan visibles los campos que esa métrica usa: el resto se esconde para que no cargues datos al pedo.',
  fields: [
    {
      id: 'deporte',
      label: 'Deporte',
      type: 'select',
      value: 'futbol',
      options: [
        { value: 'futbol', label: 'Fútbol' },
        { value: 'golf', label: 'Golf' },
        { value: 'ajedrez', label: 'Ajedrez' },
        { value: 'ciclismo', label: 'Ciclismo' },
      ],
    },
    {
      id: 'metrica',
      label: 'Qué querés medir',
      type: 'select',
      value: 'distancia',
      options: [
        { value: 'distancia', label: 'Kilómetros recorridos en el partido' },
        { value: 'sprint', label: 'Sprint de 30 metros' },
        { value: 'disparo', label: 'Velocidad de tu disparo' },
        { value: 'pases', label: 'Porcentaje de pases completados' },
        { value: 'conversion', label: 'Porcentaje de conversión de tiros al arco' },
        { value: 'peso', label: 'Peso de competición para tu altura' },
        { value: 'golf-diferencial', label: 'Diferencial de una tarjeta (WHS)' },
        { value: 'golf-handicap', label: 'Handicap estimado' },
        { value: 'elo', label: 'Puntos de ranking ELO' },
        { value: 'wkg', label: 'Watts por kilo (FTP)' },
      ],
    },
    {
      id: 'posicion',
      label: 'Tu posición en la cancha',
      type: 'select',
      value: 'mediocampista',
      options: [
        { value: 'arquero', label: 'Arquero' },
        { value: 'defensor-central', label: 'Defensor central' },
        { value: 'lateral', label: 'Lateral o carrilero' },
        { value: 'mediocampista', label: 'Mediocampista central' },
        { value: 'volante-externo', label: 'Volante externo o extremo' },
        { value: 'delantero', label: 'Delantero centro' },
      ],
    },
    { id: 'minutos', label: 'Minutos jugados', type: 'number', min: 1, max: 130, value: 90 },
    {
      id: 'distancia',
      label: 'Distancia recorrida por la pelota o por vos (metros)',
      type: 'number',
      min: 1,
      max: 120,
      value: 30,
      help: 'En el sprint son los metros del test; en el disparo, la distancia al arco.',
    },
    {
      id: 'segundos',
      label: 'Tiempo cronometrado (segundos)',
      type: 'number',
      min: 0.1,
      max: 20,
      step: 0.01,
      value: 4.2,
      help: 'Del sprint o del vuelo de la pelota.',
    },
    { id: 'intentos', label: 'Intentos: pases intentados o tiros al arco', type: 'number', min: 1, max: 2000, value: 60 },
    { id: 'aciertos', label: 'Aciertos: pases completados o goles', type: 'number', min: 0, max: 2000, value: 50 },
    { id: 'alturaCm', label: 'Tu altura (cm)', type: 'number', min: 140, max: 220, value: 178 },
    { id: 'pesoKg', label: 'Tu peso (kg)', type: 'number', min: 35, max: 160, value: 75 },
    { id: 'score', label: 'Golpes totales de tu tarjeta', type: 'number', min: 50, max: 160, value: 92 },
    { id: 'courseRating', label: 'Course Rating del campo', type: 'number', min: 55, max: 85, step: 0.1, value: 72.4 },
    { id: 'slopeRating', label: 'Slope Rating del campo', type: 'number', min: 55, max: 155, value: 128 },
    { id: 'eloPropio', label: 'Tu rating ELO', type: 'number', min: 100, max: 3000, value: 1500 },
    { id: 'eloRival', label: 'ELO de tu rival', type: 'number', min: 100, max: 3000, value: 1600 },
    {
      id: 'resultado',
      label: 'Resultado de la partida',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Gané' },
        { value: '0.5', label: 'Empaté' },
        { value: '0', label: 'Perdí' },
      ],
    },
    { id: 'ftpWatts', label: 'Tu FTP en watts', type: 'number', min: 50, max: 600, value: 250 },
    {
      id: 'sexo',
      label: 'Tabla de referencia',
      type: 'select',
      value: 'masculino',
      options: [
        { value: 'masculino', label: 'Masculina' },
        { value: 'femenino', label: 'Femenina' },
      ],
    },
  ],
  fineprint:
    'Estimación general basada en rangos de referencia publicados. Ajustá cargas y objetivos a tu condición física; ante dolor, lesión o riesgo de salud consultá a un profesional.',

  chart: {
    type: 'scale',
    title: 'Dónde caés contra el nivel profesional',
    caption:
      'La escala va de amateur inicial a élite mundial. Cada métrica tiene sus propios cortes —segundos, km/h, porcentaje, handicap, ELO o watts por kilo— y el marcador ubica tu número dentro de esas franjas.',
    bands: [
      { label: 'Amateur inicial', from: 0, to: 25, tone: 'bad' },
      { label: 'Amateur avanzado', from: 25, to: 50, tone: 'warn' },
      { label: 'Semiprofesional', from: 50, to: 75, tone: 'neutral' },
      { label: 'Profesional', from: 75, to: 92, tone: 'good' },
      { label: 'Élite mundial', from: 92, to: 100, tone: 'good' },
    ],
  },
  breakdownTitle: 'Tu número contra el de un profesional',
  breakdownIntro:
    'Cada fila muestra su unidad al lado del número: kilómetros, segundos, km/h, porcentajes, kilos, golpes, puntos ELO o watts por kilo. Ningún valor de este hub es dinero.',

  answer: {
    title: 'Todas estas cuentas responden lo mismo: cuánto te falta para el nivel profesional',
    copy:
      'Un número solo no dice nada: 4,20 segundos en 30 metros puede ser excelente o flojo según a qué te dediques. Lo que convierte un dato en información es el rango contra el que se lo compara, y por eso cada métrica de acá trae la tabla de referencia de su deporte: FIFA y FBref para fútbol, el World Handicap System para golf, la fórmula de Elo para ajedrez y la tabla de Coggan para ciclismo.',
    yes: [
      'Kilómetros por partido: un mediocampista de élite recorre entre 11 y 13 km cada 90 minutos, y un arquero entre 3 y 5',
      'Sprint de 30 metros: la referencia élite va de 3,60 s en un delantero a 4,50 s en un arquero, y por debajo de 3,55 s ya se entra en terreno de récord',
      'Velocidad del disparo: 120 km/h o más es nivel élite, entre 100 y 120 profesional, y por debajo de 80 km/h el arquero llega tranquilo',
      'Pases completados: un defensor central de las cinco grandes ligas europeas anda en 92% y un delantero en 80%; el mismo 85% es excelente en un extremo y flojo en un central',
      'Conversión: 30% o más de los tiros al arco es de goleador top mundial, entre 12% y 17% es el promedio profesional',
      'Golf: el diferencial de una tarjeta es (score − Course Rating) × 113 ÷ Slope, y el handicap index oficial promedia los mejores 8 de las últimas 20 vueltas',
      'Ajedrez: la variación de puntos es K × (resultado − esperado), y el esperado sale de la diferencia de ELO con tu rival',
      'Ciclismo: los watts por kilo en FTP definen la categoría; 5,05 W/kg es World Tour masculino y 4,30 W/kg es UCI Women’s WorldTour',
    ],
    warn: [
      'Estimación general: ajustá cargas y objetivos a tu condición física, y ante dolor, lesión o riesgo de salud consultá a un profesional',
      'Los rangos son de fútbol masculino profesional adulto. En fútbol femenino, juvenil o veterano los cortes bajan y una comparación directa no corresponde',
      'La distancia recorrida y los sprints salen de sistemas de seguimiento óptico o GPS: un reloj deportivo común mide bastante peor y suele inflar el total',
      'El handicap que sale acá es estimado. El index oficial lo emite tu federación con al menos 20 tarjetas cargadas y ajustes de condiciones de juego',
      'El peso de competición se estima con un IMC objetivo por posición: no distingue masa muscular de grasa. Para eso hace falta una antropometría',
      'Ningún número de esta pantalla es un diagnóstico de rendimiento ni un plan de entrenamiento',
    ],
    plazo:
      'los rangos profesionales se actualizan cada temporada: FBref publica los promedios de las cinco grandes ligas al cierre de cada campeonato y el World Handicap System revisa sus tablas una vez al año.',
  },

  faq: [
    {
      q: '¿Cuántos kilómetros recorre un jugador profesional por partido?',
      a: 'Depende fuerte de la posición. Un mediocampista central recorre entre 11 y 13 km cada 90 minutos, un volante externo entre 10,5 y 12, un lateral entre 10 y 11,5, un delantero centro entre 9 y 10,5, un defensor central entre 9 y 10, y un arquero apenas entre 3 y 5. De ese total, entre el 8% y el 14% es a alta intensidad, o sea por encima de 19,8 km/h: esa fracción es la que realmente cansa.',
    },
    {
      q: '¿Qué tiempo en 30 metros es de nivel profesional?',
      a: 'Por debajo de 3,75 segundos es élite y por debajo de 3,55 ya es terreno de récord. Entre 3,75 y 4,00 es profesional promedio, entre 4,00 y 4,30 semiprofesional, entre 4,30 y 4,70 amateur avanzado y más de 5,20 amateur inicial. Los tiempos de referencia por posición son 3,60 s para un delantero, 3,90 s para un mediocampista, 4,00 s para un defensor y 4,50 s para un arquero.',
    },
    {
      q: '¿A qué velocidad viaja el disparo de un futbolista profesional?',
      a: 'Un remate profesional viaja entre 100 y 120 km/h, y por encima de 120 km/h se considera élite. La cuenta es simple: velocidad = distancia al arco dividida por el tiempo de vuelo. Lo que define si es atajable no es la velocidad sino el tiempo de reacción que le queda al arquero: menos de 0,5 segundos lo deja sin chance, y más de 1,2 segundos le alcanza de sobra.',
    },
    {
      q: '¿Qué porcentaje de pases completados es bueno?',
      a: 'No hay un número único: depende de la posición, porque un central pasa corto y un extremo arriesga. En las cinco grandes ligas europeas el umbral de élite es 92% para un defensor central, 90% para un mediocampista, 88% para un lateral, 85% para un arquero o un mediapunta, 82% para un extremo y 80% para un delantero. El mismo 85% es sobresaliente en un extremo y apenas correcto en un central.',
    },
    {
      q: '¿Cómo se calcula el handicap de golf?',
      a: 'El diferencial de cada vuelta es (score ajustado − Course Rating) × 113 ÷ Slope Rating. El handicap index oficial es el promedio de los mejores 8 diferenciales de tus últimas 20 tarjetas. Con sólo tres tarjetas el World Handicap System aplica un ajuste sobre el mejor diferencial —restarle 2— y el resultado es una estimación, no un index federado.',
    },
    {
      q: '¿Cómo se calculan los puntos ELO en ajedrez?',
      a: 'Primero el resultado esperado: 1 ÷ (1 + 10 elevado a la diferencia de ELO dividida por 400). Después la variación: K × (resultado real − resultado esperado), donde el resultado real es 1 si ganaste, 0,5 si empataste y 0 si perdiste. El factor K vale 40 para jugadores nuevos, 20 para la mayoría y 10 para quienes superaron los 2400 puntos. Ganarle a un rival más fuerte suma mucho; ganarle a uno más débil, casi nada.',
    },
    {
      q: '¿Cuántos watts por kilo hacen falta para ser competitivo en ciclismo?',
      a: 'En la tabla de Coggan masculina, 5,05 W/kg de FTP es World Tour, 4,55 es categoría 1 o Pro Continental, 4,10 es categoría 2, 3,65 categoría 3, 3,20 categoría 4 y 2,40 es recreativo entrenado. En la tabla femenina los cortes son 4,30 para el UCI Women’s WorldTour, 3,85 para elite nacional, 3,50 para máster competitiva y 3,05 para categoría 3. Se sube de categoría de dos maneras: subiendo el FTP o bajando el peso.',
    },
    {
      q: '¿Por qué el comparador de Messi contra Cristiano no está en el medidor?',
      a: 'Porque compara a dos futbolistas entre sí y no te compara a vos con nadie, que es la pregunta que responde este hub. Pasa lo mismo con el ranking de goleadores históricos del Mundial, con el récord de Messi por competencia, con la geometría del fuera de juego que usa la cámara del VAR, con los 9,15 metros de la barrera en un tiro libre y con la conversión de kilos a onzas de los guantes de boxeo: son datos de referencia o reglas fijas. Las URLs viejas siguen llegando acá para no perder el recorrido, pero el cálculo personal no aplica.',
    },
    {
      q: '¿El peso ideal de un futbolista sirve para cualquiera?',
      a: 'Sirve como referencia de peso de competición, no como objetivo de salud. Parte de un IMC de 22 y lo ajusta por posición: un defensor central suma 2,5 kg y un arquero 2 kg porque necesitan masa para el duelo, mientras que un lateral resta 1,5 kg y un volante externo 1 kg porque viven de la velocidad. El IMC no distingue músculo de grasa, así que un jugador muy musculado puede quedar por encima del rango sin que eso signifique nada malo.',
    },
    {
      q: '¿Estos rangos valen para el fútbol femenino o juvenil?',
      a: 'No directamente. Las tablas de distancia, sprint y velocidad de disparo salen de fútbol masculino profesional adulto, así que compararse contra ellas en femenino, juvenil o veterano da una lectura injusta. La única métrica de este hub que trae tabla propia por sexo es la de watts por kilo en ciclismo, donde la referencia femenina existe y está publicada.',
    },
    {
      q: '¿Los datos del Mundial 2026 siguen sirviendo?',
      a: 'El torneo terminó el 19 de julio de 2026 con España campeona, así que todo lo que salió de ahí es registro histórico y ya no se mueve. Los rangos de rendimiento que usa este hub, en cambio, no dependen de ese torneo: vienen de informes técnicos de FIFA y de temporadas completas de las cinco grandes ligas, y se actualizan al cierre de cada campeonato.',
    },
  ],

  sources: [
    {
      name: 'Football Technical Reports — datos físicos de partido por posición',
      url: 'https://www.fifatrainingcentre.com/en/game/tournaments/tournament-reports.php',
      publisher: 'FIFA Training Centre',
    },
    {
      name: 'Estadísticas avanzadas de las cinco grandes ligas europeas (precisión de pase y conversión por posición)',
      url: 'https://fbref.com/es/comps/Big5/Estadisticas-de-Big-5-European-Leagues',
      publisher: 'FBref / Opta',
      date: 'temporadas 2023-2025',
    },
    {
      name: 'Rules of Handicapping — cálculo del diferencial y del Handicap Index',
      url: 'https://www.usga.org/handicapping/roh/2020-rules-of-handicapping.html',
      publisher: 'World Handicap System (USGA / R&A)',
    },
    {
      name: 'FIDE Rating Regulations — fórmula de Elo y factores K',
      url: 'https://handbook.fide.com/chapter/B022022',
      publisher: 'FIDE',
    },
    {
      name: 'Power profiling y tabla de categorías por watts por kilo',
      url: 'https://www.trainingpeaks.com/blog/power-profiling/',
      publisher: 'TrainingPeaks (Coggan & Allen)',
    },
  ],

  replaces: [
    '/calculadora-distancia-recorrida-futbol-jugador',
    '/calculadora-distancia-recorrida-futbolista-por-posicion',
    '/calculadora-velocidad-sprint-30m-futbol-por-posicion',
    '/calculadora-velocidad-pelota-futbol-tiro',
    '/calculadora-porcentaje-pases-completados-top-5-ligas',
    '/calculadora-porcentaje-conversion-tiros-al-arco-futbolista',
    '/calculadora-peso-ideal-futbolista-altura-posicion',
    '/calculadora-handicap-golf-diferencial',
    '/calculadora-handicap-golf-estimado',
    '/calculadora-puntos-ranking-ajedrez-elo',
    '/calculadora-ciclismo-power-w-kg-categoria-ftp',
    '/calculadora-top-10-goleadores-historico-mundial-fifa',
    '/calculadora-comparador-messi-vs-cristiano-goles-asistencias-titulos',
    '/calculadora-record-messi-goles-competencia-club-seleccion',
    '/calculadora-fuera-de-juego-offside-distancia-camara-var',
    '/calculadora-distancia-barrera-tiro-libre-9-15m',
    '/calculadora-peso-guantes-boxeo-kg-oz',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-poisson-goles-esperados-partido',
    '/calculadora-promedio-goles-tiempo-anadido-drama-late-match',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Qué campos usa cada métrica y a qué deporte pertenece. */
export const METRICAS: Record<
  string,
  { deporte: string; label: string; campos: string[] }
> = {
  distancia: { deporte: 'futbol', label: 'Kilómetros recorridos en el partido', campos: ['posicion', 'minutos'] },
  sprint: { deporte: 'futbol', label: 'Sprint de 30 metros', campos: ['posicion', 'distancia', 'segundos'] },
  disparo: { deporte: 'futbol', label: 'Velocidad de tu disparo', campos: ['distancia', 'segundos'] },
  pases: { deporte: 'futbol', label: 'Porcentaje de pases completados', campos: ['posicion', 'intentos', 'aciertos'] },
  conversion: { deporte: 'futbol', label: 'Porcentaje de conversión de tiros al arco', campos: ['intentos', 'aciertos'] },
  peso: { deporte: 'futbol', label: 'Peso de competición para tu altura', campos: ['posicion', 'alturaCm', 'pesoKg'] },
  'golf-diferencial': { deporte: 'golf', label: 'Diferencial de una tarjeta (WHS)', campos: ['score', 'courseRating', 'slopeRating'] },
  'golf-handicap': { deporte: 'golf', label: 'Handicap estimado', campos: ['score', 'courseRating', 'slopeRating'] },
  elo: { deporte: 'ajedrez', label: 'Puntos de ranking ELO', campos: ['eloPropio', 'eloRival', 'resultado'] },
  wkg: { deporte: 'ciclismo', label: 'Watts por kilo (FTP)', campos: ['ftpWatts', 'pesoKg', 'sexo'] },
};

/**
 * Distancia recorrida por posición. `km90` es el promedio profesional cada 90
 * minutos (fórmula distancia-recorrida-futbol-jugador) y `min`/`max` el rango
 * de los informes técnicos de FIFA (fórmula distancia-futbolista-posicion).
 * `hiPct` es la fracción a alta intensidad, por encima de 19,8 km/h.
 */
export const POSICION_DISTANCIA: Record<
  string,
  { nombre: string; km90: number; min: number; max: number; hiPct: number; sprints: number }
> = {
  arquero: { nombre: 'Arquero', km90: 5.5, min: 3.0, max: 5.0, hiPct: 0.03, sprints: 8 },
  'defensor-central': { nombre: 'Defensor central', km90: 9.5, min: 9.0, max: 10.0, hiPct: 0.08, sprints: 20 },
  lateral: { nombre: 'Lateral / carrilero', km90: 10.5, min: 10.0, max: 11.5, hiPct: 0.12, sprints: 32 },
  mediocampista: { nombre: 'Mediocampista central', km90: 11.5, min: 11.0, max: 13.0, hiPct: 0.11, sprints: 28 },
  'volante-externo': { nombre: 'Volante externo / extremo', km90: 10.8, min: 10.5, max: 12.0, hiPct: 0.14, sprints: 38 },
  delantero: { nombre: 'Delantero centro', km90: 9.8, min: 9.0, max: 10.5, hiPct: 0.13, sprints: 28 },
};

/** Tiempo élite de referencia en 30 m, en segundos, por posición. */
export const SPRINT_BENCH: Record<string, number> = {
  arquero: 4.5,
  'defensor-central': 4.0,
  lateral: 4.0,
  mediocampista: 3.9,
  'volante-externo': 3.7,
  delantero: 3.6,
};

/** Umbrales de precisión de pase por posición, top 5 ligas (FBref 2023-2025). */
export const PASES_BENCH: Record<string, { elite: number; medio: number; bajo: number }> = {
  arquero: { elite: 85, medio: 78, bajo: 70 },
  'defensor-central': { elite: 92, medio: 86, bajo: 78 },
  lateral: { elite: 88, medio: 82, bajo: 74 },
  mediocampista: { elite: 90, medio: 85, bajo: 78 },
  'volante-externo': { elite: 82, medio: 75, bajo: 68 },
  delantero: { elite: 80, medio: 72, bajo: 65 },
};

/** IMC objetivo y ajuste en kilos por posición, para el peso de competición. */
export const PESO_BENCH: Record<string, { imcBase: number; ajuste: number; nombre: string }> = {
  arquero: { imcBase: 22.5, ajuste: 2.0, nombre: 'Arquero (fuerza + estatura)' },
  'defensor-central': { imcBase: 22.5, ajuste: 2.5, nombre: 'Defensor central' },
  lateral: { imcBase: 21.5, ajuste: -1.5, nombre: 'Lateral (velocidad)' },
  mediocampista: { imcBase: 22.0, ajuste: 0.0, nombre: 'Mediocampista' },
  'volante-externo': { imcBase: 21.5, ajuste: -1.0, nombre: 'Volante externo / extremo' },
  delantero: { imcBase: 22.0, ajuste: 0.5, nombre: 'Delantero centro' },
};

/** Tabla de Coggan: piso de watts por kilo de cada categoría. */
export const WKG_TABLA: Record<string, Array<{ desde: number; categoria: string; descripcion: string }>> = {
  masculino: [
    { desde: 5.05, categoria: 'World Class', descripcion: 'Profesional World Tour' },
    { desde: 4.55, categoria: 'Excelente', descripcion: 'Cat 1 / Pro Continental' },
    { desde: 4.1, categoria: 'Muy bueno', descripcion: 'Cat 2' },
    { desde: 3.65, categoria: 'Bueno', descripcion: 'Cat 3' },
    { desde: 3.2, categoria: 'Moderado', descripcion: 'Cat 4' },
    { desde: 2.4, categoria: 'Recreativo', descripcion: 'Cat 5 / aficionado entrenado' },
    { desde: 0, categoria: 'Untrained', descripcion: 'Sin entrenamiento' },
  ],
  femenino: [
    { desde: 4.3, categoria: 'World Class', descripcion: 'Profesional UCI Women’s WorldTour' },
    { desde: 3.85, categoria: 'Excelente', descripcion: 'Elite nacional' },
    { desde: 3.5, categoria: 'Muy bueno', descripcion: 'Máster competitiva' },
    { desde: 3.05, categoria: 'Bueno', descripcion: 'Cat 3 femenina' },
    { desde: 2.65, categoria: 'Moderado', descripcion: 'Cat 4 femenina' },
    { desde: 2.05, categoria: 'Recreativo', descripcion: 'Aficionada entrenada' },
    { desde: 0, categoria: 'Untrained', descripcion: 'Sin entrenamiento' },
  ],
};

/** Constantes del World Handicap System y de la fórmula de Elo. */
export const CONST = {
  /** Slope neutro del WHS. */
  slopeNeutro: 113,
  /** Ajuste del WHS cuando sólo hay 3 tarjetas cargadas: mejor diferencial − 2. */
  ajusteTresTarjetas: 2,
  /** Factor K por defecto de FIDE para la mayoría de los jugadores. */
  factorK: 20,
};

/**
 * Cortes de cada métrica sobre la escala 0-100 del gráfico.
 * Cada par es [valor de la métrica, posición en la escala]; entre par y par se
 * interpola en forma lineal. Los valores pueden ir en descenso (menos es
 * mejor: segundos, handicap, desvío de peso) sin que la interpolación cambie.
 */
export const ESCALAS: Record<string, Array<[number, number]>> = {
  // Ratio contra el promedio profesional de la posición (1 = el del profesional).
  distancia: [[0.4, 0], [0.65, 25], [0.85, 50], [1.0, 75], [1.1, 92], [1.3, 100]],
  // Segundos en 30 m: menos es mejor.
  sprint: [[5.6, 0], [5.2, 25], [4.7, 50], [4.3, 75], [3.75, 92], [3.4, 100]],
  // Velocidad del disparo en km/h.
  disparo: [[20, 0], [50, 25], [80, 50], [100, 75], [120, 92], [160, 100]],
  // Conversión sobre tiros al arco, en porcentaje.
  conversion: [[0, 0], [7, 25], [12, 50], [17, 75], [22, 92], [30, 100]],
  // Desvío absoluto en kilos contra el peso de competición: menos es mejor.
  peso: [[25, 0], [15, 10], [10, 30], [6, 55], [3, 80], [0, 95]],
  // Handicap y diferencial de golf: menos es mejor.
  golf: [[40, 0], [28, 25], [18, 50], [10, 75], [5, 92], [0, 100]],
  // Rating ELO.
  elo: [[800, 0], [1200, 25], [1600, 50], [2000, 75], [2400, 92], [2800, 100]],
  // Watts por kilo, tabla Coggan masculina y femenina.
  'wkg-masculino': [[1.5, 0], [2.4, 25], [3.2, 50], [4.1, 75], [4.55, 92], [5.05, 100]],
  'wkg-femenino': [[1.2, 0], [2.05, 25], [2.65, 50], [3.5, 75], [3.85, 92], [4.3, 100]],
};

/** Nombre de la franja según la posición 0-100 en la escala. */
export const FRANJAS: Array<{ hasta: number; nombre: string }> = [
  { hasta: 25, nombre: 'amateur inicial' },
  { hasta: 50, nombre: 'amateur avanzado' },
  { hasta: 75, nombre: 'semiprofesional' },
  { hasta: 92, nombre: 'profesional' },
  { hasta: 100, nombre: 'élite mundial' },
];
