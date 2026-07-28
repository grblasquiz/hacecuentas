import type { HubData } from '../types';

/**
 * Hub EN — "What will this event cost, and how do I fill the time?"
 *
 * Absorbe 5 calculadoras sueltas: catering por cabeza, propina por estado,
 * presupuesto de equipo de música, canciones de karaoke y duración de playlist.
 *
 * Todas las constantes son espejo de las fórmulas vivas; ninguna sale de memoria.
 */

/** Tarifas de catering por cabeza, USD. Espejo de event-catering-cost-per-head-calculator.ts. */
export const MEAL_RATES: Record<string, { low: number; mid: number; high: number }> = {
  buffet: { low: 30, mid: 40, high: 50 },
  plated: { low: 60, mid: 90, high: 120 },
  family_style: { low: 40, mid: 60, high: 80 },
  food_truck: { low: 20, mid: 27, high: 35 },
};

/** Barra por cabeza para una recepción de 3 horas, USD. Mismo origen. */
export const BAR_RATES: Record<string, number> = { none: 0, beer_wine: 15, open_bar: 25 };

/**
 * Norma de propina por estado. Espejo de tip-by-state-bill-calculator.ts.
 * OTHER = promedio nacional de referencia.
 */
export const STATE_TIP: Record<string, number> = {
  NY: 0.2, CA: 0.2, MA: 0.2,
  IL: 0.18, FL: 0.18, WA: 0.18, CO: 0.18, NV: 0.18, AZ: 0.18, OR: 0.18,
  TX: 0.15, GA: 0.15, NC: 0.15, OH: 0.15, MI: 0.15, PA: 0.15, MN: 0.15,
  WI: 0.15, MO: 0.15, TN: 0.15, SC: 0.15, AL: 0.15, MS: 0.15, AR: 0.15,
  OTHER: 0.18,
};

/** Ajuste por calidad del servicio, en puntos porcentuales. Mismo origen. */
export const SERVICE_ADJ: Record<string, number> = { poor: -0.05, average: 0, good: 0.02, excellent: 0.05 };

/** Piso de propina automática para mesas grandes: 18% a partir de 6 comensales. Mismo origen. */
export const AUTO_GRAT_RATE = 0.18;
export const AUTO_GRAT_THRESHOLD = 6;

/**
 * Reparto del presupuesto de equipo de música por nivel y uso.
 * Espejo de presupuesto-equipo-musica.ts.
 */
export const GEAR_SPLIT: Record<string, Record<string, { instrument: number; amplification: number; accessories: number; recording: number }>> = {
  beginner: {
    live: { instrument: 0.5, amplification: 0.3, accessories: 0.15, recording: 0.05 },
    studio: { instrument: 0.35, amplification: 0.2, accessories: 0.1, recording: 0.35 },
    practice: { instrument: 0.55, amplification: 0.25, accessories: 0.15, recording: 0.05 },
  },
  intermediate: {
    live: { instrument: 0.4, amplification: 0.3, accessories: 0.2, recording: 0.1 },
    studio: { instrument: 0.25, amplification: 0.25, accessories: 0.1, recording: 0.4 },
    practice: { instrument: 0.45, amplification: 0.25, accessories: 0.2, recording: 0.1 },
  },
  advanced: {
    live: { instrument: 0.35, amplification: 0.3, accessories: 0.25, recording: 0.1 },
    studio: { instrument: 0.2, amplification: 0.25, accessories: 0.1, recording: 0.45 },
    practice: { instrument: 0.4, amplification: 0.2, accessories: 0.2, recording: 0.2 },
  },
};

const DISCLAIMER =
  'Informational estimate based on typical US market rates. Catering, bar and gear prices vary enormously by city, season and vendor, and tipping norms are social conventions rather than rules — always confirm against real quotes and your own judgement.';

export const hub: HubData = {
  slug: 'en/life/party-and-event-planning',
  title: 'Event Cost Calculator: Catering Per Head, Tipping, Music and Playlists',
  description:
    'Budget an event end to end: catering cost per head with bar, gratuity and tax; the right tip by state and party size; how to split a music gear budget; and how many songs fill the night.',
  silo: 'Everyday Life',
  siloHref: '/en/life',
  locale: 'en',

  eyebrow: 'Events & entertaining',
  h1: 'What will this event cost, and how do I fill the time?',
  lede:
    'The two questions that decide whether an event works: what the catering and the tip actually come to once gratuity and tax are on top, and whether you have enough music, songs and turns to cover the hours you booked. Both, worked out with US market rates you can override.',
  stamps: [
    'US catering and bar rates per head',
    'Tipping norms by state, with the 18% large-party floor',
    'All prices editable — quotes beat averages',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Your estimate',

  cases: {
    title: 'Which part are you planning?',
    intro: 'Pick the piece you are costing or timing. Each case reads only the fields it needs.',
    items: [
      {
        id: 'catering',
        label: 'Catering for the guest list',
        hint: 'Total and per-head cost with bar, service charge and sales tax.',
        yes: [
          'Food subtotal at the service style and tier you pick',
          'Bar subtotal for a standard three-hour reception',
          'Service charge and sales tax applied to the subtotal',
          'The real all-in cost per head, which is the number to compare against quotes',
        ],
        warn: [
          DISCLAIMER,
          'The advertised per-head price is almost never the final one. Service charges of 18–24%, sales tax, rentals, cake cutting and bartender fees are routinely quoted separately, which is how a $40 buffet becomes $60 a head.',
          'A service charge is not the same thing as a tip. In most states it goes to the venue and is not required to reach the staff — ask explicitly whether gratuity is included or expected on top.',
          'Guaranteed guest count is contractual. You pay for the number you guarantee whether they turn up or not, so guarantee low and add rather than the reverse.',
        ],
        plazo: 'Lock the final headcount at the deadline in the contract, usually 7–14 days out, and get the revised total in writing.',
        answer:
          'All-in cost per head = (food + bar) × (1 + service charge + tax) ÷ guests. A mid-tier buffet with beer and wine, 20% service and 8% tax lands near $70 a head.',
      },
      {
        id: 'tip',
        label: 'What to tip on this bill',
        hint: 'Tip and total by state norm, service quality and party size.',
        yes: [
          'The prevailing tip percentage where you are',
          'An adjustment up or down for the service you got',
          'The 18% automatic-gratuity floor once the party reaches six',
          'Tip, total and the split per person',
        ],
        warn: [
          DISCLAIMER,
          'Check the bill before adding anything. Parties of six or more frequently have gratuity added automatically, and tipping on top of an included service charge is how people accidentally tip 38%.',
          'Tip on the pre-tax subtotal if you want to be precise; tipping on the post-tax total is common and simply gives a slightly larger tip.',
          'In most US states, tipped staff are paid a sub-minimum cash wage and rely on tips to reach the minimum. Withholding a tip for bad service has a much larger effect on the server than the equivalent gesture would in most other countries.',
        ],
        plazo: 'For a large group, agree the tip approach before the bill lands — splitting it afterwards is where the friction is.',
        answer:
          'Tip = bill × state norm, adjusted for service, with an 18% floor for parties of six or more. Norms run 15% in much of the South and Midwest to 20% in New York, California and Massachusetts.',
      },
      {
        id: 'gear',
        label: 'Splitting a music gear budget',
        hint: 'How to divide a budget between instrument, amplification, accessories and recording.',
        yes: [
          'A split weighted for your experience level and what you actually do',
          'Dollar amounts per category, not just percentages',
          'A studio-focused split that moves money into recording',
        ],
        warn: [
          DISCLAIMER,
          'The accessories slice is the one beginners cut and then regret: cables, stands, a tuner, cases and strings are unglamorous and completely non-optional.',
          'On a tight budget, used gear from a reputable dealer beats new at the same price almost every time — instruments and amplifiers hold up, and the depreciation has already happened.',
          'For recording, the room matters more than the microphone past a fairly low price point. Treating the space is usually the highest-value purchase in the studio split.',
        ],
        plazo: 'Buy the instrument first and live with it a few months before committing the rest — your priorities will change.',
        answer:
          'A beginner playing live puts roughly half the budget into the instrument, a third into amplification and the rest into accessories. A studio focus moves 35–45% into recording instead.',
      },
      {
        id: 'karaoke',
        label: 'Karaoke night — how many songs fit',
        hint: 'Songs that fit in the session, per person, and the wait between turns.',
        yes: [
          'Total songs that fit, allowing for the gap between them',
          'Songs each person gets',
          'How long you wait between your turns',
        ],
        warn: [
          DISCLAIMER,
          'The gap between songs is what actually eats the night — queueing, arguing about the next pick and the microphone handover routinely add as much as a minute per song.',
          'Fewer than two songs each and people disengage. If the maths says that, either extend the booking or split into two rooms.',
        ],
        plazo: 'Build the queue before you start rather than picking each song at the machine — that alone saves close to a fifth of the session.',
        answer:
          'Songs that fit = session minutes ÷ (song length + gap). At 4 minutes plus a 1-minute gap, a two-hour room fits 24 songs — six each for four people.',
      },
      {
        id: 'playlist',
        label: 'How long a playlist runs',
        hint: 'Total running time from the number of songs and their average length.',
        yes: [
          'Total running time in hours and minutes',
          'Songs per hour at that average length',
          'How many more songs you need to cover the event',
        ],
        warn: [
          DISCLAIMER,
          'Average song length is doing all the work here. Pop sits near 3:30, but a playlist with any dance, rock or classical content will run far longer per track than you assumed.',
          'Build about 25% more than you think you need. Running out of music at an event is far more noticeable than not reaching the end of the list.',
        ],
        plazo: 'Download the playlist rather than streaming it — venue wifi is the single most common failure point at a party.',
        answer:
          'Running time = songs × average length. At 3.5 minutes a track, 100 songs run about 5 hours and 50 minutes, or roughly 17 songs an hour.',
      },
    ],
  },

  inputsTitle: 'Your event',
  inputsIntro: 'Fill in what the case you picked needs — everything else is ignored.',
  fields: [
    { id: 'guests', label: 'Guests', type: 'number', value: 100, min: 0, step: 10, thousands: true },
    {
      id: 'meal',
      label: 'Service style',
      type: 'select',
      value: 'buffet',
      options: [
        { value: 'buffet', label: 'Buffet' },
        { value: 'plated', label: 'Plated dinner' },
        { value: 'family_style', label: 'Family style' },
        { value: 'food_truck', label: 'Food truck' },
      ],
    },
    {
      id: 'tier',
      label: 'Price tier',
      type: 'select',
      value: 'mid',
      options: [
        { value: 'low', label: 'Budget' },
        { value: 'mid', label: 'Mid-range' },
        { value: 'high', label: 'Premium' },
      ],
    },
    {
      id: 'bar',
      label: 'Bar service',
      type: 'select',
      value: 'beer_wine',
      options: [
        { value: 'none', label: 'No bar' },
        { value: 'beer_wine', label: 'Beer and wine' },
        { value: 'open_bar', label: 'Open bar, 3 hours' },
      ],
    },
    { id: 'servicepct', label: 'Service charge', type: 'number', value: 20, suffix: '%', min: 0, max: 40, step: 1 },
    { id: 'taxpct', label: 'Sales tax', type: 'number', value: 8, suffix: '%', min: 0, max: 15, step: 0.5 },
    { id: 'bill', label: 'Restaurant bill, before tip', type: 'number', value: 120, prefix: '$', min: 0, step: 5, thousands: true },
    {
      id: 'state',
      label: 'State',
      type: 'select',
      value: 'OTHER',
      options: [
        { value: 'OTHER', label: 'National average (18%)' },
        { value: 'NY', label: 'New York (20%)' },
        { value: 'CA', label: 'California (20%)' },
        { value: 'MA', label: 'Massachusetts (20%)' },
        { value: 'IL', label: 'Illinois (18%)' },
        { value: 'FL', label: 'Florida (18%)' },
        { value: 'WA', label: 'Washington (18%)' },
        { value: 'CO', label: 'Colorado (18%)' },
        { value: 'NV', label: 'Nevada (18%)' },
        { value: 'AZ', label: 'Arizona (18%)' },
        { value: 'OR', label: 'Oregon (18%)' },
        { value: 'TX', label: 'Texas (15%)' },
        { value: 'GA', label: 'Georgia (15%)' },
        { value: 'NC', label: 'North Carolina (15%)' },
        { value: 'OH', label: 'Ohio (15%)' },
        { value: 'MI', label: 'Michigan (15%)' },
        { value: 'PA', label: 'Pennsylvania (15%)' },
        { value: 'MN', label: 'Minnesota (15%)' },
        { value: 'WI', label: 'Wisconsin (15%)' },
        { value: 'MO', label: 'Missouri (15%)' },
        { value: 'TN', label: 'Tennessee (15%)' },
        { value: 'SC', label: 'South Carolina (15%)' },
        { value: 'AL', label: 'Alabama (15%)' },
        { value: 'MS', label: 'Mississippi (15%)' },
        { value: 'AR', label: 'Arkansas (15%)' },
      ],
    },
    {
      id: 'service',
      label: 'Service you got',
      type: 'select',
      value: 'good',
      options: [
        { value: 'poor', label: 'Poor (−5 pts)' },
        { value: 'average', label: 'Average (norm as-is)' },
        { value: 'good', label: 'Good (+2 pts)' },
        { value: 'excellent', label: 'Excellent (+5 pts)' },
      ],
    },
    { id: 'party', label: 'People at the table', type: 'number', value: 4, min: 1, max: 30, step: 1 },
    { id: 'budget', label: 'Music gear budget', type: 'number', value: 1500, prefix: '$', min: 0, step: 100, thousands: true },
    {
      id: 'level',
      label: 'Your level',
      type: 'select',
      value: 'beginner',
      options: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
      ],
    },
    {
      id: 'focus',
      label: 'Mostly for',
      type: 'select',
      value: 'live',
      options: [
        { value: 'live', label: 'Playing live' },
        { value: 'studio', label: 'Recording' },
        { value: 'practice', label: 'Practice at home' },
      ],
    },
    { id: 'session', label: 'Session length', type: 'number', value: 120, suffix: 'minutes', min: 10, step: 10, thousands: true },
    { id: 'songlen', label: 'Average song length', type: 'number', value: 3.5, suffix: 'minutes', min: 0.5, max: 15, step: 0.1 },
    { id: 'gap', label: 'Gap between songs', type: 'number', value: 1, suffix: 'minutes', min: 0, max: 10, step: 0.5 },
    { id: 'singers', label: 'Singers taking turns', type: 'number', value: 5, min: 1, max: 40, step: 1 },
    { id: 'songs', label: 'Songs in the playlist', type: 'number', value: 100, min: 1, step: 10, thousands: true },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where it goes',
    caption:
      'The split behind the total — food against bar against service and tax, or how a gear budget divides between the four categories.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Rates are the documented US averages; override them with a real quote wherever you have one.',

  faq: [
    {
      q: 'How much does catering cost per person in the US?',
      a: 'A buffet typically runs $30–50 a head, family style $40–80, plated dinner $60–120 and a food truck $20–35. Those are food only. Once bar service, a 20% service charge and sales tax are added, the real all-in figure is commonly 40–50% above the quoted per-head rate.',
    },
    {
      q: 'What is the difference between a service charge and a tip?',
      a: 'A service charge is a mandatory fee the venue sets and, in most states, keeps — it is treated as revenue, not as a gratuity, and it does not have to be distributed to staff. A tip is voluntary and belongs to the employee. Ask directly whether the service charge goes to the team, and whether additional gratuity is expected.',
    },
    {
      q: 'What is a guaranteed guest count and why does it matter?',
      a: 'It is the number you commit to pay for, usually locked 7 to 14 days before the event. You pay for that many regardless of who shows up, and you can normally add guests afterwards but not subtract. Guarantee slightly below your expected attendance and add later.',
    },
    {
      q: 'How much should I tip at a restaurant in the United States?',
      a: 'Fifteen to twenty percent for sit-down table service, with 20% standard in high-cost metropolitan areas and 15% still common in much of the South and Midwest. Counter service, where there is no table service to speak of, is discretionary and much lower — the tablet prompt asking for 25% at a coffee counter is not a norm, it is a default setting.',
    },
    {
      q: 'When does automatic gratuity apply?',
      a: 'Most commonly at parties of six or more, at 18%, and it must be disclosed on the menu or the bill. Always read the itemised bill before adding a tip: adding 20% on top of an 18% automatic gratuity is an easy and expensive mistake.',
    },
    {
      q: 'Should I tip on the pre-tax or post-tax amount?',
      a: 'Technically the pre-tax subtotal, since the tax is not part of the service. In practice most people tip on the total, which simply produces a slightly larger tip. Neither is wrong; the difference on a $120 bill is under $2.',
    },
    {
      q: 'Is it acceptable to tip less for poor service?',
      a: 'It is accepted, but understand what it does. In most US states tipped employees are paid a cash wage well below the standard minimum and depend on tips to reach it, so a withheld tip lands much harder than the same gesture would elsewhere. If the problem was the kitchen or the wait for a table, that is usually not the server’s doing — raising it with the manager achieves more.',
    },
    {
      q: 'How should I split a first music gear budget?',
      a: 'For a beginner playing live, roughly half into the instrument, 30% into amplification and 15% into accessories, leaving a little for recording. If recording is the point, move 35–45% into the recording chain instead. The category people skip is accessories, and then they discover that cables, a stand, a tuner and a case are not optional.',
    },
    {
      q: 'How many songs fit in a karaoke session?',
      a: 'Divide the session by the song length plus the gap between songs. At 4 minutes a song and a 1-minute changeover, a two-hour room fits about 24 songs. The changeover is what people forget, and it is worth 20% of the night — building the queue in advance rather than choosing at the machine gets most of it back.',
    },
    {
      q: 'How long a playlist do I need for a party?',
      a: 'Take the hours you need to cover and multiply by about 17 songs an hour at a 3.5-minute average, then add 25%. A five-hour reception needs roughly 105 minimum, so build 130. Download it rather than streaming — venue wifi is the most common single point of failure at an event.',
    },
    {
      q: 'What is the largest single line in most event budgets?',
      a: 'Food and beverage, typically 40–50% of the total, with the venue next. Entertainment, flowers and photography together usually come to less than the catering alone — which is why the guest count, not the choice of vendor, is the variable that actually controls the budget.',
    },
  ],

  sources: [
    { name: 'Consumer Price Index — Food Away From Home', url: 'https://www.bls.gov/cpi/factsheets/food.htm', publisher: 'US Bureau of Labor Statistics' },
    { name: 'Tipped Employees — federal wage rules', url: 'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped', publisher: 'US Department of Labor' },
    { name: 'Fact Sheet #15: Tipped Employees Under the FLSA', url: 'https://www.dol.gov/agencies/whd/fact-sheets/15-flsa-tipped-employees', publisher: 'US Department of Labor' },
    { name: 'Restaurant industry operations and service charges', url: 'https://restaurant.org/research-and-media/research/', publisher: 'National Restaurant Association' },
    { name: 'Consumer tipping survey data', url: 'https://www.bankrate.com/banking/tipping-survey/', publisher: 'Bankrate' },
  ],

  replaces: [
    '/en/event-catering-cost-per-head-calculator',
    '/en/tip-by-state-bill-calculator',
    '/en/music-equipment-budget-calculator',
    '/en/karaoke-songs-per-hour',
    '/en/playlist-duration-songs',
  ],

  lastReviewed: '2026-07-28',
};
