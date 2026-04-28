export interface Inputs {
  guests: number;
  meal_type: string;
  meal_tier: string;
  bar_service: string;
  gratuity_pct: number;
  tax_pct: number;
}

export interface Outputs {
  total_cost: number;
  cost_per_head: number;
  food_subtotal: number;
  bar_subtotal: number;
  gratuity_amount: number;
  tax_amount: number;
  breakdown_note: string;
}

// 2026 US average catering rates per head (USD)
// Source: National Restaurant Association / BLS CPI Food Away from Home 2026
const MEAL_RATES: Record<string, { low: number; mid: number; high: number }> = {
  buffet:       { low: 30, mid: 40,  high: 50  },
  plated:       { low: 60, mid: 90,  high: 120 },
  family_style: { low: 40, mid: 60,  high: 80  },
  food_truck:   { low: 20, mid: 27,  high: 35  },
};

// 2026 US average bar rates per head (USD) for a standard 3-hour reception
const BAR_RATES: Record<string, number> = {
  none:      0,
  beer_wine: 15,
  open_bar:  25,
};

export function compute(i: Inputs): Outputs {
  const guests = Math.max(0, Math.round(Number(i.guests) || 0));
  const meal_type = String(i.meal_type || "buffet");
  const meal_tier = String(i.meal_tier || "mid") as "low" | "mid" | "high";
  const bar_service = String(i.bar_service || "none");
  const gratuity_pct = Math.max(0, Number(i.gratuity_pct) || 0);
  const tax_pct = Math.max(0, Number(i.tax_pct) || 0);

  if (guests <= 0) {
    return {
      total_cost: 0,
      cost_per_head: 0,
      food_subtotal: 0,
      bar_subtotal: 0,
      gratuity_amount: 0,
      tax_amount: 0,
      breakdown_note: "Enter a valid number of guests to see your estimate.",
    };
  }

  // Resolve meal rate
  const mealRateMap = MEAL_RATES[meal_type] ?? MEAL_RATES["buffet"];
  const tierKey = (["low", "mid", "high"].includes(meal_tier) ? meal_tier : "mid") as "low" | "mid" | "high";
  const mealRatePerHead: number = mealRateMap[tierKey];

  // Resolve bar rate
  const barRatePerHead: number = BAR_RATES[bar_service] ?? 0;

  // Subtotals
  const food_subtotal = guests * mealRatePerHead;
  const bar_subtotal = guests * barRatePerHead;
  const pretax_total = food_subtotal + bar_subtotal;

  // Gratuity and tax applied to pre-tax total
  // Note: taxability of gratuity varies by state — this model taxes only food+bar subtotal
  const gratuity_amount = pretax_total * (gratuity_pct / 100);
  const tax_amount = pretax_total * (tax_pct / 100);

  const total_cost = pretax_total + gratuity_amount + tax_amount;
  const cost_per_head = total_cost / guests;

  // Build human-readable breakdown note
  const mealLabels: Record<string, string> = {
    buffet: "Buffet",
    plated: "Plated",
    family_style: "Family Style",
    food_truck: "Food Truck",
  };
  const barLabels: Record<string, string> = {
    none: "no bar",
    beer_wine: "beer & wine bar",
    open_bar: "open bar (3 hrs)",
  };
  const tierLabels: Record<string, string> = { low: "budget", mid: "mid-range", high: "premium" };

  const mealLabel = mealLabels[meal_type] ?? meal_type;
  const barLabel = barLabels[bar_service] ?? bar_service;
  const tierLabel = tierLabels[tierKey] ?? tierKey;

  const breakdown_note =
    `${guests} guests · ${mealLabel} (${tierLabel}, $${mealRatePerHead}/head) · ${barLabel}` +
    (barRatePerHead > 0 ? ` ($${barRatePerHead}/head)` : "") +
    ` · ${gratuity_pct.toFixed(1)}% gratuity ($${gratuity_amount.toFixed(2)})` +
    ` · ${tax_pct.toFixed(1)}% tax ($${tax_amount.toFixed(2)})`;

  return {
    total_cost,
    cost_per_head,
    food_subtotal,
    bar_subtotal,
    gratuity_amount,
    tax_amount,
    breakdown_note,
  };
}
