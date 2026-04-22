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

  return {
    salarioBruto: fmt(bruto),
    descontoInss: fmt(inss),
    pensaoAplicada: fmt(pensao),
    baseIrrf: fmt(baseIrrf),
    descontoIrrf: fmt(irrf),
    salarioLiquido: fmt(liquido),
    formula,
    explicacao,
  };
}
