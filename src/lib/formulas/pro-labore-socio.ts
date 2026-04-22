/** Pró-labore sócio administrador — Mínimo salário mínimo R$ 1.518 (2026)
 *  INSS 11% (retido, com teto) + IRRF progressivo mensal.
 *  Teto INSS 2026: R$ 8.157,41 → contribuição máx R$ 897,32.
 */

export interface Inputs {
  proLaboreBruto: number;
  dependentes?: number;
}

export interface Outputs {
  proLaboreBruto: number;
  inss: number;
  baseIrrf: number;
  irrf: number;
  proLaboreLiquido: number;
  atendeMinimo: boolean;
  alerta: string;
  formula: string;
  explicacion: string;
}

const SALARIO_MIN = 1518.00;
const TETO_INSS = 8157.41;
const DEDUCAO_DEP = 189.59;

// IRRF 2026 (tabela progressiva mensal)
const IRRF = [
  { lim: 2259.20, aliq: 0, deduz: 0 },
  { lim: 2826.65, aliq: 7.5, deduz: 169.44 },
  { lim: 3751.05, aliq: 15.0, deduz: 381.44 },
  { lim: 4664.68, aliq: 22.5, deduz: 662.77 },
  { lim: Infinity, aliq: 27.5, deduz: 896.00 },
];

function calcIrrf(base: number): number {
  if (base <= 0) return 0;
  for (const f of IRRF) {
    if (base <= f.lim) return Math.max(0, base * (f.aliq / 100) - f.deduz);
  }
  return 0;
}

export function proLaboreSocio(i: Inputs): Outputs {
  const bruto = Math.max(0, Number(i.proLaboreBruto) || 0);
  const deps = Math.max(0, Number(i.dependentes) || 0);

  const baseInss = Math.min(bruto, TETO_INSS);
  const inss = baseInss * 0.11;

  const baseIrrf = Math.max(0, bruto - inss - deps * DEDUCAO_DEP);
  const irrf = calcIrrf(baseIrrf);

  const liquido = bruto - inss - irrf;
  const atendeMinimo = bruto >= SALARIO_MIN;

  let alerta = '';
  if (!atendeMinimo) {
    alerta = `⚠️ Pró-labore de R$ ${bruto.toFixed(2)} está abaixo do salário mínimo R$ ${SALARIO_MIN.toFixed(2)}. A Receita pode desconsiderar e autuar. Ajuste para no mínimo R$ ${SALARIO_MIN.toFixed(2)}.`;
  } else {
    alerta = `✓ Pró-labore acima do piso legal. INSS ${(inss / bruto * 100).toFixed(2)}% + IRRF ${(irrf / bruto * 100).toFixed(2)}% = carga ${((inss + irrf) / bruto * 100).toFixed(2)}%.`;
  }

  const formula = `Líquido = Bruto - INSS(11% até teto) - IRRF(tabela progressiva) = ${bruto.toFixed(2)} - ${inss.toFixed(2)} - ${irrf.toFixed(2)} = R$ ${liquido.toFixed(2)}`;
  const explicacion = `Pró-labore bruto R$ ${bruto.toFixed(2)}. INSS 11% = R$ ${inss.toFixed(2)} (base limitada ao teto R$ ${TETO_INSS.toFixed(2)}). Base IRRF após INSS e ${deps} dependente(s): R$ ${baseIrrf.toFixed(2)}. IRRF: R$ ${irrf.toFixed(2)}. Pró-labore líquido: R$ ${liquido.toFixed(2)}. ${alerta} Lembre que a empresa ainda paga 20% de INSS patronal (Anexo IV) — nos demais anexos a CPP está inclusa no DAS.`;

  return {
    proLaboreBruto: Number(bruto.toFixed(2)),
    inss: Number(inss.toFixed(2)),
    baseIrrf: Number(baseIrrf.toFixed(2)),
    irrf: Number(irrf.toFixed(2)),
    proLaboreLiquido: Number(liquido.toFixed(2)),
    atendeMinimo,
    alerta,
    formula,
    explicacion,
  };
}
