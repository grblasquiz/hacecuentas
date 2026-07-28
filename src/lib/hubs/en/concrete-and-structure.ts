import type { HubData } from '../types';

/**
 * Hub de decisión EN (mercado US) — "How much concrete, steel and brick does
 * this take, and how big does the element have to be?".
 *
 * Ramas y fórmulas vivas portadas:
 *   zapata-corrida-m3-hormigon.ts            → strip footing
 *   zapata-aislada-columnas.ts               → spread footing
 *   viga-hormigon-h-b-dimensiones.ts         → beam pre-sizing
 *   acero-kg-m2-losa.ts                      → slab rebar
 *   cantidad-ladrillos-metro-cuadrado-pared.ts → brick / block wall
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'construction-structural', idioma en. */
const DISCLAIMER_STRUCTURAL =
  'Preliminary estimate. It does not replace structural calculations, technical documents, or supervision by a licensed professional.';

/** Peso unitario del hormigón normal: 150 lb/cu ft (2,400 kg/m³). */
export const CONCRETE_LB_PER_CUFT = 150;

/**
 * Cemento del mortero/hormigón de la fórmula original: 10 bolsas de 50 kg por
 * m³ = 500 kg/m³ = 31.2 lb/cu ft. Es una dosificación RICA (el hormigón
 * estructural típico va de 300 a 350 kg/m³); se conserva el número original y
 * se declara en el desglose para que se pueda auditar.
 */
export const CEMENT_LB_PER_CUFT_CONCRETE = 31.2;

/** Rinde de una bolsa de premezcla americana de 80 lb: 0.60 cu ft. */
export const PREMIX_80LB_YIELD_CUFT = 0.6;
/** Rinde de una bolsa de 60 lb: 0.45 cu ft. */
export const PREMIX_60LB_YIELD_CUFT = 0.45;

/**
 * Tensión admisible del suelo por defecto. La fórmula AR arranca en
 * 150 kN/m², que son 3,133 psf. El default acá es 2,000 psf, el valor
 * presuntivo del IBC Table 1806.2 para arcillas y limos arenosos — más
 * conservador y verificable contra código US.
 */
export const SOIL_PSF_DEFAULT = 2000;
export const SOIL_PSF_FROM_METRIC = 3133;

/**
 * Predimensionado de viga: h = luz/12, b = h/2. La versión métrica calcula
 * h_cm = luz_m × 100 / 12. En unidades imperiales la relación colapsa a algo
 * más limpio: h en pulgadas = luz en pies. Es la misma regla L/12.
 */
export const BEAM_SPAN_DIVISOR = 12;

/**
 * Cuantía de acero por tipo de losa. Valores originales en kg/m² convertidos
 * a lb/sq ft (1 kg/m² = 0.20482 lb/sq ft).
 */
export const SLAB_STEEL = [
  { id: 'joist', label: 'Joist and infill-block slab', kgM2: [7, 10], lbSqft: [1.43, 2.05] },
  { id: 'solid', label: 'Solid reinforced concrete slab', kgM2: [10, 15], lbSqft: [2.05, 3.07] },
  { id: 'lightweight', label: 'Lightweight / voided slab', kgM2: [8, 12], lbSqft: [1.64, 2.46] },
];

/**
 * Unidades de mampostería por pie cuadrado de muro, para el mercado US.
 * Los valores del catálogo original están en piezas/m²; acá se usan las
 * cifras publicadas por la Brick Industry Association y NCMA, que son las que
 * un proveedor americano va a confirmar. La diferencia contra la conversión
 * directa del valor métrico se declara en el desglose.
 */
export const MASONRY = [
  { id: 'modular', label: 'Modular clay brick, 3-5/8 × 2-1/4 × 7-5/8 in', perSqft: 6.86, lb: 4.5, metricPerSqft: 6.97 },
  { id: 'queen', label: 'Queen size brick, 2-3/4 in high', perSqft: 5.76, lb: 5.1, metricPerSqft: 5.76 },
  { id: 'utility', label: 'Utility brick, 3-5/8 × 3-5/8 × 11-5/8 in', perSqft: 3.0, lb: 9.0, metricPerSqft: 3.0 },
  { id: 'cmu', label: 'Concrete block (CMU), 8 × 8 × 16 in', perSqft: 1.125, lb: 33, metricPerSqft: 1.21 },
  { id: 'double', label: 'Double-wythe solid brick wall', perSqft: 13.72, lb: 4.5, metricPerSqft: 12.45 },
  { id: 'uk', label: 'Standard UK metric brick, 215 × 65 × 102.5 mm', perSqft: 5.57, lb: 5.5, metricPerSqft: 5.57 },
];

/** Mortero: 7 cu ft por cada 1.000 ladrillos modulares (Brick Industry Association). */
export const MORTAR_CUFT_PER_1000 = 7;
/** Peso del mortero fresco: 125 lb/cu ft. */
export const MORTAR_LB_PER_CUFT = 125;

export const hub: HubData = {
slug: 'en/home/concrete-and-structure',
  title: 'Concrete, rebar and brick calculator: footings, beams, slabs, walls',
  description:
    'Size a strip footing, a spread footing, a beam and a masonry wall, and get the concrete in cubic yards, the premix bags, the rebar weight and the brick count — with the imperial conversions of every constant shown.',
  silo: 'Home & Building',
siloHref: '/en/home',
  locale: 'en',

  eyebrow: 'US · structure · take-off and pre-sizing',
  h1: 'How much concrete, steel and brick does this take?',
  lede:
    'Two questions travel together on any structural element: how big does it have to be, and how much material does that mean. This runs both. Give the span, the load and the soil, pick the element, and you get the dimension a preliminary sizing rule produces plus the cubic yards, bags, pounds of rebar and brick count that follow from it.',
  stamps: [
    'Cubic yards · premix bags · lb of rebar · brick count',
    'Presumptive soil bearing per IBC Table 1806.2',
    '5 calculators inside',
  ],

  resultLabel: 'Size and quantity',

  cases: {
    title: 'Which element are you working on?',
    intro:
      'Preliminary sizing rules and material take-offs. The dimensions you enter carry across all five, so you can walk the whole structure without retyping.',
    items: [
      {
        id: 'strip',
        label: 'Strip footing under a wall',
        hint: 'Cubic yards · premix bags · truck weight',
        answer: 'Volume is length times width times depth — the rest is how you buy it.',
        yes: [
          'Volume in cubic feet is length in feet times width and depth in inches divided by 12',
          'Twenty-seven cubic feet make one cubic yard, which is how ready-mix is ordered and priced',
          'An 80 lb bag of premix yields about 0.60 cubic feet, so bag mixing stops making sense somewhere around half a yard',
          'Concrete weighs about 150 lb per cubic foot, which is what tells you whether the pour needs a truck or a wheelbarrow',
          'A waste allowance covers spillage, over-excavation and the low spot you did not measure',
        ],
        warn: [
          DISCLAIMER_STRUCTURAL,
          'Footing width, depth and reinforcement come from the load and the soil, not from this arithmetic — this branch only converts a decided size into material',
          'Footings must bear below the local frost depth: in cold climates that is the governing dimension, not the load',
          'Ready-mix is sold in quarter-yard increments with a minimum load charge: rounding up beats a second delivery',
        ],
        plazo: 'order ready-mix a couple of days ahead and have the forms, the crew and the finishing tools ready before the truck arrives.',
      },
      {
        id: 'spread',
        label: 'Spread footing under a column',
        hint: 'Bearing area · square side · pressure check',
        answer: 'Required bearing area is the column load divided by the allowable soil pressure.',
        yes: [
          'Bearing area in square feet is the service load in pounds divided by the allowable soil pressure in pounds per square foot',
          'The side of a square footing is the square root of that area, then rounded up to a build-friendly increment',
          'IBC Table 1806.2 gives presumptive values when there is no soils report: 1,500 psf for clay, 2,000 psf for silty and clayey sand, 3,000 psf for sandy gravel',
          'Rounding the side up always lowers the actual bearing pressure, which is the safe direction',
          'The footing thickness and its reinforcement are a separate check — punching shear governs, not bearing',
        ],
        warn: [
          DISCLAIMER_STRUCTURAL,
          'Presumptive soil values are a fallback, not a substitute for a geotechnical report — on expansive clay or fill they can be dangerously optimistic',
          'This checks bearing only. Punching shear, one-way shear, overturning and settlement all have to be verified separately by an engineer',
          'Footings near a property line or an existing foundation change the problem completely: eccentric and stepped footings are not this calculation',
        ],
        plazo: 'get the soil classified before the excavation is backfilled — after that you are guessing.',
      },
      {
        id: 'beam',
        label: 'Concrete beam pre-sizing',
        hint: 'Depth · width · concrete volume',
        answer: 'A first-pass depth is about one inch for every foot of clear span.',
        yes: [
          'The classic pre-sizing rule is depth equal to span over twelve, with width about half the depth',
          'In imperial units that rule collapses to something you can do in your head: depth in inches equals the clear span in feet',
          'A 20 ft span therefore starts at roughly a 20 in deep by 10 in wide beam before any real analysis',
          'The result rounds up to whole inches because formwork does',
          'Concrete volume follows directly from depth, width and span',
        ],
        warn: [
          DISCLAIMER_STRUCTURAL,
          'This is a starting dimension for a first sketch, nothing more: the real section comes from moment, shear, deflection limits and the reinforcement that fits',
          'Deflection, not strength, usually governs long spans — a beam that passes strength can still bounce and crack the finishes above it',
          'Concentrated loads, cantilevers and continuity over supports all break the span-over-twelve rule',
        ],
        plazo: 'settle the beam depth before the mechanical layout, or the ductwork and the beam will fight over the same ceiling space.',
      },
      {
        id: 'slab',
        label: 'Rebar for a slab',
        hint: 'lb per sq ft · total weight · tons',
        answer: 'Reinforcement ratios run 1.4 to 3.1 lb per square foot depending on the slab type.',
        yes: [
          'A joist-and-block slab typically carries 1.4 to 2.0 lb of steel per square foot',
          'A solid reinforced slab is heavier: 2.0 to 3.1 lb per square foot',
          'A lightweight or voided slab sits in between at 1.6 to 2.5 lb per square foot',
          'Multiply by the slab area for the order weight, and add 5 to 10% for laps and offcuts',
          'Steel is ordered and priced by weight, so pounds and tons are the useful units, not bar counts',
        ],
        warn: [
          DISCLAIMER_STRUCTURAL,
          'These are budgeting ratios drawn from typical built work, not a design: the actual bar schedule comes from the engineer',
          'Lap lengths, cover and bar spacing are code requirements — cutting them to save weight is how slabs fail',
          'The ratio says nothing about where the steel goes: top steel over supports is what stops the cracks a bottom-only mat will not',
        ],
        plazo: 'confirm the bar schedule before ordering — mill-cut lengths take longer to source than stock bar.',
      },
      {
        id: 'masonry',
        label: 'Brick or block wall',
        hint: 'Units · mortar · wall weight',
        answer: 'Unit count is the wall area times the units per square foot, plus a breakage allowance.',
        yes: [
          'A modular clay brick with a 3/8 inch joint lays 6.86 units per square foot of single-wythe wall',
          'An 8 by 8 by 16 inch concrete block lays 1.125 units per square foot',
          'A double-wythe solid brick wall doubles the count, and roughly doubles the weight the footing has to carry',
          'Mortar runs about 7 cubic feet per thousand modular brick',
          'A breakage allowance of 5 to 10% covers cuts, chipped units and the ones that arrive broken',
        ],
        warn: [
          DISCLAIMER_STRUCTURAL,
          'Whether the wall is structural or a veneer changes everything about it — ties, lintels, bond beams and reinforcement are not in this count',
          'Wall weight matters: a double-wythe brick wall runs over 60 lb per square foot of face, which the footing below has to be sized for',
          'Order all units in one delivery from one production run — color and texture drift between batches and the seam never disappears',
        ],
        plazo: 'protect the units and the mortar from rain and freezing before and during the lay-up.',
      },
    ],
  },

  inputsTitle: 'The element',
  inputsIntro:
    'Feet for length and span, inches for section, pounds for load. Only the fields your branch uses affect the answer.',
  fields: [
    {
      id: 'span_ft',
      label: 'Length or clear span (ft)',
      type: 'number',
      value: 20,
      min: 0,
      step: 0.5,
      help: 'Footing run for a strip footing, clear span for a beam.',
    },
    {
      id: 'wid_in',
      label: 'Width (in)',
      type: 'number',
      value: 24,
      min: 0,
      step: 1,
      help: 'Footing width. The beam branch derives its own width from the depth.',
    },
    {
      id: 'dep_in',
      label: 'Depth or thickness (in)',
      type: 'number',
      value: 12,
      min: 0,
      step: 1,
      help: 'Footing depth, or slab thickness for the rebar branch.',
    },
    {
      id: 'load_lb',
      label: 'Column service load (lb)',
      type: 'number',
      value: 40000,
      min: 0,
      step: 1000,
      help: 'Unfactored load arriving at the top of the footing. 40,000 lb is a typical two-story interior column.',
    },
    {
      id: 'soil_psf',
      label: 'Allowable soil bearing pressure (psf)',
      type: 'number',
      value: 2000,
      min: 250,
      step: 250,
      help: 'IBC Table 1806.2 presumptive values: 1,500 clay · 2,000 silty or clayey sand · 3,000 sandy gravel.',
    },
    {
      id: 'area_sqft',
      label: 'Slab or wall area (sq ft)',
      type: 'number',
      value: 400,
      min: 0,
      step: 10,
      help: 'Used by the rebar and masonry branches. Wall area is face area, openings already subtracted.',
    },
    {
      id: 'slab_type',
      label: 'Slab type',
      type: 'select',
      value: 'solid',
      options: [
        { value: 'joist', label: 'Joist and infill-block slab' },
        { value: 'solid', label: 'Solid reinforced concrete slab' },
        { value: 'lightweight', label: 'Lightweight or voided slab' },
      ],
      help: 'Sets the reinforcement ratio range used for the steel weight.',
    },
    {
      id: 'unit_type',
      label: 'Masonry unit',
      type: 'select',
      value: 'modular',
      options: [
        { value: 'modular', label: 'Modular clay brick (US standard)' },
        { value: 'queen', label: 'Queen size brick' },
        { value: 'utility', label: 'Utility brick' },
        { value: 'cmu', label: 'Concrete block, 8 × 8 × 16 in' },
        { value: 'double', label: 'Double-wythe solid brick wall' },
        { value: 'uk', label: 'Standard UK metric brick' },
      ],
      help: 'Sets the units per square foot and the unit weight.',
    },
    {
      id: 'waste_pct',
      label: 'Waste or breakage allowance (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 30,
      step: 1,
      help: '5 to 10% is normal. Go higher on a job with many cuts or a difficult delivery.',
    },
  ],
  fineprint: DISCLAIMER_STRUCTURAL,

  chart: {
    type: 'donut',
    title: 'What this element weighs, by material',
    caption:
      'Structural quantities are easiest to sanity-check by weight: it is what the truck carries, what the crane lifts and what the footing underneath has to hold. The split shows the cement, the aggregate and water, the reinforcing steel and the masonry and mortar that make up the element.',
  },
  breakdownTitle: 'From dimensions to the delivery ticket',
  breakdownIntro:
    'Sizing first, then volume, then the units the supplier actually sells: cubic yards, bags, pounds and pieces.',

  faq: [
    {
      q: 'How many cubic yards of concrete do I need?',
      a: 'Multiply length, width and depth in feet to get cubic feet, then divide by 27. The trap is mixing units: a footing 20 feet long, 24 inches wide and 12 inches deep is 20 × 2 × 1 = 40 cubic feet, which is 1.48 cubic yards, not 480 of anything. Ready-mix is ordered in quarter-yard steps and almost always carries a short-load charge below about 3 yards, so round up rather than risk a second truck.',
    },
    {
      q: 'When should I bag-mix instead of ordering ready-mix?',
      a: 'An 80 lb bag yields about 0.60 cubic feet, so a cubic yard takes 45 bags — roughly 3,600 pounds you have to carry, open and mix. Below about a quarter yard (12 bags) bag mixing is clearly right. Above half a yard it becomes a long, hot day with an uneven result, because bag-to-bag water content varies and cold joints form while you mix the next batch. Anything structural and continuous should be one pour from one source.',
    },
    {
      q: 'What soil bearing pressure should I assume?',
      a: 'If you have a geotechnical report, use its number and nothing else. Without one, IBC Table 1806.2 gives presumptive values: 1,500 psf for clay and silty clay, 2,000 psf for sandy silt and clayey sand, 3,000 psf for sandy gravel and gravel, and 12,000 psf for crystalline bedrock. This calculator defaults to 2,000 psf. Note that presumptive values assume undisturbed natural soil — engineered fill, organic soil and expansive clay all fall outside the table and need testing.',
    },
    {
      q: 'How big does a spread footing under a column need to be?',
      a: 'For bearing, divide the service load by the allowable soil pressure and take the square root for a square footing. A 40,000 lb column on 2,000 psf soil needs 20 square feet, so about 4 ft 6 in square. That is only the bearing check: the footing also has to be thick enough to resist punching shear around the column, and reinforced for the bending it sees as a cantilever off the column face. Those two usually set the thickness, and they are engineer territory.',
    },
    {
      q: 'How deep should a concrete beam be?',
      a: 'The traditional first pass is span over twelve for depth and half of that for width. In imperial units it is memorable: depth in inches equals the clear span in feet, so a 20 ft span starts at a 20 by 10 in beam. Treat that as a placeholder for coordination, not a design. Deflection limits, concentrated loads, continuity over supports and the space the reinforcement actually needs all push the real number around, sometimes by a lot.',
    },
    {
      q: 'How much rebar goes into a slab?',
      a: 'As a budgeting figure, a solid reinforced slab carries 2.0 to 3.1 pounds of steel per square foot, a joist-and-block slab 1.4 to 2.0, and a lightweight or voided slab 1.6 to 2.5. A 400 square foot solid slab therefore lands between 820 and 1,230 pounds of steel. Add 5 to 10% for laps and offcuts. These ratios are useful for pricing and for checking that a supplier quote is in the right universe; they are not a bar schedule.',
    },
    {
      q: 'How many bricks are in a square foot of wall?',
      a: 'A modular clay brick with standard 3/8 inch joints gives 6.86 units per square foot of single-wythe wall — the figure the Brick Industry Association publishes and every US supplier quotes. Queen size gives 5.76, utility brick 3.0, and an 8 by 8 by 16 inch concrete block 1.125. A double-wythe solid brick wall is two leaves, so about 13.7 per square foot of face. Add 5 to 10% for breakage and cuts on top of any of them.',
    },
    {
      q: 'How much mortar does a brick wall take?',
      a: 'About 7 cubic feet of mortar per thousand modular brick with standard joints, which is roughly 875 pounds of wet mortar. Concrete block takes less per square foot of wall because there are fewer, larger joints, but the joints themselves are thicker. Waste is high with mortar — what boards up, what stiffens past working time, and what falls — so 10 to 15% over the theoretical figure is normal on a real wall.',
    },
    {
      q: 'What does a masonry wall weigh?',
      a: 'A single wythe of modular brick runs about 35 to 40 pounds per square foot of face including mortar; a double-wythe wall is over 60; an 8 inch hollow concrete block wall about 38 to 55 depending on whether the cores are grouted. That number matters twice: the footing has to carry it, and on a retrofit the existing structure may not have been sized for it. Swapping a stud wall for a masonry one without checking the foundation is a classic and expensive mistake.',
    },
    {
      q: 'Do I need a permit and an engineer for this work?',
      a: 'Almost always for anything structural. Footings, beams, retaining walls and load-bearing masonry are permitted work in essentially every US jurisdiction, and most require sealed drawings from a licensed engineer or architect. The inspection sequence matters too — footing excavations and reinforcement are typically inspected before the pour, and concrete placed before that inspection can be ordered removed. Check with the local building department before excavating, not after.',
    },
    {
      q: 'How do the metric values in the original formulas convert?',
      a: 'The conversions used here are: 1 cubic meter is 35.31 cubic feet or 1.308 cubic yards; concrete at 2,400 kg per cubic meter is 150 pounds per cubic foot; 1 kg per square meter of reinforcement is 0.2048 pounds per square foot; and 150 kN per square meter of soil bearing is 3,133 psf. Where a metric source constant and a published US figure disagree — as they do slightly on bricks per unit area — this calculator uses the US figure and shows the metric one alongside it.',
    },
    {
      q: 'Why does the cement content look high compared to a normal mix?',
      a: 'Because the underlying rule of thumb this calculator ports assumes ten 50 kg sacks of cement per cubic meter, which is 500 kg per cubic meter or 31.2 pounds per cubic foot. That is a rich site mix aimed at small hand-batched footings where compaction is poor. Structural ready-mix is typically proportioned at 300 to 350 kg per cubic meter and reaches higher strength with less cement because it is properly graded, dosed and vibrated. If you are ordering ready-mix, specify a strength class and let the plant proportion it.',
    },
  ],

  sources: [
    {
      name: 'International Building Code, Table 1806.2 — presumptive load-bearing values of soils',
      url: 'https://codes.iccsafe.org/content/IBC2021P1/chapter-18-soils-and-foundations',
      publisher: 'International Code Council',
    },
    {
      name: 'ACI 318 — Building Code Requirements for Structural Concrete',
      url: 'https://www.concrete.org/store/productdetail.aspx?ItemID=318U19',
      publisher: 'American Concrete Institute',
    },
    {
      name: 'Brick Industry Association — Technical Notes on Brick Construction (estimating brick and mortar quantities)',
      url: 'https://www.gobrick.com/read-research/technical-notes',
      publisher: 'Brick Industry Association',
    },
    {
      name: 'NCMA TEK — concrete masonry unit properties and wall weights',
      url: 'https://ncma.org/resource-category/tek/',
      publisher: 'Concrete Masonry & Hardscapes Association',
    },
    {
      name: 'Portland Cement Association — Design and Control of Concrete Mixtures',
      url: 'https://www.cement.org/cement-concrete/',
      publisher: 'Portland Cement Association',
    },
    {
      name: 'CRSI — Manual of Standard Practice (reinforcing steel weights and laps)',
      url: 'https://www.crsi.org/resources/',
      publisher: 'Concrete Reinforcing Steel Institute',
    },
  ],

  replaces: [
    '/en/continuous-footing-m3-concrete',
    '/en/isolated-footing-columns',
    '/en/concrete-beam-sizing-dimensions',
    '/en/steel-kg-m2-slab',
    '/en/bricks-per-square-meter-wall',
  ],

lastReviewed: '2026-07-28',
};
