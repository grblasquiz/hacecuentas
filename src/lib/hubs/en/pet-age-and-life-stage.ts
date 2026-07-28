import type { HubData } from '../types';

/**
 * Hub EN — "How old is my pet really, and what's due now?"
 *
 * Absorbe 5 calculadoras: edad humana de gato, perro (por raza) y conejo,
 * edad ideal de castración y calendario de vacunación canina.
 *
 * 🐛 Bugs heredados de las fórmulas originales, corregidos acá:
 *  - `vacunas-perro-cachorro-adulto-calendario.ts` NO tiene `__lang`: devuelve
 *    todo en español ("Cachorro — esquema inicial", "quíntuple") aunque se sirva
 *    en /en/, y encima cita la Ley 22.953 y campañas del SENASA — normativa
 *    ARGENTINA en una página del mercado estadounidense. Acá el esquema es
 *    core AAHA/WSAVA y la antirrábica es "as required by your state or county".
 *  - `edad-conejo.ts` interpola la CLAVE del select cruda en el texto inglés
 *    ("A mediano rabbit…") y formatea los números con `Intl.NumberFormat('es-AR')`.
 */

/** Gato → años humanos (AAHA/AAFP 2021): año 1 = 15, año 2 = +9, después +4/año. */
export const CAT_YEAR_1 = 15;
export const CAT_YEAR_2 = 24;
export const CAT_PER_YEAR_AFTER = 4;

/** Perro: fórmula AVMA 2020, 16 × ln(edad) + 31, con factor por tamaño. */
export const DOG_SIZE_FACTOR: Record<string, number> = {
  toy: 0.9,
  small: 0.95,
  medium: 1.0,
  large: 1.1,
};

/** Perro: tamaño de cada raza del catálogo original. */
export const DOG_BREEDS: Record<string, { label: string; size: string }> = {
  'labrador-retriever': { label: 'Labrador Retriever', size: 'large' },
  'golden-retriever': { label: 'Golden Retriever', size: 'large' },
  'french-bulldog': { label: 'French Bulldog', size: 'small' },
  'english-bulldog': { label: 'English Bulldog', size: 'medium' },
  'german-shepherd': { label: 'German Shepherd', size: 'large' },
  beagle: { label: 'Beagle', size: 'medium' },
  poodle: { label: 'Poodle', size: 'medium' },
  chihuahua: { label: 'Chihuahua', size: 'toy' },
  rottweiler: { label: 'Rottweiler', size: 'large' },
  'yorkshire-terrier': { label: 'Yorkshire Terrier', size: 'toy' },
  boxer: { label: 'Boxer', size: 'large' },
  dachshund: { label: 'Dachshund', size: 'small' },
  'siberian-husky': { label: 'Siberian Husky', size: 'large' },
  'shih-tzu': { label: 'Shih Tzu', size: 'small' },
  'pit-bull': { label: 'American Pit Bull Terrier', size: 'medium' },
};

/** Conejo: primer año = 21 humanos, después el factor de la raza. */
export const RABBIT_YEAR_1 = 21;
export const RABBIT_FACTOR: Record<string, { perYear: number; expectancy: string; label: string }> = {
  dwarf: { perYear: 6, expectancy: '10–12 years', label: 'Dwarf breed' },
  medium: { perYear: 8, expectancy: '8–10 years', label: 'Medium breed' },
  giant: { perYear: 10, expectancy: '5–7 years', label: 'Giant breed' },
};

/** Castración: ventana recomendada por especie y tamaño (AAHA 2019, Hart 2016). */
export const SPAY: Record<string, { ideal: string; min: number; max: number; risk: string; note: string }> = {
  cat: {
    ideal: '4–5 months',
    min: 4,
    max: 6,
    risk: 'Roughly seven times lower mammary tumour risk when spayed before six months',
    note: 'The "Fix Felines by Five" consensus, endorsed by the AAHA and AAFP, puts the deadline at five months. Queens can come into heat as early as four months, so waiting is how accidental litters happen.',
  },
  dog_small: {
    ideal: '5–6 months',
    min: 5,
    max: 6,
    risk: 'Up to two hundred times lower mammary tumour risk when spayed before the first heat',
    note: 'Small breeds under 22 lb reach skeletal maturity early, so there is no orthopaedic reason to wait. First heat falls between five and eight months.',
  },
  dog_medium: {
    ideal: '6–9 months',
    min: 6,
    max: 9,
    risk: 'Substantially lower mammary tumour risk when spayed before the first heat',
    note: 'Growth plates in a 22–55 lb dog close around eight to ten months, so the window sits just before or just after the first heat.',
  },
  dog_large: {
    ideal: '9–12 months',
    min: 9,
    max: 15,
    risk: 'Moderate risk of osteosarcoma and urinary incontinence if spayed very early',
    note: 'For a 55–100 lb dog, waiting for growth plate closure at around twelve months lowers the orthopaedic risk. The AAHA window is nine to fifteen months.',
  },
  dog_giant: {
    ideal: '12–18 months',
    min: 12,
    max: 24,
    risk: 'Higher risk of osteosarcoma, hip dysplasia and incontinence if spayed before twelve months',
    note: 'Giant breeds over 100 lb — Great Dane, St Bernard, Mastiff — close their growth plates between eighteen and twenty-four months. This one genuinely belongs in a conversation with your veterinarian.',
  },
};

const DISCLAIMER =
  'Informational estimate, not veterinary advice. Age equivalences are population averages, and vaccination and spay timing depend on your individual animal, its health, its exposure risk and the law where you live. Confirm every date and every dose with your veterinarian.';

export const hub: HubData = {
  slug: 'en/pets/pet-age-and-life-stage',
  title: 'Pet Age Calculator — Cat, Dog and Rabbit Years, Spay Age and Puppy Vaccine Schedule',
  description:
    'Your cat, dog or rabbit in human years using the current AAFP and AVMA formulas, plus the life stage that follows from it, the right age to spay, and what vaccine is due now.',
  silo: 'Pets',
  siloHref: '/en/pets',
  locale: 'en',

  eyebrow: 'Age & schedule',
  h1: "How old is my pet really, and what's due now?",
  lede:
    'The "multiply by seven" rule was never true, and it is most wrong exactly where it matters — the first two years, when a puppy or kitten goes from newborn to adult. Here are the current formulas, the life stage each one implies, and the two things that hang off the calendar: when to spay and which shot is next.',
  stamps: [
    'AVMA 2020 logarithmic formula for dogs, AAFP/AAHA 2021 stages for cats',
    'Spay windows from the AAHA canine life stage guidelines and the Hart size studies',
    'US core vaccine schedule — rabies timing follows your state and county law',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Where your pet is',

  cases: {
    title: 'What are you working out?',
    intro: 'Pick the question. Each case reads only the fields it needs.',
    items: [
      {
        id: 'cat',
        label: 'My cat in human years',
        hint: 'AAFP/AAHA equivalence and the life stage that follows.',
        yes: [
          'Human-year equivalent on the current feline formula',
          'The AAHA/AAFP life stage and what it changes',
          'How often a cat at that stage should see a vet',
        ],
        warn: [
          DISCLAIMER,
          'Cats hide illness better than almost any companion animal. A senior cat can lose a third of its kidney function before anything visible changes, which is why the check-up interval shortens with age rather than the symptoms.',
          'Indoor and outdoor cats age very differently in practice. The formula describes an indoor cat; an outdoor cat faces risks the arithmetic knows nothing about.',
          'Weight loss in an older cat is never normal ageing. Hyperthyroidism, chronic kidney disease and diabetes all present that way and all are manageable when caught early.',
        ],
        plazo: 'Annual bloodwork from seven years, every six months from ten. Kidney values, thyroid and blood pressure are the three that change first.',
        answer:
          'A cat is fifteen human years at twelve months and twenty-four at two years, then four human years for each cat year after that. A ten-year-old cat is roughly fifty-six in human terms and is entering the senior stage.',
      },
      {
        id: 'dog',
        label: 'My dog in human years',
        hint: 'AVMA 2020 formula, adjusted for the size of the breed.',
        yes: [
          'Human-year equivalent from the logarithmic AVMA formula',
          'The size adjustment for the breed you picked',
          'Life stage and what the veterinary schedule looks like there',
        ],
        warn: [
          DISCLAIMER,
          'Size drives canine lifespan more than almost anything else, and in the opposite direction to the rest of the animal kingdom: a Great Dane is geriatric at seven while a Chihuahua is barely middle-aged. Any single dog formula is an average across that spread.',
          'The AVMA 2020 formula comes from DNA methylation in Labradors, so it fits mid-size dogs best. Toy and giant breeds are the edges of its accuracy.',
          'The first year is not a straight line. A twelve-month-old dog is roughly a fifteen-year-old human, not a seven-year-old.',
        ],
        plazo: 'From the age where the formula puts your dog past fifty human years, move to twice-yearly exams and add bloodwork. That is where most treatable conditions first show up.',
        answer:
          'Sixteen times the natural log of the age in years, plus thirty-one, then adjusted for breed size — about 0.9 for toy breeds and 1.1 for large ones. A five-year-old Labrador comes out near sixty-two human years.',
      },
      {
        id: 'rabbit',
        label: 'My rabbit in human years',
        hint: 'Equivalence by breed size, plus life expectancy.',
        yes: [
          'Human-year equivalent for the breed size',
          'Life stage and typical life expectancy',
          'What changes in care at that stage',
        ],
        warn: [
          DISCLAIMER,
          'Giant rabbit breeds age fastest and live shortest — five to seven years against ten to twelve for a dwarf. A four-year-old giant is already senior while a dwarf of the same age is in its prime.',
          'Dental disease is the single most common chronic problem in older rabbits, and it starts silently. Any drop in hay consumption, drooling or a wet chin warrants an exam of the back teeth under sedation, not just a look at the front ones.',
          'Rabbits are prey animals and conceal pain almost completely. A rabbit sitting hunched and still is not resting, it is in trouble.',
        ],
        plazo: 'Annual health checks from the start, twice yearly past five years, with teeth and weight the two things to track between visits.',
        answer:
          'A rabbit reaches about twenty-one human years at twelve months, then adds six human years per year for a dwarf, eight for a medium breed and ten for a giant.',
      },
      {
        id: 'spay',
        label: 'The right age to spay or neuter',
        hint: 'The window depends on species and adult size.',
        yes: [
          'The recommended age window for that species and size',
          'What waiting or going early actually trades off',
          'The mammary tumour and orthopaedic risk figures behind the window',
        ],
        warn: [
          DISCLAIMER + ' Surgical timing is a clinical decision for your veterinarian, made with your animal in front of them.',
          'The right age is not one number. For a small dog or a cat, early is clearly better because mammary tumour risk drops enormously. For a large or giant breed, going too early raises the risk of osteosarcoma, cruciate injury and urinary incontinence, which is why the window moves later with size.',
          'Mammary tumour protection falls off sharply with each heat cycle. After the second heat, most of the benefit is gone — which is what makes the small-dog and cat windows tight.',
          'Cats can come into heat at four months. "We will do it at six months" is how a great many unplanned litters happen.',
        ],
        plazo: 'Book the pre-surgical exam a few weeks before the window opens so the date is available when you want it, rather than after the first heat.',
        answer:
          'Cats by five months. Small dogs at five to six months, medium at six to nine, large at nine to twelve, and giant breeds at twelve to eighteen — the window moves later as adult size rises, because the growth plates close later.',
      },
      {
        id: 'vaccines',
        label: "Which vaccine is due now",
        hint: 'Core schedule from the age you enter and whether there is a record.',
        yes: [
          'Which core vaccine is due at this age',
          'When the next one falls',
          'What happens when there is no vaccination record at all',
        ],
        warn: [
          DISCLAIMER,
          'Rabies vaccination is set by state and county law in the US, not by a general schedule — the required age at first dose, the interval and the accepted vaccine all vary by jurisdiction. Check your own county rather than a national rule of thumb.',
          'Maternal antibodies interfere with vaccination and fade at unpredictable times between six and sixteen weeks. That is why a puppy series is several doses rather than one: it is not topping up, it is catching the moment protection can take.',
          'A puppy is not protected until roughly two weeks after the final dose of the series. Dog parks and other high-traffic places before that are how parvovirus is caught — and parvovirus kills.',
          'An adult with no record is treated as unvaccinated and starts the series. There is no way to infer past protection from an unknown history without titre testing.',
        ],
        plazo: 'The last puppy dose must land at sixteen weeks or later — a series that stops at twelve weeks leaves a real chance the final dose never took.',
        answer:
          'The core puppy series runs from six to eight weeks, repeating every two to four weeks until at least sixteen weeks, with rabies given as your jurisdiction requires. Adults get boosters on the interval their veterinarian sets, typically one year after the series and then every one to three years.',
      },
    ],
  },

  inputsTitle: 'Your pet',
  inputsIntro: 'Fill in what the case you picked needs — the other fields are ignored.',
  fields: [
    { id: 'catage', label: 'Cat age', type: 'number', value: 8, suffix: 'years', min: 0, max: 30, step: 0.5 },
    { id: 'dogage', label: 'Dog age', type: 'number', value: 5, suffix: 'years', min: 0, max: 25, step: 0.5 },
    {
      id: 'breed',
      label: 'Dog breed',
      type: 'select',
      value: 'labrador-retriever',
      options: [
        { value: 'labrador-retriever', label: 'Labrador Retriever' },
        { value: 'golden-retriever', label: 'Golden Retriever' },
        { value: 'french-bulldog', label: 'French Bulldog' },
        { value: 'english-bulldog', label: 'English Bulldog' },
        { value: 'german-shepherd', label: 'German Shepherd' },
        { value: 'beagle', label: 'Beagle' },
        { value: 'poodle', label: 'Poodle' },
        { value: 'chihuahua', label: 'Chihuahua' },
        { value: 'rottweiler', label: 'Rottweiler' },
        { value: 'yorkshire-terrier', label: 'Yorkshire Terrier' },
        { value: 'boxer', label: 'Boxer' },
        { value: 'dachshund', label: 'Dachshund' },
        { value: 'siberian-husky', label: 'Siberian Husky' },
        { value: 'shih-tzu', label: 'Shih Tzu' },
        { value: 'pit-bull', label: 'American Pit Bull Terrier' },
      ],
    },
    { id: 'rabbitage', label: 'Rabbit age', type: 'number', value: 4, suffix: 'years', min: 0, max: 20, step: 0.5 },
    {
      id: 'rabbitbreed',
      label: 'Rabbit breed size',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'dwarf', label: 'Dwarf — under 4 lb' },
        { value: 'medium', label: 'Medium — 4 to 10 lb' },
        { value: 'giant', label: 'Giant — over 10 lb' },
      ],
    },
    {
      id: 'spaywho',
      label: 'Who is being spayed or neutered',
      type: 'select',
      value: 'dog_medium',
      options: [
        { value: 'cat', label: 'Cat' },
        { value: 'dog_small', label: 'Dog, small — under 22 lb adult' },
        { value: 'dog_medium', label: 'Dog, medium — 22 to 55 lb adult' },
        { value: 'dog_large', label: 'Dog, large — 55 to 100 lb adult' },
        { value: 'dog_giant', label: 'Dog, giant — over 100 lb adult' },
      ],
    },
    { id: 'puppyweeks', label: 'Dog age for the vaccine schedule', type: 'number', value: 10, suffix: 'weeks', min: 1, max: 900, step: 1, thousands: true, help: 'In weeks. A one-year-old dog is 52 weeks, a five-year-old is 261.' },
    {
      id: 'hasrecord',
      label: 'Is there a vaccination record?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No record, or unknown history' },
        { value: 'yes', label: 'Yes, vaccinations are documented and current' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where your pet sits on its own lifespan',
    caption:
      'The bands are the life stages for the species you picked, and the marker is where your animal falls today — which is what decides how often it should be seen.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro: 'Every equivalence below comes from the current published formula for the species, not from multiplying by seven.',

  faq: [
    {
      q: 'How old is my cat in human years?',
      a: 'The first year of a cat\'s life is worth about fifteen human years and the second about nine more, putting a two-year-old cat at twenty-four. Each year after that adds roughly four. So a seven-year-old cat is about forty-four and a fifteen-year-old around seventy-six. The AAFP treats seven to ten as mature adult and ten upwards as senior.',
    },
    {
      q: 'Is the "one dog year equals seven human years" rule true?',
      a: 'No, and it is worst precisely where people use it most. A one-year-old dog is sexually mature and skeletally almost finished — closer to a fifteen-year-old human than a seven-year-old. Ageing then slows. The 2020 formula from DNA methylation research, sixteen times the natural log of age plus thirty-one, tracks the real curve far better.',
    },
    {
      q: 'Why do big dogs age faster than small ones?',
      a: 'It runs opposite to the usual mammal pattern where bigger species live longer. Within a single species, large dogs grow much faster to a much larger adult size, and that accelerated growth appears to come with faster cellular ageing and higher cancer rates. A Great Dane is geriatric around seven; a Chihuahua of seven is middle-aged.',
    },
    {
      q: 'At what age should I spay my dog?',
      a: 'It depends on adult size. Small breeds at five to six months, before the first heat, when the mammary tumour benefit is largest and there is no orthopaedic cost. Medium at six to nine months. Large at nine to twelve, and giant breeds at twelve to eighteen, because spaying before the growth plates close raises the risk of osteosarcoma, cruciate rupture and urinary incontinence.',
    },
    {
      q: 'When should I spay a cat?',
      a: 'By five months. That is the "Fix Felines by Five" consensus supported by the AAHA and AAFP. Cats can come into heat as early as four months, the mammary tumour reduction is around sevenfold when done before six months, and the surgery is quicker and lower-risk in a young cat than in one already cycling.',
    },
    {
      q: 'Does spaying before the first heat really prevent mammary tumours?',
      a: 'The protective effect is large and it decays fast. In dogs, spaying before the first heat is associated with a dramatically reduced risk of mammary tumours; after the first heat the protection drops sharply, and after the second most of it is gone. Since roughly half of canine mammary tumours are malignant, this is the main argument for the early end of the window.',
    },
    {
      q: 'What vaccines does a puppy need and when?',
      a: 'The core series — distemper, adenovirus, parvovirus and parainfluenza — starts at six to eight weeks and repeats every two to four weeks until at least sixteen weeks. Rabies is added at the age your state or county requires. Non-core vaccines such as leptospirosis, Bordetella and Lyme depend on where you live and what the dog does.',
    },
    {
      q: 'Why does a puppy need several doses instead of one?',
      a: 'Antibodies from the mother protect the puppy early but also block the vaccine from working, and they fade at an unpredictable point somewhere between six and sixteen weeks. Repeated doses are not cumulative topping-up: each one is another chance to catch the window after maternal antibodies drop and before the puppy is exposed. That is also why the final dose must be at sixteen weeks or later.',
    },
    {
      q: 'My adult dog has no vaccination record — what now?',
      a: 'It is treated as unvaccinated. That means starting the core series over: typically two doses three to four weeks apart, plus rabies as your jurisdiction requires. Titre testing can sometimes demonstrate existing immunity, but it does not satisfy rabies law, which is written around documented vaccination.',
    },
    {
      q: 'When can my puppy go to the dog park?',
      a: 'About two weeks after the final dose of the core series, so realistically around eighteen weeks. Before then the puppy may be unprotected, and parvovirus survives in soil for months and kills. Socialisation still matters enormously in that window — do it with known, vaccinated adult dogs in private spaces rather than public ground.',
    },
    {
      q: 'How long do rabbits live?',
      a: 'A well-kept house rabbit lives eight to twelve years, with dwarf breeds at the top of that range and giants at five to seven. Neutering extends it substantially, particularly in females, where uterine adenocarcinoma is common in unspayed does over four. Diet and dental health are the other two big determinants.',
    },
    {
      q: 'How often should an older pet see a vet?',
      a: 'Once the human-year equivalent passes roughly fifty, twice a year rather than once, with bloodwork at each visit. For cats that means from about seven years, for large dogs from about six, and for small dogs from about nine. The interval shortens because early kidney, thyroid and cardiac changes are detectable long before they are visible.',
    },
  ],

  sources: [
    { name: '2021 AAHA/AAFP Feline Life Stage Guidelines', url: 'https://www.aaha.org/resources/2021-aaha-aafp-feline-life-stage-guidelines/', publisher: 'American Animal Hospital Association' },
    { name: '2019 AAHA Canine Life Stage Guidelines', url: 'https://www.aaha.org/resources/2019-aaha-canine-life-stage-guidelines/', publisher: 'American Animal Hospital Association' },
    { name: 'AAHA Canine Vaccination Guidelines', url: 'https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/', publisher: 'American Animal Hospital Association' },
    { name: 'WSAVA Vaccination Guidelines for Dogs and Cats', url: 'https://wsava.org/global-guidelines/vaccination-guidelines/', publisher: 'World Small Animal Veterinary Association' },
    { name: 'Quantitative translation of dog-to-human aging by conserved methylation', url: 'https://www.cell.com/cell-systems/fulltext/S2405-4712(20)30203-9', publisher: 'Cell Systems' },
    { name: 'Spaying and neutering — timing and health effects', url: 'https://www.avma.org/resources-tools/pet-owners/petcare/spaying-and-neutering', publisher: 'American Veterinary Medical Association' },
    { name: 'Rabies vaccination requirements by state', url: 'https://www.cdc.gov/rabies/prevention/index.html', publisher: 'US Centers for Disease Control and Prevention' },
    { name: 'Rabbit health and lifespan', url: 'https://rabbit.org/care/', publisher: 'House Rabbit Society' },
  ],

  replaces: [
    '/en/cat-age-to-human-years',
    '/en/dog-age-by-breed',
    '/en/rabbit-age-in-human-years',
    '/en/female-dog-cat-spaying-age',
    '/en/dog-vaccination-schedule-puppy-adult',
  ],

  lastReviewed: '2026-07-28',
};
