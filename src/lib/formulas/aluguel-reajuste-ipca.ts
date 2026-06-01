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
  _insight?: any;
  _chart?: any;
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

  const tone = ipca > 6 ? 'warn' : ipca < 0 ? 'good' : 'neutral';
  return {
    aluguelAtual: brl(atual),
    indiceAplicado: indice,
    percentualReajuste: ipca.toFixed(2) + '%',
    valorReajuste: brl(valorReajuste),
    novoAluguel: brl(novoAluguel),
    aumentoAnual: brl(aumentoAno),
    resumen: `Aluguel de ${brl(atual)} reajustado por ${indice} (${ipca.toFixed(2)}%) = ${brl(novoAluguel)}. Aumento mensal ${brl(valorReajuste)} (impacto anual ${brl(aumentoAno)}).`,
    _insight: {
      title: ipca < 0 ? 'Reajuste negativo: você paga menos' : 'O que o reajuste pesa no bolso',
      text: ipca < 0
        ? `Com ${indice} de **${ipca.toFixed(2)}%**, o aluguel cai para **${brl(novoAluguel)}**, uma redução de ${brl(Math.abs(valorReajuste))}/mês. Deflação no índice é rara, então confirme o número oficial antes de renegociar.`
        : `O reajuste de **${ipca.toFixed(2)}%** pelo ${indice} eleva o aluguel para **${brl(novoAluguel)}**: são **${brl(valorReajuste)}** a mais por mês e **${brl(aumentoAno)}** ao longo do ano.${ipca > 6 ? ' Acima de 6% já dói no orçamento — vale comparar com o IGP-M e negociar.' : ''}`,
      tone,
      icon: ipca < 0 ? '📉' : '🏠',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Aluguel atual', value: Number(atual.toFixed(2)) },
        { label: 'Reajuste', value: Number(valorReajuste.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(novoAluguel),
      centerLabel: 'Novo aluguel',
      ariaLabel: `Novo aluguel de ${brl(novoAluguel)} composto pelo valor atual ${brl(atual)} mais reajuste de ${brl(valorReajuste)}.`,
    },
  };
}
