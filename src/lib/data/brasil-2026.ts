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

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-05';

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

/* ───────────────────── FGTS / SFH habitação ───────────────────── */
// Teto do valor do imóvel para uso do FGTS dentro do SFH. Elevado de R$ 1,5 mi
// para R$ 2,25 mi em nov/2025 (Resolução CMN 5.255; Conselho Curador do FGTS).
// Fontes:
//  - https://agenciabrasil.ebc.com.br/economia/noticia/2025-11/conselho-do-fgts-libera-uso-do-fundo-para-imoveis-de-ate-r-225-mi
//  - https://www.registrodeimoveis.org.br/imoveis-de-ate-2-25-mi-poderao-usar-fgts
/** Teto do valor do imóvel (SFH) para uso do FGTS em 2026: R$ 2.250.000. */
export const FGTS_TETO_IMOVEL_SFH = 2_250_000;

/** Alíquota de depósito mensal do FGTS — art. 15 da Lei 8.036/1990 (8%, fixa). */
export const FGTS_ALIQUOTA_DEPOSITO = 0.08;

/* ──────────────────────── DAS MEI 2026 ──────────────────────── */
// Limite de faturamento anual do MEI: R$ 81.000 (R$ 6.750/mês), inalterado
// desde 2018 — nenhum reajuste confirmado para 2026 (projetos para R$ 130k/150k
// seguem em tramitação, não aprovados). Tolerância de +20% (R$ 97.200) antes do
// desenquadramento retroativo. Fontes:
//  - https://www.infinitepay.io/blog/limite-faturamento-mei-2026
//  - https://www.serasaexperian.com.br/conteudos/limite-de-faturamento-mei/
/** Teto de faturamento anual do MEI 2026: R$ 81.000. */
export const MEI_LIMITE_FATURAMENTO = 81_000;
/** Teto com tolerância de +20% (R$ 97.200): acima disso, desenquadramento retroativo. */
export const MEI_LIMITE_FATURAMENTO_20 = 97_200;
/** Limite proporcional ao 1º ano (R$ 6.750/mês): teto anual ÷ 12. */
export const MEI_LIMITE_FATURAMENTO_MENSAL = MEI_LIMITE_FATURAMENTO / 12;

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

/* ───────────── Empregado doméstico — eSocial / DAE 2026 ───────────── */
// Encargos patronais recolhidos mensalmente no DAE (Simples Doméstico, LC 150/2015),
// somam ~20% sobre a remuneração, além do salário e do INSS retido do empregado.
// Fontes:
//  - LC 150/2015, art. 34 (composição do DAE) —
//    https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp150.htm
//  - eSocial Doméstico (gov.br) —
//    https://www.gov.br/esocial/pt-br/domestico
/** Encargos patronais do empregador doméstico (percentuais sobre a remuneração, 2026). */
export const DOMESTICA_ENCARGOS = {
  /** INSS patronal (contribuição do empregador). */
  inssPatronal: 0.08,
  /** FGTS mensal (depósito). */
  fgts: 0.08,
  /** FGTS compensatório (antecipação da multa rescisória de 40% — art. 22 LC 150). */
  fgtsCompensatorio: 0.032,
  /** GILRAT / seguro de acidente de trabalho. */
  gilrat: 0.008,
  /** Soma dos encargos patronais recolhidos no DAE = 20%. */
  get patronalTotal() {
    return Math.round((this.inssPatronal + this.fgts + this.fgtsCompensatorio + this.gilrat) * 1000) / 1000;
  },
} as const;

/** INSS do empregado doméstico retido no DAE (mesma tabela progressiva do CLT — usa calcINSS). */

/* ───────────── Salário-família 2026 (INSS) ───────────── */
// Portaria Interministerial MPS/MF nº 13/2026: cota de R$ 67,54 por filho de até
// 14 anos (ou inválido de qualquer idade), para quem recebe até o teto de remuneração.
// Fontes:
//  - INSS — Salário-família (valor limite) —
//    https://www.gov.br/inss/pt-br/direitos-e-deveres/salario-familia/valor-limite-para-direito-ao-salario-familia
/** Valor da cota mensal do salário-família por filho (2026). */
export const SALARIO_FAMILIA_COTA = 67.54;
/** Teto de remuneração mensal para ter direito ao salário-família (2026). */
export const SALARIO_FAMILIA_TETO = 1980.38;

/* ───────────── Bandeiras tarifárias 2026 (ANEEL) ───────────── */
// Acréscimo na conta de luz por 100 kWh consumidos, conforme a bandeira vigente.
// Valores de referência para 2026. Fonte:
//  - ANEEL — Bandeiras tarifárias —
//    https://www.gov.br/aneel/pt-br/assuntos/tarifas/bandeiras-tarifarias
/** Acréscimo por kWh de cada bandeira tarifária (R$/kWh, 2026). */
export const BANDEIRAS_TARIFARIAS = {
  verde: 0,
  amarela: 1.88 / 100,      // R$ 1,88 por 100 kWh
  vermelha1: 4.46 / 100,    // R$ 4,46 por 100 kWh (patamar 1)
  vermelha2: 7.87 / 100,    // R$ 7,87 por 100 kWh (patamar 2)
} as const;

/* ───────────── UFESP e ITCMD São Paulo 2026 ───────────── */
// UFESP 2026 = R$ 38,42 (Comunicado DA SEFAZ-SP, DOE 18/12/2025). ITCMD-SP: alíquota
// fixa de 4% (Lei 10.705/2000), mantida em 2026 (progressividade até 8% depende de
// lei estadual ainda não aprovada). Isenções expressas em UFESP.
// Fontes:
//  - UFESP 2026 — https://portal.fazenda.sp.gov.br/Noticias/Paginas/ufesp2026.aspx
//  - Lei 10.705/2000 (ITCMD-SP, alíquota e isenções) —
//    https://legislacao.fazenda.sp.gov.br/Paginas/lei10705.aspx
/** Valor da UFESP para 2026 (R$). */
export const UFESP_2026 = 38.42;
/** ITCMD São Paulo 2026: alíquota fixa e faixas de isenção (em UFESP). */
export const ITCMD_SP = {
  aliquota: 0.04,
  /** Doação isenta até 2.500 UFESPs por ano (por doador/donatário). */
  isencaoDoacaoUfesp: 2500,
  /** Herança: imóvel único de até 2.500 UFESPs é isento. */
  isencaoHerancaImovelUnicoUfesp: 2500,
  get isencaoDoacaoReais() { return Math.round(this.isencaoDoacaoUfesp * UFESP_2026 * 100) / 100; }, // 96.050
  get isencaoHerancaReais() { return Math.round(this.isencaoHerancaImovelUnicoUfesp * UFESP_2026 * 100) / 100; }, // 96.050
} as const;

/* ───────────── IPVA 2026 — Paraná e Santa Catarina ───────────── */
// Base de cálculo: valor venal (tabela FIPE). Alíquotas confirmadas para 2026.
// PARANÁ: redução de 45% — de 3,5% para 1,9% sobre autos (menor alíquota do Brasil).
//   Fonte: Governo do Paraná / DETRAN-PR —
//   https://www.parana.pr.gov.br/aen/Noticia/Com-reducao-de-45-Parana-tera-menor-aliquota-de-IPVA-do-Brasil-em-2026
// SANTA CATARINA: 2% autos de passeio/utilitários; 1% motos, caminhões, ônibus,
//   micro-ônibus, veículos de carga e locadoras.
//   Fonte: SEF-SC — https://www.sef.sc.gov.br/servicos-orgao/25/IPVA
/** Alíquotas do IPVA Paraná 2026 (% sobre o valor venal FIPE). */
export const IPVA_PR_ALIQUOTAS: Record<string, number> = {
  auto: 1.9,
  moto: 1.0,
  caminhao: 1.0,
  onibus: 1.0,
  locadora: 0.5,
};
/** Alíquotas do IPVA Santa Catarina 2026 (% sobre o valor venal FIPE). */
export const IPVA_SC_ALIQUOTAS: Record<string, number> = {
  auto: 2.0,
  utilitario: 2.0,
  moto: 1.0,
  caminhao: 1.0,
  onibus: 1.0,
  locadora: 1.0,
};
