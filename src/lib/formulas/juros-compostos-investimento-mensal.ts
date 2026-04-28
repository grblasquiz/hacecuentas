export interface Inputs {
  initial_capital: number;
  monthly_contribution: number;
  annual_rate: number;
  years: number;
  compound_frequency: string;
  preset: string;
}

export interface Outputs {
  final_amount: number;
  total_invested: number;
  total_interest: number;
  return_ratio: number;
  effective_rate_label: string;
  yearly_breakdown: string;
}

// Taxas de referência 2026 — Fonte: BACEN / Tesouro Nacional
const PRESET_RATES: Record<string, number> = {
  selic: 11.0,       // Selic meta jan/2026 — BACEN
  cdb110: 12.1,      // 110% CDI, CDI ≈ Selic − 0.10% → 10.9% × 1.10 = 11.99% ≈ 12.10%
  poupanca: 6.17,    // 70% Selic quando Selic > 8.5% — Lei 12.703/2012
  tesouro_ipca: 11.28 // IPCA 4.78% projetado + taxa real 6.50% — Tesouro Nacional 2026
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function compute(i: Inputs): Outputs {
  const initialCapital = Number(i.initial_capital) || 0;
  const monthlyContribution = Number(i.monthly_contribution) || 0;
  const years = Math.max(1, Math.min(Number(i.years) || 0, 50));
  const compoundFrequency = i.compound_frequency === "annual" ? "annual" : "monthly";
  const preset = i.preset || "custom";

  // Determinar taxa anual efetiva
  let annualRatePercent: number;
  let rateLabel: string;

  if (preset !== "custom" && PRESET_RATES[preset] !== undefined) {
    annualRatePercent = PRESET_RATES[preset];
    const presetNames: Record<string, string> = {
      selic: "Selic 2026",
      cdb110: "CDB 110% CDI",
      poupanca: "Poupança",
      tesouro_ipca: "Tesouro IPCA+ (estimado)"
    };
    rateLabel = `${presetNames[preset] || preset} — ${annualRatePercent.toFixed(2)}% a.a.`;
  } else {
    annualRatePercent = Number(i.annual_rate) || 0;
    rateLabel = `Taxa personalizada — ${annualRatePercent.toFixed(2)}% a.a.`;
  }

  if (annualRatePercent < 0) {
    return {
      final_amount: 0,
      total_invested: 0,
      total_interest: 0,
      return_ratio: 0,
      effective_rate_label: "Taxa inválida. Insira um valor maior ou igual a zero.",
      yearly_breakdown: ""
    };
  }

  if (initialCapital < 0 || monthlyContribution < 0) {
    return {
      final_amount: 0,
      total_invested: 0,
      total_interest: 0,
      return_ratio: 0,
      effective_rate_label: "Capital e aporte devem ser valores positivos.",
      yearly_breakdown: ""
    };
  }

  const annualRateDecimal = annualRatePercent / 100;

  let finalAmount = 0;
  let totalInvested = 0;
  const yearlyData: Array<{ year: number; amount: number; invested: number; interest: number }> = [];

  if (compoundFrequency === "monthly") {
    // Taxa mensal equivalente: i_m = (1 + i_a)^(1/12) - 1
    const monthlyRate = Math.pow(1 + annualRateDecimal, 1 / 12) - 1;
    const totalMonths = years * 12;

    // Calcular montante mês a mês para gerar breakdown anual
    let balance = initialCapital;
    let contributed = initialCapital;

    for (let month = 1; month <= totalMonths; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      contributed += monthlyContribution;

      if (month % 12 === 0) {
        const currentYear = month / 12;
        yearlyData.push({
          year: currentYear,
          amount: balance,
          invested: contributed,
          interest: balance - contributed
        });
      }
    }

    finalAmount = balance;
    totalInvested = contributed;

  } else {
    // Capitalização anual
    const i = annualRateDecimal;
    // Aportes mensais convertidos para valor futuro anual
    // Valor futuro dos aportes mensais ao longo de um ano, capitalizados anualmente:
    // Aproximação: aportar PMT*12 no final do ano
    // Fórmula exata para aportes mensais com capitalização anual:
    // M = C*(1+i)^n + PMT*12*[(1+i)^n - 1]/i
    const annualContribution = monthlyContribution * 12;
    let balance = initialCapital;
    let contributed = initialCapital;

    for (let year = 1; year <= years; year++) {
      balance = balance * (1 + i) + annualContribution;
      contributed += annualContribution;
      yearlyData.push({
        year,
        amount: balance,
        invested: contributed,
        interest: balance - contributed
      });
    }

    finalAmount = balance;
    totalInvested = contributed;
  }

  const totalInterest = finalAmount - totalInvested;
  const returnRatio = totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0;

  // Montar tabela de evolução ano a ano
  let breakdownLines: string[] = [];
  breakdownLines.push("Ano | Montante | Total Investido | Juros Acumulados");
  breakdownLines.push("--- | --- | --- | ---");

  for (const row of yearlyData) {
    breakdownLines.push(
      `${row.year}° ano | R$ ${formatBRL(row.amount)} | R$ ${formatBRL(row.invested)} | R$ ${formatBRL(row.interest)}`
    );
  }

  const yearlyBreakdown = breakdownLines.join("\n");

  // Adicionar nota sobre taxa utilizada
  const effectiveRateNote = compoundFrequency === "monthly"
    ? `${rateLabel} | Capitalização mensal | Taxa mensal: ${((Math.pow(1 + annualRateDecimal, 1 / 12) - 1) * 100).toFixed(4)}% a.m.`
    : `${rateLabel} | Capitalização anual`;

  return {
    final_amount: Math.round(finalAmount * 100) / 100,
    total_invested: Math.round(totalInvested * 100) / 100,
    total_interest: Math.round(Math.max(0, totalInterest) * 100) / 100,
    return_ratio: Math.round(returnRatio * 100) / 100,
    effective_rate_label: effectiveRateNote,
    yearly_breakdown: yearlyBreakdown
  };
}
