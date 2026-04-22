/** Salário líquido CLT: bruto − INSS progressivo − IRRF progressivo (tabelas 2026). */

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
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// INSS 2026 progressivo (bandas)
export function calcInss2026(salario: number): number {
  if (salario <= 0) return 0;
  const faixas = [
    { ate: 1518.0, aliq: 0.075 },
    { ate: 2793.88, aliq: 0.09 },
    { ate: 4190.83, aliq: 0.12 },
    { ate: 8157.41, aliq: 0.14 },
  ];
  const teto = 8157.41;
  const base = Math.min(salario, teto);
  let inss = 0;
  let anterior = 0;
  for (const f of faixas) {
    if (base > f.ate) {
      inss += (f.ate - anterior) * f.aliq;
      anterior = f.ate;
    } else {
      inss += (base - anterior) * f.aliq;
      return inss;
    }
  }
  return inss; // teto
}

// IRRF 2026 mensal (dedução parcela)
export function calcIrrf2026(base: number): number {
  if (base <= 2824.0) return 0;
  if (base <= 2826.65) return base * 0.075 - 211.8;
  if (base <= 3751.05) return base * 0.15 - 423.8;
  if (base <= 4664.68) return base * 0.225 - 707.13;
  return base * 0.275 - 940.36;
}

export function salarioLiquidoCltInssIrrf(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  if (!bruto || bruto <= 0) throw new Error('Informe o salário bruto.');

  const inss = calcInss2026(bruto);
  const baseIrrf = bruto - inss;
  const irrf = Math.max(0, calcIrrf2026(baseIrrf));
  const liquido = bruto - inss - irrf;
  const aliqEfetiva = ((inss + irrf) / bruto) * 100;

  const formula = `Líquido = ${fmt(bruto)} − INSS ${fmt(inss)} − IRRF ${fmt(irrf)} = ${fmt(liquido)}`;
  const explicacao = `Com salário bruto de ${fmt(bruto)}: INSS progressivo 2026 de ${fmt(inss)}, base de IRRF ${fmt(baseIrrf)}, IRRF retido ${fmt(irrf)}. Salário líquido: ${fmt(liquido)} (alíquota efetiva ${aliqEfetiva.toFixed(2)}%).`;

  return {
    salarioBruto: fmt(bruto),
    descontoInss: fmt(inss),
    baseIrrf: fmt(baseIrrf),
    descontoIrrf: fmt(irrf),
    salarioLiquido: fmt(liquido),
    aliquotaEfetiva: aliqEfetiva.toFixed(2) + '%',
    formula,
    explicacao,
  };
}
