/** Calculadora de Dilatación Térmica — ΔL = L₀·α·ΔT */
export interface Inputs { longitud: number; coeficiente: number; deltaTemp: number; }
export interface Outputs { deltaL: string; longitudFinal: number; deltaLmm: number; formula: string; _insight?: any; }

export function dilatacionTermicaLongitud(i: Inputs): Outputs {
  const L0 = Number(i.longitud);
  const alpha = Number(i.coeficiente) * 1e-6; // convertir de ×10⁻⁶ a valor real
  const dT = Number(i.deltaTemp);
  if (!L0 || L0 <= 0) throw new Error('La longitud debe ser mayor a 0');

  const dL = L0 * alpha * dT;
  const Lf = L0 + dL;
  const dLmm = dL * 1000;

  const sentido = dL >= 0 ? 'se alarga' : 'se acorta';
  const absMm = Math.abs(dLmm);
  let insightText: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (absMm >= 5) {
    insightText = `Con un ΔT de **${dT} °C**, la pieza ${sentido} **${absMm.toFixed(1)} mm** (de ${L0} m a ${Lf.toFixed(4)} m). Es un movimiento grande: prevé juntas de dilatación o tolerancias para evitar pandeo o tensión.`;
    tone = 'warn';
  } else if (absMm >= 0.5) {
    insightText = `Con un ΔT de **${dT} °C**, la pieza ${sentido} **${absMm.toFixed(2)} mm** (longitud final **${Lf.toFixed(4)} m**). Apreciable en ajustes de precisión.`;
    tone = 'neutral';
  } else {
    insightText = `Con un ΔT de **${dT} °C**, la variación es de apenas **${absMm.toFixed(3)} mm** (final **${Lf.toFixed(4)} m**): prácticamente despreciable en la mayoría de las aplicaciones.`;
    tone = 'good';
  }

  return {
    deltaL: `${dL >= 0 ? '+' : ''}${dL.toFixed(6)} m (${sentido})`,
    longitudFinal: Number(Lf.toFixed(6)),
    deltaLmm: Number(dLmm.toFixed(3)),
    formula: `ΔL = ${L0} × ${(alpha * 1e6).toFixed(1)}×10⁻⁶ × ${dT} = ${dL.toFixed(6)} m`,
    _insight: { title: 'Dilatación térmica', text: insightText, tone, icon: '🌡️' },
  };
}
