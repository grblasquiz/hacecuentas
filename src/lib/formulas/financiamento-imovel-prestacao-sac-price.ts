export interface Inputs {
  property_value: number;
  down_payment_pct: number;
  term_years: string;
  annual_rate_pct: number;
  tr_annual_pct: number;
}

export interface Outputs {
  financed_amount: number;
  sac_first_payment: number;
  sac_last_payment: number;
  sac_total_interest: number;
  sac_total_paid: number;
  price_payment: number;
  price_total_interest: number;
  price_total_paid: number;
  interest_difference: number;
  recommendation: string;
}

// Taxa referência Caixa SBPE 2026: ~10,5% a.a. (fonte: caixa.gov.br)
const DEFAULT_ANNUAL_RATE = 0.105;

function monthlyRate(annualRate: number): number {
  // Conversão de taxa anual para mensal equivalente (capitalização composta)
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

export function compute(i: Inputs): Outputs {
  const propertyValue = Number(i.property_value) || 0;
  const downPaymentPct = Number(i.down_payment_pct) || 0;
  const termYears = parseInt(i.term_years || "30", 10);
  const annualRatePct = Number(i.annual_rate_pct) || DEFAULT_ANNUAL_RATE * 100;
  const trAnnualPct = Number(i.tr_annual_pct) || 0;

  // Validações defensivas
  if (propertyValue <= 0) {
    return {
      financed_amount: 0,
      sac_first_payment: 0,
      sac_last_payment: 0,
      sac_total_interest: 0,
      sac_total_paid: 0,
      price_payment: 0,
      price_total_interest: 0,
      price_total_paid: 0,
      interest_difference: 0,
      recommendation: "Informe um valor de imóvel válido."
    };
  }

  if (downPaymentPct < 0 || downPaymentPct >= 100) {
    return {
      financed_amount: 0,
      sac_first_payment: 0,
      sac_last_payment: 0,
      sac_total_interest: 0,
      sac_total_paid: 0,
      price_payment: 0,
      price_total_interest: 0,
      price_total_paid: 0,
      interest_difference: 0,
      recommendation: "A entrada deve ser entre 0% e 99% do valor do imóvel."
    };
  }

  const annualRate = annualRatePct / 100;
  const trAnnual = trAnnualPct / 100;

  const downPayment = propertyValue * (downPaymentPct / 100);
  const financedAmount = propertyValue - downPayment;

  if (financedAmount <= 0) {
    return {
      financed_amount: 0,
      sac_first_payment: 0,
      sac_last_payment: 0,
      sac_total_interest: 0,
      sac_total_paid: 0,
      price_payment: 0,
      price_total_interest: 0,
      price_total_paid: 0,
      interest_difference: 0,
      recommendation: "Com entrada de 100%, não há valor a financiar."
    };
  }

  // Prazo máximo 35 anos (420 meses) conforme normas SFH/Caixa 2026
  const clampedYears = Math.min(Math.max(termYears, 1), 35);
  const n = clampedYears * 12; // número de meses

  const iMonthly = monthlyRate(annualRate); // taxa de juros mensal
  const trMonthly = monthlyRate(trAnnual);   // TR mensal (correção do saldo)

  // ─────────────────────────────────────────
  // SAC — Sistema de Amortização Constante
  // ─────────────────────────────────────────
  // Amortização constante = PV / n
  // Saldo devedor no início do mês k (antes da amortização k): PV - (k-1) * amort
  // Juros do mês k = saldo_k * iMonthly (após correção pela TR)
  // Prestação_k = amort + juros_k

  const sacAmort = financedAmount / n;
  let sacBalance = financedAmount;
  let sacTotalInterest = 0;
  let sacFirstPayment = 0;
  let sacLastPayment = 0;

  for (let k = 1; k <= n; k++) {
    // Corrige saldo pela TR antes de calcular juros
    sacBalance = sacBalance * (1 + trMonthly);
    const interest = sacBalance * iMonthly;
    // No SAC com TR, a amortização do mês é constante sobre o saldo nominal original
    // mas na prática calcula-se sobre o saldo corrigido. Usamos a amortização sobre
    // o saldo corrigido para refletir o funcionamento real dos contratos CEF.
    const amortK = financedAmount / n; // amortização constante sobre o principal nominal
    const payment = amortK + interest;
    sacTotalInterest += interest;
    if (k === 1) sacFirstPayment = payment;
    if (k === n) sacLastPayment = payment;
    sacBalance = sacBalance - amortK;
    if (sacBalance < 0) sacBalance = 0;
  }

  const sacTotalPaid = financedAmount + sacTotalInterest;

  // ─────────────────────────────────────────
  // Price — Tabela Price (Amortização Francesa)
  // ─────────────────────────────────────────
  // PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
  // Com TR: o saldo é corrigido mensalmente, o que na prática eleva a prestação.
  // Abordagem: recalculamos a prestação em cada mês sobre o saldo corrigido remanescente,
  // como fazem os bancos brasileiros (Price com atualização de saldo).

  let priceBalance = financedAmount;
  let priceTotalInterest = 0;
  let pricePaymentFixed = 0;

  // Prestação Price sem TR (base)
  const onePlusIN = Math.pow(1 + iMonthly, n);
  if (iMonthly === 0) {
    pricePaymentFixed = financedAmount / n;
  } else {
    pricePaymentFixed = financedAmount * (iMonthly * onePlusIN) / (onePlusIN - 1);
  }

  let priceTotalPaid = 0;

  if (trAnnual === 0) {
    // Sem TR: todas as prestações são iguais
    priceTotalPaid = pricePaymentFixed * n;
    priceTotalInterest = priceTotalPaid - financedAmount;
  } else {
    // Com TR: recalcula PMT a cada mês sobre saldo corrigido e meses restantes
    for (let k = 1; k <= n; k++) {
      const remaining = n - k + 1;
      // Corrige saldo pela TR
      priceBalance = priceBalance * (1 + trMonthly);
      // Recalcula PMT sobre saldo atualizado e meses restantes
      let pmtK: number;
      if (iMonthly === 0) {
        pmtK = priceBalance / remaining;
      } else {
        const opir = Math.pow(1 + iMonthly, remaining);
        pmtK = priceBalance * (iMonthly * opir) / (opir - 1);
      }
      const interestK = priceBalance * iMonthly;
      const amortK = pmtK - interestK;
      priceTotalInterest += interestK;
      priceTotalPaid += pmtK;
      priceBalance = priceBalance - amortK;
      if (priceBalance < 0) priceBalance = 0;
      if (k === 1) pricePaymentFixed = pmtK;
    }
  }

  const interestDifference = priceTotalInterest - sacTotalInterest;

  // ─────────────────────────────────────────
  // Recomendação
  // ─────────────────────────────────────────
  let recommendation = "";
  const diffPct = sacFirstPayment > 0
    ? ((pricePaymentFixed - sacFirstPayment) / sacFirstPayment) * 100
    : 0;
  const savings = interestDifference;

  if (savings > 0) {
    const savingsFmt = savings.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    const diffPctAbs = Math.abs(diffPct).toFixed(1);
    recommendation =
      `SAC é mais econômico: você paga ${savingsFmt} a menos em juros totais comparado ao Price. ` +
      `A 1ª parcela do SAC é ${diffPctAbs}% mais alta que a prestação fixa do Price — avalie se sua renda suporta o início. ` +
      `Se a renda atual comporta a 1ª parcela, prefira o SAC.`;
  } else if (savings < 0) {
    const savingsFmt = Math.abs(savings).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    recommendation =
      `Price é mais econômico neste cenário: você paga ${savingsFmt} a menos em juros totais. ` +
      `Isso é incomum e pode ocorrer com prazos muito curtos ou TR elevada. Revise os dados informados.`;
  } else {
    recommendation = "SAC e Price apresentam custo total equivalente neste cenário.";
  }

  return {
    financed_amount: Math.round(financedAmount * 100) / 100,
    sac_first_payment: Math.round(sacFirstPayment * 100) / 100,
    sac_last_payment: Math.round(sacLastPayment * 100) / 100,
    sac_total_interest: Math.round(sacTotalInterest * 100) / 100,
    sac_total_paid: Math.round(sacTotalPaid * 100) / 100,
    price_payment: Math.round(pricePaymentFixed * 100) / 100,
    price_total_interest: Math.round(priceTotalInterest * 100) / 100,
    price_total_paid: Math.round(priceTotalPaid * 100) / 100,
    interest_difference: Math.round(interestDifference * 100) / 100,
    recommendation
  };
}
