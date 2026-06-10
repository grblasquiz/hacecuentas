// Calculadora Férias + 1/3 Constitucional CLT 2026
// Fontes: CLT arts. 129-153, CF/88 art. 7º XVII; INSS/IRRF 2026 importados da
// fonte única src/lib/data/brasil-2026.ts (teto INSS R$ 8.475,55; IRRF tabela
// mai/2025 + redutor 2026 da reforma — isenção efetiva até R$ 5.000 de base).

import { calcINSS, calcIRRF2026, IRRF_DEDUCAO_DEPENDENTE } from "../data/brasil-2026";

export interface Inputs {
  salario_bruto: number;
  dias_gozados: string;       // "30" | "20" | "15" | "10"
  abono_pecuniario: string;   // "sim" | "nao"
  dependentes: number;
}

export interface Outputs {
  salario_ferias_bruto: number;
  abono_bruto: number;
  base_calculo: number;
  inss: number;
  deducao_dependentes: number;
  base_irrf: number;
  irrf: number;
  liquido: number;
  comparativo: string;
  detalhamento: string;
  _insight?: any;
  _chart?: any;
}

// ─── INSS e IRRF 2026 ───────────────────────────────────────────────────────
// Implementação única em src/lib/data/brasil-2026.ts (calcINSS progressivo com
// teto, calcIRRF2026 = tabela cheia + redutor da reforma), compartilhada com o
// simulador de holerite para nunca divergirem.

/** Calcula INSS progressivo sobre uma base */
function calcularINSS(base: number): number {
  return calcINSS(base);
}

/** Calcula IRRF (tabela cheia + redutor 2026) sobre uma base já deduzida de INSS e dependentes */
function calcularIRRF(baseIRRF: number): number {
  return parseFloat(calcIRRF2026(baseIRRF).toFixed(2));
}

/** Calcula o líquido de férias dado um conjunto de parâmetros */
function calcularFerias(
  salarioBruto: number,
  diasGozados: number,
  diasAbono: number,
  dependentes: number
): {
  feriasBruto: number;
  abonoBruto: number;
  totalBruto: number;
  inss: number;
  deducaoDep: number;
  baseIRRF: number;
  irrf: number;
  liquido: number;
} {
  const valorDiario = salarioBruto / 30;

  // Salário-férias = valor diário × dias gozados
  const salarioFerias = valorDiario * diasGozados;
  // Terço constitucional sobre o salário-férias
  const terco = salarioFerias / 3;
  const feriasBruto = parseFloat((salarioFerias + terco).toFixed(2));

  // Abono pecuniário: (valor diário × 10) × (1 + 1/3)
  let abonoBruto = 0;
  if (diasAbono > 0) {
    const abonoDias = valorDiario * diasAbono;
    abonoBruto = parseFloat((abonoDias * (1 + 1 / 3)).toFixed(2));
  }

  const totalBruto = parseFloat((feriasBruto + abonoBruto).toFixed(2));

  // INSS sobre o total bruto
  const inssValor = calcularINSS(totalBruto);

  // Dedução dependentes
  const deducaoDep = parseFloat((dependentes * IRRF_DEDUCAO_DEPENDENTE).toFixed(2));

  // Base IRRF
  const baseIRRF = Math.max(0, parseFloat((totalBruto - inssValor - deducaoDep).toFixed(2)));

  // IRRF
  const irrfValor = calcularIRRF(baseIRRF);

  // Líquido
  const liquido = parseFloat((totalBruto - inssValor - irrfValor).toFixed(2));

  return {
    feriasBruto,
    abonoBruto,
    totalBruto,
    inss: inssValor,
    deducaoDep,
    baseIRRF,
    irrf: irrfValor,
    liquido,
  };
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salario_bruto) || 0);
  const diasGozados = parseInt(i.dias_gozados, 10) || 30;
  const temAbono = i.abono_pecuniario === "sim";
  const dependentes = Math.max(0, Math.floor(Number(i.dependentes) || 0));

  if (salario <= 0) {
    return {
      salario_ferias_bruto: 0,
      abono_bruto: 0,
      base_calculo: 0,
      inss: 0,
      deducao_dependentes: 0,
      base_irrf: 0,
      irrf: 0,
      liquido: 0,
      comparativo: "Informe um salário bruto válido para calcular.",
      detalhamento: "Informe um salário bruto válido para calcular.",
    };
  }

  // Cálculo principal
  const diasAbono = temAbono ? 10 : 0;
  const resultado = calcularFerias(salario, diasGozados, diasAbono, dependentes);

  // ─── Comparativo: 30 dias sem abono vs 20 dias com abono (10 vendidos) ───
  const calc30 = calcularFerias(salario, 30, 0, dependentes);
  const calc20com10 = calcularFerias(salario, 20, 10, dependentes);
  const difLiquido = parseFloat((calc20com10.liquido - calc30.liquido).toFixed(2));
  const difSinal = difLiquido >= 0 ? "+" : "";
  const comparativo =
    `Cenário A — 30 dias sem abono: bruto R$ ${calc30.totalBruto.toFixed(2)}, líquido R$ ${calc30.liquido.toFixed(2)}\n` +
    `Cenário B — 20 dias + vender 10: bruto R$ ${calc20com10.totalBruto.toFixed(2)}, líquido R$ ${calc20com10.liquido.toFixed(2)}\n` +
    `Diferença no líquido: ${difSinal}R$ ${Math.abs(difLiquido).toFixed(2)} ${difLiquido >= 0 ? "a favor do abono" : "favorável a gozar 30 dias"}`;

  // ─── Detalhamento ─────────────────────────────────────────────────────────
  const valorDiario = salario / 30;
  const salarioFeriasBase = valorDiario * diasGozados;
  const terco = salarioFeriasBase / 3;
  let det =
    `Salário bruto: R$ ${salario.toFixed(2)}\n` +
    `Valor diário: R$ ${valorDiario.toFixed(4)}\n` +
    `Dias gozados: ${diasGozados} dias\n` +
    `Salário-férias (${diasGozados} dias): R$ ${salarioFeriasBase.toFixed(2)}\n` +
    `1/3 constitucional: R$ ${terco.toFixed(2)}\n` +
    `Férias brutas: R$ ${resultado.feriasBruto.toFixed(2)}\n`;
  if (temAbono) {
    det += `Abono pecuniário (10 dias + 1/3): R$ ${resultado.abonoBruto.toFixed(2)}\n`;
  }
  det +=
    `Base total bruta: R$ ${resultado.totalBruto.toFixed(2)}\n` +
    `INSS (progressivo): -R$ ${resultado.inss.toFixed(2)}\n`;
  if (dependentes > 0) {
    det += `Dedução dependentes (${dependentes} × R$ ${IRRF_DEDUCAO_DEPENDENTE.toFixed(2)}): -R$ ${resultado.deducaoDep.toFixed(2)}\n`;
  }
  det +=
    `Base IRRF: R$ ${resultado.baseIRRF.toFixed(2)}\n` +
    `IRRF: -R$ ${resultado.irrf.toFixed(2)}\n` +
    `Líquido a receber: R$ ${resultado.liquido.toFixed(2)}`;

  // ─── Insight ────────────────────────────────────────────────────────────
  const totalDescontos = parseFloat((resultado.inss + resultado.irrf).toFixed(2));
  const pctDesconto = resultado.totalBruto > 0
    ? Math.round((totalDescontos / resultado.totalBruto) * 100)
    : 0;
  const _insight = {
    title: 'Suas férias na conta',
    text: `Do bruto de **R$ ${resultado.totalBruto.toFixed(2)}**, os descontos (INSS + IRRF) somam **R$ ${totalDescontos.toFixed(2)}** (**${pctDesconto}%**) e você recebe **R$ ${resultado.liquido.toFixed(2)}** líquidos.`,
    tone: (pctDesconto >= 20 ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🏖️',
  };

  // ─── Gráfico: composição do bruto ───────────────────────────────────────
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido', value: resultado.liquido },
      { label: 'INSS', value: resultado.inss },
      { label: 'IRRF', value: resultado.irrf },
    ],
    prefix: 'R$ ',
    centerValue: `R$ ${resultado.liquido.toFixed(2)}`,
    centerLabel: 'Líquido',
    ariaLabel: `Do bruto de R$ ${resultado.totalBruto.toFixed(2)}, R$ ${resultado.liquido.toFixed(2)} são líquidos, R$ ${resultado.inss.toFixed(2)} de INSS e R$ ${resultado.irrf.toFixed(2)} de IRRF.`,
  };

  return {
    salario_ferias_bruto: resultado.feriasBruto,
    abono_bruto: resultado.abonoBruto,
    base_calculo: resultado.totalBruto,
    inss: resultado.inss,
    deducao_dependentes: resultado.deducaoDep,
    base_irrf: resultado.baseIRRF,
    irrf: resultado.irrf,
    liquido: resultado.liquido,
    comparativo,
    detalhamento: det,
    _insight,
    _chart,
  };
}
