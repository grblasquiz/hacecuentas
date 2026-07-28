import type { HubData } from '../types';

/**
 * Hub EN — "How much should I feed this animal?"
 *
 * Absorbe 9 calculadoras sueltas de raciones y dosis: perro, gato, conejo,
 * hurón, loro/periquito, tortuga de agua, cobayo (vitamina C) y dosis de
 * medicación por peso.
 *
 * 🐛 Bugs heredados de las fórmulas originales, corregidos acá:
 *  - `comida-gato-gramos-peso-ideal-racion.ts` devuelve el `resultado` en ESPAÑOL
 *    aun con `__lang === 'en'` ("120 g pienso seco / 470 g húmedo") y etiqueta el
 *    donut con `unit: 'g/día'`.
 *  - `conejo-comida-heno-peso-edad.ts` arma las cadenas con "g/día" fijo y después
 *    parchea con `.replace('/día','/day')`, así que cualquier string que se le
 *    escape sale en español.
 *  - `tortuga-agua-dieta-peso-edad.ts` con peso 0 y `__lang !== 'en'` devuelve
 *    "0,0 g/día" con coma decimal argentina.
 *  - Todo el catálogo entra en kg/g: acá el usuario carga libras y onzas y la
 *    conversión a métrico (que es lo que usan las fórmulas veterinarias) es explícita.
 */

/** Exactos por definición (NIST SP 811). */
export const KG_PER_LB = 0.45359237;
export const G_PER_OZ = 28.349523125;

/** Multiplicador MER sobre el RER, perro. Une comida-perro… y calorias-perro-por-raza-edad. */
export const DOG_MER: Record<string, number> = {
  puppy_early: 3.0,
  puppy_late: 2.0,
  adult_high: 2.2,
  adult_intact: 1.8,
  adult_neutered: 1.6,
  adult_low: 1.3,
  senior: 1.4,
  senior_light: 1.2,
};

/** Multiplicador MER sobre el RER, gato (AAHA Nutritional Assessment Guidelines). */
export const CAT_MER: Record<string, number> = {
  neutered: 1.2,
  active: 1.4,
  kitten: 2.5,
  senior: 1.1,
  lactating: 3.0,
};

/** Densidad calórica del húmedo, kcal/g (≈90 kcal/100 g). Espejo de la fórmula viva. */
export const WET_KCAL_PER_G = 0.9;

/** Conejo: pellets g/kg/día, tope en g/día, y verdura g/kg/día. House Rabbit Society. */
export const RABBIT: Record<string, { pellets: number; cap: number | null; veg: number; fruit: number; hay: string }> = {
  junior: { pellets: -1, cap: null, veg: 0, fruit: 0, hay: 'Alfalfa hay, unlimited' },
  young: { pellets: 20, cap: null, veg: 100, fruit: 2, hay: 'Alfalfa and grass hay, transitioning' },
  adult: { pellets: 25, cap: 50, veg: 100, fruit: 2, hay: 'Grass hay — timothy, orchard, brome' },
  senior: { pellets: 12, cap: 40, veg: 100, fruit: 0, hay: 'Grass hay plus dental monitoring' },
  pregnant: { pellets: 35, cap: null, veg: 150, fruit: 2, hay: 'Alfalfa mixed with grass hay' },
};

/** Hurón: ingesta diaria como fracción del peso vivo, y mínimos de proteína y grasa. */
export const FERRET: Record<string, { intake: number; protein: number; fat: number; label: string }> = {
  kit: { intake: 0.07, protein: 35, fat: 20, label: 'Kit / juvenile, under 1 year' },
  adult: { intake: 0.06, protein: 32, fat: 15, label: 'Adult, 1–3 years' },
  pregnant: { intake: 0.07, protein: 38, fat: 20, label: 'Pregnant or lactating' },
  senior: { intake: 0.05, protein: 30, fat: 15, label: 'Senior, 3 years and older' },
};

/** Psitácidas: ingesta diaria como fracción del peso vivo, y reparto de la dieta. */
export const BIRD: Record<string, { intake: number; pellet: number; seed: number; veg: number; fruit: number; label: string; range: string }> = {
  budgie: { intake: 0.10, pellet: 0.40, seed: 0.35, veg: 0.15, fruit: 0.10, label: 'Budgerigar or lovebird', range: '0.9–2.1 oz' },
  cockatiel: { intake: 0.10, pellet: 0.50, seed: 0.20, veg: 0.20, fruit: 0.10, label: 'Cockatiel, conure, caique or Senegal', range: '2.5–7 oz' },
  amazon: { intake: 0.08, pellet: 0.60, seed: 0.10, veg: 0.22, fruit: 0.08, label: 'Amazon, African grey or eclectus', range: '10–21 oz' },
  macaw: { intake: 0.06, pellet: 0.55, seed: 0.15, veg: 0.20, fruit: 0.10, label: 'Macaw or cockatoo', range: '25–53 oz' },
};

/** Tortuga de agua: ración diaria como fracción del peso, sesiones por semana. */
export const TURTLE = [
  { maxAge: 1, rate: 0.030, sessions: 7, protein: 60, veg: 40, label: 'Hatchling, under 1 year' },
  { maxAge: 4, rate: 0.020, sessions: 4, protein: 35, veg: 65, label: 'Juvenile, 1–4 years' },
  { maxAge: 7, rate: 0.015, sessions: 3, protein: 25, veg: 75, label: 'Sub-adult, 4–7 years' },
  // 999 y no Infinity: `define:vars` serializa a JSON y `Infinity` viaja como null.
  { maxAge: 999, rate: 0.010, sessions: 3, protein: 20, veg: 80, label: 'Adult, 7 years and older' },
];

/** Cobayo: vitamina C en mg/kg/día por estado (Merck Veterinary Manual). */
export const GUINEA_PIG_VIT_C: Record<string, { mgkg: number; label: string }> = {
  healthy: { mgkg: 15, label: 'Healthy adult, maintenance' },
  pregnant: { mgkg: 35, label: 'Pregnant or nursing' },
  sick: { mgkg: 50, label: 'Sick or deficient' },
};

/**
 * YMYL — vida. Traducción del disclaimer de `src/lib/disclaimers.ts`
 * (dominio 'medical-dose'), adaptado a animales.
 */
export const VET_DISCLAIMER =
  'Informational estimate, not a prescription and not veterinary advice. Doses and rations here are general references; do not medicate an animal on your own and do not change a schedule your veterinarian set. Consult your veterinarian before acting on any number on this page.';

export const hub: HubData = {
  slug: 'en/pets/how-much-to-feed-my-pet',
  title: 'Pet Feeding Calculator — Dog, Cat, Rabbit, Ferret, Bird, Turtle and Guinea Pig Portions',
  description:
    'How many ounces, cups and calories a day your pet actually needs, by species, weight in pounds and life stage — plus the vitamin C a guinea pig needs and how to read a mg/kg medication dose.',
  silo: 'Pets',
  siloHref: '/en/pets',
  locale: 'en',

  eyebrow: 'Portions & doses',
  h1: 'How much should I feed this animal?',
  lede:
    'The bag says "feed 2 to 4 cups" and covers a forty-pound range. The actual number comes from resting energy, life stage and the calorie density printed on your bag — and for a rabbit, a ferret or a turtle it is not calories at all but a percentage of body weight. Eight species, in pounds and ounces.',
  stamps: [
    'US units: pounds, ounces and cups, converted to the metric the veterinary formulas use',
    'RER = 70 × kg^0.75, then the WSAVA/AAHA life-stage multiplier',
    'Reads the kcal/kg printed on your own bag instead of assuming one',
    'Replaces 9 single-purpose calculators',
  ],

  resultLabel: 'Daily amount',

  cases: {
    title: 'Which animal are you feeding?',
    intro: 'Pick the species. Each case reads only the fields it needs and ignores the rest.',
    items: [
      {
        id: 'dog',
        label: 'Dog — daily food and calories',
        hint: 'Ounces of kibble a day from weight, life stage and the calories on the bag.',
        yes: [
          'Resting energy requirement and the life-stage multiplier applied to it',
          'Daily calories, and the ounces and grams of kibble that supply them',
          'A ±15% band, because body condition beats any formula',
        ],
        warn: [
          VET_DISCLAIMER,
          'Cup measurements are the single biggest source of error here: the same "cup" of kibble can vary by 20–30% depending on the kibble shape and how you scoop. A $12 kitchen scale removes the guesswork entirely.',
          'Feed to the weight your dog should be, not the weight it is. An overweight dog fed at its current weight stays overweight.',
          'A growing puppy under four months burns roughly twice what an adult of the same weight does, and needs it split across three or four meals. Do not feed a puppy on an adult schedule.',
          'Deep-chested breeds are at risk of gastric dilatation-volvulus. Split the ration into two or more meals and avoid hard exercise right around eating.',
        ],
        plazo: 'Re-weigh and reassess body condition after two weeks, then adjust by 10% in whichever direction the ribs tell you. You should feel them easily without pressing.',
        answer:
          'Work out RER = 70 × (weight in kg)^0.75, multiply by the life-stage factor — 1.6 for a neutered adult, 1.8 intact, 1.4 senior, 2.0 to 3.0 for a puppy — and divide by the calorie density on your bag. A 44 lb neutered adult lands near 1,000 kcal, about 10 oz of typical kibble.',
      },
      {
        id: 'cat',
        label: 'Cat — dry and wet food portions',
        hint: 'The same ration expressed as kibble or as canned food.',
        yes: [
          'Daily calories from the AAHA life-stage factor',
          'The equivalent in dry kibble and in wet food',
          'What a half-and-half split of the two looks like',
        ],
        warn: [
          VET_DISCLAIMER,
          'Never crash-diet a cat. Losing weight too fast can trigger hepatic lipidosis, which is life-threatening. Any weight-loss plan for a cat belongs with a veterinarian and aims at roughly 0.5–1% of body weight per week.',
          'Wet food is around 90 kcal per 100 g against 350 for kibble, so the portions look nothing alike by weight — a cat on wet food eats about four times the mass for the same calories.',
          'An indoor neutered cat sits at the bottom of the range, factor 1.2. Free-feeding kibble to a cat in that category is the standard route to feline obesity.',
        ],
        plazo: 'Weigh the cat monthly on the same scale. A cat losing weight without a diet change needs a vet visit, not a bigger bowl.',
        answer:
          'RER × 1.2 for a neutered indoor adult, 1.4 if active or outdoors, 2.5 for a kitten and 1.1 for a senior. An 11 lb neutered cat needs roughly 210 kcal a day, about 2.1 oz of kibble or 8.2 oz of wet food.',
      },
      {
        id: 'rabbit',
        label: 'Rabbit — hay, greens and pellets',
        hint: 'Hay is the diet; pellets are the supplement, not the other way round.',
        yes: [
          'Minimum hay by weight, offered unlimited',
          'Fresh greens and the pellet allowance for the life stage',
          'The weekly fruit ceiling, which is smaller than most people think',
        ],
        warn: [
          VET_DISCLAIMER,
          'Hay is not optional and it is not bedding. It should be roughly 80% of what a rabbit eats: the constant chewing is what keeps continuously growing teeth worn down, and the fibre is what keeps the gut moving.',
          'A rabbit that stops eating or stops producing droppings is an emergency, not a wait-and-see. Gastrointestinal stasis can kill within a day.',
          'Muesli-style mixes let a rabbit pick out the sugary bits and leave the fibre. Uniform pellets exist precisely to stop that.',
          'Alfalfa is for growing and pregnant rabbits only — its calcium load is too high for a healthy adult and contributes to urinary sludge.',
        ],
        plazo: 'Introduce any new green one at a time with several days between, and stop at the first sign of soft droppings.',
        answer:
          'At minimum about half an ounce of hay per pound of rabbit a day, offered unlimited; roughly 1.6 oz of fresh greens per pound; and pellets at about 0.4 oz per pound for an adult, capped near 1.8 oz a day.',
      },
      {
        id: 'ferret',
        label: 'Ferret — food and minimum animal protein',
        hint: 'An obligate carnivore with a three-hour gut transit.',
        yes: [
          'Daily food as a percentage of body weight',
          'Minimum grams of animal protein and of fat in that food',
          'What the label has to say before the food is acceptable',
        ],
        warn: [
          VET_DISCLAIMER,
          'Ferrets are obligate carnivores with a gut transit of three to four hours. They cannot digest plant fibre, and grain, corn or fruit high on an ingredients list is filler they will not use.',
          'Do not feed dog food to a ferret. It is too low in animal protein and too high in carbohydrate, and long-term it is implicated in insulinoma.',
          'A ferret should have food available at all times because of that fast transit — this is one of the few pets where free-feeding is correct.',
          'Sugary treats, including many marketed for ferrets, are a genuine problem given how common insulinoma is in the species.',
        ],
        plazo: 'Check the first three ingredients on the bag. If any of them is a grain or a plant protein, the food is wrong for the species regardless of the protein percentage on the panel.',
        answer:
          'Five to seven percent of body weight per day depending on life stage, of a food that is at least 32–38% animal protein and 15–20% fat. A 2.2 lb adult ferret eats about 2.1 oz a day.',
      },
      {
        id: 'bird',
        label: 'Parrot or parakeet — weekly seed, pellets and fresh food',
        hint: 'The seed share is the number most cages get wrong.',
        yes: [
          'Daily and weekly grams of seed, pellets and fresh food',
          'The diet split appropriate to the species group',
          'How long fresh food can safely sit in the cage',
        ],
        warn: [
          VET_DISCLAIMER,
          'An all-seed diet is the classic cause of malnutrition in captive parrots. Seed is fat-rich and deficient in vitamin A and calcium, and a bird raised on it will often refuse pellets at first — the conversion takes weeks and should be gradual and monitored.',
          'Avocado, chocolate, caffeine, alcohol, onion and garlic are toxic to birds. Fruit pits and apple seeds contain cyanogenic compounds and should be removed.',
          'Remove fresh food after about four hours. Warm cages grow bacteria fast, and a bird eats a large fraction of its body weight daily so contamination scales quickly.',
          'Never switch a bird to a new diet cold. Birds can starve rather than eat something they do not recognise as food, so weigh daily during any transition.',
        ],
        plazo: 'Weigh the bird on a gram scale weekly. A drop of more than 5% of body weight is a vet visit — birds hide illness until they cannot.',
        answer:
          'Small parrots eat about 10% of body weight a day, large ones 6–8%. Of that, seed should be roughly 35% for a budgie but only 10% for an African grey, with pellets making up the bulk and fresh vegetables the rest.',
      },
      {
        id: 'turtle',
        label: 'Aquatic turtle — portion and how often',
        hint: 'Portion falls and vegetation rises as the turtle ages.',
        yes: [
          'Grams per feeding session and sessions per week',
          'The protein-to-greens split for the life stage',
          'The weekly total, which is what actually determines growth',
        ],
        warn: [
          VET_DISCLAIMER,
          'Overfeeding is the most common husbandry failure with aquatic turtles, and it produces pyramiding of the shell and fatty liver disease — both largely irreversible.',
          'A turtle will beg every time you walk past the tank. Begging is not hunger; the feeding schedule is the schedule.',
          'Without UVB lighting and a dietary calcium source, no feeding plan will prevent metabolic bone disease. The lamp is not optional and UVB output dies long before the bulb stops glowing.',
          'Feeding in a separate container keeps the main tank clean, and uneaten food should come out within minutes either way.',
        ],
        plazo: 'Replace the UVB bulb every six to twelve months even if it still lights, and check water temperature at every feeding.',
        answer:
          'Roughly 3% of body weight daily for a hatchling, 2% for a juvenile fed four times a week, and 1% for an adult fed three times a week — with vegetation rising from 40% of the diet to 80% over that span.',
      },
      {
        id: 'guineapig',
        label: 'Guinea pig — daily vitamin C',
        hint: 'The one species that cannot make its own.',
        yes: [
          'Milligrams per day for the physiological state',
          'What that looks like in bell pepper or parsley',
          'Where the therapeutic ceiling sits',
        ],
        warn: [
          VET_DISCLAIMER,
          'Guinea pigs cannot synthesise vitamin C — they lack the enzyme — so a dietary source every single day is not a supplement but a requirement. Scurvy shows up as a reluctance to move, rough coat and swollen joints.',
          'Vitamin C in water bottles degrades within hours in light and makes the water taste bad enough that some pigs drink less. Fresh food or a direct oral dose is far more reliable.',
          'Vitamin C in pelleted food degrades in storage. A bag more than about three months old cannot be relied on for the full label figure.',
          'A sick or deficient animal needs a therapeutic dose set by a veterinarian, not a guess from a table.',
        ],
        plazo: 'Buy pellets in small bags and check the milling date, and offer a fresh vitamin C source daily rather than in weekly batches.',
        answer:
          'About 15 mg per kilogram per day for a healthy adult, 30–40 for a pregnant or nursing sow, and 25–50 for a sick one. A 2 lb guinea pig needs roughly 14 mg — about a quarter of a small red bell pepper.',
      },
      {
        id: 'medication',
        label: 'Medication dose from a mg/kg prescription',
        hint: 'Converting a prescribed mg/kg into millilitres in the syringe.',
        yes: [
          'Total milligrams per day for the animal weight',
          'The millilitres that represents at your bottle concentration',
          'Millilitres per dose when it is split across the day',
        ],
        warn: [
          VET_DISCLAIMER + ' Consult your veterinarian before giving any medication — this branch converts a dose a veterinarian has already prescribed, it does not choose one.',
          'Never give a human medication to a pet without veterinary instruction. Paracetamol/acetaminophen is lethal to cats at ordinary human doses, and ibuprofen and other human NSAIDs cause kidney failure and gastric ulceration in dogs and cats.',
          'Concentration is where the mistakes happen. The same drug is sold at several mg/mL, and using the wrong bottle strength with the right arithmetic gives a wrong dose. Read the label on the bottle in your hand every time.',
          'Cats are not small dogs. Their liver handles many drugs differently, and several routine canine medications are toxic to them at any dose.',
          'Milligrams per kilogram means the pet weighs in kilograms. Entering pounds into a mg/kg formula over-doses by a factor of 2.2 — this page converts for you, but a mental calculation will not.',
        ],
        plazo: 'Finish the full course even after the symptoms stop, and call the practice rather than guessing if a dose is missed.',
        answer:
          'Milligrams per day equals the weight in kilograms times the prescribed mg/kg. Divide by the bottle concentration in mg/mL for the daily volume, and by the number of doses for the amount in the syringe each time.',
      },
    ],
  },

  inputsTitle: 'Your animal',
  inputsIntro: 'Fill in what the species you picked needs — the other fields are ignored.',
  fields: [
    { id: 'weightlb', label: 'Pet weight', type: 'number', value: 44, suffix: 'lb', min: 0, max: 300, step: 0.5, help: 'Dogs, cats, rabbits and ferrets. Use the weight the pet should be, not the weight it is.' },
    { id: 'weightoz', label: 'Small-pet weight', type: 'number', value: 4, suffix: 'oz', min: 0, max: 200, step: 0.1, help: 'Birds, turtles and guinea pigs.' },
    { id: 'kcalkg', label: 'Food energy density', type: 'number', value: 3500, suffix: 'kcal/kg', min: 500, max: 6000, step: 50, thousands: true, help: 'Printed on every US pet-food bag. 3,500 kcal/kg is typical dry kibble.' },
    {
      id: 'dogstage',
      label: 'Dog life stage and activity',
      type: 'select',
      value: 'adult_neutered',
      options: [
        { value: 'puppy_early', label: 'Puppy, 2–4 months (×3.0)' },
        { value: 'puppy_late', label: 'Puppy, 4–12 months (×2.0)' },
        { value: 'adult_high', label: 'Adult, high activity or working (×2.2)' },
        { value: 'adult_intact', label: 'Adult, intact (×1.8)' },
        { value: 'adult_neutered', label: 'Adult, neutered (×1.6)' },
        { value: 'adult_low', label: 'Adult, low activity or prone to weight gain (×1.3)' },
        { value: 'senior', label: 'Senior, 7–10 years (×1.4)' },
        { value: 'senior_light', label: 'Senior over 10, or overweight (×1.2)' },
      ],
    },
    {
      id: 'catstage',
      label: 'Cat life stage',
      type: 'select',
      value: 'neutered',
      options: [
        { value: 'neutered', label: 'Neutered indoor adult (×1.2)' },
        { value: 'active', label: 'Intact, active or outdoor adult (×1.4)' },
        { value: 'kitten', label: 'Kitten under 1 year (×2.5)' },
        { value: 'senior', label: 'Senior, 10 years and older (×1.1)' },
        { value: 'lactating', label: 'Pregnant or nursing (×3.0)' },
      ],
    },
    {
      id: 'rabbitstage',
      label: 'Rabbit life stage',
      type: 'select',
      value: 'adult',
      options: [
        { value: 'junior', label: 'Junior, under 6 months' },
        { value: 'young', label: 'Young, 6–12 months' },
        { value: 'adult', label: 'Adult, 1–5 years' },
        { value: 'senior', label: 'Senior, over 5 years' },
        { value: 'pregnant', label: 'Pregnant or nursing' },
      ],
    },
    {
      id: 'ferretstage',
      label: 'Ferret life stage',
      type: 'select',
      value: 'adult',
      options: [
        { value: 'kit', label: 'Kit or juvenile, under 1 year' },
        { value: 'adult', label: 'Adult, 1–3 years' },
        { value: 'pregnant', label: 'Pregnant or lactating' },
        { value: 'senior', label: 'Senior, 3 years and older' },
      ],
    },
    {
      id: 'birdspecies',
      label: 'Bird species group',
      type: 'select',
      value: 'cockatiel',
      options: [
        { value: 'budgie', label: 'Budgerigar or lovebird' },
        { value: 'cockatiel', label: 'Cockatiel, conure, caique or Senegal' },
        { value: 'amazon', label: 'Amazon, African grey or eclectus' },
        { value: 'macaw', label: 'Macaw or cockatoo' },
      ],
    },
    { id: 'turtleage', label: 'Turtle age', type: 'number', value: 3, suffix: 'years', min: 0, max: 80, step: 0.5 },
    {
      id: 'gpstate',
      label: 'Guinea pig condition',
      type: 'select',
      value: 'healthy',
      options: [
        { value: 'healthy', label: 'Healthy adult, maintenance' },
        { value: 'pregnant', label: 'Pregnant or nursing' },
        { value: 'sick', label: 'Sick or deficient — vet-directed' },
      ],
    },
    { id: 'dosemgkg', label: 'Prescribed dose', type: 'number', value: 5, suffix: 'mg/kg', min: 0, max: 500, step: 0.1, help: 'The figure your veterinarian gave you, per kilogram of body weight.' },
    { id: 'concentration', label: 'Bottle concentration', type: 'number', value: 50, suffix: 'mg/mL', min: 0, max: 1000, step: 1, help: 'Read it off the bottle in your hand. Leave at 0 if the product is tablets.' },
    { id: 'dosesperday', label: 'Doses per day', type: 'number', value: 2, suffix: 'per day', min: 1, max: 6, step: 1 },
  ],
  fineprint: VET_DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'What the ration is made of',
    caption:
      'The split behind the daily number — resting energy against the life-stage surcharge, hay against pellets and greens, or protein against the rest of the food.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Weights you enter in pounds and ounces are converted with the exact NIST factors before the veterinary formulas, which are all metric, are applied.',

  faq: [
    {
      q: 'How much should I feed my dog per day?',
      a: 'Start from resting energy: 70 times body weight in kilograms to the power 0.75. Multiply by 1.6 for a neutered adult, 1.8 for an intact one, 1.4 for a senior and 2.0 to 3.0 for a growing puppy. Divide the result by the calorie density printed on your bag, usually around 3,500 kcal per kilogram, to get grams. Then adjust by body condition after a fortnight — the formula gives a starting point, the ribs give the answer.',
    },
    {
      q: 'Why does the bag say a different amount?',
      a: 'Feeding guides on bags cover wide weight bands and assume an average, moderately active, intact animal, so they routinely overshoot for a neutered indoor pet. They also describe the food in cups, which vary by 20–30% depending on kibble shape and scooping. Use the kcal/kg figure on the same bag with your own pet\'s numbers and weigh the portion.',
    },
    {
      q: 'Should I feed to my pet\'s current weight or its ideal weight?',
      a: 'Ideal weight, always. Feeding an overweight animal at its current weight maintains the excess indefinitely. For a genuine weight-loss plan a veterinarian will usually set the calculation at ideal weight with a reduction factor and monitor monthly — and for cats that supervision matters, because rapid weight loss can trigger hepatic lipidosis.',
    },
    {
      q: 'How many ounces of dry food is that in cups?',
      a: 'Typical dry dog kibble runs around 3.5 to 4 ounces per standard 8-ounce measuring cup, though it varies widely with kibble size and shape — dense small kibble can be half again as heavy as large airy pieces. That variability is exactly why weighing beats scooping. If you must use a cup, weigh one cupful of your specific food once and use that number.',
    },
    {
      q: 'How much hay does a rabbit need?',
      a: 'Unlimited, and it should be about 80% of the total diet. The practical minimum is roughly half an ounce per pound of body weight per day, but a rabbit with a good hay supply will usually eat a volume about the size of its own body daily. Grass hays — timothy, orchard, brome — are for adults; alfalfa is for growing, pregnant and nursing rabbits only.',
    },
    {
      q: 'Can I feed my ferret cat food?',
      a: 'Only as a stopgap, and only a high-quality kitten food. Ferrets need 32–38% animal protein and 15–20% fat with essentially no usable carbohydrate, which most adult cat foods do not deliver. Dog food is genuinely unsuitable. In an emergency a premium kitten food will do for a few days while you get proper ferret food.',
    },
    {
      q: 'Why do guinea pigs need vitamin C when other pets do not?',
      a: 'Guinea pigs, like humans and unlike dogs, cats and rabbits, lack the enzyme L-gulonolactone oxidase and cannot synthesise ascorbic acid. Without a daily dietary source they develop scurvy within weeks: reluctance to move, a rough coat, swollen painful joints and poor wound healing. About 15 mg per kilogram per day covers a healthy adult.',
    },
    {
      q: 'Is vitamin C in the water bottle enough for a guinea pig?',
      a: 'It is the least reliable route. Ascorbic acid oxidises within hours in light and warmth, so a bottle dosed in the morning has lost much of its content by evening, and the altered taste makes some guinea pigs drink less water — a worse problem than the one you were solving. Fresh bell pepper, parsley, or a direct oral dose is far more dependable.',
    },
    {
      q: 'How often should I feed my aquatic turtle?',
      a: 'Daily for a hatchling at about 3% of body weight, four times a week for a juvenile at 2%, and three times a week for an adult at 1%. The share of vegetation should rise from roughly 40% of the diet in a hatchling to 80% in an adult. Turtles beg constantly regardless of hunger, so keep to the schedule.',
    },
    {
      q: 'How do I convert a mg/kg dose to millilitres?',
      a: 'Multiply the animal\'s weight in kilograms by the prescribed milligrams per kilogram to get total milligrams, then divide by the bottle concentration in mg/mL. A 22 lb dog is 10 kg; at 5 mg/kg that is 50 mg, and from a 50 mg/mL bottle that is 1 mL. Check the concentration on the actual bottle every time — the same drug is sold at several strengths.',
    },
    {
      q: 'Can I give my pet human painkillers?',
      a: 'No, not without explicit veterinary instruction. Acetaminophen/paracetamol is lethal to cats at ordinary human doses because they cannot conjugate it, and it damages the liver in dogs. Ibuprofen, naproxen and aspirin cause gastric ulceration and kidney injury in both species at doses that seem small. If a pet is in pain, that is a call to the practice, not to the medicine cabinet.',
    },
    {
      q: 'My pet gained weight on the amount this page suggests — what now?',
      a: 'That is the formula doing its job and telling you where your pet sits relative to average. Metabolic rate varies by roughly 20% between individuals of the same weight and stage. Reduce the ration by about 10%, hold it for a month, weigh again, and repeat. Persistent weight gain despite a genuine reduction warrants a thyroid check.',
    },
  ],

  sources: [
    { name: 'WSAVA Global Nutrition Guidelines and toolkit', url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/', publisher: 'World Small Animal Veterinary Association' },
    { name: 'AAHA Nutrition and Weight Management Guidelines for Dogs and Cats', url: 'https://www.aaha.org/resources/2021-aaha-nutrition-and-weight-management-guidelines/', publisher: 'American Animal Hospital Association' },
    { name: 'Nutrient Requirements of Dogs and Cats', url: 'https://nap.nationalacademies.org/catalog/10668/nutrient-requirements-of-dogs-and-cats', publisher: 'National Research Council' },
    { name: 'Rabbit care and feeding guidelines', url: 'https://rabbit.org/care/diet/', publisher: 'House Rabbit Society' },
    { name: 'Feeding ferrets', url: 'https://vcahospitals.com/know-your-pet/feeding-ferrets', publisher: 'VCA Animal Hospitals' },
    { name: 'Nutritional problems of guinea pigs', url: 'https://www.merckvetmanual.com/exotic-and-laboratory-animals/guinea-pigs/nutritional-problems-of-guinea-pigs', publisher: 'Merck Veterinary Manual' },
    { name: 'Nutrition in psittacines and other pet birds', url: 'https://www.merckvetmanual.com/exotic-and-laboratory-animals/pet-birds/nutrition-in-pet-birds', publisher: 'Merck Veterinary Manual' },
    { name: 'Toxic and dangerous substances for pets', url: 'https://www.aspca.org/pet-care/animal-poison-control', publisher: 'ASPCA Animal Poison Control Center' },
    { name: 'NIST Special Publication 811 — exact conversion factors', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
  ],

  replaces: [
    '/en/dog-food-calculator-by-weight',
    '/en/dog-calories-by-breed-age',
    '/en/comida-gato-gramos-peso-ideal-racion',
    '/en/rabbit-diet-hay-pellets',
    '/en/huron-ferret-dieta-proteina-animal',
    '/en/parrot-parakeet-seed-distribution',
    '/en/water-turtle-diet-weight-age',
    '/en/guinea-pig-vitamin-c-daily-dosage',
    '/en/pet-medication-dosage-by-weight',
  ],

  lastReviewed: '2026-07-28',
};
