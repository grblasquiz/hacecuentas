export interface Inputs {
  mag1_known: number;
  mag1_unknown: number;
  mag1_relation: string;
  mag2_known: number;
  mag2_unknown: number;
  mag2_relation: string;
  mag3_known: number;
  mag3_unknown: number;
  mag3_relation: string;
  x_known: number;
}

export interface Outputs {
  result: number;
  factor1: number;
  factor2: number;
  factor3: number;
  stepByStep: string;
}

/**
 * Calcula la incógnita X en una regla de tres compuesta de tres magnitudes.
 * Cada magnitud puede tener relación directa o inversa con X.
 *
 * Fórmula:
 *   factor_i = A1/A2  (directa)  o  A2/A1  (inversa)
 *   X = X_ref × factor1 × factor2 × factor3
 */
export function compute(i: Inputs): Outputs {
  const mag1Known = Number(i.mag1_known) || 0;
  const mag1Unknown = Number(i.mag1_unknown) || 0;
  const mag2Known = Number(i.mag2_known) || 0;
  const mag2Unknown = Number(i.mag2_unknown) || 0;
  const mag3Known = Number(i.mag3_known) || 0;
  const mag3Unknown = Number(i.mag3_unknown) || 0;
  const xKnown = Number(i.x_known) || 0;

  const EMPTY_RESULT: Outputs = {
    result: 0,
    factor1: 0,
    factor2: 0,
    factor3: 0,
    stepByStep: "Ingresa valores válidos (distintos de cero) en todos los campos."
  };

  // Validación: ningún valor puede ser cero
  if (
    mag1Known === 0 || mag1Unknown === 0 ||
    mag2Known === 0 || mag2Unknown === 0 ||
    mag3Known === 0 || mag3Unknown === 0 ||
    xKnown === 0
  ) {
    return EMPTY_RESULT;
  }

  /**
   * Calcula el factor de proporción según el tipo de relación.
   * - Directa:  más magnitud → más X  → factor = A1 / A2
   *   (cuando A2 > A1, factor < 1, lo que REDUCE X; pero en directa
   *    queremos que X AUMENTE cuando A2 > A1, por eso factor = A2/A1)
   *   Corrección estándar:
   *     Directa:  factor = A2 / A1
   *     Inversa:  factor = A1 / A2
   */
  function getFactor(known: number, unknown: number, relation: string): number {
    if (relation === "direct") {
      return unknown / known;
    } else {
      // inverse
      return known / unknown;
    }
  }

  const factor1 = getFactor(mag1Known, mag1Unknown, i.mag1_relation);
  const factor2 = getFactor(mag2Known, mag2Unknown, i.mag2_relation);
  const factor3 = getFactor(mag3Known, mag3Unknown, i.mag3_relation);

  const result = xKnown * factor1 * factor2 * factor3;

  // Nombres de relación para el paso a paso
  function relationLabel(rel: string): string {
    return rel === "direct" ? "directa" : "inversa";
  }

  // Generación del paso a paso
  const lines: string[] = [];

  lines.push("=== PASO A PASO ===");
  lines.push("");
  lines.push("Fórmula general:");
  lines.push("  X = X_ref × F₁ × F₂ × F₃");
  lines.push("");
  lines.push("Regla para cada factor:");
  lines.push("  Relación directa  → F = valor_nuevo / valor_conocido");
  lines.push("  Relación inversa  → F = valor_conocido / valor_nuevo");
  lines.push("");

  lines.push(`Magnitud 1 (relación ${relationLabel(i.mag1_relation)}):`)
  if (i.mag1_relation === "direct") {
    lines.push(`  F₁ = ${mag1Unknown} / ${mag1Known} = ${factor1.toFixed(6)}`);
  } else {
    lines.push(`  F₁ = ${mag1Known} / ${mag1Unknown} = ${factor1.toFixed(6)}`);
  }
  lines.push("");

  lines.push(`Magnitud 2 (relación ${relationLabel(i.mag2_relation)}):`)
  if (i.mag2_relation === "direct") {
    lines.push(`  F₂ = ${mag2Unknown} / ${mag2Known} = ${factor2.toFixed(6)}`);
  } else {
    lines.push(`  F₂ = ${mag2Known} / ${mag2Unknown} = ${factor2.toFixed(6)}`);
  }
  lines.push("");

  lines.push(`Magnitud 3 (relación ${relationLabel(i.mag3_relation)}):`)
  if (i.mag3_relation === "direct") {
    lines.push(`  F₃ = ${mag3Unknown} / ${mag3Known} = ${factor3.toFixed(6)}`);
  } else {
    lines.push(`  F₃ = ${mag3Known} / ${mag3Unknown} = ${factor3.toFixed(6)}`);
  }
  lines.push("");

  lines.push("Cálculo final:");
  lines.push(
    `  X = ${xKnown} × ${factor1.toFixed(6)} × ${factor2.toFixed(6)} × ${factor3.toFixed(6)}`
  );
  lines.push(`  X = ${result.toFixed(6)}`);

  const stepByStep = lines.join("\n");

  return {
    result: Math.round(result * 1000000) / 1000000,
    factor1: Math.round(factor1 * 1000000) / 1000000,
    factor2: Math.round(factor2 * 1000000) / 1000000,
    factor3: Math.round(factor3 * 1000000) / 1000000,
    stepByStep
  };
}
