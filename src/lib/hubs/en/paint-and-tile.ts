import type { HubData } from '../types';

/**
 * Hub de decisión EN (mercado US) — "How much paint, tile, plaster, membrane
 * and trim do I actually buy?".
 *
 * Las cinco ramas portan las fórmulas vivas del catálogo:
 *   pintura-paredes-litros-por-metros-cuadrados.ts   → paint
 *   pisos-ceramicos.ts + azulejos-baldosas-…-cantidad.ts → tile
 *   revoque-grueso-m3-m2.ts                          → plaster
 *   membrana-asfaltica-rollos.ts                     → membrane
 *   zocalo-metros-lineal.ts                          → baseboard
 *
 * Las constantes no se inventan: se convierten. Cada conversión está anotada
 * abajo con el valor métrico de origen para poder auditarla.
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'construction-materials', idioma en. */
const DISCLAIMER_MATERIALS =
  'Material and quantity estimate. Check coverage, waste, and application against the manufacturer’s specifications or the professional in charge.';

/**
 * Rendimiento de pintura. La fórmula AR usa 10 m²/L por mano, que son
 * 407 sq ft por galón US (10 m² = 107.64 sq ft; 1 gal US = 3.785 L).
 * El rango que declaran los fabricantes americanos es 350–400 sq ft/gal
 * por mano, así que el default acá es 350: más conservador y verificable.
 */
export const PAINT_COVERAGE_DEFAULT = 350;
export const PAINT_COVERAGE_FROM_METRIC = 407;

/**
 * Cobertura de una caja de cerámica. La fórmula AR asume 1.44 m² por caja
 * para piezas de 60×60 cm, que son 15.5 sq ft. La caja americana típica de
 * 12"×24" trae 8 piezas = 15.5 sq ft: coincide.
 */
export const TILE_BOX_SQFT_DEFAULT = 15.5;

/** Thin-set: 5 kg/m² de la fórmula AR = 1.024 lb/sq ft. */
export const THINSET_LB_PER_SQFT = 1.024;
/** Grout: 0.4 kg/m² = 0.082 lb/sq ft. */
export const GROUT_LB_PER_SQFT = 0.082;

/**
 * Revoque: la fórmula AR pide 6 bolsas de cemento de 50 kg por m³ de mortero
 * (300 kg/m³) y 0.9 m³ de arena por m³ de mortero.
 * 300 kg/m³ = 18.73 lb/cu ft. La bolsa americana de cemento Portland es de
 * 94 lb, así que salen 0.199 sacos por pie cúbico de mortero.
 */
export const CEMENT_LB_PER_CUFT = 18.73;
export const CEMENT_SACK_LB = 94;
export const SAND_RATIO = 0.9;

/**
 * Membrana. El rollo argentino cubre 10 m² brutos (107.6 sq ft); el rollo
 * americano de roll roofing se vende por "square" y cubre 100 sq ft netos.
 * El solape del 10% de la fórmula original se mantiene.
 */
export const ROLL_SQFT_DEFAULT = 100;

/**
 * Zócalo. La fórmula AR compra varillas de 2.4 m (7.87 ft) con 8% de merma.
 * El baseboard americano viene en piezas de 8, 12 y 16 ft: el default es 8 ft.
 */
export const TRIM_PIECE_FT = 8;
export const TRIM_WASTE_PCT = 8;
/** Ancho estándar de un vano de puerta interior US (2'-8" a 3'-0"). */
export const DOOR_WIDTH_FT = 3;

export const hub: HubData = {
slug: 'en/home/paint-and-tile',
  title: 'Paint, tile and plaster calculator: how much to buy for a room',
  description:
    'Work out gallons of paint, boxes of tile, cubic feet of plaster, rolls of membrane and feet of baseboard from one set of room dimensions — with the waste allowance and the whole-unit rounding already applied.',
  silo: 'Home & Building',
siloHref: '/en/home',
  locale: 'en',

  eyebrow: 'US · surface materials · buy-list',
  h1: 'How much paint, tile and plaster do I buy?',
  lede:
    'Every surface job ends at the same counter question: how many gallons, how many boxes, how many pieces. Give the room once — length, width, ceiling height and the openings you are not covering — and pick the material. The answer already includes the waste allowance and the round-up to whole cans, boxes and sticks, because the store does not sell you 2.3 gallons.',
  stamps: [
    'Coverage in sq ft · gallons · boxes · pieces',
    'Waste allowance and whole-unit rounding included',
    '6 calculators inside',
  ],

  resultLabel: 'What to put in the cart',

  cases: {
    title: 'What are you buying?',
    intro:
      'Same room, five different shopping lists. The dimensions stay put; only the coverage rule changes.',
    items: [
      {
        id: 'paint',
        label: 'Paint for the walls',
        hint: 'Gallons · coats · openings subtracted',
        answer: 'Wall area minus openings, times coats, divided by the coverage on the can.',
        yes: [
          'Wall area is the room perimeter times ceiling height, minus every door and window you are not painting',
          'Each coat is a full pass over that area — two coats over bare drywall is the realistic default',
          'The coverage number printed on the can (typically 350–400 sq ft per gallon) is for one coat on a smooth, primed surface',
          'A waste allowance covers roller loss, tray leftovers and the touch-up you will want in six months',
          'Ceilings, trim and doors are separate jobs with their own coverage — run them one at a time',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Rough, porous or previously unpainted surfaces can drop real coverage by a third: sand, prime, then measure again',
          'A dark-to-light color change is not two coats, it is a primer plus two coats — budget for three passes',
          'Buy all cans of a custom color in one order and box them together (mix them in a single bucket): can-to-can shade drift is real',
        ],
        plazo: 'buy the full quantity in one trip — a second batch of tinted paint rarely matches the first exactly.',
      },
      {
        id: 'tile',
        label: 'Floor or wall tile',
        hint: 'Boxes · thin-set · grout',
        answer: 'Boxes come from area plus waste, divided by the square feet each box covers.',
        yes: [
          'Floor area is length times width; wall tile uses the wall area instead',
          'The waste allowance covers perimeter cuts, and it needs to go up for diagonal or herringbone layouts',
          'Boxes only sell whole, so the result always rounds up — the surplus is your spare stock',
          'Thin-set mortar runs about 1 lb per square foot for standard tile, more for large-format',
          'Grout is roughly 0.08 lb per square foot at a typical joint width',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Order every box from the same production lot: different lots shade differently and the mismatch is permanent',
          'Keep one full box unopened as spares — patterns get discontinued and a single cracked tile then costs you the floor',
          'A diagonal or herringbone layout needs 15–20% waste, not 10% — the perimeter cuts double',
          'Large-format tile (15 in and up) needs a medium-bed mortar and roughly 50% more of it',
        ],
        plazo: 'let the thin-set cure per the bag before grouting, and keep traffic off the floor until then.',
      },
      {
        id: 'plaster',
        label: 'Plaster, stucco or render coat',
        hint: 'Cubic feet · cement sacks · sand',
        answer: 'Volume is the wall area times the coat thickness — the sacks follow from the mix.',
        yes: [
          'Volume in cubic feet is the wall area in square feet times the thickness in inches, divided by 12',
          'A scratch-and-brown render mix runs about 18.7 lb of Portland cement per cubic foot of mortar',
          'Sand comes in at roughly 0.9 cubic feet per cubic foot of finished mortar',
          'Wall irregularity is the hidden variable: a wavy substrate can eat an extra 20% of volume',
          'Cement sacks and sand round up to whole units — nobody sells you two thirds of a sack',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'This is a materials estimate, not a mix design: strength, admixtures and curing belong to the spec or the contractor',
          'Do not mix more than you can place in the working time on the bag — cement does not wait',
          'Exterior stucco is a three-coat system (scratch, brown, finish) under most codes: run the thickness for each coat separately',
        ],
        plazo: 'keep the coat damp-cured for the time the bag specifies, or it cracks as it dries.',
      },
      {
        id: 'membrane',
        label: 'Roof membrane or roll roofing',
        hint: 'Rolls · overlap included',
        answer: 'Roof area plus the overlap, divided by the square feet a roll actually covers.',
        yes: [
          'The area here is the roof surface, not the floor plan — a pitched roof is larger than the footprint underneath it',
          'The overlap between courses is dead material: a 10% allowance is the standard starting point',
          'A US roll of roll roofing covers about 100 net square feet (one "square" is 100 sq ft of finished roof)',
          'Rolls sell whole, so the surplus is real and worth keeping for flashings and repairs',
          'Parapets, curbs and penetrations all need their own turn-up — measure them in',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Roll roofing and torch-applied membrane are low-slope products: most manufacturers void the warranty below a minimum pitch',
          'A torch on a roof is a fire risk with a real ignition history — this is the branch where hiring out is usually the right call',
          'Overlap is measured along the seam, not the sheet: skimping there is where leaks start',
        ],
        plazo: 'apply in dry weather above the minimum temperature on the datasheet — cold membrane will not bond.',
      },
      {
        id: 'baseboard',
        label: 'Baseboard and trim',
        hint: 'Linear feet · 8 ft sticks',
        answer: 'Perimeter minus the door openings, plus waste, divided into 8 ft sticks.',
        yes: [
          'Linear feet is the room perimeter minus the width of every door opening',
          'A standard interior door opening eats about 3 ft of run',
          'The waste allowance covers miters and coped inside corners — 8% is the working default',
          'Trim sells in 8, 12 and 16 ft sticks: longer sticks mean fewer joints on a long wall',
          'Buy the whole run at once so the profile and the finish match',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Long walls should get a single long stick, not two short ones spliced — a scarf joint in the middle of a wall always shows',
          'Prime or seal the back and the cut ends before installing, or humidity will open the miters',
        ],
        plazo: 'let the trim acclimate in the room for a couple of days before cutting, especially solid wood.',
      },
    ],
  },

  inputsTitle: 'Your room',
  inputsIntro:
    'Feet and inches. Fill it once and switch between the five materials — the dimensions carry across.',
  fields: [
    {
      id: 'len_ft',
      label: 'Room length (ft)',
      type: 'number',
      value: 16,
      min: 0,
      step: 0.5,
      help: 'For roof membrane, use the length of the roof surface, not the floor plan.',
    },
    {
      id: 'wid_ft',
      label: 'Room width (ft)',
      type: 'number',
      value: 12,
      min: 0,
      step: 0.5,
      help: 'Length times width gives the floor area used by the tile and membrane branches.',
    },
    {
      id: 'hgt_ft',
      label: 'Ceiling height (ft)',
      type: 'number',
      value: 8,
      min: 0,
      step: 0.25,
      help: 'Drives the wall area used by the paint and plaster branches. US standard is 8 ft.',
    },
    {
      id: 'openings_sqft',
      label: 'Doors and windows to subtract (sq ft)',
      type: 'number',
      value: 40,
      min: 0,
      step: 1,
      help: 'An interior door is about 21 sq ft; a typical double-hung window about 12 sq ft.',
    },
    {
      id: 'coverage',
      label: 'Coverage per unit (sq ft)',
      type: 'number',
      value: 350,
      min: 1,
      step: 1,
      help: 'Per gallon of paint (350–400), per box of tile (about 15.5), or per roll of membrane (about 100).',
    },
    {
      id: 'coats',
      label: 'Number of coats',
      type: 'number',
      value: 2,
      min: 1,
      max: 4,
      step: 1,
      help: 'Paint only. Two coats is the realistic default over primed drywall.',
    },
    {
      id: 'thick_in',
      label: 'Plaster coat thickness (in)',
      type: 'number',
      value: 0.75,
      min: 0.125,
      max: 3,
      step: 0.125,
      help: 'Plaster branch only. A scratch coat runs 3/8 in, a brown coat 3/8 in, a full render 3/4 in.',
    },
    {
      id: 'doors',
      label: 'Door openings in the room',
      type: 'number',
      value: 2,
      min: 0,
      max: 12,
      step: 1,
      help: 'Baseboard branch only: each opening removes about 3 ft of trim run.',
    },
    {
      id: 'waste_pct',
      label: 'Waste allowance (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 40,
      step: 1,
      help: '10% is the working default. Diagonal tile wants 15–20%; membrane uses this as the overlap.',
    },
  ],
  fineprint: DISCLAIMER_MATERIALS,

  chart: {
    type: 'donut',
    title: 'What you pay for versus what ends up on the wall',
    caption:
      'Splits the purchase into three parts: the material that actually covers the surface, the waste allowance you deliberately added, and the surplus you get for free because cans, boxes and sticks only sell whole.',
  },
  breakdownTitle: 'From dimensions to the shopping list',
  breakdownIntro:
    'Every line is a step you can check by hand: area, waste, coverage rate, and the round-up to whole units.',

  faq: [
    {
      q: 'How many square feet does a gallon of paint really cover?',
      a: 'Manufacturers print 350 to 400 square feet per gallon, and that number assumes one coat on a smooth, primed, non-porous surface with a roller. Real conditions cut into it: bare drywall drinks the first coat, textured or knockdown walls add surface area you cannot see in the tape measure, and spraying loses material to overspray. If the wall has never been painted, plan on the low end or prime first. The calculator uses 350 as a conservative default; if your can says otherwise, put its number in.',
    },
    {
      q: 'Do I subtract windows and doors from the wall area?',
      a: 'Subtract them if you are not painting them. A standard interior door is roughly 21 square feet of opening and a double-hung window about 12, so a bedroom with one door and two windows loses around 45 square feet — enough to change the can count on a small room. What you should not subtract is trim, outlet plates or a fireplace surround: those are small, and the offcuts and touch-ups absorb them.',
    },
    {
      q: 'Why does the tile answer always round up to a whole box?',
      a: 'Because that is how tile is sold. A box covers a fixed area — commonly around 15.5 square feet — and the store will not break one open for you. The rounding is not waste, it is your spare stock. Keep the surplus sealed and labeled: tile patterns get discontinued within a couple of years, and a single cracked tile with no match means recutting a whole field.',
    },
    {
      q: 'How much waste should I actually allow for tile?',
      a: 'Ten percent is the baseline for a straight grid layout in a rectangular room. Go to 15% if the room has jogs, a diagonal layout, or tile larger than 15 inches. Go to 20% for herringbone or any pattern where every perimeter piece is a compound cut. Rooms with lots of small obstructions — a bathroom with a toilet flange, a vanity and a curbed shower — sit at the high end even with a straight layout.',
    },
    {
      q: 'How much thin-set and grout do I need?',
      a: 'For standard-size tile with a 1/4 by 3/8 inch notched trowel, budget about 1 pound of thin-set per square foot, which puts a 50 lb bag at roughly 50 square feet. Large-format tile needs a medium-bed mortar and a bigger trowel, which pushes consumption up by about half. Grout is much lighter: roughly 0.08 pounds per square foot at a typical joint width, so a 10 lb bag covers a small bathroom floor. Wider joints and thicker tile both increase grout consumption.',
    },
    {
      q: 'How do I turn plaster or stucco area into bags?',
      a: 'Volume first, then weight. Wall area in square feet times thickness in inches, divided by 12, gives cubic feet. A typical render mix carries about 18.7 pounds of Portland cement per cubic foot of mortar, so a 94 lb sack covers roughly 5 cubic feet of mortar, and sand runs about 0.9 cubic feet per cubic foot of finished mortar. If you are using a pre-blended stucco or plaster in bags, skip the mix math entirely and use the coverage table on the bag — it is per bag at a stated thickness.',
    },
    {
      q: 'Is roof area the same as the floor area of the house?',
      a: 'No, and this is the most common error in a roofing estimate. A pitched roof is longer than the footprint under it. A 4:12 pitch adds about 5% to the area, 6:12 adds about 12%, and 9:12 adds about 25%. If you measure the plan and buy for the plan on a steep roof, you will be short by several rolls. Measure the actual slope length, or multiply the footprint by the pitch factor before you use this calculator.',
    },
    {
      q: 'What is a "square" in roofing?',
      a: 'One hundred square feet of finished roof surface. It is the unit contractors quote in, and roll products are sized around it: a standard roll of roll roofing covers about one square net after the overlap. Two thousand square feet of roof is 20 squares. Note that the net coverage is what matters — a roll may contain more material than it covers, because the overlap between courses is consumed twice.',
    },
    {
      q: 'How much overlap does membrane roofing need?',
      a: 'Follow the manufacturer, but the common figures are 3 to 4 inches on the side laps and 6 inches on the end laps, which works out to roughly the 10% allowance this calculator uses by default. Overlaps are not the place to economize: nearly every low-slope roof failure starts at a seam. Add extra material for turn-ups at parapets, curbs and penetrations, which are not in the flat area at all.',
    },
    {
      q: 'How many sticks of baseboard should I buy?',
      a: 'Take the room perimeter, subtract about 3 feet for each door opening, add 8% for miters and coped corners, and divide by the stick length. The catch is that the arithmetic ignores where the joints land. A 14 ft wall needs one 16 ft stick, not two 8 ft ones — a scarf joint in the middle of a long wall is visible forever, no matter how well you cut it. Lay the walls out on paper before you commit to a stick length.',
    },
    {
      q: 'Should I buy extra material on purpose?',
      a: 'For anything with a color, a lot number or a discontinuation risk — tile, custom-tinted paint, patterned trim — yes. The marginal cost of one extra box is small; the cost of matching it three years later is a whole room. For commodity items with no shade variation, such as Portland cement or sand, buy what you need and pick up more if you run short, since bagged cement goes off in storage once it takes on humidity.',
    },
    {
      q: 'Do these numbers work in metric too?',
      a: 'Yes, the underlying math is unit-agnostic — area divided by coverage. The conversions worth remembering: 1 US gallon is 3.785 liters, 1 square meter is 10.764 square feet, and a coverage of 10 m² per liter is the same as 407 square feet per gallon. If you are reading a European or Latin American datasheet that quotes m² per liter, multiply by 40.7 to get square feet per US gallon.',
    },
  ],

  sources: [
    {
      name: 'Paint coverage and estimating guidance',
      url: 'https://www.paintquality.com/en/how-to/planning-and-preparation/how-much-paint-do-i-need',
      publisher: 'Paint Quality Institute',
    },
    {
      name: 'TCNA Handbook — tile installation, mortar coverage and movement joints',
      url: 'https://www.tcnatile.com/products-and-services/publications/tcna-handbook/',
      publisher: 'Tile Council of North America',
    },
    {
      name: 'ASTM C926 — Standard Specification for Application of Portland Cement-Based Plaster',
      url: 'https://www.astm.org/c0926-24.html',
      publisher: 'ASTM International',
    },
    {
      name: 'Portland Cement Association — cement and concrete basics, mix proportions',
      url: 'https://www.cement.org/cement-concrete/',
      publisher: 'Portland Cement Association',
    },
    {
      name: 'NRCA — low-slope roofing systems and lap requirements',
      url: 'https://www.nrca.net/technical',
      publisher: 'National Roofing Contractors Association',
    },
    {
      name: 'NIST Handbook 44 / SI conversion factors (gallon, square foot, pound)',
      url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion',
      publisher: 'NIST',
    },
  ],

  replaces: [
    '/en/paint-coverage-liters-per-square-meter',
    '/en/ceramic-tile-calculator',
    '/en/tile-boxes-coverage-calculator',
    '/en/baseboard-linear-meters',
    '/en/rough-plaster-mortar-calculator',
    '/en/membrana-asfaltica-rollos',
  ],

lastReviewed: '2026-07-28',
};
