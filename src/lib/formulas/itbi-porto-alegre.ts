/**
 * ITBI Porto Alegre 2026 — alíquota 3% uniforme.
 * Base legal: Lei Complementar Municipal 197/1989 + Decreto 16.810/2010.
 * Base de cálculo: maior entre valor da transação e valor venal de referência (SMF).
 */

export interface Inputs {
  valorVenda: number | string;
  valorVenalReferencia: number | string;
  financiadoSfh: string;
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

export function itbiPortoAlegre(i: Inputs): Outputs {
  const venda = Number(i.valorVenda) || 0;
  const venal = Number(i.valorVenalReferencia) || 0;
  const sfh = String(i.financiadoSfh || 'nao') === 'sim';

  if (venda <= 0) {
    throw new Error('Informe o valor da venda do imóvel.');
  }

  const base = Math.max(venda, venal);
  let itbi: number;
  let detalheSfh = 'Não aplicável';

  if (sfh) {
    const partFinan = base * 0.8;
    const partLivre = base * 0.2;
    itbi = partFinan * 0.005 + partLivre * 0.03;
    detalheSfh = `SFH: 0,5% sobre ${brl(partFinan)} (financiada) + 3% sobre ${brl(partLivre)} (livre)`;
  } else {
    itbi = base * 0.03;
  }

  return {
    baseCalculo: brl(base),
    aliquota: sfh ? '0,5% (SFH) / 3% (livre)' : '3,0% uniforme',
    itbiDevido: brl(itbi),
    detalheSfh,
    resumen: `ITBI-POA: ${sfh ? 'alíquota mista SFH' : '3% uniforme'} sobre ${brl(base)} (maior entre venda ${brl(venda)} e valor venal ${brl(venal)}) = ${brl(itbi)}.`,
  };
}
