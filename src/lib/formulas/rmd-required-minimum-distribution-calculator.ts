/**
 * RMD (Required Minimum Distribution) calculator — SECURE 2.0.
 * RMD = saldo del IRA/401(k) al cierre del año anterior ÷ período de distribución
 * de la IRS Uniform Lifetime Table (Table III). La edad de inicio obligatorio es
 * 73 (nacidos 1951-1959) o 75 (nacidos 1960+).
 * Fuente única: src/lib/data/usa-2026.ts (RMD_UNIFORM_LIFETIME, rmdRequiredBeginningAge).
 */
import {
  RMD_UNIFORM_LIFETIME,
  rmdRequiredBeginningAge,
  fmtUSD,
  fmtUSD0,
} from '../data/usa-2026.ts';

const CURRENT_YEAR = 2026;

export interface Inputs {
  account_balance: number; // saldo al 31-dic del año anterior
  current_age: number;     // edad que cumple este año
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function divisorForAge(age: number): number {
  if (age >= 120) return RMD_UNIFORM_LIFETIME[120];
  if (RMD_UNIFORM_LIFETIME[age] !== undefined) return RMD_UNIFORM_LIFETIME[age];
  // Edades por debajo de 72 no están en la tabla (no aplica RMD todavía).
  return RMD_UNIFORM_LIFETIME[72];
}

export function compute(i: Inputs): Outputs {
  const balance = Math.max(0, Number(i.account_balance) || 0);
  const age = Math.floor(Number(i.current_age) || 0);

  if (balance <= 0) throw new Error('Enter your prior year-end account balance');
  if (age < 40 || age > 120) throw new Error('Enter a valid age');

  const birthYear = CURRENT_YEAR - age;
  const rbdAge = rmdRequiredBeginningAge(birthYear); // 73 o 75

  // Todavía no está obligado a tomar RMD.
  if (age < rbdAge) {
    const yearsToGo = rbdAge - age;
    const firstYear = CURRENT_YEAR + yearsToGo;
    return {
      rmd_amount: fmtUSD(0),
      distribution_period: '—',
      required_beginning_age: String(rbdAge),
      percentage_of_balance: '0%',
      monthly_equivalent: fmtUSD(0),
      status_note: `No RMD required yet. Your first RMD is at age ${rbdAge}, in ${firstYear}.`,
      breakdown: `At age ${age} you are below your required beginning age of ${rbdAge} (born ~${birthYear}). RMDs start in ${firstYear}; until then, distributions are optional.`,
      _insight: {
        title: 'No RMD required yet',
        text: `Under SECURE 2.0, someone born around **${birthYear}** must begin RMDs at age **${rbdAge}** — for you that is in **${firstYear}**. Until then you can leave the money invested (though voluntary withdrawals are allowed after 59½ without the early-withdrawal penalty).`,
        tone: 'good',
        icon: '⏳',
      },
    };
  }

  const divisor = divisorForAge(age);
  const rmd = Math.round((balance / divisor) * 100) / 100;
  const pct = (1 / divisor) * 100;
  const monthly = rmd / 12;

  const _insight = {
    title: `Your ${CURRENT_YEAR} RMD is about ${fmtUSD0(rmd)}`,
    text: `At age **${age}** with a **${fmtUSD0(balance)}** prior year-end balance, your Uniform Lifetime Table divisor is **${divisor}**, so your required minimum distribution is **${fmtUSD0(rmd)}** — about **${pct.toFixed(1)}%** of the balance, or ${fmtUSD0(monthly)}/month. You must withdraw at least this much by **December 31, ${CURRENT_YEAR}** (your very first RMD can wait until April 1 of next year).`,
    tone: 'neutral',
    icon: '💵',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Required distribution', value: Math.round(rmd) },
      { label: 'Stays invested', value: Math.max(0, Math.round(balance - rmd)) },
    ],
    prefix: '$',
    centerValue: fmtUSD0(rmd),
    centerLabel: 'RMD',
    ariaLabel: `Of a ${fmtUSD0(balance)} balance, ${fmtUSD0(rmd)} must be withdrawn this year.`,
  };

  return {
    rmd_amount: fmtUSD(rmd),
    distribution_period: String(divisor),
    required_beginning_age: String(rbdAge),
    percentage_of_balance: pct.toFixed(2) + '%',
    monthly_equivalent: fmtUSD(monthly),
    status_note: `RMD required for ${CURRENT_YEAR}. Deadline: December 31 (first RMD may be delayed to April 1 next year).`,
    breakdown: `${fmtUSD0(balance)} ÷ ${divisor} (Uniform Lifetime Table, age ${age}) = ${fmtUSD(rmd)}. That is ${pct.toFixed(2)}% of the balance. Missing it risks a 25% excise tax (10% if corrected promptly).`,
    _insight,
    _chart,
  };
}
