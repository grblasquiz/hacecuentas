export interface Inputs {
  annual_expenses: number;
  current_portfolio: number;
  monthly_savings: number;
  real_return: number;
  fire_variant: string;
  current_age: number;
  coast_retirement_age: number;
}

export interface Outputs {
  fire_number: number;
  gap: number;
  years_to_fi: number;
  fi_age: number;
  savings_rate_note: string;
}

// Multipliers based on Safe Withdrawal Rate variants
// Source: Trinity Study (1998, updated 2011); FIRE community convention
const MULTIPLIERS: Record<string, number> = {
  lean: 20,      // 5.0% SWR — frugal / low-cost-of-living
  standard: 25,  // 4.0% SWR — classic Trinity Study rule
  fat: 33,       // ~3.0% SWR — high spending / extra safety margin
  coast: 25,     // Coast uses Standard FIRE number as the growth target
};

export function compute(i: Inputs): Outputs {
  const annualExpenses = Math.max(0, Number(i.annual_expenses) || 0);
  const currentPortfolio = Math.max(0, Number(i.current_portfolio) || 0);
  const monthlySavings = Math.max(0, Number(i.monthly_savings) || 0);
  const realReturnPct = Number(i.real_return) ?? 6;
  const variant = (i.fire_variant || "standard").toLowerCase();
  const currentAge = Number(i.current_age) || 30;
  const retirementAge = Number(i.coast_retirement_age) || 65;

  if (annualExpenses <= 0) {
    return {
      fire_number: 0,
      gap: 0,
      years_to_fi: 0,
      fi_age: currentAge,
      savings_rate_note: "Enter your annual expenses to calculate your FIRE number.",
    };
  }

  const multiplier = MULTIPLIERS[variant] ?? 25;

  // Standard FIRE number (used as growth target for Coast)
  const standardFireNumber = annualExpenses * 25;

  // The target portfolio for the chosen variant
  const fireNumber = annualExpenses * multiplier;

  // ── Coast FIRE branch ────────────────────────────────────────────────────
  if (variant === "coast") {
    const annualRealReturn = Math.max(0, realReturnPct) / 100;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);

    // Coast FIRE number = Standard FIRE target discounted back from retirement age
    // Formula: CoastFIRE = StandardFIRE / (1 + r)^n
    let coastTarget: number;
    if (annualRealReturn === 0) {
      coastTarget = standardFireNumber;
    } else {
      coastTarget = standardFireNumber / Math.pow(1 + annualRealReturn, yearsToRetirement);
    }

    const gap = Math.max(0, coastTarget - currentPortfolio);

    // Years to reach Coast FIRE number with contributions
    let yearsToCoast = 0;
    if (currentPortfolio >= coastTarget) {
      yearsToCoast = 0;
    } else if (monthlySavings <= 0 && annualRealReturn === 0) {
      yearsToCoast = Infinity;
    } else {
      const r = annualRealReturn / 12;
      if (r === 0) {
        yearsToCoast = monthlySavings > 0
          ? (coastTarget - currentPortfolio) / monthlySavings / 12
          : Infinity;
      } else {
        const numerator = Math.log((coastTarget + monthlySavings / r) / (currentPortfolio + monthlySavings / r));
        const denominator = Math.log(1 + r);
        const months = numerator / denominator;
        yearsToCoast = months > 0 ? months / 12 : 0;
      }
    }

    const isFinite_ = isFinite(yearsToCoast);
    const fiAge = isFinite_ ? Math.round(currentAge + yearsToCoast) : 999;

    let note: string;
    if (currentPortfolio >= coastTarget) {
      note = `You've already reached your Coast FIRE number of $${coastTarget.toLocaleString("en-US", { maximumFractionDigits: 0 })}! Your portfolio will grow to $${standardFireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })} by age ${retirementAge} without further contributions.`;
    } else if (!isFinite_) {
      note = `With no monthly savings and 0% return, you cannot reach Coast FIRE. Add contributions or increase your return assumption.`;
    } else {
      note = `Coast FIRE target: $${coastTarget.toLocaleString("en-US", { maximumFractionDigits: 0 })}. Once reached at ~age ${fiAge}, you can stop contributing and still retire at ${retirementAge} with $${standardFireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}.`;
    }

    return {
      fire_number: Math.round(coastTarget),
      gap: Math.round(gap),
      years_to_fi: isFinite_ ? Math.round(yearsToCoast * 10) / 10 : 9999,
      fi_age: fiAge,
      savings_rate_note: note,
    };
  }

  // ── Standard / Lean / Fat FIRE branch ───────────────────────────────────
  const gap = Math.max(0, fireNumber - currentPortfolio);

  let yearsToFI = 0;

  if (currentPortfolio >= fireNumber) {
    yearsToFI = 0;
  } else {
    const annualRealReturn = Math.max(0, realReturnPct) / 100;
    const r = annualRealReturn / 12; // monthly rate

    if (r === 0) {
      // No investment growth — purely contribution-based
      if (monthlySavings <= 0) {
        yearsToFI = Infinity;
      } else {
        yearsToFI = gap / monthlySavings / 12;
      }
    } else {
      if (monthlySavings <= 0) {
        // Growth only, no contributions: T = P * (1+r)^n  =>  n = ln(T/P) / ln(1+r)
        if (currentPortfolio <= 0) {
          yearsToFI = Infinity;
        } else {
          const months = Math.log(fireNumber / currentPortfolio) / Math.log(1 + r);
          yearsToFI = months > 0 ? months / 12 : 0;
        }
      } else {
        // FV with contributions: T = P(1+r)^n + c*[(1+r)^n - 1]/r
        // Solve for n: n = ln[(T + c/r) / (P + c/r)] / ln(1+r)
        const cOverR = monthlySavings / r;
        const numerator = Math.log((fireNumber + cOverR) / (currentPortfolio + cOverR));
        const denominator = Math.log(1 + r);
        if (denominator <= 0 || numerator <= 0) {
          yearsToFI = 0;
        } else {
          const months = numerator / denominator;
          yearsToFI = months / 12;
        }
      }
    }
  }

  const isFinite_ = isFinite(yearsToFI);
  const fiAge = isFinite_ ? Math.round(currentAge + yearsToFI) : 999;

  // Build summary note
  const variantLabels: Record<string, string> = {
    lean: "Lean FIRE (20× / 5% SWR)",
    standard: "Standard FIRE (25× / 4% SWR)",
    fat: "Fat FIRE (33× / 3% SWR)",
  };
  const variantLabel = variantLabels[variant] ?? "Standard FIRE";
  const savingsPct =
    annualExpenses > 0
      ? ((monthlySavings * 12) / (annualExpenses + monthlySavings * 12)) * 100
      : 0;

  let note: string;
  if (currentPortfolio >= fireNumber) {
    note = `Congratulations — your current portfolio already meets your ${variantLabel} target of $${fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })}. You are financially independent.`;
  } else if (!isFinite_) {
    note = `With $0 monthly savings and 0% real return, you cannot reach ${variantLabel}. Increase contributions or expected return.`;
  } else {
    note = `${variantLabel}: $${fireNumber.toLocaleString("en-US", { maximumFractionDigits: 0 })} target. Saving $${(monthlySavings * 12).toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr (${savingsPct.toFixed(1)}% savings rate) at ${realReturnPct}% real return → FI in ~${(Math.round(yearsToFI * 10) / 10).toFixed(1)} years (age ${fiAge}).`;
  }

  return {
    fire_number: Math.round(fireNumber),
    gap: Math.round(gap),
    years_to_fi: isFinite_ ? Math.round(yearsToFI * 10) / 10 : 9999,
    fi_age: fiAge,
    savings_rate_note: note,
  };
}
