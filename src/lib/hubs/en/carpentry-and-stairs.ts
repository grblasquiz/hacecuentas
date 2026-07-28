import type { HubData } from '../types';

/**
 * Hub de decisión EN (mercado US) — "How many boards, cuts, hinges and steps?".
 *
 * Ramas y fórmulas vivas portadas:
 *   madera-terraza-metros-cuadrados-tablas.ts        → decking
 *   tablero-melamina-cortes-aprovechamiento.ts       → sheet goods yield
 *   escalera-huella-contrahuella-ley-blondel.ts      → stairs
 *   bisagras-tornillos-puerta-ventana-cantidad.ts    → hinges and screws
 *   perfil-aluminio-metros-lineales-ventana.ts       → window profile
 *
 * Corrección deliberada en la rama de escalera, documentada abajo: la regla
 * de Blondel es europea y no es la norma en Estados Unidos. Acá manda el IRC
 * (R311.7), con la contrahuella máxima de 7-3/4" y la huella mínima de 10",
 * y el valor de Blondel viaja como comprobación de confort, no como norma.
 *
 * Además, la fórmula original reparte la huella entre TODOS los escalones
 * (h = profundidad / n). En la práctica americana el número de huellas es uno
 * menos que el de contrahuellas, porque la última contrahuella desemboca en
 * el piso de arriba. Acá se usa n − 1 y la diferencia se declara.
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'construction-materials', idioma en. */
const DISCLAIMER_MATERIALS =
  'Material and quantity estimate. Check coverage, waste, and application against the manufacturer’s specifications or the professional in charge.';

/** Ancho de cara real de una tabla de deck 5/4×6: 5-1/2". */
export const DECK_FACE_IN = 5.5;
/** Separación habitual entre tablas de deck: 3/16". */
export const DECK_GAP_IN = 0.1875;

/**
 * Placa estándar americana: 4 × 8 ft = 48 × 96". La fórmula original usa
 * 1220 × 2440 mm, que son 48.03 × 96.06": 1.5 mm de diferencia, despreciable.
 */
export const SHEET_L_IN = 96;
export const SHEET_W_IN = 48;
/** Ancho de corte de una sierra circular americana: 1/8". El original usa 3 mm (0.118"). */
export const KERF_IN = 0.125;

/**
 * IRC R311.7.5 — escaleras de vivienda unifamiliar:
 * contrahuella máxima 7-3/4", huella mínima 10", diferencia máxima entre
 * el escalón más alto y el más bajo de un tramo: 3/8".
 */
export const IRC_MAX_RISER_IN = 7.75;
export const IRC_MIN_TREAD_IN = 10;
export const IRC_MAX_VARIATION_IN = 0.375;
/** Contrahuella objetivo de diseño, cómoda y bajo el tope del IRC. */
export const TARGET_RISER_IN = 7.5;
/** La fórmula original apunta a 18 cm de contrahuella, que son 7.09". */
export const METRIC_TARGET_RISER_IN = 7.09;

/**
 * Regla de Blondel: huella + 2 × contrahuella entre 62 y 64 cm,
 * que en pulgadas son 24.41" y 25.20".
 */
export const BLONDEL_MIN_IN = 24.41;
export const BLONDEL_MAX_IN = 25.2;
/** Regla americana equivalente ("rule of 25"): huella + contrahuella entre 17" y 18". */
export const US_SUM_MIN_IN = 17;
export const US_SUM_MAX_IN = 18;

/**
 * Bisagras: la fórmula original usa una bisagra cada 0.75 m, que son 29.5" —
 * la regla americana de "una bisagra cada 30 pulgadas de alto de puerta".
 * Los mínimos por peso son los mismos.
 */
export const HINGE_SPACING_IN = 30;
export const DOOR_TYPES = [
  { id: 'light', label: 'Light interior door, hollow core (under 33 lb)', heightIn: 80, minHinges: 2, screw: '#6 × 5/8 in' },
  { id: 'medium', label: 'Standard interior door, solid core (33–88 lb)', heightIn: 80, minHinges: 3, screw: '#8 × 1-1/4 in' },
  { id: 'heavy', label: 'Exterior or fire-rated door (88–176 lb)', heightIn: 80, minHinges: 4, screw: '#8 × 1-1/2 in' },
  { id: 'veryheavy', label: 'Oversized or tall door (over 176 lb)', heightIn: 96, minHinges: 5, screw: '#10 × 2-1/2 in' },
];

/**
 * Perfil de ventana: solape de 3 cm entre hojas de la fórmula original,
 * que son 1.18" (0.1 ft). La barra comercial americana de extrusión de
 * aluminio es de 16 ft; la argentina es de 6 m (19.7 ft).
 */
export const SASH_OVERLAP_FT = 0.1;
export const STOCK_BAR_FT = 16;

export const hub: HubData = {
slug: 'en/home/carpentry-and-stairs',
  title: 'Deck boards, sheet cuts, stair rise and run, hinge calculator',
  description:
    'Count deck boards and fasteners, get the best cut yield from a 4 × 8 sheet, lay out stair risers and treads to IRC limits, and size hinges, screws and window profile — all in inches and feet.',
  silo: 'Home & Building',
siloHref: '/en/home',
  locale: 'en',

  eyebrow: 'US · carpentry · IRC stairs',
  h1: 'How many boards, cuts, hinges and steps?',
  lede:
    'Carpentry take-offs all come down to fitting whole pieces into a space that does not divide evenly. Boards across a deck, parts out of a sheet, risers up a flight, hinges down a door edge. Each one has a rule that decides the count, and for stairs that rule is the building code. Run all five here in inches and feet.',
  stamps: [
    'Boards · sheets · risers · hinges · linear feet',
    'IRC R311.7: 7-3/4 in max riser, 10 in min tread',
    '5 calculators inside',
  ],

  resultLabel: 'What to cut and buy',

  cases: {
    title: 'What are you building?',
    intro:
      'Five take-offs that share the same dimensions. Switch between them without retyping the job.',
    items: [
      {
        id: 'deck',
        label: 'Deck boards',
        hint: 'Rows · pieces · fasteners',
        answer: 'Rows across the width, pieces along the length, then a waste allowance.',
        yes: [
          'Rows across the deck are the width divided by the board face width plus the gap between boards',
          'A 5/4 × 6 deck board is actually 5-1/2 inches wide, not 6 — nominal lumber sizes are not actual sizes',
          'A gap of 3/16 inch is typical for kiln-dried wood; wet-treated lumber is laid tight because it shrinks as it dries',
          'Pieces along the length come from the deck length divided by the board length you buy',
          'Joists at 16 inches on center give you the fastener count: two screws per board per joist',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Butt joints between boards must land on a joist, so the board length you buy and the joist spacing have to agree — otherwise you are adding blocking everywhere',
          'Composite decking has its own gap and span requirements from the manufacturer and they are not the same as wood: follow the datasheet, not this',
          'Deck ledger attachment and footing design are the two things that actually make decks collapse. Both are code-regulated and inspected',
        ],
        plazo: 'let the lumber acclimate on site for several days before laying it, or the gaps you set will not be the gaps you get.',
      },
      {
        id: 'sheet',
        label: 'Cut yield from a sheet',
        hint: 'Pieces per sheet · yield · sheets needed',
        answer: 'Try the piece both ways round and take whichever fits more per sheet.',
        yes: [
          'A standard sheet is 4 by 8 feet, or 48 by 96 inches',
          'Every cut removes a kerf — about 1/8 inch on a circular saw or table saw — and the kerfs add up across a sheet',
          'The piece may fit more times rotated 90 degrees: the calculation tries both orientations and keeps the better one',
          'Yield is the useful area divided by the sheet area; anything over 80% is a good layout',
          'Sheets round up, and the offcut from the last one is your stock for shelves, jigs and repairs',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'This assumes straight guillotine cuts all the way across, which is how a panel saw works. A nesting layout on a CNC will beat it',
          'Sheets with a grain or pattern direction cannot be rotated freely: half the orientations disappear and the yield drops',
          'Edge banding, rabbets and the finished face all constrain which edge of a part can come from a sheet edge — check before optimizing',
        ],
        plazo: 'break sheets down oversize first and cut to final dimension afterwards: a full sheet on a table saw is not a safe operation alone.',
      },
      {
        id: 'stairs',
        label: 'Stair rise and run',
        hint: 'Risers · treads · IRC compliance',
        answer: 'Riser height and tread depth are code limits, not preferences.',
        yes: [
          'The number of risers is the total rise divided by a target riser height, rounded up',
          'Actual riser height is then the total rise divided by that number, so every riser is identical',
          'There is always one fewer tread than risers, because the top riser lands on the floor above',
          'IRC R311.7.5 caps the riser at 7-3/4 inches and sets a minimum tread depth of 10 inches',
          'Risers within a flight may not vary by more than 3/8 inch — this is the most commonly failed stair inspection item',
          'The classic comfort checks are the Blondel rule, tread plus twice the riser between 24.4 and 25.2 inches, and the US rule of 25, riser plus tread between 17 and 18 inches',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'The Blondel rule is a European comfort guideline, not a US code requirement — where the two disagree, the IRC governs',
          'Headroom is a separate requirement: 6 ft 8 in minimum measured vertically from the tread nosing line',
          'Handrails, guards and nosing projection all have their own IRC dimensions, and stairs are one of the most heavily inspected assemblies in a house',
          'Uneven risers are a genuine fall hazard, not a cosmetic problem: people trip on the one step that is different',
        ],
        plazo: 'measure the total rise finished-floor to finished-floor, after the flooring goes down — a 3/4 inch surprise ruins the layout.',
      },
      {
        id: 'hinges',
        label: 'Hinges and screws',
        hint: 'Hinges per door · screws · sizes',
        answer: 'One hinge per 30 inches of door height, with a minimum set by the weight.',
        yes: [
          'The trade rule is one hinge for every 30 inches of door height, rounded up',
          'The weight of the door sets a floor under that: two hinges for a light hollow-core, three for a solid-core, four for an exterior or fire-rated door, five for anything oversized',
          'Whichever of the two is larger is the number you use',
          'Screws per hinge are the holes per leaf times two leaves — usually four, six on heavy-duty hardware',
          'Screw length goes up with door weight, and at least one screw per hinge on the jamb side should be long enough to reach the framing behind it',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Fire-rated door assemblies must use listed hinges and the exact hardware in the listing: substituting anything voids the rating',
          'A heavy door on short screws will sag no matter how many hinges it has — the load path has to reach the stud, not just the jamb',
          'Hinge leaf size matters as much as count: a 3-1/2 inch hinge on a solid-core exterior door is undersized whatever the quantity',
        ],
        plazo: 'hang the door before the casing goes on, so you can still shim the jamb if it does not swing true.',
      },
      {
        id: 'window',
        label: 'Window frame profile',
        hint: 'Linear feet · stock bars',
        answer: 'Outer frame perimeter plus each sash perimeter, plus a waste allowance.',
        yes: [
          'The outer frame is twice the width plus twice the height',
          'Each sliding sash has its own perimeter, with about 1-1/4 inches of overlap allowance per sash',
          'A contraframe set into the masonry adds another full frame perimeter',
          'An intermediate transom adds one horizontal rail equal to the window width',
          'Aluminum extrusion is stocked in 16 ft bars in the US, so the linear feet round up to whole bars',
        ],
        warn: [
          DISCLAIMER_MATERIALS,
          'Miters eat more than a straight waste percentage suggests: a 45 degree cut at each end of a short piece can waste most of the offcut',
          'Thermally broken and non-broken profiles have different sections and different linear weights — do not price one from the other',
          'Structural, wind-load and egress requirements govern window openings, and none of them are in this take-off',
        ],
        plazo: 'confirm the rough opening on site before cutting: framing rarely comes out at the dimension on the drawing.',
      },
    ],
  },

  inputsTitle: 'The job',
  inputsIntro: 'Feet for the big dimensions, inches for anything you would cut to. Only the fields your branch reads matter.',
  fields: [
    { id: 'len_ft', label: 'Deck length or window width (ft)', type: 'number', value: 16, min: 0, step: 0.5, help: 'For decking, the direction the boards run. For a window, the overall width.' },
    { id: 'wid_ft', label: 'Deck width or window height (ft)', type: 'number', value: 12, min: 0, step: 0.5, help: 'For decking, the direction across the boards. For a window, the overall height.' },
    { id: 'board_face_in', label: 'Board face width (in)', type: 'number', value: 5.5, min: 1, step: 0.25, help: 'Actual, not nominal. A 5/4 × 6 deck board measures 5-1/2 in.' },
    { id: 'gap_in', label: 'Gap between boards (in)', type: 'number', value: 0.1875, min: 0, max: 1, step: 0.0625, help: '3/16 in for kiln-dried lumber. Wet-treated lumber is laid tight because it shrinks.' },
    { id: 'stock_len_ft', label: 'Board or stock bar length (ft)', type: 'number', value: 16, min: 1, step: 1, help: 'Decking comes in 8, 12 and 16 ft. Aluminum extrusion is stocked at 16 ft.' },
    { id: 'piece_l_in', label: 'Cut piece length (in)', type: 'number', value: 30, min: 1, step: 0.25, help: 'Sheet branch: the long dimension of the part you are cutting.' },
    { id: 'piece_w_in', label: 'Cut piece width (in)', type: 'number', value: 15, min: 1, step: 0.25, help: 'Sheet branch: the short dimension of the part.' },
    { id: 'total_pieces', label: 'Pieces or doors needed', type: 'number', value: 12, min: 1, step: 1, help: 'Sheet branch: how many of that part the job requires. Hinge branch: how many doors you are hanging.' },
    { id: 'rise_in', label: 'Total stair rise (in)', type: 'number', value: 105, min: 1, step: 0.25, help: 'Finished floor to finished floor. 105 in is a typical 8 ft 9 in floor-to-floor.' },
    { id: 'run_in', label: 'Total stair run available (in)', type: 'number', value: 132, min: 1, step: 1, help: 'Horizontal space the flight can occupy. This is usually what constrains the design.' },
    {
      id: 'door_type',
      label: 'Door type',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'light', label: 'Light interior, hollow core (under 33 lb)' },
        { value: 'medium', label: 'Standard interior, solid core (33–88 lb)' },
        { value: 'heavy', label: 'Exterior or fire-rated (88–176 lb)' },
        { value: 'veryheavy', label: 'Oversized or tall (over 176 lb)' },
      ],
      help: 'Sets the door height, the minimum hinge count and the recommended screw size.',
    },
    { id: 'sashes', label: 'Sliding sashes in the window', type: 'number', value: 2, min: 0, max: 6, step: 1, help: 'Zero for a fixed pane. Each sash adds its own frame perimeter.' },
    { id: 'waste_pct', label: 'Waste allowance (%)', type: 'number', value: 10, min: 0, max: 40, step: 1, help: '10% is the working default. Mitered profile work often wants 15%.' },
  ],
  fineprint: DISCLAIMER_MATERIALS,

  chart: {
    type: 'bars',
    title: 'The numbers the layout has to reconcile',
    caption:
      'Each branch is really a comparison: material used against material wasted, or the dimension you got against the limit you are allowed. Seeing both bars together is what tells you whether the layout has room to move or is already up against a limit.',
  },
  breakdownTitle: 'From the dimension to the cut list',
  breakdownIntro:
    'The geometry, the rule that sets the count, and the whole pieces you actually buy.',

  faq: [
    {
      q: 'How many deck boards do I need?',
      a: 'Divide the deck width by the board face width plus the gap to get the number of rows, then divide the deck length by the board length to get pieces per row, and multiply. A 16 by 12 ft deck with 5-1/2 in boards and a 3/16 in gap needs 26 rows; with 16 ft boards that is 26 boards plus waste. The most common mistake is using the nominal size: a 5/4 × 6 board is 5-1/2 inches wide, so assuming 6 leaves you about 8% short.',
    },
    {
      q: 'How much gap should I leave between deck boards?',
      a: 'About 3/16 inch for kiln-dried lumber, which will move only slightly. Wet pressure-treated lumber is different: lay it tight, because it will shrink as it dries and open its own gaps, often to a quarter inch or more. Composite decking follows the manufacturer, and the required gap usually varies with the installation temperature, since composites expand more than wood. Gaps matter for drainage and drying, not just looks — a deck with no gaps holds water and rots from the top down.',
    },
    {
      q: 'How many pieces can I get out of a 4 by 8 sheet?',
      a: 'It depends on the orientation and the saw kerf. For a 30 by 15 inch part with a 1/8 inch kerf, laying the length along the sheet gives 3 columns by 3 rows, or 9 pieces; rotated it gives 6 by 1, or 6. So the first orientation wins with 9 pieces and about 88% yield. The kerf is not negligible: nine cuts across a sheet consume over an inch of material, which is exactly the amount that turns four pieces into three.',
    },
    {
      q: 'What is a good yield when cutting sheet goods?',
      a: 'Above 80% is good for straight guillotine cutting. Between 65 and 80% is typical. Below 65% means the part size and the sheet size are fighting each other, and you should look at rotating the parts, mixing different part sizes on the same sheet, or buying a different sheet format if one is available. A CNC nest can beat guillotine cutting by several points because it is not limited to cuts that go all the way across.',
    },
    {
      q: 'What are the code limits on stair risers and treads?',
      a: 'IRC R311.7.5 sets a maximum riser height of 7-3/4 inches and a minimum tread depth of 10 inches for one- and two-family dwellings. Within a single flight, the risers may not vary by more than 3/8 inch from largest to smallest, and neither may the treads. Minimum headroom is 6 ft 8 in measured vertically from the tread nosing line, and minimum stair width is 36 inches above the handrail. Commercial stairs under the IBC are stricter: 7 inch maximum riser and 11 inch minimum tread.',
    },
    {
      q: 'How do I lay out a stair?',
      a: 'Measure the total rise from finished floor to finished floor. Divide by a target riser of about 7.5 inches and round up to get the number of risers. Divide the total rise by that number for the actual riser height, which will be identical for every step. The number of treads is one less than the number of risers, because the top riser arrives at the floor above. Then check that the tread depth you can fit in the available run is at least 10 inches, and if it is not, the stair needs more horizontal space or a landing.',
    },
    {
      q: 'What is the Blondel rule and does it apply in the US?',
      a: 'It is an eighteenth-century French comfort rule: the tread depth plus twice the riser height should fall between 62 and 64 centimeters, which is 24.4 to 25.2 inches. It captures the fact that a normal stride shortens as you climb. It is a good sanity check and it is genuinely useful, but it is not US code. The IRC governs, and the equivalent American shorthand is the rule of 25 — riser plus tread between 17 and 18 inches. A stair can satisfy Blondel and still fail the IRC riser limit, so check the code first.',
    },
    {
      q: 'How many hinges does a door need?',
      a: 'One per 30 inches of door height, rounded up, with a floor set by the weight: two for a light hollow-core, three for a standard solid-core, four for an exterior or fire-rated door, and five for anything oversized. Take whichever number is higher. A standard 80 inch interior door works out to three by the height rule, which matches the weight-based minimum for solid-core. A 96 inch tall door needs four by height regardless of what it weighs.',
    },
    {
      q: 'How many screws and what size?',
      a: 'Screws per hinge are the number of holes per leaf times two leaves — four for standard residential hardware, six for heavy-duty. So three hinges with four-hole leaves is twelve screws per door, plus a buffer for the ones you strip or drop. Size goes with the weight: #6 by 5/8 in for light doors, #8 by 1-1/4 in for standard, #8 by 1-1/2 in for exterior, #10 by 2-1/2 in for oversized. On the jamb side, at least one screw per hinge should be long enough to reach the framing behind the jamb.',
    },
    {
      q: 'How much aluminum profile does a window take?',
      a: 'Add the outer frame perimeter, twice width plus twice height, to the perimeter of each sliding sash, allowing about 1-1/4 inches of overlap per sash. Add a contraframe perimeter if one is set into the masonry, and one rail equal to the window width for a transom. Then add 10 to 15% for miter waste and divide by the stock bar length. US aluminum extrusion is generally stocked in 16 ft bars, while metric markets use 6 meter bars, which is 19 ft 8 in — so a cut list optimized for one stock length will not be optimal for the other.',
    },
    {
      q: 'Why are nominal lumber sizes different from actual sizes?',
      a: 'Because the nominal size refers to the rough green dimension before it is dried and surfaced. A 2 × 4 finishes at 1-1/2 by 3-1/2 inches, a 2 × 6 at 1-1/2 by 5-1/2, and 5/4 decking at about 1 inch thick by 5-1/2 wide. The convention is standardized in the US Department of Commerce voluntary product standard PS 20. It matters for every take-off: a wall of 2 × 6 studs is 5-1/2 inches thick, and a deck of 6 boards is 33 inches wide before you count the gaps.',
    },
    {
      q: 'How do the metric figures in these formulas convert?',
      a: 'The ones used here: a 2440 by 1220 mm sheet is 96.06 by 48.03 inches, which is within 1.5 mm of a US 4 by 8 sheet; a 3 mm kerf is 0.118 inches against a US 1/8 inch blade; a hinge every 0.75 m is a hinge every 29.5 inches, effectively the US 30 inch rule; a 3 cm sash overlap is 1.18 inches; and a 6 m stock bar is 19 ft 8 in against a US 16 ft one. The Blondel range of 62 to 64 cm is 24.4 to 25.2 inches, and the metric riser target of 18 cm is 7.09 inches — noticeably lower than the 7.5 inch US design target.',
    },
  ],

  sources: [
    {
      name: 'International Residential Code R311.7 — stairways, risers, treads and headroom',
      url: 'https://codes.iccsafe.org/content/IRC2021P2/chapter-3-building-planning',
      publisher: 'International Code Council',
    },
    {
      name: 'US Department of Commerce PS 20 — American Softwood Lumber Standard (nominal vs actual sizes)',
      url: 'https://www.nist.gov/publications/american-softwood-lumber-standard-ps-20',
      publisher: 'NIST / US Department of Commerce',
    },
    {
      name: 'American Wood Council — DCA 6, prescriptive residential deck construction guide',
      url: 'https://awc.org/publications/dca6/',
      publisher: 'American Wood Council',
    },
    {
      name: 'BHMA A156.1 — butts and hinges, weight classes and application',
      url: 'https://buildershardware.com/standards',
      publisher: 'Builders Hardware Manufacturers Association',
    },
    {
      name: 'APA — The Engineered Wood Association, panel sizes and handling',
      url: 'https://www.apawood.org/publications',
      publisher: 'APA — The Engineered Wood Association',
    },
    {
      name: 'Aluminum Association — Aluminum Design Manual, extrusion stock practice',
      url: 'https://www.aluminum.org/standards',
      publisher: 'The Aluminum Association',
    },
  ],

  replaces: [
    '/en/deck-boards-patio',
    '/en/melamine-board-cutting-calculator',
    '/en/stair-calculator-blondel-rule',
    '/en/door-hinge-screw-calculator',
    '/en/aluminum-profile-linear-meters-window',
  ],

lastReviewed: '2026-07-28',
};
