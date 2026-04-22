/**
 * Tesouro Selic (LFT) — rentabilidade líquida 2026.
 * Taxa Selic anual - taxa custódia B3 (0,2% aa) - IR regressivo sobre rendimento.
 * Fontes: Tesouro Direto, B3, Receita Federal IN 1.585/2015.
 */

export interface Inputs {
  aporte: number | string;
  selicAnual: number | string;   // % aa
  meses: number | string;
  taxaCustodia?: number | string; // % aa, default 0.2
}

export interface Outputs {
  valorBruto: string;
  rendimentoBruto: string;
  custodiaB3: string;
  aliquotaIr: string;
  impostoIr: string;
  valorLiquido: string;
  rendimentoLiquido: string;
  rentabilidadeAnualLiquida: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function aliquotaIR(meses: number): number {
  const dias = meses * 30;
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.20;
  if (dias <= 720) return 0.175;
  return 0.15;
}

export function tesouroSelic(i: Inputs): Outputs {
  const aporte = Number(i.aporte) || 0;
  const selic = Number(i.selicAnual) || 0;
  const meses = Number(i.meses) || 0;
  const custodia = Number(i.taxaCustodia ?? 0.2) || 0;

  if (aporte <= 0) throw new Error('Informe um aporte válido.');
  if (selic <= 0) throw new Error('Informe a taxa Selic anual (%).');
  if (meses <= 0) throw new Error('Informe o prazo em meses.');

  const taxaLiquidaCustodia = selic / 100 - custodia / 100;
  const taxaMensal = Math.pow(1 + selic / 100, 1 / 12) - 1;
  const valorBrutoSemCustodia = aporte * Math.pow(1 + taxaMensal, meses);
  const anos = meses / 12;
  const custodiaValor = (aporte + valorBrutoSemCustodia) / 2 * (custodia / 100) * anos; // aproximação linear
  const valorBruto = valorBrutoSemCustodia - custodiaValor;
  const rendimentoBruto = valorBruto - aporte;
  const aliq = aliquotaIR(meses);
  const imposto = Math.max(0, rendimentoBruto) * aliq;
  const valorLiquido = valorBruto - imposto;
  const rendLiquido = valorLiquido - aporte;
  const rentAnualLiq = (Math.pow(valorLiquido / aporte, 1 / anos) - 1) * 100;

  return {
    valorBruto: brl(valorBruto),
    rendimentoBruto: brl(rendimentoBruto),
    custodiaB3: brl(custodiaValor),
    aliquotaIr: (aliq * 100).toFixed(1) + '%',
    impostoIr: brl(imposto),
    valorLiquido: brl(valorLiquido),
    rendimentoLiquido: brl(rendLiquido),
    rentabilidadeAnualLiquida: rentAnualLiq.toFixed(2) + '% aa',
    resumen: `Tesouro Selic: aporte ${brl(aporte)} a ${selic}% aa por ${meses} meses rende ${brl(rendLiquido)} líquido após custódia B3 (${custodia}%) e IR (${(aliq * 100).toFixed(1)}%).`,
  };
}
