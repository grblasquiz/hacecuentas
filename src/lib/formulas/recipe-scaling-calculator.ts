export interface Inputs {
  original_servings: number;
  desired_servings: number;
  ing1_amount: number;
  ing1_unit: string;
  ing1_label: string;
  ing2_amount: number;
  ing2_unit: string;
  ing2_label: string;
  ing3_amount: number;
  ing3_unit: string;
  ing3_label: string;
  ing4_amount: number;
  ing4_unit: string;
  ing4_label: string;
  ing5_amount: number;
  ing5_unit: string;
  ing5_label: string;
}

export interface Outputs {
  scale_factor: number;
  ing1_scaled: string;
  ing2_scaled: string;
  ing3_scaled: string;
  ing4_scaled: string;
  ing5_scaled: string;
  baking_warning: string;
}

// Unit conversion constants — fixed physical standards (NIST HB44)
const CUP_TO_TBSP = 16;   // 1 cup = 16 tablespoons
const TBSP_TO_TSP = 3;    // 1 tablespoon = 3 teaspoons
const OZ_TO_LB = 16;      // 16 oz = 1 lb
const G_TO_KG = 1000;     // 1000 g = 1 kg
const ML_TO_L = 1000;     // 1000 ml = 1 L

// Leavening scale cap: professional baking guidance caps leavening increase
// at ~75-80% of linear amount for large scale-ups (King Arthur Baking)
const LEAVENING_CAP_FACTOR = 0.78;

function formatNumber(val: number): string {
  if (val === 0) return "0";
  // Show up to 2 decimal places, strip trailing zeros
  const fixed = val.toFixed(2);
  return parseFloat(fixed).toString();
}

function scaleAmount(
  originalAmount: number,
  unit: string,
  ingredientType: string,
  scaleFactor: number
): string {
  if (originalAmount <= 0) return "—";

  let scaled = originalAmount * scaleFactor;

  // Special handling for eggs: round to nearest whole
  if (ingredientType === "egg" || unit === "whole") {
    const rounded = Math.round(scaled);
    if (ingredientType === "egg") {
      const note = scaled !== rounded ? " (rounded)" : "";
      return `${rounded} whole${note}`;
    }
    return `${rounded} whole`;
  }

  // Special handling for leavening: cap at LEAVENING_CAP_FACTOR when scaling up > 1.5x
  if (ingredientType === "leavening" && scaleFactor > 1.5) {
    // Apply leavening adjustment: use linear up to 1.5x, then cap growth
    const linearScaled = originalAmount * scaleFactor;
    const cappedScaled = originalAmount + (linearScaled - originalAmount) * LEAVENING_CAP_FACTOR;
    scaled = cappedScaled;
  }

  // Smart unit conversion
  switch (unit) {
    case "cup": {
      if (scaled < 0.25) {
        // Convert cups to tablespoons
        const tbsp = scaled * CUP_TO_TBSP;
        if (tbsp < 1) {
          // Convert tablespoons to teaspoons
          const tsp = tbsp * TBSP_TO_TSP;
          return `${formatNumber(tsp)} tsp`;
        }
        return `${formatNumber(tbsp)} tbsp`;
      }
      return `${formatNumber(scaled)} cup${scaled !== 1 ? "s" : ""}`;
    }
    case "tbsp": {
      if (scaled < 1) {
        const tsp = scaled * TBSP_TO_TSP;
        return `${formatNumber(tsp)} tsp`;
      }
      if (scaled >= CUP_TO_TBSP) {
        const cups = scaled / CUP_TO_TBSP;
        return `${formatNumber(cups)} cup${cups !== 1 ? "s" : ""}`;
      }
      return `${formatNumber(scaled)} tbsp`;
    }
    case "tsp": {
      if (scaled >= TBSP_TO_TSP * CUP_TO_TBSP) {
        const cups = scaled / (TBSP_TO_TSP * CUP_TO_TBSP);
        return `${formatNumber(cups)} cup${cups !== 1 ? "s" : ""}`;
      }
      if (scaled >= TBSP_TO_TSP) {
        const tbsp = scaled / TBSP_TO_TSP;
        return `${formatNumber(tbsp)} tbsp`;
      }
      return `${formatNumber(scaled)} tsp`;
    }
    case "oz": {
      if (scaled >= OZ_TO_LB) {
        const lb = scaled / OZ_TO_LB;
        return `${formatNumber(lb)} lb`;
      }
      return `${formatNumber(scaled)} oz`;
    }
    case "lb": {
      if (scaled < (1 / OZ_TO_LB)) {
        const oz = scaled * OZ_TO_LB;
        return `${formatNumber(oz)} oz`;
      }
      return `${formatNumber(scaled)} lb`;
    }
    case "g": {
      if (scaled >= G_TO_KG) {
        const kg = scaled / G_TO_KG;
        return `${formatNumber(kg)} kg`;
      }
      return `${formatNumber(scaled)} g`;
    }
    case "kg": {
      if (scaled < 0.001) {
        const g = scaled * G_TO_KG;
        return `${formatNumber(g)} g`;
      }
      return `${formatNumber(scaled)} kg`;
    }
    case "ml": {
      if (scaled >= ML_TO_L) {
        const l = scaled / ML_TO_L;
        return `${formatNumber(l)} L`;
      }
      return `${formatNumber(scaled)} ml`;
    }
    case "l": {
      if (scaled < 0.001) {
        const ml = scaled * ML_TO_L;
        return `${formatNumber(ml)} ml`;
      }
      return `${formatNumber(scaled)} L`;
    }
    default:
      return `${formatNumber(scaled)} ${unit}`;
  }
}

export function compute(i: Inputs): Outputs {
  const originalServings = Number(i.original_servings) || 0;
  const desiredServings = Number(i.desired_servings) || 0;

  const defaultOut: Outputs = {
    scale_factor: 0,
    ing1_scaled: "Enter valid serving counts",
    ing2_scaled: "—",
    ing3_scaled: "—",
    ing4_scaled: "—",
    ing5_scaled: "—",
    baking_warning: ""
  };

  if (originalServings <= 0 || desiredServings <= 0) {
    return defaultOut;
  }

  const scaleFactor = desiredServings / originalServings;

  // Scale each ingredient
  const ing1_amount = Number(i.ing1_amount) || 0;
  const ing2_amount = Number(i.ing2_amount) || 0;
  const ing3_amount = Number(i.ing3_amount) || 0;
  const ing4_amount = Number(i.ing4_amount) || 0;
  const ing5_amount = Number(i.ing5_amount) || 0;

  const ing1_scaled = ing1_amount > 0
    ? scaleAmount(ing1_amount, i.ing1_unit || "cup", i.ing1_label || "generic", scaleFactor)
    : "—";
  const ing2_scaled = ing2_amount > 0
    ? scaleAmount(ing2_amount, i.ing2_unit || "cup", i.ing2_label || "generic", scaleFactor)
    : "—";
  const ing3_scaled = ing3_amount > 0
    ? scaleAmount(ing3_amount, i.ing3_unit || "cup", i.ing3_label || "generic", scaleFactor)
    : "—";
  const ing4_scaled = ing4_amount > 0
    ? scaleAmount(ing4_amount, i.ing4_unit || "cup", i.ing4_label || "generic", scaleFactor)
    : "—";
  const ing5_scaled = ing5_amount > 0
    ? scaleAmount(ing5_amount, i.ing5_unit || "cup", i.ing5_label || "generic", scaleFactor)
    : "—";

  // Build baking warnings
  const warnings: string[] = [];

  const allLabels = [
    i.ing1_label, i.ing2_label, i.ing3_label, i.ing4_label, i.ing5_label
  ];
  const hasLeavening = allLabels.some(l => l === "leavening");
  const hasEgg = allLabels.some(l => l === "egg");

  if (hasLeavening && scaleFactor > 1.5) {
    warnings.push(
      `Leavening adjusted to ~${(LEAVENING_CAP_FACTOR * 100).toFixed(0)}% of linear scaling (scale factor ${formatNumber(scaleFactor)}×). Excess leavening causes bitter taste or collapse.`
    );
  }
  if (hasEgg) {
    warnings.push("Egg amounts rounded to nearest whole unit. For fractions, beat one egg (~3 tbsp) and measure by volume.");
  }
  if (scaleFactor > 1) {
    warnings.push("Cooking time may increase 10–25% for larger batches. Verify doneness by temperature or visual cues, not time alone.");
  }
  if (scaleFactor < 1) {
    warnings.push("For small batches, measure leavening and spices by weight for accuracy — small volume measurements lose precision below ¼ tsp.");
  }

  const baking_warning = warnings.length > 0 ? warnings.join(" | ") : "No special notes.";

  return {
    scale_factor: parseFloat(formatNumber(scaleFactor)),
    ing1_scaled,
    ing2_scaled,
    ing3_scaled,
    ing4_scaled,
    ing5_scaled,
    baking_warning
  };
}
