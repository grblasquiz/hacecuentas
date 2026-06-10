/**
 * Fonte única de dados fiscais/trabalhistas do Brasil — 2026.
 *
 * Antes, cada fórmula PT hardcodeava esses valores (e muitos estavam
 * desatualizados — salário mínimo de 2024/2025, teto INSS antigo, faixas do
 * seguro-desemprego defasadas). Centralizar aqui evita drift entre fórmulas e
 * textos, e facilita o reajuste anual (um só arquivo).
 *
 * dataAsOf: 2026-06-05. Reajuste anual em janeiro (salário mínimo, INSS, IRRF,
 * seguro-desemprego pelo INPC). Reverificar fontes oficiais a cada janeiro.
 *
 * Fontes:
 *  - Salário mínimo: Decreto 12.797/2025 (R$ 1.621, +6,79% sobre R$ 1.518) —
 *    https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12797.htm
 *  - INSS 2026 (faixas, teto R$ 8.475,55): Portaria Interministerial MPS/MF.
 *  - Seguro-desemprego 2026 (teto R$ 2.518,65): MTE, vigência 11/01/2026 —
 *    https://www.gov.br/trabalho-e-emprego/pt-br
 *  - IRRF mensal: tabela progressiva vigente desde maio/2025 + redutor 2026
 *    (isenção efetiva até R$ 5.000) — Lei 14.663/2023 e reforma 2026.
 */

/** Salário mínimo nacional 2026 (Decreto 12.797/2025). */
export const SALARIO_MINIMO = 1621.0;

/* ───────────────────────── INSS 2026 ───────────────────────── */

/** Faixas progressivas do INSS 2026 (desconto do segurado CLT). */
export const INSS_FAIXAS = [
  { ate: 1621.0, aliquota: 0.075, deduzir: 0 },
  { ate: 2902.84, aliquota: 0.09, deduzir: 24.32 },
  { ate: 4354.27, aliquota: 0.12, deduzir: 111.4 },
  { ate: 8475.55, aliquota: 0.14, deduzir: 198.49 },
] as const;

/** Teto de contribuição do INSS 2026 (salário máximo). */
export const INSS_TETO = 8475.55;

/** Desconto máximo de INSS 2026 (teto × 14% − parcela a deduzir). */
export const INSS_CONTRIB_MAX = 988.09;

/** INSS progressivo do segurado CLT sobre o salário bruto (2026). */
export function calcINSS(salarioBruto: number): number {
  const base = Math.min(Math.max(salarioBruto, 0), INSS_TETO);
  for (const f of INSS_FAIXAS) {
    if (base <= f.ate) return Math.round((base * f.aliquota - f.deduzir) * 100) / 100;
  }
  return INSS_CONTRIB_MAX;
}

/* ───────────────────────── IRRF 2026 ───────────────────────── */
// A tabela progressiva mensal segue a vigente desde maio/2025; o redutor 2026
// (que zera o IR até R$ 5.000 e reduz parcialmente até R$ 7.350) é tratado nas
// fórmulas que o implementam. Aqui ficam as deduções fixas confirmadas.

/** Dedução por dependente no IRRF (mensal, 2026). */
export const IRRF_DEDUCAO_DEPENDENTE = 189.59;
/** Desconto simplificado mensal do IRRF 2026. */
export const IRRF_SIMPLIFICADO_MENSAL = 607.2;
/** Renda tributável mensal isenta de IR em 2026 via redutor (reforma). */
export const IRRF_ISENCAO_REDUTOR = 5000.0;
/** Teto do redutor (acima disso, sem redução). */
export const IRRF_REDUTOR_TETO = 7350.0;
/** Alíquota máxima do IRRF. */
export const IRRF_ALIQUOTA_MAX = 0.275;

/** Tabela progressiva mensal do IRRF (vigente desde mai/2025): alíquota × base − parcela a deduzir. */
export const IRRF_FAIXAS = [
  { ate: 2428.8, aliquota: 0, deduzir: 0 },
  { ate: 2826.65, aliquota: 0.075, deduzir: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deduzir: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deduzir: 675.49 },
  { ate: Infinity, aliquota: 0.275, deduzir: 908.73 },
] as const;

/** IRRF pela tabela cheia (sem o redutor 2026). */
export function calcIRRFTabelaCheia(base: number): number {
  if (base <= 0) return 0;
  for (const f of IRRF_FAIXAS) {
    if (base <= f.ate) return Math.max(0, base * f.aliquota - f.deduzir);
  }
  return 0;
}

/**
 * IRRF mensal 2026 com o redutor da reforma: IR zerado até base de R$ 5.000,
 * redução linear até R$ 7.350 (aproximação documentada da regra de transição),
 * tabela cheia acima. Mesma lógica usada pelo simulador de holerite — manter
 * uma única implementação evita divergência entre calcs.
 */
export function calcIRRF2026(base: number): number {
  if (base <= IRRF_ISENCAO_REDUTOR) return 0;
  const cheio = calcIRRFTabelaCheia(base);
  if (base >= IRRF_REDUTOR_TETO) return cheio;
  const fator = (base - IRRF_ISENCAO_REDUTOR) / (IRRF_REDUTOR_TETO - IRRF_ISENCAO_REDUTOR);
  return cheio * fator;
}

/* ──────────────────── Seguro-desemprego 2026 ──────────────────── */
// Tabela MTE vigente desde 11/01/2026 (reajuste pelo INPC).
export const SEGURO_DESEMPREGO = {
  /** Até este valor de média: recebe 80% da média. */
  faixa1: 2222.17,
  /** Até este valor: R$ 1.777,74 + 50% do que exceder a faixa1. */
  faixa2: 3703.99,
  /** Parcela fixa somada na faixa intermediária. */
  parcelaFixa: 1777.74,
  /** Teto do benefício. */
  teto: 2518.65,
  /** Piso = 1 salário mínimo. */
  piso: SALARIO_MINIMO,
} as const;

/** Valor da parcela do seguro-desemprego pela média dos 3 últimos salários (2026). */
export function calcSeguroDesemprego(media: number): number {
  const S = SEGURO_DESEMPREGO;
  let valor: number;
  if (media <= S.faixa1) valor = media * 0.8;
  else if (media <= S.faixa2) valor = S.parcelaFixa + (media - S.faixa1) * 0.5;
  else valor = S.teto;
  valor = Math.min(Math.max(valor, S.piso), S.teto);
  return Math.round(valor * 100) / 100;
}

/* ──────────────────────── DAS MEI 2026 ──────────────────────── */
// INSS = 5% do salário mínimo (TAC transportador: 12%); + ICMS R$ 1 (comércio)
// e/ou ISS R$ 5 (serviços). Vencimento dia 20 (PGMEI).
export const DAS_MEI = {
  inss5: Math.round(SALARIO_MINIMO * 0.05 * 100) / 100, // 81.05
  inss12: Math.round(SALARIO_MINIMO * 0.12 * 100) / 100, // 194.52
  icms: 1.0,
  iss: 5.0,
  get comercio() { return Math.round((this.inss5 + this.icms) * 100) / 100; }, // 82.05
  get servicos() { return Math.round((this.inss5 + this.iss) * 100) / 100; }, // 86.05
  get comercioServicos() { return Math.round((this.inss5 + this.icms + this.iss) * 100) / 100; }, // 87.05
  get transportador() { return Math.round((this.inss12 + this.icms) * 100) / 100; }, // 195.52
} as const;
