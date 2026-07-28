import type { HubData } from '../types';

/**
 * Decision hub EN — "Are my numbers normal?"
 *
 * Absorbs 12 loose calculators: blood pressure (two duplicate URLs, ACC/AHA and
 * WHO classifications), cholesterol panel, HbA1c, fasting glucose, ferritin and
 * iron status, SpO2 at sea level and at altitude, testosterone by age, FSH/LH
 * around menopause, estradiol and progesterone by cycle phase, and semen
 * analysis against the WHO 2021 reference limits.
 *
 * CLASSIFICATION CHOICE: blood pressure uses ACC/AHA 2017 (stage 1 from 130/80)
 * because this is the US market. The ESC/WHO threshold of 140/90 is shown
 * alongside, because the same reading gets two different names depending on the
 * guideline — the single most common source of confusion on this topic.
 *
 * Every cut-off below is a published reference limit, not a diagnosis.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'health'. */
const DISCLAIMER =
  'For guidance only; this does not replace diagnosis, treatment, or professional follow-up. Consult a licensed healthcare professional.';

/** ACC/AHA 2017 blood-pressure categories, by systolic and diastolic in mmHg. */
export const BP = {
  normal: { sys: 120, dia: 80 },
  elevated: { sys: 130, dia: 80 },
  stage1: { sys: 140, dia: 90 },
  crisis: { sys: 180, dia: 120 },
  /** ESC / WHO hypertension threshold, shown for contrast. */
  escThreshold: { sys: 140, dia: 90 },
};

/** NCEP ATP III cut-offs still used on most US lab reports, in mg/dL. */
export const LIPIDS = {
  total: { desirable: 200, high: 240 },
  ldl: { optimal: 100, nearOptimal: 130, borderline: 160, high: 190 },
  hdl: { lowMen: 40, lowWomen: 50, protective: 60 },
  trig: { normal: 150, high: 200, veryHigh: 500 },
};

/** ADA thresholds. HbA1c in %, fasting plasma glucose in mg/dL. */
export const GLYCEMIC = {
  a1cNormal: 5.7,
  a1cDiabetes: 6.5,
  fastingNormal: 100,
  fastingDiabetes: 126,
  /** ADAG study: estimated average glucose (mg/dL) = 28.7 × A1c − 46.7. */
  eag: { slope: 28.7, intercept: 46.7 },
};

/** Ferritin in ng/mL. WHO uses 15 for depleted stores; most clinicians act below 30. */
export const IRON = { depleted: 15, actionable: 30, refMenLow: 24, refMenHigh: 336, refWomenLow: 11, refWomenHigh: 307, overload: 300 };

/** Expected resting SpO2 in healthy, acclimatised adults by altitude in feet. */
export const SPO2_BY_ALTITUDE = [
  { ft: 0, spo2: 98 },
  { ft: 5000, spo2: 95 },
  { ft: 8000, spo2: 93 },
  { ft: 10000, spo2: 90 },
  { ft: 12000, spo2: 87 },
  { ft: 14000, spo2: 84 },
  { ft: 16000, spo2: 80 },
];

/** Total testosterone in ng/dL. Endocrine Society uses 300 as the action threshold in adult men. */
export const TESTOSTERONE = { low: 300, high: 1000, declinePctPerYear: 1, declineFromAge: 30 };

/** Hormone reference ranges used for the menopause and cycle rows. */
export const HORMONES = {
  fshMenopause: 25,
  fshFollicular: { low: 3.5, high: 12.5 },
  lhFollicular: { low: 2.4, high: 12.6 },
  estradiol: { follicular: [20, 150], midcycle: [150, 750], luteal: [30, 450], postmenopause: [0, 30] },
  progesteroneOvulatory: 3,
  progesteroneLuteal: [5, 20],
};

/** WHO laboratory manual, 6th edition (2021): lower reference limits, 5th percentile. */
export const SEMEN_WHO_2021 = {
  volumeMl: 1.4,
  concentrationMPerMl: 16,
  totalCountM: 39,
  totalMotilityPct: 42,
  progressiveMotilityPct: 30,
  normalMorphologyPct: 4,
  vitalityPct: 54,
};

export const hub: HubData = {
slug: 'en/health/blood-test-numbers',
  title: 'Are my blood test numbers normal? BP, cholesterol, A1c, ferritin, SpO2 and hormones',
  description:
    'Put your reading against the published reference range: blood pressure by ACC/AHA and by WHO, the full lipid panel, HbA1c with estimated average glucose, fasting glucose, ferritin, oxygen saturation adjusted for altitude, testosterone by age, FSH around menopause and semen analysis against WHO 2021 limits.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Lab reference ranges',
  h1: 'Are my numbers normal?',
  lede:
    'A lab report tells you the value but rarely what it means. Pick the test you are looking at, enter your reading, and you get the category it falls into, the exact cut-off on either side of you, how far you are from the nearest one, and what the guideline actually recommends doing about it.',
  stamps: ['Reviewed 27-07-2026', 'ACC/AHA 2017 · ADA · NCEP · WHO 2021', '12 calculators inside'],

  resultLabel: 'Where your reading falls',

  cases: {
    title: 'My situation is different',
    intro:
      'Each panel has its own cut-offs and its own guideline behind it. Pick the number you are trying to read.',
    items: [
      {
        id: 'bp',
        label: 'Blood pressure',
        hint: 'Systolic over diastolic, in mmHg.',
        yes: [
          'ACC/AHA 2017 category: normal, elevated, stage 1, stage 2 or hypertensive crisis',
          'The ESC/WHO reading of the same numbers, which uses 140/90 as the threshold',
          'Pulse pressure and mean arterial pressure',
          'How far you are from the next cut-off in each direction',
        ],
        warn: [
          DISCLAIMER,
          'One reading is not a diagnosis: hypertension is confirmed on the average of readings across at least two separate visits',
          'A reading above 180/120 with chest pain, breathlessness, visual change or weakness is an emergency — call 911, do not recheck',
          'Cuff size, a full bladder, caffeine, talking and crossed legs all push the number up by several mmHg',
        ],
        plazo: 'recheck elevated readings after 3 to 6 months of lifestyle change; stage 2 warrants a clinical visit within the month.',
        answer:
          'Under ACC/AHA 2017, normal is under 120/80, elevated is 120–129 systolic, stage 1 starts at 130/80 and stage 2 at 140/90.',
      },
      {
        id: 'lipids',
        label: 'Cholesterol panel',
        hint: 'Total, LDL, HDL and triglycerides in mg/dL.',
        yes: [
          'Each component against its own cut-off — LDL is the one that drives treatment',
          'Non-HDL cholesterol, which many guidelines now prefer over LDL alone',
          'The total-to-HDL ratio',
          'Whether triglycerides are in the range where fasting status matters',
        ],
        warn: [
          DISCLAIMER,
          'Cut-offs are population thresholds; the target for you depends on your overall cardiovascular risk, not on the number alone',
          'Very high triglycerides (over 500 mg/dL) carry a pancreatitis risk and need clinical attention regardless of LDL',
          'A "normal" LDL with a strong family history of early heart disease still warrants a conversation about familial hypercholesterolaemia',
        ],
        plazo: 'adults are usually screened every 4 to 6 years, more often with risk factors.',
        answer:
          'Total cholesterol under 200 mg/dL is desirable, LDL under 100 is optimal, HDL under 40 in men or 50 in women is low, and triglycerides should be under 150.',
      },
      {
        id: 'sugar',
        label: 'Blood sugar and HbA1c',
        hint: 'A1c in percent, fasting glucose in mg/dL.',
        yes: [
          'ADA category: normal, prediabetes or diabetes, from either number',
          'Estimated average glucose from your A1c, using the ADAG equation',
          'How the two numbers agree — they should tell the same story',
          'The distance to the prediabetes and diabetes thresholds',
        ],
        warn: [
          DISCLAIMER,
          'A1c is unreliable with anaemia, recent transfusion, pregnancy, haemoglobin variants or kidney disease — glucose testing is used instead',
          'A diabetes-range result normally needs a second confirming test on a different day unless symptoms are unmistakable',
          '"Fasting" means at least 8 hours with nothing but water; a non-fasting sample changes the interpretation entirely',
        ],
        plazo: 'in the prediabetes range, retest annually; structured lifestyle change cuts progression by more than half.',
        answer:
          'A1c under 5.7% is normal, 5.7–6.4% is prediabetes and 6.5% or more is diabetes. Fasting glucose splits at 100 and 126 mg/dL.',
      },
      {
        id: 'iron',
        label: 'Iron and ferritin',
        hint: 'Ferritin in ng/mL.',
        yes: [
          'Whether stores are depleted, low-normal, adequate or high',
          'The WHO threshold of 15 ng/mL and the clinical action threshold of 30',
          'Where you sit inside the laboratory reference range for your sex',
          'What a high ferritin means, which is not the same question as a low one',
        ],
        warn: [
          DISCLAIMER,
          'Ferritin is an acute-phase reactant: infection, inflammation, liver disease or obesity raise it and can mask real iron deficiency',
          'Iron deficiency can be present with a normal haemoglobin — ferritin falls first',
          'Do not start iron supplements on a ferritin result alone: excess iron is harmful and a high ferritin needs its own workup',
        ],
        plazo: 'after starting treatment for deficiency, ferritin is usually rechecked at about 3 months.',
        answer:
          'Ferritin below 15 ng/mL means depleted iron stores by WHO criteria, and most clinicians treat below 30 when symptoms fit.',
      },
      {
        id: 'oxygen',
        label: 'Oxygen saturation',
        hint: 'SpO2 from a pulse oximeter, plus your altitude.',
        yes: [
          'Your reading against the expected value for the altitude you are at',
          'Why 92% at 10,000 feet is not the same finding as 92% at sea level',
          'The thresholds where supplemental oxygen is usually considered',
          'The known limits of consumer pulse oximeters',
        ],
        warn: [
          DISCLAIMER,
          'Pulse oximeters overestimate saturation in people with darker skin, which has led to missed hypoxaemia — treat borderline readings with extra caution',
          'Cold hands, nail polish, poor perfusion and movement all corrupt the reading before the number is wrong for medical reasons',
          'Breathlessness, confusion or chest pain outrank any number on the device: seek care regardless of what it shows',
        ],
        plazo: 'a sustained reading below 90% at sea level needs same-day medical assessment.',
        answer:
          '95 to 100% is normal at sea level. At altitude the expected value drops — about 93% at 8,000 feet and 90% at 10,000.',
      },
      {
        id: 'hormones',
        label: 'Hormones and fertility labs',
        hint: 'Testosterone, FSH/LH, estradiol, progesterone or a semen analysis.',
        yes: [
          'Total testosterone against the adult male range and the age-adjusted expectation',
          'FSH against the menopause threshold, read together with how long periods have been absent',
          'Estradiol and progesterone against the phase of the cycle you are in',
          'Semen analysis against the WHO 2021 lower reference limits',
        ],
        warn: [
          DISCLAIMER,
          'Testosterone must be drawn in the morning and confirmed on a second sample before anything is concluded',
          'The WHO 2021 semen limits are the 5th percentile of men who conceived within a year — being below one of them is not infertility',
          'A single FSH value cannot diagnose menopause: the definition is 12 consecutive months without a period',
        ],
        plazo: 'repeat abnormal hormone results after 4 to 12 weeks before acting on them.',
        answer:
          'Total testosterone under 300 ng/dL is the usual action threshold in men, FSH over 25 IU/L fits menopause, and the WHO 2021 semen limits start at 16 million/mL.',
      },
    ],
  },

  inputsTitle: 'Your results',
  inputsIntro:
    'Fill in only the fields for the test you picked. Anything left at zero is skipped.',
  fields: [
    { id: 'systolic', label: 'Systolic (top number)', type: 'number', suffix: 'mmHg', min: 0, max: 260, step: 1, value: 128 },
    { id: 'diastolic', label: 'Diastolic (bottom number)', type: 'number', suffix: 'mmHg', min: 0, max: 160, step: 1, value: 82 },
    { id: 'total', label: 'Total cholesterol', type: 'number', suffix: 'mg/dL', min: 0, max: 500, step: 1, value: 195 },
    { id: 'ldl', label: 'LDL cholesterol', type: 'number', suffix: 'mg/dL', min: 0, max: 400, step: 1, value: 115 },
    { id: 'hdl', label: 'HDL cholesterol', type: 'number', suffix: 'mg/dL', min: 0, max: 150, step: 1, value: 52 },
    { id: 'trig', label: 'Triglycerides', type: 'number', suffix: 'mg/dL', min: 0, max: 1500, step: 1, value: 120 },
    { id: 'a1c', label: 'HbA1c', type: 'number', suffix: '%', min: 0, max: 16, step: 0.1, value: 5.5 },
    { id: 'glucose', label: 'Fasting glucose', type: 'number', suffix: 'mg/dL', min: 0, max: 500, step: 1, value: 92 },
    { id: 'ferritin', label: 'Ferritin', type: 'number', suffix: 'ng/mL', min: 0, max: 2000, step: 1, value: 45 },
    { id: 'spo2', label: 'Oxygen saturation (SpO2)', type: 'number', suffix: '%', min: 0, max: 100, step: 1, value: 97 },
    { id: 'altitude', label: 'Altitude where you measured', type: 'number', suffix: 'feet', min: 0, max: 18000, step: 100, value: 0 },
    { id: 'testosterone', label: 'Total testosterone', type: 'number', suffix: 'ng/dL', min: 0, max: 2000, step: 1, value: 520 },
    { id: 'fsh', label: 'FSH', type: 'number', suffix: 'IU/L', min: 0, max: 200, step: 0.1, value: 6 },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      suffix: 'years',
      min: 1,
      max: 110,
      step: 1,
      value: 45,
      help: 'Used for the age-adjusted testosterone expectation and for the menopause reading of FSH.',
    },
    {
      id: 'sex',
      label: 'Sex assigned at birth',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Male' },
        { value: 'f', label: 'Female' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Your reading on the reference scale',
    caption:
      'The scale shows the published bands for the test you selected, from the healthy range through each level of concern, with your value marked on it. The bands are guideline cut-offs, not a verdict on you.',
    bands: [
      { label: 'Healthy range', from: 0, to: 50, tone: 'good' },
      { label: 'Borderline', from: 50, to: 75, tone: 'warn' },
      { label: 'Needs attention', from: 75, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Your reading against every cut-off',
  breakdownIntro:
    'Each row names the guideline it comes from. Bars compare the figures against the largest one in the list.',

  faq: [
    {
      q: 'What is a normal blood pressure?',
      a: 'Under ACC/AHA 2017: normal is below 120/80 mmHg, elevated is 120–129 systolic with diastolic under 80, stage 1 hypertension is 130–139 or 80–89, and stage 2 is 140/90 or above. Anything over 180/120 is a hypertensive crisis.',
    },
    {
      q: 'Why does my doctor say 135/85 is high and another source says it is fine?',
      a: 'Because the two are using different guidelines. ACC/AHA 2017 calls 130/80 and above stage 1 hypertension, while the ESC and WHO keep the threshold at 140/90 and call 135/85 high-normal. Same reading, two names. This hub shows both so you can see which one you are being measured against.',
    },
    {
      q: 'What do my cholesterol numbers mean?',
      a: 'Total cholesterol under 200 mg/dL is desirable and 240 or more is high. LDL is the one that drives treatment: under 100 optimal, 100–129 near optimal, 130–159 borderline, 160–189 high, 190 or more very high. HDL under 40 in men or 50 in women is low, and 60 or more is protective. Triglycerides should be under 150.',
    },
    {
      q: 'What does my HbA1c mean in blood sugar terms?',
      a: 'The ADAG equation converts it: estimated average glucose in mg/dL equals 28.7 times your A1c minus 46.7. So an A1c of 6.0% is an average glucose of about 126 mg/dL. Under 5.7% is normal, 5.7 to 6.4% is prediabetes and 6.5% or above is in the diabetes range.',
    },
    {
      q: 'My A1c and my fasting glucose disagree. Which one is right?',
      a: 'Neither is automatically right. A1c reflects roughly three months of average glucose; a fasting sample is one moment. Disagreement is common and points at either a very recent change in glucose control or something interfering with the A1c — anaemia, haemoglobin variants, pregnancy or kidney disease all distort it. That is a conversation with your clinician, not a calculation.',
    },
    {
      q: 'What ferritin level is too low?',
      a: 'The WHO threshold for depleted iron stores is 15 ng/mL, but most clinicians act below 30 when symptoms fit, because iron deficiency without anaemia is already symptomatic at that level. Ferritin also rises with inflammation, so a "normal" 45 in someone with active inflammation can still mean depleted stores.',
    },
    {
      q: 'Is 92% oxygen saturation bad?',
      a: 'It depends entirely on where you are. At sea level, 92% is below the normal 95–100% band and warrants attention. At 10,000 feet it is close to what an acclimatised healthy person would read. This hub adjusts the expectation for the altitude you enter.',
    },
    {
      q: 'How accurate are consumer pulse oximeters?',
      a: 'Typically within 2 to 3 percentage points under good conditions, and worse than that with cold hands, nail polish, poor circulation or movement. Importantly, they overestimate saturation more often in people with darker skin, which has led to missed low-oxygen states. Treat borderline readings conservatively and let symptoms outrank the device.',
    },
    {
      q: 'What is a normal testosterone level for my age?',
      a: 'Most laboratories use 300 to 1,000 ng/dL for adult men, and the Endocrine Society treats 300 as the action threshold. Levels fall roughly 1% per year from around age 30, so a 60-year-old at the low end of the range is common. A low result must be drawn in the morning and confirmed on a second sample before anything follows.',
    },
    {
      q: 'What FSH level means menopause?',
      a: 'An FSH above about 25 IU/L fits the menopausal transition, but the diagnosis is clinical, not biochemical: 12 consecutive months without a period. FSH swings widely during perimenopause, so a single high value proves nothing on its own and a normal value does not rule it out.',
    },
    {
      q: 'What are the WHO 2021 semen analysis reference values?',
      a: 'The 6th edition lower reference limits are: volume 1.4 mL, concentration 16 million per mL, total count 39 million, total motility 42%, progressive motility 30%, normal morphology 4% and vitality 54%. These are the 5th percentile of men whose partners conceived within a year — being below one of them lowers the odds, it does not mean infertility.',
    },
    {
      q: 'Do I need to fast before these tests?',
      a: 'For fasting glucose, yes — at least 8 hours with nothing but water. For a lipid panel, current guidance allows non-fasting samples for screening, though a fasting draw is still preferred when triglycerides are high. A1c, ferritin and hormone panels do not need fasting, but testosterone should be drawn in the morning.',
    },
  ],

  sources: [
    {
      name: 'ACC/AHA 2017 Guideline for the Prevention, Detection, Evaluation and Management of High Blood Pressure in Adults',
      url: 'https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065',
      publisher: 'American Heart Association',
      date: '2017',
    },
    {
      name: 'NHLBI — ATP III Guidelines At-A-Glance (lipid cut-offs)',
      url: 'https://www.nhlbi.nih.gov/files/docs/guidelines/atglance.pdf',
      publisher: 'National Heart, Lung, and Blood Institute',
    },
    {
      name: 'ADA — Standards of Care: Classification and Diagnosis of Diabetes',
      url: 'https://diabetesjournals.org/care/article/48/Supplement_1/S27/157566',
      publisher: 'American Diabetes Association',
    },
    {
      name: 'Nathan DM et al. — Translating the A1C assay into estimated average glucose values (ADAG)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18540046/',
      publisher: 'PubMed',
      date: '2008',
    },
    {
      name: 'WHO — Serum ferritin concentrations for assessing iron status',
      url: 'https://www.who.int/publications/i/item/9789240000124',
      publisher: 'World Health Organization',
      date: '2020',
    },
    {
      name: 'WHO laboratory manual for the examination and processing of human semen, 6th edition',
      url: 'https://www.who.int/publications/i/item/9789240030787',
      publisher: 'World Health Organization',
      date: '2021',
    },
    {
      name: 'Endocrine Society — Testosterone Therapy in Men With Hypogonadism',
      url: 'https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy',
      publisher: 'Endocrine Society',
    },
    {
      name: 'FDA — Pulse Oximeter Accuracy and Limitations',
      url: 'https://www.fda.gov/medical-devices/safety-communications/pulse-oximeter-accuracy-and-limitations-fda-safety-communication',
      publisher: 'U.S. Food and Drug Administration',
    },
  ],

  replaces: [
    '/en/blood-pressure-normal-hypertension',
    '/en/blood-pressure-who-classification',
    '/en/cholesterol-total-ldl-hdl-levels',
    '/en/hemoglobin-a1c-diabetes-calculator',
    '/en/fasting-blood-glucose-levels',
    '/en/iron-ferritin-anemia',
    '/en/blood-oxygen-saturation-spo2',
    '/en/blood-oxygen-saturation-spo2-altitude',
    '/en/testosterone-normal-levels-by-age-men',
    '/en/fsh-lh-menopause-perimenopause-age',
    '/en/estrogen-progesterone-cycle-phases',
    '/en/spermiogram-reference-values-who-2021',
  ],

lastReviewed: '2026-07-28',
};
