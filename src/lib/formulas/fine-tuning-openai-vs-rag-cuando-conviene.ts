export interface Inputs {
  taskType: string;
  datasetSizeKB: number;
  updateFrequency: string;
  requestsPerMonth: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  ragChunks: number;
  avgChunkTokens: number;
  vectorDbSizeGB: number;
}

export interface Outputs {
  recommendation: string;
  ftTotalMonthly: number;
  ragTotalMonthly: number;
  ftTrainingCost: number;
  ftInferenceCost: number;
  ragEmbeddingCost: number;
  ragInferenceCost: number;
  ragVectorDbCost: number;
  savingsPercent: number;
  scoreBreakdown: string;
}

export function compute(i: Inputs): Outputs {
  // --- Sanitize inputs ---
  const datasetSizeKB = Math.max(0, Number(i.datasetSizeKB) || 0);
  const requestsPerMonth = Math.max(0, Number(i.requestsPerMonth) || 0);
  const avgInputTokens = Math.max(1, Number(i.avgInputTokens) || 1);
  const avgOutputTokens = Math.max(1, Number(i.avgOutputTokens) || 1);
  const ragChunks = Math.max(0, Number(i.ragChunks) || 0);
  const avgChunkTokens = Math.max(0, Number(i.avgChunkTokens) || 0);
  const vectorDbSizeGB = Math.max(0, Number(i.vectorDbSizeGB) || 0);
  const updateFrequency = i.updateFrequency || "monthly";
  const taskType = i.taskType || "generation";

  // --- Fine-tune pricing (OpenAI gpt-4o-mini, 2026) ---
  // Source: https://openai.com/api/pricing/
  const FT_TRAINING_COST_PER_M_TOKENS = 25.0; // USD per 1M training tokens
  const FT_INFERENCE_INPUT_PER_M = 0.30;       // USD per 1M input tokens (fine-tuned)
  const FT_INFERENCE_OUTPUT_PER_M = 1.20;      // USD per 1M output tokens (fine-tuned)

  // --- RAG / base model pricing (gpt-4o-mini base, 2026) ---
  const RAG_BASE_INPUT_PER_M = 0.15;           // USD per 1M input tokens
  const RAG_BASE_OUTPUT_PER_M = 0.60;          // USD per 1M output tokens
  const RAG_EMBEDDING_PER_M = 0.02;            // USD per 1M tokens (text-embedding-3-small)

  // --- Vector DB base cost ---
  const VECTOR_DB_BASE_FEE = 10.0;             // USD/month minimum production tier
  const VECTOR_DB_PER_GB = 10.0;               // USD/month per GB over 1 GB

  // ============================================================
  // FINE-TUNING COST
  // ============================================================

  // Approximate token count from KB: ~4 bytes per token (UTF-8 average)
  const tokensInDataset = (datasetSizeKB * 1000) / 4;
  const trainingCostOneRun = (tokensInDataset / 1_000_000) * FT_TRAINING_COST_PER_M_TOKENS;

  // How many times do we retrain per month? Amortize accordingly.
  let retrainingRunsPerMonth: number;
  switch (updateFrequency) {
    case "never":   retrainingRunsPerMonth = 1 / 12; break; // once per year
    case "monthly": retrainingRunsPerMonth = 1;      break;
    case "weekly":  retrainingRunsPerMonth = 4;      break;
    case "daily":   retrainingRunsPerMonth = 30;     break;
    default:        retrainingRunsPerMonth = 1;      break;
  }

  const ftTrainingCost = trainingCostOneRun * retrainingRunsPerMonth;

  // Inference: fine-tuned model — no extra context chunks needed
  const ftInferenceCost =
    (requestsPerMonth * avgInputTokens  / 1_000_000) * FT_INFERENCE_INPUT_PER_M +
    (requestsPerMonth * avgOutputTokens / 1_000_000) * FT_INFERENCE_OUTPUT_PER_M;

  const ftTotalMonthly = ftTrainingCost + ftInferenceCost;

  // ============================================================
  // RAG COST
  // ============================================================

  // Embedding cost per query
  const ragEmbeddingCost =
    (requestsPerMonth * avgInputTokens / 1_000_000) * RAG_EMBEDDING_PER_M;

  // Inference: base LLM gets original prompt + retrieved chunks
  const tokensInputRag = avgInputTokens + ragChunks * avgChunkTokens;
  const ragInferenceCost =
    (requestsPerMonth * tokensInputRag   / 1_000_000) * RAG_BASE_INPUT_PER_M +
    (requestsPerMonth * avgOutputTokens  / 1_000_000) * RAG_BASE_OUTPUT_PER_M;

  // Vector DB hosting
  const ragVectorDbCost = VECTOR_DB_BASE_FEE + Math.max(0, vectorDbSizeGB - 1) * VECTOR_DB_PER_GB;

  const ragTotalMonthly = ragEmbeddingCost + ragInferenceCost + ragVectorDbCost;

  // ============================================================
  // QUALITATIVE SCORING (0-8 scale, higher = favor Fine-tune)
  // ============================================================
  const scoreFactors: string[] = [];
  let score = 0;

  // Factor 1: Update frequency
  if (updateFrequency === "never") {
    score += 2;
    scoreFactors.push("Datos estables → +2 Fine-tune");
  } else if (updateFrequency === "monthly") {
    score += 1;
    scoreFactors.push("Actualización mensual → +1 neutro");
  } else {
    score += 0;
    scoreFactors.push("Datos frecuentes → +0 (favorece RAG)");
  }

  // Factor 2: Task type
  if (taskType === "classification") {
    score += 2;
    scoreFactors.push("Clasificación/extracción → +2 Fine-tune");
  } else if (taskType === "generation") {
    score += 1;
    scoreFactors.push("Generación texto → +1 neutro");
  } else {
    score += 0;
    scoreFactors.push("Q&A sobre docs → +0 (favorece RAG)");
  }

  // Factor 3: Dataset size
  if (datasetSizeKB > 1000) {
    score += 2;
    scoreFactors.push("Dataset > 1 MB → +2 Fine-tune");
  } else if (datasetSizeKB >= 200) {
    score += 1;
    scoreFactors.push("Dataset 200 KB–1 MB → +1 neutro");
  } else {
    score += 0;
    scoreFactors.push("Dataset < 200 KB → +0 (favorece RAG)");
  }

  // Factor 4: Request volume
  if (requestsPerMonth > 50000) {
    score += 2;
    scoreFactors.push("Volumen > 50 k req/mes → +2 Fine-tune");
  } else if (requestsPerMonth >= 10000) {
    score += 1;
    scoreFactors.push("Volumen 10 k–50 k req/mes → +1 neutro");
  } else {
    score += 0;
    scoreFactors.push("Volumen < 10 k req/mes → +0 (favorece RAG)");
  }

  // Max score = 8
  const scoreSummary = `Score Fine-tune: ${score}/8 | ${scoreFactors.join(" | ")}`;

  // ============================================================
  // RECOMMENDATION
  // ============================================================
  let recommendation: string;
  let savingsPercent: number;

  const costDiff = ftTotalMonthly - ragTotalMonthly;
  const cheaperOption = costDiff <= 0 ? "Fine-tune" : "RAG";
  const cheaperCost   = Math.min(ftTotalMonthly, ragTotalMonthly);
  const expensiveCost = Math.max(ftTotalMonthly, ragTotalMonthly);
  savingsPercent = expensiveCost > 0 ? ((expensiveCost - cheaperCost) / expensiveCost) * 100 : 0;

  if (score >= 6) {
    recommendation = `Fine-tuning recomendado (score ${score}/8). ` +
      `Es ${savingsPercent.toFixed(0)}% más barato que RAG en este escenario ` +
      `(USD ${ftTotalMonthly.toFixed(2)}/mes vs USD ${ragTotalMonthly.toFixed(2)}/mes). ` +
      `Tus datos son estables y el perfil de tarea favorece el modelo especializado.`;
  } else if (score <= 3) {
    recommendation = `RAG recomendado (score Fine-tune: ${score}/8). ` +
      `Es ${savingsPercent.toFixed(0)}% más barato que fine-tuning en este escenario ` +
      `(USD ${ragTotalMonthly.toFixed(2)}/mes vs USD ${ftTotalMonthly.toFixed(2)}/mes). ` +
      `Tus datos cambian con frecuencia o el volumen es bajo: RAG es más flexible y económico.`;
  } else {
    recommendation = `Caso intermedio (score Fine-tune: ${score}/8). ` +
      `Fine-tune: USD ${ftTotalMonthly.toFixed(2)}/mes | RAG: USD ${ragTotalMonthly.toFixed(2)}/mes. ` +
      `La opción más barata por costo puro es ${cheaperOption} (${savingsPercent.toFixed(0)}% menos). ` +
      `Considerá también latencia, complejidad operativa y frecuencia de actualización.`;
  }

  return {
    recommendation,
    ftTotalMonthly:   Math.round(ftTotalMonthly   * 100) / 100,
    ragTotalMonthly:  Math.round(ragTotalMonthly  * 100) / 100,
    ftTrainingCost:   Math.round(ftTrainingCost   * 100) / 100,
    ftInferenceCost:  Math.round(ftInferenceCost  * 100) / 100,
    ragEmbeddingCost: Math.round(ragEmbeddingCost * 100) / 100,
    ragInferenceCost: Math.round(ragInferenceCost * 100) / 100,
    ragVectorDbCost:  Math.round(ragVectorDbCost  * 100) / 100,
    savingsPercent:   Math.round(savingsPercent   * 100) / 100,
    scoreBreakdown:   scoreSummary,
  };
}
