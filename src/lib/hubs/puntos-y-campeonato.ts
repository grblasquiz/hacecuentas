import type { HubData } from './types';

/**
 * Hub de decisión — "¿Le alcanzan los puntos?".
 *
 * Números espejados de:
 *   src/lib/formulas/puntos-necesarios-clasificar-futbol.ts  (objetivo genérico, 3 pts por triunfo)
 *   src/lib/formulas/descenso-futbol.ts                      (tabla de promedios de la Liga Profesional)
 *   src/lib/formulas/descenso-laliga-santander.ts            (umbral histórico de salvación 38 pts)
 *   src/lib/formulas/mls-playoffs.ts                         (34 fechas, top 7 directo, 8-9 Wild Card)
 *   src/lib/formulas/f1-puntos-restantes.ts                  (GP 25 · Sprint 8, sin vuelta rápida)
 *   src/lib/formulas/motogp-puntos-restantes.ts              (GP 25 · Sprint 12)
 */

export const hub: HubData = {
  slug: 'futbol/puntos-y-campeonato',
  title: '¿Le alcanzan los puntos? — Clasificación, descenso y campeonato matemático',
  description:
    'Cuántos puntos le faltan a tu equipo para clasificar, salir campeón o salvarse: promedios del fútbol argentino, permanencia en LaLiga, playoffs de la MLS y campeonato matemático en Fórmula 1 y MotoGP.',
  silo: 'Fútbol',
  siloHref: '/futbol',

  eyebrow: 'Tablas y cuentas de campeonato',
  h1: '¿Le alcanzan los puntos a tu equipo?',
  lede:
    'Partimos de la pregunta más común de cualquier tabla: cuántos puntos faltan para llegar a un objetivo. Si tu caso es el descenso por promedios, los playoffs de la MLS o un campeonato de motor, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '3 puntos por victoria · sistemas 2026', '6 calculadoras adentro'],

  resultLabel: 'La cuenta',

  cases: {
    title: '¿Qué cuenta querés hacer?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'objetivo',
        label: 'Cuántos puntos me faltan para llegar a un objetivo',
        hint: 'Copa, título o permanencia',
        answer: 'Los puntos que faltan y las victorias mínimas que los cubren.',
        yes: [
          'Puntos que faltan para alcanzar la marca que te pusiste',
          'Victorias mínimas necesarias si el resto se pierde, y alternativa sólo con empates',
          'Promedio de puntos por partido que hay que sostener hasta el final',
        ],
        warn: [
          'Si los puntos que faltan superan los que quedan en juego, el objetivo ya es matemáticamente imposible',
          'La cuenta no contempla desempates por diferencia de gol ni por resultados entre sí',
        ],
        plazo: 'la marca cambia todas las fechas: recalculá después de cada jornada.',
      },
      {
        id: 'promedios',
        label: 'El descenso por promedios del fútbol argentino',
        hint: 'Liga Profesional',
        answer: 'El promedio se calcula sobre las últimas tres temporadas, no sobre la actual.',
        yes: [
          'Promedio actual: puntos de las últimas tres temporadas dividido los partidos jugados',
          'Puntos necesarios en lo que resta para igualar el promedio del rival directo',
          'Proyección del promedio final ganando todo, empatando todo o perdiendo todo',
        ],
        warn: [
          'Los equipos recién ascendidos sólo promedian desde su ascenso, así que su divisor es más chico y cada punto pesa más',
          'La cuenta asume que el rival directo no suma nada más: es el escenario más exigente para vos',
        ],
        plazo: 'el promedio se cierra al final de la temporada, no fecha a fecha.',
      },
      {
        id: 'laliga',
        label: 'La permanencia en LaLiga',
        hint: '38 fechas, bajan 3',
        answer: 'El umbral histórico de salvación en LaLiga ronda los 38 puntos.',
        yes: [
          'Cuántos puntos faltan para superar al 17º, el último equipo salvado',
          'Máximo alcanzable si se gana todo lo que queda, y proyección empatando todo',
          'Distancia contra el umbral histórico de permanencia',
        ],
        warn: [
          'Los 38 puntos son un promedio histórico, no una regla: hubo temporadas que se salvaron con 34 y otras que necesitaron 41',
          'Superar al 17º en puntos no alcanza si el desempate por resultados entre sí lo favorece',
        ],
        plazo: 'quedan 38 fechas en total: cada punto perdido temprano se paga en mayo.',
      },
      {
        id: 'mls',
        label: 'Los playoffs de la MLS',
        hint: 'Top 7 directo, 8-9 Wild Card',
        answer: 'En cada conferencia clasifican nueve: siete directo y dos al Wild Card.',
        yes: [
          'Puntos para entrar al top 7 y saltearse la ronda extra',
          'Puntos para llegar al puesto 9 y jugar el Wild Card',
          'Proyección de puntos al cierre de las 34 fechas con tu ritmo actual',
        ],
        warn: [
          'Las conferencias Este y Oeste se cuentan por separado: los puntos de la otra no entran en la comparación',
          'El calendario de la MLS no es del todo equilibrado, así que dos equipos con los mismos puntos pueden tener fechas distintas jugadas',
        ],
        plazo: 'la temporada regular son 34 fechas por equipo.',
      },
      {
        id: 'f1',
        label: 'El campeonato de Fórmula 1',
        hint: 'GP 25 · Sprint 8',
        answer: 'Si la ventaja supera los puntos que quedan en juego, el título ya está cerrado.',
        yes: [
          'Puntos todavía en juego: 25 por Gran Premio y 8 por Sprint',
          'Máximo teórico al que puede llegar el perseguidor',
          'Si el líder ya es campeón matemático o al título le falta apenas un punto',
        ],
        warn: [
          'Desde 2025 el punto por vuelta rápida no existe: si viste una cuenta con ese punto extra, está desactualizada',
          'La cuenta es del campeonato de pilotos; el de constructores suma los dos autos y da otro número',
        ],
        plazo: 'el título se sella en la carrera donde la ventaja supera lo que queda en juego.',
      },
      {
        id: 'motogp',
        label: 'El campeonato de MotoGP',
        hint: 'GP 25 · Sprint 12',
        answer: 'El sprint de MotoGP reparte 12 puntos, más que el de Fórmula 1.',
        yes: [
          'Puntos en juego: 25 por Gran Premio y 12 por Sprint del sábado',
          'Máximo alcanzable por el perseguidor si gana todo',
          'Si el líder ya es campeón matemático',
        ],
        warn: [
          'El sprint de MotoGP vale 12 puntos al ganador, no 8 como en Fórmula 1: usar el reparto equivocado cambia toda la cuenta',
          'Cada fin de semana con sprint reparte 37 puntos al ganador absoluto, así que las ventajas se pueden dar vuelta rápido',
        ],
        plazo: 'el título se cierra cuando la ventaja supera los puntos restantes.',
      },
    ],
  },

  inputsTitle: 'Cargá los números de la tabla',
  inputsIntro: 'Los campos que no aplican a tu caso se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    { id: 'puntos', label: 'Puntos actuales de tu equipo o piloto', type: 'number', min: 0, value: 34 },
    { id: 'restantes', label: 'Partidos o fechas que quedan', type: 'number', min: 0, value: 8 },
    { id: 'objetivo', label: 'Puntos objetivo (copa, título o salvación)', type: 'number', min: 0, value: 52 },
    { id: 'puntosRival', label: 'Puntos del rival directo (17º, 7º, 9º o piloto perseguidor)', type: 'number', min: 0, value: 40 },
    { id: 'puntosNoveno', label: 'Puntos del 9º de conferencia (sólo MLS)', type: 'number', min: 0, value: 33 },
    { id: 'promedioRival', label: 'Promedio del rival directo (sólo promedios)', type: 'number', min: 0, max: 3, step: 0.001, value: 1.05 },
    { id: 'puntosT1', label: 'Puntos de la temporada más vieja', type: 'number', min: 0, value: 38 },
    { id: 'partidosT1', label: 'Partidos de la temporada más vieja', type: 'number', min: 0, value: 38 },
    { id: 'puntosT2', label: 'Puntos de la temporada anterior', type: 'number', min: 0, value: 40 },
    { id: 'partidosT2', label: 'Partidos de la temporada anterior', type: 'number', min: 0, value: 38 },
    { id: 'partidosT3', label: 'Partidos jugados esta temporada', type: 'number', min: 0, value: 22 },
    { id: 'gps', label: 'Grandes Premios que quedan', type: 'number', min: 0, value: 6 },
    { id: 'sprints', label: 'Sprints que quedan', type: 'number', min: 0, value: 3 },
  ],
  fineprint:
    'Cuenta aritmética sobre los datos que cargás. No contempla desempates por diferencia de gol, resultados entre sí, quitas de puntos ni sanciones deportivas.',

  chart: {
    type: 'bars',
    title: 'Lo que tenés, lo que falta y lo que hay en juego',
    caption:
      'La primera barra son los puntos que ya sumaste, la segunda lo que falta para el objetivo y la tercera todo lo que todavía se puede sumar. Si la barra del medio supera a la de la derecha, la cuenta ya no da.',
  },
  breakdownTitle: 'El detalle de la cuenta',
  breakdownIntro: 'Cada fila muestra un componente del cálculo y el criterio que lo define.',

  faq: [
    {
      q: '¿Cómo se calcula el promedio del descenso en el fútbol argentino?',
      a: 'Se suman los puntos de las últimas tres temporadas y se dividen por los partidos jugados en ese período. No es el rendimiento del año: un equipo puede tener una gran temporada y descender igual si arrastra dos malas.',
    },
    {
      q: '¿Cómo promedian los equipos recién ascendidos?',
      a: 'Sólo con las temporadas jugadas desde su ascenso. Como el divisor es más chico, cada punto pesa más y el promedio se mueve mucho más rápido, para bien y para mal.',
    },
    {
      q: '¿Cuántos puntos hacen falta para salvarse en LaLiga?',
      a: 'El umbral histórico de referencia son 38 puntos en 38 fechas, es decir un punto por partido. Es un promedio: hubo temporadas que se salvaron con 34 y otras en las que 40 no alcanzaron.',
    },
    {
      q: '¿Cuántos equipos descienden de LaLiga?',
      a: 'Tres: los que terminan 18º, 19º y 20º de una tabla de 20 equipos. El 17º es el último salvado, y por eso es el rival contra el que se mide la cuenta de la permanencia.',
    },
    {
      q: '¿Cuántos equipos clasifican a los playoffs de la MLS?',
      a: 'Nueve por conferencia. Los siete primeros pasan directo a la primera ronda y los puestos 8 y 9 juegan un Wild Card por el último lugar. La temporada regular es de 34 fechas.',
    },
    {
      q: '¿Cuántos puntos reparte un Gran Premio de Fórmula 1?',
      a: 'Veinticinco al ganador, con reparto descendente hasta el décimo. El sprint suma 8 al ganador. Desde 2025 no existe el punto extra por vuelta rápida, que estuvo vigente entre 2019 y 2024.',
    },
    {
      q: '¿Cuándo un piloto es campeón matemático?',
      a: 'Cuando su ventaja sobre el perseguidor supera todos los puntos que quedan en juego. Si la ventaja iguala exactamente ese máximo, le alcanza con sumar un punto más para cerrarlo.',
    },
    {
      q: '¿Cuánto vale el sprint en MotoGP?',
      a: 'Doce puntos al ganador, frente a los 8 de Fórmula 1. Sumado a los 25 del Gran Premio, un fin de semana perfecto en MotoGP vale 37 puntos, lo que permite remontadas más rápidas.',
    },
    {
      q: '¿Alcanza con empatar todos los partidos que quedan?',
      a: 'Sólo si los puntos que faltan son menos o iguales que la cantidad de partidos restantes, porque cada empate suma uno. Si faltan más puntos que partidos, hacen falta victorias sí o sí.',
    },
    {
      q: '¿Qué pasa si dos equipos terminan con los mismos puntos?',
      a: 'Depende del reglamento de cada liga: algunas desempatan por diferencia de gol, otras por los resultados entre sí y otras por partidos ganados. La cuenta de puntos no resuelve esos criterios.',
    },
    {
      q: '¿Cuántos puntos por partido necesito de promedio?',
      a: 'Es la división entre los puntos que faltan y los partidos restantes. Por encima de 2,5 por partido el ritmo es muy exigente, y por debajo de 1 el objetivo suele estar al alcance sin resultados extraordinarios.',
    },
    {
      q: '¿La cuenta contempla quitas de puntos o sanciones?',
      a: 'No. Si tu equipo tiene una quita administrativa o una sanción deportiva, restala de los puntos actuales antes de cargar el dato.',
    },
  ],

  sources: [
    {
      name: 'Reglamento de la Liga Profesional de Fútbol — sistema de promedios y descensos',
      url: 'https://www.afa.com.ar/es/posts/reglamentos',
      publisher: 'Asociación del Fútbol Argentino',
    },
    {
      name: 'Reglamento General de LaLiga — clasificación y descensos',
      url: 'https://www.laliga.com/transparencia/normativa',
      publisher: 'LaLiga',
    },
    {
      name: 'MLS Competition Guidelines — formato de temporada regular y playoffs',
      url: 'https://www.mlssoccer.com/about/mls-competition-guidelines',
      publisher: 'Major League Soccer',
    },
    {
      name: 'FIA Formula One Sporting Regulations — reparto de puntos',
      url: 'https://www.fia.com/regulation/category/110',
      publisher: 'Fédération Internationale de l’Automobile',
    },
    {
      name: 'FIM Grand Prix World Championship Regulations — reparto de puntos y sprint',
      url: 'https://www.fim-moto.com/en/regulations',
      publisher: 'Fédération Internationale de Motocyclisme',
    },
  ],

  replaces: [
    '/calculadora-puntos-necesarios-clasificar-futbol',
    '/calculadora-descenso-futbol-argentino-promedios',
    '/calculadora-descenso-laliga-santander-puntos-necesarios',
    '/calculadora-mls-playoffs-east-west-conference',
    '/calculadora-f1-puntos-campeonato-mundial-quedan',
    '/calculadora-motogp-puntos-campeonato-restantes',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Reparto de puntos por categoría de motor — espejo de f1/motogp-puntos-restantes.ts */
export const MOTOR = {
  f1: { gp: 25, sprint: 8, nombre: 'Fórmula 1' },
  motogp: { gp: 25, sprint: 12, nombre: 'MotoGP' },
};

/** Umbral histórico de salvación en LaLiga — espejo de descenso-laliga-santander.ts */
export const LALIGA_SAFETY = 38;

/** Fechas de la temporada regular de la MLS — espejo de mls-playoffs.ts */
export const MLS_FECHAS = 34;
