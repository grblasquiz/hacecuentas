/** 2ª parcela do 13º: saldo − INSS − IRRF. Pago até 20/dezembro. Lei 4.090/1962. */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioBruto: number;
  mesesTrabalhados: number;
  dependentes: number;
  primeiraParcelaPaga: number;
}

export interface Outputs {
  decimoBruto: string;
  descontoInss: string;
  descontoIrrf: string;
  saldo: string;
  segundaParcelaLiquida: string;
  dataLimite: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEDUCAO_DEP = 189.59;

export function decimoTerceiroSegundaParcela(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const meses = Math.min(12, Math.max(0, Math.floor(Number(i.mesesTrabalhados) || 12)));
  const deps = Math.max(0, Math.floor(Number(i.dependentes) || 0));
  const primeira = Math.max(0, Number(i.primeiraParcelaPaga) || 0);
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');

  const decimoBruto = (salario / 12) * meses;
  const saldoBruto = decimoBruto - primeira;
  const inss = calcInss2026(decimoBruto);
  const baseIrrf = decimoBruto - inss - deps * DEDUCAO_DEP;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const segunda = saldoBruto - inss - irrf;

  const formula = `2ª parcela = saldo ${fmt(saldoBruto)} − INSS ${fmt(inss)} − IRRF ${fmt(irrf)} = ${fmt(segunda)}`;
  const explicacao = `13º bruto de ${fmt(decimoBruto)} (${meses}/12 meses). 1ª parcela paga: ${fmt(primeira)}. Na 2ª parcela (até 20/dez), descontam-se INSS ${fmt(inss)} e IRRF ${fmt(irrf)} sobre o valor integral do 13º, resultando líquido de ${fmt(segunda)}.`;

  return {
    decimoBruto: fmt(decimoBruto),
    descontoInss: fmt(inss),
    descontoIrrf: fmt(irrf),
    saldo: fmt(saldoBruto),
    segundaParcelaLiquida: fmt(segunda),
    dataLimite: '20 de dezembro',
    formula,
    explicacao,
  };
}
