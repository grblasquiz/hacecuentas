/** 13º salário proporcional: (salário / 12) × meses trabalhados.
 *  Descontos INSS + IRRF incidem na 2ª parcela. Lei 4.090/1962.
 */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioBruto: number;
  mesesTrabalhados: number;
  dependentes: number;
}

export interface Outputs {
  decimoBruto: string;
  primeiraParcela: string;
  inssSegundaParcela: string;
  irrfSegundaParcela: string;
  segundaParcelaLiquida: string;
  decimoLiquidoTotal: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEDUCAO_DEP = 189.59;

export function decimoTerceiroProporcional(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const meses = Math.min(12, Math.max(0, Math.floor(Number(i.mesesTrabalhados) || 0)));
  const deps = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');
  if (meses <= 0) throw new Error('Informe os meses trabalhados (≥ 1).');

  const decimoBruto = (salario / 12) * meses;
  const primeira = decimoBruto / 2;

  // Descontos são calculados sobre o 13º integral do ano (bruto) na 2ª parcela
  const inss = calcInss2026(decimoBruto);
  const baseIrrf = decimoBruto - inss - deps * DEDUCAO_DEP;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const segunda = decimoBruto - primeira - inss - irrf;
  const liquidoTotal = decimoBruto - inss - irrf;

  const formula = `13º = (${fmt(salario)} / 12) × ${meses} = ${fmt(decimoBruto)}; líquido total = ${fmt(liquidoTotal)}`;
  const explicacao = `13º salário proporcional a ${meses}/12 meses: bruto ${fmt(decimoBruto)}. 1ª parcela (até 30/nov, sem descontos): ${fmt(primeira)}. 2ª parcela (até 20/dez): saldo ${fmt(primeira)} − INSS ${fmt(inss)} − IRRF ${fmt(irrf)} = ${fmt(segunda)}. Líquido total: ${fmt(liquidoTotal)}. Base legal: Lei 4.090/1962.`;

  return {
    decimoBruto: fmt(decimoBruto),
    primeiraParcela: fmt(primeira),
    inssSegundaParcela: fmt(inss),
    irrfSegundaParcela: fmt(irrf),
    segundaParcelaLiquida: fmt(segunda),
    decimoLiquidoTotal: fmt(liquidoTotal),
    formula,
    explicacao,
  };
}
