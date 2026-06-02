export interface Inputs {
  initial_value: number;
  final_value: number;
}

export interface Outputs {
  percent_change: number;
  absolute_difference: number;
  change_type: string;
  explanation_text: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const initialValue = Number(i.initial_value);
  const finalValue = Number(i.final_value);

  // Validación: valor inicial no puede ser cero (división por cero)
  if (isNaN(initialValue) || isNaN(finalValue)) {
    return {
      percent_change: 0,
      absolute_difference: 0,
      change_type: "Datos inválidos",
      explanation_text: "Ingresa valores numéricos válidos en ambos campos."
    };
  }

  if (initialValue === 0) {
    return {
      percent_change: 0,
      absolute_difference: finalValue,
      change_type: "No calculable",
      explanation_text:
        "El valor inicial es cero: no es posible calcular un porcentaje de cambio (división por cero). La diferencia absoluta es " +
        finalValue.toFixed(2) + "."
    };
  }

  // Fórmula principal: ((final - inicial) / inicial) * 100
  const absoluteDifference = finalValue - initialValue;
  const percentChange = (absoluteDifference / initialValue) * 100;

  let changeType: string;
  let explanationText: string;

  if (percentChange > 0) {
    changeType = "Aumento";
    explanationText =
      "El valor aumentó un " +
      percentChange.toFixed(2) +
      "% (de " +
      initialValue.toFixed(2) +
      " a " +
      finalValue.toFixed(2) +
      "). La diferencia absoluta es +" +
      absoluteDifference.toFixed(2) +
      ".";
  } else if (percentChange < 0) {
    changeType = "Disminución";
    explanationText =
      "El valor disminuyó un " +
      Math.abs(percentChange).toFixed(2) +
      "% (de " +
      initialValue.toFixed(2) +
      " a " +
      finalValue.toFixed(2) +
      "). La diferencia absoluta es " +
      absoluteDifference.toFixed(2) +
      ".";
  } else {
    changeType = "Sin cambio";
    explanationText =
      "El valor inicial y el final son iguales (" +
      initialValue.toFixed(2) +
      "). No hubo variación: el cambio porcentual es 0%.";
  }

  const pctAbs = Math.abs(percentChange);
  const signo = percentChange > 0 ? '+' : percentChange < 0 ? '−' : '';
  const tono = percentChange > 0 ? 'good' : percentChange < 0 ? 'warn' : 'neutral';
  const verbo = percentChange > 0 ? 'subió' : percentChange < 0 ? 'bajó' : 'no varió';
  const _insight = {
    title: 'Variación porcentual',
    text: percentChange === 0
      ? `El valor **no varió**: pasó de **${initialValue.toFixed(2)}** a **${finalValue.toFixed(2)}**, un **0%** de cambio.`
      : `El valor ${verbo} un **${signo}${pctAbs.toFixed(2)}%** (de **${initialValue.toFixed(2)}** a **${finalValue.toFixed(2)}**), una diferencia de **${signo}${Math.abs(absoluteDifference).toFixed(2)}**.`,
    tone: tono,
    icon: percentChange > 0 ? '📈' : percentChange < 0 ? '📉' : '➖',
  };

  return {
    percent_change: Math.round(percentChange * 10000) / 10000,
    absolute_difference: Math.round(absoluteDifference * 10000) / 10000,
    change_type: changeType,
    explanation_text: explanationText,
    _insight
  };
}
