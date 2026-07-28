import type { HubData } from '../types';

/**
 * Hub EN — "Where do I stand in the standings?"
 *
 * Absorbe 4 calculadoras sueltas: cambio de rating Elo tras un partido, reparto del
 * presupuesto de un draft de subasta de fantasy football, promedio de puntos por
 * partido y riesgo de descenso en rugby, y benchmark de tiempo de Fran en CrossFit.
 *
 * El gráfico es 'scale': las cuatro ramas devuelven una posición 0-100 legítima
 * (probabilidad Elo, presupuesto gastado en titulares, promedio contra el techo de la
 * tabla, percentil dentro de las bandas de Fran).
 */

/** Elo: la escala de 400 puntos es la constante clásica de Arpad Elo. */
export const ELO_SCALE = 400;
/** Factores K habituales por contexto competitivo. */
export const ELO_K_PRESETS: Record<string, number> = { chess: 20, club: 32, fifa: 40, junior: 40 };

/** Repartos del presupuesto de titulares por estrategia de subasta, en % del total de titulares. */
export const AUCTION_SPLITS: Record<string, { qb: number; rb: number; wr: number; te: number; dst: number; k: number }> = {
  balanced: { qb: 8, rb: 38, wr: 38, te: 10, dst: 3, k: 3 },
  rb_heavy: { qb: 6, rb: 52, wr: 28, te: 8, dst: 3, k: 3 },
  zero_rb: { qb: 8, rb: 18, wr: 56, te: 12, dst: 3, k: 3 },
  stars_scrubs: { qb: 5, rb: 45, wr: 40, te: 4, dst: 3, k: 3 },
};

export const AUCTION_LABELS: Record<string, string> = {
  balanced: 'Balanced',
  rb_heavy: 'RB-heavy (Hero RB)',
  zero_rb: 'Zero RB (WR-heavy)',
  stars_scrubs: 'Stars and Scrubs',
};

/** Bandas de promedio de puntos por partido en una liga de rugby con descenso. */
export const RUGBY_BANDS: Array<{ min: number; label: string; risk: string }> = [
  { min: 3, label: 'Qualifies for the Gold Cup', risk: 'None' },
  { min: 2.2, label: 'Comfortably safe', risk: 'Low' },
  { min: 1.8, label: 'Risk zone', risk: 'Medium' },
  { min: 0, label: 'Likely relegation', risk: 'High' },
];
/** Promedio que hace falta para salir de la zona de peligro. */
export const RUGBY_SAFETY_PPG = 2.2;

/** Bandas de tiempo del benchmark Fran (21-15-9 Rx), en segundos. */
export const FRAN_BANDS: Array<{ under: number; label: string; ref: string }> = [
  { under: 150, label: 'Elite', ref: 'under 2:30' },
  { under: 240, label: 'Advanced', ref: 'under 4:00' },
  { under: 360, label: 'Intermediate', ref: 'under 6:00' },
  { under: 480, label: 'Beginner', ref: '6 to 8 minutes' },
  { under: 5400, label: 'Just starting', ref: 'over 8 minutes' },
];
/** Cargas Rx de Fran, en libras (CrossFit HQ). */
export const FRAN_LOAD_LB = { men: 95, women: 65 };
/** Repeticiones totales de Fran: 21-15-9 de thruster y de pull-up. */
export const FRAN_TOTAL_REPS = 90;

const DISCLAIMER =
  'General estimate. Adapt loads and goals to your condition; consult a qualified professional for pain, injury, or health risk.';

export const hub: HubData = {
  slug: 'en/fitness/competition-and-rankings',
  title: 'Elo Rating, Points Per Game, Auction Budget and Fran Time Calculator',
  description:
    'Work out where you stand: how many Elo points a result moves you and what the odds were, whether your points-per-game average is safe from relegation, how to split a fantasy football auction budget, and what your Fran time says about your level.',
  silo: 'Fitness & Sports',
  siloHref: '/en/fitness',
  locale: 'en',

  eyebrow: 'Competition',
  h1: 'Where do I stand in the standings?',
  lede:
    'Competition turns performance into a number, and the number is rarely the one you expected. See exactly how many Elo points a win was worth and what the odds said beforehand, whether your points-per-game average clears the relegation line, how a fixed auction budget should be split across positions, and where a Fran time sits against the benchmarks.',
  stamps: [
    'Elo with the original 400-point scale and a selectable K',
    'Points per game against real relegation and qualification lines',
    'Auction budgets in dollars, Fran loads in pounds',
    'Replaces 4 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which standing are you checking?',
    intro:
      'Pick the competition you are in. Only the fields that case needs are read — the rest are ignored.',
    items: [
      {
        id: 'elo',
        label: 'What this result did to my Elo rating',
        hint: 'Expected score from the rating gap, points gained or lost, and the new rating.',
        yes: [
          'Expected win probability before the game',
          'Points gained or lost from the result',
          'Your new rating',
          'What the same result would be worth at a different K',
        ],
        warn: [
          'Elo is zero-sum. Every point you gain is a point your opponent loses, so a rating pool only inflates if new players enter it with an inflated starting rating.',
          'The K factor decides how twitchy the rating is. A high K reacts fast but overreacts to a single bad day; a low K is stable but slow to recognise genuine improvement. Federations use a lower K for established and higher-rated players for exactly this reason.',
          'A rating is only meaningful inside its own pool. A 1,800 in one federation, one club or one online platform is not a 1,800 anywhere else, and comparing across pools is the most common way people misread the number.',
        ],
        plazo: 'Ratings need volume to mean anything. Under about 20 to 30 games, a rating is a rough guess and moves a lot per game.',
        answer:
          'Expected score E = 1 ÷ (1 + 10^((opponent − you) ÷ 400)); the change is K × (result − E). Beating an equal opponent at K = 32 is worth exactly +16.',
      },
      {
        id: 'ppg',
        label: 'Whether my points-per-game average is safe',
        hint: 'Average points per game against the relegation, safety and qualification lines.',
        yes: [
          'Your average points per game',
          'Which band that average sits in',
          'How many points you need to reach safety',
          'The pace required over the games left',
        ],
        warn: [
          DISCLAIMER,
          'The bands here are the common thresholds for a league with relegation, not the rules of any specific competition. Check your own league: bonus points, playoff structures and points deductions all move the lines.',
          'An average is a lagging indicator. Ten games into a season it is close to destiny; three games in it is mostly noise, and one heavy defeat can move it more than the standings suggest.',
          'Head-to-head records, points difference and bonus points frequently decide relegation between teams on equal points. The average tells you the trajectory, not the tiebreak.',
        ],
        plazo: 'The honest checkpoint is two-thirds of the way through the season — early enough to change something, late enough for the average to mean something.',
        answer:
          'Points ÷ games played. Under 1.8 per game is likely relegation, 2.2 is comfortable safety and 3.0 or more usually qualifies at the top.',
      },
      {
        id: 'auction',
        label: 'How to split my fantasy auction budget',
        hint: 'Bench reserve first, then the starter budget split across positions by strategy.',
        yes: [
          'Dollars reserved for bench spots',
          'Dollars available for starters',
          'The budget for each position',
          'Average spend per starting slot',
        ],
        warn: [
          'Every roster spot costs at least $1, so the bench has to be reserved before you plan a single star. Forgetting this is how people end up unable to fill a roster with $3 left and four spots open.',
          'These splits are a plan, not a script. Auction prices are set by the room, and a disciplined manager adapts: if the room overpays for running backs, the budget moves to receivers regardless of the strategy you arrived with.',
          'Nominating your own targets early is a beginner mistake. Nominate players you do not want while other managers still have money, and spend yours once the room is short of cash.',
        ],
        plazo: 'Set the split before draft night and write down a walk-away price per position. Deciding it live, under a clock, is how budgets get blown.',
        answer:
          'Reserve $1 per bench spot, then split what is left: a balanced plan puts roughly 38% into running backs, 38% into receivers, 10% into tight end and 8% into quarterback.',
      },
      {
        id: 'fran',
        label: 'What my Fran time says about my level',
        hint: 'The 21-15-9 thruster and pull-up benchmark against the standard time bands.',
        yes: [
          'Your level band for that time',
          'How far you are from the next band',
          'Seconds per rep across all 90 reps',
          'The Rx loads the time assumes',
        ],
        warn: [
          DISCLAIMER,
          'The time only means something at Rx loads — 95 lb for men and 65 lb for women, with strict chin-over-bar pull-ups. A scaled Fran is a fine workout but it does not belong on the same scale.',
          'Fran is short, extremely intense and famous for producing rhabdomyolysis in undertrained athletes who attack it. If you are new to high-rep thrusters, scale the load and the volume and build into it over weeks.',
          'Range of motion is the first thing to go when the clock is running. A fast time with shallow squats or chin-under-bar reps is not a faster Fran, it is a different workout.',
        ],
        plazo: 'Retest every eight to twelve weeks at most. Fran is a benchmark, not a training session, and testing it weekly costs more than it tells you.',
        answer:
          'Under 2:30 is elite, under 4:00 advanced, under 6:00 intermediate and 6 to 8 minutes is a solid beginner time — all at 95 lb for men and 65 lb for women.',
      },
    ],
  },

  inputsTitle: 'Your numbers',
  inputsIntro: 'Fill in the fields your case needs — the rest are ignored.',
  fields: [
    { id: 'myElo', label: 'Your current rating', type: 'number', value: 1600, min: 0, max: 3500, step: 10, thousands: true },
    { id: 'oppElo', label: 'Opponent’s rating', type: 'number', value: 1700, min: 0, max: 3500, step: 10, thousands: true },
    {
      id: 'result',
      label: 'How it went',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Win' },
        { value: '0.5', label: 'Draw' },
        { value: '0', label: 'Loss' },
      ],
    },
    { id: 'kFactor', label: 'K factor', type: 'number', value: 32, min: 1, max: 100, step: 1, help: '20 for established chess ratings, 32 for club play, 40 for juniors and for FIFA-style ratings.' },
    { id: 'points', label: 'League points won so far', type: 'number', value: 34, min: 0, max: 500, step: 1, thousands: true },
    { id: 'games', label: 'Games played', type: 'number', value: 18, min: 1, max: 100, step: 1 },
    { id: 'gamesLeft', label: 'Games still to play', type: 'number', value: 4, min: 0, max: 60, step: 1 },
    { id: 'budget', label: 'Auction budget', type: 'number', value: 200, prefix: '$', min: 10, max: 1000, step: 10, thousands: true },
    { id: 'roster', label: 'Roster size', type: 'number', value: 16, min: 2, max: 40, step: 1 },
    { id: 'bench', label: 'Of those, bench spots', type: 'number', value: 7, min: 0, max: 30, step: 1 },
    {
      id: 'strategy',
      label: 'Auction strategy',
      type: 'select',
      value: 'balanced',
      options: [
        { value: 'balanced', label: 'Balanced' },
        { value: 'rb_heavy', label: 'RB-heavy (Hero RB)' },
        { value: 'zero_rb', label: 'Zero RB (WR-heavy)' },
        { value: 'stars_scrubs', label: 'Stars and Scrubs' },
      ],
    },
    { id: 'franSec', label: 'Your Fran time', type: 'number', value: 300, suffix: 'seconds', min: 60, max: 1800, step: 5, thousands: true },
    {
      id: 'franDiv',
      label: 'Rx division',
      type: 'select',
      value: 'men',
      options: [
        { value: 'men', label: 'Men — 95 lb thrusters' },
        { value: 'women', label: 'Women — 65 lb thrusters' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where that puts you',
    caption:
      'The marker shows where your result falls on a 0–100 scale: win probability for Elo, points-per-game progress towards the qualification line, the share of your auction budget going to starters, or how far through the Fran benchmark bands your time sits.',
    bands: [
      { label: 'Bottom quarter', from: 0, to: 25, tone: 'bad' },
      { label: 'Below average', from: 25, to: 50, tone: 'warn' },
      { label: 'Above average', from: 50, to: 75, tone: 'neutral' },
      { label: 'Top quarter', from: 75, to: 100, tone: 'good' },
    ],
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Ratings and points are plain numbers, auction budgets are US dollars, and Fran loads are the official Rx pounds.',

  faq: [
    {
      q: 'How does the Elo rating system work?',
      a: 'It converts a rating gap into an expected score with E = 1 ÷ (1 + 10^((opponent − you) ÷ 400)), then moves your rating by K × (actual − expected). A 400-point gap means the stronger player is expected to score about 91%. Because the update depends on the surprise rather than the result alone, beating a much weaker opponent barely moves you and losing to one is expensive.',
    },
    {
      q: 'What K factor should I use?',
      a: 'Twenty for established, higher-rated chess players, 32 for typical club and amateur play, and 40 for juniors, new players and FIFA-style team ratings. Higher K means faster convergence to your true strength at the cost of more volatility, which is why federations lower it as a player’s rating stabilises.',
    },
    {
      q: 'How many points do I gain for beating a stronger player?',
      a: 'More than for beating a weaker one, in proportion to how unlikely the win was. At K = 32, beating an opponent rated 100 points above you gains about +20, beating an equal opponent gains exactly +16, and beating someone 200 below you gains only about +8. Upsets are where ratings actually move.',
    },
    {
      q: 'Why did I lose points for a draw?',
      a: 'Because a draw counts as half a win, and against a weaker opponent half a win is less than expected. If you were a 70% favourite, a draw scores 0.5 against an expectation of 0.7 and the system takes the difference off you. The same draw against a stronger opponent gains you points, for the mirror-image reason.',
    },
    {
      q: 'What points-per-game average avoids relegation?',
      a: 'As a rule of thumb, 1.8 per game is the border of the danger zone and 2.2 is comfortable safety in a league awarding four points for a win. Below 1.8 you are relying on other teams to be worse than you; above 2.2 you generally control your own fate. Check your own competition, since bonus points shift the lines meaningfully.',
    },
    {
      q: 'How do I work out the pace I need for the rest of the season?',
      a: 'Take the total points that safety requires, subtract what you already have, and divide by the games remaining. The number that comes back is often brutal and clarifying: needing 3.5 points a game from four fixtures when your season average is 1.6 is a different conversation than needing 2.0.',
    },
    {
      q: 'How should I split a fantasy football auction budget?',
      a: 'Reserve $1 for each bench spot first, because every roster slot must be filled. Split what remains across the starting positions: a balanced plan puts about 38% each into running back and receiver, 10% into tight end, 8% into quarterback and the rest into defence and kicker. Kicker and defence should never take more than a few dollars.',
    },
    {
      q: 'What is the difference between Zero RB and Stars and Scrubs?',
      a: 'Zero RB is a positional bet: it moves the running back budget into receivers, on the theory that running backs get injured and replacements appear on waivers. Stars and Scrubs is a distributional bet: it concentrates the same budget into two or three elite players at any position and fills the rest of the roster at minimum price. You can run both at once, or neither.',
    },
    {
      q: 'Why do I have to reserve money for the bench?',
      a: 'Because auction rules require every roster spot to be filled, and every player costs at least a dollar. If you have $2 left and four spots open, you cannot legally complete your roster and the software will start stopping you from bidding. Reserving the bench first is the one non-negotiable in auction budgeting.',
    },
    {
      q: 'What is a good Fran time?',
      a: 'Under 6 minutes is a genuinely solid intermediate time, under 4 minutes is advanced, and under 2:30 is elite. The bands only apply at Rx: 95 lb thrusters for men, 65 lb for women, with chin-over-bar pull-ups through full range. Most people who first do Fran at Rx land between 6 and 10 minutes.',
    },
    {
      q: 'Should I do Fran if I am new to CrossFit?',
      a: 'Not at Rx, and not as your introduction to high-rep thrusters. Fran is short enough to be attacked at maximum effort and heavy enough to cause serious muscle damage, and it has a documented association with exertional rhabdomyolysis in undertrained athletes. Scale the load, scale the reps, and build into it over several weeks.',
    },
    {
      q: 'How often should I retest a benchmark workout?',
      a: 'Every eight to twelve weeks. A benchmark is a measurement, and measuring costs you a training day plus recovery. Testing monthly generates noise rather than information, because normal week-to-week variation in sleep, fuelling and fatigue is larger than the real progress you made in four weeks.',
    },
  ],

  sources: [
    {
      name: 'FIDE rating regulations — expected score table and K factors',
      url: 'https://handbook.fide.com/chapter/B022022',
      publisher: 'FIDE',
    },
    {
      name: 'CrossFit benchmark workouts — "The Girls" and Rx loads',
      url: 'https://www.crossfit.com/workout',
      publisher: 'CrossFit',
    },
    {
      name: 'Exertional rhabdomyolysis in high-intensity functional training',
      url: 'https://www.cdc.gov/niosh/topics/rhabdo/',
      publisher: 'CDC / NIOSH',
    },
    {
      name: 'World Rugby laws and competition points structures',
      url: 'https://www.world.rugby/organisation/governance/regulations',
      publisher: 'World Rugby',
    },
    {
      name: 'The Rating of Chessplayers, Past and Present — the original 400-point scale',
      url: 'https://uscf1-nyc1.aodhosting.com/CL-AND-CR-ALL/CL-ALL/1967/1967_08.pdf',
      publisher: 'Arpad E. Elo / US Chess',
    },
  ],

  replaces: [
    '/en/elo-rating-change-calculator',
    '/en/fantasy-football-auction-draft-budget-calculator',
    '/en/rugby-handicap-points-relegation-average',
    '/en/crossfit-fran-benchmark-time',
  ],

  lastReviewed: '2026-07-28',
};
