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
  "claude-37-sonnet": {
    inputNormal: 3.00,
    cacheWrite: 3.75,
    cacheRead: 0.30,
    output: 15.00,
  },
  "claude-35-sonnet": {
    inputNormal: 3.00,
    cacheWrite: 3.75,
    cacheRead: 0.30,
    output: 15.00,
  },
  "claude-3-haiku": {
    inputNormal: 0.80,
    cacheWrite: 1.00,
    cacheRead: 0.08,
    output: 4.00,
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
  const model = i.model || "claude-37-sonnet";

  if (requestsPerDay <= 0 || (basePromptTokens <= 0 && variableTokensPerRequest <= 0)) {
    return {
      monthlyCostWithCache: 0,
      monthlyCostWithoutCache: 0,
      monthlySavings: 0,
      savingsPercent: 0,
      breakdown: "Ingresá valores válidos para calcular el costo.",
    };
  }

  const pricing = PRICING[model] ?? PRICING["claude-37-sonnet"];

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
    model === "claude-37-sonnet"
      ? "Claude 3.7 Sonnet"
      : model === "claude-35-sonnet"
      ? "Claude 3.5 Sonnet"
      : "Claude 3.5 Haiku";

  const breakdown =
    `Modelo: ${modelLabel} | ${requestsPerMonth.toLocaleString()} req/mes\n` +
    `Cache write (${((1 - cacheHitRate) * 100).toFixed(0)}% de ${basePromptTokens.toLocaleString()} tokens): $${fmt(costWritePerRequest * requestsPerMonth)}/mes\n` +
    `Cache read (${cacheHitRatePct.toFixed(0)}% de ${basePromptTokens.toLocaleString()} tokens): $${fmt(costReadPerRequest * requestsPerMonth)}/mes\n` +
    `Tokens variables (${variableTokensPerRequest.toLocaleString()} tokens): $${fmt(costVariablePerRequest * requestsPerMonth)}/mes\n` +
    `Output (${outputTokensPerRequest.toLocaleString()} tokens): $${fmt(costOutputPerRequest * requestsPerMonth)}/mes`;

  return {
    monthlyCostWithCache: Math.round(monthlyCostWithCache * 100) / 100,
    monthlyCostWithoutCache: Math.round(monthlyCostWithoutCache * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    breakdown,
  };
}
