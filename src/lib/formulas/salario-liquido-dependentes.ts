/** Salário líquido com dedução por dependentes (R$ 189,59/mês por dependente no IRRF).
 *  INSS progressivo + IRRF sobre (bruto − INSS − dependentes × 189,59).
 */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioBruto: number;
  dependentes: number;
}

export interface Outputs {
  salarioBruto: string;
  descontoInss: string;
  deducaoDependentes: string;
  baseIrrf: string;
  descontoIrrf: string;
  salarioLiquido: string;
  economiaPorDependentes: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEDUCAO_DEP = 189.59;

export function salarioLiquidoDependentes(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  const deps = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  if (!bruto || bruto <= 0) throw new Error('Informe o salário bruto.');

  const inss = calcInss2026(bruto);
  const deducaoDeps = deps * DEDUCAO_DEP;
  const baseIrrfSemDep = bruto - inss;
  const baseIrrf = baseIrrfSemDep - deducaoDeps;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const irrfSemDep = Math.max(0, calcIrrf2026(baseIrrfSemDep));
  const liquido = bruto - inss - irrf;
  const economia = irrfSemDep - irrf;

  const formula = `Líquido = ${fmt(bruto)} − INSS ${fmt(inss)} − IRRF(base ${fmt(baseIrrf)}) = ${fmt(liquido)}`;
  const explicacao = `Com ${deps} dependente(s), dedução no IRRF de ${fmt(deducaoDeps)} (${deps} × R$ 189,59). INSS ${fmt(inss)}, IRRF ${fmt(irrf)}. Líquido: ${fmt(liquido)}. Economia vs. sem dependentes: ${fmt(economia)}.`;

  const _insight = economia > 0
    ? {
        title: 'Dependentes reduzem seu IRRF',
        text: `Declarar **${deps} dependente(s)** abate ${fmt(deducaoDeps)} da base do IRRF e te faz economizar **${fmt(economia)}/mês** — cerca de **${fmt(economia * 12)}** por ano no líquido.`,
        tone: 'good',
        icon: '👨‍👩‍👧',
      }
    : {
        title: 'Sem economia no IRRF',
        text: deps > 0
          ? `Com ${deps} dependente(s) o líquido é **${fmt(liquido)}**, mas a base já não paga IRRF, então a dedução de ${fmt(deducaoDeps)} não muda o desconto.`
          : `Sem dependentes declarados, o líquido fica em **${fmt(liquido)}** (INSS ${fmt(inss)} + IRRF ${fmt(irrf)}). Cada dependente abate R$ 189,59 da base do IRRF.`,
        tone: 'neutral',
        icon: '👨‍👩‍👧',
      };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(liquido * 100) / 100 },
      { label: 'INSS', value: Math.round(inss * 100) / 100 },
      { label: 'IRRF', value: Math.round(irrf * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'R$',
    centerValue: fmt(bruto),
    centerLabel: 'Salário bruto',
    ariaLabel: `Composição do salário bruto de ${fmt(bruto)} com ${deps} dependente(s): líquido, INSS e IRRF.`,
  };

  return {
    salarioBruto: fmt(bruto),
    descontoInss: fmt(inss),
    deducaoDependentes: fmt(deducaoDeps),
    baseIrrf: fmt(baseIrrf),
    descontoIrrf: fmt(irrf),
    salarioLiquido: fmt(liquido),
    economiaPorDependentes: fmt(economia),
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
