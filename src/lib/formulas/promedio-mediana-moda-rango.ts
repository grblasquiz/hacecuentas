export interface Inputs {
  data_input: string;
}

export interface Outputs {
  count: number;
  mean: number;
  median: number;
  mode: string;
  range: number;
  min: number;
  max: number;
  variance: number;
  std_dev: number;
  summary: string;
  _insight?: any;
  _chart?: any;
}

/** Parsea el string de entrada y devuelve un array de números válidos. */
function parseNumbers(raw: string): number[] {
  return raw
    .split(/[,;\n\r]+/)
    .map(s => s.trim())
    .filter(s => s !== "")
    .map(s => parseFloat(s.replace(",", ".")))
    .filter(n => !isNaN(n) && isFinite(n));
}

export function compute(i: Inputs): Outputs {
  const EMPTY: Outputs = {
    count: 0,
    mean: 0,
    median: 0,
    mode: "Sin datos",
    range: 0,
    min: 0,
    max: 0,
    variance: 0,
    std_dev: 0,
    summary: "Ingresa al menos un número válido.",
  };

  const nums = parseNumbers(String(i.data_input ?? ""));
  const n = nums.length;

  if (n === 0) return EMPTY;

  // --- Media aritmética ---
  const sum = nums.reduce((acc, x) => acc + x, 0);
  const mean = sum / n;

  // --- Mediana ---
  const sorted = [...nums].sort((a, b) => a - b);
  let median: number;
  if (n % 2 === 1) {
    median = sorted[Math.floor(n / 2)];
  } else {
    median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  }

  // --- Moda ---
  const freqMap: Record<string, number> = {};
  for (const x of nums) {
    const key = String(x);
    freqMap[key] = (freqMap[key] ?? 0) + 1;
  }
  const maxFreq = Math.max(...Object.values(freqMap));
  let modeStr: string;
  if (maxFreq === 1) {
    // Todos aparecen una sola vez → amodal
    modeStr = "Sin moda";
  } else {
    const modes = Object.entries(freqMap)
      .filter(([, freq]) => freq === maxFreq)
      .map(([val]) => parseFloat(val))
      .sort((a, b) => a - b);
    modeStr = modes.join(", ") + ` (aparece ${maxFreq} veces)`;
  }

  // --- Rango, mín, máx ---
  const minVal = sorted[0];
  const maxVal = sorted[n - 1];
  const range = maxVal - minVal;

  // --- Varianza muestral (divisor n−1) y desviación estándar ---
  // Fuente: NIST Handbook — fórmula muestral s² = Σ(xᵢ − x̄)² / (n−1)
  let variance = 0;
  let std_dev = 0;
  if (n > 1) {
    const sumSqDiff = nums.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
    variance = sumSqDiff / (n - 1);
    std_dev = Math.sqrt(variance);
  } else {
    // n = 1: varianza muestral no definida
    variance = 0;
    std_dev = 0;
  }

  // --- Resumen textual ---
  const round = (v: number, d = 4) => parseFloat(v.toFixed(d));
  const summary =
    `n=${n} | Media=${round(mean, 4)} | Mediana=${round(median, 4)} | ` +
    `Moda: ${modeStr} | Rango=${round(range, 4)} | ` +
    `s=${round(std_dev, 4)} | s²=${round(variance, 4)}`;

  // --- Insight: relación media/mediana (sesgo) + dispersión ---
  const fmt = (v: number) => round(v, 2).toLocaleString("es-AR");
  const diff = mean - median;
  const skewTxt = Math.abs(diff) < 1e-9
    ? `la **media (${fmt(mean)})** y la **mediana (${fmt(median)})** coinciden, así que los datos están repartidos de forma simétrica`
    : diff > 0
      ? `la **media (${fmt(mean)})** queda por encima de la **mediana (${fmt(median)})**: hay valores altos que la estiran hacia arriba (sesgo a la derecha)`
      : `la **media (${fmt(mean)})** queda por debajo de la **mediana (${fmt(median)})**: hay valores bajos que la tiran hacia abajo (sesgo a la izquierda)`;
  let insTone = "neutral";
  let dispTxt = "";
  if (n > 1 && mean !== 0) {
    const cv = (std_dev / Math.abs(mean)) * 100;
    if (cv > 30) { insTone = "warn"; dispTxt = ` La dispersión es alta (desvío de **${fmt(std_dev)}** sobre la media), los datos están bastante esparcidos.`; }
    else if (cv < 10) { insTone = "good"; dispTxt = ` La dispersión es baja (desvío de **${fmt(std_dev)}**), los datos están muy concentrados cerca del promedio.`; }
    else { dispTxt = ` El desvío estándar es de **${fmt(std_dev)}** alrededor de la media.`; }
  }
  const _insight = {
    title: "Qué dicen estos números",
    text: `Sobre ${n} datos, ${skewTxt}.${dispTxt}`,
    tone: insTone,
    icon: "📊",
  };

  const out: Outputs = {
    count: n,
    mean,
    median,
    mode: modeStr,
    range,
    min: minVal,
    max: maxVal,
    variance,
    std_dev,
    summary,
    _insight,
  };

  // --- Gauge: dónde cae la media dentro del rango [mín, máx] ---
  if (range > 0) {
    const t1 = minVal + range / 3;
    const t2 = minVal + (2 * range) / 3;
    out._chart = {
      type: "scale",
      marker: round(mean, 4),
      markerLabel: `Media ${fmt(mean)}`,
      min: round(minVal, 4),
      segments: [
        { nombre: "Tercio bajo", max: round(t1, 4), color: "#3b82f6", colorDark: "#60a5fa" },
        { nombre: "Tercio medio", max: round(t2, 4), color: "#22c55e", colorDark: "#4ade80" },
        { nombre: "Tercio alto", max: round(maxVal, 4), color: "#f97316", colorDark: "#fb923c" },
      ],
      ariaLabel: `La media ${fmt(mean)} dentro del rango ${fmt(minVal)} a ${fmt(maxVal)}.`,
    };
  }

  return out;
}
