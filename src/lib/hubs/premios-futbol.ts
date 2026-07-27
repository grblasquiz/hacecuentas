import type { HubData } from './types';

export const hub: HubData = {
  slug: 'futbol/premios',
  title: '¿Cuánto se lleva de premio cada equipo? — Mundial, Copa Argentina y Liga',
  description:
    'Cuánto pagó la FIFA por cada fase del Mundial 2026, cuánto reparte la Copa Argentina ronda por ronda, cuánto embolsa un plantel de la Liga Profesional, cuánto vale una cláusula de rescisión y cuánto le toca al club formador por el mecanismo de solidaridad.',
  silo: 'Fútbol',
  siloHref: '/futbol',

  eyebrow: 'La plata del fútbol',
  h1: '¿Cuánto se lleva de premio cada equipo?',
  lede:
    'Arrancamos por el premio más buscado: lo que la FIFA le pagó a cada selección del Mundial 2026 según hasta dónde llegó. Si lo que querés mirar es la Copa Argentina, la Liga Profesional, una cláusula de rescisión o el 5% que le toca al club formador, lo cambiás abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    'Mundial 2026 ya jugado: bolsa de premios de USD 871 millones',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Premio estimado',

  cases: {
    title: '¿De qué premio estamos hablando?',
    intro: 'Partimos por el Mundial, que es lo más buscado. Si tu caso es otro, cambialo.',
    items: [
      {
        id: 'mundial',
        label: 'El Mundial 2026',
        hint: 'Premio FIFA por fase',
        answer: 'La FIFA le pagó USD 50 millones a la selección campeona.',
        yes: [
          'Premio por rendimiento según la fase alcanzada: 9 millones de dólares para las eliminadas en grupos y 50 millones para la campeona',
          'Más 12,5 millones fijos de clasificación y preparación que cobraron las 48 selecciones por igual',
          'La plata entra a la federación, no al plantel: el reparto interno con los jugadores es un acuerdo aparte de cada asociación',
        ],
        warn: [
          'La bolsa de premios por rendimiento fue de USD 655 millones y el reparto total de la FIFA llegó a USD 871 millones. El resto son fondos de clasificación, preparación y el programa de beneficios a los clubes',
          'Los montos están en dólares y son los que publicó la FIFA para la edición 2026: no sirven para comparar peso a peso con Qatar 2022, donde el campeón cobró 42 millones',
        ],
        plazo: 'el Mundial se jugó del 11 de junio al 19 de julio de 2026 y lo ganó España.',
      },
      {
        id: 'copa-argentina',
        label: 'La Copa Argentina',
        hint: 'Premios acumulados por ronda',
        answer: 'En la Copa Argentina los premios se acumulan ronda por ronda.',
        yes: [
          'Cada ronda superada suma su propio premio: no cobrás sólo el de la instancia final',
          'Los equipos de primera entran directo en 16avos, así que se pierden el premio de 32avos',
          'El campeón se lleva además el cupo a la Copa Libertadores, que vale más que el premio en sí',
        ],
        warn: [
          'Los montos son de referencia y los actualiza la AFA torneo a torneo: con la inflación argentina envejecen rápido',
          'El premio va al club, no al plantel. Lo que cobran los jugadores sale de un acuerdo interno que suele rondar un porcentaje de la bolsa',
        ],
        plazo: 'el cupo a la Libertadores es lo que realmente define el negocio de la copa.',
      },
      {
        id: 'liga',
        label: 'La bolsa del plantel en la Liga',
        hint: 'Victorias, empates y título',
        answer: 'La bolsa del plantel se arma con premios por resultado más el bono de título.',
        yes: [
          'Un premio pactado por partido ganado y otro, más chico, por empate',
          'Un bono aparte si el equipo sale campeón o subcampeón del torneo',
          'El total se divide entre los jugadores del plantel según el acuerdo interno de cada club',
        ],
        warn: [
          'Los premios por partido los pacta cada club con su plantel: los valores de referencia varían muchísimo entre un grande y un equipo del fondo de la tabla',
          'El reparto por jugador casi nunca es parejo: los titulares y los referentes cobran una porción mayor',
        ],
        plazo: 'los premios por resultado se pactan antes de que arranque el torneo, no después.',
      },
      {
        id: 'derechos-tv',
        label: 'De dónde sale la plata: los derechos de TV',
        hint: 'Costo por país y por partido',
        answer: 'Los derechos de TV son la fuente que financia los premios.',
        yes: [
          'Lo que paga por año el conjunto de canales de cada país por transmitir el Mundial',
          'Repartido entre los 104 partidos del torneo y entre la población del país',
          'Un multiplicador según si la transmisión es en aire, cable, streaming o combinada',
        ],
        warn: [
          'Son estimaciones de mercado a partir de informes públicos: la FIFA no publica el detalle contrato por contrato',
          'Los montos están en la moneda de cada mercado, así que no se comparan de forma directa entre países',
        ],
        plazo: 'los contratos de derechos se cierran por ciclo mundialista completo, no por torneo.',
      },
      {
        id: 'clausula',
        label: 'La cláusula de rescisión de un jugador',
        hint: 'Múltiplo del valor de mercado',
        answer: 'La cláusula se fija como un múltiplo del valor de mercado.',
        yes: [
          'Un multiplicador sobre el valor de mercado según el peso del jugador en el plantel',
          'Ajustado por los años de contrato que le quedan: cuanto menos contrato, más baja la cláusula',
          'Devuelve un rango y un valor recomendado en el medio de ese rango',
        ],
        warn: [
          'Es una estimación de mercado, no un valor legal: la cláusula real es la que figura escrita en el contrato',
          'En España la cláusula es de pago obligatorio; en la mayoría de las ligas es apenas un piso de negociación entre clubes',
        ],
        plazo: 'con menos de dos años de contrato conviene renovar antes de intentar subir la cláusula.',
      },
      {
        id: 'solidaridad',
        label: 'Lo que le toca al club formador',
        hint: 'Mecanismo de solidaridad FIFA',
        answer: 'El 5% de cada transferencia vuelve a los clubes que formaron al jugador.',
        yes: [
          'Se retiene el 5% del monto de la transferencia y se reparte entre los clubes formadores',
          '0,25% del total por cada año entre los 12 y los 15 años del jugador',
          '0,5% del total por cada año entre los 16 y los 23 años',
        ],
        warn: [
          'Se aplica sólo a transferencias internacionales de jugadores con contrato vigente, no a los pases libres ni a los movimientos dentro del mismo país',
          'Lo que el club formador no reclama en plazo se lo queda el club vendedor: hay que iniciar el reclamo ante la FIFA',
        ],
        plazo: 'el club comprador tiene 30 días desde la inscripción para pagar el mecanismo de solidaridad.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada caso usa los campos que le sirven y deja el resto quieto. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'fase',
      label: 'Mundial 2026: hasta dónde llegó la selección',
      type: 'select',
      value: 'campeon',
      options: [
        { value: 'grupos', label: 'Eliminada en fase de grupos' },
        { value: 'r32', label: 'Eliminada en dieciseisavos' },
        { value: 'r16', label: 'Eliminada en octavos' },
        { value: 'cuartos', label: 'Eliminada en cuartos de final' },
        { value: 'cuarto', label: 'Cuarto puesto' },
        { value: 'tercero', label: 'Tercer puesto' },
        { value: 'subcampeon', label: 'Subcampeona' },
        { value: 'campeon', label: 'Campeona del mundo' },
      ],
    },
    {
      id: 'ronda',
      label: 'Copa Argentina: ronda alcanzada',
      type: 'select',
      value: 'cuartos',
      options: [
        { value: 't32', label: '32avos de final' },
        { value: 't16', label: '16avos de final' },
        { value: 't8', label: '8vos de final' },
        { value: 'cuartos', label: 'Cuartos de final' },
        { value: 'semifinal', label: 'Semifinal' },
        { value: 'final', label: 'Final (subcampeón)' },
        { value: 'campeon', label: 'Campeón' },
      ],
    },
    {
      id: 'entro',
      label: 'Copa Argentina: en qué ronda entró el equipo',
      type: 'select',
      value: 't16',
      options: [
        { value: 't32', label: '32avos (equipos del ascenso y regionales)' },
        { value: 't16', label: '16avos (equipos de primera división)' },
      ],
    },
    { id: 'ganados', label: 'Liga Profesional: partidos ganados', type: 'number', min: 0, max: 60, value: 12 },
    { id: 'empatados', label: 'Liga Profesional: partidos empatados', type: 'number', min: 0, max: 60, value: 6 },
    {
      id: 'titulo',
      label: 'Liga Profesional: ¿salió campeón?',
      type: 'select',
      value: 'ninguno',
      options: [
        { value: 'ninguno', label: 'No, terminó en el medio de la tabla' },
        { value: 'subcampeon', label: 'Subcampeón' },
        { value: 'campeon', label: 'Campeón del torneo' },
      ],
    },
    { id: 'plantel', label: 'Jugadores del plantel entre los que se reparte', type: 'number', min: 1, max: 60, value: 30 },
    {
      id: 'pais',
      label: 'Derechos de TV: país',
      type: 'select',
      value: 'ar',
      options: [
        { value: 'ar', label: 'Argentina' },
        { value: 'es', label: 'España' },
        { value: 'mx', label: 'México' },
        { value: 'br', label: 'Brasil' },
        { value: 'us', label: 'Estados Unidos' },
        { value: 'uk', label: 'Reino Unido' },
        { value: 'de', label: 'Alemania' },
        { value: 'fr', label: 'Francia' },
        { value: 'it', label: 'Italia' },
      ],
    },
    {
      id: 'monto',
      label: 'Valor de mercado o monto de la transferencia',
      prefix: '€',
      value: '45.000.000',
      thousands: true,
      help: 'Se usa como valor de mercado para la cláusula de rescisión y como monto de la transferencia para el mecanismo de solidaridad.',
    },
    {
      id: 'nivel',
      label: 'Peso del jugador en el plantel',
      type: 'select',
      value: 'estrella',
      options: [
        { value: 'estandar', label: 'Estándar — rotación' },
        { value: 'titular-clave', label: 'Titular clave' },
        { value: 'estrella', label: 'Estrella del equipo' },
        { value: 'galactico', label: 'Intransferible' },
      ],
    },
    { id: 'anosContrato', label: 'Años de contrato que le quedan', type: 'number', min: 1, max: 8, value: 4 },
    { id: 'anosFormado', label: 'Años que el club lo formó (entre los 12 y los 23)', type: 'number', min: 0, max: 12, value: 6 },
  ],
  fineprint:
    'Los premios del Mundial son los que publicó la FIFA para 2026. Los montos de la Copa Argentina, de la Liga Profesional y de los derechos de televisión son estimaciones de referencia a partir de información pública, no cifras oficiales publicadas contrato por contrato.',

  chart: {
    type: 'donut',
    title: 'Cómo se compone el premio',
    caption:
      'El gráfico parte el número en las piezas que lo explican: cuánto es premio por rendimiento y cuánto es dinero fijo, cuánto viene de rondas anteriores y cuánto de la instancia alcanzada, o qué porción del pool se lleva cada tramo de edad.',
  },
  breakdownTitle: 'De dónde sale la plata',
  breakdownIntro: 'Las barras comparan cada renglón con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánto se llevó el campeón del Mundial 2026?',
      a: 'La selección campeona cobró USD 50 millones de premio por rendimiento, el monto más alto de la historia de los Mundiales y prácticamente el doble de lo que se pagaba antes. Sumando los USD 12,5 millones fijos de clasificación y preparación que cobraron las 48 participantes, el ingreso total de la federación campeona superó los USD 62 millones. El torneo lo ganó España el 19 de julio de 2026.',
    },
    {
      q: '¿Cuál fue el reparto completo de premios del Mundial 2026?',
      a: 'Por rendimiento: USD 50 millones para la campeona, 33 para la subcampeona, 29 para el tercer puesto, 27 para el cuarto, 19 millones para cada eliminada en cuartos, 15 para cada eliminada en octavos, 11 para cada eliminada en dieciseisavos y 9 millones para cada una de las 16 selecciones que se quedaron en la fase de grupos. Eso suma USD 655 millones. A eso se agregan los fondos fijos de clasificación y preparación, y el reparto total de la FIFA para la edición trepó a USD 871 millones.',
    },
    {
      q: '¿Por qué en algunos lados figura que el campeón cobró 42 millones?',
      a: 'Porque 42 millones de dólares es lo que cobró el campeón en Qatar 2022, cuando la bolsa total era de USD 440 millones y jugaban 32 selecciones. Para 2026, con 48 selecciones y un reparto total de USD 871 millones, la FIFA prácticamente duplicó el premio del campeón y lo llevó a 50 millones. Si viste el número viejo, corresponde al Mundial anterior.',
    },
    {
      q: '¿La plata del Mundial va a los jugadores?',
      a: 'No de forma directa. La FIFA le paga a la federación nacional, y cada federación acuerda con su plantel qué porcentaje se reparte entre jugadores y cuerpo técnico. Ese acuerdo varía mucho: hay asociaciones que reparten alrededor de la mitad del premio y otras que retienen bastante más para financiar selecciones juveniles, femeninas e infraestructura.',
    },
    {
      q: '¿Cómo se acumulan los premios de la Copa Argentina?',
      a: 'Sumando ronda por ronda. Un semifinalista cobra el premio de todas las instancias que superó, no sólo el de la semifinal. La diferencia importante es dónde entra cada equipo: los de primera división arrancan en 16avos, así que nunca cobran el premio de 32avos, mientras que los del ascenso y los regionales sí lo suman al recorrido.',
    },
    {
      q: '¿Qué vale más en la Copa Argentina: el premio o el cupo a la Libertadores?',
      a: 'El cupo, con diferencia. El campeón de la Copa Argentina clasifica a la fase de grupos de la Copa Libertadores, y sólo por participar en esa fase un club cobra un monto en dólares que supera holgadamente al premio en pesos del torneo local, sin contar la recaudación de los partidos de local ni el valor de mercado que ganan sus jugadores.',
    },
    {
      q: '¿Cómo se arma la bolsa de premios de un plantel en la Liga Profesional?',
      a: 'Con tres piezas: un premio pactado por cada partido ganado, uno más chico por cada empate y un bono aparte si el equipo sale campeón o subcampeón. La suma es la bolsa del plantel y se divide entre los jugadores según el acuerdo interno de cada club, que casi nunca es un reparto parejo: los titulares y los referentes se llevan una porción mayor.',
    },
    {
      q: '¿Cómo se calcula una cláusula de rescisión?',
      a: 'Se toma el valor de mercado del jugador y se lo multiplica por un factor que depende de su peso en el plantel: entre 1,2 y 1,8 veces para un jugador de rotación, entre 1,5 y 2,5 para un titular clave, entre 2 y 3 para una estrella y entre 3 y 5 para un intransferible. Después se ajusta a la baja por los años de contrato que quedan, porque un jugador con un año por delante pierde poder de negociación para el club.',
    },
    {
      q: '¿La cláusula de rescisión obliga al club a vender?',
      a: 'Depende del país. En España la cláusula es de depósito obligatorio: si alguien la paga, el jugador queda libre para firmar en otro lado y el club vendedor no puede oponerse. En la mayoría de las otras ligas, incluida la argentina, la cláusula funciona más como un piso de negociación entre clubes que como un mecanismo automático.',
    },
    {
      q: '¿Qué es el mecanismo de solidaridad de la FIFA?',
      a: 'Es el 5% de cada transferencia internacional que se retiene y se reparte entre todos los clubes que formaron al jugador entre sus 12 y sus 23 años. El reparto no es parejo: cada año entre los 12 y los 15 vale 0,25% del monto de la transferencia y cada año entre los 16 y los 23 vale 0,5%. Es la forma que tiene la FIFA de que la plata de los pases grandes llegue a los clubes de formación.',
    },
    {
      q: '¿En qué se diferencia el mecanismo de solidaridad de la indemnización por formación?',
      a: 'La indemnización por formación se paga una sola vez, cuando el jugador firma su primer contrato profesional o se transfiere antes de cumplir 23 años, y cubre el costo de haberlo formado. El mecanismo de solidaridad, en cambio, se activa en cada transferencia internacional posterior mientras el jugador tenga contrato vigente, sin límite de edad ni de cantidad de pases.',
    },
    {
      q: '¿Cuánto cuestan los derechos de televisión del Mundial?',
      a: 'Depende del tamaño del mercado. En Argentina el paquete ronda los 120 millones de dólares anuales; en México y Brasil está bastante por encima, y en Estados Unidos —el mercado más caro, ahora también anfitrión— supera los mil millones. Repartido entre los 104 partidos que tuvo el formato de 48 selecciones, da el costo por partido, que es la unidad con la que los canales miden si el negocio cierra.',
    },
  ],

  sources: [
    {
      name: 'Reparto económico del FIFA World Cup 26 — premios por fase y fondos de preparación',
      url: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026',
      publisher: 'FIFA',
      date: '2026',
    },
    {
      name: 'FIFA World Cup 2026 winners’ prize money doubles to $50m',
      url: 'https://www.aljazeera.com/sports/2025/12/17/fifa-world-cup-2026-winners-prize-money-doubles-to-50m',
      publisher: 'Al Jazeera',
      date: '17-12-2025',
    },
    {
      name: '2026 FIFA World Cup Prize Money: Full Payout Breakdown for Every Team',
      url: 'https://www.si.com/onsi/athlete-lifestyle/2026-fifa-world-cup-prize-money-full-payout-breakdown-every-team',
      publisher: 'Sports Illustrated',
      date: '2026',
    },
    {
      name: 'Reglamento sobre el Estatuto y la Transferencia de Jugadores — anexo 5, mecanismo de solidaridad',
      url: 'https://www.fifa.com/es/legal/football-regulatory/regulations',
      publisher: 'FIFA',
    },
    {
      name: 'Copa Argentina — reglamento y premios por ronda',
      url: 'https://www.copaargentina.org/',
      publisher: 'Copa Argentina S.A.',
    },
    {
      name: 'Liga Profesional de Fútbol — torneos y clubes',
      url: 'https://www.ligaprofesional.ar/',
      publisher: 'AFA · Liga Profesional de Fútbol',
    },
  ],

  replaces: [
    '/calculadora-premios-mundial-2026-seleccion-por-fase',
    '/calculadora-derechos-tv-mundial-2026-argentina-espana-mexico-brasil',
    '/calculadora-premios-copa-argentina-por-ronda',
    '/calculadora-cuota-socio-club-futbol-boca-river-real-madrid',
    '/calculadora-premios-liga-profesional-argentina-ronda-campeon',
    '/calculadora-mecanismo-solidaridad-fifa-5-porciento',
    '/calculadora-clausula-rescision-valor-mercado-jugador',
    '/calculadora-costo-salida-cancha-argentina',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Premio por rendimiento de la FIFA en el Mundial 2026, en dólares.
 * Suman USD 655 millones sobre las 48 selecciones (4 puestos individuales +
 * 4 cuartofinalistas + 8 octavos + 16 dieciseisavos + 16 en grupos).
 */
export const PREMIO_MUNDIAL_2026: Record<string, number> = {
  grupos: 9_000_000,
  r32: 11_000_000,
  r16: 15_000_000,
  cuartos: 19_000_000,
  cuarto: 27_000_000,
  tercero: 29_000_000,
  subcampeon: 33_000_000,
  campeon: 50_000_000,
};

export const LABEL_MUNDIAL_2026: Record<string, string> = {
  grupos: 'eliminada en fase de grupos',
  r32: 'eliminada en dieciseisavos',
  r16: 'eliminada en octavos',
  cuartos: 'eliminada en cuartos de final',
  cuarto: 'cuarto puesto',
  tercero: 'tercer puesto',
  subcampeon: 'subcampeona',
  campeon: 'campeona del mundo',
};

/** Fondos fijos que cobraron las 48 selecciones: clasificación + preparación. */
export const FIJO_CLASIFICACION = 10_000_000;
export const FIJO_PREPARACION = 2_500_000;

/** Premios de referencia de la Copa Argentina por ronda, en pesos. Se acumulan. */
export const PREMIO_COPA_ARGENTINA: Record<string, number> = {
  t32: 30_000_000,
  t16: 50_000_000,
  t8: 80_000_000,
  cuartos: 120_000_000,
  semifinal: 200_000_000,
  final: 350_000_000,
  campeon: 600_000_000,
};

export const ORDEN_COPA_ARGENTINA = ['t32', 't16', 't8', 'cuartos', 'semifinal', 'final', 'campeon'];

export const LABEL_COPA_ARGENTINA: Record<string, string> = {
  t32: '32avos de final',
  t16: '16avos de final',
  t8: '8vos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final (subcampeón)',
  campeon: 'Campeón',
};

/** Valores de referencia de la Liga Profesional, en pesos. */
export const LPF_VICTORIA = 25_000_000;
export const LPF_EMPATE = 8_000_000;
export const LPF_CAMPEON = 1_000_000_000;
export const LPF_SUBCAMPEON = 350_000_000;

/** Derechos de TV del ciclo mundialista por país (monto anual en la moneda del mercado). */
export const DERECHOS_TV: Record<string, { pais: string; moneda: string; anual: number; poblMill: number }> = {
  ar: { pais: 'Argentina', moneda: 'USD', anual: 120_000_000, poblMill: 46 },
  es: { pais: 'España', moneda: 'EUR', anual: 180_000_000, poblMill: 48 },
  mx: { pais: 'México', moneda: 'USD', anual: 250_000_000, poblMill: 130 },
  br: { pais: 'Brasil', moneda: 'BRL', anual: 280_000_000, poblMill: 215 },
  us: { pais: 'Estados Unidos', moneda: 'USD', anual: 1_000_000_000, poblMill: 335 },
  uk: { pais: 'Reino Unido', moneda: 'GBP', anual: 210_000_000, poblMill: 67 },
  de: { pais: 'Alemania', moneda: 'EUR', anual: 240_000_000, poblMill: 84 },
  fr: { pais: 'Francia', moneda: 'EUR', anual: 220_000_000, poblMill: 68 },
  it: { pais: 'Italia', moneda: 'EUR', anual: 170_000_000, poblMill: 59 },
};

/** Partidos que tuvo el Mundial 2026 con 48 selecciones. */
export const PARTIDOS_MUNDIAL_2026 = 104;

/** Multiplicadores de cláusula de rescisión sobre el valor de mercado. */
export const NIVELES_CLAUSULA: Record<string, { label: string; min: number; max: number }> = {
  estandar: { label: 'Estándar (rotación)', min: 1.2, max: 1.8 },
  'titular-clave': { label: 'Titular clave', min: 1.5, max: 2.5 },
  estrella: { label: 'Estrella del equipo', min: 2.0, max: 3.0 },
  galactico: { label: 'Intransferible', min: 3.0, max: 5.0 },
};

/** Porcentaje del monto de la transferencia por año formado, según tramo de edad. */
export const SOLIDARIDAD_PCT_12_15 = 0.25;
export const SOLIDARIDAD_PCT_16_23 = 0.5;
export const SOLIDARIDAD_POOL_PCT = 5;
