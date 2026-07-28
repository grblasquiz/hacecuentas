import type { HubData } from '../types';

/**
 * Decision hub EN — "Am I at a healthy weight?"
 *
 * Absorbs 12 loose calculators: BMI, healthy weight range for your height,
 * ideal body weight (Devine / Robinson / Hamwi / Lorentz), the ideal-weight
 * variant for women with frame size, the 65+ geriatric BMI table, child and
 * teen BMI percentile, healthy weight by age for children, fat vs lean mass,
 * the subcutaneous / visceral fat split, waist-to-hip ratio, waist
 * circumference risk, and body surface area (Du Bois).
 *
 * CONSTANTS — every number below is taken from the live formulas this hub
 * replaces, or from the published source they cite:
 *  - BMI bands: src/lib/formulas/imc.ts (WHO 1997, unchanged)
 *  - Devine / Robinson / Lorentz: src/lib/formulas/peso-ideal.ts and
 *    src/lib/formulas/peso-ideal-formula-lorentz-devine.ts
 *  - Hamwi + frame size ±10%: src/lib/formulas/stylecraze-peso-ideal-women-formula-altura.ts
 *  - 65+ bands: src/lib/formulas/imc-adultos-mayores-edad-tabla.ts (ESPEN 2018)
 *  - child BMI percentiles: src/lib/formulas/imc-infantil-percentil.ts (WHO)
 *  - child weight percentiles: src/lib/formulas/peso-ideal-ninos.ts (WHO)
 *  - fat vs lean and visceral split: src/lib/formulas/masa-grasa-vs-masa-magra-composicion.ts
 *    and src/lib/formulas/grasa-subcutanea-visceral-total-diferencia.ts
 *  - WHR bands: src/lib/formulas/indice-cintura-cadera-salud-cardiovascular.ts (WHO 2008)
 *  - waist thresholds: src/lib/formulas/perimetro-abdominal-riesgo-cardiovascular.ts (WHO TR 894)
 *  - BSA: src/lib/formulas/superficie-corporal.ts (Du Bois 1916, Mosteller 1987, Haycock 1978)
 *
 * DEVIATION, deliberate: peso-ideal.ts divides by 2.5 for women in the Lorentz
 * formula. The published Lorentz (1929) and the dedicated Lorentz/Devine
 * calculator both divide by 2. This hub uses 2, the literature value.
 *
 * DEVIATION, deliberate: the women's ideal-weight calculator labels
 * "100 lb + 5 lb/in" as Devine (it is Hamwi) and "45.5 kg + 2.2 kg/in" as
 * Hamwi (it is Devine, with 2.2 instead of the published 2.3). This hub uses
 * the correct attribution and the published 2.3 coefficient.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'health'. */
const DISCLAIMER =
  'For guidance only; this does not replace diagnosis, treatment, or professional follow-up. Consult a licensed healthcare professional.';

/** Unit conversions. */
export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;

/** WHO adult BMI scale, and the range `position` is mapped onto. */
export const SCALE = {
  min: 15,
  max: 40,
  bands: [
    { label: 'Underweight (under 18.5)', to: 18.5, tone: 'prop' },
    { label: 'Healthy weight (18.5–24.9)', to: 25, tone: 'good' },
    { label: 'Overweight (25–29.9)', to: 30, tone: 'warn' },
    { label: 'Obesity (30 and over)', to: 40, tone: 'main' },
  ],
};

/** Healthy BMI window used to turn BMI into a weight range. */
export const HEALTHY_BMI = { min: 18.5, max: 24.9 };
/** ESPEN 2018 healthy window for adults 65 and older. */
export const SENIOR_BMI = { min: 22, max: 27, whoMin: 23, whoMax: 28 };

/** Ideal body weight formulas, in kg, from inches over 5 ft. */
export const IBW = {
  devine: { male: 50, female: 45.5, perInch: 2.3 },
  robinson: { male: 52, female: 49, malePerInch: 1.9, femalePerInch: 1.7 },
  hamwi: { male: 48, female: 45.5, malePerInch: 2.7, femalePerInch: 2.2 },
  /** Lorentz works off centimetres, not inches. */
  lorentz: { maleDivisor: 4, femaleDivisor: 2 },
  /** Small / large frame adjustment, from the women's ideal-weight calculator. */
  frame: { small: 0.9, medium: 1.0, large: 1.1 },
};

/** WHO child BMI-for-age percentiles [P5, P50, P85, P97], boys. Verbatim from imc-infantil-percentil.ts. */
export const CHILD_BMI_BOYS: Record<number, number[]> = {
  2: [14.8, 16.4, 18.0, 19.4], 3: [14.3, 15.7, 17.2, 18.5],
  4: [13.9, 15.3, 16.9, 18.2], 5: [13.8, 15.2, 16.9, 18.3],
  6: [13.7, 15.3, 17.1, 18.8], 7: [13.7, 15.5, 17.5, 19.6],
  8: [13.8, 15.7, 18.0, 20.4], 9: [14.0, 16.0, 18.6, 21.3],
  10: [14.2, 16.4, 19.3, 22.3], 12: [15.0, 17.5, 20.9, 24.4],
  14: [16.0, 19.0, 22.6, 26.2], 16: [17.0, 20.2, 24.0, 27.5],
  18: [17.8, 21.1, 25.0, 28.5],
};
/** WHO child BMI-for-age percentiles [P5, P50, P85, P97], girls. */
export const CHILD_BMI_GIRLS: Record<number, number[]> = {
  2: [14.4, 16.0, 17.7, 19.1], 3: [13.9, 15.4, 17.1, 18.5],
  4: [13.6, 15.1, 16.9, 18.4], 5: [13.4, 15.0, 17.0, 18.7],
  6: [13.3, 15.1, 17.2, 19.2], 7: [13.4, 15.4, 17.7, 20.0],
  8: [13.5, 15.7, 18.3, 21.0], 9: [13.7, 16.1, 19.1, 22.1],
  10: [14.0, 16.6, 19.9, 23.2], 12: [14.8, 17.5, 21.3, 25.0],
  14: [15.8, 18.9, 22.8, 26.7], 16: [16.6, 19.9, 24.0, 27.8],
  18: [17.1, 20.4, 24.5, 28.4],
};

/** WHO weight-for-age percentiles in kg [P15, P50, P85], boys 0–10. Verbatim from peso-ideal-ninos.ts. */
export const CHILD_WEIGHT_BOYS: Record<number, number[]> = {
  0: [2.9, 3.3, 3.9], 0.5: [6.7, 7.9, 9.2], 1: [8.6, 9.6, 10.8],
  1.5: [9.5, 10.9, 12.2], 2: [10.8, 12.2, 13.6], 3: [12.7, 14.3, 16.2],
  4: [14.4, 16.3, 18.6], 5: [16.0, 18.3, 21.0], 6: [17.8, 20.5, 23.5],
  7: [19.9, 22.9, 26.4], 8: [22.0, 25.4, 29.7], 9: [24.3, 28.1, 33.3],
  10: [26.7, 31.2, 37.5],
};
/** WHO weight-for-age percentiles in kg [P15, P50, P85], girls 0–10. */
export const CHILD_WEIGHT_GIRLS: Record<number, number[]> = {
  0: [2.8, 3.2, 3.7], 0.5: [6.2, 7.3, 8.6], 1: [7.9, 8.9, 10.1],
  1.5: [9.1, 10.2, 11.6], 2: [10.2, 11.5, 13.0], 3: [12.2, 13.9, 15.9],
  4: [14.0, 16.1, 18.5], 5: [15.8, 18.2, 21.2], 6: [17.5, 20.2, 23.5],
  7: [19.5, 22.4, 26.3], 8: [21.7, 25.0, 29.7], 9: [24.3, 28.2, 33.7],
  10: [27.0, 31.9, 38.5],
};

/** WHO Expert Consultation (Geneva 2008) waist-to-hip ratio risk bands. */
export const WHR = { maleLow: 0.90, maleHigh: 0.95, femaleLow: 0.80, femaleHigh: 0.85 };
/** WHO Technical Report 894 waist circumference cut-offs, in cm. */
export const WAIST_CM = { maleIncreased: 94, maleHigh: 102, femaleIncreased: 80, femaleHigh: 88 };
/** Waist-to-height ratio: the practical single threshold. */
export const WHTR_THRESHOLD = 0.5;

/** Body-fat percentage bands from masa-grasa-vs-masa-magra-composicion.ts. */
export const BODY_FAT_BANDS = [
  { max: 10, label: 'Very low (athletic, or a health risk)' },
  { max: 20, label: 'Low to optimal' },
  { max: 25, label: 'Normal' },
  { max: 30, label: 'High fat, overweight range' },
  { max: 999, label: 'Obesity range' },
];
/** Visceral share of total fat mass — risk bands from the visceral-fat calculator. */
export const VISCERAL_BANDS = [
  { max: 10, label: 'Low — favourable fat distribution' },
  { max: 20, label: 'Moderate — watch your waist' },
  { max: 30, label: 'Elevated — metabolic syndrome markers' },
  { max: 999, label: 'High — clearly elevated cardiometabolic risk' },
];

/** Body surface area coefficients: Du Bois 1916, Mosteller 1987, Haycock 1978. */
export const BSA = {
  duBois: { k: 0.007184, wExp: 0.425, hExp: 0.725 },
  haycock: { k: 0.024265, wExp: 0.5378, hExp: 0.3964 },
  mostellerDivisor: 3600,
};

export const hub: HubData = {
slug: 'en/health/body-weight',
  title: 'Am I at a healthy weight? BMI, ideal weight, body fat and waist calculator',
  description:
    'Work out your BMI and the healthy weight range for your height in pounds, your ideal body weight by the Devine, Robinson, Hamwi and Lorentz formulas, the adjusted range if you are 65 or older, a child or teen BMI percentile, your fat versus lean mass split, your waist-to-hip ratio and waist risk, and your body surface area.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Weight, body composition and risk',
  h1: 'Am I at a healthy weight?',
  lede:
    'Your weight and height give you a BMI and a healthy weight range in pounds. But BMI cannot tell muscle from fat, and it reads differently at 70 than at 30 and differently again in a child — so this also gives you your ideal weight by the four classic formulas, the age-adjusted ranges, your fat and lean mass split, and the waist numbers that catch the risk BMI misses.',
  stamps: ['Reviewed 28-07-2026', 'WHO 1997 bands · ESPEN 2018 · WHO 2008 waist · Du Bois', '12 calculators inside'],

  resultLabel: 'Your body mass index',

  cases: {
    title: 'My situation is different',
    intro:
      'Same measurements, different reference table. Pick who the numbers are for — an adult, someone 65 or older, a child, or a specific question about body fat, waist or clinical dosing.',
    items: [
      {
        id: 'adult',
        label: 'Adult, 18 to 64',
        hint: 'The standard WHO BMI reading.',
        yes: [
          'BMI = weight in kilograms divided by height in metres squared — the WHO formula',
          'Your WHO category: under 18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, 30 and over obesity',
          'The healthy weight range for your height, converted back into pounds',
          'Ideal body weight by Devine, Robinson, Hamwi and Lorentz, plus their average',
          'Your waist-to-height ratio, which catches abdominal fat a normal BMI can hide',
        ],
        warn: [
          DISCLAIMER,
          'BMI does not distinguish muscle from fat: a lifter at 8% body fat can read 29 and be nowhere near overweight',
          'A healthy BMI with a waist over half your height still means risky abdominal fat — check that row',
          'The ideal-weight formulas were built for drug dosing and actuarial tables, not as personal targets; treat the average as a centre, not a goal',
        ],
        plazo: 'a sustainable rate of loss is 1 to 2 lb per week; faster than that costs you muscle.',
        answer:
          'A BMI of 18.5 to 24.9 is the healthy range for adults, which for most heights is a 30 to 40 lb window rather than a single number.',
      },
      {
        id: 'senior',
        label: '65 or older',
        hint: 'The healthy range moves up with age.',
        yes: [
          'The same BMI number, read against the geriatric range instead of the standard one',
          'ESPEN 2018 healthy window: 22 to 27, with under 22 flagged as nutritional risk',
          'The WHO suggestion for older adults, 23 to 28, shown alongside it',
          'What that range means in pounds for your height',
          'Whether your reading is low enough to be a sarcopenia and frailty concern rather than a weight concern',
        ],
        warn: [
          DISCLAIMER,
          'Being at the low end is the bigger risk after 65: mortality studies find the lowest risk around BMI 27 to 28, not 22',
          'A BMI under 22 in an older adult is a nutritional-risk flag, not "being slim" — raise it with a clinician',
          'Unintentional loss of more than 5% of body weight in 6 months warrants medical assessment regardless of BMI',
          'Height shrinks with age, and measuring shorter inflates BMI — use a recently measured height, not the one on your driving licence',
        ],
        plazo: 'have weight and grip strength checked at least once a year from 65 onward.',
        answer:
          'After 65 the evidence-based healthy range shifts up to about 22–27 (ESPEN) or 23–28 (WHO), because a little extra reserve protects against sarcopenia.',
      },
      {
        id: 'child',
        label: 'A child or teenager (2 to 18)',
        hint: 'BMI has to be read as a percentile.',
        yes: [
          'BMI calculated the same way, then placed on the WHO BMI-for-age curve for that exact age and sex',
          'Which percentile band it falls in: under the 5th, 5th to 84th, 85th to 96th, or 97th and above',
          'The P5, P50, P85 and P97 BMI values for that age, interpolated between tabulated years',
          'For under-11s, the healthy weight range in pounds from the WHO weight-for-age curve',
        ],
        warn: [
          DISCLAIMER,
          'A child’s absolute BMI number means nothing on its own — only the percentile for their age and sex does',
          'Never put a child on a calorie-restricted diet based on a calculator; growth is the thing you must not interrupt',
          'What matters clinically is whether the child stays on their own curve, not which curve it is: a sudden crossing of two bands is the real signal',
          'Under 2 years old, weight-for-length is used instead of BMI — this hub does not cover that',
        ],
        plazo: 'growth is normally plotted at every well-child visit; bring the last two measurements, not just today’s.',
        answer:
          'In children BMI is read as a percentile for age and sex: 5th to 84th is healthy, 85th to 96th is overweight, and 97th and above is obesity.',
      },
      {
        id: 'composition',
        label: 'I know my body fat percentage',
        hint: 'Split the weight into fat and lean mass.',
        yes: [
          'Fat mass and lean mass in pounds, from your weight and body fat percentage',
          'The classification band your body fat percentage falls into',
          'If you know your visceral share, the split between visceral and subcutaneous fat as a percentage of body weight',
          'The subcutaneous-to-visceral ratio, which is what a DEXA report gives you',
        ],
        warn: [
          DISCLAIMER,
          'Body fat percentage from a bathroom scale or a handheld device can be off by 5 percentage points or more; DEXA and hydrostatic weighing are the reliable methods',
          'The bands in this hub are the male reference bands — healthy body fat runs roughly 8 to 10 points higher in women at every level',
          'Visceral fat drains straight into the portal circulation, which is why a small visceral share drives an outsized share of metabolic risk',
          'Visceral share is a DEXA or MRI output — if you are guessing it, the split below is a guess too',
        ],
        plazo: 'body composition moves slowly: re-measure every 8 to 12 weeks, never weekly.',
        answer:
          'Fat mass is your weight times your body fat percentage; everything left over — muscle, bone, organs, water — is lean mass.',
      },
      {
        id: 'waist',
        label: 'Waist and hips',
        hint: 'The measurement BMI cannot see.',
        yes: [
          'Waist-to-hip ratio against the WHO 2008 bands: under 0.90 low risk for men, under 0.80 for women',
          'Waist circumference against the WHO cut-offs — 40 and 37 inches for men, 35 and 31.5 for women',
          'Waist-to-height ratio, where the practical rule is to keep your waist under half your height',
          'How all three compare with your BMI category, which is where the disagreements show up',
        ],
        warn: [
          DISCLAIMER,
          'Measure the waist horizontally at the level of the navel, at the end of a normal breath out, without pulling the tape tight',
          'Waist circumference beats BMI at predicting cardiometabolic risk — if the two disagree, the waist is the one to act on',
          'Thresholds are population-specific: the International Diabetes Federation uses 35.5 inches for men of Latin American and South Asian origin, not 40',
          'A single measurement varies by an inch depending on posture and time of day; measure the same way each time',
        ],
        plazo: 'a 5 to 10% loss of body weight typically takes 1 to 2 inches off the waist.',
        answer:
          'Keep your waist under half your height; above 40 inches for men or 35 for women, the risk is substantially elevated whatever your BMI says.',
      },
      {
        id: 'bsa',
        label: 'Body surface area',
        hint: 'For clinical dosing, in m².',
        yes: [
          'Body surface area by Du Bois & Du Bois (1916), the original formula',
          'Mosteller (1987), the square-root formula used most in practice today',
          'Haycock (1978), preferred in paediatrics',
          'The average of the three and how far apart they are, which tells you how much the choice matters for you',
        ],
        warn: [
          DISCLAIMER,
          'BSA is used for chemotherapy dosing, cardiac index and renal clearance — never self-calculate a dose from it',
          'The three formulas diverge most at the extremes of size, which is exactly where paediatric and bariatric dosing lives',
          'Du Bois was derived from nine subjects and systematically underestimates BSA in obesity; Mosteller is the practical default',
        ],
        plazo: 'a typical adult BSA is 1.6 to 2.0 m²; the standard dosing reference is 1.73 m².',
        answer:
          'Du Bois gives BSA = 0.007184 × weight(kg)^0.425 × height(cm)^0.725; Mosteller is the square root of weight times height over 3600.',
      },
    ],
  },

  inputsTitle: 'Your measurements',
  inputsIntro:
    'Weight and height are enough for a BMI. The rest only feed their own rows — leave anything you do not have at zero and those rows drop out.',
  fields: [
    { id: 'weightLb', label: 'Weight', type: 'number', suffix: 'lb', min: 5, max: 700, step: 0.5, value: 170 },
    { id: 'heightFt', label: 'Height — feet', type: 'number', suffix: 'ft', min: 1, max: 8, step: 1, value: 5 },
    { id: 'heightIn', label: 'Height — inches', type: 'number', suffix: 'in', min: 0, max: 11.5, step: 0.5, value: 9 },
    {
      id: 'sex',
      label: 'Sex',
      type: 'select',
      value: 'm',
      options: [
        { value: 'm', label: 'Male' },
        { value: 'f', label: 'Female' },
      ],
      help: 'BMI bands are the same for both. Sex only changes the ideal-weight formulas, the waist thresholds and the child percentile curve.',
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      suffix: 'years',
      min: 2,
      max: 110,
      step: 1,
      value: 40,
      help: 'From 65 the healthy range moves up. Between 2 and 18 the child percentile case applies.',
    },
    {
      id: 'frame',
      label: 'Frame size',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'small', label: 'Small — adjusts ideal weight down 10%' },
        { value: 'medium', label: 'Medium — no adjustment' },
        { value: 'large', label: 'Large — adjusts ideal weight up 10%' },
      ],
      help: 'Wrap a thumb and middle finger around the opposite wrist: overlapping is a small frame, just touching is medium, not meeting is large.',
    },
    {
      id: 'waistIn',
      label: 'Waist (optional)',
      type: 'number',
      suffix: 'in',
      min: 0,
      max: 90,
      step: 0.25,
      value: 34,
      help: 'Horizontal, at navel level, at the end of a normal breath out, tape snug but not compressing.',
    },
    {
      id: 'hipIn',
      label: 'Hips (optional)',
      type: 'number',
      suffix: 'in',
      min: 0,
      max: 90,
      step: 0.25,
      value: 40,
      help: 'At the widest point around the buttocks. Needed for the waist-to-hip ratio.',
    },
    {
      id: 'bodyFat',
      label: 'Body fat percentage (optional)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 70,
      step: 0.1,
      value: 22,
      help: 'From DEXA, a bioimpedance scale or a caliper measurement. Leave at 0 to skip the composition rows.',
    },
    {
      id: 'visceralShare',
      label: 'Visceral share of total fat (optional)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 60,
      step: 0.5,
      value: 12,
      help: 'A DEXA or MRI output: what percentage of your fat mass is visceral, not what percentage of your body it is.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Where you land on the BMI scale',
    caption:
      'The scale runs from BMI 15 to 40 with the WHO bands marked: underweight below 18.5, healthy from 18.5 to 24.9, overweight from 25 to 29.9 and obesity from 30. The marker is your BMI. If you picked the 65-plus or child case, read the marker against the adjusted range in the rows below rather than against these adult bands.',
    bands: [
      { label: 'Underweight', from: 15, to: 18.5, tone: 'warn' },
      { label: 'Healthy weight', from: 18.5, to: 25, tone: 'good' },
      { label: 'Overweight', from: 25, to: 30, tone: 'warn' },
      { label: 'Obesity', from: 30, to: 40, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Your numbers against the references',
  breakdownIntro:
    'Every row states its own unit — pounds, inches, BMI points, a ratio or square metres. Rows you did not supply data for are left out.',

  faq: [
    {
      q: 'What is a healthy BMI?',
      a: 'For adults, the WHO puts the healthy range at 18.5 to 24.9. Below 18.5 is underweight, 25 to 29.9 is overweight, 30 to 34.9 is obesity class I, 35 to 39.9 class II and 40 or more class III. Those bands have not changed since 1997 and are the same for men and women.',
    },
    {
      q: 'How much should I weigh for my height?',
      a: 'Multiply your height in metres squared by 18.5 for the bottom of the range and by 24.9 for the top. At 5 ft 9 in that works out to roughly 125 to 168 lb. It is a window of about 40 lb, not a single number, which is why the ideal-weight formulas below should be read as a centre rather than a target.',
    },
    {
      q: 'Which ideal weight formula should I use?',
      a: 'None of them is "right". Devine (1974) exists to dose drugs and is still the pharmacology standard. Robinson (1983) came out of epidemiological data. Hamwi (1964) was built for diabetes meal planning. Lorentz (1929) is the simple European one. They disagree by several pounds, so this hub shows all four and their average, and compares that against the WHO healthy range.',
    },
    {
      q: 'Is BMI different for men and women?',
      a: 'No. The WHO uses the same 18.5 to 24.9 range for both. Sex does change three other things in this hub: the ideal-weight formula coefficients, the waist and waist-to-hip thresholds, and the child percentile curve. Body fat percentage bands also differ by about 8 to 10 points, which is why the composition case flags that explicitly.',
    },
    {
      q: 'Does BMI still work if you are over 65?',
      a: 'Only with an adjustment. The ESPEN 2018 consensus places the healthy range at 22 to 27 in adults 65 and over, and the WHO suggests 23 to 28. Large mortality meta-analyses find the lowest risk around 27 to 28 in this group. Below 22 is a nutritional-risk flag, because a little reserve protects against sarcopenia and frailty.',
    },
    {
      q: 'Why can an athlete have a high BMI without being overweight?',
      a: 'Because muscle is denser than fat and BMI cannot tell them apart. A bodybuilder at 8% body fat can score 29. If you carry a lot of muscle, use body fat percentage, waist-to-height ratio or waist circumference instead, all of which are in this hub.',
    },
    {
      q: 'What waist measurement is too big?',
      a: 'The WHO cut-offs are 37 inches (94 cm) for increased risk and 40 inches (102 cm) for substantially elevated risk in men, and 31.5 inches (80 cm) and 35 inches (88 cm) in women. The International Diabetes Federation uses a lower 35.5-inch line for men of Latin American and South Asian origin. The simplest rule of all is to keep your waist under half your height.',
    },
    {
      q: 'What does waist-to-hip ratio tell me that BMI does not?',
      a: 'Where the fat is. Fat around the middle is metabolically active and drains into the liver; fat on the hips and thighs is far less harmful. The WHO 2008 bands put low risk below 0.90 for men and 0.80 for women, and high risk above 0.95 and 0.85 respectively. Two people with identical BMIs can sit on opposite sides of those lines.',
    },
    {
      q: 'How is a child’s BMI read?',
      a: 'As a percentile, never as an absolute number. The same BMI of 19 is obesity in a 5-year-old and healthy in a 15-year-old. This hub places the value on the WHO BMI-for-age curve for the child’s exact age and sex, interpolating between tabulated years: below the 5th percentile is underweight, 5th to 84th healthy, 85th to 96th overweight, and 97th or above obesity.',
    },
    {
      q: 'What is the difference between visceral and subcutaneous fat?',
      a: 'Subcutaneous fat sits under the skin; visceral fat wraps the organs inside the abdominal wall. Visceral fat drains directly into the portal vein and reaches the liver first, which is why it drives insulin resistance and dyslipidaemia out of all proportion to its mass. A visceral share above about 20% of total fat is where the risk markers start climbing.',
    },
    {
      q: 'What is body surface area used for?',
      a: 'Clinical dosing. Chemotherapy is prescribed in mg per m², cardiac output is normalised as cardiac index in L/min/m², and kidney function is reported per 1.73 m². Du Bois (1916) is the original, Mosteller (1987) is the practical default because it is a single square root, and Haycock (1978) is preferred in paediatrics.',
    },
    {
      q: 'How fast can I safely lose weight?',
      a: 'About 1 to 2 lb a week, from a moderate deficit of 300 to 500 calories a day combined with resistance training two or three times a week. Faster than that and a large share of what you lose is muscle, which lowers your metabolic rate and makes the weight easier to regain.',
    },
  ],

  sources: [
    {
      name: 'WHO — Obesity and overweight fact sheet (BMI classification)',
      url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight',
      publisher: 'World Health Organization',
    },
    {
      name: 'CDC — About Adult BMI',
      url: 'https://www.cdc.gov/bmi/adult-calculator/index.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'WHO — Waist circumference and waist–hip ratio: report of a WHO expert consultation',
      url: 'https://www.who.int/publications/i/item/9789241501491',
      publisher: 'World Health Organization',
      date: '2008',
    },
    {
      name: 'Volkert D et al. — ESPEN guideline on clinical nutrition and hydration in geriatrics',
      url: 'https://pubmed.ncbi.nlm.nih.gov/30005900/',
      publisher: 'PubMed',
      date: '2018',
    },
    {
      name: 'Winter JE et al. — BMI and all-cause mortality in older adults: a meta-analysis',
      url: 'https://pubmed.ncbi.nlm.nih.gov/24452240/',
      publisher: 'Am J Clin Nutr / PubMed',
      date: '2014',
    },
    {
      name: 'Robinson JD et al. — Determination of ideal body weight for drug dosage calculations',
      url: 'https://pubmed.ncbi.nlm.nih.gov/6869387/',
      publisher: 'PubMed',
      date: '1983',
    },
    {
      name: 'Du Bois D, Du Bois EF — A formula to estimate the approximate surface area',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2520314/',
      publisher: 'PubMed',
      date: '1916 / 1989 reprint',
    },
    {
      name: 'Mosteller RD — Simplified calculation of body-surface area (NEJM)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3657876/',
      publisher: 'PubMed',
      date: '1987',
    },
    {
      name: 'WHO — Growth reference data for children and adolescents 5–19 years',
      url: 'https://www.who.int/tools/growth-reference-data-for-5to19-years',
      publisher: 'World Health Organization',
    },
    {
      name: 'Alberti KGMM et al. — Harmonizing the metabolic syndrome (Circulation)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/19805654/',
      publisher: 'PubMed',
      date: '2009',
    },
  ],

  replaces: [
    '/en/bmi-calculator',
    '/en/ideal-weight-calculator',
    '/en/ideal-weight-for-women',
    '/en/ideal-weight-lorentz-devine-formula',
    '/en/bmi-seniors-65-plus-table',
    '/en/child-bmi-percentile',
    '/en/peso-ideal-ninos',
    '/en/body-composition-fat-vs-lean',
    '/en/subcutaneous-visceral-fat-difference',
    '/en/waist-to-hip-ratio-cardiovascular-health',
    '/en/abdominal-circumference-cardiovascular-risk',
    '/en/superficie-corporal-du-bois',
  ],

lastReviewed: '2026-07-28',
};
