/** Férias proporcionais (demissão sem justa causa ou pedido de demissão): (salário/12) × meses + 1/3.
 *  CLT art. 146 e art. 147. Fração ≥ 15 dias conta como mês completo.
 */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioBruto: number;
  mesesTrabalhados: number;
  dependentes: number;
}

export interface Outputs {
  feriasProporcionais: string;
  tercoConstitucional: string;
  totalBruto: string;
  descontoInss: string;
  descontoIrrf: string;
  feriasLiquidas: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEDUCAO_DEP = 189.59;

export function feriasProporcionaisClt(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const meses = Math.min(12, Math.max(0, Math.floor(Number(i.mesesTrabalhados) || 0)));
  const deps = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');
  if (meses <= 0) throw new Error('Informe os meses trabalhados.');

  const proporcional = (salario / 12) * meses;
  const terco = proporcional / 3;
  const bruto = proporcional + terco;
  const inss = calcInss2026(bruto);
  const baseIrrf = bruto - inss - deps * DEDUCAO_DEP;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const liquido = bruto - inss - irrf;

  const formula = `Férias prop. = (${fmt(salario)}/12) × ${meses} + 1/3 = ${fmt(bruto)} (líquido ${fmt(liquido)})`;
  const explicacao = `Férias proporcionais a ${meses}/12 meses: ${fmt(proporcional)} + 1/3 (${fmt(terco)}) = ${fmt(bruto)}. INSS ${fmt(inss)}, IRRF ${fmt(irrf)}. Líquido: ${fmt(liquido)}. Fração ≥ 15 dias conta como mês completo (CLT art. 146).`;

  const totalDescontos = inss + irrf;
  const pctDesconto = bruto > 0 ? Math.round((totalDescontos / bruto) * 100) : 0;
  const _insight = {
    title: `Proporcional a ${meses}/12`,
    text: `Por ${meses} ${meses === 1 ? 'mês' : 'meses'} trabalhados: ${fmt(proporcional)} + 1/3 = ${fmt(bruto)} bruto. Após **${fmt(totalDescontos)}** de descontos (**${pctDesconto}%**), você recebe **${fmt(liquido)}**.`,
    tone: (pctDesconto >= 20 ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🏖️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido', value: liquido },
      { label: 'INSS', value: inss },
      { label: 'IRRF', value: irrf },
    ],
    prefix: 'R$ ',
    centerValue: fmt(liquido),
    centerLabel: 'Líquido',
    ariaLabel: `Férias proporcionais brutas de ${fmt(bruto)}: ${fmt(liquido)} líquidas, ${fmt(inss)} de INSS e ${fmt(irrf)} de IRRF.`,
  };

  return {
    feriasProporcionais: fmt(proporcional),
    tercoConstitucional: fmt(terco),
    totalBruto: fmt(bruto),
    descontoInss: fmt(inss),
    descontoIrrf: fmt(irrf),
    feriasLiquidas: fmt(liquido),
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
