import type { HubData } from '../types';

/**
 * Hub EN — "What will this cost me to run per month?"
 *
 * Absorbe 6 calculadoras: costo mensual de una instancia EC2, costo de tokens de API LLM,
 * planes de Midjourney, tamaño del pool de conexiones a la base, tiempo de cómputo por
 * complejidad Big-O y esfuerzo COCOMO por KLOC.
 *
 * Todo el dinero va en DÓLARES. Los precios de nube y de LLM caducan rápido: van como campos
 * editables con un valor por defecto, nunca como constante escondida.
 *
 * Constantes espejadas de las fórmulas reales:
 *  - costo-servidor-cloud-aws-ec2-mensual.ts (precio/hora × horas × días; ahorro 60%)
 *  - costo-tokens-api-openai-claude-mensual.ts (costo = tokens × precio ÷ 1.000.000)
 *  - midjourney-stable-diffusion-credits-mensual.ts (tabla de planes en USD)
 *  - conexiones-db-pool-max-concurrentes.ts (cores × 1/2/3 según carga)
 *  - complejidad-algoritmica-big-o-iteraciones.ts (1e9 operaciones por segundo)
 *  - lineas-codigo-proyecto-complejidad-kloc.ts (COCOMO básico: 2,4 × KLOC^1,05)
 */

/** Ahorro típico de una Reserved Instance frente a On-Demand. */
export const RESERVED_SAVING = 0.6;

/** Planes de Midjourney: precio mensual en USD y horas de GPU rápida. */
export const MJ_PLANS: Record<string, { usd: number; fast: string; relax: boolean; stealth: boolean }> = {
  basic: { usd: 10, fast: '3.3 fast hours (about 200 images)', relax: false, stealth: false },
  standard: { usd: 30, fast: '15 fast hours plus unlimited relax', relax: true, stealth: false },
  pro: { usd: 60, fast: '30 fast hours plus unlimited relax', relax: true, stealth: true },
  mega: { usd: 120, fast: '60 fast hours plus unlimited relax', relax: true, stealth: true },
};

/** Conexiones por core del pool, según intensidad de la carga. */
export const POOL_PER_CORE: Record<string, number> = { low: 1, medium: 2, high: 3 };
/** Por encima de este número de conexiones conviene un pooler externo. */
export const POOL_BOUNCER_THRESHOLD = 200;

/** Operaciones por segundo asumidas para traducir complejidad a tiempo. */
export const OPS_PER_SECOND = 1e9;

/** COCOMO básico, modo orgánico: esfuerzo en persona-mes = 2,4 × KLOC^1,05. */
export const COCOMO_A = 2.4;
export const COCOMO_B = 1.05;

const DISCLAIMER =
  'Informational estimate. Actual rates, fees and terms depend on the provider and your contract; compare official pricing documents before deciding. Cloud and AI list prices change frequently — the price fields here are editable on purpose, so put your own current figures in them.';

export const hub: HubData = {
slug: 'en/tech/cloud-and-ai-costs',
  title: 'Cloud Server, LLM Token, Midjourney, Database Pool and Engineering Effort Cost Calculator',
  description:
    'What a cloud instance costs per month in dollars, what your LLM API bill comes to, which image-generation plan fits, how many database connections your pool should hold, how long an algorithm takes at scale and how many person-months a codebase represents.',
  silo: 'Tech',
siloHref: '/en/tech',
  locale: 'en',

  eyebrow: 'Cloud & AI spend',
  h1: 'What will this cost me to run per month?',
  lede:
    'Software costs money in two currencies: dollars on an invoice and engineering capacity you have to plan around. Both are here — the monthly bill for a cloud instance, the real cost of an LLM API at your call volume, which image plan is worth it, plus the sizing questions that decide whether the bill stays sane: database connections, algorithmic cost at scale, and what a codebase of this size actually represents in person-months.',
  stamps: [
    'All money in US dollars, entered at prices you control',
    'Token costs computed per million tokens, the unit providers actually bill in',
    'Effort from the basic COCOMO organic model',
    'Replaces 6 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'What are you costing out?',
    intro:
      'Pick the question. Only the fields that case needs get read — the rest are ignored.',
    items: [
      {
        id: 'server',
        label: 'A cloud server, per month',
        hint: 'Monthly and annual cost from an hourly rate, plus what a reservation would save.',
        yes: [
          'Monthly and annual cost at your hourly rate',
          'What a one- or three-year reservation typically saves',
          'What running it only during business hours would cost',
          'The cost per hour of actual uptime',
        ],
        warn: [
          DISCLAIMER,
          'Compute is only part of a cloud bill. Storage, snapshots, load balancers, NAT gateways, IP addresses and above all data transfer out are billed separately, and egress in particular is where surprise invoices come from.',
          'A reservation or savings plan typically cuts 40–60% off on-demand pricing, but it is a commitment — you pay whether the instance runs or not. Only commit to the baseline you are certain of, and leave the variable part on-demand or spot.',
          'Non-production environments are the easiest saving available. A development server that runs 24/7 but is used 40 hours a week is roughly 76% waste; scheduling it off outside working hours costs nothing to implement.',
        ],
        plazo: 'Set a billing alert at your expected monthly figure before you launch anything, not after the first surprise invoice.',
        answer:
          'Monthly cost = hourly rate × hours per day × days per month. A $0.10/hour instance running continuously is about $73 a month, or $876 a year.',
      },
      {
        id: 'tokens',
        label: 'An LLM API bill, per month',
        hint: 'Cost per call, per day and per month from token counts and per-million pricing.',
        yes: [
          'Cost of a single call at your token counts',
          'Daily, monthly and annual spend at your call volume',
          'How the bill splits between input and output tokens',
          'What trimming output length would save',
        ],
        warn: [
          DISCLAIMER,
          'Output tokens usually cost several times more than input tokens — often five to one. That makes response length, not prompt length, the dominant driver of most bills, and asking the model to be concise is the cheapest optimisation available.',
          'Providers bill per million tokens. A price quoted "per 1K tokens" is a thousand times smaller, and mixing the two units up is the single most common way to be off by three orders of magnitude when forecasting a bill.',
          'Prompt caching, batch endpoints and smaller models for simple steps all cut cost substantially and are usually easier than reducing volume. Check what your provider offers before assuming the bill is fixed.',
        ],
        plazo: 'Measure real token counts from the API response rather than estimating them — actual usage is routinely double what people assume.',
        answer:
          'Cost per call = (input tokens × input price + output tokens × output price) ÷ 1,000,000. Multiply by calls per day, then by 30.',
      },
      {
        id: 'images',
        label: 'An image-generation plan, per month',
        hint: 'What each subscription tier costs and what the fast GPU hours actually buy.',
        yes: [
          'Monthly and annual cost of the tier',
          'What the fast GPU hours include',
          'Whether unlimited relax generation is available',
          'Cost per month against the tier above and below',
        ],
        warn: [
          DISCLAIMER,
          'Subscription pricing and included hours change; treat the figures here as a starting point and confirm on the provider’s current pricing page before committing to an annual plan.',
          'Fast GPU hours are the real limit, not image count. A complex prompt with upscales consumes far more time than a simple one, so two people on the same plan can get very different volumes out of it.',
          'Commercial use terms differ by tier on most services, and some require the higher plans for any commercial work. Check the licence, not just the price, if the output is going into a client project.',
        ],
        plazo: 'Start on the lowest tier for a month and measure your actual usage before upgrading — the fast hours are far harder to exhaust than they look.',
        answer:
          'The mid tier at $30 a month is the usual answer: it is the cheapest one that includes unlimited relax-mode generation, which removes the hard ceiling entirely.',
      },
      {
        id: 'pool',
        label: 'How many database connections my pool needs',
        hint: 'Minimum and maximum pool size from core count and workload intensity.',
        yes: [
          'A recommended minimum and maximum pool size',
          'Whether the number warrants an external pooler',
          'What each idle connection costs the database in memory',
        ],
        warn: [
          DISCLAIMER,
          'A bigger pool is usually slower, not faster. Beyond roughly two to three connections per core the database spends more time context-switching and contending on locks than doing work, so throughput falls while latency rises.',
          'Every connection consumes memory on the server whether or not it is doing anything — several megabytes each on PostgreSQL. A few hundred idle connections can consume more RAM than the working set you actually wanted cached.',
          'The pool size is per application instance. Ten containers each holding a 20-connection pool is 200 connections at the database, which is the arithmetic that quietly exhausts a server after an autoscaling event.',
        ],
        plazo: 'Put an external pooler in front once the total across all instances passes a couple of hundred connections, rather than raising the database limit.',
        answer:
          'Roughly one to three connections per CPU core depending on how much the workload waits on I/O. Multiply by the number of application instances to get the real total.',
      },
      {
        id: 'bigo',
        label: 'How long an algorithm takes at this scale',
        hint: 'Operations and wall-clock time by complexity class, at a billion operations per second.',
        yes: [
          'Operation count for the complexity class at your n',
          'Estimated wall-clock time at a billion operations per second',
          'How it compares against a linear-time approach',
          'Whether the approach is viable at this scale at all',
        ],
        warn: [
          DISCLAIMER,
          'A billion operations per second is a rough single-core figure and an "operation" is not a fixed thing. Use this to compare complexity classes against each other, not to predict a real runtime — a constant factor of 10 or 100 hides inside the notation.',
          'Big-O describes growth, not speed at small n. An O(n²) algorithm frequently beats an O(n log n) one for small inputs because its constants are lower, which is exactly why real sort implementations switch to insertion sort below a threshold.',
          'The gap between complexity classes is what matters and it is brutal. At a million items, O(n log n) is a fraction of a second while O(n²) is over sixteen minutes — the same task, the same machine, a different approach.',
        ],
        plazo: 'Profile before optimising: the actual bottleneck is very often I/O or a database query rather than the algorithm you were worrying about.',
        answer:
          'Operations by class: O(1) is constant, O(log n) is trivial, O(n) is n, O(n log n) is the practical ceiling for large data, and O(n²) stops being viable somewhere around a hundred thousand items.',
      },
      {
        id: 'effort',
        label: 'What a codebase this size represents in effort',
        hint: 'Person-months and calendar time for a given number of lines of code, by COCOMO.',
        yes: [
          'Effort in person-months from the COCOMO organic model',
          'Calendar time for a team of a given size',
          'A rough dollar figure at a loaded monthly cost',
          'What size class the project falls into',
        ],
        warn: [
          DISCLAIMER,
          'Lines of code is a famously poor measure of value. It rewards verbosity, penalises the cleverest solution and varies by a factor of five between languages for identical functionality. Treat this as a rough scale indicator, never as a productivity metric for people.',
          'COCOMO was calibrated on large waterfall projects from the 1980s and 1990s. It reflects the real superlinear cost of coordination as a system grows, which is genuinely useful, but the absolute numbers should be taken as an order of magnitude and no more.',
          'Adding people does not divide the calendar time proportionally — communication overhead grows with the square of team size. Brooks’s law still holds: adding people to a late project makes it later.',
        ],
        plazo: 'Use it to sanity-check an estimate that feels wrong by an order of magnitude, not to plan a sprint.',
        answer:
          'Basic COCOMO for an organic project: effort in person-months = 2.4 × KLOC^1.05. Fifty thousand lines is roughly 150 person-months.',
      },
    ],
  },

  inputsTitle: 'Your rates and volumes',
  inputsIntro:
    'Prices change constantly, so every rate below is editable — put your provider’s current numbers in. Only the fields your case needs get read.',
  fields: [
    { id: 'hourly', label: 'Instance price per hour', type: 'number', value: 0.1, prefix: '$', min: 0, step: 0.001, help: 'From your provider’s current on-demand pricing page.' },
    { id: 'hoursDay', label: 'Hours it runs per day', type: 'number', value: 24, suffix: 'hours', min: 0, max: 24, step: 1 },
    { id: 'daysMonth', label: 'Days it runs per month', type: 'number', value: 30, suffix: 'days', min: 0, max: 31, step: 1 },
    { id: 'inTok', label: 'Input tokens per call', type: 'number', value: 2000, min: 0, step: 100, thousands: true },
    { id: 'outTok', label: 'Output tokens per call', type: 'number', value: 500, min: 0, step: 50, thousands: true },
    { id: 'calls', label: 'Calls per day', type: 'number', value: 1000, min: 0, step: 100, thousands: true },
    { id: 'priceIn', label: 'Input price per million tokens', type: 'number', value: 3, prefix: '$', min: 0, step: 0.1, help: 'Per MILLION tokens, the unit providers bill in — not per thousand.' },
    { id: 'priceOut', label: 'Output price per million tokens', type: 'number', value: 15, prefix: '$', min: 0, step: 0.1, help: 'Usually several times the input price. This is what drives the bill.' },
    {
      id: 'plan',
      label: 'Image-generation plan',
      type: 'select',
      value: 'standard',
      options: [
        { value: 'basic', label: 'Basic — entry tier' },
        { value: 'standard', label: 'Standard — the usual answer' },
        { value: 'pro', label: 'Pro — more fast hours plus stealth' },
        { value: 'mega', label: 'Mega — maximum fast hours' },
      ],
    },
    { id: 'cores', label: 'CPU cores on the database server', type: 'number', value: 8, min: 1, max: 256, step: 1 },
    {
      id: 'workload',
      label: 'How I/O-heavy the workload is',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'low', label: 'Light — mostly CPU-bound, short queries' },
        { value: 'medium', label: 'Medium — a typical web application' },
        { value: 'high', label: 'Heavy — lots of waiting on I/O' },
      ],
    },
    { id: 'instances', label: 'Application instances sharing the database', type: 'number', value: 1, min: 1, max: 500, step: 1 },
    { id: 'n', label: 'Input size (n)', type: 'number', value: 1000000, min: 1, step: 1000, thousands: true },
    {
      id: 'complexity',
      label: 'Complexity class',
      type: 'select',
      value: 'nlogn',
      options: [
        { value: '1', label: 'O(1) — constant' },
        { value: 'logn', label: 'O(log n) — binary search' },
        { value: 'n', label: 'O(n) — a single pass' },
        { value: 'nlogn', label: 'O(n log n) — a good sort' },
        { value: 'n2', label: 'O(n²) — nested loops' },
        { value: '2n', label: 'O(2ⁿ) — brute-force subsets' },
      ],
    },
    { id: 'loc', label: 'Lines of code in the project', type: 'number', value: 50000, min: 0, step: 1000, thousands: true },
    { id: 'teamSize', label: 'People on the team', type: 'number', value: 4, min: 1, max: 200, step: 1 },
    { id: 'costPerMonth', label: 'Fully loaded cost of one engineer per month', type: 'number', value: 15000, prefix: '$', min: 0, step: 500, thousands: true, help: 'Salary plus benefits, taxes and overhead. Put your own figure in.' },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Where the money goes',
    caption:
      'The composition behind the result — input tokens against output tokens, on-demand cost against what a reservation would save, effort against calendar time.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Every figure derives from the rate you entered, so changing a price changes the whole column rather than being hidden in a constant.',

  faq: [
    {
      q: 'How much does a cloud server cost per month?',
      a: 'Multiply the hourly rate by the hours per day and the days per month. A modest instance at $0.10 an hour running continuously is roughly $73 a month, or $876 a year. That covers compute only — storage, snapshots, load balancers and especially outbound data transfer are billed on top, and egress is where most unexpectedly large invoices come from.',
    },
    {
      q: 'How much do reserved instances actually save?',
      a: 'Typically 40–60% against on-demand, with the deepest discounts on three-year commitments paid up front. The catch is that you pay for the reservation whether the instance runs or not, so it only makes sense for baseline capacity you are confident about. Keep the variable portion on-demand or on spot pricing.',
    },
    {
      q: 'What is the easiest way to cut a cloud bill?',
      a: 'Turn off what nobody is using. Development and staging environments that run around the clock but are used forty hours a week are about 76% waste, and scheduling them off outside working hours is nearly free to implement. After that, look at unattached storage volumes, old snapshots, idle load balancers and NAT gateways — all of them bill continuously and none of them are visible in normal use.',
    },
    {
      q: 'How do I calculate the cost of an LLM API call?',
      a: 'Multiply input tokens by the input price and output tokens by the output price, then divide by a million, because that is the unit providers bill in. At $3 per million input and $15 per million output, a call with 2,000 input and 500 output tokens costs $0.0135 — which at a thousand calls a day is about $405 a month.',
    },
    {
      q: 'Why is my LLM bill higher than I estimated?',
      a: 'Almost always output tokens. They typically cost around five times what input tokens cost, so a model that answers at length dominates the bill even when the prompt is short. Conversational systems compound this by resending the whole history as input on every turn, which grows quadratically over a long session. Measure real token counts from the API responses rather than estimating them.',
    },
    {
      q: 'What is the cheapest way to reduce LLM costs?',
      a: 'Ask for shorter answers, and check whether your provider offers prompt caching and batch endpoints — caching a long shared system prompt can cut input cost by an order of magnitude, and batch processing is typically half price for anything that does not need to be real time. Routing simple steps to a smaller model usually saves more than any prompt tuning.',
    },
    {
      q: 'Which image-generation plan is worth it?',
      a: 'The mid tier at around $30 a month is the usual answer, because it is the cheapest one that includes unlimited relax-mode generation. That removes the hard ceiling entirely: you wait longer per image but never run out. The cheapest tier caps you at a fixed number of images, which most people exhaust in the first week and then find themselves paying for extra time anyway.',
    },
    {
      q: 'How many database connections should my pool have?',
      a: 'Roughly one to three per CPU core, depending on how much the workload waits on I/O. More is usually worse: past that point the database spends its time context-switching and contending rather than answering queries. Critically, the pool size is per application instance, so ten containers with 20 connections each is 200 connections at the server.',
    },
    {
      q: 'When do I need PgBouncer or another connection pooler?',
      a: 'Once the total across all your application instances approaches a couple of hundred connections, or as soon as you are running serverless functions that each open their own. An external pooler multiplexes many client connections onto a small number of real database sessions, which is far cheaper than raising the server’s connection limit and buying RAM to support the idle ones.',
    },
    {
      q: 'How long does an O(n²) algorithm take on a million items?',
      a: 'About 16 minutes at a billion operations per second, against roughly 20 milliseconds for an O(n log n) approach on the same data. That factor of fifty thousand is why complexity class matters far more than micro-optimisation at scale — and why the same code that felt instant on a thousand test records becomes unusable in production.',
    },
    {
      q: 'Is Big-O a reliable predictor of real runtime?',
      a: 'It predicts how cost grows, not how fast something runs. Constant factors hidden inside the notation can differ by a hundredfold, cache behaviour often matters more than operation count, and at small n a "worse" algorithm frequently wins — which is why production sort implementations switch to insertion sort below a threshold. Use it to choose an approach, then profile the real thing.',
    },
    {
      q: 'How many person-months does 50,000 lines of code represent?',
      a: 'Around 150 person-months by the basic COCOMO organic model, which is 2.4 × KLOC^1.05. With a team of four that is roughly 37 months of calendar time. The exponent above one is the interesting part: effort grows faster than size, because coordination cost rises as the system grows.',
    },
    {
      q: 'Is lines of code a useful measure at all?',
      a: 'Only as a rough scale indicator, and never as a measure of anyone’s productivity. Identical functionality can differ fivefold in line count between languages, the best solution is often the one that deletes code, and any team measured on lines written will reliably produce more lines. Use it to tell a 5,000-line project from a 500,000-line one, and nothing finer than that.',
    },
  ],

  sources: [
    { name: 'Amazon EC2 On-Demand pricing', url: 'https://aws.amazon.com/ec2/pricing/on-demand/', publisher: 'Amazon Web Services' },
    { name: 'Amazon EC2 Reserved Instances and Savings Plans', url: 'https://aws.amazon.com/ec2/pricing/reserved-instances/', publisher: 'Amazon Web Services' },
    { name: 'Anthropic API pricing, per million tokens', url: 'https://www.anthropic.com/pricing', publisher: 'Anthropic' },
    { name: 'OpenAI API pricing, per million tokens', url: 'https://openai.com/api/pricing/', publisher: 'OpenAI' },
    { name: 'Midjourney subscription plans and fast GPU hours', url: 'https://docs.midjourney.com/docs/plans', publisher: 'Midjourney' },
    { name: 'PostgreSQL max_connections and per-connection memory', url: 'https://www.postgresql.org/docs/current/runtime-config-connection.html', publisher: 'PostgreSQL Global Development Group' },
    { name: 'PgBouncer — lightweight connection pooler for PostgreSQL', url: 'https://www.pgbouncer.org/', publisher: 'PgBouncer project' },
    { name: 'COCOMO — Constructive Cost Model', url: 'https://csse.usc.edu/tools/cocomoii.php', publisher: 'USC Center for Systems and Software Engineering' },
  ],

  replaces: [
    '/en/aws-ec2-monthly-cost-calculator',
    '/en/llm-token-cost-calculator',
    '/en/midjourney-stable-diffusion-credits-monthly',
    '/en/db-pool-max-connections',
    '/en/big-o-complexity-calculator',
    '/en/code-lines-project-complexity-kloc',
  ],

lastReviewed: '2026-07-28',
};
