import type { HubData } from '../types';

/**
 * Decision hub EN — "What do I do right now?" (choking, CPR, anaphylaxis).
 *
 * Absorbs 3 loose calculators (see hub.replaces):
 *  - /en/choking-heimlich-age-maneuver
 *  - /en/cpr-bls-chest-compressions-rate
 *  - /en/epinephrine-dosage-weight-anaphylaxis
 *
 * SAFETY CONTRACT FOR THIS FILE — read before editing anything:
 *
 * 1. The first line of every branch is "call 911". Not a number, not a field.
 *    If an edit ever pushes a calculation above the emergency number, the edit
 *    is wrong.
 * 2. This hub does NOT compute a drug dose. The epinephrine branch names the
 *    autoinjector strength that matches a weight band and stops there. It must
 *    never output mg/kg, millilitres, ampoule volumes, or anything a person
 *    could draw up and inject. The calculator it replaces did exactly that —
 *    see the note below.
 * 3. Infant technique is not a smaller version of adult technique. Abdominal
 *    thrusts are never performed on an infant under 1 (organ injury). Any edit
 *    that collapses the infant branches into the adult ones is a safety
 *    regression.
 *
 * GUIDELINE EDITION: the 2025 American Heart Association Guidelines for CPR and
 * Emergency Cardiovascular Care, published 21–22 October 2025 in Circulation
 * (Part 6 Pediatric BLS, Part 7 Adult BLS). Every constant below is from that
 * edition or from its unchanged 2020 predecessor where 2025 did not revise it.
 *
 * WHAT 2025 CHANGED, and what the old calculators still said:
 *  - Choking, adult AND child: the sequence now STARTS with 5 back blows, then
 *    5 abdominal thrusts, alternating. The old formula
 *    (src/lib/formulas/choking-heimlich-edad-maniobra.ts) taught abdominal
 *    thrusts alone as the first and only maneuver. That is the pre-2025
 *    sequence. This hub does not reproduce it.
 *  - Choking, infant: 5 back blows alternating with 5 chest thrusts, delivered
 *    with the heel of one hand. 2025 deliberately stopped calling these "chest
 *    compressions" because rate and recoil do not apply. The old formula said
 *    "chest compressions".
 *  - Infant CPR: the 2-finger technique is NO LONGER RECOMMENDED. Use the
 *    2 thumb–encircling hands technique, or the heel of one hand if you cannot
 *    encircle the chest.
 *  - The old choking formula split adult/child at age 9. The guidelines split
 *    at puberty, and the technique boundary that actually matters is 1 year.
 *
 * WHAT THIS HUB REFUSES TO REPRODUCE:
 *  src/lib/formulas/epinefrina-dosis-peso-anafilaxia.ts computes 0.01 mg/kg,
 *  caps it at 0.5 mg, and — below 7.5 kg — tells a lay reader to "draw it from
 *  a 1 mg/mL ampoule". That is a preparation instruction for an injectable
 *  vasopressor, issued to an anonymous web visitor, with no supervision and no
 *  way to verify the concentration in front of them. It also contradicts
 *  itself: the same branch that says "do not use a standard autoinjector"
 *  selects a 0.1 mg autoinjector as the device. None of that is in this hub.
 *  What is here: the weight band, the device strength that matches it, and the
 *  instruction to use the device that was actually prescribed.
 */

/** YMYL disclaimer — verbatim from src/lib/disclaimers.ts, COPY.en, domain 'health'. */
const DISCLAIMER =
  'For guidance only; this does not replace diagnosis, treatment, or professional follow-up. Consult a licensed healthcare professional.';

/** The line that outranks every number on this page. Repeated, deliberately. */
const CALL_911 =
  'Call 911 now — before you use anything on this page. Put the phone on speaker: the dispatcher will talk you through the steps while your hands stay free.';

/** Second warn on every branch: what a web page cannot be. */
const NOT_A_SUBSTITUTE =
  'This page is a reference, not a rescuer. It does not replace the 911 call and it does not replace hands-on CPR and first-aid training, which is the only thing that reliably works under stress.';

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;

/** Compression rate target, identical for adults, children and infants (AHA 2025). */
export const RATE = { min: 100, max: 120 };

/** Seconds the two rescue breaths take out of a cycle, for the cycle-length maths. */
export const BREATH_SECONDS = 5;

/** Swap the person doing compressions every 2 minutes to keep depth from fading. */
export const SWAP_MINUTES = 2;

/** Longest acceptable pause in compressions, in seconds (AHA 2025, pediatric: <10 s). */
export const MAX_PAUSE_SECONDS = 10;

/**
 * Compression depth and technique by age band.
 * Depths: adult at least 2 in (5 cm) and no more than 2.4 in (6 cm); child
 * about 2 in (5 cm); infant about 1.5 in (4 cm). Child and infant are also
 * bounded by "at least one third of the front-to-back chest depth".
 */
export const CPR = {
  adult: {
    label: 'Adult — puberty and older',
    depthMinIn: 2,
    depthMaxIn: 2.4,
    depthMinCm: 5,
    depthMaxCm: 6,
    thirdOfChest: false,
    hands: 'Two hands, heel of one hand on the lower half of the breastbone, other hand on top, fingers interlocked.',
    ratioSingle: '30:2',
    ratioDouble: '30:2',
    compressionsSingle: 30,
    compressionsDouble: 30,
  },
  child: {
    label: 'Child — 1 year to puberty',
    depthMinIn: 2,
    depthMaxIn: 2,
    depthMinCm: 5,
    depthMaxCm: 5,
    thirdOfChest: true,
    hands: 'Heel of one hand on the lower half of the breastbone. Use two hands if one does not reach the depth.',
    ratioSingle: '30:2',
    ratioDouble: '15:2',
    compressionsSingle: 30,
    compressionsDouble: 15,
  },
  infant: {
    label: 'Infant — under 1 year',
    depthMinIn: 1.5,
    depthMaxIn: 1.5,
    depthMinCm: 4,
    depthMaxCm: 4,
    thirdOfChest: true,
    hands: 'Two thumbs side by side on the breastbone with your hands encircling the chest. If you cannot encircle it, use the heel of one hand. The two-finger technique is no longer recommended (AHA 2025).',
    ratioSingle: '30:2',
    ratioDouble: '15:2',
    compressionsSingle: 30,
    compressionsDouble: 15,
  },
};

/**
 * Choking sequences, AHA 2025. `abdominal: false` is the load-bearing field:
 * an infant never receives abdominal thrusts.
 */
export const CHOKING = {
  adult: {
    label: 'Adult or child over 1',
    backBlows: 5,
    secondManeuver: 'abdominal thrusts',
    secondCount: 5,
    abdominal: true,
    where: 'Back blows between the shoulder blades with the heel of your hand, leaning them forward. Then abdominal thrusts: fist just above the navel, well below the breastbone, inward and upward.',
  },
  pregnant: {
    label: 'Late pregnancy, or a chest you cannot reach around',
    backBlows: 5,
    secondManeuver: 'chest thrusts',
    secondCount: 5,
    abdominal: false,
    where: 'Back blows as usual. Then chest thrusts instead of abdominal thrusts: hands on the centre of the breastbone, straight back towards you. Never on the abdomen.',
  },
  infant: {
    label: 'Infant under 1',
    backBlows: 5,
    secondManeuver: 'chest thrusts',
    secondCount: 5,
    abdominal: false,
    where: 'Face down along your forearm, head lower than the chest, 5 back blows between the shoulder blades. Turn them face up and give 5 chest thrusts with the heel of one hand on the breastbone. Never abdominal thrusts.',
  },
};

/**
 * Epinephrine AUTOINJECTOR weight bands — device selection, not a dose to
 * prepare. Bounds in kg per the FDA-labelled indications; the pound figures
 * are the conversions rounded to the nearest half pound.
 *  7.5–15 kg  → 0.1 mg device
 *  15–30 kg   → 0.15 mg device (EpiPen Jr and equivalents)
 *  30 kg and over → 0.3 mg device (EpiPen and equivalents)
 * A 0.5 mg device exists for larger adults in some markets and is prescribed,
 * not chosen at the moment of the reaction.
 */
export const EPI_BANDS = [
  { minKg: 0, maxKg: 7.5, mg: 0, label: 'Under 7.5 kg (16.5 lb) — no autoinjector is labelled for this weight' },
  { minKg: 7.5, maxKg: 15, mg: 0.1, label: '0.1 mg device' },
  { minKg: 15, maxKg: 30, mg: 0.15, label: '0.15 mg device (EpiPen Jr and equivalents)' },
  { minKg: 30, maxKg: 9999, mg: 0.3, label: '0.3 mg device (EpiPen and equivalents)' },
];

/** Repeat window if there is no improvement, in minutes (AAAAI / device labels). */
export const EPI_REPEAT_MIN = { from: 5, to: 15 };
/** Observation window for a biphasic reaction, in hours. */
export const EPI_OBSERVE_H = { from: 4, to: 6 };

/** The clock the chart plots: minutes since the emergency started. */
export const CLOCK = {
  max: 10,
  bands: [
    { label: 'Minute 0–1: call and start', from: 0, to: 1, tone: 'good' },
    { label: 'Minute 1–4: every minute counts', from: 1, to: 4, tone: 'warn' },
    { label: 'Minute 4–10: do not stop', from: 4, to: 10, tone: 'bad' },
  ],
};

export const hub: HubData = {
slug: 'en/health/emergency-first-aid',
  title: 'What do I do right now? Choking, CPR and anaphylaxis — call 911 first',
  description:
    'Call 911 first. Then: the 2025 AHA choking sequence for an adult, a child and an infant, the CPR compression rate, depth and ratio for each age, a way to check whether your own compressions are fast enough, and which epinephrine autoinjector strength matches a weight band.',
  silo: 'Health',
siloHref: '/en/health',
locale: 'en',

  eyebrow: 'Choking · CPR · anaphylaxis',
  h1: 'What do I do right now?',
  lede:
    'Call 911. That is the first step in every situation on this page, and nothing here replaces it — put the phone on speaker and let the dispatcher coach you while your hands work. What this page adds, once the call is made, is the part people forget under pressure: how many back blows, how deep, how fast, and how the answer changes for an infant, where the adult maneuver would cause harm.',
  stamps: [
    'Call 911 first — always',
    '2025 AHA Guidelines for CPR and ECC (October 2025)',
    'Reviewed 28-07-2026',
    '3 emergency references inside',
  ],

  resultLabel: 'Call 911, then do this',

  cases: {
    title: 'My situation is different',
    intro:
      'Pick the situation. The technique is not the same across ages, and on an infant the adult maneuver is not just less effective — it can injure them. Every branch starts with the same first step: call 911.',
    items: [
      {
        id: 'choking-adult',
        label: 'Someone over 1 is choking',
        hint: 'Back blows first, then abdominal thrusts.',
        yes: [
          CALL_911,
          'If they can cough forcefully, speak or breathe, do not touch them — encourage them to keep coughing and stay ready',
          'If the cough is weak or silent, they cannot speak, or they are turning blue: 5 back blows between the shoulder blades with the heel of your hand, leaning them forward',
          'Then 5 abdominal thrusts — fist just above the navel, well below the breastbone, pulled inward and upward',
          'Repeat 5 and 5, alternating, until the object comes out or they stop responding',
          'The moment they go unresponsive: lower them to the floor and start CPR, checking the mouth for a visible object before each set of breaths',
        ],
        warn: [
          DISCLAIMER,
          NOT_A_SUBSTITUTE,
          'The 2025 AHA update changed this sequence: it now starts with back blows, not with abdominal thrusts. Studies of adult choking found back blows cleared the airway more often and caused fewer injuries. If you were trained before October 2025, this is the part that changed.',
          'Never sweep a finger blindly into the mouth — you can push the object deeper. Only remove something you can actually see.',
          'Anyone who received abdominal thrusts needs to be checked by a clinician afterwards, even if they feel fine: the maneuver can injure abdominal organs.',
        ],
        plazo: 'a severe obstruction gives you a few minutes at most — the 911 call and the first back blow happen at the same time, not one after the other.',
        answer:
          'For an adult or a child over 1, give repeated cycles of 5 back blows followed by 5 abdominal thrusts until the object is expelled or the person stops responding — then start CPR.',
      },
      {
        id: 'choking-infant',
        label: 'A baby under 1 is choking',
        hint: 'Back blows and chest thrusts. Never abdominal.',
        yes: [
          CALL_911,
          'Lay the baby face down along your forearm, head lower than the chest, jaw supported in your hand',
          '5 back blows between the shoulder blades with the heel of your other hand',
          'Turn them face up, still supported, and give 5 chest thrusts with the heel of one hand on the breastbone',
          'Alternate 5 and 5 until the object comes out or the baby stops responding',
          'If they go unresponsive: start infant CPR and look in the mouth for a visible object before each set of breaths',
        ],
        warn: [
          DISCLAIMER,
          NOT_A_SUBSTITUTE,
          'Never give abdominal thrusts to a baby under 1. The liver and spleen sit low and largely unprotected at that age and the maneuver can rupture them. This is the single most important difference on this page.',
          'The 2025 AHA guidelines call these chest THRUSTS, not chest compressions, and recommend the heel of one hand. The rate and recoil rules of CPR do not apply here.',
          'Do not hold the baby upside down by the ankles and do not shake them.',
          'Never blind-finger-sweep an infant mouth.',
        ],
        plazo: 'an infant airway is the width of a drinking straw — call 911 and start in the same breath.',
        answer:
          'For a baby under 1, alternate 5 back blows with 5 chest thrusts, using the heel of one hand. Abdominal thrusts are never used on an infant.',
      },
      {
        id: 'cpr-adult',
        label: 'An adult is not breathing',
        hint: '100–120 a minute, 2 to 2.4 inches deep.',
        yes: [
          CALL_911,
          'Send someone for an AED while you start — do not go and get one yourself if anyone else is there',
          'Heel of one hand on the lower half of the breastbone, other hand on top, fingers interlocked, arms straight, shoulders over your hands',
          'Push at 100 to 120 compressions a minute, 2 to 2.4 inches deep, letting the chest come all the way back up between each one',
          '30 compressions, 2 breaths, repeat — or compression-only CPR if you are untrained or unwilling to give breaths, which is far better than nothing',
          'Swap whoever is compressing every 2 minutes, in under 10 seconds, because depth fades long before the person feels tired',
        ],
        warn: [
          DISCLAIMER,
          NOT_A_SUBSTITUTE,
          'Deeper is not better: past 2.4 inches you add rib and organ injury without adding blood flow. That upper limit is a real recommendation, not a caution.',
          'Cracked ribs are common and are not a reason to stop. Stopping is what kills.',
          'Only stop when the person starts to move or breathe normally, when a defibrillator tells you to stand clear, or when trained help takes over.',
          'An AED will not shock a heart that does not need it — attach it as soon as it arrives and follow its voice prompts.',
        ],
        plazo: 'survival falls steeply for every minute between collapse and the start of CPR and defibrillation — the first minute is the one that matters most.',
        answer:
          'Push hard and fast in the centre of the chest: 100 to 120 compressions a minute, 2 to 2.4 inches deep, 30 compressions to 2 breaths, swapping rescuers every 2 minutes.',
      },
      {
        id: 'cpr-child',
        label: 'A child from 1 to puberty is not breathing',
        hint: 'About 2 inches, and the ratio changes with two rescuers.',
        yes: [
          CALL_911,
          'Same rate as an adult — 100 to 120 a minute — but about 2 inches deep, and at least a third of the front-to-back depth of the chest',
          'Heel of one hand on the lower half of the breastbone; add the second hand if one is not reaching the depth',
          '30 compressions to 2 breaths if you are alone, 15 to 2 if there are two of you',
          'In children, cardiac arrest usually starts with a breathing problem, so the rescue breaths matter more than they do in adults',
          'Keep every pause under 10 seconds and swap compressors every 2 minutes',
        ],
        warn: [
          DISCLAIMER,
          NOT_A_SUBSTITUTE,
          'The 15:2 ratio only applies with two rescuers. Alone, it is 30:2 for every age.',
          'Use paediatric AED pads if the machine has them, but if it only has adult pads, use those — an adult-pad shock beats no shock.',
          '"Child" here means 1 year to puberty, not a fixed age. Signs of puberty, not a birthday, is the boundary the guidelines use.',
          'A child who has been resuscitated needs hospital assessment even if they wake up and look fine.',
        ],
        plazo: 'start within seconds of confirming they are unresponsive and not breathing normally — do not spend time on a pulse check.',
        answer:
          'For a child, compress at 100 to 120 a minute, about 2 inches or one third of chest depth, at 30:2 alone or 15:2 with two rescuers.',
      },
      {
        id: 'cpr-infant',
        label: 'A baby under 1 is not breathing',
        hint: 'About 1.5 inches, two thumbs — not two fingers.',
        yes: [
          CALL_911,
          'Two thumbs side by side on the breastbone, hands encircling the chest. If your hands cannot encircle it, use the heel of one hand',
          'Same rate: 100 to 120 compressions a minute, about 1.5 inches deep and at least a third of the chest depth',
          '30 compressions to 2 breaths alone, 15 to 2 with two rescuers',
          'Breaths are small — enough to make the chest visibly rise, no more; an infant lung holds very little air',
          'Keep pauses under 10 seconds and swap compressors every 2 minutes',
        ],
        warn: [
          DISCLAIMER,
          NOT_A_SUBSTITUTE,
          'The two-finger technique is no longer recommended as of the 2025 AHA guidelines: it reliably failed to reach the required depth. Use two thumbs encircling, or the heel of one hand.',
          'Do not tilt an infant head back as far as an adult head — over-extending the neck closes the airway rather than opening it.',
          'Blowing a full adult breath into an infant can injure the lungs. Small puffs, watching the chest.',
          'Newborn resuscitation in the first minutes of life follows a different algorithm entirely and is not covered here.',
        ],
        plazo: 'infant arrest is almost always respiratory — the breaths are not optional in this age group.',
        answer:
          'For a baby under 1, compress with two thumbs encircling the chest at 100 to 120 a minute, about 1.5 inches deep, 30:2 alone or 15:2 with two rescuers.',
      },
      {
        id: 'anaphylaxis',
        label: 'Severe allergic reaction',
        hint: 'Autoinjector by weight band. No dose is prepared here.',
        yes: [
          CALL_911,
          'Use the epinephrine autoinjector that was prescribed for this person, exactly as its label and their prescriber describe — outer mid-thigh, through clothing if you have to',
          'Lay them flat with their legs raised, unless they are vomiting or struggling to breathe, in which case let them sit up',
          'If there is no improvement, a second dose is usually given 5 to 15 minutes after the first — follow the prescriber’s written plan',
          'Go to hospital even if they recover completely: a biphasic reaction can return hours later, and observation is typically 4 to 6 hours',
          'This branch reports which autoinjector STRENGTH matches a weight band. It does not calculate a dose, and it never will',
        ],
        warn: [
          DISCLAIMER,
          NOT_A_SUBSTITUTE,
          'This hub deliberately does not give you milligrams per kilogram or millilitres to draw up. Preparing an injectable adrenaline dose from a vial is a clinical act performed under supervision, not something to work out from a web page during an emergency. Use the prescribed device.',
          'Antihistamines and inhalers do not treat anaphylaxis. They do not stop airway swelling or a falling blood pressure. Epinephrine first, always.',
          'Hesitating is the common error, not over-treating: delayed epinephrine is the factor most consistently associated with fatal outcomes.',
          'Which device someone carries is decided by their prescriber, not by a calculator — weight is one input among several, and the standard strengths are only labelled down to 7.5 kg.',
          'Never inject into a buttock, a hand or a foot, and never hold the injector with your thumb over either end.',
        ],
        plazo: 'epinephrine goes in within minutes of recognising the reaction; the 911 call happens at the same moment, not after you see whether it worked.',
        answer:
          'Use the prescribed epinephrine autoinjector into the outer thigh and call 911. By weight, the labelled strengths are 0.1 mg from 7.5 to 15 kg, 0.15 mg from 15 to 30 kg, and 0.3 mg from 30 kg up.',
      },
    ],
  },

  inputsTitle: 'Call 911 first. Then, if you have a hand free',
  inputsIntro:
    'Nothing below is a prerequisite for acting — the steps in your situation above are complete without a single number. These fields only sharpen them: check whether your compressions are actually fast enough, count what you have already given, and see which autoinjector strength a weight falls into. If you are alone with the person, ignore this and keep going.',
  fields: [
    {
      id: 'count15',
      label: 'Compressions you counted in 15 seconds',
      type: 'number',
      suffix: 'in 15 s',
      min: 0,
      max: 60,
      step: 1,
      value: 27,
      help: 'The single most useful check in CPR. Count your own compressions for 15 seconds without slowing down; 25 to 30 is the target window. Rescuers almost always drift slow.',
    },
    {
      id: 'rescuers',
      label: 'How many people can do compressions',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Just me' },
        { value: '2', label: 'Two or more of us' },
      ],
      help: 'For a child or an infant, two rescuers change the ratio from 30:2 to 15:2. For an adult it stays 30:2 either way.',
    },
    {
      id: 'cycles',
      label: 'Cycles of 5 + 5 already given',
      type: 'number',
      suffix: 'cycles',
      min: 0,
      max: 60,
      step: 1,
      value: 1,
      help: 'For choking. One cycle is 5 back blows plus 5 thrusts. There is no maximum — you keep going until the object comes out or they stop responding.',
    },
    {
      id: 'weightLb',
      label: 'Weight of the person',
      type: 'number',
      suffix: 'lb',
      min: 5,
      max: 400,
      step: 1,
      value: 55,
      help: 'Only used to say which epinephrine autoinjector strength that weight band corresponds to. An estimate is fine — the bands are wide.',
    },
    {
      id: 'minutes',
      label: 'Minutes since it started',
      type: 'number',
      suffix: 'min',
      min: 0,
      max: 60,
      step: 0.5,
      value: 2,
      help: 'Drives the clock at the top and tells you when the next rescuer swap or the second epinephrine dose is due.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'The clock, from the moment it started',
    caption:
      'The scale runs from 0 to 10 minutes and the marker is how long this has been going on. There is nothing to interpret here and no threshold to be reassured by: the only thing the clock is for is to remind you that 911 should already have been called and that compressions or thrusts should not have paused. Every band says the same thing — keep going.',
    bands: [
      { label: 'Call and start', from: 0, to: 1, tone: 'good' },
      { label: 'Every minute counts', from: 1, to: 4, tone: 'warn' },
      { label: 'Do not stop until help arrives', from: 4, to: 10, tone: 'bad' },
    ],
  },
  breakdownTitle: 'The numbers for your situation',
  breakdownIntro:
    'Rates in compressions per minute, depths in inches and centimetres, counts as plain numbers, and times in seconds or minutes — every row states its own unit. Rows that do not apply to the situation you picked are left out.',

  faq: [
    {
      q: 'Should I call 911 before or after I start?',
      a: 'Call first, or have someone else call while you start — those are the only two acceptable orders. If you are alone with an adult who has collapsed, call 911 on speaker and start compressions immediately; the dispatcher will coach you through them. If you are alone with a choking or unresponsive infant or child, the guidelines have you give about 2 minutes of care first and then call, because a child’s arrest is usually a breathing problem that immediate care can reverse. Nothing on this page is a substitute for that call.',
    },
    {
      q: 'How fast should chest compressions be?',
      a: '100 to 120 compressions a minute, for every age — adults, children and infants alike. That is a little over one and a half a second. The easiest way to check yourself mid-CPR is to count your own compressions for 15 seconds: 25 to 30 puts you inside the window. Untrained rescuers overwhelmingly go too slow, and going too fast is its own problem because the chest never refills between compressions.',
    },
    {
      q: 'How deep should compressions be?',
      a: 'For an adult, at least 2 inches (5 cm) and no more than 2.4 inches (6 cm). For a child, about 2 inches, and at least one third of the front-to-back depth of the chest. For an infant under 1, about 1.5 inches (4 cm), again at least a third of the chest depth. The upper limit for adults is a real recommendation: past 2.4 inches you add injury without adding blood flow.',
    },
    {
      q: 'Did the choking sequence change?',
      a: 'Yes, in October 2025. The AHA guidelines now start severe choking in adults and children with 5 back blows, followed by 5 abdominal thrusts, repeated in alternating sets. Previously abdominal thrusts alone were the first maneuver for adults. The change came from observational data showing back blows relieved obstructions more often and injured people less, and from the value of teaching one consistent sequence across all ages. If you learned the old sequence, back blows now come first.',
    },
    {
      q: 'What do I do if a baby under 1 is choking?',
      a: 'Alternate 5 back blows with 5 chest thrusts, and never give abdominal thrusts. Lay the baby face down along your forearm with the head lower than the chest and the jaw supported, deliver 5 back blows between the shoulder blades, then turn them face up and give 5 chest thrusts with the heel of one hand on the breastbone. Abdominal thrusts on an infant can rupture the liver or spleen, which sit low and largely unprotected at that age.',
    },
    {
      q: 'What is the compression-to-ventilation ratio?',
      a: '30 compressions to 2 breaths for an adult, whether there is one rescuer or several. For a child or an infant it is 30:2 if you are alone and 15:2 if there are two of you, because paediatric arrest is usually caused by a breathing problem and the extra ventilations matter. If you are untrained or unwilling to give breaths to an adult, compression-only CPR is explicitly recommended and is far better than doing nothing.',
    },
    {
      q: 'Is the two-finger technique still used on infants?',
      a: 'No. The 2025 AHA guidelines removed it. Registry and simulation data showed the two-finger technique almost never reached the required depth. The recommendation now is the two thumb–encircling hands technique, or the heel of one hand if your hands cannot encircle the infant’s chest — the single-hand technique actually produced greater depth in a multicentre observational study.',
    },
    {
      q: 'How often should we swap the person doing compressions?',
      a: 'Every 2 minutes, and the changeover should take under 10 seconds. Depth falls off well before the person doing it feels tired — they will tell you they are fine and their compressions will already be too shallow. The same 10-second rule applies to every other pause: rhythm checks, breaths, moving the person. Pauses are what break the blood flow you have built up.',
    },
    {
      q: 'Which epinephrine autoinjector matches which weight?',
      a: 'The labelled strengths are 0.1 mg for 7.5 to 15 kg (about 16.5 to 33 lb), 0.15 mg for 15 to 30 kg (33 to 66 lb), and 0.3 mg from 30 kg (66 lb) up; larger 0.5 mg devices exist in some markets. Those bands are the device indications, not a calculation. In practice you use the device the person was prescribed and carries, whatever this page says — the prescriber weighed more than body weight when choosing it.',
    },
    {
      q: 'Why will this page not calculate an epinephrine dose for me?',
      a: 'Because the answer would be an instruction to prepare and inject a vasopressor without supervision, and because it is not the answer anyone in an anaphylaxis emergency actually needs. What exists in the real world is fixed-strength autoinjectors with a weight threshold. Working out millilitres from an ampoule is a clinical act performed by someone who can verify the concentration in their hand. A calculator that produces that number for an anonymous visitor is producing a hazard, not a service.',
    },
    {
      q: 'Can I give a second dose of epinephrine?',
      a: 'If there is no improvement, a second dose is typically given 5 to 15 minutes after the first, and many allergy action plans instruct exactly that — which is why people are usually prescribed two devices. Follow the written plan the prescriber gave, and tell the 911 dispatcher what has already been given and when. Do not decide the interval from a web page.',
    },
    {
      q: 'Do we still need hospital care after the person recovers?',
      a: 'Yes, in all three situations. After anaphylaxis, a biphasic reaction can return hours later and observation is typically 4 to 6 hours. After abdominal thrusts, the maneuver itself can injure abdominal organs. After any resuscitation, the cause of the arrest has not been treated by the CPR. Recovering completely at the scene is not the end of it.',
    },
    {
      q: 'Should I take a CPR class if I have read this?',
      a: 'Yes, and it is the most useful thing on this page. Reading a sequence and performing it on a real body while your hands shake are different skills, and the gap between them is exactly what training closes. The American Heart Association and the Red Cross both run short in-person courses. This page is a reference for someone who has trained, and a last resort for someone who has not.',
    },
  ],

  sources: [
    {
      name: 'Part 7: Adult Basic Life Support — 2025 AHA Guidelines for CPR and ECC',
      url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001369',
      publisher: 'Circulation / American Heart Association',
      date: '2025',
    },
    {
      name: 'Part 6: Pediatric Basic Life Support — 2025 AHA and AAP Guidelines for CPR and ECC',
      url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370',
      publisher: 'Circulation / American Heart Association and American Academy of Pediatrics',
      date: '2025',
    },
    {
      name: 'Highlights of the 2025 American Heart Association Guidelines for CPR and ECC',
      url: 'https://cpr.heart.org/-/media/CPR-Files/2025-documents-for-cpr-heart-edits-posting/Resuscitation-Science/252500_Hghlghts_2025ECCGuidelines.pdf',
      publisher: 'American Heart Association',
      date: 'October 2025',
    },
    {
      name: 'Adult Basic Life Support — CPR & ECC Guidelines portal',
      url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support',
      publisher: 'American Heart Association',
    },
    {
      name: 'Updated CPR guidelines released for pediatric and neonatal emergency care',
      url: 'https://newsroom.heart.org/news/updated-cpr-guidelines-released-for-pediatric-and-neonatal-emergency-care-and-resuscitation',
      publisher: 'American Heart Association Newsroom',
      date: '22 October 2025',
    },
    {
      name: 'Anaphylaxis — condition and treatment overview',
      url: 'https://www.aaaai.org/conditions-treatments/allergies/anaphylaxis',
      publisher: 'American Academy of Allergy, Asthma & Immunology',
    },
    {
      name: 'Epinephrine auto-injector prescribing information (label search)',
      url: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=epinephrine+auto-injector',
      publisher: 'DailyMed / U.S. National Library of Medicine',
    },
    {
      name: 'International recommendations on epinephrine auto-injector doses often differ from standard weight-based guidance',
      url: 'https://link.springer.com/article/10.1186/s13223-022-00736-5',
      publisher: 'Allergy, Asthma & Clinical Immunology',
      date: '2022',
    },
    {
      name: 'Find a CPR and first-aid class',
      url: 'https://cpr.heart.org/en/course-catalog-search',
      publisher: 'American Heart Association',
    },
    {
      name: '911 — how and when to call',
      url: 'https://www.911.gov/',
      publisher: 'National 911 Program, U.S. Department of Transportation',
    },
  ],

  replaces: [
    '/en/choking-heimlich-age-maneuver',
    '/en/cpr-bls-chest-compressions-rate',
    '/en/epinephrine-dosage-weight-anaphylaxis',
  ],

lastReviewed: '2026-07-28',
};
