/**
 * Cálculo do Rendimento Anual do FGTS 2026
 * Saldo × (TR + 3% ao ano). TR referencial 2026 ≈ 1,20% aa.
 * Distribuição de lucros pode adicionar variação. Fonte: Caixa/Conselho Curador FGTS.
 */

export interface Inputs {
  saldoFgts: number | string;
  trAnual?: number | string;
}

export interface Outputs {
  rendimentoAnual: string;
  rendimentoMensal: string;
  saldoFinal: string;
  taxaTotal: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fgtsRendimentoAnual(i: Inputs): Outputs {
  const saldo = Number(i.saldoFgts) || 0;
  const tr = i.trAnual !== undefined && i.trAnual !== '' ? Number(i.trAnual) : 1.20;

  if (saldo <= 0) {
    throw new Error('Informe um saldo de FGTS válido (maior que zero).');
  }

  const taxaTotal = (tr / 100) + 0.03;
  const rendimento = saldo * taxaTotal;
  const rendimentoMensal = rendimento / 12;
  const saldoFinal = saldo + rendimento;

  return {
    rendimentoAnual: brl(rendimento),
    rendimentoMensal: brl(rendimentoMensal),
    saldoFinal: brl(saldoFinal),
    taxaTotal: (taxaTotal * 100).toFixed(2).replace('.', ',') + '%',
    resumen: `Saldo de ${brl(saldo)} rende aproximadamente ${brl(rendimento)} no ano (TR ${tr.toString().replace('.', ',')}% + 3% aa = ${(taxaTotal * 100).toFixed(2).replace('.', ',')}% aa).`,
  };
}
