export interface Inputs {
  mode: string;
  original_value: number;
  new_value: number;
  percent_change_input: number;
}

export interface Outputs {
  percent_change: number;
  direction: string;
  absolute_difference: number;
  result_value: number;
  explanation_text: string;
}

export function compute(i: Inputs): Outputs {
  const mode = i.mode || "find_change";
  const original = Number(i.original_value);

  // ── MODE 1: Find % change between original and new value ──────────────────
  if (mode === "find_change") {
    const newVal = Number(i.new_value);

    if (!isFinite(original) || !isFinite(newVal)) {
      return {
        percent_change: 0,
        direction: "Invalid input",
        absolute_difference: 0,
        result_value: newVal || 0,
        explanation_text: "Please enter valid numbers for both fields.",
      };
    }

    if (original === 0) {
      return {
        percent_change: 0,
        direction: "Undefined",
        absolute_difference: Math.abs(newVal),
        result_value: newVal,
        explanation_text:
          "Percentage change is undefined when the original value is 0 (division by zero). Absolute difference: " +
          Math.abs(newVal).toFixed(2) +
          ".",
      };
    }

    // Core formula: ((new - old) / old) * 100
    const rawChange = ((newVal - original) / original) * 100;
    const absDiff = Math.abs(newVal - original);
    const direction =
      rawChange > 0 ? "Increase" : rawChange < 0 ? "Decrease" : "No change";

    const explanationText =
      "(" +
      newVal.toFixed(2) +
      " − " +
      original.toFixed(2) +
      ") / " +
      original.toFixed(2) +
      " × 100 = " +
      rawChange.toFixed(4) +
      "% → " +
      direction +
      " of " +
      Math.abs(rawChange).toFixed(2) +
      "% (absolute difference: " +
      absDiff.toFixed(2) +
      ")";

    return {
      percent_change: rawChange,
      direction,
      absolute_difference: absDiff,
      result_value: newVal,
      explanation_text: explanationText,
    };
  }

  // ── MODE 2: Apply a known % change to the original value ─────────────────
  if (mode === "apply_change") {
    const pct = Number(i.percent_change_input);

    if (!isFinite(original) || !isFinite(pct)) {
      return {
        percent_change: pct || 0,
        direction: "Invalid input",
        absolute_difference: 0,
        result_value: original || 0,
        explanation_text: "Please enter valid numbers for both fields.",
      };
    }

    // New Value = Original × (1 + pct/100)
    const newVal = original * (1 + pct / 100);
    const absDiff = Math.abs(newVal - original);
    const direction =
      pct > 0 ? "Increase" : pct < 0 ? "Decrease" : "No change";

    const explanationText =
      original.toFixed(2) +
      " × (1 + " +
      pct.toFixed(2) +
      "% / 100) = " +
      original.toFixed(2) +
      " × " +
      (1 + pct / 100).toFixed(4) +
      " = " +
      newVal.toFixed(2) +
      " (" +
      direction +
      " of " +
      Math.abs(pct).toFixed(2) +
      "%, difference: " +
      absDiff.toFixed(2) +
      ")";

    return {
      percent_change: pct,
      direction,
      absolute_difference: absDiff,
      result_value: newVal,
      explanation_text: explanationText,
    };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return {
    percent_change: 0,
    direction: "Unknown mode",
    absolute_difference: 0,
    result_value: 0,
    explanation_text: "Select a valid calculation mode.",
  };
}
