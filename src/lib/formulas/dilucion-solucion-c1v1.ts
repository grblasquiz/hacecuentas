/** Calculadora de Dilución — C₁V₁ = C₂V₂ */
export interface Inputs { c1?: number; v1?: number; c2?: number; v2?: number; }
export interface Outputs { resultado: string; solventeAgregar: number; factorDilucion: string; formula: string; _insight?: any; _chart?: any; }

export function dilucionSolucionC1v1(i: Inputs): Outputs {
  const c1 = i.c1 != null && Number(i.c1) > 0 ? Number(i.c1) : null;
  const v1 = i.v1 != null && Number(i.v1) > 0 ? Number(i.v1) : null;
  const c2 = i.c2 != null && Number(i.c2) > 0 ? Number(i.c2) : null;
  const v2 = i.v2 != null && Number(i.v2) > 0 ? Number(i.v2) : null;
  const filled = [c1, v1, c2, v2].filter(x => x !== null).length;
  if (filled < 3) throw new Error('Ingresá al menos 3 de los 4 valores');

  let C1: number, V1: number, C2: number, V2: number;
  if (c1 === null) { V1 = v1!; C2 = c2!; V2 = v2!; C1 = C2 * V2 / V1; }
  else if (v1 === null) { C1 = c1; C2 = c2!; V2 = v2!; V1 = C2 * V2 / C1; }
  else if (c2 === null) { C1 = c1; V1 = v1; V2 = v2!; C2 = C1 * V1 / V2; }
  else { C1 = c1; V1 = v1; C2 = c2; V2 = C1 * V1 / C2; }

  const solvente = V2 - V1;
  const factor = V2 / V1;

  let insightText: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (solvente > 0) {
    insightText = `Tomá **${V1.toFixed(2)} mL** de la solución madre (**${C1.toFixed(4)} M**) y agregá **${solvente.toFixed(2)} mL** de solvente hasta **${V2.toFixed(2)} mL**: obtenés **${C2.toFixed(4)} M** (dilución **${factor.toFixed(1)}×**).`;
    tone = 'neutral';
  } else {
    insightText = `El volumen final (**${V2.toFixed(2)} mL**) es menor al inicial (**${V1.toFixed(2)} mL**): esto implica **concentrar**, no diluir. Revisá que C₂ < C₁ para una dilución real.`;
    tone = 'warn';
  }

  const out: Outputs = {
    resultado: `C₁=${C1.toFixed(4)} M, V₁=${V1.toFixed(2)} mL → C₂=${C2.toFixed(4)} M, V₂=${V2.toFixed(2)} mL`,
    solventeAgregar: Number(solvente.toFixed(2)),
    factorDilucion: `1:${factor.toFixed(1)} (factor ${factor.toFixed(1)}×)`,
    formula: `${C1.toFixed(4)} × ${V1.toFixed(2)} = ${C2.toFixed(4)} × ${V2.toFixed(2)}`,
    _insight: { title: 'Cómo preparar la dilución', text: insightText, tone, icon: '🧫' },
  };

  if (solvente > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Solución madre (V₁)', value: Number(V1.toFixed(2)) },
        { label: 'Solvente a agregar', value: Number(solvente.toFixed(2)) },
      ],
      prefix: '',
      centerValue: `${V2.toFixed(2)} mL`,
      centerLabel: 'Volumen final',
      ariaLabel: `Volumen final de ${V2.toFixed(2)} mL: ${V1.toFixed(2)} mL de solución madre más ${solvente.toFixed(2)} mL de solvente`,
    };
  }

  return out;
}
