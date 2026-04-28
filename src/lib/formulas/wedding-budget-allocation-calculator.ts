export interface Inputs {
  total_budget: number;
  guest_count: number;
  region: string;
  include_contingency: string;
}

export interface Outputs {
  spendable_budget: number;
  contingency_amount: number;
  venue: number;
  catering: number;
  photo_video: number;
  flowers_decor: number;
  music: number;
  attire: number;
  stationery_misc: number;
  per_guest_cost: number;
  regional_benchmark: string;
  budget_vs_benchmark: string;
}

// Allocation percentages — industry standard (The Knot / WeddingWire 2026)
const VENUE_PCT = 0.40;
const CATERING_PCT = 0.28;
const PHOTO_VIDEO_PCT = 0.12;
const FLOWERS_DECOR_PCT = 0.08;
const MUSIC_PCT = 0.07;
const ATTIRE_PCT = 0.05;
// Remainder (~0%) goes to stationery/misc; sum of above = 1.00

// Contingency reserve rate — recommended 10%
const CONTINGENCY_RATE = 0.10;

// Regional average benchmarks in USD (2026)
const REGIONAL_BENCHMARKS: Record<string, { avg: number; label: string }> = {
  national:  { avg: 35000, label: "US National Average: $35,000" },
  urban:     { avg: 52000, label: "Urban / Major Metro Average: $52,000" },
  suburban:  { avg: 28000, label: "Suburban / Mid-size City Average: $28,000" },
  rural:     { avg: 18000, label: "Rural / Small Town Average: $18,000" },
};

function formatCurrency(value: number): string {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function compute(i: Inputs): Outputs {
  const totalBudget = Number(i.total_budget) || 0;
  const guestCount = Number(i.guest_count) || 1;
  const region = i.region || "national";
  const includeContingency = i.include_contingency === "yes";

  if (totalBudget <= 0) {
    return {
      spendable_budget: 0,
      contingency_amount: 0,
      venue: 0,
      catering: 0,
      photo_video: 0,
      flowers_decor: 0,
      music: 0,
      attire: 0,
      stationery_misc: 0,
      per_guest_cost: 0,
      regional_benchmark: "Enter a valid budget to see the regional benchmark.",
      budget_vs_benchmark: "—",
    };
  }

  // Step 1: Compute contingency and spendable budget
  const contingencyAmount = includeContingency
    ? Math.round(totalBudget * CONTINGENCY_RATE)
    : 0;
  const spendableBudget = totalBudget - contingencyAmount;

  // Step 2: Allocate by category
  const venue        = Math.round(spendableBudget * VENUE_PCT);
  const catering     = Math.round(spendableBudget * CATERING_PCT);
  const photoVideo   = Math.round(spendableBudget * PHOTO_VIDEO_PCT);
  const flowersDecor = Math.round(spendableBudget * FLOWERS_DECOR_PCT);
  const music        = Math.round(spendableBudget * MUSIC_PCT);
  const attire       = Math.round(spendableBudget * ATTIRE_PCT);

  // Remainder to avoid rounding drift
  const allocatedSum = venue + catering + photoVideo + flowersDecor + music + attire;
  const stationeryMisc = Math.max(0, spendableBudget - allocatedSum);

  // Step 3: Per-guest cost
  const safeGuests = guestCount > 0 ? guestCount : 1;
  const perGuestCost = Math.round(totalBudget / safeGuests);

  // Step 4: Regional benchmark comparison
  const benchmarkData = REGIONAL_BENCHMARKS[region] ?? REGIONAL_BENCHMARKS["national"];
  const benchmarkAvg = benchmarkData.avg;
  const benchmarkLabel = benchmarkData.label;

  const diff = totalBudget - benchmarkAvg;
  let budgetVsBenchmark: string;
  if (Math.abs(diff) < 1000) {
    budgetVsBenchmark = `Your budget is right at the regional average (${formatCurrency(benchmarkAvg)}).`;
  } else if (diff > 0) {
    budgetVsBenchmark = `Your budget is ${formatCurrency(diff)} above the regional average (${formatCurrency(benchmarkAvg)}) — you have extra flexibility.`;
  } else {
    budgetVsBenchmark = `Your budget is ${formatCurrency(Math.abs(diff))} below the regional average (${formatCurrency(benchmarkAvg)}) — expect trade-offs in venue or catering.`;
  }

  return {
    spendable_budget: spendableBudget,
    contingency_amount: contingencyAmount,
    venue,
    catering,
    photo_video: photoVideo,
    flowers_decor: flowersDecor,
    music,
    attire,
    stationery_misc: stationeryMisc,
    per_guest_cost: perGuestCost,
    regional_benchmark: benchmarkLabel,
    budget_vs_benchmark: budgetVsBenchmark,
  };
}
