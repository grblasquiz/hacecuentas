export interface Inputs {
  vehicle_value: number;
  down_payment: number;
  term_months: string;
  monthly_rate: number;
  iof_rate: number;
  compare_consortium: string;
  consortium_admin_rate: number;
}

export interface Outputs {
  monthly_payment: number;
  total_paid: number;
  total_interest: number;
  cet_annual: number;
  consortium_monthly: number;
  consortium_total: number;
  savings_vs_consortium: string;
  summary: string;
}

// Taxa IOF diária padrão para CDC/crédito pessoal (Decreto 6.306/2007)
const IOF_DAILY_RATE = 0.000082; // 0,0082% ao dia
// Alíquota adicional fixa de IOF
const IOF_FIXED_RATE = 0.0038; // 0,38%

/**
 * Calcula a prestação pela Tabela Price (sistema francês)
 * PMT = PV * [i*(1+i)^n] / [(1+i)^n - 1]
 */
function calcPrice(pv: number, monthlyRate: number, n: number): number {
  if (pv <= 0 || n <= 0) return 0;
  if (monthlyRate === 0) return pv / n;
  const factor = Math.pow(1 + monthlyRate, n);
  return pv * (monthlyRate * factor) / (factor - 1);
}

/**
 * Calcula o IOF sobre o valor financiado para um prazo em meses
 * IOF = PV * (IOF_DAILY_RATE * dias + IOF_FIXED_RATE)
 * dias = prazo_meses * 30, limitado a 365
 */
function calcIOF(pv: number, termMonths: number): number {
  const dias = Math.min(termMonths * 30, 365);
  return pv * (IOF_DAILY_RATE * dias + IOF_FIXED_RATE);
}

/**
 * Estima o CET mensal usando Newton-Raphson (TIR das parcelas)
 * Resolve: PV_com_iof = sum(PMT / (1+r)^t) para t=1..n
 */
function calcCETMonthly(pvWithIOF: number, pmt: number, n: number): number {
  if (pvWithIOF <= 0 || pmt <= 0 || n <= 0) return 0;
  // Chute inicial: taxa nominal mensal
  let r = pmt / pvWithIOF - 1 / n;
  if (r <= 0) r = 0.01;
  for (let iter = 0; iter < 100; iter++) {
    let f = 0;
    let df = 0;
    for (let t = 1; t <= n; t++) {
      const disc = Math.pow(1 + r, t);
      f += pmt / disc;
      df += -t * pmt / (disc * (1 + r));
    }
    f -= pvWithIOF;
    const delta = f / df;
    r -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return r > 0 ? r : 0;
}

export function compute(i: Inputs): Outputs {
  const vehicleValue = Number(i.vehicle_value) || 0;
  const downPayment = Number(i.down_payment) || 0;
  const termMonths = parseInt(i.term_months || "48", 10);
  const monthlyRatePct = Number(i.monthly_rate) || 1.8;
  // IOF: usa o campo do usuário se fornecido; senão calcula automaticamente
  const iofRateUser = Number(i.iof_rate);
  const compareConsortium = i.compare_consortium === "yes";
  const consortiumAdminRate = Number(i.consortium_admin_rate) || 18;

  // Validações básicas
  if (vehicleValue <= 0) {
    return {
      monthly_payment: 0,
      total_paid: 0,
      total_interest: 0,
      cet_annual: 0,
      consortium_monthly: 0,
      consortium_total: 0,
      savings_vs_consortium: "Informe o valor do veículo.",
      summary: "Informe o valor do veículo para calcular.",
    };
  }

  const effectiveDown = Math.min(downPayment, vehicleValue);
  const financedValue = vehicleValue - effectiveDown;

  if (financedValue <= 0) {
    return {
      monthly_payment: 0,
      total_paid: effectiveDown,
      total_interest: 0,
      cet_annual: 0,
      consortium_monthly: 0,
      consortium_total: 0,
      savings_vs_consortium: "Entrada cobre o valor total do veículo — sem financiamento necessário.",
      summary: "Entrada cobre 100% do valor. Nenhum financiamento necessário.",
    };
  }

  const monthlyRate = monthlyRatePct / 100;
  const n = termMonths;

  // Cálculo da prestação Price sobre o valor financiado (sem IOF na parcela)
  const pmt = calcPrice(financedValue, monthlyRate, n);
  const totalPaid = pmt * n;
  const totalInterest = totalPaid - financedValue;

  // IOF: se o usuário informou uma alíquota manual, usa ela; caso contrário calcula pelo decreto
  let iofAmount: number;
  if (iofRateUser > 0) {
    iofAmount = financedValue * (iofRateUser / 100);
  } else {
    iofAmount = calcIOF(financedValue, n);
  }

  // PV total com IOF para cálculo do CET
  const pvWithIOF = financedValue + iofAmount;

  // CET mensal via Newton-Raphson; CET a.a. = (1 + r_mensal)^12 - 1
  const cetMonthly = calcCETMonthly(pvWithIOF, pmt, n);
  const cetAnnual = (Math.pow(1 + cetMonthly, 12) - 1) * 100;

  // ---- Consórcio ----
  let consortiumMonthly = 0;
  let consortiumTotal = 0;
  let savingsText = "";

  if (compareConsortium) {
    // Parcela consórcio = valor do veículo * (1 + taxa_adm/100 + fundo_reserva) / n
    // Fundo de reserva típico: 2%
    const FUNDO_RESERVA = 0.02;
    const adminFraction = consortiumAdminRate / 100;
    consortiumTotal = vehicleValue * (1 + adminFraction + FUNDO_RESERVA);
    consortiumMonthly = consortiumTotal / n;

    const diff = totalPaid - consortiumTotal;
    if (diff > 0) {
      savingsText = `O consórcio custa R$ ${diff.toFixed(2).replace(".", ",")} a menos no total, mas sem garantia de entrega imediata do veículo.`;
    } else if (diff < 0) {
      savingsText = `O CDC custa R$ ${Math.abs(diff).toFixed(2).replace(".", ",")} a menos no total — verifique as condições do consórcio.`;
    } else {
      savingsText = "CDC e consórcio têm custo total equivalente nesta simulação.";
    }
  } else {
    savingsText = "Comparação com consórcio desativada.";
  }

  // Resumo textual
  const annualRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  const summary =
    `Veículo R$ ${vehicleValue.toLocaleString("pt-BR")}, entrada R$ ${effectiveDown.toLocaleString("pt-BR")}, ` +
    `financiado R$ ${financedValue.toLocaleString("pt-BR")} em ${n}x de R$ ${pmt.toFixed(2).replace(".", ",")}. ` +
    `Taxa: ${monthlyRatePct.toFixed(2).replace(".", ",")}% a.m. (~${annualRate.toFixed(1).replace(".", ",")}% a.a.). ` +
    `CET ≈ ${cetAnnual.toFixed(1).replace(".", ",")}% a.a. | Juros totais: R$ ${totalInterest.toFixed(2).replace(".", ",")}.`;

  return {
    monthly_payment: Math.round(pmt * 100) / 100,
    total_paid: Math.round(totalPaid * 100) / 100,
    total_interest: Math.round(totalInterest * 100) / 100,
    cet_annual: Math.round(cetAnnual * 100) / 100,
    consortium_monthly: Math.round(consortiumMonthly * 100) / 100,
    consortium_total: Math.round(consortiumTotal * 100) / 100,
    savings_vs_consortium: savingsText,
    summary,
  };
}
