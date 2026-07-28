import type { HubData } from '../types';

/**
 * Hub EN — "What PC do I need, and what PSU/UPS does it take?"
 *
 * Absorbe 5 calculadoras: presupuesto de build por FPS objetivo, consumo en watts y
 * fuente recomendada, RAM por caso de uso, margen térmico para overclock y autonomía de UPS.
 *
 * Constantes espejadas de las fórmulas reales:
 *  - gaming-fps-componentes-pc-armar-presupuesto.ts (tabla de presupuesto USD)
 *  - consumo-watts-pc-gamer-fuente.ts (headroom 1,30 y escalones 80 PLUS)
 *  - ram-recomendada-uso-computadora.ts (tabla min/rec/ideal)
 *  - overclock-temperatura-segura.ts (TEMP_MAX por componente)
 *  - autonomia-ups-tiempo-respaldo-servidor.ts (FP 0,6 · 0,028 Wh/VA · Peukert 0,5)
 */

/** Presupuesto total estimado en USD por objetivo de FPS/resolución, con GPU y CPU de referencia. */
export const BUILD_TARGETS: Record<string, { usd: number; gpu: string; cpu: string; label: string }> = {
  '60_1080p': { usd: 650, gpu: 'RTX 4060 / RX 7600', cpu: 'Ryzen 5 7600', label: '60 FPS at 1080p' },
  '144_1080p': { usd: 960, gpu: 'RTX 4060 Ti / RX 7700 XT', cpu: 'Ryzen 5 7600', label: '144 FPS at 1080p' },
  '240_competitive': { usd: 1200, gpu: 'RTX 4070 Super', cpu: 'Ryzen 5 7600X / i5-14600K', label: '240 FPS at 1080p (esports)' },
  '144_1440p': { usd: 1540, gpu: 'RTX 4070 Ti Super', cpu: 'Ryzen 7 7700X', label: '144 FPS at 1440p' },
  '60_4k': { usd: 2150, gpu: 'RTX 4080 Super', cpu: 'Ryzen 7 9700X / i7-14700K', label: '60 FPS at 4K' },
};

/** GPU + CPU son ~65% del presupuesto total de la build. */
export const GPU_CPU_SHARE = 0.65;

/** Headroom sobre el pico para elegir la fuente: +30%. */
export const PSU_HEADROOM = 1.3;
/** Escalones estándar de capacidad 80 PLUS, en watts. */
export const PSU_TIERS = [450, 550, 650, 750, 850, 1000, 1200, 1600];

/** RAM en GB: [mínimo, recomendado, ideal] por caso de uso. */
export const RAM_TIERS: Record<string, [number, number, number]> = {
  basic: [4, 8, 16],
  gaming: [8, 16, 32],
  dev: [16, 32, 64],
  creative: [16, 32, 128],
  server: [8, 32, 256],
};

/** Temperatura máxima antes de throttling, °C, por familia de componente. */
export const TEMP_MAX: Record<string, number> = {
  cpu_intel: 100,
  cpu_amd: 95,
  gpu_nvidia: 93,
  gpu_amd: 110,
};

/** UPS: factor de potencia real de un equipo VA→W. */
export const UPS_POWER_FACTOR = 0.6;
/** UPS: energía útil de la batería, Wh por VA nominal. */
export const UPS_WH_PER_VA = 0.028;
/** UPS: exponente tipo Peukert que premia las cargas bajas. */
export const UPS_PEUKERT = 0.5;

const DISCLAIMER =
  'Engineering estimate based on the numbers you enter. Verify units, assumptions and rounding — and the spec sheets of your actual parts — before spending money or pushing a component past its limits.';

export const hub: HubData = {
slug: 'en/tech/pc-build-and-power',
  title: 'PC Build Budget, PSU Wattage, RAM, Overclock Temps and UPS Runtime Calculator',
  description:
    'What PC you need for a target frame rate, how many watts it pulls, what power supply that requires, how much RAM your workload wants, whether you have thermal headroom to overclock, and how long a UPS keeps it alive.',
  silo: 'Tech',
siloHref: '/en/tech',
  locale: 'en',

  eyebrow: 'Build & power',
  h1: 'What PC do I need, and what power supply does it take?',
  lede:
    'Five questions that always arrive together: what a build for your frame-rate target actually costs, how many watts it pulls at the wall, which PSU covers that with headroom, how much RAM your workload really wants, and how long a UPS keeps the whole thing running when the power drops. All five, in one place, with the arithmetic shown.',
  stamps: [
    'Prices in US dollars, at manufacturer MSRP for the reference parts',
    'PSU sizing with the standard 30% headroom and real 80 PLUS capacity tiers',
    'Throttling limits taken from each vendor’s published Tjmax',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which part of the build are you sizing?',
    intro:
      'Pick the question you are actually asking. Only the fields that case needs get read — the rest are ignored.',
    items: [
      {
        id: 'build',
        label: 'What a build for my frame-rate target costs',
        hint: 'Total budget in USD, plus the GPU and CPU that hit that target.',
        yes: [
          'A total build budget in US dollars for the target you pick',
          'The reference GPU and CPU that reach it',
          'How the budget splits between GPU+CPU and everything else',
          'What the next tier up would cost you',
        ],
        warn: [
          DISCLAIMER,
          'The GPU is what decides frame rate at 1440p and 4K. Pairing a cheap GPU with an expensive CPU is the single most common way to waste money on a gaming build — at high resolutions the CPU is barely working.',
          'GPU street prices move constantly and rarely match MSRP. Treat the total as a planning figure and re-check current retail before you buy; a single GPU generation change can move it several hundred dollars.',
          'The figure assumes a new build with a new case, PSU and storage. Reusing a case, drives or a monitor takes real money off it.',
        ],
        plazo: 'Budget roughly 65% of the total for the GPU and CPU together; the remaining 35% covers board, RAM, storage, PSU, case and cooling.',
        answer:
          '144 FPS at 1080p lands around $960 for the whole machine, with an RTX 4060 Ti class GPU and a mid-range six-core CPU. 4K at 60 FPS roughly doubles that.',
      },
      {
        id: 'psu',
        label: 'How many watts it pulls and what PSU it needs',
        hint: 'Peak draw from CPU + GPU + everything else, plus the PSU capacity that covers it.',
        yes: [
          'Peak system draw in watts under a full load',
          'The minimum PSU wattage with 30% headroom',
          'The nearest real 80 PLUS capacity tier to buy',
          'What load percentage the PSU would actually run at',
        ],
        warn: [
          DISCLAIMER,
          'Size the PSU from the peak, not the average. Modern GPUs pull short transient spikes well above their rated board power, and a PSU sized to the average trips its over-current protection on those spikes — which looks exactly like a random reboot mid-game.',
          'A PSU is most efficient around 50–70% load, which is the real reason for the 30% headroom rule: it is about efficiency and lifespan, not just safety.',
          'Wattage is not the whole spec. The 12V rail current, the number of PCIe connectors and the 80 PLUS efficiency tier all matter, and a cheap 850 W unit can be worse than a good 650 W one.',
        ],
        plazo: 'Check the GPU maker’s "recommended system power" figure too — it already assumes a mid-range CPU and normal peripherals.',
        answer:
          'Peak draw is CPU + GPU + everything else. Multiply by 1.30 and round up to the next standard capacity: a 105 W CPU plus a 285 W GPU plus 60 W of other parts needs at least 585 W, so you buy a 650 W unit.',
      },
      {
        id: 'ram',
        label: 'How much RAM my workload actually needs',
        hint: 'Minimum, recommended and ideal capacity for what you do with the machine.',
        yes: [
          'Bare-minimum, recommended and ideal capacity in GB',
          'What the recommended tier costs you over the minimum',
          'Where the price-to-performance sweet spot sits',
        ],
        warn: [
          DISCLAIMER,
          'Below the minimum the system swaps to disk, and swapping is the single most noticeable slowdown a user ever feels — far more than a slower CPU. Above the recommended tier the extra capacity usually does nothing unless your workload genuinely fills it.',
          'Two matched sticks beat one stick of the same total size: dual-channel roughly doubles memory bandwidth, which matters a lot for integrated graphics and measurably for gaming.',
          'Check the maximum your motherboard and CPU support, and how many slots you have, before buying. Filling all four slots can force a lower stable speed on some platforms.',
        ],
        plazo: 'Buy the recommended tier as two matched sticks and leave slots free only if the board supports it at full speed.',
        answer:
          'Office and browsing: 8 GB. Gaming: 16 GB. Software development: 32 GB. Video and 3D: 32 GB, more if your projects are large.',
      },
      {
        id: 'thermals',
        label: 'Whether I have thermal headroom to overclock',
        hint: 'Headroom to the throttling limit, and the delta over ambient that tells you if cooling is the problem.',
        yes: [
          'Degrees of headroom before the component throttles',
          'The delta between your load temperature and room temperature',
          'A verdict on how far you can safely push it',
        ],
        warn: [
          DISCLAIMER,
          'The number that matters is the delta over ambient, not the absolute temperature. A CPU at 80°C in a 20°C room has a 60°C delta — a real cooling problem — while the same 80°C in a 35°C room is the same cooler doing an acceptable job in a hot room.',
          'Hitting the throttling limit is not damage; the chip protects itself by dropping clocks. The cost is silent performance loss, which is why a "fine" machine can quietly run slower every summer.',
          'Overclocking may void the warranty on some parts and always shortens the useful life at higher voltage. Undervolting often gets most of the performance with lower temperatures and no risk.',
        ],
        plazo: 'Repaste the cooler every two to three years; dried thermal compound is the most common cause of a machine that used to run cool and no longer does.',
        answer:
          'Headroom is the vendor’s throttling limit minus your temperature under load. Above 25°C of headroom you can push hard; under 5°C, fix the cooling before touching anything.',
      },
      {
        id: 'ups',
        label: 'How long a UPS keeps this running',
        hint: 'Backup minutes from the UPS VA rating and your real load in watts.',
        yes: [
          'Estimated backup time in minutes',
          'What percentage of the UPS’s usable power you are drawing',
          'Whether the load is comfortable, tight or an overload',
        ],
        warn: [
          DISCLAIMER,
          'A UPS is rated in VA, not watts, and the usable wattage is roughly 60% of the VA figure. A "1500 VA" unit realistically supports about 900 W — buying by the VA number alone is how people end up overloaded on day one.',
          'Runtime is not linear with load: halving the load more than doubles the runtime, because a lead-acid battery delivers more total energy at a lower discharge current. That is why the estimate below rewards light loads.',
          'A UPS battery loses capacity every year and is usually finished at three to five years. The runtime you measure on day one is the best it will ever be — plan for roughly half of it near end of life.',
        ],
        plazo: 'Test the battery under real load once a year, and set the machine to shut down automatically at a set remaining-runtime threshold rather than waiting for the battery to die.',
        answer:
          'A UPS is for an orderly shutdown, not for continuing to work. Five to fifteen minutes at your real load is the normal design target; if you need hours, you need a generator, not a bigger UPS.',
      },
    ],
  },

  inputsTitle: 'The numbers from your parts list',
  inputsIntro: 'Fill in the fields for the case you picked — everything else is ignored.',
  fields: [
    {
      id: 'target',
      label: 'Frame-rate and resolution target',
      type: 'select',
      value: '144_1080p',
      options: [
        { value: '60_1080p', label: '60 FPS at 1080p — casual / budget' },
        { value: '144_1080p', label: '144 FPS at 1080p — competitive mid-range' },
        { value: '240_competitive', label: '240 FPS at 1080p — maximum esports' },
        { value: '144_1440p', label: '144 FPS at 1440p — the sweet spot' },
        { value: '60_4k', label: '60 FPS at 4K — cinematic / AAA quality' },
      ],
    },
    { id: 'cpuw', label: 'CPU power draw under load', type: 'number', value: 105, suffix: 'W', min: 0, max: 400, step: 5, help: 'The PPT / PL2 figure, not the marketing TDP.' },
    { id: 'gpuw', label: 'GPU power draw under load', type: 'number', value: 285, suffix: 'W', min: 0, max: 800, step: 5, help: 'Total board power from the GPU spec sheet.' },
    { id: 'otherw', label: 'Everything else (drives, fans, RGB, peripherals)', type: 'number', value: 60, suffix: 'W', min: 0, max: 400, step: 5 },
    {
      id: 'use',
      label: 'What you use the machine for',
      type: 'select',
      value: 'gaming',
      options: [
        { value: 'basic', label: 'Browsing and office work' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'dev', label: 'Software development' },
        { value: 'creative', label: 'Video editing and 3D' },
        { value: 'server', label: 'Server / virtualization' },
      ],
    },
    {
      id: 'part',
      label: 'Component you are checking the temperature of',
      type: 'select',
      value: 'cpu_intel',
      options: [
        { value: 'cpu_intel', label: 'Intel Core CPU — throttles at 100°C' },
        { value: 'cpu_amd', label: 'AMD Ryzen CPU — throttles at 95°C' },
        { value: 'gpu_nvidia', label: 'NVIDIA GeForce GPU — throttles at 93°C' },
        { value: 'gpu_amd', label: 'AMD Radeon GPU — throttles at 110°C' },
      ],
    },
    { id: 'temp', label: 'Temperature under sustained load', type: 'number', value: 78, suffix: '°C', min: 0, max: 130, step: 1 },
    { id: 'ambient', label: 'Room temperature', type: 'number', value: 72, suffix: '°F', min: 30, max: 120, step: 1, help: 'Entered in Fahrenheit; the delta is worked out in °C.' },
    { id: 'va', label: 'UPS capacity', type: 'number', value: 1500, suffix: 'VA', min: 100, max: 20000, step: 50, thousands: true },
    { id: 'load', label: 'What you have plugged into it', type: 'number', value: 300, suffix: 'W', min: 1, max: 10000, step: 10, thousands: true },
  ],
  fineprint:
    DISCLAIMER +
    ' Build budgets are planning figures at manufacturer MSRP for the reference parts and move with the market — check current retail pricing before you buy.',

  chart: {
    type: 'donut',
    title: 'How the number splits',
    caption:
      'The composition behind the result — GPU and CPU against the rest of the build, CPU against GPU against everything else in the power draw, headroom against the limit in the thermal case.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Every intermediate value the answer is built from, so you can check the reasoning rather than trust the total.',

  faq: [
    {
      q: 'How much should I spend on a gaming PC?',
      a: 'It depends entirely on the frame rate and resolution you are targeting, and the jump between tiers is steep. Roughly $650 buys a machine that holds 60 FPS at 1080p, about $960 gets you 144 FPS at 1080p, around $1,540 covers 144 FPS at 1440p, and 4K at 60 FPS is closer to $2,150. Those are complete-machine figures at MSRP for the reference parts, so treat them as planning numbers rather than quotes.',
    },
    {
      q: 'How do I know what size power supply I need?',
      a: 'Add up the peak draw of the CPU, the GPU and everything else in the case, multiply by 1.30 to leave 30% headroom, and round up to the next standard capacity — 450, 550, 650, 750, 850, 1000, 1200 or 1600 W. Use the peak power figures from the spec sheets, not the marketing TDP, because transient spikes are what trip a PSU’s protection.',
    },
    {
      q: 'Why leave 30% headroom on the power supply?',
      a: 'Two reasons. Efficiency peaks around 50–70% load, so a PSU running flat out wastes more energy as heat and ages faster. And modern GPUs draw very short spikes well above their rated board power; a unit sized exactly to the steady-state number can trip its over-current protection on those spikes, which shows up as a random reboot under load rather than as an obvious power problem.',
    },
    {
      q: 'Is a bigger power supply always better?',
      a: 'No. A PSU only delivers what the system draws, so an oversized unit is not dangerous — but it costs more and runs at a less efficient point on its curve. Beyond that, wattage alone does not make a good PSU: the 12V rail capacity, the quality of the internals and the 80 PLUS efficiency rating matter more than the number on the box.',
    },
    {
      q: 'Is 16 GB of RAM enough in practice?',
      a: 'For gaming and everyday use, yes — 16 GB is the current sweet spot and going to 32 GB rarely produces a frame-rate difference. Software development and video editing are where 32 GB genuinely pays for itself, because compilers, containers and timelines will use whatever you give them. Below 8 GB anything modern starts swapping to disk, and that is the slowdown users actually feel.',
    },
    {
      q: 'Does it matter whether I buy one stick or two?',
      a: 'Yes, and it is free performance. Two matched sticks run in dual-channel mode and roughly double the available memory bandwidth compared with a single stick of the same total capacity. The difference is large for integrated graphics and measurable in gaming, so 2×8 GB beats 1×16 GB almost every time.',
    },
    {
      q: 'What temperature is too hot for a CPU or GPU?',
      a: 'Each vendor publishes its own throttling point: Intel Core CPUs at about 100°C, AMD Ryzen at 95°C, NVIDIA GeForce GPUs around 93°C and AMD Radeon as high as 110°C. Reaching those is not damage — the chip drops clocks to protect itself — but it is silent performance loss. Aim to stay 15–25°C below the limit under sustained load.',
    },
    {
      q: 'My CPU runs at 80°C. Is that a cooling problem?',
      a: 'It depends on the room. What matters is the delta over ambient: 80°C in a 20°C room is a 60°C delta and points at a cooling problem — dried thermal paste, clogged fins, poor case airflow. The same 80°C in a 35°C room is only a 45°C delta, meaning the cooler is doing its job and the room is the constraint.',
    },
    {
      q: 'Why is a UPS rated in VA instead of watts?',
      a: 'VA is apparent power and watts are real power; the two differ by the power factor of the load. For sizing purposes the usable wattage of a typical consumer UPS is roughly 60% of its VA rating, so a 1500 VA unit supports about 900 W. Buying by VA alone is the classic way to end up overloaded — always compare your real watt draw against that 60% figure.',
    },
    {
      q: 'How long will a UPS actually run my PC?',
      a: 'Far less than most people expect, and deliberately so: a UPS is designed to bridge a brief outage and allow an orderly shutdown, not to keep you working. Five to fifteen minutes at a normal desktop load is typical. Runtime rises sharply as load drops — halving the load more than doubles the time — which is why plugging a monitor and a laser printer into the battery outlets is such an expensive mistake.',
    },
    {
      q: 'How often does a UPS battery need replacing?',
      a: 'Every three to five years for a standard sealed lead-acid unit, sooner in a hot room, since capacity fades continuously from the day it is installed. The runtime you measure when it is new is the best it will ever deliver, so plan around roughly half of that toward end of life and test under real load once a year.',
    },
    {
      q: 'Should I overclock at all these days?',
      a: 'Modern CPUs and GPUs already boost themselves to whatever their power and thermal budget allows, so manual overclocking returns much less than it did a decade ago. Undervolting is usually the better move: the same or nearly the same performance at lower voltage, lower temperatures, less noise and no reduction in component lifespan.',
    },
  ],

  sources: [
    { name: 'ATX Design Guide — desktop power supply specification', url: 'https://www.intel.com/content/www/us/en/products/docs/power/atx-multi-rail-power-supply-design-guide.html', publisher: 'Intel' },
    { name: '80 PLUS efficiency program and certification tiers', url: 'https://www.clearesult.com/80plus/', publisher: 'CLEAResult / 80 PLUS' },
    { name: 'Intel Core processor specifications and Tjunction maximum', url: 'https://www.intel.com/content/www/us/en/support/articles/000005597/processors.html', publisher: 'Intel' },
    { name: 'AMD Ryzen operating temperature and precision boost behaviour', url: 'https://www.amd.com/en/products/processors/desktops/ryzen.html', publisher: 'AMD' },
    { name: 'NVIDIA GeForce specifications and recommended system power', url: 'https://www.nvidia.com/en-us/geforce/graphics-cards/', publisher: 'NVIDIA' },
    { name: 'UPS sizing: VA versus watts and runtime behaviour', url: 'https://www.apc.com/us/en/faqs/FA158450/', publisher: 'Schneider Electric / APC' },
  ],

  replaces: [
    '/en/gaming-pc-budget-fps-components',
    '/en/pc-power-consumption-psu',
    '/en/recommended-ram-by-use-case',
    '/en/overclock-temperatura-segura',
    '/en/ups-backup-runtime',
  ],

lastReviewed: '2026-07-28',
};
