export interface Inputs {
  doc_tokens: number;
  query_tokens: number;
  output_tokens: number;
  queries_per_month: number;
  modelo: string;
  rag_retrieval_tokens: number;
  rag_modelo: string;
  doc_update_frequency: string;
}

export interface Outputs {
  long_context_cost_per_request: number;
  rag_cost_per_request: number;
  long_context_monthly: number;
  rag_monthly: number;
  savings_monthly: number;
  fits_in_200k: string;
  fits_in_1m: string;
  recommendation: string;
}

// Prices in USD per 1M tokens — verified mid-2026
const MODEL_PRICES: Record<string, { inputLow: number; inputHigh: number; thresholdTokens: number; output: number; maxContext: number }> = {
  // Gemini 2.5 Pro: $1.25/1M input up to 200K, $2.50/1M above 200K, $10.00/1M output
  gemini25_pro:   { inputLow: 1.25,  inputHigh: 2.50,  thresholdTokens: 200_000, output: 10.00, maxContext: 1_000_000 },
  // Gemini 2.5 Flash: flat $0.15/1M input, $0.60/1M output up to 1M context
  gemini25_flash: { inputLow: 0.15,  inputHigh: 0.15,  thresholdTokens: 1_000_000, output: 0.60, maxContext: 1_000_000 },
  // Claude Sonnet 4: $3.00/1M input, $15.00/1M output, 1M context
  claude_sonnet4: { inputLow: 3.00,  inputHigh: 3.00,  thresholdTokens: 1_000_000, output: 15.00, maxContext: 1_000_000 },
  // Claude Haiku 3.5: $0.80/1M input, $4.00/1M output, 200K context
  claude_haiku35: { inputLow: 0.80,  inputHigh: 0.80,  thresholdTokens: 200_000,   output: 4.00,  maxContext: 200_000 },
  // GPT-4o: $2.50/1M input, $10.00/1M output, 128K context
  gpt4o:          { inputLow: 2.50,  inputHigh: 2.50,  thresholdTokens: 128_000,   output: 10.00, maxContext: 128_000 },
};

const RAG_MODEL_PRICES: Record<string, { input: number; output: number }> = {
  gpt4o_mini:     { input: 0.15,  output: 0.60 },
  gemini25_flash: { input: 0.15,  output: 0.60 },
  claude_haiku35: { input: 0.80,  output: 4.00 },
  gpt4o:          { input: 2.50,  output: 10.00 },
};

function calcLongContextCost(totalInputTokens: number, outputTokens: number, modelKey: string): number {
  const m = MODEL_PRICES[modelKey];
  if (!m) return 0;
  // Apply tiered pricing if applicable
  let inputCostPer1M: number;
  if (totalInputTokens > m.thresholdTokens) {
    // Blended: tokens up to threshold at low price, remainder at high price
    const lowPart = m.thresholdTokens;
    const highPart = totalInputTokens - m.thresholdTokens;
    inputCostPer1M = (lowPart * m.inputLow + highPart * m.inputHigh) / totalInputTokens;
  } else {
    inputCostPer1M = m.inputLow;
  }
  const inputCost = (totalInputTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * m.output;
  return inputCost + outputCost;
}

function calcRagCost(ragRetrievalTokens: number, queryTokens: number, outputTokens: number, ragModelKey: string): number {
  const rm = RAG_MODEL_PRICES[ragModelKey];
  if (!rm) return 0;
  const totalInput = ragRetrievalTokens + queryTokens;
  const inputCost = (totalInput / 1_000_000) * rm.input;
  const outputCost = (outputTokens / 1_000_000) * rm.output;
  return inputCost + outputCost;
}

export function compute(i: Inputs): Outputs {
  const docTokens = Math.max(0, Number(i.doc_tokens) || 0);
  const queryTokens = Math.max(0, Number(i.query_tokens) || 0);
  const outputTokens = Math.max(0, Number(i.output_tokens) || 0);
  const queriesPerMonth = Math.max(0, Number(i.queries_per_month) || 0);
  const ragRetrievalTokens = Math.max(0, Number(i.rag_retrieval_tokens) || 0);
  const modelo = i.modelo || "gemini25_pro";
  const ragModelo = i.rag_modelo || "gpt4o_mini";
  const docUpdateFrequency = i.doc_update_frequency || "static";

  if (docTokens === 0) {
    return {
      long_context_cost_per_request: 0,
      rag_cost_per_request: 0,
      long_context_monthly: 0,
      rag_monthly: 0,
      savings_monthly: 0,
      fits_in_200k: "Ingresá el tamaño del documento",
      fits_in_1m: "Ingresá el tamaño del documento",
      recommendation: "Ingresá los datos del documento para obtener una recomendación.",
    };
  }

  const totalLcInput = docTokens + queryTokens;
  const modelInfo = MODEL_PRICES[modelo];
  const maxContext = modelInfo ? modelInfo.maxContext : 200_000;

  // Long context cost
  const lcCostPerRequest = calcLongContextCost(totalLcInput, outputTokens, modelo);
  const lcMonthly = lcCostPerRequest * queriesPerMonth;

  // RAG cost
  const ragCostPerRequest = calcRagCost(ragRetrievalTokens, queryTokens, outputTokens, ragModelo);
  const ragMonthly = ragCostPerRequest * queriesPerMonth;

  const savingsMonthly = lcMonthly - ragMonthly;

  // Fit checks
  const fitsIn200k = totalLcInput <= 200_000;
  const fitsIn1m = totalLcInput <= 1_000_000;
  const exceedsModelContext = totalLcInput > maxContext;

  const fits200kText = fitsIn200k
    ? `✅ Sí (${(totalLcInput / 1000).toFixed(0)}K tokens ≤ 200K)`
    : `❌ No (${(totalLcInput / 1000).toFixed(0)}K tokens > 200K)`;

  const fits1mText = fitsIn1m
    ? `✅ Sí (${(totalLcInput / 1000).toFixed(0)}K tokens ≤ 1M)`
    : `❌ No (${(totalLcInput / 1000).toFixed(0)}K tokens > 1M — solo RAG viable)`;

  // Build recommendation
  let recommendation = "";

  if (!fitsIn1m) {
    recommendation = "🔴 El documento supera 1M tokens: long context no es viable. Usá RAG o una arquitectura de agentes con múltiples llamadas.";
  } else if (exceedsModelContext && fitsIn1m) {
    recommendation = `⚠️ El documento no entra en ${modelo} (máx ${(maxContext / 1000).toFixed(0)}K tokens). Considerá Gemini 2.5 Pro/Flash o Claude Sonnet 4 con 1M context.`;
  } else if (!fitsIn200k && fitsIn1m) {
    // Needs a 1M model
    if (queriesPerMonth > 50 && (docUpdateFrequency === "static" || docUpdateFrequency === "monthly")) {
      recommendation = `💡 El doc requiere un modelo 1M. Con ${queriesPerMonth} consultas/mes y corpus estable, RAG con ${ragModelo} ahorra ~$${savingsMonthly.toFixed(2)}/mes frente a long context. Recomendado: RAG.`;
    } else if (queriesPerMonth <= 10) {
      recommendation = `✅ Pocas consultas (${queriesPerMonth}/mes) sobre un doc grande: long context one-shot es más simple y el costo extra (~$${lcMonthly.toFixed(2)}/mes) puede valer la pena por la simplicidad.`;
    } else if (docUpdateFrequency === "daily") {
      recommendation = "⚠️ Corpus con actualización diaria y rango 200K–1M: long context evita re-indexado pero el costo por query es alto. Evaluá si el ahorro en infra de RAG justifica el mayor costo de tokens.";
    } else {
      recommendation = `📊 Con ${queriesPerMonth} consultas/mes: long context cuesta $${lcMonthly.toFixed(2)}/mes vs RAG $${ragMonthly.toFixed(2)}/mes. El ahorro con RAG es $${savingsMonthly.toFixed(2)}/mes. Umbral de decisión: >50 queries/mes suele favorecer RAG.`;
    }
  } else {
    // Fits in 200K
    if (queriesPerMonth > 200) {
      recommendation = `💡 El doc entra en 200K context pero con ${queriesPerMonth} queries/mes, RAG ahorra ~$${savingsMonthly.toFixed(2)}/mes ($${ragMonthly.toFixed(2)} vs $${lcMonthly.toFixed(2)}). Si la calidad con RAG es suficiente, es la mejor opción.`;
    } else if (queriesPerMonth <= 20) {
      recommendation = `✅ Doc ≤200K tokens y pocas consultas (${queriesPerMonth}/mes): long context es simple y económico a $${lcMonthly.toFixed(2)}/mes. Ideal para análisis one-shot o prototipado.`;
    } else {
      recommendation = `📊 Doc dentro de 200K context. Long context: $${lcMonthly.toFixed(2)}/mes; RAG: $${ragMonthly.toFixed(2)}/mes. Si el análisis requiere correlacionar todo el doc, priorizá long context. Para Q&A puntual, RAG es más eficiente.`;
    }
  }

  return {
    long_context_cost_per_request: Math.round(lcCostPerRequest * 1_000_000) / 1_000_000,
    rag_cost_per_request: Math.round(ragCostPerRequest * 1_000_000) / 1_000_000,
    long_context_monthly: Math.round(lcMonthly * 100) / 100,
    rag_monthly: Math.round(ragMonthly * 100) / 100,
    savings_monthly: Math.round(savingsMonthly * 100) / 100,
    fits_in_200k: fits200kText,
    fits_in_1m: fits1mText,
    recommendation,
  };
}
