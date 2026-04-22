/**
 * Reajuste anual de aluguel pelo IPCA — Lei do Inquilinato (Lei 8.245/1991).
 * Fórmula: novo_aluguel = aluguel_atual × (1 + IPCA_12m).
 * IPCA padrão é o indicador mais comum desde 2020 (antes era IGP-M).
 */

export interface Inputs {
  aluguelAtual: number | string;
  ipcaAcumulado12m: number | string; // % acumulado em 12 meses
  indice: string; // 'ipca' | 'igpm'
}

export interface Outputs {
  aluguelAtual: string;
  indiceAplicado: string;
  percentualReajuste: string;
  valorReajuste: string;
  novoAluguel: string;
  aumentoAnual: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function aluguelReajusteIpca(i: Inputs): Outputs {
  const atual = Number(i.aluguelAtual) || 0;
  const ipca = Number(i.ipcaAcumulado12m) || 0;
  const indice = String(i.indice || 'ipca').toUpperCase();

  if (atual <= 0) {
    throw new Error('Informe o valor atual do aluguel.');
  }
  if (ipca < -50 || ipca > 100) {
    throw new Error('Percentual de reajuste fora de faixa razoável (-50% a 100%).');
  }

  const fator = 1 + ipca / 100;
  const novoAluguel = atual * fator;
  const valorReajuste = novoAluguel - atual;
  const aumentoAno = valorReajuste * 12;

  return {
    aluguelAtual: brl(atual),
    indiceAplicado: indice,
    percentualReajuste: ipca.toFixed(2) + '%',
    valorReajuste: brl(valorReajuste),
    novoAluguel: brl(novoAluguel),
    aumentoAnual: brl(aumentoAno),
    resumen: `Aluguel de ${brl(atual)} reajustado por ${indice} (${ipca.toFixed(2)}%) = ${brl(novoAluguel)}. Aumento mensal ${brl(valorReajuste)} (impacto anual ${brl(aumentoAno)}).`,
  };
}
