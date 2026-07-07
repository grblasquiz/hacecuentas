export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function leasingVsCreditoAutoComparativaCompleta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v = Number(i.valorAuto) || 20000;
  const years = Math.max(1, Number(i.plazoAnios) || 3);
  const n = years * 12; // total monthly payments

  // --- Auto loan: standard amortization formula M = P×r(1+r)^n / ((1+r)^n − 1)
  // Benchmark APR: Federal Reserve G.19 avg new-car rate ~7% (2025)
  const apr = 0.07;
  const r = apr / 12;
  const loanFactor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const cuotaC = v * loanFactor;

  // --- Lease approximation:
  // Monthly lease ≈ (Cap Cost − Residual) / term + (Cap Cost + Residual) × money factor
  // Typical residual for 3-yr lease: 50–55% of MSRP; money factor ≈ 0.0025 (~6% APR)
  // Residual scales with term: shorter lease = higher residual
  const residualPct = years <= 2 ? 0.60 : years <= 3 ? 0.55 : years <= 4 ? 0.48 : 0.42;
  const residual = v * residualPct;
  const moneyFactor = 0.0025; // ~6% APR equivalent
  const depFee = (v - residual) / n;
  const finFee = (v + residual) * moneyFactor;
  const cuotaL = depFee + finFee;

  const difMes = Math.round(cuotaC - cuotaL);
  const totalLoan = Math.round(cuotaC * n);
  const totalLease = Math.round(cuotaL * n);
  const residualRounded = Math.round(residual);

  const rec = __lang === 'en'
    ? (v > 30000
        ? 'For business use, leasing may offer better tax deductions. For personal use, compare total cost (loan leaves you owning a car).'
        : 'A loan is usually better for personal use — you build equity. Lease only if lower monthly payments are critical or you drive under 15k miles/year.')
    : __lang === 'pt'
    ? (v > 30000
        ? 'Para uso empresarial, leasing pode oferecer melhores deduções fiscais. Para uso pessoal, compare o custo total (financiamento deixa o carro em seu nome).'
        : 'O financiamento costuma ser melhor para pessoa física — você acumula patrimônio. Leasing vale se pagamento menor for essencial ou você rodar menos de 20.000 km/ano.')
    : (v > 30000
        ? 'Para uso empresa, el leasing puede ofrecer mejores deducciones fiscales. Para uso personal, compará el costo total (el crédito te deja con el auto).'
        : 'El crédito suele ser mejor para uso personal — construís patrimonio. Leasing conveniente si el pago mensual bajo es crítico o manejás menos de 20.000 km/año.');

  const insightText = __lang === 'en'
    ? `Lease: ~**$${Math.round(cuotaL)}/mo** (total paid: $${totalLease}, residual value $${residualRounded} — no ownership unless you buy out) vs Loan: ~**$${Math.round(cuotaC)}/mo** (total paid: $${totalLoan} at 7% APR, car is yours). Monthly savings from leasing: ~$${difMes}/mo.`
    : __lang === 'pt'
    ? `Leasing: ~**R$${Math.round(cuotaL)}/mês** (total pago: $${totalLease}, valor residual $${residualRounded} — não há propriedade salvo compra ao final) vs Financiamento: ~**$${Math.round(cuotaC)}/mês** (total $${totalLoan} a 7% a.a., carro é seu). Economia mensal no leasing: ~$${difMes}/mês.`
    : `Leasing: ~**$${Math.round(cuotaL)}/mes** (total pagado: $${totalLease}, valor residual $${residualRounded} — no es tuyo salvo que ejerzas opción de compra) vs Crédito: ~**$${Math.round(cuotaC)}/mes** (total $${totalLoan} al 7% TNA, el auto es tuyo). Ahorro mensual con leasing: ~$${difMes}/mes.`;

  const insightTitle = __lang === 'en'
    ? 'Lease vs Loan: monthly cost & total'
    : __lang === 'pt'
    ? 'Leasing vs Financiamento: custo mensal e total'
    : 'Leasing vs Crédito: costo mensual y total';

  return {
    cuotaLeasing: __lang === 'en'
      ? `~$${Math.round(cuotaL)}/mo — total $${totalLease} (no ownership)`
      : __lang === 'pt'
      ? `~$${Math.round(cuotaL)}/mês — total $${totalLease} (sem propriedade)`
      : `~$${Math.round(cuotaL)}/mes — total $${totalLease} (sin propiedad)`,
    cuotaCredito: __lang === 'en'
      ? `~$${Math.round(cuotaC)}/mo — total $${totalLoan} (you own the car)`
      : __lang === 'pt'
      ? `~$${Math.round(cuotaC)}/mês — total $${totalLoan} (carro é seu)`
      : `~$${Math.round(cuotaC)}/mes — total $${totalLoan} (el auto es tuyo)`,
    recomendacion: rec,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: 'neutral',
      icon: '🚗',
    },
  };
}
