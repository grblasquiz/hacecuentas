export interface Inputs {
  age_weeks: number;
  weight_lb: number;
  feeding_type: string;
}

export interface Outputs {
  oz_per_feeding: number;
  feeds_per_day: string;
  total_oz_per_day: number;
  age_stage: string;
  notes: string;
}

// AAP/CDC 2024 age-based feeding stage data
// Source: https://www.healthychildren.org/English/ages-stages/baby/formula-feeding/Pages/How-Much-and-How-Often-to-Feed-Infant-Formula.aspx
interface Stage {
  label: string;
  minOzPerFeed: number;
  maxOzPerFeed: number;
  minFeeds: number;
  maxFeeds: number;
  solidsNote: boolean;
}

const STAGES: Stage[] = [
  // 0–4 weeks (0–1 month)
  { label: "Newborn (0–4 weeks)", minOzPerFeed: 1.5, maxOzPerFeed: 3.0, minFeeds: 8, maxFeeds: 10, solidsNote: false },
  // 4–12 weeks (1–3 months)
  { label: "1–3 Months", minOzPerFeed: 4.0, maxOzPerFeed: 5.0, minFeeds: 6, maxFeeds: 8, solidsNote: false },
  // 12–26 weeks (3–6 months)
  { label: "3–6 Months", minOzPerFeed: 6.0, maxOzPerFeed: 7.0, minFeeds: 5, maxFeeds: 6, solidsNote: false },
  // 26–52 weeks (6–12 months)
  { label: "6–12 Months", minOzPerFeed: 7.0, maxOzPerFeed: 8.0, minFeeds: 4, maxFeeds: 5, solidsNote: true },
];

// AAP weight-based rule: 2.5 oz per lb of body weight per day
const OZ_PER_LB_PER_DAY = 2.5;
// AAP daily maximum regardless of weight
const MAX_OZ_PER_DAY = 32;

function getStage(ageWeeks: number): Stage {
  if (ageWeeks < 4) return STAGES[0];
  if (ageWeeks < 12) return STAGES[1];
  if (ageWeeks < 26) return STAGES[2];
  return STAGES[3];
}

export function compute(i: Inputs): Outputs {
  const ageWeeks = Math.max(0, Math.round(Number(i.age_weeks) || 0));
  const weightLb = Number(i.weight_lb) || 0;
  const feedingType = i.feeding_type || "formula";

  if (weightLb <= 0) {
    return {
      oz_per_feeding: 0,
      feeds_per_day: "—",
      total_oz_per_day: 0,
      age_stage: "—",
      notes: "Please enter your baby's weight to get a recommendation.",
    };
  }

  if (ageWeeks > 52) {
    return {
      oz_per_feeding: 0,
      feeds_per_day: "—",
      total_oz_per_day: 0,
      age_stage: "Over 12 months",
      notes: "This calculator covers 0–12 months. For toddlers over 1 year, whole cow's milk (up to 16–24 oz/day) is typically recommended. Consult your pediatrician.",
    };
  }

  const stage = getStage(ageWeeks);

  // Weight-based daily total, capped at MAX_OZ_PER_DAY
  const weightBasedDaily = Math.min(OZ_PER_LB_PER_DAY * weightLb, MAX_OZ_PER_DAY);

  // Stage-based daily ceiling (max oz/feed × max feeds)
  const stageBasedCeiling = stage.maxOzPerFeed * stage.maxFeeds;

  // Use the lower of the two as the working daily total
  const totalOzPerDay = Math.min(weightBasedDaily, stageBasedCeiling);

  // Mid-point of recommended feeds per day for this stage
  const midFeeds = (stage.minFeeds + stage.maxFeeds) / 2;

  // Oz per feeding
  const ozPerFeeding = totalOzPerDay / midFeeds;

  // Feeds per day display string
  const feedsDisplay = `${stage.minFeeds}–${stage.maxFeeds} feeds/day`;

  // Build notes
  let notes = "";

  if (feedingType === "breastmilk") {
    notes = "Volume guidelines are the same for expressed breastmilk. If nursing directly, track wet diapers (≥6/day after day 5) and weight gain rather than oz consumed."
  } else if (feedingType === "combo") {
    notes = "For combination feeding, the total daily volume applies across both formula and expressed breastmilk combined."
  } else {
    notes = "These are estimates. Always follow your baby's hunger and fullness cues, and consult your pediatrician if you have concerns about intake or weight gain."
  }

  if (stage.solidsNote) {
    notes += " From 6 months, gradually introduce single-ingredient solids — liquid intake will decrease as solid food intake increases."
  }

  if (weightBasedDaily >= MAX_OZ_PER_DAY) {
    notes += " Daily total has been capped at 32 oz per AAP guidelines."
  }

  return {
    oz_per_feeding: Math.round(ozPerFeeding * 10) / 10,
    feeds_per_day: feedsDisplay,
    total_oz_per_day: Math.round(totalOzPerDay * 10) / 10,
    age_stage: stage.label,
    notes: notes.trim(),
  };
}
