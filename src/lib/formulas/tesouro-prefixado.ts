/**
 * Tesouro Prefixado (LTN) — rentabilidade até o vencimento.
 * Taxa fixa contratada no momento da compra. IR regressivo. Custódia B3 0,2% aa.
 */

export interface Inputs {
  aporte: number | string;
  taxaPrefixada: number | string; // % aa
  meses: number | string;
  taxaCustodia?: number | string;
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

export function tesouroPrefixado(i: Inputs): Outputs {
  const aporte = Number(i.aporte) || 0;
  const taxa = Number(i.taxaPrefixada) || 0;
  const meses = Number(i.meses) || 0;
  const custodia = Number(i.taxaCustodia ?? 0.2) || 0;

  if (aporte <= 0) throw new Error('Informe um aporte válido.');
  if (taxa <= 0) throw new Error('Informe a taxa prefixada anual (%).');
  if (meses <= 0) throw new Error('Informe o prazo em meses.');

  const taxaMensal = Math.pow(1 + taxa / 100, 1 / 12) - 1;
  const valorSemCust = aporte * Math.pow(1 + taxaMensal, meses);
  const anos = meses / 12;
  const custodiaValor = (aporte + valorSemCust) / 2 * (custodia / 100) * anos;
  const valorBruto = valorSemCust - custodiaValor;
  const rendBruto = valorBruto - aporte;
  const aliq = aliquotaIR(meses);
  const imposto = Math.max(0, rendBruto) * aliq;
  const valorLiquido = valorBruto - imposto;
  const rendLiquido = valorLiquido - aporte;
  const rentAnualLiq = (Math.pow(valorLiquido / aporte, 1 / anos) - 1) * 100;

  return {
    valorBruto: brl(valorBruto),
    rendimentoBruto: brl(rendBruto),
    custodiaB3: brl(custodiaValor),
    aliquotaIr: (aliq * 100).toFixed(1) + '%',
    impostoIr: brl(imposto),
    valorLiquido: brl(valorLiquido),
    rendimentoLiquido: brl(rendLiquido),
    rentabilidadeAnualLiquida: rentAnualLiq.toFixed(2) + '% aa',
    resumen: `Tesouro Prefixado ${taxa}% aa por ${meses} meses: ${brl(valorLiquido)} líquido (rentabilidade ${rentAnualLiq.toFixed(2)}% aa após IR e custódia).`,
  };
}
