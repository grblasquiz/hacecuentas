/** Calculadora Ley de Coulomb — F = k·q₁·q₂/r² */
export interface Inputs { carga1: number; carga2: number; distancia: number; }
export interface Outputs { fuerza: number; tipo: string; campoElectrico: string; formula: string; }

export function leyCoulombFuerzaElectrica(i: Inputs): Outputs {
  const q1 = Number(i.carga1);
  const q2 = Number(i.carga2);
  const r = Number(i.distancia);
  if (r <= 0) throw new Error('La distancia debe ser mayor a 0');
  if (q1 === 0 || q2 === 0) throw new Error('Las cargas no pueden ser 0');

  const k = 8.9875e9; // N·m²/C²
  const F = k * Math.abs(q1 * q2) / (r * r);
  const tipo = (q1 > 0 && q2 > 0) || (q1 < 0 && q2 < 0) ? 'Repulsiva (cargas del mismo signo)' : 'Atractiva (cargas de signo opuesto)';
  const E = k * Math.abs(q1) / (r * r);

  return {
    fuerza: Number(F.toPrecision(6)),
    tipo,
    campoElectrico: `E = ${E.toPrecision(4)} N/C (campo creado por q₁ en la posición de q₂)`,
    formula: `F = ${k.toExponential(4)} × |${q1} × ${q2}| / ${r}² = ${F.toPrecision(6)} N`,
  };
}
