export interface Inputs {
  tool_calls_per_run: number;
  tokens_per_tool_call: number;
  context_base_tokens: number;
  loop_iterations: number;
  context_growth_factor: number;
  error_rate: number;
  retries_per_error: number;
  runs_per_month: number;
  model: string;
  custom_input_price: number;
  custom_output_price: number;
  input_output_ratio: number;
}

export interface Outputs {
  tokens_per_run: number;
  tokens_per_run_with_errors: number;
  tokens_per_month: number;
  cost_per_run: number;
  cost_per_month: number;
  context_final_tokens: number;
  breakdown: string;
  _insight?: any;
  _chart?: any;
}

// Precios en USD por 1M tokens [input, output] — verificar en pricing pages oficiales
const MODEL_PRICES: Record<string, [number, number]> = {
  gpt4o:           [2.50,  10.00],
  gpt4o_mini:      [0.15,   0.60],
  claude35_sonnet: [3.00,  15.00],
  claude3_haiku:   [0.25,   1.25],
  gemini15_pro:    [1.25,   5.00],
  gemini15_flash:  [0.075,  0.30],
};

export function compute(i: Inputs): Outputs {
  const toolCallsPerRun    = Math.max(0, Math.round(Number(i.tool_calls_per_run)    || 0));
  const tokensPerToolCall  = Math.max(0, Number(i.tokens_per_tool_call)  || 0);
  const contextBase        = Math.max(0, Number(i.context_base_tokens)   || 0);
  const loopIterations     = Math.max(1, Math.round(Number(i.loop_iterations)      || 1));
  const growthFactor       = Math.max(1.0, Number(i.context_growth_factor)         || 1.0);
  const errorRate          = Math.min(1, Math.max(0, (Number(i.error_rate) || 0) / 100));
  const retriesPerError    = Math.max(0, Math.round(Number(i.retries_per_error)    || 0));
  const runsPerMonth       = Math.max(0, Math.round(Number(i.runs_per_month)       || 0));
  const model              = String(i.model || 'gpt4o');
  const inputRatio         = Math.min(1, Math.max(0, (Number(i.input_output_ratio) || 70) / 100));

  // Precio input/output por 1M tokens
  let priceInput: number;
  let priceOutput: number;
  if (model === 'custom') {
    priceInput  = Math.max(0, Number(i.custom_input_price)  || 0);
    priceOutput = Math.max(0, Number(i.custom_output_price) || 0);
  } else {
    const prices = MODEL_PRICES[model] ?? MODEL_PRICES['gpt4o'];
    priceInput  = prices[0];
    priceOutput = prices[1];
  }

  if (toolCallsPerRun === 0 && contextBase === 0) {
    return {
      tokens_per_run: 0,
      tokens_per_run_with_errors: 0,
      tokens_per_month: 0,
      cost_per_run: 0,
      cost_per_month: 0,
      context_final_tokens: 0,
      breakdown: "Ingresá al menos tool calls o contexto base para calcular.",
    };
  }

  // Tool calls distribuidas uniformemente entre iteraciones
  const toolCallsPerIteration = toolCallsPerRun / loopIterations;
  const toolTokensPerIteration = toolCallsPerIteration * tokensPerToolCall;

  // Suma de tokens por run: Σ(k=1..N) [ context_base × growth^k + tool_tokens_per_iter ]
  // context_base × Σ growth^k = context_base × growth × (growth^N - 1) / (growth - 1)  si growth != 1
  // context_base × N  si growth == 1
  let contextSumAllIterations: number;
  let contextFinalTokens: number;

  if (Math.abs(growthFactor - 1.0) < 1e-9) {
    // Sin crecimiento geométrico
    contextSumAllIterations = contextBase * loopIterations;
    contextFinalTokens = contextBase;
  } else {
    // Suma geométrica: context_base × (growth^1 + growth^2 + ... + growth^N)
    // = context_base × growth × (growth^N - 1) / (growth - 1)
    const gN = Math.pow(growthFactor, loopIterations);
    contextSumAllIterations = contextBase * growthFactor * (gN - 1) / (growthFactor - 1);
    contextFinalTokens = contextBase * Math.pow(growthFactor, loopIterations);
  }

  const toolTokensAllIterations = toolTokensPerIteration * loopIterations;
  const tokensPerRunBase = contextSumAllIterations + toolTokensAllIterations;

  // Tokens extra por retries
  // Cada tool call fallida genera: tokens_per_tool_call × retries_per_error tokens adicionales
  // Aproximación: error_rate × tool_calls_per_run × tokens_per_tool_call × retries_per_error
  // Más los tokens de contexto al momento del retry (usamos contexto promedio)
  const avgContextPerIteration = contextSumAllIterations / loopIterations;
  const retryToolTokens = errorRate * toolCallsPerRun * tokensPerToolCall * retriesPerError;
  const retryContextTokens = errorRate * toolCallsPerRun * retriesPerError * (avgContextPerIteration / toolCallsPerIteration || 0);
  const retryTokens = retryToolTokens + retryContextTokens;

  const tokensPerRunWithErrors = tokensPerRunBase + retryTokens;
  const tokensPerMonth = tokensPerRunWithErrors * runsPerMonth;

  // Costo mensual
  const inputTokens  = tokensPerMonth * inputRatio;
  const outputTokens = tokensPerMonth * (1 - inputRatio);
  const costPerMonth = (inputTokens * priceInput + outputTokens * priceOutput) / 1_000_000;
  const costPerRun   = runsPerMonth > 0 ? costPerMonth / runsPerMonth : costPerMonth / 1;

  // Desglose textual
  const modelLabel = model === 'custom' ? 'Personalizado' : model.replace('_', '-').toUpperCase();
  const breakdown = [
    `Modelo: ${modelLabel} | Input: $${priceInput}/1M · Output: $${priceOutput}/1M`,
    `Iteraciones: ${loopIterations} | Factor contexto: ×${growthFactor.toFixed(2)}`,
    `Contexto final (iter. ${loopIterations}): ${Math.round(contextFinalTokens).toLocaleString()} tokens`,
    `Tokens base/run: ${Math.round(tokensPerRunBase).toLocaleString()} | Retry overhead: ${Math.round(retryTokens).toLocaleString()}`,
    `Split: ${(inputRatio * 100).toFixed(0)}% input / ${((1 - inputRatio) * 100).toFixed(0)}% output`,
    `Runs/mes: ${runsPerMonth.toLocaleString()} → Total: ${Math.round(tokensPerMonth).toLocaleString()} tokens/mes`,
  ].join("\n");

  // Composición de los tokens por run (con errores): contexto acumulado, tool calls y reintentos.
  // Las tres partes suman tokens_per_run_with_errors (redondeado).
  const tokensRunErr  = Math.round(tokensPerRunWithErrors);
  const sliceContext  = Math.round(contextSumAllIterations);
  const sliceTools    = Math.round(toolTokensAllIterations);
  const sliceRetries  = Math.max(0, tokensRunErr - sliceContext - sliceTools);

  // Insight: costo y qué componente domina el gasto.
  const costRunDisp   = Math.round(costPerRun * 100000) / 100000;
  const costMonthDisp = Math.round(costPerMonth * 100) / 100;
  const retryPct = tokensRunErr > 0 ? (sliceRetries / tokensRunErr) * 100 : 0;
  const ctxPct   = tokensRunErr > 0 ? (sliceContext / tokensRunErr) * 100 : 0;
  const dominante = sliceContext >= sliceTools && sliceContext >= sliceRetries
    ? `el **contexto acumulado** (${ctxPct.toFixed(0)}% de los tokens)`
    : (sliceTools >= sliceRetries
        ? `las **tool calls** (${(100 - ctxPct - retryPct).toFixed(0)}% de los tokens)`
        : `los **reintentos por error** (${retryPct.toFixed(0)}% de los tokens)`);
  const fmtUSD = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 5 : 2 });
  let insightTone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (costMonthDisp >= 500 || retryPct >= 25) insightTone = 'warn';
  else if (costMonthDisp > 0 && costMonthDisp < 50 && retryPct < 10) insightTone = 'good';
  const mesTxt = runsPerMonth > 0
    ? ` Con **${runsPerMonth.toLocaleString()} runs/mes** son **${fmtUSD(costMonthDisp)}/mes**.`
    : '';
  const retryWarnTxt = retryPct >= 25
    ? ` Cuidado: los reintentos se comen un **${retryPct.toFixed(0)}%** del presupuesto — bajar la tasa de error es la palanca más barata.`
    : '';
  const insightText = `Cada run cuesta **${fmtUSD(costRunDisp)}** y consume **${tokensRunErr.toLocaleString()} tokens**, donde manda ${dominante}.${mesTxt}${retryWarnTxt}`;

  return {
    tokens_per_run:             Math.round(tokensPerRunBase),
    tokens_per_run_with_errors: tokensRunErr,
    tokens_per_month:           Math.round(tokensPerMonth),
    cost_per_run:               costRunDisp,
    cost_per_month:             costMonthDisp,
    context_final_tokens:       Math.round(contextFinalTokens),
    breakdown,
    _insight: {
      title: 'Dónde se va el presupuesto',
      text: insightText,
      tone: insightTone,
      icon: '🤖',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Contexto acumulado', value: sliceContext },
        { label: 'Tool calls', value: sliceTools },
        { label: 'Reintentos por error', value: sliceRetries },
      ],
      centerValue: tokensRunErr.toLocaleString(),
      centerLabel: 'tokens/run',
      ariaLabel: `Composición de los ${tokensRunErr.toLocaleString()} tokens por run: contexto acumulado ${sliceContext.toLocaleString()}, tool calls ${sliceTools.toLocaleString()} y reintentos por error ${sliceRetries.toLocaleString()}.`,
    },
  };
}
