import type { HubData } from './types';

/**
 * Hub de decisión — "Mundial 2026: cupos, premios y récords".
 *
 * Arquetipo CÁLCULO DOMINANTE: sin `cases`. Lo que varía (confederación, fase
 * alcanzada, federación, copa continental) va en selects, y la respuesta fija
 * vive en `answer`.
 *
 * OJO — el Mundial 2026 YA SE JUGÓ: final del 19 de julio de 2026, España
 * campeón. Todo el copy va en pasado. No hay cuenta regresiva, ni predictor de
 * campeón, ni "en qué canal pasan el partido": eso se reconvirtió a dato
 * histórico. Lo que sigue vivo son los cupos de las copas de clubes
 * (Libertadores, Sudamericana, Champions, Europa League), que sí se calculan.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos argentinos: los valores son cupos, plazas y dólares de
 *    premio. Cada fila declara su `format` propio ('unit' con cupos / USD / %).
 *    Una fila sin `format` cae a pesos por el Object.assign del runtime.
 *  - `chart.type: 'bars'` no tiene render propio hoy: el runtime lo pinta como
 *    composición. Sirve igual, porque el reparto de las 48 plazas ES una
 *    composición del total.
 */
export const hub: HubData = {
  slug: 'futbol/mundial-2026',
  title: 'Mundial 2026: cupos por confederación, premios y récords',
  description:
    'Cómo se repartieron las 48 plazas del Mundial 2026 entre UEFA, CAF, AFC, CONMEBOL, CONCACAF y OFC, cuánto pagó la FIFA por cada fase, cuánto le quedó a cada jugador y qué cupos reparten hoy Libertadores, Sudamericana, Champions y Europa League.',
  silo: 'Fútbol',
  siloHref: '/futbol',

  eyebrow: 'Guía y datos del fútbol',
  h1: '¿Cuántos cupos, cuánta plata y qué récords dejó el Mundial 2026?',
  lede:
    'El Mundial 2026 terminó el 19 de julio con España campeona. Acá quedan los números duros: las 48 plazas repartidas confederación por confederación, la plata que pagó la FIFA por cada fase y lo que de eso llegó al bolsillo de cada jugador. Y como la temporada de clubes sigue, también calculás los cupos a Libertadores, Sudamericana, Champions y Europa League.',
  stamps: [
    'Actualizado 27-07-2026',
    'Mundial jugado: 11-jun a 19-jul de 2026 · España campeón',
    '14 calculadoras adentro',
  ],

  resultLabel: 'Cupos de la confederación en el Mundial 2026',

  inputsTitle: 'Elegí qué querés mirar',
  inputsIntro:
    'Los tres primeros campos son del Mundial que se jugó. Los últimos cuatro son de las copas de clubes, que siguen en curso.',
  fields: [
    {
      id: 'confederacion',
      label: 'Confederación',
      type: 'select',
      value: 'CONMEBOL',
      options: [
        { value: 'UEFA', label: 'UEFA — Europa' },
        { value: 'CAF', label: 'CAF — África' },
        { value: 'AFC', label: 'AFC — Asia' },
        { value: 'CONMEBOL', label: 'CONMEBOL — Sudamérica' },
        { value: 'CONCACAF', label: 'CONCACAF — Norte, Centroamérica y Caribe' },
        { value: 'OFC', label: 'OFC — Oceanía' },
      ],
      help: 'El reparto de las 48 plazas del Mundial 2026, la primera Copa con formato ampliado.',
    },
    {
      id: 'fase',
      label: 'Hasta dónde llegó la selección',
      type: 'select',
      value: 'cuartos',
      options: [
        { value: 'grupos', label: 'Eliminada en fase de grupos' },
        { value: 'dieciseisavos', label: 'Eliminada en dieciseisavos' },
        { value: 'octavos', label: 'Eliminada en octavos' },
        { value: 'cuartos', label: 'Eliminada en cuartos' },
        { value: 'cuartoLugar', label: 'Cuarto puesto' },
        { value: 'tercero', label: 'Tercer puesto' },
        { value: 'subcampeon', label: 'Subcampeona' },
        { value: 'campeon', label: 'Campeona del mundo' },
      ],
      help: 'Define el premio que la FIFA le pagó a la federación por esa campaña.',
    },
    {
      id: 'federacion',
      label: 'Federación (cuánto reparte al plantel)',
      type: 'select',
      value: 'argentina',
      options: [
        { value: 'argentina', label: 'Argentina — AFA reparte ~65%' },
        { value: 'espana', label: 'España — RFEF reparte ~55%' },
        { value: 'brasil', label: 'Brasil — CBF reparte ~50%' },
        { value: 'francia', label: 'Francia — FFF reparte ~50%' },
        { value: 'inglaterra', label: 'Inglaterra — FA reparte ~50%' },
        { value: 'otra', label: 'Otra selección — reparto promedio ~45%' },
      ],
      help: 'El porcentaje del premio FIFA que la federación baja al plantel de 26 jugadores.',
    },
    {
      id: 'titulares',
      label: 'Partidos que jugó ese jugador de titular',
      type: 'number',
      min: 0,
      max: 8,
      step: 1,
      value: 5,
      help: 'El bonus propio de la federación se paga por partido jugado, no por la fase.',
    },
    {
      id: 'copa',
      label: 'Copa de clubes que querés mirar',
      type: 'select',
      value: 'libertadores',
      options: [
        { value: 'libertadores', label: 'Copa Libertadores (CONMEBOL)' },
        { value: 'sudamericana', label: 'Copa Sudamericana (CONMEBOL)' },
        { value: 'champions', label: 'UEFA Champions League' },
        { value: 'europa', label: 'UEFA Europa League' },
      ],
    },
    {
      id: 'paisConmebol',
      label: 'País del club (para las copas CONMEBOL)',
      type: 'select',
      value: 'argentina',
      options: [
        { value: 'argentina', label: 'Argentina' },
        { value: 'brasil', label: 'Brasil' },
        { value: 'otro', label: 'Otro país de CONMEBOL' },
      ],
    },
    {
      id: 'rankingUefa',
      label: 'Ranking UEFA del país (para las copas europeas)',
      type: 'number',
      min: 1,
      max: 55,
      step: 1,
      value: 5,
      help: '1 a 4 son España, Inglaterra, Italia y Alemania en el ciclo vigente.',
    },
    {
      id: 'posicionLiga',
      label: 'Posición final del club en su liga',
      type: 'number',
      min: 1,
      max: 25,
      step: 1,
      value: 4,
      help: '1 es el campeón de la liga local.',
    },
  ],
  fineprint:
    'Los cupos salen de los reglamentos vigentes de FIFA, CONMEBOL y UEFA. Los premios son los montos anunciados por la FIFA para el ciclo 2026 y el reparto al plantel es una estimación: cada federación negocia su propia prima con los jugadores y no la publica.',

  chart: {
    type: 'bars',
    title: 'Las 48 plazas, confederación por confederación',
    caption:
      'Cada barra es lo que le tocó a una confederación en el Mundial 2026: 16 a UEFA, 9 a CAF, 8 a AFC, 6 a CONMEBOL, 6 a CONCACAF (con los tres anfitriones adentro) y 1 a OFC. Suman 46; las 2 plazas que faltan salieron del repechaje intercontinental que jugaron seis selecciones en marzo de 2026.',
  },
  breakdownTitle: 'Los números de tu selección y de tu club',
  breakdownIntro:
    'Las primeras filas están en cupos, las del medio en dólares y la última en porcentaje. Las barras comparan cada valor con el más alto de la tabla, así que no cruces unidades para leerlas.',

  answer: {
    title: 'Qué dejó el Mundial 2026 y qué sigue vivo',
    copy:
      'Fue el primer Mundial de 48 selecciones, con 104 partidos, sede compartida entre Estados Unidos, México y Canadá, y final el 19 de julio de 2026 en el MetLife Stadium. España se quedó con el título. Lo que sigue jugándose hoy son las copas de clubes, y ahí sí conviene calcular cupos.',
    yes: [
      'El Mundial 2026 repartió 48 plazas: 16 UEFA, 9 CAF, 8 AFC, 6 CONMEBOL, 6 CONCACAF (con Estados Unidos, México y Canadá como anfitriones) y 1 OFC, más 2 del repechaje intercontinental',
      'El campeón jugó 8 partidos, no 7: el formato de 48 sumó una ronda de dieciseisavos',
      'La FIFA pagó USD 42 millones a la federación campeona y USD 9 millones a cada selección eliminada en la fase de grupos, más USD 1,5 millones de preparación para todas',
      'Lo que llega al jugador depende de cuánto reparte su federación: la AFA es de las que más baja al plantel, cerca del 65% del premio',
      'Miroslav Klose sigue siendo el máximo goleador histórico de Copas del Mundo con 16 goles',
      'Las copas de clubes 2026 están en curso: Libertadores y Sudamericana reparten 8 y 6 cupos para Argentina y Brasil, y Champions reparte hasta 5 por país en el top del ranking UEFA',
    ],
    warn: [
      'Los premios de la FIFA se pagan a la federación, no al jugador: la prima del plantel se negocia aparte y casi ninguna federación la publica',
      'CONCACAF cuenta a los tres anfitriones dentro de sus 6 plazas, así que sumó apenas 3 clasificados por cancha',
      'El repechaje intercontinental de marzo de 2026 repartió sólo 2 plazas entre 6 selecciones: no es un cupo garantizado de nadie',
      'Los cupos de Champions cambian todos los años con el coeficiente UEFA y con los dos "European Performance Spots", que se asignan por rendimiento de la temporada anterior',
      'En las ligas de CONMEBOL el cupo también depende de la copa nacional y del campeón vigente, que entran directo a la fase de grupos aunque terminen mal en su liga',
    ],
    plazo:
      'el próximo Mundial es el de 2030, en España, Portugal y Marruecos, con partidos inaugurales en Uruguay, Argentina y Paraguay por el centenario de 1930.',
  },

  faq: [
    {
      q: '¿Cuántas selecciones jugaron el Mundial 2026 y cómo se repartieron los cupos?',
      a: 'Fueron 48, contra las 32 de Qatar 2022. UEFA se llevó 16 plazas, CAF 9, AFC 8, CONMEBOL 6, CONCACAF 6 (contando a Estados Unidos, México y Canadá como anfitriones) y OFC 1, su primer cupo directo en la historia. Las 2 plazas restantes salieron de un repechaje intercontinental de seis selecciones jugado en marzo de 2026.',
    },
    {
      q: '¿Quién ganó el Mundial 2026?',
      a: 'España. La final se jugó el 19 de julio de 2026 en el MetLife Stadium de East Rutherford, Nueva Jersey, sede designada por la FIFA para el partido decisivo del torneo.',
    },
    {
      q: '¿Cuántos partidos jugó el campeón del Mundial 2026?',
      a: 'Ocho. Con 48 selecciones el torneo pasó de 64 a 104 partidos y sumó una ronda de dieciseisavos: 3 de fase de grupos más dieciseisavos, octavos, cuartos, semifinal y final. En los Mundiales de 32 el campeón jugaba 7.',
    },
    {
      q: '¿Cuánta plata pagó la FIFA por cada fase del Mundial 2026?',
      a: 'Los montos por federación fueron de USD 9 millones para las eliminadas en fase de grupos, 13 millones en dieciseisavos, 18 millones en octavos y cuartos, 27 millones para el cuarto puesto, 28 millones para el tercero, 30 millones para el subcampeón y 42 millones para el campeón. Además la FIFA pagó cerca de USD 1,5 millones a cada selección en concepto de preparación.',
    },
    {
      q: '¿Cuánto cobró de premio cada jugador del Mundial?',
      a: 'Depende de la federación: la FIFA le paga a la asociación, no al futbolista. La AFA es de las que más reparte, en torno al 65% del premio entre 26 jugadores; otras federaciones bajan entre el 45% y el 55%. A eso se le suma el bonus propio de cada federación por partido jugado. La calculadora de arriba te arma esa cuenta con los porcentajes habituales.',
    },
    {
      q: '¿Messi superó el récord de goles de Klose en el Mundial 2026?',
      a: 'No. El récord de máximo goleador histórico de Copas del Mundo sigue en poder de Miroslav Klose con 16 goles, marcados entre 2002 y 2014. Messi llegó al Mundial 2026 con 26 partidos y 13 goles en Copas del Mundo repartidos en cinco ediciones, y con su presencia en 2026 se convirtió en el primer futbolista en disputar seis Mundiales.',
    },
    {
      q: '¿Cuál fue el estadio más grande y el más complicado del Mundial 2026?',
      a: 'El Estadio Azteca de Ciudad de México fue el de mayor capacidad, con unas 83.000 localidades, y también el más exigente por sus 2.240 metros sobre el nivel del mar. El MetLife Stadium, sede de la final, tiene unas 82.500. En el otro extremo, el NRG de Houston jugó con 35 °C y humedad, aunque con techo retráctil, y el Levi\'s de Santa Clara fue el de clima más amable, con 21 °C promedio.',
    },
    {
      q: '¿Cuántos puntos hacían falta para pasar de la fase de grupos en 2026?',
      a: 'Con 4 puntos se pasaba casi siempre, porque el formato de 48 clasificaba a los dos primeros de cada grupo más los ocho mejores terceros. Con 6 puntos la clasificación era prácticamente segura y con 3 quedaba abierta, resuelta por diferencia de gol entre los terceros. Es el mismo criterio que se usó en la Eurocopa ampliada.',
    },
    {
      q: '¿Cuántos cupos a la Copa Libertadores tiene cada país?',
      a: 'Argentina y Brasil reparten 8 cupos cada uno: 6 entran directo a la fase de grupos y 2 arrancan en la fase previa. El resto de los países de CONMEBOL tiene 4, en general 1 directo para el campeón de liga y 3 a fase previa. Aparte, los campeones vigentes de Libertadores y de Sudamericana clasifican directo a la fase de grupos sin importar dónde terminen en su liga.',
    },
    {
      q: '¿Cómo se reparten los cupos de la Champions League?',
      a: 'Por el coeficiente UEFA de cada país. Los cuatro primeros del ranking tienen 4 plazas, el quinto 3 y del sexto al decimoquinto 2. A eso se suman dos "European Performance Spots" que se otorgan a los dos países con mejor rendimiento europeo de la temporada anterior, y las plazas del campeón vigente de Champions y del campeón de Europa League, que entran directo a la fase de liga de 36 equipos.',
    },
    {
      q: '¿Qué pasa si mi club queda afuera de la Libertadores?',
      a: 'Puede caer a la Copa Sudamericana. En Argentina y Brasil los cupos de Sudamericana son 6 por país y suelen tomar de la posición 9 en adelante; en el resto de CONMEBOL son 4. Además, los ocho equipos que terminan terceros en la fase de grupos de Libertadores pasan directo a los dieciseisavos de Sudamericana.',
    },
    {
      q: '¿Dónde se juega el próximo Mundial después de 2026?',
      a: 'El Mundial 2030 será tricontinental: la organización principal queda en España, Portugal y Marruecos, y los partidos inaugurales se juegan en Uruguay, Argentina y Paraguay por el centenario de la primera Copa del Mundo de 1930. El de 2034 fue adjudicado a Arabia Saudita.',
    },
  ],

  sources: [
    {
      name: 'FIFA — Mundial 2026: formato de 48 selecciones y reparto de plazas por confederación',
      url: 'https://inside.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026',
      publisher: 'FIFA',
    },
    {
      name: 'FIFA Council — asignación de plazas para la Copa Mundial 2026 y torneo de repechaje',
      url: 'https://inside.fifa.com/es/about-fifa/president/media-releases/fifa-council-approves-key-organisational-elements-of-the-fifa-world-cup-26',
      publisher: 'FIFA',
    },
    {
      name: 'CONMEBOL — Reglamento de la Copa Libertadores (cupos por asociación)',
      url: 'https://www.conmebol.com/reglamentos/',
      publisher: 'CONMEBOL',
    },
    {
      name: 'CONMEBOL — Copa Sudamericana: bases y cruce con los terceros de Libertadores',
      url: 'https://www.conmebol.com/conmebol-sudamericana/',
      publisher: 'CONMEBOL',
    },
    {
      name: 'UEFA — Country coefficients (ranking que define los cupos a Champions y Europa League)',
      url: 'https://www.uefa.com/nationalassociations/uefarankings/country/',
      publisher: 'UEFA',
    },
    {
      name: 'UEFA — Access list de la Champions League en el formato de 36 equipos',
      url: 'https://www.uefa.com/uefachampionsleague/news/',
      publisher: 'UEFA',
    },
    {
      name: 'FIFA — Estadios y sedes del Mundial 2026',
      url: 'https://inside.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/stadiums',
      publisher: 'FIFA',
    },
  ],

  replaces: [
    '/calculadora-mundial-2026-bonus-jugador-fase',
    '/calculadora-mundial-2026-predictor-campeon-ranking',
    '/calculadora-mundial-2026-estadios-comparador',
    '/calculadora-cupos-copa-libertadores-pais-conmebol',
    '/calculadora-mundial-2026-en-que-canal-pasan-el-partido-por-pais',
    '/calculadora-mundial-2026-partidos-faltantes-seleccion',
    '/calculadora-mundial-2026-record-messi-goles-minutos',
    '/calculadora-mundial-2026-cupos-confederacion',
    '/calculadora-mundial-2026-botin-oro-goleador-estimador',
    '/calculadora-mundial-2026-puntos-clasificar-octavos',
    '/calculadora-cupos-copa-sudamericana-pais-conmebol',
    '/calculadora-cupos-champions-league-coeficiente-uefa',
    '/calculadora-mundial-2026-grupo-muerte-detector',
    '/calculadora-cupos-europa-league-tercer-lugar-liga',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Reparto oficial de las 48 plazas del Mundial 2026 (FIFA Council).
 * `directos` suma 46; las 2 restantes salieron del repechaje intercontinental,
 * al que estas confederaciones mandaron `repechaje` selecciones cada una.
 */
export const CONFEDERACIONES: Record<
  string,
  { label: string; directos: number; repechaje: number; nota: string }
> = {
  UEFA: {
    label: 'UEFA',
    directos: 16,
    repechaje: 0,
    nota: 'No participó del repechaje intercontinental: resolvió sus 16 plazas con su propio playoff europeo.',
  },
  CAF: {
    label: 'CAF',
    directos: 9,
    repechaje: 1,
    nota: 'Récord histórico para África: pasó de 5 plazas en 2022 a 9 directas más una al repechaje.',
  },
  AFC: {
    label: 'AFC',
    directos: 8,
    repechaje: 1,
    nota: 'Asia duplicó su representación: de 4+1 en 2022 a 8+1 en 2026.',
  },
  CONMEBOL: {
    label: 'CONMEBOL',
    directos: 6,
    repechaje: 1,
    nota: 'Los seis primeros de las Eliminatorias entraron directo; el séptimo fue al repechaje intercontinental.',
  },
  CONCACAF: {
    label: 'CONCACAF',
    directos: 6,
    repechaje: 2,
    nota: 'Estados Unidos, México y Canadá entraron como anfitriones dentro de esas 6 plazas: por cancha clasificaron 3.',
  },
  OFC: {
    label: 'OFC',
    directos: 1,
    repechaje: 1,
    nota: 'Primer cupo directo de Oceanía en la historia de los Mundiales: hasta 2022 siempre dependió del repechaje.',
  },
};

/** Plazas totales del torneo y las que se resolvieron por repechaje. */
export const PLAZAS = { total: 48, directas: 46, repechaje: 2 };

/** Premio de la FIFA por fase alcanzada, en dólares, para la federación. */
export const PREMIO_FASE: Record<string, { usd: number; label: string }> = {
  grupos: { usd: 9_000_000, label: 'Eliminada en fase de grupos' },
  dieciseisavos: { usd: 13_000_000, label: 'Eliminada en dieciseisavos' },
  octavos: { usd: 18_000_000, label: 'Eliminada en octavos' },
  cuartos: { usd: 18_000_000, label: 'Eliminada en cuartos' },
  cuartoLugar: { usd: 27_000_000, label: 'Cuarto puesto' },
  tercero: { usd: 28_000_000, label: 'Tercer puesto' },
  subcampeon: { usd: 30_000_000, label: 'Subcampeona' },
  campeon: { usd: 42_000_000, label: 'Campeona del mundo' },
};

/** Aporte fijo de la FIFA por preparación, por selección, en dólares. */
export const BONUS_PREPARACION = 1_500_000;

/** Cuánto del premio FIFA baja cada federación al plantel. */
export const REPARTO_FEDERACION: Record<string, { pct: number; label: string }> = {
  argentina: { pct: 0.65, label: 'AFA' },
  espana: { pct: 0.55, label: 'RFEF' },
  brasil: { pct: 0.5, label: 'CBF' },
  francia: { pct: 0.5, label: 'FFF' },
  inglaterra: { pct: 0.5, label: 'FA' },
  otra: { pct: 0.45, label: 'su federación' },
};

/** Plantel del Mundial 2026 y bonus propio de federación por presencia. */
export const PLANTEL = 26;
export const BONUS_BASE_FEDERACION = 30_000;
export const BONUS_POR_TITULARIDAD = 15_000;
