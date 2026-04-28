export interface Inputs {
  gpu_type: string;
  custom_rental_rate: number;
  custom_purchase_price: number;
  custom_tdp_watts: number;
  hours_per_day: number;
  days_per_month: number;
  electricity_rate: number;
  amortization_months: number;
  overhead_percent: number;
}

export interface Outputs {
  monthly_rental_cost: number;
  monthly_ownership_cost: number;
  monthly_electricity_cost: number;
  monthly_amortization: number;
  breakeven_month: number;
  annual_rental_cost: number;
  recommendation: string;
}

// GPU presets: [rental_rate_per_hour, tdp_watts, purchase_price]
// Sources: Vast.ai / RunPod spot pricing 2026; NVIDIA datasheets; retail pricing
const GPU_PRESETS_2026: Record<string, [number, number, number]> = {
  rtx4090:   [0.40,  450,  1800],
  a100_40gb: [1.10,  300, 10000],
  a100_80gb: [1.40,  400, 12000],
  h100_sxm:  [2.50,  700, 30000],
  rtx3090:   [0.20,  350,   700],
};

export function compute(i: Inputs): Outputs {
  const gpuType           = (i.gpu_type || "rtx4090").trim();
  const hoursPerDay       = Math.max(0, Number(i.hours_per_day)   || 0);
  const daysPerMonth      = Math.max(0, Number(i.days_per_month)  || 0);
  const electricityRate   = Math.max(0, Number(i.electricity_rate) || 0.12);
  const amortMonths       = Math.max(1, Number(i.amortization_months) || 24);
  const overheadPct       = Math.max(0, Number(i.overhead_percent) || 0);

  // Resolve GPU parameters
  let rentalRatePerHour: number;
  let tdpWatts: number;
  let purchasePrice: number;

  if (gpuType === "custom") {
    rentalRatePerHour = Math.max(0, Number(i.custom_rental_rate)    || 0.40);
    tdpWatts          = Math.max(1, Number(i.custom_tdp_watts)      || 450);
    purchasePrice     = Math.max(0, Number(i.custom_purchase_price) || 1800);
  } else {
    const preset = GPU_PRESETS_2026[gpuType] || GPU_PRESETS_2026["rtx4090"];
    rentalRatePerHour = preset[0];
    tdpWatts          = preset[1];
    purchasePrice     = preset[2];
  }

  // Guard: no usage
  if (hoursPerDay <= 0 || daysPerMonth <= 0) {
    return {
      monthly_rental_cost:   0,
      monthly_ownership_cost: 0,
      monthly_electricity_cost: 0,
      monthly_amortization:  0,
      breakeven_month:       0,
      annual_rental_cost:    0,
      recommendation:        "Enter hours per day and days per month to see results.",
    };
  }

  // --- Rental side ---
  const hoursPerMonth     = hoursPerDay * daysPerMonth;
  const monthly_rental_cost = hoursPerMonth * rentalRatePerHour;
  const annual_rental_cost  = monthly_rental_cost * 12;

  // --- Ownership side ---
  // Amortization: spread purchase price over amortization period
  const monthly_amortization = purchasePrice / amortMonths;

  // Electricity: (TDP kW) × hours × rate
  const monthly_electricity_cost = (tdpWatts / 1000) * hoursPerMonth * electricityRate;

  // Overhead: annual overhead = overheadPct% of purchase price, divided by 12
  const monthly_overhead = (purchasePrice * (overheadPct / 100)) / 12;

  const monthly_ownership_cost = monthly_amortization + monthly_electricity_cost + monthly_overhead;

  // --- Break-even calculation ---
  // At month N, cumulative rental savings must cover purchase price.
  // Rental cumulative spend:    N × monthly_rental
  // Ownership cumulative spend: purchase_price + N × (monthly_electricity + monthly_overhead)
  // Break-even: N × monthly_rental = purchase_price + N × (monthly_electricity + monthly_overhead)
  // N × (monthly_rental - monthly_electricity - monthly_overhead) = purchase_price
  // N = purchase_price / (monthly_rental - monthly_electricity - monthly_overhead)
  const monthlySavingIfOwning = monthly_rental_cost - monthly_electricity_cost - monthly_overhead;

  let breakeven_month: number;
  let recommendation: string;

  if (monthlySavingIfOwning <= 0) {
    // Owning is never cheaper (electricity + overhead exceed rental cost)
    breakeven_month = 0;
    recommendation =
      "Renting is always cheaper at this usage level. Your electricity and overhead costs alone exceed the rental rate — owning this GPU does not break even.";
  } else {
    const rawBreakeven = purchasePrice / monthlySavingIfOwning;
    breakeven_month = Math.ceil(rawBreakeven);

    if (breakeven_month <= amortMonths) {
      recommendation =
        `Owning breaks even in ${breakeven_month} months — within your ${amortMonths}-month amortization window. Purchasing makes financial sense if you plan to use this GPU for ${breakeven_month}+ months.`;
    } else {
      recommendation =
        `Break-even at ${breakeven_month} months exceeds your ${amortMonths}-month amortization window. Renting is more cost-effective unless you plan to keep the GPU for over ${breakeven_month} months.`;
    }
  }

  return {
    monthly_rental_cost:      Math.round(monthly_rental_cost      * 100) / 100,
    monthly_ownership_cost:   Math.round(monthly_ownership_cost   * 100) / 100,
    monthly_electricity_cost: Math.round(monthly_electricity_cost * 100) / 100,
    monthly_amortization:     Math.round(monthly_amortization     * 100) / 100,
    breakeven_month,
    annual_rental_cost:       Math.round(annual_rental_cost       * 100) / 100,
    recommendation,
  };
}
