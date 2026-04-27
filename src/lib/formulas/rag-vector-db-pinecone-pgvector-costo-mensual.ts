export interface Inputs {
  numDocs: number;
  chunksPerDoc: number;
  embeddingDimensions: string;
  queriesPerDay: number;
  topK: number;
  provider: string;
  llmModel: string;
  avgTokensPerChunk: number;
  avgOutputTokens: number;
  embeddingProvider: string;
  avgTokensPerQueryInput: number;
}

export interface Outputs {
  totalMonthlyCost: number;
  vectorDbCost: number;
  llmCost: number;
  embeddingCost: number;
  totalVectors: number;
  storageGB: number;
  breakdown: string;
}

export function compute(i: Inputs): Outputs {
  const numDocs = Math.max(0, Math.round(Number(i.numDocs) || 0));
  const chunksPerDoc = Math.max(1, Math.round(Number(i.chunksPerDoc) || 5));
  const dimensions = Number(i.embeddingDimensions) || 1536;
  const queriesPerDay = Math.max(0, Number(i.queriesPerDay) || 0);
  const topK = Math.max(1, Math.round(Number(i.topK) || 5));
  const avgTokensPerChunk = Math.max(1, Number(i.avgTokensPerChunk) || 200);
  const avgOutputTokens = Math.max(0, Number(i.avgOutputTokens) || 300);
  const avgTokensPerQueryInput = Math.max(1, Number(i.avgTokensPerQueryInput) || 30);

  if (numDocs <= 0) {
    return {
      totalMonthlyCost: 0,
      vectorDbCost: 0,
      llmCost: 0,
      embeddingCost: 0,
      totalVectors: 0,
      storageGB: 0,
      breakdown: "Ingresá una cantidad de documentos válida.",
    };
  }

  // --- Vector count and storage ---
  const totalVectors = numDocs * chunksPerDoc;
  // float32 = 4 bytes per dimension
  const bytesPerVector = dimensions * 4;
  const storageGB = (totalVectors * bytesPerVector) / 1_073_741_824;

  // --- Vector DB cost ---
  let vectorDbCost = 0;
  let vectorDbNote = "";

  const DAYS_PER_MONTH = 30;
  const queriesPerMonth = queriesPerDay * DAYS_PER_MONTH;

  if (i.provider === "pinecone_serverless") {
    // Pinecone Serverless pricing (2026, AWS us-east-1)
    // Write: $2.00 / 1M write units (1 vector = 1 write unit)
    // Read: $16.00 / 1M read units (1 query unit ≈ topK vectors read)
    // Storage: $0.33 / GB / month
    const PINECONE_WRITE_PER_1M = 2.0;
    const PINECONE_READ_PER_1M = 16.0;
    const PINECONE_STORAGE_PER_GB = 0.33;

    // Write cost amortized over 12 months
    const writeCostAmortized = (totalVectors / 1_000_000) * PINECONE_WRITE_PER_1M / 12;
    // Read: each query reads topK vectors
    const readUnitsPerMonth = queriesPerMonth * topK;
    const readCost = (readUnitsPerMonth / 1_000_000) * PINECONE_READ_PER_1M;
    const storageCost = storageGB * PINECONE_STORAGE_PER_GB;

    vectorDbCost = writeCostAmortized + readCost + storageCost;
    vectorDbNote = `Pinecone Serverless: write amortizado $${writeCostAmortized.toFixed(2)} + read $${readCost.toFixed(2)} + storage $${storageCost.toFixed(2)}`;

  } else if (i.provider === "pinecone_pod") {
    // Pinecone p1.x1 pod: $0.096/hour
    // Capacity: ~500K vectors at 1536 dims per pod
    const PINECONE_POD_HOURLY = 0.096;
    const HOURS_PER_MONTH = 730;
    const VECTORS_PER_POD_1536 = 500_000;
    const podsNeeded = Math.max(1, Math.ceil(totalVectors / VECTORS_PER_POD_1536));
    vectorDbCost = podsNeeded * PINECONE_POD_HOURLY * HOURS_PER_MONTH;
    vectorDbNote = `Pinecone Pod p1.x1: ${podsNeeded} pod(s) × $${(PINECONE_POD_HOURLY * HOURS_PER_MONTH).toFixed(2)}/mes`;

  } else if (i.provider === "pgvector") {
    // pgvector self-hosted on VPS (Hetzner/AWS)
    // Tier based on storage size needed (with overhead factor 3x for HNSW index)
    const indexedGB = storageGB * 3; // HNSW index overhead
    if (indexedGB <= 1) {
      vectorDbCost = 15; // Hetzner CX21
      vectorDbNote = "pgvector self-hosted: Hetzner CX21 ~$15/mes (≤1 GB índice)";
    } else if (indexedGB <= 4) {
      vectorDbCost = 30;
      vectorDbNote = "pgvector self-hosted: Hetzner CX31 ~$30/mes (≤4 GB índice)";
    } else if (indexedGB <= 16) {
      vectorDbCost = 60;
      vectorDbNote = "pgvector self-hosted: Hetzner CX41 ~$60/mes (≤16 GB índice)";
    } else if (indexedGB <= 64) {
      vectorDbCost = 120;
      vectorDbNote = "pgvector self-hosted: Hetzner CX51 ~$120/mes (≤64 GB índice)";
    } else {
      vectorDbCost = 250;
      vectorDbNote = "pgvector self-hosted: servidor dedicado ~$250/mes (>64 GB índice)";
    }

  } else if (i.provider === "weaviate_cloud") {
    // Weaviate Cloud Standard (2026)
    // Base: $25/mes + $0.05 / 1M queries + $0.095 / GB / mes
    const WEAVIATE_BASE = 25;
    const WEAVIATE_QUERY_PER_1M = 0.05;
    const WEAVIATE_STORAGE_PER_GB = 0.095;

    const queryCost = (queriesPerMonth / 1_000_000) * WEAVIATE_QUERY_PER_1M;
    const storageCost = storageGB * WEAVIATE_STORAGE_PER_GB;
    vectorDbCost = WEAVIATE_BASE + queryCost + storageCost;
    vectorDbNote = `Weaviate Cloud Standard: base $${WEAVIATE_BASE} + queries $${queryCost.toFixed(2)} + storage $${storageCost.toFixed(2)}`;
  }

  // --- Embedding cost ---
  // Pricing per 1M tokens (2026)
  let embeddingPricePerMillion = 0;
  let embeddingModelName = "";

  if (i.embeddingProvider === "openai_small") {
    embeddingPricePerMillion = 0.02; // text-embedding-3-small
    embeddingModelName = "text-embedding-3-small";
  } else if (i.embeddingProvider === "openai_large") {
    embeddingPricePerMillion = 0.13; // text-embedding-3-large
    embeddingModelName = "text-embedding-3-large";
  } else {
    embeddingPricePerMillion = 0; // self-hosted
    embeddingModelName = "self-hosted";
  }

  // Indexation cost (one-time, amortized 12 months)
  const tokensIndexation = totalVectors * avgTokensPerChunk;
  const indexationCostMonthly = (tokensIndexation / 1_000_000) * embeddingPricePerMillion / 12;

  // Query embedding cost (monthly recurring)
  const tokensQueriesMonthly = queriesPerMonth * avgTokensPerQueryInput;
  const queriesEmbeddingCost = (tokensQueriesMonthly / 1_000_000) * embeddingPricePerMillion;

  const embeddingCost = indexationCostMonthly + queriesEmbeddingCost;

  // --- LLM cost ---
  let llmCost = 0;
  let llmNote = "";

  // Prices per 1M tokens (2026)
  const LLM_PRICES: Record<string, { input: number; output: number; name: string }> = {
    gpt4o_mini: { input: 0.15, output: 0.60, name: "GPT-4o mini" },
    gpt4o: { input: 2.50, output: 10.0, name: "GPT-4o" },
    claude_haiku: { input: 0.80, output: 4.0, name: "Claude 3.5 Haiku" },
    claude_sonnet: { input: 3.0, output: 15.0, name: "Claude 3.5 Sonnet" },
    none: { input: 0, output: 0, name: "Sin LLM" },
  };

  const llmPricing = LLM_PRICES[i.llmModel] || LLM_PRICES["none"];

  if (i.llmModel !== "none") {
    // Input = system prompt (~100 tokens) + topK chunks + user query
    const inputTokensPerQuery = 100 + topK * avgTokensPerChunk + avgTokensPerQueryInput;
    const outputTokensPerQuery = avgOutputTokens;

    const inputCostPerQuery = (inputTokensPerQuery / 1_000_000) * llmPricing.input;
    const outputCostPerQuery = (outputTokensPerQuery / 1_000_000) * llmPricing.output;
    const costPerQuery = inputCostPerQuery + outputCostPerQuery;

    llmCost = costPerQuery * queriesPerMonth;
    llmNote = `${llmPricing.name}: ${inputTokensPerQuery} tokens input + ${outputTokensPerQuery} tokens output por query`;
  } else {
    llmNote = "Sin LLM";
  }

  // --- Total ---
  const totalMonthlyCost = vectorDbCost + embeddingCost + llmCost;

  // --- Breakdown text ---
  const lines: string[] = [
    `Vectores totales: ${totalVectors.toLocaleString()} (${numDocs.toLocaleString()} docs × ${chunksPerDoc} chunks)`,
    `Almacenamiento vectores: ${storageGB.toFixed(3)} GB (${dimensions} dims × float32)`,
    `Queries mensuales: ${queriesPerMonth.toLocaleString()}`,
    `---`,
    `Vector DB (${i.provider}): $${vectorDbCost.toFixed(2)}`,
    vectorDbNote,
    `Embeddings (${embeddingModelName}): $${embeddingCost.toFixed(2)}`,
    `  · Indexación amortizada: $${indexationCostMonthly.toFixed(2)}/mes`,
    `  · Queries: $${queriesEmbeddingCost.toFixed(2)}/mes`,
    `LLM (${llmPricing.name}): $${llmCost.toFixed(2)}`,
    llmNote ? `  · ${llmNote}` : "",
    `---`,
    `TOTAL MENSUAL ESTIMADO: $${totalMonthlyCost.toFixed(2)} USD`,
  ].filter((l) => l !== "");

  return {
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
    vectorDbCost: Math.round(vectorDbCost * 100) / 100,
    llmCost: Math.round(llmCost * 100) / 100,
    embeddingCost: Math.round(embeddingCost * 100) / 100,
    totalVectors,
    storageGB: Math.round(storageGB * 10000) / 10000,
    breakdown: lines.join("\n"),
  };
}
