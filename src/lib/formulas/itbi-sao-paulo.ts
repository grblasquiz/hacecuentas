/**
 * ITBI São Paulo Capital 2026 — 3% sobre o maior entre:
 *  - valor da transação (escritura)
 *  - valor venal de referência da Prefeitura (Decreto 51.627/2010)
 * Base legal: Lei Municipal 11.154/1991 + Decreto 51.357/2010.
 */

export interface Inputs {
  valorVenda: number | string;
  valorVenalReferencia: number | string;
  isencao: string; // 'nenhuma' | 'primeiro-imovel' | 'mcmv'
}

export interface Outputs {
  baseCalculo: string;
  aliquota: string;
  itbiDevido: string;
  isencaoAplicada: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function itbiSaoPaulo(i: Inputs): Outputs {
  const venda = Number(i.valorVenda) || 0;
  const venalRef = Number(i.valorVenalReferencia) || 0;
  const isencao = String(i.isencao || 'nenhuma');

  if (venda <= 0) {
    throw new Error('Informe o valor da venda do imóvel.');
  }

  const base = Math.max(venda, venalRef);
  const aliquota = 0.03;
  let itbi = base * aliquota;
  let isencaoTexto = 'Nenhuma';

  if (isencao === 'mcmv') {
    // MCMV faixa 1 e 2: desconto parcial possível (regra municipal — 50% em SP)
    itbi = itbi * 0.5;
    isencaoTexto = 'MCMV faixa 1/2 — redução 50% (verificar enquadramento)';
  } else if (isencao === 'primeiro-imovel') {
    isencaoTexto = 'Primeiro imóvel não tem isenção automática em SP — verificar condições';
  }

  return {
    baseCalculo: brl(base),
    aliquota: '3,0%',
    itbiDevido: brl(itbi),
    isencaoAplicada: isencaoTexto,
    resumen: `ITBI-SP: 3% sobre ${brl(base)} (maior entre venda ${brl(venda)} e valor venal de referência ${brl(venalRef)}) = ${brl(itbi)}.`,
  };
}
