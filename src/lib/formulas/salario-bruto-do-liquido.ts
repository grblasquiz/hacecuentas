/** Reverso: dado o salário líquido, calcula o bruto (iterativo/bisseção).
 *  Usa tabelas INSS + IRRF 2026.
 */

import { calcINSS as calcInss2026, calcIRRF2026 as calcIrrf2026 } from '../data/brasil-2026';

export interface Inputs {
  salarioLiquido: number;
}

export interface Outputs {
  salarioLiquido: string;
  salarioBrutoEstimado: string;
  inssEstimado: string;
  irrfEstimado: string;
  iteracoes: number;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function liquidoDeBruto(bruto: number): { liquido: number; inss: number; irrf: number } {
  const inss = calcInss2026(bruto);
  const base = bruto - inss;
  const irrf = Math.max(0, calcIrrf2026(base));
  return { liquido: bruto - inss - irrf, inss, irrf };
}

export function salarioBrutoDoLiquido(i: Inputs): Outputs {
  const liq = Number(i.salarioLiquido);
  if (!liq || liq <= 0) throw new Error('Informe o salário líquido desejado.');

  let lo = liq;
  let hi = liq * 2 + 1000;
  let it = 0;
  let mid = lo;
  while (hi - lo > 0.01 && it < 80) {
    mid = (lo + hi) / 2;
    const { liquido } = liquidoDeBruto(mid);
    if (liquido < liq) lo = mid;
    else hi = mid;
    it++;
  }
  const bruto = (lo + hi) / 2;
  const { inss, irrf } = liquidoDeBruto(bruto);

  const formula = `Bruto tal que Bruto − INSS − IRRF = ${fmt(liq)} → ${fmt(bruto)} (bisseção, ${it} iter.)`;
  const explicacao = `Para receber líquido de ${fmt(liq)}, o salário bruto estimado é ${fmt(bruto)}, com INSS ${fmt(inss)} e IRRF ${fmt(irrf)}.`;

  const descontos = inss + irrf;
  const liquidoReal = bruto - descontos;
  const pctDesc = bruto > 0 ? (descontos / bruto) * 100 : 0;
  const _insight = {
    title: 'Quanto bruto para esse líquido',
    text: `Para levar **${fmt(liquidoReal)}** na mão, o bruto precisa ser **${fmt(bruto)}**: a empresa retém ${fmt(descontos)} em INSS + IRRF, ou seja **${pctDesc.toFixed(1)}%** já saem antes de cair na conta.`,
    tone: pctDesc >= 20 ? 'warn' : 'neutral',
    icon: '🔁',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(liquidoReal * 100) / 100 },
      { label: 'INSS', value: Math.round(inss * 100) / 100 },
      { label: 'IRRF', value: Math.round(irrf * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'R$',
    centerValue: fmt(bruto),
    centerLabel: 'Salário bruto',
    ariaLabel: `Composição do salário bruto de ${fmt(bruto)}: líquido, INSS e IRRF.`,
  };

  return {
    salarioLiquido: fmt(liq),
    salarioBrutoEstimado: fmt(bruto),
    inssEstimado: fmt(inss),
    irrfEstimado: fmt(irrf),
    iteracoes: it,
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
