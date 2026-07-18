// ITCMD São Paulo — imposto sobre herança (causa mortis) e doação.
// Alíquota fixa de 4% (Lei 10.705/2000), mantida em 2026. Isenções em UFESP
// (UFESP 2026 = R$ 38,42): doação isenta até 2.500 UFESP/ano por doador-donatário;
// herança com imóvel único isenta até 2.500 UFESP. Acima do limite, o imposto
// incide sobre o VALOR TOTAL (não só sobre o excedente).

import { ITCMD_SP, UFESP_2026 } from '../data/brasil-2026';

export interface Inputs {
  valorBem: number;         // valor de mercado do bem/quinhão (por herdeiro/donatário)
  tipoTransmissao?: string; // heranca | doacao
}

export interface Outputs {
  itcmd: string;
  aliquota: string;
  baseCalculo: string;
  situacaoIsencao: string;
  limiteIsencao: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorBem) || 0);
  const tipo = String(i.tipoTransmissao || 'heranca').toLowerCase() === 'doacao' ? 'doacao' : 'heranca';

  const limiteUfesp = tipo === 'doacao' ? ITCMD_SP.isencaoDoacaoUfesp : ITCMD_SP.isencaoHerancaImovelUnicoUfesp;
  const limiteReais = Math.round(limiteUfesp * UFESP_2026 * 100) / 100;

  const isento = valor <= limiteReais;
  const itcmd = isento ? 0 : valor * ITCMD_SP.aliquota;

  const situacao = isento
    ? `Isento (dentro de ${limiteUfesp.toLocaleString('pt-BR')} UFESPs = ${brl(limiteReais)})`
    : `Tributável — 4% sobre o valor total`;

  const detalhe = isento
    ? `${tipo === 'doacao' ? 'Doação' : 'Herança'} de ${brl(valor)} está dentro do limite de isenção de ` +
      `${limiteUfesp.toLocaleString('pt-BR')} UFESPs (${brl(limiteReais)}, UFESP 2026 = ${brl(UFESP_2026)}). ITCMD = R$ 0,00.`
    : `${tipo === 'doacao' ? 'Doação' : 'Herança'} de ${brl(valor)} acima do limite de isenção (${brl(limiteReais)}). ` +
      `ITCMD = 4% × ${brl(valor)} = ${brl(itcmd)} (incide sobre o valor total, não só sobre o excedente).`;

  return {
    itcmd: brl(itcmd),
    aliquota: '4%',
    baseCalculo: brl(valor),
    situacaoIsencao: situacao,
    limiteIsencao: `${limiteUfesp.toLocaleString('pt-BR')} UFESPs (${brl(limiteReais)})`,
    detalhe,
    _insight: {
      title: isento ? 'Isento de ITCMD' : `ITCMD: ${brl(itcmd)}`,
      text: isento
        ? `Essa ${tipo === 'doacao' ? 'doação' : 'transmissão'} de **${brl(valor)}** fica **dentro da faixa de isenção** (${limiteUfesp.toLocaleString('pt-BR')} UFESPs = ${brl(limiteReais)} em 2026). Não há ITCMD a pagar.`
        : `Sobre **${brl(valor)}**, o ITCMD-SP de **4%** resulta em **${brl(itcmd)}**. Atenção: acima do limite de isenção, o imposto incide sobre o **valor total**, não apenas sobre o que passou de ${brl(limiteReais)}.`,
      tone: isento ? 'good' : 'warn',
      icon: '🏛️',
    },
    _chart: isento
      ? undefined
      : {
          type: 'doughnut',
          slices: [
            { label: 'ITCMD (4%)', value: Number(itcmd.toFixed(2)) },
            { label: 'Valor líquido', value: Number((valor - itcmd).toFixed(2)) },
          ],
          prefix: 'R$ ',
          centerValue: brl(itcmd),
          centerLabel: 'ITCMD',
          ariaLabel: `De ${brl(valor)}, o ITCMD de 4% é ${brl(itcmd)}.`,
        },
  };
}
