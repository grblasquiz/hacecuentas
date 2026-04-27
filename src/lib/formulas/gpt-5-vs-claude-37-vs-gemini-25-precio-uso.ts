export interface Inputs {
  tokens_input_millones: number;
  tokens_output_millones: number;
  pct_cache_input: number;
  pct_batch: number;
  modelos: string;
}

export interface Outputs {
  costo_gpt5: number;
  costo_claude: number;
  costo_gemini: number;
  modelo_recomendado: string;
  ahorro_vs_caro: number;
  detalle: string;
}

// ─── Precios por millón de tokens (USD/MTok) — revisados 2026-04-27 ───
// Fuente: openai.com/api/pricing, anthropic.com/pricing, ai.google.dev/pricing

const PRICE_GPT5 = {
  input_std: 15.00,    // USD/MTok input estándar
  input_cache: 3.75,   // USD/MTok input cacheado (descuento 75%)
  output_std: 60.00,   // USD/MTok output estándar
  batch_input: 7.50,   // USD/MTok input batch (descuento 50%)
  batch_output: 30.00, // USD/MTok output batch (descuento 50%)
};

const PRICE_CLAUDE = {
  input_std: 3.00,     // USD/MTok input estándar — Claude 3.7 Sonnet
  input_cache: 0.30,   // USD/MTok input cacheado (descuento 90%)
  output_std: 15.00,   // USD/MTok output estándar
  batch_input: 1.50,   // USD/MTok input batch (descuento 50%)
  batch_output: 7.50,  // USD/MTok output batch (descuento 50%)
};

const PRICE_GEMINI = {
  input_std: 1.25,     // USD/MTok input estándar — Gemini 2.5 Pro (<=200K ctx)
  input_cache: 0.3125, // USD/MTok input cacheado (~75% desc aprox)
  output_std: 10.00,   // USD/MTok output estándar
  batch_input: 1.25,   // Gemini no tiene batch oficial; mismo precio estándar
  batch_output: 10.00, // idem
};

type PriceTable = typeof PRICE_GPT5;

function calcCost(
  price: PriceTable,
  inputM: number,
  outputM: number,
  pctCache: number,   // 0-1
  pctBatch: number    // 0-1
): number {
  // El caché se aplica primero; el batch se aplica sobre lo que no está cacheado
  const cacheRatio = Math.min(Math.max(pctCache, 0), 1);
  const batchRatio = Math.min(Math.max(pctBatch, 0), 1);

  const inputCacheM  = inputM * cacheRatio;
  const inputNonCache = inputM * (1 - cacheRatio);
  const inputStdM    = inputNonCache * (1 - batchRatio);
  const inputBatchM  = inputNonCache * batchRatio;

  const outputStdM   = outputM * (1 - batchRatio);
  const outputBatchM = outputM * batchRatio;

  return (
    inputStdM   * price.input_std +
    inputCacheM * price.input_cache +
    inputBatchM * price.batch_input +
    outputStdM  * price.output_std +
    outputBatchM* price.batch_output
  );
}

export function compute(i: Inputs): Outputs {
  const inputM  = Math.max(Number(i.tokens_input_millones)  || 0, 0);
  const outputM = Math.max(Number(i.tokens_output_millones) || 0, 0);
  const pctCache = Math.min(Math.max((Number(i.pct_cache_input) || 0) / 100, 0), 1);
  const pctBatch = Math.min(Math.max((Number(i.pct_batch)       || 0) / 100, 0), 1);
  const modelos  = i.modelos || "todos";

  if (inputM === 0 && outputM === 0) {
    return {
      costo_gpt5: 0,
      costo_claude: 0,
      costo_gemini: 0,
      modelo_recomendado: "Ingresá al menos un volumen de tokens para comparar.",
      ahorro_vs_caro: 0,
      detalle: "",
    };
  }

  const includeGpt5   = modelos === "todos" || modelos === "gpt5_claude" || modelos === "gpt5_gemini";
  const includeClaude = modelos === "todos" || modelos === "gpt5_claude" || modelos === "claude_gemini";
  const includeGemini = modelos === "todos" || modelos === "gpt5_gemini" || modelos === "claude_gemini";

  const costo_gpt5   = includeGpt5   ? calcCost(PRICE_GPT5,   inputM, outputM, pctCache, pctBatch) : -1;
  const costo_claude = includeClaude ? calcCost(PRICE_CLAUDE, inputM, outputM, pctCache, pctBatch) : -1;
  const costo_gemini = includeGemini ? calcCost(PRICE_GEMINI, inputM, outputM, pctCache, pctBatch) : -1;

  // Armar lista de modelos activos para comparación
  const activos: { nombre: string; costo: number }[] = [];
  if (includeGpt5)   activos.push({ nombre: "GPT-5",           costo: costo_gpt5 });
  if (includeClaude) activos.push({ nombre: "Claude 3.7 Sonnet", costo: costo_claude });
  if (includeGemini) activos.push({ nombre: "Gemini 2.5 Pro",  costo: costo_gemini });

  activos.sort((a, b) => a.costo - b.costo);

  const masBarato = activos[0];
  const masCaro   = activos[activos.length - 1];
  const ahorro_vs_caro = masCaro.costo - masBarato.costo;

  // Líneas de detalle
  const lines: string[] = [];
  lines.push(`Volumen: ${inputM.toFixed(1)}M tokens input | ${outputM.toFixed(1)}M tokens output`);
  lines.push(`Caché: ${(pctCache * 100).toFixed(0)}% | Batch: ${(pctBatch * 100).toFixed(0)}%`);
  lines.push("");
  for (const m of activos) {
    lines.push(`${m.nombre}: USD ${m.costo.toFixed(2)}/mes`);
  }
  if (activos.length > 1) {
    lines.push("");
    const pctAhorro = masCaro.costo > 0 ? (ahorro_vs_caro / masCaro.costo) * 100 : 0;
    lines.push(`${masBarato.nombre} es ${pctAhorro.toFixed(0)}% más barato que ${masCaro.nombre} en este escenario.`);
  }
  if (pctCache > 0) {
    lines.push("⚡ El caché de prompts reduce significativamente el costo de input.");
  }
  if (pctBatch > 0) {
    lines.push("📦 El batch processing aplica descuento del 50% en input y output (GPT-5 y Claude).");
  }

  const modelo_recomendado =
    activos.length === 1
      ? `${masBarato.nombre} — USD ${masBarato.costo.toFixed(2)}/mes`
      : `${masBarato.nombre} — USD ${masBarato.costo.toFixed(2)}/mes (el más económico de los seleccionados)`;

  return {
    costo_gpt5:   costo_gpt5   >= 0 ? parseFloat(costo_gpt5.toFixed(2))   : 0,
    costo_claude: costo_claude >= 0 ? parseFloat(costo_claude.toFixed(2)) : 0,
    costo_gemini: costo_gemini >= 0 ? parseFloat(costo_gemini.toFixed(2)) : 0,
    modelo_recomendado,
    ahorro_vs_caro: parseFloat(ahorro_vs_caro.toFixed(2)),
    detalle: lines.join("\n"),
  };
}
