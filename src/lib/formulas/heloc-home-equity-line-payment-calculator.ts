/**
 * HELOC (Home Equity Line of Credit) payment calculator.
 * Estima el crédito disponible (CLTV × valor − hipoteca), el pago interest-only
 * del período de disposición (draw) y el pago amortizable del período de
 * repago. Utilidad matemática pura — la tasa (variable) la ingresa el usuario.
 */

export interface Inputs {
  home_value?: number;      // valor de la vivienda
  mortgage_balance?: number; // saldo de la 1ra hipoteca
  heloc_balance: number;    // saldo dispuesto en la HELOC
  annual_rate: number;      // APR variable en %
  draw_years?: number;      // duración del período de disposición
  repay_years?: number;     // duración del período de repago
  max_ltv?: number;         // límite combinado préstamo/valor (CLTV) en %
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function fmtUSD(n: number): string {
  return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUSD0(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function compute(i: Inputs): Outputs {
  const homeValue = Math.max(0, Number(i.home_value) || 0);
  const mortgage = Math.max(0, Number(i.mortgage_balance) || 0);
  const drawn = Math.max(0, Number(i.heloc_balance) || 0);
  const apr = Math.max(0, Number(i.annual_rate) || 0);
  const drawYears = Math.max(0, Number(i.draw_years) || 10);
  const repayYears = Math.max(1, Number(i.repay_years) || 20);
  const cltv = Math.min(100, Math.max(0, Number(i.max_ltv) || 85));

  // Crédito máximo disponible = CLTV × valor − hipoteca vigente.
  const availableCredit = homeValue > 0 ? Math.max(0, homeValue * (cltv / 100) - mortgage) : 0;

  // Si no ingresó saldo dispuesto, ilustramos con el crédito máximo disponible.
  const balance = drawn > 0 ? drawn : availableCredit;
  if (balance <= 0) throw new Error('Enter a HELOC balance, or a home value and mortgage balance');

  const r = apr / 100 / 12;

  // Draw period: pago interest-only (el saldo no baja si sólo pagás interés).
  const interestOnly = balance * r;
  const drawMonths = Math.round(drawYears * 12);
  const drawInterest = interestOnly * drawMonths;

  // Repayment period: amortización del saldo total.
  const repayMonths = Math.round(repayYears * 12);
  const repayment = r > 0
    ? balance * r / (1 - Math.pow(1 + r, -repayMonths))
    : balance / repayMonths;
  const repayInterest = repayment * repayMonths - balance;

  const totalInterest = drawInterest + repayInterest;

  const equityNote = homeValue > 0
    ? `Based on ${cltv}% CLTV on a ${fmtUSD0(homeValue)} home minus a ${fmtUSD0(mortgage)} mortgage, you could borrow up to **${fmtUSD0(availableCredit)}**. `
    : '';

  const _insight = {
    title: `Interest-only payment: about ${fmtUSD0(interestOnly)}/month`,
    text: `${equityNote}On a **${fmtUSD0(balance)}** balance at **${apr}%**, you'd pay about **${fmtUSD0(interestOnly)}/month** during the ${drawYears}-year draw period (interest only), then about **${fmtUSD0(repayment)}/month** during the ${repayYears}-year repayment period when principal is added. Total interest over the life is roughly **${fmtUSD0(totalInterest)}**. HELOC rates are usually variable, so the payment can change.`,
    tone: 'neutral',
    icon: '🏦',
  };

  const _chart = {
    type: 'bar',
    labels: ['Draw (interest-only)', 'Repayment (P&I)'],
    values: [Math.round(interestOnly), Math.round(repayment)],
    prefix: '$',
    ariaLabel: `Interest-only payment ${fmtUSD0(interestOnly)} per month during the draw period versus ${fmtUSD0(repayment)} during repayment.`,
  };

  return {
    interest_only_payment: fmtUSD(interestOnly),
    repayment_payment: fmtUSD(repayment),
    available_credit: homeValue > 0 ? fmtUSD0(availableCredit) : 'Enter home value to estimate',
    balance_used: fmtUSD0(balance),
    total_interest: fmtUSD0(totalInterest),
    payment_jump: fmtUSD0(repayment - interestOnly),
    breakdown: `${equityNote ? equityNote.replace(/\*\*/g, '') : ''}Draw: ${fmtUSD0(balance)} × ${apr}%/12 = ${fmtUSD(interestOnly)}/mo (interest only, ${drawYears} yr). Repayment: amortize ${fmtUSD0(balance)} over ${repayYears} yr = ${fmtUSD(repayment)}/mo. Total interest ≈ ${fmtUSD0(totalInterest)}.`,
    _insight,
    _chart,
  };
}
