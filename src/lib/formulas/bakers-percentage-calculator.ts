export interface Inputs {
  input_mode: string;   // 'flour' | 'dough'
  base_weight: number;  // grams of flour OR target dough weight
  hydration: number;    // percent, e.g. 70 = 70%
  salt_pct: number;     // percent of flour
  yeast_pct: number;    // percent of flour (instant yeast)
  other_pct: number;    // percent of flour (combined extras)
}

export interface Outputs {
  flour_g: number;
  water_g: number;
  salt_g: number;
  yeast_g: number;
  other_g: number;
  total_dough_g: number;
  hydration_class: string;
  formula_summary: string;
  _insight?: any;
  _chart?: any;
}

// Hydration class thresholds — based on standard baker's classification
const HYDRATION_CLASSES: Array<{ min: number; max: number; label: string }> = [
  { min: 0,  max: 59.99, label: "Lean / Stiff (< 60%)" },
  { min: 60, max: 69.99, label: "Standard (60–69%)" },
  { min: 70, max: 79.99, label: "Moderate / Artisan (70–79%)" },
  { min: 80, max: 89.99, label: "Wet / High-Hydration (80–89%)" },
  { min: 90, max: Infinity, label: "Slack / Extreme (≥ 90%)" },
];

function getHydrationClass(hydration: number): string {
  for (const cls of HYDRATION_CLASSES) {
    if (hydration >= cls.min && hydration <= cls.max) {
      return cls.label;
    }
  }
  return "Unknown";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  const mode       = i.input_mode || "flour";
  const baseWeight = Number(i.base_weight) || 0;
  const hydration  = Number(i.hydration)   || 0;
  const saltPct    = Number(i.salt_pct)    || 0;
  const yeastPct   = Number(i.yeast_pct)   || 0;
  const otherPct   = Number(i.other_pct)   || 0;

  // Guard: base weight must be positive
  if (baseWeight <= 0) {
    return {
      flour_g: 0,
      water_g: 0,
      salt_g: 0,
      yeast_g: 0,
      other_g: 0,
      total_dough_g: 0,
      hydration_class: "Enter a valid weight to see the hydration class.",
      formula_summary: "Please enter a weight greater than zero.",
    };
  }

  // Guard: hydration must be positive
  if (hydration <= 0) {
    return {
      flour_g: 0,
      water_g: 0,
      salt_g: 0,
      yeast_g: 0,
      other_g: 0,
      total_dough_g: 0,
      hydration_class: "Enter a hydration percentage.",
      formula_summary: "Please enter a hydration percentage greater than zero.",
    };
  }

  let flourG: number;

  if (mode === "dough") {
    // Derive flour from target total dough weight
    // Total = Flour × (1 + hydration/100 + salt/100 + yeast/100 + other/100)
    // => Flour = Total ÷ divisor
    const divisor = 1 + (hydration + saltPct + yeastPct + otherPct) / 100;
    if (divisor <= 0) {
      return {
        flour_g: 0,
        water_g: 0,
        salt_g: 0,
        yeast_g: 0,
        other_g: 0,
        total_dough_g: 0,
        hydration_class: "Invalid percentages.",
        formula_summary: "The sum of percentages produced an invalid divisor.",
      };
    }
    flourG = baseWeight / divisor;
  } else {
    // mode === 'flour'
    flourG = baseWeight;
  }

  const waterG = flourG * (hydration / 100);
  const saltG  = flourG * (saltPct  / 100);
  const yeastG = flourG * (yeastPct / 100);
  const otherG = flourG * (otherPct / 100);
  const totalG = flourG + waterG + saltG + yeastG + otherG;

  const hydrationClass = getHydrationClass(hydration);

  // Total baker's % (flour=100 + others)
  const totalBakerPct = 100 + hydration + saltPct + yeastPct + otherPct;

  const formulaSummary =
    `Flour: ${round2(flourG)} g (100%) | ` +
    `Water: ${round2(waterG)} g (${hydration}%) | ` +
    `Salt: ${round2(saltG)} g (${saltPct}%) | ` +
    `Yeast: ${round2(yeastG)} g (${yeastPct}%)` +
    (otherPct > 0 ? ` | Other: ${round2(otherG)} g (${otherPct}%)` : "") +
    ` | Total baker's %: ${totalBakerPct.toFixed(1)}%`;

  // Insight: dynamic tone based on how challenging the hydration is to handle
  let insightTone: "good" | "warn" | "neutral";
  let insightText: string;
  if (hydration >= 80) {
    insightTone = "warn";
    insightText =
      `At **${hydration}% hydration** this is a wet, slack dough (**${hydrationClass}**) — sticky and hard to shape by hand. ` +
      `For **${round2(flourG)} g of flour** you add **${round2(waterG)} g of water**, yielding **${round2(totalG)} g** of total dough. Use wet hands or a dough scraper.`;
  } else if (hydration < 60) {
    insightTone = "neutral";
    insightText =
      `At **${hydration}% hydration** this is a stiff, low-water dough (**${hydrationClass}**) — easy to knead but denser crumb. ` +
      `**${round2(flourG)} g of flour** + **${round2(waterG)} g of water** give **${round2(totalG)} g** of total dough.`;
  } else {
    insightTone = "good";
    insightText =
      `At **${hydration}% hydration** the dough sits in a workable, forgiving range (**${hydrationClass}**). ` +
      `**${round2(flourG)} g of flour** + **${round2(waterG)} g of water** make **${round2(totalG)} g** of total dough — a solid all-purpose ratio.`;
  }

  const _insight = {
    title: "Reading your formula",
    text: insightText,
    tone: insightTone,
    icon: "🍞",
  };

  // Donut: total dough broken into its weighed ingredients (slices sum to total)
  const slices = [
    { label: "Flour", value: round2(flourG) },
    { label: "Water", value: round2(waterG) },
    { label: "Salt", value: round2(saltG) },
    { label: "Yeast", value: round2(yeastG) },
  ];
  if (otherG > 0) slices.push({ label: "Other", value: round2(otherG) });

  const _chart = {
    type: "doughnut",
    slices,
    prefix: "",
    centerValue: `${round2(totalG)} g`,
    centerLabel: "Total dough",
    ariaLabel: `Dough composition by weight: flour ${round2(flourG)} g, water ${round2(waterG)} g, salt ${round2(saltG)} g, yeast ${round2(yeastG)} g${otherG > 0 ? `, other ${round2(otherG)} g` : ""}, totaling ${round2(totalG)} g.`,
  };

  return {
    flour_g:       round2(flourG),
    water_g:       round2(waterG),
    salt_g:        round2(saltG),
    yeast_g:       round2(yeastG),
    other_g:       round2(otherG),
    total_dough_g: round2(totalG),
    hydration_class: hydrationClass,
    formula_summary: formulaSummary,
    _insight,
    _chart,
  };
}
