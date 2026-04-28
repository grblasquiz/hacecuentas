export interface Inputs {
  bill_amount: number;
  state: string;
  service: string;
  party_size: number;
}

export interface Outputs {
  tip_amount: number;
  total_bill: number;
  per_person: number;
  tip_rate_applied: number;
  auto_grat_notice: string;
  state_norm_info: string;
}

// State tipping norms (2026) based on Toast, Square, and Bankrate survey data
const STATE_NORM_MAP: Record<string, number> = {
  NY: 0.20,   // New York — high-cost metro, 20% norm
  CA: 0.20,   // California — high-cost metro, 20% norm
  MA: 0.20,   // Massachusetts — high-cost metro, 20% norm
  IL: 0.18,   // Illinois (Chicago market drives norm up)
  FL: 0.18,   // Florida (tourist-heavy dining scene)
  WA: 0.18,   // Washington (Seattle market)
  CO: 0.18,   // Colorado (Denver/Boulder market)
  NV: 0.18,   // Nevada (Las Vegas hospitality culture)
  AZ: 0.18,   // Arizona
  OR: 0.18,   // Oregon (Portland market)
  TX: 0.15,   // Texas — lower regional norm
  GA: 0.15,   // Georgia
  NC: 0.15,   // North Carolina
  OH: 0.15,   // Ohio
  MI: 0.15,   // Michigan
  PA: 0.15,   // Pennsylvania
  MN: 0.15,   // Minnesota
  WI: 0.15,   // Wisconsin
  MO: 0.15,   // Missouri
  TN: 0.15,   // Tennessee
  SC: 0.15,   // South Carolina
  AL: 0.15,   // Alabama
  MS: 0.15,   // Mississippi
  AR: 0.15,   // Arkansas
  OTHER: 0.18 // National average fallback
};

// State display names for output messaging
const STATE_LABEL_MAP: Record<string, string> = {
  NY: "New York", CA: "California", MA: "Massachusetts",
  IL: "Illinois", FL: "Florida", WA: "Washington",
  CO: "Colorado", NV: "Nevada", AZ: "Arizona", OR: "Oregon",
  TX: "Texas", GA: "Georgia", NC: "North Carolina", OH: "Ohio",
  MI: "Michigan", PA: "Pennsylvania", MN: "Minnesota", WI: "Wisconsin",
  MO: "Missouri", TN: "Tennessee", SC: "South Carolina", AL: "Alabama",
  MS: "Mississippi", AR: "Arkansas", OTHER: "National Average"
};

// Service quality adjustments (percentage points added to/subtracted from norm)
const SERVICE_ADJUSTMENT_MAP: Record<string, number> = {
  poor: -0.05,      // Poor service: reduce by 5%
  average: 0.00,    // Average: apply state norm as-is
  good: 0.02,       // Good service: add 2%
  excellent: 0.05   // Excellent service: add 5%
};

// Auto-gratuity floor applied for parties >= 6 (industry standard)
const AUTO_GRAT_RATE = 0.18;
const AUTO_GRAT_THRESHOLD = 6;

export function compute(i: Inputs): Outputs {
  const billAmount = Number(i.bill_amount) || 0;
  const state = (i.state || "OTHER").toUpperCase();
  const service = (i.service || "average").toLowerCase();
  const partySize = Math.max(1, Math.round(Number(i.party_size) || 1));

  if (billAmount <= 0) {
    return {
      tip_amount: 0,
      total_bill: 0,
      per_person: 0,
      tip_rate_applied: 0,
      auto_grat_notice: "Enter a valid bill amount to see tip recommendations.",
      state_norm_info: "—"
    };
  }

  // Step 1: Get state norm
  const stateNorm = STATE_NORM_MAP[state] ?? STATE_NORM_MAP["OTHER"];
  const stateName = STATE_LABEL_MAP[state] ?? "National Average";

  // Step 2: Apply service adjustment
  const serviceAdj = SERVICE_ADJUSTMENT_MAP[service] ?? 0;
  const adjustedRate = stateNorm + serviceAdj;

  // Step 3: Apply auto-gratuity floor for large parties
  const isAutoGrat = partySize >= AUTO_GRAT_THRESHOLD;
  let effectiveRate = adjustedRate;
  let autoGratNotice = "";

  if (isAutoGrat) {
    if (adjustedRate < AUTO_GRAT_RATE) {
      effectiveRate = AUTO_GRAT_RATE;
      autoGratNotice = `Party of ${partySize}: auto-gratuity of 18% applied (raised from ${(adjustedRate * 100).toFixed(0)}%). Check your bill — many restaurants add this automatically.`;
    } else {
      autoGratNotice = `Party of ${partySize}: auto-gratuity threshold reached. Your calculated rate (${(adjustedRate * 100).toFixed(0)}%) already meets or exceeds the 18% floor.`;
    }
  } else {
    autoGratNotice = `Party of ${partySize}: no auto-gratuity required (applies at ${AUTO_GRAT_THRESHOLD}+ guests).`;
  }

  // Step 4: Clamp to minimum 0%
  const finalRate = Math.max(0, effectiveRate);

  // Step 5: Calculate monetary outputs
  const tipAmount = billAmount * finalRate;
  const totalBill = billAmount + tipAmount;
  const perPerson = totalBill / partySize;

  // Step 6: Build state norm info string
  const serviceLabels: Record<string, string> = {
    poor: "poor",
    average: "average",
    good: "good",
    excellent: "excellent"
  };
  const serviceLabel = serviceLabels[service] ?? "average";
  const stateNormInfo = `${stateName} norm: ${(stateNorm * 100).toFixed(0)}% | Service (${serviceLabel}): ${serviceAdj >= 0 ? "+" : ""}${(serviceAdj * 100).toFixed(0)}% | Final rate: ${(finalRate * 100).toFixed(0)}%`;

  return {
    tip_amount: Math.round(tipAmount * 100) / 100,
    total_bill: Math.round(totalBill * 100) / 100,
    per_person: Math.round(perPerson * 100) / 100,
    tip_rate_applied: Math.round(finalRate * 10000) / 10000, // e.g. 0.2000 for 20%
    auto_grat_notice: autoGratNotice,
    state_norm_info: stateNormInfo
  };
}
