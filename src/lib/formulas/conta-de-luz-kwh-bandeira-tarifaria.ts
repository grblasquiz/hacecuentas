// Conta de luz — estimativa pelo consumo em kWh, tarifa e bandeira tarifária.
// total = consumo × tarifa (R$/kWh, já com impostos, como vem na conta)
//       + consumo × acréscimo da bandeira (ANEEL)
//       + CIP (contribuição de iluminação pública, valor fixo do município).
// Bandeiras 2026 (R$ por 100 kWh): amarela 1,88 · vermelha P1 4,46 · vermelha P2 7,87.

import { BANDEIRAS_TARIFARIAS } from '../data/brasil-2026';

export interface Inputs {
  consumoKwh: number;    // kWh do mês
  tarifaKwh?: number;    // R$/kWh na conta (com impostos) — padrão 0,90
  bandeira?: string;     // verde | amarela | vermelha1 | vermelha2
  cip?: number;          // contribuição de iluminação pública (R$ fixo)
}

export interface Outputs {
  total: string;
  valorEnergia: string;
  valorBandeira: string;
  cipValor: string;
  custoMedioKwh: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const NOME_BANDEIRA: Record<string, string> = {
  verde: 'verde',
  amarela: 'amarela',
  vermelha1: 'vermelha patamar 1',
  vermelha2: 'vermelha patamar 2',
};

export function compute(i: Inputs): Outputs {
  const consumo = Math.max(0, Number(i.consumoKwh) || 0);
  let tarifa = Number(i.tarifaKwh);
  if (!isFinite(tarifa) || tarifa <= 0) tarifa = 0.9;
  const bandeira = String(i.bandeira || 'verde').toLowerCase();
  const cip = Math.max(0, Number(i.cip) || 0);

  const acrescimoBandeira = (BANDEIRAS_TARIFARIAS as Record<string, number>)[bandeira] ?? 0;
  const valorEnergia = consumo * tarifa;
  const valorBandeira = consumo * acrescimoBandeira;
  const total = valorEnergia + valorBandeira + cip;
  const custoMedio = consumo > 0 ? total / consumo : 0;

  const nomeBand = NOME_BANDEIRA[bandeira] || 'verde';
  const detalhe =
    `Energia: ${consumo.toLocaleString('pt-BR')} kWh × ${brl(tarifa)} = ${brl(valorEnergia)}. ` +
    `Bandeira ${nomeBand}: ${brl(acrescimoBandeira)}/kWh × ${consumo.toLocaleString('pt-BR')} = ${brl(valorBandeira)}. ` +
    `Iluminação pública (CIP): ${brl(cip)}. ` +
    `Total estimado: ${brl(total)} (custo médio ${brl(custoMedio)}/kWh).`;

  return {
    total: brl(total),
    valorEnergia: brl(valorEnergia),
    valorBandeira: brl(valorBandeira),
    cipValor: brl(cip),
    custoMedioKwh: brl(custoMedio),
    detalhe,
    _insight: {
      title: `Conta estimada: ${brl(total)}`,
      text:
        `Consumindo **${consumo.toLocaleString('pt-BR')} kWh** com tarifa de **${brl(tarifa)}/kWh** e bandeira **${nomeBand}**, ` +
        `sua conta fica em torno de **${brl(total)}**` +
        (valorBandeira > 0 ? `, dos quais **${brl(valorBandeira)}** são só do acréscimo da bandeira.` : `. A bandeira verde não cobra acréscimo.`),
      tone: bandeira.startsWith('vermelha') ? 'warn' : 'good',
      icon: '💡',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Energia (kWh × tarifa)', value: Number(valorEnergia.toFixed(2)) },
        { label: 'Bandeira', value: Number(valorBandeira.toFixed(2)) },
        { label: 'Iluminação pública', value: Number(cip.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(total),
      centerLabel: 'Total',
      ariaLabel: `Energia ${brl(valorEnergia)}, bandeira ${brl(valorBandeira)} e iluminação pública ${brl(cip)} somam ${brl(total)}.`,
    },
  };
}
