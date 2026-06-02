/** Calculadora Entalpía — ΔH°rxn = ΣΔH°f(prod) - ΣΔH°f(react) */
export interface Inputs { entalpiaProductos: number; entalpiaReactivos: number; }
export interface Outputs { deltaH: number; tipo: string; interpretacion: string; formula: string; _insight?: any; }

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

  const _insight = {
    title: 'Tipo de reacción',
    text: dH < 0
      ? `Con **ΔH° = ${dH.toFixed(2)} kJ** la reacción es **exotérmica**: libera **${Math.abs(dH).toFixed(1)} kJ** de calor al entorno.`
      : dH > 0
      ? `Con **ΔH° = +${dH.toFixed(2)} kJ** la reacción es **endotérmica**: absorbe **${dH.toFixed(1)} kJ** de calor del entorno.`
      : `Con **ΔH° = 0 kJ** no hay intercambio neto de calor: la reacción es **termoneutra**.`,
    tone: dH < 0 ? 'good' : 'neutral',
    icon: dH < 0 ? '🔥' : dH > 0 ? '❄️' : '⚖️',
  };

  return {
    deltaH: Number(dH.toFixed(2)),
    tipo,
    interpretacion: interp,
    formula: `ΔH° = (${prod}) - (${react}) = ${dH.toFixed(2)} kJ`,
    _insight,
  };
}
