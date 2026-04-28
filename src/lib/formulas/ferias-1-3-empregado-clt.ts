// Calculadora Férias + 1/3 Constitucional CLT 2026
// Fontes: CLT arts. 129-153, CF/88 art. 7º XVII, Tabelas INSS/IRRF 2026

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
}

// ─── Tabela INSS progressiva 2026 (Portaria MPS) ───────────────────────────
// Teto de contribuição: R$ 8.157,41 → desconto máximo R$ 908,86
const INSS_FAIXAS_2026 = [
  { limite: 1518.00,  aliquota: 0.075 },
  { limite: 2793.88,  aliquota: 0.090 },
  { limite: 4190.83,  aliquota: 0.120 },
  { limite: 8157.41,  aliquota: 0.140 },
];
const INSS_TETO_2026 = 908.86;

// ─── Tabela IRRF mensal 2026 (Receita Federal) ─────────────────────────────
const IRRF_FAIXAS_2026 = [
  { limite: 2259.20,  aliquota: 0.000, parcela: 0.00 },
  { limite: 2826.65,  aliquota: 0.075, parcela: 169.44 },
  { limite: 3751.05,  aliquota: 0.150, parcela: 381.44 },
  { limite: 4664.68,  aliquota: 0.225, parcela: 662.77 },
  { limite: Infinity, aliquota: 0.275, parcela: 896.00 },
];

// ─── Dedução por dependente IRRF 2026 ──────────────────────────────────────
const DEDUCAO_DEPENDENTE_2026 = 189.59; // R$ por dependente

/** Calcula INSS progressivo sobre uma base */
function calcularINSS(base: number): number {
  if (base <= 0) return 0;
  let inss = 0;
  let baseRestante = base;
  let limiteAnterior = 0;
  for (const faixa of INSS_FAIXAS_2026) {
    if (baseRestante <= 0) break;
    const faixaAtual = faixa.limite - limiteAnterior;
    const valorNaFaixa = Math.min(baseRestante, faixaAtual);
    inss += valorNaFaixa * faixa.aliquota;
    baseRestante -= valorNaFaixa;
    limiteAnterior = faixa.limite;
    if (base <= faixa.limite) break;
  }
  // Aplica teto de contribuição
  return Math.min(parseFloat(inss.toFixed(2)), INSS_TETO_2026);
}

/** Calcula IRRF sobre uma base já deduzida de INSS e dependentes */
function calcularIRRF(baseIRRF: number): number {
  if (baseIRRF <= 0) return 0;
  for (const faixa of IRRF_FAIXAS_2026) {
    if (baseIRRF <= faixa.limite) {
      const irrf = baseIRRF * faixa.aliquota - faixa.parcela;
      return Math.max(0, parseFloat(irrf.toFixed(2)));
    }
  }
  return 0;
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
  const deducaoDep = parseFloat((dependentes * DEDUCAO_DEPENDENTE_2026).toFixed(2));

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
    det += `Dedução dependentes (${dependentes} × R$ ${DEDUCAO_DEPENDENTE_2026.toFixed(2)}): -R$ ${resultado.deducaoDep.toFixed(2)}\n`;
  }
  det +=
    `Base IRRF: R$ ${resultado.baseIRRF.toFixed(2)}\n` +
    `IRRF: -R$ ${resultado.irrf.toFixed(2)}\n` +
    `Líquido a receber: R$ ${resultado.liquido.toFixed(2)}`;

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
  };
}
