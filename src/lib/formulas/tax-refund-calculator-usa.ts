/**
 * Federal tax refund estimator — tax year 2026.
 * Estima el reembolso (o saldo a pagar) comparando el impuesto federal
 * calculado sobre el ingreso gravable contra lo retenido (W-2 Box 2),
 * aplicando Child Tax Credit 2026 (con phase-out y porción reembolsable ACTC).
 * Fuente única de tramos/deducción/crédito: src/lib/data/usa-2026.ts.
 */
import {
  calcFederalTax,
  marginalRate2026,
  STANDARD_DEDUCTION_2026,
  CHILD_TAX_CREDIT_2026,
  fmtUSD,
  fmtUSD0,
  type FilingStatus,
} from '../data/usa-2026.ts';

export interface Inputs {
  filing_status: string;   // 'single' | 'mfj' | 'mfs' | 'hoh'
  annual_income: number;   // total income (W-2 Box 1 wages + other)
  adjustments?: number;    // above-the-line (HSA, IRA, student-loan interest…)
  deduction_type?: string; // 'standard' | 'itemized'
  itemized_amount?: number;
  federal_withheld: number;      // W-2 Box 2
  qualifying_children?: number;  // hijos <17 elegibles al CTC
  other_dependents?: number;     // otros dependientes ($500 c/u)
  other_credits?: number;        // otros créditos no reembolsables (educación, etc.)
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const STATUSES: FilingStatus[] = ['single', 'mfj', 'mfs', 'hoh'];

export function compute(i: Inputs): Outputs {
  const status = (STATUSES.includes(i.filing_status as FilingStatus) ? i.filing_status : 'single') as FilingStatus;
  const income = Math.max(0, Number(i.annual_income) || 0);
  const adjustments = Math.max(0, Number(i.adjustments) || 0);
  const withheld = Math.max(0, Number(i.federal_withheld) || 0);
  const children = Math.max(0, Math.floor(Number(i.qualifying_children) || 0));
  const otherDeps = Math.max(0, Math.floor(Number(i.other_dependents) || 0));
  const otherCredits = Math.max(0, Number(i.other_credits) || 0);
  const deductionType = String(i.deduction_type || 'standard') === 'itemized' ? 'itemized' : 'standard';

  if (income <= 0) throw new Error('Enter your total annual income');

  const agi = Math.max(0, income - adjustments);
  const stdDeduction = STANDARD_DEDUCTION_2026[status];
  const deduction = deductionType === 'itemized'
    ? Math.max(0, Number(i.itemized_amount) || 0)
    : stdDeduction;
  const taxableIncome = Math.max(0, agi - deduction);

  const taxBeforeCredits = calcFederalTax(taxableIncome, status);
  const marginal = marginalRate2026(taxableIncome, status);

  // ── Child Tax Credit 2026 + phase-out ($50 por cada $1.000 sobre el umbral) ──
  const ctc = CHILD_TAX_CREDIT_2026;
  const rawCredit = children * ctc.perChild + otherDeps * ctc.otherDependent;
  const over = Math.max(0, agi - ctc.phaseoutStart[status]);
  const reduction = Math.ceil(over / 1000) * ctc.phaseoutPer1000;
  const allowedFamilyCredit = Math.max(0, rawCredit - reduction);

  // Créditos no reembolsables: reducen el impuesto hasta 0.
  const totalNonRefundable = allowedFamilyCredit + otherCredits;
  const taxAfterCredits = Math.max(0, taxBeforeCredits - totalNonRefundable);

  // Porción reembolsable (Additional CTC): hasta $1.700/hijo del crédito no usado.
  const unusedCredit = Math.max(0, totalNonRefundable - taxBeforeCredits);
  const refundableACTC = Math.min(unusedCredit, children * ctc.refundableCap);

  const refundOrOwed = Math.round((withheld - taxAfterCredits + refundableACTC) * 100) / 100;
  const isRefund = refundOrOwed >= 0;
  const effectiveRate = agi > 0 ? taxAfterCredits / agi : 0;

  let refundStatus: string;
  if (Math.abs(refundOrOwed) < 0.5) refundStatus = 'Roughly break-even — no meaningful refund or balance due.';
  else if (isRefund) refundStatus = `Estimated federal refund of ${fmtUSD(refundOrOwed)}`;
  else refundStatus = `Estimated balance due of ${fmtUSD(Math.abs(refundOrOwed))}`;

  const _insight = {
    title: isRefund ? 'You are likely getting a refund' : 'You may owe at filing',
    text: `On ${fmtUSD0(agi)} of income you owe about **${fmtUSD(taxAfterCredits)}** in 2026 federal tax (effective rate **${(effectiveRate * 100).toFixed(1)}%**, top bracket **${(marginal * 100).toFixed(0)}%**). ` +
      (children > 0 ? `The Child Tax Credit adds **${fmtUSD(allowedFamilyCredit)}** in credits. ` : '') +
      `Against **${fmtUSD(withheld)}** withheld, that leaves ${isRefund ? `a **refund of ${fmtUSD(refundOrOwed)}**` : `a **balance due of ${fmtUSD(Math.abs(refundOrOwed))}**`}.`,
    tone: isRefund ? 'good' : 'warn',
    icon: isRefund ? '💰' : '💸',
  };

  const _chart = {
    type: 'bar',
    labels: ['Tax owed', 'Withheld'],
    values: [Math.round(taxAfterCredits), Math.round(withheld)],
    prefix: '$',
    ariaLabel: `Federal tax owed ${fmtUSD(taxAfterCredits)} versus ${fmtUSD(withheld)} withheld.`,
  };

  return {
    taxable_income: fmtUSD0(taxableIncome),
    tax_before_credits: fmtUSD(taxBeforeCredits),
    child_tax_credit: fmtUSD(allowedFamilyCredit),
    tax_after_credits: fmtUSD(taxAfterCredits),
    refund_or_owed: (isRefund ? '' : '−') + fmtUSD(Math.abs(refundOrOwed)),
    refund_status: refundStatus,
    effective_rate: (effectiveRate * 100).toFixed(1) + '%',
    breakdown: `Taxable income ${fmtUSD0(taxableIncome)} → tax ${fmtUSD(taxBeforeCredits)} − credits ${fmtUSD(totalNonRefundable)} = ${fmtUSD(taxAfterCredits)}. Withheld ${fmtUSD(withheld)}${refundableACTC > 0 ? ` + refundable ACTC ${fmtUSD(refundableACTC)}` : ''} → ${isRefund ? 'refund' : 'balance due'} ${fmtUSD(Math.abs(refundOrOwed))}.`,
    _insight,
    _chart,
  };
}
