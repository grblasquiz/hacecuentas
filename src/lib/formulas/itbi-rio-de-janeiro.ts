/**
 * ITBI Rio de Janeiro Capital 2026 — alíquota 2% (flat).
 * Base: maior entre valor da transação e valor venal cadastral.
 * Base legal: Lei Municipal 1.364/1988 + Decreto 36.000/2012.
 */

export interface Inputs {
  valorVenda: number | string;
  valorVenal: number | string;
  financiadoSfh: string; // 'sim' ou 'nao' — SFH tem alíquota 0,5% sobre parte financiada
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

export function itbiRioDeJaneiro(i: Inputs): Outputs {
  const venda = Number(i.valorVenda) || 0;
  const venal = Number(i.valorVenal) || 0;
  const sfh = String(i.financiadoSfh || 'nao') === 'sim';

  if (venda <= 0) {
    throw new Error('Informe o valor da venda do imóvel.');
  }

  const base = Math.max(venda, venal);
  let itbi: number;
  let detalheSfh = 'Não aplicável';

  if (sfh) {
    // SFH: parte financiada 0,5%, parte restante 2%. Estimativa: 80% financiado.
    const partFinan = base * 0.8;
    const partLivre = base * 0.2;
    itbi = partFinan * 0.005 + partLivre * 0.02;
    detalheSfh = `SFH: 0,5% sobre ${brl(partFinan)} (financiada) + 2% sobre ${brl(partLivre)} (livre)`;
  } else {
    itbi = base * 0.02;
  }

  return {
    baseCalculo: brl(base),
    aliquota: sfh ? '0,5% (SFH) / 2% (livre)' : '2,0%',
    itbiDevido: brl(itbi),
    detalheSfh,
    resumen: `ITBI-RJ: ${sfh ? 'alíquota mista SFH' : '2%'} sobre ${brl(base)} (maior entre venda ${brl(venda)} e valor venal ${brl(venal)}) = ${brl(itbi)}.`,
  };
}
