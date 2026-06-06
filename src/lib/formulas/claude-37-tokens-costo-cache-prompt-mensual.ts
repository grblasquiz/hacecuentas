export interface Inputs {
  basePromptTokens: number;
  variableTokensPerRequest: number;
  outputTokensPerRequest: number;
  requestsPerDay: number;
  cacheHitRate: number;
  model: string;
}

export interface Outputs {
  monthlyCostWithCache: number;
  monthlyCostWithoutCache: number;
  monthlySavings: number;
  savingsPercent: number;
  breakdown: string;
  _insight?: any;
  _chart?: any;
}

// Precios en USD por millón de tokens — Anthropic 2026
// Fuente: https://www.anthropic.com/pricing
interface ModelPricing {
  inputNormal: number;   // USD / 1M tokens
  cacheWrite: number;   // USD / 1M tokens (1.25x input)
  cacheRead: number;    // USD / 1M tokens (0.10x input)
  output: number;       // USD / 1M tokens
}

const PRICING: Record<string, ModelPricing> = {
  // Claude Opus 4.8 — input $5/M, output $25/M
  "claude-opus-4-8": {
    inputNormal: 5.00,
    cacheWrite: 6.25, // 1.25x input
    cacheRead: 0.50,  // 0.10x input
    output: 25.00,
  },
  // Claude Sonnet 4.6 — input $3/M, output $15/M
  "claude-sonnet-4-6": {
    inputNormal: 3.00,
    cacheWrite: 3.75, // 1.25x input
    cacheRead: 0.30,  // 0.10x input
    output: 15.00,
  },
  // Claude Haiku 4.5 — input $1/M, output $5/M
  "claude-haiku-4-5": {
    inputNormal: 1.00,
    cacheWrite: 1.25, // 1.25x input
    cacheRead: 0.10,  // 0.10x input
    output: 5.00,
  },
};

const DAYS_PER_MONTH = 30;
const TOKENS_PER_MILLION = 1_000_000;

export function compute(i: Inputs): Outputs {
  const basePromptTokens = Math.max(0, Number(i.basePromptTokens) || 0);
  const variableTokensPerRequest = Math.max(0, Number(i.variableTokensPerRequest) || 0);
  const outputTokensPerRequest = Math.max(0, Number(i.outputTokensPerRequest) || 0);
  const requestsPerDay = Math.max(0, Number(i.requestsPerDay) || 0);
  // Cache hit rate: clamp between 0 and 100
  const cacheHitRatePct = Math.min(100, Math.max(0, Number(i.cacheHitRate) || 0));
  const cacheHitRate = cacheHitRatePct / 100;
  const model = i.model || "claude-sonnet-4-6";

  if (requestsPerDay <= 0 || (basePromptTokens <= 0 && variableTokensPerRequest <= 0)) {
    return {
      monthlyCostWithCache: 0,
      monthlyCostWithoutCache: 0,
      monthlySavings: 0,
      savingsPercent: 0,
      breakdown: "Ingresá valores válidos para calcular el costo.",
    };
  }

  const pricing = PRICING[model] ?? PRICING["claude-sonnet-4-6"];

  const requestsPerMonth = requestsPerDay * DAYS_PER_MONTH;

  // --- Tokens per request WITH caching ---
  // Portion of base prompt written to cache (cache miss)
  const writeCacheTokens = basePromptTokens * (1 - cacheHitRate);
  // Portion of base prompt read from cache (cache hit)
  const readCacheTokens = basePromptTokens * cacheHitRate;

  const costWritePerRequest = (writeCacheTokens / TOKENS_PER_MILLION) * pricing.cacheWrite;
  const costReadPerRequest = (readCacheTokens / TOKENS_PER_MILLION) * pricing.cacheRead;
  const costVariablePerRequest = (variableTokensPerRequest / TOKENS_PER_MILLION) * pricing.inputNormal;
  const costOutputPerRequest = (outputTokensPerRequest / TOKENS_PER_MILLION) * pricing.output;

  const costPerRequestWithCache =
    costWritePerRequest +
    costReadPerRequest +
    costVariablePerRequest +
    costOutputPerRequest;

  const monthlyCostWithCache = costPerRequestWithCache * requestsPerMonth;

  // --- Tokens per request WITHOUT caching ---
  const costInputNoCache = ((basePromptTokens + variableTokensPerRequest) / TOKENS_PER_MILLION) * pricing.inputNormal;
  const costOutputNoCache = (outputTokensPerRequest / TOKENS_PER_MILLION) * pricing.output;
  const costPerRequestWithoutCache = costInputNoCache + costOutputNoCache;
  const monthlyCostWithoutCache = costPerRequestWithoutCache * requestsPerMonth;

  // --- Savings ---
  const monthlySavings = monthlyCostWithoutCache - monthlyCostWithCache;
  const savingsPercent =
    monthlyCostWithoutCache > 0
      ? (monthlySavings / monthlyCostWithoutCache) * 100
      : 0;

  // --- Breakdown text ---
  const fmt = (n: number) => n.toFixed(4);
  const modelLabel =
    model === "claude-opus-4-8"
      ? "Claude Opus 4.8"
      : model === "claude-sonnet-4-6"
      ? "Claude Sonnet 4.6"
      : "Claude Haiku 4.5";

  const breakdown =
    `Modelo: ${modelLabel} | ${requestsPerMonth.toLocaleString()} req/mes\n` +
    `Cache write (${((1 - cacheHitRate) * 100).toFixed(0)}% de ${basePromptTokens.toLocaleString()} tokens): $${fmt(costWritePerRequest * requestsPerMonth)}/mes\n` +
    `Cache read (${cacheHitRatePct.toFixed(0)}% de ${basePromptTokens.toLocaleString()} tokens): $${fmt(costReadPerRequest * requestsPerMonth)}/mes\n` +
    `Tokens variables (${variableTokensPerRequest.toLocaleString()} tokens): $${fmt(costVariablePerRequest * requestsPerMonth)}/mes\n` +
    `Output (${outputTokensPerRequest.toLocaleString()} tokens): $${fmt(costOutputPerRequest * requestsPerMonth)}/mes`;

  // --- Insight + gráfico ---
  const usd = (n: number) => `US$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const _insight = {
    title: 'Ahorro por caching',
    text: `Con **${cacheHitRatePct.toFixed(0)}% de aciertos de caché**, el prompt te cuesta **${usd(monthlyCostWithCache)}/mes** en lugar de **${usd(monthlyCostWithoutCache)}/mes**: ahorrás **${usd(monthlySavings)}** (**${savingsPercent.toFixed(1)}%**). Subir el hit rate o reducir los tokens de salida es lo que más mueve la factura.`,
    tone: savingsPercent >= 15 ? 'good' : 'neutral',
    icon: '💸',
  };

  // Componentes mensuales que suman monthlyCostWithCache
  const mWrite = costWritePerRequest * requestsPerMonth;
  const mRead = costReadPerRequest * requestsPerMonth;
  const mVariable = costVariablePerRequest * requestsPerMonth;
  const mOutput = costOutputPerRequest * requestsPerMonth;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cache write', value: r2(mWrite) },
      { label: 'Cache read', value: r2(mRead) },
      { label: 'Input variable', value: r2(mVariable) },
      { label: 'Output', value: r2(mOutput) },
    ].filter(s => s.value > 0),
    prefix: 'US$',
    centerValue: usd(monthlyCostWithCache),
    centerLabel: 'Costo/mes',
    ariaLabel: `Costo mensual con caché ${usd(monthlyCostWithCache)}: cache write ${usd(mWrite)}, cache read ${usd(mRead)}, input variable ${usd(mVariable)}, output ${usd(mOutput)}.`,
  };

  return {
    monthlyCostWithCache: Math.round(monthlyCostWithCache * 100) / 100,
    monthlyCostWithoutCache: Math.round(monthlyCostWithoutCache * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    breakdown,
    _insight,
    _chart,
  };
}
