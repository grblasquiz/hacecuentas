/** Calculadora Entalpía — ΔH°rxn = ΣΔH°f(prod) - ΣΔH°f(react) */
export interface Inputs { entalpiaProductos: number; entalpiaReactivos: number; }
export interface Outputs { deltaH: number; tipo: string; interpretacion: string; formula: string; }

export function entalpiaReaccionHess(i: Inputs): Outputs {
  const prod = Number(i.entalpiaProductos);
  const react = Number(i.entalpiaReactivos);
  const dH = prod - react;

  const tipo = dH < 0 ? 'Exotérmica (ΔH < 0)' : dH > 0 ? 'Endotérmica (ΔH > 0)' : 'Sin cambio de entalpía';
  const interp = dH < 0
    ? `La reacción libera ${Math.abs(dH).toFixed(1)} kJ de calor al entorno.`
    : dH > 0
    ? `La reacción absorbe ${dH.toFixed(1)} kJ de calor del entorno.`
    : 'No hay intercambio neto de calor.';

  return {
    deltaH: Number(dH.toFixed(2)),
    tipo,
    interpretacion: interp,
    formula: `ΔH° = (${prod}) - (${react}) = ${dH.toFixed(2)} kJ`,
  };
}
