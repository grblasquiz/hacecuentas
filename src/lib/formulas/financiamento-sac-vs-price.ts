/**
 * Comparador SAC vs PRICE — Financiamento imobiliário Brasil 2026
 * SAC: parcela decrescente (amortização constante) — juros totais menores.
 * PRICE: parcela fixa (amortização crescente) — juros totais maiores.
 * Entrada: valor financiado, taxa mensal e prazo em meses.
 */

export interface Inputs {
  valorFinanciado: number | string;
  taxaAnual: number | string;
  prazoMeses: number | string;
}

export interface Outputs {
  parcelaInicialSac: string;
  parcelaFinalSac: string;
  totalJurosSac: string;
  parcelaFixaPrice: string;
  totalJurosPrice: string;
  economiaJurosSac: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function financiamentoSacVsPrice(i: Inputs): Outputs {
  const pv = Number(i.valorFinanciado) || 0;
  const taxaAnual = Number(i.taxaAnual) || 0;
  const n = Math.round(Number(i.prazoMeses) || 0);

  if (pv <= 0 || n <= 0 || taxaAnual <= 0) {
    throw new Error('Informe valor financiado, taxa anual e prazo em meses válidos.');
  }

  // Converte taxa anual efetiva em mensal
  const im = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  // SAC: amortização constante
  const amort = pv / n;
  let saldoSac = pv;
  let totalJurosSac = 0;
  let parcelaInicialSac = 0;
  let parcelaFinalSac = 0;
  for (let k = 1; k <= n; k++) {
    const juros = saldoSac * im;
    const parcela = amort + juros;
    totalJurosSac += juros;
    if (k === 1) parcelaInicialSac = parcela;
    if (k === n) parcelaFinalSac = parcela;
    saldoSac -= amort;
  }

  // PRICE: parcela constante
  const parcelaPrice = (pv * im) / (1 - Math.pow(1 + im, -n));
  const totalJurosPrice = parcelaPrice * n - pv;

  const economia = totalJurosPrice - totalJurosSac;

  return {
    parcelaInicialSac: brl(parcelaInicialSac),
    parcelaFinalSac: brl(parcelaFinalSac),
    totalJurosSac: brl(totalJurosSac),
    parcelaFixaPrice: brl(parcelaPrice),
    totalJurosPrice: brl(totalJurosPrice),
    economiaJurosSac: brl(economia),
    resumen: `Em ${n} meses a ${taxaAnual}% aa: SAC começa em ${brl(parcelaInicialSac)} e termina em ${brl(parcelaFinalSac)} (juros totais ${brl(totalJurosSac)}). PRICE fica fixo em ${brl(parcelaPrice)} (juros totais ${brl(totalJurosPrice)}). SAC economiza ${brl(economia)} em juros.`,
  };
}
