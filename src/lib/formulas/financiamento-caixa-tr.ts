/**
 * Financiamento Caixa — Linha Poupança (TR + 3,0% aa + spread do banco)
 * Taxa nominal típica 2026: TR + 3,0% + spread (0,5% a 2,0%).
 * Usa Sistema de Amortização Constante (SAC) como padrão Caixa.
 */

export interface Inputs {
  valorImovel: number | string;
  entrada: number | string;
  prazoMeses: number | string;
  spread: number | string; // % aa adicional do banco
  tr: number | string; // estimativa anual da TR em % (padrão 2,0)
}

export interface Outputs {
  valorFinanciado: string;
  taxaEfetivaAnual: string;
  primeiraParcela: string;
  ultimaParcela: string;
  totalPago: string;
  totalJuros: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function financiamentoCaixaTr(i: Inputs): Outputs {
  const valor = Number(i.valorImovel) || 0;
  const entrada = Number(i.entrada) || 0;
  const n = Math.round(Number(i.prazoMeses) || 0);
  const spread = Number(i.spread) || 1.0;
  const tr = Number(i.tr) || 2.0;

  if (valor <= 0 || n <= 0) {
    throw new Error('Informe valor do imóvel e prazo válidos.');
  }
  const pv = valor - entrada;
  if (pv <= 0) {
    throw new Error('A entrada não pode ser maior ou igual ao valor do imóvel.');
  }

  // Caixa TR + 3,0% + spread
  const taxaAnual = tr + 3.0 + spread;
  const im = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  // SAC
  const amort = pv / n;
  let saldo = pv;
  let totalPago = 0;
  let primeira = 0;
  let ultima = 0;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * im;
    const parcela = amort + juros;
    totalPago += parcela;
    if (k === 1) primeira = parcela;
    if (k === n) ultima = parcela;
    saldo -= amort;
  }

  const totalJuros = totalPago - pv;

  return {
    valorFinanciado: brl(pv),
    taxaEfetivaAnual: taxaAnual.toFixed(2) + '% aa',
    primeiraParcela: brl(primeira),
    ultimaParcela: brl(ultima),
    totalPago: brl(totalPago),
    totalJuros: brl(totalJuros),
    resumen: `Linha Poupança Caixa a TR (${tr}%) + 3,0% + spread ${spread}% = ${taxaAnual.toFixed(2)}% aa. Em ${n} meses (SAC), 1ª parcela ${brl(primeira)}, última ${brl(ultima)}, juros totais ${brl(totalJuros)}.`,
  };
}
