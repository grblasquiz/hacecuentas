// Coffee to Water Ratio Calculator
// Ratios: SCA Gold Cup Standard (https://sca.coffee/research/protocols-best-practices)

export interface Inputs {
  brew_method: string;   // 'drip' | 'french_press' | 'aeropress' | 'espresso' | 'cold_brew'
  serving_size: number;  // fl oz per serving
  cups: number;          // number of servings
  unit: string;          // 'imperial' | 'metric'
}

export interface Outputs {
  coffee_grams: number;
  water_grams: number;
  water_oz: number;
  coffee_tbsp: number;
  ratio_label: string;
  grind_recommendation: string;
  _insight?: any;
  _chart?: any;
}

// SCA-based brew ratios (1 part coffee : X parts water, by mass)
const RATIOS: Record<string, number> = {
  drip: 16,          // SCA Gold Cup center point
  french_press: 15,  // Immersion; slightly richer
  aeropress: 14,     // Short contact time
  espresso: 2,       // High-pressure extraction, 18 g dose standard
  cold_brew: 8,      // Concentrate; dilute 1:1 before drinking
};

// Grind size recommendations by method
const GRIND: Record<string, string> = {
  drip: "Medium (600–800 µm) — like coarse sand",
  french_press: "Coarse (800–1000 µm) — like raw sugar",
  aeropress: "Medium-Fine (400–600 µm) — like table salt",
  espresso: "Fine (200–400 µm) — like powdered sugar",
  cold_brew: "Coarse (800–1000 µm) — like raw sugar",
};

// Method display labels
const METHOD_LABELS: Record<string, string> = {
  drip: "Drip / Pour Over",
  french_press: "French Press",
  aeropress: "AeroPress",
  espresso: "Espresso",
  cold_brew: "Cold Brew Concentrate",
};

// 1 fl oz = 29.5735 ml; water density ≈ 1 g/ml at brew temperatures
const FL_OZ_TO_ML = 29.5735;

// Approximate weight of 1 tablespoon of ground coffee (medium grind, medium roast)
const GRAMS_PER_TBSP = 5.3;

export function compute(i: Inputs): Outputs {
  const servingOz = Number(i.serving_size) || 8;
  const cups = Math.max(1, Math.round(Number(i.cups) || 1));
  const method = i.brew_method || "drip";

  const ratio = RATIOS[method] ?? 16;
  const grind = GRIND[method] ?? "Medium";
  const methodLabel = METHOD_LABELS[method] ?? method;

  if (servingOz <= 0) {
    return {
      coffee_grams: 0,
      water_grams: 0,
      water_oz: 0,
      coffee_tbsp: 0,
      ratio_label: "Enter a valid serving size",
      grind_recommendation: grind,
    };
  }

  // Total water in grams (ml), based on serving size in fl oz
  const totalWaterG = servingOz * FL_OZ_TO_ML * cups;

  // Coffee dose in grams
  const coffeeG = totalWaterG / ratio;

  // Water in fl oz (round-trip for display)
  const waterOz = servingOz * cups;

  // Approximate tablespoons (informational only; scale is always preferred)
  const coffeeTbsp = coffeeG / GRAMS_PER_TBSP;

  // Build ratio label
  const ratioLabel = `${methodLabel} — 1:${ratio} (coffee:water by mass)`;

  // Cold brew note appended to grind recommendation
  const grindNote =
    method === "cold_brew"
      ? grind + " | Dilute concentrate 1:1 with water before drinking"
      : method === "espresso"
      ? grind + " | Standard dose: 18 g in → 36 g out at 9 bar"
      : grind;

  const coffeeR = Math.round(coffeeG * 10) / 10;
  const waterR = Math.round(totalWaterG * 10) / 10;
  const totalMass = Math.round((coffeeG + totalWaterG) * 10) / 10;
  const strength =
    ratio <= 4 ? "a very concentrated extraction" : ratio < 15 ? "a bold, full-bodied cup" : "a clean, balanced cup";

  const insight = {
    title: "Your brew",
    text: `Use **${coffeeR} g of coffee** to **${waterR} g of water** (1:${ratio}) for ${cups} serving(s) — ${strength}. Weigh your dose: **${Math.round(coffeeTbsp * 10) / 10} tbsp** is only a rough fallback.`,
    tone: "neutral",
    icon: "☕",
  };

  const chart = {
    type: "doughnut",
    slices: [
      { label: "Coffee", value: coffeeR },
      { label: "Water", value: waterR },
    ],
    prefix: "",
    centerValue: `${totalMass} g`,
    centerLabel: "total brew mass",
    ariaLabel: `Brew breakdown: ${coffeeR} g coffee and ${waterR} g water, total ${totalMass} g`,
  };

  return {
    coffee_grams: coffeeR,
    water_grams: waterR,
    water_oz: Math.round(waterOz * 10) / 10,
    coffee_tbsp: Math.round(coffeeTbsp * 10) / 10,
    ratio_label: ratioLabel,
    grind_recommendation: grindNote,
    _insight: insight,
    _chart: chart,
  };
}
