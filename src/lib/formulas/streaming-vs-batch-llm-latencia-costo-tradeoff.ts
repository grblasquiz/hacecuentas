export interface Inputs {
  totalTokensPerDay: number;
  latencySensitivePercent: number;
  pricePerMillionTokens: number;
  batchDiscountPercent: number;
  daysPerMonth: number;
  avgLatencyStreamingMs: number;
}

export interface Outputs {
  monthlyCostOptimal: number;
  monthlyCostFullStreaming: number;
  monthlyCostFullBatch: number;
  savingsVsStreaming: number;
  savingsPercent: number;
  streamingTokensMonthly: number;
  batchTokensMonthly: number;
  breakdownText: string;
}

export function compute(i: Inputs): Outputs {
  const totalTokensPerDay = Math.max(0, Number(i.totalTokensPerDay) || 0);
  const latencySensitivePercent = Math.min(100, Math.max(0, Number(i.latencySensitivePercent) || 0));
  const pricePerMillionTokens = Math.max(0, Number(i.pricePerMillionTokens) || 0);
  const batchDiscountPercent = Math.min(100, Math.max(0, Number(i.batchDiscountPercent) || 0));
  const daysPerMonth = Math.max(1, Number(i.daysPerMonth) || 30);
  const avgLatencyStreamingMs = Math.max(0, Number(i.avgLatencyStreamingMs) || 0);

  if (totalTokensPerDay <= 0 || pricePerMillionTokens <= 0) {
    return {
      monthlyCostOptimal: 0,
      monthlyCostFullStreaming: 0,
      monthlyCostFullBatch: 0,
      savingsVsStreaming: 0,
      savingsPercent: 0,
      streamingTokensMonthly: 0,
      batchTokensMonthly: 0,
      breakdownText: "Ingresá valores válidos de tokens y precio para calcular.",
    };
  }

  // Fracción sensible a latencia (usa streaming al precio estándar)
  const streamingFraction = latencySensitivePercent / 100;
  const batchFraction = 1 - streamingFraction;

  // Precio batch con descuento
  // Fuente: OpenAI Batch API (~50% off), Anthropic Message Batches (~50% off)
  const batchPricePerMillion = pricePerMillionTokens * (1 - batchDiscountPercent / 100);

  // Tokens mensuales por segmento
  const streamingTokensMonthly = Math.round(totalTokensPerDay * streamingFraction * daysPerMonth);
  const batchTokensMonthly = Math.round(totalTokensPerDay * batchFraction * daysPerMonth);
  const totalTokensMonthly = streamingTokensMonthly + batchTokensMonthly;

  // Costos por segmento
  const costStreaming = (streamingTokensMonthly / 1_000_000) * pricePerMillionTokens;
  const costBatch = (batchTokensMonthly / 1_000_000) * batchPricePerMillion;

  // Costo óptimo (mix)
  const monthlyCostOptimal = costStreaming + costBatch;

  // Referencia: costo si todo fuera streaming
  const monthlyCostFullStreaming = (totalTokensMonthly / 1_000_000) * pricePerMillionTokens;

  // Referencia: costo si todo fuera batch
  const monthlyCostFullBatch = (totalTokensMonthly / 1_000_000) * batchPricePerMillion;

  // Ahorro vs solo streaming
  const savingsVsStreaming = monthlyCostFullStreaming - monthlyCostOptimal;
  const savingsPercent = monthlyCostFullStreaming > 0
    ? (savingsVsStreaming / monthlyCostFullStreaming) * 100
    : 0;

  // Texto resumen
  const latencyNote = avgLatencyStreamingMs > 0
    ? `TTFT streaming estimado: ${avgLatencyStreamingMs} ms. Batch: hasta 24 h.`
    : "";

  const breakdownText =
    `Mix: ${latencySensitivePercent.toFixed(0)}% streaming (USD ${costStreaming.toFixed(2)}) + ` +
    `${(batchFraction * 100).toFixed(0)}% batch a ${batchDiscountPercent.toFixed(0)}% off (USD ${costBatch.toFixed(2)}). ` +
    `Precio batch: USD ${batchPricePerMillion.toFixed(4)}/M tokens. ` +
    `Ahorro vs solo streaming: USD ${savingsVsStreaming.toFixed(2)} (${savingsPercent.toFixed(1)}%). ` +
    (latencyNote ? latencyNote : "");

  return {
    monthlyCostOptimal,
    monthlyCostFullStreaming,
    monthlyCostFullBatch,
    savingsVsStreaming,
    savingsPercent,
    streamingTokensMonthly,
    batchTokensMonthly,
    breakdownText,
  };
}
