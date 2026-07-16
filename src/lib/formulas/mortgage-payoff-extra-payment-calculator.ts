/**
 * Mortgage payoff calculator (extra monthly payment).
 * Amortización pura: compara el cronograma normal contra pagar un extra mensual
 * al principal, y devuelve el tiempo y el interés ahorrados. Sin datos fiscales
 * (utilidad matemática) — la tasa la ingresa el usuario.
 */

export interface Inputs {
  loan_balance: number;    // saldo de capital actual
  annual_rate: number;     // APR en %
  remaining_years: number; // plazo restante en años
  extra_payment: number;   // pago extra mensual al principal
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function fmtUSD(n: number): string {
  return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUSD0(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function monthsToText(m: number): string {
  const yrs = Math.floor(m / 12);
  const mo = Math.round(m % 12);
  if (yrs <= 0) return `${mo} month${mo === 1 ? '' : 's'}`;
  if (mo === 0) return `${yrs} year${yrs === 1 ? '' : 's'}`;
  return `${yrs} yr ${mo} mo`;
}

export function compute(i: Inputs): Outputs {
  const balance = Math.max(0, Number(i.loan_balance) || 0);
  const apr = Math.max(0, Number(i.annual_rate) || 0);
  const years = Math.max(0, Number(i.remaining_years) || 0);
  const extra = Math.max(0, Number(i.extra_payment) || 0);

  if (balance <= 0) throw new Error('Enter your current loan balance');
  if (years <= 0) throw new Error('Enter the remaining term in years');

  const r = apr / 100 / 12;
  const n = Math.round(years * 12);

  // Cuota mensual de capital+interés (P&I) del cronograma normal.
  const basePayment = r > 0
    ? balance * r / (1 - Math.pow(1 + r, -n))
    : balance / n;

  const interestBaseline = basePayment * n - balance;

  // Simulación con el pago extra.
  const payment = basePayment + extra;
  let bal = balance;
  let interestWithExtra = 0;
  let months = 0;
  const cap = n + 1; // nunca puede tardar más que el plazo original
  while (bal > 0.005 && months < cap) {
    const interest = bal * r;
    let principal = payment - interest;
    if (principal <= 0) { // pago no cubre ni el interés (tasa altísima / cuota baja)
      months = n;
      interestWithExtra = interestBaseline;
      bal = balance; // sin progreso: caemos al baseline
      break;
    }
    if (principal > bal) principal = bal;
    interestWithExtra += interest;
    bal -= principal;
    months++;
  }

  const monthsSaved = Math.max(0, n - months);
  const interestSaved = Math.max(0, Math.round((interestBaseline - interestWithExtra) * 100) / 100);

  const _insight = {
    title: extra > 0 ? `Pay off ${monthsToText(monthsSaved)} sooner` : 'Your current payoff schedule',
    text: extra > 0
      ? `Adding **${fmtUSD0(extra)}/month** to your ${fmtUSD0(balance)} balance at ${apr}% pays the loan off in **${monthsToText(months)}** instead of ${monthsToText(n)} — **${monthsToText(monthsSaved)} sooner** — and saves about **${fmtUSD0(interestSaved)}** in interest. Your monthly payment becomes ${fmtUSD0(payment)} (was ${fmtUSD0(basePayment)}).`
      : `On a ${fmtUSD0(balance)} balance at ${apr}% over ${monthsToText(n)}, your payment is about **${fmtUSD0(basePayment)}/month** and you will pay **${fmtUSD0(interestBaseline)}** in interest. Add an extra monthly amount above to see how much time and interest you would save.`,
    tone: 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'bar',
    labels: ['Interest — normal', 'Interest — with extra'],
    values: [Math.round(interestBaseline), Math.round(interestWithExtra)],
    prefix: '$',
    ariaLabel: `Total interest ${fmtUSD0(interestBaseline)} on the normal schedule versus ${fmtUSD0(interestWithExtra)} with the extra payment.`,
  };

  return {
    interest_saved: fmtUSD0(interestSaved),
    months_saved: monthsToText(monthsSaved),
    monthly_payment: fmtUSD(basePayment),
    new_monthly_payment: fmtUSD(payment),
    new_payoff_time: monthsToText(months),
    total_interest_baseline: fmtUSD0(interestBaseline),
    total_interest_with_extra: fmtUSD0(interestWithExtra),
    breakdown: `Base P&I ${fmtUSD(basePayment)}/mo over ${monthsToText(n)} → interest ${fmtUSD0(interestBaseline)}. With +${fmtUSD0(extra)}/mo: paid off in ${monthsToText(months)}, interest ${fmtUSD0(interestWithExtra)}. Saved ${monthsToText(monthsSaved)} and ${fmtUSD0(interestSaved)}.`,
    _insight,
    _chart,
  };
}
