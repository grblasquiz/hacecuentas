export interface Inputs {
  distance: number;
  distance_unit: string;
  sex: string;
  age: number;
}

export interface Outputs {
  vo2max: number;
  fitness_category: string;
  distance_meters: number;
  interpretation: string;
  _chart?: any;
  _insight?: any;
}

// Cooper (1968) regression coefficients — JAMA 203(3):201-204
const COOPER_INTERCEPT = 504.9;
const COOPER_DIVISOR = 44.73;

// Meters per mile (exact)
const METERS_PER_MILE = 1609.344;
const METERS_PER_KM = 1000;

// Cooper Institute fitness norms (2013 edition)
// Structure: [ageMin, ageMax, [veryPoorMax, poorMax, fairMax, goodMax, excellentMax]]
// Values are UPPER BOUNDS for each category (Superior = above excellentMax)
const NORMS_MALE: Array<[number, number, [number, number, number, number, number]]> = [
  [20, 29, [32.9, 36.4, 42.4, 46.4, 52.4]],
  [30, 39, [31.4, 35.4, 40.9, 44.9, 49.4]],
  [40, 49, [30.1, 33.5, 38.9, 43.7, 48.0]],
  [50, 59, [26.0, 30.9, 35.7, 40.9, 45.3]],
  [60, 99, [20.4, 26.0, 32.2, 36.4, 44.2]],
];

const NORMS_FEMALE: Array<[number, number, [number, number, number, number, number]]> = [
  [20, 29, [27.9, 31.4, 35.6, 38.9, 43.9]],
  [30, 39, [26.9, 30.4, 33.7, 36.9, 41.0]],
  [40, 49, [24.9, 28.9, 31.9, 35.1, 38.9]],
  [50, 59, [20.9, 23.9, 27.9, 31.4, 35.7]],
  [60, 99, [19.9, 22.9, 25.9, 29.4, 32.4]],
];

const CATEGORY_LABELS = [
  "Very Poor",
  "Poor",
  "Fair",
  "Good",
  "Excellent",
  "Superior",
];

const CATEGORY_INTERPRETATIONS: Record<string, string> = {
  "Very Poor": "Your aerobic fitness is significantly below average for your age and sex. Consistent low-intensity cardio training (3–5 days/week) will produce rapid improvements from this baseline.",
  "Poor": "Your aerobic fitness is below average. Structured endurance training 3–4 days per week should move you into the Fair range within 8–12 weeks.",
  "Fair": "Your aerobic fitness is average for your demographic. You have a solid base; progressive training can push you into the Good range.",
  "Good": "Your aerobic fitness is above average. You are likely meeting current physical activity guidelines and have a good cardiovascular risk profile.",
  "Excellent": "Your aerobic fitness is well above average. This level is associated with significantly reduced risk of cardiovascular disease and all-cause mortality.",
  "Superior": "Your aerobic fitness is in the top tier for your age and sex. This level is typically seen in competitive endurance athletes and confers substantial health benefits.",
  "N/A": "Fitness norms are available for ages 20–69. Use this result directionally.",
};

function toMeters(distance: number, unit: string): number {
  if (unit === "miles") return distance * METERS_PER_MILE;
  if (unit === "km") return distance * METERS_PER_KM;
  return distance; // already meters
}

function getFitnessCategory(
  vo2max: number,
  sex: string,
  age: number
): string {
  const norms = sex === "female" ? NORMS_FEMALE : NORMS_MALE;
  const row = norms.find(([ageMin, ageMax]) => age >= ageMin && age <= ageMax);
  if (!row) return "N/A";
  const thresholds = row[2];
  for (let i = 0; i < thresholds.length; i++) {
    if (vo2max <= thresholds[i]) return CATEGORY_LABELS[i];
  }
  return CATEGORY_LABELS[5]; // Superior
}

export function compute(i: Inputs): Outputs {
  const distance = Number(i.distance) || 0;
  const distanceUnit = i.distance_unit || "miles";
  const sex = i.sex || "male";
  const age = Math.round(Number(i.age) || 0);

  if (distance <= 0) {
    return {
      vo2max: 0,
      fitness_category: "Enter a valid distance",
      distance_meters: 0,
      interpretation: "Please enter a positive distance value to calculate your VO2 max.",
    };
  }

  if (age < 10 || age > 120) {
    return {
      vo2max: 0,
      fitness_category: "Enter a valid age",
      distance_meters: 0,
      interpretation: "Please enter an age between 10 and 120.",
    };
  }

  const distMeters = toMeters(distance, distanceUnit);

  // Cooper (1968) formula
  const vo2maxRaw = (distMeters - COOPER_INTERCEPT) / COOPER_DIVISOR;

  // Clamp to physiologically plausible range (5–90 ml/kg/min)
  const vo2max = Math.min(90, Math.max(5, vo2maxRaw));
  const vo2maxRounded = Math.round(vo2max * 10) / 10;

  const category = getFitnessCategory(vo2maxRounded, sex, age);
  const interpretation =
    CATEGORY_INTERPRETATIONS[category] ||
    CATEGORY_INTERPRETATIONS["N/A"];

  // Gauge chart from the Cooper Institute thresholds for this age/sex band
  const norms = sex === "female" ? NORMS_FEMALE : NORMS_MALE;
  const row = norms.find(([ageMin, ageMax]) => age >= ageMin && age <= ageMax);
  let chart: any = undefined;
  if (row) {
    const t = row[2]; // [veryPoorMax, poorMax, fairMax, goodMax, excellentMax]
    const topChart = Math.max(t[4] + 8, Math.ceil(vo2maxRounded) + 4);
    chart = {
      type: "scale",
      marker: vo2maxRounded,
      markerLabel: "Your VO2max: " + vo2maxRounded.toFixed(1),
      min: Math.max(0, Math.min(Math.floor(t[0]) - 5, Math.floor(vo2maxRounded) - 3)),
      unit: "",
      segments: [
        { nombre: "Very Poor", max: t[0], color: "#fecaca", colorDark: "#b91c1c" },
        { nombre: "Poor", max: t[1], color: "#fed7aa", colorDark: "#9a3412" },
        { nombre: "Fair", max: t[2], color: "#fde68a", colorDark: "#b45309" },
        { nombre: "Good", max: t[3], color: "#d9f99d", colorDark: "#3f6212" },
        { nombre: "Excellent", max: t[4], color: "#bbf7d0", colorDark: "#166534" },
        { nombre: "Superior", max: topChart, color: "#a7f3d0", colorDark: "#047857" },
      ],
      ariaLabel: "VO2max scale based on Cooper Institute norms for your age and sex",
    };
  }

  const tone = (category === "Superior" || category === "Excellent") ? "good"
    : (category === "Very Poor" || category === "Poor") ? "warn" : "neutral";
  const insight = {
    title: "Your aerobic capacity",
    text: `You covered **${Math.round(distMeters)} m** in 12 minutes, which estimates a **VO2max of ${vo2maxRounded.toFixed(1)} ml/kg/min**. For a ${sex === "female" ? "woman" : "man"} aged ${age}, that places you in the **${category}** range.`,
    tone,
    icon: "🫁",
  };

  return {
    vo2max: vo2maxRounded,
    fitness_category: category,
    distance_meters: Math.round(distMeters),
    interpretation,
    _chart: chart,
    _insight: insight,
  };
}
