/** Pró-labore sócio administrador — Mínimo 1 salário mínimo R$ 1.621 (2026)
 *  INSS 11% (retido, com teto) + IRRF progressivo mensal.
 *  Teto INSS 2026: R$ 8.475,55 → contribuição máx R$ 932,31.
 *  Valores em src/lib/data/brasil-2026.ts.
 */
import { SALARIO_MINIMO, INSS_TETO, IRRF_DEDUCAO_DEPENDENTE } from '../data/brasil-2026';

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
  _insight?: any;
  _chart?: any;
}

const SALARIO_MIN = SALARIO_MINIMO;
const TETO_INSS = INSS_TETO;
const DEDUCAO_DEP = IRRF_DEDUCAO_DEPENDENTE;

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

  // Insight narrativo (pt-BR)
  const fmtBr = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cargaPct = bruto > 0 ? ((inss + irrf) / bruto) * 100 : 0;
  let _insight: any;
  if (!atendeMinimo) {
    _insight = {
      title: 'Abaixo do piso legal',
      text: `Um pró-labore de **${fmtBr(bruto)}** fica abaixo do salário mínimo de **${fmtBr(SALARIO_MIN)}**. A Receita pode desconsiderar e autuar — ajuste para no mínimo **${fmtBr(SALARIO_MIN)}**.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Pró-labore líquido na conta',
      text: `Do bruto de **${fmtBr(bruto)}** saem **${fmtBr(inss)}** de INSS e **${fmtBr(irrf)}** de IRRF (carga total **${cargaPct.toFixed(1)}%**), restando **${fmtBr(liquido)}** líquidos. Lembre que a empresa ainda recolhe o INSS patronal à parte.`,
      tone: cargaPct >= 25 ? 'warn' : 'good',
      icon: '💼',
    };
  }

  // Gráfico: composição do bruto (líquido + INSS + IRRF)
  let _chart: any;
  if (bruto > 0) {
    const slices = [{ label: 'Líquido', value: Number(liquido.toFixed(2)) }];
    if (inss > 0) slices.push({ label: 'INSS', value: Number(inss.toFixed(2)) });
    if (irrf > 0) slices.push({ label: 'IRRF', value: Number(irrf.toFixed(2)) });
    _chart = {
      type: 'doughnut',
      slices,
      prefix: 'R$ ',
      centerValue: fmtBr(bruto),
      centerLabel: 'Bruto',
      ariaLabel: `Composição do pró-labore bruto de ${fmtBr(bruto)} entre líquido, INSS e IRRF`,
    };
  }

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
    _insight,
    _chart,
  };
}
