// Calculadora IRPF 2026 — Simplificada vs Completa
// Fonte: Receita Federal do Brasil — Tabela Progressiva IRPF 2025/2026
// https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas

export interface Inputs {
  renda_bruta_anual: number;
  inss_pago_anual: number;
  num_dependentes: number;
  despesas_saude: number;
  despesas_educacao: number;
  previdencia_privada: number;
}

export interface Outputs {
  ir_simplificada: number;
  ir_completa: number;
  economia: number;
  recomendacao: string;
  base_simplificada: number;
  base_completa: number;
  total_deducoes_completa: number;
  aliquota_efetiva_simplificada: number;
  aliquota_efetiva_completa: number;
}

// ── Tabela progressiva IRPF 2026 (ano-calendário 2025) ──────────────────────
// Fonte: Receita Federal do Brasil, Instrução Normativa vigente para 2026
const FAIXAS_ANUAIS_2026 = [
  { limite: 27110.40,  aliquota: 0.000, parcela_deduzir: 0.00 },
  { limite: 33919.80,  aliquota: 0.075, parcela_deduzir: 2033.28 },
  { limite: 45012.60,  aliquota: 0.150, parcela_deduzir: 4576.77 },
  { limite: 55976.16,  aliquota: 0.225, parcela_deduzir: 7913.22 },
  { limite: Infinity,  aliquota: 0.275, parcela_deduzir: 10712.03 },
];

// ── Constantes de dedução 2026 ───────────────────────────────────────────────
// Fonte: Receita Federal — Perguntas e Respostas IRPF 2026
const DEDUCAO_DEPENDENTE_ANUAL_2026 = 2275.08;   // R$/dependente/ano
const LIMITE_DEDUCAO_EDUCACAO_2026  = 3561.50;   // R$/pessoa/ano
const LIMITE_DESCONTO_SIMPLIFICADO  = 16754.34;  // R$/ano (teto 25%)
const PERCENTUAL_DESCONTO_SIMPLES   = 0.25;      // 25%
const PERCENTUAL_LIMITE_PGBL        = 0.12;      // 12% da renda bruta

function calcularIRProgressivo(base: number): number {
  if (base <= 0) return 0;
  for (const faixa of FAIXAS_ANUAIS_2026) {
    if (base <= faixa.limite) {
      const ir = base * faixa.aliquota - faixa.parcela_deduzir;
      return Math.max(0, ir);
    }
  }
  // fallback última faixa (nunca deve chegar aqui por Infinity)
  const ultima = FAIXAS_ANUAIS_2026[FAIXAS_ANUAIS_2026.length - 1];
  return Math.max(0, base * ultima.aliquota - ultima.parcela_deduzir);
}

export function compute(i: Inputs): Outputs {
  const rendaBruta       = Math.max(0, Number(i.renda_bruta_anual)   || 0);
  const inss             = Math.max(0, Number(i.inss_pago_anual)     || 0);
  const numDependentes   = Math.max(0, Math.floor(Number(i.num_dependentes) || 0));
  const saude            = Math.max(0, Number(i.despesas_saude)       || 0);
  const educacaoInformada = Math.max(0, Number(i.despesas_educacao)   || 0);
  const pgblInformado    = Math.max(0, Number(i.previdencia_privada)  || 0);

  // Validação básica
  if (rendaBruta <= 0) {
    return {
      ir_simplificada: 0,
      ir_completa: 0,
      economia: 0,
      recomendacao: "Informe um rendimento bruto anual válido para calcular.",
      base_simplificada: 0,
      base_completa: 0,
      total_deducoes_completa: 0,
      aliquota_efetiva_simplificada: 0,
      aliquota_efetiva_completa: 0,
    };
  }

  // ── MODALIDADE SIMPLIFICADA ─────────────────────────────────────────────────
  // Base: renda bruta − INSS − desconto padrão (25%, max R$ 16.754,34)
  const rendaAposINSS_simples = Math.max(0, rendaBruta - inss);
  const descontoPadrao = Math.min(
    rendaAposINSS_simples * PERCENTUAL_DESCONTO_SIMPLES,
    LIMITE_DESCONTO_SIMPLIFICADO
  );
  const baseSimplificada = Math.max(0, rendaAposINSS_simples - descontoPadrao);
  const irSimplificada   = calcularIRProgressivo(baseSimplificada);

  // ── MODALIDADE COMPLETA ─────────────────────────────────────────────────────
  // 1. INSS
  const deducaoINSS = inss;

  // 2. Dependentes: R$ 2.275,08 por dependente/ano
  const deducaoDependentes = numDependentes * DEDUCAO_DEPENDENTE_ANUAL_2026;

  // 3. Saúde: sem limite
  const deducaoSaude = saude;

  // 4. Educação: limite de R$ 3.561,50 por pessoa
  //    O limite se aplica por contribuinte + dependentes (cada um com teto próprio)
  //    Aqui simplificamos: teto total = R$ 3.561,50 × (1 + numDependentes)
  const limiteEducacaoTotal = LIMITE_DEDUCAO_EDUCACAO_2026 * (1 + numDependentes);
  const deducaoEducacao = Math.min(educacaoInformada, limiteEducacaoTotal);

  // 5. PGBL: até 12% da renda bruta tributável (apenas declaração completa)
  const limitePGBL = rendaBruta * PERCENTUAL_LIMITE_PGBL;
  const deducaoPGBL = Math.min(pgblInformado, limitePGBL);

  const totalDeducoesCompleta =
    deducaoINSS +
    deducaoDependentes +
    deducaoSaude +
    deducaoEducacao +
    deducaoPGBL;

  const baseCompleta = Math.max(0, rendaBruta - totalDeducoesCompleta);
  const irCompleta   = calcularIRProgressivo(baseCompleta);

  // ── COMPARAÇÃO ──────────────────────────────────────────────────────────────
  const diferencaAbsoluta = Math.abs(irSimplificada - irCompleta);

  let recomendacao: string;
  if (irSimplificada < irCompleta) {
    recomendacao = `✅ Declaração Simplificada é mais vantajosa. Você economiza R$ ${diferencaAbsoluta.toFixed(2).replace(".", ",")} em relação à Completa.`;
  } else if (irCompleta < irSimplificada) {
    recomendacao = `✅ Declaração Completa é mais vantajosa. Você economiza R$ ${diferencaAbsoluta.toFixed(2).replace(".", ",")} em relação à Simplificada.`;
  } else {
    recomendacao = "As duas modalidades resultam no mesmo imposto devido. Escolha a Simplificada pela praticidade.";
  }

  // ── ALÍQUOTAS EFETIVAS ──────────────────────────────────────────────────────
  const aliquotaEfetivaSimplificada = rendaBruta > 0 ? (irSimplificada / rendaBruta) * 100 : 0;
  const aliquotaEfetivaCompleta     = rendaBruta > 0 ? (irCompleta     / rendaBruta) * 100 : 0;

  return {
    ir_simplificada:           Math.round(irSimplificada * 100) / 100,
    ir_completa:               Math.round(irCompleta * 100) / 100,
    economia:                  Math.round(diferencaAbsoluta * 100) / 100,
    recomendacao,
    base_simplificada:         Math.round(baseSimplificada * 100) / 100,
    base_completa:             Math.round(baseCompleta * 100) / 100,
    total_deducoes_completa:   Math.round(totalDeducoesCompleta * 100) / 100,
    aliquota_efetiva_simplificada: Math.round(aliquotaEfetivaSimplificada * 100) / 100,
    aliquota_efetiva_completa:     Math.round(aliquotaEfetivaCompleta * 100) / 100,
  };
}
