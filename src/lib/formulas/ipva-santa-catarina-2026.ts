// IPVA Santa Catarina 2026 — base de cálculo: valor venal (tabela FIPE).
// Alíquotas: 2% para automóveis de passeio e utilitários; 1% para motocicletas,
// caminhões, ônibus, micro-ônibus, veículos de carga e locadoras.
// Fonte: SEF-SC (Secretaria de Estado da Fazenda de Santa Catarina).

import { IPVA_SC_ALIQUOTAS } from '../data/brasil-2026';

export interface Inputs {
  valorFipe: number;
  tipoVeiculo?: string; // auto | utilitario | moto | caminhao | onibus | locadora
}

export interface Outputs {
  aliquota: string;
  ipvaAnual: string;
  parcela: string;
  descontoCota: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const valorFipe = Number(i.valorFipe) || 0;
  const tipo = String(i.tipoVeiculo || 'auto').toLowerCase();
  if (valorFipe <= 0) throw new Error('Informe o valor FIPE do veículo.');

  const aliquota = IPVA_SC_ALIQUOTAS[tipo] ?? IPVA_SC_ALIQUOTAS.auto;
  const ipvaAnual = valorFipe * (aliquota / 100);
  const parcela = ipvaAnual / 3; // SC permite parcelar (até 3x) sem desconto

  const detalhe =
    `IPVA SC 2026 = valor FIPE ${brl(valorFipe)} × ${aliquota.toLocaleString('pt-BR')}% = ${brl(ipvaAnual)}. ` +
    `Pode ser pago em cota única ou parcelado em até 3x de ${brl(parcela)}, conforme o calendário da SEF-SC.`;

  return {
    aliquota: `${aliquota.toLocaleString('pt-BR')}%`,
    ipvaAnual: brl(ipvaAnual),
    parcela: brl(parcela),
    descontoCota: 'Cota única ou até 3x',
    detalhe,
    _insight: {
      title: `IPVA 2026 em SC: ${brl(ipvaAnual)}`,
      text: `Sobre o valor FIPE de **${brl(valorFipe)}**, a alíquota de **${aliquota.toLocaleString('pt-BR')}%** gera um IPVA de **${brl(ipvaAnual)}** no ano. Você pode pagar em cota única ou parcelar em até 3x de ${brl(parcela)}.`,
      tone: 'warn',
      icon: '🚗',
    },
    _chart: {
      type: 'bar',
      labels: ['Cota 1', 'Cota 2', 'Cota 3'],
      values: [Math.round(parcela * 100) / 100, Math.round(parcela * 100) / 100, Math.round(parcela * 100) / 100],
      prefix: 'R$ ',
      ariaLabel: `IPVA de ${brl(ipvaAnual)} parcelado em 3 cotas de ${brl(parcela)}.`,
    },
  };
}
