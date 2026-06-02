/** Salário líquido com pensão alimentícia: dedutível do IRRF (não do INSS).
 *  Pode ser valor fixo ou % sobre salário bruto.
 */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioBruto: number;
  pensaoValor: number;
  pensaoTipo: string; // 'fixo' | 'percentual'
}

export interface Outputs {
  salarioBruto: string;
  descontoInss: string;
  pensaoAplicada: string;
  baseIrrf: string;
  descontoIrrf: string;
  salarioLiquido: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function salarioLiquidoPensao(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  const v = Number(i.pensaoValor) || 0;
  const tipo = (i.pensaoTipo || 'fixo').toString();
  if (!bruto || bruto <= 0) throw new Error('Informe o salário bruto.');

  const pensao = tipo === 'percentual' ? bruto * (v / 100) : v;
  const inss = calcInss2026(bruto);
  const baseIrrf = bruto - inss - pensao;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const liquido = bruto - inss - irrf - pensao;

  const formula = `Líquido = ${fmt(bruto)} − INSS ${fmt(inss)} − Pensão ${fmt(pensao)} − IRRF ${fmt(irrf)} = ${fmt(liquido)}`;
  const explicacao = `Pensão alimentícia ${tipo === 'percentual' ? `${v}% (${fmt(pensao)})` : fmt(pensao)} é dedutível do IRRF (não do INSS). INSS: ${fmt(inss)}. Base IRRF: ${fmt(baseIrrf)}. IRRF: ${fmt(irrf)}. Líquido em mãos: ${fmt(liquido)}.`;

  const pctPensao = bruto > 0 ? (pensao / bruto) * 100 : 0;
  const _insight = {
    title: 'O que sobra depois da pensão',
    text: `De ${fmt(bruto)} brutos saem ${fmt(pensao)} de pensão (**${pctPensao.toFixed(1)}%**), além de INSS ${fmt(inss)} e IRRF ${fmt(irrf)}. Sobram **${fmt(liquido)}** na mão. A pensão abate a base do IRRF, então reduz um pouco o imposto.`,
    tone: pctPensao >= 30 ? 'warn' : 'neutral',
    icon: '⚖️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(liquido * 100) / 100 },
      { label: 'Pensão', value: Math.round(pensao * 100) / 100 },
      { label: 'INSS', value: Math.round(inss * 100) / 100 },
      { label: 'IRRF', value: Math.round(irrf * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'R$',
    centerValue: fmt(bruto),
    centerLabel: 'Salário bruto',
    ariaLabel: `Composição do salário bruto de ${fmt(bruto)}: líquido, pensão, INSS e IRRF.`,
  };

  return {
    salarioBruto: fmt(bruto),
    descontoInss: fmt(inss),
    pensaoAplicada: fmt(pensao),
    baseIrrf: fmt(baseIrrf),
    descontoIrrf: fmt(irrf),
    salarioLiquido: fmt(liquido),
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
