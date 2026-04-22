/** Férias CLT integrais + 1/3 constitucional (CF art 7º XVII, CLT arts 129-153).
 *  Descontos INSS + IRRF sobre (salário + 1/3).
 */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioBruto: number;
  dependentes: number;
}

export interface Outputs {
  salarioBruto: string;
  tercoConstitucional: string;
  feriasBrutas: string;
  descontoInss: string;
  descontoIrrf: string;
  feriasLiquidas: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEDUCAO_DEP = 189.59;

export function feriasCltIntegrais(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const deps = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');

  const terco = salario / 3;
  const bruto = salario + terco;
  const inss = calcInss2026(bruto);
  const baseIrrf = bruto - inss - deps * DEDUCAO_DEP;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const liquido = bruto - inss - irrf;

  const formula = `Férias = Salário ${fmt(salario)} + 1/3 ${fmt(terco)} − INSS ${fmt(inss)} − IRRF ${fmt(irrf)} = ${fmt(liquido)}`;
  const explicacao = `Férias integrais (30 dias) de ${fmt(salario)} + 1/3 constitucional (${fmt(terco)}) = ${fmt(bruto)}. Descontos sobre o bruto: INSS ${fmt(inss)} e IRRF ${fmt(irrf)}. Líquido a receber: ${fmt(liquido)}. Base legal: CF art. 7º XVII, CLT arts. 129-153.`;

  return {
    salarioBruto: fmt(salario),
    tercoConstitucional: fmt(terco),
    feriasBrutas: fmt(bruto),
    descontoInss: fmt(inss),
    descontoIrrf: fmt(irrf),
    feriasLiquidas: fmt(liquido),
    formula,
    explicacao,
  };
}
