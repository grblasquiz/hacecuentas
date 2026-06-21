/**
 * Goose × operário — quanto custa um AGENTE DE IA vs um FUNCIONÁRIO CLT (Brasil).
 *
 * Tema viral: "a IA vai substituir o trabalhador humano?". Esta calculadora
 * compara, em reais e por mês, o CUSTO de um agente de IA (ex.: Goose, da Block,
 * rodando sobre um modelo de linguagem) contra o custo REAL de um operário/
 * funcionário CLT para um volume de trabalho equivalente.
 *
 * Lógica (PT-BR):
 *   1. Custo real do operário para o EMPREGADOR = salário bruto × ~1,68.
 *      O multiplicador 1,68 aproxima os encargos trabalhistas brasileiros sobre
 *      a folha (empresa fora do Simples):
 *        - INSS patronal ............ 20%
 *        - FGTS ..................... 8%  (+ provisão da multa de 40% na rescisão)
 *        - 13º salário .............. ~8,33% (1/12 do ano)
 *        - Férias + 1/3 ............. ~11,11% (1/12 × 1,3333)
 *        - RAT/Sistema S/terceiros .. ~8% (média; varia por CNAE)
 *      Encargos diretos + provisões ≈ 68% sobre o bruto. É uma ESTIMATIVA: a
 *      conta exata depende do CNAE, do regime (Simples tem regra própria) e da
 *      convenção coletiva. Documentado em ENCARGOS_MULTIPLICADOR.
 *
 *   2. Custo do agente de IA = tokens processados no mês × preço médio do modelo.
 *      tokens/mês = tokensHora × horasMes. O preço é uma mistura ponderada de
 *      input/output (assumimos 60% input / 40% output, típico de um agente que
 *      lê muito contexto e gera respostas mais curtas). Preço USD por 1M tokens
 *      vigente em jun/2026; convertido a R$ com câmbio aproximado USD→BRL.
 *
 *   3. Saídas: custo mensal de cada um, custo/hora, custo anual, economia mensal
 *      e anual (operário − IA) e quantas vezes a IA sai mais barata por hora.
 *
 * Ressalva honesta (no _insight): preço de tokens ≠ custo total de uma operação
 * de IA (faltam orquestração, supervisão humana, ferramentas, retrabalho), e a
 * IA NÃO substitui julgamento, relacionamento nem responsabilidade legal.
 */

export interface Inputs {
  /** Salário bruto mensal do operário/funcionário CLT (R$). */
  salarioBruto: number;
  /** Horas trabalhadas por mês (default 220 = jornada CLT padrão). */
  horasMes?: number;
  /** Modelo de IA que roda o agente (chave do catálogo abaixo). */
  modeloIa?: string;
  /** Tokens (input+output) processados por hora de trabalho equivalente. */
  tokensHora?: number;
  __lang?: string;
}

export interface Outputs {
  /** Custo real do operário para o empregador, por mês (R$). */
  custoRealOperarioMes: number;
  /** Custo do operário por hora (R$). */
  custoOperarioHora: number;
  /** Custo do agente de IA por mês (R$). */
  custoIaMes: number;
  /** Custo do agente de IA por hora (R$). */
  custoIaHora: number;
  /** Economia mensal: operário − IA (R$). */
  economiaMensal: number;
  /** Economia anual: economia mensal × 12 (R$). */
  economiaAnual: number;
  /** Quantas vezes a IA é mais barata por hora (operário/IA). */
  vezesMaisBarata: number;
  _table?: any;
  _insight?: any;
}

/**
 * Multiplicador de encargos CLT (empresa fora do Simples). bruto × 1,68 ≈ custo
 * real do empregador. Detalhe da composição no cabeçalho do arquivo.
 * Reajuste/revisão anual (encargos e bases mudam em janeiro).
 */
export const ENCARGOS_MULTIPLICADOR = 1.68;

/** Câmbio aproximado USD→BRL (jun/2026). Hardcoded — valor de referência. */
export const USD_BRL = 5.4;

/** Proporção assumida input/output do agente (lê muito contexto, gera menos). */
const FRACAO_INPUT = 0.6;
const FRACAO_OUTPUT = 0.4;

/**
 * Catálogo de modelos de IA — preço USD por 1M de tokens (input / output),
 * vigente em jun/2026. Atualizar quando os provedores reajustarem.
 */
export const MODELOS_IA: Record<
  string,
  { label: string; inUSD: number; outUSD: number }
> = {
  'claude-sonnet': { label: 'Claude Sonnet 4.x', inUSD: 3, outUSD: 15 },
  'claude-haiku': { label: 'Claude Haiku 4.x', inUSD: 1, outUSD: 5 },
  'gpt-4o': { label: 'GPT-4o', inUSD: 2.5, outUSD: 10 },
  'gpt-4o-mini': { label: 'GPT-4o mini', inUSD: 0.15, outUSD: 0.6 },
  'gemini-flash': { label: 'Gemini 2.5 Flash', inUSD: 0.3, outUSD: 2.5 },
  'deepseek': { label: 'DeepSeek V3', inUSD: 0.27, outUSD: 1.1 },
};

const fmtBRL = (v: number) =>
  'R$ ' +
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Formato compacto para reais (sem centavos) em textos. */
const fmtBRL0 = (v: number) =>
  'R$ ' + Math.round(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

export function gooseAgenteIaVsOperarioHumanoCusto(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  if (!bruto || bruto <= 0) throw new Error('Informe o salário bruto mensal do operário (R$).');

  const horasMes = Number(i.horasMes) > 0 ? Number(i.horasMes) : 220;
  const tokensHora = Number(i.tokensHora) > 0 ? Number(i.tokensHora) : 50000;

  const modeloKey = (i.modeloIa as string) in MODELOS_IA ? (i.modeloIa as string) : 'gpt-4o-mini';
  const modelo = MODELOS_IA[modeloKey];

  // 1) Custo real do operário para o empregador.
  const custoRealOperarioMes = bruto * ENCARGOS_MULTIPLICADOR;
  const custoOperarioHora = custoRealOperarioMes / horasMes;

  // 2) Custo do agente de IA.
  const tokensMes = tokensHora * horasMes;
  // Preço médio ponderado (USD por 1M tokens) conforme mistura input/output.
  const precoMedioUSDpor1M = modelo.inUSD * FRACAO_INPUT + modelo.outUSD * FRACAO_OUTPUT;
  const custoIaUSDmes = (tokensMes * precoMedioUSDpor1M) / 1_000_000;
  const custoIaMes = custoIaUSDmes * USD_BRL;
  const custoIaHora = custoIaMes / horasMes;

  // 3) Comparação.
  const economiaMensal = custoRealOperarioMes - custoIaMes;
  const economiaAnual = economiaMensal * 12;
  const vezesMaisBarata = custoIaHora > 0 ? custoOperarioHora / custoIaHora : 0;

  // Arredondamentos de saída (R$ com 2 casas; o "vezes" com 1 casa).
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const out: Outputs = {
    custoRealOperarioMes: r2(custoRealOperarioMes),
    custoOperarioHora: r2(custoOperarioHora),
    custoIaMes: r2(custoIaMes),
    custoIaHora: r2(custoIaHora),
    economiaMensal: r2(economiaMensal),
    economiaAnual: r2(economiaAnual),
    vezesMaisBarata: Math.round(vezesMaisBarata * 10) / 10,
  };

  // _table: comparativo lado a lado (hook viral).
  out._table = {
    title: 'Operário humano (CLT) × Agente de IA',
    headers: ['', 'Operário humano (CLT)', `Agente de IA (${modelo.label})`],
    align: ['left', 'right', 'right'],
    rows: [
      ['Custo por mês', fmtBRL(custoRealOperarioMes), fmtBRL(custoIaMes)],
      ['Custo por hora', fmtBRL(custoOperarioHora), fmtBRL(custoIaHora)],
      ['Custo por ano', fmtBRL(custoRealOperarioMes * 12), fmtBRL(custoIaMes * 12)],
    ],
    footer: [
      'Economia anual com IA',
      fmtBRL(economiaAnual),
      `${out.vezesMaisBarata.toLocaleString('pt-BR')}× mais barata/h`,
    ],
    note:
      `Operário: salário bruto ${fmtBRL0(bruto)} × ${ENCARGOS_MULTIPLICADOR} de encargos CLT (estimativa, empresa fora do Simples). ` +
      `IA: ${tokensHora.toLocaleString('pt-BR')} tokens/h × ${horasMes}h = ${tokensMes.toLocaleString('pt-BR')} tokens/mês, ` +
      `preço médio US$ ${precoMedioUSDpor1M.toFixed(2)}/1M (60% input / 40% output), câmbio US$ 1 = R$ ${USD_BRL.toFixed(2)} (aprox.).`,
  };

  // _insight: narrativa honesta/equilibrada.
  const tone: 'good' | 'warn' | 'neutral' = out.vezesMaisBarata >= 10 ? 'good' : 'neutral';
  out._insight = {
    title: 'Operário × agente de IA: a conta',
    text:
      `Um operário CLT custa **${fmtBRL0(custoRealOperarioMes)}/mês** ao empregador ` +
      `(${fmtBRL0(custoOperarioHora)}/hora, já com os ~68% de encargos). O mesmo volume de trabalho ` +
      `com um agente de IA rodando **${modelo.label}** sai por **~${fmtBRL0(custoIaMes)}/mês** ` +
      `(${fmtBRL(custoIaHora)}/hora) — uma economia de **${fmtBRL0(economiaAnual)} por ano**, ` +
      `com a IA saindo **${out.vezesMaisBarata.toLocaleString('pt-BR')}× mais barata por hora**. ` +
      `Mas o preço dos tokens não é o custo total: faltam orquestração, supervisão humana, ferramentas e ` +
      `retrabalho. E a IA não substitui tudo — julgamento, relacionamento e responsabilidade legal continuam humanos.`,
    tone,
    icon: '🤖',
  };

  return out;
}
