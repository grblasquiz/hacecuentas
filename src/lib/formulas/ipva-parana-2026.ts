// IPVA Paraná 2026 — base de cálculo: valor venal (tabela FIPE).
// Em 2026 o Paraná reduziu a alíquota de automóveis de 3,5% para 1,9% (queda de
// 45%), a menor do Brasil. Motos, caminhões e ônibus: 1%. Locadoras: 0,5%.
// Fonte: Governo do Paraná / DETRAN-PR.

import { IPVA_PR_ALIQUOTAS } from '../data/brasil-2026';

export interface Inputs {
  valorFipe: number;
  tipoVeiculo?: string; // auto | moto | caminhao | onibus | locadora
}

export interface Outputs {
  aliquota: string;
  ipvaAnual: string;
  parcela: string;
  economiaVsAntigo: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const valorFipe = Number(i.valorFipe) || 0;
  const tipo = String(i.tipoVeiculo || 'auto').toLowerCase();
  if (valorFipe <= 0) throw new Error('Informe o valor FIPE do veículo.');

  const aliquota = IPVA_PR_ALIQUOTAS[tipo] ?? IPVA_PR_ALIQUOTAS.auto;
  const ipvaAnual = valorFipe * (aliquota / 100);
  const parcela = ipvaAnual / 6; // PR permite parcelar (até 6x)

  // Comparação com a alíquota antiga de autos (3,5%) — só faz sentido para autos.
  const ipvaAntigo = tipo === 'auto' ? valorFipe * 0.035 : ipvaAnual;
  const economia = ipvaAntigo - ipvaAnual;

  const detalhe =
    `IPVA PR 2026 = valor FIPE ${brl(valorFipe)} × ${aliquota.toLocaleString('pt-BR')}% = ${brl(ipvaAnual)}. ` +
    (tipo === 'auto'
      ? `Com a alíquota antiga de 3,5% seria ${brl(ipvaAntigo)} — economia de ${brl(economia)} pela redução para 1,9%. `
      : '') +
    `Pode ser parcelado em até 6x de ${brl(parcela)}.`;

  return {
    aliquota: `${aliquota.toLocaleString('pt-BR')}%`,
    ipvaAnual: brl(ipvaAnual),
    parcela: brl(parcela),
    economiaVsAntigo: tipo === 'auto' ? brl(economia) : '—',
    detalhe,
    _insight: {
      title: `IPVA 2026 no PR: ${brl(ipvaAnual)}`,
      text:
        `Sobre o valor FIPE de **${brl(valorFipe)}**, a alíquota de **${aliquota.toLocaleString('pt-BR')}%** gera um IPVA de **${brl(ipvaAnual)}** no ano` +
        (tipo === 'auto'
          ? `. Com a queda de 3,5% para 1,9%, você economiza **${brl(economia)}** em relação a 2025.`
          : `.`),
      tone: 'good',
      icon: '🚗',
    },
    _chart:
      tipo === 'auto'
        ? {
            type: 'bar',
            labels: ['Alíquota antiga (3,5%)', 'Alíquota 2026 (1,9%)'],
            values: [Math.round(ipvaAntigo * 100) / 100, Math.round(ipvaAnual * 100) / 100],
            prefix: 'R$ ',
            ariaLabel: `Com 3,5% o IPVA seria ${brl(ipvaAntigo)}; com 1,9% em 2026 é ${brl(ipvaAnual)}.`,
          }
        : undefined,
  };
}
