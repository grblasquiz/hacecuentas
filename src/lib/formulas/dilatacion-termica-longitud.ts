/** Calculadora de Dilatación Térmica — ΔL = L₀·α·ΔT */
export interface Inputs { longitud: number; coeficiente: number; deltaTemp: number; }
export interface Outputs { deltaL: string; longitudFinal: number; deltaLmm: number; formula: string; }

export function dilatacionTermicaLongitud(i: Inputs): Outputs {
  const L0 = Number(i.longitud);
  const alpha = Number(i.coeficiente) * 1e-6; // convertir de ×10⁻⁶ a valor real
  const dT = Number(i.deltaTemp);
  if (!L0 || L0 <= 0) throw new Error('La longitud debe ser mayor a 0');

  const dL = L0 * alpha * dT;
  const Lf = L0 + dL;
  const dLmm = dL * 1000;

  return {
    deltaL: `${dL >= 0 ? '+' : ''}${dL.toFixed(6)} m (${dL >= 0 ? 'se alarga' : 'se acorta'})`,
    longitudFinal: Number(Lf.toFixed(6)),
    deltaLmm: Number(dLmm.toFixed(3)),
    formula: `ΔL = ${L0} × ${(alpha * 1e6).toFixed(1)}×10⁻⁶ × ${dT} = ${dL.toFixed(6)} m`,
  };
}
