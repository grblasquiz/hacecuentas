// Calculadora 13° Salário Líquido CLT — Hacé Cuentas
// Fontes: Lei 4.090/1962; Tabela INSS 2026 (Portaria MPS); Tabela IRRF 2026 (IN RFB)

export interface Inputs {
  salario_bruto: number;
  meses_trabalhados: string; // "1" a "12"
  dependentes: string; // "0" a "5"
}

export interface Outputs {
  decimo_terceiro_bruto: number;
  primeira_parcela: number;
  inss_desconto: number;
  base_irrf: number;
  irrf_desconto: number;
  segunda_parcela: number;
  liquido_total: number;
  aliquota_efetiva_irrf: number;
  detalhamento: string;
}

// --- Tabela INSS Progressiva 2026 ---
// Fonte: Portaria MPS/MF (vigente 2026)
const INSS_FAIXAS_2026 = [
  { ate: 1518.00,  aliquota: 0.075 },
  { ate: 2793.88,  aliquota: 0.090 },
  { ate: 4190.83,  aliquota: 0.120 },
  { ate: 8157.41,  aliquota: 0.140 },
];
const INSS_TETO_2026 = 908.86; // R$ 908,86 — teto de contribuição 2026

// --- Tabela IRRF Mensal 2026 ---
// Fonte: Instrução Normativa RFB (vigente 2026)
const IRRF_FAIXAS_2026 = [
  { ate: 2259.20,  aliquota: 0.000, deducao: 0.00    },
  { ate: 2826.65,  aliquota: 0.075, deducao: 169.44  },
  { ate: 3751.05,  aliquota: 0.150, deducao: 381.44  },
  { ate: 4664.68,  aliquota: 0.225, deducao: 662.77  },
  { ate: Infinity, aliquota: 0.275, deducao: 896.00  },
];

// Dedução por dependente IR 2026
const DEDUCAO_DEPENDENTE_2026 = 189.59; // R$ por dependente

function calcularINSSProgressivo(base: number): number {
  if (base <= 0) return 0;
  let inss = 0;
  let baseAnterior = 0;
  for (const faixa of INSS_FAIXAS_2026) {
    if (base <= baseAnterior) break;
    const valorNaFaixa = Math.min(base, faixa.ate) - baseAnterior;
    if (valorNaFaixa <= 0) break;
    inss += valorNaFaixa * faixa.aliquota;
    baseAnterior = faixa.ate;
    if (base <= faixa.ate) break;
  }
  // Aplica teto
  if (inss > INSS_TETO_2026) inss = INSS_TETO_2026;
  return Math.round(inss * 100) / 100;
}

function calcularIRRF(baseCalculo: number): { irrf: number; aliquotaNominal: number } {
  if (baseCalculo <= 0) return { irrf: 0, aliquotaNominal: 0 };
  for (const faixa of IRRF_FAIXAS_2026) {
    if (baseCalculo <= faixa.ate) {
      const irrf = Math.max(0, baseCalculo * faixa.aliquota - faixa.deducao);
      return { irrf: Math.round(irrf * 100) / 100, aliquotaNominal: faixa.aliquota };
    }
  }
  // Fallback: faixa máxima
  const faixaMax = IRRF_FAIXAS_2026[IRRF_FAIXAS_2026.length - 1];
  const irrf = Math.max(0, baseCalculo * faixaMax.aliquota - faixaMax.deducao);
  return { irrf: Math.round(irrf * 100) / 100, aliquotaNominal: faixaMax.aliquota };
}

function fmt(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function compute(i: Inputs): Outputs {
  const salarioBruto = Number(i.salario_bruto) || 0;
  const meses = Math.min(12, Math.max(1, parseInt(i.meses_trabalhados, 10) || 12));
  const dependentes = Math.min(10, Math.max(0, parseInt(i.dependentes, 10) || 0));

  // Validação básica
  if (salarioBruto <= 0) {
    return {
      decimo_terceiro_bruto: 0,
      primeira_parcela: 0,
      inss_desconto: 0,
      base_irrf: 0,
      irrf_desconto: 0,
      segunda_parcela: 0,
      liquido_total: 0,
      aliquota_efetiva_irrf: 0,
      detalhamento: "Informe um salário bruto válido para calcular o 13° salário.",
    };
  }

  // 1. 13° Bruto Proporcional
  const decimoTerceiroBruto = Math.round((salarioBruto * meses / 12) * 100) / 100;

  // 2. 1ª Parcela (50% do bruto, sem descontos)
  const primeiraParcela = Math.round(decimoTerceiroBruto * 0.5 * 100) / 100;

  // 3. INSS — calculado sobre o bruto integral do 13°
  const inssDesconto = calcularINSSProgressivo(decimoTerceiroBruto);

  // 4. Base IRRF = 13° Bruto − INSS − (dependentes × dedução)
  const deducaoDependentes = dependentes * DEDUCAO_DEPENDENTE_2026;
  const baseIRRF = Math.max(0, Math.round((decimoTerceiroBruto - inssDesconto - deducaoDependentes) * 100) / 100);

  // 5. IRRF sobre base
  const { irrf: irrfDesconto, aliquotaNominal } = calcularIRRF(baseIRRF);

  // 6. 2ª Parcela líquida = metade do bruto − INSS − IRRF (descontos na 2ª)
  const segundaParcelaLiquida = Math.round((primeiraParcela - inssDesconto - irrfDesconto) * 100) / 100;

  // 7. Líquido total
  const liquidoTotal = Math.round((primeiraParcela + segundaParcelaLiquida) * 100) / 100;

  // 8. Alíquota efetiva IRRF
  const aliquotaEfetiva = decimoTerceiroBruto > 0
    ? Math.round((irrfDesconto / decimoTerceiroBruto) * 10000) / 100
    : 0;

  // 9. Detalhamento textual
  const proporcionalStr = meses < 12 ? ` (${meses}/12 — proporcional)` : " (ano completo)";
  const dependentesStr = dependentes > 0
    ? `Dedução dependentes: R$ ${fmt(deducaoDependentes)} (${dependentes} dep. × R$ ${fmt(DEDUCAO_DEPENDENTE_2026)}). `
    : "Sem dedução de dependentes. ";
  const inssAliquota = inssDesconto > 0
    ? `Alíquota efetiva INSS: ${fmt((inssDesconto / decimoTerceiroBruto) * 100)}%. `
    : "";
  const irrfStr = irrfDesconto > 0
    ? `IRRF: alíquota nominal ${(aliquotaNominal * 100).toFixed(1)}%, efetiva ${fmt(aliquotaEfetiva)}%. `
    : "IRRF: isento na faixa 2026. ";

  const detalhamento =
    `13° bruto${proporcionalStr}: R$ ${fmt(decimoTerceiroBruto)}. ` +
    `1ª parcela (sem descontos): R$ ${fmt(primeiraParcela)}. ` +
    `INSS progressivo: R$ ${fmt(inssDesconto)}. ${inssAliquota}` +
    `Base IRRF: R$ ${fmt(baseIRRF)}. ${dependentesStr}` +
    irrfStr +
    `2ª parcela líquida: R$ ${fmt(segundaParcelaLiquida)}. ` +
    `Líquido total (1ª + 2ª): R$ ${fmt(liquidoTotal)}.`;

  return {
    decimo_terceiro_bruto: decimoTerceiroBruto,
    primeira_parcela: primeiraParcela,
    inss_desconto: inssDesconto,
    base_irrf: baseIRRF,
    irrf_desconto: irrfDesconto,
    segunda_parcela: segundaParcelaLiquida,
    liquido_total: liquidoTotal,
    aliquota_efetiva_irrf: aliquotaEfetiva,
    detalhamento,
  };
}
