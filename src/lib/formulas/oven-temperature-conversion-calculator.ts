export interface Inputs {
  temperature: number;
  unit: string;
  convection: string;
}

export interface Outputs {
  fahrenheit_out: number;
  celsius_out: number;
  gas_mark_out: string;
  convection_note: string;
  description_out: string;
  _insight?: any;
  _chart?: any;
}

// Gas Mark linear formula: °C = Gas Mark × 14 + 121
// Source: NIST SP811 + British Standards Gas Mark reference table
const GAS_MARK_SLOPE = 14;
const GAS_MARK_INTERCEPT = 121;

// Convection adjustment: 25°F / ~14°C reduction (standard culinary convention)
const CONVECTION_ADJUST_F = 25;
const CONVECTION_ADJUST_C = 14;

function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32;
}

function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9;
}

function celsiusToGasMark(c: number): number {
  return (c - GAS_MARK_INTERCEPT) / GAS_MARK_SLOPE;
}

function gasMarkToCelsius(gm: number): number {
  return gm * GAS_MARK_SLOPE + GAS_MARK_INTERCEPT;
}

function formatGasMark(gm: number): string {
  if (!isFinite(gm)) return "Out of range";
  // Round to nearest 0.25 for display
  const rounded = Math.round(gm * 4) / 4;
  if (rounded <= 0) return "Below Gas Mark range";
  if (rounded === 0.25) return "Gas Mark \u00bc";
  if (rounded === 0.5) return "Gas Mark \u00bd";
  if (rounded === 0.75) return "Gas Mark \u00be";
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  let fracStr = "";
  if (frac === 0.25) fracStr = "\u00bc";
  else if (frac === 0.5) fracStr = "\u00bd";
  else if (frac === 0.75) fracStr = "\u00be";
  return frac === 0 ? `Gas Mark ${whole}` : `Gas Mark ${whole}${fracStr}`;
}

function getHeatDescription(f: number): string {
  if (f < 250) return "Very Low (below standard baking range)";
  if (f < 300) return "Very Low";
  if (f < 325) return "Low";
  if (f < 350) return "Moderately Low";
  if (f < 375) return "Moderate";
  if (f < 400) return "Moderately Hot";
  if (f < 425) return "Hot";
  if (f < 450) return "Hot";
  if (f < 475) return "Very Hot";
  if (f < 500) return "Very Hot";
  return "Extremely Hot";
}

export function compute(i: Inputs): Outputs {
  const tempInput = Number(i.temperature);
  const unit = i.unit || "fahrenheit";
  const convection = i.convection || "no";

  if (!isFinite(tempInput)) {
    return {
      fahrenheit_out: 0,
      celsius_out: 0,
      gas_mark_out: "Enter a valid temperature",
      convection_note: "",
      description_out: ""
    };
  }

  // Step 1: Convert input to Celsius
  let celsius: number;
  if (unit === "fahrenheit") {
    celsius = fahrenheitToCelsius(tempInput);
  } else if (unit === "celsius") {
    celsius = tempInput;
  } else if (unit === "gas_mark") {
    if (tempInput <= 0) {
      return {
        fahrenheit_out: 0,
        celsius_out: 0,
        gas_mark_out: "Gas Mark must be greater than 0",
        convection_note: "",
        description_out: ""
      };
    }
    celsius = gasMarkToCelsius(tempInput);
  } else {
    celsius = fahrenheitToCelsius(tempInput);
  }

  // Step 2: Apply convection adjustment
  let convectionNote = "";
  let celsiusAdj = celsius;
  if (convection === "yes") {
    celsiusAdj = celsius - CONVECTION_ADJUST_C;
    const fAdj = celsiusToFahrenheit(celsiusAdj);
    convectionNote = `Convection oven: reduce by 25\u00b0F (14\u00b0C). Suggested set temperature: ${fAdj.toFixed(0)}\u00b0F / ${celsiusAdj.toFixed(0)}\u00b0C`;
  } else {
    convectionNote = "Conventional oven — no adjustment needed.";
  }

  // Step 3: Output all three units from the BASE (non-adjusted) temperature
  const fahrenheit = celsiusToFahrenheit(celsius);
  const gasMark = celsiusToGasMark(celsius);

  const fahrenheit_out = Math.round(fahrenheit * 10) / 10;
  const celsius_out = Math.round(celsius * 10) / 10;
  const gas_mark_out = formatGasMark(gasMark);
  const description_out = getHeatDescription(fahrenheit);

  // Insight: interpret the converted temperature and its heat band
  const convPart = convection === "yes"
    ? ` For a fan-forced oven, drop it ~25°F (14°C) to about ${celsiusToFahrenheit(celsius - CONVECTION_ADJUST_C).toFixed(0)}°F.`
    : "";
  const _insight = {
    title: "What this temperature means",
    text: `**${fahrenheit_out}°F** equals **${celsius_out}°C** (${gas_mark_out}) — a **${description_out.toLowerCase()}** oven.${convPart}`,
    tone: "neutral",
    icon: "\u{1F525}",
  };

  // Gauge: where this temperature sits on the culinary heat scale (°F)
  const lastMax = Math.max(525, Math.ceil(fahrenheit_out / 25) * 25 + 25);
  const _chart = {
    type: "scale",
    marker: fahrenheit_out,
    markerLabel: `${fahrenheit_out}°F`,
    min: 200,
    segments: [
      { nombre: "Very low", max: 300, color: "#bfdbfe", colorDark: "#1e3a8a" },
      { nombre: "Low", max: 350, color: "#a7f3d0", colorDark: "#065f46" },
      { nombre: "Moderate", max: 400, color: "#86efac", colorDark: "#166534" },
      { nombre: "Hot", max: 450, color: "#fde68a", colorDark: "#92400e" },
      { nombre: "Very hot", max: lastMax, color: "#fca5a5", colorDark: "#991b1b" },
    ],
    ariaLabel: `Oven heat scale: ${fahrenheit_out}°F falls in the ${description_out.toLowerCase()} range`,
  };

  return {
    fahrenheit_out,
    celsius_out,
    gas_mark_out,
    convection_note: convectionNote,
    description_out,
    _insight,
    _chart,
  };
}
