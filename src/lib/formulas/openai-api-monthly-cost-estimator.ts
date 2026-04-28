export interface Inputs {
  model: string;
  input_tokens: number;
  output_tokens: number;
  requests_per_day: number;
  batch_api: string;
}

export interface Outputs {
  cost_per_day: number;
  cost_per_month: number;
  input_cost_month: number;
  output_cost_month: number;
  batch_savings_month: number;
  tokens_per_month: number;
  comparison: string;
}

// Pricing per 1,000,000 tokens (USD) — OpenAI public rates 2026
// Source: https://openai.com/api/pricing
const MODEL_PRICING: Record<string, { input: number; output: number; label: string }> = {
  gpt4o:      { input: 5.00,  output: 15.00, label: "GPT-4o" },
  gpt4o_mini: { input: 0.15,  output: 0.60,  label: "GPT-4o mini" },
  o3:         { input: 15.00, output: 60.00, label: "o3" },
};

// Comparison model pricing per 1,000,000 tokens (USD) — 2026
// Claude 3.5 Sonnet: https://www.anthropic.com/pricing
// Gemini 1.5 Pro (≤128K): https://ai.google.dev/pricing
const CLAUDE_SONNET_35 = { input: 3.00,  output: 15.00, label: "Claude 3.5 Sonnet" };
const GEMINI_15_PRO    = { input: 1.25,  output: 5.00,  label: "Gemini 1.5 Pro" };

// Batch API discount factor — OpenAI 2026
// Source: https://platform.openai.com/docs/guides/batch
const BATCH_DISCOUNT = 0.50; // 50% off

// Average days per month (Gregorian calendar average)
const DAYS_PER_MONTH = 30.44;

function calcMonthlyCost(
  inputTokens: number,
  outputTokens: number,
  requestsPerDay: number,
  pricingInput: number,
  pricingOutput: number,
  discountFactor: number
): { inputMonth: number; outputMonth: number; totalMonth: number } {
  const dailyInputTokens  = inputTokens  * requestsPerDay;
  const dailyOutputTokens = outputTokens * requestsPerDay;

  const dailyInputCost  = (dailyInputTokens  / 1_000_000) * pricingInput  * discountFactor;
  const dailyOutputCost = (dailyOutputTokens / 1_000_000) * pricingOutput * discountFactor;

  const inputMonth  = dailyInputCost  * DAYS_PER_MONTH;
  const outputMonth = dailyOutputCost * DAYS_PER_MONTH;
  const totalMonth  = inputMonth + outputMonth;

  return { inputMonth, outputMonth, totalMonth };
}

export function compute(i: Inputs): Outputs {
  const model          = i.model         || "gpt4o";
  const inputTokens    = Math.max(0, Number(i.input_tokens)    || 0);
  const outputTokens   = Math.max(0, Number(i.output_tokens)   || 0);
  const requestsPerDay = Math.max(0, Number(i.requests_per_day) || 0);
  const useBatch       = i.batch_api === "yes";

  if (inputTokens === 0 && outputTokens === 0) {
    return {
      cost_per_day: 0,
      cost_per_month: 0,
      input_cost_month: 0,
      output_cost_month: 0,
      batch_savings_month: 0,
      tokens_per_month: 0,
      comparison: "Enter token counts and request volume to see a comparison.",
    };
  }

  if (requestsPerDay === 0) {
    return {
      cost_per_day: 0,
      cost_per_month: 0,
      input_cost_month: 0,
      output_cost_month: 0,
      batch_savings_month: 0,
      tokens_per_month: 0,
      comparison: "Enter a daily request volume to calculate costs.",
    };
  }

  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["gpt4o"];
  const discountFactor = useBatch ? BATCH_DISCOUNT : 1.0;

  // ---- Main model cost ----
  const { inputMonth, outputMonth, totalMonth } = calcMonthlyCost(
    inputTokens, outputTokens, requestsPerDay,
    pricing.input, pricing.output, discountFactor
  );

  const costPerDay = totalMonth / DAYS_PER_MONTH;

  // ---- Batch savings vs standard ----
  let batchSavingsMonth = 0;
  if (useBatch) {
    const { totalMonth: standardMonth } = calcMonthlyCost(
      inputTokens, outputTokens, requestsPerDay,
      pricing.input, pricing.output, 1.0
    );
    batchSavingsMonth = standardMonth - totalMonth;
  }

  // ---- Total tokens per month ----
  const tokensPerMonth = Math.round(
    (inputTokens + outputTokens) * requestsPerDay * DAYS_PER_MONTH
  );

  // ---- Competitor comparison (standard pricing, no batch) ----
  const { totalMonth: claudeMonth } = calcMonthlyCost(
    inputTokens, outputTokens, requestsPerDay,
    CLAUDE_SONNET_35.input, CLAUDE_SONNET_35.output, 1.0
  );
  const { totalMonth: geminiMonth } = calcMonthlyCost(
    inputTokens, outputTokens, requestsPerDay,
    GEMINI_15_PRO.input, GEMINI_15_PRO.output, 1.0
  );

  const fmt = (n: number): string =>
    n < 0.01
      ? `$${n.toFixed(4)}`
      : n < 1
      ? `$${n.toFixed(3)}`
      : `$${n.toFixed(2)}`;

  const batchNote = useBatch ? " (Batch API)" : " (Standard)";
  const selectedLabel = pricing.label + batchNote;

  const comparisonLines = [
    `Same workload, standard pricing (no Batch API):`,
    `• ${selectedLabel}: ${fmt(totalMonth)}/mo`,
    `• ${CLAUDE_SONNET_35.label}: ${fmt(claudeMonth)}/mo`,
    `• ${GEMINI_15_PRO.label}: ${fmt(geminiMonth)}/mo`,
  ];

  const cheapest = [
    { label: selectedLabel,         cost: totalMonth  },
    { label: CLAUDE_SONNET_35.label, cost: claudeMonth },
    { label: GEMINI_15_PRO.label,    cost: geminiMonth },
  ].sort((a, b) => a.cost - b.cost)[0];

  if (cheapest.label !== selectedLabel) {
    const saving = totalMonth - cheapest.cost;
    comparisonLines.push(
      `💡 ${cheapest.label} would save ${fmt(saving)}/mo for this workload.`
    );
  } else {
    comparisonLines.push(`✅ Your selected model is the lowest cost option for this workload.`);
  }

  return {
    cost_per_day:        parseFloat(costPerDay.toFixed(6)),
    cost_per_month:      parseFloat(totalMonth.toFixed(4)),
    input_cost_month:    parseFloat(inputMonth.toFixed(4)),
    output_cost_month:   parseFloat(outputMonth.toFixed(4)),
    batch_savings_month: parseFloat(batchSavingsMonth.toFixed(4)),
    tokens_per_month:    tokensPerMonth,
    comparison:          comparisonLines.join("\n"),
  };
}
