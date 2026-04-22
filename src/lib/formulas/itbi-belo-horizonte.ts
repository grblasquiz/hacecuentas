/**
 * ITBI Belo Horizonte 2026 — alíquota 3%.
 * Base legal: Lei Municipal 5.492/1988 + Decreto Municipal 17.191/2019.
 * Base de cálculo: maior entre valor da transação e valor venal do ITBI (tabela PBH).
 */

export interface Inputs {
  valorVenda: number | string;
  valorVenalItbi: number | string;
  financiadoSfh: string; // 'sim' ou 'nao'
}

export interface Outputs {
  baseCalculo: string;
  aliquota: string;
  itbiDevido: string;
  detalheSfh: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function itbiBeloHorizonte(i: Inputs): Outputs {
  const venda = Number(i.valorVenda) || 0;
  const venal = Number(i.valorVenalItbi) || 0;
  const sfh = String(i.financiadoSfh || 'nao') === 'sim';

  if (venda <= 0) {
    throw new Error('Informe o valor da venda do imóvel.');
  }

  const base = Math.max(venda, venal);
  let itbi: number;
  let detalheSfh = 'Não aplicável';

  if (sfh) {
    // SFH em BH: 0,5% sobre parte financiada, 3% sobre parte livre (estimativa 80/20)
    const partFinan = base * 0.8;
    const partLivre = base * 0.2;
    itbi = partFinan * 0.005 + partLivre * 0.03;
    detalheSfh = `SFH: 0,5% sobre ${brl(partFinan)} (financiada) + 3% sobre ${brl(partLivre)} (livre)`;
  } else {
    itbi = base * 0.03;
  }

  return {
    baseCalculo: brl(base),
    aliquota: sfh ? '0,5% (SFH) / 3% (livre)' : '3,0%',
    itbiDevido: brl(itbi),
    detalheSfh,
    resumen: `ITBI-BH: ${sfh ? 'alíquota mista SFH' : '3%'} sobre ${brl(base)} (maior entre venda ${brl(venda)} e valor venal ITBI ${brl(venal)}) = ${brl(itbi)}.`,
  };
}
