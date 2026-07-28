import type { HubData } from '../types';

/**
 * Hub EN — "Is my network (and my password) up to the job?"
 *
 * Absorbe 7 calculadoras: subnetting CIDR, categoría de cable Ethernet, canales WiFi,
 * ping por distancia, Core Web Vitals, tiempo de crackeo por longitud de password y
 * costo de bcrypt.
 *
 * Constantes espejadas de las fórmulas reales:
 *  - subnetting-mascara-red-cidr.ts (2^(32−n) − 2)
 *  - categoria-cable-ethernet-velocidad-distancia.ts (tabla TIA-568)
 *  - wifi-canal-optimo-24-5-ghz.ts (1/6/11 y 36-48 / 149-165)
 *  - ping-latencia-distancia.ts (200.000 km/s en fibra, ida y vuelta, factor 2,5/2,0/1,8)
 *  - tiempo-carga-pagina-web-metricas.ts (umbrales LCP/FID/CLS)
 *  - tiempo-crackear-password-longitud.ts (1e9 intentos/seg)
 *  - hashes-bcrypt-costo-tiempo-cracking.ts (65 ms a cost=10, ×2 por nivel)
 */

/** Velocidad de la luz en fibra monomodo: ~2/3 de c. */
export const FIBER_KM_PER_S = 200000;
/** Factor entre el ping teórico y el real, por tramo de distancia. */
export const PING_FACTOR = { short: 2.5, medium: 2.0, long: 1.8 };

/** Categorías de cableado estructurado: velocidad, alcance en metros, ancho de banda. */
export const CABLE_CATS: Record<string, { speed: string; meters: number; mhz: number }> = {
  cat5e: { speed: '1 Gbps', meters: 100, mhz: 100 },
  cat6: { speed: '1 Gbps (10 Gbps under 37 m)', meters: 100, mhz: 250 },
  cat6a: { speed: '10 Gbps', meters: 100, mhz: 500 },
  cat7: { speed: '10 Gbps', meters: 100, mhz: 600 },
  cat8: { speed: '40 Gbps', meters: 30, mhz: 2000 },
};

/** Tamaño del alfabeto por conjunto de caracteres. */
export const CHARSET_SIZE: Record<string, number> = { digits: 10, lower: 26, alnum: 62, all: 95 };
/** Intentos por segundo asumidos para la estimación de fuerza bruta. */
export const GUESSES_PER_SECOND = 1e9;

/** bcrypt: milisegundos por hash a cost = 10 en un core moderno. Cada +1 duplica. */
export const BCRYPT_MS_AT_10 = 65;

/** Umbrales de Core Web Vitals: [bueno, necesita mejora]. */
export const CWV = { lcp: [2500, 4000], fid: [100, 300], cls: [0.1, 0.25] };

const DISCLAIMER =
  'Engineering estimate based on the values you enter. Verify units, assumptions and rounding — and never treat a brute-force time estimate as a guarantee that a password is safe.';

export const hub: HubData = {
slug: 'en/tech/network-and-security',
  title: 'Subnet, Cable, WiFi Channel, Ping, Core Web Vitals and Password Strength Calculator',
  description:
    'Work out how many hosts a CIDR prefix gives you, which Ethernet category covers your run, which WiFi channel to sit on, what ping your distance allows, whether your Core Web Vitals pass, and how long a password or a bcrypt hash resists brute force.',
  silo: 'Tech',
siloHref: '/en/tech',
  locale: 'en',

  eyebrow: 'Network & security',
  h1: 'Is my network — and my password — up to the job?',
  lede:
    'Seven checks that decide whether a network is well built or merely working: how many addresses a prefix really gives you, whether the cable can carry the speed over the distance, which WiFi channel is not fighting the neighbours, what latency physics allows before you blame the ISP, whether your pages pass Google’s experience thresholds, and how long a password and its stored hash would actually hold up.',
  stamps: [
    'Subnet arithmetic with the network and broadcast addresses correctly excluded',
    'Cable limits from the TIA-568 structured cabling categories',
    'Latency floor from the real speed of light in fiber, round trip',
    'Replaces 7 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'What are you checking?',
    intro:
      'Pick the question. Only the fields that case needs get read — the rest are ignored.',
    items: [
      {
        id: 'subnet',
        label: 'How many hosts a /prefix gives me',
        hint: 'Usable addresses, the dotted mask, and how it divides into smaller subnets.',
        yes: [
          'Usable host addresses for the prefix',
          'The subnet mask in dotted-decimal form',
          'Total addresses before the two reserved ones',
          'How many /24 networks the prefix contains',
        ],
        warn: [
          DISCLAIMER,
          'Two addresses in every ordinary subnet are unusable: the all-zeros network address and the all-ones broadcast address. That is why a /24 gives 254 hosts, not 256 — and why a /31 gives zero usable hosts under classic rules.',
          'The /31 and /32 prefixes are special cases. RFC 3021 allows a /31 as a two-address point-to-point link with no broadcast, and a /32 is a single host route. Neither follows the 2ⁿ − 2 rule.',
          'Always leave room to grow. Renumbering a subnet that ran out of addresses means touching DHCP scopes, firewall rules, static assignments and documentation all at once.',
        ],
        plazo: 'Plan the address space before deployment, not after: subnetting is cheap on a whiteboard and expensive in production.',
        answer:
          'Usable hosts = 2^(32 − prefix) − 2. A /24 gives 254, a /25 gives 126, a /26 gives 62 and a /30 gives 2.',
      },
      {
        id: 'cable',
        label: 'Whether the cable carries the speed over the distance',
        hint: 'Category, rated speed, maximum run length and bandwidth.',
        yes: [
          'Rated speed for the category',
          'Maximum run length before you need a switch or fiber',
          'Bandwidth in MHz, which is what really separates the categories',
          'How much of the maximum run you are using',
        ],
        warn: [
          DISCLAIMER,
          'The 100-metre limit is the whole channel, not just the cable in the wall: it covers the horizontal run plus both patch cords at either end. The permanent link is limited to 90 metres precisely so the patch cords fit inside the budget.',
          'Cat 6 is rated at 10 Gbps only for runs shorter than about 37 metres. Beyond that it drops back to 1 Gbps, which is exactly the failure people find after the walls are closed.',
          'Cat 7 was never recognised by the North American TIA standard and uses connectors most equipment does not take. For a new 10 Gbps installation Cat 6A is the standard answer; Cat 8 is a short-run datacenter product, not a house-wiring product.',
        ],
        plazo: 'When a run is near the limit, pull Cat 6A rather than Cat 5e — the labour costs the same and the cable is the part you cannot easily replace later.',
        answer:
          'Cat 5e carries 1 Gbps to 100 m, Cat 6A carries 10 Gbps to 100 m, and Cat 8 carries 40 Gbps but only to 30 m.',
      },
      {
        id: 'wifi',
        label: 'Which WiFi channel and band I should be on',
        hint: 'Non-overlapping channels, channel width and whether DFS is a problem.',
        yes: [
          'The channels that do not overlap on your band',
          'The channel width to set',
          'Whether DFS radar detection applies',
          'The trade-off between range and speed on that band',
        ],
        warn: [
          DISCLAIMER,
          'On 2.4 GHz only channels 1, 6 and 11 avoid overlapping each other. Using channel 3 or 9 does not find a gap — it interferes with two networks instead of sharing cleanly with one.',
          'Setting 40 MHz width on 2.4 GHz consumes most of the band and usually makes things worse for everyone, including you. Keep 2.4 GHz at 20 MHz and save the wide channels for 5 GHz.',
          'DFS channels (52 to 144) are shared with weather and military radar. When the router detects a radar pulse it must vacate the channel immediately, which appears to users as a sudden disconnection with no obvious cause.',
        ],
        plazo: 'Scan before choosing: the least congested of 1, 6 and 11 in your specific location beats any general rule about which is best.',
        answer:
          'On 2.4 GHz use 1, 6 or 11 at 20 MHz. On 5 GHz use 36–48 or 149–165, which are free of DFS radar interruptions.',
      },
      {
        id: 'ping',
        label: 'What ping the distance allows',
        hint: 'The physics floor for a round trip, the realistic figure, and whether yours is bad.',
        yes: [
          'The theoretical minimum round-trip time for the distance',
          'A realistic expected ping including routing overhead',
          'How your measured ping compares',
          'How much of your latency is physics and how much is the network',
        ],
        warn: [
          DISCLAIMER,
          'Light travels through fiber at about two-thirds of its vacuum speed, roughly 200,000 km/s. Nothing your ISP does can go below that floor, so a transatlantic ping under 60 ms is physically impossible no matter what you pay.',
          'Real routes are not straight lines. Cables follow coastlines, existing rights of way and peering points, so the actual fiber path is often 1.3 to 2 times the great-circle distance between you and the server.',
          'A ping figure says nothing about jitter or packet loss, and those are what actually ruin calls and games. A steady 80 ms is far better than an average of 40 ms that spikes to 300 ms.',
        ],
        plazo: 'If your measured ping is more than about three times the theoretical floor, the problem is routing or your local link, not distance.',
        answer:
          'Minimum ping = 2 × distance ÷ 200,000 km/s. A server 2,600 km away has a 26 ms floor and typically measures 50–65 ms in practice.',
      },
      {
        id: 'cwv',
        label: 'Whether my Core Web Vitals pass',
        hint: 'LCP, interaction latency and layout shift against Google’s published thresholds.',
        yes: [
          'A pass, needs-improvement or fail verdict on each metric',
          'How far each one is from the "good" threshold',
          'Which metric to fix first',
        ],
        warn: [
          DISCLAIMER,
          'Google replaced First Input Delay with Interaction to Next Paint in March 2024. INP is stricter and measures the full interaction, not just the initial delay: good is 200 ms or under, poor is above 500 ms. If you are still tracking FID, you are measuring a retired metric.',
          'Thresholds are judged at the 75th percentile of real user traffic, not on a single lab run. A page that scores well in a synthetic test on a fast laptop can still fail the field data that Search actually uses.',
          'Core Web Vitals are a small ranking factor, not a substitute for relevance. Fixing them helps conversion far more reliably than it helps position — which is still a very good reason to fix them.',
        ],
        plazo: 'Use field data from the Chrome UX Report or your own real-user monitoring; lab scores are for debugging, not for judging.',
        answer:
          'Good is LCP at or under 2.5 s, INP at or under 200 ms (formerly FID at or under 100 ms) and CLS at or under 0.1, measured at the 75th percentile.',
      },
      {
        id: 'password',
        label: 'How long a password resists brute force',
        hint: 'Search space and time to exhaust it at a billion guesses per second.',
        yes: [
          'The total number of possible combinations',
          'Time to exhaust the space at a billion guesses per second',
          'What one more character buys you',
          'Whether length or complexity is doing the work',
        ],
        warn: [
          DISCLAIMER,
          'This models a pure brute-force attack against every combination. Real attacks start with leaked password lists, dictionary words and predictable substitutions, so a "complex" password like P@ssw0rd1 falls in seconds despite scoring well on paper.',
          'A billion guesses per second is a reasonable figure for a fast unsalted hash on consumer hardware. A properly configured bcrypt or Argon2 hash slows this by many orders of magnitude — which is the point of the next case.',
          'Length beats complexity. Adding one character multiplies the search space by the size of the alphabet; adding symbols to a short password only widens it slightly. A long passphrase of ordinary words outperforms a short string of symbols.',
        ],
        plazo: 'Use a password manager with unique random passwords per site, and turn on multi-factor authentication — it defeats a stolen password entirely.',
        answer:
          'Combinations = alphabet size raised to the length. Each extra character multiplies the time by the size of the alphabet, so length is the strongest lever you have.',
      },
      {
        id: 'bcrypt',
        label: 'What bcrypt cost factor to use',
        hint: 'Milliseconds per hash, logins per second, and the attacker’s slowdown.',
        yes: [
          'Time to compute one hash at that cost factor',
          'How many logins per second one core sustains',
          'How much slower an attacker becomes compared with a raw hash',
          'What the next cost factor up would cost you',
        ],
        warn: [
          DISCLAIMER,
          'Never store passwords with a fast hash. MD5, SHA-1 and SHA-256 are designed to be fast, which is exactly wrong for passwords — bcrypt, scrypt and Argon2 are deliberately slow and memory-hard so that an attacker gains nothing from a GPU farm.',
          'Each increment of the cost factor doubles the work, for you and for the attacker equally. Cost 10 is the practical floor today and 12 is a common default; above 14 the login latency starts to be felt under real traffic.',
          'The right cost is the one that fits your latency budget on your hardware, so measure it rather than copying a number. Then re-measure every couple of years: hardware gets faster and yesterday’s safe cost becomes today’s minimum.',
        ],
        plazo: 'Re-hash a user’s password at the new cost the next time they log in successfully — that is how you raise the cost factor without a mass reset.',
        answer:
          'Each +1 in the cost factor doubles the hashing time. Around 65 ms per hash at cost 10 on a modern core, so cost 12 is roughly 260 ms.',
      },
    ],
  },

  inputsTitle: 'The numbers from your setup',
  inputsIntro: 'Fill in the fields for the case you picked — everything else is ignored.',
  fields: [
    { id: 'cidr', label: 'CIDR prefix length', type: 'number', value: 24, prefix: '/', min: 0, max: 32, step: 1 },
    {
      id: 'cable',
      label: 'Cable category',
      type: 'select',
      value: 'cat6a',
      options: [
        { value: 'cat5e', label: 'Cat 5e' },
        { value: 'cat6', label: 'Cat 6' },
        { value: 'cat6a', label: 'Cat 6a' },
        { value: 'cat7', label: 'Cat 7' },
        { value: 'cat8', label: 'Cat 8' },
      ],
    },
    { id: 'runFt', label: 'Length of the cable run', type: 'number', value: 200, suffix: 'ft', min: 1, max: 1000, step: 5, thousands: true },
    {
      id: 'band',
      label: 'WiFi band',
      type: 'select',
      value: '24',
      options: [
        { value: '24', label: '2.4 GHz — longer range, more congestion' },
        { value: '5', label: '5 GHz — faster, shorter range' },
      ],
    },
    { id: 'distanceMi', label: 'Distance to the server', type: 'number', value: 1600, suffix: 'miles', min: 1, max: 13000, step: 10, thousands: true },
    { id: 'pingReal', label: 'Ping you actually measure', type: 'number', value: 65, suffix: 'ms', min: 0, max: 2000, step: 1, help: 'Leave at 0 to skip the comparison.' },
    { id: 'lcp', label: 'Largest Contentful Paint', type: 'number', value: 2400, suffix: 'ms', min: 0, step: 100, thousands: true },
    { id: 'inp', label: 'Interaction to Next Paint (or FID)', type: 'number', value: 180, suffix: 'ms', min: 0, step: 10 },
    { id: 'cls', label: 'Cumulative Layout Shift', type: 'number', value: 0.08, min: 0, max: 2, step: 0.01 },
    { id: 'length', label: 'Password length', type: 'number', value: 12, suffix: 'characters', min: 1, max: 64, step: 1 },
    {
      id: 'charset',
      label: 'Characters it can contain',
      type: 'select',
      value: 'alnum',
      options: [
        { value: 'digits', label: 'Digits only — 10 possibilities' },
        { value: 'lower', label: 'Lowercase letters — 26' },
        { value: 'alnum', label: 'Letters and digits, both cases — 62' },
        { value: 'all', label: 'Letters, digits and symbols — 95' },
      ],
    },
    { id: 'cost', label: 'bcrypt cost factor', type: 'number', value: 12, min: 4, max: 20, step: 1, help: 'Rounds = 2 to the power of this number.' },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'How the number breaks down',
    caption:
      'The components behind the result — physics floor against routing overhead, usable addresses against reserved ones, your metric against the threshold it has to beat.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Each intermediate value shown, so you can see which part of the answer is physics, which is standards, and which is a judgement call.',

  faq: [
    {
      q: 'How many usable IP addresses does a /24 give me?',
      a: '254. The prefix leaves 8 host bits, which is 256 total addresses, and two of them are reserved: the all-zeros address identifies the network itself and the all-ones address is the broadcast. The general rule is 2^(32 − prefix) − 2, so a /25 gives 126, a /26 gives 62 and a /30 gives 2.',
    },
    {
      q: 'Why does a /30 only give two usable addresses?',
      a: 'Because it has just 2 host bits, for 4 total addresses, and the network and broadcast addresses take two of them. That leaves exactly two usable, which is why /30 became the traditional prefix for point-to-point links. RFC 3021 later allowed /31 for the same purpose with no broadcast address, halving the waste.',
    },
    {
      q: 'How far can I run an Ethernet cable?',
      a: '100 metres, about 328 feet, for Cat 5e through Cat 6A — and that is the full channel, including the patch cords at both ends, which is why the in-wall permanent link is limited to 90 metres. Cat 8 is the exception at 30 metres. Beyond those distances you need a switch in the middle or fiber.',
    },
    {
      q: 'Is Cat 6 good enough for 10 Gbps?',
      a: 'Only for short runs. Cat 6 is rated for 10 Gbps up to roughly 37 metres; past that it falls back to 1 Gbps. Cat 6A is rated for 10 Gbps across the full 100 metres, and since the labour of pulling cable dwarfs the price difference, Cat 6A is the sensible choice for any new installation you expect to keep.',
    },
    {
      q: 'Which WiFi channel should I use on 2.4 GHz?',
      a: '1, 6 or 11, at 20 MHz width — those are the only three that do not overlap each other in the band. Picking anything in between does not find an empty gap; it partially interferes with two networks at once. Scan your specific location and take whichever of the three is least crowded.',
    },
    {
      q: 'What are DFS channels and should I avoid them?',
      a: 'DFS channels, 52 through 144 on 5 GHz, are shared with weather and military radar. The router is legally required to vacate them the instant it detects a radar pulse, which users experience as an abrupt disconnection with no visible cause. They are often less congested, so they are worth using — unless you get unexplained drops, in which case move to 36–48 or 149–165.',
    },
    {
      q: 'What is the lowest ping physically possible?',
      a: 'Light in fiber travels at roughly 200,000 km/s, two-thirds of its vacuum speed, and a ping is a round trip. So the floor is 2 × distance ÷ 200,000 km/s: about 10 ms for 1,000 km, 26 ms for 2,600 km, and around 58 ms across the Atlantic. Real fiber routes are longer than the straight line, so measured figures are always higher.',
    },
    {
      q: 'My ping is three times higher than the theoretical minimum. Is that bad?',
      a: 'It is on the high side but not alarming. Two to two-and-a-half times the floor is normal once you account for routing, switching and the path not being a straight line. Above roughly three times, the extra latency is coming from your ISP’s routing or your local connection rather than from distance, and a traceroute will usually show exactly where.',
    },
    {
      q: 'What are good Core Web Vitals scores?',
      a: 'Largest Contentful Paint at 2.5 seconds or less, Interaction to Next Paint at 200 ms or less, and Cumulative Layout Shift at 0.1 or less — all measured at the 75th percentile of real users. INP replaced First Input Delay in March 2024, so if your dashboard still reports FID it is showing a metric Google no longer uses.',
    },
    {
      q: 'How long does it take to crack a 12-character password?',
      a: 'Against pure brute force at a billion guesses per second, a 12-character mixed-case alphanumeric password has 62¹² combinations and would take on the order of 100,000 years to exhaust. That figure collapses if the password is a dictionary word with predictable substitutions, because real attacks try those first rather than counting through every combination.',
    },
    {
      q: 'Is a long passphrase better than a short complex password?',
      a: 'Almost always, yes. Each additional character multiplies the search space by the size of the alphabet, so length compounds far faster than symbol variety. A 16-character passphrase of ordinary lowercase words beats an 8-character string of mixed symbols by an enormous margin, and it is far easier to type correctly.',
    },
    {
      q: 'What bcrypt cost factor should I use?',
      a: '12 is a reasonable default today; 10 is the practical floor. Each increment doubles the computation, so roughly 65 ms per hash at cost 10 becomes 260 ms at cost 12 on a typical modern core. Measure on your own hardware against your latency budget rather than copying a number, and revisit it every couple of years as hardware gets faster.',
    },
    {
      q: 'Why not just use SHA-256 for passwords?',
      a: 'Because it is fast, and speed is the attacker’s advantage. A GPU can compute billions of SHA-256 hashes per second, so a stolen database falls quickly regardless of the salt. bcrypt, scrypt and Argon2 are deliberately slow and, in the case of the latter two, memory-hard — which removes most of the benefit of specialised cracking hardware.',
    },
  ],

  sources: [
    { name: 'RFC 4632 — Classless Inter-domain Routing (CIDR)', url: 'https://www.rfc-editor.org/rfc/rfc4632', publisher: 'IETF' },
    { name: 'RFC 3021 — using 31-bit prefixes on point-to-point links', url: 'https://www.rfc-editor.org/rfc/rfc3021', publisher: 'IETF' },
    { name: 'ANSI/TIA-568 structured cabling standards', url: 'https://tiaonline.org/products-and-services/tia-standards-and-technology-department/', publisher: 'Telecommunications Industry Association' },
    { name: 'FCC rules on 5 GHz U-NII bands and dynamic frequency selection', url: 'https://www.fcc.gov/general/5-ghz-unlicensed-national-information-infrastructure-u-nii', publisher: 'FCC' },
    { name: 'Core Web Vitals thresholds — LCP, INP and CLS', url: 'https://web.dev/articles/vitals', publisher: 'Google / web.dev' },
    { name: 'Interaction to Next Paint replaces First Input Delay', url: 'https://web.dev/blog/inp-cwv-march-12', publisher: 'Google / web.dev' },
    { name: 'NIST SP 800-63B — Digital Identity Guidelines, memorized secrets', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html', publisher: 'NIST' },
    { name: 'OWASP Password Storage Cheat Sheet — bcrypt work factors', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', publisher: 'OWASP' },
  ],

  replaces: [
    '/en/cidr-subnetting-calculator',
    '/en/ethernet-cable-category-speed-distance',
    '/en/wifi-optimal-channels-24-5-ghz',
    '/en/ping-latency-distance',
    '/en/page-load-time-core-web-vitals',
    '/en/password-cracking-time-length',
    '/en/hashes-bcrypt-costo-tiempo-cracking',
  ],

lastReviewed: '2026-07-28',
};
