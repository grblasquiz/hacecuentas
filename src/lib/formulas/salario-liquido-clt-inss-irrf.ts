/**
 * Salário líquido CLT 2026: bruto − INSS progressivo − IRRF (tabela + redutor da reforma).
 *
 * Dados: fonte única src/lib/data/brasil-2026.ts (INSS 2026, teto R$ 8.475,55,
 * desconto máx. R$ 988,09; IRRF com o redutor 2026 — isenção efetiva até
 * R$ 5.000 de base). Mesma lógica do simulador-holerite-clt, para que as duas
 * calcs nunca divirjam.
 *
 * IMPORTANTE: exportar UMA única função — o loader de fórmulas (Calculator.astro
 * e calc-compute.ts) escolhe a primeira função do namespace do módulo.
 */

import { calcINSS, calcIRRF2026, IRRF_ISENCAO_REDUTOR } from '../data/brasil-2026';

export interface Inputs {
  salarioBruto: number;
}

export interface Outputs {
  salarioBruto: string;
  descontoInss: string;
  baseIrrf: string;
  descontoIrrf: string;
  salarioLiquido: string;
  aliquotaEfetiva: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function salarioLiquidoCltInssIrrf(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  if (!bruto || bruto <= 0) throw new Error('Informe o salário bruto.');

  const inss = calcINSS(bruto);
  const baseIrrf = bruto - inss;
  const irrf = Math.max(0, calcIRRF2026(baseIrrf));
  const liquido = bruto - inss - irrf;
  const aliqEfetiva = ((inss + irrf) / bruto) * 100;

  const isentoPorRedutor = irrf === 0 && baseIrrf <= IRRF_ISENCAO_REDUTOR;
  const formula = `Líquido = ${fmt(bruto)} − INSS ${fmt(inss)} − IRRF ${fmt(irrf)} = ${fmt(liquido)}`;
  const explicacao =
    `Com salário bruto de ${fmt(bruto)}: INSS progressivo 2026 de ${fmt(inss)}, base de IRRF ${fmt(baseIrrf)}, ` +
    (isentoPorRedutor
      ? `IRRF R$ 0,00 (isento pelo redutor 2026 — base até R$ 5.000). `
      : `IRRF retido ${fmt(irrf)} (tabela mensal + redutor 2026). `) +
    `Salário líquido: ${fmt(liquido)} (alíquota efetiva ${aliqEfetiva.toFixed(2)}%).`;

  const pctLiquido = bruto > 0 ? (liquido / bruto) * 100 : 0;
  const _insight = {
    title: 'Quanto sobra do seu salário',
    text: `De ${fmt(bruto)} brutos você leva **${fmt(liquido)}** (**${pctLiquido.toFixed(1)}%**). INSS + IRRF somam ${fmt(inss + irrf)}, uma alíquota efetiva de **${aliqEfetiva.toFixed(2)}%**.${isentoPorRedutor ? ' Com o redutor da reforma 2026, bases até R$ 5.000 ficam isentas de IRRF.' : ''}`,
    tone: aliqEfetiva >= 20 ? 'warn' : aliqEfetiva >= 10 ? 'neutral' : 'good',
    icon: '💸',
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
    ariaLabel: `Composição do salário bruto de ${fmt(bruto)}: líquido na mão, INSS e IRRF.`,
  };

  return {
    salarioBruto: fmt(bruto),
    descontoInss: fmt(inss),
    baseIrrf: fmt(baseIrrf),
    descontoIrrf: fmt(irrf),
    salarioLiquido: fmt(liquido),
    aliquotaEfetiva: aliqEfetiva.toFixed(2) + '%',
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
