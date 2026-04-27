export interface Inputs {
  tokensPerDay: number;
  modelo: string;
  apiModel: string;
  inputOutputRatio: number;
  electricityKwhUsd: number;
  deploymentType: string;
  hoursPerDay: number;
}

export interface Outputs {
  costApiYear: number;
  costSelfHostYear: number;
  costCloudGpuYear: number;
  breakEvenDays: number;
  savingsYear: number;
  recommendation: string;
}

// --- OpenAI API pricing per 1M tokens (USD), 2026 ---
// Source: platform.openai.com/pricing
const API_PRICES: Record<string, { input: number; output: number }> = {
  "gpt4o":      { input: 2.50,  output: 10.00 },
  "gpt4o-mini": { input: 0.15,  output: 0.60  },
  "gpt35":      { input: 0.50,  output: 1.50  },
};

// --- GPU hardware CAPEX (USD) and TDP (kW) ---
// Source: NVIDIA product pages, retail 2026
const DEPLOYMENT_SPECS: Record<string, { capexUsd: number; tdpKw: number }> = {
  "owned-single": { capexUsd: 1800, tdpKw: 0.450 }, // 1x RTX 4090
  "owned-dual":   { capexUsd: 3600, tdpKw: 0.900 }, // 2x RTX 4090
  "cloud-gpu":    { capexUsd: 0,    tdpKw: 0 },     // no CAPEX, pay per hour
};

// --- Cloud GPU hourly rates (USD/hour), mid-range 2026 ---
// Source: RunPod / Vast.ai pricing pages
const CLOUD_RATES: Record<string, number> = {
  "llama3-70b":  1.10, // ~2x RTX 4090 or equivalent
  "mixtral-8x7b": 0.45, // 1x RTX 4090 24GB
  "llama3-8b":   0.35, // 1x RTX 4090 or RTX 3090
};

// Annual maintenance/misc opex proxy for owned hardware (USD/year)
const OWNED_MISC_ANNUAL_USD = 200;

export function compute(i: Inputs): Outputs {
  const tokensPerDay   = Math.max(0, Number(i.tokensPerDay)   || 0);
  const inputRatioPct  = Math.min(100, Math.max(0, Number(i.inputOutputRatio) || 70));
  const electricityUsd = Math.max(0, Number(i.electricityKwhUsd) || 0.12);
  const hoursPerDay    = Math.min(24, Math.max(0, Number(i.hoursPerDay) || 8));
  const modelo         = i.modelo         || "llama3-70b";
  const apiModel       = i.apiModel       || "gpt4o";
  const deploymentType = i.deploymentType || "owned-single";

  if (tokensPerDay <= 0) {
    return {
      costApiYear: 0,
      costSelfHostYear: 0,
      costCloudGpuYear: 0,
      breakEvenDays: 0,
      savingsYear: 0,
      recommendation: "Ingresá un volumen de tokens mayor a 0 para ver el análisis.",
    };
  }

  // --- API cost per day ---
  const apiPrices = API_PRICES[apiModel] ?? API_PRICES["gpt4o"];
  const inputRatio  = inputRatioPct / 100;
  const outputRatio = 1 - inputRatio;
  const tokensInput  = tokensPerDay * inputRatio;
  const tokensOutput = tokensPerDay * outputRatio;
  const costApiDay =
    (tokensInput  / 1_000_000) * apiPrices.input +
    (tokensOutput / 1_000_000) * apiPrices.output;
  const costApiYear = costApiDay * 365;

  // --- Self-host owned hardware cost ---
  const deploySpec = DEPLOYMENT_SPECS[deploymentType] ?? DEPLOYMENT_SPECS["owned-single"];
  const capex = deploySpec.capexUsd;
  const opexElecDay = deploySpec.tdpKw * hoursPerDay * electricityUsd;
  const opexMiscDay = OWNED_MISC_ANNUAL_USD / 365;
  const opexSelfHostDay = opexElecDay + opexMiscDay;
  const costSelfHostYear = capex + opexSelfHostDay * 365;

  // --- Cloud GPU cost ---
  const cloudRatePerHour = CLOUD_RATES[modelo] ?? CLOUD_RATES["llama3-70b"];
  const costCloudGpuDay  = cloudRatePerHour * hoursPerDay;
  const costCloudGpuYear = costCloudGpuDay * 365;

  // --- Break-even: self-host owned vs API ---
  // breakEvenDays = CAPEX / (apiCostPerDay - opexPerDay)
  const dailySaving = costApiDay - opexSelfHostDay;
  let breakEvenDays: number;
  if (capex <= 0) {
    // Cloud GPU path: no break-even concept vs API (no CAPEX)
    breakEvenDays = 0;
  } else if (dailySaving <= 0) {
    // API is cheaper per day; break-even never reached
    breakEvenDays = -1;
  } else {
    breakEvenDays = Math.ceil(capex / dailySaving);
  }

  // --- Net savings self-host owned vs API at 12 months ---
  const savingsYear = costApiYear - costSelfHostYear;

  // --- Recommendation ---
  let recommendation = "";
  const cheapestOption = Math.min(costApiYear, costSelfHostYear, costCloudGpuYear);

  if (deploymentType === "cloud-gpu") {
    // Compare cloud GPU vs API
    if (costCloudGpuYear < costApiYear * 0.95) {
      const cloudSaving = costApiYear - costCloudGpuYear;
      recommendation = `Cloud GPU es la opción más económica para este volumen. Ahorro estimado vs API: USD ${cloudSaving.toFixed(0)} en 12 meses. Sin CAPEX inicial, ideal si el volumen puede variar.`;
    } else if (costApiYear <= costCloudGpuYear * 1.05) {
      recommendation = `Para este volumen, cloud GPU y la API de OpenAI tienen costos similares (~USD ${costApiYear.toFixed(0)} vs USD ${costCloudGpuYear.toFixed(0)}). La API tiene menos fricción operativa; cloud GPU da más control.`;
    } else {
      recommendation = `La API de OpenAI resulta más económica que cloud GPU a este nivel de uso (USD ${costApiYear.toFixed(0)} vs USD ${costCloudGpuYear.toFixed(0)} anuales). Considerá cloud GPU solo si necesitás privacidad de datos o personalización del modelo.`;
    }
  } else if (breakEvenDays === -1) {
    recommendation = `A este volumen de ${tokensPerDay.toLocaleString("es")} tokens/día, la API de OpenAI es más barata por día que el opex del hardware propio. El self-host no se amortiza en 12 meses. Consideralo si el volumen crece o si necesitás privacidad de datos.`;
  } else if (breakEvenDays > 365) {
    recommendation = `El punto de equilibrio es ${breakEvenDays} días (más de 12 meses). El hardware propio no conviene en el horizonte anual a este volumen. La API (USD ${costApiYear.toFixed(0)}/año) es más rentable.`;
  } else if (breakEvenDays > 180) {
    recommendation = `Break-even en ${breakEvenDays} días. El hardware propio empieza a convenir recién en la segunda mitad del año. Ahorro neto 12 meses: USD ${savingsYear.toFixed(0)}. Evaluá si el volumen se mantendrá estable.`;
  } else {
    recommendation = `Excelente caso para self-host. Break-even en solo ${breakEvenDays} días. Ahorro neto a 12 meses: USD ${savingsYear.toFixed(0)} frente a la API de OpenAI. El hardware se paga solo y genera rentabilidad en el año.`;
  }

  return {
    costApiYear:      Math.round(costApiYear * 100) / 100,
    costSelfHostYear: Math.round(costSelfHostYear * 100) / 100,
    costCloudGpuYear: Math.round(costCloudGpuYear * 100) / 100,
    breakEvenDays:    breakEvenDays < 0 ? -1 : breakEvenDays,
    savingsYear:      Math.round(savingsYear * 100) / 100,
    recommendation,
  };
}
